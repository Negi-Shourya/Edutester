#!/usr/bin/env python3
"""Extract figures from the JEE question-paper PDFs and name each image by
date, shift and question number. Images are attributed to questions by their
position on the page relative to the "Q<n>." markers.

Usage: python3 extract_paper_images.py <src_dir> <out_dir>
"""
import os
import re
import sys
import fitz

SRC = sys.argv[1]
OUT = sys.argv[2]

FILENAME_RE = re.compile(r"JEE Main (\d{4}) (\d{2}) (\w+) (Morning|Evening) Shift Questions\.pdf$")
MARKER_RE = re.compile(r"^Q(\d+)\.$")

MIN_EDGE = 30  # skip tiny images (logo pixels, artifacts)


def parse_paper(fname):
    m = FILENAME_RE.search(fname)
    if not m:
        return None
    year, day, month_name, shift = m.group(1), m.group(2), m.group(3), m.group(4)
    month = {"January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
             "July": 7, "August": 8, "September": 9, "October": 10, "November": 11,
             "December": 12}[month_name]
    date = f"{year}-{month:02d}-{int(day):02d}"
    return f"{date}_{shift.lower()}", f"{date}-{shift.lower()}"


def question_markers(page):
    """Return sorted [(qnumber, y0)] for the page."""
    markers = []
    d = page.get_text("dict")
    for block in d["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            text = "".join(s["text"] for s in line["spans"]).strip()
            m = MARKER_RE.match(text)
            if m:
                markers.append((int(m.group(1)), line["bbox"][1]))
    markers.sort(key=lambda x: x[1])
    return markers


def collect_placements(doc):
    """Return list of (page_no, xref, rect) in document order, deduped."""
    seen = set()
    placements = []
    for pno, page in enumerate(doc):
        for xref in {im[0] for im in page.get_images(full=True)}:
            if xref <= 0:
                continue
            for rect in page.get_image_rects(xref):
                key = (pno, xref, tuple(round(v, 1) for v in rect))
                if key in seen:
                    continue
                seen.add(key)
                placements.append((pno, xref, rect))
    return placements


def extract_image(doc, xref, out_path):
    info = doc.extract_image(xref)
    ext = info["ext"]
    if ext in ("png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff"):
        with open(out_path, "wb") as f:
            f.write(info["image"])
        return ext
    pix = fitz.Pixmap(doc, xref)
    if pix.n - pix.alpha > 3:  # CMYK -> RGB
        pix = fitz.Pixmap(fitz.csRGB, pix)
    if pix.alpha:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    pix.save(out_path)
    return "png"


def main():
    papers = []
    for fname in sorted(os.listdir(SRC)):
        if not fname.endswith(".pdf"):
            continue
        parsed = parse_paper(fname)
        if not parsed:
            print(f"SKIP (name pattern): {fname}")
            continue

        slug, folder = parsed
        doc = fitz.open(os.path.join(SRC, fname))

        # build per-page markers + running last question
        page_markers = []
        last_q = None
        for pno, page in enumerate(doc):
            markers = question_markers(page)
            if markers:
                last_q = markers[-1][0]
            page_markers.append((markers, last_q))

        out_dir = os.path.join(OUT, folder)
        os.makedirs(out_dir, exist_ok=True)

        counts = {}  # qnumber -> number of images
        placed = 0
        for pno, xref, rect in collect_placements(doc):
            if rect.width < MIN_EDGE or rect.height < MIN_EDGE:
                continue
            markers, last_q = page_markers[pno]
            # attribute to the last marker above the image on this page,
            # otherwise carry over from the previous page
            qn = None
            for mqn, my in markers:
                if my <= rect.y0 + 2:
                    qn = mqn
            if qn is None:
                qn = last_q
            if qn is None:
                print(f"  WARN: orphan image page {pno+1} {rect} — skipped")
                continue

            idx = counts.get(qn, 0) + 1
            counts[qn] = idx
            stem = f"{slug}_Q{qn}" if idx == 1 else f"{slug}_Q{qn}_{idx}"
            ext = extract_image(doc, xref, os.path.join(out_dir, f"{stem}.png"))
            if ext:
                if ext != "png" and os.path.exists(os.path.join(out_dir, f"{stem}.png")):
                    os.rename(
                        os.path.join(out_dir, f"{stem}.png"),
                        os.path.join(out_dir, f"{stem}.{ext}"),
                    )
                placed += 1
        doc.close()
        paper_summary = ", ".join(f"Q{q}x{n}" if n > 1 else f"Q{q}" for q, n in sorted(counts.items()))
        print(f"{folder}: {placed} images  [{paper_summary}]")


if __name__ == "__main__":
    main()
