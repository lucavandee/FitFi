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
import { KLEINSTE_RETAILER, STANDAARD_RETAILER } from "../retailers";

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

describe.skipIf(!url || !serviceKey)("20260916100500_keten_cron (live)", () => {
  /**
   * De twee RPC-tests hieronder draaien op KLEINSTE_RETAILER, niet op
   * STANDAARD_RETAILER. keten_vul_nieuwe_producten scant de hele retailer en
   * haalt dat op H&M (NL) niet binnen de 8 seconden statement-timeout van de
   * service-role-route: de aanroep komt terug met foutcode 57014
   * (query_canceled). Gemeten met EXPLAIN (ANALYZE, BUFFERS): 17,5s voor de
   * anti-join die nieuwe rijen zoekt en 14,6s voor de ververs-stap, beide
   * gedomineerd door heap-fetches over 88.043 rijen van products. Vanuit
   * pg_cron (de enige aanroeper in productie) en vanuit de Management API
   * geldt die limiet niet; daar is de volledige run over alle 281.999 rijen
   * in 28,7s klaar. Zie taak-12-report.md voor de meetreeks per retailer.
   */
  const TRAAG = 60_000;

  it("keten_vul_nieuwe_producten weigert een onbekende retailer en is idempotent op een retailer zonder nieuwe producten of wijzigingen", async () => {
    const fout = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: "bestaat niet" });
    expect(fout.error?.message ?? "").toContain("Onbekende retailer");
    const een = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: KLEINSTE_RETAILER });
    expect(een.error).toBeNull();
    const twee = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: KLEINSTE_RETAILER });
    expect(twee.error).toBeNull();
    const rij = ((twee.data ?? []) as Array<{ aantal_nieuw: number; aantal_feedvelden_ververst: number }>)[0];
    expect(Number(rij.aantal_nieuw)).toBe(0);
    expect(Number(rij.aantal_feedvelden_ververst)).toBe(0);
  }, TRAAG);

  it("keten_vul_nieuwe_producten ververst price, in_stock en retailer naar de huidige stand van products", async () => {
    const vul = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: KLEINSTE_RETAILER });
    expect(vul.error).toBeNull();

    const attrs = await service()
      .from("product_attributes")
      .select("product_id, price, in_stock, retailer")
      .eq("retailer", KLEINSTE_RETAILER)
      .limit(50);
    expect(attrs.error).toBeNull();
    const rijen = (attrs.data ?? []) as Array<{
      product_id: string; price: number | null; in_stock: boolean | null; retailer: string | null;
    }>;
    expect(rijen.length).toBeGreaterThan(0);

    const ids = rijen.map((r) => r.product_id);
    const producten = await service().from("products").select("id, price, in_stock, retailer").in("id", ids);
    expect(producten.error).toBeNull();
    const perId = new Map((producten.data ?? []).map((p: any) => [p.id, p]));

    for (const r of rijen) {
      const p = perId.get(r.product_id);
      expect(p).toBeDefined();
      expect(Number(r.price)).toBe(Number(p.price));
      expect(r.in_stock).toBe(p.in_stock);
      expect(r.retailer).toBe(p.retailer);
    }
  }, TRAAG);

  it("keten_cron_log is leesbaar met de service role en leeg voor de anon-sleutel", async () => {
    const svc = await service().from("keten_cron_log").select("job").limit(1);
    expect(svc.error).toBeNull();
    if (anonKey) {
      const lezen = await anon().from("keten_cron_log").select("job").limit(1);
      expect(lezen.error).toBeNull();
      expect(lezen.data).toEqual([]);
    }
  });

  it("keten_roep_edge en keten_vul_na_import zijn niet aanroepbaar met de anon-sleutel", async () => {
    if (!anonKey) return;
    const edge = await anon().rpc("keten_roep_edge", { p_functie: "validate-product-links" });
    expect(edge.error?.message ?? "").toContain("permission denied");
    const vul = await anon().rpc("keten_vul_na_import", {});
    expect(vul.error?.message ?? "").toContain("permission denied");
  });

  /**
   * Gedragsbewijs voor de dedupe-sleutel uit het amendement bij taak 12: geen
   * enkele fotogroep mag over twee canonical_id's verdeeld zijn. Leest alleen,
   * en op de kleinste retailer, zodat de test binnen de statement-timeout van
   * de PostgREST-route blijft. De volledige controle over alle 281.999 rijen
   * staat als controle-query in taak-12-report.md.
   */
  it("elke fotogroep van de kleinste retailer heeft precies een canonical_id", async () => {
    const producten = await service()
      .from("products")
      .select("id, image_url")
      .eq("retailer", KLEINSTE_RETAILER);
    expect(producten.error).toBeNull();
    const rijen = (producten.data ?? []) as Array<{ id: string; image_url: string | null }>;
    expect(rijen.length).toBeGreaterThan(0);

    const attrs = await service()
      .from("product_attributes")
      .select("product_id, canonical_id")
      .in("product_id", rijen.map((r) => r.id));
    expect(attrs.error).toBeNull();
    const canoniekPer = new Map(
      ((attrs.data ?? []) as Array<{ product_id: string; canonical_id: string }>).map((a) => [a.product_id, a.canonical_id])
    );

    const perFoto = new Map<string, Set<string>>();
    for (const r of rijen) {
      const sleutel = r.image_url && r.image_url !== "" ? r.image_url : `id:${r.id}`;
      const canoniek = canoniekPer.get(r.id);
      expect(canoniek, `geen product_attributes-rij voor ${r.id}`).toBeDefined();
      if (!perFoto.has(sleutel)) perFoto.set(sleutel, new Set());
      perFoto.get(sleutel)!.add(canoniek!);
    }
    for (const [sleutel, canonieken] of perFoto) {
      expect(canonieken.size, `fotogroep ${sleutel} is over ${canonieken.size} canonical_id's verdeeld`).toBe(1);
    }
  }, 60_000);
});
