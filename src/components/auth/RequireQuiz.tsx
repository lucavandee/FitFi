import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LS_KEYS } from "@/lib/quiz/types";
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
        setStatus('has_quiz');
        return;
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-border)] border-t-[var(--ff-color-primary-700)] mb-4" aria-hidden="true" />
          <p className="text-[var(--color-muted)]">Je stijlprofiel wordt geladen...</p>
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
