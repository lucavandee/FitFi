/**
 * Bewaakt dat de functies die de scripts met de service role aanroepen een eigen
 * limiet van 60 s hebben (migraties 20261002120000 en 20261008110000). Zie
 * selectie-timeout.sql voor waarom dit een test op de instelling is. Alleen
 * opt-in, en alleen waar de CLI aan het project gekoppeld is:
 *   LIVE_DB_TEST=1 npx vitest run scripts/keten/__tests__/selectieTimeout.live.test.ts
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const liveOptIn = process.env.LIVE_DB_TEST === "1";
const sqlBestand = fileURLToPath(new URL("./selectie-timeout.sql", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

describe.skipIf(!liveOptIn)("functies met een eigen limiet van 60 s (live)", () => {
  it(
    "de vijf functies die de scripts aanroepen hebben statement_timeout = 60s",
    () => {
      const uit = execFileSync("supabase", ["db", "query", "--linked", "-f", sqlBestand], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      expect(uit).toContain("SELECTIE_TIMEOUT_OK");
    },
    180_000
  );
});
