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
import KleurPiek, { DIM_BEREIK, DIMMING, LICHT_BAND, lapBereik, naamBereik, stalenUitPalet } from "../KleurPiek";

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
  const dim = (p: number) => transform(p, DIM_BEREIK, [0, DIMMING, DIMMING, 0], { clamp: true });
  const licht = (i: number, p: number) => transform(p, lapBereik(i, n), [0, 1, 1, 0], { clamp: true });
  const naam = (i: number, p: number) => transform(p, naamBereik(i, n), [0, 1, 1, 1], { clamp: true });

  it("elk bereik komt uit beatBereik, blijft binnen [0,1] en stijgt strikt", () => {
    expect(DIM_BEREIK).toEqual(beatBereik(LICHT_BAND.van, LICHT_BAND.tot));
    const bereiken = [DIM_BEREIK, ...LAPPEN.map((_, i) => lapBereik(i, n)), ...LAPPEN.map((_, i) => naamBereik(i, n))];
    for (const b of bereiken) {
      expect(b).toHaveLength(4);
      for (let i = 0; i < b.length; i++) {
        expect(b[i]).toBeGreaterThanOrEqual(0);
        expect(b[i]).toBeLessThanOrEqual(1);
        if (i > 0) expect(b[i]).toBeGreaterThan(b[i - 1]);
      }
    }
  });

  it("aan het begin en aan het eind geen dimming; de namen komen pas in de lichtgang en blijven", () => {
    expect(dim(0)).toBe(0);
    expect(dim(1)).toBe(0);
    for (let i = 0; i < n; i++) {
      expect(licht(i, 0)).toBe(0);
      expect(licht(i, 1)).toBe(0);
      expect(naam(i, 0)).toBe(0);
      expect(naam(i, 1)).toBe(1);
    }
  });

  it("midden in de band van lap i: tafel gedimd, alleen lap i licht op, namen tot en met i staan er", () => {
    for (let i = 0; i < n; i++) {
      const [, b, c] = lapBereik(i, n);
      const p = (b + c) / 2;
      expect(dim(p)).toBeCloseTo(DIMMING, 6);
      for (let j = 0; j < n; j++) {
        expect(licht(j, p), `lap ${j} bij p ${p}`).toBe(j === i ? 1 : 0);
        expect(naam(j, p), `naam ${j} bij p ${p}`).toBe(j <= i ? 1 : 0);
      }
    }
  });

  it("de lappen vloeien in elkaar over: nooit twee tegelijk vol aan, en binnen de reeks nooit een gat", () => {
    const begin = lapBereik(0, n)[1];
    const eind = lapBereik(n - 1, n)[2];
    for (let s = 0; s <= 400; s++) {
      const p = s / 400;
      const som = LAPPEN.reduce((t, _, i) => t + licht(i, p), 0);
      expect(som, `p ${p}`).toBeLessThanOrEqual(1 + 1e-9);
      if (p >= begin && p <= eind) expect(som, `p ${p}`).toBeGreaterThan(0.999);
    }
  });

  it("terug naar het begin scrollen geeft weer de onbewerkte tafel", () => {
    const p = (lapBereik(2, n)[1] + lapBereik(2, n)[2]) / 2;
    expect(dim(p)).toBeGreaterThan(0);
    expect(dim(0)).toBe(0);
    expect(LAPPEN.every((_, i) => naam(i, 0) === 0)).toBe(true);
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

/** Zonder window rendert de piek de vorm voor telefoon en tablet, met lichtgang. */
describe("kleurpiek: wat er in de DOM staat (K5)", () => {
  const html = renderToString(<KleurPiek />);
  const figuur = html.match(/<figure[\s\S]*?<\/figure>/)?.[0] ?? "";
  const zonderFiguur = html.replace(figuur, "");
  const namen = getColorPalette(PALETSLEUTEL)!.doColors.map((k) => k.name);

  it("een sectie #kleur met een H2", () => {
    expect(html).toContain('id="kleur"');
    expect(html.match(/<h2\b/g)).toHaveLength(1);
  });

  it("in de figuur: zes contouren als clipPath in eenheden van de figuur, en de zes namen", () => {
    expect(figuur.match(/<clipPath\b[^>]*clipPathUnits="objectBoundingBox"/g)).toHaveLength(namen.length);
    for (const naam of namen) expect(figuur).toContain(`>${naam}<`);
  });

  it("de lichtgang begint uit: dimming, lapuitsneden en namen op dekking 0", () => {
    // dimming plus zes uitsneden plus zes namen
    expect((figuur.match(/opacity:0/g) ?? []).length).toBeGreaterThanOrEqual(1 + 2 * namen.length);
  });

  it("de zes kleuren staan als zichtbare lijst buiten het beeld, in de volgorde van het rapport", () => {
    const lijst = zonderFiguur.match(/<ul aria-label="Draag deze kleuren"[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? "";
    const inLijst = [...lijst.matchAll(/<span class="text-base font-semibold[^"]*">([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(inLijst).toEqual(namen);
    expect(zonderFiguur).not.toContain('class="sr-only"');
  });

  it("niets focusbaars in de figuur, en het label is tekst in de figcaption", () => {
    expect(figuur).not.toMatch(/<(a|button|input|select|textarea)\b/);
    expect(figuur).not.toMatch(/tabindex="(?!-1)/);
    expect(figuur).toMatch(/<figcaption[^>]*>[\s\S]*Beeld gemaakt met AI\.[\s\S]*<\/figcaption>/);
  });

  it("de stof wordt nooit overgeschilderd: geen staalkleur als vlak in de figuur", () => {
    for (const k of getColorPalette(PALETSLEUTEL)!.doColors) {
      expect(figuur.toLowerCase()).not.toContain(`fill="${k.hex.toLowerCase()}"`);
      expect(figuur.toLowerCase()).not.toContain(k.hex.toLowerCase());
    }
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
    expect(html).not.toContain('class="sr-only"');
    for (const k of getColorPalette(PALETSLEUTEL)!.doColors) expect(html).toContain(`>${k.name}<`);
  });
});
