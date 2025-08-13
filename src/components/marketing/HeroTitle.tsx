import React from 'react';
import { GradientTextLine } from '@/components/ui/GradientText';

type Props = {
  lines: string[];           // elke regel één string
  accents?: { [lineIndex: number]: { word: string; className?: string; onlyFirst?: boolean; }[] };
  className?: string;
};

export default function HeroTitle({ lines, accents, className }: Props) {
  return (
    <h1 className={`leading-[0.95] tracking-[-0.02em] text-slate-900 font-extrabold
                    text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[84px] ${className ?? ''}`}>
      <span className="block space-y-3">
        {lines.map((line, idx) => (
          <span key={idx} className="block">
            <GradientTextLine
              text={line}
              accents={accents?.[idx] ?? []}
            />
          </span>
        ))}
      </span>
    </h1>
  );
}