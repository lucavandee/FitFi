/**
 * De kleurpiek (plan "Onder de hero", 4.2; K2, K5, K6 en K7).
 *
 * De piek toont wat het rapport van het voorbeeldprofiel onder "Draag deze
 * kleuren" zet. Verandert het palet of de volgorde, dan faalt dit, en dan moet
 * W2 (de stof op tafel) opnieuw gemeten worden: de paden in kleurpiek.ts horen
 * bij dat ene beeld.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { transform } from "framer-motion";
import { getColorPalette } from "@/data/colorPalettes";
import { beatBereik } from "@/components/landing/scroll/ScrollScene";
import { KLEURPIEK_VIEWBOX, LAPPEN, PALETSLEUTEL } from "@/content/kleurpiek";
import KleurPiek, {
  DIMMING,
  LICHT_BAND,
  UITLOOP,
  lapBereik,
  lapMasker,
  lapRechthoek,
  naamBereik,
  stalenUitPalet,
} from "../KleurPiek";

const BRON = readFileSync(fileURLToPath(new URL("../KleurPiek.tsx", import.meta.url)), "utf-8");

// CLAUDE.md deel 1: de kleuren van de interface.
const UI_PALET = new Set(
  ["#A85740", "#9A503B", "#F4E8E3", "#1A1A1A", "#4A4A4A", "#6E6E6E", "#E5E5E5", "#FAFAF8", "#FFFFFF", "#F5F0EB"].map((h) =>
    h.toLowerCase(),
  ),
);

function luminantie(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
const contrastMetWit = (hex: string) => 1.05 / (luminantie(hex) + 0.05);

describe("kleurpiek: de kleuren van het rapport (K7)", () => {
  const doColors = getColorPalette(PALETSLEUTEL)?.doColors ?? [];

  it("het palet is herfst, met de zes kleuren uit plan 4.2", () => {
    expect(PALETSLEUTEL).toBe("herfst");
    expect(doColors.map((k) => [k.name, k.hex])).toEqual([
      ["Camel", "#C19A6B"],
      ["Cognac", "#A0785A"],
      ["Olijfgroen", "#6E7A45"],
      ["Terracotta", "#C17767"],
      ["Ivory", "#FAF0E6"],
      ["Greige", "#C9B8A9"],
    ]);
  });

  it("de stalen zijn de doColors, in de volgorde van het rapport, elk op zijn eigen lap", () => {
    const stalen = stalenUitPalet();
    expect(stalen).not.toBeNull();
    expect(stalen!.map((s) => s.kleur)).toEqual(doColors);
    expect(stalen!.map((s) => s.lap.staal)).toEqual(doColors.map((k) => k.name));
    expect(LAPPEN.map((l) => l.staal)).toEqual(doColors.map((k) => k.name));
  });

  it("KleurPiek.tsx kent geen staalkleur: elke hex in het bestand is een kleur van de interface", () => {
    const hexen = (BRON.match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((h) => h.toLowerCase());
    for (const h of hexen) expect(UI_PALET.has(h), `${h} in KleurPiek.tsx`).toBe(true);
    for (const k of doColors) expect(BRON.toLowerCase()).not.toContain(k.hex.toLowerCase());
  });
});

describe("kleurpiek: de lichtgang (K2)", () => {
  const n = LAPPEN.length;
  /** Dekking van de donkere laag met het licht op lap i. */
  const laag = (i: number, p: number) => transform(p, lapBereik(i, n), [0, 1, 1, 0], { clamp: true });
  const naam = (i: number, p: number) => transform(p, naamBereik(i, n), [0, 1, 1, 1], { clamp: true });
  const lagen = (p: number) => LAPPEN.map((_, i) => laag(i, p));

  it("elk bereik komt uit beatBereik, blijft binnen [0,1] en stijgt strikt", () => {
    const breedte = (LICHT_BAND.tot - LICHT_BAND.van) / n;
    for (let i = 0; i < n; i++) {
      expect(lapBereik(i, n)).toEqual(beatBereik(LICHT_BAND.van + i * breedte, LICHT_BAND.van + (i + 1) * breedte));
      expect(naamBereik(i, n)).toEqual(beatBereik(LICHT_BAND.van + i * breedte, 1));
    }
    const bereiken = [...LAPPEN.map((_, i) => lapBereik(i, n)), ...LAPPEN.map((_, i) => naamBereik(i, n))];
    for (const b of bereiken) {
      expect(b).toHaveLength(4);
      for (let i = 0; i < b.length; i++) {
        expect(b[i]).toBeGreaterThanOrEqual(0);
        expect(b[i]).toBeLessThanOrEqual(1);
        if (i > 0) expect(b[i]).toBeGreaterThan(b[i - 1]);
      }
    }
  });

  it("de dimming blijft zacht: hoogstens een derde zwart, zodat het hout warm blijft", () => {
    expect(DIMMING).toBeGreaterThan(0);
    expect(DIMMING).toBeLessThanOrEqual(1 / 3);
  });

  it("aan het begin en aan het eind geen enkele laag; de namen komen pas in de lichtgang en blijven", () => {
    for (let i = 0; i < n; i++) {
      expect(laag(i, 0)).toBe(0);
      expect(laag(i, 1)).toBe(0);
      expect(naam(i, 0)).toBe(0);
      expect(naam(i, 1)).toBe(1);
    }
  });

  it("midden in de band van lap i: alleen de laag van lap i, namen tot en met i staan er", () => {
    for (let i = 0; i < n; i++) {
      const [, b, c] = lapBereik(i, n);
      const p = (b + c) / 2;
      for (let j = 0; j < n; j++) {
        expect(laag(j, p), `laag ${j} bij p ${p}`).toBe(j === i ? 1 : 0);
        expect(naam(j, p), `naam ${j} bij p ${p}`).toBe(j <= i ? 1 : 0);
      }
    }
  });

  it("de lagen vloeien in elkaar over: samen nooit meer dan een, en binnen de reeks nooit een gat", () => {
    const begin = lapBereik(0, n)[1];
    const eind = lapBereik(n - 1, n)[2];
    for (let s = 0; s <= 400; s++) {
      const p = s / 400;
      const som = lagen(p).reduce((t, d) => t + d, 0);
      expect(som, `p ${p}`).toBeLessThanOrEqual(1 + 1e-9);
      if (p >= begin && p <= eind) expect(som, `p ${p}`).toBeGreaterThan(0.999);
    }
  });

  it("terug naar het begin scrollen geeft weer de onbewerkte tafel", () => {
    const p = (lapBereik(2, n)[1] + lapBereik(2, n)[2]) / 2;
    expect(laag(2, p)).toBe(1);
    expect(lagen(0).every((d) => d === 0)).toBe(true);
    expect(LAPPEN.every((_, i) => naam(i, 0) === 0)).toBe(true);
  });
});

