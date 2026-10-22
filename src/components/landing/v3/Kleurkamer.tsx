import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { NavLink } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import {
  HINT_KAMER,
  KAMERS,
  KLEURKAMER_COPY,
  altTekst,
  isDonkereKamer,
  kamer as kamerVan,
  kamerBeeld,
  kamerFilm,
  srcSet,
  staalNaam,
  tekstKleur,
  type KamerSleutel,
  type Wie,
} from "@/content/kleurkamers";
import { magHeroClip } from "@/components/landing/heroClipRegels";
import { track } from "@/utils/analytics";
import { zetKamerNav } from "./kamerNav";
import type { KleurkamerStand } from "./useKleurkamer";
import { ARCHIVO, KNOP_OP, LABEL, ONDER_LG } from "./stijl";

const COPY = KLEURKAMER_COPY.held;

/** De maten waarmee index.html het startbeeld vooraf laadt; ze moeten gelijk blijven. */
export const SIZES_LIGGEND = "90vw";
/*
 * De staande figuur: 4:5, zo hoog als past onder de kop (56 px op de homepage,
 * index.css) met 330 px eronder voor kop, stalen en knop, tussen 320 px en 125vw.
 * Figuur en sizes komen uit dezelfde getallen, zodat ze niet uit elkaar lopen.
 */
const KOP_MOBIEL = 56;
const FIGUUR = { min: 320, onder: 330, max: "125vw" } as const;
const FIGUUR_HOOGTE = `clamp(${FIGUUR.min}px, calc(100svh - var(--header-h, ${KOP_MOBIEL}px) - ${FIGUUR.onder}px), ${FIGUUR.max})`;
/*
 * Staand is de foto zo breed als de figuur, hooguit het scherm. Met 100vw koos een
 * telefoon van 412 px bij DPR 1,75 960w waar 640w volstaat. vh in plaats van svh:
 * vh is nooit kleiner, dus de schatting valt nooit te krap uit. Kent een browser
 * min() of clamp() hier niet, dan geldt 100vw, zoals voorheen.
 */
export const SIZES_STAAND = `min(100vw, calc(0.8 * clamp(${FIGUUR.min}px, calc(100vh - ${KOP_MOBIEL + FIGUUR.onder}px), ${FIGUUR.max})))`;

/** De kleur van de browserbalk buiten de homepage (index.html). */
const STANDAARD_THEMA = "#A85740";
const OVERGANG = "420ms cubic-bezier(0.2, 0, 0, 1)";
const HINT_SLEUTEL = "fitfi.kleurkamer.hint";
/** Na zoveel milliseconden zonder beeld breekt een wissel af en blijft de vorige foto staan. */
const WISSEL_GEDULD = 8000;

/** Waar het figuur moet blijven als object-cover bijsnijdt: rechts van het midden. */
const POSITIE_LIGGEND = "62% 50%";
const POSITIE_STAAND = "50% 50%";

/** Randen die overlopen in het veld. Het papier is vlak gemaakt, dus er is geen naad. */
const MASKER_LIGGEND: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 5%, #000 92%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskImage:
    "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 5%, #000 92%, transparent 100%)",
  maskComposite: "intersect",
};
const MASKER_STAAND: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 4%, #000 95%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskImage:
    "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 4%, #000 95%, transparent 100%)",
  maskComposite: "intersect",
};

type Toon = { sleutel: KamerSleutel; wie: Wie; staand: boolean };
const sleutelVan = (t: Toon) => `${t.sleutel}|${t.wie}|${t.staand ? "staand" : "liggend"}`;

/** Zonder window (vooraf renderen, tests) geldt `zonderVenster`. */
function useMedia(query: string, zonderVenster = false): boolean {
  const [past, setPast] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : zonderVenster));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const zet = () => setPast(mq.matches);
    zet();
    mq.addEventListener("change", zet);
    return () => mq.removeEventListener("change", zet);
  }, [query]);
  return past;
}

type Netwerk = { saveData?: boolean; effectiveType?: string };
function netwerkLaatToe(): boolean {
  if (typeof navigator === "undefined") return true;
  const n = (navigator as Navigator & { connection?: Netwerk }).connection;
  return magHeroClip({ reducedMotion: false, saveData: n?.saveData, effectiveType: n?.effectiveType });
}

