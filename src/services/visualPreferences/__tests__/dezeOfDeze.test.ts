/**
 * "Deze of deze?" (quizstap sinds 21 oktober 2026): het schema van de rondes,
 * de beelden op schijf, en dat een keuze het stijlprofiel bereikt via
 * dezelfde sleutels als de swipes ervoor.
 */
import { afterEach, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildUserStyleProfile } from "@/engine/v2/buildProfile";
import { AANTAL_RONDES, GEWICHTEN, LOOKS, RONDES, type LookGeslacht } from "@/data/dezeOfDeze";
import { aantalBeoordeeld, patroonUitKeuzes, rondesVoor, type Keuze } from "../dezeOfDeze";
import { bewaarSwipeUitkomst } from "../swipeOpslag";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
const GESLACHTEN: LookGeslacht[] = ["female", "male"];

/** Paren die te veel op elkaar lijken om iets te zeggen. */
const TE_DICHTBIJ = [
  ["MINIMALIST", "SMART_CASUAL"],
  ["MINIMALIST", "CLASSIC"],
  ["MINIMALIST", "AVANT_GARDE"],
  ["CLASSIC", "BUSINESS"],
  ["CLASSIC", "SMART_CASUAL"],
  ["STREETWEAR", "ATHLETIC"],
];

function opslag() {
  const kaart = new Map<string, string>();
  return {
    kaart,
    setItem: (k: string, v: string) => void kaart.set(k, v),
    removeItem: (k: string) => void kaart.delete(k),
    getItem: (k: string) => kaart.get(k) ?? null,
  };
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("het schema van de rondes", () => {
  it.each(GESLACHTEN)("%s: zeven rondes, elke look een keer, elk archetype twee keer", (g) => {
    const ids = RONDES[g].flat();
    expect(RONDES[g]).toHaveLength(AANTAL_RONDES);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(Object.values(LOOKS).filter((l) => l.geslacht === g).map((l) => l.id).sort());
    const telling: Record<string, number> = {};
    for (const id of ids) telling[LOOKS[id].archetype] = (telling[LOOKS[id].archetype] ?? 0) + 1;
    expect(Object.keys(telling)).toHaveLength(7);
    expect(Object.values(telling).every((n) => n === 2)).toBe(true);
  });

  it.each(GESLACHTEN)("%s: twee verschillende stijlen per ronde, en geen archetype twee rondes achter elkaar", (g) => {
    const paren = RONDES[g].map(([a, b]) => [LOOKS[a].archetype, LOOKS[b].archetype]);
    for (const [a, b] of paren) {
      expect(a).not.toBe(b);
      expect(TE_DICHTBIJ.some(([x, y]) => (x === a && y === b) || (x === b && y === a)), `${a} tegen ${b}`).toBe(false);
    }
    for (let i = 1; i < paren.length; i++) {
      expect(paren[i].some((a) => paren[i - 1].includes(a)), `ronde ${i} en ${i + 1}`).toBe(false);
    }
  });

  it("dames en heren vergelijken per ronde dezelfde twee archetypen", () => {
    const sleutel = (g: LookGeslacht) => RONDES[g].map((p) => p.map((id) => LOOKS[id].archetype).sort().join("+"));
    expect(sleutel("female")).toEqual(sleutel("male"));
  });

  it("zonder vrouw of man wisselt het per ronde, met hetzelfde schema", () => {
    for (const g of ["non-binary", "prefer-not-to-say", undefined] as const) {
      const rondes = rondesVoor(g);
      expect(rondes.map(([a]) => a.geslacht)).toEqual(["female", "male", "female", "male", "female", "male", "female"]);
      expect(rondes.map((p) => p.map((l) => l.archetype).sort().join("+"))).toEqual(
        rondesVoor("female").map((p) => p.map((l) => l.archetype).sort().join("+")),
      );
    }
  });

  it("elke look heeft beide formaten op schijf en een alt-tekst", () => {
    for (const look of Object.values(LOOKS)) {
      for (const breedte of [480, 960]) {
        expect(existsSync(`${ROOT}public${look.beeld}-${breedte}.webp`), `${look.id} ${breedte}`).toBe(true);
      }
      expect(look.alt.length).toBeGreaterThan(20);
      expect(look.beeld).toMatch(new RegExp(`/${look.id}\\.[0-9a-f]{8}$`));
    }
  });
});

describe("de uitkomst", () => {
  it("telt de gekozen looks op, en twee beoordelingen per ronde", () => {
    const rondes = rondesVoor("female");
    const keuzes: Keuze[] = [0, null, 1];
    const patroon = patroonUitKeuzes(rondes, keuzes);
    const a = GEWICHTEN[rondes[0][0].archetype];
    const b = GEWICHTEN[rondes[2][1].archetype];
    expect(patroon.archetypeWeights?.MINIMALIST).toBeCloseTo(a.MINIMALIST + b.MINIMALIST, 5);
    expect(aantalBeoordeeld(keuzes)).toBe(6);
    expect(patroon.likeRate).toBeCloseTo(2 / 6, 5);
  });

  it("geen van beide in elke ronde: geen gewichten, en de stijl van een eerdere quiz gaat weg", () => {
    const o = opslag();
    o.setItem("ff_visual_embedding", JSON.stringify({ STREETWEAR: 1 }));
    const keuzes: Keuze[] = Array(AANTAL_RONDES).fill(null);
    bewaarSwipeUitkomst(o, aantalBeoordeeld(keuzes), patroonUitKeuzes(rondesVoor("male"), keuzes));
    expect(o.kaart.has("ff_visual_embedding")).toBe(false);
    expect(o.kaart.get("ff_swipe_count")).toBe("14");
  });

  it("wie steeds de straatlook of de sportlook kiest, krijgt meer streetwear in het profiel", () => {
    const rondes = rondesVoor("male");
    const keuzes: Keuze[] = rondes.map(([a, b]) => {
      const sportief = (l: typeof a) => l.archetype === "STREETWEAR" || l.archetype === "ATHLETIC";
      return sportief(a) ? 0 : sportief(b) ? 1 : null;
    });
    const o = opslag();
    bewaarSwipeUitkomst(o, aantalBeoordeeld(keuzes), patroonUitKeuzes(rondes, keuzes));

    const antwoorden = { gender: "male", stylePreferences: ["minimalist"], occasions: ["casual"] };
    const zonder = buildUserStyleProfile(antwoorden);
    (globalThis as { window?: unknown }).window = { localStorage: o };
    const met = buildUserStyleProfile(antwoorden);

    expect(met.diagnostics.swipeInfluence).toBeGreaterThan(0.4);
    expect(met.archetypes.STREETWEAR ?? 0).toBeGreaterThan(zonder.archetypes.STREETWEAR ?? 0);
    expect(met.archetypes.MINIMALIST ?? 0).toBeLessThan(zonder.archetypes.MINIMALIST ?? 0);
  });
});
