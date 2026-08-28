import fitz
import os
import shutil

doc = fitz.open(os.path.join("neet", "Neet 2016.pdf"))
out_dir = os.path.join("neet-out", "2016", "images")
shutil.rmtree(out_dir, ignore_errors=True)
os.makedirs(out_dir, exist_ok=True)
SCALE = 300.0 / 72.0

image_specs = [
    # Physics Section (Q1 to Q45)
    # Q1 (PDF Q136): Capacitor charging circuit diagram (Page 37)
    (37, (230, 84, 380, 182), "Q1.png"),

    # Q2 (PDF Q137): Logic gate circuit diagram (Page 37)
    (37, (210, 454, 405, 495), "Q2.png"),

    # Q20 (PDF Q155): Square loop and long wire current diagram (Page 47)
    (47, (250, 575, 365, 665), "Q20.png"),

    # Q24 (PDF Q159): Junction diode circuit diagram AB (Page 49)
    (49, (215, 505, 395, 535), "Q24.png"),

    # Chemistry Section (Q46 to Q90)
    # Q50 (PDF Q5): Reactions (a), (b), (c) structures (Page 2)
    (2, (75, 415, 360, 535), "Q50.png"),

    # Q52 (PDF Q7): Phenol to anisole reaction diagram (Page 3)
    (3, (175, 385, 440, 418), "Q52.png"),

    # Q87 (PDF Q42): Biphenyl structures for options 1..4 (Page 17)
    (17, (105, 268, 190, 332), "Q87_opt_1.png"),
    (17, (365, 268, 445, 332), "Q87_opt_2.png"),
    (17, (105, 332, 190, 396), "Q87_opt_3.png"),
    (17, (362, 335, 460, 398), "Q87_opt_4.png"),
]

for pno, rect, fname in image_specs:
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=fitz.Rect(rect))
    pm.save(os.path.join(out_dir, fname))

print(f"Rendered {len(image_specs)} calibrated diagram assets to {out_dir}.")
