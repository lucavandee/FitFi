import type { Outfit, Product } from '../types';
import type {
  EngineOptions,
  EngineResult,
  GoalKey,
  OccasionKey,
  OutfitCandidate,
  ScoredProduct,
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
import { MATERIAL_ALIAS } from './scoring/material';

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

const OCCASION_FRAMING: Record<OccasionKey, string[]> = {
  work: ['voor kantoor', 'zakelijk maar comfortabel', 'office-ready'],
  casual: ['voor je vrije dag', 'relaxed maar stijlvol'],
  formal: ['voor een nette setting', 'ingetogen en verzorgd'],
  date: ['voor een avond uit', 'verzorgd maar relaxed', 'date-ready'],
  travel: ['voor onderweg', 'comfortabel maar verzorgd'],
  sport: ['functioneel voor beweging', 'sportief en clean'],
  party: ['voor een avond stappen', 'opvallend maar niet overdressed'],
};

const ARCHETYPE_LABEL: Record<string, string> = {
  MINIMALIST: 'minimal',
  CLASSIC: 'classic',
  SMART_CASUAL: 'smart casual',
  STREETWEAR: 'street',
  ATHLETIC: 'athletic',
  AVANT_GARDE: 'avant-garde',
  BUSINESS: 'tailored',
};

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

const EXPLANATION_SIMILARITY_THRESHOLD = 0.6;

function archetypeLabel(profile: UserStyleProfile): string {
  return (
    ARCHETYPE_LABEL[profile.primaryArchetype] ??
    profile.primaryArchetype.toLowerCase().replace('_', ' ')
  );
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr;
  const n = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

function contextualGoalAdjective(
  occasion: OccasionKey,
  goals: GoalKey[],
  index: number
): string {
  if (occasion === 'work' && goals.includes('professional')) return 'professionele';
  if (occasion === 'date') return 'verzorgde';
  if (occasion === 'party' && goals.includes('express')) return 'expressieve';

  const priority: GoalKey[] = ['timeless', 'professional', 'express', 'minimal'];
  const pool: string[] = [];
  for (const key of priority) {
    if (!goals.includes(key)) continue;
    const adj = GOAL_ADJECTIVE[key];
    if (adj) pool.push(adj);
  }
  if (pool.length === 0) return 'tijdloze';
  return pool[index % pool.length];
}

function heroItem(candidate: OutfitCandidate): ScoredProduct | null {
  if (candidate.products.length === 0) return null;
  return [...candidate.products].sort((a, b) => {
    const pa = a.product.price ?? 0;
    const pb = b.product.price ?? 0;
    if (pb !== pa) return pb - pa;
    return b.score - a.score;
  })[0];
}

function heroItemWord(p: ScoredProduct | null): string | null {
  if (!p) return null;
  const type = (p.product.type || '').toLowerCase().trim();
  if (type) return type.split(/\s+/)[0];
  const name = (p.product.name || '').toLowerCase().trim();
  if (!name) return null;
  return name.split(/\s+/)[0];
}

function heroMaterialKey(candidate: OutfitCandidate): string | null {
  const hero = heroItem(candidate);
  if (!hero) return null;
  const tags = new Set<string>([
    ...hero.materialTags.map((m) => m.toLowerCase()),
    ...(hero.product.materials ?? []).map((m: string) => m.toLowerCase()),
  ]);
  for (const [key, aliases] of Object.entries(MATERIAL_ALIAS)) {
    if (aliases.some((a) => tags.has(a))) return key;
  }
  return null;
}

function matchedPreferredMaterial(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): string | null {
  const preferred = profile.materials.preferred.map((m) => m.toLowerCase());
  if (preferred.length === 0) return null;
  const counts = new Map<string, number>();
  for (const pref of preferred) {
    const aliases = MATERIAL_ALIAS[pref] ?? [pref];
    for (const p of candidate.products) {
      const tags = p.materialTags.map((t) => t.toLowerCase());
      const productMats = (p.product.materials ?? []).map((m: string) =>
        m.toLowerCase()
      );
      if (aliases.some((a) => tags.includes(a) || productMats.includes(a))) {
        counts.set(pref, (counts.get(pref) ?? 0) + 1);
      }
    }
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0][0];
}

function dominantOutfitMaterialKey(candidate: OutfitCandidate): string | null {
  const counts = new Map<string, number>();
  for (const p of candidate.products) {
    const tags = new Set<string>([
      ...p.materialTags.map((m) => m.toLowerCase()),
      ...(p.product.materials ?? []).map((m: string) => m.toLowerCase()),
    ]);
    for (const [key, aliases] of Object.entries(MATERIAL_ALIAS)) {
      if (aliases.some((a) => tags.has(a))) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
        break;
      }
    }
  }
  if (counts.size === 0) return null;
  const sorted = [...counts.entries()].sort(([, a], [, b]) => b - a);
  const total = candidate.products.length || 1;
  const [top1, n1] = sorted[0];
  if (sorted.length === 1 || n1 / total >= 0.6) return top1;
  return null;
}

function dominantOutfitColor(candidate: OutfitCandidate): string | null {
  const counts = new Map<string, number>();
  for (const p of candidate.products) {
    for (const c of p.colorTags.slice(0, 2)) {
      const key = c.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0][0];
}

function outfitColorPair(candidate: OutfitCandidate): string | null {
  const colors: string[] = [];
  for (const p of candidate.products) {
    const first = p.colorTags[0];
    if (first) colors.push(first.toLowerCase());
  }
  if (colors.length === 0) return null;
  const unique = Array.from(new Set(colors));
  if (unique.length === 1) return `monochroom ${unique[0]}`;
  return `${unique[0]} met ${unique[1]}`;
}

function matchedPreferredBrands(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): string[] {
  const prefs = profile.preferredBrands.map((b) => b.toLowerCase()).filter(Boolean);
  if (prefs.length === 0) return [];
  const seen = new Set<string>();
  const brands: string[] = [];
  for (const p of candidate.products) {
    const raw = (p.product.brand ?? '').trim();
    if (!raw) continue;
    const brand = raw.toLowerCase();
    const matches = prefs.some(
      (pref) => brand === pref || brand.includes(pref) || pref.includes(brand)
    );
    if (matches && !seen.has(brand)) {
      seen.add(brand);
      brands.push(raw);
    }
  }
  return brands;
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[.,·—:;!?()]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function wordOverlapSimilarity(a: string, b: string): number {
  const wa = tokenize(a);
  const wb = tokenize(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  wa.forEach((w) => {
    if (wb.has(w)) overlap++;
  });
  return overlap / Math.min(wa.size, wb.size);
}

interface TitleStrategy {
  key: string;
  suffix: string;
}

function buildTitleStrategies(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): TitleStrategy[] {
  const strategies: TitleStrategy[] = [];
  const heroMat = heroMaterialKey(candidate);
  const hasOuter = candidate.products.some((p) => p.category === 'outerwear');
  const heroWord = heroItemWord(heroItem(candidate));
  const color = dominantOutfitColor(candidate);
  const archetype = archetypeLabel(profile);
  const dominantMat = dominantOutfitMaterialKey(candidate);

  if (heroMat && hasOuter) {
    strategies.push({ key: 'hero-mat-layer', suffix: `${heroMat} layer` });
  } else if (heroMat && heroWord) {
    strategies.push({ key: 'hero-mat-item', suffix: `${heroMat} ${heroWord}` });
  }
  if (color) {
    strategies.push({ key: 'color-archetype', suffix: `${color} ${archetype}` });
  }
  if (heroWord) {
    strategies.push({
      key: 'tonal-hero',
      suffix: `${color ?? 'tonal'} ${heroWord}`,
    });
  }
  if (dominantMat) {
    strategies.push({ key: 'mat-archetype', suffix: `${dominantMat} ${archetype}` });
  }
  strategies.push({ key: 'archetype', suffix: archetype });
  return strategies;
}

function buildUniqueTitle(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  index: number,
  usedTitles: Set<string>
): string {
  const prefix = OCCASION_COPY[candidate.occasion].title;
  const strategies = buildTitleStrategies(candidate, profile);
  const rotated = rotate(strategies, index);
  for (const strat of rotated) {
    if (!strat.suffix) continue;
    const title = `${prefix} · ${strat.suffix}`;
    if (!usedTitles.has(title)) return title;
  }
  const base = rotated[0]?.suffix ?? archetypeLabel(profile);
  return `${prefix} · ${base} ${index + 1}`;
}

interface ExplanationState {
  afgestemdUsed: boolean;
}

function buildUniqueExplanation(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  index: number,
  prevExplanations: string[],
  state: ExplanationState
): string {
  const framings = OCCASION_FRAMING[candidate.occasion] ?? [];
  const framing = framings.length > 0 ? framings[index % framings.length] : null;
  const adj = contextualGoalAdjective(candidate.occasion, profile.goals, index);
  const hero = heroItem(candidate);
  const heroWord = heroItemWord(hero);
  const heroName = hero?.product.name?.trim() || null;
  const prefMat = matchedPreferredMaterial(candidate, profile);
  const outfitMat = dominantOutfitMaterialKey(candidate);
  const color = dominantOutfitColor(candidate);
  const colorPair = outfitColorPair(candidate);
  const brands = matchedPreferredBrands(candidate, profile);

  const openingTemplates: string[] = [];
  if (!state.afgestemdUsed) {
    openingTemplates.push(`Afgestemd op je ${adj} stijl.`);
  }
  if (framing && heroWord) {
    openingTemplates.push(
      `${capitalize(framing)}, met een ${heroWord} als blikvanger.`
    );
  }
  if (framing) {
    openingTemplates.push(`${capitalize(framing)}: een ${adj} combinatie.`);
    openingTemplates.push(`${capitalize(framing)}.`);
  }
  if (heroWord) {
    openingTemplates.push(`De ${heroWord} draagt deze look.`);
  }
  openingTemplates.push(
    `Een ${adj} silhouet voor ${candidate.occasion === 'work' ? 'je werkweek' : 'alledag'}.`
  );

  const bodyPool: string[] = [];
  if (brands.length >= 2) {
    bodyPool.push(
      `Met stukken van je voorkeursmerken ${brands[0]} en ${brands[1]}.`
    );
  } else if (brands.length === 1) {
    bodyPool.push(`${brands[0]} als voorkeursmerk in de mix.`);
  }
  if (heroName && heroName.length <= 45) {
    bodyPool.push(`${heroName} geeft de toon aan.`);
  }
  if (prefMat) {
    bodyPool.push(`Afgestemd op je voorkeur voor ${prefMat}.`);
  } else if (outfitMat) {
    bodyPool.push(`Volledig in ${outfitMat}.`);
  }
  if (color) {
    bodyPool.push(`${capitalize(color)} als rode draad.`);
  } else if (colorPair) {
    bodyPool.push(`${capitalize(colorPair)}.`);
  }
  if (candidate.coherence.completeness >= 1) {
    bodyPool.push('Compleet van top tot schoen.');
  }
  if (profile.moodboard.totalCount >= 10 && profile.moodboard.confidence > 0.5) {
    bodyPool.push('Gebaseerd op je moodboard.');
  }
  if (profile.color.temperature) {
    bodyPool.push(TEMPERATURE_SENTENCE[profile.color.temperature]);
  }

  const assemble = (opening: string, body: string[]): string => {
    const opLower = opening.toLowerCase();
    const matKey = prefMat ?? outfitMat;
    const dedupBody: string[] = [];
    for (const line of body) {
      const lower = line.toLowerCase();
      if (matKey && lower.includes(matKey) && opLower.includes(matKey)) continue;
      if (color && lower.startsWith(capitalize(color).toLowerCase()) && opLower.includes(color)) continue;
      dedupBody.push(line);
      if (dedupBody.length >= 2) break;
    }
    return [opening, ...dedupBody].filter(Boolean).join(' ').trim();
  };

  const openingsRotated = rotate(openingTemplates, index);

  for (const opening of openingsRotated) {
    const maxShift = Math.max(1, bodyPool.length);
    for (let shift = 0; shift < maxShift; shift++) {
      const body = rotate(bodyPool, index + shift);
      const text = assemble(opening, body);
      const tooSimilar = prevExplanations.some(
        (prev) => wordOverlapSimilarity(prev, text) > EXPLANATION_SIMILARITY_THRESHOLD
      );
      if (!tooSimilar) {
        if (opening.startsWith('Afgestemd op je ')) state.afgestemdUsed = true;
        return text;
      }
    }
  }

  const fallbackOpening = openingsRotated[0] ?? `Een ${adj} combinatie.`;
  if (fallbackOpening.startsWith('Afgestemd op je ')) state.afgestemdUsed = true;
  return assemble(fallbackOpening, rotate(bodyPool, index));
}

function buildOutfitDescription(candidate: OutfitCandidate): string {
  return OCCASION_COPY[candidate.occasion].description;
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

  const usedTitles = new Set<string>();
  const prevExplanations: string[] = [];
  const explanationState: ExplanationState = { afgestemdUsed: false };

  const outfits = diversified.map((cand, i) => {
    const title = buildUniqueTitle(cand, profile, i, usedTitles);
    usedTitles.add(title);
    const explanation = buildUniqueExplanation(
      cand,
      profile,
      i,
      prevExplanations,
      explanationState
    );
    prevExplanations.push(explanation);
    return candidateToOutfit(cand, profile, season, title, explanation);
  });

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
