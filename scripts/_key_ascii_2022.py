#!/usr/bin/env python3
"""Render an answer-key grid region of the NEET 2022 booklet as ASCII art."""
import sys
import fitz
import numpy as np
from PIL import Image

doc = fitz.open("neet/Neet_2022.pdf")
page = doc[int(sys.argv[1]) - 1]
scale = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
y0f = float(sys.argv[3]) if len(sys.argv) > 3 else 0.30
y1f = float(sys.argv[4]) if len(sys.argv) > 4 else 0.42
pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csGRAY)
img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
w, h = img.size
crop = np.array(img.crop((0, int(h * y0f), w, int(h * y1f))))
dark = crop < 140
# downsample to ascii: 3 px per char horizontally, 2 px vertically
ch, cw = 2, 3
H = dark.shape[0] // ch
W = dark.shape[1] // cw
out = []
for yy in range(H):
    row = ""
    for xx in range(W):
        block = dark[yy * ch:(yy + 1) * ch, xx * cw:(xx + 1) * cw]
        row += "#" if block.mean() > 0.12 else "."
    out.append(row)
for r in out:
    print(r)
doc.close()
