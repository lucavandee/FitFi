/*
  # Fix email preferences GDPR opt-in defaults

  ## Problem
  All email preference columns defaulted to TRUE, which is a GDPR violation.
  Under GDPR, consent must be freely given, specific, and unambiguous — pre-ticked
  boxes do not constitute valid consent.

  ## Changes
  1. Set all non-transactional email preference columns to DEFAULT false
  2. Update existing records: set marketing_emails = false for all users
     (other preferences are kept as-is since users may have intentionally enabled them)
  3. The create_default_email_preferences function now inserts with all false defaults

  ## Columns updated
  - `marketing_emails` - was DEFAULT true, now DEFAULT false (and reset to false for existing users)
  - `product_updates` - now DEFAULT false
  - `style_tips` - now DEFAULT false
  - `weekly_digest` - now DEFAULT false
  - `outfit_recommendations` - now DEFAULT false
  - `quiz_reminders` - was already DEFAULT false

  ## Security
  No RLS changes — existing policies remain intact.

  ## Note
  Existing users who had marketing_emails = true will have it reset to false as
  we cannot confirm they provided explicit consent under GDPR.
*/

-- Fix column defaults
ALTER TABLE email_preferences
  ALTER COLUMN marketing_emails SET DEFAULT false,
  ALTER COLUMN product_updates SET DEFAULT false,
  ALTER COLUMN style_tips SET DEFAULT false,
  ALTER COLUMN weekly_digest SET DEFAULT false,
  ALTER COLUMN outfit_recommendations SET DEFAULT false;

-- Reset marketing_emails for all users (GDPR requires explicit consent)
UPDATE email_preferences SET marketing_emails = false WHERE marketing_emails = true;

-- Update the auto-create function to use correct GDPR-compliant defaults
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO email_preferences (
    user_id,
    marketing_emails,
    product_updates,
    style_tips,
    weekly_digest,
    outfit_recommendations,
    quiz_reminders
  )
  VALUES (
    NEW.id,
    false,
    false,
    false,
    false,
    false,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
