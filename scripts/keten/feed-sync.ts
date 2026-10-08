/**
 * Synchroniseert een Daisycon-feed met de catalogus: prijzen, links en voorraad
 * van bestaande producten, nieuwe producten, en wat uit de feed verdwenen is.
 * Draait op de Mac, schrijft alleen wat veranderd is, en doet standaard niets
 * zonder --ja.
 *
 * Waarom een script en niet de edge function import-daisycon-feed: de H&M-feed
 * is 237 MB, de function herschrijft elke rij (ongeveer 1 GB op een schijf van
 * 11 tot 15 MB/s) en zet verdwenen producten nooit uit voorraad. Bovendien gaf
 * H&M sinds april andere product-ID's: van de 88.043 rijen uit maart had er geen
 * enkele nog een id in de feed. Oude rijen worden daarom op artikelnummer en
 * maat aan de nieuwe feedregels gekoppeld (zie feed-sync/profielen.ts), zodat
 * tags, embeddings en de pool bewaard blijven.
 *
 * Gebruik (alles standaard een droge run):
 *   npm run keten:feed-sync -- --retailer "H&M (NL)"
 *   npm run keten:feed-sync -- --retailer "H&M (NL)" --bestand pad/naar/feed.json
 *   npm run keten:feed-sync -- --fase a --ja [--limiet 200]
 *   npm run keten:feed-sync -- --fase b --ja [--sta-veel-weg-toe]
 *   npm run keten:feed-sync -- --terugdraaien <map met snapshot> --ja
 *
 * Fasen:
 *   a  bestaande producten verversen (herkoppelen, prijs, link, beeld) en nieuwe toevoegen.
 *   b  wat uit de feed verdwenen is uit voorraad zetten en de canonieke rij van een
 *      foto-groep laten overgaan op een maat die er nog is.
 * Tussen a en b hoort de rest van de keten: keten_vul_nieuwe_producten (attributen voor
 * de nieuwe rijen), keten:classificeer en bij voorkeur eerst taggen, zodat de pool niet
 * even leger is dan nodig. De uitleg staat onderaan bij "Volgende stappen" in de uitvoer.
 *
 * Omgeving: SUPABASE_URL (of VITE_SUPABASE_URL) en SUPABASE_SERVICE_ROLE_KEY; voor de
 * gezondheidscheck tijdens het schrijven ook VITE_SUPABASE_ANON_KEY. Waarden worden nooit
 * gelogd, ook de feed-URL niet.
 */
import { createWriteStream, createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mapFeedProduct, type FeedProduct, type OverslaanReden } from "../../supabase/functions/_shared/daisyconRows";
import { heeftVlag, leesVlag } from "./args";
import { leesEnv } from "./env";
import { STANDAARD_RETAILER } from "./retailers";
import { beoordeel } from "./feed-sync/bewaking";
import { leesFeed, type FeedKop } from "./feed-sync/feedLezer";
import { maakPlan, naarFeedRij, type DbRij, type FeedRij, type Koppeling, type Plan } from "./feed-sync/plan";
import { profielVoor, type Profiel } from "./feed-sync/profielen";

const PAGINA = 1000;
const STANDAARD_BATCH = 400;
const STANDAARD_PAUZE_MS = 400;
const MAX_GEZONDHEID_MS = 6000;

const pauze = (ms: number) => new Promise<void>((klaar) => setTimeout(klaar, ms));
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nu = () => new Date().toISOString().replace(/[:.]/g, "-");

/** Een paar pogingen voor netwerkfouten en time-outs; een echte fout (400, 42xxx) meteen door. */
async function metHerkansing<T>(naam: string, fn: () => PromiseLike<{ data: T | null; error: { message: string; code?: string } | null }>): Promise<T> {
  let laatste = "";
  for (let poging = 1; poging <= 4; poging++) {
    try {
      const { data, error } = await fn();
      if (!error) return data as T;
      laatste = error.message;
      const tijdelijk = error.code === "57014" || error.code === "PGRST002" || /timeout|fetch failed|ECONNRESET|503|502/i.test(error.message);
      if (!tijdelijk) throw new Error(`${naam}: ${error.message}`);
    } catch (e) {
      const bericht = e instanceof Error ? e.message : String(e);
      if (bericht.startsWith(`${naam}:`)) throw e;
      laatste = bericht;
    }
    await pauze(1500 * poging);
  }
  throw new Error(`${naam}: ${laatste} (na 4 pogingen)`);
}

