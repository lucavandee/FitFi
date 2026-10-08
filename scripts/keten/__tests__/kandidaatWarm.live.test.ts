/**
 * Gedragstest van keten_warm_houden (migratie 20261008100000). kandidaat-warm.sql
 * roept de functie aan en eist dat ze alle blokken van de dekkende index en de
 * kandidaatkopie verwerkt, dat die daarna vrijwel volledig in het geheugen staan,
 * en dat de pg_cron-job aan staat. Alleen opt-in:
 *   LIVE_DB_TEST=1 npx vitest run scripts/keten/__tests__/kandidaatWarm.live.test.ts
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const liveOptIn = process.env.LIVE_DB_TEST === "1";
const sqlBestand = fileURLToPath(new URL("./kandidaat-warm.sql", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

describe.skipIf(!liveOptIn)("keten_warm_houden (live)", () => {
  it(
    "zet de index en de kandidaatkopie terug in het werkgeheugen, en de job staat aan",
    () => {
      const uit = execFileSync("supabase", ["db", "query", "--linked", "-f", sqlBestand], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      expect(uit).toContain("KANDIDAAT_WARM_OK");
    },
    300_000
  );
});
