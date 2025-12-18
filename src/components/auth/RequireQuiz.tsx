import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LS_KEYS } from "@/lib/quiz/types";
import { profileSyncService } from "@/services/data/profileSyncService";

/**
 * Route-guard die checkt of de gebruiker de quiz heeft voltooid.
 * Laadt eerst data uit Supabase als localStorage leeg is.
 *
 * Flow:
 * 1. Check localStorage voor quiz data
 * 2. Zo niet, probeer te laden uit Supabase (voor ingelogde gebruikers)
 * 3. Als écht geen data → redirect naar /onboarding
 * 4. Als data aanwezig → laat pagina laden
 */
export function RequireQuiz({ children }: { children: React.ReactElement }) {
  const loc = useLocation();
  const [status, setStatus] = React.useState<'checking' | 'has_quiz' | 'no_quiz'>('checking');

  React.useEffect(() => {
    async function checkQuizCompletion() {
      console.log('[RequireQuiz] 🔍 Checking quiz completion...');

      // 1. Check localStorage first (snelste check)
      const quizCompleted = localStorage.getItem(LS_KEYS.QUIZ_COMPLETED);
      const quizAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      const archetype = localStorage.getItem(LS_KEYS.ARCHETYPE);

      console.log('[RequireQuiz] localStorage check:', {
        quizCompleted,
        hasQuizAnswers: !!quizAnswers,
        hasArchetype: !!archetype,
        answersLength: quizAnswers?.length || 0
      });

      if (quizCompleted === "1" && quizAnswers && archetype) {
        console.log('✅ [RequireQuiz] Quiz data found in localStorage');
        setStatus('has_quiz');
        return;
      }

      // 2. Try to load from Supabase (voor ingelogde users of session-based)
      console.log('🔄 [RequireQuiz] No complete localStorage data, checking Supabase...');

      try {
        const profile = await profileSyncService.getProfile();

        console.log('[RequireQuiz] Profile fetch result:', {
          hasProfile: !!profile,
          hasQuizAnswers: !!profile?.quiz_answers,
          hasCompletedAt: !!profile?.completed_at,
          archetype: profile?.archetype
        });

        if (profile && profile.quiz_answers && profile.completed_at) {
          console.log('✅ [RequireQuiz] Quiz data loaded from Supabase');

          // Double check that localStorage was populated
          const verifyQuizCompleted = localStorage.getItem(LS_KEYS.QUIZ_COMPLETED);
          const verifyQuizAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);

          console.log('[RequireQuiz] Verifying localStorage after fetch:', {
            quizCompleted: verifyQuizCompleted,
            hasQuizAnswers: !!verifyQuizAnswers
          });

          if (verifyQuizCompleted !== "1") {
            console.warn('[RequireQuiz] ⚠️ Quiz data was fetched but localStorage not populated correctly');
            // Force cache
            localStorage.setItem(LS_KEYS.QUIZ_COMPLETED, "1");
          }

          setStatus('has_quiz');
          return;
        } else {
          console.warn('[RequireQuiz] ⚠️ Profile exists but incomplete:', {
            hasProfile: !!profile,
            hasQuizAnswers: !!profile?.quiz_answers,
            hasCompletedAt: !!profile?.completed_at
          });
        }
      } catch (error) {
        console.error('[RequireQuiz] ❌ Error loading profile:', error);
      }

      // 3. No quiz data found anywhere
      console.warn('🚫 [RequireQuiz] No quiz data found, redirecting to onboarding');
      setStatus('no_quiz');
    }

    checkQuizCompletion();
  }, []);

  // Show loading state while checking
  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ff-color-primary-700)] mb-4"></div>
          <p className="text-[var(--color-text-light)]">Je stijlprofiel wordt geladen...</p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if no quiz data
  if (status === 'no_quiz') {
    console.log('🚫 [RequireQuiz] Redirecting to onboarding from:', loc.pathname);
    return (
      <Navigate
        to="/onboarding"
        replace
        state={{
          from: loc.pathname + loc.search,
          reason: 'quiz_required'
        }}
      />
    );
  }

  // Quiz is completed, show the page
  return children;
}
