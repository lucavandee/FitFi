import { describe, expect, it } from "vitest";
import { stableStringify } from "../stableJson";

describe("stableStringify", () => {
  it("sorteert sleutels op elk niveau", () => {
    const a = stableStringify({ b: 1, a: { d: 2, c: 3 } });
    const b = stableStringify({ a: { c: 3, d: 2 }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it("laat de volgorde van arrays staan", () => {
    expect(stableStringify({ x: [3, 1, 2] })).toBe('{"x":[3,1,2]}');
  });

  it("slaat undefined-waarden over, net als JSON.stringify", () => {
    expect(stableStringify({ a: undefined, b: null })).toBe('{"b":null}');
  });

  it("sorteert ook de sleutels van objecten die in een array staan", () => {
    expect(
      stableStringify({
        x: [
          { b: 1, a: 2 },
          { d: 4, c: 3 },
        ],
      })
    ).toBe('{"x":[{"a":2,"b":1},{"c":3,"d":4}]}');
  });

  it("zet undefined in een array om naar null, net als JSON.stringify", () => {
    expect(stableStringify({ x: [1, undefined, 3] })).toBe('{"x":[1,null,3]}');
  });

  it("zet een Date om naar zijn ISO-string, niet stilletjes naar een leeg object", () => {
    const a = stableStringify({ when: new Date("2026-01-01T00:00:00.000Z") });
    const b = stableStringify({ when: new Date("2026-06-15T12:30:00.000Z") });
    expect(a).toBe('{"when":"2026-01-01T00:00:00.000Z"}');
    expect(a).not.toBe(b);
  });

  it("laat een functiewaarde vallen, net als JSON.stringify", () => {
    expect(stableStringify({ a: 1, fn: () => 1 })).toBe('{"a":1}');
  });

  it("gooit een expliciete fout bij NaN of Infinity in plaats van ze stil naar null om te zetten", () => {
    // JSON.stringify zet NaN/Infinity stilletjes om naar null. Dat zou twee
    // verschillende profielen (een met NaN, een met null) laten samenvallen
    // op dezelfde hash. Een expliciete fout is hier beter dan een stille
    // botsing.
    expect(() => stableStringify({ a: NaN })).toThrow();
    expect(() => stableStringify({ a: Infinity })).toThrow();
    expect(() => stableStringify({ a: -Infinity })).toThrow();
  });

  it("gooit een expliciete fout bij een circulaire verwijzing in plaats van een stack overflow", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    expect(() => stableStringify(obj)).toThrow();
  });

  it("staat een niet-circulaire gedeelde referentie wel toe", () => {
    // Hetzelfde object op twee plekken is geen cirkel: JSON.stringify kan dat
    // gewoon serialiseren (met duplicatie van de inhoud), dus dat mag niet
    // gooien.
    const gedeeld = { n: 1 };
    const obj = { a: gedeeld, b: gedeeld };
    expect(() => stableStringify(obj)).not.toThrow();
    expect(stableStringify(obj)).toBe('{"a":{"n":1},"b":{"n":1}}');
  });
});
