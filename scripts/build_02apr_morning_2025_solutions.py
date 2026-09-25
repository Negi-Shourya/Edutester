# Python script to build solutions-02-apr-morning-2025.json
import json

solutions = {}

# ==============================================================================
# CHEMISTRY (IDs 31698 - 31722)
# ==============================================================================

solutions["31698"] = """Applying Huckel's rule of aromaticity (planar, fully conjugated cyclic system with 4n + 2 \\pi-electrons):
- (a) Cyclopentadienyl anion: 6 \\pi-electrons (4(1) + 2), cyclic, planar \\implies Aromatic
- (b) Cyclopentadienyl cation: 4 \\pi-electrons (4n), anti-aromatic \\implies Not aromatic
- (c) Cyclobutenediyl dication: 2 \\pi-electrons (4(0) + 2), cyclic, planar \\implies Aromatic
- (d) Cyclobutenediyl dianion: 6 \\pi-electrons (4(1) + 2), cyclic, planar \\implies Aromatic
- (e) Tropylium cation: 6 \\pi-electrons (4(1) + 2), cyclic, planar \\implies Aromatic
- (f) Cyclooctatetraene: non-planar tub conformation (8 \\pi-electrons) \\implies Not aromatic
- (g) Cyclobutadiene: 4 \\pi-electrons (4n), planar, anti-aromatic \\implies Not aromatic
- (h) Cyclopropenyl cation: 2 \\pi-electrons (4(0) + 2), cyclic, planar \\implies Aromatic
Hence, compounds a, c, d, e, h are aromatic, while b, f, g are not aromatic → (D)"""

solutions["31699"] = """Compound [A] is optically active 2-bromobutane (\\text{CH}_3-\\text{CH(Br)}-\\text{CH}_2-\\text{CH}_3).
Dehydrohalogenation of [A] with hot alcoholic KOH follows Saytzeff elimination to yield but-2-ene [B] as major product.
Electrophilic addition of \\text{Br}_2 across the double bond of [B] gives vicinal dibromide [C]: 2,3-dibromobutane.
Double dehydrohalogenation of [C] with alcoholic \\text{NaNH}_2 converts it into terminal alkyne gas [D]: but-1-yne.
Hydration of but-1-yne (1 mole reacts with 18 g = 1 mole \\text{H}_2\\text{O}) via Kucherov reaction with \\text{HgSO}_4 / \\text{H}_2\\text{SO}_4 at 333 K yields an unstable enol that tautomerizes to butan-2-one [E].
Therefore, the IUPAC name of compound [E] is butan-2-one → (C)"""

solutions["31700"] = """Examining periodic trends for the first four halogens (F, Cl, Br, I):
- (A) Covalent radius: increases regularly down the group (F < Cl < Br < I).
- (B) Electron affinity: follows an irregular order Cl > F > Br > I because the small, compact 2p-subshell of fluorine causes intense inter-electronic repulsion, reducing its incoming electron acceptance compared to chlorine.
- (C) Ionic radius: increases regularly down the group (\\text{F}^- < \\text{Cl}^- < \\text{Br}^- < \\text{I}^-).
- (D) First ionization energy: decreases regularly down the group (F > Cl > Br > I) due to increasing atomic size and shielding.
Therefore, only electron affinity (B) shows an irregularity → (C)"""

solutions["31701"] = """According to Henry's law, the solubility of a gas in a liquid is governed by p = K_H \\times x.
Dissolution of gases in water is an exothermic process (\\Delta H_{\\text{sol}} < 0); hence by Le Chatelier's principle, solubility decreases with temperature, causing Henry's law constant K_H to increase with temperature.
Helium (\\text{He}) has extremely weak dispersion forces with water molecules and exhibits the lowest solubility among the gases, giving it the highest K_H value at all temperatures.
Nitrogen (\\text{N}_2) is moderately soluble, while methane (\\text{CH}_4) exhibits higher solubility due to greater polarizability, resulting in the lowest K_H.
The correct hierarchy at any given temperature is K_H(\\text{He}) > K_H(\\text{N}_2) > K_H(\\text{CH}_4), which corresponds to Option 4 → (D)"""

solutions["31702"] = """In Bohr's atomic model for hydrogen, the radius of the n^{\\text{th}} orbit is given by r_n = a_0 n^2, where a_0 = 0.529 \\text{ \\AA}.
Thus the radius is directly proportional to the square of the principal quantum number: r_n \\propto n^2.
Evaluating each statement:
- (A) \\frac{r_3}{r_1} = \\frac{3^2}{1^2} = 9 (correct)
- (B) \\frac{r_8}{r_4} = \\frac{8^2}{4^2} = \\frac{64}{16} = 4 (correct)
- (C) \\frac{r_6}{r_4} = \\frac{6^2}{4^2} = \\frac{36}{16} = 2.25 \\ne 3 (incorrect statement)
- (D) \\frac{r_4}{r_2} = \\frac{4^2}{2^2} = \\frac{16}{4} = 4 (correct)
Hence, statement C is the incorrect statement → (C)"""

solutions["31703"] = """The gas in vessel A expands into vessel B immersed in a water bath at constant temperature (\\Delta T = 0).
Since the thermometer detects no change in temperature, the process is isothermal: \\Delta T = 0, so heat exchange q = 0.
For an ideal gas, internal energy depends solely on temperature, giving \\Delta U = n C_v \\Delta T = 0.
According to the First Law of Thermodynamics, \\Delta U = q + w = 0, which requires expansion work w = 0.
Because boundary work w = -\\int P_{\\text{ext}} dV = 0 during expansion (\\Delta V > 0), the external opposing pressure must be zero (P_{\\text{ext}} = 0).
This free expansion occurs only when the gas expands into an evacuated container, meaning the initial pressure in vessel B was zero → (D)"""

solutions["31704"] = """Total moles in solution = 1 mole A + 3 moles B = 4 moles.
Mole fractions are X_A = \\frac{1}{4} = 0.25 and X_B = \\frac{3}{4} = 0.75.
Using Raoult's law for an ideal binary solution: P_T = P_A^\\circ X_A + P_B^\\circ X_B.
Substitute the given values (P_T = 500\\text{ mm Hg}, P_A^\\circ = 200\\text{ mm Hg}):
500 = 200(0.25) + P_B^\\circ(0.75) \\implies 500 = 50 + 0.75 P_B^\\circ.
0.75 P_B^\\circ = 450 \\implies P_B^\\circ = \\frac{450}{0.75} = 600\\text{ mm Hg}.
Comparing vapor pressures of the pure liquids: P_A^\\circ (200\\text{ mm Hg}) < P_B^\\circ (600\\text{ mm Hg}).
The liquid with lower pure vapor pressure has stronger intermolecular forces and evaporates less readily, making A the least volatile component.
Thus, the vapor pressure of pure B is 600 mm Hg and the least volatile component is A → (D)"""

solutions["31705"] = """Reaction: \\text{CaCO}_3\\text{(s)} + 2\\text{HCl(aq)} \\rightarrow \\text{CaCl}_2\\text{(aq)} + \\text{CO}_2\\text{(g)} + \\text{H}_2\\text{O(l)}.
Molar mass of \\text{CaCO}_3 = 40 + 12 + 3(16) = 100\\text{ g mol}^{-1}.
Moles of \\text{CaCO}_3 available = \\frac{1000\\text{ g}}{100\\text{ g mol}^{-1}} = 10\\text{ mol}.
Moles of HCl available = Molarity \\times Volume = 0.76\\text{ M} \\times 0.250\\text{ L} = 0.19\\text{ mol}.
Stoichiometry requires 2 moles of HCl per 1 mole of \\text{CaCO}_3; hence 10 moles of \\text{CaCO}_3 requires 20 moles of HCl.
HCl is in deficit and acts as the limiting reagent.
Moles of \\text{CaCl}_2 produced = \\frac{1}{2} \\times \\text{moles of HCl} = \\frac{0.19}{2} = 0.095\\text{ mol}.
Molar mass of \\text{CaCl}_2 = 40 + 2(35.5) = 111\\text{ g mol}^{-1}.
Mass of \\text{CaCl}_2 formed = 0.095\\text{ mol} \\times 111\\text{ g mol}^{-1} = 10.545\\text{ g} → (C)"""

solutions["31706"] = """When equal volumes of two solutions are mixed, the total volume doubles, halving each ionic concentration:
[\\text{A}^{2+}] = \\frac{[\\text{AB}_2]_0}{2}, \\quad [\\text{Y}^-] = \\frac{[\\text{XY}]_0}{2}.
Precipitation of salt \\text{AY}_2 occurs if ionic product Q_{sp} = [\\text{A}^{2+}][\\text{Y}^-]^2 > K_{sp} = 5.2 \\times 10^{-7}.
Evaluating Option C:
[\\text{AB}_2]_0 = 2.0 \\times 10^{-2}\\text{ M} \\implies [\\text{A}^{2+}] = 1.0 \\times 10^{-2}\\text{ M}.
[\\text{XY}]_0 = 2.0 \\times 10^{-2}\\text{ M} \\implies [\\text{Y}^-] = 1.0 \\times 10^{-2}\\text{ M}.
Ionic product: Q_{sp} = (1.0 \\times 10^{-2})(1.0 \\times 10^{-2})^2 = 1.0 \\times 10^{-6}.
Since Q_{sp} = 1.0 \\times 10^{-6} > 5.2 \\times 10^{-7} = K_{sp}, precipitation will occur in combination C → (C)"""

solutions["31707"] = """Determine the number of lone pairs on the central atom and molecular dipole moment:
- \\text{XeF}_2: 2 bond pairs + 3 lone pairs (linear, symmetrical, \\mu = 0)
- \\text{ClF}_3: 3 bond pairs + 2 lone pairs (T-shaped, asymmetrical, \\mu \\ne 0)
- \\text{SF}_4: 4 bond pairs + 1 lone pair (see-saw, asymmetrical, \\mu \\ne 0)
- \\text{SO}_2: 2 bond pairs + 1 lone pair (bent, \\mu \\ne 0)
- \\text{NF}_3, \\text{NH}_3: 3 bond pairs + 1 lone pair (trigonal pyramidal, \\mu \\ne 0)
Among candidates with a non-zero dipole moment (\\mu \\ne 0), \\text{ClF}_3 possesses the highest number of lone pairs on the central Cl atom (2 lone pairs).
Steric number of Cl in \\text{ClF}_3 = 3 \\text{ (bond pairs)} + 2 \\text{ (lone pairs)} = 5.
Steric number 5 corresponds to \\text{sp}^3\\text{d} hybridization → (D)"""

solutions["31708"] = """Vanillin (4-hydroxy-3-methoxybenzaldehyde) has both a phenolic -OH group and an aldehyde -CHO group.
Statement (I) is correct: The acidic phenolic -OH reacts with aqueous \\text{NaOH} to form a water-soluble phenolate salt, while the aldehyde group readily reduces Tollens' reagent to give a silver mirror.
Statement (II) is incorrect: Vanillin lacks any \\alpha-hydrogen atoms attached to the carbonyl group.
Self-aldol condensation requires an enolizable \\alpha-hydrogen to form a carbanion/enolate nucleophile; therefore, vanillin cannot undergo self-aldol condensation.
Hence, Statement I is correct but Statement II is incorrect → (B)"""

