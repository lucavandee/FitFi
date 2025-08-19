import { fusionScore } from '@/engine/archetypeFusion';
import type { ArchetypeWeights, ProductLike } from '@/types/style';
import { DEFAULT_ARCHETYPE_MIX } from '@/config/archetypes';

type MatchOptions = {
  archetypeMix?: ArchetypeWeights;
  limit?: number;
  gender?: 'male' | 'female' | 'unisex';
  season?: string;
  category?: string;
};

export function scoreAndFilterProducts(
  products: ProductLike[],
  opts: MatchOptions = {}
) {
  const mix = Object.keys(opts.archetypeMix ?? {}).length ? (opts.archetypeMix as ArchetypeWeights) : DEFAULT_ARCHETYPE_MIX;

  const scored = products.map(p => {
    const detail = fusionScore(p, mix);
    return { product: p, score: detail.totalScore, detail };
  });

  // sorteer op score, fallback op prijs/merk om deterministisch te blijven
  scored.sort((a, b) => (b.score - a.score) || ((a.product.price ?? 0) - (b.product.price ?? 0)));

  return scored;
}

export function buildOutfits(products: ProductLike[], opts: MatchOptions = {}) {
  const ranked = scoreAndFilterProducts(products, opts);
  
  // Simple outfit assembly - group by category
  const byCategory = ranked.reduce((acc, { product }) => {
    const cat = product.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, ProductLike[]>);

  // Build basic outfits (top + bottom + shoes)
  const outfits = [];
  const tops = byCategory.top || [];
  const bottoms = byCategory.bottom || [];
  const shoes = byCategory.footwear || byCategory.shoes || [];
  
  for (let i = 0; i < Math.min(3, tops.length, bottoms.length, shoes.length); i++) {
    const parts: ProductLike[] = [tops[i], bottoms[i], shoes[i]].filter(Boolean);
    const details = parts.map(p => fusionScore(p, opts.archetypeMix ?? DEFAULT_ARCHETYPE_MIX));
    const avg = details.reduce((a, d) => a + d.totalScore, 0) / Math.max(details.length, 1);
    const matchedSignals = Array.from(new Set(details.flatMap(d => d.matchedSignals)));

    outfits.push({
      id: `outfit-${i}`,
      title: `Look ${i + 1}`,
      top: tops[i],
      bottom: bottoms[i],
      shoes: shoes[i],
      matchScore: Math.round(avg * 100),
      _fusion: { parts: details, matchedSignals },
    });
  }

  return outfits;
}

export function matchProducts(products: ProductLike[], userProfile: any) {
  const archetypeMix = userProfile?.archetypeMix ?? DEFAULT_ARCHETYPE_MIX;
  
  return scoreAndFilterProducts(products, {
    archetypeMix,
    gender: userProfile?.gender,
    limit: 50
  });
}