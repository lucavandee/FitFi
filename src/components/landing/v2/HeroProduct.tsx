import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Kleurcode } from "./Kleurcode";
import { Packshot } from "./Packshot";
import { KNOP_PRIMAIR, PAGINA, VOORBEELD_KLEURCODE } from "./gedeeld";
import { VOORBEELD_OUTFITS, euro } from "@/content/voorbeeldOutfits";
import { track } from "@/utils/analytics";

const HERO_OUTFIT = VOORBEELD_OUTFITS[1];

/**
 * Hero van de homepage (designsysteem v2, CLAUDE.md deel 18; Luc koos op
 * 21 oktober 2026 variant A uit het prototype). Het product in drie
 * seconden: naast de displaykop bouwt een voorbeeldrapport zich op, eerst de
 * kleurcode, dan de stukken van een outfit die de stijlcontrole goedkeurde.
 * Geen beeld boven de vouw dat de LCP draagt: dat is de kop.
 */
function HeroKop({ licht }: { licht: boolean }) {
  return (
    <>
      <p className={`text-sm font-medium tracking-wide ${licht ? "text-[#E5E5E5]" : "text-[#4A4A4A]"}`}>
        Persoonlijk stijladvies
      </p>
      <h1
        className={`mt-5 font-serif text-[64px] leading-[0.95] sm:text-[80px] lg:text-[112px] xl:text-[128px] ${
          licht ? "text-[#FAFAF8]" : "text-[#1A1A1A]"
        }`}
      >
        <span className="italic">Draag wat</span>
        <br />
        bij je past.
      </h1>
      <p className={`mt-8 max-w-md text-lg leading-relaxed ${licht ? "text-[#E5E5E5]" : "text-[#4A4A4A]"}`}>
        Beantwoord veertien vragen. Je krijgt je kleuren, je stijl en outfits met links naar de winkel.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <NavLink
          to="/onboarding"
          className={KNOP_PRIMAIR}
          onClick={() => {
            track("cta_click", { page: "landing", position: "hero" });
            track("quiz_start", { page: "landing", position: "hero" });
          }}
        >
          Begin gratis
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </NavLink>
        <NavLink
          to="/results/preview"
          onClick={() => track("cta_click", { page: "landing", position: "hero_voorbeeld" })}
          className={`inline-flex min-h-[48px] items-center text-base font-medium underline underline-offset-2 transition-colors duration-200 ${
            licht ? "text-[#FAFAF8] hover:text-[#E5E5E5]" : "text-[#1A1A1A] hover:text-[#4A4A4A]"
          }`}
        >
          Bekijk voorbeeld
        </NavLink>
      </div>
    </>
  );
}

/** Hero A: het voorbeeldrapport bouwt zich op naast de kop. */
export default function HeroProduct() {
  const rustig = useReducedMotion();
  return (
    <section className="bg-[#1A1A1A] pt-44 pb-20 md:pt-52 md:pb-28">
      <div className={`${PAGINA} grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]`}>
        <div>
          <HeroKop licht />
        </div>

        <motion.article
          aria-label="Voorbeeld van een rapport"
          className="rounded-2xl bg-white p-6 md:p-8"
          initial={rustig ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-serif text-3xl italic text-[#1A1A1A]">Minimalistisch</p>
            <span className="rounded-full bg-[#A85740]/10 px-3 py-1 text-sm font-medium text-[#A85740]">Voorbeeld</span>
          </div>
          <p className="mt-6 text-sm font-medium text-[#4A4A4A]">Kleurcode</p>
          <Kleurcode kleuren={VOORBEELD_KLEURCODE} hoogte={44} opbouwen vertraging={0.3} className="mt-2" />

          <p className="mt-8 text-sm font-medium text-[#4A4A4A]">
            {HERO_OUTFIT.gelegenheid}: {HERO_OUTFIT.titel.toLowerCase()}
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {HERO_OUTFIT.stukken.map((stuk, i) => (
              <motion.li
                key={stuk.beeld}
                initial={rustig ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1 + i * 0.15 }}
              >
                <Packshot stuk={stuk} sizes="(min-width: 1024px) 160px, 30vw" laden="eager" />
              </motion.li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-[#E5E5E5] pt-4">
            <p className="text-sm text-[#4A4A4A]">{HERO_OUTFIT.stukken.length} stukken bij H&amp;M</p>
            <p className="text-base font-semibold text-[#1A1A1A]">
              {euro(HERO_OUTFIT.stukken.reduce((som, s) => som + s.prijs, 0))}
            </p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

