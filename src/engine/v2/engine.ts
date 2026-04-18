import type { Outfit, Product } from '../types';
import type {
  EngineOptions,
  EngineResult,
  GoalKey,
  OccasionKey,
  OutfitCandidate,
  Season,
  TemperatureKey,
  UserStyleProfile,
} from './types';
import { buildUserStyleProfile } from './buildProfile';
import { filterAndPrepare } from './candidateFilter';
import { computeProductScore } from './scoring';
import { composeOutfits } from './composer';
import { diversifyOutfits } from './diversify';
import { getCurrentSeason } from './scoring/season';

const OCCASION_COPY: Record<OccasionKey, { title: string; description: string }> = {
  work: {
    title: 'Werk-ready',
    description: 'Verzorgd en zelfverzekerd voor kantoor of meeting.',
  },
  casual: {
    title: 'Dagelijks comfort',
    description: 'Relaxte look voor boodschappen, koffie of een wandeling.',
  },
  formal: {
    title: 'Formele gelegenheid',
    description: 'Ingetogen en stijlvol voor een nette setting.',
  },
  date: {
    title: 'Avond uit',
    description: 'Iets meer punch voor een date of diner.',
  },
  travel: {
    title: 'Travel essential',
    description: 'Comfortabel onderweg zonder in te leveren op stijl.',
  },
  sport: {
    title: 'Actief',
    description: 'Functioneel en sportief voor beweging en gym.',
  },
  party: {
    title: 'Uitgaan / Feest',
    description: 'Expressief en comfortabel voor stappen, festivals of feestjes.',
  },
};

function buildOutfitTitle(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): string {
  const copy = OCCASION_COPY[candidate.occasion];
  const archetype = profile.primaryArchetype.toLowerCase().replace('_', ' ');
  return `${copy.title} · ${archetype}`;
}

function buildOutfitDescription(candidate: OutfitCandidate): string {
  return OCCASION_COPY[candidate.occasion].description;
}

const GOAL_ADJECTIVE: Partial<Record<GoalKey, string>> = {
  timeless: 'tijdloze',
  professional: 'professionele',
  express: 'expressieve',
  minimal: 'minimalistische',
};

const TEMPERATURE_SENTENCE: Record<TemperatureKey, string> = {
  koel: 'In je koele kleurpalet.',
  warm: 'In je warme kleurpalet.',
  neutraal: 'Met een neutrale basis.',
};

function primaryGoalAdjective(goals: GoalKey[]): string | null {
  const priority: GoalKey[] = ['timeless', 'professional', 'express', 'minimal'];
  const matched: string[] = [];
  for (const key of priority) {
    if (!goals.includes(key)) continue;
    const adj = GOAL_ADJECTIVE[key];
    if (adj) matched.push(adj);
    if (matched.length === 2) break;
  }
  if (matched.length === 0) return null;
  return matched.join(' en ');
}

function matchedPreferredMaterial(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): string | null {
  const preferred = profile.materials.preferred.map((m) => m.toLowerCase());
  if (preferred.length === 0) return null;
  for (const pref of preferred) {
    for (const p of candidate.products) {
      const tags = p.materialTags.map((t) => t.toLowerCase());
      const productMats = (p.product.materials ?? []).map((m: string) =>
        m.toLowerCase()
      );
      if (tags.includes(pref) || productMats.includes(pref)) return pref;
    }
  }
  return null;
}

function buildExplanation(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): string {
  const signals: string[] = [];

  const goal = primaryGoalAdjective(profile.goals);
  if (goal) signals.push(`Afgestemd op je ${goal} stijl.`);

  const material = matchedPreferredMaterial(candidate, profile);
  if (material) signals.push(`Met je voorkeur voor ${material}.`);

  if (profile.color.temperature) {
    signals.push(TEMPERATURE_SENTENCE[profile.color.temperature]);
  }

  if (candidate.coherence.completeness >= 1) {
    signals.push('Compleet van top tot schoen.');
  }

  if (profile.moodboard.totalCount >= 10 && profile.moodboard.confidence > 0.5) {
    signals.push('Gebaseerd op je moodboard-keuzes.');
  }

  if (signals.length === 0) {
    const primary = profile.primaryArchetype.toLowerCase().replace('_', ' ');
    return `Afgestemd op je ${primary}-voorkeur.`;
  }

  return signals.slice(0, 3).join(' ');
}

function buildMatchPercentage(candidate: OutfitCandidate): number {
  const raw = candidate.compositionScore;
  const scaled = 30 + raw * 65;
  return Math.round(Math.max(30, Math.min(98, scaled)));
}

