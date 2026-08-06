/**
 * Eisen aan het calibratiescherm, bewaakt op een vaste catalogus-snapshot.
 *
 * Achtergrond (2026-08-06). Een browsertest op productie leverde drie runs met
 * negen onbruikbare outfits: twee paar schoenen in één outfit, een riem als
 * hoofditem, een kindervoetbalshirt van 74,95 euro, alle negen kaarten met de
 * kop "Casual dag uit" terwijl "Werk" was gekozen, en een broek van 1062 euro
 * bij een maximum van 150. Oorzaak: het scherm draaide op
 * `adaptiveOutfitGenerator`, een ongeteste generator die de antwoorden van de
 * gebruiker onderweg kwijtraakte.
 *
 * Deze test bewaakt de zes eisen aan de nieuwe route (engine v2) op dezelfde
 * catalogus als de golden baseline, met een vaste seed zodat de uitkomst
 * reproduceerbaar is.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { reclassifyProducts } from '@/engine/productClassifier';
import { dedupeProductVariants } from '@/services/outfits/dedupeProductVariants';
import { beoordeelProduct, seizoenenBotsen } from '@/engine/productSafety';
import {
  OCCASION_PRESENTATION,
  presentationForOccasion,
} from '@/components/quiz/occasionPresentation';
import type { Product } from '@/engine/types';
import type { CalibrationOutfit } from '@/services/visualPreferences/calibrationService';
import {
  buildCalibrationAnswers,
  buildCalibrationOutfits,
  buildSlotAlternatives,
  resolveBudgetMax,
  type CalibrationSlot,
} from '../engineV2Calibration';
import rawCatalog from '@/engine/v2/__tests__/fixtures/catalog-tagged-2026-06-11.json';

const SEED = 20260806;
const BUDGET_MAX = 150;

/** Zelfde mapping als OutfitService.mapDatabaseProduct. */
function mapDatabaseProduct(dbProduct: any): Product {
  const tags: string[] = dbProduct.tags || [];
  const style: string = dbProduct.style || '';
  const styleTags = style
    ? [...tags, ...style.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean)]
    : tags;
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    brand: dbProduct.brand,
    price: dbProduct.price,
    category: dbProduct.category,
    gender: dbProduct.gender,
    colors: [],
    sizes: dbProduct.sizes || [],
    tags,
    styleTags,
    description: dbProduct.description,
    inStock: dbProduct.in_stock ?? true,
  };
}

/** Zelfde voorbewerking als het live pad (OutfitService.getProducts). */
function buildPool(gender: string): Product[] {
  const rows = (rawCatalog as any[]).filter(
    (p) => p.gender === gender || p.gender === 'unisex'
  );
  const mapped = dedupeProductVariants(rows.map(mapDatabaseProduct));
  const { classified } = reclassifyProducts(mapped);
  return classified;
}

const pools = new Map<string, Product[]>();
const productById = new Map<string, Product>();

beforeAll(() => {
  for (const gender of ['male', 'female']) {
    const pool = buildPool(gender);
    pools.set(gender, pool);
    for (const product of pool) productById.set(product.id, product);
  }
});

const OCCASIONS = ['work', 'casual', 'formal', 'date', 'party', 'travel', 'sport'];

const PROFIELEN: Record<string, Record<string, any>> = {
  'man-default': { gender: 'male' },
  'man-klassiek': { gender: 'male', stylePreferences: ['classic'] },
  'vrouw-default': { gender: 'female' },
  'vrouw-klassiek': { gender: 'female', stylePreferences: ['classic'] },
};

/**
 * Vloeren, gemeten op deze snapshot met SEED. Drie is wat het scherm nodig
 * heeft. Eén cel haalt dat niet: een klassieke vrouw met werk als gelegenheid
 * heeft in deze catalogus (grotendeels PUMA) te weinig passende combinaties
 * onder de 150 euro per stuk. Dat is een feed-probleem, geen enginefout, en de
 * vloer staat daarom op de gemeten waarde. Verhogen zodra de feed breder is.
 */
const VLOER: Record<string, Record<string, number>> = {
  'man-default': { work: 3, casual: 3, formal: 3, date: 3, party: 3, travel: 3, sport: 3 },
  'man-klassiek': { work: 3, casual: 3, formal: 3, date: 3, party: 3, travel: 3, sport: 3 },
  'vrouw-default': { work: 3, casual: 3, formal: 3, date: 3, party: 3, travel: 3, sport: 3 },
  'vrouw-klassiek': { work: 2, casual: 3, formal: 3, date: 3, party: 3, travel: 3, sport: 3 },
};

/** De categorie die achter elke slot van de kaart hoort te zitten. */
const CATEGORIE_PER_SLOT: Record<CalibrationSlot, string> = {
  top: 'top',
  bottom: 'bottom',
  shoes: 'footwear',
  outerwear: 'outerwear',
  accessory: 'accessory',
};

