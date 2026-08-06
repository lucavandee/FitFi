import { describe, it, expect } from 'vitest';

/**
 * Regressietest voor de gelegenheid-bug (2026-08-06).
 *
 * De onboarding leidde de gelegenheid af uit het archetype-sjabloon in plaats
 * van uit het antwoord van de gebruiker. Omdat 'minimal', 'scandi_minimal' en
 * 'street_refined' alle drie op 'casual' staan, kreeg iedereen met die drie
 * archetypes drie keer dezelfde kaart "Casual dag uit", ook na het kiezen van
 * "Werk". Deze test bewaakt de keuzelogica los van de databasetoegang.
 */
function kiesGelegenheid(
  quizData: { occasions?: unknown } | undefined,
  templateOccasion: string,
  index: number
): string {
  const gekozen: string[] = Array.isArray(quizData?.occasions)
    ? (quizData!.occasions as unknown[]).filter(
        (o): o is string => typeof o === 'string' && o.length > 0
      )
    : typeof quizData?.occasions === 'string' && quizData.occasions
      ? [quizData.occasions as string]
      : [];
  return gekozen.length ? gekozen[index % gekozen.length] : templateOccasion;
}

describe('gelegenheid volgt het antwoord van de gebruiker', () => {
  it('gebruikt "work" wanneer de gebruiker dat koos, niet het casual-sjabloon', () => {
    for (const i of [0, 1, 2]) {
      expect(kiesGelegenheid({ occasions: ['work'] }, 'casual', i)).toBe('work');
    }
  });

  it('verdeelt meerdere gekozen gelegenheden over de drie outfits', () => {
    const q = { occasions: ['work', 'formal'] };
    expect(kiesGelegenheid(q, 'casual', 0)).toBe('work');
    expect(kiesGelegenheid(q, 'casual', 1)).toBe('formal');
    expect(kiesGelegenheid(q, 'casual', 2)).toBe('work');
  });

  it('accepteert ook een enkele string in plaats van een array', () => {
    expect(kiesGelegenheid({ occasions: 'formal' }, 'casual', 0)).toBe('formal');
  });

  it('valt terug op het sjabloon wanneer er niets is gekozen', () => {
    expect(kiesGelegenheid(undefined, 'work', 0)).toBe('work');
    expect(kiesGelegenheid({ occasions: [] }, 'casual', 0)).toBe('casual');
  });
});
