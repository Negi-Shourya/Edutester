import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')
os.makedirs('temp_inspect', exist_ok=True)

# Render pages 1 to 61 at 150 DPI for quick inspection
for pno in range(len(doc)):
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    pix.save(f'temp_inspect/page_{pno+1:02d}.png')

print(f"Rendered all {len(doc)} pages to temp_inspect/")
