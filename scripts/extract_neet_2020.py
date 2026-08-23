#!/usr/bin/env python3
"""
NEET (UG) 2020 extractor — source: neet/Ques&Ans_NEET2020.pdf
(Aakash "Questions & Answers" booklet, Test Booklet Code G3, 21 pages).

Layout facts this relies on (all verified against the PDF):
  * page 0 is the cover/instructions page; questions live on pages 1..20
  * two columns, gutter at x ~= 297.6 on every page
  * booklet numbering is continuous 1..180 with Biology 1-90 (pages 1-10),
    Physics 91-135 (pages 11-15), Chemistry 136-180 (pages 16-20).  The site
    convention (matching NEET 2021-2025) is Physics 1-45, Chemistry 46-90,
    Biology 91-180, so numbers get remapped by site_number().
  * every question ends with a literal "Answer (n)" line -> that is the key
  * the Aakash diagonal watermark is vector fill in a ~10% grey.  The Biology
    and Physics pages paint it in DeviceRGB (0.901961 0.905882 0.909804), the
    Chemistry pages in DeviceCMYK (0 0 0 .102) — clean_doc() rewrites either
    form to white, and every figure clip renders from that cleaned copy plus a
    pixel scrub, so no watermark ever reaches an extracted image.
  * maths is not unicode: stacked fractions are two char rows around a drawn
    rule, radicals are 11-segment filled polygons, sub/superscripts are 7pt
    chars offset from the 10pt baseline, and Greek/operators come from
    Symbol-encoded fonts in the U+F0xx private-use range.  All of it is
    reassembled into KaTeX markup (\\frac, \\sqrt, ^{}, _{}, \\hat, \\pi …).

Writes neet-out/2020/questions.json (+ images/) in the shape seed-neet-*.mjs
consumes.

Usage:
  python scripts/extract_neet_2020.py               # full run -> JSON + images
  python scripts/extract_neet_2020.py --debug 11    # dump one page's lines
  python scripts/extract_neet_2020.py --no-images   # skip figure clipping
"""
from __future__ import annotations

import argparse
import json
import os
import re
from collections import Counter
from dataclasses import dataclass, field

import fitz

PDF = "neet/Ques&Ans_NEET2020.pdf"
OUT_DIR = os.path.join("neet-out", "2020")
IMG_DIR = os.path.join(OUT_DIR, "images")

GUTTER = 297.6
FIRST_PAGE, LAST_PAGE = 1, 20
Y_TOP, Y_BOT = 48.0, 775.0

WATERMARK_RGB = "0.901961 0.905882 0.909804"   # as painted on the RGB pages
WM = (0.901961, 0.905882, 0.909804)            # …and as MuPDF renders either form

# ---------------------------------------------------------------------------
# Symbol-font private-use glyph map (every pair below was rendered in context
# from the booklet and checked by eye before being written down here)
# ---------------------------------------------------------------------------
GLYPHS = {
    0xF020: " ",
    0xF02B: "+",
    0xF02D: "–",
    0xF03D: "=",
    0xF044: "\\Delta ",
    0xF057: "\\Omega ",
    0xF061: "\\alpha ",
    0xF062: "\\beta ",
    0xF064: "\\delta ",
    0xF065: "\\varepsilon ",
    0xF067: "\\gamma ",
    0xF06C: "\\lambda ",
    0xF06D: "\\mu ",
    0xF06E: "\\nu ",
    0xF070: "\\pi ",
    0xF071: "\\theta ",
    0xF072: "\\rho ",
    0xF073: "\\sigma ",
    0xF074: "\\tau ",
    0xF077: "\\omega ",
    0xF0A2: "′",
    0xF0A3: "\\le ",
    0xF0A5: "\\infty ",
    0xF0AB: "\\leftrightarrow ",
    0xF0AC: "\\leftarrow ",
    0xF0AE: "\\rightarrow ",
    0xF0B0: "°",
    0xF0B1: "\\pm ",
    0xF0B3: "\\ge ",
    0xF0B4: "×",
    0xF0B5: "\\propto ",
    0xF0B7: "·",
    0xF0B8: "\\div ",
    0xF0B9: "\\ne ",
    0xF0BA: "\\equiv ",
    0xF0BB: "\\approx ",
    0xF0BE: "",       # arrowhorizex — the shaft of a long "⟶", head is F0AE
    0xF0CE: "\\varepsilon ",  # Aakash sets permittivity with Symbol's "∈"
    0xF0D6: "\\surd ",
    0xF0D7: "·",
    0xF0E6: "(",      # 3-piece tall parenthesis: top hook carries the glyph,
    0xF0E7: "",       # extender and bottom hook render as nothing
    0xF0E8: "",
    0xF0F6: ")",
    0xF0F7: "",
    0xF0F8: "",
}
HAT_CPS = {0xF024, 0x02C6, 0x0302}

BOOKLET_SECTIONS = [("BIOLOGY", 1, 90), ("PHYSICS", 91, 135), ("CHEMISTRY", 136, 180)]


def section_of(booklet_no: int) -> str:
    for name, lo, hi in BOOKLET_SECTIONS:
        if lo <= booklet_no <= hi:
            return name
    raise ValueError(booklet_no)


def site_number(booklet_no: int) -> int:
    """Booklet numbering -> site numbering (Physics 1-45, Chem 46-90, Bio 91-180)."""
    return booklet_no + 90 if booklet_no <= 90 else booklet_no - 90


# ---------------------------------------------------------------------------
# primitives
# ---------------------------------------------------------------------------
@dataclass
class Ch:
    c: str
    x0: float
    x1: float
    y: float
    top: float
    bot: float
    size: float
    font: str
    hat: bool = False

    @property
    def xm(self) -> float:
        return (self.x0 + self.x1) / 2


@dataclass
class Bar:
    x0: float
    x1: float
    y: float
    # How far the numerator and denominator reach; measured per bar by
    # classify_bars, since a fixed window swallows the text line above.
    up: float = 19.0
    dn: float = 20.0

    @property
    def xm(self) -> float:
        return (self.x0 + self.x1) / 2


@dataclass
class Rad:
    x0: float
    y0: float
    x1: float
    y1: float
    bx0: float
    bx1: float

    @property
    def xm(self) -> float:
        return (self.x0 + self.x1) / 2


@dataclass
class Art:
    x0: float
    y0: float
    x1: float
    y1: float


@dataclass
class Atom:
    x0: float
    x1: float
    kind: str  # 'ch' | 'grp'
    text: str
    mode: int = 0  # 0 baseline, +1 superscript, -1 subscript


