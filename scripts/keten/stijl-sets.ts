/**
 * Vooraf keuren: de stijl-agent keurt outfits per combinatie (geslacht, stijl,
 * gelegenheid) voordat een bezoeker ze ziet. Ontwerp, stopregels en de redenen
 * erachter: docs/keten/vooraf-keuren-review.md. De regels zelf staan in
 * src/keten/stijl/ (stijlSets.ts, stijlNacht.ts, stijlPool.ts); dit script doet
 * de database, de aanroepen en de bestanden.
 *
 *   npm run keten:stijl-sets -- --alleen-pool
 *       Haalt vroeg op de avond de pool op, als anon, en schrijft pool-<datum>.json.
 *   npm run keten:stijl-sets -- --pool <pool.json>
 *       Droge run: kandidaten per combinatie en de stand uit het logboek.
 *   npm run keten:stijl-sets -- --pool <pool.json> --via sleutel --model <id> --ja
 *       De nacht. Ook: --effort (xhigh), --max-aanroepen (72), --tot HH:MM
 *       (bij het abonnement standaard 02:30).
 *   npm run keten:stijl-sets -- --rapport [--run <id>]
 *       Het nachtrapport van de laatste (of een gegeven) run opnieuw.
 *
 * Alles staat in ~/claude-artifacts/fitfi-keten/stijl-sets/: oordelen.jsonl en
 * aanroepen.jsonl (alleen aanvullen), pool-<datum>.json en nacht-<tijd>.md en
 * .json. De nacht raakt de database niet. Start hem met nohup caffeinate -i,
 * zodat de Mac niet in slaap valt.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { combinatieSleutel, type Combinatie } from "../../src/keten/stijl/kandidaatOutfits";
import { KEUR_VERSIE, bouwStijlAgentPrompt } from "../../src/keten/stijl/stijlAgent";
import { draaiNacht } from "../../src/keten/stijl/stijlNacht";
import { algemeenParams, algemeenSleutel, kandidatenUitPool, stijlParams, stijlSleutel, stijlZaden, type PoolBestand } from "../../src/keten/stijl/stijlPool";
import {
  PILOT_CELLEN,
  REGELS,
  bouwNachtrapport,
  celCijfers,
  deadlineVoor,
  herstelStaat,
  keurderSleutel,
  type AanroepRegel,
  type Kandidaat,
  type OordeelRegel,
  type Stopreden,
} from "../../src/keten/stijl/stijlSets";
import type { KandidaatRij } from "../../src/services/outfits/kandidaten";
import { heeftVlag, leesVlag } from "./args";
import { bouwKeurArgs, omgevingVoor, roepClaudeAan } from "./claudeStream";
import { leesDotEnv } from "./env";
import { leesSleutel } from "./sleutel";

const argv = process.argv.slice(2);
const MAP = join(homedir(), "claude-artifacts", "fitfi-keten", "stijl-sets");
const OORDELEN = join(MAP, "oordelen.jsonl");
const AANROEPEN = join(MAP, "aanroepen.jsonl");
const SLOT = join(MAP, ".lock");
const WERKMAP = leesVlag(argv, "werkmap") || "/Users/luc/Desktop/FitFi-clone";

const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms));
const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });

function leesJsonl<T>(pad: string): T[] {
  if (!existsSync(pad)) return [];
  const uit: T[] = [];
  const regels = readFileSync(pad, "utf8").split("\n").filter((r) => r.trim());
  regels.forEach((r, i) => {
    try {
      uit.push(JSON.parse(r) as T);
    } catch {
      // Een halve laatste regel na een crash: overslaan en melden.
      console.error(`${pad}: regel ${i + 1} is geen JSON en telt niet mee.`);
    }
  });
  return uit;
}

function gitSha(): string {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "onbekend";
  }
}

function pgrep(patroon: string): string {
  try {
    return execFileSync("pgrep", ["-fl", patroon], { encoding: "utf8" }).trim();
  } catch {
    return ""; // pgrep stopt met code 1 als er niets draait
  }
}

// ---------------------------------------------------------------------------
// Poolstap
// ---------------------------------------------------------------------------

const PAUZE_MS = 1500;
const CLIENT_TIMEOUT_MS = 10_000;
const HERKANS_NA_MS = 5000;
/** Tijdelijke fouten die een herkansing waard zijn: time-out, PostgREST zonder schema, Cloudflare 522 en 524. */
const TIJDELIJK = /57014|PGRST002|\b522\b|\b524\b|time-?out|abort|fetch failed|ECONNRESET/i;

