#!/usr/bin/env python3
"""Extract NEET (Aakash) question-paper PDFs into structured JSON + images.

Each PDF is an "Answers & Solutions" booklet: questions with (1)-(4) options,
an "Answer (n)" line, then a "Sol." block — all interleaved per question.
Text is read in PDF reading order (page.get_text() handles multi-column
layouts correctly). Images are attributed to the question whose marker is
nearest above them (same approach as scripts/extract_paper_images.py).

Usage:
  python3 scripts/extract_neet.py <pdf> <year> <out_dir> --date YYYY-MM-DD \
      --title "NEET (UG) 2025" [--duration 180] [--key neet-2025]

Outputs:
  <out_dir>/neet-<year>/questions.json
  <out_dir>/neet-<year>/images/Q<n>[_<k>].<ext>
"""
import argparse
import json
import os
import re
from collections import Counter, defaultdict

import fitz

SECTION_NAMES = ("PHYSICS", "CHEMISTRY", "BIOLOGY", "BOTANY", "ZOOLOGY")
MARKER_RE = re.compile(r"^(\d{1,3})\.\s*$")
INLINE_MARKER_RE = re.compile(r"^(\d{1,3})\.\s+(\S.*)$")
OPTION_RE = re.compile(r"^\((\d)\)(?:\s*)(.*)$")
ANSWER_RE = re.compile(r"^Answer\s*\(([^)]*)\)\s*(.*)$")
SOL_RE = re.compile(r"^Sol\.?\s*(.*)$")
MIN_EDGE = 30  # skip tiny images (logo pixels, decorations)

# Aakash's custom math font glyphs (private-use unicode) -> plain text.
GLYPH_MAP = {
    "\uf04c": "Λ",   # uppercase lambda
    "\uf044": "Δ",   # delta
    "\uf061": "α",   # alpha
    "\uf062": "β",   # beta
    "\uf067": "γ",   # gamma
    "\uf073": "σ",   # sigma
    "\uf06c": "ℓ",   # small ell
    "\uf06d": "μ",   # micro
    "\uf0b0": "°",   # degree
    "\uf083": "⇌",   # equilibrium arrow
    "\uf0de": "→",   # arrow
    "\uf0d7": "×",   # times
    "\uf0c5": "⚥",   # floral formula (bisexual)
    "\uf0b4": "×",
    "\uf0a2": "∞",
    "\uf0bc": "≈",
    "\uf03b": ";",
    "\uf0eb": "⌈",
    "\uf0fb": "⌉",
    "\uf0ef": "⌊",
    "\uf0ff": "⌋",
}


def normalize_text(s):
    """Restore readable math markup from Aakash's glyph soup."""
    # vector arrows: letter (+ newline/space) followed by the arrow glyph
    s = re.sub(r"([A-Za-z])\s*\n?\uf072", r"\\vec{\1}", s)
    # plain glyph replacements
    for glyph, plain in GLYPH_MAP.items():
        s = s.replace(glyph, plain)
    # strip any remaining private-use characters (layout brackets etc.)
    s = "".join(ch if ord(ch) < 0xE000 else "" for ch in s)
    # superscript exponents written inline: "× 104" -> "× 10^{4}"
    s = re.sub(r"×\s*1(\d{2,3})\b", lambda m: f"× 10^{{{int(m.group(1))}}}", s)
    s = re.sub(r"(?<![×\d])10([–\-])(\d{1,2})\b", r"10^{\1\2}", s)
    # stacked fractions rendered as two numbers on one line: "7 64" -> "7/64"
    s = re.sub(r"^(\d{1,4})\s+(\d{1,4})$", r"\1/\2", s)
    # collapse tripled newlines left by dropped glyphs
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s


