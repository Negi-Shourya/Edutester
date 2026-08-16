#!/usr/bin/env python3
"""Extract NEET 2022 (scanned collegedunia solved paper) into JSON + images.

Reads RapidOCR detections (neet-out/2022/ocr/page_*.json), rebuilds the 200
questions (stem / options / inline answer), detects page-spanning questions,
crops figure regions (text-free gaps with ink) and image-only options, and
writes neet-out/2022/questions_raw.json.

Run:  python scripts/extract_neet_2022.py
"""
import json
import os
import re
import sys
from collections import Counter

import cv2
import fitz
import numpy as np

PDF_PATH = os.path.join("neet", "neet 2022.pdf")
OCR_DIR = os.path.join("neet-out", "2022", "ocr")
OUT_DIR = os.path.join("neet-out", "2022")
IMG_DIR = os.path.join(OUT_DIR, "images")
RENDER_SCALE = 3.0   # crop scale
OCR_SCALE = 2.0      # OCR coordinate scale
LEFT_X = 700         # option grid column split

PAGE_H = 2490        # OCR-space page height (2x of 1245pt)
PAGE_W = 1986

FOOTER_Y = 2280      # anything below this on a page is footer junk
FOOTER_TEXTS = ("collegedunia", "india's largest student review platform")


def section_for_qnum(n):
    if 1 <= n <= 50:
        return "PHYSICS"
    if 51 <= n <= 100:
        return "CHEMISTRY"
    if 101 <= n <= 150:
        return "BOTANY"
    return "ZOOLOGY"


# ----------------------------------------------------------------------
def clean_text(t):
    if not t:
        return ""
    t = t.strip()
    t = re.sub(r"List-ll", "List-II", t)
    t = re.sub(r"List-l\b", "List-I", t)
    t = re.sub(r"Statement Il", "Statement II", t)
    t = re.sub(r"Statement ll", "Statement II", t)
    t = re.sub(r"元", "π", t)
    t = re.sub(r"\bChoosethe", "Choose the", t)
    t = re.sub(r"correctanswerfromtheoptionsgivenbelow",
               "correct answer from the options given below", t)
    t = re.sub(r"India's\s*largest\s*Student\s*Review\s*Platform", "", t, flags=re.I)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def is_junk(t):
    t = t.strip()
    if not t:
        return True
    if re.fullmatch(r"-\s*\d+\s*-", t):
        return True
    if re.fullmatch(r"\d{1,3}", t):
        return True
    low = t.lower()
    if any(f in low for f in FOOTER_TEXTS):
        return True
    return False


def load_pages():
    pages = {}
    for fn in sorted(os.listdir(OCR_DIR)):
        m = re.match(r"page_(\d+)\.json$", fn)
        if not m:
            continue
        with open(os.path.join(OCR_DIR, fn), encoding="utf-8") as f:
            pages[int(m.group(1))] = json.load(f)
    return pages


class Q:
    def __init__(self, number, page, y0):
        self.number = number
        self.page = page
        self.y0 = y0
        self.stem = []
        self.match_rows = []
        self.match_mode = False
        self.is_match = False
        self.match_dets = []
        self.options = {}
        self.answer = None
        self.answer_det = None
        self.end = None  # (page, y) of next question marker or page end
        self.content = []  # (pno, det) detections attributed to this question
        self.figures = []
        self.opt_images = []

    @property
    def section(self):
        return section_for_qnum(self.number)


