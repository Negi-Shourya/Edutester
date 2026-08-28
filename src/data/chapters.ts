import type { TestCardData } from '../types';
import type { ExamType } from '../lib/exam';

export interface ChapterTestData extends TestCardData {
  exam: ExamType;
}

export const TRIAL_CHAPTER_IDS = new Set<string>([
  // JEE
  'jee-phy-1', 'jee-phy-2',
  'jee-chem-1', 'jee-chem-2',
  'jee-math-1', 'jee-math-2',
  // NEET
  'neet-phy-1', 'neet-phy-2',
  'neet-chem-1', 'neet-chem-2',
  'neet-bio-1', 'neet-bio-2',
]);

export function isChapterTrial(chapterId: string): boolean {
  return TRIAL_CHAPTER_IDS.has(chapterId);
}

export const jeeChapterTests: ChapterTestData[] = [
  // Physics
  { id: 'jee-phy-1', title: 'Kinematics', subject: 'Physics', chapter: 'Kinematics', exam: 'jee', questions: 25, duration: 50, difficulty: 'Easy' },
  { id: 'jee-phy-2', title: 'Laws of Motion', subject: 'Physics', chapter: 'Laws of Motion', exam: 'jee', questions: 17, duration: 50, difficulty: 'Medium' },
  { id: 'jee-phy-3', title: 'Work, Energy & Power', subject: 'Physics', chapter: 'Work, Energy & Power', exam: 'jee', questions: 18, duration: 50, difficulty: 'Medium' },
  { id: 'jee-phy-4', title: 'Rotational Motion', subject: 'Physics', chapter: 'Rotational Motion', exam: 'jee', questions: 21, duration: 60, difficulty: 'Hard' },
  { id: 'jee-phy-5', title: 'Thermodynamics', subject: 'Physics', chapter: 'Thermodynamics', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },
  { id: 'jee-phy-6', title: 'Electrostatics', subject: 'Physics', chapter: 'Electrostatics', exam: 'jee', questions: 22, duration: 60, difficulty: 'Hard' },
  { id: 'jee-phy-7', title: 'Current Electricity', subject: 'Physics', chapter: 'Current Electricity', exam: 'jee', questions: 16, duration: 50, difficulty: 'Medium' },
  { id: 'jee-phy-8', title: 'Magnetism & Matter', subject: 'Physics', chapter: 'Magnetism & Matter', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },
  { id: 'jee-phy-9', title: 'Electromagnetic Induction & AC', subject: 'Physics', chapter: 'EMI & AC', exam: 'jee', questions: 15, duration: 60, difficulty: 'Hard' },
  { id: 'jee-phy-10', title: 'Modern Physics', subject: 'Physics', chapter: 'Modern Physics', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },

  // Chemistry
  { id: 'jee-chem-1', title: 'Some Basic Concepts', subject: 'Chemistry', chapter: 'Some Basic Concepts of Chemistry', exam: 'jee', questions: 25, duration: 50, difficulty: 'Easy' },
  { id: 'jee-chem-2', title: 'Atomic Structure', subject: 'Chemistry', chapter: 'Atomic Structure', exam: 'jee', questions: 19, duration: 50, difficulty: 'Medium' },
  { id: 'jee-chem-3', title: 'Chemical Bonding', subject: 'Chemistry', chapter: 'Chemical Bonding & Molecular Structure', exam: 'jee', questions: 15, duration: 60, difficulty: 'Hard' },
  { id: 'jee-chem-4', title: 'Thermodynamics', subject: 'Chemistry', chapter: 'Chemical Thermodynamics', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },
  { id: 'jee-chem-5', title: 'Equilibrium', subject: 'Chemistry', chapter: 'Equilibrium', exam: 'jee', questions: 25, duration: 60, difficulty: 'Hard' },
  { id: 'jee-chem-6', title: 'Hydrocarbons', subject: 'Chemistry', chapter: 'Hydrocarbons', exam: 'jee', questions: 19, duration: 50, difficulty: 'Easy' },
  { id: 'jee-chem-7', title: 'Coordination Compounds', subject: 'Chemistry', chapter: 'Coordination Compounds', exam: 'jee', questions: 15, duration: 60, difficulty: 'Hard' },
  { id: 'jee-chem-8', title: 'Aldehydes, Ketones & Carboxylic Acids', subject: 'Chemistry', chapter: 'Carbonyl Compounds', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },

  // Mathematics
  { id: 'jee-math-1', title: 'Sets, Relations & Functions', subject: 'Mathematics', chapter: 'Sets & Relations', exam: 'jee', questions: 25, duration: 50, difficulty: 'Easy' },
  { id: 'jee-math-2', title: 'Complex Numbers & Quadratics', subject: 'Mathematics', chapter: 'Complex Numbers', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },
  { id: 'jee-math-3', title: 'Matrices & Determinants', subject: 'Mathematics', chapter: 'Matrices & Determinants', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },
  { id: 'jee-math-4', title: 'Differential Calculus', subject: 'Mathematics', chapter: 'Differential Calculus', exam: 'jee', questions: 15, duration: 60, difficulty: 'Hard' },
  { id: 'jee-math-5', title: 'Integral Calculus', subject: 'Mathematics', chapter: 'Integral Calculus', exam: 'jee', questions: 25, duration: 60, difficulty: 'Hard' },
  { id: 'jee-math-6', title: 'Coordinate Geometry', subject: 'Mathematics', chapter: 'Coordinate Geometry', exam: 'jee', questions: 25, duration: 60, difficulty: 'Medium' },
  { id: 'jee-math-7', title: 'Vectors & 3D Geometry', subject: 'Mathematics', chapter: 'Vectors & 3D', exam: 'jee', questions: 15, duration: 50, difficulty: 'Medium' },
  { id: 'jee-math-8', title: 'Probability & Statistics', subject: 'Mathematics', chapter: 'Probability', exam: 'jee', questions: 20, duration: 50, difficulty: 'Medium' },
];

