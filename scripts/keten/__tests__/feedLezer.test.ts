/**
 * De Daisycon-feed van H&M is 237 MB aan JSON. Dat past niet in een edge
 * function en je wilt het ook niet in één keer in het geheugen van de Mac
 * zetten. De lezer haalt de producten één voor één uit een stroom bytes, op
 * elke chunkgrens, en geeft de kop van de feed apart terug.
 */
import { describe, expect, it } from "vitest";
import { leesFeed } from "../feed-sync/feedLezer";

const product = (id: string, titel: string) => ({
  update_info: { daisycon_unique_id: id, status: "active" },
  product_info: {
    title: titel,
    price: "9.99",
    images: [{ size: "large", tag: "default", type: "image", location: `https://x/${id}.jpg` }],
  },
});

const feedTekst = (producten: unknown[], kop: Record<string, unknown> = {}) =>
  `{"datafeed":{"info":{"category":"Fashion","product_count":${producten.length},"last_modified":"2026-10-08 09:07:16","date_created":"2026-10-08 14:05:22"},` +
  `"programs":[ {"program_info":{"id":17004,"name":"H&M (NL)","currency":"EUR","product_count":${producten.length}${
    Object.keys(kop).length ? "," + JSON.stringify(kop).slice(1, -1) : ""
  }},"products":[ ${producten.map((p) => JSON.stringify(p)).join(",\n ")}]} ]}}`;

async function* inStukken(tekst: string, grootte: number): AsyncGenerator<Uint8Array> {
  const bytes = new TextEncoder().encode(tekst);
  for (let i = 0; i < bytes.length; i += grootte) yield bytes.slice(i, i + grootte);
}

async function lees(tekst: string, grootte: number) {
  const gelezen: { update_info?: { daisycon_unique_id?: string }; product_info?: { title?: string } }[] = [];
  const uit = await leesFeed(inStukken(tekst, grootte), (p) => {
    gelezen.push(p as (typeof gelezen)[number]);
  });
  return { gelezen, ...uit };
}

describe("leesFeed", () => {
  const producten = [
    product("a1", "Gewoon shirt"),
    product("b2", 'Titel met "aanhalingstekens" en {accolades} en \\ een backslash'),
    product("c3", "Ünïcödé 👗 en een } sluitaccolade"),
    product("d4", "Laatste"),
  ];
  const tekst = feedTekst(producten);

  it("leest alle producten in volgorde, ook als de chunks maar één byte groot zijn", async () => {
    for (const grootte of [1, 2, 3, 7, 64, 100_000]) {
      const { gelezen } = await lees(tekst, grootte);
      expect(gelezen.map((p) => p.update_info?.daisycon_unique_id), `chunkgrootte ${grootte}`).toEqual(["a1", "b2", "c3", "d4"]);
    }
  });

  it("geeft de inhoud van de producten ongewijzigd door, ook met speciale tekens", async () => {
    const { gelezen } = await lees(tekst, 5);
    expect(gelezen[1].product_info?.title).toBe('Titel met "aanhalingstekens" en {accolades} en \\ een backslash');
    expect(gelezen[2].product_info?.title).toBe("Ünïcödé 👗 en een } sluitaccolade");
  });

  it("geeft de kop terug: aantal volgens de feed, programma en tijdstip", async () => {
    const { kop, aantalGelezen } = await lees(tekst, 11);
    expect(kop.productAantal).toBe(4);
    expect(kop.programmaNaam).toBe("H&M (NL)");
    expect(kop.programmaId).toBe(17004);
    expect(kop.gegenereerd).toBe("2026-10-08 14:05:22");
    expect(aantalGelezen).toBe(4);
  });

  it("een lege productenlijst geeft nul producten en geen fout", async () => {
    const { gelezen, aantalGelezen } = await lees(feedTekst([]), 9);
    expect(gelezen).toEqual([]);
    expect(aantalGelezen).toBe(0);
  });

  it("een afgekapte feed geeft minder producten dan de kop belooft, en geen half product", async () => {
    const afgekapt = tekst.slice(0, tekst.indexOf('"Laatste"') + 4);
    const { gelezen, kop, aantalGelezen } = await lees(afgekapt, 13);
    expect(kop.productAantal).toBe(4);
    expect(aantalGelezen).toBe(3);
    expect(gelezen.map((p) => p.update_info?.daisycon_unique_id)).toEqual(["a1", "b2", "c3"]);
  });

  it("tekst die geen feed is geeft een duidelijke fout", async () => {
    await expect(lees("<html>204 No Content</html>", 8)).rejects.toThrow(/products/);
  });
});
