import { describe, expect, it } from "vitest";
import {
  calculateMatchPercentage,
  calculateMatchScore,
} from "@/engine/calculateMatchScore";
import type { Product, StylePreferences } from "@/engine/types";

const prefs: StylePreferences = {
  casual: 3,
  formal: 1,
  sporty: 0,
  vintage: 2,
  minimalist: 5,
};

function makeProduct(styleTags: string[]): Product {
  return {
    id: "p",
    name: "test",
    styleTags,
  };
}

describe("calculateMatchScore", () => {
  it("returns 0 when the product has no style tags", () => {
    expect(calculateMatchScore(makeProduct([]), prefs)).toBe(0);
  });

  it("sums matching style tag preferences (case-insensitive)", () => {
    const product = makeProduct(["Casual", "MINIMALIST"]);
    expect(calculateMatchScore(product, prefs)).toBe(3 + 5);
  });

  it("differs when preferences differ — not hardcoded", () => {
    const product = makeProduct(["casual", "formal"]);
    const weighted = calculateMatchScore(product, prefs);
    const flipped: StylePreferences = {
      ...prefs,
      casual: 10,
      formal: 0,
    };
    expect(calculateMatchScore(product, flipped)).toBeGreaterThan(weighted);
  });

  it("ignores tags that do not match any preference key", () => {
    expect(calculateMatchScore(makeProduct(["unknown-tag"]), prefs)).toBe(0);
  });
});

describe("calculateMatchPercentage", () => {
  it("maps a raw score to a 0-100 percentage", () => {
    expect(calculateMatchPercentage(5, 10)).toBe(50);
  });

  it("clamps the percentage to at most 100", () => {
    expect(calculateMatchPercentage(9999, 10)).toBe(100);
  });

  it("clamps the percentage to at least 0", () => {
    expect(calculateMatchPercentage(-5, 10)).toBe(0);
  });

  it("returns 0 when maxPossibleScore is 0 or negative", () => {
    expect(calculateMatchPercentage(7, 0)).toBe(0);
    expect(calculateMatchPercentage(7, -3)).toBe(0);
  });
});
