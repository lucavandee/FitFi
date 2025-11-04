/*
  # Remove Temporary Debug Policy
  
  1. Cleanup
    - Remove the temporary permissive policy used for debugging
    - Now using Edge Function with service role instead
*/

DROP POLICY IF EXISTS "TEMP DEBUG: Allow all authenticated uploads" ON storage.objects;
