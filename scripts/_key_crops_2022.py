#!/usr/bin/env python3
"""Render the answer-key grid regions of NEET 2022 booklet pages at high
resolution and save them (plus full pages) for visual inspection."""
import fitz
import os

os.makedirs("neet-out/2022/_keys", exist_ok=True)
doc = fitz.open("neet/Neet_2022.pdf")

# full-page renders at 300 dpi for the three answer-key pages
for pno in [11, 19, 26]:
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(4, 4))
    pm.save(f"neet-out/2022/_keys/p{pno:02d}_full.png")
    # answer grid crops (page-relative fractions, tuned per page)
    if pno == 11:
        rects = [(0.12, 0.24, 0.90, 0.78), (0.12, 0.62, 0.90, 0.92)]
    elif pno == 19:
        rects = [(0.12, 0.52, 0.90, 0.90)]
    else:
        rects = [(0.12, 0.18, 0.90, 0.62), (0.12, 0.55, 0.90, 0.90)]
    w, h = page.rect.width, page.rect.height
    for i, (x0, y0, x1, y1) in enumerate(rects):
        clip = fitz.Rect(w * x0, h * y0, w * x1, h * y1)
        pm = page.get_pixmap(matrix=fitz.Matrix(4, 4), clip=clip)
        pm.save(f"neet-out/2022/_keys/p{pno:02d}_crop{i}.png")

doc.close()
print("saved crops to neet-out/2022/_keys/")
