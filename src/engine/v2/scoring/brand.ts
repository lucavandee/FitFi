import type { ArchetypeKey } from '@/config/archetypes';
import type { ScoredProduct, UserStyleProfile } from '../types';

const NEGATIVE_BRANDS_BY_ARCHETYPE: Partial<Record<ArchetypeKey, Set<string>>> = {
  STREETWEAR: new Set([
    'ralph lauren', 'polo ralph lauren', 'tommy hilfiger',
    'lacoste', 'gant', 'hugo boss', 'boss', 'massimo dutti',
    'suitsupply', 'hackett', 'charles tyrwhitt', 'brooks brothers',
    'ermenegildo zegna', 'zegna', 'canali', 'corneliani',
  ]),
  AVANT_GARDE: new Set([
    'cos', 'arket', 'uniqlo', 'muji', 'everlane', 'filippa k',
    'ralph lauren', 'polo ralph lauren', 'tommy hilfiger',
    'lacoste', 'gant', 'hugo boss', 'boss', 'massimo dutti',
    'suitsupply', 'hackett',
  ]),
  MINIMALIST: new Set([
    'stussy', 'stüssy', 'supreme', 'palace', 'off-white', 'huf', 'obey',
  ]),
  CLASSIC: new Set([
    'stussy', 'stüssy', 'supreme', 'palace', 'off-white',
    'rick owens', 'yohji yamamoto', 'comme des garcons', 'comme des garçons',
    'vetements', 'julius',
  ]),
};

function isNegativeBrand(brand: string, primary: ArchetypeKey): boolean {
  const set = NEGATIVE_BRANDS_BY_ARCHETYPE[primary];
  if (!set) return false;
  if (set.has(brand)) return true;
  for (const n of set) {
    if (brand.includes(n) || n.includes(brand)) return true;
  }
  return false;
}

export function scoreBrand(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  const brand = String(product.product.brand ?? '').toLowerCase().trim();

  if (brand && isNegativeBrand(brand, profile.primaryArchetype)) {
    return { score: 0.25, reason: `brand_off_archetype(${brand})` };
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

  return { score: 0.7, reason: 'brand_neutral' };
}
