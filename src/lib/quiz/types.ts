export type QuizStep =
  | "intro"
  | "gender"
  | "goals"
  | "fit"
  | "bodytype"
  | "sizes"
  | "budget"
  | "comfort"
  | "jewelry"
  | "neutrals"
  | "lightness"
  | "contrast"
  | "prints"
  | "materials"
  | "occasions"
  | "brands"
  | "photo"
  | "review";

export type AnswerMap = {
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  goals?: ("werk" | "casual" | "avond" | "sport")[];
  fit?: "slim" | "straight" | "relaxed" | "oversizedTop_slimBottom";
  bodytype?: "rectangle" | "triangle" | "inverted_triangle" | "oval" | "hourglass" | "pear" | "apple";
  sizes?: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  comfort?: "structured" | "balanced" | "relaxed";
  jewelry?: "goud" | "zilver" | "beide";
  neutrals?: "warm" | "koel" | "neutraal";
  lightness?: "licht" | "medium" | "donker";
  contrast?: "laag" | "medium" | "hoog";
  prints?: "effen" | "subtiel" | "statement" | "geen";
  materials?: "mat" | "textuur" | "glans";
  occasions?: ("office" | "smartcasual" | "leisure")[];
  brands?: string[];
  photoDataUrl?: string | null;
  colorAnalysis?: {
    undertone: "warm" | "cool" | "neutral";
    skin_tone: string;
    hair_color: string;
    eye_color: string;
    seasonal_type: "spring" | "summer" | "autumn" | "winter";
    best_colors: string[];
    avoid_colors: string[];
    confidence: number;
    reasoning?: string;
  };
};

export type ColorProfile = {
  temperature: "warm" | "koel" | "neutraal";
  value: "licht" | "medium" | "donker";
  contrast: "laag" | "medium" | "hoog";
  chroma: "zacht" | "helder";
  season: "lente" | "zomer" | "herfst" | "winter";
  paletteName: string;
  notes: string[];
};

export type Archetype =
  | "Clean Minimal"
  | "Smart Casual"
  | "Sporty Sharp"
  | "Classic Soft";

export type QuizResult = {
  color: ColorProfile;
  archetype: Archetype;
};

export const LS_KEYS = {
  QUIZ_ANSWERS: "ff_quiz_answers",
  COLOR_PROFILE: "ff_color_profile",
  ARCHETYPE: "ff_style_archetype",
  RESULTS_TS: "ff_results_ts",
  QUIZ_COMPLETED: "ff_quiz_completed",
} as const;