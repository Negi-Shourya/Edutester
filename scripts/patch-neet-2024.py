import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

OUT = r"D:\Github Repo\Edutester\neet-out\2024\questions.json"
PAPER = r"C:\Users\SHOURY~1\AppData\Local\Temp\opencode\T3_paper.txt"
KEY = r"C:\Users\SHOURY~1\AppData\Local\Temp\opencode\T3key_clean.txt"

MATCH_QS = [2, 19, 51, 56, 58, 66, 67, 70, 80, 117, 120, 122, 134, 140, 141, 144, 147,
            148, 149, 151, 152, 155, 161, 163, 168, 171, 174, 176, 177, 179, 180, 182,
            185, 187, 190, 191, 192, 194, 196]
MATCH_IMAGE_TABLE = {67}


def _char_to_byte(ch):
    o = ord(ch)
    if o < 256:
        return o
    try:
        b = ch.encode("cp1252")
        if len(b) == 1:
            return b[0]
    except UnicodeEncodeError:
        pass
    return None


def _utf8_len(b):
    if b < 0x80:
        return 1
    if 0xC2 <= b <= 0xDF:
        return 2
    if 0xE0 <= b <= 0xEF:
        return 3
    if 0xF0 <= b <= 0xF4:
        return 4
    return 0


def _decode_run_utf8(bs):
    out = []
    i = 0
    n = len(bs)
    while i < n:
        b = bs[i]
        ln = _utf8_len(b)
        if ln == 1:
            out.append(chr(b))
            i += 1
            continue
        if ln == 0 or i + ln > n:
            out.append(chr(b))
            i += 1
            continue
        seq = bytes(bs[i:i + ln])
        try:
            out.append(seq.decode("utf-8"))
            i += ln
        except UnicodeDecodeError:
            out.append(chr(b))
            i += 1
    return "".join(out)


def fix_mojibake(s):
    out = []
    buf = []

    def flush():
        if buf:
            bs = [b for b in (_char_to_byte(ch) for ch in buf) if b is not None]
            if bs:
                out.append(_decode_run_utf8(bs))
            else:
                out.extend(buf)
            buf.clear()

    for ch in s:
        if _char_to_byte(ch) is not None:
            buf.append(ch)
        else:
            flush()
            out.append(ch)
    flush()
    return "".join(out)


def parse_match_block(text, qnum):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    lines = [l for l in lines if l != "www.prepp.in" and not re.fullmatch(r"\d{1,3}", l)]
    title = None
    footer = None
    li = []
    lii = []
    headers = []
    cur = None
    for raw in lines:
        l = re.sub(r"^\d{1,3}\.\s*(Match\b.*)$", r"\1", raw)
        if not l.startswith("Match"):
            l = raw
        if re.match(r"^Match\b", l, re.I):
            title = l
            cur = None
            continue
        if re.match(r"^Choose\s+the\s+correct", l, re.I):
            footer = l
            cur = None
            continue
        if re.match(r"^\((?:1|2|3|4)\)\s", l) or re.match(r"^[1-4]\.\s*[A-D]", l):
            cur = None
            continue
        if re.match(r"^List\s*[\-–]?\s*I{1,2}(?:\s|\(|$)", l, re.I):
            headers.append(l)
            cur = None
            continue
        m = re.match(r"^([A-D])(?:\.\s*|\s+|$)(.*)$", l)
        if m:
            li.append([m.group(1), m.group(2)])
            cur = "li"
            continue
        m = re.match(r"^(V|IV|III|II|I)(?:[.,]\s*|\s+|$)(.*)$", l)
        if m:
            lii.append([m.group(1), m.group(2)])
            cur = "lii"
            continue
        if cur == "li" and li:
            li[-1][1] = (li[-1][1] + " " + l).strip()
        elif cur == "lii" and lii:
            lii[-1][1] = (lii[-1][1] + " " + l).strip()
    if title is None:
        title = "Match List-I with List-II."
    block = [title]
    block.extend(headers)
    if li and lii and len(li) == len(lii):
        for (a, lt), (b, rt) in zip(li, lii):
            block.append(f"{a}. {lt}  {b}. {rt}")
    if footer:
        block.append(footer)
    return "\n".join(block)


