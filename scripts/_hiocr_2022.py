#!/usr/bin/env python3
"""High-res OCR of option cells to recover tiny text (digits/letters)."""
import sys
import os
import fitz
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
doc = fitz.open("neet/neet 2022.pdf")

# Q8 p3: option row1 markers at y~480 (1)@358 (2)@1047 ; text next to markers
# Q2 p1: option markers at y 1493-1639 x=358; single-digit content
# Q6 p2: marker (3) at y=1558 x=363
tests = [
    ("Q8 opt1 cell", 3, 358, 478, 420, 500, 1150),      # (1) C
    ("Q8 opt3 cell", 3, 359, 527, 420, 549, 1150),      # (3) A
    ("Q2 opt1 cell", 1, 358, 1491, 420, 1513, 1150),    # (1) 3
    ("Q6 marker(3) cell", 2, 363, 1556, 425, 1578, 1150),
]


def cell_gray(pno, mx, my, cx, cy, x1, scale=6.0):
    """mx,my: marker pos; cx,cy: content origin; x1: right bound (all OCR coords=2x pts)."""
    # convert to pdf points
    def to_pts(v):
        return v / 2.0
    r = fitz.Rect(to_pts(min(mx, cx)), to_pts(my - 2), to_pts(x1), to_pts(cy + 4))
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csGRAY, clip=r)
    return np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)


for label, pno, mx, my, cx, cy, x1 in tests:
    g = cell_gray(pno, mx, my, cx, cy, x1)
    tmp = os.path.join("neet-out", "2022", "hi.png")
    import cv2
    cv2.imwrite(tmp, g)
    res, _ = ocr(tmp)
    print(f"==== {label} (cell {g.shape[1]}x{g.shape[0]}px)")
    if res:
        for line in res:
            print("   ", repr(line[1]), line[2])
    else:
        print("    (nothing)")
doc.close()
