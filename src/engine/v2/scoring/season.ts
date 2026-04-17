import type { ScoredProduct, Season } from '../types';

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

const SEASON_MATERIAL_WEIGHTS: Record<Season, Record<string, number>> = {
  spring: {
    katoen: 1.0,
    linnen: 0.95,
    denim: 0.85,
    viscose: 0.8,
    wol: 0.4,
    fleece: 0.2,
    tech: 0.5,
    leer: 0.5,
  },
  summer: {
    linnen: 1.0,
    katoen: 0.95,
    viscose: 0.9,
    denim: 0.6,
    tech: 0.7,
    wol: 0.1,
    fleece: 0.05,
    leer: 0.3,
    kasjmier: 0.1,
  },
  autumn: {
    wol: 0.95,
    denim: 0.9,
    katoen: 0.8,
    leer: 0.9,
    fleece: 0.7,
    kasjmier: 0.95,
    tech: 0.6,
    linnen: 0.4,
  },
  winter: {
    wol: 1.0,
    kasjmier: 1.0,
    fleece: 0.95,
    leer: 0.9,
    denim: 0.75,
    katoen: 0.7,
    tech: 0.75,
    linnen: 0.1,
  },
};

const SEASON_OUTERWEAR_WEIGHT: Record<Season, number> = {
  spring: 0.4,
  summer: 0.1,
  autumn: 0.6,
  winter: 0.9,
};

export function scoreSeason(
  product: ScoredProduct,
  season: Season
): { score: number; reason: string } {
  const materials = product.materialTags.map((m) => m.toLowerCase());
  const materialWeights = SEASON_MATERIAL_WEIGHTS[season];

  let bestMaterial = 0.5;
  for (const m of materials) {
    const w = materialWeights[m];
    if (typeof w === 'number' && w > bestMaterial) bestMaterial = w;
  }

  if (materials.length === 0) bestMaterial = 0.6;

  let categoryBonus = 1;
  if (product.category === 'outerwear') {
    const w = SEASON_OUTERWEAR_WEIGHT[season];
    categoryBonus = 0.6 + w * 0.4;
  }

  const text = `${product.product.name ?? ''} ${product.product.description ?? ''}`.toLowerCase();
  let keywordBonus = 0;
  const warmWords = ['warm', 'winter', 'gewatteerd', 'pluche', 'sherpa'];
  const lightWords = ['licht', 'zomer', 'luchtig', 'ademend', 'linen', 'mesh'];
  if (season === 'winter' || season === 'autumn') {
    if (warmWords.some((w) => text.includes(w))) keywordBonus = 0.08;
    if (lightWords.some((w) => text.includes(w))) keywordBonus = -0.05;
  } else {
    if (lightWords.some((w) => text.includes(w))) keywordBonus = 0.08;
    if (warmWords.some((w) => text.includes(w))) keywordBonus = -0.05;
  }

  const combined = Math.max(
    0,
    Math.min(1, bestMaterial * categoryBonus + keywordBonus)
  );
  return {
    score: combined,
    reason:
      combined > 0.8
        ? 'season_strong'
        : combined > 0.55
        ? 'season_ok'
        : 'season_weak',
  };
}
