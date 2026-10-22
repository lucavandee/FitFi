/**
 * De kop weet al bij het laden van de module of hij boven de kleurkamer staat
 * (kamerNav.ts, beginStand). Anders tekent de eerste frame op / de gewone kop
 * en verspringt die daarna. Vitest draait zonder window; hier staat er een.
 */
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

async function beginStandOp(pathname: string, search = "") {
  vi.stubGlobal("window", { location: { pathname, search } });
  vi.resetModules();
  const { useKamerNav } = await import("../kamerNav");
  function Lees() {
    return <i data-stand={JSON.stringify(useKamerNav())} />;
  }
  const html = renderToString(<Lees />);
  const json = html.match(/data-stand="([^"]*)"/)?.[1].replace(/&quot;/g, '"') ?? "{}";
  return JSON.parse(json) as { actief: boolean; tekst: string; licht: boolean; veld: string };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("beginstand van de kop", () => {
  it("op / zonder keuze: de startkamer (diep rood, dames), papier op het veld", async () => {
    expect(await beginStandOp("/")).toEqual({ actief: true, tekst: "#FAFAF8", licht: true, veld: "#933126" });
  });

  it("op / met ?kleur=olijfgroen&wie=heren: die kamer, wit op het veld van heren", async () => {
    expect(await beginStandOp("/", "?kleur=olijfgroen&wie=heren")).toEqual({ actief: true, tekst: "#FFFFFF", licht: true, veld: "#6E7A45" });
  });

  it("met een onbekende kleur de startkamer", async () => {
    expect((await beginStandOp("/", "?kleur=paars")).veld).toBe("#933126");
  });

  it("buiten / staat de kamerstand uit", async () => {
    expect((await beginStandOp("/prijzen")).actief).toBe(false);
  });
});
