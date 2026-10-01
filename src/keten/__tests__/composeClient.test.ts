import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  answersVanProfiel,
  composeVoorProfiel,
  filterBuitenBudgetProducten,
  filterNietWilProducten,
  MIN_OUTFITS_NA_NIET_WIL_FILTER,
  outfitVanVerrijkt,
  productVanKandidaat,
  type KetenConfig,
} from '../composeClient';
import { profielVanQuizAnswers } from '../vanQuiz';
import { profileHash } from '../profileHash';
import { runEngineV2 } from '@/engine/v2/engine';
import { legeAssen, type Kandidaat, type ProductAttrs, type TasteProfileInput, type VerrijkteOutfit } from '../types';

// Fix 5 (eindreview plan 3): profileHash en runEngineV2 (via fallbackV2) mogen
// nooit een exception uit composeVoorProfiel laten ontsnappen. Beide worden
// hier gewrapt met vi.fn(actual...) zodat ze standaard hun ECHTE gedrag
// houden (alle andere tests in dit bestand blijven dus tegen de echte
// implementatie draaien) en alleen in de fix-5-tests eenmalig een fout
// krijgen via mockRejectedValueOnce/mockImplementationOnce.
vi.mock('../profileHash', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../profileHash')>();
  return { ...actual, profileHash: vi.fn(actual.profileHash) };
});
vi.mock('@/engine/v2/engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/engine/v2/engine')>();
  return { ...actual, runEngineV2: vi.fn(actual.runEngineV2) };
});

function maakAttrs(overrides: Partial<ProductAttrs> = {}): ProductAttrs {
  return {
    category: 'top',
    classifier_version: 'haiku-4.5-v1',
    formality: 3,
    occasions: ['work'],
    silhouette: 'regular',
    color_temp: 'warm',
    lightness: 'licht',
    pattern: 'effen',
    shoe_type: null,
    colors: ['beige'],
    materials: ['linnen'],
    seasons: ['zomer'],
    ...overrides,
  };
}

function maakKandidaat(id: string, overrides: Partial<Kandidaat> = {}): Kandidaat {
  return {
    product_id: id,
    category: 'top',
    score: 0.8,
    attrs: maakAttrs(),
    product: {
      id,
      name: `Product ${id}`,
      brand: 'Merk B',
      price: 59,
      image_url: 'https://example.test/b.jpg',
      retailer: 'H&M',
      url: 'https://example.test/u',
      affiliate_url: 'https://example.test/aff',
      product_url: null,
      gender: 'female',
      colors: ['beige'],
      sizes: ['S', 'M'],
      in_stock: true,
      description: 'Luchtige blouse',
    },
    ...overrides,
  };
}

const kandidaat = maakKandidaat('p1');

/** Een outfit met precies de opgegeven product-ids als items, elk in de rol 'top'. */
function maakOutfit(sleutel: string, productIds: string[]): VerrijkteOutfit {
  return {
    outfit_key: sleutel,
    title: `Outfit ${sleutel}`,
    occasion: 'work',
    items: productIds.map((id) => {
      const k = maakKandidaat(id);
      return { product_id: id, role: 'top' as const, product: k.product, attrs: k.attrs };
    }),
    reason: 'De blouse houdt het luchtig. Je draagt hem los over de broek.',
  };
}

/**
 * Fix 1 (eindreview plan 3): zelfde als maakOutfit, maar met een expliciete
 * prijs per item, voor het budget-hertoets-filter (composeClient.ts).
 */
function maakOutfitMetPrijs(sleutel: string, itemsMetPrijs: Array<[string, number]>): VerrijkteOutfit {
  return {
    outfit_key: sleutel,
    title: `Outfit ${sleutel}`,
    occasion: 'work',
    items: itemsMetPrijs.map(([id, prijs]) => {
      const k = maakKandidaat(id);
      return { product_id: id, role: 'top' as const, product: { ...k.product, price: prijs }, attrs: k.attrs };
    }),
    reason: 'De blouse houdt het luchtig. Je draagt hem los over de broek.',
  };
}

