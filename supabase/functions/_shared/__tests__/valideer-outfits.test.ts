import { describe, expect, it } from 'vitest';
import { isCompleet, valideerOutfits } from '../valideer-outfits.ts';
import type { Categorie, Kandidaat, ProductAttrs, RuwProduct, StylistOutfit } from '../keten-types.ts';

// Afwijking t.o.v. de plantekst (zie taak-4-brief.md): ProductAttrs heeft
// sinds taak 2 twaalf velden, niet de zestien uit de oude spec. is_fashion,
// gender, price_band, confidence en tagger_version zijn eruit; get_kandidaten
// levert ze nooit (migratie 20260925090000_keten_get_kandidaten_attrs_expliciet.sql).
function attrs(category: Categorie, extra: Partial<ProductAttrs> = {}): ProductAttrs {
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
    ...extra,
  };
}

function product(id: string, price: number): RuwProduct {
  return {
    id,
    name: `Product ${id}`,
    brand: 'Merk',
    price,
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

function kandidaat(id: string, category: Categorie, price = 60, extraAttrs: Partial<ProductAttrs> = {}): Kandidaat {
  return { product_id: id, category, score: 0.5, attrs: attrs(category, extraAttrs), product: product(id, price) };
}

const kandidaten: Kandidaat[] = [
  kandidaat('t1', 'top'),
  kandidaat('t2', 'top'),
  kandidaat('b1', 'bottom'),
  kandidaat('f1', 'footwear'),
  kandidaat('f2', 'footwear'),
  kandidaat('d1', 'dress'),
  kandidaat('o1', 'outerwear'),
  kandidaat('a1', 'accessory'),
  kandidaat('duur', 'top', 400),
  kandidaat('fsandaal', 'footwear', 60, { shoe_type: 'sandaal' }),
];

const profiel = { budget_min: 25, budget_max: 100, disliked_product_ids: ['t2'] };

function outfit(
  items: Array<[string, Categorie]>,
  title = 'Outfit',
  occasion: StylistOutfit['occasion'] = 'casual',
  reason = 'Reden.'
): StylistOutfit {
  return {
    title,
    occasion,
    items: items.map(([product_id, role]) => ({ product_id, role })),
    reason,
  };
}

describe('isCompleet', () => {
  it('accepteert top+bottom+footwear en dress+footwear, met optionele lagen', () => {
    expect(isCompleet(['top', 'bottom', 'footwear'])).toBe(true);
    expect(isCompleet(['top', 'bottom', 'footwear', 'outerwear', 'accessory'])).toBe(true);
    expect(isCompleet(['dress', 'footwear'])).toBe(true);
    expect(isCompleet(['dress', 'footwear', 'outerwear'])).toBe(true);
  });

  it('wijst onvolledige en gemengde structuren af', () => {
    expect(isCompleet(['top', 'bottom'])).toBe(false);
    expect(isCompleet(['dress'])).toBe(false);
    expect(isCompleet(['dress', 'top', 'footwear'])).toBe(false);
    expect(isCompleet(['top', 'top', 'bottom', 'footwear'])).toBe(false);
    expect(isCompleet([])).toBe(false);
  });
});

describe('valideerOutfits (spec 5.4 punt 3)', () => {
  it('laat een correcte outfit door', () => {
    const r = valideerOutfits([outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(1);
    expect(r.fouten).toHaveLength(0);
  });

  it('verwerpt een id dat niet in de kandidaten staat', () => {
    const r = valideerOutfits([outfit([['xx', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('onbekend id xx');
  });

  it('verwerpt een rol die niet bij de categorie van de kandidaat past', () => {
    const r = valideerOutfits([outfit([['b1', 'top'], ['t1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('rol top klopt niet');
  });

  it('verwerpt een onvolledige outfit', () => {
    const r = valideerOutfits([outfit([['t1', 'top'], ['b1', 'bottom']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('niet compleet');
  });

  it('verwerpt een afgewezen item', () => {
    const r = valideerOutfits([outfit([['t2', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('afgewezen item t2');
  });

  it('verwerpt een item buiten budget', () => {
    const r = valideerOutfits([outfit([['duur', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('buiten budget: duur kost 400');
  });

  it('verwerpt de tweede outfit met dezelfde itemset, ongeacht volgorde', () => {
    const a = outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'A');
    const b = outfit([['f1', 'footwear'], ['t1', 'top'], ['b1', 'bottom']], 'B');
    const r = valideerOutfits([a, b], kandidaten, profiel);
    expect(r.geldig.map((o) => o.title)).toEqual(['A']);
    expect(r.fouten[0]).toEqual({ index: 1, reden: 'zelfde itemset als een eerdere outfit' });
  });

  it('bundelt meerdere fouten van een outfit in een regel en houdt de index', () => {
    const goed = outfit([['d1', 'dress'], ['f2', 'footwear']], 'Goed');
    const fout = outfit([['t2', 'top'], ['duur', 'top'], ['f1', 'footwear']], 'Fout');
    const r = valideerOutfits([goed, fout], kandidaten, profiel);
    expect(r.geldig).toHaveLength(1);
    expect(r.fouten).toHaveLength(1);
    expect(r.fouten[0].index).toBe(1);
    expect(r.fouten[0].reden).toContain('afgewezen item t2');
    expect(r.fouten[0].reden).toContain('buiten budget');
    expect(r.fouten[0].reden).toContain('niet compleet');
  });

  it('overleeft onzin als invoer', () => {
    expect(valideerOutfits(null, kandidaten, profiel)).toEqual({ geldig: [], fouten: [] });
    const r = valideerOutfits([{ title: 1, items: 'nee' }], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('geen items');
  });
});

describe('valideerOutfits regel 9 (fix 2, eindreview plan 3): geen sandalen bij work of formal', () => {
  it('verwerpt een sandaal bij occasion work', () => {
    const r = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['fsandaal', 'footwear']], 'Outfit', 'work')],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('sandaal');
    expect(r.fouten[0].reden).toContain('work');
  });

  it('verwerpt een sandaal bij occasion formal', () => {
    const r = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['fsandaal', 'footwear']], 'Outfit', 'formal')],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('sandaal');
  });

  it('laat een sandaal door bij occasion casual (regel 9 geldt alleen voor work/formal)', () => {
    const r = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['fsandaal', 'footwear']], 'Outfit', 'casual')],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(1);
  });

  it('laat gewone footwear (geen sandaal) door bij work', () => {
    const r = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'Outfit', 'work')],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(1);
  });
});

describe('valideerOutfits regel 10 (fix 2, eindreview plan 3): copy-regels op title en reason', () => {
  it('verwerpt een reason met een em-dash', () => {
    const r = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'Outfit', 'casual', 'Dit werkt — echt waar.')],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('em-dash');
  });

  it('verwerpt een reason met het woord "uniek"', () => {
    const r = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'Outfit', 'casual', 'Deze look is echt uniek voor je.')],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('uniek');
  });

  it('verwerpt "authentiek" en "game-changer"', () => {
    const authentiek = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'Outfit', 'casual', 'Een authentiek gevoel.')],
      kandidaten,
      profiel
    );
    expect(authentiek.geldig).toHaveLength(0);
    expect(authentiek.fouten[0].reden).toContain('authentiek');

    const gameChanger = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'Outfit', 'casual', 'Dit is een echte game-changer.')],
      kandidaten,
      profiel
    );
    expect(gameChanger.geldig).toHaveLength(0);
    expect(gameChanger.fouten[0].reden).toContain('game-changer');
  });

  it('verwerpt een superlatief zoals "mooiste"', () => {
    const r = valideerOutfits(
      [outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'Outfit', 'casual', 'De mooiste combinatie voor je.')],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('superlatief');
  });

  it('verwerpt een titel van meer dan zes woorden', () => {
    const r = valideerOutfits(
      [
        outfit(
          [['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']],
          'Dit is een titel met veel te veel woorden erin',
          'casual'
        ),
      ],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('woorden');
  });

  it('verwerpt een outfit zonder title of reason als tekst', () => {
    const kapot = { occasion: 'casual', items: [{ product_id: 't1', role: 'top' }, { product_id: 'b1', role: 'bottom' }, { product_id: 'f1', role: 'footwear' }] };
    const r = valideerOutfits([kapot], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('title of reason');
  });

  it('laat een normale, regelconforme title en reason gewoon door', () => {
    const r = valideerOutfits(
      [
        outfit(
          [['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']],
          'Casual look voor de zaterdag',
          'casual',
          'Je draagt de top los over de broek. De sneaker maakt het af.'
        ),
      ],
      kandidaten,
      profiel
    );
    expect(r.geldig).toHaveLength(1);
    expect(r.fouten).toHaveLength(0);
  });
});
