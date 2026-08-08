"""
DiaMind backend: user accounts + persistent journal entries + distress-language
predictions, all backed by a real SQLite database.

Run with (from the diamind/ root folder):
    uvicorn backend.main:app --reload
"""
import os
import io
import csv
import secrets
import joblib
import numpy as np
import torch
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from backend.database import Base, engine, get_db
from backend import models
from backend.facts import FACTS
from backend.auth import (
    hash_password, verify_password, create_access_token, decode_access_token
)

LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
          "social_isolation", "hopelessness"]

LABEL_DESCRIPTIONS = {
    "management_overwhelm": "feeling overwhelmed by daily management",
    "guilt_shame": "guilt or shame around numbers or management",
    "fear_complications": "anxiety about long-term complications",
    "social_isolation": "feeling misunderstood or alone",
    "hopelessness": "futility or giving up",
}

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
TRANSFORMER_MODEL_DIR = os.path.join(MODEL_DIR, "distilbert-diamind")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

# Create tables on startup if they don't already exist
Base.metadata.create_all(bind=engine)


def ensure_user_schema():
    with engine.begin() as connection:
        columns = [row[1] for row in connection.exec_driver_sql("PRAGMA table_info(users)")]
        if "auth_provider" not in columns:
            connection.exec_driver_sql(
                "ALTER TABLE users ADD COLUMN auth_provider VARCHAR NOT NULL DEFAULT 'password'"
            )


ensure_user_schema()

