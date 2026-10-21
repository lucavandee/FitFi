import { supabase } from "@/lib/supabaseClient";

/** De gebeurtenissen die de anonieme dagteller kent (migratie 20261021220000). */
export type TelGebeurtenis = "home" | "quiz_start" | "quiz_af";

/** Per paginalading een keer per gebeurtenis; in het geheugen, niets op het apparaat. */
const geteld = new Set<TelGebeurtenis>();

/**
 * Telt een gebeurtenis anoniem op voor vandaag: alleen een aantal per dag,
 * geen sessie, geen gebruiker, geen cookie. Daarom zonder toestemming en los
 * van Google Analytics. Een mislukte telling blijft stil: tellen mag nooit
 * de site in de weg zitten.
 */
export function tel(gebeurtenis: TelGebeurtenis): void {
  if (geteld.has(gebeurtenis)) return;
  geteld.add(gebeurtenis);
  const verstuur = () => {
    try {
      const client = supabase();
      if (!client) return;
      void client.rpc("tel_gebeurtenis", { p_gebeurtenis: gebeurtenis }).then(
        () => undefined,
        () => undefined,
      );
    } catch {
      // stil
    }
  };
  // Pas als de browser niets anders te doen heeft: de telling mag de eerste
  // weergave niet vertragen (op de homepage telde hij mee in de LCP).
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(verstuur, { timeout: 3000 });
  } else {
    setTimeout(verstuur, 0);
  }
}

/** Alleen voor tests. */
export function _vergeetTellingen(): void {
  geteld.clear();
}
