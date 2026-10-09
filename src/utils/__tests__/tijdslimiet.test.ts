/**
 * Een database die niet antwoordt moet de bezoeker niet anderhalve minuut naar een laadscherm
 * laten kijken. Op 9 oktober 2026 antwoordde de FitFi-database ruim een uur niet; de shop toonde
 * pas na ongeveer 75 seconden "Items konden niet worden geladen", de tijd die de gateway nodig
 * heeft om op te geven. metTijdslimiet kapt dat af.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { metTijdslimiet } from "../tijdslimiet";

describe("metTijdslimiet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("geeft het antwoord door als het op tijd komt", async () => {
    const uit = metTijdslimiet(Promise.resolve({ data: 1 }), 15_000, () => new Error("te laat"));
    await expect(uit).resolves.toEqual({ data: 1 });
  });

  it("geeft de eigen fout van de belofte door, ook na afloop van een lopende timer", async () => {
    const uit = metTijdslimiet(Promise.reject(new Error("echte fout")), 15_000, () => new Error("te laat"));
    await expect(uit).rejects.toThrow("echte fout");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("weigert met de opgegeven fout als het antwoord te laat komt", async () => {
    const uit = metTijdslimiet(new Promise(() => {}), 15_000, () => new Error("geen antwoord"));
    const verwacht = expect(uit).rejects.toThrow("geen antwoord");
    await vi.advanceTimersByTimeAsync(14_999);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(2);
    await verwacht;
  });

  it("ruimt de timer op zodra het antwoord er is", async () => {
    await metTijdslimiet(Promise.resolve(1), 15_000, () => new Error("te laat"));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("een antwoord dat na de limiet alsnog komt, doet niets meer", async () => {
    let los!: (w: number) => void;
    const traag = new Promise<number>((resolve) => (los = resolve));
    const uit = metTijdslimiet(traag, 1_000, () => new Error("geen antwoord"));
    const verwacht = expect(uit).rejects.toThrow("geen antwoord");
    await vi.advanceTimersByTimeAsync(1_001);
    await verwacht;
    expect(() => los(5)).not.toThrow();
  });
});
