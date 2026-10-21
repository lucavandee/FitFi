import { Check } from "lucide-react";
import { Kleurcode, type KleurcodeKleur } from "@/components/landing/v2/Kleurcode";

interface AntwoordkaartProps {
  label: string;
  toelichting?: string;
  gekozen: boolean;
  /** "een": een keuze (rondje), "meer": meerdere keuzes (vinkje). */
  soort: "een" | "meer";
  kleuren?: KleurcodeKleur[];
  onKies: () => void;
}

/**
 * Een antwoord in de quiz (designsysteem v2, CLAUDE.md deel 18). Tot 21
 * oktober 2026 stond de toelichting op 12 px in inline styles; nu minstens
 * 14 px en gewone klassen. Bij de kleurvragen staat de kleurcode van het
 * antwoord erin.
 */
export function Antwoordkaart({ label, toelichting, gekozen, soort, kleuren, onKies }: AntwoordkaartProps) {
  return (
    <button
      type="button"
      aria-pressed={gekozen}
      onClick={onKies}
      className={`flex w-full min-h-[72px] items-start gap-4 rounded-2xl border-2 p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A85740]/40 ${
        gekozen ? "border-[#A85740] bg-[#F4E8E3]" : "border-[#E5E5E5] bg-white hover:border-[#A85740]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center border-2 transition-colors duration-200 ${
          soort === "een" ? "rounded-full" : "rounded-xl"
        } ${gekozen ? "border-[#A85740] bg-[#A85740]" : "border-[#E5E5E5] bg-white"}`}
      >
        {gekozen && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-snug text-[#1A1A1A]">{label}</span>
        {toelichting && <span className="mt-1 block text-sm leading-relaxed text-[#4A4A4A]">{toelichting}</span>}
        {kleuren && kleuren.length > 0 && <Kleurcode kleuren={kleuren} hoogte={20} className="mt-3" />}
      </span>
    </button>
  );
}
