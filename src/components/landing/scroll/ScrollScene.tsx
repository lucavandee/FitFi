import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useKanPinnen } from "./useKanPinnen";

/**
 * Een vastgezette scene: een hoge spacer met een sticky stage erin. De scroll
 * door de spacer levert een voortgang van 0 tot 1 waarmee de inhoud gestuurd
 * wordt.
 *
 * Waarom sticky en niet fixed: framer-motion berekent de scrollvoortgang door
 * offsetParent omhoog te lopen. Voor een fixed element is die null, waardoor de
 * meting terugvalt op de eigen offset en de voortgang niet meer klopt.
 *
 * De pin valt weg bij reduced motion, onder 1024px breed en onder 700px hoog.
 * Dat laatste dekt ook 400 procent zoom: WCAG 1.4.10 eist dat er dan geen
 * content verloren gaat, en een sticky stage van 100svh scrolt niet intern.
 * In die gevallen komt `statisch` in beeld: een echte alternatieve opbouw, niet
 * dezelfde scene met een andere transitie.
 *
 * Regel bij gebruik: geen focusbare elementen binnen de stage. De fixed navbar
 * en de mobiele onderbalk dekken de randen af, dus een getabte link zou eronder
 * verdwijnen (WCAG 2.4.11). Links en knoppen horen in het statische blok erna.
 */
export function ScrollScene({
  hoogte = "200vh",
  statisch,
  children,
  className = "",
}: {
  /** Hoeveel scroll de scene opeet. Onder 200vh leest het als een glitch. */
  hoogte?: string;
  /** Wat er staat als pinnen niet kan. Verplicht: zonder dit valt content weg. */
  statisch: React.ReactNode;
  children: (voortgang: MotionValue<number>) => React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const beperkteBeweging = useReducedMotion();
  const kanPinnen = useKanPinnen();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  if (beperkteBeweging || !kanPinnen) {
    return <div className={className}>{statisch}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ height: hoogte, position: "relative" }}
    >
      {/*
        De geanimeerde stage is decoratief: elke beat staat op aria-hidden.
        Daarom staat dezelfde inhoud hier ook als statische tekst, alleen
        zichtbaar voor schermlezers en voor zoeken op de pagina. Zonder dit
        krijgt een schermlezergebruiker op desktop een lege sectie.
      */}
      <div className="sr-only">{statisch}</div>

      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        {children(scrollYProgress)}
      </div>
    </div>
  );
}

/**
 * Blendt een kind in en uit binnen een deel van de scene-voortgang. Gebruikt
 * voor "een ding tegelijk": elke beat krijgt zijn eigen band.
 *
 * De stage is een decoratieve weergave van tekst die ook in de statische
 * variant staat, dus alles hierin is aria-hidden. Schermlezers en zoeken op de
 * pagina werken tegen het statische blok, niet tegen de animatie.
 */
export function Beat({
  voortgang,
  van,
  tot,
  children,
  className = "",
}: {
  voortgang: MotionValue<number>;
  van: number;
  tot: number;
  children: React.ReactNode;
  className?: string;
}) {
  const marge = Math.min(0.06, (tot - van) / 3);
  const opacity = useTransform(
    voortgang,
    [van - marge, van + marge, tot - marge, tot + marge],
    [0, 1, 1, 0],
    { clamp: true }
  );

  return (
    <motion.div
      className={className}
      style={{ gridArea: "1 / 1", opacity }}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}