// ─── Feed ophalen ────────────────────────────────────────────────────────────

/** De campagne in affiliate_campaigns heet "H&M", de retailer in products "H&M (NL)". */
const campagneNaam = (retailer: string): string =>
  (leesVlag(process.argv.slice(2), "campagne") || retailer.replace(/\s*\(.*\)$/, "")).trim();

async function haalFeedBestand(supabase: SupabaseClient, retailer: string, bestand: string | undefined, map: string): Promise<string> {
  if (bestand) {
    if (!existsSync(bestand)) throw new Error(`Feedbestand bestaat niet: ${bestand}`);
    return bestand;
  }
  const campagne = campagneNaam(retailer);
  const rij = await metHerkansing("affiliate_campaigns", () =>
    supabase.from("affiliate_campaigns").select("name, feed_url").eq("name", campagne).maybeSingle()
  );
  const url = (rij as { feed_url?: string } | null)?.feed_url;
  if (!url) throw new Error(`Geen feed-URL gevonden voor campagne "${campagne}" in affiliate_campaigns. Geef --bestand of --campagne.`);

  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "FitFi-Import/1.0" } });
  if (res.status === 204 || !res.body) {
    throw new Error(
      `De feed geeft HTTP ${res.status} (leeg). Dat betekent dat Daisycon voor deze combinatie van parameters niets levert: ` +
        `controleer of het programma voor deze media is goedgekeurd. Op 8 oktober 2026 gaf de opgeslagen H&M-URL 204 en dezelfde URL ` +
        `met general=true wel de feed.`
    );
  }
  if (!res.ok) throw new Error(`De feed gaf HTTP ${res.status}.`);
  mkdirSync(map, { recursive: true });
  const pad = join(map, `feed-${slug(retailer)}-${nu()}.json`);
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(pad));
  return pad;
}

async function leesFeedRijen(pad: string, profiel: Profiel | null): Promise<{ rijen: FeedRij[]; kop: FeedKop; aantalGelezen: number }> {
  const rijen: FeedRij[] = [];
  const { kop, aantalGelezen } = await leesFeed(createReadStream(pad, { highWaterMark: 1 << 20 }), (p) => {
    const rij = naarFeedRij(p, profiel);
    if (rij) rijen.push(rij);
  });
  return { rijen, kop, aantalGelezen };
}

// ─── Database lezen ──────────────────────────────────────────────────────────

interface DbSnapshotRij extends DbRij {
  images: string[] | null;
}

async function leesDbRijen(supabase: SupabaseClient, retailer: string, profiel: Profiel | null): Promise<DbSnapshotRij[]> {
  const uit: DbSnapshotRij[] = [];
  let laatste = "";
  for (;;) {
    const data = await metHerkansing("products lezen", () =>
      supabase
        .from("products")
        .select("id, external_id, price, original_price, in_stock, affiliate_url, image_url, sizes, images")
        .eq("retailer", retailer)
        .gt("external_id", laatste)
        .order("external_id", { ascending: true })
        .limit(PAGINA)
    );
    const rijen = (data ?? []) as Array<{
      id: string; external_id: string; price: number | null; original_price: number | null; in_stock: boolean | null;
      affiliate_url: string | null; image_url: string | null; sizes: string[] | null; images: string[] | null;
    }>;
    for (const r of rijen) {
      uit.push({
        id: r.id,
        external_id: r.external_id,
        price: r.price == null ? null : Number(r.price),
        original_price: r.original_price == null ? null : Number(r.original_price),
        in_stock: r.in_stock !== false,
        affiliate_url: r.affiliate_url,
        image_url: r.image_url,
        sleutel: profiel ? profiel.dbSleutel({ affiliate_url: r.affiliate_url, sizes: r.sizes }) : null,
        images: r.images,
      });
    }
    if (rijen.length > 0) laatste = rijen[rijen.length - 1].external_id;
    if (rijen.length < PAGINA) break;
    if (uit.length % 10_000 === 0) console.log(`  ${uit.length} rijen uit de database gelezen...`);
  }
  return uit;
}

// ─── Gezondheid van de database tijdens het schrijven ────────────────────────

