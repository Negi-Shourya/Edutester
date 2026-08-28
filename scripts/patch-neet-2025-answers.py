# One-shot patch for neet-out/2025/questions.json:
#  - verified text/options for math questions (glyph/OCR/web-decoded)
#  - official answers from the paper's ANSWER KEY page (pno 25)
#
# Run:  python -X utf8 scripts/patch-neet-2025-answers.mjs
import fitz, re, json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PATH = 'neet-out/2025/questions.json'

def set_q(qs, num, section, text, options, answers):
    for q in qs:
        if q['number'] == num and q['section'] == section:
            q['text'] = text
            q['options'] = [
                {"label": str(i), "text": t, "image": None}
                for i, t in enumerate(options, start=1)
            ]
            q['answers'] = answers
            return True
    raise SystemExit(f'Q{num} {section} not found')

data = json.load(open(PATH, encoding='utf-8'))
qs = data['questions']

# ---------- Verified question content ----------
set_q(qs, 1, 'PHYSICS',
    "Consider a water tank shown in the figure. It has one wall at x = L and can be taken to be very wide in the z direction. When filled with a liquid of surface tension S and density ρ, the liquid surface makes angle θ₀ (θ₀ << 1) with the x-axis at x = L. If y(x) is the height of the surface then the equation for y(x) is: (take θ(x) = sin θ(x) = tan θ(x) = dy/dx, g is the acceleration due to gravity)",
    ["\\frac{d^2y}{dx^2} = \\frac{\\rho g x}{S}",
     "\\frac{d^2y}{dx^2} = \\frac{\\rho g y}{S}",
     "\\frac{d^2y}{dx^2} = \\frac{\\rho g}{S}",
     "\\frac{dy}{dx} = \\frac{\\rho g x}{S}"],
    ["2"])

set_q(qs, 5, 'PHYSICS',
    "The kinetic energies of two similar cars A and B are 100 J and 225 J respectively. On applying breaks, car A stops after 1000 m and car B stops after 1500 m. If FA and FB are the forces applied by the breaks on cars A and B, respectively, then the ratio FA/FB is",
    ["3/2", "2/3", "1/3", "1/2"],
    ["2"])

set_q(qs, 7, 'PHYSICS',
    "A bob of heavy mass m is suspended by a light string of length l. The bob is given a horizontal velocity v₀ as shown in figure. If the string gets slack at some point P making an angle θ from the horizontal, the ratio of the speed v of the bob at point P to its initial speed v₀ is:",
    ["(\\sin\\theta)^{1/2}",
     "[\\frac{1}{2+3\\sin\\theta}]^{1/2}",
     "[\\frac{\\cos\\theta}{2+3\\sin\\theta}]^{1/2}",
     "[\\frac{\\sin\\theta}{2+3\\sin\\theta}]^{1/2}"],
    ["4"])

set_q(qs, 8, 'PHYSICS',
    "The output (Y) of the given logic implementation is similar to the output of an/a _______ gate.",
    ["AND", "NAND", "OR", "NOR"],
    ["4"])

set_q(qs, 9, 'PHYSICS',
    "The electric field in a plane electromagnetic wave is given by E_{z} = 60 cos (5x + 1.5 \\times 10^{9} t) V/m. Then expression for the corresponding magnetic field is (here subscripts denote the direction of the field):",
    ["B_{y} = 2 \\times 10^{-7} cos (5x + 1.5 \\times 10^{9} t) T",
     "B_{x} = 2 \\times 10^{-7} cos (5x + 1.5 \\times 10^{9} t) T",
     "B_{z} = 60 cos (5x + 1.5 \\times 10^{9} t) T",
     "B_{y} = 60 sin (5x + 1.5 \\times 10^{9} t) T"],
    ["1"])

set_q(qs, 15, 'PHYSICS',
    "In some appropriate units, time (t) and position (x) relation of a moving particle is given by t = x² + x. The acceleration of the particle is",
    ["-\\frac{2}{(x+2)^3}",
     "-\\frac{2}{(2x+1)^3}",
     "\\frac{2}{(x+1)^3}",
     "\\frac{2}{(2x+1)^2}"],
    ["2"])

