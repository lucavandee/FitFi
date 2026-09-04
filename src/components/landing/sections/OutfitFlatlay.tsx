import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ScrollScene } from "../scroll/ScrollScene";

/**
 * Hoofdgebaar van de landingspagina: de outfit legt zichzelf neer.
 *
 * Elke scrollstap legt een kledingstuk op tafel met de reden dat het er ligt.
 * De stukken blijven liggen, dus vooruit scrollen neemt niets weg. Op de
 * laatste stap vouwen ze samen tot de foto van de gedragen outfit.
 *
 * Dit kan alleen FitFi laten zien: van precies dezelfde look bestaan zowel de
 * losse itemfoto's als het gedragen eindbeeld.
 *
 * Bewust GEEN koopknop of productlink in deze scene. De vier stukken hangen
 * nog niet aan een geverifieerde partnerfeed met voorraadstatus, dus de scene
 * presenteert zich als voorbeeld en niet als winkelwagen. Zodra de koppeling
 * er is kan het label weg en kunnen de links erin, in het statische blok
 * eronder (niet in de pin: daar hoort niets focusbaars).
 */

type Stuk = {
  naam: string;
  categorie: string;
  reden: string;
  beeld: string;
};

const STUKKEN: Stuk[] = [
  {
    naam: "Navy blazer",
    categorie: "Bovenstuk",
    reden: "Geeft de set structuur zonder streng te worden.",
    beeld: "/images/kantoor/68c7f668-08b6-4183-a4ba-e63a89858eb2.webp",
  },
  {
    naam: "Wit overhemd",
    categorie: "Onderlaag",
    reden: "Werkt dicht onder de blazer en open eronderuit.",
    beeld: "/images/kantoor/7bb820f7-1c79-45d6-ab9a-2f179aad8e47.webp",
  },
  {
    naam: "Grijze pantalon",
    categorie: "Onderstuk",
    reden: "Grijs houdt navy rustig, zwart maakt het snel hard.",
    beeld: "/images/kantoor/36e92469-6f72-4b27-bdc1-df1a89edf31b_(1).webp",
  },
  {
    naam: "Zwarte schoenen",
    categorie: "Schoenen",
    reden: "Sluit de set af zonder de aandacht te trekken.",
    beeld: "/images/kantoor/dedac5c1-3dd7-417f-93ec-44b09121f537_(1).webp",
  },
];

const GEDRAGEN = "/images/kantoor/47c38a6c-a3a2-4de7-a666-329ca7e3d231_(1).webp";

/* Elk stuk krijgt een vijfde van de scroll; het laatste vijfde is de gedragen foto. */
const BEATS = STUKKEN.length + 1;

function Kaart({
  stuk,
  nummer,
  compact = false,
}: {
  stuk: Stuk;
  nummer: number;
  /* Binnen de vastgezette stage moet alles in 100svh passen, dus daar is het
     beeld op hoogte begrensd in plaats van vierkant. */
  compact?: boolean;
}) {
  return (
    <figure className="m-0 bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
      <img
        src={stuk.beeld}
        alt={compact ? "" : stuk.naam}
        width={800}
        height={800}
        loading="lazy"
        className={
          compact
            ? "w-full h-[19svh] object-cover"
            : "w-full aspect-square object-cover"
        }
      />
      <figcaption className={compact ? "p-3" : "p-4"}>
        <span className="block text-xs font-medium uppercase tracking-[1.5px] text-[#6E6E6E]">
          {String(nummer).padStart(2, "0")} · {stuk.categorie}
        </span>
        <span
          className={
            compact
              ? "block text-[15px] font-semibold text-[#1A1A1A] mt-1"
              : "block text-base font-semibold text-[#1A1A1A] mt-1"
          }
        >
          {stuk.naam}
        </span>
        <span className="block text-sm text-[#4A4A4A] mt-1 leading-snug">
          {stuk.reden}
        </span>
      </figcaption>
    </figure>
  );
}

/** Wat er staat als pinnen niet kan: gewoon de vier stukken en dan het resultaat. */
function Statisch() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <Kop />
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 list-none p-0">
        {STUKKEN.map((stuk, i) => (
          <li key={stuk.naam}>
            <Kaart stuk={stuk} nummer={i + 1} />
          </li>
        ))}
      </ol>
      <figure className="m-0 mt-10">
        <img
          src={GEDRAGEN}
          alt="De vier kledingstukken samen gedragen"
          width={1200}
          height={1600}
          loading="lazy"
          className="w-full max-w-md mx-auto rounded-2xl border border-[#E5E5E5] object-cover"
        />
        <figcaption className="text-center text-sm text-[#6E6E6E] mt-4">
          Voorbeeldoutfit · Kantoor
        </figcaption>
      </figure>
    </div>
  );
}

