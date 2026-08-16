#!/usr/bin/env python3
"""Character-level dump for the Q39 options region (page 22, y 555-585)."""
import os
import sys
import fitz

PDF_PATH = os.path.join("neet", "2023 Neet.pdf")
sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open(PDF_PATH)
page = doc[21]
d = page.get_text("rawdict")
items = []
for block in d["blocks"]:
    if block["type"] != 0:
        continue
    for line in block["lines"]:
        for span in line["spans"]:
            for ch in span["chars"]:
                b = ch["bbox"]
                if 80 <= b[0] < 270 and 550 <= b[1] < 590:
                    items.append((round(b[1], 1), round(b[0], 1),
                                  round(span["size"], 1), ch["c"]))
for y, x, size, c in sorted(items):
    print(f"y={y:6.1f} x={x:6.1f} size={size:4.1f} | {c!r}")
doc.close()
