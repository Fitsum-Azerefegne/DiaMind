"""
Baseline model: TF-IDF + One-vs-Rest Logistic Regression, multi-label.

This exists as a benchmark. If the fine-tuned transformer in train_transformer.py
doesn't clearly beat this, that's a real finding worth reporting, not something to
hide -- a large fraction of "AI" text classification tasks are actually won by
simple linear baselines, and knowing that (and testing for it) is itself a signal
of ML maturity.
"""
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import classification_report, f1_score

LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
          "social_isolation", "hopelessness"]

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "weakly_labeled_posts.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def load_data():
    df = pd.read_csv(DATA_PATH)
    X = df["text"].values
    y = df[LABELS].values
    return X, y, df


def train():
    X, y, df = load_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    vectorizer = TfidfVectorizer(
        max_features=5000, ngram_range=(1, 2), stop_words="english", min_df=2
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    clf = OneVsRestClassifier(LogisticRegression(max_iter=1000, class_weight="balanced"))
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)

    print("=" * 60)
    print("BASELINE MODEL: TF-IDF + Logistic Regression (One-vs-Rest)")
    print("=" * 60)
    print(classification_report(y_test, y_pred, target_names=LABELS, zero_division=0))

    macro_f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)
    micro_f1 = f1_score(y_test, y_pred, average="micro", zero_division=0)
    print(f"Macro F1: {macro_f1:.3f}  |  Micro F1: {micro_f1:.3f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
    joblib.dump(clf, os.path.join(MODEL_DIR, "baseline_classifier.joblib"))
    print(f"\nSaved baseline model to {MODEL_DIR}/")

    return clf, vectorizer, macro_f1, micro_f1


def predict(text, clf=None, vectorizer=None):
    if clf is None or vectorizer is None:
        clf = joblib.load(os.path.join(MODEL_DIR, "baseline_classifier.joblib"))
        vectorizer = joblib.load(os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
    vec = vectorizer.transform([text])
    probs = clf.predict_proba(vec)[0]
    return {label: round(float(p), 3) for label, p in zip(LABELS, probs)}


if __name__ == "__main__":
    clf, vectorizer, macro_f1, micro_f1 = train()

    print("\n" + "=" * 60)
    print("SAMPLE PREDICTIONS")
    print("=" * 60)
    examples = [
        "I can't keep up with all of this anymore, it's exhausting.",
        "Changed my infusion site today, no issues.",
        "Ha, my pancreas really quit on me again lol, whatever, fixed it.",
    ]
    for ex in examples:
        print(f"\nText: {ex}")
        print(f"Predicted: {predict(ex, clf, vectorizer)}")
