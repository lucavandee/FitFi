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

  it("gooit door bij een circulair antwoordobject", () => {
    const answers: Record<string, any> = { gender: "male" };
    answers.self = answers;
    expect(() => seedFromAnswers(answers)).toThrow();
  });
});
