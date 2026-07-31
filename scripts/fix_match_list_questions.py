#!/usr/bin/env python3
"""Rebuild 'Match List-I with List-II' question stems from the paper PDFs.

The original hand-written TS data either (a) merged the answer key into the
stem ("A. X -> III. Y") or (b) dropped List-II entirely. This script parses
the PDF's two-column table and emits an idempotent migration that fixes the
questions.text column.

Approach (all positions come from PyMuPDF rawdict per-char bboxes):
  * The table boundary is the x of the "List-II" header span.
  * List-II labels I.-IV. anchor the rows; row y-windows are label midpoints.
  * Within a row, characters are clustered into visual lines by baseline y
    (small sub/superscript chars attach to their nearest big char by x).
  * Sub/superscripts are decided by y vs the line baseline (flags are
    unreliable in these PDFs, so they are only a tiebreak).
  * A fraction (numerator/denominator straddling the row baseline) is
    detected by a pair of short lines above/below the baseline with
    overlapping x and 8-25 pt separation; "√(num/den)" gets radical parens.
  * Paragraph lines (context like "where h, G and c are ...") span both
    columns and carry no List-II label; they are kept as context lines.
  * Column sub-headers (e.g. "Mass of substance" / "Number of atoms") are
    folded into the title: "Match List-I (X) with List-II (Y):".

Usage: python3 fix_match_list_questions.py > /tmp/fix_match.sql
"""
import re
import sys
import fitz

PDFS = {
    1: "/tmp/opencode/qi/JEE Main 2026 02 April Morning Shift Questions.pdf",
    2: "/tmp/opencode/qi/JEE Main 2026 02 April Evening Shift Questions.pdf",
    3: "/tmp/opencode/qi/JEE Main 2026 04 April Morning Shift Questions.pdf",
    4: "/tmp/opencode/qi/JEE Main 2026 04 April Evening Shift Questions.pdf",
    5: "/tmp/opencode/qi/JEE Main 2026 05 April Morning Shift Questions.pdf",
    6: "/tmp/opencode/qi/JEE Main 2026 05 April Evening Shift Questions.pdf",
    7: "/tmp/opencode/qi/JEE Main 2026 06 April Morning Shift Questions.pdf",
    8: "/tmp/opencode/qi/JEE Main 2026 06 April Evening Shift Questions.pdf",
    9: "/tmp/opencode/qi/JEE Main 2026 08 April Evening Shift Questions.pdf",
}

QUESTIONS = [
    1062, 1067, 1069, 3062, 3065, 3069, 4026, 4056, 4070, 6026,
    6035, 6062, 7053, 7061, 7069, 7070, 8027, 8054, 9051, 9058,
]

SUP = str.maketrans(
    "0123456789+-=()n−abcdefghijklmnoprstuvwxyz",
    "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ⁻ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ")
SUB = str.maketrans(
    "0123456789+-=()aeoxhklmnpst−ijkruv",
    "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₕₖₗₘₙₚₛₜ₋ᵢⱼₖᵣᵤᵥ")

ANCHOR_RE = re.compile(r"^([A-D])\.\s?")
LABEL_RE = re.compile(r"^(?:I|II|III|IV)\.")
HEADER_I_RE = re.compile(r"^List\s*-?\s*I\b", re.I)
HEADER_II_RE = re.compile(r"^List\s*-?\s*II", re.I)
HEADER_I_PAREN_RE = re.compile(r"^List\s*-?\s*I\s*\((.*)\)$", re.I)
HEADER_II_PAREN_RE = re.compile(r"^List\s*-?\s*II\s*\((.*)\)$", re.I)
CHOOSE_RE = re.compile(r"^Choose\s+the\s+correct", re.I)

CLUSTER_Y = 4.0   # max baseline gap within a visual line
ATTACH_Y = 5.0    # max vertical gap between a small char and its big neighbor
SUP_OFFSET = 0.0  # y offset (vs baseline) that decides sub/superscript
FRAC_MIN = 8.0    # min separation between fraction numerator and denominator
FRAC_MAX = 25.0
FRAC_XGAP = 4.0   # max horizontal gap between fraction parts
FRAC_CHARS = 8    # max chars in a fraction part


