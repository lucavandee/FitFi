import { describe, expect, it } from "vitest";
import { readLlmTags } from "../scoring/llmTags";
import { scoreOccasion } from "../scoring/occasion";
import { scoreProductArchetype } from "../scoring/archetype";

const scored = (overrides: Record<string, any> = {}) => ({
  product: {
    id: "p1",
    name: "Effen broek",
    description: "",
    tags: [],
    styleTags: [],
    ...overrides,
  },
  category: "bottom",
  score: 0,
  breakdown: {} as any,
  reasons: [],
  formality: 0.3,
  archetypeFit: {},
  colorTags: [],
  materialTags: [],
  silhouetteTags: [],
}) as any;

describe("readLlmTags", () => {
  it("parses occ-tags, formality, fan-merch and archetypes", () => {
    const info = readLlmTags({
      tags: ["formality:3", "occ:work", "occ:sports", "fan-merch"],
      styleTags: ["formality:3", "occ:work", "occ:sports", "fan-merch", "SMART_CASUAL", "CLASSIC"],
    } as any);
    expect(info.hasOccasionTags).toBe(true);
    expect(info.occasions.has("work")).toBe(true);
    // feed-tag "occ:sports" maps to engine-key "sport"
    expect(info.occasions.has("sport" as any)).toBe(true);
    expect(info.formality01).toBeCloseTo(0.5); // (3-1)/4
    expect(info.fanMerch).toBe(true);
    expect(info.archetypes.has("SMART_CASUAL")).toBe(true);
  });

  it("returns neutral info for untagged products", () => {
    const info = readLlmTags({ tags: ["zwart", "casual"], styleTags: [] } as any);
    expect(info.hasOccasionTags).toBe(false);
    expect(info.formality01).toBeNull();
    expect(info.fanMerch).toBe(false);
  });
});

describe("scoreOccasion with llm tags", () => {
  it("boosts on an occ-tag hit and penalizes an explicit miss", () => {
    const baseline = scoreOccasion(scored(), "work").score;
    const hit = scoreOccasion(
      scored({ tags: ["occ:work", "formality:4"], styleTags: ["occ:work", "formality:4"] }),
      "work"
    ).score;
    const miss = scoreOccasion(
      scored({ tags: ["occ:sports"], styleTags: ["occ:sports"] }),
      "work"
    ).score;
    expect(hit).toBeGreaterThan(baseline);
    expect(miss).toBeLessThan(baseline);
  });

  it("keeps the original formula for untagged products", () => {
    const a = scoreOccasion(scored(), "casual");
    expect(a.score).toBeGreaterThan(0);
    expect(a.score).toBeLessThanOrEqual(1);
  });
});

describe("scoreProductArchetype with llm style tags", () => {
  it("boosts when styleTags carry the archetype key", () => {
    const without = scoreProductArchetype(scored(), "SMART_CASUAL").score;
    const withTag = scoreProductArchetype(
      scored({ styleTags: ["SMART_CASUAL"] }),
      "SMART_CASUAL"
    ).score;
    expect(withTag).toBeGreaterThan(without);
    expect(withTag).toBeLessThanOrEqual(1);
  });
});
