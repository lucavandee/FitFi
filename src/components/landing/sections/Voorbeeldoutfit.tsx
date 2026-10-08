import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useOpNadering } from "@/components/landing/beeld/useOpNadering";
import { LANDING_COPY } from "@/content/landingCopy";
import {
  VOORBEELDOUTFIT,
  fotoOmschrijving,
  kiesWeergave,
  winkelnaam,
  type Stuk,
  type Voorbeeldoutfit as VoorbeeldoutfitData,
  type Weergave,
} from "@/content/voorbeeldoutfit";
import { track } from "@/utils/analytics";

const COPY = LANDING_COPY.outfit;

/** Vult {naam}-plaatshouders uit het register. */
function vul(tekst: string, waarden: Record<string, string>): string {
  return tekst.replace(/\{(\w+)\}/g, (heel, naam: string) => waarden[naam] ?? heel);
}

/**
 * Een productfoto van de winkel, ongewijzigd: src is exact de URL uit de feed,
 * het vak heeft de verhouding van de foto zelf, geen uitsnede, geen radius en
 * niets eroverheen (Daisycon art. 2.6). Laadt pas binnen 500 px van het scherm.
 */
function Productfoto({ stuk, onFout }: { stuk: Stuk; onFout: () => void }) {
  const [ref, dichtbij] = useOpNadering<HTMLImageElement>({ marge: 500 });
  const [breedte, hoogte] = stuk.fotoPixels;
  const winkel = winkelnaam(stuk.winkel);
  return (
    <div className="w-full bg-[#FAFAF8]" style={{ aspectRatio: `${breedte} / ${hoogte}` }}>
      <img
        ref={ref}
        src={dichtbij ? stuk.imageUrl : undefined}
        alt={vul(COPY.productfoto.tekst, { winkel, omschrijving: fotoOmschrijving(stuk) })}
        width={breedte}
        height={hoogte}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="block h-full w-full text-transparent"
        onError={onFout}
      />
    </div>
  );
}

/**
 * Outfit (plan "Onder de hero", 4.3): het bewijs achter "dit zou ik dragen".
 * Vier stukken die de engine voor het voorbeeldprofiel koos, bij de winkel die
 * eronder staat. Geen kaarten, geen prijs, geen voorraad.
 *
 * Rendert alleen met een complete hoofd- en reserveoutfit uit
 * voorbeeldoutfit.json. Laadt een foto niet, dan staat de hele reserveoutfit
 * er; zijn beide stuk, dan verdwijnt de sectie en meldt hij dat, zodat
 * "Bekijk voorbeeld" naar de kleurpiek kan wijzen.
 */
export default function Voorbeeldoutfit({
  data = VOORBEELDOUTFIT,
  onOnbeschikbaar,
}: {
  data?: VoorbeeldoutfitData | null;
  onOnbeschikbaar?: () => void;
}) {
  const [kapot, setKapot] = useState<ReadonlySet<Weergave>>(() => new Set());
  const weergave = data ? kiesWeergave(kapot) : null;

  useEffect(() => {
    if (data && weergave === null) onOnbeschikbaar?.();
  }, [data, weergave, onOnbeschikbaar]);

  if (!data || !weergave) return null;
  const outfit = data[weergave];
  const markeerKapot = () =>
    setKapot((oud) => (oud.has(weergave) ? oud : new Set([...oud, weergave])));

  return (
    <section
      id="outfit"
      tabIndex={-1}
      aria-labelledby="outfit-kop"
      className="bg-[#FAFAF8] py-16 outline-none md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 border-t border-[#E5E5E5] pt-12 lg:grid-cols-12">
          <h2 id="outfit-kop" className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] lg:col-span-5">
            {COPY.kop.tekst}
          </h2>
          <p className="max-w-prose text-base leading-relaxed text-[#4A4A4A] lg:col-span-6 lg:col-start-7">
            {vul(COPY.tekst.tekst, { N: String(outfit.N) })}
          </p>
        </div>
      </div>

      {/* Telefoon: een rail met scroll-snap, de volgende foto een kwart zichtbaar.
          Vanaf 768 px twee bij twee, vanaf 1024 px vier naast elkaar. */}
      <div className="mx-auto mt-12 max-w-7xl md:px-6 lg:px-8">
        <ul className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
          {outfit.stukken.map((stuk) => {
            const soort = COPY.stukken[stuk.categorie].tekst;
            const winkel = winkelnaam(stuk.winkel);
            return (
              <li key={stuk.productId} className="w-[280px] flex-none snap-start md:w-auto">
                <Productfoto stuk={stuk} onFout={markeerKapot} />
                <p className="mt-3 text-sm font-semibold text-[#1A1A1A]">{soort}</p>
                <p className="text-sm text-[#4A4A4A]">{winkel}</p>
                <a
                  href={stuk.affiliateUrl}
                  target="_blank"
                  rel="sponsored noopener"
                  aria-label={vul(COPY.partnerlinkNaam.tekst, { soort: soort.toLowerCase(), winkel })}
                  onClick={() => track("partner_klik", { position: "outfit", artikelnummer: stuk.artikelnummer })}
                  className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-[#1A1A1A] underline underline-offset-2"
                >
                  {COPY.partnerlink.tekst}
                  <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="max-w-prose text-sm text-[#4A4A4A]">
          {COPY.vergoeding.tekst}{" "}
          <Link to="/affiliate-disclosure" className="text-[#1A1A1A] underline underline-offset-2">
            {COPY.vergoedingLink.tekst}
          </Link>
        </p>
        <Link
          to="/onboarding"
          onClick={() => {
            track("cta_click", { page: "landing", position: "outfit" });
            track("quiz_start", { page: "landing", position: "outfit" });
          }}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-base font-semibold text-[#1A1A1A] underline underline-offset-2"
        >
          {COPY.begin.tekst}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