function quizVoor(profiel: Record<string, any>, occasion: string) {
  return {
    ...profiel,
    occasions: [occasion],
    budget: { min: 0, max: BUDGET_MAX },
    sizes: { tops: 'M', bottoms: 'M', shoes: '42' },
  };
}

/** Gememoiseerd: dezelfde seed geeft dezelfde uitkomst, en de matrix is groot. */
const cache = new Map<string, CalibrationOutfit[]>();

function genereer(profielNaam: string, occasion: string): CalibrationOutfit[] {
  const sleutel = `${profielNaam}|${occasion}`;
  const bestaand = cache.get(sleutel);
  if (bestaand) return bestaand;

  const profiel = PROFIELEN[profielNaam];
  const products = pools.get(profiel.gender)!;
  const outfits = buildCalibrationOutfits(products, quizVoor(profiel, occasion), {
    count: 3,
    seed: SEED,
  });
  cache.set(sleutel, outfits);
  return outfits;
}

function itemsVan(outfit: CalibrationOutfit) {
  return Object.entries(outfit.items).filter(([, item]) => Boolean(item)) as Array<
    [CalibrationSlot, NonNullable<CalibrationOutfit['items']['top']>]
  >;
}

describe('calibratiescherm: outfits uit engine v2', () => {
  it('vult elke cel van de matrix tot de gemeten vloer', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        const outfits = genereer(profielNaam, occasion);
        expect(
          outfits.length,
          `${profielNaam} / ${occasion}`
        ).toBeGreaterThanOrEqual(VLOER[profielNaam][occasion]);
      }
    }
  });

  it('eis 1: de outfits komen uit runEngineV2', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          // buildOutfitId in composer.ts geeft elke v2-compositie dit voorvoegsel.
          expect(outfit.id.startsWith('v2-'), `${outfit.id}`).toBe(true);
          expect(outfit.explanation.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('is reproduceerbaar bij dezelfde seed', () => {
    const products = pools.get('male')!;
    const quiz = quizVoor(PROFIELEN['man-default'], 'work');
    const eerst = buildCalibrationOutfits(products, quiz, { count: 3, seed: SEED });
    const opnieuw = buildCalibrationOutfits(products, quiz, { count: 3, seed: SEED });
    expect(opnieuw.map((o) => o.id)).toEqual(eerst.map((o) => o.id));
    expect(eerst.length).toBe(3);
  });
});

describe('eis 2: de gekozen gelegenheid komt aan', () => {
  it('geeft alleen outfits voor de gekozen gelegenheid', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          expect(outfit.occasion, `${profielNaam} / ${occasion}`).toBe(occasion);
        }
      }
    }
  });

  it('toont "Kantoor" op de kaart wanneer de gebruiker Werk koos', () => {
    const outfits = genereer('man-default', 'work');
    expect(outfits.length).toBeGreaterThan(0);
    for (const outfit of outfits) {
      expect(presentationForOccasion(outfit.occasion).title).toBe('Kantoor');
    }
  });

  it('kent elke gelegenheid die de engine kan opleveren', () => {
    // Zonder deze eis viel alles behalve work en casual terug op de fallback
    // "Casual dag uit", ook een outfit die voor een gala was gecomponeerd.
    for (const occasion of OCCASIONS) {
      expect(OCCASION_PRESENTATION[occasion], occasion).toBeDefined();
      if (occasion === 'casual') continue;
      expect(presentationForOccasion(occasion).title, occasion).not.toBe(
        'Casual dag uit'
      );
    }
    expect(presentationForOccasion('casual').title).toBe('Casual dag uit');
    // Een onbekende sleutel valt nog steeds terug op casual.
    expect(presentationForOccasion('onbekend').title).toBe('Casual dag uit');
  });

  it('kiest werk-passende producten', () => {
    // Sportkleding hoort niet op een kantoorkaart. Formaliteit zit in de
    // engine; hier bewaken we de uitkomst op de meest zichtbare misser.
    const sportTermen =
      /\b(trainings|sportbeha|hardloop|voetbal|joggingbroek|legging|spikes|keepers)\b/i;
    for (const profielNaam of ['man-default', 'man-klassiek']) {
      for (const outfit of genereer(profielNaam, 'work')) {
        for (const [slot, item] of itemsVan(outfit)) {
          expect(
            sportTermen.test(item.name),
            `${slot}: ${item.name}`
          ).toBe(false);
        }
      }
    }
  });
});

