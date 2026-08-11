import fitz

doc = fitz.open('neet/2024 Neet.pdf')

# Q6: page idx 1 (Q1-9 page). Find Q6 block bbox by locating "logic circuit" text.
page = doc[1]
r = page.search_for('logic circuit')
print('Q6 stem rects:', r)
# render whole page at high dpi for OCR
pix = page.get_pixmap(dpi=300)
pix.save(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\ocr_page1.png')
print('saved ocr_page1.png')

# Q15: page idx 2
page2 = doc[2]
r2 = page2.search_for('right angled prism')
print('Q15 stem rects:', r2)
pix2 = page2.get_pixmap(dpi=300)
pix2.save(r'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\ocr_page2.png')
print('saved ocr_page2.png')

# Q16 math region also page idx 2
r3 = page2.search_for('Assertion A')
print('Q16 rects:', r3)
