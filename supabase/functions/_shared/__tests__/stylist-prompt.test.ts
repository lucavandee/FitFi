import { describe, expect, it } from 'vitest';
import {
  STYLIST_VERSION,
  TOOL_NAAM,
  bouwGebruikersPrompt,
  bouwSysteemPrompt,
  bouwToolSchema,
} from '../stylist-prompt.ts';
import { legeAssen, type Kandidaat, type TasteProfileInput } from '../keten-types.ts';

function alleObjectenStrikt(schema: unknown): boolean {
  if (typeof schema !== 'object' || schema === null) return true;
  const s = schema as Record<string, unknown>;
  if (s.type === 'object') {
    if (s.additionalProperties !== false) return false;
    if (!Array.isArray(s.required)) return false;
    const props = (s.properties ?? {}) as Record<string, unknown>;
    const keys = Object.keys(props);
    if (keys.some((k) => !(s.required as string[]).includes(k))) return false;
    return keys.every((k) => alleObjectenStrikt(props[k]));
  }
  if (s.type === 'array') return alleObjectenStrikt(s.items);
  return true;
}

// Afwijking t.o.v. de plantekst (zie taak-5-brief.md): ProductAttrs heeft
// sinds taak 2 twaalf velden, niet de zestien uit de oude spec. is_fashion,
// gender, price_band, confidence en tagger_version zijn eruit, classifier_version
// is erbij gekomen; get_kandidaten levert de oude vijf nooit (migratie
// 20260925090000_keten_get_kandidaten_attrs_expliciet.sql). Zelfde fixtureconventie
// als taak 4 (valideer-outfits.test.ts).
const kandidaat: Kandidaat = {
  product_id: '11111111-1111-1111-1111-111111111111',
  category: 'top',
  score: 0.7,
  attrs: {
    category: 'top',
    classifier_version: 'haiku-4.5-v1',
    formality: 4,
    occasions: ['work'],
    silhouette: 'slim',
    color_temp: 'koel',
    lightness: 'donker',
    pattern: 'effen',
    shoe_type: null,
    colors: ['navy'],
    materials: ['wol'],
    seasons: ['herfst'],
  },
  product: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Wollen overhemd',
    brand: 'Merk A',
    price: 79,
    image_url: null,
    retailer: 'H&M',
    url: null,
    affiliate_url: null,
    product_url: null,
    gender: 'male',
    colors: ['navy'],
    sizes: ['M'],
    in_stock: true,
    description: null,
  },
};

const profiel: TasteProfileInput = {
  user_id: null,
  session_id: 's',
  gender: 'male',
  occasions: ['work', 'date'],
  budget_min: 50,
  budget_max: 150,
  nogo_product_ids: [],
  choices: [],
  axes: { ...legeAssen(), formality: { value: 4, confidence: 0.8 } },
  liked_product_ids: [kandidaat.product_id],
  disliked_product_ids: ['22222222-2222-2222-2222-222222222222'],
};

describe('bouwToolSchema', () => {
  it('is strikt op elk objectniveau en beperkt occasion tot het profiel', () => {
    const schema = bouwToolSchema(['work', 'date']) as any;
    expect(alleObjectenStrikt(schema)).toBe(true);
    expect(schema.properties.outfits.items.properties.occasion.enum).toEqual(['work', 'date']);
    expect(schema.properties.outfits.items.properties.items.items.properties.role.enum).toEqual([
      'top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory',
    ]);
  });
});

describe('prompts', () => {
  it('versie en toolnaam zijn vast', () => {
    expect(STYLIST_VERSION).toBe('stylist-v1');
    expect(TOOL_NAAM).toBe('lever_outfits');
  });

  it('systeemprompt is Nederlands en noemt de tool en de zes-outfits-eis', () => {
    const s = bouwSysteemPrompt();
    expect(s).toContain('lever_outfits');
    expect(s).toContain('zes outfits');
    expect(s).toContain('je en jij');
  });

  it('gebruikersprompt bevat feiten, assen, voorbeelden en elke kandidaat', () => {
    const p = bouwGebruikersPrompt(profiel, [kandidaat], []);
    expect(p).toContain('Budget per stuk: 50 tot 150 euro');
    expect(p).toContain('Gelegenheden: work, date');
    expect(p).toContain('formality: 4 (zekerheid 0.8)');
    expect(p).toContain('silhouette: onbekend (zekerheid 0)');
    expect(p).toContain(kandidaat.product_id);
    expect(p).toContain('Wollen overhemd');
    expect(p).toContain('79 euro');
    expect(p).toContain('22222222-2222-2222-2222-222222222222');
    expect(p).not.toContain('Fouten in de vorige poging');
  });

  it('gebruikersprompt neemt de fouten van de vorige poging op', () => {
    const p = bouwGebruikersPrompt(profiel, [kandidaat], ['outfit 2: buiten budget: x kost 400']);
    expect(p).toContain('Fouten in de vorige poging');
    expect(p).toContain('outfit 2: buiten budget: x kost 400');
  });
});
