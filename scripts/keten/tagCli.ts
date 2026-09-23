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
 * - Eén `claude -p`-aanroep tagt een hele portie (PORTIE_GROOTTE producten)
 *   tegelijk, niet één product per aanroep: dat is wat op 22 sept is gemeten
 *   (100 producten per aanroep amortiseert de ~55s opstartkosten). Elk product
 *   krijgt een nummer; het model geeft dat nummer terug als "index" in elk
 *   tag-object, zodat de uitvoer op inhoud (niet op volgorde) teruggekoppeld
 *   kan worden aan een product_id.
 *
 * TERUGDRAAI (Luc, 23 sept 2026): `--json-schema` was hierboven ooit de
 * STANDAARD, om gegarandeerd geldige JSON terug te krijgen. Drie echte
 * productierondes liepen daarna vast op time-outs, en dat is toen ten
 * onrechte gediagnosticeerd als een doorvoerlimiet van het abonnement (zie de
 * fixrondes in taak-5-report.md, die stuk voor stuk aan concurrency
 * sleutelden). Dat klopte niet. Op 23 sept is dezelfde portie van 100
 * producten twee keer gemeten, nu ook met het aantal beurten erbij:
 *   met --json-schema : 428s, 4 beurten, 54.397 outputtokens, $0.408, 100/100 objecten
 *   zonder            :  84s, 1 beurt,   12.912 outputtokens, $0.110,  83/100 objecten (65 geldig)
 * Het aantal beurten is de verklarende variabele: het model levert uitvoer
 * die het schema niet haalt en probeert het opnieuw, tot vier keer. Dat
 * verklaart ook de spreiding van 122-341s die eerder aan concurrency-
 * contentie werd toegeschreven. Vandaar: `--json-schema` is nu een expliciete
 * vlag (`--json-schema` op de command line, zie tag-products.ts), niet meer
 * de standaard. CLI_SCHEMA zelf blijft bestaan voor wie de vlag wel gebruikt.
 * `verwerkCliUitvoer` gebruikt `structured_output` als dat er is (met de
 * vlag) en valt anders terug op het strippen/extraheren van JSON uit `result`
 * (nu het hoofdpad, zie parseJsonUitCliTekst hieronder) — dat pad moet dus
 * robuust zijn tegen hekjes, tekst vóór/na het blok, én minder objecten terug
 * dan verstuurd (zie de opmerkingen bij verwerkCliUitvoer).
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

