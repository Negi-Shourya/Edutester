#!/usr/bin/env python3
"""Crop the answer-key grid regions of the NEET 2022 booklet pages and OCR
them at high resolution so the answer letters can be read.

The grids sit on: p11 (bio 1-100), p19 (chem 1-50), p26 (physics 1-50).
Grids roughly occupy the lower ~60% of the page below the 'Answer Key' title.
"""
import sys
import fitz
import numpy as np
from PIL import Image, ImageOps, ImageFilter
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open("neet/Neet_2022.pdf")

TARGETS = {11: 1, 19: 1, 26: 1}  # page -> scale multiplier on top of 3x

for pno in [11, 19, 26]:
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(3, 3), colorspace=fitz.csGRAY)
    img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
    # Answer key region: below title (~y=450 at 3x for p11), above footer
    w, h = img.size
    if pno == 11:
        crop = img.crop((0, int(h * 0.30), w, int(h * 0.95)))
    elif pno == 19:
        crop = img.crop((0, int(h * 0.55), w, h))
    else:
        crop = img.crop((0, int(h * 0.20), w, h))
    crop = ImageOps.autocontrast(crop)
    crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
    crop = crop.point(lambda p: 255 if p > 150 else 0)
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        tmp = f.name
    crop.save(tmp)
    result, _ = engine(tmp)
    os.unlink(tmp)
    print(f"\n{'='*60}\nPAGE {pno} answer-key OCR\n{'='*60}")
    if result:
        rows = []
        for box, text, score in result:
            xs = [p[0] for p in box]
            ys = [p[1] for p in box]
            rows.append((min(ys), min(xs), text))
        rows.sort(key=lambda t: (round(t[0] / 30), t[1]))
        for y, x, text in rows:
            print(f"y={y:6.0f} x={x:6.0f} | {text}")
doc.close()
