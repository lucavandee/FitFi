/**
 * Kop van de landingspagina: titel, beschrijving en het deelbeeld voor
 * linkvoorbeelden.
 *
 * Eén bron, want dezelfde tekst staat op drie plekken: de Seo-regel voor "/"
 * in App.tsx (die ook twitter:title en twitter:description zet), de Helmet in
 * LandingPage.tsx, en index.html voor scrapers die geen JavaScript draaien.
 * index.html kan dit bestand niet importeren; landingHead.test.ts houdt die
 * twee gelijk.
 *
 * De beschrijving zegt wat de quiz vraagt en dat het rapport een gratis
 * account vraagt: /results staat achter RequireAuth (App.tsx). Geen invultijd,
 * want die is nooit gemeten.
 */
export const LANDING_TITEL = "FitFi: stijladvies op basis van wat je graag draagt";

export const LANDING_BESCHRIJVING =
  "Beantwoord vragen over kleur, pasvorm en gelegenheden en kies uit beelden van outfits. " +
  "Met een gratis account krijg je een kleurpalet en outfits met links naar winkels.";

/**
 * Deelbeeld: een uitsnede van de desktop-hero met het AI-label in het beeld
 * zelf. Een linkvoorbeeld toont alleen het beeld, dus een label ernaast komt
 * nooit mee (AI-verordening art. 50). Het label is dezelfde zin als in de
 * hero, wit op het verloop van de hero, 40 px op 1200 breed: in een voorbeeld
 * van 500 px breed nog bijna 17 px.
 *
 * Absoluut, want niet elke scraper lost een relatief pad op. De hash in de
 * naam is het begin van de sha256 van het bestand: een nieuwe versie krijgt
 * een nieuwe naam, zodat geen cache het oude beeld vasthoudt.
 */
export const OG_BEELD = "https://www.fitfi.ai/og/og-home_1200x630.7c31a04e.jpg";
