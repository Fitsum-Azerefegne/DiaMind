"""
Collects public posts from diabetes-related subreddits using PRAW.

Run this LOCALLY (this sandbox has no internet access to reddit.com).

Setup:
1. Create a Reddit app at https://www.reddit.com/prefs/apps (script type)
2. Set the environment variables below, or fill them in directly (don't commit
   real credentials to git)
3. pip install praw
4. python scripts/collect_reddit_data.py
"""
import os
import csv
import time
import praw

CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID", "YOUR_CLIENT_ID")
CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
USER_AGENT = "diamind-research-collector/0.1 by u/YOUR_USERNAME"

SUBREDDITS = ["diabetes", "Type1Diabetes", "diabetes_t1"]
POSTS_PER_SUB = 500  # adjust as needed; be mindful of Reddit API rate limits
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw_posts.csv")


def collect():
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        user_agent=USER_AGENT,
    )

    rows = []
    for sub_name in SUBREDDITS:
        print(f"Collecting from r/{sub_name} ...")
        subreddit = reddit.subreddit(sub_name)
        for submission in subreddit.new(limit=POSTS_PER_SUB):
            if not submission.selftext or len(submission.selftext) < 20:
                continue
            rows.append({
                "id": submission.id,
                "subreddit": sub_name,
                "title": submission.title,
                "text": submission.selftext,
                "created_utc": submission.created_utc,
                "score": submission.score,
                "num_comments": submission.num_comments,
            })
            time.sleep(0.1)  # be polite to the API

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["id", "subreddit", "title", "text", "created_utc", "score", "num_comments"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Collected {len(rows)} posts -> {OUTPUT_PATH}")
    print("Next: run scripts/weak_supervision_labeling.py, then hand-review a sample.")


if __name__ == "__main__":
    collect()
