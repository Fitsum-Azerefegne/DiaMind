"""
DiaMind backend: user accounts + persistent journal entries + distress-language
predictions, all backed by a real SQLite database.

Run with (from the diamind/ root folder):
    uvicorn backend.main:app --reload
"""
import os
import io
import csv
import joblib
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

# Create tables on startup if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DiaMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your real frontend domain before deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

_vectorizer = None
_clf = None


def get_model():
    global _vectorizer, _clf
    if _vectorizer is None:
        _vectorizer = joblib.load(os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
        _clf = joblib.load(os.path.join(MODEL_DIR, "baseline_classifier.joblib"))
    return _vectorizer, _clf


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

    user = models.User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@app.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@app.get("/me")
def me(current_user: models.User = Depends(get_current_user)):
    return {"email": current_user.email}


@app.post("/analyze")
def analyze(
    entry: JournalEntryRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vectorizer, clf = get_model()
    vec = vectorizer.transform([entry.text])
    probs = clf.predict_proba(vec)[0]
    scores = {label: round(float(p), 3) for label, p in zip(LABELS, probs)}

    top_label = max(scores, key=scores.get)
    top_score = scores[top_label]

    POSITIVE_WORDS = ["happy", "great", "good", "well", "proud", "amazing", "wonderful",
                       "excited", "grateful", "thankful", "better", "strong", "confident",
                       "joy", "love", "calm", "peaceful", "hopeful", "fine", "okay", "ok"]
    text_lower = entry.text.lower()
    sounds_positive = any(w in text_lower for w in POSITIVE_WORDS)

    if top_score < 0.4:
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
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"status": "password updated"}


@app.post("/account/delete")
def delete_account(
    payload: DeleteAccountRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.password, current_user.hashed_password):
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
