import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
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

const inPublic = (pad: string) =>
  fileURLToPath(new URL(`../../../../public${pad}`, import.meta.url));

/** Duur in seconden uit de mvhd-box onder moov (mvhd versie 0 en 1). */
function mp4Duur(data: Buffer): number {
  for (let i = 0; i + 8 <= data.length; ) {
    const grootte = data.readUInt32BE(i);
    if (grootte < 8) break;
    if (data.toString("latin1", i + 4, i + 8) === "moov") {
      for (let j = i + 8; j + 8 <= i + grootte; ) {
        const kind = data.readUInt32BE(j);
        if (kind < 8) break;
        if (data.toString("latin1", j + 4, j + 8) === "mvhd") {
          if (data.readUInt8(j + 8) === 1) {
            return Number(data.readBigUInt64BE(j + 32)) / data.readUInt32BE(j + 28);
          }
          return data.readUInt32BE(j + 24) / data.readUInt32BE(j + 20);
        }
        j += kind;
      }
    }
    i += grootte;
  }
  throw new Error("geen mvhd-box gevonden");
}

// De bestandsnamen dragen de eerste acht tekens van de sha256 van de inhoud en
// staan met een immutable-cache in public/_headers. Verandert een clip zonder
// nieuwe naam, dan blijven bezoekers een jaar de oude zien; ontbreekt een
// bestand, dan valt de clip stil weg. En langer dan vijf seconden bewegend beeld
// vraagt een pauzeknop (WCAG 2.2.2), die de hero niet heeft.
describe("HERO_CLIP-bestanden", () => {
  for (const [naam, pad] of [
    ["mobiel", HERO_CLIP.mobiel],
    ["desktop", HERO_CLIP.desktop],
  ] as const) {
    it(`${naam}: bestaat in public/ en blijft onder het budget`, () => {
      expect(existsSync(inPublic(pad))).toBe(true);
      const plafond = naam === "mobiel" ? 1.5 * 1024 * 1024 : 2.5 * 1024 * 1024;
      expect(statSync(inPublic(pad)).size).toBeLessThan(plafond);
    });

    it(`${naam}: de hash in de naam hoort bij de inhoud`, () => {
      const hash = pad.match(/^\/video\/hero-(?:mobiel|desktop)\.([0-9a-f]{8})\.mp4$/)?.[1];
      expect(hash).toBeDefined();
      const sha256 = createHash("sha256").update(readFileSync(inPublic(pad))).digest("hex");
      expect(sha256.slice(0, 8)).toBe(hash);
    });

    it(`${naam}: duurt hoogstens vijf seconden`, () => {
      expect(mp4Duur(readFileSync(inPublic(pad)))).toBeLessThanOrEqual(5);
    });

    // Higgsfield-voorwaarde 5.5: herkomstsignalen niet weghalen. Een hercodering
    // zonder -metadata AIGC=... laat de tag stil vallen.
    it(`${naam}: draagt de AIGC-herkomstmarkering van de bron`, () => {
      const inhoud = readFileSync(inPublic(pad)).toString("latin1");
      expect(inhoud).toContain("AIGC");
      expect(inhoud).toMatch(/"Label":"1","ContentProducer":"kling","ProduceID":"KLingMuse_[0-9a-f-]{36}"/);
    });
  }
});
