import { getDutchSeasonName } from "./helpers";
import type { Season } from "./types";

export function titleFrom(
  archetype: string,
  keyItem: string | undefined,
  season: Season | undefined,
) {
  const seasonLabel = season ? getDutchSeasonName(season) : "dit seizoen";
  const item = keyItem ? keyItem : "stijl";
  const arch = archetype.replace("_", " ");
  return `${capitalize(arch)} × ${item} — ${seasonLabel}`;
}

export function descriptionFrom(params: {
  products: { name?: string; brand?: string; category?: string }[];
  archetype: string;
  season?: Season;
  occasion?: string;
  secondary?: string;
}): string {
  const list = params.products
    .map((p) => p?.name || p?.category)
    .filter(Boolean)
    .slice(0, 3);
  const items = list.length ? list.join(", ") : "bijpassende items";
  const season = params.season
    ? getDutchSeasonName(params.season)
    : "het seizoen";
  const occ = params.occasion ? ` — ideaal voor ${params.occasion}` : "";
  const second = params.secondary
    ? ` met een ${params.secondary.replace("_", " ")} twist`
    : "";
  return `Geselecteerd op basis van jouw ${params.archetype.replace("_", " ")} voorkeuren${second}. ${capitalize(items)} afgestemd op ${season}${occ}.`;
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// Legacy exports for backward compatibility
export function generateOutfitTitle(
  primaryArchetype: string,
  occasion: string,
  products: any[],
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
): string {
  const keyItem = products[0]?.name || products[0]?.type;
  const season = products[0]?.season?.[0] as Season | undefined;
  return titleFrom(primaryArchetype, keyItem, season);
}

export function generateOutfitDescription(
  primaryArchetype: string,
  occasion: string,
  products: any[],
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
): string {
  const season = products[0]?.season?.[0] as Season | undefined;
  return descriptionFrom({
    products,
    archetype: primaryArchetype,
    season,
    occasion,
    secondary: secondaryArchetype,
  });
}
