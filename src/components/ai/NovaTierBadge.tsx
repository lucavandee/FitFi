import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';

interface NovaTierBadgeProps {
  className?: string;
}

export default function NovaTierBadge({ className = '' }: NovaTierBadgeProps) {
  const { user } = useUser();
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);
  const [tier, setTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function fetchUsage() {
      try {
        // Get tier and usage from Supabase
        const { data: accessData, error } = await supabase
          .rpc('can_use_nova', { p_user_id: user!.id });

        if (error) {
          console.warn('[NovaTierBadge] Error fetching usage:', error);
          setLoading(false);
          return;
        }

        if (accessData && accessData.length > 0) {
          const info = accessData[0];
          setTier(info.tier || 'free');
          setUsage({
            current: info.current_count || 0,
            limit: info.tier_limit || 10
          });
        }
      } catch (e) {
        console.error('[NovaTierBadge] Failed to fetch usage:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();

    // Refresh every 30 seconds while chat is open
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading || !user) return null;

  // Don't show for founder (unlimited)
  if (tier === 'founder') {
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white ${className}`}>
        <span className="text-xs font-semibold">✨ Founder</span>
      </div>
    );
  }

  if (!usage) return null;

  const percentage = (usage.current / usage.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = usage.current >= usage.limit;

  // Color based on usage
  let bgColor = 'bg-[var(--ff-color-primary-100)]';
  let textColor = 'text-[var(--ff-color-primary-700)]';
  let barColor = 'bg-[var(--ff-color-primary-600)]';

  if (isAtLimit) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
    barColor = 'bg-red-600';
  } else if (isNearLimit) {
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-700';
    barColor = 'bg-orange-600';
  }

  const tierLabel = tier === 'premium' ? 'Premium' : 'Free';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Tier label + count */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor}`}>
        <span className={`text-xs font-semibold ${textColor}`}>
          {tierLabel}
        </span>
        <span className={`text-xs ${textColor}`}>
          {usage.current}/{usage.limit}
        </span>
      </div>

      {/* Mini progress bar */}
      {percentage > 0 && (
        <div className="hidden sm:flex items-center w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
