import { describe, expect, it } from "vitest";
import { labelVanAntwoord } from "../antwoordLabel";

describe("labelVanAntwoord", () => {
  it("vertaalt een opgeslagen waarde naar het label uit de quiz", () => {
    expect(labelVanAntwoord("gender", "female")).toBe("Dames");
    expect(labelVanAntwoord("contrast", "laag")).toBe("Tonal: alles in dezelfde tint");
    expect(labelVanAntwoord("occasions", "work")).toBe("Werk");
  });

  it("kent de stijlopties per geslacht", () => {
    expect(labelVanAntwoord("stylePreferences", "minimalist", "female")).toBe("Minimalistisch");
    expect(labelVanAntwoord("stylePreferences", "athletic", "male")).toBe("Sportief/Athletic");
  });

  it("laat een onbekende waarde staan", () => {
    expect(labelVanAntwoord("neutrals", "paars")).toBe("paars");
    expect(labelVanAntwoord("bestaatniet", "x")).toBe("x");
  });
});
