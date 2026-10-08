import { useRef, type CSSProperties, type RefObject } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { beatBereik } from "@/components/landing/scroll/ScrollScene";
import EigenBeeld from "@/components/landing/beeld/EigenBeeld";
import Beeldlabel, { Verloop } from "@/components/landing/beeld/Beeldlabel";
import { useMediaquery } from "@/components/landing/beeld/useMediaquery";
import { getColorPalette, type ColorSwatch } from "@/data/colorPalettes";
import { LAPPEN, PALETSLEUTEL, KLEURPIEK_VIEWBOX, type Lap } from "@/content/kleurpiek";
import { W2, W2_FOTO_AAN } from "@/content/beeld";
import { LANDING_COPY } from "@/content/landingCopy";

const COPY = LANDING_COPY.kleur;

/**
 * De wipe (plan "Onder de hero", 4.2): van p = b tot p = c gaat de stalenlaag
 * van boven naar onder open. Alleen via beatBereik, dat het invoerbereik binnen
 * [0,1] houdt (CLAUDE.md deel 16): framer-motion geeft dit bereik als
 * keyframe-offsets door aan de Web Animations API, en die gooit buiten [0,1].
 * beatBereik(0.15, 0.90) is [0.09, 0.21, 0.84, 0.96].
 */
export const WIPE_BEREIK = beatBereik(0.15, 0.9);
/** clip-path inset onderaan, in procent: 100 is dicht, 0 is helemaal open. */
export const WIPE_INSET = [100, 100, 0, 0];

/** Vanaf deze maat staat het beeld in een sticky kolom; daaronder in de flow. */
export const VASTE_KOLOM = "(min-width: 1024px) and (min-height: 600px)";

export type Modus = "vast" | "flow" | "stil";

export interface Staal {
  kleur: ColorSwatch;
  lap: Lap;
}

/**
 * De zes kleuren onder "Draag deze kleuren", in de volgorde van het rapport,
 * met de lap waar ze op vallen. null als het palet en de gemeten lappen niet
 * meer op elkaar passen: dan geen stalenlaag over een beeld dat iets anders
 * toont (de test faalt dan ook).
 */
export function stalenUitPalet(): Staal[] | null {
  const kleuren = getColorPalette(PALETSLEUTEL)?.doColors ?? [];
  if (kleuren.length !== LAPPEN.length) return null;
  const stalen: Staal[] = [];
  for (const kleur of kleuren) {
    const lap = LAPPEN.find((l) => l.staal === kleur.name);
    if (!lap) return null;
    stalen.push({ kleur, lap });
  }
  return stalen;
}

const pct = (waarde: number, totaal: number) => `${(waarde / totaal) * 100}%`;

