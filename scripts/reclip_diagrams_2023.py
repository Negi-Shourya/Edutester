#!/usr/bin/env python3
"""NEET 2023 — diagram extraction with labels.

Clips vector-drawn diagrams (circuits, graphs, structures) and expands
the clip to include nearby text characters (resistance values, voltage
labels, axis labels, annotations) but NOT the full question text.

The key insight: text labels in the PDF are positioned near the vector
lines they annotate, typically within 15-25pt. We find the vector cluster,
then expand to include any text within that radius.

Run:  python scripts/reclip_diagrams_2023.py
"""
import json
import os
import re
import sys
from collections import defaultdict

import fitz

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(ROOT, "neet", "2023 Neet.pdf")
OUT_DIR = os.path.join(ROOT, "neet-out", "2023")
IMG_DIR = os.path.join(OUT_DIR, "images")
JSON_PATH = os.path.join(OUT_DIR, "questions.json")

# 0-indexed page ranges for question pages
BIO_QPAGES = list(range(0, 11))    # 1-100
PHY_QPAGES = list(range(18, 23))   # 1-50
CHE_QPAGES = list(range(28, 34))   # 1-50
ALL_QPAGES = BIO_QPAGES + PHY_QPAGES + CHE_QPAGES

MAX_Y = 795.0
MIN_Y = 35.0
COL_SPLIT_X = 305.0

# Minimum drawing cluster to count as a figure
FIGURE_MIN_AREA = 600
FIGURE_MIN_EDGE = 20

# How far (in points) to look for text characters near a drawing cluster
# This captures labels like "10Ω", "5V", axis labels, etc.
TEXT_SEARCH_RADIUS = 25

# Padding around the expanded clip
CLIP_PAD = 6

SCALE = 3.0


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
                if font.startswith("Roboto") or "Impact" in font or "Bahnschrift" in font or "Baloo" in font:
                    continue
                for ch in span["chars"]:
                    t = ch["c"]
                    if not t or t == "\x00" or t.isspace():
                        continue
                    b = ch["bbox"]
                    oy = ch["origin"][1]
                    if MIN_Y <= oy <= MAX_Y:
                        chars.append({
                            "rect": fitz.Rect(b[0], b[1], b[2], b[3]),
                            "text": t,
                            "oy": oy,
                            "size": span["size"],
                        })
    return chars


def drawing_clusters(page):
    """Find clusters of vector drawings (circuits, graphs, structures)."""
    pw, ph = page.rect.width, page.rect.height
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
    return [c for c in clusters if c is not None and
            c.width >= FIGURE_MIN_EDGE and c.height >= FIGURE_MIN_EDGE and
            c.get_area() >= FIGURE_MIN_AREA]


def expand_cluster_with_text(cluster_rect, chars, radius=TEXT_SEARCH_RADIUS):
    """Expand a drawing cluster to include nearby text characters.

    This captures labels like resistance values ("10Ω"), voltage ("5V"),
    axis labels, and annotations that sit near the diagram.
    """
    expanded = fitz.Rect(cluster_rect)
    for ch in chars:
        # Character center
        cx = (ch["rect"].x0 + ch["rect"].x1) / 2
        cy = (ch["rect"].y0 + ch["rect"].y1) / 2

        # Distance from character center to nearest edge of the cluster
        dx = max(cluster_rect.x0 - cx, 0, cx - cluster_rect.x1)
        dy = max(cluster_rect.y0 - cy, 0, cy - cluster_rect.y1)
        dist = (dx**2 + dy**2) ** 0.5

        if dist <= radius:
            expanded |= ch["rect"]

    return expanded


def render_clip(page, rect, out_fn):
    """Render a page region to an image file."""
    padded = fitz.Rect(
        rect.x0 - CLIP_PAD,
        rect.y0 - CLIP_PAD,
        rect.x1 + CLIP_PAD,
        rect.y1 + CLIP_PAD,
    )
    # Clamp to page bounds
    padded &= page.rect
    pm = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=padded)
    pm.save(out_fn)


def question_markers(page, split_x):
    """Find question number markers (e.g. '42.') on a page."""
    markers = {"L": [], "R": []}
    for w in page.get_text("words"):
        x0, y0, x1, y1, word = w[0], w[1], w[2], w[3], w[4]
        m = re.match(r"^(\d{1,3})\.$", word)
        if not m:
            continue
        n = int(m.group(1))
        if not (1 <= n <= 200):
            continue
        col = "R" if (x0 + x1) / 2 >= split_x else "L"
        markers[col].append((y0, n))
    for col in ("L", "R"):
        markers[col].sort(key=lambda t: t[0])
    return markers