app = FastAPI(title="DiaMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

_vectorizer = None
_clf = None
_tokenizer = None
_transformer_model = None


def get_model():
    global _vectorizer, _clf, _tokenizer, _transformer_model

    if os.path.isdir(TRANSFORMER_MODEL_DIR):
        if _tokenizer is None or _transformer_model is None:
            try:
                _tokenizer = AutoTokenizer.from_pretrained(TRANSFORMER_MODEL_DIR)
                _transformer_model = AutoModelForSequenceClassification.from_pretrained(TRANSFORMER_MODEL_DIR)
                _transformer_model.eval()
            except Exception:
                _tokenizer = None
                _transformer_model = None
        if _tokenizer is not None and _transformer_model is not None:
            return "transformer", _tokenizer, _transformer_model

    if _vectorizer is None or _clf is None:
        _vectorizer = joblib.load(os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
        _clf = joblib.load(os.path.join(MODEL_DIR, "baseline_classifier.joblib"))
    return "baseline", _vectorizer, _clf


def score_text(text: str):
    model_kind, first, second = get_model()

    if model_kind == "transformer":
        tokenizer = first
        model = second
        inputs = tokenizer(
            [text],
            truncation=True,
            padding=True,
            max_length=128,
            return_tensors="pt",
        )
        with torch.no_grad():
            logits = model(**inputs).logits[0].detach().cpu().numpy()
        probs = 1 / (1 + np.exp(-logits))
    else:
        vectorizer = first
        clf = second
        vec = vectorizer.transform([text])
        probs = clf.predict_proba(vec)[0]

    return {label: round(float(p), 3) for label, p in zip(LABELS, probs)}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise credentials_error
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_error
    user = db.query(models.User).filter(models.User.email == payload["sub"]).first()
    if user is None:
        raise credentials_error
    return user


# ---------- Request/response schemas ----------

class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str


class JournalEntryRequest(BaseModel):
    text: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Routes ----------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/facts/today")
def fact_of_the_day():
    """Returns a fact of the day, cycling deterministically through FACTS by
    day-of-year -- everyone sees the same fact on the same calendar day, and
    it repeats predictably once the list is exhausted rather than erroring."""
    day_of_year = datetime.utcnow().timetuple().tm_yday
    index = (day_of_year - 1) % len(FACTS)
    fact = FACTS[index]
    return {"day_of_year": day_of_year, "category": fact["category"], "text": fact["text"]}


@app.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with that email already exists.")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user = models.User(email=payload.email, hashed_password=hash_password(payload.password), auth_provider="password")
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@app.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if user.auth_provider == "google":
        raise HTTPException(status_code=401, detail="This account uses Google sign-in. Continue with Google.")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@app.post("/google-login", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google sign-in is not configured on the server.")

    try:
        info = google_id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified.")

    if not info.get("email") or not info.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google account email is not verified.")

    email = info["email"].lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        user = models.User(
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            auth_provider="google",
        )
        db.add(user)
    else:
        user.auth_provider = "google"
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@app.get("/me")
def me(current_user: models.User = Depends(get_current_user)):
    return {"email": current_user.email, "auth_provider": current_user.auth_provider}


@app.post("/analyze")
def analyze(
    entry: JournalEntryRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores = score_text(entry.text)

    top_label = max(scores, key=scores.get)
    top_score = scores[top_label]

    import re
    text_lower = entry.text.lower()

    POSITIVE_PATTERNS = [
        r"\b(feel|feeling|felt)\s+(so\s+)?(good|great|happy|amazing|wonderful|fantastic|proud|grateful|thankful|blessed|positive|hopeful|strong|confident|calm|peaceful|okay|fine|better|well)\b",
        r"\b(i am|i'm|im)\s+(so\s+)?(good|great|happy|amazing|wonderful|fantastic|proud|grateful|thankful|blessed|positive|hopeful|strong|confident|calm|peaceful|okay|fine|better|well)\b",
        r"\b(had a|having a|such a)\s+(good|great|amazing|wonderful|fantastic|brilliant|lovely|nice|positive)\s+(day|week|time|moment)\b",
        r"\b(numbers?|bg|blood sugar|glucose)\s+(was|were|is|are|look|looks)\s+(good|great|amazing|perfect|spot on|on point|stable|flat|nice)\b",
        r"\b(so\s+)?(happy|excited|grateful|thankful|proud|relieved|pleased|thrilled)\b",
        r"\bthings?\s+(are|is|going)\s+(good|great|well|better|amazing|fine|okay)\b",
        r"\b(doing|going)\s+(really\s+)?(well|good|great|amazing|fine|okay)\b",
        r"\b(love|loved|loving)\s+(today|this|it|life|everything)\b",
        r"\bsmall\s+win\b",
        r"\b(nailed it|crushed it|killed it|on track|in range|in control)\b",
    ]
    sounds_positive = any(re.search(p, text_lower) for p in POSITIVE_PATTERNS)

    # If the entry sounds positive, override the model — don't show distress signals
    # for clearly happy entries even if the model picks up noise words
    DISTRESS_THRESHOLD = 0.55  # raised from 0.4 to reduce false positives
    if sounds_positive and top_score < 0.7:
        context_message = (
            "That's genuinely great to hear 💛 Days like this matter — hold onto that feeling. "
            "Living with T1D takes real strength, and it sounds like you're doing well today."
        )
        stored_top_label = None
    elif top_score < DISTRESS_THRESHOLD:
        if sounds_positive:
            context_message = (
                "That's genuinely great to hear 💛 Days like this matter — hold onto that feeling. "
                "Living with T1D takes real strength, and it sounds like you're doing well today."
            )
        else:
            context_message = (
                "No strong distress signals today. How are you really feeling? "
                "You can always write more — this is your safe space."
            )
        stored_top_label = None
    else:
        WARM_MESSAGES = {
            "management_overwhelm": (
                "It sounds like the daily grind of managing T1D is weighing on you right now — "
                "and that's completely valid. Counting carbs, adjusting doses, watching numbers... "
                "it never stops. You're not failing; you're carrying a lot. 💙"
            ),
            "guilt_shame": (
                "Please be gentle with yourself. Numbers don't define you, and a bad reading "
                "doesn't mean you did something wrong. T1D is unpredictable — you're doing your best. 💙"
            ),
            "fear_complications": (
                "Worrying about the future with T1D is real and it makes sense. "
                "You're not alone in that fear. Taking it one day at a time is enough. 💙"
            ),
            "social_isolation": (
                "Feeling like no one around you truly gets it is one of the hardest parts of T1D. "
                "But you're not alone — there's a whole community of people who understand exactly what you're going through. 💙"
            ),
            "hopelessness": (
                "It's okay to have days where it all feels pointless. That feeling is valid. "
                "But you showed up today and wrote this — that matters more than you know. "
                "If this feeling sticks around, please reach out to someone on your care team. 💙"
            ),
        }
        context_message = WARM_MESSAGES.get(
            top_label,
            f"This entry shows patterns around {LABEL_DESCRIPTIONS[top_label]}. "
            "If this feels persistent, consider mentioning it to your care team. 💙"
        )
        stored_top_label = top_label

    db_entry = models.JournalEntry(
        user_id=current_user.id,
        text=entry.text,
        scores=scores,
        top_label=stored_top_label,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    return {
        "scores": scores,
        "top_label": stored_top_label,
        "context_message": context_message,
        "timestamp": db_entry.created_at.isoformat(),
    }


@app.get("/trend")
def trend(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == current_user.id)
        .order_by(models.JournalEntry.created_at.asc())
        .all()
    )
    return {
        "entries": [
            {"timestamp": e.created_at.isoformat(), "scores": e.scores, "text": e.text}
            for e in entries
        ]
    }


# ---------- Account settings ----------

@app.post("/account/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.auth_provider == "google":
        if payload.current_password:
            raise HTTPException(status_code=400, detail="Google sign-in accounts do not have a current password. Leave it blank to set one.")
    elif not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    current_user.auth_provider = "password"
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"status": "password updated"}


@app.post("/account/delete")
def delete_account(
    payload: DeleteAccountRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.auth_provider == "google":
        if payload.password:
            raise HTTPException(status_code=400, detail="Google sign-in accounts do not use a password here. Leave it blank to confirm deletion.")
    elif not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Password is incorrect.")

    # Cascade delete is configured on the relationship, so entries go too.
    db.delete(current_user)
    db.commit()
    return {"status": "account deleted"}


# ---------- Export ----------

def _get_user_entries(current_user, db):
    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == current_user.id)
        .order_by(models.JournalEntry.created_at.asc())
        .all()
    )


@app.get("/export/csv")
def export_csv(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = _get_user_entries(current_user, db)

    buffer = io.StringIO()
    fieldnames = ["date", "text", "top_signal"] + LABELS
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for e in entries:
        row = {
            "date": e.created_at.strftime("%Y-%m-%d %H:%M"),
            "text": e.text,
            "top_signal": e.top_label or "none",
        }
        row.update({label: e.scores.get(label, "") for label in LABELS})
        writer.writerow(row)

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=diamind_journal_export.csv"},
    )


@app.get("/export/pdf")
def export_pdf(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = _get_user_entries(current_user, db)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("DiaMindTitle", parent=styles["Title"], fontSize=20)
    disclaimer_style = ParagraphStyle("Disclaimer", parent=styles["Normal"], fontSize=8.5, textColor=colors.grey)
    entry_style = ParagraphStyle("Entry", parent=styles["Normal"], fontSize=9.5, leading=13)

    story = []
    story.append(Paragraph("DiaMind Journal Export", title_style))
    story.append(Paragraph(f"Account: {current_user.email}", styles["Normal"]))
    story.append(Paragraph(f"Exported: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "This export reflects language-pattern signals from journal entries, generated by a "
        "model grounded in validated diabetes distress instruments (DDS/PAID). It is not a "
        "clinical diagnosis. Share with a care team as context, not as a medical result.",
        disclaimer_style,
    ))
    story.append(Spacer(1, 16))

    if not entries:
        story.append(Paragraph("No journal entries yet.", styles["Normal"]))
    else:
        # Summary table: how often each signal appeared as the top signal
        from collections import Counter
        counts = Counter(e.top_label for e in entries if e.top_label)
        summary_data = [["Signal", "Times it was the strongest signal"]]
        for label in LABELS:
            summary_data.append([LABEL_DESCRIPTIONS.get(label, label), str(counts.get(label, 0))])
        summary_table = Table(summary_data, colWidths=[3.5*inch, 2.5*inch])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1B4B43")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTSIZE", (0,0), (-1,-1), 9),
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#D8D2C4")),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#FAF7F2")]),
        ]))
        story.append(Paragraph("Summary", styles["Heading2"]))
        story.append(summary_table)
        story.append(Spacer(1, 18))

        story.append(Paragraph(f"All entries ({len(entries)})", styles["Heading2"]))
        story.append(Spacer(1, 6))
        for e in entries:
            date_str = e.created_at.strftime("%Y-%m-%d %H:%M")
            top = e.top_label.replace("_", " ").title() if e.top_label else "None detected"
            story.append(Paragraph(f"<b>{date_str}</b> — top signal: {top}", entry_style))
            story.append(Paragraph(e.text, entry_style))
            story.append(Spacer(1, 10))

    doc.build(story)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=diamind_journal_export.pdf"},
    )
