import { supabase } from "@/lib/supabaseClient";

export type ReferralRow = {
  id: string;
  status?: string | null;
  created_at?: string | null;
  inviter_id?: string | null; // snake
  inviterId?: string | null;  // camel (legacy)
};

export async function fetchReferralsByInviter(userId: string) {
  const sb = supabase(); if (!sb) return [];

  // 1) Probeer de canonieke kolom (inviter_id)
  try {
    const { data, error } = await sb
      .from("referrals")
      .select("id,status,created_at,inviter_id")
      .eq("inviter_id", userId);
    if (error) throw error;
    return (data ?? []) as ReferralRow[];
  } catch (e: any) {
    // 42703 = undefined column
    if (String(e?.code ?? e?.message ?? "").includes("42703")) {
      // 2) Retry met camelCase legacy kolom (inviterId)
      const { data, error } = await sb
        .from("referrals")
        .select("id,status,created_at,inviterId")
        .eq("inviterId", userId);
      if (error) throw error;
      return (data ?? []) as ReferralRow[];
    }
    throw e;
  }
}