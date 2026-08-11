import fitz

doc = fitz.open('neet/2024 Neet.pdf')
page = doc[2]
words = page.get_text('words')
for w in words:
    if 340 < w[1] < 430:
        print(round(w[0]), round(w[1]), round(w[2]), round(w[3]), repr(w[4]))
print('--- images ---')
for img in page.get_images(full=True):
    print(img)
print('--- image placements ---')
for xref, _, _ in page.get_image_info():
    pass
infos = page.get_image_info()
for i in infos:
    b = i['bbox']
    if 340 < b[1] < 430:
        print('IMG bbox:', [round(v) for v in b], 'size', i.get('width'), 'x', i.get('height'))
