import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { leesBatches, markeerVerwerkt, openBatches, schrijfBatches, type BatchRecord } from "../batchesStore";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "keten-batches-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const record = (extra: Partial<BatchRecord> = {}): BatchRecord => ({
  id: "msgbatch_1",
  retailer: "H&M (NL)",
  modus: "tekst",
  tagger_version: "haiku-4.5-v1",
  aantal: 10,
  aangemaakt: "2026-09-16T10:00:00.000Z",
  status: "open",
  ...extra,
});

describe("leesBatches en schrijfBatches", () => {
  it("geeft een leeg bestand als er nog niets is", () => {
    expect(leesBatches(join(dir, ".batches.json"))).toEqual({ batches: [] });
  });

  it("schrijft en leest hetzelfde terug, zonder tijdelijk bestand achter te laten", () => {
    const pad = join(dir, ".batches.json");
    schrijfBatches(pad, { batches: [record()] });
    expect(leesBatches(pad)).toEqual({ batches: [record()] });
    expect(() => readFileSync(pad + ".tmp")).toThrow();
  });

  // Deze drie tests gaan verder dan de brief: een lege lijst waar een lopende
  // batch had moeten staan kost een ronde van ~76 dollar opnieuw (zie de
  // faalgevallen-uitleg bovenaan batchesStore.ts). leesBatches moet dus
  // luidkeels stuklopen op een beschadigd bestand, niet stilzwijgend { batches: [] }
  // teruggeven.
  it("gooit een fout bij een leeg bestand in plaats van stilzwijgend een lege lijst", () => {
    const pad = join(dir, ".batches.json");
    writeFileSync(pad, "");
    expect(() => leesBatches(pad)).toThrow();
  });

  it("gooit een fout bij ongeldige JSON", () => {
    const pad = join(dir, ".batches.json");
    writeFileSync(pad, "{ dit is geen json");
    expect(() => leesBatches(pad)).toThrow();
  });

  // Drie aparte blokken in plaats van drie asserties in één test: faalt de eerste
  // variant, dan blijven de andere twee toch zichtbaar in de testuitslag.
  it("gooit een fout als het batches-veld helemaal ontbreekt", () => {
    const pad = join(dir, ".batches.json");
    writeFileSync(pad, JSON.stringify({}));
    expect(() => leesBatches(pad)).toThrow();
  });

  it("gooit een fout als batches geen array is", () => {
    const pad = join(dir, ".batches.json");
    writeFileSync(pad, JSON.stringify({ batches: "niet een array" }));
    expect(() => leesBatches(pad)).toThrow();
  });

  it("gooit een fout als het hele bestand een array is in plaats van een object met batches", () => {
    const pad = join(dir, ".batches.json");
    writeFileSync(pad, JSON.stringify([record()]));
    expect(() => leesBatches(pad)).toThrow();
  });
});

describe("openBatches en markeerVerwerkt", () => {
  it("filtert op retailer, modus en status open", () => {
    const data = {
      batches: [
        record(),
        record({ id: "b", modus: "foto" }),
        record({ id: "c", status: "verwerkt" }),
        record({ id: "d", retailer: "Giglio" }),
      ],
    };
    expect(openBatches(data, "H&M (NL)", "tekst").map((b) => b.id)).toEqual(["msgbatch_1"]);
  });

  it("markeert een batch verwerkt zonder de invoer te muteren", () => {
    const data = { batches: [record()] };
    const uit = markeerVerwerkt(data, "msgbatch_1", "2026-09-16T11:00:00.000Z");
    expect(uit.batches[0]).toMatchObject({ status: "verwerkt", verwerkt_op: "2026-09-16T11:00:00.000Z" });
    expect(data.batches[0].status).toBe("open");
  });

  it("vult verwerkt_op met de huidige tijd als wanneer niet is meegegeven", () => {
    const data = { batches: [record()] };
    const voor = Date.now();
    const uit = markeerVerwerkt(data, "msgbatch_1");
    const na = Date.now();
    const tijdstip = new Date(uit.batches[0].verwerkt_op as string).getTime();
    expect(tijdstip).toBeGreaterThanOrEqual(voor);
    expect(tijdstip).toBeLessThanOrEqual(na);
  });

  // Zonder deze controle laat een typo of een verouderd id een batch stilzwijgend
  // "open" staan: geen foutmelding, maar bij de volgende run wordt hij simpelweg
  // nooit als verwerkt gezien en (afhankelijk van de aanroeper) mogelijk opnieuw
  // verstuurd.
  it("gooit een fout bij een onbekend id in plaats van geruisloos niets te doen", () => {
    const data = { batches: [record()] };
    expect(() => markeerVerwerkt(data, "bestaat-niet")).toThrow();
  });
});
