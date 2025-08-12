import { useEffect, useMemo, useState } from "react";
import { getTribeMembers, joinTribe, leaveTribe } from "@/services/tribes/tribeService";

export function useTribeMembership(tribeId: string, userId?: string) {
  const [members, setMembers] = useState(() => [] as Awaited<ReturnType<typeof getTribeMembers>>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMember = useMemo(() => {
    if (!userId) return false;
    return members.some(m => m.user_id === userId);
  }, [members, userId]);

  useEffect(() => {
    let alive = true;
    getTribeMembers(tribeId)
      .then(m => { if (alive) setMembers(m); })
      .catch(e => { if (alive) setError(String(e?.message ?? e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tribeId]);

  async function onJoin() {
    if (!userId) throw new Error("Niet ingelogd");
    const optimistic = { 
      id: `temp_${Date.now()}`,
      tribe_id: tribeId, 
      user_id: userId, 
      role: "member" as const, 
      joined_at: new Date().toISOString() 
    };
    setMembers(prev => prev.some(m => m.user_id === userId) ? prev : [optimistic, ...prev]);
    try {
      await joinTribe(tribeId, userId);
      // Refresh members list to get real data
      const updatedMembers = await getTribeMembers(tribeId);
      setMembers(updatedMembers);
    } catch (e) {
      // revert
      setMembers(prev => prev.filter(m => m.user_id !== userId));
      throw e;
    }
  }

  async function onLeave() {
    if (!userId) throw new Error("Niet ingelogd");
    const prev = members;
    setMembers(prev.filter(m => m.user_id !== userId));
    try {
      await leaveTribe(tribeId, userId);
      // Refresh members list to get real data
      const updatedMembers = await getTribeMembers(tribeId);
      setMembers(updatedMembers);
    } catch (e) {
      setMembers(prev); // revert
      throw e;
    }
  }

  return { members, isMember, loading, error, onJoin, onLeave };
}