import { describe, expect, it } from 'vitest';
import { VEREIST_AANTAL_OUTFITS, toetsKandidatenpool, valideerSet, vindDubbeleProductIds } from '../valideer-set.ts';
import type { Categorie, Gelegenheid, Kandidaat, ProductAttrs, RuwProduct, StylistOutfit } from '../keten-types.ts';

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

function attrs(category: Categorie): ProductAttrs {
  return {
    category,
    classifier_version: 'test',
    formality: 3,
    occasions: ['casual'],
    silhouette: 'regular',
    color_temp: 'neutraal',
    lightness: 'medium',
    pattern: 'effen',
    shoe_type: category === 'footwear' ? 'sneaker' : null,
    colors: ['zwart'],
    materials: ['katoen'],
    seasons: ['lente'],
  };
}

function product(id: string): RuwProduct {
  return {
    id,
    name: `Product ${id}`,
    brand: 'Merk',
    price: 60,
    image_url: null,
    retailer: 'test',
    url: null,
    affiliate_url: null,
    product_url: null,
    gender: 'unisex',
    colors: ['zwart'],
    sizes: ['M'],
    in_stock: true,
    description: null,
  };
}

/** Bouwt `aantal` unieke kandidaten in een categorie, id's genummerd `${categorie}${i}`. */
function kandidaten(categorie: Categorie, aantal: number): Kandidaat[] {
  return Array.from({ length: aantal }, (_, i) => {
    const id = `${categorie}${i}`;
    return { product_id: id, category: categorie, score: 0.5, attrs: attrs(categorie), product: product(id) };
  });
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

describe('vindDubbeleProductIds (fixronde 1, eis 2)', () => {
  it('geeft een lege lijst als geen enkel product dubbel voorkomt', () => {
    expect(vindDubbeleProductIds(zesGeldigeOutfits())).toEqual([]);
  });

  it('vindt een product dat in twee outfits voorkomt', () => {
    const outfits = zesGeldigeOutfits();
    outfits[3] = outfit('work', ['top0', 'bottom3', 'schoen3']);
    expect(vindDubbeleProductIds(outfits)).toEqual(['top0']);
  });

  it('geeft elke dubbele id maar een keer terug, ook als hij drie keer voorkomt', () => {
    const outfits = zesGeldigeOutfits();
    outfits[2] = outfit('work', ['top0', 'bottom2', 'schoen2']);
    outfits[4] = outfit('work', ['top0', 'bottom4', 'schoen4']);
    expect(vindDubbeleProductIds(outfits)).toEqual(['top0']);
  });

  it('vindt meerdere onafhankelijke dubbele ids', () => {
    const outfits = zesGeldigeOutfits();
    outfits[3] = outfit('work', ['top0', 'bottom3', 'schoen3']);
    outfits[5] = outfit('work', ['top5', 'bottom0', 'schoen5']);
    expect(vindDubbeleProductIds(outfits).sort()).toEqual(['bottom0', 'top0']);
  });
});

describe('toetsKandidatenpool (fixronde 1, eis 1)', () => {
  it('is voldoende met een ruime pool (case "vrouw minimalistisch", gemeten 27 sept 2026)', () => {
    const pool = [
      ...kandidaten('dress', 229),
      ...kandidaten('outerwear', 154),
      ...kandidaten('footwear', 134),
      ...kandidaten('top', 115),
      ...kandidaten('bottom', 106),
      ...kandidaten('accessory', 14),
    ];
    expect(toetsKandidatenpool(pool)).toEqual({ voldoende: true });
  });

  it('is onvoldoende bij te weinig footwear (case "man klassiek", gemeten 27 sept 2026)', () => {
    const pool = [
      ...kandidaten('accessory', 1),
      ...kandidaten('bottom', 3),
      ...kandidaten('footwear', 2),
      ...kandidaten('outerwear', 12),
      ...kandidaten('top', 4),
    ];
    const resultaat = toetsKandidatenpool(pool);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('footwear');
  });

  it('is precies op de grens voldoende met exact zes footwear en genoeg top/bottom', () => {
    const pool = [...kandidaten('footwear', 6), ...kandidaten('top', 6), ...kandidaten('bottom', 6)];
    expect(toetsKandidatenpool(pool)).toEqual({ voldoende: true });
  });

  it('is onvoldoende met vijf footwear, ook als top/bottom/dress ruim voldoende zijn', () => {
    const pool = [
      ...kandidaten('footwear', 5),
      ...kandidaten('top', 20),
      ...kandidaten('bottom', 20),
      ...kandidaten('dress', 20),
    ];
    expect(toetsKandidatenpool(pool).voldoende).toBe(false);
  });

  it('telt dress en top+bottom als alternatieve routes: genoeg dress compenseert weinig top/bottom', () => {
    // isCompleet staat dress+footwear toe zonder top/bottom: 6 dress + 6 footwear is genoeg,
    // ook al zijn er maar 1 top en 1 bottom (die zouden hoogstens 1 top+bottom-outfit dragen).
    const pool = [...kandidaten('footwear', 6), ...kandidaten('dress', 6), ...kandidaten('top', 1), ...kandidaten('bottom', 1)];
    expect(toetsKandidatenpool(pool)).toEqual({ voldoende: true });
  });

  it('is onvoldoende als dress + min(top, bottom) net onder zes blijft', () => {
    // 2 dress + min(2 top, 5 bottom) = 2 + 2 = 4, minder dan 6.
    const pool = [
      ...kandidaten('footwear', 6),
      ...kandidaten('dress', 2),
      ...kandidaten('top', 2),
      ...kandidaten('bottom', 5),
    ];
    const resultaat = toetsKandidatenpool(pool);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('top/bottom/dress');
  });

  it('een lege pool is onvoldoende (faalt op footwear, niet op een lege-array-crash)', () => {
    const resultaat = toetsKandidatenpool([]);
    expect(resultaat.voldoende).toBe(false);
  });
});
