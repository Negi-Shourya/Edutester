#!/usr/bin/env python3
"""Per-char dump for NEET 2021 PDF: char, x0, y0, size for a page + optional
y-range filter. Also prints vector drawing rects (for radical/fraction bars)."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
import fitz
from extract_neet_2021 import collect_chars

sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open("neet/neet 2021 question paper.pdf")
pno = int(sys.argv[1])
y0f, y1f = 0.0, 900.0
if len(sys.argv) >= 4:
    y0f, y1f = float(sys.argv[2]), float(sys.argv[3])

page = doc[pno - 1]
print(f"===== PAGE {pno} chars (y {y0f}-{y1f}) =====")
for c in collect_chars(page):
    if y0f <= c.oy <= y1f:
        t = repr(c.text)[1:-1]
        print(f"x={c.x0:7.2f} y={c.oy:7.2f} s={c.size:5.2f} f={c.font[:16]:16s} {t}")
print(f"===== PAGE {pno} drawings (y {y0f}-{y1f}) =====")
for d in page.get_drawings():
    r = d["rect"]
    if y0f <= (r.y0 + r.y1) / 2 <= y1f:
        kind = d.get("type")
        print(f"draw x={r.x0:7.2f} y={r.y0:7.2f} w={r.width:6.2f} h={r.height:6.2f} type={kind} fill={d.get('fill')}")