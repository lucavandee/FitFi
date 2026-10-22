import { ARCHIVO, LABEL, RASTER, SECTIE } from "./stijl";

export interface Ervaring {
  naam: string;
  meta: string;
  citaat: string;
}

/**
 * Ervaringen, alleen bij drie of meer echte reviews uit de database. Citaten
 * zoals ze daar staan, met een haarlijn erboven; geen kaarten en geen
 * initialen in rondjes.
 */
export default function Ervaringen({ ervaringen }: { ervaringen: Ervaring[] }) {
  if (ervaringen.length < 3) return null;
  return (
    <section aria-labelledby="ervaringen-kop" className={`bg-[#FAFAF8] ${SECTIE}`}>
      <div className={RASTER}>
        <h2 id="ervaringen-kop" className={`${LABEL} text-[#4A4A4A]`} style={ARCHIVO.label}>
          Ervaringen
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-6">
          {ervaringen.slice(0, 3).map((e) => (
            <figure key={e.naam + e.citaat.slice(0, 12)} className="m-0 border-t border-[rgba(26,26,26,0.14)] pt-6">
              <blockquote className="font-archivo text-[20px] leading-[30px] text-[#1A1A1A] lg:text-[22px] lg:leading-[32px]">{e.citaat}</blockquote>
              <figcaption className={`${LABEL} mt-6 text-[#4A4A4A]`} style={ARCHIVO.label}>
                {[e.naam, e.meta].filter(Boolean).join(" · ")}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
