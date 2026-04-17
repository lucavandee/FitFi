import type { ArchetypeKey } from '@/config/archetypes';
import type { ScoredProduct, UserStyleProfile } from '../types';

function colorOverlap(tags: string[], liked: string[]): number {
  if (tags.length === 0 || liked.length === 0) return 0;
  const likedSet = new Set(liked.map((l) => l.toLowerCase()));
  let hits = 0;
  for (const t of tags) {
    if (likedSet.has(t.toLowerCase())) hits++;
  }
  return Math.min(1, hits / Math.min(liked.length, 3));
}

function styleOverlap(product: ScoredProduct, likedStyles: string[]): number {
  if (likedStyles.length === 0) return 0;
  const tags = [
    ...(product.product.tags ?? []),
    ...(product.product.styleTags ?? []),
  ]
    .join(' ')
    .toLowerCase();
  const brand = (product.product.brand ?? '').toLowerCase();
  let hits = 0;
  for (const style of likedStyles) {
    const s = style.toLowerCase();
    if (tags.includes(s)) hits++;
    else if (brand.includes(s)) hits++;
  }
  return Math.min(1, hits / Math.min(likedStyles.length, 2));
}

export function scoreMoodboard(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  const mb = profile.moodboard;
  if (mb.totalCount < 3 || mb.confidence < 0.15) {
    return { score: 0.55, reason: 'moodboard_insufficient' };
  }

  const archetypes = Object.keys(mb.archetypeWeights) as ArchetypeKey[];
  let archetypeScore = 0.5;
  if (archetypes.length > 0) {
    const top = archetypes.reduce((best, k) => {
      const w = mb.archetypeWeights[k] ?? 0;
      return w > (mb.archetypeWeights[best] ?? 0) ? k : best;
    }, archetypes[0]);
    const productFit = product.archetypeFit[top] ?? 0;
    archetypeScore = productFit;
  }

  const colorScore = colorOverlap(product.colorTags, mb.likedColors);
  const styleScore = styleOverlap(product, mb.likedStyles);

  const rawScore =
    archetypeScore * 0.55 + colorScore * 0.25 + styleScore * 0.2;

  const blendWeight = Math.min(mb.confidence, 0.75);
  const blended = 0.5 * (1 - blendWeight) + rawScore * blendWeight;

  let reason = 'moodboard_neutral';
  if (blended > 0.75) reason = 'moodboard_strong_match';
  else if (blended > 0.55) reason = 'moodboard_partial';
  else if (blended < 0.4) reason = 'moodboard_weak';

  return { score: Math.max(0, Math.min(1, blended)), reason };
}
