import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 1.0, rootMargin = '0px' } = options;
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await fetchMore();
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, isLoading, hasMore]);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    if (node) observer.observe(node);
    
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [isLoading, hasMore, loadMore, threshold, rootMargin]);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    error,
    lastElementRef,
    loadMore,
    reset
  };
}