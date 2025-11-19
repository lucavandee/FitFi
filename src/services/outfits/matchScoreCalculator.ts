import type { StyleProfile } from '@/engine/types';

interface OutfitMatchInput {
  outfit: {
    items?: any[];
    style?: string;
    colors?: string[];
    occasion?: string;
    season?: string;
  };
  userProfile: {
    archetype?: string;
    colorPalette?: string[];
    preferences?: {
      styles?: string[];
      occasions?: string[];
    };
  };
  currentSeason?: string;
}

interface MatchScoreBreakdown {
  total: number;
  archetype: number;
  color: number;
  style: number;
  season: number;
  occasion: number;
}

const SEASONS = ['winter', 'spring', 'summer', 'fall', 'autumn'] as const;
const CURRENT_SEASON = getCurrentSeason();

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function normalizeColor(color: string): string {
  return color.toLowerCase().trim().replace(/[^a-z]/g, '');
}

function calculateColorMatch(
  outfitColors: string[] = [],
  userColors: string[] = []
): number {
  if (outfitColors.length === 0 || userColors.length === 0) return 0.5;

  const normalizedOutfit = outfitColors.map(normalizeColor);
  const normalizedUser = userColors.map(normalizeColor);

  let matches = 0;
  let partialMatches = 0;

  for (const outfitColor of normalizedOutfit) {
    if (normalizedUser.includes(outfitColor)) {
      matches++;
    } else {
      const partial = normalizedUser.some(userColor =>
        outfitColor.includes(userColor) || userColor.includes(outfitColor)
      );
      if (partial) partialMatches++;
    }
  }

  const exactScore = matches / normalizedOutfit.length;
  const partialScore = (partialMatches / normalizedOutfit.length) * 0.5;

  return Math.min(1, exactScore + partialScore);
}

function calculateArchetypeMatch(
  outfitStyle: string = '',
  userArchetype: string = ''
): number {
  if (!outfitStyle || !userArchetype) return 0.5;

  const style = outfitStyle.toLowerCase();
  const archetype = userArchetype.toLowerCase();

  const archetypeStyleMap: Record<string, string[]> = {
    klassiek: ['classic', 'formal', 'elegant', 'timeless', 'professional'],
    modern: ['modern', 'contemporary', 'sleek', 'minimal', 'urban'],
    sportief: ['sporty', 'athletic', 'casual', 'active', 'comfortable'],
    romantisch: ['romantic', 'feminine', 'soft', 'flowing', 'delicate'],
    casual: ['casual', 'relaxed', 'comfortable', 'everyday', 'laid-back'],
    edgy: ['edgy', 'bold', 'statement', 'alternative', 'daring'],
    bohemian: ['bohemian', 'boho', 'eclectic', 'artistic', 'free-spirited']
  };

  const matchingStyles = archetypeStyleMap[archetype] || [];
  const directMatch = matchingStyles.some(s => style.includes(s));

  if (directMatch) return 1.0;

  const fuzzyMatch = matchingStyles.some(s =>
    s.substring(0, 4) === style.substring(0, 4)
  );
  if (fuzzyMatch) return 0.7;

  return 0.3;
}

function calculateSeasonMatch(
  outfitSeason: string = '',
  currentSeason: string = CURRENT_SEASON
): number {
  if (!outfitSeason) return 0.8;

  const season = outfitSeason.toLowerCase();
  const current = currentSeason.toLowerCase();

  if (season === current) return 1.0;
  if (season === 'all-season' || season === 'transitional') return 0.9;

  const seasonalCompatibility: Record<string, string[]> = {
    winter: ['fall', 'autumn'],
    spring: ['summer'],
    summer: ['spring'],
    fall: ['winter'],
    autumn: ['winter']
  };

  const compatible = seasonalCompatibility[current] || [];
  if (compatible.includes(season)) return 0.6;

  return 0.3;
}

function calculateStyleConsistency(items: any[] = []): number {
  if (items.length < 2) return 0.8;

  const styles = items.map(item => item.style?.toLowerCase() || '').filter(Boolean);
  if (styles.length === 0) return 0.8;

  const uniqueStyles = new Set(styles);

  if (uniqueStyles.size === 1) return 1.0;
  if (uniqueStyles.size === 2) return 0.85;
  if (uniqueStyles.size === 3) return 0.65;

  return 0.4;
}

export function calculateMatchScore(input: OutfitMatchInput): MatchScoreBreakdown {
  const { outfit, userProfile, currentSeason = CURRENT_SEASON } = input;

  const weights = {
    archetype: 0.30,
    color: 0.35,
    style: 0.20,
    season: 0.10,
    occasion: 0.05
  };

  const archetypeScore = calculateArchetypeMatch(
    outfit.style,
    userProfile.archetype
  );

  const colorScore = calculateColorMatch(
    outfit.colors,
    userProfile.colorPalette
  );

  const styleScore = calculateStyleConsistency(outfit.items);

  const seasonScore = calculateSeasonMatch(
    outfit.season,
    currentSeason
  );

  const occasionScore = 0.8;

  const weightedTotal =
    (archetypeScore * weights.archetype) +
    (colorScore * weights.color) +
    (styleScore * weights.style) +
    (seasonScore * weights.season) +
    (occasionScore * weights.occasion);

  const finalScore = Math.round(weightedTotal * 100);

  return {
    total: Math.max(70, Math.min(98, finalScore)),
    archetype: Math.round(archetypeScore * 100),
    color: Math.round(colorScore * 100),
    style: Math.round(styleScore * 100),
    season: Math.round(seasonScore * 100),
    occasion: Math.round(occasionScore * 100)
  };
}

export function getMatchScoreInsight(breakdown: MatchScoreBreakdown): string {
  const { total, archetype, color } = breakdown;

  if (total >= 95) return "Perfect match met jouw stijl!";
  if (total >= 90) return "Uitstekende keuze voor jou";
  if (total >= 85) return "Past goed bij je profiel";
  if (total >= 80) return "Goede match";

  if (color < 70) return "Overweeg andere kleuren";
  if (archetype < 70) return "Niet helemaal jouw stijl";

  return "Experimentele keuze";
}

export function explainMatchScore(breakdown: MatchScoreBreakdown): string[] {
  const explanations: string[] = [];

  if (breakdown.color >= 90) {
    explanations.push("✓ Perfecte kleurcombinatie voor jou");
  } else if (breakdown.color < 70) {
    explanations.push("⚠ Kleuren matchen niet optimaal");
  }

  if (breakdown.archetype >= 90) {
    explanations.push("✓ Past perfect bij jouw stijl DNA");
  } else if (breakdown.archetype < 70) {
    explanations.push("⚠ Anders dan je gebruikelijke stijl");
  }

  if (breakdown.season >= 90) {
    explanations.push("✓ Perfect voor dit seizoen");
  } else if (breakdown.season < 60) {
    explanations.push("⚠ Beter geschikt voor ander seizoen");
  }

  return explanations;
}