function maakProfiel(overrides: Partial<TasteProfileInput> = {}): TasteProfileInput {
  return {
    user_id: null,
    session_id: 's',
    gender: 'female',
    occasions: ['work'],
    budget_min: 25,
    budget_max: 100,
    nogo_product_ids: [],
    choices: [],
    axes: {
      ...legeAssen(),
      silhouette: { value: 'relaxed', confidence: 1 },
      pattern: { value: 'statement', confidence: 0.4 },
      color_temp: { value: 'warm', confidence: 0.5 },
      lightness: { value: 'licht', confidence: 0.75 },
    },
    liked_product_ids: [],
    disliked_product_ids: [],
    ...overrides,
  };
}

interface RpcAntwoord {
  data: unknown;
  error: { code: string; message: string } | null;
}

/**
 * Nagebootste RPC-ketting die zowel get_kandidaten
 * (`.abortSignal(...)`, rechtstreeks awaiten) als keten_outfit_set
 * (`.abortSignal(...).maybeSingle()`) kan bedienen: een echte Promise met
 * twee extra methoden die zichzelf (of een nieuwe promise) teruggeven, zodat
 * beide aanroepvormen werken zonder een losse fake class per RPC.
 */
function maakRpcKetting(antwoord: RpcAntwoord) {
  const belofte = Promise.resolve(antwoord) as Promise<RpcAntwoord> & {
    abortSignal: () => typeof belofte;
    maybeSingle: () => Promise<RpcAntwoord>;
  };
  belofte.abortSignal = () => belofte;
  belofte.maybeSingle = () => Promise.resolve(antwoord);
  return belofte;
}

/**
 * Nagebootst RPC-antwoord (brief taak 7: "een unit-test op een nagebootst
 * RPC-antwoord" in plaats van een echte cache-rij, want outfit_sets is leeg
 * en het schrijfpad is met opzet niet aanroepbaar door anon). Telt zelf hoe
 * vaak get_kandidaten en keten_outfit_set zijn aangeroepen, zodat de
 * retry-tests kunnen bewijzen dat er precies een herkansing gebeurt en niet
 * meer (fixronde 1: dezelfde herkansing geldt nu voor beide RPC's).
 * `kandidaten` is de kortere vorm voor een enkel, altijd geldig antwoord;
 * `kandidatenAntwoorden` (een reeks) is voor de retry- en foutscenario's.
 */
function maakStubConfig(opts: {
  kandidaten?: Kandidaat[];
  kandidatenAntwoorden?: RpcAntwoord[];
  ketenOutfitSetAntwoorden: RpcAntwoord[];
}): {
  cfg: KetenConfig;
  aantalGetKandidatenAanroepen: () => number;
  aantalKetenOutfitSetAanroepen: () => number;
} {
  const kandidatenAntwoorden = opts.kandidatenAntwoorden ?? [{ data: opts.kandidaten ?? [], error: null }];
  let kandidatenAanroepen = 0;
  let outfitSetAanroepen = 0;
  const client = {
    rpc(naam: string, _params: Record<string, unknown>) {
      if (naam === 'get_kandidaten') {
        const index = Math.min(kandidatenAanroepen, kandidatenAntwoorden.length - 1);
        kandidatenAanroepen += 1;
        return maakRpcKetting(kandidatenAntwoorden[index]);
      }
      if (naam === 'keten_outfit_set') {
        const index = Math.min(outfitSetAanroepen, opts.ketenOutfitSetAntwoorden.length - 1);
        outfitSetAanroepen += 1;
        return maakRpcKetting(opts.ketenOutfitSetAntwoorden[index]);
      }
      throw new Error(`onverwachte rpc-naam in test: ${naam}`);
    },
  };
  return {
    cfg: { supabase: client as unknown as SupabaseClient },
    aantalGetKandidatenAanroepen: () => kandidatenAanroepen,
    aantalKetenOutfitSetAanroepen: () => outfitSetAanroepen,
  };
}

