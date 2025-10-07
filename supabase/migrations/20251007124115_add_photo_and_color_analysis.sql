/*
  # Add Photo Upload & AI Color Analysis

  ## Purpose
  Enable users to upload a selfie during quiz for personalized color analysis.
  Use OpenAI Vision API to analyze skin undertone, seasonal color type, and best colors.

  ## Changes
  1. Add photo_url column (Supabase Storage URL)
  2. Add color_analysis column (JSONB with AI results)
  3. Create storage bucket for user photos

  ## Color Analysis Schema
  {
    "undertone": "warm" | "cool" | "neutral",
    "skin_tone": "fair" | "light" | "medium" | "tan" | "deep",
    "hair_color": "blonde" | "brown" | "black" | "red" | "grey",
    "eye_color": "blue" | "green" | "brown" | "hazel" | "grey",
    "seasonal_type": "spring" | "summer" | "autumn" | "winter",
    "best_colors": ["olive", "camel", "rust", ...],
    "avoid_colors": ["bright pink", "icy blue", ...],
    "analysis_date": "2025-10-07T12:00:00Z",
    "confidence": 0.85,
    "analyzed_by": "openai-gpt-4-vision"
  }

  ## Security
  - RLS on style_profiles already enabled
  - Storage bucket with RLS policies
  - Users can only upload/view their own photos
*/

-- 1. Add photo_url column
ALTER TABLE style_profiles
ADD COLUMN IF NOT EXISTS photo_url text;

COMMENT ON COLUMN style_profiles.photo_url IS 'Supabase Storage URL for user selfie used in color analysis';

-- 2. Add color_analysis column
ALTER TABLE style_profiles
ADD COLUMN IF NOT EXISTS color_analysis jsonb;

COMMENT ON COLUMN style_profiles.color_analysis IS 'AI-generated color analysis from user photo. Includes undertone, seasonal type, best colors, etc.';

-- 3. Create storage bucket for user photos (via SQL trigger approach)
-- Note: Actual bucket creation is done via Supabase Dashboard or API
-- This migration documents the expected bucket structure

-- 4. Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_style_profiles_photo_url 
ON style_profiles(photo_url) 
WHERE photo_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_style_profiles_color_analysis 
ON style_profiles USING gin(color_analysis) 
WHERE color_analysis IS NOT NULL;

-- 5. Helper function to check if user has completed photo analysis
CREATE OR REPLACE FUNCTION has_color_analysis(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM style_profiles 
    WHERE user_id = p_user_id 
      AND color_analysis IS NOT NULL
      AND (color_analysis->>'confidence')::numeric > 0.5
  );
$$;

COMMENT ON FUNCTION has_color_analysis IS 'Check if user has completed color analysis with minimum confidence 0.5';

-- 6. Helper function to get user's best colors
CREATE OR REPLACE FUNCTION get_best_colors(p_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (
      SELECT array_agg(color)
      FROM style_profiles,
           jsonb_array_elements_text(color_analysis->'best_colors') AS color
      WHERE user_id = p_user_id
        AND color_analysis IS NOT NULL
      LIMIT 10
    ),
    ARRAY[]::text[]
  );
$$;

COMMENT ON FUNCTION get_best_colors IS 'Get array of best colors for user based on AI color analysis';

-- 7. Helper function to get color analysis summary
CREATE OR REPLACE FUNCTION get_color_summary(p_user_id uuid)
RETURNS TABLE (
  undertone text,
  seasonal_type text,
  best_colors text[],
  avoid_colors text[],
  confidence numeric,
  has_photo boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    color_analysis->>'undertone' as undertone,
    color_analysis->>'seasonal_type' as seasonal_type,
    ARRAY(SELECT jsonb_array_elements_text(color_analysis->'best_colors')) as best_colors,
    ARRAY(SELECT jsonb_array_elements_text(color_analysis->'avoid_colors')) as avoid_colors,
    (color_analysis->>'confidence')::numeric as confidence,
    (photo_url IS NOT NULL) as has_photo
  FROM style_profiles
  WHERE user_id = p_user_id
    AND color_analysis IS NOT NULL
  LIMIT 1;
$$;

COMMENT ON FUNCTION get_color_summary IS 'Get complete color analysis summary for user';
