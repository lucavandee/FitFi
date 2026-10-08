import { describe, it, expect } from "vitest";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HERO_CLIP, magHeroClip } from "../heroClipRegels";

describe("magHeroClip", () => {
  it("laadt bij een gewone verbinding", () => {
    expect(magHeroClip({ reducedMotion: false, effectiveType: "4g" })).toBe(true);
  });

  it("laadt als de netwerkinformatie ontbreekt (Safari, Firefox)", () => {
    expect(magHeroClip({ reducedMotion: false })).toBe(true);
  });

  it("laadt niet bij reduced motion", () => {
    expect(magHeroClip({ reducedMotion: true, effectiveType: "4g" })).toBe(false);
  });

  it("laadt niet bij Save-Data", () => {
    expect(magHeroClip({ reducedMotion: false, saveData: true, effectiveType: "4g" })).toBe(false);
  });

  it("laadt niet op 2G en slow-2g", () => {
    expect(magHeroClip({ reducedMotion: false, effectiveType: "2g" })).toBe(false);
    expect(magHeroClip({ reducedMotion: false, effectiveType: "slow-2g" })).toBe(false);
  });

  it("laadt wel op 3G", () => {
    expect(magHeroClip({ reducedMotion: false, effectiveType: "3g" })).toBe(true);
  });
});

// De bestandsnamen bevatten een hash en staan met een immutable-cache in
// public/_headers. Verandert een clip zonder nieuwe naam, dan blijven bezoekers
// een jaar de oude zien; ontbreekt een bestand, dan valt de clip stil weg.
describe("HERO_CLIP-bestanden", () => {
  for (const [naam, pad] of [
    ["mobiel", HERO_CLIP.mobiel],
    ["desktop", HERO_CLIP.desktop],
  ] as const) {
    it(`${naam}: bestaat in public/ en blijft onder het budget`, () => {
      const bestand = fileURLToPath(new URL(`../../../../public${pad}`, import.meta.url));
      expect(existsSync(bestand)).toBe(true);
      const plafond = naam === "mobiel" ? 1.5 * 1024 * 1024 : 2.5 * 1024 * 1024;
      expect(statSync(bestand).size).toBeLessThan(plafond);
    });

    it(`${naam}: naam bevat een hash van acht tekens`, () => {
      expect(pad).toMatch(/^\/video\/hero-(mobiel|desktop)\.[0-9a-f]{8}\.mp4$/);
    });
  }
});
