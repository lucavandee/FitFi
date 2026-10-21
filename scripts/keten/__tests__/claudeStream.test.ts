/**
 * De faalpaden van de nacht met een nep-claude vooraan in PATH: de echte
 * aanroep (execFile, time-out, exitcode, stream lezen) en de echte nachtlus.
 * Geen quotum, geen sleutel.
 */
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { draaiNacht } from "../../../src/keten/stijl/stijlNacht";
import { keurderSleutel, type AanroepRegel, type Kandidaat, type OordeelRegel } from "../../../src/keten/stijl/stijlSets";
import { bouwKeurArgs, omgevingVoor, roepClaudeAan } from "../claudeStream";

const MODEL = "claude-sonnet-nep";

/**
 * De nep-claude. FAKE_REEKS is een lijst modi, een per aanroep; de teller staat
 * in FAKE_TELLER. Modi: goed, limiet, geen-json, vier, onbekend, traag.
 */
const NEP = `#!/usr/bin/env node
const fs = require("fs");
const reeks = (process.env.FAKE_REEKS || "goed").split(",");
let n = 0;
try { n = Number(fs.readFileSync(process.env.FAKE_TELLER, "utf8")) || 0; } catch {}
fs.writeFileSync(process.env.FAKE_TELLER, String(n + 1));
const modus = reeks[Math.min(n, reeks.length - 1)];
const opdracht = process.argv[process.argv.length - 1];
let ids = [...opdracht.matchAll(/^### (k\\d+)$/gm)].map((m) => m[1]);
const bron = process.env.ANTHROPIC_API_KEY ? "ANTHROPIC_API_KEY" : "none";
const regel = (x) => process.stdout.write(JSON.stringify(x) + "\\n");
if (modus === "limiet") { process.stdout.write("You've hit your limit · resets 4am (Europe/Amsterdam)\\n"); process.exit(1); }
if (modus === "geen-json") { process.stdout.write("Hallo, ik ben claude.\\n"); process.exit(0); }
if (modus === "traag") { setTimeout(() => process.exit(0), 20000); return; }
if (modus === "vier") ids = ids.slice(0, 4);
if (modus === "onbekend") ids = ids.map((i) => i.replace("k", "x"));
const oordelen = ids.map((id) => ({ id, oordeel: "goed", stijl: "ja", gelegenheid: "ja", kleur: "ja", samenhang: "ja", redenen: [], verbetering: "" }));
regel({ type: "system", subtype: "init", model: process.env.FAKE_MODEL || "${MODEL}", apiKeySource: bron });
regel({ type: "rate_limit_event", rate_limit_info: { status: "allowed", rateLimitType: "five_hour" } });
regel({ type: "result", subtype: "success", is_error: false, result: JSON.stringify({ oordelen }), duration_ms: 1234, num_turns: 1, total_cost_usd: 0.01 });
`;

let map = "";
let teller = "";

beforeAll(() => {
  map = mkdtempSync(join(tmpdir(), "nep-claude-"));
  writeFileSync(join(map, "claude"), NEP);
  chmodSync(join(map, "claude"), 0o755);
  teller = join(map, "teller");
});

afterAll(() => rmSync(map, { recursive: true, force: true }));

function env(reeks: string, extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  writeFileSync(teller, "0");
  return { ...omgevingVoor("abonnement", null), PATH: `${map}:${process.env.PATH}`, FAKE_REEKS: reeks, FAKE_TELLER: teller, ...extra };
}

const args = (opdracht: string) => bouwKeurArgs({ model: MODEL, effort: "xhigh", systeem: "S", opdracht });
const opdracht = "Keur deze 2 outfits.\n\n### k1\nProfiel: x\n\n### k2\nProfiel: y\n";

