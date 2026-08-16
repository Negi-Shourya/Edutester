#!/usr/bin/env python3
"""ASCII-art view of Q6 (p2) and Q8 (p3) regions (2x render = OCR coords)."""
import sys
import fitz
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open("neet/neet 2022.pdf")


def page_gray(pno):
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(2, 2), colorspace=fitz.csGRAY)
    return np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)


def ascii_art(g, x0, y0, x1, y1, thr, cols=120, rows=48):
    g = g[y0:y1, x0:x1]
    h, w = g.shape
    out = []
    for r in range(rows):
        ya = int(r * h / rows)
        yb = int((r + 1) * h / rows)
        line = ""
        for c in range(cols):
            xa = int(c * w / cols)
            xb = int((c + 1) * w / cols)
            v = g[ya:yb, xa:xb].min()
            line += "#" if v < thr else ("." if v < 235 else " ")
        out.append(line)
    return "\n".join(out)


p2 = page_gray(2)
p3 = page_gray(3)

for label, g, (x0, y0, x1, y1) in [
    ("Q6 p2 full region", p2, (280, 1210, 1780, 1740)),
    ("Q8 p3 full region", p3, (280, 190, 1780, 580)),
]:
    sub = g[y0:y1, x0:x1]
    print(f"==== {label}  shape={sub.shape} mean={sub.mean():.0f} min={sub.min()} thr<205 frac={(sub<205).mean():.4f}")
    print(ascii_art(g, x0, y0, x1, y1, 205))
    print()
doc.close()
