import { describe, it, expect } from "vitest";
import { beatBereik } from "../ScrollScene";

// LET OP: deze test bestaat om een productiestoring te voorkomen die CI niet zag.
//
// Beat bouwde zijn invoerbereik als [van - marge, van + marge, tot - marge,
// tot + marge]. StepsScene gebruikt de banden [0, 0.36], [0.32, 0.68] en
// [0.64, 1], dus de eerste band gaf -0.06 en de laatste 1.06. framer-motion
// geeft dat bereik door als keyframe-offsets aan de Web Animations API, en die
// eist offsets in [0,1]. Vanaf 12.3x gooit dat een TypeError en viel de hele
// landingspagina in de error boundary, maar alleen boven 1024x700, want onder
// die grens pint ScrollScene niet.
//
// De lockfile staat op framer-motion 12.29.2 en daar gebeurde het niet, dus
// `npm ci` in CI bleef groen terwijl Netlify met een nieuwere versie bouwde.

// De banden zoals StepsScene ze gebruikt, plus de randgevallen.
const BANDEN: Array<[number, number]> = [
  [0, 0.36],
  [0.32, 0.68],
  [0.64, 1],
  [0, 1],
  [0, 0.02],
  [0.98, 1],
  [0.4, 0.6],
];

describe("beatBereik", () => {
  it("blijft altijd binnen [0,1]", () => {
    for (const [van, tot] of BANDEN) {
      for (const p of beatBereik(van, tot)) {
        expect(p, `band [${van}, ${tot}] gaf ${p}`).toBeGreaterThanOrEqual(0);
        expect(p, `band [${van}, ${tot}] gaf ${p}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("is strikt stijgend, anders rekent useTransform verkeerd", () => {
    for (const [van, tot] of BANDEN) {
      const punten = beatBereik(van, tot);
      for (let i = 1; i < punten.length; i++) {
        expect(punten[i], `band [${van}, ${tot}]: ${punten.join(", ")}`).toBeGreaterThan(punten[i - 1]);
      }
    }
  });

  it("laat een band die ruimte heeft ongemoeid", () => {
    // [0.32, 0.68] heeft aan beide kanten 0.06 over, dus de marge past gewoon.
    const punten = beatBereik(0.32, 0.68);
    [0.26, 0.38, 0.62, 0.74].forEach((verwacht, i) => {
      expect(punten[i]).toBeCloseTo(verwacht, 6);
    });
  });

  it("knipt de marge af op de scene-randen", () => {
    expect(beatBereik(0, 0.36)[0]).toBe(0);
    expect(beatBereik(0.64, 1)[3]).toBe(1);
  });
});