async function rpc(client: SupabaseClient, naam: string, params: object): Promise<{ rijen: KandidaatRij[] } | { fout: string }> {
  let fout = "onbekend";
  for (let poging = 1; poging <= 2; poging++) {
    const ac = new AbortController();
    const klok = setTimeout(() => ac.abort(), CLIENT_TIMEOUT_MS);
    try {
      const { data, error, status } = await client.rpc(naam, params).abortSignal(ac.signal);
      if (!error) return { rijen: (data ?? []) as KandidaatRij[] };
      fout = `${error.code || status}: ${error.message}`;
    } catch (e) {
      fout = e instanceof Error ? e.message : String(e);
    } finally {
      clearTimeout(klok);
    }
    if (poging === 1 && TIJDELIJK.test(fout)) await wacht(HERKANS_NA_MS);
    else break;
  }
  return { fout };
}

async function maakPool(cellen: Combinatie[]): Promise<void> {
  const zwaar = pgrep("feed-sync|tag-products|nacht/run2\\.sh");
  if (zwaar) throw new Error(`Er draait werk op de database; eerst laten afmaken:\n${zwaar}`);
  // Een worktree heeft geen eigen .env: dan die van de gekoppelde hoofdmap, zoals stijl-vul.ts.
  const dotenv = { ...leesDotEnv(join(WERKMAP, ".env")), ...leesDotEnv() };
  const url = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY ?? dotenv.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY ontbreken");
  const client = createClient(url, key, { auth: { persistSession: false } });

  const datum = vandaag();
  const pool: PoolBestand = { datum, gemaakt: new Date().toISOString(), cellen, algemeen: {}, stijl: {}, mislukt: [] };
  let opRij = 0;
  const stap = async (naam: string, params: object, label: string): Promise<KandidaatRij[] | null> => {
    const r = await rpc(client, naam, params);
    await wacht(PAUZE_MS);
    if ("fout" in r) {
      pool.mislukt.push(`${label}: ${r.fout}`);
      console.log(`  ${label}: mislukt (${r.fout})`);
      opRij += 1;
      if (opRij >= 3) throw new Error("Drie fouten op rij; de poolstap stopt.");
      return null;
    }
    opRij = 0;
    console.log(`  ${label}: ${r.rijen.length} rijen`);
    return r.rijen;
  };

  for (const c of cellen) {
    const sleutel = algemeenSleutel(c);
    if (pool.algemeen[sleutel]) continue;
    const rijen = await stap("get_kandidaten", algemeenParams(c), `algemeen ${combinatieSleutel(c)}`);
    if (rijen) pool.algemeen[sleutel] = rijen;
  }
  for (const c of cellen) {
    const sleutel = stijlSleutel(c);
    if (pool.stijl[sleutel]) continue;
    pool.stijl[sleutel] = [];
    for (const zaad of stijlZaden(c, datum)) {
      // Mislukt een zaad ook na de herkansing, dan vervalt alleen dat zaad.
      const rijen = await stap("get_stijl_kandidaten", stijlParams(c, zaad), `stijl ${sleutel}, zaad ${zaad}`);
      if (rijen) pool.stijl[sleutel].push({ p_zaad: zaad, rijen });
    }
  }

  mkdirSync(MAP, { recursive: true });
  const pad = join(MAP, `pool-${datum}.json`);
  writeFileSync(pad, JSON.stringify(pool));
  console.log(`\nPool: ${pad}${pool.mislukt.length ? ` (${pool.mislukt.length} mislukt)` : ""}`);
}

// ---------------------------------------------------------------------------
// De nacht
// ---------------------------------------------------------------------------

