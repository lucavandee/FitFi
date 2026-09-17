/**
 * Omgevingsvariabelen voor de keten-scripts. Leest de repo-root .env (staat in
 * .gitignore) en het proces. Waarden worden nooit gelogd; een foutmelding
 * noemt alleen de naam van wat ontbreekt.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Leest KEY=waarde-regels. Twee keuzes die niet vanzelfsprekend zijn en dus
 * expliciet zijn getest (zie __tests__/env.test.ts):
 *
 * - Aangehaalde waarde (`KEY="..."`): alles tussen de eerste en de
 *   bijbehorende `"` is de waarde, letterlijk, ook als daarna nog een `#`
 *   volgt. De aanhalingstekens zijn dan de expliciete grens; wat erna komt
 *   negeren we net als bij een gewone regel-comment.
 * - Onaangehaalde waarde: alleen `#` met witruimte ervoor is commentaar
 *   (` # toelichting`). Een `#` zonder voorafgaande witruimte hoort bij de
 *   waarde. Dat dekt de twee gevallen die dit moet onderscheiden: een
 *   `KEY=waarde # toelichting` regel (commentaar eraf) versus een
 *   wachtwoord of URL-fragment met een `#` erin (blijft intact).
 *
 * Regeleinden: een CRLF-bestand laat anders een `\r` in de laatste waarde
 * van elke regel achter; die wordt hier eerst weggehaald.
 */
export function parseDotEnv(tekst: string): Record<string, string> {
  const uit: Record<string, string> = {};
  for (const ruweRegel of tekst.split("\n")) {
    const regel = ruweRegel.replace(/\r$/, "");
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const [, sleutel, rest] = m;

    const aangehaald = rest.match(/^"([^"]*)"/);
    if (aangehaald) {
      uit[sleutel] = aangehaald[1];
      continue;
    }

    uit[sleutel] = rest.replace(/\s+#.*$/, "").trim();
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

/**
 * Eerste waarde die niet undefined en niet een lege string is. `??` reageert
 * alleen op null/undefined: `bron.SUPABASE_URL ?? bron.VITE_SUPABASE_URL` zou
 * bij `SUPABASE_URL: ""` die lege string teruggeven in plaats van door te
 * vallen naar een wel-gevulde VITE_SUPABASE_URL. Een leeg gezette
 * omgevingsvariabele is voor deze terugval hetzelfde als een afwezige.
 */
function eersteMetInhoud(...waarden: Array<string | undefined>): string | undefined {
  for (const w of waarden) {
    if (w !== undefined && w !== "") return w;
  }
  return undefined;
}

export function leesEnv(
  bron: Record<string, string | undefined> = { ...leesDotEnv(), ...process.env },
  opties: { anthropic?: boolean } = { anthropic: true }
): KetenEnv {
  const url = eersteMetInhoud(bron.SUPABASE_URL, bron.VITE_SUPABASE_URL);
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
