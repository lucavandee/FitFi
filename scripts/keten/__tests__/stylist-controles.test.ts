/**
 * Tests voor de pure controles van het persona-harnas op de stylist-route
 * (spec 5.7, plan 3 taak 8). controleerOutfitSet is een onafhankelijke
 * tweede mening op wat er in de database staat, geen tweede aanroep van
 * valideerSet: een set kan geschreven zijn onder een oudere versie van die
 * regels.
 */
import { describe, expect, it } from 'vitest';
import { controleerOutfitSet, zelfdeOutfits } from '../stylist-controles';
import type { Categorie, Gelegenheid, ProductAttrs, RuwProduct, VerrijkteOutfit } from '../../../src/keten/types';

function attrs(category: Categorie, shoe_type: string | null = null): ProductAttrs {
  return {
    category,
    classifier_version: 't',
    formality: 3,
    occasions: ['work'],
    silhouette: 'regular',
    color_temp: 'neutraal',
    lightness: 'medium',
    pattern: 'effen',
    shoe_type,
    colors: [],
    materials: [],
    seasons: [],
  };
}

function product(id: string, price: number, name = `Product ${id}`): RuwProduct {
  return {
    id, name, brand: null, price, image_url: null, retailer: null, url: null, affiliate_url: null,
    product_url: null, gender: null, colors: null, sizes: null, in_stock: true, description: null,
  };
}

function outfit(
  key: string,
  occasion: Gelegenheid,
  items: Array<[string, Categorie, number, string?, string?]>
): VerrijkteOutfit {
  return {
    outfit_key: key,
    title: key,
    occasion,
    reason: 'Reden.',
    items: items.map(([id, role, price, name, shoe]) => ({
      product_id: id,
      role,
      product: product(id, price, name),
      attrs: attrs(role, shoe ?? null),
    })),
  };
}

const budget = { min: 25, max: 100 };

function zesGoede(): VerrijkteOutfit[] {
  return Array.from({ length: 6 }, (_, i) =>
    outfit(`k${i}`, 'casual', [[`t${i}`, 'top', 50], [`b${i}`, 'bottom', 60], [`f${i}`, 'footwear', 70]])
  );
}

describe('controleerOutfitSet (spec 5.7)', () => {
  it('is leeg bij zes goede outfits', () => {
    expect(controleerOutfitSet(zesGoede(), budget)).toEqual([]);
  });

  it('faalt bij minder dan zes', () => {
    expect(controleerOutfitSet(zesGoede().slice(0, 5), budget)).toContain('5 outfits, verwacht 6');
  });

  it('faalt bij een onvolledige outfit', () => {
    const set = zesGoede();
    set[1] = outfit('k1', 'casual', [['t1', 'top', 50], ['b1', 'bottom', 60]]);
    expect(controleerOutfitSet(set, budget).join('\n')).toContain('outfit 2 (k1) niet compleet');
  });

  it('faalt bij een item buiten budget', () => {
    const set = zesGoede();
    set[2].items[0].product.price = 400;
    expect(controleerOutfitSet(set, budget).join('\n')).toContain('outfit 3 (k2): t2 kost 400');
  });

  it('faalt bij sandalen of zwemkleding bij work', () => {
    const set = zesGoede();
    set[0] = outfit('k0', 'work', [['t0', 'top', 50], ['b0', 'bottom', 60], ['f0', 'footwear', 70, 'Sandaal', 'sandaal']]);
    set[1] = outfit('k1', 'work', [['t1', 'top', 50], ['b1', 'bottom', 60], ['f1', 'footwear', 70], ['a1', 'accessory', 30, 'Zwemtas']]);
    const fouten = controleerOutfitSet(set, budget).join('\n');
    expect(fouten).toContain('outfit 1 (k0): sandaal bij work');
    expect(fouten).toContain('outfit 2 (k1): zwem-item bij work');
  });

  it('faalt bij twee outfits met dezelfde itemset', () => {
    const set = zesGoede();
    set[5] = outfit('anders', 'casual', [['f0', 'footwear', 70], ['t0', 'top', 50], ['b0', 'bottom', 60]]);
    expect(controleerOutfitSet(set, budget).join('\n')).toContain('outfit 6 (anders) heeft dezelfde items als outfit 1');
  });
});

describe('zelfdeOutfits', () => {
  it('vergelijkt de outfit_keys in volgorde', () => {
    expect(zelfdeOutfits(zesGoede(), zesGoede())).toBe(true);
    const b = zesGoede();
    b[3].outfit_key = 'x';
    expect(zelfdeOutfits(zesGoede(), b)).toBe(false);
    expect(zelfdeOutfits(zesGoede(), zesGoede().slice(0, 5))).toBe(false);
  });
});