def parse_questions(pages):
    """Stream across all pages (questions may span page boundaries)."""
    # flat ordered detections
    flat = []
    for pno in sorted(pages):
        for d in sorted(pages[pno], key=lambda x: (round(x["y0"] / 8), x["x0"])):
            flat.append((pno, d))

    # question markers
    mk = []
    for pno, d in flat:
        m = re.match(r"^(\d{1,3})\.", d["text"])
        if not m:
            continue
        n = int(m.group(1))
        if 1 <= n <= 200 and d["x0"] < 370:
            mk.append((pno, d, n))

    # Inject Q1 (marker missing in OCR on page 1)
    mk.append((1, {"y0": 315, "x0": 280, "text": "1."}, 1))
    mk.sort(key=lambda t: (t[0], t[1]["y0"], t[1]["x0"]))

    questions = []
    cur = None
    for pno, d in flat:
        newq = None
        while mk and (mk[0][0], mk[0][1]["y0"]) <= (pno, d["y0"]):
            mpno, mdet, mn = mk.pop(0)
            if cur is None or mn > cur.number:
                newq = mn
                newpno, newdet = mpno, mdet
        if newq is not None:
            if cur is not None:
                cur.end = (newpno, newdet["y0"])
                questions.append(cur)
            cur = Q(newq, newpno, newdet["y0"])
            cur.content.append((newpno, newdet))
            rest = re.sub(r"^(\d{1,3})\.\s*", "", newdet["text"]).strip()
            if rest:
                cur.stem.append(rest)
            # If the detection that triggered the boundary is not itself the
            # marker (injected marker case), feed it to the new question.
            if not (newpno == pno and abs(newdet["y0"] - d["y0"]) < 5):
                cur.content.append((pno, d))
                feed_question(cur, pno, d)
            continue
        if cur is not None:
            cur.content.append((pno, d))
            feed_question(cur, pno, d)

    if cur is not None:
        cur.end = (max(pages), PAGE_H)
        questions.append(cur)

    by_num = {}
    for q in questions:
        if q.number not in by_num:
            by_num[q.number] = q
    return [by_num[n] for n in sorted(by_num)]


def assemble_match(q):
    """Build List-I | List-II table rows from collected match detections.

    Rows are clustered by y; within a row, the left column (x < LEFT_X)
    holds the List-I entry and the right column holds the List-II entry.
    """
    if not q.match_dets:
        return
    dets = sorted(q.match_dets, key=lambda pd: (round(pd[1]["y0"] / 8), pd[1]["x0"]))
    rows = []
    for pno, d in dets:
        t = d["text"].strip()
        if not t or is_junk(t):
            continue
        if re.match(r"^Choose\s*the\s*correct", t, re.I):
            continue
        tl = re.sub(r"^List-l\b", "List-I", t, flags=re.I)
        tl = re.sub(r"^List-ll\b", "List-II", tl, flags=re.I)
        if re.match(r"^List-I\b", tl, re.I) or re.match(r"^List-II\b", tl, re.I):
            continue
        if re.match(r"^\([A-Z][a-z]+(?:\s+[A-Za-z]+)*\)$", t):
            # column header like (Electromagnetic waves) / (Wavelength)
            continue
        y = d["y0"]
        if rows and y - rows[-1]["y"] < 30:
            row = rows[-1]
        else:
            row = {"y": y, "L": [], "R": []}
            rows.append(row)
        col = "R" if d["x0"] >= LEFT_X else "L"
        mm = re.match(r"^\(([a-e])\)\s*(.*)$", t)
        rm = re.match(r"^\(([ivx]+)\)\s*(.*)$", t, re.I)
        if mm:
            row[col].append(("letter", mm.group(1), mm.group(2)))
        elif rm:
            row[col].append(("roman", rm.group(1), rm.group(2)))
        elif re.match(r"^\(\)\s*(.*)$", t):
            row[col].append(("roman", "", t[2:].strip()))
        else:
            row[col].append(("text", "", t))
    # infer missing roman numerals by row order
    romans = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]
    ridx = 0
    for row in rows:
        if not any(k == "roman" for k, _, _ in row["R"]):
            roman = romans[ridx] if ridx < len(romans) else ""
            row["R"].append(("roman", roman, ""))
        ridx += 1
    out = []
    for row in rows:
        letter = ""
        lparts = []
        rroman = ""
        rparts = []
        for kind, key, txt in row["L"]:
            if kind == "letter":
                letter = key
                if txt:
                    lparts.append(txt)
            elif kind == "text" and txt:
                lparts.append(txt)
        for kind, key, txt in row["R"]:
            if kind == "roman":
                rroman = key
                if txt:
                    rparts.append(txt)
            elif kind == "text" and txt:
                rparts.append(txt)
        ltxt = " ".join(lparts).strip()
        if letter:
            ltxt = f"{letter}. {ltxt}".strip()
        rtxt = " ".join(rparts).strip()
        if rroman:
            rtxt = f"{rroman}. {rtxt}".strip()
        if ltxt or rtxt:
            out.append(f"{ltxt}  |  {rtxt}")
    if out:
        q.match_rows = out


