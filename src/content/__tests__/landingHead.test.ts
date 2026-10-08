/**
 * De kop van de homepage staat op twee plekken die elkaar niet kunnen
 * importeren: landingHead.ts (voor App.tsx, LandingPage.tsx en de pagina's met
 * hetzelfde deelbeeld) en index.html (voor scrapers zonder JavaScript). Deze
 * test houdt ze gelijk en toetst het deelbeeld zelf: bestaat het, klopt de
 * hash in de naam, is het 1200 bij 630 en blijft het onder 200 KB.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LANDING_BESCHRIJVING, LANDING_TITEL, OG_BEELD } from "../landingHead";

const WORTEL = join(__dirname, "../../..");
const HTML = readFileSync(join(WORTEL, "index.html"), "utf8");

function meta(attribuut: "property" | "name", sleutel: string): string | undefined {
  const m = HTML.match(new RegExp(`<meta\\s+${attribuut}="${sleutel}"\\s+content="([^"]*)"`));
  return m?.[1];
}

/** Breedte en hoogte uit de SOF-marker van een JPEG. */
function jpegMaat(data: Buffer): { breedte: number; hoogte: number } | null {
  let i = 2;
  while (i + 9 < data.length) {
    if (data[i] !== 0xff) return null;
    const marker = data[i + 1];
    const lengte = data.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { hoogte: data.readUInt16BE(i + 5), breedte: data.readUInt16BE(i + 7) };
    }
    i += 2 + lengte;
  }
  return null;
}

describe("kop van de homepage", () => {
  it("index.html heeft dezelfde titel en beschrijving", () => {
    expect(HTML).toContain(`<title>${LANDING_TITEL}</title>`);
    expect(meta("property", "og:title")).toBe(LANDING_TITEL);
    expect(meta("name", "twitter:title")).toBe(LANDING_TITEL);
    expect(meta("name", "description")).toBe(LANDING_BESCHRIJVING);
    expect(meta("property", "og:description")).toBe(LANDING_BESCHRIJVING);
    expect(meta("name", "twitter:description")).toBe(LANDING_BESCHRIJVING);
  });

  it("index.html wijst naar hetzelfde deelbeeld", () => {
    expect(meta("property", "og:image")).toBe(OG_BEELD);
    expect(meta("name", "twitter:image")).toBe(OG_BEELD);
  });

  it("titel en beschrijving hebben geen gedachtestreepje", () => {
    expect(LANDING_TITEL + LANDING_BESCHRIJVING).not.toMatch(/[\u2013\u2014]/);
  });

  it("het deelbeeld bestaat, de hash klopt, 1200 bij 630, hoogstens 200 KB", () => {
    const { protocol, pathname } = new URL(OG_BEELD);
    expect(protocol).toBe("https:");
    const pad = join(WORTEL, "public", pathname);
    expect(existsSync(pad)).toBe(true);

    const data = readFileSync(pad);
    const hash = createHash("sha256").update(data).digest("hex");
    expect(pathname).toContain(`.${hash.slice(0, 8)}.`);
    expect(data.length).toBeLessThanOrEqual(200 * 1024);
    expect(jpegMaat(data)).toEqual({ breedte: 1200, hoogte: 630 });
  });

  it("geen pagina wijst nog met een relatief pad naar een deelbeeld", () => {
    // Relatieve og-paden lossen niet alle scrapers op, en de beelden die er
    // stonden waren gegenereerde mensen zonder label in het beeld.
    const map = join(WORTEL, "src/pages");
    const relatief = /ogImage="\/|property="og:image"\s+content="\//;
    const treffers = readdirSync(map)
      .filter((naam) => naam.endsWith(".tsx"))
      .filter((naam) => relatief.test(readFileSync(join(map, naam), "utf8")));
    expect(treffers).toEqual([]);
  });
});
