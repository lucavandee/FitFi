/**
 * Pure(re) kern van de tag-CLI (taak 5): alles wat rond `claude -p` zit en
 * apart getest kan worden zonder een subprocess te starten of de database te
 * raken. tag-products.ts is de dunne orkestrator die dit aan elkaar knoopt.
 *
 * Waarom een los bestand naast tag-products.ts: tag-products.ts roept
 * main().catch(...) onvoorwaardelijk aan zodra het geïmporteerd wordt (net als
 * de andere keten-scripts, zie persona-run.ts). Een testbestand dat daaruit
 * importeert zou dus een echte run starten. Dit bestand heeft geen
 * top-level neveneffecten, dus is veilig te importeren vanuit vitest. Dezelfde
 * scheiding als tagging.ts (taak 3) en batchesStore.ts (taak 4) al toepassen.
 *
 * AMENDEMENT (Luc, 22 sept 2026) in taak-5-brief.md verving de Anthropic Batch
 * API door `claude -p` op het abonnement. Dit bestand implementeert die weg:
 * - bouwClaudeArgs bouwt de argv voor `claude -p`, nooit met --bare.
 * - CLI_SCHEMA is een deviatie t.o.v. de brief: de brief testte `claude -p`
 *   zonder --json-schema en ving daardoor ```json-hekjes op die gestript
 *   moesten worden. Deze CLI-versie (2.1.120) heeft een --json-schema vlag die
 *   gevalideerde JSON teruggeeft in structured_output, zonder hekjes. Getest
 *   op 22 sept 2026 (zie taak-5-report.md). verwerkCliUitvoer gebruikt dat pad
 *   als eerste keuze en valt terug op het hekjes-strippen van `result` als
 *   structured_output ontbreekt, voor het geval een oudere CLI-versie draait.
 * - Eén `claude -p`-aanroep tagt een hele portie (PORTIE_GROOTTE producten)
 *   tegelijk, niet één product per aanroep: dat is wat op 22 sept is gemeten
 *   (100 producten per aanroep amortiseert de ~55s opstartkosten). Elk product
 *   krijgt een nummer; het model geeft dat nummer terug als "index" in elk
 *   tag-object, zodat de uitvoer op inhoud (niet op volgorde) teruggekoppeld
 *   kan worden aan een product_id.
 */
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { promisify } from "node:util";
import type { SupabaseClient } from "@supabase/supabase-js";
import { openBatches, type BatchesBestand, type BatchRecord } from "./batchesStore";
import {
  TAG_SCHEMA,
  TAGGER_VERSION,
  TAGGER_VERSION_FOTO,
  bouwGebruikersTekst,
  bouwSysteemPrompt,
  valideerTags,
  type Modus,
  type TagProduct,
  type TagRij,
} from "./tagging";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Constanten
// ---------------------------------------------------------------------------

// Gemeten 22 sept 2026: 100 producten in één aanroep amortiseert de vaste
// opstartkosten (~55s) tienvoudig t.o.v. porties van 10. Zie amendement in
// taak-5-brief.md.
export const PORTIE_GROOTTE = 100;

// "een lage standaardwaarde (vier)", letterlijk uit het amendement. Als vlag,
// niet hardgecodeerd: zie --concurrency in tag-products.ts.
export const CONCURRENCY_STANDAARD = 4;

// Aantal opeenvolgende MISLUKTE porties (de hele aanroep leverde niets
// bruikbaars op, geen individuele contentfout) voordat het script stopt in
// plaats van doorrammen. Geen exacte foutmelding om op te matchen: de brief
// heeft zelf nooit een echte limiet geraakt, dus er is geen bekende
// fouttekst. Een reeks van 3 mislukkingen achter elkaar (bij concurrency 4
// dus vrijwel de hele pool) is een sterker signaal van een structureel
// probleem (limiet, storing, kapotte auth) dan van toevallige ruis.
export const MAX_OPEENVOLGENDE_FOUTEN = 3;

