#!/usr/bin/env python3
"""
Calibrated, high-precision image clipping for NEET 2019.
Ensures:
- No text/diagram cuts
- Excludes (1), (2), (3), (4) option labels from option images
- Renders at 300 DPI (3x matrix)
"""
import fitz
import os

PDF_PATH = os.path.join("neet", "Neet 2019.pdf")
IMG_DIR = os.path.join("neet-out", "2019", "images")
os.makedirs(IMG_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)

def clip_box(pno, rect, fname):
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(3.0, 3.0), clip=fitz.Rect(rect))
    out_path = os.path.join(IMG_DIR, fname)
    pm.save(out_path)
    print(f"Clipped {fname}: {pm.width}x{pm.height}")

# ==================== PHYSICS ====================

# 1. Site Q4 (Booklet Q49, Page 6, left col)
# Circuit diagram with +6V, switches A, B, LED (Y), ground
clip_box(6, (68, 404, 252, 536), "Q4.png")

# 2. Site Q21 (Booklet Q66, Page 7, right col)
# Rotating particle circle with 3m, P(t=0), T=4s, x/y axes
clip_box(7, (360, 360, 480, 460), "Q21.png")

# 3. Site Q24 (Booklet Q69, Page 8, left col)
# 6 bulbs circuit with section A, section B, battery E
clip_box(8, (125, 290, 218, 425), "Q24.png")

# 4. Site Q28 options (Booklet Q73, Page 8, right col)
# Magnetic field B vs d plots (all 4 in single vertical column)
clip_box(8, (348, 325, 435, 405), "Q28_opt_1.png")
clip_box(8, (348, 427, 435, 508), "Q28_opt_2.png")
clip_box(8, (348, 530, 435, 610), "Q28_opt_3.png")
clip_box(8, (348, 632, 435, 712), "Q28_opt_4.png")

# 5. Site Q36 (Booklet Q81, Page 9, right col)
# Circuit 1 and Circuit 2 complete with voltmeters, ammeters, resistors
clip_box(9, (315, 330, 552, 442), "Q36.png")

# 6. Site Q43 (Booklet Q88, Page 10, right col)
# Force vector triangle PQR complete with labels
clip_box(10, (345, 140, 435, 235), "Q43.png")

# ==================== CHEMISTRY ====================

# 7. Site Q61 options (Booklet Q16, Page 2, left col)
# Protonation structures without (1)-(4) labels
clip_box(2, (90, 328, 178, 355), "Q61_opt_1.png")
clip_box(2, (90, 360, 178, 388), "Q61_opt_2.png")
clip_box(2, (90, 394, 178, 422), "Q61_opt_3.png")
clip_box(2, (90, 428, 178, 456), "Q61_opt_4.png")

# 8. Site Q62 (Booklet Q17, Page 2, left col)
# Reaction with cis-2-butene label
clip_box(2, (45, 510, 260, 565), "Q62.png")

# 9. Site Q65 stem (Booklet Q20, Page 2, right col)
# Cumene -> intermediate A -> Phenol + Acetone
clip_box(2, (325, 115, 550, 205), "Q65.png")

# 10. Site Q65 options (Booklet Q20, Page 2, right col)
# Intermediate A chemical structures without (1)-(4) labels
clip_box(2, (345, 232, 415, 332), "Q65_opt_1.png")
clip_box(2, (460, 248, 545, 342), "Q65_opt_2.png")
clip_box(2, (345, 360, 415, 452), "Q65_opt_3.png")
clip_box(2, (460, 370, 550, 452), "Q65_opt_4.png")

# 11. Site Q74 options (Booklet Q29, Page 3, right col)
# Br3O8 structures without (1)-(4) labels
clip_box(3, (345, 100, 425, 155), "Q74_opt_1.png")
clip_box(3, (455, 100, 540, 155), "Q74_opt_2.png")
clip_box(3, (345, 165, 425, 222), "Q74_opt_3.png")
clip_box(3, (455, 165, 540, 222), "Q74_opt_4.png")

# 12. Site Q87 stem (Booklet Q42, Page 5, left col)
# Phthalic acid + NH3 -> product
clip_box(5, (70, 98, 240, 152), "Q87.png")

# 13. Site Q87 options (Booklet Q42, Page 5, left col)
# Phthalic products without (1)-(4) labels
clip_box(5, (95, 160, 175, 220), "Q87_opt_1.png")
clip_box(5, (90, 235, 175, 312), "Q87_opt_2.png")
clip_box(5, (90, 325, 175, 390), "Q87_opt_3.png")
clip_box(5, (90, 395, 175, 455), "Q87_opt_4.png")

print("All 28 images clipped successfully!")
