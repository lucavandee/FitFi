/**
 * De faseovergangen in de quiz beloven alleen wat de code doet: drie outfits
 * in de kalibratie (CalibrationStep vraagt de engine om count: 3), de
 * knopteksten van OutfitCalibrationCard, geen getal zonder bron ("50+", "5
 * complete outfits") en geen invultijd, want die is nooit gemeten.
 *
 * Server-side gerenderd, zoals CalibrationStep.render.test.tsx: effects
 * draaien niet, de tekst staat er wel.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToString } from 'react-dom/server';
import { PhaseTransition } from '../PhaseTransition';

const FASEN = [
  { fromPhase: 'questions', toPhase: 'swipes' },
  { fromPhase: 'swipes', toPhase: 'calibration' },
  { fromPhase: 'calibration', toPhase: 'reveal' },
] as const;

function tekstVan(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');
}

describe('PhaseTransition', () => {
  for (const fase of FASEN) {
    it(`${fase.toPhase}: geen invultijd, geen 50+, geen "echte" foto's`, () => {
      const tekst = tekstVan(renderToString(<PhaseTransition {...fase} onContinue={() => {}} />));
      expect(tekst).not.toMatch(/minuten|minuut|seconden|Dit duurt/);
      expect(tekst).not.toMatch(/50\+/);
      expect(tekst).not.toMatch(/echte outfit/);
    });
  }

  it('kalibratie: drie outfits en de knopteksten van de kaart', () => {
    const tekst = tekstVan(
      renderToString(<PhaseTransition fromPhase="swipes" toPhase="calibration" onContinue={() => {}} />)
    );
    expect(tekst).toContain('Je ziet drie outfits');
    expect(readFileSync(join(__dirname, '../CalibrationStep.tsx'), 'utf8')).toMatch(/count: 3\b/);

    const kaart = readFileSync(join(__dirname, '../OutfitCalibrationCard.tsx'), 'utf8');
    for (const knop of ['Spot on', 'Misschien', 'Lijkt me niks']) {
      expect(kaart).toContain(knop);
      expect(tekst).toContain(knop);
    }
  });
});
