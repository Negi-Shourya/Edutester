#!/usr/bin/env python3
"""Extract NEET 2025 (PW / Code-45) into JSON + images.

Character-level extraction that:
  * rebuilds visual lines in reading order per page column
  * emits _{...}/^{...} markup for sub/superscripts (font size + baseline)
  * rebuilds stacked fractions as \\frac{num}{den} using drawn bars
  * decodes private-use math glyphs
  * emits "Match the Following" questions as two-column tables
  * clips diagrams straight from the PDF (raster, vector clusters, cells)
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

import fitz

PDF_PATH = os.path.join("neet", "2025 Neet.pdf")
OUT_DIR = os.path.join("neet-out", "2025")

MIN_EDGE = 30
MIN_RASTER_AREA = 900
FIGURE_MIN_AREA = 800
COL_SPLIT_X = 300
SCRIPT_RATIO = 0.80
SCRIPT_DT = 1.5


def section_for_qnum(n):
    if 1 <= n <= 45:
        return "PHYSICS"
    if 46 <= n <= 90:
        return "CHEMISTRY"
    return "BIOLOGY"


GLYPH_MAP = {
    "\uf04c": "Λ", "\uf044": "Δ", "\uf061": "α", "\uf062": "β",
    "\uf067": "γ", "\uf073": "σ", "\uf06c": "l", "\uf06d": "μ",
    "\uf0b0": "°", "\uf083": "⇌", "\uf0de": "→", "\uf0d7": "×",
    "\uf0c5": "⚥", "\uf0b4": "×", "\uf0a2": "∞", "\uf0bc": "≈",
    "\uf03b": ";", "\uf0eb": "(", "\uf0fb": ")", "\uf0ef": "(",
    "\uf0ff": ")", "\uf072": "ρ", "\uf071": "θ", "\uf064": "δ",
    "\uf06b": "κ", "\uf06e": "ν", "\uf070": "π", "\uf074": "τ",
    "\uf077": "ω", "\uf046": "Φ", "\uf057": "Ω", "\uf065": "ε",
    "\uf06a": "φ", "\uf06f": "ο", "\uf068": "η", "\uf069": "ι",
    "\uf078": "ξ", "\uf079": "ψ", "\uf07a": "ζ", "\uf066": "ζ",
    "\uf053": "Σ", "\uf047": "Γ", "\uf051": "Θ", "\uf058": "Ξ",
    "\uf059": "Ψ",
    "\uf0e6": "(", "\uf0f6": ")", "\uf0e7": "(", "\uf0f7": ")",
    "\uf0e8": "(", "\uf0f8": ")", "\uf03d": "=", "\uf0b5": "∝",
    "\uf8e7": "",
}


def clean_char(c):
    if ord(c) >= 0xE000:
        return GLYPH_MAP.get(c, "")
    if c == "\u2113":
        return "l"
    return c


def is_skip_line(text):
    t = text.strip()
    if not t:
        return True
    if re.match(r"^\[\d+\]$", t):
        return True
    if "[" in t and "]" in t and len(t) < 16:
        return True
    up = t.upper()
    if "NEET" in up and ("CODE" in up or "UG" in up):
        return True
    if up in ("ENGLISH", "HINDI"):
        return True
    if t.startswith("Test Booklet"):
        return True
    if t in ("PW Website", "Android App", "iOS App", "|"):
        return True
    if t.startswith("Important Instructions") or t.startswith("[Contd"):
        return True
    if "DATE:" in up:
        return True
    return False


class LChar:
    __slots__ = ("x0", "y0", "x1", "y1", "size", "font", "text", "oy")

    def __init__(self, x0, y0, x1, y1, size, font, text, oy):
        self.x0, self.y0, self.x1, self.y1 = x0, y0, x1, y1
        self.size, self.font, self.text, self.oy = size, font, text, oy


def collect_chars(page):
    out = []
    d = page.get_text("rawdict")
    for block in d["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                size, font = span["size"], span["font"]
                for ch in span["chars"]:
                    t = ch["c"]
                    if not t or t == "\x00" or t.isspace():
                        continue
                    b = ch["bbox"]
                    out.append(LChar(b[0], b[1], b[2], b[3], size, font,
                                     t, ch["origin"][1]))
    return out


class VLine:
    __slots__ = ("chars", "baseline", "col", "frac", "skip")

    def __init__(self, chars, baseline, col):
        self.chars = sorted(chars, key=lambda c: c.x0)
        self.baseline = baseline
        self.col = col
        self.frac = None
        self.skip = False

    @property
    def y0(self):
        return min(c.y0 for c in self.chars)

    @property
    def y1(self):
        return max(c.y1 for c in self.chars)

    @property
    def x0(self):
        return min(c.x0 for c in self.chars)

    @property
    def x1(self):
        return max(c.x1 for c in self.chars)

    def plain(self):
        return "".join(c.text for c in self.chars)


def text_bbox(v):
    return fitz.Rect(v.x0 - 2, v.y0 - 2, v.x1 + 2, v.y1 + 2)


def build_lines(chars, tol=4.5, split_chars=None):
    cols = {"L": [], "R": []}
    for c in chars:
        if split_chars is None:
            cols["L"].append(c)
        else:
            cols["R" if (c.x0 + c.x1) / 2 >= split_chars else "L"].append(c)
    lines = []
    for col in ("L", "R"):
        cs = sorted(cols[col], key=lambda c: (c.oy, c.x0))
        cur, cur_y = [], None
        for c in cs:
            if cur_y is None or abs(c.oy - cur_y) <= tol:
                cur.append(c)
                cur_y = c.oy
            else:
                lines.append(_mk_line(cur, col))
                cur, cur_y = [c], c.oy
        if cur:
            lines.append(_mk_line(cur, col))
    lines.sort(key=lambda l: (0 if l.col == "L" else 1, l.baseline))
    return lines


def _mk_line(chars, col):
    chars.sort(key=lambda c: c.x0)
    sizes = Counter(round(c.size, 1) for c in chars)
    main_size = sizes.most_common(1)[0][0]
    main = [c for c in chars if abs(c.size - main_size) < 0.2]
    if main:
        baseline = sorted(c.oy for c in main)[len(main) // 2]
    else:
        baseline = sorted(c.oy for c in chars)[len(chars) // 2]
    return VLine(chars, baseline, col)


def line_markup(v):
    """Visual line -> markup string with _{}/^{} for sub/superscripts."""
    sizes = Counter(round(c.size, 1) for c in v.chars)
    main_size = sizes.most_common(1)[0][0]
    out, script, buf, last_x = [], None, [], None

    def flush():
        nonlocal script, buf
        if not buf:
            return
        if script == "sup":
            out.append("^{%s}" % "".join(buf))
        elif script == "sub":
            out.append("_{%s}" % "".join(buf))
        else:
            out.append("".join(buf))
        buf = []
        script = None

    for c in v.chars:
        t = clean_char(c.text)
        if not t:
            continue
        if c.size < main_size * SCRIPT_RATIO:
            if c.oy < v.baseline - SCRIPT_DT:
                cls = "sup"
            elif c.oy > v.baseline + SCRIPT_DT:
                cls = "sub"
            else:
                cls = "txt"
        else:
            cls = "txt"
        if cls != script:
            flush()
            script = cls
        if cls == "txt" and last_x is not None and c.x0 - last_x > 1.0:
            buf.append(" ")
        buf.append(t)
        last_x = c.x1
    flush()
    return "".join(out)


def line_plain(v):
    return "".join(clean_char(c.text) for c in v.chars).strip()


# =====================================================================
# Per-page column split (NEET body pages are 2-column; some are 1-col)
# =====================================================================

def page_column_split(page):
    """Return the x gutter between the two text columns, or None if 1-col."""
    xs = sorted(c.x0 for c in collect_chars(page) if 45 < c.oy < 770)
    best_gap, best_x = 0, None
    for i in range(len(xs) - 1):
        gap = xs[i + 1] - xs[i]
        if 250 < xs[i] < 430 and gap > best_gap:
            best_gap, best_x = gap, (xs[i] + xs[i + 1]) / 2
    if best_gap < 9:
        return None
    return 305.0


def col_of_vline(v, split_x):
    if split_x is None:
        return "L"
    return "R" if (v.x0 + v.x1) / 2 >= split_x else "L"


def is_instruction_page(page):
    t = page.get_text("text", flags=0)[:2000]
    return "Important Instructions" in t or "Test Booklet is" in t[:600]


def is_answer_key_page(page):
    t = page.get_text("text", flags=0)[:3000]
    return "ANSWERS" in t or "Hints & Solutions" in t or "Text Solution" in t[:3000]


# =====================================================================
# Sub/superscript markup (real font size + baseline position)
# =====================================================================

SCRIPT_RATIO = 0.78


def line_markup2(v):
    """Visual line -> text with _{} / ^{} markup from real geometry."""
    sizes = Counter(round(c.size, 1) for c in v.chars)
    main_size = sizes.most_common(1)[0][0]
    mains = [c for c in v.chars if abs(c.size - main_size) < 0.2]
    line_yc = sum(c.oy for c in mains) / max(1, len(mains))
    out, buf, last_script, last_x = [], [], "txt", None

    def flush():
        nonlocal buf, last_script
        if not buf:
            return
        if last_script == "sup":
            out.append("^{%s}" % "".join(buf))
        elif last_script == "sub":
            out.append("_{%s}" % "".join(buf))
        else:
            out.append("".join(buf))
        buf, last_script = [], "txt"

    for c in sorted(v.chars, key=lambda c: c.x0):
        t = clean_char(c.text)
        if not t:
            continue
        if c.size >= main_size * SCRIPT_RATIO:
            s = "txt"
        elif c.oy < line_yc - 1.4:
            s = "sup"
        elif c.oy > line_yc + 1.0:
            s = "sub"
        else:
            s = "txt"
        if s != last_script:
            flush()
            last_script = s
        if s == "txt" and last_x is not None and c.x0 - last_x > 1.0:
            buf.append(" ")
        buf.append(t)
        last_x = c.x1
    flush()
    return "".join(out)


# =====================================================================
# Stacked fractions (drawn bar between numerator and denominator)
# =====================================================================

def fraction_bars(page):
    bars = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.width < 6 or r.height > 2.0:
            continue
        if r.height > 0.01 and r.width / r.height < 1.5:
            continue
        bars.append(r)
    return bars


def detect_fractions(lines, page):
    """Mark numerator VLines with (num, den); skip the denominator line."""
    for bar in fraction_bars(page):
        x0, x1 = bar.x0 - 2, bar.x1 + 2
        above = [l for l in lines
                 if l.y1 <= bar.y0 + 0.5 and l.x1 > x0 and l.x0 < x1
                 and abs(l.y1 - bar.y0) <= 8.0]
        below = [l for l in lines
                 if l.y0 >= bar.y1 - 0.5 and l.x1 > x0 and l.x0 < x1
                 and abs(l.y0 - bar.y1) <= 8.0]
        if not above or not below:
            continue
        num = max(above, key=lambda l: l.y1)
        den = min(below, key=lambda l: l.y0)
        ntext = re.sub(r"^\([0-9]\)\s*", "", line_plain(num)).strip()
        dtext = line_plain(den).strip()
        if not ntext or not dtext:
            continue
        if re.search(r"[a-zA-Z(\s]", ntext.replace("^", "")) or re.search(r"[a-zA-Z(\s]", dtext):
            continue
        if den.skip or num.frac is not None:
            continue
        den.skip = True
        num.frac = (ntext, dtext)


# =====================================================================
# Furniture detection + raster image placement
# =====================================================================

def page_furniture_images(doc):
    seen = defaultdict(int)
    tot = max(doc.page_count, 1)
    for page in doc:
        for im in page.get_images(full=True):
            seen[im[0]] += 1
    return {x for x, n in seen.items() if n >= tot * 0.2}


def collect_raster_placements(doc, furniture):
    out = []
    for pno, page in enumerate(doc):
        seen = []
        for im in page.get_images(full=True):
            xref = im[0]
            if xref in furniture:
                continue
            for r in page.get_image_rects(xref):
                if not any((r & s).get_area() > 0.6 * r.get_area() for s in seen):
                    seen.append(fitz.Rect(r))
                    out.append((pno, xref, r))
    return out


def render_clip(page, rect, out_fn):
    pm = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=fitz.Rect(rect))
    pm.save(out_fn)


# =====================================================================
# Vector-drawn figure clusters
# =====================================================================

def drawing_clusters(page):
    rects = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.width < 0.4 and r.height < 0.4:
            continue
        if r.width * r.height < 12:
            continue
        rects.append(r)
    clusters = []
    for r in rects:
        hit = None
        for i, c in enumerate(clusters):
            if (c & r).get_area() > 0 or \
               (abs(c.x0 - r.x1) <= 2 and abs(c.y0 - r.y1) <= 2) or \
               (abs(c.x1 - r.x0) <= 2 and abs(c.y1 - r.y0) <= 2):
                hit = i
                break
        if hit is not None:
            clusters[hit] |= r
        else:
            clusters.append(fitz.Rect(r))
    changed = True
    while changed:
        changed = False
        for i in range(len(clusters)):
            if clusters[i] is None:
                continue
            for j in range(i + 1, len(clusters)):
                if clusters[j] is None:
                    continue
                if (clusters[i] & clusters[j]).get_area() > 0:
                    clusters[i] |= clusters[j]
                    clusters[j] = None
                    changed = True
    return [c for c in clusters if c is not None]


def cluster_free_of_text(cl, textboxes):
    grow = fitz.Rect(cl.x0 - 5, cl.y0 - 5, cl.x1 + 5, cl.y1 + 5)
    covered = 0
    for tb in textboxes:
        inter = (tb & grow).get_area()
        if inter > 0:
            covered += inter
    return covered < 0.6 * cl.get_area()


# =====================================================================
# Question-number marker grid for shapes
# =====================================================================

def page_markers(lines, split_x):
    mks = {"L": [], "R": []}
    for l in lines:
        t = line_plain(l)
        m = re.match(r"^(\d{1,3})\.(?:\s*$|\s*\S)", t)
        if m:
            n = int(m.group(1))
            if 1 <= n <= 180:
                col = col_of_vline(l, split_x)
                if not mks[col] or n > mks[col][-1][1]:
                    mks[col].append((l.baseline, n))
    return mks


def attrib_qn(pno, col, y0, marker_grid, carry):
    n = carry[pno][col] if carry and pno < len(carry) else None
    for by, bn in marker_grid[pno][col]:
        if by <= y0 + 6:
            n = bn
        else:
            break
    return n


def find_question(questions, n, pno):
    for q in questions:
        if q["number"] == n and abs(q["page"] - (pno + 1)) <= 1:
            return q
    for q in questions:
        if q["number"] == n:
            return q
    return None


# =====================================================================
# Match List-I / List-II tables
# =====================================================================

LETTER_LABEL = re.compile(r"^([A-E])\.\s*\S")
ROMAN_LABEL = re.compile(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s*\S")


class MatchTable:
    def __init__(self):
        self.closed = False
        self.lines = []

    def feed(self, text, x0):
        if self.closed:
            return False
        if text.replace(" ", "").lower().startswith("choosethe"):
            self.closed = True
            return False
        self.lines.append((x0, text))
        return True

    def render(self):
        head_l, head_r = None, None
        left, right = [], []
        xs1 = [x for x, t in self.lines if t.strip().startswith("List-I")]
        xs2 = [x for x, t in self.lines if t.strip().startswith("List-II")]
        x_mid = (max(xs1) + max(xs2)) / 2 if xs1 and xs2 else None
        for x0, t in self.lines:
            t = t.strip()
            if not t:
                continue
            if t.startswith("List-I"):
                head_l = "List-I"
                continue
            if t.startswith("List-II"):
                head_r = "List-II"
                continue
            if LETTER_LABEL.match(t):
                left.append(t)
            elif ROMAN_LABEL.match(t):
                right.append(t)
            elif x_mid is not None and x0 >= x_mid:
                (right if right else left).append(t)
            else:
                (left if left else right).append(t)
        n = max(len(left), len(right))
        out = []
        if head_l or head_r:
            out.append("%s | %s" % (head_l or "-", head_r or "-"))
        for i in range(n):
            out.append("%s  |  %s" % (left[i] if i < len(left) else "",
                                      right[i] if i < len(right) else ""))
        return out


# =====================================================================
# Option cells: word-level '(n)' markers, cell clips, and full-block
# screenshots for formula-heavy questions
# =====================================================================

def page_word_markers(page, split_x):
    """Map option markers '(1)'..'(4)' to (x, y) per column via word
    extraction (immune to baseline merging that jumbles line text)."""
    out = {"L": [], "R": []}
    for w in page.get_text("words"):
        x0, y0, x1, y1, word = w[0], w[1], w[2], w[3], w[4]
        m = re.match(r"^\((\d)\)$", word)
        if not m:
            continue
        n = int(m.group(1))
        if not 1 <= n <= 4:
            continue
        col = "R" if split_x is not None and (x0 + x1) / 2 >= split_x else "L"
        out[col].append((n, x0, y0))
    return out


def is_garbled_text(t):
    """True when the option text is a jumble of stacked glyph fragments
    (NEET typesets many equations by overlaying small rows, which our
    baseline merge reorders into nonsense)."""
    if not t:
        return False
    w = t.split()
    if len(w) < 2:
        return False
    if any(re.search(r"[A-Za-z\u0370-\u03FF\u1F00-\u1FFF]{3,}", x) for x in w):
        return False
    op = re.search(r"[=\u00d7\u221d\u2192\u0394+\-\u2212()/^_]", t)
    if op and len(w) >= 2:
        return True
    return len(w) >= 3 and all(len(x) <= 2 for x in w)


def render_question_block(doc, pno, q, col, split_x, q_top, q_bottom, img_dir):
    """Render the whole question (stem + figure + all options) as one clip."""
    x0 = 2 if col == "L" else (split_x if split_x is not None else 305)
    x1 = split_x if col == "L" else 611
    rect = fitz.Rect(x0, q_top - 3, x1, q_bottom - 3)
    fname = "Q%d_block.png" % q["number"]
    try:
        render_clip(doc[pno], rect, os.path.join(img_dir, fname))
    except Exception:
        return None
    q["text"] = ""
    q["images"] = [fname]
    for opt in q["options"]:
        opt["text"] = ""
        opt["image"] = None
    return fname


def render_option_cells_and_blocks(doc, questions, lines_per_page, splits,
                                   marker_grid, img_dir):
    """Per question: render garbled/empty option cells as clips, or a full
    question block when formula-heavy (>=1 garbled option)."""
    word_markers = {
        pno: page_word_markers(doc[pno], splits.get(pno))
        for pno in range(len(doc))
    }
    for q in questions:
        pno = q["page"] - 1
        if not (0 <= pno < len(doc)):
            continue
        sp = splits.get(pno)
        col = None
        for c in ("L", "R"):
            if any(n == q["number"] for _, n in marker_grid[pno][c]):
                col = c
                break
        if col is None:
            continue
        tops = [by for by, n in marker_grid[pno][col]]
        idx = next(i for i, (_, n) in enumerate(marker_grid[pno][col])
                   if n == q["number"])
        q_top = tops[idx]
        q_bottom = tops[idx + 1] if idx + 1 < len(tops) else 838.0
        garbled = [oi for oi, o in enumerate(q["options"], start=1)
                   if o["text"] and is_garbled_text(o["text"])]
        own_marks = [m for m in word_markers[pno][col]
                     if q_top - 4 <= m[2] <= q_bottom + 4]
        if garbled:
            block = render_question_block(doc, pno, q, col, sp, q_top,
                                          q_bottom, img_dir)
            if block and idx + 1 >= len(tops) and not own_marks:
                first_y = {c: min((by for by, n in marker_grid[pno][c]),
                                  default=1e9)
                           for c in ("L", "R")}
                stray = []
                for n, x, y in (word_markers[pno]["L"] +
                                word_markers[pno]["R"]):
                    c = "R" if sp is not None and x >= sp else "L"
                    if y < first_y[c] - 10:
                        stray.append((n, x, y, c))
                if stray:
                    ys = [y for _, _, y, _ in stray]
                    cs = {c for _, _, _, c in stray}
                    y0, y1 = min(ys) - 8, max(ys) + 12
                    for c in cs:
                        if c == "L":
                            sx0, sx1 = 2, (sp if sp is not None else 305)
                        else:
                            sx0 = sp if sp is not None else 305
                            sx1 = 611
                        rect2 = fitz.Rect(sx0, y0, sx1, y1)
                        f2 = "Q%d_block2.png" % q["number"]
                        try:
                            render_clip(doc[pno], rect2,
                                        os.path.join(img_dir, f2))
                            q["images"] = [q["images"][0], f2]
                        except Exception:
                            pass
            continue
        need_cell = [oi for oi, o in enumerate(q["options"], start=1)
                     if not o["text"]]
        if not need_cell:
            continue
        marks = [(n, x, y) for n, x, y in word_markers[pno][col]
                 if q_top - 4 <= y <= q_bottom + 4]
        if not marks and pno + 1 < len(doc):
            tops2 = [by for by, n in marker_grid[pno + 1][col]]
            t2 = tops2[0] if tops2 else 50.0
            b2 = tops2[1] if len(tops2) > 1 else 838.0
            marks = [(n, x, y) for n, x, y in word_markers[pno + 1][col]
                     if t2 - 4 <= y <= b2 + 4]
            if marks:
                q["page"] = pno + 2
                sp = splits.get(pno + 1)
        marks.sort(key=lambda t: (t[2], t[1]))
        for oi in need_cell:
            hit = [m for m in marks if m[0] == oi]
            if not hit:
                continue
            _, mx, my = hit[0]
            row = [m for m in marks if abs(m[2] - my) <= 4 and m[1] > mx]
            x1 = row[0][1] - 3 if row else (sp if col == "L" else 611)
            below = [m for m in marks if m[2] > my + 8]
            y1 = min(my + 45, below[0][2] - 3) if below else my + 45
            rect = fitz.Rect(mx - 3, my - 26, x1, y1)
            fname = "Q%d_opt%d.png" % (q["number"], oi)
            try:
                render_clip(doc[pno], rect, os.path.join(img_dir, fname))
            except Exception:
                continue
            q["options"][oi - 1]["image"] = fname
        if any(not o["text"] and not o.get("image") for o in q["options"]):
            render_question_block(doc, q["page"] - 1, q, col, sp, q_top,
                                  q_bottom, img_dir)
# =====================================================================
# Main
# =====================================================================

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    doc = fitz.open(PDF_PATH)
    print(f"Opened: {PDF_PATH} ({doc.page_count} pages)")

    furniture = page_furniture_images(doc)
    print(f"Furniture xrefs: {len(furniture)}")

    splits, lines_per_page, marker_grid, carry = {}, [], [], []
    running = {"L": None, "R": None}
    for pno, page in enumerate(doc):
        split_x = page_column_split(page)
        splits[pno] = split_x
        chars = collect_chars(page)
        raw_lines = build_lines(chars, split_chars=split_x)
        for vl in raw_lines:
            vl.col = col_of_vline(vl, split_x)
        detect_fractions(raw_lines, page)
        lines_per_page.append(raw_lines)
        mk = page_markers(raw_lines, split_x)
        marker_grid.append(mk)
        for col in ("L", "R"):
            if mk[col]:
                running[col] = mk[col][-1][1]
        carry.append(dict(running))
    print("column splits per page:", list(splits.values())[:6], "...")

    img_dir = os.path.join(OUT_DIR, "images")
    os.makedirs(img_dir, exist_ok=True)
    for old in os.listdir(img_dir):
        os.remove(os.path.join(img_dir, old))

    # ---- stream into questions ----
    questions = []
    cur = None
    match_tbl = None

    def close_question():
        nonlocal cur, match_tbl
        if cur is None:
            return
        if match_tbl is not None:
            body = match_tbl.render()
            cur["text"] = (cur["text"] + "\n" + "\n".join(body)).strip()
            match_tbl = None
        for opt in cur["options"]:
            opt["text"] = opt["text"].strip()
        if cur["text"] or any(o["text"] for o in cur["options"]):
            questions.append(cur)
        cur = None

    def new_question(n, pno):
        nonlocal cur, match_tbl
        close_question()
        match_tbl = None
        cur = {
            "section": section_for_qnum(n),
            "number": n,
            "text": "",
            "options": [],
            "answers": [],
            "solution": [],
            "page": pno + 1,
            "images": [],
        }

    for pno, lines in enumerate(lines_per_page):
        if is_instruction_page(doc[pno]):
            continue
        if is_answer_key_page(doc[pno]):
            break
        for col in ("L", "R"):
            for v in [l for l in lines if l.col == col]:
                if v.skip:
                    continue
                raw = line_plain(v)
                if is_skip_line(raw):
                    continue
                t = ("\\frac{%s}{%s}" % v.frac) if v.frac else line_markup2(v)
                t = t.strip()
                if not t:
                    continue

                m = re.match(r"^(\d{1,3})\.$", raw)
                if m:
                    n = int(m.group(1))
                    if 1 <= n <= 180 and (cur is None or n > cur["number"]):
                        new_question(n, pno)
                    continue

                im = re.match(r"^(\d{1,3})\.\s*(\S.*)$", t)
                if im and (cur is None or int(im.group(1)) > cur["number"]):
                    n = int(im.group(1))
                    if 1 <= n <= 180:
                        new_question(n, pno)
                        t = im.group(2)

                if cur is not None:
                    inl = re.match(r"^(.*?)(\d{1,3})\.\s+(\S.*)$", t)
                    while inl and (cur is None or int(inl.group(2)) > cur["number"]):
                        n2 = int(inl.group(2))
                        if not (1 <= n2 <= 180):
                            break
                        new_question(n2, pno)
                        t = inl.group(3)
                        inl = re.match(r"^(.*?)(\d{1,3})\.\s+(\S.*)$", t)

                if cur is None:
                    continue

                if match_tbl is not None and match_tbl.feed(line_plain(v), v.x0):
                    continue
                if match_tbl is not None and t.startswith("Choose the correct answer"):
                    match_tbl = None
                    t = ""

                om = re.match(r"^\((\d)\)\s*(.*)$", t)
                if om:
                    n = int(om.group(1))
                    if 1 <= n <= 4:
                        pieces = re.split(r"(?=\([1-4]\))", t)
                        for piece in pieces:
                            pm = re.match(r"^\((\d)\)\s*(.*)$", piece.strip())
                            if not pm:
                                continue
                            pn = int(pm.group(1))
                            if cur["options"] and pn <= int(cur["options"][-1]["label"]):
                                cur["options"][-1]["text"] = (cur["options"][-1]["text"] + " " + piece).strip()
                            else:
                                cur["options"].append({"label": pm.group(1), "text": pm.group(2).strip()})
                        continue

                if cur["options"]:
                    cur["options"][-1]["text"] = (cur["options"][-1]["text"] + " " + t).strip()
                elif t.startswith("Match List") or re.match(r"^Match\s", t, re.IGNORECASE):
                    cur["text"] = (cur["text"] + " " + t).strip()
                    match_tbl = MatchTable()
                else:
                    cur["text"] = (cur["text"] + " " + t).strip()

    close_question()

    # ---- dedupe: keep the last occurrence of each number (skip instr-page) ----
    seen = {}
    for q in questions:
        seen[q["number"]] = q
    valid = [seen[k] for k in sorted(seen)]

    # ---- split questions merged into a previous option line ----
    extra = []
    for i, q in enumerate(valid[:]):
        if not q["options"]:
            continue
        last_opt = q["options"][-1]
        em = re.search(r"(\d{1,3})\.\s+(\S.*)$", last_opt["text"])
        if not em:
            continue
        n = int(em.group(1))
        if n == q["number"] + 1 and 1 <= n <= 180:
            cut = last_opt["text"].rfind(em.group(1))
            last_opt["text"] = last_opt["text"][:cut].strip()
            extra.append((i + 1, {
                "section": section_for_qnum(n),
                "number": n,
                "text": em.group(2).strip(),
                "options": [],
                "answers": [],
                "solution": [],
                "page": q["page"],
                "images": [],
            }))
    for pos, eq in reversed(extra):
        valid.insert(pos, eq)

    # ---- raster images ----
    counts = {}
    placed = 0
    placed_info = []
    for pno, xref, rect in collect_raster_placements(doc, furniture):
        if rect.width < MIN_EDGE or rect.height < MIN_EDGE or rect.width * rect.height < MIN_RASTER_AREA:
            continue
        sp = splits.get(pno)
        col = "R" if sp is not None and (rect.x0 + rect.x1) / 2 >= sp else "L"
        qn = attrib_qn(pno, col, rect.y0, marker_grid, carry)
        if qn is None:
            continue
        target = find_question(valid, qn, pno)
        if target is None:
            continue
        key = (target["section"], qn)
        idx = counts.get(key, 0) + 1
        counts[key] = idx
        fname = ("Q%d.png" % qn) if idx == 1 else ("Q%d_%d.png" % (qn, idx))
        render_clip(doc[pno], rect, os.path.join(img_dir, fname))
        placed += 1
        if fname not in target["images"]:
            target["images"].append(fname)
        placed_info.append({"qnum": qn, "pno": pno, "rect": rect})

    # ---- vector-drawn figure clusters ----
    for pno, page in enumerate(doc):
        textboxes = [text_bbox(l) for l in lines_per_page[pno]]
        for cl in drawing_clusters(page):
            if cl.width < 25 or cl.height < 15:
                continue
            if cl.get_area() < FIGURE_MIN_AREA:
                continue
            if not cluster_free_of_text(cl, textboxes):
                continue
            sp = splits.get(pno)
            col = "R" if sp is not None and (cl.x0 + cl.x1) / 2 >= sp else "L"
            qn = attrib_qn(pno, col, cl.y0, marker_grid, carry)
            if qn is None:
                continue
            target = find_question(valid, qn, pno)
            if target is None:
                continue
            covered = any(
                pi["pno"] == pno and pi["qnum"] == qn and
                (pi["rect"] & cl).get_area() > 0.5 * cl.get_area()
                for pi in placed_info)
            if covered:
                continue
            key = (target["section"], qn, "d")
            idx = counts.get(key, 0) + 1
            counts[key] = idx
            base = "Q%d" % qn
            fname = base + ".png" if idx == 1 else "%s_%d.png" % (base, idx)
            render_clip(page, cl, os.path.join(img_dir, fname))
            placed += 1
            if fname not in target["images"]:
                target["images"].append(fname)

# ---- option cells without text layer / garbled formulas ----
    render_option_cells_and_blocks(doc, valid, lines_per_page, splits,
                                   marker_grid, img_dir)
    doc.close()

    out = {
        "key": "neet-2025",
        "title": "NEET (UG) 2025",
        "fullTitle": "NEET (UG) 2025 - National Eligibility cum Entrance Test",
        "examDate": "2025-05-04",
        "durationMinutes": 200,
        "questionCount": len(valid),
        "questions": valid,
    }
    with open(os.path.join(OUT_DIR, "questions.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)

    by_section = Counter(q["section"] for q in valid)
    no_opts = [q["number"] for q in valid if len(q["options"]) != 4]
    no_text = [q["number"] for q in valid if not q["text"]]
    img_count = sum(len(q["images"]) for q in valid)
    fracs = sum(1 for q in valid if "\\frac" in str(q["text"]))
    frac_opt = sum(1 for q in valid if any("\\frac" in o["text"] for o in q["options"]))
    sup_sub = sum(1 for q in valid if "^{" in str(q["text"]) or "_{" in str(q["text"]))
    match_qs = [q["number"] for q in valid if "List-" in q["text"]]
    print(f"\n{'=' * 62}")
    print(f"Paper: neet-2025  questions: {len(valid)}  images: {placed} (in {img_count} q)")
    print(f"Sections: {dict(by_section)}")
    print(f"Fractions in stems: {fracs}  in options: {frac_opt}")
    print(f"Questions with sub/sup markup: {sup_sub}")
    print(f"Match tables rendered: {len(match_qs)}  {match_qs[:20]}")
    if no_opts:
        print(f"MISSING 4 OPTIONS ({len(no_opts)}): {no_opts[:40]}")
    if no_text:
        print(f"MISSING TEXT ({len(no_text)}): {no_text[:40]}")
    print(f"Output: {os.path.abspath(os.path.join(OUT_DIR, 'questions.json'))}")
    print("=" * 62)


if __name__ == "__main__":
    main()
