/**
 * De pool voor vooraf keuren. De poolstap (scripts/keten/stijl-sets.ts
 * --alleen-pool) haalt vroeg op de avond als anon de kandidaten op en schrijft
 * ze naar een bestand; de nacht maakt daar zonder database outfits uit. Zo komt
 * er 's nachts geen verkeer op de database, die op 15 oktober acht uur plat lag.
 *
 * Per combinatie:
 *  - een get_kandidaten zoals de site hem vraagt (naarKandidatenParams op
 *    antwoordenVoor: budget tot 250 euro per stuk, en bij streetwear de
 *    sneakeras);
 *  - per (geslacht, stijl) drie get_stijl_kandidaten met elk een eigen zaad.
 *    Niet het zaad uit naarStijlParams: dat geeft bij vaste antwoorden steeds
 *    dezelfde 600 gelabelde producten.
 * Daarna de engine met drie zaden per stijlpool, dus negen runs per combinatie.
 */
import type { Season } from "@/engine/types";
import { runEngineV2 } from "@/engine/v2";
import {
  bereidKandidatenVoor,
  naarKandidatenParams,
  naarStijlParams,
  voegKandidatenSamen,
  type KandidaatRij,
  type KandidatenParams,
  type StijlKandidatenParams,
} from "@/services/outfits/kandidaten";
import { stableStringify } from "@/utils/stableJson";
import { antwoordenVoor, combinatieSleutel, kiesKandidaten, type Combinatie } from "./kandidaatOutfits";
import { naarLogStukken, sleutelVoorStukken, type Kandidaat, type LogStuk } from "./stijlSets";

export interface PoolBestand {
  datum: string;
  gemaakt: string;
  cellen: Combinatie[];
  /** Rijen van get_kandidaten per parameterset (algemeenSleutel). */
  algemeen: Record<string, KandidaatRij[]>;
  /** Rijen van get_stijl_kandidaten per geslacht|stijl, een lijst per zaad. */
  stijl: Record<string, Array<{ p_zaad: number; rijen: KandidaatRij[] }>>;
  /** Aanroepen die ook na een herkansing mislukten. */
  mislukt: string[];
}

export const ZADEN_PER_STIJL = 3;
export const ENGINE_ZADEN = 3;
export const OUTFITS_PER_RUN = 12;

/** FNV-1a over de tekst, binnen de int van p_zaad en nooit 0. */
export function zaadVoor(tekst: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h % 2147483646) + 1;
}

export function algemeenParams(c: Combinatie): KandidatenParams {
  return naarKandidatenParams(antwoordenVoor(c));
}

export function algemeenSleutel(c: Combinatie): string {
  return stableStringify(algemeenParams(c));
}

export function stijlSleutel(c: Combinatie): string {
  return `${c.geslacht}|${c.stijl}`;
}

export function stijlParams(c: Combinatie, zaad: number): StijlKandidatenParams {
  const p = naarStijlParams(antwoordenVoor(c));
  if (!p) throw new Error(`Geen stijl in ${combinatieSleutel(c)}`);
  return { ...p, p_zaad: zaad };
}

export function stijlZaden(c: Combinatie, datum: string): number[] {
  return Array.from({ length: ZADEN_PER_STIJL }, (_, i) => zaadVoor(`${stijlSleutel(c)}|${datum}|stijl|${i + 1}`));
}

export function engineZaden(c: Combinatie, datum: string): number[] {
  return Array.from({ length: ENGINE_ZADEN }, (_, i) => zaadVoor(`${combinatieSleutel(c)}|${datum}|engine|${i + 1}`));
}

export interface PoolKandidaten {
  kandidaten: Kandidaat[];
  /** Outfits die wegvielen omdat een stuk geen enkele kleur had. */
  zonderKleur: number;
  /** Outfits uit alle engine-runs samen, voor het ontdubbelen. */
  outfits: number;
  /** Waarom er niets is, als er niets is. */
  reden?: string;
}

interface RunOutfit {
  products: Array<{ id: string }>;
  stukken: LogStuk[];
  sleutel: string;
  p_zaad: number;
  engine_zaad: number;
}

/**
 * Nieuwe kandidaten voor een combinatie: de engine op elke stijlpool met elk
 * engine-zaad, zonder outfits die al verstuurd zijn of een stuk zonder kleur
 * hebben, ontdubbeld en met hooguit drie keer hetzelfde product
 * (kiesKandidaten), om en om uit de runs.
 */
export async function kandidatenUitPool(
  pool: PoolBestand,
  c: Combinatie,
  o: { bekend: Set<string>; max: number; season?: Season }
): Promise<PoolKandidaten> {
  const algemeen = pool.algemeen[algemeenSleutel(c)];
  if (!algemeen) return { kandidaten: [], zonderKleur: 0, outfits: 0, reden: "geen algemene pool" };
  const stijlPools = pool.stijl[stijlSleutel(c)] ?? [];
  if (stijlPools.length === 0) return { kandidaten: [], zonderKleur: 0, outfits: 0, reden: "geen stijlpool" };

  const tagKleuren = new Map<string, string[]>();
  for (const r of [...algemeen, ...stijlPools.flatMap((s) => s.rijen)]) {
    const kleuren = r.attrs?.colors;
    if (Array.isArray(kleuren) && kleuren.length > 0 && !tagKleuren.has(r.product_id)) tagKleuren.set(r.product_id, kleuren.map(String));
  }

  const answers = antwoordenVoor(c);
  const runs: RunOutfit[][] = [];
  let zonderKleur = 0;
  let outfits = 0;
  for (const sp of stijlPools) {
    const producten = bereidKandidatenVoor(voegKandidatenSamen(sp.rijen, algemeen));
    for (const engineZaad of engineZaden(c, pool.datum)) {
      const uitslag = runEngineV2(answers, producten, { count: OUTFITS_PER_RUN, seed: engineZaad, season: o.season });
      const run: RunOutfit[] = [];
      for (const outfit of uitslag.outfits) {
        if (outfit.occasion && outfit.occasion !== c.gelegenheid) continue;
        outfits += 1;
        const stukken = naarLogStukken(outfit.products, (id) => tagKleuren.get(id));
        if (!stukken) {
          zonderKleur += 1;
          continue;
        }
        const sleutel = await sleutelVoorStukken(stukken.map((s) => s.product_id));
        if (o.bekend.has(sleutel)) continue;
        run.push({ products: stukken.map((s) => ({ id: s.product_id })), stukken, sleutel, p_zaad: sp.p_zaad, engine_zaad: engineZaad });
      }
      runs.push(run);
    }
  }

  const gekozen = kiesKandidaten(runs, { max: o.max, maxPerProduct: 3 });
  const cel = combinatieSleutel(c);
  return {
    kandidaten: gekozen.map((r) => ({
      cel,
      combinatie: c,
      outfit_key: r.sleutel,
      stukken: r.stukken,
      p_zaad: r.p_zaad,
      engine_zaad: r.engine_zaad,
      ronde: 1,
      poging: 1,
    })),
    zonderKleur,
    outfits,
  };
}
