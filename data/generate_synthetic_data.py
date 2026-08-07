"""
Generates a synthetic labeled dataset that mimics the structure of real
diabetes-forum journal entries, so the full pipeline (baseline -> transformer ->
explainability -> API) can be run and demoed without needing Reddit API access
or a pre-labeled corpus.

IMPORTANT: this is for pipeline demonstration only. For a real portfolio-grade
result, replace this with scripts/collect_reddit_data.py + hand labeling per
data/labeling_rubric.md.
"""
import random
import csv
import os

random.seed(42)

LABELS = [
    "management_overwhelm",
    "guilt_shame",
    "fear_complications",
    "social_isolation",
    "hopelessness",
]

TEMPLATES = {
    "management_overwhelm": [
        "I'm so tired of counting every single carb, every single day.",
        "Between the pump alarms and the finger pricks I can't keep up anymore.",
        "Some days the sheer amount of decisions this disease demands wears me down completely.",
        "I forgot to bolus again and now I'm scrambling to fix it before work.",
        "Juggling work, kids, and diabetes management is just too much some weeks.",
        "I feel like I have a second full-time job just managing my blood sugar.",
    ],
    "guilt_shame": [
        "I saw a 280 on my CGM and just felt like a complete failure.",
        "My A1C went up and I feel so ashamed to tell my doctor.",
        "I ate the cake at the party and now I feel guilty about it all night.",
        "Every high number feels like proof that I'm bad at this.",
        "I hid my pump from my coworkers today, I don't know why I feel embarrassed.",
    ],
    "fear_complications": [
        "I lie awake some nights terrified about what my kidneys will look like in ten years.",
        "The neuropathy tingling in my feet freaks me out more than I let on.",
        "I saw my grandmother lose her eyesight to this and I can't stop thinking it'll happen to me.",
        "Every eye appointment I go into expecting bad news.",
        "I'm scared of what fifty years of this disease will do to my heart.",
    ],
    "social_isolation": [
        "None of my friends really get what a low feels like, so I stopped explaining it.",
        "I feel so alone managing this, like nobody else understands the mental load.",
        "My family thinks I'm just being dramatic when I need to stop and treat a low.",
        "I don't bring it up anymore because people just don't get it.",
        "Sometimes it feels like I'm the only one dealing with this in my whole social circle.",
    ],
    "hopelessness": [
        "Honestly what's the point of trying so hard when my numbers are all over the place anyway.",
        "I've stopped logging my food, nothing I do seems to change anything.",
        "Some days I just want to throw the whole pump away and not deal with any of it.",
        "I don't know why I bother with tight control anymore, it never seems to matter.",
        "It feels like no matter what I do this disease is going to win eventually.",
    ],
    "none": [
        "Changed my infusion site today, no issues so far.",
        "Tried a new low-carb recipe tonight, turned out pretty good.",
        "My CGM sensor came in the mail, switching it out tomorrow morning.",
        "Went for a run before breakfast and my numbers stayed nice and flat.",
        "Refilled my prescription at the pharmacy, all set for the month.",
        "Basal rates seem dialed in well this week, nothing to report.",
        "Ha, my pancreas really said 'not today' but whatever, adjusted my dose and moved on.",
        "Told a joke about my sensor falling off in the shower again lol, third time this month.",
    ],
}


def generate_row(idx):
    # Decide how many distress labels this entry gets (mostly 0-2, occasionally 3)
    r = random.random()
    if r < 0.35:
        n_labels = 0
    elif r < 0.70:
        n_labels = 1
    elif r < 0.92:
        n_labels = 2
    else:
        n_labels = 3

    if n_labels == 0:
        text = random.choice(TEMPLATES["none"])
        chosen = []
    else:
        chosen = random.sample(LABELS, k=min(n_labels, len(LABELS)))
        sentences = [random.choice(TEMPLATES[l]) for l in chosen]
        random.shuffle(sentences)
        text = " ".join(sentences)

    row = {"id": idx, "text": text}
    for l in LABELS:
        row[l] = 1 if l in chosen else 0
    row["none"] = 1 if not chosen else 0
    return row


def main():
    n_rows = 400
    rows = [generate_row(i) for i in range(n_rows)]

    out_path = os.path.join(os.path.dirname(__file__), "sample_labeled_data.csv")
    fieldnames = ["id", "text"] + LABELS + ["none"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {n_rows} synthetic labeled rows to {out_path}")


if __name__ == "__main__":
    main()
