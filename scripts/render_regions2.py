import fitz
doc = fitz.open("neet/2025 Neet.pdf")
regions = {
    "Q7_opts": (1, fitz.Rect(305, 700, 611, 838)),
    "Q24_opts2": (4, fitz.Rect(2, 660, 305, 838)),
    "Q180_opts2": (24, fitz.Rect(305, 100, 611, 300)),
    "Q19_opts2": (2, fitz.Rect(2, 200, 305, 838)),
    "Q132_opts2": (19, fitz.Rect(2, 40, 305, 838)),
    "Q15_opts": (2, fitz.Rect(305, 660, 611, 838)),
    "Q1_opts": (1, fitz.Rect(2, 300, 305, 838)),
    "Q5_opts": (1, fitz.Rect(305, 176, 611, 320)),
    "Q39_opts2": (6, fitz.Rect(2, 404, 305, 500)),
    "Q92_opts": (13, fitz.Rect(2, 250, 305, 400)),
    "Q63_opts2": (9, fitz.Rect(2, 450, 305, 838)),
}
for name, (pno, rect) in regions.items():
    pix = doc[pno].get_pixmap(matrix=fitz.Matrix(6, 6), clip=rect)
    pix.save("C:/Users/SHOURY~1/AppData/Local/Temp/opencode/reg_%s.png" % name)
print("ok")
