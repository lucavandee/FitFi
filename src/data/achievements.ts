import { Achievement } from "../types/achievements";

export const achievements: Achievement[] = [
  {
    id: "style_explorer",
    title: "Stijl Ontdekker",
    description: "Eerste quiz voltooid en stijlprofiel ontdekt",
    icon: "🔍",
    type: "style_explorer",
    rarity: "common",
    condition: (_answers) => !!_answers && Object.keys(_answers).length >= 5,
  },
  {
    id: "color_master",
    title: "Kleur Meester",
    description: "Perfect kleurpalet gekozen voor jouw huidtoon",
    icon: "🎨",
    type: "color_master",
    rarity: "rare",
    condition: (_answers) =>
      _answers?.baseColors &&
      ["neutral", "jewel"].includes(_answers.baseColors),
  },
  {
    id: "speed_demon",
    title: "Snelle Beslisser",
    description: "Quiz voltooid in minder dan 2 minuten",
    icon: "⚡",
    type: "completion_speed",
    rarity: "epic",
    condition: (_answers, metadata) =>
      metadata?.completionTime && metadata.completionTime < 120000,
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Alle vragen beantwoord met maximale zorgvuldigheid",
    icon: "💎",
    type: "perfectionist",
    rarity: "legendary",
    condition: (_answers) => {
      return (
        _answers?.stylePreferences?.length >= 3 &&
        _answers?.occasions?.length >= 4 &&
        _answers?.budgetRange >= 100
      );
    },
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Stijlprofiel gedeeld op social media",
    icon: "🦋",
    type: "social_sharer",
    rarity: "rare",
    condition: (_answers, metadata) => metadata?.shared === true,
  },
  {
    id: "trendsetter",
    title: "Trendsetter",
    description: "Unieke stijlcombinatie ontdekt",
    icon: "✨",
    type: "style_explorer",
    rarity: "epic",
    condition: (_answers) => {
      const styles = _answers?.stylePreferences || [];
      return styles.includes("edgy") && styles.includes("romantic");
    },
  },
];

export const getEarnedAchievements = (
  _answers: any,
  metadata: any = {},
): Achievement[] => {
  return achievements.filter((achievement) =>
    achievement.condition(_answers, metadata),
  );
};

const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find((achievement) => achievement.id === id);
};