set_q(qs, 14, 'PHYSICS',
    "An oxygen cylinder of volume 30 litre has 18.20 moles of oxygen. After some oxygen is withdrawn from the cylinder, its gauge pressure drops to 11 atmospheric pressure at temperature 27°C. The mass of the oxygen withdrawn from the cylinder is nearly equal to : [Given, R = 8.3 J mol^{-1} K^{-1}, and molecular mass of O2 = 32, 1 atm pressure = 1.01 \\times 10^{5} N/m^{2}]",
    ["0.125 kg", "0.144 kg", "0.116 kg", "0.156 kg"],
    ["3"])

set_q(qs, 19, 'PHYSICS',
    "Three identical heat conducting rods are connected in series as shown in the figure. The rods on the sides have thermal conductivity 2K while that in the middle has thermal conductivity K. The left end of the combination is maintained at temperature 3T and the right end at T. The rods are thermally insulated from outside. In steady state, temperature at the left junction is T₁ and that at the right junction is T₂. The ratio T₁/T₂ is:",
    ["3/2", "4/3", "5/3", "5/4"],
    ["3"])

set_q(qs, 24, 'PHYSICS',
    "A balloon is made of a material of surface tension S and its inflation outlet (from where gas is filled in it) has small area A. It is filled with a gas of density ρ and takes a spherical shape of radius R. When the gas is allowed to flow freely out of it, its radius r changes from R to 0 (zero) in time T. If the speed v(r) of gas coming out of the balloon depends on r as r^{a} and T ∝ S^{α} A^{β} ρ^{γ} R^{δ}, then",
    ["a = \\frac{1}{2}, \\alpha = \\frac{1}{2}, \\beta = -1, \\gamma = +1, \\delta = \\frac{3}{2}",
     "a = -\\frac{1}{2}, \\alpha = -\\frac{1}{2}, \\beta = -1, \\gamma = -\\frac{1}{2}, \\delta = \\frac{5}{2}",
     "a = -\\frac{1}{2}, \\alpha = -\\frac{1}{2}, \\beta = -1, \\gamma = \\frac{1}{2}, \\delta = \\frac{7}{2}",
     "a = \\frac{1}{2}, \\alpha = \\frac{1}{2}, \\beta = -\\frac{1}{2}, \\gamma = \\frac{1}{2}, \\delta = \\frac{7}{2}"],
    ["3"])

set_q(qs, 28, 'PHYSICS',
    "Two identical charged conducting spheres A and B have their centres separated by a certain distance. Charge on each sphere is q and the force of repulsion between them is F. A third identical uncharged conducting sphere is brought in contact with sphere A first and then with B and finally removed from both. New force of repulsion between spheres A and B (Radii of A and B are negligible compared to the distance of separation so that for calculating force between them they can be considered as point charges) is best given as:",
    ["3F/5", "2F/3", "F/2", "3F/8"],
    ["4"])

set_q(qs, 30, 'PHYSICS',
    "A particle of mass m is moving around the origin with a constant force F pulling it towards the origin. If Bohr model is used to describe its motion, the radius r of the nth orbit and the particle's speed v in the orbit depend on n as",
    ["r \\propto n^{1/3}; v \\propto n^{1/3}",
     "r \\propto n^{1/3}; v \\propto n^{2/3}",
     "r \\propto n^{2/3}; v \\propto n^{1/3}",
     "r \\propto n^{4/3}; v \\propto n^{-1/3}"],
    ["3"])

set_q(qs, 33, 'PHYSICS',
    "A wire of resistance R is cut into 8 equal pieces. From these pieces two equivalent resistances are made by adding four of these together in parallel. Then these two sets are added in series. The net effective resistance of the combination is:",
    ["R/64", "R/32", "R/16", "R/8"],
    ["3"])

set_q(qs, 37, 'PHYSICS',
    "A photon and an electron (mass m) have the same energy E. The ratio (λ_{photon}/λ_{electron}) of their de Broglie wavelengths is (c is the speed of light)",
    ["\\sqrt{\\frac{E}{2m}}",
     "c\\sqrt{2mE}",
     "c\\sqrt{\\frac{2m}{E}}",
     "\\frac{1}{c}\\sqrt{\\frac{E}{2m}}"],
    ["3"])

