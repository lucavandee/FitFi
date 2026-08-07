import type { OutfitCandidate } from '../types';

/**
 * Visuele coherentie op basis van beeld-embeddings (FashionCLIP, 512-dim,
 * L2-genormaliseerd, offline gegenereerd via scripts/visual-embeddings/).
 *
 * Volledig flag-gated: zonder meegegeven embeddings raakt deze module de
 * engine-output niet aan. Producten zonder embedding tellen niet mee; een
 * outfit met minder dan twee ge-embedde producten krijgt geen visuele score.
 */

export type VisualEmbeddings = Record<string, number[]>;

/** Cosine similarity; gaat uit van gelijke dimensie, geen normalisatie-eis. */
export function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Gemiddelde paarsgewijze cosine similarity van de outfit-producten die een
 * embedding hebben. Null wanneer er minder dan twee embeddings zijn.
 */
export function outfitVisualCoherence(
  candidate: OutfitCandidate,
  embeddings: VisualEmbeddings
): number | null {
  const vecs: number[][] = [];
  for (const p of candidate.products) {
    const v = embeddings[p.product.id];
    if (v && v.length > 0) vecs.push(v);
  }
  if (vecs.length < 2) return null;
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < vecs.length; i++) {
    for (let j = i + 1; j < vecs.length; j++) {
      sum += cosineSim(vecs[i], vecs[j]);
      pairs++;
    }
  }
  return sum / pairs;
}

/**
 * Blendt visuele coherentie in de compositionScore.
 *
 * CLIP-cosines tussen verschillende kledingstukken van één outfit liggen in
 * de praktijk grofweg in de band 0.3-0.9; we normaliseren die band naar 0-1
 * zodat de blend-gewichten intuïtief blijven. Kandidaten zonder visuele
 * score behouden hun originele compositionScore.
 */
export function applyVisualCoherence(
  candidates: OutfitCandidate[],
  embeddings: VisualEmbeddings,
  weight = 0.15
): OutfitCandidate[] {
  if (weight <= 0) return candidates;
  const w = Math.min(1, weight);
  for (const cand of candidates) {
    const coherence = outfitVisualCoherence(cand, embeddings);
    (cand as OutfitCandidate & { visualCoherence?: number | null }).visualCoherence =
      coherence;
    if (coherence === null) continue;
    const visual01 = Math.max(0, Math.min(1, (coherence - 0.3) / 0.6));
    cand.compositionScore = cand.compositionScore * (1 - w) + visual01 * w;
  }
  return candidates;
}
