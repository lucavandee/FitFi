/**
 * Bewaakt dat in de gepubliceerde blogartikelen geen geld- of beleggingstaal
 * staat zonder bron (migratie 20261008140000). De artikelen leven in de
 * database, dus alleen een live toets ziet ze. Alleen opt-in, en alleen waar
 * de CLI aan het project gekoppeld is:
 *   LIVE_DB_TEST=1 npx vitest run scripts/blog/__tests__/blogGeenGeldclaims.live.test.ts
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const liveOptIn = process.env.LIVE_DB_TEST === "1";
const sqlBestand = fileURLToPath(new URL("./blog-geen-geldclaims.sql", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

describe.skipIf(!liveOptIn)("gepubliceerde blogartikelen zonder geldclaims (live)", () => {
  it(
    "geen artikel noemt financiële vrijheid, investeren of een budget van 100-200 euro",
    () => {
      const uit = execFileSync("supabase", ["db", "query", "--linked", "-f", sqlBestand], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      expect(uit).toContain("BLOG_GELDCLAIMS_OK");
    },
    120_000
  );
});
