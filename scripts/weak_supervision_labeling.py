"""
Improved weak supervision labeling with broader patterns that match
real forum/journal language, not just exact clinical phrases.
"""
import re
import csv
import os

LABEL_PATTERNS = {
    "management_overwhelm": [
        r"\bcan'?t keep up\b",
        r"\bso tired of\b",
        r"\bexhaust(ed|ing)\b",
        r"\bworn? out\b",
        r"\bburnout\b",
        r"\bburn(ing)? out\b",
        r"\btoo much (to|for)\b",
        r"\bsecond (full.?time )?job\b",
        r"\bnever (stops?|ends?)\b",
        r"\b(constant|endless|relentless)\b.{0,40}\b(manag|check|count|monitor|dose|bolus)\b",
        r"\b(manag|check|count|monitor|dose|bolus)\b.{0,40}\b(constant|endless|relentless|every day|all day)\b",
        r"\bso (many|much) (decision|thing|alarm|number)\b",
        r"\b(overwhelm|drowning)\b",
        r"\bcan'?t (do|deal with|handle|cope with) (this|it|everything)\b",
        r"\b(juggl|balanc).{0,40}\bdiabet\b",
        r"\bmental (load|burden|toll)\b",
        r"\bfull.?time job\b",
        r"\bwear(s|ing)? me (down|out)\b",
        r"\bstress(ed|ful|ing)?\b.{0,50}\bdiabet\b",
        r"\bdiabet\b.{0,50}\bstress(ed|ful|ing)?\b",
        r"\bhard (to|keeping) (keep|manag|track)\b",
        r"\bstruggl.{0,30}\b(manag|control|keep up)\b",
    ],
    "guilt_shame": [
        r"\bfailure\b",
        r"\bashamed?\b",
        r"\bguilt(y)?\b",
        r"\bblame (myself|me)\b",
        r"\bmy (fault|bad)\b",
        r"\bembarrass(ed|ing|ment)\b",
        r"\bbad (diabetic|at (this|managing|controlling))\b",
        r"\bshould(n'?t)? have\b.{0,40}\b(eat|bolus|check|dose)\b",
        r"\bfeel(ing)? (like a )?(failure|bad|terrible|awful|horrible)\b",
        r"\blet (myself|my (doctor|team|family)) down\b",
        r"\bso (stupid|dumb|careless)\b",
        r"\bwhy (can'?t I|don'?t I)\b",
        r"\bhide (my|the) (pump|cgm|sensor|insulin|pen)\b",
        r"\bdon'?t want (anyone|people|them) to (know|see|notice)\b",
        r"\bjudge(d|ment)?\b",
        r"\bstigma\b",
        r"\bblame\b.{0,30}\bdiabet\b",
        r"\bdiabet\b.{0,30}\bblame\b",
        r"\bnumber(s)?\b.{0,30}\b(bad|terrible|awful|horrible|disappoint)\b",
    ],
    "fear_complications": [
        r"\bscared\b.{0,60}\b(complication|kidney|eye|heart|neuropath|amputat|blind|retino|nephro)\b",
        r"\bworr(ied|y|ying)\b.{0,60}\b(complication|kidney|eye|heart|neuropath|amputat|future|long.?term)\b",
        r"\bterrified\b",
        r"\blie awake\b",
        r"\bfrightened\b",
        r"\banxious?\b.{0,60}\b(complication|future|long.?term|health)\b",
        r"\bfear(ful)?\b.{0,60}\b(complication|kidney|eye|heart|neuropath|amputat)\b",
        r"\b(kidney|eye|heart|neuropath|amputat|blind|retino)\b.{0,60}\b(scar(ed|y)|worr|fear|terrif|anxious)\b",
        r"\bwhat (this|it).{0,20}(do(ing)?|happen).{0,20}\b(body|health|future)\b",
        r"\b(long.?term|future).{0,40}\b(health|complication|damage|effect)\b",
        r"\bwon'?t (live|make it|be here)\b",
        r"\b(going to|will) (lose|damage|hurt)\b.{0,30}\b(eye|kidney|foot|feet|nerve)\b",
        r"\bgrandmother?\b.{0,60}\b(blind|kidney|amputat|lost|died)\b",
        r"\bsaw (my|a).{0,20}(lose|lost|blind|amputat)\b",
    ],
    "social_isolation": [
        r"\bno(body| one) (gets?|understands?|knows?)\b",
        r"\bno(body| one) (around me|in my life|i know)\b",
        r"\balone\b.{0,40}\b(manag|deal|cope|this|diabet)\b",
        r"\bdiabet\b.{0,40}\balone\b",
        r"\bisolat(ed|ion)\b",
        r"\bnobody else\b",
        r"\bdon'?t (get|understand) (it|what|how)\b.{0,30}\b(like|feel|is)\b",
        r"\bpeople (don'?t|can'?t) (get|understand|relate|know)\b",
        r"\bfeel(ing)? (so |completely |totally )?(alone|lonely|isolated|misunderstood)\b",
        r"\bno one (to talk to|who gets it|understands)\b",
        r"\bstopped (telling|explaining|talking)\b",
        r"\bdon'?t (bring|mention|talk about) it (anymore|any more)\b",
        r"\bfamily (doesn'?t|don'?t|can'?t) (get|understand|relate)\b",
        r"\bfriends? (doesn'?t|don'?t|can'?t) (get|understand|relate)\b",
        r"\bonly one (dealing|managing|living)\b",
        r"\bonly person\b.{0,30}\bdiabet\b",
        r"\bmisunderstood\b",
        r"\bno support\b",
        r"\bby myself\b.{0,30}\b(manag|deal|cope|this)\b",
    ],
    "hopelessness": [
        r"\bwhat'?s the point\b",
        r"\bnothing (i do )?(seems? to )?(matter|change|work|help)\b",
        r"\bgive up\b",
        r"\bgiving up\b",
        r"\bgiven up\b",
        r"\bwon'?t (get better|change|improve|ever)\b",
        r"\bwhy (bother|try|even)\b",
        r"\bpointless\b",
        r"\bhopeless\b",
        r"\bno (hope|point|use)\b",
        r"\bfutile\b",
        r"\bwhat'?s (the )?use\b",
        r"\bnever (going to|gonna) (get better|improve|change|be normal)\b",
        r"\bthrow (the|my) (pump|cgm|meter|everything) (away|out)\b",
        r"\bdone (with|trying)\b.{0,30}\b(this|diabet|manag)\b",
        r"\bcan'?t (do this|keep going|take it) (anymore|any more)\b",
        r"\bwant to (quit|stop|give up)\b",
        r"\bno matter what (i do|happens)\b",
        r"\balways (going to|gonna) (be (bad|high|low|broken|sick))\b",
        r"\bdisease (is going to|will) win\b",
        r"\bstopped (caring|trying|logging|checking)\b",
    ],
    "humor_marker": [
        r"\blol\b", r"\blmao\b", r"\blmfao\b", r"\bhaha\b", r"\bhehe\b",
        r"\bjk\b", r"\bjust kidding\b", r"\b:?\)\b", r"\bxd\b",
        r"\bpancreas (said|decided|chose|quit|retired)\b",
        r"\bmy (useless|broken|lazy|stupid) pancreas\b",
    ],
}

