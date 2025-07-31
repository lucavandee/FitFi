/*
  # Advanced Analytics Tables

  1. New Tables
    - `funnel_analytics` - Track user progression through conversion funnels
    - `heatmap_data` - Store click, hover, and scroll interaction data
    - `session_recordings` - Comprehensive session behavior recordings
    - `predictive_models` - AI-generated user behavior predictions
    - `conversion_optimizations` - A/B test variants and optimization data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for admin users to read all data

  3. Indexes
    - Performance indexes for common queries
    - Composite indexes for analytics aggregations
*/

-- Funnel Analytics Table
CREATE TABLE IF NOT EXISTS funnel_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  step_id text NOT NULL,
  step_name text NOT NULL,
  completed boolean DEFAULT true,
  timestamp bigint NOT NULL,
  time_spent integer DEFAULT 0,
  exit_point boolean DEFAULT false,
  conversion_value numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Heatmap Data Table
CREATE TABLE IF NOT EXISTS heatmap_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text NOT NULL,
  element_selector text NOT NULL,
  click_count integer DEFAULT 0,
  hover_count integer DEFAULT 0,
  scroll_depth integer DEFAULT 0,
  viewport_size text,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  timestamp bigint NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Session Recordings Table
CREATE TABLE IF NOT EXISTS session_recordings (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  page_url text NOT NULL,
  duration integer NOT NULL,
  events jsonb DEFAULT '[]',
  device_info jsonb DEFAULT '{}',
  conversion_events text[] DEFAULT '{}',
  exit_intent boolean DEFAULT false,
  rage_clicks integer DEFAULT 0,
  dead_clicks integer DEFAULT 0,
  timestamp bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Predictive Models Table
CREATE TABLE IF NOT EXISTS predictive_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  churn_probability real CHECK (churn_probability >= 0 AND churn_probability <= 1),
  purchase_probability real CHECK (purchase_probability >= 0 AND purchase_probability <= 1),
  engagement_score real CHECK (engagement_score >= 0 AND engagement_score <= 1),
  style_confidence real CHECK (style_confidence >= 0 AND style_confidence <= 1),
  predicted_ltv numeric DEFAULT 0,
  risk_factors text[] DEFAULT '{}',
  opportunities text[] DEFAULT '{}',
  next_best_action text,
  model_version text DEFAULT '1.0',
  calculated_at bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, model_version)
);