def question_markers(page):
    """[(qnumber, y0)] for standalone 'N.' markers on a page, in order."""
    out = []
    d = page.get_text("dict")
    for block in d["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            text = "".join(s["text"] for s in line["spans"]).strip()
            m = MARKER_RE.match(text)
            if m:
                out.append((int(m.group(1)), line["bbox"][1]))
    out.sort(key=lambda x: x[1])
    return out


def page_furniture_xrefs(doc):
    """xrefs reused across many pages are page furniture — the Aakash
    watermark / header logos drawn on every sheet — never question content.
    Real figures are unique (or reused at most twice, question + solution)."""
    pages_per_xref = defaultdict(set)
    for pno, page in enumerate(doc):
        for xref in {im[0] for im in page.get_images(full=True)}:
            if xref > 0:
                pages_per_xref[xref].add(pno)
    return {x for x, pages in pages_per_xref.items() if len(pages) >= 4}


def collect_placements(doc, furniture):
    """List of (page_no, xref, rect) in document order, deduped, excluding
    page-furniture xrefs (watermarks/logos)."""
    seen = set()
    placements = []
    for pno, page in enumerate(doc):
        for xref in {im[0] for im in page.get_images(full=True)}:
            if xref <= 0 or xref in furniture:
                continue
            for rect in page.get_image_rects(xref):
                key = (pno, xref, tuple(round(v, 1) for v in rect))
                if key in seen:
                    continue
                seen.add(key)
                placements.append((pno, xref, rect))
    return placements


def render_placement(page, rect, out_path, pad=4, dpi=200):
    """Render the on-page region of an image placement.

    Aakash figures are encoded as black base images whose real drawing lives
    in an SMask (alpha) channel, so doc.extract_image() returns a solid black
    rectangle. Rendering the page clip makes MuPDF composite the mask and
    produces exactly what a PDF viewer shows (text + vectors included)."""
    clip = fitz.Rect(rect.x0 - pad, rect.y0 - pad, rect.x1 + pad, rect.y1 + pad)
    clip &= page.rect
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), clip=clip, alpha=False)
    pix.save(out_path)
    return "png"


