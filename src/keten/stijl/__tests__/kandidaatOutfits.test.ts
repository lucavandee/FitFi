import { describe, expect, it } from "vitest";
import { antwoordenVoor, combinatieSleutel, kiesKandidaten, outfitSleutel } from "../kandidaatOutfits";
import type { Outfit } from "@/engine/types";

const outfit = (...ids: string[]): Outfit => ({ products: ids.map((id) => ({ id, name: id })) }) as unknown as Outfit;

describe("kandidaat-outfits per combinatie", () => {
  it("geeft een vaste sleutel en brede antwoorden", () => {
    const c = { geslacht: "female", stijl: "streetwear", gelegenheid: "casual" } as const;
    expect(combinatieSleutel(c)).toBe("female|streetwear|casual");
    expect(antwoordenVoor(c)).toEqual({
      gender: "female",
      stylePreferences: ["streetwear"],
      occasions: ["casual"],
      budget: { min: 0, max: 250 },
      fit: "regular",
    });
  });

  it("herkent dezelfde set in een andere volgorde", () => {
    expect(outfitSleutel(outfit("b", "a"))).toBe(outfitSleutel(outfit("a", "b")));
  });

  it("neemt om en om uit de runs, zonder dubbele of al gekeurde sets", () => {
    const runs = [
      [outfit("a", "b"), outfit("c", "d")],
      [outfit("b", "a"), outfit("e", "f")],
    ];
    const gekozen = kiesKandidaten(runs, { max: 10, alGekeurd: new Set([outfitSleutel(outfit("e", "f"))]) });
    expect(gekozen.map(outfitSleutel)).toEqual(["a|b", "c|d"]);
  });

  it("laat een product niet vaker voorkomen dan toegestaan", () => {
    const runs = [[outfit("jas", "a"), outfit("jas", "b"), outfit("jas", "c"), outfit("d", "e")]];
    const gekozen = kiesKandidaten(runs, { max: 10, maxPerProduct: 2 });
    expect(gekozen.map(outfitSleutel)).toEqual(["a|jas", "b|jas", "d|e"]);
  });

  it("stopt bij het maximum", () => {
    const runs = [[outfit("a"), outfit("b"), outfit("c")]];
    expect(kiesKandidaten(runs, { max: 2 })).toHaveLength(2);
  });
});
