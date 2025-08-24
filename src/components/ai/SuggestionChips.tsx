import React from "react";
import { track } from "@/utils/analytics";

type Props = {
  suggestions?: string[];
  className?: string;
  autoSubmit?: boolean;
};

const DEFAULTS = [
  "Maak een casual vrijdag-outfit voor mij",
  "Welke sneakers passen bij donkere jeans?",
  "Welke kleuren werken bij mijn huidtint?",
  "Geef 3 outfits voor een bruiloft (smart casual)",
  "Welke jas voor herfst 2025 met mijn stijlcode?",
  "Maak 3 casual outfits voor vrijdagavond. Voeg JSON toe (cards).",
];

export default function SuggestionChips({
  suggestions = DEFAULTS,
  className,
  autoSubmit = true,
}: Props) {
  const send = (text: string) => {
    window.dispatchEvent(
      new CustomEvent("nova:prefill", {
        detail: { prompt: text, submit: autoSubmit },
      }),
    );
    track?.("nova_suggestion_click", { prompt: text });
  };
  return (
    <div
      className={`flex flex-wrap gap-2 ${className ?? ""}`}
      aria-label="Voorbeelden"
    >
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => send(s)}
          className="ff-chip hover:bg-white transition"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
