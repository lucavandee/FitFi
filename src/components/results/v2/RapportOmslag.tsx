import { Eye, RefreshCw, Share2 } from "lucide-react";
import { Kleurcode, type KleurcodeKleur } from "@/components/landing/v2/Kleurcode";
import { KNOP_PRIMAIR, PAGINA } from "@/components/landing/v2/gedeeld";

interface RapportOmslagProps {
  /** "minimalistisch", uit ARCHETYPE_WEERGAVE; staat in kleine letters op de omslag. */
  stijlwoord: string;
  /** "Koel Zomer", de naam van het palet. */
  seizoen: string;
  /** ["koele tinten", "laag contrast"]; leeg als het profiel dat niet zegt. */
  kenmerken?: string[];
  /** De kleuren die bij je passen, uit hetzelfde palet als "Draag deze kleuren". */
  kleuren: KleurcodeKleur[];
  aantalOutfits: number;
  aantalBewaard: number;
  onBekijkOutfits: () => void;
  onQuizOpnieuw: () => void;
  onDelen: () => void;
}

const KNOP_DONKER =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#4A4A4A] px-6 py-3 text-base font-medium text-[#FAFAF8] transition-colors duration-200 hover:border-[#FAFAF8]";

/**
 * De omslag van het stijlrapport (designsysteem v2, CLAUDE.md deel 18): een
 * avondsectie met je stijlwoord als displaykop en je eigen kleurcode. Tot 21
 * oktober 2026 stond hier een zandkleurige kop met het archetype zoals het in
 * de database stond ("urban", "STREETWEAR").
 *
 * De kleurcode komt uit hetzelfde palet als het blok "Draag deze kleuren", dus
 * de omslag belooft geen andere kleuren dan het rapport.
 */
export function RapportOmslag({
  stijlwoord,
  seizoen,
  kenmerken = [],
  kleuren,
  aantalOutfits,
  aantalBewaard,
  onBekijkOutfits,
  onQuizOpnieuw,
  onDelen,
}: RapportOmslagProps) {
  const code = kleuren.slice(0, 7);
  return (
    <section className="bg-[#1A1A1A] pt-44 pb-16 md:pt-52 md:pb-24" aria-labelledby="rapport-kop">
      <div className={`${PAGINA} grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end`}>
        <div>
          <p className="text-sm font-medium tracking-wide text-[#E5E5E5]">Jouw stijlrapport</p>
          <h1
            id="rapport-kop"
            className="mt-5 font-serif text-[48px] italic leading-[0.95] text-[#FAFAF8] sm:text-[80px] lg:text-[112px] xl:text-[128px]"
          >
            {stijlwoord.toLowerCase()}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#E5E5E5]">
            {[seizoen, ...(kenmerken ?? [])].filter(Boolean).join(" · ")}
          </p>
        </div>

        {code.length > 0 && (
          <div>
            <p className="text-sm font-medium text-[#E5E5E5]">Jouw kleurcode</p>
            <Kleurcode kleuren={code} hoogte={56} rand="donker" opbouwen vertraging={0.2} className="mt-3" />
            <p className="mt-3 text-sm text-[#E5E5E5]">{code.map((k) => k.naam).join(", ")}</p>
          </div>
        )}
      </div>

      <div className={`${PAGINA} mt-12 flex flex-wrap items-center gap-3`}>
        <button type="button" onClick={onBekijkOutfits} className={KNOP_PRIMAIR}>
          <Eye className="h-5 w-5" aria-hidden="true" />
          Bekijk je outfits
        </button>
        <button type="button" onClick={onQuizOpnieuw} className={KNOP_DONKER}>
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
          Quiz opnieuw
        </button>
        <button type="button" onClick={onDelen} aria-label="Deel je rapport" className={`${KNOP_DONKER} px-3`}>
          <Share2 className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="w-full text-sm text-[#E5E5E5] sm:ml-3 sm:w-auto">
          {aantalOutfits} outfits{aantalBewaard > 0 ? `, ${aantalBewaard} bewaard` : ""}
        </p>
      </div>
    </section>
  );
}
