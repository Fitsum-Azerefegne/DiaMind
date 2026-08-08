"""
Baseline model: TF-IDF + One-vs-Rest Logistic Regression, multi-label.

Trains on a combination of:
  1. Real weakly-labeled forum posts (data/weakly_labeled_posts.csv)
  2. Synthetic labeled data (data/sample_labeled_data.csv) as a supplement
     for underrepresented labels

The real data is prioritised; synthetic data fills gaps where real positive
examples are too sparse to train on reliably.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import classification_report, f1_score

LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
          "social_isolation", "hopelessness"]

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

WEAK_DATA = os.path.join(DATA_DIR, "weakly_labeled_posts.csv")
SYNTH_DATA = os.path.join(DATA_DIR, "sample_labeled_data.csv")

# Minimum real positive examples per label before we supplement with synthetic
MIN_POSITIVES = 20


def load_data():
    # --- Real weakly-labeled forum posts ---
    df_real = pd.read_csv(WEAK_DATA, encoding="utf-8")
    # Drop posts flagged for manual review (humor + distress overlap — unreliable)
    df_real = df_real[df_real["needs_manual_review"] == 0].copy()
    df_real = df_real[["text"] + LABELS].dropna()
    df_real[LABELS] = df_real[LABELS].astype(int)
    df_real["source"] = "real"

    print(f"Real data: {len(df_real)} posts (after dropping manual-review flagged)")
    print("Positive counts per label (real data):")
    for l in LABELS:
        print(f"  {l}: {df_real[l].sum()}")

    # --- Synthetic data: only use for labels that are too sparse in real data ---
    frames = [df_real]
    if os.path.exists(SYNTH_DATA):
        df_synth = pd.read_csv(SYNTH_DATA, encoding="utf-8")
        df_synth = df_synth[["text"] + LABELS].dropna()
        df_synth[LABELS] = df_synth[LABELS].astype(int)
        df_synth["source"] = "synthetic"

        sparse_labels = [l for l in LABELS if df_real[l].sum() < MIN_POSITIVES]
        if sparse_labels:
            print(f"\nLabels below {MIN_POSITIVES} real positives, supplementing with synthetic: {sparse_labels}")
            # Only add synthetic rows that have at least one sparse label positive
            mask = df_synth[sparse_labels].any(axis=1)
            df_supplement = df_synth[mask].copy()
            frames.append(df_supplement)
            print(f"Added {len(df_supplement)} synthetic rows as supplement")
        else:
            print("\nAll labels have sufficient real data — no synthetic supplement needed.")
    else:
        print("\nNo synthetic data found — run data/generate_synthetic_data.py to create it.")

    df = pd.concat(frames, ignore_index=True)
    print(f"\nFinal training set: {len(df)} rows")
    print("Final positive counts per label:")
    for l in LABELS:
        print(f"  {l}: {df[l].sum()}")

    import numpy as np
    return np.array(df["text"].tolist()), df[LABELS].values.astype(int), df


def train():
    X, y, df = load_data()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    vectorizer = TfidfVectorizer(
        max_features=8000, ngram_range=(1, 2), stop_words="english", min_df=2,
        sublinear_tf=True,  # dampens very frequent terms
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # class_weight="balanced" handles the heavy class imbalance (most posts are "none")
    clf = OneVsRestClassifier(
        LogisticRegression(max_iter=1000, class_weight="balanced", C=1.0)
    )
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)

    print("\n" + "=" * 60)
    print("RESULTS: TF-IDF + Logistic Regression (One-vs-Rest)")
    print("=" * 60)
    print(classification_report(y_test, y_pred, target_names=LABELS, zero_division=0))

    macro_f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)
    micro_f1 = f1_score(y_test, y_pred, average="micro", zero_division=0)
    print(f"Macro F1: {macro_f1:.3f}  |  Micro F1: {micro_f1:.3f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
    joblib.dump(clf, os.path.join(MODEL_DIR, "baseline_classifier.joblib"))
    print(f"\nSaved model to {MODEL_DIR}/")

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
    print("SAMPLE PREDICTIONS ON REAL T1D LANGUAGE")
    print("=" * 60)
    examples = [
        "I'm so tired of counting every single carb, it never stops.",
        "I saw a 280 on my CGM and just felt like a complete failure.",
        "I lie awake terrified about what this is doing to my kidneys.",
        "None of my friends get what a low feels like, I stopped explaining.",
        "What's the point of trying so hard when nothing I do seems to matter.",
        "Changed my infusion site today, no issues.",
        "I was so happy today, numbers were great and I felt really good!",
        "Ha, my pancreas really quit on me again lol, whatever, adjusted and moved on.",
    ]
    for ex in examples:
        result = predict(ex, clf, vectorizer)
        top = max(result, key=result.get)
        print(f"\nText: {ex}")
        print(f"Top signal: {top} ({result[top]:.2f})")
        print(f"All: {result}")
