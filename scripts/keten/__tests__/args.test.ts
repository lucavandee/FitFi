import { describe, expect, it } from "vitest";
import { heeftVlag, leesVlag, onbekendeVlaggen } from "../args";
import { STANDAARD_RETAILER } from "../retailers";

describe("leesVlag", () => {
  it("geeft de waarde na de vlag", () => {
    expect(leesVlag(["--retailer", "H&M (NL)", "--limit", "5"], "retailer")).toBe("H&M (NL)");
    expect(leesVlag(["--retailer", "H&M (NL)", "--limit", "5"], "limit")).toBe("5");
  });

  it("geeft undefined als de vlag ontbreekt en een lege string als hij geen waarde heeft", () => {
    expect(leesVlag(["--ja"], "retailer")).toBeUndefined();
    expect(leesVlag(["--retailer", "--ja"], "retailer")).toBe("");
  });
});

describe("leesVlag met is-teken", () => {
  it("leest ook --naam=waarde", () => {
    expect(leesVlag(["--max-aanroepen=5"], "max-aanroepen")).toBe("5");
    expect(leesVlag(["--tot=01:00", "--ja"], "tot")).toBe("01:00");
    expect(leesVlag(["--model=claude-x"], "model")).toBe("claude-x");
  });
});

describe("onbekendeVlaggen", () => {
  it("noemt elke vlag die het script niet kent, ook een typfout", () => {
    expect(onbekendeVlaggen(["--max-aanroep", "5", "--ja", "--tot=01:00"], ["max-aanroepen", "ja", "tot"])).toEqual(["--max-aanroep"]);
    expect(onbekendeVlaggen(["--pool", "a.json", "--ja"], ["pool", "ja"])).toEqual([]);
  });
});

describe("heeftVlag", () => {
  it("herkent een losse vlag", () => {
    expect(heeftVlag(["--met-foto", "--ja"], "met-foto")).toBe(true);
    expect(heeftVlag(["--ja"], "met-foto")).toBe(false);
  });
});

describe("STANDAARD_RETAILER", () => {
  it("is een niet-lege naam zonder witruimte aan de randen", () => {
    expect(STANDAARD_RETAILER.length).toBeGreaterThan(0);
    expect(STANDAARD_RETAILER).toBe(STANDAARD_RETAILER.trim());
  });
});
