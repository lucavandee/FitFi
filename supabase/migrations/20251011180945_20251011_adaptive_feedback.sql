/*
  # Adaptive Feedback System - Nova Swipe Insights

  1. New Table
    - `nova_swipe_insights`
      - Stores contextual insights generated during swipe sessions
      - Appears at strategic moments (swipe 3, 7) to maintain engagement
      - Types: archetype, color_harmony, style_consistency
  
  2. Security
    - Enable RLS
    - Users can only view/dismiss their own insights
  
  3. Features
    - Real-time pattern detection during swipes
    - Personalized messages based on emerging preferences
    - Dismissible insights to respect user control
*/

CREATE TABLE IF NOT EXISTS nova_swipe_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('archetype', 'color_harmony', 'style_consistency', 'general')),
  confidence_score NUMERIC(3,2) DEFAULT 0.8,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nova_swipe_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON nova_swipe_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own insights"
  ON nova_swipe_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own insights"
  ON nova_swipe_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nova_insights_user ON nova_swipe_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_insights_session ON nova_swipe_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_nova_insights_dismissed ON nova_swipe_insights(dismissed);
