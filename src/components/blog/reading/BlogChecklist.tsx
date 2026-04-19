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
    <div className="bg-[#FFFFFF] border-2 border-[#E5E5E5] rounded-2xl p-6 my-8">
      <h3 className="font-bold text-[#1A1A1A] text-lg mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => toggleItem(idx)}
            className="w-full flex items-start gap-3 text-left group hover:bg-[#FAF5F2] p-3 rounded-lg transition-colors"
          >
            {checked.has(idx) ? (
              <CheckSquare className="w-5 h-5 flex-shrink-0 text-[#C2654A] mt-0.5" />
            ) : (
              <Square className="w-5 h-5 flex-shrink-0 text-[#8A8A8A] group-hover:text-[#C2654A] mt-0.5" />
            )}
            <span className={`leading-relaxed ${
              checked.has(idx)
                ? 'text-[#8A8A8A] line-through'
                : 'text-[#1A1A1A]'
            }`}>
              {item}
            </span>
          </button>
        ))}
      </div>
      {checked.size > 0 && (
        <p className="mt-4 text-sm text-[#8A8A8A] text-center">
          {checked.size} van {items.length} afgevinkt
        </p>
      )}
    </div>
  );
};
