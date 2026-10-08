/**
 * Eén Daisycon-feedproduct omzetten naar een rij voor `products`.
 *
 * Eén plek, twee gebruikers: de edge function import-daisycon-feed en het
 * Mac-script scripts/keten/feed-sync.ts. Voor 8 oktober 2026 stond dit blok in
 * de edge function zelf, zodat een tweede import-pad (het script) dezelfde
 * filters en dezelfde indeling had moeten kopiëren. De hulpfuncties hieronder
 * zijn letterlijk verplaatst; alleen de parameters hebben typen gekregen.
 *
 * Bewust zonder Deno- of Node-specifieke imports, zodat Deno (edge function) en
 * vite-node (script en tests) hem allebei laden.
 */
import { classifyProductRaw } from "./productClassifier.ts";

export interface FeedImage {
  size?: string;
  tag?: string;
  type?: string;
  location?: string;
}

export interface FeedProductInfo {
  title?: string;
  price?: number | string;
  price_old?: number | string | null;
  brand?: string;
  category?: string;
  category_path?: string;
  color_primary?: string;
  sku?: string;
  description?: string;
  size?: string;
  keywords?: string;
  gender_target?: string;
  age_group?: string;
  in_stock?: string | boolean;
  currency?: string;
  link?: string;
  images?: FeedImage[];
}

export interface FeedProduct {
  update_info?: { daisycon_unique_id?: string; status?: string };
  product_info?: FeedProductInfo;
}

export type Classificatie = ReturnType<typeof classifyProductRaw>;

const EXCLUDED_CATEGORY_KEYWORDS = /\b(kids?|kind|kinderen|children|child|baby|babies|toddler|infant|meisjes?|jongens?|girls?|boys?|peuter|dreumes|newborn|junior|kinder)\b/;

// Non-fashion rejects (home/beauty/underwear/beddengoed/etc). Bewust zonder
// sportartikelen: die staan hieronder in PURE_SPORT_KEYWORDS zodat we die
// apart kunnen splitsen van athleisure.
const EXCLUDED_PRODUCT_KEYWORDS = /\b(poster|muurposter|wall\s?art|wall\s?poster|canvas\s?print|home\s?decor|woonaccessoire|schilderij|fotolijst|cadeau|cadeauset|gift\s?set|phone\s?case|telefoonhoesje|sticker|laptop\s?sleeve|mugshot|mok|cup|pillow\s?case|kussenhoes|gordijn|curtain|tapijt|carpet|rug|bedding|dekbed|matras|mattress|lamp|tafellamp|bureaulamp|staande\s?lamp|plafondlamp|wandlamp|candle|kaars|geurkaars|parfum|perfume|beauty|skincare|makeup|cosmet|lipstick|mascara|nail|haar|hair\s?care|shampoo|conditioner|bodywash|douchegel|deodorant|sunscreen|zonnebrand|supplement|vitamin|nutrition|fiets|bike|toy|speelgoed|game|puzzle|book|boek|dvd|cd|electronics|laptop|tablet|phone|horloge\s?band|pyjama|nachthem|slaappak|badjas|ochtendjas|ondergoed|onderbroek|boxer|bh|bralette|lingerie|sok|sokken|panty|kousen|bikini|badpak|zwembroek|zwemshort|boardshort|slipper|badslip|teenslipper|flip-flop|pantoffel|teenslip|vaas|vases|spiegel|mirrors|knuffel|knuffeldier|romper|kruippak|slab|boxpak|babypak|luier|fopspeen|aankleedkussen|deken|beddengoed|kussensloop|aftershave|bodylotion|bronzer|kwast|multipack|hemd|dishware|glassware|bottles\s?and\s?pitchers|storage\s?and\s?baskets|table\s?lamps|clocks|trays|decorative\s?accessories|kitchen\s?accessories|desk\s?accessories|candle\s?holders|figurines|photo\s?frames|verkleedpak|verkleedset|kostuum(?!pantalon|gilet|broek|vest|jasje|colbert))\b/;

