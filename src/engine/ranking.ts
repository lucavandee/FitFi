import type { Outfit } from './types';
import { enrichProduct } from './productEnricher';
import { fusionScore, normalizeWeights } from './archetypeFusion';
import type { ArchetypeKey } from '@/config/archetypes';
import type { ArchetypeWeights } from '@/types/style';

export type ScoredOutfit = {
  outfit: Outfit;
  score: number;
  reasons: string[];
};

export type RankCtx = {
  primaryArchetype: string;
  secondaryArchetype?: string;
  mixFactor?: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  recentOccasions?: string[];
  goals?: string[];
  prints?: string;
  swipeEmbedding?: Record<string, number>;
  swipeCount?: number;
  // P3.2: materiaalvoorkeur voor soft ranking bonus
  preferredMaterials?: string[];
  // P3.3: brand affinity voor zachte merkvoorkeur
  brandAffinities?: Record<string, number>;
};

const GOAL_TAG_MAP: Record<string, string[]> = {
  timeless: ['klassiek', 'classic', 'basic', 'clean', 'neutral'],
  trendy: ['urban', 'streetstyle', 'statement', 'bold', 'trend'],
  minimal: ['minimalist', 'clean', 'simple', 'effen', 'basic'],
  express: ['avant_garde', 'streetstyle', 'retro', 'statement', 'creative'],
  professional: ['klassiek', 'formal', 'tailored', 'structured', 'werk'],
  comfort: ['casual_chic', 'relaxed', 'casual', 'soft', 'comfy'],
};

function scoreArchetypeMatch(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  const primary = ctx.primaryArchetype.toLowerCase();
  const secondary = ctx.secondaryArchetype?.toLowerCase();
  const outfitArch = outfit.archetype?.toLowerCase() ?? '';

  if (outfitArch === primary) {
    return { score: 1.0, reason: 'primary_archetype_match' };
  }
  if (secondary && outfitArch === secondary) {
    const blend = ctx.mixFactor ?? 0.3;
    return { score: 0.5 + blend * 0.5, reason: 'secondary_archetype_match' };
  }
  return { score: 0.1, reason: 'archetype_mismatch' };
}

function scoreSeasonMatch(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!outfit.season) return { score: 0.6, reason: 'season_neutral' };
  const seasons = Array.isArray(outfit.season) ? outfit.season : [outfit.season];
  if (seasons.includes(ctx.season)) return { score: 1.0, reason: 'season_match' };
  const adjacent: Record<string, string[]> = {
    spring: ['summer', 'winter'],
    summer: ['spring'],
    autumn: ['winter', 'spring'],
    winter: ['autumn', 'spring'],
  };
  const adj = adjacent[ctx.season] ?? [];
  if (seasons.some(s => adj.includes(s))) return { score: 0.5, reason: 'season_adjacent' };
  return { score: 0.1, reason: 'season_mismatch' };
}

function scoreGoalsMatch(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!ctx.goals || ctx.goals.length === 0) return { score: 0.5, reason: 'no_goals' };
  const outfitTags = (outfit.tags ?? []).join(' ').toLowerCase() + ' ' + (outfit.archetype ?? '').toLowerCase();
  let hits = 0;
  for (const goal of ctx.goals.slice(0, 3)) {
    const relevantTags = GOAL_TAG_MAP[goal] ?? [];
    if (relevantTags.some(t => outfitTags.includes(t))) hits++;
  }
  const score = hits / Math.min(ctx.goals.length, 3);
  return { score: 0.3 + score * 0.7, reason: hits > 0 ? `goal_match_${hits}` : 'goal_no_match' };
}

function scorePrintsMatch(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!ctx.prints) return { score: 0.8, reason: 'prints_no_pref' };
  const tags = (outfit.tags ?? []).join(' ').toLowerCase();
  const hasPrint = ['printed', 'pattern', 'graphic', 'floral', 'stripe'].some(t => tags.includes(t));

  if (ctx.prints === 'effen' || ctx.prints === 'geen') {
    return hasPrint
      ? { score: 0.2, reason: 'prints_conflict' }
      : { score: 1.0, reason: 'prints_clean_match' };
  }
  if (ctx.prints === 'statement') {
    return hasPrint
      ? { score: 1.0, reason: 'prints_statement_match' }
      : { score: 0.5, reason: 'prints_statement_neutral' };
  }
  return { score: 0.7, reason: 'prints_mixed' };
}

function scoreSwipeEmbedding(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!ctx.swipeEmbedding || Object.keys(ctx.swipeEmbedding).length === 0) {
    return { score: 0.5, reason: 'no_swipe_data' };
  }

  const swipeCount = ctx.swipeCount ?? 0;
  const blendWeight = swipeCount < 5 ? 0.1 : swipeCount < 10 ? 0.25 : 0.4;

  const maxSwipe = Math.max(...Object.values(ctx.swipeEmbedding), 0.001);
  const outfitArch = outfit.archetype?.toLowerCase() ?? '';

  let rawSwipeScore = 0;
  for (const [arch, weight] of Object.entries(ctx.swipeEmbedding)) {
    if (arch.toLowerCase() === outfitArch) {
      rawSwipeScore = weight / maxSwipe;
      break;
    }
  }

  const score = (1 - blendWeight) * 0.5 + blendWeight * rawSwipeScore;
  return {
    score,
    reason: rawSwipeScore > 0.7
      ? 'swipe_strong_match'
      : rawSwipeScore > 0.3
        ? 'swipe_partial_match'
        : 'swipe_weak_match',
  };
}

const ARCHETYPE_KEY_MAP: Record<string, ArchetypeKey> = {
  MINIMALIST: 'MINIMALIST', CLASSIC: 'CLASSIC', SMART_CASUAL: 'SMART_CASUAL',
  STREETWEAR: 'STREETWEAR', ATHLETIC: 'ATHLETIC', AVANT_GARDE: 'AVANT_GARDE',
  minimalist: 'MINIMALIST', klassiek: 'CLASSIC', classic: 'CLASSIC',
  smart_casual: 'SMART_CASUAL', 'smart-casual': 'SMART_CASUAL', casual_chic: 'SMART_CASUAL',
  urban: 'STREETWEAR', streetstyle: 'STREETWEAR', streetwear: 'STREETWEAR',
  athletic: 'ATHLETIC', sporty: 'ATHLETIC',
  avant_garde: 'AVANT_GARDE', avantgarde: 'AVANT_GARDE', retro: 'AVANT_GARDE',
  bohemian: 'AVANT_GARDE', luxury: 'CLASSIC',
};

function resolveKey(raw: string): ArchetypeKey {
  return ARCHETYPE_KEY_MAP[raw] ?? ARCHETYPE_KEY_MAP[raw.toLowerCase()] ?? 'SMART_CASUAL';
}

function scoreProductQuality(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!outfit.products || outfit.products.length === 0) {
    return { score: 0.3, reason: 'no_products' };
  }

  const primaryKey = resolveKey(ctx.primaryArchetype);
  const mix: ArchetypeWeights = { [primaryKey]: 1 - (ctx.mixFactor ?? 0) };
  if (ctx.secondaryArchetype) {
    const secKey = resolveKey(ctx.secondaryArchetype);
    mix[secKey] = (mix[secKey] ?? 0) + (ctx.mixFactor ?? 0.3);
  }

  let totalFusion = 0;
  for (const product of outfit.products) {
    const enriched = enrichProduct(product);
    const s = enriched._signals;
    const pl = {
      id: product.id,
      title: product.name,
      brand: product.brand,
      category: product.category,
      colorTags: s.colorTags,
      materialTags: s.materialTags,
      silhouetteTags: s.silhouetteTags,
      formality: enriched.formality,
      price: product.price,
      style: (product as any).style,
    };
    const f = fusionScore(pl, mix);
    totalFusion += f.totalScore;
  }

  const avg = totalFusion / outfit.products.length;
  const reason = avg > 0.5 ? 'high_fusion' : avg > 0.25 ? 'medium_fusion' : 'low_fusion';
  return { score: avg, reason };
}

