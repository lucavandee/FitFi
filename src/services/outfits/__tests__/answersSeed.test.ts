import { describe, expect, it } from "vitest";
import { seedFromAnswers } from "../answersSeed";

describe("seedFromAnswers", () => {
  it("geeft dezelfde seed voor dezelfde antwoorden in andere sleutelvolgorde", () => {
    const a = seedFromAnswers({ gender: "male", occasions: ["work"], budget: { min: 50, max: 150 } });
    const b = seedFromAnswers({ budget: { max: 150, min: 50 }, occasions: ["work"], gender: "male" });
    expect(a).toBe(b);
  });

  it("geeft een andere seed als een antwoord verandert", () => {
    const a = seedFromAnswers({ gender: "male", occasions: ["work"] });
    const b = seedFromAnswers({ gender: "male", occasions: ["casual"] });
    expect(a).not.toBe(b);
  });

  it("geeft een andere seed als de volgorde in een array verandert", () => {
    // Arrays houden hun eigen volgorde vast (dat betekent hier iets: eerste
    // en tweede keuze zijn niet hetzelfde antwoord), dus dit moet een andere
    // seed geven.
    const a = seedFromAnswers({ occasions: ["work", "casual"] });
    const b = seedFromAnswers({ occasions: ["casual", "work"] });
    expect(a).not.toBe(b);
  });

  it("is deterministisch: dezelfde antwoorden geven altijd dezelfde seed", () => {
    const answers = { gender: "female", occasions: ["diner", "werk"], budget: { min: 20, max: 300 } };
    expect(seedFromAnswers(answers)).toBe(seedFromAnswers(answers));
  });

  it("geeft een geldig getal voor lege antwoorden", () => {
    const seed = seedFromAnswers({});
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });

  it("valt terug op een leeg object bij null of undefined, en crasht niet", () => {
    const leeg = seedFromAnswers({});
    expect(seedFromAnswers(null as unknown as Record<string, any>)).toBe(leeg);
    expect(seedFromAnswers(undefined as unknown as Record<string, any>)).toBe(leeg);
  });

  it("gooit door als een antwoord NaN bevat, zoals een budgetgrens uit een mislukte parse", () => {
    expect(() =>
      seedFromAnswers({ gender: "male", budget: { min: 50, max: NaN } })
    ).toThrow();
  });

  it("gooit door bij een circulaire verwijzing in een whitelist-veld (budget.min)", () => {
    // budget.min zelf verwijst circulair naar budget: dat overleeft de
    // min/max-extractie in profielIdentiteit.ts (in tegenstelling tot een
    // cirkel op een andere sleutel van budget, die daar wordt weggefilterd).
    const budget: Record<string, any> = { max: 150 };
    budget.min = budget;
    expect(() => seedFromAnswers({ gender: "male", budget })).toThrow();
  });

  it("gooit NIET meer bij een circulaire verwijzing buiten de whitelist (fixronde 1, punt 1)", () => {
    // Vóór de whitelist hashte seedFromAnswers de hele antwoordenset, dus
    // een circulaire verwijzing overal in `answers` gooide door. Na de
    // whitelist wordt alleen gender/occasions/budget gelezen: een cirkel
    // ergens anders (hier: `self`, net als photoDataUrl) wordt nooit
    // aangeraakt en mag dus geen fout meer geven.
    const answers: Record<string, any> = { gender: "male", occasions: ["work"] };
    answers.self = answers;
    expect(() => seedFromAnswers(answers)).not.toThrow();
  });

  it("verandert niet als er een foto wordt toegevoegd of verwijderd (fixronde 1, punt 1)", () => {
    const zonderFoto = { gender: "male", occasions: ["work"], budget: { min: 50, max: 150 } };
    const metFoto = { ...zonderFoto, photoDataUrl: "data:image/png;base64," + "A".repeat(1000) };
    expect(seedFromAnswers(metFoto)).toBe(seedFromAnswers(zonderFoto));
  });
});
