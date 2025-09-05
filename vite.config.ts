import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * FitFi Guard (Bolt-proof):
 * - Blokkeert *letterlijke* "..." in alle /src/ modules.
 * - Werkt in zowel `dev` als `build` (Bolt hoeft geen scripts te runnen).
 * - Geeft een duidelijke, mensvriendelijke foutmelding met bestandspad + count.
 */
function fitfiGuard() {
  const offenders: Array<{ id: string; count: number }> = [];

  return {
    name: "fitfi-guard",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      // Alleen onze app-code scannen (sneller, en geen node_modules)
      if (!id.includes(`${path.sep}src${path.sep}`)) return null;

      // Let op: dit checkt *letterlijke* drie puntjes — geen spread/rest.
      // Dat is precies de corrupte placeholder die onze builds brak.
      const matches = code.match(/\.\.\./g);
      if (matches && matches.length > 0) {
        offenders.push({ id, count: matches.length });
        const rel = id.replace(process.cwd() + path.sep, "");
        // Throw zorgt in dev voor overlay + in build voor harde stop.
        throw new Error(
          [
            "⛔ FitFi Guard: gevonden *letterlijke* ellipses (\"...\") in bronbestand.",
            `Bestand: ${rel}`,
            `Aantal: ${matches.length}`,
            "",
            "Vervang de placeholders door echte code of verwijder de import naar dit bestand.",
            "Tip: pak eerst centrale modules (context/, services/, engine/) om cascade-fouten te voorkomen.",
          ].join("\n")
        );
      }
      return null;
    },
    // Bonus: bij het sluiten van de build een kort overzicht in de console.
    buildEnd() {
      if (offenders.length === 0) return;
      // eslint-disable-next-line no-console
      console.error("\n──── FitFi Guard overzicht ─────────────────────────");
      for (const o of offenders) {
        const rel = o.id.replace(process.cwd() + path.sep, "");
        // eslint-disable-next-line no-console
        console.error(`- ${rel} — ${o.count}×`);
      }
      // eslint-disable-next-line no-console
      console.error("───────────────────────────────────────────────────\n");
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), fitfiGuard()],
    resolve: { alias: { "@": path.resolve(process.cwd(), "src") } },
    server: { port: 5173 },
    preview: { port: 4173 },
    build: { target: "es2020", sourcemap: true, outDir: "dist", emptyOutDir: true },
    define: { __APP_ENV__: JSON.stringify(env.VITE_ENVIRONMENT || "development") },
  };
});