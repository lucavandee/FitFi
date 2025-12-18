import React from 'react';
import { Sparkles } from 'lucide-react';

interface TLDRSectionProps {
  points: string[];
}

export const TLDRSection: React.FC<TLDRSectionProps> = ({ points }) => {
  return (
    <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border-2 border-[var(--ff-color-primary-200)] rounded-[var(--radius-lg)] p-8 my-12">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          TL;DR
        </h2>
      </div>

      <ul className="space-y-4">
        {points.map((point, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--ff-color-primary-600)] text-white flex items-center justify-center text-sm font-bold">
              {idx + 1}
            </span>
            <span className="text-[var(--color-text)] leading-relaxed">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