solutions["31709"] = """Evaluating each statement regarding amino acids:
- (A) Incorrect: Threonine and isoleucine each contain two chiral carbons; glycine contains none.
- (B) Incorrect: Glycine has two hydrogen atoms on its \\alpha-carbon and is optically inactive.
- (C) Incorrect: Both aspartic acid (-\\text{CH}_2\\text{COOH}) and glutamic acid (-\\text{CH}_2\\text{CH}_2\\text{COOH}) possess a carboxylic acid side chain.
- (D) Correct: Cysteine contains a reactive sulfhydryl/thiol group (-SH) on its side chain.
Under mild oxidizing conditions, two cysteine molecules undergo oxidative coupling to form a covalent disulfide linkage (-S-S-), dimerizing into cystine.
Therefore, statement D is correct → (D)"""

solutions["31710"] = """In aqueous solution, the basicity of ethyl-substituted aliphatic amines depends on the combined effects of the inductive (+I) effect, steric hindrance, and hydration stabilization of the conjugate cation.
The resulting basicity order for ethyl-substituted amines is secondary > tertiary > primary:
(\\text{CH}_3\\text{CH}_2)_2\\text{NH} > (\\text{CH}_3\\text{CH}_2)_3\\text{N} > \\text{CH}_3\\text{CH}_2\\text{NH}_2.
Aliphatic primary amines are stronger bases than ammonia (\\text{NH}_3) due to the electron-donating ethyl group.
Hydrazine (\\text{H}_2\\text{N-NH}_2) is weaker than ammonia because the electronegative adjacent nitrogen atom exerts an electron-withdrawing -I effect, destabilizing the protonated form.
Thus the correct ascending order of basic strength is:
\\text{NH}_2-\\text{NH}_2 < \\text{NH}_3 < \\text{CH}_3\\text{CH}_2\\text{NH}_2 < (\\text{CH}_3\\text{CH}_2)_3\\text{N} < (\\text{CH}_3\\text{CH}_2)_2\\text{NH} → (D)"""

solutions["31711"] = """Analyzing the periodic trends for group 13 elements Al and Ga:
Statement (I) is incorrect: The metallic radius of Al (143 pm) is greater than that of Ga (135 pm).
Gallium follows the 3d transition series, where the 10 intervening 3d electrons offer poor shielding of the +10 increased nuclear charge, causing d-block contraction that pulls valence electrons tighter and reduces the atomic/metallic radius of Ga below Al.
Statement (II) is correct: For trivalent cations, \\text{Al}^{3+} has an ionic radius of 53.5 pm, while \\text{Ga}^{3+} has an ionic radius of 62.0 pm.
The removal of valence electrons restores the normal group trend of increasing ionic radius down the group.
Hence, Statement I is incorrect but Statement II is correct → (B)"""

solutions["31712"] = """According to Crystal Field Theory:
Statement (I) is correct: In octahedral complexes, when crystal field splitting \\Delta_o < P (pairing energy), electrons occupy higher e_g orbitals with parallel spins to avoid pairing energy, forming high-spin complexes; when \\Delta_o > P, electrons pair up in the lower t_{2g} orbitals, giving low-spin complexes.
Statement (II) is correct: In tetrahedral complexes, crystal field splitting is intrinsically small (\\Delta_t \\approx \\frac{4}{9}\\Delta_o).
Because \\Delta_t is almost always smaller than pairing energy P (\\Delta_t < P), the splitting energy cannot overcome the electron-electron pairing repulsion, so low-spin tetrahedral complexes are rarely formed.
Therefore, both Statement I and Statement II are correct → (D)"""

solutions["31713"] = """Examining qualitative chemical tests with potassium ferrocyanide \\text{K}_4[\\text{Fe(CN)}_6]:
- (A) \\text{Cu}^{2+} reacts with [\\text{Fe(CN)}_6]^{4-} in acetic acid to precipitate chocolate brown cupric ferrocyanide \\text{Cu}_2[\\text{Fe(CN)}_6] (correct).
- (B) \\text{Fe}^{3+} reacts with [\\text{Fe(CN)}_6]^{4-} to precipitate Prussian blue ferric ferrocyanide \\text{Fe}_4[\\text{Fe(CN)}_6]_3 (correct).
- (C) \\text{Zn}^{2+} reacts with [\\text{Fe(CN)}_6]^{4-} in neutral/ammoniacal medium to precipitate white or bluish-white \\text{K}_2\\text{Zn}_3[\\text{Fe(CN)}_6]_2 (correct).
- (D) \\text{Mg}^{2+} does not form a blue precipitate with ferrocyanide (incorrect).
- (E) \\text{Ba}^{2+} does not yield a characteristic white precipitate under these conditions (incorrect).
Hence, tests A, B, and C only are correct → (C)"""

solutions["31714"] = """Mass of organic compound X = 1.0 g.
Mass of carbon in 1.46 g \\text{CO}_2:
m_C = \\frac{12}{44} \\times 1.46 = 0.3982\\text{ g} \\implies n_C = \\frac{0.3982}{12} = 0.03318\\text{ mol}.
Mass of hydrogen in 0.567 g \\text{H}_2\\text{O}:
m_H = \\frac{2}{18} \\times 0.567 = 0.0630\\text{ g} \\implies n_H = \\frac{0.0630}{1} = 0.0630\\text{ mol}.
Mass of oxygen:
m_O = 1.0 - (0.3982 + 0.0630) = 0.5388\\text{ g} \\implies n_O = \\frac{0.5388}{16} = 0.03368\\text{ mol}.
Dividing each mole amount by the smallest value (0.03318):
C : H : O = \\frac{0.03318}{0.03318} : \\frac{0.0630}{0.03318} : \\frac{0.03368}{0.03318} \\approx 1 : 1.90 : 1.01 \\approx 1 : 2 : 1.
The empirical formula is \\text{CH}_2\\text{O}.
Empirical formula mass = 12 + 2(1) + 16 = 30\\text{ g} → (A)"""

solutions["31715"] = """The compound is \\text{H}-\\overset{\\text{I}}{\\text{C}}\\equiv\\text{C}-\\overset{\\text{II}}{\\text{CH}}_2-\\overset{\\text{III}}{\\text{CH}}(\\text{CH}_3)-\\overset{\\text{IV}}{\\text{CH}}_3.
Radical at C-II: Homolytic cleavage at C-II produces a propargylic radical (\\text{H}-\\text{C}\\equiv\\text{C}-\\dot{\\text{C}}\\text{H}-), which is strongly stabilized by resonance delocalization with the adjacent alkyne \\pi-bond, making it the most stable radical.
Radical at C-I: Cleavage of the terminal C-H bond leaves an unpaired electron on an sp-hybridized carbon atom.
Due to high s-character (50%) and high electronegativity, the sp orbital holds electrons very tightly and cannot stabilize an unpaired radical electron, making it extremely unstable (least stable).
Radicals at C-III (3^\\circ alkyl) and C-IV (1^\\circ alkyl) are intermediate in stability.
Thus, the most stable and least stable radicals are formed at II and I, respectively → (D)"""

solutions["31716"] = """The rate of nucleophilic acyl substitution depends on the leaving group ability of the departing group (weaker base = better leaving group) and carbonyl electrophilicity:
- (p) Acyl chloride: \\text{Cl}^- is the conjugate base of strong acid HCl, making it the weakest base and best leaving group (fastest hydrolysis).
- (q) Acid anhydride: carboxylate ion (\\text{CH}_3\\text{COO}^-) is stabilized by resonance and acts as a good leaving group.
- (r) Ester: alkoxide ion (\\text{CH}_3\\text{CH}_2\\text{O}^-) is a strong base and poor leaving group.
- (s) Amide: amide ion (\\text{NH}_2^-) is an extremely strong base and very poor leaving group, and strong resonance donation from nitrogen deactivates the carbonyl (slowest hydrolysis).
Therefore, the rate of hydrolysis follows the decreasing order: p > q > r > s → (D)"""

solutions["31717"] = """Identify elements A, X, and Y from the p-block:
- Element A: Xe (Xenon) is the rarest, monoatomic, non-radioactive noble gas in Group 18 with the lowest ionization enthalpy among A, X, and Y.
- Elements X and Y: Fluorine (F) has the highest electronegativity (4.0), and Oxygen (O) has the second highest (3.5).
The molecule \\text{AX}_4\\text{Y} is \\text{XeOF}_4 (xenon oxytetrafluoride).
Central atom Xe has 8 valence electrons: forms 1 \\text{Xe}=\\text{O} double bond (1 \\sigma + 1 \\pi) and 4 \\text{Xe}-\\text{F} single bonds (4 \\sigma), using 6 electrons and leaving 1 lone pair (2 electrons).
Steric number = 5 \\sigma\\text{-bonds} + 1\\text{ lone pair} = 6 (\\text{sp}^3\\text{d}^2 hybridization).
Octahedral electron geometry with one axial position occupied by a lone pair gives a square pyramidal molecular shape → (A)"""

solutions["31718"] = """Standard reduction potentials E^\\circ(\\text{M}^{3+}/\\text{M}^{2+}) for first-row transition metals:
Cr (-0.41 V), Mn (+1.57 V), Fe (+0.77 V), Co (+1.97 V).
Cobalt has the highest standard electrode potential E^\\circ(\\text{Co}^{3+}/\\text{Co}^{2+}) = +1.97\\text{ V}.
The complex is [\\text{M(CN)}_6]^{4-} \\implies [\\text{Co(CN)}_6]^{4-}.
Oxidation state of Co is x + 6(-1) = -4 \\implies x = +2, so the ion is \\text{Co}^{2+}.
Electronic configuration of \\text{Co}^{2+} is [Ar] 3\\text{d}^7.
Cyanide (\\text{CN}^-) is a strong field ligand, producing a large octahedral crystal field splitting (\\Delta_o > P).
The 7 d-electrons pair up in lower energy orbitals: 6 electrons fill the \\text{t}_{2g} set and 1 electron occupies the higher \\text{e}_g set (configuration \\text{t}_{2g}^6 \\text{e}_g^1).
Thus, the number of electrons present in the \\text{e}_g orbital is 1 → (1)"""

solutions["31719"] = """Cell reaction: \\text{QH}_2 + 2\\text{Ag}^+ \\rightarrow \\text{Q} + 2\\text{Ag} + 2\\text{H}^+.
Standard cell potential:
E^\\circ_{\\text{cell}} = E^\\circ_{\\text{Ag}^+/\\text{Ag}} - E^\\circ_{\\text{Q/QH}_2} = 0.80 - 0.70 = 0.10\\text{ V}.
Using the Nernst equation with [\\text{Ag}^+] = 1\\text{ M}:
E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.06}{2} \\log[\\text{H}^+]^2 = 0.10 - 0.06 \\log[\\text{H}^+] = 0.10 + 0.06\\text{ pH}.
Given E_{\\text{cell}} = 0.40\\text{ V}:
0.40 = 0.10 + 0.06\\text{ pH} \\implies 0.06\\text{ pH} = 0.30 \\implies \\text{pH} = 5.
For a salt of a weak base and strong acid (\\text{NH}_4\\text{X}):
\\text{pH} = 7 - \\frac{1}{2}\\text{pK}_b - \\frac{1}{2}\\log C.
Given C = 0.01\\text{ M} = 10^{-2}\\text{ M} \\implies \\log C = -2:
5 = 7 - \\frac{1}{2}\\text{pK}_b - \\frac{1}{2}(-2) = 7 - \\frac{1}{2}\\text{pK}_b + 1 = 8 - \\frac{1}{2}\\text{pK}_b.
\\frac{1}{2}\\text{pK}_b = 8 - 5 = 3 \\implies \\text{pK}_b = 6 → (6)"""

