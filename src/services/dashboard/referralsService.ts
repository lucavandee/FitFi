import { supabase } from "@/lib/supabaseClient";

export type ReferralRow = {
  id: string;
  inviter_id: string;
  invitee_email?: string | null;
  status?: "pending" | "joined" | "converted" | null;
  created_at?: string | null;
};

export async function fetchReferralsByInviter(userId: string): Promise<ReferralRow[]> {
  const sb = supabase(); if (!sb) return [];
  const { data, error } = await sb
    .from("referrals")
    .select("id,inviter_id,invitee_email,status,created_at")
    .eq("inviter_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReferralRow[];
}