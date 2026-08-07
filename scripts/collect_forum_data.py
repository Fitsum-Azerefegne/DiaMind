"""
Collects public posts from the Diabetes UK forum (forum.diabetes.org.uk) --
a large, active, publicly-readable XenForo board. We target the "Stigma"
subforum (directly about the emotional/social burden of diabetes) plus the
General Message Board, which naturally contains plenty of distress-adjacent
posts alongside routine ones (good for realistic class imbalance).

Note: diabetes.co.uk's robots.txt disallows scraping /forum/, so we're not
using that site. tudiabetes.org has also shut down entirely. This is the
best currently-available public diabetes forum for this purpose.

Run this LOCALLY on your own machine (needs real internet access).

Ethics/etiquette built in:
- Checks robots.txt before doing anything, and stops if scraping is disallowed
- Identifies itself honestly via User-Agent (no pretending to be a browser)
- Adds a delay between requests so we don't hammer their server
- Collects PUBLIC posts only (nothing behind login)
- For personal/portfolio research use -- don't republish the raw scraped text
  anywhere public; that's a separate copyright/privacy question from scraping
  it for your own model training.

Setup:
    pip install requests beautifulsoup4

Usage:
    python scripts/collect_forum_data.py
"""
import os
import csv
import time
import requests
from urllib.robotparser import RobotFileParser
from urllib.parse import urljoin
from bs4 import BeautifulSoup

BASE = "https://forum.diabetes.org.uk"
USER_AGENT = "diamind-research-bot/0.1 (personal portfolio project, non-commercial, low volume)"

# Subforums worth pulling from -- Stigma is the priority (directly emotional/
# distress-adjacent content); General Message Board gives realistic variety
CATEGORY_URLS = [
    "/boards/forums/stigma.54/",
    "/boards/forums/general-message-board.2/",
    "/boards/forums/diabetes-more.55/",
]

MAX_THREADS_PER_CATEGORY = 30   # keep this modest -- be a polite scraper
MAX_PAGES_PER_THREAD = 2
REQUEST_DELAY_SECONDS = 2       # pause between every request, non-negotiable

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw_forum_posts.csv")

session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT})


def check_robots_allowed():
    rp = RobotFileParser()
    rp.set_url(urljoin(BASE, "/robots.txt"))
    rp.read()
    allowed = rp.can_fetch(USER_AGENT, urljoin(BASE, "/boards/"))
    if not allowed:
        print("robots.txt disallows scraping /boards/ for this user-agent. Stopping.")
        return False
    print("robots.txt allows this path -- proceeding respectfully.")
    return True


def get_soup(url):
    time.sleep(REQUEST_DELAY_SECONDS)
    resp = session.get(url, timeout=15)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def find_thread_links(category_url):
    """Pull thread URLs out of a category/subforum listing page."""
    soup = get_soup(urljoin(BASE, category_url))
    links = []
    for a in soup.select("a[href*='/boards/threads/']"):
        href = a.get("href")
        if href and "/boards/threads/" in href and href not in links:
            full = urljoin(BASE, href.split("#")[0])
            if full not in links:
                links.append(full)
    return links[:MAX_THREADS_PER_CATEGORY]


def extract_posts_from_thread(thread_url):
    """Pull individual post bodies out of a thread page (handles XenForo's
    standard markup: message-body / bbWrapper divs)."""
    posts = []
    url = thread_url
    for _ in range(MAX_PAGES_PER_THREAD):
        soup = get_soup(url)
        for article in soup.select("article.message"):
            body = article.select_one(".bbWrapper")
            if body:
                text = body.get_text(separator=" ", strip=True)
                if len(text) > 20:
                    posts.append(text)

        next_link = soup.select_one("a.pageNav-jump--next")
        if next_link and next_link.get("href"):
            url = urljoin(BASE, next_link["href"])
        else:
            break
    return posts


def main():
    if not check_robots_allowed():
        return

    all_rows = []
    row_id = 0
    for category in CATEGORY_URLS:
        print(f"\nCollecting threads from {category} ...")
        try:
            thread_links = find_thread_links(category)
        except requests.RequestException as e:
            print(f"  Skipping category, request failed: {e}")
            continue

        print(f"  Found {len(thread_links)} threads")
        for thread_url in thread_links:
            try:
                posts = extract_posts_from_thread(thread_url)
            except requests.RequestException as e:
                print(f"  Skipping thread, request failed: {e}")
                continue
            for text in posts:
                all_rows.append({"id": row_id, "source_category": category, "text": text})
                row_id += 1
            print(f"  {thread_url} -> {len(posts)} posts (running total: {len(all_rows)})")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "source_category", "text"])
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\nDone. Collected {len(all_rows)} posts -> {OUTPUT_PATH}")
    print("Next: run scripts/weak_supervision_labeling.py, then hand-review a sample")
    print("per data/labeling_rubric.md before treating this as training data.")


if __name__ == "__main__":
    main()