// Geschiedenis: was 4 (amendement), toen 2 (fixronde 3, afgeleid uit een
// lineair model zonder directe meting op concurrency 2). FIXRONDE 4
// (controller, 22 sept 2026): een echte H&M-ronde op concurrency 2 liep
// opnieuw vast. In 75 minuten: 14 porties geslaagd, 15 op de time-out van
// 370s. Duur van de geslaagde aanroepen: 122, 132, 178, 248, 269, 273, 281,
// 283, 288, 289, 293, 296, 315, 349 seconden — een enorme spreiding voor
// identiek werk. De twee snelste (122, 132) vielen aan het einde, toen nog
// maar één aanroep liep, en komen exact overeen met de solo-baseline (126s,
// fixronde 3). Conclusie: de werkelijke vertraging bij concurrency 2 is 2 tot
// 2,8x en regelmatig meer (de time-outs bereikten minstens 370/126≈2,94x,
// ware duur onbekend) — niet de 1,86x die fixronde 3's lineaire model tussen
// concurrency 1 en 4 voorspelde. Een rechte lijn tussen twee verre punten
// onderschat kennelijk wat er dichterbij gebeurt.
//
// Nieuwe standaard: 1. De gemeten opbrengst van parallelliteit was toch al
// klein (~10% bij concurrency 4, ~3,5% bij 2, zie doorloopFactorVoorConcurrency
// hieronder); die paar procent zijn twee mislukte, uren durende ronde niet
// waard. Bij concurrency 1 is de spreiding klein: 122, 126 en 132 seconden
// over drie losse metingen (fixronde 3 en 4 samen) — nog geen 10 seconden
// verschil. Bij één aanroep tegelijk wordt een ruime time-out een echt
// vangnet; bij twee of meer is elke vaste time-out een gok, hoe ruim ook,
// zolang de spreiding zo groot blijft. Als vlag, niet hardgecodeerd: zie
// --concurrency in tag-products.ts. Wie hem toch hoger zet: de time-out
// schaalt mee (zie contentieFactorVoorTimeout hieronder), maar dat maakt een
// hogere concurrency niet aan te raden, alleen minder gevaarlijk.
//
// LET OP (Luc, 23 sept 2026, zie de TERUGDRAAI-tekst bovenaan dit bestand):
// alle metingen hierboven (198/319/438/451s bij concurrency 4, de
// 122-349s-spreiding bij concurrency 2) zijn gedraaid MET --json-schema aan,
// toen dat nog de standaard was. Nu bekend is dat --json-schema zelf tot 4
// herkansingen (beurten) kan kosten, is niet meer zeker of dezelfde
// concurrency-cijfers (de contentiefactoren, niet alleen de absolute duur)
// ook gelden voor de nieuwe standaardweg zonder schema — minder beurten
// betekent minder tijd per aanroep, wat de verhouding tussen solo en
// gelijktijdig anders kan laten uitvallen. Bewust NIET opnieuw gemeten of
// herijkt: de structuur (drie ijkpunten, piecewise lineair) blijft staan
// zoals hij was, alleen dit voorbehoud is toegevoegd. CONCURRENCY_STANDAARD
// blijft daarom op 1 staan, niet omdat de oude meting nog aantoonbaar klopt,
// maar omdat er geen nieuwe meting is die een hogere waarde rechtvaardigt.
export const CONCURRENCY_STANDAARD = 1;

// Aantal opeenvolgende MISLUKTE porties (de hele aanroep leverde niets
// bruikbaars op, geen individuele contentfout) voordat het script stopt in
// plaats van doorrammen. Geen exacte foutmelding om op te matchen, met opzet:
// niet gebaseerd op geraden woorden maar op het patroon zelf. Twee keer
// bevestigd op de echte (allebei mislukte) H&M-ronde: fixronde 3 (concurrency
// 4, zes opeenvolgende time-outs herkend) en fixronde 4 (concurrency 2, 15
// van de 29 aanroepen op de time-out, ook daar netjes gestopt met exitcode 1
// i.p.v. een valse 0). Dat deel werkt zoals bedoeld, allebei de keren.
export const MAX_OPEENVOLGENDE_FOUTEN = 3;

// ---------------------------------------------------------------------------
// Tijd- en kostenmodel.
//
// IJkpunt: PORTIE_GROOTTE = 100, want dat is de portiegrootte die het script
// ZELF gebruikt voor elke aanroep (op de laatste, kleinere restportie van een
// ronde na).
//
// HERIJKING (Luc, 23 sept 2026, zie de TERUGDRAAI-tekst bovenaan dit
// bestand): de standaardweg is nu ZONDER --json-schema, dus dat wordt hier de
// basis in plaats van een afgeleide. Er is precies één betrouwbare meting op
// deze weg bij n = 100: 84s, $0.110, 1 beurt. Geen tweede punt om opstart en
// per-product apart op te lossen (het oudere "zonder schema"-punt bij n = 10,
// 69s uit het amendement van 22 sept, dateert van vóór dit inzicht — het
// aantal beurten is toen niet gelogd — en de bijbehorende n=100-meting uit
// die periode, 194s, wijkt 2,3x af van de meting van vandaag bij dezelfde n.
// Te groot om aan ruis toe te schrijven, en er is geen manier om vast te
// stellen welke van de twee metingen toen representatief was). In plaats van
// een ongefundeerde knoop door te hakken tussen twee elkaar tegensprekende
// metingen: de vaste opstartkosten (OPSTART_SECONDEN, BASIS_KOSTEN_USD)
// blijven de oude, niet-weersproken schatting (die kosten zijn onafhankelijk
// van --json-schema, dezelfde systeemprompt gaat sowieso mee), en UITSLUITEND
// de per-product-term is herrekend op het ijkpunt van vandaag.
//
// LET OP voor de volgende lezer: dit blijft, net als de vorige versie, alleen
// gevalideerd op n = 100. Voor een kleine proefrun (--limit 10/25) kan de
// werkelijke duur afwijken van wat dit model voorspelt. De tijdens een
// --ja-run geprinte duration_ms/total_cost_usd per aanroep (zie
// tag-products.ts) blijven de echte referentie, dit model is alleen de
// schatting vooraf.
// ---------------------------------------------------------------------------