describe('eis 3: het budget wordt gerespecteerd', () => {
  it('levert geen enkel item boven het maximum per stuk', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          for (const [slot, item] of itemsVan(outfit)) {
            expect(
              item.price,
              `${profielNaam} / ${occasion} / ${slot}: ${item.name}`
            ).toBeLessThanOrEqual(BUDGET_MAX);
          }
        }
      }
    }
  });

  it('respecteert ook een krap budget', () => {
    const products = pools.get('male')!;
    const krap = 60;
    const outfits = buildCalibrationOutfits(
      products,
      { gender: 'male', occasions: ['casual'], budget: { min: 0, max: krap } },
      { count: 3, seed: SEED }
    );
    for (const outfit of outfits) {
      for (const [, item] of itemsVan(outfit)) {
        expect(item.price, item.name).toBeLessThanOrEqual(krap);
      }
    }
  });

  it('beweert niets over budget dat niet klopt', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          if (!/budget/i.test(outfit.explanation)) continue;
          for (const [, item] of itemsVan(outfit)) {
            expect(item.price, outfit.explanation).toBeLessThanOrEqual(BUDGET_MAX);
          }
        }
      }
    }
  });

  it('leest het maximum uit budget.max, anders uit budgetRange', () => {
    expect(resolveBudgetMax({ budget: { min: 0, max: 90 } })).toBe(90);
    expect(resolveBudgetMax({ budgetRange: 220 })).toBe(220);
    expect(resolveBudgetMax({})).toBe(150);
    // budgetRange mag het exacte bedrag uit budget.max niet overschrijven
    const answers = buildCalibrationAnswers({ budget: { min: 20, max: 90 } });
    expect(answers.budget).toEqual({ min: 20, max: 90 });
    expect(answers.budgetRange).toBe(90);
  });
});

describe('eis 4: gender wordt gerespecteerd', () => {
  it('levert geen producten van het andere geslacht', () => {
    const toegestaan: Record<string, string[]> = {
      male: ['male', 'men', 'man', 'heren', 'unisex', ''],
      female: ['female', 'women', 'woman', 'dames', 'unisex', ''],
    };
    for (const profielNaam of Object.keys(PROFIELEN)) {
      const gender = PROFIELEN[profielNaam].gender as string;
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          for (const [slot, item] of itemsVan(outfit)) {
            const bron = productById.get(item.id);
            expect(bron, `${item.id} onbekend`).toBeDefined();
            const pg = (bron!.gender ?? '').toLowerCase().trim();
            expect(
              toegestaan[gender].includes(pg),
              `${profielNaam} / ${occasion} / ${slot}: ${item.name} (${pg})`
            ).toBe(true);
          }
        }
      }
    }
  });
});

describe('eis 5: productSafety en seizoen', () => {
  it('laat elk item door beoordeelProduct', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          for (const [slot, item] of itemsVan(outfit)) {
            const bron = productById.get(item.id)!;
            const oordeel = beoordeelProduct({
              name: bron.name,
              category: bron.category,
              sizes: bron.sizes,
            });
            expect(
              oordeel.ok,
              `${profielNaam} / ${occasion} / ${slot}: ${item.name} (${oordeel.reden})`
            ).toBe(true);
          }
        }
      }
    }
  });

  it('levert geen outfit met een winter-zomerbotsing', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          const namen = itemsVan(outfit).map(([, item]) => item.name);
          expect(seizoenenBotsen(namen), namen.join(' + ')).toBe(false);
        }
      }
    }
  });

  it('houdt de gemelde productiegevallen buiten de outfits', () => {
    const vergiftigd: Product[] = [
      {
        // De kaart van 74,95 euro uit de browsertest.
        id: 'gif-kindershirt',
        name: 'PUMA Marokko thuisshirt voor Kinderen, Rood, Maat 9-10Y',
        brand: 'Puma',
        price: 74.95,
        category: 'top',
        gender: 'male',
        colors: [],
        sizes: [],
        tags: [],
        inStock: true,
      },
      {
        // Meubel met category='top' uit de oude feed-importer.
        id: 'gif-tafel',
        name: 'Gele bijzettafel van keramiek',
        brand: 'Woonwarenhuis',
        price: 49,
        category: 'top',
        gender: 'unisex',
        colors: [],
        sizes: [],
        tags: [],
        inStock: true,
      },
      {
        // Schoen die in de feed als bottom staat: de bron van "twee paar
        // schoenen in één outfit".
        id: 'gif-schoen-als-broek',
        name: 'PUMA Smash 3.0 Sneakers, Zwart, Maat 43',
        brand: 'Puma',
        price: 39.95,
        category: 'bottom',
        gender: 'male',
        colors: [],
        sizes: [],
        tags: [],
        inStock: true,
      },
      {
        // Riem die in de feed als bottom staat: "riem als hoofditem".
        id: 'gif-riem-als-broek',
        name: 'Leren riem met gesp, Zwart',
        brand: 'Puma',
        price: 29.95,
        category: 'bottom',
        gender: 'male',
        colors: [],
        sizes: [],
        tags: [],
        inStock: true,
      },
      {
        // De broek van 1062 euro bij een maximum van 150.
        id: 'gif-dure-broek',
        name: 'Tom Ford wollen pantalon',
        brand: 'Tom Ford',
        price: 1062,
        category: 'bottom',
        gender: 'male',
        colors: [],
        sizes: [],
        tags: [],
        inStock: true,
      },
    ];

    const products = [...pools.get('male')!, ...vergiftigd];
    let gezien = 0;

    for (const occasion of OCCASIONS) {
      const outfits = buildCalibrationOutfits(
        products,
        quizVoor(PROFIELEN['man-default'], occasion),
        { count: 3, seed: SEED }
      );
      expect(outfits.length, occasion).toBeGreaterThanOrEqual(1);

      for (const outfit of outfits) {
        for (const [slot, item] of itemsVan(outfit)) {
          gezien++;
          expect(item.id, `${occasion} / ${slot}: ${item.name}`).not.toBe('gif-kindershirt');
          expect(item.id, `${occasion} / ${slot}: ${item.name}`).not.toBe('gif-tafel');
          expect(item.id, `${occasion} / ${slot}: ${item.name}`).not.toBe('gif-dure-broek');
          // Schoen en riem mogen bestaan, maar nooit als broek.
          if (item.id === 'gif-schoen-als-broek') expect(slot).toBe('shoes');
          if (item.id === 'gif-riem-als-broek') expect(slot).toBe('accessory');
        }
      }
    }

    expect(gezien).toBeGreaterThan(0);
  });
});

