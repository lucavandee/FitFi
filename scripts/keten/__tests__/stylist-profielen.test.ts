/**
 * Het bewijs dat de stylist-cache voor een echte bezoeker bereikbaar is.
 *
 * Op 1 oktober 2026 gaf hetzelfde voorkeurenprofiel een andere cache-sleutel,
 * afhankelijk van waar het vandaan kwam: een bezoeker uit de quiz kreeg
 * bf2a5dd4, het vulscript 5c6681c8, en alleen die laatste stond in de cache.
 * Het persona-harnas bewees zijn cache-hit tegen een profiel dat het zelf uit
 * STYLE_ASSEN bouwde, dus tegen zichzelf. Zo'n verschil laat zich stil zien
 * als "gewoon geen cache-hit": geen fout, geen lege uitvoer, alleen een cache
 * die nooit raakt terwijl elke vulronde wel sessiecapaciteit kost.
 *
 * Deze tests laten daarom twee HERKOMSTEN op dezelfde sleutel uitkomen:
 * - de bezoeker: quiz-antwoorden zoals de quiz ze opslaat, door de echte
 *   profielVanQuizAnswers (de functie die useOutfits.ts draait);
 * - het vulscript: standaardProfielen() uit stylist-profielen.ts, dat is wat
 *   het vulscript wegschrijft en waarop het sleutelt.
 *
 * De bezoekers staan hieronder met de hand uitgeschreven en zijn BEWUST niet
 * afgeleid van STYLE_ASSEN of van de code onder test: een test die zijn eigen
 * invoer uit de implementatie haalt, bewijst alleen dat die met zichzelf
 * overeenkomt. Verandert een persona in personas.ts, dan verandert zijn
 * sleutel, en een eerder gevulde rij staat dan onder een sleutel die niemand
 * nog raakt. Deze test gaat dan rood, en dat is de bedoeling.
 */
import { describe, expect, it } from 'vitest';
import { KETEN_PERSONAS, STYLE_ASSEN } from '../../../src/keten/personas';
import { normaliseerProfiel, profileHash } from '../../../src/keten/profileHash';
import { AS_NAMEN, legeAssen, type Assen, type TasteProfileInput } from '../../../src/keten/types';
import { profielVanQuizAnswers } from '../../../src/keten/vanQuiz';
import { standaardProfielen } from '../stylist-profielen';

/**
 * Wat de quiz per persona opslaat (src/data/quizSteps.ts): elke vraag die
 * vanQuiz.ts naar een as vertaalt. `lightness` (stap 4, verplicht) stond hier
 * al voordat vanQuiz.ts hem vertaalde, als kanarie. Op 1 oktober 2026 gingen
 * zeven van de elf tests hieronder rood op het moment dat die vertaling erbij
 * kwam, en daarna hoorde quizAntwoordenVanPersona het bijpassende antwoord van
 * de persona mee te geven. Vertaalt vanQuiz.ts ooit nog een vraag, voeg hem
 * dan eerst hier toe, zodat het weer zo gaat. Zie de noot bovenaan
 * stylist-profielen.ts.
 */
const BEZOEKERS: Record<string, Record<string, unknown>> = {
  'man klassiek': {
    gender: 'male',
    stylePreferences: ['classic'],
    occasions: ['work'],
    budget: { min: 50, max: 150 },
    fit: 'regular',
    neutrals: 'koel',
    lightness: 'donker',
    prints: 'effen',
  },
  'vrouw minimalistisch': {
    gender: 'female',
    stylePreferences: ['minimalist'],
    occasions: ['work', 'date'],
    budget: { min: 25, max: 100 },
    fit: 'slim',
    neutrals: 'neutraal',
    lightness: 'medium',
    prints: 'effen',
  },
  'man streetwear': {
    gender: 'male',
    stylePreferences: ['streetwear'],
    occasions: ['casual', 'party'],
    budget: { min: 25, max: 100 },
    fit: 'oversized',
    neutrals: 'koel',
    lightness: 'donker',
    prints: 'statement',
  },
  'vrouw romantisch': {
    gender: 'female',
    stylePreferences: ['romantic'],
    occasions: ['date', 'travel'],
    budget: { min: 25, max: 75 },
    fit: 'relaxed',
    neutrals: 'warm',
    lightness: 'licht',
    prints: 'subtiel',
  },
};

