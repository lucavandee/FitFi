/*
  # Outfit Calibration Feedback System

  1. New Table
    - `outfit_calibration_feedback`
      - Records user ratings of generated outfits
      - Used to fine-tune embedding weights
      - Feedback types: spot_on, not_for_me, maybe
  
  2. Security
    - Enable RLS
    - Users can only view/insert their own feedback
  
  3. Features
    - Captures detailed outfit data for analysis
    - Tracks archetype composition of each outfit
    - Enables progressive refinement of recommendations
*/

CREATE TABLE IF NOT EXISTS outfit_calibration_feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  outfit_data JSONB NOT NULL,
  feedback TEXT NOT NULL CHECK (feedback IN ('spot_on', 'not_for_me', 'maybe')),
  outfit_archetypes JSONB DEFAULT '{}',
  outfit_colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE outfit_calibration_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON outfit_calibration_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own feedback"
  ON outfit_calibration_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outfit_feedback_user ON outfit_calibration_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_feedback_session ON outfit_calibration_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_outfit_feedback_type ON outfit_calibration_feedback(feedback);
CREATE INDEX IF NOT EXISTS idx_outfit_feedback_created ON outfit_calibration_feedback(created_at DESC);
