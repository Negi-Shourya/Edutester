#!/usr/bin/env python3
"""Dump raw text of specific pages of the NEET 2023 booklet PDF.
Usage: python scripts/_dump_neet_2023_pages.py START END   (1-based page numbers)
E.g. the biology question pages are 1-11."""
import os
import sys
import fitz

PDF_PATH = os.path.join("neet", "2023 Neet.pdf")
MAX_Y = 795.0

sys.stdout.reconfigure(encoding="utf-8")

start = int(sys.argv[1]) - 1 if len(sys.argv) > 1 else 0
end = int(sys.argv[2]) if len(sys.argv) > 2 else start + 1

doc = fitz.open(PDF_PATH)
for pno in range(start, end):
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
