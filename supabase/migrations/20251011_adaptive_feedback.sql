/*
  # Nova Adaptive Feedback System

  1. New Table
    - `nova_swipe_insights`
      - Tracks when Nova shows adaptive feedback during swipe sessions
      - Records user engagement with insights
      - Enables A/B testing and optimization

  2. Purpose
    - Analytics: Which insights resonate most?
    - Personalization: Learn when to show/hide feedback
    - Quality: Measure insight relevance over time

  3. Security
    - RLS enabled for user privacy
    - Users can only see their own insights
*/

CREATE TABLE IF NOT EXISTS nova_swipe_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  insight_message text NOT NULL,
  insight_trigger text NOT NULL CHECK (insight_trigger IN ('color', 'style', 'speed', 'pattern')),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  shown_at_swipe_count int NOT NULL,
  dismissed_at timestamptz,
  auto_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE nova_swipe_insights IS 'Tracks Nova adaptive feedback shown during visual preference swipe sessions';
COMMENT ON COLUMN nova_swipe_insights.insight_trigger IS 'What triggered the insight: color, style, speed, or pattern';
COMMENT ON COLUMN nova_swipe_insights.confidence IS 'Algorithm confidence in insight (0-1)';
COMMENT ON COLUMN nova_swipe_insights.shown_at_swipe_count IS 'Which swipe number triggered this insight (e.g., 3 or 7)';
COMMENT ON COLUMN nova_swipe_insights.dismissed_at IS 'When user manually dismissed the insight';
COMMENT ON COLUMN nova_swipe_insights.auto_hidden IS 'Whether insight auto-hid after timeout';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nova_swipe_insights_user_id
  ON nova_swipe_insights(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nova_swipe_insights_session_id
  ON nova_swipe_insights(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nova_swipe_insights_trigger
  ON nova_swipe_insights(insight_trigger);

CREATE INDEX IF NOT EXISTS idx_nova_swipe_insights_created_at
  ON nova_swipe_insights(created_at DESC);

-- Enable RLS
ALTER TABLE nova_swipe_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own insights
CREATE POLICY "Users can read own insights"
  ON nova_swipe_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own insights
CREATE POLICY "Users can insert own insights"
  ON nova_swipe_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own insights
CREATE POLICY "Users can update own insights"
  ON nova_swipe_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can read by session_id
CREATE POLICY "Anonymous users read insights by session"
  ON nova_swipe_insights FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

-- Policy: Anonymous users can insert with session_id
CREATE POLICY "Anonymous users insert insights with session"
  ON nova_swipe_insights FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Policy: Anonymous users can update by session_id
CREATE POLICY "Anonymous users update insights by session"
  ON nova_swipe_insights FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL)
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_insight_effectiveness()
RETURNS TABLE (
  trigger_type text,
  total_shown bigint,
  manually_dismissed bigint,
  avg_confidence numeric,
  dismissal_rate numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    insight_trigger as trigger_type,
    COUNT(*) as total_shown,
    COUNT(dismissed_at) as manually_dismissed,
    ROUND(AVG(confidence)::numeric, 3) as avg_confidence,
    ROUND((COUNT(dismissed_at)::numeric / COUNT(*)::numeric), 3) as dismissal_rate
  FROM nova_swipe_insights
  GROUP BY insight_trigger
  ORDER BY total_shown DESC;
$$;

COMMENT ON FUNCTION get_insight_effectiveness IS 'Analytics: Which insight triggers are most effective?';

CREATE OR REPLACE FUNCTION get_user_insight_history(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS TABLE (
  insight_message text,
  insight_trigger text,
  confidence numeric,
  shown_at_swipe_count int,
  was_dismissed boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    insight_message,
    insight_trigger,
    confidence,
    shown_at_swipe_count,
    (dismissed_at IS NOT NULL) as was_dismissed,
    created_at
  FROM nova_swipe_insights
  WHERE
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_session_id IS NOT NULL AND session_id = p_session_id)
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION get_user_insight_history IS 'Get all insights shown to a specific user or session';
