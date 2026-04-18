import type {
  NormalizedCategory,
  OccasionKey,
  OutfitCandidate,
  ScoredProduct,
  UserStyleProfile,
} from './types';
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
  work: 0.35,
  formal: 0.45,
  casual: 0.2,
  date: 0.3,
  travel: 0.4,
  sport: 0.05,
  party: 0.15,
};

const OCCASION_WANTS_ACCESSORY: Record<OccasionKey, number> = {
  work: 0.2,
  formal: 0.3,
  casual: 0.15,
  date: 0.25,
  travel: 0.1,
  sport: 0.0,
  party: 0.3,
};

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

function pickTopPool(
  products: ScoredProduct[],
  targetFormality: number,
  poolSize: number,
  rand: () => number,
  occasion: OccasionKey
): ScoredProduct[] {
  const ranked = rankForOccasion(products, targetFormality, occasion);
  const pool = ranked.slice(0, Math.max(poolSize, 4));
  return shuffleSeeded(pool, rand);
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
  baseSeed: number
): OutfitCandidate[] {
  const targetFormality = OCCASION_TARGET_FORMALITY[occasion];
  const wantOuterwear = OCCASION_WANTS_OUTERWEAR[occasion];
  const wantAccessory = OCCASION_WANTS_ACCESSORY[occasion];

  const allowDress =
    profile.gender === 'female' ||
    profile.gender === 'non-binary' ||
    profile.gender === 'unisex';

  const candidates: OutfitCandidate[] = [];
  const seenSignatures = new Set<string>();
  const maxAttempts = count * 12;

  for (let attempt = 0; attempt < maxAttempts && candidates.length < count; attempt++) {
    const rand = seededRandom(baseSeed + attempt * 31 + occasion.length);

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
      const pool = pickTopPool(byCategory.dress, targetFormality, poolSize, rand, occasion);
      picks.dress = pool[0];
    } else if (useJumpsuit) {
      const pool = pickTopPool(byCategory.jumpsuit, targetFormality, poolSize, rand, occasion);
      picks.dress = pool[0];
    } else {
      const topPool = pickTopPool(byCategory.top, targetFormality, poolSize, rand, occasion);
      const bottomPool = pickTopPool(
        byCategory.bottom,
        targetFormality,
        poolSize,
        rand,
        occasion
      );
      picks.top = topPool[0];
      picks.bottom = bottomPool[0];
    }

    if (byCategory.footwear.length > 0) {
      const pool = pickTopPool(byCategory.footwear, targetFormality, poolSize, rand, occasion);
      picks.footwear = pool[0];
    }

    if (byCategory.outerwear.length > 0 && rand() < wantOuterwear) {
      const pool = pickTopPool(
        byCategory.outerwear,
        targetFormality,
        Math.max(3, Math.floor(poolSize / 2)),
        rand,
        occasion
      );
      picks.outerwear = pool[0];
    }

    if (byCategory.accessory.length > 0 && rand() < wantAccessory) {
      const pool = pickTopPool(
        byCategory.accessory,
        targetFormality,
        Math.max(3, Math.floor(poolSize / 2)),
        rand,
        occasion
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
      options.seed
    );
  }

  const allCandidates = occasions
    .flatMap((occ) => byOccasion[occ])
    .sort((a, b) => b.compositionScore - a.compositionScore);

  return { byOccasion, allCandidates };
}
