import { ARCHETYPES, type ArchetypeKey } from '@/config/archetypes';
import type { ArchetypeWeights, ScoredProduct, UserStyleProfile } from '../types';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function tokenScore(tokens: string[] | undefined, needles: string[]): number {
  if (!tokens || tokens.length === 0 || needles.length === 0) return 0;
  const needleSet = new Set(needles.map((n) => n.toLowerCase()));
  let hits = 0;
  for (const t of tokens) {
    if (needleSet.has(t.toLowerCase())) hits++;
  }
  return Math.min(1, hits / Math.min(2, needles.length));
}

function formalityProximity(
  productFormality: number,
  archetypeFormality: number
): number {
  const normArch =
    archetypeFormality > 1 ? archetypeFormality / 100 : archetypeFormality;
  return 1 - clamp01(Math.abs(productFormality - normArch));
}

export function scoreProductArchetype(
  product: ScoredProduct,
  archetypeKey: ArchetypeKey
): { score: number; signals: string[] } {
  const a = ARCHETYPES[archetypeKey];
  if (!a) return { score: 0, signals: [] };
  const color = tokenScore(product.colorTags, a.paletteHints);
  const material = tokenScore(product.materialTags, a.materials);
  const silhouette = tokenScore(product.silhouetteTags, a.silhouettes);
  const formality = formalityProximity(product.formality, a.formality);

  const score = clamp01(
    0.30 * silhouette + 0.25 * material + 0.20 * color + 0.25 * formality
  );

  const signals: string[] = [];
  if (color > 0.2) signals.push(`${a.label}:kleur`);
  if (material > 0.2) signals.push(`${a.label}:materiaal`);
  if (silhouette > 0.2) signals.push(`${a.label}:silhouet`);
  if (formality > 0.7) signals.push(`${a.label}:formaliteit`);

  return { score, signals };
}

export function scoreArchetypeFit(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string; byArchetype: ArchetypeWeights } {
  const weights = profile.archetypes;
  const keys = Object.keys(weights) as ArchetypeKey[];
  if (keys.length === 0) {
    return { score: 0.5, reason: 'no_archetype_data', byArchetype: {} };
  }

  const byArchetype: ArchetypeWeights = {};
  let total = 0;
  const signals: string[] = [];

  for (const key of keys) {
    const w = weights[key] ?? 0;
    if (w <= 0) continue;
    const { score, signals: sig } = scoreProductArchetype(product, key);
    byArchetype[key] = score;
    total += w * score;
    signals.push(...sig);
  }

  const primaryKey = profile.primaryArchetype;
  const primaryScore = byArchetype[primaryKey] ?? 0;
  if (primaryScore > 0.65) signals.push('primary_strong');
  else if (primaryScore < 0.2) signals.push('primary_weak');

  const reason =
    total > 0.65
      ? `archetype_strong(${Array.from(new Set(signals)).slice(0, 2).join(',') || 'match'})`
      : total > 0.4
      ? 'archetype_ok'
      : 'archetype_weak';

  return { score: clamp01(total), reason, byArchetype };
}
