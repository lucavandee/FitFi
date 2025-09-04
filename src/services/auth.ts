/**
 * Auth service (Supabase) – één bron van waarheid.
 * 
 * Gebruik in pages/hooks alleen deze functies.
 */
import supabase from "@/lib/supabaseClient";

export type AuthResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function getSession(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function getUser(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}