def split_x_for_page(page):
    """Detect the column gutter."""
    d = page.get_text("rawdict")
    xs = []
    for block in d["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                for ch in span["chars"]:
                    if 45 < ch["origin"][1] < 770:
                        xs.append(ch["bbox"][0])
    if not xs:
        return COL_SPLIT_X
    xs.sort()
    best_gap, best_x = 0, None
    for i in range(len(xs) - 1):
        gap = xs[i + 1] - xs[i]
        if 200 < xs[i] < 450 and gap > best_gap:
            best_gap, best_x = gap, (xs[i] + xs[i + 1]) / 2
    if best_gap < 9:
        return COL_SPLIT_X
    return best_x


def is_instruction_page(page):
    t = page.get_text("text", flags=0)[:2000]
    return "Important Instructions" in t or "Test Booklet is" in t[:600]


def is_answer_key_page(page):
    t = page.get_text("text", flags=0)[:3000]
    return "ANSWERS" in t or "Hints & Solutions" in t or "Text Solution" in t[:3000]


def main():
    doc = fitz.open(PDF_PATH)
    print(f"PDF: {PDF_PATH} ({doc.page_count} pages)")

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    questions = data["questions"]

    os.makedirs(IMG_DIR, exist_ok=True)

    # Clean old images
    for old in os.listdir(IMG_DIR):
        os.remove(os.path.join(IMG_DIR, old))
    print(f"Cleaned old images from {IMG_DIR}")

    # Build page data (chars, markers, split_x) for each question page
    page_data = {}
    for pno in ALL_QPAGES:
        if pno >= doc.page_count:
            continue
        page = doc[pno]
        if is_instruction_page(page) or is_answer_key_page(page):
            continue
        chars = collect_chars(page)
        sx = split_x_for_page(page)
        markers = question_markers(page, sx)
        page_data[pno] = {"split_x": sx, "markers": markers, "chars": chars}

    # Process each question
    clipped_count = 0
    total_images = 0

    for q in questions:
        qnum = q["number"]
        booklet = q.get("booklet", qnum)
        pno = q.get("page", 1) - 1  # 0-indexed
        col_hint = q.get("col", "L")

        if pno not in page_data:
            continue

        pd = page_data[pno]
        sx = pd["split_x"]
        markers = pd["markers"]

        # Find this question's position on the page using BOOKLET number
        q_top = None
        q_bottom = None
        q_col = col_hint

        col_marks = markers.get(col_hint, [])
        for i, (y, n) in enumerate(col_marks):
            if n == booklet:
                q_top = y
                if i + 1 < len(col_marks):
                    q_bottom = col_marks[i + 1][0]
                else:
                    q_bottom = 830.0
                break

        if q_top is None:
            # Try the other column
            other = "R" if col_hint == "L" else "L"
            for i, (y, n) in enumerate(markers.get(other, [])):
                if n == booklet:
                    q_top = y
                    q_col = other
                    if i + 1 < len(markers[other]):
                        q_bottom = markers[other][i + 1][0]
                    else:
                        q_bottom = 830.0
                    break

        if q_top is None:
            continue

        # Determine x bounds for this column
        if q_col == "L":
            x0, x1 = 50, sx
        else:
            x0, x1 = sx, 611

        # Find vector drawing clusters in this question's region
        page = doc[pno]
        all_clusters = drawing_clusters(page)
        fig_clusters = []
        for cl in all_clusters:
            cl_cx = (cl.x0 + cl.x1) / 2
            if cl_cx < x0 or cl_cx > x1:
                continue
            if cl.y1 < q_top - 5 or cl.y0 > q_bottom + 5:
                continue
            fig_clusters.append(cl)

        if not fig_clusters:
            # No vector drawings in this question - clear images
            q["images"] = []
            continue

        # For each vector cluster, expand to include nearby text labels
        images = []
        for ci, cl in enumerate(fig_clusters):
            suffix = "" if ci == 0 else f"_{ci + 1}"
            fname = f"Q{qnum}{suffix}.png"
            out_path = os.path.join(IMG_DIR, fname)

            # Expand cluster to include nearby text characters
            expanded = expand_cluster_with_text(cl, pd["chars"])

            # Also check the next page if the diagram might span
            if pno + 1 in page_data and cl.y1 > q_bottom - 20:
                next_pd = page_data[pno + 1]
                next_page = doc[pno + 1]
                next_clusters = drawing_clusters(next_page)
                for ncl in next_clusters:
                    ncl_cx = (ncl.x0 + ncl.x1) / 2
                    if ncl_cx < x0 or ncl_cx > x1:
                        continue
                    if ncl.y0 > 200:  # only top portion
                        continue
                    expanded |= expand_cluster_with_text(ncl, next_pd["chars"])

            render_clip(page, expanded, out_path)
            images.append(fname)
            clipped_count += 1
            total_images += 1

        q["images"] = images
        if images:
            print(f"  Q{qnum}: {', '.join(images)}")

    # Write updated JSON
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

    doc.close()

    print(f"\n{'=' * 60}")
    print(f"  EXTRACTION COMPLETE")
    print(f"{'=' * 60}")
    print(f"Questions with diagrams: {clipped_count}")
    print(f"Total images generated: {total_images}")
    print(f"Output: {IMG_DIR}")
    print(f"\nEach image shows the diagram + nearby labels (resistance, voltage, etc.)")
    print(f"but NOT the full question text.")


if __name__ == "__main__":
    main()