// Vaste (opstart-)kosten, ONGEWIJZIGD t.o.v. de vorige versie: niet
// weersproken door de meting van vandaag, en verondersteld onafhankelijk van
// --json-schema (dezelfde systeemprompt gaat sowieso mee, met of zonder
// schema-argument).
export const OPSTART_SECONDEN = 55;
export const BASIS_KOSTEN_USD = 0.03244;

// Per-product-term ZONDER --json-schema (nu de standaard), herrekend op het
// enige betrouwbare ijkpunt van vandaag: 84s / $0.110 bij n=100, 1 beurt.
// (84 - OPSTART_SECONDEN) / 100 en (0.110 - BASIS_KOSTEN_USD) / 100.
export const SECONDEN_PER_PRODUCT_ZONDER_SCHEMA = (84 - OPSTART_SECONDEN) / 100; // 0.29
export const PER_PRODUCT_KOSTEN_USD_ZONDER_SCHEMA = (0.11 - BASIS_KOSTEN_USD) / 100; // ≈ 0.0007756

// Factor MET --json-schema (nu een expliciete vlag, niet meer de standaard).
// Herijkt op een schone, GELIJKTIJDIGE A/B van vandaag op dezelfde 100
// producten (in plaats van het oudere 132s/194s-paar uit fixronde 1, dat de
// meting van vandaag tegenspreekt, zie hierboven): 428s/$0.408 (4 beurten)
// tegenover 84s/$0.110 (1 beurt) zonder schema. Uitgedrukt als factor BOVENOP
// het zonder-schema-model hierboven, dezelfde vorm als eerder — tijd en
// kosten blijven apart, want ze gedragen zich niet gelijk (met schema is de
// aanroep 5,1x trager EN 3,7x duurder, dus deze keer allebei in dezelfde
// richting, in tegenstelling tot de vorige kalibratie die sneller-maar-duurder
// liet zien; dat verschil zelf is een teken van hoe ruizig dit pad is).
// Extra los datapunt, niet in de kalibratie verwerkt: 50 producten MET schema
// gaf 182s in 3 beurten — bevestigt dat het aantal beurten wisselt (geen
// vaste 4), maar te weinig om een eigen n=50-ijkpunt op te bouwen bovenop een
// al kleine steekproef.
export const TIJD_FACTOR_MET_SCHEMA = 428 / 84; // ≈ 5.095
export const KOSTEN_FACTOR_MET_SCHEMA = 0.408 / 0.11; // ≈ 3.709

export function geschatteSecondenVoorPortie(aantalProducten: number, metSchema = false): number {
  const zonderSchema = OPSTART_SECONDEN + SECONDEN_PER_PRODUCT_ZONDER_SCHEMA * aantalProducten;
  return metSchema ? TIJD_FACTOR_MET_SCHEMA * zonderSchema : zonderSchema;
}

export function schatEquivalentUsd(aantalProducten: number, metSchema = false): number {
  const zonderSchema = BASIS_KOSTEN_USD + aantalProducten * PER_PRODUCT_KOSTEN_USD_ZONDER_SCHEMA;
  return metSchema ? KOSTEN_FACTOR_MET_SCHEMA * zonderSchema : zonderSchema;
}

