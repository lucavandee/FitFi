import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EXCLUDED_CATEGORY_KEYWORDS = /\b(kids?|kind|kinderen|children|child|baby|babies|toddler|infant|meisjes?|jongens?|girls?|boys?|peuter|dreumes|newborn|junior|kinder)\b/;
const EXCLUDED_PRODUCT_KEYWORDS = /\b(poster|muurposter|wall\s?art|wall\s?poster|canvas\s?print|home\s?decor|woonaccessoire|schilderij|fotolijst|cadeau|cadeauset|gift\s?set|phone\s?case|telefoonhoesje|sticker|laptop\s?sleeve|mugshot|mok|cup|pillow\s?case|kussenhoes|gordijn|curtain|tapijt|carpet|rug|bedding|dekbed|matras|mattress|lamp|tafellamp|bureaulamp|staande\s?lamp|plafondlamp|wandlamp|candle|kaars|geurkaars|parfum|perfume|beauty|skincare|makeup|cosmet|lipstick|mascara|nail|haar|hair\s?care|shampoo|conditioner|bodywash|douchegel|deodorant|sunscreen|zonnebrand|supplement|vitamin|nutrition|sport\s?equipment|fiets|bike|toy|speelgoed|game|puzzle|book|boek|dvd|cd|electronics|laptop|tablet|phone|horloge\s?band|pyjama|nachthem|slaappak|badjas|ochtendjas|ondergoed|onderbroek|boxer|bh|bralette|lingerie|sok|sokken|panty|kousen|bikini|badpak|zwembroek|zwemshort|boardshort|slipper|badslip|teenslipper|flip-flop|pantoffel|teenslip|vaas|vases|spiegel|mirrors|knuffel|knuffeldier|romper|kruippak|slab|boxpak|babypak|luier|fopspeen|aankleedkussen|deken|beddengoed|kussensloop|aftershave|bodylotion|bronzer|kwast|voetbal|football|soccer|voetbalset|voetbalshirt|voetbalschoen|voetbalbroek|keepershandschoen|scheenbeschermer|shin\s?guard|rugby|hockey|handbal|basketbal|wielren|cycling|fietsbroek|fietsshirt|wielershirt|hardloop|running\s?shoe|trail\s?run|marathon|tennisschoen|tennisrok|golfschoen|golfbroek|wandelschoen|bergschoen|klimschoen|cleat|crampon|crossfit|spinning|sportbeha|sport\s?bh|skibroek|skipak|snowboard|skischoenen|skistok|wintersport|wetsuit|duik|snorkel|surfboard|multipack|hemd|dishware|glassware|bottles\s?and\s?pitchers|storage\s?and\s?baskets|table\s?lamps|clocks|trays|decorative\s?accessories|kitchen\s?accessories|desk\s?accessories|candle\s?holders|figurines|photo\s?frames|verkleedpak|verkleedset|kostuum(?!pantalon|gilet|broek|vest|jasje|colbert))\b/;
const SPORT_FOOTWEAR_REGEX = /\b(fg|ag|sg|mg|tf|ic)\s*[/\\]\s*(fg|ag|sg|mg|tf|ic)\b/i;
const SET_OF_REGEX = /\bset\s+van\s+\d/i;
const MULTIPACK_REGEX = /\b\d+[- ]?(pack|stuks|set)\b/i;

function isFashionProduct(title, categoryPath, description = "") {
  const text = (title + " " + categoryPath + " " + description).toLowerCase();
  if (EXCLUDED_CATEGORY_KEYWORDS.test(text)) return false;
  if (EXCLUDED_PRODUCT_KEYWORDS.test(text)) return false;
  if (SPORT_FOOTWEAR_REGEX.test(title)) return false;
  if (SET_OF_REGEX.test(title)) return false;
  if (MULTIPACK_REGEX.test(title)) return false;
  return true;
}

