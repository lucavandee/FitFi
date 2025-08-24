import React from "react";
import { GradientTextLine } from "@/components/ui/GradientText";

type Props = {
  lines: string[];
  accents?: {
    [lineIndex: number]: {
      word: string;
      className?: string;
      onlyFirst?: boolean;
    }[];
  };
  className?: string;
  sanitize?: boolean; // default true
  balance?: boolean; // NEW — adds text-balance for better wrapping
};

function deDupLine(line: string) {
  const tokens = line.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const prev = out[out.length - 1];
    const cur = tokens[i];
    if (!prev || prev.toLowerCase() !== cur.toLowerCase()) out.push(cur);
  }
  return out.join(" ");
}

export default function HeroTitle({
  lines,
  accents,
  className,
  sanitize = true,
  balance = false,
}: Props) {
  const safeLines = sanitize ? lines.map(deDupLine) : lines;
  return (
    <h1
      className={`leading-[0.95] tracking-[-0.02em] text-slate-900 font-extrabold
                    text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[84px]
                    ${balance ? "text-balance" : ""} ${className ?? ""}`}
    >
      <span className="block space-y-3">
        {safeLines.map((line, idx) => (
          <span key={idx} className="block">
            <GradientTextLine text={line} accents={accents?.[idx] ?? []} />
          </span>
        ))}
      </span>
    </h1>
  );
}
