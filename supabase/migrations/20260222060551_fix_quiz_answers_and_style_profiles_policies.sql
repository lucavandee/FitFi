/*
  # Fix quiz_answers and style_profiles RLS policy conflicts

  ## Problems
  1. quiz_answers: Duplicate INSERT policies + UPDATE policy without WITH CHECK
     causes 409 conflict errors on upsert operations
  2. style_profiles: Three overlapping INSERT policies + two duplicate UPDATE
     policies cause 500 server errors on SELECT

  ## Changes
  - quiz_answers: Remove duplicate policies, fix UPDATE to include WITH CHECK
  - style_profiles: Remove duplicate/conflicting INSERT and UPDATE policies,
    keep one clean policy per operation
*/

-- ─── quiz_answers: remove duplicate policies ───────────────────────────────

DROP POLICY IF EXISTS "Users can insert own quiz answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "Users can update own quiz answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_insert_own" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_update_own" ON public.quiz_answers;

CREATE POLICY "quiz_answers insert own"
  ON public.quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "quiz_answers update own"
  ON public.quiz_answers FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ─── style_profiles: remove duplicate/conflicting policies ─────────────────

DROP POLICY IF EXISTS "Anyone can insert style profiles" ON public.style_profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.style_profiles;
DROP POLICY IF EXISTS "Authenticated users update own profiles" ON public.style_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.style_profiles;

CREATE POLICY "style_profiles insert authenticated"
  ON public.style_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "style_profiles insert anonymous"
  ON public.style_profiles FOR INSERT
  TO anon
  WITH CHECK ((user_id IS NULL) AND (session_id IS NOT NULL));

CREATE POLICY "style_profiles update own"
  ON public.style_profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