describe("roepClaudeAan met een nep-claude", () => {
  it("leest model, betaalroute, limieten en oordelen", async () => {
    const u = await roepClaudeAan(args(opdracht), { timeoutMs: 10000, env: env("goed") });
    expect(u).toMatchObject({ ok: true, model: MODEL, apiKeySource: "none", duration_ms: 1234, total_cost_usd: 0.01, timeout: false });
    expect(u.rateLimits).toHaveLength(1);
    expect(JSON.parse(u.tekst).oordelen.map((o: { id: string }) => o.id)).toEqual(["k1", "k2"]);
  });

  it("geeft de sleutel alleen door via sleutel", async () => {
    const metSleutel = { ...env("goed"), ...omgevingVoor("sleutel", "sk-test"), PATH: `${map}:${process.env.PATH}` };
    expect((await roepClaudeAan(args(opdracht), { timeoutMs: 10000, env: metSleutel })).apiKeySource).toBe("ANTHROPIC_API_KEY");
    expect(omgevingVoor("abonnement", null, { ANTHROPIC_API_KEY: "vergeten", HOME: "/x" })).toEqual({ HOME: "/x" });
  });

  it("geeft een limietmelding met exitcode 1 door als tekst", async () => {
    const u = await roepClaudeAan(args(opdracht), { timeoutMs: 10000, env: env("limiet") });
    expect(u.ok).toBe(false);
    expect(u.tekst).toContain("hit your limit");
  });

  it("noemt uitvoer zonder JSON mislukt", async () => {
    const u = await roepClaudeAan(args(opdracht), { timeoutMs: 10000, env: env("geen-json") });
    expect(u).toMatchObject({ ok: false, timeout: false });
    expect(u.tekst).toContain("Hallo");
  });

  it("breekt een trage aanroep af op de time-out", async () => {
    const u = await roepClaudeAan(args(opdracht), { timeoutMs: 500, env: env("traag") });
    expect(u).toMatchObject({ ok: false, timeout: true, tekst: "time-out na 1 s" });
  });

  it("breekt af op een signaal", async () => {
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 200);
    const u = await roepClaudeAan(args(opdracht), { timeoutMs: 10000, signal: ac.signal, env: env("traag") });
    expect(u).toMatchObject({ ok: false, timeout: false, tekst: "onderbroken" });
  });
});

describe("de nacht met een nep-claude", () => {
  const A = "female|casual|casual";
  const kandidaten = Array.from({ length: 9 }, (_, i): Kandidaat => ({
    cel: A,
    combinatie: { geslacht: "female", stijl: "casual", gelegenheid: "casual" },
    outfit_key: `o${i}`,
    stukken: [{ product_id: `p${i}`, rol: "top", naam: "trui", merk: null, prijs: 30, kleuren: ["crème"], lichtheid: null, beeld: null }],
    p_zaad: 1,
    engine_zaad: 1,
    ronde: 1,
    poging: 1,
  }));

  async function nacht(reeks: string, timeoutMs = 10000) {
    const e = env(reeks);
    const oordelen: OordeelRegel[] = [];
    const aanroepen: AanroepRegel[] = [];
    const uit = await draaiNacht(
      { run: "t", keurVersie: "keur-x", model: MODEL, effort: "xhigh", via: "abonnement", maxAanroepen: 10, deadline: null, cellen: [A], nieuw: new Map([[A, kandidaten]]), bestaand: [] },
      {
        roepAan: (o, signal) => roepClaudeAan(args(o), { timeoutMs, signal, env: e }),
        schrijfOordeel: (r) => oordelen.push(r),
        schrijfAanroep: (r) => aanroepen.push(r),
        nu: () => Date.now(),
      }
    );
    return { uit, oordelen, aanroepen, aantal: Number(readFileSync(teller, "utf8")) };
  }

  it("stopt na de eerste aanroep op een limiet", async () => {
    const r = await nacht("limiet,goed");
    expect(r.uit.stopreden).toBe("limiet");
    expect(r.aantal).toBe(1);
    expect(r.aanroepen[0].reset).toBe("4am (Europe/Amsterdam)");
  });

  it("stopt na geen JSON, 4 van 9 en onbekende id's op rij", async () => {
    const r = await nacht("geen-json,vier,onbekend,goed");
    expect(r.uit.stopreden).toBe("drie-mislukt");
    expect(r.aantal).toBe(3);
  });

  it("gaat na een time-out door en keurt dan alles twee keer", async () => {
    const r = await nacht("traag,goed", 500);
    expect(r.aanroepen[0]).toMatchObject({ timeout: true, gelukt: false });
    expect(r.uit.stopreden).toBe("klaar");
    const keurder = keurderSleutel("keur-x", MODEL, "xhigh");
    expect(r.oordelen.filter((o) => o.keurder === keurder && o.aanroep_gelukt && o.telling === "goed" && o.ronde === 2)).toHaveLength(9);
  });

  it("stopt als een ander model antwoordt", async () => {
    const e = env("goed", { FAKE_MODEL: "claude-opus-anders" });
    const aanroepen: AanroepRegel[] = [];
    const uit = await draaiNacht(
      { run: "t", keurVersie: "keur-x", model: MODEL, effort: "xhigh", via: "abonnement", maxAanroepen: 10, deadline: null, cellen: [A], nieuw: new Map([[A, kandidaten]]), bestaand: [] },
      { roepAan: (o) => roepClaudeAan(args(o), { timeoutMs: 10000, env: e }), schrijfOordeel: () => {}, schrijfAanroep: (r) => aanroepen.push(r), nu: () => Date.now() }
    );
    expect(uit.stopreden).toBe("ander-model");
    expect(aanroepen[0].model).toBe("claude-opus-anders");
  });
});
