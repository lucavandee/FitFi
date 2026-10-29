/**
 * De winkelrij blijft weg met minder dan drie stukken (InDeWinkel.tsx): een rij
 * van één of twee stukken oogt als een fout. In de echte lijst heeft geen kamer
 * er één of twee, dus de drempel krijgt hier eigen data.
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/content/kleurkamerProducten", async (echt) => {
  const mod = await echt<typeof import("@/content/kleurkamerProducten")>();
  const rood = mod.KLEURKAMER_PRODUCTEN.dieprood;
  return {
    ...mod,
    KLEURKAMER_PRODUCTEN: { ...mod.KLEURKAMER_PRODUCTEN, dieprood: { dames: rood.dames.slice(0, 2), heren: rood.heren.slice(0, 3) } },
  };
});

import InDeWinkel from "../InDeWinkel";
import { winkelTitel } from "@/content/kleurkamerProducten";

const render = (el: JSX.Element) => renderToString(<MemoryRouter>{el}</MemoryRouter>);

describe("drempel van de winkelrij", () => {
  it("twee stukken: geen rij", () => {
    expect(render(<InDeWinkel kamer="dieprood" wie="dames" />)).toBe("");
  });

  it("drie stukken: een rij met drie partnerlinks", () => {
    const html = render(<InDeWinkel kamer="dieprood" wie="heren" />);
    expect(html.match(/target="_blank"/g)).toHaveLength(3);
  });
});

describe("winkelTitel", () => {
  it("zonder winkelnaam, kleur en pasvorm; de rest klein na een komma", () => {
    expect(winkelTitel("H & M - Trui - Relaxed Fit - Lichtblauw")).toBe("Trui");
    expect(winkelTitel("H & M - Pantalon - High waist - Bordeauxrood")).toBe("Pantalon, high waist");
    expect(winkelTitel("H&M - Corduroy overhemd - Regular Fit - Lichtblauw")).toBe("Corduroy overhemd");
  });

  it("een naam zonder streepjes blijft heel", () => {
    expect(winkelTitel("Wollen jas")).toBe("Wollen jas");
  });
});
