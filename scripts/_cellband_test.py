#!/usr/bin/env python3
"""OCR a taller band (marker line + ~2 lines below) per option cell."""
import os
import sys

import cv2
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from extract_neet_2022 import (  # noqa: E402
    PDF_PATH, OUT_DIR, OCR_SCALE, LEFT_X,
    load_pages, parse_questions, recover_markers,
)

STUBBORN = [2, 3, 8, 17, 24, 37, 53, 69, 94, 100, 13]


def band_ocr(doc, pno, rect, ocr_engine, scale=12.0, thresh=195):
    f = OCR_SCALE
    r = fitz.Rect(rect[0] / f, rect[1] / f, rect[2] / f, rect[3] / f)
    r &= doc[pno - 1].rect
    if r.is_empty or r.width < 12 or r.height < 10:
        return []
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, thresh, 255, cv2.THRESH_BINARY)
    tmp = os.path.join(OUT_DIR, "_cb.png")
    cv2.imwrite(tmp, bw)
    res, _ = ocr_engine(tmp)
    return [line[1].strip() for line in (res or []) if line[1].strip()]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    pages = load_pages()
    doc = fitz.open(PDF_PATH)
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()
    questions = parse_questions(pages)
    for q in questions:
        if q.number in STUBBORN:
            recover_markers(q, doc, ocr_engine)

    for q in questions:
        if q.number not in STUBBORN:
            continue
        print(f"=== Q{q.number} (p{q.page}) ===")
        for n in range(1, 5):
            o = q.options.get(n)
            if not o:
                print(f"  ({n}) no marker")
                continue
            m = o["marker"]
            mh = max(m["y1"] - m["y0"], 24)
            col_r = 1790 if m["x0"] >= LEFT_X else 695
            rect = (min(m["x1"] - 2, 1780), m["y0"] - 8, col_r, m["y0"] + mh + 52)
            txts = band_ocr(doc, q.page, rect, ocr_engine)
            print(f"  ({n}) {' | '.join(txts)[:70] if txts else '(empty)'}")
    doc.close()


if __name__ == "__main__":
    main()
