import { Link } from "react-router-dom";
import EenmaligeClip from "@/components/landing/beeld/EenmaligeClip";
import { OPNAME_A1 } from "@/content/beeld";
import { GEGEVENSBLOK_AAN, LANDING_COPY } from "@/content/landingCopy";
import { ARCHIVO, LABEL, RASTER, SECTIE, TEKSTLINK } from "./stijl";

const STAPPEN = LANDING_COPY.gedragen.stappen;
const OPNAME = LANDING_COPY.werkwijze;
const GEGEVENS = LANDING_COPY.gegevens;
const MAIL = "privacy@fitfi.ai";

function MetMaillink({ tekst }: { tekst: string }) {
  const [voor, na] = tekst.split(MAIL);
  if (na === undefined) return <>{tekst}</>;
  return (
    <>
      {voor}
      <a href={`mailto:${MAIL}`} className="inline-flex min-h-[44px] items-center text-[#FAFAF8] underline decoration-1 underline-offset-4">
        {MAIL}
      </a>
      {na}
    </>
  );
}

/**
 * Hoe het werkt, op inkt: de drie stappen, de echte quiz in een opname (geen
 * AI-label: dit is de app zelf), en wat er met je gegevens gebeurt. Dezelfde
 * zinnen als in "Zo werkt het" van de vorige homepage, met dezelfde bronnen in
 * landingCopy.ts; alleen de vorm is nieuw.
 */
export default function Werkwijze() {
  const opname = OPNAME_A1;
  return (
    <section id="werkwijze" aria-labelledby="werkwijze-kop" className={`bg-[#1A1A1A] text-[#FAFAF8] ${SECTIE}`}>
      <div className={`${RASTER} grid gap-12 lg:grid-cols-12 lg:gap-6`}>
        <div className="lg:col-span-6">
          <p className={LABEL} style={ARCHIVO.label}>
            Zo werkt het
          </p>
          <h2 id="werkwijze-kop" className="mt-4 font-archivo text-[32px] lg:text-[48px]" style={ARCHIVO.kop}>
            {LANDING_COPY.gedragen.kop.tekst}.
          </h2>
          <ol className="mt-10 border-t border-[rgba(250,250,248,0.3)]">
            {STAPPEN.map((stap, i) => (
              <li key={stap.titel.tekst} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-[rgba(250,250,248,0.3)] py-6">
                <span className="font-archivo text-[15px] tabular-nums text-[rgba(250,250,248,0.7)]" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-archivo text-[22px] leading-tight" style={ARCHIVO.kop}>
                    {stap.titel.tekst}
                  </h3>
                  <p className="mt-2 max-w-prose text-[16px] leading-[25px] text-[rgba(250,250,248,0.82)] lg:text-[17px] lg:leading-[27px]">
                    {stap.tekst.map((z) => z.tekst).join(" ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {opname && (
          <figure className="m-0 lg:col-span-4 lg:col-start-9">
            <div
              className="relative mx-auto overflow-hidden border border-[rgba(250,250,248,0.3)] bg-white"
              style={{ width: "100%", maxWidth: `${opname.breedte}px`, aspectRatio: `${opname.breedte} / ${opname.hoogte}` }}
            >
              <img
                src={opname.poster}
                alt=""
                width={opname.breedte}
                height={opname.hoogte}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <EenmaligeClip
                bron={opname.clip}
                poster={opname.poster}
                beschrijvingId="werkwijze-opname-uitleg"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </div>
            <figcaption className="mx-auto mt-3 max-w-[390px] text-[14px] text-[rgba(250,250,248,0.82)]">{OPNAME.opname.onderschrift.tekst}</figcaption>
            <p id="werkwijze-opname-uitleg" className="sr-only">
              {OPNAME.opname.beschrijving.tekst}
            </p>
          </figure>
        )}

        {GEGEVENSBLOK_AAN && (
          <div className="lg:col-span-12 lg:mt-12">
            <h3 className="font-archivo text-[22px]" style={ARCHIVO.kop}>
              {GEGEVENS.kop.tekst}
            </h3>
            <dl className="mt-6 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
              {GEGEVENS.rijen.map((rij) => (
                <div key={rij.label.tekst} className="border-t border-[rgba(250,250,248,0.3)] py-4">
                  <dt className={LABEL} style={ARCHIVO.label}>
                    {rij.label.tekst}
                  </dt>
                  <dd className="mt-3 text-[16px] leading-[25px] text-[rgba(250,250,248,0.82)]">
                    <MetMaillink tekst={rij.tekst.tekst} />
                  </dd>
                </div>
              ))}
            </dl>
            <Link to="/privacy" className={`${TEKSTLINK} mt-2 text-[#FAFAF8]`}>
              {GEGEVENS.link.tekst}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
