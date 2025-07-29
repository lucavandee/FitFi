export interface QuizAnswers {
  stylePreferences: string[];
  baseColors: string;
  bodyType: string;
  occasions: string[];
  budgetRange: number;
}

export interface QuizStep {
  id: number;
  title: string;
  description: string;
  field: keyof QuizAnswers;
  type: 'checkbox' | 'radio' | 'select' | 'multiselect' | 'slider';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

export interface QuizProgress {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  answers: Partial<QuizAnswers>;
}

export interface QuizSubmission {
  id: string;
  user_id: string;
  answers: QuizAnswers;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}