@dataclass
class Line:
    y: float
    x0: float
    x1: float
    top: float
    bot: float
    atoms: list = field(default_factory=list)
    text: str = ""


@dataclass
class Region:
    page: int
    col: str
    chars: list = field(default_factory=list)
    bars: list = field(default_factory=list)
    rads: list = field(default_factory=list)
    art: list = field(default_factory=list)
    body: float = 10.0
    lines: list = field(default_factory=list)
    figs: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# pdf loading
# ---------------------------------------------------------------------------
def clean_doc() -> fitz.Document:
    """PDF copy with the Aakash watermark repainted white (used for figures)."""
    d = fitz.open(PDF)
    n = 0
    for pno in range(d.page_count):
        for xref in d[pno].get_contents():
            s = d.xref_stream(xref)
            hits = [m for m in _COL_RE.finditer(s) if _whiten(m) != m.group(0)]
            if not hits:
                continue
            n += len(hits)
            out, at = [], 0
            for m in hits:
                out.append(s[at:m.start()])
                out.append(_whiten(m))
                at = m.end()
            out.append(s[at:])
            d.update_stream(xref, b"".join(out))
    print(f"  watermark: {n} colour operators repainted white")
    return d


# A colour-setting operator with 1-4 numeric operands.  Text strings never
# look like this, so scanning the raw stream is safe.
_COL_RE = re.compile(
    rb"(?<![\w.])((?:[-+]?[0-9]*\.?[0-9]+[ \t]+){1,4})(rg|RG|g|G|k|K|sc|SC|scn|SCN)(?![\w])"
)
_WM_GREY = 0.902


def _whiten(m: "re.Match[bytes]") -> bytes:
    op = m.group(2)
    try:
        vals = [float(v) for v in m.group(1).split()]
    except ValueError:                                  # pragma: no cover
        return m.group(0)
    low = op.lower()
    if low in (b"rg", b"sc", b"scn") and len(vals) == 3:
        if all(abs(v - _WM_GREY) < 0.02 for v in vals):
            return b"1 1 1 " + op
    elif low == b"g" and len(vals) == 1:
        if abs(vals[0] - _WM_GREY) < 0.02:
            return b"1 " + op
    elif low == b"k" and len(vals) == 4:
        c, mm, y, kk = vals
        if max(c, mm, y) < 0.02 and 0.04 < kk < 0.16:
            return b"0 0 0 0 " + op
    return m.group(0)


def scrub(pix: fitz.Pixmap) -> fitz.Pixmap:
    """Whiten any residual watermark grey in a rendered clip.

    Belt-and-braces for watermark paint that never reaches a page content
    stream (form XObjects, soft masks).  Only touches pixels lighter than the
    grey itself, so black line art loses at most a sliver of antialiasing.
    """
    buf = bytearray(pix.samples)
    n = pix.n
    for i in range(0, len(buf), n):
        if all(buf[i + c] >= 212 for c in range(min(3, n))):
            for c in range(min(3, n)):
                buf[i + c] = 255
    return fitz.Pixmap(pix.colorspace, pix.width, pix.height, bytes(buf), pix.alpha)


def _is_wm(dr) -> bool:
    for k in ("fill", "color"):
        v = dr.get(k)
        if v and all(abs(a - b) < 0.01 for a, b in zip(v, WM)):
            return True
    return False


def collect(doc: fitz.Document, pno: int) -> tuple[Region, Region]:
    page = doc[pno]
    regs = {"L": Region(pno, "L"), "R": Region(pno, "R")}

    ymin = 1e9
    for b in page.get_text("rawdict")["blocks"]:
        if b["type"] != 0:
            continue
        for line in b["lines"]:
            for s in line["spans"]:
                if s["color"] == 16777215:  # white header text
                    continue
                for c in s["chars"]:
                    x, y = c["origin"]
                    ch = c["c"]
                    if len(ch) == 1 and ord(ch) < 0x20:  # end-of-booklet ornaments
                        continue
                    if not (Y_TOP <= y <= Y_BOT):
                        continue
                    if y > 755 and 285 <= x <= 315 and ch.isdigit():  # page number
                        continue
                    bb = c["bbox"]
                    if ch.strip():
                        ymin = min(ymin, y)
                    regs["L" if x < GUTTER else "R"].chars.append(
                        Ch(ch, bb[0], bb[2], y, bb[1], bb[3], s["size"], s["font"])
                    )

    rad_rects: list[fitz.Rect] = []
    for dr in page.get_drawings():
        if _is_wm(dr):
            continue
        r = dr["rect"]
        if r.y1 < ymin - 6 or r.y0 > 770:  # header gradient / footer
            continue
        items = dr["items"]
        black = dr.get("fill") == (0.0, 0.0, 0.0) or dr.get("color") == (0.0, 0.0, 0.0)
        reg = regs["L" if r.x0 < GUTTER else "R"]

        # A radical is a filled black glyph outline; its vinculum is the long
        # horizontal segment along the top edge.  Item counts vary by font
        # (10 on the chemistry pages, 11 on the physics pages).
        if dr["type"] == "f" and dr.get("fill") == (0.0, 0.0, 0.0) and 8 <= len(items) <= 14:
            top = r.y0 + 0.35 * (r.y1 - r.y0)
            seg = None
            for it in items:
                if it[0] != "l" or abs(it[1].y - it[2].y) > 0.5:
                    continue
                if max(it[1].y, it[2].y) > top:
                    continue
                if seg is None or abs(it[1].x - it[2].x) > abs(seg[1].x - seg[2].x):
                    seg = it
            if seg is not None and abs(seg[1].x - seg[2].x) > 0.45 * (r.x1 - r.x0):
                reg.rads.append(
                    Rad(r.x0, r.y0, r.x1, r.y1,
                        min(seg[1].x, seg[2].x), max(seg[1].x, seg[2].x))
                )
                rad_rects.append(r)
                continue

        if (
            dr["type"] == "s" and black and len(items) == 1 and items[0][0] == "l"
            and abs(items[0][1].y - items[0][2].y) < 0.5
            and abs(items[0][1].x - items[0][2].x) >= 3.0
            and (dr.get("width") or 1) <= 1.3
        ):
            reg.bars.append(
                Bar(min(items[0][1].x, items[0][2].x), max(items[0][1].x, items[0][2].x), r.y0)
            )
            continue

        w, h = r.x1 - r.x0, r.y1 - r.y0
        if w < 1.0 and h < 1.0:
            continue
        if h > 200 and w < 3:      # column divider
            continue
        if w > 200 and h < 3:      # horizontal rule
            continue
        if r.y0 > 745 and 280 <= r.x0 and r.x1 <= 330:
            continue               # page-number badge in the gutter
        if dr.get("fill") == (1.0, 1.0, 1.0) and dr.get("color") is None:
            continue               # white knock-out mask, nothing to see
        if any(r in (rr + (-1.5, -1.5, 1.5, 1.5)) for rr in rad_rects):
            continue               # hairline outline that traces a radical
        reg.art.append(Art(r.x0, r.y0, r.x1, r.y1))

    for reg in regs.values():
        sizes = Counter(round(c.size * 2) / 2 for c in reg.chars if c.c.strip())
        reg.body = max(sizes, key=lambda s: (sizes[s], s)) if sizes else 10.0
    return regs["L"], regs["R"]


