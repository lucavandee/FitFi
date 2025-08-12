import { supabase } from "@/lib/supabaseClient";
import { fetchTribeChallenges } from "@/services/data/tribeChallengesService";

export async function findBestOpenChallenge(userId?: string): Promise<{ tribeId?: string; challengeId?: string } | null> {
  const sb = supabase();
  let joined: string[] = [];
  if (sb && userId) {
    const { data } = await sb.from("tribe_members").select("tribeId").eq("userId", userId);
    joined = (data ?? []).map((r: any) => r.tribeId);
  }

  for (const tId of joined) {
    const list = await fetchTribeChallenges(tId);
    const open = list.find(c => c.status === "open");
    if (open) return { tribeId: open.tribeId, challengeId: open.id };
  }

  const fallbacks = joined.length ? [] : ["tribe-italian-smart-casual","tribe-streetstyle-europe"];
  for (const tId of fallbacks) {
    const list = await fetchTribeChallenges(tId);
    const open = list.find(c => c.status === "open");
    if (open) return { tribeId: open.tribeId, challengeId: open.id };
  }

  return null;
}