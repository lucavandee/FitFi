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

  describe('regel 3 (fix 3, eindreview plan 3): geen top of dress komt twee keer voor, andere rollen mogen herhalen', () => {
    it('is geldig als elk product maar in een outfit voorkomt', () => {
      const resultaat = valideerSet(zesGeldigeOutfits(), { occasions: ['work'] });
      expect(resultaat.geldig).toBe(true);
    });

    it('keurt af zodra dezelfde top in twee andere outfits terugkomt (strenger dan dezelfde itemset)', () => {
      const outfits = zesGeldigeOutfits();
      // outfit 3 hergebruikt de top van outfit 0, verder een compleet andere itemset.
      outfits[3] = outfit('work', ['top0', 'bottom3', 'schoen3']);
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('top0') && f.includes('outfit 0') && f.includes('outfit 3'))).toBe(true);
    });

    it('meldt elke extra keer als een eigen overtreding bij een top die drie keer voorkomt', () => {
      const outfits = zesGeldigeOutfits();
      outfits[2] = outfit('work', ['top0', 'bottom2', 'schoen2']);
      outfits[4] = outfit('work', ['top0', 'bottom4', 'schoen4']);
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      const meldingenVoorTop0 = resultaat.fouten.filter((f) => f.includes('top0'));
      expect(meldingenVoorTop0).toHaveLength(2);
    });

    it('fix 3: dezelfde bottom in twee outfits is nu toegestaan (alleen top/dress moeten uniek zijn)', () => {
      const outfits = zesGeldigeOutfits();
      // outfit 3 hergebruikt de BOTTOM van outfit 0 (index 1 in de items-array), niet de top.
      outfits[3] = outfit('work', ['top3', 'bottom0', 'schoen3']);
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(true);
    });

    it('fix 3: dezelfde footwear in alle zes outfits is nu toegestaan', () => {
      const outfits = Array.from({ length: 6 }, (_, i) => outfit('work', [`top${i}`, `bottom${i}`, 'schoen-gedeeld']));
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(true);
    });

    it('keurt nog altijd af als dezelfde dress in twee outfits voorkomt', () => {
      const dressOutfit = (occasion: Gelegenheid, dressId: string, schoenId: string): StylistOutfit => ({
        title: 'Titel',
        occasion,
        items: [
          { product_id: dressId, role: 'dress' },
          { product_id: schoenId, role: 'footwear' },
        ],
        reason: 'Omdat het bij je past.',
      });
      const outfits = [
        dressOutfit('work', 'jurk0', 's0'),
        dressOutfit('work', 'jurk0', 's1'),
        dressOutfit('work', 'jurk2', 's2'),
        dressOutfit('work', 'jurk3', 's3'),
        dressOutfit('work', 'jurk4', 's4'),
        dressOutfit('work', 'jurk5', 's5'),
      ];
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('jurk0'))).toBe(true);
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

