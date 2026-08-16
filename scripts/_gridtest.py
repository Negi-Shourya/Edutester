#!/usr/bin/env python3
"""Experimental: proper option-cell grid extraction + high-res OCR."""
import sys
import json
import os
import re
import cv2
import fitz
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
doc = fitz.open("neet/neet 2022.pdf")
data = json.load(open("neet-out/2022/questions_raw.json", encoding="utf-8"))
qs = {q["number"]: q for q in data["questions"]}
IMG = os.path.join("neet-out", "2022", "images")

LEFT_X = 700
OCR = 2.0


def ocr_region(pno, x0, y0, x1, y1, scale=8.0):
    r = fitz.Rect(x0 / OCR, y0 / OCR, x1 / OCR, y1 / OCR)
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
    cv2.imwrite("neet-out/2022/_g.png", bw)
    res, _ = ocr("neet-out/2022/_g.png")
    return " / ".join(l[1] for l in (res or []))


for n in sorted(qs):
    q = qs[n]
    imgs = [o["image"] for o in q["options"] if o["image"]]
    if not imgs:
        continue
    # derive rows from all markers (base OCR only)
    marks = []
    for o in q["options"]:
        pass  # we don't have marker positions in json
    # read back from OCR page json: find markers near question
    pno = q["page"]
    page = json.load(open(f"neet-out/2022/ocr/page_{pno:02d}.json", encoding="utf-8"))
    qy = None
    for d in page:
        m = re.match(rf"^{n}\\.", d["text"].strip())
        if m:
            qy = d["y0"]
            break
    if qy is None:
        continue
    markers = []
    for d in page:
        t = d["text"].strip()
        m = re.match(r"^\\(([1-4])\\)$", t)
        if m and qy - 10 <= d["y0"] <= qy + 900:
            markers.append((int(m.group(1)), d["x0"], d["y0"]))
    if not markers:
        continue
    # cluster rows
    ms = sorted(markers, key=lambda m: m[2])
    rows = []
    for num, x, y in ms:
        if rows and y - rows[-1][-1][2] < 45:
            rows[-1].append((num, x, y))
        else:
            rows.append([(num, x, y)])
    print(f"=== Q{n} p{pno} ans={q['answers']} rows={[[m[0] for m in r] for r in rows]}")
    print(f"   text: {q['text'][:70]}")
doc.close()
