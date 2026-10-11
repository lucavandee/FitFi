import React from "react";

/**
 * Zet de gemeten hoogte van een element als CSS-variabele op :root, zolang
 * `actief` waar is, en haalt hem weer weg als het element verdwijnt.
 *
 * Waarvoor: de vaste lagen van de shell (kop, mobiele onderbalk, cookiebanner)
 * hebben geen vaste hoogte. De kop is 90 px op elke breedte, maar wordt hoger
 * bij grotere tekst; de banner hangt af van zijn tekst. CSS die er rekening mee
 * moet houden (scroll-padding, sticky labels, de plek van de banner) leest de
 * variabele in plaats van een getal dat ooit klopte.
 *
 * offsetHeight en niet getBoundingClientRect: de onderbalk schuift bij het
 * laden in met een transform, en die hoort niet in de hoogte te zitten.
 *
 * Zonder ResizeObserver (oude browsers, jsdom) valt hij terug op het
 * resize-event van het venster.
 */
export function useHoogteInVariabele(
  ref: React.RefObject<HTMLElement>,
  naam: string,
  actief = true,
): void {
  React.useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!actief || !el) {
      root.style.removeProperty(naam);
      return;
    }

    const zet = () => root.style.setProperty(naam, `${el.offsetHeight}px`);
    zet();

    if (typeof ResizeObserver !== "undefined") {
      const waarnemer = new ResizeObserver(zet);
      waarnemer.observe(el);
      return () => {
        waarnemer.disconnect();
        root.style.removeProperty(naam);
      };
    }

    window.addEventListener("resize", zet);
    return () => {
      window.removeEventListener("resize", zet);
      root.style.removeProperty(naam);
    };
  }, [ref, naam, actief]);
}
