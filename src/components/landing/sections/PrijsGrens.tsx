import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ScrollScene } from "../scroll/ScrollScene";

/**
 * Hoofdgebaar van de prijzenpagina: een doorlopend voorbeeldrapport waar de
 * scroll een terracotta leeslijn doorheen trekt.
 *
 * Wat de lijn gepasseerd is blijft vol in beeld, dus vooruit scrollen neemt
 * Free nooit weg. Halverwege kruist de lijn de grens waar Free ophoudt en loopt
 * hetzelfde rapport gewoon door. Het verschil tussen de plannen is daarmee een
 * positie in een document en niet twee kolommen met vinkjes.
 *
 * De regels komen een op een uit de vergelijkingstabel in PricingPage.tsx.
 * Bewust tekstblokken en geen beeld: van dit rapport bestaat nog geen bruikbare
 * schermafbeelding in de repo.
 */

type Regel = {
  titel: string;
  uitleg: string;
  plan: "free" | "premium";
};

const REGELS: Regel[] = [
  {
    plan: "free",
    titel: "Stijlprofiel",
    uitleg: "Je profiel, opgebouwd uit de vragen die je beantwoordt.",
  },
  {
    plan: "free",
    titel: "Drie outfits",
    uitleg: "Drie complete sets, samengesteld op dat profiel.",
  },
  {
    plan: "free",
    titel: "Directe shoplinks",
    uitleg: "Bij elk stuk staat waar je het koopt.",
  },
  {
    plan: "free",
    titel: "Rapport aanpasbaar",
    uitleg: "Klopt iets niet, dan pas je het zelf aan.",
  },
  {
    plan: "premium",
    titel: "Onbeperkt outfits",
    uitleg: "Hetzelfde rapport stopt niet bij drie sets.",
  },
  {
    plan: "premium",
    titel: "Kleuranalyse",
    uitleg: "Welke kleuren bij je werken, op basis van je foto.",
  },
  {
    plan: "premium",
    titel: "Nova AI-assistent",
    uitleg: "Stel je stijlvraag, Nova antwoordt.",
  },
];

const VRIJ = REGELS.filter((r) => r.plan === "free").length;

/*
 * De kolom is zeven regels plus een rij voor de grens, elk een achtste hoog.
 * Zo staat de grens precies op de helft en valt de stand van de leeslijn
 * rechtstreeks samen met de regel waar hij op dat moment doorheen loopt.
 */
const RIJ = 100 / (REGELS.length + 1);
const bovenkantVan = (index: number) => (index < VRIJ ? index : index + 1) * RIJ;
const middenVan = (index: number) => (bovenkantVan(index) + RIJ / 2) / 100;

/** Halve breedte van de overgang van gedempt naar vol, in scenevoortgang. */
const OVERGANG = 0.045;

function Kop({ id }: { id?: string }) {
  return (
    <header className="max-w-prose">
      <span className="block text-xs font-semibold uppercase tracking-[2.5px] text-[#A85740]">
        Voorbeeldrapport
      </span>
      <h2
        id={id}
        className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-4 leading-snug"
      >
        Waar Free ophoudt
      </h2>
      <p className="text-base text-[#4A4A4A] mt-4 leading-relaxed">
        Free en Premium zijn niet twee rapporten. Het is er een. Bij Premium
        loopt hetzelfde rapport door.
      </p>
    </header>
  );
}

function Tekst({ regel }: { regel: Regel }) {
  return (
    <div className="min-w-0">
      <span className="block text-base font-semibold text-[#1A1A1A] leading-snug">
        {regel.titel}
      </span>
      <span className="block text-sm text-[#4A4A4A] leading-snug mt-1">
        {regel.uitleg}
      </span>
    </div>
  );
}

const BADGE =
  "w-8 h-8 shrink-0 rounded-full text-sm font-semibold flex items-center justify-center tabular-nums";

/** De haarlijn met het label, op de plek waar Free ophoudt. */
function Grenslijn() {
  return (
    <div className="flex items-center gap-4 w-full">
      <span
        className="flex-1 border-t border-dashed border-[#E5E5E5]"
        aria-hidden="true"
      />
      <span className="text-sm font-semibold text-[#A85740] whitespace-nowrap">
        Hier houdt Free op
      </span>
      <span
        className="flex-1 border-t border-dashed border-[#E5E5E5]"
        aria-hidden="true"
      />
    </div>
  );
}

function StatischeRegel({ regel, nummer }: { regel: Regel; nummer: number }) {
  return (
    <li className="flex items-center gap-4">
      <span className={`${BADGE} bg-[#A85740] text-white`}>{nummer}</span>
      <Tekst regel={regel} />
    </li>
  );
}

