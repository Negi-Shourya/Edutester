#!/usr/bin/env python3
"""Analyze the pixel structure of the answer-key grid on a given page.
Prints connected components (dark blobs) with their bounding boxes so the
layout of numbers vs answer letters becomes clear."""
import sys
import fitz
import numpy as np
from PIL import Image
from scipy import ndimage

doc = fitz.open("neet/Neet_2022.pdf")
page = doc[int(sys.argv[1]) - 1]
scale = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csGRAY)
img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
w, h = img.size
y0, y1 = (int(h * float(sys.argv[3])), int(h * float(sys.argv[4]))) if len(sys.argv) > 4 else (0, h)
crop = np.array(img.crop((0, y0, w, y1)))
dark = crop < 140
lab, n = ndimage.label(dark)
print(f"components: {n}")
comps = ndimage.find_objects(lab)
items = []
for i, sl in enumerate(comps):
    ys, xs = sl
    bh = ys.stop - ys.start
    bw = xs.stop - xs.start
    if bh < 4 or bw < 4:
        continue
    items.append((ys.start, xs.start, bw, bh))
items.sort()
for y, x, bw, bh in items:
    print(f"y={y:5d} x={x:5d} w={bw:3d} h={bh:3d}")
doc.close()
