import fitz
doc = fitz.open("neet/2025 Neet.pdf")
regions = {
    "Q33_opts": (5, fitz.Rect(2, 800, 305, 840)),
    "Q33_opts2": (6, fitz.Rect(2, 40, 305, 200)),
    "Q23_opts": (4, fitz.Rect(2, 300, 305, 660)),
    "Q19_opts": (2, fitz.Rect(2, 500, 305, 838)),
    "Q125": (17, fitz.Rect(2, 300, 305, 838)),
    "Q132_opts": (19, fitz.Rect(305, 150, 611, 500)),
    "Q63_opts": (9, fitz.Rect(2, 500, 305, 838)),
    "Q180_opts": (24, fitz.Rect(305, 100, 611, 300)),
    "Q24_opts": (4, fitz.Rect(2, 690, 305, 830)),
}
for name, (pno, rect) in regions.items():
    pix = doc[pno].get_pixmap(matrix=fitz.Matrix(3, 3), clip=rect)
    pix.save("C:/Users/SHOURY~1/AppData/Local/Temp/opencode/reg_%s.png" % name)
print("ok")
