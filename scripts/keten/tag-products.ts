/**
 * Tagt canonieke producten en schrijft de tags naar product_attributes
 * (spec 5.1). De CLI die de kandidaten-RPC (taak 2), de taggerkern
 * (tagging.ts, taak 3), de hervatbare batchadministratie (batchesStore.ts,
 * taak 4) en de claude -p-aanroepweg (tagCli.ts, taak 5) aan elkaar knoopt.
 *
 * AMENDEMENT (Luc, 22 sept 2026, taak-5-brief.md). Dit script gebruikt NIET
 * de Anthropic Batch API en NIET ANTHROPIC_API_KEY. Het taggen loopt via
 * `claude -p` op het Claude Code-abonnement van de eigenaar:
 * - nooit --bare (leest alleen ANTHROPIC_API_KEY/apiKeyHelper, negeert het
 *   abonnement);
 * - --model met het exacte model-id (TAGGER_MODEL), niet het alias "haiku":
 *   zo blijft vastliggen welke snapshot een tagger_version heeft getagd, ook
 *   als het alias later naar een nieuw model wijst;
 * - --allowed-tools "" (taggen heeft geen tools nodig);
 * - --json-schema voor gevalideerde structured output (zie tagCli.ts voor
 *   waarom dit een bewuste afwijking is van de letterlijke aanroep in de
 *   brief: --json-schema bestond kennelijk niet in de geteste opzet daar,
 *   maar lost het "```json-hekjes"-probleem structureel op in plaats van met
 *   string-strippen).
 *
 * Gebruik:
 *   npm run keten:tag                                   droge run op STANDAARD_RETAILER
 *   npm run keten:tag -- --retailer "H&M (NL)" --ja      verstuurt en schrijft
 *   npm run keten:tag -- --met-foto --ja                 foto-ronde voor confidence < 0.6
 *   --limit N            alleen de eerste N kandidaten (proefrun)
 *   --concurrency N      aantal gelijktijdige claude -p aanroepen (standaard 4)
 *
 * Idempotent: keten_tag_kandidaten selecteert op tagger_version, een rij die
 * deze versie al heeft komt niet meer langs. Hervatbaar: openstaande porties
 * staan met hun volledige productlijst in scripts/keten/.batches.json
 * (gitignored) en worden bij de volgende run als eerste afgerond, ook zonder
 * --ja. Een "batch" is hier een portie van PORTIE_GROOTTE producten, geen
 * Batch API-id (die bestaat niet meer in deze aanroepweg).
 *
 * Omgeving: SUPABASE_URL (of VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY.
 * Nooit in de repo, nooit gelogd. Geen ANTHROPIC_API_KEY nodig.
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { heeftVlag, leesVlag } from "./args";
import { leesBatches, markeerVerwerkt, openBatches, schrijfBatches, type BatchesBestand } from "./batchesStore";
import { leesEnv } from "./env";
import { STANDAARD_RETAILER } from "./retailers";
import {
  CLI_SCHEMA,
  CONCURRENCY_STANDAARD,
  MAX_OPEENVOLGENDE_FOUTEN,
  PORTIE_GROOTTE,
  bouwClaudeArgs,
  bouwOpdracht,
  bouwSysteemPromptCli,
  comprimeerVerwerkt,
  downloadFoto,
  extensieVoorUrl,
  haalKandidaten,
  maakPortieRecord,
  schatDroogeRun,
  schrijfRijen,
  splitsInPorties,
  timeoutMsVoorPortie,
  verwerkCliUitvoer,
  voerClaudeCliUit,
  voerMetConcurrency,
  type PortieRecord,
} from "./tagCli";
import { TAGGER_MODEL, TAGGER_VERSION, TAGGER_VERSION_FOTO, type Modus } from "./tagging";

const here = dirname(fileURLToPath(import.meta.url));
const BATCHES_PAD = join(here, ".batches.json");
const OUT = join(here, "out");

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const retailer = leesVlag(argv, "retailer") || STANDAARD_RETAILER;
  const modus: Modus = heeftVlag(argv, "met-foto") ? "foto" : "tekst";
  const limiet = Number(leesVlag(argv, "limit") ?? 0) || 0;
  const ja = heeftVlag(argv, "ja");
  const concurrency = Math.max(1, Number(leesVlag(argv, "concurrency") ?? CONCURRENCY_STANDAARD) || CONCURRENCY_STANDAARD);
  const versie = modus === "foto" ? TAGGER_VERSION_FOTO : TAGGER_VERSION;

  if (concurrency > 6) {
    console.log(
      `Waarschuwing: concurrency ${concurrency} ligt boven de aanbevolen 4-6 (zie amendement in taak-5-brief.md: ` +
        "het abonnement liep eerder vol door veel parallelle sessies). Ga door op eigen risico."
    );
  }

  const env = leesEnv(undefined, { anthropic: false });
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // Ctrl-C moet ook de lopende claude -p subprocessen meenemen. Zonder dit
  // blijft een aanroep na het stoppen van dit script gewoon als wees
  // doorlopen (waargenomen tijdens de hervattest van deze taak): het eigen
  // proces is weg, maar `ps aux` toont claude -p nog minuten later actief,
  // en dat verbruikt stilletjes abonnementsgebruik voor niets. De portie
  // zelf staat al als "open" in .batches.json vóórdat verwerkPortie deze
  // aanroep start, dus hervatten blijft correct ook als deze aanroep wordt
  // afgebroken.
  const afbrekenController = new AbortController();
  process.on("SIGINT", () => {
    console.error("\nOnderbroken (Ctrl-C). Lopende claude -p aanroepen worden afgebroken; open porties blijven staan voor de volgende run.");
    afbrekenController.abort();
    process.exit(130);
  });

  console.log(
    `Tagger ${versie} met model ${TAGGER_MODEL} via claude -p, retailer "${retailer}", modus ${modus}, concurrency ${concurrency}`
  );

  let store: BatchesBestand = leesBatches(BATCHES_PAD);

  async function verwerkPortie(record: PortieRecord): Promise<{ ok: boolean; reden?: string }> {
    if (!record.producten || record.producten.length === 0) {
      const reden = `portie ${record.id} heeft geen producten in de administratie, kan niet hervat worden`;
      console.error(`  ${reden}. Verwijder deze regel handmatig uit ${BATCHES_PAD} en draai opnieuw.`);
      return { ok: false, reden };
    }

    console.log(`Portie ${record.id} (${record.aantal} producten, ${record.modus}): versturen naar claude -p...`);

    let fotoDir: string | null = null;
    const lokalePaden = new Map<string, string>();
    if (record.modus === "foto") {
      fotoDir = mkdtempSync(join(tmpdir(), "fitfi-tag-foto-"));
      for (const p of record.producten) {
        if (!p.image_url) continue;
        const doelPad = join(fotoDir, `${p.product_id}${extensieVoorUrl(p.image_url)}`);
        const ok = await downloadFoto(p.image_url, doelPad);
        if (ok) lokalePaden.set(p.product_id, doelPad);
        else console.log(`  waarschuwing: foto van ${p.product_id} kon niet worden opgehaald, gaat zonder foto mee.`);
      }
    }

    try {
      const opdracht = bouwOpdracht(record.producten, lokalePaden);
      const args = bouwClaudeArgs({
        model: TAGGER_MODEL,
        systeemPrompt: bouwSysteemPromptCli(),
        opdracht,
        jsonSchema: CLI_SCHEMA,
      });
      const respons = await voerClaudeCliUit(args, timeoutMsVoorPortie(record.aantal), afbrekenController.signal);
      const verwerkt = verwerkCliUitvoer(respons, record.producten, record.modus);

      if (verwerkt.mislukt) {
        console.log(`  mislukt: ${verwerkt.reden}. Portie blijft open, wordt bij de volgende run opnieuw geprobeerd.`);
        return { ok: false, reden: verwerkt.reden };
      }

      const geschreven = await schrijfRijen(supabase, verwerkt.rijen);
      if (verwerkt.fouten.length > 0) {
        mkdirSync(OUT, { recursive: true });
        const foutPad = join(OUT, `tag-fouten-${record.id}.json`);
        writeFileSync(foutPad, JSON.stringify(verwerkt.fouten, null, 2) + "\n");
        console.log(
          `  ${geschreven} rijen geschreven, ${verwerkt.fouten.length} fouten (zie ${foutPad}). ` +
            "Fouten blijven ongetagd en komen bij de volgende run terug."
        );
      } else {
        console.log(`  ${geschreven} rijen geschreven, 0 fouten.`);
      }
      if (typeof respons.total_cost_usd === "number") {
        const duur = typeof respons.duration_ms === "number" ? `, ${Math.round(respons.duration_ms / 1000)}s` : "";
        console.log(`  gerapporteerd equivalent verbruik: $${respons.total_cost_usd.toFixed(4)}${duur} (abonnement, geen factuur)`);
      }

      store = markeerVerwerkt(store, record.id);
      store = comprimeerVerwerkt(store, record.id);
      schrijfBatches(BATCHES_PAD, store);
      return { ok: true };
    } finally {
      if (fotoDir) rmSync(fotoDir, { recursive: true, force: true });
    }
  }

  // 1. Open porties van een eerdere run altijd eerst afronden, ook zonder --ja.
  const open = openBatches(store, retailer, modus) as PortieRecord[];
  if (open.length > 0) {
    console.log(`${open.length} portie(s) staan nog open van een eerdere run. Die worden eerst afgerond.`);
    const uitkomst = await voerMetConcurrency(open, concurrency, MAX_OPEENVOLGENDE_FOUTEN, verwerkPortie);
    if (uitkomst.gestopt) {
      console.error(
        `Gestopt tijdens het afronden van openstaande porties: ${uitkomst.reden}. ` +
          "Draai het commando opnieuw zodra de oorzaak is verholpen; niet-verwerkte porties blijven veilig staan."
      );
      process.exit(1);
    }
    // Eén mislukte portie op zichzelf triggert de stopregel hierboven niet
    // (die telt pas bij MAX_OPEENVOLGENDE_FOUTEN op rij), dus voerMetConcurrency
    // kan hier teruggeven zonder gestopt te zijn terwijl er toch nog een open
    // portie overblijft. Doorgaan naar nieuwe kandidaten zou dan hetzelfde
    // product in twee porties kunnen laten belanden: één keer als de oude,
    // nog openstaande portie (die zichzelf bij een volgende run weer aanbiedt)
    // en één keer in een net gemaakte nieuwe portie met dezelfde, nog
    // ongetagde producten. Geen dataverlies (keten_schrijf_tags is een
    // idempotente upsert), maar wel een dubbele, verspilde claude -p aanroep.
    // Waargenomen tijdens het testen van deze taak (taak-5-report.md).
    const nogOpen = openBatches(store, retailer, modus);
    if (nogOpen.length > 0) {
      console.error(
        `${nogOpen.length} portie(s) staan nog steeds open na een mislukte poging. Los dat eerst op (draai het ` +
          "commando opnieuw) voordat er nieuwe kandidaten worden opgehaald, anders kan hetzelfde product in twee " +
          "porties terechtkomen."
      );
      process.exit(1);
    }
  }

  // 2. Nieuwe kandidaten.
  const producten = await haalKandidaten(supabase, retailer, modus, limiet, (n) =>
    process.stdout.write(`\r  kandidaten opgehaald: ${n}`)
  );
  if (producten.length > 0) process.stdout.write("\n");
  if (producten.length === 0) {
    console.log("Niets te taggen: alle canonieke producten van deze retailer hebben deze versie al.");
    return;
  }

  const porties = splitsInPorties(producten, PORTIE_GROOTTE);
  const schatting = schatDroogeRun(porties, concurrency);
  console.log(
    `${producten.length} producten in ${schatting.aantalAanroepen} aanroep(en) van claude -p. ` +
      `Geschatte looptijd: ~${Math.max(1, Math.round(schatting.geschatteSeconden / 60))} minuten met concurrency ${concurrency}. ` +
      `Geschat equivalent verbruik: ~$${schatting.equivalentUsd.toFixed(2)} (indicatie op basis van de meting van 22 sept 2026, geen factuur).`
  );

  if (!ja) {
    console.log("Droge run. Voeg --ja toe om echt te versturen.");
    return;
  }

  const nieuweRecords: PortieRecord[] = porties.map((p) =>
    maakPortieRecord({ retailer, modus, tagger_version: versie, producten: p })
  );
  store = { batches: [...store.batches, ...nieuweRecords] };
  schrijfBatches(BATCHES_PAD, store);

  const uitkomst = await voerMetConcurrency(nieuweRecords, concurrency, MAX_OPEENVOLGENDE_FOUTEN, verwerkPortie);
  if (uitkomst.gestopt) {
    console.error(
      `Gestopt: ${uitkomst.reden}. Dit lijkt op een limiet of storing, niet op incidentele ruis. ` +
        "Nog niet verwerkte porties blijven open en worden bij de volgende run als eerste opgepakt."
    );
    process.exit(1);
  }

  console.log("Klaar.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
