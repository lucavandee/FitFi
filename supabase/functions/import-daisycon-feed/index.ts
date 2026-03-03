import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type DaisyconImage = {
  size: string;
  tag: string;
  type: string;
  location: string;
};

type DaisyconProductInfo = {
  title: string;
  price: number;
  price_old: number;
  brand: string;
  category: string;
  category_path: string;
  color_primary: string;
  sku: string;
  description: string;
  size: string;
  keywords: string;
  gender_target: string;
  in_stock: string;
  currency: string;
  link: string;
  images: DaisyconImage[];
};

type DaisyconProduct = {
  update_info: {
    daisycon_unique_id: string;
    status: string;
  };
  product_info: DaisyconProductInfo;
};

type DaisyconProgram = {
  program_info: {
    id: number;
    name: string;
    currency: string;
    product_count: number;
  };
  products: DaisyconProduct[];
};

type DaisyconFeed = {
  datafeed: {
    info: {
      product_count: number;
    };
    programs: DaisyconProgram[];
  };
};

function inferCategory(title: string, description: string, categoryPath: string): string {
  const text = (title + " " + description + " " + categoryPath).toLowerCase();

  if (/\b(jacket|jas|puffer|anorak|coat|parka|windbreaker|bomber|blazer|mantel)\b/.test(text)) return "outerwear";
  if (/\b(hoodie|hooded|sweatshirt|crewneck|sweater|pullover|fleece|vest)\b/.test(text)) return "top";
  if (/\b(tee|t-shirt|shirt|blouse|polo|top|longsleeve|tank)\b/.test(text)) return "top";
  if (/\b(trouser|pant|cargo|shorts|brief|jean|denim|bottom|skirt|rok|broek)\b/.test(text)) return "bottom";
  if (/\b(sneaker|shoe|boot|trainer|footwear|loafer|schoen|laars)\b/.test(text)) return "footwear";
  if (/\b(bag|backpack|tote|rugzak|tas|cap|hat|beanie|pet|scarf|sjaal|belt|riem|accessory|watch|jewelry|sieraden)\b/.test(text)) return "accessory";
  if (/\b(dress|jurk|jumpsuit|suit|pak|overall)\b/.test(text)) return "top";

  return "top";
}

function inferGender(title: string, genderTarget: string, categoryPath: string): string {
  const g = (genderTarget + " " + categoryPath + " " + title).toLowerCase();
  if (g.includes("female") || g.includes("women") || g.includes("vrouw") || g.includes("dames") || g.includes("girl")) return "female";
  if (g.includes("male") || g.includes("men") || g.includes("man") || g.includes("heren") || g.includes("boy")) return "male";
  return "unisex";
}

function inferStyle(title: string, description: string, brand: string): string {
  const text = (title + " " + description + " " + brand).toLowerCase();
  if (/\b(jazz|art|creative|graphic|print|culture|street|urban)\b/.test(text)) return "casual-urban";
  if (/\b(tech|performance|premium|wool|tailored|refined|formal|office)\b/.test(text)) return "smart-casual";
  if (/\b(cargo|military|utility|tactical|workwear)\b/.test(text)) return "streetwear";
  if (/\b(linen|silk|elegant|luxe|satin|cashmere)\b/.test(text)) return "luxury";
  return "casual";
}

function extractTags(title: string, description: string, category: string, keywords: string): string[] {
  const tags: string[] = [category];
  const text = (title + " " + description + " " + keywords).toLowerCase();

  const colorWords = ["black", "white", "blue", "navy", "red", "green", "grey", "gray", "cream", "ecru", "lime", "moss", "brown", "beige", "pink", "yellow", "orange", "purple", "khaki", "camel"];
  colorWords.forEach((c) => { if (text.includes(c)) tags.push(c); });

  if (text.includes("cotton")) tags.push("cotton");
  if (text.includes("nylon")) tags.push("nylon");
  if (text.includes("linen")) tags.push("linen");
  if (text.includes("wool")) tags.push("wool");
  if (text.includes("recycled") || text.includes("sustainable")) tags.push("sustainable");
  if (text.includes("embroidered")) tags.push("embroidered");
  if (text.includes("graphic")) tags.push("graphic");
  if (text.includes("print") || text.includes("pattern")) tags.push("printed");
  if (text.includes("stripe") || text.includes("stripes")) tags.push("striped");
  if (text.includes("oversized")) tags.push("oversized");
  if (text.includes("slim") || text.includes("skinny")) tags.push("slim");
  if (text.includes("relaxed") || text.includes("loose")) tags.push("relaxed");

  return [...new Set(tags)];
}

