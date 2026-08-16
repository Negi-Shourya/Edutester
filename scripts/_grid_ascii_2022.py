#!/usr/bin/env python3
"""Render a page region as coarse ASCII with configurable threshold/zoom.
Usage: python scripts/_grid_ascii_2022.py PAGE X0 Y0 X1 Y1 [thr] [scale] [cpx]
"""
import sys
import fitz
import numpy as np
from PIL import Image

doc = fitz.open("neet/Neet_2022.pdf")
pno = int(sys.argv[1])
x0, y0, x1, y1 = map(float, sys.argv[2:6])
thr = int(sys.argv[6]) if len(sys.argv) > 6 else 140
scale = float(sys.argv[7]) if len(sys.argv) > 7 else 3.0
cpx = int(sys.argv[8]) if len(sys.argv) > 8 else 4
ch = max(2, cpx // 2)
page = doc[pno - 1]
pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=fitz.Rect(x0, y0, x1, y1), colorspace=fitz.csGRAY)
img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
arr = np.array(img)
dark = arr < thr
H = dark.shape[0] // ch
W = dark.shape[1] // cpx
for yy in range(H):
    row = ""
    for xx in range(W):
        block = dark[yy * ch:(yy + 1) * ch, xx * cpx:(xx + 1) * cpx]
        row += "#" if block.mean() > 0.08 else "."
    print(row)
doc.close()
