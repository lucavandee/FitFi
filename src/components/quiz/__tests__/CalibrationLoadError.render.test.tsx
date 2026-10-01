/**
 * De weergave voor "het laden van de calibratie-outfits mislukte".
 *
 * CalibrationStep at die fout eerst op in een console.error. Productie haalt
 * alle console-aanroepen weg (drop_console in vite.config.ts), dus een
 * bezoeker voor wie get_kandidaten bleef afbreken kreeg het scherm voor "er
 * zijn geen outfits" (We zijn je profiel aan het voorbereiden), met alleen een
 * knop om door te gaan: niets over het laden dat mislukte en geen knop om het
 * opnieuw te proberen.
 *
 * Dit project test componenten met renderToString in een node-omgeving (geen
 * jsdom), dus hier staat de markup en de koppeling van de knoppen. Dat
 * CalibrationStep deze weergave ook toont na een mislukte load is niet in een
 * test te draaien zonder DOM; zie het rapport van deze fix voor de controle in
 * een echte browser.
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { CalibrationLoadError } from '../CalibrationLoadError';

type Props = { children?: React.ReactNode; onClick?: () => void };

/** Alle elementen onder een node, in documentvolgorde. */
function elementen(node: React.ReactNode, uit: React.ReactElement<Props>[] = []): React.ReactElement<Props>[] {
  if (Array.isArray(node)) {
    node.forEach((kind) => elementen(kind, uit));
  } else if (React.isValidElement<Props>(node)) {
    uit.push(node);
    elementen(node.props.children, uit);
  }
  return uit;
}

// Als tekencodes in plaats van letterlijke tekens: dit bestand mag zelf geen liggend streepje bevatten.
const LIGGENDE_STREEPJES = String.fromCharCode(0x2013, 0x2014);

const tekstVan = (el: React.ReactElement) => renderToStaticMarkup(el).replace(/<[^>]+>/g, '').trim();

describe('CalibrationLoadError', () => {
  const render = () => renderToString(<CalibrationLoadError onRetry={() => {}} onSkip={() => {}} />);

  it('zegt dat het laden niet lukte, in plaats van een lege stap', () => {
    const html = render();
    expect(html).toContain('Je outfits laden is niet gelukt');
    expect(html).toContain('We konden de outfits niet ophalen');
    expect(html).toContain('Outfit Calibratie');
  });

  it('kondigt zich aan als alert, zodat een schermlezer de fout meeleest', () => {
    expect(render()).toContain('role="alert"');
  });

  it('biedt eerst een nieuwe poging aan en pas daarna het overslaan', () => {
    const knoppen = elementen(CalibrationLoadError({ onRetry: () => {}, onSkip: () => {} })).filter(
      (el) => el.type === 'button'
    );
    expect(knoppen.map(tekstVan)).toEqual(['Probeer opnieuw', 'Stap overslaan']);
  });

  it('koppelt de knoppen aan de juiste actie', () => {
    const opnieuw = vi.fn();
    const overslaan = vi.fn();
    const knoppen = elementen(CalibrationLoadError({ onRetry: opnieuw, onSkip: overslaan })).filter(
      (el) => el.type === 'button'
    );

    knoppen[0].props.onClick?.();
    expect(opnieuw).toHaveBeenCalledTimes(1);
    expect(overslaan).not.toHaveBeenCalled();

    knoppen[1].props.onClick?.();
    expect(overslaan).toHaveBeenCalledTimes(1);
    expect(opnieuw).toHaveBeenCalledTimes(1);
  });

  it('houdt zich aan de copyregels van het design system (Nederlands, je, geen liggend streepje, korte kop en knoppen)', () => {
    const html = render();
    // Liggende streepjes (em- en en-dash) staan in geen enkele copy.
    expect([...html].filter((teken) => LIGGENDE_STREEPJES.includes(teken))).toEqual([]);
    expect(html).toMatch(/\bje\b/);

    const kop = /<h2[^>]*>([^<]+)<\/h2>/.exec(html)?.[1] ?? '';
    expect(kop.split(/\s+/).length).toBeLessThanOrEqual(8);

    const alinea = /<p[^>]*>([^<]+)<\/p>/.exec(html)?.[1] ?? '';
    expect(alinea.split(/(?<=[.!?])\s+/).length).toBeLessThanOrEqual(3);

    const knoppen = elementen(CalibrationLoadError({ onRetry: () => {}, onSkip: () => {} })).filter(
      (el) => el.type === 'button'
    );
    for (const knop of knoppen) expect(tekstVan(knop).split(/\s+/).length).toBeLessThanOrEqual(3);
  });

  it('gebruikt geen tekst onder 14px en geeft elke knop een aanraakdoel van 48px', () => {
    const html = render();
    expect(html).not.toMatch(/\btext-xs\b/);
    expect(html).not.toMatch(/text-\[(?:[0-9]|1[0-3])(?:\.\d+)?px\]/);
    expect(html.match(/min-h-\[48px\]/g)?.length).toBe(2);
  });
});
