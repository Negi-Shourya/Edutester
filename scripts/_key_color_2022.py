#!/usr/bin/env python3
"""Check for colored content in the answer-key grid regions (answers might be
printed in a color that disappears in grayscale)."""
import sys
import fitz
import numpy as np
from PIL import Image

doc = fitz.open("neet/Neet_2022.pdf")
for pno in [11, 19, 26]:
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(3, 3), colorspace=fitz.csRGB)
    img = Image.frombytes("RGB", (pm.width, pm.height), pm.samples)
    arr = np.array(img).astype(int)
    h, w, _ = arr.shape
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    lum = (r + g + b) / 3
    dark = lum < 160
    # saturation: max-min channel
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    sat = mx - mn
    colored = dark & (sat > 40)
    print(f"p{pno}: colored px = {colored.sum()} ({(100.0*colored.sum()/(h*w)):.3f}%)")
    # where are colored pixels located (row bands)?
    if colored.sum() > 50:
        rows = colored.sum(axis=1)
        ys = np.nonzero(rows > 0)[0]
        if len(ys):
            # cluster
            bands = []
            start = ys[0]
            prev = ys[0]
            for y in ys[1:]:
                if y - prev > 20:
                    bands.append((start, prev))
                    start = y
                prev = y
            bands.append((start, prev))
            print("  colored row bands (px at 3x):", [(int(a), int(b)) for a, b in bands][:20])
doc.close()
