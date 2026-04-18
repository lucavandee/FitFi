import type { ArchetypeKey } from '@/config/archetypes';
import type {
  UserStyleProfile,
  ArchetypeWeights,
  MoodboardProfile,
  ColorPreference,
  FitKey,
  PrintsKey,
  OccasionKey,
  GoalKey,
  ColorSeasonKey,
  TemperatureKey,
  ValueKey,
  ContrastKey,
} from './types';

const QUIZ_STYLE_TO_ARCHETYPE: Record<string, ArchetypeWeights> = {
  minimalist: { MINIMALIST: 1.0 },
  classic: { CLASSIC: 1.0 },
  streetwear: { STREETWEAR: 1.0 },
  'smart-casual': { SMART_CASUAL: 0.7, CLASSIC: 0.3 },
  smart_casual: { SMART_CASUAL: 0.7, CLASSIC: 0.3 },
  athletic: { ATHLETIC: 1.0 },
  sporty: { ATHLETIC: 1.0 },
  rugged: { SMART_CASUAL: 0.5, STREETWEAR: 0.5 },
  bohemian: { AVANT_GARDE: 0.4, SMART_CASUAL: 0.6 },
  romantic: { CLASSIC: 0.6, SMART_CASUAL: 0.4 },
  edgy: { STREETWEAR: 0.5, AVANT_GARDE: 0.5 },
  'avant-garde': { AVANT_GARDE: 1.0 },
  avant_garde: { AVANT_GARDE: 1.0 },
  androgynous: { MINIMALIST: 0.7, SMART_CASUAL: 0.3 },
  luxury: { CLASSIC: 0.5, BUSINESS: 0.3, AVANT_GARDE: 0.2 },
  casual: { SMART_CASUAL: 0.7, STREETWEAR: 0.3 },
  vintage: { AVANT_GARDE: 0.5, CLASSIC: 0.5 },
  business: { BUSINESS: 1.0 },
  formal: { BUSINESS: 0.8, CLASSIC: 0.2 },
  tailored: { BUSINESS: 0.7, CLASSIC: 0.3 },
  zakelijk: { BUSINESS: 1.0 },
};

const MOODBOARD_ALIAS: Record<string, ArchetypeKey> = {
  minimalist: 'MINIMALIST',
  minimal: 'MINIMALIST',
  scandi_minimal: 'MINIMALIST',
  classic: 'CLASSIC',
  klassiek: 'CLASSIC',
  preppy: 'CLASSIC',
  refined: 'CLASSIC',
  polished: 'CLASSIC',
  sophisticated: 'CLASSIC',
  italian_smart_casual: 'SMART_CASUAL',
  smart_casual: 'SMART_CASUAL',
  'smart-casual': 'SMART_CASUAL',
  elevated: 'SMART_CASUAL',
  contemporary: 'SMART_CASUAL',
  tailored: 'BUSINESS',
  business: 'BUSINESS',
  formal: 'BUSINESS',
  zakelijk: 'BUSINESS',
  corporate: 'BUSINESS',
  suited: 'BUSINESS',
  street_refined: 'STREETWEAR',
  streetwear: 'STREETWEAR',
  urban: 'STREETWEAR',
  bold: 'STREETWEAR',
  statement: 'STREETWEAR',
  athleisure: 'ATHLETIC',
  sporty: 'ATHLETIC',
  athletic: 'ATHLETIC',
  artistic: 'AVANT_GARDE',
  bohemian: 'AVANT_GARDE',
  avant_garde: 'AVANT_GARDE',
  'avant-garde': 'AVANT_GARDE',
  monochrome: 'MINIMALIST',
  layered: 'AVANT_GARDE',
  romantic: 'CLASSIC',
  coastal: 'SMART_CASUAL',
  feminine: 'CLASSIC',
  breezy: 'SMART_CASUAL',
  soft: 'CLASSIC',
};

const DEFAULT_ARCHETYPES: ArchetypeWeights = {
  SMART_CASUAL: 0.5,
  CLASSIC: 0.3,
  MINIMALIST: 0.2,
};

const OCCASION_ARCHETYPE_BIAS: Record<OccasionKey, ArchetypeWeights> = {
  work: { BUSINESS: 0.15, CLASSIC: 0.25, SMART_CASUAL: 0.15, MINIMALIST: 0.1 },
  formal: { BUSINESS: 0.4, CLASSIC: 0.2, MINIMALIST: 0.05 },
  casual: { SMART_CASUAL: 0.2, CLASSIC: 0.1, AVANT_GARDE: 0.1, STREETWEAR: 0.1 },
  date: { CLASSIC: 0.15, SMART_CASUAL: 0.15, MINIMALIST: 0.1, AVANT_GARDE: 0.1 },
  travel: { SMART_CASUAL: 0.2, MINIMALIST: 0.15 },
  sport: { ATHLETIC: 0.5 },
  party: { SMART_CASUAL: 0.2, CLASSIC: 0.1 },
};