// ---------------------------------------------------------------------------
// Tijd- en kostenmodel.
//
// IJkpunt: PORTIE_GROOTTE = 100, want dat is de portiegrootte die het script
// ZELF gebruikt voor elke aanroep (op de laatste, kleinere restportie van een
// ronde na). Fixronde (controller, 22 sept 2026): een eerdere versie van dit
// bestand mat --json-schema op porties van 25 en leidde daar een enkele
// factor JSON_SCHEMA_OPSLAG = 2 uit af, toegepast op zowel tijd als kosten.
// Dat was op twee manieren fout:
// 1. Tijd en kosten gedragen zich verschillend onder --json-schema (zie
//    hieronder: sneller, maar duurder). Eén gedeelde factor kan dat per
//    definitie niet allebei goed weergeven.
// 2. Een portie van 25 is niet representatief voor een portie van 100: de
//    vaste opstartkosten (~55s, zie OPSTART_SECONDEN) wegen bij 25 producten
//    veel zwaarder mee dan bij 100, dus een op 25 gemeten verhouding
//    extrapoleert niet naar de portiegrootte die de ronde echt gebruikt.
// De controller draaide een schone A/B op exact dezelfde 100 producten, met
// en zonder --json-schema:
//   met  --json-schema: 132s, num_turns 2, $0.212
//   zonder --json-schema: 194s, num_turns 1, $0.148
// Dat geeft TIJD_FACTOR_MET_SCHEMA ≈ 0.68 (32% SNELLER, niet trager) en
// KOSTEN_FACTOR_MET_SCHEMA ≈ 1.43 (43% duurder, niet 2x). Beide factoren zijn
// dus GEEN afgeleiden van elkaar en apart gehouden.
//
// LET OP voor de volgende lezer (dit is precies waar de vorige versie in
// liep): deze twee factoren zijn gekalibreerd op n = 100. Ze zijn niet
// gevalideerd voor veel kleinere porties (bijvoorbeeld een handmatige
// --limit 10/25-proefrun). Bij zo'n kleine n kan zowel de droge-run-schatting
// als de afgeleide subprocess-timeout (timeoutMsVoorPortie) afwijken van wat
// je in de praktijk ziet: eigen metingen tijdens taak 5 op n = 25 met
// --json-schema toonden een spreiding van ~78s tot >180s, wat noch met de
// oude (2x) noch met deze nieuwe (0.68x) tijdfactor goed te voorspellen is.
// Voor de echte 91.650-producten-ronde (die vrijwel uitsluitend porties van
// 100 gebruikt) is dat geen probleem; voor een kleine proefrun kan het
// script vaker een gezonde-maar-trage aanroep op de time-out laten lopen dan
// dit model doet vermoeden. De tijdens een --ja-run geprinte
// duration_ms/total_cost_usd per aanroep (zie tag-products.ts) blijven de
// echte referentie, dit model is alleen de schatting vooraf.
// ---------------------------------------------------------------------------

// Basis (ZONDER --json-schema), twee ECHTE metingen: 69s/$0.044 bij 10
// producten (amendement taak-5-brief.md, 22 sept 2026) en 194s/$0.148 bij
// 100 producten (controllers A/B, fixronde 22 sept 2026 — dit verving de
// oudere extrapolatie van $0.11 bij 100 uit het amendement zelf, die geen
// echte meting was maar "eigenaars eigen extrapolatie").
export const OPSTART_SECONDEN = 55; // 55 + 1.4*10 ≈ 69, 55 + 1.4*100 ≈ 195 ≈ 194 gemeten
export const SECONDEN_PER_PRODUCT = 1.4;
export const BASIS_KOSTEN_USD = 0.03244; // basis + 10k = 0.044, basis + 100k = 0.148
export const PER_PRODUCT_KOSTEN_USD = 0.0011556;

// Factoren MET --json-schema (wat het script echt gebruikt), gekalibreerd op
// n = 100: 132/194 ≈ 0.6804 (tijd) en 0.212/0.148 ≈ 1.4324 (kosten). Apart
// gehouden, precies omdat ze niet gelijk zijn (zie uitleg hierboven).
export const TIJD_FACTOR_MET_SCHEMA = 132 / 194;
export const KOSTEN_FACTOR_MET_SCHEMA = 0.212 / 0.148;

