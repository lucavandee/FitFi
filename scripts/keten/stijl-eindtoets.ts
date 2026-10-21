/**
 * Eindtoets: profielen door de echte keten van de site, en de stijl-agent keurt
 * elke outfit die eruit komt.
 *
 *   npm run keten:stijl-eindtoets              droge run: profielen en outfits, geen keuring
 *   npm run keten:stijl-eindtoets -- --ja      met keuring door de stijl-agent
 *
 * Keten: get_kandidaten en get_stijl_kandidaten (anon, zoals een bezoeker),
 * samengevoegd, bereidKandidatenVoor, runEngineV2 met het zaad uit de
 * antwoorden. Daarna keurt de agent (stijl-keur, zelfde prompt) elke outfit.
 * Het cijfer dat telt: het aandeel outfits met oordeel "goed", per profiel.
 * Rapport in ~/claude-artifacts/fitfi-keten/stijl-eindtoets-<tijd>.md.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { runEngineV2 } from "../../src/engine/v2";
import type { Outfit } from "../../src/engine/types";
import {
  STIJL_AGENT_VERSIE,
  bouwKeurOpdracht,
  bouwStijlAgentPrompt,
  leesKeurAntwoord,
  type KeurOordeel,
  type KeurOutfit,
} from "../../src/keten/stijl/stijlAgent";
import { seedFromAnswers } from "../../src/services/outfits/answersSeed";
import {
  bereidKandidatenVoor,
  naarKandidatenParams,
  naarStijlParams,
  voegKandidatenSamen,
  type KandidaatRij,
} from "../../src/services/outfits/kandidaten";
import { heeftVlag, leesVlag } from "./args";
import { leesDotEnv } from "./env";
import { bouwClaudeArgs, voerClaudeCliUit } from "./tagCli";

const argv = process.argv.slice(2);
const MODEL = leesVlag(argv, "model") || process.env.STIJL_MODEL || "sonnet";
const AANTAL = Number(leesVlag(argv, "aantal") || 6);
const dotenv = leesDotEnv();
const url = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY ?? dotenv.VITE_SUPABASE_ANON_KEY;

interface Profiel {
  naam: string;
  answers: Record<string, any>;
}

/** Profielen over stijlen, geslachten en gelegenheden; het eerste is Lucs quiz van 16 oktober. */
const PROFIELEN: Profiel[] = [
  {
    naam: "vrouw streetwear (Lucs quiz)",
    answers: { gender: "female", stylePreferences: ["streetwear"], occasions: ["casual", "work", "formal", "date"], budget: { min: 0, max: 500 }, fit: "regular", prints: "effen", lightness: "licht", neutrals: "warm", contrast: "laag", materials: ["katoen", "wol", "denim"] },
  },
  { naam: "vrouw minimalistisch", answers: { gender: "female", stylePreferences: ["minimalist"], occasions: ["work", "date"], budget: { min: 25, max: 150 }, fit: "regular", prints: "effen" } },
  { naam: "man streetwear", answers: { gender: "male", stylePreferences: ["streetwear"], occasions: ["casual", "party"], budget: { min: 25, max: 150 }, fit: "relaxed" } },
  { naam: "man klassiek", answers: { gender: "male", stylePreferences: ["classic"], occasions: ["work", "formal"], budget: { min: 50, max: 200 }, fit: "regular", prints: "effen" } },
  { naam: "vrouw romantisch", answers: { gender: "female", stylePreferences: ["romantic"], occasions: ["date", "casual"], budget: { min: 25, max: 120 }, fit: "regular" } },
  { naam: "vrouw casual", answers: { gender: "female", stylePreferences: ["casual"], occasions: ["casual", "work"], budget: { min: 20, max: 100 }, fit: "regular" } },
  { naam: "man smart casual", answers: { gender: "male", stylePreferences: ["smart-casual"], occasions: ["work", "date"], budget: { min: 30, max: 150 }, fit: "regular" } },
  { naam: "vrouw sportief", answers: { gender: "female", stylePreferences: ["athletic"], occasions: ["casual", "sport"], budget: { min: 20, max: 120 }, fit: "regular" } },
];

const client = createClient(url!, key!, { auth: { persistSession: false } });

async function pool(answers: Record<string, any>): Promise<{ producten: ReturnType<typeof bereidKandidatenVoor>; stijl: number }> {
  const [algemeen, stijl] = await Promise.all([
    client.rpc("get_kandidaten", naarKandidatenParams(answers)),
    naarStijlParams(answers) ? client.rpc("get_stijl_kandidaten", naarStijlParams(answers)!) : Promise.resolve({ data: [], error: null }),
  ]);
  if (algemeen.error) throw new Error(`get_kandidaten: ${algemeen.error.message}`);
  const stijlRijen = stijl.error ? [] : ((stijl.data ?? []) as KandidaatRij[]);
  return { producten: bereidKandidatenVoor(voegKandidatenSamen(stijlRijen, (algemeen.data ?? []) as KandidaatRij[])), stijl: stijlRijen.length };
}

