import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')
os.makedirs('temp_inspect/candidates', exist_ok=True)

# List of candidates to inspect in detail:
candidates = [
    # (pdf_q, page, y0, y1, name)
    (5, 2, 390, 540, "chem_q5_reactions.png"),
    (7, 3, 370, 480, "chem_q7_reaction.png"),
    (12, 5, 180, 400, "chem_q12_table.png"),
    (15, 7, 50, 260, "chem_q15_table.png"),
    (33, 13, 300, 480, "chem_q33_reaction.png"),
    (42, 17, 250, 420, "chem_q42_biphenyls.png"),
    (117, 33, 50, 200, "bio_q117_table.png"),
    (136, 37, 50, 220, "phy_q136_capacitor.png"),
    (137, 37, 420, 560, "phy_q137_logic_gate.png"),
    (155, 47, 540, 750, "phy_q155_loop.png"),
    (159, 49, 440, 580, "phy_q159_diode.png"),
    (165, 52, 530, 750, "phy_q165_table.png")
]

for pdf_q, pno, y0, y1, fname in candidates:
    page = doc[pno - 1]
    rect = fitz.Rect(40, y0, 560, y1)
    pix = page.get_pixmap(dpi=200, clip=rect)
    pix.save(os.path.join("temp_inspect", "candidates", fname))

print("Saved candidate clips.")
