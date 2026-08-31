export type QuestionType = 'mcq' | 'numerical';
export type SubSectionType = 'Section A' | 'Section B';

export interface QuestionOption {
  label: string; // 'A', 'B', 'C', 'D' or '1', '2', '3', '4'
  text: string;
  figureUrl?: string; // NEET options rendered as images
}

export interface Question {
  id: number;
  number: number;
  section: string; // 'Physics', 'Chemistry', 'Mathematics'
  subSection?: SubSectionType; // 'Section A' (MCQs) or 'Section B' (Numerical)
  type?: QuestionType;
  text: string;
  options: QuestionOption[];
  // Correct answers and solutions are NOT shipped with the question data —
  // they come from the score-attempt edge function after submission.
  marks?: number;
  negativeMarks?: number;
  figureUrl?: string[];
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
  months: number;
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

export interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  consent_version?: string | null;
  consented_at?: string | null;
  last_entry_time?: string | null;
}

export interface AdminConsentRecord {
  id: string;
  user_id: string;
  email: string | null;
  consent_type: string;
  consent_version: string;
  consented_at: string;
  entry_time: string;
  exam_track: string;
  user_agent: string | null;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  age_declaration: boolean;
  created_at: string;
}

export interface AdminEntryLog {
  id: string;
  user_id: string | null;
  email: string | null;
  entry_type: string;
  entry_time: string;
  path: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminPurchase {
  id: string;
  user_id: string;
  email: string | null;
  plan_id: string;
  plan_name: string;
  amount: number; // paise
  status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface AdminCancellation {
  id: string;
  subscription_id: string;
  user_id: string;
  email: string | null;
  plan_id: string;
  plan_name: string;
  amount: number; // paise
  cancelled_at: string;
  cancelled_by: string;
}

export interface PageView {
  id: string;
  path: string;
  user_id: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  amount: number; // paise
  status: 'active' | 'expired' | 'cancelled';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
}
