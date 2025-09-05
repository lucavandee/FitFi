import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type FitfiTier = "visitor" | "member" | "plus" | "founder";

export type AuthUser = {
  id: string;
  email?: string;
};

export type AuthState = {
  user: AuthUser | null;
  tier: FitfiTier;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (user: AuthUser, tier?: FitfiTier) => void;
  logout: () => void;
  setTier: (tier: FitfiTier) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_UID = "fitfi_uid";
const LS_TIER = "fitfi_tier";

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
function removeLS(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const uid = typeof window !== "undefined" ? readLS(LS_UID) : null;
    const tier = (typeof window !== "undefined" ? (readLS(LS_TIER) as FitfiTier | null) : null) || "visitor";
    return {
      user: uid ? { id: uid } : null,
      tier,
      loading: false
    };
  });

  // hydrate uit LS (no-op als al aanwezig)
  useEffect(() => {
    const uid = readLS(LS_UID);
    const tier = (readLS(LS_TIER) as FitfiTier | null) || "visitor";
    setState(prev => ({
      user: uid ? { id: uid } : null,
      tier,
      loading: false
    }));
  }, []);

  const login = useCallback((user: AuthUser, tier?: FitfiTier) => {
    writeLS(LS_UID, user.id);
    if (tier) writeLS(LS_TIER, tier);
    setState({ user, tier: tier || state.tier || "member", loading: false });
  }, [state.tier]);

  const logout = useCallback(() => {
    removeLS(LS_UID);
    // tier blijft bestaan (gratis member unlocks kunnen persistent zijn)
    setState(prev => ({ user: null, tier: prev.tier || "visitor", loading: false }));
  }, []);

  const setTier = useCallback((tier: FitfiTier) => {
    writeLS(LS_TIER, tier);
    setState(prev => ({ /* placeholder removed */prev, tier }));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    /* placeholder removed */state,
    login,
    logout,
    setTier
  }), [state, login, logout, setTier]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Gebruik deze hook overal in de app. Gooi een heldere fout als er geen provider is.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Duidelijke developer error i.p.v. cryptische runtime
    throw new Error("useAuth must be used within <AuthProvider>. Wrap your app (root) with AuthProvider.");
  }
  return ctx;
}

/**
 * Optioneel: helper voor route-bescherming.
 */
export function requireTier(current: FitfiTier, required: FitfiTier): boolean {
  const rank = (t: FitfiTier) => ({ visitor: 0, member: 1, plus: 2, founder: 3 }[t]);
  return rank(current) >= rank(required);
}