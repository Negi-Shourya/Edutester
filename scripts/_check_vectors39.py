#!/usr/bin/env python3
"""Check drawing rects in the Q39 options region (page 22, y 550-585)."""
import os
import sys
import fitz

PDF_PATH = os.path.join("neet", "2023 Neet.pdf")
sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open(PDF_PATH)
page = doc[21]
for d in page.get_drawings():
    r = d["rect"]
    if not (80 <= r.x0 < 270 and 545 <= r.y0 < 592):
        continue
    if r.width < 2 or r.height < 1.5:
        continue
    print(f"x={r.x0:6.1f}-{r.x1:6.1f} y={r.y0:6.1f}-{r.y1:6.1f} "
          f"w={r.width:5.1f} h={r.height:4.1f}")
doc.close()
