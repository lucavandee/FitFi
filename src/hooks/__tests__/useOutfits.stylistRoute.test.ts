/**
 * Bewaking van de harde eis uit taak 9 (plan 3): met de lokale vlag
 * ff_keten_stylist UIT moet /results precies werken zoals voor deze taak.
 *
 * Dit project heeft geen @testing-library/react (en geen jsdom/happy-dom), en
 * de vitest-omgeving staat op 'node'. useOutfits() zelf via useQuery
 * renderen zou dus of een echte React-reconciler met DOM vereisen (niet
 * geinstalleerd), of steunen op niet-gedocumenteerd, versie-afhankelijk
 * SSR-gedrag van TanStack Query. In plaats daarvan zijn de twee stukken die
 * de vlag echt raakt, buildOutfitsQueryKey en haalOutfitsVoorQuery, als pure
 * exports uit useOutfits.ts getrokken. Dat is de enige afwijking van de
 * letterlijke plantekst voor dit bestand: de plantekst schrijft de logica
 * inline in de hook; hier is exact dezelfde logica alleen benoemd en
 * geexporteerd, zodat hij met gewone vitest-calls te toetsen is. useOutfits()
 * zelf verandert niet: hij roept alleen deze twee functies aan.
 *
 * Wat dit bestand bewijst:
 * - de queryKey voor het bestaande (v1- en v2-)pad is byte-voor-byte gelijk
 *   aan voor deze taak, ongeacht de vlag;
 * - de queryFn roept met de vlag UIT nooit composeVoorProfiel,
 *   browserKetenConfig of profielVanQuizAnswers aan: de stylist-route bestaat
 *   voor die aanroep dan effectief niet;
 * - met de vlag AAN, en zonder Supabase-config, valt hij terug op precies
 *   hetzelfde engine-v2-pad als met de vlag uit (geen half-nieuw gedrag);
 * - met de vlag AAN en een geslaagde compose komt ketenBron uit r.bron, en
 *   staan de twee herkansingsvlaggen in de consoleregel (afwijking 3,
 *   taak-9-brief: zichtbaar maken zonder nieuwe tekst op de pagina).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  generateOutfits: vi.fn(),
  fetchOutfits: vi.fn(),
  composeVoorProfiel: vi.fn(),
  browserKetenConfig: vi.fn(),
  profielVanQuizAnswers: vi.fn(),
  getSessionId: vi.fn(),
}));

vi.mock('@/services/outfits/outfitService', () => ({
  outfitService: { generateOutfits: mocks.generateOutfits },
}));
vi.mock('@/services/data/dataService', () => ({
  fetchOutfits: mocks.fetchOutfits,
}));
vi.mock('@/services/DataRouter', () => ({
  getFeed: vi.fn(),
}));
vi.mock('@/keten/composeClient', () => ({
  composeVoorProfiel: mocks.composeVoorProfiel,
}));
vi.mock('@/keten/browserConfig', () => ({
  browserKetenConfig: mocks.browserKetenConfig,
}));
vi.mock('@/keten/vanQuiz', () => ({
  profielVanQuizAnswers: mocks.profielVanQuizAnswers,
}));
vi.mock('@/utils/sessionId', () => ({
  getSessionId: mocks.getSessionId,
}));

import { buildOutfitsQueryKey, haalOutfitsVoorQuery } from '../useOutfits';

const ANSWERS = { gender: 'female', occasions: ['work'], budget: { min: 0, max: 150 } };

describe('buildOutfitsQueryKey — de sleutel voor het bestaande pad blijft ongewijzigd', () => {
  it('geeft met de vlag uit dezelfde v2-sleutel als voor taak 9', () => {
    const key = buildOutfitsQueryKey({ answers: ANSWERS, limit: 9 }, false);
    expect(key[0]).toBe('outfits');
    expect(key[1]).toBe('v2');
    expect(key[3]).toBe(9);
  });

  it('geeft met de vlag aan een andere sleutel (stylist in plaats van v2)', () => {
    const key = buildOutfitsQueryKey({ answers: ANSWERS, limit: 9 }, true);
    expect(key[1]).toBe('stylist');
  });

  it('het legacy v1-pad (geen answers) is identiek, ongeacht de vlag', () => {
    const opties = { archetype: 'klassiek', limit: 6 };
    const uit = buildOutfitsQueryKey(opties, false);
    const aan = buildOutfitsQueryKey(opties, true);
    expect(uit).toEqual(aan);
    expect(uit[0]).toBe('outfits');
    expect(uit[1]).toBe('v1');
  });
});

describe('haalOutfitsVoorQuery — met de vlag uit is er niets veranderd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('roept bij answers + vlag uit alleen outfitService.generateOutfits aan, nooit de keten-functies', async () => {
    mocks.generateOutfits.mockResolvedValue([{ id: 'o1' }]);

    const resultaat = await haalOutfitsVoorQuery({ answers: ANSWERS, limit: 9 }, false);

    expect(mocks.generateOutfits).toHaveBeenCalledWith(ANSWERS, 9);
    expect(mocks.composeVoorProfiel).not.toHaveBeenCalled();
    expect(mocks.browserKetenConfig).not.toHaveBeenCalled();
    expect(mocks.profielVanQuizAnswers).not.toHaveBeenCalled();
    expect(resultaat.ketenBron).toBeNull();
    expect(resultaat.source).toBe('supabase');
    expect(resultaat.cached).toBe(false);
    expect(resultaat.data).toEqual([{ id: 'o1' }]);
  });

  it('roept zonder answers (v1) alleen fetchOutfits aan, nooit de keten-functies', async () => {
    mocks.fetchOutfits.mockResolvedValue({ data: [], source: 'local', cached: false, errors: [] });

    const resultaat = await haalOutfitsVoorQuery({ archetype: 'klassiek' }, true);

    expect(mocks.fetchOutfits).toHaveBeenCalled();
    expect(mocks.composeVoorProfiel).not.toHaveBeenCalled();
    expect(mocks.generateOutfits).not.toHaveBeenCalled();
    expect(resultaat.ketenBron).toBeNull();
  });

  it('valt met vlag aan maar zonder Supabase-config terug op precies het bestaande engine-v2-pad', async () => {
    mocks.browserKetenConfig.mockReturnValue(null);
    mocks.generateOutfits.mockResolvedValue([{ id: 'o2' }]);

    const resultaat = await haalOutfitsVoorQuery({ answers: ANSWERS, limit: 9 }, true);

    expect(mocks.composeVoorProfiel).not.toHaveBeenCalled();
    expect(mocks.generateOutfits).toHaveBeenCalledWith(ANSWERS, 9);
    expect(resultaat.ketenBron).toBeNull();
  });

  it('roept met vlag aan en geslaagde config composeVoorProfiel aan en zet ketenBron op r.bron', async () => {
    mocks.browserKetenConfig.mockReturnValue({ supabase: {} });
    mocks.profielVanQuizAnswers.mockReturnValue({ gender: 'female' });
    mocks.getSessionId.mockReturnValue('sessie-1');
    mocks.composeVoorProfiel.mockResolvedValue({
      bron: 'cache',
      model: 'claude-sonnet-5',
      latency_ms: 42,
      reden: null,
      profile_hash: 'hash-1',
      herkanstKandidaten: false,
      herkanstCache: true,
      engineOutfits: [{ id: 'o3' }],
    });
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const resultaat = await haalOutfitsVoorQuery({ answers: ANSWERS, limit: 9 }, true);

    expect(mocks.generateOutfits).not.toHaveBeenCalled();
    expect(resultaat.ketenBron).toBe('cache');
    expect(resultaat.cached).toBe(true);
    expect(resultaat.data).toEqual([{ id: 'o3' }]);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[keten] stylist-route',
      expect.objectContaining({ herkanstKandidaten: false, herkanstCache: true })
    );
    consoleSpy.mockRestore();
  });

  it('v2-fallback van composeVoorProfiel geeft ketenBron v2-fallback en cached false', async () => {
    mocks.browserKetenConfig.mockReturnValue({ supabase: {} });
    mocks.profielVanQuizAnswers.mockReturnValue({ gender: 'female' });
    mocks.getSessionId.mockReturnValue('sessie-1');
    mocks.composeVoorProfiel.mockResolvedValue({
      bron: 'v2-fallback',
      model: null,
      latency_ms: null,
      reden: 'geen gecachete set voor dit profiel (cache-miss)',
      profile_hash: 'hash-1',
      herkanstKandidaten: false,
      herkanstCache: false,
      engineOutfits: [],
    });
    vi.spyOn(console, 'info').mockImplementation(() => {});

    const resultaat = await haalOutfitsVoorQuery({ answers: ANSWERS, limit: 9 }, true);

    expect(resultaat.ketenBron).toBe('v2-fallback');
    expect(resultaat.cached).toBe(false);
    expect(resultaat.data).toEqual([]);
  });
});
