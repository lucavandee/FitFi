import type { ScoredProduct, UserStyleProfile, FitKey } from '../types';

const FIT_ADJACENCY: Record<FitKey, FitKey[]> = {
  slim: ['regular'],
  regular: ['slim', 'relaxed'],
  relaxed: ['regular', 'oversized'],
  oversized: ['relaxed'],
};

const FIT_SILHOUETTE_MAP: Record<FitKey, string[]> = {
  slim: ['slim', 'tailored'],
  regular: ['straight', 'tailored', 'clean'],
  relaxed: ['relaxed', 'straight'],
  oversized: ['oversized', 'relaxed', 'draped'],
};

export function scoreFit(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  if (!profile.fit) return { score: 0.6, reason: 'no_fit_pref' };
  const tags = product.silhouetteTags.map((t) => t.toLowerCase());
  if (tags.length === 0) return { score: 0.55, reason: 'no_silhouette_data' };

  const exactMatch = FIT_SILHOUETTE_MAP[profile.fit].some((s) =>
    tags.includes(s)
  );
  if (exactMatch) return { score: 1.0, reason: 'fit_exact' };

  const adjacent = FIT_ADJACENCY[profile.fit];
  for (const adj of adjacent) {
    if (FIT_SILHOUETTE_MAP[adj].some((s) => tags.includes(s))) {
      return { score: 0.7, reason: 'fit_adjacent' };
    }
  }

  return { score: 0.3, reason: 'fit_mismatch' };
}
