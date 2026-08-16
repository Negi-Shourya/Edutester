#!/usr/bin/env python3
"""
katex-2022.py — Convert flattened OCR math in the NEET 2022 paper into the
^{...}/_{...} markup the site's mathText → KaTeX pipeline renders.

The 2022 paper is a scan; its extraction flattened every superscript/subscript
into plain text ("10–10 m" instead of 10^{–10} m, "102 m" instead of 10^{2} m,
"H2O" instead of H_{2}O, "22 11Na" instead of ^{22}_{11}Na, garbled half-cell
reactions, etc.).  Every other NEET paper stores proper markup, so this pass
brings 2022 in line.

Strategy:
  1. Safe global regex conversions for well-defined patterns.
  2. A manual patch table for stems/options the OCR mangled beyond a regex
     (each verified against the printed paper / NTA key / S1 source).

Output: neet-out/2022/questions.json (overwritten) + a before/after report at
neet-out/2022/_katex_report.txt for review.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "neet-out" / "2022" / "questions.json"
REPORT = ROOT / "neet-out" / "2022" / "_katex_report.txt"

EN = "\u2013"  # en dash used as minus in the scan
MINUS = "\u2212"

# ──────────────────────────────────────────────────────────────────────────
# 1. Global regex conversions (applied in this order)
# ──────────────────────────────────────────────────────────────────────────

def convert_global(text: str) -> str:
    t = text

    # ohm sign U+2126 -> Greek Omega (pipeline maps Ω → \Omega{}, other papers
    # store the Greek letter)
    t = t.replace("\u2126", "\u03a9")

    # masculine ordinal º (OCR misread of degree sign) -> degree °
    t = t.replace("\u00ba", "\u00b0")

    # inverse trig: tan–1 / sin–1 -> \tan^{-1} / \sin^{-1}
    t = re.sub(r"tan" + EN + r"1", r"\\tan^{-1}", t)
    t = re.sub(r"sin" + EN + r"1", r"\\sin^{-1}", t)
    t = re.sub(r"tan" + MINUS + r"1", r"\\tan^{-1}", t)
    t = re.sub(r"sin" + MINUS + r"1", r"\\sin^{-1}", t)

    # dimension brackets first (before unit exponents / formulas so [M–1L3T–2]
    # becomes [M^{–1}L^{3}T^{–2}] — every number inside is a superscript)
    def dim2(m):
        inner = m.group(1)
        inner = re.sub(r"([A-Za-z])" + EN + r"(\d+)", r"\1^{" + EN + r"\2}", inner)
        inner = re.sub(r"([A-Za-z])(\d+)", r"\1^{\2}", inner)
        return "[" + inner + "]"
    t = re.sub(r"\[([A-Za-z\u2013\u2212\d]+)\]", dim2, t)

    # 10–N exponents: 10–10 m -> 10^{–10} m ; 3.0 × 10–59 -> 3.0 × 10^{–59}
    t = re.sub(r"10" + EN + r"(\d{1,3})", r"10^{" + EN + r"\1}", t)
    t = re.sub(r"10" + MINUS + r"(\d{1,3})", r"10^{-\\1}", t)

    # glued exponents after × : 36 × 107 J -> 36 × 10^{7} J
    t = re.sub(r"(\u00d7\s*10)(\d{1,2})(?!\d)", r"\1^{\2}", t)

    # unit powers: rad/s2 -> rad/s^{2}, m2 -> m^{2}, m3 -> m^{3}, A/m2 -> A/m^{2}
    for unit in ["rad/s", "A/m", "m", "cm", "mm", "km", "mol", "min", "s", "h", "kg", "g", "J", "W", "V", "N", "Hz", "K", "L", "bp", "Å"]:
        t = re.sub(r"\b(" + re.escape(unit) + r")([23])(?!\w)", r"\1^{\2}", t)

    # en-dash unit exponents: ms–1 -> ms^{–1}, K–1 mol–1 -> K^{–1} mol^{–1}
    t = re.sub(r"([A-Za-z]+)" + EN + r"(\d)(?!\w)", r"\1^{" + EN + r"\2}", t)

    # ions / charges FIRST (before formulas so Cu2+ -> Cu^{2+}, not Cu_{2}+):
    t = re.sub(r"([A-Z][a-z]?)(\d*)\+", lambda m: m.group(1) + "^{" + m.group(2) + "+}", t)
    # monatomic anions: Cl- -> Cl^{–}
    t = re.sub(r"([A-Z][a-z]?)(\d*)\u2212", lambda m: m.group(1) + "^{" + m.group(2) + EN + "}", t)

    # isotopes: 22 11Na -> ^{22}_{11}Na (mass-number space atomic-number space element)
    t = re.sub(r"(\d{1,3})\s+(\d{1,3})([A-Z][a-z]?)", r"^{\1}_{\2}\3", t)
    # isotope labels: 15N / 14N -> ^{15}N / ^{14}N (e.g. Meselson-Stahl)
    t = re.sub(r"(\d{2})([A-Z][a-z]?)(?!\w)", r"^{\1}\2", t)

    # chemical formulas: H2O -> H_{2}O, CO2 -> CO_{2}, O2 -> O_{2}, CaCO3 -> CaCO_{3}
    t = re.sub(r"([A-Z][a-z]?)(\d+)", r"\1_{\2}", t)

    # parenthetical groups: (H2O)2 -> (H_{2}O)_{2}, (en)3 -> (en)_{3}
    t = re.sub(r"\)(\d)", r")_{\1}", t)
    # complex ions: [Ni(en)3]2+ -> [Ni(en)_{3}]^{2+}, ]2- -> ]^{2–}
    t = re.sub(r"\](\d*)([+\u2013\u2212-])", lambda m: "]" + "^{" + m.group(1) + (m.group(2).replace(MINUS, EN)) + "}", t)

    # orbital labels: sp3 -> sp^{3}, sp2 -> sp^{2}
    t = re.sub(r"\bsp([23])\b", r"sp^{\1}", t)

    # half-life t½ -> t_{1/2}
    t = t.replace("t\u00bd", "t_{1/2}")

    return t


# ──────────────────────────────────────────────────────────────────────────
# 2. Manual patches — stems/options the OCR mangled beyond regex repair.
#    Every entry verified against the printed paper / NTA answer key / the
#    Aakash S1 source.
# ──────────────────────────────────────────────────────────────────────────

STEM_PATCHES = {
    # 10² m in the EM-wave wavelength list (OCR dropped the ² on positive exponent)
    1: (
        "Match List-I with List-II\n"
        "List-I (Electromagnetic waves)\n"
        "List-II (Wavelength)\n"
        "A. AM radio waves  i. 10^{–10} m\n"
        "B. Microwaves  ii. 10^{2} m\n"
        "C. Infrared radiations  iii. 10^{–2} m\n"
        "D. X-rays  iv. 10^{–4} m\n"
        "Choose the correct answer from the options given below"
    ),
    # stopping potentials 2V_{s} and V_{s}; threshold-frequency options are fractions
    17: (
        "When two monochromatic lights of frequency, ν and 2ν are incident on a photoelectric metal, "
        "their stopping potential becomes 2V_{s} and V_{s} respectively. The threshold frequency for this metal is"
    ),
    # beta-plus decay ²²₁₁Na → X + e⁺ + ν
    19: "In the given nuclear reaction, the element X is ^{22}_{11}Na → X + e^{+} + ν",
    # refractive index √3 (√ lost in OCR; answer C=90° confirms)
    29: (
        "A light ray falls on a glass surface of refractive index √3, at an angle 60°. "
        "The angle between the refracted and reflected rays would be"
    ),
    # radius (2/π) × 10^{-2} m (OCR scrambled; answer D=10^{5} A/m^{2} confirms)
    32: (
        "A copper wire of length 10 m and radius \\frac{2}{\\pi} × 10^{–2} m has electrical resistance of 10 Ω. "
        "The current density in the wire for an electric field strength of 10 (V/m) is"
    ),
    # match list — first row "(a) Gravitational constant (G) — (i) [L²T⁻²]" was lost
    36: (
        "Match List-I with List-II\n"
        "List-I\n"
        "List-II\n"
        "(a) Gravitational constant (G)  (i) [L^{2}T^{–2}]\n"
        "(b) Gravitational potential energy  (ii) [M^{–1}L^{3}T^{–2}]\n"
        "(c) Gravitational potential  (iii) [LT^{–2}]\n"
        "(d) Gravitational intensity  (iv) [ML^{2}T^{–2}]\n"
        "Choose the correct answer from the options given below"
    ),
    # 10 µF (µ misplaced after F), V = 200 sin(100t), ν_{0}
    42: (
        "A series LCR circuit with inductance 10 H, capacitance 10 µF, resistance 50 Ω is connected to an ac source of voltage, "
        "V = 200 \\sin(100t) volt. If the resonant frequency of the LCR circuit is ν_{0} and the frequency of the ac source is ν, then"
    ),
    # iodine monochloride (OCR read "Cl" as "CI" capital-I)
    52: (
        "Given below are two statements: one is labelled as Assertion (A) and the other is labelled as Reason (R). "
        "Assertion (A): ICl is more reactive than I_{2}. "
        "Reason (R): I-Cl bond is weaker than I-I bond. "
        "In the light of the above statements, choose the most appropriate answer from the options given below:"
    ),
    # Grignard + CO₂ → RCOOMgX → H₃O⁺ → RCOOH
    80: (
        "RMgX + CO_{2} \\xrightarrow{dry\\ ether} Y \\xrightarrow{H_{3}O^{+}} RCOOH. "
        "What is Y in the above reaction?"
    ),
    # half-cell reactions (verified against the printed paper)
    81: (
        "Given below are half cell reactions: MnO_{4}^{–} + 8H^{+} + 5e^{–} → Mn^{2+} + 4H_{2}O, "
        "E°(MnO_{4}^{–}/Mn^{2+}) = 1.510 V; \\frac{1}{2}O_{2} + 2H^{+} + 2e^{–} → H_{2}O, "
        "E°(O_{2}/H_{2}O) = 1.223 V. Will the permanganate ion, MnO_{4}^{–}, liberate O_{2} from water in the presence of an acid?"
    ),
    # Nernst equation; E°_{cell} = 1.05 V (OCR merged "1.05" -> "10.5")
    93: (
        "Find the emf of the cell in which the following reaction takes place at 298 K: "
        "Ni(s) + 2Ag^{+}(0.001 M) → Ni^{2+}(0.001 M) + 2Ag(s). "
        "Given that E°(cell) = 1.05 V, \\frac{2.303 RT}{F} = 0.059 at 298 K"
    ),
    # ozone reaction 3O₂ ⇌ 2O₃ (coefficients scrambled)
    99: (
        "3O_{2}(g) ⇌ 2O_{3}(g) for the above reaction at 298 K, K_{C} is found to be 3.0 × 10^{–59}. "
        "If the concentration of O_{2} at equilibrium is 0.040 M then concentration of O_{3} in M is"
    ),
}

OPTION_PATCHES = {
    13: {"1": "\\frac{10}{3} m", "2": "\\frac{20}{3} m"},
    17: {"3": "\\frac{2}{3}ν", "4": "\\frac{3}{2}ν"},
    19: {
        "1": "^{23}_{11}Na",
        "2": "^{23}_{10}Ne",
        "3": "^{22}_{10}Ne",
        "4": "^{22}_{12}Mg",
    },
    32: {
        "1": "10^{4} A/m^{2}",
        "2": "10^{6} A/m^{2}",
        "3": "10^{–5} A/m^{2}",
        "4": "10^{5} A/m^{2}",
    },
    39: {"2": "5√3 ms^{–1}"},
    41: {
        "2": "A linearly increasing function of distance r upto the boundary of the wire and then decreasing one with 1/r dependence for the outside region.",
    },
    60: {"1": "ClF_{3}", "2": "IF_{5}", "3": "SF_{4}", "4": "XeF_{2}"},
    65: {
        "1": "zero order (y = concentration and x = time), first order (y = t_{1/2} and x = concentration)",
        "3": "zero order (y = rate and x = concentration), first order (y = t_{1/2} and x = concentration)",
        "4": "zero order (y = rate and x = concentration), first order (y = rate and x = t_{1/2})",
    },
    68: {
        "4": "The shapes of d_{xy}, d_{yz} and d_{zx} orbitals are similar to each other; and d_{x^{2}–y^{2}} and d_{z^{2}} are similar to each other.",
    },
    80: {
        "1": "RCOO^{–}Mg^{+}X",
        "2": "R_{3}CO^{–}Mg^{+}X",
        "3": "RCOO^{–}X^{+}",
        "4": "(RCOO)_{2}Mg",
    },
    81: {
        "1": "Yes, because E°(cell) = +0.287 V",
        "2": "No, because E°(cell) = –0.287 V",
        "3": "Yes, because E°(cell) = +2.733 V",
        "4": "No, because E°(cell) = –2.733 V",
    },
    85: {
        "1": "The bond orders of O_{2}^{+}, O_{2}, O_{2}^{–} and O_{2}^{2–} are 2.5, 2, 1.5 and 1, respectively",
        "2": "C_{2} molecule has four electrons in its two degenerate π molecular orbitals",
        "3": "H_{2}^{+} ion has one electron",
        "4": "O_{2}^{+} ion is diamagnetic",
    },
    128: {"2": "(b), (c), (d) and (e) Only"},
}

# Questions whose options are images (text intentionally empty) — skip.
IMAGE_OPTION_QS = {6, 30, 40, 42, 43, 51, 53, 67, 69, 72, 94, 99, 100}

# Options that are DNA palindromic sequences (5'…3' notation) — must not be
# run through the chemical-formula subscripting.
SKIP_OPTION_QS = {144}


# ──────────────────────────────────────────────────────────────────────────
# 3. Apply
# ──────────────────────────────────────────────────────────────────────────

def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    questions = data["questions"]

    changes = []  # (qnum, field, old, new)

    for q in questions:
        n = q["number"]

        if n in STEM_PATCHES:
            new = STEM_PATCHES[n]
        else:
            new = convert_global(q["text"] or "")
        if new != q["text"]:
            changes.append((n, "stem", q["text"], new))
            q["text"] = new

        if n in IMAGE_OPTION_QS or n in SKIP_OPTION_QS:
            continue
        for opt in q.get("options") or []:
            label = str(opt["label"])
            old = opt.get("text") or ""
            if n in OPTION_PATCHES and label in OPTION_PATCHES[n]:
                new = OPTION_PATCHES[n][label]
            elif old.strip():
                new = convert_global(old)
            else:
                continue
            if new != old:
                changes.append((n, f"opt{label}", old, new))
                opt["text"] = new

    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

    with REPORT.open("w", encoding="utf-8") as f:
        f.write(f"Total changes: {len(changes)}\n")
        for n, field, old, new in changes:
            f.write(f"\n--- Q{n} {field} ---\nOLD: {old}\nNEW: {new}\n")
    print(f"{len(changes)} changes written to {DATA.name}; report at {REPORT.name}")


if __name__ == "__main__":
    main()