solutions["31720"] = """Compound P is an Idoxuridine analog with molecular formula \\text{C}_9\\text{H}_{10}\\text{FIN}_2\\text{O}_4.
Calculating molar mass from the given atomic weights:
- Carbon: 9 \\times 12 = 108\\text{ g mol}^{-1}
- Hydrogen: 10 \\times 1 = 10\\text{ g mol}^{-1}
- Fluorine: 1 \\times 19 = 19\\text{ g mol}^{-1}
- Iodine: 1 \\times 127 = 127\\text{ g mol}^{-1}
- Nitrogen: 2 \\times 14 = 28\\text{ g mol}^{-1}
- Oxygen: 4 \\times 16 = 64\\text{ g mol}^{-1}
Total molar mass M = 108 + 10 + 19 + 127 + 28 + 64 = 372\\text{ g mol}^{-1}.
Mass of 0.1 mol of compound P:
m = n \\times M = 0.1\\text{ mol} \\times 372\\text{ g mol}^{-1} = 37.2\\text{ g}.
Writing in the required format: 37.2\\text{ g} = 372 \\times 10^{-1}\\text{ g}.
Therefore, the value is 372 → (372)"""

solutions["31721"] = """Total pressure P = 5 bar, Volume V = 2 dm^3, Temperature T = 500 K.
Using ideal gas equation, total moles at equilibrium:
n_{\\text{total}} = \\frac{P V}{R T} = \\frac{5 \\times 2}{0.08 \\times 500} = \\frac{10}{40} = 0.25\\text{ mol}.
For equilibrium: \\text{CO(g)} + 2\\text{H}_2\\text{(g)} \\rightleftharpoons \\text{CH}_3\\text{OH(g)}.
At equilibrium, moles of methanol formed = 0.04 mol:
n_{\\text{CH}_3\\text{OH}} = 0.04\\text{ mol}.
n_{\\text{CO}} = 0.1 - 0.04 = 0.06\\text{ mol}.
Moles of \\text{H}_2: n_{\\text{H}_2} = n_{\\text{total}} - (n_{\\text{CO}} + n_{\\text{CH}_3\\text{OH}}) = 0.25 - (0.06 + 0.04) = 0.15\\text{ mol}.
Partial pressures:
p_{\\text{CH}_3\\text{OH}} = \\frac{0.04}{0.25} \\times 5 = 0.8\\text{ bar}, \\quad p_{\\text{CO}} = \\frac{0.06}{0.25} \\times 5 = 1.2\\text{ bar}, \\quad p_{\\text{H}_2} = \\frac{0.15}{0.25} \\times 5 = 3.0\\text{ bar}.
Equilibrium constant K_p:
K_p = \\frac{p_{\\text{CH}_3\\text{OH}}}{p_{\\text{CO}} \\times (p_{\\text{H}_2})^2} = \\frac{0.8}{1.2 \\times 3.0^2} = \\frac{0.8}{10.8} = \\frac{2}{27} \\approx 0.07407\\text{ bar}^{-2}.
Writing as an integer multiple of 10^{-3}: 0.07407 = 74.07 \\times 10^{-3} \\approx 74 \\times 10^{-3} → (74)"""

solutions["31722"] = """For reaction \\text{A} \\rightarrow \\text{products}, the half-life t_{1/2} is directly proportional to initial concentration [A]_0, which is the defining characteristic of a zero-order reaction:
t_{1/2} = \\frac{[A]_0}{2k}.
The slope of the t_{1/2} versus [A]_0 line is \\frac{1}{2k} = 76.92\\text{ min L mol}^{-1}.
Solving for the zero-order rate constant k:
k = \\frac{1}{2 \\times 76.92} = \\frac{1}{153.84} \\approx 6.5002 \\times 10^{-3}\\text{ mol L}^{-1}\\text{min}^{-1}.
Integrated rate equation for zero-order kinetics:
[A]_t = [A]_0 - k t.
Substituting [A]_0 = 2.5\\text{ mol L}^{-1} and t = 10\\text{ min}:
[A]_{10} = 2.5 - (6.5002 \\times 10^{-3} \\times 10) = 2.5 - 0.065002 = 2.434998\\text{ mol L}^{-1}.
Expressing in units of 10^{-3}\\text{ mol L}^{-1}:
[A]_{10} = 2434.998 \\times 10^{-3}\\text{ mol L}^{-1} \\approx 2435 \\times 10^{-3}\\text{ mol L}^{-1} → (2435)"""

# ==============================================================================
# MATHEMATICS (IDs 31723 - 31747)
# ==============================================================================

solutions["31723"] = """The exponent of a prime p in n! is given by Legendre's formula:
E_p(n!) = \\sum_{k=1}^\\infty \\left\\lfloor \\frac{n}{p^k} \\right\\rfloor.
For prime p = 3 and n = 50:
\\left\\lfloor \\frac{50}{3} \\right\\rfloor = 16,
\\quad \\left\\lfloor \\frac{50}{9} \\right\\rfloor = 5,
\\quad \\left\\lfloor \\frac{50}{27} \\right\\rfloor = 1,
\\quad \\left\\lfloor \\frac{50}{81} \\right\\rfloor = 0.
Summing these quotient terms:
E_3(50!) = 16 + 5 + 1 + 0 = 22.
Therefore, the largest natural number n such that 3^n divides 50! is 22 → (B)"""

solutions["31724"] = """For the hyperbola \\text{H} : \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1:
The coordinates of the focus are (a e, 0) = (\\sqrt{10}, 0) \\implies a e = \\sqrt{10}.
The equation of the corresponding directrix is x = \\frac{a}{e} = \\frac{9}{\\sqrt{10}}.
Multiplying the focal distance by the directrix position:
(a e) \\times \\left(\\frac{a}{e}\\right) = a^2 = \\sqrt{10} \\times \\frac{9}{\\sqrt{10}} = 9 \\implies a = 3.
The eccentricity is e = \\frac{a e}{a} = \\frac{\\sqrt{10}}{3}.
Using the hyperbola eccentricity relation b^2 = a^2(e^2 - 1):
b^2 = 9\\left(\\frac{10}{9} - 1\\right) = 9 \\times \\frac{1}{9} = 1.
The length of the latus rectum is l = \\frac{2 b^2}{a} = \\frac{2(1)}{3} = \\frac{2}{3}.
Now evaluating 9(e^2 + l):
9(e^2 + l) = 9\\left(\\frac{10}{9} + \\frac{2}{3}\\right) = 10 + 6 = 16 → (C)"""

solutions["31725"] = """The sequence has 10 terms chosen from \\left\\{ 0, 1, 2 \\right\\}.
It must contain exactly five 1s, exactly three 2s, and the remaining 10 - (5 + 3) = 2 positions must be filled with 0s.
The total number of such sequences is the multinomial coefficient for permuting 10 objects with frequencies 5, 3, and 2:
N = \\frac{10!}{5! \\times 3! \\times 2!}.
Evaluating factorials:
10! = 3628800, \\quad 5! = 120, \\quad 3! = 6, \\quad 2! = 2.
Denominator = 120 \\times 6 \\times 2 = 1440.
N = \\frac{3628800}{1440} = 2520.
Alternatively, choosing positions sequentially: {}^{10}C_5 \\times {}^5C_3 \\times {}^2C_2 = 252 \\times 10 \\times 1 = 2520 → (C)"""

solutions["31726"] = """Rearranging the given functional equation:
\\frac{f(2x + 2y) - f(2x - 2y)}{f(2x + 2y) + f(2x - 2y)} = \\frac{\\cos x \\sin y}{\\sin x \\cos y}.
Applying componendo and dividendo:
\\frac{f(2x + 2y)}{f(2x - 2y)} = \\frac{\\sin x \\cos y + \\cos x \\sin y}{\\sin x \\cos y - \\cos x \\sin y} = \\frac{\\sin(x + y)}{\\sin(x - y)}.
Letting u = x + y and v = x - y yields:
\\frac{f(2u)}{\\sin u} = \\frac{f(2v)}{\\sin v} = k \\text{ (a constant)}.
Thus f(2u) = k \\sin u, which gives f(t) = k \\sin(t / 2).
Differentiating: f'(t) = \\frac{k}{2} \\cos(t / 2).
Given f'(0) = \\frac{1}{2} \\implies \\frac{k}{2} \\cos 0 = \\frac{1}{2} \\implies k = 1.
Hence f(t) = \\sin(t / 2).
Second derivative: f''(t) = -\\frac{1}{4} \\sin(t / 2).
Evaluating at t = \\frac{5\\pi}{3}:
f''\\left(\\frac{5\\pi}{3}\\right) = -\\frac{1}{4} \\sin\\left(\\frac{5\\pi}{6}\\right) = -\\frac{1}{4} \\times \\frac{1}{2} = -\\frac{1}{8}.
Therefore: 24 f''\\left(\\frac{5\\pi}{3}\\right) = 24 \\left(-\\frac{1}{8}\\right) = -3 → (B)"""

solutions["31727"] = """Given matrix A = [[\\alpha, -1], [6, \\beta]] with \\det(A) = 0 and \\alpha + \\beta = 1, \\alpha > 0.
Determinant: \\det(A) = \\alpha\\beta - (-6) = \\alpha\\beta + 6 = 0 \\implies \\alpha\\beta = -6.
The values of \\alpha and \\beta are roots of t^2 - t - 6 = 0 \\implies (t - 3)(t + 2) = 0.
Since \\alpha > 0, we have \\alpha = 3 and \\beta = -2.
Matrix A = [[3, -1], [6, -2]].
Trace of A = 3 + (-2) = 1.
By the Cayley-Hamilton theorem, A^2 - (\\text{tr } A) A + (\\det A) I = 0 \\implies A^2 - A = 0 \\implies A^2 = A (idempotent).
Since A is idempotent, A^k = A for all k \\ge 1.
Expanding (I + A)^8 via binomial expansion:
(I + A)^8 = I + \\sum_{k=1}^8 {}^8C_k A^k = I + (2^8 - 1) A = I + 255 A.
Calculating the entries:
I + 255 A = [[1 + 255(3), 255(-1)], [255(6), 1 + 255(-2)]] = [[1 + 765, -255], [1530, 1 - 510]] = [[766, -255], [1530, -509]] → (D)"""

