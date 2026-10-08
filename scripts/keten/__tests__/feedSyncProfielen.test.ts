/**
 * H&M heeft sinds april andere product-ID's in de Daisycon-feed dan in de
 * import van maart: van de 88.043 rijen in de database had er geen enkele nog
 * dezelfde external_id in de feed. Het artikelnummer in de productpagina-URL
 * en de maat zijn wel gebleven. Die twee vormen de sleutel waarmee een
 * oude rij aan een nieuwe feedregel wordt gekoppeld, zodat tags, embeddings en
 * de pool bewaard blijven.
 */
import { describe, expect, it } from "vitest";
import { artikelUitLink, HM_PROFIEL, profielVoor } from "../feed-sync/profielen";

// Echte vorm uit de feed van 8 oktober 2026: de productpagina zit twee keer URL-gecodeerd in de dl-parameter.
const FEED_LINK =
  "https://jf79.net/c/?si=17004&li=1740343&wi=418695&pid=033a564183ea8ee6e0856e9c3d768c70&dl=link%3Fid%3Dp5Zs8TJlngw%26offerid%3D1577657.431499967719618814943342%26type%3D15%26murl%3Dhttps%253A%252F%252Fwww2.hm.com%252Fnl_nl%252Fproductpage.1350214002.html&ws=fitfihm";
// Echte vorm uit de database (import van maart): dl één keer gecodeerd, met utm-parameter.
const DB_LINK =
  "https://jf79.net/c/?si=17004&li=1740343&wi=418695&pid=0001b3aba7a6533a377f67141298e817&dl=link%3Fid%3Dp5Zs8TJlngw%26offerid%3D1577657.431491314869009004%26type%3D15%26murl%3Dhttps%3A%2F%2Fwww2.hm.com%2Fnl_nl%2Fproductpage.1314869009.html%3Futm_campaign%3Dpi_NLA1907X301222&ws=fitfihm";

describe("artikelUitLink", () => {
  it("haalt het artikelnummer uit de feedlink", () => {
    expect(artikelUitLink(FEED_LINK)).toBe("1350214002");
  });

  it("haalt het artikelnummer uit de link van de oude import", () => {
    expect(artikelUitLink(DB_LINK)).toBe("1314869009");
  });

  it("geeft null als er geen productpagina in de link zit", () => {
    expect(artikelUitLink("https://example.com/iets")).toBeNull();
    expect(artikelUitLink("")).toBeNull();
    expect(artikelUitLink(null)).toBeNull();
    expect(artikelUitLink(undefined)).toBeNull();
  });
});

describe("HM_PROFIEL", () => {
  it("maakt de sleutel uit artikel en maat, in kleine letters en zonder spaties eromheen", () => {
    expect(HM_PROFIEL.feedSleutel({ product_info: { link: FEED_LINK, size: " XS " } })).toBe("1350214002|xs");
    expect(HM_PROFIEL.dbSleutel({ affiliate_url: DB_LINK, sizes: ["M"] })).toBe("1314869009|m");
  });

  it("geeft dezelfde sleutel aan dezelfde artikel-maat uit feed en database", () => {
    const feed = HM_PROFIEL.feedSleutel({ product_info: { link: FEED_LINK, size: "L" } });
    const db = HM_PROFIEL.dbSleutel({ affiliate_url: FEED_LINK.replace("&ws=fitfihm", "&ws="), sizes: ["l"] });
    expect(feed).toBe(db);
  });

  it("een product zonder maat krijgt een sleutel met een lege maat (454 oude rijen en 118 feedrijen hebben er geen)", () => {
    expect(HM_PROFIEL.feedSleutel({ product_info: { link: FEED_LINK, size: "" } })).toBe("1350214002|");
    expect(HM_PROFIEL.dbSleutel({ affiliate_url: DB_LINK, sizes: [] })).toBe("1314869009|");
    expect(HM_PROFIEL.dbSleutel({ affiliate_url: DB_LINK, sizes: null })).toBe("1314869009|");
  });

  it("zonder artikelnummer is er geen sleutel", () => {
    expect(HM_PROFIEL.feedSleutel({ product_info: { link: "https://x/y", size: "M" } })).toBeNull();
    expect(HM_PROFIEL.dbSleutel({ affiliate_url: null, sizes: ["M"] })).toBeNull();
  });
});

describe("profielVoor", () => {
  it("kent H&M (NL) en niemand anders", () => {
    expect(profielVoor("H&M (NL)")).toBe(HM_PROFIEL);
    expect(profielVoor("Giglio (INT)")).toBeNull();
  });
});