// Alleen pure competitieve sportartikelen. Athleisure (joggers, sneakers,
// hoodies, running shoes, fitness/crossfit/spinning wear) blijft er DOORHEEN
// komen, zodat het ATHLETIC archetype producten krijgt.
const PURE_SPORT_KEYWORDS = /\b(voetbal|football|soccer|voetbalset|voetbalshirt|voetbalschoen|voetbalbroek|keepershandschoen|scheenbeschermer|shin\s?guard|rugby|hockey|handbal|basketbal|wielren|fietsbroek|fietsshirt|wielershirt|trail\s?run|marathon|tennisschoen|tennisrok|golfschoen|golfbroek|wandelschoen|bergschoen|klimschoen|cleat|crampon|sportbeha|sport\s?bh|skibroek|skipak|snowboard|skischoenen|skistok|wintersport|wetsuit|duik|snorkel|surfboard|sport\s?equipment)\b/;

const SPORT_FOOTWEAR_REGEX = /\b(fg|ag|sg|mg|tf|ic)\s*[/\\]\s*(fg|ag|sg|mg|tf|ic)\b/i;
const SET_OF_REGEX = /\bset\s+van\s+\d/i;
const MULTIPACK_REGEX = /\b\d+[- ]?(pack|stuks|set)\b/i;

export function isFashionProduct(title: string, categoryPath: string, description = ""): boolean {
  const text = (title + " " + categoryPath + " " + description).toLowerCase();
  if (EXCLUDED_CATEGORY_KEYWORDS.test(text)) return false;
  if (EXCLUDED_PRODUCT_KEYWORDS.test(text)) return false;
  if (PURE_SPORT_KEYWORDS.test(text)) return false;
  if (SPORT_FOOTWEAR_REGEX.test(title)) return false;
  if (SET_OF_REGEX.test(title)) return false;
  if (MULTIPACK_REGEX.test(title)) return false;
  return true;
}

export function inferCategoryWithConfidence(title: string, description: string, categoryPath: string, brand = ""): Classificatie {
  return classifyProductRaw(title, description, categoryPath, brand);
}

export function inferGender(title: string, genderTarget: string, categoryPath: string): "female" | "male" | "unisex" {
  const g = (genderTarget + " " + categoryPath + " " + title).toLowerCase();
  if (/\b(female|women|woman|vrouw|dames|girl)\b/i.test(g)) return "female";
  if (/\b(male|men|man|heren|boy)\b/i.test(g)) return "male";
  return "unisex";
}

