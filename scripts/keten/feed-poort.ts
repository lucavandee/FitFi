/**
 * Feed-poort (spec 5.7): draait het persona-harnas voor een retailer, berekent
 * de dekkingsmatrix gender x gelegenheid x prijsband en schrijft het resultaat
 * naar feed_gates. Groen als de matrix in de banden tot50 en 50tot100 geen
 * lege cel heeft en persona-run exit code 0 gaf.
 *
 * Gebruik:
 *   npm run keten:poort                                        (STANDAARD_RETAILER)
 *   npm run keten:poort -- --retailer "H&M (NL)"
 *   npm run keten:poort -- --retailer "H&M (NL)" --zonder-persona   (alleen de matrix; nooit groen)
 *
 * Exit code 0 bij groen, 1 anders. Omgeving: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * en voor persona-run.ts (anon-sleutel, plan 1) VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY.
 *
 * Herkansing: keten_dekkingsmatrix draait via de service-role-sleutel (geen
 * statement_timeout), maar taak 9 mat op Giglio na een stille periode 11s bij
 * een koude cache, ook met de nieuwe index. Bij een time-out op precies die
 * RPC (Postgres-errcode 57014, of de PostgREST/HTTP-vertaling daarvan) volgt
 * een enkele herkansing. Geen pg_cron-uitwijk (taak 8: dat patroon is
 * destructief bij een falende query) en geen stille tweede poging: een
 * herkansing wordt altijd in de uitvoer gemeld, anders verbergt de poort dat
 * de infrastructuur traag is.
 */
import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { heeftVlag, leesVlag } from "./args";
import { leesEnv } from "./env";
import { isGroen, legeCellen, type Matrix, type PersonaOutput } from "./poort";
import { STANDAARD_RETAILER } from "./retailers";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MAX_LOG_TEKENS = 20_000;

const kort = (s: string | null | undefined) => (s ?? "").slice(-MAX_LOG_TEKENS);

function draaiPersonaRun(retailer: string): PersonaOutput {
  const run = spawnSync("npx", ["vite-node", "scripts/keten/persona-run.ts", "--retailer", retailer], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { overgeslagen: false, exit_code: run.status ?? -1, stdout: kort(run.stdout), stderr: kort(run.stderr) };
}

/**
 * Statement-timeout (Postgres errcode 57014) of de HTTP-vertaling daarvan
 * (PostgREST geeft die door als 500 met "canceling statement due to
 * statement timeout" in het bericht, of de fetch zelf loopt vast). Alleen dit
 * duidt op de trage-infrastructuur-situatie uit taak 9; andere fouten (zoals
 * "Onbekende retailer") horen niet herkanst te worden.
 */
function isTimeout(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "57014") return true;
  return /statement timeout/i.test(error.message ?? "");
}

async function haalMatrixMetHerkansing(
  supabase: ReturnType<typeof createClient>,
  retailer: string
): Promise<{ matrix: Matrix; herkanst: boolean }> {
  const eerste = await supabase.rpc("keten_dekkingsmatrix", { p_retailer: retailer });
  if (!eerste.error) return { matrix: eerste.data as Matrix, herkanst: false };
  if (!isTimeout(eerste.error)) {
    throw new Error(`keten_dekkingsmatrix: ${eerste.error.message}`);
  }
  console.log(`  keten_dekkingsmatrix gaf een time-out, één herkansing: ${eerste.error.message}`);
  const tweede = await supabase.rpc("keten_dekkingsmatrix", { p_retailer: retailer });
  if (tweede.error) throw new Error(`keten_dekkingsmatrix (na herkansing): ${tweede.error.message}`);
  return { matrix: tweede.data as Matrix, herkanst: true };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const retailer = leesVlag(argv, "retailer") || STANDAARD_RETAILER;
  const zonderPersona = heeftVlag(argv, "zonder-persona");

  const env = leesEnv(undefined, { anthropic: false });
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { matrix, herkanst } = await haalMatrixMetHerkansing(supabase, retailer);
  const leeg = legeCellen(matrix);

  const persona: PersonaOutput = zonderPersona ? { overgeslagen: true } : draaiPersonaRun(retailer);
  const groen = isGroen(leeg, persona);

  const { error: schrijfFout } = await supabase.from("feed_gates").insert({
    retailer,
    groen,
    matrix,
    persona_output: persona,
  });
  if (schrijfFout) throw new Error(`feed_gates: ${schrijfFout.message}`);

  console.log(`Feed-poort voor "${retailer}": ${groen ? "GROEN" : "ROOD"}`);
  if (herkanst) console.log("  let op: keten_dekkingsmatrix had een herkansing nodig (time-out bij de eerste poging)");
  console.log(`  lege cellen (tot50, 50tot100): ${leeg.length === 0 ? "geen" : leeg.join(", ")}`);
  console.log(`  persona-run: ${persona.overgeslagen ? "overgeslagen" : `exit ${persona.exit_code}`}`);
  if (!persona.overgeslagen && persona.exit_code !== 0) {
    console.log("  laatste regels van persona-run:");
    console.log((persona.stdout ?? "").split("\n").slice(-15).join("\n"));
  }
  process.exit(groen ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
