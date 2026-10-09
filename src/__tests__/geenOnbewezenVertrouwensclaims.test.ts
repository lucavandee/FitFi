/**
 * Publieke tekst noemt geen vertrouwensclaim die niemand kan nagaan.
 *
 * Aanleiding (copy-controle fase 4, 8 oktober 2026, bevinding 6). De landing
 * haalde "2.400+ gebruikers" weg omdat het aantal niet te controleren is: RLS
 * geeft geen telling. De FAQ zette er "2.500+ gebruikers" naast, en
 * "GDPR-compliant" stond nog in de FAQ, op de cookiepagina, op de inlogpagina
 * en in de meta van de privacypagina, terwijl dezelfde pil uit de footer ging.
 *
 * Deze test leest de bron zonder commentaar: een opmerking die uitlegt wat er
 * vroeger stond, telt niet. Wie ooit een aantal gebruikers wil noemen, haalt
 * het uit een telling en past de lijst hieronder bewust aan.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");
const MAPPEN = ["src/pages", "src/components", "src/content"];

const VERBODEN: { patroon: RegExp; waarom: string }[] = [
  { patroon: /\b\d[\d.,]*\s?\+\s?(gebruikers|leden|klanten)\b/i, waarom: "aantal gebruikers zonder telling" },
  { patroon: /\bGDPR[- ]compliant\b/i, waarom: "nalevingsclaim die de selfie-route tegensprak" },
];

function bestanden(map: string): string[] {
  const uit: string[] = [];
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) {
      if (naam === "__tests__" || naam.toLowerCase() === "admin") continue;
      uit.push(...bestanden(pad));
    } else if (/\.(tsx?|json)$/.test(naam) && !/\.test\./.test(naam) && !/admin/i.test(naam)) {
      uit.push(pad);
    }
  }
  return uit;
}

function zonderCommentaar(bron: string): string {
  return bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("publieke tekst bevat geen onbewezen vertrouwensclaims", () => {
  const treffers: string[] = [];
  for (const map of MAPPEN) {
    for (const bestand of bestanden(join(WORTEL, map))) {
      zonderCommentaar(readFileSync(bestand, "utf8"))
        .split("\n")
        .forEach((regel) => {
          for (const { patroon, waarom } of VERBODEN) {
            if (patroon.test(regel)) {
              treffers.push(`${relative(WORTEL, bestand)} (${waarom}): ${regel.trim().slice(0, 110)}`);
            }
          }
        });
    }
  }

  it("geen van de verboden patronen komt voor", () => {
    expect(treffers).toEqual([]);
  });
});
