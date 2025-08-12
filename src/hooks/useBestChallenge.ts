import { useEffect, useState } from "react";
import { findBestOpenChallenge } from "@/services/tribes/challengeDiscovery";

export function useBestChallenge(userId?: string) {
  const [best, setBest] = useState<{ tribeId?: string; challengeId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    findBestOpenChallenge(userId).then(r => { if (alive) setBest(r); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId]);
  return { best, loading };
}