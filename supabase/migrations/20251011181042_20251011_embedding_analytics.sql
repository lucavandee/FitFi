/*
  # Embedding Analytics Dashboard

  1. Purpose
    - Provides admin visibility into embedding quality
    - Tracks user engagement with visual preference system
    - Monitors calibration effectiveness
  
  2. Analytics Views
    - Embedding stability metrics
    - Swipe completion rates
    - Calibration feedback distribution
    - Nova insight engagement
  
  3. Security
    - No new tables (uses existing data)
    - Admin-only access via application logic
  
  4. Metrics Computed
    - Avg swipes per user
    - Calibration completion rate
    - Embedding lock rate
    - Insight dismiss rate
*/

-- Create materialized view for analytics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS embedding_analytics_summary AS
SELECT
  COUNT(DISTINCT sp.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN sp.swipe_session_completed THEN sp.user_id END) as users_completed_swipes,
  COUNT(DISTINCT CASE WHEN sp.embedding_locked_at IS NOT NULL THEN sp.user_id END) as users_with_locked_embedding,
  AVG(swipe_counts.swipe_count) as avg_swipes_per_user,
  COUNT(DISTINCT ocf.user_id) as users_completed_calibration,
  COUNT(CASE WHEN ocf.feedback = 'spot_on' THEN 1 END) as calibration_spot_on_count,
  COUNT(CASE WHEN ocf.feedback = 'not_for_me' THEN 1 END) as calibration_not_for_me_count,
  COUNT(CASE WHEN ocf.feedback = 'maybe' THEN 1 END) as calibration_maybe_count,
  COUNT(DISTINCT nsi.user_id) as users_received_insights,
  COUNT(CASE WHEN nsi.dismissed THEN 1 END)::FLOAT / NULLIF(COUNT(nsi.id), 0) as insight_dismiss_rate
FROM style_profiles sp
LEFT JOIN (
  SELECT user_id, COUNT(*) as swipe_count
  FROM style_swipes
  GROUP BY user_id
) swipe_counts ON sp.user_id = swipe_counts.user_id
LEFT JOIN outfit_calibration_feedback ocf ON sp.user_id = ocf.user_id
LEFT JOIN nova_swipe_insights nsi ON sp.user_id = nsi.user_id
WHERE sp.completed_at IS NOT NULL;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_summary_refresh
ON embedding_analytics_summary ((1));

-- Function to refresh analytics (call periodically)
CREATE OR REPLACE FUNCTION refresh_embedding_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY embedding_analytics_summary;
END;
$$;

-- Grant access to authenticated users (admin check in app)
GRANT SELECT ON embedding_analytics_summary TO authenticated;
