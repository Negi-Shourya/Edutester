import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')

print("Total pages:", len(doc))
for pno in range(len(doc)):
    page = doc[pno]
    text = page.get_text('text')
    qs = re.findall(r'Q\.(\d+)', text)
    drawings = page.get_drawings()
    content_drawings = [d for d in drawings if 50 < d['rect'].y0 < 750]
    
    keywords = ['diagram', 'figure', 'circuit', 'biphenyl', 'shown in', 'following graph', 'following structure']
    found_kw = [kw for kw in keywords if kw in text.lower()]
    if found_kw or len(content_drawings) > 30:
        print(f"Page {pno+1:02d} | Qs: {qs} | Keywords: {found_kw} | Drawings: {len(content_drawings)}")
