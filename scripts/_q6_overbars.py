import fitz

doc = fitz.open('neet/2024 Neet.pdf')
page = doc[1]

# Q6 block: find text spans for options near "logic circuit" (y ~ 186-199)
words = page.get_text('words')
q6 = [w for w in words if 180 < w[1] < 260]
for w in q6:
    print(round(w[0]), round(w[1]), round(w[2]), round(w[3]), repr(w[4]))
print('-----')
# drawings (overlines are thin rects or lines)
draws = page.get_drawings()
small = []
for d in draws:
    r = d['rect']
    if 180 < r.y0 < 260 and r.width < 60:
        small.append((round(r.x0), round(r.y0), round(r.x1), round(r.y1), d['type']))
for s in sorted(small)[:60]:
    print(s)