def attach_hats(reg: Region) -> None:
    """Fold the free-standing circumflex glyph into \\hat{} on the letter below."""
    hats = [c for c in reg.chars if len(c.c) == 1 and ord(c.c) in HAT_CPS]
    if not hats:
        return
    for h in hats:
        best, score = None, 0.0
        for c in reg.chars:
            if c is h or not c.c.strip() or (len(c.c) == 1 and ord(c.c) in HAT_CPS):
                continue
            if not (1.0 < c.y - h.y < 9.0):
                continue
            ov = min(c.x1, h.x1) - max(c.x0, h.x0)
            if ov > score:
                best, score = c, ov
        if best is not None and score > 0.3 * (h.x1 - h.x0):
            best.hat = True
    reg.chars = [c for c in reg.chars if not (len(c.c) == 1 and ord(c.c) in HAT_CPS)]


def classify_bars(reg: Region) -> None:
    """Keep only rules that are genuine fraction bars, and measure their reach."""
    keep = []
    for b in reg.bars:
        if b.x1 - b.x0 > 130:
            continue
        if any(r.bx0 - 1.5 <= b.x0 and b.x1 <= r.bx1 + 1.5 and abs(b.y - r.y0) < 2.0
               for r in reg.rads):
            continue
        above = [c for c in reg.chars if b.x0 - 2.5 <= c.xm <= b.x1 + 2.5
                 and b.y - 19 < c.y < b.y - 0.5 and c.c.strip()]
        below = [c for c in reg.chars if b.x0 - 2.5 <= c.xm <= b.x1 + 2.5
                 and b.y + 0.5 < c.y < b.y + 20 and c.c.strip()]
        if above and below:
            keep.append(b)
    reg.bars = keep
    for b in keep:
        b.up = _reach(b, keep, reg, -1)
        b.dn = _reach(b, keep, reg, +1)


# A numerator or denominator may hold scripts, so it spans more than one
# baseline — but only by a script's rise, never by a whole line of leading.
SCRIPT_STEP = 7.0


def _reach(b: Bar, bars: list[Bar], reg: Region, sign: int) -> float:
    """How far above (sign -1) or below (+1) the bar its cell reaches.

    A fixed window cannot tell a numerator from the body text above it: on page
    13 an inline pi/3 sits 3.9pt over its bar while the previous line sits 18.2pt
    over it, well inside a 19pt window, so "phase" lost its a and s to the
    numerator.  Walk outwards from the bar instead and stop at the first gap too
    wide to be a script — unless a nested bar or radical bridges it, which means
    the far baseline is still inside this cell.
    """
    hard = 20.0 if sign > 0 else 19.0
    ys = sorted({c.y for c in reg.chars
                 if b.x0 - 2.5 <= c.xm <= b.x1 + 2.5 and c.c.strip()
                 and 0.5 < (c.y - b.y) * sign < hard},
                key=lambda y: abs(y - b.y))
    lim = 0.0
    for y in ys:
        d = abs(y - b.y)
        if lim and d - lim > SCRIPT_STEP and not _bridged(b, bars, reg, y, b.y + lim * sign):
            break
        lim = d
    return min(hard, lim + 1.0) if lim else hard


def _bridged(b: Bar, bars: list[Bar], reg: Region, y0: float, y1: float) -> bool:
    """True when a nested bar or radical lies between two baselines of a cell."""
    lo, hi = min(y0, y1), max(y0, y1)
    inx = lambda x: b.x0 - 2.5 <= x <= b.x1 + 2.5  # noqa: E731
    return (any(o is not b and lo < o.y < hi and inx(o.xm) for o in bars)
            or any(lo < r.y0 < hi and inx(r.xm) for r in reg.rads))


# ---------------------------------------------------------------------------
# maths rendering
# ---------------------------------------------------------------------------
def glyph(ch: Ch) -> str:
    cp = ord(ch.c) if len(ch.c) == 1 else 0
    g = GLYPHS.get(cp, "") if 0xE000 <= cp <= 0xF8FF else ch.c
    if ch.hat and g.strip():
        g = "\\hat{%s}" % g.strip()
    return g


def _zone(b: Bar, y: float) -> int:
    """+1 numerator, -1 denominator, 0 outside."""
    if b.y - b.up < y < b.y - 0.5:
        return 1
    if b.y + 0.5 < y < b.y + b.dn:
        return -1
    return 0


