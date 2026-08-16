#!/usr/bin/env python3
"""NEET 2023 — preview diagram extraction with full context.

Unlike the original extraction that clips ONLY vector drawing clusters
(missing text labels like resistance values, axis labels, annotations),
this script:

  1. Finds vector drawing clusters (circuits, graphs, structures)
  2. Expands each cluster's bounding box to include nearby text characters
     (within ~18pt radius) so labels, values, and annotations are captured
  3. Clips the expanded region as a high-res PNG

Run:  python scripts/preview_neet_2023_diagrams.py
Output: neet-out/2023/preview_images/
"""
import json
import os
import re
import sys

import fitz

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(ROOT, "neet", "2023 Neet.pdf")
OUT_DIR = os.path.join(ROOT, "neet-out", "2023")
JSON_PATH = os.path.join(OUT_DIR, "questions.json")
PREVIEW_DIR = os.path.join(OUT_DIR, "preview_images")

# Minimum drawing cluster size
FIGURE_MIN_AREA = 800
FIGURE_MIN_EDGE = 25

# How far (in points) to look for text characters near a drawing cluster
TEXT_SEARCH_RADIUS = 18

# Padding around the expanded clip
CLIP_PADDING = 8

# Page bounds (skip footer junk)
MAX_Y = 795.0
MIN_Y = 35.0


def collect_chars(page):
    """Extract all visible text characters from a page."""
    chars = []
    d = page.get_text("rawdict")
    for block in d["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                font = span["font"]
                # Skip header/footer fonts
                if font.startswith("Roboto") or "Impact" in font or "Bahnschrift" in font:
                    continue
                for ch in span["chars"]:
                    t = ch["c"]
                    if not t or t == "\x00" or t.isspace():
                        continue
                    b = ch["bbox"]
                    oy = ch["origin"][1]
                    if MIN_Y <= oy <= MAX_Y:
                        chars.append({
                            "x0": b[0], "y0": b[1], "x1": b[2], "y1": b[3],
                            "text": t, "oy": oy, "size": span["size"],
                        })
    return chars


def drawing_clusters(page, pw, ph):
    """Find clusters of vector drawings (circuits, graphs, structures)."""
    rects = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.width < 0.4 and r.height < 0.4:
            continue
        if r.width * r.height < 12:
            continue
        # Skip full-page frame/border rects
        if r.width > 0.65 * pw and r.height > 0.65 * ph:
            continue
        # Skip header banner
        if r.y0 < 40 and r.height > 60 and r.width > 0.4 * pw:
            continue
        # Skip very thin fraction bars
        if r.height < 2.0 and r.width > 6:
            continue
        rects.append(r)

    # Cluster overlapping/adjacent drawings
    clusters = []
    for r in rects:
        hit = None
        grow = fitz.Rect(r.x0 - 3, r.y0 - 3, r.x1 + 3, r.y1 + 3)
        for i, c in enumerate(clusters):
            if (c & grow).get_area() > 0:
                hit = i
                break
        if hit is not None:
            clusters[hit] |= r
        else:
            clusters.append(fitz.Rect(r))

    # Merge touching clusters
    changed = True
    while changed:
        changed = False
        for i in range(len(clusters)):
            if clusters[i] is None:
                continue
            for j in range(i + 1, len(clusters)):
                if clusters[j] is None:
                    continue
                gi = fitz.Rect(clusters[i].x0 - 3, clusters[i].y0 - 3,
                               clusters[i].x1 + 3, clusters[i].y1 + 3)
                if (gi & clusters[j]).get_area() > 0:
                    clusters[i] |= clusters[j]
                    clusters[j] = None
                    changed = True

    # Filter by size
    result = []
    for c in clusters:
        if c is None:
            continue
        if c.width < FIGURE_MIN_EDGE or c.height < FIGURE_MIN_EDGE:
            continue
        if c.get_area() < FIGURE_MIN_AREA:
            continue
        result.append(c)

    return result


def expand_cluster_with_text(cluster_rect, chars, radius=TEXT_SEARCH_RADIUS):
    """Expand a drawing cluster's bounding box to include nearby text characters.

    This ensures that labels (resistance values, axis labels, annotations)
    that sit near the diagram are captured in the screenshot.
    """
    expanded = fitz.Rect(cluster_rect)
    for ch in chars:
        # Character center
        cx = (ch["x0"] + ch["x1"]) / 2
        cy = (ch["y0"] + ch["y1"]) / 2

        # Distance from character center to nearest edge of the cluster
        dx = max(cluster_rect.x0 - cx, 0, cx - cluster_rect.x1)
        dy = max(cluster_rect.y0 - cy, 0, cy - cluster_rect.y1)
        dist = (dx**2 + dy**2) ** 0.5

        if dist <= radius:
            expanded |= fitz.Rect(ch["x0"], ch["y0"], ch["x1"], ch["y1"])

    return expanded


def render_clip(page, rect, out_fn, scale=3.0):
    """Render a page region to an image file."""
    padded = fitz.Rect(
        rect.x0 - CLIP_PADDING,
        rect.y0 - CLIP_PADDING,
        rect.x1 + CLIP_PADDING,
        rect.y1 + CLIP_PADDING,
    )
    # Clamp to page bounds
    padded &= page.rect
    pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=padded)
    pm.save(out_fn)


