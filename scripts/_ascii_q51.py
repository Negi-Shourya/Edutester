#!/usr/bin/env python3
import sys
import fitz
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open("neet/neet 2022.pdf")


def page_gray(pno):
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(2, 2), colorspace=fitz.csGRAY)
    return np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)


def ascii_art(g, x0, y0, x1, y1, thr, cols=130, rows=60):
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


p10 = page_gray(10)
print("==== Q51 p10 y 320-800")
print(ascii_art(p10, 280, 320, 1780, 800, 210))
doc.close()
