import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')
os.makedirs('temp_inspect/more_candidates', exist_ok=True)

checks = [
    (44, "p44.png"),
    (45, "p45.png"),
    (46, "p46.png"),
    (50, "p50.png"),
    (52, "p52.png"),
    (54, "p54.png"),
    (61, "p61.png"),
]

for pno, fname in checks:
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(os.path.join("temp_inspect", "more_candidates", fname))

print("Saved more candidate page renders.")
