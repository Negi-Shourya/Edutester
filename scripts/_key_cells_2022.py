#!/usr/bin/env python3
"""Read the answer letters in the NEET 2022 answer-key grids cell by cell.

Strategy: OCR the grid at high res once to get the question-number positions,
then for each number cell crop the region directly below the number (where the
answer letter sits) and OCR that tiny crop with heavy upscaling + thresholding.
"""
import sys
import fitz
import os
import tempfile
import numpy as np
from PIL import Image, ImageOps
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open("neet/Neet_2022.pdf")


def ocr(img_pil):
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        tmp = f.name
    img_pil.save(tmp)
    result, _ = engine(tmp)
    os.unlink(tmp)
    return result


def read_grid(page, scale=3.0, y0frac=0.30, y1frac=0.96):
    """Return dict num -> letter for the grid on this page."""
    page = doc[page - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csGRAY)
    img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
    w, h = img.size
    grid = img.crop((0, int(h * y0frac), w, int(h * y1frac)))
    grid = ImageOps.autocontrast(grid)
    # find numbers
    res = ocr(grid)
    nums = []
    if res:
        for box, text, score in res:
            if text.strip().isdigit() or text.strip().lower() == "none":
                xs = [p[0] for p in box]
                ys = [p[1] for p in box]
                nums.append((min(ys), min(xs), text.strip()))
    # group by row (y tolerance ~36 at this scale)
    nums.sort(key=lambda t: (t[0], t[1]))
    rows = {}
    for y, x, t in nums:
        key = round(y / 36)
        rows.setdefault(key, []).append((x, t))
    out = {}
    for key, items in rows.items():
        items.sort()
        for x, t in items:
            if t.lower() == "none":
                # 'none' spans a wider cell; try to find its number to the left
                continue
            n = int(t)
            # letter sits below the number: crop (x-2, y+18, x+34, y+52) in grid coords
            cell = grid.crop((max(0, x - 3), max(0, key * 36 + 20), x + 40, key * 36 + 56))
            cell = cell.resize((cell.width * 4, cell.height * 4), Image.LANCZOS)
            cell = ImageOps.autocontrast(cell)
            cell = cell.point(lambda p: 255 if p > 140 else 0)
            lres = ocr(cell)
            letter = ""
            if lres:
                for box, text, score in lres:
                    letter += text.strip()
            out[n] = letter if letter else "?"
    return out


for pno, (y0, y1) in [(11, (0.30, 0.96)), (19, (0.55, 0.98)), (26, (0.20, 0.96))]:
    key = read_grid(pno, y0frac=y0, y1frac=y1)
    print(f"\n=== PAGE {pno} answer key ===")
    for n in sorted(key):
        print(f"{n}:{key[n]}", end="  ")
        if n % 10 == 0:
            print()
    print()
doc.close()
