import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LS_KEYS } from "@/lib/quiz/types";
import { Spinner } from "@/components/ui/Spinner";
import { profileSyncService } from "@/services/data/profileSyncService";
import { useUser } from "@/context/UserContext";

export function RequireQuiz({ children }: { children: React.ReactElement }) {
  const loc = useLocation();
  const { user } = useUser();
  const [status, setStatus] = React.useState<'checking' | 'has_quiz' | 'no_quiz'>('checking');

  React.useEffect(() => {
    async function checkQuizCompletion() {
      const quizCompleted = localStorage.getItem(LS_KEYS.QUIZ_COMPLETED);
      const quizAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      const archetype = localStorage.getItem(LS_KEYS.ARCHETYPE);

      if (quizCompleted === "1" && quizAnswers && archetype) {
        try {
          const parsed = JSON.parse(quizAnswers);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setStatus('has_quiz');
            return;
          }
        } catch {
          // invalid JSON — fall through to Supabase restore
        }
      }

      if (user?.id) {
        try {
          const hasQuiz = await profileSyncService.restoreForUser(user.id);
          if (hasQuiz) {
            setStatus('has_quiz');
            return;
          }
        } catch (_) {}
      }

      setStatus('no_quiz');
    }

    checkQuizCompletion();
  }, [user?.id]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-[#8A8A8A]">Je stijlprofiel wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (status === 'no_quiz') {
    return (
      <Navigate
        to="/onboarding"
        replace
        state={{ from: loc.pathname + loc.search, reason: 'quiz_required' }}
      />
    );
  }

  return children;
}
