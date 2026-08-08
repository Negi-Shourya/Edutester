#!/usr/bin/env python3
"""NEET 2025 — fresh diagram extraction from PDF.

The original raster-image attribution is systematically wrong (Hindi
column images leak into English questions, PW ads get mapped to
physics problems, etc.). This script:

  1. Removes ALL individual raster images from questions.json (Q{n}.png).
  2. Keeps _block.png / _opt{n}.png images (those use correct rect clips).
  3. For questions whose text references a figure / circuit / diagram / graph,
     takes a fresh screenshot of the diagram area from the PDF.

The approach for step 3:
  - Use the question markers (N. pattern) to find each question's vertical
    extent on the page.
  - Within that extent, find drawing clusters (vector art) that are
    "figure-like" (not just a single line or fraction bar).
  - Clip those clusters as the question's figure image.
  - For questions split across two pages, also check the next page.

Run:  python scripts/reclip_diagrams.py
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

import fitz

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(ROOT, "neet", "2025 Neet.pdf")
OUT_DIR = os.path.join(ROOT, "neet-out", "2025")
IMG_DIR = os.path.join(OUT_DIR, "images")
JSON_PATH = os.path.join(OUT_DIR, "questions.json")

# Minimum drawing cluster area to count as a "figure"
FIGURE_MIN_AREA = 1200
FIGURE_MIN_EDGE = 30
COL_SPLIT_DEFAULT = 305.0

# Keywords that suggest a question has a diagram
FIGURE_KEYWORDS = [
    "figure", "diagram", "circuit", "graph", "shown below",
    "as shown", "given below", "in the figure", "the figure",
    "given circuit", "logic", "gate", "ray diagram", "following figure",
    "truth table",
]


def has_figure_reference(text):
    """Does the question text suggest there's a diagram?"""
    text_lower = text.lower()
    return any(kw in text_lower for kw in FIGURE_KEYWORDS)


def section_for_qnum(n):
    if 1 <= n <= 45:
        return "PHYSICS"
    if 46 <= n <= 90:
        return "CHEMISTRY"
    return "BIOLOGY"


def page_column_split(page):
    """Return the x gutter between the two text columns."""
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
        return None
    xs.sort()
    best_gap, best_x = 0, None
    for i in range(len(xs) - 1):
        gap = xs[i + 1] - xs[i]
        if 250 < xs[i] < 430 and gap > best_gap:
            best_gap, best_x = gap, (xs[i] + xs[i + 1]) / 2
    return 305.0 if best_gap >= 9 else None


def is_instruction_page(page):
    t = page.get_text("text", flags=0)[:2000]
    return "Important Instructions" in t or "Test Booklet is" in t[:600]


def is_answer_key_page(page):
    t = page.get_text("text", flags=0)[:3000]
    return "ANSWERS" in t or "Hints & Solutions" in t or "Text Solution" in t[:3000]


def question_markers_on_page(page, split_x):
    """Find question number markers (e.g. '42.') on a page.
    Returns dict: {"L": [(y, qnum), ...], "R": [(y, qnum), ...]}
    """
    markers = {"L": [], "R": []}
    for w in page.get_text("words"):
        x0, y0, x1, y1, word = w[0], w[1], w[2], w[3], w[4]
        m = re.match(r"^(\d{1,3})\.$", word)
        if not m:
            continue
        n = int(m.group(1))
        if not (1 <= n <= 180):
            continue
        col = "R" if split_x is not None and (x0 + x1) / 2 >= split_x else "L"
        markers[col].append((y0, n))
    for col in ("L", "R"):
        markers[col].sort(key=lambda t: t[0])
    return markers


def drawing_clusters(page, min_area=FIGURE_MIN_AREA, min_edge=FIGURE_MIN_EDGE):
    """Find clusters of vector drawings that look like figures."""
    rects = []
    for d in page.get_drawings():
        r = d["rect"]
        # Skip tiny drawings (dots, fraction bars)
        if r.width < 2 and r.height < 2:
            continue
        # Skip fraction bars (very wide but very thin)
        if r.height < 2.0 and r.width > 6:
            continue
        if r.width * r.height < 12:
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

    # Merge touching clusters iteratively
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
        if c.width < min_edge or c.height < min_edge:
            continue
        if c.get_area() < min_area:
            continue
        result.append(c)

    return result


def render_clip(page, rect, out_fn, scale=2.5):
    """Render a page region to an image file at given scale."""
    # Pad the rect slightly
    padded = fitz.Rect(rect.x0 - 4, rect.y0 - 4, rect.x1 + 4, rect.y1 + 4)
    pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=padded)
    pm.save(out_fn)


def find_question_on_page(pno, qnum, all_markers, splits):
    """Find the page/column/y-extent of a question."""
    for p in range(max(0, pno - 1), min(len(all_markers), pno + 2)):
        sp = splits.get(p)
        for col in ("L", "R"):
            marks = all_markers[p][col]
            for i, (y, n) in enumerate(marks):
                if n == qnum:
                    top = y
                    if i + 1 < len(marks):
                        bottom = marks[i + 1][0]
                    else:
                        bottom = 838.0  # page bottom
                    return p, col, top, bottom
    return None, None, None, None


