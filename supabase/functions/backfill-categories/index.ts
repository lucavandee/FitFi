// Manual backfill function — re-classifies all products using the new classifier.
// Trigger via: POST /functions/v1/backfill-categories
// Requires admin Authorization header.
// Runs in batches; returns a summary with counts and any low-confidence items.

import { createClient } from "npm:@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { classifyProductRaw } from "../_shared/productClassifier.ts";

const BATCH_SIZE = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: buildCorsHeaders(req) });
  }

  const corsHeaders = buildCorsHeaders(req);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify the caller is an authenticated user
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { dryRun?: boolean; source?: string } = {};
    try {
      body = await req.json();
    } catch {
      // defaults to full run
    }

    const dryRun = body.dryRun === true;
    const sourceFilter = body.source; // optional: "daisycon", etc.

    const stats = {
      total: 0,
      updated: 0,
      skipped: 0,
      unchanged: 0,
      low_confidence: 0,
      errors: 0,
    };

    const lowConfidenceItems: Array<{ id: string; name: string; old_category: string; new_category: string; signals: string[] }> = [];

    // Fetch products in batches
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("products")
        .select("id, name, description, category, source, brand")
        .range(offset, offset + BATCH_SIZE - 1);

      if (sourceFilter) {
        query = query.eq("source", sourceFilter);
      }

      const { data: rows, error } = await query;
      if (error) {
        console.error("Fetch error:", error);
        stats.errors++;
        break;
      }

      if (!rows || rows.length === 0) {
        hasMore = false;
        break;
      }

      stats.total += rows.length;

      const updates: Array<{ id: string; category: string }> = [];

      for (const row of rows) {
        const result = classifyProductRaw(
          row.name || "",
          row.description || "",
          row.category || "",
          row.brand || "",
        );

        const newCategory = result.category === "underwear" ? "other" : result.category;

        if (newCategory === "other") {
          stats.skipped++;
          continue;
        }

        if (result.confidence === "low") {
          stats.low_confidence++;
          lowConfidenceItems.push({
            id: row.id,
            name: row.name,
            old_category: row.category,
            new_category: newCategory,
            signals: result.signals,
          });
        }

        if (row.category === newCategory) {
          stats.unchanged++;
          continue;
        }

        updates.push({ id: row.id, category: newCategory });
        stats.updated++;
      }

      if (!dryRun && updates.length > 0) {
        for (const update of updates) {
          const { error: updateErr } = await supabase
            .from("products")
            .update({ category: update.category, updated_at: new Date().toISOString() })
            .eq("id", update.id);

          if (updateErr) {
            console.error(`Update failed for ${update.id}:`, updateErr);
            stats.errors++;
          }
        }
      }

      offset += rows.length;
      if (rows.length < BATCH_SIZE) hasMore = false;
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: dryRun,
        stats,
        low_confidence_sample: lowConfidenceItems.slice(0, 50),
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
