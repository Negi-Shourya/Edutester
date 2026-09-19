// TAG-ONLY step for JEE custom tests. Classifies every question of the
// solution-ready JEE papers into the JEE_CUSTOM_CHAPTERS taxonomy by keyword
// profiles (same scoring as classify-questions.mjs: anchor `!` terms weight 3,
// multi-word phrases weight 2, ordinary terms weight 1; short keys match on
// word boundaries; winner needs score >= 2 and must beat the runner-up).
//
// Usage:
//   node scripts/tag-jee-chapters.mjs
//
// Reads the static paper bundles in public/papers (NOT the DB — read-only).
// Writes:
//   public/custom/jee-chapter-map.json  — {questionId: chapterId} (accepted)
//   scripts/jee-chapter-review.json     — low-confidence items for manual review
// Manual fixes go in scripts/jee-chapter-overrides.json ({qid: chapterId})
// and are merged on top on every run (idempotent).
//
// NOTHING is wired into the builder yet (per user instruction: tag now, add
// once all JEE solutions are elaborated). Do not import jeeCustomChapters or
// load this map from any component.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const papersDir = join(root, 'public', 'papers');

// The 11 solution-ready papers (75 Qs each = 825). Keys match both the
// solutions files (scripts/solutions-<key>.json) and public/papers/<key>.json.
const PAPERS = [
  '02-apr-morning',
  '02-apr-evening',
  '04-apr-morning',
  '04-apr-evening',
  '05-apr-morning',
  '05-apr-evening',
  '06-apr-morning',
  '06-apr-evening',
  '08-apr-evening',
  '21-jan-morning',
  '21-jan-evening',
  '22-jan-morning',
  '22-jan-evening',
  '23-jan-morning',
];

let THRESHOLD = 2;

