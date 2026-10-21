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
    expect(p).not.toMatch(/[–—]/);
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
