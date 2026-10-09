import { useCallback, useEffect, useState } from "react";

/**
 * Wordt waar zodra het element binnen `marge` px van het scherm komt, en blijft
 * dan waar. Eigen beeld en clips onder de hero krijgen pas daarna een bron
 * (plan "Onder de hero", 3.8): stills op 500 px, clips op 300 px. Zo laadt bij
 * aankomst niets onder de hero mee behalve W1.
 *
 * `naLoad`: ook waar na het load-event plus een idle-moment, ook als het
 * element nog ver weg is. Voor W1, dat direct onder de hero staat: het mag
 * vroeg laden, maar niet ten koste van de hero en zijn clip.
 *
 * De ref is een callback-ref met state erachter: een element dat later mount
 * (de clip rendert pas als hij mag spelen) wordt dan alsnog waargenomen, en
 * zolang er geen element is gebeurt er niets.
 *
 * Zonder IntersectionObserver (zeer oude browsers) meteen waar: liever een
 * beeld te vroeg dan nooit.
 */
export function useOpNadering<T extends Element>({
  marge = 500,
  naLoad = false,
}: { marge?: number; naLoad?: boolean } = {}) {
  const [element, setElement] = useState<T | null>(null);
  const [dichtbij, setDichtbij] = useState(false);
  const ref = useCallback((el: T | null) => setElement(el), []);

  useEffect(() => {
    if (dichtbij || !element) return;

    let gestopt = false;
    const zet = () => {
      if (gestopt) return;
      gestopt = true;
      setDichtbij(true);
    };

    if (!("IntersectionObserver" in window)) {
      zet();
      return;
    }

    const waarnemer = new IntersectionObserver(
      (items) => {
        if (items.some((item) => item.isIntersecting)) zet();
      },
      { rootMargin: `${marge}px 0px ${marge}px 0px` },
    );
    waarnemer.observe(element);

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    // Safari kent requestIdleCallback pas sinds kort; de typing doet alsof hij
    // er altijd is, dus de else-tak loopt via een gewone Window-variabele.
    const venster: Window = window;
    const naIdle = () => {
      if (gestopt) return;
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(zet, { timeout: 2000 });
      } else {
        timeoutId = venster.setTimeout(zet, 300);
      }
    };
    if (naLoad) {
      if (document.readyState === "complete") naIdle();
      else window.addEventListener("load", naIdle, { once: true });
    }

    return () => {
      gestopt = true;
      waarnemer.disconnect();
      window.removeEventListener("load", naIdle);
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [element, marge, naLoad, dichtbij]);

  return [ref, dichtbij, element] as const;
}
