/*
  # Create weekly outfit challenges system

  1. New Tables
    - `weekly_challenge_templates`
      - `id` (uuid, primary key)
      - `day_of_week` (integer, 0=Sunday, 6=Saturday)
      - `theme_name` (text) - e.g., "Maandag Blues", "Casual Friday"
      - `theme_description` (text)
      - `theme_icon` (text) - emoji or icon identifier
      - `xp_reward` (integer, default 50)
      - `created_at` (timestamptz)
    
    - `user_weekly_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `week_start_date` (date) - Monday of the week
      - `completed_days` (jsonb) - Array of completed day indices
      - `total_xp_earned` (integer, default 0)
      - `is_week_completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Templates: public read, admin write
    - Progress: users can read/write their own progress only
  
  3. Indexes
    - Index on (user_id, week_start_date) for fast lookups
*/

-- Create weekly challenge templates table
CREATE TABLE IF NOT EXISTS weekly_challenge_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  theme_name text NOT NULL,
  theme_description text,
  theme_icon text DEFAULT '👔',
  xp_reward integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- Create unique constraint on day_of_week
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_templates_day 
  ON weekly_challenge_templates(day_of_week);

-- Seed default weekly themes
INSERT INTO weekly_challenge_templates (day_of_week, theme_name, theme_description, theme_icon, xp_reward)
VALUES
  (1, 'Maandag Momentum', 'Start je week sterk met een krachtige, professionele look', '💼', 50),
  (2, 'Dinsdag Trend', 'Experimenteer met een trendy stijl of nieuw item', '✨', 50),
  (3, 'Woensdag Versatile', 'Een veelzijdige outfit die je overal kunt dragen', '🎯', 50),
  (4, 'Donderdag Statement', 'Durf op te vallen met een statement piece', '🔥', 50),
  (5, 'Vrijdag Fris', 'Casual maar verzorgd - perfect voor het weekend', '🌟', 50),
  (6, 'Zaterdag Stijl', 'Laat je persoonlijke stijl echt zien', '💫', 75),
  (0, 'Zondag Chill', 'Comfortabel maar stijlvol - ready for anything', '☀️', 75)
ON CONFLICT (day_of_week) DO NOTHING;

-- Create user weekly progress table
CREATE TABLE IF NOT EXISTS user_weekly_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start_date date NOT NULL,
  completed_days jsonb DEFAULT '[]'::jsonb,
  total_xp_earned integer DEFAULT 0,
  is_week_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_weekly_progress_user_week 
  ON user_weekly_progress(user_id, week_start_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_weekly_progress_unique 
  ON user_weekly_progress(user_id, week_start_date);

-- Enable RLS
ALTER TABLE weekly_challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weekly_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read challenge templates
CREATE POLICY "Everyone can view challenge templates"
  ON weekly_challenge_templates
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins can manage templates
CREATE POLICY "Admins can manage challenge templates"
  ON weekly_challenge_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.email IN (
          SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
        )
    )
  );

-- Policy: Users can view their own progress
CREATE POLICY "Users can view own weekly progress"
  ON user_weekly_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can create own weekly progress"
  ON user_weekly_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own weekly progress"
  ON user_weekly_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to get current week progress
CREATE OR REPLACE FUNCTION get_current_week_progress(p_user_id uuid)
RETURNS TABLE(
  day_of_week integer,
  theme_name text,
  theme_description text,
  theme_icon text,
  xp_reward integer,
  is_completed boolean,
  week_start_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start date;
BEGIN
  -- Calculate Monday of current week
  v_week_start := date_trunc('week', CURRENT_DATE)::date + 1;
  
  -- Return weekly challenges with completion status
  RETURN QUERY
  SELECT 
    wct.day_of_week,
    wct.theme_name,
    wct.theme_description,
    wct.theme_icon,
    wct.xp_reward,
    CASE 
      WHEN uwp.completed_days IS NOT NULL THEN 
        (wct.day_of_week::text = ANY(SELECT jsonb_array_elements_text(uwp.completed_days)))
      ELSE false
    END as is_completed,
    v_week_start as week_start_date
  FROM weekly_challenge_templates wct
  LEFT JOIN user_weekly_progress uwp 
    ON uwp.user_id = p_user_id 
    AND uwp.week_start_date = v_week_start
  ORDER BY wct.day_of_week;
END;
$$;

-- Function to complete a daily challenge
CREATE OR REPLACE FUNCTION complete_daily_challenge(
  p_user_id uuid,
  p_day_of_week integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start date;
  v_xp_reward integer;
  v_completed_days jsonb;
  v_is_completed boolean;
  v_total_xp integer;
BEGIN
  -- Calculate Monday of current week
  v_week_start := date_trunc('week', CURRENT_DATE)::date + 1;
  
  -- Get XP reward for this challenge
  SELECT xp_reward INTO v_xp_reward
  FROM weekly_challenge_templates
  WHERE day_of_week = p_day_of_week;
  
  IF v_xp_reward IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid day');
  END IF;
  
  -- Insert or update progress
  INSERT INTO user_weekly_progress (user_id, week_start_date, completed_days, total_xp_earned)
  VALUES (
    p_user_id,
    v_week_start,
    jsonb_build_array(p_day_of_week),
    v_xp_reward
  )
  ON CONFLICT (user_id, week_start_date) 
  DO UPDATE SET
    completed_days = CASE
      WHEN user_weekly_progress.completed_days @> to_jsonb(p_day_of_week) THEN
        user_weekly_progress.completed_days
      ELSE
        user_weekly_progress.completed_days || to_jsonb(p_day_of_week)
    END,
    total_xp_earned = user_weekly_progress.total_xp_earned + 
      CASE
        WHEN user_weekly_progress.completed_days @> to_jsonb(p_day_of_week) THEN 0
        ELSE v_xp_reward
      END,
    is_week_completed = (jsonb_array_length(user_weekly_progress.completed_days || to_jsonb(p_day_of_week)) >= 7),
    updated_at = now()
  RETURNING completed_days, total_xp_earned, is_week_completed
  INTO v_completed_days, v_total_xp, v_is_completed;
  
  -- Award bonus XP for completing full week
  IF v_is_completed THEN
    PERFORM award_xp(p_user_id, 'week_completed', 200, jsonb_build_object('week_start', v_week_start));
    v_total_xp := v_total_xp + 200;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', v_xp_reward,
    'total_week_xp', v_total_xp,
    'completed_days', jsonb_array_length(v_completed_days),
    'week_completed', v_is_completed
  );
END;
$$;