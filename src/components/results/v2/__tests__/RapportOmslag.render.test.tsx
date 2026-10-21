/**
 * De omslag van het stijlrapport (src/components/results/v2/RapportOmslag.tsx):
 * het stijlwoord in kleine letters, de kleurcode uit het palet van het rapport,
 * en geen tekst onder 14 px.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RapportOmslag } from "../RapportOmslag";
import { getColorPalette } from "@/data/colorPalettes";

const leeg = () => {};
const zomer = getColorPalette("zomer")!.doColors.map((k) => ({ hex: k.hex, naam: k.name }));

function html(extra: Partial<React.ComponentProps<typeof RapportOmslag>> = {}) {
  return renderToString(
    <RapportOmslag
      stijlwoord="Minimalistisch"
      seizoen="Zomer"
      kenmerken={["koele tinten", "laag contrast"]}
      kleuren={zomer}
      aantalOutfits={6}
      aantalBewaard={0}
      onBekijkOutfits={leeg}
      onQuizOpnieuw={leeg}
      onDelen={leeg}
      {...extra}
    />,
  ).replace(/<!-- -->/g, "");
}

describe("RapportOmslag", () => {
  it("zet het stijlwoord als kop, met seizoen en kenmerken eronder", () => {
    const h = html();
    expect(h).toMatch(/<h1[^>]*>minimalistisch<\/h1>/);
    expect(h).toContain("Zomer · koele tinten · laag contrast");
    expect(h).toContain("6 outfits");
    expect(h).not.toContain("bewaard");
  });

  it("toont de kleurcode met de namen uit het palet", () => {
    const h = html();
    expect(h).toContain(`Kleurcode: ${zomer.slice(0, 7).map((k) => k.naam.toLowerCase()).join(", ")}`);
    expect(h).toContain(zomer[0].naam);
  });

  it("laat de kleurcode weg zonder palet, en noemt bewaarde outfits", () => {
    const h = html({ kleuren: [], aantalBewaard: 2, kenmerken: [] });
    expect(h).not.toContain("Jouw kleurcode");
    expect(h).toContain("6 outfits, 2 bewaard");
    expect(h).toMatch(/>Zomer<\/p>/);
  });

  it("heeft geen tekst onder 14 px en geen gedachtestreepje", () => {
    const h = html();
    expect(h).not.toMatch(/text-xs|text-\[1[0-3]px\]/);
    expect(h).not.toMatch(/[–—]/);
  });
});
