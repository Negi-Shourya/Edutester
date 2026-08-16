#!/usr/bin/env python3
"""Extract NEET 2023 (Chapter & Topicwise PYQ booklet) into JSON + images.

The source PDF is a "Chapter & Topicwise NEET PYQ's - NEET 2023 Solved Paper"
booklet: questions are numbered 1-50 per subject domain across chapters
(biology 1-100), options are lettered a-d, and answers sit in per-domain
solution pages. This extractor:

  * rebuilds visual lines in reading order per page COLUMN (the booklet is
    two-column: left markers at x~46, right markers at x~318-352; chars are
    assigned to a column by the detected gutter BEFORE line building, so
    same-baseline lines from both columns never merge)
  * emits _{...}/^{...} markup for sub/superscripts (font size + baseline)
  * rebuilds stacked fractions as \\frac{num}{den} using drawn bars
  * decodes the booklet's private-use glyphs (Greek, arrows, ...)
  * emits "Match the Following" questions as two-column tables
  * clips vector-drawn figures and full question blocks for garbled
    structure/formula questions (chemistry)
  * pulls the answer key from the solution page ranges (never mixes
    solution text into questions); an answer of "(None)" (NTA bonus) is
    left empty — the scoring engine awards full marks for empty keys
  * remaps booklet numbers: Physics 1-50 -> 1-50, Chemistry 1-50 -> 51-100,
    Biology 1-100 -> 101-200 (single Biology section; no Botany/Zoology)
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

import fitz

PDF_PATH = os.path.join("neet", "2023 Neet.pdf")
OUT_DIR = os.path.join("neet-out", "2023")

# 0-indexed page ranges
BIO_QPAGES = list(range(0, 11))        # 1-100  (p1-11)
BIO_SPAGES = list(range(11, 18))       # answers for bio
PHY_QPAGES = list(range(18, 23))       # 1-50   (p19-23)
PHY_SPAGES = list(range(23, 28))       # answers for physics
CHE_QPAGES = list(range(28, 34))       # 1-50   (p29-34)
CHE_SPAGES = list(range(34, 38))       # answers for chemistry

MIN_EDGE = 30
MIN_RASTER_AREA = 900
FIGURE_MIN_AREA = 800
SCRIPT_RATIO = 0.78
SCRIPT_DT = 1.4
MAX_Y = 795.0  # footer junk ("Section-A", "Year", page art) starts below this


def section_for(q):
    return q["subject"]


GLYPH_MAP = {
    "\uf061": "α", "\uf062": "β", "\uf067": "γ", "\uf073": "σ",
    "\uf06c": "λ", "\uf06d": "μ", "\uf070": "π", "\uf071": "θ",
    "\uf072": "ρ", "\uf064": "δ", "\uf06b": "κ", "\uf06e": "ν",
    "\uf074": "τ", "\uf077": "ω", "\uf065": "ε", "\uf06a": "φ",
    "\uf06f": "ο", "\uf068": "η", "\uf069": "ι", "\uf078": "ξ",
    "\uf079": "ψ", "\uf07a": "ζ", "\uf066": "ζ", "\uf044": "Δ",
    "\uf046": "Φ", "\uf047": "Γ", "\uf051": "Θ", "\uf057": "Ω",
    "\uf053": "Σ", "\uf058": "Ξ", "\uf059": "Ψ", "\uf050": "Π",
    "\uf03b": ";", "\uf03d": "=", "\uf03c": "<", "\uf03e": ">",
    "\uf0b0": "°", "\uf083": "⇌", "\uf0de": "→", "\uf0af": "↓",
    "\uf0d7": "×", "\uf0b4": "×", "\uf0b1": "±", "\uf0b3": "≥",
    "\uf0b5": "∝", "\uf0bc": "≈", "\uf0a2": "∞", "\uf0c5": "+",
    "\uf032": "2",
    "\uf0eb": "(", "\uf0fb": ")", "\uf0ef": "(", "\uf0ff": ")",
    "\uf0e6": "(", "\uf0f6": ")", "\uf0e7": "(", "\uf0f7": ")",
    "\uf0e8": "(", "\uf0f8": ")", "\uf0e9": "(", "\uf0ea": "(",
    "\uf0f9": ")", "\uf0fa": ")",
    "\uf05b": "[", "\uf05d": "]",
    "\uf0ce": "ε₀",
    "\uf8e7": "",
}


def clean_char(c):
    if ord(c) >= 0xE000 and ord(c) <= 0xF8FF:
        return GLYPH_MAP.get(c, "")
    if c == "\ufffd":
        return ""
    if c == "\u2113":
        return "l"
    if c == "\u00ba":
        return "\u00b0"
    return c


JUNK_FONTS = ("Impact", "Bahnschrift", "ArialRoundedMTBold", "Baloo")


def is_skip_line(text):
    t = text.strip()
    if not t:
        return True
    if re.fullmatch(r"\d{1,3}", t):
        return True
    up = t.upper()
    if "NEET" in up and ("SOLVED" in up or "TOPICWISE" in up):
        return True
    if re.match(r"^SECTION\s*[-–]?\s*[AB]$", up):
        return True
    # footer junk: single letters of rotated "Year", bare symbols
    if re.fullmatch(r"[A-Za-z]", t) and t not in ("A", "B", "C", "D", "E", "R", "S", "T"):
        return True
    return False


# ---------------------------------------------------------------------
# Math polishing -> KaTeX-compatible markup
# ---------------------------------------------------------------------
MUL_X_RE = re.compile(r"([\d\}]\s*)x(\s*[\d\{])", re.IGNORECASE)
MUL_TIMES_RE = re.compile(r"([\d\}]\s*)[\u00D7](\s*[\d\{])")
SPACE_RE = re.compile(r"\s{2,}")


def polish_math(t):
    if not t:
        return t
    if "{" in t or "}" in t:
        t = MUL_X_RE.sub(r"\1 \\times \2", t)
        t = MUL_TIMES_RE.sub(r"\1 \\times \2", t)
        return SPACE_RE.sub(" ", t)
    t = MUL_X_RE.sub(r"\1 \\times \2", t)
    t = MUL_TIMES_RE.sub(r"\1 \\times \2", t)
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
                    if not t or t == "\x00" or t.isspace():
                        continue
                    b = ch["bbox"]
                    out.append(LChar(b[0], b[1], b[2], b[3], size, font,
                                     t, ch["origin"][1]))
    return out


class VLine:
    __slots__ = ("chars", "baseline", "frac", "skip", "skip_prefix_x", "col")

    def __init__(self, chars, baseline):
        self.chars = sorted(chars, key=lambda c: c.x0)
        self.baseline = baseline
        self.frac = None
        self.skip = False
        self.skip_prefix_x = None
        self.col = "L"

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

    @property
    def visible_chars(self):
        return [c for c in self.chars
                if self.skip_prefix_x is None or c.x0 >= self.skip_prefix_x - 0.5]

    def plain(self):
        return "".join(clean_char(c.text) for c in self.visible_chars)


def text_bbox(v):
    return fitz.Rect(v.x0 - 2, v.y0 - 2, v.x1 + 2, v.y1 + 2)


def build_lines(chars, split_x, tol=4.5, x_gap=30.0):
    """Assign chars to the L/R column FIRST (by the detected gutter), then
    build VLines within each column. Same-baseline clusters that are far
    apart in x (side-by-side options a/b or c/d on one row) are split into
    separate VLines so they never merge."""
    cols = {"L": [], "R": []}
    for c in chars:
        if split_x is None:
            cols["L"].append(c)
        else:
            cols["R" if (c.x0 + c.x1) / 2 >= split_x else "L"].append(c)
    lines = []
    for col in ("L", "R"):
        cs = sorted(cols[col], key=lambda c: (c.oy, c.x0))
        cur, cur_y = [], None
        for c in cs:
            if cur_y is None or abs(c.oy - cur_y) <= tol:
                cur.append(c)
                cur_y = c.oy
            else:
                lines.extend(_mk_lines(cur, col, x_gap))
                cur, cur_y = [c], c.oy
        if cur:
            lines.extend(_mk_lines(cur, col, x_gap))
    lines.sort(key=lambda l: (0 if l.col == "L" else 1, l.baseline))
    return lines


def _mk_lines(chars, col, x_gap):
    """A same-baseline cluster may hold side-by-side fragments (option rows
    like 'a. ...' and 'b. ...' on one line) — split it into one VLine per
    x-segment, then keep the biggest segment's baseline."""
    chars = sorted(chars, key=lambda c: c.x0)
    segs, cur = [], [chars[0]]
    for c in chars[1:]:
        if c.x0 - cur[-1].x1 > x_gap:
            segs.append(cur)
            cur = [c]
        else:
            cur.append(c)
    segs.append(cur)
    out = []
    for seg in segs:
        seg.sort(key=lambda c: c.x0)
        sizes = Counter(round(c.size, 1) for c in seg)
        main_size = sizes.most_common(1)[0][0]
        main = [c for c in seg if abs(c.size - main_size) < 0.2]
        if main:
            baseline = sorted(c.oy for c in main)[len(main) // 2]
        else:
            baseline = sorted(c.oy for c in seg)[len(seg) // 2]
        v = VLine(seg, baseline)
        v.col = col
        out.append(v)
    return out


def line_markup(v):
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

    for c in sorted(v.visible_chars, key=lambda c: c.x0):
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


def line_plain(v):
    return "".join(clean_char(c.text) for c in v.chars).strip()


# ---------------------------------------------------------------------
# Stacked fractions (drawn bar between numerator and denominator)
# ---------------------------------------------------------------------
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
    TOKEN_RE = re.compile(r"^[0-9A-Za-z\u0370-\u03FF\u2192{}\\\^{}_\u00B7\u00D7+\-]+$")
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
        ntext = re.sub(r"^[a-d]\.\s*", "", line_plain(num)).strip()
        dtext = line_plain(den).strip()
        if not ntext or not dtext:
            continue

        def token_of(s):
            tokens = s.split()
            if not tokens:
                return ""
            got = tokens[0]
            if len(tokens) > 1 and TOKEN_RE.match(tokens[1]) \
                    and len(got + tokens[1]) <= 6:
                got += tokens[1]
            return got

        nt, dt = token_of(ntext), token_of(dtext)
        if not nt or not dt or len(nt) > 6 or len(dt) > 6:
            continue
        if den.skip or num.frac is not None:
            continue
        # Option fractions: the marker line ('a.'..'d.') sits between the
        # numerator and denominator at the bar height. Attach the fraction
        # to that marker so 'a. 3v/4' renders as a single option, and skip
        # the numerator/denominator lines entirely.
        marker = None
        for l in lines:
            if re.match(r"^[a-d]\.\s*$", line_plain(l)) and \
               num.baseline <= l.baseline <= den.baseline:
                marker = l
                break
        if marker is not None:
            marker.frac = (nt, dt)
            num.skip = True
            den.skip = True
            continue
        # Stem fraction: mark the numerator line, skip the denominator line.
        # If the denominator line carries trailing prose ("9 A from A to B"),
        # strip only the consumed token(s); otherwise skip the line entirely.
        vis = den.visible_chars
        if "".join(c.text for c in vis).strip() != dt:
            consumed = 0
            for c in vis:
                consumed += len(c.text)
                if consumed >= len(dt):
                    den.skip_prefix_x = c.x1
                    break
        else:
            den.skip = True
        num.frac = (nt, dt)


# ---------------------------------------------------------------------
# Vector-drawn figure clusters
# ---------------------------------------------------------------------
def drawing_clusters(page):
    pw, ph = page.rect.width, page.rect.height
    rects = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.width < 0.4 and r.height < 0.4:
            continue
        if r.width * r.height < 12:
            continue
        # Skip full-page frame/border rects and the running header banner:
        # they overlap every figure on the page and would merge them all.
        if r.width > 0.65 * pw and r.height > 0.65 * ph:
            continue
        if r.y0 < 40 and r.height > 60 and r.width > 0.4 * pw:
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


def render_clip(page, rect, out_fn, scale=3.0):
    pm = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=fitz.Rect(rect))
    pm.save(out_fn)


# ---------------------------------------------------------------------
# Match List-I / List-II tables (single column; rows continue across
# multiple visual lines)
# ---------------------------------------------------------------------
LETTER_LABEL = re.compile(r"^(?:\(?)([A-E])\)?\.?\s*\S")
ROMAN_LABEL = re.compile(r"^(?:\()?(I{1,3}|IV|V|VI{1,2})\)?[.)\-]?\s*\S")
COL_SPLIT_X = 305.0


class MatchTable:
    """Collects List-I/List-II lines and renders them as two-column rows
    ('A. x  I. y') plus 'List-I'/'List-II' header lines, the format the
    front-end FormattedQuestionText turns into a table."""

    def __init__(self):
        self.closed = False
        self.lines = []

    def feed(self, text, x0):
        if self.closed:
            return False
        if "choose the correct" in text.lower() or \
           "choose the most appropriate" in text.lower():
            self.closed = True
            return False
        self.lines.append((x0, text))
        return True

    def render(self):
        left, right = [], []
        for x0, t in sorted(self.lines, key=lambda p: p[0]):
            t = t.strip()
            if not t:
                continue
            m = LETTER_LABEL.match(t)
            if m:
                left.append(m.group(1) + ". " + t[m.end(1) + 1:].lstrip(".- ").strip())
                continue
            m = ROMAN_LABEL.match(t)
            if m:
                right.append(m.group(1) + ". " + t[m.end(1) + 1:].lstrip(".- ").strip())
                continue
            if "List-I" in t or t.lower().startswith("list i"):
                cur = "left"
            elif "List-II" in t or t.lower().startswith("list ii"):
                cur = "right"
            elif x0 >= COL_SPLIT_X:
                (right if right else left).append(t)
            else:
                (left if left else right).append(t)
        n = max(len(left), len(right))
        out = ["List-I", "List-II"]
        for i in range(n):
            out.append("%s  %s" % (left[i] if i < len(left) else "",
                                   right[i] if i < len(right) else ""))
        return out


# ---------------------------------------------------------------------
# Garbled-text detection + block / option-cell clips
# ---------------------------------------------------------------------
def is_garbled_text(t):
    """True when the option text is a jumble of stacked glyph fragments
    (chemistry structures / equation overlays). Numeric options, phrases
    and unit expressions are kept as text."""
    if not t:
        return False
    w = t.split()
    if len(w) < 2:
        return False
    if any(re.search(r"[A-Za-z\u0370-\u03FF]{4,}", x) for x in w):
        return False
    if sum(1 for x in w if re.search(r"\d", x)) >= 2:
        return False
    op = re.search(r"[=\u00d7\u2192\u0394+\-\u2212()/^_]", t)
    if op:
        return True
    return len(w) >= 5 and all(len(x) <= 2 for x in w)


def has_bad_chars(t):
    return any("\ufffd" in t or (0xE000 <= ord(ch) <= 0xF8FF) for ch in t)


def render_question_block(doc, pno, q, q_top, q_bottom, img_dir, col="L", split_x=None):
    # Clip only the question's own column (left/right), from its top marker
    # down to the next question's marker, plus a little padding.
    if col == "L":
        x0, x1 = 50, (split_x if split_x is not None else 305)
    else:
        x0, x1 = (split_x if split_x is not None else 305), 611
    rect = fitz.Rect(x0, q_top - 3, x1, q_bottom - 3)
    fname = "Q%d_block.png" % q["number"]
    try:
        render_clip(doc[pno], rect, os.path.join(img_dir, fname))
    except Exception:
        return None
    q["text"] = ""
    for opt in q["options"]:
        opt["text"] = ""
        opt["image"] = None
    q["images"] = [fname]
    return fname


def page_letter_markers(page):
    """Map option markers 'a.'..'d.' to (letter_index, x, y)."""
    out = []
    for w in page.get_text("words"):
        x0, y0, x1, y1, word = w[0], w[1], w[2], w[3], w[4]
        m = re.match(r"^([a-d])\.$", word)
        if m:
            out.append((ord(m.group(1)) - 96, x0, y0))
    return out


def page_column_split(page, chars):
    """Return the x gutter between the two text columns, or None if 1-col."""
    xs = sorted(c.x0 for c in chars if 150 < c.oy < 760)
    best_gap, best_x = 0, None
    for i in range(len(xs) - 1):
        gap = xs[i + 1] - xs[i]
        if 200 < xs[i] < 450 and gap > best_gap:
            best_gap, best_x = gap, (xs[i] + xs[i + 1]) / 2
    if best_gap < 9:
        return None
    return best_x


# ---------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------
def main():
    sys.stdout.reconfigure(encoding="utf-8")
    doc = fitz.open(PDF_PATH)
    print(f"Opened: {PDF_PATH} ({doc.page_count} pages)")

    subjects = {"bio": "BIOLOGY", "phy": "PHYSICS", "chem": "CHEMISTRY"}
    qpages = {"bio": BIO_QPAGES, "phy": PHY_QPAGES, "chem": CHE_QPAGES}
    spages = {"bio": BIO_SPAGES, "phy": PHY_SPAGES, "chem": CHE_SPAGES}

    img_dir = os.path.join(OUT_DIR, "images")
    os.makedirs(img_dir, exist_ok=True)
    for old in os.listdir(img_dir):
        os.remove(os.path.join(img_dir, old))

    questions = []
    answers = {}  # (subject, booklet_num) -> letter index 1..4

    # ---- answers from the solution page ranges first ----
    for sub, pages in spages.items():
        for pno in pages:
            t = doc[pno].get_text("text", flags=0)
            for m in re.finditer(r"(?m)^\s*(\d{1,3})\.\s+\(([a-d])\)\s", t):
                n, letter = int(m.group(1)), m.group(2)
                answers[(sub, n)] = ord(letter) - 96

    # ---- stream out questions from the question page ranges ----
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

    def new_question(n, pno, subject, top_y=None, col="L"):
        nonlocal cur, match_tbl
        close_question()
        match_tbl = None
        cur = {
            "subject": subject,
            "booklet": n,
            "number": n,
            "text": "",
            "options": [],
            "answers": [],
            "page": pno + 1,
            "top_y": top_y,
            "col": col,
            "images": [],
        }

    for sub, pages in qpages.items():
        # Booklet numbers restart at 1 for every subject: reset the stream
        # so physics Q1..50 and chemistry Q1..50 open their own questions.
        cur = None
        match_tbl = None
        for pno in pages:
            page = doc[pno]
            chars = [c for c in collect_chars(page)
                     if not c.font.startswith("Roboto")
                     and not c.font.startswith(JUNK_FONTS)
                     and 35 <= c.y0 < MAX_Y]
            split_x = page_column_split(page, chars)
            raw_lines = build_lines(chars, split_x)
            detect_fractions(raw_lines, page)

            for col in ("L", "R"):
                for v in [l for l in raw_lines if l.col == col]:
                    if v.skip:
                        continue
                    raw = line_plain(v)
                    if is_skip_line(raw):
                        continue
                    if v.frac:
                        bare = re.match(r"^([a-d])\.$", raw)
                        if bare:
                            t = "%s. \\frac{%s}{%s}" % (bare.group(1), v.frac[0], v.frac[1])
                        else:
                            t = "\\frac{%s}{%s}" % v.frac
                    else:
                        t = line_markup(v)
                    t = t.strip()
                    if not t:
                        continue

                    m = re.match(r"^(\d{1,3})\.\s*$", t)
                    nn = None
                    if m:
                        nn = int(m.group(1))
                    im = re.match(r"^(\d{1,3})\.\s+(\S.*)$", t)
                    if im:
                        nn = int(im.group(1))
                    if nn is not None:
                        if cur is None or nn > cur["booklet"]:
                            if 1 <= nn <= 100:
                                new_question(nn, pno, sub, top_y=v.baseline, col=col)
                                if im:
                                    t = im.group(2)
                                else:
                                    continue
                        elif im:
                            t = im.group(2)

                    if cur is None:
                        continue

                    # inline "12. stem text" inside a long line
                    inl = re.match(r"^(.*?)\s+(\d{1,3})\.\s+(\S.*)$", t)
                    while inl and int(inl.group(2)) > cur["booklet"]:
                        n2 = int(inl.group(2))
                        new_question(n2, pno, sub, top_y=v.baseline)
                        t = inl.group(3)
                        inl = re.match(r"^(.*?)\s+(\d{1,3})\.\s+(\S.*)$", t)

                    if match_tbl is not None:
                        if re.match(r"^[a-d]\.\s", t):
                            match_tbl = None
                        elif match_tbl.feed(line_plain(v), v.x0):
                            continue
                    if t.startswith("Choose the correct"):
                        match_tbl = None
                        t = ""

                    om = re.match(r"^[a-d]\.\s*(.*)$", t)
                    if om:
                        pieces = re.split(r"(?=[a-d]\.\s)", t)
                        for piece in pieces:
                            pm = re.match(r"^[a-d]\.\s*(.*)$", piece.strip())
                            if not pm:
                                continue
                            label = piece[0]
                            idx = ord(label) - 96
                            if cur["options"] and idx <= int(cur["options"][-1]["label"]):
                                cur["options"][-1]["text"] = (
                                    cur["options"][-1]["text"] + " " + pm.group(1)).strip()
                            else:
                                cur["options"].append(
                                    {"label": str(idx), "text": pm.group(1).strip()})
                        continue

                    if cur["options"]:
                        cur["options"][-1]["text"] = (
                            cur["options"][-1]["text"] + " " + t).strip()
                    elif t.startswith("Match List") or re.match(r"^Match\s", t, re.I):
                        cur["text"] = (cur["text"] + " " + t).strip()
                        match_tbl = MatchTable()
                    else:
                        cur["text"] = (cur["text"] + " " + t).strip()

        close_question()

    # ---- dedupe by subject + booklet number ----
    seen = {}
    for q in questions:
        key = (q["subject"], q["booklet"])
        if key in seen:
            print(f"WARN duplicate booklet number {q['booklet']} {q['subject']}")
        seen[key] = q
    valid = [seen[k] for k in sorted(seen, key=lambda k: (0 if k[0] == "phy" else 1 if k[0] == "chem" else 2, k[1]))]

    by_sub = defaultdict(list)
    for q in valid:
        by_sub[q["subject"]].append(q)

    # ---- remap numbers: Phys 1-50, Chem 51-100, Bio 101-200 ----
    remap = {"phy": 0, "chem": 50, "bio": 100}
    for q in valid:
        q["number"] = q["booklet"] + remap[q["subject"]]
        q["section"] = subjects[q["subject"]]
        ans = answers.get((q["subject"], q["booklet"]))
        q["answers"] = [ans] if ans else []
    valid.sort(key=lambda q: q["number"])

    # ---- vector figures ----
    counts = {}
    placed_info = []
    for pno in set(qpages["bio"] + qpages["phy"] + qpages["chem"]):
        page = doc[pno]
        page_qs = sorted([q for q in valid if q["page"] - 1 == pno],
                         key=lambda q: q["top_y"] if q["top_y"] is not None else 1e9)
        for cl in drawing_clusters(page):
            if cl.width < 25 or cl.height < 15:
                continue
            if cl.get_area() < FIGURE_MIN_AREA:
                continue
            picked = None
            for idx, q in enumerate(page_qs):
                top = q["top_y"] if q["top_y"] is not None else -1
                nxt = page_qs[idx + 1] if idx + 1 < len(page_qs) else None
                nxt_top = nxt["top_y"] if nxt and nxt["top_y"] is not None else 1e9
                if top <= cl.y0 + 6 < nxt_top:
                    picked = q
                    break
            if picked is None:
                continue
            covered = any(
                pi["pno"] == pno and pi["qnum"] == picked["booklet"] and
                (pi["rect"] & cl).get_area() > 0.5 * cl.get_area()
                for pi in placed_info)
            if covered:
                continue
            key = (picked["booklet"], "d")
            idx = counts.get(key, 0) + 1
            counts[key] = idx
            base = "Q%d" % picked["booklet"]
            fname = base + ".png" if idx == 1 else "%s_%d.png" % (base, idx)
            render_clip(page, cl, os.path.join(img_dir, fname))
            if fname not in picked["images"]:
                picked["images"].append(fname)
            placed_info.append({"pno": pno, "qnum": picked["booklet"],
                                "rect": cl, "fname": fname})

    # ---- garbled / empty content -> clips ----
    for q in valid:
        pno = q["page"] - 1
        if not (0 <= pno < len(doc)):
            continue
        page = doc[pno]
        q_chars = [c for c in collect_chars(page)
                   if not c.font.startswith("Roboto") and 35 <= c.y0 < MAX_Y]
        split_x = page_column_split(page, q_chars)
        col = q.get("col", "L")
        gtext = q["text"]
        bad_text = has_bad_chars(gtext) or any(has_bad_chars(o["text"])
                                               for o in q["options"])
        garbled_opts = [oi for oi, o in enumerate(q["options"], start=1)
                        if not o["text"] or is_garbled_text(o["text"])]
        markers = [m for m in page_letter_markers(page)
                   if m[1] > 40 and m[2] >= 40]
        # question band: from this question's marker line down to the next
        # question marker in the SAME column
        col_tops = sorted(q2["top_y"] for q2 in valid
                          if q2["page"] - 1 == pno and q2["top_y"]
                          and q2.get("col", "L") == col)
        band = None
        for idx, y in enumerate(col_tops):
            if y == q.get("top_y"):
                band = (y, col_tops[idx + 1] if idx + 1 < len(col_tops) else 830)
                break
        # Questions with a full set of garbled options, bad chars, or a
        # missing/incomplete option set (stacked-fraction options that could
        # not be split) are rendered as one image of the whole question.
        if bad_text or len(garbled_opts) == 4 or len(q["options"]) != 4:
            block = render_question_block(
                doc, pno, q,
                band[0] if band else (q.get("top_y") or 40),
                band[1] if band else 830, img_dir, col, split_x)
            if block:
                continue
        for oi in garbled_opts:
            hit = [m for m in markers if m[0] == oi and
                   (band is None or band[0] - 30 <= m[2] <= band[1] + 30)]
            if not hit:
                continue
            _, mx, my = hit[0]
            row = [m for m in markers if abs(m[2] - my) <= 4 and m[1] > mx]
            x1 = row[0][1] - 3 if row else 560
            below = [m for m in markers if m[2] > my + 8]
            y1 = min(my + 50, below[0][2] - 3) if below else my + 50
            rect = fitz.Rect(mx - 3, my - 26, x1, y1)
            fname = "Q%d_opt%d.png" % (q["number"], oi)
            try:
                render_clip(doc[pno], rect, os.path.join(img_dir, fname))
            except Exception:
                continue
            q["options"][oi - 1]["image"] = fname
        if any(not o["text"] and not o.get("image") for o in q["options"]):
            render_question_block(doc, pno, q,
                                  band[0] if band else 40, 830, img_dir,
                                  col, split_x)

    doc.close()

    # ---- ensure every question carries 4 options (block clips keep empty
    # placeholders so the UI always renders 4 rows) ----
    for q in valid:
        labels = [o["label"] for o in q["options"]]
        for want in ("1", "2", "3", "4"):
            if want not in labels:
                q["options"].append({"label": want, "text": ""})
        q["options"].sort(key=lambda o: int(o["label"]))

    # ---- polish text into clean math markup ----
    for q in valid:
        q["text"] = polish_math(q["text"])
        for opt in q["options"]:
            opt["text"] = polish_math(opt["text"])

    out = {
        "key": "neet-2023",
        "title": "NEET (UG) 2023",
        "fullTitle": "NEET (UG) 2023 - National Eligibility cum Entrance Test",
        "examDate": "2023-05-07",
        "durationMinutes": 200,
        "questionCount": len(valid),
        "questions": valid,
    }
    with open(os.path.join(OUT_DIR, "questions.json"), "w",
              encoding="utf-8") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)

    by_section = Counter(q["section"] for q in valid)
    no_opts = [q["number"] for q in valid if len(q["options"]) != 4]
    no_text = [q["number"] for q in valid if not q["text"]]
    no_ans = [q["number"] for q in valid if not q["answers"]]
    img_count = sum(len(q["images"]) for q in valid)
    opt_img = sum(1 for q in valid if any(o.get("image") for o in q["options"]))
    sup_sub = sum(1 for q in valid if "^{" in str(q["text"]) or
                  "_{" in str(q["text"]))
    fracs = sum(1 for q in valid if "\\frac" in str(q["text"]))
    match_qs = [q["number"] for q in valid if "List-" in q["text"]]
    print(f"\n{'=' * 62}")
    print(f"Paper: neet-2023  questions: {len(valid)}  figures: {img_count} "
          f"(opt clips in {opt_img} q)")
    print(f"Sections: {dict(by_section)}")
    print(f"Answers: {len(valid) - len(no_ans)}/{len(valid)}")
    print(f"Fractions in stems: {fracs}")
    print(f"Questions with sub/sup markup: {sup_sub}")
    print(f"Match tables rendered: {len(match_qs)}  {match_qs[:20]}")
    missing = sorted(set(range(1, 201)) - {q["number"] for q in valid})
    print(f"Missing numbers: {missing}")
    if no_opts:
        print(f"MISSING 4 OPTIONS ({len(no_opts)}): {no_opts[:40]}")
    if no_text:
        print(f"MISSING TEXT ({len(no_text)}): {no_text[:40]}")
    if no_ans:
        print(f"NO ANSWER ({len(no_ans)}): {no_ans[:40]}")
    print(f"Output: {os.path.abspath(os.path.join(OUT_DIR, 'questions.json'))}")
    print("=" * 62)


if __name__ == "__main__":
    main()