function Kop() {
  return (
    <header className="max-w-prose">
      <span className="block text-xs font-semibold uppercase tracking-[2.5px] text-[#A85740]">
        Voorbeeldoutfit
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-4 leading-snug">
        Zo ziet een outfit eruit
      </h2>
      <p className="text-base text-[#4A4A4A] mt-4 leading-relaxed">
        Vier stukken, en bij elk de reden dat het er ligt. Dit is een
        voorbeeld voor kantoor, geen selectie op jouw profiel.
      </p>
    </header>
  );
}

/* De geanimeerde stage. Alles hierin is decoratief: de echte tekst staat in de
   statische variant, die in de pinned branch als sr-only meeloopt. */
function Stage({ voortgang }: { voortgang: MotionValue<number> }) {
  const gedragenOpacity = useTransform(voortgang, [0.76, 0.9], [0, 1]);
  const rasterOpacity = useTransform(voortgang, [0.76, 0.88], [1, 0]);
  const rasterSchaal = useTransform(voortgang, [0.76, 0.95], [1, 0.92]);

  return (
    <div className="relative w-full h-full" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full grid grid-cols-12 gap-10 items-center">
        <div className="col-span-4">
          <Kop />
          <Teller voortgang={voortgang} />
        </div>

        {/* max-h houdt het raster binnen de stage: twee rijen van ongeveer
            19svh beeld plus bijschrift passen zo altijd in 100svh. */}
        <div className="col-span-8 relative max-h-[82svh]">
          <motion.div
            className="grid grid-cols-2 gap-5"
            style={{ opacity: rasterOpacity, scale: rasterSchaal }}
          >
            {STUKKEN.map((stuk, i) => (
              <Verschijnt key={stuk.naam} voortgang={voortgang} index={i}>
                <Kaart stuk={stuk} nummer={i + 1} compact />
              </Verschijnt>
            ))}
          </motion.div>

          <motion.figure
            className="absolute inset-0 m-0 flex flex-col items-center justify-center"
            style={{ opacity: gedragenOpacity }}
          >
            <img
              src={GEDRAGEN}
              alt=""
              width={1200}
              height={1600}
              loading="lazy"
              className="max-h-[64svh] w-auto rounded-2xl border border-[#E5E5E5] object-cover"
            />
            <figcaption className="text-sm text-[#6E6E6E] mt-4">
              Voorbeeldoutfit · Kantoor
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </div>
  );
}

/** Een stuk komt op zijn beurt in beeld en blijft daarna liggen. */
function Verschijnt({
  voortgang,
  index,
  children,
}: {
  voortgang: MotionValue<number>;
  index: number;
  children: React.ReactNode;
}) {
  const start = index / BEATS;
  const eind = (index + 1) / BEATS;
  const opacity = useTransform(voortgang, [start, eind], [0, 1], { clamp: true });
  const y = useTransform(voortgang, [start, eind], [28, 0], { clamp: true });
  return (
    <motion.div style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

/**
 * Telt mee met wat er ligt. aria-hidden, want een teller die per scrollstap
 * ophoogt laat een schermlezer elke tussenwaarde voorlezen. Het getal staat
 * eenmalig als gewone tekst in de statische variant.
 */
function Teller({ voortgang }: { voortgang: MotionValue<number> }) {
  const [aantal, setAantal] = React.useState(0);

  React.useEffect(() => {
    return voortgang.on("change", (p) => {
      const n = Math.min(STUKKEN.length, Math.floor(p * BEATS) + (p > 0 ? 1 : 0));
      setAantal(Math.max(0, Math.min(STUKKEN.length, n)));
    });
  }, [voortgang]);

  return (
    <p className="mt-8 text-sm font-medium text-[#6E6E6E] tabular-nums" aria-hidden="true">
      <span className="text-[#A85740] font-semibold">{aantal}</span> van{" "}
      {STUKKEN.length} stuks op tafel
    </p>
  );
}

export default function OutfitFlatlay() {
  return (
    <section className="bg-[#F5F0EB]" aria-labelledby="flatlay-kop">
      <h2 id="flatlay-kop" className="sr-only">
        Zo ziet een outfit eruit
      </h2>
      <ScrollScene hoogte="200vh" statisch={<Statisch />}>
        {(voortgang) => <Stage voortgang={voortgang} />}
      </ScrollScene>
    </section>
  );
}
