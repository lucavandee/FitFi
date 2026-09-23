import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { BatchesBestand } from "../batchesStore";
import {
  BASIS_KOSTEN_USD,
  CLI_SCHEMA,
  CONTENTIE_CONCURRENCY_IJKPUNT,
  CONTENTIE_FACTOR_OP_CONCURRENCY_2,
  CONTENTIE_FACTOR_OP_IJKPUNT,
  DOORLOOP_FACTOR_OP_IJKPUNT,
  KANDIDATEN_PAGINA,
  KOSTEN_FACTOR_MET_SCHEMA,
  MAX_OPEENVOLGENDE_FOUTEN,
  OPBRENGST_FRACTIE_ZONDER_SCHEMA,
  OPSTART_SECONDEN,
  PER_PRODUCT_KOSTEN_USD_ZONDER_SCHEMA,
  PORTIE_GROOTTE,
  SCHRIJF_CHUNK,
  SECONDEN_PER_PRODUCT_ZONDER_SCHEMA,
  TIJD_FACTOR_MET_SCHEMA,
  TIMEOUT_VEILIGHEIDSMARGE,
  bouwClaudeArgs,
  bouwOpdracht,
  bouwProductBlok,
  bouwSysteemPromptCli,
  comprimeerVerwerkt,
  contentieFactorVoorTimeout,
  controleerGeenOpenPortiesMeer,
  doorloopFactorVoorConcurrency,
  downloadFoto,
  extensieVoorUrl,
  geschatteRondesTotConvergentie,
  geschatteSecondenVoorPortie,
  haalKandidaten,
  maakPortieRecord,
  parseJsonUitCliTekst,
  schatDroogeRun,
  schatEquivalentUsd,
  schrijfRijen,
  splitsInPorties,
  strippenJsonHekjes,
  timeoutMsVoorPortie,
  verwerkCliUitvoer,
  voerMetConcurrency,
  type PortieRecord,
} from "../tagCli";
import { TAGGER_VERSION, TAGGER_VERSION_FOTO, TAG_SCHEMA, type TagProduct } from "../tagging";

const product = (extra: Partial<TagProduct> = {}): TagProduct => ({
  product_id: "11111111-1111-4111-8111-111111111111",
  name: "Slim fit overhemd van katoen",
  brand: "H&M",
  description: "Overhemd van geweven katoen met een slanke pasvorm.",
  price: 29.99,
  retailer: "H&M (NL)",
  raw_category: "top",
  gender: "male",
  image_url: "https://example.com/overhemd.jpg",
  confidence: null,
  ...extra,
});

const geldigeTags = {
  is_fashion: true,
  category: "top",
  gender: "male",
  formality: 3,
  occasions: ["work", "date"],
  silhouette: "slim",
  color_temp: "koel",
  lightness: "licht",
  pattern: "effen",
  shoe_type: null,
  colors: ["wit"],
  materials: ["katoen"],
  seasons: ["lente", "zomer", "herfst"],
  confidence: 0.85,
};

describe("splitsInPorties", () => {
  it("splitst in gelijke porties met een kleinere laatste portie", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const porties = splitsInPorties(items, 10);
    expect(porties.map((p) => p.length)).toEqual([10, 10, 5]);
    expect(porties.flat()).toEqual(items);
  });

  it("geeft één portie terug als grootte groter is dan het aantal items", () => {
    expect(splitsInPorties([1, 2, 3], 100)).toEqual([[1, 2, 3]]);
  });

  it("geeft een lege lijst bij een lege invoer", () => {
    expect(splitsInPorties([], 10)).toEqual([]);
  });

  it("gooit een fout bij een niet-positieve grootte", () => {
    expect(() => splitsInPorties([1], 0)).toThrow();
    expect(() => splitsInPorties([1], -1)).toThrow();
  });
});

