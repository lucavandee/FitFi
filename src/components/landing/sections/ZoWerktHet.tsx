import { Link } from "react-router-dom";
import EenmaligeClip from "@/components/landing/beeld/EenmaligeClip";
import { OPNAME_A1, type Opname } from "@/content/beeld";
import { GEGEVENSBLOK_AAN, LANDING_COPY } from "@/content/landingCopy";

const COPY = LANDING_COPY.werkwijze;
const GEGEVENS = LANDING_COPY.gegevens;
const MAIL = "privacy@fitfi.ai";

function Stappen({ className = "" }: { className?: string }) {
  return (
    // role="list": Safari laat de lijstsemantiek vallen bij list-style none.
    <ol role="list" className={`list-none divide-y divide-[#E5E5E5] ${className}`}>
      {COPY.stappen.map((stap, i) => (
        <li key={stap.titel.tekst} className="flex gap-4 py-6 first:pt-0 last:pb-0">
          <span className="w-4 flex-none text-sm text-[#4A4A4A]" aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <p className="text-base font-semibold text-[#1A1A1A]">{stap.titel.tekst}</p>
            <p className="mt-1 max-w-prose text-base leading-relaxed text-[#4A4A4A]">
              {stap.tekst.map((z) => z.tekst).join(" ")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * De opname van stap 5 (A1): op desktop op ware grootte in een witte kaart
 * waarvan de onderrand de opname afsnijdt, op mobiel over de volle breedte
 * zonder kaart. De poster is het eindbeeld; bij reduced motion, Save-Data en
 * 2G blijft alleen die staan. Geen AI-label: dit is de echte app.
 */
function OpnameKaart({ opname }: { opname: Opname }) {
  return (
    <figure className="m-0 lg:col-span-6 lg:col-start-7">
      <div className="-mx-4 overflow-hidden sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-[#E5E5E5] lg:bg-white lg:px-6 lg:pt-6">
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
            className="absolute inset-0 h-full w-full"
          />
          <EenmaligeClip
            bron={opname.clip}
            poster={opname.poster}
            beschrijvingId="werkwijze-opname-uitleg"
            className="absolute inset-0 h-full w-full"
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
 * Wat er met je gegevens gebeurt (plan 4.4): vier regels in een vorm. Staat uit
 * tot struikeldraad T3 gehaald is (GEGEVENSBLOK_AAN in landingCopy.ts).
 */
function Gegevens() {
  return (
    <div className="mt-16 border-t border-[#E5E5E5] pt-12">
      <h3 className="text-xl font-semibold text-[#1A1A1A]">{GEGEVENS.kop.tekst}</h3>
      <dl className="mt-6 grid grid-cols-1 gap-x-6 lg:grid-cols-2">
        {GEGEVENS.rijen.map((rij) => (
          <div key={rij.label.tekst} className="border-t border-[#E5E5E5] py-4 md:grid md:grid-cols-[10rem_1fr] md:gap-6">
            <dt className="text-base font-semibold text-[#1A1A1A]">{rij.label.tekst}</dt>
            <dd className="mt-1 text-base leading-relaxed text-[#4A4A4A] md:mt-0">
              <MetMaillink tekst={rij.tekst.tekst} />
            </dd>
          </div>
        ))}
      </dl>
      <Link
        to="/privacy"
        className="mt-6 inline-flex min-h-[44px] items-center text-base text-[#1A1A1A] underline underline-offset-2"
      >
        {GEGEVENS.link.tekst}
      </Link>
    </div>
  );
}

/**
 * Zo werkt het (plan "Onder de hero", 4.4): wat je doet, wat je krijgt, dat het
 * rapport een gratis account vraagt, en wat er met je gegevens gebeurt.
 *
 * Tot de opname er is (OPNAME_A1 in beeld.ts) staat de kop links en de drie
 * stappen rechts; met de opname staan kop en stappen links en de opname rechts.
 * De grond wisselt mee met de sectie erboven: zonder outfitsectie zou hij
 * anders op hetzelfde zand als de kleurpiek volgen.
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
  const achtergrond = grond === "zand" ? "bg-[#F5F0EB]" : "bg-[#FAFAF8]";
  return (
    <section id="werkwijze" aria-labelledby="werkwijze-kop" className={`${achtergrond} py-16 md:py-24`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 border-t border-[#E5E5E5] pt-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="werkwijze-kop" className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A]">
              {COPY.kop.tekst}
            </h2>
            {opname && <Stappen className="mt-8" />}
          </div>
          {opname ? (
            <OpnameKaart opname={opname} />
          ) : (
            <div className="lg:col-span-6 lg:col-start-7">
              <Stappen />
            </div>
          )}
        </div>
        {gegevens && <Gegevens />}
      </div>
    </section>
  );
}
