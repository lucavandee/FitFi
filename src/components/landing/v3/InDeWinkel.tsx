import { Link } from "react-router-dom";
import { KLEURKAMER_COPY, kamer as kamerVan, type KamerSleutel, type Wie } from "@/content/kleurkamers";
import { KLEURKAMER_PRODUCTEN, PRIJSDATUM, winkelTitel, type WinkelStuk } from "@/content/kleurkamerProducten";
import { LANDING_COPY } from "@/content/landingCopy";
import { euro, formaat } from "@/content/voorbeeldOutfits";
import { track } from "@/utils/analytics";
import { ARCHIVO, LABEL, RASTER } from "./stijl";

const COPY = KLEURKAMER_COPY.winkel;
const VERGOEDING = LANDING_COPY.outfit.vergoeding;
const VERGOEDING_LINK = LANDING_COPY.outfit.vergoedingLink;

function Stuk({ stuk, kamer, plek }: { stuk: WinkelStuk; kamer: KamerSleutel; plek: number }) {
  const titel = winkelTitel(stuk.naam);
  const winkel = stuk.merk;
  return (
    <li className="flex w-[62vw] flex-none snap-start sm:w-[44vw] lg:w-auto">
      <a
        href={stuk.link}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-label={`${COPY.knop}: ${titel}, ${winkel}, ${euro(stuk.prijs)}, ${COPY.nieuwVenster}`}
        onClick={() => track("product_klik", { bron: "kleurkamer", kamer, plek, product: stuk.id })}
        className="group flex w-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A1A1A]"
      >
        {/* De feedfoto, ongewijzigd (Daisycon art. 2.6): eigen verhouding, niets eroverheen. */}
        <div className="aspect-[2/3] overflow-hidden bg-[#FAFAF8]">
          <img
            src={formaat(stuk.beeld, 600)}
            srcSet={`${formaat(stuk.beeld, 400)} 400w, ${formaat(stuk.beeld, 600)} 600w, ${formaat(stuk.beeld, 800)} 800w`}
            sizes="(min-width: 1440px) 302px, (min-width: 1024px) 22vw, (min-width: 640px) 44vw, 62vw"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
        <p className="mt-3 line-clamp-2 text-[16px] leading-[23px] text-[#1A1A1A] group-hover:underline group-hover:underline-offset-4">{titel}</p>
        {/* winkel en prijs onderaan, zodat ze in de rij op één lijn staan */}
        <div className="mt-auto flex items-baseline justify-between gap-3 pt-2">
          <p className={`${LABEL} text-[#4A4A4A]`} style={ARCHIVO.label}>
            {winkel}
          </p>
          <p className="text-[16px] font-medium tabular-nums text-[#1A1A1A]">{euro(stuk.prijs)}</p>
        </div>
      </a>
    </li>
  );
}

/**
 * Onder de held: echte stukken in de kleur die je koos, voor Dames of Heren.
 * Een gekeurde lijst (kleurkamerProducten.ts); met minder dan drie stukken
 * blijft de rij weg. Het model en de kleding in de held zijn gemaakt met AI,
 * deze stukken niet: dat staat er letterlijk bij. Partnerlinks met de melding
 * over de vergoeding eronder, zoals elders op de site.
 */
export default function InDeWinkel({ kamer, wie }: { kamer: KamerSleutel; wie: Wie }) {
  const k = kamerVan(kamer);
  const stukken = KLEURKAMER_PRODUCTEN[kamer]?.[wie] ?? [];
  if (stukken.length < 3) return null;
  return (
    <section aria-labelledby="winkel-kop" className="bg-[#FAFAF8] pt-20 lg:pt-32">
      <div className={RASTER}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="flex items-center gap-4 lg:col-span-6">
            <span aria-hidden="true" className="h-6 w-6 flex-none border border-[#1A1A1A]" style={{ backgroundColor: k.hex }} />
            <h2 id="winkel-kop" className="font-archivo text-[32px] text-[#1A1A1A] lg:text-[48px]" style={ARCHIVO.kop}>
              {k.naam} in de winkel.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-[16px] leading-[25px] text-[#4A4A4A] lg:text-[17px] lg:leading-[27px]">{COPY.tekst}</p>
            <p className="mt-2 text-[14px] text-[#4A4A4A]">Prijzen van {PRIJSDATUM}.</p>
          </div>
        </div>
        <ul
          key={`${kamer}|${wie}`}
          className="kk-in -mx-[var(--rand)] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--rand)] pb-2 pt-2 [scroll-padding-inline:var(--rand)] lg:mx-0 lg:mt-12 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0"
        >
          {stukken.slice(0, 4).map((stuk, i) => (
            <Stuk key={stuk.id} stuk={stuk} kamer={kamer} plek={i + 1} />
          ))}
        </ul>
        <p className="mt-6 max-w-prose text-[14px] leading-[22px] text-[#4A4A4A]">
          {VERGOEDING.tekst}{" "}
          <Link
            to="/affiliate-disclosure"
            className="text-[#1A1A1A] underline decoration-1 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
          >
            {VERGOEDING_LINK.tekst}
          </Link>
        </p>
      </div>
    </section>
  );
}
