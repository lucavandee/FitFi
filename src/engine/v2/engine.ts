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
import { applyVisualCoherence } from './scoring/visualCoherence';
import { getCurrentSeason } from './scoring/season';
import { buitenSeizoen, formeelTeLaag, outfitBreuken, productBreuk, voorkeurVoorGelabeld, zonderBotsendAccessoire } from './stijlPoort';
import { outfitTitel, outfitUitleg } from './outfitTekst';

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

function buildOutfitDescription(candidate: OutfitCandidate): string {
  return OCCASION_COPY[candidate.occasion].description;
}

function buildMatchPercentage(candidate: OutfitCandidate): number {
  const raw = candidate.compositionScore;
  const scaled = 20 + raw * 75;
  return Math.round(Math.max(20, Math.min(95, scaled)));
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

const TAG_ALLOW_PREFIXES = [
  'color_harmony',
  'style_',
  'fit_',
  'brand_match',
  'occasion_',
];
const TAG_DENY_SUBSTRINGS = ['_weak', '_mismatch', '_penalty'];

function isDisplayTag(reason: string): boolean {
  if (TAG_DENY_SUBSTRINGS.some((s) => reason.includes(s))) return false;
  return TAG_ALLOW_PREFIXES.some((p) => reason.startsWith(p));
}

function candidateToOutfit(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  season: Season,
  title: string,
  explanation: string
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

  const displayReasons = candidate.reasons.filter(isDisplayTag).slice(0, 4);

  return {
    id: candidate.id,
    title,
    description: buildOutfitDescription(candidate),
    archetype: profile.primaryArchetype,
    secondaryArchetype: profile.secondaryArchetype ?? undefined,
    occasion: candidate.occasion,
    products,
    tags: Array.from(
      new Set([
        profile.primaryArchetype.toLowerCase(),
        candidate.occasion,
        ...displayReasons,
      ])
    ),
    matchPercentage: buildMatchPercentage(candidate),
    matchScore: buildMatchPercentage(candidate),
    explanation,
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

  // Stijlpoort, deel 1: wat de bezoeker zelf koos, haalt stukken uit de pool
  // voordat er gecomponeerd wordt (geen pump bij alleen streetwear). Zie
  // stijlPoort.ts voor waarom dit niet op het afgeleide archetype kan.
  const toegestaan = voorkeurVoorGelabeld(
    products.filter((p) => productBreuk(p, answers) === null && !buitenSeizoen(p, season)),
    answers
  );
  const filter = filterAndPrepare(toegestaan, profile);

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

  const seed = options.seed ?? Math.floor(Date.now() / (1000 * 60 * 5));
  const perOccasion = Math.max(3, Math.ceil(count * 1.5));
  const poolSize = 14;

  const { allCandidates: rawCandidates, byOccasion } = composeOutfits(filter, profile, {
    perOccasion,
    poolSize,
    seed,
    season,
  });

  // Accessoires die botsen (riem in een andere kleurfamilie dan nette schoenen,
  // stropdas zonder overhemd en colbert) vallen uit de outfit; de outfit blijft.
  for (const cand of rawCandidates) {
    const houd = new Set(zonderBotsendAccessoire(cand.products.map((p) => p.product)).map((p) => p.id));
    cand.products = cand.products.filter((p) => houd.has(p.product.id));
  }

  // Stijlpoort, deel 2: regels over de outfit als geheel (bij licht hooguit
  // een donker stuk). Wat zakt, komt niet in de uitslag; liever minder
  // outfits die kloppen (keten-kritiek, beslissing 1).
  const seenGlobalSignatures = new Set<string>();
  const allCandidates = rawCandidates.filter((cand) => {
    if (outfitBreuken(cand.products.map((p) => p.product), answers).length > 0) return false;
    if (formeelTeLaag(cand.products.map((p) => p.product), cand.occasion)) return false;
    const signature = cand.products
      .map((p) => p.product.id)
      .sort()
      .join('|');
    if (seenGlobalSignatures.has(signature)) return false;
    seenGlobalSignatures.add(signature);
    return true;
  });

  if (options.visualEmbeddings) {
    applyVisualCoherence(
      allCandidates,
      options.visualEmbeddings,
      options.visualWeight ?? 0.15
    );
  }

  const diversified = diversifyOutfits(allCandidates, {
    count,
    occasionBalance: profile.occasions.length > 1,
    excludeIds: Array.from(excludeIds),
  });

  // Titel en uitleg uit wat er echt in de outfit zit (outfitTekst.ts). Wat
  // hier stond plakte het eerste woord van een productnaam, de meest
  // voorkomende kleur en een vast stijlwoord aan elkaar ("leer h", "rood
  // relaxed" bij een ivoorwitte jurk).
  const explanations = diversified.map((c, i) => outfitUitleg(c.products, c.occasion, answers, i));
  const titles = diversified.map((c) => outfitTitel(c.products) ?? OCCASION_COPY[c.occasion].title);

  const outfits = diversified.map((c, i) =>
    candidateToOutfit(c, profile, season, titles[i], explanations[i])
  );

  const occasionsCovered = Array.from(
    new Set(diversified.map((c) => c.occasion))
  );
  // Gevraagd maar zonder outfit: de pagina zegt dat eerlijk in plaats van de
  // gelegenheid stil weg te laten.
  const occasionsMissing = profile.occasions.filter((o) => !occasionsCovered.includes(o));

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
      occasionsMissing,
    },
  };
}
