#!/usr/bin/env python3
"""OCR the scanned NEET 2022 PDF (neet/neet 2022.pdf, no text layer).

Renders each embedded page image, runs RapidOCR, and saves:
  - neet-out/2022/ocr/page_XX.json  (full detections: box, text, score)
  - neet-out/2022/ocr/dump.txt      (readable, sorted by row/column)

Run:  python scripts/_ocr_neet2022.py
"""
import json
import os
import sys
import tempfile

import fitz
from rapidocr_onnxruntime import RapidOCR

PDF_PATH = os.path.join("neet", "neet 2022.pdf")
OUT_DIR = os.path.join("neet-out", "2022", "ocr")

engine = RapidOCR()
doc = fitz.open(PDF_PATH)
os.makedirs(OUT_DIR, exist_ok=True)

all_detections = {}
dump_lines = []

for pno in range(doc.page_count):
    page = doc[pno]
    # Use the embedded scan directly (1380x1730), upscaled a bit for OCR.
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), colorspace=fitz.csRGB)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        tmp = f.name
    pix.save(tmp)
    result, _ = engine(tmp)
    os.unlink(tmp)

    dets = []
    if result:
        for box, text, score in result:
            xs = [p[0] for p in box]
            ys = [p[1] for p in box]
            dets.append(
                {
                    "x0": min(xs),
                    "y0": min(ys),
                    "x1": max(xs),
                    "y1": max(ys),
                    "text": text,
                    "score": round(float(score), 3),
                }
            )
    all_detections[pno] = dets

    with open(os.path.join(OUT_DIR, f"page_{pno + 1:02d}.json"), "w", encoding="utf-8") as f:
        json.dump(dets, f, ensure_ascii=False, indent=1)

    dump_lines.append(f"\n{'=' * 70}\nPAGE {pno + 1} ({len(dets)} detections)\n{'=' * 70}")
    # Group into rows by y, then sort by x
    rows = sorted(dets, key=lambda d: (round(d["y0"] / 18), d["x0"]))
    for d in rows:
        dump_lines.append(
            f"y={d['y0']:6.0f} x={d['x0']:6.0f} x1={d['x1']:6.0f} s={d['score']:.2f} | {d['text']}"
        )
    print(f"page {pno + 1}: {len(dets)} detections", flush=True)

with open(os.path.join(OUT_DIR, "dump.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(dump_lines))

print(f"\nsaved {len(all_detections)} pages -> {os.path.abspath(OUT_DIR)}")
doc.close()
