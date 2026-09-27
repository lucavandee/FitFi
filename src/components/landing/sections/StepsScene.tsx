import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { ScrollScene, Beat } from "../scroll/ScrollScene";

/**
 * Hoe het werkt, als scene: een stap tegelijk.
 *
 * Hier stonden drie kaarten naast elkaar. Wie drie kaarten tegelijk ziet leest
 * er geen: het oog scant de koppen en scrolt door. Door de stappen aan de
 * scroll te hangen draagt de beweging de volgorde van het proces, en staat er
 * per moment een ding waar de aandacht heen kan.
 *
 * Geen knoppen of links in de stage: de fixed navbar (72px) en de mobiele
 * onderbalk (58px) dekken de randen af, dus een getabte link zou eronder
 * verdwijnen (WCAG 2.4.11). De CTA staat elders op de pagina.
 */

type Stap = {
  nummer: string;
  kop: string;
  uitleg: string;
  meta: string;
  metaIcoon: typeof Clock;
};

const STAPPEN: Stap[] = [
  {
    nummer: "01",
    kop: "Beantwoord de quiz",
    uitleg:
      "Een korte quiz over je voorkeuren, levensstijl en kleuren. Klaar in een paar minuten.",
    meta: "~5 minuten",
    metaIcoon: Clock,
  },
  {
    nummer: "02",
    kop: "Ontvang je rapport",
    uitleg:
      "Je persoonlijke kleurpalet, stijlprofiel en seizoenstype: visueel en overzichtelijk.",
    meta: "Direct beschikbaar",
    metaIcoon: ArrowRight,
  },
  {
    nummer: "03",
    kop: "Shop je outfits",
    uitleg:
      "Outfits samengesteld op basis van jouw profiel, met directe links naar webshops.",
    meta: "Directe shoplinks",
    metaIcoon: ArrowUpRight,
  },
];

/* De band van de scene-voortgang waarin een stap in beeld is. De banden
   overlappen licht, zodat de ene stap uitblendt terwijl de volgende inkomt. */
const BANDEN: Array<[number, number]> = [
  [0, 0.36],
  [0.32, 0.68],
  [0.64, 1],
];

function Meta({ stap }: { stap: Stap }) {
  const Icoon = stap.metaIcoon;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#A85740]/10 text-[#A85740] px-3 py-1.5 text-sm font-medium">
      <Icoon className="w-4 h-4" aria-hidden="true" />
      {stap.meta}
    </span>
  );
}

function Kop() {
  return (
    <header className="max-w-prose">
      <span className="block text-xs font-semibold uppercase tracking-[2.5px] text-[#A85740]">
        Hoe het werkt
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-4 leading-snug">
        In drie stappen
      </h2>
      <p className="text-base text-[#4A4A4A] mt-4 leading-relaxed">
        Van eerste vraag tot volledig stijlrapport. Snel, persoonlijk en zonder
        gedoe.
      </p>
    </header>
  );
}

/** Wat er staat als pinnen niet kan: de drie stappen als genummerde lijst. */
function Statisch() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <Kop />
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 list-none p-0">
        {STAPPEN.map((stap) => (
          <li key={stap.nummer}>
            <article className="h-full flex flex-col bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
              <span className="text-3xl font-bold text-[#A85740] tabular-nums leading-none">
                {stap.nummer}
              </span>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mt-4">
                {stap.kop}
              </h3>
              <p className="text-base text-[#4A4A4A] mt-3 leading-relaxed flex-1">
                {stap.uitleg}
              </p>
              <span className="mt-6 self-start">
                <Meta stap={stap} />
              </span>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* De geanimeerde stage. Alles hierin is decoratief: de echte tekst staat in de
   statische variant, die in de pinned branch als sr-only meeloopt. */
function Stage({ voortgang }: { voortgang: MotionValue<number> }) {
  return (
    <div className="relative w-full h-full" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full grid grid-cols-12 gap-8 items-center">
        <div className="col-span-5">
          <Kop />
          <Stappenmeter voortgang={voortgang} />
        </div>

        <div className="col-span-7 grid">
          {STAPPEN.map((stap, i) => (
            <Beat
              key={stap.nummer}
              voortgang={voortgang}
              van={BANDEN[i][0]}
              tot={BANDEN[i][1]}
            >
              <Paneel stap={stap} voortgang={voortgang} van={BANDEN[i][0]} />
            </Beat>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Een stap in de stage. Schuift een klein stukje omhoog terwijl hij inkomt. */
function Paneel({
  stap,
  voortgang,
  van,
}: {
  stap: Stap;
  voortgang: MotionValue<number>;
  van: number;
}) {
  const y = useTransform(voortgang, [van, van + 0.08], [24, 0], { clamp: true });

  return (
    <motion.div style={{ y }} className="max-w-xl">
      <span className="block text-[88px] md:text-[120px] font-bold text-[#A85740] tabular-nums leading-none">
        {stap.nummer}
      </span>
      <span className="block text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-6 leading-snug">
        {stap.kop}
      </span>
      <span className="block text-base text-[#4A4A4A] mt-4 leading-relaxed max-w-prose">
        {stap.uitleg}
      </span>
      <span className="block mt-6">
        <Meta stap={stap} />
      </span>
    </motion.div>
  );
}

/**
 * Laat zien hoever de scene is. aria-hidden, want een teller die per scrollstap
 * ophoogt laat een schermlezer elke tussenwaarde voorlezen. De drie stappen
 * staan eenmalig als genummerde lijst in de statische variant.
 */
function Stappenmeter({ voortgang }: { voortgang: MotionValue<number> }) {
  const [actief, setActief] = React.useState(0);

  React.useEffect(() => {
    return voortgang.on("change", (p) => {
      const i = BANDEN.findIndex(([van, tot]) => p >= van && p < tot);
      setActief(i === -1 ? STAPPEN.length - 1 : i);
    });
  }, [voortgang]);

  return (
    <div className="mt-10 flex items-center gap-3" aria-hidden="true">
      <div className="flex items-center gap-2">
        {STAPPEN.map((stap, i) => (
          <span
            key={stap.nummer}
            className={`h-1 rounded-full transition-colors duration-200 ${
              i === actief ? "w-10 bg-[#A85740]" : "w-6 bg-[#E5E5E5]"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-[#6E6E6E] tabular-nums">
        Stap {actief + 1} van {STAPPEN.length}
      </span>
    </div>
  );
}

export default function StepsScene() {
  return (
    <section className="bg-[#FAFAF8]" aria-label="In drie stappen">
      <ScrollScene hoogte="260vh" statisch={<Statisch />}>
        {(voortgang) => <Stage voortgang={voortgang} />}
      </ScrollScene>
    </section>
  );
}