describe("tijd- en kostenmodel (herijkt 23 sept 2026: --json-schema is niet meer de standaard, zie taak-5-report.md)", () => {
  it("de vaste (opstart)kosten blijven ongewijzigd; alleen de per-product-term ZONDER schema is herrekend op de meting van vandaag", () => {
    expect(OPSTART_SECONDEN).toBe(55);
    expect(BASIS_KOSTEN_USD).toBeCloseTo(0.03244, 5);
    // Enige betrouwbare ijkpunt op de nieuwe standaardweg: 84s / $0.110 bij
    // n=100, 1 beurt (Luc, 23 sept 2026). (84-55)/100 en (0.110-basis)/100.
    expect(SECONDEN_PER_PRODUCT_ZONDER_SCHEMA).toBeCloseTo((84 - 55) / 100, 6);
    expect(PER_PRODUCT_KOSTEN_USD_ZONDER_SCHEMA).toBeCloseTo((0.11 - 0.03244) / 100, 6);
    expect(OPSTART_SECONDEN + SECONDEN_PER_PRODUCT_ZONDER_SCHEMA * 100).toBeCloseTo(84, 5);
    expect(BASIS_KOSTEN_USD + 100 * PER_PRODUCT_KOSTEN_USD_ZONDER_SCHEMA).toBeCloseTo(0.11, 5);
  });

  it("geschatteSecondenVoorPortie/schatEquivalentUsd zijn ZONDER schema standaard (metSchema=false) en komen op n=100 overeen met de meting van vandaag", () => {
    expect(geschatteSecondenVoorPortie(100)).toBeCloseTo(84, 5);
    expect(geschatteSecondenVoorPortie(100, false)).toBeCloseTo(84, 5);
    expect(schatEquivalentUsd(100)).toBeCloseTo(0.11, 5);
    expect(schatEquivalentUsd(100, false)).toBeCloseTo(0.11, 5);
  });

  it("geschatteSecondenVoorPortie/schatEquivalentUsd komen MET schema (metSchema=true) overeen met de meting van vandaag (428s / $0.408 bij n=100)", () => {
    expect(geschatteSecondenVoorPortie(100, true)).toBeCloseTo(428, 3);
    expect(schatEquivalentUsd(100, true)).toBeCloseTo(0.408, 3);
  });

  it("TIJD_FACTOR_MET_SCHEMA en KOSTEN_FACTOR_MET_SCHEMA komen uit een schone, gelijktijdige A/B van vandaag, niet meer uit het oudere paar dat de meting van vandaag tegensprak", () => {
    expect(TIJD_FACTOR_MET_SCHEMA).toBeCloseTo(428 / 84, 6);
    expect(KOSTEN_FACTOR_MET_SCHEMA).toBeCloseTo(0.408 / 0.11, 6);
    // Deze keer wijzen beide factoren dezelfde kant op (allebei trager EN
    // duurder met schema): anders dan de vorige kalibratie (sneller maar
    // duurder). Dat verschil is zelf een teken van hoeveel ruis er op dit pad
    // zit, geen tegenstrijdigheid die opgelost moet worden.
    expect(TIJD_FACTOR_MET_SCHEMA).toBeGreaterThan(1);
    expect(KOSTEN_FACTOR_MET_SCHEMA).toBeGreaterThan(1);
  });

  it("timeoutMsVoorPortie is standaard (zonder schema) een ruime (3x) marge boven de meting van vandaag bij concurrency 1", () => {
    const timeoutSeconden = timeoutMsVoorPortie(100, 1) / 1000;
    expect(timeoutSeconden).toBeCloseTo(TIMEOUT_VEILIGHEIDSMARGE * 84, 2);
    expect(timeoutSeconden).toBeGreaterThan(3 * 84 - 1);
    expect(TIMEOUT_VEILIGHEIDSMARGE).toBe(3);
  });

  it("timeoutMsVoorPortie blijft MET schema ruim boven de fixronde-3/4-metingen (die allemaal met --json-schema aan zijn gedraaid)", () => {
    // Concurrency 4 (fixronde 3): traagste individuele aanroep 451s.
    expect(timeoutMsVoorPortie(100, 4, true) / 1000).toBeGreaterThan(451);
    // Concurrency 2 (fixronde 4): 15 van de 29 aanroepen liepen op de oude
    // time-out van 370s vast (dus ≥370s, gecensureerd).
    expect(timeoutMsVoorPortie(100, 2, true) / 1000).toBeGreaterThan(2 * 370);
    expect(timeoutMsVoorPortie(100, 1, true)).toBeLessThan(timeoutMsVoorPortie(100, 2, true));
    expect(timeoutMsVoorPortie(100, 2, true)).toBeLessThan(timeoutMsVoorPortie(100, 4, true));
  });

  it("timeoutMsVoorPortie schaalt mee met concurrency, met én zonder schema", () => {
    expect(timeoutMsVoorPortie(100, 1)).toBeLessThan(timeoutMsVoorPortie(100, 2));
    expect(timeoutMsVoorPortie(100, 2)).toBeLessThan(timeoutMsVoorPortie(100, 4));
    // Bij dezelfde concurrency is de met-schema-timeout altijd ruimer dan
    // zonder, want geschatteSecondenVoorPortie(..., true) > (..., false).
    expect(timeoutMsVoorPortie(100, 1, true)).toBeGreaterThan(timeoutMsVoorPortie(100, 1, false));
  });

  it("OPBRENGST_FRACTIE_ZONDER_SCHEMA en geschatteRondesTotConvergentie: gedeeltelijke opbrengst als meetkundige reeks", () => {
    expect(OPBRENGST_FRACTIE_ZONDER_SCHEMA).toBeCloseTo(0.65, 6);
    expect(geschatteRondesTotConvergentie(1)).toBe(1);
    expect(geschatteRondesTotConvergentie(0.5)).toBeCloseTo(2, 6);
    expect(geschatteRondesTotConvergentie(OPBRENGST_FRACTIE_ZONDER_SCHEMA)).toBeCloseTo(1 / 0.65, 6);
    expect(geschatteRondesTotConvergentie(0)).toBe(Infinity);
  });

  it("contentieFactorVoorTimeout: drie echte ijkpunten (1, 2, 4), piecewise lineair ertussen en erboven", () => {
    // Triviaal op concurrency 1.
    expect(contentieFactorVoorTimeout(1)).toBe(1);
    // Concurrency 2 is nu een EXACT ijkpunt (fixronde 4: 2 tot 2,8x gemeten,
    // 2,8 = de bovenkant, bewust conservatief), niet langer een interpolatie
    // tussen 1 en 4 (die voorspelde 1,86x — te laag, zie fixronde 4).
    expect(contentieFactorVoorTimeout(2)).toBeCloseTo(CONTENTIE_FACTOR_OP_CONCURRENCY_2, 6);
    expect(CONTENTIE_FACTOR_OP_CONCURRENCY_2).toBe(2.8);
    expect(contentieFactorVoorTimeout(2)).toBeGreaterThan(1.86); // ruim boven fixronde 3's (te lage) voorspelling
    // Concurrency 4 blijft het ongewijzigde ijkpunt uit fixronde 3.
    expect(contentieFactorVoorTimeout(CONTENTIE_CONCURRENCY_IJKPUNT)).toBeCloseTo(CONTENTIE_FACTOR_OP_IJKPUNT, 6);
    expect(CONTENTIE_FACTOR_OP_IJKPUNT).toBeCloseTo(451 / 126, 6);
    // Tussen 2 en 4 (bijvoorbeeld 3): piecewise lineair, dus strikt tussen de twee ijkpunten.
    expect(contentieFactorVoorTimeout(3)).toBeGreaterThan(CONTENTIE_FACTOR_OP_CONCURRENCY_2);
    expect(contentieFactorVoorTimeout(3)).toBeLessThan(CONTENTIE_FACTOR_OP_IJKPUNT);
    // Boven het hoogste ijkpunt (4): extrapolatie met de helling van het
    // laatste segment, niet plat.
    expect(contentieFactorVoorTimeout(6)).toBeGreaterThan(CONTENTIE_FACTOR_OP_IJKPUNT);
  });

  it("doorloopFactorVoorConcurrency: triviaal 1 bij concurrency 1, gemeten ~10% winst bij concurrency 4", () => {
    expect(doorloopFactorVoorConcurrency(1)).toBe(1);
    expect(doorloopFactorVoorConcurrency(CONTENTIE_CONCURRENCY_IJKPUNT)).toBeCloseTo(DOORLOOP_FACTOR_OP_IJKPUNT, 6);
    expect(DOORLOOP_FACTOR_OP_IJKPUNT).toBeCloseTo(451 / 4 / 126, 6);
    // Gemeten: ~10% winst, geen 4x (dat zou 0.25 zijn geweest bij lineaire versnelling).
    expect(DOORLOOP_FACTOR_OP_IJKPUNT).toBeGreaterThan(0.85);
    expect(DOORLOOP_FACTOR_OP_IJKPUNT).toBeLessThan(0.95);
  });

  it("schatDroogeRun telt aanroepen, past de gemeten (bescheiden) doorloopwinst toe i.p.v. te delen door concurrency, en somt de kosten", () => {
    const porties = [[product()], [product(), product()]]; // 1 + 2 producten
    const schattingSolo = schatDroogeRun(porties, 1);
    expect(schattingSolo.aantalAanroepen).toBe(2);
    // Bij concurrency 1 is de schatting exact de seriële som: geen enkele
    // versnelling verondersteld.
    const serieelTotaal = geschatteSecondenVoorPortie(1) + geschatteSecondenVoorPortie(2);
    expect(schattingSolo.geschatteSeconden).toBe(Math.round(serieelTotaal));
    expect(schattingSolo.equivalentUsd).toBeCloseTo(schatEquivalentUsd(1) + schatEquivalentUsd(2), 6);

    // Bij concurrency 4 (het ijkpunt) is de schatting NIET serieelTotaal/4
    // (dat zou lineaire versnelling zijn, en die is er niet), maar
    // serieelTotaal keer de gemeten doorloopfactor (~0.895, dus ~10% korter).
    const schattingVier = schatDroogeRun(porties, 4);
    expect(schattingVier.geschatteSeconden).toBe(Math.round(serieelTotaal * DOORLOOP_FACTOR_OP_IJKPUNT));
    // Expliciete regressietoets tegen de oude (foute) aanname: NIET gelijk
    // aan delen door 4.
    expect(schattingVier.geschatteSeconden).not.toBe(Math.round(serieelTotaal / 4));
  });

  it("toont bij concurrency 1 (de nieuwe standaard) de eerlijke, volledig seriële schatting VOOR ÉÉN RONDE", () => {
    // 166 porties van 100 producten (de echte H&M-ronde, 147 nog open op het
    // moment van deze herijking): één ronde (één `--ja`-aanroep) zonder
    // schema duurt naar schatting geen 5,8 uur meer, want die schatting kwam
    // uit het oude, schema-gekalibreerde model. Op het nieuwe ijkpunt (84s
    // per portie) is dat ~3,9 uur voor ÉÉN pass over de kandidaten.
    const porties166 = Array.from({ length: 166 }, () => Array.from({ length: 100 }, () => product()));
    const schatting = schatDroogeRun(porties166, 1);
    // Geen enkele versnelling verondersteld bij concurrency 1: exact de
    // seriële som, geen doorloopfactor.
    expect(schatting.geschatteSeconden).toBe(Math.round(166 * geschatteSecondenVoorPortie(100)));
    const uren = schatting.geschatteSeconden / 3600;
    expect(uren).toBeGreaterThan(3.5);
    expect(uren).toBeLessThan(4.5);
  });

  it("schatDroogeRun rekent zonder schema de gedeeltelijke opbrengst door naar een eerlijk totaalbeeld (meerdere ronden om te convergeren)", () => {
    const porties166 = Array.from({ length: 166 }, () => Array.from({ length: 100 }, () => product()));
    const schatting = schatDroogeRun(porties166, 1);
    expect(schatting.geschatteRondesTotConvergentie).toBeCloseTo(1 / OPBRENGST_FRACTIE_ZONDER_SCHEMA, 6);
    expect(schatting.geschatteSecondenTotConvergentie).toBe(
      Math.round(schatting.geschatteSeconden * schatting.geschatteRondesTotConvergentie)
    );
    expect(schatting.equivalentUsdTotConvergentie).toBeCloseTo(
      schatting.equivalentUsd * schatting.geschatteRondesTotConvergentie,
      6
    );
    // Met de opbrengstfractie meegerekend komt het totaalbeeld (meerdere
    // ronden) weer in de buurt van de oude "circa 5,8 uur"-orde van grootte,
    // maar nu als optelsom van ~1,5 ronde i.p.v. één ronde met schema.
    const urenTotConvergentie = schatting.geschatteSecondenTotConvergentie / 3600;
    expect(urenTotConvergentie).toBeGreaterThan(5.5);
    expect(urenTotConvergentie).toBeLessThan(6.5);
  });

  it("schatDroogeRun rekent MET schema geen extra ronden: geschatteRondesTotConvergentie is exact 1 (100% opbrengst gemeten)", () => {
    const porties = [[product(), product()]];
    const schatting = schatDroogeRun(porties, 1, true);
    expect(schatting.geschatteRondesTotConvergentie).toBe(1);
    expect(schatting.geschatteSecondenTotConvergentie).toBe(schatting.geschatteSeconden);
    expect(schatting.equivalentUsdTotConvergentie).toBeCloseTo(schatting.equivalentUsd, 6);
  });
});

