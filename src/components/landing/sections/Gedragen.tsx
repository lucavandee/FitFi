import type { CSSProperties } from "react";
import EigenBeeld from "@/components/landing/beeld/EigenBeeld";
import Beeldlabel, { Verloop } from "@/components/landing/beeld/Beeldlabel";
import { W1 } from "@/content/beeld";
import { LANDING_COPY } from "@/content/landingCopy";

const COPY = LANDING_COPY.gedragen;

/** Vanaf 1024 px: zo hoog als het scherm onder de kop, tenzij de halve breedte eerder op is. */
const HOOGTE_LG = "min(calc(100svh - var(--header-h, 90px)), 62.5vw)";

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
 * Gedragen (plan "Onder de hero", 4.1): de camera komt dichterbij. Een vrouw
 * uit dezelfde reeks als de hero van dit breekpunt, nu alleen de kleding, met
 * de drie stappen van de quiz ernaast.
 *
 * - Vanaf 1024 px staat W1 tegen de rechterschermrand, direct onder de hero, en
 *   is het precies zo hoog als het scherm onder de kop (HOOGTE_LG). Zo past het
 *   hele beeld onder de kop en kan het label vast rechtsboven staan. De tekst
 *   staat op kolom 1 tot 5, boven het midden: de vrije hoogte erboven en
 *   eronder staat als 2 tot 3. Verticaal gecentreerd las in de beeldkritiek van
 *   fase 4 als standaardinstelling. Een vaste bovenmarge liep op 1024 x 768 uit
 *   het vak; met de verdeling kan dat niet, en is de tekst ooit hoger dan het
 *   beeld, dan groeit de sectie (min-h) in plaats van dat de tekst eroverheen
 *   loopt.
 * - Onder 1024 px: een lichte band, dan W1 (768 tot 1023 px hoogstens 560 px
 *   breed) en daaronder de tekst op dezelfde as. Zonder band liep de crème
 *   broek van de hero door in die van W1, met twee labels 130 px uit elkaar.
 *   Tussen W1 en het eerste app-element van Kleur staat zo altijd deze tekst en
 *   een sectiegrens (G23).
 * - W1 laadt na load en een idle-moment, of eerder als het binnen 500 px komt;
 *   nooit voor de hero.
 */
export default function Gedragen() {
  return (
    <section
      id="gedragen"
      aria-labelledby="gedragen-kop"
      className="relative bg-[#FAFAF8] pt-16 md:pt-24 lg:min-h-[var(--w1-h)] lg:pt-0"
      style={{ "--w1-h": HOOGTE_LG } as CSSProperties}
    >
      {/* De mediaankleur van de eigen uitsnede vult het vak tot het beeld er is. */}
      <figure
        className="relative m-0 w-full aspect-[4/5] overflow-hidden bg-[var(--vak-mobiel)] md:mx-auto md:max-w-[560px] lg:absolute lg:right-0 lg:top-0 lg:mx-0 lg:h-[var(--w1-h)] lg:w-auto lg:max-w-none lg:bg-[var(--vak-desktop)]"
        style={{ "--vak-mobiel": W1.mobiel.mediaankleur, "--vak-desktop": W1.desktop.mediaankleur } as CSSProperties}
      >
        <EigenBeeld
          bronnen={[
            { media: "(max-width: 1023px)", set: W1.mobiel, sizes: "(min-width: 768px) 560px, 100vw" },
            { set: W1.desktop, sizes: "min(50vw, calc(80vh - 72px))" },
          ]}
          alt={W1.alt}
          laden="na-load"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Verloop achtergrond={W1.verloop.onderLg} className="lg:hidden" />
        <Verloop achtergrond={W1.verloop.vanafLg} className="hidden lg:block" />
        {/* Op twee regels, ook op desktop: op een regel loopt het label rechtsboven
            over de lichte trui (3,1 tot 3,6:1 gemeten); op twee regels blijft het
            rechts van de vrouw. */}
        <Beeldlabel zinnen={W1.label} hoek={W1.labelHoek} tweeRegels="altijd" />
      </figure>

      {/* Vanaf 1024 px verdelen de twee pseudo-elementen de vrije hoogte als 2 tot 3. */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:max-w-[560px] md:px-0 lg:flex lg:min-h-[var(--w1-h)] lg:max-w-7xl lg:flex-col lg:px-8 lg:before:flex-[2] lg:after:flex-[3]">
        <div className="grid grid-cols-1 gap-6 lg:w-full lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="gedragen-kop" className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A]">
              {COPY.kop.tekst}
            </h2>
            <Stappen className="mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
