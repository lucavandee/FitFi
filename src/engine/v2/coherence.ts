import { calculateOutfitColorHarmony } from '../colorHarmony';
import type { ArchetypeKey } from '@/config/archetypes';
import type { OutfitCandidate, ScoredProduct, UserStyleProfile } from './types';

export interface CoherenceScores {
  colorHarmony: number;
  formalitySpread: number;
  archetypeCoherence: number;
  completeness: number;
  combined: number;
  reasons: string[];
}

export function evaluateCoherence(products: ScoredProduct[]): CoherenceScores {
  const reasons: string[] = [];
  if (products.length === 0) {
    return {
      colorHarmony: 0,
      formalitySpread: 0,
      archetypeCoherence: 0,
      completeness: 0,
      combined: 0,
      reasons: ['empty_outfit'],
    };
  }

  const productColors = products.map((p) =>
    p.colorTags.length > 0
      ? p.colorTags
      : (p.product.colors ?? []).map((c) => c.toLowerCase())
  );
  const colorHarmony = calculateOutfitColorHarmony(productColors);
  if (colorHarmony > 0.8) reasons.push('color_harmony_strong');
  else if (colorHarmony < 0.45) reasons.push('color_harmony_weak');

  const formalities = products.map((p) => p.formality);
  const minF = Math.min(...formalities);
  const maxF = Math.max(...formalities);
  const spread = maxF - minF;
  let formalitySpread = 1;
  if (spread > 0.55) formalitySpread = 0.35;
  else if (spread > 0.4) formalitySpread = 0.6;
  else if (spread > 0.25) formalitySpread = 0.85;
  if (spread < 0.25) reasons.push('formality_coherent');
  if (spread > 0.45) reasons.push('formality_mismatch');

  const archetypeTotals: Record<string, number> = {};
  for (const p of products) {
    for (const [key, score] of Object.entries(p.archetypeFit)) {
      archetypeTotals[key] = (archetypeTotals[key] ?? 0) + (score ?? 0);
    }
  }
  const totalArchetypeSum = Object.values(archetypeTotals).reduce(
    (a, b) => a + b,
    0
  );
  let archetypeCoherence = 0.6;
  if (totalArchetypeSum > 0) {
    const top = Math.max(...Object.values(archetypeTotals));
    archetypeCoherence = top / totalArchetypeSum;
    if (archetypeCoherence > 0.45) reasons.push('archetype_coherent');
  }

  const hasTop = products.some((p) => p.category === 'top' || p.category === 'dress' || p.category === 'jumpsuit');
  const hasBottom = products.some(
    (p) =>
      p.category === 'bottom' ||
      p.category === 'dress' ||
      p.category === 'jumpsuit'
  );
  const hasFootwear = products.some((p) => p.category === 'footwear');
  let completeness = 0;
  if (hasTop) completeness += 0.35;
  if (hasBottom) completeness += 0.35;
  if (hasFootwear) completeness += 0.3;

  const combined =
    colorHarmony * 0.35 +
    formalitySpread * 0.25 +
    archetypeCoherence * 0.2 +
    completeness * 0.2;

  return {
    colorHarmony,
    formalitySpread,
    archetypeCoherence,
    completeness,
    combined,
    reasons,
  };
}

export function coherenceMultiplier(scores: CoherenceScores): number {
  const harmonyMultiplier =
    scores.colorHarmony < 0.4 ? 0.8 : scores.colorHarmony > 0.8 ? 1.08 : 1;
  const formalityMultiplier =
    scores.formalitySpread < 0.5 ? 0.85 : scores.formalitySpread > 0.85 ? 1.05 : 1;
  const completenessPenalty =
    scores.completeness < 0.7 ? 0.75 : scores.completeness < 1 ? 0.95 : 1;
  return harmonyMultiplier * formalityMultiplier * completenessPenalty;
}

export function isHardMismatch(
  products: ScoredProduct[],
  profile?: UserStyleProfile
): boolean {
  const athleticCount = products.filter(
    (p) => (p.archetypeFit['ATHLETIC' as ArchetypeKey] ?? 0) > 0.6
  ).length;
  const formalCount = products.filter((p) => p.formality > 0.7).length;
  if (athleticCount > 0 && formalCount > 0) return true;

  if (profile && athleticCount > 0) {
    const profileAcceptsAthletic =
      profile.primaryArchetype === 'ATHLETIC' ||
      profile.secondaryArchetype === 'ATHLETIC';
    if (!profileAcceptsAthletic) return true;
  }

  const archetypeTotals: Record<string, number> = {};
  for (const p of products) {
    for (const [key, score] of Object.entries(p.archetypeFit)) {
      archetypeTotals[key] = (archetypeTotals[key] ?? 0) + (score ?? 0);
    }
  }
  const sum = Object.values(archetypeTotals).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    const top = Math.max(...Object.values(archetypeTotals));
    if (top / sum < 0.35) return true;
  }

  return false;
}
