#!/usr/bin/env python3
"""Crop the option cells of given 2022 questions from the scan and OCR them
at high resolution, to recover option text the normal pass garbled."""
import json
import re
import sys

import cv2
import fitz
import numpy as np
from rapidocr_onnxruntime import RapidOCR

sys.stdout.reconfigure(encoding="utf-8")
ocr_engine = RapidOCR()
doc = fitz.open("neet/neet 2022.pdf")
raw = json.load(open("neet-out/2022/questions_raw.json", encoding="utf-8"))["questions"]

for n in [int(x) for x in sys.argv[1:]]:
    q = next(x for x in raw if x["number"] == n)
    page = q["page"]
    dets = json.load(open(f"neet-out/2022/ocr/page_{page:02d}.json", encoding="utf-8"))
    mk = next(d for d in dets if re.fullmatch(rf"{n}\.", d["text"].strip()))
    ans = next(d for d in dets if re.match(r"^Answer\s*\(", d["text"].strip()) and d["y0"] > mk["y0"])
    markers = [d for d in dets if re.match(r"^\([1-4]\)\s*$", d["text"].strip())
               and d["y0"] > mk["y0"] and d["y0"] < ans["y0"]]
    markers.sort(key=lambda d: (round(d["y0"] / 30), d["x0"]))
    if len(markers) < 4:
        print(f"Q{n}: only {len(markers)} option markers found")
        continue
    # group into rows of two (left/right)
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
    cells = []
    for ry in sorted(rows):
        for d in sorted(rows[ry], key=lambda x: x["x0"]):
            cells.append(d)
    print(f"== Q{n} (page {page}, raw answer {q['answers']})")
    ys = [c["y0"] for c in cells]
    for i, d in enumerate(cells):
        below = [c["y0"] for c in cells if c["y0"] > d["y0"] + 5]
        yb = min(below) if below else ans["y0"]
        xa, xb = (280, 700) if d["x0"] < 700 else (700, 1790)
        r = fitz.Rect(xa / 2, (d["y0"] - 6) / 2, xb / 2, (yb - 3) / 2)
        pm = doc[page - 1].get_pixmap(matrix=fitz.Matrix(8, 8), colorspace=fitz.csGRAY, clip=r)
        g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
        _, bw = cv2.threshold(g, 190, 255, cv2.THRESH_BINARY)
        fn = f"neet-out/2022/_opt_q{n}_{i + 1}.png"
        cv2.imwrite(fn, bw)
        res, _ = ocr_engine(fn)
        print(f"  opt{i + 1} ({d['text']}):", [l[1] for l in (res or [])])
doc.close()
