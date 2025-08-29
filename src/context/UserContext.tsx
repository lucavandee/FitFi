import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabase";

type FitFiUser = {
  id: string;
  email: string | null;
  // voeg hier evt. metadata toe die je gebruikt
};

type UserContextValue = {
  user: FitFiUser | null;
  loading: boolean;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FitFiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabase; // client object — niet aanroepen

    // 1) Initial session ophalen
    setLoading(true);
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // 2) Luisteren naar auth-wijzigingen
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<UserContextValue>(() => ({ user, loading }), [user, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}