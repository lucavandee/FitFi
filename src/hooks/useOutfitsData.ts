import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataService';
import { Outfit } from '@/engine/types';
import { enhanceProductWithAffiliate } from '@/utils/affiliateUtils';

interface UseOutfitsOptions {
  archetype?: string;
  occasion?: string;
  limit?: number;
  enhanceAffiliate?: boolean;
}

interface UseOutfitsResult {
  outfits: Outfit[];
  isLoading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching outfits with affiliate enhancement
 */
export function useOutfitsData(options: UseOutfitsOptions = {}): UseOutfitsResult {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const {
    archetype,
    occasion,
    limit,
    enhanceAffiliate = true
  } = options;

  const fetchOutfits = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dataService.getOutfits({
        archetype,
        occasion,
        limit
      });

      let processedOutfits = response.data;

      // Enhance products in outfits with affiliate links
      if (enhanceAffiliate) {
        processedOutfits = processedOutfits.map(outfit => ({
          ...outfit,
          products: outfit.products.map(product =>
            enhanceProductWithAffiliate(product, {
              outfit_id: outfit.id,
              archetype: outfit.archetype
            })
          )
        }));
      }

      setOutfits(processedOutfits);
      setSource(response.source);
      setCached(response.cached);

      // Set error if we had to use fallback
      if (response.source === 'fallback' && response.errors.length > 0) {
        setError('Kon geen live data laden, fallback gebruikt');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
      setOutfits([]);
      setSource('fallback');
      setCached(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [archetype, occasion, limit]);

  return {
    outfits,
    isLoading,
    error,
    source,
    cached,
    refetch: fetchOutfits
  };
}