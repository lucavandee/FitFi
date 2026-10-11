/**
 * Paginatitels hebben één vorm: "Onderwerp | FitFi".
 *
 * Aanleiding (copy-controle fase 4, 8 oktober 2026, bevinding 13). Er stonden
 * drie vormen door elkaar: "FitFi: stijladvies..." op de homepage, "Hoe het
 * werkt: FitFi" in App.tsx en overal elders "Onderwerp [streepje] FitFi". Op de
 * preview hadden Prijzen, Cookies, Disclosure, FAQ en Registreren het streepje.
 *
 * Deze test leest de titels uit de bron: title= bij <Seo>, <title> in een
 * Helmet en og:title. Een titel die alleen uit een variabele komt, zoals
 * LANDING_TITEL op de homepage, slaat hij over; die toetst landingHead.test.ts.
 * Beheerpagina's tellen niet mee, App.tsx wel (daar staan ook hun titels).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");

/** Nog niet omgezet, met reden. Haal een regel weg zodra het bestand meedoet. */
const UITGEZONDERD = new Set([
  // Daar werkt de hoofdsessie tegelijk aan (rapport); de titel "Jouw Style
  // Report" volgt bij het samenvoegen.
  "src/pages/EnhancedResultsPage.tsx",
]);

const BESTANDEN = [
  "src/App.tsx",
  ...readdirSync(join(WORTEL, "src/pages"))
    .filter((naam) => naam.endsWith(".tsx") && !/admin/i.test(naam))
    .map((naam) => `src/pages/${naam}`),
].filter((pad) => !UITGEZONDERD.has(pad));

function titelsIn(bron: string): string[] {
  const uit: string[] = [];
  for (const m of bron.matchAll(/<Seo\b[^>]*?\btitle=(?:"([^"]*)"|\{`([^`]*)`\})/g)) uit.push(m[1] ?? m[2]);
  for (const m of bron.matchAll(/<title>([\s\S]*?)<\/title>/g)) uit.push(m[1]);
  for (const m of bron.matchAll(/property="og:title" content="([^"]*)"/g)) uit.push(m[1]);
  return uit;
}

const TITELS = BESTANDEN.flatMap((pad) =>
  titelsIn(readFileSync(join(WORTEL, pad), "utf8"))
    .filter((titel) => titel.includes("FitFi"))
    .map((titel) => ({ pad, titel })),
);

describe("paginatitels", () => {
  it("vindt de titels van App.tsx en de pagina's", () => {
    expect(TITELS.length).toBeGreaterThan(40);
  });

  it('staan in de vorm "Onderwerp | FitFi", zonder streepje', () => {
    const fout = TITELS.filter(
      ({ titel }) =>
        /[–—]|\s-\s/.test(titel) ||
        !titel.split("FitFi").slice(0, -1).every((ervoor) => ervoor.endsWith("| ")),
    ).map(({ pad, titel }) => `${pad}: ${titel}`);
    expect(fout).toEqual([]);
  });
});
