import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabase";

type GamificationState = {
  points: number;
  level: number;
  badges: string[];
  loading: boolean;
};

interface UserStats {
  level: number;
  xp: number;
  posts: number;
  submissions: number;
  wins: number;
  invites: number;
  last_active: string;
  updated_at: string;
}

interface CurrentLevel {
  id: number;
  level_name: string;
  min_xp: number;
  max_xp: number | null;
  icon: string;
  color: string;
  perks: string[];
}

interface NextLevel {
  id: number;
  level_name: string;
  min_xp: number;
  max_xp: number | null;
  icon: string;
  color: string;
  perks: string[];
}

interface GamificationState {
  loading: boolean;
  error: string | null;
  badges: any[];
  userStats: UserStats | null;
  currentLevel: CurrentLevel | null;
  nextLevel: NextLevel | null;
}

const GamificationContext = createContext<GamificationState>({
  points: 0,
  level: 1,
  badges: [],
  loading: true,
});

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabase; // ✅ client object — niet aanroepen

    let mounted = true;

    async function bootstrap() {
      setLoading(true);

      // Haal huidige session op
      const { data: { session } } = await sb.auth.getSession();
      if (!mounted) return;

      const userId = session?.user?.id;
      if (!userId) {
        setPoints(0);
        setLevel(1);
        setBadges([]);
        setLoading(false);
        return;
      }

      // Pas tabel/kolommen aan aan jouw schema
      const { data, error } = await sb
        .from("user_gamification")
        .select("points, level, badges")
        .eq("user_id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        // zachte fallback
        setPoints(0);
        setLevel(1);
        setBadges([]);
      } else if (data) {
        setPoints(Number(data.points ?? 0));
        setLevel(Number(data.level ?? 1));
        setBadges(Array.isArray(data.badges) ? data.badges : []);
      }

      setLoading(false);
    }

    // init + resubscribe bij auth changes
    bootstrap();
    const { data: sub } = sb.auth.onAuthStateChange(() => bootstrap());

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ points, level, badges, loading }),
    [points, level, badges, loading]
  );

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  return useContext(GamificationContext);
}