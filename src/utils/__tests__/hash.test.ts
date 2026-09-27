import { describe, expect, it } from "vitest";
import { fnv1a32, hashString, sha256Hex } from "../hash";

describe("sha256Hex", () => {
  it("geeft de bekende testvectoren", async () => {
    expect(await sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});

describe("fnv1a32", () => {
  it("geeft de bekende testvectoren", () => {
    expect(fnv1a32("")).toBe(0x811c9dc5);
    expect(fnv1a32("a")).toBe(0xe40c292c);
  });

  it("is een 32-bits getal zonder teken", () => {
    const h = fnv1a32("FitFi");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("fnv1a32 versus hashString", () => {
  // image.ts leunt op hashString. Plan 3 leunt op fnv1a32 (via
  // answersSeed.ts). Beide moeten voor dezelfde input hetzelfde getal geven,
  // anders krijgen dezelfde quiz-antwoorden een andere seed in verschillende
  // delen van de keten. Deze test faalt zodra dat niet meer zo is.
  const inputs = [
    "",
    "a",
    "FitFi",
    "avatar:1234",
    "outfit:99",
    "een iets langere string met spaties en 123 cijfers",
    "emoji en unicode: café ☕ 日本語",
  ];

  it.each(inputs)("geeft hetzelfde getal als hashString voor %s", (input) => {
    expect(fnv1a32(input)).toBe(hashString(input));
  });
});
