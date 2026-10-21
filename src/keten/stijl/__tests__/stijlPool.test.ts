import { describe, expect, it } from "vitest";
import type { KandidaatRij } from "@/services/outfits/kandidaten";
import poolKlassiek from "@/engine/v2/__tests__/fixtures/pool-man-klassiek-2026-10-01.json";
import { algemeenParams, algemeenSleutel, engineZaden, kandidatenUitPool, seizoenDekking, stijlParams, stijlSleutel, stijlZaden, zaadVoor, type PoolBestand } from "../stijlPool";

const CEL = { geslacht: "male", stijl: "classic", gelegenheid: "work" } as const;
const rijen = poolKlassiek as unknown as KandidaatRij[];

function pool(over: Partial<PoolBestand> = {}): PoolBestand {
  return {
    datum: "2026-10-22",
    gemaakt: "2026-10-22T20:00:00Z",
    cellen: [CEL],
    algemeen: { [algemeenSleutel(CEL)]: rijen },
    stijl: { [stijlSleutel(CEL)]: [{ p_zaad: 11, rijen: rijen.slice(0, 120) }, { p_zaad: 22, rijen: rijen.slice(50) }] },
    mislukt: [],
    ...over,
  };
}

describe("zaden", () => {
  it("zijn vast per tekst en passen in de int van p_zaad", () => {
    expect(zaadVoor("a")).toBe(zaadVoor("a"));
    expect(zaadVoor("a")).not.toBe(zaadVoor("b"));
    for (const t of ["", "a", "female|streetwear|2026-10-22|1"]) {
      expect(zaadVoor(t)).toBeGreaterThanOrEqual(1);
      expect(zaadVoor(t)).toBeLessThanOrEqual(2147483646);
    }
  });

  it("geeft drie verschillende stijlzaden per stijl en datum, en een ander zaad op een andere dag", () => {
    const z = stijlZaden(CEL, "2026-10-22");
    expect(new Set(z).size).toBe(3);
    expect(stijlZaden(CEL, "2026-10-23")).not.toEqual(z);
    expect(new Set(engineZaden(CEL, "2026-10-22")).size).toBe(3);
  });
});

describe("parameters", () => {
  it("vraagt de algemene pool zoals de site, met budget tot 250 per stuk", () => {
    expect(algemeenParams(CEL)).toMatchObject({ p_gender: "male", p_occasions: ["work"], p_budget_min: 0, p_budget_max: 250 });
  });

  it("streetwear vraagt sneakers, dus een eigen algemene pool", () => {
    const street = { geslacht: "female", stijl: "streetwear", gelegenheid: "casual" } as const;
    const casual = { geslacht: "female", stijl: "casual", gelegenheid: "casual" } as const;
    expect(algemeenParams(street).p_axes.shoe_type?.value).toBe("sneaker");
    expect(algemeenSleutel(street)).not.toBe(algemeenSleutel(casual));
  });

  it("zet het eigen zaad in de stijlvraag", () => {
    expect(stijlParams(CEL, 42)).toMatchObject({ p_gender: "male", p_stijlen: ["classic"], p_zaad: 42, p_budget_max: 250 });
  });
});

describe("kandidaten uit de pool", () => {
  it("maakt verschillende outfits met kleur, zaden en sleutel", async () => {
    const uit = await kandidatenUitPool(pool(), CEL, { bekend: new Set(), max: 40, season: "autumn" });
    expect(uit.reden).toBeUndefined();
    expect(uit.kandidaten.length).toBeGreaterThan(5);
    expect(uit.kandidaten.length).toBeLessThanOrEqual(40);
    const sleutels = uit.kandidaten.map((k) => k.outfit_key);
    expect(new Set(sleutels).size).toBe(sleutels.length);
    for (const k of uit.kandidaten) {
      expect(k.cel).toBe("male|classic|work");
      expect([11, 22]).toContain(k.p_zaad);
      expect(k.stukken.every((s) => s.kleuren.length > 0)).toBe(true);
      expect(k).toMatchObject({ ronde: 1, poging: 1 });
    }
  });

  it("slaat outfits over die al verstuurd zijn", async () => {
    const eerst = await kandidatenUitPool(pool(), CEL, { bekend: new Set(), max: 10, season: "autumn" });
    const daarna = await kandidatenUitPool(pool(), CEL, { bekend: new Set(eerst.kandidaten.map((k) => k.outfit_key)), max: 10, season: "autumn" });
    const overlap = daarna.kandidaten.filter((k) => eerst.kandidaten.some((e) => e.outfit_key === k.outfit_key));
    expect(overlap).toEqual([]);
  });

  it("keurt nooit op alleen de algemene pool", async () => {
    const uit = await kandidatenUitPool(pool({ stijl: {} }), CEL, { bekend: new Set(), max: 40, season: "autumn" });
    expect(uit.kandidaten).toEqual([]);
    expect(uit.reden).toBe("geen stijlpool");
  });

  it("ook niet als de stijlpools leeg zijn", async () => {
    const uit = await kandidatenUitPool(pool({ stijl: { [stijlSleutel(CEL)]: [{ p_zaad: 1, rijen: [] }] } }), CEL, { bekend: new Set(), max: 40, season: "autumn" });
    expect(uit.kandidaten).toEqual([]);
    expect(uit.reden).toBe("geen stijlpool");
  });

  it("telt per stijl hoeveel rijen een seizoenlabel hebben", () => {
    const met = rijen.slice(0, 3).map((r) => ({ ...r, attrs: { seizoen: "herfst-winter" } }));
    const zonder = rijen.slice(3, 5).map((r) => ({ ...r, attrs: {} }));
    expect(seizoenDekking(pool({ stijl: { [stijlSleutel(CEL)]: [{ p_zaad: 1, rijen: [...met, ...zonder] }] } }))).toEqual({
      [stijlSleutel(CEL)]: { rijen: 5, metSeizoen: 3 },
    });
  });

  it("vult een lege kleur aan uit de tags, en slaat een stuk zonder kleur over", async () => {
    const zonder = rijen.map((r) => ({ ...r, product: { ...r.product, colors: [] }, attrs: {} }));
    const uit = await kandidatenUitPool(
      pool({ algemeen: { [algemeenSleutel(CEL)]: zonder }, stijl: { [stijlSleutel(CEL)]: [{ p_zaad: 1, rijen: zonder }] } }),
      CEL,
      { bekend: new Set(), max: 40, season: "autumn" }
    );
    expect(uit.kandidaten).toEqual([]);
    expect(uit.zonderKleur).toBeGreaterThan(0);
    const metTags = zonder.map((r) => ({ ...r, attrs: { colors: ["navy"] } }));
    const aangevuld = await kandidatenUitPool(
      pool({ algemeen: { [algemeenSleutel(CEL)]: metTags }, stijl: { [stijlSleutel(CEL)]: [{ p_zaad: 1, rijen: metTags }] } }),
      CEL,
      { bekend: new Set(), max: 40, season: "autumn" }
    );
    expect(aangevuld.kandidaten.length).toBeGreaterThan(0);
    expect(aangevuld.kandidaten[0].stukken[0].kleuren).toEqual(["navy"]);
  });
});
