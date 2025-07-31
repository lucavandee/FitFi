/*
  # Geavanceerde Gamification Tabellen

  1. Nieuwe Tabellen
    - `user_levels` - Gebruiker level tracking
    - `leaderboards` - Leaderboard data
    - `challenge_completions` - Challenge voltooiing tracking
    - `point_transactions` - Gedetailleerde punt transacties

  2. RPC Functies
    - `get_leaderboard` - Haal leaderboard data op
    - `get_user_leaderboard_rank` - Gebruiker rank in leaderboard
    - `calculate_level` - Bereken level op basis van punten
    - `award_points` - Ken punten toe met level check

  3. Security
    - RLS policies voor alle nieuwe tabellen
    - Gebruikers kunnen alleen eigen data lezen/wijzigen
*/

-- User Levels Table
CREATE TABLE IF NOT EXISTS user_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id text NOT NULL,
  level_rank integer NOT NULL,
  achieved_at timestamptz DEFAULT now(),
  points_at_achievement integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, level_id)
);

-- Leaderboards Table  
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  total_points integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  monthly_points integer DEFAULT 0,
  current_level text DEFAULT 'beginner',
  level_rank integer DEFAULT 1,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Challenge Completions Table
CREATE TABLE IF NOT EXISTS challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id text NOT NULL,
  challenge_type text NOT NULL, -- 'daily', 'weekly', 'special'
  points_earned integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  week_number integer DEFAULT EXTRACT(week FROM now()),
  month_number integer DEFAULT EXTRACT(month FROM now()),
  year_number integer DEFAULT EXTRACT(year FROM now()),
  created_at timestamptz DEFAULT now()
);

-- Point Transactions Table
CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  points_change integer NOT NULL,
  points_before integer DEFAULT 0,
  points_after integer DEFAULT 0,
  source text, -- 'challenge', 'quiz', 'referral', etc.
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_levels
CREATE POLICY "Users can read own levels"
  ON user_levels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own levels"
  ON user_levels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for leaderboards
CREATE POLICY "Users can read leaderboard data"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true); -- Public leaderboard

CREATE POLICY "Users can update own leaderboard"
  ON leaderboards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leaderboard"
  ON leaderboards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for challenge_completions
CREATE POLICY "Users can read own completions"
  ON challenge_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON challenge_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for point_transactions