/** De stalenlaag: zes contouren in de kleur uit het palet en zes namen op het hout. */
function Stalenlaag({ stalen, clipPath }: { stalen: Staal[]; clipPath?: MotionValue<string> }) {
  const { breedte, hoogte } = KLEURPIEK_VIEWBOX;
  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ clipPath }} aria-hidden="true" data-stalenlaag="">
      <svg
        viewBox={`0 0 ${breedte} ${hoogte}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        {stalen.map(({ kleur, lap }) => (
          <path key={lap.staal} d={lap.pad} fill={kleur.hex} />
        ))}
      </svg>
      {stalen.map(({ kleur, lap }) => (
        <span
          key={lap.staal}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium leading-5 text-white"
          style={{ left: pct(lap.naam.x, breedte), top: pct(lap.naam.y, hoogte) }}
        >
          {kleur.name}
        </span>
      ))}
    </motion.div>
  );
}

/** W2 met label, en in de modi met beweging de stalenlaag eroverheen. */
function KleurBeeld({
  stalen,
  clipPath,
  figuurRef,
  className = "",
  style,
}: {
  stalen: Staal[];
  clipPath?: MotionValue<string>;
  figuurRef?: RefObject<HTMLElement>;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <figure
      ref={figuurRef}
      className={`relative m-0 aspect-[4/5] overflow-hidden ${className}`}
      style={{ backgroundColor: W2.set.mediaankleur, ...style }}
    >
      <EigenBeeld
        bronnen={[{ set: W2.set, sizes: "(min-width: 1024px) 50vw, (min-width: 768px) 560px, 100vw" }]}
        alt={W2.alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <Verloop achtergrond={W2.verloop} />
      {clipPath && <Stalenlaag stalen={stalen} clipPath={clipPath} />}
      <Beeldlabel zinnen={W2.label} hoek={{ onderLg: W2.labelHoek, vanafLg: W2.labelHoek }} tweeRegels="altijd" />
    </figure>
  );
}

/** Desktop: de wipe volgt de scroll door de hele sectie. */
function useWipeOverSectie(sectie: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({ target: sectie, offset: ["start start", "end end"] });
  const inset = useTransform(scrollYProgress, WIPE_BEREIK, WIPE_INSET, { clamp: true });
  return useMotionTemplate`inset(0% 0% ${inset}% 0%)`;
}

/** Telefoon en tablet: de wipe volgt het beeld terwijl het voorbij komt. */
function useWipeOverFiguur(figuur: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({ target: figuur, offset: ["start 0.8", "end 0.5"] });
  const inset = useTransform(scrollYProgress, WIPE_BEREIK, WIPE_INSET, { clamp: true });
  return useMotionTemplate`inset(0% 0% ${inset}% 0%)`;
}

function Kop() {
  return (
    <>
      <p className="text-sm text-[#4A4A4A]">{COPY.stap.tekst}</p>
      <h2 id="kleur-kop" className="mt-3 text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A]">
        {COPY.kop.tekst}
      </h2>
      {/* Het antwoord zoals de quiz het toont, met het gekozen radiopunt. */}
      <div className="mt-8 flex items-start gap-3">
        <span
          className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border-2 border-[#A85740]"
          aria-hidden="true"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#A85740]" />
        </span>
        <p>
          <span className="block text-base font-semibold text-[#1A1A1A]">{COPY.antwoord.tekst}</span>
          <span className="block text-sm text-[#4A4A4A]">{COPY.antwoordUitleg.tekst}</span>
        </p>
      </div>
    </>
  );
}

function Profielzin({ stalen, lijstZichtbaar }: { stalen: Staal[] | null; lijstZichtbaar: boolean }) {
  return (
    <>
      <p className="max-w-prose text-base leading-relaxed text-[#4A4A4A]">{COPY.profiel.tekst}</p>
      {/* De echte lijst. In beweging staat hij alleen voor schermlezers hier; de
          zichtbare legenda (reduced motion) staat onder het beeld. */}
      {stalen && !lijstZichtbaar && (
        <ul className="sr-only">
          {stalen.map(({ kleur }) => (
            <li key={kleur.name}>{kleur.name}</li>
          ))}
        </ul>
      )}
    </>
  );
}

function Slotzin() {
  return <p className="max-w-prose text-base leading-relaxed text-[#4A4A4A]">{COPY.slot.tekst}</p>;
}

/** Reduced motion: zes rechte stalen van 48 px met de naam eronder. Dit is de lijst. */
function Legenda({ stalen }: { stalen: Staal[] }) {
  return (
    <ul aria-label={COPY.lijst.tekst} className="mt-6 grid grid-cols-3 gap-4 px-4 sm:grid-cols-6 sm:px-6 md:px-0">
      {stalen.map(({ kleur }) => (
        <li key={kleur.name} className="flex flex-col items-start gap-2">
          <span
            className="block h-12 w-12 border border-[#E5E5E5]"
            style={{ backgroundColor: kleur.hex }}
            aria-hidden="true"
          />
          <span className="text-sm text-[#1A1A1A]">{kleur.name}</span>
        </li>
      ))}
    </ul>
  );
}

/** Terugval T-W2 (plan 10): de zes stalen als vlakken met hun naam, zonder foto en zonder wipe. */
function Stalenvlakken({ stalen }: { stalen: Staal[] }) {
  return (
    <ul aria-label={COPY.lijst.tekst} className="grid grid-cols-2 gap-6 px-4 sm:px-6 md:px-0">
      {stalen.map(({ kleur }) => (
        <li key={kleur.name}>
          <span
            className="block aspect-[4/3] w-full border border-[#E5E5E5]"
            style={{ backgroundColor: kleur.hex }}
            aria-hidden="true"
          />
          <span className="mt-2 block text-sm text-[#1A1A1A]">{kleur.name}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Desktop vanaf 1024 x 600 zonder reduced motion: het beeld staat sticky tegen
 * de linkerschermrand, net onder de kop, en de tekstkolom (kolom 7 tot 12)
 * scrolt erlangs in drie blokken met 40vh ertussen.
 */
function VasteKolom({ stalen }: { stalen: Staal[] }) {
  const sectie = useRef<HTMLElement>(null);
  const clipPath = useWipeOverSectie(sectie);

  return (
    <section
      ref={sectie}
      id="kleur"
      tabIndex={-1}
      aria-labelledby="kleur-kop"
      className="relative min-h-[220vh] bg-[#F5F0EB] outline-none"
    >
      {/* Baan over de volle hoogte van de sectie; het beeld plakt erin. */}
      <div className="absolute inset-y-0 left-0">
        <KleurBeeld
          stalen={stalen}
          clipPath={clipPath}
          className="sticky"
          style={{
            top: "calc(var(--header-h, 90px) + 32px)",
            height: "min(calc(100svh - var(--header-h, 90px) - 64px), calc((50vw - 24px) * 1.25))",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 sm:px-6 lg:px-8">
        {/* pt-24: het antwoord staat zo minstens 200 px onder de onderrand van W1 (G23). */}
        <div className="col-span-6 col-start-7 pb-24 pt-24">
          <Kop />
          <div style={{ marginTop: "40vh" }}>
            <Profielzin stalen={stalen} lijstZichtbaar={false} />
          </div>
          <div style={{ marginTop: "40vh" }}>
            <Slotzin />
          </div>
        </div>
      </div>
    </section>
  );
}

/** De beelden in de flow, met een wipe die het beeld volgt. */
function FlowBeeld({ stalen }: { stalen: Staal[] }) {
  const figuur = useRef<HTMLElement>(null);
  const clipPath = useWipeOverFiguur(figuur);
  return <KleurBeeld stalen={stalen} clipPath={clipPath} figuurRef={figuur} className="w-full" />;
}

/**
 * Onder 1024 px, onder 600 px hoog en bij reduced motion: tekst, beeld en tekst
 * onder elkaar. Het beeld loopt op de telefoon over de volle breedte en is
 * tussen 768 en 1023 px hoogstens 560 px breed.
 */
function Gestapeld({ stalen, modus }: { stalen: Staal[] | null; modus: Exclude<Modus, "vast"> }) {
  let beeld: JSX.Element;
  if (stalen && !W2_FOTO_AAN) beeld = <Stalenvlakken stalen={stalen} />;
  else if (stalen && modus === "flow") beeld = <FlowBeeld stalen={stalen} />;
  else
    beeld = (
      <>
        <KleurBeeld stalen={stalen ?? []} className="w-full" />
        {stalen && <Legenda stalen={stalen} />}
      </>
    );
  // Zonder wipe staat de lijst zichtbaar bij het beeld; anders alleen voor schermlezers.
  const lijstZichtbaar = !stalen || modus === "stil" || !W2_FOTO_AAN;

  return (
    <section id="kleur" tabIndex={-1} aria-labelledby="kleur-kop" className="bg-[#F5F0EB] py-16 outline-none md:py-24">
      {/* Onder 1024 px onder elkaar, het beeld op de telefoon over de volle
          breedte. Vanaf 1024 px (te laag voor de sticky kolom, of reduced
          motion) het beeld links op kolom 1 tot 6 en de tekst rechts. */}
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:px-8">
        <div className="px-4 sm:px-6 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:px-0">
          <Kop />
          <div className="mt-8">
            <Profielzin stalen={stalen} lijstZichtbaar={lijstZichtbaar} />
          </div>
        </div>

        <div className="mx-auto mt-8 md:max-w-[560px] lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:w-full lg:max-w-none">
          {beeld}
        </div>

        <div className="mt-8 px-4 sm:px-6 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:px-0">
          <Slotzin />
        </div>
      </div>
    </section>
  );
}

/**
 * Kleur, de piek (plan "Onder de hero", 4.2): de draai van gevoel naar bewijs.
 * De quiz vraagt welke kleuren je graag draagt; voor het voorbeeldprofiel worden
 * zes lappen stof op tafel de zes kleuren die zijn rapport onder "Draag deze
 * kleuren" toont.
 *
 * Alleen clip-path beweegt, dus geen tussenstand met halve kleurwaas en geen
 * layoutverschuiving; terugscrollen draait de wipe terug. Geen focusbaar
 * element in het beeld.
 *
 * `vast` staat standaard aan. Komt er ooit een eigen vastgezette scene na deze
 * sectie (plan 11), dan gaat hij uit en loopt de wipe ook op desktop in de flow.
 */
export default function KleurPiek({ vast = true }: { vast?: boolean }) {
  const beperkteBeweging = useReducedMotion();
  const groot = useMediaquery(VASTE_KOLOM);
  const stalen = stalenUitPalet();

  const modus: Modus = beperkteBeweging || !stalen ? "stil" : vast && groot && W2_FOTO_AAN ? "vast" : "flow";

  if (modus === "vast" && stalen) return <VasteKolom stalen={stalen} />;
  return <Gestapeld stalen={stalen} modus={modus === "vast" ? "flow" : modus} />;
}
