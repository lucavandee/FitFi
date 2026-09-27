import { describe, expect, it, vi } from "vitest";
import {
  OPSLAG_SLEUTEL,
  abonneer,
  bewaarKeuze,
  leesKeuze,
  magSchrijven,
  onthoudSleutel,
  type Opslag,
} from "../outfitRatingGeheugen";

function nepOpslag(begin: Record<string, string> = {}): Opslag & { data: Record<string, string> } {
  const data = { ...begin };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

const HASH = "a".repeat(64);

describe("onthoudSleutel", () => {
  it("combineert hash en outfit-id, en is null zonder hash", () => {
    expect(onthoudSleutel(HASH, "o1")).toBe(`${HASH}:o1`);
    expect(onthoudSleutel(null, "o1")).toBeNull();
  });
});

describe("leesKeuze en bewaarKeuze", () => {
  it("geeft null als er nog niets onthouden is", () => {
    expect(leesKeuze("x:o1", nepOpslag())).toBeNull();
  });

  it("leest terug wat bewaard is, per sleutel", () => {
    const opslag = nepOpslag();
    bewaarKeuze("x:o1", "zou_dragen", opslag);
    bewaarKeuze("x:o2", "nooit", opslag);
    expect(leesKeuze("x:o1", opslag)).toBe("zou_dragen");
    expect(leesKeuze("x:o2", opslag)).toBe("nooit");
    expect(leesKeuze("x:o3", opslag)).toBeNull();
    expect(JSON.parse(opslag.data[OPSLAG_SLEUTEL])).toEqual({ "x:o1": "zou_dragen", "x:o2": "nooit" });
  });

  it("overleeft kapotte json en een ontbrekende opslag", () => {
    expect(leesKeuze("x:o1", nepOpslag({ [OPSLAG_SLEUTEL]: "{niet json" }))).toBeNull();
    expect(leesKeuze("x:o1", null)).toBeNull();
    expect(() => bewaarKeuze("x:o1", "nooit", null)).not.toThrow();
  });

  it("negeert een waarde die geen rating is", () => {
    const opslag = nepOpslag({ [OPSLAG_SLEUTEL]: JSON.stringify({ "x:o1": "misschien" }) });
    expect(leesKeuze("x:o1", opslag)).toBeNull();
  });
});

describe("abonneer", () => {
  it("meldt een bewaarde keuze aan abonnees van dezelfde sleutel, niet aan andere", () => {
    const opslag = nepOpslag();
    const a = vi.fn();
    const b = vi.fn();
    const stopA = abonneer("x:o1", a);
    const stopB = abonneer("x:o2", b);
    bewaarKeuze("x:o1", "nooit", opslag);
    expect(a).toHaveBeenCalledWith("nooit");
    expect(b).not.toHaveBeenCalled();
    stopA();
    stopB();
    bewaarKeuze("x:o1", "zou_dragen", opslag);
    expect(a).toHaveBeenCalledTimes(1);
  });
});

describe("magSchrijven", () => {
  it("schrijft niet zonder hash, niet tijdens een schrijfactie en niet bij dezelfde keuze", () => {
    expect(magSchrijven({ profileHash: null, gekozen: null, bezig: false }, "nooit")).toBe(false);
    expect(magSchrijven({ profileHash: HASH, gekozen: null, bezig: true }, "nooit")).toBe(false);
    expect(magSchrijven({ profileHash: HASH, gekozen: "nooit", bezig: false }, "nooit")).toBe(false);
  });

  it("schrijft bij een eerste keuze en bij een andere keuze", () => {
    expect(magSchrijven({ profileHash: HASH, gekozen: null, bezig: false }, "nooit")).toBe(true);
    expect(magSchrijven({ profileHash: HASH, gekozen: "nooit", bezig: false }, "zou_dragen")).toBe(true);
  });

  it("na herlaad met een onthouden keuze schrijft dezelfde klik niet opnieuw", () => {
    const opslag = nepOpslag({ [OPSLAG_SLEUTEL]: JSON.stringify({ [`${HASH}:o1`]: "zou_dragen" }) });
    const gekozen = leesKeuze(onthoudSleutel(HASH, "o1")!, opslag);
    expect(gekozen).toBe("zou_dragen");
    expect(magSchrijven({ profileHash: HASH, gekozen, bezig: false }, "zou_dragen")).toBe(false);
    expect(magSchrijven({ profileHash: HASH, gekozen, bezig: false }, "nooit")).toBe(true);
  });
});
