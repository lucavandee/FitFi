import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Publieke API van de context */
export type GamificationState = {
  level: number;
  points: number;
  addPoints: (delta: number) => void;
  reset: () => void;
};

const GamificationCtx = createContext<GamificationState | null>(null);

/**
 * Fail-safe hook: als de Provider ontbreekt crasht de app niet,
 * maar krijg je een no-op implementatie terug (dev-vriendelijk).
 */
export function useGamification(): GamificationState {
  const ctx = useContext(GamificationCtx);
  if (ctx) return ctx;
  return {
    level: 1,
    points: 0,
    addPoints: () => {},
    reset: () => {},
  };
}

type ProviderProps = { children: ReactNode };

const STORAGE_KEY = "ff_gamification_v1";

/**
 * GamificationProvider
 * - Slaat voortgang lokaal op (localStorage)
 * - Simpele levelcurve: elke 100 punten → +1 level
 */
const GamificationProvider: React.FC<ProviderProps> = ({ children }) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);

  // Hydrate uit localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GamificationState>;
        if (typeof parsed.points === "number") setPoints(parsed.points);
        if (typeof parsed.level === "number") setLevel(parsed.level);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist naar localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ points, level })
      );
    } catch {
      /* ignore */
    }
  }, [points, level]);

  const addPoints = (delta: number) => {
    setPoints((prev) => {
      const next = Math.max(0, prev + delta);
      setLevel(1 + Math.floor(next / 100));
      return next;
    });
  };

  const reset = () => {
    setPoints(0);
    setLevel(1);
  };

  const value = useMemo(
    () => ({ level, points, addPoints, reset }),
    [level, points]
  );

  return (
    <GamificationCtx.Provider value={value}>
      {children}
    </GamificationCtx.Provider>
  );
};

export default GamificationProvider;