solutions["31728"] = """Simplify the algebraic fractions inside the brackets for x > 1:
First term: using sum of cubes (x + 1) = ((x^{1/3})^3 + 1) = (x^{1/3} + 1)(x^{2/3} - x^{1/3} + 1):
\\frac{x + 1}{x^{2/3} - x^{1/3} + 1} = x^{1/3} + 1.
Second term: factoring numerator and denominator:
\\frac{x - 1}{x - x^{1/2}} = \\frac{(\\sqrt{x} - 1)(\\sqrt{x} + 1)}{\\sqrt{x}(\\sqrt{x} - 1)} = \\frac{\\sqrt{x} + 1}{\\sqrt{x}} = 1 + x^{-1/2}.
Subtracting the two terms:
(x^{1/3} + 1) - (1 + x^{-1/2}) = x^{1/3} - x^{-1/2}.
The general term in the binomial expansion of (x^{1/3} - x^{-1/2})^{10} is:
T_{r+1} = {}^{10}C_r (x^{1/3})^{10-r} (-x^{-1/2})^r = (-1)^r {}^{10}C_r x^{\\frac{10-r}{3} - \\frac{r}{2}}.
For the term independent of x:
\\frac{10 - r}{3} - \\frac{r}{2} = 0 \\implies 2(10 - r) - 3r = 0 \\implies 20 - 5r = 0 \\implies r = 4.
Evaluating the coefficient:
T_5 = (-1)^4 {}^{10}C_4 = \\frac{10 \\times 9 \\times 8 \\times 7}{4 \\times 3 \\times 2 \\times 1} = 210 → (A)"""

solutions["31729"] = """The given trigonometric equation is 2\\sqrt{2}\\cos^2\\theta + (2 - \\sqrt{6})\\cos\\theta - \\sqrt{3} = 0 for \\theta \\in [-2\\pi, 2\\pi].
Splitting the middle term:
2\\sqrt{2}\\cos^2\\theta + 2\\cos\\theta - \\sqrt{6}\\cos\\theta - \\sqrt{3} = 0
2\\cos\\theta(\\sqrt{2}\\cos\\theta + 1) - \\sqrt{3}(\\sqrt{2}\\cos\\theta + 1) = 0
(2\\cos\\theta - \\sqrt{3})(\\sqrt{2}\\cos\\theta + 1) = 0.
Case 1: \\cos\\theta = \\frac{\\sqrt{3}}{2}.
In [0, 2\\pi], the solutions are \\theta = \\frac{\\pi}{6}, \\frac{11\\pi}{6} (2 solutions).
By even symmetry of cosine, in [-2\\pi, 0], \\theta = -\\frac{\\pi}{6}, -\\frac{11\\pi}{6} (2 solutions).
Total for Case 1 = 4 solutions.
Case 2: \\cos\\theta = -\\frac{1}{\\sqrt{2}}.
In [0, 2\\pi], the solutions are \\theta = \\frac{3\\pi}{4}, \\frac{5\\pi}{4} (2 solutions).
In [-2\\pi, 0], the solutions are \\theta = -\\frac{3\\pi}{4}, -\\frac{5\\pi}{4} (2 solutions).
Total for Case 2 = 4 solutions.
None of these 8 angles coincide, so the total number of solutions is 4 + 4 = 8 → (C)"""

solutions["31730"] = """Let the arithmetic progression have first term a_1 and common difference d.
The sequence of odd-indexed terms a_{2k-1} for k = 1, 2, \\dots, 12 forms an A.P. with first term a_1, common difference 2d, and 12 terms.
Their sum is:
\\sum_{k=1}^{12} a_{2k-1} = \\frac{12}{2} [2a_1 + (12 - 1)(2d)] = 6(2a_1 + 22d) = 12a_1 + 132d.
Given: 12a_1 + 132d = -\\frac{72}{5}a_1.
Multiplying by 5:
60a_1 + 660d = -72a_1 \\implies 132a_1 + 660d = 0 \\implies a_1 + 5d = 0 \\implies a_1 = -5d.
For the sum of the first n terms of the original A.P. to equal zero:
\\sum_{k=1}^n a_k = \\frac{n}{2} [2a_1 + (n - 1)d] = 0.
Since n \\ne 0 and a_1 \\ne 0 (so d \\ne 0):
2a_1 + (n - 1)d = 0.
Substituting a_1 = -5d:
2(-5d) + (n - 1)d = 0 \\implies -10d + (n - 1)d = 0 \\implies (n - 11)d = 0.
Since d \\ne 0, we find n = 11 → (A)"""

solutions["31731"] = """Function f(x) = 2x^3 - 9ax^2 + 12a^2x + 1 with a > 0.
Differentiating:
f'(x) = 6x^2 - 18ax + 12a^2 = 6(x^2 - 3ax + 2a^2) = 6(x - a)(x - 2a).
The critical points are x = a and x = 2a.
Second derivative: f''(x) = 12x - 18a.
- At x = a: f''(a) = 12a - 18a = -6a < 0 \\implies local maximum at p = a.
- At x = 2a: f''(2a) = 24a - 18a = +6a > 0 \\implies local minimum at q = 2a.
Given the condition p^2 = q:
a^2 = 2a \\implies a(a - 2) = 0.
Since a > 0, we obtain a = 2.
Substituting a = 2 into f(x):
f(x) = 2x^3 - 9(2)x^2 + 12(2^2)x + 1 = 2x^3 - 18x^2 + 48x + 1.
Evaluating at x = 3:
f(3) = 2(27) - 18(9) + 48(3) + 1 = 54 - 162 + 144 + 1 = 37 → (D)"""

solutions["31732"] = """Given |z| = 1 and \\frac{2 + k^2 z}{k + \\bar{z}} = kz with k \\in \\mathbb{R}.
Cross-multiplying:
2 + k^2 z = kz(k + \\bar{z}) = k^2 z + k z \\bar{z}.
Using z \\bar{z} = |z|^2 = 1^2 = 1:
2 + k^2 z = k^2 z + k(1).
Subtracting k^2 z from both sides:
k = 2.
The point corresponding to k + i k^2 is P(2, 4).
The circle is given by |z - (1 + 2i)| = 1, with center C(1, 2) and radius r = 1.
Distance between point P and center C:
d = \\sqrt{(2 - 1)^2 + (4 - 2)^2} = \\sqrt{1^2 + 2^2} = \\sqrt{5}.
The maximum distance of point P from any point on the circle is:
d_{\\max} = d + r = \\sqrt{5} + 1 → (A)"""

solutions["31733"] = """Let \\vec{a} = x\\hat{i} + y\\hat{j} + z\\hat{k}.
The three given vectors are:
\\vec{u} = 2\\hat{i} - \\hat{j} + 2\\hat{k}, \\quad |\\vec{u}| = \\sqrt{4 + 1 + 4} = 3,
\\vec{v} = \\hat{i} + 2\\hat{j} - 2\\hat{k}, \\quad |\\vec{v}| = \\sqrt{1 + 4 + 4} = 3,
\\vec{w} = \\hat{k}, \\quad |\\vec{w}| = 1.
Since the scalar projections of \\vec{a} on these three vectors are equal:
\\frac{2x - y + 2z}{3} = \\frac{x + 2y - 2z}{3} = z.
From the first equality:
2x - y + 2z = 3z \\implies 2x - y - z = 0 \\quad \\text{--- (1)}.
From the second equality:
x + 2y - 2z = 3z \\implies x + 2y - 5z = 0 \\quad \\text{--- (2)}.
Multiplying (2) by 2 and subtracting from (1):
(2x - y - z) - (2x + 4y - 10z) = 0 \\implies -5y + 9z = 0 \\implies \\frac{y}{9} = \\frac{z}{5}.
Substituting z = \\frac{5}{9}y into (1):
2x = y + \\frac{5}{9}y = \\frac{14}{9}y \\implies \\frac{x}{7} = \\frac{y}{9} = \\frac{z}{5}.
Thus (x, y, z) is proportional to (7, 9, 5).
Magnitude = \\sqrt{7^2 + 9^2 + 5^2} = \\sqrt{49 + 81 + 25} = \\sqrt{155}.
The unit vector along \\vec{a} is \\frac{1}{\\sqrt{155}}(7\\hat{i} + 9\\hat{j} + 5\\hat{k}) → (C)"""

solutions["31734"] = """The relation R on set A = \\left\\{ f : \\mathbb{Z} \\rightarrow \\mathbb{Z} \\right\\} is defined by:
R = \\left\\{ (f, g) : f(0) = g(1) \\text{ and } f(1) = g(0) \\right\\}.
1. Reflexivity: For (f, f) \\in R, we must have f(0) = f(1). Since this does not hold for all functions f (e.g. f(x) = x has f(0) = 0 \\ne 1 = f(1)), R is not reflexive.
2. Symmetry: If (f, g) \\in R, then f(0) = g(1) and f(1) = g(0).
This immediately implies g(1) = f(0) and g(0) = f(1), which is the exact condition for (g, f) \\in R.
Hence R is symmetric.
3. Transitivity: If (f, g) \\in R and (g, h) \\in R, then f(0) = g(1) = h(0) and f(1) = g(0) = h(1).
For (f, h) \\in R, we require f(0) = h(1) and f(1) = h(0).
However, knowing f(0) = h(0) and f(1) = h(1) does not guarantee f(0) = h(1); hence transitivity fails.
Therefore, R is symmetric but neither reflexive nor transitive → (B)"""

solutions["31735"] = """Given the limit: L = \\lim_{x \\to 0} \\frac{x^2\\sin\\alpha x + (\\gamma - 1)e^{x^2}}{\\sin 2x - \\beta x} = 3.
Expanding the functions in Maclaurin series near x = 0:
\\sin(\\alpha x) = \\alpha x - \\frac{\\alpha^3 x^3}{6} + \\dots \\implies x^2 \\sin(\\alpha x) = \\alpha x^3 + \\dots
e^{x^2} = 1 + x^2 + \\frac{x^4}{2} + \\dots \\implies (\\gamma - 1)e^{x^2} = (\\gamma - 1) + (\\gamma - 1)x^2 + \\dots
Numerator = (\\gamma - 1) + (\\gamma - 1)x^2 + \\alpha x^3 + \\mathcal{O}(x^4).
\\sin(2x) = 2x - \\frac{8x^3}{6} + \\dots = 2x - \\frac{4}{3}x^3 + \\dots
Denominator = (2 - \\beta)x - \\frac{4}{3}x^3 + \\mathcal{O}(x^5).
For the limit to be finite and non-zero:
- Constant and x^2 terms in numerator must vanish: \\gamma - 1 = 0 \\implies \\gamma = 1.
- Linear term in denominator must vanish to match degree 3: 2 - \\beta = 0 \\implies \\beta = 2.
Then the limit becomes:
L = \\lim_{x \\to 0} \\frac{\\alpha x^3}{-\\frac{4}{3}x^3} = -\\frac{3\\alpha}{4} = 3 \\implies \\alpha = -4.
Evaluating \\beta + \\gamma - \\alpha:
\\beta + \\gamma - \\alpha = 2 + 1 - (-4) = 7 → (A)"""

