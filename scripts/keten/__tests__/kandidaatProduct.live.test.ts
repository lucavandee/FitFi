/**
 * Gedragstest van de triggers rond keten_kandidaat_product (migratie
 * 20261002120000). kandidaat-product-triggers.sql wijzigt echte rijen in
 * products en product_attributes en controleert na elke wijziging de kopie,
 * in één transactie die altijd terugdraait. Supabase-js kent geen
 * transacties; de Supabase CLI voert het bestand uit als één verzoek, en een
 * mislukte assert geeft exitcode 1 met de melding uit de assert.
 *
 * Alleen opt-in, en alleen waar de CLI aan het project gekoppeld is:
 *   LIVE_DB_TEST=1 npx vitest run scripts/keten/__tests__/kandidaatProduct.live.test.ts
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const liveOptIn = process.env.LIVE_DB_TEST === "1";
const sqlBestand = fileURLToPath(new URL("./kandidaat-product-triggers.sql", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

describe.skipIf(!liveOptIn)("keten_kandidaat_product: triggers (live, teruggedraaid)", () => {
  it(
    "houdt de kopie gelijk bij taggen, uitval, wijzigingen, dedupe en verwijderen, en get_kandidaten valt terug op products",
    () => {
      const uit = execFileSync("supabase", ["db", "query", "--linked", "-f", sqlBestand], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      expect(uit).toContain("KANDIDAAT_PRODUCT_TRIGGERS_OK");
    },
    180_000
  );
});
