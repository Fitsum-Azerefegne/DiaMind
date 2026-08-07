"""
FastAPI backend serving distress-language predictions to the frontend.

Run with:
    uvicorn backend.main:app --reload

Note: journal entries are stored in-memory here for demo purposes. Swap in a real
database (SQLite/Postgres) before this becomes anything other than a local demo --
this data is sensitive and needs proper storage, not a Python list.
"""
import os
import joblib
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
          "social_isolation", "hopelessness"]

LABEL_DESCRIPTIONS = {
    "management_overwhelm": "language patterns associated with feeling overwhelmed by daily management",
    "guilt_shame": "language patterns associated with guilt or shame around numbers/management",
    "fear_complications": "language patterns associated with anxiety about long-term complications",
    "social_isolation": "language patterns associated with feeling misunderstood or alone",
    "hopelessness": "language patterns associated with futility or giving up",
}

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

app = FastAPI(title="DiaMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before any real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store: {entry_id: {...}}. Replace with a real DB for anything beyond a demo.
ENTRIES = []
_vectorizer = None
_clf = None


def get_model():
    global _vectorizer, _clf
    if _vectorizer is None:
        _vectorizer = joblib.load(os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
        _clf = joblib.load(os.path.join(MODEL_DIR, "baseline_classifier.joblib"))
    return _vectorizer, _clf


class JournalEntry(BaseModel):
    text: str


class PredictionResponse(BaseModel):
    scores: dict
    top_label: str | None
    context_message: str
    timestamp: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=PredictionResponse)
def analyze(entry: JournalEntry):
    vectorizer, clf = get_model()
    vec = vectorizer.transform([entry.text])
    probs = clf.predict_proba(vec)[0]
    scores = {label: round(float(p), 3) for label, p in zip(LABELS, probs)}

    top_label = max(scores, key=scores.get)
    top_score = scores[top_label]

    if top_score < 0.4:
        context_message = "This entry doesn't show strong distress-language patterns."
    else:
        context_message = (
            f"This entry shows {LABEL_DESCRIPTIONS[top_label]}. "
            "This reflects language patterns, not a diagnosis -- if this feels "
            "persistent, consider mentioning it to your care team."
        )

    record = {
        "text": entry.text,
        "scores": scores,
        "top_label": top_label if top_score >= 0.4 else None,
        "timestamp": datetime.utcnow().isoformat(),
    }
    ENTRIES.append(record)

    return PredictionResponse(
        scores=scores,
        top_label=record["top_label"],
        context_message=context_message,
        timestamp=record["timestamp"],
    )


@app.get("/trend")
def trend():
    """Returns the distress-score trend across all stored entries, for charting."""
    return {
        "entries": [
            {"timestamp": e["timestamp"], "scores": e["scores"]}
            for e in ENTRIES
        ]
    }