function naarKeur(id: string, p: Profiel, o: Outfit): KeurOutfit {
  return {
    id,
    profiel: {
      geslacht: p.answers.gender,
      stijlen: p.answers.stylePreferences ?? [],
      gelegenheid: String(o.occasion ?? ""),
      lichtheid: p.answers.lightness ?? null,
      kleurtemperatuur: p.answers.neutrals ?? null,
    },
    stukken: o.products.map((x) => ({
      categorie: String(x.category ?? ""),
      naam: String(x.name ?? ""),
      merk: (x.brand as string) ?? null,
      prijs: typeof x.price === "number" ? x.price : Number(x.price),
      kleuren: (x.colors as string[]) ?? null,
    })),
  };
}

async function main(): Promise<void> {
  if (!url || !key) throw new Error("VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY ontbreken");
  const alle: Array<{ profiel: Profiel; keur: KeurOutfit; outfit: Outfit }> = [];
  const regels: string[] = [];
  for (const [i, p] of PROFIELEN.entries()) {
    const { producten, stijl } = await pool(p.answers);
    const uitslag = runEngineV2(p.answers, producten, { count: AANTAL, seed: seedFromAnswers(p.answers) });
    regels.push(`### ${p.naam}: ${uitslag.outfits.length} outfits, ${stijl} stijlkandidaten, ontbrekend: ${uitslag.stats.occasionsMissing.join(", ") || "geen"}`);
    uitslag.outfits.forEach((o, j) => {
      const id = `p${i + 1}-o${j + 1}`;
      alle.push({ profiel: p, keur: naarKeur(id, p, o), outfit: o });
      regels.push(`- ${id} [${o.occasion}] ${o.title}: ${o.products.map((x) => x.name).join(" + ")}`);
    });
  }
  console.log(regels.join("\n"));
  if (!heeftVlag(argv, "ja")) {
    console.log("\nDroge run: geen keuring. Voeg --ja toe.");
    return;
  }

  const oordelen = new Map<string, KeurOordeel>();
  const systeem = bouwStijlAgentPrompt();
  for (let i = 0; i < alle.length; i += 9) {
    const portie = alle.slice(i, i + 9).map((x) => x.keur);
    const r = await voerClaudeCliUit(bouwClaudeArgs({ model: MODEL, systeemPrompt: systeem, opdracht: bouwKeurOpdracht(portie) }), 10 * 60 * 1000);
    if (r.is_error && /hit your limit|usage limit|resets/i.test(String(r.result ?? ""))) {
      console.error("Gestopt op een limietmelding.");
      break;
    }
    for (const k of r.is_error ? [] : leesKeurAntwoord(String(r.result ?? ""))) oordelen.set(k.id, k);
    console.log(`  gekeurd ${Math.min(i + 9, alle.length)}/${alle.length}`);
  }

  const r: string[] = [`# Eindtoets stijl-agent, ${new Date().toISOString().slice(0, 16).replace("T", " ")}`, "", `${STIJL_AGENT_VERSIE}, model ${MODEL}.`, ""];
  let totaalGoed = 0;
  for (const p of PROFIELEN) {
    const eigen = alle.filter((x) => x.profiel === p);
    const goed = eigen.filter((x) => oordelen.get(x.keur.id)?.oordeel === "goed").length;
    totaalGoed += goed;
    r.push(`- ${p.naam}: ${goed} van ${eigen.length} goed`);
  }
  r.push("", `Totaal: ${totaalGoed} van ${alle.length} goed.`, "", "## Outfits en oordelen", ...regels, "");
  for (const x of alle) {
    const k = oordelen.get(x.keur.id);
    r.push(`- ${x.keur.id}: ${k ? `**${k.oordeel}**. ${k.redenen.join(" ")}` : "geen oordeel"}`);
  }
  const map = join(homedir(), "claude-artifacts", "fitfi-keten");
  mkdirSync(map, { recursive: true });
  const pad = join(map, `stijl-eindtoets-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.md`);
  writeFileSync(pad, r.join("\n") + "\n", "utf8");
  console.log("\n" + r.slice(0, PROFIELEN.length + 6).join("\n"));
  console.log(`\nRapport: ${pad}`);
}

main().catch((e) => {
  console.error("Gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