function extractColors(title: string, colorPrimary: string, description: string): string[] {
  const colors: string[] = [];
  if (colorPrimary && colorPrimary.trim()) colors.push(colorPrimary.toLowerCase().trim());

  const colorMap: Record<string, string> = {
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

function getDefaultImage(images: DaisyconImage[]): string {
  const defaultImg = images.find((i) => i.tag === "default" && i.size === "large");
  if (defaultImg) return defaultImg.location;
  const large = images.find((i) => i.size === "large");
  return large?.location ?? images[0]?.location ?? "";
}

function getAllImages(images: DaisyconImage[]): string[] {
  return [...new Set(images.map((i) => i.location))];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function processFeed(
  supabase: ReturnType<typeof createClient>,
  feed: DaisyconFeed,
  userId: string,
  campaignId?: string,
): Promise<{ programName: string; total: number; inserted: number; skipped: number; errors: string[]; importLogId?: string }> {
  const program = feed.datafeed.programs[0];
  const { id: programId, name: programName } = program.program_info;
  const products = program.products;

  const { data: importLog } = await supabase
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
  const errors: string[] = [];
  const BATCH_SIZE = 50;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    const rows = batch
      .filter((p) => p.update_info.status === "active")
      .map((p) => {
        const info = p.product_info;
        const description = stripHtml(info.description ?? "");
        const category = inferCategory(info.title, description, info.category_path ?? "");
        const gender = inferGender(info.title, info.gender_target ?? "", info.category_path ?? "");
        const brandName = info.brand?.trim() || programName;
        const style = inferStyle(info.title, description, brandName);
        const tags = extractTags(info.title, description, category, info.keywords ?? "");
        const colors = extractColors(info.title, info.color_primary ?? "", description);
        const imageUrl = getDefaultImage(info.images ?? []);
        const allImages = getAllImages(info.images ?? []);

        return {
          external_id: p.update_info.daisycon_unique_id,
          source: "daisycon",
          name: info.title,
          brand: brandName,
          price: info.price,
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
          in_stock: info.in_stock !== "false",
          rating: null,
          review_count: 0,
          updated_at: new Date().toISOString(),
          ...(campaignId ? { campaign_id: campaignId } : {}),
        };
      });

    if (rows.length === 0) {
      skipped += batch.length;
      continue;
    }

    const { data, error } = await supabase
      .from("products")
      .upsert(rows, {
        onConflict: "external_id",
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      errors.push(`Batch ${i}-${i + BATCH_SIZE}: ${error.message}`);
      skipped += rows.length;
    } else {
      inserted += data?.length ?? rows.length;
    }
  }

  if (importLog?.id) {
    await supabase
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
      await supabase
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

Deno.serve(async (req: Request) => {
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
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as { feed?: DaisyconFeed; feedUrl?: string; campaignId?: string };

    let feed: DaisyconFeed;

    if (body.feedUrl) {
      const feedRes = await fetch(body.feedUrl);
      if (!feedRes.ok) {
        return new Response(JSON.stringify({ error: `Feed ophalen mislukt: ${feedRes.status} ${feedRes.statusText}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      feed = await feedRes.json() as DaisyconFeed;
    } else if (body.feed) {
      feed = body.feed;
    } else {
      return new Response(JSON.stringify({ error: "Geen feed of feedUrl opgegeven" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!feed?.datafeed?.programs?.length) {
      return new Response(JSON.stringify({ error: "Ongeldige feed structuur" }), {
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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