/**
 * Wat er staat als pinnen niet kan: hetzelfde rapport volledig zichtbaar, met
 * de haarlijn en het label op hun plek. De boodschap komt zonder scroll over.
 */
function Statisch() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-[760px] mx-auto">
        <Kop id="prijsgrens-kop" />
        <div className="mt-10 bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8">
          <ol className="list-none p-0 m-0 flex flex-col gap-6">
            {REGELS.slice(0, VRIJ).map((regel, i) => (
              <StatischeRegel key={regel.titel} regel={regel} nummer={i + 1} />
            ))}
          </ol>
          <div className="my-8">
            <Grenslijn />
          </div>
          <ol start={VRIJ + 1} className="list-none p-0 m-0 flex flex-col gap-6">
            {REGELS.slice(VRIJ).map((regel, i) => (
              <StatischeRegel
                key={regel.titel}
                regel={regel}
                nummer={VRIJ + i + 1}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/**
 * Een regel in de geanimeerde stage. Gedempt tot de leeslijn erlangs is, daarna
 * vol. De demping blijft op 0,8 zodat de tekst ook ervoor boven de
 * contrastgrens blijft; het echte signaal zit in het bolletje dat terracotta
 * wordt.
 */
function GeanimeerdeRegel({
  regel,
  nummer,
  index,
  positie,
}: {
  regel: Regel;
  nummer: number;
  index: number;
  positie: MotionValue<number>;
}) {
  const midden = middenVan(index);
  const band = [midden - OVERGANG, midden + OVERGANG];
  const opacity = useTransform(positie, band, [0.8, 1], { clamp: true });
  const achtergrond = useTransform(positie, band, ["#F5F0EB", "#A85740"], {
    clamp: true,
  });
  const cijfer = useTransform(positie, band, ["#6E6E6E", "#FFFFFF"], {
    clamp: true,
  });

  return (
    <motion.div
      className="flex items-center gap-4"
      style={{ height: `${RIJ}%`, opacity }}
    >
      <motion.span
        className={BADGE}
        style={{ backgroundColor: achtergrond, color: cijfer }}
      >
        {nummer}
      </motion.span>
      <Tekst regel={regel} />
    </motion.div>
  );
}

/** De leeslijn zelf: een terracotta streep die door het rapport zakt. */
function Leeslijn({ positie }: { positie: MotionValue<number> }) {
  const top = useTransform(positie, (p) => `${p * 100}%`);
  return (
    <motion.div
      className="absolute left-0 right-0 flex items-center"
      style={{ top, y: "-50%" }}
    >
      <span className="w-2.5 h-2.5 -ml-1 shrink-0 rounded-full bg-[#A85740]" />
      <span className="flex-1 h-0.5 bg-[#A85740]" />
    </motion.div>
  );
}

/*
 * De geanimeerde stage. Alles hierin is decoratief: de echte tekst staat in de
 * statische variant, die in de pinned branch als sr-only meeloopt. Bewust niets
 * focusbaars hier, want de vastgezette scene loopt onder de fixed header door.
 */
function Stage({ voortgang }: { voortgang: MotionValue<number> }) {
  // Een beat rust aan het begin en aan het eind, daarbuiten loopt de lijn.
  const positie = useTransform(voortgang, [0.08, 0.92], [0, 1], {
    clamp: true,
  });

  return (
    <div className="relative w-full h-full" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full grid grid-cols-12 gap-8 items-center">
        <div className="col-span-4">
          <Kop />
        </div>

        <div className="col-span-8">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 h-[76svh] max-h-[760px]">
            <div className="relative h-full flex flex-col">
              {REGELS.map((regel, i) => (
                <React.Fragment key={regel.titel}>
                  {i === VRIJ && (
                    <div
                      className="flex items-center"
                      style={{ height: `${RIJ}%` }}
                    >
                      <Grenslijn />
                    </div>
                  )}
                  <GeanimeerdeRegel
                    regel={regel}
                    nummer={i + 1}
                    index={i}
                    positie={positie}
                  />
                </React.Fragment>
              ))}

              <Leeslijn positie={positie} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrijsGrens() {
  return (
    <section className="bg-[#FAFAF8]" aria-labelledby="prijsgrens-kop">
      <ScrollScene hoogte="300vh" statisch={<Statisch />}>
        {(voortgang) => <Stage voortgang={voortgang} />}
      </ScrollScene>
    </section>
  );
}