def feed_question(q, pno, d):
    t = d["text"].strip()
    if is_junk(t):
        return
    # section/subject headers
    if re.match(r"^(SECTION|PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY)\b", t, re.I):
        return
    # footer text anywhere
    if d["y0"] > FOOTER_Y and ("collegedunia" in t.lower() or
                               "student review" in t.lower() or
                               "largest" in t.lower()):
        return
    am = re.match(r"^Answer\s*\((\d)\*?\)\s*$", t)
    if am:
        q.answer = int(am.group(1))
        q.answer_det = d
        return
    nam = re.match(r"^Answer\s*\((NA|N\.?A\.?)\)\s*(.*)$", t, re.I)
    if nam:
        q.answer = None  # withheld -> empty key
        q.answer_det = d
        return
    om = re.match(r"^\(([1-4])\)\s*(.*)$", t)
    if om:
        q.match_mode = False  # options begin; match table is over
        n = int(om.group(1))
        col = "L" if d["x0"] < LEFT_X else "R"
        o = q.options.setdefault(n, {"text": "", "marker": d, "col": col})
        o["marker"] = d
        o["col"] = col
        if om.group(2):
            o["text"] += " " + om.group(2).strip()
        return
    # match-list content: collect raw detections, assemble later
    if re.search(r"Match\s+List", t, re.I):
        q.match_mode = True
        q.is_match = True
        q.match_dets = []
        q.stem.append(t)
        return
    if q.match_mode:
        if re.match(r"^Choose\s+the\s+correct", t, re.I):
            return
        if re.match(r"^\([1-4]\)", t):
            return
        q.match_dets.append((pno, d))
        return
    # figure labels "(a)"/"(b)" inside a figure region -> skip
    if re.fullmatch(r"\([a-e]\)", t):
        return
    if re.fullmatch(r"\([ivx]+\)", t):
        return
    if q.options:
        col = "L" if d["x0"] < LEFT_X else "R"
        best = None
        for n, o in q.options.items():
            if o["col"] != col:
                continue
            if d["y0"] < o["marker"]["y0"] - 10:
                continue
            if best is None or o["marker"]["y0"] > best[1]:
                best = (n, o["marker"]["y0"])
        if best:
            q.options[best[0]]["text"] += " " + t
            return
    q.stem.append(t)


# ----------------------------------------------------------------------
# Cropping
# ----------------------------------------------------------------------
def crop_region(doc, pno, rect_pts, out_fn, scale=RENDER_SCALE):
    """Crop an OCR-coordinate rect and render at `scale` px/pt."""
    f = OCR_SCALE
    r = fitz.Rect(rect_pts[0] / f, rect_pts[1] / f,
                  rect_pts[2] / f, rect_pts[3] / f)
    r &= doc[pno - 1].rect
    if r.is_empty or r.width < 8 or r.height < 8:
        return None
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale), clip=r)
    pm.save(out_fn)
    return out_fn


def page_gray(doc, pno, scale):
    """Render a page to a grayscale numpy array in OCR-scale coordinates."""
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY)
    return np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)


def ink_in(gray, scale, x0, y0, x1, y1):
    s = scale / OCR_SCALE
    g = gray[int(y0 * s):int(y1 * s), int(x0 * s):int(x1 * s)]
    if g.size == 0:
        return 0.0
    return float((g < 200).mean())


def find_figures(q, pages, doc, gray_cache):
    """Detect figure bands inside the question via text-free gaps with ink.

    Text lines are taken as bands [y0, y1]; gaps are the empty space between
    the bottom of one band and the top of the next. Gaps are capped just
    before the first option marker (markers are excluded from the text list,
    so an uncapped gap would swallow them and read their ink as a 'figure').
    """
    dets = [d for (p, d) in q.content if p == q.page]
    if not dets:
        return
    bands = []
    for d in dets:
        t = d["text"].strip()
        if not t or d["y0"] >= FOOTER_Y:
            continue
        if re.match(r"^\([1-4]\)", t):
            continue
        if re.match(r"^Answer\b", t):
            continue
        if is_junk(t):
            continue
        bands.append((round(d["y0"]), round(d.get("y1", d["y0"] + 30))))
    if not bands:
        return
    bands.sort()
    opt_markers = sorted(o["marker"]["y0"] for o in q.options.values())
    first_opt = opt_markers[0] if opt_markers else 1e9
    # merge overlapping bands
    merged = []
    for y0, y1 in bands:
        if merged and y0 <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], y1))
        else:
            merged.append((y0, y1))
    cap = min(first_opt - 15, q.end[1] if q.end else PAGE_H)
    for i in range(len(merged) - 1):
        g0 = merged[i][1]
        g1 = min(merged[i + 1][0], cap)
        if g1 - g0 < 45 or g0 < q.y0 + 25 or g0 >= cap - 10:
            continue
        ink = ink_in(gray_cache[q.page], RENDER_SCALE, 300, g0, 1790, g1)
        if ink >= 0.0015:
            q.figures.append((g0, g1))


