import fitz
import re

doc = fitz.open(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\neet2024_T3_official.pdf')
print('pages:', len(doc))
out = []
for pi in range(min(4, len(doc))):
    t = doc[pi].get_text('text', flags=0)
    out.append(f'######## PAGE {pi} ########')
    out.append(t)
with open(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\official_p0_3.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('done')
