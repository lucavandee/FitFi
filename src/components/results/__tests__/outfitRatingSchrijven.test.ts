import { describe, expect, it, vi } from "vitest";
import { voerRatingUit, type RatingAfhankelijkheden, type RatingStand } from "../outfitRatingSchrijven";

const CTX = { outfitId: "outfit-1", productIds: ["p1", "p2"], userId: null };

function nepDeps(overrides: Partial<RatingAfhankelijkheden> = {}): RatingAfhankelijkheden {
  return {
    outfitKey: vi.fn().mockResolvedValue("sleutel-hash"),
    saveOutfitRating: vi.fn().mockResolvedValue({ ok: true }),
    bewaarKeuze: vi.fn(),
    track: vi.fn(),
    getSessionId: vi.fn().mockReturnValue("11111111-2222-4333-8444-555555555555"),
    ...overrides,
  };
}

const STAND: RatingStand = { profileHash: "hash-1", sleutel: "hash-1:outfit-1", gekozen: null, bezig: false };

describe("voerRatingUit", () => {
  it("de geslaagde weg: schrijft, onthoudt de keuze en logt outfit_rating", async () => {
    const deps = nepDeps();

    const uitkomst = await voerRatingUit(STAND, "zou_dragen", CTX, deps);

    expect(uitkomst).toEqual({ status: "geschreven" });
    expect(deps.outfitKey).toHaveBeenCalledWith(CTX.productIds);
    expect(deps.saveOutfitRating).toHaveBeenCalledWith({
      profileHash: "hash-1",
      outfitKey: "sleutel-hash",
      rating: "zou_dragen",
      sessionId: "11111111-2222-4333-8444-555555555555",
      userId: null,
    });
    expect(deps.bewaarKeuze).toHaveBeenCalledWith("hash-1:outfit-1", "zou_dragen");
    expect(deps.track).toHaveBeenCalledWith("outfit_rating", {
      outfit_id: "outfit-1",
      rating: "zou_dragen",
      item_count: 2,
    });
    expect(deps.track).toHaveBeenCalledTimes(1);
  });

  it("een mislukte schrijfactie: geen bewaarKeuze, wel outfit_rating_failed, status mislukt (component draait dan terug)", async () => {
    const deps = nepDeps({
      saveOutfitRating: vi.fn().mockResolvedValue({ ok: false, reden: "rls geweigerd" }),
    });

    const uitkomst = await voerRatingUit(STAND, "nooit", CTX, deps);

    expect(uitkomst).toEqual({ status: "mislukt", reden: "rls geweigerd" });
    expect(deps.bewaarKeuze).not.toHaveBeenCalled();
    expect(deps.track).toHaveBeenCalledWith("outfit_rating_failed", {
      outfit_id: "outfit-1",
      rating: "nooit",
      reden: "rls geweigerd",
    });
  });

  it("een tweede klik op dezelfde knop (al gekozen) schrijft niet opnieuw", async () => {
    const deps = nepDeps();
    const staandAlGekozen: RatingStand = { ...STAND, gekozen: "zou_dragen" };

    const uitkomst = await voerRatingUit(staandAlGekozen, "zou_dragen", CTX, deps);

    expect(uitkomst).toEqual({ status: "overgeslagen" });
    expect(deps.outfitKey).not.toHaveBeenCalled();
    expect(deps.saveOutfitRating).not.toHaveBeenCalled();
    expect(deps.bewaarKeuze).not.toHaveBeenCalled();
    expect(deps.track).not.toHaveBeenCalled();
  });

  it("schrijft niet terwijl er al een schrijfactie bezig is", async () => {
    const deps = nepDeps();
    const bezigStand: RatingStand = { ...STAND, bezig: true };

    const uitkomst = await voerRatingUit(bezigStand, "nooit", CTX, deps);

    expect(uitkomst).toEqual({ status: "overgeslagen" });
    expect(deps.saveOutfitRating).not.toHaveBeenCalled();
  });

  it("schrijft niet zonder profileHash of sleutel", async () => {
    const deps = nepDeps();

    expect(await voerRatingUit({ ...STAND, profileHash: null }, "nooit", CTX, deps)).toEqual({
      status: "overgeslagen",
    });
    expect(await voerRatingUit({ ...STAND, sleutel: null }, "nooit", CTX, deps)).toEqual({
      status: "overgeslagen",
    });
    expect(deps.saveOutfitRating).not.toHaveBeenCalled();
  });
});
