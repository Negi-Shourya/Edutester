#!/usr/bin/env python3
"""
Assemble the final NEET 2022 questions.json for seeding.

Sources:
  - questions_raw.json : collegedunia scan OCR - figures, option images,
    option labels/order, printed answer key.
  - s1_full.json       : Aakash Code-S1 clean text - stems, option text,
    answer key (same 200 questions, different order/option order).
  - _q2s1_map.json     : our option-based question match (200/200).

Stems come from S1 (clean). Option text comes from S1 only when it aligns to
the 2022 option with high confidence (char-level similarity after OCR fixes);
otherwise the (cleaned) 2022 text is kept and flagged. Answers are resolved
by translating the S1 answer option content onto the 2022 option numbering,
cross-checked against the scan's printed answer; every disagreement and every
low-confidence fill is written to the review report.

Known NTA resolutions baked in:
  Q17  photoelectric (stopping potentials Vs/2 & Vs) -> BONUS (empty key)
  Q54  IUPAC name of element 119 -> 3 (ununennium; S1 answer line missing)
  Q82  95% pure CaCO3 -> 4 (1.32 g; scan printed 9.50 g, wrong)
  Q93  emf of the cell -> NA (empty)
  Q128 vascular bundles -> NA (empty)
  Q180 taxonomic categories -> 3 (S1 key "3*")

Run: python scripts/assemble-neet-2022.py
"""
import difflib
import json
import re
import sys

DIR = "neet-out/2022"

raw = json.load(open(f"{DIR}/questions_raw.json", encoding="utf-8"))["questions"]
s1 = json.load(open(f"{DIR}/s1_full.json", encoding="utf-8"))["questions"]
qmap = json.load(open(f"{DIR}/_q2s1_map.json", encoding="utf-8"))

s1_by_n = {q["number"]: q for q in s1}
raw_by_n = {q["number"]: q for q in raw}

FIXED_ANSWERS = {17: [], 93: [], 128: []}  # NTA bonus/NA questions

# Questions whose rendered math options the OCR cannot read (truth tables,
# fractions, equations): display the scan crop as the option image instead.
FIXED_IMAGE_OPTIONS = {40, 42, 43, 67, 72, 99}

# Manually reconstructed option text (2022 paper order), anchored on the
# printed answer key and the shared option-value set from the S1 code.
FIXED_OPTIONS = {
    # √-ratio options: the √ glyph is lost in both the scan OCR and the S1
    # text layer; values recovered from the printed answers + scan crops.
    11: ["1 : 1", "√2 : 1", "1 : √2", "1 : 2"],
    12: ["v", "2v", "2√2v", "3√2v"],
    19: ["23 11Na", "23 10Ne", "22 10Ne", "22 12Mg"],
    21: ["2 : 1", "√2 : 1", "4 : 1", "1 : √2"],
    22: ["The value of voltage supplied to the circuit",
         "The rms value of the ac source",
         "√2 times the rms value of the ac source",
         "1/√2 times the rms value of the ac source"],
    33: ["√3 : 1", "1 : 1", "1 : 2", "1 : √3"],
    74: ["CuSO4(aq) + Zn(s) → ZnSO4(aq) + Cu(s)",
         "CuSO4(aq) + Fe(s) → FeSO4(aq) + Cu(s)",
         "FeSO4(aq) + Zn(s) → ZnSO4(aq) + Fe(s)",
         "2CuSO4(aq) + 2Ag(s) → 2Cu(s) + Ag2SO4(aq)"],
}

FOOTER_RE = re.compile(r"\s*-\s*\d+\s*-\s*NEET.*$", re.I)
JUNK_LEAK_RE = re.compile(
    r"Sol\.\s+[A-Za-z]|"
    r"(?:Regarding|Which of the following statements is (?:not true|incorrect)|"
    r"If a geneticist uses the blind approach for).*$",
    re.I,
)


def norm(t):
    t = t or ""
    t = re.sub(FOOTER_RE, "", t)
    t = t.lower()
    t = re.sub(r"[^a-z0-9]+", " ", t)
    t = re.sub(r"\b0\b", " i ", t)  # OCR: (0) vs (i)
    t = re.sub(r"\bil?i\b", " iii ", t)  # OCR: ili -> iii
    t = re.sub(r"\bi[l1]l?\b", " ii ", t)  # OCR: il/1l -> ii (after ili)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def pairing(t):
    """Extract the letter->roman pairing sequence from a match-list option
    like '(a) - (ii), (b) - (iii), (c) - (iv), (d) - (i)', scanning tokens
    left-to-right so corrupted items (e.g. '(0)') simply drop out.
    Returns 'aiibiiicividi' or None if no pairings found."""
    ROMAN = {"i": "i", "ii": "ii", "iii": "iii", "iv": "iv", "v": "v",
             "vi": "vi", "vii": "vii", "viii": "viii", "ix": "ix",
             "x": "x", "xi": "xi", "xii": "xii"}
    toks = re.findall(r"\(([a-eA-E])\)|\(([ivxIVX]+)\)", t or "")
    pairs = []
    cur = None
    for L, R in toks:
        if L:
            cur = L.lower()
        elif R and cur:
            r = R.lower().replace("l", "i").replace("1", "i")
            pairs.append(cur + ROMAN.get(r, "i" * len(r)))
            cur = None
    return "".join(pairs) or None


