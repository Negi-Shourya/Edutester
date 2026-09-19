export type JeeSubject = 'Physics' | 'Chemistry' | 'Mathematics';

export interface JeeCustomChapter {
  id: string;
  subject: JeeSubject;
  title: string;
}

// JEE Main chapter taxonomy for custom tests. Tags live in
// public/custom/jee-chapter-map.json ({questionId: chapterId}), built by
// scripts/tag-jee-chapters.mjs over the solution-ready papers.
//
// Id prefixes (jphy-/jchem-/jmath-) are deliberately distinct from the NEET
// custom-test ids (phy-/chem-/bio-) so the two pools can never collide.
export const JEE_CUSTOM_CHAPTERS: JeeCustomChapter[] = [
  // ---------------- Physics (28) ----------------
  { id: 'jphy-units', subject: 'Physics', title: 'Units and Measurements' },
  { id: 'jphy-kinematics-1d', subject: 'Physics', title: 'Motion in a Straight Line' },
  { id: 'jphy-kinematics-2d', subject: 'Physics', title: 'Motion in a Plane' },
  { id: 'jphy-laws', subject: 'Physics', title: 'Laws of Motion' },
  { id: 'jphy-work', subject: 'Physics', title: 'Work, Energy and Power' },
  { id: 'jphy-rotational', subject: 'Physics', title: 'System of Particles and Rotational Motion' },
  { id: 'jphy-gravitation', subject: 'Physics', title: 'Gravitation' },
  { id: 'jphy-solids', subject: 'Physics', title: 'Mechanical Properties of Solids' },
  { id: 'jphy-fluids', subject: 'Physics', title: 'Mechanical Properties of Fluids' },
  { id: 'jphy-thermal', subject: 'Physics', title: 'Thermal Properties of Matter' },
  { id: 'jphy-thermodynamics', subject: 'Physics', title: 'Thermodynamics' },
  { id: 'jphy-ktg', subject: 'Physics', title: 'Kinetic Theory of Gases' },
  { id: 'jphy-oscillations', subject: 'Physics', title: 'Oscillations' },
  { id: 'jphy-waves', subject: 'Physics', title: 'Waves' },
  { id: 'jphy-em-waves', subject: 'Physics', title: 'Electromagnetic Waves' },
  { id: 'jphy-electrostatics-1', subject: 'Physics', title: 'Electric Charges and Fields' },
  { id: 'jphy-electrostatics-2', subject: 'Physics', title: 'Electrostatic Potential and Capacitance' },
  { id: 'jphy-current', subject: 'Physics', title: 'Current Electricity' },
  { id: 'jphy-magnetism', subject: 'Physics', title: 'Moving Charges and Magnetism' },
  { id: 'jphy-matter-magnetism', subject: 'Physics', title: 'Magnetism and Matter' },
  { id: 'jphy-emi', subject: 'Physics', title: 'Electromagnetic Induction' },
  { id: 'jphy-ac', subject: 'Physics', title: 'Alternating Current' },
  { id: 'jphy-ray', subject: 'Physics', title: 'Ray Optics and Optical Instruments' },
  { id: 'jphy-wave-optics', subject: 'Physics', title: 'Wave Optics' },
  { id: 'jphy-dual', subject: 'Physics', title: 'Dual Nature of Radiation and Matter' },
  { id: 'jphy-atoms', subject: 'Physics', title: 'Atoms' },
  { id: 'jphy-nuclei', subject: 'Physics', title: 'Nuclei' },
  { id: 'jphy-semiconductors', subject: 'Physics', title: 'Semiconductor Electronics' },
  // ---------------- Chemistry (22) ----------------
  { id: 'jchem-mole', subject: 'Chemistry', title: 'Some Basic Concepts of Chemistry' },
  { id: 'jchem-atom', subject: 'Chemistry', title: 'Structure of Atom' },
  { id: 'jchem-periodicity', subject: 'Chemistry', title: 'Classification of Elements and Periodicity' },
  { id: 'jchem-bonding', subject: 'Chemistry', title: 'Chemical Bonding and Molecular Structure' },
  { id: 'jchem-thermodynamics', subject: 'Chemistry', title: 'Thermodynamics' },
  { id: 'jchem-equilibrium', subject: 'Chemistry', title: 'Equilibrium' },
  { id: 'jchem-redox', subject: 'Chemistry', title: 'Redox Reactions' },
  { id: 'jchem-s-block', subject: 'Chemistry', title: 's-Block Elements' },
  { id: 'jchem-p-block', subject: 'Chemistry', title: 'p-Block Elements' },
  { id: 'jchem-df-metallurgy', subject: 'Chemistry', title: 'd and f Block Elements and Metallurgy' },
  { id: 'jchem-coordination', subject: 'Chemistry', title: 'Coordination Compounds' },
  { id: 'jchem-goc', subject: 'Chemistry', title: 'Organic Chemistry: Basic Principles, Isomerism and Nomenclature' },
  { id: 'jchem-hydrocarbons', subject: 'Chemistry', title: 'Hydrocarbons' },
  { id: 'jchem-haloalkanes-alcohols', subject: 'Chemistry', title: 'Haloalkanes, Alcohols, Phenols and Ethers' },
  { id: 'jchem-carbonyl', subject: 'Chemistry', title: 'Aldehydes, Ketones and Carboxylic Acids' },
  { id: 'jchem-amines', subject: 'Chemistry', title: 'Amines and Diazonium Salts' },
  { id: 'jchem-biomolecules-polymers', subject: 'Chemistry', title: 'Biomolecules and Polymers' },
  { id: 'jchem-electrochemistry', subject: 'Chemistry', title: 'Electrochemistry' },
  { id: 'jchem-kinetics', subject: 'Chemistry', title: 'Chemical Kinetics' },
  { id: 'jchem-solutions', subject: 'Chemistry', title: 'Solutions' },
  { id: 'jchem-practical', subject: 'Chemistry', title: 'Salt Analysis and Practical Chemistry' },
  { id: 'jchem-everyday', subject: 'Chemistry', title: 'Chemistry in Everyday Life' },
  // ---------------- Mathematics (16) ----------------
  { id: 'jmath-sets', subject: 'Mathematics', title: 'Sets, Relations and Functions' },
  { id: 'jmath-complex', subject: 'Mathematics', title: 'Complex Numbers and Quadratic Equations' },
  { id: 'jmath-matrices', subject: 'Mathematics', title: 'Matrices and Determinants' },
  { id: 'jmath-pnc', subject: 'Mathematics', title: 'Permutations and Combinations' },
  { id: 'jmath-binomial', subject: 'Mathematics', title: 'Binomial Theorem' },
  { id: 'jmath-sequences', subject: 'Mathematics', title: 'Sequences and Series' },
  { id: 'jmath-trigonometry', subject: 'Mathematics', title: 'Trigonometry and Inverse Trigonometric Functions' },
  { id: 'jmath-lcd', subject: 'Mathematics', title: 'Limits, Continuity and Differentiability' },
  { id: 'jmath-aod', subject: 'Mathematics', title: 'Applications of Derivatives' },
  { id: 'jmath-indefinite', subject: 'Mathematics', title: 'Indefinite Integration' },
  { id: 'jmath-definite', subject: 'Mathematics', title: 'Definite Integration and Area Under Curves' },
  { id: 'jmath-diffeq', subject: 'Mathematics', title: 'Differential Equations' },
  { id: 'jmath-lines-circles', subject: 'Mathematics', title: 'Straight Lines and Circles' },
  { id: 'jmath-conics', subject: 'Mathematics', title: 'Parabola, Ellipse and Hyperbola' },
  { id: 'jmath-vectors-3d', subject: 'Mathematics', title: 'Vectors and 3D Geometry' },
  { id: 'jmath-probability', subject: 'Mathematics', title: 'Probability and Statistics' },
];
