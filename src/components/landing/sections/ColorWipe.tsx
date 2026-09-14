import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ScrollScene } from "../scroll/ScrollScene";

/**
 * Kleuradvies als gebaar: een naad schuift over hetzelfde beeld.
 *
 * Links van de naad staat een koelere weergave, rechts een warmere. Zo zie je
 * eerst wat kleurtemperatuur met een gezicht doet, en pas daarna staat er wat
 * een palet is. Twee lagen met dezelfde foto, de bovenste weggeknipt met
 * clip-path, gestuurd door de scrollvoortgang.
 *
 * Bewust geen bewering: dit is een demonstratie van temperatuur, niet iemands
 * persoonlijke uitkomst. De foto is een voorbeeld en het onderschrift zegt dat
 * er letterlijk bij. Zonder die regel leest het als "dit is jouw palet",
 * terwijl er geen profiel aan te pas komt.
 *
 * De filters staan bewust binnen de huisstijl: de warme laag trekt richting
 * terracotta en zand, niet richting knalgeel.
 */

const BEELD = "/images/3afbe258-11f3-4a98-b82e-a2939fd1de19.webp";

/*
 * Het bronbeeld heeft rechtsonder een UI-kaart ingebakken met "12+", "98%" en
 * de letterlijke placeholders "tiny hint" en "label hint". Die cijfers steunen
 * nergens op en horen in dezelfde categorie als "4.9/5" en "2.400+ gebruikers",
 * die op 2026-08-07 uit de copy zijn gehaald. Een percentage in een plaatje is
 * net zo goed een claim, alleen ontsnapte het aan die opschoning omdat het geen
 * tekst in de code is.
 *
 * Tot er een schone export ligt, snijden we de kaart uit beeld: de verhouding
 * 100/62 met object-position top toont alleen de bovenste 62 procent van het
 * vierkante bronbeeld, en de kaart begint pas op 67 procent. Buste en
 * kleurenwaaier vallen volledig binnen die uitsnede.
 *
 * Deze verhouding is bewust vast en niet in svh: dan hangt de uitsnede af van
 * de schermhoogte en kan de kaart op een hoog scherm alsnog terugkomen.
 */
const UITSNEDE = "aspect-[100/62]";
const UITSNEDE_POSITIE = "center top";

/*
 * Warmer: sepia levert goud, de negatieve hue-rotate trekt dat door naar
 * terracotta in plaats van geel. Meer saturatie houdt de huid levend.
 */
const WARM = "sepia(0.55) saturate(1.45) hue-rotate(-14deg) brightness(1.02)";

/*
 * Koeler: minder verzadiging plus een kleine draai naar roze. Dat is de
 * ondertoon die in kleuranalyse koel heet; een draai naar blauw maakt er een
 * filter van in plaats van een huidtoon.
 */
const KOEL = "saturate(0.72) hue-rotate(-8deg) brightness(1.05) contrast(1.02)";

/* Letterlijk de punten uit de bestaande sectie. Inhoud ongewijzigd. */
const PUNTEN = [
  "Persoonlijk kleurpalet op basis van je kenmerken",
  "Seizoensgebonden aanbevelingen",
  "Kleuren om te vermijden met uitleg waarom",
];

const ONDERSCHRIFT =
  "Dezelfde foto, twee kleurtemperaturen. Dit is een voorbeeld, geen uitslag van jouw profiel.";

function Kop() {
  return (
    <header className="max-w-prose">
      <span className="block text-xs font-semibold uppercase tracking-[2.5px] text-[#A85740]">
        Kleuradvies
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-4 leading-snug">
        Tinten die bij jou horen
      </h2>
      <p className="text-base text-[#4A4A4A] mt-4 leading-relaxed">
        Geen trends volgen. De quiz analyseert je contrast, ondertoon en
        seizoenstype om kleuren te vinden die jouw gezicht laten stralen.
      </p>
    </header>
  );
}

function Punt({ tekst }: { tekst: string }) {
  return (
    <span className="flex items-start gap-3 text-base text-[#4A4A4A] leading-relaxed">
      <span
        className="w-2 h-2 rounded-full bg-[#A85740] mt-2.5 shrink-0"
        aria-hidden="true"
      />
      {tekst}
    </span>
  );
}

/** Een van de twee weergaven, met het label eronder. */
function Weergave({
  filter,
  label,
  alt,
}: {
  filter: string;
  label: string;
  alt: string;
}) {
  return (
    <figure className="m-0">
      <img
        src={BEELD}
        alt={alt}
        width={2048}
        height={2048}
        loading="lazy"
        style={{ filter, objectPosition: UITSNEDE_POSITIE }}
        className={`w-full ${UITSNEDE} object-cover rounded-2xl border border-[#E5E5E5]`}
      />
      <figcaption className="text-sm font-medium text-[#6E6E6E] mt-3">
        {label}
      </figcaption>
    </figure>
  );
}

