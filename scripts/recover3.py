import fitz, re

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

def plain(page, rect):
    t = page.get_text("text", clip=rect).strip()
    return t

out = []
# Q50: page 7 col R bottom (prev page of 50's marker page 8)
out.append("=== page 7 col R full ===")
out.append(plain(doc[6], fitz.Rect(305, 40, 611, 838)))
out.append("")
out.append("=== page 8 col L full ===")
out.append(plain(doc[7], fitz.Rect(2, 40, 305, 838)))
out.append("")
# Q119: find marker
for pno in (15, 16):
    t = plain(doc[pno], fitz.Rect(2, 40, 611, 838))
    if "119." in t:
        out.append("=== page %d contains 119 ===" % (pno + 1))
        # both cols
        out.append("col L: " + plain(doc[pno], fitz.Rect(2, 40, 305, 838))[:3000])
        out.append("")
        out.append("col R: " + plain(doc[pno], fitz.Rect(305, 40, 611, 838))[:3000])
        break
out.append("")
# Q180: page 25 + 26 full cols
for pno in (24, 25):
    out.append("=== page %d col L ===" % (pno + 1))
    out.append(plain(doc[pno], fitz.Rect(2, 40, 305, 838))[:2500])
    out.append("")
    out.append("=== page %d col R ===" % (pno + 1))
    out.append(plain(doc[pno], fitz.Rect(305, 40, 611, 838))[:2500])
    out.append("")
# Q132 options: page 20 col L top
out.append("=== page 20 col L ===")
out.append(plain(doc[19], fitz.Rect(2, 40, 305, 838))[:2500])
out.append("")
# Q24 options raw chars: page 5 col L y 500-838
out.append("=== Q24 raw options chars ===")
d = doc[4].get_text("rawdict")
for block in d["blocks"]:
    if block["type"] != 0:
        continue
    for line in block["lines"]:
        for span in line["spans"]:
            if span["bbox"][1] < 560:
                continue
            y = round(span["bbox"][1])
            s = "".join(ch["c"] for ch in span["chars"])
            out.append("y=%d font=%s %r" % (y, span["font"], s))

open("block_texts3.txt", "w", encoding="utf-8").write("\n".join(out))
print("done")
