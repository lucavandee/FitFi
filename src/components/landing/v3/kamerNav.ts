import { useSyncExternalStore } from "react";

/**
 * Laat de kop (Navbar, buiten de pagina) weten dat hij boven de kleurkamer
 * staat, en in welke kleur zijn tekst moet. Zolang de held in beeld is, is de
 * kop transparant: geen witte pil op een gekleurde kamer, en geen tweede
 * primaire knop naast die van de held. Daarna komt de gewone kop terug.
 *
 * Contrast: de tekstkleur komt uit de kamer zelf (papier of inkt), en die is
 * per kamer getoetst op het gemeten veld (__tests__/kleurkamers.test.ts). De
 * oude transparante kop haalde dat niet, omdat hij wit op een wisselende foto
 * zette (Navbar.tsx, meting van 9 oktober 2026).
 */
export interface KamerNavStand {
  actief: boolean;
  /** tekstkleur, bijvoorbeeld #FAFAF8 */
  tekst: string;
  licht: boolean;
  /** de veldkleur van de kamer: de band van de kop krijgt die kleur, zodat de held eronder doorscrolt zonder dat tekst over tekst valt */
  veld: string;
}

const UIT: KamerNavStand = { actief: false, tekst: "#1A1A1A", licht: false, veld: "#FAFAF8" };

let stand: KamerNavStand = UIT;
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
