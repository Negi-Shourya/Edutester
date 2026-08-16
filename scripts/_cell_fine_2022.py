#!/usr/bin/env python3
"""Render a tiny region around one answer-key cell at 10x, skipping blank rows.
Usage: python scripts/_cell_fine_2022.py PAGE X0 Y0 X1 Y1 [thr]
"""
import sys
import fitz
import numpy as np
from PIL import Image

doc = fitz.open("neet/Neet_2022.pdf")
pno = int(sys.argv[1])
x0, y0, x1, y1 = map(float, sys.argv[2:6])
thr = int(sys.argv[6]) if len(sys.argv) > 6 else 170
page = doc[pno - 1]
pm = page.get_pixmap(matrix=fitz.Matrix(10, 10), clip=fitz.Rect(x0, y0, x1, y1), colorspace=fitz.csGRAY)
img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
arr = np.array(img)
dark = arr < thr
for i, row in enumerate(dark):
    line = "".join("#" if v else "." for v in row)
    if "#" in line:
        print(f"{i:3d} {line}")
doc.close()
