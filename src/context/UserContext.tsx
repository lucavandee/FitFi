import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { w } from '@/utils/index';

// Get singleton client
const sb = supabase();

export interface FitFiUser {
  id: string;
  name: string;
  email: string;
  gender?: "male" | "female";
  role?: string;
  isPremium?: boolean;
  stylePreferences?: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
}

export interface UserProfile extends FitFiUser {
  stylePreferences: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
}

interface UserCtx {
  user: FitFiUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isLoading: boolean;
  isMember: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<FitFiUser>) => Promise<void>;
}

const UserContext = createContext<UserCtx | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FitFiUser | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  // Determine if user is a member (has account = member for now)
  const isMember = status === "authenticated" && !!user?.id;

  useEffect(() => {
    if (!sb) {
      setStatus("unauthenticated");
      return;
    }

    // Get initial session with error handling
    sb.auth.getSession().then(({ data: { session }, error }) => {
      // Handle refresh token errors
      if (error && error.message?.includes('Invalid Refresh Token')) {
        console.warn('Invalid refresh token detected, signing out user');
        sb.auth.signOut();
        setUser(null);
        setStatus("unauthenticated");
        w('auth_refresh_token_invalid');
        return;
      }

      if (session?.user) {
        setUser({
          id: session.user.id,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "",
          gender: session.user.user_metadata?.gender,
          role: session.user.user_metadata?.role || "user",
        });
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session, error) => {
      // Handle refresh token errors in auth state changes
      if (error && error.message?.includes('Invalid Refresh Token')) {
        console.warn('Invalid refresh token in auth state change, signing out user');
        sb.auth.signOut();
        setUser(null);
        setStatus("unauthenticated");
        w('auth_refresh_token_invalid_state_change');
        return;
      }

      if (session?.user) {
        setUser({
          id: session.user.id,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "",
          gender: session.user.user_metadata?.gender,
          role: session.user.user_metadata?.role || "user",
        });
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!sb) return false;

    try {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      return !error;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    if (!sb) return false;

    try {
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      return !error;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  // Enhanced sign out with error handling
  const logout = async (): Promise<void> => {
    if (!sb) return;

    try {
      const { error } = await sb.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
    } finally {
      // Always clear local state regardless of API response
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  const updateProfile = async (updates: Partial<FitFiUser>): Promise<void> => {
    if (!sb || !user) return;

    try {
      const { error } = await sb.auth.updateUser({
        data: updates,
      });

      if (!error) {
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  const value: UserCtx = {
    user,
    status,
    isLoading: status === "loading",
    isMember,
    login,
    register,
    logout,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserCtx => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};