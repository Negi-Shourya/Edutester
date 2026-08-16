#!/usr/bin/env python3
"""OCR answer-key grids at high resolution with low thresholds, dumping ALL
detections (including tiny text) with boxes."""
import sys
import fitz
import os
import tempfile
import numpy as np
from PIL import Image, ImageOps
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open("neet/Neet_2022.pdf")

for pno in [11, 19, 26]:
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(6, 6), colorspace=fitz.csGRAY)
    img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
    # grid region per page (page-relative)
    if pno == 11:
        crop = img.crop((0, int(img.height * 0.20), img.width, int(img.height * 0.97)))
    elif pno == 19:
        crop = img.crop((0, int(img.height * 0.50), img.width, img.height))
    else:
        crop = img.crop((0, int(img.height * 0.15), img.width, img.height))
    crop = ImageOps.autocontrast(crop)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        tmp = f.name
    crop.save(tmp)
    result, _ = engine(tmp)
    os.unlink(tmp)
    print(f"\n{'='*60}\nPAGE {pno} grid OCR @6x ({result and len(result) or 0} detections)\n{'='*60}")
    if result:
        rows = []
        for box, text, score in result:
            xs = [p[0] for p in box]
            ys = [p[1] for p in box]
            rows.append((min(ys), min(xs), text, max(ys) - min(ys)))
        rows.sort(key=lambda t: (round(t[0] / 30), t[1]))
        for y, x, text, h in rows:
            print(f"y={y:6.0f} x={x:6.0f} h={h:4.0f} | {text}")
doc.close()
