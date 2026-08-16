#!/usr/bin/env python3
"""Crop missing NEET 2022 physics figures and fix questions.json per the PDF."""
import json
import os

import cv2
import fitz
import numpy as np

PDF_PATH = os.path.join("neet", "neet 2022.pdf")
OUT_DIR = os.path.join("neet-out", "2022")
IMG_DIR = os.path.join(OUT_DIR, "images")
JSON_PATH = os.path.join(OUT_DIR, "questions.json")

# ---- 1) Crop the missing figures (PDF points; page is 1245pt tall) ----
FIGURES = [
    # (page, filename, (x0, y0, x1, y1))
    (1, "Q2_fig1.png", (150, 575, 895, 746)),   # P-V diagram between stem and options
    (3, "Q8_fig1.png", (150, 118, 895, 240)),   # v-t graph between stem and options
    (6, "Q33_fig1.png", (150, 575, 895, 731)),  # displacement-time graph
]

doc = fitz.open(PDF_PATH)
for pno, fname, (x0, y0, x1, y1) in FIGURES:
    page = doc[pno - 1]
    r = fitz.Rect(x0, y0, x1, y1) & page.rect
    pm = page.get_pixmap(matrix=fitz.Matrix(3, 3), colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    ink = float((g < 200).mean())
    ok = cv2.imwrite(os.path.join(IMG_DIR, fname), g)
    print(f"{fname}: {pm.width}x{pm.height}px, ink={ink:.4f}, wrote={ok}")
doc.close()

# ---- 2) Apply fixes to questions.json ----
with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

by_num = {q["number"]: q for q in data["questions"]}

# Q1: stem list letters A./B./C./D. -> paper's (a)/(b)/(c)/(d), roman parens
q1 = by_num[1]
q1["text"] = q1["text"].replace(
    "A. AM radio waves  i. 10^{–10} m", "(a) AM radio waves  (i) 10^{–10} m"
).replace(
    "B. Microwaves  ii. 10^{2} m", "(b) Microwaves  (ii) 10^{2} m"
).replace(
    "C. Infrared radiations  iii. 10^{–2} m", "(c) Infrared radiations  (iii) 10^{–2} m"
).replace(
    "D. X-rays  iv. 10^{–4} m", "(d) X-rays  (iv) 10^{–4} m"
)

# Q2, Q8, Q33: add missing figures
by_num[2]["images"] = ["Q2_fig1.png"]
by_num[8]["images"] = ["Q8_fig1.png"]
by_num[33]["images"] = ["Q33_fig1.png"]

# Q12: option 2 is "√2v" in the paper (was "2v")
q12 = by_num[12]
assert q12["options"][1]["text"] == "2v", q12["options"][1]
q12["options"][1]["text"] = "√2v"

# Q16: paper order is (1) 0° (2) 45° (3) 90° (4) 180°, answer (3)
q16 = by_num[16]
assert q16["options"][0]["text"] == "90°" and q16["options"][2]["text"] == "0°", \
    (q16["options"][0], q16["options"][2])
q16["options"][0]["text"] = "0°"
q16["options"][2]["text"] = "90°"

# Q41: paper order is (2) ...linearly decreasing..., (3) ...1/r dependence...
q41 = by_num[41]
q41["options"][1], q41["options"][2] = q41["options"][2], q41["options"][1]

# Q49: paper order is (1) sin^-1(0.500) (2) sin^-1(0.750) (3) tan^-1(0.500) (4) tan^-1(0.750)
q49 = by_num[49]
q49["options"] = [
    {"label": "1", "text": "\\sin^{-1} (0.500)", "figure": None},
    {"label": "2", "text": "\\sin^{-1} (0.750)", "figure": None},
    {"label": "3", "text": "\\tan^{-1} (0.500)", "figure": None},
    {"label": "4", "text": "\\tan^{-1} (0.750)", "figure": None},
]

# Q50: paper order is (1) 1:1 (2) 4:5 (3) 5:4 (4) 25:16, answer (3)
q50 = by_num[50]
q50["options"][1], q50["options"][2] = q50["options"][2], q50["options"][1]

with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=1, ensure_ascii=False)
    f.write("\n")

print("questions.json updated.")
print("Q1 stem:", repr(by_num[1]["text"][:160]))
print("Q12 opt2:", by_num[12]["options"][1]["text"])
print("Q16:", [o["text"] for o in by_num[16]["options"]], "ans", by_num[16]["answers"])
print("Q41:", [o["text"][:45] for o in by_num[41]["options"]], "ans", by_num[41]["answers"])
print("Q49:", [o["text"] for o in by_num[49]["options"]], "ans", by_num[49]["answers"])
print("Q50:", [o["text"] for o in by_num[50]["options"]], "ans", by_num[50]["answers"])
print("Q2/Q8/Q33 images:", by_num[2]["images"], by_num[8]["images"], by_num[33]["images"])
