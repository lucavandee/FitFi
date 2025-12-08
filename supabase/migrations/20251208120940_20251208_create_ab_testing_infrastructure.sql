/*
  # A/B Testing Infrastructure

  1. New Tables
    - `ab_experiments`
      - `id` (uuid, primary key)
      - `name` (text, experiment name)
      - `description` (text)
      - `variants` (jsonb, array of variant configs)
      - `traffic_split` (jsonb, percentage per variant)
      - `status` (text, 'draft' | 'active' | 'paused' | 'completed')
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_by` (uuid, admin user)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ab_assignments`
      - `id` (uuid, primary key)
      - `experiment_id` (uuid, foreign key)
      - `user_id` (uuid, nullable for anonymous)
      - `session_id` (text, for anonymous tracking)
      - `variant` (text, assigned variant name)
      - `assigned_at` (timestamptz)

    - `ab_events`
      - `id` (uuid, primary key)
      - `experiment_id` (uuid, foreign key)
      - `assignment_id` (uuid, foreign key)
      - `user_id` (uuid, nullable)
      - `session_id` (text, nullable)
      - `event_type` (text, e.g., 'view', 'click', 'conversion')
      - `event_data` (jsonb, additional context)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read their own assignments and events
    - Admins can manage experiments

  3. Indexes
    - Fast lookups by experiment_id, user_id, session_id
    - Time-series analysis on created_at
*/

-- Create ab_experiments table
CREATE TABLE IF NOT EXISTS ab_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  traffic_split jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create ab_assignments table
CREATE TABLE IF NOT EXISTS ab_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES ab_experiments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  variant text NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure one assignment per user/session per experiment
  CONSTRAINT unique_user_experiment UNIQUE (experiment_id, user_id),
  CONSTRAINT unique_session_experiment UNIQUE (experiment_id, session_id)
);

-- Create ab_events table
CREATE TABLE IF NOT EXISTS ab_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES ab_experiments(id) ON DELETE CASCADE NOT NULL,
  assignment_id uuid REFERENCES ab_assignments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ab_experiments_status ON ab_experiments(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment ON ab_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_user ON ab_assignments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ab_assignments_session ON ab_assignments(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ab_events_experiment ON ab_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_events_assignment ON ab_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_ab_events_created_at ON ab_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ab_events_type ON ab_events(event_type);

-- Enable RLS
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ab_experiments
CREATE POLICY "Anyone can view active experiments"
  ON ab_experiments FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage experiments"
  ON ab_experiments FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
  )
  WITH CHECK (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
  );

-- RLS Policies for ab_assignments
CREATE POLICY "Users can view own assignments"
  ON ab_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create assignments"
  ON ab_assignments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all assignments"
  ON ab_assignments FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
  );

-- RLS Policies for ab_events
CREATE POLICY "Users can view own events"
  ON ab_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create events"
  ON ab_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all events"
  ON ab_events FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
  );

-- Function to get or create assignment
CREATE OR REPLACE FUNCTION get_or_create_ab_assignment(
  p_experiment_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS TABLE(assignment_id uuid, variant text) AS $$
DECLARE
  v_assignment record;
  v_experiment record;
  v_variants jsonb;
  v_traffic_split jsonb;
  v_random_value numeric;
  v_cumulative numeric;
  v_selected_variant text;
  v_variant jsonb;
BEGIN
  -- Check if assignment already exists
  IF p_user_id IS NOT NULL THEN
    SELECT id, variant INTO v_assignment
    FROM ab_assignments
    WHERE experiment_id = p_experiment_id AND user_id = p_user_id
    LIMIT 1;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT id, variant INTO v_assignment
    FROM ab_assignments
    WHERE experiment_id = p_experiment_id AND session_id = p_session_id
    LIMIT 1;
  END IF;

  IF FOUND THEN
    RETURN QUERY SELECT v_assignment.id, v_assignment.variant;
    RETURN;
  END IF;

  -- Get experiment details
  SELECT * INTO v_experiment
  FROM ab_experiments
  WHERE id = p_experiment_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Experiment not found or not active';
  END IF;

  v_variants := v_experiment.variants;
  v_traffic_split := v_experiment.traffic_split;

  -- Assign variant based on traffic split
  v_random_value := random();
  v_cumulative := 0;

  FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
  LOOP
    v_cumulative := v_cumulative + COALESCE((v_traffic_split ->> (v_variant ->> 'name'))::numeric, 0);
    
    IF v_random_value <= v_cumulative THEN
      v_selected_variant := v_variant ->> 'name';
      EXIT;
    END IF;
  END LOOP;

  -- Fallback to first variant if none selected
  IF v_selected_variant IS NULL THEN
    v_selected_variant := v_variants -> 0 ->> 'name';
  END IF;

  -- Insert new assignment
  INSERT INTO ab_assignments (experiment_id, user_id, session_id, variant)
  VALUES (p_experiment_id, p_user_id, p_session_id, v_selected_variant)
  RETURNING id, variant INTO v_assignment;

  RETURN QUERY SELECT v_assignment.id, v_assignment.variant;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate experiment results
CREATE OR REPLACE FUNCTION calculate_ab_results(p_experiment_id uuid)
RETURNS TABLE(
  variant text,
  total_assignments bigint,
  total_conversions bigint,
  conversion_rate numeric,
  avg_time_to_conversion numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.variant,
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT e.id) FILTER (WHERE e.event_type = 'conversion') as total_conversions,
    ROUND(
      COUNT(DISTINCT e.id) FILTER (WHERE e.event_type = 'conversion')::numeric / 
      NULLIF(COUNT(DISTINCT a.id), 0) * 100,
      2
    ) as conversion_rate,
    AVG(
      EXTRACT(EPOCH FROM (e.created_at - a.assigned_at))
    ) FILTER (WHERE e.event_type = 'conversion') as avg_time_to_conversion
  FROM ab_assignments a
  LEFT JOIN ab_events e ON e.assignment_id = a.id
  WHERE a.experiment_id = p_experiment_id
  GROUP BY a.variant
  ORDER BY conversion_rate DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Create analytics view
CREATE OR REPLACE VIEW ab_experiment_analytics AS
SELECT
  e.id as experiment_id,
  e.name as experiment_name,
  e.status,
  COUNT(DISTINCT a.id) as total_assignments,
  COUNT(DISTINCT a.user_id) as unique_users,
  COUNT(DISTINCT ev.id) FILTER (WHERE ev.event_type = 'conversion') as total_conversions,
  ROUND(
    COUNT(DISTINCT ev.id) FILTER (WHERE ev.event_type = 'conversion')::numeric /
    NULLIF(COUNT(DISTINCT a.id), 0) * 100,
    2
  ) as overall_conversion_rate,
  e.created_at,
  e.start_date,
  e.end_date
FROM ab_experiments e
LEFT JOIN ab_assignments a ON a.experiment_id = e.id
LEFT JOIN ab_events ev ON ev.experiment_id = e.id
GROUP BY e.id, e.name, e.status, e.created_at, e.start_date, e.end_date;

GRANT SELECT ON ab_experiment_analytics TO authenticated;

-- Update triggers
CREATE OR REPLACE FUNCTION update_ab_experiments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ab_experiments_updated_at
  BEFORE UPDATE ON ab_experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_ab_experiments_updated_at();