def main():
    with open(PAPER, encoding="utf-8") as f:
        paper = f.read()
    with open(KEY, encoding="utf-8") as f:
        key = {}
        for line in f:
            line = line.strip()
            if not line:
                continue
            num, ans = line.split("->")
            key[int(num.strip())] = [int(a) for a in ans.strip().split(",")]
    with open(OUT, encoding="utf-8") as f:
        data = json.load(f)

    by_num = {q["number"]: q for q in data["questions"]}

    subject = paper[paper.find("SECTION-A"):]
    starts = {}
    for m in re.finditer(r"^(\d{1,3})\.\s", subject, re.M):
        starts.setdefault(int(m.group(1)), m.start())

    def block_for(qnum):
        i = starts.get(qnum)
        if i is None:
            return None
        j = starts.get(qnum + 1, i + 2000)
        return subject[i:j]

    def set_options(q, texts):
        q["options"] = [{"label": str(i), "text": t} for i, t in enumerate(texts, 1)]

    for q in data["questions"]:
        for key_ in ("text",):
            q[key_] = fix_mojibake(q[key_])
        for o in q["options"]:
            o["text"] = fix_mojibake(o["text"])

    # --- rebuild the 39 match questions from official paper text ---
    for n in MATCH_QS:
        q = by_num[n]
        blk = block_for(n)
        if blk is None:
            print(f"WARN: no official block for Q{n}")
            continue
        if n in MATCH_IMAGE_TABLE:
            lines = [l.strip() for l in blk.splitlines() if l.strip() and l.strip() not in ("www.prepp.in",)]
            title = re.sub(r"^\d{1,3}\.\s*", "", lines[0]).strip()
            footer = next((l for l in lines if re.match(r"^Choose\s+the\s+correct", l, re.I)), "")
            text = title + ("\n" + footer if footer else "")
        else:
            text = parse_match_block(blk, n)
        q["text"] = text
        if len(q["options"]) != 4:
            opt_lines = [l for l in blk.splitlines() if re.match(r"^\(\d\)\s", l.strip())]
            if not opt_lines:
                opt_lines = [l for l in blk.splitlines() if re.match(r"^\d\.\s*[A-D]", l.strip())]
            set_options(q, [re.sub(r"^\(\d\)\s*|^\d\.\s*", "", l.strip()) for l in opt_lines])

    # --- specials ---
    q50 = by_num[50]
    blk = block_for(50)
    opt_lines = [l for l in blk.splitlines() if re.match(r"^\(\d\)\s", l.strip())]
    set_options(q50, [re.sub(r"^\(\d\)\s*", "", l.strip()) for l in opt_lines])

    q99 = by_num[99]
    q99["text"] = "Major products A and B formed in the following reaction sequence, are:"
    set_options(q99, ["", "", "", ""])

    q189 = by_num[189]
    blk = block_for(189)
    stem = blk.splitlines()[0].strip()
    q189["text"] = re.sub(r"^\d{1,3}\.\s*", "", stem)
    opt_lines = [l for l in blk.splitlines() if re.match(r"^\(\d\)\s", l.strip())]
    set_options(q189, [re.sub(r"^\(\d\)\s*", "", l.strip()) for l in opt_lines])

    q199 = by_num[199]
    blk = block_for(199)
    lines = [l.strip() for l in blk.splitlines() if l.strip() and l.strip() != "www.prepp.in"]
    parts = []
    opts = []
    in_opts = False
    for l in lines:
        if re.match(r"^\(\d\)\s", l):
            in_opts = True
            opts.append(re.sub(r"^\(\d\)\s*", "", l))
        else:
            in_opts = False
            parts.append(re.sub(r"^\d{1,3}\.\s*", "", l))
    q199["text"] = "\n".join(parts)
    set_options(q199, opts)

    q20 = by_num[20]
    q20["options"][3]["text"] = "A, B, C and D only"

    # --- insert Q100 (CHEMISTRY) and Q150 (BOTANY) ---
    def build_insert(qnum, section):
        blk = block_for(qnum)
        lines = [l.strip() for l in blk.splitlines() if l.strip()]
        lines = [l for l in lines if l != "www.prepp.in" and not re.fullmatch(r"\d{1,3}", l)]
        stem = re.sub(r"^\d{1,3}\.\s*", "", lines[0])
        opts = [re.sub(r"^\d\.\s*", "", l) for l in lines if re.match(r"^\d\.\s", l)]
        if not opts:
            opts = [re.sub(r"^\(\d\)\s*", "", l) for l in lines if re.match(r"^\(\d\)\s", l)]
        return {
            "section": section,
            "number": qnum,
            "text": stem,
            "options": [{"label": str(i), "text": t} for i, t in enumerate(opts, 1)],
            "answers": [],
            "solution": [],
            "page": 14 if qnum == 100 else 20,
            "images": [],
        }

    a100 = build_insert(100, "CHEMISTRY")
    a150 = build_insert(150, "BOTANY")
    for q in data["questions"]:
        if q["number"] == 100:
            q.update(a100)
            break
    else:
        data["questions"].append(a100)
    for q in data["questions"]:
        if q["number"] == 150:
            q.update(a150)
            break
    else:
        data["questions"].append(a150)

    # --- answers from official key ---
    for q in data["questions"]:
        q["answers"] = list(key.get(q["number"], []))

    # --- sections by number ---
    for q in data["questions"]:
        n = q["number"]
        q["section"] = "PHYSICS" if n <= 50 else "CHEMISTRY" if n <= 100 else "BOTANY" if n <= 150 else "ZOOLOGY"

    data["questions"].sort(key=lambda q: q["number"])
    data["questionCount"] = len(data["questions"])

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # --- validation report ---
    nums = [q["number"] for q in data["questions"]]
    print("count:", len(nums), "| contiguous:", nums == list(range(1, 201)))
    bad = [n for n, q in zip(nums, data["questions"]) if len(q["options"]) != 4]
    print("not 4 options:", bad)
    noans = [q["number"] for q in data["questions"] if not q["answers"]]
    print("no answers:", noans)
    badans = [q["number"] for q in data["questions"] if not set(q["answers"]) <= {1, 2, 3, 4}]
    print("bad answer values:", badans)
    for sec in ("PHYSICS", "CHEMISTRY", "BOTANY", "ZOOLOGY"):
        cnt = sum(1 for q in data["questions"] if q["section"] == sec)
        print(sec, cnt)


if __name__ == "__main__":
    main()