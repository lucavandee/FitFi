/**
 * Stap 14 van de quiz, server-side gerenderd zoals CalibrationStep.render.test.tsx:
 * effects en handlers draaien niet, de begintoestand staat er wel.
 *
 * Twee dingen die mis waren (8 oktober 2026). Een mislukte analyse ging stil
 * door ("continue silently"), en de privacyregel beloofde dat de foto direct
 * van de servers verdween en dat er geen gezichtsdata werd opgeslagen.
 */
import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PhotoUpload from '../PhotoUpload';

const PAD = 'anon_6f1c2b9e-3d4a-4c5b-9e8f-1a2b3c4d5e6f/1728400000000-abc123def456.jpg';

function tekstVan(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

describe('PhotoUpload', () => {
  it('zegt wat er met de foto gebeurt: Frankfurt, OpenAI in de VS, 60 seconden, verwijderen op verzoek', () => {
    const tekst = tekstVan(renderToString(<PhotoUpload value={null} onChange={() => {}} />));
    expect(tekst).toContain('Supabase in Frankfurt');
    expect(tekst).toContain('OpenAI in de VS');
    expect(tekst).toContain('60 seconden');
    expect(tekst).toContain('privacy@fitfi.ai');
    expect(tekst).not.toMatch(/direct van onze servers|gezichtsdata|biometrische|direct verwijderd/i);
  });

  it('toont bij een opgeslagen foto zonder analyse een melding met opnieuw proberen', () => {
    const tekst = tekstVan(renderToString(<PhotoUpload value={PAD} onChange={() => {}} />));
    expect(tekst).toContain('Je foto is toegevoegd.');
    expect(tekst).toContain('De kleuranalyse is niet gelukt.');
    expect(tekst).toContain('Opnieuw proberen');
  });

  it('toont na terugbladeren de analyse uit de antwoorden, zonder melding en zonder betrouwbaarheid', () => {
    const analyse = {
      undertone: 'warm',
      skin_tone: 'medium',
      hair_color: 'brown',
      eye_color: 'green',
      seasonal_type: 'autumn',
      best_colors: ['camel', 'olive'],
      avoid_colors: [],
      confidence: 0.82,
    };
    const tekst = tekstVan(renderToString(<PhotoUpload value={PAD} analysis={analyse} onChange={() => {}} />));
    expect(tekst).toContain('Kleuranalyse gereed');
    expect(tekst).toContain('Herfst');
    expect(tekst).not.toContain('De kleuranalyse is niet gelukt.');
    expect(tekst).not.toMatch(/Betrouwbaarheid|82%/);
  });

  it('negeert een oude data-URL als waarde: geen foto, geen melding', () => {
    const tekst = tekstVan(
      renderToString(<PhotoUpload value="data:image/jpeg;base64,/9j/4AAQ" onChange={() => {}} />)
    );
    expect(tekst).toContain('Sleep hier een foto naartoe');
    expect(tekst).not.toContain('De kleuranalyse is niet gelukt.');
  });
});
