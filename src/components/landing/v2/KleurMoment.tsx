import React from "react";
import { PAGINA } from "./gedeeld";

interface Kleurweg {
  naam: string;
  /**
   * De kleur van het knopje: de benoemde kleur zoals je hem ziet. Gemeten
   * pixels kleuren mee met het warme zonlicht (crème kwam uit als #C6AA8D).
   */
  hex: string;
  temperatuur: "warm" | "koel" | "neutraal";
  /** Pad zonder breedte en extensie; -600.webp en -1200.webp staan ernaast. */
  beeld: string;
}

/**
 * Dezelfde foto in vier kleuren: alleen de trui is anders. Gemaakt met
 * Higgsfield (castlid 1, Soul 2.0, job efbaafd7) en per kleur bewerkt met
 * FLUX 3, dat gezicht, haar en muur vrijwel gelijk liet (gemiddeld verschil
 * 0,4 tegen 4,7 bij GPT Image 2.5, gemeten 21 oktober 2026). Herkomst:
 * ~/claude-artifacts/fitfi-beeld/2026-10-21-website/cast/kleur/herkomst.json.
 */
const KLEURWEGEN: Kleurweg[] = [
  { naam: "Crème", hex: "#E8DCC8", temperatuur: "neutraal", beeld: "/beeld/kleur/creme" },
  { naam: "Olijf", hex: "#4A5228", temperatuur: "warm", beeld: "/beeld/kleur/olijf" },
  { naam: "Terracotta", hex: "#9A4529", temperatuur: "warm", beeld: "/beeld/kleur/terracotta" },
  { naam: "IJsblauw", hex: "#BCD3DE", temperatuur: "koel", beeld: "/beeld/kleur/ijsblauw" },
];

/**
 * Het kleurmoment op de homepage (CLAUDE.md deel 18): je tikt op een kleur en
 * ziet wat die met iemand doet. De foto's wisselen met een overvloei van
 * 300 ms; alle vier staan al in de pagina, zodat er niets hoeft te laden op
 * het moment van tikken. Het AI-label staat onder het beeld.
 */
export default function KleurMoment() {
  const [actief, setActief] = React.useState(0);
  return (
    <section className="bg-[#F5F0EB] py-16 md:py-24" aria-labelledby="kleurmoment-kop">
      <div className={`${PAGINA} grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]`}>
        <div>
          <p className="text-sm font-medium text-[#A85740]">Kleur</p>
          <h2 id="kleurmoment-kop" className="mt-3 text-2xl font-bold leading-snug text-[#1A1A1A] md:text-3xl">
            Dezelfde trui, vier kleuren.
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-[#4A4A4A]">
            Kleur verandert hoe je eruitziet. Tik op een kleur en kijk naar haar gezicht. Je rapport zegt welke tinten bij
            jou horen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Kleur van de trui">
            {KLEURWEGEN.map((k, i) => (
              <button
                key={k.naam}
                type="button"
                aria-pressed={actief === i}
                onClick={() => setActief(i)}
                className={`inline-flex min-h-[48px] items-center gap-3 rounded-xl border bg-white px-4 py-2 text-base font-medium text-[#1A1A1A] transition-colors duration-200 ${
                  actief === i ? "border-[#A85740]" : "border-[#E5E5E5] hover:border-[#A85740]"
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full border border-[#E5E5E5]"
                  style={{ backgroundColor: k.hex }}
                  aria-hidden="true"
                />
                {k.naam}
                <span className="text-sm font-normal text-[#4A4A4A]">{k.temperatuur}</span>
              </button>
            ))}
          </div>
        </div>

        <figure>
          <div className="relative aspect-[3/4] overflow-hidden bg-[#E5E5E5] lg:mx-auto lg:max-w-[520px]">
            {KLEURWEGEN.map((k, i) => (
              <img
                key={k.naam}
                src={`${k.beeld}-1200.webp`}
                srcSet={`${k.beeld}-600.webp 600w, ${k.beeld}-1200.webp 1200w`}
                sizes="(min-width: 1024px) 520px, 92vw"
                alt={i === actief ? `Model met krullend haar in een gebreide trui in ${k.naam.toLowerCase()}, lachend tegen een zandstenen muur` : ""}
                aria-hidden={i === actief ? undefined : true}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                  i === actief ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
          <figcaption className="mt-3 text-sm text-[#6E6E6E] lg:mx-auto lg:max-w-[520px]">
            Beeld gemaakt met AI. De persoon is een model; alleen de kleur van de trui verschilt.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
