#!/usr/bin/env python3
"""Crop option cells below the marker and render ASCII for visual inspection."""
import sys, os
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))

DOC = fitz.open('neet/neet 2022.pdf')

def ascii_region(pno, x0, y0, x1, y1, cols=90, thresh=215):
    f = 2.0
    pm = DOC[pno - 1].get_pixmap(matrix=fitz.Matrix(f, f), alpha=False)
    arr = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width, pm.n)
    H, W = arr.shape[:2]
    sy, sx = max(0, int(y0)), max(0, int(x0))
    ey, ex = min(H, int(y1)), min(W, int(x1))
    gray = arr[sy:ey, sx:ex, 0]
    ink = gray < thresh
    rows = ink.shape[0]
    cell_h = max(1, rows // 22)
    out = []
    for r in range(0, rows, cell_h):
        block = ink[r:r + cell_h]
        line = ''
        step = max(1, block.shape[1] // cols)
        for c in range(0, block.shape[1], step):
            chunk = block[:, c:c + step]
            density = chunk.mean()
            if density > 0.5:
                line += '#'
            elif density > 0.25:
                line += '+'
            elif density > 0.1:
                line += '.'
            else:
                line += ' '
        out.append(line.rstrip())
    return '\n'.join(out)

# (qno, page, [(opt, x0, y0, x1, y1)]) in OCR coords, cell content below marker
TARGETS = {
    3: (1, [(1, 340, 1870, 700, 1990)]),
    17: (4, [(3, 340, 820, 1750, 1100), (4, 340, 820, 1750, 1100)]),
    24: (5, [(1, 340, 720, 1750, 830), (2, 340, 720, 1750, 830)]),
    30: (6, [(1, 340, 280, 1750, 480), (2, 340, 280, 1750, 480), (3, 340, 390, 1750, 520)]),
    37: (7, [(1, 340, 760, 1750, 940), (2, 340, 760, 1750, 940)]),
    53: (10, [(1, 340, 1460, 1750, 1660), (2, 340, 1460, 1750, 1660)]),
    66: (13, [(1, 340, 1040, 1750, 1280)]),
    94: (19, [(2, 340, 820, 1750, 1000), (3, 340, 960, 1750, 1120), (4, 340, 960, 1750, 1120)]),
    100: (20, [(1, 340, 1640, 1750, 1800), (2, 340, 1640, 1750, 1800)]),
    13: (3, [(1, 340, 1710, 1750, 1840), (2, 340, 1710, 1750, 1840)]),
}

for qno, (page, cells) in TARGETS.items():
    print(f'########## Q{qno} page {page} ##########')
    for opt, x0, y0, x1, y1 in cells:
        print(f'--- opt{opt} ---')
        print(ascii_region(page, x0, y0, x1, y1))
    print()

DOC.close()
