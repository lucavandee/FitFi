import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

export type GamificationContextValue = {
  level: number;
  xp: number;
  streak: number;
  loading: boolean;
  claimDaily: () => Promise<void> | void;
  addXp: (amount: number) => Promise<void> | void;
};

const defaultValue: GamificationContextValue = {
  level: 1,
  xp: 0,
  streak: 0,
  loading: false,
  claimDaily: () => {},
  addXp: () => {},
};

export const GamificationContext = createContext<GamificationContextValue>(defaultValue);

export const GamificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Veilige lokale state (kan later gekoppeld worden aan echte hooks/API)
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  const [streak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const addXp = useCallback(async (amount: number) => {
    setXp((x) => Math.max(0, x + (Number.isFinite(amount) ? amount : 0)));
    // Eventueel: level berekenen o.b.v. XP (placeholder)
    const newLevel = 1 + Math.floor((xp + amount) / 100);
    setLevel((l) => Math.max(l, newLevel));
  }, [xp]);

  const claimDaily = useCallback(async () => {
    try {
      setLoading(true);
      // Hier kan later backend call komen; nu enkel bonus toevoegen
      await addXp(10);
    } finally {
      setLoading(false);
    }
  }, [addXp]);

  const value = useMemo<GamificationContextValue>(() => ({
    level,
    xp,
    streak,
    loading,
    claimDaily,
    addXp,
  }), [level, xp, streak, loading, claimDaily, addXp]);

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Hook voor consumers
export function useGamification(): GamificationContextValue {
  return useContext(GamificationContext);
}

// Compat: sommige bestanden kunnen deze naam gebruiken
export { GamificationProvider as GamificationContextProvider };

// Default export tbv. legacy imports: import GamificationProvider from '...'
export default GamificationProvider;