describe("PortieRecord: maakPortieRecord en comprimeerVerwerkt", () => {
  it("maakt een open portie met de volledige productlijst erin", () => {
    const producten = [product(), product({ product_id: "2" })];
    const record = maakPortieRecord({ retailer: "H&M (NL)", modus: "tekst", tagger_version: TAGGER_VERSION, producten });
    expect(record.status).toBe("open");
    expect(record.aantal).toBe(2);
    expect(record.producten).toEqual(producten);
    expect(record.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("geeft elke aanroep een ander id", () => {
    const a = maakPortieRecord({ retailer: "H&M (NL)", modus: "tekst", tagger_version: TAGGER_VERSION, producten: [product()] });
    const b = maakPortieRecord({ retailer: "H&M (NL)", modus: "tekst", tagger_version: TAGGER_VERSION, producten: [product()] });
    expect(a.id).not.toBe(b.id);
  });

  it("comprimeerVerwerkt haalt producten weg bij het genoemde id en laat andere rijen intact", () => {
    const record: PortieRecord = maakPortieRecord({
      retailer: "H&M (NL)",
      modus: "tekst",
      tagger_version: TAGGER_VERSION,
      producten: [product()],
    });
    const ander: PortieRecord = maakPortieRecord({
      retailer: "H&M (NL)",
      modus: "tekst",
      tagger_version: TAGGER_VERSION,
      producten: [product()],
    });
    const store: BatchesBestand = { batches: [record, ander] };
    const uit = comprimeerVerwerkt(store, record.id);
    expect((uit.batches[0] as PortieRecord).producten).toBeUndefined();
    expect((uit.batches[1] as PortieRecord).producten).toEqual(ander.producten);
  });
});

describe("prompt-opbouw", () => {
  it("bouwSysteemPromptCli legt de index/items-vorm uit en verbiedt markdown-codeblokken", () => {
    const prompt = bouwSysteemPromptCli();
    expect(prompt).toContain("index");
    expect(prompt).toContain("items");
    expect(prompt.toLowerCase()).toContain("geen markdown-codeblok");
  });

  it("bouwProductBlok nummert het product en laat de foto-regel weg zonder lokaal pad", () => {
    const blok = bouwProductBlok(product(), 3);
    expect(blok).toMatch(/^Product 3:/);
    expect(blok).toContain("H&M (NL)");
    expect(blok).not.toContain("Foto:");
  });

  it("bouwProductBlok voegt de @pad-referentie toe met een lokaal pad", () => {
    const blok = bouwProductBlok(product(), 1, "/tmp/foo.jpg");
    expect(blok).toContain("Foto: @/tmp/foo.jpg");
  });

  it("bouwOpdracht nummert alle producten in volgorde", () => {
    const producten = [product({ product_id: "a" }), product({ product_id: "b" })];
    const opdracht = bouwOpdracht(producten);
    expect(opdracht.indexOf("Product 1:")).toBeGreaterThanOrEqual(0);
    expect(opdracht.indexOf("Product 1:")).toBeLessThan(opdracht.indexOf("Product 2:"));
    expect(opdracht).toContain("2 producten");
  });

  it("bouwOpdracht geeft alleen producten met een lokaal pad een foto-regel", () => {
    const producten = [product({ product_id: "a" }), product({ product_id: "b" })];
    const paden = new Map([["a", "/tmp/a.jpg"]]);
    const opdracht = bouwOpdracht(producten, paden);
    expect(opdracht).toContain("Foto: @/tmp/a.jpg");
    expect(opdracht.split("Foto:").length - 1).toBe(1);
  });
});

describe("CLI_SCHEMA", () => {
  it("wikkelt TAG_SCHEMA in een items-array met een verplicht index-veld", () => {
    expect(CLI_SCHEMA.properties.items.type).toBe("array");
    const itemSchema = CLI_SCHEMA.properties.items.items;
    expect(itemSchema.required).toContain("index");
    for (const veld of TAG_SCHEMA.required) expect(itemSchema.required).toContain(veld);
    expect(itemSchema.properties.category).toEqual(TAG_SCHEMA.properties.category);
    expect(itemSchema.additionalProperties).toBe(false);
  });
});

describe("strippenJsonHekjes", () => {
  it("laat platte JSON ongemoeid", () => {
    expect(strippenJsonHekjes('{"a":1}')).toBe('{"a":1}');
  });

  it("strip ```json-hekjes met taalcode", () => {
    expect(strippenJsonHekjes('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("strip kale ```-hekjes zonder taalcode", () => {
    expect(strippenJsonHekjes('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("strip hekjes ook als er tekst vóór of na het blok staat (zonder --json-schema gemeten, 23 sept 2026)", () => {
    expect(strippenJsonHekjes('Hier zijn de tags:\n```json\n{"a":1}\n```\nBedankt!')).toBe('{"a":1}');
  });
});

describe("parseJsonUitCliTekst (het hoofdpad zonder --json-schema sinds de terugdraai)", () => {
  it("parseert platte JSON en JSON in hekjes, zoals strippenJsonHekjes", () => {
    expect(parseJsonUitCliTekst('{"a":1}')).toEqual({ a: 1 });
    expect(parseJsonUitCliTekst('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("haalt het JSON-object eruit als er tekst vóór of na staat, ook zonder hekjes eromheen", () => {
    expect(parseJsonUitCliTekst('Hier zijn de tags: {"a":1} Dat was het.')).toEqual({ a: 1 });
  });

  it("geeft null bij volledig onparseerbare of lege tekst, in plaats van te gooien", () => {
    expect(parseJsonUitCliTekst("sorry, ik kan dit niet")).toBeNull();
    expect(parseJsonUitCliTekst("")).toBeNull();
  });
});

describe("bouwClaudeArgs: harde randvoorwaarden uit het amendement", () => {
  const args = bouwClaudeArgs({
    model: "claude-haiku-4-5-20251001",
    systeemPrompt: "systeem",
    opdracht: "opdracht",
    jsonSchema: { type: "object" },
  });

  it("laat --json-schema helemaal weg als er geen schema wordt meegegeven (de standaard sinds 23 sept 2026)", () => {
    const argsZonder = bouwClaudeArgs({ model: "m", systeemPrompt: "s", opdracht: "o" });
    expect(argsZonder).not.toContain("--json-schema");
    expect(argsZonder[argsZonder.length - 1]).toBe("o");
  });

  it("bevat nooit --bare", () => {
    expect(args).not.toContain("--bare");
  });

  it("zet --allowed-tools op een lege string", () => {
    const i = args.indexOf("--allowed-tools");
    expect(i).toBeGreaterThanOrEqual(0);
    expect(args[i + 1]).toBe("");
  });

  it("geeft het model door zoals meegegeven (exact model-id, geen alias hardgecodeerd)", () => {
    const i = args.indexOf("--model");
    expect(args[i + 1]).toBe("claude-haiku-4-5-20251001");
  });

  it("vraagt --output-format json en geeft de opdracht als laatste (positionele) argument", () => {
    expect(args).toContain("--output-format");
    expect(args[args.indexOf("--output-format") + 1]).toBe("json");
    expect(args[args.length - 1]).toBe("opdracht");
  });

  it("geeft het schema als geldige JSON mee bij --json-schema", () => {
    const i = args.indexOf("--json-schema");
    expect(JSON.parse(args[i + 1])).toEqual({ type: "object" });
  });
});

describe("verwerkCliUitvoer", () => {
  const producten = [product({ product_id: "a" }), product({ product_id: "b" })];

  it("verwerkt een volledig, geldig structured_output-antwoord", () => {
    const respons = {
      structured_output: {
        items: [
          { index: 1, ...geldigeTags },
          { index: 2, ...geldigeTags },
        ],
      },
    };
    const uit = verwerkCliUitvoer(respons, producten, "tekst");
    expect(uit.mislukt).toBe(false);
    expect(uit.rijen).toHaveLength(2);
    expect(uit.rijen.map((r) => r.product_id).sort()).toEqual(["a", "b"]);
    expect(uit.rijen[0].tagger_version).toBe(TAGGER_VERSION);
    expect(uit.fouten).toEqual([]);
    expect(uit.aantalObjecten).toBe(2);
  });

  it("gebruikt TAGGER_VERSION_FOTO in modus foto", () => {
    const respons = { structured_output: { items: [{ index: 1, ...geldigeTags }] } };
    const uit = verwerkCliUitvoer(respons, [producten[0]], "foto");
    expect(uit.rijen[0].tagger_version).toBe(TAGGER_VERSION_FOTO);
  });

  it("valt terug op result met ```json-hekjes als structured_output ontbreekt", () => {
    const respons = {
      result: "```json\n" + JSON.stringify({ items: [{ index: 1, ...geldigeTags }, { index: 2, ...geldigeTags }] }) + "\n```",
    };
    const uit = verwerkCliUitvoer(respons, producten, "tekst");
    expect(uit.mislukt).toBe(false);
    expect(uit.rijen).toHaveLength(2);
  });

  it("valt terug op result met tekst vóór/na het JSON-blok, ook zonder hekjes (gemeten zonder --json-schema, 23 sept 2026)", () => {
    const respons = {
      result:
        "Hier zijn de tags: " +
        JSON.stringify({ items: [{ index: 1, ...geldigeTags }, { index: 2, ...geldigeTags }] }) +
        " Klaar.",
    };
    const uit = verwerkCliUitvoer(respons, producten, "tekst");
    expect(uit.mislukt).toBe(false);
    expect(uit.rijen).toHaveLength(2);
  });

  it("koppelt op index, niet op array-positie: een product dat ontbreekt wordt een fout, niet een verschuiving", () => {
    // Het model laat index 1 weg; alleen index 2 komt terug.
    const respons = { structured_output: { items: [{ index: 2, ...geldigeTags }] } };
    const uit = verwerkCliUitvoer(respons, producten, "tekst");
    expect(uit.mislukt).toBe(false);
    expect(uit.rijen).toHaveLength(1);
    expect(uit.rijen[0].product_id).toBe("b");
    expect(uit.fouten).toEqual([{ product_id: "a", reden: "geen tag ontvangen van het model (ontbreekt in de uitvoer)" }]);
    expect(uit.aantalObjecten).toBe(1);
  });

  it("laat MEERDERE ontbrekende producten (minder objecten terug dan verstuurd) allemaal als fout zien, geen enkele stilzwijgend als verwerkt", () => {
    // Nabootsing van de echte meting (23 sept 2026): 5 verstuurd, het model
    // geeft alleen voor product 1, 3 en 5 een object terug (3 van de 5).
    const vijfProducten = Array.from({ length: 5 }, (_, i) => product({ product_id: `p${i}` }));
    const respons = {
      structured_output: {
        items: [
          { index: 1, ...geldigeTags },
          { index: 3, ...geldigeTags },
          { index: 5, ...geldigeTags },
        ],
      },
    };
    const uit = verwerkCliUitvoer(respons, vijfProducten, "tekst");
    expect(uit.mislukt).toBe(false);
    expect(uit.aantalObjecten).toBe(3);
    expect(uit.rijen.map((r) => r.product_id).sort()).toEqual(["p0", "p2", "p4"]);
    // p1 (index 2) en p3 (index 4) kregen geen object: moeten als fout
    // genoteerd staan, niet stilzwijgend als verwerkt gelden.
    expect(uit.fouten.map((f) => f.product_id).sort()).toEqual(["p1", "p3"]);
    expect(uit.fouten.every((f) => f.reden.includes("ontbreekt in de uitvoer"))).toBe(true);
  });

  it("negeert een dubbele index (eerste telt) in plaats van te crashen", () => {
    const respons = {
      structured_output: {
        items: [
          { index: 1, ...geldigeTags },
          { index: 1, ...geldigeTags, colors: ["zwart"] },
        ],
      },
    };
    const uit = verwerkCliUitvoer(respons, [producten[0]], "tekst");
    expect(uit.rijen).toHaveLength(1);
    expect(uit.rijen[0].colors).toEqual(["wit"]);
  });

  it("negeert een index buiten bereik in plaats van te crashen", () => {
    const respons = { structured_output: { items: [{ index: 99, ...geldigeTags }] } };
    const uit = verwerkCliUitvoer(respons, [producten[0]], "tekst");
    expect(uit.rijen).toEqual([]);
    expect(uit.fouten).toEqual([{ product_id: "a", reden: "geen tag ontvangen van het model (ontbreekt in de uitvoer)" }]);
  });

  it("logt een schema-fout per product zonder de rest van de portie te raken", () => {
    const respons = {
      structured_output: {
        items: [
          { index: 1, ...geldigeTags, formality: 99 }, // ongeldig
          { index: 2, ...geldigeTags },
        ],
      },
    };
    const uit = verwerkCliUitvoer(respons, producten, "tekst");
    expect(uit.mislukt).toBe(false);
    expect(uit.rijen).toHaveLength(1);
    expect(uit.rijen[0].product_id).toBe("b");
    expect(uit.fouten).toEqual([{ product_id: "a", reden: "waarde buiten schema" }]);
  });

  it("is mislukt bij is_error", () => {
    const uit = verwerkCliUitvoer({ is_error: true, result: "time-out na 300s" }, producten, "tekst");
    expect(uit.mislukt).toBe(true);
    expect(uit.reden).toContain("time-out na 300s");
  });

  it("is mislukt bij onparseerbare uitvoer (geen structured_output, result geen JSON)", () => {
    const uit = verwerkCliUitvoer({ result: "sorry, ik kan dit niet" }, producten, "tekst");
    expect(uit.mislukt).toBe(true);
  });

  it("is mislukt bij een lege items-array terwijl er producten waren", () => {
    const uit = verwerkCliUitvoer({ structured_output: { items: [] } }, producten, "tekst");
    expect(uit.mislukt).toBe(true);
    expect(uit.reden).toContain("0 van de 2");
  });
});

describe("extensieVoorUrl", () => {
  it("haalt de extensie uit het pad", () => {
    expect(extensieVoorUrl("https://cdn.example.com/a/b/foto.png?w=200")).toBe(".png");
  });

  it("normaliseert .jpeg naar .jpg", () => {
    expect(extensieVoorUrl("https://cdn.example.com/foto.JPEG")).toBe(".jpg");
  });

  it("valt terug op .jpg zonder extensie of een onbekende extensie", () => {
    expect(extensieVoorUrl("https://cdn.example.com/foto")).toBe(".jpg");
    expect(extensieVoorUrl("https://cdn.example.com/foto.bmp")).toBe(".jpg");
  });

  it("valt terug op .jpg bij een ongeldige URL in plaats van te gooien", () => {
    expect(extensieVoorUrl("niet-een-url")).toBe(".jpg");
  });
});

describe("downloadFoto", () => {
  it("schrijft het bestand weg bij een geslaagde fetch", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tagcli-foto-"));
    const doelPad = join(dir, "foto.jpg");
    const fakeFetch = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }));
    const ok = await downloadFoto("https://example.com/foto.jpg", doelPad, fakeFetch as unknown as typeof fetch);
    expect(ok).toBe(true);
    expect(readFileSync(doelPad)).toEqual(Buffer.from([1, 2, 3]));
    rmSync(dir, { recursive: true, force: true });
  });

  it("geeft false terug bij een niet-ok response, zonder te gooien", async () => {
    const fakeFetch = vi.fn(async () => ({ ok: false, arrayBuffer: async () => new ArrayBuffer(0) }));
    const ok = await downloadFoto("https://example.com/weg.jpg", "/tmp/nooit.jpg", fakeFetch as unknown as typeof fetch);
    expect(ok).toBe(false);
  });

  it("geeft false terug als fetch zelf gooit", async () => {
    const fakeFetch = vi.fn(async () => {
      throw new Error("netwerk weg");
    });
    const ok = await downloadFoto("https://example.com/weg.jpg", "/tmp/nooit.jpg", fakeFetch as unknown as typeof fetch);
    expect(ok).toBe(false);
  });
});

describe("voerMetConcurrency", () => {
  it("verwerkt alle items en houdt nooit meer dan `concurrency` gelijktijdig lopen", async () => {
    let inVlucht = 0;
    let maxInVlucht = 0;
    const items = Array.from({ length: 12 }, (_, i) => i);
    const uitkomst = await voerMetConcurrency(items, 3, 100, async () => {
      inVlucht += 1;
      maxInVlucht = Math.max(maxInVlucht, inVlucht);
      await new Promise((r) => setTimeout(r, 5));
      inVlucht -= 1;
      return { ok: true };
    });
    expect(uitkomst.gestopt).toBe(false);
    expect(maxInVlucht).toBeLessThanOrEqual(3);
  });

  it("stopt na maxOpeenvolgendeFouten mislukkingen op rij en laat lopende taken afmaken", async () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    const verwerkt: number[] = [];
    const uitkomst = await voerMetConcurrency(items, 2, 3, async (i) => {
      verwerkt.push(i);
      return { ok: false, reden: `item ${i} mislukt` };
    });
    expect(uitkomst.gestopt).toBe(true);
    expect(uitkomst.reden).toBe("item 2 mislukt");
    // met concurrency 2 en drempel 3 zijn er niet veel meer dan 3-4 items opgepakt
    expect(verwerkt.length).toBeLessThan(items.length);
  });

  it("reset de teller bij een succes, dus incidentele mislukkingen stoppen de run niet", async () => {
    const uitslagen = [
      { ok: false, reden: "a" },
      { ok: false, reden: "b" },
      { ok: true },
      { ok: false, reden: "c" },
      { ok: false, reden: "d" },
    ];
    let i = 0;
    const uitkomst = await voerMetConcurrency(uitslagen, 1, 3, async () => uitslagen[i++]);
    expect(uitkomst.gestopt).toBe(false);
  });
});

describe("controleerGeenOpenPortiesMeer (fixronde 2, controller 22 sept 2026)", () => {
  // Reproduceert precies het faalscenario uit de review: bij verspreide
  // mislukkingen die MAX_OPEENVOLGENDE_FOUTEN nooit op rij raken, geeft
  // voerMetConcurrency "gestopt: false" terug terwijl er toch open porties
  // overblijven. Zonder een aparte, na afloop uitgevoerde controle zou
  // tag-products.ts dan "Klaar." met exitcode 0 melden. Deze test bewijst
  // dat de combinatie (voerMetConcurrency + controleerGeenOpenPortiesMeer)
  // dat scenario wél als niet-succesvol herkent.
  it("herkent verspreide, niet-opeenvolgende mislukkingen als 'moet stoppen', ook als voerMetConcurrency zelf niet stopte", async () => {
    const retailer = "H&M (NL)";
    const modus = "tekst" as const;

    // 20 porties, alle "open". Porties op index 4 en 13 mislukken (time-out);
    // de rest, inclusief de porties er direct naast, slaagt. Nooit twee
    // mislukkingen op rij, dus de drempel van 3 wordt nooit geraakt.
    const porties: PortieRecord[] = Array.from({ length: 20 }, (_, i) =>
      maakPortieRecord({ retailer, modus, tagger_version: TAGGER_VERSION, producten: [product({ product_id: `p${i}` })] })
    );
    let store: BatchesBestand = { batches: porties };
    const mislukkenOp = new Set([4, 13]);

    const uitkomst = await voerMetConcurrency(porties, 4, 3, async (portie) => {
      const i = porties.indexOf(portie);
      if (mislukkenOp.has(i)) {
        return { ok: false, reden: `portie ${i} time-out` };
      }
      // Simuleert wat verwerkPortie in tag-products.ts doet bij succes:
      // markeren als verwerkt in de gedeelde store.
      store = { batches: store.batches.map((b) => (b.id === portie.id ? { ...b, status: "verwerkt" as const } : b)) };
      return { ok: true };
    });

    // De kern van de bug: geen enkele reeks van 3 mislukkingen op rij, dus
    // voerMetConcurrency meldt zelf geen "gestopt".
    expect(uitkomst.gestopt).toBe(false);

    // Maar er staan wél degelijk nog 2 porties open, met samen 2 producten
    // (1 product per portie in deze test). controleerGeenOpenPortiesMeer
    // moet dat vangen, ook al zegt voerMetConcurrency "niet gestopt".
    const controle = controleerGeenOpenPortiesMeer(store, retailer, modus);
    expect(controle.moetStoppen).toBe(true);
    expect(controle.aantalPorties).toBe(2);
    expect(controle.aantalProducten).toBe(2);
  });

  it("geeft moetStoppen: false als alle porties verwerkt zijn", () => {
    const retailer = "H&M (NL)";
    const modus = "tekst" as const;
    const porties = Array.from({ length: 5 }, (_, i) =>
      maakPortieRecord({ retailer, modus, tagger_version: TAGGER_VERSION, producten: [product({ product_id: `p${i}` })] })
    );
    const store: BatchesBestand = {
      batches: porties.map((p) => ({ ...p, status: "verwerkt" as const })),
    };
    const controle = controleerGeenOpenPortiesMeer(store, retailer, modus);
    expect(controle).toEqual({ moetStoppen: false, aantalPorties: 0, aantalProducten: 0 });
  });

  it("telt alleen open porties van de opgegeven retailer en modus mee", () => {
    const modus = "tekst" as const;
    const open1 = maakPortieRecord({ retailer: "H&M (NL)", modus, tagger_version: TAGGER_VERSION, producten: [product()] });
    const anderRetailer = maakPortieRecord({ retailer: "Giglio", modus, tagger_version: TAGGER_VERSION, producten: [product()] });
    const anderModus = maakPortieRecord({
      retailer: "H&M (NL)",
      modus: "foto",
      tagger_version: TAGGER_VERSION_FOTO,
      producten: [product()],
    });
    const store: BatchesBestand = { batches: [open1, anderRetailer, anderModus] };
    const controle = controleerGeenOpenPortiesMeer(store, "H&M (NL)", "tekst");
    expect(controle).toEqual({ moetStoppen: true, aantalPorties: 1, aantalProducten: 1 });
  });
});

describe("haalKandidaten", () => {
  it("pagineert tot een kleinere pagina het einde signaleert", async () => {
    const paginaEen = Array.from({ length: KANDIDATEN_PAGINA }, (_, i) => product({ product_id: String(i) }));
    const paginaTwee = [product({ product_id: "laatste" })];
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: paginaEen, error: null })
      .mockResolvedValueOnce({ data: paginaTwee, error: null });
    const uit = await haalKandidaten({ rpc }, "H&M (NL)", "tekst", 0);
    expect(uit).toHaveLength(KANDIDATEN_PAGINA + 1);
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc.mock.calls[1][1]).toMatchObject({ p_after: String(KANDIDATEN_PAGINA - 1) });
  });

  it("stopt zodra de limiet is bereikt, ook binnen een volle pagina", async () => {
    const paginaEen = Array.from({ length: KANDIDATEN_PAGINA }, (_, i) => product({ product_id: String(i) }));
    const rpc = vi.fn().mockResolvedValueOnce({ data: paginaEen, error: null });
    const uit = await haalKandidaten({ rpc }, "H&M (NL)", "tekst", 5);
    expect(uit).toHaveLength(5);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("gooit een fout met de boodschap van de RPC (bijvoorbeeld een onbekende retailer)", async () => {
    const rpc = vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'Onbekende retailer: "x"' } });
    await expect(haalKandidaten({ rpc }, "x", "tekst", 0)).rejects.toThrow('keten_tag_kandidaten: Onbekende retailer: "x"');
  });
});

