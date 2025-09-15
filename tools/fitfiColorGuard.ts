import type { Plugin } from "vite";

/**
 * FitFi Color Guard (soft)
 * - Doel: tijdens DEV waarschuwen voor verboden kleuren/klassen.
 * - Geen crashes; max 5 meldingen per bestand om ruis te beperken.
 * - Scant alleen bronbestanden, geen node_modules.
 * - Houdt rekening met onze tokens-regel (geen hex buiten tokens.css).
 */
export default function fitfiColorGuard(): Plugin {
  const HEX = /#[0-9a-fA-F]{3,8}\b/g;
  const TAILWIND_NEUTRALS = /\b(?:text|bg|border)-(?:gray|slate|stone|neutral)-\d{2,3}\b/g;
  const GRADIENTS = /\bbg-gradient-to-[trbl]{1,2}\b/g;

  const shouldScan = (id: string) =>
    id.includes("/src/") &&
    !id.includes("/src/styles/tokens.css") &&
    (id.endsWith(".ts") || id.endsWith(".tsx") || id.endsWith(".js") || id.endsWith(".jsx") || id.endsWith(".css") || id.endsWith(".html"));

  const warn = (id: string, kind: string, matches: string[]) => {
    const sample = [...new Set(matches)].slice(0, 5);
    // eslint-disable-next-line no-console
    console.warn(`\n⚠️  FitFi Color Guard: ${kind} gevonden in ${id}\n  -> ${sample.join(", ")}${matches.length > 5 ? " …" : ""}\n`);
  };

  return {
    name: "fitfi-color-guard-soft",
    enforce: "post",
    apply: "serve",
    transform(code, id) {
      if (!shouldScan(id)) return null;

      const hex = code.match(HEX) || [];
      if (hex.length) warn(id, "hex-kleuren buiten tokens", hex);

      const neutrals = code.match(TAILWIND_NEUTRALS) || [];
      if (neutrals.length) warn(id, "Tailwind neutralen (gray/slate/stone/neutral)", neutrals);

      const gradients = code.match(GRADIENTS) || [];
      if (gradients.length) warn(id, "gradients utilities", gradients);

      return null;
    },
  };
}