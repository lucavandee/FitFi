import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeed } from '@/services/DataRouter';

export function useOutfits(limit = 12) {
  return useInfiniteQuery({
    queryKey: ['outfits'],
    queryFn: ({ pageParam = 0 }) => {
      return getFeed({ 
        count: limit,
        offset: pageParam 
      }).then(items => ({
        items,
        hasMore: items.length === limit, // Has more if we got a full page
        nextOffset: pageParam + limit
      }));
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}