function inferCategory(title, description, categoryPath) {
  const text = (title + " " + description + " " + categoryPath).toLowerCase();

  if (/\b(sneaker|sneakers|shoe|shoes|boot|boots|trainer|trainers|footwear|loafer|loafers|schoen|schoenen|laars|laarzen|chelsea|oxford|derby|brogue|instapper|espadrille|veterschoen|enkellaars|kuitlaars|mocassin|pump|pumps|sandaal|sandal|sandalen|sloffen|pantoffel|pantoffels|muil|muilen)\b/.test(text)) return "footwear";

  if (/\b(dress|jurk|maxijurk|minijurk|midijurk|avondjurk|cocktailjurk|zomerjurk|blazerjurk|hemdjurk|shirtjurk|wikkeljurk|mouwloze jurk|gebreide jurk|kanten jurk|tulen jurk|maxi-jurk|mini-jurk|midi-jurk)\b/.test(text)) return "dress";

  if (/\b(jumpsuit|overall|playsuit)\b/.test(text)) return "jumpsuit";

  if (/\b(jacket|jas|jack|puffer|pufferjack|anorak|coat|parka|windbreaker|bomber|blazer|mantel|trenchcoat|trench|overcoat|gilet|bodywarmer|donsjas|winterjas|regenjas|regenjack|tussenjas|softshell|hardshell|fleecejack|spijkerjack|overshirt|pilotenjack|gewatteerd|carcoat|car coat|cape|poncho|dufflecoat|peacoat|bouclé jas)\b/.test(text)) return "outerwear";

  if (/\b(trouser|trousers|pant|pants|pantalon|cargo|shorts|short|jean|jeans|skirt|rok|broek|chino|jogger|joggingbroek|sweatpant|sweatpants|legging|tregging|culottes|bermuda)\b/.test(text)) return "bottom";

  if (/\b(bag|bags|backpack|tote|rugzak|tas|handtas|schoudertas|crossbody|clutch|cap|hat|beanie|pet|hoed|bucket hat|scarf|sjaal|belt|riem|accessory|accessories|watch|horloge|jewelry|sieraden|ketting|armband|oorbel|ring|zonnebril|sunglasses|das|stropdas|vlinderdas|portemonnee|wallet|manchetknoop|broche|haarband|hoofdband|paraplu)\b/.test(text)) return "accessory";

  if (/\b(hoodie|hooded|sweatshirt|crewneck|sweater|pullover|vest|cardigan|coltrui|turtleneck)\b/.test(text)) return "top";
  if (/\b(t-shirt|tee|shirt|blouse|polo|poloshirt|longsleeve|tank|tanktop|overhemd|hemdje|knit|gebreid|trui|crop top|bodysuit|body|topje)\b/.test(text)) return "top";

  return "other";
}

function inferGender(title, genderTarget, categoryPath) {
  const g = (genderTarget + " " + categoryPath + " " + title).toLowerCase();
  if (/\b(female|women|woman|vrouw|dames|girl)\b/i.test(g)) return "female";
  if (/\b(male|men|man|heren|boy)\b/i.test(g)) return "male";
  return "unisex";
}

function inferStyle(title, description, brand) {
  const text = (title + " " + description + " " + brand).toLowerCase();

  const STREETWEAR_BRANDS = ["nike", "adidas", "puma", "new balance", "jordan", "stussy", "stüssy", "carhartt", "dickies", "vans", "converse", "supreme", "palace", "the new originals", "daily paper", "filling pieces", "off-white", "champion"];
  const PREMIUM_BRANDS = ["ralph lauren", "tommy hilfiger", "hugo boss", "boss", "lacoste", "gant", "marc o'polo", "scotch & soda", "ted baker", "calvin klein", "michael kors"];
  const LUXURY_BRANDS = ["gucci", "prada", "balenciaga", "saint laurent", "burberry", "versace", "givenchy", "valentino", "fendi", "bottega veneta", "tom ford", "armani"];
  const MINIMALIST_BRANDS = ["cos", "arket", "uniqlo", "muji", "everlane", "filippa k", "theory", "jil sander", "apc", "acne studios"];

  const brandLower = (brand || "").toLowerCase();

  if (LUXURY_BRANDS.some(b => brandLower.includes(b))) return "luxury";
  if (MINIMALIST_BRANDS.some(b => brandLower.includes(b))) return "minimalist";
  if (STREETWEAR_BRANDS.some(b => brandLower.includes(b))) return "streetwear";
  if (PREMIUM_BRANDS.some(b => brandLower.includes(b))) return "smart-casual";

  if (/\b(hoodie|hooded|jogger|jogging|cargo|bomber|sneaker|graphic|graffiti|oversized|baggy|wide[- ]?leg|skate|hip[- ]?hop)\b/.test(text)) return "streetwear";
  if (/\b(blazer|colbert|pantalon|overhemd|dress shirt|tailored|single-breasted|double-breasted|chino|oxford|derby|brogue|loafer)\b/.test(text)) return "smart-casual";
  if (/\b(effen|basic|clean|minimal|simpel|strak|monochroom)\b/.test(text)) return "minimalist";
  if (/\b(silk|zijde|satin|satijn|cashmere|kasjmier|elegant|luxe|premium|exclusive|high-end)\b/.test(text)) return "luxury";
  if (/\b(t-shirt|polo|jeans|spijkerbroek|sneakers|casual|relaxed|everyday|alledaags)\b/.test(text)) return "casual";

  return "casual";
}

