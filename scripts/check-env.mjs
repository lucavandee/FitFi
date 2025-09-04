/**
 * Hard check op essentiële env variabelen vóór build/runtime.
 * 
 * Draai lokaal (prestart/prebuild) en in CI/Netlify vóór de build.
 * 
 * Vereist:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * 
 * (aanbevolen) VITE_FITFI_TIER_DEFAULT, VITE_FITFI_NOVA_ENDPOINT (fallback: /.netlify/functions/nova)
 */
const REQUIRED = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

function readEnv() {
  // Onder Netlify/CI zitten env vars in process.env.
  // Lokaal in Vite/Node ook via process.env (dotenv).
  return process.env;
}

const env = readEnv();
const missing = REQUIRED.filter((k) => !env[k] || `${env[k]}`.trim() === "");

if (missing.length) {
  console.error(
    "⛔ Missing environment variables:\n" +
    missing.map((k) => `  - ${k}`).join("\n") +
    "\nZet deze in je Netlify env én in .env.local/.env (VITE_* prefix verplicht voor Vite)."
  );
  process.exit(1);
}

console.log("✅ Env check passed. Alle vereiste variabelen zijn aanwezig.");