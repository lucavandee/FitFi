import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { NavLink } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import {
  HINT_KAMER,
  KAMERS,
  KLEURKAMER_COPY,
  altTekst,
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
import { ARCHIVO, KNOP_OP, LABEL } from "./stijl";

const COPY = KLEURKAMER_COPY.held;

/** De maten waarmee index.html het startbeeld vooraf laadt; ze moeten gelijk blijven. */
export const SIZES_LIGGEND = "90vw";
export const SIZES_STAAND = "100vw";

const OVERGANG = "420ms cubic-bezier(0.2, 0, 0, 1)";
/** Even breed als het beeldvlak: (heldhoogte min kop min band) maal 16/9, hooguit de schermbreedte. */
const BAND_BREEDTE = "min(100%, calc((clamp(680px, 100svh, 1100px) - var(--header-h, 90px) - 120px) * 16 / 9))";
const HINT_SLEUTEL = "fitfi.kleurkamer.hint";

/** Waar het figuur moet blijven als object-cover bijsnijdt: rechts van het midden. */
const POSITIE_LIGGEND = "62% 50%";
const POSITIE_STAAND = "50% 50%";

/** Randen die overlopen in het veld: de foto heeft geen naad met de kamer eromheen. */
const MASKER_LIGGEND: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 6%, #000 88%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskImage:
    "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 6%, #000 88%, transparent 100%)",
  maskComposite: "intersect",
};
const MASKER_STAAND: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 4%, #000 95%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskImage:
    "linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 4%, #000 95%, transparent 100%)",
  maskComposite: "intersect",
};

type Toon = { sleutel: KamerSleutel; wie: Wie; staand: boolean };
const gelijk = (a: Toon, b: Toon) => a.sleutel === b.sleutel && a.wie === b.wie && a.staand === b.staand;

function useMedia(query: string): boolean {
  const [past, setPast] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const zet = () => setPast(mq.matches);
    zet();
    mq.addEventListener("change", zet);
    return () => mq.removeEventListener("change", zet);
  }, [query]);
  return past;
}

/** Mag hier bewegend beeld laden? Niet bij reduced motion, Save-Data of 2G (zelfde regels als de vorige held). */
function useOmgevingMagBewegen(): boolean {
  const rustig = useMedia("(prefers-reduced-motion: reduce)");
  const [netwerkOk] = useState(() => {
    if (typeof navigator === "undefined") return true;
    const n = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    return magHeroClip({ reducedMotion: false, saveData: n?.saveData, effectiveType: n?.effectiveType });
  });
  return !rustig && netwerkOk;
}

const HOGE_PRIORITEIT = { fetchpriority: "high" } as Record<string, string>;

function Still({
  toon,
  zichtbaar,
  eerste,
  onGeladen,
}: {
  toon: Toon;
  zichtbaar: boolean;
  eerste: boolean;
  onGeladen?: () => void;
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
        {...(eerste ? HOGE_PRIORITEIT : {})}
        onLoad={(e) => {
          const img = e.currentTarget;
          (img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).then(() => onGeladen?.());
        }}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: toon.staand ? POSITIE_STAAND : POSITIE_LIGGEND,
          opacity: zichtbaar ? 1 : 0,
          transition: zichtbaar ? "opacity 220ms cubic-bezier(0.2, 0, 0, 1)" : "opacity 160ms ease-out",
        }}
      />
    </picture>
  );
}

/**
 * De held: een kamer van één kleur, van rand tot rand, met één persoon onder een
 * harde flitser. Zes stalen uit vier paletten wisselen de kamer; Dames · Heren
 * wisselt de persoon. Ontwerp: ~/claude-artifacts/fitfi-beeld/2026-10-22-herontwerp/synthese.md.
 *
 * - Wisselen gaat in twee fasen: de foto gaat uit (160 ms) terwijl de nieuwe
 *   laadt, en komt pas op als hij gedecodeerd is. Er staan nooit twee foto's
 *   over elkaar; het veld loopt in 420 ms naar de nieuwe kleur.
 * - De clip begint en eindigt op de still (Kling 4.0, start- en eindbeeld) en
 *   duurt 4,96 s. Hij speelt alleen als de held voor 60 procent in beeld is, het
 *   tabblad zichtbaar is en beweging mag; "Beweging uit" zet hem en de hint stil.
 * - Eén keer per sessie, als er na de eerste clip zes seconden niets gebeurt,
 *   wisselt de kamer naar olijfgroen. Dat telt niet als keuze.
 * - De stalen zijn een radiogroep (pijltjes, Home, End); op de telefoon kun je
 *   ook over de foto vegen.
 */