def highres_ocr_cell(doc, pno, rect_pts, ocr_engine, scale=8.0):
    """OCR a crop of an option cell; returns (text, crop_path|None)."""
    f = OCR_SCALE
    r = fitz.Rect(rect_pts[0] / f, rect_pts[1] / f,
                  rect_pts[2] / f, rect_pts[3] / f)
    r &= doc[pno - 1].rect
    if r.is_empty or r.width < 10 or r.height < 10:
        return "", None
    pm = doc[pno - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                 colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
    tmp = os.path.join(OUT_DIR, "_hi.png")
    cv2.imwrite(tmp, bw)
    res, _ = ocr_engine(tmp)
    texts = []
    for line in (res or []):
        t = line[1].strip()
        if t:
            texts.append(t)
    return " ".join(texts), None


def recover_markers(q, doc, ocr_engine):
    """Find option markers '(1)'..'(4)' in the question's option region via
    high-res OCR, and register any missing ones on q.options."""
    have = set(q.options.keys())
    if len(have) == 4:
        return
    dets = [d for (p, d) in q.content if p == q.page and d.get("y1")]
    if not dets:
        return
    y_top = min(d["y0"] for d in dets if not re.match(r"^\([1-4]\)", d["text"].strip()))
    y_bot = (q.answer_det["y0"] if q.answer_det
             else min(q.end[1] if q.end else PAGE_H, FOOTER_Y))
    if y_bot - y_top < 60:
        return
    r = fitz.Rect(280 / OCR_SCALE, y_top / OCR_SCALE,
                  1790 / OCR_SCALE, y_bot / OCR_SCALE)
    r &= doc[q.page - 1].rect
    if r.is_empty:
        return
    scale = 4.0
    pm = doc[q.page - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                    colorspace=fitz.csGRAY, clip=r)
    g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
    _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
    tmp = os.path.join(OUT_DIR, "_mk.png")
    cv2.imwrite(tmp, bw)
    res, _ = ocr_engine(tmp)
    for line in (res or []):
        m = re.match(r"^\(([1-4])\)\s*$", line[1].strip())
        if not m:
            continue
        n = int(m.group(1))
        if n in have:
            continue
        box = line[0]
        x = 280 + (box[0][0] + box[2][0]) / 2 / scale * OCR_SCALE
        y = y_top + (box[0][1] + box[2][1]) / 2 / scale * OCR_SCALE
        col = "L" if x < LEFT_X else "R"
        q.options[n] = {"text": "", "marker": {"x0": x, "y0": y, "x1": x + 40, "y1": y + 30}, "col": col}
        have.add(n)


def option_cell_rects(q):
    """Return the 4 option cell rects (OCR coords) as {n: (x0,y0,x1,y1)}.

    Layout: options (1)(2) on the top row (L/R), (3)(4) on the bottom row for
    two-column questions; single-column questions stack all four in the left
    column. Row y-ranges are anchored on the marker positions: a cell spans
    from just above its marker down to the midpoint before the next row (or
    the answer line), so the marker line is always inside the cell. Missing
    markers are inferred at the grid intersection of their row/column.
    """
    cells = {}
    marks = [(n, o["marker"]) for n, o in sorted(q.options.items())
             if o.get("marker")]
    if not marks:
        return cells
    has_right = any(o["col"] == "R" for n, o in q.options.items())
    # rows: cluster marker y's (row = same y band). 2x2 grids have same-row
    # markers within a few px; single-column options stack ~42-55px apart, so
    # a 30px threshold separates them without merging the grid rows.
    row_ys = []
    for n, m in sorted(marks):
        y = m["y0"]
        for r in row_ys:
            if abs(r["center"] - y) < 30:
                r["ys"].append(y)
                r["center"] = sum(r["ys"]) / len(r["ys"])
                break
        else:
            row_ys.append({"ys": [y], "center": y})
    row_ys.sort(key=lambda r: r["center"])
    # map option -> (row_index, col)
    slots = {}
    for n, m in marks:
        ri = min(range(len(row_ys)), key=lambda i: abs(row_ys[i]["center"] - m["y0"]))
        col = "L" if m["x0"] < LEFT_X else "R"
        slots[n] = (ri, col)
    # infer missing option slots from the grid
    for n in range(1, 5):
        if n in slots:
            continue
        if has_right:
            ri = 0 if n <= 2 else (1 if len(row_ys) > 1 else 0)
            col = "L" if n % 2 == 1 else "R"
        else:
            ri = min(n - 1, len(row_ys) - 1) if row_ys else 0
            col = "L"
        if has_right and len(row_ys) > 1 and ri >= len(row_ys):
            continue
        slots[n] = (ri, col)
        same_row = [m for k, m in marks if slots.get(k) and slots[k][0] == ri]
        same_col = [m for k, m in marks if slots.get(k) and slots[k][1] == col]
        x = same_col[0]["x0"] if same_col else (700 if col == "R" else 360)
        y = same_row[0]["y0"] if same_row else (row_ys[ri]["center"] if ri < len(row_ys) else 0)
        if n not in q.options:
            q.options[n] = {"text": "", "marker": {"x0": x, "y0": y, "x1": x + 40, "y1": y + 30}, "col": col}
        else:
            q.options[n]["marker"] = {"x0": x, "y0": y, "x1": x + 40, "y1": y + 30}
            q.options[n]["col"] = col
    # row y-bounds: start above the marker, end at midpoint to next row
    y_bot = q.answer_det["y0"] if q.answer_det else (q.end[1] if q.end else PAGE_H)
    bounds = []
    for i, r in enumerate(row_ys):
        y0 = r["center"] - 22
        y1 = (row_ys[i + 1]["center"] - 10) if i + 1 < len(row_ys) else (y_bot - 8)
        if y1 - y0 < 30:
            y1 = y0 + 30
        bounds.append((y0, y1))
    for n in range(1, 5):
        if n not in slots:
            continue
        ri, col = slots[n]
        y0, y1 = bounds[ri]
        if has_right:
            x0, x1 = (280, LEFT_X - 5) if col == "L" else (LEFT_X, 1790)
        else:
            x0, x1 = 280, 1790
        cells[n] = (x0, y0, x1, y1)
    return cells


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    pages = load_pages()
    doc = fitz.open(PDF_PATH)
    os.makedirs(IMG_DIR, exist_ok=True)
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()

    questions = parse_questions(pages)

    # option text bands
    for q in questions:
        has_right = any(o.get("col") == "R" for o in q.options.values())
        for n in range(1, 5):
            o = q.options.get(n)
            if not o or o.get("text"):
                continue
            my = o["marker"]["y0"]
            col = o["col"]
            end_y = q.answer_det["y0"] if q.answer_det else (q.end[1] if q.end else PAGE_H)
            if has_right:
                same = [oo["marker"]["y0"] for nn, oo in q.options.items()
                        if nn != n and oo["col"] == col and oo["marker"]["y0"] > my + 8]
                if same:
                    end_y = min(end_y, min(same))
            else:
                others = [oo["marker"]["y0"] for nn, oo in q.options.items()
                          if nn != n and oo["marker"]["y0"] > my + 8]
                if others:
                    end_y = min(end_y, min(others))
            for (p, d) in q.content:
                if d is o["marker"]:
                    continue
                if p != q.page or d["y0"] < my - 12 or d["y0"] >= end_y - 5:
                    continue
                if re.match(r"^\([1-4]\)", d["text"]):
                    continue
                if re.match(r"^Answer\b", d["text"]):
                    continue
                if is_junk(d["text"]):
                    continue
                if d["y0"] > FOOTER_Y:
                    continue
                if has_right and ("L" if d["x0"] < LEFT_X else "R") != col:
                    continue
                o["text"] += " " + d["text"].strip()
            o["text"] = o["text"].strip()

    # figures
    gray_cache = {pno: page_gray(doc, pno, RENDER_SCALE) for pno in sorted(pages)}
    for q in questions:
        find_figures(q, pages, doc, gray_cache)
        for idx, (g0, g1) in enumerate(q.figures):
            fname = f"Q{q.number}_fig{idx + 1}.png"
            if crop_region(doc, q.page, (300, g0 - 5, 1790, g1 + 5),
                           os.path.join(IMG_DIR, fname)):
                q.figures[idx] = fname
            else:
                q.figures[idx] = None

    # option cells: recover missing markers
    for q in questions:
        recover_markers(q, doc, ocr_engine)

    # Verified ground truth: option text the scan is too faint to OCR
    # (cross-checked against the Aakash Code-S1 clean paper + math).
    FIXED_TEXT = {
        2: ["1", "2", "3", "4"],
        3: ["2π", "4π", "12π", "104π"],
        7: ["Increases for both conductors and semiconductors",
            "Decreases for both conductors and semiconductors",
            "Increases for conductors but decreases for semiconductors",
            "Decreases for conductors but increases for semiconductors"],
        8: ["A", "B", "C", "D"],
        13: ["10/3 m", "20/3 m", "10 m", "5 m"],
        17: ["2ν", "3ν", "(2/3)ν", "(3/2)ν"],
        24: ["6", "8", "9", "12"],
        37: ["11", "9", "10", "8"],
        65: ["zero order (y = concentration and x = time), first order (y = t½ and x = concentration)",
             "zero order (y = concentration and x = time), first order (y = rate constant and x = concentration)",
             "zero order (y = rate and x = concentration), first order (y = t½ and x = concentration)",
             "zero order (y = rate and x = concentration), first order (y = rate and x = t½)"],
        66: ["SN1 reaction yields 1 : 1 mixture of both enantiomers",
             "The product obtained by SN2 reaction of haloalkane having chirality at the reactive site shows inversion of configuration",
             "Enantiomers are superimposable mirror images on each other",
             "A racemic mixture shows zero optical rotation"],
        71: ["Alkali metals react with water to form their hydroxides.",
             "The oxidation number of K in KO2 is +4.",
             "Ionisation enthalpy of alkali metals decreases from top to bottom in the group.",
             "Lithium is the strongest reducing agent among the alkali metals."],
        120: ["speed up the malting process",
              "promote root growth and roothair formation to increase the absorption surface",
              "help overcome apical dominance",
              "kill dicotyledonous weeds in the fields"],
        124: ["(b), (d), (e) Only", "(a), (c), (d) Only", "(b), (e) Only", "(a), (c), (e) Only"],
        130: ["The process of extraction of separated DNA strands from gel is called elution.",
              "The separated DNA fragments are stained by using ethidium bromide.",
              "The presence of chromogenic substrate gives blue coloured DNA bands on the gel.",
              "Bright orange coloured bands of DNA can be observed in the gel when exposed to UV light."],
        148: ["Both (A) and (R) are correct and (R) is the correct explanation of (A)",
              "Both (A) and (R) are correct but (R) is not the correct explanation of (A)",
              "(A) is correct but (R) is not correct",
              "(A) is not correct but (R) is correct"],
        166: ["Arthritis – Inflammed joints",
              "Tetany – High Ca2+ level causing rapid spasms.",
              "Myasthenia gravis – Genetic disorder resulting in weakening and paralysis of skeletal muscle",
              "Muscular dystrophy – An auto immune disorder causing progressive degeneration of skeletal muscle"],
        176: ["0.1", "10", "1.0", "zero"],
        187: ["Primary response is produced when our body encounters a pathogen for the first time.",
              "Anamnestic response is elicited on subsequent encounters with the same pathogen.",
              "Anamnestic response is due to memory of first encounter.",
              "Acquired immunity is non-specific type of defense present at the time of birth."],
        195: ["Analogous structures are a result of convergent evolution",
              "Sweet potato and potato is an example of analogy",
              "Homology indicates common ancestry",
              "Flippers of penguins and dolphins are a pair of homologous organs"],
        196: ["The membranes of presynaptic and postsynaptic neurons are in close proximity in an electrical synapse.",
              "Electrical current can flow directly from one neuron into the other across the electrical synapse.",
              "Chemical synapses use neurotransmitters",
              "Impulse transmission across a chemical synapse is always faster than that across an electrical synapse."],
    }
    # Questions whose options are genuine images (graphs / structures /
    # formulas) — crop all four cells.
    FIXED_IMAGE_Q = {6, 30, 51, 53, 69, 94, 100}

    for q in questions:
        if q.number in FIXED_TEXT:
            for n, t in enumerate(FIXED_TEXT[q.number], 1):
                o = q.options.setdefault(n, {"text": "", "col": "L"})
                o["text"] = t

    for q in questions:
        if q.number not in FIXED_IMAGE_Q:
            continue
        cells = option_cell_rects(q)
        for n in range(1, 5):
            o = q.options.get(n)
            rect = cells.get(n)
            if not o or not rect:
                continue
            o["text"] = ""
            fname = f"Q{q.number}_opt{n}.png"
            if crop_region(doc, q.page, rect, os.path.join(IMG_DIR, fname)):
                o["image"] = fname
                q.opt_images.append(fname)

    # High-res band OCR for remaining empty text cells (faint print the
    # normal pass missed): OCR the whole cell band (marker line down to the
    # next marker / answer line) and use whatever text comes back.
    for q in questions:
        if q.number in FIXED_IMAGE_Q or q.number in FIXED_TEXT:
            continue
        cells = option_cell_rects(q)
        has_right = any(o.get("col") == "R" for o in q.options.values())
        for n in range(1, 5):
            o = q.options.get(n)
            if not o or o.get("text") or n not in cells:
                continue
            x0, y0, x1, y1 = cells[n]
            band = (max(x0 - 6, 280), max(y0 - 6, 100),
                    min(x1 + 6, 1790), min(y1 + 4, PAGE_H))
            r = fitz.Rect(band[0] / OCR_SCALE, band[1] / OCR_SCALE,
                          band[2] / OCR_SCALE, band[3] / OCR_SCALE)
            r &= doc[q.page - 1].rect
            if r.is_empty or r.width < 12 or r.height < 10:
                continue
            scale = 8.0
            pm = doc[q.page - 1].get_pixmap(matrix=fitz.Matrix(scale, scale),
                                            colorspace=fitz.csGRAY, clip=r)
            g = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width)
            _, bw = cv2.threshold(g, 200, 255, cv2.THRESH_BINARY)
            tmp = os.path.join(OUT_DIR, "_band.png")
            cv2.imwrite(tmp, bw)
            res, _ = ocr_engine(tmp)
            parts = []
            for line in (res or []):
                t = re.sub(r"^\(?[1-4]\)?[)）]?\s*", "", line[1].strip()).strip()
                if t and not is_junk(t):
                    parts.append(t)
            if parts:
                o["text"] = " ".join(parts)

    # image crops for any remaining empty cells (safety net)
    for q in questions:
        if q.number in FIXED_IMAGE_Q:
            continue
        cells = option_cell_rects(q)
        for n in range(1, 5):
            o = q.options.get(n)
            if not o or o.get("text") or n not in cells:
                continue
            fname = f"Q{q.number}_opt{n}.png"
            if crop_region(doc, q.page, cells[n], os.path.join(IMG_DIR, fname)):
                o["image"] = fname
                q.opt_images.append(fname)

    # assemble
    out = []
    for q in questions:
        opts = []
        for n in range(1, 5):
            o = q.options.get(n)
            opts.append({
                "label": str(n),
                "text": clean_text(o["text"]) if o else "",
                "image": o.get("image") if o else None,
            })
        d = {
            "section": q.section,
            "number": q.number,
            "text": " ".join(q.stem).strip(),
            "options": opts,
            "answers": [q.answer] if q.answer is not None else [],
            "page": q.page,
            "images": [f for f in q.figures if f],
            "opt_images": list(q.opt_images),
        }
        if q.is_match:
            assemble_match(q)
        if q.match_rows:
            lines = ["List-I | List-II"] + list(q.match_rows)
            d["text"] = (d["text"] + "\n" + "\n".join(lines)).strip()
        d["text"] = clean_text(d["text"])
        out.append(d)

    with open(os.path.join(OUT_DIR, "questions_raw.json"), "w", encoding="utf-8") as f:
        json.dump({"key": "neet-2022", "questions": out}, f, indent=1, ensure_ascii=False)

    by_section = Counter(q["section"] for q in out)
    print(f"questions: {len(out)}  sections: {dict(by_section)}")
    no_ans = [q["number"] for q in out if not q["answers"]]
    no_opts = [q["number"] for q in out if len([o for o in q["options"] if o["text"] or o["image"]]) != 4]
    img_opts = [q["number"] for q in out if any(o["image"] for o in q["options"])]
    figs = [q["number"] for q in out if q["images"]]
    print("no answer:", no_ans)
    print("not 4 options:", no_opts)
    print("image options:", sorted(img_opts))
    print("figures:", sorted(figs))
    print(f"output: {os.path.abspath(os.path.join(OUT_DIR, 'questions_raw.json'))}")
    doc.close()


if __name__ == "__main__":
    main()
