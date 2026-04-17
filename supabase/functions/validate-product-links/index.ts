import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { buildCorsHeaders } from "../_shared/cors.ts";

const BATCH_SIZE = 50;
const REQUEST_TIMEOUT_MS = 10000;
const MAX_PRODUCTS_PER_RUN = 200;

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req, {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(
      parseInt(limitParam || String(MAX_PRODUCTS_PER_RUN)),
      MAX_PRODUCTS_PER_RUN
    );

    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, affiliate_url, product_url")
      .or(
        "link_last_checked_at.is.null,link_last_checked_at.lt." +
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .order("link_last_checked_at", { ascending: true, nullsFirst: true })
      .limit(limit);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ message: "No products to check", checked: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = { healthy: 0, broken: 0, timeout: 0, skipped: 0 };

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (product) => {
          const checkUrl = product.affiliate_url || product.product_url;

          if (!checkUrl || checkUrl === "#") {
            results.skipped++;
            return;
          }

          let status: string;
          let httpStatus: number | null = null;

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(
              () => controller.abort(),
              REQUEST_TIMEOUT_MS
            );

            const response = await fetch(checkUrl, {
              method: "HEAD",
              redirect: "follow",
              signal: controller.signal,
              headers: {
                "User-Agent":
                  "FitFi-LinkChecker/1.0 (https://fitfi.ai; contact@fitfi.ai)",
              },
            });

            clearTimeout(timeoutId);
            httpStatus = response.status;

            if (response.ok || response.status === 301 || response.status === 302) {
              status = "healthy";
              results.healthy++;
            } else if (response.status === 404 || response.status === 410) {
              status = "broken";
              results.broken++;
            } else if (response.status === 403 || response.status === 405) {
              status = "healthy";
              results.healthy++;
            } else {
              status = "broken";
              results.broken++;
            }
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") {
              status = "timeout";
              results.timeout++;
            } else {
              status = "broken";
              results.broken++;
            }
          }

          await supabase.rpc("update_product_link_status", {
            p_product_id: product.id,
            p_status: status,
            p_http_status: httpStatus,
          });
        })
      );
    }

    return new Response(
      JSON.stringify({
        message: "Link validation complete",
        checked: products.length,
        ...results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
