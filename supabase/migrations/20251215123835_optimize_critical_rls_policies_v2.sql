/*
  # Optimize Critical RLS Policies (Corrected)

  ## Overview
  This migration optimizes the most critical RLS policies by wrapping auth.uid() in a SELECT statement.
  
  ### Why This Matters
  When RLS policies call auth.uid() directly, Postgres re-evaluates the function for EVERY row.
  Using (select auth.uid()) evaluates it once and caches the result.
  
  At scale, this can be the difference between:
  - 100ms query time (optimized)
  - 10+ seconds query time (unoptimized)

  ## Tables Optimized
  1. profiles - Uses id column (foreign key to auth.users)
  2. saved_outfits - Uses user_id column
  3. quiz_answers - Uses user_id column
  4. user_gamification - Uses user_id column

  ## Pattern
  Before: auth.uid() = column
  After: (select auth.uid()) = column
*/

-- =====================================================
-- PROFILES TABLE (uses id, not user_id)
-- =====================================================

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view own admin status" ON profiles;
CREATE POLICY "Users can view own admin status"
ON profiles FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

-- =====================================================
-- SAVED_OUTFITS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read own saved outfits" ON saved_outfits;
CREATE POLICY "Users can read own saved outfits"
ON saved_outfits FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own saved outfits" ON saved_outfits;
CREATE POLICY "Users can insert own saved outfits"
ON saved_outfits FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own saved outfits" ON saved_outfits;
CREATE POLICY "Users can delete own saved outfits"
ON saved_outfits FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- QUIZ_ANSWERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read own quiz answers" ON quiz_answers;
CREATE POLICY "Users can read own quiz answers"
ON quiz_answers FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz answers" ON quiz_answers;
CREATE POLICY "Users can insert own quiz answers"
ON quiz_answers FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own quiz answers" ON quiz_answers;
CREATE POLICY "Users can update own quiz answers"
ON quiz_answers FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- USER_GAMIFICATION TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read own gamification data" ON user_gamification;
CREATE POLICY "Users can read own gamification data"
ON user_gamification FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own gamification data" ON user_gamification;
CREATE POLICY "Users can insert own gamification data"
ON user_gamification FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own gamification data" ON user_gamification;
CREATE POLICY "Users can update own gamification data"
ON user_gamification FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own gamification data" ON user_gamification;
CREATE POLICY "Users can delete own gamification data"
ON user_gamification FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- STYLE_PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profiles" ON style_profiles;
CREATE POLICY "Users can read own profiles"
ON style_profiles FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profiles" ON style_profiles;
CREATE POLICY "Users can insert own profiles"
ON style_profiles FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profiles" ON style_profiles;
CREATE POLICY "Users can update own profiles"
ON style_profiles FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- STYLE_PREFERENCES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read own style preferences" ON style_preferences;
CREATE POLICY "Users can read own style preferences"
ON style_preferences FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own style preferences" ON style_preferences;
CREATE POLICY "Users can insert own style preferences"
ON style_preferences FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own style preferences" ON style_preferences;
CREATE POLICY "Users can update own style preferences"
ON style_preferences FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);