// ---------------------------------------------------------------------------
// Gedeeltelijke opbrengst (alleen relevant ZONDER --json-schema, de
// standaard). Meting 23 sept 2026: 100 producten verstuurd, 83 objecten
// terug, 65 daarvan geldig na valideerTags. De overige producten blijven
// ongetagd en komen via keten_tag_kandidaten vanzelf terug als kandidaat bij
// de eerstvolgende aanroep van dit script (zie verwerkCliUitvoer en
// tag-products.ts): dat pad is zelfherstellend, maar betekent wel dat één
// portie zelden voldoende is om een populatie VOLLEDIG te taggen. Met
// --json-schema was de opbrengst in dezelfde meting 100/100 (ten koste van 4
// beurten i.p.v. 1), dus daar is dit niet van toepassing.
// ---------------------------------------------------------------------------
export const OPBRENGST_FRACTIE_ZONDER_SCHEMA = 65 / 100;

/**
 * Geschat aantal RONDES (niet: aanroepen) om een populatie volledig te
 * taggen bij een constante opbrengstfractie per ronde: een meetkundige reeks
 * 1 + (1-p) + (1-p)^2 + ... = 1/p. Aanname, geen meting over meerdere ronden
 * heen (er is maar één echte meting, de eerste ronde): dat een product dat
 * de eerste keer geen geldig object opleverde, bij een volgende poging
 * dezelfde kans op succes heeft. Geen reden om aan te nemen dat dat anders
 * ligt, maar ook niet getoetst.
 */
export function geschatteRondesTotConvergentie(opbrengstFractie: number): number {
  if (opbrengstFractie <= 0) return Infinity;
  return 1 / opbrengstFractie;
}

// Extra veiligheidsmarge BOVENOP de tijdschatting voor de subprocess-timeout,
// zodat een gezonde-maar-trage aanroep niet op de rand wordt afgebroken.
// Was 1,5. FIXRONDE 4 (controller, 22 sept 2026), de les van twee mislukte
// echte ronden op rij: een krappe time-out is duurder dan een ruime. Een te
// ruime time-out kost in het slechtste geval wat wachttijd; een te krappe
// kost al het werk tot dat moment plus de wachttijd (vijftien time-outs van
// ~370s in fixronde 4 was ruim anderhalf uur abonnementsverbruik voor nul
// resultaat). Drie losse solo-metingen (fixronde 3 en 4) clusteren rond
// 122-132s. Op het ijkpunt n=100, concurrency 1: 3x de schatting (≈132,7s)
// geeft ≈398s, ruim boven (3,0x) de traagste waargenomen solo-aanroep (132s),
// niet krap erboven.
export const TIMEOUT_VEILIGHEIDSMARGE = 3;

// ---------------------------------------------------------------------------
// Concurrency-contentie. Twee ronden op de echte database, twee keer
// vastgelopen, en de oorzaak schoof allebei de keren op:
//
//   FIXRONDE 3: concurrency 4 mislukte volledig (time-out 199s, blind voor
//     concurrency). Gemeten: 4 gelijktijdig, elk 100 producten: 198, 319,
//     438, 451s individueel; 451s wandkloktijd voor de hele golf.
//   FIXRONDE 4: de FIX (time-out schaalt lineair mee, concurrency-standaard
//     naar 2) mislukte OOK. Gemeten: concurrency 2, 75 minuten, 14 porties
//     geslaagd (122, 132, 178, 248, 269, 273, 281, 283, 288, 289, 293, 296,
//     315, 349s), 15 op de time-out van 370s (dus ≥370s, ware duur onbekend
//     — gecensureerde data). De twee snelste (122, 132) vielen aan het einde,
//     toen nog maar één aanroep liep: die komen exact overeen met solo.
//
// Fixronde 3's lineaire interpolatie tussen concurrency 1 (factor 1) en 4
// (factor ≈3,58) voorspelde bij concurrency 2 een factor van 1,86x. De
// werkelijkheid was 2 tot 2,8x en regelmatig meer. Een rechte lijn tussen
// twee VERRE punten onderschat dus wat er dichterbij gebeurt: de curve buigt
// kennelijk snel omhoog zodra er meer dan één aanroep om dezelfde resource
// strijdt. Daarom nu drie ijkpunten i.p.v. twee, PIECEWISE lineair ertussen
// (CONTENTIE_IJKPUNTEN): 1→1 (triviaal), 2→2,8 (de bovenkant van de gemeten
// spreiding — bewust conservatief: een deel van de metingen is gecensureerd
// door de time-out zelf, de werkelijke bovengrens ligt mogelijk hoger),
// 4→3,58 (ongewijzigd, fixronde 3). Boven concurrency 4: dezelfde helling
// als het laatste segment (2→4), niet vlak — er is geen reden om aan te
// nemen dat de contentie daar stopt met stijgen.
//
// CONCLUSIE, niet alleen een getal: concurrency 1 is de aanbevolen instelling
// (zie CONCURRENCY_STANDAARD hierboven), niet een van meerdere gelijkwaardige
// opties. Dit model bestaat zodat een time-out ook bij een hogere, afgeraden
// concurrency niet een gegarandeerde mislukking wordt — niet om hogere
// concurrency aantrekkelijk te maken. De tijdens een --ja-run geprinte
// duration_ms per aanroep (zie tag-products.ts) blijft de echte referentie.
//
// doorloopFactorVoorConcurrency (de droge-run-schatting van de wandkloktijd)
// is in fixronde 4 NIET herijkt: er is geen nieuwe wandkloktijd-meting voor
// een volledige golf bij concurrency 2, alleen individuele-aanroepduren. Die
// functie gebruikt daarom nog steeds de 2-punts lineaire interpolatie uit
// fixronde 3 (concurrency 1→1, concurrency 4→≈0,895). Bij de nieuwe standaard
// (concurrency 1) is dat sowieso irrelevant: de factor is daar per constructie
// exact 1, dus de droge run toont de eerlijke, volledig seriële schatting.
export interface ContentieIjkpunt {
  concurrency: number;
  factor: number;
}

