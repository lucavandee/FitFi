/**
 * Zacht scrollen alleen voor wie niet om minder beweging vraagt.
 *
 * Aanleiding (fase 4, 9 oktober 2026). Onder 769 px zette mobile-touch.css
 * scroll-behavior op smooth, ook met prefers-reduced-motion: reduce. En
 * ScrollToTop gebruikte behavior "auto", dat die CSS volgt: een klik op een
 * footerlink gaf op 390 breed 35 tussenstanden naar boven, ook bij reduce.
 *
 * Wat hier vastligt:
 * - elke scroll-behavior: smooth in de stylesheets staat binnen een
 *   @media-blok met prefers-reduced-motion: no-preference;
 * - ScrollToTop springt met behavior "instant", zodat de CSS er niet toe doet.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..");

function cssBestanden(map: string): string[] {
  const uit: string[] = [];
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) uit.push(...cssBestanden(pad));
    else if (naam.endsWith(".css")) uit.push(pad);
  }
  return uit;
}

/**
 * Geeft per scroll-behavior: smooth de @media-voorwaarden eromheen. Een
 * eenvoudige lezer: commentaar eruit, dan accolades tellen en bij elke {
 * onthouden wat ervoor stond.
 */
function zachtMetVoorwaarden(css: string): string[][] {
  const tekst = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const stapel: string[] = [];
  const uit: string[][] = [];
  let begin = 0;
  for (let i = 0; i < tekst.length; i++) {
    const t = tekst[i];
    if (t === "{") {
      stapel.push(tekst.slice(begin, i).trim());
      begin = i + 1;
    } else if (t === "}") {
      stapel.pop();
      begin = i + 1;
    } else if (t === ";") {
      const regel = tekst.slice(begin, i);
      if (/scroll-behavior\s*:\s*smooth/.test(regel)) uit.push(stapel.filter((s) => s.startsWith("@media")));
      begin = i + 1;
    }
  }
  return uit;
}

describe("zacht scrollen", () => {
  const bestanden = [...cssBestanden(join(SRC, "styles")), join(SRC, "index.css")];

  it("de lezer vindt de regel in blog-reading.css, binnen no-preference", () => {
    const blog = zachtMetVoorwaarden(readFileSync(join(SRC, "styles/blog-reading.css"), "utf-8"));
    expect(blog.length).toBeGreaterThan(0);
  });

  for (const pad of bestanden) {
    it(`${pad.slice(SRC.length + 1)}: smooth alleen bij prefers-reduced-motion: no-preference`, () => {
      for (const voorwaarden of zachtMetVoorwaarden(readFileSync(pad, "utf-8"))) {
        expect(voorwaarden.some((v) => /prefers-reduced-motion\s*:\s*no-preference/.test(v))).toBe(true);
      }
    });
  }

  it("ScrollToTop springt instant, niet auto", () => {
    const bron = readFileSync(join(SRC, "components/ScrollToTop.tsx"), "utf-8");
    expect(bron).toMatch(/behavior:\s*"instant"/);
    expect(bron).not.toMatch(/behavior:\s*"(auto|smooth)"/);
  });
});
