# Labeling Rubric: Diabetes Distress Language

This rubric defines the label categories used to annotate journal/forum text. It is
loosely grounded in the **structure** of two validated, publicly documented clinical
instruments — the Diabetes Distress Scale (DDS) and the Problem Areas in Diabetes
(PAID) questionnaire — but the categories below are our own operational definitions
for text classification, not a reproduction of either instrument's actual items.
If you want to cite the instruments themselves in your writeup, reference them by
name and point to the original published scales rather than quoting items.

## Multi-label categories

Each entry can receive **zero, one, or multiple** labels. "None" means no distress
language detected (includes neutral logging, factual updates, or coping/humor that
isn't distress).

| Label | What it captures | Example cue (paraphrased, not verbatim from any source) |
|---|---|---|
| `management_overwhelm` | Feeling exhausted or unable to keep up with the daily workload of managing T1D (counting carbs, dosing, monitoring) | "I can't keep doing this every single day" |
| `guilt_shame` | Self-blame or shame tied to blood sugar numbers or perceived management failures | "I feel like a failure every time I see a high number" |
| `fear_complications` | Anxiety centered on long-term complications or future health decline | "I lie awake worrying about what this is doing to my body" |
| `social_isolation` | Feeling misunderstood, alone, or disconnected from others because of the condition | "No one around me actually gets what this is like" |
| `hopelessness` | Expressions of giving up, futility, or "why bother" framing about management | "Nothing I do seems to make a difference anymore" |
| `none` | No distress language; neutral, factual, or humor/coping language | "Switched infusion sites today, no issues" |

## Labeling process

1. **Seed set (hand-labeled, ~500 posts)**: Two labelers independently label each
   post against the table above; disagreements are discussed and resolved. This
   gives you an inter-annotator agreement number worth reporting (e.g. Cohen's
   kappa) — a small, genuinely rigorous detail that stands out in a portfolio.
2. **Weak supervision (scale to remaining posts)**: Use heuristic labeling functions
   (see `scripts/weak_supervision_labeling.py`) — regex/keyword patterns, and
   optionally an LLM-assisted pass — to propose labels for the rest of the corpus.
   Weak labels are *never* treated as ground truth on their own; they're combined
   (majority vote / Snorkel label model) and spot-checked.
3. **Known confound — dark humor / coping language**: T1D community text often uses
   self-deprecating jokes about their pancreas/condition as a coping mechanism, not
   as genuine distress. Flag humor markers ("lol", "lmao", exaggerated hyperbole)
   during labeling and treat them as a *separate* judgment call, not an automatic
   distress or non-distress label — document how you handled this explicitly.

## Splits

- 70% train / 15% validation / 15% test, stratified by label to preserve the
  (likely imbalanced) class distribution across splits.
