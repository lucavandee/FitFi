import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataService';
import { BoltProduct } from '@/types/BoltProduct';
import { enhanceProductWithAffiliate } from '@/utils/affiliateUtils';

interface UseProductsOptions {
  gender?: 'male' | 'female';
  archetype?: string;
  limit?: number;
  enhanceAffiliate?: boolean;
}

interface UseProductsResult {
  products: BoltProduct[];
  isLoading: boolean;
  error: string | null;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching products with affiliate enhancement
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<BoltProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'fallback'>('fallback');
  const [cached, setCached] = useState(false);

  const {
    gender,
    archetype,
    limit,
    enhanceAffiliate = true
  } = options;

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dataService.getProducts({
        gender,
        archetype,
        limit
      });

      let processedProducts = response.data;

      // Enhance with affiliate links if requested
      if (enhanceAffiliate) {
        processedProducts = processedProducts.map(product =>
          enhanceProductWithAffiliate(product, {
            product_id: product.id,
            archetype: archetype || 'general'
          })
        );
      }

      setProducts(processedProducts);
      setSource(response.source);
      setCached(response.cached);

      // Set error if we had to use fallback
      if (response.source === 'fallback' && response.errors.length > 0) {
        setError('Kon geen live data laden, fallback gebruikt');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
      setProducts([]);
      setSource('fallback');
      setCached(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [gender, archetype, limit]);

  return {
    products,
    isLoading,
    error,
    source,
    cached,
    refetch: fetchProducts
  };
}