function bezoekerProfiel(naam: string, overrides: Record<string, unknown> = {}): TasteProfileInput {
  const profiel = profielVanQuizAnswers({ ...BEZOEKERS[naam], ...overrides }, `sessie-bezoeker-${naam}`);
  if (!profiel) throw new Error(`profielVanQuizAnswers gaf geen profiel voor "${naam}"`);
  return profiel;
}

function vulscriptProfiel(naam: string): TasteProfileInput {
  const gevonden = standaardProfielen().find((p) => p.naam === naam);
  if (!gevonden) throw new Error(`standaardProfielen() mist "${naam}"`);
  return gevonden.profiel;
}

function assenMetWaarde(p: TasteProfileInput): string[] {
  return AS_NAMEN.filter((as) => p.axes[as].value !== null);
}

describe('een bezoeker uit de quiz en het vulscript komen op dezelfde sleutel uit', () => {
  it('de meting van 1 oktober: female, work en date, 25 tot 100, slim, effen, neutraal, lichtheid medium', async () => {
    const bezoeker = bezoekerProfiel('vrouw minimalistisch');
    const vulscript = vulscriptProfiel('vrouw minimalistisch');

    // De sleutelstring zelf is hier alleen documentatie. Het bewijs zijn de
    // twee regels eronder: beide herkomsten komen op dezelfde uit. De
    // lichtheid staat er sinds de tweede fix van 1 oktober in; de bezoekerskant
    // van de meting zelf (bf2a5dd4, tegen 5c6681c8) had alleen slim, effen en
    // neutraal.
    expect(normaliseerProfiel(bezoeker)).toBe(
      'female|date,work|50tot100|color_temp:neutraal,lightness:medium,pattern:effen,silhouette:slim',
    );
    expect(normaliseerProfiel(vulscript)).toBe(normaliseerProfiel(bezoeker));
    expect(await profileHash(vulscript)).toBe(await profileHash(bezoeker));
  });

  it.each(Object.keys(BEZOEKERS))('%s', async (naam) => {
    const bezoeker = bezoekerProfiel(naam);
    const vulscript = vulscriptProfiel(naam);

    expect(await profileHash(vulscript)).toBe(await profileHash(bezoeker));
    // Niet alleen dezelfde sleutel: ook dezelfde invoer voor de compositie.
    // De zekerheid zit niet in de sleutel, maar de prompt en get_kandidaten
    // lezen hem wel, dus het vulscript hoort onder dezelfde zekerheid te
    // componeren als een bezoeker uit de quiz.
    expect(vulscript.axes).toEqual(bezoeker.axes);
  });

  it('de vier persona-namen en de bezoekers hierboven vallen samen', () => {
    // Anders slaat it.each hierboven een persona stilzwijgend over.
    expect(Object.keys(BEZOEKERS).sort()).toEqual(KETEN_PERSONAS.map((p) => p.naam).sort());
  });
});

