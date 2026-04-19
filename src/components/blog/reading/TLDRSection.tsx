import React from 'react';
import { Sparkles } from 'lucide-react';

interface TLDRSectionProps {
  points: string[];
}

export const TLDRSection: React.FC<TLDRSectionProps> = ({ points }) => {
  return (
    <div className="bg-gradient-to-br from-[#FAF5F2] to-[#FAF5F2] border-2 border-[#F4E8E3] rounded-2xl p-8 my-12">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-[#C2654A]" />
        <h2 className="text-2xl font-bold text-[#1A1A1A]">
          TL;DR
        </h2>
      </div>

      <ul className="space-y-4">
        {points.map((point, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C2654A] text-white flex items-center justify-center text-sm font-bold">
              {idx + 1}
            </span>
            <span className="text-[#1A1A1A] leading-relaxed">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