function extractTags(title, description, category, keywords) {
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

function extractColors(title, colorPrimary, description) {
  const colors = [];
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

function getDefaultImage(images) {
  if (!images || images.length === 0) return "";
  const defaultImg = images.find((i) => i.tag === "default" && i.size === "large");
  if (defaultImg) return defaultImg.location;
  const large = images.find((i) => i.size === "large");
  return large?.location ?? images[0]?.location ?? "";
}

function getAllImages(images) {
  if (!images || images.length === 0) return [];
  return [...new Set(images.map((i) => i.location).filter(Boolean))];
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function xmlGetText(xml, tag) {
  const openTag = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = xml.match(openTag);
  if (m) {
    return m[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .trim();
  }
  return "";
}

function xmlGetAttr(tag, attr) {
  const re = new RegExp(`${attr}="([^"]*)"`, "i");
  const m = tag.match(re);
  return m ? m[1] : "";
}

function xmlGetAll(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>|<${tag}(?:\\s[^>]*)?/>`, "gi");
  const results = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[0]);
  }
  return results;
}

function xmlGetAllWithAttrs(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*(?:/>|>[\\s\\S]*?</${tag}>)`, "gi");
  const results = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[0]);
  }
  return results;
}

/** Kids keyword regex for age_group and text fields — used at import time */
const KIDS_AGE_GROUPS = /^(kids?|children|infant|toddler|baby|newborn|kinderen|peuter|kleuter)$/i;

/** EU kids sizes (height in cm) */
const EU_KIDS_SIZES = new Set([
  '50','56','62','68','74','80','86','92','98','104','110','116',
  '122','128','134','140','146','152','158','164','170','176',
]);
const ADULT_SIZE_RE = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|ONE SIZE)$/i;

