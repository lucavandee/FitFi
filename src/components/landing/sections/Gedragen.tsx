import type { CSSProperties } from "react";
import EigenBeeld from "@/components/landing/beeld/EigenBeeld";
import Beeldlabel, { Verloop } from "@/components/landing/beeld/Beeldlabel";
import { W1 } from "@/content/beeld";
import { LANDING_COPY } from "@/content/landingCopy";

const COPY = LANDING_COPY.gedragen;

/**
 * Gedragen (plan "Onder de hero", 4.1): de camera komt dichterbij. Dezelfde
 * vrouw als in de hero van dit breekpunt, nu alleen de kleding, en een zin over
 * wat FitFi doet.
 *
 * - Vanaf 1024 px staat W1 tegen de rechterschermrand, direct onder de hero, en
 *   is het precies zo hoog als het scherm onder de kop (100svh min --header-h),
 *   tenzij de halve breedte eerder op is (dan 50vw breed). Zo past het hele
 *   beeld onder de kop en kan het label vast rechtsboven staan. De tekst staat
 *   op kolom 1 tot 5, verticaal gecentreerd.
 * - Onder 1024 px: W1 over de volle breedte (768 tot 1023 px hoogstens 560 px),
 *   daaronder de tekst. Tussen W1 en het eerste app-element van Kleur staat zo
 *   altijd deze tekst en een sectiegrens (G23).
 * - W1 laadt na load en een idle-moment, of eerder als het binnen 500 px komt;
 *   nooit voor de hero.
 */
export default function Gedragen() {
  return (
    <section
      id="gedragen"
      aria-labelledby="gedragen-kop"
      className="relative bg-[#FAFAF8] lg:h-[min(calc(100svh_-_var(--header-h,90px)),62.5vw)]"
    >
      {/* De mediaankleur van de eigen uitsnede vult het vak tot het beeld er is. */}
      <figure
        className="relative m-0 w-full aspect-[4/5] overflow-hidden bg-[var(--vak-mobiel)] md:mx-auto md:max-w-[560px] lg:absolute lg:right-0 lg:top-0 lg:mx-0 lg:h-full lg:w-auto lg:max-w-none lg:bg-[var(--vak-desktop)]"
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

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:flex lg:h-full lg:items-center lg:px-8 lg:py-0">
        <div className="grid grid-cols-1 gap-6 lg:w-full lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="gedragen-kop" className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A]">
              {COPY.kop.tekst}
            </h2>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-[#4A4A4A]">
              {COPY.tekst.map((z) => z.tekst).join(" ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
