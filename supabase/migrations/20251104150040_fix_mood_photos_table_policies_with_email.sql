/*
  # Fix mood_photos Table Policies with Email Check
  
  1. Problem
    - Table policies use JWT app_metadata check
    - For consistency and reliability, use email check
    
  2. Solution
    - Replace all JWT checks with email-based admin check
    - Same pattern as storage policies
    
  3. Changes
    - Update all admin policies to use email check
*/

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can insert mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can update mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON mood_photos;

-- Recreate with email-based check
CREATE POLICY "Admins can view all mood photos"
  ON mood_photos FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
  );

CREATE POLICY "Admins can insert mood photos"
  ON mood_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
  );

CREATE POLICY "Admins can update mood photos"
  ON mood_photos FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
  );

CREATE POLICY "Admins can delete mood photos"
  ON mood_photos FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
  );
