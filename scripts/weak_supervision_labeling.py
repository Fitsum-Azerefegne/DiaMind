"""
Weak supervision: heuristic labeling functions that propose labels for unlabeled
posts, following the categories in data/labeling_rubric.md. These heuristics are
intentionally noisy and imperfect — the point is to combine several weak signals
(majority vote here; swap in Snorkel's LabelModel for something more principled)
to bootstrap labels across a large corpus, which you then spot-check by hand.

Run this on data/raw_forum_posts.csv (from collect_forum_data.py) to produce
data/weakly_labeled_posts.csv. ALWAYS hand-review a sample before trusting this
as training data — say so explicitly in your writeup.
"""
import re
import csv
import os

LABEL_PATTERNS = {
    "management_overwhelm": [
        r"\bcan'?t keep up\b", r"\bso tired of\b", r"\bexhaust(ed|ing)\b",
        r"\btoo much\b.*\b(manag|track|count)", r"\bsecond (full-?time )?job\b",
    ],
    "guilt_shame": [
        r"\bfailure\b", r"\bashamed\b", r"\bguilt(y)?\b", r"\bbad (diabetic|at this)\b",
        r"\bembarrass(ed|ing)\b",
    ],
    "fear_complications": [
        r"\bscared\b.*\b(complication|kidney|eye|heart|neuropath|amputat)",
        r"\bterrified\b", r"\blie awake\b", r"\bworried?\b.*\b(future|years|complication)",
    ],
    "social_isolation": [
        r"\bno(body| one) (gets|understands)\b", r"\balone\b", r"\bisolat",
        r"\bnobody else\b",
    ],
    "hopelessness": [
        r"\bwhat'?s the point\b", r"\bnothing (I do )?(seems to )?(matter|change)\b",
        r"\bgive up\b", r"\bwon'?t (get better|change)\b",
    ],
    "humor_marker": [  # not a distress label itself — used to downweight sarcasm
        r"\blol\b", r"\blmao\b", r"\bhaha\b", r"\bjk\b",
    ],
}

COMPILED = {k: [re.compile(p, re.IGNORECASE) for p in v] for k, v in LABEL_PATTERNS.items()}


def weak_label(text):
    labels = {}
    for label, patterns in COMPILED.items():
        if label == "humor_marker":
            continue
        labels[label] = int(any(p.search(text) for p in patterns))

    has_humor = any(p.search(text) for p in COMPILED["humor_marker"])
    n_positive = sum(labels.values())
    needs_review = has_humor and n_positive >= 1

    labels["none"] = int(n_positive == 0)
    labels["needs_manual_review"] = int(needs_review)
    return labels


def main():
    forum_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw_forum_posts.csv")
    reddit_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw_posts.csv")
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "weakly_labeled_posts.csv")

    if os.path.exists(forum_path):
        in_path = forum_path
    elif os.path.exists(reddit_path):
        in_path = reddit_path
    else:
        print("No raw data found. Run collect_forum_data.py (recommended) first.")
        return

    rows = []
    with open(in_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            text = r["text"]
            labels = weak_label(text)
            rows.append({"id": r["id"], "text": text, **labels})

    label_cols = ["management_overwhelm", "guilt_shame", "fear_complications",
                  "social_isolation", "hopelessness", "none", "needs_manual_review"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "text"] + label_cols)
        writer.writeheader()
        writer.writerows(rows)

    n_review = sum(r["needs_manual_review"] for r in rows)
    print(f"Weakly labeled {len(rows)} posts -> {out_path}")
    print(f"{n_review} posts flagged for manual review (humor + distress signal overlap).")


if __name__ == "__main__":
    main()