function normalizeWeights(weights: ArchetypeWeights): ArchetypeWeights {
  const entries = Object.entries(weights).filter(([, v]) => (v ?? 0) > 0);
  const sum = entries.reduce((a, [, v]) => a + (v as number), 0);
  if (sum <= 0) return {};
  const out: ArchetypeWeights = {};
  for (const [k, v] of entries) out[k as ArchetypeKey] = (v as number) / sum;
  return out;
}

function mergeWeights(
  base: ArchetypeWeights,
  add: ArchetypeWeights,
  weight = 1
): ArchetypeWeights {
  const out: ArchetypeWeights = { ...base };
  for (const [k, v] of Object.entries(add)) {
    const key = k as ArchetypeKey;
    out[key] = (out[key] ?? 0) + (v ?? 0) * weight;
  }
  return out;
}

function blendWeights(
  a: ArchetypeWeights,
  b: ArchetypeWeights,
  bFraction: number
): ArchetypeWeights {
  const aNorm = normalizeWeights(a);
  const bNorm = normalizeWeights(b);
  const out: ArchetypeWeights = {};
  const keys = new Set([...Object.keys(aNorm), ...Object.keys(bNorm)]);
  const aFraction = 1 - bFraction;
  for (const k of keys) {
    const key = k as ArchetypeKey;
    out[key] = (aNorm[key] ?? 0) * aFraction + (bNorm[key] ?? 0) * bFraction;
  }
  return normalizeWeights(out);
}

function quizStylesToArchetypes(styles: string[] | undefined): ArchetypeWeights {
  if (!styles || styles.length === 0) return {};
  let acc: ArchetypeWeights = {};
  for (const raw of styles) {
    const key = raw.toLowerCase().trim();
    const mapping = QUIZ_STYLE_TO_ARCHETYPE[key];
    if (mapping) acc = mergeWeights(acc, mapping, 1);
  }
  return normalizeWeights(acc);
}

function moodboardToArchetypes(
  embedding: Record<string, number> | undefined
): ArchetypeWeights {
  if (!embedding) return {};
  let acc: ArchetypeWeights = {};
  for (const [rawKey, rawVal] of Object.entries(embedding)) {
    const val = typeof rawVal === 'number' ? rawVal : 0;
    if (val <= 0) continue;
    const lower = rawKey.toLowerCase();
    const aliased = MOODBOARD_ALIAS[lower];
    const direct = (
      ['MINIMALIST', 'CLASSIC', 'SMART_CASUAL', 'STREETWEAR', 'ATHLETIC', 'AVANT_GARDE', 'BUSINESS'] as ArchetypeKey[]
    ).find((k) => k === rawKey || k.toLowerCase() === lower);
    const target: ArchetypeKey | undefined = direct ?? aliased;
    if (target) acc[target] = (acc[target] ?? 0) + val;
  }
  return normalizeWeights(acc);
}

function applyOccasionBias(
  weights: ArchetypeWeights,
  occasions: OccasionKey[]
): ArchetypeWeights {
  if (occasions.length === 0) return weights;
  let acc = { ...weights };
  for (const occ of occasions) {
    const bias = OCCASION_ARCHETYPE_BIAS[occ];
    if (!bias) continue;
    acc = mergeWeights(acc, bias, 1);
  }
  return normalizeWeights(acc);
}

function pickTopArchetypes(weights: ArchetypeWeights): {
  primary: ArchetypeKey;
  secondary: ArchetypeKey | null;
} {
  const entries = Object.entries(weights).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  );
  const primary = (entries[0]?.[0] as ArchetypeKey) ?? 'SMART_CASUAL';
  const secondary = (entries[1]?.[0] as ArchetypeKey | undefined) ?? null;
  return { primary, secondary };
}

function parseBudget(answers: Record<string, any>): {
  perItemMax: number;
  perItemMin: number;
  totalMax: number;
} {
  const explicit =
    answers.budget && typeof answers.budget === 'object'
      ? answers.budget
      : null;
  if (explicit && typeof explicit.max === 'number') {
    const perItemMax = Math.max(15, explicit.max);
    const perItemMin =
      typeof explicit.min === 'number'
        ? Math.max(0, explicit.min)
        : perItemMax * 0.3;
    return {
      perItemMax,
      perItemMin,
      totalMax: perItemMax * 4,
    };
  }
  const slider =
    typeof answers.budgetRange === 'number' ? answers.budgetRange : null;
  if (slider !== null && slider > 0) {
    return {
      perItemMax: slider,
      perItemMin: slider * 0.3,
      totalMax: slider * 4,
    };
  }
  return { perItemMax: 150, perItemMin: 45, totalMax: 600 };
}

