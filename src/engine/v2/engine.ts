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

function heroItem(candidate: OutfitCandidate): ScoredProduct | null {
  const priority: Record<string, number> = {
    dress: 0,
    outerwear: 1,
    jumpsuit: 2,
    top: 3,
    bottom: 4,
    footwear: 5,
    accessory: 6,
  };
  let best: ScoredProduct | null = null;
  let bestScore = -Infinity;
  for (const p of candidate.products) {
    const price = typeof p.product.price === 'number' ? p.product.price : 0;
    const prio = priority[p.category] ?? 9;
    const s = price * 10 + (10 - prio);
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return best;
}

function heroItemTypeWord(hero: ScoredProduct | null): string | null {
  if (!hero) return null;
  const source = (hero.product.type || hero.product.name || '').toLowerCase().trim();
  if (!source) {
    const catMap: Record<string, string> = {
      top: 'top',
      bottom: 'broek',
      footwear: 'schoen',
      outerwear: 'jas',
      dress: 'jurk',
      jumpsuit: 'jumpsuit',
      accessory: 'accessoire',
    };
    return catMap[hero.category] ?? null;
  }
  return source.split(/\s+/)[0] || null;
}

function dominantMaterialKey(candidate: OutfitCandidate): string | null {
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
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0][0];
}

