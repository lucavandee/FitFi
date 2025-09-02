import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "@/lib/supabase";

export type TribeChallenge = {
  id: string;
  tribe_id: string;
  title: string;
  description?: string | null;
  created_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type ChallengeSubmission = {
  id: string;
  challenge_id: string;
  user_id: string;
  content?: string | null; // bv. URL/tekst
  created_at?: string | null;
};

/** Challenges voor een tribe */
export function useTribeChallenges(tribeId: string | null) {
  return useQuery({
    queryKey: ["tribe-challenges", tribeId],
    enabled: !!tribeId,
    queryFn: async () => {
      const sb = supabase;
      const { data, error } = await sb
        .from("tribe_challenges")
        .select("*")
        .eq("tribe_id", tribeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TribeChallenge[];
    },
  });
}

/** Submissions voor een challenge */
export function useChallengeSubmissions(challengeId: string | null) {
  return useQuery({
    queryKey: ["challenge-submissions", challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      const sb = supabase;
      const { data, error } = await sb
        .from("challenge_submissions")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ChallengeSubmission[];
    },
  });
}

/** Nieuwe submission aanmaken */
export function useCreateChallengeSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      challenge_id: string;
      user_id: string;
      content?: string | null;
    }) => {
      const sb = supabase;
      const { data, error } = await sb
        .from("challenge_submissions")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return data as ChallengeSubmission;
    },
    onSuccess: (data) => {
      // invalideer lijst voor deze challenge
      qc.invalidateQueries({ queryKey: ["challenge-submissions", data.challenge_id] });
    },
  });
}

/** Nieuwe challenge aanmaken */
export function useCreateTribeChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      tribe_id: string;
      title: string;
      description?: string | null;
      starts_at?: string | null;
      ends_at?: string | null;
    }) => {
      const sb = supabase;
      const { data, error } = await sb
        .from("tribe_challenges")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return data as TribeChallenge;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["tribe-challenges", data.tribe_id] });
    },
  });
}