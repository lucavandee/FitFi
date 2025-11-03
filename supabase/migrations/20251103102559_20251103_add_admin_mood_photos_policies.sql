/*
  # Add Admin Policies for Mood Photos

  1. Security Policies
    - Allow admins to UPDATE mood photos (toggle active, change tags)
    - Allow admins to DELETE mood photos
    - Allow admins to INSERT mood photos (already handled by storage policies)
    
  2. Admin Check
    - Uses profiles.is_admin column
    - Only @fitfi.ai admins can modify
*/

-- Allow admins to UPDATE mood photos
CREATE POLICY "Admins can update mood photos"
ON mood_photos FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to DELETE mood photos
CREATE POLICY "Admins can delete mood photos"
ON mood_photos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to INSERT mood photos
CREATE POLICY "Admins can insert mood photos"
ON mood_photos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
