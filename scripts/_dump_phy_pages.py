#!/usr/bin/env python3
"""Dump the raw text of the NEET 2023 physics question pages (0-indexed 18-22)
in left/right column reading order so we can read exact stems/options."""
import os
import sys
import fitz

PDF_PATH = os.path.join("neet", "2023 Neet.pdf")
MAX_Y = 795.0

sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open(PDF_PATH)
for pno in range(18, 23):
    page = doc[pno]
    d = page.get_text("rawdict")
    items = []  # (y, x, text)
    for block in d["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            text = ""
            for span in line["spans"]:
                for ch in span["chars"]:
                    t = ch["c"]
                    if t and not t.isspace() and ch["bbox"][1] < MAX_Y:
                        text += t
            if text.strip():
                items.append((line["bbox"][1], line["bbox"][0], text))
    items.sort(key=lambda t: (t[0], t[1]))
    print(f"\n{'='*70}\nPAGE {pno+1}\n{'='*70}")
    for y, x, text in items:
        print(f"y={y:6.1f} x={x:6.1f} | {text}")
doc.close()
