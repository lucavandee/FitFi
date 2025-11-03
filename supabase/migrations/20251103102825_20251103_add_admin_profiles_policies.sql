/*
  # Add Admin Policies for Profiles

  1. Security Policies
    - Allow admins to view ALL profiles (for user management)
    - Allow admins to update ANY profile (for tier changes, admin status)
    
  2. Existing Policies
    - Users can still view/update their own profiles
    - New admin policies work alongside existing ones
*/

-- Allow admins to view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
);

-- Allow admins to update ANY profile
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
);
