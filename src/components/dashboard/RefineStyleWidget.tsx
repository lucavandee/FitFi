import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';

export function RefineStyleWidget() {
  const [skipped, setSkipped] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    loadStatus();
  }, [user]);

  const loadStatus = async () => {
    try {
      const localSkipped = localStorage.getItem('ff_visual_pref_skipped') === 'true';

      if (user) {
        const { getSupabase } = await import('@/lib/supabase');
        const client = getSupabase();

        if (client) {
          const { data: profile } = await client
            .from('style_profiles')
            .select('visual_preference_skipped, visual_preference_completed_at')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profile) {
            setSkipped(profile.visual_preference_skipped || false);
          }

          const { data: swipes } = await client
            .from('style_swipes')
            .select('id')
            .eq('user_id', user.id);

          setSwipeCount(swipes?.length || 0);
        }
      } else {
        setSkipped(localSkipped);

        const sessionId = localStorage.getItem('fitfi_session_id');
        if (sessionId) {
          const { getSupabase } = await import('@/lib/supabase');
          const client = getSupabase();

          if (client) {
            const { data: swipes } = await client
              .from('style_swipes')
              .select('id')
              .eq('session_id', sessionId);

            setSwipeCount(swipes?.length || 0);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load refine style status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefineStyle = () => {
    navigate('/onboarding?step=visual');
  };

  if (loading) {
    return null;
  }

  if (!skipped && swipeCount >= 10) {
    return null;
  }

  const isPartiallyComplete = swipeCount > 0 && swipeCount < 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] rounded-[var(--radius-lg)] p-6 text-white shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">
            {skipped ? 'Verfijn je stijl' : 'Voltooi je stijlprofiel'}
          </h3>
          <p className="text-white/90 text-sm mb-4">
            {skipped
              ? 'Swipe door 10 outfits en laat Nova je stijl leren kennen voor betere aanbevelingen.'
              : isPartiallyComplete
              ? `Je bent al begonnen! Nog ${10 - swipeCount} van 10 swipes te gaan.`
              : 'Begin met swipen om je stijl te verfijnen.'}
          </p>
          <button
            onClick={handleRefineStyle}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--ff-color-primary-700)] rounded-lg font-medium hover:bg-white/90 transition-colors text-sm"
          >
            <span>{isPartiallyComplete ? 'Verder gaan' : 'Start nu'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {isPartiallyComplete && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                <span>Voortgang</span>
                <span>{swipeCount}/10</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${(swipeCount / 10) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
