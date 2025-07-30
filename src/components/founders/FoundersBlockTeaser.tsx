import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Crown, Users, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { predictivePrefetcher } from '../../services/PredictivePrefetcher';
import { realtimeCollaboration } from '../../services/RealtimeCollaboration';

interface FoundersBlockTeaserProps {
  className?: string;
}

const FoundersBlockTeaser: React.FC<FoundersBlockTeaserProps> = ({ className = '' }) => {
  const { user } = useUser();
  const [referralCount, setReferralCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast');
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchedData, setPrefetchedData] = useState<any>(null);

  // Detect connection speed
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const speed = connection.effectiveType === '4g' || connection.downlink > 2 ? 'fast' : 'slow';
      setConnectionSpeed(speed);
    }
  }, []);

  // Initialize real-time collaboration
  useEffect(() => {
    if (user?.id) {
      realtimeCollaboration.setUserId(user.id);
      
      // Subscribe to real-time referral updates
      const unsubscribe = realtimeCollaboration.onUpdate((update) => {
        if (update.userId === user.id) {
          setReferralCount(update.referralCount);
        }
      });

      return unsubscribe;
    }
  }, [user?.id]);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast');
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchedData, setPrefetchedData] = useState<any>(null);

  // Detect connection speed
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const speed = connection.effectiveType === '4g' || connection.downlink > 2 ? 'fast' : 'slow';
      setConnectionSpeed(speed);
    }
  }, []);

  // Load real-time referral count (progressive enhancement)
  useEffect(() => {
    if (!user?.id) return;

    const loadReferralCount = async () => {
      setIsLoading(true);
      try {
        const { count, error } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('referred_user_id', 'is', null);

        if (!error) {
          setReferralCount(count || 0);
        }
      } catch (error) {
        console.warn('Could not load referral count for teaser:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load if fast connection or user explicitly wants it
    if (connectionSpeed === 'fast') {
      loadReferralCount();
    }
    if (connectionSpeed === 'fast') {
      loadReferralCount();
    }
  }, [user?.id, connectionSpeed]);

  // Register predictive prefetch
  useEffect(() => {
    if (user?.id) {
      predictivePrefetcher.registerPrefetch('founders-dashboard', async () => {
        setIsPrefetching(true);
        try {
          // Prefetch dashboard data
          const [referralData, leaderboardData] = await Promise.all([
            supabase
              .from('referrals')
              .select('code')
              .eq('user_id', user.id)
              .single(),
            supabase
              .rpc('get_referral_leaderboard')
          ]);

          const prefetchData = {
            referralCode: referralData.data?.code,
            leaderboard: leaderboardData.data || []
          };

          setPrefetchedData(prefetchData);

          // Store in sessionStorage for dashboard
          sessionStorage.setItem('fitfi-prefetched-founders', JSON.stringify({
            data: prefetchData,
            timestamp: Date.now()
          }));

        } catch (error) {
          console.warn('Prefetch failed:', error);
        } finally {
          setIsPrefetching(false);
        }
      });
    }
  }, [user?.id]);

  // Smart prefetching on hover
  const handleHoverStart = async () => {
    if (!user?.id || isPrefetching || prefetchedData) return;

    setIsPrefetching(true);
    try {
      // Prefetch dashboard data
      const [referralData, leaderboardData] = await Promise.all([
        supabase
          .from('referrals')
          .select('code')
          .eq('user_id', user.id)
          .single(),
        supabase
          .rpc('get_referral_leaderboard')
      ]);

      setPrefetchedData({
        referralCode: referralData.data?.code,
        leaderboard: leaderboardData.data || []
      });

      // Store in sessionStorage for dashboard
      sessionStorage.setItem('fitfi-prefetched-founders', JSON.stringify({
        data: prefetchedData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Prefetch failed:', error);
    } finally {
      setIsPrefetching(false);
    }
  };

  // Adaptive loading indicator
  const getLoadingIndicator = () => {
    if (connectionSpeed === 'slow') {
      return <WifiOff className="w-3 h-3 text-gray-400 animate-pulse" />;
    }
    return <Wifi className="w-3 h-3 text-green-500" />;
  };

  // Smart prefetching on hover
  const handleHoverStart = async () => {
    if (!user?.id || isPrefetching || prefetchedData) return;

    setIsPrefetching(true);
    try {
      // Prefetch dashboard data
      const [referralData, leaderboardData] = await Promise.all([
        supabase
          .from('referrals')
          .select('code')
          .eq('user_id', user.id)
          .single(),
        supabase
          .rpc('get_referral_leaderboard')
      ]);

      setPrefetchedData({
        referralCode: referralData.data?.code,
        leaderboard: leaderboardData.data || []
      });

      // Store in sessionStorage for dashboard
      sessionStorage.setItem('fitfi-prefetched-founders', JSON.stringify({
        data: prefetchedData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Prefetch failed:', error);
    } finally {
      setIsPrefetching(false);
    }
  };

  // Adaptive loading indicator
  const getLoadingIndicator = () => {
    if (connectionSpeed === 'slow') {
      return <WifiOff className="w-3 h-3 text-gray-400 animate-pulse" />;
    }
    return <Wifi className="w-3 h-3 text-green-500" />;
  };

  // Progressive enhancement: show count if available
  const renderProgressiveContent = () => {
    if (!user) {
      return (
        <p className="text-slate-600 text-sm">
          Nodig 3 vrienden uit om exclusieve voordelen te unlocken.
        </p>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm">Voortgang laden...</p>
        </div>
      );
    }

    if (referralCount !== null) {
      const isFoundingMember = referralCount >= 3;
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {isFoundingMember ? (
              <Crown className="w-4 h-4 text-yellow-500" />
            ) : (
              <div className="w-4 h-4 bg-brandPurple rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{referralCount}</span>
              </div>
            )}
            <span className="text-sm font-medium text-brandPurple">
              {isFoundingMember ? 'Founding Member!' : `${referralCount}/3 referrals`}
            </span>
          </div>
          <p className="text-slate-600 text-sm">
            {isFoundingMember 
              ? 'Je hebt alle exclusieve voordelen unlocked!' 
              : `Nog ${3 - referralCount} vrienden nodig voor Founding Member status.`
            }
          </p>
        </div>
      );
    }

    return (
      <p className="text-slate-600 text-sm">
        Nodig 3 vrienden uit om exclusieve voordelen te unlocken.
      </p>
    );
  };

  return (
    <section className={`max-w-4xl mx-auto ${className}`} aria-labelledby="founders-teaser-heading">
      <div 
        className="bg-white shadow-md rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 hover:shadow-lg"
        onMouseEnter={handleHoverStart}
        onMouseEnter={handleHoverStart}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-brandPurple to-purple-600 rounded-full flex items-center justify-center shadow-lg relative">
            <Rocket className="w-8 h-8 text-white" />
            {/* Connection indicator */}
            <div className="absolute -top-1 -right-1">
              {getLoadingIndicator()}
            </div>
            {/* Connection indicator */}
            <div className="absolute -top-1 -right-1">
              {getLoadingIndicator()}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="mb-3">
            <h3 id="founders-teaser-heading" className="text-xl font-semibold text-gray-900 mb-2">
              {user && referralCount !== null && referralCount >= 3 
                ? 'FitFi Founding Member' 
                : 'Word FitFi Founding Member'
              }
            </h3>
            {renderProgressiveContent()}
          </div>
          
          {/* Benefits Preview */}
          <div className="flex items-center justify-center md:justify-start space-x-4 mt-3 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <Crown className="w-3 h-3 text-brandPurple" />
              <span>Exclusieve badge</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-brandPurple" />
              <span>Community events</span>
            </div>
            {isPrefetching && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-brandPurple border-t-transparent rounded-full animate-spin"></div>
                <span>Prefetching...</span>
              </div>
            )}
            {isPrefetching && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-brandPurple border-t-transparent rounded-full animate-spin"></div>
                <span>Prefetching...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* CTA */}
        <div className="flex-shrink-0">
          <Button 
            as={Link} 
            to="/dashboard" 
            variant={user && referralCount !== null && referralCount >= 3 ? "primary" : "outline"}
            className={`transition-all duration-300 ${
              user && referralCount !== null && referralCount >= 3
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:shadow-lg"
                : "border-brandPurple text-brandPurple hover:bg-brandPurple hover:text-white"
            }`}
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            {user && referralCount !== null && referralCount >= 3 
              ? 'Beheer voordelen' 
              : 'Bekijk voortgang'
            }
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FoundersBlockTeaser;