export type QuestionType = 'mcq' | 'numerical';
export type SubSectionType = 'Section A' | 'Section B';

export interface QuestionOption {
  label: string; // 'A', 'B', 'C', 'D' or '1', '2', '3', '4'
  text: string;
}

export interface Question {
  id: number;
  number: number;
  section: string; // 'Physics', 'Chemistry', 'Mathematics'
  subSection?: SubSectionType; // 'Section A' (MCQs) or 'Section B' (Numerical)
  type?: QuestionType;
  text: string;
  options: QuestionOption[];
  correctAnswer?: string;
  solution?: string;
  marks?: number;
  negativeMarks?: number;
}

export type QuestionStatus =
  | 'not-visited'
  | 'not-answered'
  | 'answered'
  | 'marked'
  | 'answered-marked';

export interface QuestionState {
  id: number;
  status: QuestionStatus;
  selectedOption?: string;
  numericAnswer?: string;
}

export interface TestConfig {
  id: string;
  title: string;
  type: 'chapter' | 'paper';
  subject?: string;
  chapter?: string;
  year?: number;
  duration: number;
  totalQuestions: number;
  sections: { name: string; questions: number }[];
}

export interface PricingPlan {
  id: string;
  duration: string;
  price: number;
  pricePerMonth: number;
  popular?: boolean;
  features: string[];
}

export interface TestCardData {
  id: string;
  title: string;
  subject?: string;
  chapter?: string;
  year?: number;
  questions: number;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed?: boolean;
  score?: number;
}
