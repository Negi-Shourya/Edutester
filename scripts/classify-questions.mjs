// Classifies leftover paper questions (those NOT carved into chapter tests)
// into syllabus chapters by keyword profiles.
//
// Validation: npm run classify-questions -- --validate
//   Runs the classifier over the 980 curated question→chapter mappings and
//   reports agreement. Tune keywords/threshold until agreement is high.
// Generate: npm run classify-questions
//   Writes public/chapters/question-chapter-auto.json (accepted) and
//   scripts/chapter-review.json (low-confidence, for manual review).
//
// Scoring: each profile keyword hit adds weight 1 (2 for multi-word
// phrases). Short keys (<5 chars) match on word boundaries only. The best
// profile wins if score >= THRESHOLD and it beats the runner-up.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const papersDir = join(root, 'public', 'papers');
const curatedIndex = JSON.parse(
  readFileSync(join(root, 'public', 'chapters', 'question-chapter-index.json'), 'utf8')
);

let THRESHOLD = 2;

// { exam, subject, testId (chapter-test id or null), title, keys[] }
const PROFILES = [
  // ================= JEE PHYSICS =================
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-1', title: 'Kinematics', keys: ['!projectile', '!circular motion', 'uniform acceleration', 'velocity-time', 'position-time', 'relative velocity', 'rectilinear', 'motion in a plane', 'range of the projectile', 'maximum height', 'kinematics', 'trajectory', 'retardation'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-2', title: 'Laws of Motion', keys: ['!friction', 'tension in the string', 'pulley', 'normal reaction', 'inertia', 'free body', 'pseudo force', 'centripetal force', 'banking of road', 'newton', 'block is in equilibrium', 'thrust'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-3', title: 'Work, Energy & Power', keys: ['work done', '!work-energy theorem', 'conservation of mechanical energy', 'elastic collision', 'inelastic collision', 'power delivered', 'spring constant', 'coefficient of restitution', 'horsepower'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-4', title: 'Rotational Motion', keys: ['!moment of inertia', 'angular momentum', 'torque', 'rolling without slipping', 'centre of mass', 'center of mass', 'parallel axis', 'perpendicular axis', 'flywheel', 'toppling', 'radius of gyration', 'angular velocity', 'disc', 'ring'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-5', title: 'Thermodynamics', keys: ['!adiabatic', '!isothermal', '!carnot', 'internal energy', 'first law of thermodynamics', 'monoatomic gas', 'diatomic gas', 'heat engine', 'entropy', 'isobaric', 'isochoric', 'thermal equilibrium'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-6', title: 'Electrostatics', keys: ['!coulomb', '!capacitor', '!capacitance', 'electric field', 'electric potential', 'dipole moment', 'gauss', 'dielectric', 'parallel plate', 'charge density', 'electrostatic'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-7', title: 'Current Electricity', keys: ['!galvanometer', '!wheatstone', '!kirchhoff', '!potentiometer', 'resistance', 'resistivity', 'ammeter', 'voltmeter', 'drift velocity', 'shunt', 'metre bridge', 'thermistor'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-8', title: 'Magnetism & Matter', keys: ['!bar magnet', '!hysteresis', '!curie temperature', 'magnetic moment', 'retentivity', 'coercivity', 'vibration magnetometer', 'magnetic dip'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Moving Charges & Magnetism', keys: ['!cyclotron', '!lorentz force', '!biot-savart', 'toroid', 'moving coil', 'magnetic force', 'magnetic field', 'ampere', 'solenoid', 'charged particle.*magnetic'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-9', title: 'EMI & AC', keys: ['electromagnetic induction', '!lenz', 'mutual inductance', 'self inductance', 'magnetic energy stored', 'eddy current', 'alternating current', 'rms value', 'resonance', 'transformer', 'reactance', 'impedance', 'alternating emf'] },
  { exam: 'jee', subject: 'Physics', testId: 'jee-phy-10', title: 'Modern Physics', keys: ['!photoelectric', '!de broglie', '!bohr', '!rydberg', 'x-ray', 'radioactive', 'half-life', 'binding energy', 'nucleus', 'work function', 'hydrogen spectrum', 'hydrogen atom', 'electron in a hydrogen'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Units & Measurements', keys: ['dimension of', 'dimensions of', 'least count', 'vernier', 'screw gauge', 'significant figures', 'error in measurement', 'dimensional analysis', 'parsec', 'light year'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Gravitation', keys: ['gravitation', 'escape velocity', 'kepler', 'geostationary', 'acceleration due to gravity', 'gravitational potential', 'satellite', 'g on the surface'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Fluid Mechanics', keys: ['surface tension', 'viscosity', 'bernoulli', 'capillary', 'stokes', 'streamline', 'venturimeter', 'surface energy', 'excess pressure', 'terminal velocity'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Solids & Elasticity', keys: ['young', 'modulus of elasticity', 'bulk modulus', 'shear modulus', 'stress-strain', 'elastic potential', 'poisson'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Oscillations', keys: ['simple harmonic', 'shm', 'time period of oscillation', 'pendulum', 'spring-mass', 'phase of the', 'oscillation'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Waves', keys: ['wavelength', 'standing wave', 'organ pipe', 'doppler', 'sonometer', 'beats', 'wave equation', 'speed of sound', 'transverse wave', 'longitudinal wave'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Ray Optics', keys: ['mirror', 'lens maker', 'total internal reflection', 'prism', 'refraction', 'focal length', 'magnification', 'optical instrument', 'microscope', 'telescope', 'snell'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Wave Optics', keys: ['interference', 'diffraction', 'polarisation', 'polarization', 'young', 'double slit', 'fringe width', 'brewster', 'malus', 'coherent sources'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Semiconductors', keys: ['semiconductor', 'diode', 'transistor', 'logic gate', 'zener', 'rectifier', 'forward bias', 'reverse bias', 'led', 'photodiode'] },
  { exam: 'jee', subject: 'Physics', testId: null, title: 'Kinetic Theory of Gases', keys: ['kinetic theory', 'mean free path', 'degrees of freedom', 'rms speed', 'law of equipartition', 'ideal gas'] },
  // ================= JEE CHEMISTRY =================
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-1', title: 'Some Basic Concepts', keys: ['!mole concept', '!limiting reagent', 'empirical formula', 'percentage composition', 'stoichiometry', 'molality', 'molarity', 'equivalent weight', 'eudiometry', 'oleum', 'chlorophyll'] },
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-2', title: 'Atomic Structure', keys: ['quantum number', 'photoelectric effect', 'heisenberg', 'aufbau', '!electronic configuration', 'bohr radius', 'node', 'radial probability', 'isoelectronic species'] },
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-3', title: 'Chemical Bonding', keys: ['!hybridization', '!hybridisation', '!bond order', '!vsepr', '!molecular orbital', 'lone pair', 'hydrogen bond', 'bond angle', 'geometry of', 'sp3d', 'back bonding', 'fajan'] },
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-4', title: 'Chemical Thermodynamics', keys: ['!enthalpy', '!gibbs', '!hess', 'bond enthalpy', 'spontaneous', 'heat of formation', 'heat of combustion', 'entropy change'] },
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-5', title: 'Equilibrium', keys: ['!equilibrium constant', '!le chatelier', '!buffer solution', '!solubility product', 'common ion', 'degree of dissociation', 'henderson', 'ph of'] },
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-6', title: 'Hydrocarbons', keys: ['!wurtz', '!ozonolysis', '!markovnikov', 'aromatic', '!benzene', '!friedel', 'neopentane', 'conformation', 'kolbe.*electrolysis'] },
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-7', title: 'Coordination Compounds', keys: ['!ligand', '!crystal field', '!chelate', '!edta', '!spin only', '!cft', 'd-orbital', 'magnetic moment', 'isomerism in coordination', 'iupac name of the complex', 'eg destabilizes', 't2g'] },
  { exam: 'jee', subject: 'Chemistry', testId: 'jee-chem-8', title: 'Carbonyl Compounds', keys: ['!aldehyde', '!ketone', '!carboxylic acid', '!cannizzaro', '!aldol', '!tollens', '!fehling', 'esterification', 'grignard'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Periodic Table', keys: ['ionization enthalpy', 'electron gain enthalpy', 'electronegativity', 'atomic radius', 'periodic trend', 'diagonal relationship', 'isoelectronic'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 's-Block Elements', keys: ['alkali metal', 'alkaline earth', 'flame colour', 'flame color', 'plaster of paris', 'washing soda', 'baking soda', 'lime water'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'p-Block Elements', keys: ['borax', 'silicone', 'xenon fluoride', 'nitric acid', 'sulphuric acid', 'contact process', 'ostwald', 'inert pair', 'interhalogen'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'd & f Block and Metallurgy', keys: ['lanthanoid', 'actinoid', 'blast furnace', 'roasting', 'calcination', 'zone refining', 'chromate', 'dichromate', 'permanganate', 'transition metal'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Redox Reactions', keys: ['oxidation number', 'disproportionation', 'redox', 'oxidising agent', 'reducing agent', 'balanced.*equation'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Electrochemistry', keys: ['electrochemical cell', 'standard electrode potential', 'nernst', 'conductivity', 'faraday', 'electrolysis', 'daniel cell', 'salt bridge'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Chemical Kinetics', keys: ['rate of reaction', 'order of reaction', 'rate constant', 'half-life', 'half life', 'arrhenius', 'activation energy', 'molecularity'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Solutions', keys: ['raoult', 'colligative', 'osmotic pressure', 'van.t hoff', 'azeotrope', 'ideal solution', 'mole fraction', 'elevation in boiling'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'GOC & Isomerism', keys: ['mesomeric', 'inductive effect', 'hyperconjugation', 'carbocation', 'carbanion', 'free radical', 'enantiomer', 'diastereomer', 'optical activity', 'geometrical isomerism', 'iupac name', 'hybridised carbon'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Haloalkanes & Alcohols', keys: ['haloalkane', 'lucas test', 'williamson', 'sn1', 'sn2', 'phenol', 'ether', 'alcohol', 'iodoform', 'elimination reaction'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Amines & Diazonium Salts', keys: ['!nitrobenzene', '!diazonium', '!azo coupling', '!carbylamine', 'amine', 'nitrous acid', 'hoffmann', 'aniline'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Biomolecules & Polymers', keys: ['glucose', 'peptide', 'protein', 'enzyme', 'vitamin', 'nucleic acid', 'polymer', 'nylon', 'buna', 'vulcanisation', 'monomer'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Salt Analysis & Practical Chemistry', keys: ['nitroprusside', 'flame test', 'borax bead', 'salt analysis', 'cation', 'anion', 'qualitative analysis', 'brown ring', 'confirmation of'] },
  { exam: 'jee', subject: 'Chemistry', testId: null, title: 'Chemistry in Everyday Life', keys: ['antacid', 'detergent', 'sweetener', 'antiseptic', 'antibiotic', 'tranquilizer', 'soap', 'sulphanilic acid', 'naphthylamine'] },
  // ================= JEE MATHEMATICS =================
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-1', title: 'Sets & Relations', keys: ['domain of the function', 'range of', 'one-one', 'onto function', 'bijective', 'inverse of the function', 'relation is', 'equivalence relation', 'venn', 'composition of functions'] },
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-2', title: 'Complex Numbers & Quadratics', keys: ['!complex number', '!argand', '!modulus', 'argument of', '!discriminant', 'imaginary', 'cube roots of unity', 'conjugate', 'quadratic equation'] },
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-3', title: 'Matrices & Determinants', keys: ['!determinant', '!adjoint', '!cramer', '!singular matrix', 'system of equations', 'rank of', 'eigen', 'inverse of matrix', 'infinitely many solu'] },
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-4', title: 'Differential Calculus', keys: ['!rolle', '!lagrange', '!maxima and minima', 'increasing function', 'decreasing function', 'tangent and normal', 'rate of change', 'mean value theorem', 'continuity', 'differentiab'] },
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-5', title: 'Integral Calculus', keys: ['!definite integral', '!area under', '!area bounded', 'indefinite integral', 'properties of definite', 'substitution'] },
  { exam: 'jee', subject: 'Mathematics', testId: null, title: 'Differential Equations', keys: ['!differential equation', 'order and degree', 'variable separable', 'integrating factor', 'homogeneous differential'] },
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-6', title: 'Coordinate Geometry', keys: ['!parabola', '!ellipse', '!hyperbola', '!asymptote', '!directrix', '!eccentricity', '!latus rectum', 'chord of contact', 'focal chord', 'tangent to the circle'] },
  { exam: 'jee', subject: 'Mathematics', testId: null, title: 'Straight Lines & Circles', keys: ['!slope of', 'straight line', 'intercept', 'circle', 'centre at the origin', 'radius'] },
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-7', title: 'Vectors & 3D', keys: ['!scalar triple', '!cross product', '!direction cosine', '!equation of plane', '!shortest distance', 'dot product', 'coplanar', 'line and plane'] },
  { exam: 'jee', subject: 'Mathematics', testId: 'jee-math-8', title: 'Probability & Statistics', keys: ['!bayes', '!conditional probability', '!standard deviation', 'dice', 'cards', 'balls', 'bag', 'mean and the variance'] },
  { exam: 'jee', subject: 'Mathematics', testId: null, title: 'Permutations & Combinations', keys: ['!number of ways', '!circular arrangement', 'committee', 'permutation', 'combination', 'arranged'] },
  { exam: 'jee', subject: 'Mathematics', testId: null, title: 'Binomial Theorem', keys: ['!binomial', 'general term', 'middle term', 'multinomial'] },
  { exam: 'jee', subject: 'Mathematics', testId: null, title: 'Sequences & Series', keys: ['!arithmetic progression', '!geometric progression', '!harmonic progression', 'sum of the series', 'sum to n terms', 'infinite series'] },
  { exam: 'jee', subject: 'Mathematics', testId: null, title: 'Trigonometry', keys: ['!inverse trigonometric', '!principal value', '!sine rule', '!cosine rule', 'heights and distances', 'triangle abc'] },
  // ================= NEET PHYSICS =================
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-1', title: 'Units & Measurements', keys: ['dimension of', 'dimensions of', 'least count', 'vernier', 'screw gauge', 'significant figures', 'error in measurement', 'dimensional analysis'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-2', title: 'Kinematics', keys: ['!projectile', '!circular motion', 'uniform acceleration', 'velocity-time', 'relative velocity', 'motion in a plane', 'range of the projectile', 'maximum height'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-3', title: 'Laws of Motion', keys: ['!friction', 'tension in the string', 'pulley', 'normal reaction', 'inertia', 'free body', 'banking of road'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-4', title: 'Work, Energy & Power', keys: ['work done', '!work-energy theorem', 'elastic collision', 'inelastic collision', 'power delivered', 'spring constant', 'coefficient of restitution'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-5', title: 'Gravitation', keys: ['!gravitation', '!escape velocity', '!kepler', 'geostationary', 'acceleration due to gravity', 'gravitational potential', 'satellite'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-6', title: 'Thermal Physics', keys: ['!adiabatic', '!isothermal', '!carnot', 'internal energy', 'kinetic theory', 'mean free path', 'heat engine', 'thermal expansion', 'calorimetry', 'newton.*cooling'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-7', title: 'Electrostatics', keys: ['!coulomb', '!capacitor', '!capacitance', 'electric field', 'electric potential', 'dipole moment', 'gauss', 'dielectric', 'parallel plate'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-8', title: 'Current Electricity', keys: ['!galvanometer', '!wheatstone', '!kirchhoff', '!potentiometer', 'resistance', 'resistivity', 'ammeter', 'drift velocity'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-9', title: 'Ray Optics', keys: ['!lens maker', '!total internal reflection', 'mirror', 'prism', 'refraction', 'focal length', 'magnification', 'microscope', 'telescope'] },
  { exam: 'neet', subject: 'Physics', testId: 'neet-phy-10', title: 'Modern Physics', keys: ['!photoelectric', '!de broglie', '!bohr', 'x-ray', 'radioactive', 'half-life', 'binding energy', 'nucleus', 'work function', 'hydrogen atom'] },
  { exam: 'neet', subject: 'Physics', testId: null, title: 'Rotational Motion', keys: ['!moment of inertia', 'angular momentum', 'torque', 'rolling without slipping', 'centre of mass', 'center of mass'] },
  { exam: 'neet', subject: 'Physics', testId: null, title: 'Oscillations & Waves', keys: ['!simple harmonic', 'pendulum', 'wavelength', 'standing wave', 'organ pipe', 'doppler', 'beats', 'speed of sound', 'oscillation'] },
  { exam: 'neet', subject: 'Physics', testId: null, title: 'Magnetism & EMI', keys: ['!cyclotron', '!lorentz force', '!lenz', 'magnetic field', 'solenoid', 'moving coil', 'mutual inductance', 'alternating current', 'resonance', 'transformer', 'bar magnet', 'magnetic moment'] },
  { exam: 'neet', subject: 'Physics', testId: null, title: 'Wave Optics & Semiconductors', keys: ['!interference', '!diffraction', '!fringe width', 'polarisation', 'semiconductor', 'diode', 'transistor', 'logic gate', 'zener'] },
  { exam: 'neet', subject: 'Physics', testId: null, title: 'Fluids & Elasticity', keys: ['surface tension', 'viscosity', 'bernoulli', 'capillary', 'young', 'bulk modulus', 'terminal velocity', 'excess pressure'] },
  // ================= NEET CHEMISTRY =================
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-1', title: 'Mole Concept', keys: ['!mole concept', '!limiting reagent', 'empirical formula', 'percentage composition', 'stoichiometry', 'molality', 'molarity'] },
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-2', title: 'Atomic Structure', keys: ['quantum number', 'heisenberg', 'aufbau', '!electronic configuration', 'bohr radius', 'hydrogen spectrum', 'node'] },
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-3', title: 'Chemical Bonding', keys: ['!hybridization', '!hybridisation', '!bond order', '!vsepr', '!molecular orbital', 'lone pair', 'hydrogen bond', 'bond angle', 'geometry of'] },
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-4', title: 'Thermodynamics', keys: ['!enthalpy', '!gibbs', '!hess', 'spontaneous', 'heat of formation', 'heat of combustion'] },
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-5', title: 'Equilibrium', keys: ['!equilibrium constant', '!le chatelier', '!buffer solution', '!solubility product', 'common ion', 'degree of dissociation'] },
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-6', title: 'GOC & Hydrocarbons', keys: ['!ozonolysis', '!markovnikov', '!carbocation', '!enantiomer', 'aromatic', 'iupac name', 'wurtz', 'hyperconjugation'] },
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-7', title: 'Biomolecules', keys: ['!glucose', '!peptide', 'protein', 'enzyme', 'vitamin', 'nucleic acid'] },
  { exam: 'neet', subject: 'Chemistry', testId: 'neet-chem-8', title: 'Inorganic Chemistry', keys: ['!ligand', '!crystal field', 'periodic', 'ionization enthalpy', 'alkali metal', 'transition metal', 'lanthanoid', 'd-orbital', 'magnetic moment'] },
  { exam: 'neet', subject: 'Chemistry', testId: null, title: 'Redox & Electrochemistry', keys: ['!oxidation number', '!nernst', '!electrolysis', 'redox', 'faraday', 'standard electrode potential', 'conductivity', 'daniel cell'] },
  { exam: 'neet', subject: 'Chemistry', testId: null, title: 'Kinetics & Solutions', keys: ['!rate of reaction', '!arrhenius', '!raoult', '!colligative', 'order of reaction', 'rate constant', 'half-life', 'half life', 'activation energy', 'osmotic pressure'] },
  { exam: 'neet', subject: 'Chemistry', testId: null, title: 'Organic Oxygen & Nitrogen', keys: ['!aldehyde', '!ketone', '!carboxylic acid', '!aldol', '!tollens', '!nitrobenzene', 'phenol', 'amine', 'diazonium', 'aniline', 'ester', 'haloalkane', 'polymer'] },
  { exam: 'neet', subject: 'Chemistry', testId: null, title: 'Salt Analysis & Everyday Chemistry', keys: ['!nitroprusside', '!flame test', '!salt analysis', 'cation', 'anion', 'antacid', 'detergent', 'soap', 'brown ring'] },
  // ================= NEET BIOLOGY =================
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-1', title: 'Cell Biology', keys: ['!telophase', '!mitosis', '!meiosis', '!pachytene', '!crossing over', 'cell cycle', 'chloroplast', 'mitochondria', 'ribosome', 'cell wall', 'plasma membrane'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-2', title: 'Diversity in Living World', keys: ['!nomenclature', '!herbarium', '!binomial', 'monera', 'protista', 'gymnosperm', 'angiosperm', 'homologous'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-3', title: 'Morphology & Anatomy', keys: ['!phylloclade', '!placentation', '!xylem', '!phloem', 'venation', 'cambium', 'periderm', 'cockroach', 'earthworm', 'frog', 'modified stem'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-4', title: 'Plant Physiology', keys: ['!photosynthesis', '!emerson', '!red drop', '!transpiration', '!photorespiration', 'krebs', 'glycolysis', 'auxin', 'gibberellin', 'protons are found'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-5', title: 'Human Physiology I', keys: ['!alveoli', '!sarcomere', '!synapse', 'digestion', 'myosin', 'actin', 'breathing', 'thyroid', 'insulin', 'eye', 'ear'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-6', title: 'Human Physiology II', keys: ['!cardiac', '!nephron', '!glomerular', '!sino-atrial', 'dialysis', 'excretion', 'ecg', 'blood pressure', 'uriniferous'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-7', title: 'Genetics I', keys: ['!dihybrid', '!linkage', '!pedigree', '!thalassemia', 'mendel', 'recombination', 'sex determination', 'dominance', 'inheritance'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-8', title: 'Genetics II', keys: ['!lac operon', '!genetic code', '!double helix', 'transcription', 'translation', 'codon', 'nucleotide', 'taq polymerase', 'dna replication'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-9', title: 'Biotechnology', keys: ['!restriction endonuclease', '!gel electrophoresis', '!bioreactor', '!bt cotton', 'plasmid', 'pcr', 'gene therapy', 'recombinant'] },
  { exam: 'neet', subject: 'Biology', testId: 'neet-bio-10', title: 'Ecology', keys: ['!ecological succession', '!food chain', '!eutrophication', 'biome', 'biodiversity', 'sanctuary', 'pollution', 'ecosystem'] },
  { exam: 'neet', subject: 'Biology', testId: null, title: 'Reproduction', keys: ['!apomixis', '!pollination', '!embryo sac', '!spermatogenesis', '!oogenesis', '!menstrual', '!parturition', 'fertilization', 'seed formation without'] },
  { exam: 'neet', subject: 'Biology', testId: null, title: 'Evolution', keys: ['!darwin', '!natural selection', '!hardy-weinberg', 'evolution', 'analogous', 'divergent', 'fossil'] },
  { exam: 'neet', subject: 'Biology', testId: null, title: 'Human Health & Disease', keys: ['!antigen', '!antivenom', '!autoimmune', 'immune', 'antibody', 'vaccine', 'cancer', 'aids', 'malaria', 'allergy', 'polio drops', 'pathogen'] },
  { exam: 'neet', subject: 'Biology', testId: null, title: 'Microbes & Human Welfare', keys: ['!fermentation', '!biogas', '!mycorrhiza', '!baculovirus', 'microbe', 'statins'] },
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scoreProfile(text, profile) {
  let score = 0;
  const lower = text.toLowerCase();
  for (const raw0 of profile.keys) {
    // '!' prefix = anchor term (highly distinctive for the chapter), weight 3.
    // Multi-word phrases weight 2, ordinary terms weight 1.
    let raw = raw0;
    let weight = raw.includes(' ') ? 2 : 1;
    if (raw.startsWith('!')) {
      raw = raw.slice(1);
      weight = 3;
    }
    const key = raw.toLowerCase();
    let found = false;
    if (key.length < 5 && !key.includes(' ')) {
      found = new RegExp(`\\b${escapeRegExp(key)}\\b`).test(lower);
    } else {
      found = lower.includes(key);
    }
    if (found) score += weight;
  }
  return score;
}

function normSubject(sec) {
  if (sec === 'Botany' || sec === 'Zoology') return 'Biology';
  return sec;
}

function examOf(paper) {
  return paper.exam_type === 'neet' ? 'neet' : 'jee';
}

function classify(text, exam, subject) {
  const cands = PROFILES.filter((p) => p.exam === exam && p.subject === subject);
  let best = null;
  let runner = 0;
  for (const p of cands) {
    const s = scoreProfile(text, p);
    if (!best || s > best.score) {
      runner = best ? best.score : 0;
      best = { profile: p, score: s };
    } else if (s > runner) {
      runner = s;
    }
  }
  if (!best || best.score < THRESHOLD) return null;
  if (best.score - runner < 1 && best.score < 5) return null;
  return best;
}

// Stem first; if the stem is generic ("Given below are two statements…",
// match-lists), fall back to stem + option text with a stricter bar since
// options are noisy (they contain distractors from other chapters).
function classifyQuestion(q, exam, subject, strictBonus = 0) {
  const stem = q.text || '';
  const hit = classify(stem, exam, subject);
  if (hit) return hit;
  const optText = ((q.question_options || []).map((o) => o.text || '').join(' ')).trim();
  if (!optText) return null;
  const saved = THRESHOLD;
  THRESHOLD = saved + 1 + strictBonus;
  const h2 = classify(`${stem} ${optText}`, exam, subject);
  THRESHOLD = saved;
  if (h2) h2.viaOptions = true;
  return h2;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function main() {
  const mode = process.argv.includes('--validate') ? 'validate' : 'generate';
  const thresholdArg = process.argv.find((a) => a.startsWith('--threshold='));
  if (thresholdArg) THRESHOLD = Number(thresholdArg.split('=')[1]);

  // Gather every paper question once.
  const papers = [];
  for (const f of readdirSync(papersDir)) {
    if (!f.endsWith('.json')) continue;
    const p = JSON.parse(readFileSync(join(papersDir, f), 'utf8'));
    if (Array.isArray(p.questions)) papers.push({ file: f, ...p });
  }

  if (mode === 'validate') {
    let total = 0;
    let agree = 0;
    let classified = 0;
    let autoRegion = 0;
    const hist = {};
    const misses = [];
    for (const papersRow of papers) {
      const exam = examOf(papersRow);
      for (const q of papersRow.questions) {
        const curated = curatedIndex[String(q.id)];
        if (!curated) continue;
        const curatedOne = curated.find((c) => c.exam === exam) ?? curated[0];
        const sec = (q.sections && q.sections.name) || '?';
        const subject = normSubject(sec);
        total++;
        const hit = classifyQuestion(q, exam, subject);
        if (hit) {
          classified++;
          hist[hit.score] = (hist[hit.score] || 0) + 1;
        }
        if (!hit) continue;
        // Same chapter test = agreement. Classifier auto-region (no test)
        // can't agree by id — count separately.
        if (hit.profile.testId === null) {
          autoRegion++;
        } else if (hit.profile.testId === curatedOne.chapterId) {
          agree++;
        } else if (misses.length < 30) {
          misses.push({ id: q.id, curated: curatedOne.chapterId, got: hit.profile.testId, score: hit.score, text: (q.text || '').slice(0, 100) });
        }
      }
    }
    console.log(`threshold=${THRESHOLD} curated=${total} classified=${classified} agree=${agree} agreement=${((agree / Math.max(1, total)) * 100).toFixed(1)}% recall=${((classified / Math.max(1, total)) * 100).toFixed(1)}% autoRegion=${autoRegion}`);
    console.log('score histogram:', JSON.stringify(hist));
    for (const m of misses) console.log(JSON.stringify(m));
    return;
  }

  // Generate: classify leftovers.
  const auto = {};
  const review = [];
  let leftover = 0;
  for (const papersRow of papers) {
    const exam = examOf(papersRow);
    for (const q of papersRow.questions) {
      if (curatedIndex[String(q.id)]) continue;
      const sec = (q.sections && q.sections.name) || '?';
      const subject = normSubject(sec);
      leftover++;
      const hit = classifyQuestion(q, exam, subject);
      if (!hit) {
        review.push({ id: q.id, exam, subject, reason: 'no-profile-hit', text: (q.text || '').slice(0, 120) });
        continue;
      }
      const p = hit.profile;
      const chapterId = p.testId ?? `auto-${exam}-${slug(subject)}-${slug(p.title)}`;
      // Options-fallback hits are noisier (distractors come from other
      // chapters) — they go to manual review with a suggestion.
      if (hit.viaOptions) {
        review.push({ id: q.id, exam, subject, reason: 'options-fallback', chapter: p.title, score: hit.score, text: (q.text || '').slice(0, 120) });
        continue;
      }
      auto[String(q.id)] = {
        chapterId,
        title: p.title,
        subject,
        exam,
        hasTest: p.testId !== null,
        auto: true,
        confidence: hit.score,
      };
    }
  }
  writeFileSync(join(root, 'public', 'chapters', 'question-chapter-auto.json'), JSON.stringify(auto));
  writeFileSync(join(root, 'scripts', 'chapter-review.json'), JSON.stringify(review, null, 1));
  console.log(`leftover=${leftover} auto-accepted=${Object.keys(auto).length} review=${review.length}`);
  const withTest = Object.values(auto).filter((e) => e.hasTest).length;
  console.log(`of accepted: with chapter test=${withTest}, without=${Object.keys(auto).length - withTest}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
