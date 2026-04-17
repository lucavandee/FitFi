import type { ScoredProduct } from '../types';

export function scoreQuality(product: ScoredProduct): { score: number; reason: string } {
  const rating = product.product.rating ?? null;
  const reviewCount = product.product.reviewCount ?? 0;
  const hasImage = Boolean(product.product.imageUrl);
  const hasBrand = Boolean(product.product.brand);
  const hasDescription = Boolean(product.product.description);

  let score = 0.6;
  const reasons: string[] = [];

  if (typeof rating === 'number' && rating > 0) {
    const ratingNorm = Math.min(1, rating / 5);
    const confidence = Math.min(1, reviewCount / 40);
    score = 0.5 + ratingNorm * 0.35 * (0.5 + confidence * 0.5);
    if (ratingNorm > 0.85 && reviewCount > 20) reasons.push('high_rated');
  } else {
    if (hasBrand) score += 0.08;
    if (hasDescription) score += 0.04;
    if (hasImage) score += 0.04;
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    reason: reasons[0] ?? 'quality_baseline',
  };
}