function categoryRatio(candidate: OutfitCandidate): {
  top: number;
  bottom: number;
  footwear: number;
  accessory: number;
  outerwear: number;
  dress: number;
  jumpsuit: number;
  other: number;
} {
  const total = candidate.products.length || 1;
  const counts = {
    top: 0,
    bottom: 0,
    footwear: 0,
    accessory: 0,
    outerwear: 0,
    dress: 0,
    jumpsuit: 0,
    other: 0,
  };
  for (const p of candidate.products) {
    const key = p.category as keyof typeof counts;
    if (key in counts) counts[key]++;
    else counts.other++;
  }
  const ratio: typeof counts = { ...counts };
  (Object.keys(counts) as (keyof typeof counts)[]).forEach((k) => {
    ratio[k] = counts[k] / total;
  });
  return ratio;
}

function candidateToOutfit(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  season: Season
): Outfit {
  const products: Product[] = candidate.products.map((p) => ({
    ...p.product,
    matchScore: Math.round(p.score * 100),
  }));

  const completeness = Math.round(candidate.coherence.completeness * 100);
  const seasonMap: Record<Season, Outfit['season']> = {
    spring: 'spring',
    summer: 'summer',
    autumn: 'autumn',
    winter: 'winter',
  };

  return {
    id: candidate.id,
    title: buildOutfitTitle(candidate, profile),
    description: buildOutfitDescription(candidate),
    archetype: profile.primaryArchetype,
    secondaryArchetype: profile.secondaryArchetype ?? undefined,
    occasion: candidate.occasion,
    products,
    tags: Array.from(
      new Set([
        profile.primaryArchetype.toLowerCase(),
        candidate.occasion,
        ...candidate.reasons.slice(0, 4),
      ])
    ),
    matchPercentage: buildMatchPercentage(candidate),
    matchScore: buildMatchPercentage(candidate),
    explanation: buildExplanation(candidate, profile),
    season: seasonMap[season],
    structure: candidate.products.map((p) => p.category),
    categoryRatio: categoryRatio(candidate),
    completeness,
  };
}

export function runEngineV2(
  answers: Record<string, any>,
  products: Product[],
  options: EngineOptions = {}
): EngineResult {
  const count = Math.max(1, options.count ?? 6);
  const season = options.season ?? getCurrentSeason();
  const profile = buildUserStyleProfile(answers);
  const excludeIds = new Set(options.excludeIds ?? []);

  const filter = filterAndPrepare(products, profile);

  if (options.debug) {
    console.log('[engine/v2] profile', {
      gender: profile.gender,
      primary: profile.primaryArchetype,
      secondary: profile.secondaryArchetype,
      swipeInfluence: profile.diagnostics.swipeInfluence,
      budgetMax: profile.budget.perItemMax,
      occasions: profile.occasions,
    });
    console.log('[engine/v2] candidates', {
      total: filter.candidates.length,
      rejected: filter.rejected.byReason,
      byCategory: Object.fromEntries(
        Object.entries(filter.byCategory).map(([k, v]) => [k, v.length])
      ),
    });
  }

  const scoringOccasions: OccasionKey[] =
    profile.occasions.length > 0 ? profile.occasions : ['casual'];
  const primaryOccasion: OccasionKey = scoringOccasions[0];

  for (const scored of filter.candidates) {
    scored.scoreByOccasion = {};
    for (const occ of scoringOccasions) {
      if (occ === primaryOccasion) continue;
      computeProductScore(scored, profile, occ, season);
      scored.scoreByOccasion[occ] = scored.score;
    }
    computeProductScore(scored, profile, primaryOccasion, season);
    scored.scoreByOccasion[primaryOccasion] = scored.score;
  }

  Object.values(filter.byCategory).forEach((list) => {
    list.sort((a, b) => b.score - a.score);
  });

  const seed = Math.floor(Date.now() / (1000 * 60 * 5));
  const perOccasion = Math.max(3, Math.ceil(count * 1.5));
  const poolSize = 14;

  const { allCandidates: rawCandidates, byOccasion } = composeOutfits(filter, profile, {
    perOccasion,
    poolSize,
    seed,
  });

  const seenGlobalSignatures = new Set<string>();
  const allCandidates = rawCandidates.filter((cand) => {
    const signature = cand.products
      .map((p) => p.product.id)
      .sort()
      .join('|');
    if (seenGlobalSignatures.has(signature)) return false;
    seenGlobalSignatures.add(signature);
    return true;
  });

  const diversified = diversifyOutfits(allCandidates, {
    count,
    occasionBalance: profile.occasions.length > 1,
    excludeIds: Array.from(excludeIds),
  });

  const outfits = diversified.map((c) => candidateToOutfit(c, profile, season));

  const occasionsCovered = Array.from(
    new Set(diversified.map((c) => c.occasion))
  );

  if (options.debug) {
    console.log('[engine/v2] composed', {
      totalCandidates: allCandidates.length,
      diversified: diversified.length,
      byOccasion: Object.fromEntries(
        Object.entries(byOccasion).map(([k, v]) => [k, v.length])
      ),
    });
  }

  return {
    outfits,
    profile,
    stats: {
      totalProducts: products.length,
      eligibleProducts: filter.candidates.length,
      outfitsGenerated: allCandidates.length,
      outfitsReturned: outfits.length,
      occasionsCovered,
    },
  };
}