/**
 * Wat er staat als pinnen niet kan: de twee weergaven naast elkaar, met het
 * label erbij. Geen uitgeklede versie van de scene maar een eigen opbouw, die
 * dezelfde vergelijking in een oogopslag laat zien.
 *
 * Loopt in de vastgezette variant ook mee als sr-only, dus dit is de tekst die
 * schermlezers en zoeken op de pagina vinden.
 */
function Statisch() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <Kop />
          <ul className="mt-8 space-y-4 list-none p-0">
            {PUNTEN.map((punt) => (
              <li key={punt}>
                <Punt tekst={punt} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Weergave
              filter={KOEL}
              label="Koeler"
              alt="Voorbeeldfoto in een koelere kleurtemperatuur"
            />
            <Weergave
              filter={WARM}
              label="Warmer"
              alt="Dezelfde voorbeeldfoto in een warmere kleurtemperatuur"
            />
          </div>
          <p className="text-sm text-[#6E6E6E] mt-4 leading-relaxed max-w-prose">
            {ONDERSCHRIFT}
          </p>
        </div>
      </div>
    </div>
  );
}

/* De geanimeerde stage. Alles hierin is decoratief: de echte tekst staat in de
   statische variant, die in de pinned branch als sr-only meeloopt. */
function Stage({ voortgang }: { voortgang: MotionValue<number> }) {
  /*
   * De koele laag ligt bovenop en wordt van rechts weggeknipt. Bij 10 procent
   * dekt hij bijna het hele beeld, bij 90 procent blijft er links een strook
   * over. De naad loopt dus van rechts naar links en de warme kant groeit mee.
   */
  const inzet = useTransform(voortgang, [0.08, 0.95], [10, 90], {
    clamp: true,
  });
  const clipPath = useTransform(inzet, (x) => `inset(0 ${x}% 0 0)`);
  const naadLinks = useTransform(inzet, (x) => `${100 - x}%`);

  return (
    <div className="relative w-full h-full" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full grid grid-cols-12 gap-8 items-center">
        <div className="col-span-5">
          <Kop />
          <ul className="mt-8 space-y-4 list-none p-0">
            {PUNTEN.map((punt, i) => (
              <Verschijnt key={punt} voortgang={voortgang} index={i}>
                <Punt tekst={punt} />
              </Verschijnt>
            ))}
          </ul>
        </div>

        <div className="col-span-7">
          <div
            className={`relative w-full ${UITSNEDE} rounded-2xl overflow-hidden border border-[#E5E5E5] bg-white`}
          >
            {/* Onderste laag: de warme weergave, altijd volledig aanwezig. */}
            <img
              src={BEELD}
              alt=""
              width={2048}
              height={2048}
              loading="lazy"
              style={{ filter: WARM, objectPosition: UITSNEDE_POSITIE }}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Bovenste laag: de koele weergave, van rechts weggeknipt. */}
            <motion.div className="absolute inset-0" style={{ clipPath }}>
              <img
                src={BEELD}
                alt=""
                width={2048}
                height={2048}
                loading="lazy"
                style={{ filter: KOEL, objectPosition: UITSNEDE_POSITIE }}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#4A4A4A]">
              Koeler
            </span>
            <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#4A4A4A]">
              Warmer
            </span>

            {/* Het lijntje maakt zichtbaar dat dit een naad is en geen laadfout. */}
            <motion.div
              className="absolute top-0 bottom-0 w-[2px] bg-[#A85740]"
              style={{ left: naadLinks, marginLeft: -1 }}
            />
          </div>

          <p className="text-sm text-[#6E6E6E] mt-4 leading-relaxed">
            {ONDERSCHRIFT}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Een punt komt op zijn beurt in beeld en blijft daarna staan. */
function Verschijnt({
  voortgang,
  index,
  children,
}: {
  voortgang: MotionValue<number>;
  index: number;
  children: React.ReactNode;
}) {
  const start = 0.1 + index * 0.2;
  const eind = start + 0.16;
  const opacity = useTransform(voortgang, [start, eind], [0, 1], {
    clamp: true,
  });
  const x = useTransform(voortgang, [start, eind], [-12, 0], { clamp: true });

  return (
    <motion.li style={{ opacity, x }}>
      {children}
    </motion.li>
  );
}

export default function ColorWipe() {
  /*
   * aria-label in plaats van een sr-only kop met aria-labelledby: de echte h2
   * staat al in Kop, die in beide varianten precies een keer voor hulpsoftware
   * bestaat. Een extra sr-only kop zou dezelfde tekst dubbel voorlezen.
   */
  return (
    <section className="bg-[#F5F0EB]" aria-label="Kleuradvies">
      <ScrollScene hoogte="180vh" statisch={<Statisch />}>
        {(voortgang) => <Stage voortgang={voortgang} />}
      </ScrollScene>
    </section>
  );
}
