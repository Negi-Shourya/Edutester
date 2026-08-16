#!/usr/bin/env python3
import sys, os
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))

PDF = 'neet/neet 2022.pdf'
doc = fitz.open(PDF)

def ascii_region(pno, x0, y0, x1, y1, scale=1.0, cols=100, thresh=225):
    """OCR coords (2x) -> slice of a full-page 2x render."""
    f = 2.0
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(f * scale, f * scale), alpha=False)
    arr = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width, pm.n)
    H, W = arr.shape[:2]
    sx, sy = int(x0 * scale), int(y0 * scale)
    ex, ey = int(x1 * scale), int(y1 * scale)
    sy = max(0, sy); sx = max(0, sx)
    ey = min(H, ey); ex = min(W, ex)
    gray = arr[sy:ey, sx:ex, 0]
    ink = gray < thresh
    rows = ink.shape[0]
    cell_h = max(1, rows // 24)
    out = []
    for r in range(0, rows, cell_h):
        block = ink[r:r + cell_h]
        line = ''
        step = max(1, block.shape[1] // cols)
        for c in range(0, block.shape[1], step):
            chunk = block[:, c:c + step]
            density = chunk.mean()
            if density > 0.55:
                line += '#'
            elif density > 0.3:
                line += '+'
            elif density > 0.12:
                line += '.'
            else:
                line += ' '
        out.append(line.rstrip())
    return '\n'.join(out)

# Q8 on page 3, option region y 450-600 (OCR coords), full width
print(ascii_region(3, 280, 440, 1800, 600))
doc.close()
