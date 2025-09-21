import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** User data structure */
export type User = {
  id: string;
  email: string;
  name?: string;
  tier: "visitor" | "member" | "plus" | "founder";
  createdAt?: string;
};

/** Publieke API van de context */
export type UserState = {
  /** Huidige gebruiker (null = niet ingelogd) */
  user: User | null;
  /** Loading state voor auth checks */
  loading: boolean;
  /** Zet gebruiker (login) */
  setUser: (user: User | null) => void;
  /** Logout helper */
  logout: () => void;
  /** Check of gebruiker is ingelogd */
  isAuthenticated: boolean;
  /** Check of gebruiker premium tier heeft */
  isPremium: boolean;
};

const UserCtx = createContext<UserState | null>(null);

const STORAGE_KEY = "ff_user_v1";

type ProviderProps = { children: ReactNode };

/**
 * UserProvider
 * - Bewaart user state in localStorage
 * - Fail-safe patterns voor robuuste auth
 */
const UserProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate uit localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        if (parsed && typeof parsed === "object" && parsed.id) {
          setUserState(parsed);
        }
      }
    } catch {
      /* ignore corrupt storage */
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist naar localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore quota */
    }
  }, [user]);

  const setUser = (newUser: User | null) => setUserState(newUser);

  const logout = () => {
    setUserState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const isAuthenticated = user !== null;
  const isPremium = user?.tier === "plus" || user?.tier === "founder";

  const value = useMemo<UserState>(
    () => ({
      user,
      loading,
      setUser,
      logout,
      isAuthenticated,
      isPremium,
    }),
    [user, loading, isAuthenticated, isPremium]
  );

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
};

/**
 * Fail-safe hook: crasht niet als de Provider ontbreekt.
 */
export function useUser(): UserState {
  const ctx = useContext(UserCtx);
  if (ctx) return ctx;

  // No-op fallback
  return {
    user: null,
    loading: false,
    setUser: () => {},
    logout: () => {},
    isAuthenticated: false,
    isPremium: false,
  };
}

export default UserProvider;