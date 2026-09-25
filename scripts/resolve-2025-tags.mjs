import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JEE_CUSTOM_CHAPTERS } from '../src/data/jeeCustomChapters.ts';

const validChapters = new Set(JEE_CUSTOM_CHAPTERS.map(c => c.id));
const revs = JSON.parse(readFileSync('scripts/jee-chapter-review.json', 'utf8'));

// Load all full paper JSONs to get question options
const fullQuestions = new Map();
const papers = [...new Set(revs.map(r => r.paper))];
for (const p of papers) {
  const paperJson = JSON.parse(readFileSync(join('public/papers', `${p}.json`), 'utf8'));
  for (const q of paperJson.questions) {
    fullQuestions.set(q.id, q);
  }
}

function classify(q) {
  const fq = fullQuestions.get(q.id) || q;
  const optText = (fq.question_options || []).map(o => o.text || '').join(' ');
  const t = `${fq.text || ''} ${optText}`.toLowerCase();
  const s = fq.sections?.name || q.subject;

  if (s === 'Physics') {
    // Units & Measurements
    if (t.includes('least count') || t.includes('vernier') || t.includes('screw gauge') || t.includes('dimension') || t.includes('percentage error') || t.includes('relative error') || t.includes('observable') || t.includes('q = \\frac{a') || t.includes('error in')) return 'jphy-units';
    // Solids
    if (t.includes('young') || t.includes('tensile') || t.includes('modulus') || t.includes('stress') || t.includes('strain') || t.includes('breaking stress') || (t.includes('wire') && (t.includes('stretch') || t.includes('load') || t.includes('elongat')))) return 'jphy-solids';
    // Fluids
    if (t.includes('visco') || t.includes('terminal velocity') || t.includes('surface tension') || t.includes('capillar') || t.includes('bernoulli') || t.includes('buoyan') || t.includes('floating') || t.includes('droplet') || t.includes('excess pressure') || t.includes('streamline') || t.includes('poise') || t.includes('soap bubble') || t.includes('window') && t.includes('partitioned')) return 'jphy-fluids';
    // Thermal properties
    if (t.includes('black body') || t.includes('radiates') || t.includes('stefan') || t.includes('conduction') || t.includes('calorimet') || t.includes('specific heat') || t.includes('thermal conductiv') || t.includes('heat required') || t.includes('ice') && t.includes('steam') || t.includes('latent heat')) return 'jphy-thermal';
    // Thermodynamics
    if (t.includes('carnot') || t.includes('adiabatic') || t.includes('isothermal') || t.includes('heat engine') || t.includes('cyclic transformation') || t.includes('p-v diagram') || t.includes('first law of thermodynamics') || t.includes('efficiency')) return 'jphy-thermodynamics';
    // KTG
    if (t.includes('c_p') || t.includes('c_v') || t.includes('gamma_1') || t.includes('gamma_2') || t.includes('diatomic') || t.includes('monoatomic') || t.includes('degrees of freedom') || t.includes('mean free path') || t.includes('rms speed') || t.includes('ideal gas')) return 'jphy-ktg';
    // Oscillations
    if (t.includes('shm') || t.includes('simple harmonic') || t.includes('oscillat') || t.includes('pendulum') || t.includes('spring-mass oscillator') || t.includes('time period of oscillation')) return 'jphy-oscillations';
    // Waves
    if (t.includes('sound') || t.includes('organ pipe') || t.includes('tuning fork') || t.includes('beats') || t.includes('doppler') || t.includes('standing wave') || t.includes('string of length') || t.includes('transverse wave') || t.includes('longitudinal') || t.includes('wave equation')) return 'jphy-waves';
    // EM Waves
    if (t.includes('electromagnetic wave') || t.includes('em wave') || t.includes('poynting') || t.includes('displacement current') || t.includes('radiation pressure')) return 'jphy-em-waves';
    // Electrostatics 1
    if (t.includes('electric field') || t.includes('coulomb') || t.includes('gauss') || t.includes('electric flux') || t.includes('line charge') || t.includes('point charge') || t.includes('dipole moment') || t.includes('charge density')) return 'jphy-electrostatics-1';
    // Electrostatics 2
    if (t.includes('capacit') || t.includes('dielectric') || t.includes('electric potential') || t.includes('potential difference') || t.includes('equipotential') || t.includes('stored energy')) return 'jphy-electrostatics-2';
    // Current
    if (t.includes('circuit') || t.includes('resistance') || t.includes('resistor') || t.includes('galvanometer') || t.includes('ammeter') || t.includes('voltmeter') || t.includes('wheatstone') || t.includes('meter bridge') || t.includes('potentiometer') || t.includes('drift velocity') || t.includes('net current') || t.includes('current flowing') || t.includes('heating effect')) return 'jphy-current';
    // Magnetism
    if (t.includes('magnetic field') || t.includes('biot-savart') || t.includes('solenoid') || t.includes('toroid') || t.includes('cyclotron') || t.includes('lorentz') || t.includes('ampere') || t.includes('moving coil') || t.includes('undeflected') || t.includes('crossed electric')) return 'jphy-magnetism';
    // Magnetism and matter
    if (t.includes('magnetic susceptibility') || t.includes('bar magnet') || t.includes('hysteresis') || t.includes('paramagnetic') || t.includes('diamagnetic') || t.includes('ferromagnetic') || t.includes('curie') || t.includes('retentivity')) return 'jphy-matter-magnetism';
    // EMI
    if (t.includes('induct') || t.includes('self-inductance') || t.includes('mutual inductance') || t.includes('magnetic flux') || t.includes('lenz') || t.includes('induced emf') || t.includes('metallic loop') || t.includes('eddy current')) return 'jphy-emi';
    // AC
    if (t.includes('transformer') || t.includes('alternating') || t.includes('rms current') || t.includes('lcr') || t.includes('resonant') || t.includes('power factor') || t.includes('impedance') || t.includes('choke')) return 'jphy-ac';
    // Ray Optics
    if (t.includes('lens') || t.includes('mirror') || t.includes('prism') || t.includes('refract') || t.includes('glass slab') || t.includes('focal length') || t.includes('optical power') || t.includes('magnification') || t.includes('lateral shift') || t.includes('critical angle') || t.includes('total internal')) return 'jphy-ray';
    // Wave Optics
    if (t.includes('interference') || t.includes('diffraction') || t.includes('polariz') || t.includes('polaris') || t.includes('young') || t.includes('slit') || t.includes('fringe') || t.includes('brewster') || t.includes('coherent')) return 'jphy-wave-optics';
    // Dual Nature
    if (t.includes('photoelectric') || t.includes('matter wave') || t.includes('work function') || t.includes('de broglie') || t.includes('stopping potential') || t.includes('photons') || t.includes('photon') || t.includes('threshold')) return 'jphy-dual';
    // Atoms
    if (t.includes('bohr') || t.includes('rydberg') || t.includes('hydrogen atom') || t.includes('hydrogen-like') || t.includes('spectral lines') || t.includes('lyman') || t.includes('balmer') || t.includes('first excited state') || t.includes('orbit of')) return 'jphy-atoms';
    // Nuclei
    if (t.includes('radioactiv') || t.includes('half-life') || t.includes('decay') || t.includes('nucleus') || t.includes('nuclei') || t.includes('nucleon') || t.includes('binding energy') || t.includes('fission') || t.includes('fusion') || t.includes('mass defect')) return 'jphy-nuclei';
    // Semiconductors
    if (t.includes('diode') || t.includes('zener') || t.includes('logic gate') || t.includes('truth table') || t.includes('transistor') || t.includes('semiconductor') || t.includes('p-n junction') || t.includes('nand') || t.includes('nor')) return 'jphy-semiconductors';
    // Rotational
    if (t.includes('torque') || t.includes('roll without slipping') || t.includes('rolling') || t.includes('solid sphere') || t.includes('flywheel') || t.includes('moment of inertia') || t.includes('radius of gyration') || t.includes('centre of mass') || t.includes('center of mass') || t.includes('angular momentum') || t.includes('angular velocity') || t.includes('rod of mass')) return 'jphy-rotational';
    // Gravitation
    if (t.includes('gravitat') || t.includes('satellite') || t.includes('escape speed') || t.includes('escape velocity') || t.includes('kepler') || t.includes('planet') || t.includes('acceleration due to gravity')) return 'jphy-gravitation';
    // Work, energy, power
    if (t.includes('work done') || t.includes('kinetic energy') || t.includes('potential energy') || t.includes('collision') || t.includes('power') || t.includes('spring') || t.includes('restitution')) return 'jphy-work';
    // Laws of motion
    if (t.includes('friction') || t.includes('tension') || t.includes('pulley') || t.includes('normal reaction') || t.includes('free body') || t.includes('incline') || t.includes('force') || t.includes('hangs')) return 'jphy-laws';
    // Kinematics 2D
    if (t.includes('projectile') || t.includes('circular motion') || t.includes('range') || t.includes('horizontal range') || t.includes('angle of projection') || t.includes('trajectory')) return 'jphy-kinematics-2d';
    // Kinematics 1D
    if (t.includes('velocity') || t.includes('acceleration') || t.includes('speed') || t.includes('straight line') || t.includes('position x') || t.includes('motion') || t.includes('distance')) return 'jphy-kinematics-1d';
  }

  if (s === 'Chemistry') {
    // Biomolecules & Polymers
    if (t.includes('polymer') || t.includes('monomer') || t.includes('glucose') || t.includes('fructose') || t.includes('sucrose') || t.includes('carbohydrate') || t.includes('vitamin') || t.includes('protein') || t.includes('amino acid') || t.includes('peptide') || t.includes('dna') || t.includes('rna') || t.includes('nylon') || t.includes('disaccharide') || t.includes('sugar') || t.includes('starch') || t.includes('cellulose')) return 'jchem-biomolecules-polymers';
    // Coordination
    if (t.includes('complex') || t.includes('ligand') || t.includes('coordination') || t.includes('chelate') || t.includes('crystal field') || t.includes('cfse') || t.includes('t_{2g}') || t.includes('isomerism in coordination') || t.includes('spin only') || t.includes('[ni(co)') || t.includes('[co(') || t.includes('[cr(') || t.includes('[fe(')) return 'jchem-coordination';
    // Amines
    if (t.includes('amine') || t.includes('diazonium') || t.includes('aniline') || t.includes('hinsberg') || t.includes('carbylamine') || t.includes('azo') || t.includes('gabriel') || t.includes('phthalimide') || t.includes('sulphonamide')) return 'jchem-amines';
    // Carbonyl
    if (t.includes('aldehyde') || t.includes('ketone') || t.includes('carboxylic') || t.includes('aldol') || t.includes('cannizzaro') || t.includes('tollen') || t.includes('fehling') || t.includes('ester') || t.includes('benzoic acid') || t.includes('effervescence') || t.includes('clemmensen') || t.includes('wolf-kishner') || t.includes('haloform') || t.includes('iodoform')) return 'jchem-carbonyl';
    // Haloalkanes, Alcohols, Phenols, Ethers
    if (t.includes('alcohol') || t.includes('phenol') || t.includes('ether') || t.includes('haloalkane') || t.includes('alkyl halide') || t.includes('s_n1') || t.includes('s_n2') || t.includes('lucas') || t.includes('kolbe') || t.includes('reimer') || t.includes('williamson') || t.includes('grignard') || t.includes('bromopropane') || t.includes('picric acid') || t.includes('sec-butyl') || t.includes('neopentyl')) return 'jchem-haloalkanes-alcohols';
    // Hydrocarbons
    if (t.includes('alkane') || t.includes('alkene') || t.includes('alkyne') || t.includes('benzene') || t.includes('aromatic') || t.includes('ozonolysis') || t.includes('wurtz') || t.includes('friedel-crafts') || t.includes('conformation') || t.includes('toluene') || t.includes('neopentane') || t.includes('combustion of hydrocarbon')) return 'jchem-hydrocarbons';
    // GOC
    if (t.includes('iupac') || t.includes('isomer') || t.includes('stereoisomer') || t.includes('geometrical isomerism') || t.includes('optical') || t.includes('carbocation') || t.includes('carbanion') || t.includes('resonance') || t.includes('hyperconjugation') || t.includes('inductive') || t.includes('chiral') || t.includes('enantiomer') || t.includes('hybridised carbon') || t.includes('acidity') || t.includes('acidic strength')) return 'jchem-goc';
    // Salt Analysis & Practical
    if (t.includes('salt analysis') || t.includes('qualitative') || t.includes('fecl_3') || t.includes('chromyl chloride') || t.includes('borax bead') || t.includes('flame test') || t.includes('brown ring') || t.includes('group reagent') || t.includes('group v') || t.includes('cation') || t.includes('precipitate') || t.includes('steam volatile') || t.includes('blood red')) return 'jchem-practical';
    // Everyday Life
    if (t.includes('drug') || t.includes('antacid') || t.includes('antihistamine') || t.includes('antiseptic') || t.includes('antibiotic') || t.includes('detergent') || t.includes('soap') || t.includes('greenhouse gas') || t.includes('cleansing')) return 'jchem-everyday';
    // Solutions
    if (t.includes('solution') || t.includes('freezing point') || t.includes('boiling point') || t.includes('depression') || t.includes('elevation') || t.includes('osmotic') || t.includes('colligative') || t.includes('vapour pressure') || t.includes('raoult') || t.includes('henry') || t.includes("van 't hoff") || t.includes('azeotrope') || t.includes('molality')) return 'jchem-solutions';
    // Chemical Kinetics
    if (t.includes('rate of') || t.includes('order of') || t.includes('half-life') || t.includes('activation energy') || t.includes('arrhenius') || t.includes('rate constant') || t.includes('elementary reaction') || t.includes('mechanism') && t.includes('reaction') || t.includes('pseudo') || t.includes('concentration of a at')) return 'jchem-kinetics';
    // Electrochemistry
    if (t.includes('nernst') || t.includes('electrochemical') || t.includes('galvanic') || t.includes('electrolysis') || t.includes('kohlrausch') || t.includes('molar conductivity') || t.includes('faraday') || t.includes('standard electrode') || t.includes('cell potential') || t.includes('emf')) return 'jchem-electrochemistry';
    // Redox
    if (t.includes('redox') || t.includes('oxidation state') || t.includes('oxidation number') || t.includes('oxidising') || t.includes('reducing') || t.includes('disproportionation') || t.includes('titrat') || t.includes('kmno_4') || t.includes('k_2cr_2o_7')) return 'jchem-redox';
    // Equilibrium
    if (t.includes('equilibrium') || t.includes('k_p') || t.includes('k_c') || t.includes('k_sp') || t.includes('ph of') || t.includes('buffer') || t.includes('solubility product') || t.includes('le chatelier') || t.includes('degree of dissociation') || t.includes('common ion')) return 'jchem-equilibrium';
    // Thermodynamics
    if (t.includes('enthalpy') || t.includes('entropy') || t.includes('gibbs') || t.includes('spontaneous') || t.includes('thermodynamic') || t.includes('intensive property') || t.includes('extensive property') || t.includes('heat of') || t.includes('hess') || t.includes('insulated closed vessel')) return 'jchem-thermodynamics';
    // d and f Block, Metallurgy
    if (t.includes('lanthanoid') || t.includes('actinoid') || t.includes('d-block') || t.includes('f-block') || t.includes('transition metal') || t.includes('metallurgy') || t.includes('blast furnace') || t.includes('extraction') || t.includes('calcination') || t.includes('roasting') || t.includes('vo_2') || t.includes('acidic oxide')) return 'jchem-df-metallurgy';
    // p-Block
    if (t.includes('group 13') || t.includes('group 14') || t.includes('group 15') || t.includes('group 16') || t.includes('group 17') || t.includes('group 18') || t.includes('halide') || t.includes('hydrogen halide') || t.includes('boron') || t.includes('silicon') || t.includes('nitrogen') || t.includes('phosphorus') || t.includes('noble gas') || t.includes('teh_2') || t.includes('teo_2') || t.includes('inert pair')) return 'jchem-p-block';
    // s-Block
    if (t.includes('s-block') || t.includes('alkali metal') || t.includes('alkaline earth') || t.includes('plaster of paris') || t.includes('washing soda') || t.includes('baking soda')) return 'jchem-s-block';
    // Chemical Bonding
    if (t.includes('hybridization') || t.includes('bond order') || t.includes('vsepr') || t.includes('shape of') || t.includes('geometry') || t.includes('dipole moment') || t.includes('molecular orbital') || t.includes('hydrogen bond') || t.includes('defect') || t.includes('frenkel')) return 'jchem-bonding';
    // Periodicity
    if (t.includes('electronegativity') || t.includes('ionization enthalpy') || t.includes('electron gain enthalpy') || t.includes('atomic radius') || t.includes('ionic radius') || t.includes('periodic') || t.includes('isoelectronic')) return 'jchem-periodicity';
    // Atomic Structure
    if (t.includes('quantum number') || t.includes('orbital') || t.includes('radial node') || t.includes('angular node') || t.includes('bohr') || t.includes('heisenberg') || t.includes('uncertainty') || t.includes('de broglie') || t.includes('electronic configuration') || t.includes('spectrum') || t.includes('threshold frequency')) return 'jchem-atom';
    // Mole Concept
    if (t.includes('mole') || t.includes('molar mass') || t.includes('molarity') || t.includes('molality') || t.includes('limiting reagent') || t.includes('empirical formula') || t.includes('stoichiometr') || t.includes('percentage composition') || t.includes('number of atoms')) return 'jchem-mole';
  }

  if (s === 'Mathematics') {
    // Sets, Relations, Functions
    if (t.includes('relation') || t.includes('equivalence relation') || t.includes('function') || t.includes('domain') || t.includes('range') || t.includes('one-one') || t.includes('onto') || t.includes('bijective') || t.includes('f(f(x))') || t.includes('f(x)') || t.includes('f(5)') || t.includes('g(f(x))') || t.includes('composite') || t.includes('set')) return 'jmath-sets';
    // Complex & Quadratic
    if (t.includes('complex') || t.includes('roots of') || t.includes('quadratic') || t.includes('|z|') || t.includes('imaginary') || t.includes('i =') || t.includes('(1+i)') || t.includes('discriminant') || t.includes('argand') || t.includes('number of solutions of the equation')) return 'jmath-complex';
    // Matrices & Determinants
    if (t.includes('matrix') || t.includes('matrices') || t.includes('determinant') || t.includes('adj') || t.includes('cramer') || t.includes('system of linear') || t.includes('non-trivial') || t.includes('eigen')) return 'jmath-matrices';
    // Permutations & Combinations
    if (t.includes('permutation') || t.includes('combination') || t.includes('number of ways') || t.includes('digits without repetition') || t.includes('4-digit') || t.includes('5-digit') || t.includes('arranged') || t.includes('selection') || t.includes('divides 50!') || t.includes('divides 60!') || t.includes('sequences of ten terms')) return 'jmath-pnc';
    // Binomial Theorem
    if (t.includes('binomial') || t.includes('expansion') || t.includes('coefficient of') || t.includes('term independent') || t.includes('middle term') || t.includes('{}^nc_r') || t.includes('divisible by 7') || t.includes('remainder') || t.includes('divided by 23') || t.includes('divided by 7')) return 'jmath-binomial';
    // Sequences & Series
    if (t.includes('g.p.') || t.includes('a.p.') || t.includes('h.p.') || t.includes('progression') || t.includes('series') || t.includes('\\sum') || t.includes('sum of') || t.includes('upto 20 terms') || t.includes('upto 40 terms') || t.includes('upto \\infty terms') || t.includes('1 + 3 + 11')) return 'jmath-sequences';
    // Trigonometry
    if (t.includes('sin') || t.includes('cos') || t.includes('tan') || t.includes('cot') || t.includes('sec') || t.includes('csc') || t.includes('trigonometr') || t.includes('inverse trigonometric') || t.includes('\\sin^{-1}') || t.includes('\\cos^{-1}') || t.includes('\\tan^{-1}')) return 'jmath-trigonometry';
    // Limits, Continuity, Differentiability
    if (t.includes('limit') || t.includes('continuous') || t.includes('differentiable') || t.includes('continuity') || t.includes('differentiability') || t.includes('lim_') || t.includes('\\lim_{')) return 'jmath-lcd';
    // Applications of Derivatives
    if (t.includes('maxima') || t.includes('minima') || t.includes('maximum value') || t.includes('minimum value') || t.includes('increasing') || t.includes('decreasing') || t.includes('tangent and normal') || t.includes('rate of change') || t.includes('critical point') || t.includes('inflection')) return 'jmath-aod';
    // Definite Integration & Area Under Curves
    if (t.includes('\\int_') || t.includes('definite integral') || t.includes('area enclosed') || t.includes('area of the region') || t.includes('area bounded') || t.includes('region inside')) return 'jmath-definite';
    // Indefinite Integration
    if (t.includes('\\int') || t.includes('indefinite') || t.includes('primitive')) return 'jmath-indefinite';
    // Differential Equations
    if (t.includes('differential equation') || t.includes('dy/dx') || t.includes('integrating factor') || t.includes('order and degree') || t.includes('general solution')) return 'jmath-diffeq';
    // Straight Lines & Circles
    if (t.includes('straight line') || t.includes('circle') || t.includes('slope') || t.includes('radius') || t.includes('centre of') || t.includes('intercept') || t.includes('chord') || t.includes('orthocenter') || t.includes('triangle')) return 'jmath-lines-circles';
    // Conic Sections
    if (t.includes('parabola') || t.includes('ellipse') || t.includes('hyperbola') || t.includes('eccentricity') || t.includes('focus') || t.includes('directrix') || t.includes('latus rectum')) return 'jmath-conics';
    // Vectors & 3D Geometry
    if (t.includes('vector') || t.includes('plane') || t.includes('direction ratios') || t.includes('direction cosines') || t.includes('coplanar') || t.includes('shortest distance') || t.includes('3d') || t.includes('perpendicular') || t.includes('parallel')) return 'jmath-vectors-3d';
    // Probability & Statistics
    if (t.includes('probability') || t.includes('variance') || t.includes('mean') || t.includes('standard deviation') || t.includes('independent events') || t.includes('random variable') || t.includes('dice') || t.includes('cards') || t.includes('bayes')) return 'jmath-probability';
  }

  return null;
}

