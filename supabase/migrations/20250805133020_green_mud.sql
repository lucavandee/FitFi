/*
  # Gamification v2 - Complete levels, badges and leaderboard system

  1. New Tables
    - `levels` - XP ranges and level definitions (0-50)
    - `user_points` - User points tracking with history
    - `user_badges` - Badge achievements
    - `challenge_completions` - Challenge tracking
    - `leaderboards` - Cached leaderboard data

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - SECURITY DEFINER functions for leaderboards

  3. Functions
    - calculate_points() - Award points and handle level ups
    - get_leaderboard() - Fetch leaderboard data
    - award_badge() - Award badges to users
*/

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  level_name TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  max_xp INTEGER,
  icon TEXT NOT NULL DEFAULT '⭐',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  perks TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert level data (0-50)
INSERT INTO levels (level_name, min_xp, max_xp, icon, color, perks) VALUES
  ('Beginner', 0, 99, '🌱', '#10B981', ARRAY['Basic recommendations']),
  ('Explorer', 100, 299, '🔍', '#3B82F6', ARRAY['Daily challenges', 'Basic analytics']),
  ('Enthusiast', 300, 599, '✨', '#8B5CF6', ARRAY['Weekly challenges', 'Outfit history']),
  ('Trendsetter', 600, 999, '🎯', '#F59E0B', ARRAY['Premium challenges', 'Style insights']),
  ('Influencer', 1000, 1499, '⭐', '#EF4444', ARRAY['Exclusive content', 'Early access']),
  ('Icon', 1500, 2499, '👑', '#8B5CF6', ARRAY['VIP support', 'Custom styling']),
  ('Legend', 2500, 4999, '💎', '#FBBF24', ARRAY['Legendary status', 'All features']),
  ('Master', 5000, 7499, '🏆', '#F97316', ARRAY['Master privileges', 'Beta features']),
  ('Guru', 7500, 9999, '🌟', '#A855F7', ARRAY['Guru status', 'Mentorship']),
  ('Deity', 10000, NULL, '⚡', '#06B6D4', ARRAY['Ultimate status', 'All perks'])
ON CONFLICT DO NOTHING;

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1 REFERENCES levels(id),
  last_level_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

