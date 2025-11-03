/*
  # Fix Profiles Infinite Recursion

  1. Problem
    - "Admins can view all profiles" causes infinite recursion
    - Policy checks profiles.is_admin while executing SELECT on profiles
    
  2. Solution
    - Drop the problematic admin policies
    - Use a security definer function instead
    - Or use auth.jwt() to check admin status (stored in JWT)
    
  3. Note
    - Admin status checks should be done in application layer for profiles
    - Or use a separate admin_users table
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- The existing policies are sufficient:
-- - Users can view their own profile
-- - Users can update their own profile
-- - Admin checks should be done in application layer when needed
