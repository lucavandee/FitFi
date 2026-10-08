/**
 * Wat een geslaagde selfie-analyse met het kleurprofiel doet (logic.ts). Het
 * hoofdpad van de quiz hing de analyse aan het profiel zonder er iets mee te
 * doen, terwijl het rapport schreef dat het advies op je huidondertoon
 * gebaseerd was. Nu bepaalt de analyse het seizoen op elk pad, met dezelfde
 * drempel als het terugvalpad computeColorProfile.
 */
import { describe, expect, it } from 'vitest';
import { computeColorProfile, fotoAnalyseUitAntwoorden, pasFotoAnalyseToe } from '../logic';
import type { SelfieAnalyse } from '../selfieFoto';

const PAD = 'anon_6f1c2b9e-3d4a-4c5b-9e8f-1a2b3c4d5e6f/1728400000000-abc123def456.jpg';
const DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';

function analyse(overschrijf: Partial<SelfieAnalyse> = {}): SelfieAnalyse {
  return {
    undertone: 'cool',
    skin_tone: 'light with cool undertone',
    hair_color: 'black',
    eye_color: 'blue',
    seasonal_type: 'winter',
    best_colors: ['navy', 'emerald'],
    avoid_colors: ['orange'],
    confidence: 0.8,
    ...overschrijf,
  };
}

describe('analyse uit de antwoorden', () => {
  it('telt alleen met een opgeslagen foto erbij', () => {
    expect(fotoAnalyseUitAntwoorden({ photoUrl: PAD, colorAnalysis: analyse() })).toEqual(analyse());
    expect(fotoAnalyseUitAntwoorden({ colorAnalysis: analyse() })).toBeNull();
    expect(fotoAnalyseUitAntwoorden({ photoUrl: DATA_URL, colorAnalysis: analyse() })).toBeNull();
  });

  it('negeert een analyse zonder bekende ondertoon of seizoen', () => {
    const kapot = { ...analyse(), seasonal_type: 'monsoon' };
    expect(fotoAnalyseUitAntwoorden({ photoUrl: PAD, colorAnalysis: kapot })).toBeNull();
  });
});

describe('pasFotoAnalyseToe', () => {
  const quizProfiel = { season: 'herfst', subSeason: 'warm-herfst', temperature: 'warm' };

  it('zet het seizoen uit de analyse en hangt de analyse aan het profiel', () => {
    const uit = pasFotoAnalyseToe(quizProfiel, analyse()) as typeof quizProfiel & Record<string, unknown>;
    expect(uit.season).toBe('winter');
    expect(uit.subSeason).toBeUndefined();
    expect(uit.photoAnalysis).toEqual(analyse());
    expect(uit.undertone).toBe('cool');
    // Temperatuur blijft de voorkeur uit de quiz.
    expect(uit.temperature).toBe('warm');
  });

  it('houdt het subseizoen als het seizoen niet verandert', () => {
    const uit = pasFotoAnalyseToe(quizProfiel, analyse({ seasonal_type: 'autumn' }));
    expect(uit.season).toBe('herfst');
    expect(uit.subSeason).toBe('warm-herfst');
  });

  it('verandert niets onder 0.6 zekerheid of zonder analyse', () => {
    expect(pasFotoAnalyseToe(quizProfiel, analyse({ confidence: 0.5 }))).toBe(quizProfiel);
    expect(pasFotoAnalyseToe(quizProfiel, null)).toBe(quizProfiel);
  });

  it('kiest hetzelfde seizoen als het terugvalpad computeColorProfile', () => {
    const antwoorden = { neutrals: 'warm' as const, colorAnalysis: analyse() };
    expect(computeColorProfile(antwoorden).season).toBe('winter');
    expect(pasFotoAnalyseToe({ season: 'herfst' }, analyse()).season).toBe('winter');
  });
});