function maakGezondheidscheck(supabaseAnon: SupabaseClient | null) {
  let opeenvolgendTraag = 0;
  return async (): Promise<void> => {
    if (!supabaseAnon) return;
    const t = Date.now();
    await supabaseAnon.from("keten_kandidaat_product").select("product_id").limit(1);
    const ms = Date.now() - t;
    if (ms > MAX_GEZONDHEID_MS) {
      opeenvolgendTraag++;
      console.log(`  let op: de site-rol deed ${ms} ms over een lichte query (${opeenvolgendTraag}x achter elkaar); 30 s wachten`);
      if (opeenvolgendTraag >= 3) throw new Error("De database blijft traag onder de schrijfbelasting; gestopt. Draai opnieuw (idempotent) als het rustig is.");
      await pauze(30_000);
    } else {
      opeenvolgendTraag = 0;
    }
  };
}

async function inBatches<T>(
  naam: string,
  items: T[],
  grootte: number,
  pauzeMs: number,
  gezondheid: () => Promise<void>,
  fn: (batch: T[]) => Promise<number>
): Promise<number> {
  let totaal = 0;
  const batches = Math.ceil(items.length / grootte);
  for (let i = 0; i < items.length; i += grootte) {
    const nummer = i / grootte + 1;
    totaal += await fn(items.slice(i, i + grootte));
    if (nummer % 10 === 0 || nummer === batches) console.log(`  ${naam}: batch ${nummer}/${batches} (${totaal} rijen)`);
    if (nummer % 5 === 0) await gezondheid();
    await pauze(pauzeMs);
  }
  return totaal;
}

// ─── Rapport ─────────────────────────────────────────────────────────────────

function telWijzigingen(koppelingen: Koppeling[]) {
  const t = { totaal: 0, externalId: 0, prijs: 0, oudePrijs: 0, link: 0, beeld: 0, voorraad: 0 };
  for (const k of koppelingen) {
    const w = k.wijzigt;
    if (Object.values(w).some(Boolean)) t.totaal++;
    for (const sleutel of ["externalId", "prijs", "oudePrijs", "link", "beeld", "voorraad"] as const) if (w[sleutel]) t[sleutel]++;
  }
  return t;
}

async function telNieuwe(pad: string, nieuweIds: Set<string>, retailer: string) {
  const redenen: Partial<Record<OverslaanReden, number>> = {};
  const categorie: Record<string, number> = {};
  const geslacht: Record<string, number> = {};
  const prijsband: Record<string, number> = {};
  let wordtRij = 0;
  await leesFeed(createReadStream(pad, { highWaterMark: 1 << 20 }), (p) => {
    const id = p.update_info?.daisycon_unique_id;
    if (!id || !nieuweIds.has(id)) return;
    const uit = mapFeedProduct(p, { programName: retailer });
    if ("overgeslagen" in uit) {
      redenen[uit.overgeslagen] = (redenen[uit.overgeslagen] ?? 0) + 1;
      return;
    }
    wordtRij++;
    categorie[uit.rij.category] = (categorie[uit.rij.category] ?? 0) + 1;
    geslacht[uit.rij.gender] = (geslacht[uit.rij.gender] ?? 0) + 1;
    const band = uit.rij.price < 50 ? "tot50" : uit.rij.price < 100 ? "50tot100" : uit.rij.price < 200 ? "100tot200" : "boven200";
    prijsband[band] = (prijsband[band] ?? 0) + 1;
  });
  return { wordtRij, redenen, categorie, geslacht, prijsband };
}

// ─── Schrijven ───────────────────────────────────────────────────────────────

interface SchrijfContext {
  supabase: SupabaseClient;
  retailer: string;
  map: string;
  batch: number;
  pauzeMs: number;
  gezondheid: () => Promise<void>;
  limiet: number | null;
}

