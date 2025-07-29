import { useState, useEffect } from 'react';
import { fetchOutfits } from '../services/outfitService';
import type { OutfitResponse } from '../types/outfit';

export const useOutfits = (styleKey: string) => {
  const [data, setData] = useState<OutfitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const outfits = await fetchOutfits(styleKey);
        setData(outfits);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch outfits'));
      } finally {
        setIsLoading(false);
      }
    };

    if (styleKey) {
      loadOutfits();
    }
  }, [styleKey]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      if (styleKey) {
        const loadOutfits = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const outfits = await fetchOutfits(styleKey);
            setData(outfits);
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch outfits'));
          } finally {
            setIsLoading(false);
          }
        };
        loadOutfits();
      }
    }
  };
};