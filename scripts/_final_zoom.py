#!/usr/bin/env python3
import os
import sys
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from extract_neet_2022 import (  # noqa: E402
    PDF_PATH, load_pages, parse_questions, recover_markers,
)

doc = fitz.open(PDF_PATH)

def ascii_page(pno, x0, y0, x1, y1, cols=90, thresh=215):
    f = 2.0
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(f, f), alpha=False)
    arr = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width, pm.n)
    sy, sx = max(0, int(y0)), max(0, int(x0))
    ey, ex = min(arr.shape[0], int(y1)), min(arr.shape[1], int(x1))
    gray = arr[sy:ey, sx:ex, 0]
    ink = gray < thresh
    rows = ink.shape[0]
    cell_h = max(1, rows // 26)
    out = []
    for r in range(0, rows, cell_h):
        block = ink[r:r + cell_h]
        line = ''
        step = max(1, block.shape[1] // cols)
        for c in range(0, block.shape[1], step):
            chunk = block[:, c:c + step]
            d = chunk.mean()
            line += '#' if d > 0.5 else ('+' if d > 0.25 else ('.' if d > 0.1 else ' '))
        out.append(line.rstrip())
    return '\n'.join(out)

from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
import cv2, os
from extract_neet_2022 import OUT_DIR

def ocr_rect(pno, rect, scale=10.0, thresh=195):
    f = 2.0
    r = fitz.Rect(rect[0] / f, rect[1] / f, rect[2] / f, rect[3] / f)
    r &= doc[pno - 1].rect
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, thresh, 255, cv2.THRESH_BINARY)
    tmp = os.path.join(OUT_DIR, "_fz.png")
    cv2.imwrite(tmp, bw)
    res, _ = ocr(tmp)
    return [l[1].strip() for l in (res or []) if l[1].strip()]

print('########## Q30 options (formulas?) ##########')
print(ascii_page(6, 300, 250, 1750, 480, cols=120))
print('OCR full region:', ocr_rect(6, (340, 265, 1750, 470)))

print('########## Q37 options ##########')
print(ascii_page(7, 300, 750, 1750, 900, cols=120))
print('OCR:', ocr_rect(7, (340, 755, 1750, 900), scale=12.0))

print('########## Q3 opt4 (104π vs 10⁴π) ##########')
print(ascii_page(1, 410, 1980, 560, 2030, cols=60))

print('########## Q17 opt3/opt4 ##########')
print(ascii_page(4, 340, 795, 1760, 905, cols=120))

doc.close()