-- Create challenge_completions table
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  week_number INTEGER DEFAULT EXTRACT(week FROM NOW()),
  month_number INTEGER DEFAULT EXTRACT(month FROM NOW()),
  year_number INTEGER DEFAULT EXTRACT(year FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leaderboards table (cached data)
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  current_level TEXT DEFAULT 'Beginner',
  level_rank INTEGER DEFAULT 1,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for levels (public read)
CREATE POLICY "Anyone can read levels"
  ON levels FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_points
CREATE POLICY "Users can read own points"
  ON user_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
  ON user_points FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points"
  ON user_points FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
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

-- RLS Policies for leaderboards (public read for rankings)
CREATE POLICY "Anyone can read leaderboard data"
  ON leaderboards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own leaderboard"
  ON leaderboards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leaderboard"
  ON leaderboards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate and award points
CREATE OR REPLACE FUNCTION calculate_points(
  user_uuid UUID,
  points_to_add INTEGER,
  action_type TEXT,
  source_info TEXT DEFAULT NULL
)
RETURNS TABLE(
  new_total_points INTEGER,
  new_level TEXT,
  level_changed BOOLEAN,
  badges_earned TEXT[]
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_points INTEGER := 0;
  new_points INTEGER;
  current_level_id INTEGER;
  new_level_id INTEGER;
  current_level_name TEXT;
  new_level_name TEXT;
  level_up BOOLEAN := FALSE;
  earned_badges TEXT[] := '{}';
BEGIN
  -- Get current points and level
  SELECT total_points, current_level 
  INTO current_points, current_level_id
  FROM user_points 
  WHERE user_id = user_uuid;
  
  -- If user doesn't exist, create record
  IF current_points IS NULL THEN
    INSERT INTO user_points (user_id, total_points, current_level)
    VALUES (user_uuid, 0, 1);
    current_points := 0;
    current_level_id := 1;
  END IF;
  
  -- Calculate new points
  new_points := current_points + points_to_add;
  
  -- Get current level name
  SELECT level_name INTO current_level_name
  FROM levels WHERE id = current_level_id;
  
  -- Determine new level
  SELECT id, level_name INTO new_level_id, new_level_name
  FROM levels 
  WHERE min_xp <= new_points 
    AND (max_xp IS NULL OR new_points <= max_xp)
  ORDER BY min_xp DESC 
  LIMIT 1;
  
  -- Check if level changed
  IF new_level_id != current_level_id THEN
    level_up := TRUE;
  END IF;
  
  -- Update user points
  UPDATE user_points 
  SET 
    total_points = new_points,
    weekly_points = weekly_points + points_to_add,
    monthly_points = monthly_points + points_to_add,
    current_level = new_level_id,
    last_level_up = CASE WHEN level_up THEN NOW() ELSE last_level_up END,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Award badges based on points/actions
  IF points_to_add > 0 THEN
    -- First points badge
    IF current_points = 0 THEN
      INSERT INTO user_badges (user_id, badge_id, badge_name, badge_icon)
      VALUES (user_uuid, 'first_points', 'First Points', '🎯')
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      earned_badges := array_append(earned_badges, 'first_points');
    END IF;
    
    -- Milestone badges
    IF new_points >= 100 AND current_points < 100 THEN
      INSERT INTO user_badges (user_id, badge_id, badge_name, badge_icon)
      VALUES (user_uuid, 'century_club', 'Century Club', '💯')
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      earned_badges := array_append(earned_badges, 'century_club');
    END IF;
    
    IF new_points >= 1000 AND current_points < 1000 THEN
      INSERT INTO user_badges (user_id, badge_id, badge_name, badge_icon)
      VALUES (user_uuid, 'thousand_club', 'Thousand Club', '🚀')
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      earned_badges := array_append(earned_badges, 'thousand_club');
    END IF;
  END IF;
  
  -- Update leaderboard cache
  INSERT INTO leaderboards (
    user_id, 
    username, 
    total_points, 
    weekly_points, 
    monthly_points, 
    current_level,
    level_rank,
    last_activity
  )
  SELECT 
    user_uuid,
    COALESCE(profiles.full_name, auth.users.email),
    new_points,
    up.weekly_points,
    up.monthly_points,
    new_level_name,
    new_level_id,
    NOW()
  FROM user_points up
  LEFT JOIN profiles ON profiles.id = user_uuid
  LEFT JOIN auth.users ON auth.users.id = user_uuid
  WHERE up.user_id = user_uuid
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_points = EXCLUDED.total_points,
    weekly_points = EXCLUDED.weekly_points,
    monthly_points = EXCLUDED.monthly_points,
    current_level = EXCLUDED.current_level,
    level_rank = EXCLUDED.level_rank,
    last_activity = EXCLUDED.last_activity,
    updated_at = NOW();
  
  RETURN QUERY SELECT 
    new_points,
    new_level_name,
    level_up,
    earned_badges;
END;
$$;

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard(
  leaderboard_type TEXT DEFAULT 'all_time',
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  points INTEGER,
  level TEXT,
  rank BIGINT,
  weekly_points INTEGER,
  monthly_points INTEGER
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.user_id,
    l.username,
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
  WHERE l.last_activity >= NOW() - INTERVAL '30 days'
  ORDER BY points DESC
  LIMIT limit_count;
END;
$$;

-- Function to get user's leaderboard rank
CREATE OR REPLACE FUNCTION get_user_leaderboard_rank(
  user_uuid UUID,
  leaderboard_type TEXT DEFAULT 'all_time'
)
RETURNS TABLE(
  rank BIGINT,
  points INTEGER,
  level TEXT,
  weekly_points INTEGER,
  monthly_points INTEGER
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      l.user_id,
      l.current_level,
      l.weekly_points,
      l.monthly_points,
      CASE 
        WHEN leaderboard_type = 'weekly' THEN l.weekly_points
        WHEN leaderboard_type = 'monthly' THEN l.monthly_points
        ELSE l.total_points
      END as points,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE 
            WHEN leaderboard_type = 'weekly' THEN l.weekly_points
            WHEN leaderboard_type = 'monthly' THEN l.monthly_points
            ELSE l.total_points
          END DESC
      ) as user_rank
    FROM leaderboards l
    WHERE l.last_activity >= NOW() - INTERVAL '30 days'
  )
  SELECT 
    ru.user_rank,
    ru.points,
    ru.current_level,
    ru.weekly_points,
    ru.monthly_points
  FROM ranked_users ru
  WHERE ru.user_id = user_uuid;
END;
$$;

-- Function to award badges
CREATE OR REPLACE FUNCTION award_badge(
  user_uuid UUID,
  badge_id_param TEXT,
  badge_name_param TEXT,
  badge_icon_param TEXT,
  metadata_param JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_badges (user_id, badge_id, badge_name, badge_icon, metadata)
  VALUES (user_uuid, badge_id_param, badge_name_param, badge_icon_param, metadata_param)
  ON CONFLICT (user_id, badge_id) DO NOTHING;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_points TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_leaderboard_rank TO authenticated, anon;
GRANT EXECUTE ON FUNCTION award_badge TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_weekly ON user_points(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_monthly ON user_points(monthly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_week ON challenge_completions(week_number, year_number);
CREATE INDEX IF NOT EXISTS idx_leaderboards_points ON leaderboards(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_weekly ON leaderboards(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_monthly ON leaderboards(monthly_points DESC);