/**
 * localStorage zonder dat de pagina omvalt. Met "alle cookies blokkeren" (Chrome,
 * Safari) of in sommige in-app browsers gooit al het opvragen van localStorage
 * een SecurityError, of is het null. In ThemeContext en InstallPrompt, allebei in
 * de schil van elke pagina, gaf dat op elke route het foutscherm (live gemeten op
 * 29 oktober 2026). Zonder opslag geldt de standaard en wordt er niets onthouden.
 */
export function leesOpslag(sleutel: string): string | null {
  try {
    return window.localStorage.getItem(sleutel);
  } catch {
    return null;
  }
}

export function schrijfOpslag(sleutel: string, waarde: string): void {
  try {
    window.localStorage.setItem(sleutel, waarde);
  } catch {
    // geen opslag: de keuze geldt alleen voor dit bezoek
  }
}
