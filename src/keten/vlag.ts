/**
 * Lokale vlag voor intern testen van de stylist-route op de bestaande
 * resultatenpagina. Zet in de browserconsole:
 *   localStorage.setItem('ff_keten_stylist', '1')
 * en herlaad /results. Verwijderen met localStorage.removeItem('ff_keten_stylist').
 * Dit is geen productievlag; die komt in plan 4 als keten_v2 in remote_flags.
 */
export const KETEN_STYLIST_VLAG = 'ff_keten_stylist';

export function ketenStylistVlagAan(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(KETEN_STYLIST_VLAG) === '1';
  } catch {
    return false;
  }
}