export function geschatteSecondenVoorPortie(aantalProducten: number): number {
  return TIJD_FACTOR_MET_SCHEMA * (OPSTART_SECONDEN + SECONDEN_PER_PRODUCT * aantalProducten);
}

export function schatEquivalentUsd(aantalProducten: number): number {
  return KOSTEN_FACTOR_MET_SCHEMA * (BASIS_KOSTEN_USD + aantalProducten * PER_PRODUCT_KOSTEN_USD);
}

// Extra veiligheidsmarge BOVENOP de tijdschatting voor de subprocess-timeout,
// zodat een gezonde-maar-trage aanroep niet op de rand wordt afgebroken. Ook
// deze marge is alleen expliciet gevalideerd rond n = 100 (132s schatting →
// 198s time-out, ruim boven de gemeten 132s); zie de waarschuwing hierboven
// over kleinere porties.
export const TIMEOUT_VEILIGHEIDSMARGE = 1.5;

export function timeoutMsVoorPortie(aantalProducten: number): number {
  return Math.round(geschatteSecondenVoorPortie(aantalProducten) * TIMEOUT_VEILIGHEIDSMARGE * 1000);
}

export interface DroogeRunSchatting {
  aantalAanroepen: number;
  geschatteSeconden: number;
  equivalentUsd: number;
}

export function schatDroogeRun(porties: TagProduct[][], concurrency: number): DroogeRunSchatting {
  const totaalSeconden = porties.reduce((som, p) => som + geschatteSecondenVoorPortie(p.length), 0);
  const equivalentUsd = porties.reduce((som, p) => som + schatEquivalentUsd(p.length), 0);
  const werkers = Math.max(1, Math.min(concurrency, porties.length || 1));
  return {
    aantalAanroepen: porties.length,
    geschatteSeconden: Math.round(totaalSeconden / werkers),
    equivalentUsd,
  };
}

// ---------------------------------------------------------------------------
// Porties
// ---------------------------------------------------------------------------

export function splitsInPorties<T>(items: T[], grootte: number): T[][] {
  if (grootte <= 0) throw new Error("splitsInPorties: grootte moet positief zijn");
  const porties: T[][] = [];
  for (let i = 0; i < items.length; i += grootte) {
    porties.push(items.slice(i, i + grootte));
  }
  return porties;
}

// Een "batch" (taak 4) is hier een portie producten, geen Batch API-id (zie
// amendement). producten staat NIET in BatchRecord (taak 4 blijft
// ongewijzigd); dit is een lokale uitbreiding zodat een open portie zichzelf
// kan hervatten zonder opnieuw bij de database te hoeven aankloppen. Zodra
// een portie verwerkt is, halen we producten er via comprimeerVerwerkt weer
// af: bij 91.650 producten zou .batches.json anders tot in het oneindige
// blijven groeien met data die niemand meer nodig heeft.
export interface PortieRecord extends BatchRecord {
  producten: TagProduct[];
}

export function maakPortieRecord(opts: {
  retailer: string;
  modus: Modus;
  tagger_version: string;
  producten: TagProduct[];
}): PortieRecord {
  return {
    id: randomUUID(),
    retailer: opts.retailer,
    modus: opts.modus,
    tagger_version: opts.tagger_version,
    aantal: opts.producten.length,
    aangemaakt: new Date().toISOString(),
    status: "open",
    producten: opts.producten,
  };
}

export function comprimeerVerwerkt(store: BatchesBestand, id: string): BatchesBestand {
  return {
    batches: store.batches.map((b) => {
      if (b.id !== id) return b;
      const rest: Partial<PortieRecord> = { ...(b as PortieRecord) };
      delete rest.producten;
      return rest as BatchRecord;
    }),
  };
}

export interface OpenPortiesControle {
  moetStoppen: boolean;
  aantalPorties: number;
  aantalProducten: number;
}