function normalizeOccasions(raw: any): OccasionKey[] {
  const valid: OccasionKey[] = [
    'work',
    'casual',
    'formal',
    'date',
    'travel',
    'sport',
    'party',
  ];
  if (!Array.isArray(raw)) return [];
  const set = new Set<OccasionKey>();
  for (const item of raw) {
    const norm = String(item).toLowerCase().trim();
    if (valid.includes(norm as OccasionKey)) set.add(norm as OccasionKey);
    else if (norm === 'kantoor') set.add('work');
    else if (norm === 'formeel') set.add('formal');
    else if (norm === 'reizen') set.add('travel');
    else if (norm === 'gym' || norm === 'sport & actief') set.add('sport');
    else if (norm === 'feest' || norm === 'uitgaan' || norm === 'festival' || norm === 'stappen') set.add('party');
  }
  return Array.from(set);
}

function normalizeGoals(raw: any): GoalKey[] {
  const valid: GoalKey[] = [
    'timeless',
    'trendy',
    'minimal',
    'express',
    'professional',
    'comfort',
  ];
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw
        .map((r) => String(r).toLowerCase().trim())
        .filter((v): v is GoalKey => valid.includes(v as GoalKey))
    )
  );
}

function normalizeMaterials(raw: any): { preferred: string[]; avoided: string[] } {
  if (!raw) return { preferred: [], avoided: [] };
  const arr = Array.isArray(raw) ? raw : [raw];
  const preferred = arr
    .map((m) => String(m).toLowerCase().trim())
    .filter(Boolean);
  return { preferred, avoided: [] };
}

function buildColorPreference(answers: Record<string, any>): ColorPreference {
  const cp = answers.colorProfile ?? {};
  const ca = answers.colorAnalysis ?? {};
  const temperature: TemperatureKey | null = (() => {
    const raw =
      cp.temperature ?? answers.neutrals ?? (ca.undertone === 'warm'
        ? 'warm'
        : ca.undertone === 'cool'
        ? 'koel'
        : ca.undertone === 'neutral'
        ? 'neutraal'
        : null);
    if (raw === 'warm' || raw === 'koel' || raw === 'neutraal') return raw;
    return null;
  })();
  const value: ValueKey | null = (() => {
    const raw = cp.value ?? answers.lightness;
    if (raw === 'licht' || raw === 'medium' || raw === 'donker') return raw;
    return null;
  })();
  const contrast: ContrastKey | null = (() => {
    const raw = cp.contrast ?? answers.contrast;
    if (raw === 'laag' || raw === 'medium' || raw === 'hoog') return raw;
    return null;
  })();
  const season: ColorSeasonKey | null = (() => {
    const raw = cp.season ?? (ca.seasonal_type as string | undefined);
    if (raw === 'lente' || raw === 'zomer' || raw === 'herfst' || raw === 'winter')
      return raw;
    if (raw === 'spring') return 'lente';
    if (raw === 'summer') return 'zomer';
    if (raw === 'autumn' || raw === 'fall') return 'herfst';
    if (raw === 'winter') return 'winter';
    return null;
  })();
  const undertone =
    (ca.undertone as 'warm' | 'cool' | 'neutral' | undefined) ??
    (temperature === 'warm'
      ? 'warm'
      : temperature === 'koel'
      ? 'cool'
      : temperature === 'neutraal'
      ? 'neutral'
      : null);

  return {
    temperature,
    value,
    contrast,
    season,
    undertone,
    preferredColors: Array.isArray(ca.best_colors) ? ca.best_colors : [],
    avoidColors: Array.isArray(ca.avoid_colors) ? ca.avoid_colors : [],
  };
}

