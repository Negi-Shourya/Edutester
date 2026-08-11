import fitz

doc = fitz.open('neet/2024 Neet.pdf')
page = doc[2]
d = page.get_text('dict', flags=0)
for block in d['blocks']:
    if block['type'] != 0:
        continue
    for line in block['lines']:
        for span in line['spans']:
            b = span['bbox']
            if b[1] > 338 and b[1] < 470 and b[0] > 300:
                print(round(b[0]), round(b[1]), round(b[2]), round(b[3]),
                      span['font'][:20], repr(span['text']))
