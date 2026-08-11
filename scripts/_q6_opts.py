import fitz

doc = fitz.open('neet/2024 Neet.pdf')
page = doc[1]

words = page.get_text('words')
q6 = [w for w in words if 268 < w[1] < 360]
for w in q6:
    print(round(w[0]), round(w[1]), round(w[2]), round(w[3]), repr(w[4]))
print('----- drawings -----')
draws = page.get_drawings()
for d in draws:
    r = d['rect']
    if 268 < r.y0 < 360:
        print(round(r.x0), round(r.y0), round(r.x1), round(r.y1), d['type'])
