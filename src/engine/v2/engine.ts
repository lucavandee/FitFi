import type { Outfit, Product } from '../types';
import type {
  EngineOptions,
  EngineResult,
  GoalKey,
  NormalizedCategory,
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

const COLOR_LABEL: Record<string, string> = {
  zwart: 'Zwart',
  wit: 'Wit',
  grijs: 'Grijs',
  navy: 'Navy',
  camel: 'Camel',
  denim: 'Denim',
  contrast: 'Contrast',
  aardetinten: 'Aardetint',
  charcoal: 'Charcoal',
  monochrome: 'Monochroom',
  blauw: 'Blauw',
  rood: 'Bordeaux',
  groen: 'Olijf',
  bruin: 'Bruin',
  roze: 'Roze',
  geel: 'Mosterd',
  oranje: 'Oranje',
};

const KEY_PIECE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /blazer|colbert/i, label: 'Blazer' },
  { pattern: /trenchcoat|trench\b|mantel\b/i, label: 'Trench' },
  { pattern: /puffer|donsjas/i, label: 'Puffer' },
  { pattern: /parka/i, label: 'Parka' },
  { pattern: /bomber/i, label: 'Bomber' },
  { pattern: /overshirt/i, label: 'Overshirt' },
  { pattern: /cardigan|vest\b/i, label: 'Cardigan' },
  { pattern: /trui|sweater|pullover|gebreid|knit/i, label: 'Knit' },
  { pattern: /overhemd|button-down|dress shirt/i, label: 'Overhemd' },
  { pattern: /polo/i, label: 'Polo' },
  { pattern: /hoodie/i, label: 'Hoodie' },
  { pattern: /chino/i, label: 'Chino' },
  { pattern: /pantalon/i, label: 'Pantalon' },
  { pattern: /jeans|spijkerbroek/i, label: 'Jeans' },
  { pattern: /jurk\b|dress\b/i, label: 'Jurk' },
  { pattern: /jumpsuit/i, label: 'Jumpsuit' },
  { pattern: /rok\b|skirt/i, label: 'Rok' },
  { pattern: /oxford/i, label: 'Oxford' },
  { pattern: /loafer/i, label: 'Loafers' },
  { pattern: /chelsea/i, label: 'Chelsea' },
];

const MATERIAL_LABEL: Record<string, string> = {
  wol: 'Wollen',
  merino: 'Merino',
  katoen: 'Katoenen',
  linnen: 'Linnen',
  denim: 'Denim',
  leer: 'Leren',
  zijde: 'Zijden',
  kasjmier: 'Kasjmier',
  fleece: 'Fleece',
  tech: 'Tech',
  canvas: 'Canvas',
  ribstof: 'Ribstof',
};

interface DiversityContext {
  usedTitles: Set<string>;
  usedExplanationKeys: Set<string>;
  finalizedExplanations: string[];
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

function materialCounts(candidate: OutfitCandidate): Map<string, number> {
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
  return counts;
}

function dominantMaterialKey(candidate: OutfitCandidate): string | null {
  const counts = materialCounts(candidate);
  if (counts.size === 0) return null;
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0][0];
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
  const counts = materialCounts(candidate);
  if (counts.size === 0) return null;
  const sorted = [...counts.entries()].sort(([, a], [, b]) => b - a);
  const total = candidate.products.length;
  const [top1, n1] = sorted[0];
  if (sorted.length === 1 || n1 / total >= 0.6) return `Volledig in ${top1}`;
  const [top2] = sorted[1];
  return `Mix van ${top1} en ${top2}`;
}

