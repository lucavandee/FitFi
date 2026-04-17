import { isAdultClothingProduct, classifyCategory } from './productFilter';
import { matchesColorSeason } from './colorSeasonFiltering';
import { deriveAthleticIntent as _deriveAthleticIntentFromEnricher } from './productEnricher';
import { getCurrentSeason } from './helpers';
import type { Season } from './types';

export interface CleanProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  url: string;
  category: string;
  colors: string[];
  style: string;
  gender: string;
  description: string;
  retailer: string;
  tags: string[];
  seasons: Season[];
  athleticIntent?: number;
  subType?: string;
  itemReason?: string;
}

export interface ComposedOutfit {
  id: string;
  title: string;
  occasion: string;
  products: CleanProduct[];
  matchScore: number;
  image: string;
  explanation: string;
}

interface OccasionBlueprint {
  label: string;
  emoji: string;
  required: string[];
  optional: string[];
  preferredStyles: string[];
  priceFloor: number;
  formalityHint: 'casual' | 'smart' | 'formal';
  brandDiversity: boolean;
}

const OCCASION_BLUEPRINTS: Record<string, OccasionBlueprint> = {
  werk: {
    label: 'Werk',
    emoji: '💼',
    required: ['top', 'bottom', 'footwear'],
    optional: ['outerwear', 'accessory'],
    preferredStyles: ['smart-casual', 'luxury', 'casual'],
    priceFloor: 25,
    formalityHint: 'smart',
    brandDiversity: true,
  },
  weekend: {
    label: 'Weekend',
    emoji: '☀️',
    required: ['top', 'bottom', 'footwear'],
    optional: ['accessory'],
    preferredStyles: ['casual', 'casual-urban', 'streetwear'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: true,
  },
  casual: {
    label: 'Dagelijks',
    emoji: '🌿',
    required: ['top', 'bottom', 'footwear'],
    optional: ['outerwear'],
    preferredStyles: ['casual', 'smart-casual'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: true,
  },
  avond: {
    label: 'Avond uit',
    emoji: '🌙',
    required: ['top', 'bottom', 'footwear'],
    optional: ['accessory', 'outerwear'],
    preferredStyles: ['smart-casual', 'luxury'],
    priceFloor: 30,
    formalityHint: 'formal',
    brandDiversity: true,
  },
  date: {
    label: 'Date',
    emoji: '✨',
    required: ['top', 'bottom', 'footwear'],
    optional: ['accessory'],
    preferredStyles: ['smart-casual', 'luxury', 'casual'],
    priceFloor: 25,
    formalityHint: 'smart',
    brandDiversity: true,
  },
  sport: {
    label: 'Actief',
    emoji: '🏃',
    required: ['top', 'bottom', 'footwear'],
    optional: [],
    preferredStyles: ['athletic', 'sport', 'casual'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: false,
  },
  smart: {
    label: 'Smart Casual',
    emoji: '👔',
    required: ['top', 'bottom', 'footwear'],
    optional: ['outerwear', 'accessory'],
    preferredStyles: ['smart-casual', 'luxury'],
    priceFloor: 30,
    formalityHint: 'smart',
    brandDiversity: true,
  },
  relaxed: {
    label: 'Relaxed',
    emoji: '🛋️',
    required: ['top', 'bottom', 'footwear'],
    optional: [],
    preferredStyles: ['casual', 'casual-urban'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: true,
  },
};

const ARCHETYPE_OCCASIONS: Record<string, string[]> = {
  MINIMALIST:   ['werk', 'casual', 'weekend', 'smart', 'date', 'avond', 'relaxed'],
  CLASSIC:      ['werk', 'smart', 'avond', 'date', 'casual', 'weekend'],
  SMART_CASUAL: ['casual', 'werk', 'weekend', 'date', 'avond', 'smart', 'relaxed'],
  STREETWEAR:   ['weekend', 'casual', 'relaxed', 'avond', 'date'],
  ATHLETIC:     ['sport', 'casual', 'weekend', 'relaxed'],
  AVANT_GARDE:  ['avond', 'date', 'casual', 'weekend', 'smart'],
};

const FORMALITY_KEYWORDS: Record<string, RegExp[]> = {
  casual: [/t-shirt/i, /sneaker/i, /hoodie/i, /jogger/i, /sweater/i, /sweatshirt/i, /cargo/i, /denim/i],
  smart: [/overhemd/i, /blazer/i, /chino/i, /loafer/i, /polo/i, /derby/i, /brogue/i, /pantalon/i, /blouse/i],
  formal: [/kostuum/i, /smoking/i, /colbert/i, /pump/i, /oxford/i, /manchet/i, /stropdas/i],
};

function formalityScore(product: CleanProduct): number {
  const text = product.name.toLowerCase();
  let score = 0.5;
  for (const p of FORMALITY_KEYWORDS.formal) if (p.test(text)) score += 0.3;
  for (const p of FORMALITY_KEYWORDS.smart) if (p.test(text)) score += 0.15;
  for (const p of FORMALITY_KEYWORDS.casual) if (p.test(text)) score -= 0.1;
  return Math.max(0, Math.min(1, score));
}

const SUB_TYPE_PATTERNS: Record<string, RegExp> = {
  hoodie: /hoodie|hooded/i,
  sweater: /sweater|sweatshirt|crewneck/i,
  knit: /knit|gebreid|pullover|trui|coltrui|turtleneck/i,
  tshirt: /t-shirt|tee\b|t shirt/i,
  polo: /polo/i,
  shirt: /overhemd|shirt(?!.*t-shirt)|blouse/i,
  overshirt: /overshirt|shacket/i,
  cardigan: /cardigan|vest/i,
  jeans: /jeans|denim.*broek|spijker/i,
  chino: /chino/i,
  trouser: /pantalon|broek(?!.*spijker)/i,
  jogger: /jogger|sweatpant|trainingsbroek/i,
  cargo: /cargo/i,
  short: /short/i,
  sneaker: /sneaker/i,
  boot: /boot|laars|chelsea/i,
  loafer: /loafer|mocassin|instapper/i,
  derby: /derby|oxford|brogue|veterschoen/i,
  blazer: /blazer|colbert/i,
  jacket: /jack(?!et)|jacket|bomber|puffer/i,
  coat: /coat|jas|parka|mantel|trench/i,
  gilet: /gilet|bodywarmer/i,
};

function classifySubType(p: CleanProduct): string {
  const text = `${p.name} ${p.description}`.toLowerCase();
  for (const [subType, pattern] of Object.entries(SUB_TYPE_PATTERNS)) {
    if (pattern.test(text)) return subType;
  }
  return p.category;
}

interface ReportDiversityTracker {
  brandCounts: Record<string, number>;
  subTypeSignatures: string[][];
  outfitCount: number;
}

function createDiversityTracker(): ReportDiversityTracker {
  return { brandCounts: {}, subTypeSignatures: [], outfitCount: 0 };
}

function reportBrandPenalty(brand: string, tracker: ReportDiversityTracker): number {
  const key = brand.toLowerCase();
  const count = tracker.brandCounts[key] || 0;
  if (count === 0) return 0;
  if (count === 1) return -12;
  if (count === 2) return -25;
  return -35;
}

function registerOutfit(products: CleanProduct[], tracker: ReportDiversityTracker): void {
  for (const p of products) {
    const key = p.brand.toLowerCase();
    tracker.brandCounts[key] = (tracker.brandCounts[key] || 0) + 1;
  }
  const sig = products.map(p => p.subType || p.category).sort();
  tracker.subTypeSignatures.push(sig);
  tracker.outfitCount++;
}

function structureSimilarity(candidateSig: string[], tracker: ReportDiversityTracker): number {
  if (tracker.subTypeSignatures.length === 0) return 0;
  let maxOverlap = 0;
  for (const existing of tracker.subTypeSignatures) {
    let shared = 0;
    const pool = [...existing];
    for (const st of candidateSig) {
      const idx = pool.indexOf(st);
      if (idx >= 0) {
        shared++;
        pool.splice(idx, 1);
      }
    }
    const total = Math.max(candidateSig.length, existing.length);
    const overlap = total > 0 ? shared / total : 0;
    if (overlap > maxOverlap) maxOverlap = overlap;
  }
  return maxOverlap;
}

function colorCompatibility(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0.5;
  const NEUTRAL = ['zwart', 'wit', 'grijs', 'beige', 'donkerblauw', 'navy', 'cream', 'taupe', 'bruin', 'ecru', 'off-white', 'antraciet', 'black', 'white', 'grey', 'blue'];
  const aIsNeutral = a.some(c => NEUTRAL.some(n => c.toLowerCase().includes(n)));
  const bIsNeutral = b.some(c => NEUTRAL.some(n => c.toLowerCase().includes(n)));
  if (aIsNeutral || bIsNeutral) return 0.85;
  const shared = a.filter(c => b.some(bc => bc.toLowerCase() === c.toLowerCase()));
  if (shared.length > 0) return 0.7;
  return 0.4;
}

function shuffleSeeded(arr: any[], seed: number): any[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface UserPreferences {
  fit?: string;
  prints?: string;
  goals?: string[];
  materials?: string[];
  occasions?: string[];
  colorProfile?: { season?: string; temperature?: string; value?: string; contrast?: string };
  budget?: { min: number; max: number };
  season?: Season;
}

// Keyword heuristics for detecting clearly season-bound items. These are
// intentionally conservative — we only reject an item when its name or
// description strongly signals a single season.
const SEASON_ONLY_PATTERNS: Record<Season, RegExp[]> = {
  winter: [
    /winterjas/i, /winter coat/i, /\bpuffer\b/i, /down\s*jacket/i, /donsjack/i,
    /parka/i, /teddy/i, /sherpa/i, /fleece(?!.*short)/i, /gevoerd/i,
    /thermisch/i, /thermal/i, /coltrui/i, /turtleneck/i,
  ],
  summer: [
    /\bshort(s)?\b/i, /korte broek/i, /zwembroek/i, /swim\s*short/i,
    /bikini/i, /tankini/i, /zwempak/i, /\bsandaal\b/i, /\bsandal\b/i,
    /\bslipper(s)?\b/i, /flip.?flop/i, /teenslipper/i, /linnen short/i,
  ],
  spring: [],
  autumn: [],
};

function detectProductSeasons(
  raw: Record<string, any>,
  name: string,
  description: string,
): Season[] {
  // Prefer explicit season data from the row when available.
  const rawSeason = raw.season ?? raw.seasons;
  if (Array.isArray(rawSeason)) {
    const valid = rawSeason
      .map(s => String(s).toLowerCase())
      .filter((s): s is Season => s === 'spring' || s === 'summer' || s === 'autumn' || s === 'winter');
    if (valid.length > 0) return valid;
  } else if (typeof rawSeason === 'string' && rawSeason.trim() !== '') {
    const s = rawSeason.toLowerCase();
    if (s === 'spring' || s === 'summer' || s === 'autumn' || s === 'winter') {
      return [s];
    }
  }

  // Fall back to keyword-based inference.
  const text = `${name} ${description}`.toLowerCase();
  const inferred: Season[] = [];
  (['winter', 'summer'] as Season[]).forEach(s => {
    if (SEASON_ONLY_PATTERNS[s].some(r => r.test(text))) inferred.push(s);
  });
  return inferred;
}

function isProductInSeason(p: CleanProduct, season: Season): boolean {
  // No explicit season tags → item is considered season-neutral.
  if (!p.seasons || p.seasons.length === 0) return true;
  return p.seasons.includes(season);
}

const OCCASION_QUIZ_TO_COMPOSER: Record<string, string> = {
  work: 'werk',
  casual: 'casual',
  formal: 'avond',
  date: 'date',
  travel: 'relaxed',
  sport: 'sport',
};

function resolveOccasions(
  userOccasions: string[] | undefined,
  archetype: string,
): string[] {
  if (userOccasions && userOccasions.length > 0) {
    const mapped = userOccasions
      .map(o => OCCASION_QUIZ_TO_COMPOSER[o] || o)
      .filter(o => OCCASION_BLUEPRINTS[o]);
    if (mapped.length > 0) return mapped;
  }
  return ARCHETYPE_OCCASIONS[archetype] || ARCHETYPE_OCCASIONS.SMART_CASUAL;
}

function deriveAthleticIntent(p: CleanProduct): number {
  return _deriveAthleticIntentFromEnricher(p.brand, p.name, p.description, p.category);
}

export function composeOutfits(
  rawRows: Record<string, any>[],
  archetype: string,
  count: number,
  gender?: string,
  prefs?: UserPreferences,
  season?: Season,
): ComposedOutfit[] {
  const activeSeason: Season = season ?? prefs?.season ?? getCurrentSeason();
  const clean = rawRows.filter(isAdultClothingProduct);

  const products: CleanProduct[] = clean.map(r => {
    const name = r.name || r.title || '';
    const description = r.description || '';
    const base: CleanProduct = {
      id: r.id,
      name,
      brand: r.brand || '',
      price: typeof r.price === 'number' ? r.price : parseFloat(r.price) || 0,
      imageUrl: r.image_url || r.imageUrl || '',
      url: r.affiliate_url || r.product_url || '',
      category: classifyCategory(r),
      colors: Array.isArray(r.colors) ? r.colors : [],
      style: r.style || 'casual',
      gender: r.gender || 'unisex',
      description,
      retailer: r.retailer || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
      seasons: detectProductSeasons(r, name, description),
    };
    base.athleticIntent = deriveAthleticIntent(base);
    base.subType = classifySubType(base);
    return base;
  })
    .filter(p => p.category !== 'other' && p.imageUrl && p.url)
    .filter(p => isProductInSeason(p, activeSeason));

  if (gender && gender !== 'unisex') {
    const genFiltered = products.filter(p => p.gender === gender || p.gender === 'unisex');
    if (genFiltered.length >= 3) {
      products.length = 0;
      products.push(...genFiltered);
    } else {
      return [];
    }
  }

  const byCategory: Record<string, CleanProduct[]> = {};
  for (const p of products) {
    const cat = p.category === 'skirt' ? 'bottom' : p.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  const requiredCats = ['top', 'bottom', 'footwear'];
  for (const cat of requiredCats) {
    if (!byCategory[cat] || byCategory[cat].length < 2) {
      return [];
    }
  }

  const occasions = resolveOccasions(prefs?.occasions, archetype);
  const outfits: ComposedOutfit[] = [];
  const usedProductIds = new Set<string>();
  const usedTopBottomCombos = new Set<string>();
  const diversityTracker = createDiversityTracker();
  const occasionUsageCounts: Record<string, number> = {};

  for (let i = 0; i < count; i++) {
    const occasionKey = occasions[i % occasions.length];
    const blueprint = OCCASION_BLUEPRINTS[occasionKey] || OCCASION_BLUEPRINTS.casual;
    const prefSeed = (prefs?.fit?.length || 0) * 11
      + (prefs?.prints?.length || 0) * 17
      + (prefs?.goals?.length || 0) * 23
      + (prefs?.materials?.length || 0) * 29;

    const occasionUseCount = occasionUsageCounts[occasionKey] || 0;
    const isRepeatedOccasion = occasionUseCount > 0;
    const repeatOffset = isRepeatedOccasion ? occasionUseCount * 97 : 0;
    const seed = i * 31 + archetype.length * 7 + (gender?.length || 3) * 13 + prefSeed + repeatOffset;

    const outfit = buildOutfit(
      byCategory,
      blueprint,
      archetype,
      seed,
      usedProductIds,
      usedTopBottomCombos,
      i,
      prefs,
      diversityTracker,
      isRepeatedOccasion,
    );

    occasionUsageCounts[occasionKey] = occasionUseCount + 1;

    if (outfit) {
      registerOutfit(outfit.products, diversityTracker);
      outfits.push(outfit);
    }
  }

  for (const outfit of outfits) {
    const siblings = outfits.filter(o => o.id !== outfit.id);
    const siblingLabels = siblings.map(o => o.occasion);
    const siblingProducts = siblings.map(o => o.products);
    const bp = Object.values(OCCASION_BLUEPRINTS).find(b => b.label === outfit.occasion)
      || OCCASION_BLUEPRINTS.casual;
    buildItemReasons(outfit.products, bp, archetype, prefs);
    outfit.explanation = buildExplanation(
      outfit.products,
      bp,
      archetype,
      prefs,
      outfit.products.reduce((s, p) => s + p.price, 0),
      siblingLabels,
      siblingProducts,
    );
  }

  return outfits;
}

function perItemCeiling(budget: { min: number; max: number } | undefined): number {
  if (!budget || budget.max <= 0) return Infinity;
  return budget.max * 1.35;
}

function budgetFilterPool(
  pool: CleanProduct[],
  itemCeiling: number,
): CleanProduct[] {
  if (itemCeiling === Infinity) return pool;
  const withinBudget = pool.filter(p => p.price <= itemCeiling);
  return withinBudget.length >= 2 ? withinBudget : pool;
}

function buildOutfit(
  byCategory: Record<string, CleanProduct[]>,
  blueprint: OccasionBlueprint,
  archetype: string,
  seed: number,
  usedIds: Set<string>,
  usedCombos: Set<string>,
  index: number,
  prefs?: UserPreferences,
  diversityTracker?: ReportDiversityTracker,
  isRepeatedOccasion?: boolean,
): ComposedOutfit | null {
  const selected: CleanProduct[] = [];
  const selectedBrands = new Set<string>();
  const itemCeiling = perItemCeiling(prefs?.budget);

  for (const cat of blueprint.required) {
    let pool = (byCategory[cat] || []).filter(p => !usedIds.has(p.id) && p.price >= blueprint.priceFloor);
    pool = budgetFilterPool(pool, itemCeiling);
    if (pool.length === 0) {
      let fallbackPool = (byCategory[cat] || []).filter(p => !usedIds.has(p.id));
      fallbackPool = budgetFilterPool(fallbackPool, itemCeiling);
      if (fallbackPool.length === 0) return null;
      const pick = pickBest(fallbackPool, blueprint, archetype, seed + cat.length, selectedBrands, selected, prefs, diversityTracker, isRepeatedOccasion);
      if (!pick) return null;
      selected.push(pick);
      selectedBrands.add(pick.brand.toLowerCase());
      continue;
    }
    const pick = pickBest(pool, blueprint, archetype, seed + cat.length, selectedBrands, selected, prefs, diversityTracker, isRepeatedOccasion);
    if (!pick) return null;
    selected.push(pick);
    selectedBrands.add(pick.brand.toLowerCase());
  }

  const topId = selected.find(p => p.category === 'top')?.id || '';
  const bottomId = selected.find(p => p.category === 'bottom')?.id || '';
  const comboKey = `${topId}-${bottomId}`;
  if (usedCombos.has(comboKey)) {
    let altPool = (byCategory['bottom'] || [])
      .filter(p => !usedIds.has(p.id) && p.id !== bottomId && p.price >= blueprint.priceFloor);
    altPool = budgetFilterPool(altPool, itemCeiling);
    const altBottom = altPool
      .sort((a, b) => scoreProduct(b, blueprint, archetype, selectedBrands, selected, prefs) - scoreProduct(a, blueprint, archetype, selectedBrands, selected, prefs))[0];
    if (altBottom) {
      const idx = selected.findIndex(p => p.category === 'bottom');
      if (idx >= 0) selected[idx] = altBottom;
    }
  }

  const newComboKey = `${selected.find(p => p.category === 'top')?.id}-${selected.find(p => p.category === 'bottom')?.id}`;
  usedCombos.add(newComboKey);

  for (const cat of blueprint.optional) {
    let pool = (byCategory[cat] || []).filter(p =>
      !usedIds.has(p.id) && p.price >= blueprint.priceFloor
    );
    pool = budgetFilterPool(pool, itemCeiling);
    if (pool.length === 0) continue;
    const pick = pickBest(pool, blueprint, archetype, seed + cat.length * 3, selectedBrands, selected, prefs, diversityTracker, isRepeatedOccasion);
    if (pick) {
      selected.push(pick);
      selectedBrands.add(pick.brand.toLowerCase());
    }
  }

  if (diversityTracker && diversityTracker.outfitCount >= 2) {
    const candidateSig = selected.map(p => p.subType || p.category).sort();
    const similarity = structureSimilarity(candidateSig, diversityTracker);
    if (similarity >= 0.67) {
      const swappableCats = ['top', 'footwear', 'bottom'];
      for (const swapCat of swappableCats) {
        const currentItem = selected.find(p => p.category === swapCat);
        if (!currentItem) continue;
        const altPool = (byCategory[swapCat] || [])
          .filter(p =>
            !usedIds.has(p.id)
            && p.id !== currentItem.id
            && (p.subType || p.category) !== (currentItem.subType || currentItem.category)
          );
        if (altPool.length === 0) continue;
        const alt = pickBest(altPool, blueprint, archetype, seed + swapCat.length * 7, selectedBrands, selected, prefs, diversityTracker, isRepeatedOccasion);
        if (alt) {
          const idx = selected.indexOf(currentItem);
          if (idx >= 0) selected[idx] = alt;
          break;
        }
      }
    }
  }

  for (const p of selected) usedIds.add(p.id);

  const totalPrice = selected.reduce((s, p) => s + p.price, 0);
  const coverProduct = selected.find(p => p.category === 'outerwear')
    || selected.find(p => p.category === 'top')
    || selected[0];

  const matchScore = calculateOutfitScore(selected, blueprint, archetype);

  return {
    id: `outfit-${archetype}-${blueprint.label}-${index}`,
    title: `${blueprint.label}`,
    occasion: blueprint.label,
    products: selected,
    matchScore: Math.round(matchScore),
    image: coverProduct?.imageUrl || '',
    explanation: '',
  };
}

const ARCHETYPE_VIBE_LABELS: Record<string, string> = {
  MINIMALIST: 'clean en tijdloos',
  CLASSIC: 'tijdloos en verzorgd',
  SMART_CASUAL: 'toegankelijk en gepolijst',
  STREETWEAR: 'expressief en urban',
  ATHLETIC: 'functioneel en clean',
  AVANT_GARDE: 'conceptueel en statement',
};

const FORMALITY_LABEL: Record<string, string> = {
  casual: 'casual',
  smart: 'netter',
  formal: 'formeel',
};

const OCCASION_CONTEXT: Record<string, string> = {
  Werk: 'een werkdag',
  'Smart Casual': 'smart-casual gelegenheden',
  Weekend: 'het weekend',
  Dagelijks: 'dagelijks gebruik',
  'Avond uit': 'een avond uit',
  Date: 'een date',
  Actief: 'een actieve dag',
  Relaxed: 'een relaxte dag',
};

const MAT_LABELS: Record<string, string> = {
  denim: 'denim', leer: 'leer', katoen: 'katoen', linnen: 'linnen',
  wol: 'wol', kasjmier: 'kasjmier', tech: 'technische stoffen',
  fleece: 'fleece', canvas: 'canvas', zijde: 'zijde',
  coated: 'gecoate stoffen', ribstof: 'ribstof', stretch: 'stretchmateriaal',
  mesh: 'mesh',
};

const SUBTYPE_NL: Record<string, string> = {
  hoodie: 'hoodie', sweater: 'sweater', knit: 'knit', tshirt: 't-shirt',
  polo: 'polo', shirt: 'overhemd', overshirt: 'overshirt', cardigan: 'vest',
  jeans: 'jeans', chino: 'chino', trouser: 'pantalon', jogger: 'jogger',
  cargo: 'cargo', short: 'short', sneaker: 'sneaker', boot: 'boot',
  loafer: 'loafer', derby: 'derby', blazer: 'blazer', jacket: 'jacket',
  coat: 'jas', gilet: 'gilet',
};

function describeItemTypes(products: CleanProduct[]): string {
  const types = products
    .map(p => SUBTYPE_NL[p.subType || ''] || p.subType || p.category)
    .filter(Boolean);
  if (types.length === 0) return '';
  if (types.length === 1) return types[0];
  return types.slice(0, -1).join(', ') + ' en ' + types[types.length - 1];
}

function detectMaterialMatches(
  products: CleanProduct[],
  preferredMaterials: string[],
): { found: string[]; notFound: string[] } {
  const found: string[] = [];
  const notFound: string[] = [];
  for (const mat of preferredMaterials) {
    const matLower = mat.toLowerCase();
    const patterns = MATERIAL_KEYWORDS[mat];
    const matched = products.some(p => {
      const text = `${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
      if (text.includes(matLower)) return true;
      return patterns ? patterns.some(r => r.test(text)) : false;
    });
    const label = MAT_LABELS[mat] || mat;
    if (matched) found.push(label);
    else notFound.push(label);
  }
  return { found, notFound };
}

function detectPrintMatch(products: CleanProduct[]): 'clean' | 'print' | 'mixed' {
  const PRINT_RE = /print|patroon|floral|bloem|graphic|stripe|streep|geruit|check|stip|dots|pattern/i;
  const CLEAN_RE = /effen|uni|solid|plain/i;
  let prints = 0;
  let cleans = 0;
  for (const p of products) {
    const text = `${p.name} ${p.description}`.toLowerCase();
    if (PRINT_RE.test(text)) prints++;
    else if (CLEAN_RE.test(text)) cleans++;
  }
  if (prints > 0 && cleans > 0) return 'mixed';
  if (prints > 0) return 'print';
  return 'clean';
}

const FOOTWEAR_FORMALITY_RANK: Record<string, number> = {
  derby: 3, loafer: 2, boot: 1, sneaker: 0,
};

const LAYERING_SUBTYPES = new Set(['blazer', 'jacket', 'coat', 'gilet', 'overshirt', 'cardigan']);
const SLIM_RE = /slim|skinny|fitted|tailored|nauwsluitend/i;
const RELAXED_RE = /relaxed|loose|comfort|ruim|easy|oversized|oversize|wide|baggy/i;

function detectFootwearType(products: CleanProduct[]): string | null {
  const shoe = products.find(p => p.category === 'footwear');
  if (!shoe) return null;
  const sub = shoe.subType || '';
  if (sub === 'derby') return 'derby';
  if (sub === 'loafer') return 'loafer';
  if (sub === 'boot') return 'boot';
  if (sub === 'sneaker') return 'sneaker';
  return null;
}

function detectLayering(products: CleanProduct[]): boolean {
  return products.some(p => LAYERING_SUBTYPES.has(p.subType || ''));
}

function detectSilhouette(products: CleanProduct[]): 'slim' | 'relaxed' | 'neutral' {
  let slim = 0;
  let relaxed = 0;
  for (const p of products) {
    const t = `${p.name} ${p.description}`.toLowerCase();
    if (SLIM_RE.test(t)) slim++;
    if (RELAXED_RE.test(t)) relaxed++;
  }
  if (slim > relaxed) return 'slim';
  if (relaxed > slim) return 'relaxed';
  return 'neutral';
}

function buildDifferentiator(
  blueprint: OccasionBlueprint,
  products: CleanProduct[],
  siblingLabels: string[],
  siblingProducts?: CleanProduct[][],
): string {
  if (siblingLabels.length === 0) return '';

  const formalityDesc = FORMALITY_LABEL[blueprint.formalityHint] || 'casual';
  const itemStr = describeItemTypes(products);

  const otherFormalities = siblingLabels
    .map(l => {
      for (const [, bp] of Object.entries(OCCASION_BLUEPRINTS)) {
        if (bp.label === l) return FORMALITY_LABEL[bp.formalityHint];
      }
      return null;
    })
    .filter(Boolean);

  const allSameFormality = otherFormalities.every(f => f === formalityDesc);

  if (!allSameFormality) {
    if (formalityDesc === 'casual') {
      return itemStr
        ? `Relaxter dan de andere looks, opgebouwd rond ${itemStr}.`
        : 'Relaxter dan de andere looks in dit rapport.';
    }
    if (formalityDesc === 'formeel') {
      return itemStr
        ? `De meest nette look in dit rapport, met ${itemStr}.`
        : 'De meest nette look in dit rapport.';
    }
    return itemStr
      ? `Een trede netter, gebaseerd op ${itemStr}.`
      : 'Een trede netter dan de casual looks.';
  }

  const thisFootwear = detectFootwearType(products);
  const thisLayering = detectLayering(products);
  const thisSilhouette = detectSilhouette(products);

  if (siblingProducts && siblingProducts.length > 0) {
    const siblingFootwears = siblingProducts.map(detectFootwearType);
    const siblingLayerings = siblingProducts.map(detectLayering);
    const siblingSlhouettes = siblingProducts.map(detectSilhouette);

    if (thisFootwear) {
      const thisRank = FOOTWEAR_FORMALITY_RANK[thisFootwear] ?? -1;
      const siblingRanks = siblingFootwears
        .filter((f): f is string => f !== null)
        .map(f => FOOTWEAR_FORMALITY_RANK[f] ?? -1);
      if (siblingRanks.length > 0) {
        const allSiblingsCasualShoe = siblingRanks.every(r => r < thisRank);
        const allSiblingsNetterShoe = siblingRanks.every(r => r > thisRank);
        if (allSiblingsCasualShoe) {
          const shoeNL: Record<string, string> = { derby: 'derby', loafer: 'loafer', boot: 'boot', sneaker: 'sneaker' };
          return `Nettere schoen (${shoeNL[thisFootwear] || thisFootwear}) dan in de andere looks.`;
        }
        if (allSiblingsNetterShoe) {
          const shoeNL: Record<string, string> = { derby: 'derby', loafer: 'loafer', boot: 'boot', sneaker: 'sneaker' };
          return `Casualere schoen (${shoeNL[thisFootwear] || thisFootwear}) dan in de andere looks.`;
        }
      }
    }

    const allSiblingsLayered = siblingLayerings.every(l => l);
    const allSiblingsUnlayered = siblingLayerings.every(l => !l);
    if (thisLayering && allSiblingsUnlayered) {
      return 'Meer gelaagd dan de andere looks — met extra structuur bovenop.';
    }
    if (!thisLayering && allSiblingsLayered) {
      return 'Lichter opgebouwd dan de andere looks — zonder bovenlaag.';
    }

    const allSiblingsSame = siblingSlhouettes.every(s => s === thisSilhouette);
    const anyDifferent = siblingSlhouettes.some(s => s !== thisSilhouette);
    if (anyDifferent || !allSiblingsSame) {
      if (thisSilhouette === 'relaxed') {
        return itemStr
          ? `Ruimer silhouet dan de andere looks, opgebouwd rond ${itemStr}.`
          : 'Ruimer silhouet dan de andere looks.';
      }
      if (thisSilhouette === 'slim') {
        return itemStr
          ? `Strakker silhouet dan de andere looks, opgebouwd rond ${itemStr}.`
          : 'Strakker silhouet dan de andere looks.';
      }
    }
  }

  if (thisLayering) {
    return itemStr
      ? `Meer gelaagde look, opgebouwd rond ${itemStr}.`
      : 'Meer gelaagde structuur dan de andere looks.';
  }

  if (thisFootwear) {
    const footwearLabel: Record<string, string> = {
      derby: 'nette veterschoen', loafer: 'loafer', boot: 'boot', sneaker: 'sneaker',
    };
    return `Afgemaakt met een ${footwearLabel[thisFootwear] || thisFootwear}.`;
  }

  if (thisSilhouette === 'relaxed') {
    return itemStr ? `Ruim en relaxed silhouet, rond ${itemStr}.` : 'Ruim en relaxed silhouet.';
  }
  if (thisSilhouette === 'slim') {
    return itemStr ? `Strak en gestroomlijnd silhouet, met ${itemStr}.` : 'Strak en gestroomlijnd silhouet.';
  }

  if (itemStr) {
    return `Deze variant draait om ${itemStr}.`;
  }

  return '';
}

const CATEGORY_ROLE_NL: Record<string, string> = {
  top: 'bovenlaag',
  bottom: 'onderlaag',
  footwear: 'schoen',
  outerwear: 'buitenlaag',
  accessory: 'accessoire',
};

function buildItemReasons(
  products: CleanProduct[],
  blueprint: OccasionBlueprint,
  archetype: string,
  prefs?: UserPreferences,
): void {
  const formalityHint = blueprint.formalityHint;
  const vibeLabel = ARCHETYPE_VIBE_LABELS[archetype] || '';

  for (const p of products) {
    const reasons: string[] = [];
    const text = `${p.name} ${p.description}`.toLowerCase();
    const sub = p.subType || '';

    if (prefs?.fit && FIT_KEYWORDS[prefs.fit]) {
      const fitMatch = FIT_KEYWORDS[prefs.fit].some(r => r.test(text));
      if (fitMatch) {
        const fitNL: Record<string, string> = {
          slim: 'nauwsluitend silhouet', regular: 'reguliere pasvorm',
          relaxed: 'relaxed silhouet', oversized: 'oversized pasvorm',
        };
        reasons.push(`past bij je voorkeur voor ${fitNL[prefs.fit] || prefs.fit}`);
      }
    }

    if (prefs?.materials && prefs.materials.length > 0) {
      for (const mat of prefs.materials) {
        const patterns = MATERIAL_KEYWORDS[mat];
        if (patterns && patterns.some(r => r.test(text))) {
          const label = MAT_LABELS[mat] || mat;
          reasons.push(`bevat ${label}, een van je voorkeursmateriaal`);
          break;
        }
      }
    }

    if (reasons.length === 0 && prefs?.prints) {
      const PRINT_RE = /print|patroon|floral|bloem|graphic|stripe|streep|geruit|check|stip|dots|pattern/i;
      const CLEAN_RE = /effen|uni|solid|plain/i;
      if ((prefs.prints === 'effen' || prefs.prints === 'geen') && CLEAN_RE.test(text)) {
        reasons.push('effen item, conform je voorkeur');
      } else if (prefs.prints === 'statement' && PRINT_RE.test(text)) {
        reasons.push('expressief patroon, passend bij je voorkeur');
      }
    }

    if (reasons.length === 0) {
      if (LAYERING_SUBTYPES.has(sub)) {
        if (formalityHint === 'smart' || formalityHint === 'formal') {
          reasons.push('voegt structuur toe aan deze look');
        } else {
          reasons.push('geeft deze look extra diepte');
        }
      }

      if (reasons.length === 0 && p.category === 'footwear') {
        const rank = FOOTWEAR_FORMALITY_RANK[sub] ?? -1;
        if (formalityHint === 'smart' && rank >= 2) {
          reasons.push('houdt deze look netter afgewerkt');
        } else if (formalityHint === 'casual' && rank <= 1) {
          reasons.push('houdt deze look casual');
        } else if (sub === 'boot') {
          reasons.push('voegt een robuustere basis toe');
        }
      }

      if (reasons.length === 0 && p.category === 'top') {
        if (formalityHint === 'casual' && (sub === 'hoodie' || sub === 'sweater' || sub === 'tshirt')) {
          reasons.push('relaxed basis voor deze look');
        } else if ((formalityHint === 'smart' || formalityHint === 'formal') && (sub === 'shirt' || sub === 'polo' || sub === 'knit')) {
          reasons.push('nettere basis voor deze look');
        }
      }

      if (reasons.length === 0 && p.category === 'bottom') {
        if (sub === 'chino' || sub === 'trouser') {
          reasons.push('veelzijdige broek die bij de gelegenheid past');
        } else if (sub === 'jeans') {
          reasons.push('solide denim basis');
        } else if (sub === 'jogger' || sub === 'cargo') {
          reasons.push('comfortabel en casual');
        }
      }
    }

    if (reasons.length > 0) {
      const r = reasons[0];
      p.itemReason = r.charAt(0).toUpperCase() + r.slice(1);
    }
  }
}

function buildExplanation(
  products: CleanProduct[],
  blueprint: OccasionBlueprint,
  archetype: string,
  prefs?: UserPreferences,
  totalPrice?: number,
  siblingLabels?: string[],
  siblingProducts?: CleanProduct[][],
): string {
  const lines: string[] = [];

  const vibeLabel = ARCHETYPE_VIBE_LABELS[archetype] || archetype.replace('_', ' ').toLowerCase();
  const occasionText = OCCASION_CONTEXT[blueprint.label];
  const formalityDesc = FORMALITY_LABEL[blueprint.formalityHint] || '';

  const itemStr = describeItemTypes(products);
  if (occasionText && itemStr) {
    lines.push(`Samengesteld voor ${occasionText}: ${itemStr} — ${formalityDesc} en ${vibeLabel}.`);
  } else if (occasionText) {
    lines.push(`Samengesteld voor ${occasionText}, aansluitend bij jouw ${vibeLabel} profiel.`);
  } else {
    lines.push(`Opgebouwd vanuit jouw ${vibeLabel} stijlprofiel.`);
  }

  const signalParts: string[] = [];

  if (prefs?.fit) {
    const fitLabel: Record<string, string> = {
      slim: 'nauwsluitend', regular: 'regulier', relaxed: 'relaxed', oversized: 'oversized',
    };
    const fitText = `${fitLabel[prefs.fit] || prefs.fit} silhouet`;
    const FIT_KW = FIT_KEYWORDS[prefs.fit];
    if (FIT_KW) {
      const fitFound = products.some(p => {
        const t = `${p.name} ${p.description}`.toLowerCase();
        return FIT_KW.some(r => r.test(t));
      });
      if (fitFound) {
        signalParts.push(`${fitText} (bevestigd in de productomschrijving)`);
      } else {
        signalParts.push(`${fitText} (als scoringsrichting meegenomen)`);
      }
    } else {
      signalParts.push(fitText);
    }
  }

  if (prefs?.materials && prefs.materials.length > 0) {
    const { found, notFound } = detectMaterialMatches(products, prefs.materials);
    if (found.length > 0) {
      signalParts.push(`${found.slice(0, 2).join(' en ')} teruggevonden in de selectie`);
    }
    if (notFound.length > 0 && found.length === 0) {
      signalParts.push(`voorkeur voor ${notFound.slice(0, 2).join(' en ')} als richting meegewogen, niet letterlijk aanwezig`);
    }
  }

  if (prefs?.prints) {
    const actualPrintStatus = detectPrintMatch(products);
    if (prefs.prints === 'effen' || prefs.prints === 'geen') {
      if (actualPrintStatus === 'clean') {
        signalParts.push('effen items geselecteerd, conform jouw voorkeur');
      } else {
        signalParts.push('voorkeur voor effen meegewogen, maar niet alle items bevestigen dit');
      }
    } else if (prefs.prints === 'subtiel') {
      if (actualPrintStatus === 'print' || actualPrintStatus === 'mixed') {
        signalParts.push('subtiele patronen meegenomen in de selectie');
      } else {
        signalParts.push('voorkeur voor subtiele patronen meegewogen als richting');
      }
    } else if (prefs.prints === 'statement') {
      if (actualPrintStatus === 'print') {
        signalParts.push('expressieve prints geselecteerd, aansluitend bij jouw voorkeur');
      } else {
        signalParts.push('voorkeur voor statement prints meegewogen, beperkt beschikbaar in de catalogus');
      }
    }
  }

  if (prefs?.colorProfile) {
    const cp = prefs.colorProfile;
    const colorDesc: string[] = [];
    const tempMap: Record<string, string> = { warm: 'warme', koel: 'koele', neutraal: 'neutrale' };
    const valMap: Record<string, string> = { licht: 'lichte', medium: 'middentoon', donker: 'diepe' };
    if (cp.temperature && tempMap[cp.temperature]) colorDesc.push(tempMap[cp.temperature]);
    if (cp.value && valMap[cp.value]) colorDesc.push(valMap[cp.value]);
    if (colorDesc.length > 0) {
      signalParts.push(`kleurkeuze gericht op ${colorDesc.join(', ')} tinten`);
    }
  }

  if (prefs?.goals && prefs.goals.length > 0) {
    const goalLabels: Record<string, string> = {
      timeless: 'tijdloze basisstukken',
      trendy: 'actuele trends',
      comfort: 'draagcomfort',
      professional: 'professionele uitstraling',
    };
    const matched = prefs.goals.map(g => goalLabels[g]).filter(Boolean);
    if (matched.length > 0) {
      signalParts.push(`gericht op ${matched.slice(0, 2).join(' en ')}`);
    }
  }

  if (signalParts.length > 0) {
    const signalStr = signalParts[0].charAt(0).toUpperCase() + signalParts[0].slice(1)
      + (signalParts.length > 1 ? '; ' + signalParts.slice(1).join('; ') : '')
      + '.';
    lines.push(signalStr);
  }

  const diff = buildDifferentiator(blueprint, products, siblingLabels || [], siblingProducts);
  if (diff) lines.push(diff);

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  if (brands.length >= 2) {
    lines.push(`Mix van ${brands.slice(0, 3).join(', ')}.`);
  }

  return lines.join(' ');
}

function pickBest(
  pool: CleanProduct[],
  blueprint: OccasionBlueprint,
  archetype: string,
  seed: number,
  selectedBrands: Set<string>,
  existingProducts: CleanProduct[],
  prefs?: UserPreferences,
  diversityTracker?: ReportDiversityTracker,
  isRepeatedOccasion?: boolean,
): CleanProduct | null {
  if (pool.length === 0) return null;

  const scored = pool
    .map(p => {
      let s = scoreProduct(p, blueprint, archetype, selectedBrands, existingProducts, prefs);
      if (diversityTracker) {
        s += reportBrandPenalty(p.brand, diversityTracker);
        const usedSubTypes = diversityTracker.subTypeSignatures.flat();
        const pSub = p.subType || p.category;
        const subTypeCount = usedSubTypes.filter(st => st === pSub).length;
        if (isRepeatedOccasion) {
          if (subTypeCount >= 2) s -= 30;
          else if (subTypeCount === 1) s -= 12;
        } else {
          if (subTypeCount >= 2) s -= 15;
          else if (subTypeCount === 1) s -= 6;
        }
      }
      return { p, score: s };
    })
    .sort((a, b) => b.score - a.score);

  const topTier = scored.slice(0, Math.max(5, Math.ceil(scored.length * 0.2)));
  const effectiveSeed = isRepeatedOccasion ? seed + 199 : seed;
  const idx = ((effectiveSeed * 16807) % 2147483647) % topTier.length;
  return topTier[Math.abs(idx)]?.p || scored[0]?.p || null;
}

const FIT_KEYWORDS: Record<string, RegExp[]> = {
  slim: [/slim/i, /skinny/i, /fitted/i, /tailored/i, /nauwsluitend/i],
  regular: [/regular/i, /classic/i, /standaard/i, /normaal/i],
  relaxed: [/relaxed/i, /loose/i, /comfort/i, /ruim/i, /easy/i],
  oversized: [/oversized/i, /oversize/i, /extra\s*ruim/i, /wide/i, /baggy/i],
};

const MATERIAL_KEYWORDS: Record<string, RegExp[]> = {
  katoen: [/katoen/i, /cotton/i],
  wol: [/wol/i, /wool/i, /merino/i],
  kasjmier: [/kasjmier/i, /cashmere/i],
  denim: [/denim/i, /jeans/i, /spijker/i],
  fleece: [/fleece/i],
  tech: [/tech/i, /nylon/i, /polyester/i, /performance/i, /technisch/i],
  linnen: [/linnen/i, /linen/i],
  leer: [/\bleer\b/i, /\bleren\b/i, /\bleder\b/i, /\blederen\b/i, /leather/i, /suede/i, /nubuck/i],
  canvas: [/canvas/i],
  coated: [/coated/i, /gecoat/i, /waxed/i, /gewaxed/i],
  ribstof: [/ribstof/i, /\brib\b/i, /corduroy/i, /ribfluweel/i],
  stretch: [/stretch/i, /elastan/i, /elastane/i, /spandex/i, /lycra/i],
  mesh: [/mesh/i, /gaas/i, /netmateriaal/i],
  zijde: [/zijde/i, /\bsilk\b/i, /satijn/i, /\bsatin\b/i],
};

function scoreProduct(
  p: CleanProduct,
  blueprint: OccasionBlueprint,
  archetype: string,
  selectedBrands: Set<string>,
  existingProducts: CleanProduct[],
  prefs?: UserPreferences,
): number {
  let score = 0;

  const styleIdx = blueprint.preferredStyles.indexOf(p.style);
  if (styleIdx === 0) score += 30;
  else if (styleIdx === 1) score += 20;
  else if (styleIdx >= 2) score += 10;
  else score += 3;

  const blueprintWantsAthletic = blueprint.preferredStyles.includes('athletic');
  const intent = p.athleticIntent ?? 0;
  if (blueprintWantsAthletic && intent > 0) {
    score += Math.round(intent * 35);
  } else if (!blueprintWantsAthletic && intent >= 0.8) {
    score -= 15;
  }

  const formality = formalityScore(p);
  const targetFormality = blueprint.formalityHint === 'formal' ? 0.8 : blueprint.formalityHint === 'smart' ? 0.6 : 0.3;
  score += (1 - Math.abs(formality - targetFormality)) * 15;

  if (blueprint.brandDiversity && selectedBrands.has(p.brand.toLowerCase())) {
    score -= 20;
  }

  if (existingProducts.length > 0) {
    const avgColorCompat = existingProducts.reduce((s, ep) =>
      s + colorCompatibility(p.colors, ep.colors), 0
    ) / existingProducts.length;
    score += avgColorCompat * 15;
  }

  const ARCHETYPE_BRAND_BOOST: Record<string, RegExp[]> = {
    MINIMALIST: [/COS/i, /ARKET/i, /Uniqlo/i, /\bNN07\b/i, /Drykorn/i, /Filippa K/i],
    CLASSIC: [/Boss/i, /Profuomo/i, /Cavallaro/i, /Genti/i, /Giorgio/i, /Olymp/i, /Xacus/i, /Pierre cardin/i],
    SMART_CASUAL: [/Cast iron/i, /PME/i, /Vanguard/i, /State of art/i, /Blue industry/i],
    STREETWEAR: [/Puma/i, /Replay/i, /Denham/i, /Nubikk/i],
    ATHLETIC: [/Nike/i, /Adidas/i, /Puma/i, /New Balance/i, /Reebok/i, /Under Armour/i, /Asics/i],
    AVANT_GARDE: [/Mart Visser/i, /Drykorn/i],
  };

  const boosts = ARCHETYPE_BRAND_BOOST[archetype] || [];
  if (boosts.some(r => r.test(p.brand))) score += 12;

  if (p.price >= 40 && p.price <= 200) score += 5;
  if (p.price >= 60 && p.price <= 150) score += 3;

  if (prefs) {
    const text = `${p.name} ${p.description}`.toLowerCase();

    if (prefs.fit && FIT_KEYWORDS[prefs.fit]) {
      const fitMatch = FIT_KEYWORDS[prefs.fit].some(r => r.test(text));
      if (fitMatch) score += 18;
    }

    if (prefs.materials && prefs.materials.length > 0) {
      let matMatched = false;
      for (const mat of prefs.materials) {
        const matPatterns = MATERIAL_KEYWORDS[mat];
        if (matPatterns && matPatterns.some(r => r.test(text))) {
          score += 18;
          matMatched = true;
          break;
        }
      }
      if (!matMatched) {
        const allText = `${text} ${p.tags.join(' ')}`;
        for (const mat of prefs.materials) {
          const fallbackPatterns = MATERIAL_KEYWORDS[mat];
          if (fallbackPatterns && fallbackPatterns.some(r => r.test(allText))) {
            score += 10;
            break;
          }
        }
      }
    }

    if (prefs.prints) {
      const PRINT_DETECT = /print|patroon|floral|bloem|graphic|stripe|streep|geruit|check|stip|dots|pattern/i;
      const hasPrint = PRINT_DETECT.test(text);
      const isExplicitlyClean = /effen|uni|solid|plain/i.test(text);
      if (prefs.prints === 'effen' || prefs.prints === 'geen') {
        if (isExplicitlyClean) score += 12;
        else if (!hasPrint) score += 4;
        else score -= 8;
      } else if (prefs.prints === 'subtiel') {
        if (/stripe|streep|dots|stip|geruit|check/i.test(text)) score += 14;
      } else if (prefs.prints === 'statement') {
        if (/print|patroon|floral|bloem|graphic|bold|oversized.*tee|graphic tee|allover/i.test(text)) score += 20;
        else if (!hasPrint) score -= 4;
      }
    }

    if (prefs.goals && prefs.goals.length > 0) {
      if (prefs.goals.includes('timeless') && /classic|tijdloos|timeless|essential/i.test(text)) score += 6;
      if (prefs.goals.includes('trendy') && /trend|nieuw|new|2025|2026|season/i.test(text)) score += 6;
      if (prefs.goals.includes('comfort') && /comfort|soft|zacht|stretch|relax/i.test(text)) score += 6;
      if (prefs.goals.includes('professional') && /business|office|professioneel|kantoor/i.test(text)) score += 6;
    }

    if (prefs.budget && prefs.budget.max > 0) {
      const max = prefs.budget.max;
      if (p.price <= max) {
        score += 20;
        const ratio = p.price / max;
        if (ratio >= 0.3 && ratio <= 0.9) score += 10;
      } else {
        const overshoot = (p.price - max) / max;
        score -= 30 + Math.round(overshoot * 40);
      }
    }

    if (prefs.colorProfile?.season && p.colors.length > 0) {
      const cp = prefs.colorProfile as { season: string; temperature?: string; value?: string; contrast?: string };
      let bestColorScore = 0;
      for (const c of p.colors) {
        const result = matchesColorSeason(c, { season: cp.season } as any);
        if (!result.isAllowed) {
          score -= 25;
          break;
        }
        if (result.score > bestColorScore) bestColorScore = result.score;
      }
      score += bestColorScore * 20;

      if (cp.value === 'donker') {
        const hasDark = p.colors.some(c => /zwart|donker|dark|navy|bruin|chocolate|charcoal|burgundy|wine/i.test(c));
        if (hasDark) score += 8;
      } else if (cp.value === 'licht') {
        const hasLight = p.colors.some(c => /wit|licht|light|cream|ivory|pastel|beige|off-white|sand/i.test(c));
        if (hasLight) score += 8;
      }
    }
  }

  return score;
}

function calculateOutfitScore(
  products: CleanProduct[],
  blueprint: OccasionBlueprint,
  archetype: string,
): number {
  let score = 60;

  let styleMatches = products.filter(p => blueprint.preferredStyles.includes(p.style)).length;
  if (blueprint.preferredStyles.includes('athletic')) {
    styleMatches += products.filter(p =>
      !blueprint.preferredStyles.includes(p.style) && (p.athleticIntent ?? 0) >= 0.5
    ).length;
  }
  score += (Math.min(styleMatches, products.length) / products.length) * 15;

  const brands = new Set(products.map(p => p.brand.toLowerCase()));
  const diversityRatio = brands.size / products.length;
  score += diversityRatio * 10;

  const allColors = products.flatMap(p => p.colors);
  const NEUTRAL = ['zwart', 'wit', 'grijs', 'beige', 'donkerblauw', 'navy', 'cream', 'taupe', 'bruin', 'black', 'white', 'grey'];
  const neutralCount = allColors.filter(c => NEUTRAL.some(n => c.toLowerCase().includes(n))).length;
  const neutralRatio = allColors.length > 0 ? neutralCount / allColors.length : 0.5;
  if (neutralRatio >= 0.5 && neutralRatio <= 0.85) score += 8;
  else if (neutralRatio > 0.85) score += 4;

  const hasAllRequired = blueprint.required.every(cat =>
    products.some(p => p.category === cat || (cat === 'bottom' && p.category === 'skirt'))
  );
  if (hasAllRequired) score += 7;

  return Math.min(98, Math.max(55, Math.round(score)));
}
