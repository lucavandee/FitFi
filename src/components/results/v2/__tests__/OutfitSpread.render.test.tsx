/**
 * Een outfit als spread (src/components/results/v2/OutfitSpread.tsx): de
 * stukken met prijs en totaal, H&M-beelden in een kleiner formaat, en geen
 * tekst onder 14 px.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OutfitSpread, type SpreadStuk } from "../OutfitSpread";

const leeg = () => {};
const STUKKEN: SpreadStuk[] = [
  { id: "a", naam: "Popeline jurk met flared rok, ivoorwit", merk: "H & M", beeld: "https://image.hm.com/assets/hm/a.jpg", prijs: 19.99 },
  { id: "b", naam: "Court Classic sneakers, zwart/wit", merk: "Puma", beeld: "https://images.puma.com/b.png", prijs: 59.95 },
];

function html(stukken = STUKKEN) {
  return renderToString(
    <OutfitSpread nummer={1} label="Formeel" titel="Ivoorwitte jurk met sneakers" uitleg="Voor een nette gelegenheid." stukken={stukken} onBekijk={leeg} />,
  ).replace(/<!-- -->/g, "");
}

describe("OutfitSpread", () => {
  it("toont nummer, label, titel, de stukken met prijs en het totaal", () => {
    const h = html();
    expect(h).toContain("01 · Formeel");
    expect(h).toContain("Ivoorwitte jurk met sneakers");
    expect(h).toMatch(/19,99/);
    expect(h).toMatch(/59,95/);
    expect(h).toContain("Samen");
    expect(h).toMatch(/79,94/);
    expect(h).toContain("Bekijk bij partner");
  });

  it("vraagt H&M om een kleiner beeld en laat andere winkels ongemoeid, zonder uitsnijden", () => {
    const h = html();
    expect(h).toContain("https://image.hm.com/assets/hm/a.jpg?imwidth=600");
    expect(h).toContain('src="https://images.puma.com/b.png"');
    expect(h).toContain("object-contain");
    expect(h).not.toContain("object-cover");
    // Foto's zonder radius (CLAUDE.md deel 17).
    const beelden = [...h.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
    expect(beelden).toHaveLength(2);
    expect(beelden.some((b) => /roun[d]ed/.test(b))).toBe(false);
  });

  it("geeft geen totaal als een prijs ontbreekt", () => {
    const h = html([STUKKEN[0], { ...STUKKEN[1], prijs: null }]);
    expect(h).not.toContain("Samen");
  });

  it("heeft geen tekst onder 14 px en geen gedachtestreepje", () => {
    const h = html();
    expect(h).not.toMatch(/text-xs|text-\[1[0-3]px\]/);
    expect(h).not.toMatch(/[–—]/);
  });
});
