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

function kandidaat(id: string, category: Categorie, price = 60): Kandidaat {
  return { product_id: id, category, score: 0.5, attrs: attrs(category), product: product(id, price) };
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
];

const profiel = { budget_min: 25, budget_max: 100, disliked_product_ids: ['t2'] };

function outfit(items: Array<[string, Categorie]>, title = 'Outfit'): StylistOutfit {
  return {
    title,
    occasion: 'casual',
    items: items.map(([product_id, role]) => ({ product_id, role })),
    reason: 'Reden.',
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
