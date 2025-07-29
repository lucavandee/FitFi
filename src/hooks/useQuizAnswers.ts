import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { QuizAnswers, QuizSubmission } from '../types/quiz';
import { quizService } from '../services/quizService';

export function useQuizAnswers() {
  const { user } = useUser();
  const [quizData, setQuizData] = useState<QuizSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error submitting quiz answers:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      return false;
    }
  };

  const isQuizCompleted = (): boolean => {
    return !!(quizData?.completed_at);
  };

  return {
    quizData,
    isLoading,
    error,
    submitQuizAnswers,
    isQuizCompleted,
    refetch: fetchQuizAnswers
  };
}