solutions["31736"] = """The system of linear equations is:
3x + y + \\beta z = 3
2x + \\alpha y - z = -3
x + 2y + z = 4
For infinitely many solutions, both \\Delta and all Cramer's auxiliary determinants must equal zero.
Calculating \\Delta:
\\Delta = |[[3, 1, \\beta], [2, \\alpha, -1], [1, 2, 1]]| = 3(\\alpha + 2) - 1(2 - (-1)) + \\beta(4 - \\alpha)
= 3\\alpha + 6 - 3 + 4\\beta - \\alpha\\beta = 3\\alpha + 4\\beta - \\alpha\\beta + 3 = 0.
Calculating \\Delta_z:
\\Delta_z = |[[3, 1, 3], [2, \\alpha, -3], [1, 2, 4]]| = 3(4\\alpha + 6) - 1(8 - (-3)) + 3(4 - \\alpha)
= 12\\alpha + 18 - 11 + 12 - 3\\alpha = 9\\alpha + 19 = 0 \\implies \\alpha = -\\frac{19}{9}.
Substituting \\alpha = -\\frac{19}{9} into \\Delta = 0:
3\\left(-\\frac{19}{9}\\right) + 4\\beta - \\left(-\\frac{19}{9}\\right)\\beta + 3 = 0
-\\frac{19}{3} + 3 + \\frac{55}{9}\\beta = 0 \\implies -\\frac{10}{3} + \\frac{55}{9}\\beta = 0 \\implies \\beta = \\frac{10}{3} \\times \\frac{9}{55} = \\frac{6}{11}.
Evaluating the required expression:
22\\beta - 9\\alpha = 22\\left(\\frac{6}{11}\\right) - 9\\left(-\\frac{19}{9}\\right) = 12 + 19 = 31 → (B)"""

solutions["31737"] = """Given P_n = \\alpha^n + \\beta^n with P_8 = 47, P_9 = 76, P_{10} = 123, and P_1 = 1.
Notice the relation among values:
P_{10} = 123 = 76 + 47 = P_9 + P_8.
This corresponds to the linear recurrence relation P_n - P_{n-1} - P_{n-2} = 0.
By Newton's sums for roots of polynomials, \\alpha and \\beta are roots of the characteristic equation:
x^2 - x - 1 = 0.
From this quadratic equation:
Sum of roots: \\alpha + \\beta = 1 (matching P_1 = 1).
Product of roots: \\alpha \\beta = -1.
We seek the quadratic equation with roots \\frac{1}{\\alpha} and \\frac{1}{\\beta}:
Sum of roots S = \\frac{1}{\\alpha} + \\frac{1}{\\beta} = \\frac{\\alpha + \\beta}{\\alpha \\beta} = \\frac{1}{-1} = -1.
Product of roots P = \\frac{1}{\\alpha \\beta} = \\frac{1}{-1} = -1.
The quadratic equation is x^2 - S x + P = 0 \\implies x^2 - (-1)x + (-1) = 0 \\implies x^2 + x - 1 = 0 → (B)"""

solutions["31738"] = """The ellipse is \\frac{x^2}{18} + \\frac{y^2}{9} = 1, so a^2 = 18 and b^2 = 9.
Semi-major axis a = \\sqrt{18} = 3\\sqrt{2}, and eccentricity e = \\sqrt{1 - \\frac{b^2}{a^2}} = \\sqrt{1 - \\frac{9}{18}} = \\frac{1}{\\sqrt{2}}.
For any point P(x, y) on the ellipse, the focal distances from foci S and S' are:
SP = a - e x \\quad \\text{and} \\quad S'P = a + e x.
Their product is:
SP \\cdot S'P = (a - e x)(a + e x) = a^2 - e^2 x^2 = 18 - \\frac{1}{2}x^2.
Since -a \\le x \\le a, we have 0 \\le x^2 \\le a^2 = 18:
- Maximum value occurs at x = 0 (minor axis vertices): \\max(SP \\cdot S'P) = 18 - 0 = 18.
- Minimum value occurs at x^2 = 18 (major axis vertices): \\min(SP \\cdot S'P) = 18 - \\frac{1}{2}(18) = 9.
Sum of minimum and maximum values:
\\min(SP \\cdot S'P) + \\max(SP \\cdot S'P) = 9 + 18 = 27 → (D)"""

solutions["31739"] = """The line containing vertices Q and R is \\frac{x + 3}{5} = \\frac{y - 1}{2} = \\frac{z + 4}{3}.
A point on this line is A(-3, 1, -4) with direction vector \\vec{d} = 5\\hat{i} + 2\\hat{j} + 3\\hat{k}.
Magnitude of direction vector: |\\vec{d}| = \\sqrt{5^2 + 2^2 + 3^2} = \\sqrt{25 + 4 + 9} = \\sqrt{38}.
For vertex P(0, 2, 3), vector \\vec{AP} = (0 - (-3))\\hat{i} + (2 - 1)\\hat{j} + (3 - (-4))\\hat{k} = 3\\hat{i} + \\hat{j} + 7\\hat{k}.
The perpendicular distance h from P to the line is given by:
h = \\frac{|\\vec{AP} \\times \\vec{d}|}{|\\vec{d}|}.
Cross product:
\\vec{AP} \\times \\vec{d} = |[[\\hat{i}, \\hat{j}, \\hat{k}], [3, 1, 7], [5, 2, 3]]| = (3 - 14)\\hat{i} - (9 - 35)\\hat{j} + (6 - 5)\\hat{k} = -11\\hat{i} + 26\\hat{j} + \\hat{k}.
|\\vec{AP} \\times \\vec{d}| = \\sqrt{(-11)^2 + 26^2 + 1^2} = \\sqrt{121 + 676 + 1} = \\sqrt{798}.
Since 798 = 38 \\times 21, the height is h = \\frac{\\sqrt{38 \\times 21}}{\\sqrt{38}} = \\sqrt{21}.
Area of \\Delta PQR = \\frac{1}{2} \\times QR \\times h = \\frac{1}{2} \\times 5 \\times \\sqrt{21} = \\frac{5\\sqrt{21}}{2} = \\frac{m}{n}.
With m = 5\\sqrt{21} and n = 2:
2m - 5\\sqrt{21}n = 2(5\\sqrt{21}) - 5\\sqrt{21}(2) = 0 → (B)"""

solutions["31740"] = """In tetrahedron ABCD, the edges AB, AC, and AD are mutually perpendicular.
Let the lengths of these perpendicular edges be AB = c, AC = b, and AD = d.
The three mutually perpendicular faces are right-angled triangles with given areas:
\\text{Area}(\\Delta ABC) = \\frac{1}{2}bc = 5,
\\quad \\text{Area}(\\Delta ACD) = \\frac{1}{2}bd = 6,
\\quad \\text{Area}(\\Delta ADB) = \\frac{1}{2}cd = 7.
By de Gua's Theorem (a three-dimensional extension of Pythagoras' theorem for a trirectangular tetrahedron):
(\\text{Area}(\\Delta BCD))^2 = (\\text{Area}(\\Delta ABC))^2 + (\\text{Area}(\\Delta ACD))^2 + (\\text{Area}(\\Delta ADB))^2.
Substituting the known face areas:
(\\text{Area}(\\Delta BCD))^2 = 5^2 + 6^2 + 7^2 = 25 + 36 + 49 = 110.
Taking the square root:
\\text{Area}(\\Delta BCD) = \\sqrt{110} → (C)"""

solutions["31741"] = """Given A + I = [[1, a, 1], [2, 1, 0], [a, 1, 2]], we have:
A = (A + I) - I = [[0, a, 1], [2, 0, 0], [a, 1, 1]].
Expanding \\det(A) along the second row:
\\det(A) = -2(a(1) - 1(1)) = -2(a - 1).
Given \\det(A) = -4:
-2(a - 1) = -4 \\implies a - 1 = 2 \\implies a = 3.
Then a + 1 = 4 and a - 1 = 2.
We need to calculate \\det((a + 1)\\text{adj}((a - 1)A)) = \\det(4\\text{adj}(2A)).
For an n \\times n matrix with n = 3: \\det(k M) = k^3 \\det(M) and \\det(\\text{adj} M) = (\\det M)^2.
\\det(4\\text{adj}(2A)) = 4^3 \\det(\\text{adj}(2A)) = 64 (\\det(2A))^2.
Since \\det(2A) = 2^3 \\det(A) = 8(-4) = -32:
(\\det(2A))^2 = (-32)^2 = (2^5)^2 = 2^{10}.
Therefore:
\\det(4\\text{adj}(2A)) = 64 \\times 2^{10} = 2^6 \\times 2^{10} = 2^{16} = 2^{16} \\times 3^0.
Matching with 2^m 3^n gives m = 16 and n = 0.
Thus m + n = 16 + 0 = 16 → (D)"""

solutions["31742"] = """For the parabola y^2 = 4x, 4a = 4 \\implies a = 1, so the focus is S(1, 0).
The focal chord PQ passes through S(1, 0) and makes an angle of 60^\\circ with the positive x-axis.
Its equation is y - 0 = \\tan 60^\\circ (x - 1) \\implies y = \\sqrt{3}(x - 1).
Substituting y into the parabola equation:
(\\sqrt{3}(x - 1))^2 = 4x \\implies 3(x^2 - 2x + 1) = 4x \\implies 3x^2 - 10x + 3 = 0.
Factoring gives (3x - 1)(x - 3) = 0 \\implies x = 3 \\text{ or } x = \\frac{1}{3}.
Since P lies in the first quadrant and forms an acute angle from S(1, 0), x = 3:
y = \\sqrt{3}(3 - 1) = 2\\sqrt{3} \\implies P(3, 2\\sqrt{3}).
The circle on PS as diameter has equation:
(x - 3)(x - 1) + (y - 2\\sqrt{3})(y - 0) = 0.
The circle touches the y-axis at (0, \\alpha); setting x = 0:
(-3)(-1) + y(y - 2\\sqrt{3}) = 0 \\implies 3 + y^2 - 2\\sqrt{3}y = 0 \\implies (y - \\sqrt{3})^2 = 0 \\implies \\alpha = \\sqrt{3}.
Evaluating 5\\alpha^2:
5\\alpha^2 = 5(\\sqrt{3})^2 = 5(3) = 15 → (A)"""

solutions["31743"] = """Evaluate the integral I = \\int_0^{e^3} \\left\\lfloor \\frac{1}{e^{x - 1}} \\right\\rfloor dx = \\int_0^{e^3} \\lfloor e^{1-x} \\rfloor dx.
The function f(x) = e^{1-x} is continuous and strictly decreasing for x \\ge 0.
At x = 0: f(0) = e \\approx 2.718.
- For 0 \\le x < 1 - \\ln 2: 2 < f(x) \\le e, so \\lfloor f(x) \\rfloor = 2.
- For 1 - \\ln 2 \\le x < 1: 1 \\le f(x) < 2, so \\lfloor f(x) \\rfloor = 1.
- For 1 \\le x \\le e^3: 0 < f(x) < 1, so \\lfloor f(x) \\rfloor = 0.
Splitting the integral across these intervals:
I = \\int_0^{1 - \\ln 2} 2 dx + \\int_{1 - \\ln 2}^1 1 dx + \\int_1^{e^3} 0 dx
= 2(1 - \\ln 2 - 0) + 1(1 - (1 - \\ln 2)) + 0
= 2 - 2\\ln 2 + \\ln 2 = 2 - \\ln 2 = 2 - \\log_e 2.
Comparing with \\alpha - \\log_e 2 gives \\alpha = 2.
Calculating \\alpha^3 = 2^3 = 8 → (8)"""

