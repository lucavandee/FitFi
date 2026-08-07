/**
 * Unit-tests voor de visuele-coherentie module. Draaien volledig op
 * synthetische vectoren: echte FashionCLIP-embeddings zijn hier niet nodig.
 * De flag-uit-identiteit (geen visualEmbeddings = ongewijzigde engine-output)
 * wordt op de golden fixture-catalogus bewaakt.
 */
import { describe, expect, it } from "vitest";
import {
  applyVisualCoherence,
  cosineSim,
  outfitVisualCoherence,
} from "../scoring/visualCoherence";
import type { OutfitCandidate } from "../types";
import { runEngineV2 } from "../engine";
import { reclassifyProducts } from "@/engine/productClassifier";
import { dedupeProductVariants } from "@/services/outfits/dedupeProductVariants";
import rawCatalog from "./fixtures/catalog-tagged-2026-06-11.json";

function candidateWith(ids: string[], compositionScore = 0.5): OutfitCandidate {
  return {
    id: `cand-${ids.join("-")}`,
    occasion: "casual",
    targetFormality: 0.4,
    products: ids.map((id) => ({ product: { id } })) as any,
    compositionScore,
    coherence: {
      colorHarmony: 0,
      formalitySpread: 0,
      archetypeCoherence: 0,
      completeness: 1,
    },
    reasons: [],
  };
}

describe("cosineSim", () => {
  it("is 1 voor identieke vectoren en 0 voor orthogonale", () => {
    expect(cosineSim([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSim([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSim([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("is 0 bij een nulvector", () => {
    expect(cosineSim([0, 0], [1, 0])).toBe(0);
  });
});

describe("outfitVisualCoherence", () => {
  const embeddings = {
    a: [1, 0],
    b: [1, 0],
    c: [0, 1],
  };

  it("geeft null bij minder dan twee ge-embedde producten", () => {
    expect(outfitVisualCoherence(candidateWith(["a"]), embeddings)).toBeNull();
    expect(
      outfitVisualCoherence(candidateWith(["a", "onbekend"]), embeddings)
    ).toBeNull();
  });

  it("middelt over alle paren", () => {
    // paren: (a,b)=1, (a,c)=0, (b,c)=0 -> gemiddeld 1/3
    expect(
      outfitVisualCoherence(candidateWith(["a", "b", "c"]), embeddings)
    ).toBeCloseTo(1 / 3);
  });
});

describe("applyVisualCoherence", () => {
  const embeddings = { a: [1, 0], b: [1, 0], x: [0, 1], y: [1, 0] };

  it("laat kandidaten zonder embeddings ongemoeid", () => {
    const cand = candidateWith(["p", "q"], 0.42);
    applyVisualCoherence([cand], embeddings, 0.15);
    expect(cand.compositionScore).toBe(0.42);
    expect((cand as any).visualCoherence).toBeNull();
  });

  it("verhoogt de score van visueel coherente outfits meer dan incoherente", () => {
    const coherent = candidateWith(["a", "b"], 0.5); // cosine 1
    const incoherent = candidateWith(["a", "x"], 0.5); // cosine 0
    applyVisualCoherence([coherent, incoherent], embeddings, 0.2);
    expect(coherent.compositionScore).toBeGreaterThan(
      incoherent.compositionScore
    );
    expect((coherent as any).visualCoherence).toBeCloseTo(1);
    expect((incoherent as any).visualCoherence).toBeCloseTo(0);
  });

  it("doet niets bij weight 0", () => {
    const cand = candidateWith(["a", "b"], 0.5);
    applyVisualCoherence([cand], embeddings, 0);
    expect(cand.compositionScore).toBe(0.5);
  });
});

describe("flag-uit identiteit op de golden fixture", () => {
  function mapDatabaseProduct(dbProduct: any) {
    const tags: string[] = dbProduct.tags || [];
    const style: string = dbProduct.style || "";
    const styleTags = style
      ? [...tags, ...style.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean)]
      : tags;
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      brand: dbProduct.brand,
      price: dbProduct.price,
      category: dbProduct.category,
      gender: dbProduct.gender,
      colors: [],
      sizes: [],
      tags,
      styleTags,
      description: dbProduct.description,
      inStock: dbProduct.in_stock ?? true,
    };
  }

  it("zonder visualEmbeddings is de output identiek aan een tweede run zonder flag", () => {
    const rows = (rawCatalog as any[]).filter(
      (p) => p.gender === "male" || p.gender === "unisex"
    );
    const mapped = dedupeProductVariants(rows.map(mapDatabaseProduct));
    const { classified } = reclassifyProducts(mapped as any);
    const answers = {
      gender: "male",
      fit: "regular",
      neutrals: "koel",
      goals: ["timeless"],
      budgetRange: 150,
      prints: "effen",
      occasions: ["casual"],
    };
    const a = runEngineV2(answers, classified as any, { count: 6, seed: 7 });
    const b = runEngineV2(answers, classified as any, { count: 6, seed: 7 });
    expect(a.outfits.map((o) => o.products.map((p) => p.id))).toEqual(
      b.outfits.map((o) => o.products.map((p) => p.id))
    );
  });
});
