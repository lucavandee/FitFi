/*
  # Fix mood_photos authenticated SELECT policy

  ## Problem
  The existing "Users can view appropriate mood photos" policy for authenticated users
  filters by matching the user's gender in the profiles table using an exact match.
  This causes:
  1. Users without a profile yet see zero photos
  2. Users with non-binary/prefer-not-to-say gender see zero photos (no matching DB rows)
  3. The gender filter in the application code already handles which photos to show

  ## Fix
  Replace the restrictive gender-based policy with a simple policy that allows
  all authenticated users to view active mood photos. The gender filtering is
  handled at the application query level, not at the RLS level.
*/

DROP POLICY IF EXISTS "Users can view appropriate mood photos" ON public.mood_photos;

CREATE POLICY "Authenticated users can view active mood photos"
  ON public.mood_photos
  FOR SELECT
  TO authenticated
  USING (active = true);
