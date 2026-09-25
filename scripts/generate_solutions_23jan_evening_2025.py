import json

sols = {
  # ================= PHYSICS (30697 - 30721) =================
  "30697": (
    "A projectile launched with initial speed u at angle \\theta to the horizontal has horizontal velocity component u_x = u \\cos \\theta.\n"
    "Because there is no acceleration in the horizontal direction, u_x remains constant throughout the flight.\n"
    "At the highest point, the vertical component of velocity vanishes (v_y = 0), so the speed of the ball is solely v = u_x = u \\cos 60^\\circ = \\frac{u}{2}.\n"
    "The kinetic energy at the peak is therefore \\text{KE}' = \\frac{1}{2} m v^2 = \\frac{1}{2} m \\left(\\frac{u}{2}\\right)^2 = \\frac{1}{4} \\left(\\frac{1}{2} m u^2\\right) = \\frac{\\text{KE}}{4} → (B)"
  ),
  "30698": (
    "The electrostatic potential energy of a two-charge configuration in vacuum is U = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r}.\n"
    "The charges are q_1 = 7\\ \\mu\\text{C} = 7 \\times 10^{-6}\\text{ C} at (-7\\text{ cm}, 0, 0) and q_2 = -4\\ \\mu\\text{C} = -4 \\times 10^{-6}\\text{ C} at (7\\text{ cm}, 0, 0).\n"
    "The distance separating the charges is r = 7 - (-7) = 14\\text{ cm} = 0.14\\text{ m}.\n"
    "Using \\frac{1}{4\\pi\\varepsilon_0} = 9 \\times 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2:\n"
    "U = (9 \\times 10^9) \\times \\frac{(7 \\times 10^{-6}) \\times (-4 \\times 10^{-6})}{0.14} = (9 \\times 10^9) \\times \\frac{-28 \\times 10^{-12}}{0.14} = -1.8\\text{ J} → (D)"
  ),
  "30699": (
    "The refractive index \\mu of a prism of angle A and minimum deviation \\delta_m is given by \\mu = \\frac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}.\n"
    "Given that the angle of minimum deviation equals the prism angle (\\delta_m = A):\n"
    "\\mu = \\frac{\\sin\\left(\\frac{A + A}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)} = \\frac{\\sin A}{\\sin(A/2)} = \\frac{2\\sin(A/2)\\cos(A/2)}{\\sin(A/2)} = 2\\cos(A/2).\n"
    "Given \\mu = \\sqrt{3}: 2\\cos(A/2) = \\sqrt{3} \\implies \\cos(A/2) = \\frac{\\sqrt{3}}{2}.\n"
    "Taking the principal value: \\frac{A}{2} = 30^\\circ \\implies A = 60^\\circ → (B)"
  ),
  "30700": (
    "The wave equation is given by y(x, t) = 4.0 \\sin[20 \\times 10^{-3} x + 600 t]\\text{ mm}.\n"
    "Comparing with the standard travelling wave form y(x, t) = A \\sin(k x + \\omega t), we have k = 20 \\times 10^{-3}\\text{ mm}^{-1} and \\omega = 600\\text{ s}^{-1}.\n"
    "Because the signs of the k x and \\omega t terms are identical (+), the wave propagates in the negative x-direction.\n"
    "The wave speed is v = -\\frac{\\omega}{k} = -\\frac{600\\text{ s}^{-1}}{20 \\times 10^{-3}\\text{ mm}^{-1}} = -30000\\text{ mm/s}.\n"
    "Converting to meters per second: v = -\\frac{30000}{1000}\\text{ m/s} = -30\\text{ m/s} → (C)"
  ),
  "30701": (
    "The energy function is E(t) = \\alpha^3 e^{-\\beta t}.\n"
    "Taking the natural logarithm on both sides: \\ln E = 3 \\ln \\alpha - \\beta t.\n"
    "Differentiating to find the maximum fractional error: \\frac{\\Delta E}{E} = 3 \\frac{\\Delta \\alpha}{\\alpha} + \\beta \\Delta t = 3 \\left(\\frac{\\Delta \\alpha}{\\alpha}\\right) + \\beta t \\left(\\frac{\\Delta t}{t}\\right).\n"
    "Given \\frac{\\Delta \\alpha}{\\alpha} = 1.2\\% = 0.012, \\beta = 0.3\\text{ s}^{-1}, t = 5\\text{ s}, and \\frac{\\Delta t}{t} = 1.6\\% = 0.016:\n"
    "\\frac{\\Delta E}{E} = 3(1.2\\%) + (0.3 \\times 5)(1.6\\%) = 3.6\\% + 1.5(1.6\\%) = 3.6\\% + 2.4\\% = 6.0\\% → (C)"
  ),
  "30702": (
    "According to Einstein's photoelectric equation, the energy of the incident photon is E = \\phi + K_{\\text{max}} = \\phi + e V_0.\n"
    "Given work function \\phi = 2.14\\text{ eV} and stopping potential V_0 = 2\\text{ V}, the maximum kinetic energy is e V_0 = 2\\text{ eV}.\n"
    "Therefore, the photon energy is E = 2.14 + 2.00 = 4.14\\text{ eV}.\n"
    "The wavelength of the electromagnetic wave is related to photon energy by \\lambda = \\frac{h c}{E}.\n"
    "Using h c = 1242\\text{ eV}\\cdot\\text{nm}: \\lambda = \\frac{1242\\text{ eV}\\cdot\\text{nm}}{4.14\\text{ eV}} = 300\\text{ nm} → (D)"
  ),
  "30703": (
    "The angular position is \\theta(t) = 5t^2 - 8t.\n"
    "Differentiating with respect to time gives angular velocity: \\omega(t) = \\frac{d\\theta}{dt} = 10t - 8.\n"
    "At t = 2\\text{ s}, \\omega(2) = 10(2) - 8 = 12\\text{ rad/s}.\n"
    "Differentiating again gives the constant angular acceleration: \\alpha = \\frac{d\\omega}{dt} = 10\\text{ rad/s}^2.\n"
    "The moment of inertia of a uniform disk of mass M and radius R about its central perpendicular axis is I = \\frac{1}{2} M R^2.\n"
    "The torque applied is \\tau = I \\alpha = \\left(\\frac{1}{2} M R^2\\right) \\times 10 = 5 M R^2.\n"
    "The instantaneous power delivered by the torque is P = \\tau \\omega = (5 M R^2) \\times 12 = 60 M R^2 → (A)"
  ),
  "30704": (
    "Applying Bernoulli's principle for horizontal streamline flow of an incompressible fluid of density \\rho:\n"
    "P_1 + \\frac{1}{2} \\rho v_1^2 = P_2 + \\frac{1}{2} \\rho v_2^2.\n"
    "When the valve is closed, the fluid is at rest (v_1 = 0), so the gauge measures stagnation pressure P_1.\n"
    "When the valve is opened, water flows with speed v_2 = v at static pressure P_2: P_1 = P_2 + \\frac{1}{2} \\rho v^2.\n"
    "Rearranging for the flow speed: v = \\sqrt{\\frac{2(P_1 - P_2)}{\\rho}}.\n"
    "Therefore, the flow speed is proportional to \\sqrt{P_1 - P_2} → (A)"
  ),
  "30705": (
    "(A) Permeability of free space \\mu_0 has units \\text{N/A}^2 = \\text{kg}\\cdot\\text{m}\\cdot\\text{s}^{-2}\\text{A}^{-2}, dimension [\\text{M L T}^{-2} \\text{A}^{-2}] (III).\n"
    "(B) Magnetic field B from Lorentz force F = q v B has dimension \\frac{[\\text{M L T}^{-2}]}{[\\text{A T}][\\text{L T}^{-1}]} = [\\text{M T}^{-2} \\text{A}^{-1}] (II).\n"
    "(C) Magnetic dipole moment M = I A has dimension [\\text{A}][\\text{L}^2] = [\\text{L}^2 \\text{A}] (IV).\n"
    "(D) Torsional constant C = \\tau / \\theta has dimension of torque [\\text{M L}^2 \\text{T}^{-2}] (I).\n"
    "Matching these gives (A)-(III), (B)-(II), (C)-(IV), (D)-(I) → (D)"
  ),
  "30706": (
    "By Kepler's Third Law of planetary motion, the orbital period T and orbital radius R satisfy T^2 \\propto R^3.\n"
    "Let T_m and R_m be the period and orbital radius of the Moon, and T_s and R_s for the satellite.\n"
    "The satellite is 9 times closer to Earth than the Moon, so R_m = 9 R_s \\implies \\frac{R_m}{R_s} = 9.\n"
    "Taking the ratio of orbital periods: \\left(\\frac{T_m}{T_s}\\right)^2 = \\left(\\frac{R_m}{R_s}\\right)^3 = 9^3 = (3^2)^3 = 3^6 = 729.\n"
    "Taking square roots: \\frac{T_m}{T_s} = \\sqrt{729} = 27.\n"
    "Given T_m = 27\\text{ days}, we find T_s = \\frac{27\\text{ days}}{27} = 1\\text{ day} → (A)"
  ),
  "30707": (
    "The dipole consists of charges q = 4\\ \\mu\\text{C} = 4 \\times 10^{-6}\\text{ C} separated by 2a = 9 - (-9) = 18\\text{ cm} = 0.18\\text{ m}.\n"
    "The electric dipole moment is p = q(2a) = (4 \\times 10^{-6}\\text{ C}) \\times 0.18\\text{ m} = 7.2 \\times 10^{-7}\\text{ C}\\cdot\\text{m}.\n"
    "In a uniform electric field, the potential energy of a dipole is U(\\theta) = -p E \\cos \\theta.\n"
    "In the stable equilibrium orientation, \\theta_1 = 0^\\circ with U_1 = -p E.\n"
    "When rotated through 180°, the final orientation is \\theta_2 = 180^\\circ with U_2 = -p E \\cos 180^\\circ = +p E.\n"
    "The external work done to rotate the dipole is W = \\Delta U = U_2 - U_1 = 2 p E = 2 \\times (7.2 \\times 10^{-7}) \\times 10^4 = 14.4 \\times 10^{-3}\\text{ J} = 14.4\\text{ mJ} → (A)"
  ),
  "30708": (
    "Let G = 30\\ \\Omega be the galvanometer resistance and I_g = 20\\text{ mA} = 0.02\\text{ A} be full-scale current.\n"
    "To measure a total maximum current I = 3\\text{ A}, a shunt resistance S is connected in parallel with the galvanometer.\n"
    "The potential difference across the galvanometer equals that across the shunt: I_g G = (I - I_g) S.\n"
    "Substituting the given numerical values: (0.02) \\times 30 = (3 - 0.02) S \\implies 0.6 = 2.98 S.\n"
    "Solving for S: S = \\frac{0.6}{2.98} = \\frac{60}{298} = \\frac{30}{149}\\ \\Omega.\n"
    "Comparing with the form \\frac{30}{X}\\ \\Omega yields X = 149 → (C)"
  ),
  "30709": (
    "The field amplitude produced by a slit is directly proportional to its slit width, so A_1 \\propto d and A_2 \\propto xd.\n"
    "The maximum and minimum intensities in Young's interference pattern are I_{\\text{max}} = (A_1 + A_2)^2 and I_{\\text{min}} = (A_2 - A_1)^2.\n"
    "Given \\frac{I_{\\text{max}}}{I_{\\text{min}}} = \\frac{9}{4}, taking square roots gives \\frac{A_2 + A_1}{A_2 - A_1} = \\frac{3}{2}.\n"
    "Substituting the slit widths: \\frac{xd + d}{xd - d} = \\frac{x + 1}{x - 1} = \\frac{3}{2}.\n"
    "Cross-multiplying: 2(x + 1) = 3(x - 1) \\implies 2x + 2 = 3x - 3 \\implies x = 5 → (C)"
  ),
  "30710": (
    "Assertion (A) is true: The binding energy per nucleon curve is nearly flat at approximately 8.5 MeV/nucleon for intermediate nuclei with mass numbers 30 < A < 170.\n"
    "Reason (R) is false: The strong nuclear force is strictly short-range (acting over distances of ~ 1 to 2 fm) and exhibits saturation.\n"
    "Because each nucleon interacts only with its immediate nearest neighbors due to short-range saturation, the binding energy per nucleon remains constant over this intermediate mass range.\n"
    "Therefore, Assertion (A) is true but Reason (R) is false → (B)"
  ),
  "30711": (
    "The thermodynamic definition of entropy change for a reversible heating process is dS = \\frac{dQ_{\\text{rev}}}{T}.\n"
    "The heat required to raise the temperature of mass m of water with specific heat s by dT is dQ = m s dT.\n"
    "Integrating from initial temperature T_1 to final temperature T_2: \\Delta S = \\int_{T_1}^{T_2} \\frac{m s dT}{T} = m s \\ln\\left(\\frac{T_2}{T_1}\\right).\n"
    "Substituting the given specific heat of water s = 1\\text{ J}/(\\text{kg}\\cdot\\text{K}) gives \\Delta S = m \\ln(T_2 / T_1) → (D)"
  ),
  "30712": (
    "From the given circuit diagram, both p-n junction diodes are connected in the forward-bias direction with the positive terminal of the 5 V battery.\n"
    "Assuming ideal diodes, their forward resistances and threshold voltages are negligible, behaving as closed switches.\n"
    "The two identical 20 \\,\\Omega resistors are in parallel across the 5 V potential source.\n"
    "Their equivalent parallel resistance is R_{\\text{eq}} = \\frac{20 \\times 20}{20 + 20} = 10\\ \\Omega.\n"
    "The total current delivered by the 5 V battery is I = \\frac{V}{R_{\\text{eq}}} = \\frac{5\\text{ V}}{10\\ \\Omega} = 0.5\\text{ A} → (C)"
  ),
  "30713": (
    "In a plane electromagnetic wave propagating in free space, the relation between electric and magnetic field amplitudes is B = \\frac{E}{c}.\n"
    "Given E_y = 9.3\\text{ V/m} and speed of light c = 3 \\times 10^8\\text{ m/s}:\n"
    "B = \\frac{9.3}{3 \\times 10^8} = 3.1 \\times 10^{-8}\\text{ T}.\n"
    "The wave travels along the +x direction (\\hat{k} = \\hat{i}) and the electric field oscillates along the +y direction (\\hat{E} = \\hat{j}).\n"
    "Since the propagation vector satisfies \\hat{k} = \\hat{E} \\times \\hat{B}, we have \\hat{i} = \\hat{j} \\times \\hat{B} \\implies \\hat{B} = \\hat{k}.\n"
    "Thus, the magnetic field vector oscillates along the +z axis: B_z = 3.1 \\times 10^{-8}\\text{ T} → (D)"
  ),
  "30714": (
    "The total work done by the ideal gas along path ABCD is W = W_{AB} + W_{BC} + W_{CD}.\n"
    "Along isobaric path AB at constant pressure P_0, volume expands from 2V_0 to 3V_0: W_{AB} = P_0(3V_0 - 2V_0) = P_0 V_0.\n"
    "Along isochoric path BC at constant volume 3V_0, dV = 0 so no work is performed: W_{BC} = 0.\n"
    "Along isobaric path CD at constant pressure 2P_0, volume compresses from 3V_0 to V_0: W_{CD} = 2P_0(V_0 - 3V_0) = -4 P_0 V_0.\n"
    "Summing all path contributions: W = P_0 V_0 + 0 - 4 P_0 V_0 = -3 P_0 V_0 → (D)"
  ),
  "30715": (
    "The focal length of a spherical mirror depends solely on its geometric radius of curvature: f = \\frac{R}{2}.\n"
    "Reflection at the mirror surface is governed purely by the law of reflection (\\text{angle of incidence} = \\text{angle of reflection}), which is independent of the surrounding medium.\n"
    "Unlike a lens whose focal length depends on the refractive index of the surrounding liquid via the Lens Maker's formula, the focal length of a concave mirror remains unchanged.\n"
    "Therefore, its focal length in the liquid is still f → (D)"
  ),
  "30716": (
    "According to Hooke's law for an ideal linear spring, tension is directly proportional to elongation: T = k x.\n"
    "For the first elongation x_1: k x_1 = 5\\text{ N}.\n"
    "For the second elongation x_2: k x_2 = 7\\text{ N}.\n"
    "For the new elongation \\Delta x = 5x_1 - 2x_2, the tension developed in the spring is T = k \\Delta x = k(5x_1 - 2x_2).\n"
    "Distributing the spring constant k: T = 5(k x_1) - 2(k x_2) = 5(5\\text{ N}) - 2(7\\text{ N}) = 25 - 14 = 11\\text{ N} → (C)"
  ),
  "30717": (
    "The pressure inside a spherical air bubble of radius R at depth h in a liquid of surface tension T and density \\rho is P_{\\text{in}} = P_0 + \\rho g h + \\frac{2T}{R}.\n"
    "The difference between the inside pressure and atmospheric pressure is \\Delta P = P_{\\text{in}} - P_0 = \\rho g h + \\frac{2T}{R}.\n"
    "Hydrostatic pressure term: \\rho g h = (10^3\\text{ kg/m}^3) \\times (10\\text{ m/s}^2) \\times (0.20\\text{ m}) = 2000\\text{ N/m}^2.\n"
    "Excess pressure due to surface tension: \\frac{2T}{R} = \\frac{2 \\times 0.095\\text{ J/m}^2}{1.0 \\times 10^{-3}\\text{ m}} = 190\\text{ N/m}^2.\n"
    "Total excess pressure: \\Delta P = 2000 + 190 = 2190\\text{ N/m}^2 → (2190)"
  ),
  "30718": (
    "The satellite of mass m = \\frac{M}{2} orbits at height h = \\frac{R}{3}, so orbital radius is r = R + \\frac{R}{3} = \\frac{4R}{3}.\n"
    "The orbital speed of the satellite around Earth of mass M is v_0 = \\sqrt{\\frac{G M}{r}} = \\sqrt{\\frac{3 G M}{4R}}.\n"
    "The orbital angular momentum of the satellite is L = m v_0 r.\n"
    "Substituting m, v_0, and r: L = \\left(\\frac{M}{2}\\right) \\sqrt{\\frac{3GM}{4R}} \\left(\\frac{4R}{3}\\right) = \\frac{M}{2} \\sqrt{\\frac{3GM}{4R} \\times \\frac{16R^2}{9}} = \\frac{M}{2} \\sqrt{\\frac{4GMR}{3}} = M \\sqrt{\\frac{GMR}{3}}.\n"
    "Comparing with M \\sqrt{\\frac{GMR}{x}} gives x = 3 → (3)"
  ),
  "30719": (
    "In steady state, a capacitor acts as an open circuit (no steady DC current flows through the capacitor branch).\n"
    "The circuit current flows through the series resistors 10 \\,\\Omega and 15 \\,\\Omega: I = \\frac{V}{10 + 15} = \\frac{5\\text{ V}}{25\\,\\Omega} = 0.2\\text{ A}.\n"
    "The potential difference across the 10 \\,\\Omega resistor is V = I R = 0.2\\text{ A} \\times 10\\,\\Omega = 2\\text{ V}.\n"
    "Because the 8 \\,\\mu\\text{F} capacitor is in parallel with this resistor, the voltage across it is also 2 V.\n"
    "The steady-state charge on the capacitor is Q = C V = (8\\ \\mu\\text{F}) \\times 2\\text{ V} = 16\\ \\mu\\text{C} → (16)"
  ),
  "30720": (
    "The displacement current between the plates of a parallel plate capacitor is given by I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt} = C \\frac{dV}{dt}.\n"
    "We are given capacitance C = 2.5\\ \\mu\\text{F} = 2.5 \\times 10^{-6}\\text{ F} and displacement current I_d = 0.25\\text{ mA} = 0.25 \\times 10^{-3}\\text{ A}.\n"
    "Rearranging to solve for the rate of change of potential difference:\n"
    "\\frac{dV}{dt} = \\frac{I_d}{C} = \\frac{0.25 \\times 10^{-3}\\text{ A}}{2.5 \\times 10^{-6}\\text{ F}} = \\frac{0.25}{2.5} \\times 10^3 = 0.1 \\times 10^3 = 100\\text{ V/s} → (100)"
  ),
  "30721": (
    "In a series LCR circuit, maximum current occurs at electrical resonance when inductive reactance balances capacitive reactance (X_L = X_C).\n"
    "The resonant angular frequency is given by \\omega_0 = \\frac{1}{\\sqrt{L C}}.\n"
    "Given inductance L = 100\\text{ mH} = 0.1\\text{ H} and capacitance C = 25\\text{ nF} = 25 \\times 10^{-9}\\text{ F}.\n"
    "Evaluating the product L C = (0.1) \\times (25 \\times 10^{-9}) = 2.5 \\times 10^{-9} = 25 \\times 10^{-10}\\text{ s}^2.\n"
    "Taking square root: \\omega_0 = \\frac{1}{\\sqrt{25 \\times 10^{-10}}} = \\frac{1}{5 \\times 10^{-5}} = 0.2 \\times 10^5 = 2 \\times 10^4\\text{ rad/s}.\n"
    "Hence, the numerical coefficient is 2 → (2)"
  ),

  # ================= CHEMISTRY (30722 - 30746) =================
  "30722": (
    "Spontaneity is determined by the Gibbs free energy relation: \\Delta G = \\Delta H - T \\Delta S, where a process is spontaneous if \\Delta G < 0.\n"
    "Row (A): \\Delta H > 0 and \\Delta S < 0 makes \\Delta G = (+) - T(-) = (+) > 0 at all temperatures, so the reaction is non-spontaneous at any T (Correct).\n"
    "Row (B): \\Delta H > 0 and \\Delta S > 0 requires high temperature for T \\Delta S to outweigh \\Delta H, so it is spontaneous at high T, not low T (Incorrect).\n"
    "Row (C): \\Delta H < 0 and \\Delta S < 0 is spontaneous at low T where |\\Delta H| > T|\\Delta S| (Incorrect).\n"
    "Row (D): \\Delta H < 0 and \\Delta S > 0 gives \\Delta G = (-) - T(+) = (-) < 0 at all temperatures, so it is spontaneous at any T (Correct).\n"
    "Therefore, rows (A) and (D) only are correct → (B)"
  ),
  "30723": (
    "The standard Gibbs free energy change of an electrochemical cell is \\Delta G^\\circ = -n F E^\\circ_{\\text{cell}}.\n"
    "For the zinc-silver cell \\text{Zn}|\\text{Zn}^{2+}||\\text{Ag}^+|\\text{Ag}: E^\\circ_{\\text{cell}} = E^\\circ_{\\text{Ag}^+/\\text{Ag}} - E^\\circ_{\\text{Zn}^{2+}/\\text{Zn}} = 0.80 - (-0.76) = 1.56\\text{ V}.\n"
    "The overall balanced redox reaction \\text{Zn} + 2\\text{Ag}^+ \\to \\text{Zn}^{2+} + 2\\text{Ag} involves n = 2 electrons.\n"
    "Hence, \\Delta G^\\circ = -2 \\times F \\times 1.56 = -3.12 F\\text{ J}.\n"
    "Comparing with other possible cell combinations, this yields the most negative value of \\Delta G^\\circ → (A)"
  ),
  "30724": (
    "The primary structure of a protein refers strictly to the linear sequence of amino acids linked by peptide bonds.\n"
    "The regular local folding patterns of polypeptide backbones, such as the \\alpha-helix and \\beta-pleated sheets, constitute the secondary structure of proteins.\n"
    "These secondary conformations are maintained and stabilized by regular intramolecular or intermolecular hydrogen bonds between carbonyl oxygen and amide hydrogen atoms.\n"
    "Hence, the \\alpha-helix and \\beta-pleated sheets belong to the secondary structure → (C)"
  ),
  "30725": (
    "Statement I is true: Formaldehyde (\\text{HCHO}) lacks any bulky alkyl groups on the carbonyl carbon, minimizing steric crowding and making hydration both thermodynamically and kinetically favored with K \\approx 2280.\n"
    "Statement II is true: In trichloroacetaldehyde (chloral, \\text{Cl}_3\\text{C-CHO}), the strong electron-withdrawing inductive (-I) effect of the three chlorine atoms drastically enhances the electrophilicity of the carbonyl carbon, driving hydration to form stable chloral hydrate with K \\approx 2000.\n"
    "Therefore, both Statement I and Statement II are true → (B)"
  ),
  "30726": (
    "Consider the gaseous equilibrium: \\text{X}_2\\text{Y(g)} \\rightleftharpoons \\text{X}_2\\text{(g)} + \\frac{1}{2}\\text{Y}_2\\text{(g)}.\n"
    "Starting with 1 mole of \\text{X}_2\\text{Y}: at equilibrium, moles are 1 - x of \\text{X}_2\\text{Y}, x of \\text{X}_2, and \\frac{x}{2} of \\text{Y}_2.\n"
    "Total moles = 1 - x + x + \\frac{x}{2} = 1 + \\frac{x}{2} \\approx 1 since x \\ll 1.\n"
    "The partial pressures are P_{\\text{X}_2\\text{Y}} \\approx P, P_{\\text{X}_2} \\approx x P, and P_{\\text{Y}_2} \\approx \\frac{x}{2} P.\n"
    "The equilibrium constant is K_p = \\frac{P_{\\text{X}_2} (P_{\\text{Y}_2})^{1/2}}{P_{\\text{X}_2\\text{Y}}} = \\frac{(x P) \\left(\\frac{x P}{2}\\right)^{1/2}}{P} = \\frac{x^{3/2} P^{1/2}}{\\sqrt{2}}.\n"
    "Squaring both sides: K_p^2 = \\frac{x^3 P}{2} \\implies x^3 = \\frac{2 K_p^2}{P} \\implies x = \\sqrt[3]{\\frac{2K_p^2}{P}} → (B)"
  ),
  "30727": (
    "Black precipitate A is lead(II) sulfide (\\text{PbS}), formed in qualitative analysis of group II cations.\n"
    "When \\text{PbS} is dissolved in dilute boiling \\text{HNO}_3, it oxidizes to soluble lead nitrate: 3\\text{PbS} + 8\\text{HNO}_3 \\to 3\\text{Pb(NO}_3)_2 + 3\\text{S} + 2\\text{NO} + 4\\text{H}_2\\text{O}.\n"
    "Addition of dilute \\text{H}_2\\text{SO}_4 precipitates white lead sulfate B: \\text{Pb(NO}_3)_2 + \\text{H}_2\\text{SO}_4 \\to \\text{PbSO}_4 \\downarrow (\\text{white}) + 2\\text{HNO}_3.\n"
    "\\text{PbSO}_4 dissolves in ammonium acetate solution to form lead acetate, which reacts with potassium chromate to yield a bright yellow precipitate C of lead chromate (\\text{PbCrO}_4).\n"
    "Thus, A = \\text{PbS}, B = \\text{PbSO}_4, and C = \\text{PbCrO}_4 → (B)"
  ),
  "30728": (
    "Statement I is true: As the number of carbon atoms in alcohols and phenols increases, the size and molecular mass of the non-polar alkyl/aryl chain increases, leading to stronger van der Waals dispersion forces and higher boiling points.\n"
    "Statement II is true: Alcohols and phenols contain strongly polarized -OH groups capable of forming extensive intermolecular hydrogen bonding.\n"
    "Due to these strong hydrogen bonds, their boiling points are significantly higher than those of comparable non-hydrogen-bonding ethers and haloalkanes of similar molecular mass.\n"
    "Therefore, both Statement I and Statement II are true → (D)"
  ),
  "30729": (
    "According to Raoult's law for non-volatile solutes, the relative lowering of vapour pressure is \\frac{\\Delta P}{P^\\circ} = X_{\\text{solute}}.\n"
    "In the first case: \\Delta P = 10\\text{ mm Hg} with X_{\\text{solute}} = 0.2.\n"
    "Thus \\frac{10}{P^\\circ} = 0.2 \\implies P^\\circ = \\frac{10}{0.2} = 50\\text{ mm Hg}.\n"
    "In the second case, the vapour pressure decrease is \\Delta P = 20\\text{ mm Hg}.\n"
    "The new mole fraction of solute is X_{\\text{solute}}' = \\frac{\\Delta P}{P^\\circ} = \\frac{20}{50} = 0.4.\n"
    "Therefore, the mole fraction of the solvent is X_{\\text{solvent}} = 1 - X_{\\text{solute}}' = 1 - 0.4 = 0.6 → (A)"
  ),
  "30730": (
    "Statement I is true: For a principal quantum number n, the shell consists of subshells l = 0, 1, \\dots, (n - 1). The total number of orbitals is \\sum_{l=0}^{n-1} (2l + 1) = n^2.\n"
    "Statement II is true: For any azimuthal subshell l, the magnetic quantum number m_l designates spatial orientation of the orbital and takes (2l + 1) integer values from -l to +l including zero.\n"
    "Because both statements correctly describe fundamental quantum mechanical principles of atomic structure, both Statement I and Statement II are true → (C)"
  ),
  "30731": (
    "The solvolysis of alkyl/aryl halides in polar protic solvents follows an S_N1 mechanism, where the rate-determining step is carbocation formation: \\text{Rate} \\propto \\text{carbocation stability}.\n"
    "Compound (C) forms the diphenylmethyl cation (\\text{Ph}_2\\text{CH}^+), which is exceptionally stabilized by resonance with two benzene rings (most stable).\n"
    "Compound (B) forms a 1-phenylethyl cation (\\text{PhCH}^+\\text{CH}_3), which is benzylic and secondary.\n"
    "Compound (A) forms a tertiary alkyl carbocation (\\text{Me}_3\\text{C}^+), stabilized by hyperconjugation from 9 \\alpha-hydrogens.\n"
    "Compound (D) forms an ordinary secondary alkyl carbocation, which is the least stable among the group.\n"
    "Thus, the ascending order of solvolysis rates is (D) < (A) < (B) < (C) → (A)"
  ),
  "30732": (
    "Reductive ozonolysis (\\text{O}_3 / \\text{Me}_2\\text{S} or \\text{Zn-H}_2\\text{O}) oxidatively cleaves carbon-carbon double bonds into carbonyl groups (aldehydes/ketones).\n"
    "Cleaving the bicyclic diene structures produces polycarbonyl products matching their carbon connectivity:\n"
    "Substrate (A) gives the symmetrical dialdehyde derivative (III).\n"
    "Substrate (B) yields the substituted dicarbonyl fragment (IV).\n"
    "Substrate (C) produces the open-chain keto-aldehyde (I).\n"
    "Substrate (D) cleaves into the bicyclic dialdehyde (II).\n"
    "Hence, the correct matching is (A)-(III), (B)-(IV), (C)-(I), (D)-(II) → (B)"
  ),
  "30733": (
    "For a zero-order reaction A \\to \\text{products}, the rate of reaction is independent of reactant concentration: -\\frac{d[A]}{dt} = k.\n"
    "Integrating from t = 0 to time t gives the integrated rate law: [A]_t = [A]_0 - k t.\n"
    "A plot of reactant concentration [A]_t versus time t yields a straight line with y-intercept equal to [A]_0 and a constant negative slope equal to -k.\n"
    "This linear descending relationship corresponds to Graph 2 → (B)"
  ),
  "30734": (
    "(A) Bronze is an alloy of copper and tin (\\text{Cu} + \\text{Sn}) (IV).\n"
    "(B) Brass is an alloy of copper and zinc (\\text{Cu} + \\text{Zn}) (III).\n"
    "(C) UK silver coins are traditionally minted from cupronickel, an alloy of copper and nickel (\\text{Cu} + \\text{Ni}) (I).\n"
    "(D) Stainless Steel is an alloy composed of iron, chromium, nickel, and carbon (\\text{Fe}, \\text{Cr}, \\text{Ni}, \\text{C}) (II).\n"
    "Matching List I with List II yields (A)-(IV), (B)-(III), (C)-(I), (D)-(II) → (B)"
  ),
  "30735": (
    "Determining the oxidation states and d-electron counts of the transition metal centers:\n"
    "(A) In [\\text{FeO}_4]^{2-}, iron is in +6 state: \\text{Fe(VI)} is 3d^2.\n"
    "(B) In [\\text{Mn(CN)}_6]^{3-}, manganese is in +3 state: \\text{Mn(III)} is 3d^4.\n"
    "(C) In [\\text{Fe(CN)}_6]^{3-}, iron is in +3 state: \\text{Fe(III)} is 3d^5.\n"
    "(D) In chromium(II) acetate dimer \\text{Cr}_2(\\text{OAc})_4(\\text{H}_2\\text{O})_2, chromium is in +2 state: \\text{Cr(II)} is 3d^4.\n"
    "(E) In [\\text{NiF}_6]^{2-}, nickel is in +4 state: \\text{Ni(IV)} is 3d^6.\n"
    "Thus, only complexes (B) and (D) possess metal ions with a d^4 electron configuration → (C)"
  ),
  "30736": (
    "Group 14 consists of Carbon (Z = 6), Silicon (Z = 14), Germanium (Z = 32), Tin (Z = 50), and Lead (Z = 82).\n"
    "Carbon and Silicon form giant covalent network solids with extremely high melting points (Diamond ~ 3730°C, Si ~ 1410°C).\n"
    "Germanium also has a diamond cubic lattice with a high melting point (~ 937°C).\n"
    "Tin (Sn, Z = 50) possesses a metallic crystal structure with relatively weak metallic bonds, melting at only 232°C (505 K).\n"
    "Lead melts at 327°C, which is higher than tin.\n"
    "Therefore, Tin (atomic number 50) has the lowest melting point in Group 14 → (D)"
  ),
  "30737": (
    "Auto-ionization of water is an endothermic equilibrium process: \\text{H}_2\\text{O}(l) \\rightleftharpoons \\text{H}^+(aq) + \\text{OH}^-(aq), \\Delta H > 0.\n"
    "According to Le Chatelier's principle, increasing temperature from 25°C to 80°C shifts the equilibrium to the right.\n"
    "Consequently, the ionic product of water K_w increases, and the concentration of hydrogen ions [\\text{H}^+] increases above 10^{-7}\\text{ M}.\n"
    "Because pH is defined logarithmically as \\text{pH} = -\\log_{10}[\\text{H}^+], a higher [\\text{H}^+] results in a lower pH value.\n"
    "Therefore, the pH of pure water decreases upon heating to 80°C → (A)"
  ),
  "30738": (
    "In the first step, chlorobenzene undergoes Dow's process with aqueous \\text{NaOH} at high temperature (623 K) and pressure (300 atm) followed by acidification to produce Phenol [A].\n"
    "In the second step, oxidation of phenol with sodium dichromate in sulfuric acid (\\text{Na}_2\\text{Cr}_2\\text{O}_7 / \\text{H}_2\\text{SO}_4) oxidizes the aromatic ring to para-benzoquinone [B].\n"
    "Hence, product [A] is Phenol and product [B] is para-Benzoquinone → (C)"
  ),
  "30739": (
    "By Raoult's law and Dalton's law of partial pressures, the vapour phase mole fraction of component 1 is y_1 = \\frac{P_1}{P_{\\text{total}}} = \\frac{P_1^\\circ x_1}{P_1^\\circ x_1 + P_2^\\circ x_2}.\n"
    "Using x_2 = 1 - x_1, the total pressure is P_{\\text{total}} = P_2^\\circ + x_1(P_1^\\circ - P_2^\\circ).\n"
    "Taking the reciprocal: \\frac{1}{y_1} = \\frac{P_2^\\circ + x_1(P_1^\\circ - P_2^\\circ)}{P_1^\\circ x_1} = \\frac{P_2^\\circ}{P_1^\\circ} \\left(\\frac{1}{x_1}\\right) + \\frac{P_1^\\circ - P_2^\\circ}{P_1^\\circ}.\n"
    "Comparing with the linear equation Y = m X + c: the slope is \\frac{P_2^\\circ}{P_1^\\circ} and the intercept is \\frac{P_1^\\circ - P_2^\\circ}{P_1^\\circ} → (A)"
  ),
  "30740": (
    "Moseley's law relates the frequency \\nu of characteristic X-rays emitted by an element to its atomic number Z by the relation: \\sqrt{\\nu} = a(Z - b), where a and b are constants.\n"
    "Statement I asserts that a plot of \\sqrt{\\nu} against atomic mass is linear, which is false because the linear relationship holds specifically with atomic number Z, not atomic mass.\n"
    "Statement II asserts that a plot of \\nu against atomic number is a straight line, which is false because \\sqrt{\\nu} (not \\nu) is linearly proportional to Z.\n"
    "Therefore, both Statement I and Statement II are false → (C)"
  ),
  "30741": (
    "In alkaline medium, orange potassium dichromate converts to yellow potassium chromate:\n"
    "\\text{K}_2\\text{Cr}_2\\text{O}_7 + 2\\text{KOH} \\to 2\\text{K}_2\\text{CrO}_4\\text{ [A]} + \\text{H}_2\\text{O}.\n"
    "In acidic medium, potassium chromate is protonated and dimerizes back to potassium dichromate:\n"
    "2\\text{K}_2\\text{CrO}_4 + \\text{H}_2\\text{SO}_4 \\to \\text{K}_2\\text{Cr}_2\\text{O}_7\\text{ [B]} + \\text{K}_2\\text{SO}_4 + \\text{H}_2\\text{O}.\n"
    "Thus, [A] is \\text{K}_2\\text{CrO}_4 and [B] is \\text{K}_2\\text{Cr}_2\\text{O}_7 → (C)"
  ),
  "30742": (
    "Combustion of 0.01 mole of organic compound (X) yields 0.9 g of \\text{H}_2\\text{O}.\n"
    "Moles of \\text{H}_2\\text{O} produced = \\frac{0.9\\text{ g}}{18\\text{ g/mol}} = 0.05\\text{ mol}.\n"
    "Each mole of \\text{H}_2\\text{O} contains 2 moles of H atoms, so moles of H in 0.01 mole of X = 2 \\times 0.05 = 0.1\\text{ mol}.\n"
    "Mass of hydrogen in 0.01 mole of X = 0.1\\text{ mol} \\times 1\\text{ g/mol} = 0.1\\text{ g}.\n"
    "In 1 mole of X, the mass of hydrogen present is \\frac{0.1\\text{ g}}{0.01} = 10\\text{ g}.\n"
    "Given that hydrogen constitutes 10% by mass of compound X:\n"
    "\\frac{10\\text{ g}}{M} \\times 100 = 10 \\implies M = 100\\text{ g/mol} → (100)"
  ),
  "30743": (
    "The given reaction sequence transforms 4-ethoxyaniline through diazotization and coupling to yield the symmetrical azo dye 1,2-bis(4-ethoxyphenyl)diazene as major product C.\n"
    "The molecular structure of product C is \\text{CH}_3\\text{CH}_2\\text{O-C}_6\\text{H}_4-\\text{N=N-C}_6\\text{H}_4-\\text{OCH}_2\\text{CH}_3.\n"
    "The aromatic ring carbons and azo nitrogens are all sp^2 hybridized.\n"
    "The sp^3 hybridized carbon atoms reside exclusively in the two aliphatic ethoxy substituents (-O-\\text{CH}_2-\\text{CH}_3).\n"
    "Each ethoxy group contributes 2 sp^3 hybridized carbon atoms (-\\text{CH}_2- and -\\text{CH}_3).\n"
    "With two ethoxy groups present, total sp^3 carbons = 2 \\times 2 = 4 → (4)"
  ),
  "30744": (
    "The balanced chemical equation for the oxidation of aluminium is:\n"
    "4\\text{Al} + 3\\text{O}_2 \\to 2\\text{Al}_2\\text{O}_3.\n"
    "Moles of aluminium taken = \\frac{81.0\\text{ g}}{27.0\\text{ g/mol}} = 3.0\\text{ mol}.\n"
    "Moles of oxygen gas taken = \\frac{128.0\\text{ g}}{32.0\\text{ g/mol}} = 4.0\\text{ mol}.\n"
    "From stoichiometry, 3.0 moles of Al requires \\frac{3}{4} \\times 3.0 = 2.25\\text{ mol of O}_2, which is less than 4.0 mol available, so Al is the limiting reagent.\n"
    "Moles of \\text{Al}_2\\text{O}_3 produced = \\frac{2}{4} \\times 3.0 = 1.5\\text{ mol}.\n"
    "Molar mass of \\text{Al}_2\\text{O}_3 = 2(27.0) + 3(16.0) = 54.0 + 48.0 = 102.0\\text{ g/mol}.\n"
    "Mass of \\text{Al}_2\\text{O}_3 formed = 1.5\\text{ mol} \\times 102.0\\text{ g/mol} = 153\\text{ g} → (153)"
  ),
  "30745": (
    "By the Born-Haber cycle, the standard enthalpy of formation of ionic crystal \\text{MX(s)} is given by:\n"
    "\\Delta H_f^\\circ = \\Delta H_{\\text{sub}}^\\circ + \\Delta H_i^\\circ + \\frac{1}{2} \\Delta H_{\\text{bond}}^\\circ + \\Delta H_{\\text{eg}}^\\circ - \\Delta H_{\\text{lattice}}^\\circ.\n"
    "Substituting the given numerical values:\n"
    "-400 = 100 + 500 + \\frac{1}{2} \\Delta H_{\\text{bond}}^\\circ + (-300) - 800.\n"
    "Summing the known terms on the right-hand side: 100 + 500 - 300 - 800 = -500\\text{ kJ/mol}.\n"
    "This gives -400 = -500 + \\frac{1}{2} \\Delta H_{\\text{bond}}^\\circ \\implies \\frac{1}{2} \\Delta H_{\\text{bond}}^\\circ = 100\\text{ kJ/mol}.\n"
    "Therefore, the bond dissociation enthalpy is \\Delta H_{\\text{bond}}^\\circ = 2 \\times 100 = 200\\text{ kJ/mol} → (200)"
  ),
  "30746": (
    "Compound X absorbs 2 moles of hydrogen, confirming it contains 2 carbon-carbon double bonds (a diene).\n"
    "Oxidative cleavage of X with hot acidic \\text{KMnO}_4 yields acetone (\\text{CH}_3\\text{COCH}_3), acetic acid (\\text{CH}_3\\text{COOH}), and levulinic acid (\\text{CH}_3\\text{COCH}_2\\text{CH}_2\\text{COOH}).\n"
    "Reconstructing the fragments establishes X as 2,7-dimethylocta-2,5-diene with molecular formula \\text{C}_{10}\\text{H}_{18}.\n"
    "In an open-chain hydrocarbon with 10 carbon atoms, there are 9 carbon-carbon \\sigma bonds.\n"
    "There are 18 carbon-hydrogen single (\\sigma) bonds.\n"
    "Total number of \\sigma bonds in X = 9 (\\text{C-C}) + 18 (\\text{C-H}) = 27 → (27)"
  ),

  # ================= MATHEMATICS (30747 - 30771) =================
  "30747": (
    "Using the binomial expansion for both factors:\n"
    "(1 + x)^p = 1 + px + \\frac{p(p - 1)}{2}x^2 + \\dots\n"
    "(1 - x)^q = 1 - qx + \\frac{q(q - 1)}{2}x^2 - \\dots\n"
    "Multiplying the expansions gives the coefficient of x: p - q = 1.\n"
    "The coefficient of x^2 is \\frac{p(p - 1)}{2} + \\frac{q(q - 1)}{2} - pq = \\frac{p^2 - p + q^2 - q - 2pq}{2} = \\frac{(p - q)^2 - (p + q)}{2}.\n"
    "Given this coefficient equals -2: \\frac{(p - q)^2 - (p + q)}{2} = -2 \\implies (p - q)^2 - (p + q) = -4.\n"
    "Substituting p - q = 1: 1^2 - (p + q) = -4 \\implies p + q = 5.\n"
    "Solving the linear system p - q = 1 and p + q = 5 yields p = 3 and q = 2.\n"
    "Therefore, p^2 + q^2 = 3^2 + 2^2 = 9 + 4 = 13 → (C)"
  ),
  "30748": (
    "Set A consists of points satisfying |x + y| \\ge 3, and set B satisfies |x| + |y| \\le 3.\n"
    "Set C contains points in A \\cap B that lie on either the x-axis (y = 0) or y-axis (x = 0).\n"
    "Case 1: Points on the x-axis (y = 0):\n"
    "From set B: |x| \\le 3. From set A: |x| \\ge 3. Thus |x| = 3, giving points (3, 0) and (-3, 0).\n"
    "Case 2: Points on the y-axis (x = 0):\n"
    "From set B: |y| \\le 3. From set A: |y| \\ge 3. Thus |y| = 3, giving points (0, 3) and (0, -3).\n"
    "Thus, C = \\left\\{ (3, 0), (-3, 0), (0, 3), (0, -3) \\right\\}.\n"
    "Evaluating the sum: \\sum_{(x,y)\\in C} |x + y| = |3 + 0| + |-3 + 0| + |0 + 3| + |0 - 3| = 3 + 3 + 3 + 3 = 12 → (D)"
  ),
  "30749": (
    "The system of linear equations is x + y + z = 6, x + 2y + 5z = 9, and x + 5y + \\lambda z = \\mu.\n"
    "The determinant of the coefficient matrix is \\Delta = \\det [[1, 1, 1], [1, 2, 5], [1, 5, \\lambda]].\n"
    "Applying row operations R_2 \\to R_2 - R_1 and R_3 \\to R_3 - R_1 gives \\Delta = \\det [[1, 1, 1], [0, 1, 4], [0, 4, \\lambda - 1]] = (\\lambda - 1) - 16 = \\lambda - 17.\n"
    "For the system to have no solution, we must have \\Delta = 0 \\implies \\lambda = 17.\n"
    "To ensure inconsistency, \\Delta_z must be non-zero:\n"
    "\\Delta_z = \\det [[1, 1, 6], [1, 2, 9], [1, 5, \\mu]] = \\det [[1, 1, 6], [0, 1, 3], [0, 4, \\mu - 6]] = (\\mu - 6) - 12 = \\mu - 18 \\ne 0.\n"
    "Thus, the system has no solution if \\lambda = 17 and \\mu \\ne 18 → (A)"
  ),
  "30750": (
    "Using integration by parts repeatedly for \\int x^3 \\sin x\\, dx:\n"
    "g(x) = -x^3 \\cos x + 3x^2 \\sin x + 6x \\cos x - 6\\sin x.\n"
    "Evaluating g(x) at x = \\pi/2:\n"
    "Since \\cos(\\pi/2) = 0 and \\sin(\\pi/2) = 1, g(\\pi/2) = 3(\\pi/2)^2(1) - 6(1) = \\frac{3\\pi^2}{4} - 6.\n"
    "By the Fundamental Theorem of Calculus, g'(x) = x^3 \\sin x, so g'(\\pi/2) = (\\pi/2)^3 \\sin(\\pi/2) = \\frac{\\pi^3}{8}.\n"
    "Now computing: 8[g(\\pi/2) + g'(\\pi/2)] = 8\\left(\\frac{3\\pi^2}{4} - 6 + \\frac{\\pi^3}{8}\\right) = \\pi^3 + 6\\pi^2 - 48.\n"
    "Comparing with \\alpha \\pi^3 + \\beta \\pi^2 + \\gamma gives \\alpha = 1, \\beta = 6, and \\gamma = -48.\n"
    "Therefore, \\alpha + \\beta - \\gamma = 1 + 6 - (-48) = 7 + 48 = 55 → (A)"
  ),
  "30751": (
    "Let end A lie on x - y + 2 = 0, so A has coordinates (a, a + 2).\n"
    "Let end B lie on y + 2 = 0, so B has coordinates (b, -2).\n"
    "Point P(h, k) divides rod AB internally in ratio 2 : 1 (AP : PB = 2 : 1):\n"
    "h = \\frac{2b + a}{3} \\implies a + 2b = 3h, and k = \\frac{2(-2) + 1(a + 2)}{3} = \\frac{a - 2}{3} \\implies a = 3k + 2.\n"
    "Substituting a into the first relation: 3k + 2 + 2b = 3h \\implies 2b = 3h - 3k - 2 \\implies b = \\frac{3h - 3k - 2}{2}.\n"
    "The length of the rod is 8, so AB^2 = (a - b)^2 + (a + 2 - (-2))^2 = 64.\n"
    "Substituting a and b in terms of h, k and simplifying the locus gives 9(x^2 + 13y^2 - 6xy - 4x + 28y) - 76 = 0.\n"
    "Comparing coefficients: \\alpha = 13, \\beta = -6, and \\gamma = -4.\n"
    "Hence, \\alpha - \\beta - \\gamma = 13 - (-6) - (-4) = 13 + 6 + 4 = 23 → (B)"
  ),
  "30752": (
    "A line through point P(1, 4, 0) parallel to the direction (1, 2, 3) has parametric equations:\n"
    "x = 1 + t, y = 4 + 2t, z = 3t.\n"
    "The given line is \\frac{x - 2}{2} = \\frac{y - 6}{3} = \\frac{z - 3}{4} = s, giving points (2s + 2, 3s + 6, 4s + 3).\n"
    "Equating coordinates to find the point of intersection Q:\n"
    "1 + t = 2s + 2, 4 + 2t = 3s + 6, and 3t = 4s + 3.\n"
    "From the first equation: t = 2s + 1. Substituting into the third: 3(2s + 1) = 4s + 3 \\implies 6s + 3 = 4s + 3 \\implies s = 0.\n"
    "With s = 0, the intersection point on the line is Q(2, 6, 3) (corresponding to t = 1).\n"
    "The required distance is the length PQ = \\sqrt{(2 - 1)^2 + (6 - 4)^2 + (3 - 0)^2} = \\sqrt{1 + 4 + 9} = \\sqrt{14} → (B)"
  ),
  "30753": (
    "Point A divides segment joining P(-1, -1, 2) and Q(5, 5, 10) in ratio r : 1.\n"
    "Position vector of A is \\vec{OA} = \\frac{r \\vec{OQ} + \\vec{OP}}{r + 1}.\n"
    "Evaluating \\vec{OQ} \\cdot \\vec{OA} = \\frac{r |\\vec{OQ}|^2 + \\vec{OQ} \\cdot \\vec{OP}}{r + 1}.\n"
    "Here |\\vec{OQ}|^2 = 25 + 25 + 100 = 150, and \\vec{OQ} \\cdot \\vec{OP} = -5 - 5 + 20 = 10.\n"
    "So \\vec{OQ} \\cdot \\vec{OA} = \\frac{150r + 10}{r + 1} = \\frac{10(15r + 1)}{r + 1}.\n"
    "For the cross product: \\vec{OP} \\times \\vec{OA} = \\frac{r}{r + 1}(\\vec{OP} \\times \\vec{OQ}).\n"
    "Calculating \\vec{OP} \\times \\vec{OQ} = (-20, 20, 0), so |\\vec{OP} \\times \\vec{OQ}|^2 = 400 + 400 = 800.\n"
    "Thus \\frac{1}{5}|\\vec{OP} \\times \\vec{OA}|^2 = \\frac{1}{5} \\frac{800r^2}{(r + 1)^2} = \\frac{160r^2}{(r + 1)^2}.\n"
    "Setting up the equation: \\frac{10(15r + 1)}{r + 1} - \\frac{160r^2}{(r + 1)^2} = 10 \\implies (15r + 1)(r + 1) - 16r^2 = (r + 1)^2.\n"
    "Simplifying: 15r^2 + 16r + 1 - 16r^2 = r^2 + 2r + 1 \\implies 2r^2 - 14r = 0.\n"
    "Since r > 0, we find 2r(r - 7) = 0 \\implies r = 7 → (D)"
  ),
  "30754": (
    "The area of the region is given by the definite integral A = \\int_{-1}^1 (a + e^{|x|} - e^{-x}) dx.\n"
    "Splitting into three integrals:\n"
    "\\int_{-1}^1 a\\, dx = 2a.\n"
    "Because e^{|x|} is an even function: \\int_{-1}^1 e^{|x|} dx = 2\\int_0^1 e^x dx = 2(e - 1).\n"
    "For the exponential term: \\int_{-1}^1 e^{-x} dx = [-e^{-x}]_{-1}^1 = -(e^{-1} - e) = e - \\frac{1}{e}.\n"
    "Combining terms: A = 2a + 2e - 2 - e + \\frac{1}{e} = 2a + e - 2 + \\frac{1}{e} = 2a + \\frac{e^2 - 2e + 1}{e}.\n"
    "Given that A = \\frac{e^2 + 8e + 1}{e} = \\frac{e^2 - 2e + 1}{e} + \\frac{10e}{e} = \\frac{e^2 - 2e + 1}{e} + 10.\n"
    "Equating both expressions gives 2a = 10 \\implies a = 5 → (D)"
  ),
  "30755": (
    "Let r be the radius of the inner chocolate core and R be the outer radius including the ice-cream layer.\n"
    "Given the thickness of ice cream is R - r = 1\\text{ cm}.\n"
    "The total volume of the sphere is V = \\frac{4}{3} \\pi R^3.\n"
    "Differentiating with respect to time: \\frac{dV}{dt} = 4\\pi R^2 \\frac{dR}{dt}.\n"
    "We are given the melting rate \\frac{dV}{dt} = 81\\text{ cm}^3\\text{/min} and rate of decrease of thickness \\frac{dR}{dt} = \\frac{1}{4\\pi}\\text{ cm/min}.\n"
    "Substituting: 81 = 4\\pi R^2 \\left(\\frac{1}{4\\pi}\\right) = R^2 \\implies R = \\sqrt{81} = 9\\text{ cm}.\n"
    "The radius of the inner chocolate ball is r = R - 1 = 9 - 1 = 8\\text{ cm}.\n"
    "The surface area of the chocolate ball alone is S = 4\\pi r^2 = 4\\pi(8^2) = 4\\pi(64) = 256\\pi\\text{ cm}^2 → (D)"
  ),
  "30756": (
    "A 4 \\times 4 grid contains 16 individual squares.\n"
    "The total number of ways to choose any 2 distinct squares is \\binom{16}{2} = \\frac{16 \\times 15}{2} = 120.\n"
    "Two squares share a common side if they are horizontally or vertically adjacent:\n"
    "In each of the 4 rows, there are 3 horizontally adjacent pairs: 4 \\times 3 = 12 pairs.\n"
    "In each of the 4 columns, there are 3 vertically adjacent pairs: 4 \\times 3 = 12 pairs.\n"
    "Total number of pairs of squares sharing a common side = 12 + 12 = 24.\n"
    "The probability that two chosen squares share a common side is \\frac{24}{120} = \\frac{1}{5}.\n"
    "Therefore, the probability that they have no side in common is 1 - \\frac{1}{5} = \\frac{4}{5} → (A)"
  ),
  "30757": (
    "Rewrite the differential equation: y = x \\sin(x/y) - y \\frac{dx}{dy} \\sin(x/y) \\implies y + y \\frac{dx}{dy} \\sin(x/y) = x \\sin(x/y).\n"
    "Rearranging: y = \\sin(x/y) \\left(x - y \\frac{dx}{dy}\\right) = -y^2 \\sin(x/y) \\frac{d}{dy}\\left(\\frac{x}{y}\\right).\n"
    "Dividing by y^2: \\frac{1}{y} = -\\sin(x/y) \\frac{d}{dy}\\left(\\frac{x}{y}\\right) = \\frac{d}{dy}\\left[\\cos(x/y)\\right].\n"
    "Integrating both sides with respect to y: \\log_e y = \\cos(x/y) + C.\n"
    "Given initial condition x(1) = \\frac{\\pi}{2}: \\log_e 1 = \\cos(\\pi/2) + C \\implies 0 = 0 + C \\implies C = 0.\n"
    "The particular solution is \\cos(x/y) = \\log_e y.\n"
    "For y = 2: \\cos\\left(\\frac{x(2)}{2}\\right) = \\log_e 2.\n"
    "Using the double-angle identity: \\cos(x(2)) = 2\\cos^2\\left(\\frac{x(2)}{2}\\right) - 1 = 2(\\log_e 2)^2 - 1 → (B)"
  ),
  "30758": (
    "Recall the standard trigonometric identity: 4\\cos x \\cos\\left(\\frac{\\pi}{3} - x\\right)\\cos\\left(\\frac{\\pi}{3} + x\\right) = \\cos 3x.\n"
    "Substituting into f(x):\n"
    "f(x) = 6 + 4 \\left[4\\cos x \\cos\\left(\\frac{\\pi}{3} - x\\right)\\cos\\left(\\frac{\\pi}{3} + x\\right)\\right] \\sin 3x \\cos 6x = 6 + 4 \\cos 3x \\sin 3x \\cos 6x.\n"
    "Using 2\\sin 3x \\cos 3x = \\sin 6x: f(x) = 6 + 2\\sin 6x \\cos 6x = 6 + \\sin 12x.\n"
    "Since -1 \\le \\sin 12x \\le 1 for all x \\in \\mathbb{R}, the range of f(x) is [6 - 1, 6 + 1] = [5, 7].\n"
    "Thus \\alpha = 5 and \\beta = 7, giving the point (\\alpha, \\beta) = (5, 7).\n"
    "The perpendicular distance from (5, 7) to line 3x + 4y + 12 = 0 is d = \\frac{|3(5) + 4(7) + 12|}{\\sqrt{3^2 + 4^2}} = \\frac{|15 + 28 + 12|}{5} = \\frac{55}{5} = 11 → (A)"
  ),
  "30759": (
    "The equation of a normal to the parabola y^2 = 4x at point (t^2, 2t) is y + tx = 2t + t^3.\n"
    "If the normal passes through the point (a, 0) on the axis: 0 + ta = 2t + t^3 \\implies t(t^2 + 2 - a) = 0.\n"
    "For non-trivial normals from a point with distance 4, t^2 = a - 2 \\implies a = t^2 + 2.\n"
    "The distance from (a, 0) to point P(t^2, 2t) is d^2 = (t^2 - a)^2 + (2t)^2 = (-2)^2 + 4t^2 = 4 + 4t^2.\n"
    "Given d = 4 \\implies d^2 = 16: 4 + 4t^2 = 16 \\implies 4t^2 = 12 \\implies t^2 = 3.\n"
    "Therefore, a = 3 + 2 = 5, so the point is (5, 0).\n"
    "The focus of y^2 = 4x is (1, 0).\n"
    "A circle having its center on the axis of the parabola (y = 0) and passing through (1, 0) and (5, 0) has these two points as ends of a diameter.\n"
    "Its equation is (x - 1)(x - 5) + y^2 = 0 \\implies x^2 + y^2 - 6x + 5 = 0 → (A)"
  ),
  "30760": (
    "The relation R on X = \\mathbb{R} \\times \\mathbb{R} is defined by (a_1, b_1) R (a_2, b_2) \\iff b_1 = b_2.\n"
    "1. Reflexivity: For any (a, b) \\in X, b = b, so (a, b) R (a, b) holds.\n"
    "2. Symmetry: If (a_1, b_1) R (a_2, b_2), then b_1 = b_2 \\implies b_2 = b_1, so (a_2, b_2) R (a_1, b_1) holds.\n"
    "3. Transitivity: If b_1 = b_2 and b_2 = b_3, then b_1 = b_3, so transitivity holds.\n"
    "Hence, R is an equivalence relation, making Statement I true.\n"
    "For Statement II: The equivalence class of (a, b) is S = \\left\\{ (x, y) \\in X : y = b \\right\\}.\n"
    "This represents a horizontal line y = b, which is parallel to the x-axis, not parallel to y = x (slope is 0, while y = x has slope 1).\n"
    "Thus Statement II is false, meaning Statement I is true but Statement II is false → (B)"
  ),
  "30761": (
    "The equation of the chord of the ellipse \\frac{x^2}{4} + \\frac{y^2}{2} = 1 with mid-point (x_1, y_1) = \\left(1, \\frac{1}{2}\\right) is given by T = S_1.\n"
    "Here T = \\frac{x(1)}{4} + \\frac{y(1/2)}{2} = \\frac{x}{4} + \\frac{y}{4} = \\frac{x + y}{4}.\n"
    "And S_1 = \\frac{1^2}{4} + \\frac{(1/2)^2}{2} = \\frac{1}{4} + \\frac{1}{8} = \\frac{3}{8}.\n"
    "Equating T = S_1: \\frac{x + y}{4} = \\frac{3}{8} \\implies x + y = \\frac{3}{2} \\implies y = \\frac{3}{2} - x.\n"
    "Substituting into the ellipse equation x^2 + 2y^2 = 4:\n"
    "x^2 + 2\\left(\\frac{3}{2} - x\\right)^2 = 4 \\implies x^2 + 2\\left(\\frac{9}{4} - 3x + x^2\\right) = 4 \\implies 3x^2 - 6x + \\frac{1}{2} = 0 \\implies 6x^2 - 12x + 1 = 0.\n"
    "The difference of roots is |x_2 - x_1| = \\frac{\\sqrt{144 - 24}}{6} = \\frac{\\sqrt{120}}{6} = \\sqrt{\\frac{10}{3}}.\n"
    "Since the chord has slope m = -1, its length is L = \\sqrt{1 + m^2} |x_2 - x_1| = \\sqrt{2} \\times \\sqrt{\\frac{10}{3}} = \\sqrt{\\frac{20}{3}} = \\frac{2\\sqrt{15}}{3} → (A)"
  ),
  "30762": (
    "Let A = [[a_{11}, a_{12}, a_{13}], [a_{21}, a_{22}, a_{23}], [a_{31}, a_{32}, a_{33}]].\n"
    "The condition A [0, 1, 0]^T = [0, 0, 1]^T gives the second column of A: a_{12} = 0, a_{22} = 0, and a_{32} = 1.\n"
    "The condition A [4, 1, 3]^T = [0, 1, 0]^T for the second row gives:\n"
    "4a_{21} + 1a_{22} + 3a_{23} = 1.\n"
    "Since a_{22} = 0, this simplifies to 4a_{21} + 3a_{23} = 1.\n"
    "The condition A [2, 1, 2]^T = [1, 0, 0]^T for the second row gives:\n"
    "2a_{21} + 1a_{22} + 2a_{23} = 0 \\implies 2a_{21} + 2a_{23} = 0 \\implies a_{21} = -a_{23}.\n"
    "Substituting a_{21} = -a_{23} into 4a_{21} + 3a_{23} = 1:\n"
    "4(-a_{23}) + 3a_{23} = 1 \\implies -a_{23} = 1 \\implies a_{23} = -1 → (A)"
  ),
  "30763": (
    "Since |z| = 1, let z = e^{i\\theta} with \\theta \\in [0, 2\\pi).\n"
    "Then \\bar{z} = e^{-i\\theta}, so \\frac{z}{\\bar{z}} = e^{2i\\theta} and \\frac{\\bar{z}}{z} = e^{-2i\\theta}.\n"
    "The expression inside the modulus is \\frac{z}{\\bar{z}} + \\frac{\\bar{z}}{z} = e^{2i\\theta} + e^{-2i\\theta} = 2\\cos(2\\theta).\n"
    "The given condition becomes |2\\cos(2\\theta)| = 1 \\implies |\\cos(2\\theta)| = \\frac{1}{2}.\n"
    "This yields two cases: \\cos(2\\theta) = \\frac{1}{2} or \\cos(2\\theta) = -\\frac{1}{2}.\n"
    "As \\theta spans [0, 2\\pi), the angle 2\\theta spans [0, 4\\pi) (two complete revolutions).\n"
    "In each revolution of 2\\pi, \\cos(2\\theta) = \\frac{1}{2} has 2 solutions and \\cos(2\\theta) = -\\frac{1}{2} has 2 solutions (4 per cycle).\n"
    "Over two full cycles [0, 4\\pi), the total number of distinct solutions is 4 \\times 2 = 8 → (D)"
  ),
  "30764": (
    "Line 1 passes through \\vec{a}_1 = (2, 1, -3) with direction \\vec{b}_1 = (1, 2, -3).\n"
    "Line 2 passes through \\vec{a}_2 = (-1, -3, -5) with direction \\vec{b}_2 = (2, 4, -5).\n"
    "The connecting vector between the points is \\vec{a}_2 - \\vec{a}_1 = (-3, -4, -2).\n"
    "The cross product of the direction vectors is \\vec{b}_1 \\times \\vec{b}_2 = (2(-5) - (-3)(4))\\hat{i} - (1(-5) - (-3)(2))\\hat{j} + (1(4) - 2(2))\\hat{k} = 2\\hat{i} - \\hat{j} + 0\\hat{k}.\n"
    "The magnitude of the cross product is |\\vec{b}_1 \\times \\vec{b}_2| = \\sqrt{2^2 + (-1)^2 + 0} = \\sqrt{5}.\n"
    "The scalar triple product is (\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2) = (-3)(2) + (-4)(-1) + (-2)(0) = -6 + 4 = -2.\n"
    "The shortest distance is d = \\frac{|-2|}{\\sqrt{5}} = \\frac{2}{\\sqrt{5}}.\n"
    "The square of shortest distance is d^2 = \\frac{4}{5} = \\frac{m}{n}.\n"
    "Since 4 and 5 are coprime, m = 4 and n = 5, giving m + n = 4 + 5 = 9 → (B)"
  ),
  "30765": (
    "Let J = \\int_0^{\\pi/2} \\frac{x \\sin x \\cos x}{\\sin^4 x + \\cos^4 x}\\, dx.\n"
    "Using King's property \\int_0^a f(x) dx = \\int_0^a f(a - x) dx with a = \\pi/2:\n"
    "J = \\int_0^{\\pi/2} \\frac{(\\frac{\\pi}{2} - x) \\cos x \\sin x}{\\cos^4 x + \\sin^4 x}\\, dx.\n"
    "Adding both integrals eliminates the variable x:\n"
    "2J = \\frac{\\pi}{2} \\int_0^{\\pi/2} \\frac{\\sin x \\cos x}{\\sin^4 x + \\cos^4 x}\\, dx.\n"
    "Dividing numerator and denominator by \\cos^4 x gives 2J = \\frac{\\pi}{2} \\int_0^{\\pi/2} \\frac{\\tan x \\sec^2 x}{\\tan^4 x + 1}\\, dx.\n"
    "Substitute u = \\tan^2 x, so du = 2\\tan x \\sec^2 x\\, dx. The limits become u = 0 to u = \\infty:\n"
    "2J = \\frac{\\pi}{2} \\int_0^\\infty \\frac{du/2}{u^2 + 1} = \\frac{\\pi}{4} [\\tan^{-1} u]_0^\\infty = \\frac{\\pi}{4} \\times \\frac{\\pi}{2} = \\frac{\\pi^2}{8}.\n"
    "Therefore, J = \\frac{\\pi^2}{16} → (A)"
  ),
  "30766": (
    "The given limit as x \\to \\infty is L = \\lim_{x \\to \\infty} \\frac{2x^2 - 3x + 5}{3x^2 + 5x + 4} \\times \\frac{(3x - 1)^{x/2}}{(3x + 2)^{x/2}}.\n"
    "The algebraic rational function factor evaluates directly by leading coefficients:\n"
    "\\lim_{x \\to \\infty} \\frac{2x^2 - 3x + 5}{3x^2 + 5x + 4} = \\frac{2}{3}.\n"
    "Now consider the exponential base factor: \\frac{(3x - 1)^{x/2}}{(3x + 2)^{x/2}} = \\left(\\frac{3x - 1}{3x + 2}\\right)^{x/2} = \\left(1 - \\frac{3}{3x + 2}\\right)^{x/2}.\n"
    "This is an indeterminate form of type 1^\\infty, which evaluates as:\n"
    "\\exp\\left( -\\frac{3}{2} \\lim_{x \\to \\infty} \\frac{x}{3x + 2} \\right) = \\exp\\left( -\\frac{3}{2} \\times \\frac{1}{3} \\right) = e^{-1/2} = \\frac{1}{\\sqrt{e}}.\n"
    "Multiplying the two limits together:\n"
    "L = \\frac{2}{3} \\times \\frac{1}{\\sqrt{e}} = \\frac{2}{3\\sqrt{e}} → (D)"
  ),
  "30767": (
    "We have 5 boys and 4 girls (total 9 persons). We seek the number of row arrangements where either all boys sit together OR no two boys sit together.\n"
    "Case 1: All 5 boys sit together.\n"
    "Treat all 5 boys as a single block. Together with the 4 girls, there are 1 + 4 = 5 entities to arrange, which can be done in 5! ways.\n"
    "The 5 boys can be permuted among themselves within the block in 5! ways.\n"
    "Number of ways for Case 1 = 5! \\times 5! = 120 \\times 120 = 14400.\n"
    "Case 2: No two boys sit together.\n"
    "First arrange the 4 girls in a row, which can be done in 4! ways.\n"
    "This creates 5 available spaces (gaps) at the ends and between girls: _ G_1 _ G_2 _ G_3 _ G_4 _.\n"
    "To ensure no two boys are adjacent, the 5 boys must occupy all 5 available spaces, which can be arranged in 5! ways.\n"
    "Number of ways for Case 2 = 4! \\times 5! = 24 \\times 120 = 2880.\n"
    "Since the conditions 'all boys together' and 'no two boys together' are mutually exclusive (intersection is empty):\n"
    "Total valid arrangements = 14400 + 2880 = 17280 → (17280)"
  ),
  "30768": (
    "Let \\alpha, \\beta be the roots of x^2 - ax - b = 0, so \\alpha + \\beta = a and \\alpha\\beta = -b.\n"
    "The power differences P_n = \\alpha^n - \\beta^n satisfy the recurrence relation P_n = a P_{n-1} + b P_{n-2}.\n"
    "Given P_3 = -5\\sqrt{7}i, P_4 = -3\\sqrt{7}i, P_5 = 11\\sqrt{7}i, and P_6 = 45\\sqrt{7}i:\n"
    "From P_5 = a P_4 + b P_3: 11 = -3a - 5b.\n"
    "From P_6 = a P_5 + b P_4: 45 = 11a - 3b.\n"
    "Multiplying the first equation by 3 and the second by 5: 33 = -9a - 15b and 225 = 55a - 15b.\n"
    "Subtracting gives 192 = 64a \\implies a = 3.\n"
    "Substituting a = 3 into the first equation: 11 = -9 - 5b \\implies 5b = -20 \\implies b = -4.\n"
    "Thus the roots satisfy \\alpha + \\beta = 3 and \\alpha\\beta = 4.\n"
    "Then \\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta = 3^2 - 2(4) = 9 - 8 = 1.\n"
    "Then \\alpha^4 + \\beta^4 = (\\alpha^2 + \\beta^2)^2 - 2(\\alpha\\beta)^2 = 1^2 - 2(4^2) = 1 - 32 = -31.\n"
    "Taking the magnitude: |\\alpha^4 + \\beta^4| = |-31| = 31 → (31)"
  ),
  "30769": (
    "The parabola is y^2 = 4(x + 4), which is in the standard form Y^2 = 4a X with a = 1 and vertex at (-4, 0).\n"
    "The focus of this parabola is at (-4 + 1, 0) = (-3, 0).\n"
    "The circle C has center at (-3, 0) and radius 5, so its equation is (x + 3)^2 + y^2 = 25.\n"
    "The intersection of lines 3x - y = 0 and x + \\lambda y = 4 is found by substituting y = 3x:\n"
    "x + 3\\lambda x = 4 \\implies x = \\frac{4}{3\\lambda + 1}, and y = \\frac{12}{3\\lambda + 1}.\n"
    "Substituting this intersection point into circle C:\n"
    "\\left(\\frac{4}{3\\lambda + 1} + 3\\right)^2 + \\left(\\frac{12}{3\\lambda + 1}\\right)^2 = 25 \\implies (9\\lambda + 7)^2 + 144 = 25(3\\lambda + 1)^2.\n"
    "Expanding: 81\\lambda^2 + 126\\lambda + 49 + 144 = 25(9\\lambda^2 + 6\\lambda + 1) = 225\\lambda^2 + 150\\lambda + 25.\n"
    "Simplifying: 144\\lambda^2 + 24\\lambda - 168 = 0 \\implies 6\\lambda^2 + \\lambda - 7 = 0 \\implies (6\\lambda + 7)(\\lambda - 1) = 0.\n"
    "The roots are \\lambda_1 = -\\frac{7}{6} and \\lambda_2 = 1 (since \\lambda_1 < \\lambda_2).\n"
    "Computing: 12\\lambda_1 + 29\\lambda_2 = 12\\left(-\\frac{7}{6}\\right) + 29(1) = -14 + 29 = 15 → (15)"
  ),
  "30770": (
    "The given numbers form an arithmetic progression: 8, 21, 34, 47, \\dots, 320.\n"
    "First term a = 8, common difference d = 21 - 8 = 13.\n"
    "The last term is T_n = a + (n - 1)d = 320 \\implies 8 + 13(n - 1) = 320 \\implies 13(n - 1) = 312 \\implies n - 1 = 24 \\implies n = 25.\n"
    "The variance of n terms of an arithmetic progression with common difference d is given by the formula:\n"
    "\\text{Var} = d^2 \\left(\\frac{n^2 - 1}{12}\\right).\n"
    "Substituting d = 13 and n = 25:\n"
    "\\text{Var} = 13^2 \\times \\left(\\frac{25^2 - 1}{12}\\right) = 169 \\times \\left(\\frac{625 - 1}{12}\\right) = 169 \\times \\left(\\frac{624}{12}\\right).\n"
    "Since \\frac{624}{12} = 52, we compute: \\text{Var} = 169 \\times 52 = 8788 → (8788)"
  ),
  "30771": (
    "Let the first term of the arithmetic progression be a and the common difference be d = \\frac{3}{2}.\n"
    "The sum of the first 11 terms is S_{11} = \\frac{11}{2}[2a + 10d] = 11(a + 5d).\n"
    "Given S_{11} = 88: 11\\left(a + 5 \\times \\frac{3}{2}\\right) = 88 \\implies a + \\frac{15}{2} = 8 \\implies a = 8 - \\frac{15}{2} = \\frac{1}{2}.\n"
    "The roots of 3x^2 - px + q = 0 are the 10th and 11th terms:\n"
    "T_{10} = a + 9d = \\frac{1}{2} + 9\\left(\\frac{3}{2}\\right) = \\frac{1 + 27}{2} = 14.\n"
    "T_{11} = a + 10d = \\frac{1}{2} + 10\\left(\\frac{3}{2}\\right) = \\frac{1 + 30}{2} = \\frac{31}{2}.\n"
    "By Vieta's formulas for 3x^2 - px + q = 0:\n"
    "\\text{Sum of roots} = \\frac{p}{3} = 14 + \\frac{31}{2} = \\frac{59}{2} \\implies p = \\frac{177}{2} \\implies 2p = 177.\n"
    "\\text{Product of roots} = \\frac{q}{3} = 14 \\times \\frac{31}{2} = 7 \\times 31 = 217 \\implies q = 3 \\times 217 = 651.\n"
    "Therefore, q - 2p = 651 - 177 = 474 → (474)"
  )
}

with open("scripts/solutions-23-jan-evening-2025.json", "w", encoding="utf-8") as f:
    json.dump(sols, f, indent=2, ensure_ascii=False)

print(f"Generated {len(sols)} solutions for 23-jan-evening-2025")