def is_instruction_page(page):
    t = page.get_text("text", flags=0)[:2000]
    return "Important Instructions" in t or "Test Booklet is" in t[:600]


def is_answer_key_page(page):
    t = page.get_text("text", flags=0)[:3000]
    return "ANSWERS" in t or "Hints & Solutions" in t or "Text Solution" in t[:3000]


def main():
    doc = fitz.open(PDF_PATH)
    print(f"PDF: {PDF_PATH} ({doc.page_count} pages)")

    os.makedirs(PREVIEW_DIR, exist_ok=True)

    # Load questions to know which questions exist
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    questions = data["questions"]

    # Build a map: booklet number -> question
    q_by_booklet = {}
    for q in questions:
        booklet = q.get("booklet", q["number"])
        q_by_booklet[booklet] = q

    total_clusters = 0
    total_expanded = 0
    preview_count = 0

    for pno in range(doc.page_count):
        page = doc[pno]

        # Skip instruction and answer key pages
        if is_instruction_page(page) or is_answer_key_page(page):
            continue

        pw, ph = page.rect.width, page.rect.height

        # Get all text characters on this page
        chars = collect_chars(page)

        # Find vector drawing clusters
        clusters = drawing_clusters(page, pw, ph)

        if not clusters:
            continue

        print(f"\nPage {pno + 1}: {len(clusters)} drawing cluster(s)")

        for ci, cluster in enumerate(clusters):
            total_clusters += 1

            # Original tight clip (for comparison)
            orig_rect = fitz.Rect(cluster)

            # Expanded clip including nearby text
            expanded_rect = expand_cluster_with_text(cluster, chars)
            total_expanded += 1

            # Check if the expansion actually grew the region
            grew = (expanded_rect.width > orig_rect.width * 1.1 or
                    expanded_rect.height > orig_rect.height * 1.1)

            # Save both versions for comparison
            orig_path = os.path.join(PREVIEW_DIR,
                f"p{pno+1:02d}_c{ci+1}_tight.png")
            expanded_path = os.path.join(PREVIEW_DIR,
                f"p{pno+1:02d}_c{ci+1}_expanded.png")

            render_clip(page, orig_rect, orig_path)
            render_clip(page, expanded_rect, expanded_path)

            size_str = (f"orig {int(orig_rect.width)}x{int(orig_rect.height)} "
                       f"-> expanded {int(expanded_rect.width)}x{int(expanded_rect.height)}")
            grow_str = " *** EXPANDED ***" if grew else ""
            print(f"  Cluster {ci+1}: {size_str}{grow_str}")

            preview_count += 1

    doc.close()

    print(f"\n{'=' * 60}")
    print(f"  PREVIEW COMPLETE")
    print(f"{'=' * 60}")
    print(f"Total drawing clusters found: {total_clusters}")
    print(f"Preview images saved to: {PREVIEW_DIR}")
    print(f"Files: {preview_count * 2} PNGs ({preview_count} tight + {preview_count} expanded)")
    print(f"\nCompare *_tight.png vs *_expanded.png to see the difference.")
    print(f"The expanded versions should include labels/annotations near the diagrams.")


if __name__ == "__main__":
    main()
