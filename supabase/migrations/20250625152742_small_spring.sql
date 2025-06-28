-- Create test user with the specific UUID
INSERT INTO users (id, name, email, gender, is_premium)
VALUES 
  ('f8993892-a1c1-4d7d-89e9-5886e3f5a3e8', 'Test User', 'test@example.com', 'neutral', false)
ON CONFLICT (id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  gender = EXCLUDED.gender,
  is_premium = EXCLUDED.is_premium,
  updated_at = now();

-- Create style preferences for test user
INSERT INTO style_preferences (user_id, casual, formal, sporty, vintage, minimalist)
VALUES 
  ('f8993892-a1c1-4d7d-89e9-5886e3f5a3e8', 3, 3, 3, 3, 3)
ON CONFLICT (user_id) 
DO UPDATE SET 
  casual = EXCLUDED.casual,
  formal = EXCLUDED.formal,
  sporty = EXCLUDED.sporty,
  vintage = EXCLUDED.vintage,
  minimalist = EXCLUDED.minimalist,
  updated_at = now();

-- Create gamification data for test user
INSERT INTO user_gamification (user_id, points, level, badges, streak, completed_challenges, total_referrals)
VALUES 
  ('f8993892-a1c1-4d7d-89e9-5886e3f5a3e8', 0, 'beginner', '{}', 0, '{}', 0)
ON CONFLICT (user_id) 
DO UPDATE SET 
  points = EXCLUDED.points,
  level = EXCLUDED.level,
  badges = EXCLUDED.badges,
  streak = EXCLUDED.streak,
  completed_challenges = EXCLUDED.completed_challenges,
  total_referrals = EXCLUDED.total_referrals,
  updated_at = now();