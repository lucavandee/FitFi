/**
 * Binnen het gekozen bereik geeft de prijs geen voorkeur.
 *
 * Aanleiding (keten-kritiek, 16 oktober 2026). De score legde de topscore
 * rond (max + 30% van max) / 2: bij een schuif tot 500 euro was dat 325 euro
 * per stuk. Wie de schuif open liet, kreeg zo de dure kant van de catalogus.
 * Een bovengrens zegt "niet duurder dan", geen "graag rond dit bedrag".
 */
import { describe, expect, it } from "vitest";
import { scoreBudget } from "../budget";
import type { ScoredProduct, UserStyleProfile } from "../../types";

const profiel = (min: number, max: number) => ({ budget: { perItemMin: min, perItemMax: max } }) as unknown as UserStyleProfile;
const stuk = (price: number) => ({ product: { price } }) as unknown as ScoredProduct;

describe("scoreBudget", () => {
  it("geeft elk stuk binnen het bereik dezelfde score", () => {
    const p = profiel(0, 500);
    const scores = [19.99, 59.95, 179, 325, 499].map((prijs) => scoreBudget(stuk(prijs), p).score);
    expect(new Set(scores).size).toBe(1);
  });

  it("straft nog steeds boven het budget, oplopend", () => {
    const p = profiel(0, 100);
    const binnen = scoreBudget(stuk(80), p).score;
    const netBoven = scoreBudget(stuk(105), p).score;
    const ver = scoreBudget(stuk(200), p).score;
    expect(netBoven).toBeLessThan(binnen);
    expect(ver).toBeLessThan(netBoven);
  });

  it("straft onder een gekozen minimum", () => {
    const p = profiel(50, 150);
    expect(scoreBudget(stuk(20), p).score).toBeLessThan(scoreBudget(stuk(80), p).score);
  });
});
