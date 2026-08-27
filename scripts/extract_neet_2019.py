#!/usr/bin/env python3
"""
NEET (UG) 2019 extractor — source: neet/Neet 2019.pdf
(19 pages, 180 questions).

Layout & structure facts:
  * Two columns per page (Left: x < 295, Right: x >= 295).
  * Booklet numbering:
      - Chemistry: Q1-45  -> remapped to Site Q46-90 (section "Chemistry")
      - Physics:   Q46-90 -> remapped to Site Q1-45 (section "Physics")
      - Biology:   Q91-180 -> remapped to Site Q91-180 (section "Biology")
  * Every question has 4 options (1, 2, 3, 4 -> remapped to A, B, C, D) and an answer key.
  * Figures & chemical structures clipped at 300 DPI into neet-out/2019/images/.
  * Match questions formatted as markdown tables (| Column-I | Column-II |).
  * Mathematical equations, fractions, and Greek symbols converted to clean KaTeX.

Outputs:
  * neet-out/2019/questions.json
  * neet-out/2019/images/*.png

Usage:
  python scripts/extract_neet_2019.py
"""
import os
import re
import json
import fitz

PDF_PATH = os.path.join("neet", "Neet 2019.pdf")
OUT_DIR = os.path.join("neet-out", "2019")
IMG_DIR = os.path.join(OUT_DIR, "images")

os.makedirs(IMG_DIR, exist_ok=True)

GLYPHS = {
    "\uf061": "\\alpha", "\uf062": "\\beta", "\uf067": "\\gamma", "\uf073": "\\sigma",
    "\uf06c": "\\lambda", "\uf06d": "\\mu", "\uf070": "\\pi", "\uf071": "\\theta",
    "\uf072": "\\rho", "\uf064": "\\delta", "\uf06b": "\\kappa", "\uf06e": "\\nu",
    "\uf074": "\\tau", "\uf077": "\\omega", "\uf065": "\\varepsilon", "\uf06a": "\\phi",
    "\uf044": "\\Delta", "\uf057": "\\Omega", "\uf03d": "=", "\uf0ae": "\\rightarrow",
    "\uf0b0": "^\\circ", "\uf0d7": "\\times", "\uf0b4": "\\times", "\uf0ce": "\\varepsilon_0",
    "\u2013": "-", "\u00ae": " \\rightarrow ", "\u00d7": "\\times", "\u00b0": "^\\circ",
    "\u00b5": "\\mu ", "\u2113": "l"
}

def clean_span_text(t, font):
    if "Symbol" in font:
        out = []
        for c in t:
            code = ord(c)
            if code == 0x61: out.append("\\alpha ")
            elif code == 0x62: out.append("\\beta ")
            elif code == 0x64: out.append("\\delta ")
            elif code == 0x6C: out.append("\\lambda ")
            elif code == 0x6D: out.append("\\mu ")
            elif code == 0x70: out.append("\\pi ")
            elif code == 0x71: out.append("\\theta ")
            elif code == 0x72: out.append("\\rho ")
            elif code == 0x73: out.append("\\sigma ")
            elif code == 0x77: out.append("\\omega ")
            elif code == 0x57: out.append("\\Omega ")
            elif code == 0x44: out.append("\\Delta ")
            elif code == 0xCE: out.append("\\varepsilon_0 ")
            elif code == 0xAE: out.append(" \\rightarrow ")
            elif code == 0xB0: out.append("^\\circ ")
            elif code in (0xE6, 0xF6, 0xE7, 0xF7, 0xE8, 0xF8, 0xEA, 0xFA, 0xEB, 0xFB, 0xE9, 0xF9):
                out.append("")
            else:
                out.append(c)
        return "".join(out)
    else:
        out = []
        for c in t:
            if c in GLYPHS:
                out.append(GLYPHS[c])
            elif ord(c) > 127:
                if c == "\u2013" or c == "\ufffd":
                    out.append("-")
                elif c == "\u00ae":
                    out.append(" \\rightarrow ")
                elif c == "\u00d7":
                    out.append("\\times ")
                elif c == "\u00b0":
                    out.append("^\\circ ")
                elif c == "\u00b5":
                    out.append("\\mu ")
                else:
                    out.append(c)
            else:
                out.append(c)
        return "".join(out)

def clip_figure(doc, pno, rect, fname):
    page = doc[pno - 1]
    pm = page.get_pixmap(matrix=fitz.Matrix(3.0, 3.0), clip=fitz.Rect(rect))
    out_path = os.path.join(IMG_DIR, fname)
    pm.save(out_path)
    return fname

