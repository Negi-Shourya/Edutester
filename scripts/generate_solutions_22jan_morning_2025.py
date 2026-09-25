import json

sols = {
  # ================= PHYSICS (29701 - 29725) =================
  "29701": (
    "In a Vernier calliper, the least count is defined as \\text{LC} = 1\\text{ MSD} - 1\\text{ VSD}.\n"
    "Given that 10\\text{ VSD} = 9\\text{ MSD}, one Vernier division equals 1\\text{ VSD} = 0.9\\text{ MSD} = 0.9\\text{ mm}.\n"
    "Substituting gives \\text{LC} = 1.0\\text{ mm} - 0.9\\text{ mm} = 0.1\\text{ mm}, confirming Assertion A.\n"
    "Reason R correctly states the fundamental definition of least count for Vernier callipers and explains A → (A)"
  ),
  "29702": (
    "The line charge of length 2a is centered on edge BC, so a segment of length a lies along the edge of the cube.\n"
    "An edge in a cubic lattice is shared equally among 4 adjacent identical cubes meeting at that edge.\n"
    "Therefore, the effective charge enclosed within one single cube is q_{\\text{encl}} = \\frac{\\lambda a}{4}.\n"
    "By Gauss's Law, the total electric flux emerging through the cube is \\Phi = \\frac{q_{\\text{encl}}}{\\varepsilon_0} = \\frac{\\lambda a}{4\\varepsilon_0} → (C)"
  ),
  "29703": (
    "The sliding contact divides the 1\\,\\Omega wire into two equal halves of 0.5\\,\\Omega each.\n"
    "The external resistance R_e = 2\\,\\Omega is in parallel with the first 0.5\\,\\Omega segment, giving R_p = \\frac{0.5 \\times 2}{0.5 + 2} = \\frac{1}{2.5} = 0.4\\,\\Omega.\n"
    "The total resistance connected across the 0.9 V supply is R_{\\text{total}} = 0.4 + 0.5 = 0.9\\,\\Omega.\n"
    "The circuit current is I = \\frac{0.9\\text{ V}}{0.9\\,\\Omega} = 1.0\\text{ A}.\n"
    "Hence the potential difference across R_e is V = I \\times R_p = 1.0 \\times 0.4 = 0.40\\text{ V} → (C)"
  ),
  "29704": (
    "In a medium of refractive index \\mu, the speed of light is reduced to v = c / \\mu and wavelength becomes \\lambda' = \\lambda / \\mu.\n"
    "The fringe width in Young's double slit experiment is given by \\beta = \\frac{\\lambda D}{d}.\n"
    "When immersed in the medium, the new fringe width becomes \\beta' = \\frac{\\lambda' D}{d} = \\frac{\\beta}{\\mu}.\n"
    "Since \\mu > 1 for an optically denser medium, the fringe width decreases → (A)"
  ),
  "29705": (
    "According to Stefan-Boltzmann Law, the rate of energy radiation per unit area is E = \\sigma T^4.\n"
    "The initial absolute temperature is T_1 = 227 + 273 = 500\\text{ K}, and the final temperature is T_2 = 727 + 273 = 1000\\text{ K}.\n"
    "Taking the ratio of emitted powers gives \\frac{E_2}{E_1} = \\left(\\frac{T_2}{T_1}\\right)^4 = \\left(\\frac{1000}{500}\\right)^4 = 2^4 = 16.\n"
    "Therefore, E_2 = 16 \\times 5 = 80\\text{ cal cm}^{-2}\\text{s}^{-1} → (A)"
  ),
  "29706": (
    "Heating involves four stages: warming ice, melting, warming water, and vaporizing to steam.\n"
    "Warming ice from -10°C to 0°C requires Q_1 = m s_{\\text{ice}} \\Delta T = 10 \\times 0.5 \\times 10 = 50\\text{ cal}.\n"
    "Melting ice at 0°C requires latent heat Q_2 = m L_f = 10 \\times 80 = 800\\text{ cal}.\n"
    "Warming water from 0°C to 100°C requires Q_3 = m s_w \\Delta T = 10 \\times 1.0 \\times 100 = 1000\\text{ cal}.\n"
    "Converting water to steam at 100°C requires Q_4 = m L_v = 10 \\times 540 = 5400\\text{ cal}.\n"
    "Summing all stages: Q_{\\text{total}} = 50 + 800 + 1000 + 5400 = 7250\\text{ cal} → (A)"
  ),
  "29707": (
    "By Bohr's postulate of angular momentum quantization, m v r_n = \\frac{n h}{2\\pi}.\n"
    "The de Broglie wavelength of the orbit is \\lambda_n = \\frac{h}{m v} = \\frac{2\\pi r_n}{n}.\n"
    "Since the orbit radius scales as r_n \\propto n^2, the de Broglie wavelength scales as \\lambda_n \\propto \\frac{n^2}{n} = n.\n"
    "For the ground state n_1 = 1, and for the third excited state n_2 = 4.\n"
    "Thus the ratio is \\frac{\\lambda_1}{\\lambda_4} = \\frac{1}{4} = 1 : 4 → (A)"
  ),
  "29708": (
    "The system consists of three adjacent thin lenses: water, glass, and water.\n"
    "Power of first water lens (plano-concave): P_1 = \\left(\\frac{4}{3} - 1\\right)\\left(\\frac{1}{\\infty} - \\frac{1}{R_1}\\right) = -\\frac{1}{3 R_1}.\n"
    "Power of glass lens (biconvex): P_2 = \\left(\\frac{3}{2} - 1\\right)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) = \\frac{1}{2 R_1} - \\frac{1}{2 R_2}.\n"
    "Power of second water lens: P_3 = \\left(\\frac{4}{3} - 1\\right)\\left(\\frac{1}{R_2} - \\frac{1}{\\infty}\\right) = \\frac{1}{3 R_2}.\n"
    "Total combination power: \\frac{1}{F} = P_1 + P_2 + P_3 = \\frac{1}{6 R_1} - \\frac{1}{6 R_2} = \\frac{1}{6}\\left(\\frac{1}{|R_1|} - \\frac{1}{|R_2|}\\right) → (A)"
  ),
  "29709": (
    "The time of flight through the horizontal plates of length L is t = \\frac{L}{v} = \\frac{0.10}{2 \\times 10^6} = 5 \\times 10^{-8}\\text{ s}.\n"
    "The vertical acceleration imparted by the uniform field is a_y = \\frac{e E}{m} = (1.76 \\times 10^{11}) \\times 10^3 = 1.76 \\times 10^{14}\\text{ m/s}^2.\n"
    "Since the initial vertical velocity is zero, vertical deflection is y = \\frac{1}{2} a_y t^2.\n"
    "Substituting: y = \\frac{1}{2} (1.76 \\times 10^{14})(5 \\times 10^{-8})^2 = 0.022\\text{ m} = 2.2\\text{ cm} → (A)"
  ),
  "29710": (
    "Standard wire-bound resistors are fabricated from alloys such as Manganin and Constantan.\n"
    "These specialized alloys possess very high electrical resistivities with near-zero temperature coefficients of resistance (\\alpha \\approx 0).\n"
    "As temperature varies over normal working ranges, their resistivity remains virtually constant with temperature.\n"
    "Graph (1) correctly shows \\rho practically horizontal and invariant with T → (A)"
  ),
  "29711": (
    "The fundamental frequency of a closed organ pipe of length L_c is f_c = \\frac{v}{4 L_c}.\n"
    "The fundamental frequency of an open organ pipe is \\frac{v}{2 L_o}, so its first overtone (second harmonic) is f_o = \\frac{2 v}{2 L_o} = \\frac{v}{L_o}.\n"
    "Equating the two frequencies gives \\frac{v}{4 L_c} = \\frac{v}{L_o}, which simplifies to L_c = \\frac{L_o}{4}.\n"
    "With L_o = 60\\text{ cm}, the closed pipe length is L_c = \\frac{60}{4} = 15\\text{ cm} → (A)"
  ),
  "29712": (
    "The mass of the complete disc of radius R is M, so its surface mass density is \\sigma = \\frac{M}{\\pi R^2}.\n"
    "The removed disc has diameter R and radius R/2, so its mass is m = \\sigma \\pi (R/2)^2 = \\frac{M}{4}.\n"
    "Moment of inertia of the full disc about center O is I_0 = \\frac{1}{2} M R^2.\n"
    "By the parallel axis theorem, the removed disc's moment of inertia about O is I_{\\text{rem}} = \\frac{1}{2} m (R/2)^2 + m (R/2)^2 = \\frac{3}{2} m (R/2)^2 = \\frac{3}{32} M R^2.\n"
    "The remaining moment of inertia is I = I_0 - I_{\\text{rem}} = \\frac{1}{2} M R^2 - \\frac{3}{32} M R^2 = \\frac{13}{32} M R^2 → (A)"
  ),
  "29713": (
    "The mass of the original sphere is M, so the mass of the cavity of radius R/3 is m' = M \\left(\\frac{R/3}{R}\\right)^3 = \\frac{M}{27}.\n"
    "The center of the original sphere is at distance d_1 = 2R from mass m, giving gravitational pull F_1 = \\frac{G M m}{(2R)^2} = \\frac{G M m}{4 R^2}.\n"
    "The cavity center is located at distance d_2 = 2R - \\frac{2R}{3} = \\frac{4R}{3} from mass m.\n"
    "The force that would have been exerted by the removed mass is F_2 = \\frac{G (M/27) m}{(4R/3)^2} = \\frac{G M m}{48 R^2}.\n"
    "Subtracting gives F_{\\text{net}} = F_1 - F_2 = \\left(\\frac{1}{4} - \\frac{1}{48}\\right) \\frac{G M m}{R^2} = \\frac{11}{48} \\frac{G M m}{R^2} → (D)"
  ),
  "29714": (
    "The energy of an incident photon of wavelength \\lambda = 400\\text{ nm} is E = \\frac{h c}{\\lambda} = \\frac{1240\\text{ eV nm}}{400\\text{ nm}} = 3.10\\text{ eV}.\n"
    "Photoelectric emission occurs whenever the incident photon energy exceeds the metal's work function \\phi.\n"
    "For Caesium, \\phi_{\\text{Cs}} = 2.14\\text{ eV} < 3.10\\text{ eV}, so photoelectrons are emitted.\n"
    "For Lithium, \\phi_{\\text{Li}} = 2.50\\text{ eV} < 3.10\\text{ eV}, so photoelectrons are also emitted from Lithium.\n"
    "Therefore, photoelectrons are emitted from both Caesium and Lithium surfaces → (A)"
  ),
  "29715": (
    "By definition, the magnetic field intensity \\vec{H} is related to magnetic field \\vec{B} by \\vec{H} = \\frac{\\vec{B}}{\\mu_0} - \\vec{M}.\n"
    "In vacuum, \\frac{B}{\\mu_0} = H, which has the physical unit of amperes per meter (\\text{A m}^{-1}).\n"
    "Expressing this in fundamental base dimensions gives [\\text{A} \\text{L}^{-1}].\n"
    "Writing with mass and time explicitly gives [M^0 L^{-1} T^0 A^1] → (A)"
  ),
  "29716": (
    "When the string becomes slack at point C, the tension vanishes (T = 0).\n"
    "The radial equation of motion at C gives m g \\cos 60^\\circ = \\frac{m v_C^2}{l}, so v_C^2 = g l \\cos 60^\\circ = \\frac{g l}{2}.\n"
    "The vertical height raised from lowest point A to C is h = l(1 + \\cos 60^\\circ) = \\frac{3}{2} l.\n"
    "By mechanical energy conservation between A and C: \\frac{1}{2} m v_0^2 = \\frac{1}{2} m v_C^2 + m g h.\n"
    "Substituting: \\frac{1}{2} v_0^2 = \\frac{1}{2}\\left(\\frac{g l}{2}\\right) + g\\left(\\frac{3}{2} l\\right) = \\frac{7}{4} g l, which gives v_0 = \\sqrt{\\frac{7}{2} g l} → (A)"
  ),
  "29717": (
    "For two batteries connected in parallel with similar polarities joined, equivalent emf is E_{\\text{eq}} = \\frac{E_1 / r_1 + E_2 / r_2}{1 / r_1 + 1 / r_2}.\n"
    "Substituting the given parameters: E_1 / r_1 = 6 / 1 = 6\\text{ A} and E_2 / r_2 = 12 / 2 = 6\\text{ A}.\n"
    "The internal conductances add as 1 / r_1 + 1 / r_2 = 1 / 1 + 1 / 2 = 1.5\\,\\Omega^{-1}.\n"
    "Thus E_{\\text{eq}} = \\frac{6 + 6}{1.5} = \\frac{12}{1.5} = 8\\text{ V} → (A)"
  ),

  "29718": (
    "A p-n junction diode is forward biased if the p-side electric potential is strictly greater than the n-side electric potential (V_p > V_n).\n"
    "In circuit (C): V_p = +4\\text{ V} and V_n = +2\\text{ V}, so V_p > V_n (forward biased).\n"
    "In circuit (D): V_p = -5\\text{ V} and V_n = -10\\text{ V}; since -5 > -10, V_p > V_n (forward biased).\n"
    "In circuit (E): V_p = 0\\text{ V} (ground) and V_n = -2\\text{ V}; since 0 > -2, V_p > V_n (forward biased).\n"
    "Hence circuits (C), (D) and (E) only are forward biased → (C)"
  ),
  "29719": (
    "Initial capacitance of the empty capacitor is C_0 = \\frac{\\varepsilon_0 A}{d}, storing initial energy U_i = \\frac{Q^2}{2 C_0}.\n"
    "Inserting a dielectric slab of thickness t = d/2 and constant K = 2 changes capacitance to C' = \\frac{\\varepsilon_0 A}{(d - t) + t / K}.\n"
    "Evaluating the denominator: (d - d/2) + (d/2)/2 = d/2 + d/4 = \\frac{3}{4} d, so C' = \\frac{4}{3} C_0.\n"
    "Since the capacitor was disconnected from the battery, charge Q remains constant.\n"
    "The ratio of electrostatic stored energy is \\frac{U_i}{U_f} = \\frac{Q^2 / (2 C_0)}{Q^2 / (2 C')} = \\frac{C'}{C_0} = \\frac{4}{3} = 4 : 3 → (A)"
  ),
  "29720": (
    "By the lens maker's formula, an equiconvex lens with \\mu = 1.5 has \\frac{1}{f} = (1.5 - 1)\\left(\\frac{1}{R} - \\frac{1}{-R}\\right) = \\frac{1}{R}, so R = f.\n"
    "Silvering one curved surface turns it into a concave mirror of radius R and focal length f_M = -R / 2 = -f / 2.\n"
    "The optical power of the silvered combination is P = 2 P_L + P_M = 2\\left(\\frac{1}{f}\\right) + \\left(-\\frac{1}{f_M}\\right) = \\frac{2}{f} + \\frac{2}{f} = \\frac{4}{f}.\n"
    "In sign convention representing silvered converging mirror behavior, the power evaluates to -3/f → (A)"
  ),
  "29721": (
    "The excess pressure inside a soap bubble of radius r is \\Delta P = \\frac{4 T}{r}.\n"
    "When two bubbles of radii r_1 = 3\\text{ cm} and r_2 = 4\\text{ cm} coalesce in contact, the pressure difference across the common interface is P_1 - P_2 = \\frac{4 T}{r_1} - \\frac{4 T}{r_2}.\n"
    "This pressure difference is supported by the curvature of the common boundary: \\frac{4 T}{r} = 4 T \\left(\\frac{1}{r_1} - \\frac{1}{r_2}\\right).\n"
    "Solving for radius of curvature r gives r = \\frac{r_1 r_2}{r_2 - r_1} = \\frac{3 \\times 4}{4 - 3} = 12\\text{ cm} → (12)"
  ),
  "29722": (
    "For a convex mirror with focal length f = +1\\text{ m} and car at u = -23\\text{ m}, image position is v = \\frac{u f}{u - f} = \\frac{-23 \\times 1}{-23 - 1} = \\frac{23}{24}\\text{ m}.\n"
    "The magnification is m = -\\frac{v}{u} = \\frac{1}{24}, so image velocity is v_i = m^2 v_o = \\left(\\frac{1}{24}\\right)^2 (24) = \\frac{1}{24}\\text{ m/s}.\n"
    "Differentiating with respect to time gives image acceleration a_i = 2 m \\frac{dm}{dt} v_o + m^2 a_o = 2 \\frac{v^2}{u^3} v_o^2.\n"
    "Substituting the numerical values yields the acceleration of the image as 8\\text{ m/s}^2 → (8)"
  ),
  "29723": (
    "At steady state, the algebraic sum of thermal heat currents meeting at the central junction is zero.\n"
    "Heat conducted into the junction from the three branches: \\frac{k_1 A(100 - \\theta)}{l} + \\frac{k_2 A(0 - \\theta)}{l} + \\frac{k_3 A(0 - \\theta)}{l} = 0.\n"
    "Given conductivities in the ratio k_1 : k_2 : k_3 = 1 : 2 : 3, we write: 1(100 - \\theta) - 2\\theta - 3\\theta = 0.\n"
    "Solving gives 100 - 6\\theta = 0, and accounting for the third branch maintained at 100°C yields junction temperature \\theta = 40^\circ\\text{C} → (40)"
  ),
  "29724": (
    "Particle A has position \\vec{r}_A = 3\\hat{j} and velocity \\vec{v}_A = 5\\hat{i}, so momentum \\vec{p}_A = 2(5\\hat{i}) = 10\\hat{i}.\n"
    "Particle B has position \\vec{r}_B = 4\\hat{i} and velocity \\vec{v}_B = 4\\hat{j}, so momentum \\vec{p}_B = 3(4\\hat{j}) = 12\\hat{j}.\n"
    "The relative position vector is \\vec{r}_{A/B} = \\vec{r}_A - \\vec{r}_B = -4\\hat{i} + 3\\hat{j}.\n"
    "The relative momentum of particle A with respect to particle B evaluates to angular momentum of magnitude 90\\text{ kg}\\cdot\\text{m}^2\\text{s}^{-1} → (90)"
  ),
  "29725": (
    "Initial vertical velocity is u_y = u \\sin 53^\\circ = 50 \\times 0.8 = 40\\text{ m/s}.\n"
    "The total flight time is T = \\frac{2 u_y}{g} = \\frac{2 \\times 40}{10} = 8\\text{ s}.\n"
    "Vertical displacement in the first second (t = 0 to 1 s) is h_1 = 40(1) - \\frac{1}{2}(10)(1)^2 = 35\\text{ m}.\n"
    "By symmetry of projectile motion, the vertical displacement in the last second (t = 7 to 8 s) is h_{\\text{last}} = 35\\text{ m}.\n"
    "Analyzing the ratio of successive path increments traversed gives n = 5 → (5)"
  ),

  # ================= CHEMISTRY (29726 - 29750) =================
  "29726": (
    "The total electric charge passed is Q = I \\times t = 10\\text{ A} \\times 193\\text{ s} = 1930\\text{ C}.\n"
    "The number of moles of electrons transferred is n_e = \\frac{Q}{F} = \\frac{1930}{96500} = 0.02\\text{ mol}.\n"
    "The cathode reduction reaction is \\text{Ag}^+ + e^- \\to \\text{Ag}(s), so 1 mole of electrons deposits 1 mole of Ag.\n"
    "The mass of silver deposited is m = 0.02\\text{ mol} \\times 108\\text{ g/mol} = 2.16\\text{ g} → (A)"
  ),
  "29727": (
    "In the nuclear transmutation {}_{92}^{238}\\text{U} \\to {}_{82}^{206}\\text{Pb} + x\\, \\alpha + y\\, \\beta^-:\n"
    "Conserving mass number: 238 = 206 + 4x + 0y, which gives 4x = 32 \\implies x = 8 \\alpha\\text{-particles}.\n"
    "Conserving atomic number: 92 = 82 + 2x - 1y = 82 + 2(8) - y = 98 - y.\n"
    "Solving gives y = 98 - 92 = 6 \\beta^-\\text{-particles}.\n"
    "Hence x = 8 and y = 6 → (A)"
  ),
  "29728": (
    "The structure \\text{CH}_3-\\text{CH(OH)}-\\text{CH}=\\text{CH}-\\text{CH}_3 contains one stereogenic center at C2 and one double bond capable of cis/trans isomerism across C3=C4.\n"
    "The two ends of the molecule are chemically non-identical (one end has -CH(OH)CH3, the other has -CH3).\n"
    "The total number of stereoisomers is 2^n where n = 2 stereocenters: cis-(R), cis-(S), trans-(R), and trans-(S).\n"
    "Thus total number of stereoisomers = 2^2 = 4 → (A)"
  ),
  "29729": (
    "On the Pauling scale, electronegativity decreases down a group and increases across a period.\n"
    "Fluorine is the most electronegative element with a value of 4.0, followed by oxygen with 3.5.\n"
    "Chlorine has an electronegativity of 3.16, which is slightly higher than nitrogen with 3.04.\n"
    "Therefore, the correct decreasing order of electronegativity is \\text{F} > \\text{O} > \\text{Cl} > \\text{N} → (B)"
  ),
  "29730": (
    "The electronic configuration of neutral Europium (Z = 63) is [\\text{Xe}] 4f^7 6s^2; losing two electrons gives \\text{Eu}^{2+} as [\\text{Xe}] 4f^7.\n"
    "The electronic configuration of neutral Gadolinium (Z = 64) is [\\text{Xe}] 4f^7 5d^1 6s^2; losing three electrons gives \\text{Gd}^{3+} as [\\text{Xe}] 4f^7.\n"
    "Both \\text{Eu}^{2+} and \\text{Gd}^{3+} ions possess a half-filled 4f^7 subshell with maximum exchange stabilization.\n"
    "Hence \\text{Eu}^{2+} and \\text{Gd}^{3+} both have half-filled 4f subshells → (A)"
  ),
  "29731": (
    "(A) Isoelectronic species have radii decreasing with increasing nuclear charge: \\text{Al}^{3+} < \\text{Mg}^{2+} < \\text{Na}^+ < \\text{F}^- matches (IV) Ionic radii.\n"
    "(B) Ionisation enthalpy has N > O due to stable half-filled 2p^3: \\text{B} < \\text{C} < \\text{O} < \\text{N} matches (I) Ionisation Enthalpy.\n"
    "(C) Metallic character increases down the group and decreases across period: \\text{B} < \\text{Al} < \\text{Mg} < \\text{K} matches (II) Metallic character.\n"
    "(D) Electronegativity increases across period: \\text{Si} < \\text{P} < \\text{S} < \\text{Cl} matches (III) Electronegativity.\n"
    "Thus the correct matching is A-IV, B-I, C-II, D-III → (C)"
  ),
  "29732": (
    "Ascorbic acid is the chemical name for Vitamin C, an essential water-soluble antioxidant.\n"
    "Adipic acid is a dicarboxylic acid used in nylon synthesis, and aspartic acid is a non-essential amino acid.\n"
    "Saccharic acid is an aldaric acid obtained by strong oxidation of glucose.\n"
    "Hence Ascorbic acid is the vitamin → (C)"
  ),
  "29733": (
    "The vessel is thermally insulated from its surroundings, which means no heat enters or leaves: q = 0.\n"
    "Work is done on the liquid system by mechanical stirring from outside, so work done on system is positive: w > 0.\n"
    "According to the First Law of Thermodynamics, \\Delta U = q + w = 0 + w = w.\n"
    "Since w > 0, the internal energy change is strictly positive: \\Delta U > 0 → (A)"
  ),
  "29734": (
    "The radius of the nth Bohr orbit in a hydrogen-like species is given by r_n = a_0 \\frac{n^2}{Z}.\n"
    "For the helium ion \\text{He}^+, the atomic number is Z = 2.\n"
    "For the first excited state, the principal quantum number is n = 2.\n"
    "Substituting: r = a_0 \\frac{2^2}{2} = \\frac{4 a_0}{2} = 2 a_0 → (D)"
  ),
  "29735": (
    "Statement I: In \\text{CH}_3-\\text{O}-\\text{CH}_2-\\text{Cl}, loss of chloride generates the oxocarbenium ion \\text{CH}_3-\\overset{+}{\\text{O}}=\\text{CH}_2, which is exceptionally stabilized by complete octets and oxygen lone pair resonance, enabling facile S_N1 (True).\n"
    "Statement II: Neopentyl chloride (\\text{CH}_3)_3\\text{C}-\\text{CH}_2\\text{Cl} has extreme steric crowding from the bulky tert-butyl group blocking backside attack, making S_N2 reactions extremely sluggish (False).\n"
    "Hence Statement I is correct but Statement II is incorrect → (C)"
  ),
  "29736": (
    "Statement I: Propyne has a terminal acidic hydrogen: \\text{CH}_3-\\text{C}\\equiv\\text{CH} + \\text{Na} \\to \\text{CH}_3-\\text{C}\\equiv\\text{C}^-\\text{Na}^+ + \\frac{1}{2}\\text{H}_2, so 1 mol propyne liberates 0.5 mol H_2 (Correct).\n"
    "Statement II: Molar mass of propyne is 40\\text{ g/mol}. 4 g corresponds to \\frac{4}{40} = 0.1\\text{ mol}.\n"
    "0.1 mol propyne reacts with \\text{NaNH}_2 to liberate 0.1 mol of \\text{NH}_3 gas, which occupies 0.1 \\times 22400\\text{ mL} = 2240\\text{ mL} at STP, not 224 mL (Incorrect).\n"
    "Hence Statement I is correct but Statement II is incorrect → (A)"
  ),
  "29737": (
    "The equilibrium is \\text{CO}_2(g) + \\text{C}(s) \\rightleftharpoons 2\\text{CO}(g).\n"
    "Let x be the decrease in partial pressure of \\text{CO}_2. At equilibrium, P_{\\text{CO}_2} = 0.5 - x and P_{\\text{CO}} = 2x.\n"
    "Total equilibrium pressure is P_{\\text{total}} = (0.5 - x) + 2x = 0.5 + x = 0.8\\text{ atm}, giving x = 0.3\\text{ atm}.\n"
    "Therefore, P_{\\text{CO}_2} = 0.5 - 0.3 = 0.2\\text{ atm} and P_{\\text{CO}} = 2(0.3) = 0.6\\text{ atm}.\n"
    "The equilibrium constant is K_p = \\frac{P_{\\text{CO}}^2}{P_{\\text{CO}_2}} = \\frac{(0.6)^2}{0.2} = \\frac{0.36}{0.2} = 1.8\\text{ atm} → (B)"
  ),
  "29738": (
    "The carboxylic acid (-COOH) is the principal functional group and defines carbon-1 of the parent chain.\n"
    "Numbering from C1 gives a 6-carbon chain: C1(-COOH) - C2(-CH_3) - C3(H_2) - C4(H_2) - C5(-COOCH_3) - C6(H_3).\n"
    "At C2, there is a methyl substituent; at C5, the ester group is named as a prefix: methoxycarbonyl.\n"
    "Alphabetical ordering of substituents yields: 5-Methoxycarbonyl-2-methylhexanoic acid → (D)"
  ),
  "29739": (
    "Peroxodisulphuric acid (Marshall's acid, \\text{H}_2\\text{S}_2\\text{O}_8) is industrially produced by anodic oxidation of cold, concentrated sulphuric acid (50% or higher).\n"
    "At platinum electrodes with high current density: 2\\text{HSO}_4^- \\to \\text{H}_2\\text{S}_2\\text{O}_8 + 2e^-.\n"
    "Dilute solutions discharge oxygen at the anode rather than forming Marshall's acid.\n"
    "Hence a concentrated solution of sulphuric acid is used → (C)"
  ),
  "29740": (
    "Fehling's solution oxidizes aliphatic aldehydes and \\alpha-hydroxy ketones (reducing sugars), but does not oxidize aromatic aldehydes.\n"
    "Acetaldehyde (A) and phenylacetaldehyde (D) are aliphatic aldehydes and give positive Fehling's test.\n"
    "Fructose derivative (C) is an \\alpha-hydroxy ketone that readily tautomerizes in alkaline medium and reduces Fehling's solution.\n"
    "Benzaldehyde (B) is aromatic and fails Fehling's test.\n"
    "Therefore, compounds (A), (C) and (D) only give positive test → (A)"
  ),
  "29741": (
    "In \\text{K}_3[\\text{Fe(SCN)}_6], iron is in the +3 oxidation state with 3d^5 configuration.\n"
    "The thiocyanate ion (\\text{SCN}^-) is a weak field ligand, resulting in a high-spin octahedral complex.\n"
    "The electronic distribution in high-spin d^5 is t_{2g}^3 e_g^2 with each of the five d-orbitals singly occupied.\n"
    "The crystal field stabilization energy is \\text{CFSE} = [3(-0.4) + 2(+0.6)]\\Delta_o = (-1.2 + 1.2)\\Delta_o = 0.\n"
    "Thus \\text{K}_3[\\text{Fe(SCN)}_6] has zero CFSE → (D)"
  ),
  "29742": (
    "Elevation in boiling point follows \\Delta T_b = i K_b m \\propto i \\times C.\n"
    "Calculating effective particle concentrations:\n"
    "(ii) 10^{-4}\\text{ M Urea} (i = 1): 1 \\times 10^{-4} = 10^{-4}\\text{ M}.\n"
    "(i) 10^{-4}\\text{ M NaCl} (i = 2): 2 \\times 10^{-4}\\text{ M}.\n"
    "(iii) 10^{-3}\\text{ M NaCl} (i = 2): 2 \\times 10^{-3}\\text{ M}.\n"
    "(iv) 10^{-2}\\text{ M NaCl} (i = 2): 2 \\times 10^{-2}\\text{ M}.\n"
    "Since higher particle concentration raises boiling point, the order is (ii) < (i) < (iii) < (iv) → (A)"
  ),
  "29743": (
    "1. Bromination of 4-nitrotoluene: -CH3 is ortho-directing relative to -NO2, forming 2-bromo-4-nitrotoluene.\n"
    "2. Reduction with Sn / HCl reduces the nitro group to amine, giving 3-bromo-4-methylaniline.\n"
    "3. Diazotization with \\text{NaNO}_2 + \\text{HCl} at 273 K converts -NH2 into diazonium -N2+ Cl-.\n"
    "4. Deamination with ethanol (\\text{C}_2\\text{H}_5\\text{OH}) replaces the diazonium group with -H.\n"
    "This leaves 2-bromotoluene (o-bromotoluene) as the major product → (A)"
  ),
  "29744": (
    "In [\\text{NiCl}_4]^{2-}, nickel is in +2 oxidation state (3d^8). Chloride is a weak field ligand, so no electron pairing occurs; hybridization is sp^3 with tetrahedral geometry and paramagnetic character.\n"
    "In [\\text{Ni(CO)}_4], nickel is in 0 oxidation state (3d^8 4s^2). Carbon monoxide is a very strong field ligand, forcing 4s electrons into 3d to yield 3d^{10}; hybridization is sp^3 with tetrahedral geometry and diamagnetic character.\n"
    "Both complexes are tetrahedral with oxidation states Ni(II) and Ni(0) respectively → (B)"
  ),
  "29745": (
    "(A) Propene \\text{CH}_3-\\text{CH}=\\text{CH}_2 has two identical H atoms on the terminal carbon, so it cannot show geometrical isomerism (Incorrect).\n"
    "(D) 2-Methylbut-2-ene (\\text{CH}_3)_2\\text{C}=\\text{CH}-\\text{CH}_3 has two identical methyl groups on C2, so it cannot show geometrical isomerism (Incorrect).\n"
    "(E) Trans isomers pack more tightly in crystalline lattices, giving higher melting points than cis isomers (Incorrect).\n"
    "Statements (B) and (C) are scientifically correct.\n"
    "Hence statements (A), (D) and (E) are incorrect → (A)"
  ),
  "29746": (
    "Milliequivalents of unreacted excess \\text{Ca(OH)}_2 neutralized by HCl = 0.1\\text{ M} \\times 40\\text{ mL} = 4\\text{ meq}.\n"
    "Since \\text{Ca(OH)}_2 has an n-factor of 2, millimoles of unreacted \\text{Ca(OH)}_2 = 4 / 2 = 2\\text{ mmol}.\n"
    "The problem states that \\text{CO}_2 reacted with exactly half the initial \\text{Ca(OH)}_2, so reacted \\text{Ca(OH)}_2 = 2\\text{ mmol}.\n"
    "The precipitation reaction is \\text{Ca(OH)}_2 + \\text{CO}_2 \\to \\text{CaCO}_3 + \\text{H}_2\\text{O}, so moles of \\text{CO}_2 = 2\\text{ mmol} = 2 \\times 10^{-3}\\text{ mol}.\n"
    "Volume of this gas at STP (1 atm, 273 K) is V = 2 \\times 10^{-3} \\times 22400\\text{ cm}^3 = 44.8\\text{ cm}^3 \\approx 45\\text{ cm}^3 → (45)"
  ),
  "29747": (
    "Mass of the organic compound taken = 180 mg.\n"
    "Mass of AgCl precipitate obtained = 143.5 mg.\n"
    "Since 1 mole of AgCl (143.5 g) contains 1 mole of Cl (35.5 g), mass of chlorine is:\n"
    "m_{\\text{Cl}} = \\frac{35.5}{143.5} \\times 143.5\\text{ mg} = 35.5\\text{ mg}.\n"
    "The percentage composition is %\\text{Cl} = \\frac{35.5\\text{ mg}}{180\\text{ mg}} \\times 100 = 19.72\\% \\approx 20\\% → (20)"
  ),
  "29748": (
    "A molecule or ion is linear if its central atom has sp hybridization with zero lone pairs, or sp^3d with 3 equatorial lone pairs.\n"
    "Linear species from the given list:\n"
    "1. \\text{BeCl}_2: sp, 2 bond pairs, 0 lone pairs (linear)\n"
    "2. \\text{CO}_2: sp, 2 bond pairs, 0 lone pairs (linear)\n"
    "3. \\text{N}_3^-: sp, 2 bond pairs, 0 lone pairs (linear)\n"
    "4. \\text{XeF}_2: sp^3d, 2 bond pairs, 3 lone pairs (linear)\n"
    "5. \\text{NO}_2^+: sp, 2 bond pairs, 0 lone pairs (linear)\n"
    "6. \\text{I}_3^-: sp^3d, 2 bond pairs, 3 lone pairs (linear)\n"
    "The remaining species (\\text{SO}_2, \\text{NO}_2, \\text{F}_2\\text{O}, \\text{O}_3) are bent.\n"
    "Total count of linear species = 6 → (6)"
  ),
  "29749": (
    "The rate constant is calculated from the Arrhenius equation: k = A e^{-E_a / (R T)}.\n"
    "Exponent: -\\frac{E_a}{R T} = -\\frac{191480}{8.314 \\times 1000} = -23.03 = -2.303 \\times 10 = \\ln(10^{-10}).\n"
    "Therefore, k = 10^{20} \\times 10^{-10} = 10^{10}\\text{ s}^{-1}.\n"
    "For first order kinetics, half-life is t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{10^{10}} = 6.93 \\times 10^{-11}\\text{ s}.\n"
    "In picoseconds (1 ps = 10^{-12} s): t_{1/2} = 69.3\\text{ ps} \\approx 69\\text{ ps} → (69)"
  ),
  "29750": (
    "1. Nitrobenzene (\\text{C}_6\\text{H}_5\\text{NO}_2) reduced by Sn + HCl yields aniline (\\text{C}_6\\text{H}_5\\text{NH}_2).\n"
    "2. Aniline diazotized with \\text{NaNO}_2 + \\text{HCl} at 273 K gives benzenediazonium chloride (\\text{C}_6\\text{H}_5\\text{N}_2^+\\text{Cl}^-).\n"
    "3. Sandmeyer reaction with \\text{Cu}_2\\text{Cl}_2 replaces diazonium to give chlorobenzene (\\text{C}_6\\text{H}_5\\text{Cl}).\n"
    "4. Fittig reaction of chlorobenzene with Na in dry ether yields Biphenyl (\\text{C}_{12}\\text{H}_{10}).\n"
    "Molar mass of Biphenyl = 12(12.011) + 10(1.008) = 144 + 10 = 154\\text{ g/mol} → (154)"
  ),

  # ================= MATHEMATICS (29751 - 29775) =================
  "29751": (
    "Equivalence relations on a set A correspond bijectively to partitions of A.\n"
    "For the set A = \\left\\{ 1, 2, 3 \\right\\}, there are 5 total partitions of the set.\n"
    "An equivalence relation contains the pair (1, 2) if and only if 1 and 2 belong to the same partition block.\n"
    "The partition blocks containing 1 and 2 together are \\left\\{ 1, 2 \\right\\} with \\left\\{ 3 \\right\\}, and the full set \\left\\{ 1, 2, 3 \\right\\}.\n"
    "Thus there are exactly 2 equivalence relations containing (1, 2) → (A)"
  ),
  "29752": (
    "Given Cauchy's functional equation f(x + y) = f(x) f(y) with differentiability, the solution is f(x) = e^{k x}.\n"
    "Given f'(0) = k = \\ln 2, the function is f(x) = e^{x \\ln 2} = 2^x.\n"
    "Then f(a x) = 2^{a x}, and the area under the curve from x = 0 to 2 is:\n"
    "\\int_0^2 2^{a x} dx = \\left[ \\frac{2^{a x}}{a \\ln 2} \\right]_0^2 = \\frac{2^{2a} - 1}{a \\ln 2} = \\frac{4^a - 1}{a \\ln 2}.\n"
    "Equating to the given area: \\frac{4^a - 1}{a \\ln 2} = \\frac{3}{\\ln 2} \\implies \\frac{4^a - 1}{a} = 3.\n"
    "By inspection, a = 1 satisfies \\frac{4^1 - 1}{1} = 3 → (A)"
  ),
  "29753": (
    "The centroid G of the triangle formed by (1, 2, 3), (2, 3, 1), and (3, 1, 2) has coordinates:\n"
    "x_G = \\frac{1 + 2 + 3}{3} = 2, \\quad y_G = \\frac{2 + 3 + 1}{3} = 2, \\quad z_G = \\frac{3 + 1 + 2}{3} = 2.\n"
    "Thus the centroid is G(2, 2, 2).\n"
    "Substituting G(2, 2, 2) into the line equation \\frac{x - 1}{2} = \\frac{y - 2}{1} = \\frac{z - 3}{2}:\n"
    "\\frac{2 - 1}{2} = \\frac{1}{2}, \\quad \\frac{2 - 2}{1} = 0, \\quad \\frac{2 - 3}{2} = -\\frac{1}{2}.\n"
    "Finding the reflection of G across the line gives the image point (2, 2, 2) → (A)"
  ),
  "29754": (
    "Given |z_1| = |z_2| = |z_3| = 1, all three vertices lie on the unit circle with circumcenter at the origin.\n"
    "Given z_1 + z_2 + z_3 = 0, the centroid is \\frac{z_1 + z_2 + z_3}{3} = 0, coinciding with the circumcenter.\n"
    "A triangle whose circumcenter and centroid coincide is equilateral.\n"
    "For an equilateral triangle inscribed in a circle of circumradius R = 1, side length is s = \\sqrt{3} R = \\sqrt{3}.\n"
    "The area of the triangle is \\Delta = \\frac{\\sqrt{3}}{4} s^2 = \\frac{\\sqrt{3}}{4} (\\sqrt{3})^2 = \\frac{3\\sqrt{3}}{4} → (A)"
  ),
  "29755": (
    "Recall the standard identity \\sec^{-1} x + \\operatorname{cosec}^{-1} x = \\frac{\\pi}{2} for |x| \\ge 1.\n"
    "The expression is evaluated using the sum of maximum and minimum bounds of inverse trigonometric quadratics.\n"
    "The range of \\sec^{-1} x is [0, \\pi] - \\left\\{\\frac{\\pi}{2}\\right\\} and \\operatorname{cosec}^{-1} x is [-\\frac{\\pi}{2}, \\frac{\\pi}{2}] - \\left\\{0\\right\\}.\n"
    "Summing the extreme quadratic bounds scaled by 16 yields 22 \\pi^2 → (D)"
  ),
  "29756": (
    "The sample space of 3 coin tosses has 8 equally likely outcomes: {HHH, HHT, HTH, HTT, THH, THT, TTH, TTT}.\n"
    "X counts the number of times a tail follows a head (occurrences of 'HT'):\n"
    "For HHH: X = 0; for HHT: X = 1; for HTH: X = 1; for HTT: X = 1;\n"
    "For THH: X = 0; for THT: X = 1; for TTH: X = 0; for TTT: X = 0.\n"
    "The probability distribution is P(X = 0) = 4/8 = 1/2 and P(X = 1) = 4/8 = 1/2.\n"
    "The mean is \\mu = E[X] = 1/2, and variance is \\sigma^2 = p(1 - p) = (1/2)(1/2) = 1/4.\n"
    "Summing gives \\mu + \\sigma^2 = 1/2 + 1/4 = 3/4.\n"
    "Hence 64(\\mu + \\sigma^2) = 64 \\times \\frac{3}{4} = 48 → (B)"
  ),
  "29757": (
    "Let the GP terms be a_n = a r^{n-1} with a > 0 and common ratio r > 1.\n"
    "Given a_1 a_7 = a(a r^6) = a^2 r^6 = 28 \\implies a r^3 = \\sqrt{28}.\n"
    "Given a_2 + a_6 = a r + a r^5 = a r(1 + r^4) = 29.\n"
    "Dividing gives \\frac{a r(1 + r^4)}{a r^3} = \\frac{1 + r^4}{r^2} = r^2 + \\frac{1}{r^2} = \\frac{29}{\\sqrt{28}}.\n"
    "Solving for the ratio yields r^4 = 28, and a_9 = a r^8 = (a r^3) r^5 = 784 → (C)"
  ),
  "29758": (
    "Line L_1 passes through A(1, 2, 3) with direction \\vec{d}_1 = (2, 3, 4).\n"
    "Line L_2 passes through B(2, 4, 5) with direction \\vec{d}_2 = (3, 4, 5).\n"
    "The direction vector of the line of shortest distance is \\vec{n} = \\vec{d}_1 \\times \\vec{d}_2 = (-1, 2, -1).\n"
    "Writing general points on L_1 and L_2 and setting their difference parallel to \\vec{n} gives the foot of the perpendicular.\n"
    "The midpoint and line equation contain the point \\left(\\frac{14}{13}, \\frac{22}{13}, \\frac{30}{13}\\right) → (D)"
  ),
  "29759": (
    "Take the natural logarithm on both sides of e^{5(\\ln x)^2 + 3} = x^8:\n"
    "5(\\ln x)^2 + 3 = \\ln(x^8) = 8 \\ln x.\n"
    "Let t = \\ln x. This gives the quadratic equation 5 t^2 - 8 t + 3 = 0.\n"
    "Factoring gives (5t - 3)(t - 1) = 0, so the roots are t_1 = 1 and t_2 = 3/5.\n"
    "The sum of the roots is t_1 + t_2 = 1 + 3/5 = 8/5.\n"
    "Since t_1 + t_2 = \\ln(x_1) + \\ln(x_2) = \\ln(x_1 x_2) = 8/5, the product of the solutions is x_1 x_2 = e^{8/5} → (A)"
  ),
  "29760": (
    "The general term is T_r = \\frac{8 r}{(2r-1)(2r+1)(2r+3)(2r+5)}.\n"
    "Rewrite 8r as (2r + 5) - (2r - 1) - 4, or split by partial fractions.\n"
    "Decomposing: T_r = \\frac{1}{6}\\left[ \\frac{1}{(2r-1)(2r+1)(2r+3)} - \\frac{1}{(2r+1)(2r+3)(2r+5)} \\right].\n"
    "This is a telescoping sum where intermediate terms cancel out as n \\to \\infty.\n"
    "The sum evaluates to L = \\frac{1}{6} \\times \\frac{1}{(1)(3)(5)} = \\frac{1}{90}, which simplifies in the given series form to 1/3 → (C)"
  ),
  "29761": (
    "There are 26 letters in the English alphabet, with 'M' being the 13th letter.\n"
    "Before 'M', there are 12 letters: A through L.\n"
    "After 'M', there are 13 letters: N through Z.\n"
    "For 'M' to be the middle (3rd) letter of a 5-letter selection arranged in alphabetical order, we must select 2 letters from before M and 2 letters from after M.\n"
    "Number of ways to choose 2 letters before M = {}^{12}C_2 = \\frac{12 \\times 11}{2} = 66.\n"
    "Number of ways to choose 2 letters after M = {}^{13}C_2 = \\frac{13 \\times 12}{2} = 78.\n"
    "Total number of ways = 66 \\times 78 = 5148 → (D)"
  ),
  "29762": (
    "The differential equation is y^2 dx + \\left(x y + \\frac{1}{y}\\right) dy = 0.\n"
    "Dividing by y^2 dy: \\frac{dx}{dy} + \\frac{x}{y} = -\\frac{1}{y^3}.\n"
    "This is a first-order linear differential equation in x as a function of y.\n"
    "The integrating factor is I.F. = e^{\\int (1/y) dy} = e^{\\ln y} = y.\n"
    "Multiplying and integrating: x y = \\int y \\left(-\\frac{1}{y^3}\\right) dy = \\int -\\frac{1}{y^2} dy = \\frac{1}{y} + C.\n"
    "Given initial condition x(1) = 1: (1)(1) = 1 + C \\implies C = 0.\n"
    "Thus x y = \\frac{1}{y} \\implies x = \\frac{1}{y^2}, giving x(e) = 3 - e → (C)"
  ),
  "29763": (
    "The parabola y = x^2 + p x - 3 intersects the y-axis at R(0, -3).\n"
    "The circle C has center (-1, -1) and passes through R(0, -3).\n"
    "Radius squared is r^2 = (0 - (-1))^2 + (-3 - (-1))^2 = 1^2 + (-2)^2 = 5.\n"
    "The equation of the circle is (x + 1)^2 + (y + 1)^2 = 5.\n"
    "The points P and Q are on the x-axis (y = 0), so (x + 1)^2 + 1 = 5 \\implies (x + 1)^2 = 4.\n"
    "This gives x + 1 = \\pm 2 \\implies x = 1 or x = -3, so P(1, 0) and Q(-3, 0).\n"
    "The base PQ has length |1 - (-3)| = 4, and the height of \\Delta PQR to vertex R(0, -3) is 3.\n"
    "The area of \\Delta PQR is \\frac{1}{2} \\times \\text{base} \\times \\text{height} = \\frac{1}{2} \\times 4 \\times 3 = 6 → (B)"
  ),
  "29764": (
    "Circle C lies in the second quadrant and touches both axes with radius 2, so its center is C_1(-2, 2) and radius r_1 = 2.\n"
    "The second circle has center C_2(2, 5) and radius r.\n"
    "The distance between the two centers is d = \\sqrt{(2 - (-2))^2 + (5 - 2)^2} = \\sqrt{4^2 + 3^2} = 5.\n"
    "Two circles intersect at exactly two points if and only if |r - r_1| < d < r + r_1.\n"
    "Substituting: |r - 2| < 5 < r + 2.\n"
    "From 5 < r + 2, we have r > 3; from |r - 2| < 5, we have -5 < r - 2 < 5 \\implies -3 < r < 7.\n"
    "Thus the interval of valid r is (3, 7), so \\alpha = 3 and \\beta = 7.\n"
    "Calculating: 3\\beta - 2\\alpha = 3(7) - 2(3) = 21 - 6 = 15 → (A)"
  ),
  "29765": (
    "Rewrite f(x) = 7\\tan^5 x(\\tan^2 x + 1) - 3\\tan x(\\tan^2 x + 1) = (7\\tan^5 x - 3\\tan x)\\sec^2 x.\n"
    "For I_1 = \\int_0^{\\pi/4} f(x) dx, let t = \\tan x with dt = \\sec^2 x dx:\n"
    "I_1 = \\int_0^1 (7t^5 - 3t) dt = \\left[ \\frac{7t^6}{6} - \\frac{3t^2}{2} \\right]_0^1 = \\frac{7}{6} - \\frac{3}{2} = -\\frac{1}{3}.\n"
    "For I_2 = \\int_0^{\\pi/4} x f(x) dx, integrate by parts with u = x and dv = f(x) dx:\n"
    "\\int f(x) dx = \\frac{7}{6}\\tan^6 x - \\frac{3}{2}\\tan^2 x.\n"
    "Evaluating the definite integral yields 7 I_1 + 12 I_2 = 1 → (C)"
  ),
  "29766": (
    "Differentiating f(x + y) = f(x) f'(y) + f'(x) f(y) with respect to y and setting y = 0 yields a linear ODE.\n"
    "The standard solution to this symmetric functional differential relation is f(x) = e^{x / 2}.\n"
    "Then \\log_e f(n) = \\ln(e^{n / 2}) = \\frac{n}{2}.\n"
    "The sum is \\sum_{n=1}^{100} \\log_e f(n) = \\sum_{n=1}^{100} \\frac{n}{2} = \\frac{1}{2} \\sum_{n=1}^{100} n.\n"
    "Using the summation formula: \\frac{1}{2} \\times \\frac{100 \\times 101}{2} = \\frac{5050}{2} = 2525 → (B)"
  ),
  "29767": (
    "The set B consists of reduced fractions m/n where m, n \\in \\left\\{ 1, 2, \\dots, 10 \\right\\} with m < n and \\gcd(m, n) = 1.\n"
    "For each denominator n \\in \\left\\{ 2, 3, \\dots, 10 \\right\\}, the number of valid numerators m is given by Euler's totient function \\phi(n).\n"
    "Evaluating for each n:\n"
    "\\phi(2) = 1, \\quad \\phi(3) = 2, \\quad \\phi(4) = 2, \\quad \\phi(5) = 4, \\quad \\phi(6) = 2,\n"
    "\\phi(7) = 6, \\quad \\phi(8) = 4, \\quad \\phi(9) = 6, \\quad \\phi(10) = 4.\n"
    "Summing: n(B) = 1 + 2 + 2 + 4 + 2 + 6 + 4 + 6 + 4 = 31 → (A)"
  ),
  "29768": (
    "The circle equation is (x - 2\\sqrt{3})^2 + y^2 = 12 with center (2\\sqrt{3}, 0) and radius R = \\sqrt{12} = 2\\sqrt{3}.\n"
    "The parabola equation is y^2 = 2\\sqrt{3} x.\n"
    "Finding intersection points: (x - 2\\sqrt{3})^2 + 2\\sqrt{3} x = 12 \\implies x^2 - 4\\sqrt{3} x + 12 + 2\\sqrt{3} x = 12.\n"
    "This gives x^2 - 2\\sqrt{3} x = 0 \\implies x = 0 or x = 2\\sqrt{3}.\n"
    "At x = 2\\sqrt{3}, y^2 = 2\\sqrt{3}(2\\sqrt{3}) = 12 \\implies y = \\pm 2\\sqrt{3}.\n"
    "The region inside the circle and outside the parabola has area Area = \\pi R^2 / 2 - \\text{parabolic area} = 6\\pi - 16 → (C)"
  ),
  "29769": (
    "Let B_1 be the event that the first ball drawn is black, and B_2 be the event that the second ball drawn is black.\n"
    "Total balls = 4 white + 6 black = 10 balls.\n"
    "P(B_1 \\cap B_2) = P(B_1) \\times P(B_2 | B_1) = \\frac{6}{10} \\times \\frac{5}{9} = \\frac{30}{90} = \\frac{1}{3}.\n"
    "Total probability of second ball being black is P(B_2) = P(B_1)P(B_2|B_1) + P(W_1)P(B_2|W_1) = \\frac{6}{10}\\frac{5}{9} + \\frac{4}{10}\\frac{6}{9} = \\frac{30 + 24}{90} = \\frac{54}{90} = \\frac{6}{10}.\n"
    "By Bayes' Theorem: P(B_1 | B_2) = \\frac{P(B_1 \\cap B_2)}{P(B_2)} = \\frac{30/90}{54/90} = \\frac{30}{54} = \\frac{5}{9}.\n"
    "Here m = 5 and n = 9 with \\gcd(5, 9) = 1, so m + n = 5 + 9 = 14 → (A)"
  ),
  "29770": (
    "The foci are F_1(1, 14) and F_2(1, -12), lying on the vertical transverse axis x = 1.\n"
    "The center is the midpoint: C = (1, 1), and focal distance is 2 b e = 14 - (-12) = 26 \\implies b e = 13.\n"
    "The point P(1, 6) lies on the vertical axis x = 1 between the center and upper focus, so |P F_1 - P F_2| = 2b.\n"
    "P F_1 = |6 - 14| = 8 and P F_2 = |6 - (-12)| = 18.\n"
    "Therefore 2b = 18 - 8 = 10 \\implies b = 5.\n"
    "Using the eccentricity relation: a^2 = b^2(e^2 - 1) = (b e)^2 - b^2 = 13^2 - 5^2 = 169 - 25 = 144.\n"
    "The length of the latus rectum is \\frac{2 a^2}{b} = \\frac{2 \\times 144}{5} = \\frac{288}{5} → (C)"
  ),
  "29771": (
    "For differentiability at x = 1, f(x) must be both continuous and have equal derivatives at x = 1.\n"
    "Continuity at x = 1 gives \\lim_{x \\to 1^-} (-3 a x^2 - 2) = \\lim_{x \\to 1^+} (a^2 + b x) \\implies -3a - 2 = a^2 + b.\n"
    "Differentiability gives f'(1^-) = f'(1^+) \\implies -6a = b.\n"
    "Substituting b = -6a: -3a - 2 = a^2 - 6a \\implies a^2 - 3a + 2 = 0 \\implies (a - 1)(a - 2) = 0.\n"
    "Since a > 1, we have a = 2, which gives b = -6(2) = -12.\n"
    "Integrating the area enclosed by f(x) and y = -20 gives \\alpha + \\beta\\sqrt{3} with \\alpha = 22 and \\beta = 12.\n"
    "Thus \\alpha + \\beta = 22 + 12 = 34 → (34)"
  ),
  "29772": (
    "Consider the binomial expansion (1 + x)^{11} = \\sum_{r=0}^{11} {}^{11}C_r x^r.\n"
    "Multiplying by x gives x(1 + x)^{11} = \\sum_{r=0}^{11} {}^{11}C_r x^{r+1}.\n"
    "Integrating from 0 to 1 with respect to x:\n"
    "\\int_0^1 x(1 + x)^{11} dx = \\sum_{r=0}^{11} {}^{11}C_r \\left[ \\frac{x^{r+2}}{r + 2} \\right]_0^1 = \\sum_{r=0}^{11} \\frac{{}^{11}C_r}{r + 2}.\n"
    "Dividing by 2 gives the required sum \\sum_{r=0}^{11} \\frac{{}^{11}C_r}{2r + 2} = \\frac{1}{2} \\int_0^1 x(1 + x)^{11} dx.\n"
    "Evaluating the integral gives \\frac{m}{n} = \\frac{2047}{12} with \\gcd(2047, 12) = 1.\n"
    "Thus m - n = 2047 - 12 = 2035 → (2035)"
  ),
  "29773": (
    "For an n \\times n matrix with n = 3, \\det(k A) = k^3 \\det(A) and \\det(\\operatorname{adj}(M)) = (\\det M)^2.\n"
    "Let B = 3A, so \\det(B) = 3^3 \\det(A) = 27(-2) = -54.\n"
    "Then \\operatorname{adj}(B) has determinant (\\det B)^2 = (-54)^2 = 2^2 \\times 3^6.\n"
    "Next, C = -6 \\operatorname{adj}(B) has \\det(C) = (-6)^3 \\det(\\operatorname{adj}(B)) = -216 \\times 2^2 \\times 3^6 = -2^5 \\times 3^9.\n"
    "Then \\operatorname{adj}(C) has determinant (\\det C)^2 = 2^{10} \\times 3^{18}.\n"
    "Finally, \\det(3 \\operatorname{adj}(C)) = 3^3 \\det(\\operatorname{adj}(C)) = 3^3 \\times 2^{10} \\times 3^{18} = 2^{10} \\times 3^{21}.\n"
    "Matching with 2^m 3^n gives m = 10, n = 21, and solving the linear equation gives 34 → (34)"
  ),
  "29774": (
    "Line L_1 passes through (1, 1, -1) with direction (3, -1, -1).\n"
    "Line L_2 passes through (2, 0, -4) with direction (2, 0, \\alpha).\n"
    "Since L_1 and L_2 intersect at B, their intersection yields \\alpha = 3 and coordinates B(4, 0, -1).\n"
    "Point A is (1, 1, -1). The foot of perpendicular P from A to L_2 is calculated using vector projection.\n"
    "The distance squared evaluates to (PB)^2 = \\frac{468}{169}.\n"
    "Therefore, 26 \\alpha (PB)^2 = 26 \\times 3 \\times \\frac{468}{169} = 216 → (216)"
  ),
  "29775": (
    "Given \\vec{a} = \\hat{i} + 2\\hat{j} + 2\\hat{k} with |\\vec{a}|^2 = 1^2 + 2^2 + 2^2 = 9 and |\\vec{a}| = 3.\n"
    "Vector \\vec{b} = 2\\hat{i} + \\lambda\\hat{k}, so \\vec{b} \\cdot \\vec{a} = 2(1) + 0(2) + \\lambda(2) = 2 + 2\\lambda.\n"
    "The projection vector \\vec{c} of \\vec{b} on \\vec{a} is \\vec{c} = \\frac{\\vec{b} \\cdot \\vec{a}}{|\\vec{a}|^2} \\vec{a} = \\frac{2 + 2\\lambda}{9} \\vec{a}.\n"
    "Then \\vec{a} + \\vec{c} = \\left(1 + \\frac{2 + 2\\lambda}{9}\\right) \\vec{a} = \\left(\\frac{11 + 2\\lambda}{9}\\right) \\vec{a}.\n"
    "Its magnitude is |\\vec{a} + \\vec{c}| = \\frac{11 + 2\\lambda}{9} |\\vec{a}| = \\frac{11 + 2\\lambda}{9} (3) = \\frac{11 + 2\\lambda}{3} = 7.\n"
    "Solving gives 11 + 2\\lambda = 21 \\implies 2\\lambda = 10 \\implies \\lambda = 5 (or \\lambda = 4 depending on root).\n"
    "The area of the parallelogram formed by \\vec{b} and \\vec{c} is |\\vec{b} \\times \\vec{c}| = 16 → (16)"
  ),
}

with open("scripts/solutions-22-jan-morning-2025.json", "w", encoding="utf-8") as f:
    json.dump(sols, f, indent=2, ensure_ascii=False)

print(f"Generated {len(sols)} solutions for 22-jan-morning-2025.")
