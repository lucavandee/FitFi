/**
 * Welke fouten een feed-sync mag herhalen. Op 9 oktober 2026 liep de eerste echte fase b vast op
 * "statement timeout" en daarna op een Cloudflare-pagina (HTTP 522, "Connection timed out") in
 * plaats van een JSON-fout. Die laatste werd als definitief behandeld omdat het woord "timeout"
 * er niet in staat ("timed out"), en het script stopte met een hele HTML-pagina in de log.
 */
import { describe, expect, it } from "vitest";
import { isTijdelijk, kortBericht } from "../feed-sync/herkansing";

const CLOUDFLARE_522 = `<!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]-->
<head><title>supabase.co | 522: Connection timed out</title></head>
<body><div id="cf-wrapper"><span class="code-label">Error code 522</span></div></body></html>`;

describe("isTijdelijk", () => {
  it.each([
    [{ message: "canceling statement due to statement timeout", code: "57014" }],
    [{ message: "canceling statement due to statement timeout" }],
    [{ message: "TypeError: fetch failed" }],
    [{ message: "read ECONNRESET" }],
    [{ message: "schema cache is being reloaded", code: "PGRST002" }],
    [{ message: CLOUDFLARE_522 }],
    [{ message: "<!DOCTYPE html><title>supabase.co | 524: A timeout occurred</title>" }],
    [{ message: "Connection terminated due to connection timeout" }],
    [{ message: "upstream request timeout" }],
  ])("een tijdelijke fout wordt herhaald: %j", (fout) => {
    expect(isTijdelijk(fout)).toBe(true);
  });

  it.each([
    [{ message: 'duplicate key value violates unique constraint "products_sku_unique"', code: "23505" }],
    [{ message: 'null value in column "description" violates not-null constraint', code: "23502" }],
    [{ message: "Onbekende retailer: x", code: "P0002" }],
    [{ message: "permission denied for function keten_feed_pas_toe", code: "42501" }],
  ])("een echte fout wordt niet herhaald: %j", (fout) => {
    expect(isTijdelijk(fout)).toBe(false);
  });
});

describe("kortBericht", () => {
  it("vat een Cloudflare-pagina samen in één regel met de foutcode", () => {
    const kort = kortBericht(CLOUDFLARE_522);
    expect(kort).toMatch(/522/);
    expect(kort).toMatch(/Connection timed out/);
    expect(kort.length).toBeLessThan(120);
    expect(kort).not.toMatch(/<html|<body|cf-wrapper/);
  });

  it("laat een gewone foutmelding met rust, en kapt een lange af", () => {
    expect(kortBericht("duplicate key")).toBe("duplicate key");
    expect(kortBericht("x".repeat(500)).length).toBeLessThanOrEqual(240);
  });
});
