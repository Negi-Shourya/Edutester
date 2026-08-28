import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')

for pno in range(0, 18):
    page = doc[pno]
    text = page.get_text('text')
    qs = re.findall(r'Q\.(\d+)', text)
    drawings = page.get_drawings()
    content_drawings = [d for d in drawings if 50 < d['rect'].y0 < 750]
    curves = [d for d in content_drawings if any(item[0] in ['c', 'v', 'y'] for item in d.get('items', []))]
    print(f"Chem Page {pno+1:02d} (Qs: {qs}) | Total drawings: {len(content_drawings)} | Curved drawings: {len(curves)}")
