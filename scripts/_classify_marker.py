#!/usr/bin/env python3
"""Classify the 26 image-option questions: text (OCR recoverable) vs genuine
image (graph/structure). Discriminator: content on the marker's own line.
"""
import json
import os
import re
import sys

import cv2
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from extract_neet_2022 import (  # noqa: E402
    PDF_PATH, OCR_DIR, OUT_DIR, IMG_DIR, OCR_SCALE, LEFT_X, PAGE_H,
    load_pages, parse_questions, crop_region,
)

IMGQ = [2, 3, 6, 7, 8, 13, 17, 24, 30, 37, 51, 53, 65, 66, 69, 71, 94, 100,
        120, 124, 130, 148, 166, 187, 195, 196]


def ocr_region(doc, pno, rect_ocr, ocr_engine, scale=8.0):
    """OCR an OCR-coord rect; returns list of (box, text)."""
    f = OCR_SCALE
    r = fitz.Rect(rect_ocr[0] / f, rect_ocr[1] / f,
                  rect_ocr[2] / f, rect_ocr[3] / f)
    r &= doc[pno - 1].rect
    if r.is_empty or r.width < 12 or r.height < 8:
        return []
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
    tmp = os.path.join(OUT_DIR, "_cls.png")
    cv2.imwrite(tmp, bw)
    res, _ = ocr_engine(tmp)
    out = []
    for line in (res or []):
        t = line[1].strip()
        if t:
            out.append((line[0], t))
    return out


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    pages = load_pages()
    doc = fitz.open(PDF_PATH)
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()

    questions = parse_questions(pages)
    # run recover_markers + text-band pass like the extractor so markers exist
    from extract_neet_2022 import recover_markers, option_cell_rects
    for q in questions:
        if q.number in IMGQ:
            recover_markers(q, doc, ocr_engine)

    for q in questions:
        if q.number not in IMGQ:
            continue
        print(f"=== Q{q.number} (p{q.page}) ===")
        cells = option_cell_rects(q)
        for n in range(1, 5):
            o = q.options.get(n)
            if not o:
                print(f"  ({n}) NO MARKER")
                continue
            m = o["marker"]
            x0, y0 = m["x0"], m["y0"]
            x1, y1 = m["x1"], m["y1"]
            mh = max(y1 - y0, 24)
            # marker-line band: right of marker (overlap a bit), marker line height
            band = (min(x1 - 4, 1980), y0 - 6, min(x1 - 4 + 300, 1980), y0 + mh + 10)
            hits = ocr_region(doc, q.page, band, ocr_engine)
            line_txt = " | ".join(t for _, t in hits)
            kind = "TEXT" if line_txt.strip() else "image?"
            print(f"  ({n}) y={y0}-{y1} {kind}: {line_txt[:70]}")
    doc.close()


if __name__ == "__main__":
    main()
