import { NavLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Kleurcode } from "./Kleurcode";
import { KNOP_PRIMAIR, PAGINA, VOORBEELD_KLEURCODE } from "./gedeeld";
import { track } from "@/utils/analytics";

/** De afsluiter van de homepage: een avondsectie met de kleurcode en een knop (CLAUDE.md deel 15 en 18). */
export default function Afsluiter() {
  return (
    <section className="bg-[#1A1A1A] py-40">
      <div className={`${PAGINA} text-center`}>
        <div className="mx-auto max-w-xs">
          <Kleurcode kleuren={VOORBEELD_KLEURCODE} hoogte={20} rand="donker" />
        </div>
        <h2 className="mt-10 font-serif text-[44px] italic leading-tight text-[#FAFAF8] md:text-[72px]">
          Wat is jouw kleurcode?
        </h2>
        <div className="mt-10">
          <NavLink
            to="/onboarding"
            className={KNOP_PRIMAIR}
            onClick={() => {
              track("cta_click", { page: "landing", position: "slot" });
              track("quiz_start", { page: "landing", position: "slot" });
            }}
          >
            Begin gratis
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </NavLink>
        </div>
      </div>
    </section>
  );
}

