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

def is_skip(pno):
    t = doc[pno].get_text("text", flags=0)[:2000]
    return "Important Instructions" in t or "Test Booklet is" in t[:600] or "ANSWERS" in t or "Hints & Solutions" in t

TARGET = [5, 20, 59, 145, 152]

all_mks = []
for pno in range(doc.page_count):
    if is_skip(pno):
        all_mks.append({"L": [], "R": []})
        continue
    sp = col_split(doc[pno])
    all_mks.append(markers(doc[pno], sp))

for qn in TARGET:
    loc = None
    for pno in range(doc.page_count):
        for col in ("L", "R"):
            for i, (y, n) in enumerate(all_mks[pno][col]):
                if n == qn:
                    top = y
                    bot = all_mks[pno][col][i + 1][0] if i + 1 < len(all_mks[pno][col]) else 838.0
                    loc = (pno, col, top, bot)
                    break
            if loc:
                break
        if loc:
            break
    if not loc:
        print(f"=== Q{qn} NOT FOUND ===")
        continue
    pno, col, top, bot = loc
    sp = col_split(doc[pno])
    spx = sp if sp is not None else 305.0
    x0 = 2 if col == "L" else spx
    x1 = spx if col == "L" else 611
    rect = fitz.Rect(x0, top - 3, x1, bot)
    d = doc[pno].get_text("rawdict", clip=rect)
    print(f"=== Q{qn} (page {pno + 1}, col {col}) ===")
    rows = []
    for b in d["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            for s in l["spans"]:
                text = "".join(ch["c"] for ch in s["chars"])
                if not text.strip():
                    continue
                x0b = min(ch["bbox"][0] for ch in s["chars"])
                y0b = min(ch["bbox"][1] for ch in s["chars"])
                y1b = max(ch["bbox"][3] for ch in s["chars"])
                rows.append((y0b, y1b, round(x0b, 1), s["size"], text))
    rows.sort(key=lambda r: (r[0], r[2]))
    for y0b, y1b, x0b, size, text in rows:
        print(f"  y={y0b:6.1f}-{y1b:6.1f} x={x0b:6.1f} {size:4.1f} {text!r}")
    print()
