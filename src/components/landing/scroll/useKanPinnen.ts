import { useEffect, useState } from "react";

/**
 * Mag deze viewport een vastgezette scene tonen?
 *
 * Nee onder 1024px breed: op een telefoon duwt een pin meerdere schermhoogtes
 * waarbij de pagina visueel stil lijkt te staan, wat als kapot leest.
 *
 * Nee onder 700px hoog: een sticky stage van 100svh scrolt niet intern, dus
 * content die niet past is onbereikbaar. Deze grens dekt ook 400 procent zoom,
 * want zoomen verkleint de layout-viewport (WCAG 1.4.10 Reflow).
 */
const VRAAG = "(min-width: 1024px) and (min-height: 700px)";

export function useKanPinnen(): boolean {
  const [kan, setKan] = useState(() => {
    try {
      return typeof window !== "undefined" && window.matchMedia(VRAAG).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia(VRAAG);
    } catch {
      return;
    }
    const luister = (e: MediaQueryListEvent) => setKan(e.matches);
    setKan(mq.matches);
    mq.addEventListener("change", luister);
    return () => mq.removeEventListener("change", luister);
  }, []);

  return kan;
}
