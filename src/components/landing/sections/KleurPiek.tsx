import { forwardRef, useRef, type CSSProperties, type RefObject } from "react";
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
 * lokaal naar de staal gecorrigeerd (Delta E 2000 hoogstens 3), dus wat
 * oplicht is de kleur uit het rapport. Het licht is zacht: per lap een donkere
 * laag met een gat ter grootte van de lap, dat met een verloop over het hout
 * uitloopt. Een uitsnede op de contour las in de beeldkritiek van fase 4 als
 * een harde vorm, niet als licht.
 *
 * Alle bereiken komen uit beatBereik: framer-motion geeft ze als keyframe-
 * offsets door aan de Web Animations API, en die gooit buiten [0,1]
 * (CLAUDE.md deel 16).
 */

/** Het deel van de voortgang waarin de lichtgang loopt. */
export const LICHT_BAND = { van: 0.1, tot: 0.9 } as const;
/** Hoe donker de tafel en de lappen die niet aan de beurt zijn worden (dekking van #1A1A1A). */
export const DIMMING = 0.32;

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

/** De rechthoek om een lap, als fractie van de figuur (0 tot 1). */
export function lapRechthoek(lap: Lap): { links: number; rechts: number; boven: number; onder: number } {
  const { breedte, hoogte } = KLEURPIEK_VIEWBOX;
  const getallen = (lap.pad.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const xs = getallen.filter((_, i) => i % 2 === 0);
  const ys = getallen.filter((_, i) => i % 2 === 1);
  return {
    links: Math.min(...xs) / breedte,
    rechts: Math.max(...xs) / breedte,
    boven: Math.min(...ys) / hoogte,
    onder: Math.max(...ys) / hoogte,
  };
}

/** Hoe ver het licht van een lap over het hout uitloopt, als fractie van breedte en hoogte. */
export const UITLOOP = { x: 0.035, y: 0.028 } as const;

const pc = (fractie: number) => `${(fractie * 100).toFixed(2)}%`;

/**
 * Het masker van de donkere laag voor een lap: zichtbaar (donker) overal behalve
 * in de rechthoek van de lap, met een zachte overgang naar buiten. Twee
 * verlopen (horizontaal en verticaal) die samen optellen; dat is de
 * standaardsamenstelling in Chrome en WebKit, dus geen mask-composite nodig.
 */
export function lapMasker(lap: Lap): string {
  const r = lapRechthoek(lap);
  const h = `linear-gradient(to right, #000 ${pc(r.links - UITLOOP.x)}, transparent ${pc(r.links)}, transparent ${pc(r.rechts)}, #000 ${pc(r.rechts + UITLOOP.x)})`;
  const v = `linear-gradient(to bottom, #000 ${pc(r.boven - UITLOOP.y)}, transparent ${pc(r.boven)}, transparent ${pc(r.onder)}, #000 ${pc(r.onder + UITLOOP.y)})`;
  return `${h}, ${v}`;
}

/** De donkere laag met het licht op een lap; zichtbaar zolang die lap aan de beurt is. */
function Lichtvlek({ lap, voortgang, bereik }: { lap: Lap; voortgang: MotionValue<number>; bereik: number[] }) {
  const dekking = useTransform(voortgang, bereik, [0, 1, 1, 0], { clamp: true });
  const masker = lapMasker(lap);
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: dekking,
        backgroundColor: `rgba(26, 26, 26, ${DIMMING})`,
        maskImage: masker,
        WebkitMaskImage: masker,
      }}
      aria-hidden="true"
    />
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

/**
 * De lichtgang over W2: per lap een donkere laag met licht op die lap, en de
 * namen. Opeenvolgende lappen vloeien in elkaar over; de eerste laag komt op uit
 * het niets en de laatste verdwijnt, dus aan begin en eind is de tafel onbewerkt.
 */
