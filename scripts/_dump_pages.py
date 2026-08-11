import fitz

doc = fitz.open('neet/2024 Neet.pdf')
for pi in (2, 3, 4, 5, 6):
    t = doc[pi].get_text('text', flags=0)
    with open(rf'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\page{pi}_full.txt', 'w', encoding='utf-8') as f:
        f.write(t)
    print(pi, len(t))