def atomize(chars: list[Ch], bars: list[Bar], rads: list[Rad],
            base: float, body: float) -> list[Atom]:
    """Turn a horizontal run of chars + drawn maths into x-ordered atoms."""
    if not chars:
        return []

    def nested(b: Bar) -> bool:
        return any(o is not b and o.x0 - 2.5 <= b.xm <= o.x1 + 2.5 and _zone(o, b.y)
                   for o in bars)

    used: set[int] = set()
    atoms: list[Atom] = []

    for b in [b for b in bars if not nested(b)]:
        num, den = [], []
        for i, c in enumerate(chars):
            if not (b.x0 - 2.5 <= c.xm <= b.x1 + 2.5):
                continue
            z = _zone(b, c.y)
            if z > 0:
                num.append(i)
            elif z < 0:
                den.append(i)
        if not num or not den:
            continue
        used.update(num + den)
        inner_b = [o for o in bars if o is not b and b.x0 - 2.5 <= o.xm <= b.x1 + 2.5
                   and _zone(b, o.y)]
        inner_r = [r for r in rads if b.x0 - 2.5 <= r.xm <= b.x1 + 2.5]
        n_txt = join([a for a in atomize([chars[i] for i in num],
                                        [o for o in inner_b if o.y < b.y],
                                        [r for r in inner_r if r.y1 <= b.y + 1],
                                        base=_median([chars[i].y for i in num]), body=body)])
        d_txt = join([a for a in atomize([chars[i] for i in den],
                                        [o for o in inner_b if o.y > b.y],
                                        [r for r in inner_r if r.y0 >= b.y - 1],
                                        base=_median([chars[i].y for i in den]), body=body)])
        atoms.append(Atom(b.x0, b.x1, "grp", "\\frac{%s}{%s}" % (n_txt, d_txt)))

    for r in rads:
        inner = [i for i, c in enumerate(chars)
                 if i not in used and r.bx0 - 1.5 <= c.xm <= r.bx1 + 1.5 and c.bot > r.y0]
        if not inner:
            continue
        used.update(inner)
        txt = join(atomize([chars[i] for i in inner], [], [],
                           base=_median([chars[i].y for i in inner]), body=body))
        atoms.append(Atom(r.x0, r.x1, "grp", "\\sqrt{%s}" % txt))

    small = 0.86 * body
    for i, c in enumerate(chars):
        if i in used:
            continue
        mode = 0
        if c.c.strip():
            # Small chars are scripts as soon as they leave the baseline.  The
            # booklet also sets some exponents at full size on a raised
            # baseline ("10^2 V"), so allow those too — but only for
            # alphanumerics, or tall stretched brackets and arrow glyphs that
            # legitimately sit off-baseline would be mistaken for scripts.
            tight = c.size <= small
            if tight or c.c.isalnum():
                up = 1.2 if tight else 2.4
                dn = 1.0 if tight else 2.4
                if c.y < base - up:
                    mode = 1
                elif c.y > base + dn:
                    mode = -1
        atoms.append(Atom(c.x0, c.x1, "ch", glyph(c), mode))

    atoms.sort(key=lambda a: a.x0)
    return atoms