// Bovenkant van de gemeten spreiding bij concurrency 2 (fixronde 4, bewust
// conservatief, zie uitleg hierboven), resp. de gemeten factor op concurrency
// 4 (fixronde 3, ongewijzigd). Los geëxporteerd (niet alleen inline in
// CONTENTIE_IJKPUNTEN) zodat er in tests en elders rechtstreeks naar
// verwezen kan worden.
export const CONTENTIE_FACTOR_OP_CONCURRENCY_2 = 2.8;
export const CONTENTIE_FACTOR_OP_IJKPUNT = 451 / 126; // ≈ 3.579

export const CONTENTIE_IJKPUNTEN: ContentieIjkpunt[] = [
  { concurrency: 1, factor: 1 },
  { concurrency: 2, factor: CONTENTIE_FACTOR_OP_CONCURRENCY_2 },
  { concurrency: 4, factor: CONTENTIE_FACTOR_OP_IJKPUNT },
];

export function contentieFactorVoorTimeout(concurrency: number): number {
  const c = Math.max(1, concurrency);
  const punten = CONTENTIE_IJKPUNTEN;
  if (c <= punten[0].concurrency) return punten[0].factor;
  for (let i = 0; i < punten.length - 1; i++) {
    const a = punten[i];
    const b = punten[i + 1];
    if (c <= b.concurrency) {
      return a.factor + ((c - a.concurrency) * (b.factor - a.factor)) / (b.concurrency - a.concurrency);
    }
  }
  // Boven het hoogste ijkpunt: extrapoleer met de helling van het laatste
  // segment, niet vlak.
  const laatste = punten[punten.length - 1];
  const voorlaatste = punten[punten.length - 2];
  const helling = (laatste.factor - voorlaatste.factor) / (laatste.concurrency - voorlaatste.concurrency);
  return laatste.factor + (c - laatste.concurrency) * helling;
}

export const CONTENTIE_CONCURRENCY_IJKPUNT = 4;
export const DOORLOOP_FACTOR_OP_IJKPUNT = 451 / 4 / 126; // ≈ 0.895: effectieve seconden/portie (golf van 4) / solo, fixronde 3, niet herijkt in fixronde 4

export function doorloopFactorVoorConcurrency(concurrency: number): number {
  const c = Math.max(1, concurrency);
  return 1 + ((c - 1) * (DOORLOOP_FACTOR_OP_IJKPUNT - 1)) / (CONTENTIE_CONCURRENCY_IJKPUNT - 1);
}
// ---------------------------------------------------------------------------

