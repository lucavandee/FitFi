import { describe, expect, it } from 'vitest';
import { VEREIST_AANTAL_OUTFITS, valideerSet } from '../valideer-set.ts';
import type { Gelegenheid, StylistOutfit } from '../keten-types.ts';

function outfit(occasion: Gelegenheid, productIds: string[]): StylistOutfit {
  return {
    title: 'Titel',
    occasion,
    items: productIds.map((id, i) => ({ product_id: id, role: i === 0 ? 'top' : i === 1 ? 'bottom' : 'footwear' })),
    reason: 'Omdat het bij je past.',
  };
}

/** Zes geldige outfits, allemaal 'work', geen enkel product dubbel. */
function zesGeldigeOutfits(): StylistOutfit[] {
  return Array.from({ length: 6 }, (_, i) => outfit('work', [`top${i}`, `bottom${i}`, `schoen${i}`]));
}

describe('valideerSet', () => {
  describe('regel 1: precies zes outfits', () => {
    it('is geldig bij exact zes outfits zonder overige overtredingen', () => {
      const resultaat = valideerSet(zesGeldigeOutfits(), { occasions: ['work'] });
      expect(resultaat.geldig).toBe(true);
      expect(resultaat.fouten).toEqual([]);
    });

    it('keurt vijf outfits af', () => {
      const resultaat = valideerSet(zesGeldigeOutfits().slice(0, 5), { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten).toContain('verwacht precies 6 outfits, kreeg 5');
    });

    it('keurt zeven outfits af', () => {
      const zeven = [...zesGeldigeOutfits(), outfit('work', ['top-extra', 'bottom-extra', 'schoen-extra'])];
      const resultaat = valideerSet(zeven, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten).toContain('verwacht precies 6 outfits, kreeg 7');
    });

    it('gebruikt VEREIST_AANTAL_OUTFITS als de norm (geen losse magic number)', () => {
      expect(VEREIST_AANTAL_OUTFITS).toBe(6);
    });
  });

  describe('regel 2: elke gevraagde gelegenheid minstens een keer', () => {
    it('is geldig als elke gevraagde gelegenheid voorkomt', () => {
      const outfits = [
        outfit('work', ['t1', 'b1', 's1']),
        outfit('work', ['t2', 'b2', 's2']),
        outfit('date', ['t3', 'b3', 's3']),
        outfit('date', ['t4', 'b4', 's4']),
        outfit('casual', ['t5', 'b5', 's5']),
        outfit('casual', ['t6', 'b6', 's6']),
      ];
      const resultaat = valideerSet(outfits, { occasions: ['work', 'date', 'casual'] });
      expect(resultaat.geldig).toBe(true);
    });

    it('keurt af als een gevraagde gelegenheid ontbreekt', () => {
      const outfits = zesGeldigeOutfits(); // allemaal 'work'
      const resultaat = valideerSet(outfits, { occasions: ['work', 'date'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('date'))).toBe(true);
    });

    it('randgeval: nul gevraagde gelegenheden laat de regel vervallen', () => {
      const outfits = zesGeldigeOutfits(); // allemaal 'work', profiel vraagt niets
      const resultaat = valideerSet(outfits, { occasions: [] });
      expect(resultaat.geldig).toBe(true);
    });

    it('randgeval: meer dan zes gevraagde gelegenheden valt terug op "minstens zes verschillende gedekt"', () => {
      const zevenGelegenheden: Gelegenheid[] = ['work', 'casual', 'formal', 'date', 'travel', 'sport', 'party'];
      // Zes outfits, elk een andere gelegenheid: dekt het maximaal haalbare (zes verschillende).
      const outfits: StylistOutfit[] = zevenGelegenheden
        .slice(0, 6)
        .map((g, i) => outfit(g, [`top${i}`, `bottom${i}`, `schoen${i}`]));
      const resultaat = valideerSet(outfits, { occasions: zevenGelegenheden });
      expect(resultaat.geldig).toBe(true);
    });

    it('randgeval: meer dan zes gevraagd, maar minder dan zes verschillende gedekt: ongeldig', () => {
      const zevenGelegenheden: Gelegenheid[] = ['work', 'casual', 'formal', 'date', 'travel', 'sport', 'party'];
      // Zes outfits maar slechts vijf verschillende gelegenheden (twee keer 'work').
      const outfits: StylistOutfit[] = [
        outfit('work', ['t1', 'b1', 's1']),
        outfit('work', ['t2', 'b2', 's2']),
        outfit('casual', ['t3', 'b3', 's3']),
        outfit('formal', ['t4', 'b4', 's4']),
        outfit('date', ['t5', 'b5', 's5']),
        outfit('travel', ['t6', 'b6', 's6']),
      ];
      const resultaat = valideerSet(outfits, { occasions: zevenGelegenheden });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('minstens 6'))).toBe(true);
    });
  });

  describe('regel 3: geen enkel product komt twee keer voor over de hele set', () => {
    it('is geldig als elk product maar in een outfit voorkomt', () => {
      const resultaat = valideerSet(zesGeldigeOutfits(), { occasions: ['work'] });
      expect(resultaat.geldig).toBe(true);
    });

    it('keurt af zodra hetzelfde product in twee andere outfits terugkomt (strenger dan dezelfde itemset)', () => {
      const outfits = zesGeldigeOutfits();
      // outfit 3 hergebruikt de top van outfit 0, verder een compleet andere itemset.
      outfits[3] = outfit('work', ['top0', 'bottom3', 'schoen3']);
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('top0') && f.includes('outfit 0') && f.includes('outfit 3'))).toBe(true);
    });

    it('meldt elke extra keer als een eigen overtreding bij een product dat drie keer voorkomt', () => {
      const outfits = zesGeldigeOutfits();
      outfits[2] = outfit('work', ['top0', 'bottom2', 'schoen2']);
      outfits[4] = outfit('work', ['top0', 'bottom4', 'schoen4']);
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      const meldingenVoorTop0 = resultaat.fouten.filter((f) => f.includes('top0'));
      expect(meldingenVoorTop0).toHaveLength(2);
    });
  });

  it('verzamelt overtredingen van meerdere regels tegelijk, elk met een eigen leesbare reden', () => {
    const vijfOutfitsMetDubbelProduct = [
      outfit('work', ['t1', 'b1', 's1']),
      outfit('work', ['t1', 'b2', 's2']),
      outfit('casual', ['t3', 'b3', 's3']),
      outfit('casual', ['t4', 'b4', 's4']),
      outfit('casual', ['t5', 'b5', 's5']),
    ];
    const resultaat = valideerSet(vijfOutfitsMetDubbelProduct, { occasions: ['work', 'date'] });
    expect(resultaat.geldig).toBe(false);
    expect(resultaat.fouten).toEqual(
      expect.arrayContaining([
        'verwacht precies 6 outfits, kreeg 5',
        expect.stringContaining('date'),
        expect.stringContaining('t1'),
      ])
    );
  });
});
