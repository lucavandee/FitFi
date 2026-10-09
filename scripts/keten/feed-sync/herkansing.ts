/**
 * Welke fouten een feed-sync mag herhalen, en hoe een fout in de log komt.
 *
 * Een time-out of een gateway-fout zegt niets over de data: dezelfde batch kan een minuut later
 * wel. Een schendingsfout (dubbele sleutel, ontbrekende waarde) of een geweigerde actie verandert
 * niet door te wachten en hoort meteen te stoppen.
 *
 * De Supabase-gateway antwoordt bij een bereikbare maar vastgelopen database soms met een
 * Cloudflare-pagina (522, 524, 504) in plaats van JSON. Dan staat er geen foutcode en is het
 * bericht een hele HTML-pagina; die herken je aan de kop en vat je samen.
 */
export interface Fout {
  message: string;
  code?: string;
}

const TIJDELIJK =
  /statement timeout|timeout|timed out|fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|schema cache|\b(?:502|503|504|520|521|522|523|524)\b|too many connections|server closed the connection/i;

export function isTijdelijk(fout: Fout): boolean {
  if (fout.code === "57014" || fout.code === "PGRST002" || fout.code === "53300") return true;
  return TIJDELIJK.test(fout.message);
}

/** Eén regel voor in de log: een HTML-foutpagina wordt "HTTP 522: Connection timed out", de rest wordt afgekapt. */
export function kortBericht(bericht: string): string {
  if (/<!DOCTYPE html|<html/i.test(bericht)) {
    const titel = bericht.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    const code = bericht.match(/Error code (\d{3})/i)?.[1] ?? titel?.match(/\b(\d{3})\b/)?.[1];
    const omschrijving = titel?.split(":").slice(1).join(":").trim() || titel || "foutpagina van de gateway";
    return `HTTP ${code ?? "5xx"}: ${omschrijving}`;
  }
  return bericht.length > 240 ? `${bericht.slice(0, 237)}...` : bericht;
}
