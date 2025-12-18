import React, { useState } from 'react';
import { Square, CheckSquare } from 'lucide-react';

interface BlogChecklistProps {
  title?: string;
  items: string[];
}

export const BlogChecklist: React.FC<BlogChecklistProps> = ({
  title = "Checklist",
  items
}) => {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newChecked = new Set(checked);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setChecked(newChecked);
  };

  return (
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 my-8">
      <h3 className="font-bold text-[var(--color-text)] text-lg mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => toggleItem(idx)}
            className="w-full flex items-start gap-3 text-left group hover:bg-[var(--ff-color-primary-50)] p-3 rounded-lg transition-colors"
          >
            {checked.has(idx) ? (
              <CheckSquare className="w-5 h-5 flex-shrink-0 text-[var(--ff-color-primary-600)] mt-0.5" />
            ) : (
              <Square className="w-5 h-5 flex-shrink-0 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] mt-0.5" />
            )}
            <span className={`leading-relaxed ${
              checked.has(idx)
                ? 'text-[var(--color-muted)] line-through'
                : 'text-[var(--color-text)]'
            }`}>
              {item}
            </span>
          </button>
        ))}
      </div>
      {checked.size > 0 && (
        <p className="mt-4 text-sm text-[var(--color-muted)] text-center">
          {checked.size} van {items.length} afgevinkt
        </p>
      )}
    </div>
  );
};