const HOGE_PRIORITEIT = { fetchpriority: "high" } as Record<string, string>;
const LAGE_PRIORITEIT = { fetchpriority: "low" } as Record<string, string>;

function Still({
  toon,
  zichtbaar,
  duur,
  prioriteit,
  onKlaar,
  onFout,
}: {
  toon: Toon;
  zichtbaar: boolean;
  /** duur van de overgang naar de nieuwe dekking, in ms */
  duur: number;
  prioriteit: "hoog" | "normaal";
  onKlaar?: () => void;
  onFout?: () => void;
}) {
  const k = kamerVan(toon.sleutel);
  const bron = kamerBeeld(toon.sleutel, toon.wie, toon.staand);
  const sizes = toon.staand ? SIZES_STAAND : SIZES_LIGGEND;
  const [b, h] = bron.verhouding;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(bron.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(bron.webp)} sizes={sizes} />
      <img
        src={bron.webp[toon.staand ? 960 : 1920]}
        alt={altTekst(k, toon.wie)}
        aria-describedby="kk-ai-label"
        width={b}
        height={h}
        decoding="async"
        {...(prioriteit === "hoog" ? HOGE_PRIORITEIT : {})}
        onLoad={(e) => {
          const img = e.currentTarget;
          (img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).then(() => onKlaar?.());
        }}
        onError={() => onFout?.()}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: toon.staand ? POSITIE_STAAND : POSITIE_LIGGEND,
          opacity: zichtbaar ? 1 : 0,
          transition: `opacity ${duur}ms cubic-bezier(0.2, 0, 0, 1)`,
        }}
      />
    </picture>
  );
}

/** De andere kamers van dezelfde persoon, na het laden en met lage prioriteit, zodat een tik meteen een beeld heeft. */
function Voorladen({ wie, staand, behalve }: { wie: Wie; staand: boolean; behalve: KamerSleutel }) {
  const sizes = staand ? SIZES_STAAND : SIZES_LIGGEND;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
      {KAMERS.filter((k) => k.sleutel !== behalve).map((k) => {
        const bron = kamerBeeld(k.sleutel, wie, staand);
        return (
          <picture key={k.sleutel}>
            <source type="image/avif" srcSet={srcSet(bron.avif)} sizes={sizes} />
            <source type="image/webp" srcSet={srcSet(bron.webp)} sizes={sizes} />
            <img src={bron.webp[staand ? 960 : 1920]} alt="" decoding="async" {...LAGE_PRIORITEIT} width={1} height={1} />
          </picture>
        );
      })}
    </div>
  );
}

/**
 * De held: een kamer van één kleur, van rand tot rand, met één persoon onder een
 * harde flitser. Zes stalen uit vier paletten wisselen de kamer; Dames · Heren
 * wisselt de persoon. Ontwerp: ~/claude-artifacts/fitfi-beeld/2026-10-22-herontwerp/synthese.md.
 *
 * - De houding is in elke kamer pixel voor pixel gelijk (de kleur is op de foto
 *   gezet, niet opnieuw gegenereerd). Een andere kamer vloeit daarom over de
 *   vorige heen (420 ms); een andere persoon gaat eerst uit en dan aan.
 * - Welk beeld klaar is, wordt per beeld bijgehouden. De volgende foto komt pas
 *   als hij gedecodeerd is; tot dan blijft de vorige staan. Laadt hij niet, dan
 *   blijft de vorige ook staan.
 * - De clip begint en eindigt op de still (Kling 4.0) en duurt 4,96 s. Hij
 *   speelt als de held voor 60 procent in beeld is, het tabblad zichtbaar is en
 *   beweging mag; een gespeelde kamer speelt niet opnieuw tot je wisselt.
 * - Eén keer per sessie, als er na de eerste clip zes seconden niets gebeurt en
 *   de held in beeld is, wisselt de kamer naar olijfgroen. Niet als je al iets
 *   koos, focus in de held hebt of via een link met ?kleur= kwam.
 * - Stalen en Dames · Heren zijn radiogroepen; op de telefoon kun je ook vegen.
 */
