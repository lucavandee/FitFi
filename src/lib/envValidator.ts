// src/lib/envValidator.ts
import { env } from '../utils/env';

type RequiredEnvKey =
  | "VITE_SUPABASE_URL"
  | "VITE_SUPABASE_ANON_KEY"
  | "VITE_BOLT_API_URL"
  | "VITE_BOLT_API_KEY";

const requiredKeys: RequiredEnvKey[] = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_BOLT_API_URL",
  "VITE_BOLT_API_KEY",
];

export function validateEnv(): void {
  const missing = requiredKeys.filter(
    (key) => !env[key.replace('VITE_', '')] || env[key.replace('VITE_', '')] === ""
  );

  if (missing.length > 0) {
    console.warn(`
[⚠️ ENV Validator] Je .env mist de volgende vereiste variabelen:
${missing.map((key) => `- ${key}`).join("\n")}

💡 Let op: Sommige functionaliteit zal hierdoor niet werken zoals verwacht.
Zorg ervoor dat je .env correct is ingesteld.
    `);
  } else {
    console.info("[✅ ENV Validator] Alle vereiste .env variabelen zijn aanwezig.");
  }
}