export function timeoutMsVoorPortie(aantalProducten: number, concurrency: number, metSchema = false): number {
  return Math.round(
    geschatteSecondenVoorPortie(aantalProducten, metSchema) * contentieFactorVoorTimeout(concurrency) * TIMEOUT_VEILIGHEIDSMARGE * 1000
  );
}

export interface DroogeRunSchatting {
  aantalAanroepen: number;
  geschatteSeconden: number;
  equivalentUsd: number;
  // Alleen > 1 zonder --json-schema (gedeeltelijke opbrengst, zie
  // OPBRENGST_FRACTIE_ZONDER_SCHEMA hierboven): hoeveel keer deze ronde naar
  // schatting herhaald moet worden (dus: hoe vaak `npm run keten:tag`
  // opnieuw draaien) voordat de HUIDIGE kandidaten allemaal getagd zijn. Met
  // --json-schema is dit per constructie 1 (100/100 gemeten).
  geschatteRondesTotConvergentie: number;
  // geschatteSeconden/equivalentUsd hierboven zijn voor ÉÉN ronde (wat er
  // gebeurt bij --ja); deze twee zijn de eerlijke schatting voor VOLLEDIGE
  // convergentie van de huidige kandidatenlijst, dus geschatteSeconden/
  // equivalentUsd keer geschatteRondesTotConvergentie.
  geschatteSecondenTotConvergentie: number;
  equivalentUsdTotConvergentie: number;
}