describe('answersVanProfiel', () => {
  it('geeft feiten door en alleen assen met zekerheid van minstens 0.5', () => {
    expect(answersVanProfiel(maakProfiel({ occasions: ['work', 'date'] }))).toEqual({
      gender: 'female',
      occasions: ['work', 'date'],
      budget: { min: 25, max: 100 },
      fit: 'relaxed',
      neutrals: 'warm',
      lightness: 'licht',
    });
  });
});

describe('productVanKandidaat', () => {
  it('zet een kandidaat om naar het Product van de engine', () => {
    const p = productVanKandidaat(kandidaat);
    expect(p.id).toBe('p1');
    expect(p.name).toBe('Product p1');
    expect(p.category).toBe('top');
    expect(p.price).toBe(59);
    expect(p.imageUrl).toBe('https://example.test/b.jpg');
    expect(p.affiliateUrl).toBe('https://example.test/aff');
    expect(p.productUrl).toBe('https://example.test/u');
    expect(p.colors).toEqual(['beige']);
    expect(p.inStock).toBe(true);
    expect(p.formality).toBe(3);
  });
});

describe('outfitVanVerrijkt', () => {
  it('bouwt een engine-Outfit zonder verzonnen matchscore', () => {
    const v = maakOutfit('sleutel', ['p1']);
    const o = outfitVanVerrijkt(v, 'stylist');
    expect(o.id).toBe('sleutel');
    expect(o.title).toBe('Outfit sleutel');
    expect(o.explanation).toBe(v.reason);
    expect(o.occasion).toBe('work');
    expect(o.products.map((p) => p.id)).toEqual(['p1']);
    expect(o.structure).toEqual(['top']);
    expect(o.tags).toContain('stylist');
    expect(o.matchScore).toBeUndefined();
  });
});

describe('profielVanQuizAnswers', () => {
  it('bouwt een profiel uit de bestaande quiz-antwoorden', () => {
    const p = profielVanQuizAnswers(
      {
        gender: 'female',
        occasions: ['work', 'date', 'travel', 'party'],
        budget: { min: 30, max: 120 },
        fit: 'slim',
        prints: 'effen',
        neutrals: 'koel',
      },
      'sessie-x'
    );
    expect(p).not.toBeNull();
    expect(p!.gender).toBe('female');
    expect(p!.occasions).toEqual(['work', 'date', 'travel']);
    expect(p!.budget_min).toBe(30);
    expect(p!.budget_max).toBe(120);
    expect(p!.session_id).toBe('sessie-x');
    expect(p!.axes.silhouette).toEqual({ value: 'slim', confidence: 1 });
    expect(p!.axes.pattern).toEqual({ value: 'effen', confidence: 1 });
    expect(p!.axes.color_temp).toEqual({ value: 'koel', confidence: 1 });
    expect(p!.axes.formality.confidence).toBe(0);
    expect(p!.choices).toEqual([]);
  });

  it('valt terug op unisex, casual en 150 euro en kent de slider', () => {
    const p = profielVanQuizAnswers({ gender: 'non-binary', budgetRange: 80 }, 's');
    expect(p!.gender).toBe('unisex');
    expect(p!.occasions).toEqual(['casual']);
    expect(p!.budget_min).toBe(0);
    expect(p!.budget_max).toBe(80);
    expect(profielVanQuizAnswers({}, 's')!.budget_max).toBe(150);
  });

  it('zet de lichtheid uit quizstap 4 als as met zekerheid 1, in dezelfde vorm als de andere drie', () => {
    // Dezelfde drie waarden als LIGHTNESS in scripts/keten/tagging.ts: dat is
    // wat get_kandidaten met pa.lightness = a.as_waarde vergelijkt.
    for (const waarde of ['licht', 'medium', 'donker']) {
      const p = profielVanQuizAnswers({ gender: 'female', lightness: waarde }, 's');
      expect(p!.axes.lightness).toEqual({ value: waarde, confidence: 1 });
    }
    // Hoofdletters en omringende spaties worden net als bij fit en prints genormaliseerd.
    expect(profielVanQuizAnswers({ lightness: ' Donker ' }, 's')!.axes.lightness).toEqual({
      value: 'donker',
      confidence: 1,
    });
  });

  it('laat de lichtheid leeg zonder antwoord of bij een waarde die de tagger niet kent', () => {
    const leeg = { value: null, confidence: 0 };
    expect(profielVanQuizAnswers({ gender: 'female' }, 's')!.axes.lightness).toEqual(leeg);
    // 'light' en 'dark' zijn de Engelse woorden die de tagger eerst teruggaf
    // en die tagging.ts nu naar licht en donker normaliseert; de quiz levert
    // ze nooit, dus ze horen geen as op te leveren.
    for (const vreemd of ['', ' ', 'light', 'dark', 'midden', 42, null, ['licht'], {}]) {
      expect(profielVanQuizAnswers({ gender: 'female', lightness: vreemd }, 's')!.axes.lightness).toEqual(leeg);
    }
  });

  it('draagt de lichtheid mee in de cache-sleutel: een andere lichtheid is een ander profiel', async () => {
    const basis = { gender: 'female', occasions: ['work'], budget: { min: 25, max: 100 }, fit: 'slim' };
    const licht = profielVanQuizAnswers({ ...basis, lightness: 'licht' }, 's1')!;
    const lichtOpnieuw = profielVanQuizAnswers({ ...basis, lightness: 'licht' }, 's2')!;
    const donker = profielVanQuizAnswers({ ...basis, lightness: 'donker' }, 's3')!;
    const zonder = profielVanQuizAnswers(basis, 's4')!;
    expect(await profileHash(licht)).toBe(await profileHash(lichtOpnieuw));
    expect(await profileHash(licht)).not.toBe(await profileHash(donker));
    expect(await profileHash(licht)).not.toBe(await profileHash(zonder));
  });

  it('laat het antwoord ook het noodpad bereiken: answersVanProfiel geeft de lichtheid aan engine v2', () => {
    // Zonder de vertaling in vanQuiz.ts kreeg het noodpad van de stylist-route
    // de lichtheid van de bezoeker nooit, terwijl de bestaande route
    // (outfitService.generateOutfits met de ruwe antwoorden) hem wel las.
    const p = profielVanQuizAnswers({ gender: 'male', fit: 'regular', lightness: 'donker' }, 's')!;
    expect(answersVanProfiel(p).lightness).toBe('donker');
  });

  it('geeft null zonder antwoorden', () => {
    expect(profielVanQuizAnswers(null as any, 's')).toBeNull();
  });
});

