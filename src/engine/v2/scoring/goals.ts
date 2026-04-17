import type { ScoredProduct, UserStyleProfile, GoalKey } from '../types';

const GOAL_POSITIVE_SIGNALS: Record<GoalKey, string[]> = {
  timeless: ['classic', 'klassiek', 'tijdloos', 'tailored', 'clean', 'oxford', 'loafer', 'trench'],
  trendy: ['statement', 'bold', 'oversized', 'cropped', 'asym', 'printed', 'trend'],
  minimal: ['minimal', 'clean', 'effen', 'basic', 'monochrome', 'slim'],
  express: ['statement', 'bold', 'print', 'graphic', 'colour', 'kleurrijk', 'creative', 'avant'],
  professional: ['tailored', 'blazer', 'pak', 'suit', 'overhemd', 'dress shirt', 'oxford', 'pantalon'],
  comfort: ['relaxed', 'soft', 'comfort', 'jersey', 'fleece', 'stretch', 'loose', 'wide'],
};

const GOAL_FORMALITY_TARGET: Partial<Record<GoalKey, [number, number]>> = {
  timeless: [0.45, 0.75],
  trendy: [0.2, 0.65],
  minimal: [0.35, 0.7],
  express: [0.2, 0.6],
  professional: [0.6, 0.9],
  comfort: [0.15, 0.5],
};

export function scoreGoals(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  if (profile.goals.length === 0) return { score: 0.6, reason: 'no_goals' };

  const text = [
    product.product.name ?? '',
    product.product.description ?? '',
    ...(product.product.tags ?? []),
    ...(product.product.styleTags ?? []),
    ...product.silhouetteTags,
    ...product.materialTags,
  ]
    .join(' ')
    .toLowerCase();

  let signalScore = 0;
  let formalityScore = 0;
  let matched = 0;

  for (const goal of profile.goals.slice(0, 3)) {
    const markers = GOAL_POSITIVE_SIGNALS[goal] ?? [];
    const hits = markers.filter((m) => text.includes(m)).length;
    if (hits > 0) signalScore += Math.min(1, hits / 2);

    const range = GOAL_FORMALITY_TARGET[goal];
    if (range) {
      const [lo, hi] = range;
      if (product.formality >= lo && product.formality <= hi) formalityScore += 1;
      else {
        const distance = Math.min(
          Math.abs(product.formality - lo),
          Math.abs(product.formality - hi)
        );
        formalityScore += Math.max(0, 1 - distance * 2);
      }
    }
    matched++;
  }

  if (matched === 0) return { score: 0.6, reason: 'goals_no_match' };

  const avgSignal = signalScore / matched;
  const avgFormality = formalityScore / matched;
  const combined = 0.5 + avgSignal * 0.3 + avgFormality * 0.2;
  const clamped = Math.max(0, Math.min(1, combined));
  return {
    score: clamped,
    reason: clamped > 0.8 ? 'goals_strong' : clamped > 0.6 ? 'goals_ok' : 'goals_weak',
  };
}
