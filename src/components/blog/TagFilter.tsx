import React from "react";

type Props = {
  allTags: string[];
  active: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
};

const TagFilter: React.FC<Props> = ({ allTags, active, onToggle, onClear }) => {
  return (
    <div className="tagfilter">
      <div className="tagfilter-list" role="group" aria-label="Filter op tag">
        {allTags.map((t) => {
          const isOn = active.includes(t);
          return (
            <button
              key={t}
              className={`tag-chip ${isOn ? "is-on" : ""}`}
              aria-pressed={isOn}
              onClick={() => onToggle(t)}
            >
              {t}
            </button>
          );
        })}
      </div>
      {active.length > 0 && (
        <button className="btn btn-sm ghost" onClick={onClear} aria-label="Wis tagfilters">
          Wis filters
        </button>
      )}
    </div>
  );
};

export default TagFilter;