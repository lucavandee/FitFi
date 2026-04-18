import type {
  NormalizedCategory,
  OccasionKey,
  OutfitCandidate,
  ScoredProduct,
  UserStyleProfile,
  Season,
} from './types';
import type { ArchetypeKey } from '@/config/archetypes';
import type { FilterResult } from './candidateFilter';
import {
  coherenceMultiplier,
  evaluateCoherence,
  isHardMismatch,
} from './coherence';

export interface ComposerOptions {
  perOccasion: number;
  poolSize: number;
  seed: number;
  season?: Season;
}

const OCCASION_TARGET_FORMALITY: Record<OccasionKey, number> = {
  work: 0.65,
  formal: 0.85,
  casual: 0.3,
  date: 0.6,
  travel: 0.4,
  sport: 0.15,
  party: 0.35,
};

const OCCASION_WANTS_OUTERWEAR: Record<OccasionKey, number> = {
  work: 0.55,
  formal: 0.5,
  casual: 0.25,
  date: 0.4,
  travel: 0.4,
  sport: 0.05,
  party: 0.4,
};

const OCCASION_WANTS_ACCESSORY: Record<OccasionKey, number> = {
  work: 0.5,
  formal: 0.5,
  casual: 0.35,
  date: 0.55,
  travel: 0.2,
  sport: 0.0,
  party: 0.45,
};

const COOL_SEASONS: Season[] = ['autumn', 'winter'];

function resolveOuterwearChance(
  occasion: OccasionKey,
  archetype: ArchetypeKey,
  season: Season | undefined
): number {
  let chance = OCCASION_WANTS_OUTERWEAR[occasion];
  if (occasion === 'casual' && season && COOL_SEASONS.includes(season)) {
    chance = Math.max(chance, 0.45);
  }
  if (archetype === 'AVANT_GARDE') {
    chance = Math.max(chance, 0.5);
  }
  return chance;
}

function resolveAccessoryChance(
  occasion: OccasionKey,
  archetype: ArchetypeKey
): number {
  let chance = OCCASION_WANTS_ACCESSORY[occasion];
  if (archetype === 'STREETWEAR') {
    if (occasion === 'party') chance = Math.max(chance, 0.65);
    else if (occasion === 'casual') chance = Math.max(chance, 0.5);
  }
  if (archetype === 'CLASSIC' || archetype === 'SMART_CASUAL') {
    if (occasion === 'work') chance = Math.max(chance, 0.55);
    else if (occasion === 'date') chance = Math.max(chance, 0.6);
  }
  if (archetype === 'AVANT_GARDE') {
    chance = Math.max(chance, 0.55);
  }
  return chance;
}

const FORMAL_OCCASIONS: OccasionKey[] = ['work', 'date', 'formal'];
const DRESSED_ARCHETYPES: ArchetypeKey[] = [
  'CLASSIC',
  'SMART_CASUAL',
  'BUSINESS',
];

function requiresAccessory(
  occasion: OccasionKey,
  archetype: ArchetypeKey
): boolean {
  return (
    FORMAL_OCCASIONS.includes(occasion) &&
    DRESSED_ARCHETYPES.includes(archetype)
  );
}

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function shuffleSeeded<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function scoreFor(product: ScoredProduct, occasion: OccasionKey): number {
  return product.scoreByOccasion?.[occasion] ?? product.score;
}

function rankForOccasion(
  products: ScoredProduct[],
  targetFormality: number,
  occasion: OccasionKey
): ScoredProduct[] {
  return [...products].sort((a, b) => {
    const aDist = Math.abs(a.formality - targetFormality);
    const bDist = Math.abs(b.formality - targetFormality);
    const aScore = scoreFor(a, occasion) - aDist * 0.25;
    const bScore = scoreFor(b, occasion) - bDist * 0.25;
    return bScore - aScore;
  });
}

function buildPreferredBrandSet(profile: UserStyleProfile): Set<string> | null {
  const prefs = profile.preferredBrands;
  if (!prefs || prefs.length === 0) return null;
  const set = new Set(
    prefs.map((b) => b.toLowerCase().trim()).filter(Boolean)
  );
  return set.size > 0 ? set : null;
}

