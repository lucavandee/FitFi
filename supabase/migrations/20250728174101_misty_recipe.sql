/*
  # Contact Form Submissions

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `created_at` (timestamp)
      - `status` (text, default 'new')

  2. Security
    - Enable RLS on `contact_submissions` table
    - Add policy for public to insert contact submissions
    - Add RPC function for secure contact form submission

  3. Functions
    - `submit_contact` RPC function for form submission
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT 'Algemene vraag',
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public to insert contact submissions
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can read (for admin purposes)
CREATE POLICY "Authenticated users can read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- RPC function for secure contact form submission
CREATE OR REPLACE FUNCTION submit_contact(
  contact_name text,
  contact_email text,
  contact_subject text,
  contact_message text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  submission_id uuid;
BEGIN
  -- Validate inputs
  IF contact_name IS NULL OR trim(contact_name) = '' THEN
    RAISE EXCEPTION 'Naam is verplicht';
  END IF;
  
  IF contact_email IS NULL OR trim(contact_email) = '' THEN
    RAISE EXCEPTION 'E-mailadres is verplicht';
  END IF;
  
  IF contact_message IS NULL OR trim(contact_message) = '' THEN
    RAISE EXCEPTION 'Bericht is verplicht';
  END IF;
  
  -- Insert contact submission
  INSERT INTO contact_submissions (name, email, subject, message)
  VALUES (trim(contact_name), trim(contact_email), trim(contact_subject), trim(contact_message))
  RETURNING id INTO submission_id;
  
  RETURN json_build_object(
    'success', true,
    'id', submission_id,
    'message', 'Contact form submitted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;