"""
Evaluation + qualitative error analysis. Run after training either model.

The point of this script isn't the metrics table alone -- it's the error_analysis
section, which prints out specific misclassified examples. Put a few of these
(with your own commentary on WHY they likely failed) directly in your portfolio
writeup. That's the detail that reads as "understands ML," not just "ran a script."
"""
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, multilabel_confusion_matrix

LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
          "social_isolation", "hopelessness"]
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample_labeled_data.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def load_test_split():
    df = pd.read_csv(DATA_PATH)
    X = df["text"].values
    y = df[LABELS].values
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    return X_test, y_test


def evaluate_baseline():
    vectorizer = joblib.load(os.path.join(MODEL_DIR, "baseline_vectorizer.joblib"))
    clf = joblib.load(os.path.join(MODEL_DIR, "baseline_classifier.joblib"))

    X_test, y_test = load_test_split()
    X_vec = vectorizer.transform(X_test)
    y_pred = clf.predict(X_vec)

    print("Classification report:")
    print(classification_report(y_test, y_pred, target_names=LABELS, zero_division=0))

    print("\nConfusion matrices per label (rows=true, cols=pred: [[TN,FP],[FN,TP]]):")
    cms = multilabel_confusion_matrix(y_test, y_pred)
    for label, cm in zip(LABELS, cms):
        print(f"  {label}: {cm.tolist()}")

    print("\n--- Error analysis: misclassified examples ---")
    n_shown = 0
    for i, text in enumerate(X_test):
        if not (y_test[i] == y_pred[i]).all():
            true_labels = [l for l, v in zip(LABELS, y_test[i]) if v]
            pred_labels = [l for l, v in zip(LABELS, y_pred[i]) if v]
            print(f"\nText: {text}")
            print(f"  True: {true_labels or ['none']}")
            print(f"  Pred: {pred_labels or ['none']}")
            n_shown += 1
        if n_shown >= 10:
            break

    if n_shown == 0:
        print("(No misclassifications on this test split -- expected on synthetic")
        print(" template data. Real forum data will surface genuine error cases;")
        print(" re-run this after training on real labeled data.)")


if __name__ == "__main__":
    evaluate_baseline()