function isPreferredBrand(
  product: ScoredProduct,
  prefSet: Set<string>
): boolean {
  const brand = String(product.product.brand ?? '').toLowerCase().trim();
  if (!brand) return false;
  if (prefSet.has(brand)) return true;
  for (const pref of prefSet) {
    if (brand.includes(pref) || pref.includes(brand)) return true;
  }
  return false;
}

function pickTopPool(
  products: ScoredProduct[],
  targetFormality: number,
  poolSize: number,
  rand: () => number,
  occasion: OccasionKey,
  profile: UserStyleProfile
): ScoredProduct[] {
  const ranked = rankForOccasion(products, targetFormality, occasion);
  const pool = ranked.slice(0, Math.max(poolSize, 4));
  const shuffled = shuffleSeeded(pool, rand);

  const prefSet = buildPreferredBrandSet(profile);
  if (!prefSet) return shuffled;

  // Brand injection: if a preferred-brand item is in the top half of the
  // ranked candidates for this slot, promote the best-ranked one to pool[0]
  // so the composer actually picks it. Skips when no preferred items are
  // competitive — we don't force bad matches.
  const topHalfCount = Math.max(1, Math.ceil(ranked.length / 2));
  const topHalf = ranked.slice(0, topHalfCount);
  const bestPreferred = topHalf.find((p) => isPreferredBrand(p, prefSet));
  if (!bestPreferred) return shuffled;

  if (shuffled[0]?.product.id === bestPreferred.product.id) return shuffled;
  const rest = shuffled.filter(
    (p) => p.product.id !== bestPreferred.product.id
  );
  return [bestPreferred, ...rest];
}

function workFootwearFloor(profile: UserStyleProfile): number {
  const relaxed =
    profile.primaryArchetype === 'STREETWEAR' ||
    profile.primaryArchetype === 'SMART_CASUAL';
  return relaxed ? 0.15 : 0.35;
}

function workBottomFloor(profile: UserStyleProfile): number {
  const relaxed =
    profile.primaryArchetype === 'STREETWEAR' ||
    profile.primaryArchetype === 'SMART_CASUAL';
  return relaxed ? 0.25 : 0.4;
}

const CASUAL_FOOTWEAR_CEILING = 0.7;

const WORK_NEGATIVE_KEYWORDS = [
  'flannel',
  'geruit',
  'check',
  'plaid',
  'field',
  'outdoor',
];

