import type { ScoredProduct, UserStyleProfile } from '../types';

const MATERIAL_ALIAS: Record<string, string[]> = {
  katoen: ['katoen', 'cotton'],
  wol: ['wol', 'wool', 'merino'],
  denim: ['denim', 'jeans'],
  fleece: ['fleece', 'teddy', 'sherpa'],
  tech: ['tech', 'nylon', 'polyester', 'performance'],
  linnen: ['linnen', 'linen'],
  leer: ['leer', 'leather', 'suede', 'suède'],
  kasjmier: ['kasjmier', 'cashmere'],
  viscose: ['viscose', 'rayon', 'modal'],
  zijde: ['zijde', 'silk', 'satijn', 'satin'],
};

function normalizeMaterial(raw: string): string[] {
  const key = raw.toLowerCase().trim();
  return MATERIAL_ALIAS[key] ?? [key];
}

export function scoreMaterial(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  const prefs = profile.materials.preferred;
  if (prefs.length === 0) return { score: 0.6, reason: 'no_material_pref' };

  const productMaterials = new Set<string>([
    ...product.materialTags.map((m) => m.toLowerCase()),
    ...(product.product.materials ?? []).map((m: string) => m.toLowerCase()),
  ]);

  if (productMaterials.size === 0) {
    return { score: 0.55, reason: 'no_material_data' };
  }

  let hits = 0;
  const matched: string[] = [];
  for (const pref of prefs) {
    const aliases = normalizeMaterial(pref);
    if (aliases.some((a) => productMaterials.has(a))) {
      hits++;
      matched.push(pref);
    }
  }

  if (hits === 0) return { score: 0.4, reason: 'material_mismatch' };
  const ratio = Math.min(1, hits / Math.min(prefs.length, 2));
  return {
    score: 0.6 + ratio * 0.4,
    reason: matched.length > 0 ? `material_match(${matched.join(',')})` : 'material_match',
  };
}
