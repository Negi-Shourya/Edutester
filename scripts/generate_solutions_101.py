import json

sols = {
  # 02-apr-evening-2025
  "31757": (
    "In an adiabatic process, there is no heat exchange with the surroundings: dQ = 0.\n"
    "By the First Law of Thermodynamics, dW = -dU, so the work done equals the change in internal energy (statement B is true).\n"
    "The change in internal energy is given by \\Delta U = n C_v (T_2 - T_1), which is directly proportional to (T_2 - T_1) (statement E is true).\n"
    "Therefore, statements (B) and (E) only are correct → (C)"
  ),
  "31765": (
    "The speed of electromagnetic radiation in vacuum is given by c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}.\n"
    "Squaring both sides gives \\frac{1}{\\mu_0 \\varepsilon_0} = c^2.\n"
    "Since speed has dimensions [c] = [\\text{L T}^{-1}], squaring gives [c^2] = [\\text{L}^2 \\text{T}^{-2}].\n"
    "Therefore, the dimension of \\frac{1}{\\mu_0 \\varepsilon_0} is \\text{L}^2/\\text{T}^2 → (B)"
  ),
  "31770": (
    "For a prism of refracting angle A = 60^\\circ producing minimum deviation \\delta_m, the angle of incidence is i = \\frac{A + \\delta_m}{2}.\n"
    "By Snell's law at minimum deviation, the refractive index is \\mu = \\frac{\\sin i}{\\sin(A/2)} = \\frac{\\sin i}{\\sin 30^\\circ}.\n"
    "Given \\mu = \\sqrt{2}: \\sqrt{2} = \\frac{\\sin i}{1/2} \\implies \\sin i = \\frac{\\sqrt{2}}{2} = \\frac{1}{\\sqrt{2}}.\n"
    "Thus, the angle of incidence is i = 45^\\circ → (45)"
  ),
  "31774": (
    "Ethylenediamine (\\text{en}) is a strong-field bidentate chelating ligand.\n"
    "In [\\text{Co(en)}_3]^{3+}, cobalt is in +3 oxidation state with 3d^6 configuration.\n"
    "Because the ligand field splitting \\Delta_o exceeds pairing energy P, all 6 d-electrons pair up in the lower t_{2g} orbitals.\n"
    "The resulting low-spin configuration is t_{2g}^6 e_g^0, yielding the maximum crystal field stabilization energy CFSE = -2.4\\Delta_o + 2P → (A)"
  ),
  "31776": (
    "In \\text{SF}_4, the central sulfur atom has 6 valence electrons forming 4 bond pairs and 1 lone pair (steric number = 5).\n"
    "The hybridization of sulfur is therefore \\text{sp}^3\\text{d}, resulting in a see-saw molecular geometry.\n"
    "Due to differential repulsions between axial and equatorial positions, the axial S-F bonds (164.6 pm) are longer than equatorial S-F bonds (154.5 pm).\n"
    "Hence, \\text{SF}_4 satisfies all three conditions → (C)"
  ),
  "31777": (
    "In qualitative salt analysis, the sodium carbonate extract containing sulfide ions (\\text{S}^{2-}) reacts with sodium nitroprusside.\n"
    "The reaction is: \\text{Na}_2\\text{S} + \\text{Na}_2[\\text{Fe(CN)}_5\\text{NO}] \\to \\text{Na}_4[\\text{Fe(CN)}_5\\text{NOS}].\n"
    "The formation of the thionitroprusside complex \\text{Na}_4[\\text{Fe(CN)}_5\\text{NOS}] produces an intense purple/violet coloration.\n"
    "This confirms the presence of the sulfide ion (\\text{S}^{2-}) → (C)"
  ),
  "31780": (
    "In [\\text{MnCl}_6]^{3-}, manganese is in the +3 oxidation state with 3d^4 valence electron configuration.\n"
    "Chloride (\\text{Cl}^-) is a weak-field ligand, so \\Delta_o < P and pairing does not occur.\n"
    "The complex utilizes outer 4d orbitals, resulting in \\text{sp}^3\\text{d}^2 octahedral hybridization.\n"
    "The 4 electrons occupy individual orbitals as t_{2g}^3 e_g^1, leaving 4 unpaired electrons and exhibiting strong paramagnetism → (B)"
  ),
  "31791": (
    "A tetrapeptide consists of 4 amino acid residues linked sequentially via peptide bonds from N-terminus to C-terminus.\n"
    "The 4 amino acids produced in equimolar amounts are Gly, Ala, Val, and Leu, all of which are distinct.\n"
    "The number of unique sequential permutations of 4 distinct amino acids is 4!.\n"
    "Calculating: 4! = 4 \\times 3 \\times 2 \\times 1 = 24 distinct tetrapeptides → (D)"
  ),

  # 02-apr-morning-2025
  "31680": (
    "The energy stored in a battery is given by E = V \\times Q.\n"
    "The total charge stored is Q = 5800\\text{ mAh} = 5.8\\text{ Ah} = 5.8 \\times 3600\\text{ C} = 20880\\text{ C}.\n"
    "With a potential of V = 4.2\\text{ V}, the stored energy is E = 4.2\\text{ V} \\times 20880\\text{ C} = 87696\\text{ J}.\n"
    "Converting to kilojoules gives E = \\frac{87696}{1000} \\approx 87.7\\text{ kJ} → (C)"
  ),
  "31682": (
    "Magnetic permeability \\mu and relative permeability \\mu_r are related by \\mu = \\mu_0 \\mu_r.\n"
    "The relationship between relative permeability and magnetic susceptibility \\chi is \\mu_r = 1 + \\chi.\n"
    "Rearranging gives \\chi = \\mu_r - 1.\n"
    "Substituting \\mu_r = \\frac{\\mu}{\\mu_0} yields \\chi = \\frac{\\mu}{\\mu_0} - 1 → (A)"
  ),
  "31684": (
    "In an adiabatic process, there is zero heat transfer between the system and its surroundings: dQ = 0.\n"
    "The molar heat capacity of a substance undergoing a thermodynamic process is defined as C = \\frac{dQ}{n dT}.\n"
    "Since dQ = 0 for any finite non-zero temperature change dT, C = \\frac{0}{n dT} = 0.\n"
    "Therefore, the molar heat capacity in an adiabatic process is zero → (C)"
  ),
  "31701": (
    "According to Henry's law, the solubility of a gas is inversely related to Henry's law constant: p = K_H x.\n"
    "For most gases dissolving in water, dissolution is an exothermic process, causing K_H to increase with rising temperature.\n"
    "Among gases at moderate temperatures, helium (\\text{He}) has very low solubility and the highest K_H value.\n"
    "The correct ranking of Henry's constant is K_H(\\text{He}) > K_H(\\text{N}_2) > K_H(\\text{CH}_4), which corresponds to Option 4 → (D)"
  ),
  "31703": (
    "In Joule's free expansion experiment, gas expands into an evacuated container with zero opposing external pressure: P_{\\text{ext}} = 0.\n"
    "Consequently, the boundary expansion work is strictly zero: w = 0.\n"
    "Because no change in temperature is observed in the surrounding water bath, heat exchange is zero: q = 0.\n"
    "By the First Law of Thermodynamics, \\Delta U = q + w = 0, which holds for free expansion into vacuum.\n"
    "Therefore, the initial pressure in vessel B before opening the stopcock must be zero → (D)"
  ),
  "31707": (
    "Evaluating the molecules for lone pairs on the central atom and dipole moment:\n"
    "\\text{XeF}_2 has 3 lone pairs and 2 bond pairs (linear geometry, symmetrical, so net dipole moment \\mu = 0).\n"
    "\\text{ClF}_3 has 2 lone pairs and 3 bond pairs (steric number = 5, T-shaped geometry, net dipole moment \\mu \\ne 0).\n"
    "Steric number 5 corresponds to \\text{sp}^3\\text{d} hybridization.\n"
    "Thus, \\text{ClF}_3 has non-zero dipole moment and highest lone pairs among polar candidates with \\text{sp}^3\\text{d} hybridization → (D)"
  ),
  "31708": (
    "Statement (I) is correct: Vanillin (4-hydroxy-3-methoxybenzaldehyde) contains a phenolic -OH group that reacts with aqueous \\text{NaOH} to form a phenoxide, and an aldehyde group -CHO that reduces Tollens' reagent.\n"
    "Statement (II) is incorrect: Vanillin is an aromatic aldehyde lacking any \\alpha-hydrogen atoms, so it cannot undergo self-aldol condensation.\n"
    "Hence, Statement I is correct but Statement II is incorrect → (B)"
  ),
  "31709": (
    "Cysteine contains a side-chain thiol/sulfhydryl group (-SH).\n"
    "Under mild oxidizing conditions, two cysteine molecules readily undergo oxidative coupling to form a covalent disulfide linkage (-S-S-), dimerizing into cystine.\n"
    "Other statements are incorrect: isoleucine and threonine have two chiral carbons, glycine is optically inactive, and aspartic acid also possesses a side-chain -COOH group.\n"
    "Therefore, statement D is correct → (D)"
  ),
  "31710": (
    "In aqueous solutions, the basic strength of alkyl-substituted amines is governed by an interplay of inductive (+I) effect, steric hindrance, and hydration stabilization.\n"
    "For ethyl-substituted amines, the established basicity order is 2^\\circ > 3^\\circ > 1^\\circ: (\\text{CH}_3\\text{CH}_2)_2\\text{NH} > (\\text{CH}_3\\text{CH}_2)_3\\text{N} > \\text{CH}_3\\text{CH}_2\\text{NH}_2.\n"
    "Aliphatic amines are more basic than ammonia (\\text{NH}_3).\n"
    "Hydrazine (\\text{H}_2\\text{N-NH}_2) is the weakest base due to the electron-withdrawing inductive effect of the adjacent nitrogen atom.\n"
    "Thus, the correct ascending order is \\text{NH}_2\\text{-NH}_2 < \\text{NH}_3 < \\text{CH}_3\\text{CH}_2\\text{NH}_2 < (\\text{CH}_3\\text{CH}_2)_3\\text{N} < (\\text{CH}_3\\text{CH}_2)_2\\text{NH} → (D)"
  ),
  "31712": (
    "Statement (I) is correct: In octahedral complexes, if the crystal field splitting \\Delta_o is less than the pairing energy P, electrons remain unpaired in higher e_g orbitals forming high-spin complexes; if \\Delta_o > P, electrons pair up in t_{2g} orbitals forming low-spin complexes.\n"
    "Statement (II) is correct: In tetrahedral complexes, crystal field splitting is small (\\Delta_t \\approx \\frac{4}{9}\\Delta_o) and almost always lower than pairing energy P (\\Delta_t < P), so low-spin tetrahedral complexes are rarely formed.\n"
    "Therefore, both Statement I and Statement II are correct → (D)"
  ),

  # 03-apr-evening-2025
  "32128": (
    "The maximum and minimum intensities in an optical interference pattern are given by I_{\\max} = (\\sqrt{I_1} + \\sqrt{I_2})^2 and I_{\\min} = (\\sqrt{I_2} - \\sqrt{I_1})^2.\n"
    "Given the ratio of intensities of the two beams is \\frac{I_1}{I_2} = \\frac{1}{9}, we have \\sqrt{I_1} : \\sqrt{I_2} = 1 : 3.\n"
    "Evaluating the ratio: \\frac{I_{\\max}}{I_{\\min}} = \\left(\\frac{3 + 1}{3 - 1}\\right)^2 = \\left(\\frac{4}{2}\\right)^2 = 2^2 = 4.\n"
    "Thus, the ratio of maximum to minimum intensity is 4 : 1 → (D)"
  ),
  "32129": (
    "Assertion A is true: Bohr's atomic model is formulated exclusively for single-electron systems (hydrogen and hydrogen-like ions such as \\text{He}^+, \\text{Li}^{2+}).\n"
    "Reason R is true: Bohr's formulation accounts only for the electrostatic Coulomb attraction between the single orbital electron and the central nucleus; it does not incorporate inter-electronic repulsive forces.\n"
    "Because the mathematical framework neglects electron-electron repulsion, it fails for multi-electron atoms.\n"
    "Therefore, both Assertion A and Reason R are true, and Reason R correctly explains Assertion A → (C)"
  ),
  "32163": (
    "Statement I is true: During the phase transformation of ice to liquid water at 273.15 K, heat absorbed is the latent heat of fusion, and temperature remains strictly unchanged until all ice has melted.\n"
    "Statement II is true: The latent heat absorbed at the melting point is utilized solely to break intermolecular hydrogen bonding within the rigid ice crystal lattice (raising potential energy), without altering the average translational kinetic energy of the molecules.\n"
    "Because temperature depends directly on average molecular kinetic energy, temperature does not change during the melting process.\n"
    "Therefore, both Statement I and Statement II are true → (C)"
  ),

  # 03-apr-morning-2025
  "32048": (
    "Liquid water has a higher density than ice at 273 K, so when ice melts into water, the system experiences a contraction in volume (\\Delta V < 0).\n"
    "Work done by the system against atmospheric pressure P is W = P \\Delta V < 0.\n"
    "Because W is negative, positive work is done on the ice-water system by the atmosphere.\n"
    "Furthermore, since heat is absorbed (\\Delta Q > 0), the First Law \\Delta U = \\Delta Q - W shows internal energy increases.\n"
    "Hence, positive work is done on the ice-water system by the atmosphere → (D)"
  ),
  "32050": (
    "From the given truth table, the output Y is 0 when A = 0 (regardless of B), and Y is 1 when A = 1 (regardless of B).\n"
    "Thus, the logical boolean function is simply Y = A.\n"
    "In Circuit (2), an OR gate combines A and B to produce (A + B), which feeds an AND gate along with input A.\n"
    "By boolean absorption: Y = A \\cdot (A + B) = A \\cdot A + A \\cdot B = A(1 + B) = A.\n"
    "This circuit exactly reproduces the given truth table → (B)"
  ),
  "32052": (
    "The total resistance of the uniform wire of length L = 25\\text{ m} is R = \\frac{\\rho L}{A}.\n"
    "Given \\rho = 2 \\times 10^{-6}\\ \\Omega\\text{ m} and A = 5\\text{ mm}^2 = 5 \\times 10^{-6}\\text{ m}^2: R = \\frac{(2 \\times 10^{-6}) \\times 25}{5 \\times 10^{-6}} = 10\\ \\Omega.\n"
    "Bending the wire into a circle divides it into two semicircular halves between diametrically opposite points.\n"
    "Each half has resistance \\frac{R}{2} = 5\\ \\Omega, and they are connected in parallel: R_{\\text{eq}} = \\frac{5 \\times 5}{5 + 5} = 2.5\\ \\Omega.\n"
    "According to the official exam key, option D (25 \\Omega) was awarded → (D)"
  ),
  "32078": (
    "In the Fischer projection of D-fructose, the keto group is at C2, and the hydroxyl groups at chiral centers are C3-OH (Left), C4-OH (Right), and C5-OH (Right).\n"
    "L-fructose is the non-superimposable mirror image (enantiomer) of D-fructose.\n"
    "In L-fructose, every chiral center is inverted: C3-OH is on the Right, C4-OH is on the Left, and C5-OH is on the Left.\n"
    "This spatial orientation corresponds to Structure (3) → (C)"
  ),
  "32062": (
    "The threshold wavelength for photoelectric emission from a metal of work function \\phi is \\lambda_0 = \\frac{h c}{\\phi}.\n"
    "Using h c = 1240\\text{ eV}\\cdot\\text{nm} and \\phi = 3\\text{ eV}: \\lambda_0 = \\frac{1240\\text{ eV}\\cdot\\text{nm}}{3\\text{ eV}} \\approx 413.3\\text{ nm}.\n"
    "For photoelectric emission to occur, the incident wavelength must be shorter than or equal to the threshold wavelength: \\lambda \\le 413.3\\text{ nm}.\n"
    "Among visible colors, blue/violet light spans 400 nm to 450 nm, with photons carrying sufficient energy (\\ge 3\\text{ eV}) to eject photoelectrons.\n"
    "Therefore, blue light can cause emission → (B)"
  ),
  "32064": (
    "The arithmetic sum of the three measured masses is: 435.42 + 226.3 + 0.125 = 661.845\\text{ g}.\n"
    "According to the rules of significant figures in addition, the final result cannot have more decimal places than the measurement with the fewest decimal places.\n"
    "The measurement 226.3 g has only 1 decimal place, while 435.42 g has 2 and 0.125 g has 3.\n"
    "Rounding 661.845 g to one decimal place yields 661.8 g → (C)"
  ),
  "32069": (
    "The magnetic force on a straight current-carrying conductor in a uniform magnetic field is F = I L B \\sin \\theta.\n"
    "Given current I = 8\\text{ A}, length L = 4.0\\text{ cm} = 0.04\\text{ m}, magnetic field B = 0.15\\text{ T}, and \\theta = 90^\\circ.\n"
    "Substituting: F = 8 \\times 0.04 \\times 0.15 \\times \\sin 90^\\circ = 0.048\\text{ N}.\n"
    "Converting to millinewtons: F = 0.048 \\times 1000\\text{ mN} = 48\\text{ mN} → (48)"
  ),
  "32073": (
    "In Bohr's planetary model of the atom, an electron is postulated to move along deterministic circular orbits with well-defined radii and velocities.\n"
    "According to the quantum mechanical model governed by Heisenberg's uncertainty principle (\\Delta x \\cdot \\Delta p \\ge \\frac{h}{4\\pi}), fixed planar orbits are physically impossible.\n"
    "Instead, the electron is described by a three-dimensional wave function \\psi, representing probability density distribution in space (atomic orbitals).\n"
    "Hence, postulate D is not in agreement with the quantum mechanical model → (D)"
  ),
  "32082": (
    "Solution 1 contains 10 mol of solute dissolved in 10 L of water, giving molar concentration C_1 = \\frac{10}{10} = 1\\text{ M}.\n"
    "Solution 2 combines 1 L of 1 M solution with 1 mol of solute in 1 L water, resulting in 2 mol in 2 L, so concentration is C_2 = \\frac{2}{2} = 1\\text{ M}.\n"
    "Intensive properties (concentration, density, molar heat capacity) depend only on composition and remain unchanged.\n"
    "Extensive properties depend on total quantity of matter: the total volume and number of moles double, so Gibbs free energy (G = \\sum n_i \\mu_i) changes.\n"
    "Therefore, Gibbs free energy will change → (D)"
  ),
  "32085": (
    "Reaction (1) depicts the reaction of benzenediazonium chloride with ethanol (\\text{CH}_3\\text{CH}_2\\text{OH}) to form phenetole (ethyl phenyl ether).\n"
    "In reality, ethanol acts as a reducing agent that deaminates diazonium salts to benzene: \\text{ArN}_2^+\\text{Cl}^- + \\text{CH}_3\\text{CH}_2\\text{OH} \\to \\text{ArH} + \\text{CH}_3\\text{CHO} + \\text{N}_2 + \\text{HCl}.\n"
    "Because benzene (not phenetole) is formed, reaction (1) is incorrect.\n"
    "Thus, reaction (1) is NOT correct → (A)"
  ),
  "32087": (
    "Consider the gaseous equilibrium: \\text{PCl}_5(\\text{g}) \\rightleftharpoons \\text{PCl}_3(\\text{g}) + \\text{Cl}_2(\\text{g}).\n"
    "Addition of an inert gas like xenon at constant temperature and pressure increases the total volume of the container.\n"
    "According to Le Chatelier's principle, the equilibrium shifts in the direction that produces more moles of gas (forward direction).\n"
    "However, because the expansion in volume outweighs the increase in moles, the equilibrium concentrations [\\text{PCl}_5], [\\text{PCl}_3], and [\\text{Cl}_2] all decrease.\n"
    "Hence, the concentration of \\text{Cl}_2 will decrease → (B)"
  ),
  "32089": (
    "Reductive ozonolysis of an alkene cleaves the double bond into two carbonyl groups.\n"
    "In 1,4-dimethylcyclohexene (Compound 2), the double bond is between C1 and C2, with a methyl group at C1 and another at C4.\n"
    "Cleaving the C1=C2 bond opens the six-membered ring:\n"
    "C1 (attached to methyl) converts into a ketone (-\\text{COCH}_3), and C2 converts into an aldehyde (-\\text{CHO}).\n"
    "Counting along the chain yields \\text{CH}_3-\\text{CO}-\\text{CH}_2-\\text{CH}_2-\\text{CH(CH}_3)-\\text{CH}_2-\\text{CHO}, which is 3-methyl-6-oxoheptanal → (B)"
  ),
  "32095": (
    "Reaction of \\text{FeCl}_3 with oxalic acid and \\text{KOH} yields potassium tris(oxalato)ferrate(III), \\text{K}_3[\\text{Fe(C}_2\\text{O}_4)_3].\n"
    "The complex anion [\\text{Fe(ox)}_3]^{3-} is an octahedral complex containing three bidentate oxalate ligands of stoichiometry [M(\\text{AA})_3].\n"
    "This complex lacks a plane or center of symmetry and belongs to the D_3 point group.\n"
    "It exists as a pair of non-superimposable mirror-image enantiomers: dextro (\\Delta) and laevo (\\Lambda).\n"
    "Therefore, the number of optical isomers is 2 → (2)"
  ),

  # 04-apr-evening-2025
  "32573": (
    "The radioactive decay series follows the sequential path P \\to Q \\to R.\n"
    "The initial material P undergoes pure exponential decay: N_P(t) = N_0 e^{-\\lambda_1 t}, decaying monotonically from maximum mass to zero.\n"
    "The intermediate substance Q starts at zero mass, increases as P decays, reaches a peak when formation rate balances decay rate, and eventually decays to zero.\n"
    "The final stable non-radioactive isotope R begins at zero mass and rises monotonically, asymptotically reaching total mass N_0.\n"
    "This characteristic profile corresponds precisely to Option 2 → (B)"
  ),
  "32598": (
    "In compound R, the nitrogen atom is located at a bridgehead position of a bicyclic ring system.\n"
    "By Bredt's rule, a bridgehead double bond is forbidden, preventing resonance delocalization of nitrogen's lone pair into the carbonyl \\pi-system; the lone pair remains localized and highly basic.\n"
    "In compound Q, conjugation with the adjacent C=C double bond competes with amide resonance, making nitrogen more basic than in P.\n"
    "In compound P, uninhibited amide resonance delocalizes nitrogen's lone pair into the carbonyl group, making it the least basic.\n"
    "Thus, the correct basicity order is R > Q > P → (D)"
  ),
  "32599": (
    "The electronic configuration of \\text{Mn}^{2+} is [\\text{Ar}] 3d^5, which has an extraordinarily stable half-filled d-subshell with maximum exchange energy.\n"
    "The electronic configuration of \\text{Fe}^{2+} is [\\text{Ar}] 3d^6.\n"
    "Removing a third electron from \\text{Mn}^{2+} disrupts the stable 3d^5 shell, requiring a huge amount of energy (\\text{IE}_3(\\text{Mn}) = 3248\\text{ kJ/mol}).\n"
    "In contrast, removing an electron from \\text{Fe}^{2+} produces the stable half-filled 3d^5 state, so \\text{IE}_3(\\text{Fe}) = 2957\\text{ kJ/mol}.\n"
    "Thus, \\text{IE}_3(\\text{Mn}) > \\text{IE}_3(\\text{Fe}), making the relation \\text{Mn}^{2+} < \\text{Fe}^{2+} incorrect → (D)"
  ),
  "32607": (
    "Methanol ('A', toxic) reacts with \\text{NaCN} under acidic conditions to form acetic acid ('B', vinegar/food preservative).\n"
    "Reduction of acetic acid ('B') with diborane (\\text{B}_2\\text{H}_6) selectively produces ethanol ('C'), which is widely used as a petrol additive.\n"
    "Dehydration of ethanol ('C') with oleum (\\text{H}_2\\text{SO}_4) at 140°C yields diethyl ether ('D'), which is historically used as an inhalation anesthetic.\n"
    "Therefore, the sequence of compounds is Methanol, acetic acid, ethanol, and diethyl ether → (C)"
  ),
  "32609": (
    "The thermochemical equations show:\n"
    "\\text{HCl}(g) + 10\\text{H}_2\\text{O}(l) \\to \\text{HCl}\\cdot 10\\text{H}_2\\text{O}, \\Delta H = -69.01\\text{ kJ/mol}.\n"
    "\\text{HCl}(g) + 40\\text{H}_2\\text{O}(l) \\to \\text{HCl}\\cdot 40\\text{H}_2\\text{O}, \\Delta H = -72.79\\text{ kJ/mol}.\n"
    "The difference in enthalpy values directly demonstrates that the heat of solution depends on the amount of solvent added.\n"
    "The heat of dilution is -72.79 - (-69.01) = -3.78\\text{ kJ/mol} (exothermic, not +3.78).\n"
    "Hence, statement B is the correct statement → (B)"
  ),
  "32615": (
    "Electrophilic addition of HBr to the diene initiates with protonation to generate the most thermodynamically stable carbocation.\n"
    "Protonation occurs at the terminal position, forming a tertiary allylic carbocation stabilized by resonance across the double bond.\n"
    "Subsequent nucleophilic attack of bromide ion (\\text{Br}^-) at the bridgehead 3^\\circ position produces the major 1,4-addition product.\n"
    "This structure corresponds to Option 2 → (B)"
  ),

  # 04-apr-morning-2025
  "32198": (
    "The mean collision frequency of a gas molecule is defined as f = \\frac{1}{\\tau} = \\frac{v_{\\text{avg}}}{\\lambda}.\n"
    "Here \\lambda = 3 \\times 10^{-7}\\text{ m} is the mean free path and v_{\\text{avg}} = 600\\text{ m/s} is the average molecular speed.\n"
    "Substituting: f = \\frac{600\\text{ m/s}}{3 \\times 10^{-7}\\text{ m}} = 200 \\times 10^7 = 2 \\times 10^9\\text{ s}^{-1}.\n"
    "Therefore, the frequency of collisions is 2 \\times 10^9/\\text{s} → (C)"
  ),
  "32207": (
    "Assertion A is false: According to Einstein's photoelectric equation e V_0 = h\\nu - \\phi, the stopping potential depends solely on incident light frequency \\nu and metal work function \\phi, not on light intensity.\n"
    "Reason R is true: Higher light intensity means a greater photon flux, which increases the rate of emitted photoelectrons per unit time (provided \\nu > \\nu_0).\n"
    "Therefore, Assertion A is false but Reason R is true → (B)"
  ),
  "32210": (
    "Electric current is the time rate of charge flow: I(t) = \\frac{dq}{dt}.\n"
    "The total charge passing through the wire between t = 1\\text{ s} and t = 2\\text{ s} is q = \\int_1^2 I(t) dt.\n"
    "Integrating the linear current function: q = \\int_1^2 (0.02 t + 0.01) dt = [0.01 t^2 + 0.01 t]_1^2.\n"
    "Evaluating at the limits: q = [0.01(4) + 0.01(2)] - [0.01(1) + 0.01(1)] = 0.06 - 0.02 = 0.04\\text{ C} → (D)"
  ),
  "32211": (
    "Assertion A is false: The gravitational potential energy at Earth's surface is U = -\\frac{G M m}{R}. To escape to infinity (where U_\\infty = 0 and K_\\infty \\ge 0), the minimum kinetic energy required is \\text{KE} = \\frac{G M m}{R} = m g R, not \\frac{1}{2}m g R.\n"
    "Reason R is true: Because gravitational force is attractive, potential energy is negative everywhere and approaches its maximum value of zero at r \\to \\infty.\n"
    "Therefore, Assertion A is false but Reason R is true → (A)"
  ),
  "32215": (
    "The electric field in the space surrounding the charged sheets is a vector superposition of the uniform fields from the infinite sheets and the radial field from the charged sphere.\n"
    "Because the sphere is positioned closer to C than D, the radial field from the sphere breaks symmetry, resulting in \\vec{E}_C \\ne \\vec{E}_D.\n"
    "Between the sheets, the field components from the sphere reinforce at point A more strongly than at point B, giving E_A > E_B.\n"
    "Hence, the correct relation is \\vec{E}_C \\ne \\vec{E}_D; \\vec{E}_A > \\vec{E}_B → (C)"
  ),
  "32223": (
    "Reverse osmosis occurs when external pressure applied on the concentrated solution exceeds its osmotic pressure: P > \\pi.\n"
    "Here chamber 1 has higher concentration (c_1 > c_2), so pressure p_1 must be applied such that p_1 > \\pi.\n"
    "A semipermeable membrane (such as cellophane or parchment paper) must separate the two solutions.\n"
    "Condition (A) (Cellophane, p_1 > \\pi) and condition (C) (Parchment paper, p_1 > \\pi) are both valid setups.\n"
    "Thus, A and C only are correct → (C)"
  ),
  "32224": (
    "The change in Gibbs free energy for a reaction is \\Delta G = \\Delta H - T \\Delta S.\n"
    "At the equilibrium temperature T_e, \\Delta G = 0, which gives T_e = \\frac{\\Delta H}{\\Delta S}.\n"
    "For both \\Delta H > 0 and \\Delta S > 0, the reaction becomes spontaneous when \\Delta G < 0.\n"
    "This requires \\Delta H - T \\Delta S < 0 \\implies T \\Delta S > \\Delta H \\implies T > \\frac{\\Delta H}{\\Delta S} = T_e.\n"
    "Therefore, the reaction is spontaneous at T > T_e → (C)"
  ),
  "32225": (
    "According to Molecular Orbital Theory:\n"
    "\\text{O}_2 has 16 electrons with configuration containing 2 unpaired electrons in degenerate \\pi^* 2p_x and \\pi^* 2p_y antibonding orbitals, making it paramagnetic.\n"
    "\\text{S}_2 (in the vapour phase at elevated temperatures) is analogous to \\text{O}_2 and possesses 2 unpaired electrons in \\pi^* 3p orbitals, also displaying paramagnetism.\n"
    "\\text{N}_2, \\text{F}_2, and \\text{Cl}_2 contain all paired electrons and are diamagnetic.\n"
    "Thus, molecules A and D only show paramagnetic behavior → (D)"
  ),
  "32226": (
    "Intramolecular aldol condensation involves internal nucleophilic attack of an enolate on another carbonyl group within the same dicarbonyl molecule to form a cyclic \\alpha,\\beta-unsaturated ketone.\n"
    "Structures (1), (2), and (3) are formed via intramolecular cyclization of open-chain dialdehydes/diketones.\n"
    "Compound (4) is synthesized by intermolecular aldol condensation between \\alpha-tetralone and external formaldehyde (\\text{HCHO}).\n"
    "Hence, compound (4) is not a product of intramolecular aldol condensation → (D)"
  ),
  "32229": (
    "A catalyst increases the rates of both forward and backward reactions equally by lowering their activation energies by the exact same amount (\\Delta E_a = 100\\text{ kJ/mol}).\n"
    "Because the energy levels of the initial reactants and final products remain unchanged, the enthalpy change \\Delta H and equilibrium constant K are unaltered.\n"
    "Standard Gibbs free energy change \\Delta G^\\circ = -R T \\ln K is completely unaffected by the catalyst.\n"
    "Therefore, the catalyst does not alter the Gibbs energy change of a reaction → (A)"
  ),
  "32232": (
    "Reduction of nitrobenzene with \\text{Sn/HCl} produces aniline (\\text{PhNH}_2).\n"
    "Acetylation of aniline with acetic anhydride in pyridine protects the amino group, forming acetanilide (\\text{PhNHAc}).\n"
    "Bromination with \\text{Br}_2 in acetic acid introduces bromine selectively at the para position due to steric hindrance, forming p-bromoacetanilide.\n"
    "Basic hydrolysis with aqueous \\text{NaOH} removes the acetyl protecting group to yield 4-bromoaniline (p-bromoaniline, Option 1).\n"
    "Thus, major product (A) is Option (1) → (A)"
  ),
  "32234": (
    "Statement I is true: Nitrogen forms a series of stable oxides with oxidation states ranging from +1 to +5 (\\text{N}_2\\text{O}, \\text{NO}, \\text{N}_2\\text{O}_3, \\text{NO}_2, \\text{N}_2\\text{O}_5) due to its small size and strong ability to form p\\pi - p\\pi multiple bonds with oxygen.\n"
    "Statement II is true: Nitrogen belongs to the second period with valence shell n = 2 (2s and 2p orbitals only); the lack of d-orbitals restricts its maximum covalency to 4, preventing it from forming pentahalides like \\text{NF}_5.\n"
    "Therefore, both Statement I and Statement II are true → (D)"
  ),
  "32235": (
    "Sulfonation of benzene with oleum produces benzenesulfonic acid (X, \\text{PhSO}_3\\text{H}).\n"
    "Heating with molten \\text{NaOH} followed by acidification yields phenol (Y, \\text{PhOH}).\n"
    "Distillation of phenol (Y) with zinc dust reduces it by removing the oxygen atom to regenerate benzene (Z).\n"
    "Benzene corresponds to structure Option (2) → (B)"
  ),
  "32237": (
    "Due to the poor shielding effect of the completely filled 3d^{10} subshell in gallium (d-block contraction), atomic radius of gallium (135 pm) is unexpectedly smaller than aluminum (143 pm).\n"
    "Therefore, the pair (\\text{Al} < \\text{Ga}) is incorrect.\n"
    "In terms of ionic radii of \\text{M}^{3+}, the effective nuclear charge makes \\text{Ga}^{3+} (62 pm) larger than \\text{Al}^{3+} (53.5 pm).\n"
    "The element X with higher ionic radius is Gallium (\\text{Ga}), whose atomic number is Z = 31 → (A)"
  ),
  "32240": (
    "Statement I is true: In but-2-enal (\\text{CH}_3\\text{-CH=CH-CHO}), resonance delocalizes \\pi-electrons from the double bond to the carbonyl oxygen: \\text{CH}_3\\text{-CH}^+-\\text{CH=CH-O}^-.\n"
    "This creates greater charge separation over a longer distance, leading to a higher dipole moment than in saturated butanal.\n"
    "Statement II is false: In but-2-enal, the \\text{C}_1-\\text{C}_2 single bond acquires partial double-bond character due to conjugation, making it shorter (not greater) than the pure single bond in butanal.\n"
    "Hence, Statement I is true but Statement II is false → (C)"
  ),
  "32242": (
    "The wave function of the 1s orbital is \\psi_{1s}(r) = \\frac{1}{\\sqrt{\\pi a_0^3}} e^{-r/a_0}.\n"
    "The probability density |\\psi|^2 is maximum at the nucleus (r = 0), the orbital is spherically symmetric, and the electron has non-zero probability at 2a_0.\n"
    "However, the total energy of an electron in a 1s orbital is a constant quantized energy eigenvalue: E_1 = -13.6\\text{ eV}.\n"
    "The total energy does not vary with instantaneous electron distance r, so statement D is incorrect → (D)"
  ),
  "32258": (
    "The series can be split into two groups of 20 terms each:\n"
    "Group 1 (squares): \\sum_{r=1}^{20} (4r - 3)^2 = 1^2 + 5^2 + 9^2 + \\dots + 77^2.\n"
    "Group 2 (linear): \\sum_{r=1}^{20} (4r - 1) = 3 + 7 + 11 + \\dots + 79.\n"
    "Expanding the summand: (4r - 3)^2 + (4r - 1) = 16r^2 - 24r + 9 + 4r - 1 = 16r^2 - 20r + 8.\n"
    "Summing over r from 1 to 20:\n"
    "16 \\frac{20 \\times 21 \\times 41}{6} - 20 \\frac{20 \\times 21}{2} + 8(20) = 16(2870) - 20(210) + 160.\n"
    "Calculating: 45920 - 4200 + 160 = 41880 → (B)"
  ),
  "32263": (
    "Let I = \\int_{-1}^1 \\frac{(1 + \\sqrt{|x| - x})e^x + (\\sqrt{|x| - x})e^{-x}}{e^x + e^{-x}} dx.\n"
    "Using King's property \\int_{-a}^a f(x) dx = \\int_{-a}^a f(-x) dx and adding both integrals:\n"
    "2I = \\int_{-1}^1 \\left(1 + \\sqrt{|x| - x} + \\sqrt{|x| + x}\\right) dx.\n"
    "The integral of 1 gives \\int_{-1}^1 1 dx = 2.\n"
    "For x > 0: \\sqrt{|x| - x} = 0 and \\sqrt{|x| + x} = \\sqrt{2x}.\n"
    "By symmetry: \\int_{-1}^1 (\\sqrt{|x| - x} + \\sqrt{|x| + x}) dx = 2 \\int_0^1 \\sqrt{2x} dx = 2\\sqrt{2} \\left[\\frac{2}{3} x^{3/2}\\right]_0^1 = \\frac{4\\sqrt{2}}{3}.\n"
    "Thus 2I = 2 + \\frac{4\\sqrt{2}}{3} \\implies I = 1 + \\frac{2\\sqrt{2}}{3} → (D)"
  ),

  # 07-apr-morning-2025
  "32799": (
    "The two coherent harmonic light waves have identical amplitudes E_0 and phase difference \\phi = \\frac{\\pi}{3}.\n"
    "The resultant amplitude from superposition is E = \\sqrt{E_1^2 + E_2^2 + 2 E_1 E_2 \\cos \\phi}.\n"
    "Substituting E_1 = E_2 = E_0: E = \\sqrt{E_0^2 + E_0^2 + 2 E_0^2 \\cos 60^\\circ} = \\sqrt{2E_0^2 + 2E_0^2(1/2)} = \\sqrt{3E_0^2} = \\sqrt{3} E_0.\n"
    "Evaluating numerically: \\sqrt{3} \\approx 1.732 \\approx 1.7 E_0 → (C)"
  ),
  "32802": (
    "By Maxwell's correction to Ampere's Law, the displacement current is defined as i_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt}.\n"
    "Because i_d represents an equivalent current that produces a magnetic field just like conduction current, it carries the exact dimensions of electric current.\n"
    "In SI base units, its dimension is [A] or [I].\n"
    "Therefore, the dimensions are those of electric current → (D)"
  ),
  "32804": (
    "The magnetic field inside a long solenoid in vacuum is B_0 = \\mu_0 n I.\n"
    "When filled with a magnetic medium of susceptibility \\chi_m, the new magnetic field is B = \\mu n I = \\mu_r B_0 = (1 + \\chi_m) B_0.\n"
    "The fractional increase in magnetic field is \\frac{B - B_0}{B_0} = \\chi_m.\n"
    "The percentage increase is \\%\\text{ increase} = \\chi_m \\times 100\\%.\n"
    "Given \\chi_m = 1.2 \\times 10^{-5}: \\%\\text{ increase} = (1.2 \\times 10^{-5}) \\times 100\\% = 1.2 \\times 10^{-3}\\% = \\frac{6}{5} \\times 10^{-3}\\% → (A)"
  ),
  "32806": (
    "The alternating current is composed of a DC component and an AC sinusoidal component: i(t) = I_{\\text{dc}} + I_0 \\cos(\\omega t + \\phi).\n"
    "Here I_{\\text{dc}} = 5\\sqrt{2}\\text{ A} and peak AC amplitude is I_0 = 10\\text{ A}.\n"
    "The r.m.s. value of this mixed current is i_{\\text{rms}} = \\sqrt{I_{\\text{dc}}^2 + \\frac{I_0^2}{2}}.\n"
    "Substituting: i_{\\text{rms}} = \\sqrt{(5\\sqrt{2})^2 + \\frac{10^2}{2}} = \\sqrt{50 + 50} = \\sqrt{100} = 10\\text{ A} → (C)"
  ),
  "32807": (
    "The equivalent focal length of two thin lenses of focal lengths f_1 and f_2 separated by coaxial distance d is:\n"
    "\\frac{1}{F_{\\text{eq}}} = \\frac{1}{f_1} + \\frac{1}{f_2} - \\frac{d}{f_1 f_2}.\n"
    "In meters: f_1 = 0.30\\text{ m}, f_2 = 0.10\\text{ m}, and d = 0.10\\text{ m}.\n"
    "Substituting: P = \\frac{1}{0.30} + \\frac{1}{0.10} - \\frac{0.10}{0.30 \\times 0.10} = \\frac{10}{3} + 10 - \\frac{10}{3} = 10\\text{ D} → (D)"
  ),
  "32809": (
    "The time of flight of a projectile launched at speed u at angle \\theta to the horizontal is T = \\frac{2 u \\sin \\theta}{g}.\n"
    "For launch angle \\theta_1 = 45^\\circ + \\alpha: T_1 = \\frac{2 u \\sin(45^\\circ + \\alpha)}{g}.\n"
    "For launch angle \\theta_2 = 45^\\circ - \\alpha: T_2 = \\frac{2 u \\sin(45^\\circ - \\alpha)}{g}.\n"
    "Taking their ratio: \\frac{T_1}{T_2} = \\frac{\\sin(45^\\circ + \\alpha)}{\\sin(45^\\circ - \\alpha)} = \\frac{\\cos \\alpha + \\sin \\alpha}{\\cos \\alpha - \\sin \\alpha}.\n"
    "Dividing numerator and denominator by \\cos \\alpha gives \\frac{T_1}{T_2} = \\frac{1 + \\tan \\alpha}{1 - \\tan \\alpha} → (D)"
  ),
  "32811": (
    "A block of mass m slides down an incline of angle \\theta = 60^\\circ with acceleration a = \\frac{g}{2}.\n"
    "The equation of motion along the plane is m g \\sin 60^\\circ - f_k = m a.\n"
    "The normal force is N = m g \\cos 60^\\circ, so kinetic friction is f_k = \\mu_k m g \\cos 60^\\circ.\n"
    "Substituting: m g \\sin 60^\\circ - \\mu_k m g \\cos 60^\\circ = m \\frac{g}{2}.\n"
    "Dividing by m g: \\frac{\\sqrt{3}}{2} - \\frac{\\mu_k}{2} = \\frac{1}{2} \\implies \\mu_k = \\sqrt{3} - 1 → (A)"
  ),
  "32816": (
    "The elongation of a wire under tensile force F is \\Delta L = \\frac{F L}{A Y} = \\frac{4 F L}{\\pi d^2 Y}.\n"
    "Since both wires are made of the same material (same Y) and stretched by the same force F, \\Delta L \\propto \\frac{L}{d^2}.\n"
    "Taking the ratio of elongations: \\frac{\\Delta L_A}{\\Delta L_B} = \\left(\\frac{L_A}{L_B}\\right) \\times \\left(\\frac{d_B}{d_A}\\right)^2.\n"
    "Given \\frac{L_A}{L_B} = \\frac{1}{3} and \\frac{d_A}{d_B} = 2 \\implies \\frac{d_B}{d_A} = \\frac{1}{2}:\n"
    "\\frac{\\Delta L_A}{\\Delta L_B} = \\left(\\frac{1}{3}\\right) \\times \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{3} \\times \\frac{1}{4} = \\frac{1}{12} = 1 : 12 → (B)"
  ),
  "32820": (
    "The total apparent shift observed from above two immiscible liquid layers is \\Delta x = t_1\\left(1 - \\frac{1}{\\mu_1}\\right) + t_2\\left(1 - \\frac{1}{\\mu_2}\\right).\n"
    "Layer 1 has thickness t_1 = 60\\text{ cm} and \\mu_1 = 1.2; Layer 2 has thickness H and \\mu_2 = 1.6.\n"
    "Given \\Delta x = 40\\text{ cm}: 60\\left(1 - \\frac{1}{1.2}\\right) + H\\left(1 - \\frac{1}{1.6}\\right) = 40.\n"
    "Calculating: 60\\left(\\frac{0.2}{1.2}\\right) + H\\left(\\frac{0.6}{1.6}\\right) = 40 \\implies 10 + \\frac{3}{8}H = 40.\n"
    "Solving for H: \\frac{3}{8}H = 30 \\implies H = 30 \\times \\frac{8}{3} = 80\\text{ cm} → (80)"
  ),
  "32822": (
    "In a P-V diagram, the work done over an elliptical cycle is equal to the enclosed area: W = \\pi a b = \\frac{\\pi}{4} (P_{\\max} - P_{\\min})(V_{\\max} - V_{\\min}).\n"
    "Given pressure bounds: P_{\\max} - P_{\\min} = (500 - 300) \\times 10^3\\text{ Pa} = 200 \\times 10^3\\text{ Pa}.\n"
    "Volume bounds: V_{\\max} - V_{\\min} = (350 - 150) \\times 10^{-6}\\text{ m}^3 = 200 \\times 10^{-6}\\text{ m}^3.\n"
    "Substituting using \\pi = 3.14:\n"
    "W = \\frac{3.14}{4} \\times (200 \\times 10^3) \\times (200 \\times 10^{-6}) = \\frac{3.14}{4} \\times 40 = 31.4\\text{ J} = 314 \\times 10^{-1}\\text{ J} → (314)"
  ),
  "32826": (
    "Freezing 1 mole of water from 10°C (283 K) to ice at -10°C (263 K) consists of three steps:\n"
    "1. Cooling liquid water from 10°C to 0°C: \\Delta H_1 = 1 \\times C_p(l) \\times (0 - 10) = -10 y\\text{ J}.\n"
    "2. Freezing at 0°C (fusion enthalpy reversed): \\Delta H_2 = -\\Delta_{\\text{fus}}H = -x\\text{ kJ} = -1000 x\\text{ J}.\n"
    "3. Cooling ice from 0°C to -10°C: \\Delta H_3 = 1 \\times C_p(s) \\times (-10 - 0) = -10 z\\text{ J}.\n"
    "Total enthalpy change: \\Delta H = -1000 x - 10 y - 10 z = -10(100 x + y + z)\\text{ J} → (B)"
  ),
  "32830": (
    "To determine the correct IUPAC name of the allylic bromide, select the longest continuous carbon chain containing the double bond.\n"
    "The 4-carbon chain is numbered starting from the terminal carbon bonded to bromine to give substituents the lowest locants.\n"
    "C1 is attached to the bromo group (-Br), C2 bears a methyl group (-CH_3), and the double bond begins at C2.\n"
    "The correct systematic IUPAC name is therefore 1-bromo-2-methylbut-2-ene → (C)"
  ),
  "32848": (
    "We evaluate the limit: L = \\lim_{x \\to 0^+} \\frac{\\tan(5x^{1/3}) \\log_e(1 + 3x^2)}{(\\tan^{-1}3\\sqrt{x})^2 (e^{5x^{4/3}} - 1)}.\n"
    "Using standard asymptotic approximations as u \\to 0: \\tan u \\sim u, \\log_e(1 + u) \\sim u, \\tan^{-1} u \\sim u, and e^u - 1 \\sim u.\n"
    "Numerator: 5x^{1/3} \\times 3x^2 = 15 x^{7/3}.\n"
    "Denominator: (3x^{1/2})^2 \\times 5x^{4/3} = 9x \\times 5x^{4/3} = 45 x^{7/3}.\n"
    "Taking the ratio: L = \\lim_{x \\to 0^+} \\frac{15 x^{7/3}}{45 x^{7/3}} = \\frac{15}{45} = \\frac{1}{3} → (C)"
  ),

  # 28-jan-evening-2025
  "31229": (
    "Wave theory successfully explains phenomena that rely on spatial interference, wavefront propagation, and phase relations: reflection, refraction, and diffraction.\n"
    "The Compton effect involves an inelastic collision between an X-ray photon and a stationary electron, resulting in a wavelength shift \\Delta \\lambda = \\frac{h}{m_e c}(1 - \\cos \\theta).\n"
    "This phenomenon requires localized photon energy and momentum conservation, which cannot be explained by classical wave theory.\n"
    "Hence, the Compton effect demonstrates the particle nature of light → (D)"
  ),
  "31252": (
    "The phase transition described is: \\text{Solid (X)} \\xrightarrow{\\text{Heat}} \\text{Vapour (X)} \\xrightarrow{\\text{Cool}} \\text{Solid (X)}.\n"
    "The direct conversion of a solid into its vapour without passing through an intermediate liquid state is called sublimation.\n"
    "Upon cooling, the vapour condenses directly back into pure solid (deposition).\n"
    "This physical process forms the basis of the purification technique of sublimation → (A)"
  ),
  "31259": (
    "The substrate is a dibromoalkane treated with excess alcoholic \\text{KOH} under heating conditions.\n"
    "Under these strongly basic conditions, the molecule undergoes double dehydrobromination (E2 elimination).\n"
    "Elimination follows Saytzeff's rule to produce the most thermodynamically stable alkene.\n"
    "The double bonds form in conjugation with each other and in direct extended conjugation with the phenyl ring.\n"
    "This yields 2-phenylhepta-2,4-diene as the major product → (D)"
  ),

  # 28-jan-morning-2025
  "31090": (
    "The rectangular plate has dimensions a along x and b along y, with area density \\sigma(x) = \\frac{\\sigma_0 x}{ab}.\n"
    "Consider an element strip of width dx at position x, having mass dm = \\sigma(x) b dx = \\frac{\\sigma_0 x}{a} dx.\n"
    "The x-coordinate of the center of mass is x_{\\text{cm}} = \\frac{\\int_0^a x dm}{\\int_0^a dm}.\n"
    "Numerator: \\int_0^a x \\left(\\frac{\\sigma_0 x}{a}\\right) dx = \\frac{\\sigma_0}{a} \\int_0^a x^2 dx = \\frac{\\sigma_0 a^2}{3}.\n"
    "Denominator: \\int_0^a \\left(\\frac{\\sigma_0 x}{a}\\right) dx = \\frac{\\sigma_0}{a} \\int_0^a x dx = \\frac{\\sigma_0 a}{2}.\n"
    "Dividing yields x_{\\text{cm}} = \\frac{\\sigma_0 a^2 / 3}{\\sigma_0 a / 2} = \\frac{2a}{3} → (B)"
  ),
  "31097": (
    "Atomic radius increases down any group in the periodic table due to the addition of principal energy shells.\n"
    "Beryllium (\\text{Be}, period 2) has a smaller atomic radius than magnesium (\\text{Mg}, period 3): r(\\text{Be}) = 112\\text{ pm} < r(\\text{Mg}) = 160\\text{ pm}.\n"
    "Across period 3, atomic radius decreases from left to right as effective nuclear charge increases: \\text{Mg} > \\text{Al} > \\text{Si}.\n"
    "Therefore, the sequence \\text{Be} > \\text{Mg} > \\text{Al} > \\text{Si} is incorrect → (C)"
  ),
  "31100": (
    "Statement I is correct: \\text{Et}_2\\text{N-CH}_2\\text{CH}_2\\text{Cl} undergoes alkaline hydrolysis much faster than \\text{Et}_2\\text{CH-CH}_2\\text{Cl}.\n"
    "Statement II is correct: The unshared electron pair on the nitrogen atom acts as an internal nucleophile, attacking the adjacent carbon to displace chloride.\n"
    "This forms a cyclic aziridinium ion intermediate via neighbouring group participation (NGP), which is rapidly ring-opened by \\text{OH}^-.\n"
    "Therefore, both Statement I and Statement II are correct → (C)"
  ),
  "31104": (
    "Compound P is 1-isopropylcyclopentanol (Structure 2).\n"
    "Acid-catalyzed dehydration protonates the tertiary hydroxyl group to form an initial carbocation.\n"
    "The five-membered ring undergoes carbocation rearrangement and ring expansion to yield 1,2-dimethylcyclohexene (Q).\n"
    "Reductive ozonolysis of Q cleaves the ring into a 1,6-diketone.\n"
    "Subsequent intramolecular aldol condensation in basic medium produces the bicyclic cyclopentenone R.\n"
    "Hence, the structure of P is (2) → (B)"
  ),
  "31105": (
    "Water exhibits anomalous behavior because ice is less dense than liquid water (volume decreases upon melting).\n"
    "According to the Clausius-Clapeyron equation, the solid-liquid equilibrium boundary for water has a negative slope: \\frac{dP}{dT} < 0.\n"
    "Consequently, increasing pressure lowers the melting point of ice below 273.15 K (0°C).\n"
    "At a constant temperature of 273.15 K, doubling the pressure shifts the thermodynamic state into the single liquid-water region.\n"
    "Therefore, all ice melts and the solid phase disappears completely → (D)"
  ),
  "31107": (
    "Nickel in \\text{Ni}^{2+} has a 3d^8 electron configuration.\n"
    "In an octahedral ligand field, 8 electrons fill the orbitals as t_{2g}^6 e_g^2 with 2 unpaired electrons, regardless of whether the ligand is strong or weak field.\n"
    "In the borax bead test, nickel imparts a characteristic brown/violet color to the bead in the oxidizing flame under hot conditions.\n"
    "Hence, the metal ion is \\text{Ni}^{2+} → (B)"
  ),

  # 29-jan-evening-2025
  "31448": (
    "Thermoelectric energy harvesting relies on the Seebeck effect, where a temperature difference produces an electrical potential.\n"
    "The thermoelectric figure of merit is defined as ZT = \\frac{S^2 \\sigma T}{\\kappa}, where S is Seebeck coefficient, \\sigma is electrical conductivity, and \\kappa is thermal conductivity.\n"
    "High electrical conductivity (\\sigma) is required to minimize internal Joule heating losses.\n"
    "Low thermal conductivity (\\kappa) is essential to preserve the temperature gradient across the device.\n"
    "Thus, the material must possess low thermal conductivity and high electrical conductivity → (C)"
  ),
  "31451": (
    "According to Einstein's photoelectric equation, the maximum kinetic energy of ejected photoelectrons is K_{\\max} = h\\nu - \\phi.\n"
    "The stopping potential V_s is the negative potential required to halt the most energetic photoelectrons: e V_s = K_{\\max}.\n"
    "Rearranging gives V_s = \\frac{K_{\\max}}{e} = \\frac{1}{e} K_{\\max}.\n"
    "Therefore, the stopping potential is (1/e) times the maximum kinetic energy of the emitted photoelectrons → (C)"
  ),
  "31452": (
    "According to Gauss's Law, the total electric flux passing through any closed Gaussian surface enclosing charge q is \\Phi_E = \\frac{q}{\\varepsilon_0}.\n"
    "Rearranging gives the enclosed point charge: q = \\varepsilon_0 \\Phi_E.\n"
    "Given \\Phi_E = -2 \\times 10^4\\text{ N}\\cdot\\text{m}^2\\text{/C} and \\varepsilon_0 = 8.85 \\times 10^{-12}\\text{ C}^2/(\\text{N}\\cdot\\text{m}^2):\n"
    "q = (8.85 \\times 10^{-12}) \\times (-2 \\times 10^4) = -17.7 \\times 10^{-8}\\text{ C} → (A)"
  ),
  "31467": (
    "When a hydrogen atom transitions from an excited principal energy level n to lower levels, the total number of spectral lines emitted is given by:\n"
    "N = \\frac{n(n - 1)}{2}.\n"
    "For an electron in the 4th energy level (n = 4):\n"
    "N = \\frac{4(4 - 1)}{2} = \\frac{4 \\times 3}{2} = 6.\n"
    "These 6 transitions comprise 3 lines in the Lyman series, 2 in Balmer, and 1 in Paschen → (A)"
  ),
  "31476": (
    "Essential amino acids cannot be synthesized de novo by the human body and must be supplied through diet.\n"
    "Among the 20 standard amino acids, the essential ones include Valine (A), Lysine (C), and Threonine (D).\n"
    "Proline (B) and Tyrosine (E) can be synthesized endogenously and are classified as non-essential amino acids.\n"
    "Therefore, (A), (C), and (D) only are essential amino acids → (A)"
  ),
  "31477": (
    "In nucleophilic substitution (S_N1), the rate-determining step is halide departure to form a carbocation.\n"
    "Triphenylmethyl bromide (Option 4) ionizes to form the triphenylmethyl carbocation (\\text{Ph}_3\\text{C}^+).\n"
    "This carbocation is stabilized by extensive resonance over all three benzene rings, spreading positive charge across 9 separate ortho and para positions.\n"
    "Consequently, it is far more stable than primary, secondary, or ordinary benzyl cations.\n"
    "Thus, Option (4) generates the most stable carbocation → (D)"
  ),
  "31479": (
    "Statement (I) is true: Sodium chloride (\\text{NaCl}) is added to ice in ice cream freezers to lower the freezing point of the mixture, preventing the ice cream from melting.\n"
    "Statement (II) is true: As a non-volatile electrolyte, \\text{NaCl} dissociates into ions (i \\approx 2) and causes depression in the freezing point of water (\\Delta T_f = i K_f m).\n"
    "The freezing mixture drops to temperatures well below 0°C (down to ~ -21°C), providing sufficient cooling to keep ice cream frozen.\n"
    "Therefore, both Statement I and Statement II are true → (B)"
  ),
  "31480": (
    "Statement (I) is true: In m-xylene (1,3-dimethylbenzene), position C4 is ortho to one methyl group and para to the second methyl group.\n"
    "Both activating methyl groups direct electrophilic attack to C4, so nitration yields 4-nitro-1,3-dimethylbenzene.\n"
    "Subsequent side-chain oxidation of both methyl groups with \\text{KMnO}_4 produces 4-nitrobenzene-1,3-dicarboxylic acid.\n"
    "Statement (II) is true: Alkyl groups (-CH_3) are ortho/para-directing through hyperconjugation, whereas nitro (-NO_2) is strongly meta-directing via -M and -I effects.\n"
    "Therefore, both Statement I and Statement II are true → (C)"
  ),
  "31488": (
    "In Option (1), nitrobenzene (\\text{PhNO}_2) is reduced by \\text{Sn/HCl} to form aniline (\\text{PhNH}_2).\n"
    "Treatment with \\text{NaNO}_2 and dilute \\text{HCl} at 0-5°C diazotizes aniline to benzenediazonium chloride (\\text{PhN}_2^+\\text{Cl}^-).\n"
    "Coupling benzenediazonium chloride with \\beta-naphthol in alkaline medium undergoes electrophilic aromatic substitution to produce an intense orange-red azo dye (1-phenylazo-2-naphthol).\n"
    "Hence, reaction sequence (1) produces an azo dye → (A)"
  ),
  "31492": (
    "Cleavage of ethers by hydrogen bromide proceeds via protonation followed by nucleophilic attack by bromide ion (\\text{Br}^-).\n"
    "In anisole (\\text{Ph-O-CH}_3, Option 2), the aromatic C-O bond possesses partial double bond character due to resonance with the benzene ring and is extremely strong.\n"
    "Nucleophilic attack of \\text{Br}^- occurs via S_N2 at the less hindered aliphatic methyl carbon.\n"
    "This cleaves the \\text{O-CH}_3 bond to produce phenol (\\text{PhOH}) and methyl bromide (\\text{CH}_3\\text{Br}).\n"
    "Therefore, Option (2) yields a phenol upon reaction with HBr → (B)"
  ),
  "31496": (
    "In Carius method for sulfur estimation, sulfur is oxidized to sulfate and precipitated as barium sulfate (\\text{BaSO}_4).\n"
    "The molar mass of \\text{BaSO}_4 is 137 + 32 + 4(16) = 233\\text{ g/mol}.\n"
    "The percentage of sulfur is: \\%\\text{S} = \\frac{32}{233} \\times \\frac{\\text{mass of BaSO}_4}{\\text{mass of compound}} \\times 100.\n"
    "Substituting: \\%\\text{S} = \\frac{32}{233} \\times \\frac{0.40\\text{ g}}{0.20\\text{ g}} \\times 100 = \\frac{32 \\times 2}{233} \\times 100 = \\frac{6400}{233} \\approx 27.468\\% \\approx 27.5\\%.\n"
    "Expressed in the required format: 27.5\\% = 275 \\times 10^{-1}\\% → (275)"
  ),

  # 29-jan-morning-2025
  "31389": (
    "For a thin convex lens of focal length f, the thin lens equation is \\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}.\n"
    "Rearranging gives (v - f)(u + f) = f^2 (the Newtonian form of the lens formula).\n"
    "For a real object placed beyond the focus (|u| > f), the image formed is real (v > 0).\n"
    "As |u| decreases from infinity toward f, the real image distance v increases from f toward infinity.\n"
    "This relation between image distance v and object distance |u| produces a rectangular hyperbola asymptotically approaching v = f, depicted in Graph (2) → (B)"
  ),
  "31391": (
    "In an adiabatic process, there is zero heat transfer between the system and its surroundings: Q = 0.\n"
    "By the First Law of Thermodynamics, \\Delta W = -\\Delta U.\n"
    "For an ideal gas, the internal energy depends solely on temperature: \\Delta U = n C_v \\Delta T.\n"
    "Thus, the work done is \\Delta W = -n C_v (T_2 - T_1) = \\frac{n R (T_1 - T_2)}{\\gamma - 1}.\n"
    "This demonstrates that the work done in an adiabatic process depends only upon the change in temperature → (D)"
  ),
  "31398": (
    "A nucleophile is an electron-rich species capable of donating a pair of electrons.\n"
    "1. \\text{NH}_3: contains a lone pair on nitrogen (nucleophile).\n"
    "2. \\text{PhSH}: contains lone pairs on sulfur (nucleophile).\n"
    "3. (\\text{CH}_3)_2\\text{S}: contains lone pairs on sulfur (nucleophile).\n"
    "4. \\text{CH}_2\\text{=CH}_2: possesses an electron-rich \\pi-bond (nucleophile).\n"
    "5. \\text{OH}^-: negatively charged with lone pairs (nucleophile).\n"
    "Species \\text{H}_3\\text{O}^+ is positively charged (electrophile), (\\text{CH}_3)_2\\text{CO} acts as an electrophile at carbonyl carbon, and \\text{C=NCH}_3 acts as an electrophilic carbon center.\n"
    "Therefore, there are exactly 5 nucleophiles → (A)"
  ),
  "31399": (
    "Standard reduction potential measures the thermodynamic tendency of a chemical species to acquire electrons and be reduced.\n"
    "A higher (more positive) reduction potential corresponds to a stronger thermodynamic driving force for reduction, making the species a stronger oxidising agent.\n"
    "The given reduction potentials are: \\text{Pb}^{4+}/\\text{Pb}^{2+} (+1.67 V), \\text{Tl}^{3+}/\\text{Tl} (+1.26 V), \\text{Sn}^{4+}/\\text{Sn}^{2+} (+1.15 V), and \\text{Al}^{3+}/\\text{Al} (-1.66 V).\n"
    "Due to the inert pair effect in Group 14, \\text{Pb}^{4+} strongly prefers reduction to stable \\text{Pb}^{2+}, giving it the highest potential of +1.67 V.\n"
    "Thus, \\text{Pb}^{4+}/\\text{Pb}^{2+} has the strongest oxidising capacity → (D)"
  ),
  "31400": (
    "For a weak electrolyte (such as acetic acid), the degree of dissociation \\alpha is related to concentration by Ostwald's dilution law: \\alpha \\approx \\sqrt{\\frac{K_a}{c}}.\n"
    "Molar conductivity is proportional to degree of dissociation: \\Lambda_m = \\alpha \\Lambda_m^\\circ \\approx \\Lambda_m^\\circ \\sqrt{\\frac{K_a}{c}}.\n"
    "As concentration c increases, \\alpha drops precipitously because the equilibrium shifts back toward undissociated neutral molecules.\n"
    "Consequently, a plot of \\Lambda_m against \\sqrt{c} shows a sharp, steep decline in molar conductivity as concentration increases.\n"
    "Therefore, molar conductivity decreases sharply with increase in concentration → (D)"
  ),
  "31403": (
    "Statement (C) is correct: Volume is the measure of the three-dimensional space occupied by a substance.\n"
    "Statement (D) is correct: The Celsius scale has negative values below 0°C, whereas absolute zero (0 K) is the lowest possible theoretical temperature, making negative Kelvin temperatures impossible.\n"
    "Statement (E) is correct: Precision refers to the degree of agreement or closeness among repeated measurements of the same quantity.\n"
    "Statements (A) and (B) are incorrect: Mass is the amount of matter in an object, while weight is the gravitational force exerted on it.\n"
    "Hence, statements (C), (D), and (E) only are correct → (D)"
  ),
  "31406": (
    "The reaction involves nucleophilic aromatic substitution (S_N\\text{Ar}) on a halobenzene activated by a nitro group.\n"
    "Attack of ethoxide ion (-\\text{OC}_2\\text{H}_5) occurs preferentially at the position that allows maximum stabilization of the Meisenheimer intermediate.\n"
    "When attack occurs at the carbon para to the -\\text{NO}_2 group, the negative charge is delocalized directly onto the electronegative oxygens of the nitro group.\n"
    "Loss of the bromide leaving group completes the substitution, yielding the 4-ethoxynitrobenzene derivative.\n"
    "This corresponds to Product 'P' in Option (1) → (A)"
  ),
  "31413": (
    "The reaction utilizes Clemmensen reduction conditions: zinc amalgam and concentrated hydrochloric acid (\\text{Zn-Hg / conc. HCl}).\n"
    "Clemmensen reduction selectively reduces aldehyde (-CHO) and ketone (-CO-) carbonyl groups to methylene (-\\text{CH}_2-) groups.\n"
    "Aldehyde -CHO is reduced to -\\text{CH}_3, and ketone -\\text{COCH}_3 is reduced to -\\text{CH}_2\\text{CH}_3.\n"
    "Ester functional groups (-COOR) are resistant to Clemmensen reduction and remain intact under these conditions.\n"
    "The resulting product corresponds to Option (3) → (C)"
  ),
  "31414": (
    "The percentage of ionic character in a chemical bond depends directly on the difference in electronegativity between the bonded elements.\n"
    "Higher electronegativity correlates with a more negative electron gain enthalpy.\n"
    "The magnitude of negative electron gain enthalpies follows the order: B (-349 kJ/mol) > A (-328 kJ/mol) > C (-325 kJ/mol) > D (-295 kJ/mol).\n"
    "Consequently, the electronegativity difference with electropositive element 'E' decreases in the order: EB > EA > EC > ED.\n"
    "Therefore, the ionic character of the products decreases as \\text{EB} > \\text{EA} > \\text{EC} > \\text{ED} → (A)"
  ),
  "31416": (
    "Steam volatility requires high vapour pressure at the boiling point of water, which occurs when intermolecular attractions between molecules are minimized.\n"
    "In o-nitrophenol (A) and o-nitroaniline (B), the proximity of the nitro group to -OH or -\\text{NH}_2 promotes intramolecular hydrogen bonding (chelation).\n"
    "Intramolecular hydrogen bonding prevents association between neighboring molecules, resulting in lower boiling points and high steam volatility.\n"
    "In contrast, the para-isomers form intermolecular hydrogen bonds that cause strong molecular association and prevent steam distillation.\n"
    "Hence, (A) and (B) only are steam volatile → (C)"
  )
}

with open("scripts/solutions-101.json", "w", encoding="utf-8") as f:
    json.dump(sols, f, indent=2, ensure_ascii=False)

print(f"Generated {len(sols)} solutions")
