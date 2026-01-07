/*
  # Fix Critical Session ID IDOR Vulnerabilities

  1. Security Fixes
    - Remove dangerous session_id IDOR policies from style_profiles
    - Remove dangerous session_id IDOR policies from style_swipes
    - Add proper authenticated-only access patterns

  2. Changes
    - style_profiles: Require authentication OR proper session ownership validation
    - style_swipes: Require authentication OR proper session ownership validation

  3. Security Impact
    - Prevents IDOR attacks where users can access other users' data by guessing session IDs
    - Anonymous users can still INSERT their own data during onboarding
    - Reading requires authentication to prevent cross-user data leaks
*/

-- ============================================================================
-- 1. FIX: style_profiles SESSION_ID IDOR
-- ============================================================================

-- Drop ALL dangerous policies that allow reading by session_id only
DROP POLICY IF EXISTS "Anonymous users read by session" ON style_profiles;
DROP POLICY IF EXISTS "Anyone can view own style profiles" ON style_profiles;
DROP POLICY IF EXISTS "Anyone can update own style profiles" ON style_profiles;

-- Keep authenticated read (this is already secure)
-- Policy "Users can read own profiles" already exists with proper auth.uid() check

-- Anonymous can still INSERT (for onboarding flow)
-- Policy "Anonymous users insert with session" already exists

-- Add secure UPDATE policy for authenticated users only
DROP POLICY IF EXISTS "Authenticated users update own profiles" ON style_profiles;

CREATE POLICY "Authenticated users update own profiles"
  ON style_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 2. FIX: style_swipes SESSION_ID IDOR
-- ============================================================================

-- Drop ALL dangerous policies that allow reading by session_id only
DROP POLICY IF EXISTS "Anyone can view own swipes via user_id or session_id" ON style_swipes;
DROP POLICY IF EXISTS "Anyone can update own swipes via user_id or session_id" ON style_swipes;
DROP POLICY IF EXISTS "Anyone can delete own swipes via user_id or session_id" ON style_swipes;

-- Keep authenticated read (this is already secure)
-- Policy "Users can view own swipes" already exists with proper auth.uid() check

-- Anonymous can still INSERT (for onboarding)
-- Policy "Anyone can insert swipes with user_id or session_id" already exists

-- Add secure UPDATE policy for authenticated users only
DROP POLICY IF EXISTS "Authenticated users update own swipes" ON style_swipes;

CREATE POLICY "Authenticated users update own swipes"
  ON style_swipes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add secure DELETE policy for authenticated users only
DROP POLICY IF EXISTS "Authenticated users delete own swipes" ON style_swipes;

CREATE POLICY "Authenticated users delete own swipes"
  ON style_swipes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 3. VERIFY: customer_subscriptions (already secure)
-- ============================================================================

-- Verify no anonymous INSERT exists (should be authenticated only)
-- Current policies are already secure with auth.uid() checks

-- ============================================================================
-- 4. Add indexes for performance on user_id lookups
-- ============================================================================

-- Index for style_profiles user lookups
CREATE INDEX IF NOT EXISTS idx_style_profiles_user_id
  ON style_profiles(user_id)
  WHERE user_id IS NOT NULL;

-- Index for style_swipes user lookups
CREATE INDEX IF NOT EXISTS idx_style_swipes_user_id
  ON style_swipes(user_id)
  WHERE user_id IS NOT NULL;

-- ============================================================================
-- 5. SECURITY DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE style_profiles IS
  'SECURITY: RLS enabled. Users can only read their own profile via auth.uid(). Anonymous users can INSERT during onboarding but cannot read others to prevent IDOR attacks.';

COMMENT ON TABLE style_swipes IS
  'SECURITY: RLS enabled. Users can only read their own swipes via auth.uid(). Anonymous INSERT allowed for onboarding flow but read/update/delete requires authentication.';

COMMENT ON TABLE customer_subscriptions IS
  'SECURITY: RLS enabled. Only authenticated users can create and manage subscriptions. All operations require auth.uid() ownership validation.';
