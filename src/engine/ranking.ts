import type { Outfit } from './types';

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
  const W = {
    archetype: 0.40,
    season: 0.15,
    goals: 0.20,
    prints: 0.10,
    swipe: 0.10,
    recency: 0.05,
  };

  return outfits
    .map(outfit => {
      const arch = scoreArchetypeMatch(outfit, ctx);
      const seas = scoreSeasonMatch(outfit, ctx);
      const goal = scoreGoalsMatch(outfit, ctx);
      const prnt = scorePrintsMatch(outfit, ctx);
      const swpe = scoreSwipeEmbedding(outfit, ctx);
      const rec = scoreOccasionRecency(outfit, ctx);

      const score =
        W.archetype * arch.score +
        W.season * seas.score +
        W.goals * goal.score +
        W.prints * prnt.score +
        W.swipe * swpe.score +
        W.recency * rec.score;

      const reasons = [arch.reason, seas.reason, goal.reason, prnt.reason, swpe.reason, rec.reason];

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
