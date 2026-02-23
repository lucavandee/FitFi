/*
  # Contactberichten tabel

  ## Beschrijving
  Slaat berichten op die gebruikers via het contactformulier insturen.

  ## Nieuwe tabel
  - `contact_messages`
    - `id` (uuid, primary key)
    - `name` (text) – naam van de afzender
    - `email` (text) – e-mailadres van de afzender
    - `topic` (text) – onderwerp: algemeen / pers / partners / feedback / bug
    - `message` (text) – inhoud van het bericht
    - `read` (boolean) – of het bericht al is gelezen door een admin
    - `created_at` (timestamptz)

  ## Beveiliging
  - RLS ingeschakeld
  - Anonieme en ingelogde bezoekers mogen berichten insturen (INSERT)
  - Alleen admins (via app_metadata) mogen berichten lezen (SELECT)
  - Niemand mag berichten updaten of verwijderen via de client
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  topic      text NOT NULL DEFAULT 'algemeen',
  message    text NOT NULL,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) >= 2
    AND name ~ '^.+$'
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(message) >= 10
    AND topic IN ('algemeen', 'pers', 'partners', 'feedback', 'bug')
  );

CREATE POLICY "Admins can read contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_read
  ON contact_messages (read)
  WHERE read = false;