async function faseA1PasToe(ctx: SchrijfContext, koppelingen: Koppeling[], dbPerId: Map<string, DbSnapshotRij>): Promise<number> {
  let teDoen = koppelingen.filter((k) => Object.values(k.wijzigt).some(Boolean));
  teDoen.sort((a, b) => (a.db.external_id < b.db.external_id ? -1 : 1));
  if (ctx.limiet != null) teDoen = teDoen.slice(0, ctx.limiet);
  console.log(`\nFase a1: ${teDoen.length} bestaande producten verversen`);

  // Het momentopname-bestand vóór de eerste schrijfactie: hiermee draait --terugdraaien dit terug.
  const snapshot = join(ctx.map, "a1-oud.ndjson");
  writeFileSync(snapshot, "");
  for (const k of teDoen) {
    const oud = dbPerId.get(k.db.id)!;
    appendFileSync(snapshot, JSON.stringify({
      id: oud.id, external_id: oud.external_id, price: oud.price, original_price: oud.original_price, in_stock: oud.in_stock,
      affiliate_url: oud.affiliate_url, image_url: oud.image_url, images: oud.images,
    }) + "\n");
  }
  console.log(`  momentopname van de oude waarden: ${snapshot}`);

  return inBatches("pas_toe", teDoen, ctx.batch, ctx.pauzeMs, ctx.gezondheid, async (batch) => {
    const rijen = batch.map((k) => ({
      id: k.db.id,
      external_id: k.feed.id,
      price: k.feed.price,
      original_price: k.feed.priceOld,
      in_stock: k.feed.inStock,
      affiliate_url: k.feed.link,
      image_url: k.feed.image,
      images: k.feed.images,
    }));
    const n = await metHerkansing("keten_feed_pas_toe", () => ctx.supabase.rpc("keten_feed_pas_toe", { p_rijen: rijen }));
    return Number(n);
  });
}

async function faseA2VoegToe(ctx: SchrijfContext, pad: string, nieuw: FeedRij[]): Promise<number> {
  let ids = nieuw.map((f) => f.id).sort();
  if (ctx.limiet != null) ids = ids.slice(0, ctx.limiet);
  const doel = new Set(ids);
  console.log(`\nFase a2: ${doel.size} nieuwe feedregels omzetten en toevoegen`);

  const logbestand = join(ctx.map, "a2-ingevoegd.ndjson");
  writeFileSync(logbestand, "");
  const redenen: Partial<Record<OverslaanReden, number>> = {};
  let buffer: Record<string, unknown>[] = [];
  let ingevoegd = 0;
  let batchNummer = 0;
  const spoel = async () => {
    if (buffer.length === 0) return;
    const rijen = buffer;
    buffer = [];
    const n = Number(await metHerkansing("keten_feed_voeg_toe", () => ctx.supabase.rpc("keten_feed_voeg_toe", { p_rijen: rijen })));
    ingevoegd += n;
    for (const r of rijen) appendFileSync(logbestand, JSON.stringify({ external_id: r.external_id }) + "\n");
    batchNummer++;
    if (batchNummer % 10 === 0) console.log(`  voeg_toe: ${ingevoegd} rijen ingevoegd`);
    if (batchNummer % 5 === 0) await ctx.gezondheid();
    await pauze(ctx.pauzeMs);
  };

  // Eerst alle rijen verzamelen (de callback van leesFeed is synchroon genoeg voor de lezer; we spoelen na de lezing per blok).
  const alle: Record<string, unknown>[] = [];
  await leesFeed(createReadStream(pad, { highWaterMark: 1 << 20 }), (p: FeedProduct) => {
    const id = p.update_info?.daisycon_unique_id;
    if (!id || !doel.has(id)) return;
    const uit = mapFeedProduct(p, { programName: ctx.retailer });
    if ("overgeslagen" in uit) {
      redenen[uit.overgeslagen] = (redenen[uit.overgeslagen] ?? 0) + 1;
      return;
    }
    alle.push(uit.rij as unknown as Record<string, unknown>);
  });
  for (let i = 0; i < alle.length; i += ctx.batch) {
    buffer = alle.slice(i, i + ctx.batch);
    await spoel();
  }
  console.log(`  overgeslagen bij het omzetten: ${JSON.stringify(redenen)}`);
  console.log(`  ${alle.length} rijen aangeboden, ${ingevoegd} ingevoegd (de rest bestond al: dubbel id of dubbele sku)`);
  console.log(`  lijst van ingevoegde external_id's: ${logbestand}`);
  return ingevoegd;
}

