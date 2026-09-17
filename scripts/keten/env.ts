/**
 * Omgevingsvariabelen voor de keten-scripts. Leest de repo-root .env (staat in
 * .gitignore) en het proces. Waarden worden nooit gelogd; een foutmelding
 * noemt alleen de naam van wat ontbreekt.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function parseDotEnv(tekst: string): Record<string, string> {
  const uit: Record<string, string> = {};
  for (const regel of tekst.split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) uit[m[1]] = m[2];
  }
  return uit;
}

export function leesDotEnv(pad: string = join(root, ".env")): Record<string, string> {
  if (!existsSync(pad)) return {};
  return parseDotEnv(readFileSync(pad, "utf8"));
}

export interface KetenEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ANTHROPIC_API_KEY?: string;
}

export function leesEnv(
  bron: Record<string, string | undefined> = { ...leesDotEnv(), ...process.env },
  opties: { anthropic?: boolean } = { anthropic: true }
): KetenEnv {
  const url = bron.SUPABASE_URL ?? bron.VITE_SUPABASE_URL;
  const serviceKey = bron.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = bron.ANTHROPIC_API_KEY;

  const ontbreekt: string[] = [];
  if (!url) ontbreekt.push("SUPABASE_URL");
  if (!serviceKey) ontbreekt.push("SUPABASE_SERVICE_ROLE_KEY");
  if (opties.anthropic !== false && !anthropicKey) ontbreekt.push("ANTHROPIC_API_KEY");
  if (ontbreekt.length > 0) {
    throw new Error(`Ontbrekende omgevingsvariabelen: ${ontbreekt.join(", ")}`);
  }

  return {
    SUPABASE_URL: url!.replace(/\/$/, ""),
    SUPABASE_SERVICE_ROLE_KEY: serviceKey!,
    ANTHROPIC_API_KEY: anthropicKey,
  };
}
