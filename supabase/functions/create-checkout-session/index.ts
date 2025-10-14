import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY environment variable is not set");
      throw new Error("Payment system not configured. Please contact support.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { priceId, productId } = await req.json();

    if (!priceId && !productId) {
      throw new Error("Either priceId or productId is required");
    }

    let finalPriceId = priceId;
    let checkoutMode: "payment" | "subscription" = "subscription";

    if (!finalPriceId && productId) {
      const { data: product, error: productError } = await supabase
        .from("stripe_products")
        .select("stripe_price_id, interval, name")
        .eq("id", productId)
        .single();

      if (productError) {
        console.error("Product fetch error:", productError);
        throw new Error(`Database error: ${productError.message}`);
      }

      if (!product) {
        throw new Error(`Product with ID ${productId} not found in database`);
      }

      if (!product.stripe_price_id) {
        throw new Error(`Product "${product.name}" is missing Stripe Price ID. Please configure this in the admin panel or database.`);
      }

      console.log(`Using product: ${product.name}, price_id: ${product.stripe_price_id}`);
      finalPriceId = product.stripe_price_id;
      checkoutMode = product.interval === "one_time" ? "payment" : "subscription";
    }

    const origin = req.headers.get("origin") || "https://fitfi.ai";

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        mode: checkoutMode,
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/prijzen?checkout=cancelled`,
        metadata: {
          user_id: user.id,
          product_id: productId || "",
        },
      });
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);

      if (stripeError.code === 'resource_missing') {
        throw new Error(`Stripe Price ID "${finalPriceId}" does not exist. Please create this price in your Stripe dashboard.`);
      }

      throw new Error(`Stripe error: ${stripeError.message}`);
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
