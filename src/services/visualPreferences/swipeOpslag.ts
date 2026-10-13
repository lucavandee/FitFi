import type { SwipePattern } from './swipeAnalyzer';

/** De sleutels die buildMoodboard (engine v2) uit localStorage leest. */
export const SWIPE_SLEUTELS = {
  aantal: 'ff_swipe_count',
  patroon: 'ff_swipe_pattern',
  stijl: 'ff_visual_embedding',
} as const;

type Opslag = Pick<Storage, 'setItem' | 'removeItem'>;

/**
 * Bewaart de uitkomst van de swipestap zo dat de engine hem leest.
 *
 * buildMoodboard haalt de stijlgewichten uit ff_visual_embedding. Tot 13
 * oktober 2026 schreef alleen OnboardingFlowPage die sleutel, na de RPC
 * compute_visual_preference_embedding, en die functie bestaat niet in de
 * database. De fout werd stil afgevangen. De swipes hadden daardoor geen
 * invloed op de stijl: met de gewichten erbij verschuift voor een
 * minimalistisch mannenprofiel 16 tot 18 van de 24 items in de outfits.
 *
 * De gewichten staan al in het patroon van de SwipeAnalyzer (de som van
 * archetype_weights over de gelikete foto's); hier worden ze bewaard. Zonder
 * likes gaat de sleutel weg, anders telt de uitkomst van een eerdere quiz op
 * dit apparaat mee.
 */
export function bewaarSwipeUitkomst(opslag: Opslag, aantal: number, patroon: SwipePattern): void {
  opslag.setItem(SWIPE_SLEUTELS.aantal, String(aantal));
  opslag.setItem(
    SWIPE_SLEUTELS.patroon,
    JSON.stringify({
      likeRate: patroon.likeRate,
      dominantColors: patroon.dominantColors,
      preferredStyles: patroon.preferredStyles,
      topArchetypes: patroon.topArchetypes,
      confidence: patroon.confidence,
    })
  );
  const gewichten = patroon.archetypeWeights ?? {};
  if (Object.values(gewichten).some((w) => w > 0)) {
    opslag.setItem(SWIPE_SLEUTELS.stijl, JSON.stringify(gewichten));
  } else {
    opslag.removeItem(SWIPE_SLEUTELS.stijl);
  }
}