function dominantOutfitColorKey(candidate: OutfitCandidate): string | null {
  const counts = new Map<string, number>();
  for (const p of candidate.products) {
    for (const tag of p.colorTags) {
      const key = tag.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0][0];
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

function keyPieceLabel(candidate: OutfitCandidate): string | null {
  const priority: NormalizedCategory[] = [
    'outerwear',
    'dress',
    'jumpsuit',
    'top',
    'bottom',
    'footwear',
  ];
  const items = [...candidate.products].sort((a, b) => {
    const ia = priority.indexOf(a.category);
    const ib = priority.indexOf(b.category);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  for (const p of items) {
    const txt = `${p.product.type || ''} ${p.product.name || ''}`;
    for (const { pattern, label } of KEY_PIECE_PATTERNS) {
      if (pattern.test(txt)) return label;
    }
  }
  return null;
}

function dominantOutfitBrand(candidate: OutfitCandidate): string | null {
  const counts = new Map<string, number>();
  for (const p of candidate.products) {
    const brand = (p.product.brand || '').trim();
    if (!brand) continue;
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  const sorted = [...counts.entries()].sort(([, a], [, b]) => b - a);
  const [top, count] = sorted[0];
  return count >= 2 ? top : null;
}

function buildOutfitTitle(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  index: number,
  ctx: DiversityContext
): string {
  const base = OCCASION_COPY[candidate.occasion].title;
  const options: string[] = [];

  const colorKey = dominantOutfitColorKey(candidate);
  if (colorKey) {
    const label = COLOR_LABEL[colorKey] ?? capitalize(colorKey);
    options.push(`${base} · ${label}`);
  }

  const piece = keyPieceLabel(candidate);
  if (piece) options.push(`${base} · ${piece}`);

  const matKey = dominantMaterialKey(candidate);
  if (matKey) {
    const label = MATERIAL_LABEL[matKey] ?? capitalize(matKey);
    options.push(`${base} · ${label}`);
  }

  const goal = primaryGoalAdjective(profile.goals, index);
  if (goal) options.push(`${base} · ${capitalize(goal)}`);

  if (options.length === 0) {
    const archetype = profile.primaryArchetype.toLowerCase().replace(/_/g, ' ');
    options.push(`${base} · ${capitalize(archetype)}`);
  }

  const offset = index % options.length;
  for (let i = 0; i < options.length; i++) {
    const title = options[(offset + i) % options.length];
    if (!ctx.usedTitles.has(title)) {
      ctx.usedTitles.add(title);
      return title;
    }
  }

  let variant = 2;
  while (true) {
    const fallback = `${base} · #${variant}`;
    if (!ctx.usedTitles.has(fallback)) {
      ctx.usedTitles.add(fallback);
      return fallback;
    }
    variant++;
  }
}

function buildOutfitDescription(candidate: OutfitCandidate): string {
  return OCCASION_COPY[candidate.occasion].description;
}

interface ExplanationFragment {
  key: string;
  text: string;
  isGeneric: boolean;
}

function candidateFragments(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  index: number
): ExplanationFragment[] {
  const fragments: ExplanationFragment[] = [];

  const goal = primaryGoalAdjective(profile.goals, index);
  if (goal) {
    fragments.push({
      key: `goal:${goal}`,
      text: `Afgestemd op je ${goal} stijl.`,
      isGeneric: false,
    });
  }

  const outfitSignal = outfitSpecificSignal(candidate, index);
  if (outfitSignal) {
    fragments.push({
      key: `outfit:${outfitSignal}`,
      text: outfitSignal,
      isGeneric: false,
    });
  }

  const brand = dominantOutfitBrand(candidate);
  if (brand) {
    const preferred = new Set(
      profile.preferredBrands.map((b) => b.toLowerCase().trim())
    );
    const brandLc = brand.toLowerCase();
    const isPreferred =
      preferred.has(brandLc) ||
      [...preferred].some((p) => brandLc.includes(p) || p.includes(brandLc));
    const text = isPreferred
      ? `Met ${brand} als voorkeursmerk in de mix.`
      : `Rond ${brand} opgebouwd.`;
    fragments.push({ key: `brand:${brand}`, text, isGeneric: false });
  }

  const piece = keyPieceLabel(candidate);
  if (piece) {
    fragments.push({
      key: `piece:${piece}`,
      text: `Opgebouwd rond een ${piece.toLowerCase()}.`,
      isGeneric: false,
    });
  }

  const material = matchedPreferredMaterial(candidate, profile);
  if (
    material &&
    (!outfitSignal || !outfitSignal.toLowerCase().includes(material))
  ) {
    fragments.push({
      key: `prefmat:${material}`,
      text: `Met je voorkeur voor ${material}.`,
      isGeneric: false,
    });
  }

  if (profile.color.temperature) {
    fragments.push({
      key: `temp:${profile.color.temperature}`,
      text: TEMPERATURE_SENTENCE[profile.color.temperature],
      isGeneric: true,
    });
  }

  if (candidate.coherence.completeness >= 1) {
    fragments.push({
      key: 'complete',
      text: 'Compleet van top tot schoen.',
      isGeneric: true,
    });
  }

  if (profile.moodboard.totalCount >= 10 && profile.moodboard.confidence > 0.5) {
    fragments.push({
      key: 'moodboard',
      text: 'Gebaseerd op je moodboard-keuzes.',
      isGeneric: true,
    });
  }

  return fragments;
}

function pickFragments(
  available: ExplanationFragment[],
  seen: Set<string>,
  max: number
): ExplanationFragment[] {
  const scored = available.map((frag, order) => ({
    frag,
    order,
    seen: seen.has(frag.key) ? 1 : 0,
    generic: frag.isGeneric ? 1 : 0,
  }));
  scored.sort(
    (a, b) => a.seen - b.seen || a.generic - b.generic || a.order - b.order
  );
  return scored.slice(0, max).map((s) => s.frag);
}

function wordOverlapSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[.,·#]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
  const wa = normalize(a);
  const wb = normalize(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let shared = 0;
  for (const w of wa) if (wb.has(w)) shared++;
  return shared / Math.min(wa.size, wb.size);
}

function buildExplanation(
  candidate: OutfitCandidate,
  profile: UserStyleProfile,
  index: number,
  ctx: DiversityContext
): string {
  const all = candidateFragments(candidate, profile, index);
  if (all.length === 0) {
    const primary = profile.primaryArchetype.toLowerCase().replace(/_/g, ' ');
    const text = `Afgestemd op je ${primary}-voorkeur.`;
    ctx.finalizedExplanations.push(text);
    return text;
  }

  const SIM_THRESHOLD = 0.8;
  let best: { text: string; picked: ExplanationFragment[]; worst: number } = {
    text: '',
    picked: [],
    worst: 1,
  };

  for (let rotation = 0; rotation < all.length; rotation++) {
    const rotated = all.slice(rotation).concat(all.slice(0, rotation));
    const picked = pickFragments(rotated, ctx.usedExplanationKeys, 3);
    if (picked.length === 0) continue;
    const text = picked.map((p) => p.text).join(' ');
    const worst = ctx.finalizedExplanations.reduce(
      (acc, prev) => Math.max(acc, wordOverlapSimilarity(text, prev)),
      0
    );
    if (worst < SIM_THRESHOLD) {
      best = { text, picked, worst };
      break;
    }
    if (worst < best.worst) best = { text, picked, worst };
  }

  for (const p of best.picked) ctx.usedExplanationKeys.add(p.key);
  ctx.finalizedExplanations.push(best.text);
  return best.text;
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
  index: number,
  ctx: DiversityContext
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
    title: buildOutfitTitle(candidate, profile, index, ctx),
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
    explanation: buildExplanation(candidate, profile, index, ctx),
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

  const ctx: DiversityContext = {
    usedTitles: new Set(),
    usedExplanationKeys: new Set(),
    finalizedExplanations: [],
  };

  const outfits = diversified.map((c, i) =>
    candidateToOutfit(c, profile, season, i, ctx)
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
