/*
  # Fix Storage Policies with Email Check
  
  1. Problem
    - JWT app_metadata check doesn't work reliably in storage policies
    - Brams Fruit policies use email check successfully
    
  2. Solution
    - Use same approach as Brams Fruit: check if email ends with @fitfi.ai
    - This is reliable because auth.uid() and email query work in storage context
    
  3. Changes
    - Replace JWT check with email-based admin check
    - Same pattern proven to work in brams-fruit policies
*/

-- Drop existing mood-photos storage policies
DROP POLICY IF EXISTS "Admins can upload to mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update mood photos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from mood photos storage" ON storage.objects;

-- Recreate with email-based check (same as brams-fruit)
CREATE POLICY "Admins can upload to mood photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mood-photos'
  AND (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
);

CREATE POLICY "Admins can update mood photos storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
)
WITH CHECK (
  bucket_id = 'mood-photos'
  AND (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
);

CREATE POLICY "Admins can delete from mood photos storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND (SELECT email FROM auth.users WHERE id = auth.uid())::text LIKE '%@fitfi.ai'
);
