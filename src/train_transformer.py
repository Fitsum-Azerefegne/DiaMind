"""
Fine-tunes DistilBERT for multi-label diabetes-distress classification.

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
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample_labeled_data.csv")
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


def main():
    df = pd.read_csv(DATA_PATH)
    X = df["text"].values
    y = df[LABELS].values.astype(float)

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
