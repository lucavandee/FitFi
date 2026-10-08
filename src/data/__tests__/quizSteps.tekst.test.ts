/**
 * De quiztekst heeft geen gedachtestreepjes. De huisregel geldt voor alle
 * copy, en de opname van stap 5 op de homepage mag er geen tonen. Stap 5 had
 * de optie "Tonal [streepje] alles in dezelfde tint", stap 3 een streepje
 * voor de zin over huidskleur.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("quiztekst", () => {
  it("bevat geen gedachtestreepje (U+2013 of U+2014)", () => {
    const bron = readFileSync(join(__dirname, "../quizSteps.ts"), "utf8");
    const treffers = bron
      .split("\n")
      .map((regel, i) => `${i + 1}: ${regel.trim()}`)
      .filter((regel) => /[\u2013\u2014]/.test(regel));
    expect(treffers).toEqual([]);
  });
});
