/**
 * Kandidaten per stijl naast de gewone kandidaten (keten-kritiek, pakket 3).
 * get_kandidaten kent geen stijl; get_stijl_kandidaten leest de stijllabels
 * van de stijl-agent. De site vraagt beide en voegt ze samen, stijl eerst.
 */
import { describe, expect, it } from "vitest";
import { bereidKandidatenVoor, naarStijlParams, voegKandidatenSamen, type KandidaatRij } from "../kandidaten";

const rij = (id: string, category: string, extra: Record<string, unknown> = {}): KandidaatRij =>
  ({
    product_id: id,
    category,
    score: 1,
    attrs: { category, ...extra },
    product: { id, name: `${category} ${id}`, brand: "H&M", price: 30, image_url: "x", category, gender: "female", colors: ["wit"], retailer: "H&M (NL)" },
  }) as unknown as KandidaatRij;

describe("naarStijlParams", () => {
  it("stuurt de gekozen stijlen, geslacht en budget mee", () => {
    const p = naarStijlParams({ gender: "female", stylePreferences: ["streetwear"], budget: { min: 0, max: 500 } });
    expect(p).toMatchObject({ p_gender: "female", p_stijlen: ["streetwear"], p_budget_min: 0, p_budget_max: 500 });
    expect(typeof p?.p_zaad).toBe("number");
  });

  it("vraagt niets zonder gekozen stijl", () => {
    expect(naarStijlParams({ gender: "female" })).toBeNull();
    expect(naarStijlParams({ gender: "female", stylePreferences: [] })).toBeNull();
  });
});

describe("voegKandidatenSamen", () => {
  it("zet de stijlkandidaten eerst en laat dubbele weg", () => {
    const uit = voegKandidatenSamen([rij("a", "top", { stijlen: ["streetwear"] })], [rij("a", "top"), rij("b", "top")]);
    expect(uit.map((r) => r.product_id)).toEqual(["a", "b"]);
    expect(uit[0].attrs.stijlen).toEqual(["streetwear"]);
  });
});

describe("bereidKandidatenVoor", () => {
  it("geeft de stijllabels door aan het product", () => {
    const [p] = bereidKandidatenVoor([rij("a", "top", { stijlen: ["streetwear", "casual"] })]);
    expect(p.stijlen).toEqual(["streetwear", "casual"]);
  });
});
