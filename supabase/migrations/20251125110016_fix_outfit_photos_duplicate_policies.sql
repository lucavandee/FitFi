/*
  # Fix Duplicate Outfit Photos Policies

  ## Purpose
  Remove duplicate INSERT policy from outfit-photos bucket.

  ## Changes
  - Drop old "Users can upload own outfit photos" policy
  - Drop old "Users can view own outfit photos" policy  
  - Keep the newer policies with better names
*/

-- Drop old duplicate policies
DROP POLICY IF EXISTS "Users can upload own outfit photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own outfit photos" ON storage.objects;
