import React from "react";
import { euro, formaat } from "@/content/voorbeeldOutfits";
import { toonNaam } from "@/utils/productNaam";

export interface SpreadStuk {
  id: string;
  naam: string;
  merk?: string;
  beeld?: string;
  prijs?: number | null;
}

interface OutfitSpreadProps {
  nummer: number;
  label?: string;
  titel: string;
  uitleg?: string;
  stukken: SpreadStuk[];
  /** Beeld rechts in plaats van links (vanaf lg), zodat de spreads wisselen. */
  omgedraaid?: boolean;
  /** Opent de outfit met de links naar de winkels. */
  onBekijk: () => void;
  /** Ruimte voor de beoordelingsknoppen. */
  children?: React.ReactNode;
}

const MAX_BEELDEN = 4;

/** Kleinere versie bij H&M via de beeldparameter; andere winkels krijgen de bron. */
function bron(url: string, breedte: number) {
  return url.includes("image.hm.com") ? formaat(url, breedte) : url;
}

/**
 * Een outfit als spread in het rapport (designsysteem v2, CLAUDE.md deel 18):
 * links de stukken groot, rechts wat het is, waarom, en wat het kost. Tot 21
 * oktober 2026 waren dit drie smalle kaarten met alleen een merkregel ("Mix van
 * H & M en Puma") en een knop die naar een ander tabblad sprong.
 *
 * Productfoto's uit de feed houden hun verhouding en worden niet uitgesneden
 * (object-contain), zonder radius en zonder iets eroverheen (deel 17).
 */
export function OutfitSpread({ nummer, label, titel, uitleg, stukken, omgedraaid = false, onBekijk, children }: OutfitSpreadProps) {
  const metBeeld = stukken.filter((s) => s.beeld).slice(0, MAX_BEELDEN);
  const prijzen = stukken.map((s) => s.prijs).filter((p): p is number => typeof p === "number" && p > 0);
  const totaal = prijzen.length === stukken.length && prijzen.length > 0 ? prijzen.reduce((a, b) => a + b, 0) : null;
  const drie = metBeeld.length === 3;

  return (
    <article className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
      {/* Een wit vlak met ruimte tussen de stukken: de feeds hebben elk hun
          eigen achtergrond (Puma wit, H&M bijna wit), en lijnen ertussen
          maakten dat verschil juist zichtbaar. */}
      <div
        className={`grid gap-4 border border-[#E5E5E5] bg-white p-4 sm:gap-6 sm:p-6 ${metBeeld.length > 1 ? "grid-cols-2" : "grid-cols-1"} ${
          drie ? "grid-rows-2" : ""
        } ${omgedraaid ? "lg:order-2" : ""}`}
      >
        {metBeeld.map((s, i) => (
          <div
            key={s.id}
            className={drie && i === 0 ? "row-span-2" : "aspect-[3/4]"}
          >
            <img
              src={bron(s.beeld!, 600)}
              srcSet={s.beeld!.includes("image.hm.com") ? `${bron(s.beeld!, 400)} 400w, ${bron(s.beeld!, 800)} 800w` : undefined}
              sizes="(min-width: 1024px) 300px, 50vw"
              alt={toonNaam({ name: s.naam, brand: s.merk })}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-[#A85740]">
          {String(nummer).padStart(2, "0")}
          {label ? ` · ${label}` : ""}
        </p>
        <h3 className="mt-3 text-xl font-semibold text-[#1A1A1A] md:text-2xl">{titel}</h3>
        {uitleg && <p className="mt-3 max-w-prose text-base leading-relaxed text-[#4A4A4A]">{uitleg}</p>}

        <ul className="mt-6 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
          {stukken.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between gap-4 py-3">
              <span className="min-w-0">
                <span className="block text-base text-[#1A1A1A]">{toonNaam({ name: s.naam, brand: s.merk })}</span>
                {s.merk && <span className="block text-sm text-[#4A4A4A]">{s.merk}</span>}
              </span>
              {typeof s.prijs === "number" && s.prijs > 0 && (
                <span className="flex-shrink-0 text-base tabular-nums text-[#1A1A1A]">{euro(s.prijs)}</span>
              )}
            </li>
          ))}
          {totaal !== null && stukken.length > 1 && (
            <li className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-base font-semibold text-[#1A1A1A]">Samen</span>
              <span className="text-base font-semibold tabular-nums text-[#1A1A1A]">{euro(totaal)}</span>
            </li>
          )}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBekijk}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[#E5E5E5] bg-white px-6 py-3 text-base font-medium text-[#1A1A1A] transition-colors duration-200 hover:border-[#A85740]"
          >
            Bekijk bij partner
          </button>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </article>
  );
}
