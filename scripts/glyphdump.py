import fitz, re, json

doc = fitz.open("neet/2025 Neet.pdf")

def col_split(page):
    xs = []
    d = page.get_text("rawdict")
    for b in d["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            for s in l["spans"]:
                for ch in s["chars"]:
                    if 45 < ch["origin"][1] < 770:
                        xs.append(ch["bbox"][0])
    xs.sort()
    best_gap = 0
    for i in range(len(xs) - 1):
        gap = xs[i + 1] - xs[i]
        if 250 < xs[i] < 430 and gap > best_gap:
            best_gap = gap
    return 305.0 if best_gap >= 9 else None

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
                    c = ch["c"]
                    if rect.contains(fitz.Point(x, y)):
                        chars.append((round(y / 2) * 2, round(x), c, s["font"][:8]))
    chars.sort()
    last_y = None
    for y, x, c, f in chars:
        if last_y is None or abs(y - last_y) > 2:
            out.append("  y=%-4d" % y)
            last_y = y
        out.append("    x=%-4d %-24s %r" % (x, f, c))
    out.append("")

out = []
# Q33 options: page 7 col L
dump(doc[6], fitz.Rect(2, 40, 305, 838), "Q33 options (page 7 col L)", out)
# Q1 options
dump(doc[1], fitz.Rect(2, 300, 305, 838), "Q1 options (page 2 col L)", out)
# Q7 options
dump(doc[1], fitz.Rect(305, 300, 611, 838), "Q7 options (page 2 col R)", out)
# Q15 options
dump(doc[2], fitz.Rect(305, 40, 611, 838), "Q15 options (page 3 col R)", out)
# Q24 options precise
dump(doc[4], fitz.Rect(2, 660, 305, 838), "Q24 options (page 5 col L)", out)
# Q24 stem math
dump(doc[4], fitz.Rect(2, 650, 305, 690), "Q24 stem math", out)
# Q30 options
dump(doc[5], fitz.Rect(2, 40, 305, 838), "Q30 options (page 6 col L)", out)
# Q37 options
dump(doc[5], fitz.Rect(305, 40, 611, 838), "Q37 options (page 6 col R)", out)
# Q43,44,45 options
dump(doc[6], fitz.Rect(305, 40, 611, 838), "Q43-45 options (page 7 col R)", out)
# Q63 options
dump(doc[9], fitz.Rect(2, 40, 305, 838), "Q63 options (page 10 col L)", out)
# Q92 options
dump(doc[13], fitz.Rect(2, 40, 305, 838), "Q92 options (page 14 col L)", out)
# Q180 options
dump(doc[24], fitz.Rect(305, 40, 611, 838), "Q180 options (page 25 col R)", out)
# Q5 options
dump(doc[1], fitz.Rect(305, 40, 611, 838), "Q5 options (page 2 col R)", out)
# Q19 options
dump(doc[2], fitz.Rect(2, 40, 305, 838), "Q19 options (page 3 col L)", out)
# Q23 options
dump(doc[4], fitz.Rect(2, 300, 305, 660), "Q23 options (page 5 col L)", out)
# Q39 options
dump(doc[6], fitz.Rect(305, 560, 611, 838), "Q39 options (page 7 col R)", out)
# Q41 options
dump(doc[6], fitz.Rect(305, 200, 305 + 306, 560), "Q41 options (page 7 col R)", out)
# Q46 options
dump(doc[7], fitz.Rect(2, 40, 305, 300), "Q46 options (page 8 col L)", out)
# Q132 options (page 20 col R top)
dump(doc[19], fitz.Rect(305, 40, 611, 500), "Q132 options (page 20 col R)", out)

open("glyphs.txt", "w", encoding="utf-8").write("\n".join(out))
print("done", len(out))
