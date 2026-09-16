/**
 * Live test tegen de RPC get_kandidaten. Draait alleen als
 * VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in de omgeving staan; anders
 * wordt hij overgeslagen zodat de gewone testrun offline groen blijft.
 */
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { naarKandidatenParams, type KandidaatRij } from "../kandidaten";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

describe.skipIf(!url || !key)("get_kandidaten (live)", () => {
  it("geeft per categorie hooguit p_per_category rijen binnen budget en gender", async () => {
    const client = createClient(url!, key!);
    const params = naarKandidatenParams({
      gender: "male",
      occasions: ["work"],
      budget: { min: 50, max: 150 },
    });
    const { data, error } = await client.rpc("get_kandidaten", params);
    expect(error).toBeNull();
    const rijen = (data ?? []) as KandidaatRij[];
    expect(rijen.length).toBeGreaterThan(0);

    const perCategorie = new Map<string, number>();
    for (const rij of rijen) {
      perCategorie.set(rij.category, (perCategorie.get(rij.category) ?? 0) + 1);
      expect(rij.score).toBe(0);
      expect(Number(rij.product.price)).toBeGreaterThanOrEqual(50);
      expect(Number(rij.product.price)).toBeLessThanOrEqual(150);
      expect(["male", "unisex"]).toContain(rij.product.gender);
      expect(rij.product.in_stock).toBe(true);
      expect(rij.attrs.classifier_version).toBeTruthy();
    }
    for (const aantal of perCategorie.values()) {
      expect(aantal).toBeLessThanOrEqual(params.p_per_category);
    }
  });

  it("geeft twee keer dezelfde rijen in dezelfde volgorde", async () => {
    const client = createClient(url!, key!);
    const params = naarKandidatenParams({ gender: "female", occasions: ["date"], budget: { min: 25, max: 100 } });
    const a = (await client.rpc("get_kandidaten", params)).data as KandidaatRij[];
    const b = (await client.rpc("get_kandidaten", params)).data as KandidaatRij[];
    expect(a.map((r) => r.product_id)).toEqual(b.map((r) => r.product_id));
  });
});
