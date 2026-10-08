/**
 * Wanneer de cookiebanner verschijnt (plan fase 2, 4.0 en G19).
 *
 * Op de homepage wacht hij tot de hero voor minstens de helft uit beeld is: wie
 * binnenkomt ziet eerst de hero, en de knop "Begin gratis" daarin wordt nooit
 * door de banner bedekt. Op de andere routes verschijnt hij direct. Is hij
 * eenmaal verschenen, dan blijft hij vanaf 1024 px breed staan tot er een
 * keuze is, ook als de bezoeker terug naar boven scrolt of naar / navigeert.
 * Daarom staat de banner op desktop rechtsonder en laat de laag eromheen
 * klikken door.
 *
 * Onder 1024 px wijkt hij op / zolang de hero voor meer dan de helft in beeld
 * is, ook na terugscrollen. Gemeten op 8 oktober 2026 met een banner die bleef
 * staan: op 360x640, 390x844 en 430x932 lag de strook dan over "Begin gratis",
 * "Bekijk voorbeeld" en het AI-label van de hero, op 768x1024 over een kwart
 * van "Bekijk voorbeeld". Vanaf 820 px breed raakte hij niets.
 *
 * Uitzondering: de quiz. Die draait op het hele scherm (App.tsx: isFullscreen,
 * zonder kop, footer en onderbalk) met Vorige en Volgende onderin. Gemeten op
 * 8 oktober 2026 lag de banner daar op 390x844 over Vorige en Volgende, en op
 * 768x1024, 1024x768 en 1280x800 over een deel van Volgende: wie op "Begin
 * gratis" tikte, moest eerst een cookiekeuze maken. Tijdens de quiz staat de
 * banner er dus niet; op de volgende route wel.
 *
 * Pure functies, zodat de regel zonder browser te toetsen is.
 */

/** De hero van de homepage; LandingPage.tsx zet aria-labelledby op de sectie. */
export const HERO_SELECTOR = 'section[aria-labelledby="hero-heading"]';

export interface Doos {
  top: number;
  bottom: number;
  height: number;
}

/**
 * Welk deel van een element in het venster staat, als aandeel van zijn eigen
 * hoogte (0 tot 1). Een element zonder hoogte telt als niet zichtbaar.
 */
export function zichtbaarAandeel(doos: Doos, vensterHoogte: number): number {
  if (!(doos.height > 0)) return 0;
  const zichtbaar = Math.max(0, Math.min(doos.bottom, vensterHoogte) - Math.max(doos.top, 0));
  return Math.min(1, zichtbaar / doos.height);
}

/**
 * Zonder hero in de DOM (de pagina laadt nog, of hij is ooit weg) telt het
 * eerste scherm als hero: dan verschijnt de banner na een half scherm scrollen.
 */
export function doosVanEersteScherm(scrollY: number, vensterHoogte: number): Doos {
  return { top: -scrollY, bottom: vensterHoogte - scrollY, height: vensterHoogte };
}

/** De quiz, met dezelfde test als isFullscreen in App.tsx. */
export function isQuiz(pad: string): boolean {
  return pad.startsWith("/onboarding");
}

/**
 * Mag de banner nu verschijnen? Niet tijdens de quiz; op / pas als de hero voor
 * minstens de helft uit beeld is; elders direct.
 */
export function magBannerTonen(pad: string, heroAandeel: number): boolean {
  if (isQuiz(pad)) return false;
  if (pad !== "/") return true;
  return heroAandeel <= 0.5;
}

/** Het wisselpunt van de hero (LandingPage.tsx): daaronder de mobiele opbouw. */
export const SMAL = "(max-width: 1023px)";

/**
 * Moet een banner die al verschenen is op / weer wijken? Alleen onder 1024 px,
 * en alleen zolang de hero voor meer dan de helft in beeld is.
 */
export function wijktVoorHero(pad: string, heroAandeel: number, smal: boolean): boolean {
  return pad === "/" && smal && heroAandeel > 0.5;
}
