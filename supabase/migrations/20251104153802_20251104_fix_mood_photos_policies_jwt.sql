/*
  # Fix mood_photos RLS policies to use JWT instead of auth.users
  
  1. Problem
    - Current policies query auth.users table directly
    - RLS denies access to auth.users from policies
    - Error: "permission denied for table users"
  
  2. Solution
    - Use auth.jwt() to read email from JWT token
    - JWT contains email claim that's always accessible
    - No database query needed
  
  3. Changes
    - Replace all auth.users queries with auth.jwt()
    - Use ->> 'email' to extract email from JWT
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can view all mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can insert mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can update mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON mood_photos;

-- Public can view active mood photos (no auth required)
CREATE POLICY "Public can view active mood photos"
  ON mood_photos FOR SELECT
  TO public
  USING (active = true);

-- Admin policies using JWT email claim
CREATE POLICY "Admins can view all mood photos"
  ON mood_photos FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email')::text LIKE '%@fitfi.ai'
  );

CREATE POLICY "Admins can insert mood photos"
  ON mood_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email')::text LIKE '%@fitfi.ai'
  );

CREATE POLICY "Admins can update mood photos"
  ON mood_photos FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email')::text LIKE '%@fitfi.ai'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email')::text LIKE '%@fitfi.ai'
  );

CREATE POLICY "Admins can delete mood photos"
  ON mood_photos FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email')::text LIKE '%@fitfi.ai'
  );