solutions["31744"] = """Given the differential equation f''(x) = f(x) with initial conditions f(0) = 0 and f'(0) = 3.
The characteristic equation is r^2 - 1 = 0 \\implies r = \\pm 1.
The general solution is f(x) = c_1 e^x + c_2 e^{-x}.
Applying f(0) = 0:
c_1 + c_2 = 0 \\implies c_2 = -c_1.
Derivative: f'(x) = c_1 e^x - c_2 e^{-x} = c_1(e^x + e^{-x}).
Applying f'(0) = 3:
c_1(1 + 1) = 3 \\implies 2 c_1 = 3 \\implies c_1 = \\frac{3}{2}, \\quad c_2 = -\\frac{3}{2}.
Thus f(x) = \\frac{3}{2}(e^x - e^{-x}).
Evaluating at x = \\log_e 3:
f(\\log_e 3) = \\frac{3}{2}\\left(e^{\\ln 3} - e^{-\\ln 3}\\right) = \\frac{3}{2}\\left(3 - \\frac{1}{3}\\right) = \\frac{3}{2}\\left(\\frac{8}{3}\\right) = 4.
Therefore: 9 f(\\log_e 3) = 9 \\times 4 = 36 → (36)"""

solutions["31745"] = """The enclosed region is \\left\\{ (x, y) : |4 - x^2| \\le y \\le x^2, \\quad y \\le 4, \\quad x \\ge 0 \\right\\}.
Analyzing the curves:
- Lower boundary: y = |4 - x^2|, so y = 4 - x^2 for 0 \\le x \\le 2 and y = x^2 - 4 for x \\ge 2.
- Upper boundary: y = x^2 and line y = 4.
Intersection points:
- y = 4 - x^2 and y = x^2 intersect at 4 - x^2 = x^2 \\implies 2x^2 = 4 \\implies x = \\sqrt{2}, y = 2.
- y = x^2 - 4 and y = 4 intersect at x^2 - 4 = 4 \\implies x^2 = 8 \\implies x = 2\\sqrt{2}.
Integrating with respect to y from 0 to 4:
Area = \\int_0^4 \\sqrt{4 + y} dy - \\int_0^2 \\sqrt{4 - y} dy - \\int_2^4 \\sqrt{y} dy.
Evaluating individual integrals:
\\int_0^4 (4 + y)^{1/2} dy = \\left[ \\frac{2}{3}(4 + y)^{3/2} \\right]_0^4 = \\frac{2}{3}(8^{3/2} - 4^{3/2}) = \\frac{2}{3}(16\\sqrt{2} - 8).
\\int_0^2 (4 - y)^{1/2} dy = \\left[ -\\frac{2}{3}(4 - y)^{3/2} \\right]_0^2 = \\frac{2}{3}(8 - 2\\sqrt{2}).
\\int_2^4 y^{1/2} dy = \\left[ \\frac{2}{3}y^{3/2} \\right]_2^4 = \\frac{2}{3}(8 - 2\\sqrt{2}).
Area = \\frac{2}{3}\\left[(16\\sqrt{2} - 8) - (8 - 2\\sqrt{2}) - (8 - 2\\sqrt{2})\\right] = \\frac{2}{3}(20\\sqrt{2} - 24) = \\frac{40\\sqrt{2}}{3} - 16 = \\frac{80\\sqrt{2}}{6} - 16.
Matching with \\frac{80\\sqrt{2}}{\\alpha} - \\beta gives \\alpha = 6 and \\beta = 16.
Thus \\alpha + \\beta = 6 + 16 = 22 → (22)"""

solutions["31746"] = """Three distinct numbers a < b < c are chosen from \\left\\{ 1, 2, 3, \\dots, 40 \\right\\}.
The total number of possible triplets is:
N = {}^{40}C_3 = \\frac{40 \\times 39 \\times 38}{3 \\times 2 \\times 1} = 9880.
For the triplets to form an increasing geometric progression with integer common ratio r \\ge 2:
- r = 2: c = 4a \\le 40 \\implies a \\in \\left\\{ 1, 2, \\dots, 10 \\right\\} \\implies 10 triplets
- r = 3: c = 9a \\le 40 \\implies a \\in \\left\\{ 1, 2, 3, 4 \\right\\} \\implies 4 triplets
- r = 4: c = 16a \\le 40 \\implies a \\in \\left\\{ 1, 2 \\right\\} \\implies 2 triplets
- r = 5: c = 25a \\le 40 \\implies a = 1 \\implies 1 triplet
- r = 6: c = 36a \\le 40 \\implies a = 1 \\implies 1 triplet
Total favorable geometric progressions = 10 + 4 + 2 + 1 + 1 = 18.
Probability: P = \\frac{18}{9880} = \\frac{9}{4940}.
With \\gcd(9, 4940) = 1, we have m = 9 and n = 4940.
Therefore, m + n = 9 + 4940 = 4949 → (4949)"""

solutions["31747"] = """The two tangent lines are L_1 : x + y = 3 and L_2 : x - y = 3.
The angle bisector of these lines is the x-axis (y = 0), so the centers of the circles lie on the x-axis: C(a, 0).
The radius r is the perpendicular distance from (a, 0) to x + y - 3 = 0:
r = \\frac{|a - 3|}{\\sqrt{1^2 + 1^2}} = \\frac{|a - 3|}{\\sqrt{2}}.
The equation of each circle is (x - a)^2 + y^2 = \\frac{(a - 3)^2}{2}.
Since the circle passes through (-9, 4):
(-9 - a)^2 + 4^2 = \\frac{(a - 3)^2}{2} \\implies 2[(a + 9)^2 + 16] = (a - 3)^2.
Expanding: 2(a^2 + 18a + 97) = a^2 - 6a + 9 \\implies 2a^2 + 36a + 194 = a^2 - 6a + 9.
a^2 + 42a + 185 = 0 \\implies (a + 37)(a + 5) = 0 \\implies a_1 = -37, \\quad a_2 = -5.
Square of radius of first circle:
r_1^2 = \\frac{(-37 - 3)^2}{2} = \\frac{1600}{2} = 800.
Square of radius of second circle:
r_2^2 = \\frac{(-5 - 3)^2}{2} = \\frac{64}{2} = 32.
Absolute difference between the squares of the radii:
|r_1^2 - r_2^2| = |800 - 32| = 768 → (768)"""

# ==============================================================================
# PHYSICS (IDs 31673 - 31697)
# ==============================================================================

solutions["31673"] = """A plane wavefront is represented by the surface equation x + y + z = \\text{constant}.
The direction of wave propagation is always perpendicular (normal) to the wavefront surface.
The normal vector to the plane x + y + z = c is given by the gradient:
\\vec{n} = \\nabla(x + y + z) = \\hat{i} + \\hat{j} + \\hat{k}.
The unit vector in the direction of propagation is:
\\hat{n} = \\frac{\\hat{i} + \\hat{j} + \\hat{k}}{\\sqrt{1^2 + 1^2 + 1^2}} = \\frac{1}{\\sqrt{3}}\\hat{i} + \\frac{1}{\\sqrt{3}}\\hat{j} + \\frac{1}{\\sqrt{3}}\\hat{k}.
The direction cosine with the x-axis is \\cos\\alpha = \\hat{n} \\cdot \\hat{i} = \\frac{1}{\\sqrt{3}}.
Therefore, the angle made by the direction of wave propagation with the x-axis is \\alpha = \\cos^{-1}\\left(\\frac{1}{\\sqrt{3}}\\right) → (A)"""

solutions["31674"] = """The van der Waals equation of state is \\left(P + \\frac{a}{V^2}\\right)(V - b) = RT.
By dimensional homogeneity, terms added together must possess identical physical dimensions:
[\\frac{a}{V^2}] = [P] \\implies [a] = [P][V^2].
Since [P] = [\\text{ML}^{-1}\\text{T}^{-2}] and [V] = [\\text{L}^3]:
[a] = [\\text{ML}^{-1}\\text{T}^{-2}][\\text{L}^6] = [\\text{ML}^5\\text{T}^{-2}].
Similarly, [b] = [V] = [\\text{L}^3].
Now determining the dimensions of a b^{-2}:
[a b^{-2}] = \\frac{[a]}{[b]^2} = \\frac{[\\text{ML}^5\\text{T}^{-2}]}{[\\text{L}^6]} = [\\text{ML}^{-1}\\text{T}^{-2}].
Energy density is defined as energy per unit volume:
[\\text{Energy density}] = \\frac{[\\text{Energy}]}{[\\text{Volume}]} = \\frac{[\\text{ML}^2\\text{T}^{-2}]}{[\\text{L}^3]} = [\\text{ML}^{-1}\\text{T}^{-2}].
Thus, the dimension of a b^{-2} is equivalent to that of energy density → (D)"""

solutions["31675"] = """Since the spokes have negligible mass, the entire mass M = 10\\text{ kg} of the wheel is concentrated along its rim of radius R = 10\\text{ cm} = 0.1\\text{ m}.
The wheel behaves as a circular ring, with moment of inertia:
I = M R^2 = 10\\text{ kg} \\times (0.1\\text{ m})^2 = 10 \\times 0.01 = 0.1\\text{ kg m}^2.
Work done by the constant steady pull F = 20\\text{ N} applied along the unwinding cord of length s = 1\\text{ m}:
W = F s = 20\\text{ N} \\times 1\\text{ m} = 20\\text{ J}.
By the work-energy theorem for rotational motion starting from rest (\\omega_0 = 0):
W = \\frac{1}{2} I \\omega^2 \\implies 20 = \\frac{1}{2}(0.1)\\omega^2 = 0.05 \\omega^2.
Solving for angular velocity:
\\omega^2 = \\frac{20}{0.05} = 400 \\implies \\omega = \\sqrt{400} = 20\\text{ rad/s} → (A)"""

solutions["31676"] = """Convex lens with focal length f = +20\\text{ cm}.
Point A of the object lies on the principal axis at u = -30\\text{ cm}.
Using the thin lens formula \\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}:
\\frac{1}{v} - \\frac{1}{-30} = \\frac{1}{20} \\implies \\frac{1}{v} = \\frac{1}{20} - \\frac{1}{30} = \\frac{1}{60} \\implies v = +60\\text{ cm}.
Transverse magnification: m = \\frac{v}{u} = \\frac{60}{-30} = -2.
The vertical height of the image is h_i = m h_o = -2(2\\text{ cm}) = -4\\text{ cm}.
For a small object segment of length du = 1\\text{ cm} along the axis, the longitudinal displacement of the image is:
dv = m^2 du = (-2)^2(1\\text{ cm}) = 4\\text{ cm}.
The angle \\theta that the slanted image makes with the principal axis is given by:
\\tan\\theta = \\frac{h_i}{dv} = \\frac{-4\\text{ cm}}{4\\text{ cm}} = -1 \\implies \\theta = -45^\\circ → (B)"""

