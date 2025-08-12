import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { QuizAnswers, QuizSubmission } from '../types/quiz';
import { quizService } from '../services/quizService';

// Get singleton client
const sb = supabase();

export function useQuizAnswers() {
  const { user } = useUser();
  const [quizData, setQuizData] = useState<QuizSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    fetchQuizAnswers();
  }, [user?.id]);

  const fetchQuizAnswers = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await quizService.getUserAnswers(user.id);
      setQuizData(data);
    } catch (err) {
      console.error('Error fetching quiz answers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz data');
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuizAnswers = async (answers: QuizAnswers): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      const success = await quizService.submitAnswers(user.id, answers);
      
      if (success) {
        // Update local state
        setQuizData({
          id: 'local-' + user.id,
          user_id: user.id,
          answers: answers,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setError(null);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error submitting quiz answers:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      return false;
    }
  };

  const resetQuiz = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    if (!sb) {
      setError('Supabase not available');
      return false;
    }

    setIsResetting(true);
    setError(null);

    try {
      const { data, error } = await sb.functions.invoke('reset-quiz', {
        headers: {
          Authorization: `Bearer ${(await sb.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        console.error('Quiz reset error:', error);
        setError('Kan quiz niet resetten. Probeer opnieuw.');
        return false;
      }

      // Clear local state
      setQuizData(null);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Quiz reset error:', err);
      setError('Er ging iets mis bij het resetten van de quiz.');
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  const isQuizCompleted = (): boolean => {
    return !!(quizData?.completed_at);
  };

  return {
    quizData,
    isLoading,
    isResetting,
    error,
    submitQuizAnswers,
    resetQuiz,
    isQuizCompleted,
    refetch: fetchQuizAnswers
  };
}