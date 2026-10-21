import { GEWICHTEN, LOOKS, RONDES, type Look } from "@/data/dezeOfDeze";
import type { SwipePattern } from "./swipeAnalyzer";

/** De look links (0) of rechts (1), of null voor "geen van beide". */
export type Keuze = 0 | 1 | null;

export type QuizGeslacht = "male" | "female" | "non-binary" | "prefer-not-to-say" | undefined;

/**
 * De zeven paren voor dit geslacht. Zonder vrouw of man wisselt het per ronde:
 * de even rondes uit de dameslooks, de oneven uit de herenlooks. Beide reeksen
 * volgen hetzelfde schema, dus elk archetype komt nog steeds twee keer voor.
 */
export function rondesVoor(geslacht: QuizGeslacht): Array<[Look, Look]> {
  return RONDES.female.map((_, i) => {
    const reeks = geslacht === "male" || geslacht === "female" ? geslacht : i % 2 === 0 ? "female" : "male";
    const [links, rechts] = RONDES[reeks][i];
    return [LOOKS[links], LOOKS[rechts]];
  });
}

/**
 * Elke ronde beoordeelt twee beelden, ook bij "geen van beide". De engine
 * rekent de zekerheid van de stijlvoorkeur uit dit aantal (buildMoodboard:
 * vol vanaf 15), dus zeven rondes tellen als veertien beoordelingen.
 */
export function aantalBeoordeeld(keuzes: Keuze[]): number {
  return keuzes.length * 2;
}

/**
 * Hetzelfde patroon dat de SwipeAnalyzer uit swipes maakte: de gekozen look
 * telt als like, de andere niet. De gewichten zijn de som over de gekozen
 * looks; de engine normaliseert ze zelf (moodboardToArchetypes). Kleuren en
 * stijltags blijven leeg: die kwamen uit de moodfoto's, en de looks zeggen
 * niets over iemands kleuren.
 */
export function patroonUitKeuzes(rondes: Array<[Look, Look]>, keuzes: Keuze[]): SwipePattern {
  const gekozen = keuzes.flatMap((k, i) => (k === null || !rondes[i] ? [] : [rondes[i][k]]));
  const archetypeWeights: Record<string, number> = {};
  for (const look of gekozen) {
    for (const [archetype, gewicht] of Object.entries(GEWICHTEN[look.archetype])) {
      archetypeWeights[archetype] = Math.round(((archetypeWeights[archetype] ?? 0) + gewicht) * 100) / 100;
    }
  }
  const topArchetypes = Object.entries(archetypeWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([archetype]) => archetype);
  const beoordeeld = aantalBeoordeeld(keuzes);
  return {
    dominantColors: [],
    preferredStyles: [],
    avgResponseTime: 0,
    confidence: Math.min(beoordeeld / 10, 1),
    likeRate: beoordeeld === 0 ? 0 : gekozen.length / beoordeeld,
    archetypeWeights,
    topArchetypes,
  };
}