def _median(vals: list[float]) -> float:
    v = sorted(vals)
    return v[len(v) // 2]


NOSP_BEFORE = ")]},.;:'’”%′"
NOSP_AFTER = "([{'‘“"


def join(atoms: list[Atom]) -> str:
    """Concatenate atoms, folding script runs into _{…}^{…} groups.

    Stacked maths, Symbol operators and option markers each live in their own
    text run, so the booklet often has no space character where one is visibly
    typeset — reinstate one whenever the horizontal gap says so.
    """
    out: list[str] = []
    prev: Atom | None = None
    i = 0
    while i < len(atoms):
        a = atoms[i]
        if (
            prev is not None and a.x0 - prev.x1 > 1.4
            and out and out[-1][-1:].strip() and a.text[:1].strip()
            and out[-1][-1] not in NOSP_AFTER and a.text[0] not in NOSP_BEFORE
        ):
            out.append(" ")
        if a.kind == "ch" and a.mode:
            j = i
            sup, sub = [], []
            while j < len(atoms) and atoms[j].kind == "ch" and atoms[j].mode:
                (sup if atoms[j].mode > 0 else sub).append(atoms[j].text)
                j += 1
            s_sub = "".join(sub).strip()
            s_sup = "".join(sup).strip()
            if s_sub:
                out.append("_{%s}" % s_sub)
            if s_sup:
                out.append("^{%s}" % s_sup)
            prev = atoms[j - 1]
            i = j
            continue
        out.append(a.text)
        prev = a
        i += 1
    return polish("".join(out))


DASHES = "–−"


def polish(s: str) -> str:
    s = s.replace(" ", " ")
    s = re.sub(r"○\s*[–\-−]", "\\\\ominus ", s)
    s = re.sub(r"[↽⇀]\s*[↽⇀]", "\\\\rightleftharpoons ", s)
    s = re.sub(r"\s+(?=[_^]\{)", "", s)              # "k _{B}"  -> "k_{B}"
    s = re.sub(r"(\\[A-Za-z]+) +(?=[_^]\{)", r"\1", s)  # "\Delta _{r}" -> "\Delta_{r}"
    s = re.sub(r"\{ +", "{", s)
    s = re.sub(r" +\}", "}", s)
    s = re.sub(r"\s+([.,])", r"\1", s)
    # "(\rho )" — a LaTeX command carries a trailing space so the next token does
    # not glue onto its name, but before a closing bracket that space is visible.
    s = re.sub(r"(\\[A-Za-z]+) +(?=[)\]}])", r"\1", s)
    # "Cr_{2} O_{7}" / "H_{2} O" — the booklet breaks its own formulae across
    # text runs, leaving a space the chemistry doesn't have.
    s = re.sub(r"(_\{[\d,]+\}) +(?=[A-Z])", r"\1", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    return s.strip()


# ---------------------------------------------------------------------------
# line assembly — two passes so scripts and stacked fractions land on the
# baseline they visually belong to
# ---------------------------------------------------------------------------
def build_lines(reg: Region) -> None:
    chars, bars, rads = reg.chars, reg.bars, reg.rads
    body = reg.body

    frac_of: dict[int, int] = {}
    for bi, b in enumerate(bars):
        for i, c in enumerate(chars):
            if b.x0 - 2.5 <= c.xm <= b.x1 + 2.5 and _zone(b, c.y):
                frac_of.setdefault(i, bi)

    groups: dict[int, list[int]] = {}
    for i, bi in frac_of.items():
        groups.setdefault(bi, []).append(i)

    prim = [i for i, c in enumerate(chars) if i not in frac_of and c.size > 0.9 * body]
    prim.sort(key=lambda i: chars[i].y)

    # Baselines drift by up to ~2.7pt inside one visual line (an arrow glyph
    # sitting a little high, a Symbol operator a little low), so chain the
    # comparison to the previous char rather than the bucket's first char.
    buckets: list[list[int]] = []
    for i in prim:
        if buckets and abs(chars[i].y - chars[buckets[-1][-1]].y) <= 2.6:
            buckets[-1].append(i)
        else:
            buckets.append([i])

    lines = [{"y": _median([chars[i].y for i in b]), "idx": list(b)} for b in buckets]

    # A full-size exponent ("10^2 V") sits on its own raised baseline, too far
    # off to have been chained above.  Fold any such short fragment into the
    # neighbouring line whose horizontal span already covers it.
    def nspace(idx):
        return sum(1 for i in idx if chars[i].c.strip())

    def xspan(idx):
        return min(chars[i].x0 for i in idx), max(chars[i].x1 for i in idx)

    fold = True
    while fold:
        fold = False
        for k, ln in enumerate(lines):
            if nspace(ln["idx"]) > 4:
                continue
            lo, hi = xspan(ln["idx"])
            host, dy = None, 1e9
            for j, other in enumerate(lines):
                if j == k or nspace(other["idx"]) <= nspace(ln["idx"]):
                    continue
                olo, ohi = xspan(other["idx"])
                d = abs(other["y"] - ln["y"])
                if d <= 8.0 and olo - 4 <= lo and hi <= ohi + 4 and d < dy:
                    host, dy = other, d
            if host is not None:
                host["idx"].extend(ln["idx"])
                lines.pop(k)
                fold = True
                break

    def nearest(anchor: float, lo: float, hi: float):
        cands = [ln for ln in lines if lo <= ln["y"] <= hi]
        return min(cands, key=lambda ln: abs(ln["y"] - anchor)) if cands else None

    leftovers: list[tuple[float, list[int]]] = []
    extra: list[dict] = []

    for bi, idx in groups.items():
        top = min(chars[i].top for i in idx)
        bot = max(chars[i].bot for i in idx)
        ln = nearest((top + bot) / 2, top - 2.5, bot + 3.5)
        if ln:
            ln["idx"].extend(idx)
        else:
            leftovers.append((bars[bi].y + 2.6, idx))

    for i, c in enumerate(chars):
        if i in frac_of or c.size > 0.9 * body:
            continue
        ln = nearest(c.y, c.y - 8.0, c.y + 8.0)
        if ln:
            ln["idx"].append(i)
        else:
            leftovers.append((c.y, [i]))

    for y, idx in leftovers:
        slot = next((ln for ln in extra if abs(ln["y"] - y) <= 2.6), None)
        if slot:
            slot["idx"].extend(idx)
        else:
            extra.append({"y": y, "idx": list(idx)})
    lines.extend(extra)

    lines.sort(key=lambda ln: ln["y"])

    reg.lines = []
    for ln in lines:
        cs = [chars[i] for i in ln["idx"]]
        top = min(c.top for c in cs)
        bot = max(c.bot for c in cs)
        x0 = min(c.x0 for c in cs)
        x1 = max(c.x1 for c in cs)
        lb = [b for b in bars if top - 5 <= b.y <= bot + 5 and x0 - 4 <= b.xm <= x1 + 6]
        lr = [r for r in rads if top - 5 <= r.y0 <= bot + 5 and x0 - 4 <= r.xm <= x1 + 6]
        atoms = atomize(cs, lb, lr, base=ln["y"], body=body)
        reg.lines.append(Line(ln["y"], x0, x1, top, bot, atoms, join(atoms)))


# ---------------------------------------------------------------------------
# figures — cluster the leftover vector art into blocks
# ---------------------------------------------------------------------------
# A lowercase word of 3+ letters means sentence text, not a diagram label.
# Diagram labels are single letters, formulae (CH_{3}, NH_{2}, k\Omega) or
# capitalised names (Aniline) — none of which match.  LaTeX commands have to go
# first or \rho / \Delta / \Omega would read as prose.
_CMD_RE = re.compile(r"\\[A-Za-z]+")
_PROSE_RE = re.compile(r"\b[a-z]{3,}\b")


def is_prose(t: str) -> bool:
    return bool(_PROSE_RE.search(_CMD_RE.sub(" ", t)))


def build_figs(reg: Region) -> None:
    boxes = [[a.x0, a.y0, a.x1, a.y1] for a in reg.art]
    merged = True
    while merged:
        merged = False
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                a, b = boxes[i], boxes[j]
                # Tighter vertically than horizontally: four graph options
                # stacked down a column sit ~12pt apart, and merging them into
                # one block would lose the per-option clips.
                if (a[0] - 14 < b[2] and b[0] - 14 < a[2]
                        and a[1] - 8 < b[3] and b[1] - 8 < a[3]):
                    boxes[i] = [min(a[0], b[0]), min(a[1], b[1]),
                                max(a[2], b[2]), max(a[3], b[3])]
                    boxes.pop(j)
                    merged = True
                    break
            if merged:
                break

    boxes = [b for b in boxes
             if (b[2] - b[0]) >= 14 and (b[3] - b[1]) >= 12
             and (b[2] - b[0]) * (b[3] - b[1]) >= 380]

    # Absorb each diagram's own text labels, but never a question number,
    # option marker, answer line or run of prose — those bound the figure, they
    # aren't part of it.  A label goes to exactly one box, chosen by proximity:
    # overlapping first, then the box it sits *under* (axis labels), then the box
    # it sits above.  Without the single-owner rule a column of stacked graph
    # options steals its neighbour's axis label.
    cands = [ln for ln in reg.lines
             if not (NUM_RE.match(ln.text) or ANS_RE.match(ln.text)
                     or is_opener(ln) or is_prose(ln.text))]
    taken: set[int] = set()

    for _ in range(3):
        for phase in (0, 1, 2):
            for ln in cands:
                if id(ln) in taken:
                    continue
                best, bd = None, 1e9
                for b in boxes:
                    if phase == 2:
                        # A caption above the art must *start* over it: the
                        # generous slack used elsewhere would let a figure
                        # swallow the tail of its own question stem.  Captions
                        # may run off to the right (a substituent chain).
                        if not (b[0] - 6 <= ln.x0 <= b[2]):
                            continue
                    elif not (b[0] - 25 <= ln.x0 and ln.x1 <= b[2] + 25):
                        continue
                    if phase == 0:
                        if not (ln.top < b[3] and b[1] < ln.bot):
                            continue
                        d = 0.0
                    elif phase == 1:
                        d = ln.top - b[3]
                        if not 0.0 <= d <= 14.0:
                            continue
                    else:
                        d = b[1] - ln.bot
                        if not -6.0 <= d <= 12.0:
                            continue
                        d = abs(d)
                    if d < bd:
                        best, bd = b, d
                if best is not None:
                    best[0], best[1] = min(best[0], ln.x0), min(best[1], ln.top)
                    best[2], best[3] = max(best[2], ln.x1), max(best[3], ln.bot)
                    taken.add(id(ln))

    # 3pt of breathing room, halved where two stacked figures would otherwise
    # bleed into each other's clip.
    figs = [[b[0] - 3, b[1] - 3, b[2] + 3, b[3] + 3] for b in boxes]
    for i, a in enumerate(boxes):
        for j, b in enumerate(boxes):
            if i == j or not (a[0] < b[2] and b[0] < a[2]):
                continue
            if a[3] <= b[1]:
                mid = (a[3] + b[1]) / 2
                figs[i][3] = min(figs[i][3], mid)
                figs[j][1] = max(figs[j][1], mid)
    reg.figs = [fitz.Rect(*f) for f in figs]


# ---------------------------------------------------------------------------
# question segmentation
# ---------------------------------------------------------------------------
NUM_RE = re.compile(r"^(\d{1,3})\.\s*")
ANS_RE = re.compile(r"^Answer\s*\((\d)\)")
# A run of 8+ bare single characters is a table whose rows got flattened into
# one line (a logic-gate truth table).  Nothing else in the booklet looks like
# this, and no real option would.
TABLE_RE = re.compile(r"^(?:[A-Za-z0-9] ){7,}[A-Za-z0-9]$")

ROMAN = {"i": "I", "ii": "II", "iii": "III", "iv": "IV", "v": "V"}
ALPHA = {"a": "A", "b": "B", "c": "C", "d": "D", "e": "E"}


def markers(line: Line) -> list[tuple[str, float, float]]:
    """Every '(tok)' marker on the line as (tok, x of '(', x after ')')."""
    out = []
    a = line.atoms
    for k, at in enumerate(a):
        if at.text != "(":
            continue
        tok = ""
        j = k + 1
        while j < len(a) and len(a[j].text) == 1 and a[j].text.isalnum() and len(tok) < 4:
            tok += a[j].text
            j += 1
        if tok and j < len(a) and a[j].text == ")":
            out.append((tok, at.x0, a[j].x1))
    return out


def opener(line: Line):
    """(label, marker x0, x after ')') if the line starts with a '(n)' marker."""
    ms = markers(line)
    if not ms:
        return None
    tok, mx, ax = ms[0]
    lead = next((at for at in line.atoms if at.text.strip()), None)
    if lead is None or lead.x0 < mx - 0.1:
        return None
    if tok.isdigit() and 1 <= int(tok) <= 4:
        return int(tok), mx, ax
    return None


def is_opener(line: Line):
    o = opener(line)
    return o[0] if o else None


def mid_markers(line: Line, after_x: float) -> list[tuple[int, float, float]]:
    """(label, marker x0, x after the closing paren) for '(n)' markers on a line."""
    return [(int(t), mx, ax) for t, mx, ax in markers(line)
            if mx > after_x and t.isdigit() and 1 <= int(t) <= 4]


def span_text(lines: list[Line], lo: float, hi: float, start_x: float | None) -> str:
    parts = []
    for i, ln in enumerate(lines):
        picked = [a for a in ln.atoms if lo <= a.x0 < hi
                  and (i > 0 or start_x is None or a.x0 >= start_x)]
        t = join(picked)
        if t:
            parts.append(t)
    return polish(" ".join(parts))


def span_rect(lines: list[Line], lo: float, hi: float,
              start_x: float | None) -> list[float] | None:
    """Bounding box of exactly the atoms span_text() would pick up.

    Used to render an option as a picture when its layout can't survive being
    flattened to a single line of markup (truth tables) or when the markup is
    only half the answer (a ring structure plus a trailing '+ CH_{3}OH').
    """
    box = None
    for i, ln in enumerate(lines):
        picked = [a for a in ln.atoms if lo <= a.x0 < hi
                  and (i > 0 or start_x is None or a.x0 >= start_x)]
        if not picked:
            continue
        r = [min(a.x0 for a in picked), ln.top,
             max(a.x1 for a in picked), ln.bot]
        box = r if box is None else [min(box[0], r[0]), min(box[1], r[1]),
                                     max(box[2], r[2]), max(box[3], r[3])]
    return box


def parse_options(lines: list[Line]):
    """lines = the option block of one question (starts at the '(1)' line).

    Returns four dicts carrying the option text plus the rectangle it occupies,
    so a figure drawn beside the marker can be attached to the right option.
    """
    rows: list[tuple[int, list[tuple[int, float, float]]]] = []
    for li, ln in enumerate(lines):
        o = opener(ln)
        if o is None:
            continue
        marks = [o] + mid_markers(ln, o[1] + 12)
        rows.append((li, marks))
    if not rows:
        return None

    labels = [m[0] for _li, ms in rows for m in ms]
    if labels != [1, 2, 3, 4]:
        return None

    found: dict[int, dict] = {}
    for ri, (li, marks) in enumerate(rows):
        end = rows[ri + 1][0] if ri + 1 < len(rows) else len(lines)
        block = lines[li:end]
        y_lo = min(ln.top for ln in block)
        y_hi = max(ln.bot for ln in block)
        for mi, (lab, mx, ax) in enumerate(marks):
            lo = mx - 0.5
            hi = marks[mi + 1][1] - 0.5 if mi + 1 < len(marks) else 1e9
            found[lab] = {
                "label": str(lab),
                "text": span_text(block, lo, hi, ax + 0.1),
                "rect": span_rect(block, lo, hi, ax + 0.1),
                "x_lo": lo, "x_hi": hi,
                "y_lo": y_lo, "y_hi": y_hi,
                "mark_y": lines[li].y,
            }
    return [found[i] for i in (1, 2, 3, 4)]


def extract() -> list[dict]:
    doc = fitz.open(PDF)
    regions: list[Region] = []
    for pno in range(FIRST_PAGE, LAST_PAGE + 1):
        L, R = collect(doc, pno)
        for reg in (L, R):
            attach_hats(reg)
            classify_bars(reg)
            build_lines(reg)
            build_figs(reg)
            regions.append(reg)

    # flat reading-order stream of (region, line), figure labels removed
    stream: list[tuple[Region, Line]] = []
    for reg in regions:
        for ln in reg.lines:
            if any(f.x0 - 1 <= ln.x0 and ln.x1 <= f.x1 + 1
                   and f.y0 - 1 <= ln.top and ln.bot <= f.y1 + 1 for f in reg.figs):
                continue
            if ln.text:
                stream.append((reg, ln))

    # margin per region: outermost x of numbered / Answer lines
    margins: dict[int, float] = {}
    for reg in regions:
        xs = [ln.x0 for ln in reg.lines if NUM_RE.match(ln.text) or ANS_RE.match(ln.text)]
        margins[id(reg)] = min(xs) if xs else 0.0

    qs: list[dict] = []
    cur: dict | None = None
    expect = 1
    for reg, ln in stream:
        m = NUM_RE.match(ln.text)
        at_margin = ln.x0 <= margins[id(reg)] + 3.5
        if m and at_margin and int(m.group(1)) == expect:
            if cur:
                qs.append(cur)
            cur = {"no": expect, "lines": [], "answer": None, "regions": []}
            expect += 1
            rest = ln.text[m.end():]
            if rest.strip():
                trimmed = Line(ln.y, ln.x0, ln.x1, ln.top, ln.bot,
                               [a for a in ln.atoms if a.x0 > _num_end(ln)], rest)
                trimmed.text = join(trimmed.atoms)
                cur["lines"].append(trimmed)
            cur["regions"].append((reg, ln.top, ln.bot))
            continue
        if cur is None:
            continue
        a = ANS_RE.match(ln.text)
        if a and at_margin and cur["answer"] is None:
            cur["answer"] = a.group(1)
            continue
        if cur["answer"] is None:
            cur["lines"].append(ln)
            cur["regions"].append((reg, ln.top, ln.bot))
    if cur:
        qs.append(cur)
    return qs


def _num_end(ln: Line) -> float:
    """x1 of the '<n>.' prefix atoms of a numbered line."""
    for a in ln.atoms:
        if a.text == ".":
            return a.x1
    return ln.x0


# ---------------------------------------------------------------------------
# match-the-following reshaping
#
# The booklet lays a match question out as a real two-column table whose cells
# wrap, e.g.
#     (b) Temporary        (ii) An electron
#         hardness of           deficient hydride
#         water
# so the rows have to be cut vertically at the roman-marker column, not read
# line by line.  Output is the "List-I / A. x  I. y" shape that
# FormattedQuestionText turns back into an NTA-style table.
# ---------------------------------------------------------------------------
def build_match(lines: list[Line]) -> list[str] | None:
    # The "(a) (b) (c) (d)" strip above the answer options opens exactly like a
    # row, but it is decoration: counted as a fifth row it breaks the a,b,c,d
    # label check below and every match table in the booklet is rejected.
    strip = None
    rows = []
    for li, ln in enumerate(lines):
        ms = markers(ln)
        if not ms:
            continue
        if len(ms) >= 3 and all(t in ALPHA for t, _x, _a in ms):
            if strip is None:
                strip = li
            continue
        tok, mx, ax = ms[0]
        lead = next((at for at in ln.atoms if at.text.strip()), None)
        if lead is None or lead.x0 < mx - 0.1 or tok not in ALPHA:
            continue
        rom = next((m for m in ms[1:] if m[0] in ROMAN), None)
        rows.append({"li": li, "a": (tok, mx, ax), "r": rom})

    labels = [r["a"][0] for r in rows]
    if len(rows) < 3 or labels != sorted(ALPHA)[:len(rows)]:
        return None
    roms = [r["r"][1] for r in rows if r["r"]]
    if not roms:
        return None
    bnd = min(roms) - 2.0

    # Where the body stops.  Past the last row sit two different things: cells
    # that wrapped, and the "Select the correct option" tail.  A wrapped cell
    # keeps the indent of the cell it continues, so it starts right of the row
    # marker and in the same column; the tail returns to the marker indent, or
    # appears in the next column when the question spills over.
    mx = rows[-1]["a"][1]
    end = strip if strip is not None else len(lines)
    tail: list[str] = []
    for li in range(rows[-1]["li"] + 1, end):
        x0 = next((at.x0 for at in lines[li].atoms if at.text.strip()), mx)
        if x0 <= mx + 1.5 or (x0 < GUTTER) != (mx < GUTTER):
            tail = [ln.text for ln in lines[li:end]]
            end = li
            break

    intro, headers = [], []
    pre = lines[: rows[0]["li"]]
    for i, ln in enumerate(pre):
        left = span_text([ln], -1e9, bnd, None)
        right = span_text([ln], bnd, 1e9, None)
        if re.search(r"(Column|List)\s*-?\s*I", ln.text, re.I):
            headers = [t for t in (left, right) if t]
        elif (i == len(pre) - 1 and left and right
                and not left.rstrip().endswith((".", ",", ":", ";"))
                and not is_prose(left) and not is_prose(right)):
            # The column-header row need not be called "List-I"/"Column-I" —
            # 2020 Q62 heads its columns "Name" and "IUPAC Official Name", Q71
            # "Oxide" and "Nature".  What marks it out is geometry: the last line
            # before row (a) with content on both sides of the roman-numeral
            # boundary, no sentence punctuation, and no prose on either side —
            # a one-line intro also straddles the boundary but reads as a
            # sentence ("Match the following with respect to meiosis").
            headers = [left, right]
        else:
            intro.append(ln.text)

    # Markdown table — the site's match renderer turns this into a two-column
    # table and applies the math pipeline per cell.  Row labels keep the
    # booklet's own "(a)"/"(i)" casing so they read the same as the options.
    out = []
    if intro:
        out.append(polish(" ".join(intro)))
    out.append("| %s | %s |" % (headers[0] if headers else "List-I",
                                headers[1] if len(headers) > 1 else "List-II"))
    out.append("|---|---|")
    for ri, r in enumerate(rows):
        lo = r["li"]
        hi = rows[ri + 1]["li"] if ri + 1 < len(rows) else end
        block = lines[lo:hi]
        left = span_text(block, -1e9, bnd, r["a"][2] + 0.1)
        right = span_text(block, bnd, 1e9, (r["r"][2] + 0.1) if r["r"] else None)
        rl = r["r"][0] if r["r"] else list(ROMAN)[ri]
        out.append("| (%s) %s | (%s) %s |" % (r["a"][0], left, rl, right))
    if tail:
        # After the table, so FormattedQuestionText reads it as the footer rather
        # than the title.
        out.append(polish(" ".join(tail)))
    return out


def reshape_match_option(t: str) -> str:
    """'(iii)(iv)(i)(ii)' -> '(a) - (iii), (b) - (iv), (c) - (i), (d) - (ii)'."""
    toks = re.findall(r"\(([ivx]{1,4})\)", t)
    if len(toks) != 4 or any(v not in ROMAN for v in toks):
        return t
    if re.sub(r"\([ivx]{1,4}\)", "", t).strip():
        return t
    return ", ".join("(%s) - (%s)" % (k, v) for k, v in zip("abcd", toks))


# Clear white space between the ink of one stem line and the next.  Wrapped
# prose leaves at most ~11pt even around a stacked fraction, so a wider band
# means the booklet set a picture in between.
FIG_GAP = 18.0


def join_stem(lines: list[Line]) -> str:
    """Run a stem's lines together, breaking where a figure interrupted them.

    The site renders stem figures below the whole stem, so a sentence cannot be
    continued across one — break the line rather than gluing "The colour code of
    a resistance is given below" onto "The values of resistance and tolerance".
    """
    out: list[str] = []
    prev: Line | None = None
    for ln in lines:
        if prev is not None:
            out.append("\n" if ln.y > prev.y and ln.top - prev.bot > FIG_GAP else " ")
        out.append(ln.text)
        prev = ln
    return "".join(out)


# ---------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--debug", nargs="*", type=int)
    ap.add_argument("--no-images", action="store_true")
    args = ap.parse_args()

    if args.debug:
        doc = fitz.open(PDF)
        for pno in args.debug:
            L, R = collect(doc, pno)
            for reg in (L, R):
                attach_hats(reg)
                classify_bars(reg)
                build_lines(reg)
                build_figs(reg)
                print(f"\n===== page {pno} col {reg.col} (body={reg.body}) =====")
                for ln in reg.lines:
                    print("  y=%7.2f x=%6.1f | %s" % (ln.y, ln.x0, ln.text))
                for f in reg.figs:
                    print("   FIG (%.0f,%.0f)-(%.0f,%.0f)" % (f.x0, f.y0, f.x1, f.y1))
        return

    qs = extract()
    print(f"  questions found: {len(qs)}")
    missing = [n for n in range(1, 181) if n not in {q['no'] for q in qs}]
    if missing:
        print("  MISSING:", missing)

    os.makedirs(IMG_DIR, exist_ok=True)
    cdoc = None if args.no_images else clean_doc()

    out = []
    problems = []
    for q in qs:
        no = q["no"]
        snum = site_number(no)
        lines: list[Line] = q["lines"]
        opt_start = next((i for i, ln in enumerate(lines) if is_opener(ln) == 1), None)
        opts = parse_options(lines[opt_start:]) if opt_start is not None else None
        if opts is None:
            problems.append((no, "options"))
            stem_src = lines
            opts = [{"label": str(i + 1), "text": "", "x_lo": 0.0, "x_hi": 0.0,
                     "y_lo": 0.0, "y_hi": 0.0, "mark_y": -1.0} for i in range(4)]
        else:
            stem_src = lines[:opt_start]
        stem_lines = [ln.text for ln in stem_src]

        is_match = False
        if opt_start is not None:
            rows = build_match(lines[:opt_start])
            if rows:
                is_match = True
                stem_lines = rows
                for o in opts:
                    o["text"] = reshape_match_option(o["text"])

        if is_match:
            stem = "\n".join(stem_lines)
        else:
            stem = polish(join_stem(stem_src))

        # Which slice of each region does this question own?  Figures inside
        # that slice belong to it; ones straddling an option marker belong to
        # that option (graph/structure options).
        spans: dict[int, list] = {}
        for reg, top, bot in q["regions"]:
            s = spans.get(id(reg))
            if s is None:
                spans[id(reg)] = [reg, top, bot]
            else:
                s[1], s[2] = min(s[1], top), max(s[2], bot)

        images = []
        if cdoc is not None:
            # Which figure belongs to which option, and which to the stem?
            claims: list[list] = []
            for reg, top, bot in spans.values():
                for f in reg.figs:
                    owner = next(
                        (o for o in opts
                         if o["mark_y"] >= 0 and f.y0 - 2 <= o["mark_y"] <= f.y1 + 2
                         and o["x_lo"] <= (f.x0 + f.x1) / 2 < o["x_hi"]),
                        None,
                    )
                    # A figure the options don't claim has to sit inside the
                    # question's own vertical slice of the column.
                    ym = (f.y0 + f.y1) / 2
                    if owner is None and not (top - 8 <= ym <= bot + 8):
                        continue
                    claims.append([reg, fitz.Rect(f), owner])

            # An option that is half markup, half picture renders as neither:
            # the site shows an option's figure only when its text is empty.
            # Grow the clip over the markup and drop the text so the whole
            # answer arrives as one picture.
            for _reg, f, owner in claims:
                if owner is None or not owner["text"] or not owner["rect"]:
                    continue
                r = owner["rect"]
                f.x0, f.y0 = min(f.x0, r[0] - 2), min(f.y0, r[1] - 2)
                f.x1, f.y1 = max(f.x1, r[2] + 2), max(f.y1, r[3] + 2)
                owner["text"] = ""

            # A tabular option has no vector art at all, so there is no clip to
            # grow — render the block itself.  Flattened to one line its rows
            # are unreadable.
            claimed = {id(o) for _r, _f, o in claims if o is not None}
            for o in opts:
                if id(o) in claimed or not o["rect"] or not TABLE_RE.match(o["text"]):
                    continue
                reg = next((r for r, top, bot in spans.values()
                            if top - 8 <= o["mark_y"] <= bot + 8), None)
                if reg is None:
                    continue
                r = o["rect"]
                claims.append([reg, fitz.Rect(r[0] - 3, r[1] - 3, r[2] + 3, r[3] + 3), o])
                o["text"] = ""

            nfig = 0
            for reg, f, owner in claims:
                if owner is not None:
                    name = f"q{snum}_opt{owner['label']}.png"
                else:
                    nfig += 1
                    name = f"q{snum}_fig{nfig}.png"
                scrub(cdoc[reg.page].get_pixmap(clip=f, dpi=200)).save(
                    os.path.join(IMG_DIR, name))
                if owner is not None:
                    owner["figure"] = name
                else:
                    images.append(name)

        out.append({
            "section": section_of(no),
            "number": snum,
            "bookletNumber": no,
            "text": stem,
            "options": [
                {"label": o["label"], "text": o["text"]}
                | ({"figure": o["figure"]} if o.get("figure") else {})
                for o in opts
            ],
            "answers": [q["answer"]] if q["answer"] else [],
            "solution": "",
            "page": q["regions"][0][0].page + 1 if q["regions"] else None,
            "images": images,
        })

    out.sort(key=lambda q: q["number"])
    doc_json = {
        "key": "neet-2020",
        "title": "NEET (UG) 2020",
        "fullTitle": "NEET (UG) 2020 - National Eligibility cum Entrance Test",
        "examDate": "2020-09-13",
        "durationMinutes": 180,
        "questionCount": len(out),
        "questions": out,
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "questions.json"), "w", encoding="utf-8") as fh:
        json.dump(doc_json, fh, ensure_ascii=False, indent=2)

    nokey = [q["number"] for q in out if not q["answers"]]
    blank = [q["number"] for q in out if not q["text"].strip()]
    emptyopt = [q["number"] for q in out
                if any(not o["text"].strip() and not o.get("figure") for o in q["options"])]
    print(f"  wrote {os.path.join(OUT_DIR, 'questions.json')}")
    print(f"  images: {sum(len(q['images']) for q in out)}")
    print(f"  no answer key: {nokey}")
    print(f"  blank stems:   {blank}")
    print(f"  blank options: {emptyopt}")
    if problems:
        print(f"  option-parse failures: {problems}")


if __name__ == "__main__":
    main()
