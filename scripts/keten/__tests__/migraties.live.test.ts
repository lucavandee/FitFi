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
