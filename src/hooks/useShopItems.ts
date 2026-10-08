import { useCallback, useEffect, useRef, useState } from "react";
import { LS_KEYS } from "@/lib/quiz/types";
import type { BoltProduct } from "@/services/data/types";
import { haalShopItems } from "@/services/shop/shopService";

function leesQuizAntwoorden(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
    const antwoorden = raw ? (JSON.parse(raw) as Record<string, any>) : null;
    return antwoorden && typeof antwoorden === "object" && Object.keys(antwoorden).length > 0 ? antwoorden : null;
  } catch {
    return null;
  }
}

export interface UseShopItemsResult {
  data: BoltProduct[] | null;
  loading: boolean;
  error: string | null;
  /** True als de selectie op quizantwoorden van deze bezoeker rust. */
  afgestemd: boolean;
  refetch: () => Promise<void>;
}

/**
 * De items voor de shop: de gecureerde kandidaten voor deze bezoeker, uit
 * get_kandidaten. Vervangt useProducts, dat de eerste 1.000 ruwe rijen uit
 * products las.
 */
export function useShopItems(): UseShopItemsResult {
  const [data, setData] = useState<BoltProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [afgestemd, setAfgestemd] = useState(false);
  const levend = useRef(true);

  const laad = useCallback(async () => {
    const antwoorden = leesQuizAntwoorden();
    setLoading(true);
    setError(null);
    try {
      const items = await haalShopItems(antwoorden);
      if (!levend.current) return;
      setData(items);
      setAfgestemd(antwoorden !== null);
    } catch (fout) {
      if (!levend.current) return;
      setData([]);
      setError(fout instanceof Error ? fout.message : "Onbekende fout");
    } finally {
      if (levend.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    levend.current = true;
    void laad();
    return () => {
      levend.current = false;
    };
  }, [laad]);

  return { data, loading, error, afgestemd, refetch: laad };
}
