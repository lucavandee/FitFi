import { NavLink } from "react-router-dom";
import { COLOR_PALETTES } from "@/data/colorPalettes";
import { KLEURKAMER_COPY } from "@/content/kleurkamers";
import { VOORBEELD_OUTFITS, euro, formaat } from "@/content/voorbeeldOutfits";
import { toonNaam } from "@/utils/productNaam";
import { track } from "@/utils/analytics";
import { ARCHIVO, LABEL, RASTER, SECTIE, TEKSTLINK } from "./stijl";

const COPY = KLEURKAMER_COPY.rapport;
const OUTFIT = VOORBEELD_OUTFITS[1];
const PALET = COLOR_PALETTES.winter;
const KLEURCODE = PALET.doColors.map((k) => ({ hex: k.hex, naam: k.name }));

/**
 * De omslagkleur van het voorbeeldrapport: de verzadigde draag-kleur met het
 * hoogste contrast tegen papier (synthese 4.9). Voor winter is dat Bourgogne.
 */
const OMSLAG = PALET.doColors.find((k) => k.name === "Bourgogne")?.hex ?? "#1A1A1A";

/** De kleurcode als strook: recht, met haarlijnen, de eerste twee kleuren breder (zoals in het rapport). */
function Strook({ hoogte }: { hoogte: number }) {
  return (
    <div
      role="img"
      aria-label={`Kleurcode: ${KLEURCODE.map((k) => k.naam.toLowerCase()).join(", ")}`}
      className="flex w-full border border-[rgba(250,250,248,0.3)]"
      style={{ height: hoogte }}
    >
      {KLEURCODE.map((k, i) => (
        <div
          key={k.hex}
          className={i > 0 ? "border-l border-[rgba(250,250,248,0.3)]" : ""}
          style={{ backgroundColor: k.hex, flexGrow: i < 2 ? 3 : 2, flexBasis: 0 }}
        />
      ))}
    </div>
  );
}

/**
 * Wat je krijgt: links de omslag van het voorbeeldrapport in de kleur van het
 * palet, rechts een outfit uit dat rapport met echte stukken. Het profiel en de
 * outfit zijn die van het voorbeeld op /results/preview (minimalistisch,
 * winterpalet), dus deze sectie belooft niets wat het rapport niet laat zien.
 */
export default function JeRapport() {
  const totaal = OUTFIT.stukken.reduce((som, s) => som + s.prijs, 0);
  return (
    <section aria-labelledby="rapport-kop" className={`bg-[#FAFAF8] ${SECTIE}`}>
      <div className={`${RASTER} grid gap-10 lg:grid-cols-12 lg:gap-6`}>
        <div className="flex min-h-[110vw] flex-col justify-between p-6 text-[#FAFAF8] sm:min-h-[560px] lg:col-span-6 lg:min-h-[720px] lg:p-10"
          style={{ backgroundColor: OMSLAG, containerType: "inline-size" }}
        >
          <p className={LABEL} style={ARCHIVO.label}>
            {COPY.label}
          </p>
          <div>
            <p
              aria-hidden="true"
              className="font-archivo leading-[0.85]"
              style={{ fontStretch: "62%", fontWeight: 600, letterSpacing: "-0.03em", fontSize: "min(160px, 23cqw)" }}
            >
              minimalistisch
            </p>
            <p className="sr-only">Stijl: minimalistisch.</p>
            <p className="mt-4 font-archivo text-[20px]" style={ARCHIVO.kop}>
              {PALET.season}
            </p>
            <p className={`${LABEL} mt-10`} style={ARCHIVO.label}>
              {COPY.kleurcode}
            </p>
            <div className="mt-3">
              <Strook hoogte={48} />
            </div>
            <p className="mt-3 text-[14px] text-[rgba(250,250,248,0.82)]">{KLEURCODE.map((k) => k.naam).join(" · ")}</p>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:self-center">
          <p className={`${LABEL} text-[#4A4A4A]`} style={ARCHIVO.label}>
            {COPY.label}
          </p>
          <h2 id="rapport-kop" className="mt-4 font-archivo text-[32px] text-[#1A1A1A] lg:text-[48px]" style={ARCHIVO.kop}>
            {COPY.kop}
          </h2>
          <p className="mt-4 max-w-prose text-[16px] leading-[25px] text-[#4A4A4A] lg:text-[17px] lg:leading-[27px]">{COPY.tekst.tekst}</p>

          <div className="mt-10 border-t border-[rgba(26,26,26,0.14)] pt-6">
            <p className={`${LABEL} text-[#4A4A4A]`} style={ARCHIVO.label}>
              {OUTFIT.gelegenheid}
            </p>
            <h3 className="mt-3 font-archivo text-[24px] text-[#1A1A1A]" style={ARCHIVO.kop}>
              {OUTFIT.titel}
            </h3>
            <ul className="mt-5 grid grid-cols-3 gap-4">
              {OUTFIT.stukken.map((stuk) => (
                <li key={stuk.beeld}>
                  {/* Feedfoto van de winkel, ongewijzigd (Daisycon art. 2.6). */}
                  <div className="aspect-[2/3] overflow-hidden bg-[#FAFAF8]">
                    <img
                      src={formaat(stuk.beeld, 400)}
                      srcSet={`${formaat(stuk.beeld, 400)} 400w, ${formaat(stuk.beeld, 600)} 600w`}
                      sizes="(min-width: 1024px) 180px, 30vw"
                      alt={toonNaam({ name: stuk.naam, brand: stuk.merk })}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-[#1A1A1A]">{toonNaam({ name: stuk.naam, brand: stuk.merk })}</p>
                  <p className="mt-1 text-[14px] tabular-nums text-[#4A4A4A]">
                    {stuk.merk} · {euro(stuk.prijs)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline justify-between border-t border-[rgba(26,26,26,0.14)] pt-4">
              <p className="text-[14px] text-[#4A4A4A]">Prijzen van 21 oktober 2026.</p>
              <p className="text-[16px] font-semibold tabular-nums text-[#1A1A1A]">
                {COPY.samen} {euro(totaal)}
              </p>
            </div>
            <NavLink
              to="/results/preview"
              onClick={() => track("cta_click", { page: "landing", position: "rapport_voorbeeld" })}
              className={`${TEKSTLINK} mt-4 text-[#1A1A1A]`}
            >
              {KLEURKAMER_COPY.held.voorbeeld}
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
