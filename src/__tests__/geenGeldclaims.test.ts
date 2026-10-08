/**
 * Publieke tekst doet geen geldclaim die de code niet waarmaakt.
 *
 * Aanleiding (8 oktober 2026). Een nieuwe aanmelding bij Daisycon kwam terug
 * met "deze media reeds geregistreerd", en er werd gemeld dat fitfi iets
 * financieels noemt. Een scan van de site vond dit:
 *
 * - De exit-modal op de resultatenpagina beloofde "2 maanden gratis" achter
 *   een deadline van 24 uur, met een link naar /prijzen?promo=... Geen enkele
 *   regel code leest die parameter, en de checkout geeft nooit korting. Een
 *   aanbod dat niet bestaat, met een verzonnen deadline. De modal was
 *   bovendien nooit te zien: /results staat achter RequireAuth en de trigger
 *   werkt alleen zonder gebruiker. Gebouwd, nooit aangesloten, en zo'n
 *   aanbod duikt op de dag dat iemand het toch aansluit.
 * - De uitlegpagina zette een bedrag per jaar naast "spijt-aankopen", zonder
 *   bron.
 * - De prijzenpagina noemde het Founder-aanbod "beperkt beschikbaar", terwijl
 *   stripe_products geen voorraad of limiet kent.
 * - Een teller viel terug op een verzonnen aantal upgrades.
 * - Blogartikelen spraken over "financiële vrijheid" en beleggen in kleding.
 *
 * Deze test houdt de patronen buiten de broncode. Hij toetst tekst, niet
 * gedrag: wie een echt aanbod bouwt (een coupon in Stripe, een voorraadteller)
 * past de lijst hieronder bewust aan.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");
const MAPPEN = ["src/pages", "src/components", "src/content", "src/services", "src/hooks"];

const VERBODEN: { patroon: RegExp; waarom: string }[] = [
  { patroon: /exit2free/i, waarom: "promocode die nergens wordt verwerkt" },
  { patroon: /\d+ maanden gratis/i, waarom: "korting die de checkout niet toepast" },
  { patroon: /uur geldig/i, waarom: "verzonnen deadline" },
  { patroon: /spijt-aankopen/i, waarom: "bedrag zonder bron" },
  { patroon: /financi[eë]le vrijheid/i, waarom: "geld- en beleggingstaal" },
  { patroon: /\binvest(eer|eren|eert|ering|eringen|ment|ments)\b/i, waarom: "beleggingstaal" },
  { patroon: /\b2847\b/, waarom: "verzonnen teller" },
  { patroon: /beperkt beschikbaar/i, waarom: "schaarste zonder limiet in de data" },
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

describe("publieke tekst en code bevatten geen onbewezen geldclaims", () => {
  const treffers: string[] = [];
  for (const map of MAPPEN) {
    for (const bestand of bestanden(join(WORTEL, map))) {
      readFileSync(bestand, "utf8")
        .split("\n")
        .forEach((regel, i) => {
          for (const { patroon, waarom } of VERBODEN) {
            if (patroon.test(regel)) {
              treffers.push(`${relative(WORTEL, bestand)}:${i + 1} (${waarom}): ${regel.trim().slice(0, 110)}`);
            }
          }
        });
    }
  }

  it("geen van de verboden patronen komt voor", () => {
    expect(treffers).toEqual([]);
  });
});
