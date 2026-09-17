import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
let clientBeschikbaar = true;

vi.mock("@/lib/supabaseClient", () => ({
  supabase: () => (clientBeschikbaar ? { from: () => ({ insert }) } : null),
}));

import { hashProfile, outfitKey, saveOutfitRating } from "../outfitRatings";

beforeEach(() => {
  insert.mockReset();
  clientBeschikbaar = true;
});

describe("hashProfile", () => {
  it("is sha256-hex en onafhankelijk van sleutelvolgorde", async () => {
    const a = await hashProfile({ gender: "male", occasions: ["work"] });
    const b = await hashProfile({ occasions: ["work"], gender: "male" });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is onafhankelijk van de volgorde van occasions (spec 5.2.1: gesorteerd)", async () => {
    const a = await hashProfile({ gender: "male", occasions: ["work", "casual"] });
    const b = await hashProfile({ gender: "male", occasions: ["casual", "work"] });
    expect(a).toBe(b);
  });

  it("verandert niet als er een foto wordt toegevoegd of verwijderd (fixronde 1, punt 1)", async () => {
    const zonderFoto = { gender: "male", occasions: ["work"], budget: { min: 50, max: 150 } };
    const metFoto = { ...zonderFoto, photoDataUrl: "data:image/png;base64," + "A".repeat(1000) };
    expect(await hashProfile(metFoto)).toBe(await hashProfile(zonderFoto));
  });

  it("verandert wel als gender, occasions of budget verandert", async () => {
    const basis = { gender: "male", occasions: ["work"], budget: { min: 50, max: 150 } };
    const a = await hashProfile(basis);
    expect(await hashProfile({ ...basis, gender: "female" })).not.toBe(a);
    expect(await hashProfile({ ...basis, occasions: ["casual"] })).not.toBe(a);
    expect(await hashProfile({ ...basis, budget: { min: 50, max: 200 } })).not.toBe(a);
  });
});

describe("outfitKey", () => {
  it("is onafhankelijk van volgorde en dubbele ids", async () => {
    const a = await outfitKey(["p2", "p1", "p3"]);
    const b = await outfitKey(["p1", "p3", "p2", "p2"]);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verschilt als een item verschilt", async () => {
    expect(await outfitKey(["p1", "p2"])).not.toBe(await outfitKey(["p1", "p3"]));
  });

  it("gooit op een lege lijst in plaats van een sha256 van de lege string te geven (fixronde 1, punt 6)", async () => {
    await expect(outfitKey([])).rejects.toThrow();
  });
});

describe("saveOutfitRating", () => {
  const invoer = {
    profileHash: "a".repeat(64),
    outfitKey: "b".repeat(64),
    rating: "zou_dragen" as const,
    sessionId: "11111111-2222-4333-8444-555555555555",
    userId: null,
  };

  it("schrijft een rij naar outfit_ratings", async () => {
    insert.mockResolvedValue({ error: null });
    const uitkomst = await saveOutfitRating(invoer);
    expect(uitkomst).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      profile_hash: invoer.profileHash,
      outfit_key: invoer.outfitKey,
      rating: "zou_dragen",
      session_id: invoer.sessionId,
      user_id: null,
    });
  });

  it("geeft de fout terug in plaats van te gooien", async () => {
    insert.mockResolvedValue({ error: { message: "rls" } });
    expect(await saveOutfitRating(invoer)).toEqual({ ok: false, reden: "rls" });
  });

  it("meldt een ontbrekende client", async () => {
    clientBeschikbaar = false;
    expect(await saveOutfitRating(invoer)).toEqual({ ok: false, reden: "geen Supabase-client" });
  });

  it("legt een RLS-weigering (42501) uit als ontbrekende session_id, zonder de originele melding weg te gooien", async () => {
    const ruweMelding = 'new row violates row-level security policy for table "outfit_ratings"';
    insert.mockResolvedValue({ error: { code: "42501", message: ruweMelding } });

    const uitkomst = await saveOutfitRating(invoer);

    expect(uitkomst.ok).toBe(false);
    if (uitkomst.ok) throw new Error("onbereikbaar: ok moet false zijn");
    expect(uitkomst.reden).toContain("session_id");
    expect(uitkomst.reden).toContain("42501");
    expect(uitkomst.reden).toContain(ruweMelding);
  });

  it("logt een mislukte schrijfactie met console.error, zonder de session_id in de log", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    insert.mockResolvedValue({
      error: { code: "42501", message: "new row violates row-level security policy" },
    });

    await saveOutfitRating(invoer);

    expect(spy).toHaveBeenCalledTimes(1);
    const geloggd = JSON.stringify(spy.mock.calls[0]);
    expect(geloggd).toContain("42501");
    expect(geloggd).not.toContain(invoer.sessionId);
    expect(geloggd).not.toContain(invoer.profileHash);
    expect(geloggd).not.toContain(invoer.outfitKey);

    spy.mockRestore();
  });

  it("logt ook een netwerkfout met console.error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    insert.mockRejectedValue(new Error("Failed to fetch"));

    const uitkomst = await saveOutfitRating(invoer);

    expect(uitkomst).toEqual({ ok: false, reden: "Failed to fetch" });
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });
});
