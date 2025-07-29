import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { QuizAnswers, QuizSubmission } from '../types/quiz';

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
      const { data, error } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

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
      const { data, error } = await supabase
        .from('quiz_answers')
        .upsert({
          user_id: user.id,
          answers: answers,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setQuizData(data);
      return true;
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