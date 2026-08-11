import fitz

doc = fitz.open('neet/2024 Neet.pdf')
print('pages:', len(doc))
# Q6/7/11 on pages ~1-2, Q15/16 ~2-3, Q21/24 ~3-4, Q29-33 ~4-5, Q36-39 ~5, Q42-49 ~6-7
for pi in range(0, 7):
    page = doc[pi]
    pix = page.get_pixmap(dpi=110)
    pix.save(rf'C:\Users\SHOURY~1\AppData\Local\Temp\opencode\p{pi}.png')
    print('saved p', pi)