describe('standaardProfielen', () => {
  it('geeft vijf profielen onder vijf verschillende sleutels', async () => {
    const profielen = standaardProfielen();
    expect(profielen.map((p) => p.naam)).toEqual([
      ...KETEN_PERSONAS.map((p) => p.naam),
      'vrouw minimalistisch (halve set)',
    ]);
    const hashes = await Promise.all(profielen.map((p) => profileHash(p.profiel)));
    expect(new Set(hashes).size).toBe(5);
  });

  it('draagt alleen assen die een bezoeker kan opgeven', () => {
    // Wat een bezoeker kan opgeven is wat profielVanQuizAnswers uit een
    // volledig ingevulde quiz maakt. De vier assen die hieronder staan zijn wat
    // vanQuiz.ts vandaag oplevert. Groeit die lijst, dan gaat deze regel rood
    // en hoort quizAntwoordenVanPersona mee te groeien: zie
    // stylist-profielen.ts. Formality en shoe_type vraagt de quiz niet.
    const mogelijk = assenMetWaarde(bezoekerProfiel('vrouw minimalistisch'));
    expect([...mogelijk].sort()).toEqual(['color_temp', 'lightness', 'pattern', 'silhouette']);
    for (const { naam, profiel } of standaardProfielen()) {
      for (const as of assenMetWaarde(profiel)) {
        expect(mogelijk, `${naam}: as ${as} komt niet uit een quiz-antwoord`).toContain(as);
      }
    }
  });

  it('het vijfde profiel is een bezoeker die "Mix van alles" kiest bij de prints', async () => {
    // `prints` is de enige quizvraag over een as die niet verplicht is, en
    // "gemengd" (Mix van alles) levert geen pattern-as op. Dat is een dunne
    // sleutel die een echte bezoeker vandaag kan produceren.
    const dun = vulscriptProfiel('vrouw minimalistisch (halve set)');
    const volledig = vulscriptProfiel('vrouw minimalistisch');
    expect(dun.axes.pattern.value).toBeNull();
    expect(dun.axes.silhouette).toEqual(volledig.axes.silhouette);
    expect(dun.axes.color_temp).toEqual(volledig.axes.color_temp);
    expect(dun.axes.lightness).toEqual(volledig.axes.lightness);

    const bezoeker = bezoekerProfiel('vrouw minimalistisch', { prints: 'gemengd' });
    expect(await profileHash(dun)).toBe(await profileHash(bezoeker));
  });
});

describe('wat de meting van 1 oktober liet zien', () => {
  /** Dezelfde waarden als STYLE_ASSEN, maar overal zekerheid 1, zoals een quiz-antwoord. */
  function metZekerheid1(assen: Partial<Assen>): Assen {
    const uit = legeAssen();
    for (const as of AS_NAMEN) {
      const w = assen[as];
      if (w && w.value !== null) uit[as] = { value: w.value, confidence: 1 };
    }
    return uit;
  }

  it('assen die geen bezoeker opgeeft maken de sleutel onbereikbaar, ook bij gelijke zekerheid', async () => {
    const bezoeker = bezoekerProfiel('vrouw minimalistisch');
    // Zoals het vulscript zijn profiel bouwde: zes assen uit de persona-tabel.
    const rijk: TasteProfileInput = { ...bezoeker, axes: { ...legeAssen(), ...STYLE_ASSEN.minimalist } };
    // En met de zekerheid gelijkgetrokken: dan blijft alleen het verschil in
    // assen over (formality en shoe_type; lightness gaf de quiz op 1 oktober
    // wel, maar vanQuiz.ts vertaalde hem nog niet), de tweede oorzaak.
    const rijkMetZekerheid1: TasteProfileInput = { ...bezoeker, axes: metZekerheid1(STYLE_ASSEN.minimalist) };

    expect(await profileHash(rijk)).not.toBe(await profileHash(bezoeker));
    expect(await profileHash(rijkMetZekerheid1)).not.toBe(await profileHash(bezoeker));
  });

  it('een verschil in zekerheid alleen maakt de sleutel niet meer onbereikbaar', async () => {
    // De eerste oorzaak: dezelfde assen, zekerheid 0,75 tegen 1.
    const bezoeker = bezoekerProfiel('vrouw minimalistisch');
    const onzekerder: TasteProfileInput = {
      ...bezoeker,
      axes: {
        ...bezoeker.axes,
        silhouette: { value: 'slim', confidence: 0.75 },
        color_temp: { value: 'neutraal', confidence: 0.75 },
        pattern: { value: 'effen', confidence: 1 },
      },
    };
    expect(await profileHash(onzekerder)).toBe(await profileHash(bezoeker));
  });
});
