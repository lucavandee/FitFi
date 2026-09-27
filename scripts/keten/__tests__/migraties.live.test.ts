/**
 * Gedragstest van de plan 2-migraties tegen de gekoppelde database. Draait
 * alleen als SUPABASE_URL (of VITE_SUPABASE_URL) en SUPABASE_SERVICE_ROLE_KEY
 * in de omgeving staan; anders overgeslagen, zodat `npx vitest run` offline
 * groen blijft. De RLS-checks gebruiken daarnaast VITE_SUPABASE_ANON_KEY.
 *
 * Draaien:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... VITE_SUPABASE_ANON_KEY=... \
 *     npx vitest run scripts/keten/__tests__/migraties.live.test.ts
 * Waarden komen uit je shell, nooit uit de repo, en worden niet gelogd.
 */
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { STANDAARD_RETAILER } from "../retailers";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const service = () => createClient(url!, serviceKey!, { auth: { persistSession: false } });
const anon = () => createClient(url!, anonKey!, { auth: { persistSession: false } });

describe.skipIf(!url || !serviceKey)("20260916100000_keten_tag_kolommen (live)", () => {
  it("keten_tag_kandidaten geeft alleen producten van de gevraagde retailer, met de velden voor de tagger", async () => {
    const { data, error } = await service().rpc("keten_tag_kandidaten", {
      p_retailer: STANDAARD_RETAILER, p_modus: "tekst", p_versie: "haiku-4.5-v1", p_limit: 3, p_after: null,
    });
    expect(error).toBeNull();
    const rijen = (data ?? []) as Array<Record<string, unknown>>;
    // Na de volledige tag-run (taak 5) is dit terecht leeg; de vorm wordt dan niet meer gecontroleerd.
    for (const r of rijen) {
      expect(r.retailer).toBe(STANDAARD_RETAILER);
      expect(typeof r.name).toBe("string");
      expect(r).toHaveProperty("raw_category");
      expect(r).toHaveProperty("image_url");
      expect(r).toHaveProperty("confidence");
    }
  });

  it("keten_tag_kandidaten geeft een fout bij een onbekende retailer in plaats van nul rijen", async () => {
    const { error } = await service().rpc("keten_tag_kandidaten", {
      p_retailer: "bestaat niet", p_modus: "tekst", p_versie: "haiku-4.5-v1", p_limit: 1, p_after: null,
    });
    expect(error?.message ?? "").toContain("Onbekende retailer");
  });

  it("keten_schrijf_tags met een lege lijst schrijft nul rijen", async () => {
    const { data, error } = await service().rpc("keten_schrijf_tags", { p_rijen: [] });
    expect(error).toBeNull();
    expect(Number(data)).toBe(0);
  });

  it.skipIf(!anonKey)("de tag-RPC's zijn niet aanroepbaar met de anon-sleutel", async () => {
    const { error } = await anon().rpc("keten_tag_kandidaten", {
      p_retailer: null, p_modus: "tekst", p_versie: "haiku-4.5-v1", p_limit: 1, p_after: null,
    });
    expect(error?.message ?? "").toContain("permission denied");
  });
});

describe.skipIf(!url || !serviceKey)("20260916100200_keten_get_kandidaten_score (live)", () => {
  const params = {
    p_gender: "male",
    p_occasions: ["work", "casual"],
    p_budget_min: 20,
    p_budget_max: 150,
    p_axes: { formality: { value: 3, confidence: 1 }, color_temp: { value: "koel", confidence: 0.5 } },
    p_liked_ids: [] as string[],
    p_disliked_ids: [] as string[],
    p_per_category: 12,
    p_retailer: STANDAARD_RETAILER,
  };

  it("geeft per categorie hooguit p_per_category rijen van de retailer, score tussen 0 en 1, deterministisch", async () => {
    const een = await service().rpc("get_kandidaten", params);
    const twee = await service().rpc("get_kandidaten", params);
    expect(een.error).toBeNull();
    const rijen = (een.data ?? []) as Array<{ product_id: string; category: string; score: number; product: { retailer: string; price: number } }>;
    expect(rijen.length).toBeGreaterThan(0);
    expect(rijen.map((r) => r.product_id)).toEqual(((twee.data ?? []) as Array<{ product_id: string }>).map((r) => r.product_id));
    const perCategorie = new Map<string, number>();
    for (const r of rijen) {
      perCategorie.set(r.category, (perCategorie.get(r.category) ?? 0) + 1);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
      expect(r.product.retailer).toBe(STANDAARD_RETAILER);
      expect(Number(r.product.price)).toBeGreaterThanOrEqual(20);
      expect(Number(r.product.price)).toBeLessThanOrEqual(150);
    }
    for (const n of perCategorie.values()) expect(n).toBeLessThanOrEqual(12);
  });

  it("weigert een onbekende retailer", async () => {
    const { error } = await service().rpc("get_kandidaten", { ...params, p_retailer: "bestaat niet" });
    expect(error?.message ?? "").toContain("Onbekende retailer");
  });

  it.skipIf(!anonKey)("is aanroepbaar met de anon-sleutel (security invoker, select-policies)", async () => {
    const { error } = await anon().rpc("get_kandidaten", { ...params, p_per_category: 1 });
    expect(error).toBeNull();
  });
});

