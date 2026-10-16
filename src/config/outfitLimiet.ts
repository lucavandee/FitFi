/**
 * Hoeveel outfits een bezoeker krijgt. Eén bron voor /results, het dashboard
 * en alles wat de plannen aanprijst, zodat de belofte en de code gelijk blijven.
 *
 * "member" is een account zonder tier; UserContext zet die nu altijd, dus in
 * de praktijk komt die tak niet voor. Hij blijft zoals de pagina's hem hadden.
 */
export const OUTFIT_LIMIET = {
  gratis: 6,
  member: 9,
  premium: 12,
  founder: 20,
} as const;

type MetTier = { tier?: string | null; isPremium?: boolean | null };

export function outfitLimietVoor(user: MetTier | null | undefined): number {
  if (!user) return OUTFIT_LIMIET.gratis;
  const tier = user.tier || (user.isPremium ? "premium" : "member");
  if (tier === "founder") return OUTFIT_LIMIET.founder;
  if (tier === "premium" || tier === "plus") return OUTFIT_LIMIET.premium;
  if (tier === "member") return OUTFIT_LIMIET.member;
  return OUTFIT_LIMIET.gratis;
}