export function inferStyle(title: string, description: string, brand: string): string {
  const text = (title + " " + description + " " + brand).toLowerCase();

  const STREETWEAR_BRANDS = ["stussy", "stüssy", "carhartt", "dickies", "vans", "converse", "supreme", "palace", "the new originals", "daily paper", "filling pieces", "off-white", "champion"];
  const ATHLETIC_BRANDS = ["nike", "adidas", "puma", "new balance", "jordan", "asics", "reebok", "under armour", "on running", "hoka", "salomon", "the north face"];
  const BUSINESS_BRANDS = ["suitsupply", "hugo boss", "boss", "massimo dutti", "ermenegildo zegna", "zegna", "brooks brothers", "canali", "corneliani", "paul smith", "hackett", "charles tyrwhitt", "thomas pink", "t.m.lewin", "olymp", "van laack", "max mara", "reiss", "the kooples", "claudie pierlot", "sandro"];
  const PREMIUM_BRANDS = ["ralph lauren", "tommy hilfiger", "lacoste", "gant", "marc o'polo", "scotch & soda", "ted baker", "calvin klein", "michael kors"];
  const LUXURY_BRANDS = ["gucci", "prada", "balenciaga", "saint laurent", "burberry", "versace", "givenchy", "valentino", "fendi", "bottega veneta", "tom ford", "armani"];
  const AVANT_GARDE_BRANDS = ["rick owens", "rick owens drkshdw", "yohji yamamoto", "comme des garcons", "comme des garçons", "cdg", "maison margiela", "margiela", "mm6", "raf simons", "ann demeulemeester", "dries van noten", "julius", "boris bidjan saberi", "undercover", "sacai", "issey miyake", "helmut lang", "vetements", "acne studios", "our legacy", "lemaire"];
  const MINIMALIST_BRANDS = ["cos", "arket", "uniqlo", "muji", "everlane", "filippa k", "theory", "jil sander", "apc"];

  const brandLower = (brand || "").toLowerCase();

  // Brand hits that clearly signal formalwear lines get routed to BUSINESS
  // even if the brand has casual lines too. Title must hint formal.
  const formalTitleHit = /\b(pak|suit|colbert|blazer|pantalon|overhemd|dress shirt|tailored|single[- ]breasted|double[- ]breasted|tuxedo|smoking|stropdas|vlinderdas|oxford|derby|brogue|monk|gilet|mantelpak|mantelpakje|kokerrok|pencil[-\s]?skirt|blazerjurk|shirtdress|blouse|pumps)\b/.test(text);

  if (BUSINESS_BRANDS.some(b => brandLower.includes(b))) return "business";
  if ((PREMIUM_BRANDS.some(b => brandLower.includes(b)) || brandLower.includes("tommy hilfiger") || brandLower.includes("ralph lauren")) && formalTitleHit) return "business";
  if (AVANT_GARDE_BRANDS.some(b => brandLower.includes(b))) return "avant-garde";
  if (LUXURY_BRANDS.some(b => brandLower.includes(b))) return "luxury";
  if (MINIMALIST_BRANDS.some(b => brandLower.includes(b))) return "minimalist";
  if (ATHLETIC_BRANDS.some(b => brandLower.includes(b))) {
    if (/\b(jogger|jogging|track|hoodie|sweatpant|sweatshirt|tech|performance|training|running|run|tee|tank|fleece|mesh)\b/.test(text)) return "athletic";
    return "streetwear";
  }
  if (STREETWEAR_BRANDS.some(b => brandLower.includes(b))) return "streetwear";
  if (PREMIUM_BRANDS.some(b => brandLower.includes(b))) return "smart-casual";

  if (formalTitleHit) return "business";
  if (/\b(hoodie|hooded|jogger|jogging|cargo|bomber|sneaker|graphic|graffiti|oversized|baggy|wide[- ]?leg|skate|hip[- ]?hop)\b/.test(text)) return "streetwear";
  if (/\b(tech|performance|training|athleisure|track\s?pant|running|jog|gym|workout|fleece|mesh)\b/.test(text)) return "athletic";
  if (/\b(chino|loafer)\b/.test(text)) return "smart-casual";
  if (/\b(effen|basic|clean|minimal|simpel|strak|monochroom)\b/.test(text)) return "minimalist";
  if (/\b(silk|zijde|satin|satijn|cashmere|kasjmier|elegant|luxe|premium|exclusive|high-end)\b/.test(text)) return "luxury";
  if (/\b(t-shirt|polo|jeans|spijkerbroek|sneakers|casual|relaxed|everyday|alledaags)\b/.test(text)) return "casual";

  return "casual";
}

export function extractTags(title: string, description: string, category: string, keywords: string): string[] {
  const tags = [category];
  const text = (title + " " + description + " " + keywords).toLowerCase();
  const colorWords = ["black", "white", "blue", "navy", "red", "green", "grey", "gray", "cream", "ecru", "lime", "moss", "brown", "beige", "pink", "yellow", "orange", "purple", "khaki", "camel", "burgundy", "bordeaux", "olive", "sand", "taupe", "cognac", "coral", "mustard"];
  colorWords.forEach((c) => { if (text.includes(c)) tags.push(c); });
  const materialWords = { cotton: "cotton", katoen: "cotton", nylon: "nylon", linen: "linen", linnen: "linen", wool: "wool", wol: "wool", merino: "merino", denim: "denim", leather: "leather", leer: "leather", "suède": "suede", suede: "suede", fleece: "fleece", polyester: "polyester", viscose: "viscose", jersey: "jersey", corduroy: "corduroy", ribfluweel: "corduroy", canvas: "canvas", silk: "silk", zijde: "silk", cashmere: "cashmere", kasjmier: "cashmere" };
  Object.entries(materialWords).forEach(([k, v]) => { if (text.includes(k)) tags.push(v); });
  if (text.includes("recycled") || text.includes("sustainable")) tags.push("sustainable");
  if (text.includes("embroidered")) tags.push("embroidered");
  if (text.includes("graphic")) tags.push("graphic");
  if (text.includes("print") || text.includes("pattern")) tags.push("printed");
  if (text.includes("stripe") || text.includes("stripes")) tags.push("striped");
  if (text.includes("oversized") || text.includes("oversize")) tags.push("oversized");
  if (text.includes("slim") || text.includes("skinny") || text.includes("fitted")) tags.push("slim");
  if (text.includes("relaxed") || text.includes("loose")) tags.push("relaxed");
  if (text.includes("regular") || text.includes("straight")) tags.push("regular");
  if (text.includes("tailored")) tags.push("tailored");
  if (text.includes("boxy") || text.includes("wide")) tags.push("boxy");
  if (text.includes("cropped") || text.includes("crop")) tags.push("cropped");
  if (text.includes("effen") || text.includes("basic") || text.includes("clean")) tags.push("clean");
  if (text.includes("formal") || text.includes("elegant")) tags.push("formal");
  if (text.includes("casual")) tags.push("casual");
  if (text.includes("classic") || text.includes("klassiek") || text.includes("tijdloos")) tags.push("classic");
  if (text.includes("minimal")) tags.push("minimalist");
  return [...new Set(tags)];
}