// P3.2: materiaalvoorkeur als soft ranking bonus
function scoreMaterialPreference(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!ctx.preferredMaterials || ctx.preferredMaterials.length === 0) {
    return { score: 0.5, reason: 'no_material_pref' };
  }
  if (!outfit.products || outfit.products.length === 0) {
    return { score: 0.5, reason: 'no_products' };
  }

  const prefs = ctx.preferredMaterials.map(m => m.toLowerCase());
  let hits = 0;
  let checked = 0;

  for (const product of outfit.products) {
    const mats = (product.materialTags || product.materials || []).map((m: string) => m.toLowerCase());
    if (mats.length > 0) {
      checked++;
      if (prefs.some(p => mats.some((m: string) => m.includes(p) || p.includes(m)))) {
        hits++;
      }
    }
  }

  if (checked === 0) return { score: 0.5, reason: 'no_material_data' };
  const ratio = hits / checked;
  return { score: 0.3 + ratio * 0.7, reason: ratio > 0.5 ? 'material_match' : 'material_partial' };
}

// P3.3: brand affinity als zachte ranking bonus
function scoreBrandAffinity(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!ctx.brandAffinities || Object.keys(ctx.brandAffinities).length === 0) {
    return { score: 0.5, reason: 'no_brand_data' };
  }
  if (!outfit.products || outfit.products.length === 0) {
    return { score: 0.5, reason: 'no_products' };
  }

  let totalAffinity = 0;
  let brandedProducts = 0;

  for (const product of outfit.products) {
    const brand = product.brand?.toLowerCase();
    if (brand) {
      brandedProducts++;
      const affinity = ctx.brandAffinities[brand] ?? 0;
      totalAffinity += affinity;
    }
  }

  if (brandedProducts === 0) return { score: 0.5, reason: 'no_brands' };
  const avgAffinity = totalAffinity / brandedProducts;
  // Normalize: affinity scores are typically 0-1, map to 0.3-1.0
  const score = 0.3 + Math.min(avgAffinity, 1) * 0.7;
  return { score, reason: avgAffinity > 0.5 ? 'brand_preferred' : 'brand_neutral' };
}

function scoreOccasionRecency(outfit: Outfit, ctx: RankCtx): { score: number; reason: string } {
  if (!ctx.recentOccasions || ctx.recentOccasions.length === 0) {
    return { score: 0.5, reason: 'no_recency' };
  }
  const outfitOcc = outfit.occasion?.toLowerCase() ?? '';
  const recentCount = ctx.recentOccasions.filter(o => o.toLowerCase() === outfitOcc).length;
  if (recentCount === 0) return { score: 1.0, reason: 'occasion_fresh' };
  return { score: Math.max(0.1, 1 - recentCount * 0.3), reason: 'occasion_repeated' };
}

export function rankOutfits(outfits: Outfit[], ctx: RankCtx): ScoredOutfit[] {
  // P3.2 + P3.3: materiaalvoorkeur en brand affinity als ranking factoren
  const W = {
    quality: 0.33,
    archetype: 0.14,
    season: 0.10,
    goals: 0.14,
    prints: 0.08,
    swipe: 0.10,
    material: 0.05,
    brand: 0.04,
    recency: 0.02,
  };

  return outfits
    .map(outfit => {
      const qual = scoreProductQuality(outfit, ctx);
      const arch = scoreArchetypeMatch(outfit, ctx);
      const seas = scoreSeasonMatch(outfit, ctx);
      const goal = scoreGoalsMatch(outfit, ctx);
      const prnt = scorePrintsMatch(outfit, ctx);
      const swpe = scoreSwipeEmbedding(outfit, ctx);
      const mat = scoreMaterialPreference(outfit, ctx);
      const brd = scoreBrandAffinity(outfit, ctx);
      const rec = scoreOccasionRecency(outfit, ctx);

      const score =
        W.quality * qual.score +
        W.archetype * arch.score +
        W.season * seas.score +
        W.goals * goal.score +
        W.prints * prnt.score +
        W.swipe * swpe.score +
        W.material * mat.score +
        W.brand * brd.score +
        W.recency * rec.score;

      const reasons = [qual.reason, arch.reason, seas.reason, goal.reason, prnt.reason, swpe.reason, mat.reason, brd.reason, rec.reason];

      return { outfit, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export function ensureDiversity(items: ScoredOutfit[], maxPerArchetype = 2): ScoredOutfit[] {
  const out: ScoredOutfit[] = [];
  const seen = new Map<string, number>();
  for (const it of items) {
    const arch = it.outfit.archetype ?? 'unknown';
    const count = seen.get(arch) ?? 0;
    if (count < maxPerArchetype) {
      out.push(it);
      seen.set(arch, count + 1);
    }
    if (out.length >= 50) break;
  }
  return out;
}
