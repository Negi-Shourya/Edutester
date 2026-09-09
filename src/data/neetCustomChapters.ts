export type NeetSubject = 'Physics' | 'Chemistry' | 'Biology';

export interface NeetCustomChapter {
  id: string;
  subject: NeetSubject;
  title: string;
  // Deleted from the rationalized NEET-UG syllabus. Shown in the builder
  // with a red OUT OF SYLLABUS tag, but still selectable — the pool holds
  // real past-paper questions on them.
  outOfSyllabus?: boolean;
}

// Full NCERT chapter taxonomy (rationalized NEET-UG syllabus + the deleted
// chapters NEET still asks: p-Block, Practical Chemistry). These ids are the
// topic options in the Custom Test builder and the target tags of the
// paper-by-paper audit (public/custom/neet-chapter-map.json).
export const NEET_CUSTOM_CHAPTERS: NeetCustomChapter[] = [
  // ---------------- Physics (28) ----------------
  { id: 'phy-units', subject: 'Physics', title: 'Units and Measurements' },
  { id: 'phy-kinematics-1d', subject: 'Physics', title: 'Motion in a Straight Line' },
  { id: 'phy-kinematics-2d', subject: 'Physics', title: 'Motion in a Plane' },
  { id: 'phy-laws', subject: 'Physics', title: 'Laws of Motion' },
  { id: 'phy-work', subject: 'Physics', title: 'Work, Energy and Power' },
  { id: 'phy-rotational', subject: 'Physics', title: 'System of Particles and Rotational Motion' },
  { id: 'phy-gravitation', subject: 'Physics', title: 'Gravitation' },
  { id: 'phy-solids', subject: 'Physics', title: 'Mechanical Properties of Solids' },
  { id: 'phy-fluids', subject: 'Physics', title: 'Mechanical Properties of Fluids' },
  { id: 'phy-thermal', subject: 'Physics', title: 'Thermal Properties of Matter' },
  { id: 'phy-thermodynamics', subject: 'Physics', title: 'Thermodynamics' },
  { id: 'phy-ktg', subject: 'Physics', title: 'Kinetic Theory of Gases' },
  { id: 'phy-oscillations', subject: 'Physics', title: 'Oscillations' },
  { id: 'phy-waves', subject: 'Physics', title: 'Waves' },
  { id: 'phy-em-waves', subject: 'Physics', title: 'Electromagnetic Waves' },
  { id: 'phy-electrostatics-1', subject: 'Physics', title: 'Electric Charges and Fields' },
  { id: 'phy-electrostatics-2', subject: 'Physics', title: 'Electrostatic Potential and Capacitance' },
  { id: 'phy-current', subject: 'Physics', title: 'Current Electricity' },
  { id: 'phy-magnetism', subject: 'Physics', title: 'Moving Charges and Magnetism' },
  { id: 'phy-matter-magnetism', subject: 'Physics', title: 'Magnetism and Matter' },
  { id: 'phy-emi', subject: 'Physics', title: 'Electromagnetic Induction' },
  { id: 'phy-ac', subject: 'Physics', title: 'Alternating Current' },
  { id: 'phy-ray', subject: 'Physics', title: 'Ray Optics and Optical Instruments' },
  { id: 'phy-wave-optics', subject: 'Physics', title: 'Wave Optics' },
  { id: 'phy-dual', subject: 'Physics', title: 'Dual Nature of Radiation and Matter' },
  { id: 'phy-atoms', subject: 'Physics', title: 'Atoms' },
  { id: 'phy-nuclei', subject: 'Physics', title: 'Nuclei' },
  { id: 'phy-semiconductors', subject: 'Physics', title: 'Semiconductor Electronics' },
  // ---------------- Chemistry (21) ----------------
  { id: 'chem-mole', subject: 'Chemistry', title: 'Some Basic Concepts of Chemistry' },
  { id: 'chem-atom', subject: 'Chemistry', title: 'Structure of Atom' },
  { id: 'chem-periodicity', subject: 'Chemistry', title: 'Classification of Elements and Periodicity' },
  { id: 'chem-bonding', subject: 'Chemistry', title: 'Chemical Bonding and Molecular Structure' },
  { id: 'chem-thermodynamics', subject: 'Chemistry', title: 'Thermodynamics' },
  { id: 'chem-equilibrium', subject: 'Chemistry', title: 'Equilibrium' },
  { id: 'chem-redox', subject: 'Chemistry', title: 'Redox Reactions' },
  { id: 'chem-p-block', subject: 'Chemistry', title: 'p-Block Elements' },
  { id: 'chem-df', subject: 'Chemistry', title: 'd and f Block Elements' },
  { id: 'chem-coordination', subject: 'Chemistry', title: 'Coordination Compounds' },
  { id: 'chem-goc', subject: 'Chemistry', title: 'Organic Chemistry: Basic Principles and Techniques' },
  { id: 'chem-hydrocarbons', subject: 'Chemistry', title: 'Hydrocarbons' },
  { id: 'chem-haloalkanes', subject: 'Chemistry', title: 'Haloalkanes and Haloarenes' },
  { id: 'chem-alcohols', subject: 'Chemistry', title: 'Alcohols, Phenols and Ethers' },
  { id: 'chem-carbonyl', subject: 'Chemistry', title: 'Aldehydes, Ketones and Carboxylic Acids' },
  { id: 'chem-amines', subject: 'Chemistry', title: 'Amines' },
  { id: 'chem-biomolecules', subject: 'Chemistry', title: 'Biomolecules' },
  { id: 'chem-solutions', subject: 'Chemistry', title: 'Solutions' },
  { id: 'chem-electrochem', subject: 'Chemistry', title: 'Electrochemistry' },
  { id: 'chem-kinetics', subject: 'Chemistry', title: 'Chemical Kinetics' },
  { id: 'chem-practical', subject: 'Chemistry', title: 'Principles Related to Practical Chemistry' },
  // ---------------- Deleted Chemistry chapters (OUT OF SYLLABUS) ----------------
  // Physics has none — every Physics chapter above is in the syllabus.
  { id: 'chem-states-of-matter', subject: 'Chemistry', title: 'States of Matter: Gases and Liquids', outOfSyllabus: true },
  { id: 'chem-hydrogen', subject: 'Chemistry', title: 'Hydrogen', outOfSyllabus: true },
  { id: 'chem-s-block', subject: 'Chemistry', title: 'The s-Block Elements', outOfSyllabus: true },
  { id: 'chem-solid-state', subject: 'Chemistry', title: 'The Solid State', outOfSyllabus: true },
  { id: 'chem-surface-chemistry', subject: 'Chemistry', title: 'Surface Chemistry', outOfSyllabus: true },
  { id: 'chem-metallurgy', subject: 'Chemistry', title: 'General Principles and Processes of Isolation of Metals', outOfSyllabus: true },
  { id: 'chem-polymers', subject: 'Chemistry', title: 'Polymers', outOfSyllabus: true },
  { id: 'chem-everyday-life', subject: 'Chemistry', title: 'Chemistry in Everyday Life', outOfSyllabus: true },
  { id: 'chem-environmental', subject: 'Chemistry', title: 'Environmental Chemistry', outOfSyllabus: true },
  // ---------------- Biology (33) ----------------
  { id: 'bio-living-world', subject: 'Biology', title: 'The Living World' },
  { id: 'bio-classification', subject: 'Biology', title: 'Biological Classification' },
  { id: 'bio-plant-kingdom', subject: 'Biology', title: 'Plant Kingdom' },
  { id: 'bio-animal-kingdom', subject: 'Biology', title: 'Animal Kingdom' },
  { id: 'bio-morphology', subject: 'Biology', title: 'Morphology of Flowering Plants' },
  { id: 'bio-anatomy', subject: 'Biology', title: 'Anatomy of Flowering Plants' },
  { id: 'bio-structural-animals', subject: 'Biology', title: 'Structural Organisation in Animals' },
  { id: 'bio-cell', subject: 'Biology', title: 'Cell: The Unit of Life' },
  { id: 'bio-cell-cycle', subject: 'Biology', title: 'Cell Cycle and Cell Division' },
  { id: 'bio-biomolecules', subject: 'Biology', title: 'Biomolecules' },
  { id: 'bio-photosynthesis', subject: 'Biology', title: 'Photosynthesis in Higher Plants' },
  { id: 'bio-respiration-plants', subject: 'Biology', title: 'Respiration in Plants' },
  { id: 'bio-growth', subject: 'Biology', title: 'Plant Growth and Development' },
  { id: 'bio-digestion', subject: 'Biology', title: 'Digestion and Absorption' },
  { id: 'bio-breathing', subject: 'Biology', title: 'Breathing and Exchange of Gases' },
  { id: 'bio-circulation', subject: 'Biology', title: 'Body Fluids and Circulation' },
  { id: 'bio-excretion', subject: 'Biology', title: 'Excretory Products and their Elimination' },
  { id: 'bio-movement', subject: 'Biology', title: 'Locomotion and Movement' },
  { id: 'bio-neural', subject: 'Biology', title: 'Neural Control and Coordination' },
  { id: 'bio-chemical-coordination', subject: 'Biology', title: 'Chemical Coordination and Integration' },
  { id: 'bio-reproduction-flowering', subject: 'Biology', title: 'Sexual Reproduction in Flowering Plants' },
  { id: 'bio-reproduction-human', subject: 'Biology', title: 'Human Reproduction' },
  { id: 'bio-reproductive-health', subject: 'Biology', title: 'Reproductive Health' },
  { id: 'bio-inheritance', subject: 'Biology', title: 'Principles of Inheritance and Variation' },
  { id: 'bio-molecular', subject: 'Biology', title: 'Molecular Basis of Inheritance' },
  { id: 'bio-evolution', subject: 'Biology', title: 'Evolution' },
  { id: 'bio-health', subject: 'Biology', title: 'Human Health and Disease' },
  { id: 'bio-microbes', subject: 'Biology', title: 'Microbes in Human Welfare' },
  { id: 'bio-biotech-principles', subject: 'Biology', title: 'Biotechnology: Principles and Processes' },
  { id: 'bio-biotech-applications', subject: 'Biology', title: 'Biotechnology and its Applications' },
  { id: 'bio-ecology-organisms', subject: 'Biology', title: 'Organisms and Populations' },
  { id: 'bio-ecosystem', subject: 'Biology', title: 'Ecosystem' },
  { id: 'bio-biodiversity', subject: 'Biology', title: 'Biodiversity and Conservation' },
  // ---------------- Deleted Biology chapters (OUT OF SYLLABUS) ----------------
  { id: 'bio-reproduction-organisms', subject: 'Biology', title: 'Reproduction in Organisms', outOfSyllabus: true },
  { id: 'bio-strategies-enhancement', subject: 'Biology', title: 'Strategies for Enhancement in Food Production', outOfSyllabus: true },
];

export const NEET_CUSTOM_SUBJECTS: NeetSubject[] = ['Physics', 'Chemistry', 'Biology'];

export function chaptersOfSubject(subject: NeetSubject): NeetCustomChapter[] {
  return NEET_CUSTOM_CHAPTERS.filter((c) => c.subject === subject);
}

export function chapterTitle(chapterId: string): string {
  return NEET_CUSTOM_CHAPTERS.find((c) => c.id === chapterId)?.title ?? chapterId;
}
