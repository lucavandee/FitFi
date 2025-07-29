/*
  # Add Quiz Achievements and A/B Testing

  1. New Tables
    - `quiz_achievements` - User earned achievements
    - `ab_test_variants` - A/B testing variants for quiz
    
  2. Security
    - Enable RLS on both tables
    - Add policies for user data access
*/

-- Quiz achievements table
CREATE TABLE IF NOT EXISTS quiz_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  achievement_type text NOT NULL, -- 'style_explorer', 'color_master', 'completion_speed', etc.
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- A/B testing variants table
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  variant text NOT NULL, -- 'control', 'variant_a', 'variant_b'
  assigned_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false,
  conversion_data jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE quiz_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_achievements
CREATE POLICY "Users can read own achievements"
  ON quiz_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON quiz_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ab_test_variants
CREATE POLICY "Users can read own test variants"
  ON ab_test_variants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test variants"
  ON ab_test_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test variants"
  ON ab_test_variants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_achievements_user_id ON quiz_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_achievements_type ON quiz_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_user_id ON ab_test_variants(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test ON ab_test_variants(test_name, variant);