function leeft(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Een map als slot, met de pid erin. Een slot van een gestopt proces wordt overgenomen. */
function neemSlot(): () => void {
  mkdirSync(MAP, { recursive: true });
  try {
    mkdirSync(SLOT);
  } catch {
    let pid = 0;
    try {
      pid = Number(readFileSync(join(SLOT, "pid"), "utf8")) || 0;
    } catch {
      // Geen pid: een crash tussen het maken van de map en het schrijven.
    }
    if (pid && leeft(pid)) throw new Error(`Er draait al een nacht (pid ${pid}).`);
    rmSync(SLOT, { recursive: true, force: true });
    mkdirSync(SLOT);
  }
  writeFileSync(join(SLOT, "pid"), String(process.pid));
  return () => rmSync(SLOT, { recursive: true, force: true });
}

/** Op het abonnement: eerst Lucs avondjobs laten afmaken, hooguit een kwartier. */
async function wachtOpLucsJobs(): Promise<void> {
  const tot = Date.now() + 15 * 60 * 1000;
  for (;;) {
    const bezig = pgrep("scheduled-jobs/brein-(curator|eod)/");
    if (!bezig) return;
    if (Date.now() > tot) throw new Error(`Lucs jobs draaien na een kwartier nog:\n${bezig}`);
    console.log("Wacht tot brein-curator en brein-eod klaar zijn...");
    await wacht(30_000);
  }
}

function schrijfRapport(o: { regels: OordeelRegel[]; aanroepen: AanroepRegel[]; keurder: string; run: string; via: string; stopreden: Stopreden | null }): void {
  const { md, json } = bouwNachtrapport({
    regels: o.regels,
    aanroepen: o.aanroepen,
    keurder: o.keurder,
    run: o.run,
    meta: { start: o.run, stop: new Date().toISOString(), git: gitSha(), via: o.via, stopreden: o.stopreden },
  });
  const stempel = o.run.slice(0, 16).replace(/[:T]/g, "-");
  const pad = join(MAP, `nacht-${stempel}.md`);
  writeFileSync(pad, md);
  writeFileSync(pad.replace(/\.md$/, ".json"), JSON.stringify(json, null, 1));
  console.log(`\n${md.split("\n").slice(0, 20).join("\n")}\nRapport: ${pad}`);
}

async function nacht(): Promise<void> {
  const poolPad = leesVlag(argv, "pool");
  if (!poolPad) throw new Error("--pool <pool.json> ontbreekt; maak hem met --alleen-pool");
  const pool = JSON.parse(readFileSync(poolPad, "utf8")) as PoolBestand;
  const ja = heeftVlag(argv, "ja");
  const via = leesVlag(argv, "via");
  const model = leesVlag(argv, "model") || "";
  const effort = leesVlag(argv, "effort") || "xhigh";
  const maxAanroepen = Number(leesVlag(argv, "max-aanroepen") || 72);
  const tot = leesVlag(argv, "tot") || (via === "abonnement" ? "02:30" : "");
  if (ja) {
    if (via !== "abonnement" && via !== "sleutel") throw new Error("Kies bewust hoe er betaald wordt: --via sleutel of --via abonnement");
    if (!model || /^(sonnet|opus|haiku)$/i.test(model)) throw new Error("--model <vast model-id> uit de kalibratie, geen alias");
    if (!Number.isFinite(maxAanroepen) || maxAanroepen < 1) throw new Error("--max-aanroepen moet een positief getal zijn");
  }
  const dagen = (Date.now() - Date.parse(pool.gemaakt)) / 86_400_000;
  if (dagen > 2) console.warn(`Let op: de pool is ${Math.round(dagen)} dagen oud; voorraad en prijzen kunnen veranderd zijn.`);

  const regels = leesJsonl<OordeelRegel>(OORDELEN);
  const keurder = keurderSleutel(KEUR_VERSIE, model || "(geen model)", effort);
  const staat = herstelStaat(regels, keurder);
  const nieuw = new Map<string, Kandidaat[]>();
  console.log(`Keurder ${keurder}; pool van ${pool.datum}.`);
  for (const c of pool.cellen) {
    const cel = combinatieSleutel(c);
    const c0 = staat.perCel.get(cel);
    const cijfers = c0 ? celCijfers(c0) : null;
    const uit = await kandidatenUitPool(pool, c, { bekend: cijfers?.bekend ?? new Set(), max: REGELS.ronde1PerNacht });
    nieuw.set(cel, uit.kandidaten);
    console.log(
      `  ${cel}: ${cijfers?.status ?? "nieuw"}, ${uit.kandidaten.length} nieuwe kandidaten uit ${uit.outfits} outfits` +
        `${uit.zonderKleur ? ` (${uit.zonderKleur} zonder kleur)` : ""}${uit.reden ? `, ${uit.reden}` : ""}` +
        `; tot nu toe ${cijfers?.keuringen ?? 0} gekeurd, ${cijfers?.bevestigd.length ?? 0} bevestigd`
    );
  }
  if (!ja) {
    console.log("\nDroge run: geen aanroep. Voeg --via, --model en --ja toe om te keuren.");
    return;
  }

  const losSlot = neemSlot();
  try {
    if (via === "abonnement") await wachtOpLucsJobs();
    const env = omgevingVoor(via as "abonnement" | "sleutel", via === "sleutel" ? leesSleutel() : null);
    const systeem = bouwStijlAgentPrompt();
    const run = new Date().toISOString();
    const deadline = tot ? deadlineVoor(tot, new Date()) : null;
    const ac = new AbortController();
    const stop = () => {
      console.error("Onderbroken: de lopende aanroep wordt afgebroken, het logboek is bijgewerkt.");
      ac.abort();
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
    console.log(`\nStart ${run}, via ${via}, hooguit ${maxAanroepen} aanroepen${deadline ? `, klaar voor ${new Date(deadline).toLocaleTimeString("nl-NL")}` : ""}.`);

    const uit = await draaiNacht(
      { run, keurVersie: KEUR_VERSIE, model, effort, via: via as "abonnement" | "sleutel", maxAanroepen, deadline, cellen: pool.cellen.map(combinatieSleutel), nieuw, bestaand: regels },
      {
        roepAan: (opdracht, signal) => roepClaudeAan(bouwKeurArgs({ model, effort, systeem, opdracht }), { timeoutMs: REGELS.margeMs, signal, env }),
        schrijfOordeel: (r) => appendFileSync(OORDELEN, JSON.stringify(r) + "\n"),
        schrijfAanroep: (r) => {
          appendFileSync(AANROEPEN, JSON.stringify(r) + "\n");
          const duur = r.duration_ms ? `${Math.round(r.duration_ms / 1000)} s` : "";
          console.log(`  aanroep ${r.nummer}: ${r.gelezen} van ${r.verstuurd} oordelen, ${r.gelukt ? "gelukt" : `mislukt: ${String(r.fout ?? "").slice(0, 120)}`} ${duur}`);
        },
        nu: () => Date.now(),
      },
      ac.signal
    );
    console.log(`\nGestopt: ${uit.stopreden} na ${uit.aanroepen} aanroepen.`);
    schrijfRapport({ regels: uit.regels, aanroepen: leesJsonl<AanroepRegel>(AANROEPEN), keurder, run, via: via!, stopreden: uit.stopreden });
  } finally {
    losSlot();
  }
}

function rapportOpnieuw(): void {
  const aanroepen = leesJsonl<AanroepRegel>(AANROEPEN);
  const regels = leesJsonl<OordeelRegel>(OORDELEN);
  const run = leesVlag(argv, "run") || aanroepen[aanroepen.length - 1]?.run;
  if (!run) throw new Error(`Geen runs in ${AANROEPEN}`);
  const eigen = regels.find((r) => r.run === run && r.aanroep_gelukt) ?? regels.find((r) => r.run === run);
  if (!eigen) throw new Error(`Geen oordelen van run ${run}`);
  const deze = aanroepen.filter((a) => a.run === run);
  schrijfRapport({ regels, aanroepen, keurder: eigen.keurder, run, via: deze[0]?.via ?? "onbekend", stopreden: deze[deze.length - 1]?.stopreden ?? null });
}

async function main(): Promise<void> {
  if (heeftVlag(argv, "alleen-pool")) return maakPool(PILOT_CELLEN);
  if (heeftVlag(argv, "rapport")) return rapportOpnieuw();
  return nacht();
}

main().catch((e) => {
  console.error("Gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
