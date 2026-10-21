/**
 * Bewaking van de stijl-agent (src/keten/stijl/stijlAgent.ts): de prompt kent
 * elke stijl die de quiz aanbiedt, volgt de schrijfregels, en het antwoord
 * wordt streng gelezen. Of de agent goed oordeelt, toetst de kalibratie
 * (npm run keten:stijl-keur), niet deze test.
 */
import { describe, expect, it } from "vitest";
import { getStyleOptionsForGender } from "@/data/quizSteps";
import { STIJL_SLEUTELS, bouwKeurOpdracht, bouwStijlAgentPrompt, leesKeurAntwoord } from "../stijlAgent";

describe("stijl-agent", () => {
  it("kent elke stijl die de quiz aanbiedt", () => {
    const quiz = new Set(
      ["female", "male", "non-binary", undefined].flatMap((g) => getStyleOptionsForGender(g).map((o: { value: string }) => o.value))
    );
    for (const stijl of quiz) expect(STIJL_SLEUTELS, stijl).toContain(stijl);
  });

  it("heeft geen gedachtestreepjes en noemt de twee groepen, het seizoen en de volgorde", () => {
    const p = bouwStijlAgentPrompt();
    expect(p).not.toMatch(/[\u2013\u2014]/);
    for (const kop of ["## Voor wie", "## Beoordeel in deze volgorde", "## Stijlen", "## Gelegenheden", "gedateerd", "## Antwoord"]) {
      expect(p).toContain(kop);
    }
    expect(p).toMatch(/Hip:/);
    expect(p).toMatch(/Gewoon goed gekleed:/);
  });

  it("zet profiel en stukken leesbaar in de opdracht", () => {
    const o = bouwKeurOpdracht([
      {
        id: "o1",
        profiel: { geslacht: "female", stijlen: ["streetwear"], gelegenheid: "date", lichtheid: "licht" },
        stukken: [{ categorie: "footwear", naam: "Pump BOSS", merk: "Boss", prijs: 105, kleuren: ["bordeaux"] }],
      },
    ]);
    expect(o).toContain("### o1");
    expect(o).toContain("vrouw | stijl: streetwear | gelegenheid: date of etentje | koos lichtheid: licht");
    expect(o).toContain("footwear | Pump BOSS | merk Boss | 105 euro | kleur bordeaux");
  });

  it("leest het antwoord ook met tekst eromheen en laat kapotte oordelen vallen", () => {
    const tekst = `Hier is het:\n{"oordelen":[{"id":"o1","oordeel":"fout","stijl":"nee","gelegenheid":"ja","kleur":"deels","samenhang":"nee","redenen":["de pumps"],"verbetering":"sneakers"},{"id":"o2","oordeel":"prima"}]}\nKlaar.`;
    const r = leesKeurAntwoord(tekst);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ id: "o1", oordeel: "fout", stijl: "nee", redenen: ["de pumps"] });
    expect(leesKeurAntwoord("geen json")).toEqual([]);
  });
});

import { STUK_SOORTEN, bouwLabelOpdracht, bouwLabelPrompt, leesLabelAntwoord } from "../stijlAgent";

describe("stijl-agent, labelen", () => {
  it("noemt de soorten per categorie en de stijlsleutels, zonder gedachtestreepjes", () => {
    const p = bouwLabelPrompt();
    expect(p).not.toMatch(/[\u2013\u2014]/);
    expect(p).toContain("## Je taak: producten labelen");
    expect(p).toContain(`- footwear: ${STUK_SOORTEN.footwear.join(", ")}`);
    expect(p).toContain("minimalist, classic, business, streetwear");
  });

  it("zet de producten per regel in de opdracht", () => {
    expect(bouwLabelOpdracht([{ id: "p1", categorie: "top", naam: "H & M - Hoodie - Zwart", geslacht: "male" }])).toContain(
      "- p1 | top | H & M - Hoodie - Zwart | male"
    );
  });

  it("laat een stuk buiten de lijst van zijn categorie en onbekende stijlen vallen", () => {
    const cat = (id: string) => ({ p1: "top", p2: "footwear", p3: "top" } as Record<string, string>)[id];
    const tekst = JSON.stringify({
      labels: [
        { id: "p1", stuk: "Hoodie", stijlen: ["streetwear", "casual", "punk"], spoor: "hip", formeel: 1 },
        { id: "p2", stuk: "hoodie", stijlen: ["casual"], spoor: "gewoon", formeel: 2 },
        { id: "p3", stuk: "trui", stijlen: ["punk"], spoor: "gewoon", formeel: 2 },
      ],
    });
    expect(leesLabelAntwoord(tekst, cat)).toEqual([{ id: "p1", stuk: "hoodie", stijlen: ["streetwear", "casual"], spoor: "hip", formeel: 1 }]);
  });

  it("leest seizoen en gedateerd als ze er zijn, en laat een onbekend seizoen weg", () => {
    const cat = () => "footwear";
    const tekst = JSON.stringify({
      labels: [
        { id: "a", stuk: "sneakers", stijlen: ["streetwear"], spoor: "hip", formeel: 1, seizoen: "heel-jaar", gedateerd: true },
        { id: "b", stuk: "sandalen", stijlen: ["casual"], spoor: "gewoon", formeel: 1, seizoen: "zomerig" },
      ],
    });
    const [a, b] = leesLabelAntwoord(tekst, cat);
    expect(a).toMatchObject({ seizoen: "heel-jaar", gedateerd: true });
    expect(b.seizoen).toBeUndefined();
    expect(b.gedateerd).toBeUndefined();
  });

  it("vraagt seizoen en gedateerd in de labelprompt", () => {
    const p = bouwLabelPrompt();
    expect(p).toContain("- seizoen:");
    expect(p).toContain("- gedateerd:");
  });
});
