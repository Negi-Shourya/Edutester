#!/usr/bin/env python3
"""Dump drawing rects in specific option regions of the NEET 2023 PDF to
detect vector-drawn minus signs (short horizontal bars) and radicals.

Regions (0-indexed pages):
  Q40 options: page 21, left column y 720-780, x 60-300
  Q45 options: page 22, left column y 110-160, x 60-300
  Q46 options: page 22, left column y 300-350, x 60-300
  Q30 options: page 20, right column y 150-240, x 330-560
"""
import os
import sys
import fitz

PDF_PATH = os.path.join("neet", "2023 Neet.pdf")
sys.stdout.reconfigure(encoding="utf-8")

REGIONS = {
    "Q40 (page22, left col)": (21, 60, 300, 715, 790),
    "Q45 (page23, left col)": (22, 60, 300, 105, 160),
    "Q46 (page23, left col)": (22, 60, 300, 295, 350),
    "Q30 (page21, right col)": (20, 330, 560, 145, 245),
}

doc = fitz.open(PDF_PATH)
for name, (pno, x0, x1, y0, y1) in REGIONS.items():
    print(f"\n=== {name} ===")
    page = doc[pno]
    for d in page.get_drawings():
        r = d["rect"]
        if not (r.x0 < x1 and r.x1 > x0 and r.y0 < y1 and r.y1 > y0):
            continue
        w, h = r.width, r.height
        if w < 2 or h < 0.3 or w * h < 1.5:
            continue
        kind = []
        if h < 2.5 and w > 2.5 * h and w < 16:
            kind.append("MINUS?")
        if h < 3.0 and w >= 16:
            kind.append("FRACBAR")
        if 6 <= w <= 16 and 8 <= h <= 20:
            kind.append("RADICAL?")
        if kind:
            print(f"  x={r.x0:6.1f}-{r.x1:6.1f} y={r.y0:6.1f}-{r.y1:6.1f} "
                  f"w={w:5.1f} h={h:4.1f} {' '.join(kind)}")
doc.close()
