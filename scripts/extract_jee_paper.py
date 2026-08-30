#!/usr/bin/env python3
"""
Extractor for JEE Main 2026 Question Papers.
Extracts questions, options, KaTeX math markup, and diagrams into JSON + images.
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

import fitz

GLYPH_MAP = {
    "\uf061": r"\alpha", "\uf062": r"\beta", "\uf067": r"\gamma", "\uf073": r"\sigma",
    "\uf06c": r"\lambda", "\uf06d": r"\mu", "\uf070": r"\pi", "\uf071": r"\theta",
    "\uf072": r"\rho", "\uf064": r"\delta", "\uf06b": r"\kappa", "\uf06e": r"\nu",
    "\uf074": r"\tau", "\uf077": r"\omega", "\uf065": r"\varepsilon", "\uf06a": r"\phi",
    "\uf06f": "o", "\uf068": r"\eta", "\uf069": r"\iota", "\uf078": r"\xi",
    "\uf079": r"\psi", "\uf07a": r"\zeta", "\uf066": r"\phi", "\uf044": r"\Delta",
    "\uf046": r"\Phi", "\uf047": r"\Gamma", "\uf051": r"\Theta", "\uf057": r"\Omega",
    "\uf053": r"\Sigma", "\uf058": r"\Xi", "\uf059": r"\Psi", "\uf050": r"\Pi",
    "\uf03b": ";", "\uf03d": "=", "\uf03c": "<", "\uf03e": ">",
    "\uf0b0": r"^\circ", "\uf083": r"\rightleftharpoons", "\uf0de": r"\rightarrow", "\uf0af": r"\downarrow",
    "\uf0d7": r"\times", "\uf0b4": r"\times", "\uf0b1": r"\pm", "\uf0b3": r"\ge",
    "\uf0b5": r"\propto", "\uf0bc": r"\approx", "\uf0a2": r"\infty", "\uf0c5": "+",
    "\uf032": "2",
    "\uf0eb": "(", "\uf0fb": ")", "\uf0ef": "(", "\uf0ff": ")",
    "\uf0e6": "(", "\uf0f6": ")", "\uf0e7": "(", "\uf0f7": ")",
    "\uf0e8": "(", "\uf0f8": ")", "\uf0e9": "[", "\uf0ea": "[",
    "\uf0f9": "]", "\uf0fa": "]",
    "\uf05b": "[", "\uf05d": "]",
    "\uf0ce": r"\varepsilon_0",
    "\uf0f2": r"\varepsilon_0",
    "\uf8e7": "",
    "\u2113": "l",
    "\u00ba": r"^\circ",
}

SCRIPT_RATIO = 0.78


def clean_char(c):
    if c in GLYPH_MAP:
        return GLYPH_MAP[c]
    if 0xE000 <= ord(c) <= 0xF8FF:
        return GLYPH_MAP.get(c, "")
    if c == "\ufffd":
        return ""
    if c == "\u2113":
        return "l"
    if c == "\u00ba":
        return r"^\circ"
    return c


class LChar:
    __slots__ = ("x0", "y0", "x1", "y1", "size", "font", "text", "oy")

    def __init__(self, x0, y0, x1, y1, size, font, text, oy):
        self.x0, self.y0, self.x1, self.y1 = x0, y0, x1, y1
        self.size, self.font, self.text, self.oy = size, font, text, oy


class VLine:
    __slots__ = ("chars", "baseline", "frac", "skip", "skip_prefix_x", "col", "page_no")

    def __init__(self, chars, baseline, page_no=0):
        self.chars = sorted(chars, key=lambda c: c.x0)
        self.baseline = baseline
        self.frac = None
        self.skip = False
        self.skip_prefix_x = None
        self.col = "L"
        self.page_no = page_no

    @property
    def y0(self):
        return min(c.y0 for c in self.chars) if self.chars else 0

    @property
    def y1(self):
        return max(c.y1 for c in self.chars) if self.chars else 0

    @property
    def x0(self):
        return min(c.x0 for c in self.chars) if self.chars else 0

    @property
    def x1(self):
        return max(c.x1 for c in self.chars) if self.chars else 0

    @property
    def visible_chars(self):
        return [c for c in self.chars if self.skip_prefix_x is None or c.x0 >= self.skip_prefix_x - 0.5]

    def plain(self):
        return "".join(clean_char(c.text) for c in self.visible_chars).strip()


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
                    out.append(LChar(b[0], b[1], b[2], b[3], size, font, t, ch["origin"][1]))
    return out


def build_lines(chars, page_no, split_x=300.0, tol=4.5, x_gap=25.0):
    cols = {"L": [], "R": []}
    for c in chars:
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
                lines.extend(_mk_lines(cur, col, page_no, x_gap))
                cur, cur_y = [c], c.oy
        if cur:
            lines.extend(_mk_lines(cur, col, page_no, x_gap))
    lines.sort(key=lambda l: (0 if l.col == "L" else 1, l.baseline))
    return lines


def _mk_lines(chars, col, page_no, x_gap):
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
        v = VLine(seg, baseline, page_no)
        v.col = col
        out.append(v)
    return out


def fraction_bars(page):
    bars = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.width < 5 or r.height > 2.2:
            continue
        if r.height > 0.01 and r.width / r.height < 1.5:
            continue
        bars.append(r)
    return bars


def detect_fractions(lines, page):
    bars = fraction_bars(page)
    for bar in bars:
        x0, x1 = bar.x0 - 3, bar.x1 + 3
        above = [l for l in lines if l.y1 <= bar.y0 + 1.0 and l.x1 > x0 and l.x0 < x1 and abs(l.y1 - bar.y0) <= 10.0]
        below = [l for l in lines if l.y0 >= bar.y1 - 1.0 and l.x1 > x0 and l.x0 < x1 and abs(l.y0 - bar.y1) <= 10.0]
        if not above or not below:
            continue
        num = max(above, key=lambda l: l.y1)
        den = min(below, key=lambda l: l.y0)
        ntext = re.sub(r"^\([1-4]\)\s*", "", num.plain()).strip()
        dtext = den.plain().strip()
        if not ntext or not dtext:
            continue
        if den.skip or num.frac is not None:
            continue
        # Check if this is an option fraction e.g. "(1)" sits next to or between num/den
        marker = None
        for l in lines:
            if re.match(r"^\([1-4]\)\s*$", l.plain()) and num.baseline <= l.baseline <= den.baseline:
                marker = l
                break
        if marker is not None:
            marker.frac = (ntext, dtext)
            num.skip = True
            den.skip = True
            continue
        den.skip = True
        num.frac = (ntext, dtext)


def line_markup(v):
    if v.frac:
        num_s, den_s = v.frac
        return r"\frac{%s}{%s}" % (num_s, den_s)
    sizes = Counter(round(c.size, 1) for c in v.chars)
    if not sizes:
        return ""
    main_size = sizes.most_common(1)[0][0]
    mains = [c for c in v.chars if abs(c.size - main_size) < 0.2]
    line_yc = sum(c.oy for c in mains) / max(1, len(mains)) if mains else v.baseline
    out, buf, last_script, last_x = [], [], "txt", None

    def flush():
        nonlocal buf, last_script
        if not buf:
            return
        content = "".join(buf)
        if last_script == "sup":
            out.append("^{%s}" % content)
        elif last_script == "sub":
            out.append("_{%s}" % content)
        else:
            out.append(content)
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
        if s == "txt" and last_x is not None and c.x0 - last_x > 2.0:
            buf.append(" ")
        buf.append(t)
        last_x = c.x1
    flush()
    return "".join(out)


def polish_text(t):
    if not t:
        return ""
    # Clean up double spaces
    t = re.sub(r"[ \t]+", " ", t)
    # Vectors: e.g. "ˆi", "ˆj", "ˆk" -> \hat{i}, \hat{j}, \hat{k}
    t = t.replace("ˆi", r"\hat{i}").replace("ˆj", r"\hat{j}").replace("ˆk", r"\hat{k}")
    t = t.replace("iˆ", r"\hat{i}").replace("jˆ", r"\hat{j}").replace("kˆ", r"\hat{k}")
    t = t.replace("ˆ i", r"\hat{i}").replace("ˆ j", r"\hat{j}").replace("ˆ k", r"\hat{k}")
    # Vector arrows: a  or v  -> \vec{a}, \vec{v}
    t = re.sub(r"([a-zA-Z])\s*", r"\\vec{\1}", t)
    t = re.sub(r"\\vec\{([a-zA-Z])\}\s*\\vec\{([a-zA-Z])\}", r"\\vec{\1} \\vec{\2}", t)
    # Replace stray empty blocks or mojibake
    t = t.replace("", "[").replace("", "]").replace("", "[").replace("", "]")
    t = t.replace("", "[").replace("", "]").replace("", "(").replace("", ")")
    t = t.replace("", "(").replace("", ")").replace("", "(").replace("", ")")
    t = t.replace("", "[").replace("", "]").replace("", "...").replace("", r"\cdot ")
    t = t.replace("", r"\le ").replace("", r"\ge ").replace("", r"\ne ")
    t = t.replace("", r"\in ").replace("", r"\cup ").replace("", r"\cap ")
    t = t.replace("", r"\infty").replace("", r"\sum").replace("", r"\int")
    t = t.replace("PW Web/App", "").replace("Library-", "")
    t = re.sub(r"https?://\S+", "", t)
    # Fix repeated powers like 10 -6 -> 10^{-6}
    t = re.sub(r"10\s*-\s*(\d+)", r"10^{-\1}", t)
    t = re.sub(r"10\s*\+\s*(\d+)", r"10^{+\1}", t)
    t = re.sub(r"10\^\{([0-9+\-]+)\}", r"10^{\1}", t)
    # Fix multiple spaces and strip
    t = re.sub(r"[ \t]+", " ", t).strip()
    return t


def extract_paper(pdf_path, out_dir, paper_key):
    os.makedirs(out_dir, exist_ok=True)
    img_dir = os.path.join(out_dir, "images")
    os.makedirs(img_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    print(f"Extracting {pdf_path}: {len(doc)} pages")

    all_vlines = []
    for pno in range(1, len(doc)):
        page = doc[pno]
        chars = collect_chars(page)
        lines = build_lines(chars, pno + 1)
        detect_fractions(lines, page)
        all_vlines.extend([l for l in lines if not l.skip])

    # Now parse questions
    # A question starts with a number "1." ... "75." at the start of a line
    # or section headers
    q_map = defaultdict(lambda: {"lines": [], "options": {}})
    current_q = None
    current_opt = None

    for line in all_vlines:
        txt = line.plain()
        if not txt:
            continue
        # Skip running header/footer
        if "JEE MAIN 2026" in txt or "SESSION-01" in txt or "SECTION-" in txt or "Single Correct" in txt or "Integer Type" in txt:
            continue
        if re.match(r"^\[\d+\]$", txt):  # e.g. [7], [8] page numbers
            continue

        # Check for Question number start
        m_q = re.match(r"^(\d{1,2})\.\s*(.*)$", txt)
        if m_q and 1 <= int(m_q.group(1)) <= 75:
            q_num = int(m_q.group(1))
            current_q = q_num
            current_opt = None
            rest = m_q.group(2).strip()
            if rest:
                line_markup_str = line_markup(line)
                # strip the question number prefix from markup
                line_markup_str = re.sub(r"^\d{1,2}\.\s*", "", line_markup_str)
                q_map[current_q]["lines"].append(line_markup_str)
            continue

        # Check for Option start (1), (2), (3), (4)
        m_opt = re.match(r"^\(([1-4])\)\s*(.*)$", txt)
        if m_opt and current_q is not None and current_q <= 70:  # Integer type Qs don't have options
            opt_num = m_opt.group(1)
            current_opt = opt_num
            rest = m_opt.group(2).strip()
            line_markup_str = line_markup(line)
            line_markup_str = re.sub(r"^\([1-4]\)\s*", "", line_markup_str)
            q_map[current_q]["options"][current_opt] = [line_markup_str] if line_markup_str else []
            continue

        if current_q is not None:
            markup_str = line_markup(line)
            if current_opt is not None and current_q <= 70:
                q_map[current_q]["options"][current_opt].append(markup_str)
            else:
                q_map[current_q]["lines"].append(markup_str)

    print(f"Parsed {len(q_map)} questions.")
    return q_map


if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv) > 1 else "jee/21 jan 2026 morning.pdf"
    key = sys.argv[2] if len(sys.argv) > 2 else "21-jan-morning"
    out = os.path.join("jee-out", key)
    res = extract_paper(pdf, out, key)
    for qn in sorted(res.keys())[:10]:
        stem = polish_text(" ".join(res[qn]["lines"]))
        opts = {k: polish_text(" ".join(v)) for k, v in res[qn]["options"].items()}
        print(f"\nQ{qn}: {stem[:120]}...")
        for ok, ov in opts.items():
            print(f"  ({ok}) {ov}")
