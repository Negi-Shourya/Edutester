#!/usr/bin/env python3
import sys, os
import cv2
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from extract_neet_2022 import OCR_SCALE, OUT_DIR

doc = fitz.open('neet/neet 2022.pdf')

def save_crop(pno, rect_ocr, fn, scale=10.0, thresh=200):
    f = OCR_SCALE
    r = fitz.Rect(rect_ocr[0] / f, rect_ocr[1] / f, rect_ocr[2] / f, rect_ocr[3] / f)
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, thresh, 255, cv2.THRESH_BINARY)
    cv2.imwrite(os.path.join(OUT_DIR, fn), bw)
    return pm

# Q3 opt1: marker y 1835-1871, content until next marker at 1885
pm = save_crop(1, (400, 1840, 700, 1882), '_q3opt1.png', scale=12.0)
print('saved', pm.width, 'x', pm.height)

from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
res, _ = ocr(os.path.join(OUT_DIR, '_q3opt1.png'))
for r in (res or []):
    print(repr(r[1]))

doc.close()
