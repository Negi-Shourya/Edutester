#!/usr/bin/env python3
"""OCR of Q2's faint single-digit options with contrast boost."""
import sys
import os
import cv2
import fitz
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
doc = fitz.open("neet/neet 2022.pdf")

# Q2 p1: option markers (1)-(4) at y=1493,1542,1590,1639, x=358; content digit to the right
for n, my in [(1, 1493), (2, 1542), (3, 1590), (4, 1639)]:
    # cell: marker x 358-404, content x 404-500
    r = fitz.Rect(358 / 2, (my - 4) / 2, 520 / 2, (my + 14) / 2)
    pm = doc[0].get_pixmap(matrix=fitz.Matrix(8, 8), colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    # threshold to pure black/white
    _, bw = cv2.threshold(g, 190, 255, cv2.THRESH_BINARY)
    tmp = os.path.join("neet-out", "2022", "hi2.png")
    cv2.imwrite(tmp, bw)
    res, _ = ocr(tmp)
    print(f"Q2 opt{n}: ", end="")
    if res:
        print(" / ".join(f"{line[1]!r}" for line in res))
    else:
        print("(nothing)")
doc.close()
