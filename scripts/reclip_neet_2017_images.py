import fitz
import os
import shutil

doc = fitz.open(os.path.join("neet", "Neet 2017.pdf"))
out_dir = os.path.join("neet-out", "2017", "images")
shutil.rmtree(out_dir, ignore_errors=True)
os.makedirs(out_dir, exist_ok=True)
SCALE = 300.0 / 72.0

image_specs = [
    # Physics Section (Q1 to Q45)
    # Q1 (PDF Q136): P-V indicator diagram (Page 39)
    (39, (85, 68, 230, 163), "Q1.png"),
    
    # Q6 (PDF Q141): Logic gate network (Page 41)
    (41, (95, 405, 365, 455), "Q6.png"),
    
    # Q12 (PDF Q147): Diode circuits 1..4 (Page 43)
    (43, (110, 398, 235, 428), "Q12_opt_1.png"),
    (43, (366, 398, 490, 428), "Q12_opt_2.png"),
    (43, (110, 426, 235, 453), "Q12_opt_3.png"),
    (43, (366, 426, 490, 453), "Q12_opt_4.png"),
    
    # Q21 (PDF Q156): Three parallel wires (Page 47)
    (47, (260, 555, 380, 645), "Q21.png"),
    
    # Q30 (PDF Q165): Two blocks 3m and m on spring with ceiling (Page 52)
    (52, (280, 108, 335, 205), "Q30.png"),
    
    # Q33 (PDF Q168): RLC circuit with battery (Page 54)
    (54, (200, 288, 390, 355), "Q33.png"),
    
    # Q34 (PDF Q169): Two composite rods (Page 54)
    (54, (235, 590, 335, 652), "Q34.png"),
    
    # Q40 (PDF Q175): U-tube manometer with oil and water (Page 57)
    (57, (210, 358, 390, 475), "Q40.png"),
    
    # Q44 (PDF Q179): Equipotentials regions (Page 59)
    (59, (50, 135, 550, 262), "Q44.png"),

    # Chemistry Section (Q46 to Q90)
    # Q48 (PDF Q3): Aldol products 1..4 (Page 2)
    (2, (111.2, 93, 200, 152), "Q48_opt_1.png"),
    (2, (365.2, 83, 460, 152), "Q48_opt_2.png"),
    (2, (108.8, 147, 200, 205), "Q48_opt_3.png"),
    (2, (365.2, 147, 460, 205), "Q48_opt_4.png"),
    
    # Q50 (PDF Q5): 3 Aniline structures (Page 2)
    (2, (230, 520, 380, 608), "Q50.png"),
    
    # Q56 (PDF Q11): Anisole reaction stem & options (Page 4)
    (4, (240, 480, 360, 545), "Q56.png"),
    (4, (108.8, 542, 270.0, 600), "Q56_opt_1.png"),
    (4, (365.5, 540, 515.0, 602), "Q56_opt_2.png"),
    (4, (108.8, 603, 285.0, 658), "Q56_opt_3.png"),
    (4, (365.5, 603, 530.0, 658), "Q56_opt_4.png"),
    
    # Q71 (PDF Q26): Phenol derivatives options 1..4 (Page 10)
    (10, (111.0, 290, 189.0, 370), "Q71_opt_1.png"),
    (10, (235.0, 290, 266.0, 370), "Q71_opt_2.png"),
    (10, (364.0, 294, 395.0, 352), "Q71_opt_3.png"),
    (10, (482.5, 290, 515.0, 370), "Q71_opt_4.png"),
    
    # Q73 (PDF Q28): Flowchart reaction X -> A -> Y -> Z (Page 11)
    (11, (50, 210, 550, 305), "Q73.png"),
    
    # Q75 (PDF Q30): Alkyne hydration stem & options (Page 12)
    (12, (90, 405, 340, 435), "Q75.png"),
    (12, (110.0, 435, 300, 478), "Q75_opt_1.png"),
    (12, (365.0, 435, 550, 478), "Q75_opt_2.png"),
    (12, (109.5, 480, 300, 520), "Q75_opt_3.png"),
    (12, (365.0, 480, 550, 520), "Q75_opt_4.png"),
    
    # Q76 (PDF Q31): IUPAC chemical structure (Page 13)
    (13, (240.0, 52.0, 303.0, 105.0), "Q76.png"),
]

for pno, rect, fname in image_specs:
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=fitz.Rect(rect))
    pm.save(os.path.join(out_dir, fname))

print(f"Rendered {len(image_specs)} calibrated diagram assets.")