/**
 * Controleert of er, ondanks een niet-gestopte voerMetConcurrency-aanroep,
 * toch nog open porties over zijn. voerMetConcurrency's stopregel telt pas
 * bij MAX_OPEENVOLGENDE_FOUTEN mislukkingen OP RIJ (zie voerMetConcurrency
 * hieronder); verspreide, niet-opeenvolgende mislukkingen (een paar
 * time-outs met geslaagde porties ertussen) triggeren die stopregel nooit,
 * maar laten wel degelijk producten zonder tagger_version achter.
 *
 * Fixronde 2 (controller, 22 sept 2026): zonder een aparte controle NA elke
 * voerMetConcurrency-aanroep eindigt tag-products.ts dan met "Klaar." en
 * exitcode 0, terwijl er nog open porties (met producten zonder
 * tagger_version) in .batches.json staan. Bij een onbeheerde ronde van
 * tientallen minuten tot uren ziet iemand die alleen de laatste regel of de
 * exitcode checkt dan succes waar dat niet klopt: precies wat het amendement
 * uitsluit ("stopt met een duidelijke melding in plaats van stil producten
 * over te slaan"). tag-products.ts roept dit na ZOWEL de hervat-fase als de
 * hoofdronde aan; de eerste keer voorkwam dit ook al een dubbele-portie-bug
 * (zie taak-5-report.md), de tweede plek (na de hoofdronde) ontbrak in de
 * eerste versie van deze taak en is in deze fixronde toegevoegd.
 */
export function controleerGeenOpenPortiesMeer(store: BatchesBestand, retailer: string, modus: Modus): OpenPortiesControle {
  const nogOpen = openBatches(store, retailer, modus);
  return {
    moetStoppen: nogOpen.length > 0,
    aantalPorties: nogOpen.length,
    aantalProducten: nogOpen.reduce((som, b) => som + b.aantal, 0),
  };
}

// ---------------------------------------------------------------------------
// Prompt-opbouw
// ---------------------------------------------------------------------------

export function bouwSysteemPromptCli(): string {
  return [
    bouwSysteemPrompt(),
    "",
    'Je krijgt een genummerde lijst van producten ("Product 1", "Product 2", ...). Geef een JSON-object ' +
      'terug met een array "items": precies één object per product, met een veld "index" gelijk aan het ' +
      "productnummer hierboven, plus de gevraagde velden per product. Geen andere tekst, geen markdown-codeblok.",
  ].join("\n");
}

export function bouwProductBlok(p: TagProduct, nr: number, lokaalPad?: string): string {
  const regels = [`Product ${nr}:`, bouwGebruikersTekst(p)];
  if (lokaalPad) regels.push(`Foto: @${lokaalPad}`);
  return regels.join("\n");
}

export function bouwOpdracht(producten: TagProduct[], lokalePaden: Map<string, string> = new Map()): string {
  const blokken = producten.map((p, i) => bouwProductBlok(p, i + 1, lokalePaden.get(p.product_id)));
  return [
    `Tag de volgende ${producten.length} producten volgens de systeeminstructies. Geef uitsluitend het ` +
      'JSON-object met "items" terug.',
    "",
    blokken.join("\n\n"),
  ].join("\n");
}

// JSON Schema voor `claude -p --json-schema`: TAG_SCHEMA (taak 3, spec 5.1)
// gewikkeld in een items-array met een index per product. TAG_SCHEMA zelf
// blijft de enige bron van waarheid voor de tagvelden.
export const CLI_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", ...TAG_SCHEMA.required],
        properties: {
          index: { type: "integer" },
          ...TAG_SCHEMA.properties,
        },
      },
    },
  },
} as const;

export function strippenJsonHekjes(tekst: string): string {
  return tekst
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
}

// ---------------------------------------------------------------------------
// claude -p aanroepen
// ---------------------------------------------------------------------------

// Nooit --bare (die vlag leest uitsluitend ANTHROPIC_API_KEY/apiKeyHelper en
// negeert OAuth en keychain, dus dan draait het niet op het abonnement).
// --allowed-tools "" schakelt alle tools uit: taggen heeft er geen nodig en
// elke tool vergroot alleen de systeemprompt (en dus de opstartkosten).
export function bouwClaudeArgs(opts: {
  model: string;
  systeemPrompt: string;
  opdracht: string;
  jsonSchema: unknown;
}): string[] {
  return [
    "-p",
    "--model",
    opts.model,
    "--allowed-tools",
    "",
    "--append-system-prompt",
    opts.systeemPrompt,
    "--json-schema",
    JSON.stringify(opts.jsonSchema),
    "--output-format",
    "json",
    opts.opdracht,
  ];
}

