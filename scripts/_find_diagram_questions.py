import fitz
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')

results = []

for pno, page in enumerate(doc):
    text_instances = page.get_text('blocks')
    # Find all Q.XX
    q_matches = []
    for b in text_instances:
        txt = b[4]
        for m in re.finditer(r'(?:^|\n)\s*Q\.(\d+)', txt):
            qnum = int(m.group(1))
            q_matches.append((qnum, b[0], b[1], b[2], b[3])) # rect
    
    # Sort q_matches by y
    q_matches.sort(key=lambda x: x[2])
    
    # Find Ans. or Sol. blocks
    ans_matches = []
    for b in text_instances:
        txt = b[4]
        if 'Ans.' in txt or 'Sol.' in txt or 'Students may find' in txt:
            ans_matches.append((b[0], b[1], b[2], b[3], txt))
            
    # For each question on this page, find question bounding box (from Q start to Ans/Sol start or next Q)
    drawings = page.get_drawings()
    
    for idx, (qnum, qx0, qy0, qx1, qy1) in enumerate(q_matches):
        # find end of question
        # It ends at next Ans/Sol after qy0, or next Q start, or end of page
        next_q_y = q_matches[idx+1][2] if idx+1 < len(q_matches) else 780
        ans_ys = [a[1] for a in ans_matches if a[1] >= qy0 - 5 and a[1] < next_q_y]
        q_end_y = min(ans_ys) if ans_ys else next_q_y
        
        # Check drawings in rect [40, qy0, 560, q_end_y]
        q_rect = fitz.Rect(40, qy0, 560, q_end_y)
        q_drawings = [d for d in drawings if fitz.Rect(d['rect']).intersects(q_rect)]
        
        results.append({
            'page': pno + 1,
            'qnum': qnum,
            'q_rect': (round(q_rect.x0,1), round(q_rect.y0,1), round(q_rect.x1,1), round(q_rect.y1,1)),
            'drawing_count': len(q_drawings)
        })

print(f"Total questions mapped: {len(results)}")
for r in results:
    if r['drawing_count'] > 5:
        std_q = r['qnum'] - 135 if r['qnum'] >= 136 else r['qnum'] + 45
        print(f"Page {r['page']:02d} | PDF Q.{r['qnum']:03d} (Std Q{std_q:03d}) | Rect: {r['q_rect']} | Drawings: {r['drawing_count']}")
