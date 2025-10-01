// /src/lib/quiz/types.ts
export type QuizStep =
  | "intro"
  | "goals"
  | "fit"
  | "comfort"
  | "jewelry"
  | "neutrals"
  | "lightness"
  | "contrast"
  | "prints"
  | "materials"
  | "occasions"
  | "photo"
  | "review";

export type AnswerMap = {
  goals?: ("werk" | "casual" | "avond" | "sport")[];
  fit?: "slim" | "straight" | "relaxed" | "oversizedTop_slimBottom";
  comfort?: "structured" | "balanced" | "relaxed";
  jewelry?: "goud" | "zilver" | "beide";
  neutrals?: "warm" | "koel" | "neutraal";
  lightness?: "licht" | "medium" | "donker";
  contrast?: "laag" | "medium" | "hoog";
  prints?: "effen" | "subtiel" | "statement" | "geen";
  materials?: "mat" | "textuur" | "glans";
  occasions?: ("office" | "smartcasual" | "leisure")[];
  // client-only foto
  photoDataUrl?: string | null;
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