solutions["31677"] = """For two infinitely large plane parallel conducting plates carrying charges with net surface densities +\\sigma and -2\\sigma:
Total charge density of the system = \\sigma + (-2\\sigma) = -\\sigma.
The outer facing surfaces of both plates carry equal charge density: \\sigma_{\\text{outer}} = \\frac{-\\sigma}{2} = -0.5\\sigma.
The charge density on the inner surface of the first plate is \\sigma_1 = \\sigma - (-0.5\\sigma) = +1.5\\sigma = +\\frac{3\\sigma}{2}.
The charge density on the inner surface of the second plate is \\sigma_2 = -2\\sigma - (-0.5\\sigma) = -1.5\\sigma = -\\frac{3\\sigma}{2}.
The uniform electric field between the plates produced by these inner charges is:
E = \\frac{\\sigma_1}{\\varepsilon_0} = \\frac{3\\sigma}{2\\varepsilon_0}.
The electrostatic force experienced by point charge +q placed at the midpoint between the plates is:
F = q E = \\frac{3\\sigma q}{2\\varepsilon_0} → (B)"""

solutions["31678"] = """River flows west to east with speed v_r = 9\\text{ km h}^{-1}.
Maximum boat speed in still water is v_b = 27\\text{ km h}^{-1}.
The boat travels at an angle of 150^\\circ to the river flow (East).
The angle made with the cross-river direction (North, perpendicular to river flow) is 150^\\circ - 90^\\circ = 60^\\circ.
The velocity component perpendicular to the river flow is:
v_\\perp = v_b \\sin(150^\\circ) = 27 \\times \\frac{1}{2} = 13.5\\text{ km h}^{-1}.
Converting to SI units:
v_\\perp = 13.5 \\times \\frac{5}{18}\\text{ m/s} = \\frac{27}{2} \\times \\frac{5}{18} = 3.75\\text{ m/s}.
Time taken to cross the river is t = 0.5\\text{ min} = 30\\text{ s}.
Width of the river is d = v_\\perp \\times t = 3.75\\text{ m/s} \\times 30\\text{ s} = 112.5\\text{ m} → (B)"""

solutions["31679"] = """A point charge +q is at (0, 0, 0) and a second point charge +9q is at (d, 0, 0).
Since both charges are positive, the net electric field vanishes at an interior point (x, 0, 0) along the line segment between them (0 < x < d).
Setting the magnitudes of the electric fields equal:
\\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{x^2} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{9q}{(d - x)^2}.
Simplifying:
\\frac{1}{x^2} = \\frac{9}{(d - x)^2}.
Taking the square root on both sides:
\\frac{1}{x} = \\frac{3}{d - x} \\implies d - x = 3x \\implies 4x = d \\implies x = \\frac{d}{4}.
Therefore, the point where the electric field vanishes is (d/4, 0, 0) → (B)"""

solutions["31680"] = """The battery is rated at voltage V = 4.2\\text{ V} and charge capacity Q = 5800\\text{ mAh}.
Converting charge capacity to SI units (Coulombs):
Q = 5800\\text{ mA h} = 5.8\\text{ A h} = 5.8 \\times 3600\\text{ C} = 20880\\text{ C}.
The total electrical energy stored in the fully charged battery is given by:
E = V \\times Q = 4.2\\text{ V} \\times 20880\\text{ C} = 87696\\text{ J}.
Converting joules to kilojoules:
E = \\frac{87696}{1000}\\text{ kJ} \\approx 87.7\\text{ kJ} → (C)"""

solutions["31681"] = """Given simple harmonic motions: x_1 = \\sqrt{7}\\sin(5t)\\text{ cm} and x_2 = 2\\sqrt{7}\\sin\\left(5t + \\frac{\\pi}{3}\\right)\\text{ cm}.
Both motions have identical angular frequency \\omega = 5\\text{ rad/s} with phase difference \\phi = \\frac{\\pi}{3} = 60^\\circ.
Amplitudes: A_1 = \\sqrt{7}\\text{ cm} and A_2 = 2\\sqrt{7}\\text{ cm}.
The resultant amplitude A_R is:
A_R = \\sqrt{A_1^2 + A_2^2 + 2 A_1 A_2 \\cos 60^\\circ} = \\sqrt{7 + 28 + 2(\\sqrt{7})(2\\sqrt{7})\\left(\\frac{1}{2}\\right)}
= \\sqrt{35 + 14} = \\sqrt{49} = 7\\text{ cm} = 0.07\\text{ m}.
The maximum acceleration of the particle in SHM is:
a_{\\max} = \\omega^2 A_R = (5)^2 \\times 0.07 = 25 \\times 0.07 = 1.75\\text{ m s}^{-2}.
Writing in the form x \\times 10^{-2}\\text{ m s}^{-2}:
1.75 = 175 \\times 10^{-2}\\text{ m s}^{-2} \\implies x = 175 → (A)"""

solutions["31682"] = """The total magnetic flux density \\vec{B} in a magnetic medium is given by:
\\vec{B} = \\mu_0(\\vec{H} + \\vec{M}).
The magnetization \\vec{M} is related to magnetic susceptibility \\chi by \\vec{M} = \\chi \\vec{H}:
\\vec{B} = \\mu_0(1 + \\chi)\\vec{H}.
By definition of magnetic permeability \\mu of the medium, \\vec{B} = \\mu \\vec{H}, so:
\\mu = \\mu_0(1 + \\chi).
Dividing both sides by \\mu_0:
\\frac{\\mu}{\\mu_0} = 1 + \\chi \\implies \\chi = \\frac{\\mu}{\\mu_0} - 1 → (A)"""

solutions["31683"] = """Unregulated dc input voltage V_{\\text{in}} = 25\\text{ V}, zener breakdown voltage V_Z = 5\\text{ V}, and series resistor R_s = 400\\text{ }\\Omega.
Voltage across the series resistor:
V_s = V_{\\text{in}} - V_Z = 25 - 5 = 20\\text{ V}.
Total current flowing through the circuit:
I = \\frac{V_s}{R_s} = \\frac{20\\text{ V}}{400\\text{ }\\Omega} = 0.05\\text{ A} = 50\\text{ mA}.
By Kirchhoff's junction law, I = I_Z + I_L.
Given that the zener current is 4 times load current (I_Z = 4 I_L):
5 I_L = 50\\text{ mA} \\implies I_L = 10\\text{ mA}.
Because the load resistor is connected in parallel with the zener diode, the voltage across it is V_L = V_Z = 5\\text{ V}.
Load resistance:
R_L = \\frac{V_Z}{I_L} = \\frac{5\\text{ V}}{10 \\times 10^{-3}\\text{ A}} = 500\\text{ }\\Omega.
Thus I_L = 10\\text{ mA} and R_L = 500\\text{ }\\Omega → (D)"""

solutions["31684"] = """In an adiabatic thermodynamic process, the system is completely thermally insulated from its surroundings, meaning no heat enters or leaves:
dQ = 0.
The molar heat capacity C of a substance undergoing a thermodynamic process is defined as:
C = \\frac{dQ}{n dT}.
During adiabatic expansion or compression, the temperature undergoes a finite change (dT \\ne 0) while dQ = 0.
Substituting dQ = 0 into the definition:
C = \\frac{0}{n dT} = 0.
Therefore, the molar heat capacity in an adiabatic process is zero → (C)"""

solutions["31685"] = """Square lamina OABC has side length \\ell = 10\\text{ cm} and is pivoted about vertex O.
For the lamina to remain stationary in rotational equilibrium, the net torque about pivot O must vanish: \\sum \\tau_O = 0.
Forces passing through pivot O exert zero torque about O.
The vertical force of 10 N acting at vertex B produces a clockwise torque of magnitude \\tau_1 = 10 \\times \\ell.
The horizontal force F acting at vertex C produces an opposing counter-clockwise torque of magnitude \\tau_2 = F \\times \\ell.
Equating the clockwise and counter-clockwise torques for equilibrium:
\\tau_1 = \\tau_2 \\implies 10\\ell = F\\ell \\implies F = 10\\text{ N} → (C)"""

solutions["31686"] = """Magnetic field at the center of a circular coil of radius R carrying current I:
B_1 = \\frac{\\mu_0 I}{2R}.
Magnetic field along the axis of the coil at a distance x from the center:
B_2 = \\frac{\\mu_0 I R^2}{2(R^2 + x^2)^{3/2}}.
Taking the ratio of the two fields:
\\frac{B_2}{B_1} = \\frac{R^3}{(R^2 + x^2)^{3/2}} = \\left[\\frac{R}{\\sqrt{R^2 + x^2}}\\right]^3.
Given x : R = 3 : 4, let x = 3k and R = 4k:
\\sqrt{R^2 + x^2} = \\sqrt{(4k)^2 + (3k)^2} = \\sqrt{25k^2} = 5k.
Then \\frac{R}{\\sqrt{R^2 + x^2}} = \\frac{4k}{5k} = \\frac{4}{5}.
Evaluating the cube:
\\frac{B_2}{B_1} = \\left(\\frac{4}{5}\\right)^3 = \\frac{64}{125} → (C)"""

solutions["31687"] = """According to Bohr's atomic model, the energy level for a hydrogen-like species with atomic number Z in state n is:
E_n = -13.6 \\frac{Z^2}{n^2}\\text{ eV}.
- (A) H atom in ground state (Z = 1, n = 1): E_1 = -13.6 \\left(\\frac{1^2}{1^2}\\right) = -13.6\\text{ eV}.
  \\text{He}^+ ion in first excited state (Z = 2, n = 2): E_2 = -13.6 \\left(\\frac{2^2}{2^2}\\right) = -13.6\\text{ eV}. Both energies match (Statement A is correct).
- (B) \\text{Li}^{2+} ion in second excited state (Z = 3, n = 3): E_3 = -13.6 \\left(\\frac{3^2}{3^2}\\right) = -13.6\\text{ eV}, which matches H ground state (Statement B is correct).
- (C) \\text{He}^+ ground state (Z = 2, n = 1) has E_1 = -54.4\\text{ eV} \\ne -13.6\\text{ eV} (Statement C is incorrect).
- (D) \\text{Li}^{2+} ground state (Z = 3, n = 1) has E_1 = -122.4\\text{ eV} \\ne -13.6\\text{ eV} (Statement D is incorrect).
Therefore, statements (A) and (B) only are correct → (B)"""

solutions["31688"] = """Moment of inertia of a uniform rod of mass M and length L about its central transverse axis:
\\alpha = \\frac{M L^2}{12}.
When the rod is cut into two equal parts:
Each half rod has mass m = \\frac{M}{2} and length \\ell = \\frac{L}{2}.
The two parts are assembled symmetrically at their midpoints to form a cross.
The moment of inertia of each half rod about the axis passing through its midpoint perpendicular to its length is:
I_1 = \\frac{m \\ell^2}{12} = \\frac{(\\frac{M}{2})(\\frac{L}{2})^2}{12} = \\frac{M L^2}{8 \\times 12} = \\frac{M L^2}{96}.
By the principle of superposition, the total moment of inertia of the cross is:
I_{\\text{cross}} = 2 \\times I_1 = 2 \\times \\frac{M L^2}{96} = \\frac{M L^2}{48}.
Expressing in terms of \\alpha = \\frac{M L^2}{12}:
I_{\\text{cross}} = \\frac{1}{4}\\left(\\frac{M L^2}{12}\\right) = \\frac{\\alpha}{4} → (B)"""

