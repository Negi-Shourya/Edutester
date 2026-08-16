import fitz

def main():
    doc = fitz.open('neet/neet 2021 question paper.pdf')
    page = doc[2] # page 3
    d = page.get_text('rawdict')
    for block in d['blocks']:
        if block['type'] != 0: continue
        for line in block['lines']:
            for span in line['spans']:
                size = span['size']
                for c in span['chars']:
                    if c['c'] in 'T2' and 200 < c['origin'][1] < 400:
                        print(f"Char: '{c['c']}', oy: {c['origin'][1]:.2f}, size: {size:.2f}")

if __name__ == '__main__':
    main()
