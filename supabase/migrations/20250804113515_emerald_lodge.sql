/*
  # Analytics Test Data Marking

  1. Database Changes
    - Add `is_test` column to analytics tables
    - Update existing test data to be marked as test
    - Create indexes for performance

  2. RPC Functions
    - Update analytics functions to filter test data in production
    - Add exclude_test_data parameter to all analytics RPCs

  3. Data Cleanup
    - Mark existing dummy/test data with is_test = true
    - Ensure production queries exclude test data by default
*/

-- Add is_test column to analytics tables
ALTER TABLE funnel_analytics ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;
ALTER TABLE heatmap_data ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;
ALTER TABLE session_recordings ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;
ALTER TABLE onboarding_behavior_analytics ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;
ALTER TABLE predictive_models ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;
ALTER TABLE conversion_optimizations ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

-- Mark existing test data
UPDATE funnel_analytics SET is_test = true 
WHERE user_id LIKE 'test_%' 
   OR user_id LIKE 'mock_%' 
   OR session_id LIKE 'mock%'
   OR session_id LIKE 'test%';

UPDATE heatmap_data SET is_test = true 
WHERE user_id LIKE 'test_%' 
   OR user_id LIKE 'mock_%' 
   OR session_id LIKE 'mock%'
   OR session_id LIKE 'test%';

UPDATE session_recordings SET is_test = true 
WHERE user_id LIKE 'test_%' 
   OR user_id LIKE 'mock_%' 
   OR session_id LIKE 'mock%'
   OR session_id LIKE 'test%';

UPDATE onboarding_behavior_analytics SET is_test = true 
WHERE user_id LIKE 'test_%' 
   OR user_id LIKE 'mock_%' 
   OR session_id LIKE 'mock%'
   OR session_id LIKE 'test%';

UPDATE predictive_models SET is_test = true 
WHERE user_id LIKE 'test_%' 
   OR user_id LIKE 'mock_%';

UPDATE conversion_optimizations SET is_test = true 
WHERE user_id LIKE 'test_%' 
   OR user_id LIKE 'mock_%' 
   OR session_id LIKE 'mock%'
   OR session_id LIKE 'test%';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_is_test ON funnel_analytics(is_test);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_is_test ON heatmap_data(is_test);
CREATE INDEX IF NOT EXISTS idx_session_recordings_is_test ON session_recordings(is_test);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_is_test ON onboarding_behavior_analytics(is_test);
CREATE INDEX IF NOT EXISTS idx_predictive_models_is_test ON predictive_models(is_test);
CREATE INDEX IF NOT EXISTS idx_conversion_optimizations_is_test ON conversion_optimizations(is_test);

