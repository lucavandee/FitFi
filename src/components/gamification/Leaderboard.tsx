import { useMemo, useCallback } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { track } from '@/utils/analytics';
import LoadingFallback from '../ui/LoadingFallback';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  points: number;
  level: string;
  rank: number;
  avatar_url?: string;
  weekly_points: number;
  monthly_points: number;
  is_current_user?: boolean;
}

interface LeaderboardProps {
  type?: 'all_time' | 'weekly' | 'monthly';
  limit?: number;
  showCurrentUser?: boolean;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  type = 'all_time',
  limit = 10,
  showCurrentUser = true,
  className = ''
}) => {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [type, user?.id]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use RPC function with proper error handling
      const { data, error } = await supabase
        .rpc('get_leaderboard', { 
          leaderboard_type: type,
          limit_count: limit 
        });

      if (error) {
        // Don't throw on auth errors - show fallback data
        if (error.code === '42501' || error.message.includes('permission denied')) {
          console.warn('Leaderboard permission denied, using fallback');
          setLeaderboard(generateMockLeaderboard());
        } else {
          throw error;
        }
        return;
      }

      const leaderboardData = data || generateMockLeaderboard();
      
      // Mark current user
      const processedData = leaderboardData.map((entry: any, index: number) => ({
        ...entry,
        rank: index + 1,
        is_current_user: entry.user_id === user?.id
      }));

      setLeaderboard(processedData);

      // Find current user entry
      if (showCurrentUser && user?.id) {
        const userEntry = processedData.find((entry: LeaderboardEntry) => entry.is_current_user);
        if (userEntry) {
          setCurrentUserEntry(userEntry);
        } else {
          // Get user's position if not in top list
          try {
            if (!supabase) {
              console.warn('Supabase client not available for leaderboard rank');
              return;
            }
            
            const { data: userRank, error: rankError } = await supabase
              .rpc('get_user_leaderboard_rank', { 
                user_uuid: user.id,
                leaderboard_type: type 
              });
            
            if (!rankError && userRank && userRank.length > 0) {
              const rankData = userRank[0];
              setCurrentUserEntry({
                user_id: user.id,
                username: user.name || 'You',
                points: rankData.points || 0,
                level: rankData.level || 'Beginner',
                rank: rankData.rank || 999,
                weekly_points: rankData.weekly_points || 0,
                monthly_points: rankData.monthly_points || 0,
                is_current_user: true
              });
            } else {
              console.warn('Could not load user rank:', rankError);
            }
          } catch (rankError) {
            console.warn('User rank query failed:', rankError);
          }
        }
      }

      // Track leaderboard view
      track('leaderboard_viewed', {
        event_category: 'engagement',
        event_label: type,
        value: 1,
        user_id: user?.id,
        leaderboard_type: type,
        user_rank: currentUserEntry?.rank
      });

    } catch (error) {
      console.error('Leaderboard loading error:', error);
      setError('Kon leaderboard niet laden');
      setLeaderboard(generateMockLeaderboard());
    } finally {
      setIsLoading(false);
    }
  };

type Variant = 'control' | 'v1' | 'v2';

/** Superlichte, dependency-loze hash (djb2-variant) */
function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return hash >>> 0; // forceer positief
}

function pickVariant(seed: string): Variant {
  const n = djb2Hash(seed) % 3;
  return n === 0 ? 'control' : n === 1 ? 'v1' : 'v2';
}

export function useABVariant(testName: string, userId?: string | null) {
  const variant = useMemo<Variant>(() => {
    const seed = `${testName}:${userId ?? 'guest'}`;
    return pickVariant(seed);
  }, [testName, userId]);

  /** Veilig tracken: gebruikt gtag als die bestaat, anders console.debug */
  const trackClick = useCallback(
    (label: string, extra?: Record<string, any>) => {
      try {
        const payload = {
          label,
          test_name: testName,
          variant,
          user_id: userId ?? 'guest',
          ...extra,
        };
        // voorkom crashes zonder gtag
        // @ts-ignore
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          // @ts-ignore
          window.gtag('event', 'cta_click', payload);
        } else {
          // eslint-disable-next-line no-console
          console.debug('[ab/cta_click]', payload);
        }
      } catch {
        /* no-op */
      }
    },
    [testName, userId, variant]
  );

  /** Exposure is bewust no-op in safe mode (later optioneel via API/Supabase) */
  const markExposure = useCallback(() => {
    try {
      const payload = { test_name: testName, variant, user_id: userId ?? 'guest' };
      // @ts-ignore
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        // @ts-ignore
        window.gtag('event', 'ab_exposure', payload);
      } else {
        // eslint-disable-next-line no-console
        console.debug('[ab/exposure]', payload);
      }
    } catch {
      /* no-op */
    }
  }, [testName, userId, variant]);

  return { variant, trackClick, markExposure };
}