async function faseB1ZetUit(ctx: SchrijfContext, verdwenen: DbRij[]): Promise<number> {
  let rijen = [...verdwenen].sort((a, b) => (a.external_id < b.external_id ? -1 : 1));
  if (ctx.limiet != null) rijen = rijen.slice(0, ctx.limiet);
  console.log(`\nFase b1: ${rijen.length} producten die niet meer in de feed staan uit voorraad zetten`);
  const logbestand = join(ctx.map, "b1-uitgezet.ndjson");
  writeFileSync(logbestand, rijen.map((r) => JSON.stringify({ id: r.id })).join("\n") + (rijen.length ? "\n" : ""));
  console.log(`  lijst van de ids: ${logbestand}`);
  return inBatches("voorraad", rijen, 1000, ctx.pauzeMs, ctx.gezondheid, async (batch) => {
    const n = await metHerkansing("keten_feed_voorraad", () =>
      ctx.supabase.rpc("keten_feed_voorraad", { p_ids: batch.map((r) => r.id), p_in_stock: false })
    );
    return Number(n);
  });
}

async function faseB2Herkies(ctx: SchrijfContext): Promise<number> {
  console.log(`\nFase b2: canonieke rij laten overgaan waar de canonieke maat weg is en een andere maat blijft`);
  const n = Number(await metHerkansing("keten_herkies_canoniek", () => ctx.supabase.rpc("keten_herkies_canoniek", { p_retailer: ctx.retailer })));
  console.log(`  ${n} groepen kregen een nieuwe canonieke maat`);
  return n;
}

/** Zodat /admin/affiliate-campaigns laat zien wanneer de feed voor het laatst is verwerkt en hoeveel producten erbij horen. */
async function markeerCampagne(supabase: SupabaseClient, retailer: string, aantal: number): Promise<void> {
  const naam = campagneNaam(retailer);
  const nu = new Date().toISOString();
  const { error } = await supabase.from("affiliate_campaigns").update({ last_synced_at: nu, product_count: aantal, updated_at: nu }).eq("name", naam);
  if (error) console.log(`  let op: campagne "${naam}" bijwerken lukte niet: ${error.message}`);
}

// ─── Terugdraaien ────────────────────────────────────────────────────────────

function leesNdjson<T>(pad: string): T[] {
  if (!existsSync(pad)) return [];
  return readFileSync(pad, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as T);
}

async function terugdraaien(supabase: SupabaseClient, map: string, ja: boolean, batch: number, pauzeMs: number): Promise<void> {
  const oud = leesNdjson<Record<string, unknown>>(join(map, "a1-oud.ndjson"));
  const ingevoegd = leesNdjson<{ external_id: string }>(join(map, "a2-ingevoegd.ndjson"));
  const uitgezet = leesNdjson<{ id: string }>(join(map, "b1-uitgezet.ndjson"));
  console.log(`Terugdraaien uit ${map}: ${oud.length} oude waarden herstellen, ${ingevoegd.length} ingevoegde rijen verwijderen, ${uitgezet.length} rijen weer op voorraad zetten`);
  console.log("Niet teruggedraaid: een wissel van canonieke rij (staat in keten_canoniek_wissels) en rijen die alleen via keten_vul_nieuwe_producten attributen kregen.");
  if (!ja) {
    console.log("Droge run: niets gewijzigd. Voeg --ja toe om het echt te doen.");
    return;
  }
  const gezondheid = async () => {};
  await inBatches("terugzetten", oud, batch, pauzeMs, gezondheid, async (b) => {
    const rijen = b.map((r) => ({ ...r, in_stock: r.in_stock !== false }));
    return Number(await metHerkansing("keten_feed_pas_toe", () => supabase.rpc("keten_feed_pas_toe", { p_rijen: rijen })));
  });
  await inBatches("weer op voorraad", uitgezet, 1000, pauzeMs, gezondheid, async (b) =>
    Number(await metHerkansing("keten_feed_voorraad", () => supabase.rpc("keten_feed_voorraad", { p_ids: b.map((r) => r.id), p_in_stock: true })))
  );
  await inBatches("verwijderen", ingevoegd, 200, pauzeMs, gezondheid, async (b) => {
    const data = await metHerkansing("rijen verwijderen", () =>
      supabase.from("products").delete().in("external_id", b.map((r) => r.external_id)).select("id")
    );
    return (data as unknown[] | null)?.length ?? 0;
  });
  console.log("Klaar. Draai daarna keten_vul_nieuwe_producten('<retailer>') om product_attributes weer gelijk te trekken.");
}

