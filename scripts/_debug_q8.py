#!/usr/bin/env python3
import json
import os
import sys

import cv2
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from extract_neet_2022 import (  # noqa: E402
    PDF_PATH, OUT_DIR, OCR_SCALE, LEFT_X,
    load_pages, parse_questions, recover_markers, option_cell_rects,
)

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    pages = load_pages()
    doc = fitz.open(PDF_PATH)
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()

    questions = parse_questions(pages)
    for q in questions:
        if q.number not in (2, 8, 13):
            continue
        recover_markers(q, doc, ocr_engine)
        print(f"=== Q{q.number} page {q.page} ===")
        for n in range(1, 5):
            o = q.options.get(n)
            if not o:
                print(f"  ({n}) none")
                continue
            print(f"  ({n}) marker={o['marker']} col={o['col']} text={o.get('text')!r}")
        cells = option_cell_rects(q)
        for n in range(1, 5):
            if n in cells:
                print(f"  cell{n} = {cells[n]}")
        # save band + full-cell crops for Q8
        if q.number == 8:
            for n, rect in cells.items():
                f = OCR_SCALE
                r = fitz.Rect(rect[0] / f, rect[1] / f, rect[2] / f, rect[3] / f)
                r &= doc[q.page - 1].rect
                pm = doc[q.page - 1].get_pixmap(matrix=fitz.Matrix(4, 4),
                                                colorspace=fitz.csGRAY, clip=r)
                g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
                _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
                cv2.imwrite(os.path.join(OUT_DIR, f"_q8cell{n}.png"), bw)
    doc.close()

if __name__ == "__main__":
    main()
