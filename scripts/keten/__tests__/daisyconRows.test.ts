/**
 * De omzetting van een Daisycon-feedproduct naar een rij voor `products`.
 *
 * Aanleiding (8 oktober 2026): die omzetting zat in de edge function zelf. Het
 * Mac-script dat de H&M-feed synchroniseert moet exact dezelfde filters en
 * velden gebruiken, anders ontstaan twee verschillende catalogi. Beide laden
 * nu supabase/functions/_shared/daisyconRows.ts. Deze test legt vast wat daar
 * uitkomt voor de gevallen die in de echte H&M-feed voorkomen.
 */
import { describe, expect, it } from "vitest";
import { mapFeedProduct, type FeedProduct } from "../../../supabase/functions/_shared/daisyconRows";

const NU = "2026-10-08T12:00:00.000Z";
const OPTIES = { programName: "H&M (NL)", nu: NU };

const feedProduct = (info: Record<string, unknown> = {}, update: Record<string, unknown> = {}): FeedProduct => ({
  update_info: { daisycon_unique_id: "abc123", status: "active", ...update },
  product_info: {
    title: "H & M - Katoenen T-shirt - Wit",
    brand: "H & M",
    description: "Een T-shirt van zachte katoenen jersey.",
    category_path: "Clothing|Shirts & Tops|T-shirts",
    price: "9.99",
    price_old: "12.99",
    gender_target: "female",
    in_stock: "true",
    size: "M",
    sku: "431499967719618814943342",
    color_primary: "Wit",
    keywords: "",
    link: "https://jf79.net/c/?si=17004&li=1&wi=418695&pid=abc123&ws=fitfihm",
    images: [
      { size: "medium", tag: "", type: "image", location: "https://image.hm.com/klein.jpg" },
      { size: "large", tag: "default", type: "image", location: "https://image.hm.com/groot.jpg" },
    ],
    ...info,
  },
});

describe("mapFeedProduct: een gewoon product", () => {
  const uit = mapFeedProduct(feedProduct(), OPTIES);
  if (!("rij" in uit)) throw new Error("verwachtte een rij, kreeg: " + uit.overgeslagen);
  const rij = uit.rij;

  it("neemt de identiteit en de bron over", () => {
    expect(rij.external_id).toBe("abc123");
    expect(rij.source).toBe("daisycon");
    expect(rij.retailer).toBe("H&M (NL)");
    expect(rij.sku).toBe("431499967719618814943342");
  });

  it("zet prijs, oorspronkelijke prijs en voorraad", () => {
    expect(rij.price).toBe(9.99);
    expect(rij.original_price).toBe(12.99);
    expect(rij.in_stock).toBe(true);
  });

  it("gebruikt de grote standaardfoto en bewaart alle foto's", () => {
    expect(rij.image_url).toBe("https://image.hm.com/groot.jpg");
    expect(rij.images).toEqual(["https://image.hm.com/klein.jpg", "https://image.hm.com/groot.jpg"]);
  });

  it("zet dezelfde affiliate-link in alle drie de kolommen", () => {
    const link = "https://jf79.net/c/?si=17004&li=1&wi=418695&pid=abc123&ws=fitfihm";
    expect(rij.affiliate_url).toBe(link);
    expect(rij.affiliate_link).toBe(link);
    expect(rij.product_url).toBe(link);
  });

  it("classificeert categorie en geslacht en zet de maat in een lijst", () => {
    expect(rij.category).toBe("top");
    expect(rij.gender).toBe("female");
    expect(rij.sizes).toEqual(["M"]);
    expect(rij.is_kids).toBe(false);
  });

  it("zet updated_at op het meegegeven moment en voegt geen campaign_id toe zonder campagne", () => {
    expect(rij.updated_at).toBe(NU);
    expect("campaign_id" in rij).toBe(false);
  });
});

describe("mapFeedProduct: wat er overgeslagen wordt", () => {
  const reden = (p: FeedProduct) => {
    const uit = mapFeedProduct(p, OPTIES);
    return "overgeslagen" in uit ? uit.overgeslagen : "rij";
  };

  it("een inactief of verwijderd product", () => {
    expect(reden(feedProduct({}, { status: "inactive" }))).toBe("status");
    expect(reden(feedProduct({}, { status: "deleted" }))).toBe("status");
  });

  it("babykleding valt weg op trefwoord, ondergoed op classificatie (geen mode voor deze site)", () => {
    expect(reden(feedProduct({ category_path: "Clothing|Baby & Toddler Clothing|Rompers", title: "H & M - Romper - Wit" }))).toBe("geen-mode");
    // "Boxershort" raakt het trefwoord "boxer" niet (geen woordgrens); de classifier noemt het underwear.
    expect(reden(feedProduct({ title: "H & M - Boxershort - Zwart", category_path: "Clothing|Underwear & Socks|Boxers" }))).toBe("categorie-other");
  });

  it("iets wat geen kleding blijkt na classificatie", () => {
    expect(reden(feedProduct({ title: "H & M - Windlicht", description: "Windlicht van glas.", category_path: "Home|" }))).toBe("categorie-other");
  });

  it("een product zonder id of zonder naam", () => {
    expect(reden(feedProduct({ sku: "" }, { daisycon_unique_id: "" }))).toBe("zonder-id-of-naam");
    expect(reden(feedProduct({ title: "" }))).toBe("zonder-id-of-naam");
  });

  it("valt terug op de sku als er geen daisycon-id is", () => {
    const uit = mapFeedProduct(feedProduct({}, { daisycon_unique_id: "" }), OPTIES);
    expect("rij" in uit && uit.rij.external_id).toBe("431499967719618814943342");
  });

  it("een product zonder link", () => {
    expect(reden(feedProduct({ link: "" }))).toBe("zonder-link");
  });
});

describe("mapFeedProduct: randgevallen", () => {
  const rijVan = (p: FeedProduct, opties = OPTIES) => {
    const uit = mapFeedProduct(p, opties);
    if (!("rij" in uit)) throw new Error("geen rij: " + uit.overgeslagen);
    return uit.rij;
  };

  it("een lege of nul oorspronkelijke prijs wordt null, geen kapotte invoer voor de database", () => {
    expect(rijVan(feedProduct({ price_old: "" })).original_price).toBeNull();
    expect(rijVan(feedProduct({ price_old: "0" })).original_price).toBeNull();
    expect(rijVan(feedProduct({ price_old: undefined })).original_price).toBeNull();
  });

  it("voorraad false of 0 of out_of_stock is niet op voorraad", () => {
    expect(rijVan(feedProduct({ in_stock: "false" })).in_stock).toBe(false);
    expect(rijVan(feedProduct({ in_stock: "0" })).in_stock).toBe(false);
    expect(rijVan(feedProduct({ in_stock: "out_of_stock" })).in_stock).toBe(false);
  });

  it("een expliciete kinderleeftijd markeert het product als kids", () => {
    expect(rijVan(feedProduct({ age_group: "kids" })).is_kids).toBe(true);
  });

  it("zet campaign_id als er een campagne is", () => {
    expect(rijVan(feedProduct(), { ...OPTIES, campaignId: "11111111-1111-1111-1111-111111111111" }).campaign_id).toBe(
      "11111111-1111-1111-1111-111111111111"
    );
  });

  it("valt terug op de programmanaam als het merk ontbreekt", () => {
    expect(rijVan(feedProduct({ brand: "" })).brand).toBe("H&M (NL)");
  });
});
