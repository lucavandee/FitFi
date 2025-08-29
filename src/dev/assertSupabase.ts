import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function assertSupabase(): SupabaseClient {
  // If someone mistakenly reassigns a function here, this throws early in dev
  if (typeof (supabase as any) === "function") {
    throw new Error("Programming error: do not call supabase(); use the client object directly.");
  }
  return supabase;
}