#!/usr/bin/env python3
"""Render NEET 2022 pages and analyze ink layout to determine structure."""
import sys
import fitz
from PIL import Image
import numpy as np
import os

os.makedirs("neet-out/2022/_probe", exist_ok=True)

doc = fitz.open("neet/Neet_2022.pdf")

def ink_stats(page, zoom=1.5):
    pm = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), colorspace=fitz.csGRAY)
    arr = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    dark = arr < 128
    total = dark.sum()
    rows = dark.sum(axis=1)
    cols = dark.sum(axis=0)
    return total, rows, cols, pm.width, pm.height

for pno in range(doc.page_count):
    page = doc[pno]
    total, rows, cols, w, h = ink_stats(page)
    pct = 100.0 * total / (w * h)
    # column analysis: split ink column sums into left/right halves
    half = w // 2
    left = cols[:half].sum()
    right = cols[half:].sum()
    # text bands: rows with substantial ink
    band_thresh = max(3, w * 0.02)
    bands = (rows > band_thresh).sum()
    # save the page png for later inspection
    pm = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
    pm.save(f"neet-out/2022/_probe/p{pno+1:02d}.png")
    print(f"p{pno+1:>2}: ink={pct:5.2f}% rows={rows.sum():>7d} left={left:>6d} right={right:>6d} bands={bands:>4d}")

doc.close()
print("saved page renders to neet-out/2022/_probe/")
