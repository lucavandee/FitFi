import type { NormalizedCategory, OutfitCandidate, ScoredProduct } from './types';

export interface DiversifyOptions {
  count: number;
  occasionBalance: boolean;
  excludeIds?: string[];
}

const OVERLAP_HARD_THRESHOLD = 0.25;
const OVERLAP_FALLBACK_THRESHOLD = 0.65;
const REUSE_PENALTY_PER_PRODUCT = 0.15;
const SLOT_COLLISION_PENALTY = 0.2;
const SLOT_CATEGORIES: NormalizedCategory[] = ['footwear', 'bottom', 'outerwear'];

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

function productsByCategory(
  candidate: OutfitCandidate,
  category: NormalizedCategory
): ScoredProduct[] {
  return candidate.products.filter((p) => p.category === category);
}

function countUniqueProductsInCategory(
  pool: OutfitCandidate[],
  category: NormalizedCategory
): number {
  const ids = new Set<string>();
  for (const cand of pool) {
    for (const p of cand.products) {
      if (p.category === category) ids.add(p.product.id);
    }
  }
  return ids.size;
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

  // Dynamic appearance cap: if pool is large relative to target count,
  // enforce a unique-products-per-outfit rule (cap=1). Otherwise allow up to 2.
  const MAX_APPEARANCES = pool.length >= options.count * 3 ? 1 : 2;

  // Footwear diversity: if the pool has at least 3 unique footwear items,
  // the same shoe may not appear in two selected outfits.
  const uniqueFootwearInPool = countUniqueProductsInCategory(pool, 'footwear');
  const strictFootwearDiversity = uniqueFootwearInPool >= 3;

  const selected: OutfitCandidate[] = [];
  const seenArchetypeSignatures = new Map<string, number>();
  const seenColorSignatures = new Map<string, number>();
  const seenOccasions = new Map<string, number>();
  const productAppearances = new Map<string, number>();
  const usedProductIds = new Set<string>();
  const usedFootwearIds = new Set<string>();

  const appearanceCount = (id: string) => productAppearances.get(id) ?? 0;

  const hasOverusedProduct = (cand: OutfitCandidate, cap: number) =>
    cand.products.some((p) => appearanceCount(p.product.id) >= cap);

  const registerProducts = (cand: OutfitCandidate) => {
    for (const p of cand.products) {
      productAppearances.set(p.product.id, appearanceCount(p.product.id) + 1);
      usedProductIds.add(p.product.id);
      if (p.category === 'footwear') usedFootwearIds.add(p.product.id);
    }
  };

  const slotCollisionPenalty = (cand: OutfitCandidate): number => {
    if (selected.length === 0) return 0;
    let penalty = 0;
    for (const category of SLOT_CATEGORIES) {
      const candItems = productsByCategory(cand, category);
      if (candItems.length === 0) continue;
      const candIds = new Set(candItems.map((p) => p.product.id));
      for (const s of selected) {
        const selectedItems = productsByCategory(s, category);
        const collides = selectedItems.some((p) => candIds.has(p.product.id));
        if (collides) {
          penalty += SLOT_COLLISION_PENALTY;
          break; // one collision per category is enough
        }
      }
    }
    return penalty;
  };

  const reusePenalty = (cand: OutfitCandidate): number => {
    let reused = 0;
    for (const p of cand.products) {
      if (usedProductIds.has(p.product.id)) reused++;
    }
    return reused * REUSE_PENALTY_PER_PRODUCT;
  };

  const violatesFootwear = (cand: OutfitCandidate): boolean => {
    if (!strictFootwearDiversity) return false;
    return productsByCategory(cand, 'footwear').some((p) =>
      usedFootwearIds.has(p.product.id)
    );
  };

  const passesHardConstraints = (
    cand: OutfitCandidate,
    cap: number,
    overlapThreshold: number
  ): boolean => {
    if (selected.includes(cand)) return false;
    if (hasOverusedProduct(cand, cap)) return false;
    if (violatesFootwear(cand)) return false;
    if (selected.some((s) => productOverlap(s, cand) > overlapThreshold))
      return false;
    return true;
  };

  // Greedy selection with dynamic re-scoring so previously-chosen outfits
  // influence the ranking of remaining candidates.
  while (selected.length < options.count) {
    let best: OutfitCandidate | null = null;
    let bestScore = -Infinity;
    let bestArch = '';
    let bestColor = '';

    for (const cand of pool) {
      if (!passesHardConstraints(cand, MAX_APPEARANCES, OVERLAP_HARD_THRESHOLD))
        continue;

      const archSig = archetypeSignature(cand);
      const colorSig = colorSignature(cand);
      if ((seenArchetypeSignatures.get(archSig) ?? 0) >= 2) continue;
      if ((seenColorSignatures.get(colorSig) ?? 0) >= 2) continue;
      if (
        options.occasionBalance &&
        (seenOccasions.get(cand.occasion) ?? 0) >= 2
      )
        continue;

      const effective =
        cand.compositionScore - reusePenalty(cand) - slotCollisionPenalty(cand);

      if (effective > bestScore) {
        best = cand;
        bestScore = effective;
        bestArch = archSig;
        bestColor = colorSig;
      }
    }

    if (!best) break;

    selected.push(best);
    seenArchetypeSignatures.set(
      bestArch,
      (seenArchetypeSignatures.get(bestArch) ?? 0) + 1
    );
    seenColorSignatures.set(
      bestColor,
      (seenColorSignatures.get(bestColor) ?? 0) + 1
    );
    seenOccasions.set(
      best.occasion,
      (seenOccasions.get(best.occasion) ?? 0) + 1
    );
    registerProducts(best);
  }

  // Fallback: if we still need outfits, relax saturation + overlap rules,
  // but keep the appearance cap and footwear diversity rule in place.
  if (selected.length < options.count) {
    const sortedByScore = [...pool].sort(
      (a, b) => b.compositionScore - a.compositionScore
    );
    for (const cand of sortedByScore) {
      if (selected.length >= options.count) break;
      if (
        !passesHardConstraints(
          cand,
          MAX_APPEARANCES,
          OVERLAP_FALLBACK_THRESHOLD
        )
      )
        continue;
      selected.push(cand);
      registerProducts(cand);
    }
  }

  return selected.slice(0, options.count);
}
