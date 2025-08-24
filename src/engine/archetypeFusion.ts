import { ARCHETYPES, type ArchetypeKey } from "@/config/archetypes";
import type {
  ArchetypeWeights,
  ProductLike,
  FusionScoreDetail,
} from "@/types/style";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function normalizeWeights(weights: ArchetypeWeights): ArchetypeWeights {
  const entries = Object.entries(weights ?? {}).filter(([, v]) => (v ?? 0) > 0);
  const sum = entries.reduce((a, [, v]) => a + (v as number), 0);
  if (!sum) return {};
  const normalized: ArchetypeWeights = {};
  for (const [k, v] of entries)
    normalized[k as ArchetypeKey] = (v as number) / sum;
  return normalized;
}

function tokenMatchScore(
  tokens: string[] | undefined,
  needles: string[],
): number {
  if (!tokens?.length) return 0;
  let hits = 0;
  for (const n of needles) if (tokens.includes(n)) hits++;
  return hits / Math.max(needles.length, 1);
}

export function scoreProductAgainstArchetype(
  p: ProductLike,
  key: ArchetypeKey,
): { score: number; signals: string[] } {
  const a = ARCHETYPES[key];
  const colorScore = tokenMatchScore(p.colorTags, a.paletteHints);
  const matScore = tokenMatchScore(p.materialTags, a.materials);
  const silScore = tokenMatchScore(p.silhouetteTags, a.silhouettes);
  const formScore =
    p.formality == null
      ? 0.5
      : 1 - clamp01(Math.abs((p.formality - a.formality) / 100));

  // simpele gewichten per dimensie – later tunen
  const score = clamp01(
    0.35 * colorScore + 0.25 * matScore + 0.25 * silScore + 0.15 * formScore,
  );

  const signals: string[] = [];
  if (colorScore > 0) signals.push("kleur-match");
  if (matScore > 0) signals.push("materiaal-match");
  if (silScore > 0) signals.push("silhouet-match");
  if (formScore > 0.6) signals.push("formaliteit-match");

  return { score, signals };
}

export function fusionScore(
  p: ProductLike,
  mix: ArchetypeWeights,
): FusionScoreDetail {
  const w = normalizeWeights(mix);
  let total = 0;
  const byArchetype: Record<string, number> = {};
  const signals: string[] = [];
  for (const k of Object.keys(w) as ArchetypeKey[]) {
    const { score, signals: ss } = scoreProductAgainstArchetype(p, k);
    const contrib = (w[k] ?? 0) * score;
    byArchetype[k] = contrib;
    total += contrib;
    signals.push(...ss.map((s) => `${ARCHETYPES[k].label}: ${s}`));
  }
  return {
    totalScore: clamp01(total),
    byArchetype,
    matchedSignals: Array.from(new Set(signals)),
  };
}

export function formatBlendString(mix: ArchetypeWeights): string {
  const w = normalizeWeights(mix);
  const pairs = Object.entries(w)
    .sort((a, b) => b[1]! - a[1]!)
    .map(
      ([k, v]) =>
        `${Math.round((v as number) * 100)}% ${ARCHETYPES[k as ArchetypeKey].label}`,
    );
  return pairs.join(" + ");
}
