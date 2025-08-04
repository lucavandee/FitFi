import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

interface DashboardProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  referral_code?: string;
  referral_count: number;
}

interface ReferralStats {
  total: number;
  rank: number;
  is_founding_member: boolean;
}

interface UserStats {
  quiz_completed: boolean;
  outfits_viewed: number;
  last_active?: string;
}

interface DashboardData {
  ok: boolean;
  profile: DashboardProfile;
  referrals: ReferralStats;
  stats: UserStats;
  shareLink?: string;
  message?: string;
  error?: string;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);

      const { data: dashboardData, error: dashboardError } = await supabase.functions.invoke('dashboard-init', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: {}
      });

      if (dashboardError) {
        console.error('Dashboard function error:', dashboardError);
        setIsError(true);
        
        // Fallback data to prevent blank dashboard
        setData({
          ok: false,
          message: 'init_failed',
          profile: {
            id: user.id,
            full_name: user.name || 'Friend',
            referral_count: 0
          },
          referrals: {
            total: 0,
            rank: 1,
            is_founding_member: false
          },
          stats: {
            quiz_completed: false,
            outfits_viewed: 0
          }
        });
        return;
      }

      // Check if the response indicates an error
      if (dashboardData && dashboardData.ok === false) {
        console.warn('Dashboard init failed:', dashboardData.message);
        setIsError(true);
      }

      setData(dashboardData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setIsError(true);
      
      // Fallback data to prevent blank dashboard
      setData({
        ok: false,
        message: 'fetch_failed',
        profile: {
          id: user.id,
          full_name: user.name || 'Friend',
          referral_count: 0
        },
        referrals: {
          total: 0,
          rank: 1,
          is_founding_member: false
        },
        stats: {
          quiz_completed: false,
          outfits_viewed: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  return {
    data,
    isLoading,
    isError: isError || (data?.ok === false),
    refetch: fetchDashboardData
  };
}