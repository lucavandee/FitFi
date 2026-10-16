/**
 * Een ingelogde gebruiker kan zijn eigen is_admin en tier niet zetten.
 *
 * Aanleiding (16 oktober 2026). Een testaccount maakte zichzelf met een
 * gewone update op profiles founder; een adres op @fitfi.ai werd bij
 * aanmelden automatisch beheerder. Dicht in 20261016220000_profielrechten_dicht.sql.
 *
 * Alleen bewust aan te zetten, met een testaccount uit je eigen shell:
 *   LIVE_DB_TEST=1 QA_EMAIL=... QA_WACHTWOORD=... npx vitest run src/__tests__/profielRechten.live.test.ts
 * Waarden komen nooit uit de repo en worden niet gelogd.
 */
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.QA_EMAIL;
const wachtwoord = process.env.QA_WACHTWOORD;
const aan = process.env.LIVE_DB_TEST === "1" && url && key && email && wachtwoord;

describe.skipIf(!aan)("profielrechten (live)", () => {
  it("negeert een eigen poging tot beheerder of founder", { timeout: 20_000 }, async () => {
    const sb = createClient(url!, key!, { auth: { persistSession: false } });
    const { data: s, error } = await sb.auth.signInWithPassword({ email: email!, password: wachtwoord! });
    expect(error).toBeNull();
    const id = s!.user!.id;
    const voor = (await sb.from("profiles").select("tier, is_admin").eq("id", id).single()).data;
    await sb.from("profiles").update({ tier: "founder", is_admin: true }).eq("id", id);
    const na = (await sb.from("profiles").select("tier, is_admin").eq("id", id).single()).data;
    expect(na).toEqual(voor);
    expect(na?.is_admin).toBe(false);
  });
});