COMPILED = {k: [re.compile(p, re.IGNORECASE) for p in v] for k, v in LABEL_PATTERNS.items()}

DISTRESS_LABELS = ["management_overwhelm", "guilt_shame", "fear_complications",
                   "social_isolation", "hopelessness"]


def weak_label(text):
    labels = {}
    for label in DISTRESS_LABELS:
        labels[label] = int(any(p.search(text) for p in COMPILED[label]))

    has_humor = any(p.search(text) for p in COMPILED["humor_marker"])
    n_positive = sum(labels.values())

    labels["none"] = int(n_positive == 0)
    labels["needs_manual_review"] = int(has_humor and n_positive >= 1)
    return labels


def main():
    forum_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw_forum_posts.csv")
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "weakly_labeled_posts.csv")

    rows = []
    with open(forum_path, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for r in reader:
            labels = weak_label(r["text"])
            rows.append({"id": r["id"], "text": r["text"], **labels})

    label_cols = DISTRESS_LABELS + ["none", "needs_manual_review"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "text"] + label_cols)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Labeled {len(rows)} posts -> {out_path}")
    print("\nLabel distribution:")
    for l in DISTRESS_LABELS + ["none"]:
        count = sum(1 for r in rows if r[l] == 1)
        print(f"  {l}: {count} ({count/len(rows)*100:.1f}%)")
    print(f"\n  needs_manual_review: {sum(1 for r in rows if r['needs_manual_review'] == 1)}")


if __name__ == "__main__":
    main()