// ─── Hoofdprogramma ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const retailer = leesVlag(argv, "retailer") || STANDAARD_RETAILER;
  const ja = heeftVlag(argv, "ja");
  const fase = (leesVlag(argv, "fase") || "").toLowerCase();
  const batch = Number(leesVlag(argv, "batch") || STANDAARD_BATCH);
  const pauzeMs = Number(leesVlag(argv, "pauze-ms") || STANDAARD_PAUZE_MS);
  const limiet = leesVlag(argv, "limiet") ? Number(leesVlag(argv, "limiet")) : null;
  const staVeelWegToe = heeftVlag(argv, "sta-veel-weg-toe");
  const basis = leesVlag(argv, "map") || join(homedir(), "FitFi-worktrees", "tools", "data", "feed-sync");

  const env = leesEnv(undefined, { anthropic: false });
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const anon = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseAnon = anon ? createClient(env.SUPABASE_URL, anon, { auth: { persistSession: false } }) : null;

  const terug = leesVlag(argv, "terugdraaien");
  if (terug !== undefined) {
    if (!terug) throw new Error("--terugdraaien vraagt de map met de momentopname");
    await terugdraaien(supabase, terug, ja, batch, pauzeMs);
    return;
  }
  if (fase && !["a", "b", "alles"].includes(fase)) throw new Error('--fase is "a", "b" of "alles"');
  if (ja && !fase) throw new Error('Met --ja hoort een --fase ("a", "b" of "alles"): wat moet er geschreven worden?');

  const profiel = profielVoor(retailer);
  console.log(`Retailer: ${retailer} | profiel: ${profiel ? profiel.naam : "geen (alleen koppelen op external_id)"} | ${ja ? `SCHRIJVEN, fase ${fase}` : "droge run"}`);

  const map = join(basis, `${nu()}-${slug(retailer)}`);
  mkdirSync(map, { recursive: true });
  const pad = await haalFeedBestand(supabase, retailer, leesVlag(argv, "bestand"), map);
  console.log(`Feedbestand: ${pad}`);

  const { rijen: feedRijen, kop, aantalGelezen } = await leesFeedRijen(pad, profiel);
  console.log(`Feed: ${aantalGelezen} producten gelezen (kop: ${kop.productAantal}), programma "${kop.programmaNaam}" (${kop.programmaId}), samengesteld ${kop.gegenereerd}`);
  if (kop.programmaNaam && kop.programmaNaam !== retailer) {
    throw new Error(`De feed is van "${kop.programmaNaam}", niet van "${retailer}". Controleer --retailer en de feed-URL.`);
  }

  // --db-cache: het lezen van 88.000 rijen duurt ruim 8 minuten op deze database. Handig om na een
  // kanarie-run meteen de volledige fase a te draaien, want die verschilt maar 400 rijen van de
  // cache en alle schrijfacties zijn idempotent. Nooit bij fase b: die zet rijen uit voorraad op
  // basis van wat er in de database staat, en daar mag niets verouderds in zitten.
  const cachePad = leesVlag(argv, "db-cache");
  if (cachePad && (fase === "b" || fase === "alles")) {
    throw new Error("--db-cache is niet toegestaan bij fase b of alles: die moet de actuele database lezen.");
  }
  let dbRijen: DbSnapshotRij[];
  if (cachePad && existsSync(cachePad)) {
    console.log(`Database-rijen uit de cache ${cachePad} (kan verouderd zijn, alleen voor fase a)`);
    dbRijen = leesNdjson<DbSnapshotRij>(cachePad);
  } else {
    console.log("Database lezen...");
    dbRijen = await leesDbRijen(supabase, retailer, profiel);
    if (cachePad) {
      writeFileSync(cachePad, dbRijen.map((r) => JSON.stringify(r)).join("\n") + "\n");
      console.log(`Cache geschreven: ${cachePad}`);
    }
  }
  const dbPerId = new Map(dbRijen.map((r) => [r.id, r]));
  const dbInStock = dbRijen.filter((r) => r.in_stock).length;
  console.log(`Database: ${dbRijen.length} rijen, waarvan ${dbInStock} op voorraad`);

  const plan: Plan = maakPlan(feedRijen, dbRijen);
  const oordeel = beoordeel({
    feedAantalGelezen: aantalGelezen,
    feedAantalKop: kop.productAantal,
    dbRijen: dbRijen.length,
    dbInStock,
    plan,
    staVeelWegToe,
    fase: ja ? (fase as "a" | "b" | "alles") : null,
  });
  const w = telWijzigingen(plan.koppelingen);
  const viaId = plan.koppelingen.filter((k) => k.via === "id").length;
  const viaSleutel = plan.koppelingen.length - viaId;

  console.log("\n=== Plan ===");
  console.log(`gekoppeld: ${plan.koppelingen.length} (op id: ${viaId}, op artikel en maat: ${viaSleutel})`);
  console.log(`  waarvan met een wijziging: ${w.totaal} | id: ${w.externalId} | prijs: ${w.prijs} | oude prijs: ${w.oudePrijs} | link: ${w.link} | beeld: ${w.beeld} | weer op voorraad: ${w.voorraad}`);
  console.log(`verdwenen uit de feed (nu op voorraad): ${plan.verdwenen.length} | al uit voorraad en nog steeds weg: ${plan.reedsUit}`);
  console.log(`nieuw in de feed: ${plan.nieuw.length}`);
  const nieuw = await telNieuwe(pad, new Set(plan.nieuw.map((f) => f.id)), retailer);
  console.log(`  daarvan zouden rij worden (na filters): ${nieuw.wordtRij} | overgeslagen: ${JSON.stringify(nieuw.redenen)}`);
  console.log(`  per categorie: ${JSON.stringify(nieuw.categorie)}`);
  console.log(`  per geslacht: ${JSON.stringify(nieuw.geslacht)} | per prijsband: ${JSON.stringify(nieuw.prijsband)}`);

  for (const i of oordeel.info) console.log(`info: ${i}`);
  for (const wa of oordeel.waarschuwingen) console.log(`let op: ${wa}`);
  for (const f of oordeel.fouten) console.log(`FOUT: ${f}`);
  writeFileSync(join(map, "plan-samenvatting.json"), JSON.stringify({
    retailer, feedbestand: pad, kop, aantalGelezen, dbRijen: dbRijen.length, dbInStock,
    koppelingen: plan.koppelingen.length, viaId, viaSleutel, wijzigingen: w, verdwenen: plan.verdwenen.length, reedsUit: plan.reedsUit,
    nieuw: plan.nieuw.length, nieuwWordtRij: nieuw.wordtRij, nieuwOvergeslagen: nieuw.redenen, oordeel,
  }, null, 2));
  console.log(`Samenvatting: ${join(map, "plan-samenvatting.json")}`);

  if (oordeel.fouten.length > 0) {
    process.exitCode = 1;
    return;
  }
  if (!ja) {
    console.log("\nDroge run klaar: er is niets gewijzigd. Voeg --fase a (of b) en --ja toe om te schrijven.");
    return;
  }

  const ctx: SchrijfContext = { supabase, retailer, map, batch, pauzeMs, gezondheid: maakGezondheidscheck(supabaseAnon), limiet };
  if (fase === "a" || fase === "alles") {
    const bijgewerkt = await faseA1PasToe(ctx, plan.koppelingen, dbPerId);
    const toegevoegd = await faseA2VoegToe(ctx, pad, plan.nieuw);
    console.log(`\nFase a klaar: ${bijgewerkt} bijgewerkt, ${toegevoegd} toegevoegd.`);
    if (limiet == null) await markeerCampagne(supabase, retailer, plan.koppelingen.length + toegevoegd);
  }
  if (fase === "b" || fase === "alles") {
    const uit = await faseB1ZetUit(ctx, plan.verdwenen);
    const gewisseld = await faseB2Herkies(ctx);
    console.log(`\nFase b klaar: ${uit} uit voorraad gezet, ${gewisseld} groepen met een nieuwe canonieke maat.`);
  }

  console.log(`
Volgende stappen
  na fase a:  supabase db query --linked "select * from keten_vul_nieuwe_producten('${retailer.replace(/'/g, "''")}')"
              npm run keten:classificeer          (veegronde: classificeert de nieuwe rijen)
              taggen van de nieuwe canonieke rijen (npm run keten:tag -- --retailer "${retailer}" ...)
  dan fase b: npm run keten:feed-sync -- --retailer "${retailer}" --fase b --ja [--sta-veel-weg-toe]
  daarna:     npm run keten:poort -- --retailer "${retailer}"   (persona-poort en dekkingsmatrix)
Momentopname en lijsten: ${map}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
