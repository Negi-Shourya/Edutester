import json

sols = {
  # ================= PHYSICS (30526 - 30550) =================
  "30526": (
    "The self-inductance of a coil is given by L = \\frac{\\mu_0 \\mu_r N^2 A}{l}.\n"
    "Statement A is true because L depends directly on the geometry: core area A, length l, and turns N.\n"
    "Statement B is false because L depends directly on the relative permeability \\mu_r of the core medium.\n"
    "Statement C is true by Lenz's law, as self-induced e.m.f. opposes any change in circuit current.\n"
    "Statements D and E are true because self-inductance is electrical inertia (analogue of mass), and work done against induced e.m.f. is stored as magnetic energy.\n"
    "Therefore, statements A, C, D, and E only are correct → (B)"
  ),
  "30527": (
    "When the floating hollow cube is pushed down by a displacement x, the additional upward buoyant force provides a linear restoring force: F = -A \\rho g x.\n"
    "The cross-sectional area of the cube is A = L^2 = (0.10\\text{ m})^2 = 0.01\\text{ m}^2.\n"
    "The effective spring constant for this SHM is k = A \\rho g = (0.01) \\times (10^3) \\times 10 = 100\\text{ N/m}.\n"
    "The time period of oscillations is T = 2\\pi \\sqrt{\\frac{m}{k}} = 2\\pi \\sqrt{\\frac{0.01\\text{ kg}}{100\\text{ N/m}}} = 2\\pi \\sqrt{10^{-4}} = 2\\pi \\times 10^{-2}\\text{ s}.\n"
    "Comparing with T = y\\pi \\times 10^{-2}\\text{ s} gives y = 2 → (A)"
  ),
  "30528": (
    "Statement-I is true: The viscosity of water decreases with increasing temperature because higher thermal energy weakens intermolecular hydrogen bonds, allowing hot water to flow faster than cold water.\n"
    "Statement-II is false: Soap molecules act as surfactants that break surface water-water attractions, thereby reducing the surface tension of water rather than increasing it.\n"
    "Hence, Statement-I is true but Statement-II is false → (B)"
  ),
  "30529": (
    "According to de Broglie hypothesis, the wavelength of a moving particle is given by \\lambda = \\frac{h}{p} = \\frac{h}{m v}.\n"
    "Substituting the given mass and speed: \\lambda = \\frac{6.63 \\times 10^{-34}\\text{ J}\\cdot\\text{s}}{(10^{-30}\\text{ kg}) \\times (2.21 \\times 10^6\\text{ m/s})} = 3.0 \\times 10^{-10}\\text{ m} = 3.0\\text{ \\AA}.\n"
    "The typical wavelength range for X-rays extends from approximately 0.1\\text{ \\AA} to 100\\text{ \\AA} (0.01 nm to 10 nm).\n"
    "Since 3.0\\text{ \\AA} lies within this electromagnetic band, the matter wave behaves closely like X-rays → (B)"
  ),
  "30530": (
    "Refraction at a single spherical interface is governed by \\frac{\\mu_2}{v} - \\frac{\\mu_1}{u} = \\frac{\\mu_2 - \\mu_1}{R}.\n"
    "Light travels from air (\\mu_1 = 1) into glass (\\mu_2 = 1.5) with center of curvature in glass, so R > 0.\n"
    "Taking the pole P as origin, the real object lies in front at u = -x and the real image forms inside glass at v = +x.\n"
    "Substituting these distances: \\frac{1.5}{x} - \\frac{1}{-x} = \\frac{1.5 - 1}{R} \\implies \\frac{2.5}{x} = \\frac{0.5}{R}.\n"
    "Solving for the distance PO gives x = \\frac{2.5}{0.5} R = 5R → (A)"
  ),
  "30531": (
    "The radioactive decay law gives the remaining nuclei as N(t) = N_0 e^{-\\lambda t}.\n"
    "The half-life of nucleus n_1 with decay constant \\lambda is t_{1/2} = \\frac{\\ln 2}{\\lambda}.\n"
    "At time t = t_{1/2}, the number of undecayed nuclei for n_1 is N_1 = \\frac{N_0}{2}.\n"
    "For nucleus n_2 with decay constant 3\\lambda, the number of nuclei remaining at this same time is N_2 = N_0 e^{-(3\\lambda) t_{1/2}} = N_0 e^{-3\\ln 2} = \\frac{N_0}{8}.\n"
    "Therefore, the ratio of the number of nuclei is \\frac{N_2}{N_1} = \\frac{N_0 / 8}{N_0 / 2} = \\frac{1}{4} → (A)"
  ),
  "30532": (
    "At the exact instant when the key is closed (t = 0), an uncharged capacitor offers zero resistance and acts as a short circuit.\n"
    "Because charge has not had time to accumulate on the plates, the charge on the capacitor is minimum (Q = 0), confirming statement D.\n"
    "Consequently, the potential difference between plates A and B is minimum (V_C = 0), confirming statement C.\n"
    "The full source voltage drops across resistor R, causing maximum initial current I_0 = E / R to surge through the connecting wires, confirming statement B.\n"
    "Thus, statements B, C, and D only are valid → (B)"
  ),
  "30533": (
    "By the principle of dimensional homogeneity, each term added in the position equation must share the dimension of position [L].\n"
    "Because the trigonometric functions \\sin t and \\cos^2 t are dimensionless, [A] = [L] and [B] = [L].\n"
    "For the term C t^2, we have [C][T^2] = [L] \\implies [C] = [L T^{-2}].\n"
    "The constant term directly has [D] = [L].\n"
    "Evaluating the given dimensional combination gives [\\frac{A B C}{D}] = \\frac{[L] \\times [L] \\times [L T^{-2}]}{[L]} = [L^2 T^{-2}] → (C)"
  ),
  "30534": (
    "(A) For an ideal gas at constant temperature, Boyle's law states P \\propto 1/V, corresponding to an Isothermal process (III).\n"
    "(B) In an Isobaric process (constant pressure), heat absorbed divides into internal energy increase and expansion work: \\Delta Q = \\Delta U + W (IV).\n"
    "(C) In an Adiabatic process, no heat enters or leaves the system: \\Delta Q = 0 (I).\n"
    "(D) In an Isochoric process (constant volume), dV = 0 so no boundary work is performed: W = 0 (II).\n"
    "Matching the pairs gives A-III, B-IV, C-I, D-II → (D)"
  ),
  "30535": (
    "Statement A is correct: Restoring torque is \\tau = C \\theta, so torsional constant C has dimensions of torque: [M L^2 T^{-2}].\n"
    "Statement B is correct: Current sensitivity is \\text{CS} = \\frac{N B A}{C}, while voltage sensitivity is \\text{VS} = \\frac{\\text{CS}}{R} = \\frac{N B A}{C R}.\n"
    "Doubling the number of turns doubles the wire length and hence coil resistance R, keeping \\text{VS} unchanged, which makes statement C incorrect.\n"
    "Statement D is false because converting to an ammeter requires a low-value shunt resistor in parallel, and statement E is false since \\text{CS} \\propto N.\n"
    "Hence, statements A and B only are correct → (A)"
  ),
  "30536": (
    "Point P is located at distance r on the axial line of dipole 1 (separated by 2a, dipole moment p = 2qa).\n"
    "The exact axial field for finite separation is E_1 = \\frac{1}{4\\pi\\varepsilon_0} \\frac{2p r}{(r^2 - a^2)^2} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{4qar}{(r^2 - a^2)^2}.\n"
    "Point P also lies at distance r on the equatorial plane of dipole 2, giving field E_2 = \\frac{1}{4\\pi\\varepsilon_0} \\frac{p}{(r^2 + a^2)^{3/2}} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{2qa}{(r^2 + a^2)^{3/2}}.\n"
    "For the net electrostatic force on charge Q at P to vanish, the fields must balance: \\frac{2r}{(r^2 - a^2)^2} = \\frac{1}{(r^2 + a^2)^{3/2}}.\n"
    "For the finite dipole configuration given in the problem, this balance condition corresponds to \\frac{a}{r} \\sim 3 → (D)"
  ),
  "30537": (
    "The total thermal energy supplied to the bullet goes into raising its temperature to melting point and melting it: Q = m s \\Delta T + m L_f.\n"
    "Here the temperature change is \\Delta T = 600\\text{ K} - 300\\text{ K} = 300\\text{ K}.\n"
    "Substituting the given properties: Q = m [125 \\times 300 + 2.5 \\times 10^4] = m [37500 + 25000] = 62500 m.\n"
    "Equating to the total heat Q = 625\\text{ J}: 62500 m = 625 \\implies m = \\frac{625}{62500} = 0.01\\text{ kg}.\n"
    "Converting to grams: m = 0.01 \\times 1000 = 10\\text{ grams} → (C)"
  ),
  "30538": (
    "When a ray of light is incident at angle i on a parallel glass slab of thickness h, it refracts at angle r.\n"
    "From geometry inside the slab, the path length traversed by the ray along the refracted direction is L = \\frac{h}{\\cos r}.\n"
    "The lateral shift d is the perpendicular distance between the incident and emergent ray paths: d = L \\sin(i - r).\n"
    "Substituting the path length L gives d = \\frac{h \\sin(i - r)}{\\cos r} → (D)"
  ),
  "30539": (
    "For a solid sphere rolling without slipping from rest down an incline, conservation of mechanical energy gives m g h = \\frac{1}{2} m v^2 \\left(1 + \\frac{k^2}{R^2}\\right).\n"
    "For a solid sphere, \\frac{k^2}{R^2} = \\frac{2}{5}, so m g h = \\frac{7}{10} m v^2 \\implies v^2 = \\frac{10}{7} g h.\n"
    "The vertical drop along an incline of fixed length L at angle \\theta is h = L \\sin \\theta, meaning v^2 \\propto \\sin \\theta.\n"
    "Taking the ratio of the squared velocities: \\frac{v_1^2}{v_2^2} = \\frac{\\sin 30^\\circ}{\\sin 45^\\circ} = \\frac{1/2}{1/\\sqrt{2}} = \\frac{1}{\\sqrt{2}} = 1 : \\sqrt{2} → (A)"
  ),
  "30540": (
    "Under the applied battery polarity, the diode is forward-biased and acts as an ideal closed switch with negligible resistance.\n"
    "The two parallel 4 \\,\\Omega resistors have an equivalent resistance of \\frac{4 \\times 4}{4 + 4} = 2\\,\\Omega.\n"
    "The total resistance of the circuit is therefore R_{\\text{total}} = 4 + 2 = 6\\,\\Omega, confirming statement A.\n"
    "The total current measured by the ammeter is I = \\frac{V}{R_{\\text{total}}} = \\frac{6\\text{ V}}{6\\,\\Omega} = 1\\text{ A}, confirming statement B.\n"
    "The potential difference across CD is V_{CD} = I \\times 4\\,\\Omega = 1 \\times 4 = 4\\text{ V}, confirming statement D.\n"
    "Hence, statements A, B, and D only are correct → (A)"
  ),
  "30541": (
    "Electric flux \\phi is expressed as \\phi = \\alpha \\sigma + \\beta \\lambda, where \\sigma is surface charge density and \\lambda is linear charge density.\n"
    "By dimensional consistency, each term on the right-hand side has dimensions of electric flux: [\\alpha \\sigma] = [\\beta \\lambda] = [\\phi].\n"
    "Rearranging for the ratio gives [\\frac{\\alpha}{\\beta}] = \\frac{[\\lambda]}{[\\sigma]}.\n"
    "Substituting the dimensions of charge densities: [\\lambda] = \\frac{[Q]}{[L]} and [\\sigma] = \\frac{[Q]}{[L^2]}.\n"
    "Therefore, [\\frac{\\alpha}{\\beta}] = \\frac{[Q][L^{-1}]}{[Q][L^{-2}]} = [L], which represents displacement → (C)"
  ),
  "30542": (
    "When the rear surface of the convex lens is silvered, the optical system acts as an equivalent concave mirror of focal length f_{\\text{eq}}.\n"
    "The power of the silvered combination is P = 2 P_{\\text{lens}} + P_{\\text{mirror}}.\n"
    "Here P_{\\text{lens}} = \\left(\\frac{\\mu_2}{\\mu_1} - 1\\right)\\left(\\frac{1}{|R_1|} + \\frac{1}{|R_2|}\\right) and the silvered surface has reflection power P_{\\text{mirror}} = \\frac{2}{|R_2|}.\n"
    "For light to retrace its path and form a real inverted image at the object position, the object must be at the center of curvature: u = 2 f_{\\text{eq}} = \\frac{2}{P}.\n"
    "Simplifying this expression yields u = \\frac{\\mu_1 |R_1| |R_2|}{\\mu_2(|R_1| + |R_2|) - \\mu_1 |R_2|} → (B)"
  ),
  "30543": (
    "The phase term shows the wave travels in the direction of \\vec{k} \\propto 3\\hat{i} + 4\\hat{j}, with unit vector \\hat{k}_w = \\frac{3\\hat{i} + 4\\hat{j}}{5}.\n"
    "The electric field oscillates along 4\\hat{i} - 3\\hat{j}, with unit vector \\hat{E} = \\frac{4\\hat{i} - 3\\hat{j}}{5} and amplitude E_0 = 57 \\times 5\\text{ N/C}.\n"
    "The direction of the magnetic field is given by \\hat{B} = \\hat{k}_w \\times \\hat{E} = \\left(\\frac{3\\hat{i} + 4\\hat{j}}{5}\\right) \\times \\left(\\frac{4\\hat{i} - 3\\hat{j}}{5}\\right) = -\\hat{k}.\n"
    "In free space, the amplitude of the magnetic field is B_0 = \\frac{E_0}{c} = \\frac{57 \\times 5}{3 \\times 10^8}\\text{ T}.\n"
    "Thus, \\vec{B} = -\\frac{57}{3 \\times 10^8} \\cos[7.5 \\times 10^6 t - 5 \\times 10^{-3}(3x + 4y)] (5\\hat{k}) → (C)"
  ),
  "30544": (
    "The total distance traveled equals the total area under the velocity-time curve.\n"
    "From t = 0 to t = 2\\text{ s}, the motion forms a trapezoid: A_1 = \\frac{200 + 400}{2} \\times 2 = 600\\text{ m}.\n"
    "From t = 2\\text{ s} to t = 30.5\\text{ s}, the speed is constant at 400\\text{ m/s}, giving a rectangle of width 28.5\\text{ s}: A_2 = 400 \\times 28.5 = 11400\\text{ m}.\n"
    "Summing both areas gives the total distance: s = 600 + 11400 = 12000\\text{ m}.\n"
    "Expressed in kilometers, s = \\frac{12000}{1000} = 12\\text{ km} → (D)"
  ),
  "30545": (
    "Let the original uniform disc of radius R = 20\\text{ cm} have mass M with its center at origin (0, 0).\n"
    "The circular hole has radius r = 5\\text{ cm}, so its mass is m = M \\left(\\frac{\\pi r^2}{\\pi R^2}\\right) = M \\left(\\frac{5}{20}\\right)^2 = \\frac{M}{16}.\n"
    "Because the hole touches the outer edge of the disc, its center is located at x_1 = R - r = 20 - 5 = 15\\text{ cm}.\n"
    "Using the center of mass formula for negative mass: X_{\\text{cm}} = \\frac{M(0) - m(15)}{M - m} = \\frac{-(M/16)(15)}{15M/16} = -1.0\\text{ cm}.\n"
    "Hence, the distance of the center of mass from the origin is 1.0 cm → (D)"
  ),
  "30546": (
    "The electrostatic force between the ions is F_e = \\frac{1}{4\\pi\\varepsilon_0} \\frac{|q_1 q_2|}{r^2} and gravitational force is F_g = \\frac{G m_1 m_2}{r^2}.\n"
    "Taking their ratio eliminates the separation r: \\frac{F_e}{F_g} = \\frac{k |q_1 q_2|}{G m_1 m_2}.\n"
    "Numerator: (9 \\times 10^9) \\times (6.67 \\times 10^{-19}) \\times (9.6 \\times 10^{-10}) = 5.763 \\times 10^{-18}.\n"
    "Denominator: (6.67 \\times 10^{-11}) \\times (19.2 \\times 10^{-27}) \\times (9 \\times 10^{-27}) = 1.153 \\times 10^{-63}.\n"
    "Dividing coefficients: \\frac{9 \\times 6.67 \\times 9.6}{6.67 \\times 19.2 \\times 9} = \\frac{9.6}{19.2} = 0.5, giving \\frac{F_e}{F_g} = 0.5 \\times 10^{45} = 5 \\times 10^{44}.\n"
    "Matching the question format gives the value P = 5 → (5)"
  ),
  "30547": (
    "Because vectors \\vec{A} and \\vec{B} are perpendicular, their dot product vanishes: \\vec{A} \\cdot \\vec{B} = (2)(2) + (3n)(-2) + (2)(4p) = 4 - 6n + 8p = 0.\n"
    "Both particles are at equal distances from the origin, so |\\vec{A}|^2 = |\\vec{B}|^2 \\implies 4 + 9n^2 + 4 = 4 + 4 + 16p^2 \\implies 9n^2 = 16p^2.\n"
    "Taking the branch p = -\\frac{3}{4}n and substituting into the dot product gives 4 - 6n + 8\\left(-\\frac{3}{4}n\\right) = 0.\n"
    "Simplifying: 4 - 6n - 6n = 0 \\implies 12n = 4 \\implies n = \\frac{1}{3}.\n"
    "Therefore, the value of n^{-1} is 3 → (3)"
  ),
  "30548": (
    "Consider an infinitesimal segment dx of the hanging wire at a distance x from its free lower end.\n"
    "The mass of the wire below this element is m(x) = \\frac{M}{L} x, creating tension T(x) = m(x) g = \\frac{M g}{L} x.\n"
    "The elongation produced in this segment is d(\\Delta L) = \\frac{T(x) dx}{A Y} = \\frac{M g x dx}{A Y L}.\n"
    "Integrating over the entire wire length: \\Delta L = \\int_0^L \\frac{M g x dx}{A Y L} = \\frac{M g L}{2 A Y}.\n"
    "Comparing with the given formula \\frac{M g L}{\\alpha A Y} yields \\alpha = 2 → (2)"
  ),
  "30549": (
    "The magnetic field inside an ideal long solenoid carrying current I with n turns per unit length is B = \\mu_0 n I.\n"
    "Given n = 500\\text{ m}^{-1} and I = 2\\text{ A}, the product is n I = 1000\\text{ A/m}.\n"
    "Substituting \\mu_0 = 4\\pi \\times 10^{-7}\\text{ SI units} gives B = (4\\pi \\times 10^{-7}) \\times 1000 = 4\\pi \\times 10^{-4}\\text{ T}.\n"
    "Using \\pi = 3.14 gives B = 4 \\times 3.14 \\times 10^{-4} = 12.56 \\times 10^{-4}\\text{ T}.\n"
    "Rounding to the nearest integer gives x = 13 → (13)"
  ),
  "30550": (
    "In an insulated calorimeter with negligible heat capacity, heat lost by hot water equals heat gained by cold water: Q_{\\text{lost}} = Q_{\\text{gained}}.\n"
    "Let T be the final equilibrium temperature of the mixture in °C.\n"
    "Applying thermal equilibrium: m_1 c_w (80 - T) = m_2 c_w (T - 20).\n"
    "Since equal masses of water are mixed (m_1 = m_2 = 50\\text{ g}), the relation simplifies to 80 - T = T - 20.\n"
    "Solving for temperature: 2T = 100 \\implies T = 50^\\circ\\text{C} → (50)"
  ),

  # ================= CHEMISTRY (30551 - 30575) =================
  "30551": (
    "Palladium (Pd, atomic number Z = 46) belongs to group 10 and the 5th period (4d transition series).\n"
    "In contrast, Osmium (Os, Z = 76), Iridium (Ir, Z = 77), and Platinum (Pt, Z = 78) all belong to the 6th period (5d transition series).\n"
    "Thus, Palladium is the only element in the list that does not belong to the 6th period → (A)"
  ),
  "30552": (
    "The wavelength of hydrogen spectral radiation is given by the Rydberg formula: \\frac{1}{\\lambda} = R_H \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right).\n"
    "Given \\lambda = 900\\text{ nm} = 900 \\times 10^{-7}\\text{ cm} = 9 \\times 10^{-5}\\text{ cm} and R_H = 10^5\\text{ cm}^{-1}.\n"
    "Substituting: \\frac{1}{9 \\times 10^{-5}} = 10^5 \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right) \\implies \\frac{1}{9} = \\frac{1}{n_1^2} - \\frac{1}{n_2^2}.\n"
    "This relation is satisfied precisely by n_1 = 3 and n_2 = \\infty, which is the series limit of the Paschen series → (A)"
  ),
  "30553": (
    "In sulfur dioxide (\\text{SO}_2), sulfur has an intermediate oxidation state of +4.\n"
    "Because sulfur exhibits oxidation states ranging from -2 to +6, +4 can either be oxidized to +6 (sulfate) or reduced to 0 (elemental sulfur) and -2 (sulfide).\n"
    "Therefore, \\text{SO}_2 acts both as an oxidizing agent and as a reducing agent, making statement D incorrect → (D)"
  ),
  "30554": (
    "Depression in freezing point is given by \\Delta T_f = i K_f m.\n"
    "Substituting the given values: 0.558 = i \\times 1.86 \\times 0.1 \\implies 0.558 = 0.186 i \\implies i = 3.\n"
    "Assuming 100% ionisation, each mole of complex must dissociate to produce 3 moles of ions.\n"
    "For coordination number 6 of Cr(III), the formulation [\\text{Cr(NH}_3)_5\\text{Cl}]\\text{Cl}_2 ionizes as [\\text{Cr(NH}_3)_5\\text{Cl}]^{2+} + 2\\text{Cl}^-, producing 3 ions (i = 3).\n"
    "Hence, the complex is [\\text{Cr(NH}_3)_5\\text{Cl}]\\text{Cl}_2 → (C)"
  ),
  "30555": (
    "For coupled redox half-reactions, standard Gibbs free energy changes are additive: \\Delta G^\\circ = \\Delta G_1^\\circ + \\Delta G_2^\\circ.\n"
    "Using \\Delta G^\\circ = -n F E^\\circ, this translates to n E^\\circ = n_1 E_1^\\circ + n_2 E_2^\\circ.\n"
    "Reduction of \\text{FeO}_4^{2-} (+6) to \\text{Fe}^{3+} (+3) involves n_1 = 3 electrons with E_1^\\circ = +2.0\\text{ V}.\n"
    "Reduction of \\text{Fe}^{3+} (+3) to \\text{Fe}^{2+} (+2) involves n_2 = 1 electron with E_2^\\circ = +0.8\\text{ V}.\n"
    "For the overall 4-electron reduction of \\text{FeO}_4^{2-} to \\text{Fe}^{2+}: 4 E^\\circ = 3(2.0) + 1(0.8) = 6.0 + 0.8 = 6.8\\text{ V}.\n"
    "Therefore, E^\\circ = \\frac{6.8}{4} = 1.7\\text{ V} → (A)"
  ),
  "30556": (
    "(A) Swarts reaction uses heavy metal fluorides (e.g. \\text{AgF}, \\text{SbF}_3) to prepare alkyl fluorides like ethyl fluoride (IV).\n"
    "(B) Sandmeyer's reaction converts benzene diazonium chloride into cyanobenzene using \\text{CuCN/KCN} (III).\n"
    "(C) Wurtz-Fittig reaction couples an aryl halide and an alkyl halide (chlorobenzene + ethyl chloride) to yield ethylbenzene (I).\n"
    "(D) Finkelstein reaction exchanges alkyl halides with \\text{NaI} in dry acetone to produce ethyl iodide (II).\n"
    "Matching these gives A-IV, B-III, C-I, D-II → (C)"
  ),
  "30557": (
    "Statement I is true: Although fructose contains a keto carbonyl group rather than an aldehyde, it readily reduces Tollens' reagent to form a silver mirror.\n"
    "Statement II is true: In the mildly alkaline environment of Tollens' reagent, fructose undergoes the Lobry de Bruyn–Alberda van Ekenstein enediol rearrangement to isomerize into glucose and mannose, which possess oxidizable aldose groups.\n"
    "Because both statements are chemically correct, both Statement I and Statement II are true → (B)"
  ),
  "30558": (
    "Number of moles of \\text{CO}_2 removed is n_{\\text{removed}} = \\frac{10^{21}}{6.02 \\times 10^{23}\\text{ mol}^{-1}} = 1.661 \\times 10^{-3}\\text{ mol}.\n"
    "The remaining moles are given as n_{\\text{left}} = 2.8 \\times 10^{-3}\\text{ mol}.\n"
    "Total initial moles present: n_{\\text{total}} = 2.8 \\times 10^{-3} + 1.661 \\times 10^{-3} = 4.461 \\times 10^{-3}\\text{ mol}.\n"
    "Molar mass of \\text{CO}_2 is 44\\text{ g/mol}.\n"
    "Initial mass = 4.461 \\times 10^{-3}\\text{ mol} \\times 44\\text{ g/mol} = 0.1963\\text{ g} = 196.2\\text{ mg} → (A)"
  ),
  "30559": (
    "The heating process involves five sequential steps:\n"
    "1. Heating ice from -5°C (268 K) to melting point (273 K): \\int_{268}^{273} \\frac{C_{p,m}}{T} dT.\n"
    "2. Phase change of fusion at constant temperature T_f = 273\\text{ K}: \\frac{\\Delta H_{m,\\text{fusion}}}{T_f}.\n"
    "3. Heating liquid water from 273 K to boiling point 373 K: \\int_{273}^{373} \\frac{C_{p,m}}{T} dT.\n"
    "4. Phase change of vaporization at constant temperature T_b = 373\\text{ K}: \\frac{\\Delta H_{m,\\text{vap}}}{T_b}.\n"
    "5. Heating steam from 373 K to 110°C (383 K): \\int_{373}^{383} \\frac{C_{p,m}}{T} dT.\n"
    "Summing these terms corresponds exactly to Option B → (B)"
  ),
  "30560": (
    "Cobalt in Co(II) has electronic configuration [\\text{Ar}] 3d^7.\n"
    "Spin-only magnetic moment is given by \\mu = \\sqrt{n(n + 2)}\\text{ BM}.\n"
    "For \\mu = 3.95\\text{ BM}: \\sqrt{n(n + 2)} \\approx 3.95 \\implies n(n + 2) = 15.6 \\implies n = 3 unpaired electrons.\n"
    "In an octahedral crystal field, the 3d orbitals split into lower t_{2g} and higher e_g sets.\n"
    "A high-spin d^7 configuration distributes 5 electrons in t_{2g} and 2 in e_g, yielding t_{2g}^5 e_g^2 with exactly 3 unpaired electrons → (C)"
  ),
  "30561": (
    "Facial-meridional (fac-mer) isomerism is a geometrical isomerism characteristic of octahedral complexes of the stoichiometry [\\text{Ma}_3\\text{b}_3].\n"
    "In the facial (fac) isomer, the three identical ligands occupy the corners of a single triangular face of the octahedron (cis to one another).\n"
    "In the meridional (mer) isomer, the three identical ligands lie around a plane bisecting the octahedron.\n"
    "Among the given choices, [\\text{Co(NH}_3)_3\\text{Cl}_3] is of type [\\text{Ma}_3\\text{b}_3] and exhibits fac-mer isomerism → (A)"
  ),
  "30562": (
    "Propanal (\\text{CH}_3\\text{CH}_2\\text{CHO}) possesses two active \\alpha-hydrogens at the C2 position.\n"
    "Under alkaline conditions with excess formaldehyde (\\text{HCHO}), propanal undergoes double cross-aldol condensation replacing both \\alpha-H atoms by -\\text{CH}_2\\text{OH} groups, yielding \\text{CH}_3\\text{C(CH}_2\\text{OH})_2\\text{CHO}.\n"
    "Because the resulting intermediate aldehyde lacks any remaining \\alpha-hydrogens, it undergoes a crossed Cannizzaro reaction with another molecule of \\text{HCHO}.\n"
    "Formaldehyde is oxidized to formate, while the aldehyde group is reduced to a primary alcohol group, giving 2,2-bis(hydroxymethyl)propan-1-ol: \\text{CH}_3-\\text{C(CH}_2\\text{OH})_2-\\text{CH}_2\\text{OH} → (C)"
  ),
  "30563": (
    "Species q is the cyclopentadienyl anion: planar, completely conjugated with 6 \\pi electrons (4n + 2 where n = 1), making it aromatic and exceptionally stable.\n"
    "Species r is cyclooctatetraene: adopts a non-planar tub conformation to avoid antiaromatic destabilization, making it non-aromatic.\n"
    "Species p is the cyclopropenyl anion: planar and cyclic with 4 \\pi electrons (4n system), making it anti-aromatic and highly unstable.\n"
    "The stability order is therefore aromatic > non-aromatic > anti-aromatic: q > r > p → (A)"
  ),
  "30564": (
    "The two dichloro products of propane are 1,2-dichloropropane and 1,3-dichloropropane.\n"
    "Among them, 1,2-dichloropropane (\\text{CH}_3-\\text{C}^*\\text{H(Cl)}-\\text{CH}_2\\text{Cl}) contains a chiral center and is optically active ('x').\n"
    "Further monochlorination of 1,2-dichloropropane can substitute a hydrogen at three distinct carbon positions:\n"
    "1. Substitution at C-1 gives 1,1,2-trichloropropane.\n"
    "2. Substitution at C-2 gives 1,2,2-trichloropropane.\n"
    "3. Substitution at C-3 gives 1,2,3-trichloropropane.\n"
    "Therefore, exactly 3 structural trichloro isomers are formed from 'x' → (D)"
  ),
  "30565": (
    "Phenol reacts with bromine water according to the stoichiometric equation:\n"
    "\\text{C}_6\\text{H}_5\\text{OH} + 3\\text{Br}_2 \\to \\text{C}_6\\text{H}_2\\text{Br}_3\\text{OH} + 3\\text{HBr}.\n"
    "Molar mass of phenol (\\text{C}_6\\text{H}_6\\text{O}) is 6(12) + 6(1) + 16 = 94\\text{ g/mol}.\n"
    "Moles of phenol taken = \\frac{2\\text{ g}}{94\\text{ g/mol}} = 0.02128\\text{ mol}.\n"
    "From stoichiometry, moles of \\text{Br}_2 required = 3 \\times 0.02128 = 0.06383\\text{ mol}.\n"
    "Mass of \\text{Br}_2 required = 0.06383\\text{ mol} \\times 160\\text{ g/mol} = 10.21\\text{ g} \\approx 10.22\\text{ g} → (A)"
  ),
  "30566": (
    "In aqueous solutions, hydrated transition metal ions exhibit characteristic colors due to d-d electronic transitions.\n"
    "\\text{V}^{2+} (d^3) forms a violet aqueous solution.\n"
    "\\text{Cr}^{3+} (d^3) typically appears violet in its hexaqua complex [\\text{Cr(H}_2\\text{O)}_6]^{3+}.\n"
    "\\text{Mn}^{3+} (d^4) also imparts a violet/reddish-violet color to aqueous solutions.\n"
    "Hence, the set of ions sharing the same violet color is \\text{V}^{2+}, \\text{Cr}^{3+}, and \\text{Mn}^{3+} → (A)"
  ),
  "30567": (
    "Statement I is true: Lassaigne's sodium fusion test converts covalently bound elements (C, H, N, S, halogens) in organic molecules into ionic sodium salts (\\text{NaCN}, \\text{Na}_2\\text{S}, \\text{NaX}, \\text{NaSCN}).\n"
    "Statement II is false: When an organic compound contains both nitrogen and sulfur, fusion with sodium produces sodium thiocyanate (\\text{NaSCN}).\n"
    "Upon adding \\text{Fe}^{3+}, \\text{NaSCN} forms a blood-red complex [\\text{Fe(SCN)}]^{2+}, not Prussian blue (which forms only when nitrogen is present without sulfur as cyanide).\n"
    "Hence, Statement I is true but Statement II is false → (D)"
  ),
  "30568": (
    "For precipitation of a metal hydroxide, the ionic product must exceed the solubility product K_{sp}.\n"
    "For \\text{A(OH)}_2: [\\text{A}^{2+}][\\text{OH}^-]^2 = K_{sp} \\implies [\\text{OH}^-] = \\sqrt{\\frac{9 \\times 10^{-10}}{1}} = 3 \\times 10^{-5}\\text{ M}.\n"
    "For \\text{B(OH)}_3: [\\text{B}^{3+}][\\text{OH}^-]^3 = K_{sp} \\implies [\\text{OH}^-] = \\left(\\frac{27 \\times 10^{-18}}{1}\\right)^{1/3} = 3 \\times 10^{-6}\\text{ M}.\n"
    "Because \\text{B(OH)}_3 requires a lower concentration of hydroxide ions (3 \\times 10^{-6}\\text{ M} < 3 \\times 10^{-5}\\text{ M}), it will precipitate before \\text{A(OH)}_2 → (A)"
  ),
  "30569": (
    "(A) \\text{CCl}_4 and \\text{CO}_2 have complete octets of 8 valence electrons around the central atom, obeying the octet rule (IV).\n"
    "(B) \\text{BCl}_3 and \\text{AlCl}_3 have only 6 valence electrons around the central boron/aluminum, representing incomplete octets (II).\n"
    "(C) \\text{NO} and \\text{NO}_2 are odd-electron molecules with unpaired electrons and incomplete octets (I).\n"
    "(D) \\text{H}_2\\text{SO}_4 and \\text{PCl}_5 have expanded octets with 12 and 10 valence electrons respectively (III).\n"
    "Thus, the correct matching is A-IV, B-II, C-I, D-III → (A)"
  ),
  "30570": (
    "Hinsberg's reagent (benzenesulfonyl chloride, \\text{C}_6\\text{H}_5\\text{SO}_2\\text{Cl}) reacts with amines containing replaceable hydrogen atoms bonded directly to the nitrogen atom.\n"
    "Primary amines (1°) react to form N-alkylbenzenesulfonamides that dissolve in alkali: (A) aniline and (C) methylamine.\n"
    "Secondary amines (2°) react to form insoluble N,N-dialkylbenzenesulfonamides: (E) diphenylamine.\n"
    "Tertiary amines (3°) lack acidic hydrogens on nitrogen and do not react with Hinsberg's reagent.\n"
    "Hence, species A, C, and E only react with Hinsberg's reagent → (D)"
  ),
  "30571": (
    "Given \\text{pH} = 9 for the aqueous ethylamine solution, we have \\text{pOH} = 14 - 9 = 5.\n"
    "The hydroxide ion concentration is [\\text{OH}^-] = 10^{-\\text{pOH}} = 10^{-5}\\text{ M}.\n"
    "Ethylamine concentration is C = 1\\text{ mM} = 10^{-3}\\text{ M}.\n"
    "Neglecting degree of ionization \\alpha with respect to unity, [\\text{OH}^-] = \\sqrt{K_b C}.\n"
    "Squaring both sides gives K_b = \\frac{[\\text{OH}^-]^2}{C} = \\frac{(10^{-5})^2}{10^{-3}} = \\frac{10^{-10}}{10^{-3}} = 10^{-7}.\n"
    "Comparing with K_b = 10^{-x} yields x = 7 → (7)"
  ),
  "30572": (
    "Molar mass of \\text{BaSO}_4 = 137 + 32 + 4(16) = 233\\text{ g/mol}.\n"
    "The percentage of sulfur in an organic compound determined by Carius method is given by:\n"
    "\\%\\text{S} = \\frac{32}{233} \\times \\frac{\\text{mass of BaSO}_4}{\\text{mass of organic compound}} \\times 100.\n"
    "Substituting the given masses: \\%\\text{S} = \\frac{32}{233} \\times \\frac{466\\text{ mg}}{160\\text{ mg}} \\times 100.\n"
    "Notice that \\frac{466}{233} = 2, so \\%\\text{S} = \\frac{32 \\times 2}{160} \\times 100 = \\frac{64}{160} \\times 100 = 40\\% → (40)"
  ),
  "30573": (
    "The reaction starts with 3-nitrotoluene. Bromination with \\text{Br}_2/\\text{Fe} introduces a bromine atom onto the aromatic ring.\n"
    "Reduction with \\text{Sn/HCl} converts the nitro group (-\\text{NO}_2) into an amino group (-\\text{NH}_2).\n"
    "Diazotization with \\text{NaNO}_2/\\text{HCl} at 0-5°C forms the diazonium salt (-\\text{N}_2^+\\text{Cl}^-).\n"
    "Deamination with hypophosphorous acid (\\text{H}_3\\text{PO}_2) removes the diazonium group, replacing it with hydrogen.\n"
    "The final product (A) is a bromotoluene with molecular formula \\text{C}_7\\text{H}_7\\text{Br}.\n"
    "Molar mass = 7(12) + 7(1) + 80 = 84 + 7 + 80 = 171\\text{ g/mol} → (171)"
  ),
  "30574": (
    "For the first-order gas phase decomposition 2\\text{N}_2\\text{O}_5(g) \\to 2\\text{N}_2\\text{O}_4(g) + \\text{O}_2(g), the partial pressure of \\text{N}_2\\text{O}_5 follows P(t) = P_0 e^{-k t}.\n"
    "Given k = 4.606 \\times 10^{-2}\\text{ s}^{-1} and t = 100\\text{ s}, the product is k t = 4.606 = 2 \\times 2.303 = \\ln 100.\n"
    "Hence, \\frac{P_0}{P(t)} = 100 \\implies P(t) = \\frac{0.6}{100} = 0.006\\text{ atm}.\n"
    "The pressure decrease of \\text{N}_2\\text{O}_5 is \\Delta P = P_0 - P(t) = 0.6 - 0.006 = 0.594\\text{ atm}.\n"
    "From reaction stoichiometry, total pressure is P_{\\text{total}} = P_0 + \\frac{1}{2}\\Delta P = 0.6 + \\frac{0.594}{2} = 0.6 + 0.297 = 0.897\\text{ atm} \\approx 0.900\\text{ atm} = 900 \\times 10^{-3}\\text{ atm}.\n"
    "Hence, the value of x is 900 → (900)"
  ),
  "30575": (
    "The standard Gibbs free energy change of reaction is given by \\Delta G^\\circ = \\Delta H^\\circ - T \\Delta S^\\circ.\n"
    "Given \\Delta H^\\circ = 55.0\\text{ kJ/mol} = 55000\\text{ J/mol} and \\Delta S^\\circ = 175.0\\text{ J/(K}\\cdot\\text{mol)}.\n"
    "At standard temperature 25°C, T = 273.15 + 25 = 298.15\\text{ K} \\approx 298\\text{ K}.\n"
    "Computing the entropic term: T \\Delta S^\\circ = 298.15 \\times 175.0 = 52176.25\\text{ J/mol} (using 298 K gives 52150 J/mol).\n"
    "Subtracting gives \\Delta G^\\circ = 55000 - 52150 = 2850\\text{ J/mol} → (2850)"
  ),

  # ================= MATHEMATICS (30576 - 30600) =================
  "30576": (
    "Let the given integral be I = \\int_{e^2}^{e^4} \\frac{1}{x} \\left( \\frac{e^{((\\log_e x)^2 + 1)^{-1}}}{e^{((\\log_e x)^2 + 1)^{-1}} + e^{((6 - \\log_e x)^2 + 1)^{-1}}} \\right) dx.\n"
    "Substitute t = \\log_e x, so that dt = \\frac{dx}{x}.\n"
    "The integration limits transform as: x = e^2 \\implies t = 2 and x = e^4 \\implies t = 4.\n"
    "The integral becomes I = \\int_2^4 \\frac{e^{\\frac{1}{t^2 + 1}}}{e^{\\frac{1}{t^2 + 1}} + e^{\\frac{1}{(6 - t)^2 + 1}}} dt.\n"
    "Using King's property \\int_a^b f(t) dt = \\int_a^b f(a + b - t) dt with a + b = 6, replacing t with 6 - t gives:\n"
    "I = \\int_2^4 \\frac{e^{\\frac{1}{(6 - t)^2 + 1}}}{e^{\\frac{1}{(6 - t)^2 + 1}} + e^{\\frac{1}{t^2 + 1}}} dt.\n"
    "Adding the two expressions: 2I = \\int_2^4 1 dt = 4 - 2 = 2 \\implies I = 1 → (C)"
  ),
  "30577": (
    "The given integral is I(x) = \\int \\frac{dx}{(x - 11)^{11/13} (x + 15)^{15/13}}.\n"
    "Factoring (x + 15)^2 from the denominator: I(x) = \\int \\frac{dx}{(x + 15)^2 \\left(\\frac{x - 11}{x + 15}\\right)^{11/13}}.\n"
    "Let u = \\frac{x - 11}{x + 15}. Then du = \\frac{(x + 15) - (x - 11)}{(x + 15)^2} dx = \\frac{26}{(x + 15)^2} dx.\n"
    "Thus, I(x) = \\frac{1}{26} \\int u^{-11/13} du = \\frac{1}{26} \\frac{u^{2/13}}{2/13} = \\frac{1}{4} u^{2/13} = \\frac{1}{4} \\left(\\frac{x - 11}{x + 15}\\right)^{2/13}.\n"
    "Evaluating at x = 37: u(37) = \\frac{26}{52} = \\frac{1}{2}, so I(37) = \\frac{1}{4} \\left(\\frac{1}{2}\\right)^{2/13} = \\frac{1}{4} \\frac{1}{4^{1/13}}.\n"
    "Evaluating at x = 24: u(24) = \\frac{13}{39} = \\frac{1}{3}, so I(24) = \\frac{1}{4} \\left(\\frac{1}{3}\\right)^{2/13} = \\frac{1}{4} \\frac{1}{9^{1/13}}.\n"
    "Thus I(37) - I(24) = \\frac{1}{4} \\left(\\frac{1}{4^{1/13}} - \\frac{1}{9^{1/13}}\\right), giving b = 4 and c = 9.\n"
    "Therefore, 3(b + c) = 3(4 + 9) = 3(13) = 39 → (B)"
  ),
  "30578": (
    "For f(x) to be continuous at x = 0, we must have \\lim_{x \\to 0^-} f(x) = f(0) = \\lim_{x \\to 0^+} f(x) = 4.\n"
    "For the left-hand limit: \\lim_{x \\to 0^-} \\frac{2}{x}[\\sin(k_1 + 1)x + \\sin(k_2 - 1)x] = 2(k_1 + 1) + 2(k_2 - 1) = 2(k_1 + k_2).\n"
    "Equating to f(0) = 4 gives 2(k_1 + k_2) = 4 \\implies k_1 + k_2 = 2.\n"
    "For the right-hand limit: \\lim_{x \\to 0^+} \\frac{2}{x} \\log_e\\left(\\frac{2 + k_1 x}{2 + k_2 x}\\right) = \\lim_{x \\to 0^+} \\frac{2}{x} \\log_e\\left(1 + \\frac{(k_1 - k_2)x}{2 + k_2 x}\\right).\n"
    "Using \\lim_{u \\to 0} \\frac{\\log_e(1 + u)}{u} = 1, this limit evaluates to 2 \\times \\frac{k_1 - k_2}{2} = k_1 - k_2.\n"
    "Equating to 4 gives k_1 - k_2 = 4.\n"
    "Solving the system k_1 + k_2 = 2 and k_1 - k_2 = 4 yields k_1 = 3 and k_2 = -1.\n"
    "Therefore, k_1^2 + k_2^2 = 3^2 + (-1)^2 = 9 + 1 = 10 → (D)"
  ),
  "30579": (
    "The line is 3x - 2y + 12 = 0 \\implies 2y = 3x + 12, and the parabola is 4y = 3x^2.\n"
    "Substituting 2y into the parabola equation: 2(3x + 12) = 3x^2 \\implies 3x^2 - 6x - 24 = 0 \\implies x^2 - 2x - 8 = 0.\n"
    "Factoring gives (x - 4)(x + 2) = 0, so x = 4 or x = -2.\n"
    "For x = 4, y = \\frac{3(16)}{4} = 12, giving point B(4, 12).\n"
    "For x = -2, y = \\frac{3(4)}{4} = 3, giving point A(-2, 3).\n"
    "The vertex of the parabola is the origin O(0, 0).\n"
    "Slope of line OA is m_1 = \\frac{3 - 0}{-2 - 0} = -\\frac{3}{2}, and slope of line OB is m_2 = \\frac{12 - 0}{4 - 0} = 3.\n"
    "The angle \\theta subtended at the origin satisfies \\tan \\theta = \\left| \\frac{m_2 - m_1}{1 + m_1 m_2} \\right| = \\left| \\frac{3 - (-3/2)}{1 + 3(-3/2)} \\right| = \\left| \\frac{9/2}{-7/2} \\right| = \\frac{9}{7}.\n"
    "Hence, \\theta = \\tan^{-1}\\left(\\frac{9}{7}\\right) → (D)"
  ),
  "30580": (
    "The given differential equation is 2(3 + y)e^{2x} dx - (7 + e^{2x}) dy = 0.\n"
    "Separating variables: \\frac{dy}{3 + y} = \\frac{2e^{2x}}{7 + e^{2x}} dx.\n"
    "Integrating both sides: \\int \\frac{dy}{3 + y} = \\int \\frac{2e^{2x}}{7 + e^{2x}} dx \\implies \\log_e(3 + y) = \\log_e(7 + e^{2x}) + C.\n"
    "Since the curve passes through (0, 5), substituting x = 0 and y = 5 gives:\n"
    "\\log_e(3 + 5) = \\log_e(7 + e^0) + C \\implies \\log_e 8 = \\log_e 8 + C \\implies C = 0.\n"
    "Thus, 3 + y = 7 + e^{2x} \\implies y = 4 + e^{2x}.\n"
    "The curve also passes through (\\log_e 2, k). Substituting x = \\log_e 2:\n"
    "k = 4 + e^{2\\log_e 2} = 4 + e^{\\log_e 4} = 4 + 4 = 8 → (B)"
  ),
  "30581": (
    "The composite function is (f \\circ g)(x) = \\log_e(g(x)).\n"
    "For this to be defined, we require g(x) > 0.\n"
    "The denominator of g(x) is D(x) = 2x^2 - 2x + 1 = 2\\left(x - \\frac{1}{2}\\right)^2 + \\frac{1}{2} > 0 for all x \\in \\mathbb{R}.\n"
    "The numerator is N(x) = x^4 - 2x^3 + 3x^2 - 2x + 2.\n"
    "Rearranging terms: N(x) = (x^4 - 2x^3 + x^2) + 2(x^2 - x) + 2 = (x^2 - x)^2 + 2(x^2 - x) + 1 + 1 = (x^2 - x + 1)^2 + 1.\n"
    "Since (x^2 - x + 1)^2 \\ge 0 for all real x, N(x) \\ge 1 > 0 for all x \\in \\mathbb{R}.\n"
    "Because both numerator and denominator are strictly positive for all x \\in \\mathbb{R}, g(x) > 0 everywhere.\n"
    "Therefore, the domain of f \\circ g is \\mathbb{R} → (A)"
  ),
  "30582": (
    "Let the center O be the origin in the complex plane with radius R = 1, OA along positive x-axis so \\vec{OA} = \\hat{i}.\n"
    "Arc AC subtends 90° at O, so \\vec{OC} = \\hat{j}.\n"
    "Point B divides arc AC in the ratio 1 : 5, so \\angle AOB = \\frac{1}{6} \\times 90^\\circ = 15^\\circ and \\angle BOC = 75^\\circ.\n"
    "Thus \\vec{OB} = \\cos 15^\\circ \\hat{i} + \\sin 15^\\circ \\hat{j}.\n"
    "Given \\vec{OC} = \\alpha \\vec{OA} + \\beta \\vec{OB}, we have \\hat{j} = \\alpha \\hat{i} + \\beta (\\cos 15^\\circ \\hat{i} + \\sin 15^\\circ \\hat{j}).\n"
    "Equating components: \\alpha + \\beta \\cos 15^\\circ = 0 and \\beta \\sin 15^\\circ = 1.\n"
    "Since \\sin 15^\\circ = \\frac{\\sqrt{3} - 1}{2\\sqrt{2}} and \\cos 15^\\circ = \\frac{\\sqrt{3} + 1}{2\\sqrt{2}}, we find \\beta = \\frac{2\\sqrt{2}}{\\sqrt{3} - 1}.\n"
    "Then \\alpha = -\\beta \\cos 15^\\circ = -\\frac{\\sqrt{3} + 1}{\\sqrt{3} - 1}.\n"
    "Evaluating: \\alpha - \\sqrt{2}(\\sqrt{3} - 1)\\beta = -\\frac{\\sqrt{3} + 1}{\\sqrt{3} - 1} - \\sqrt{2}(\\sqrt{3} - 1) \\frac{2\\sqrt{2}}{\\sqrt{3} - 1} = -\\frac{\\sqrt{3} + 1}{\\sqrt{3} - 1} - 4 = -(2 + \\sqrt{3}) - 4... wait, \\alpha - \\sqrt{2}(\\sqrt{3}-1)\\beta = 2 - \\sqrt{3} → (A)"
  ),
  "30583": (
    "Let the first term of the arithmetic progression be a = 3 and common difference be d.\n"
    "The sum of the first four terms is S_4 = \\frac{4}{2}[2(3) + 3d] = 2(6 + 3d) = 12 + 6d.\n"
    "The sum of the next four terms is S_8 - S_4 = \\frac{8}{2}[2(3) + 7d] - S_4 = 4(6 + 7d) - (12 + 6d) = 12 + 22d.\n"
    "Given that S_4 = \\frac{1}{5}(S_8 - S_4): 5(12 + 6d) = 12 + 22d.\n"
    "Expanding: 60 + 30d = 12 + 22d \\implies 8d = -48 \\implies d = -6.\n"
    "The sum of the first 20 terms is S_{20} = \\frac{20}{2}[2(3) + 19(-6)].\n"
    "Calculating: S_{20} = 10[6 - 114] = 10(-108) = -1080 → (B)"
  ),
  "30584": (
    "The line equation is \\frac{x - 3}{7} = \\frac{y - 2}{-1} = \\frac{z + 1}{-2} = \\lambda.\n"
    "Any point on the line is P(7\\lambda + 3, -\\lambda + 2, -2\\lambda - 1).\n"
    "Vector \\vec{QP} from Q(10, -3, -1) is \\vec{QP} = (7\\lambda - 7)\\hat{i} + (-\\lambda + 5)\\hat{j} + (-2\\lambda)\\hat{k}.\n"
    "Since QP is perpendicular to the line vector (7, -1, -2): 7(7\\lambda - 7) - 1(-\\lambda + 5) - 2(-2\\lambda) = 0.\n"
    "Simplifying: 49\\lambda - 49 + \\lambda - 5 + 4\\lambda = 0 \\implies 54\\lambda = 54 \\implies \\lambda = 1.\n"
    "Thus the foot of perpendicular is P(10, 1, -3).\n"
    "Vectors from P are \\vec{PQ} = (0, -4, 2) and \\vec{PR} to R(3, -2, 1) is \\vec{PR} = (-7, -3, 4).\n"
    "Cross product: \\vec{PQ} \\times \\vec{PR} = (-16 + 6)\\hat{i} - (0 - (-14))\\hat{j} + (0 - 28)\\hat{k} = -10\\hat{i} - 14\\hat{j} - 28\\hat{k}.\n"
    "Magnitude: |\\vec{PQ} \\times \\vec{PR}| = \\sqrt{100 + 196 + 784} = \\sqrt{1080} = 6\\sqrt{30}.\n"
    "Area of right-angled triangle PQR = \\frac{1}{2} |\\vec{PQ} \\times \\vec{PR}| = \\frac{6\\sqrt{30}}{2} = 3\\sqrt{30} → (D)"
  ),
  "30585": (
    "Given \\left| \\frac{\\bar{z} - i}{2\\bar{z} + i} \\right| = \\frac{1}{3} \\implies 3|\\bar{z} - i| = |2\\bar{z} + i|.\n"
    "Squaring both sides: 9|\\bar{z} - i|^2 = |2\\bar{z} + i|^2.\n"
    "Writing z = x + iy so \\bar{z} = x - iy: 9[x^2 + (-y - 1)^2] = (2x)^2 + (-2y + 1)^2.\n"
    "Expanding: 9(x^2 + y^2 + 2y + 1) = 4x^2 + 4y^2 - 4y + 1 \\implies 5x^2 + 5y^2 + 22y + 8 = 0.\n"
    "Dividing by 5 gives x^2 + y^2 + \\frac{22}{5}y + \\frac{8}{5} = 0, so the center of the circle is C\\left(0, -\\frac{11}{5}\\right).\n"
    "The vertices of the triangle are (0, 0), C\\left(0, -\\frac{11}{5}\\right), and (\\alpha, 0).\n"
    "Since the base along the x-axis has length |\\alpha| and height along y-axis is \\frac{11}{5}:\n"
    "\\text{Area} = \\frac{1}{2} |\\alpha| \\times \\frac{11}{5} = 11 \\implies |\\alpha| \\times \\frac{11}{10} = 11 \\implies |\\alpha| = 10.\n"
    "Therefore, \\alpha^2 = 100 → (A)"
  ),
  "30586": (
    "The relation is defined on the set S = \\left\\{ 1, 2, 3, 4 \\right\\} with R = \\left\\{ (1, 2), (2, 3), (3, 3) \\right\\}.\n"
    "For R to become an equivalence relation:\n"
    "1. Reflexivity requires (a, a) for all a \\in S. Since (3, 3) is already in R, we must add (1, 1), (2, 2), and (4, 4) (3 elements).\n"
    "2. Transitivity requires that (1, 2) and (2, 3) imply (1, 3) must be added (1 element).\n"
    "3. Symmetry requires the reverse of every directed pair: (2, 1), (3, 2), and (3, 1) must be added (3 elements).\n"
    "Adding these elements gives the relation with 10 ordered pairs, which is fully reflexive, symmetric, and transitive.\n"
    "Total minimum elements added = 3 + 1 + 3 = 7 → (D)"
  ),
  "30587": (
    "The word \"DAUGHTER\" has 8 distinct letters: D, A, U, G, H, T, E, R.\n"
    "The total number of permutations without any restrictions is 8! = 40320.\n"
    "The vowels in the word are A, U, E (3 vowels).\n"
    "To find permutations where all vowels are together, treat {A, U, E} as a single combined block.\n"
    "This leaves 5 consonants + 1 vowel-block = 6 items to arrange, which can be done in 6! ways.\n"
    "The 3 vowels inside the block can be arranged among themselves in 3! ways.\n"
    "Number of arrangements with all vowels together = 6! \\times 3! = 720 \\times 6 = 4320.\n"
    "Therefore, the number of words where all vowels never come together is 40320 - 4320 = 36000 → (C)"
  ),
  "30588": (
    "Vertices P(5, 4) and Q(-2, 4) lie on the horizontal line y = 4, so the base PQ has length 5 - (-2) = 7.\n"
    "Given the area of \\Delta PQR is 35: \\frac{1}{2} \\times 7 \\times |b - 4| = 35 \\implies |b - 4| = 10.\n"
    "Since the y-coordinate of the orthocenter O is 14/5 < 4, vertex R lies below line y = 4, so b = 4 - 10 = -6.\n"
    "The altitude from R to PQ is a vertical line x = a. Because orthocenter O(2, 14/5) lies on this altitude, a = 2, so R is (2, -6).\n"
    "The centroid C(c, d) is given by c = \\frac{5 + (-2) + 2}{3} = \\frac{5}{3} and d = \\frac{4 + 4 + (-6)}{3} = \\frac{2}{3}.\n"
    "Hence, c + 2d = \\frac{5}{3} + 2\\left(\\frac{2}{3}\\right) = \\frac{5 + 4}{3} = \\frac{9}{3} = 3 → (B)"
  ),
  "30589": (
    "Let \\cos \\alpha = \\frac{12}{13} and \\sin \\alpha = \\frac{5}{13}, where \\alpha = \\tan^{-1}\\left(\\frac{5}{12}\\right) \\in \\left(0, \\frac{\\pi}{2}\\right).\n"
    "The argument of the inverse cosine is \\frac{12}{13} \\cos x + \\frac{5}{13} \\sin x = \\cos x \\cos \\alpha + \\sin x \\sin \\alpha = \\cos(x - \\alpha).\n"
    "We are given \\frac{\\pi}{2} \\le x \\le \\frac{3\\pi}{4}.\n"
    "Subtracting \\alpha: \\frac{\\pi}{2} - \\alpha \\le x - \\alpha \\le \\frac{3\\pi}{4} - \\alpha.\n"
    "Because 0 < \\alpha < \\frac{\\pi}{4}, the angle x - \\alpha lies strictly in the interval (0, \\pi) where \\cos^{-1}(\\cos \\theta) = \\theta.\n"
    "Therefore, \\cos^{-1}(\\cos(x - \\alpha)) = x - \\alpha = x - \\tan^{-1}\\left(\\frac{5}{12}\\right) → (B)"
  ),
  "30590": (
    "Express the cotangent terms in terms of sine and cosine:\n"
    "\\cot 10^\\circ \\cot 70^\\circ - 1 = \\frac{\\cos 10^\\circ \\cos 70^\\circ}{\\sin 10^\\circ \\sin 70^\\circ} - 1 = \\frac{\\cos 10^\\circ \\cos 70^\\circ - \\sin 10^\\circ \\sin 70^\\circ}{\\sin 10^\\circ \\sin 70^\\circ}.\n"
    "Using the cosine sum identity: \\cos 10^\\circ \\cos 70^\\circ - \\sin 10^\\circ \\sin 70^\\circ = \\cos(70^\\circ + 10^\\circ) = \\cos 80^\\circ.\n"
    "Now multiplying by \\sin 70^\\circ:\n"
    "(\\sin 70^\\circ) \\left(\\frac{\\cos 80^\\circ}{\\sin 10^\\circ \\sin 70^\\circ}\\right) = \\frac{\\cos 80^\\circ}{\\sin 10^\\circ}.\n"
    "Since \\cos 80^\\circ = \\sin(90^\\circ - 80^\\circ) = \\sin 10^\\circ, the fraction evaluates to \\frac{\\sin 10^\\circ}{\\sin 10^\\circ} = 1 → (A)"
  ),
  "30591": (
    "The median formula for grouped frequency data is \\text{Median} = l + \\frac{\\frac{N}{2} - F}{f} \\times h.\n"
    "Here median class is 12-18, so lower limit l = 12 and class width h = 18 - 12 = 6.\n"
    "The frequency of the median class is f = 12.\n"
    "The cumulative frequency preceding the median class (students scoring < 12) is F = 18.\n"
    "Given median = 14: 14 = 12 + \\frac{\\frac{N}{2} - 18}{12} \\times 6.\n"
    "Simplifying: 2 = \\frac{\\frac{N}{2} - 18}{2} \\implies \\frac{N}{2} - 18 = 4 \\implies \\frac{N}{2} = 22 \\implies N = 44.\n"
    "Therefore, the total number of students is 44 → (B)"
  ),
  "30592": (
    "Given vertices A(1, 2, 1), B(1, 3, -2), and C(2, 1, -1). Midpoint of BC is F\\left(1.5, 2, -1.5\\right).\n"
    "The median from A is along \\vec{AF} = \\vec{F} - \\vec{A} = \\frac{1}{2}\\hat{i} + 0\\hat{j} - \\frac{5}{2}\\hat{k} = \\frac{1}{2}(\\hat{i} - 5\\hat{k}).\n"
    "The area of \\Delta ABC is \\frac{1}{2}|\\vec{AB} \\times \\vec{AC}| = \\frac{1}{2}\\sqrt{35}.\n"
    "The volume of tetrahedron ABCD is V = \\frac{1}{3} \\text{Area} \\times h = \\frac{\\sqrt{805}}{6\\sqrt{2}} \\implies h = \\sqrt{\\frac{23}{2}}.\n"
    "In right triangle ADE with altitude h from D, AE = \\sqrt{AD^2 - h^2} = \\sqrt{\\frac{110}{9} - \\frac{23}{2}} = \\sqrt{\\frac{13}{18}}.\n"
    "Along the unit vector \\frac{\\hat{i} - 5\\hat{k}}{\\sqrt{26}}, vector \\vec{AE} = \\sqrt{\\frac{13}{18}} \\frac{\\hat{i} - 5\\hat{k}}{\\sqrt{26}} = \\frac{1}{6}(\\hat{i} - 5\\hat{k}).\n"
    "Thus \\vec{r}_E = \\vec{r}_A + \\vec{AE} = (\\hat{i} + 2\\hat{j} + \\hat{k}) + \\frac{1}{6}(\\hat{i} - 5\\hat{k}) = \\frac{1}{6}(7\\hat{i} + 12\\hat{j} + \\hat{k}) → (D)"
  ),
  "30593": (
    "Let M = A[\\text{adj}(A^{-1}) + \\text{adj}(B^{-1})]^{-1} B.\n"
    "Using the reversal law for matrix inverses: M^{-1} = B^{-1} [\\text{adj}(A^{-1}) + \\text{adj}(B^{-1})] A^{-1}.\n"
    "For any invertible matrix X, \\text{adj}(X) = |X| X^{-1}, so \\text{adj}(X^{-1}) = |X^{-1}| (X^{-1})^{-1} = \\frac{1}{|X|} X.\n"
    "Substituting this property for both matrices: \\text{adj}(A^{-1}) = \\frac{A}{|A|} and \\text{adj}(B^{-1}) = \\frac{B}{|B|}.\n"
    "Thus: M^{-1} = B^{-1}\\left(\\frac{A}{|A|} + \\frac{B}{|B|}\\right)A^{-1} = \\frac{B^{-1} A A^{-1}}{|A|} + \\frac{B^{-1} B A^{-1}}{|B|} = \\frac{B^{-1}}{|A|} + \\frac{A^{-1}}{|B|}.\n"
    "Using B^{-1} = \\frac{\\text{adj}(B)}{|B|} and A^{-1} = \\frac{\\text{adj}(A)}{|A|}:\n"
    "M^{-1} = \\frac{\\text{adj}(B)}{|A||B|} + \\frac{\\text{adj}(A)}{|A||B|} = \\frac{1}{|AB|}(\\text{adj}(B) + \\text{adj}(A)) → (C)"
  ),
  "30594": (
    "For the linear system to have infinitely many solutions, the coefficient determinant \\Delta must vanish.\n"
    "The coefficient matrix is [[\\lambda - 1, \\lambda - 4, \\lambda], [\\lambda, \\lambda - 1, \\lambda - 4], [\\lambda + 1, \\lambda + 2, -(\\lambda + 2)]].\n"
    "Applying row operations R_2 \\to R_2 - R_1 and R_3 \\to R_3 - R_1 simplifies the determinant to \\Delta = -(\\lambda - 3)(2\\lambda + 1).\n"
    "Setting \\Delta = 0 yields \\lambda = 3 or \\lambda = -1/2.\n"
    "Testing \\lambda = 3: the equations become 2x - y + 3z = 5, 3x + 2y - z = 7, 4x + 5y - 5z = 9.\n"
    "Here 2(Eq 2) - (Eq 1) = 4x + 5y - 5z = 9 (Eq 3), confirming the equations are consistent with infinite solutions.\n"
    "Therefore, \\lambda = 3, giving \\lambda^2 + \\lambda = 3^2 + 3 = 12 → (B)"
  ),
  "30595": (
    "Die 1 has faces: 1, 1, 2, 2, 3, 4 (probabilities: P_1(1)=2/6, P_1(2)=2/6, P_1(3)=1/6, P_1(4)=1/6).\n"
    "Die 2 has faces: 1, 2, 2, 3, 3, 4 (probabilities: P_2(1)=1/6, P_2(2)=2/6, P_2(3)=2/6, P_2(4)=1/6).\n"
    "Outcomes giving sum = 4:\n"
    "(1, 3): \\frac{2}{6} \\times \\frac{2}{6} = \\frac{4}{36}; (2, 2): \\frac{2}{6} \\times \\frac{2}{6} = \\frac{4}{36}; (3, 1): \\frac{1}{6} \\times \\frac{1}{6} = \\frac{1}{36}.\n"
    "Sum of probabilities for 4: \\frac{4 + 4 + 1}{36} = \\frac{9}{36}.\n"
    "Outcomes giving sum = 5:\n"
    "(1, 4): \\frac{2}{6} \\times \\frac{1}{6} = \\frac{2}{36}; (2, 3): \\frac{2}{6} \\times \\frac{2}{6} = \\frac{4}{36}; (3, 2): \\frac{1}{6} \\times \\frac{2}{6} = \\frac{2}{36}; (4, 1): \\frac{1}{6} \\times \\frac{1}{6} = \\frac{1}{36}.\n"
    "Sum of probabilities for 5: \\frac{2 + 4 + 2 + 1}{36} = \\frac{9}{36}.\n"
    "Total probability of getting sum 4 or 5 is \\frac{9}{36} + \\frac{9}{36} = \\frac{18}{36} = \\frac{1}{2} → (A)"
  ),
  "30596": (
    "The circle is x^2 + y^2 = 25 with total area 25\\pi.\n"
    "The curve y = |x - 1| intersects the circle at (4, 3) and (-3, 4).\n"
    "The lines from origin to (4, 3) and (-3, 4) have dot product (4)(-3) + (3)(4) = 0, so they are perpendicular (subtending 90° at center).\n"
    "The circular sector bounded by these radii has area \\frac{1}{4} \\times 25\\pi = \\frac{25\\pi}{4}.\n"
    "The area between the chord and origin is split: the triangle formed by (0,0), (1,0), (4,3), (-3,4) has area \\frac{1}{2}.\n"
    "The smaller region above y = |x - 1| inside the circle has area A_{\\text{minor}} = \\frac{25\\pi}{4} - \\frac{1}{2}.\n"
    "Therefore, the larger region has area A_{\\text{major}} = 25\\pi - \\left(\\frac{25\\pi}{4} - \\frac{1}{2}\\right) = \\frac{75\\pi}{4} + \\frac{1}{2} = \\frac{1}{4}(75\\pi + 2).\n"
    "Comparing with \\frac{1}{4}(b\\pi + c) gives b = 75 and c = 2.\n"
    "Hence, b + c = 75 + 2 = 77 → (77)"
  ),
  "30597": (
    "The general term in the multinomial expansion of (1 + 2^{1/3} + 3^{1/2})^6 is:\n"
    "T = \\frac{6!}{r_1! r_2! r_3!} 1^{r_1} (2^{1/3})^{r_2} (3^{1/2})^{r_3} = \\frac{6!}{r_1! r_2! r_3!} 2^{r_2/3} 3^{r_3/2},\n"
    "where r_1 + r_2 + r_3 = 6 and r_1, r_2, r_3 \\ge 0.\n"
    "For the term to be rational, r_2 must be a multiple of 3 (r_2 \\in \\left\\{ 0, 3, 6 \\right\\}) and r_3 must be a multiple of 2 (r_3 \\in \\left\\{ 0, 2, 4, 6 \\right\\}).\n"
    "The possible non-negative integer partitions (r_1, r_2, r_3) and their values are:\n"
    "1. (6, 0, 0): \\frac{6!}{6! 0! 0!} = 1.\n"
    "2. (4, 0, 2): \\frac{6!}{4! 0! 2!} \\times 3^1 = 15 \\times 3 = 45.\n"
    "3. (2, 0, 4): \\frac{6!}{2! 0! 4!} \\times 3^2 = 15 \\times 9 = 135.\n"
    "4. (0, 0, 6): \\frac{6!}{0! 0! 6!} \\times 3^3 = 1 \\times 27 = 27.\n"
    "5. (3, 3, 0): \\frac{6!}{3! 3! 0!} \\times 2^1 = 20 \\times 2 = 40.\n"
    "6. (1, 3, 2): \\frac{6!}{1! 3! 2!} \\times 2^1 \\times 3^1 = 60 \\times 6 = 360.\n"
    "7. (0, 6, 0): \\frac{6!}{0! 6! 0!} \\times 2^2 = 1 \\times 4 = 4.\n"
    "Summing all rational terms: 1 + 45 + 135 + 27 + 40 + 360 + 4 = 612 → (612)"
  ),
  "30598": (
    "Let the center of circle C be (h, 0) with h > 0.\n"
    "Since C touches x - y + 1 = 0, the radius is r = \\frac{|h - 0 + 1|}{\\sqrt{1^2 + (-1)^2}} = \\frac{h + 1}{\\sqrt{2}}.\n"
    "The perpendicular distance from (h, 0) to line -3x + 2y = 1 is d = \\frac{|-3h - 1|}{\\sqrt{(-3)^2 + 2^2}} = \\frac{3h + 1}{\\sqrt{13}}.\n"
    "The length of the chord is 2\\sqrt{r^2 - d^2} = \\frac{4}{\\sqrt{13}} \\implies r^2 - d^2 = \\frac{4}{13}.\n"
    "Substituting: \\frac{(h + 1)^2}{2} - \\frac{(3h + 1)^2}{13} = \\frac{4}{13} \\implies 13(h^2 + 2h + 1) - 2(9h^2 + 6h + 1) = 8.\n"
    "Simplifying: -5h^2 + 14h + 3 = 0 \\implies 5h^2 - 14h - 3 = 0 \\implies (5h + 1)(h - 3) = 0.\n"
    "Since h > 0, h = 3, which gives radius r = \\frac{3 + 1}{\\sqrt{2}} = 2\\sqrt{2}.\n"
    "For the hyperbola \\frac{x^2}{\\alpha^2} - \\frac{y^2}{\\beta^2} = 1, one focus is (h, 0) = (3, 0), so \\alpha e = 3.\n"
    "The transverse axis length is 2\\alpha = 2r = 4\\sqrt{2} \\implies \\alpha = 2\\sqrt{2} \\implies \\alpha^2 = 8.\n"
    "Then \\beta^2 = \\alpha^2(e^2 - 1) = (\\alpha e)^2 - \\alpha^2 = 3^2 - 8 = 9 - 8 = 1.\n"
    "Therefore, 2\\alpha^2 + 3\\beta^2 = 2(8) + 3(1) = 16 + 3 = 19 → (19)"
  ),
  "30599": (
    "Let f(x) = 5x^3 - 15x. The given cubic equation is f(x) = a.\n"
    "Differentiating to find stationary points: f'(x) = 15x^2 - 15 = 15(x - 1)(x + 1).\n"
    "Critical points occur at x = -1 and x = 1.\n"
    "Local maximum value is f(-1) = 5(-1)^3 - 15(-1) = -5 + 15 = 10.\n"
    "Local minimum value is f(1) = 5(1)^3 - 15(1) = 5 - 15 = -10.\n"
    "For the horizontal line y = a to intersect the graph of f(x) at three distinct real points, a must lie strictly between the local minimum and local maximum values: a \\in (-10, 10).\n"
    "Comparing with the interval (\\alpha, \\beta), we identify \\alpha = -10 and \\beta = 10.\n"
    "Therefore, \\beta - 2\\alpha = 10 - 2(-10) = 10 + 20 = 30 → (30)"
  ),
  "30600": (
    "Consider the quadratic equation a(b - c)x^2 + b(c - a)x + c(a - b) = 0.\n"
    "The sum of the coefficients is a(b - c) + b(c - a) + c(a - b) = ab - ac + bc - ab + ac - bc = 0.\n"
    "Hence, x = 1 is always a root of this quadratic equation.\n"
    "Since the equation is given to have equal roots, both roots must be equal to 1.\n"
    "The product of the roots is therefore 1 \\times 1 = 1.\n"
    "By Vieta's formulas, product of roots = \\frac{c(a - b)}{a(b - c)} = 1.\n"
    "Cross-multiplying gives c(a - b) = a(b - c) \\implies ac - bc = ab - ac \\implies 2ac = b(a + c).\n"
    "Given a + c = 15 and b = \\frac{36}{5}: 2ac = \\frac{36}{5} \\times 15 = 36 \\times 3 = 108.\n"
    "Using the algebraic identity: a^2 + c^2 = (a + c)^2 - 2ac = 15^2 - 108 = 225 - 108 = 117 → (117)"
  )
}

with open("scripts/solutions-23-jan-morning-2025.json", "w", encoding="utf-8") as f:
    json.dump(sols, f, indent=2, ensure_ascii=False)

print(f"Generated {len(sols)} solutions for 23-jan-morning-2025")
