import supabase from "@/lib/supabase";

export type ReferralRow = {
  id: string;
  inviter_id: string;
  invitee_email?: string | null;
  status?: "pending" | "joined" | "converted" | null;
  created_at?: string | null;
};

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  joinedReferrals: number;
  convertedReferrals: number;
  referralCode: string;
}

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

export async function getReferralStats(): Promise<ReferralStats> {
  try {
    const sb = supabase;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user's referral code from profiles
    const { data: profile } = await sb
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    // Get referral stats
    const { data: referrals, count } = await sb
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('inviter_id', user.id);

    const totalReferrals = count || 0;
    const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
    const joinedReferrals = referrals?.filter(r => r.status === 'joined').length || 0;
    const convertedReferrals = referrals?.filter(r => r.status === 'converted').length || 0;

    return {
      totalReferrals,
      pendingReferrals,
      joinedReferrals,
      convertedReferrals,
      referralCode: profile?.referral_code || ''
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    throw error;
  }
}