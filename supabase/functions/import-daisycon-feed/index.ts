import { createClient } from "npm:@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { mapFeedProduct } from "../_shared/daisyconRows.ts";

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

    const rows = [];
    for (const p of batch) {
      const uit = mapFeedProduct(p, { programName, campaignId });
      if ("overgeslagen" in uit) continue;
      if (uit.classificatie.confidence === "low") {
        console.warn(`[classifier:low] "${uit.rij.name}" → ${uit.rij.category} (signals: ${uit.classificatie.signals.join(", ")})`);
      }
      rows.push(uit.rij);
    }

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
  const corsHeaders = buildCorsHeaders(req);
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

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), serviceRoleKey);

    // pg_cron roept deze functie aan met de service role (zie migratie
    // 20260916100500_keten_cron.sql). Dan is er geen gebruiker; triggered_by
    // blijft null. Elke andere aanroep moet een geldige gebruikerssessie zijn.
    const token = authHeader.replace(/^Bearer\s+/i, "");
    let userId: string | null = null;
    if (token !== serviceRoleKey) {
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
      userId = user.id;
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

    const result = await processFeed(supabaseAdmin, feed, userId, body.campaignId);

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