describe("schrijfRijen", () => {
  it("schrijft in chunks van SCHRIJF_CHUNK en telt het resultaat op", async () => {
    const rijen = Array.from({ length: SCHRIJF_CHUNK + 10 }, (_, i) => ({
      ...geldigeTags,
      product_id: String(i),
      tagger_version: TAGGER_VERSION,
    }));
    const rpc = vi.fn().mockResolvedValueOnce({ data: SCHRIJF_CHUNK, error: null }).mockResolvedValueOnce({ data: 10, error: null });
    const geschreven = await schrijfRijen({ rpc }, rijen as never);
    expect(geschreven).toBe(SCHRIJF_CHUNK + 10);
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc.mock.calls[0][1].p_rijen).toHaveLength(SCHRIJF_CHUNK);
    expect(rpc.mock.calls[1][1].p_rijen).toHaveLength(10);
  });

  it("gooit een fout met de boodschap van de RPC", async () => {
    const rpc = vi.fn().mockResolvedValueOnce({ data: null, error: { message: "kapot" } });
    await expect(schrijfRijen({ rpc }, [{ ...geldigeTags, product_id: "a", tagger_version: TAGGER_VERSION }] as never)).rejects.toThrow(
      "keten_schrijf_tags: kapot"
    );
  });
});

describe("module-constanten blijven bewust laag (zie amendement)", () => {
  it("CONCURRENCY_STANDAARD en MAX_OPEENVOLGENDE_FOUTEN zijn kleine, expliciete getallen", () => {
    expect(PORTIE_GROOTTE).toBe(100);
    expect(MAX_OPEENVOLGENDE_FOUTEN).toBeGreaterThan(0);
    expect(MAX_OPEENVOLGENDE_FOUTEN).toBeLessThanOrEqual(5);
  });
});
