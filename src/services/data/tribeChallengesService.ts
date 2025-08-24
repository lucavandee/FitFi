import { supabase } from "@/lib/supabaseClient";
import { DATA_CONFIG } from "@/config/dataConfig";
import { loadLocalJSON } from "@/utils/loadLocalJSON";
import type {
  TribeChallenge,
  TribeChallengeSubmission,
  TribeRanking,
} from "./types";

const T = DATA_CONFIG.SUPABASE.tables;

// ---------- Challenges ----------
export async function getTribeChallenges(
  tribeId?: string,
): Promise<TribeChallenge[]> {
  const sb = supabase();
  try {
    if (sb) {
      let q = sb
        .from(T.tribeChallenges)
        .select("*")
        .order("startAt", { ascending: false });
      if (tribeId) q = q.eq("tribeId", tribeId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as TribeChallenge[];
    }
    throw new Error("No Supabase client");
  } catch {
    const all = await loadLocalJSON<TribeChallenge[]>(
      DATA_CONFIG.LOCAL_JSON.tribeChallenges,
    );
    return tribeId ? all.filter((c) => c.tribeId === tribeId) : all;
  }
}

// alias voor compatibiliteit met andere imports
export const fetchTribeChallenges = getTribeChallenges;

export async function createTribeChallenge(
  ch: TribeChallenge,
): Promise<TribeChallenge> {
  const sb = supabase();
  if (!sb) throw new Error("No Supabase client");
  const { data, error } = await sb
    .from(T.tribeChallenges)
    .insert(ch)
    .select("*")
    .single();
  if (error) throw error;
  return data as TribeChallenge;
}

export async function updateTribeChallengeStatus(
  id: string,
  status: "draft" | "open" | "closed" | "archived",
): Promise<TribeChallenge> {
  const sb = supabase();
  if (!sb) throw new Error("No Supabase client");
  const { data, error } = await sb
    .from(T.tribeChallenges)
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as TribeChallenge;
}

// ---------- Submissions ----------
export async function getChallengeSubmissions(
  challengeId: string,
): Promise<TribeChallengeSubmission[]> {
  const sb = supabase();
  try {
    if (sb) {
      const { data, error } = await sb
        .from(T.tribeChallengeSubmissions)
        .select("*")
        .eq("challengeId", challengeId)
        .order("createdAt", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TribeChallengeSubmission[];
    }
    throw new Error("No Supabase client");
  } catch {
    const all = await loadLocalJSON<TribeChallengeSubmission[]>(
      DATA_CONFIG.LOCAL_JSON.tribeChallengeSubmissions,
    );
    return all.filter((s) => s.challengeId === challengeId);
  }
}

export async function createChallengeSubmission(
  sub: TribeChallengeSubmission,
): Promise<TribeChallengeSubmission> {
  const sb = supabase();
  if (!sb) throw new Error("No Supabase client");
  const { data, error } = await sb
    .from(T.tribeChallengeSubmissions)
    .insert(sub)
    .select("*")
    .single();
  if (error) throw error;
  return data as TribeChallengeSubmission;
}

export async function updateSubmissionScore(
  submissionId: string,
  score: number,
  isWinner: boolean = false,
): Promise<TribeChallengeSubmission> {
  const sb = supabase();
  if (!sb) throw new Error("No Supabase client");
  const { data, error } = await sb
    .from(T.tribeChallengeSubmissions)
    .update({ score, isWinner })
    .eq("id", submissionId)
    .select()
    .single();
  if (error) throw error;
  return data as TribeChallengeSubmission;
}

// ---------- Ranking ----------
export async function getTribeRanking(): Promise<TribeRanking[]> {
  const sb = supabase();
  try {
    if (sb) {
      const { data, error } = await sb
        .from(T.tribeRanking)
        .select("*")
        .order("points", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TribeRanking[];
    }
    throw new Error("No Supabase client");
  } catch {
    return loadLocalJSON<TribeRanking[]>(DATA_CONFIG.LOCAL_JSON.tribeRanking);
  }
}

// Additional exports for compatibility
export async function getUserChallengeParticipation(
  userId: string,
  challengeId: string,
): Promise<{
  hasParticipated: boolean;
  submission?: TribeChallengeSubmission;
}> {
  try {
    const submissions = await getChallengeSubmissions(challengeId);
    const userSubmission = submissions.find((s) => s.userId === userId);

    return {
      hasParticipated: !!userSubmission,
      submission: userSubmission,
    };
  } catch (error) {
    console.error("Error checking participation:", error);
    return { hasParticipated: false };
  }
}

export async function getChallengeStats(challengeId: string): Promise<{
  totalSubmissions: number;
  averageScore: number;
  winnerCount: number;
  topSubmissions: TribeChallengeSubmission[];
}> {
  try {
    const submissions = await getChallengeSubmissions(challengeId);

    const totalSubmissions = submissions.length;
    const scoredSubmissions = submissions.filter((s) => s.score !== undefined);
    const averageScore =
      scoredSubmissions.length > 0
        ? scoredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
          scoredSubmissions.length
        : 0;
    const winnerCount = submissions.filter((s) => s.isWinner).length;
    const topSubmissions = submissions
      .filter((s) => s.score && s.score >= 85)
      .slice(0, 5);

    return {
      totalSubmissions,
      averageScore: Math.round(averageScore),
      winnerCount,
      topSubmissions,
    };
  } catch (error) {
    console.error("Error getting challenge stats:", error);
    return {
      totalSubmissions: 0,
      averageScore: 0,
      winnerCount: 0,
      topSubmissions: [],
    };
  }
}
