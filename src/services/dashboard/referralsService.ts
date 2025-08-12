import { supabase } from "@/lib/supabaseClient";

export type ReferralRow = {
  id: string;
  inviter_id: string;
  // invitee_email is optioneel/niet altijd aanwezig in DB
  invitee_email?: string | null;
  status?: "pending" | "joined" | "converted" | null;
  created_at?: string | null;
};

export async function fetchReferralsByInviter(userId: string): Promise<ReferralRow[]> {
  const sb = supabase(); if (!sb) return [];
  // Selecteer alleen kolommen die zeker bestaan
  const { data, error } = await sb
    .from("referrals")
    .select("id,inviter_id,status,created_at")   // <-- invitee_email bewust weggelaten
    .eq("inviter_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReferralRow[];
}