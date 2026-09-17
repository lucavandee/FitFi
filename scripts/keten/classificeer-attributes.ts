/**
 * Schrijft de uitkomst van src/engine/productClassifier.ts naar
 * product_attributes (category, is_fashion, classifier_version), zodat
 * get_kandidaten per gecorrigeerde categorie afkapt en niet per ruwe.
 *
 * Leest products in pagina's van 1.000 (PostgREST-maximum), classificeert
 * lokaal en schrijft per 1.000 rijen via de RPC zet_classificatie
 * (alleen service_role). Idempotent: opnieuw draaien overschrijft met
 * dezelfde uitkomst.
 *
 * Hervatbaar via een lokaal checkpointbestand (de laatst verwerkte id) in
 * de systeem-tempmap, per classifier-versie en retailer-filter. Na elke
 * gelukte portie wordt het checkpoint bijgewerkt; bij een schone afronding
 * wordt het verwijderd. Een herstart na een afgebroken run leest het
 * checkpoint en gaat daar verder, in plaats van van voren af aan te
 * beginnen.
 *
 * Waarom geen filter op classifier_version in de leesquery zelf (het meer
 * voor de hand liggende "sla geclassificeerde rijen over"): getest op
 * 2026-09-16 en verworpen. product_attributes heeft geen index op
 * classifier_version; elke poging om dat in de leesquery te filteren
 * (join met product_attributes, of-conditie op classifier_version) dwong
 * Postgres tot een merge join die product_attributes bij iedere pagina
 * opnieuw van het begin scande (EXPLAIN ANALYZE: "Rows Removed by
 * Filter" gelijk aan het al geclassificeerde aantal, ongeacht de
 * id-ondergrens), 4-6+ seconden per pagina en oplopend naarmate er meer
 * rijen geclassificeerd zijn. Een lokaal checkpoint kost niets aan
 * databasezijde en heeft dat probleem niet.
 *
 * Elke lees- en schrijfstap heeft een kleine terugval (tot 4 pogingen, met
 * oplopende pauze) voor transiënte netwerkfouten: op een lange sequentiële
 * run van ~560 verzoeken kwam "TypeError: fetch failed" af en toe voor op
 * een portie die op zichzelf, opnieuw geprobeerd, gewoon las en schreef
 * (geverifieerd 2026-09-16 op portie 71001-72000: geen te grote payload,
 * geen kapotte tekens, 1000/1000 gelukt in isolatie). Dat wijst op een
 * verbinding die na veel verzoeken wordt gesloten, niet op een fout in de
 * data of de query; een paar hernieuwde pogingen lossen dat op zonder de
 * hele run te laten struikelen over één haperend verzoek.
 *
 * Veegronde na de paginering: products.id is een willekeurige uuid, dus de
 * cursor/checkpoint hierboven kan een rij missen die na het checkpoint is
 * toegevoegd met een uuid die vóór de cursor valt (en plan 2's
 * keten_vul_nieuwe_producten() zet na elke feed-import nieuwe rijen met
 * classifier_version null). Na de paginering roept dit script
 * src/services/attributes/veegronde.ts aan, die herhaaldelijk alle rijen
 * met classifier_version is null opvraagt (via de partiële index
 * idx_product_attributes_onbewerkt uit migratie 20260914120300) en die
 * alsnog classificeert, tot een ronde niets meer teruggeeft. Het checkpoint
 * blijft puur een versnelling: de veegronde vangt op wat de paginering
 * mist, ongeacht hoe oud het checkpoint is.
 *
 * Gebruik:
 *   SUPABASE_SERVICE_ROLE_KEY=... npm run keten:classificeer
 *   SUPABASE_SERVICE_ROLE_KEY=... npm run keten:classificeer -- --retailer "H&M (NL)"
 * VITE_SUPABASE_URL komt uit de shell of uit .env. De service-role-sleutel
 * komt alleen uit de shell en wordt nooit gelogd.
 *
 * Bekende beperking van --retailer: in deze omgeving loopt dat pad
 * structureel op de statement-timeout van 8 seconden die PostgREST via de
 * authenticator-rol op de sessie zet (ook voor service_role-verzoeken).
 * Oorzaak: geen index op products.retailer, dus elke retailer-filter is een
 * volledige tabel-scan (gemeten 2026-09-16: 7,4-8,0 s voor een retailer met
 * 19 rijen uit 281.999). Dat ligt buiten deze taak. Draai zonder --retailer
 * (dat pad gebruikt alleen products_pkey via order/limit en heeft dit
 * probleem niet); wil je één retailer controleren, doe dat na de run met
 * een gewone select via `supabase db query --linked` in plaats van via dit
 * script.
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { CLASSIFIER_VERSIE, classificeerRij, type ClassificatieRij } from "../../src/services/attributes/classificatie";
import { veegronde, type VeegrondeRij } from "../../src/services/attributes/veegronde";

function leesDotEnv(): Record<string, string> {
  const pad = new URL("../../.env", import.meta.url).pathname;
  if (!existsSync(pad)) return {};
  const uit: Record<string, string> = {};
  for (const regel of readFileSync(pad, "utf8").split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) uit[m[1]] = m[2];
  }
  return uit;
}

const dotenv = leesDotEnv();
const url = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Zet VITE_SUPABASE_URL (shell of .env) en SUPABASE_SERVICE_ROLE_KEY (alleen shell) in je omgeving."
  );
  process.exit(1);
}

const argRetailer = (() => {
  const i = process.argv.indexOf("--retailer");
  return i >= 0 ? process.argv[i + 1] : null;
})();

const PAGINA = 1000;
const client = createClient(url, serviceKey, { auth: { persistSession: false } });

const CHECKPOINT_PAD = `${process.env.TMPDIR ?? "/tmp"}/fitfi-keten-classificeer.${CLASSIFIER_VERSIE}.${
  argRetailer ? argRetailer.replace(/[^a-z0-9]+/gi, "_") : "alle"
}.checkpoint`;

function leesCheckpoint(): string | null {
  if (!existsSync(CHECKPOINT_PAD)) return null;
  const inhoud = readFileSync(CHECKPOINT_PAD, "utf8").trim();
  return inhoud.length > 0 ? inhoud : null;
}

function schrijfCheckpoint(laatsteId: string): void {
  writeFileSync(CHECKPOINT_PAD, laatsteId, "utf8");
}

function wisCheckpoint(): void {
  if (existsSync(CHECKPOINT_PAD)) unlinkSync(CHECKPOINT_PAD);
}

interface ProductRij {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  type: string | null;
  is_kids: boolean | null;
  retailer: string | null;
}

/**
 * Herhaalt een netwerkoproep bij een transiënte fout (bv. een gesloten
 * keep-alive-verbinding na veel opeenvolgende verzoeken). Geeft na de
 * laatste mislukte poging het laatste resultaat terug, zodat de aanroeper
 * zijn bestaande foutafhandeling op `error` ongewijzigd kan gebruiken.
 */
