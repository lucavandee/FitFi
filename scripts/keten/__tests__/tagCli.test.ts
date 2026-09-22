import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { BatchesBestand } from "../batchesStore";
import {
  BASIS_KOSTEN_USD,
  CLI_SCHEMA,
  KANDIDATEN_PAGINA,
  KOSTEN_FACTOR_MET_SCHEMA,
  MAX_OPEENVOLGENDE_FOUTEN,
  OPSTART_SECONDEN,
  PER_PRODUCT_KOSTEN_USD,
  PORTIE_GROOTTE,
  SCHRIJF_CHUNK,
  SECONDEN_PER_PRODUCT,
  TIJD_FACTOR_MET_SCHEMA,
  TIMEOUT_VEILIGHEIDSMARGE,
  bouwClaudeArgs,
  bouwOpdracht,
  bouwProductBlok,
  bouwSysteemPromptCli,
  comprimeerVerwerkt,
  controleerGeenOpenPortiesMeer,
  downloadFoto,
  extensieVoorUrl,
  geschatteSecondenVoorPortie,
  haalKandidaten,
  maakPortieRecord,
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

describe("tijd- en kostenmodel (fixronde 22 sept 2026: gekalibreerd op n=100, zie taak-5-report.md)", () => {
  it("het basismodel zonder --json-schema klopt met de twee echte metingen (10 en 100 producten)", () => {
    // 55 + 1.4*10 = 69 (amendement), 55 + 1.4*100 = 195 ≈ 194 (controllers A/B).
    expect(OPSTART_SECONDEN).toBe(55);
    expect(SECONDEN_PER_PRODUCT).toBe(1.4);
    expect(OPSTART_SECONDEN + SECONDEN_PER_PRODUCT * 10).toBeCloseTo(69, 5);
    // Het kale model geeft 195 (55 + 1.4*100); de echte meting was 194s. Eén
    // seconde verschil door afronding, geen exacte pasvorm en dat hoeft ook
    // niet: dit is de zonder-schema-basis, niet het ijkpunt zelf.
    expect(Math.abs(OPSTART_SECONDEN + SECONDEN_PER_PRODUCT * 100 - 194)).toBeLessThanOrEqual(2);
    // Kostenbasis: basis + 10k = 0.044, basis + 100k = 0.148.
    expect(BASIS_KOSTEN_USD + 10 * PER_PRODUCT_KOSTEN_USD).toBeCloseTo(0.044, 3);
    expect(BASIS_KOSTEN_USD + 100 * PER_PRODUCT_KOSTEN_USD).toBeCloseTo(0.148, 3);
  });

  it("tijd- en kostenfactor voor --json-schema zijn apart (niet gelijk): sneller maar duurder", () => {
    // Controllers A/B op 100 producten: met schema 132s/$0.212, zonder 194s/$0.148.
    expect(TIJD_FACTOR_MET_SCHEMA).toBeLessThan(1); // sneller
    expect(KOSTEN_FACTOR_MET_SCHEMA).toBeGreaterThan(1); // duurder
    expect(TIJD_FACTOR_MET_SCHEMA).not.toBeCloseTo(KOSTEN_FACTOR_MET_SCHEMA, 1);
    expect(TIJD_FACTOR_MET_SCHEMA).toBeCloseTo(132 / 194, 6);
    expect(KOSTEN_FACTOR_MET_SCHEMA).toBeCloseTo(0.212 / 0.148, 6);
  });

  it("geschatteSecondenVoorPortie en schatEquivalentUsd komen op het ijkpunt (n=100) overeen met de echte meting", () => {
    expect(Math.abs(geschatteSecondenVoorPortie(100) - 132)).toBeLessThanOrEqual(1);
    expect(schatEquivalentUsd(100)).toBeCloseTo(0.212, 2);
  });

  it("geschatteSecondenVoorPortie en schatEquivalentUsd passen hun eigen factor toe (geen gedeelde vermenigvuldiger)", () => {
    expect(geschatteSecondenVoorPortie(50)).toBeCloseTo(TIJD_FACTOR_MET_SCHEMA * (OPSTART_SECONDEN + SECONDEN_PER_PRODUCT * 50), 6);
    expect(schatEquivalentUsd(50)).toBeCloseTo(KOSTEN_FACTOR_MET_SCHEMA * (BASIS_KOSTEN_USD + PER_PRODUCT_KOSTEN_USD * 50), 6);
  });

  it("timeoutMsVoorPortie geeft marge bovenop de tijdschatting, ook bij het ijkpunt n=100", () => {
    const timeoutSeconden = timeoutMsVoorPortie(100) / 1000;
    expect(timeoutSeconden).toBeGreaterThan(132); // ruim boven de echte meting van 132s
    expect(timeoutSeconden).toBeCloseTo(TIMEOUT_VEILIGHEIDSMARGE * geschatteSecondenVoorPortie(100), 2);
  });

  it("schatDroogeRun telt aanroepen, verdeelt looptijd over de concurrency en somt de kosten", () => {
    const porties = [[product()], [product(), product()]]; // 1 + 2 producten
    const schatting = schatDroogeRun(porties, 4);
    expect(schatting.aantalAanroepen).toBe(2);
    // met concurrency >= aantal porties lopen ze effectief parallel: de
    // looptijd is de langzaamste portie, niet de som.
    const verwacht = Math.round((geschatteSecondenVoorPortie(1) + geschatteSecondenVoorPortie(2)) / 2);
    expect(schatting.geschatteSeconden).toBe(verwacht);
    expect(schatting.equivalentUsd).toBeCloseTo(schatEquivalentUsd(1) + schatEquivalentUsd(2), 6);
  });

  it("schatDroogeRun deelt niet door meer werkers dan er porties zijn", () => {
    const porties = [Array.from({ length: 5 }, () => product())];
    const schatting = schatDroogeRun(porties, 4);
    expect(schatting.geschatteSeconden).toBe(Math.round(geschatteSecondenVoorPortie(5)));
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
});

describe("bouwClaudeArgs: harde randvoorwaarden uit het amendement", () => {
  const args = bouwClaudeArgs({
    model: "claude-haiku-4-5-20251001",
    systeemPrompt: "systeem",
    opdracht: "opdracht",
    jsonSchema: { type: "object" },
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

  it("koppelt op index, niet op array-positie: een product dat ontbreekt wordt een fout, niet een verschuiving", () => {
    // Het model laat index 1 weg; alleen index 2 komt terug.
    const respons = { structured_output: { items: [{ index: 2, ...geldigeTags }] } };
    const uit = verwerkCliUitvoer(respons, producten, "tekst");
    expect(uit.mislukt).toBe(false);
    expect(uit.rijen).toHaveLength(1);
    expect(uit.rijen[0].product_id).toBe("b");
    expect(uit.fouten).toEqual([{ product_id: "a", reden: "geen tag ontvangen van het model (ontbreekt in de uitvoer)" }]);
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
