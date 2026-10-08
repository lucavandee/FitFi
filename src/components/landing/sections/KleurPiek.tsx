import { forwardRef, useId, useRef, type CSSProperties, type RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { beatBereik } from "@/components/landing/scroll/ScrollScene";
import EigenBeeld, { type Beeldbron } from "@/components/landing/beeld/EigenBeeld";
import Beeldlabel, { Verloop } from "@/components/landing/beeld/Beeldlabel";
import { useMediaquery } from "@/components/landing/beeld/useMediaquery";
import { getColorPalette, type ColorSwatch } from "@/data/colorPalettes";
import { LAPPEN, PALETSLEUTEL, KLEURPIEK_VIEWBOX, type Lap } from "@/content/kleurpiek";
import { W2, W2_FOTO_AAN } from "@/content/beeld";
import { LANDING_COPY } from "@/content/landingCopy";

const COPY = LANDING_COPY.kleur;

/*
 * De lichtgang (plan "Onder de hero", 4.2, herzien na de stillpoort van
 * 8 oktober). Eerst was dit een wipe die de stof liet overgaan in zes platte
 * kleurvlakken. Op de preview las dat als karton op hout, met halverwege een
 * harde snijlijn door de lappen. Nu blijft de stof altijd zichtbaar: tijdens
 * het scrollen dimt de tafel, licht steeds een lap op en komt zijn naam op het
 * hout. Na de zesde gaat het licht weer aan en staan alle namen er. De stof is
 * lokaal naar de staal gecorrigeerd (Delta E 2000 hoogstens 2,90), dus wat
 * oplicht is de kleur uit het rapport.
 *
 * Alle bereiken komen uit beatBereik: framer-motion geeft ze als keyframe-
 * offsets door aan de Web Animations API, en die gooit buiten [0,1]
 * (CLAUDE.md deel 16).
 */

/** Het deel van de voortgang waarin de lichtgang loopt. */
export const LICHT_BAND = { van: 0.1, tot: 0.9 } as const;
/** Hoe donker de tafel en de lappen die niet aan de beurt zijn worden (dekking van #1A1A1A). */
export const DIMMING = 0.45;
/** De dimming: erin bij de eerste lap, eruit na de laatste. */
export const DIM_BEREIK = beatBereik(LICHT_BAND.van, LICHT_BAND.tot);

const lapBreedte = (aantal: number) => (LICHT_BAND.tot - LICHT_BAND.van) / aantal;

/** De band van lap i: een gelijk deel van LICHT_BAND. Opeenvolgende lappen vloeien in elkaar over. */
export function lapBereik(i: number, aantal: number): number[] {
  const breedte = lapBreedte(aantal);
  return beatBereik(LICHT_BAND.van + i * breedte, LICHT_BAND.van + (i + 1) * breedte);
}

/** De naam van lap i komt aan het begin van zijn band en blijft daarna staan. */
export function naamBereik(i: number, aantal: number): number[] {
  return beatBereik(LICHT_BAND.van + i * lapBreedte(aantal), 1);
}

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
 * meer op elkaar passen: dan geen lichtgang over een beeld dat iets anders
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
const BRONNEN: readonly Beeldbron[] = [
  { set: W2.set, sizes: "(min-width: 1024px) 50vw, (min-width: 768px) 560px, 100vw" },
];
const BEELD_KLASSE = "absolute inset-0 h-full w-full object-cover";

/**
 * De contour van elke lap als clipPath in eenheden van de figuur (0 tot 1),
 * zodat hij op elke maat over dezelfde lap valt. De paden staan in een viewBox
 * van 1000 x 1250, de figuur is 4:5.
 */
function Contouren({ stalen, idVoor }: { stalen: Staal[]; idVoor: (i: number) => string }) {
  const { breedte, hoogte } = KLEURPIEK_VIEWBOX;
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {stalen.map(({ lap }, i) => (
          <clipPath key={lap.staal} id={idVoor(i)} clipPathUnits="objectBoundingBox">
            <path d={lap.pad} transform={`scale(${1 / breedte} ${1 / hoogte})`} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}

/** Dezelfde foto, geknipt op een lap, boven de dimming: zo licht die lap op. */
function Lapuitsnede({ clipId, voortgang, bereik }: { clipId: string; voortgang: MotionValue<number>; bereik: number[] }) {
  const dekking = useTransform(voortgang, bereik, [0, 1, 1, 0], { clamp: true });
  return (
    <motion.div className="absolute inset-0" style={{ opacity: dekking, clipPath: `url(#${clipId})` }} aria-hidden="true">
      <EigenBeeld bronnen={BRONNEN} alt="" className={BEELD_KLASSE} />
    </motion.div>
  );
}

function Lapnaam({ staal, dekking }: { staal: Staal; dekking: MotionValue<number> | number }) {
  const { breedte, hoogte } = KLEURPIEK_VIEWBOX;
  return (
    <motion.span
      className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium leading-5 text-white"
      style={{ left: pct(staal.lap.naam.x, breedte), top: pct(staal.lap.naam.y, hoogte), opacity: dekking }}
    >
      {staal.kleur.name}
    </motion.span>
  );
}

function BewegendeNaam({ staal, voortgang, bereik }: { staal: Staal; voortgang: MotionValue<number>; bereik: number[] }) {
  const dekking = useTransform(voortgang, bereik, [0, 1, 1, 1], { clamp: true });
  return <Lapnaam staal={staal} dekking={dekking} />;
}

/** De lichtgang over W2: dimming, zes oplichtende lappen en hun namen. */
function Lichtgang({ stalen, voortgang }: { stalen: Staal[]; voortgang: MotionValue<number> }) {
  const basis = useId().replace(/:/g, "");
  const idVoor = (i: number) => `lap-${basis}-${i}`;
  const dim = useTransform(voortgang, DIM_BEREIK, [0, DIMMING, DIMMING, 0], { clamp: true });
  return (
    <>
      <Contouren stalen={stalen} idVoor={idVoor} />
      <motion.div className="pointer-events-none absolute inset-0 bg-[#1A1A1A]" style={{ opacity: dim }} aria-hidden="true" />
      {stalen.map((staal, i) => (
        <Lapuitsnede key={staal.lap.staal} clipId={idVoor(i)} voortgang={voortgang} bereik={lapBereik(i, stalen.length)} />
      ))}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {stalen.map((staal, i) => (
          <BewegendeNaam key={staal.lap.staal} staal={staal} voortgang={voortgang} bereik={naamBereik(i, stalen.length)} />
        ))}
      </div>
    </>
  );
}

/** Zonder beweging: geen dimming, alle namen staan er. */
function StilleNamen({ stalen }: { stalen: Staal[] }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {stalen.map((staal) => (
        <Lapnaam key={staal.lap.staal} staal={staal} dekking={1} />
      ))}
    </div>
  );
}

/** W2 met label; in beweging de lichtgang, anders de namen. */
function KleurBeeld({
  stalen,
  voortgang,
  figuurRef,
  className = "",
  style,
}: {
  stalen: Staal[];
  voortgang?: MotionValue<number>;
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
      <EigenBeeld bronnen={BRONNEN} alt={W2.alt} className={BEELD_KLASSE} />
      {voortgang ? <Lichtgang stalen={stalen} voortgang={voortgang} /> : <StilleNamen stalen={stalen} />}
      <Verloop achtergrond={W2.verloop} />
      <Beeldlabel zinnen={W2.label} hoek={{ onderLg: W2.labelHoek, vanafLg: W2.labelHoek }} tweeRegels="altijd" />
    </figure>
  );
}

/** Eén rij van de lijst: de staal zoals het rapport hem toont, en zijn naam. */
function Lijstrij({ staal, streep }: { staal: Staal; streep?: MotionValue<number> }) {
  return (
    <li className="relative flex items-center gap-4 border-t border-[#E5E5E5] py-3 last:border-b">
      {streep && (
        <motion.span
          className="absolute -left-4 top-1/2 h-8 w-0.5 -translate-y-1/2 bg-[#1A1A1A]"
          style={{ opacity: streep }}
          aria-hidden="true"
        />
      )}
      <span
        className="block h-8 w-8 flex-none border border-[#E5E5E5]"
        style={{ backgroundColor: staal.kleur.hex }}
        aria-hidden="true"
      />
      <span className="text-base font-semibold text-[#1A1A1A]">{staal.kleur.name}</span>
    </li>
  );
}

/** Met lichtgang: een streep voor de rij zolang zijn lap oplicht. */
function BewegendeLijstrij({ staal, voortgang, bereik }: { staal: Staal; voortgang: MotionValue<number>; bereik: number[] }) {
  const streep = useTransform(voortgang, bereik, [0, 1, 1, 0], { clamp: true });
  return <Lijstrij staal={staal} streep={streep} />;
}

/** De zes kleuren als echte lijst, zichtbaar voor iedereen. Dit is wat het rapport toont. */
const Kleurlijst = forwardRef<HTMLUListElement, { stalen: Staal[]; voortgang?: MotionValue<number> }>(
  function Kleurlijst({ stalen, voortgang }, ref) {
    return (
      <ul ref={ref} aria-label={COPY.lijst.tekst} className="mt-6 max-w-sm">
        {stalen.map((staal, i) =>
          voortgang ? (
            <BewegendeLijstrij key={staal.kleur.name} staal={staal} voortgang={voortgang} bereik={lapBereik(i, stalen.length)} />
          ) : (
            <Lijstrij key={staal.kleur.name} staal={staal} />
          ),
        )}
      </ul>
    );
  },
);

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

function Profielzin() {
  return <p className="max-w-prose text-base leading-relaxed text-[#4A4A4A]">{COPY.profiel.tekst}</p>;
}

function Slotzin() {
  return <p className="max-w-prose text-base leading-relaxed text-[#4A4A4A]">{COPY.slot.tekst}</p>;
}

/** Terugval T-W2 (plan 10): de zes stalen als vlakken met hun naam, zonder foto en zonder lichtgang. */
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
 * de linkerschermrand, net onder de kop. Rechts scrolt eerst de vraag weg; het
 * blok met de lijst plakt dan naast het beeld, en terwijl de sectie voorbij
 * scrolt licht op de tafel om de beurt de lap op van de rij die aan de beurt
 * is. Zo krijgt elke lap ongeveer 145 px scroll (220vh op 900 hoog) en hangen
 * beeld en lijst nooit stil naast een lege kolom.
 */
function VasteKolom({ stalen }: { stalen: Staal[] }) {
  const sectie = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectie, offset: ["start start", "end end"] });
  const plakTop = { top: "calc(var(--header-h, 90px) + 32px)" };

  return (
    <section
      ref={sectie}
      id="kleur"
      tabIndex={-1}
      aria-labelledby="kleur-kop"
      className="relative flex min-h-[220vh] flex-col bg-[#F5F0EB] outline-none"
    >
      {/* Baan over de volle hoogte van de sectie; het beeld plakt erin. */}
      <div className="absolute inset-y-0 left-0">
        <KleurBeeld
          stalen={stalen}
          voortgang={scrollYProgress}
          className="sticky"
          style={{
            ...plakTop,
            height: "min(calc(100svh - var(--header-h, 90px) - 64px), calc((50vw - 24px) * 1.25))",
          }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-12 gap-6 px-4 sm:px-6 lg:px-8">
        {/* pt-24: het antwoord staat zo minstens 200 px onder de onderrand van W1 (G23). */}
        <div className="col-span-6 col-start-7 pb-24 pt-24">
          <Kop />
          <div className="sticky mt-16" style={plakTop}>
            <Profielzin />
            <Kleurlijst stalen={stalen} voortgang={scrollYProgress} />
            <div className="mt-8">
              <Slotzin />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Telefoon en tablet in beweging: de lichtgang volgt het beeld terwijl het voorbij komt. */
function BewegendGestapeld({ stalen }: { stalen: Staal[] }) {
  const figuur = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: figuur, offset: ["start 0.8", "end 0.45"] });
  return (
    <Gestapeld
      beeld={<KleurBeeld stalen={stalen} voortgang={scrollYProgress} figuurRef={figuur} className="w-full" />}
      lijst={<Kleurlijst stalen={stalen} voortgang={scrollYProgress} />}
    />
  );
}

/** Reduced motion, of te klein voor de sticky kolom zonder palet: alles stil, alle namen in beeld. */
function StilGestapeld({ stalen }: { stalen: Staal[] | null }) {
  if (stalen && !W2_FOTO_AAN) return <Gestapeld beeld={<Stalenvlakken stalen={stalen} />} />;
  return (
    <Gestapeld
      beeld={<KleurBeeld stalen={stalen ?? []} className="w-full" />}
      lijst={stalen ? <Kleurlijst stalen={stalen} /> : undefined}
    />
  );
}

/**
 * Onder 1024 px, onder 600 px hoog en bij reduced motion: tekst, beeld, lijst
 * en tekst onder elkaar. Het beeld loopt op de telefoon over de volle breedte
 * en is tussen 768 en 1023 px hoogstens 560 px breed.
 */
function Gestapeld({ beeld, lijst }: { beeld: JSX.Element; lijst?: JSX.Element }) {
  return (
    <section id="kleur" tabIndex={-1} aria-labelledby="kleur-kop" className="bg-[#F5F0EB] py-16 outline-none md:py-24">
      {/* Onder 1024 px onder elkaar, het beeld op de telefoon over de volle
          breedte. Vanaf 1024 px (te laag voor de sticky kolom, of reduced
          motion) het beeld links op kolom 1 tot 6 en de tekst rechts. */}
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:px-8">
        <div className="px-4 sm:px-6 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:px-0">
          <Kop />
          <div className="mt-8">
            <Profielzin />
          </div>
        </div>

        <div className="mx-auto mt-8 md:max-w-[560px] lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:w-full lg:max-w-none">
          {beeld}
        </div>

        <div className="mt-8 px-4 sm:px-6 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:px-0">
          {lijst}
          <div className="mt-8">
            <Slotzin />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Kleur, de piek (plan "Onder de hero", 4.2): de draai van gevoel naar bewijs.
 * De quiz vraagt welke kleuren je graag draagt; voor het voorbeeldprofiel licht
 * op tafel om de beurt de lap op van elke kleur die zijn rapport onder "Draag
 * deze kleuren" toont.
 *
 * Alleen dekking beweegt (dimming, lapuitsneden, namen, streep in de lijst):
 * geen layoutverschuiving, en terugscrollen draait alles terug. Geen focusbaar
 * element in het beeld.
 *
 * `vast` staat standaard aan. Komt er ooit een eigen vastgezette scene na deze
 * sectie (plan 11), dan gaat hij uit en loopt de lichtgang ook op desktop in de flow.
 */
export default function KleurPiek({ vast = true }: { vast?: boolean }) {
  const beperkteBeweging = useReducedMotion();
  const groot = useMediaquery(VASTE_KOLOM);
  const stalen = stalenUitPalet();

  const modus: Modus = beperkteBeweging || !stalen ? "stil" : vast && groot && W2_FOTO_AAN ? "vast" : "flow";

  if (modus === "vast" && stalen) return <VasteKolom stalen={stalen} />;
  if (modus === "flow" && stalen && W2_FOTO_AAN) return <BewegendGestapeld stalen={stalen} />;
  return <StilGestapeld stalen={stalen} />;
}