export function schatDroogeRun(porties: TagProduct[][], concurrency: number, metSchema = false): DroogeRunSchatting {
  // Som van de solo-schatting over alle porties: dit IS de "volledig
  // serieel"-schatting (concurrency 1). Niet meer delen door het aantal
  // werkers: dat veronderstelde lineaire versnelling die niet bestaat (zie
  // hierboven). In plaats daarvan de gemeten, veel bescheidener
  // doorloopwinst toepassen.
  const totaalSecondenSerieel = porties.reduce((som, p) => som + geschatteSecondenVoorPortie(p.length, metSchema), 0);
  const equivalentUsd = porties.reduce((som, p) => som + schatEquivalentUsd(p.length, metSchema), 0);
  const geschatteSeconden = Math.round(totaalSecondenSerieel * doorloopFactorVoorConcurrency(concurrency));
  const rondes = metSchema ? 1 : geschatteRondesTotConvergentie(OPBRENGST_FRACTIE_ZONDER_SCHEMA);
  return {
    aantalAanroepen: porties.length,
    geschatteSeconden,
    equivalentUsd,
    geschatteRondesTotConvergentie: rondes,
    geschatteSecondenTotConvergentie: Math.round(geschatteSeconden * rondes),
    equivalentUsdTotConvergentie: equivalentUsd * rondes,
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

/**
 * Strip een ```json ... ``` of kaal ``` ... ``` codeblok uit de tekst, ook als
 * er tekst vóór of na het blok staat (niet meer alleen anker-aan-begin/eind:
 * zie de TERUGDRAAI-tekst bovenaan dit bestand, zonder --json-schema zet het
 * model soms een inleidende of afsluitende zin om het blok heen). Zonder
 * hekjes in de tekst blijft de tekst ongemoeid (getrimd) staan, dan is er
 * niets te strippen.
 */
export function strippenJsonHekjes(tekst: string): string {
  const getrimd = tekst.trim();
  const hekjesMatch = getrimd.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return hekjesMatch ? hekjesMatch[1].trim() : getrimd;
}

/**
 * Haalt het JSON-object uit de vrije-tekst-uitvoer van `claude -p` zonder
 * --json-schema (het hoofdpad sinds de terugdraai, zie bovenaan dit bestand).
 * Drie stappen, elk een reactie op iets dat echt is waargenomen:
 * 1. Strip een eventueel codeblok (strippenJsonHekjes) en probeer te parsen.
 * 2. Lukt dat niet (bijvoorbeeld tekst vóór/na het blok, of geen hekjes maar
 *    wel omringende tekst): pak de breedste {...}-substring (eerste { tot
 *    laatste }) en probeer die te parsen.
 * 3. Lukt ook dat niet: null. verwerkCliUitvoer behandelt dat als "mislukt",
 *    de portie blijft open voor een volgende poging.
 */
export function parseJsonUitCliTekst(tekst: string): unknown | null {
  const gestript = strippenJsonHekjes(tekst);
  try {
    return JSON.parse(gestript);
  } catch {
    const start = gestript.indexOf("{");
    const eind = gestript.lastIndexOf("}");
    if (start === -1 || eind === -1 || eind <= start) return null;
    try {
      return JSON.parse(gestript.slice(start, eind + 1));
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// claude -p aanroepen
// ---------------------------------------------------------------------------

// Nooit --bare (die vlag leest uitsluitend ANTHROPIC_API_KEY/apiKeyHelper en
// negeert OAuth en keychain, dus dan draait het niet op het abonnement).
// --allowed-tools "" schakelt alle tools uit: taggen heeft er geen nodig en
// elke tool vergroot alleen de systeemprompt (en dus de opstartkosten).
//
// jsonSchema is optioneel sinds de terugdraai (zie bovenaan dit bestand):
// zonder waarde blijft --json-schema helemaal weg uit de argv, dat is nu het
// standaardpad. Alleen met een expliciete waarde (de --json-schema-vlag op
// tag-products.ts, zie daar) komt --json-schema erbij.
export function bouwClaudeArgs(opts: {
  model: string;
  systeemPrompt: string;
  opdracht: string;
  jsonSchema?: unknown;
}): string[] {
  const args = ["-p", "--model", opts.model, "--allowed-tools", "", "--append-system-prompt", opts.systeemPrompt];
  if (opts.jsonSchema !== undefined) {
    args.push("--json-schema", JSON.stringify(opts.jsonSchema));
  }
  args.push("--output-format", "json", opts.opdracht);
  return args;
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
  // Aantal items dat het model teruggaf, VÓÓR validatie (dus vóór rijen/
  // fouten-splitsing). 0 bij een mislukte aanroep. Puur voor de voortgangslog
  // in tag-products.ts: "N producten in, M objecten terug, K geldig" maakt
  // een gedeeltelijke opbrengst (zie OPBRENGST_FRACTIE_ZONDER_SCHEMA) zichtbaar
  // in plaats van dat die verdwijnt achter een enkel "X fouten"-getal.
  aantalObjecten: number;
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
 *
 * Een product waarvoor het model HELEMAAL geen object teruggeeft (minder
 * objecten terug dan verstuurd — gemeten zonder --json-schema, 23 sept 2026:
 * 83 van de 100) valt onder de tweede soort: de "geziene"-boekhouding hieronder
 * dekt zowel "index nooit gezien" als "index gezien maar object ongeldig",
 * dus zo'n product komt met een eigen reden in `fouten` terecht. Het wordt
 * NOOIT stilzwijgend als verwerkt geteld: er is geen pad waarop een
 * ontbrekende index een rij in `rijen` oplevert.
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
      aantalObjecten: 0,
    };
  }

  let items: unknown[] | null = null;
  const structured = respons.structured_output;
  if (structured && Array.isArray(structured.items)) {
    items = structured.items;
  } else {
    const obj = parseJsonUitCliTekst(respons.result ?? "");
    if (obj && typeof obj === "object" && Array.isArray((obj as { items?: unknown }).items)) {
      items = (obj as { items: unknown[] }).items;
    }
  }

  if (!items) {
    return {
      mislukt: true,
      reden: "geen bruikbare JSON-uitvoer (geen structured_output, en result was niet als JSON te lezen)",
      rijen: [],
      fouten: [],
      aantalObjecten: 0,
    };
  }
  if (items.length === 0 && producten.length > 0) {
    return {
      mislukt: true,
      reden: `lege items-array (0 van de ${producten.length} producten), waarschijnlijk een geweigerd of afgekapt antwoord`,
      rijen: [],
      fouten: [],
      aantalObjecten: 0,
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

  return { mislukt: false, rijen, fouten, aantalObjecten: items.length };
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
