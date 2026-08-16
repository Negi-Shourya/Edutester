#!/usr/bin/env python3
"""Analyze option-region layout via connected components (ink blobs)."""
import sys
import fitz
import numpy as np
from scipy import ndimage

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open("neet/neet 2022.pdf")

OCR_SCALE = 2.0
RENDER = 2.0  # render scale
s = RENDER / OCR_SCALE


def region_gray(pno, x0, y0, x1, y1):
    r = fitz.Rect(x0 / s, y0 / s, x1 / s, y1 / s)
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(RENDER, RENDER), colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    return g


def components(g, thr=205):
    mask = g < thr
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    comps = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(ys) < 8:
            continue
        comps.append((xs.min(), ys.min(), xs.max(), ys.max(), len(ys)))
    return comps


for label, pno, (x0, y0, x1, y1) in [
    ("Q6 opt region p2", 2, (280, 1280, 1780, 1735)),
    ("Q8 opt region p3", 3, (280, 210, 1780, 575)),
]:
    g = region_gray(pno, x0, y0, x1, y1)
    comps = components(g)
    comps.sort(key=lambda c: (c[1], c[0]))
    print(f"==== {label}: {len(comps)} components (render-scale px, orig y + {y0})")
    for c in comps[:80]:
        print(f"  x={c[0]+x0*s:.0f}-{c[2]+x0*s:.0f}  y={c[1]+y0*s:.0f}-{c[3]+y0*s:.0f}  n={c[4]}")
doc.close()
