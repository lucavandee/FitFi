/**
 * De vangrails van een feed-sync. Een feed die leeg, afgekapt of veel te klein
 * is mag nooit leiden tot "alles uit voorraad": de H&M-feed gaf tot 8 oktober
 * 2026 HTTP 204 (een lege respons) op de opgeslagen URL.
 */
import { describe, expect, it } from "vitest";
import { beoordeel, type BewakingInvoer } from "../feed-sync/bewaking";
import type { DbRij, FeedRij, Koppeling, Plan } from "../feed-sync/plan";

const dbRij = (n: number): DbRij => ({
  id: `u${n}`, external_id: `e${n}`, price: 10, original_price: null, in_stock: true, affiliate_url: null, image_url: null, sleutel: null,
});
const feedRij = (n: number): FeedRij => ({ id: `f${n}`, sleutel: null, price: 10, priceOld: null, link: "", image: "", images: [], inStock: true });
const koppeling = (n: number, via: "id" | "sleutel"): Koppeling => ({
  db: dbRij(n), feed: feedRij(n), via,
  wijzigt: { externalId: false, prijs: false, oudePrijs: false, link: false, beeld: false, voorraad: false },
});
const plan = (extra: Partial<Plan> = {}): Plan => ({ koppelingen: [], verdwenen: [], reedsUit: 0, nieuw: [], dubbeleFeedIds: 0, ...extra });

const basis = (extra: Partial<BewakingInvoer> = {}): BewakingInvoer => ({
  feedAantalGelezen: 1000,
  feedAantalKop: 1000,
  dbRijen: 900,
  dbInStock: 800,
  plan: plan(),
  staVeelWegToe: false,
  fase: "b",
  ...extra,
});

describe("beoordeel: een gezonde sync", () => {
  it("geeft geen fouten en geen waarschuwingen", () => {
    const o = beoordeel(basis({ plan: plan({ verdwenen: Array.from({ length: 40 }, (_, i) => dbRij(i)) }) }));
    expect(o.fouten).toEqual([]);
    expect(o.waarschuwingen).toEqual([]);
  });
});

describe("beoordeel: een kapotte feed", () => {
  it("een lege feed is een fout", () => {
    const o = beoordeel(basis({ feedAantalGelezen: 0, feedAantalKop: null }));
    expect(o.fouten.join(" ")).toMatch(/geen producten/);
  });

  it("een afgekapte feed (minder producten dan de kop belooft) is een fout", () => {
    const o = beoordeel(basis({ feedAantalGelezen: 600, feedAantalKop: 1000 }));
    expect(o.fouten.join(" ")).toMatch(/kop belooft 1000.*600/);
  });

  it("een feed zonder aantal in de kop wordt niet op dat punt afgekeurd", () => {
    const o = beoordeel(basis({ feedAantalKop: null }));
    expect(o.fouten).toEqual([]);
  });

  it("een feed die minder dan de helft is van wat nu op voorraad staat is een fout", () => {
    const o = beoordeel(basis({ feedAantalGelezen: 300, feedAantalKop: 300, dbInStock: 800 }));
    expect(o.fouten.join(" ")).toMatch(/minder dan de helft/);
  });
});

describe("beoordeel: hoeveel verdwijnt er", () => {
  const weg = (n: number) => plan({ verdwenen: Array.from({ length: n }, (_, i) => dbRij(i)) });

  it("meer dan de helft van wat op voorraad staat is een fout, tenzij dat bewust is toegestaan", () => {
    const zonder = beoordeel(basis({ plan: weg(500) }));
    expect(zonder.fouten.join(" ")).toMatch(/helft/);
    const met = beoordeel(basis({ plan: weg(500), staVeelWegToe: true }));
    expect(met.fouten).toEqual([]);
    expect(met.waarschuwingen.join(" ")).toMatch(/62\.5|63|62,5/);
  });

  it("in fase a en in een droge run is veel verdwijnen een waarschuwing: fase a zet niets uit voorraad", () => {
    for (const fase of ["a", null] as const) {
      const o = beoordeel(basis({ plan: weg(500), fase }));
      expect(o.fouten, `fase ${fase}`).toEqual([]);
      expect(o.waarschuwingen.join(" "), `fase ${fase}`).toMatch(/fase b/);
    }
  });

  it("in fase b en bij alles blijft het een fout zonder toestemming", () => {
    for (const fase of ["b", "alles"] as const) {
      expect(beoordeel(basis({ plan: weg(500), fase })).fouten.join(" "), `fase ${fase}`).toMatch(/helft/);
    }
  });

  it("tussen een vijfde en de helft is een waarschuwing", () => {
    const o = beoordeel(basis({ plan: weg(200) }));
    expect(o.fouten).toEqual([]);
    expect(o.waarschuwingen.join(" ")).toMatch(/25/);
  });
});

describe("beoordeel: overige signalen", () => {
  it("meldt als rijen op sleutel herkoppeld zijn, omdat de ID's veranderden", () => {
    const o = beoordeel(basis({ plan: plan({ koppelingen: [koppeling(1, "sleutel"), koppeling(2, "sleutel"), koppeling(3, "id")] }) }));
    expect(o.info.join(" ")).toMatch(/2 rijen.*sleutel/);
  });

  it("waarschuwt voor dubbele id's in de feed", () => {
    const o = beoordeel(basis({ plan: plan({ dubbeleFeedIds: 3 }) }));
    expect(o.waarschuwingen.join(" ")).toMatch(/3.*dubbel/);
  });

  it("waarschuwt als er meer dan tweemaal zoveel nieuwe rijen zijn als er al staan", () => {
    const o = beoordeel(basis({ dbRijen: 100, plan: plan({ nieuw: Array.from({ length: 250 }, (_, i) => feedRij(i)) }) }));
    expect(o.waarschuwingen.join(" ")).toMatch(/nieuwe rijen/);
  });
});