async function metHerhaling<T>(
  werk: () => Promise<{ data: T | null; error: { message: string } | null }>,
  omschrijving: string,
  log: (...args: unknown[]) => void,
  pogingen = 4
): Promise<{ data: T | null; error: { message: string } | null }> {
  let laatste: { data: T | null; error: { message: string } | null } = { data: null, error: null };
  for (let poging = 1; poging <= pogingen; poging++) {
    laatste = await werk();
    if (!laatste.error) return laatste;
    if (poging < pogingen) {
      const wachttijd = 500 * 2 ** (poging - 1);
      log(`  ${omschrijving} faalde (poging ${poging}/${pogingen}): ${laatste.error.message}. Nieuwe poging over ${wachttijd} ms.`);
      await new Promise((r) => setTimeout(r, wachttijd));
    }
  }
  return laatste;
}

async function main(): Promise<void> {
  // De classifier logt elke lage-confidence-rij naar console.warn; op 282.000
  // rijen is dat ruis. Tijdelijk dempen, tellen doen we zelf.
  const oorspronkelijkWarn = console.warn;
  const oorspronkelijkLog = console.log;
  console.warn = () => {};

  let gelezen = 0;
  let geschreven = 0;
  let laatsteId: string | null = leesCheckpoint();
  if (laatsteId) {
    oorspronkelijkLog(`Checkpoint gevonden (${CHECKPOINT_PAD}): hervat na id ${laatsteId}.`);
  }
  const perUitkomst: Record<string, number> = {};
  const gewijzigd: Record<string, number> = {};
  const start = Date.now();

  for (;;) {
    // Elke poging bouwt een verse query: de builder van supabase-js hoort
    // niet twee keer afgevuurd te worden, en dit sluit elke twijfel daarover
    // uit voor metHerhaling hieronder.
    const bouwLeesQuery = () => {
      let q = client
        .from("products")
        .select("id, name, description, category, type, is_kids, retailer")
        .order("id", { ascending: true })
        .limit(PAGINA);
      if (laatsteId) q = q.gt("id", laatsteId);
      if (argRetailer) q = q.eq("retailer", argRetailer);
      return q;
    };

    const { data, error } = await metHerhaling(bouwLeesQuery, "lezen van products", oorspronkelijkLog);
    if (error) throw new Error(`lezen van products faalde: ${error.message}`);
    const rijen = (data ?? []) as ProductRij[];
    if (rijen.length === 0) break;

    const batch: ClassificatieRij[] = rijen.map((r) => {
      const uit = classificeerRij(r);
      const sleutel = uit.category ?? (uit.is_fashion ? "onbekend" : "afgewezen");
      perUitkomst[sleutel] = (perUitkomst[sleutel] ?? 0) + 1;
      const ruw = (r.category ?? "").toLowerCase();
      if (uit.category && uit.category !== ruw) {
        const k = `${ruw || "leeg"} -> ${uit.category}`;
        gewijzigd[k] = (gewijzigd[k] ?? 0) + 1;
      }
      return uit;
    });

    const { data: aantal, error: schrijfFout } = await metHerhaling(
      () => client.rpc("zet_classificatie", { p_rijen: batch, p_versie: CLASSIFIER_VERSIE }),
      "zet_classificatie",
      oorspronkelijkLog
    );
    if (schrijfFout) throw new Error(`zet_classificatie faalde: ${schrijfFout.message}`);

    gelezen += rijen.length;
    geschreven += Number(aantal ?? 0);
    laatsteId = rijen[rijen.length - 1].id;
    schrijfCheckpoint(laatsteId);

    if (gelezen % 20000 === 0) {
      oorspronkelijkLog(`  ${gelezen} gelezen, ${geschreven} geschreven, ${Math.round((Date.now() - start) / 1000)} s`);
    }
    if (rijen.length < PAGINA) break;
  }

  oorspronkelijkLog(`\nPaginering klaar: ${gelezen} gelezen, ${geschreven} geschreven in ${Math.round((Date.now() - start) / 1000)} s`);
  oorspronkelijkLog("Uitkomst per categorie:", perUitkomst);
  oorspronkelijkLog("Gewijzigd ten opzichte van products.category (top 15):");
  Object.entries(gewijzigd)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([k, v]) => oorspronkelijkLog(`  ${k.padEnd(24)} ${v}`));

  if (geschreven < gelezen) {
    console.warn = oorspronkelijkWarn;
    oorspronkelijkLog(
      `\nLet op: ${gelezen - geschreven} rijen niet geschreven. Meestal: product_attributes mist die rijen (draai eerst npm run keten:vul).`
    );
    process.exit(1);
  }

  // Veegronde: vangt rijen die de paginering kan hebben gemist (zie
  // docstring hierboven) en de rijen die plan 2's
  // keten_vul_nieuwe_producten() na een feed-import achterlaat. Bij een
  // schone catalogus is dit één lege ronde.
  const veegStart = Date.now();
  const veegResultaat = await veegronde(PAGINA, {
    haalOnbewerkt: async (limiet) => {
      const { data, error } = await metHerhaling(
        () =>
          client
            .from("product_attributes")
            .select("products!inner(id, name, description, category, type, is_kids)")
            .is("classifier_version", null)
            .order("product_id", { ascending: true })
            .limit(limiet),
        "veegronde: lezen van onbewerkte rijen",
        oorspronkelijkLog
      );
      if (error) return { data: null, error };
      const rijen = ((data ?? []) as Array<{ products: VeegrondeRij }>).map((r) => r.products);
      return { data: rijen, error: null };
    },
    schrijf: (batch) =>
      metHerhaling(
        () => client.rpc("zet_classificatie", { p_rijen: batch, p_versie: CLASSIFIER_VERSIE }),
        "veegronde: zet_classificatie",
        oorspronkelijkLog
      ),
    log: oorspronkelijkLog,
  });

  console.warn = oorspronkelijkWarn;
  oorspronkelijkLog(
    `Veegronde klaar: ${veegResultaat.gevonden} onbewerkte rijen gevonden, ${veegResultaat.geschreven} geschreven in ${Math.round((Date.now() - veegStart) / 1000)} s`
  );

  if (veegResultaat.geschreven < veegResultaat.gevonden) {
    oorspronkelijkLog(
      `\nLet op: veegronde vond ${veegResultaat.gevonden - veegResultaat.geschreven} rijen die niet weggeschreven konden worden.`
    );
    process.exit(1);
  }

  // Schone afronding: dit checkpoint is niet meer nodig. Pas hier wissen,
  // na de veegronde, zodat een checkpoint dat een gat had nooit stilzwijgend
  // rijen achterlaat (zie docstring: de veegronde is wat dat garandeert).
  wisCheckpoint();
}

main().catch((e) => {
  console.error("Script gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
