import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase";

export function useTribeChallenges(tribeId: string | null) {
  return useQuery({
    queryKey: ["tribe-challenges", tribeId],
    enabled: !!tribeId,
    queryFn: async () => {
      const sb = supabase; // object
      const { data, error } = await sb
        .from("tribe_challenges")
        .select("*")
        .eq("tribe_id", tribeId);
      if (error) throw error;
      return data ?? [];
    },
  });
}