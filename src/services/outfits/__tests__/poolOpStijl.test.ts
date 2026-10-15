import { describe, expect, it } from 'vitest';
import { naarAssen, naarKandidatenParams } from '../kandidaten';

describe('de pool kiest op stijl', () => {
  it('vertaalt pasvorm en prints naar assen met zekerheid 1, en laat de kleurvoorkeur aan de engine', () => {
    // Lucs quiz van 13 oktober 2026. Met warm en licht erbij werd elke outfit beige.
    expect(naarAssen({ fit: 'regular', prints: 'effen', neutrals: 'warm', lightness: 'licht' })).toEqual({
      silhouette: { value: 'regular', confidence: 1 },
      pattern: { value: 'effen', confidence: 1 },
    });
  });

  it('laat weg wat geen as is of niet is ingevuld', () => {
    expect(naarAssen({ prints: 'gemengd', fit: 'onbekend' })).toEqual({});
    expect(naarAssen({})).toEqual({});
    expect(naarAssen({ fit: ['oversized'] })).toEqual({ silhouette: { value: 'oversized', confidence: 1 } });
  });

  it('stuurt de assen mee naar get_kandidaten, en geen likes', () => {
    const p = naarKandidatenParams({ gender: 'male', fit: 'slim' });
    expect(p.p_axes).toEqual({ silhouette: { value: 'slim', confidence: 1 } });
    // Met likes liep get_kandidaten gemeten 4 van 4 keer in de timeout.
    expect(p.p_liked_ids).toEqual([]);
  });
});
