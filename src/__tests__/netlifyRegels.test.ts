/**
 * Netlify-regels voor eigen beeld, video en lettertypen (plan fase 2, 5.2 en G18).
 *
 * public/_redirects had alleen de regel die elk pad naar de app stuurt. Een
 * ontbrekend /beeld/x.avif kreeg zo index.html terug, met status 200, en de
 * service worker of de browser bewaarde dat als beeld. Nu geeft een ontbrekend
 * bestand onder /beeld/, /video/ en /fonts/ een 404 met public/404.html.
 *
 * Dit toetst de bestanden. Of Netlify ze zo uitvoert (status, content-type,
 * Cache-Control) is G18 en meet je met curl op een deploy.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");
const regels = readFileSync(join(WORTEL, "public/_redirects"), "utf-8")
  .split("\n")
  .map((r) => r.trim())
  .filter((r) => r && !r.startsWith("#"))
  .map((r) => r.split(/\s+/));
const headers = readFileSync(join(WORTEL, "public/_headers"), "utf-8");

describe("public/_redirects", () => {
  const catchAll = regels.findIndex(([van]) => van === "/*");

  it("houdt de regel die elk pad naar de app stuurt, als laatste", () => {
    expect(catchAll).toBe(regels.length - 1);
    expect(regels[catchAll]).toEqual(["/*", "/index.html", "200"]);
  });

  for (const map of ["/beeld/*", "/video/*", "/fonts/*"]) {
    it(`${map} geeft een 404 met 404.html, voor de regel naar de app`, () => {
      const i = regels.findIndex(([van]) => van === map);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(catchAll);
      expect(regels[i]).toEqual([map, "/404.html", "404"]);
    });
  }
});

describe("public/_headers", () => {
  it("/beeld/* staat een jaar op immutable", () => {
    expect(headers).toMatch(/^\/beeld\/\*\s*\n\s*Cache-Control: public, max-age=31536000, immutable/m);
  });

  it("er valt geen tweede Cache-Control-regel op /beeld/", () => {
    const paden = [...headers.matchAll(/^(\/\S*)\s*\n\s*Cache-Control:/gm)].map((m) => m[1]);
    const raken = paden.filter((p) => p === "/beeld/*" || p === "/*" || p.startsWith("/beeld"));
    expect(raken).toEqual(["/beeld/*"]);
  });
});

describe("public/404.html", () => {
  const pad = join(WORTEL, "public/404.html");

  it("bestaat, is Nederlands en laadt niets van buiten", () => {
    expect(existsSync(pad)).toBe(true);
    const html = readFileSync(pad, "utf-8");
    expect(html).toContain('<html lang="nl">');
    expect(html).toContain("Pagina niet gevonden");
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).not.toMatch(/(src|href)="https?:\/\//);
    expect(html).not.toMatch(/url\(["']?https?:/);
  });
});