def main():
    # Load questions
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data["questions"]

    # Open PDF
    doc = fitz.open(PDF_PATH)
    print(f"PDF: {PDF_PATH} ({doc.page_count} pages)")

    # Build page data
    splits = {}
    all_markers = []
    body_pages = []  # pages with actual questions (not instructions/answers)

    for pno in range(doc.page_count):
        page = doc[pno]
        if is_instruction_page(page) or is_answer_key_page(page):
            splits[pno] = None
            all_markers.append({"L": [], "R": []})
            continue
        sp = page_column_split(page)
        splits[pno] = sp
        mk = question_markers_on_page(page, sp)
        all_markers.append(mk)
        body_pages.append(pno)

    # Step 1: Remove all individual raster images, keep blocks and opts
    removed_rasters = 0
    for q in questions:
        images = q.get("images", [])
        new_images = []
        for f in images:
            if "_block" in f or "_opt" in f or "_stem" in f:
                new_images.append(f)
            else:
                removed_rasters += 1
        q["images"] = new_images

    print(f"Removed {removed_rasters} misattributed raster images")

    # Step 2: For questions with figure references in text but no images,
    # find and clip vector-drawn diagrams from the PDF
    clipped = 0
    for q in questions:
        qnum = q["number"]
        text = q.get("text", "")

        # Skip if already has block images
        if any("_block" in f for f in q.get("images", [])):
            continue

        # Skip if question has no text (already handled by block)
        if not text:
            continue

        # Check if question references a figure/diagram
        if not has_figure_reference(text):
            continue

        # Find question location in PDF
        # Try the page recorded in the extraction
        pno_hint = q.get("page", 0) - 1
        pno, col, q_top, q_bottom = find_question_on_page(
            pno_hint, qnum, all_markers, splits)

        if pno is None:
            print(f"  Q{qnum}: could not locate on page (hint: p{pno_hint + 1})")
            continue

        page = doc[pno]
        sp = splits.get(pno)

        # Find drawing clusters within the question's vertical extent
        clusters = drawing_clusters(page)

        # Filter clusters that are within this question's area
        if col == "L":
            x_min, x_max = 2, (sp if sp else 305)
        else:
            x_min = sp if sp else 305
            x_max = 611

        fig_clusters = []
        for cl in clusters:
            # Check horizontal overlap with the question's column
            cl_cx = (cl.x0 + cl.x1) / 2
            if cl_cx < x_min or cl_cx > x_max:
                continue
            # Check vertical overlap with the question
            if cl.y1 < q_top - 5 or cl.y0 > q_bottom + 5:
                continue
            fig_clusters.append(cl)

        if not fig_clusters:
            # Try next page (question might span)
            if pno + 1 < doc.page_count and pno + 1 in {p for p in body_pages}:
                page2 = doc[pno + 1]
                clusters2 = drawing_clusters(page2)
                sp2 = splits.get(pno + 1)
                if col == "L":
                    x_min2, x_max2 = 2, (sp2 if sp2 else 305)
                else:
                    x_min2 = sp2 if sp2 else 305
                    x_max2 = 611
                # Check the top portion of the next page
                for cl in clusters2:
                    cl_cx = (cl.x0 + cl.x1) / 2
                    if cl_cx < x_min2 or cl_cx > x_max2:
                        continue
                    if cl.y0 > 200:  # only top portion
                        continue
                    fig_clusters.append(("next", cl))

        if not fig_clusters:
            continue

        # Clip each figure cluster
        fig_count = 0
        for item in fig_clusters:
            if isinstance(item, tuple) and item[0] == "next":
                clip_page = doc[pno + 1]
                cl = item[1]
            else:
                clip_page = page
                cl = item

            fig_count += 1
            suffix = "" if fig_count == 1 else f"_{fig_count}"
            fname = f"Q{qnum}_fig{suffix}.png"
            out_path = os.path.join(IMG_DIR, fname)
            render_clip(clip_page, cl, out_path, scale=2.5)
            q["images"].append(fname)
            clipped += 1
            print(f"  Q{qnum}: clipped figure -> {fname} ({int(cl.width)}x{int(cl.height)})")

    print(f"Clipped {clipped} fresh diagram(s) from PDF")

    # Step 3: Write cleaned JSON
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)

    # Step 4: Clean orphaned image files
    all_refs = set()
    for q in questions:
        for f in q.get("images", []):
            all_refs.add(f)
        for opt in q.get("options", []):
            fig = opt.get("figure") or opt.get("image")
            if fig:
                all_refs.add(fig)

    orphans = 0
    if os.path.isdir(IMG_DIR):
        for f in os.listdir(IMG_DIR):
            if f not in all_refs:
                os.remove(os.path.join(IMG_DIR, f))
                orphans += 1

    # Report
    doc.close()
    print()
    print("=" * 60)
    print("  FINAL REPORT")
    print("=" * 60)
    print(f"Raster images removed: {removed_rasters}")
    print(f"Fresh diagrams clipped: {clipped}")
    print(f"Orphans deleted: {orphans}")
    print(f"Total images now: {sum(len(q.get('images', [])) for q in questions)}")
    print()
    print("Questions with images:")
    for q in questions:
        if q.get("images"):
            print(f"  Q{q['number']}: {', '.join(q['images'])}")

    # Option images
    opt_count = sum(1 for q in questions for o in q.get("options", [])
                    if o.get("figure") or o.get("image"))
    print(f"\nOption cell images: {opt_count}")


if __name__ == "__main__":
    main()
