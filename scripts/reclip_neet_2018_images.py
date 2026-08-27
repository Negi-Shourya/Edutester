#!/usr/bin/env python3
"""
High-resolution 300 DPI image extraction for NEET 2018.
Calibrated bounding boxes to eliminate all text bleeds, duplicate option labels,
and line overflows.
"""
import fitz
import os

PDF_PATH = os.path.join("neet", "Neet 2018.pdf")
IMG_DIR = os.path.join("neet-out", "2018", "images")
os.makedirs(IMG_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
SCALE = 300.0 / 72.0  # 4.1667x zoom for crisp 300 DPI

CROPS = [
    # Q1 (V-T graph stem)
    (2, (45, 87, 210, 172), "Q1.png"),
    
    # Q7 options (I vs n graphs, excluding text and (1)-(4) labels)
    (2, (330, 391, 410, 444), "Q7_opt_1.png"),
    (2, (330, 461, 410, 514), "Q7_opt_2.png"),
    (2, (330, 529, 410, 582), "Q7_opt_3.png"),
    (2, (330, 600, 410, 653), "Q7_opt_4.png"),
    
    # Q15 (Transistor circuit)
    (4, (50, 73, 240, 222), "Q15.png"),
    
    # Q17 (Logic gates circuit)
    (4, (35, 480, 272, 560), "Q17.png"),
    
    # Q30 (Vertical circle track)
    (6, (55, 73, 180, 141.5), "Q30.png"),
    
    # Q35 (Block on inclined wedge)
    (6, (320, 268, 480, 350), "Q35.png"),
    
    # Q39 (Planetary orbit around Sun S)
    (7, (60, 240, 215, 298), "Q39.png"),
    
    # Q52 (Reaction sequence + P, Q, R column titles)
    (8, (300, 70, 540, 190), "Q52.png"),
    # Q52 options (P, Q, R product structures, excluding (1)-(4))
    (8, (325, 195, 540, 252), "Q52_opt_1.png"),
    (8, (325, 258, 540, 325), "Q52_opt_2.png"),
    (8, (325, 330, 540, 398), "Q52_opt_3.png"),
    (8, (325, 402, 540, 470), "Q52_opt_4.png"),
    
    # Q64 options (Carbocations, excluding (1)-(4))
    (10, (65, 215, 145, 285), "Q64_opt_1.png"),
    (10, (65, 295, 145, 375), "Q64_opt_2.png"),
    (10, (65, 385, 145, 470), "Q64_opt_3.png"),
    (10, (65, 475, 145, 542), "Q64_opt_4.png"),
    
    # Q66 (Reimer-Tiemann reaction scheme)
    (10, (300, 42, 540, 95), "Q66.png"),
    
    # Q68 options (Aromatic structures, excluding (1)-(4))
    (10, (330, 470, 520, 520), "Q68_opt_1.png"),
    (10, (330, 522, 520, 565), "Q68_opt_2.png"),
    (10, (330, 568, 520, 608), "Q68_opt_3.png"),
    (10, (330, 610, 520, 655), "Q68_opt_4.png"),
    
    # Q81 (Latimer diagram for Bromine)
    (12, (40, 490, 260, 552), "Q81.png"),
    
    # Q90 option 1 (Electronic configuration boxes, excluding (1))
    (13, (65, 525, 205, 567), "Q90_opt_1.png"),
]

for pno, rect, fname in CROPS:
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=fitz.Rect(rect))
    out_path = os.path.join(IMG_DIR, fname)
    pm.save(out_path)
    print(f"Clipped {fname}: {pm.width}x{pm.height} at 300 DPI")

print("All 25 NEET 2018 images extracted cleanly.")
