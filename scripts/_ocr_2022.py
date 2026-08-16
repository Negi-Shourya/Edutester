#!/usr/bin/env python3
"""OCR pages of the scanned NEET 2022 PDF and print recognized text.

Usage: python scripts/_ocr_2022.py [start_page] [end_page]   (1-based)
Output: for each page, lines sorted by (top, left) with the recognized text.
"""
import sys
import fitz
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open("neet/Neet_2022.pdf")

start = int(sys.argv[1]) if len(sys.argv) > 1 else 1
end = int(sys.argv[2]) if len(sys.argv) > 2 else start

for pno in range(start - 1, min(end, doc.page_count)):
    page = doc[pno]
    pm = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5), colorspace=fitz.csRGB)
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        tmp = f.name
    pm.save(tmp)
    result, _ = engine(tmp)
    os.unlink(tmp)
    lines = []
    if result:
        for box, text, score in result:
            xs = [p[0] for p in box]
            ys = [p[1] for p in box]
            lines.append((min(ys), min(xs), text))
    lines.sort(key=lambda t: (round(t[0] / 8), t[1]))
    print(f"\n{'='*70}\nPAGE {pno+1}\n{'='*70}")
    for y, x, text in lines:
        print(f"y={y:6.0f} x={x:6.0f} | {text}")
doc.close()
