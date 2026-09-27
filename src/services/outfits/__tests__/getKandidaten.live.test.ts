/**
 * Live test tegen de RPC get_kandidaten. Draait alleen expliciet opt-in via
 * LIVE_DB_TEST=1 (fixronde 1, punt 5).
 *
 * Vóór deze fix draaide dit alleen op VITE_SUPABASE_URL/ANON_KEY in de
 * omgeving, en Vitest laadt .env in process.env. Wie lokaal een .env heeft
 * (iedereen die aan dit project werkt) kreeg deze test dus ALTIJD mee in een
 * gewone `npx vitest run`, terwijl CI (geen .env) hem altijd oversloeg:
 * "vitest groen" betekende dan iets anders lokaal dan in CI, voor precies de
 * poort die onder elke taak in dit plan staat. LIVE_DB_TEST staat nergens in
 * .env, dus `npx vitest run` slaat deze test nu overal over, ongeacht welke
 * Supabase-variabelen aanwezig zijn. Bewust opt-in draaien:
 *
 *   LIVE_DB_TEST=1 npx vitest run src/services/outfits/__tests__/getKandidaten.live.test.ts
 */
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { naarKandidatenParams, type KandidaatRij } from "../kandidaten";

const liveOptIn = process.env.LIVE_DB_TEST === "1";
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

// Deze test praat met de echte database over het netwerk. Op een koude
// verbinding (eerste request na inactiviteit, of een trage lambda-cold-start
// aan de kant van Supabase) kan de RPC de standaard vitest-testtimeout
// (5000ms) overschrijden voordat er ook maar een statement-timeout aan de
// databasekant in beeld komt. Dat deed de suite tijdens de vorige taak twee
// keer omvallen, niet omdat het RPC-contract fout was. Vitest ondersteunt
// per-test `timeout` en `retry` als derde argument van `it`: een ruimere
// timeout (20s) geeft een trage eerste roundtrip de ruimte, en een
// herkansing (retry: 2, dus tot 3 pogingen) vangt een eenmalige netwerkhik op
// zonder de test opt-in te maken. Blijft hij na 3 pogingen rood, dan is er
// echt iets mis met het RPC-contract.
const LIVE_TEST_OPTIES = { timeout: 20_000, retry: 2 };

describe.skipIf(!liveOptIn || !url || !key)("get_kandidaten (live)", () => {
  it(
    "geeft per categorie hooguit p_per_category rijen binnen budget en gender",
    async () => {
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
    },
    LIVE_TEST_OPTIES
  );

  it(
    "geeft twee keer dezelfde rijen in dezelfde volgorde",
    async () => {
      const client = createClient(url!, key!);
      const params = naarKandidatenParams({ gender: "female", occasions: ["date"], budget: { min: 25, max: 100 } });
      const a = (await client.rpc("get_kandidaten", params)).data as KandidaatRij[];
      const b = (await client.rpc("get_kandidaten", params)).data as KandidaatRij[];
      expect(a.map((r) => r.product_id)).toEqual(b.map((r) => r.product_id));
    },
    LIVE_TEST_OPTIES
  );
});
