import type { NormalizedCategory, OutfitCandidate } from './types';

export interface DiversifyOptions {
  count: number;
  occasionBalance: boolean;
  excludeIds?: string[];
}

const OVERLAP_THRESHOLD_STRICT = 0.25;
const OVERLAP_THRESHOLD_RELAXED = 0.5;
const PER_SLOT_PENALTY = 0.2;
const REUSE_PENALTY = 0.15;

function productOverlap(a: OutfitCandidate, b: OutfitCandidate): number {
  const aIds = new Set(a.products.map((p) => p.product.id));
  const bIds = new Set(b.products.map((p) => p.product.id));
  let overlap = 0;
  aIds.forEach((id) => {
    if (bIds.has(id)) overlap++;
  });
  return overlap / Math.max(aIds.size, bIds.size);
}

function archetypeSignature(candidate: OutfitCandidate): string {
  const totals: Record<string, number> = {};
  for (const p of candidate.products) {
    for (const [k, v] of Object.entries(p.archetypeFit)) {
      totals[k] = (totals[k] ?? 0) + (v ?? 0);
    }
  }
  const top = Object.entries(totals).sort(([, a], [, b]) => b - a)[0]?.[0];
  return top ?? 'unknown';
}

function colorSignature(candidate: OutfitCandidate): string {
  const colors = new Set<string>();
  for (const p of candidate.products) {
    for (const c of p.colorTags.slice(0, 2)) colors.add(c);
  }
  return Array.from(colors).sort().slice(0, 3).join(',');
}

function productIdByCategory(
  candidate: OutfitCandidate,
  category: NormalizedCategory
): string | null {
  const match = candidate.products.find((p) => p.category === category);
  return match?.product.id ?? null;
}

function countUniqueProducts(candidates: OutfitCandidate[]): number {
  const set = new Set<string>();
  for (const c of candidates) {
    for (const p of c.products) set.add(p.product.id);
  }
  return set.size;
}

function countUniqueByCategory(
  candidates: OutfitCandidate[],
  category: NormalizedCategory
): number {
  const set = new Set<string>();
  for (const c of candidates) {
    for (const p of c.products) {
      if (p.category === category) set.add(p.product.id);
    }
  }
  return set.size;
}

export function diversifyOutfits(
  candidates: OutfitCandidate[],
  options: DiversifyOptions
): OutfitCandidate[] {
  const exclude = new Set(options.excludeIds ?? []);
  const pool = candidates.filter(
    (c) => !c.products.some((p) => exclude.has(p.product.id))
  );
  if (pool.length === 0) return [];

  // If the pool has enough unique products, cap every product to a single outfit.
  // Otherwise allow at most 2 appearances to avoid starving the result set.
  const uniqueProductsInPool = countUniqueProducts(pool);
  const MAX_APPEARANCES =
    uniqueProductsInPool >= options.count * 3 ? 1 : 2;

  // When there is enough shoe variety, enforce strict footwear uniqueness.
  const footwearUniquesInPool = countUniqueByCategory(pool, 'footwear');
  const STRICT_FOOTWEAR_UNIQUE = footwearUniquesInPool >= 3;

  const selected: OutfitCandidate[] = [];
  const seenArchetypeSignatures = new Map<string, number>();
  const seenColorSignatures = new Map<string, number>();
  const seenOccasions = new Map<string, number>();
  const productAppearances = new Map<string, number>();
  const usedProductIds = new Set<string>();
  const usedFootwearIds = new Set<string>();
  const usedBottomIds = new Set<string>();
  const usedOuterwearIds = new Set<string>();

  const hasOverusedProduct = (cand: OutfitCandidate) =>
    cand.products.some(
      (p) => (productAppearances.get(p.product.id) ?? 0) >= MAX_APPEARANCES
    );

  const registerProducts = (cand: OutfitCandidate) => {
    for (const p of cand.products) {
      productAppearances.set(
        p.product.id,
        (productAppearances.get(p.product.id) ?? 0) + 1
      );
      usedProductIds.add(p.product.id);
    }
    const fw = productIdByCategory(cand, 'footwear');
    if (fw) usedFootwearIds.add(fw);
    const bt = productIdByCategory(cand, 'bottom');
    if (bt) usedBottomIds.add(bt);
    const ow = productIdByCategory(cand, 'outerwear');
    if (ow) usedOuterwearIds.add(ow);
  };

  const effectiveScore = (cand: OutfitCandidate): number => {
    let score = cand.compositionScore;
    for (const p of cand.products) {
      if (usedProductIds.has(p.product.id)) {
        score -= REUSE_PENALTY;
      }
    }
    const fw = productIdByCategory(cand, 'footwear');
    if (fw && usedFootwearIds.has(fw)) score -= PER_SLOT_PENALTY;
    const bt = productIdByCategory(cand, 'bottom');
    if (bt && usedBottomIds.has(bt)) score -= PER_SLOT_PENALTY;
    const ow = productIdByCategory(cand, 'outerwear');
    if (ow && usedOuterwearIds.has(ow)) score -= PER_SLOT_PENALTY;
    return score;
  };

  const accept = (
    cand: OutfitCandidate,
    phase: 'strict' | 'relaxed'
  ): boolean => {
    const overlapCap =
      phase === 'strict' ? OVERLAP_THRESHOLD_STRICT : OVERLAP_THRESHOLD_RELAXED;
    const tooSimilar = selected.some(
      (s) => productOverlap(s, cand) > overlapCap
    );
    if (tooSimilar) return false;
    if (hasOverusedProduct(cand)) return false;

    if (STRICT_FOOTWEAR_UNIQUE) {
      const fw = productIdByCategory(cand, 'footwear');
      if (fw && usedFootwearIds.has(fw)) return false;
    }

    if (phase === 'strict') {
      const archSig = archetypeSignature(cand);
      const colorSig = colorSignature(cand);
      const archetypeCount = seenArchetypeSignatures.get(archSig) ?? 0;
      const colorCount = seenColorSignatures.get(colorSig) ?? 0;
      const occCount = seenOccasions.get(cand.occasion) ?? 0;
      if (archetypeCount >= 2) return false;
      if (colorCount >= 2) return false;
      if (options.occasionBalance && occCount >= 2) return false;
    }
    return true;
  };

  const remaining = [...pool];

  const pickBest = (phase: 'strict' | 'relaxed'): OutfitCandidate | null => {
    let best: OutfitCandidate | null = null;
    let bestScore = -Infinity;
    for (const cand of remaining) {
      if (!accept(cand, phase)) continue;
      const s = effectiveScore(cand);
      if (s > bestScore) {
        bestScore = s;
        best = cand;
      }
    }
    return best;
  };

  const commit = (pick: OutfitCandidate) => {
    selected.push(pick);
    const idx = remaining.indexOf(pick);
    if (idx >= 0) remaining.splice(idx, 1);
    const archSig = archetypeSignature(pick);
    const colorSig = colorSignature(pick);
    seenArchetypeSignatures.set(
      archSig,
      (seenArchetypeSignatures.get(archSig) ?? 0) + 1
    );
    seenColorSignatures.set(
      colorSig,
      (seenColorSignatures.get(colorSig) ?? 0) + 1
    );
    seenOccasions.set(pick.occasion, (seenOccasions.get(pick.occasion) ?? 0) + 1);
    registerProducts(pick);
  };

  while (selected.length < options.count) {
    const pick = pickBest('strict');
    if (!pick) break;
    commit(pick);
  }

  while (selected.length < options.count) {
    const pick = pickBest('relaxed');
    if (!pick) break;
    commit(pick);
  }

  return selected.slice(0, options.count);
}
