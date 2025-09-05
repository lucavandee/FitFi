export type FounderTierId = "seed" | "alpha" | "elite" | "legend";

export type FounderTier = {
  id: FounderTierId;
  name: string;
  threshold: number; // minimum referrals voor deze tier
  gradientClass: string; // bg-gradient utility
  ringClass: string; // ring/tint voor icon/border
  icon: "Award" | "Star" | "Crown" | "Gift";
  perks: TierPerk[];
};

export type TierPerk = {
  id: string;
  label: string;
  unlockedAt: number; // vanaf hoeveel referrals zichtbaar als unlocked
  icon?:
    | "Sparkles"
    | "Shield"
    | "Users"
    | "Star"
    | "Crown"
    | "Wand2"
    | "Ticket"
    | "Gift"
    | "Headphones"
    | "Video"
    | "Trophy"
    | "Award";
};

export const FOUNDERS_TIERS: FounderTier[] = [
  {
    id: "seed",
    name: "Seed",
    threshold: 0,
    gradientClass: "from-gray-200 via-gray-300 to-gray-200",
    ringClass: "ring-gray-300",
    icon: "Gift",
    perks: [
      {
        id: "community",
        label: "Early community access",
        unlockedAt: 0,
        icon: "Users",
      },
      {
        id: "profile-badge",
        label: "Founders badge in profiel",
        unlockedAt: 0,
        icon: "Ticket",
      },
    ],
  },
  {
    id: "alpha",
    name: "Alpha",
    threshold: 3,
    gradientClass: "from-[#CDEFFF] via-[#A7DFFF] to-[#89CFF0]",
    ringClass: "ring-[#89CFF0]",
    icon: "Award",
    perks: [
      { id: "alpha-badge", label: "Alpha badge", unlockedAt: 3, icon: "Award" },
      {
        id: "feature-early",
        label: "Vroege toegang: Nova Style Preview",
        unlockedAt: 4,
        icon: "Wand2",
      },
      {
        id: "leaderboard",
        label: "Toegang tot referral leaderboard",
        unlockedAt: 5,
        icon: "Trophy",
      },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    threshold: 10,
    gradientClass: "from-[#89CFF0] via-[#5FB7E6] to-[#7C8CFB]",
    ringClass: "ring-[#5FB7E6]",
    icon: "Star",
    perks: [
      {
        id: "priority",
        label: "Priority support",
        unlockedAt: 10,
        icon: "Shield",
      },
      {
        id: "group-style",
        label: "AI styling sessie (groep)",
        unlockedAt: 12,
        icon: "Headphones",
      },
      {
        id: "frame",
        label: "Limited edition profiel frame",
        unlockedAt: 14,
        icon: "Sparkles",
      },
    ],
  },
  {
    id: "legend",
    name: "Legend",
    threshold: 25,
    gradientClass: "from-[#0D1B2A] via-[#2B3F5C] to-[#89CFF0]",
    ringClass: "ring-[#0D1B2A]",
    icon: "Crown",
    perks: [
      {
        id: "lifetime",
        label: "Lifetime Premium",
        unlockedAt: 25,
        icon: "Crown",
      },
      {
        id: "one-to-one",
        label: "1-op-1 AI-stylist sessie",
        unlockedAt: 30,
        icon: "Video",
      },
      {
        id: "feature-vote",
        label: "Feature voting rights",
        unlockedAt: 35,
        icon: "Star",
      },
      {
        id: "exclusive-drops",
        label: "Exclusieve drops",
        unlockedAt: 40,
        icon: "Gift",
      },
    ],
  },
];

export function resolveTier(count: number) {
  const tiers = [...FOUNDERS_TIERS].sort((a, b) => a.threshold - b.threshold);
  let current = tiers[0];
  for (const t of tiers) if (count >= t.threshold) current = t;
  const idx = tiers.findIndex((t) => t.id === current.id);
  const next = tiers[idx + 1] ?? null;
  const nextAt = next?.threshold ?? null;
  const base = current.threshold;
  const span = (nextAt ?? base) - base || 1;
  const progress = Math.max(0, Math.min(1, (count - base) / span));
  return { current, next, progress, base, nextAt };
}

export function allPerksSorted() {
  return FOUNDERS_TIERS.flatMap((t) =>
    t.perks.map((p) => ({
      ...p,
      tierId: t.id,
      tierName: t.name,
      tierThreshold: t.threshold,
    })),
  ).sort((a, b) => a.unlockedAt - b.unlockedAt);
}