export function extractColors(title: string, colorPrimary: string, description: string): string[] {
  const colors: string[] = [];
  if (colorPrimary && colorPrimary.trim()) colors.push(colorPrimary.toLowerCase().trim());
  const colorMap = {
    black: "black", white: "white", blue: "blue", navy: "navy blue",
    red: "red", green: "green", grey: "grey", gray: "grey",
    cream: "cream", ecru: "ecru", lime: "lime green", moss: "moss green",
    brown: "brown", beige: "beige", pink: "pink", yellow: "yellow",
    orange: "orange", khaki: "khaki", camel: "camel", gold: "gold",
  };
  const text = (title + " " + description).toLowerCase();
  Object.entries(colorMap).forEach(([key, val]) => {
    if (text.includes(key) && !colors.includes(val)) colors.push(val);
  });
  return colors.length > 0 ? colors : ["unknown"];
}

export function getDefaultImage(images: FeedImage[] | undefined): string {
  if (!images || images.length === 0) return "";
  const defaultImg = images.find((i) => i.tag === "default" && i.size === "large");
  if (defaultImg) return defaultImg.location ?? "";
  const large = images.find((i) => i.size === "large");
  return large?.location ?? images[0]?.location ?? "";
}

export function getAllImages(images: FeedImage[] | undefined): string[] {
  if (!images || images.length === 0) return [];
  return [...new Set(images.map((i) => i.location).filter((l): l is string => Boolean(l)))];
}

export function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Kids keyword regex for age_group and text fields, used at import time */
const KIDS_AGE_GROUPS = /^(kids?|children|infant|toddler|baby|newborn|kinderen|peuter|kleuter)$/i;

/** EU kids sizes (height in cm) */
const EU_KIDS_SIZES = new Set([
  '50','56','62','68','74','80','86','92','98','104','110','116',
  '122','128','134','140','146','152','158','164','170','176',
]);
const ADULT_SIZE_RE = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|ONE SIZE)$/i;

