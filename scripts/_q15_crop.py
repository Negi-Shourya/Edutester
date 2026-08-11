import fitz

doc = fitz.open('neet/2024 Neet.pdf')
page = doc[2]
# find "refractive" stem line to locate options below
r = page.search_for('refractive')
print('stem rect:', r)
# options start after stem ~ +60pt
clip = fitz.Rect(300, 320, 612, 470)
pix = page.get_pixmap(dpi=600, clip=clip)
pix.save(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\q15_opts.png')
print('saved', pix.width, pix.height)
