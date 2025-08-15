export type FitfiTier = 'visitor' | 'member' | 'plus' | 'founder';

export const NOVA_ACCESS = {
  limits: {
    visitor: { perDay: 1, perWeek: 1 },
    member:  { perDay: 2, perWeek: 3 },
    plus:    { perDay: 20, perWeek: 140 },
    founder: { perDay: 40, perWeek: 280 },
  },
  modes: {
    visitor:  ['outfits'],
    member:   ['outfits'],
    plus:     ['outfits','archetype','shop'],
    founder:  ['outfits','archetype','shop'],
  }
} as const;