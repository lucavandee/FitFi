/**
 * Welk palet toont het rapport voor het voorbeeldprofiel, per codepad?
 *
 * De kleurpiek op de landingspagina toont de kleuren die het rapport van het
 * voorbeeldprofiel (src/content/voorbeeldprofiel.ts) onder "Draag deze
 * kleuren" zet: getColorPalette(subSeason || season).doColors, in die
 * volgorde (ColorPaletteSection.tsx). Welk palet dat is, hangt af van het pad
 * dat de quiz bij het afronden neemt (OnboardingFlowPage.tsx, handleSubmit):
 *
 * - Hoofdpad: StyleProfileGenerator.generateStyleProfile. Zijn er swipes te
 *   lezen, dan komt de temperatuur uit de gelikete foto's, anders uit stap 3.
 *   Dit pad zet geen subseizoen.
 * - Terugval, bij een fout of na 20 seconden: computeResult. Dat zet wel een
 *   subseizoen.
 *
 * Het rapport leest het profiel terug dat de quiz in ff_color_profile zette
 * (EnhancedResultsPage.tsx) en rekent alleen opnieuw als dat ontbreekt.
 *
 * Twee feiten uit de database (8 oktober 2026, alleen gelezen) bepalen welke
 * tak van het hoofdpad een bezoeker krijgt:
 *
 * - style_swipes heeft RLS aan en alleen policies voor de rol authenticated.
 *   Een anonieme bezoeker kan geen swipe wegschrijven en geen swipe lezen; de
 *   tabel bevat geen enkele swipe zonder user_id. Wie zonder account de quiz
 *   doet, krijgt het hoofdpad zonder swipes. Wie eerst een account maakt
 *   (RegisterPage stuurt daarna naar /onboarding) of ingelogd de quiz
 *   overdoet, krijgt het hoofdpad met swipes.
 * - De 42 actieve damesfoto's in mood_photos hebben hexcodes in
 *   dominant_colors, de 44 herenfoto's namen ("beige", "grijs").
 *   determineTemperature in styleProfileGenerator.ts zoekt naar namen. Voor
 *   een vrouw met leesbare swipes wordt de temperatuur dus neutraal, welke
 *   foto's ze ook liket.
 *
 * Deze test beschrijft wat de code nu doet, ook waar dat afwijkt van wat het
 * plan verwachtte. Verandert een uitkomst, dan faalt hij, en dan moeten de
 * kleurpiek en zijn copy mee.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  tabellen: {} as Record<string, Array<Record<string, unknown>>>,
}));

// Nabootsing van de supabase-js-querybouwer voor de drie tabellen die het
// hoofdpad leest: style_profiles (foto-analyse), style_swipes en mood_photos.
// Filters werken op een kopie; await en maybeSingle geven { data, error }.
vi.mock('@/lib/supabaseClient', () => {
  const bouwer = (rijen: Array<Record<string, unknown>>) => {
    let uit = [...rijen];
    const q = {
      select: () => q,
      eq: (kolom: string, waarde: unknown) => {
        uit = uit.filter((r) => r[kolom] === waarde);
        return q;
      },
      in: (kolom: string, waarden: unknown[]) => {
        uit = uit.filter((r) => waarden.includes(r[kolom]));
        return q;
      },
      order: () => q,
      limit: (n: number) => {
        uit = uit.slice(0, n);
        return q;
      },
      maybeSingle: async () => ({ data: uit[0] ?? null, error: null }),
      then: (klaar: (w: unknown) => unknown, mis?: (f: unknown) => unknown) =>
        Promise.resolve({ data: uit, error: null }).then(klaar, mis),
    };
    return q;
  };
  return {
    supabase: () => ({ from: (tabel: string) => bouwer(db.tabellen[tabel] ?? []) }),
  };
});

import { VOORBEELDPROFIEL } from '../voorbeeldprofiel';
import {
  StyleProfileGenerator,
  type QuizColorAnswers,
} from '@/services/styleProfile/styleProfileGenerator';
import { computeResult } from '@/lib/quiz/logic';
import {
  COLOR_PALETTES,
  SUB_SEASON_PALETTES,
  getColorPalette,
  type ColorSwatch,
} from '@/data/colorPalettes';
import { quizSteps, getStyleOptionsForGender } from '@/data/quizSteps';
import { isUuid } from '@/utils/sessionId';

// De vijf gelikete foto's uit mood_photos, gelezen op 8 oktober 2026 met
// SELECT ... FROM mood_photos WHERE id IN (220, 221, 237, 240, 241).
// image_url is ingekort tot het pad; dit codepad leest hem niet.
const MOODFOTOS = [
  {
    id: 220,
    image_url: 'mood-photos/female/classic_female_02.webp',
    gender: 'female',
    active: true,
    display_order: 104,
    mood_tags: ['classic', 'refined', 'heritage', 'graceful'],
    archetype_weights: { ATHLETIC: 5, AVANT_GARDE: 15, BUSINESS: 55, CLASSIC: 90, MINIMALIST: 50, SMART_CASUAL: 40, STREETWEAR: 5 },
    dominant_colors: ['#D4A574', '#1C1C1C', '#F0E8DD', '#6B5B4E'],
    style_attributes: { boldness: 0.25, comfort: 0.55, formality: 0.7, materials: ['tweed', 'cotton', 'pearl'], silhouette: 'A-line', structure: 0.75, vibe: 'ladylike' },
  },
  {
    id: 221,
    image_url: 'mood-photos/female/classic_female_03.webp',
    gender: 'female',
    active: true,
    display_order: 105,
    mood_tags: ['classic', 'warm', 'autumnal', 'structured'],
    archetype_weights: { ATHLETIC: 5, AVANT_GARDE: 10, BUSINESS: 45, CLASSIC: 87, MINIMALIST: 40, SMART_CASUAL: 55, STREETWEAR: 10 },
    dominant_colors: ['#8B4513', '#F5DEB3', '#2F4F4F', '#D2B48C'],
    style_attributes: { boldness: 0.3, comfort: 0.6, formality: 0.65, materials: ['cashmere', 'suede', 'knit'], silhouette: 'wrap', structure: 0.7, vibe: 'cultivated' },
  },
  {
    id: 237,
    image_url: 'mood-photos/female/minimalist_female_04.webp',
    gender: 'female',
    active: true,
    display_order: 121,
    mood_tags: ['minimalist', 'understated', 'chic', 'effortless'],
    archetype_weights: { ATHLETIC: 8, AVANT_GARDE: 15, BUSINESS: 30, CLASSIC: 40, MINIMALIST: 92, SMART_CASUAL: 35, STREETWEAR: 10 },
    dominant_colors: ['#D4C5B0', '#FFFFFF', '#B8A99A', '#E8DDD0'],
    style_attributes: { boldness: 0.15, comfort: 0.8, formality: 0.4, materials: ['linen', 'cotton', 'ribbed knit'], silhouette: 'relaxed', structure: 0.35, vibe: 'quiet luxury' },
  },
  {
    id: 240,
    image_url: 'mood-photos/female/classic_female_04.webp',
    gender: 'female',
    active: true,
    display_order: 124,
    mood_tags: ['classic', 'elegant', 'timeless', 'polished'],
    archetype_weights: { ATHLETIC: 3, AVANT_GARDE: 10, BUSINESS: 55, CLASSIC: 90, MINIMALIST: 40, SMART_CASUAL: 45, STREETWEAR: 5 },
    dominant_colors: ['#C4956A', '#2B3A4E', '#4D4D4D', '#8B6F4E'],
    style_attributes: { boldness: 0.2, comfort: 0.45, formality: 0.7, materials: ['wool', 'cashmere', 'leather'], silhouette: 'fitted', structure: 0.65, vibe: 'old money' },
  },
  {
    id: 241,
    image_url: 'mood-photos/female/classic_female_05.webp',
    gender: 'female',
    active: true,
    display_order: 125,
    mood_tags: ['classic', 'heritage', 'refined', 'ladylike'],
    archetype_weights: { ATHLETIC: 3, AVANT_GARDE: 8, BUSINESS: 50, CLASSIC: 92, MINIMALIST: 35, SMART_CASUAL: 48, STREETWEAR: 5 },
    dominant_colors: ['#F5F0E8', '#6B2D3E', '#8B7355', '#C4A882'],
    style_attributes: { boldness: 0.18, comfort: 0.5, formality: 0.65, materials: ['silk', 'wool plaid', 'leather'], silhouette: 'A-line', structure: 0.6, vibe: 'preppy heritage' },
  },
];

// Wat het rapport onder "Draag deze kleuren" toont, per palet, in volgorde.
const HERFST = [
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Cognac', hex: '#A0785A' },
  { name: 'Olijfgroen', hex: '#6E7A45' },
  { name: 'Terracotta', hex: '#C17767' },
  { name: 'Ivory', hex: '#FAF0E6' },
  { name: 'Greige', hex: '#C9B8A9' },
];
const ZOMER = [
  { name: 'Soft blauw', hex: '#85C1E2' },
  { name: 'Eucalyptus', hex: '#7B8A8B' },
  { name: 'Zachte lavendel', hex: '#A3B1C1' },
  { name: 'Soft white', hex: '#FDFEFE' },
  { name: 'Pearl grey', hex: '#D5D8DC' },
  { name: 'Grijs-blauw', hex: '#85929E' },
];
const ZACHT_HERFST = [
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Warm taupe', hex: '#9C7A5E' },
  { name: 'Ivory', hex: '#FAF0E6' },
  { name: 'Greige', hex: '#C9B8A9' },
];

/** Zoals ColorPaletteSection.tsx het blok vult. */
function draagDezeKleuren(profiel: { season: string; subSeason?: string }) {
  const palet = getColorPalette(profiel.subSeason || profiel.season);
  return palet?.doColors.map(({ name, hex }) => ({ name, hex }));
}

