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

  /*
   * Keten-kritiek 16 oktober 2026. Lucs quiz (alleen streetwear) kreeg 40
   * schoenen die op product-ID gekozen waren: pumps, slingbacks, hakken en
   * laarzen, geen sneaker. get_kandidaten kan al op schoentype scoren; de app
   * stuurde het niet mee. Alleen als alle gekozen stijlen hetzelfde schoentype
   * vragen, anders zou een tweede stijl (klassiek) zijn schoenen verliezen.
   */
  it('vraagt sneakers bij streetwear of sportief', () => {
    expect(naarAssen({ stylePreferences: ['streetwear'] }).shoe_type).toEqual({ value: 'sneaker', confidence: 1 });
    expect(naarAssen({ stylePreferences: ['athletic'] }).shoe_type).toEqual({ value: 'sneaker', confidence: 1 });
    expect(naarAssen({ stylePreferences: ['streetwear', 'athletic'] }).shoe_type).toEqual({ value: 'sneaker', confidence: 1 });
  });

  it('vraagt geen schoentype als de stijlen het oneens zijn of er geen keuze is', () => {
    expect(naarAssen({ stylePreferences: ['streetwear', 'classic'] }).shoe_type).toBeUndefined();
    expect(naarAssen({ stylePreferences: ['minimalist'] }).shoe_type).toBeUndefined();
    expect(naarAssen({ stylePreferences: [] }).shoe_type).toBeUndefined();
    expect(naarAssen({}).shoe_type).toBeUndefined();
  });

  it('stuurt de assen mee naar get_kandidaten, en geen likes', () => {
    const p = naarKandidatenParams({ gender: 'male', fit: 'slim' });
    expect(p.p_axes).toEqual({ silhouette: { value: 'slim', confidence: 1 } });
    // Met likes liep get_kandidaten gemeten 4 van 4 keer in de timeout.
    expect(p.p_liked_ids).toEqual([]);
  });
});
