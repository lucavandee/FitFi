import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
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
  profile: DashboardProfile;
  referrals: ReferralStats;
  stats: UserStats;
  shareLink?: string;
}

interface DashboardContextType {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: dashboardData, error: dashboardError } = await supabase.functions.invoke('dashboard-init', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: {}
      });

      if (dashboardError) {
        throw dashboardError;
      }

      setData(dashboardData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      
      // Fallback data to prevent blank dashboard
      setData({
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

  const value: DashboardContextType = {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};