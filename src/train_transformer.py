"""
Fine-tunes DistilBERT for multi-label diabetes-distress classification.

This version trains on the real weakly labeled forum data plus the synthetic
sample set, which gives the transformer more signal than the synthetic-only
version.

Needs internet access to pull pretrained weights the first time (this sandbox is
network-restricted, so run this locally or on Colab). A free Colab T4 GPU handles
this fine at this dataset size in a few minutes; CPU works too, just slower.

Usage:
    python src/train_transformer.py
"""
import os
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, classification_report
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)

LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
          "social_isolation", "hopelessness"]
MODEL_NAME = "distilbert-base-uncased"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
WEAK_DATA = os.path.join(DATA_DIR, "weakly_labeled_posts.csv")
SYNTH_DATA = os.path.join(DATA_DIR, "sample_labeled_data.csv")
MIN_POSITIVES = 20
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "distilbert-diamind")


class DistressDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.encodings = tokenizer(
            list(texts), truncation=True, padding=True, max_length=max_length
        )
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.float)
        return item


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    probs = 1 / (1 + np.exp(-logits))  # sigmoid, since this is multi-label
    preds = (probs > 0.5).astype(int)
    macro_f1 = f1_score(labels, preds, average="macro", zero_division=0)
    micro_f1 = f1_score(labels, preds, average="micro", zero_division=0)
    return {"macro_f1": macro_f1, "micro_f1": micro_f1}


def load_data():
    df_real = pd.read_csv(WEAK_DATA, encoding="utf-8")
    df_real = df_real[df_real["needs_manual_review"] == 0].copy()
    df_real = df_real[["text"] + LABELS].dropna()
    df_real[LABELS] = df_real[LABELS].astype(int)

    print(f"Real data: {len(df_real)} posts (after dropping manual-review flagged)")
    print("Positive counts per label (real data):")
    for label in LABELS:
        print(f"  {label}: {df_real[label].sum()}")

    frames = [df_real]
    if os.path.exists(SYNTH_DATA):
        df_synth = pd.read_csv(SYNTH_DATA, encoding="utf-8")
        df_synth = df_synth[["text"] + LABELS].dropna()
        df_synth[LABELS] = df_synth[LABELS].astype(int)

        sparse_labels = [label for label in LABELS if df_real[label].sum() < MIN_POSITIVES]
        if sparse_labels:
            print(
                f"\nLabels below {MIN_POSITIVES} real positives, supplementing with synthetic: {sparse_labels}"
            )
            supplement_mask = df_synth[sparse_labels].any(axis=1)
            df_supplement = df_synth[supplement_mask].copy()
            frames.append(df_supplement)
            print(f"Added {len(df_supplement)} synthetic rows as supplement")
        else:
            print("\nAll labels have sufficient real data — no synthetic supplement needed.")
    else:
        print("\nNo synthetic data found — run data/generate_synthetic_data.py to create it.")

    df = pd.concat(frames, ignore_index=True)
    print(f"\nFinal training set: {len(df)} rows")
    print("Final positive counts per label:")
    for label in LABELS:
        print(f"  {label}: {df[label].sum()}")

    return df["text"].values, df[LABELS].values.astype(float)


def main():
    X, y = load_data()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(LABELS),
        problem_type="multi_label_classification",
    )

    train_dataset = DistressDataset(X_train, y_train, tokenizer)
    test_dataset = DistressDataset(X_test, y_test, tokenizer)

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=6,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="macro_f1",
        learning_rate=2e-5,
        weight_decay=0.01,
        warmup_ratio=0.1,
        logging_dir=os.path.join(OUTPUT_DIR, "logs"),
        logging_steps=10,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        compute_metrics=compute_metrics,
    )

    trainer.train()
    metrics = trainer.evaluate()
    print("Final eval metrics:", metrics)

    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"Saved fine-tuned model to {OUTPUT_DIR}")

    # Detailed per-class report
    preds_logits = trainer.predict(test_dataset).predictions
    probs = 1 / (1 + np.exp(-preds_logits))
    preds = (probs > 0.5).astype(int)
    print("\nPer-class report:")
    print(classification_report(y_test, preds, target_names=LABELS, zero_division=0))


if __name__ == "__main__":
    main()
