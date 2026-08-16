#!/usr/bin/env python3
"""High-resolution verify the printed 'Answer (N)' digits in the NEET 2022
scan for a set of questions, comparing against the raw extraction values."""
import json
import os
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

ocr = {}
for fn in os.listdir("neet-out/2022/ocr"):
    m = re.match(r"page_(\d+)\.json$", fn)
    if m:
        ocr[int(m.group(1))] = json.load(open("neet-out/2022/ocr/" + fn, encoding="utf-8"))

conf = [11, 12, 16, 19, 21, 31, 32, 33, 35, 41, 42, 43, 45, 55, 95, 108, 140, 141,
        155, 175, 191, 192, 6, 30, 51, 53, 69, 94, 100]
for n in conf:
    q = next(x for x in raw if x["number"] == n)
    page = q["page"]
    dets = ocr.get(page, [])
    if not dets:
        print(f"Q{n}: page {page} has no OCR")
        continue
    # all answer-like detections on the page, ordered by y
    ans = [d for d in dets if re.match(r"^Answer\s*\(", d["text"].strip())]
    if not ans:
        print(f"Q{n}: page {page} no answer line")
        continue
    # pick the answer line that follows this question's marker (or, if the
    # marker is missing, the k-th answer line by order on the page)
    marks = [d for d in dets if re.fullmatch(rf"{n}\.", d["text"].strip())]
    a = None
    if marks:
        mk = sorted(marks, key=lambda d: d["y0"])[0]
        below = [d for d in ans if d["y0"] > mk["y0"] - 10]
        a = sorted(below, key=lambda d: d["y0"])[0] if below else None
    if a is None:
        # fall back: nth answer line on the page (questions flow top to bottom)
        order = [q2["number"] for q2 in raw if q2["page"] == page]
        if n in order:
            idx = order.index(n)
            if idx < len(ans):
                a = sorted(ans, key=lambda d: d["y0"])[idx]
    if a is None:
        print(f"Q{n}: page {page} could not locate answer line")
        continue
    x0, y0, x1, y1 = a["x0"], a["y0"], a["x1"], a["y1"]
    r = fitz.Rect(max(x0 - 20, 0) / 2, max(y0 - 20, 0) / 2, min(x1 + 900, 1900) / 2, (y1 + 25) / 2)
    pm = doc[page - 1].get_pixmap(matrix=fitz.Matrix(8, 8), colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
    tmp = f"neet-out/2022/_ans_{n}.png"
    cv2.imwrite(tmp, bw)
    res, _ = ocr_engine(tmp)
    hi = " ".join(l[1] for l in (res or []))
    m2 = re.search(r"[Aa]nswer?\s*[\(（]?\s*([1-4])", hi)
    hi_digit = m2.group(1) if m2 else ("?" + hi[:40])
    raw_ans = q["answers"][0] if q["answers"] else None
    flag = "" if (raw_ans is not None and str(raw_ans) == str(hi_digit)) else "  <<< DIFF"
    print(f"Q{n}: raw={raw_ans} hi={hi_digit}{flag}")

doc.close()
