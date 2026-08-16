#!/usr/bin/env python3
"""Crop option cells for questions whose rendered math options the OCR
cannot read (Q40 truth tables, Q42/43 fractions, Q67/72/99 equations) and
save them as option images in neet-out/2022/images/ (Q{n}_opt{i}.png),
matching the seed script's convention."""
import json
import os
import re
import sys

import fitz

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open("neet/neet 2022.pdf")
raw = json.load(open("neet-out/2022/questions_raw.json", encoding="utf-8"))["questions"]
IMG = "neet-out/2022/images"
os.makedirs(IMG, exist_ok=True)

for n in [40, 42, 43, 67, 72, 99]:
    q = next(x for x in raw if x["number"] == n)
    page = q["page"]
    dets = json.load(open(f"neet-out/2022/ocr/page_{page:02d}.json", encoding="utf-8"))
    mk = next(d for d in dets if re.fullmatch(rf"{n}\.", d["text"].strip()))
    ans = next(d for d in dets if re.match(r"^Answer\s*\(", d["text"].strip()) and d["y0"] > mk["y0"])
    markers = [d for d in dets if re.match(r"^\([1-4]\)", d["text"].strip())
               and d["y0"] > mk["y0"] and d["y0"] < ans["y0"]]
    # drop duplicate markers (same y-band and column) keeping the leftmost
    seen = {}
    uniq = []
    for d in sorted(markers, key=lambda d: (round(d["y0"] / 20), round(d["x0"] / 200))):
        key = (round(d["y0"] / 20), round(d["x0"] / 200))
        if key not in seen:
            seen[key] = True
            uniq.append(d)
    markers = uniq
    markers.sort(key=lambda d: (round(d["y0"] / 30), d["x0"]))
    if len(markers) < 4:
        print(f"Q{n}: only {len(markers)} markers — skipping")
        continue
    # 2x2 grid or single column?
    xs = [d["x0"] for d in markers]
    two_col = any(d["x0"] > 700 for d in markers) and any(d["x0"] < 700 for d in markers)
    cells = []
    rows = {}
    for d in markers:
        ry = round(d["y0"] / 30)
        key = None
        for k in rows:
            if abs(k - ry) <= 1:
                key = k
                break
        if key is None:
            rows[ry] = [d]
        else:
            rows[key].append(d)
    for ry in sorted(rows):
        cells.extend(sorted(rows[ry], key=lambda x: x["x0"]))
    wrote = 0
    for i, d in enumerate(cells):
        below = [c["y0"] for c in cells if c["y0"] > d["y0"] + 5]
        yb = min(below) if below else ans["y0"]
        if two_col:
            xa, xb = (280, 700) if d["x0"] < 700 else (700, 1790)
        else:
            xa, xb = 280, 1790
        # widen a touch for breathing room
        r = fitz.Rect(xa / 2, (d["y0"] - 8) / 2, xb / 2, (yb - 4) / 2)
        pm = doc[page - 1].get_pixmap(matrix=fitz.Matrix(3, 3), clip=r)
        out = f"{IMG}/Q{n}_opt{i + 1}.png"
        pm.save(out)
        wrote += 1
    print(f"Q{n}: cropped {wrote} option cells -> {IMG}")
doc.close()
