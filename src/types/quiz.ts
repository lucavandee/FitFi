export interface QuizAnswers {
  gender?: string;
  /**
   * Kleurhelderheid en contrast uit de quiz. Deze twee stonden wel in
   * quizSteps.ts en worden echt uitgelezen in styleProfileGenerator.ts
   * (regel 189-190), maar ontbraken hier, waardoor de stapdefinities niet
   * typechecken tegen keyof QuizAnswers.
   */
  lightness?: string;
  contrast?: string;
  stylePreferences: string[];
  baseColors: string;
  bodyType: string;
  occasions: string[];
  neutrals?: string | string[];
  budget?: { min: number; max: number };
  budgetRange?: number;
  brandPreferences?: string[];
  sizes?: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
  };
  photoUrl?: string;
  colorAnalysis?: any;
  fit?: string;
  materials?: string[];
  goals?: string[];
  prints?: string;
}

export interface QuizStep {
  id: number;
  title: string;
  description: string;
  field: keyof QuizAnswers;
  type: 'checkbox' | 'radio' | 'select' | 'multiselect' | 'slider' | 'budget-range' | 'sizes' | 'photo';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
  helperText?: string;
  sizeFields?: Array<{
    name: string;
    label: string;
    options: string[];
  }>;
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