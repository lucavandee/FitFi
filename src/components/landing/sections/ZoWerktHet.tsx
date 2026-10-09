import { Link } from "react-router-dom";
import EenmaligeClip from "@/components/landing/beeld/EenmaligeClip";
import { OPNAME_A1, type Opname } from "@/content/beeld";
import { GEGEVENSBLOK_AAN, LANDING_COPY } from "@/content/landingCopy";

const COPY = LANDING_COPY.werkwijze;
const GEGEVENS = LANDING_COPY.gegevens;
const MAIL = "privacy@fitfi.ai";

/** Tussen 768 en 1023 px op dezelfde as van 560 px als W1 en W2. */
const TABLET_AS = "md:mx-auto md:w-full md:max-w-[560px] lg:mx-0 lg:max-w-none";

/**
 * De opname van stap 5 (A1) in een witte kaart waarvan de onderrand de opname
 * afsnijdt (object-top: het bovenste deel van het scherm blijft staan, de
 * onderkant valt weg). Vanaf 768 px op ware grootte, 390 css-pixels breed. Op
 * de telefoon ook in de kaart, en daardoor kleiner: over de volle breedte las
 * de opname als de app zelf, met een sluitknop en opties die niets doen. De
 * poster is het eindbeeld; bij reduced motion, Save-Data en 2G blijft alleen
 * die staan. Geen AI-label: dit is de echte app.
 */
function OpnameKaart({ opname }: { opname: Opname }) {
  return (
    <figure className={`m-0 mt-8 ${TABLET_AS} lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mt-0`}>
      <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white px-6 pt-6">
        <div
          className="relative mx-auto max-h-[560px] overflow-hidden"
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
      </div>
      <figcaption className="mt-3 text-sm font-medium text-[#4A4A4A]">{COPY.opname.onderschrift.tekst}</figcaption>
      <p id="werkwijze-opname-uitleg" className="sr-only">
        {COPY.opname.beschrijving.tekst}
      </p>
    </figure>
  );
}

/** Zet het mailadres in de tekst als link van minstens 44 px hoog. */
function MetMaillink({ tekst }: { tekst: string }) {
  const [voor, na] = tekst.split(MAIL);
  if (na === undefined) return <>{tekst}</>;
  return (
    <>
      {voor}
      <a href={`mailto:${MAIL}`} className="inline-flex min-h-[44px] items-center text-[#1A1A1A] underline underline-offset-2">
        {MAIL}
      </a>
      {na}
    </>
  );
}

/**
 * Wat er met je gegevens gebeurt (plan 4.4): vier regels in een vorm, label
 * boven de tekst. Naast de opname staat het blok in de linkerkolom onder de
 * H2, met een eigen H3. Zonder opname is de kop van het blok de H2 van de
 * sectie, en staan de regels in twee kolommen.
 */
function Gegevens({ naastOpname }: { naastOpname: boolean }) {
  const plek = naastOpname ? "mt-12 lg:col-span-5 lg:col-start-1 lg:row-start-2" : "mt-8 lg:col-span-8 lg:col-start-1";
  return (
    <div className={`${plek} ${TABLET_AS}`}>
      {naastOpname && <h3 className="text-xl font-semibold text-[#1A1A1A]">{GEGEVENS.kop.tekst}</h3>}
      <dl className={`${naastOpname ? "mt-6" : "lg:grid lg:grid-cols-2 lg:gap-x-6"}`}>
        {GEGEVENS.rijen.map((rij) => (
          <div key={rij.label.tekst} className="border-t border-[#E5E5E5] py-4">
            <dt className="text-base font-semibold text-[#1A1A1A]">{rij.label.tekst}</dt>
            <dd className="mt-1 text-base leading-relaxed text-[#4A4A4A]">
              <MetMaillink tekst={rij.tekst.tekst} />
            </dd>
          </div>
        ))}
      </dl>
      <Link
        to="/privacy"
        className="mt-2 inline-flex min-h-[44px] items-center text-base text-[#1A1A1A] underline underline-offset-2"
      >
        {GEGEVENS.link.tekst}
      </Link>
    </div>
  );
}

/**
 * Zo werkt het (plan "Onder de hero", 4.4): hoe de quiz eruitziet, en wat er
 * met je gegevens gebeurt. De drie stappen staan sinds de beeldkritiek van
 * fase 4 in Gedragen; hier stonden ze als tekstlijst zonder beeld, met een
 * lege kolom ernaast, en ze herhaalden wat Gedragen al zei.
 *
 * Met de opname: kop en gegevensblok links, de opname rechts; op de telefoon
 * kop, opname, gegevens. Zonder opname en zonder gegevensblok rendert de
 * sectie niet, net als de outfit zonder outfit. De grond wisselt mee met de
 * sectie erboven: zonder outfitsectie zou hij anders op hetzelfde zand als de
 * kleurpiek volgen.
 */
export default function ZoWerktHet({
  grond = "zand",
  opname = OPNAME_A1,
  gegevens = GEGEVENSBLOK_AAN,
}: {
  grond?: "zand" | "wit";
  opname?: Opname | null;
  gegevens?: boolean;
}) {
  if (!opname && !gegevens) return null;
  const achtergrond = grond === "zand" ? "bg-[#F5F0EB]" : "bg-[#FAFAF8]";
  return (
    <section id="werkwijze" aria-labelledby="werkwijze-kop" className={`${achtergrond} py-16 md:py-24`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6">
          <div className={`${TABLET_AS} lg:col-span-5 lg:row-start-1`}>
            <h2 id="werkwijze-kop" className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A]">
              {opname ? COPY.kop.tekst : GEGEVENS.kop.tekst}
            </h2>
          </div>
          {opname && <OpnameKaart opname={opname} />}
          {gegevens && <Gegevens naastOpname={opname !== null} />}
        </div>
      </div>
    </section>
  );
}
