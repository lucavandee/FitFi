import { supabase } from "@/lib/supabaseClient";
import { generateRecommendationsFromAnswers } from "@/engine/recommendationEngine";
import { runEngineV2 } from "@/engine/v2";
import { stableStringify } from "@/utils/stableJson";
import { seedFromAnswers } from "./answersSeed";
import { bereidKandidatenVoorMetDiagnose, naarKandidatenParams, type KandidaatRij } from "./kandidaten";
import type { Product } from "@/engine/types";
import type { Outfit } from "@/engine/types";

// Outfit.explanation is al verplicht (string); geen aparte optionele override nodig.
export type GeneratedOutfit = Outfit;

/**
 * De productcatalogus kon niet worden geladen: geen client, een queryfout, of
 * nul rijen terug.
 *
 * Bestaat om dit te kunnen onderscheiden van "de catalogus is geladen maar er
 * past niets bij dit profiel". Beide gaven eerder een lege lijst, waardoor de
 * resultatenpagina bij een platte database aan de gebruiker vertelde dat zijn
 * filters te strak stonden. Die deed dan de quiz opnieuw en kreeg opnieuw
 * niets, zonder ooit te horen dat het aan onze kant lag.
 */
export class CatalogusOnbereikbaar extends Error {
  constructor(reden: string) {
    super(`Catalogus onbereikbaar: ${reden}`);
    this.name = 'CatalogusOnbereikbaar';
  }
}

class OutfitService {
  private productsCache: Map<string, Product[]> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 30;

  /**
   * De productpool voor de engine, uit de RPC get_kandidaten (spec 5.3).
   *
   * Vroeger: select * from products zonder limit, dus de eerste 1.000 rijen
   * in rijvolgorde van circa 282.000 (0 H&M). Nu: per categorie de beste
   * kandidaten uit product_attributes, gefilterd aan de serverkant op
   * canoniek, draagbaar, voorraad, gender en budget.
   *
   * Een string als eerste argument wordt gelezen als gender; dat is de vorm
   * die calibrationOutfitsV2 gebruikt.
   *
   * Gebruikt bereidKandidatenVoorMetDiagnose (niet de gewone variant): die
   * geeft classifierAfgekeurd, veiligheidsnetGeweigerd en geweigerdPerReden
   * terug. Zonder die diagnose is er geen stopregel: een classifier die
   * plotseling de hele pool afkeurt, ziet er in de gewone variant hetzelfde
   * uit als "niets binnen de filters" (lege lijst), en dat verschil hoort
   * zichtbaar te zijn, niet alleen in een consolelog.
   */
  async getProducts(
    answersOfGender?: Record<string, any> | string,
    forceRefresh = false
  ): Promise<Product[]> {
    const answers =
      typeof answersOfGender === 'string' ? { gender: answersOfGender } : (answersOfGender ?? {});
    const params = naarKandidatenParams(answers);
    const cacheKey = stableStringify(params);
    const cached = this.productsCache.get(cacheKey);
    const cachedAt = this.cacheTimestamps.get(cacheKey) ?? 0;

    if (!forceRefresh && cached && Date.now() - cachedAt < this.CACHE_DURATION) {
      return cached;
    }

    const client = supabase();
    if (!client) {
      throw new CatalogusOnbereikbaar('geen Supabase-client beschikbaar');
    }

    try {
      const { data, error } = await client.rpc('get_kandidaten', params);

      if (error) {
        throw new CatalogusOnbereikbaar(error.message || 'rpc get_kandidaten faalde');
      }

      const rijen = (data ?? []) as KandidaatRij[];

      if (rijen.length === 0) {
        // Nul rijen is nu dubbelzinnig: filters te strak, of de tabel is
        // nooit gevuld. Alleen het tweede is "catalogus onbereikbaar".
        const { count, error: telFout } = await client
          .from('product_attributes')
          .select('product_id', { count: 'exact', head: true });
        if (telFout) {
          throw new CatalogusOnbereikbaar(telFout.message || 'product_attributes niet leesbaar');
        }
        if (!count) {
          throw new CatalogusOnbereikbaar('product_attributes is leeg');
        }
        console.warn('[OutfitService] get_kandidaten gaf nul rijen voor', params);
        return [];
      }

      const { pool: products, classifierAfgekeurd, veiligheidsnetGeweigerd, geweigerdPerReden } =
        bereidKandidatenVoorMetDiagnose(rijen);

      // Stopregel (taak 7): classifierAfgekeurd is zichtbaar, niet alleen
      // een consolelog. Keurt de classifier de hele of nagenoeg de hele
      // aangeleverde rij af (bijvoorbeeld doordat product_attributes achter
      // de code aanloopt, zie telCategorieAfwijkingen), dan is dat een ander
      // probleem dan "niets binnen de filters" en hoort dat luid te zijn.
      if (classifierAfgekeurd > 0 || veiligheidsnetGeweigerd > 0) {
        console.warn('[OutfitService] pool na classificatie en veiligheidsnet:', {
          rijen: rijen.length,
          classifierAfgekeurd,
          veiligheidsnetGeweigerd,
          geweigerdPerReden,
          overgebleven: products.length,
        });
      }
      if (rijen.length > 0 && classifierAfgekeurd >= rijen.length) {
        console.error(
          '[OutfitService] classifier keurde de volledige RPC-pool af; product_attributes loopt vermoedelijk achter op de classifier-code'
        );
      }

      this.productsCache.set(cacheKey, products);
      this.cacheTimestamps.set(cacheKey, Date.now());

      console.log(`[OutfitService] ${products.length} kandidaten uit ${rijen.length} rijen (${params.p_gender}, ${params.p_budget_min}-${params.p_budget_max})`);
      return products;
    } catch (error) {
      if (error instanceof CatalogusOnbereikbaar) throw error;
      console.error('[OutfitService] Exception fetching products:', error);
      throw new CatalogusOnbereikbaar(
        error instanceof Error ? error.message : 'onbekende fout bij ophalen'
      );
    }
  }

