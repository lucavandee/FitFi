import { describe, expect, it } from 'vitest';
import {
  MAX_HERHALINGEN_PER_PRODUCT,
  VEREIST_AANTAL_OUTFITS,
  toetsKandidatenpool,
  valideerSet,
  vindDubbeleProductIds,
  vindOverPlafondProductIds,
} from '../valideer-set.ts';
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

/**
 * Bouwt `aantal` unieke SANDAAL-footwear-kandidaten (FIX 4, herreview plan 3,
 * bevinding 1). `kandidaten('footwear', n)` hierboven zet altijd shoe_type
 * 'sneaker'; deze helper is er specifiek om een pool te bouwen die
 * UITSLUITEND sandalen als footwear heeft.
 */
function sandaalKandidaten(aantal: number): Kandidaat[] {
  return Array.from({ length: aantal }, (_, i) => {
    const id = `sandaal${i}`;
    return {
      product_id: id,
      category: 'footwear' as const,
      score: 0.5,
      attrs: { ...attrs('footwear'), shoe_type: 'sandaal' },
      product: product(id),
    };
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

    it('fix 3: dezelfde footwear in een paar outfits is toegestaan (binnen het plafond van FIX 5)', () => {
      // Precies op de grens van MAX_HERHALINGEN_PER_PRODUCT (drie): geldig.
      // Zie de "fix 5"-tests hieronder voor de grens zelf en voor wat erover gaat.
      const outfits = Array.from({ length: 6 }, (_, i) =>
        outfit('work', [`top${i}`, `bottom${i}`, i < MAX_HERHALINGEN_PER_PRODUCT ? 'schoen-gedeeld' : `schoen${i}`])
      );
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(true);
    });

    it('FIX 5 (herreview plan 3, bevinding 2): dezelfde footwear in ALLE zes outfits is niet langer toegestaan', () => {
      // Dit was tot deze taak de letterlijke test voor "fix 3: dezelfde
      // footwear in alle zes outfits is nu toegestaan" (verwachtte geldig).
      // Die verwachting is niet meer juist: bevinding 2 van de herreview wees
      // uit dat twee eerdere beslissingen elkaar bijten. Sinds fix 3 mag een
      // footwear-item onbeperkt herhalen; tegelijk laat de budgetregel in
      // valideer-outfits.ts een outfit met een item buiten het budget van de
      // lezende bezoeker HELEMAAL wegvallen. Gebruikt het model dezelfde
      // schoen in alle zes outfits en valt de prijs van die schoen buiten het
      // smallere budget van een bezoeker, dan verdwijnen alle zes outfits in
      // plaats van een enkele. FIX 5 begrenst herhaling van elke rol behalve
      // top/dress tot MAX_HERHALINGEN_PER_PRODUCT (de helft van de outfits).
      const outfits = Array.from({ length: 6 }, (_, i) => outfit('work', [`top${i}`, `bottom${i}`, 'schoen-gedeeld']));
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('schoen-gedeeld') && f.includes('plafond'))).toBe(true);
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

  describe('regel 3 uitbreiding (FIX 5, herreview plan 3, bevinding 2): plafond op herhaling van niet-top/dress rollen', () => {
    it('gebruikt MAX_HERHALINGEN_PER_PRODUCT als de norm (geen losse magic number)', () => {
      expect(MAX_HERHALINGEN_PER_PRODUCT).toBe(3);
    });

    it('is geldig als eenzelfde footwear in precies MAX_HERHALINGEN_PER_PRODUCT outfits voorkomt (op de grens)', () => {
      const outfits = Array.from({ length: 6 }, (_, i) =>
        outfit('work', [`top${i}`, `bottom${i}`, i < MAX_HERHALINGEN_PER_PRODUCT ? 'schoen-gedeeld' : `schoen${i}`])
      );
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(true);
    });

    it('keurt af zodra eenzelfde footwear in MAX_HERHALINGEN_PER_PRODUCT + 1 outfits voorkomt (net over de grens)', () => {
      const outfits = Array.from({ length: 6 }, (_, i) =>
        outfit('work', [`top${i}`, `bottom${i}`, i < MAX_HERHALINGEN_PER_PRODUCT + 1 ? 'schoen-gedeeld' : `schoen${i}`])
      );
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('schoen-gedeeld') && f.includes('plafond'))).toBe(true);
    });

    it('keurt af zodra eenzelfde bottom vaker dan het plafond voorkomt', () => {
      const outfits = Array.from({ length: 6 }, (_, i) =>
        outfit('work', [`top${i}`, i < MAX_HERHALINGEN_PER_PRODUCT + 1 ? 'bottom-gedeeld' : `bottom${i}`, `schoen${i}`])
      );
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('bottom-gedeeld') && f.includes('plafond'))).toBe(true);
    });

    it('top en dress blijven de strengere eigen regel houden (eenmaal, niet driemaal) ondanks het nieuwe plafond', () => {
      // Regel 3 (top/dress) is ongewijzigd door FIX 5: een top die twee keer
      // voorkomt is nog altijd fout, ook al zit dat ruim onder het plafond
      // van drie dat nu voor de ANDERE rollen geldt.
      const outfits = zesGeldigeOutfits();
      outfits[3] = outfit('work', ['top0', 'bottom3', 'schoen3']);
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('top0') && f.includes('twee keer'))).toBe(true);
    });

    it('meldt overtredingen van meerdere producten die over het plafond gaan onafhankelijk van elkaar', () => {
      const outfits = Array.from({ length: 6 }, (_, i) =>
        outfit('work', [
          `top${i}`, // top blijft uniek per outfit, ongemoeid door het nieuwe plafond.
          i < MAX_HERHALINGEN_PER_PRODUCT + 1 ? 'bottom-gedeeld' : `bottom${i}`,
          i < MAX_HERHALINGEN_PER_PRODUCT + 1 ? 'schoen-gedeeld' : `schoen${i}`,
        ])
      );
      const resultaat = valideerSet(outfits, { occasions: ['work'] });
      expect(resultaat.geldig).toBe(false);
      expect(resultaat.fouten.some((f) => f.includes('bottom-gedeeld'))).toBe(true);
      expect(resultaat.fouten.some((f) => f.includes('schoen-gedeeld'))).toBe(true);
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

describe('vindOverPlafondProductIds (FIX 5 vervolg, coordinator-fixronde 28 sept 2026)', () => {
  // Analoog aan vindDubbeleProductIds hierboven, maar voor het plafond
  // (MAX_HERHALINGEN_PER_PRODUCT) op de rollen ZONDER uniciteitseis. Zelfde
  // reden: het vulscript heeft voor zijn herkansingsprompt alleen de kale
  // lijst product-ids nodig, geen outfit-indices.
  it('geeft een lege lijst als geen enkel product over het plafond gaat', () => {
    expect(vindOverPlafondProductIds(zesGeldigeOutfits())).toEqual([]);
  });

  it('is nog leeg precies op de grens (MAX_HERHALINGEN_PER_PRODUCT keer)', () => {
    const outfits = Array.from({ length: 6 }, (_, i) =>
      outfit('work', [`top${i}`, `bottom${i}`, i < MAX_HERHALINGEN_PER_PRODUCT ? 'schoen-gedeeld' : `schoen${i}`])
    );
    expect(vindOverPlafondProductIds(outfits)).toEqual([]);
  });

  it('vindt een footwear die vaker dan het plafond voorkomt', () => {
    const outfits = Array.from({ length: 6 }, (_, i) =>
      outfit('work', [`top${i}`, `bottom${i}`, i < MAX_HERHALINGEN_PER_PRODUCT + 1 ? 'schoen-gedeeld' : `schoen${i}`])
    );
    expect(vindOverPlafondProductIds(outfits)).toEqual(['schoen-gedeeld']);
  });

  it('vindt meerdere onafhankelijke overtredingen tegelijk (bottom en footwear)', () => {
    const outfits = Array.from({ length: 6 }, (_, i) =>
      outfit('work', [
        `top${i}`,
        i < MAX_HERHALINGEN_PER_PRODUCT + 1 ? 'bottom-gedeeld' : `bottom${i}`,
        i < MAX_HERHALINGEN_PER_PRODUCT + 1 ? 'schoen-gedeeld' : `schoen${i}`,
      ])
    );
    expect(vindOverPlafondProductIds(outfits).sort()).toEqual(['bottom-gedeeld', 'schoen-gedeeld']);
  });

  it('geeft elke overtredende id maar een keer terug, niet een keer per overtreding erboven', () => {
    // Vier outfits delen dezelfde schoen: dat is een keer over het plafond
    // (drie is het maximum), niet meerdere overtredingen voor hetzelfde id.
    const outfits = Array.from({ length: 6 }, (_, i) =>
      outfit('work', [`top${i}`, `bottom${i}`, i < 4 ? 'schoen-gedeeld' : `schoen${i}`])
    );
    expect(vindOverPlafondProductIds(outfits)).toEqual(['schoen-gedeeld']);
  });

  it('een dubbele top telt niet mee: die heeft zijn eigen regel (vindDubbeleProductIds), niet het plafond', () => {
    const outfits = zesGeldigeOutfits();
    outfits[3] = outfit('work', ['top0', 'bottom3', 'schoen3']);
    expect(vindOverPlafondProductIds(outfits)).toEqual([]);
  });
});

describe('toetsKandidatenpool (fixronde 1, eis 1; herijkt op fix 3; herijkt op FIX 4/5, herreview plan 3)', () => {
  it('is voldoende met een ruime pool (case "vrouw minimalistisch", gemeten 27 sept 2026)', () => {
    const pool = [
      ...kandidaten('dress', 229),
      ...kandidaten('outerwear', 154),
      ...kandidaten('footwear', 134),
      ...kandidaten('top', 115),
      ...kandidaten('bottom', 106),
      ...kandidaten('accessory', 14),
    ];
    expect(toetsKandidatenpool(pool, ['casual'])).toEqual({ voldoende: true });
  });

  it('case "man klassiek" (gemeten 27 sept 2026): footwear is met 2 kandidaten precies genoeg, maar te weinig unieke tops blijft het probleem', () => {
    // Dezelfde pool als de echte run van 27 september. Onder de OUDE regel
    // (elk product uniek) was dit onvoldoende wegens 2 footwear-kandidaten
    // (< 6). Sinds fix 3 mocht footwear onbeperkt herhalen (1 was al genoeg);
    // sinds FIX 5 (deze taak) mag footwear nog altijd herhalen, maar niet
    // vaker dan MAX_HERHALINGEN_PER_PRODUCT (drie), dus zijn er minstens twee
    // unieke footwear-kandidaten nodig. Deze pool heeft er precies twee
    // (2 x 3 = 6, exact genoeg), dus footwear is hier nog steeds geen
    // probleem. De pool blijft niettemin onvoldoende: 0 dress + 4 top (met
    // een bottom om mee te combineren) = 4, minder dan de 6 benodigde unieke
    // tops/dresses.
    const pool = [
      ...kandidaten('accessory', 1),
      ...kandidaten('bottom', 3),
      ...kandidaten('footwear', 2),
      ...kandidaten('outerwear', 12),
      ...kandidaten('top', 4),
    ];
    const resultaat = toetsKandidatenpool(pool, ['casual']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('top/dress');
  });

  it('is onvoldoende zonder een enkele footwear-kandidaat, ook als de rest ruim voldoende is', () => {
    const pool = [...kandidaten('top', 20), ...kandidaten('bottom', 20), ...kandidaten('dress', 20)];
    const resultaat = toetsKandidatenpool(pool, ['casual']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('footwear');
  });

  it('FIX 5 (herreview plan 3, bevinding 2): EEN footwear-kandidaat is niet meer genoeg', () => {
    // Dit was tot deze taak de letterlijke test voor "fix 3: EEN
    // footwear-kandidaat is al genoeg" (verwachtte voldoende: true). Die
    // verwachting is niet meer juist: footwear mag sinds fix 3 herhalen, maar
    // sinds FIX 5 niet vaker dan MAX_HERHALINGEN_PER_PRODUCT (drie). Een
    // enkele footwear-kandidaat dekt dus hoogstens drie van de zes outfits,
    // niet alle zes: 1 x 3 = 3 < 6.
    const pool = [...kandidaten('footwear', 1), ...kandidaten('top', 20), ...kandidaten('bottom', 20), ...kandidaten('dress', 20)];
    const resultaat = toetsKandidatenpool(pool, ['casual']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('footwear');
  });

  it('FIX 5: TWEE footwear-kandidaten is het nieuwe minimum (2 x plafond van drie = precies zes)', () => {
    const pool = [...kandidaten('footwear', 2), ...kandidaten('top', 20), ...kandidaten('bottom', 20), ...kandidaten('dress', 20)];
    expect(toetsKandidatenpool(pool, ['casual'])).toEqual({ voldoende: true });
  });

  it('is precies op de grens voldoende met twee footwear-kandidaten en genoeg top/bottom', () => {
    const pool = [...kandidaten('footwear', 2), ...kandidaten('top', 6), ...kandidaten('bottom', 6)];
    expect(toetsKandidatenpool(pool, ['casual'])).toEqual({ voldoende: true });
  });

  it('telt dress en top+bottom als alternatieve routes: genoeg dress compenseert weinig top', () => {
    // isCompleet staat dress+footwear toe zonder top/bottom: 6 dress + 2 footwear is genoeg,
    // ook al is er maar 1 top (en 1 bottom, die mag herhalen maar hier niet nodig is).
    const pool = [...kandidaten('footwear', 2), ...kandidaten('dress', 6), ...kandidaten('top', 1), ...kandidaten('bottom', 1)];
    expect(toetsKandidatenpool(pool, ['casual'])).toEqual({ voldoende: true });
  });

  it('is onvoldoende als dress + top net onder zes blijft', () => {
    // 2 dress + 2 top = 4, minder dan 6. bottom (5, ruim genoeg voor het plafond) telt niet extra mee.
    const pool = [
      ...kandidaten('footwear', 2),
      ...kandidaten('dress', 2),
      ...kandidaten('top', 2),
      ...kandidaten('bottom', 5),
    ];
    const resultaat = toetsKandidatenpool(pool, ['casual']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('top/dress');
  });

  it('is onvoldoende met genoeg tops maar zonder een enkele bottom om ze mee te combineren', () => {
    // 0 dress + 0 (geen bottom om top+bottom mee te vormen, dus 0 * plafond = 0) = 0, minder dan 6, ondanks 20 tops.
    const pool = [...kandidaten('footwear', 2), ...kandidaten('top', 20)];
    const resultaat = toetsKandidatenpool(pool, ['casual']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('top/dress');
  });

  it('FIX 5: is onvoldoende als bottom te weinig capaciteit heeft voor het aantal benodigde top+bottom-outfits, ondanks genoeg tops', () => {
    // 20 top, maar maar 1 bottom: bottom-plafond (1 x 3 = 3) is de bottleneck,
    // niet top-uniciteit. 0 dress + min(20, 3) = 3, minder dan 6.
    const pool = [...kandidaten('footwear', 2), ...kandidaten('top', 20), ...kandidaten('bottom', 1)];
    const resultaat = toetsKandidatenpool(pool, ['casual']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('top/dress');
  });

  it('een lege pool is onvoldoende (faalt op footwear, niet op een lege-array-crash)', () => {
    const resultaat = toetsKandidatenpool([], ['casual']);
    expect(resultaat.voldoende).toBe(false);
  });
});

describe('toetsKandidatenpool: gevraagde gelegenheden en shoe_type (FIX 4, herreview plan 3, bevinding 1)', () => {
  it('keurt een pool met uitsluitend sandalen af bij occasion work, ook al is er verder ruim voldoende', () => {
    const pool = [...sandaalKandidaten(2), ...kandidaten('top', 20), ...kandidaten('bottom', 20)];
    const resultaat = toetsKandidatenpool(pool, ['work']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('sandaal');
  });

  it('keurt dezelfde pool goed als alleen casual gevraagd wordt', () => {
    const pool = [...sandaalKandidaten(2), ...kandidaten('top', 20), ...kandidaten('bottom', 20)];
    expect(toetsKandidatenpool(pool, ['casual'])).toEqual({ voldoende: true });
  });

  it('keurt een pool met uitsluitend sandalen ook af bij occasion formal (niet alleen work)', () => {
    const pool = [...sandaalKandidaten(2), ...kandidaten('top', 20), ...kandidaten('bottom', 20)];
    const resultaat = toetsKandidatenpool(pool, ['formal']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('sandaal');
  });

  it('keurt goed zodra er minstens een niet-sandaal footwear-kandidaat is, ook bij work', () => {
    const pool = [...sandaalKandidaten(1), ...kandidaten('footwear', 1), ...kandidaten('top', 20), ...kandidaten('bottom', 20)];
    expect(toetsKandidatenpool(pool, ['work'])).toEqual({ voldoende: true });
  });

  it('werkt ook als work of formal een van meerdere gevraagde gelegenheden is', () => {
    const pool = [...sandaalKandidaten(2), ...kandidaten('top', 20), ...kandidaten('bottom', 20)];
    const resultaat = toetsKandidatenpool(pool, ['casual', 'work']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('sandaal');
  });

  it('nul gevraagde gelegenheden: de sandaal-toets vervalt net als bij casual', () => {
    const pool = [...sandaalKandidaten(2), ...kandidaten('top', 20), ...kandidaten('bottom', 20)];
    expect(toetsKandidatenpool(pool, [])).toEqual({ voldoende: true });
  });

  it('een pool zonder footwear faalt nog altijd eerst op de footwear-toets, ook al is work gevraagd', () => {
    const pool = [...kandidaten('top', 20), ...kandidaten('bottom', 20)];
    const resultaat = toetsKandidatenpool(pool, ['work']);
    expect(resultaat.voldoende).toBe(false);
    expect(resultaat.reden).toContain('footwear');
    expect(resultaat.reden).not.toContain('sandaal');
  });
});