function isKidsProductAtImport(title, description, categoryPath, ageGroup, size, imageUrl) {
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

function parseJsonProducts(parsed) {
  const items = Array.isArray(parsed) ? parsed : parsed?.products ?? parsed?.items ?? [];
  return items.map((p) => {
    const images = [];
    if (p.image_url) images.push({ size: "large", tag: "default", type: "image", location: p.image_url });
    if (p.images && Array.isArray(p.images)) {
      p.images.forEach((img) => {
        if (typeof img === "string") images.push({ size: "medium", tag: "", type: "image", location: img });
        else if (img.location || img.url) images.push({ size: img.size || "medium", tag: img.tag || "", type: "image", location: img.location || img.url });
      });
    }
    return {
      update_info: {
        daisycon_unique_id: String(p.id || p.daisycon_unique_id || p.ean || p.sku || ""),
        status: p.status || "active",
      },
      product_info: {
        title: p.title || p.name || "",
        price: parseFloat(p.price || p.sale_price || "0") || 0,
        price_old: parseFloat(p.price_old || p.original_price || p.list_price || "0") || 0,
        brand: p.brand || p.brand_name || "",
        category: p.category || p.category_name || "",
        category_path: p.category_path || p.category || "",
        color_primary: p.color || p.color_primary || p.colour || "",
        sku: p.sku || p.article_number || "",
        description: p.description || p.short_description || "",
        size: p.size || "",
        keywords: p.keywords || p.tags || "",
        gender_target: p.gender || p.gender_target || p.target_group || "",
        age_group: p.age_group || p.ageGroup || p.age || "",
        in_stock: String(p.in_stock ?? p.available ?? p.availability ?? "true"),
        currency: p.currency || "EUR",
        link: p.affiliate_link || p.deeplink || p.link || p.url || p.product_url || "",
        images,
      },
    };
  });
}

function parseXmlFeed(xmlText) {
  if (!xmlText || xmlText.trim().length === 0) throw new Error("XML feed is leeg");
  if (!/<product[\s>]/i.test(xmlText)) throw new Error("Geen <product> elementen gevonden in XML feed");

  const programName = xmlGetText(xmlText, "name") || xmlGetText(xmlText, "program_name") || "Daisycon Feed";
  const programId = parseInt(xmlGetText(xmlText, "id") || "0") || 0;
  const currency = xmlGetText(xmlText, "currency") || "EUR";

  const productBlocks = xmlGetAll(xmlText, "product");

  const products = productBlocks.map((p) => {
    const imageBlocks = xmlGetAllWithAttrs(p, "image");
    const images = imageBlocks.map((imgTag) => ({
      size: xmlGetAttr(imgTag, "size"),
      tag: xmlGetAttr(imgTag, "tag"),
      type: xmlGetAttr(imgTag, "type"),
      location: xmlGetAttr(imgTag, "location") || xmlGetText(imgTag, "image") || "",
    }));

    return {
      update_info: {
        daisycon_unique_id: xmlGetText(p, "id") || xmlGetText(p, "sku") || xmlGetText(p, "ean") || "",
        status: xmlGetText(p, "status") || "active",
      },
      product_info: {
        title: xmlGetText(p, "title") || xmlGetText(p, "name") || "",
        price: parseFloat(xmlGetText(p, "price") || "0") || 0,
        price_old: parseFloat(xmlGetText(p, "price_old") || xmlGetText(p, "original_price") || "0") || 0,
        brand: xmlGetText(p, "brand"),
        category: xmlGetText(p, "category"),
        category_path: xmlGetText(p, "category_path") || xmlGetText(p, "category"),
        color_primary: xmlGetText(p, "color") || xmlGetText(p, "color_primary") || xmlGetText(p, "colour"),
        sku: xmlGetText(p, "sku") || xmlGetText(p, "article_number"),
        description: xmlGetText(p, "description") || xmlGetText(p, "long_description"),
        size: xmlGetText(p, "size"),
        keywords: xmlGetText(p, "keywords"),
        gender_target: xmlGetText(p, "gender") || xmlGetText(p, "gender_target") || xmlGetText(p, "target_group"),
        age_group: xmlGetText(p, "age_group") || xmlGetText(p, "ageGroup") || xmlGetText(p, "age") || "",
        in_stock: xmlGetText(p, "in_stock") || xmlGetText(p, "availability") || "true",
        currency: xmlGetText(p, "currency") || currency,
        link: xmlGetText(p, "affiliate_link") || xmlGetText(p, "deeplink") || xmlGetText(p, "link") || xmlGetText(p, "url"),
        images,
      },
    };
  });

  return {
    datafeed: {
      info: { product_count: products.length },
      programs: [{ program_info: { id: programId, name: programName, currency, product_count: products.length }, products }],
    },
  };
}

async function fetchAndParseFeed(feedUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  let feedRes;
  try {
    feedRes = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { "Accept": "application/json, application/xml, text/xml, */*", "User-Agent": "FitFi-Import/1.0" },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!feedRes.ok) {
    const body = await feedRes.text().catch(() => "");
    throw new Error(`Feed ophalen mislukt: HTTP ${feedRes.status}${body ? " — " + body.slice(0, 300) : ""}`);
  }

  const contentType = feedRes.headers.get("content-type") ?? "";
  const rawText = await feedRes.text();

  if (!rawText || rawText.trim().length === 0) throw new Error("Feed is leeg — controleer de feed URL en media_id");

  const trimmed = rawText.trimStart();
  const isXml = contentType.includes("xml") || trimmed.startsWith("<");
  const isJson = contentType.includes("json") || trimmed.startsWith("{") || trimmed.startsWith("[");

  if (isJson) {
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error("Feed kon niet als JSON worden geparseerd: " + rawText.slice(0, 200));
    }

    if (parsed?.datafeed?.programs) return parsed;

    const products = parseJsonProducts(parsed);
    const programName = parsed?.program_name || parsed?.datafeed?.info?.program_name || "Daisycon Feed";
    return {
      datafeed: {
        info: { product_count: products.length },
        programs: [{ program_info: { id: 0, name: programName, currency: "EUR", product_count: products.length }, products }],
      },
    };
  }

  if (isXml) return parseXmlFeed(rawText);

  throw new Error(`Onbekend feed formaat (content-type: ${contentType}). Eerste 200 tekens: ${rawText.slice(0, 200)}`);
}