-- Update get_funnel_metrics function
CREATE OR REPLACE FUNCTION get_funnel_metrics(
  time_range text DEFAULT '7d',
  exclude_test_data boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  start_time timestamptz;
BEGIN
  -- Calculate start time based on range
  CASE time_range
    WHEN '1d' THEN start_time := now() - interval '1 day';
    WHEN '7d' THEN start_time := now() - interval '7 days';
    WHEN '30d' THEN start_time := now() - interval '30 days';
    ELSE start_time := now() - interval '7 days';
  END CASE;

  -- Build result with test data filtering
  WITH funnel_data AS (
    SELECT 
      funnel_id,
      COUNT(*) as total_entries,
      AVG(CASE WHEN completed THEN 1 ELSE 0 END) as completion_rate,
      AVG(time_spent) as avg_completion_time,
      SUM(COALESCE(conversion_value, 0)) as total_conversion_value
    FROM funnel_analytics
    WHERE created_at >= start_time
      AND (NOT exclude_test_data OR is_test = false)
    GROUP BY funnel_id
  )
  SELECT json_build_object(
    'onboarding', COALESCE((SELECT json_build_object(
      'total_entries', total_entries,
      'completion_rate', completion_rate,
      'avg_completion_time', avg_completion_time,
      'conversion_value', total_conversion_value,
      'drop_off_points', '[]'::json
    ) FROM funnel_data WHERE funnel_id = 'onboarding'), '{"total_entries":0,"completion_rate":0,"avg_completion_time":0,"conversion_value":0,"drop_off_points":[]}'::json),
    'purchase', COALESCE((SELECT json_build_object(
      'total_entries', total_entries,
      'completion_rate', completion_rate,
      'avg_completion_time', avg_completion_time,
      'conversion_value', total_conversion_value,
      'drop_off_points', '[]'::json
    ) FROM funnel_data WHERE funnel_id = 'purchase'), '{"total_entries":0,"completion_rate":0,"avg_completion_time":0,"conversion_value":0,"drop_off_points":[]}'::json),
    'engagement', COALESCE((SELECT json_build_object(
      'total_entries', total_entries,
      'completion_rate', completion_rate,
      'avg_completion_time', avg_completion_time,
      'conversion_value', total_conversion_value,
      'drop_off_points', '[]'::json
    ) FROM funnel_data WHERE funnel_id = 'engagement'), '{"total_entries":0,"completion_rate":0,"avg_completion_time":0,"conversion_value":0,"drop_off_points":[]}'::json)
  ) INTO result;

  RETURN result;
END;
$$;

-- Update get_heatmap_summary function
CREATE OR REPLACE FUNCTION get_heatmap_summary(
  time_range text DEFAULT '7d',
  exclude_test_data boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  start_time timestamptz;
BEGIN
  -- Calculate start time based on range
  CASE time_range
    WHEN '1d' THEN start_time := now() - interval '1 day';
    WHEN '7d' THEN start_time := now() - interval '7 days';
    WHEN '30d' THEN start_time := now() - interval '30 days';
    ELSE start_time := now() - interval '7 days';
  END CASE;

  -- Build result with test data filtering
  WITH heatmap_summary AS (
    SELECT 
      page_url,
      COUNT(DISTINCT session_id) as total_sessions,
      AVG(scroll_depth) as avg_scroll_depth,
      AVG(CASE WHEN click_count = 0 AND element_selector != 'page' THEN 1 ELSE 0 END) as dead_click_rate,
      AVG(CASE WHEN click_count > 5 THEN 1 ELSE 0 END) as rage_click_rate
    FROM heatmap_data
    WHERE created_at >= start_time
      AND (NOT exclude_test_data OR is_test = false)
    GROUP BY page_url
  )
  SELECT json_build_object(
    'homepage', COALESCE((SELECT json_build_object(
      'page_url', page_url,
      'total_sessions', total_sessions,
      'avg_scroll_depth', avg_scroll_depth,
      'dead_click_rate', dead_click_rate,
      'rage_click_rate', rage_click_rate,
      'top_clicked_elements', '[]'::json
    ) FROM heatmap_summary WHERE page_url = '/'), '{"page_url":"/","total_sessions":0,"avg_scroll_depth":0,"dead_click_rate":0,"rage_click_rate":0,"top_clicked_elements":[]}'::json),
    'quiz', COALESCE((SELECT json_build_object(
      'page_url', page_url,
      'total_sessions', total_sessions,
      'avg_scroll_depth', avg_scroll_depth,
      'dead_click_rate', dead_click_rate,
      'rage_click_rate', rage_click_rate,
      'top_clicked_elements', '[]'::json
    ) FROM heatmap_summary WHERE page_url = '/quiz'), '{"page_url":"/quiz","total_sessions":0,"avg_scroll_depth":0,"dead_click_rate":0,"rage_click_rate":0,"top_clicked_elements":[]}'::json),
    'results', COALESCE((SELECT json_build_object(
      'page_url', page_url,
      'total_sessions', total_sessions,
      'avg_scroll_depth', avg_scroll_depth,
      'dead_click_rate', dead_click_rate,
      'rage_click_rate', rage_click_rate,
      'top_clicked_elements', '[]'::json
    ) FROM heatmap_summary WHERE page_url = '/results'), '{"page_url":"/results","total_sessions":0,"avg_scroll_depth":0,"dead_click_rate":0,"rage_click_rate":0,"top_clicked_elements":[]}'::json)
  ) INTO result;

  RETURN result;
END;
$$;

-- Update get_predictive_insights function
CREATE OR REPLACE FUNCTION get_predictive_insights(
  limit_per_type integer DEFAULT 10,
  exclude_test_data boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  WITH insights AS (
    SELECT 
      user_id,
      'churn_risk' as insight_type,
      churn_probability as confidence,
      next_best_action as recommended_action,
      predicted_ltv as potential_value,
      CASE 
        WHEN churn_probability > 0.8 THEN 'critical'
        WHEN churn_probability > 0.6 THEN 'high'
        WHEN churn_probability > 0.4 THEN 'medium'
        ELSE 'low'
      END as urgency
    FROM predictive_models
    WHERE calculated_at >= extract(epoch from now() - interval '7 days') * 1000
      AND (NOT exclude_test_data OR is_test = false)
      AND churn_probability > 0.5
    ORDER BY churn_probability DESC
    LIMIT limit_per_type
  )
  SELECT json_build_object(
    'churn_risk', COALESCE(json_agg(json_build_object(
      'user_id', user_id,
      'insight_type', insight_type,
      'confidence', confidence,
      'recommended_action', recommended_action,
      'potential_value', potential_value,
      'urgency', urgency
    )), '[]'::json),
    'high_value_users', '[]'::json,
    'conversion_opportunities', '[]'::json
  ) INTO result
  FROM insights;

  RETURN result;
END;
$$;

-- Update get_realtime_metrics function
CREATE OR REPLACE FUNCTION get_realtime_metrics(
  exclude_test_data boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  active_users_count integer;
  conversion_rate_val real;
  avg_session_duration_val real;
  bounce_rate_val real;
BEGIN
  -- Calculate active users (last 30 minutes)
  SELECT COUNT(DISTINCT user_id) INTO active_users_count
  FROM session_recordings
  WHERE created_at >= now() - interval '30 minutes'
    AND (NOT exclude_test_data OR is_test = false);

  -- Calculate conversion rate (last 24 hours)
  WITH conversions AS (
    SELECT 
      COUNT(DISTINCT CASE WHEN step_id = 'quiz_complete' THEN user_id END) as completed,
      COUNT(DISTINCT user_id) as total
    FROM funnel_analytics
    WHERE created_at >= now() - interval '24 hours'
      AND (NOT exclude_test_data OR is_test = false)
  )
  SELECT CASE WHEN total > 0 THEN completed::real / total::real ELSE 0 END
  INTO conversion_rate_val
  FROM conversions;

  -- Calculate average session duration
  SELECT AVG(duration) / 1000 INTO avg_session_duration_val
  FROM session_recordings
  WHERE created_at >= now() - interval '24 hours'
    AND (NOT exclude_test_data OR is_test = false);

  -- Calculate bounce rate (sessions with only 1 page view)
  WITH bounce_data AS (
    SELECT 
      session_id,
      COUNT(*) as page_views
    FROM funnel_analytics
    WHERE created_at >= now() - interval '24 hours'
      AND (NOT exclude_test_data OR is_test = false)
    GROUP BY session_id
  )
  SELECT 
    CASE WHEN COUNT(*) > 0 
    THEN COUNT(CASE WHEN page_views = 1 THEN 1 END)::real / COUNT(*)::real 
    ELSE 0 END
  INTO bounce_rate_val
  FROM bounce_data;

  -- Build result
  result := json_build_object(
    'active_users', COALESCE(active_users_count, 0),
    'conversion_rate', COALESCE(conversion_rate_val, 0),
    'avg_session_duration', COALESCE(avg_session_duration_val, 0),
    'bounce_rate', COALESCE(bounce_rate_val, 0)
  );

  RETURN result;
END;
$$;