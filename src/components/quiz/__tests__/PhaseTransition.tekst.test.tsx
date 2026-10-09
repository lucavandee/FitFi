/**
 * De faseovergangen in de quiz beloven alleen wat de code doet: drie outfits
 * in de kalibratie (CalibrationStep vraagt de engine om count: 3), de
 * knopteksten van OutfitCalibrationCard, geen getal zonder bron ("50+", "5
 * complete outfits") en geen invultijd, want die is nooit gemeten.
 *
 * Copy-controle fase 4, bevinding 15: ook geen clichés en Engels ("Dit is waar
 * de magie gebeurt", "pixel-perfect", "Ready to see your style?", "Style DNA"),
 * geen los koppelteken als gedachtestreepje, één stem (geen "ik" of "me" van
 * Nova naast "FitFi"), en de getallen van de swipestap uit
 * VisualPreferenceStepClean.tsx in plaats van "15-20".
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

  for (const fase of FASEN) {
    it(`${fase.toPhase}: geen clichés of Engels, geen gedachtestreepje, één stem`, () => {
      const tekst = tekstVan(renderToString(<PhaseTransition {...fase} onContinue={() => {}} />));
      expect(tekst).not.toMatch(/magie|pixel-perfect|\buniek|op maat|\bReady\b|\bStyle\b|finishing|journey|shoppable/i);
      expect(tekst).not.toMatch(/[–—]|\s-\s/);
      // "Lijkt me niks" is de knoptekst van de kaart, geen stem.
      expect(tekst.replace(/Lijkt me niks/g, '')).not.toMatch(/\b(ik|me|mij|mijn)\b/i);
    });
  }

  it('swipes: de getallen komen uit VisualPreferenceStepClean, en overslaan bestaat', () => {
    const tekst = tekstVan(
      renderToString(<PhaseTransition fromPhase="questions" toPhase="swipes" onContinue={() => {}} />)
    );
    const stap = readFileSync(join(__dirname, '../VisualPreferenceStepClean.tsx'), 'utf8');
    const afronden = stap.match(/const MIN_SWIPES_TO_COMPLETE = (\d+);/)?.[1];
    const afstemmen = stap.match(/const ADAPT_AFTER_SWIPES = (\d+);/)?.[1];
    expect(afronden).toBeDefined();
    expect(afstemmen).toBeDefined();
    expect(tekst).toContain(`Na ${afronden} swipes kun je afronden`);
    expect(tekst).toContain(`Na ${afstemmen} swipes kan FitFi`);
    expect(stap).toContain('Sla deze stap over');
  });

  it('kalibratie: overslaan kan echt', () => {
    const tekst = tekstVan(
      renderToString(<PhaseTransition fromPhase="swipes" toPhase="calibration" onContinue={() => {}} />)
    );
    expect(tekst).toContain('Je kunt deze stap ook overslaan');
    expect(readFileSync(join(__dirname, '../CalibrationStep.tsx'), 'utf8')).toContain('Beoordeling overslaan');
  });

  it('reveal: de vaste CTA uit CLAUDE.md deel 10', () => {
    const tekst = tekstVan(
      renderToString(<PhaseTransition fromPhase="calibration" toPhase="reveal" onContinue={() => {}} />)
    );
    expect(tekst).toContain('Bekijk je resultaten');
  });

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