CREATE POLICY "Users can read own transactions"
  ON point_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON point_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_rank ON user_levels(level_rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_points ON leaderboards(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_weekly ON leaderboards(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_monthly ON leaderboards(monthly_points DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_week ON challenge_completions(week_number, year_number);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_date ON point_transactions(created_at);

-- RPC Function: Get Leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  leaderboard_type text DEFAULT 'all_time',
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  user_id uuid,
  username text,
  points integer,
  level text,
  rank bigint,
  weekly_points integer,
  monthly_points integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.user_id,
    COALESCE(l.username, 'Anonymous') as username,
    CASE 
      WHEN leaderboard_type = 'weekly' THEN l.weekly_points
      WHEN leaderboard_type = 'monthly' THEN l.monthly_points
      ELSE l.total_points
    END as points,
    l.current_level as level,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE 
          WHEN leaderboard_type = 'weekly' THEN l.weekly_points
          WHEN leaderboard_type = 'monthly' THEN l.monthly_points
          ELSE l.total_points
        END DESC
    ) as rank,
    l.weekly_points,
    l.monthly_points
  FROM leaderboards l
  WHERE l.last_activity > now() - interval '30 days' -- Active users only
  ORDER BY points DESC
  LIMIT limit_count;
END;
$$;

-- RPC Function: Get User Leaderboard Rank
CREATE OR REPLACE FUNCTION get_user_leaderboard_rank(
  user_uuid uuid,
  leaderboard_type text DEFAULT 'all_time'
)
RETURNS TABLE (
  rank bigint,
  points integer,
  level text,
  weekly_points integer,
  monthly_points integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      l.user_id,
      l.total_points,
      l.weekly_points,
      l.monthly_points,
      l.current_level,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE 
            WHEN leaderboard_type = 'weekly' THEN l.weekly_points
            WHEN leaderboard_type = 'monthly' THEN l.monthly_points
            ELSE l.total_points
          END DESC
      ) as user_rank
    FROM leaderboards l
    WHERE l.last_activity > now() - interval '30 days'
  )
  SELECT 
    ru.user_rank as rank,
    CASE 
      WHEN leaderboard_type = 'weekly' THEN ru.weekly_points
      WHEN leaderboard_type = 'monthly' THEN ru.monthly_points
      ELSE ru.total_points
    END as points,
    ru.current_level as level,
    ru.weekly_points,
    ru.monthly_points
  FROM ranked_users ru
  WHERE ru.user_id = user_uuid;
END;
$$;

-- RPC Function: Calculate Level
CREATE OR REPLACE FUNCTION calculate_level(user_points integer)
RETURNS TABLE (
  level_id text,
  level_name text,
  level_rank integer,
  min_points integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  level_data jsonb := '[
    {"id": "beginner", "rank": 1, "minPoints": 0, "name": "Style Starter"},
    {"id": "explorer", "rank": 2, "minPoints": 100, "name": "Style Explorer"},
    {"id": "enthusiast", "rank": 3, "minPoints": 300, "name": "Style Enthusiast"},
    {"id": "trendsetter", "rank": 4, "minPoints": 600, "name": "Trendsetter"},
    {"id": "influencer", "rank": 5, "minPoints": 1000, "name": "Style Influencer"},
    {"id": "icon", "rank": 6, "minPoints": 1500, "name": "Style Icon"},
    {"id": "legend", "rank": 7, "minPoints": 2500, "name": "Style Legend"},
    {"id": "master", "rank": 8, "minPoints": 5000, "name": "Style Master"},
    {"id": "guru", "rank": 9, "minPoints": 7500, "name": "Style Guru"},
    {"id": "deity", "rank": 10, "minPoints": 10000, "name": "Style Deity"}
  ]'::jsonb;
  level_item jsonb;
  result_level jsonb := level_data->0; -- Default to first level
BEGIN
  -- Find the highest level the user qualifies for
  FOR level_item IN SELECT * FROM jsonb_array_elements(level_data)
  LOOP
    IF (level_item->>'minPoints')::integer <= user_points THEN
      result_level := level_item;
    END IF;
  END LOOP;
  
  RETURN QUERY
  SELECT 
    result_level->>'id' as level_id,
    result_level->>'name' as level_name,
    (result_level->>'rank')::integer as level_rank,
    (result_level->>'minPoints')::integer as min_points;
END;
$$;

-- RPC Function: Award Points
CREATE OR REPLACE FUNCTION award_points(
  user_uuid uuid,
  points_to_add integer,
  action_type text,
  source_info text DEFAULT ''
)
RETURNS TABLE (
  new_total_points integer,
  level_changed boolean,
  new_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points integer := 0;
  new_points integer;
  old_level text;
  calculated_level text;
  level_changed_result boolean := false;
BEGIN
  -- Get current points from user_gamification
  SELECT points INTO current_points 
  FROM user_gamification 
  WHERE user_id = user_uuid;
  
  IF current_points IS NULL THEN
    current_points := 0;
  END IF;
  
  new_points := current_points + points_to_add;
  
  -- Get current level
  SELECT level INTO old_level 
  FROM user_gamification 
  WHERE user_id = user_uuid;
  
  -- Calculate new level
  SELECT level_id INTO calculated_level 
  FROM calculate_level(new_points);
  
  -- Check if level changed
  IF old_level IS NULL OR old_level != calculated_level THEN
    level_changed_result := true;
  END IF;
  
  -- Update user_gamification
  INSERT INTO user_gamification (user_id, points, level, updated_at)
  VALUES (user_uuid, new_points, calculated_level, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = new_points,
    level = calculated_level,
    updated_at = now();
  
  -- Update leaderboard
  INSERT INTO leaderboards (user_id, total_points, current_level, last_activity, updated_at)
  VALUES (user_uuid, new_points, calculated_level, now(), now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = new_points,
    current_level = calculated_level,
    last_activity = now(),
    updated_at = now();
  
  -- Record transaction
  INSERT INTO point_transactions (
    user_id, action_type, points_change, points_before, points_after, source, created_at
  ) VALUES (
    user_uuid, action_type, points_to_add, current_points, new_points, source_info, now()
  );
  
  RETURN QUERY
  SELECT 
    new_points as new_total_points,
    level_changed_result as level_changed,
    calculated_level as new_level;
END;
$$;