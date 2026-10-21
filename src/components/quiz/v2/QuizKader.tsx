import { ArrowLeft, ArrowRight, AlertCircle, Clock, X } from "lucide-react";

/**
 * De vaste delen van een quizscherm in designsysteem v2 (CLAUDE.md deel 18):
 * de kopbalk met voortgang, de vraag als serif-kop, en de onderbalk met de
 * knoppen. Tot 21 oktober 2026 waren dit inline styles met tekst van 11 tot
 * 13 px; nu klassen en minstens 14 px, en elke knop minstens 44 px.
 */

export function QuizKopbalk({ stap, totaal, voortgang, onStop }: { stap: number; totaal: number; voortgang: number; onStop: () => void }) {
  return (
    <div className="flex-shrink-0 border-b border-[#E5E5E5] bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-2 sm:px-6">
        <p className="text-sm font-medium text-[#4A4A4A]">
          Vraag {stap} van {totaal}
        </p>
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop de quiz"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl text-[#4A4A4A] transition-colors duration-200 hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A85740]/40"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-3 sm:px-6">
        <div className="h-1 overflow-hidden rounded-full bg-[#E5E5E5]">
          <div className="h-full rounded-full bg-[#A85740] transition-[width] duration-300" style={{ width: `${voortgang}%` }} />
        </div>
      </div>
    </div>
  );
}

export function QuizVraag({ titel, toelichting, hint }: { titel: string; toelichting?: string; hint?: string }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="font-serif text-4xl italic leading-[1.05] text-[#1A1A1A] md:text-5xl">{titel}</h1>
      {toelichting && <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#4A4A4A]">{toelichting}</p>}
      {hint && <p className="mt-3 text-sm font-medium text-[#A85740]">{hint}</p>}
    </div>
  );
}

interface QuizOnderbalkProps {
  melding?: string;
  terugUit: boolean;
  bezig: boolean;
  laatste: boolean;
  overslaanKan: boolean;
  onTerug: () => void;
  onVolgende: () => void;
  onOverslaan: () => void;
  onLater: () => void;
}

export function QuizOnderbalk({ melding, terugUit, bezig, laatste, overslaanKan, onTerug, onVolgende, onOverslaan, onLater }: QuizOnderbalkProps) {
  return (
    <div className="flex-shrink-0 border-t border-[#E5E5E5] bg-white" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="mx-auto max-w-3xl px-4 pt-3 pb-2 sm:px-6">
        {melding && (
          <p className="mb-2 flex items-center justify-center gap-2 text-sm text-[#4A4A4A]" role="status">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {melding}
          </p>
        )}
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={onTerug}
            disabled={terugUit}
            aria-label="Vorige vraag"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#E5E5E5] bg-white text-[#1A1A1A] transition-colors duration-200 hover:border-[#A85740] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onVolgende}
            disabled={bezig}
            aria-label={laatste ? "Bekijk antwoorden" : "Volgende"}
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#A85740] text-base font-semibold text-white transition-colors duration-200 hover:bg-[#9A503B] disabled:cursor-not-allowed"
          >
            <span className="whitespace-nowrap">{bezig ? "Verwerken..." : laatste ? "Bekijk antwoorden" : "Volgende"}</span>
            {!bezig && <ArrowRight className="h-5 w-5 flex-shrink-0" />}
          </button>
        </div>
        <div className="mt-1 flex items-center justify-center gap-2">
          {overslaanKan && (
            <button
              type="button"
              onClick={onOverslaan}
              className="inline-flex min-h-[44px] items-center px-3 text-sm text-[#4A4A4A] underline-offset-2 hover:underline"
            >
              Overslaan
            </button>
          )}
          <button
            type="button"
            onClick={onLater}
            className="inline-flex min-h-[44px] items-center gap-2 px-3 text-sm text-[#4A4A4A] underline-offset-2 hover:underline"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            Opslaan en later verder
          </button>
        </div>
      </div>
    </div>
  );
}
