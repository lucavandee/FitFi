/**
 * Elke gevraagde gelegenheid krijgt een plek voordat een andere er een tweede
 * krijgt.
 *
 * Aanleiding (16 oktober 2026). Lucs quiz vroeg casual, werk, formeel en date.
 * Bij zes outfits koos de verdeelstap steeds de hoogste score, met hooguit
 * twee per gelegenheid: casual, werk en date kregen er elk twee en formeel
 * bleef leeg, terwijl er wel formele outfits gemaakt waren.
 */
import { describe, expect, it } from "vitest";
import { diversifyOutfits } from "../diversify";
import type { OutfitCandidate } from "../types";

let teller = 0;
function kandidaat(occasion: string, score: number): OutfitCandidate {
  const stuk = (category: string) => {
    teller += 1;
    return {
      product: { id: `p${teller}`, name: `stuk ${teller}` },
      category,
      archetypeFit: { [`a${teller}`]: 1 },
      colorTags: [`kleur${teller}`],
    };
  };
  return {
    occasion,
    compositionScore: score,
    products: [stuk("top"), stuk("bottom"), stuk("footwear")],
  } as unknown as OutfitCandidate;
}

describe("diversifyOutfits met meerdere gelegenheden", () => {
  it("geeft bij zes plekken en vier gelegenheden elke gelegenheid minstens een outfit", () => {
    const pool = [
      ...[0.9, 0.89, 0.88].map((s) => kandidaat("casual", s)),
      ...[0.87, 0.86, 0.85].map((s) => kandidaat("work", s)),
      ...[0.84, 0.83, 0.82].map((s) => kandidaat("date", s)),
      ...[0.5, 0.49].map((s) => kandidaat("formal", s)),
    ];
    const gekozen = diversifyOutfits(pool, { count: 6, occasionBalance: true });
    expect(gekozen).toHaveLength(6);
    expect(new Set(gekozen.map((c) => c.occasion))).toEqual(new Set(["casual", "work", "date", "formal"]));
  });

  it("geeft de gelegenheid met de minste keuze eerst een plek", () => {
    // De enige formele outfit deelt de jurk met de beste date-outfit. Kiest de
    // stap date eerst, dan blokkeert de hergebruikregel formeel.
    const date = kandidaat("date", 0.9);
    const formeel = kandidaat("formal", 0.6);
    (formeel.products as any)[0] = (date.products as any)[0];
    const pool = [date, kandidaat("date", 0.85), formeel];
    const gekozen = diversifyOutfits(pool, { count: 2, occasionBalance: true });
    expect(new Set(gekozen.map((c) => c.occasion))).toEqual(new Set(["date", "formal"]));
  });

  it("vult daarna op score en zet de beste outfit bovenaan", () => {
    const pool = [
      ...[0.9, 0.89].map((s) => kandidaat("casual", s)),
      ...[0.5].map((s) => kandidaat("work", s)),
    ];
    const gekozen = diversifyOutfits(pool, { count: 3, occasionBalance: true });
    expect(gekozen.map((c) => c.compositionScore)).toEqual([0.9, 0.89, 0.5]);
  });
});
