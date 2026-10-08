/**
 * Het plan: welke databaserij hoort bij welke feedregel, wat is verdwenen en
 * wat is nieuw. Zuivere logica; geen database en geen netwerk.
 *
 * Eerst op external_id (zolang de feed stabiel is hoeft er niets meer). Wat
 * dan overblijft wordt op de natuurlijke sleutel van het profiel gekoppeld:
 * de ID's veranderden tussen maart en oktober 2026, de artikelen niet.
 */
import { describe, expect, it } from "vitest";
import { maakPlan, naarFeedRij, type DbRij, type FeedRij } from "../feed-sync/plan";
import { HM_PROFIEL } from "../feed-sync/profielen";

const feed = (id: string, extra: Partial<FeedRij> = {}): FeedRij => ({
  id,
  sleutel: null,
  price: 10,
  priceOld: null,
  link: `https://x/${id}`,
  image: `https://img/${id}.jpg`,
  images: [`https://img/${id}.jpg`],
  inStock: true,
  ...extra,
});
const db = (id: string, extra: Partial<DbRij> = {}): DbRij => ({
  id: `uuid-${id}`,
  external_id: id,
  price: 10,
  original_price: null,
  in_stock: true,
  affiliate_url: `https://x/${id}`,
  image_url: `https://img/${id}.jpg`,
  sleutel: null,
  ...extra,
});

describe("maakPlan: koppelen op id", () => {
  it("koppelt rijen met hetzelfde id en meldt niets als er niets veranderde", () => {
    const plan = maakPlan([feed("a")], [db("a")]);
    expect(plan.koppelingen).toHaveLength(1);
    expect(plan.koppelingen[0].via).toBe("id");
    expect(Object.values(plan.koppelingen[0].wijzigt).some(Boolean)).toBe(false);
    expect(plan.verdwenen).toEqual([]);
    expect(plan.nieuw).toEqual([]);
  });

  it("ziet een prijswijziging op de cent, en niet op een afrondingsverschil", () => {
    const zelfde = maakPlan([feed("a", { price: 9.99 })], [db("a", { price: 9.990001 })]);
    expect(zelfde.koppelingen[0].wijzigt.prijs).toBe(false);
    const anders = maakPlan([feed("a", { price: 10.0 })], [db("a", { price: 9.99 })]);
    expect(anders.koppelingen[0].wijzigt.prijs).toBe(true);
  });

  it("ziet een wijziging van de oorspronkelijke prijs, ook van null naar een bedrag", () => {
    const p = maakPlan([feed("a", { priceOld: 19.99 })], [db("a", { original_price: null })]);
    expect(p.koppelingen[0].wijzigt.oudePrijs).toBe(true);
    const gelijk = maakPlan([feed("a", { priceOld: null })], [db("a", { original_price: null })]);
    expect(gelijk.koppelingen[0].wijzigt.oudePrijs).toBe(false);
  });

  it("ziet een nieuwe link of een nieuw beeld", () => {
    const p = maakPlan([feed("a", { link: "https://nieuw", image: "https://img/nieuw.jpg" })], [db("a")]);
    expect(p.koppelingen[0].wijzigt.link).toBe(true);
    expect(p.koppelingen[0].wijzigt.beeld).toBe(true);
  });

  it("een rij die uit voorraad stond maar weer in de feed staat, is weer op voorraad", () => {
    const p = maakPlan([feed("a")], [db("a", { in_stock: false })]);
    expect(p.koppelingen[0].wijzigt.voorraad).toBe(true);
  });
});

