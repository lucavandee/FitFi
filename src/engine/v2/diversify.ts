import type { OutfitCandidate } from './types';

export interface DiversifyOptions {
  count: number;
  occasionBalance: boolean;
  excludeIds?: string[];
}

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

export function diversifyOutfits(
  candidates: OutfitCandidate[],
  options: DiversifyOptions
): OutfitCandidate[] {
  const exclude = new Set(options.excludeIds ?? []);
  const pool = candidates.filter(
    (c) => !c.products.some((p) => exclude.has(p.product.id))
  );
  if (pool.length === 0) return [];

  const sorted = [...pool].sort(
    (a, b) => b.compositionScore - a.compositionScore
  );

  const selected: OutfitCandidate[] = [];
  const seenArchetypeSignatures = new Map<string, number>();
  const seenColorSignatures = new Map<string, number>();
  const seenOccasions = new Map<string, number>();
  const productAppearances = new Map<string, number>();

  const MAX_APPEARANCES = 2;

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
    }
  };

  for (const cand of sorted) {
    if (selected.length >= options.count) break;

    const tooSimilar = selected.some((s) => productOverlap(s, cand) > 0.34);
    if (tooSimilar) continue;

    if (hasOverusedProduct(cand)) continue;

    const archSig = archetypeSignature(cand);
    const colorSig = colorSignature(cand);
    const archetypeCount = seenArchetypeSignatures.get(archSig) ?? 0;
    const colorCount = seenColorSignatures.get(colorSig) ?? 0;
    const occCount = seenOccasions.get(cand.occasion) ?? 0;

    if (archetypeCount >= 2) continue;
    if (colorCount >= 2) continue;
    if (options.occasionBalance && occCount >= 2) continue;

    selected.push(cand);
    seenArchetypeSignatures.set(archSig, archetypeCount + 1);
    seenColorSignatures.set(colorSig, colorCount + 1);
    seenOccasions.set(cand.occasion, occCount + 1);
    registerProducts(cand);
  }

  if (selected.length < options.count) {
    for (const cand of sorted) {
      if (selected.length >= options.count) break;
      if (selected.includes(cand)) continue;
      if (hasOverusedProduct(cand)) continue;
      const tooSimilar = selected.some((s) => productOverlap(s, cand) > 0.65);
      if (tooSimilar) continue;
      selected.push(cand);
      registerProducts(cand);
    }
  }

  return selected.slice(0, options.count);
}
