/*
  # Email Preferences System

  1. New Tables
    - `email_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `marketing_emails` (boolean, default true)
      - `product_updates` (boolean, default true)
      - `style_tips` (boolean, default true)
      - `weekly_digest` (boolean, default true)
      - `outfit_recommendations` (boolean, default true)
      - `quiz_reminders` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `email_preferences` table
    - Users can only read and update their own preferences
    - Automatic creation of preferences on user registration

  3. Indexes
    - Index on user_id for fast lookups
*/

-- Create email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  marketing_emails boolean DEFAULT true,
  product_updates boolean DEFAULT true,
  style_tips boolean DEFAULT true,
  weekly_digest boolean DEFAULT true,
  outfit_recommendations boolean DEFAULT true,
  quiz_reminders boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id 
  ON email_preferences(user_id);

-- Function to auto-create email preferences on registration
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create preferences when user registers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_email_prefs'
  ) THEN
    CREATE TRIGGER on_auth_user_created_email_prefs
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_default_email_preferences();
  END IF;
END $$;

-- Backfill existing users
INSERT INTO email_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM email_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to update timestamp
DROP TRIGGER IF EXISTS update_email_preferences_timestamp ON email_preferences;
CREATE TRIGGER update_email_preferences_timestamp
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_updated_at();

-- Comment
COMMENT ON TABLE email_preferences IS 'User email notification preferences';
