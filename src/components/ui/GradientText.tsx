import React from "react";

type AccentRule = {
  word: string; // exact match (case-insensitive)
  className?: string; // default 'text-gradient'
  onlyFirst?: boolean; // wrap alleen de eerste hit
};

type Props = {
  text: string;
  accents: AccentRule[];
  className?: string;
};

/**
 * Veilig, deterministisch wrapper:
 * - splitst op woordgrenzen zodat we losse spans per woord kunnen plaatsen
 * - respecteert onlyFirst
 * - voegt een defensieve inline backgroundImage toe voor gradient-classes
 */
export const GradientTextLine: React.FC<Props> = ({
  text,
  accents,
  className,
}) => {
  const rules = (accents ?? []).map((a) => ({
    ...a,
    className: a.className ?? "text-gradient",
  }));

  const usedFirst: Record<string, boolean> = {};

  // Splits per woordgrens; houdt spaties en leestekens als losse tokens in stand
  const tokens = text.split(/(\b)/g);

  const nodes = tokens.map((tok, i) => {
    // leeg of alleen whitespace → direct teruggeven
    if (!tok || !tok.trim())
      return <React.Fragment key={i}>{tok}</React.Fragment>;

    // Probeer elke accent-regel op dit token
    for (const rule of rules) {
      if (tok.toLowerCase() === rule.word.toLowerCase()) {
        if (rule.onlyFirst && usedFirst[rule.word.toLowerCase()]) break;
        usedFirst[rule.word.toLowerCase()] = true;

        // Defensieve inline gradient — voorkomt "balken" bij CSS-order/minifier issues
        const needsHardGradient = rule.className?.includes("text-gradient");
        const isSoft = rule.className?.includes("text-gradient-soft");
        const hardStyle = needsHardGradient
          ? {
              backgroundImage: isSoft
                ? "linear-gradient(90deg, var(--ff-grad-midnight) 0%, var(--ff-sky-300) 100%)"
                : "linear-gradient(90deg, var(--ff-grad-midnight) 0%, var(--ff-sky-500) 100%)",
            }
          : undefined;

        return (
          <span key={i} className={rule.className} style={hardStyle}>
            {tok}
          </span>
        );
      }
    }

    // Geen match → geef het token ongewijzigd terug
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });

  return <span className={className}>{nodes}</span>;
};

export default GradientTextLine;