async function processFeed(supabaseAdmin, feed, userId, campaignId) {
  const program = feed.datafeed.programs[0];
  const { id: programId, name: programName } = program.program_info;
  const products = program.products;

  const { data: importLog } = await supabaseAdmin
    .from("daisycon_imports")
    .insert({
      program_name: programName,
      program_id: programId,
      product_count: products.length,
      status: "running",
      triggered_by: userId,
    })
    .select()
    .single();

  let inserted = 0;
  let skipped = 0;
  const errors = [];
  const BATCH_SIZE = 50;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    const rows = batch
      .filter((p) => p.update_info?.status !== "inactive" && p.update_info?.status !== "deleted")
      .filter((p) => isFashionProduct(p.product_info?.title || "", p.product_info?.category_path || "", p.product_info?.description || ""))
      .map((p) => {
        const info = p.product_info;
        const description = stripHtml(info.description ?? "");
        const category = inferCategory(info.title || "", description, info.category_path ?? "");
        const gender = inferGender(info.title || "", info.gender_target ?? "", info.category_path ?? "");
        const brandName = info.brand?.trim() || programName;
        const style = inferStyle(info.title || "", description, brandName);
        const tags = extractTags(info.title || "", description, category, info.keywords ?? "");
        const colors = extractColors(info.title || "", info.color_primary ?? "", description);
        const imageUrl = getDefaultImage(info.images ?? []);
        const allImages = getAllImages(info.images ?? []);
        const externalId = p.update_info?.daisycon_unique_id || info.sku || "";

        // Detect kids products (even if they passed the keyword filter)
        const kidsDetected = isKidsProductAtImport(
          info.title || "", description, info.category_path ?? "",
          info.age_group ?? "", info.size ?? "", imageUrl
        );

        // Skip products that couldn't be classified as fashion
        if (category === "other") return null;

        return {
          external_id: externalId,
          source: "daisycon",
          name: info.title || "",
          brand: brandName,
          price: info.price || 0,
          original_price: info.price_old ?? null,
          image_url: imageUrl,
          images: allImages,
          retailer: programName,
          affiliate_url: info.link,
          affiliate_link: info.link,
          product_url: info.link,
          category,
          gender,
          style,
          description,
          tags,
          colors,
          sizes: info.size ? [info.size] : [],
          sku: info.sku || null,
          in_stock: info.in_stock !== "false" && info.in_stock !== "0" && info.in_stock !== "out_of_stock",
          is_kids: kidsDetected,
          rating: null,
          review_count: 0,
          updated_at: new Date().toISOString(),
          ...(campaignId ? { campaign_id: campaignId } : {}),
        };
      })
      .filter((r) => r != null && r.external_id && r.name);

    if (rows.length === 0) {
      skipped += batch.length;
      continue;
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .upsert(rows, { onConflict: "external_id", ignoreDuplicates: false })
      .select("id");

    if (error) {
      errors.push(`Batch ${i}-${i + BATCH_SIZE}: ${error.message}`);
      skipped += rows.length;
    } else {
      inserted += data?.length ?? rows.length;
    }
  }

  if (importLog?.id) {
    await supabaseAdmin
      .from("daisycon_imports")
      .update({
        inserted_count: inserted,
        updated_count: 0,
        skipped_count: skipped,
        status: errors.length > 0 ? "error" : "success",
        error_message: errors.length > 0 ? errors.join("; ") : null,
      })
      .eq("id", importLog.id);

    if (campaignId) {
      await supabaseAdmin
        .from("affiliate_campaigns")
        .update({
          last_synced_at: new Date().toISOString(),
          last_sync_log_id: importLog.id,
          product_count: inserted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId);
    }
  }

  return { programName, total: products.length, inserted, skipped, errors, importLogId: importLog?.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Ongeldig JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let feed;

    if (body.feedUrl) {
      try {
        feed = await fetchAndParseFeed(body.feedUrl);
      } catch (fetchErr) {
        return new Response(JSON.stringify({ error: String(fetchErr) }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (body.feed) {
      feed = body.feed;
    } else {
      return new Response(JSON.stringify({ error: "Geen feed of feedUrl opgegeven" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!feed?.datafeed?.programs?.length) {
      return new Response(JSON.stringify({ error: "Ongeldige feed structuur — geen programma's gevonden" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await processFeed(supabaseAdmin, feed, user.id, body.campaignId);

    return new Response(
      JSON.stringify({
        success: true,
        program: result.programName,
        total: result.total,
        inserted: result.inserted,
        updated: 0,
        skipped: result.skipped,
        errors: result.errors.length > 0 ? result.errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
