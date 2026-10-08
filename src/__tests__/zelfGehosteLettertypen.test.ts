/**
 * De lettertypen komen van de eigen site, niet van Google.
 *
 * Aanleiding (8 oktober 2026). Voordat een bezoeker iets over cookies had
 * gekozen, gingen er al verzoeken naar fonts.googleapis.com en
 * fonts.gstatic.com. Sinds PR A2 staan de woff2-bestanden in public/fonts/ en
 * de @font-face-regels in src/index.css.
 *
 * Wat hier vastligt:
 * - index.html laadt niets meer van Google Fonts;
 * - elk bestand waar index.css naar wijst bestaat, is echt woff2, en de hash in
 *   de naam hoort bij de inhoud (/fonts/*.woff2 staat in _headers op
 *   immutable: een nieuwe versie onder dezelfde naam zou een jaar blijven
 *   hangen);
 * - er staat geen los bestand in public/fonts/ waar niemand naar wijst;
 * - beide families zijn gedeclareerd zoals Google ze leverde, en de
 *   OFL-licentie staat ernaast.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");
const css = readFileSync(join(WORTEL, "src/index.css"), "utf-8");
const html = readFileSync(join(WORTEL, "index.html"), "utf-8");
const headers = readFileSync(join(WORTEL, "public/_headers"), "utf-8");

const verwezen = [...css.matchAll(/url\("(\/fonts\/[^"]+\.woff2)"\)/g)].map((m) => m[1]);

describe("zelf gehoste lettertypen", () => {
  it("index.html laadt niets van Google Fonts", () => {
    expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  });

  it("index.css wijst naar acht bestanden in /fonts/", () => {
    expect(verwezen).toHaveLength(8);
  });

  for (const pad of verwezen) {
    it(`${pad}: bestaat, is woff2 en de hash hoort bij de inhoud`, () => {
      const bestand = join(WORTEL, "public", pad);
      expect(existsSync(bestand)).toBe(true);
      const inhoud = readFileSync(bestand);
      expect(inhoud.subarray(0, 4).toString("latin1")).toBe("wOF2");
      const hash = pad.match(/\.([0-9a-f]{8})\.woff2$/)?.[1];
      expect(hash).toBeDefined();
      expect(createHash("sha256").update(inhoud).digest("hex").slice(0, 8)).toBe(hash);
    });
  }

  it("public/fonts/ bevat geen bestand waar index.css niet naar wijst", () => {
    const aanwezig = readdirSync(join(WORTEL, "public/fonts"))
      .filter((n) => n.endsWith(".woff2"))
      .map((n) => `/fonts/${n}`)
      .sort();
    expect(aanwezig).toEqual([...verwezen].sort());
  });

  it("beide families staan erin zoals Google ze leverde", () => {
    const blokken = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1]);
    const serif = blokken.filter((b) => b.includes('"Instrument Serif"'));
    const sans = blokken.filter((b) => b.includes('"Plus Jakarta Sans"'));
    expect(serif.filter((b) => /font-style:\s*italic/.test(b))).toHaveLength(2);
    expect(serif.filter((b) => /font-style:\s*normal/.test(b))).toHaveLength(2);
    expect(sans).toHaveLength(4);
    for (const b of sans) expect(b).toMatch(/font-weight:\s*400 700/);
    for (const b of blokken) expect(b).toMatch(/font-display:\s*swap/);
  });

  it("de OFL-licenties staan naast de bestanden", () => {
    for (const naam of ["OFL-instrument-serif.txt", "OFL-plus-jakarta-sans.txt"]) {
      const tekst = readFileSync(join(WORTEL, "public/fonts", naam), "utf-8");
      expect(tekst).toContain("SIL Open Font License, Version 1.1");
    }
  });

  it("_headers zet de woff2-bestanden op immutable", () => {
    expect(headers).toMatch(/\/fonts\/\*\.woff2\s*\n\s*Cache-Control: public, max-age=31536000, immutable/);
  });

  it("public/404.html wijst naar een lettertype dat bestaat", () => {
    const pagina = readFileSync(join(WORTEL, "public/404.html"), "utf-8");
    const paden = [...pagina.matchAll(/url\("(\/fonts\/[^"]+\.woff2)"\)/g)].map((m) => m[1]);
    expect(paden.length).toBeGreaterThan(0);
    for (const pad of paden) expect(verwezen).toContain(pad);
  });
});
