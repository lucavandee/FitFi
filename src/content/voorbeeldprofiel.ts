/**
 * Het voorbeeldprofiel van de landingspagina.
 *
 * Een vast stel quizantwoorden, een vast swipepatroon en een vaste sessie-id.
 * De kleurpiek, de voorbeeldoutfit, de opname van de quiz en de tests lezen
 * het hier, zodat ze over hetzelfde profiel spreken. Wie hier iets wijzigt,
 * wijzigt het voor allemaal tegelijk.
 *
 * Elke antwoordwaarde is een optie uit src/data/quizSteps.ts.
 * __tests__/voorbeeldprofiel.palet.test.ts toetst dat, en legt vast welk palet
 * het rapport voor dit profiel toont, per codepad.
 */
import type { AnswerMap } from '@/lib/quiz/types';

export interface GeliketeFoto {
  /** mood_photos.id */
  id: number;
  /** Pad in de opslagmap mood-photos, zoals image_url het eindigt. */
  bestand: string;
}

export const VOORBEELDPROFIEL = {
  /**
   * Dezelfde id als de testrun van fase 1 (8 oktober 2026). Engine v2 zaait de
   * kalibratie op de sessie-id (seedVoorSessie in engineV2Calibration.ts), dus
   * met deze id en dit patroon komen dezelfde outfits terug. Het moet een uuid
   * zijn: style_swipes.session_id is een uuid-kolom (zie utils/sessionId.ts).
   */
  sessieId: '7f3c2a10-5b8e-4d21-9a6f-0c1e2d3f4a5b',

  /** Zoals de quiz ze opslaat in ff_quiz_answers. */
  antwoorden: {
    gender: 'female', // stap 1: Dames
    stylePreferences: ['classic', 'minimalist'], // stap 2: Klassiek, Minimalistisch
    neutrals: 'warm', // stap 3: Warme tinten
    lightness: 'medium', // stap 4: Middenweg
    contrast: 'laag', // stap 5: Tonal
    fit: 'regular', // stap 6: Normaal
    occasions: ['work', 'casual'], // stap 7: Werk, Casual
    goals: ['timeless'], // stap 8: Tijdloze garderobe
    prints: 'effen', // stap 9: Effen/Uni
    materials: ['wol', 'katoen'], // stap 10: Wol, Katoen
    // Stap 11 (merken) overgeslagen.
    budget: { min: 0, max: 50 }, // stap 12: tot 50 euro per stuk
    budgetRange: 50, // de budgetstap schrijft het maximum ook hier
    // Stap 13 (maten) en 14 (selfie) overgeslagen.
  },

  /**
   * Deze vijf foto's naar rechts, elke andere naar links. Gekozen op de warme
   * tinten in hun dominant_colors (camel, bruin, crème). De stap schudt de
   * foto's per bezoek en vraagt minstens 15 swipes; wie het patroon in de
   * browser naspeelt, swipet door tot alle vijf geliket zijn.
   */
  swipes: {
    geliket: [
      { id: 220, bestand: 'female/classic_female_02.webp' },
      { id: 221, bestand: 'female/classic_female_03.webp' },
      { id: 240, bestand: 'female/classic_female_04.webp' },
      { id: 241, bestand: 'female/classic_female_05.webp' },
      { id: 237, bestand: 'female/minimalist_female_04.webp' },
    ],
  },
} satisfies {
  sessieId: string;
  antwoorden: AnswerMap;
  swipes: { geliket: GeliketeFoto[] };
};
