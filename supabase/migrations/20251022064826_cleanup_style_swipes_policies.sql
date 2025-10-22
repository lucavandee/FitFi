/*
  # Cleanup Style Swipes RLS Policies
  
  1. Changes
    - Remove duplicate/redundant policies
    - Keep only the public policies that work for both authenticated and anonymous users
    
  2. Security
    - Users can only access their own swipes (via user_id or session_id)
    - Anonymous users use session_id
    - Authenticated users use user_id
*/

-- Drop redundant authenticated-only policies
DROP POLICY IF EXISTS "Users can insert own swipes" ON style_swipes;
DROP POLICY IF EXISTS "Users can view own swipes" ON style_swipes;

-- The remaining public policies handle both authenticated and anonymous users:
-- 1. "Anyone can insert swipes with user_id or session_id"
-- 2. "Anyone can view own swipes via user_id or session_id"
-- 3. "Anyone can update own swipes via user_id or session_id"
-- 4. "Anyone can delete own swipes via user_id or session_id"
