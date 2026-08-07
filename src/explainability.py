"""
Explainability: uses SHAP to show which words/phrases drove a prediction, for both
the baseline model and the fine-tuned transformer. This is the piece that turns
"a model says you're distressed" into "here's specifically why," which matters a
lot for something touching on someone's emotional state -- an unexplained score is
much easier to distrust or dismiss than one with visible reasoning.

Usage:
    python src/explainability.py
"""
import os
import joblib
import shap
import numpy as np

LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
          "social_isolation", "hopelessness"]
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def explain_baseline(texts):
    """SHAP explanation for the TF-IDF + LogisticRegression baseline."""
    vectorizer = joblib.load(os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
    clf = joblib.load(os.path.join(MODEL_DIR, "baseline_classifier.joblib"))

    def predict_fn(text_list):
        vecs = vectorizer.transform(text_list)
        return clf.predict_proba(vecs)

    masker = shap.maskers.Text(tokenizer=r"\W+")
    explainer = shap.Explainer(predict_fn, masker, output_names=LABELS)
    shap_values = explainer(texts)
    return shap_values


def top_tokens_for_label(shap_values, example_idx, label_idx, top_k=5):
    """Return the top contributing tokens for one example/label pair."""
    values = shap_values.values[example_idx][:, label_idx]
    tokens = shap_values.data[example_idx]
    pairs = sorted(zip(tokens, values), key=lambda x: -abs(x[1]))
    return pairs[:top_k]


def main():
    examples = [
        "I can't keep up with all of this anymore, it's exhausting and I feel like a failure.",
        "Changed my infusion site today, no issues at all.",
        "No one around me really understands what a bad low feels like, I feel so alone in this.",
    ]

    print("Running SHAP explainability on baseline model...\n")
    shap_values = explain_baseline(examples)

    for i, text in enumerate(examples):
        print("=" * 70)
        print(f"Text: {text}")
        # Find the label with the highest max prediction for this example
        label_scores = shap_values.values[i].sum(axis=0)
        top_label_idx = int(np.argmax(np.abs(label_scores)))
        print(f"Most influenced label: {LABELS[top_label_idx]}")
        top_tokens = top_tokens_for_label(shap_values, i, top_label_idx)
        print("Top contributing tokens (token, contribution):")
        for token, val in top_tokens:
            print(f"  {token!r}: {val:+.4f}")
        print()

    print("Tip: in the app UI, render these as highlighted words in the journal")
    print("entry itself (color intensity = |contribution|) rather than a raw table.")


if __name__ == "__main__":
    main()
