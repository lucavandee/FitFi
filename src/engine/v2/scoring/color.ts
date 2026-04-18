import type { ScoredProduct, UserStyleProfile, TemperatureKey } from '../types';

const WARM_COLORS = new Set([
  'rood',
  'oranje',
  'geel',
  'roze',
  'koraal',
  'roest',
  'terracotta',
  'mosterd',
  'cognac',
  'camel',
  'bruin',
  'crème',
  'creme',
  'aardetinten',
]);

// Deep, desaturated tones that read as formal/zakelijk neutrals rather than
// warm accents — treat as neutral for temperature matching so they don't get
// a mismatch penalty against cool/neutral palettes.
const DEEP_NEUTRAL_COLORS = new Set([
  'bordeaux',
  'burgundy',
  'wijn',
]);

const COOL_COLORS = new Set([
  'blauw',
  'navy',
  'groen',
  'teal',
  'kobalt',
  'mint',
  'sage',
  'olijf',
  'paars',
  'lavendel',
]);

const NEUTRAL_COLORS = new Set([
  'zwart',
  'wit',
  'grijs',
  'charcoal',
  'beige',
  'taupe',
  'khaki',
  'monochrome',
  'denim',
]);

const LIGHT_COLORS = new Set([
  'wit',
  'crème',
  'creme',
  'beige',
  'lichtgrijs',
  'licht',
  'zand',
  'roze',
  'mint',
  'lavendel',
  'koraal',
]);

const DARK_COLORS = new Set([
  'zwart',
  'charcoal',
  'antraciet',
  'navy',
  'donkerblauw',
  'bordeaux',
  'bruin',
  'aubergine',
  'chocolate',
  'forest',
]);

const SEASON_PALETTE: Record<string, string[]> = {
  lente: ['crème', 'creme', 'koraal', 'mint', 'camel', 'ivoor', 'zacht'],
  zomer: ['lavendel', 'roze', 'lichtblauw', 'mint', 'grijs', 'rose'],
  herfst: ['camel', 'cognac', 'mosterd', 'roest', 'olijf', 'bruin', 'wijn', 'aardetinten'],
  winter: ['zwart', 'wit', 'navy', 'rood', 'kobalt', 'bordeaux', 'monochrome'],
};

function colorTemperature(tag: string): TemperatureKey {
  const key = tag.toLowerCase();
  if (DEEP_NEUTRAL_COLORS.has(key)) return 'neutraal';
  if (WARM_COLORS.has(key)) return 'warm';
  if (COOL_COLORS.has(key)) return 'koel';
  return 'neutraal';
}

function bestColorTemperature(tags: string[]): TemperatureKey {
  let warm = 0;
  let cool = 0;
  let neutral = 0;
  for (const tag of tags) {
    const t = colorTemperature(tag);
    if (t === 'warm') warm++;
    else if (t === 'koel') cool++;
    else neutral++;
  }
  if (warm > cool && warm > neutral) return 'warm';
  if (cool > warm && cool > neutral) return 'koel';
  return 'neutraal';
}

function valueOfColor(tag: string): 'licht' | 'donker' | 'medium' {
  const key = tag.toLowerCase();
  if (LIGHT_COLORS.has(key)) return 'licht';
  if (DARK_COLORS.has(key)) return 'donker';
  return 'medium';
}

function bestColorValue(tags: string[]): 'licht' | 'medium' | 'donker' {
  let light = 0;
  let dark = 0;
  let medium = 0;
  for (const tag of tags) {
    const v = valueOfColor(tag);
    if (v === 'licht') light++;
    else if (v === 'donker') dark++;
    else medium++;
  }
  if (light > dark && light > medium) return 'licht';
  if (dark > light && dark > medium) return 'donker';
  return 'medium';
}

export function scoreColor(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  const tags = product.colorTags.length > 0
    ? product.colorTags
    : (product.product.colors ?? []).map((c) => c.toLowerCase());

  if (tags.length === 0) return { score: 0.5, reason: 'no_color_data' };

  const hasAllNeutral = tags.every((t) => {
    const k = t.toLowerCase();
    return NEUTRAL_COLORS.has(k) || DEEP_NEUTRAL_COLORS.has(k);
  });
  let temperatureScore = 0.7;
  if (profile.color.temperature) {
    if (hasAllNeutral) temperatureScore = 0.85;
    else {
      const productTemp = bestColorTemperature(tags);
      if (productTemp === profile.color.temperature) {
        temperatureScore = 1.0;
      } else {
        // Soften mismatch when product carries a cool/neutral anchor (e.g. navy + bordeaux)
        const hasProfileTemp = tags.some((t) => colorTemperature(t) === profile.color.temperature);
        const hasNeutralAnchor = tags.some((t) => {
          const k = t.toLowerCase();
          return NEUTRAL_COLORS.has(k) || DEEP_NEUTRAL_COLORS.has(k);
        });
        if (hasProfileTemp) temperatureScore = 0.75;
        else if (hasNeutralAnchor) temperatureScore = 0.55;
        else temperatureScore = 0.3;
      }
    }
  }

  let valueScore = 0.7;
  if (profile.color.value) {
    const productValue = bestColorValue(tags);
    if (productValue === profile.color.value) valueScore = 1.0;
    else if (
      (productValue === 'medium' && profile.color.value !== 'medium') ||
      (profile.color.value === 'medium' && productValue !== 'medium')
    ) {
      valueScore = 0.7;
    } else {
      valueScore = 0.35;
    }
  }

  let seasonScore = 0.7;
  if (profile.color.season) {
    const palette = SEASON_PALETTE[profile.color.season] ?? [];
    const hits = tags.filter((t) =>
      palette.some((p) => t.includes(p) || p.includes(t))
    ).length;
    if (palette.length === 0) seasonScore = 0.7;
    else if (hits > 0) seasonScore = Math.min(1, 0.7 + hits * 0.15);
    else if (hasAllNeutral) seasonScore = 0.75;
    else seasonScore = 0.4;
  }

  let avoidPenalty = 0;
  if (profile.color.avoidColors.length > 0) {
    const avoidSet = new Set(
      profile.color.avoidColors.map((c) => c.toLowerCase())
    );
    for (const tag of tags) {
      if (avoidSet.has(tag)) avoidPenalty = Math.max(avoidPenalty, 0.3);
    }
  }

  let preferredBonus = 0;
  if (profile.color.preferredColors.length > 0) {
    const prefSet = new Set(
      profile.color.preferredColors.map((c) => c.toLowerCase())
    );
    for (const tag of tags) {
      if (prefSet.has(tag)) preferredBonus = Math.max(preferredBonus, 0.15);
    }
  }

  const combined = Math.max(
    0,
    Math.min(
      1,
      temperatureScore * 0.4 +
        valueScore * 0.25 +
        seasonScore * 0.35 +
        preferredBonus -
        avoidPenalty
    )
  );

  const reason =
    combined > 0.8
      ? 'color_strong_match'
      : combined > 0.55
      ? 'color_ok'
      : 'color_weak';

  return { score: combined, reason };
}
