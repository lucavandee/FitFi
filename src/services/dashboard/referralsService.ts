import supabase from "@/lib/supabase";

export type ReferralRow = {
  id: string;
  inviter_id: string;
  invitee_email?: string | null;
  status?: "pending" | "joined" | "converted" | null;
  created_at?: string | null;
};

export async function fetchReferralsByInviter(userId: string): Promise<ReferralRow[]> {
  const sb = supabase; // object — not a function
  const { data, error } = await sb
    .from("referrals")
    .select("id, inviter_id, status, created_at")
    .eq("inviter_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReferralRow[];
}