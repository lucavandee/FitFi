import { describe, expect, it } from 'vitest';
import { normaliseerProfiel, profileHash } from '../profileHash';
import { legeAssen, type TasteProfileInput } from '../types';

const basis: TasteProfileInput = {
  user_id: null,
  session_id: 'sessie-1',
  gender: 'male',
  occasions: ['work', 'casual'],
  budget_min: 50,
  budget_max: 150,
  nogo_product_ids: ['b', 'a'],
  choices: [
    { pair_id: 'p2', chosen_set_id: 'x', rejected_set_id: 'y', axis: 'formality' },
    { pair_id: 'p1', chosen_set_id: 'q', rejected_set_id: 'r', axis: 'pattern' },
  ],
  axes: {
    ...legeAssen(),
    formality: { value: 4, confidence: 0.6 },
    pattern: { value: 'solid', confidence: 0.5 },
  },
  liked_product_ids: ['zzz'],
  disliked_product_ids: ['b', 'a'],
};

describe('normaliseerProfiel (amendement 27 september bij spec 5.2.1, herzien op 1 oktober)', () => {
  it('bouwt de sleutel op uit gender, gesorteerde occasions, prijsband en assen', () => {
    // Oude verwachting was 'male|casual,work|50|150|a,b|p1:q,p2:x': budget als
    // twee losse getallen, nogo-ids en ruwe keuzes rechtstreeks in de
    // sleutel. Die drie maakten vrijwel elke bezoeker uniek (zie het
    // bestandshoofd van profileHash.ts) en zijn vervangen door een prijsband
    // en de afgeleide assen; nogo-ids zijn helemaal uit de sleutel geschrapt.
    // budget_min 50, budget_max 150 -> midden 100 -> valt op de grens naar
    // '100tot200' (midden < 200 is waar, midden < 100 is onwaar).
    // Tot 1 oktober stond hier per as ook de zekerheid in (':0.5' achter
    // formality en pattern). Die is eruit: zie het volgende blok.
    expect(normaliseerProfiel(basis)).toBe(
      'male|casual,work|100tot200|formality:4,pattern:solid',
    );
  });

  it('is onafhankelijk van de volgorde van occasions', () => {
    // Oude test draaide ook nogo_product_ids en choices om om dezelfde
    // hash aan te tonen; die twee doen niet meer mee aan de sleutel, dus
    // alleen de volgorde van occasions is hier nog relevant.
    const gedraaid: TasteProfileInput = { ...basis, occasions: ['casual', 'work'] };
    expect(normaliseerProfiel(gedraaid)).toBe(normaliseerProfiel(basis));
  });

  it('neemt session_id, liked/disliked ids, nogo-ids en de ruwe keuzes niet mee', () => {
    // Oude test zette hier juist axes op een andere waarde om te bewijzen
    // dat axes niet meetellen. Dat is nu omgedraaid: axes tellen wél mee
    // (punt 5 van het amendement), dus die zijn hier weg, en
    // nogo_product_ids plus choices zijn toegevoegd, want die zijn nieuw uit
    // de sleutel gehaald.
    const anders: TasteProfileInput = {
      ...basis,
      session_id: 'sessie-2',
      liked_product_ids: [],
      disliked_product_ids: [],
      nogo_product_ids: ['x', 'y', 'z', 'compleet-anders'],
      choices: [
        { pair_id: 'p9', chosen_set_id: 'zzz', rejected_set_id: 'yyy', axis: 'shoe_type' },
      ],
    };
    expect(normaliseerProfiel(anders)).toBe(normaliseerProfiel(basis));
  });

  describe('prijsband: bucketen op het midden van budget_min/budget_max', () => {
    it('geeft dezelfde hash voor budgetten binnen dezelfde band (45-95 en 55-99)', () => {
      // Oude test ('verandert bij een ander budget', budget_max 150 -> 200)
      // bewees precies het probleem dat dit amendement oplost: elk ander
      // getal gaf een andere sleutel. Nu telt alleen de band waarin het
      // midden valt.
      const a: TasteProfileInput = { ...basis, budget_min: 45, budget_max: 95 }; // midden 70
      const b: TasteProfileInput = { ...basis, budget_min: 55, budget_max: 99 }; // midden 77
      expect(normaliseerProfiel(a)).toBe(normaliseerProfiel(b));
    });

    it('geeft een andere hash zodra het midden in een andere band valt', () => {
      const onderBand: TasteProfileInput = { ...basis, budget_min: 40, budget_max: 60 }; // midden 50 -> 50tot100
      const bovenBand: TasteProfileInput = { ...basis, budget_min: 140, budget_max: 260 }; // midden 200 -> boven200
      expect(normaliseerProfiel(onderBand)).not.toBe(normaliseerProfiel(bovenBand));
    });
  });

  describe('nogo_product_ids: uit de sleutel, filter hoort op het gelezen resultaat (taak 7)', () => {
    it('geeft dezelfde hash als alleen nogo_product_ids verschilt', () => {
      const anders: TasteProfileInput = {
        ...basis,
        nogo_product_ids: ['compleet-anders-1', 'compleet-anders-2'],
      };
      expect(normaliseerProfiel(anders)).toBe(normaliseerProfiel(basis));
    });
  });

  describe('axes in plaats van de ruwe choices', () => {
    it('geeft dezelfde hash bij andere choices zolang de axes gelijk blijven', () => {
      const anders: TasteProfileInput = {
        ...basis,
        choices: [
          { pair_id: 'p7', chosen_set_id: 'a', rejected_set_id: 'b', axis: 'silhouette' },
        ],
      };
      expect(normaliseerProfiel(anders)).toBe(normaliseerProfiel(basis));
    });

    it('geeft een andere hash bij een andere as-waarde', () => {
      const anders: TasteProfileInput = {
        ...basis,
        axes: { ...basis.axes, formality: { value: 2, confidence: 0.6 } },
      };
      expect(normaliseerProfiel(anders)).not.toBe(normaliseerProfiel(basis));
    });

    it('laat assen zonder waarde weg uit de sleutel, ongeacht hun confidence', () => {
      const metLegeAs: TasteProfileInput = {
        ...basis,
        axes: { ...basis.axes, shoe_type: { value: null, confidence: 0.9 } },
      };
      expect(normaliseerProfiel(metLegeAs)).toBe(normaliseerProfiel(basis));
    });

    describe('zekerheid: telt niet mee in de sleutel (herziening 1 oktober 2026)', () => {
      // Dit blok verving 'confidence: afgerond op stappen van 0,25'. Het
      // raster was een van twee oorzaken van een cache die een echte bezoeker
      // nooit raakte: de quiz zet de zekerheid op 1, het vulscript nam
      // 0,5 tot 0,9 uit een persona-tabel, en op het raster zijn dat andere
      // stappen. De zekerheid is invoer voor de compositie (prompt en
      // get_kandidaten), geen identiteit van het profiel. De bezoeker-tegen-
      // vulscript-vergelijking staat in
      // scripts/keten/__tests__/stylist-profielen.test.ts.
      const metZekerheid = (confidence: number): TasteProfileInput => ({
        ...basis,
        axes: { ...basis.axes, formality: { value: 4, confidence } },
      });

      it('geeft dezelfde sleutel bij elke zekerheid op dezelfde as', () => {
        // 0,6 en 0,7 vielen op het oude raster nog in twee stappen (0,5 en
        // 0,75); 0,1 en 1 lagen er ver uit elkaar.
        for (const confidence of [0.1, 0.5, 0.6, 0.7, 0.75, 1]) {
          expect(normaliseerProfiel(metZekerheid(confidence))).toBe(normaliseerProfiel(basis));
        }
      });

      it('geeft wel een andere sleutel zodra de waarde van de as verandert', () => {
        // De zekerheid doet niet mee, de waarde nog steeds.
        const anders: TasteProfileInput = {
          ...basis,
          axes: { ...basis.axes, formality: { value: 3, confidence: 0.6 } },
        };
        expect(normaliseerProfiel(anders)).not.toBe(normaliseerProfiel(basis));
      });
    });
  });
});

describe('profileHash', () => {
  it('is 64 hex-tekens en gelijk voor gelijke genormaliseerde invoer', async () => {
    const a = await profileHash(basis);
    const b = await profileHash({ ...basis, session_id: 'iemand-anders' });
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(b);
  });

  it('verandert bij een andere as-waarde', async () => {
    const anders = await profileHash({
      ...basis,
      axes: { ...basis.axes, pattern: { value: 'print', confidence: 0.5 } },
    });
    expect(anders).not.toBe(await profileHash(basis));
  });

  it('blijft gelijk bij een andere zekerheid op een as', async () => {
    const zekerder = await profileHash({
      ...basis,
      axes: { ...basis.axes, pattern: { value: 'solid', confidence: 1 } },
    });
    expect(zekerder).toBe(await profileHash(basis));
  });
});
