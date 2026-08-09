import fitz, re

doc = fitz.open("neet/2025 Neet.pdf")

def markers(page, split_x):
    mks = {"L": [], "R": []}
    for w in page.get_text("words"):
        x0, y0, x1, y1, word = w[0], w[1], w[2], w[3], w[4]
        m = re.match(r"^(\d{1,3})\.$", word)
        if not m:
            continue
        n = int(m.group(1))
        if not (1 <= n <= 180):
            continue
        col = "R" if split_x and (x0 + x1) / 2 >= split_x else "L"
        mks[col].append((y0, n))
    for col in mks:
        mks[col].sort()
    return mks

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

def find(qn):
    for pno in range(doc.page_count):
        sp = col_split(doc[pno])
        mks = markers(doc[pno], sp)
        for col in ("L", "R"):
            for i, (y, n) in enumerate(mks[col]):
                if n == qn:
                    bot = mks[col][i + 1][0] if i + 1 < len(mks[col]) else 838.0
                    return pno, col, y, bot, sp
    return None

def clip_text(pno, col, top, bot, sp, pad=0):
    spx = sp if sp is not None else 305.0
    x0 = 2 if col == "L" else spx
    x1 = spx if col == "L" else 611
    rect = fitz.Rect(x0, top - 3 - pad, x1, bot + pad)
    return doc[pno].get_text("text", clip=rect).strip()

out = []
# Q50: stem on previous page (page 7 col L bottom)
loc = find(50)
if loc:
    pno, col, top, bot, sp = loc
    out.append("=== Q50 stem (prev page) ===")
    out.append(clip_text(pno - 1, col, 0, 838, sp))
    out.append("=== Q50 (page %d) ===" % (pno + 1))
    out.append(clip_text(pno, col, top, bot, sp))

# Q119: statements region above options
loc = find(119)
if loc:
    pno, col, top, bot, sp = loc
    out.append("=== Q119 (page %d) wider ===" % (pno + 1))
    out.append(clip_text(pno, col, top - 260, bot, sp))

# Q180
loc = find(180)
if loc:
    pno, col, top, bot, sp = loc
    out.append("=== Q180 found page %d col %s top %.0f bot %.0f ===" % (pno + 1, col, top, bot))
    out.append(clip_text(pno, col, top, bot, sp))

# Q132 options (page 19)
loc = find(132)
if loc:
    pno, col, top, bot, sp = loc
    out.append("=== Q132 (page %d) ===" % (pno + 1))
    out.append(clip_text(pno, col, top, bot, sp))

# Q92 (page 14 col L) - wider
loc = find(92)
if loc:
    pno, col, top, bot, sp = loc
    out.append("=== Q92 (page %d) ===" % (pno + 1))
    out.append(clip_text(pno, col, top, bot, sp))

# Q24 (page 5) wider
loc = find(24)
if loc:
    pno, col, top, bot, sp = loc
    out.append("=== Q24 (page %d) ===" % (pno + 1))
    out.append(clip_text(pno, col, top, bot, sp))

# Q125 full
loc = find(125)
if loc:
    pno, col, top, bot, sp = loc
    out.append("=== Q125 (page %d) ===" % (pno + 1))
    out.append(clip_text(pno, col, top, bot, sp))

open("block_texts2.txt", "w", encoding="utf-8").write("\n".join(out))
print("done")