export default function Kleurkamer({
  stand,
  beginStaand = false,
}: {
  stand: KleurkamerStand;
  /** alleen voor het vooraf renderen (src/prerender): welke opbouw zonder window */
  beginStaand?: boolean;
}) {
  const { kamer: sleutel, wie, bewegingUit, eigenKeuze, kies, kiesWie, zetBeweging } = stand;
  const staand = useMedia(ONDER_LG, beginStaand);
  const rustig = useMedia("(prefers-reduced-motion: reduce)");
  const [netwerkOk] = useState(netwerkLaatToe);
  const omgevingMag = !rustig && netwerkOk;
  const magBewegen = omgevingMag && !bewegingUit;

  const k = kamerVan(sleutel);
  const veld = k.veld[wie];
  const tekst = tekstKleur(k);
  const donker = isDonkereKamer(k);

  // --- de still: wat staat er, wat komt eraan, en welke beelden zijn klaar
  const doel = useMemo<Toon>(() => ({ sleutel, wie, staand }), [sleutel, wie, staand]);
  const doelSleutel = sleutelVan(doel);
  const [huidig, setHuidig] = useState<Toon>(doel);
  const huidigSleutel = sleutelVan(huidig);
  const [status, setStatus] = useState<Record<string, "ok" | "fout">>({});
  const volgend = doelSleutel === huidigSleutel ? null : doel;
  const volgendSleutel = volgend ? doelSleutel : null;
  const anderePersoon = !!volgend && (volgend.wie !== huidig.wie || volgend.staand !== huidig.staand);
  const [overgang, setOvergang] = useState<{ naar: string; soort: "over" | "uit" } | null>(null);
  const eersteRef = useRef(true);

  const markeer = useCallback((sleutelNaam: string, waarde: "ok" | "fout") => {
    setStatus((s) => (s[sleutelNaam] === waarde ? s : { ...s, [sleutelNaam]: waarde }));
  }, []);

  // Een wissel die te lang duurt, breekt af: de vorige foto blijft staan.
  useEffect(() => {
    if (!volgendSleutel || status[volgendSleutel]) return;
    const t = window.setTimeout(() => markeer(volgendSleutel, "fout"), WISSEL_GEDULD);
    return () => window.clearTimeout(t);
  }, [volgendSleutel, status, markeer]);

  const volgendKlaar = volgendSleutel ? status[volgendSleutel] === "ok" : false;
  useEffect(() => {
    if (!volgend || !volgendSleutel || !volgendKlaar) return;
    eersteRef.current = false;
    const soort = anderePersoon ? "uit" : "over";
    setOvergang({ naar: volgendSleutel, soort });
    const duur = rustig ? 150 : soort === "over" ? 420 : 160;
    const t = window.setTimeout(() => {
      setHuidig(volgend);
      setOvergang(null);
    }, duur);
    return () => window.clearTimeout(t);
    // volgend is afgeleid van volgendSleutel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volgendSleutel, volgendKlaar, anderePersoon, rustig]);

  const overgangNu = overgang && overgang.naar === volgendSleutel ? overgang : null;

  // --- in beeld en zichtbaar: voor de clip, de hint en de kop
  const sectieRef = useRef<HTMLElement>(null);
  const [inBeeld, setInBeeld] = useState(false);
  const [bovenaan, setBovenaan] = useState(true);
  const [tabZichtbaar, setTabZichtbaar] = useState(() => typeof document === "undefined" || document.visibilityState === "visible");

  useEffect(() => {
    const el = sectieRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const zicht = new IntersectionObserver(([e]) => setInBeeld(e.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] });
    // een lijn van 1 px bovenin het scherm: ligt de held daaronder, dan staat de kop op de kamer
    const kop = new IntersectionObserver(([e]) => setBovenaan(e.isIntersecting), { rootMargin: "0px 0px -99% 0px" });
    zicht.observe(el);
    kop.observe(el);
    const zichtbaarheid = () => setTabZichtbaar(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", zichtbaarheid);
    return () => {
      zicht.disconnect();
      kop.disconnect();
      document.removeEventListener("visibilitychange", zichtbaarheid);
    };
  }, []);

  useEffect(() => {
    zetKamerNav(bovenaan ? { actief: true, tekst, licht: donker, veld } : null);
  }, [bovenaan, tekst, donker, veld]);
  useEffect(() => () => zetKamerNav(null), []);

  // De balk van de browser kleurt mee, waar die dat doet; daarna weer de standaard.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", bovenaan ? veld : "#FAFAF8");
  }, [bovenaan, veld]);
  useEffect(
    () => () => {
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", STANDAARD_THEMA);
    },
    [],
  );

  // --- de andere kamers vooraf laden, na het laden van de pagina en een rustig moment
  const [voorladen, setVoorladen] = useState(false);
  useEffect(() => {
    if (!netwerkOk) return;
    let klaar = false;
    const start = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      if (idle) idle(() => !klaar && setVoorladen(true));
      else window.setTimeout(() => !klaar && setVoorladen(true), 1200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      klaar = true;
      window.removeEventListener("load", start);
    };
  }, [netwerkOk]);

  // --- de clip
  const afgespeeld = useRef(new Set<string>());
  const [filmVoor, setFilmVoor] = useState<string | null>(null);
  const [speeltVoor, setSpeeltVoor] = useState<string | null>(null);
  const [filmFout, setFilmFout] = useState<string | null>(null);
  const [uitgespeeld, setUitgespeeld] = useState<string | null>(null);
  const [eersteClipKlaar, setEersteClipKlaar] = useState(false);
  const filmRef = useRef<HTMLVideoElement>(null);
  const filmBron = kamerFilm(huidig.sleutel, huidig.wie, huidig.staand);
  const filmKan =
    magBewegen && !!filmBron && filmFout !== huidigSleutel && !volgend && inBeeld && tabZichtbaar && !afgespeeld.current.has(huidigSleutel);

  useEffect(() => {
    if (!filmKan || filmVoor === huidigSleutel) return;
    // na het laden van de pagina, en 400 ms na de laatste keuze
    let t = 0;
    const start = () => {
      t = window.setTimeout(() => setFilmVoor(huidigSleutel), 400);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", start);
    };
  }, [filmKan, huidigSleutel, filmVoor]);

  // Uit beeld, verborgen tabblad of "Beweging uit": stilzetten; terug in beeld: verder.
  useEffect(() => {
    const v = filmRef.current;
    if (!v) return;
    if (!magBewegen || !inBeeld || !tabZichtbaar) v.pause();
    else if (!v.ended && speeltVoor === huidigSleutel) v.play().catch(() => undefined);
  }, [magBewegen, inBeeld, tabZichtbaar, speeltVoor, huidigSleutel]);

  const filmTonen = filmVoor === huidigSleutel && !!filmBron && filmFout !== huidigSleutel;
  // Na afloop weer de still: die heeft precies de kleur van het veld, ook in een browser die het
  // sRGB-label van de clip negeert en hem lichter toont (gemeten in Chrome en Safari, 22 oktober 2026).
  const klaar = uitgespeeld === huidigSleutel;
  const filmZichtbaar = filmTonen && speeltVoor === huidigSleutel && magBewegen && !volgend && !klaar;

  // --- handelingen van de bezoeker; de hint wacht daarop
  const [handeling, setHandeling] = useState(false);
  const [melding, setMelding] = useState("");

  useEffect(() => {
    if (!eersteClipKlaar || !magBewegen || handeling || eigenKeuze || sleutel === HINT_KAMER || !inBeeld || !tabZichtbaar) return;
    let gehad = false;
    try {
      gehad = window.sessionStorage.getItem(HINT_SLEUTEL) === "1";
    } catch {
      gehad = false;
    }
    if (gehad) return;
    const t = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(HINT_SLEUTEL, "1");
      } catch {
        // geen opslag: dan hooguit nog een hint bij een volgend bezoek
      }
      kies(HINT_KAMER, "hint");
      setMelding(`${staalNaam(kamerVan(HINT_KAMER))}.`);
    }, 6000);
    return () => window.clearTimeout(t);
  }, [eersteClipKlaar, magBewegen, handeling, eigenKeuze, sleutel, inBeeld, tabZichtbaar, kies]);

  const kiesDoorBezoeker = useCallback(
    (nieuw: KamerSleutel, bron: "tik" | "toets" | "veeg") => {
      setHandeling(true);
      kies(nieuw, bron);
      setMelding(`${staalNaam(kamerVan(nieuw))}.`);
    },
    [kies],
  );
  const kiesWieDoorBezoeker = useCallback(
    (nieuw: Wie) => {
      setHandeling(true);
      kiesWie(nieuw);
      setMelding(nieuw === "dames" ? "Dames." : "Heren.");
    },
    [kiesWie],
  );

  const staalRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const opStaalToets = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const n = KAMERS.length;
    const metFocus = staalRefs.current.indexOf(e.currentTarget);
    const van = metFocus >= 0 ? metFocus : KAMERS.findIndex((x) => x.sleutel === sleutel);
    let naar = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") naar = (van + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") naar = (van - 1 + n) % n;
    else if (e.key === "Home") naar = 0;
    else if (e.key === "End") naar = n - 1;
    if (naar < 0) return;
    e.preventDefault();
    kiesDoorBezoeker(KAMERS[naar].sleutel, "toets");
    staalRefs.current[naar]?.focus();
  };

  const wieRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const opWieToets = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    let nieuw: Wie | null = null;
    if (e.key === "Home") nieuw = "dames";
    else if (e.key === "End") nieuw = "heren";
    else if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) nieuw = wie === "dames" ? "heren" : "dames";
    if (!nieuw) return;
    e.preventDefault();
    if (nieuw !== wie) kiesWieDoorBezoeker(nieuw);
    wieRefs.current[nieuw === "dames" ? 0 : 1]?.focus();
  };

  // vegen over de foto (telefoon); touch-action pan-y laat verticaal scrollen bij de browser
  const vegen = useRef<{ x: number; y: number } | null>(null);
  const opVeegStart = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    vegen.current = { x: e.clientX, y: e.clientY };
  };
  const opVeegEind = (e: PointerEvent) => {
    const s = vegen.current;
    vegen.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
    const n = KAMERS.length;
    const i = KAMERS.findIndex((x) => x.sleutel === sleutel);
    kiesDoorBezoeker(KAMERS[(i + (dx < 0 ? 1 : -1) + n) % n].sleutel, "veeg");
  };

  const kleurOvergang: CSSProperties = { transition: `background-color ${OVERGANG}, color ${OVERGANG}` };
  const rand = tekst;

  const huidigZichtbaar = !(overgangNu && overgangNu.soort === "uit");
  const volgendZichtbaar = !!overgangNu && overgangNu.soort === "over";

  const figuur = (
    <figure
      className={staand ? "relative m-0 mx-auto max-w-full" : "absolute inset-0 m-0"}
      style={staand ? { height: FIGUUR_HOOGTE, aspectRatio: "4 / 5", touchAction: "pan-y pinch-zoom" } : undefined}
      onPointerDown={staand ? opVeegStart : undefined}
      onPointerUp={staand ? opVeegEind : undefined}
      onPointerCancel={() => (vegen.current = null)}
    >
      <div className="absolute inset-0" style={staand ? MASKER_STAAND : MASKER_LIGGEND}>
        <Still
          key={huidigSleutel}
          toon={huidig}
          zichtbaar={huidigZichtbaar}
          duur={huidigZichtbaar ? (rustig ? 150 : 220) : rustig ? 150 : 160}
          prioriteit={eersteRef.current ? "hoog" : "normaal"}
          onKlaar={() => markeer(huidigSleutel, "ok")}
        />
        {volgend && volgendSleutel && status[volgendSleutel] !== "fout" && (
          <Still
            key={volgendSleutel}
            toon={volgend}
            zichtbaar={volgendZichtbaar}
            duur={rustig ? 150 : 420}
            prioriteit="normaal"
            onKlaar={() => markeer(volgendSleutel, "ok")}
            onFout={() => markeer(volgendSleutel, "fout")}
          />
        )}
        {filmTonen && (
          <video
            key={`film|${huidigSleutel}`}
            ref={filmRef}
            src={filmBron}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: huidig.staand ? POSITIE_STAAND : POSITIE_LIGGEND,
              opacity: filmZichtbaar ? 1 : 0,
              transition: klaar ? "opacity 400ms ease-out" : "opacity 120ms linear",
              // een haartje kleiner dan de still, zodat de clip nooit de LCP wordt
              transform: "scale(0.998)",
            }}
            onCanPlay={(e) => {
              if (!magBewegen || !inBeeld || !tabZichtbaar) return;
              e.currentTarget.play().catch(() => setFilmFout(huidigSleutel));
            }}
            onPlaying={() => setSpeeltVoor(huidigSleutel)}
            onEnded={() => {
              afgespeeld.current.add(huidigSleutel);
              setUitgespeeld(huidigSleutel);
              setEersteClipKlaar(true);
            }}
            onError={() => setFilmFout(huidigSleutel)}
          />
        )}
      </div>
      {voorladen && <Voorladen wie={wie} staand={staand} behalve={sleutel} />}
    </figure>
  );

  const stalen = (
    <div role="radiogroup" aria-label={COPY.kleurGroep} className="grid grid-cols-6 gap-2 sm:flex sm:items-center">
      {KAMERS.map((x, i) => {
        const actief = x.sleutel === sleutel;
        return (
          <button
            key={x.sleutel}
            ref={(el) => (staalRefs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={actief}
            aria-label={staalNaam(x)}
            tabIndex={actief ? 0 : -1}
            onClick={() => kiesDoorBezoeker(x.sleutel, "tik")}
            onKeyDown={opStaalToets}
            className="relative aspect-square w-full max-w-[52px] sm:h-[52px] sm:w-[52px] sm:flex-none lg:h-12 lg:w-12"
            style={{
              // een rand in de tekstkleur (minstens 4,5:1 tegen het veld). In de contrastmodus van
              // Windows maakt de browser rand en ring CanvasText; alleen de vulling houdt zijn kleur.
              border: `1px solid ${rand}`,
              outline: actief ? `2px solid ${rand}` : "none",
              outlineOffset: 3,
              transition: "outline-color 200ms ease-out",
            }}
          >
            <span aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: x.hex, forcedColorAdjust: "none" }} />
          </button>
        );
      })}
    </div>
  );

  const kamerNaam = (
    <p className={`${LABEL} whitespace-nowrap font-archivo`} style={ARCHIVO.label}>
      {k.naam} · {k.seizoen}
    </p>
  );

  const wieKeuze = (
    <div role="radiogroup" aria-label={COPY.wieGroep} className="flex items-center">
      {(["dames", "heren"] as const).map((w, i) => (
        <span key={w} className="flex items-center">
          {i === 1 && (
            <span aria-hidden="true" className="px-1">
              ·
            </span>
          )}
          <button
            ref={(el) => (wieRefs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={wie === w}
            tabIndex={wie === w ? 0 : -1}
            onClick={() => kiesWieDoorBezoeker(w)}
            onKeyDown={opWieToets}
            className="inline-flex min-h-[44px] items-center px-1 text-[16px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              outlineColor: rand,
              textDecoration: wie === w ? "underline" : "none",
              textUnderlineOffset: "6px",
              textDecorationThickness: "2px",
              fontWeight: wie === w ? 650 : 400,
            }}
          >
            {w === "dames" ? "Dames" : "Heren"}
          </button>
        </span>
      ))}
    </div>
  );

  const bewegingKnop = omgevingMag ? (
    <button
      type="button"
      aria-pressed={bewegingUit}
      onClick={() => {
        setHandeling(true);
        zetBeweging(!bewegingUit);
      }}
      className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 px-1 text-[16px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        outlineColor: rand,
        textDecoration: bewegingUit ? "underline" : "none",
        textUnderlineOffset: "6px",
        textDecorationThickness: "2px",
      }}
    >
      {bewegingUit ? <Play className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /> : <Pause className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
      {COPY.bewegingUit}
    </button>
  ) : null;

  const knop = (
    <NavLink
      to="/onboarding"
      className={KNOP_OP[donker ? "donker" : "licht"]}
      style={{ outlineColor: rand }}
      onClick={() => {
        track("cta_click", { page: "landing", position: "hero", kamer: sleutel, wie });
        track("quiz_start", { page: "landing", position: "hero" });
      }}
    >
      {COPY.knop}
    </NavLink>
  );

  const voorbeeld = (
    <NavLink
      to="/results/preview"
      onClick={() => track("cta_click", { page: "landing", position: "hero_voorbeeld" })}
      className="inline-flex min-h-[44px] items-center text-base underline decoration-1 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: rand }}
    >
      {COPY.voorbeeld}
    </NavLink>
  );

  const kop = (
    <h1
      id="hero-heading"
      className="font-archivo"
      style={{ ...ARCHIVO.display, fontSize: staand ? "clamp(40px, 9vw, 72px)" : "clamp(56px, min(7vw, 11svh), 128px)" }}
    >
      {COPY.kop[0]}
      <br />
      {COPY.kop[1]}
    </h1>
  );

  const aiLabel = (
    <p id="kk-ai-label" className="text-[14px] leading-snug">
      {COPY.aiLabel}
    </p>
  );

  return (
    <section
      ref={sectieRef}
      aria-labelledby="hero-heading"
      className="relative font-archivo"
      style={{ backgroundColor: veld, color: tekst, ...kleurOvergang }}
      onPointerDownCapture={() => setHandeling(true)}
      onFocusCapture={() => setHandeling(true)}
    >
      <p className="sr-only" aria-live="polite">
        {melding}
      </p>

      {staand ? (
        <div className="pb-10">
          <div aria-hidden="true" style={{ height: "var(--header-h, 56px)" }} />
          {figuur}
          <div className="px-[var(--rand)]">
            <div className="mt-2">{aiLabel}</div>
            <div className="mt-3">{kop}</div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4">
              {kamerNaam}
              {wieKeuze}
            </div>
            <div className="mt-3">{stalen}</div>
            <div className="mt-5 [&>a]:w-full sm:[&>a]:w-auto">{knop}</div>
            <p className="mt-6 max-w-prose text-[18px] leading-[27px]">{COPY.onderregel.tekst}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6">
              {voorbeeld}
              {bewegingKnop}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[clamp(680px,100svh,1100px)] flex-col">
          <div aria-hidden="true" className="flex-none" style={{ height: "var(--header-h, 64px)" }} />
          <div className="relative flex flex-1 flex-col">
            {/* het beeldvlak: 16:9, gecentreerd, zo hoog als deze rij */}
            <div className="absolute inset-0 flex justify-center">
              <div className="relative h-full max-w-full" style={{ aspectRatio: "16 / 9" }}>
                {figuur}
              </div>
            </div>
            {/* de tekst op het lege papier links; groeit mee als de tekst groter wordt */}
            <div className="relative px-[var(--rand)] pb-10" style={{ paddingTop: "clamp(32px, 13svh, 150px)" }}>
              <div className="max-w-[min(40vw,36rem)]">
                {kop}
                <p className="mt-6 max-w-[30rem] text-[20px] leading-[30px]">{COPY.onderregel.tekst}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                  {knop}
                  {voorbeeld}
                </div>
              </div>
            </div>
          </div>
          {/* Ruimte voor de cookiebalk onderin (70 tot 110 px op desktop). De kaart achter
              "Aanpassen" zet ruim 500 px in --banner-h maar staat rechts; zonder plafond
              groeide de held dan 400 px zodra iemand de kaart opende. */}
          <div className="relative flex-none px-[var(--rand)] pt-4" style={{ paddingBottom: "calc(20px + min(var(--banner-h, 0px), 120px))" }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-6">
                {kamerNaam}
                {aiLabel}
              </div>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className={`${LABEL} font-archivo`} style={ARCHIVO.label} aria-hidden="true">
                    {COPY.koel}
                  </span>
                  {stalen}
                  <span className={`${LABEL} font-archivo`} style={ARCHIVO.label} aria-hidden="true">
                    {COPY.warm}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  {wieKeuze}
                  {bewegingKnop}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
