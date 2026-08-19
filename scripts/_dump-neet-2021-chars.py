#!/usr/bin/env python3
"""Char-level dump of NEET 2021 PDF pages: visual lines with markup."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
import fitz
from extract_neet_2021 import collect_chars, build_lines, line_markup2, line_plain, col_of_vline

sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open("neet/neet 2021 question paper.pdf")
pages = [int(x) for x in sys.argv[1:]] or [4, 5]
for pno in pages:
    page = doc[pno - 1]
    print("=" * 30, "PAGE", pno, "=" * 30)
    chars = collect_chars(page)
    xs = sorted(c.x0 for c in chars if 45 < c.oy < 770)
    split = None
    for i in range(len(xs) - 1):
        if 250 < xs[i] < 430 and xs[i + 1] - xs[i] > 9:
            split = 305.0
    lines = build_lines(chars, split_chars=split)
    for v in lines:
        v.col = col_of_vline(v, split)
    for v in lines:
        if v.skip:
            continue
        raw = line_plain(v)
        if not raw.strip():
            continue
        markup = line_markup2(v)
        print(f"[{v.col}] x0={v.x0:6.1f} x1={v.x1:6.1f} y0={v.y0:6.1f} | {markup}")
    print()
