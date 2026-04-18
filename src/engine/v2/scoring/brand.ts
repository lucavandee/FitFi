import type { ScoredProduct, UserStyleProfile } from '../types';

const NEGATIVE_BRANDS = new Set<string>([
  'shein',
  'temu',
  'wish',
  'romwe',
  'zaful',
]);

const STRONG_PREFERENCE_THRESHOLD = 3;

export function scoreBrand(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  const brand = String(product.product.brand ?? '').toLowerCase().trim();

  if (brand && NEGATIVE_BRANDS.has(brand)) {
    return { score: 0.15, reason: `brand_negative(${brand})` };
  }

  const prefs = profile.preferredBrands;
  if (!prefs || prefs.length === 0) {
    return { score: 1.0, reason: 'no_brand_pref' };
  }

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

  const strongPref = prefSet.size >= STRONG_PREFERENCE_THRESHOLD;
  return {
    score: strongPref ? 0.45 : 0.7,
    reason: strongPref ? 'brand_non_preferred_strong' : 'brand_neutral',
  };
}
