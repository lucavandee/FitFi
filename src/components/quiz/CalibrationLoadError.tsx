import { Sparkles, RefreshCw } from 'lucide-react';

interface CalibrationLoadErrorProps {
  /** Laadt de outfits opnieuw. */
  onRetry: () => void;
  /** Gaat door naar het stijlrapport zonder calibratie. */
  onSkip: () => void;
}

/**
 * Wat de bezoeker ziet als de outfits voor de calibratiestap niet te laden
 * waren (CatalogusOnbereikbaar, ook na de herkansing in outfitService).
 *
 * Aparte weergave naast de lege toestand in CalibrationStep: "er past niets
 * bij je antwoorden" en "het laden mislukte" zijn twee verschillende dingen.
 * Dit scherm biedt daarom een nieuwe poging aan, en pas daarna het overslaan.
 * Zonder dit scherm at de stap de fout op in een console.error, en de
 * productiebuild haalt alle console-aanroepen weg (drop_console in
 * vite.config.ts): de bezoeker kreeg het scherm voor "er zijn geen outfits"
 * (We zijn je profiel aan het voorbereiden, met alleen een knop om door te
 * gaan) en wij zagen niets.
 */
export function CalibrationLoadError({ onRetry, onSkip }: CalibrationLoadErrorProps) {
  return (
    <div role="alert" className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4E8E3] border border-[#E5E5E5] mb-6">
        <Sparkles className="w-4 h-4 text-[#9A503B]" aria-hidden="true" />
        <span className="text-sm font-medium text-[#1A1A1A]">Outfit Calibratie</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] mb-4">
        Je outfits laden is niet gelukt
      </h2>
      <p className="max-w-prose mx-auto text-base leading-relaxed text-[#4A4A4A] mb-8">
        We konden de outfits niet ophalen. Probeer het opnieuw, of sla deze stap over. Je stijlrapport maken we dan
        op basis van je quiz- en swipe-antwoorden.
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base py-3 px-6 rounded-xl min-h-[48px] inline-flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <RefreshCw className="w-5 h-5" aria-hidden="true" />
          Probeer opnieuw
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl min-h-[48px] inline-flex items-center justify-center transition-colors duration-200"
        >
          Stap overslaan
        </button>
      </div>
    </div>
  );
}
