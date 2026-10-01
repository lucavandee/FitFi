/**
 * FIXRONDE 9 (1 okt 2026): normalisatie voor de afkeuringen uit de proefronde
 * over vier nieuwe winkels (Giglio, PUMA, OFM, Mart Visser). Bron:
 * ~/claude-artifacts/fitfi-keten/proefronde-2026-10-01/tag-fouten-*.json.
 * Zelfde regel als fixronde 5 tot en met 8: alleen normaliseren waar de
 * betekenis vaststaat. Wat geen vaste basiskleur heeft, blijft een afkeuring.
 *
 * Een eigen bestand naast tagging.test.ts, omdat PR 112 dat bestand wijzigt.
 */
import { describe, expect, it } from "vitest";
import { valideerTagsGedetailleerd } from "../tagging";

const basis = {
  is_fashion: true,
  category: "top",
  gender: "female",
  formality: 3,
  occasions: ["work"],
  silhouette: "regular",
  color_temp: "koel",
  lightness: "medium",
  pattern: "effen",
  shoe_type: null,
  colors: ["zwart"],
  materials: ["katoen"],
  seasons: ["herfst"],
  confidence: 0.8,
};

const valideer = (extra: Record<string, unknown>) => valideerTagsGedetailleerd({ ...basis, ...extra });

describe("losse waarde in een lijstveld", () => {
  // Mart Visser, herkansing: 84 van de 124 afkeuringen waren materials als losse tekst.
  it.each([
    ["materials", "denim", ["denim"]],
    ["materials", "onbekend", ["onbekend"]],
    ["materials", "elastane", ["synthetisch"]],
    ["colors", "zwart", ["zwart"]],
    ["occasions", "work", ["work"]],
    ["seasons", "winter", ["winter"]],
  ])("%s: %j wordt een lijst van één", (veld, waarde, verwacht) => {
    const r = valideer({ [veld]: waarde });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tags[veld as keyof typeof r.tags]).toEqual(verwacht);
  });

  it("een losse materiaalwaarde buiten de lijst valt weg en wordt onbekend, net als in een lijst", () => {
    const r = valideer({ materials: "gebreid" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.tags.materials).toEqual(["onbekend"]);
      expect(r.weggevallen).toEqual([{ veld: "materials", waarde: "gebreid" }]);
    }
  });

  it("een lege tekst blijft een afkeuring", () => {
    expect(valideer({ colors: "" }).ok).toBe(false);
  });
});

describe("samengestelde kleurnamen: het laatste deel is de kleur", () => {
  it.each([
    ["lichtblauw", "blauw"],
    ["donkerbruin", "bruin"],
    ["lichtgroen", "groen"],
    ["olijfgroen", "groen"],
    ["bordeauxrood", "rood"],
    ["koraalrood", "rood"],
    ["oudroze", "roze"],
    ["light blue", "blauw"],
    ["dark brown", "bruin"],
    ["off white", "wit"],
    ["off-white", "wit"],
  ])("%s wordt %s", (ruw, verwacht) => {
    const r = valideer({ colors: [ruw] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tags.colors).toEqual([verwacht]);
  });
});

describe("losse kleurnamen met een vaste basiskleur", () => {
  it.each([
    ["marineblauw", "navy"],
    ["marine", "navy"],
    ["bordeaux", "rood"],
    ["zand", "beige"],
    ["kobalt", "blauw"],
    ["antraciet", "grijs"],
    // Ronde 3 van de proefronde: "olijf" bleef de enige afkeuring met een
    // vaste basiskleur.
    ["olijf", "groen"],
    ["olive", "groen"],
  ])("%s wordt %s", (ruw, verwacht) => {
    const r = valideer({ colors: [ruw] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tags.colors).toEqual([verwacht]);
  });
});

describe("kleurnamen zonder vaste basiskleur blijven een afkeuring", () => {
  it.each([["dark berry"], ["berry"], ["koraal"], ["brons"], ["neutraal"], ["donkerbeeren"]])("%s", (ruw) => {
    const r = valideer({ colors: [ruw] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.veld).toBe("colors");
  });
});