export interface ClaudeCliResultaat {
  is_error?: boolean;
  subtype?: string;
  result?: string;
  total_cost_usd?: number;
  duration_ms?: number;
  structured_output?: { items?: unknown[] } | null;
  [key: string]: unknown;
}

/**
 * Start `claude` als subprocess (execFile, geen shell: argumenten gaan
 * letterlijk door, dus een productbeschrijving met quotes of `$` erin kan de
 * aanroep niet beïnvloeden). Geeft altijd een ClaudeCliResultaat terug, ook
 * bij een fout: die zet dan is_error zodat verwerkCliUitvoer één plek heeft
 * om fouten te herkennen.
 *
 * `signal` (optioneel): gekoppeld aan tag-products.ts' SIGINT-afhandeling.
 * Zonder dit bleef een `claude -p` subprocess bij Ctrl-C gewoon doorlopen als
 * wees nadat het eigen Node-proces al gestopt was (waargenomen tijdens de
 * hervattest van taak 5, 22 sept 2026: `ps aux` toonde de aanroep nog minuten
 * later actief, terwijl `npx vite-node ...` al weg was). execFile stuurt bij
 * een abort een SIGTERM naar het kindproces, dus met een gekoppelde
 * AbortController stopt de echte aanroep mee met Ctrl-C.
 */
