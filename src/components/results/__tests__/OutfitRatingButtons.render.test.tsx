/**
 * Render-test zonder jsdom, zoals CalibrationStep.render.test.tsx: de
 * component wordt server-side gerenderd, effects draaien niet, de
 * useState-initializer wel. Wat we bewaken: de twee vaste teksten,
 * type="button", uitgeschakeld zonder profile-hash, en dat een eerder
 * onthouden keuze uit localStorage als aria-pressed terugkomt.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { OPSLAG_SLEUTEL } from "../outfitRatingGeheugen";

vi.mock("@/services/ratings/outfitRatings", () => ({
  outfitKey: vi.fn(async () => "k".repeat(64)),
  saveOutfitRating: vi.fn(async () => ({ ok: true })),
}));

import { OutfitRatingButtons } from "../OutfitRatingButtons";

const HASH = "a".repeat(64);

function stubLocalStorage(inhoud: Record<string, string>) {
  const data = { ...inhoud };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => (k in data ? data[k] : null),
      setItem: (k: string, v: string) => {
        data[k] = v;
      },
      removeItem: (k: string) => {
        delete data[k];
      },
    },
  });
}

afterEach(() => {
  // @ts-expect-error: de stub weer weghalen zodat andere tests hem niet zien
  delete globalThis.localStorage;
});

describe("OutfitRatingButtons", () => {
  it("toont de twee vaste knopteksten als echte knoppen", () => {
    const html = renderToString(
      <OutfitRatingButtons outfitId="o1" productIds={["p1", "p2"]} profileHash={HASH} />
    );
    expect(html).toContain("Zou ik dragen");
    expect(html).toContain("Nooit");
    expect(html.match(/type="button"/g)?.length).toBe(2);
    expect(html).toContain("rounded-xl");
    expect(html).toContain("min-h-[48px]");
    // Let op: de className bevat "disabled:opacity-50", dus controleer op het attribuut zelf.
    expect(html).not.toContain('disabled=""');
    expect(html.match(/aria-pressed="true"/g)).toBeNull();
  });

  it("is uitgeschakeld zonder profile-hash", () => {
    const html = renderToString(
      <OutfitRatingButtons outfitId="o1" productIds={["p1"]} profileHash={null} />
    );
    expect(html.match(/disabled=""/g)?.length).toBe(2);
  });

  it("toont een eerder onthouden keuze uit localStorage als ingedrukt", () => {
    stubLocalStorage({ [OPSLAG_SLEUTEL]: JSON.stringify({ [`${HASH}:o1`]: "nooit" }) });
    const html = renderToString(
      <OutfitRatingButtons outfitId="o1" productIds={["p1"]} profileHash={HASH} />
    );
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(1);
    // De ingedrukte knop is de tweede (Nooit): het true-attribuut staat na de tekst "Zou ik dragen".
    expect(html.indexOf('aria-pressed="true"')).toBeGreaterThan(html.indexOf("Zou ik dragen"));
    expect(html).toContain("bg-[#F4E8E3]");
  });

  it("toont niets als ingedrukt voor een andere outfit met dezelfde hash", () => {
    stubLocalStorage({ [OPSLAG_SLEUTEL]: JSON.stringify({ [`${HASH}:o1`]: "nooit" }) });
    const html = renderToString(
      <OutfitRatingButtons outfitId="o2" productIds={["p1"]} profileHash={HASH} />
    );
    expect(html.match(/aria-pressed="true"/g)).toBeNull();
  });
});
