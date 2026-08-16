#!/usr/bin/env python3
"""OCR the downloaded official NEET 2022 question paper PDF (scanned, no text layer)."""
import fitz
import os
import tempfile
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open("neet/neet2022_official_paper.pdf")
out = []
for pno in range(doc.page_count):
    page = doc[pno]
    pm = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5), colorspace=fitz.csRGB)
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
    out.append(f"\n{'='*70}\nPAGE {pno+1}\n{'='*70}")
    for y, x, text in lines:
        out.append(f"y={y:6.0f} x={x:6.0f} | {text}")
    print(f"page {pno+1} done", flush=True)

with open("neet-out/2022/official/ocr_dump.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
doc.close()
print("saved neet-out/2022/official/ocr_dump.txt", len(out), "lines")
