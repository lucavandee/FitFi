/**
 * Titel, gelegenheidslabel en uitleg voor een outfitkaart, uit de outfit
 * zelf. De terugval (generateOutfitDescription) is alleen voor een outfit
 * zonder eigen gegevens. Zie de test voor de aanleiding.
 */
const LABELS: Record<string, string> = {
  work: "Kantoor",
  casual: "Casual",
  date: "Avondje uit",
  party: "Feest",
  formal: "Formeel",
  sports: "Sport",
  sport: "Sport",
  travel: "Op reis",
};

interface MetGegevens {
  title?: unknown;
  name?: unknown;
  occasion?: unknown;
  explanation?: unknown;
}

interface Terugval {
  title: string;
  context: { label: string };
  description: string;
}

function tekst(x: unknown): string | null {
  return typeof x === "string" && x.trim() ? x : null;
}

export function kaartGegevens(outfit: MetGegevens, terugval: Terugval): { titel: string; label: string; uitleg: string } {
  const gelegenheid = tekst(outfit.occasion)?.toLowerCase() ?? null;
  return {
    titel: tekst(outfit.title) ?? tekst(outfit.name) ?? terugval.title,
    label: (gelegenheid && LABELS[gelegenheid]) || terugval.context.label,
    uitleg: tekst(outfit.explanation) ?? terugval.description,
  };
}
