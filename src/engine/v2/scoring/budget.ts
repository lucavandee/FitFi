import type { ScoredProduct, UserStyleProfile } from '../types';

export function scoreBudget(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  const price = product.product.price ?? 0;
  const max = profile.budget.perItemMax;
  const min = profile.budget.perItemMin;

  if (price <= 0) return { score: 0.6, reason: 'no_price' };
  if (max <= 0) return { score: 0.7, reason: 'no_budget_set' };

  if (price > max * 1.35) return { score: 0.05, reason: 'way_over_budget' };
  if (price > max * 1.15) return { score: 0.35, reason: 'over_budget' };
  if (price > max) return { score: 0.6, reason: 'slight_over_budget' };

  if (min > 0 && price < min * 0.75) {
    return { score: 0.55, reason: 'below_min_budget' };
  }
  if (min > 0 && price < min) {
    return { score: 0.7, reason: 'near_min_budget' };
  }

  const target = (max + Math.max(min, max * 0.3)) / 2;
  const distance = Math.abs(price - target) / Math.max(target, 1);

  if (distance < 0.15) return { score: 1.0, reason: 'budget_sweet_spot' };
  if (distance < 0.35) return { score: 0.9, reason: 'budget_within_range' };
  if (distance < 0.6) return { score: 0.8, reason: 'budget_ok' };
  return { score: 0.7, reason: 'budget_edge' };
}
