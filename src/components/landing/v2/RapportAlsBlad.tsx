import { Kleurcode } from "./Kleurcode";
import { Packshot } from "./Packshot";
import { PAGINA, VOORBEELD_KLEURCODE } from "./gedeeld";
import { VOORBEELD_OUTFITS, euro } from "@/content/voorbeeldOutfits";
import { toonNaam } from "@/utils/productNaam";

/** Het rapport als tijdschrift: een omslag, dan de outfits als spreads. */
export default function RapportAlsBlad() {
  const [eerste, tweede] = VOORBEELD_OUTFITS;
  return (
    <section className="bg-[#FAFAF8] py-16 md:py-24">
      <div className={PAGINA}>
        <p className="text-sm font-medium text-[#A85740]">Je rapport</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-snug text-[#1A1A1A] md:text-3xl">
          Je rapport leest als een tijdschrift over jou.
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Omslag */}
          <article className="flex flex-col justify-between rounded-2xl bg-[#1A1A1A] p-8 md:p-10">
            <div>
              <p className="text-sm font-medium text-[#E5E5E5]">Jouw stijl</p>
              <p className="mt-4 font-serif text-[56px] italic leading-none text-[#FAFAF8] md:text-[72px]">Minimalistisch</p>
            </div>
            <div className="mt-16">
              <Kleurcode kleuren={VOORBEELD_KLEURCODE} hoogte={36} rand="donker" />
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[#4A4A4A] pt-6 text-[#FAFAF8]">
                <div>
                  <dt className="text-sm text-[#E5E5E5]">Kleurtype</dt>
                  <dd className="mt-1 text-base font-semibold">Winter</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#E5E5E5]">Contrast</dt>
                  <dd className="mt-1 text-base font-semibold">Hoog</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#E5E5E5]">Basis</dt>
                  <dd className="mt-1 text-base font-semibold">Zwart, wit</dd>
                </div>
              </dl>
            </div>
          </article>

          {/* Eerste spread */}
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-6 md:p-8">
            <p className="text-sm font-medium text-[#A85740]">{eerste.gelegenheid}</p>
            <h3 className="mt-1 text-xl font-semibold text-[#1A1A1A] md:text-2xl">{eerste.titel}</h3>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-[#4A4A4A]">{eerste.uitleg}</p>
            <ul className="mt-6 grid grid-cols-2 gap-4 md:gap-6">
              {eerste.stukken.map((stuk) => (
                <li key={stuk.beeld}>
                  <Packshot stuk={stuk} sizes="(min-width: 1024px) 320px, 45vw" />
                  <p className="mt-3 text-sm font-medium text-[#1A1A1A]">{toonNaam({ name: stuk.naam, brand: stuk.merk })}</p>
                  <p className="text-sm text-[#4A4A4A]">
                    {stuk.merk} · {euro(stuk.prijs)}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        {/* Tweede spread over de volle breedte */}
        <article className="mt-6 grid gap-6 rounded-2xl border border-[#E5E5E5] bg-white p-6 md:grid-cols-[0.7fr_1.3fr] md:p-8">
          <div>
            <p className="text-sm font-medium text-[#A85740]">{tweede.gelegenheid}</p>
            <h3 className="mt-1 text-xl font-semibold text-[#1A1A1A] md:text-2xl">{tweede.titel}</h3>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-[#4A4A4A]">{tweede.uitleg}</p>
            <p className="mt-6 text-base font-semibold text-[#1A1A1A]">
              {euro(tweede.stukken.reduce((som, s) => som + s.prijs, 0))}
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
            {tweede.stukken.map((stuk) => (
              <li key={stuk.beeld}>
                <Packshot stuk={stuk} sizes="(min-width: 768px) 240px, 30vw" />
                <p className="mt-3 text-sm font-medium text-[#1A1A1A]">{toonNaam({ name: stuk.naam, brand: stuk.merk })}</p>
                <p className="text-sm text-[#4A4A4A]">{euro(stuk.prijs)}</p>
              </li>
            ))}
          </ul>
        </article>
        <p className="mt-6 text-sm text-[#6E6E6E]">
          Outfits zoals FitFi ze samenstelde voor een voorbeeldprofiel, prijzen van 21 oktober 2026.
        </p>
      </div>
    </section>
  );
}