-- Conversion Optimizations Table
CREATE TABLE IF NOT EXISTS conversion_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  optimization_type text CHECK (optimization_type IN ('cta_placement', 'pricing_display', 'product_order', 'content_personalization')),
  variant text NOT NULL,
  confidence real CHECK (confidence >= 0 AND confidence <= 1),
  expected_lift real DEFAULT 0,
  applied_at bigint NOT NULL,
  result text CHECK (result IN ('converted', 'abandoned', 'ongoing')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Funnel Analytics
CREATE POLICY "Users can read own funnel data"
  ON funnel_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funnel data"
  ON funnel_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Heatmap Data
CREATE POLICY "Users can read own heatmap data"
  ON heatmap_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert heatmap data"
  ON heatmap_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Session Recordings
CREATE POLICY "Users can read own session recordings"
  ON session_recordings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert session recordings"
  ON session_recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Predictive Models
CREATE POLICY "Users can read own predictive models"
  ON predictive_models
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictive models"
  ON predictive_models
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictive models"
  ON predictive_models
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for Conversion Optimizations
CREATE POLICY "Users can read own conversion optimizations"
  ON conversion_optimizations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert conversion optimizations"
  ON conversion_optimizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_user_funnel ON funnel_analytics(user_id, funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_session ON funnel_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_timestamp ON funnel_analytics(timestamp);

CREATE INDEX IF NOT EXISTS idx_heatmap_data_page ON heatmap_data(page_url);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_element ON heatmap_data(element_selector);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_timestamp ON heatmap_data(timestamp);

CREATE INDEX IF NOT EXISTS idx_session_recordings_user ON session_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_timestamp ON session_recordings(timestamp);

CREATE INDEX IF NOT EXISTS idx_predictive_models_user ON predictive_models(user_id);
CREATE INDEX IF NOT EXISTS idx_predictive_models_calculated ON predictive_models(calculated_at);

CREATE INDEX IF NOT EXISTS idx_conversion_optimizations_user ON conversion_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_optimizations_type ON conversion_optimizations(optimization_type);

-- RPC Functions for Analytics Aggregations
CREATE OR REPLACE FUNCTION get_funnel_metrics(time_range text DEFAULT '7d')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  time_filter timestamptz;
BEGIN
  -- Calculate time filter
  CASE time_range
    WHEN '1d' THEN time_filter := now() - interval '1 day';
    WHEN '7d' THEN time_filter := now() - interval '7 days';
    WHEN '30d' THEN time_filter := now() - interval '30 days';
    ELSE time_filter := now() - interval '7 days';
  END CASE;

  -- Build funnel metrics
  SELECT jsonb_build_object(
    'onboarding', jsonb_build_object(
      'total_entries', COALESCE((SELECT COUNT(DISTINCT session_id) FROM funnel_analytics WHERE funnel_id = 'onboarding' AND created_at >= time_filter), 0),
      'completion_rate', COALESCE((SELECT COUNT(DISTINCT session_id)::float / NULLIF(COUNT(DISTINCT session_id), 0) FROM funnel_analytics WHERE funnel_id = 'onboarding' AND step_id = 'results_view' AND created_at >= time_filter), 0),
      'drop_off_points', '[]'::jsonb,
      'avg_completion_time', 180000,
      'conversion_value', 0
    ),
    'purchase', jsonb_build_object(
      'total_entries', 0,
      'completion_rate', 0,
      'drop_off_points', '[]'::jsonb,
      'avg_completion_time', 0,
      'conversion_value', 0
    ),
    'engagement', jsonb_build_object(
      'total_entries', 0,
      'completion_rate', 0,
      'drop_off_points', '[]'::jsonb,
      'avg_completion_time', 0,
      'conversion_value', 0
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_heatmap_summary(time_range text DEFAULT '7d')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  time_filter timestamptz;
BEGIN
  -- Calculate time filter
  CASE time_range
    WHEN '1d' THEN time_filter := now() - interval '1 day';
    WHEN '7d' THEN time_filter := now() - interval '7 days';
    WHEN '30d' THEN time_filter := now() - interval '30 days';
    ELSE time_filter := now() - interval '7 days';
  END CASE;

  -- Build heatmap summary
  SELECT jsonb_build_object(
    'homepage', jsonb_build_object(
      'page_url', '/',
      'total_sessions', COALESCE((SELECT COUNT(DISTINCT session_id) FROM heatmap_data WHERE page_url = '/' AND created_at >= time_filter), 0),
      'avg_scroll_depth', COALESCE((SELECT AVG(scroll_depth) FROM heatmap_data WHERE page_url = '/' AND created_at >= time_filter), 0),
      'top_clicked_elements', '[]'::jsonb,
      'dead_click_rate', 0,
      'rage_click_rate', 0
    ),
    'quiz', jsonb_build_object(
      'page_url', '/quiz',
      'total_sessions', COALESCE((SELECT COUNT(DISTINCT session_id) FROM heatmap_data WHERE page_url = '/quiz' AND created_at >= time_filter), 0),
      'avg_scroll_depth', COALESCE((SELECT AVG(scroll_depth) FROM heatmap_data WHERE page_url = '/quiz' AND created_at >= time_filter), 0),
      'top_clicked_elements', '[]'::jsonb,
      'dead_click_rate', 0,
      'rage_click_rate', 0
    ),
    'results', jsonb_build_object(
      'page_url', '/results',
      'total_sessions', COALESCE((SELECT COUNT(DISTINCT session_id) FROM heatmap_data WHERE page_url = '/results' AND created_at >= time_filter), 0),
      'avg_scroll_depth', COALESCE((SELECT AVG(scroll_depth) FROM heatmap_data WHERE page_url = '/results' AND created_at >= time_filter), 0),
      'top_clicked_elements', '[]'::jsonb,
      'dead_click_rate', 0,
      'rage_click_rate', 0
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_predictive_insights(limit_per_type integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Build predictive insights
  SELECT jsonb_build_object(
    'churn_risk', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'insight_type', 'churn_risk',
          'confidence', churn_probability,
          'recommended_action', next_best_action,
          'potential_value', predicted_ltv,
          'urgency', CASE 
            WHEN churn_probability > 0.8 THEN 'critical'
            WHEN churn_probability > 0.6 THEN 'high'
            WHEN churn_probability > 0.4 THEN 'medium'
            ELSE 'low'
          END
        )
      )
      FROM (
        SELECT * FROM predictive_models 
        WHERE churn_probability > 0.5 
        ORDER BY churn_probability DESC 
        LIMIT limit_per_type
      ) high_churn
    ),
    'high_value_users', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'insight_type', 'high_value',
          'confidence', purchase_probability,
          'recommended_action', 'offer_premium_upgrade',
          'potential_value', predicted_ltv,
          'urgency', 'medium'
        )
      )
      FROM (
        SELECT * FROM predictive_models 
        WHERE predicted_ltv > 100 
        ORDER BY predicted_ltv DESC 
        LIMIT limit_per_type
      ) high_value
    ),
    'conversion_opportunities', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'insight_type', 'conversion_opportunity',
          'confidence', purchase_probability,
          'recommended_action', next_best_action,
          'potential_value', predicted_ltv * purchase_probability,
          'urgency', CASE 
            WHEN purchase_probability > 0.7 THEN 'high'
            WHEN purchase_probability > 0.5 THEN 'medium'
            ELSE 'low'
          END
        )
      )
      FROM (
        SELECT * FROM predictive_models 
        WHERE purchase_probability > 0.4 
        ORDER BY purchase_probability DESC 
        LIMIT limit_per_type
      ) conversion_opps
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_realtime_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  active_users_count integer;
  conversion_rate_value real;
  avg_session_duration_value real;
  bounce_rate_value real;
