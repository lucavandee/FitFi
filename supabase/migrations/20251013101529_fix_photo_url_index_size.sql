/*
  # Fix photo_url index causing row size error

  ## Problem
  - `photo_url` column contains base64-encoded images (up to 3.3MB)
  - Index `idx_style_profiles_photo_url` tries to index full value
  - PostgreSQL limit: 8KB per index entry
  - Error: "index row requires 3385328 bytes, maximum size is 8191"

  ## Solution
  - Drop the index on `photo_url` - not needed for queries
  - Photo URLs should be either:
    a) Supabase Storage URLs (short strings)
    b) Removed from index if storing base64

  ## Note
  - This is a quick fix to unblock quiz submissions
  - Recommended: migrate photos to Supabase Storage later
*/

-- Drop the problematic index
DROP INDEX IF EXISTS idx_style_profiles_photo_url;
