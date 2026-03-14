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

// P1.5 audit: velden gemarkeerd met hun status ten opzichte van de quiz.
// Velden worden NIET verwijderd om backwards compatibility te behouden
// met bestaande profielen in localStorage en Supabase.
export type AnswerMap = {
  // === Actief in quiz (quizSteps.ts) ===
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  stylePreferences?: string[];
  neutrals?: "warm" | "koel" | "neutraal";
  lightness?: "licht" | "medium" | "donker";
  contrast?: "laag" | "medium" | "hoog";
  fit?: string;
  occasions?: string[];
  goals?: string[];
  prints?: string;
  materials?: string | string[];
  sizes?: {
    tops?: string;
    bottoms?: string;
    shoes?: string;
  };
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

  // === Niet in quiz, maar gebruikt door engine/services ===
  budget?: { min: number; max: number }; // recommendationEngine leest dit
  comfort?: string;                       // generateOutfits leest dit

  // === Niet in quiz, niet actief in scoring — behouden voor legacy profielen ===
  bodytype?: string;                      // niet gebruikt in scoring
  jewelry?: "goud" | "zilver" | "beide";  // P1.3: verwijderd uit decideTemperature()
  brands?: string[];                      // alleen in productFiltering, niet in scoring

  [key: string]: any;
};

// P2.4: subSeason toegevoegd voor 12 sub-seizoenspaletten (ipv 4).
// Het veld is optioneel voor backwards compatibility met bestaande profielen.
export type SubSeason =
  | "licht-lente" | "warm-lente" | "helder-lente"
  | "licht-zomer" | "koel-zomer" | "zacht-zomer"
  | "zacht-herfst" | "warm-herfst" | "diep-herfst"
  | "koel-winter" | "diep-winter" | "helder-winter";

export type ColorProfile = {
  temperature: "warm" | "koel" | "neutraal";
  value: "licht" | "medium" | "donker";
  contrast: "laag" | "medium" | "hoog";
  chroma: "zacht" | "helder" | "gedurfd" | "gemiddeld";
  season: "lente" | "zomer" | "herfst" | "winter";
  subSeason?: SubSeason;
  paletteName: string;
  notes: string[];
};

export type Archetype =
  | "Clean Minimal"
  | "Smart Casual"
  | "Sporty Sharp"
  | "Classic Soft"
  | "MINIMALIST"
  | "CLASSIC"
  | "SMART_CASUAL"
  | "STREETWEAR"
  | "ATHLETIC"
  | "AVANT_GARDE";

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