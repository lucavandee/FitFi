// Minimal Supabase shims voor TypeScript compliance
export type User = {
  id: string;
  email?: string;
  created_at: string;
};

export type Session = {
  user: User;
  access_token: string;
};

export function useSupabaseAuth() {
  return {
    user: null as User | null,
    session: null as Session | null,
    loading: false,
    signIn: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ error: null })
  };
}

export function useSupabaseQuery() {
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
}