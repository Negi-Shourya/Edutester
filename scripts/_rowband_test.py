#!/usr/bin/env python3
"""Test: OCR each option row band (both columns) with proper geometry.
Reports per-cell marker-line text to classify text vs image options."""
import json
import os
import re
import sys

import cv2
import fitz
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from extract_neet_2022 import (  # noqa: E402
    PDF_PATH, OUT_DIR, OCR_SCALE, LEFT_X, PAGE_H,
    load_pages, parse_questions, recover_markers, is_junk,
)

IMGQ = [2, 3, 6, 7, 8, 13, 17, 24, 30, 37, 51, 53, 65, 66, 69, 71, 94, 100,
        120, 124, 130, 148, 166, 187, 195, 196]


def row_ocr(doc, pno, y0, y1, ocr_engine, scale=8.0):
    f = OCR_SCALE
    r = fitz.Rect(300 / f, y0 / f, 1780 / f, y1 / f)
    r &= doc[pno - 1].rect
    if r.is_empty:
        return []
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
    tmp = os.path.join(OUT_DIR, "_rowb.png")
    cv2.imwrite(tmp, bw)
    res, _ = ocr_engine(tmp)
    out = []
    for line in (res or []):
        box = line[0]
        cx = 300 + (box[0][0] + box[2][0]) / 2 / scale * OCR_SCALE
        cy = y0 + (box[0][1] + box[2][1]) / 2 / scale * OCR_SCALE
        out.append((cx, cy, line[1].strip()))
    return out


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    pages = load_pages()
    doc = fitz.open(PDF_PATH)
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()
    questions = parse_questions(pages)
    for q in questions:
        if q.number in IMGQ:
            recover_markers(q, doc, ocr_engine)

    for q in questions:
        if q.number not in IMGQ:
            continue
        marks = sorted(q.options.items())  # (n, o) by n
        if len(marks) != 4:
            print(f"=== Q{q.number}: only {len(marks)} markers ===")
            continue
        ys = [o["marker"]["y0"] for n, o in marks]
        xs = [o["marker"]["x0"] for n, o in marks]
        has_right = any(o["col"] == "R" for n, o in marks)
        print(f"=== Q{q.number} (p{q.page}) {'2x2' if has_right else '1col'} marker_ys={ys} ===")
        # rows
        row_centers = []
        for y in sorted(set(round(m / 10) for m in ys)):
            pass
        cluster = []
        for n, o in sorted(marks, key=lambda t: t[1]["marker"]["y0"]):
            y = o["marker"]["y0"]
            for c in cluster:
                if abs(c["c"] - y) < 45:
                    c["ys"].append(y)
                    c["c"] = sum(c["ys"]) / len(c["ys"])
                    break
            else:
                cluster.append({"ys": [y], "c": y})
        cluster.sort(key=lambda c: c["c"])
        y_bot = q.answer_det["y0"] if q.answer_det else (q.end[1] if q.end else PAGE_H)
        # row bands
        bands = []
        for i, c in enumerate(cluster):
            y0 = c["c"] - 14
            y1 = (cluster[i + 1]["c"] + cluster[i + 1]["ys"][0]) / 2 if i + 1 < len(cluster) else y_bot - 8
            bands.append((y0, y1))
        for i, (y0, y1) in enumerate(bands):
            dets = row_ocr(doc, q.page, y0, y1, ocr_engine)
            # marker line zone detections
            mc = cluster[i]["c"]
            for n, o in sorted(marks):
                if abs(o["marker"]["y0"] - mc) >= 45:
                    continue
                col = "L" if o["marker"]["x0"] < LEFT_X else "R"
                cell_dets = [t for cx, cy, t in dets
                             if (("L" if cx < LEFT_X else "R") == col)
                             and abs(cy - mc) < 20]
                tag = "TEXT" if cell_dets else "img?"
                print(f"  ({n})[{col}] {tag}: {' '.join(cell_dets)[:60]}")
    doc.close()


if __name__ == "__main__":
    main()
