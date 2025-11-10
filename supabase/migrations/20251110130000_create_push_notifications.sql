/*
  # Push Notifications System

  1. New Tables
    - `push_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `endpoint` (text) - Push service endpoint
      - `p256dh_key` (text) - Encryption key
      - `auth_key` (text) - Authentication key
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `notification_preferences`
      - `user_id` (uuid, primary key)
      - `outfit_suggestions` (boolean) - New outfit suggestions
      - `style_tips` (boolean) - Weekly style tips
      - `price_drops` (boolean) - Price drop alerts
      - `achievements` (boolean) - Achievement unlocks
      - `challenges` (boolean) - Weekly challenge reminders
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `notification_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `notification_type` (text)
      - `title` (text)
      - `body` (text)
      - `sent_at` (timestamptz)
      - `clicked` (boolean)
      - `clicked_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - Users can manage their own subscriptions
    - Users can update their own preferences
    - Admins can view notification logs

  3. Functions
    - Function to send push notification
    - Function to cleanup old subscriptions
*/

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_suggestions boolean DEFAULT true,
  style_tips boolean DEFAULT true,
  price_drops boolean DEFAULT true,
  achievements boolean DEFAULT true,
  challenges boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_log table
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  clicked boolean DEFAULT false,
  clicked_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at DESC);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view own preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_log
CREATE POLICY "Users can view own notification log"
  ON notification_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification clicks"
  ON notification_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all notification logs
CREATE POLICY "Admins can view all notification logs"
  ON notification_log
  FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN (
      'admin@fitfi.nl',
      'support@fitfi.nl'
    )
  );

-- Function to auto-create notification preferences on user registration
CREATE OR REPLACE FUNCTION create_notification_preferences_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create preferences on user registration
DROP TRIGGER IF EXISTS on_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences_for_new_user();

-- Function to cleanup old notification logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notification_log
  WHERE sent_at < (now() - interval '30 days');
END;
$$;

-- Function to get user notification stats
CREATE OR REPLACE FUNCTION get_user_notification_stats(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_sent', COUNT(*),
    'total_clicked', COUNT(*) FILTER (WHERE clicked = true),
    'click_rate', ROUND(
      (COUNT(*) FILTER (WHERE clicked = true)::numeric / NULLIF(COUNT(*), 0) * 100),
      1
    ),
    'last_notification', MAX(sent_at),
    'by_type', (
      SELECT json_object_agg(notification_type, type_count)
      FROM (
        SELECT notification_type, COUNT(*) as type_count
        FROM notification_log
        WHERE user_id = target_user_id
        GROUP BY notification_type
      ) type_counts
    )
  )
  INTO result
  FROM notification_log
  WHERE user_id = target_user_id;

  RETURN result;
END;
$$;