/**
 * Het licht: een donkere laag met een gat ter grootte van de rechthoek om de
 * lap, dat met een verloop over het hout uitloopt. De twee verlopen tellen op
 * (mask-composite add, de standaard): de laag is alleen helemaal weg waar
 * beide verlopen doorzichtig zijn, dus binnen de rechthoek.
 */
describe("kleurpiek: het licht op een lap", () => {
  /** Dekking van het masker van lap op (x, y) in fracties van de figuur, zoals de browser hem samenstelt. */
  function masker(lap: (typeof LAPPEN)[number], x: number, y: number): number {
    const r = lapRechthoek(lap);
    const helling = (t: number, van: number, tot: number, uit: number) =>
      t <= van - uit || t >= tot + uit ? 1 : t < van ? (van - t) / uit : t > tot ? (t - tot) / uit : 0;
    const h = helling(x, r.links, r.rechts, UITLOOP.x);
    const v = helling(y, r.boven, r.onder, UITLOOP.y);
    return h + v - h * v;
  }

  it.each(LAPPEN.map((l) => [l.staal, l] as const))("%s: de rechthoek ligt binnen de figuur, het verloop ook", (_n, lap) => {
    const r = lapRechthoek(lap);
    expect(r.links).toBeLessThan(r.rechts);
    expect(r.boven).toBeLessThan(r.onder);
    expect(r.links - UITLOOP.x).toBeGreaterThanOrEqual(0);
    expect(r.rechts + UITLOOP.x).toBeLessThanOrEqual(1);
    expect(r.boven - UITLOOP.y).toBeGreaterThanOrEqual(0);
    expect(r.onder + UITLOOP.y).toBeLessThanOrEqual(1);
  });

  it.each(LAPPEN.map((l) => [l.staal, l] as const))("%s: het masker is twee verlopen met oplopende stops op de rechthoek", (_n, lap) => {
    const r = lapRechthoek(lap);
    const m = lapMasker(lap);
    const verlopen = m.match(/linear-gradient\(to (right|bottom), ([^)]*)\)/g) ?? [];
    expect(verlopen).toHaveLength(2);
    for (const [richting, van, tot, uit] of [
      ["right", r.links, r.rechts, UITLOOP.x],
      ["bottom", r.boven, r.onder, UITLOOP.y],
    ] as const) {
      const verloop = verlopen.find((v) => v.includes(`to ${richting}`))!;
      const stops = [...verloop.matchAll(/(-?\d+(?:\.\d+)?)%/g)].map((x) => Number(x[1]) / 100);
      expect(stops).toHaveLength(4);
      expect(stops[0]).toBeCloseTo(van - uit, 3);
      expect(stops[1]).toBeCloseTo(van, 3);
      expect(stops[2]).toBeCloseTo(tot, 3);
      expect(stops[3]).toBeCloseTo(tot + uit, 3);
      expect(verloop).toMatch(/#000 [^,]+, transparent [^,]+, transparent [^,]+, #000 /);
    }
  });

  it("binnen de rechthoek vol licht, buiten de uitloop helemaal donker", () => {
    for (const lap of LAPPEN) {
      const r = lapRechthoek(lap);
      expect(masker(lap, (r.links + r.rechts) / 2, (r.boven + r.onder) / 2)).toBe(0);
      expect(masker(lap, r.links, r.boven)).toBe(0);
      expect(masker(lap, r.links - UITLOOP.x, (r.boven + r.onder) / 2)).toBe(1);
      expect(masker(lap, (r.links + r.rechts) / 2, r.onder + UITLOOP.y)).toBe(1);
    }
  });

  it("het licht van een lap valt nergens op een andere lap", () => {
    for (const lap of LAPPEN) {
      for (const ander of LAPPEN) {
        if (ander === lap) continue;
        const r = lapRechthoek(ander);
        for (let a = 0; a <= 20; a++) {
          for (let b = 0; b <= 20; b++) {
            const x = r.links + ((r.rechts - r.links) * a) / 20;
            const y = r.boven + ((r.onder - r.boven) * b) / 20;
            // 1 + v - v is in drijvende komma soms 0,9999999999999999.
            expect(1 - masker(lap, x, y), `licht van ${lap.staal} op ${ander.staal}`).toBeLessThan(1e-9);
          }
        }
      }
    }
  });
});

