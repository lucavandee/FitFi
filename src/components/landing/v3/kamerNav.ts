import { useSyncExternalStore } from "react";
import { kamer, isKamer, isDonkereKamer, tekstKleur, START_KAMER } from "@/content/kleurkamers";

/**
 * Laat de kop (Navbar, buiten de pagina) weten dat hij boven de kleurkamer
 * staat, en in welke kleur zijn tekst moet. Zolang de held bovenaan staat, is
 * de kop een band in de kleur van de kamer: geen witte pil op een gekleurde
 * kamer, en geen tweede primaire knop naast die van de held.
 *
 * Contrast: de tekstkleur komt uit de kamer zelf (papier, wit of inkt), en die
 * is per kamer getoetst op het gemeten veld (__tests__/kleurkamers.test.ts). De
 * oude transparante kop haalde dat niet, omdat hij wit op een wisselende foto
 * zette (Navbar.tsx, meting van 9 oktober 2026).
 *
 * De beginstand op / wordt al bij het laden van deze module gezet, uit dezelfde
 * URL als de held (?kleur= en ?wie=). Anders tekent de eerste frame de gewone
 * kop met witte pil en knop, en verspringt die daarna.
 */
export interface KamerNavStand {
  actief: boolean;
  /** tekstkleur, bijvoorbeeld #FAFAF8 */
  tekst: string;
  licht: boolean;
  /** de veldkleur: de band van de kop krijgt die kleur, zodat de held eronder doorscrolt zonder dat tekst over tekst valt */
  veld: string;
}

const UIT: KamerNavStand = { actief: false, tekst: "#1A1A1A", licht: false, veld: "#FAFAF8" };

function beginStand(): KamerNavStand {
  if (typeof window === "undefined" || window.location.pathname !== "/") return UIT;
  const p = new URLSearchParams(window.location.search);
  const kleur = p.get("kleur");
  const k = kamer(isKamer(kleur) ? kleur : START_KAMER);
  const wie = p.get("wie") === "heren" ? "heren" : "dames";
  return { actief: true, tekst: tekstKleur(k), licht: isDonkereKamer(k), veld: k.veld[wie] };
}

let stand: KamerNavStand = beginStand();
const luisteraars = new Set<() => void>();

export function zetKamerNav(nieuw: KamerNavStand | null): void {
  const volgende = nieuw ?? UIT;
  if (volgende.actief === stand.actief && volgende.tekst === stand.tekst && volgende.licht === stand.licht && volgende.veld === stand.veld) return;
  stand = volgende;
  luisteraars.forEach((l) => l());
}

export function useKamerNav(): KamerNavStand {
  return useSyncExternalStore(
    (l) => {
      luisteraars.add(l);
      return () => luisteraars.delete(l);
    },
    () => stand,
    () => stand,
  );
}