def render_missing_content(doc, valid, out_dir, placed_info):
    """Some Aakash PDFs draw option content (and even question stems) as
    vector graphics with no text layer. Render those regions as images,
    preferring already-extracted raster images when they cover the cell."""
    span_index = []
    for page in doc:
        spans = []
        for block in page.get_text("rawdict")["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    b = span["bbox"]
                    txt = "".join(c["c"] for c in span["chars"]).strip()
                    if txt:
                        spans.append(
                            {"y": (b[1] + b[3]) / 2, "x0": b[0], "x1": b[2], "text": txt}
                        )
        span_index.append(spans)

    for q in valid:
        pno = q["page"] - 1
        if pno < 0 or pno >= len(span_index):
            continue
        spans = span_index[pno]
        page_w = doc[pno].rect.width
        labels = [
            s for s in spans
            if re.match(r"^\(\d\)", s["text"]) and 1 <= int(s["text"][1]) <= 4
        ]
        answers = [s for s in spans if s["text"].startswith("Answer")]
        if not labels and not q["text"]:
            continue

        first_label_y = min((s["y"] for s in labels), default=None)
        own_marker_y = min(
            (s["y"] for s in spans if s["text"] == f"{q['number']}."),
            default=None,
        )
        if own_marker_y is not None:
            q_labels = [s for s in labels if s["y"] >= own_marker_y - 2]
            if q_labels:
                first_label_y = min(s["y"] for s in q_labels)
        prev_ans = [s["y"] for s in answers if first_label_y is None or s["y"] < first_label_y - 5]
        zone_top = max(prev_ans) if prev_ans else 0
        markers = [
            s for s in spans
            if re.match(r"^\d{1,3}\.$", s["text"]) and s["x0"] < 115
            and (first_label_y is None or s["y"] < first_label_y - 5)
        ]
        zone_top = max(zone_top, max((s["y"] for s in markers), default=0))
        below = [
            s["y"] for s in answers
            if first_label_y is not None and s["y"] > first_label_y - 5
        ]
        zone_bottom = min(below) if below else page_w * 0.95
        zone_labels = [
            s for s in labels
            if s["y"] >= zone_top and s["y"] <= zone_bottom + 2
        ]

        # grid geometry from label positions: cols = distinct x, rows = distinct y
        col_xs = sorted(set(round(s["x0"]) for s in zone_labels))
        cols = len(col_xs)
        if cols == 0:
            continue
        # logical row of each label = (label-1)//cols; rows may be missing
        row_map = {}
        for s in zone_labels:
            m = int(s["text"][1])
            row_map[(m - 1) // cols] = s["y"]
        row_keys = sorted(row_map)

        def row_index_of_y(y):
            return min(row_keys, key=lambda r: abs(row_map[r] - y))

        def col_index_of_x(x):
            return min(range(cols), key=lambda c: abs(col_xs[c] - x))

        rowh = 17.0
        for a, b in zip(row_keys, row_keys[1:]):
            rowh = min(rowh, (row_map[b] - row_map[a]) / max(1, b - a))

        def row_y(r):
            if r in row_map:
                return row_map[r]
            hi = next((k for k in row_keys if k > r), None)
            lo = next((k for k in reversed(row_keys) if k < r), None)
            if hi is not None and lo is not None:
                return row_map[lo] + (r - lo) * (row_map[hi] - row_map[lo]) / (hi - lo)
            if hi is not None:
                return row_map[hi] - (hi - r) * rowh
            if lo is not None:
                return row_map[lo] + (r - lo) * rowh
            return 0

        def cell_for(m):
            ri, ci = (m - 1) // cols, (m - 1) % cols
            y0 = row_y(ri) - 2
            y1 = row_y(ri) + rowh + 2
            x0 = col_xs[ci] - 4
            x1 = col_xs[ci + 1] - 6 if ci + 1 < cols else page_w - 60
            return fitz.Rect(x0, y0, x1, y1)

        def image_for_cell(m):
            # placements whose rect center falls in the option's grid cell,
            # preferring the smallest (best-fitting) image
            ri, ci = (m - 1) // cols, (m - 1) % cols
            best = None
            for p in placed_info:
                if p["qnum"] != q["number"] or p["pno"] != pno:
                    continue
                cx, cy = p["rect"].x0 + p["rect"].width / 2, p["rect"].y0 + p["rect"].height / 2
                if row_index_of_y(cy) != ri or col_index_of_x(cx) != ci:
                    continue
                area = p["rect"].width * p["rect"].height
                if best is None or area < best[0]:
                    best = (area, p["fname"])
            return best[1] if best else None

        def save_figure(m):
            existing = image_for_cell(m)
            if existing:
                return existing
            cell = cell_for(m)
            if cell is None or cell.width < 5 or cell.height < 5:
                return None
            name = f"Q{q['number']}_opt{m}.png"
            doc[pno].get_pixmap(clip=cell, dpi=200).save(os.path.join(out_dir, "images", name))
            return name

        # render empty-text options (drawn content)
        for opt in q["options"]:
            if opt["text"]:
                continue
            fig = save_figure(int(opt["label"]))
            if fig:
                opt["figure"] = fig
        # render truly-missing options (label absent from text layer)
        if len(q["options"]) < 4:
            present = {int(o["label"]) for o in q["options"]}
            for m in range(1, 5):
                if m in present:
                    continue
                fig = save_figure(m)
                if fig:
                    q["options"].append({"label": str(m), "text": "", "figure": fig})
        # render missing question stem (drawn statement)
        if not q["text"] and first_label_y is not None:
            if zone_top + 5 < first_label_y and 60 < page_w - 40:
                name = f"Q{q['number']}_stem.png"
                clip = fitz.Rect(60, zone_top, page_w - 40, first_label_y + 2)
                doc[pno].get_pixmap(clip=clip, dpi=200).save(os.path.join(out_dir, "images", name))
                q["images"].append(name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("year", type=int)
    ap.add_argument("out_dir")
    ap.add_argument("--date", required=True, help="exam date YYYY-MM-DD")
    ap.add_argument("--title", required=True, help="short title, e.g. 'NEET (UG) 2025'")
    ap.add_argument("--full-title", default=None)
    ap.add_argument("--duration", type=int, default=200)
    ap.add_argument("--key", default=None)
    args = ap.parse_args()

    doc = fitz.open(args.pdf)
    year_key = args.key or f"neet-{args.year}"
    furniture = page_furniture_xrefs(doc)

    # ---- per-page question markers (for image attribution) ----
    page_markers = []
    last_q = None
    for pno, page in enumerate(doc):
        markers = question_markers(page)
        if markers:
            last_q = markers[-1][0]
        page_markers.append((markers, last_q))

    # ---- text parsing in reading order (get_text is column-aware) ----
    questions = []
    section = None
    subsection = None
    cur = None

    def close_question():
        nonlocal cur
        if cur is None:
            return
        cur["text"] = normalize_text("\n".join(cur["text"]).strip())
        cur["solution"] = normalize_text("\n".join(cur["solution"]).strip())
        for opt in cur["options"]:
            opt["text"] = normalize_text(opt["text"])
        if cur["text"] or cur["options"]:
            questions.append(cur)
        cur = None

    for pno, page in enumerate(doc):
        for raw in page.get_text().split("\n"):
            text = raw.strip()
            if not text:
                continue
            up = text.upper()

            if up in SECTION_NAMES:
                close_question()
                section = up
                subsection = None
                continue
            if re.match(r"^SECTION\s*-?\s*[AB]$", up):
                subsection = "Section B" if "B" in up else "Section A"
                continue
            if re.match(r"^-\s*\d+\s*-$", text):
                continue
            if text.startswith("NEET (UG)") or text.startswith("Corporate Office") or \
               text.startswith("Re-Examination") or text.startswith("Aakash"):
                continue

            m = MARKER_RE.match(text)
            if m and section:
                close_question()
                cur = {
                    "section": section,
                    "subsection": subsection,
                    "number": int(m.group(1)),
                    "text": [],
                    "options": [],
                    "answers": [],
                    "solution": [],
                    "page": pno + 1,
                    "images": [],
                }
                continue

            # inline marker: "46. If the molar conductivity ..." (no standalone line)
            im = INLINE_MARKER_RE.match(text)
            if im and section and not cur:
                close_question()
                cur = {
                    "section": section,
                    "subsection": subsection,
                    "number": int(im.group(1)),
                    "text": [],
                    "options": [],
                    "answers": [],
                    "solution": [],
                    "page": pno + 1,
                    "images": [],
                }
                text = im.group(2)
                # fall through to text routing

            if cur is None:
                continue

            om = OPTION_RE.match(text)
            if om and not cur["answers"]:
                n = int(om.group(1))
                if cur["options"] and n <= int(cur["options"][-1]["label"]):
                    cur["options"][-1]["text"] = (cur["options"][-1]["text"] + " " + text).strip()
                else:
                    cur["options"].append({"label": om.group(1), "text": om.group(2)})
                continue

            # some Aakash PDFs drop the "(3)" label entirely (text layer defect).
            # an unlabeled, statement-like line appearing right after a fully
            # populated option (2) is that missing option.
            if (
                not cur["answers"]
                and cur["options"]
                and cur["options"][-1]["label"] == "2"
                and len(cur["options"]) == 2
                and cur["options"][-1]["text"].strip()
                and re.match(r"^[A-Z][^(\d].{4,}", text)
            ):
                cur["options"].append({"label": "3", "text": text})
                continue

            am = ANSWER_RE.match(text)
            if am:
                raw = am.group(1).strip()
                if not raw or "no option" in raw.lower():
                    cur["answers"] = []
                    cur["solution"].append(f"Answer ({raw})")
                else:
                    cur["answers"] = [
                        p.strip() for p in re.split(r"[/,]", raw.rstrip("*")) if p.strip()
                    ]
                    if not cur["answers"]:
                        cur["solution"].append(f"Answer ({raw})")
                if am.group(2).strip():
                    cur["solution"].append(am.group(2).strip())
                continue

            sm = SOL_RE.match(text)
            if sm:
                if sm.group(1).strip():
                    cur["solution"].append(sm.group(1).strip())
                continue

            if cur["answers"]:
                cur["solution"].append(text)
            elif cur["options"]:
                # glued option label at end of line, e.g. "... C m–2(4)"
                glued = re.search(r"\s*\((\d)\)\s*$", text)
                if glued and int(glued.group(1)) > int(cur["options"][-1]["label"]):
                    cur["options"][-1]["text"] = (cur["options"][-1]["text"] + " " + text[: glued.start()]).strip()
                    cur["options"].append({"label": glued.group(1), "text": ""})
                else:
                    cur["options"][-1]["text"] = (cur["options"][-1]["text"] + " " + text).strip()
            else:
                cur["text"].append(text)

    close_question()

    # ---- stray-marker cleanup: within a section numbers must increase ----
    valid = []
    last_number = 0
    last_section = None
    for q in questions:
        if q["section"] != last_section:
            last_section = q["section"]
            last_number = 0
        if q["number"] <= last_number:
            if valid:
                valid[-1]["solution"] = valid[-1]["solution"] + "\n" + q["text"]
            continue
        last_number = q["number"]
        valid.append(q)

    # ---- images: attribute to nearest marker above (carry over pages) ----
    img_dir = os.path.join(args.out_dir, "images")
    os.makedirs(img_dir, exist_ok=True)
    # a fresh run replaces the previous output completely
    for old in os.listdir(img_dir):
        os.remove(os.path.join(img_dir, old))
    counts = {}
    placed = 0
    placed_info = []
    for pno, xref, rect in collect_placements(doc, furniture):
        if rect.width < MIN_EDGE or rect.height < MIN_EDGE:
            continue
        qn = None
        for mqn, my in page_markers[pno][0]:
            if my <= rect.y0 + 2:
                qn = mqn
        if qn is None:
            qn = page_markers[pno][1]

        target = None
        for q in reversed(valid):
            if q["number"] == qn and q["page"] <= pno + 1:
                target = q
                break
        if target is None:
            continue

        key = (target["section"], qn)
        idx = counts.get(key, 0) + 1
        counts[key] = idx
        stem = f"Q{qn}" if idx == 1 else f"Q{qn}_{idx}"
        fname = f"{stem}.png"
        out_path = os.path.join(img_dir, fname)
        render_placement(doc[pno], rect, out_path)
        placed += 1
        if fname not in target["images"]:
            target["images"].append(fname)
        placed_info.append({"qnum": qn, "pno": pno, "rect": rect, "fname": fname})

    doc.close()

    # ---- render vector-drawn content that has no text layer ----
    doc = fitz.open(args.pdf)
    render_missing_content(doc, valid, args.out_dir, placed_info)
    for q in valid:
        q["options"].sort(key=lambda o: int(o["label"]))
    doc.close()

    out = {
        "key": year_key,
        "title": args.title,
        "fullTitle": args.full_title or args.title,
        "examDate": args.date,
        "durationMinutes": args.duration,
        "questionCount": len(valid),
        "questions": valid,
    }
    os.makedirs(args.out_dir, exist_ok=True)
    with open(os.path.join(args.out_dir, "questions.json"), "w") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)

    by_section = Counter(q["section"] for q in valid)
    no_opts = [q["number"] for q in valid if len(q["options"]) != 4]
    no_ans = [q["number"] for q in valid if not q["answers"]]
    no_text = [q["number"] for q in valid if not q["text"]]
    multi_ans = [(q["number"], q["answers"]) for q in valid if len(q["answers"]) > 1]
    img_count = sum(len(q["images"]) for q in valid)
    print(f"paper: {year_key}  questions: {len(valid)}  images: {placed} (in {img_count} questions)")
    print("sections:", dict(by_section))
    if no_opts:
        print("MISSING 4 OPTIONS:", no_opts)
    if no_ans:
        print("MISSING ANSWER:", no_ans)
    if no_text:
        print("MISSING TEXT:", no_text)
    if multi_ans:
        print("MULTI-ANSWER:", multi_ans)


if __name__ == "__main__":
    main()
