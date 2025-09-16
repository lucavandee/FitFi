// src/components/ai/EmptyNova.tsx
import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  suggestions?: string[];
  onPick?: (v: string) => void;
  className?: string;
};

const EmptyNova: React.FC<Props> = ({
  title = "Start met je stijlvraag",
  subtitle = "Nova helpt je met outfits, combinaties en uitleg waarom iets bij je past.",
  suggestions = [
    "Welke schoenen bij donkerbruine pantalon?",
    "Maak een smart-casual look voor morgen",
    "Waarom past deze jas bij mijn silhouet?",
  ],
  onPick,
  className,
}) => {
  return (
    <section className={`ff-card card p-6 md:p-8 ${className || ""}`} aria-label="Lege Nova-staat">
      <header className="mb-4">
        <h2 className="font-heading text-ink text-xl md:text-2xl font-semibold">{title}</h2>
        <p className="text-muted mt-1">{subtitle}</p>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="nav-chip hover:cursor-pointer focus-ring"
            onClick={() => onPick?.(s)}
            aria-label={`Gebruik suggestie: ${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      <footer className="mt-6">
        <div className="text-muted text-sm">
          Tip: formuleer kort & concreet. Bijvoorbeeld: "Zwarte loafers of witte sneakers onder taupe pantalon?"
        </div>
      </footer>
    </section>
  );
};

export default EmptyNova;