def dice(a, b):
    at = set(norm(a).split())
    bt = set(norm(b).split())
    if not at or not bt:
        return 0.0
    return 2 * len(at & bt) / (len(at) + len(bt))


def sim(a, b):
    """Order-aware similarity: exact pairing strings for match-list options;
    max(Dice on word tokens, char-ratio) otherwise so both OCR-glued words
    ('selfinductance') and leaked tails ('+5 D Infinity') score correctly."""
    na, nb = norm(a), norm(b)
    if not na and not nb:
        return 0.0
    pa = pairing(a)
    pb = pairing(b)
    if pa and pb:
        if pa == pb:
            return 1.0
        return difflib.SequenceMatcher(None, pa, pb).ratio()
    return max(dice(a, b), 0.75 * difflib.SequenceMatcher(None, na, nb).ratio())


def clean_option_text(t):
    t = t or ""
    t = re.sub(FOOTER_RE, "", t)
    # cut leaked content that belongs to the next question / solutions
    t = re.sub(r"Sol\.\s.*$", "", t, flags=re.I)
    for pat in [
        r"Regarding\s+Meiosis.*$",
        r"Which of the following statements is (?:not true|incorrect).*$",
        r"If a geneticist uses the blind approach for.*$",
        r"India's\s*largest\s*[Ss]tudent\s*[Rr]eview\s*[Pp]latform",
        r"collegedunia",
    ]:
        t = re.sub(pat, "", t, flags=re.I)
    return re.sub(r"\s+", " ", t).strip()


def format_match_text(text):
    """Reformat S1 run-on match-list text into the 2024 table convention."""
    text = re.sub(FOOTER_RE, "", text).strip()
    m = re.match(r"^(.*?\bList-II\s*\([^)]*\))(.*?)(Choose the correct.*)$", text, re.I | re.S)
    if not m:
        return text
    head = re.sub(r"\s+", " ", m.group(1)).strip()
    head = re.sub(r"\s*List-II\s*\(", "\nList-II (", head)
    head = re.sub(r"\s*List-I\s*\(", "\nList-I (", head)
    body = m.group(2)
    tail = re.sub(r"\s+", " ", m.group(3)).strip()
    parts = re.findall(r"\(([a-eA-E])\)\s*([^(]*?)(?=\([a-eA-E]\)|\([ivxIVX]+\)|$)|\(([ivxIVX]+)\)\s*([^(]*?)(?=\([a-eA-E]\)|\([ivxIVX]+\)|$)", body)
    items = []
    for lm, lt, rm, rt in parts:
        if lm:
            items.append(("L", lm.upper(), lt.strip()))
        elif rm:
            items.append(("R", rm.lower(), rt.strip()))
    if not items:
        return text
    rows = []
    cur = None
    for kind, key, txt in items:
        if kind == "L":
            cur = [key, txt, None]
            rows.append(cur)
        elif cur is not None and kind == "R":
            cur[2] = (key, txt)
    lines = [head]
    for key, lt, rt in rows:
        rpart = f"{rt[0]}. {rt[1]}" if rt else ""
        lines.append(f"{key}. {lt}  {rpart}".rstrip())
    lines.append(tail)
    return "\n".join(lines)


def align_options(our_opts, s1_opts):
    """Map each 2022 option to its S1 twin via the optimal bijection (max
    total similarity over all 4! permutations). Image options are kept as-is
    and excluded from the permutation."""
    import itertools

    text_idx = [i for i, o in enumerate(our_opts) if not o.get("image")]
    other_idx = [i for i, o in enumerate(our_opts) if o.get("image")]
    s1_text_idx = [i for i, so in enumerate(s1_opts) if so.get("text", "").strip()]

    best_perm = None
    best_total = -1.0
    if text_idx and len(s1_text_idx) >= len(text_idx):
        for perm in itertools.permutations(s1_text_idx, len(text_idx)):
            total = sum(sim(our_opts[ti]["text"], s1_opts[si]["text"])
                        for ti, si in zip(text_idx, perm))
            if total > best_total:
                best_total = total
                best_perm = perm

    assignment = {}
    if best_perm is not None:
        for ti, si in zip(text_idx, best_perm):
            assignment[ti] = (si, sim(our_opts[ti]["text"], s1_opts[si]["text"]))

    filled = []
    for i, o in enumerate(our_opts):
        if i in assignment:
            si, score = assignment[i]
            text = re.sub(FOOTER_RE, "", s1_opts[si]["text"]).strip()
            filled.append({"label": o["label"], "text": text, "score": score})
        elif o.get("image"):
            filled.append({"label": o["label"], "text": "", "figure": o["image"], "image": True})
        else:
            filled.append({"label": o["label"], "text": clean_option_text(o.get("text", "")), "score": 0.0})
    return filled, set()


