import { defineConfig, configDefaults } from "vitest/config";

// Zelfde alias als vite.config.ts. Bewust hier herhaald in plaats van die
// config te importeren: vite.config.ts draait loadEnv en laadt drie plugins
// die in een testrun niets toevoegen.
const SRC_ALIAS = new URL("./src", import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: SRC_ALIAS }],
  },
  test: {
    environment: "node",
    // LET OP: dit is de reden dat dit bestand bestaat. Zonder deze regel
    // draaide vitest op de standaard-excludes, en die kennen .claude/worktrees
    // niet. Op 2026-08-06 stonden daar 99 oude worktrees (9,1 GB) met samen
    // 74 kopieen van de testsuite. De run rapporteerde toen 4114 tests
    // waarvan 62 mislukt, terwijl src/ maar 12 testbestanden heeft: bijna
    // alles was hetzelfde handjevol falende tests uit oude branches, keer
    // honderd. Een testuitslag die je niet kunt vertrouwen is erger dan geen
    // testuitslag, want je gaat erop bouwen.
    exclude: [...configDefaults.exclude, "**/.claude/worktrees/**"],
  },
});