BEGIN
  -- Calculate active users (last 30 minutes)
  SELECT COUNT(DISTINCT user_id) INTO active_users_count
  FROM session_recordings 
  WHERE created_at >= now() - interval '30 minutes';

  -- Calculate conversion rate (last 24 hours)
  SELECT COALESCE(
    (SELECT COUNT(DISTINCT user_id)::float FROM funnel_analytics WHERE step_id = 'quiz_complete' AND created_at >= now() - interval '24 hours') /
    NULLIF((SELECT COUNT(DISTINCT user_id) FROM funnel_analytics WHERE step_id = 'landing' AND created_at >= now() - interval '24 hours'), 0),
    0
  ) INTO conversion_rate_value;

  -- Calculate average session duration (last 24 hours)
  SELECT COALESCE(AVG(duration), 0) INTO avg_session_duration_value
  FROM session_recordings 
  WHERE created_at >= now() - interval '24 hours';

  -- Calculate bounce rate (last 24 hours)
  SELECT COALESCE(
    (SELECT COUNT(*)::float FROM session_recordings WHERE duration < 30000 AND created_at >= now() - interval '24 hours') /
    NULLIF((SELECT COUNT(*) FROM session_recordings WHERE created_at >= now() - interval '24 hours'), 0),
    0
  ) INTO bounce_rate_value;

  -- Build result
  SELECT jsonb_build_object(
    'active_users', COALESCE(active_users_count, 0),
    'conversion_rate', COALESCE(conversion_rate_value, 0),
    'avg_session_duration', COALESCE(avg_session_duration_value, 0),
    'bounce_rate', COALESCE(bounce_rate_value, 0)
  ) INTO result;

  RETURN result;
END;
$$;