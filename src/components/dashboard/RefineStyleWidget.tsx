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
      className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-100)]/40 via-transparent to-[var(--ff-color-accent-100)]/30 opacity-60" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)] flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>

          <div className="flex-1">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl font-bold text-[var(--color-text)] mb-1.5"
            >
              {skipped ? 'Verfijn je stijl' : 'Voltooi je stijlprofiel'}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--color-muted)] text-sm leading-relaxed mb-5"
            >
              {skipped
                ? 'Swipe door 10 outfits en laat Nova je stijl leren kennen voor betere aanbevelingen.'
                : isPartiallyComplete
                ? `Je bent al begonnen! Nog ${10 - swipeCount} van 10 swipes te gaan.`
                : 'Begin met swipen om je stijl te verfijnen.'}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={handleRefineStyle}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:from-[var(--ff-color-primary-700)] hover:to-[var(--ff-color-primary-800)] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
            >
              <span>{isPartiallyComplete ? 'Verder gaan' : 'Start nu'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {isPartiallyComplete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.3 }}
                className="mt-5 pt-4 border-t border-[var(--color-border)]"
              >
                <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text)] mb-2">
                  <span>Voortgang</span>
                  <span className="text-[var(--ff-color-primary-700)]">{swipeCount}/10</span>
                </div>
                <div className="h-2 bg-[var(--ff-color-primary-100)] rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(swipeCount / 10) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
