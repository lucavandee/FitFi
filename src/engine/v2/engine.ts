import type { Outfit, Product } from '../types';
import type {
  EngineOptions,
  EngineResult,
  OccasionKey,
  OutfitCandidate,
  Season,
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

function buildExplanation(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): string {
  const parts: string[] = [];
  const primary = profile.primaryArchetype.toLowerCase().replace('_', ' ');
  parts.push(`Afgestemd op je ${primary}-voorkeur.`);

  if (candidate.coherence.colorHarmony > 0.75) {
    parts.push('De kleuren vallen rustig samen.');
  } else if (candidate.coherence.colorHarmony > 0.55) {
    parts.push('Een doordachte kleurcombinatie.');
  }

  if (candidate.coherence.completeness >= 1) {
    parts.push('Compleet van top tot schoen.');
  }

  if (profile.moodboard.totalCount >= 10 && profile.moodboard.confidence > 0.5) {
    parts.push('Gebaseerd op je moodboard-keuzes.');
  }

  return parts.join(' ');
}

function buildMatchPercentage(candidate: OutfitCandidate): number {
  const raw = candidate.compositionScore;
  const scaled = 58 + raw * 40;
  return Math.round(Math.max(55, Math.min(98, scaled)));
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

  const primaryOccasion: OccasionKey =
    profile.occasions[0] ?? 'casual';
  for (const scored of filter.candidates) {
    computeProductScore(scored, profile, primaryOccasion, season);
  }

  Object.values(filter.byCategory).forEach((list) => {
    list.sort((a, b) => b.score - a.score);
  });

  const seed = Math.floor(Date.now() / (1000 * 60 * 5));
  const perOccasion = Math.max(3, Math.ceil(count * 1.5));
  const poolSize = 14;

  const { allCandidates, byOccasion } = composeOutfits(filter, profile, {
    perOccasion,
    poolSize,
    seed,
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
