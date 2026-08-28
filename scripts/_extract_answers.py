import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('neet/Neet 2016.pdf')

full_text = ''
for p in doc:
    full_text += p.get_text('text') + '\n'

blocks = re.split(r'\n\s*Q\.(\d+)\s*\n?', full_text)
answers = {}
for i in range(1, len(blocks), 2):
    qnum = int(blocks[i])
    block = blocks[i+1]
    m = re.search(r'Ans\.?\s*\[?([1-4]|Bonus)\]?', block, re.IGNORECASE)
    if m:
        answers[qnum] = m.group(1)
    else:
        if 'bonus' in block.lower():
            answers[qnum] = 'Bonus'
        else:
            answers[qnum] = '?'

print('Answers extracted count:', len(answers))
for q in range(1, 181):
    ans = answers.get(q, '?')
    if ans in ['?', 'Bonus']:
        print(f'Special PDF Q.{q}: Ans={ans}')

print('PDF_ANSWERS = {')
for r in range(1, 181, 10):
    chunk = [f'{q}: "{answers.get(q, "1")}"' for q in range(r, min(r+10, 181))]
    print('    ' + ', '.join(chunk) + ',')
print('}')
