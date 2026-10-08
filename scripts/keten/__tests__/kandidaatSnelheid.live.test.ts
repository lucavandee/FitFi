/**
 * Gedragstest van de snelheid van get_kandidaten (migratie 20261008090000).
 * kandidaat-snelheid.sql meet via pg_stat_statements of de gangbare profielen
 * zonder tijdelijke blokken sorteren. Alleen opt-in, en alleen waar de CLI aan
 * het project gekoppeld is:
 *   LIVE_DB_TEST=1 npx vitest run scripts/keten/__tests__/kandidaatSnelheid.live.test.ts
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const liveOptIn = process.env.LIVE_DB_TEST === "1";
const sqlBestand = fileURLToPath(new URL("./kandidaat-snelheid.sql", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

describe.skipIf(!liveOptIn)("get_kandidaten: snelheid (live)", () => {
  it(
    "sorteert de gangbare profielen in het geheugen in plaats van via tijdelijke bestanden",
    () => {
      const uit = execFileSync("supabase", ["db", "query", "--linked", "-f", sqlBestand], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      expect(uit).toContain("KANDIDAAT_SNELHEID_OK");
    },
    180_000
  );
});