describe('filterNietWilProducten (afwijking 2, geval 1: geen treffer)', () => {
  it('laat een set ongemoeid als geen enkel product op de niet-wil-lijst staat', () => {
    const outfits = [maakOutfit('a', ['p1']), maakOutfit('b', ['p2'])];
    const { overgebleven, weggevallen } = filterNietWilProducten(outfits, new Set());
    expect(overgebleven).toEqual(outfits);
    expect(weggevallen).toBe(0);
  });
});

describe('filterNietWilProducten (afwijking 2, geval 2: treffer, genoeg blijft over)', () => {
  it('gooit alleen de outfit weg die het afgewezen product bevat', () => {
    const outfits = [maakOutfit('a', ['p1']), maakOutfit('b', ['p2']), maakOutfit('c', ['p3']), maakOutfit('d', ['p4'])];
    const { overgebleven, weggevallen } = filterNietWilProducten(outfits, new Set(['p4']));
    expect(overgebleven.map((o) => o.outfit_key)).toEqual(['a', 'b', 'c']);
    expect(weggevallen).toBe(1);
  });

  it('gooit de hele outfit weg, niet alleen het item, ook als de outfit meer items heeft', () => {
    const outfits = [maakOutfit('a', ['p1', 'p2'])];
    const { overgebleven, weggevallen } = filterNietWilProducten(outfits, new Set(['p2']));
    expect(overgebleven).toEqual([]);
    expect(weggevallen).toBe(1);
  });
});

