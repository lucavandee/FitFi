/**
 * Zet labels van de stijl-agent in keten_stijl_labels (migratie 20261021120000).
 *
 *   npm run keten:stijl-vul -- --labels labels.json                 droge run: aantallen en eerste SQL
 *   npm run keten:stijl-vul -- --labels labels.json --ja            schrijven
 *
 * Schrijft via `supabase db query --linked -f` vanuit de gekoppelde map (de
 * migraties staan niet in schema_migrations, dus geen db push; zie
 * reference_supabase_db_query). Porties van 500 rijen: de tabel is nieuw, klein
 * en heeft geen triggers. Bestaande labels worden overschreven (on conflict).
 *
 * Alle waarden komen uit vaste lijsten (STUK_SOORTEN, STIJL_SLEUTELS) of zijn
 * een uuid; wat daar niet aan voldoet, gaat niet mee.
 */
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { STIJL_AGENT_VERSIE, STIJL_SLEUTELS, STUK_SOORTEN, type ProductLabel } from "../../src/keten/stijl/stijlAgent";
import { heeftVlag, leesVlag } from "./args";

const argv = process.argv.slice(2);
const LABELS = leesVlag(argv, "labels");
const WERKMAP = leesVlag(argv, "werkmap") || "/Users/luc/Desktop/FitFi-clone";
const PORTIE = 500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLE_STUKKEN = new Set(Object.values(STUK_SOORTEN).flat());

function geldig(l: ProductLabel): boolean {
  return (
    UUID.test(l.id) &&
    ALLE_STUKKEN.has(l.stuk) &&
    l.stijlen.length > 0 &&
    l.stijlen.every((s) => STIJL_SLEUTELS.includes(s)) &&
    ["hip", "gewoon", "beide"].includes(l.spoor) &&
    Number.isInteger(l.formeel) &&
    l.formeel >= 1 &&
    l.formeel <= 5 &&
    (l.seizoen === undefined || ["herfst-winter", "lente-zomer", "heel-jaar"].includes(l.seizoen))
  );
}

function sqlVoor(rijen: ProductLabel[], bron: string): string {
  const waarden = rijen
    .map(
      (l) =>
        `('${l.id}', '${l.stuk.replace(/'/g, "''")}', array[${l.stijlen.map((s) => `'${s}'`).join(", ")}]::text[], '${l.spoor}', ${l.formeel}, ${l.seizoen ? `'${l.seizoen}'` : "null"}, ${typeof l.gedateerd === "boolean" ? String(l.gedateerd) : "null"}, '${bron}')`
    )
    .join(",\n");
  return `insert into public.keten_stijl_labels (product_id, stuk, stijlen, spoor, formeel, seizoen, gedateerd, bron) values\n${waarden}\non conflict (product_id) do update set stuk = excluded.stuk, stijlen = excluded.stijlen, spoor = excluded.spoor, formeel = excluded.formeel, seizoen = excluded.seizoen, gedateerd = excluded.gedateerd, bron = excluded.bron, gelabeld_op = now();`;
}

function draai(bestand: string): Promise<string> {
  return new Promise((klaar, mis) => {
    const k = execFile("supabase", ["db", "query", "--linked", "-f", bestand], { cwd: WERKMAP, timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }, (fout, stdout, stderr) =>
      fout ? mis(new Error(`${fout.message}\n${stderr}`)) : klaar(stdout)
    );
    k.stdin?.end();
  });
}

async function main(): Promise<void> {
  if (!LABELS) {
    console.error("Gebruik: --labels labels.json [--ja]");
    process.exit(1);
  }
  const bestand = JSON.parse(readFileSync(LABELS, "utf8")) as { versie?: string; model?: string; labels: Record<string, ProductLabel> };
  const alle = Object.values(bestand.labels);
  const goed = alle.filter(geldig);
  const bron = `${bestand.versie ?? STIJL_AGENT_VERSIE}/${bestand.model ?? "onbekend"}`.replace(/[^a-z0-9./_-]/gi, "");
  console.log(`${alle.length} labels, ${goed.length} geldig, bron ${bron}, ${Math.ceil(goed.length / PORTIE)} porties.`);
  if (!heeftVlag(argv, "ja")) {
    console.log("Droge run. Eerste regels van de eerste portie:\n" + sqlVoor(goed.slice(0, 2), bron));
    return;
  }
  const map = mkdtempSync(join(tmpdir(), "stijl-vul-"));
  try {
    for (let i = 0; i < goed.length; i += PORTIE) {
      const pad = join(map, `portie-${i}.sql`);
      writeFileSync(pad, sqlVoor(goed.slice(i, i + PORTIE), bron));
      await draai(pad);
      console.log(`  ${Math.min(i + PORTIE, goed.length)}/${goed.length} geschreven`);
    }
  } finally {
    rmSync(map, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error("Gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
