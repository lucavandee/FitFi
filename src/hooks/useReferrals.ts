import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

interface ReferralData {
  code: string;
  count: number;
  isFoundingMember: boolean;
}

interface LeaderboardEntry {
  user_id: string;
  referral_count: number;
  rank: number;
}

export function useReferrals() {
  const { user } = useUser();
  const [referralData, setReferralData] = useState<ReferralData>({
    code: '',
    count: 0,
    isFoundingMember: false
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadReferralData();
      loadLeaderboard();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadReferralData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's referral code
      const { data: referralCode, error: codeError } = await supabase
        .from('referrals')
        .select('code')
        .eq('user_id', user.id)
        .single();

      if (codeError) {
        throw new Error('Failed to load referral code');
      }

      // Get referral count
      const { count, error: countError } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('referred_user_id', 'is', null);

      if (countError) {
        throw new Error('Failed to load referral count');
      }

      const referralCount = count || 0;
      
      setReferralData({
        code: referralCode?.code || '',
        count: referralCount,
        isFoundingMember: referralCount >= 3
      });

    } catch (err) {
      console.error('Error loading referral data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_referral_leaderboard');

      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const processReferral = async (referralCode: string) => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/referral/register?code=${referralCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          user_id: user.id
        })
      });

      if (response.ok) {
        // Reload data after successful referral
        await loadReferralData();
        await loadLeaderboard();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error processing referral:', error);
      return false;
    }
  };

  return {
    referralData,
    leaderboard,
    isLoading,
    error,
    processReferral,
    refetch: loadReferralData
  };
}