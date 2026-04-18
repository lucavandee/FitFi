import type { Product } from '../types';
import { classifyProduct } from '../productClassifier';
import { deriveAthleticIntent, enrichProduct, TEAM_SPORT_RE } from '../productEnricher';
import type {
  NormalizedCategory,
  ScoredProduct,
  UserStyleProfile,
} from './types';

const PREPPY_BRANDS = new Set([
  'tommy hilfiger',
  'ralph lauren',
  'polo ralph lauren',
  'lacoste',
  'gant',
  'brooks brothers',
]);

const ATHLETIC_BRANDS = new Set([
  'adidas',
  'nike',
  'puma',
  'reebok',
  'under armour',
  'asics',
  'new balance',
  'fila',
]);

const STREETWEAR_OFF_FOOTWEAR_RE = /\b(desert\s*boot|loafer|loafers|oxford\s*shoe|oxfords|brogue|brogues|derby|derbies|monk\s*strap)\b/i;
const GRAPHIC_PRINT_RE = /\b(graphic|graphic\s*print|bold\s*logo|big\s*logo|oversized\s*logo|print\s*tee|logo\s*tee|allover\s*print|all[-\s]?over\s*print)\b/i;
const CONVERSE_CANVAS_RE = /\bconverse\b.*\b(canvas|chuck\s*taylor|all\s*star)\b|\b(canvas|chuck\s*taylor|all\s*star)\b.*\bconverse\b/i;

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

function budgetCheck(
  product: Product,
  profile: UserStyleProfile
): 'ok' | 'over_budget' | 'below_budget_min' {
  const price = product.price ?? 0;
  if (price <= 0) return 'ok';
  const ceiling = profile.budget.perItemMax * 1.35;
  if (price > ceiling) return 'over_budget';
  const min = profile.budget.perItemMin;
  if (min > 0 && price < min * 0.75) return 'below_budget_min';
  return 'ok';
}

function isInStock(product: Product): boolean {
  return product.inStock !== false;
}

function isTeamSportKit(product: Product): boolean {
  const text = `${product.brand ?? ''} ${product.name ?? ''} ${product.description ?? ''}`;
  return TEAM_SPORT_RE.test(text);
}

function hasAthleticIntent(product: Product, category: string): boolean {
  const intent = deriveAthleticIntent(
    product.brand ?? '',
    product.name ?? '',
    product.description ?? '',
    category
  );
  return intent >= 0.6;
}

function profileAcceptsAthletic(profile: UserStyleProfile): boolean {
  return (
    profile.primaryArchetype === 'ATHLETIC' ||
    profile.secondaryArchetype === 'ATHLETIC'
  );
}

type ArchetypeRejectReason =
  | 'archetype_mismatch'
  | 'brand_archetype_mismatch';

function archetypeHardReject(
  product: Product,
  category: NormalizedCategory,
  formality: number | undefined,
  profile: UserStyleProfile
): ArchetypeRejectReason | null {
  const f = formality ?? 0.4;
  const brand = (product.brand ?? '').toLowerCase().trim();
  const name = product.name ?? '';
  const desc = product.description ?? '';
  const text = `${brand} ${name} ${desc}`;
  const primary = profile.primaryArchetype;
  const secondary = profile.secondaryArchetype;

  if (primary === 'STREETWEAR') {
    if (secondary !== 'CLASSIC' && secondary !== 'SMART_CASUAL') {
      if (f > 0.45) return 'archetype_mismatch';
    }
    if (PREPPY_BRANDS.has(brand)) return 'brand_archetype_mismatch';
    if (category === 'footwear' && STREETWEAR_OFF_FOOTWEAR_RE.test(text)) {
      return 'archetype_mismatch';
    }
  }

  if (primary === 'MINIMALIST') {
    if (secondary !== 'ATHLETIC') {
      if (ATHLETIC_BRANDS.has(brand)) return 'brand_archetype_mismatch';
    }
    if (GRAPHIC_PRINT_RE.test(text)) return 'archetype_mismatch';
  }

  if (primary === 'AVANT_GARDE') {
    if (PREPPY_BRANDS.has(brand)) return 'brand_archetype_mismatch';
    if (secondary !== 'CLASSIC' && secondary !== 'SMART_CASUAL') {
      const productArchetype = (product as { styleArchetype?: string }).styleArchetype?.toLowerCase();
      if (productArchetype === 'classic' || productArchetype === 'smart_casual' || productArchetype === 'smart-casual') {
        return 'brand_archetype_mismatch';
      }
    }
    if (category === 'footwear' && CONVERSE_CANVAS_RE.test(text)) {
      return 'archetype_mismatch';
    }
  }

  return null;
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
    below_budget_min: 0,
    out_of_stock: 0,
    unclassifiable: 0,
    team_sport: 0,
    athletic_mismatch: 0,
    archetype_mismatch: 0,
    brand_archetype_mismatch: 0,
  };
  const acceptsAthletic = profileAcceptsAthletic(profile);
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
    const budgetStatus = budgetCheck(product, profile);
    if (budgetStatus !== 'ok') {
      byReason[budgetStatus]++;
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

    if (isTeamSportKit(product)) {
      byReason.team_sport++;
      continue;
    }

    if (!acceptsAthletic && hasAthleticIntent(product, cat)) {
      byReason.athletic_mismatch++;
      continue;
    }

    const enriched = enrichProduct(product);

    const archetypeReject = archetypeHardReject(
      product,
      cat,
      enriched.formality,
      profile
    );
    if (archetypeReject) {
      byReason[archetypeReject]++;
      continue;
    }

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
        brand: 0,
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

  const total = Object.values(byReason).reduce((a, b) => a + b, 0);

  return {
    candidates,
    rejected: { total, byReason },
    byCategory,
  };
}