describe("kleurpiek: contouren en namen (K6, K8)", () => {
  it.each(LAPPEN.map((l) => [l.staal, l] as const))("%s: wit op het hout haalt 4,5:1 op 390, 560 en 597 breed", (_n, lap) => {
    for (const [breedte, hex] of Object.entries(lap.hout)) {
      expect(contrastMetWit(hex), `${lap.staal} op ${breedte}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(LAPPEN.map((l) => [l.staal, l] as const))("%s: pad van hoogstens 64 punten binnen de viewBox", (_n, lap) => {
    const getallen = (lap.pad.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    expect(getallen.length % 2).toBe(0);
    expect(getallen.length / 2).toBeLessThanOrEqual(64);
    for (let i = 0; i < getallen.length; i += 2) {
      expect(getallen[i]).toBeGreaterThanOrEqual(0);
      expect(getallen[i]).toBeLessThanOrEqual(KLEURPIEK_VIEWBOX.breedte);
      expect(getallen[i + 1]).toBeGreaterThanOrEqual(0);
      expect(getallen[i + 1]).toBeLessThanOrEqual(KLEURPIEK_VIEWBOX.hoogte);
    }
    expect(lap.naam.x).toBeGreaterThan(0);
    expect(lap.naam.x).toBeLessThan(KLEURPIEK_VIEWBOX.breedte);
    expect(lap.naam.y).toBeGreaterThan(0);
    expect(lap.naam.y).toBeLessThan(KLEURPIEK_VIEWBOX.hoogte);
  });
});

/** Zonder window rendert de piek de stille vorm: zo staat hij op telefoon en tablet. */
describe("kleurpiek: wat er in de DOM staat, stil (K5)", () => {
  const html = renderToString(<KleurPiek />);
  const figuur = html.match(/<figure[\s\S]*?<\/figure>/)?.[0] ?? "";
  const zonderFiguur = html.replace(figuur, "");
  const namen = getColorPalette(PALETSLEUTEL)!.doColors.map((k) => k.name);

  it("een sectie #kleur met een H2", () => {
    expect(html).toContain('id="kleur"');
    expect(html.match(/<h2\b/g)).toHaveLength(1);
  });

  it("in de figuur de zes namen op volle dekking, geen dimming en geen uitsnede", () => {
    for (const naam of namen) expect(figuur).toContain(`>${naam}<`);
    expect(figuur).not.toMatch(/opacity:0(?![.\d])/);
    expect(figuur).not.toContain("mask-image");
    expect(figuur).not.toContain("clipPath");
  });

  it("de zes kleuren direct onder het beeld als compact raster, in de volgorde van het rapport", () => {
    const lijst = zonderFiguur.match(/<ul role="list" aria-label="Draag deze kleuren"[^>]*>([\s\S]*?)<\/ul>/);
    expect(lijst).not.toBeNull();
    expect(lijst![0]).toMatch(/class="grid grid-cols-3/);
    const inLijst = [...lijst![1].matchAll(/<span class="text-sm font-semibold[^"]*">([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(inLijst).toEqual(namen);
    expect(zonderFiguur).not.toContain('class="sr-only"');
  });

  it("niets focusbaars in de figuur, en het label is tekst in de figcaption", () => {
    expect(figuur).not.toMatch(/<(a|button|input|select|textarea)\b/);
    expect(figuur).not.toMatch(/tabindex="(?!-1)/);
    expect(figuur).toMatch(/<figcaption[^>]*>[\s\S]*Beeld gemaakt met AI\.[\s\S]*<\/figcaption>/);
  });

  it("de stof wordt nooit overgeschilderd: geen staalkleur in de figuur", () => {
    for (const k of getColorPalette(PALETSLEUTEL)!.doColors) {
      expect(figuur.toLowerCase()).not.toContain(k.hex.toLowerCase());
    }
  });

  it("het anker landt direct onder de kop: de 16 px voor koppen gaat eraf", () => {
    expect(html).toMatch(/<section[^>]*id="kleur"[^>]*class="[^"]*-scroll-mt-4\b/);
  });
});

/** Vanaf 1024 x 600 zonder reduced motion: de sticky kolom met de lichtgang. */
describe("kleurpiek: wat er in de DOM staat, met lichtgang (K2, K5)", () => {
  afterEach(() => {
    vi.doUnmock("@/components/landing/beeld/useMediaquery");
    vi.resetModules();
  });

  async function renderVast() {
    vi.resetModules();
    vi.doMock("@/components/landing/beeld/useMediaquery", () => ({ useMediaquery: () => true }));
    const { default: Vast } = await import("../KleurPiek");
    return renderToString(<Vast />);
  }

  it("zes lagen met het masker van hun lap, op dekking 0 voor de gang begint", async () => {
    const html = await renderVast();
    const figuur = html.match(/<figure[\s\S]*?<\/figure>/)?.[0] ?? "";
    const lagen = [...figuur.matchAll(/<div[^>]*style="([^"]*-webkit-mask-image[^"]*)"/g)].map((m) => m[1]);
    expect(lagen).toHaveLength(LAPPEN.length);
    for (const [i, stijl] of lagen.entries()) {
      expect(stijl).toContain("opacity:0");
      expect(stijl).toContain(`rgba(26, 26, 26, ${DIMMING})`);
      expect(stijl).toContain(lapMasker(LAPPEN[i]).slice(0, 40));
    }
  });

  it("de namen op het hout en de strepen in de lijst beginnen op dekking 0", async () => {
    const html = await renderVast();
    const namen = getColorPalette(PALETSLEUTEL)!.doColors.map((k) => k.name);
    for (const naam of namen) expect(html).toMatch(new RegExp(`style="[^"]*opacity:0[^"]*">${naam}<`));
    expect(html.match(/<span class="absolute -left-4[^"]*"[^>]*style="opacity:0"/g)).toHaveLength(namen.length);
  });

  it("de sectie is lang genoeg voor de gang, en het beeld plakt onder de kop", async () => {
    const html = await renderVast();
    expect(html).toMatch(/<section[^>]*class="[^"]*min-h-\[280vh\]/);
    expect(html).toMatch(/<figure[^>]*class="[^"]*\bsticky\b/);
  });
});

describe("kleurpiek: terugval T-W2 zonder foto", () => {
  afterEach(() => {
    vi.doUnmock("@/content/beeld");
    vi.resetModules();
  });

  it("zes vlakken met hun naam, geen beeld en geen wipe", async () => {
    vi.resetModules();
    vi.doMock("@/content/beeld", async (origineel) => ({
      ...(await origineel<typeof import("@/content/beeld")>()),
      W2_FOTO_AAN: false,
    }));
    const { default: Terugval } = await import("../KleurPiek");
    const html = renderToString(<Terugval />);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("clip-path");
    expect(html).not.toContain("mask-image");
    expect(html).not.toContain('class="sr-only"');
    for (const k of getColorPalette(PALETSLEUTEL)!.doColors) expect(html).toContain(`>${k.name}<`);
  });
});