solutions["31689"] = """Refraction at a spherical boundary between two media is given by:
\\frac{\\mu_2}{v} - \\frac{\\mu_1}{u} = \\frac{\\mu_2 - \\mu_1}{R}.
Here light travels from medium 1 (\\mu_1 = 1) into medium 2 (\\mu_2 = 1.5).
Object distance is u = -0.2\\text{ m}, and radius of curvature is R = +0.4\\text{ m}.
Substituting into the refraction formula:
\\frac{1.5}{v} - \\frac{1}{-0.2} = \\frac{1.5 - 1}{0.4} \\implies \\frac{1.5}{v} + 5 = 1.25.
\\frac{1.5}{v} = 1.25 - 5 = -3.75.
Solving for image distance:
v = -\\frac{1.5}{3.75} = -0.4\\text{ m}.
The negative sign indicates that the virtual image is formed 0.4 m to the left of the spherical surface → (B)"""

solutions["31690"] = """Deriving dimensional formulas for each physical quantity:
- (A) Coefficient of viscosity (\\eta): from F = 6\\pi\\eta r v, [\\eta] = \\frac{[F]}{[r][v]} = \\frac{[\\text{MLT}^{-2}]}{[\\text{L}][\\text{LT}^{-1}]} = [\\text{ML}^{-1}\\text{T}^{-1}] \\implies \\text{(IV)}.
- (B) Intensity of wave (I): energy per unit area per unit time, [I] = \\frac{[\\text{ML}^2\\text{T}^{-2}]}{[\\text{L}^2][\\text{T}]} = [\\text{ML}^0\\text{T}^{-3}] \\implies \\text{(I)}.
- (C) Pressure gradient (\\frac{dP}{dx}): [\\frac{dP}{dx}] = \\frac{[P]}{[x]} = \\frac{[\\text{ML}^{-1}\\text{T}^{-2}]}{[\\text{L}]} = [\\text{ML}^{-2}\\text{T}^{-2}] \\implies \\text{(II)}.
- (D) Compressibility (\\beta = \\frac{1}{B}): reciprocal of bulk modulus, [\\beta] = \\frac{1}{[\\text{ML}^{-1}\\text{T}^{-2}]} = [\\text{M}^{-1}\\text{LT}^2] \\implies \\text{(III)}.
Matching: (A)-(IV), (B)-(I), (C)-(II), (D)-(III) → (B)"""

solutions["31691"] = """Electric field due to an infinitely long non-conducting sheet of uniform charge density \\sigma:
E = \\frac{\\sigma}{2\\varepsilon_0}.
The bob has mass m = 100\\text{ mg} = 10^{-4}\\text{ kg} and charge q = +10\\text{ }\\mu\\text{C} = 10^{-5}\\text{ C}.
At equilibrium, the string makes an angle \\theta = 45^\\circ with the vertical:
T \\sin 45^\\circ = q E = \\frac{q \\sigma}{2\\varepsilon_0}, \\quad T \\cos 45^\\circ = mg.
Dividing the two equilibrium equations:
\\tan 45^\\circ = \\frac{q \\sigma}{2\\varepsilon_0 mg} \\implies 1 = \\frac{q \\sigma}{2\\varepsilon_0 mg} \\implies \\sigma = \\frac{2\\varepsilon_0 mg}{q}.
Substituting numerical values:
\\sigma = \\frac{2 \\times (8.85 \\times 10^{-12}\\text{ F/m}) \\times (10^{-4}\\text{ kg}) \\times (10\\text{ m/s}^2)}{10^{-5}\\text{ C}}
\\sigma = \\frac{1.77 \\times 10^{-14}}{10^{-5}} = 1.77 \\times 10^{-9}\\text{ C/m}^2 = 1.77\\text{ nC/m}^2 → (D)"""

solutions["31692"] = """By Einstein's photoelectric equation, the maximum kinetic energy of electrons emitted with light of wavelength \\lambda is:
K_{\\max} = \\frac{hc}{\\lambda} - \\phi.
The linear momentum of the photoelectron is:
p = \\sqrt{2m K_{\\max}} = \\sqrt{2m\\left(\\frac{hc}{\\lambda} - \\phi\\right)}.
The electron enters perpendicular to a constant magnetic field B, describing a circular orbit with radius:
R = \\frac{p}{e B} = \\frac{\\sqrt{2m\\left(\\frac{hc}{\\lambda} - \\phi\\right)}}{e B}.
The electron completes a semicircle and returns to hit the plate at point B.
The distance between launch point A and impact point B equals the orbit diameter:
d_{AB} = 2R = \\frac{2\\sqrt{2m\\left(\\frac{hc}{\\lambda} - \\phi\\right)}}{e B} = \\frac{\\sqrt{8m\\left(\\frac{hc}{\\lambda} - \\phi\\right)}}{e B} → (C)"""

solutions["31693"] = """The partition separates water (\\rho_w = 1000\\text{ kg/m}^3) from a liquid of density \\rho_l = 1.5 \\times 10^3\\text{ kg/m}^3 = 1500\\text{ kg/m}^3.
At depth h = 3\\text{ m}, the hydrostatic pressure difference across the partition wall is:
\\Delta P = (\\rho_l - \\rho_w) g h = (1500 - 1000)\\text{ kg/m}^3 \\times 10\\text{ m/s}^2 \\times 3\\text{ m}
\\Delta P = 500 \\times 30 = 15000\\text{ N/m}^2.
The small window has cross-sectional area A = 100\\text{ cm}^2 = 100 \\times 10^{-4}\\text{ m}^2 = 10^{-2}\\text{ m}^2.
The net force acting on the window door is:
F = \\Delta P \\times A = 15000\\text{ N/m}^2 \\times 10^{-2}\\text{ m}^2 = 150\\text{ N}.
Therefore, a force of 150 N must be applied to keep the door shut → (150)"""

solutions["31694"] = """Young's modulus of the steel wire is Y = 2.0 \\times 10^{11}\\text{ N m}^{-2}.
Poisson's ratio is defined as \\nu = \\frac{\\text{transverse strain}}{\\text{longitudinal strain}}.
Given transverse strain = 10^{-3} and Poisson's ratio \\nu = 0.2:
\\text{Longitudinal strain } \\varepsilon = \\frac{10^{-3}}{0.2} = 5 \\times 10^{-3}.
The elastic potential energy density (energy per unit volume) stored in the stretched wire is:
u = \\frac{1}{2} Y \\varepsilon^2.
Substituting the values:
u = \\frac{1}{2} \\times (2.0 \\times 10^{11}) \\times (5 \\times 10^{-3})^2
u = 10^{11} \\times (25 \\times 10^{-6}) = 25 \\times 10^5\\text{ J m}^{-3}.
Expressing in units of 10^5 (in SI units): 25 → (25)"""

solutions["31695"] = """In a single-slit Fraunhofer diffraction pattern, the angular position of the n^{\\text{th}} minimum is:
\\sin\\theta_n \\approx \\theta_n = \\frac{n\\lambda}{a}.
For the second minimum to the left of central maximum (n_1 = 2): \\theta_1 = \\frac{2\\lambda}{a}.
For the third minimum to the right of central maximum (n_2 = 3): \\theta_2 = \\frac{3\\lambda}{a}.
The angular separation between these two minima is:
\\Delta\\theta = \\theta_1 + \\theta_2 = \\frac{2\\lambda}{a} + \\frac{3\\lambda}{a} = \\frac{5\\lambda}{a}.
Given \\Delta\\theta = 30^\\circ = \\frac{\\pi}{6}\\text{ rad} and \\lambda = 628\\text{ nm} = 628 \\times 10^{-9}\\text{ m}:
\\frac{5\\lambda}{a} = \\frac{\\pi}{6} \\implies a = \\frac{30\\lambda}{\\pi} = \\frac{30 \\times 628 \\times 10^{-9}}{3.14}\\text{ m}.
Calculating:
a = 30 \\times 200 \\times 10^{-9}\\text{ m} = 6000 \\times 10^{-9}\\text{ m} = 6 \\times 10^{-6}\\text{ m} = 6\\text{ }\\mu\\text{m} → (6)"""

solutions["31696"] = """The specific heat ratio for an ideal gas with f degrees of freedom is \\gamma = 1 + \\frac{2}{f}.
For monoatomic gas A:
Has 3 translational degrees of freedom, so f_A = 3.
\\gamma_A = 1 + \\frac{2}{3} = \\frac{5}{3}.
For polyatomic gas B:
Has 3 translational + 3 rotational + 1 vibrational mode.
Each vibrational mode contributes 2 degrees of freedom (1 kinetic + 1 potential energy term), giving f_B = 3 + 3 + 2 = 8.
\\gamma_B = 1 + \\frac{2}{8} = 1 + \\frac{1}{4} = \\frac{5}{4}.
Evaluating the ratio:
\\frac{\\gamma_A}{\\gamma_B} = \\frac{5/3}{5/4} = \\frac{4}{3} = 1 + \\frac{1}{3}.
Comparing with 1 + \\frac{1}{n} yields n = 3 → (3)"""

solutions["31697"] = """Motion in two consecutive intervals:
- First part: distance d_1 = x covered with velocity v_1 = 5\\text{ m/s}, time t_1 = \\frac{x}{5}.
- Second part: distance d_2 = \\frac{3}{2}x = 1.5x covered with velocity v_2, time t_2 = \\frac{3x}{2v_2}.
Total distance travelled:
d = x + \\frac{3}{2}x = \\frac{5}{2}x.
Total time taken:
t = t_1 + t_2 = x\\left(\\frac{1}{5} + \\frac{3}{2v_2}\\right).
Average velocity is given by v_{\\text{avg}} = \\frac{d}{t}:
\\frac{50}{7} = \\frac{\\frac{5}{2}x}{x\\left(\\frac{1}{5} + \\frac{3}{2v_2}\\right)} = \\frac{5/2}{\\frac{1}{5} + \\frac{3}{2v_2}}.
Cross-multiplying:
\\frac{1}{5} + \\frac{3}{2v_2} = \\frac{5}{2} \\times \\frac{7}{50} = \\frac{7}{20}.
\\frac{3}{2v_2} = \\frac{7}{20} - \\frac{1}{5} = \\frac{7}{20} - \\frac{4}{20} = \\frac{3}{20}.
Equating denominators: 2 v_2 = 20 \\implies v_2 = 10\\text{ m/s} → (10)"""

with open("scripts/solutions-02-apr-morning-2025.json", "w", encoding="utf-8") as f:
    json.dump(solutions, f, indent=2, ensure_ascii=False)

print(f"Generated {len(solutions)} solutions in scripts/solutions-02-apr-morning-2025.json")
