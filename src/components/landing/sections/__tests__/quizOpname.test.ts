/**
 * De opname van de quiz in "Zo werkt het" (plan "Onder de hero", 4.4; W1, W3,
 * W4, W5).
 *
 * De opname toont stap 5 en de overgang naar stap 6. Verandert de quiz (andere
 * vraag, andere optie, ander aantal stappen), dan klopt de opname niet meer:
 * deze test faalt dan, en dan volgt een nieuwe opname. Tot de opname er is
 * (OPNAME_A1 is null) toetst hij de tekst die erbij hoort.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { quizSteps } from "@/data/quizSteps";
import { OPNAME_A1 } from "@/content/beeld";
import { LANDING_COPY } from "@/content/landingCopy";

const OPNAME = LANDING_COPY.werkwijze.opname;
const stap5 = quizSteps[4];
const stap6 = quizSteps[5];

describe("de tekst bij de opname past bij de quiz", () => {
  it("stap 5 is de contrastvraag, met een optie Tonal", () => {
    expect(stap5.field).toBe("contrast");
    expect(OPNAME.beschrijving.tekst).toContain(`stap 5, ${stap5.title},`);
    expect(stap5.options?.some((o) => o.value === "laag" && o.label.startsWith("Tonal"))).toBe(true);
  });

  it("na stap 5 komt de pasvorm, stap 6", () => {
    expect(stap6.title).toBe("Welke pasvorm prefereer je?");
    expect(OPNAME.beschrijving.tekst).toContain("naar stap 6");
  });

  it("het onderschrift noemt het echte aantal stappen", () => {
    expect(OPNAME.onderschrift.tekst).toBe(`Opname uit de quiz, stap 5 van ${quizSteps.length}, mobiele weergave.`);
  });
});

const inPublic = (pad: string) => fileURLToPath(new URL(`../../../../../public${pad}`, import.meta.url));

describe.runIf(OPNAME_A1 !== null)("de opname zelf", () => {
  const opname = OPNAME_A1!;

  it("op ware grootte: 390 css-pixels breed (W5)", () => {
    expect(opname.breedte).toBe(390);
  });

  it("clip hoogstens 350 KB, poster hoogstens 60 KB, hash in de naam (W3)", () => {
    for (const [pad, plafond] of [
      [opname.clip, 350 * 1024],
      [opname.poster, 60 * 1024],
    ] as const) {
      expect(existsSync(inPublic(pad)), pad).toBe(true);
      expect(statSync(inPublic(pad)).size).toBeLessThanOrEqual(plafond);
      const hash = pad.match(/\.([0-9a-f]{8})\.[a-z0-9]+$/)?.[1];
      expect(createHash("sha256").update(readFileSync(inPublic(pad))).digest("hex").slice(0, 8)).toBe(hash);
    }
  });
});