export function isKidsProductAtImport(title: string, description: string, categoryPath: string, ageGroup: string, size: string, imageUrl: string): boolean {
  // 1. Explicit age_group (strongest signal)
  if (ageGroup && KIDS_AGE_GROUPS.test(ageGroup.trim())) return true;
  // 2. Size-based detection
  const s = (size || "").trim();
  // 2a. Pure EU kids size (e.g. "110", "128")
  if (s && /^\d{2,3}$/.test(s) && EU_KIDS_SIZES.has(s) && !ADULT_SIZE_RE.test(s)) return true;
  // 2b. Compound kids size with age indicator (e.g. "110/116 (4-6Y)", "86 (12-18M)", "104 (3-4Y)")
  if (s && /\d+\s*\/?\s*\d*\s*\(\d+[-–]\d+\s*[YM]\)/i.test(s)) return true;
  // 2c. Age-only size (e.g. "4-6Y", "12-18M")
  if (s && /^\d{1,2}\s*[-–]\s*\d{1,2}\s*[YM]$/i.test(s)) return true;
  // 3. Image URL path
  if (imageUrl && /\/(kids|children|kinder|junior|boys|girls)\//.test(imageUrl)) return true;
  return false;
}

export interface ProductRij {
  external_id: string;
  source: "daisycon";
  name: string;
  brand: string;
  price: number;
  original_price: number | null;
  image_url: string;
  images: string[];
  retailer: string;
  affiliate_url: string;
  affiliate_link: string;
  product_url: string;
  category: string;
  gender: string;
  style: string;
  description: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  sku: string | null;
  in_stock: boolean;
  is_kids: boolean;
  rating: null;
  review_count: number;
  updated_at: string;
  campaign_id?: string;
}

/** Waarom een feedregel geen rij wordt. Het script telt dit per reden. */
export type OverslaanReden = "status" | "geen-mode" | "categorie-other" | "zonder-id-of-naam" | "zonder-link";

export interface RijOpties {
  programName: string;
  campaignId?: string | null;
  /** Voor tests: het tijdstip dat in updated_at komt. */
  nu?: string;
}

export type MapUitkomst = { rij: ProductRij; classificatie: Classificatie } | { overgeslagen: OverslaanReden };

/**
 * Dezelfde filters en velden als de import in maart, in dezelfde volgorde:
 * status, mode-filter, classificatie ("other" valt weg), dan id, naam en link.
 */
export function mapFeedProduct(p: FeedProduct, opties: RijOpties): MapUitkomst {
  const status = p.update_info?.status;
  if (status === "inactive" || status === "deleted") return { overgeslagen: "status" };

  const info: FeedProductInfo = p.product_info ?? {};
  if (!isFashionProduct(info.title || "", info.category_path || "", info.description || "")) {
    return { overgeslagen: "geen-mode" };
  }

  const description = stripHtml(info.description ?? "");
  const brandName = info.brand?.trim() || opties.programName;
  const classificatie = inferCategoryWithConfidence(info.title || "", description, info.category_path ?? "", brandName);
  const category = classificatie.category === "underwear" ? "other" : classificatie.category;
  if (category === "other") return { overgeslagen: "categorie-other" };

  const externalId = p.update_info?.daisycon_unique_id || info.sku || "";
  const name = info.title || "";
  if (!externalId || !name) return { overgeslagen: "zonder-id-of-naam" };
  // Zonder link is er niets om naartoe te sturen en niets te verdienen.
  const link = info.link || "";
  if (!link) return { overgeslagen: "zonder-link" };

  const imageUrl = getDefaultImage(info.images ?? []);
  const voorraad = String(info.in_stock ?? "true");
  const prijsOud = Number(info.price_old);

  const rij: ProductRij = {
    external_id: externalId,
    source: "daisycon",
    name,
    brand: brandName,
    price: Number(info.price) || 0,
    // Een lege of nul-waarde ("" of "0") is geen oorspronkelijke prijs; de database
    // weigert "" voor een numeric.
    original_price: Number.isFinite(prijsOud) && prijsOud > 0 ? prijsOud : null,
    image_url: imageUrl,
    images: getAllImages(info.images ?? []),
    retailer: opties.programName,
    affiliate_url: link,
    affiliate_link: link,
    product_url: link,
    category,
    gender: inferGender(name, info.gender_target ?? "", info.category_path ?? ""),
    style: inferStyle(name, description, brandName),
    description,
    tags: extractTags(name, description, category, info.keywords ?? ""),
    colors: extractColors(name, info.color_primary ?? "", description),
    sizes: info.size ? [info.size] : [],
    sku: info.sku || null,
    in_stock: voorraad !== "false" && voorraad !== "0" && voorraad !== "out_of_stock",
    // Kinderproducten die door het trefwoordfilter glippen worden hier alsnog herkend.
    is_kids: isKidsProductAtImport(name, description, info.category_path ?? "", info.age_group ?? "", info.size ?? "", imageUrl),
    rating: null,
    review_count: 0,
    updated_at: opties.nu ?? new Date().toISOString(),
    ...(opties.campaignId ? { campaign_id: opties.campaignId } : {}),
  };
  return { rij, classificatie };
}
