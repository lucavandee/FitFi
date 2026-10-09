/**
 * De disclosure legt alleen labels uit die de site ook echt toont.
 *
 * Aanleiding (copy-controle fase 4, bevinding 12). Punt 6 zei: "Een foto die
 * FitFi zelf maakt, krijgt het label 'Eigen foto.'" Dat label bestond nergens in
 * de code en er was geen eigen foto; de zin stond er als geldende regel.
 *
 * Deze test haalt elke tekst tussen dubbele aanhalingstekens die op een punt
 * eindigt uit punt 6 (de labels) en zoekt die op in de rest van src/.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "../..");
const DISCLOSURE = join(__dirname, "../DisclosurePage.tsx");

function bronbestanden(map: string): string[] {
  const uit: string[] = [];
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) {
      if (naam === "__tests__") continue;
      uit.push(...bronbestanden(pad));
    } else if (/\.tsx?$/.test(naam) && !/\.test\./.test(naam) && pad !== DISCLOSURE) {
      uit.push(pad);
    }
  }
  return uit;
}

// Zonder commentaar: een opmerking over een label dat er vroeger stond, telt niet.
const bron = readFileSync(DISCLOSURE, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const punt6 = bron.slice(bron.indexOf("id: 'beelden'"), bron.indexOf("id: 'redactie'"));
const labels = [...punt6.matchAll(/"([^"]+?\.)"/g)].map((m) => m[1]);
const rest = bronbestanden(SRC).map((pad) => ({ pad, tekst: readFileSync(pad, "utf8") }));

describe("disclosure, punt 6", () => {
  it("noemt labels", () => {
    expect(labels.length).toBeGreaterThan(0);
  });

  for (const label of labels) {
    it(`het label "${label}" bestaat ook buiten de disclosure`, () => {
      const gevonden = rest.filter(({ tekst }) => tekst.includes(label)).map(({ pad }) => relative(SRC, pad));
      expect(gevonden, `"${label}" staat alleen in de disclosure`).not.toEqual([]);
    });
  }
});
