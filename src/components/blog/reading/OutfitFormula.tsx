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
    <div className="bg-white/50 backdrop-blur-sm border-2 border-[#E5E5E5] rounded-2xl p-6 my-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#C2654A] text-white flex items-center justify-center font-bold">
          {number}
        </span>
        {occasion && (
          <span className="text-sm text-[#8A8A8A]">
            Voor: <span className="text-[#1A1A1A] font-medium">{occasion}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="px-4 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] font-medium">
              {item}
            </span>
            {idx < items.length - 1 && (
              <Plus className="w-4 h-4 text-[#8A8A8A] flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
