import fitz

doc = fitz.open('neet/2024 Neet.pdf')
page = doc[2]
infos = page.get_image_info()
for i in infos:
    b = i['bbox']
    if 330 < b[1] < 470:
        print('IMG bbox:', [round(v) for v in b], 'wh:', i.get('width'), i.get('height'))
