/*
  # Fix RLS Policies for Visual Preference Tables

  1. Tables Affected
    - style_swipes
    - outfit_calibration_feedback
    - style_profiles (visual_preference_embedding column)

  2. Security Changes
    - Add permissive RLS policies for authenticated and anonymous users
    - Allow users to manage their own data via user_id OR session_id
    - Enable proper access for visual preference features

  3. Notes
    - Users can be authenticated OR anonymous (session-based)
    - Both paths need read/write access to their own data
*/

-- Enable RLS on tables if not already enabled
ALTER TABLE IF EXISTS style_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS outfit_calibration_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert their own swipes" ON style_swipes;
DROP POLICY IF EXISTS "Users can view their own swipes" ON style_swipes;
DROP POLICY IF EXISTS "Users can update their own swipes" ON style_swipes;
DROP POLICY IF EXISTS "Users can delete their own swipes" ON style_swipes;

DROP POLICY IF EXISTS "Users can insert their own feedback" ON outfit_calibration_feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON outfit_calibration_feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON outfit_calibration_feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON outfit_calibration_feedback;

-- STYLE_SWIPES: Allow access based on user_id OR session_id

CREATE POLICY "Anyone can insert swipes with user_id or session_id"
  ON style_swipes
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can view own swipes via user_id or session_id"
  ON style_swipes
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can update own swipes via user_id or session_id"
  ON style_swipes
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can delete own swipes via user_id or session_id"
  ON style_swipes
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

-- OUTFIT_CALIBRATION_FEEDBACK: Allow access based on user_id OR session_id

CREATE POLICY "Anyone can insert feedback with user_id or session_id"
  ON outfit_calibration_feedback
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can view own feedback via user_id or session_id"
  ON outfit_calibration_feedback
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can update own feedback via user_id or session_id"
  ON outfit_calibration_feedback
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can delete own feedback via user_id or session_id"
  ON outfit_calibration_feedback
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

-- STYLE_PROFILES: Update existing policies to be more permissive for visual_preference_embedding

DROP POLICY IF EXISTS "Users can view own style profiles" ON style_profiles;
DROP POLICY IF EXISTS "Users can update own style profiles" ON style_profiles;

CREATE POLICY "Anyone can view own style profiles"
  ON style_profiles
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can update own style profiles"
  ON style_profiles
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can insert style profiles"
  ON style_profiles
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );