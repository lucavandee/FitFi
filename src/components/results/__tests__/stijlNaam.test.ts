/**
 * De stijlnaam bovenaan /results en de Stijl DNA-tab volgen de keuze van de
 * bezoeker. Lucs quiz (16 oktober 2026): gekozen streetwear, bovenaan stond
 * "minimalistisch" (opgeslagen archetype uit de detector), en omdat dat woord
 * niet in de vertaaltabel stond, liet Stijl DNA smart casual zien.
 */
import { describe, expect, it } from "vitest";
import { archetypeKeyUitKeuze, stijlNaamUitKeuze } from "../stijlNaam";

describe("stijlNaamUitKeuze", () => {
  it("geeft de gekozen stijl in het Nederlands", () => {
    expect(stijlNaamUitKeuze(["streetwear"])).toBe("Streetwear");
    expect(stijlNaamUitKeuze(["athletic"])).toBe("Sportief");
    expect(stijlNaamUitKeuze(["minimalist", "classic"])).toBe("Minimalistisch en klassiek");
  });

  it("geeft null zonder keuze, zodat de pagina terugvalt", () => {
    expect(stijlNaamUitKeuze([])).toBeNull();
    expect(stijlNaamUitKeuze(undefined)).toBeNull();
  });
});

describe("archetypeKeyUitKeuze", () => {
  it("vertaalt een enkele keuze naar de sleutel van Stijl DNA", () => {
    expect(archetypeKeyUitKeuze(["streetwear"])).toBe("STREETWEAR");
    expect(archetypeKeyUitKeuze(["smart-casual"])).toBe("SMART_CASUAL");
  });

  it("neemt bij meer stijlen de eerste die een sleutel heeft, anders null", () => {
    expect(archetypeKeyUitKeuze(["romantic", "classic"])).toBe("CLASSIC");
    expect(archetypeKeyUitKeuze(["romantic"])).toBeNull();
  });
});
