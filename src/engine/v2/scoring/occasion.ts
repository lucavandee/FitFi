import type { OccasionKey, ScoredProduct } from '../types';

export const OCCASION_FORMALITY: Record<
  OccasionKey,
  { target: number; tolerance: number }
> = {
  work: { target: 0.65, tolerance: 0.2 },
  formal: { target: 0.85, tolerance: 0.15 },
  casual: { target: 0.3, tolerance: 0.25 },
  date: { target: 0.6, tolerance: 0.2 },
  travel: { target: 0.4, tolerance: 0.25 },
  sport: { target: 0.12, tolerance: 0.18 },
  party: { target: 0.35, tolerance: 0.25 },
};

const OCCASION_KEYWORDS: Partial<Record<OccasionKey, string[]>> = {
  work: ['werk', 'kantoor', 'office', 'professional', 'blazer', 'overhemd', 'pantalon', 'mantelpak', 'mantelpakje', 'kokerrok', 'pencil skirt', 'blouse', 'pumps', 'blazerjurk', 'shirtdress'],
  formal: ['formeel', 'formal', 'galadiner', 'ceremonie', 'suit', 'pak', 'smoking', 'mantelpak'],
  casual: ['casual', 'relaxed', 'weekend', 'dagelijks', 'jeans', 't-shirt', 'sneaker'],
  date: ['date', 'diner', 'restaurant', 'night out', 'cocktail'],
  travel: ['travel', 'reizen', 'versatile', 'comfort', 'licht'],
  sport: ['sport', 'gym', 'training', 'running', 'tech', 'performance', 'stretch'],
  party: ['party', 'feest', 'festival', 'uitgaan', 'club', 'stappen', 'night out', 'rave'],
};

export function scoreOccasion(
  product: ScoredProduct,
  occasion: OccasionKey
): { score: number; reason: string } {
  const { target, tolerance } = OCCASION_FORMALITY[occasion];
  const formalityDistance = Math.abs(product.formality - target);

  let formalityScore: number;
  if (formalityDistance <= tolerance) {
    formalityScore = 1 - formalityDistance / (tolerance + 0.1);
  } else if (formalityDistance <= tolerance * 2) {
    formalityScore = 0.5 - (formalityDistance - tolerance) / (tolerance * 2 + 0.1);
  } else {
    formalityScore = 0.1;
  }
  formalityScore = Math.max(0, Math.min(1, formalityScore));

  const keywords = OCCASION_KEYWORDS[occasion] ?? [];
  const text = `${product.product.name ?? ''} ${product.product.description ?? ''}`.toLowerCase();
  const keywordHit = keywords.some((k) => text.includes(k));

  const combined = formalityScore * 0.85 + (keywordHit ? 0.15 : 0);

  return {
    score: Math.max(0, Math.min(1, combined)),
    reason:
      combined > 0.75
        ? `occasion_${occasion}_match`
        : combined > 0.45
        ? `occasion_${occasion}_ok`
        : `occasion_${occasion}_mismatch`,
  };
}