describe('eis 6: slots zijn compleet en uniek', () => {
  it('heeft altijd een top, een bottom en schoenen', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          const label = `${profielNaam} / ${occasion} / ${outfit.id}`;
          expect(outfit.items.top, label).toBeDefined();
          expect(outfit.items.bottom, label).toBeDefined();
          expect(outfit.items.shoes, label).toBeDefined();
        }
      }
    }
  });

  it('zet in elke slot een product van de bijbehorende categorie', () => {
    // Twee paar schoenen in één outfit kwam eruit doordat een schoen met
    // category='bottom' klakkeloos in de broek-slot werd gezet.
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          for (const [slot, item] of itemsVan(outfit)) {
            expect(
              item.category,
              `${profielNaam} / ${occasion} / ${slot}: ${item.name}`
            ).toBe(CATEGORIE_PER_SLOT[slot]);
          }
        }
      }
    }
  });

  it('gebruikt geen product twee keer in dezelfde outfit', () => {
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          const ids = itemsVan(outfit).map(([, item]) => item.id);
          expect(new Set(ids).size, ids.join(', ')).toBe(ids.length);
        }
      }
    }
  });
});

describe('presentatie van de items', () => {
  it('toont geen maat in de productnaam', () => {
    // De feed levert elke maat als aparte rij en de ontdubbeling houdt de
    // goedkoopste over. Wie M invulde kreeg zo een kaart met "Maat XXS", een
    // maat die niets met zijn antwoord te maken had.
    for (const profielNaam of Object.keys(PROFIELEN)) {
      for (const occasion of OCCASIONS) {
        for (const outfit of genereer(profielNaam, occasion)) {
          for (const [slot, item] of itemsVan(outfit)) {
            expect(
              /,\s*Maat\s+/i.test(item.name),
              `${profielNaam} / ${occasion} / ${slot}: ${item.name}`
            ).toBe(false);
          }
        }
      }
    }
  });
});

describe('vervangen van een item blijft binnen dezelfde grenzen', () => {
  it('levert alternatieven die aan budget, gender en veiligheid voldoen', () => {
    const products = pools.get('male')!;
    const quiz = quizVoor(PROFIELEN['man-default'], 'work');
    const outfit = buildCalibrationOutfits(products, quiz, { count: 3, seed: SEED })[0];
    expect(outfit).toBeDefined();

    const inGebruik = itemsVan(outfit).map(([, item]) => item.id);

    for (const slot of ['top', 'bottom', 'shoes'] as CalibrationSlot[]) {
      const alternatieven = buildSlotAlternatives(products, quiz, slot, {
        seed: SEED,
        excludeIds: inGebruik,
      });
      expect(alternatieven.length, slot).toBeGreaterThan(0);
      for (const item of alternatieven) {
        expect(inGebruik).not.toContain(item.id);
        expect(item.price, item.name).toBeLessThanOrEqual(BUDGET_MAX);
        expect(item.category, item.name).toBe(CATEGORIE_PER_SLOT[slot]);
        const bron = productById.get(item.id)!;
        expect(beoordeelProduct({ name: bron.name, category: bron.category, sizes: bron.sizes }).ok).toBe(true);
      }
    }
  });
});
