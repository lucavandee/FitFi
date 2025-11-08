/*
  # Create Newsletter Subscribers Table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `subscribed_at` (timestamptz, not null, default now())
      - `source` (text) - where they signed up from (footer, blog, etc)
      - `unsubscribed_at` (timestamptz) - if they unsubscribed
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Public can insert their own email
    - Only admins can read/update/delete subscriber data

  3. Indexes
    - Unique index on email (lowercase)
    - Index on subscribed_at for analytics
*/

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  subscribed_at timestamptz DEFAULT now() NOT NULL,
  source text DEFAULT 'footer',
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create unique index on lowercase email
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_unique 
  ON newsletter_subscribers (LOWER(email));

-- Create index for analytics
CREATE INDEX IF NOT EXISTS newsletter_subscribers_subscribed_at_idx 
  ON newsletter_subscribers (subscribed_at);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert their email)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated admins can view subscriber list
CREATE POLICY "Admins can view all subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Only authenticated admins can update/delete
CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
