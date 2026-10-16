/**
 * Hoeveel outfits een bezoeker krijgt, op één plek.
 *
 * Aanleiding (16 oktober 2026, keten-kritiek). /results en het dashboard
 * rekenden elk met een eigen kopie van dezelfde regel (6 zonder account of
 * gratis, 12 premium, 20 founder), terwijl de prijzenpagina "3" en
 * "onbeperkt" beloofde. Met één bron kan de belofte de code niet meer kwijt.
 */
import { describe, expect, it } from "vitest";
import { OUTFIT_LIMIET, outfitLimietVoor } from "../outfitLimiet";

describe("outfitLimietVoor", () => {
  it("geeft een bezoeker zonder account het gratis aantal", () => {
    expect(outfitLimietVoor(null)).toBe(OUTFIT_LIMIET.gratis);
    expect(outfitLimietVoor(undefined)).toBe(OUTFIT_LIMIET.gratis);
  });

  it("geeft een gratis account het gratis aantal", () => {
    expect(outfitLimietVoor({ tier: "free" })).toBe(OUTFIT_LIMIET.gratis);
  });

  it("geeft premium en plus het premium aantal", () => {
    expect(outfitLimietVoor({ tier: "premium" })).toBe(OUTFIT_LIMIET.premium);
    expect(outfitLimietVoor({ tier: "plus" })).toBe(OUTFIT_LIMIET.premium);
    expect(outfitLimietVoor({ isPremium: true })).toBe(OUTFIT_LIMIET.premium);
  });

  it("geeft founder het founder aantal", () => {
    expect(outfitLimietVoor({ tier: "founder" })).toBe(OUTFIT_LIMIET.founder);
  });

  it("houdt de aantallen die de pagina's al gaven", () => {
    expect(OUTFIT_LIMIET).toEqual({ gratis: 6, member: 9, premium: 12, founder: 20 });
    expect(outfitLimietVoor({})).toBe(9);
  });
});
