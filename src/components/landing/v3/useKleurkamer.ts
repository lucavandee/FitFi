import { useCallback, useEffect, useState } from "react";
import { isKamer, START_KAMER, type KamerSleutel, type Wie } from "@/content/kleurkamers";
import { track } from "@/utils/analytics";

export type KeuzeBron = "tik" | "toets" | "veeg" | "hint";

const BEWEGING_SLEUTEL = "fitfi.kleurkamer.beweging";

function lees(sleutel: string, opslag: "local" | "session"): string | null {
  try {
    return (opslag === "local" ? window.localStorage : window.sessionStorage).getItem(sleutel);
  } catch {
    return null;
  }
}

function schrijf(sleutel: string, waarde: string, opslag: "local" | "session"): void {
  try {
    (opslag === "local" ? window.localStorage : window.sessionStorage).setItem(sleutel, waarde);
  } catch {
    // privévenster of geblokkeerde opslag: de keuze geldt dan alleen nu
  }
}

function beginStand(): { kamer: KamerSleutel; wie: Wie } {
  if (typeof window === "undefined") return { kamer: START_KAMER, wie: "dames" };
  const p = new URLSearchParams(window.location.search);
  const kleur = p.get("kleur");
  const wie = p.get("wie");
  return {
    kamer: isKamer(kleur) ? kleur : START_KAMER,
    wie: wie === "heren" ? "heren" : "dames",
  };
}

/**
 * De stand van de kleurkamer: welke kamer, voor wie, en of er beweging mag.
 *
 * - De URL draagt de keuze (?kleur=olijfgroen&wie=heren), via replaceState: een
 *   gedeelde link opent in dezelfde kamer, en de terugknop blijft op de vorige
 *   pagina.
 * - "Beweging uit" wordt per bezoeker onthouden (localStorage).
 * - Een eigen keuze geldt alleen op deze pagina (het slot vraagt ernaar) en in
 *   de URL; er wordt niets van bewaard, want niets in de app leest hem. De hint
 *   telt niet als keuze.
 */
export function useKleurkamer() {
  const [stand, setStand] = useState(beginStand);
  const [eigenKeuze, setEigenKeuze] = useState<KamerSleutel | null>(() => {
    const p = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("kleur");
    return isKamer(p) ? p : null;
  });
  const [bewegingUit, setBewegingUit] = useState(() => lees(BEWEGING_SLEUTEL, "local") === "uit");

  useEffect(() => {
    const url = new URL(window.location.href);
    const huidig = url.searchParams.toString();
    if (eigenKeuze) url.searchParams.set("kleur", stand.kamer);
    if (stand.wie === "heren") url.searchParams.set("wie", "heren");
    else url.searchParams.delete("wie");
    if (url.searchParams.toString() !== huidig) window.history.replaceState(window.history.state, "", url);
  }, [stand, eigenKeuze]);

  const kies = useCallback((kamer: KamerSleutel, bron: KeuzeBron) => {
    setStand((s) => (s.kamer === kamer ? s : { ...s, kamer }));
    if (bron !== "hint") setEigenKeuze(kamer);
    track("kamer_kies", { kamer, bron });
  }, []);

  const kiesWie = useCallback((wie: Wie) => {
    setStand((s) => (s.wie === wie ? s : { ...s, wie }));
    track("kleding_voor", { wie });
  }, []);

  const zetBeweging = useCallback((uit: boolean) => {
    setBewegingUit(uit);
    schrijf(BEWEGING_SLEUTEL, uit ? "uit" : "aan", "local");
    track("beweging_uit", { uit });
  }, []);

  return { ...stand, eigenKeuze, bewegingUit, kies, kiesWie, zetBeweging };
}

export type KleurkamerStand = ReturnType<typeof useKleurkamer>;
