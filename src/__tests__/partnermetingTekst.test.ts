/**
 * Wat de marketingtoestemming laadt en wat de teksten erover zeggen, is één verhaal.
 *
 * Aanleiding (copy-controle fase 4, 8 oktober 2026, bevinding 7). De
 * cookiebanner bood "Marketing: Gepersonaliseerde advertenties op externe
 * platforms" aan, de cookiepagina zei "We gebruiken geen marketing-cookies",
 * de cookie-instellingen zeiden "Niet gebruikt" en de privacyverklaring "Geen
 * third-party tracking pixels". In de code doet die keuze (consent.marketing)
 * één ding: AwinMasterTag laadt dan het script van Awin op /results en
 * /dashboard. Advertenties of advertentiepixels zijn er niet.
 *
 * Zolang AwinMasterTag met die keuze het script van Awin laadt, noemen banner,
 * cookiepagina, cookie-instellingen, privacyverklaring en FAQ Awin. Gaat Awin
 * eruit, dan faalt deze test tot de teksten mee zijn aangepast.
 *
 * Bronnen zonder commentaar: een opmerking over wat er vroeger stond, telt niet.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");
const lees = (pad: string) => readFileSync(join(WORTEL, pad), "utf8");
const zonderCommentaar = (bron: string) =>
  bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const AWIN = lees("src/components/affiliate/AwinMasterTag.tsx");
const LAADT_AWIN = /dwin1\.com/.test(AWIN) && /prefs\.marketing/.test(AWIN);

const TEKSTEN = {
  cookiebanner: "src/components/legal/CookieBanner.tsx",
  cookiepagina: "src/pages/CookiesPage.tsx",
  cookieinstellingen: "src/components/profile/CookieSettings.tsx",
  privacyverklaring: "src/pages/PrivacyPage.tsx",
  faq: "src/pages/FAQPage.tsx",
} as const;

describe("de keuze voor partnermeting", () => {
  for (const [naam, pad] of Object.entries(TEKSTEN)) {
    it(`${naam} noemt Awin precies dan als de code Awin laadt`, () => {
      expect(/\bAwin\b/.test(zonderCommentaar(lees(pad)))).toBe(LAADT_AWIN);
    });

    it(`${naam} belooft niet dat er niets is`, () => {
      const tekst = zonderCommentaar(lees(pad));
      expect(tekst).not.toMatch(/geen marketing-?cookies/i);
      expect(tekst).not.toMatch(/gepersonaliseerde advertenties/i);
      expect(tekst).not.toMatch(/geen third-party tracking/i);
      expect(tekst).not.toMatch(/delen nooit met marketeers/i);
      expect(tekst).not.toMatch(/Niet gebruikt/);
    });
  }
});
