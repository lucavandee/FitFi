/**
 * Met "alle cookies blokkeren" gooit al het opvragen van localStorage een
 * SecurityError. In de schil van elke pagina (ThemeContext, InstallPrompt) gaf
 * dat op elke route het foutscherm (live gemeten op 29 oktober 2026).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { leesOpslag, schrijfOpslag } from "../veiligeOpslag";

afterEach(() => {
  vi.unstubAllGlobals();
});

function zonderOpslag(soort: "gooit" | "null" | "setItem gooit") {
  const venster: Record<string, unknown> = {};
  if (soort === "gooit") {
    Object.defineProperty(venster, "localStorage", { get: () => { throw new DOMException("geblokkeerd", "SecurityError"); } });
  } else if (soort === "null") {
    venster.localStorage = null;
  } else {
    venster.localStorage = { getItem: () => "x", setItem: () => { throw new DOMException("vol", "QuotaExceededError"); } };
  }
  vi.stubGlobal("window", venster);
}

describe("veilige opslag", () => {
  it.each(["gooit", "null", "setItem gooit"] as const)("valt niet om als localStorage %s", (soort) => {
    zonderOpslag(soort);
    expect(() => leesOpslag("fitfi-theme")).not.toThrow();
    expect(() => schrijfOpslag("fitfi-theme", "light")).not.toThrow();
  });

  it("zonder opslag is er niets bewaard", () => {
    zonderOpslag("gooit");
    expect(leesOpslag("fitfi-theme")).toBeNull();
  });

  it("met opslag leest en schrijft hij gewoon", () => {
    const kaart = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (k: string) => kaart.get(k) ?? null, setItem: (k: string, v: string) => void kaart.set(k, v) } });
    schrijfOpslag("fitfi-theme", "dark");
    expect(leesOpslag("fitfi-theme")).toBe("dark");
  });

  it("de schil van elke pagina gebruikt localStorage niet meer rechtstreeks", () => {
    for (const bestand of ["src/context/ThemeContext.tsx", "src/components/pwa/InstallPrompt.tsx"]) {
      const bron = readFileSync(join(__dirname, "../../..", bestand), "utf-8");
      expect(bron, bestand).not.toMatch(/\blocalStorage\./);
    }
  });
});
