/*
  # TEMPORARY DEBUG: Allow All Authenticated Uploads
  
  1. Purpose
    - Temporarily allow ALL authenticated users to upload to mood-photos
    - This will help us determine if the issue is with the admin check itself
    
  2. What This Does
    - Adds a permissive policy that allows any authenticated user to upload
    - Keep existing policies in place
    
  3. IMPORTANT
    - This is for debugging ONLY
    - Remove this policy after testing
*/

-- Add temporary permissive policy for debugging
CREATE POLICY "TEMP DEBUG: Allow all authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mood-photos');