def find_question_block(doc, qnum):
    """Locate the Q<qnum>. marker and the following match table block."""
    for pno, page in enumerate(doc):
        spans = []
        d = page.get_text("rawdict")
        for block in d["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                text = "".join(c["c"] for s in line["spans"] for c in s["chars"])
                if not text.strip():
                    continue
                spans.append((line["bbox"][1], line["bbox"][0], text.strip(), line))
        spans.sort(key=lambda s: (s[0], s[1]))

        for i, (y, x, text, line) in enumerate(spans):
            if text != f"Q{qnum}.":
                continue
            rest = spans[i + 1:]
            block_spans = []
            for (ry, rx, rtext, rline) in rest:
                if re.match(r"^Q\d+\.$", rtext):
                    break
                if "MathonGo Answer Key" in rtext:
                    break
                block_spans.append((ry, rx, rtext, rline))
            return page, block_spans
    raise RuntimeError(f"Q{qnum} not found")


def flatten(block_spans):
    """Flatten all spans to per-char records with bboxes."""
    out = []
    for (y, x, text, line) in block_spans:
        for span in line["spans"]:
            st = "".join(c["c"] for c in span["chars"])
            m = ANCHOR_RE.match(st)
            prefix = len(m.group(0)) if m else 0
            for i, ch in enumerate(span["chars"]):
                out.append({
                    "x0": ch["bbox"][0], "y0": ch["bbox"][1], "x1": ch["bbox"][2],
                    "size": span["size"], "flags": span["flags"], "ch": ch["c"],
                    "drop": i < prefix,
                })
    return out


def make_lines(chars):
    """Cluster chars into visual lines (big chars by y; smalls attach by x)."""
    big = [c for c in chars if c["size"] >= 9.5]
    small = [c for c in chars if c["size"] < 9.5]
    lines = []
    for c in sorted(big, key=lambda c: (c["y0"], c["x0"])):
        if lines and c["y0"] - lines[-1]["rep"] < CLUSTER_Y:
            lines[-1]["chars"].append(c)
        else:
            lines.append({"rep": c["y0"], "chars": [c]})
    runs = []
    for c in sorted(small, key=lambda c: (c["y0"], c["x0"])):
        if runs and c["y0"] - runs[-1]["rep"] < CLUSTER_Y:
            runs[-1]["chars"].append(c)
        else:
            runs.append({"rep": c["y0"], "chars": [c]})
    for run in runs:
        rx0 = min(c["x0"] for c in run["chars"])
        rx1 = max(c["x1"] for c in run["chars"])
        best, best_gap = None, float("inf")
        for b in big:
            gap = max(0.0, rx0 - b["x1"], b["x0"] - rx1)
            if b["x0"] >= rx1:
                gap += 3.0  # penalize bases entirely to the right of the run
            if b["ch"] == " ":
                gap += 1.0  # penalize spaces as attach targets
            if abs(run["rep"] - b["y0"]) <= ATTACH_Y and gap < best_gap:
                best, best_gap = b, gap
        if best is None:
            lines.append(run)
        else:
            for ln in lines:
                if best in ln["chars"]:
                    ln["chars"].extend(run["chars"])
                    break
    return lines


def line_baseline(line):
    bigs = [c for c in line["chars"] if c["size"] >= 9.5]
    if not bigs:
        return line["rep"]
    return sum(c["y0"] for c in bigs) / len(bigs)


def local_baseline(line, x):
    """Baseline near x: average of the 2 nearest non-space big chars."""
    bigs = [c for c in line["chars"]
            if c["size"] >= 9.5 and c["ch"] != " "]
    if not bigs:
        return None
    near = sorted(bigs, key=lambda c: max(0.0, x - c["x1"], c["x0"] - x))[:2]
    return sum(c["y0"] for c in near) / len(near)


def line_text(line, column=None, boundary=None):
    """Convert a line's chars to text, x-sorted. column: 'left'/'right' filter."""
    baseline = line_baseline(line)
    items = []
    for c in line["chars"]:
        if c["drop"]:
            continue
        if column == "left" and c["x0"] >= boundary:
            continue
        if column == "right" and c["x0"] < boundary:
            continue
        items.append((c["x0"], conv(c, baseline, line)))
    items.sort(key=lambda it: it[0])
    return "".join(t for _, t in items)


def conv(c, baseline=None, line=None):
    ch = c["ch"]
    if c["size"] >= 9.5:
        return ch
    if ch == " ":
        return ""
    if line is not None:
        baseline = local_baseline(line, c["x0"])
    if baseline is None:
        baseline = c["y0"]
    d = c["y0"] - baseline
    if d < -SUP_OFFSET:
        return ch.translate(SUP)
    if d > SUP_OFFSET:
        s = ch.translate(SUB)
        if s == ch and ch.isalpha():
            return "_" + ch  # no Unicode subscript (e.g. N_A)
        return s
    return ch.translate(SUP if (c["flags"] & 1) else SUB)


def line_conv_chars(line, column, boundary):
    """Per-char converted text in x order, for interleaving with fractions."""
    baseline = line_baseline(line)
    out = []
    for c in line["chars"]:
        if c["drop"]:
            continue
        if column == "right" and c["x0"] < boundary:
            continue
        if column == "left" and c["x0"] >= boundary:
            continue
        out.append((c["x0"], conv(c, baseline, line)))
    out.sort(key=lambda it: it[0])
    return out


def line_xrange(line, boundary):
    """(min x0, max x1) of a line's right-column chars, or None."""
    xs = [c["x0"] for c in line["chars"] if c["x0"] >= boundary]
    if not xs:
        return None
    return min(xs), max(c["x1"] for c in line["chars"] if c["x0"] >= boundary)


def parse_table(page, block_spans):
    chars = flatten(block_spans)

    boundary = None
    list1_y = list2_y = None
    for (y, x, text, line) in block_spans:
        for span in line["spans"]:
            st = "".join(c["c"] for c in span["chars"]).strip()
            sx, sy = span["bbox"][0], span["bbox"][1]
            if boundary is None and HEADER_II_RE.match(st):
                boundary = sx
                list2_y = sy
            if list1_y is None and HEADER_I_RE.match(st):
                list1_y = sy
    if boundary is None:
        boundary = 115.0

    choose_y = None
    for (y, x, text, line) in block_spans:
        if CHOOSE_RE.match(text):
            choose_y = y
            break
    if choose_y is None:
        choose_y = max(y for (y, x, t, l) in block_spans) + 1.0

    labels = []
    for (y, x, text, line) in block_spans:
        for span in line["spans"]:
            st = "".join(c["c"] for c in span["chars"]).strip()
            sx, sy = span["bbox"][0], span["bbox"][1]
            if sx < boundary or sy >= choose_y:
                continue
            if LABEL_RE.match(st):
                labels.append(sy)
                break
    labels = sorted(set(labels))
    if len(labels) != 4:
        raise RuntimeError(f"expected 4 List-II labels, got {labels}")

    # column sub-headers: from header parens, else first line below the header
    lsub = rsub = None
    for (y, x, text, line) in block_spans:
        for span in line["spans"]:
            st = "".join(c["c"] for c in span["chars"]).strip()
            m = HEADER_I_PAREN_RE.match(st)
            if m and lsub is None:
                lsub = m.group(1).strip()
            m = HEADER_II_PAREN_RE.match(st)
            if m and rsub is None:
                rsub = m.group(1).strip()
    if lsub is None or rsub is None:
        header_y = max(list1_y or 0, list2_y or 0)
        for ln in sorted(make_lines(
                [c for c in chars if header_y < c["y0"] < labels[0] - 8]),
                key=lambda l: l["rep"]):
            left = [c for c in ln["chars"] if c["x0"] < boundary and not c["drop"]]
            right = [c for c in ln["chars"] if c["x0"] >= boundary]
            if lsub is None and left:
                lsub = line_text(ln, "left", boundary).strip()
            if rsub is None and right:
                rsub = line_text(ln, "right", boundary).strip()
    lsub = lsub or ""
    rsub = rsub or ""

    title = "Match List-I with List-II"
    if lsub and rsub:
        title = f"Match List-I ({lsub}) with List-II ({rsub})"
    elif lsub:
        title = f"Match List-I ({lsub}) with List-II"
    elif rsub:
        title = f"Match List-I with List-II ({rsub})"
    title += ":"

    # stem (title) line above the List headers; may carry trailing context
    stem_chars = [c for c in chars if list1_y is not None and c["y0"] < list1_y]
    stem_lines = sorted(make_lines(stem_chars), key=lambda l: l["rep"])
    context = []
    if stem_lines:
        stem_text = line_text(stem_lines[0]).strip()
        m = re.match(r"^(Match\b.*?List\s*-\s*II[^.]*\.)\s*(.*)$", stem_text, re.I)
        if m and m.group(2).strip():
            context.append(m.group(2).strip())

    wins = [
        (labels[0] - 15.0, (labels[0] + labels[1]) / 2),
        ((labels[0] + labels[1]) / 2, (labels[1] + labels[2]) / 2),
        ((labels[1] + labels[2]) / 2, (labels[2] + labels[3]) / 2),
        ((labels[2] + labels[3]) / 2, choose_y),
    ]

    rows = []
    for idx, (lo, hi) in enumerate(wins):
        label_y = labels[idx]
        lines = make_lines([c for c in chars if lo <= c["y0"] < hi])
        table_lines, paras = [], []
        for ln in lines:
            rights = [c for c in ln["chars"] if c["x0"] >= boundary]
            lefts = [c for c in ln["chars"] if c["x0"] < boundary]
            has_label = any(abs(c["y0"] - label_y) < 2.0 for c in ln["chars"])
            if not has_label and len(rights) >= 8 and lefts:
                paras.append(ln)
            else:
                table_lines.append(ln)
        for ln in paras:
            context.append(line_text(ln).strip())

        # ---- left column ----
        left_items = []
        for ln in table_lines:
            left_items.extend(line_conv_chars(ln, "left", boundary))
        left_text = "".join(t for _, t in sorted(left_items, key=lambda it: it[0])).strip()

        # ---- right column ----
        right_lines = [ln for ln in table_lines
                       if any(c["x0"] >= boundary for c in ln["chars"])]
        nums = [ln for ln in right_lines
                if line_baseline(ln) < label_y - 4.0
                and sum(1 for c in ln["chars"] if c["x0"] >= boundary) <= FRAC_CHARS]
        dens = [ln for ln in right_lines
                if line_baseline(ln) > label_y + 4.0
                and sum(1 for c in ln["chars"] if c["x0"] >= boundary) <= FRAC_CHARS]
        pairs, used_dens = [], set()
        for n in sorted(nums, key=line_baseline):
            best, best_dy = None, float("inf")
            nx = line_xrange(n, boundary)
            for d in dens:
                if id(d) in used_dens:
                    continue
                dx = line_xrange(d, boundary)
                dy = line_baseline(d) - line_baseline(n)
                xgap = max(0.0, dx[0] - nx[1], nx[0] - dx[1])
                if FRAC_MIN <= dy <= FRAC_MAX and xgap <= FRAC_XGAP and dy < best_dy:
                    best, best_dy = d, dy
            if best is not None:
                pairs.append((n, best))
                used_dens.add(id(best))

        right_items = []
        for ln in right_lines:
            if any(ln is p[0] or ln is p[1] for p in pairs):
                continue
            right_items.extend(line_conv_chars(ln, "right", boundary))
        for n, d in pairs:
            nt = line_text(n, "right", boundary).strip()
            dt = line_text(d, "right", boundary).strip()
            if nt.startswith("√"):
                frac = f"√({nt[1:]}/{dt})"
            else:
                frac = f"{nt}/{dt}"
            fx = min(c["x0"] for c in n["chars"] if c["x0"] >= boundary)
            right_items.append((fx, frac))
        right_items.sort(key=lambda it: it[0])
        right_text = "".join(t for _, t in right_items).strip()
        right_text = re.sub(r"^(IV|III|II|I)\.(?=\S)", r"\1. ", right_text)

        rows.append((chr(ord("A") + idx), left_text, right_text))

    return title, context, rows


def normalize(t):
    t = re.sub(r"=(?=\S)", "= ", t)
    t = re.sub(r"(?<=\S)=(?=\s)", " =", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip()


def escape(s):
    return s.replace("\\", "\\\\").replace("'", "''").replace("\n", "\\n")


def main():
    out = []
    out.append("-- Fix Match List-I / List-II question stems (rebuilt from PDFs).")
    out.append("")
    for qid in QUESTIONS:
        paper_id = qid // 1000
        qnum = qid % 1000
        doc = fitz.open(PDFS[paper_id])
        try:
            page, block = find_question_block(doc, qnum)
            title, context, rows = parse_table(page, block)
        except Exception as e:
            print(f"-- FAIL {qid}: {e}", file=sys.stderr)
            out.append(f"-- qid {qid}: ERROR {e}")
            doc.close()
            continue
        doc.close()

        if len(rows) != 4:
            out.append(f"-- qid {qid}: expected 4 rows, got {len(rows)}")
            continue
        if any(not left or not right for _, left, right in rows):
            out.append(f"-- qid {qid}: empty left/right cell")
            continue

        body = [title]
        body.extend(normalize(c) for c in context)
        for letter, left, right in rows:
            body.append(f"{letter}. {normalize(left)}  {normalize(right)}")
        text = "\n".join(body)
        out.append(f"update public.questions set text = E'{escape(text)}' where id = {qid};")
        out.append("")

    print("\n".join(out))


if __name__ == "__main__":
    main()