function hasWorkNegativeKeyword(scored: ScoredProduct): boolean {
  const p = scored.product;
  const haystack = [p.name, p.description, p.type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (!haystack) return false;
  return WORK_NEGATIVE_KEYWORDS.some((kw) => haystack.includes(kw));
}

function filterFootwearForOccasion(
  products: ScoredProduct[],
  occasion: OccasionKey,
  profile: UserStyleProfile
): ScoredProduct[] {
  if (occasion === 'work') {
    const floor = workFootwearFloor(profile);
    const filtered = products.filter((p) => p.formality >= floor);
    return filtered.length > 0 ? filtered : products;
  }
  if (occasion === 'casual') {
    const filtered = products.filter(
      (p) => p.formality <= CASUAL_FOOTWEAR_CEILING
    );
    return filtered.length > 0 ? filtered : products;
  }
  return products;
}

function filterBottomsForOccasion(
  products: ScoredProduct[],
  occasion: OccasionKey,
  profile: UserStyleProfile
): ScoredProduct[] {
  if (occasion !== 'work') return products;
  const floor = workBottomFloor(profile);
  const filtered = products.filter(
    (p) => p.formality >= floor && !hasWorkNegativeKeyword(p)
  );
  return filtered.length > 0 ? filtered : products;
}

function filterTopsForOccasion(
  products: ScoredProduct[],
  occasion: OccasionKey
): ScoredProduct[] {
  if (occasion !== 'work') return products;
  const filtered = products.filter((p) => !hasWorkNegativeKeyword(p));
  return filtered.length > 0 ? filtered : products;
}

function brandPenalty(products: ScoredProduct[]): number {
  const brands = products
    .map((p) => (p.product.brand || '').toLowerCase().trim())
    .filter(Boolean);
  if (brands.length <= 1) return 1;
  const uniq = new Set(brands);
  if (uniq.size < brands.length) return 0.9;
  return 1;
}

function priceSum(products: ScoredProduct[]): number {
  return products.reduce((acc, p) => acc + (p.product.price ?? 0), 0);
}

function withinTotalBudget(
  products: ScoredProduct[],
  profile: UserStyleProfile
): boolean {
  if (!profile.budget.totalMax) return true;
  return priceSum(products) <= profile.budget.totalMax * 1.2;
}

function buildOutfitId(
  occasion: OccasionKey,
  products: ScoredProduct[],
  index: number
): string {
  const ids = products.map((p) => p.product.id).join('-');
  return `v2-${occasion}-${index}-${ids.slice(0, 40)}`;
}

function assembleReasons(
  products: ScoredProduct[],
  occasion: OccasionKey
): string[] {
  const reasons = new Set<string>();
  reasons.add(`occasion_${occasion}`);
  for (const p of products) {
    for (const r of p.reasons.slice(0, 2)) {
      if (r) reasons.add(r);
    }
  }
  return Array.from(reasons).slice(0, 8);
}

function scoreComposition(
  products: ScoredProduct[],
  profile: UserStyleProfile,
  occasion: OccasionKey
): { coherence: ReturnType<typeof evaluateCoherence>; score: number } {
  const coherence = evaluateCoherence(products, profile);
  const productAvg =
    products.reduce((acc, p) => acc + scoreFor(p, occasion), 0) /
    Math.max(1, products.length);
  const baseScore = productAvg * 0.55 + coherence.combined * 0.45;
  const multiplier = coherenceMultiplier(coherence) * brandPenalty(products);
  return { coherence, score: Math.max(0, Math.min(1, baseScore * multiplier)) };
}

function tryCompose(
  picks: {
    top?: ScoredProduct;
    bottom?: ScoredProduct;
    footwear?: ScoredProduct;
    dress?: ScoredProduct;
    outerwear?: ScoredProduct;
    accessory?: ScoredProduct;
  },
  profile: UserStyleProfile
): ScoredProduct[] | null {
  const items: ScoredProduct[] = [];
  const seenIds = new Set<string>();
  const pushRequired = (p?: ScoredProduct) => {
    if (!p) return false;
    if (seenIds.has(p.product.id)) return false;
    seenIds.add(p.product.id);
    items.push(p);
    return true;
  };
  const pushOptional = (p?: ScoredProduct) => {
    if (!p) return true;
    if (seenIds.has(p.product.id)) return false;
    seenIds.add(p.product.id);
    items.push(p);
    return true;
  };

  if (picks.dress) {
    if (!pushRequired(picks.dress)) return null;
  } else {
    if (!pushRequired(picks.top)) return null;
    if (!pushRequired(picks.bottom)) return null;
  }
  if (!pushRequired(picks.footwear)) return null;
  if (!pushOptional(picks.outerwear)) return null;
  if (!pushOptional(picks.accessory)) return null;

  if (isHardMismatch(items, profile)) return null;
  if (!withinTotalBudget(items, profile)) return null;
  return items;
}

function composeForOccasion(
  occasion: OccasionKey,
  byCategory: FilterResult['byCategory'],
  profile: UserStyleProfile,
  count: number,
  poolSize: number,
  baseSeed: number,
  season: Season | undefined
): OutfitCandidate[] {
  const targetFormality = OCCASION_TARGET_FORMALITY[occasion];
  const wantOuterwear = resolveOuterwearChance(
    occasion,
    profile.primaryArchetype,
    season
  );
  const wantAccessory = resolveAccessoryChance(
    occasion,
    profile.primaryArchetype
  );
  const mustHaveAccessory = requiresAccessory(
    occasion,
    profile.primaryArchetype
  );

  const allowDress =
    profile.gender === 'female' ||
    profile.gender === 'non-binary' ||
    profile.gender === 'unisex';

  const candidates: OutfitCandidate[] = [];
  const seenSignatures = new Set<string>();
  const maxAttempts = count * 12;

  for (let attempt = 0; attempt < maxAttempts && candidates.length < count; attempt++) {
    const rand = seededRandom(baseSeed + attempt * 31 + occasion.length);
    // Independent streams for optional-item dice rolls so shuffle-call depth
    // (and a shared aux stream) can't correlate outerwear vs accessory inclusion.
    const auxRand = seededRandom(baseSeed * 7919 + attempt * 41 + occasion.length * 13 + 17);
    const accRand = seededRandom(baseSeed * 6271 + attempt * 59 + occasion.length * 23 + 31);

    const useDress =
      allowDress &&
      byCategory.dress.length > 0 &&
      rand() < (profile.gender === 'female' ? 0.3 : 0.1);

    const useJumpsuit =
      !useDress &&
      allowDress &&
      byCategory.jumpsuit.length > 0 &&
      rand() < 0.08;

    let picks: Parameters<typeof tryCompose>[0] = {};
    if (useDress) {
      const pool = pickTopPool(byCategory.dress, targetFormality, poolSize, rand, occasion, profile);
      picks.dress = pool[0];
    } else if (useJumpsuit) {
      const pool = pickTopPool(byCategory.jumpsuit, targetFormality, poolSize, rand, occasion, profile);
      picks.dress = pool[0];
    } else {
      const topCandidates = filterTopsForOccasion(byCategory.top, occasion);
      const bottomCandidates = filterBottomsForOccasion(
        byCategory.bottom,
        occasion,
        profile
      );
      const topPool = pickTopPool(
        topCandidates,
        targetFormality,
        poolSize,
        rand,
        occasion,
        profile
      );
      const bottomPool = pickTopPool(
        bottomCandidates,
        targetFormality,
        poolSize,
        rand,
        occasion,
        profile
      );
      picks.top = topPool[0];
      picks.bottom = bottomPool[0];
    }

    const footwearCandidates = filterFootwearForOccasion(
      byCategory.footwear,
      occasion,
      profile
    );
    if (footwearCandidates.length > 0) {
      const pool = pickTopPool(
        footwearCandidates,
        targetFormality,
        poolSize,
        rand,
        occasion,
        profile
      );
      picks.footwear = pool[0];
    }

    if (byCategory.outerwear.length > 0 && auxRand() < wantOuterwear) {
      const pool = pickTopPool(
        byCategory.outerwear,
        targetFormality,
        Math.max(3, Math.floor(poolSize / 2)),
        rand,
        occasion,
        profile
      );
      picks.outerwear = pool[0];
    }

    const accessoryRoll = accRand();
    const pickAccessory =
      byCategory.accessory.length > 0 &&
      (accessoryRoll < wantAccessory || mustHaveAccessory);
    if (pickAccessory) {
      const pool = pickTopPool(
        byCategory.accessory,
        targetFormality,
        Math.max(3, Math.floor(poolSize / 2)),
        rand,
        occasion,
        profile
      );
      picks.accessory = pool[0];
    }

    const products = tryCompose(picks, profile);
    if (!products || products.length < 2) continue;

    const signature = products
      .map((p) => p.product.id)
      .sort()
      .join('|');
    if (seenSignatures.has(signature)) continue;
    seenSignatures.add(signature);

    const { coherence, score } = scoreComposition(products, profile, occasion);
    if (score < 0.35) continue;

    candidates.push({
      id: buildOutfitId(occasion, products, candidates.length),
      occasion,
      targetFormality,
      products,
      compositionScore: score,
      coherence: {
        colorHarmony: coherence.colorHarmony,
        formalitySpread: coherence.formalitySpread,
        archetypeCoherence: coherence.archetypeCoherence,
        completeness: coherence.completeness,
      },
      reasons: assembleReasons(products, occasion).concat(coherence.reasons),
    });
  }

  return candidates.sort((a, b) => b.compositionScore - a.compositionScore);
}

export interface ComposeResult {
  byOccasion: Record<OccasionKey, OutfitCandidate[]>;
  allCandidates: OutfitCandidate[];
}

export function composeOutfits(
  filter: FilterResult,
  profile: UserStyleProfile,
  options: ComposerOptions
): ComposeResult {
  const byOccasion: Record<OccasionKey, OutfitCandidate[]> = {
    work: [],
    casual: [],
    formal: [],
    date: [],
    travel: [],
    sport: [],
    party: [],
  };

  const occasions: OccasionKey[] =
    profile.occasions.length > 0 ? profile.occasions : ['casual', 'work'];

  for (const occ of occasions) {
    byOccasion[occ] = composeForOccasion(
      occ,
      filter.byCategory,
      profile,
      options.perOccasion,
      options.poolSize,
      options.seed,
      options.season
    );
  }

  const allCandidates = occasions
    .flatMap((occ) => byOccasion[occ])
    .sort((a, b) => b.compositionScore - a.compositionScore);

  return { byOccasion, allCandidates };
}
