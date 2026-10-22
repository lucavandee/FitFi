import { NavLink } from "react-router-dom";
import { useMediaquery } from "@/components/landing/beeld/useMediaquery";
import { COLOR_PALETTES } from "@/data/colorPalettes";
import { KLEURKAMER_COPY } from "@/content/kleurkamers";
import { VOORBEELD_OUTFITS, euro, formaat } from "@/content/voorbeeldOutfits";
import { toonNaam } from "@/utils/productNaam";
import { track } from "@/utils/analytics";
import { ARCHIVO, HAARLIJN, LABEL, RASTER, SECTIE, TEKSTLINK } from "./stijl";

const COPY = KLEURKAMER_COPY.rapport;
const OUTFIT = VOORBEELD_OUTFITS[1];
const PALET = COLOR_PALETTES.winter;
const KLEURCODE = PALET.doColors.map((k) => ({ hex: k.hex, naam: k.name }));
const RAND_OP_INKT = "border border-[rgba(250,250,248,0.3)]";

/**
 * De kleurcode: elk vlak met zijn naam eronder, drie per rij en onder 400 px
 * twee (Smaragdgroen past op 320 px niet onder een derde van de omslag). Op
 * inkt vallen zwart en navy weg zonder rand, daarom heeft elk vlak een haarlijn.
 */
function Kleurcode() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 min-[400px]:grid-cols-3">
      {KLEURCODE.map((k) => (
        <li key={k.hex}>
          <span aria-hidden="true" className={`block h-12 ${RAND_OP_INKT}`} style={{ backgroundColor: k.hex }} />
          <span className="mt-2 block text-[14px] leading-tight [overflow-wrap:anywhere]">{k.naam}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Wat je krijgt: links de omslag van het voorbeeldrapport, rechts een outfit
 * uit dat rapport met echte stukken. Omslag, stijlwoord, palet en outfit zijn
 * die van /results/preview (minimalistisch, winter); de omslag volgt
 * RapportOmslag.tsx: inkt, het stijlwoord groot, de kleurcode eronder.
 */
export default function JeRapport() {
  const totaal = OUTFIT.stukken.reduce((som, s) => som + s.prijs, 0);
  // Onder 1024 px scrolt de outfitrij zijwaarts zonder iets aanklikbaars erin: dan moet hij zelf focus kunnen krijgen.
  const rij = useMediaquery("(max-width: 1023px)");
  return (
    <section aria-labelledby="rapport-kop" className={`bg-[#FAFAF8] ${SECTIE}`}>
      {/* grid-cols-1 is minmax(0, 1fr): zonder die ondergrens rekt de outfitrij (168vw breed) de kolom op. */}
      <div className={`${RASTER} grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6`}>
        <div
          className="flex min-h-[120vw] flex-col justify-between overflow-hidden bg-[#1A1A1A] p-6 text-[#FAFAF8] sm:min-h-[600px] lg:col-span-6 lg:min-h-[760px] lg:p-10"
          style={{ containerType: "inline-size" }}
        >
          <p className={LABEL} style={ARCHIVO.label}>
            {COPY.omslag}
          </p>
          <div>
            <p
              aria-hidden="true"
              className="font-archivo leading-[0.85] [overflow-wrap:anywhere]"
              style={{ fontStretch: "62%", fontWeight: 600, letterSpacing: "-0.03em", fontSize: "min(160px, 22cqw)" }}
            >
              minimalistisch
            </p>
            <p className="sr-only">Stijl: minimalistisch.</p>
            <p className="mt-4 font-archivo text-[20px]" style={ARCHIVO.kop}>
              {PALET.season}
            </p>
            <p className={`${LABEL} mb-4 mt-10`} style={ARCHIVO.label}>
              {COPY.kleurcode}
            </p>
            <Kleurcode />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:self-center">
          <p className={`${LABEL} text-[#4A4A4A]`} style={ARCHIVO.label}>
            {COPY.label}
          </p>
          <h2 id="rapport-kop" className="mt-4 font-archivo text-[32px] text-[#1A1A1A] lg:text-[48px]" style={ARCHIVO.kop}>
            {COPY.kop}
          </h2>
          <p className="mt-4 max-w-prose text-[16px] leading-[25px] text-[#4A4A4A] lg:text-[17px] lg:leading-[27px]">{COPY.tekst.tekst}</p>

          <div className={`mt-10 border-t ${HAARLIJN} pt-6`}>
            <p className={`${LABEL} text-[#4A4A4A]`} style={ARCHIVO.label}>
              {OUTFIT.gelegenheid}
            </p>
            <h3 className="mt-3 font-archivo text-[24px] text-[#1A1A1A]" style={ARCHIVO.kop}>
              {OUTFIT.titel}
            </h3>
            <ul
              tabIndex={rij ? 0 : undefined}
              aria-label={rij ? "Stukken in deze outfit" : undefined}
              className="-mx-[var(--rand)] mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--rand)] pb-2 [scroll-padding-inline:var(--rand)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1A1A1A] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0"
            >
              {OUTFIT.stukken.map((stuk) => {
                const naam = toonNaam({ name: stuk.naam, brand: stuk.merk });
                return (
                  <li key={stuk.beeld} className="w-[56vw] flex-none snap-start sm:w-[36vw] lg:w-auto">
                    {/* Feedfoto van de winkel, ongewijzigd (Daisycon art. 2.6). */}
                    <div className="aspect-[2/3] overflow-hidden bg-[#FAFAF8]">
                      <img
                        src={formaat(stuk.beeld, 400)}
                        srcSet={`${formaat(stuk.beeld, 400)} 400w, ${formaat(stuk.beeld, 600)} 600w`}
                        sizes="(min-width: 1024px) 180px, (min-width: 640px) 36vw, 56vw"
                        alt={naam}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-snug text-[#1A1A1A]">{naam}</p>
                    <p className="mt-1 text-[14px] tabular-nums text-[#4A4A4A]">
                      {stuk.merk} · {euro(stuk.prijs)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className={`mt-5 flex items-baseline justify-between gap-4 border-t ${HAARLIJN} pt-4`}>
              <p className="text-[14px] text-[#4A4A4A]">Prijzen van 21 oktober 2026.</p>
              <p className="text-[16px] font-semibold tabular-nums text-[#1A1A1A]">
                {COPY.samen} {euro(totaal)}
              </p>
            </div>
            <NavLink
              to="/results/preview"
              onClick={() => track("cta_click", { page: "landing", position: "rapport_voorbeeld" })}
              className={`${TEKSTLINK} mt-4 text-[#1A1A1A] focus-visible:outline-[#1A1A1A]`}
            >
              {KLEURKAMER_COPY.held.voorbeeld}
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
