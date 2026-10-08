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
import KleurPiek, { WIPE_BEREIK, WIPE_INSET, stalenUitPalet } from "../KleurPiek";

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
      ["Olijfgroen", "#6B8E23"],
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

describe("kleurpiek: de wipe (K2)", () => {
  it("het bereik komt uit beatBereik(0.15, 0.90) en blijft binnen [0,1]", () => {
    expect(WIPE_BEREIK).toEqual(beatBereik(0.15, 0.9));
    [0.09, 0.21, 0.84, 0.96].forEach((v, i) => expect(WIPE_BEREIK[i]).toBeCloseTo(v, 6));
    for (let i = 0; i < WIPE_BEREIK.length; i++) {
      expect(WIPE_BEREIK[i]).toBeGreaterThanOrEqual(0);
      expect(WIPE_BEREIK[i]).toBeLessThanOrEqual(1);
      if (i > 0) expect(WIPE_BEREIK[i]).toBeGreaterThan(WIPE_BEREIK[i - 1]);
    }
  });

  it("op 21 standen: dicht tot b, open vanaf c, daartussen niet stijgend, en terug naar 0 is weer dicht", () => {
    const [, b, c] = WIPE_BEREIK;
    const inset = (p: number) => transform(p, WIPE_BEREIK, WIPE_INSET, { clamp: true });
    let vorige = Infinity;
    for (let i = 0; i <= 20; i++) {
      const p = i / 20;
      const x = inset(p);
      if (p <= b) expect(x, `p ${p}`).toBe(100);
      if (p >= c) expect(x, `p ${p}`).toBe(0);
      expect(x).toBeLessThanOrEqual(vorige);
      vorige = x;
    }
    expect(inset(0)).toBe(100);
  });
});

describe("kleurpiek: stalenlaag en namen (K6, K8)", () => {
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

/** Zonder window rendert de piek de vorm voor telefoon en tablet, met wipe. */
describe("kleurpiek: wat er in de DOM staat (K5)", () => {
  const html = renderToString(<KleurPiek />);
  const figuur = html.match(/<figure[\s\S]*?<\/figure>/)?.[0] ?? "";

  it("een sectie #kleur met een H2", () => {
    expect(html).toContain('id="kleur"');
    expect(html.match(/<h2\b/g)).toHaveLength(1);
  });

  it("de stalenlaag is aria-hidden en staat in de figuur, met de zes namen", () => {
    expect(figuur).toMatch(/aria-hidden="true"[^>]*>\s*<svg/);
    for (const k of getColorPalette(PALETSLEUTEL)!.doColors) expect(figuur).toContain(`>${k.name}<`);
  });

  it("de zes namen staan als lijst voor schermlezers in de tekstkolom", () => {
    const lijst = html.match(/<ul class="sr-only">([\s\S]*?)<\/ul>/)?.[1] ?? "";
    const namen = [...lijst.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => m[1]);
    expect(namen).toEqual(getColorPalette(PALETSLEUTEL)!.doColors.map((k) => k.name));
  });

  it("niets focusbaars in de figuur, en het label is tekst in de figcaption", () => {
    expect(figuur).not.toMatch(/<(a|button|input|select|textarea)\b/);
    expect(figuur).not.toMatch(/tabindex="(?!-1)/);
    expect(figuur).toMatch(/<figcaption[^>]*>[\s\S]*Beeld gemaakt met AI\.[\s\S]*<\/figcaption>/);
  });

  it("de wipe begint dicht: alleen clip-path, geen dekking of hoogte", () => {
    expect(figuur).toMatch(/clip-path:\s*inset\(0% 0% 100% 0%\)/);
    expect(figuur).not.toMatch(/opacity:\s*0/);
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
