import fitz
import re

doc = fitz.open('neet/2024 Neet.pdf')
WANT = {6, 7, 11, 15, 16, 21, 24, 29, 30, 33, 36, 39, 42, 46, 49}

pages = []
for p in doc:
    pages.append(p.get_text('text', flags=0))

found = {}
for pi, t in enumerate(pages):
    for m in re.finditer(r'^(\d{1,3})\.\s', t, re.M):
        n = int(m.group(1))
        if n in WANT and n not in found:
            start = m.start()
            nxt = re.search(r'^(\d{1,3})\.\s', t[m.end():], re.M)
            end = m.end() + (nxt.start() if nxt else len(t) - m.end())
            found[n] = (pi, t[start:end])

out = []
for n in sorted(found):
    pi, block = found[n]
    out.append(f'===== Q{n} (page idx {pi}) =====')
    out.append(block.strip())
    out.append('')

with open(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\problem_qs_dump.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('wrote', len(found), 'blocks')
