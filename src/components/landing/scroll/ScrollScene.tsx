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

  // De ref hangt in beide takken aan hetzelfde element. useScroll draait
  // onvoorwaardelijk (hooks mogen niet in een if), en framer-motion gooit in
  // development een invariant zodra target.current null is: "Target ref is
  // defined but not hydrated". Zonder ref hier crashte de hele pagina in dev
  // op elke viewport onder de pin-drempel. In productie is die check
  // weggestript, maar dan meet de subscriptie stil tegen niets.
  if (beperkteBeweging || !kanPinnen) {
    return (
      <div ref={ref} className={className}>
        {statisch}
      </div>
    );
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
 * De vier knikpunten van een beat: invaden, vol, vol, uitfaden.
 *
 * De marge ligt bewust BINNEN [0,1]. Een band die op 0 begint of op 1 eindigt
 * (StepsScene gebruikt [0, 0.36], [0.32, 0.68], [0.64, 1]) leverde anders
 * -0.06 en 1.06 op. framer-motion geeft het invoerbereik van een scroll-gekoppelde
 * waarde door als keyframe-offsets aan de Web Animations API, en die eist
 * offsets in [0,1]. Vanaf 12.3x gooit dat:
 *   "Failed to execute 'animate' on 'Element': Offsets must be null or in the
 *    range [0,1]."
 * De hele landingspagina viel daardoor in de error boundary, maar alleen boven
 * 1024x700, want onder die grens pint ScrollScene niet en bestaat de motion.div
 * niet. Op 12.29.2 (de versie in package-lock.json) gebeurde het niet, dus CI
 * met `npm ci` bleef groen terwijl Netlify met een nieuwere versie bouwde.
 *
 * Het bereik moet strikt stijgend zijn, anders rekent useTransform verkeerd.
 * Daarom een minimale afstand tussen de punten in plaats van kale clamping.
 */
export function beatBereik(van: number, tot: number): number[] {
  const EPS = 0.001;
  const marge = Math.min(0.06, (tot - van) / 3);
  const a = Math.max(0, van - marge);
  const d = Math.min(1, tot + marge);
  const b = Math.min(Math.max(van + marge, a + EPS), d - 2 * EPS);
  const c = Math.min(Math.max(tot - marge, b + EPS), d - EPS);
  return [a, b, c, d];
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
  const opacity = useTransform(voortgang, beatBereik(van, tot), [0, 1, 1, 0], {
    clamp: true,
  });

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