export async function voerClaudeCliUit(args: string[], timeoutMs: number, signal?: AbortSignal): Promise<ClaudeCliResultaat> {
  try {
    const { stdout } = await execFileAsync("claude", args, {
      timeout: timeoutMs,
      maxBuffer: 20 * 1024 * 1024,
      signal,
    });
    try {
      return JSON.parse(stdout) as ClaudeCliResultaat;
    } catch {
      return { is_error: true, result: `kon de uitvoer van claude -p niet als JSON lezen: ${stdout.slice(0, 500)}` };
    }
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { stdout?: string; stderr?: string; killed?: boolean; signal?: string };
    if (signal?.aborted) {
      return { is_error: true, result: "onderbroken (Ctrl-C)" };
    }
    if (e.killed || e.signal === "SIGTERM") {
      return { is_error: true, result: `time-out na ${Math.round(timeoutMs / 1000)}s` };
    }
    const stderrSnippet = (e.stderr ?? "").toString().trim().slice(0, 500);
    return {
      is_error: true,
      result: `claude -p faalde (${e.code ?? "onbekende exitcode"}): ${stderrSnippet || e.message}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Uitvoer verwerken
// ---------------------------------------------------------------------------

export interface CliVerwerkResultaat {
  mislukt: boolean;
  reden?: string;
  rijen: TagRij[];
  fouten: { product_id: string; reden: string }[];
}

/**
 * Vertaalt het antwoord van claude -p terug naar TagRij's, gekoppeld op de
 * "index" die het model per product teruggeeft (niet op array-positie: een
 * model dat één product overslaat mag de rest niet laten opschuiven).
 *
 * Twee soorten fouten, met opzet verschillend behandeld:
 * - mislukt: de hele aanroep leverde niets bruikbaars op (fout, time-out,
 *   onparseerbare of lege uitvoer). De portie blijft "open" en wordt bij de
 *   volgende run opnieuw geprobeerd (zie tag-products.ts) én telt mee voor de
 *   stop-bij-opeenvolgende-mislukkingen in voerMetConcurrency.
 * - fouten (per product): de aanroep zelf lukte, maar dit ene product mist of
 *   valt buiten het schema. Die rij wordt niet geschreven en blijft dus
 *   ongetagd; de RPC biedt hem bij de eerstvolgende scriptrun gewoon weer aan
 *   als kandidaat. Dit telt niet als "mislukt": één rotte appel stopt de
 *   portie niet.
 */
export function verwerkCliUitvoer(
  respons: ClaudeCliResultaat,
  producten: TagProduct[],
  modus: Modus
): CliVerwerkResultaat {
  if (respons.is_error) {
    return {
      mislukt: true,
      reden: `claude -p meldde een fout: ${respons.result || respons.subtype || "onbekend"}`,
      rijen: [],
      fouten: [],
    };
  }

  let items: unknown[] | null = null;
  const structured = respons.structured_output;
  if (structured && Array.isArray(structured.items)) {
    items = structured.items;
  } else {
    try {
      const obj = JSON.parse(strippenJsonHekjes(respons.result ?? ""));
      if (obj && Array.isArray((obj as { items?: unknown }).items)) {
        items = (obj as { items: unknown[] }).items;
      }
    } catch {
      items = null;
    }
  }

  if (!items) {
    return {
      mislukt: true,
      reden: "geen bruikbare JSON-uitvoer (geen structured_output, en result was niet als JSON te lezen)",
      rijen: [],
      fouten: [],
    };
  }
  if (items.length === 0 && producten.length > 0) {
    return {
      mislukt: true,
      reden: `lege items-array (0 van de ${producten.length} producten), waarschijnlijk een geweigerd of afgekapt antwoord`,
      rijen: [],
      fouten: [],
    };
  }

  const versie = modus === "foto" ? TAGGER_VERSION_FOTO : TAGGER_VERSION;
  const rijen: TagRij[] = [];
  const fouten: { product_id: string; reden: string }[] = [];
  const geziene = new Set<number>();

  for (const ruwItem of items) {
    if (!ruwItem || typeof ruwItem !== "object") continue;
    const { index, ...rest } = ruwItem as Record<string, unknown>;
    const i = Number(index);
    if (!Number.isInteger(i) || i < 1 || i > producten.length) continue;
    if (geziene.has(i)) continue;
    geziene.add(i);

    const product = producten[i - 1];
    const tags = valideerTags(rest);
    if (!tags) {
      fouten.push({ product_id: product.product_id, reden: "waarde buiten schema" });
      continue;
    }
    rijen.push({ ...tags, product_id: product.product_id, tagger_version: versie });
  }

  producten.forEach((p, idx) => {
    if (!geziene.has(idx + 1)) {
      fouten.push({ product_id: p.product_id, reden: "geen tag ontvangen van het model (ontbreekt in de uitvoer)" });
    }
  });

  return { mislukt: false, rijen, fouten };
}

// ---------------------------------------------------------------------------
// Foto's lokaal ophalen (voor modus "foto")
// ---------------------------------------------------------------------------
//
// `claude -p` heeft geen vlag om een afbeelding via een remote URL mee te
// geven (geverifieerd tegen --help van CLI 2.1.120: geen --image-achtige
// optie) en met --allowed-tools "" kan het model ook geen WebFetch gebruiken
// om er zelf een op te halen. Wat wél werkt (getest 22 sept 2026, zie
// taak-5-report.md): een lokaal bestand meegeven als `@pad/naar/bestand.jpg`
// in de prompttekst, ook met alle tools uitgeschakeld — dat is dezelfde
// attachment-mechaniek als in de interactieve UI, geen tool-aanroep. Dus:
// eerst zelf (met gewone fetch, geen Claude-tool) de foto lokaal zetten, dan
// pas @pad in de opdracht zetten. Dit is niet expliciet in de brief
// beschreven (die gaat alleen over tekstmodus-metingen); zie taak-5-report.md
// voor deze afwijking.

export function extensieVoorUrl(url: string): string {
  try {
    const pad = new URL(url).pathname;
    const punt = pad.lastIndexOf(".");
    if (punt === -1) return ".jpg";
    const ext = pad.slice(punt).toLowerCase();
    if (ext === ".jpeg") return ".jpg";
    if (/^\.(jpg|png|webp|gif)$/.test(ext)) return ext;
    return ".jpg";
  } catch {
    return ".jpg";
  }
}

export async function downloadFoto(
  url: string,
  doelPad: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  try {
    const resp = await fetchImpl(url);
    if (!resp.ok) return false;
    const buf = Buffer.from(await resp.arrayBuffer());
    writeFileSync(doelPad, buf);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Concurrency met stopregel
// ---------------------------------------------------------------------------

export interface ConcurrencyUitkomst {
  gestopt: boolean;
  reden?: string;
}

/**
 * Verwerkt items met maximaal `concurrency` gelijktijdige `werk`-aanroepen.
 * Stopt met het ophalen van NIEUWE items zodra `maxOpeenvolgendeFouten`
 * mislukkingen op rij zijn geteld (een succes reset de teller); reeds
 * lopende aanroepen worden niet afgebroken, ze maken gewoon af waar ze mee
 * bezig zijn. Dit is de "stop met een duidelijke melding i.p.v. doorrammen
 * of stil falen"-regel uit het amendement, generiek gemaakt: in plaats van
 * te gokken op een letterlijke limiet-foutmelding (die de brief niet geeft,
 * want niemand heeft de limiet echt geraakt) reageert dit op het patroon
 * "meerdere aanroepen op rij leveren niets op", wat zowel een abonnements-
 * limiet als een storing (kapotte auth, netwerk weg) dekt.
 */
export async function voerMetConcurrency<T>(
  items: T[],
  concurrency: number,
  maxOpeenvolgendeFouten: number,
  werk: (item: T) => Promise<{ ok: boolean; reden?: string }>
): Promise<ConcurrencyUitkomst> {
  let volgende = 0;
  let opeenvolgendeFouten = 0;
  let gestopt = false;
  let reden: string | undefined;

  async function worker(): Promise<void> {
    for (;;) {
      if (gestopt) return;
      if (volgende >= items.length) return;
      const i = volgende;
      volgende += 1;
      const uitslag = await werk(items[i]);
      if (uitslag.ok) {
        opeenvolgendeFouten = 0;
      } else {
        opeenvolgendeFouten += 1;
        if (opeenvolgendeFouten >= maxOpeenvolgendeFouten && !gestopt) {
          gestopt = true;
          reden = uitslag.reden;
        }
      }
    }
  }

  const aantalWerkers = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: aantalWerkers }, () => worker()));
  return { gestopt, reden };
}

// ---------------------------------------------------------------------------
// Supabase: kandidaten lezen, tags schrijven
// ---------------------------------------------------------------------------

export const KANDIDATEN_PAGINA = 1000;
export const SCHRIJF_CHUNK = 500;

type RpcClient = Pick<SupabaseClient, "rpc">;

export async function haalKandidaten(
  supabase: RpcClient,
  retailer: string,
  modus: Modus,
  limiet: number,
  voortgang: (aantal: number) => void = () => {}
): Promise<TagProduct[]> {
  const alles: TagProduct[] = [];
  let after: string | null = null;
  for (;;) {
    const { data, error } = await supabase.rpc("keten_tag_kandidaten", {
      p_retailer: retailer,
      p_modus: modus,
      p_versie: TAGGER_VERSION,
      p_limit: KANDIDATEN_PAGINA,
      p_after: after,
    });
    if (error) throw new Error(`keten_tag_kandidaten: ${error.message}`);
    const pagina = (data ?? []) as TagProduct[];
    alles.push(...pagina);
    voortgang(alles.length);
    if (pagina.length < KANDIDATEN_PAGINA) break;
    if (limiet > 0 && alles.length >= limiet) break;
    after = pagina[pagina.length - 1].product_id;
  }
  return limiet > 0 ? alles.slice(0, limiet) : alles;
}

export async function schrijfRijen(supabase: RpcClient, rijen: TagRij[]): Promise<number> {
  let geschreven = 0;
  for (let i = 0; i < rijen.length; i += SCHRIJF_CHUNK) {
    const chunk = rijen.slice(i, i + SCHRIJF_CHUNK);
    const { data, error } = await supabase.rpc("keten_schrijf_tags", { p_rijen: chunk });
    if (error) throw new Error(`keten_schrijf_tags: ${error.message}`);
    geschreven += Number(data ?? 0);
  }
  return geschreven;
}