function Lichtgang({ stalen, voortgang }: { stalen: Staal[]; voortgang: MotionValue<number> }) {
  return (
    <>
      {stalen.map((staal, i) => (
        <Lichtvlek key={staal.lap.staal} lap={staal.lap} voortgang={voortgang} bereik={lapBereik(i, stalen.length)} />
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
      <ul ref={ref} role="list" aria-label={COPY.lijst.tekst} className="mt-6 max-w-prose">
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

/** Compacte vorm van de lijst voor telefoon en tablet: drie kolommen, staal met naam. */
function Kleurraster({ stalen }: { stalen: Staal[] }) {
  return (
    <ul role="list" aria-label={COPY.lijst.tekst} className="grid grid-cols-3 gap-x-4 gap-y-5">
      {stalen.map(({ kleur }) => (
        <li key={kleur.name} className="flex items-center gap-3">
          <span
            className="block h-8 w-8 flex-none border border-[#E5E5E5]"
            style={{ backgroundColor: kleur.hex }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-[#1A1A1A]">{kleur.name}</span>
        </li>
      ))}
    </ul>
  );
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
 * is. Zo krijgt elke lap ongeveer 215 px scroll (280vh op 900 hoog) en hangen
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
      className="relative flex min-h-[280vh] -scroll-mt-4 flex-col bg-[#F5F0EB] outline-none"
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

/**
 * Onder 1024 x 600 en bij reduced motion: alles stil, alle namen in beeld. Op
 * telefoon en tablet liep de lichtgang niet in de pas: de lijst stond nooit
 * tegelijk met het beeld in beeld (beeldkritiek fase 4). Daar dus het beeld met
 * alle namen, en direct eronder de zes stalen in een compact raster.
 */
function StilGestapeld({ stalen }: { stalen: Staal[] | null }) {
  if (stalen && !W2_FOTO_AAN) return <Gestapeld beeld={<Stalenvlakken stalen={stalen} />} />;
  return (
    <Gestapeld
      beeld={<KleurBeeld stalen={stalen ?? []} className="w-full" />}
      lijst={stalen ? <Kleurraster stalen={stalen} /> : undefined}
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
    <section id="kleur" tabIndex={-1} aria-labelledby="kleur-kop" className="-scroll-mt-4 bg-[#F5F0EB] py-16 outline-none md:py-24">
      {/* Onder 1024 px onder elkaar, het beeld op de telefoon over de volle
          breedte. Vanaf 1024 px (te laag voor de sticky kolom, of reduced
          motion) het beeld links op kolom 1 tot 6 en de tekst rechts. */}
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:px-8">
        {/* Tussen 768 en 1023 px staan tekst, beeld en raster op dezelfde as van
            560 px; anders kreeg de tablet drie linkerranden. */}
        <div className="px-4 sm:px-6 md:mx-auto md:max-w-[560px] md:px-0 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:mx-0 lg:max-w-none">
          <Kop />
          <div className="mt-8">
            <Profielzin />
          </div>
        </div>

        <div className="mx-auto mt-8 md:max-w-[560px] lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:w-full lg:max-w-none">
          {beeld}
        </div>

        <div className="mt-8 px-4 sm:px-6 md:mx-auto md:max-w-[560px] md:px-0 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:mx-0 lg:max-w-none">
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
 * "Bekijk voorbeeld" scrolt hierheen. De 16 px die scroll-padding-top boven de
 * kophoogte houdt is voor koppen; -scroll-mt-4 haalt hem weg, anders landde
 * het anker met een strook van W1 boven het zand.
 * De quiz vraagt welke kleuren je graag draagt; voor het voorbeeldprofiel licht
 * op tafel om de beurt de lap op van elke kleur die zijn rapport onder "Draag
 * deze kleuren" toont.
 *
 * Alleen dekking beweegt (de lagen met het licht, namen, streep in de lijst):
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
  return <StilGestapeld stalen={stalen} />;
}
