import { describe, it, expect } from "vitest";
import { execFileSync } from "child_process";

// LET OP: deze test bestaat omdat het twee keer is misgegaan.
//
// macOS is standaard hoofdletter-ongevoelig, de Linux-buildmachine van Netlify
// niet. Twee paden die alleen in hoofdletters verschillen vallen lokaal samen
// tot een bestand, maar staan in git als twee. Wie op macOS werkt ziet niets;
// de build ziet twee mappen waarvan er een half gevuld is.
//
// PR #75 ging hierover ("mappen die alleen in hoofdletter verschilden
// samengevoegd") en op 2026-09-27 stond het er opnieuw:
// src/components/Tribes/ met vijf bestanden naast src/components/tribes/ met
// drie. Deze test vangt de hele klasse af in plaats van het geval.

function bestanden(): string[] {
  return execFileSync("git", ["ls-files"], { encoding: "utf-8" })
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
}

describe("paden in git", () => {
  it("bevat geen twee paden die alleen in hoofdletters verschillen", () => {
    const perKleineLetter = new Map<string, string[]>();
    for (const pad of bestanden()) {
      const sleutel = pad.toLowerCase();
      const lijst = perKleineLetter.get(sleutel) ?? [];
      lijst.push(pad);
      perKleineLetter.set(sleutel, lijst);
    }
    const botsingen = [...perKleineLetter.values()].filter((l) => new Set(l).size > 1);
    expect(botsingen, `botsende paden: ${JSON.stringify(botsingen)}`).toEqual([]);
  });

  it("bevat geen twee MAPPEN die alleen in hoofdletters verschillen", () => {
    // Dit is het geval dat echt bijt: de bestanden verschillen, de map niet.
    const mappen = new Set<string>();
    for (const pad of bestanden()) {
      const delen = pad.split("/");
      for (let i = 1; i < delen.length; i++) mappen.add(delen.slice(0, i).join("/"));
    }
    const perKleineLetter = new Map<string, string[]>();
    for (const map of mappen) {
      const sleutel = map.toLowerCase();
      const lijst = perKleineLetter.get(sleutel) ?? [];
      lijst.push(map);
      perKleineLetter.set(sleutel, lijst);
    }
    const botsingen = [...perKleineLetter.values()].filter((l) => l.length > 1);
    expect(botsingen, `botsende mappen: ${JSON.stringify(botsingen)}`).toEqual([]);
  });
});
