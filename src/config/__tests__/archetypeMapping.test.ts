/**
 * Elke vorm van het archetype die op 21 oktober 2026 in style_profiles stond,
 * moet naar de juiste sleutel. De resultatenpagina viel bij een onbekende vorm
 * terug op SMART_CASUAL, ook voor "urban" en "minimalistisch".
 */
import { describe, expect, it } from 'vitest';
import { ARCHETYPE_TO_DUTCH, ARCHETYPE_WEERGAVE, archetypeSleutelVan } from '../archetypeMapping';
import { ARCHETYPES } from '../archetypes';

describe('archetypeSleutelVan', () => {
  it.each([
    ['urban', 'STREETWEAR'],
    ['STREETWEAR', 'STREETWEAR'],
    ['MINIMALIST', 'MINIMALIST'],
    ['Smart Casual', 'SMART_CASUAL'],
    ['minimalistisch', 'MINIMALIST'],
    ['SMART_CASUAL', 'SMART_CASUAL'],
    ['CLASSIC', 'CLASSIC'],
    ['klassiek', 'CLASSIC'],
    ['ATHLETIC', 'ATHLETIC'],
    ['zakelijk', 'BUSINESS'],
    ['Avant-Garde', 'AVANT_GARDE'],
    ['  casual_chic ', 'SMART_CASUAL'],
  ])('%s wordt %s', (naam, sleutel) => {
    expect(archetypeSleutelVan(naam)).toBe(sleutel);
  });

  it('elke sleutel, elk Engels label en elke Nederlandse naam komt terug bij zichzelf', () => {
    for (const [sleutel, a] of Object.entries(ARCHETYPES)) {
      expect(archetypeSleutelVan(sleutel)).toBe(sleutel);
      expect(archetypeSleutelVan(a.label)).toBe(sleutel);
      expect(archetypeSleutelVan(ARCHETYPE_TO_DUTCH[a.key])).toBe(sleutel);
      expect(archetypeSleutelVan(ARCHETYPE_WEERGAVE[a.key])).toBe(sleutel);
    }
  });

  it('valt zonder bruikbare naam terug op smart casual', () => {
    expect(archetypeSleutelVan(undefined)).toBe('SMART_CASUAL');
    expect(archetypeSleutelVan('')).toBe('SMART_CASUAL');
    expect(archetypeSleutelVan({ name: 'urban' })).toBe('SMART_CASUAL');
  });
});

describe('de resultatenpagina', () => {
  it('haalt sleutel en weergavenaam uit archetypeMapping, niet uit een eigen lijst', async () => {
    const { readFileSync } = await import('node:fs');
    const bron = readFileSync(new URL('../../pages/EnhancedResultsPage.tsx', import.meta.url), 'utf8');
    expect(bron).toContain('archetypeSleutelVan(archetypeName)');
    expect(bron).toContain('ARCHETYPE_WEERGAVE[archetypeKey]');
    expect(bron).not.toMatch(/nameToKey|'smart casual': 'SMART_CASUAL'/);
  });
});
