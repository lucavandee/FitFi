/*
  # Add Color Intelligence to Style Profiles

  1. Schema Changes
    - Add `color_advice` JSONB column to `style_profiles`
    - Add `preferred_occasions` array column
    - Add `budget_range` JSONB column
    - Add `sizes` JSONB column for tops/bottoms/shoes

  2. Functions
    - `compute_color_advice()` - Generates color palette based on undertone + archetype
    - `extract_undertone()` - Extracts undertone from quiz answers

  3. Purpose
    Enable Nova to provide personalized color advice and context-aware recommendations
*/

-- Add new columns to style_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'color_advice'
  ) THEN
    ALTER TABLE style_profiles
    ADD COLUMN color_advice JSONB DEFAULT '{
      "undertone": "neutral",
      "palette": ["black","white","grey","navy","camel"],
      "avoid": [],
      "complementary": [],
      "confidence": 0.5
    }'::JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'preferred_occasions'
  ) THEN
    ALTER TABLE style_profiles
    ADD COLUMN preferred_occasions TEXT[] DEFAULT ARRAY['casual','work']::TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'budget_range'
  ) THEN
    ALTER TABLE style_profiles
    ADD COLUMN budget_range JSONB DEFAULT '{"min": 50, "max": 150}'::JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'sizes'
  ) THEN
    ALTER TABLE style_profiles
    ADD COLUMN sizes JSONB DEFAULT '{
      "tops": "M",
      "bottoms": "31",
      "shoes": "42"
    }'::JSONB;
  END IF;
END $$;

-- Function: Extract undertone from quiz answers
CREATE OR REPLACE FUNCTION extract_undertone(quiz_data JSONB)
RETURNS TEXT AS $$
DECLARE
  undertone TEXT;
  skin_tone TEXT;
BEGIN
  -- Try to extract from quiz answers
  undertone := quiz_data->>'skin_undertone';

  IF undertone IS NOT NULL THEN
    RETURN undertone;
  END IF;

  -- Fallback: infer from other answers
  skin_tone := quiz_data->>'skin_tone';

  IF skin_tone IN ('light', 'fair') THEN
    RETURN 'cool';
  ELSIF skin_tone IN ('tan', 'olive', 'dark') THEN
    RETURN 'warm';
  ELSE
    RETURN 'neutral';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Compute color advice based on undertone and archetype
CREATE OR REPLACE FUNCTION compute_color_advice(
  quiz_data JSONB,
  user_archetype TEXT
)
RETURNS JSONB AS $$
DECLARE
  undertone TEXT;
  palette JSONB;
  avoid JSONB;
  complementary JSONB;
  confidence NUMERIC;
BEGIN
  -- Extract undertone
  undertone := extract_undertone(quiz_data);
  confidence := 0.85;

  -- Build palette based on undertone
  IF undertone = 'warm' THEN
    palette := '["camel","terracotta","cream","olive","rust","mustard","warm grey","cognac"]'::JSONB;
    avoid := '["ice blue","pure white","fuchsia","neon colors","cool grey"]'::JSONB;
    complementary := '[["camel","olive"],["terracotta","cream"],["rust","warm grey"]]'::JSONB;

  ELSIF undertone = 'cool' THEN
    palette := '["navy","charcoal","ice blue","silver","burgundy","emerald","cool grey","slate"]'::JSONB;
    avoid := '["orange","terracotta","warm yellow","peach","warm brown"]'::JSONB;
    complementary := '[["navy","ice blue"],["charcoal","silver"],["burgundy","emerald"]]'::JSONB;

  ELSE
    -- Neutral undertone - most versatile
    palette := '["black","white","grey","navy","camel","burgundy","olive","charcoal"]'::JSONB;
    avoid := '["extreme neons","overly bright colors"]'::JSONB;
    complementary := '[["black","white"],["navy","camel"],["charcoal","cream"]]'::JSONB;
  END IF;

  -- Adjust palette based on archetype
  IF user_archetype = 'klassiek' THEN
    -- Klassiek: focus on timeless, muted tones
    palette := (
      SELECT jsonb_agg(color)
      FROM jsonb_array_elements_text(palette) AS color
      WHERE color IN ('navy','charcoal','camel','burgundy','grey','black','white','cream')
    );
    confidence := confidence + 0.05;

  ELSIF user_archetype = 'minimal' THEN
    -- Minimal: monochromatic palette
    palette := '["black","white","grey","cream","charcoal","navy"]'::JSONB;
    confidence := confidence + 0.1;

  ELSIF user_archetype = 'casual_chic' THEN
    -- Casual Chic: allow more variety and accents
    confidence := confidence + 0.05;
  END IF;

  RETURN jsonb_build_object(
    'undertone', undertone,
    'palette', palette,
    'avoid', avoid,
    'complementary', complementary,
    'confidence', LEAST(confidence, 1.0)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing style_profiles with computed color advice
UPDATE style_profiles
SET
  color_advice = compute_color_advice(quiz_answers, archetype),
  preferred_occasions = CASE
    WHEN quiz_answers->'occasions' IS NOT NULL THEN
      ARRAY(SELECT jsonb_array_elements_text(quiz_answers->'occasions'))
    ELSE
      ARRAY['casual','work']::TEXT[]
  END,
  budget_range = COALESCE(
    quiz_answers->'budget',
    '{"min": 50, "max": 150}'::JSONB
  ),
  sizes = COALESCE(
    jsonb_build_object(
      'tops', COALESCE(quiz_answers->>'size_top', 'M'),
      'bottoms', COALESCE(quiz_answers->>'size_bottom', '31'),
      'shoes', COALESCE(quiz_answers->>'size_shoes', '42')
    ),
    '{"tops": "M", "bottoms": "31", "shoes": "42"}'::JSONB
  )
WHERE color_advice IS NULL OR color_advice = '{}'::JSONB;

-- Create index for faster color advice lookups
CREATE INDEX IF NOT EXISTS style_profiles_color_advice_idx ON style_profiles USING gin(color_advice);

-- Add trigger to auto-compute color advice on insert/update
CREATE OR REPLACE FUNCTION auto_compute_color_advice()
RETURNS TRIGGER AS $$
BEGIN
  -- Only compute if quiz_answers exist and color_advice is not set
  IF NEW.quiz_answers IS NOT NULL AND (NEW.color_advice IS NULL OR NEW.color_advice = '{}'::JSONB) THEN
    NEW.color_advice := compute_color_advice(NEW.quiz_answers, NEW.archetype);
  END IF;

  -- Extract occasions from quiz
  IF NEW.quiz_answers IS NOT NULL THEN
    NEW.preferred_occasions := CASE
      WHEN NEW.quiz_answers->'occasions' IS NOT NULL THEN
        ARRAY(SELECT jsonb_array_elements_text(NEW.quiz_answers->'occasions'))
      ELSE
        ARRAY['casual','work']::TEXT[]
    END;

    NEW.budget_range := COALESCE(
      NEW.quiz_answers->'budget',
      '{"min": 50, "max": 150}'::JSONB
    );

    NEW.sizes := COALESCE(
      jsonb_build_object(
        'tops', COALESCE(NEW.quiz_answers->>'size_top', 'M'),
        'bottoms', COALESCE(NEW.quiz_answers->>'size_bottom', '31'),
        'shoes', COALESCE(NEW.quiz_answers->>'size_shoes', '42')
      ),
      '{"tops": "M", "bottoms": "31", "shoes": "42"}'::JSONB
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_compute_color_advice ON style_profiles;
CREATE TRIGGER trigger_auto_compute_color_advice
  BEFORE INSERT OR UPDATE ON style_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_compute_color_advice();
