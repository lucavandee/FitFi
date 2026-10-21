import { describe, expect, it } from "vitest";
import { kalibratiePorties, verwachtZoalsDeNacht, zoalsDeNacht } from "../kalibratie";
import type { KeurOutfit } from "../stijlAgent";

const outfit = (id: string): KeurOutfit => ({
  id,
  profiel: { geslacht: "female", stijlen: ["streetwear"], gelegenheid: "casual", lichtheid: "licht", kleurtemperatuur: "warm", spoor: "hip" },
  stukken: [{ categorie: "top", naam: "Oversized hoodie, Maat M", merk: "H&M", prijs: 30, kleuren: ["crème"], lichtheid: "licht", schoentype: null }],
});

describe("kalibratie zoals de nacht", () => {
  it("stuurt een kort id en alleen wat de nacht ook stuurt", () => {
    expect(zoalsDeNacht(outfit("goed-4"), "k2")).toEqual({
      id: "k2",
      profiel: { geslacht: "female", stijlen: ["streetwear"], gelegenheid: "casual" },
      stukken: [{ categorie: "top", naam: "Oversized hoodie", merk: "H&M", prijs: 30, kleuren: ["crème"] }],
    });
  });

  it("laat een verwachting vallen die afhangt van wat de nacht niet stuurt", () => {
    expect(verwachtZoalsDeNacht({ verwacht: "fout", afhankelijk_van: ["lichtheid"] })).toBeNull();
    expect(verwachtZoalsDeNacht({ verwacht: "fout" })).toBe("fout");
    expect(verwachtZoalsDeNacht({ verwacht: "goed", afhankelijk_van: [] })).toBe("goed");
  });

  it("husselt de hele set en nummert per portie k1 tot en met k9", () => {
    const set = [
      ...Array.from({ length: 9 }, (_, i) => ({ id: `luc-oud-${i + 1}` })),
      ...Array.from({ length: 10 }, (_, i) => ({ id: `goed-${i + 1}` })),
      ...Array.from({ length: 8 }, (_, i) => ({ id: `fout-${i + 1}` })),
    ];
    const porties = kalibratiePorties(set, 9, 2026);
    expect(porties.map((p) => p.length)).toEqual([9, 9, 9]);
    for (const p of porties) expect(p.map((x) => x.kort)).toEqual(p.map((_, i) => `k${i + 1}`));
    expect(porties.flat().map((x) => x.outfit.id).sort()).toEqual(set.map((o) => o.id).sort());
    // Gemengd: geen portie bestaat uit een soort.
    for (const p of porties) expect(new Set(p.map((x) => x.outfit.id.replace(/-\d+$/, ""))).size).toBeGreaterThan(1);
    expect(kalibratiePorties(set, 9, 2026)).toEqual(porties);
  });
});
