import fitz

doc = fitz.open("neet/2025 Neet.pdf")

def dump(page, rect, tag, out):
    out.append("== %s ==" % tag)
    d = page.get_text("rawdict")
    chars = []
    for b in d["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            for s in l["spans"]:
                for ch in s["chars"]:
                    x, y = ch["origin"]
                    if rect.contains(fitz.Point(x, y)):
                        chars.append((x, y, ch["c"]))
    chars.sort(key=lambda t: (round(t[1] / 4) * 4, t[0]))
    last = None
    for x, y, c in chars:
        yy = round(y / 4) * 4
        if last is None or abs(yy - last) > 4:
            out.append("  y=%d" % yy)
            last = yy
        out.append("    x=%d %r" % (round(x), c))
    out.append("")

out = []
dump(doc[4], fitz.Rect(2, 660, 305, 838), "Q24 all (page 5 col L)", out)
dump(doc[24], fitz.Rect(305, 60, 611, 300), "Q180 options (page 25 col R)", out)
dump(doc[2], fitz.Rect(305, 680, 611, 830), "Q15 options (page 3 col R)", out)
dump(doc[6], fitz.Rect(305, 700, 611, 838), "Q37+ options (page 6 col R bottom)", out)
dump(doc[6], fitz.Rect(305, 40, 611, 700), "Q43-45 (page 7 col R)", out)
dump(doc[1], fitz.Rect(305, 700, 611, 838), "Q7 options (page 2 col R)", out)
dump(doc[1], fitz.Rect(2, 300, 305, 838), "Q1 rest (page 2 col L)", out)
dump(doc[7], fitz.Rect(2, 40, 305, 838), "Q46 (page 8 col L)", out)
dump(doc[13], fitz.Rect(2, 40, 305, 838), "Q92 (page 14 col L)", out)
dump(doc[9], fitz.Rect(2, 40, 305, 838), "Q63 (page 10 col L)", out)
dump(doc[6], fitz.Rect(2, 300, 305, 838), "Q33 options (page 7 col L)", out)
dump(doc[1], fitz.Rect(305, 40, 611, 838), "Q5 (page 2 col R)", out)
dump(doc[2], fitz.Rect(2, 40, 305, 838), "Q19 (page 3 col L)", out)
dump(doc[4], fitz.Rect(2, 280, 305, 660), "Q23 (page 5 col L)", out)
dump(doc[6], fitz.Rect(305, 500, 611, 838), "Q39-41 (page 7 col R)", out)
dump(doc[19], fitz.Rect(305, 40, 611, 500), "Q132 opts (page 20 col R)", out)

open("glyphs_x.txt", "w", encoding="utf-8").write("\n".join(out))
print("done")
