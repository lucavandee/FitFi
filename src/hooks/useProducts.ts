import { useEffect, useState } from "react";
import type { BoltProduct } from "@/services/data/types";
import { fetchProducts } from "@/services/data/dataService";

interface UseProductsOptions {
  gender?: "male" | "female" | "unisex";
  category?: string;
  archetype?: string;
  limit?: number;
  enhanceAffiliate?: boolean;
}

interface UseProductsResult {
  data: BoltProduct[] | null;
  loading: boolean;
  error: string | null;
  source: "supabase" | "local" | "fallback";
  cached: boolean;
  refetch: () => Promise<void>;
}

export function useProducts(
  options: UseProductsOptions = {},
): UseProductsResult {
  const [data, setData] = useState<BoltProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "local" | "fallback">(
    "fallback",
  );
  const [cached, setCached] = useState(false);

  const loadProducts = async () => {
    let alive = true;

    try {
      setLoading(true);
      setError(null);

      const response = await fetchProducts(options);

      if (alive) {
        setData(response.data);
        setSource(response.source);
        setCached(response.cached);

        // Set warning if using fallback
        if (
          response.source === "fallback" &&
          response.errors &&
          response.errors.length > 0
        ) {
          setError("Live data niet beschikbaar, fallback gebruikt");
        }
      }
    } catch (err) {
      if (alive) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
        setData([]);
        setSource("fallback");
        setCached(false);
      }
    } finally {
      if (alive) {
        setLoading(false);
      }
    }

    return () => {
      alive = false;
    };
  };

  useEffect(() => {
    const cleanup = loadProducts();
    return () => cleanup.then((fn) => fn?.());
  }, [options.gender, options.category, options.archetype, options.limit]);

  return {
    data,
    loading,
    error,
    source,
    cached,
    refetch: loadProducts,
  };
}