export const neetChapterTests: ChapterTestData[] = [
  // Physics
  { id: 'neet-phy-1', title: 'Units & Measurements', subject: 'Physics', chapter: 'Physical World & Measurement', exam: 'neet', questions: 25, duration: 35, difficulty: 'Easy' },
  { id: 'neet-phy-2', title: 'Kinematics', subject: 'Physics', chapter: 'Motion in a Straight Line & Plane', exam: 'neet', questions: 25, duration: 45, difficulty: 'Medium' },
  { id: 'neet-phy-3', title: 'Laws of Motion', subject: 'Physics', chapter: 'Laws of Motion', exam: 'neet', questions: 25, duration: 45, difficulty: 'Medium' },
  { id: 'neet-phy-4', title: 'Work, Energy & Power', subject: 'Physics', chapter: 'Work, Energy & Power', exam: 'neet', questions: 25, duration: 40, difficulty: 'Medium' },
  { id: 'neet-phy-5', title: 'Gravitation', subject: 'Physics', chapter: 'Gravitation', exam: 'neet', questions: 25, duration: 40, difficulty: 'Easy' },
  { id: 'neet-phy-6', title: 'Thermodynamics & Heat Transfer', subject: 'Physics', chapter: 'Thermal Physics', exam: 'neet', questions: 25, duration: 45, difficulty: 'Medium' },
  { id: 'neet-phy-7', title: 'Electrostatics & Potential', subject: 'Physics', chapter: 'Electrostatics', exam: 'neet', questions: 25, duration: 45, difficulty: 'Hard' },
  { id: 'neet-phy-8', title: 'Current Electricity', subject: 'Physics', chapter: 'Current Electricity', exam: 'neet', questions: 25, duration: 45, difficulty: 'Medium' },
  { id: 'neet-phy-9', title: 'Ray Optics & Optical Instruments', subject: 'Physics', chapter: 'Ray Optics', exam: 'neet', questions: 25, duration: 45, difficulty: 'Hard' },
  { id: 'neet-phy-10', title: 'Dual Nature & Modern Physics', subject: 'Physics', chapter: 'Modern Physics', exam: 'neet', questions: 25, duration: 35, difficulty: 'Easy' },

  // Chemistry
  { id: 'neet-chem-1', title: 'Basic Concepts of Chemistry', subject: 'Chemistry', chapter: 'Mole Concept & Stoichiometry', exam: 'neet', questions: 25, duration: 35, difficulty: 'Easy' },
  { id: 'neet-chem-2', title: 'Structure of Atom', subject: 'Chemistry', chapter: 'Atomic Structure', exam: 'neet', questions: 25, duration: 45, difficulty: 'Medium' },
  { id: 'neet-chem-3', title: 'Chemical Bonding', subject: 'Chemistry', chapter: 'Chemical Bonding & Molecular Structure', exam: 'neet', questions: 25, duration: 45, difficulty: 'Hard' },
  { id: 'neet-chem-4', title: 'Chemical Thermodynamics', subject: 'Chemistry', chapter: 'Thermodynamics', exam: 'neet', questions: 25, duration: 40, difficulty: 'Medium' },
  { id: 'neet-chem-5', title: 'Equilibrium (Physical & Chemical)', subject: 'Chemistry', chapter: 'Equilibrium', exam: 'neet', questions: 25, duration: 45, difficulty: 'Medium' },
  { id: 'neet-chem-6', title: 'Organic Chemistry Basics', subject: 'Chemistry', chapter: 'GOC & Hydrocarbons', exam: 'neet', questions: 24, duration: 45, difficulty: 'Medium' },
  { id: 'neet-chem-7', title: 'Biomolecules & Polymers', subject: 'Chemistry', chapter: 'Biomolecules', exam: 'neet', questions: 25, duration: 35, difficulty: 'Easy' },
  { id: 'neet-chem-8', title: 'Coordination & d-Block Elements', subject: 'Chemistry', chapter: 'Inorganic Chemistry', exam: 'neet', questions: 25, duration: 45, difficulty: 'Hard' },

  // Biology
  { id: 'neet-bio-1', title: 'Cell: The Unit of Life & Cell Cycle', subject: 'Biology', chapter: 'Cell Biology', exam: 'neet', questions: 25, duration: 40, difficulty: 'Easy' },
  { id: 'neet-bio-2', title: 'Diversity in the Living World', subject: 'Biology', chapter: 'Biological Classification & Plant/Animal Kingdom', exam: 'neet', questions: 25, duration: 40, difficulty: 'Easy' },
  { id: 'neet-bio-3', title: 'Structural Organisation in Plants & Animals', subject: 'Biology', chapter: 'Morphology & Anatomy', exam: 'neet', questions: 25, duration: 35, difficulty: 'Medium' },
  { id: 'neet-bio-4', title: 'Plant Physiology', subject: 'Biology', chapter: 'Photosynthesis & Respiration in Plants', exam: 'neet', questions: 25, duration: 45, difficulty: 'Hard' },
  { id: 'neet-bio-5', title: 'Human Physiology - Digestion & Respiration', subject: 'Biology', chapter: 'Human Physiology I', exam: 'neet', questions: 25, duration: 40, difficulty: 'Medium' },
  { id: 'neet-bio-6', title: 'Human Physiology - Circulation & Excretion', subject: 'Biology', chapter: 'Human Physiology II', exam: 'neet', questions: 25, duration: 40, difficulty: 'Medium' },
  { id: 'neet-bio-7', title: 'Principles of Inheritance & Variation', subject: 'Biology', chapter: 'Genetics I', exam: 'neet', questions: 25, duration: 45, difficulty: 'Hard' },
  { id: 'neet-bio-8', title: 'Molecular Basis of Inheritance', subject: 'Biology', chapter: 'Genetics II', exam: 'neet', questions: 25, duration: 45, difficulty: 'Hard' },
  { id: 'neet-bio-9', title: 'Biotechnology: Principles & Applications', subject: 'Biology', chapter: 'Biotechnology', exam: 'neet', questions: 25, duration: 35, difficulty: 'Medium' },
  { id: 'neet-bio-10', title: 'Ecology & Environment', subject: 'Biology', chapter: 'Ecology', exam: 'neet', questions: 25, duration: 40, difficulty: 'Easy' },
];

export const chapterTests: ChapterTestData[] = [...jeeChapterTests, ...neetChapterTests];

export const subjectsByExam: Record<ExamType, string[]> = {
  jee: ['Physics', 'Chemistry', 'Mathematics'],
  neet: ['Physics', 'Chemistry', 'Biology'],
};

export const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
