import React from 'react';

type AccentRule = {
  word: string;               // exact match (case-insensitive)
  className?: string;         // default 'text-gradient'
  onlyFirst?: boolean;        // wrap alleen de eerste hit
};

type Props = {
  text: string;
  accents: AccentRule[];
  className?: string;
};

/**
 * Veilig, deterministisch wrapper: wrapt exact gematchte woorden met een span.
 * - Geen replace-append bugs → dus GEEN duplicaties.
 * - Respecteert word boundaries → styling alleen op het hele woord.
 */
export function GradientTextLine({ text, accents, className }: Props) {
  if (!accents?.length) return <span className={className}>{text}</span>;

  // Bouw één gecombineerde regex per unieke word boundary
  const rules = accents.map(a => ({...a, className: a.className ?? 'text-gradient'}));

  // Splitten per woordgrens zodat we React nodes kunnen opbouwen
  const tokens = text.split(/(\b)/g);

  const usedFirst: Record<string, boolean> = {};

  const nodes = tokens.map((tok, i) => {
    // Alleen woorden targetten (door \b splits kunnen lege of spaties ook binnenkomen)
    if (!tok || !tok.trim()) return <React.Fragment key={i}>{tok}</React.Fragment>;

    for (const rule of rules) {
      if (tok.toLowerCase() === rule.word.toLowerCase()) {
        if (rule.onlyFirst && usedFirst[rule.word.toLowerCase()]) break;
        usedFirst[rule.word.toLowerCase()] = true;
        return (
          <span key={`${tok}-${i}`} className={rule.className}>
            {tok}
          </span>
        );
      }
    }
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });

  return <span className={className}>{nodes}</span>;
}

export default GradientTextLine;