const explicit = {
  '30751': 'jmath-lines-circles',
  '30755': 'jmath-aod',
  '30775': 'jphy-units',
  '30803': 'jchem-equilibrium',
  '30808': 'jchem-df-metallurgy',
  '30810': 'jchem-kinetics',
  '30815': 'jchem-haloalkanes-alcohols',
  '30816': 'jchem-carbonyl',
  '30829': 'jmath-vectors-3d',
  '30844': 'jmath-pnc',
  '30876': 'jchem-goc',
  '30879': 'jchem-practical',
  '30889': 'jchem-haloalkanes-alcohols',
  '30890': 'jchem-biomolecules-polymers',
  '30892': 'jchem-solutions',
  '30906': 'jmath-sequences',
  '30914': 'jmath-complex',
  '30918': 'jmath-vectors-3d',
  '30853': 'jphy-electrostatics-1',
  '30856': 'jphy-thermal',
  '30859': 'jphy-thermodynamics',
  '30862': 'jphy-thermal',
  '31083': 'jphy-nuclei',
  '31105': 'jchem-equilibrium',
  '31110': 'jchem-haloalkanes-alcohols',
  '31115': 'jchem-redox',
  '31141': 'jmath-definite',
  '31225': 'jphy-ktg',
  '31250': 'jchem-hydrocarbons',
  '31254': 'jchem-thermodynamics',
  '31255': 'jchem-hydrocarbons',
  '31258': 'jchem-carbonyl',
  '31259': 'jchem-hydrocarbons',
  '31261': 'jchem-kinetics',
  '31265': 'jchem-goc',
  '31266': 'jchem-practical',
  '31394': 'jphy-ktg',
  '31398': 'jchem-goc',
  '31402': 'jchem-goc',
  '31403': 'jchem-mole',
  '31406': 'jchem-haloalkanes-alcohols',
  '31411': 'jchem-kinetics',
  '31413': 'jchem-carbonyl',
  '31416': 'jchem-practical',
  '31420': 'jchem-goc',
  '31431': 'jmath-complex',
  '31444': 'jmath-matrices',
  '31466': 'jphy-thermal',
  '31470': 'jphy-units',
  '31475': 'jchem-practical',
  '31479': 'jchem-solutions',
  '31485': 'jchem-goc',
  '31486': 'jchem-thermodynamics',
  '31487': 'jchem-atom',
  '31497': 'jchem-bonding',
  '31500': 'jmath-definite',
  '31505': 'jmath-lines-circles',
  '31514': 'jmath-binomial',
  '31673': 'jphy-wave-optics',
  '31693': 'jphy-fluids',
  '31701': 'jchem-solutions',
  '31709': 'jchem-periodicity',
  '31715': 'jchem-goc',
  '31722': 'jchem-kinetics',
  '31723': 'jmath-pnc',
  '31725': 'jmath-pnc',
  '31775': 'jchem-hydrocarbons',
  '31786': 'jchem-kinetics',
  '31787': 'jchem-p-block',
  '31793': 'jchem-kinetics',
  '32048': 'jphy-thermodynamics',
  '32051': 'jphy-em-waves',
  '32079': 'jchem-goc',
  '32080': 'jchem-mole',
  '32084': 'jchem-amines',
  '32085': 'jchem-amines',
  '32091': 'jchem-haloalkanes-alcohols',
  '32096': 'jchem-thermodynamics',
  '32097': 'jchem-practical',
  '32104': 'jmath-sequences',
  '32154': 'jchem-carbonyl',
  '32155': 'jchem-haloalkanes-alcohols',
  '32161': 'jchem-df-metallurgy',
  '32192': 'jmath-sequences',
  '32194': 'jmath-binomial',
  '32210': 'jphy-current',
  '32232': 'jchem-amines',
  '32239': 'jchem-hydrocarbons',
  '32258': 'jmath-sequences',
  '32599': 'jchem-periodicity',
  '32600': 'jchem-carbonyl',
  '32602': 'jchem-goc',
  '32607': 'jchem-carbonyl',
  '32609': 'jchem-thermodynamics',
  '32635': 'jmath-binomial',
  '32646': 'jmath-pnc',
  '32798': 'jphy-waves',
  '32806': 'jphy-ac',
  '32812': 'jphy-atoms',
  '32829': 'jchem-atom',
  '32837': 'jchem-carbonyl',
  '32851': 'jmath-binomial',
  '32879': 'jphy-ktg',
  '32903': 'jchem-periodicity',
  '32905': 'jchem-thermodynamics',
  '32907': 'jchem-df-metallurgy',
  '32914': 'jchem-bonding',
  '32925': 'jmath-sets',
  '32928': 'jmath-probability',
  '31238': 'jphy-rotational',
  '31247': 'jchem-kinetics',
  '29327': 'jphy-kinematics-1d',
  '29727': 'jchem-atom',
  '29734': 'jchem-atom',
  '29759': 'jmath-complex',
  '29767': 'jmath-sets',
  '30552': 'jchem-atom',
  '30555': 'jchem-electrochemistry',
  '30562': 'jchem-carbonyl',
  '30727': 'jchem-practical',
  '30732': 'jchem-hydrocarbons',
  '30734': 'jchem-df-metallurgy',
  '30741': 'jchem-df-metallurgy'
};

const assigned = {};
const unassigned = [];

for (const r of revs) {
  let c = explicit[String(r.id)] || classify(r);
  if (c && validChapters.has(c)) {
    assigned[String(r.id)] = c;
  } else {
    unassigned.push(r);
  }
}

console.log(`Classified: ${Object.keys(assigned).length} / ${revs.length}`);
console.log(`Unassigned: ${unassigned.length}`);
if (unassigned.length > 0) {
  writeFileSync('scripts/_unassigned-81.json', JSON.stringify(unassigned, null, 2));
} else {
  // Merge into scripts/jee-chapter-overrides.json!
  const overridesFile = 'scripts/jee-chapter-overrides.json';
  const currentOverrides = JSON.parse(readFileSync(overridesFile, 'utf8'));
  Object.assign(currentOverrides, assigned);
  writeFileSync(overridesFile, JSON.stringify(currentOverrides));
  console.log('Successfully saved to jee-chapter-overrides.json! Total overrides:', Object.keys(currentOverrides).length);
}

