import { describe, it, expect } from "vitest";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// LET OP: deze test bestaat omdat de checker ooit het tegenovergestelde deed van
// wat CLAUDE.md voorschrijft. De vorige versie rekende bg-[#A85740], shadow-md,
// rounded-2xl en py-16 als overtreding, precies de klassen die het design system
// verplicht stelt. Daardoor scoorde de repo altijd 0% en was de poort betekenisloos.
//
// De fixture conform.tsx bestaat uitsluitend uit componentspecs die letterlijk in
// CLAUDE.md deel 2 en deel 13 staan. Slaat de checker daarop aan, dan spreekt hij
// het design system tegen en is hij fout, niet de code.

const hier = dirname(fileURLToPath(import.meta.url));
const script = join(hier, "..", "check-design-compliance.mjs");
const fixtures = join(hier, "..", "..", "src", "__fixtures__", "design-check");

type Rapport = {
  scannedFiles: number;
  hardTotaal: number;
  violations: Record<string, Array<{ file: string; line: number; match: string }>>;
};

// Een run per fixture, gedeeld door alle tests. Elke test opnieuw een node-proces
// starten is niet alleen traag, het loopt op een drukke machine tegen EAGAIN aan
// en dan faalt de test om een reden die niets met de checker te maken heeft.
const cache = new Map<string, Rapport>();

function draai(naam: string): Rapport {
  const bestaand = cache.get(naam);
  if (bestaand) return bestaand;
  const uit = execFileSync("node", [script, `--dir=${join(fixtures, naam)}`, "--json"], {
    encoding: "utf-8",
  });
  const rapport = JSON.parse(uit) as Rapport;
  cache.set(naam, rapport);
  return rapport;
}

describe("design-system checker", () => {
  it("keurt code die CLAUDE.md letterlijk volgt volledig goed", () => {
    const r = draai("conform");
    expect(r.scannedFiles).toBe(1);
    const alle = Object.values(r.violations).flat();
    expect(alle, `onterecht gevlagd: ${alle.map((v) => `${v.line}:${v.match}`).join(", ")}`).toEqual([]);
  });

  it("vindt elke categorie afwijking", () => {
    const r = draai("afwijkend");
    expect(r.violations.kleurBuitenPalet.map((v) => v.match)).toContain("#FF00FF");
    expect(r.violations.kleurBuitenPalet.map((v) => v.match)).toContain("#123456");
    expect(r.violations.verbodenRadius.map((v) => v.match)).toContain("rounded-lg");
    expect(r.violations.verbodenSchaduw.map((v) => v.match)).toContain("shadow-2xl");
    expect(r.violations.arbitraireSpacing.map((v) => v.match)).toContain("p-[13px]");
    expect(r.violations.arbitraireFontSize.map((v) => v.match)).toContain("text-[17px]");
    expect(r.violations.ctaVariant.map((v) => v.match)).toContain("Start gratis");
  });

  it("leest rounded-lg als maat lg, niet als zijkant l", () => {
    const r = draai("afwijkend");
    // De eerste parser splitste rounded-lg in zijkant `l` plus rest `g` en
    // rapporteerde de niet-bestaande klasse `rounded-g`.
    const matches = r.violations.verbodenRadius.map((v) => v.match);
    expect(matches).not.toContain("rounded-g");
  });

  it("laat de poort dichtvallen op harde overtredingen en niet op zachte", () => {
    const conform = draai("conform");
    expect(conform.hardTotaal).toBe(0);

    const afwijkend = draai("afwijkend");
    expect(afwijkend.hardTotaal).toBeGreaterThan(0);

    // zachte categorieen tellen niet mee voor de poort
    const zacht = afwijkend.violations.arbitraireSpacing.length + afwijkend.violations.arbitraireFontSize.length;
    expect(zacht).toBeGreaterThan(0);
    expect(afwijkend.hardTotaal).toBe(
      Object.entries(afwijkend.violations)
        .filter(([k]) => !["arbitraireSpacing", "arbitraireFontSize"].includes(k))
        .reduce((n, [, v]) => n + v.length, 0),
    );
  });
});
