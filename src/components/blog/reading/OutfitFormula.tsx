import React from 'react';
import { Plus } from 'lucide-react';

interface OutfitFormulaProps {
  number: number;
  items: string[];
  occasion?: string;
}

export const OutfitFormula: React.FC<OutfitFormulaProps> = ({
  number,
  items,
  occasion
}) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 my-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--ff-color-primary-600)] text-white flex items-center justify-center font-bold">
          {number}
        </span>
        {occasion && (
          <span className="text-sm text-[var(--color-muted)]">
            Voor: <span className="text-[var(--color-text)] font-medium">{occasion}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] font-medium">
              {item}
            </span>
            {idx < items.length - 1 && (
              <Plus className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
