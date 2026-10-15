import { describe, expect, it } from 'vitest';
import { naarAssen, naarKandidatenParams } from '../kandidaten';
import {
  bewaarKalibratieOordeel,
  leesKalibratieLikes,
  wisKalibratie,
} from '@/services/visualPreferences/kalibratieOpslag';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const C = '33333333-3333-4333-8333-333333333333';

function opslag() {
  const kaart = new Map<string, string>();
  return {
    getItem: (k: string) => kaart.get(k) ?? null,
    setItem: (k: string, v: string) => void kaart.set(k, v),
    removeItem: (k: string) => void kaart.delete(k),
  };
}

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

  it('stuurt de assen en de likes mee naar get_kandidaten', () => {
    const p = naarKandidatenParams({ gender: 'male', fit: 'slim' }, undefined, [A, B, A]);
    expect(p.p_axes).toEqual({ silhouette: { value: 'slim', confidence: 1 } });
    expect(p.p_liked_ids).toEqual([A, B]);
  });

  it('neemt hooguit 50 likes mee, zoals get_kandidaten', () => {
    const veel = Array.from({ length: 60 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`);
    expect(naarKandidatenParams({}, undefined, veel).p_liked_ids).toHaveLength(50);
  });
});

describe('kalibratie-oordelen worden likes', () => {
  it('bewaart de producten van een spot-on-outfit en haalt ze weg bij een ander oordeel', () => {
    const o = opslag();
    bewaarKalibratieOordeel(o, 'outfit-1', [A, B], 'spot_on');
    bewaarKalibratieOordeel(o, 'outfit-2', [C], 'not_for_me');
    expect(leesKalibratieLikes(o).sort()).toEqual([A, B]);
    bewaarKalibratieOordeel(o, 'outfit-1', [A, B], 'maybe');
    expect(leesKalibratieLikes(o)).toEqual([]);
  });

  it('laat geen ID door dat geen uuid is, anders faalt de hele aanroep', () => {
    const o = opslag();
    bewaarKalibratieOordeel(o, 'outfit-1', [A, 'demo-top-1', ''], 'spot_on');
    expect(leesKalibratieLikes(o)).toEqual([A]);
  });

  it('begint een nieuwe kalibratie leeg', () => {
    const o = opslag();
    bewaarKalibratieOordeel(o, 'outfit-1', [A], 'spot_on');
    wisKalibratie(o);
    expect(leesKalibratieLikes(o)).toEqual([]);
  });

  it('overleeft kapotte opslag', () => {
    const o = opslag();
    o.setItem('ff_kalibratie_likes', '{kapot');
    expect(leesKalibratieLikes(o)).toEqual([]);
  });
});
