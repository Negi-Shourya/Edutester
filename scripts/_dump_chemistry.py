import fitz
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open('neet/Neet 2016.pdf')
full_text = ''
for pno, page in enumerate(doc):
    txt = page.get_text('text')
    full_text += f'\n<<<PAGE_{pno+1}>>>\n' + txt

blocks = re.split(r'\n\s*Q\.(\d+)\s*\n?', full_text)
parsed_pdf = {}
for i in range(1, len(blocks), 2):
    qnum = int(blocks[i])
    content = blocks[i+1]
    parsed_pdf[qnum] = content

# Check all Chemistry questions
for pdf_q in range(1, 46):
    std_q = pdf_q + 45
    content = parsed_pdf[pdf_q]
    print(f"================== Std Q{std_q} (PDF Q{pdf_q}) ==================")
    print(content[:500].strip())
