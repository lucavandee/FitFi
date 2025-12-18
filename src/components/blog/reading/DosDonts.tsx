import React from 'react';
import { Check, X } from 'lucide-react';

interface DosDontsProps {
  dos: string[];
  donts: string[];
}

export const DosDonts: React.FC<DosDontsProps> = ({ dos, donts }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 my-8">
      {/* Do's */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[var(--radius-lg)] p-6">
        <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Do
        </h3>
        <ul className="space-y-3">
          {dos.map((item, idx) => (
            <li key={idx} className="flex gap-3 text-emerald-800">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Don'ts */}
      <div className="bg-red-50 border-2 border-red-200 rounded-[var(--radius-lg)] p-6">
        <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
          <X className="w-5 h-5" />
          Don't
        </h3>
        <ul className="space-y-3">
          {donts.map((item, idx) => (
            <li key={idx} className="flex gap-3 text-red-800">
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