describe('composeVoorProfiel: cache-hit zonder niet-wil-treffer', () => {
  it('geeft bron cache met latency_ms uit de gecachete rij (fix 4: geen model/tokens meer, die geeft keten_outfit_set niet meer aan anon)', async () => {
    const outfits = [maakOutfit('a', ['p1']), maakOutfit('b', ['p2']), maakOutfit('c', ['p3']), maakOutfit('d', ['p4'])];
    const { cfg } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [{ data: { outfits, latency_ms: 42 }, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.bron).toBe('cache');
    expect(resultaat.latency_ms).toBe(42);
    expect(resultaat.reden).toBeNull();
    expect(resultaat.weggevallenDoorNietWil).toBe(0);
    expect(resultaat.weggevallenDoorBudget).toBe(0);
    expect(resultaat.herkanstKandidaten).toBe(false);
    expect(resultaat.herkanstCache).toBe(false);
    expect(resultaat.outfits).toHaveLength(4);
    expect(resultaat).not.toHaveProperty('model');
    expect(resultaat).not.toHaveProperty('input_tokens');
    expect(resultaat).not.toHaveProperty('output_tokens');
  });
});

describe('composeVoorProfiel: geval 2 van afwijking 2, niet-wil-treffer maar genoeg blijft over', () => {
  it('blijft bron cache en meldt hoeveel outfits zijn weggevallen', async () => {
    const outfits = [
      maakOutfit('a', ['p1']),
      maakOutfit('b', ['p2']),
      maakOutfit('c', ['p3']),
      maakOutfit('d', ['p4']),
      maakOutfit('e', ['p5']),
    ];
    const { cfg } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [{ data: { outfits, latency_ms: 1 }, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel({ disliked_product_ids: ['p5'] }));

    expect(resultaat.bron).toBe('cache');
    expect(resultaat.weggevallenDoorNietWil).toBe(1);
    expect(resultaat.outfits.map((o) => o.outfit_key)).toEqual(['a', 'b', 'c', 'd']);
    expect(resultaat.outfits.length).toBeGreaterThanOrEqual(MIN_OUTFITS_NA_NIET_WIL_FILTER);
  });
});

describe('composeVoorProfiel: geval 3 van afwijking 2, te veel treffers', () => {
  it('behandelt het als een miss en draait engine v2 voor de hele set', async () => {
    const outfits = [
      maakOutfit('a', ['p1']),
      maakOutfit('b', ['p2']),
      maakOutfit('c', ['p3']),
      maakOutfit('d', ['p4']),
      maakOutfit('e', ['p5']),
    ];
    // Een kleine maar volledige kandidatenpool zodat fallbackV2 (engine v2)
    // zonder te crashen kan draaien; het punt van deze test is de routering
    // naar v2-fallback, niet de kwaliteit van de v2-outfits zelf.
    const kandidatenPool: Kandidaat[] = [
      maakKandidaat('t1', { category: 'top', attrs: maakAttrs({ category: 'top' }) }),
      maakKandidaat('t2', { category: 'top', attrs: maakAttrs({ category: 'top' }) }),
      maakKandidaat('b1', { category: 'bottom', attrs: maakAttrs({ category: 'bottom' }) }),
      maakKandidaat('b2', { category: 'bottom', attrs: maakAttrs({ category: 'bottom' }) }),
      maakKandidaat('f1', { category: 'footwear', attrs: maakAttrs({ category: 'footwear', shoe_type: 'sneaker' }) }),
      maakKandidaat('f2', { category: 'footwear', attrs: maakAttrs({ category: 'footwear', shoe_type: 'sneaker' }) }),
    ];
    const { cfg } = maakStubConfig({
      kandidaten: kandidatenPool,
      ketenOutfitSetAntwoorden: [{ data: { outfits, latency_ms: 1 }, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel({ disliked_product_ids: ['p4', 'p5'] }));

    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.weggevallenDoorNietWil).toBe(2);
    expect(resultaat.reden).toContain('3 van de 5');
    expect(resultaat.reden).toContain(String(MIN_OUTFITS_NA_NIET_WIL_FILTER));
  });
});

describe('composeVoorProfiel: cache-miss', () => {
  it('draait engine v2 en meldt de miss als reden', async () => {
    const { cfg } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [{ data: null, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.latency_ms).toBeNull();
    expect(resultaat.reden).toBe('geen gecachete set voor dit profiel (cache-miss)');
    expect(resultaat.herkanstKandidaten).toBe(false);
    expect(resultaat.herkanstCache).toBe(false);
  });
});

describe('composeVoorProfiel: keten_outfit_set, statement-timeout, een zichtbare herkansing', () => {
  it('herkanst een keer en meldt dat, ook als de herkansing lukt', async () => {
    const outfits = [maakOutfit('a', ['p1']), maakOutfit('b', ['p2']), maakOutfit('c', ['p3']), maakOutfit('d', ['p4'])];
    const { cfg, aantalKetenOutfitSetAanroepen } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [
        { data: null, error: { code: '57014', message: 'canceling statement due to statement timeout' } },
        { data: { outfits, latency_ms: 1 }, error: null },
      ],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.herkanstCache).toBe(true);
    expect(resultaat.herkanstKandidaten).toBe(false);
    expect(resultaat.bron).toBe('cache');
    expect(aantalKetenOutfitSetAanroepen()).toBe(2);
  });

  it('valt terug op v2 als ook de herkansing een statement-timeout geeft, zonder een tweede herkansing', async () => {
    const { cfg, aantalKetenOutfitSetAanroepen } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [
        { data: null, error: { code: '57014', message: 'canceling statement due to statement timeout' } },
        { data: null, error: { code: '57014', message: 'canceling statement due to statement timeout' } },
      ],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.herkanstCache).toBe(true);
    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toContain('keten_outfit_set');
    expect(aantalKetenOutfitSetAanroepen()).toBe(2);
  });

  it('herkanst niet op een andere fout dan een statement-timeout', async () => {
    const outfits = [maakOutfit('a', ['p1']), maakOutfit('b', ['p2']), maakOutfit('c', ['p3']), maakOutfit('d', ['p4'])];
    const { cfg, aantalKetenOutfitSetAanroepen } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [
        { data: null, error: { code: '42501', message: 'permission denied for function keten_outfit_set' } },
        // Zou nooit aangeroepen mogen worden: als de code hier per ongeluk
        // wel herkanst, geeft deze tweede canned rij bron 'cache' en faalt
        // de test op de verwachte v2-fallback hieronder.
        { data: { outfits, latency_ms: 1 }, error: null },
      ],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.herkanstCache).toBe(false);
    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toContain('permission denied');
    expect(aantalKetenOutfitSetAanroepen()).toBe(1);
  });
});

describe('composeVoorProfiel: get_kandidaten, statement-timeout, een zichtbare herkansing (fixronde 1)', () => {
  it('herkanst een keer en gaat daarna gewoon door', async () => {
    const { cfg, aantalGetKandidatenAanroepen } = maakStubConfig({
      kandidatenAntwoorden: [
        { data: null, error: { code: '57014', message: 'canceling statement due to statement timeout' } },
        { data: [kandidaat], error: null },
      ],
      ketenOutfitSetAntwoorden: [{ data: null, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.herkanstKandidaten).toBe(true);
    expect(aantalGetKandidatenAanroepen()).toBe(2);
    // De herkansing lukte, dus geen legeResultaat: de kandidaten zijn er en
    // de route vervolgt normaal (hier een cache-miss, dus v2-fallback).
    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toBe('geen gecachete set voor dit profiel (cache-miss)');
  });

  it('geeft een resultaat met reden en geen exception als ook de herkansing faalt, zonder een tweede herkansing', async () => {
    const { cfg, aantalGetKandidatenAanroepen } = maakStubConfig({
      kandidatenAntwoorden: [
        { data: null, error: { code: '57014', message: 'canceling statement due to statement timeout' } },
        { data: null, error: { code: '57014', message: 'canceling statement due to statement timeout' } },
      ],
      ketenOutfitSetAntwoorden: [{ data: null, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.herkanstKandidaten).toBe(true);
    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toContain('get_kandidaten');
    expect(resultaat.kandidaten).toEqual([]);
    expect(resultaat.outfits).toEqual([]);
    expect(aantalGetKandidatenAanroepen()).toBe(2);
  });

  it('herkanst niet op een andere fout dan een statement-timeout', async () => {
    const { cfg, aantalGetKandidatenAanroepen } = maakStubConfig({
      kandidatenAntwoorden: [{ data: null, error: { code: '42501', message: 'permission denied for function get_kandidaten' } }],
      ketenOutfitSetAntwoorden: [{ data: null, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.herkanstKandidaten).toBe(false);
    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toContain('permission denied');
    expect(aantalGetKandidatenAanroepen()).toBe(1);
  });
});

describe('composeVoorProfiel: nul kandidaten is geen storing (fixronde 1)', () => {
  it('geeft een resultaat met reden terug in plaats van te gooien', async () => {
    const { cfg } = maakStubConfig({
      kandidaten: [],
      ketenOutfitSetAntwoorden: [{ data: null, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toContain('get_kandidaten gaf nul kandidaten');
    expect(resultaat.herkanstKandidaten).toBe(false);
    expect(resultaat.kandidaten).toEqual([]);
    expect(resultaat.outfits).toEqual([]);
    expect(resultaat.engineOutfits).toEqual([]);
  });
});

describe('filterBuitenBudgetProducten (fix 1, eindreview plan 3)', () => {
  it('laat een set ongemoeid als alles binnen budget valt', () => {
    const outfits = [maakOutfitMetPrijs('a', [['p1', 50]]), maakOutfitMetPrijs('b', [['p2', 80]])];
    const { overgebleven, weggevallen } = filterBuitenBudgetProducten(outfits, 25, 100);
    expect(overgebleven).toEqual(outfits);
    expect(weggevallen).toBe(0);
  });

  it('gooit een outfit weg met een item ONDER het budgetminimum', () => {
    const outfits = [maakOutfitMetPrijs('a', [['p1', 50]]), maakOutfitMetPrijs('b', [['p2', 10]])];
    const { overgebleven, weggevallen } = filterBuitenBudgetProducten(outfits, 25, 100);
    expect(overgebleven.map((o) => o.outfit_key)).toEqual(['a']);
    expect(weggevallen).toBe(1);
  });

  it('gooit een outfit weg met een item BOVEN het budgetmaximum', () => {
    const outfits = [maakOutfitMetPrijs('a', [['p1', 50]]), maakOutfitMetPrijs('b', [['p2', 250]])];
    const { overgebleven, weggevallen } = filterBuitenBudgetProducten(outfits, 25, 100);
    expect(overgebleven.map((o) => o.outfit_key)).toEqual(['a']);
    expect(weggevallen).toBe(1);
  });

  it('grenswaarden (exact budget_min en budget_max) blijven binnen budget', () => {
    const outfits = [maakOutfitMetPrijs('a', [['p1', 25]]), maakOutfitMetPrijs('b', [['p2', 100]])];
    const { overgebleven, weggevallen } = filterBuitenBudgetProducten(outfits, 25, 100);
    expect(overgebleven).toEqual(outfits);
    expect(weggevallen).toBe(0);
  });
});

describe('composeVoorProfiel: fix 1 (eindreview plan 3), budget van de LEZENDE bezoeker hertoetst op een cache-hit', () => {
  it('blijft bron cache maar gooit de outfit met een item onder het budgetminimum weg', async () => {
    const outfits = [
      maakOutfitMetPrijs('a', [['p1', 60]]),
      maakOutfitMetPrijs('b', [['p2', 60]]),
      maakOutfitMetPrijs('c', [['p3', 60]]),
      maakOutfitMetPrijs('d', [['p4', 60]]),
      maakOutfitMetPrijs('e', [['p5', 10]]), // onder budget_min (25)
    ];
    const { cfg } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [{ data: { outfits, latency_ms: 1 }, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel({ budget_min: 25, budget_max: 100 }));

    expect(resultaat.bron).toBe('cache');
    expect(resultaat.outfits.map((o) => o.outfit_key)).toEqual(['a', 'b', 'c', 'd']);
    expect(resultaat.weggevallenDoorBudget).toBe(1);
    expect(resultaat.weggevallenDoorNietWil).toBe(0);
  });

  it('blijft bron cache maar gooit de outfit met een item boven het budgetmaximum weg', async () => {
    const outfits = [
      maakOutfitMetPrijs('a', [['p1', 60]]),
      maakOutfitMetPrijs('b', [['p2', 60]]),
      maakOutfitMetPrijs('c', [['p3', 60]]),
      maakOutfitMetPrijs('d', [['p4', 60]]),
      maakOutfitMetPrijs('e', [['p5', 250]]), // boven budget_max (100)
    ];
    const { cfg } = maakStubConfig({
      kandidaten: [kandidaat],
      ketenOutfitSetAntwoorden: [{ data: { outfits, latency_ms: 1 }, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel({ budget_min: 25, budget_max: 100 }));

    expect(resultaat.bron).toBe('cache');
    expect(resultaat.outfits.map((o) => o.outfit_key)).toEqual(['a', 'b', 'c', 'd']);
    expect(resultaat.weggevallenDoorBudget).toBe(1);
  });

  it('valt terug op v2 als er na het budgetfilter te weinig outfits overblijven', async () => {
    const outfits = [
      maakOutfitMetPrijs('a', [['p1', 60]]),
      maakOutfitMetPrijs('b', [['p2', 250]]),
      maakOutfitMetPrijs('c', [['p3', 250]]),
      maakOutfitMetPrijs('d', [['p4', 250]]),
    ];
    // Zelfde minimale, volledige kandidatenpool als de v2-fallback-test
    // hierboven, zodat fallbackV2 zonder te crashen kan draaien.
    const kandidatenPool: Kandidaat[] = [
      maakKandidaat('t1', { category: 'top', attrs: maakAttrs({ category: 'top' }) }),
      maakKandidaat('b1', { category: 'bottom', attrs: maakAttrs({ category: 'bottom' }) }),
      maakKandidaat('f1', { category: 'footwear', attrs: maakAttrs({ category: 'footwear', shoe_type: 'sneaker' }) }),
    ];
    const { cfg } = maakStubConfig({
      kandidaten: kandidatenPool,
      ketenOutfitSetAntwoorden: [{ data: { outfits, latency_ms: 1 }, error: null }],
    });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel({ budget_min: 25, budget_max: 100 }));

    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.weggevallenDoorBudget).toBe(3);
    expect(resultaat.reden).toContain('buiten budget');
  });
});

describe('composeVoorProfiel: fix 5 (eindreview plan 3), profileHash mag niet meer gooien', () => {
  it('geeft een resultaat met reden terug in plaats van een exception als profileHash onverwacht faalt', async () => {
    vi.mocked(profileHash).mockRejectedValueOnce(new Error('crypto.subtle ontbreekt'));
    const { cfg } = maakStubConfig({ kandidaten: [kandidaat], ketenOutfitSetAntwoorden: [{ data: null, error: null }] });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toContain('profileHash faalde onverwacht');
    expect(resultaat.reden).toContain('crypto.subtle ontbreekt');
    expect(resultaat.outfits).toEqual([]);
    expect(resultaat.kandidaten).toEqual([]);
  });
});

describe('composeVoorProfiel: fix 5 (eindreview plan 3), de v2-fallback zelf mag niet meer gooien', () => {
  it('geeft een resultaat met reden terug in plaats van een exception als fallbackV2 (runEngineV2) onverwacht faalt', async () => {
    vi.mocked(runEngineV2).mockImplementationOnce(() => {
      throw new Error('engine v2 kapot');
    });
    const { cfg } = maakStubConfig({ kandidaten: [kandidaat], ketenOutfitSetAntwoorden: [{ data: null, error: null }] });

    const resultaat = await composeVoorProfiel(cfg, maakProfiel());

    expect(resultaat.bron).toBe('v2-fallback');
    expect(resultaat.reden).toContain('v2-fallback faalde onverwacht');
    expect(resultaat.reden).toContain('engine v2 kapot');
    // De oorspronkelijke reden (hier: cache-miss) blijft zichtbaar in de tekst.
    expect(resultaat.reden).toContain('cache-miss');
    expect(resultaat.outfits).toEqual([]);
  });
});