// { subject, chapterId, keys[] } — chapterId must exist in jeeCustomChapters.ts.
const PROFILES = [
  // ================= PHYSICS =================
  { subject: 'Physics', chapterId: 'jphy-units', keys: ['dimension of', 'dimensions of', 'least count', 'vernier', 'screw gauge', 'significant figures', 'error in measurement', 'dimensional analysis', 'parsec', 'light year'] },
  { subject: 'Physics', chapterId: 'jphy-kinematics-1d', keys: ['uniform acceleration', 'velocity-time', 'position-time', 'relative velocity', 'rectilinear', 'retardation', 'motion in a straight line'] },
  { subject: 'Physics', chapterId: 'jphy-kinematics-2d', keys: ['!projectile', '!circular motion', 'motion in a plane', 'range of the projectile', 'maximum height', 'trajectory', 'kinematics'] },
  { subject: 'Physics', chapterId: 'jphy-laws', keys: ['!friction', 'tension in the string', 'pulley', 'normal reaction', 'inertia', 'free body', 'pseudo force', 'centripetal force', 'banking of road', 'block is in equilibrium', 'thrust'] },
  { subject: 'Physics', chapterId: 'jphy-work', keys: ['work done', '!work-energy theorem', 'conservation of mechanical energy', 'elastic collision', 'inelastic collision', 'power delivered', 'spring constant', 'coefficient of restitution', 'horsepower'] },
  { subject: 'Physics', chapterId: 'jphy-rotational', keys: ['!moment of inertia', 'angular momentum', 'torque', 'rolling without slipping', 'centre of mass', 'center of mass', 'parallel axis', 'perpendicular axis', 'flywheel', 'toppling', 'radius of gyration', 'angular velocity'] },
  { subject: 'Physics', chapterId: 'jphy-gravitation', keys: ['gravitation', 'escape velocity', 'kepler', 'geostationary', 'acceleration due to gravity', 'gravitational potential', 'satellite'] },
  { subject: 'Physics', chapterId: 'jphy-solids', keys: ["young's modulus", 'modulus of elasticity', 'bulk modulus', 'shear modulus', 'stress-strain', 'elastic potential', 'poisson'] },
  { subject: 'Physics', chapterId: 'jphy-fluids', keys: ['surface tension', 'viscosity', 'bernoulli', 'capillary', 'stokes', 'streamline', 'venturimeter', 'surface energy', 'excess pressure', 'terminal velocity'] },
  { subject: 'Physics', chapterId: 'jphy-thermal', keys: ['thermal expansion', 'calorimetry', 'specific heat', 'latent heat', 'thermal conductivity', 'thermal properties', "newton's law of cooling"] },
  { subject: 'Physics', chapterId: 'jphy-thermodynamics', keys: ['!adiabatic', '!isothermal', '!carnot', 'internal energy', 'first law of thermodynamics', 'monoatomic gas', 'diatomic gas', 'heat engine', 'entropy', 'isobaric', 'isochoric'] },
  { subject: 'Physics', chapterId: 'jphy-ktg', keys: ['kinetic theory', 'mean free path', 'degrees of freedom', 'rms speed', 'law of equipartition', 'ideal gas'] },
  { subject: 'Physics', chapterId: 'jphy-oscillations', keys: ['simple harmonic', 'shm', 'time period of oscillation', 'pendulum', 'spring-mass', 'oscillation'] },
  { subject: 'Physics', chapterId: 'jphy-waves', keys: ['wavelength', 'standing wave', 'organ pipe', 'doppler', 'sonometer', 'beats', 'wave equation', 'speed of sound', 'transverse wave', 'longitudinal wave'] },
  { subject: 'Physics', chapterId: 'jphy-em-waves', keys: ['electromagnetic wave', 'displacement current', 'poynting', 'electromagnetic spectrum'] },
  { subject: 'Physics', chapterId: 'jphy-electrostatics-1', keys: ['!coulomb', 'electric field', 'dipole moment', 'gauss', 'charge density', 'electrostatic', 'electric charges'] },
  { subject: 'Physics', chapterId: 'jphy-electrostatics-2', keys: ['electric potential', '!capacitor', '!capacitance', 'dielectric', 'parallel plate', 'equipotential'] },
  { subject: 'Physics', chapterId: 'jphy-current', keys: ['!galvanometer', '!wheatstone', '!kirchhoff', '!potentiometer', 'resistance', 'resistivity', 'ammeter', 'voltmeter', 'drift velocity', 'shunt', 'metre bridge'] },
  { subject: 'Physics', chapterId: 'jphy-magnetism', keys: ['!cyclotron', '!lorentz force', '!biot-savart', 'toroid', 'moving coil', 'magnetic force', 'magnetic field', 'ampere', 'solenoid'] },
  { subject: 'Physics', chapterId: 'jphy-matter-magnetism', keys: ['!bar magnet', '!hysteresis', 'curie temperature', 'retentivity', 'coercivity', 'vibration magnetometer', 'magnetic dip', 'magnetisation', 'magnetic susceptibility'] },
  { subject: 'Physics', chapterId: 'jphy-emi', keys: ['electromagnetic induction', '!lenz', 'mutual inductance', 'self inductance', 'eddy current', 'induced emf', 'magnetic flux'] },
  { subject: 'Physics', chapterId: 'jphy-ac', keys: ['alternating current', 'alternating emf', 'rms value', 'resonance', 'transformer', 'reactance', 'impedance'] },
  { subject: 'Physics', chapterId: 'jphy-ray', keys: ['mirror', 'lens maker', 'total internal reflection', 'prism', 'refraction', 'focal length', 'magnification', 'optical instrument', 'microscope', 'telescope', 'snell'] },
  { subject: 'Physics', chapterId: 'jphy-wave-optics', keys: ['interference', 'diffraction', 'polarisation', 'polarization', 'double slit', 'fringe width', 'brewster', 'malus', 'coherent sources', 'wavefront', 'young’s double slit', "young's double slit"] },
  { subject: 'Physics', chapterId: 'jphy-dual', keys: ['!photoelectric', '!de broglie', 'work function', 'dual nature', 'matter waves'] },
  { subject: 'Physics', chapterId: 'jphy-atoms', keys: ['!bohr', '!rydberg', 'hydrogen spectrum', 'hydrogen atom', 'electron in a hydrogen', 'atomic spectra'] },
  { subject: 'Physics', chapterId: 'jphy-nuclei', keys: ['radioactive', 'half-life', 'half life', 'binding energy', 'nuclear reaction', 'q-value', 'mass defect', 'nuclear force'] },
  { subject: 'Physics', chapterId: 'jphy-semiconductors', keys: ['semiconductor', 'diode', 'transistor', 'logic gate', 'zener', 'rectifier', 'forward bias', 'reverse bias', 'photodiode'] },
  // ================= CHEMISTRY =================
  { subject: 'Chemistry', chapterId: 'jchem-mole', keys: ['!mole concept', '!limiting reagent', 'empirical formula', 'percentage composition', 'stoichiometry', 'molality', 'molarity', 'equivalent weight', 'eudiometry', 'oleum'] },
  { subject: 'Chemistry', chapterId: 'jchem-atom', keys: ['quantum number', 'photoelectric effect', 'heisenberg', 'aufbau', '!electronic configuration', 'bohr radius', 'radial probability', 'isoelectronic species'] },
  { subject: 'Chemistry', chapterId: 'jchem-periodicity', keys: ['!ionization enthalpy', '!electron gain enthalpy', 'electronegativity', 'atomic radius', 'periodic trend', 'diagonal relationship'] },
  { subject: 'Chemistry', chapterId: 'jchem-bonding', keys: ['!hybridization', '!hybridisation', '!bond order', '!vsepr', '!molecular orbital', 'lone pair', 'hydrogen bond', 'bond angle', 'geometry of', 'back bonding', 'fajan'] },
  { subject: 'Chemistry', chapterId: 'jchem-thermodynamics', keys: ['!enthalpy', '!gibbs', '!hess', 'bond enthalpy', 'spontaneous', 'heat of formation', 'heat of combustion', 'entropy change'] },
  { subject: 'Chemistry', chapterId: 'jchem-equilibrium', keys: ['!equilibrium constant', '!le chatelier', '!buffer solution', '!solubility product', 'common ion', 'degree of dissociation', 'henderson', 'ph of'] },
  { subject: 'Chemistry', chapterId: 'jchem-redox', keys: ['oxidation number', 'disproportionation', 'redox', 'oxidising agent', 'reducing agent'] },
  { subject: 'Chemistry', chapterId: 'jchem-s-block', keys: ['alkali metal', 'alkaline earth', 'flame colour', 'flame color', 'plaster of paris', 'washing soda', 'baking soda', 'lime water'] },
  { subject: 'Chemistry', chapterId: 'jchem-p-block', keys: ['borax', 'silicone', 'xenon fluoride', 'nitric acid', 'sulphuric acid', 'contact process', 'ostwald', 'inert pair', 'interhalogen'] },
  { subject: 'Chemistry', chapterId: 'jchem-df-metallurgy', keys: ['lanthanoid', 'actinoid', 'blast furnace', 'roasting', 'calcination', 'zone refining', 'chromate', 'dichromate', 'permanganate', 'transition metal'] },
  { subject: 'Chemistry', chapterId: 'jchem-coordination', keys: ['!ligand', '!crystal field', '!chelate', '!edta', '!spin only', 'd-orbital', 'magnetic moment', 'isomerism in coordination', 'iupac name of the complex', 't2g'] },
  { subject: 'Chemistry', chapterId: 'jchem-goc', keys: ['mesomeric', 'inductive effect', 'hyperconjugation', 'carbocation', 'carbanion', 'free radical', 'enantiomer', 'diastereomer', 'optical activity', 'geometrical isomerism', 'iupac name', 'hybridised carbon'] },
  { subject: 'Chemistry', chapterId: 'jchem-hydrocarbons', keys: ['!wurtz', '!ozonolysis', '!markovnikov', 'aromatic', '!benzene', '!friedel', 'neopentane', 'conformation'] },
  { subject: 'Chemistry', chapterId: 'jchem-haloalkanes-alcohols', keys: ['haloalkane', 'lucas test', 'williamson', 'sn1', 'sn2', 'phenol', 'ether', 'alcohol', 'iodoform', 'elimination reaction'] },
  { subject: 'Chemistry', chapterId: 'jchem-carbonyl', keys: ['!aldehyde', '!ketone', '!carboxylic acid', '!cannizzaro', '!aldol', '!tollens', '!fehling', 'esterification', 'grignard'] },
  { subject: 'Chemistry', chapterId: 'jchem-amines', keys: ['!nitrobenzene', '!diazonium', '!azo coupling', '!carbylamine', 'aniline', 'nitrous acid', 'hoffmann'] },
  { subject: 'Chemistry', chapterId: 'jchem-biomolecules-polymers', keys: ['glucose', 'peptide', 'protein', 'enzyme', 'vitamin', 'nucleic acid', 'polymer', 'nylon', 'buna', 'vulcanisation', 'monomer'] },
  { subject: 'Chemistry', chapterId: 'jchem-electrochemistry', keys: ['electrochemical cell', 'standard electrode potential', 'nernst', 'conductivity', 'faraday', 'electrolysis', 'daniel cell', 'salt bridge'] },
  { subject: 'Chemistry', chapterId: 'jchem-kinetics', keys: ['rate of reaction', 'order of reaction', 'rate constant', 'half-life', 'half life', 'arrhenius', 'activation energy', 'molecularity'] },
  { subject: 'Chemistry', chapterId: 'jchem-solutions', keys: ['raoult', 'colligative', 'osmotic pressure', 'azeotrope', 'ideal solution', 'mole fraction', 'elevation in boiling'] },
  { subject: 'Chemistry', chapterId: 'jchem-practical', keys: ['nitroprusside', 'flame test', 'borax bead', 'salt analysis', 'qualitative analysis', 'brown ring'] },
  { subject: 'Chemistry', chapterId: 'jchem-everyday', keys: ['antacid', 'detergent', 'sweetener', 'antiseptic', 'antibiotic', 'tranquilizer'] },
  // ================= MATHEMATICS =================
  { subject: 'Mathematics', chapterId: 'jmath-sets', keys: ['domain of the function', 'range of', 'one-one', 'onto function', 'bijective', 'inverse of the function', 'relation is', 'equivalence relation', 'venn', 'composition of functions'] },
  { subject: 'Mathematics', chapterId: 'jmath-complex', keys: ['!complex number', '!argand', '!modulus', 'argument of', 'imaginary', 'cube roots of unity', 'conjugate', 'quadratic equation', '!discriminant'] },
  { subject: 'Mathematics', chapterId: 'jmath-matrices', keys: ['!determinant', '!adjoint', '!cramer', '!singular matrix', 'system of equations', 'linear equations', 'infinitely many solutions', 'non-trivial solution', 'trivial solution', 'system has', 'homogeneous system', 'eigen', 'inverse of matrix', 'infinitely many solu'] },
  { subject: 'Mathematics', chapterId: 'jmath-pnc', keys: ['!number of ways', '!circular arrangement', 'committee', 'permutation', 'combination', 'arranged'] },
  { subject: 'Mathematics', chapterId: 'jmath-binomial', keys: ['!binomial', 'general term', 'middle term', 'multinomial'] },
  { subject: 'Mathematics', chapterId: 'jmath-sequences', keys: ['!arithmetic progression', '!geometric progression', '!harmonic progression', 'sum of the series', 'sum to n terms', 'infinite series'] },
  { subject: 'Mathematics', chapterId: 'jmath-trigonometry', keys: ['!inverse trigonometric', '!principal value', '!sine rule', '!cosine rule', 'heights and distances', 'triangle abc'] },
  { subject: 'Mathematics', chapterId: 'jmath-lcd', keys: ['limit of', 'continuity', 'differentiab', '!rolle', 'mean value theorem'] },
  { subject: 'Mathematics', chapterId: 'jmath-aod', keys: ['!maxima and minima', 'increasing in', 'decreasing in', 'tangent and normal', 'rate of change', 'monotonic'] },
  { subject: 'Mathematics', chapterId: 'jmath-indefinite', keys: ['indefinite integral', 'integration by parts', 'partial fraction'] },
  { subject: 'Mathematics', chapterId: 'jmath-definite', keys: ['!definite integral', '!area under', '!area bounded', 'properties of definite'] },
  { subject: 'Mathematics', chapterId: 'jmath-diffeq', keys: ['!differential equation', 'order and degree', 'variable separable', 'integrating factor', 'homogeneous differential'] },
  { subject: 'Mathematics', chapterId: 'jmath-lines-circles', keys: ['!slope of', 'straight line', 'intercept', 'circle', 'centre at the origin', 'chord of the circle', 'tangent to the circle'] },
  { subject: 'Mathematics', chapterId: 'jmath-conics', keys: ['!parabola', '!ellipse', '!hyperbola', '!asymptote', '!directrix', '!eccentricity', '!latus rectum', 'chord of contact', 'focal chord'] },
  { subject: 'Mathematics', chapterId: 'jmath-vectors-3d', keys: ['!scalar triple', '!cross product', '!direction cosine', '!equation of plane', '!shortest distance', 'dot product', 'coplanar', 'line and plane'] },
  { subject: 'Mathematics', chapterId: 'jmath-probability', keys: ['!bayes', '!conditional probability', '!standard deviation', 'dice', 'cards', 'balls', 'bag', 'mean and the variance'] },
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Round-2 enrichment (from the 550-item review pile of the first run): JEE
// stems are terse/formula-heavy ("Power dissipated in coil", "seven-digit
// numbers", "\vec{a}", "\int_{a}^{b}", "Ph-N=N+", "1,2,3-trihydroxypropane"),
// so these add the compact phrasings the base profiles missed. Merged into
// PROFILES at load; duplicates are harmless (each key scores once per list,
// and a repeated key just appears once after the merge dedupe).
const EXTRA_KEYS = {
  'jphy-units': ['dimensional formula'],
  'jphy-kinematics-1d': ['velocity of', 'acceleration', 'distance travelled', 'displacement'],
  'jphy-kinematics-2d': ['circular path', 'angular acceleration', 'angular displacement', 'centripetal', 'tangential', 'rotating'],
  'jphy-laws': ['force exerted', 'weighing machine', 'apparent weight'],
  'jphy-work': ['kinetic energy', 'potential energy', 'conservative force', 'collision'],
  'jphy-gravitation': ['planet', 'orbit', 'star', 'orbital velocity', 'time period'],
  'jphy-solids': ['stress', 'strain', 'elongation', 'breaking stress', 'elastic'],
  'jphy-fluids': ['floats', 'submerged', 'buoyant', 'archimedes', 'density of', 'pressure'],
  'jphy-thermal': ['calorific', 'heat capacity', 'conduction', 'stefan'],
  'jphy-ktg': ['kinetic energy of', 'rms', 'molar heat'],
  'jphy-waves': ['progressive wave', 'wave velocity', 'frequency', 'amplitude', 'phase difference', 'path difference', 'stationary wave'],
  'jphy-electrostatics-1': ['charge', 'electric dipole'],
  'jphy-electrostatics-2': ['potential difference', 'energy stored'],
  'jphy-current': ['power dissipated', 'coil', 'emf', 'battery', 'heating effect', 'combination of resistors', 'internal resistance'],
  'jphy-magnetism': ['magnetic moment', 'current carrying', 'force on'],
  'jphy-matter-magnetism': ['paramagnetic', 'diamagnetic', 'ferromagnetic', 'permeability'],
  'jphy-emi': ['flux', 'induced current', 'motional emf', 'generator'],
  'jphy-ac': ['ac circuit', 'lc circuit', 'lcr', 'power factor', 'wattless'],
  'jphy-ray': ['lens', 'refractive index', 'refractive indices', 'image', 'object distance', 'angle of prism', 'dispersion', 'power of lens'],
  'jphy-wave-optics': ['single slit', 'central maximum', 'resolving power', 'width of'],
  'jphy-dual': ['stopping potential', 'threshold wavelength', 'threshold frequency', 'incident radiation', 'photoelectron'],
  'jphy-atoms': ['spectral lines', 'energy level', 'ground state'],
  'jphy-nuclei': ['activity', 'decay constant', 'fission', 'fusion'],
  'jphy-semiconductors': ['logic circuit', 'truth table', 'nand', 'nor', 'xor', 'gate', 'input'],
  'jchem-mole': ['molar mass', 'moles', 'number of moles', 'avogadro', 'vapour density', 'g of', 'mass of'],
  'jchem-atom': ['ionization energy', 'ionisation energy', 'electron affinity', 'spectral lines', 'bohr model'],
  'jchem-periodicity': ['atomic size', 'ionic radius', 'metallic character'],
  'jchem-bonding': ['bond length', 'unpaired electron', 'bond energy', 'molecular geometry', 'dipole moment'],
  'jchem-thermodynamics': ['gibbs energy', 'spontaneity'],
  'jchem-equilibrium': ['k_a', 'k_sp', 'dissociation constant', 'degree of ionization', 'solubility'],
  'jchem-redox': ['oxidation state', 'n-factor', 'titration', 'kmno4', 'k2cr2o7'],
  'jchem-s-block': ['s-block'],
  'jchem-p-block': ['halogen', 'noble gas', 'oxoacid', 'boron', 'silicon'],
  'jchem-df-metallurgy': ['oxidation state', 'paramagnetic', 'lanthanide', 'actinide'],
  'jchem-coordination': ['complex', 'complexes', 'spectrochemical', 'coordination number'],
  'jchem-goc': ['functional group', 'homologous', 'nomenclature', 'priority', 'electrophile', 'nucleophile'],
  'jchem-hydrocarbons': ['alkane', 'alkene', 'alkyne', 'huckel', 'aromaticity'],
  'jchem-haloalkanes-alcohols': ['glycerol', 'trihydroxy', 'dehydration'],
  'jchem-carbonyl': ['ester', 'acyl', 'benzaldehyde', 'acetone', 'formaldehyde'],
  'jchem-amines': ['!azo', 'phenyl', 'coupling reaction', 'gabriel phthalimide', 'benzene diazonium'],
  'jchem-biomolecules-polymers': ['amino acid', 'dna', 'rna', 'sucrose', 'starch', 'cellulose', 'bakelite', 'polymerisation'],
  'jchem-electrochemistry': ['cell potential', 'electrode', 'anode', 'cathode', 'galvanic', 'standard hydrogen'],
  'jchem-kinetics': ['first order', 'second order', 'zero order', 'rate law', 'catalyst'],
  'jchem-solutions': ['freezing point', 'vapour pressure', 'dissolved in', 'azeotrope', 'henry', 'molality'],
  'jchem-practical': ['orange', 'yellow precipitate', 'white precipitate', 'confirmatory test', 'salt'],
  'jchem-everyday': ['drug', 'cleansing'],
  'jmath-sets': ['number of elements', 'subset', 'belongs to', 'power set', 'cartesian'],
  'jmath-complex': ['imaginary part', 'real part', 'roots', 'complex plane', 'i ='],
  'jmath-matrices': ['matrix', 'matrices', 'no solution', 'unique solution', 'rank'],
  'jmath-pnc': ['digit', 'formed by using', 'arrangements', 'selection'],
  'jmath-binomial': ['coefficient of', 'expansion'],
  'jmath-sequences': ['common difference', 'common ratio', 'arithmetic mean', 'geometric mean', 'nth term'],
  'jmath-trigonometry': ['sin', 'cos', 'tan', 'trigonometric ratios'],
  'jmath-lcd': ['lim_', 'continuous', 'left hand', 'right hand'],
  'jmath-aod': ['maximum value', 'minimum value', 'maxima', 'minima', 'critical point', 'point of inflection', 'concave', 'convex'],
  'jmath-indefinite': ['primitive', 'integration', 'integrate'],
  'jmath-definite': ['!\\int_{', 'lower limit', 'upper limit', 'definite'],
  'jmath-diffeq': ['dy/dx', 'general solution', 'particular solution'],
  'jmath-lines-circles': ['radius', 'centre', 'diameter', 'tangent'],
  'jmath-conics': ['focus', 'vertex', 'axis of', 'conic', 'rectangular hyperbola'],
  'jmath-vectors-3d': ['!\\vec', 'magnitude', 'unit vector', 'collinear', 'scalar product'],
  'jmath-probability': ['probability', 'mean', 'median', 'mode', 'variance', 'events', 'sample space', 'mutually exclusive'],
};

for (const p of PROFILES) {
  const extra = EXTRA_KEYS[p.chapterId];
  if (extra) p.keys = [...new Set([...p.keys, ...extra])];
}

// Round-3 enrichment (from the 400-item review pile of round 2): anchors for
// decisive singletons (!probability, !stress, !∫, !lim_), unicode sub/supers
// (₀, x², s⁻¹, k₂cr₂o₇), formula fragments (|z|, sin(), dy/dx, q =), and the
// compact JEE phrasings (point charges, LCR series circuit, from infinity,
// minimum deviation, layer test, vitamin b, a.p./g.p.).
const EXTRA_KEYS2 = {
  'jphy-solids': ['!stress'],
  'jphy-fluids': ['soap bubble', 'capillary rise', 'poise'],
  'jphy-current': ['resistors', 'potential drop', 'in series', 'in parallel', 'bulb', 'rated'],
  'jphy-ac': ['series circuit', 'phase difference', 'phase diff', 'resonant frequency', 'q-factor', 'ac supply', 'inductor', 'xl', 'xc', 'lcr circuit', 'choke'],
  'jphy-gravitation': ['escape speed', 'from infinity', 'earth surface', 'gravitational'],
  'jphy-ktg': ['gaseous mixture', 'mixture of', 'partial pressure', 'dalton'],
  'jphy-ray': ['minimum deviation', 'incident angle', 'emergent', 'deviation'],
  'jphy-electrostatics-1': ['point charge', 'point charges', 'electric flux', 'spherical shell', 'concentric'],
  'jphy-oscillations': ['frequency of oscillation'],
  'jphy-semiconductors': ['inputs'],
  'jchem-atom': ['ionization', 'ionisation', 'ie of', 'electron gain', 'second ionization', 'third ionization'],
  'jchem-bonding': ['isostructural', 'shape', 'see-saw', 't-shaped', 'square planar', 'tetrahedral', 'trigonal bipyramidal'],
  'jchem-thermodynamics': ['first law', 'q =', 'w =', 'heat evolved', 'work done', 'δg', 'δh', 'δs', 'gibbs free', 'transition temperature'],
  'jchem-equilibrium': ['⇌', 'k_c', 'k_p'],
  'jchem-redox': ['k₂cr₂o₇', 'kmno₄', 'reducing', 'oxidising'],
  'jchem-df-metallurgy': ['k₂cr₂o₇', 'kmno₄', 'orange colour', 'oxidises', 'oxidizes', 'primary standard'],
  'jchem-goc': ['electrophilic', 'nucleophilic', 'attack of', 'site for', 'reactivity', 'activating', 'deactivating', 'orienting'],
  'jchem-hydrocarbons': ['hydrocarbon', 'chlorination', 'combustion', 'cracking', 'pyrolysis'],
  'jchem-amines': ['n=n', 'diazo'],
  'jchem-biomolecules-polymers': ['vitamin b', 'deficiency', 'ascorbic', 'thiamine', 'pyridoxine', 'niacin'],
  'jchem-kinetics': ['e_a', 's⁻¹', 'min⁻¹', 'h⁻¹', 'activation', 'order with respect', 'temperature coefficient'],
  'jchem-solutions': ['azeotropic', 'distillation', 'separation'],
  'jchem-p-block': ['oxidising power', 'reducing power', 'layer test', 'group 17', 'group 18'],
  'jchem-practical': ['colour', 'precipitate', 'confirmatory', 'salt'],
  'jmath-sets': ['common terms', 'venn diagram', 'number of common'],
  'jmath-complex': ['x²', 'x^2', 'roots of', 'sum of roots', 'product of roots', '|z|', '∈ ℂ', 'complex'],
  'jmath-matrices': ['characteristic equation'],
  'jmath-pnc': ['!permutation', '!combination'],
  'jmath-binomial': ['!binomial'],
  'jmath-sequences': ['a.p.', 'g.p.', 'h.p.', 'sum of', 'up to'],
  'jmath-trigonometry': ['sin(', 'cos(', 'tan('],
  'jmath-lcd': ['!lim_', 'x→', 'tends to'],
  'jmath-definite': ['!∫', 'dx'],
  'jmath-indefinite': ['!indefinite'],
  'jmath-diffeq': ['!differential equation'],
  'jmath-vectors-3d': ['vector', 'foot of perpendicular', 'perpendicular to', 'parallel to', 'passes through', 'direction ratios'],
  'jmath-probability': ['!probability', 'mean of', 'frequency', 'distribution', 'class interval'],
};

for (const p of PROFILES) {
  const extra = EXTRA_KEYS2[p.chapterId];
  if (extra) p.keys = [...new Set([...p.keys, ...extra])];
}

// Round-4 enrichment (from the 306-item review pile of round 3): det(/adj for
// matrices, ∞/cubes for sequences, term-independent for binomial, image-of
// for 3D lines, function/onto/bijective signals for sets, tan⁻¹/⁻¹ for trig,
// v-t/distance for kinematics, em-wave anchor, area-of/bounded-by for
// definite integrals, neutrons/electrons/anion for atomic structure,
// side-chain for biomolecules, solution-of/dy for diffeq, acidity/conjugate
// acids for equilibrium, spm/osmosis for solutions, purification for
// practical, force for laws, rolling/loop for rotation, LED anchor.
const EXTRA_KEYS3 = {
  'jphy-kinematics-1d': ['v-t', 'speed-time', 'distance', 'average velocity', 'average speed'],
  'jphy-kinematics-2d': ['circular loop', 'vertical circle', 'loop'],
  'jphy-laws': ['force', 'under force', 'moves under'],
  'jphy-em-waves': ['!em wave', 'associated electric', 'speed of light'],
  'jphy-semiconductors': ['!led', 'bias'],
  'jphy-ray': ['spherical', 'interface', 'refracting surface'],
  'jchem-atom': ['neutrons', 'electrons', 'protons', 'anion', 'cation', 'atomic mass', 'atomic number', 'isotope', 'isobar'],
  'jchem-equilibrium': ['conjugate acid', 'conjugate base', 'protonation', 'weakest base', 'ksp', 'solubility'],
  'jchem-solutions': ['spm', 'semipermeable', 'osmosis'],
  'jchem-practical': ['purification', 'chromatography', 'fractional', 'steam distillation', 'sublimation', 'crystallisation'],
  'jchem-haloalkanes-alcohols': ['bromobutane', 'alkyl halide', 'chirality', 'chiral', 'wedge', 'acidity', 'acidic strength', 'pka'],
  'jchem-biomolecules-polymers': ['side chain', 'hinsberg'],
  'jmath-sets': ['function', 'f :', 'one-to-one'],
  'jmath-matrices': ['det(', 'adj', 'eigen', 'symmetric matrix'],
  'jmath-sequences': ['∞', 'infinite', 'cubes', 'squares'],
  'jmath-binomial': ['term independent', 'independent of'],
  'jmath-trigonometry': ['⁻¹', 'inverse'],
  'jmath-lcd': ['twice differentiable', 'derivative'],
  'jmath-definite': ['area of', 'bounded by', 'region', 'enclosed'],
  'jmath-diffeq': ['solution of', 'dy'],
  'jmath-vectors-3d': ['image of', 'image in', 'mirror image', 'centroid', 'triangle', 'Δ', 'distance'],
  'jmath-lines-circles': ['reflect', 'rays', 'passes through', 'intersection of'],
  'jmath-pnc': ['words', 'letters', 'vowels', 'consonants', 'formed from'],
};

for (const p of PROFILES) {
  const extra = EXTRA_KEYS3[p.chapterId];
  if (extra) p.keys = [...new Set([...p.keys, ...extra])];
}

function scoreProfile(text, profile) {
  let score = 0;
  const lower = text.toLowerCase();
  for (const raw0 of profile.keys) {
    let raw = raw0;
    let weight = raw.includes(' ') ? 2 : 1;
    if (raw.startsWith('!')) {
      raw = raw.slice(1);
      weight = 3;
    }
    const key = raw.toLowerCase();
    let found = false;
    if (key.includes('\\')) {
      // KaTeX markup (e.g. \vec, \int_{): \b word-boundaries never match
      // around a backslash, so always use a plain substring search.
      found = lower.includes(key);
    } else if (
      /[^\x00-\x7F]/.test(key) || // unicode (∫, ₀, ², ⇌, |z|…): \b is ASCII-only
      /^\W|\W$/.test(key) || // leading/trailing punctuation (|z|, sin()
      key.endsWith('(')
    ) {
      found = lower.includes(key);
    } else if (key.length < 5 && !key.includes(' ')) {
      found = new RegExp(`\\b${escapeRegExp(key)}\\b`).test(lower);
    } else {
      found = lower.includes(key);
    }
    if (found) score += weight;
  }
  return score;
}

function classify(text, subject) {
  const cands = PROFILES.filter((p) => p.subject === subject);
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

function main() {
  // Debug: node scripts/tag-jee-chapters.mjs --probe <questionId>
  // prints every nonzero profile score for that question's stem.
  const probeIdx = process.argv.indexOf('--probe');
  if (probeIdx !== -1) {
    const qid = String(process.argv[probeIdx + 1]);
    for (const key of PAPERS) {
      const paper = JSON.parse(readFileSync(join(papersDir, `${key}.json`), 'utf8'));
      const q = (paper.questions || []).find((x) => String(x.id) === qid);
      if (!q) continue;
      const subject = (q.sections && q.sections.name) || '?';
      console.log(`[${key} Q${q.number} subject=${subject}] ${(q.text || '').slice(0, 160)}`);
      for (const p of PROFILES.filter((x) => x.subject === subject)) {
        const s = scoreProfile(q.text || '', p);
        if (s > 0) console.log(`  ${s}  ${p.chapterId}`);
      }
      return;
    }
    console.log(`question ${qid} not found in the 11 papers`);
    return;
  }
  const map = {};
  const review = [];
  const perChapter = {};
  const perPaper = {};
  let total = 0;

  let overrides = {};
  const overridesFile = join(root, 'scripts', 'jee-chapter-overrides.json');
  if (existsSync(overridesFile)) {
    overrides = JSON.parse(readFileSync(overridesFile, 'utf8'));
  }

  for (const key of PAPERS) {
    const file = join(papersDir, `${key}.json`);
    if (!existsSync(file)) {
      console.log(`SKIP (no bundle): ${key}`);
      continue;
    }
    const paper = JSON.parse(readFileSync(file, 'utf8'));
    perPaper[key] = { total: 0, accepted: 0, review: 0 };
    for (const q of paper.questions) {
      const subject = (q.sections && q.sections.name) || '?';
      const stem = q.text || '';
      total++;
      perPaper[key].total++;
      const hit = classify(stem, subject);
      const optText = ((q.question_options || []).map((o) => o.text || '').join(' ')).trim();
      if (!hit) {
        // Stem + options fallback at a stricter bar; still review-only.
        let fb = null;
        if (optText) {
          const saved = THRESHOLD;
          THRESHOLD = saved + 1;
          fb = classify(`${stem} ${optText}`, subject);
          THRESHOLD = saved;
        }
        review.push({
          id: q.id, paper: key, number: q.number, subject,
          reason: fb ? 'options-fallback' : 'no-profile-hit',
          suggestion: fb ? fb.profile.chapterId : null,
          score: fb ? fb.score : 0,
          hasFigure: Array.isArray(q.figure_url) ? q.figure_url.length > 0 : !!q.figure_url,
          text: stem.slice(0, 200),
        });
        perPaper[key].review++;
        continue;
      }
      map[String(q.id)] = hit.profile.chapterId;
      perChapter[hit.profile.chapterId] = (perChapter[hit.profile.chapterId] || 0) + 1;
      perPaper[key].accepted++;
    }
  }

  // Manual overrides win over everything (idempotent re-runs).
  let applied = 0;
  for (const [qid, chapterId] of Object.entries(overrides)) {
    if (!PROFILES.some((p) => p.chapterId === chapterId)) {
      console.log(`OVERRIDE SKIP (unknown chapter): ${qid} -> ${chapterId}`);
      continue;
    }
    map[String(qid)] = chapterId;
    applied++;
  }

  const outDir = join(root, 'public', 'custom');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'jee-chapter-map.json'), JSON.stringify(map));
  writeFileSync(join(root, 'scripts', 'jee-chapter-review.json'), JSON.stringify(review, null, 1));

  console.log(`papers=${PAPERS.length} questions=${total} auto-accepted=${Object.keys(map).length - applied} overrides=${applied} review=${review.length}`);
  for (const [k, v] of Object.entries(perPaper)) {
    console.log(`  ${k}: total=${v.total} accepted=${v.accepted} review=${v.review}`);
  }
  const empty = PROFILES.filter((p) => !perChapter[p.chapterId]).map((p) => p.chapterId);
  if (empty.length) console.log(`chapters with 0 questions: ${empty.join(', ')}`);
}

main();
