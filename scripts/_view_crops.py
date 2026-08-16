#!/usr/bin/env python3
import sys
import numpy as np
import cv2

sys.stdout.reconfigure(encoding="utf-8")


def view(path, cols=110, rows=30):
    img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print(path, "MISSING")
        return
    h, w = img.shape
    print(f"== {path} {w}x{h} ==")
    for r in range(rows):
        ya = int(r * h / rows)
        yb = int((r + 1) * h / rows)
        line = ""
        for c in range(cols):
            xa = int(c * w / cols)
            xb = int((c + 1) * w / cols)
            v = img[ya:yb, xa:xb].min()
            line += "#" if v < 150 else ("." if v < 225 else " ")
        print(f"{ya:5d}|{line}|")


for f in ["Q3_fig1.png", "Q1_fig1.png", "Q4_fig1.png", "Q8_opt1.png", "Q2_opt1.png"]:
    view(f"neet-out/2022/images/{f}")
    print()
