/**
 * Van oordelen in de kalibratiestap naar product-ID's voor get_kandidaten
 * (src/services/calibration/kalibratieBeoordelingen.ts).
 */
import { describe, expect, it } from 'vitest';
import type { CalibrationOutfit, CalibrationOutfitItem } from '@/services/visualPreferences/calibrationService';
import { beoordelingenUitKalibratie } from '../kalibratieBeoordelingen';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const stuk = (n: number): CalibrationOutfitItem => ({ id: id(n), name: `stuk ${n}`, brand: 'x', price: 10, image_url: '' });

function outfit(naam: string, items: CalibrationOutfit['items']): CalibrationOutfit {
  return { id: naam, items, archetypes: {} as CalibrationOutfit['archetypes'], dominantColors: [], occasion: 'casual', explanation: '' };
}

describe('beoordelingenUitKalibratie', () => {
  const outfits = [
    outfit('a', { top: stuk(1), bottom: stuk(2), shoes: stuk(3), outerwear: stuk(4) }),
    outfit('b', { top: stuk(5), bottom: stuk(6), shoes: stuk(7), accessory: stuk(8) }),
    outfit('c', { top: stuk(9), bottom: stuk(10), shoes: stuk(11) }),
  ];

  it('spot on wordt like, niet mijn stijl wordt afwijzing, twijfel telt niet', () => {
    expect(beoordelingenUitKalibratie(outfits, { a: 'spot_on', b: 'not_for_me', c: 'maybe' })).toEqual({
      liked: [id(1), id(2), id(3), id(4)],
      disliked: [id(5), id(6), id(7), id(8)],
    });
  });

  it('een outfit zonder oordeel telt niet mee', () => {
    expect(beoordelingenUitKalibratie(outfits, { c: 'spot_on' })).toEqual({ liked: [id(9), id(10), id(11)], disliked: [] });
    expect(beoordelingenUitKalibratie(outfits, {})).toEqual({ liked: [], disliked: [] });
  });

  it('een stuk in een gelikete en een afgewezen outfit telt alleen als like', () => {
    const samen = [outfit('a', { top: stuk(1), bottom: stuk(2) }), outfit('b', { top: stuk(1), bottom: stuk(3) })];
    expect(beoordelingenUitKalibratie(samen, { a: 'spot_on', b: 'not_for_me' })).toEqual({
      liked: [id(1), id(2)],
      disliked: [id(3)],
    });
  });

  it('laat een ID die geen UUID is weg, want een uuid[] met een woord erin laat de RPC falen', () => {
    const vreemd = [outfit('a', { top: { ...stuk(1), id: 'demo-top-1' }, bottom: stuk(2) })];
    expect(beoordelingenUitKalibratie(vreemd, { a: 'spot_on' })).toEqual({ liked: [id(2)], disliked: [] });
  });
});
