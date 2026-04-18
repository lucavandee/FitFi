import type { ScoredProduct, UserStyleProfile } from '../types';

export function scoreBrand(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  const prefs = profile.preferredBrands;
  if (!prefs || prefs.length === 0) {
    return { score: 0.6, reason: 'no_brand_pref' };
  }

  const brand = String(product.product.brand ?? '').toLowerCase().trim();
  if (!brand) return { score: 0.85, reason: 'no_brand_data' };

  const prefSet = new Set(prefs.map((b) => b.toLowerCase().trim()));
  if (prefSet.has(brand)) {
    return { score: 1.0, reason: `brand_match(${brand})` };
  }

  for (const pref of prefSet) {
    if (brand.includes(pref) || pref.includes(brand)) {
      return { score: 1.0, reason: `brand_match(${brand})` };
    }
  }

  return { score: 0.85, reason: 'brand_neutral' };
}