describe.skipIf(!url || !serviceKey)("20260916100100_keten_embedding_rpcs (live)", () => {
  it("keten_embed_kandidaten geeft alleen rijen met een http-afbeelding en weigert een onbekende retailer", async () => {
    const goed = await service().rpc("keten_embed_kandidaten", { p_retailer: STANDAARD_RETAILER, p_limit: 5, p_after: null });
    expect(goed.error).toBeNull();
    for (const r of (goed.data ?? []) as Array<{ image_url: string }>) {
      expect(r.image_url.startsWith("http")).toBe(true);
    }
    const fout = await service().rpc("keten_embed_kandidaten", { p_retailer: "bestaat niet", p_limit: 1, p_after: null });
    expect(fout.error?.message ?? "").toContain("Onbekende retailer");
  });

  it("keten_schrijf_embeddings met een lege lijst schrijft nul rijen", async () => {
    const { data, error } = await service().rpc("keten_schrijf_embeddings", { p_rijen: [] });
    expect(error).toBeNull();
    expect(Number(data)).toBe(0);
  });
});

describe.skipIf(!url || !serviceKey)("20260916100300_keten_dedupe_embedding (live)", () => {
  it("weigert een onbekende retailer en is niet aanroepbaar met de anon-sleutel", async () => {
    const fout = await service().rpc("keten_dedupe_embedding", { p_retailer: "bestaat niet", p_drempel: 0.999 });
    expect(fout.error?.message ?? "").toContain("Onbekende retailer");
    if (anonKey) {
      const anonFout = await anon().rpc("keten_dedupe_embedding", { p_retailer: null, p_drempel: 0.999 });
      expect(anonFout.error?.message ?? "").toContain("permission denied");
    }
  });
});

describe.skipIf(!url || !serviceKey)("20260916100400_keten_feed_gates (live)", () => {
  it("keten_dekkingsmatrix geeft male en female, zeven gelegenheden, vier banden met getallen", async () => {
    const { data, error } = await service().rpc("keten_dekkingsmatrix", { p_retailer: STANDAARD_RETAILER });
    expect(error).toBeNull();
    const m = data as Record<string, Record<string, Record<string, number>>>;
    expect(Object.keys(m).sort()).toEqual(["female", "male"]);
    for (const g of ["male", "female"]) {
      expect(Object.keys(m[g]).sort()).toEqual(["casual", "date", "formal", "party", "sport", "travel", "work"]);
      for (const o of Object.keys(m[g])) {
        expect(Object.keys(m[g][o]).sort()).toEqual(["100tot200", "50tot100", "boven200", "tot50"]);
        for (const n of Object.values(m[g][o])) expect(typeof n).toBe("number");
      }
    }
  });

  it("weigert een onbekende retailer", async () => {
    const { error } = await service().rpc("keten_dekkingsmatrix", { p_retailer: "bestaat niet" });
    expect(error?.message ?? "").toContain("Onbekende retailer");
  });

  it("feed_gates: de service role leest, de anon-sleutel leest leeg en mag niet schrijven", async () => {
    const svc = await service().from("feed_gates").select("id").limit(1);
    expect(svc.error).toBeNull();
    if (anonKey) {
      const lezen = await anon().from("feed_gates").select("id").limit(1);
      expect(lezen.error).toBeNull();
      expect(lezen.data).toEqual([]);
      const schrijven = await anon().from("feed_gates").insert({ retailer: "test", groen: false, matrix: {} });
      expect(schrijven.error).not.toBeNull();
    }
  });
});