def polish_math_text(t):
    if not t:
        return t
    t = t.replace("\u2013", "-").replace("\ufffd", "-")
    t = re.sub(r'\b(PHYSICS|CHEMISTRY|BIOLOGY)\s*(TEST PAPER WITH ANSWER)?\b', '', t, flags=re.IGNORECASE)
    t = re.sub(r'TEST PAPER WITH ANSWER', '', t, flags=re.IGNORECASE)
    t = re.sub(r'(\d+(?:\.\d+)?)\s*\\times\s*10\s*([-\d]+)', r'\1 \\times 10^{\2}', t)
    t = re.sub(r'(\d+(?:\.\d+)?)\s*\\times\s*10\^?([-\d]+)', r'\1 \\times 10^{\2}', t)
    t = re.sub(r'\s{2,}', ' ', t)
    return t.strip()

def main():
    doc = fitz.open(PDF_PATH)
    print(f"Opened: {PDF_PATH} ({len(doc)} pages)")

    # 1. Clip diagram and structure figures
    print("Clipping figure assets...")
    # Booklet Q16 (Site Q61 - Chemistry)
    clip_figure(doc, 2, (75, 330, 160, 360), "Q61_opt_1.png")
    clip_figure(doc, 2, (75, 362, 160, 395), "Q61_opt_2.png")
    clip_figure(doc, 2, (75, 398, 160, 430), "Q61_opt_3.png")
    clip_figure(doc, 2, (75, 432, 160, 465), "Q61_opt_4.png")

    # Booklet Q17 (Site Q62 - Chemistry)
    clip_figure(doc, 2, (50, 490, 290, 545), "Q62.png")

    # Booklet Q20 (Site Q65 - Chemistry)
    clip_figure(doc, 2, (305, 105, 545, 160), "Q65.png")
    clip_figure(doc, 2, (330, 160, 420, 205), "Q65_opt_1.png")
    clip_figure(doc, 2, (430, 160, 540, 205), "Q65_opt_2.png")
    clip_figure(doc, 2, (330, 208, 420, 255), "Q65_opt_3.png")
    clip_figure(doc, 2, (430, 208, 540, 255), "Q65_opt_4.png")

    # Booklet Q29 (Site Q74 - Chemistry)
    clip_figure(doc, 3, (320, 110, 430, 145), "Q74_opt_1.png")
    clip_figure(doc, 3, (430, 110, 545, 145), "Q74_opt_2.png")
    clip_figure(doc, 3, (320, 148, 430, 185), "Q74_opt_3.png")
    clip_figure(doc, 3, (430, 148, 545, 185), "Q74_opt_4.png")

    # Booklet Q42 (Site Q87 - Chemistry)
    clip_figure(doc, 5, (50, 95, 280, 155), "Q87.png")
    clip_figure(doc, 5, (60, 165, 170, 220), "Q87_opt_1.png")
    clip_figure(doc, 5, (170, 165, 280, 220), "Q87_opt_2.png")
    clip_figure(doc, 5, (60, 230, 170, 290), "Q87_opt_3.png")
    clip_figure(doc, 5, (170, 230, 280, 290), "Q87_opt_4.png")

    # Booklet Q49 (Site Q4 - Physics)
    clip_figure(doc, 6, (75, 410, 220, 535), "Q4.png")

    # Booklet Q66 (Site Q21 - Physics)
    clip_figure(doc, 7, (360, 360, 480, 460), "Q21.png")

    # Booklet Q69 (Site Q24 - Physics)
    clip_figure(doc, 8, (140, 310, 200, 335), "Q24.png")

    # Booklet Q73 (Site Q28 - Physics)
    clip_figure(doc, 8, (330, 315, 430, 395), "Q28_opt_1.png")
    clip_figure(doc, 8, (440, 315, 540, 395), "Q28_opt_2.png")
    clip_figure(doc, 8, (330, 420, 430, 500), "Q28_opt_3.png")
    clip_figure(doc, 8, (440, 420, 540, 500), "Q28_opt_4.png")

    # Booklet Q81 (Site Q36 - Physics)
    clip_figure(doc, 9, (310, 345, 540, 430), "Q36.png")

    # Booklet Q88 (Site Q43 - Physics)
    clip_figure(doc, 10, (350, 155, 430, 220), "Q43.png")

    # 2. Extract lines per column
    all_lines = []
    for pno, page in enumerate(doc):
        d = page.get_text("dict")
        page_lines = []
        for block in d["blocks"]:
            if block["type"] != 0: continue
            for line in block["lines"]:
                line_str = ""
                for span in line["spans"]:
                    stext = clean_span_text(span["text"], span["font"])
                    line_str += stext
                bbox = line["bbox"]
                if bbox[1] > 765 and re.fullmatch(r'\s*\d{1,2}\s*', line_str):
                    continue
                if bbox[1] < 45 and ("NEET" in line_str.upper() or "BIOLOGY" in line_str.upper() or "PHYSICS" in line_str.upper() or "CHEMISTRY" in line_str.upper()):
                    continue
                col = "L" if bbox[0] < 295 else "R"
                page_lines.append((pno+1, col, bbox[1], bbox[3], bbox[0], bbox[2], line_str.strip()))
        
        left = sorted([l for l in page_lines if l[1] == "L"], key=lambda l: l[2])
        right = sorted([l for l in page_lines if l[1] == "R"], key=lambda l: l[2])
        all_lines.extend(left)
        all_lines.extend(right)

    # 3. Group lines into questions
    raw_questions = []
    cur_q = None
    next_expected_qnum = 1

    for line_item in all_lines:
        pno, col, y0, y1, x0, x1, text = line_item
        if not text: continue
        m = re.match(r'^(\d{1,3})\.\s*(.*)$', text)
        if m and int(m.group(1)) == next_expected_qnum:
            if cur_q:
                raw_questions.append(cur_q)
            qnum = int(m.group(1))
            next_expected_qnum += 1
            rest_text = m.group(2).strip()
            cur_q = {
                "booklet_number": qnum,
                "page": pno,
                "col": col,
                "top_y": y0,
                "lines": [rest_text] if rest_text else []
            }
        else:
            if cur_q:
                cur_q["lines"].append(text)
    if cur_q:
        raw_questions.append(cur_q)

    # 4. Parse options, answer keys, and format content
    final_questions = []
    
    # Pre-defined curated text overrides for formula/match/special questions
    curated_overrides = {
        6: { # Booklet Q6 -> Site Q51 (Chemistry)
            "stem": "For a cell involving one electron $E_{\\text{cell}}^\\circ = 0.59\\text{ V}$ at $298\\text{ K}$, the equilibrium constant for the cell reaction is :- $\\left[\\text{Given that } \\frac{2.303 R T}{F} = 0.059\\text{ V at } T = 298\\text{ K}\\right]$",
            "options": {
                "1": "$1.0 \\times 10^2$",
                "2": "$1.0 \\times 10^{30}$",
                "3": "$1.0 \\times 10^{10}$",
                "4": "$1.0 \\times 10^5$"
            },
            "ans": "3"
        },
        16: { # Booklet Q16 -> Site Q61 (Chemistry)
            "stem": "The compound that is most difficult to protonate is :-",
            "options": {
                "1": "",
                "2": "",
                "3": "",
                "4": ""
            },
            "opt_figures": {
                "1": "Q61_opt_1.png",
                "2": "Q61_opt_2.png",
                "3": "Q61_opt_3.png",
                "4": "Q61_opt_4.png"
            },
            "ans": "4"
        },
        17: { # Booklet Q17 -> Site Q62 (Chemistry)
            "stem": "The most suitable reagent for the following conversion is :-\n$$\\text{H}_3\\text{C}-\\text{C}\\equiv\\text{C}-\\text{CH}_3 \\longrightarrow \\text{cis-2-butene}$$",
            "images": ["Q62.png"],
            "options": {
                "1": "$\\text{Na} / \\text{liquid } \\text{NH}_3$",
                "2": "$\\text{H}_2, \\text{Pd}/\\text{C}, \\text{quinoline}$",
                "3": "$\\text{Zn} / \\text{HCl}$",
                "4": "$\\text{Hg}^{2+} / \\text{H}^+, \\text{H}_2\\text{O}$"
            },
            "ans": "2"
        },
        20: { # Booklet Q20 -> Site Q65 (Chemistry)
            "stem": "The structure of intermediate A in the following reaction is :-",
            "images": ["Q65.png"],
            "options": {
                "1": "",
                "2": "",
                "3": "",
                "4": ""
            },
            "opt_figures": {
                "1": "Q65_opt_1.png",
                "2": "Q65_opt_2.png",
                "3": "Q65_opt_3.png",
                "4": "Q65_opt_4.png"
            },
            "ans": "2"
        },
        29: { # Booklet Q29 -> Site Q74 (Chemistry)
            "stem": "The correct structure of tribromooctaoxide ($\\text{Br}_3\\text{O}_8$) is :-",
            "options": {
                "1": "",
                "2": "",
                "3": "",
                "4": ""
            },
            "opt_figures": {
                "1": "Q74_opt_1.png",
                "2": "Q74_opt_2.png",
                "3": "Q74_opt_3.png",
                "4": "Q74_opt_4.png"
            },
            "ans": "2"
        },
        35: { # Booklet Q35 -> Site Q80 (Chemistry)
            "stem": "For the cell reaction $2\\text{Fe}^{3+}(\\text{aq}) + 2\\text{I}^-(\\text{aq}) \\rightarrow 2\\text{Fe}^{2+}(\\text{aq}) + \\text{I}_2(\\text{aq})$, $E_{\\text{cell}}^\\circ = 0.24\\text{ V}$ at $298\\text{ K}$. The standard Gibbs energy ($\\Delta_r G^\\circ$) of the cell reaction is : [Given that Faraday constant $F = 96500\\text{ C mol}^{-1}$]",
            "options": {
                "1": "$-46.32\\text{ kJ mol}^{-1}$",
                "2": "$-23.16\\text{ kJ mol}^{-1}$",
                "3": "$46.32\\text{ kJ mol}^{-1}$",
                "4": "$23.16\\text{ kJ mol}^{-1}$"
            },
            "ans": "1"
        },
        42: { # Booklet Q42 -> Site Q87 (Chemistry)
            "stem": "The major product of the following reaction is :",
            "images": ["Q87.png"],
            "options": {
                "1": "",
                "2": "",
                "3": "",
                "4": ""
            },
            "opt_figures": {
                "1": "Q87_opt_1.png",
                "2": "Q87_opt_2.png",
                "3": "Q87_opt_3.png",
                "4": "Q87_opt_4.png"
            },
            "ans": "2"
        },
        43: { # Booklet Q43 -> Site Q88 (Chemistry)
            "stem": "For the chemical reaction $\\text{N}_2(\\text{g}) + 3\\text{H}_2(\\text{g}) \\rightleftharpoons 2\\text{NH}_3(\\text{g})$ the correct option is :",
            "options": {
                "1": "$-\\frac{1}{3} \\frac{d[\\text{H}_2]}{dt} = -\\frac{1}{2} \\frac{d[\\text{NH}_3]}{dt}$",
                "2": "$-\\frac{d[\\text{N}_2]}{dt} = 2 \\frac{d[\\text{NH}_3]}{dt}$",
                "3": "$-\\frac{d[\\text{N}_2]}{dt} = \\frac{1}{2} \\frac{d[\\text{NH}_3]}{dt}$",
                "4": "$\\frac{d[\\text{H}_2]}{dt} = \\frac{2}{3} \\frac{d[\\text{NH}_3]}{dt}$"
            },
            "ans": "3"
        },
        44: { # Booklet Q44 -> Site Q89 (Chemistry)
            "stem": "What is the correct electronic configuration of the central atom in $\\text{K}_4[\\text{Fe}(\\text{CN})_6]$ based on crystal field theory ?",
            "options": {
                "1": "$t_{2g}^4 e_g^2$",
                "2": "$t_{2g}^6 e_g^0$",
                "3": "$e^3 t_2^3$",
                "4": "$e^4 t_2^2$"
            },
            "ans": "2"
        },
        49: { # Booklet Q49 -> Site Q4 (Physics)
            "stem": "The correct Boolean operation represented by the circuit diagram drawn is :",
            "images": ["Q4.png"],
            "options": {
                "1": "AND",
                "2": "OR",
                "3": "NAND",
                "4": "NOR"
            },
            "ans": "3"
        },
        50: { # Booklet Q50 -> Site Q5 (Physics)
            "stem": "A block of mass $10\\text{ kg}$ is in contact against the inner wall of a hollow cylindrical drum of radius $1\\text{ m}$. The coefficient of friction between the block and the inner wall of the cylinder is $0.1$. The minimum angular velocity needed for the cylinder to keep the block stationary when the cylinder is vertical and rotating about its axis, will be : ($g = 10\\text{ m/s}^2$)",
            "options": {
                "1": "$\\sqrt{10}\\text{ rad/s}$",
                "2": "$\\frac{10}{2\\pi}\\text{ rad/s}$",
                "3": "$10\\text{ rad/s}$",
                "4": "$10\\pi\\text{ rad/s}$"
            },
            "ans": "3"
        },
        52: { # Booklet Q52 -> Site Q7 (Physics)
            "stem": "The speed of a swimmer in still water is $20\\text{ m/s}$. The speed of river water is $10\\text{ m/s}$ and is flowing due east. If he is standing on the south bank and wishes to cross the river along the shortest path, the angle at which he should make his strokes w.r.t. north is given by :",
            "options": {
                "1": "$30^\\circ\\text{ west}$",
                "2": "$0^\\circ$",
                "3": "$60^\\circ\\text{ west}$",
                "4": "$45^\\circ\\text{ west}$"
            },
            "ans": "1"
        },
        53: { # Booklet Q53 -> Site Q8 (Physics)
            "stem": "A mass $m$ is attached to a thin wire and whirled in a vertical circle. The wire is most likely to break when :",
            "options": {
                "1": "the mass is at the highest point",
                "2": "the wire is horizontal",
                "3": "the mass is at the lowest point",
                "4": "inclined at an angle of $60^\\circ$ from vertical"
            },
            "ans": "3"
        },
        54: { # Booklet Q54 -> Site Q9 (Physics)
            "stem": "The displacement of a particle executing simple harmonic motion is given by $y = A_0 + A\\sin\\omega t + B\\cos\\omega t$. Then the amplitude of its oscillation is given by :",
            "options": {
                "1": "$\\sqrt{A_0^2 + A^2 + B^2}$",
                "2": "$\\sqrt{A^2 + B^2}$",
                "3": "$\\sqrt{A_0^2 + (A + B)^2}$",
                "4": "$A + B$"
            },
            "ans": "2"
        },
        56: { # Booklet Q56 -> Site Q11 (Physics)
            "stem": "Average velocity of a particle executing SHM in one complete vibration is :",
            "options": {
                "1": "$\\frac{A\\omega}{2}$",
                "2": "$A\\omega$",
                "3": "$\\frac{A\\omega^2}{2}$",
                "4": "Zero"
            },
            "ans": "4"
        },
        60: { # Booklet Q60 -> Site Q15 (Physics)
            "stem": "When a block of mass $M$ is suspended by a long wire of length $L$, the length of the wire becomes $(L + l)$. The elastic potential energy stored in the extended wire is :-",
            "options": {
                "1": "$Mgl$",
                "2": "$MgL$",
                "3": "$\\frac{1}{2} Mgl$",
                "4": "$\\frac{1}{2} MgL$"
            },
            "ans": "3"
        },
        62: { # Booklet Q62 -> Site Q17 (Physics)
            "stem": "In an experiment, the percentage of error occurred in the measurement of physical quantities A, B, C and D are 1%, 2%, 3% and 4% respectively. Then the maximum percentage of error in the measurement X, where X = \\frac{A^2 B^{1/2}}{C^{1/3} D^3}, will be :",
            "options": {
                "1": "(\\frac{3}{13})%",
                "2": "16%",
                "3": "-10%",
                "4": "10%"
            },
            "ans": "2"
        },
        66: { # Booklet Q66 -> Site Q21 (Physics)
            "stem": "The radius of circle, the period of revolution, initial position and sense of revolution are indicated in the figure.\ny-projection of the radius vector of rotating particle P is :",
            "images": ["Q21.png"],
            "options": {
                "1": "y(t) = -3\\cos 2\\pi t, where y in m",
                "2": "y(t) = 4\\sin(\\frac{\\pi t}{2}), where y in m",
                "3": "y(t) = 3\\cos(\\frac{3\\pi t}{2}), where y in m",
                "4": "y(t) = 3\\cos(\\frac{\\pi t}{2}), where y in m"
            },
            "ans": "4"
        },
        69: { # Booklet Q69 -> Site Q24 (Physics)
            "stem": "Six similar bulbs are connected as shown in the figure with a DC source of emf $E$, and zero internal resistance.\nThe ratio of power consumption by the bulbs when (i) all are glowing and (ii) in the situation when two from section A and one from section B are glowing, will be :",
            "images": ["Q24.png"],
            "options": {
                "1": "$4 : 9$",
                "2": "$9 : 4$",
                "3": "$1 : 2$",
                "4": "$2 : 1$"
            },
            "ans": "2"
        },
        73: { # Booklet Q73 -> Site Q28 (Physics)
            "stem": "A cylindrical conductor of radius $R$ is carrying a constant current. The plot of the magnitude of the magnetic field, $B$ with the distance $d$, from the centre of the conductor, is correctly represented by the figure :",
            "options": {
                "1": "",
                "2": "",
                "3": "",
                "4": ""
            },
            "opt_figures": {
                "1": "Q28_opt_1.png",
                "2": "Q28_opt_2.png",
                "3": "Q28_opt_3.png",
                "4": "Q28_opt_4.png"
            },
            "ans": "3"
        },
        77: { # Booklet Q77 -> Site Q32 (Physics)
            "stem": "Two parallel infinite line charges with linear charge densities $+\\lambda\\text{ C/m}$ and $-\\lambda\\text{ C/m}$ are placed at a distance of $2R$ in free space. What is the electric field mid-way between the two line charges?",
            "options": {
                "1": "zero",
                "2": "$\\frac{\\lambda}{2\\pi\\varepsilon_0 R}\\text{ N/C}$",
                "3": "$\\frac{\\lambda}{\\pi\\varepsilon_0 R}\\text{ N/C}$",
                "4": "$\\frac{2\\lambda}{\\pi\\varepsilon_0 R}\\text{ N/C}$"
            },
            "ans": "3"
        },
        81: { # Booklet Q81 -> Site Q36 (Physics)
            "stem": "In the circuits shown below, the readings of the voltmeters and the ammeters will be :",
            "images": ["Q36.png"],
            "options": {
                "1": "$V_2 > V_1$ and $i_1 = i_2$",
                "2": "$V_1 = V_2$ and $i_1 > i_2$",
                "3": "$V_1 = V_2$ and $i_1 = i_2$",
                "4": "$V_2 > V_1$ and $i_1 > i_2$"
            },
            "ans": "3"
        },
        84: { # Booklet Q84 -> Site Q39 (Physics)
            "stem": "When an object is shot from the bottom of a long smooth inclined plane kept at an angle $60^\\circ$ with horizontal, it can travel a distance $x_1$ along the plane. But when the inclination is decreased to $30^\\circ$ and the same object is shot with the same velocity, it can travel $x_2$ distance. Then $x_1 : x_2$ will be :",
            "options": {
                "1": "$1 : 2$",
                "2": "$2 : 1$",
                "3": "$1 : \\sqrt{3}$",
                "4": "$1 : 2\\sqrt{3}$"
            },
            "ans": "3"
        },
        86: { # Booklet Q86 -> Site Q41 (Physics)
            "stem": "Two point charges A and B, having charges $+Q$ and $-Q$ respectively, are placed at certain distance apart and force acting between them is $F$. If $25\\%$ charge of A is transferred to B, then force between the charges becomes :",
            "options": {
                "1": "$F$",
                "2": "$\\frac{9F}{16}$",
                "3": "$\\frac{16F}{9}$",
                "4": "$\\frac{4F}{3}$"
            },
            "ans": "2"
        },
        88: { # Booklet Q88 -> Site Q43 (Physics)
            "stem": "A particle moving with velocity $\\vec{V}$ is acted by three forces shown by the vector triangle PQR. The velocity of the particle will :",
            "images": ["Q43.png"],
            "options": {
                "1": "increase",
                "2": "decrease",
                "3": "remain constant",
                "4": "change according to the smallest force QR"
            },
            "ans": "3"
        },
        89: { # Booklet Q89 -> Site Q44 (Physics)
            "stem": "The work done to raise a mass $m$ from the surface of the earth to a height $h$, which is equal to the radius of the earth, is :",
            "options": {
                "1": "$mgR$",
                "2": "$2 mgR$",
                "3": "$\\frac{1}{2} mgR$",
                "4": "$\\frac{3}{2} mgR$"
            },
            "ans": "3"
        },
        100: { # Booklet Q100 -> Site Q100 (Biology)
            "stem": "Match the following organisms with the products they produce :-\n| Column-I | Column-II |\n|---|---|\n| (a) Lactobacillus | (i) Cheese |\n| (b) Saccharomyces cerevisiae | (ii) Curd |\n| (c) Aspergillus niger | (iii) Citric Acid |\n| (d) Acetobacter aceti | (iv) Bread |\n| | (v) Acetic Acid |\n\nSelect the correct option.",
            "options": {
                "1": "(a) - (ii), (b) - (iv), (c) - (v), (d) - (iii)",
                "2": "(a) - (ii), (b) - (iv), (c) - (iii), (d) - (v)",
                "3": "(a) - (iii), (b) - (iv), (c) - (v), (d) - (i)",
                "4": "(a) - (ii), (b) - (i), (c) - (iii), (d) - (v)"
            },
            "ans": "2"
        },
        109: { # Booklet Q109 -> Site Q109 (Biology)
            "stem": "Match the following organisms with their respective characteristics :-\n| Column-I | Column-II |\n|---|---|\n| (a) Pila | (i) Flame cells |\n| (b) Bombyx | (ii) Comb plates |\n| (c) Pleurobrachia | (iii) Radula |\n| (d) Taenia | (iv) Malpighian tubules |\n\nSelect the correct option from the following :",
            "options": {
                "1": "(a) - (iii), (b) - (ii), (c) - (i), (d) - (iv)",
                "2": "(a) - (iii), (b) - (iv), (c) - (ii), (d) - (i)",
                "3": "(a) - (ii), (b) - (iv), (c) - (iii), (d) - (i)",
                "4": "(a) - (iii), (b) - (ii), (c) - (iv), (d) - (i)"
            },
            "ans": "2"
        },
        149: { # Booklet Q149 -> Site Q149 (Biology)
            "stem": "Match the following structures with their respective locations in organs :-\n| Column-I | Column-II |\n|---|---|\n| (a) Crypts of Lieberkuhn | (i) Pancreas |\n| (b) Glisson's Capsule | (ii) Duodenum |\n| (c) Islets of Langerhans | (iii) Small intestine |\n| (d) Brunner's Glands | (iv) Liver |\n\nSelect the correct option from the following :",
            "options": {
                "1": "(a) - (iii), (b) - (1), (c) - (ii), (d) - (iv)",
                "2": "(a) - (ii), (b) - (iv), (c) - (i), (d) - (iii)",
                "3": "(a) - (iii), (b) - (iv), (c) - (i), (d) - (ii)",
                "4": "(a) - (iii), (b) - (ii), (c) - (i), (d) - (iv)"
            },
            "ans": "3"
        },
        150: { # Booklet Q150 -> Site Q150 (Biology)
            "stem": "Match the following hormones with the respective disease :-\n| Column-I | Column-II |\n|---|---|\n| (a) Insulin | (i) Addison's disease |\n| (b) Thyroxin | (ii) Diabetes insipidus |\n| (c) Corticoids | (iii) Acromegaly |\n| (d) Growth Hormone | (iv) Goitre |\n| | (v) Diabetes mellitus |\n\nSelect the correct option.",
            "options": {
                "1": "(a) - (v), (b) - (i), (c) - (ii), (d) - (iii)",
                "2": "(a) - (ii), (b) - (iv), (c) - (iii), (d) - (i)",
                "3": "(a) - (v), (b) - (iv), (c) - (i), (d) - (iii)",
                "4": "(a) - (ii), (b) - (iv), (c) - (i), (d) - (iii)"
            },
            "ans": "3"
        },
        164: { # Booklet Q164 -> Site Q164 (Biology)
            "stem": "Match Column - I with Column - II :-\n| Column-I | Column-II |\n|---|---|\n| (a) Saprophyte | (i) Symbiotic association of fungi with plant roots |\n| (b) Parasite | (ii) Decomposition of dead organic materials |\n| (c) Lichens | (iii) Living on living plants or animals |\n| (d) Mycorrhiza | (iv) Symbiotic association of algae and fungi |\n\nChoose the correct answer from the options given below :",
            "options": {
                "1": "(a) - (i), (b) - (ii), (c) - (iii), (d) - (iv)",
                "2": "(a) - (iii), (b) - (ii), (c) - (i), (d) - (iv)",
                "3": "(a) - (ii), (b) - (i), (c) - (iii), (d) - (iv)",
                "4": "(a) - (ii), (b) - (iii), (c) - (iv), (d) - (i)"
            },
            "ans": "4"
        },
        170: { # Booklet Q170 -> Site Q170 (Biology)
            "stem": "Match the following genes of the Lac operon with their respective products :-\n| Column-I | Column-II |\n|---|---|\n| (a) i gene | (i) \\beta-galactosidase |\n| (b) z gene | (ii) Permease |\n| (c) a gene | (iii) Repressor |\n| (d) y gene | (iv) Transacetylase |\n\nSelect the correct option.",
            "options": {
                "1": "(a) - (i), (b) - (iii), (c) - (ii), (d) - (iv)",
                "2": "(a) - (iii), (b) - (i), (c) - (ii), (d) - (iv)",
                "3": "(a) - (iii), (b) - (i), (c) - (iv), (d) - (ii)",
                "4": "(a) - (iii), (b) - (iv), (c) - (i), (d) - (ii)"
            },
            "ans": "3"
        },
        172: { # Booklet Q172 -> Site Q172 (Biology)
            "stem": "Match the hominids with their correct brain size :-\n| Column-I | Column-II |\n|---|---|\n| (a) Homo habilis | (i) 900 cc |\n| (b) Homo neanderthalensis | (ii) 1350 cc |\n| (c) Homo erectus | (iii) 650-800 cc |\n| (d) Homo sapiens | (iv) 1400 cc |\n\nSelect the correct option.",
            "options": {
                "1": "(a) - (iii), (b) - (i), (c) - (iv), (d) - (ii)",
                "2": "(a) - (iii), (b) - (iv), (c) - (i), (d) - (ii)",
                "3": "(a) - (iv), (b) - (iii), (c) - (i), (d) - (ii)",
                "4": "(a) - (iii), (b) - (ii), (c) - (i), (d) - (iv)"
            },
            "ans": "2"
        },
        178: { # Booklet Q178 -> Site Q178 (Biology)
            "stem": "Match Column - I with Column - II :-\n| Column-I | Column-II |\n|---|---|\n| (a) P - wave | (i) Depolarisation of ventricles |\n| (b) QRS complex | (ii) Repolarisation of ventricles |\n| (c) T - wave | (iii) Coronary ischemia |\n| (d) Reduction in the size of T - wave | (iv) Depolarisation of atria |\n| | (v) Repolarisation of atria |\n\nSelect the correct option.",
            "options": {
                "1": "(a) - (iv), (b) - (i), (c) - (ii), (d) - (iii)",
                "2": "(a) - (iv), (b) - (i), (c) - (ii), (d) - (v)",
                "3": "(a) - (ii), (b) - (i), (c) - (v), (d) - (iii)",
                "4": "(a) - (ii), (b) - (iii), (c) - (v), (d) - (iv)"
            },
            "ans": "1"
        }
    }

    for rq in raw_questions:
        bnum = rq["booklet_number"]
        lines = rq["lines"]
        
        # Section and Site number remapping
        if 1 <= bnum <= 45: # Chemistry
            site_num = bnum + 45
            section = "Chemistry"
        elif 46 <= bnum <= 90: # Physics
            site_num = bnum - 45
            section = "Physics"
        else: # Biology
            site_num = bnum
            section = "Biology"
            
        if bnum in curated_overrides:
            ov = curated_overrides[bnum]
            opt_list = []
            opt_figs = ov.get("opt_figures", {})
            for idx in ["1", "2", "3", "4"]:
                opt_list.append({
                    "label": idx,
                    "text": ov["options"].get(idx, ""),
                    "figure": opt_figs.get(idx)
                })
            
            ans_val = ov.get("ans")
            ans_list = [ans_val] if ans_val else []
            if bnum == 13: ans_list = ["1", "2"]
            
            final_questions.append({
                "number": site_num,
                "booklet_number": bnum,
                "section": section,
                "type": "mcq",
                "text": ov["stem"],
                "options": opt_list,
                "answers": ans_list,
                "solution": None,
                "images": ov.get("images", [])
            })
            continue

        # General question parsing
        ans = None
        clean_lines = []
        for l in lines:
            ans_m = re.search(r'Ans\.\s*\(([^)]+)\)', l)
            if ans_m:
                ans = ans_m.group(1).strip()
                before = l[:ans_m.start()].strip()
                if before: clean_lines.append(before)
            else:
                clean_lines.append(l)
                
        stem_lines = []
        options = {"1": "", "2": "", "3": "", "4": ""}
        cur_opt = None
        
        for l in clean_lines:
            parts = re.split(r'(\([1-4]\))', l)
            if len(parts) > 1:
                if cur_opt is None:
                    if parts[0].strip(): stem_lines.append(parts[0].strip())
                else:
                    if parts[0].strip(): options[str(cur_opt)] = (options[str(cur_opt)] + " " + parts[0].strip()).strip()
                for idx in range(1, len(parts), 2):
                    opt_label = parts[idx].strip("()")
                    opt_text = parts[idx+1].strip() if idx + 1 < len(parts) else ""
                    cur_opt = opt_label
                    options[cur_opt] = (options[cur_opt] + " " + opt_text).strip()
            else:
                if cur_opt is None:
                    stem_lines.append(l)
                else:
                    options[str(cur_opt)] = (options[str(cur_opt)] + " " + l).strip()
                    
        stem_text = polish_math_text(" ".join(stem_lines))
        
        opt_list = []
        for idx in ["1", "2", "3", "4"]:
            opt_list.append({
                "label": idx,
                "text": polish_math_text(options[idx])
            })
            
        ans_list = [ans] if ans else []
        if bnum == 13: ans_list = ["1", "2"]
        
        final_questions.append({
            "number": site_num,
            "booklet_number": bnum,
            "section": section,
            "type": "mcq",
            "text": stem_text,
            "options": opt_list,
            "answers": ans_list,
            "solution": None,
            "images": []
        })

    # Sort questions by site number (1..180)
    final_questions.sort(key=lambda q: q["number"])

    output_payload = {
        "key": "neet-2019",
        "title": "NEET 2019",
        "fullTitle": "NEET 2019 Question Paper",
        "examDate": "2019-05-05",
        "durationMinutes": 180,
        "questionCount": len(final_questions),
        "questions": final_questions
    }

    out_file = os.path.join(OUT_DIR, "questions.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2, ensure_ascii=False)

    print(f"\nExtraction complete!")
    print(f"Wrote {len(final_questions)} questions to {out_file}")
    print(f"Physics: {len([q for q in final_questions if q['section'] == 'Physics'])} questions")
    print(f"Chemistry: {len([q for q in final_questions if q['section'] == 'Chemistry'])} questions")
    print(f"Biology: {len([q for q in final_questions if q['section'] == 'Biology'])} questions")

if __name__ == "__main__":
    main()
