import React from "react";

type Props = {
  items: string[];
  onPick?: (v: string) => void;
  className?: string;
  title?: string;
};

const SuggestionChips: React.FC<Props> = ({ items, onPick, className, title = "Probeer ook:" }) => {
  if (!items?.length) return null;
  return (
    <div className={className}>
      <p className="text-muted text-sm mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((v) => (
          <button
            key={v}
            type="button"
            className="nav-chip hover:cursor-pointer focus-ring"
            onClick={() => onPick?.(v)}
            aria-label={`Gebruik suggestie: ${v}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;