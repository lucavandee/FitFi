/**
 * De regels van de edge function analyze-selfie-color, in de Node-runner.
 * regels.ts heeft geen Deno-globals, net als _shared/productClassifier.ts
 * (zie productClassifier.crossPlatform.test.ts). De functie zelf, met een
 * nagebootste Supabase en OpenAI, staat in
 * supabase/functions/analyze-selfie-color/index.test.ts (deno test).
 */
import { describe, expect, it } from 'vitest';
import {
  BUCKET,
  LINK_SECONDEN,
  MAX_ANALYSES_PER_SESSIE,
  controleerPad,
  leesAnalyse,
  rolUitToken,
} from '../../../../supabase/functions/analyze-selfie-color/regels';

const SESSIE = '6f1c2b9e-3d4a-4c5b-9e8f-1a2b3c4d5e6f';
const GEBRUIKER = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const BESTAND = '1728400000000-abc123def456.jpg';

function jwt(payload: Record<string, unknown>): string {
  const deel = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${deel({ alg: 'HS256', typ: 'JWT' })}.${deel(payload)}.handtekening`;
}

describe('vaste waarden', () => {
  it('privé bucket, link van 60 seconden, drie analyses per sessie', () => {
    expect(BUCKET).toBe('user-photos');
    expect(LINK_SECONDEN).toBe(60);
    expect(MAX_ANALYSES_PER_SESSIE).toBe(3);
  });
});

describe('controleerPad', () => {
  it('laat een foto in de eigen sessiemap door', () => {
    expect(controleerPad(`anon_${SESSIE}/${BESTAND}`, { sessionId: SESSIE })).toEqual({
      ok: true,
      pad: `anon_${SESSIE}/${BESTAND}`,
      map: `anon_${SESSIE}`,
      soort: 'sessie',
    });
  });

  it('weigert de map van een andere sessie', () => {
    const ander = '0a0b0c0d-1e1f-4a2b-8c3d-4e5f6a7b8c9d';
    expect(controleerPad(`anon_${ander}/${BESTAND}`, { sessionId: SESSIE })).toEqual({ ok: false, reden: 'andere-map' });
  });

  it('laat de gebruikersmap alleen door met een gecontroleerd gebruikers-id', () => {
    expect(controleerPad(`${GEBRUIKER}/${BESTAND}`, { sessionId: SESSIE }).ok).toBe(false);
    expect(controleerPad(`${GEBRUIKER}/${BESTAND}`, { sessionId: SESSIE, userId: GEBRUIKER })).toMatchObject({
      ok: true,
      soort: 'gebruiker',
    });
  });

  it('weigert paden die uit de map kunnen ontsnappen of een ander bestand noemen', () => {
    const wie = { sessionId: SESSIE };
    for (const pad of [
      `anon_${SESSIE}/../${GEBRUIKER}/${BESTAND}`,
      `anon_${SESSIE}/sub/${BESTAND}`,
      `anon_${SESSIE}/.verborgen.jpg`,
      `anon_${SESSIE}/foto.gif`,
      `anon_${SESSIE}/`,
      `/anon_${SESSIE}/${BESTAND}`,
    ]) {
      expect(controleerPad(pad, wie)).toEqual({ ok: false, reden: 'vorm' });
    }
    expect(controleerPad('', wie)).toEqual({ ok: false, reden: 'geen-pad' });
    expect(controleerPad(42, wie)).toEqual({ ok: false, reden: 'geen-pad' });
  });

  it('accepteert geen sessie-id dat geen UUID is', () => {
    expect(controleerPad(`anon_abc/${BESTAND}`, { sessionId: 'abc' })).toEqual({ ok: false, reden: 'andere-map' });
  });
});

describe('rolUitToken', () => {
  it('leest de rol uit de anon-sleutel en uit een gebruikerstoken', () => {
    expect(rolUitToken(jwt({ role: 'anon' }))).toBe('anon');
    expect(rolUitToken(jwt({ role: 'authenticated', sub: GEBRUIKER }))).toBe('authenticated');
  });

  it('geeft null bij iets dat geen JWT is', () => {
    expect(rolUitToken('')).toBeNull();
    expect(rolUitToken('sb_publishable_abc')).toBeNull();
    expect(rolUitToken('a.b.c')).toBeNull();
    expect(rolUitToken(null)).toBeNull();
  });
});

describe('leesAnalyse', () => {
  const goed = {
    undertone: 'warm',
    skin_tone: 'medium',
    hair_color: 'brown',
    eye_color: 'green',
    seasonal_type: 'autumn',
    best_colors: ['camel', 'olive'],
    avoid_colors: ['icy blue'],
    confidence: 0.82,
    reasoning: 'Golden undertone.',
  };

  it('leest JSON, ook binnen een codeblok', () => {
    expect(leesAnalyse(JSON.stringify(goed))).toEqual(goed);
    expect(leesAnalyse('```json\n' + JSON.stringify(goed) + '\n```')).toEqual(goed);
  });

  it('rekent een zekerheid van 85 terug naar 0.85, en ontbrekend wordt 0', () => {
    expect(leesAnalyse(JSON.stringify({ ...goed, confidence: 85 }))?.confidence).toBe(0.85);
    const { confidence: _weg, ...zonder } = goed;
    expect(leesAnalyse(JSON.stringify(zonder))?.confidence).toBe(0);
  });

  it('maakt hoofdletters klein en vult ontbrekende lijsten aan', () => {
    const uit = leesAnalyse(JSON.stringify({ ...goed, undertone: 'Warm', seasonal_type: 'AUTUMN', avoid_colors: 'none' }));
    expect(uit?.undertone).toBe('warm');
    expect(uit?.seasonal_type).toBe('autumn');
    expect(uit?.avoid_colors).toEqual([]);
  });

  it('geeft null zonder bruikbare ondertoon of seizoen', () => {
    expect(leesAnalyse('Sorry, I cannot help with that.')).toBeNull();
    expect(leesAnalyse(JSON.stringify({ ...goed, undertone: 'olive' }))).toBeNull();
    expect(leesAnalyse(JSON.stringify({ ...goed, seasonal_type: undefined }))).toBeNull();
    expect(leesAnalyse('{niet: json}')).toBeNull();
    expect(leesAnalyse(undefined)).toBeNull();
  });
});