describe('vindDubbeleProductIds (fixronde 1, eis 2; beperkt tot top/dress sinds fix 3)', () => {
  it('geeft een lege lijst als geen enkel product dubbel voorkomt', () => {
    expect(vindDubbeleProductIds(zesGeldigeOutfits())).toEqual([]);
  });

  it('vindt een top die in twee outfits voorkomt', () => {
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

  it('vindt meerdere onafhankelijke dubbele tops', () => {
    const outfits = zesGeldigeOutfits();
    // outfit 3 hergebruikt de top van outfit 0.
    outfits[3] = outfit('work', ['top0', 'bottom3', 'schoen3']);
    // outfit 4 hergebruikt de top van outfit 1 (top1), onafhankelijk van top0 hierboven.
    outfits[4] = outfit('work', ['top1', 'bottom4', 'schoen4']);
    expect(vindDubbeleProductIds(outfits).sort()).toEqual(['top0', 'top1']);
  });

  it('fix 3: een bottom die in twee outfits voorkomt telt niet mee (alleen top/dress)', () => {
    const outfits = zesGeldigeOutfits();
    outfits[3] = outfit('work', ['top3', 'bottom0', 'schoen3']);
    expect(vindDubbeleProductIds(outfits)).toEqual([]);
  });

  it('fix 3: een footwear die in alle outfits voorkomt telt niet mee', () => {
    const outfits = Array.from({ length: 6 }, (_, i) => outfit('work', [`top${i}`, `bottom${i}`, 'schoen-gedeeld']));
    expect(vindDubbeleProductIds(outfits)).toEqual([]);
  });
});

describe('toetsKandidatenpool (fixronde 1, eis 1; herijkt op fix 3, eindreview plan 3)', () => {
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

  it('case "man klassiek" (gemeten 27 sept 2026): footwear is sinds fix 3 geen probleem meer, maar te weinig unieke tops blijft het wel', () => {
    // Dezelfde pool als de echte run van 27 september. Onder de OUDE regel
    // (elk product uniek) was dit onvoldoende wegens 2 footwear-kandidaten
    // (< 6). Sinds fix 3 mag footwear herhalen (er hoeft er maar 1 te zijn),
    // dus footwear is hier geen probleem meer. De pool blijft niettemin
    // onvoldoende: 0 dress + 4 top (er is een bottom om mee te combineren) =
    // 4, minder dan de 6 benodigde unieke tops/dresses.
    const pool = [
      ...kandidaten('accessory', 1),
      ...kandidaten('bottom', 3),
      ...kandidaten('footwear', 2),
      ...kandidaten('outerwear', 12),
      ...kandidaten('top', 4),
    ];
    const resultaat = toetsKandidatenpool(pool);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('top/dress');
  });

  it('is onvoldoende zonder een enkele footwear-kandidaat, ook als de rest ruim voldoende is', () => {
    const pool = [...kandidaten('top', 20), ...kandidaten('bottom', 20), ...kandidaten('dress', 20)];
    const resultaat = toetsKandidatenpool(pool);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('footwear');
  });

  it('fix 3: EEN footwear-kandidaat is al genoeg (footwear mag herhalen), ook al was dat onder de oude regel (zes nodig) onvoldoende', () => {
    const pool = [...kandidaten('footwear', 1), ...kandidaten('top', 20), ...kandidaten('bottom', 20), ...kandidaten('dress', 20)];
    expect(toetsKandidatenpool(pool)).toEqual({ voldoende: true });
  });

  it('is precies op de grens voldoende met een footwear-kandidaat en genoeg top/bottom', () => {
    const pool = [...kandidaten('footwear', 1), ...kandidaten('top', 6), ...kandidaten('bottom', 6)];
    expect(toetsKandidatenpool(pool)).toEqual({ voldoende: true });
  });

  it('telt dress en top+bottom als alternatieve routes: genoeg dress compenseert weinig top', () => {
    // isCompleet staat dress+footwear toe zonder top/bottom: 6 dress + 1 footwear is genoeg,
    // ook al is er maar 1 top (en 1 bottom, die sinds fix 3 mag herhalen).
    const pool = [...kandidaten('footwear', 1), ...kandidaten('dress', 6), ...kandidaten('top', 1), ...kandidaten('bottom', 1)];
    expect(toetsKandidatenpool(pool)).toEqual({ voldoende: true });
  });

  it('is onvoldoende als dress + top net onder zes blijft', () => {
    // 2 dress + 2 top = 4, minder dan 6. bottom (5, ruim genoeg) telt niet mee: die mag herhalen.
    const pool = [
      ...kandidaten('footwear', 1),
      ...kandidaten('dress', 2),
      ...kandidaten('top', 2),
      ...kandidaten('bottom', 5),
    ];
    const resultaat = toetsKandidatenpool(pool);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('top/dress');
  });

  it('is onvoldoende met genoeg tops maar zonder een enkele bottom om ze mee te combineren', () => {
    // 0 dress + 0 (geen bottom om top+bottom mee te vormen) = 0, minder dan 6, ondanks 20 tops.
    const pool = [...kandidaten('footwear', 1), ...kandidaten('top', 20)];
    const resultaat = toetsKandidatenpool(pool);
    expect(resultaat.voldoende).toBe(false);
  });

  it('een lege pool is onvoldoende (faalt op footwear, niet op een lege-array-crash)', () => {
    const resultaat = toetsKandidatenpool([]);
    expect(resultaat.voldoende).toBe(false);
  });
});
