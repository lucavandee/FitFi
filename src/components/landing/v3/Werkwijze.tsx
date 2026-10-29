import { Link } from "react-router-dom";
import { GEGEVENSBLOK_AAN, LANDING_COPY } from "@/content/landingCopy";
import { ARCHIVO, LABEL, RASTER, SECTIE } from "./stijl";

const STAPPEN = LANDING_COPY.gedragen.stappen;
const GEGEVENS = LANDING_COPY.gegevens;
const MAIL = "privacy@fitfi.ai";
const OP_INKT = "text-[#FAFAF8] underline decoration-1 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAFAF8]";
/** Een losse link: 44 px hoog. Een link in een zin houdt de regelhoogte (WCAG 2.5.8 kent daar een uitzondering voor). */
const LINK_OP_INKT = `inline-flex min-h-[44px] items-center ${OP_INKT}`;

function MetMaillink({ tekst }: { tekst: string }) {
  const [voor, na] = tekst.split(MAIL);
  if (na === undefined) return <>{tekst}</>;
  return (
    <>
      {voor}
      <a href={`mailto:${MAIL}`} className={OP_INKT}>
        {MAIL}
      </a>
      {na}
    </>
  );
}

/**
 * Hoe het werkt, op inkt: de drie stappen naast elkaar, en wat er met je
 * gegevens gebeurt. Dezelfde zinnen als in "Zo werkt het" van de vorige
 * homepage, met dezelfde bronnen in landingCopy.ts; alleen de vorm is nieuw.
 * De opname van de quiz staat hier niet meer: die toont de quiz nog in de oude
 * vormgeving en staat op /hoe-het-werkt.
 */
export default function Werkwijze() {
  return (
    <section id="werkwijze" aria-labelledby="werkwijze-kop" className={`bg-[#1A1A1A] text-[#FAFAF8] ${SECTIE}`}>
      <div className={RASTER}>
        <p className={LABEL} style={ARCHIVO.label}>
          Zo werkt het
        </p>
        <h2 id="werkwijze-kop" className="mt-4 max-w-[22ch] font-archivo text-[32px] lg:text-[48px]" style={ARCHIVO.kop}>
          {LANDING_COPY.gedragen.kop.tekst}.
        </h2>
        <ol className="mt-10 grid gap-x-6 lg:mt-14 lg:grid-cols-3">
          {STAPPEN.map((stap, i) => (
            <li key={stap.titel.tekst} className="border-t border-[rgba(250,250,248,0.3)] py-6">
              <span className="font-archivo text-[16px] tabular-nums" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-archivo text-[24px] leading-tight" style={ARCHIVO.kop}>
                {stap.titel.tekst}
              </h3>
              <p className="mt-3 max-w-prose text-[16px] leading-[25px] lg:text-[17px] lg:leading-[27px]">{stap.tekst.map((z) => z.tekst).join(" ")}</p>
            </li>
          ))}
        </ol>

        {GEGEVENSBLOK_AAN && (
          <div className="mt-14 lg:mt-20">
            <h3 className="font-archivo text-[22px]" style={ARCHIVO.kop}>
              {GEGEVENS.kop.tekst}
            </h3>
            <dl className="mt-6 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
              {GEGEVENS.rijen.map((rij) => (
                <div key={rij.label.tekst} className="border-t border-[rgba(250,250,248,0.3)] py-4">
                  <dt className={LABEL} style={ARCHIVO.label}>
                    {rij.label.tekst}
                  </dt>
                  <dd className="mt-3 text-[16px] leading-[25px]">
                    <MetMaillink tekst={rij.tekst.tekst} />
                  </dd>
                </div>
              ))}
            </dl>
            <Link to="/privacy" className={`${LINK_OP_INKT} mt-2 text-base`}>
              {GEGEVENS.link.tekst}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
