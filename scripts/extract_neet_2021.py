#!/usr/bin/env python3
"""Extract NEET 2024 (Code-_T3_) into JSON + images.

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

PDF_PATH = os.path.join("neet", "neet 2021 question paper.pdf")
OUT_DIR = os.path.join("neet-out", "2021")

MIN_EDGE = 30
MIN_RASTER_AREA = 900
FIGURE_MIN_AREA = 800
COL_SPLIT_X = 300
SCRIPT_RATIO = 0.80
SCRIPT_DT = 1.5


def section_for_qnum(n):
    if 1 <= n <= 50:
        return "PHYSICS"
    if 51 <= n <= 100:
        return "CHEMISTRY"
    if 101 <= n <= 150:
        return "BOTANY"
    return "ZOOLOGY"


GLYPH_MAP = {
    "\uf04c": "Î›", "\uf044": "Î”", "\uf061": "Î±", "\uf062": "Î²",
    "\uf067": "Î³", "\uf073": "Ïƒ", "\uf06c": "Î»", "\uf06d": "Î¼",
    "\uf0b0": "Â°", "\uf083": "â‡Œ", "\uf0de": "â†’", "\uf0d7": "Ã—",
    "\uf0c5": "+", "\uf0b4": "Ã—", "\uf0a2": "âˆž", "\uf0bc": "â‰ˆ",
    "\uf03b": ";", "\uf0eb": "(", "\uf0fb": ")", "\uf0ef": "(",
    "\uf0ff": ")", "\uf072": "Ï", "\uf071": "Î¸", "\uf064": "Î´",
    "\uf06b": "Îº", "\uf06e": "Î½", "\uf070": "Ï€", "\uf074": "Ï„",
    "\uf077": "Ï‰", "\uf046": "Î¦", "\uf057": "Î©", "\uf065": "Îµ",
    "\uf06a": "Ï†", "\uf06f": "Î¿", "\uf068": "Î·", "\uf069": "Î¹",
    "\uf078": "Î¾", "\uf079": "Ïˆ", "\uf07a": "Î¶", "\uf066": "Î¶",
    "\uf053": "Î£", "\uf047": "Î“", "\uf051": "Î˜", "\uf058": "Îž",
    "\uf059": "Î¨",
    "\uf0e6": "(", "\uf0f6": ")", "\uf0e7": "(", "\uf0f7": ")",
    "\uf0e8": "(", "\uf0f8": ")", "\uf03d": "=", "\uf0b5": "âˆ",
    "\uf0b3": "â‰¥", "\uf0b1": "Â±", "\uf03c": "<", "\uf03e": ">",
    "\uf032": "2", "\uf050": "Î ", "\uf05b": "[", "\uf05d": "]",
    "\uf0af": "â†“", "\uf0ce": "Îµâ‚€", "\uf0e9": "(", "\uf0ea": "(",
    "\uf0f9": ")", "\uf0fa": ")",
    "\uf8e7": "",
}


def clean_char(c):
    if ord(c) >= 0xE000:
        return GLYPH_MAP.get(c, "")
    if c == "\u2113":
        return "l"
    if c == "\u00ba":
        return "\u00b0"
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
    if re.match(r"^SECTION\s*[â€“\-]\s*[AB]$", up):
        return True
    if up in ("ENGLISH", "HINDI"):
        return True
    if t.startswith("Test Booklet") or "AGAJHA" in t or "M4" in t:
        return True
    if t.isdigit() and len(t) < 3: # page numbers
        return True
    if t in ("PW Website", "Android App", "iOS App", "|"):
        return True
    if t.startswith("Important Instructions") or t.startswith("[Contd"):
        return True
    if "DATE:" in up:
        return True
    return False


# =====================================================================
# Math polishing â€” turn plain-text maths into LaTeX markup so the
# front-end KaTeX renderer (VectorText) displays it beautifully.
# =====================================================================

# 'x' used as a multiplication sign between numbers â†’ \times
MUL_X_RE = re.compile(r"([\d\}]\s*)x(\s*[\d\{])", re.IGNORECASE)
# unicode Ã— between numbers â†’ \times
MUL_TIMES_RE = re.compile(r"([\d\}]\s*)[\u00D7](\s*[\d\{])")

# numeric fraction a/b â†’ \frac{a}{b} (also letter/number like c/100, Ï€/2)
FRAC_RE = re.compile(
    r"(?<![{}])((?:[A-Za-z\u0370-\u03FF]|\d+(?:\.\d+)?)(?:[eE][+-]?\d+)?)"
    r"\s*/\s*((?:\d+(?:\.\d+)?)(?:[eE][+-]?\d+)?)(?![{}])"
)
# unit exponent like ms^{-1} or V m^{-1} already handled by line_markup2.

# Collapse runs of spaces created by the join of scripts with surrounding text
SPACE_RE = re.compile(r"\s{2,}")


def polish_math(t):
    """Normalize extracted text into clean LaTeX math markup."""
    if not t:
        return t
    # Avoid rewriting inside an existing math token (â€¦^{â€¦} / _{â€¦} / \frac{â€¦}â€¦)
    if "{" in t or "}" in t:
        # Still fix multiplication when braces only wrap exponents:
        # "27 x 10^{4}" â†’ "27 \times 10^{4}"
        t = MUL_X_RE.sub(r"\1 \\times \2", t)
        t = MUL_TIMES_RE.sub(r"\1 \\times \2", t)
        return SPACE_RE.sub(" ", t)
    t = MUL_X_RE.sub(r"\1 \\times \2", t)
    t = MUL_TIMES_RE.sub(r"\1 \\times \2", t)
    t = FRAC_RE.sub(r"\\frac{\1}{\2}", t)
    # Fix spacing artifacts: "9 \times10^{4}" â†’ "9 \times 10^{4}"
    t = re.sub(r"\\times(?=\S)", "\\times ", t)
    return SPACE_RE.sub(" ", t)


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
                    if not t or t == "\x00":
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
    return ("Important Instructions" in t or "Test Booklet is" in t[:600]
            or "GENERAL INSTRUCTION" in t or "General Instruction" in t)


def is_answer_key_page(page):
    t = page.get_text("text", flags=0)[:3000]
    if "ANSWERS" in t or "Hints & Solutions" in t or "Text Solution" in t[:3000]:
        return True
    # 2024 answer key page has no heading: "N." and "(X)" pairs on separate
    # lines (200 questions). A real question page has far fewer bare markers.
    n_markers = len(re.findall(r"(?m)^\s*\d{1,3}\.\s*$", t))
    ans_markers = len(re.findall(r"(?m)^\s*\([1-4](?: or [1-4])?\)\s*$", t))
    return n_markers >= 40 and ans_markers >= 40


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


def render_clip(page, rect, out_fn, scale=3.0):
    pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=fitz.Rect(rect))
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
            if 1 <= n <= 200:
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
        render_clip(doc[pno], rect, os.path.join(img_dir, fname), scale=3.0)
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
        if idx + 1 < len(tops):
            q_bottom = tops[idx + 1]
        else:
            # Last question on the column: crop to the last option marker
            # (+ a small pad) instead of the raw page bottom, so tall
            # screenshots don't include empty space below the question.
            last4 = [m for m in word_markers[pno][col]
                     if m[0] == 4 and m[2] >= q_top]
            q_bottom = (max(m[2] for m in last4) + 28) if last4 else 838.0
            q_bottom = min(q_bottom, 838.0)
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
            pass
        if any(not o["text"] and not o.get("figure") for o in q["options"]):
            render_question_block(doc, q["page"] - 1, q, col, sp, q_top,
                                  q_bottom, img_dir)
# =====================================================================
# Main
# =====================================================================


def get_answer_key():
    import fitz
    ans_key = {}
    doc = fitz.open(os.path.join("neet", "neet 2021 answer key.pdf"))
    lines = []
    for page in doc:
        text = page.get_text("text")
        lines.extend([l.strip() for l in text.split("\n") if l.strip()])
    
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.isdigit():
            qnum = int(line)
            if i + 1 < len(lines) and lines[i+1].isdigit():
                ans = lines[i+1]
                ans_key[qnum] = ans
                i += 2
                continue
        i += 1
    return ans_key

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    global ans_key
    ans_key = get_answer_key()
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
    def close_question():
        nonlocal cur
        if cur is None:
            return
        for opt in cur["options"]:
            opt["text"] = opt["text"].strip()
            if not opt["text"]:
                opt["text"] = "[Diagram/Graph from Paper]"
        if cur["text"] or any(o["text"] for o in cur["options"]):
            questions.append(cur)
        cur = None

    def new_question(n, pno):
        nonlocal cur
        close_question()
        cur = {
            "section": section_for_qnum(n),
            "number": n,
            "text": "",
            "options": [],
            "answers": [ans_key.get(n)] if ans_key.get(n) else [],
            "solution": "",
            "page": pno + 1,
            "images": [],
        }

    for pno, lines in enumerate(lines_per_page):
        if is_instruction_page(doc[pno]):
            continue
        
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
                    if 1 <= n <= 200 and (cur is None or n > cur["number"]):
                        new_question(n, pno)
                    continue

                im = re.match(r"^(\d{1,3})\.\s*(\S.*)$", t)
                if im and (cur is None or int(im.group(1)) > cur["number"]):
                    n = int(im.group(1))
                    if 1 <= n <= 200:
                        new_question(n, pno)
                        t = im.group(2)

                if cur is not None:
                    inl = re.match(r"^(.*?)(\d{1,3})\.\s+(\S.*)$", t)
                    while inl and (cur is None or int(inl.group(2)) > cur["number"]):
                        n2 = int(inl.group(2))
                        if not (1 <= n2 <= 200):
                            break
                        new_question(n2, pno)
                        t = inl.group(3)
                        inl = re.match(r"^(.*?)(\d{1,3})\.\s+(\S.*)$", t)

                if cur is None:
                    continue

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
        if n == q["number"] + 1 and 1 <= n <= 200:
            cut = last_opt["text"].rfind(em.group(1))
            last_opt["text"] = last_opt["text"][:cut].strip()
            extra.append((i + 1, {
                "section": section_for_qnum(n),
                "number": n,
                "text": em.group(2).strip(),
                "options": [],
                "answers": [ans_key.get(n)] if ans_key.get(n) else [],
                "solution": "",
                "page": q["page"],
                "images": [],
            }))
    for pos, eq in reversed(extra):
        valid.insert(pos, eq)

    doc.close()

    # ---- polish text into clean LaTeX math markup ----
    for q in valid:
        q["text"] = polish_math(q["text"])
        for opt in q["options"]:
            opt["text"] = polish_math(opt["text"])
        q["solution"] = polish_math(q.get("solution", ""))
    out = {
        "key": "neet-2021",
        "title": "NEET (UG) 2021",
        "fullTitle": "NEET (UG) 2021 - National Eligibility cum Entrance Test",
        "examDate": "2021-09-12",
        "durationMinutes": 180,
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
    print(f"\n{'=' * 62}")
    print(f"Paper: neet-2021  questions: {len(valid)}")
    print(f"Sections: {dict(by_section)}")
    print(f"Fractions in stems: {fracs}  in options: {frac_opt}")
    print(f"Questions with sub/sup markup: {sup_sub}")
    if no_opts:
        print(f"MISSING 4 OPTIONS ({len(no_opts)}): {no_opts[:40]}")
    if no_text:
        print(f"MISSING TEXT ({len(no_text)}): {no_text[:40]}")
    print(f"Output: {os.path.abspath(os.path.join(OUT_DIR, 'questions.json'))}")
    print("=" * 62)


if __name__ == "__main__":
    main()
