#!/usr/bin/env python3
"""OCR each option crop image; if it reads as text, the option is really text."""
import sys
import json
import os
import cv2

sys.stdout.reconfigure(encoding="utf-8")
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
data = json.load(open("neet-out/2022/questions_raw.json", encoding="utf-8"))
qs = {q["number"]: q for q in data["questions"]}
IMG = os.path.join("neet-out", "2022", "images")

for n in sorted(qs):
    q = qs[n]
    for o in q["options"]:
        if not o["image"]:
            continue
        p = os.path.join(IMG, o["image"])
        if not os.path.exists(p):
            continue
        img = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        res, _ = ocr(p)
        txt = " / ".join(l[1] for l in (res or []))
        print(f"Q{n} opt{o['label']} ({img.shape[1]}x{img.shape[0]}): {txt[:70]!r}")