describe("maakPlan: koppelen op de natuurlijke sleutel als het id veranderde", () => {
  it("koppelt een oude rij aan een nieuwe feedregel met dezelfde sleutel en meldt dat het id wisselt", () => {
    const plan = maakPlan([feed("nieuw1", { sleutel: "123|m" })], [db("oud1", { sleutel: "123|m" })]);
    expect(plan.koppelingen).toHaveLength(1);
    expect(plan.koppelingen[0].via).toBe("sleutel");
    expect(plan.koppelingen[0].wijzigt.externalId).toBe(true);
    expect(plan.nieuw).toEqual([]);
    expect(plan.verdwenen).toEqual([]);
  });

  it("een id-koppeling gaat voor: een rij die op id past pakt geen feedregel weg van een andere op sleutel", () => {
    const f1 = feed("x1", { sleutel: "9|m" });
    const f2 = feed("x2", { sleutel: "9|m" });
    const plan = maakPlan([f1, f2], [db("x1", { sleutel: "9|m" }), db("oud", { sleutel: "9|m" })]);
    const viaId = plan.koppelingen.find((k) => k.via === "id");
    const viaSleutel = plan.koppelingen.find((k) => k.via === "sleutel");
    expect(viaId?.feed.id).toBe("x1");
    expect(viaSleutel?.feed.id).toBe("x2");
    expect(viaSleutel?.db.external_id).toBe("oud");
  });

  it("koppelt één op één: twee oude rijen met dezelfde sleutel en één feedregel laten één rij verdwijnen", () => {
    const plan = maakPlan([feed("n", { sleutel: "5|l" })], [db("o1", { sleutel: "5|l" }), db("o2", { sleutel: "5|l" })]);
    expect(plan.koppelingen).toHaveLength(1);
    expect(plan.verdwenen).toHaveLength(1);
  });

  it("is niet afhankelijk van de volgorde van de invoer", () => {
    const f = [feed("n1", { sleutel: "1|m" }), feed("n2", { sleutel: "1|m" })];
    const d = [db("o1", { sleutel: "1|m" }), db("o2", { sleutel: "1|m" })];
    const een = maakPlan(f, d).koppelingen.map((k) => `${k.db.external_id}>${k.feed.id}`).sort();
    const twee = maakPlan([...f].reverse(), [...d].reverse()).koppelingen.map((k) => `${k.db.external_id}>${k.feed.id}`).sort();
    expect(een).toEqual(twee);
  });

  it("rijen zonder sleutel worden nooit op sleutel gekoppeld", () => {
    const plan = maakPlan([feed("n", { sleutel: null })], [db("o", { sleutel: null })]);
    expect(plan.koppelingen).toEqual([]);
    expect(plan.verdwenen).toHaveLength(1);
    expect(plan.nieuw).toHaveLength(1);
  });
});

describe("maakPlan: verdwenen en nieuw", () => {
  it("een rij die op voorraad stond en niet meer in de feed zit is verdwenen", () => {
    const plan = maakPlan([], [db("a"), db("b")]);
    expect(plan.verdwenen.map((r) => r.external_id).sort()).toEqual(["a", "b"]);
  });

  it("een rij die al uit voorraad stond telt als 'reeds uit', niet als verdwenen", () => {
    const plan = maakPlan([], [db("a", { in_stock: false }), db("b")]);
    expect(plan.verdwenen.map((r) => r.external_id)).toEqual(["b"]);
    expect(plan.reedsUit).toBe(1);
  });

  it("een feedregel zonder partner is nieuw", () => {
    const plan = maakPlan([feed("a"), feed("z")], [db("a")]);
    expect(plan.nieuw.map((r) => r.id)).toEqual(["z"]);
  });

  it("telt alles op: elke databaserij is gekoppeld, verdwenen of reeds uit", () => {
    const f = [feed("a"), feed("n", { sleutel: "1|m" }), feed("nieuw")];
    const d = [db("a"), db("o", { sleutel: "1|m" }), db("weg"), db("al-uit", { in_stock: false })];
    const plan = maakPlan(f, d);
    expect(plan.koppelingen.length + plan.verdwenen.length + plan.reedsUit).toBe(d.length);
    expect(plan.koppelingen.length + plan.nieuw.length).toBe(f.length);
  });
});

describe("naarFeedRij", () => {
  const link = "https://jf79.net/c/?pid=p&dl=link%3Fid%3D1%26murl%3Dhttps%253A%252F%252Fwww2.hm.com%252Fnl_nl%252Fproductpage.1350214002.html&ws=fitfihm";
  const product = (extra = {}) => ({
    update_info: { daisycon_unique_id: "id1", status: "active" },
    product_info: {
      price: "22.99",
      price_old: "29.99",
      link,
      size: "XS",
      in_stock: "true",
      images: [{ size: "large", tag: "default", location: "https://img/groot.jpg" }, { size: "medium", location: "https://img/klein.jpg" }],
      ...extra,
    },
  });

  it("zet een feedproduct om naar de velden die het plan vergelijkt", () => {
    const rij = naarFeedRij(product(), HM_PROFIEL);
    expect(rij).toEqual({
      id: "id1",
      sleutel: "1350214002|xs",
      price: 22.99,
      priceOld: 29.99,
      link,
      image: "https://img/groot.jpg",
      images: ["https://img/groot.jpg", "https://img/klein.jpg"],
      inStock: true,
    });
  });

  it("een inactief of uitverkocht product is niet op voorraad, een product zonder id bestaat niet", () => {
    expect(naarFeedRij(product({ in_stock: "false" }), HM_PROFIEL)?.inStock).toBe(false);
    expect(naarFeedRij({ ...product(), update_info: { daisycon_unique_id: "id1", status: "inactive" } }, HM_PROFIEL)?.inStock).toBe(false);
    expect(naarFeedRij({ ...product(), update_info: { daisycon_unique_id: "", status: "active" } }, HM_PROFIEL)).toBeNull();
  });

  it("zonder profiel is de sleutel null", () => {
    expect(naarFeedRij(product(), null)?.sleutel).toBeNull();
  });
});
