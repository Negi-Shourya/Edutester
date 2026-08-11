import fitz

doc = fitz.open('neet/2024 Neet.pdf')
page = doc[2]
clip = fitz.Rect(420, 340, 612, 440)
pix = page.get_pixmap(dpi=600, clip=clip)
pix.save(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\q15_opts2.png')
print('saved', pix.width, pix.height)
