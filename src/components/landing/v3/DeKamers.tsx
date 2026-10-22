import { KAMERS, KLEURKAMER_COPY, kamerBeeld, srcSet, type Wie } from "@/content/kleurkamers";
import { ARCHIVO, LABEL, RASTER } from "./stijl";

const COPY = KLEURKAMER_COPY.kamers;

/**
 * De zes kamers naast elkaar: dezelfde persoon in dezelfde houding, zes keer een
 * andere kleur op de muur en bij het gezicht. Het tweede campagnebeeld op de
 * pagina, tussen de winkelrij en hoe het werkt. Van rand tot rand op desktop,
 * een rij om door te vegen op de telefoon. Eén AI-label onder de rij.
 */
export default function DeKamers({ wie }: { wie: Wie }) {
  return (
    <section aria-labelledby="kamers-kop" className="bg-[#FAFAF8] pb-20 pt-20 lg:pb-32 lg:pt-32">
      <div className={`${RASTER} pb-8 lg:pb-10`}>
        <h2 id="kamers-kop" className={`${LABEL} text-[#4A4A4A]`} style={ARCHIVO.label}>
          {COPY.kop}
        </h2>
        <p className="mt-3 max-w-prose font-archivo text-[20px] leading-[29px] text-[#1A1A1A] lg:text-[24px] lg:leading-[33px]" style={ARCHIVO.kop}>
          {COPY.tekst.tekst}
        </p>
      </div>
      <ul className="flex snap-x snap-mandatory gap-[2px] overflow-x-auto [scroll-padding-inline:var(--rand)] px-[var(--rand)] lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
        {KAMERS.map((k) => {
          const bron = kamerBeeld(k.sleutel, wie, true);
          return (
            <li key={k.sleutel} className="w-[62vw] flex-none snap-start sm:w-[40vw] lg:w-auto">
              <figure className="m-0">
                <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: k.veld[wie] }}>
                  <picture>
                    <source type="image/avif" srcSet={srcSet(bron.avif)} sizes="(min-width: 1024px) 17vw, 62vw" />
                    <img
                      src={bron.webp[640]}
                      srcSet={srcSet(bron.webp)}
                      sizes="(min-width: 1024px) 17vw, 62vw"
                      alt={`${wie === "dames" ? "Dezelfde vrouw" : "Dezelfde man"} in de kamer ${k.naam.toLowerCase()}.`}
                      width={bron.verhouding[0]}
                      height={bron.verhouding[1]}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </picture>
                </div>
                <figcaption className={`${LABEL} mt-3 px-1 lg:px-3`} style={ARCHIVO.label}>
                  <span className="block text-[#1A1A1A]">{k.naam}</span>
                  <span className="mt-1.5 block text-[#4A4A4A]">{k.seizoen}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
      <p className={`${RASTER} mt-6 text-[14px] text-[#4A4A4A]`}>{KLEURKAMER_COPY.held.aiLabel}</p>
    </section>
  );
}