// QuizColorAnswers typeert neutrals als boolean, terwijl de quiz 'warm'
// schrijft (stap 3). OnboardingFlowPage geeft de antwoorden daarom als any
// door; hier dezelfde omweg, met een kopie zodat niets het profiel muteert.
function antwoorden(): QuizColorAnswers {
  return structuredClone(VOORBEELDPROFIEL.antwoorden) as unknown as QuizColorAnswers;
}

function geliketeSwipes(eigenaar: { user_id: string | null; session_id: string | null }) {
  return VOORBEELDPROFIEL.swipes.geliket.map((foto, i) => ({
    id: i + 1,
    ...eigenaar,
    mood_photo_id: foto.id,
    swipe_direction: 'right',
    response_time_ms: 1200,
  }));
}

beforeEach(() => {
  db.tabellen = {};
  // De generator logt elke stap; dat zegt hier niets.
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('voorbeeldprofiel: de antwoorden bestaan in de quiz', () => {
  const { antwoorden: a } = VOORBEELDPROFIEL;

  it('elke antwoordwaarde is een optie van zijn stap in quizSteps.ts', () => {
    const keuzeVelden = Object.keys(a).filter((v) => v !== 'budget' && v !== 'budgetRange');
    for (const veld of keuzeVelden) {
      const stap = quizSteps.find((s) => s.field === veld);
      expect(stap, `geen stap schrijft ${veld}`).toBeDefined();
      // Stap 2 heeft geen vaste opties; die hangen af van stap 1.
      const opties = veld === 'stylePreferences' ? getStyleOptionsForGender(a.gender) : stap!.options ?? [];
      const toegestaan = opties.map((o) => o.value);
      const gekozen = ([] as string[]).concat(a[veld as keyof typeof a] as string | string[]);
      expect(gekozen.length, `${veld} is leeg`).toBeGreaterThan(0);
      for (const waarde of gekozen) {
        expect(toegestaan, `${veld}: '${waarde}' is geen optie`).toContain(waarde);
      }
    }
  });

  it('het budget ligt op de schaal van stap 12, en budgetRange is het maximum', () => {
    const stap = quizSteps.find((s) => s.type === 'budget-range')!;
    expect(stap.field).toBe('budget');
    const { min, max } = a.budget;
    expect(min).toBeGreaterThanOrEqual(stap.min!);
    expect(max).toBeLessThanOrEqual(stap.max!);
    expect(min % stap.step!).toBe(0);
    expect(max % stap.step!).toBe(0);
    expect(a.budgetRange).toBe(max);
  });

  it('de sessie-id is een uuid, zoals style_swipes.session_id eist', () => {
    expect(isUuid(VOORBEELDPROFIEL.sessieId)).toBe(true);
  });

  it("het swipepatroon liket vijf verschillende damesfoto's", () => {
    const ids = VOORBEELDPROFIEL.swipes.geliket.map((f) => f.id);
    expect(new Set(ids).size).toBe(5);
    for (const foto of VOORBEELDPROFIEL.swipes.geliket) {
      const rij = MOODFOTOS.find((m) => m.id === foto.id);
      expect(rij?.image_url.endsWith(foto.bestand), `${foto.id} hoort bij ${foto.bestand}`).toBe(true);
      expect(rij?.gender).toBe('female');
    }
  });
});

describe('voorbeeldprofiel: het palet onder "Draag deze kleuren", per codepad', () => {
  it('hoofdpad zonder account, zoals "Begin gratis" in de hero: herfst, zes kleuren', async () => {
    // RLS laat een anonieme bezoeker geen swipe schrijven of lezen.
    db.tabellen = { style_swipes: [], mood_photos: MOODFOTOS, style_profiles: [] };

    const uitkomst = await StyleProfileGenerator.generateStyleProfile(
      antwoorden(),
      undefined,
      VOORBEELDPROFIEL.sessieId
    );

    expect(uitkomst.dataSource).toBe('quiz_only');
    expect(uitkomst.colorProfile).toMatchObject({
      temperature: 'warm',
      value: 'medium',
      contrast: 'laag',
      chroma: 'zacht',
      season: 'herfst',
      paletteName: 'Medium Warm Tonal',
    });
    expect(uitkomst.colorProfile.subSeason).toBeUndefined();
    expect(draagDezeKleuren(uitkomst.colorProfile)).toEqual(HERFST);
    expect(getColorPalette('herfst')?.description).toBe('Warme, aardse tinten met rijke diepte.');
  });

  it.each([
    {
      route: 'met account, swipes onder user_id',
      userId: 'voorbeeld-gebruiker',
      sessionId: undefined,
      swipes: geliketeSwipes({ user_id: 'voorbeeld-gebruiker', session_id: null }),
    },
    {
      route: 'zonder account, als RLS ze doorliet',
      userId: undefined,
      sessionId: VOORBEELDPROFIEL.sessieId,
      swipes: geliketeSwipes({ user_id: null, session_id: VOORBEELDPROFIEL.sessieId }),
    },
  ])('hoofdpad met leesbare swipes, $route: zomer (bekende afwijking)', async ({ userId, sessionId, swipes }) => {
    db.tabellen = { style_swipes: swipes, mood_photos: MOODFOTOS, style_profiles: [] };

    const uitkomst = await StyleProfileGenerator.generateStyleProfile(antwoorden(), userId, sessionId);

    // De oorzaak: alleen hexcodes, en determineTemperature zoekt namen.
    const kleuren = MOODFOTOS.flatMap((f) => f.dominant_colors);
    expect(kleuren.every((k) => /^#[0-9A-F]{6}$/i.test(k))).toBe(true);

    expect(uitkomst.dataSource).toBe('quiz+swipes');
    expect(uitkomst.colorProfile).toMatchObject({
      temperature: 'neutraal',
      value: 'medium',
      contrast: 'laag',
      chroma: 'gemiddeld',
      season: 'zomer',
      paletteName: 'Medium Neutral Tonal',
    });
    expect(uitkomst.colorProfile.subSeason).toBeUndefined();
    expect(draagDezeKleuren(uitkomst.colorProfile)).toEqual(ZOMER);
  });

  it('terugval computeResult, bij een fout of na 20 s: zacht-herfst, vier kleuren (bekende afwijking)', () => {
    const { color } = computeResult(structuredClone(VOORBEELDPROFIEL.antwoorden));

    expect(color).toMatchObject({
      temperature: 'warm',
      value: 'medium',
      contrast: 'laag',
      chroma: 'zacht',
      season: 'herfst',
      subSeason: 'zacht-herfst',
      paletteName: 'Soft Autumn',
    });
    expect(draagDezeKleuren(color)).toEqual(ZACHT_HERFST);
  });
});

describe('paletdata: camel', () => {
  const paletten = [...Object.values(COLOR_PALETTES), ...Object.values(SUB_SEASON_PALETTES)];
  const alleStalen = (lijsten: Array<'colors' | 'doColors' | 'dontColors'>): ColorSwatch[] =>
    paletten.flatMap((p) => lijsten.flatMap((l) => p[l]));

  it('geen staal draagt nog #A85740, de terracotta van de knoppen', () => {
    const fout = alleStalen(['colors', 'doColors', 'dontColors']).filter(
      (s) => s.hex.toUpperCase() === '#A85740'
    );
    expect(fout).toEqual([]);
  });

  it('elke Camel om te dragen is #C19A6B, elke Licht camel #D4A574', () => {
    const teDragen = alleStalen(['colors', 'doColors']);
    const camel = teDragen.filter((s) => s.name === 'Camel');
    const lichtCamel = teDragen.filter((s) => s.name === 'Licht camel');
    expect(camel.length).toBeGreaterThan(0);
    expect(lichtCamel.length).toBeGreaterThan(0);
    expect(new Set(camel.map((s) => s.hex))).toEqual(new Set(['#C19A6B']));
    expect(new Set(lichtCamel.map((s) => s.hex))).toEqual(new Set(['#D4A574']));
  });
});
