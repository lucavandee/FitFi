import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useFavorites(userId?: string) {
  return useQuery({
    queryKey: ['saved-outfits', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('saved_outfits')
        .select('outfit_id, outfit_json, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}