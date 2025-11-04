/*
  # Restore Admin Policies for mood_photos Table
  
  1. Problem
    - Admin policies were dropped but not recreated
    - INSERT/UPDATE/DELETE fail for admins
    
  2. Solution
    - Recreate all admin policies
    - Use is_current_user_admin() function
*/

-- Recreate admin policies for mood_photos table
CREATE POLICY "Admins can view all mood photos"
  ON mood_photos FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert mood photos"
  ON mood_photos FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update mood photos"
  ON mood_photos FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete mood photos"
  ON mood_photos FOR DELETE
  TO authenticated
  USING (is_current_user_admin());