function buildMoodboard(answers: Record<string, any>): MoodboardProfile {
  let archetypeWeights: ArchetypeWeights = {};
  let likedColors: string[] = [];
  let likedStyles: string[] = [];
  let likeCount = 0;
  let totalCount = 0;

  try {
    const embRaw =
      typeof window !== 'undefined'
        ? window.localStorage?.getItem('ff_visual_embedding')
        : null;
    if (embRaw) {
      const parsed = JSON.parse(embRaw);
      if (parsed && typeof parsed === 'object') {
        archetypeWeights = moodboardToArchetypes(parsed);
      }
    }
    const countRaw =
      typeof window !== 'undefined'
        ? window.localStorage?.getItem('ff_swipe_count')
        : null;
    if (countRaw) totalCount = parseInt(countRaw, 10) || 0;

    const patternRaw =
      typeof window !== 'undefined'
        ? window.localStorage?.getItem('ff_swipe_pattern')
        : null;
    if (patternRaw) {
      const parsed = JSON.parse(patternRaw);
      if (parsed && typeof parsed === 'object') {
        likedColors = Array.isArray(parsed.dominantColors)
          ? parsed.dominantColors.map((c: string) => String(c).toLowerCase())
          : [];
        likedStyles = Array.isArray(parsed.preferredStyles)
          ? parsed.preferredStyles.map((s: string) => String(s).toLowerCase())
          : [];
        likeCount =
          typeof parsed.likeCount === 'number' ? parsed.likeCount : 0;
      }
    }
  } catch {}

  if (Array.isArray(answers.swipeLikedColors)) {
    likedColors = answers.swipeLikedColors.map((c: string) =>
      String(c).toLowerCase()
    );
  }
  if (Array.isArray(answers.swipeLikedStyles)) {
    likedStyles = answers.swipeLikedStyles.map((s: string) =>
      String(s).toLowerCase()
    );
  }
  if (answers.swipeEmbedding && typeof answers.swipeEmbedding === 'object') {
    archetypeWeights = moodboardToArchetypes(answers.swipeEmbedding);
  }

  const confidence = totalCount >= 15 ? 1.0 : Math.min(totalCount / 15, 1.0);

  return {
    archetypeWeights,
    likedColors,
    likedStyles,
    avoidedColors: [],
    likeCount,
    totalCount,
    confidence,
  };
}

function resolveFit(value: any): FitKey | null {
  const norm = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (
    norm === 'slim' ||
    norm === 'regular' ||
    norm === 'relaxed' ||
    norm === 'oversized'
  ) {
    return norm;
  }
  if (norm === 'tailored' || norm === 'fitted') return 'slim';
  return null;
}

function resolvePrints(value: any): PrintsKey | null {
  const norm = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (
    norm === 'effen' ||
    norm === 'subtiel' ||
    norm === 'statement' ||
    norm === 'gemengd'
  ) {
    return norm;
  }
  if (norm === 'geen') return 'effen';
  return null;
}

function resolveGender(value: any): UserStyleProfile['gender'] {
  const norm = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (
    norm === 'male' ||
    norm === 'female' ||
    norm === 'non-binary' ||
    norm === 'prefer-not-to-say' ||
    norm === 'unisex'
  ) {
    return norm;
  }
  return 'unisex';
}

export function buildUserStyleProfile(
  answers: Record<string, any>
): UserStyleProfile {
  const gender = resolveGender(answers.gender);
  const occasions = normalizeOccasions(answers.occasions);
  const goals = normalizeGoals(answers.goals);
  const materials = normalizeMaterials(answers.materials);
  const fit = resolveFit(answers.fit);
  const prints = resolvePrints(answers.prints);
  const budget = parseBudget(answers);
  const color = buildColorPreference(answers);
  const moodboard = buildMoodboard(answers);

  const quizArchetypes = quizStylesToArchetypes(
    Array.isArray(answers.stylePreferences)
      ? answers.stylePreferences
      : typeof answers.style === 'string'
      ? [answers.style]
      : undefined
  );

  const quizBase =
    Object.keys(quizArchetypes).length > 0 ? quizArchetypes : DEFAULT_ARCHETYPES;

  const swipeArchetypes = moodboard.archetypeWeights;
  const swipeInfluence =
    Object.keys(swipeArchetypes).length > 0
      ? Math.min(moodboard.confidence * 0.45, 0.45)
      : 0;

  let blended = swipeInfluence > 0
    ? blendWeights(quizBase, swipeArchetypes, swipeInfluence)
    : normalizeWeights(quizBase);

  blended = applyOccasionBias(blended, occasions);
  const { primary, secondary } = pickTopArchetypes(blended);

  return {
    userId: typeof answers.userId === 'string' ? answers.userId : undefined,
    gender,
    archetypes: blended,
    primaryArchetype: primary,
    secondaryArchetype: secondary,
    color,
    fit,
    prints,
    materials,
    budget,
    occasions,
    goals,
    sizes:
      answers.sizes && typeof answers.sizes === 'object'
        ? {
            tops: answers.sizes.tops,
            bottoms: answers.sizes.bottoms,
            shoes: answers.sizes.shoes,
          }
        : {},
    moodboard,
    diagnostics: {
      quizArchetypes: normalizeWeights(quizBase),
      swipeInfluence,
      hasMoodboard: Object.keys(swipeArchetypes).length > 0,
      hasColorAnalysis: color.temperature !== null || color.season !== null,
    },
  };
}

export { normalizeWeights, mergeWeights, blendWeights };