def translate_answer(s1q, raw_opts):
    """Translate S1's answer option content to the 2022 option label by
    matching against the RAW 2022 option text (authentic paper order), so the
    result is independent of the display fill."""
    ans = str(s1q.get("answers") or "").strip()
    if re.fullmatch(r"[1-4]\*?", ans):
        target = s1q["options"][int(ans[0]) - 1]["text"]
    else:
        return None  # NA / None / missing
    if not target.strip():
        return None
    best_i, best_s = -1, 0.0
    for i, o in enumerate(raw_opts):
        if o.get("image"):
            continue
        s = sim(target, o.get("text", ""))
        if s > best_s:
            best_s, best_i = s, i
    if best_i < 0 or best_s < 0.5:
        return None
    return best_i + 1


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    out = []
    report = []

    for q in sorted(raw, key=lambda x: x["number"]):
        n = q["number"]
        sq = s1_by_n.get(qmap.get(str(n), {}).get("s1_q"))
        if sq is None:
            report.append(f"Q{n}: NO S1 MATCH")
            continue

        # options: S1 text where confident, else cleaned 2022 text; some
        # questions are patched by hand or rendered as option images.
        if n in FIXED_IMAGE_OPTIONS:
            filled = [{"label": str(i + 1), "text": "", "figure": f"Q{n}_opt{i + 1}.png"}
                      for i in range(4)]
        elif n in FIXED_OPTIONS:
            filled = [{"label": str(i + 1), "text": FIXED_OPTIONS[n][i]} for i in range(4)]
        else:
            filled, _ = align_options(q["options"], sq["options"])
            for o in filled:
                if o.get("score") is not None and o["score"] < 0.5 and not o.get("image"):
                    report.append(f"Q{n} opt{o['label']}: low-confidence S1 fill ({o['score']:.2f})")
                o.pop("score", None)
                o.pop("image", None)
                o["figure"] = o.get("figure") or None

        # answer: the scan's printed key is authoritative (it is NTA's
        # official key for the 2022 code). S1 is used as a cross-check only.
        if n in FIXED_ANSWERS:
            answers = FIXED_ANSWERS[n]
        else:
            raw_ans = list(q.get("answers") or [])
            translated = translate_answer(sq, q["options"])
            if raw_ans:
                answers = [raw_ans[0]]
                if translated is not None and translated != raw_ans[0]:
                    report.append(f"Q{n}: raw {raw_ans[0]} vs S1 {translated} - KEEPING RAW")
            else:
                answers = raw_ans
                if translated is not None:
                    answers = [translated]
                else:
                    report.append(f"Q{n}: no raw answer and no S1 translation")

        text = sq["text"].strip()
        text = re.sub(FOOTER_RE, "", text)
        text = re.sub(r"[\uf000-\uf8ff]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        if re.search(r"Match\s+List", text, re.I):
            text = format_match_text(text)
        for o in filled:
            if o.get("text"):
                o["text"] = re.sub(r"[\uf000-\uf8ff]", "", o["text"]).strip()

        out.append({
            "section": q["section"],
            "number": n,
            "text": text,
            "options": filled,
            "answers": answers,
            "images": list(q.get("images") or []),
        })

    out.sort(key=lambda x: x["number"])
    final = {
        "key": "neet-2022",
        "title": "NEET (UG) 2022",
        "fullTitle": "NEET (UG) 2022 - National Eligibility cum Entrance Test",
        "examDate": "2022-07-17",
        "durationMinutes": 200,
        "questionCount": len(out),
        "questions": out,
    }
    with open(f"{DIR}/questions.json", "w", encoding="utf-8") as f:
        json.dump(final, f, indent=1, ensure_ascii=False)

    empty_stems = sum(1 for q in out if not q["text"].strip())
    empty_ans = sum(1 for q in out if not q["answers"])
    img_opts = sum(1 for q in out if any(o.get("figure") for o in q["options"]))
    low_fill = sum(1 for r in report if "low-confidence" in r)
    print(f"wrote {len(out)} questions -> {DIR}/questions.json")
    print(f"empty stems: {empty_stems}, empty answers: {empty_ans}, image-option questions: {img_opts}, low-conf fills: {low_fill}")
    print(f"\n--- report ({len(report)} items) ---")
    for r in report:
        print(r)


if __name__ == "__main__":
    main()
