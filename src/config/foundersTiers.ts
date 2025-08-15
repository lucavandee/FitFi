export type FounderTier = {
  id: 'seed' | 'alpha' | 'elite' | 'legend';
  name: string;
  threshold: number; // minimum referrals voor deze tier
  gradientClass: string; // bg-gradient utility
  ringClass: string; // ring/tint voor icon/border
  icon: 'Award' | 'Star' | 'Crown' | 'Gift';
};

export const FOUNDERS_TIERS: FounderTier[] = [
  {
    id: 'seed',
    name: 'Seed',
    threshold: 0,
    gradientClass: 'from-gray-200 via-gray-300 to-gray-200',
    ringClass: 'ring-gray-300',
    icon: 'Gift',
  },
  {
    id: 'alpha',
    name: 'Alpha',
    threshold: 3,
    gradientClass: 'from-[#CDEFFF] via-[#A7DFFF] to-[#89CFF0]',
    ringClass: 'ring-[#89CFF0]',
    icon: 'Award',
  },
  {
    id: 'elite',
    name: 'Elite',
    threshold: 10,
    gradientClass: 'from-[#89CFF0] via-[#5FB7E6] to-[#7C8CFB]',
    ringClass: 'ring-[#5FB7E6]',
    icon: 'Star',
  },
  {
    id: 'legend',
    name: 'Legend',
    threshold: 25,
    gradientClass: 'from-[#0D1B2A] via-[#2B3F5C] to-[#89CFF0]',
    ringClass: 'ring-[#0D1B2A]',
    icon: 'Crown',
  },
];

export function resolveTier(count: number) {
  const tiers = [...FOUNDERS_TIERS].sort((a,b) => a.threshold - b.threshold);
  let current = tiers[0];
  for (const t of tiers) if (count >= t.threshold) current = t;
  const idx = tiers.findIndex(t => t.id === current.id);
  const next = tiers[idx + 1] ?? null;
  const nextAt = next?.threshold ?? null;
  // progress 0..1 binnen huidige→volgende
  const base = current.threshold;
  const span = (nextAt ?? base) - base || 1;
  const clamped = Math.max(0, Math.min(1, (count - base) / span));
  return { current, next, progress: clamped, base, nextAt };
}