  async generateOutfits(
    quizAnswers: Record<string, any>,
    count: number = 6
  ): Promise<GeneratedOutfit[]> {
    try {
      const products = await this.getProducts(quizAnswers);

      console.log(`[OutfitService] Loaded ${products.length} products from database`);

      if (products.length === 0) {
        console.error('[OutfitService] No products available');
        return [];
      }

      const useV2 = shouldUseEngineV2();
      let outfits: Outfit[] = [];

      if (useV2) {
        try {
          // Vaste seed: dezelfde antwoorden geven dezelfde outfits, ook na
          // een herlaad (spec 2, "geen seed in productie"). seedFromAnswers
          // gooit bewust door bij NaN/Infinity/een circulaire verwijzing in
          // de antwoorden (zie de docblock in answersSeed.ts): dat mag hier
          // niet doorborrelen naar de render, dus een kapot antwoordobject
          // valt terug op een vaste seed in plaats van dat de pagina leeg
          // blijft.
          const result = runEngineV2(quizAnswers, products, {
            count,
            debug: true,
            seed: seedVoorEngine(quizAnswers),
          });
          outfits = result.outfits;
          console.log('[OutfitService] engine v2 stats', result.stats);
        } catch (err) {
          console.error('[OutfitService] engine v2 failed, falling back to v1', err);
          outfits = [];
        }
      }

      if (outfits.length === 0) {
        outfits = generateRecommendationsFromAnswers(
          quizAnswers,
          products,
          count
        );
      }

      if (outfits.length === 0) {
        console.warn('[OutfitService] No outfits generated - likely insufficient products after filtering');
        return [];
      }

      const outfitsWithExplanations = outfits.map((outfit) => ({
        ...outfit,
        // Preserve engine v2 explanations; only apply fallback template when empty
        explanation: outfit.explanation?.trim()
          ? outfit.explanation
          : this.generateExplanation(outfit, quizAnswers),
      }));

      console.log(`[OutfitService] Successfully generated ${outfitsWithExplanations.length} outfits`);
      return outfitsWithExplanations;
    } catch (error) {
      // Bewust doorlaten: een onbereikbare catalogus is iets anders dan een
      // profiel waar geen outfit bij past, en de gebruiker hoort niet te lezen
      // dat zijn filters te strak staan terwijl de database plat ligt.
      if (error instanceof CatalogusOnbereikbaar) throw error;
      console.error('[OutfitService] Error generating outfits:', error);
      return [];
    }
  }

  private generateExplanation(outfit: Outfit, quizAnswers: Record<string, any>): string {
    try {
      const archetype = quizAnswers.archetype || outfit.archetype || 'casual_chic';
      const bodyType = quizAnswers.bodyType || 'balanced';
      const colorProfile = quizAnswers.colorProfile || { season: 'warm' };

      const parts: string[] = [];

      parts.push(`Deze outfit past perfect bij jouw ${archetype} stijl.`);

      if (outfit.products && outfit.products.length > 0) {
        const categories = [...new Set(outfit.products.map(p => p.category))];
        parts.push(`De combinatie van ${categories.join(', ')} creëert een harmonieus geheel.`);
      }

      if (colorProfile.season) {
        parts.push(`De kleuren zijn gekozen op basis van jouw ${colorProfile.season} ondertoon.`);
      }

      if (bodyType) {
        parts.push(`Het silhouet flatteert jouw ${bodyType} figuur.`);
      }

      return parts.join(' ');
    } catch (error) {
      console.error('[OutfitService] Error generating explanation:', error);
      return 'Deze outfit is speciaal voor jou samengesteld op basis van jouw stijlprofiel.';
    }
  }

  clearCache(): void {
    this.productsCache.clear();
    this.cacheTimestamps.clear();
  }
}

/**
 * Vaste terugvalseed als seedFromAnswers gooit. Geen 0: 0 is een geldige,
 * en dus verwarrende, echte seed (bijvoorbeeld voor een leeg antwoordobject).
 * Dit getal komt nergens anders vandaan en dient alleen als herkenbare
 * noodgreep; alle bezoekers met kapotte antwoorden krijgen wel dezelfde
 * (vaste) outfits, in plaats van een crash of een lege pagina.
 */
const VASTE_TERUGVAL_SEED = 0xdeadbeef;

function seedVoorEngine(quizAnswers: Record<string, any>): number {
  try {
    return seedFromAnswers(quizAnswers);
  } catch (error) {
    console.error(
      '[OutfitService] seedFromAnswers kon geen seed maken uit de antwoorden, val terug op een vaste seed:',
      error
    );
    return VASTE_TERUGVAL_SEED;
  }
}

function shouldUseEngineV2(): boolean {
  try {
    const env = (import.meta as any).env ?? {};
    const flag = env.VITE_ENGINE_V2 ?? env.VITE_USE_ENGINE_V2;
    if (typeof flag === 'string') {
      if (flag === '0' || flag.toLowerCase() === 'false') return false;
    }
    if (typeof window !== 'undefined') {
      const override = window.localStorage?.getItem('ff_engine_v2');
      if (override === '0' || override === 'false') return false;
    }
  } catch {
    // ignore
  }
  return true;
}

export const outfitService = new OutfitService();