function heroMaterialKey(hero: ScoredProduct | null): string | null {
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

function dominantColorWord(candidate: OutfitCandidate): string | null {
  const counts = new Map<string, number>();
  for (const p of candidate.products) {
    const first = p.colorTags[0];
    if (first) counts.set(first.toLowerCase(), (counts.get(first.toLowerCase()) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0][0];
}

function isMonochrome(candidate: OutfitCandidate): boolean {
  const set = new Set<string>();
  for (const p of candidate.products) {
    const c = p.colorTags[0];
    if (c) set.add(c.toLowerCase());
  }
  return set.size === 1 && candidate.products.length >= 2;
}

const ARCHETYPE_DESCRIPTOR: Record<string, string> = {
  classic: 'tailored',
  classic_italian: 'tailored',
  italian_sprezzatura: 'sprezzatura',
  modern_classic: 'refined',
  minimalist: 'essential',
  scandi_minimalist: 'clean',
  japanese_minimal: 'pure',
  streetwear: 'relaxed',
  modern_street: 'casual',
  athleisure: 'sporty',
  smart_casual: 'smart',
  business_casual: 'refined',
  techwear: 'technical',
  romantic: 'soft',
  preppy: 'preppy',
  bohemian: 'flowing',
  gorpcore: 'outdoor',
  rugged: 'rugged',
  workwear: 'workwear',
};

function archetypeWord(profile: UserStyleProfile): string {
  const key = profile.primaryArchetype.toLowerCase();
  return ARCHETYPE_DESCRIPTOR[key] ?? key.replace('_', ' ');
}

function buildOutfitTitle(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  existing: Set<string>
): string {
  const base = OCCASION_COPY[candidate.occasion].title;
  const hero = heroItem(candidate);
  const heroType = heroItemTypeWord(hero);
  const heroMat = heroMaterialKey(hero);
  const dominantMat = dominantMaterialKey(candidate);
  const dominantColor = dominantColorWord(candidate);
  const archWord = archetypeWord(profile);
  const mono = isMonochrome(candidate);

  const variants: string[] = [];
  if (heroMat && heroType) variants.push(`${base} · ${heroMat} ${heroType}`);
  if (dominantColor && archWord) variants.push(`${base} · ${dominantColor} ${archWord}`);
  if (mono && heroType) variants.push(`${base} · tonal ${heroType}`);
  if (dominantMat && heroType && dominantMat !== heroMat) variants.push(`${base} · ${dominantMat} ${heroType}`);
  if (dominantMat) variants.push(`${base} · ${dominantMat} focus`);
  if (dominantColor) variants.push(`${base} · ${dominantColor} ${archWord}`);
  if (heroType) variants.push(`${base} · ${archWord} ${heroType}`);
  variants.push(`${base} · ${archWord}`);
  variants.push(`${base} · ${profile.primaryArchetype.toLowerCase().replace('_', ' ')}`);

  for (const v of variants) {
    if (!existing.has(v)) return v;
  }
  let suffix = 2;
  while (existing.has(`${variants[0]} ${suffix}`)) suffix++;
  return `${variants[0]} ${suffix}`;
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

function primaryGoalAdjective(goals: GoalKey[], index: number): string | null {
  const priority: GoalKey[] = ['timeless', 'professional', 'express', 'minimal'];
  const matched: string[] = [];
  for (const key of priority) {
    if (!goals.includes(key)) continue;
    const adj = GOAL_ADJECTIVE[key];
    if (adj) matched.push(adj);
  }
  if (matched.length === 0) return null;
  return matched[index % matched.length];
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

function dominantOutfitMaterial(candidate: OutfitCandidate): string | null {
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
  const total = candidate.products.length;
  const [top1, n1] = sorted[0];
  if (sorted.length === 1 || n1 / total >= 0.6) return `Volledig in ${top1}`;
  const [top2] = sorted[1];
  return `Mix van ${top1} en ${top2}`;
}

function outfitColorSignal(candidate: OutfitCandidate): string | null {
  const colors: string[] = [];
  for (const p of candidate.products) {
    const first = p.colorTags[0];
    if (first) colors.push(first.toLowerCase());
  }
  if (colors.length === 0) return null;
  const unique = Array.from(new Set(colors));
  if (unique.length === 1) return `Monochroom ${unique[0]}`;
  return `${unique[0]} met ${unique[1]}`;
}

function outfitLayeringSignal(candidate: OutfitCandidate): string | null {
  const outer = candidate.products.find((p) => p.category === 'outerwear');
  if (!outer) return null;
  const source = (outer.product.type || outer.product.name || 'jas')
    .toLowerCase()
    .trim();
  const label = source.split(/\s+/)[0] || 'jas';
  return `Gelaagd met ${label}`;
}

function outfitSpecificSignal(
  candidate: OutfitCandidate,
  index: number
): string | null {
  const options = [
    dominantOutfitMaterial(candidate),
    outfitColorSignal(candidate),
    outfitLayeringSignal(candidate),
  ].filter((s): s is string => s !== null);
  if (options.length === 0) return null;
  return `${options[index % options.length]}.`;
}

const OCCASION_OPENINGS: Record<OccasionKey, string[]> = {
  work: [
    'Voor kantoor',
    'Zakelijk maar comfortabel',
    'Office-ready',
    'Nette basis voor werk',
  ],
  casual: [
    'Voor je vrije dag',
    'Relaxed maar stijlvol',
    'Laid-back essentials',
    'Moeiteloos dagelijks',
  ],
  formal: [
    'Voor een nette setting',
    'Ingetogen formeel',
    'Verzorgd en stijlvol',
  ],
  date: [
    'Voor een avond uit',
    'Verzorgd maar relaxed',
    'Date-ready',
    'Met een beetje extra',
  ],
  travel: [
    'Voor onderweg',
    'Travel-ready comfort',
    'Soepel onderweg',
  ],
  sport: [
    'Voor actieve momenten',
    'Functioneel en sportief',
  ],
  party: [
    'Voor een avond stappen',
    'Opvallend maar niet overdressed',
    'Uitgaan-klaar',
  ],
};

const OCCASION_GOAL_ADJECTIVE: Partial<Record<OccasionKey, GoalKey>> = {
  work: 'professional',
  date: 'express',
  party: 'express',
  formal: 'professional',
};

function occasionGoalAdjective(
  occasion: OccasionKey,
  goals: GoalKey[],
  index: number
): string {
  const preferred = OCCASION_GOAL_ADJECTIVE[occasion];
  if (preferred && goals.includes(preferred)) {
    const adj = GOAL_ADJECTIVE[preferred];
    if (adj) return adj;
  }
  if (occasion === 'date') return 'verzorgde';
  if (occasion === 'work') return 'professionele';
  const fallback = primaryGoalAdjective(goals, index);
  return fallback ?? 'tijdloze';
}

function countPreferredBrandMatches(
  candidate: OutfitCandidate,
  profile: UserStyleProfile
): string[] {
  const prefs = profile.preferredBrands.map((b) => b.toLowerCase().trim()).filter(Boolean);
  if (prefs.length === 0) return [];
  const hits: string[] = [];
  for (const p of candidate.products) {
    const brand = (p.product.brand ?? '').toLowerCase().trim();
    if (!brand) continue;
    if (prefs.some((pb) => brand === pb || brand.includes(pb) || pb.includes(brand))) {
      hits.push(p.product.brand as string);
    }
  }
  return Array.from(new Set(hits));
}

function heroCallout(hero: ScoredProduct | null): string | null {
  if (!hero) return null;
  const brand = (hero.product.brand ?? '').trim();
  const type = heroItemTypeWord(hero);
  if (!type) return null;
  if (brand) return `Gebouwd rond de ${brand} ${type}.`;
  return `Gebouwd rond de ${type}.`;
}

function wordTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,:;!?·()"'"]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function wordOverlapSimilarity(a: string, b: string): number {
  const setA = new Set(wordTokens(a));
  const setB = new Set(wordTokens(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const w of setA) if (setB.has(w)) shared++;
  return shared / Math.min(setA.size, setB.size);
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]*[.!?]?/);
  return (m ? m[0] : text).trim();
}

interface BodyFragment {
  id: string;
  text: string;
}

function buildBodyFragments(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  index: number
): BodyFragment[] {
  const fragments: BodyFragment[] = [];
  const hero = heroItem(candidate);

  const callout = heroCallout(hero);
  if (callout) fragments.push({ id: 'hero', text: callout });

  const brandMatches = countPreferredBrandMatches(candidate, profile);
  if (brandMatches.length >= 2) {
    const [x, y] = brandMatches;
    fragments.push({
      id: 'brands',
      text: `Met stukken van je voorkeursmerken ${x} en ${y}.`,
    });
  } else if (brandMatches.length === 1) {
    fragments.push({
      id: 'brand',
      text: `Met ${brandMatches[0]} uit je voorkeursmerken.`,
    });
  }

  const material = matchedPreferredMaterial(candidate, profile);
  if (material) {
    fragments.push({ id: 'material', text: `Met je voorkeur voor ${material}.` });
  }

  const outfitSignal = outfitSpecificSignal(candidate, index);
  if (outfitSignal) fragments.push({ id: 'outfit', text: outfitSignal });

  if (profile.color.temperature) {
    fragments.push({ id: 'temp', text: TEMPERATURE_SENTENCE[profile.color.temperature] });
  }

  if (candidate.coherence.completeness >= 1) {
    fragments.push({ id: 'complete', text: 'Compleet van top tot schoen.' });
  }

  if (profile.moodboard.totalCount >= 10 && profile.moodboard.confidence > 0.5) {
    fragments.push({ id: 'moodboard', text: 'Gebaseerd op je moodboard-keuzes.' });
  }

  return fragments;
}

function composeExplanation(
  opening: string,
  goalAdj: string,
  fragments: BodyFragment[],
  includeGoalSentence: boolean
): string {
  const parts: string[] = [];
  if (fragments.length > 0) {
    parts.push(`${opening}: ${fragments[0].text}`);
  } else {
    parts.push(`${opening}.`);
  }
  for (let i = 1; i < fragments.length && parts.length < 3; i++) {
    parts.push(fragments[i].text);
  }
  if (includeGoalSentence && parts.length < 3) {
    parts.push(`Een ${goalAdj} basis.`);
  }
  return parts.join(' ').replace(/\.\./g, '.');
}

function buildExplanationSet(
  candidates: OutfitCandidate[],
  profile: UserStyleProfile
): string[] {
  const usedOpenings = new Set<string>();
  const explanations: string[] = [];
  let goalSentenceUsed = false;

  const bodies = candidates.map((c, i) => buildBodyFragments(c, profile, i));
  const openings: string[] = candidates.map((c, i) => {
    const pool = OCCASION_OPENINGS[c.occasion] ?? ['Voor elke dag'];
    for (let k = 0; k < pool.length; k++) {
      const candidate = pool[(i + k) % pool.length];
      if (!usedOpenings.has(candidate)) {
        usedOpenings.add(candidate);
        return candidate;
      }
    }
    return `${pool[0]} ${i + 1}`;
  });

  candidates.forEach((cand, i) => {
    const goalAdj = occasionGoalAdjective(cand.occasion, profile.goals, i);
    const includeGoal = !goalSentenceUsed && bodies[i].length < 2;
    if (includeGoal) goalSentenceUsed = true;
    const frags = [...bodies[i]];
    const rotate = i % Math.max(1, frags.length || 1);
    const rotated = frags.length > 1 ? [...frags.slice(rotate), ...frags.slice(0, rotate)] : frags;
    const text = composeExplanation(openings[i], goalAdj, rotated, includeGoal);
    explanations.push(text || `Een ${goalAdj} keuze.`);
  });

  const seenOpeningSentences = new Set<string>();
  for (let i = 0; i < explanations.length; i++) {
    const open = firstSentence(explanations[i]).toLowerCase();
    if (seenOpeningSentences.has(open)) {
      const pool = OCCASION_OPENINGS[candidates[i].occasion] ?? ['Voor elke dag'];
      for (let k = 0; k < pool.length; k++) {
        const alt = `${pool[(i + k + 1) % pool.length]} (${i + 1})`;
        const goalAdj = occasionGoalAdjective(candidates[i].occasion, profile.goals, i);
        const candidateText = composeExplanation(alt, goalAdj, bodies[i], false);
        if (!seenOpeningSentences.has(firstSentence(candidateText).toLowerCase())) {
          explanations[i] = candidateText;
          break;
        }
      }
    }
    seenOpeningSentences.add(firstSentence(explanations[i]).toLowerCase());
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    let changed = false;
    for (let i = 0; i < explanations.length; i++) {
      for (let j = i + 1; j < explanations.length; j++) {
        if (wordOverlapSimilarity(explanations[i], explanations[j]) > 0.6) {
          const frags = bodies[j];
          if (frags.length <= 1) continue;
          const rot = (j + attempt + 1) % frags.length;
          const rotated = [...frags.slice(rot), ...frags.slice(0, rot)];
          const goalAdj = occasionGoalAdjective(candidates[j].occasion, profile.goals, j);
          const next = composeExplanation(openings[j], goalAdj, rotated, false);
          if (next !== explanations[j]) {
            explanations[j] = next;
            changed = true;
          }
        }
      }
    }
    if (!changed) break;
  }

  return explanations;
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
    season,
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

  const explanations = buildExplanationSet(diversified, profile);
  const usedTitles = new Set<string>();
  const titles = diversified.map((c) => {
    const t = buildOutfitTitle(c, profile, usedTitles);
    usedTitles.add(t);
    return t;
  });

  const outfits = diversified.map((c, i) =>
    candidateToOutfit(c, profile, season, titles[i], explanations[i])
  );

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