set_q(qs, 39, 'PHYSICS',
    "A sphere of radius R is cut from a larger solid sphere of radius 2R as shown in the figure. The ratio of the moment of inertia of the smaller sphere to that of the rest part of the sphere about the Y-axis is:",
    ["7/8", "7/40", "7/57", "7/64"],
    ["3"])

set_q(qs, 43, 'PHYSICS',
    "The intensity of transmitted light when a polaroid sheet, placed between two crossed polarization at 22.5° from the polarization axis of one of the polaroid, is (I₀ is the intensity of polarised light after passing through the first polaroid):",
    ["I_0/2", "I_0/4", "I_0/8", "I_0/16"],
    ["3"])

set_q(qs, 44, 'PHYSICS',
    "Two identical point masses P and Q, suspended from two separate massless springs of spring constants k₁ and k₂ respectively, oscillate vertically. If their maximum speeds are the same, the ratio (AQ/AP) of the amplitude AQ of mass Q to the amplitude AP of mass P is:",
    ["k_2/k_1", "k_1/k_2", "\\sqrt{k_2/k_1}", "\\sqrt{k_1/k_2}"],
    ["4"])

set_q(qs, 45, 'PHYSICS',
    "A pipe open at both ends has a fundamental frequency f in air. The pipe is now dipped vertically in a water drum to half of its length. The fundamental frequency of the air column is now equal to:",
    ["f/2", "f", "3f/2", "2f"],
    ["2"])

set_q(qs, 63, 'CHEMISTRY',
    "Out of the following complex compounds, which of the compound will be having the minimum conductance is solution?",
    ["[Co(NH₃)₃Cl₃]", "[Co(NH₃)₄Cl₂]", "[Co(NH₃)₆]Cl₃", "[Co(NH₃)₅Cl]Cl"],
    ["1", "2"])

set_q(qs, 117, 'BIOLOGY',
    "Name the class of enzyme that usually catalyze the following reaction: S − G + S^{*} → S + S^{*} − G Where, G → a group other than hydrogen S^{*}",
    ["Hydrolase", "Lyase", "Transferase", "Ligase"],
    ["3"])

set_q(qs, 132, 'BIOLOGY',
    "Each of the following characteristics represent a Kingdom proposed by Whittaker. Arrange the following in increasing order of complexity of body organization.\nA. Multicellular heterotrophs with cell wall made of chitin.\nB. Heterotrophs with tissue/organ/organ system level of body organization.\nC. Prokaryotes with cell wall made of polysaccharides and amino acids.\nD. Eukaryotic autotrophs with tissue/organ level of body organization.\nE. Eukaryotes with cellular body organization.",
    ["A, C, E, B, D", "C, E, A, D, B", "A, C, E, D, B", "C, E, A, B, D"],
    ["2"])

set_q(qs, 180, 'BIOLOGY',
    "Which one of the following equations represents the Verhulst-Pearl Logistic Growth of population?",
    ["dN/dt = r(K−N)/K", "dN/dt = rN(K−N)/K", "dN/dt = rN(N−K)/N", "dN/dt = N(r−K)/K"],
    ["2"])

# ---------- Official answers from ANSWER KEY page (pno 25) ----------
doc = fitz.open('neet/2025 Neet.pdf')
p = doc[25]
d = p.get_text('rawdict', clip=fitz.Rect(40, 80, 585, 838))
rows = {}
for b in d['blocks']:
    if b['type'] != 0:
        continue
    for l in b['lines']:
        for s in l['spans']:
            for ch in s['chars']:
                r = ch['bbox']
                y = round(r[1] / 6) * 6
                rows.setdefault(y, []).append((round(r[0]), ch['c']))
key = {}
for y in sorted(rows):
    chars = sorted(rows[y])
    text = ''.join(c for _, c in chars)
    for n, a in re.findall(r'(\d{1,3})\.\s*\(([0-9,]+)\)', text):
        key[int(n)] = [x for x in a.split(',')]
assert len(key) == 180, f'key parse incomplete: {len(key)}'

for q in qs:
    q['answers'] = key[q['number']]

json.dump(data, open(PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('patched OK; total questions:', len(qs))
