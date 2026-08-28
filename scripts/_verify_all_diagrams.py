import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')

for pno in range(len(doc)):
    page = doc[pno]
    text = page.get_text('text')
    # search for diagrams
    for q_m in re.finditer(r'Q\.(\d+)', text):
        qnum = int(q_m.group(1))
        # let's see what is around this question
        q_pos = q_m.start()
        q_snippet = text[q_pos:q_pos+300]
        # check if it mentions figure or diagram or graph
        if any(w in q_snippet.lower() for w in ['diagram', 'figure', 'circuit', 'graph', 'shown']):
            print(f"P{pno+1:02d} Q.{qnum}: {q_snippet.splitlines()[0]}")