export default function Kleurkamer({ stand }: { stand: KleurkamerStand }) {
  const { kamer: sleutel, wie, bewegingUit, kies, kiesWie, zetBeweging } = stand;
  const staand = useMedia("(max-width: 1023px)");
  const omgevingMag = useOmgevingMagBewegen();
  const magBewegen = omgevingMag && !bewegingUit;

  const k = kamerVan(sleutel);
  const veld = k.veld[wie];
  const tekst = tekstKleur(k);
  const licht = k.tekst === "papier";
  const doel: Toon = { sleutel, wie, staand };

  // --- de still: huidig, en eventueel de volgende die op de achtergrond laadt
  const [huidig, setHuidig] = useState<Toon>(doel);
  const [volgend, setVolgend] = useState<Toon | null>(null);
  const [uitKlaar, setUitKlaar] = useState(false);
  const [volgendKlaar, setVolgendKlaar] = useState(false);
  const eersteRef = useRef(true);

  const doelSleutel = `${sleutel}|${wie}|${staand}`;
  useEffect(() => {
    if (gelijk(doel, huidig) && !volgend) return;
    if (volgend && gelijk(doel, volgend)) return;
    eersteRef.current = false;
    setVolgend(doel);
    setVolgendKlaar(false);
    setUitKlaar(false);
    const t = window.setTimeout(() => setUitKlaar(true), 160);
    return () => window.clearTimeout(t);
    // doel is afgeleid van doelSleutel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doelSleutel]);

  useEffect(() => {
    if (volgend && uitKlaar && volgendKlaar) {
      setHuidig(volgend);
      setVolgend(null);
    }
  }, [volgend, uitKlaar, volgendKlaar]);

  // --- in beeld en zichtbaar: voor de clip en voor de kop
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
    zetKamerNav(bovenaan ? { actief: true, tekst, licht, veld } : null);
  }, [bovenaan, tekst, licht, veld]);
  useEffect(() => () => zetKamerNav(null), []);

  // De balk van de browser kleurt mee, waar die dat doet.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const was = meta.getAttribute("content");
    meta.setAttribute("content", bovenaan ? veld : "#FAFAF8");
    return () => {
      if (was) meta.setAttribute("content", was);
    };
  }, [bovenaan, veld]);

  // --- de clip
  const [filmMag, setFilmMag] = useState(false);
  const [speelt, setSpeelt] = useState(false);
  const [filmFout, setFilmFout] = useState<string | null>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const huidigSleutel = `${huidig.sleutel}|${huidig.wie}|${huidig.staand}`;
  const filmBron = kamerFilm(huidig.sleutel, huidig.wie, huidig.staand);
  const afgespeeld = useRef(new Set<string>());
  const filmKan =
    magBewegen && !!filmBron && filmFout !== huidigSleutel && !volgend && inBeeld && tabZichtbaar && !afgespeeld.current.has(huidigSleutel);

  useEffect(() => {
    if (afgespeeld.current.has(huidigSleutel)) return;
    setSpeelt(false);
    setFilmMag(false);
    if (!filmKan) return;
    // na het laden van de pagina, en 400 ms na de laatste keuze
    const start = () => {
      const t = window.setTimeout(() => setFilmMag(true), 400);
      return () => window.clearTimeout(t);
    };
    if (document.readyState === "complete") return start();
    let opruimen: (() => void) | undefined;
    const naLaden = () => {
      opruimen = start();
    };
    window.addEventListener("load", naLaden, { once: true });
    return () => {
      window.removeEventListener("load", naLaden);
      opruimen?.();
    };
  }, [filmKan, huidigSleutel]);

  useEffect(() => {
    if (!magBewegen) filmRef.current?.pause();
  }, [magBewegen]);

  // --- de hint: één keer per sessie, na de eerste clip en zes seconden stilte
  const handelingRef = useRef(false);
  const [eersteClipKlaar, setEersteClipKlaar] = useState(false);
  useEffect(() => {
    if (!eersteClipKlaar || !magBewegen || handelingRef.current || sleutel === HINT_KAMER) return;
    let gehad = false;
    try {
      gehad = window.sessionStorage.getItem(HINT_SLEUTEL) === "1";
    } catch {
      gehad = false;
    }
    if (gehad) return;
    const t = window.setTimeout(() => {
      if (handelingRef.current) return;
      try {
        window.sessionStorage.setItem(HINT_SLEUTEL, "1");
      } catch {
        // geen opslag: dan hooguit nog een hint bij een volgend bezoek
      }
      kies(HINT_KAMER, "hint");
    }, 6000);
    return () => window.clearTimeout(t);
  }, [eersteClipKlaar, magBewegen, sleutel, kies]);

  // --- keuzes door de bezoeker
  const [melding, setMelding] = useState("");
  const kiesDoorBezoeker = useCallback(
    (nieuw: KamerSleutel, bron: "tik" | "toets" | "veeg") => {
      handelingRef.current = true;
      kies(nieuw, bron);
      setMelding(`${staalNaam(kamerVan(nieuw))}.`);
    },
    [kies],
  );
  const kiesWieDoorBezoeker = useCallback(
    (nieuw: Wie) => {
      handelingRef.current = true;
      kiesWie(nieuw);
      setMelding(nieuw === "dames" ? "Dames." : "Heren.");
    },
    [kiesWie],
  );

  const index = KAMERS.findIndex((x) => x.sleutel === sleutel);
  const staalRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const opStaalToets = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = KAMERS.length;
    let naar = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") naar = (index + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") naar = (index - 1 + n) % n;
    else if (e.key === "Home") naar = 0;
    else if (e.key === "End") naar = n - 1;
    if (naar < 0) return;
    e.preventDefault();
    kiesDoorBezoeker(KAMERS[naar].sleutel, "toets");
    staalRefs.current[naar]?.focus();
  };

  const wieRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const opWieToets = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const nieuw: Wie = wie === "dames" ? "heren" : "dames";
    kiesWieDoorBezoeker(nieuw);
    wieRefs.current[nieuw === "dames" ? 0 : 1]?.focus();
  };

  // vegen over de foto (telefoon)
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
    kiesDoorBezoeker(KAMERS[(index + (dx < 0 ? 1 : -1) + n) % n].sleutel, "veeg");
  };

  const kleurOvergang: CSSProperties = { transition: `background-color ${OVERGANG}, color ${OVERGANG}, border-color ${OVERGANG}` };
  const tekstZacht = licht ? "rgba(250,250,248,0.82)" : "rgba(26,26,26,0.78)";
  const haarlijn = licht ? "rgba(250,250,248,0.35)" : "rgba(26,26,26,0.3)";

  const figuur = (
    <figure
      className={staand ? "relative m-0 mx-auto max-w-full" : "absolute inset-0 m-0"}
      style={staand ? { height: "clamp(340px, calc(100svh - var(--header-h, 90px) - 340px), 125vw)", aspectRatio: "4 / 5" } : undefined}
      onPointerDown={opVeegStart}
      onPointerUp={opVeegEind}
      onPointerCancel={() => (vegen.current = null)}
    >
      <div className="absolute inset-0" style={staand ? MASKER_STAAND : MASKER_LIGGEND}>
        <Still key={huidigSleutel} toon={huidig} zichtbaar={!volgend} eerste={eersteRef.current} />
        {volgend && (
          <Still
            key={`${volgend.sleutel}|${volgend.wie}|${volgend.staand}`}
            toon={volgend}
            zichtbaar={false}
            eerste={false}
            onGeladen={() => setVolgendKlaar(true)}
          />
        )}
        {filmMag && filmBron && (
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
              opacity: speelt && magBewegen ? 1 : 0,
              transition: "opacity 120ms linear",
            }}
            onCanPlay={(e) => {
              if (!magBewegen) return;
              e.currentTarget.play().catch(() => setFilmFout(huidigSleutel));
            }}
            onPlaying={() => setSpeelt(true)}
            onEnded={() => {
              afgespeeld.current.add(huidigSleutel);
              setEersteClipKlaar(true);
            }}
            onError={() => setFilmFout(huidigSleutel)}
          />
        )}
      </div>
    </figure>
  );

  const stalen = (
    <div role="radiogroup" aria-label={COPY.kleurGroep} className="grid grid-cols-6 gap-2 lg:flex lg:items-center">
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
            className="relative aspect-square w-full max-w-[52px] lg:h-12 lg:w-12 lg:flex-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[6px]"
            style={{
              backgroundColor: x.hex,
              border: `1px solid ${haarlijn}`,
              outlineColor: tekst,
              boxShadow: actief ? `0 0 0 3px ${veld}, 0 0 0 5px ${tekst}` : "none",
              transition: `box-shadow 200ms ease-out`,
            }}
          />
        );
      })}
    </div>
  );

  const kamerNaam = (
    <p className={LABEL} style={{ ...ARCHIVO.label }}>
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
            className="inline-flex min-h-[44px] items-center px-1 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              outlineColor: tekst,
              textDecoration: wie === w ? "underline" : "none",
              textUnderlineOffset: "6px",
              textDecorationThickness: "1px",
              opacity: wie === w ? 1 : 0.78,
              fontWeight: wie === w ? 600 : 400,
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
      onClick={() => zetBeweging(!bewegingUit)}
      className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 px-1 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: tekst }}
    >
      {bewegingUit ? <Play className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /> : <Pause className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
      {bewegingUit ? COPY.bewegingAan : COPY.bewegingUit}
    </button>
  ) : null;

  const knop = (
    <NavLink
      to="/onboarding"
      className={KNOP_OP[licht ? "donker" : "licht"]}
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
      style={{ outlineColor: tekst }}
    >
      {COPY.voorbeeld}
    </NavLink>
  );

  const kop = (
    <h1 id="hero-heading" className="font-archivo" style={{ ...ARCHIVO.display, fontSize: staand ? "40px" : "clamp(56px, min(7vw, 11svh), 128px)" }}>
      {COPY.kop[0]}
      <br />
      {COPY.kop[1]}
    </h1>
  );

  return (
    <section
      ref={sectieRef}
      aria-labelledby="hero-heading"
      className="relative font-archivo"
      style={{ backgroundColor: veld, color: tekst, ...kleurOvergang }}
    >
      <p className="sr-only" aria-live="polite">
        {melding}
      </p>

      {staand ? (
        <div className="pb-10">
          <div aria-hidden="true" style={{ height: "var(--header-h, 90px)" }} />
          {figuur}
          <div className="px-4">
            <p id="kk-ai-label" className="mt-2 text-[14px] leading-snug" style={{ color: tekstZacht }}>
              {COPY.aiLabel}
            </p>
            <div className="mt-3">{kop}</div>
            <div className="mt-3 flex items-center justify-between gap-4">
              {kamerNaam}
              {wieKeuze}
            </div>
            <div className="mt-3">{stalen}</div>
            <div className="mt-5 [&>a]:w-full">{knop}</div>
            <p className="mt-6 max-w-prose text-[18px] leading-[27px]" style={{ color: tekstZacht }}>
              {COPY.onderregel.tekst}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6">
              {voorbeeld}
              {bewegingKnop}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[100svh] min-h-[680px] max-h-[1100px] flex-col">
          <div aria-hidden="true" className="flex-none" style={{ height: "var(--header-h, 90px)" }} />
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 flex justify-center">
              <div className="relative h-full max-w-full" style={{ aspectRatio: "16 / 9" }}>
                {figuur}
                <div className="absolute left-10 top-[19%] max-w-[46%]">
                  {kop}
                  <p className="mt-6 max-w-[30rem] text-[20px] leading-[30px]" style={{ color: tekstZacht }}>
                    {COPY.onderregel.tekst}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                    {knop}
                    {voorbeeld}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto flex-none px-10 pb-5" style={{ height: 120, width: BAND_BREEDTE }}>
            <div className="flex h-full flex-col justify-end gap-2">
              <div className="flex items-center justify-between">
                {kamerNaam}
                <p id="kk-ai-label" className="text-[14px]" style={{ color: tekstZacht }}>
                  {COPY.aiLabel}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={LABEL} style={{ ...ARCHIVO.label, color: tekstZacht }} aria-hidden="true">
                    {COPY.koel}
                  </span>
                  {stalen}
                  <span className={LABEL} style={{ ...ARCHIVO.label, color: tekstZacht }} aria-hidden="true">
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
