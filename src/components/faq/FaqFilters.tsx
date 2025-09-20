import React from "react";

type Props = {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
};

const FaqFilters: React.FC<Props> = ({ tags, selected, onToggle, onClear }) => {
  const isSel = (t: string) => selected.includes(t);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onClear}
        className={`chip ${selected.length === 0 ? "chip--active" : ""}`}
        aria-pressed={selected.length === 0}
      >
        Alles
      </button>
      {tags.map((t) => (
        <button
          type="button"
          key={t}
          onClick={() => onToggle(t)}
          className={`chip ${isSel(t) ? "chip--active" : ""}`}
          aria-pressed={isSel(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

export default FaqFilters;