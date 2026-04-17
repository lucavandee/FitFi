import type { Product } from '../types';
import { classifyProduct } from '../productClassifier';
import { enrichProduct } from '../productEnricher';
import type {
  NormalizedCategory,
  ScoredProduct,
  UserStyleProfile,
} from './types';

const CATEGORY_ALIASES: Record<string, NormalizedCategory> = {
  top: 'top',
  tops: 'top',
  shirt: 'top',
  shirts: 'top',
  bottom: 'bottom',
  bottoms: 'bottom',
  pants: 'bottom',
  trouser: 'bottom',
  trousers: 'bottom',
  footwear: 'footwear',
  shoe: 'footwear',
  shoes: 'footwear',
  outerwear: 'outerwear',
  jacket: 'outerwear',
  coat: 'outerwear',
  accessory: 'accessory',
  accessories: 'accessory',
  bag: 'accessory',
  dress: 'dress',
  dresses: 'dress',
  skirt: 'dress',
  jumpsuit: 'jumpsuit',
};

function normalizeCategory(raw?: string): NormalizedCategory | null {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return CATEGORY_ALIASES[key] ?? null;
}

function matchesGender(product: Product, gender: string): boolean {
  if (!gender || gender === 'unisex' || gender === 'prefer-not-to-say') return true;
  const pg = (product.gender || '').toLowerCase().trim();
  if (!pg) return true;
  if (pg === 'unisex') return true;
  if (gender === 'male' && (pg === 'male' || pg === 'men' || pg === 'man' || pg === 'heren')) return true;
  if (gender === 'female' && (pg === 'female' || pg === 'women' || pg === 'woman' || pg === 'dames')) return true;
  if (gender === 'non-binary') return true;
  return false;
}

function matchesBudget(product: Product, profile: UserStyleProfile): boolean {
  const price = product.price ?? 0;
  if (price <= 0) return true;
  const ceiling = profile.budget.perItemMax * 1.35;
  return price <= ceiling;
}

function isInStock(product: Product): boolean {
  return product.inStock !== false;
}

export interface FilterResult {
  candidates: ScoredProduct[];
  rejected: {
    total: number;
    byReason: Record<string, number>;
  };
  byCategory: Record<NormalizedCategory, ScoredProduct[]>;
}

export function filterAndPrepare(
  products: Product[],
  profile: UserStyleProfile
): FilterResult {
  const byReason: Record<string, number> = {
    non_clothing: 0,
    wrong_gender: 0,
    over_budget: 0,
    out_of_stock: 0,
    unclassifiable: 0,
  };
  const byCategory: Record<NormalizedCategory, ScoredProduct[]> = {
    top: [],
    bottom: [],
    footwear: [],
    outerwear: [],
    accessory: [],
    dress: [],
    jumpsuit: [],
  };
  const candidates: ScoredProduct[] = [];

  for (const product of products) {
    if (!isInStock(product)) {
      byReason.out_of_stock++;
      continue;
    }
    if (!matchesGender(product, profile.gender)) {
      byReason.wrong_gender++;
      continue;
    }
    if (!matchesBudget(product, profile)) {
      byReason.over_budget++;
      continue;
    }

    const classification = classifyProduct(product);
    if (classification.rejected) {
      byReason.non_clothing++;
      continue;
    }

    const cat =
      normalizeCategory(classification.category) ??
      normalizeCategory(product.category);
    if (!cat) {
      byReason.unclassifiable++;
      continue;
    }

    const enriched = enrichProduct(product);
    const scored: ScoredProduct = {
      product: { ...product, category: cat, formality: enriched.formality },
      category: cat,
      score: 0,
      breakdown: {
        archetype: 0,
        color: 0,
        occasion: 0,
        material: 0,
        budget: 0,
        moodboard: 0,
        fit: 0,
        goals: 0,
        season: 0,
        prints: 0,
        quality: 0,
      },
      reasons: [],
      formality: enriched.formality,
      archetypeFit: {},
      colorTags: enriched._signals.colorTags,
      materialTags: enriched._signals.materialTags,
      silhouetteTags: enriched._signals.silhouetteTags,
    };
    candidates.push(scored);
    byCategory[cat].push(scored);
  }

  const total =
    byReason.non_clothing +
    byReason.wrong_gender +
    byReason.over_budget +
    byReason.out_of_stock +
    byReason.unclassifiable;

  return {
    candidates,
    rejected: { total, byReason },
    byCategory,
  };
}
