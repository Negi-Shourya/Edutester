#!/usr/bin/env python3
"""Render a single grid cell of an answer-key page as fine ASCII art.

Usage: python scripts/_cell_ascii_2022.py PAGE X0 Y0 X1 Y1  (page coords, 1-based page)
Crop is in PDF points; rendered at 6x with 1px-per-char ASCII.
"""
import sys
import fitz
import numpy as np
from PIL import Image

doc = fitz.open("neet/Neet_2022.pdf")
pno = int(sys.argv[1])
x0, y0, x1, y1 = map(float, sys.argv[2:6])
page = doc[pno - 1]
pm = page.get_pixmap(matrix=fitz.Matrix(6, 6), clip=fitz.Rect(x0, y0, x1, y1), colorspace=fitz.csGRAY)
img = Image.frombytes("L", (pm.width, pm.height), pm.samples)
arr = np.array(img)
dark = arr < 140
for row in dark:
    print("".join("#" if v else "." for v in row))
doc.close()
