/*
  # Saved Outfits Table

  1. New Tables
    - `saved_outfits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `outfit_id` (text, outfit identifier)
      - `outfit_json` (jsonb, complete outfit data)
      - `idempotency_key` (text, prevents duplicates)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_outfits` table
    - Add policies for users to read, insert, and delete their own saved outfits
    - Unique constraint on user_id + outfit_id to prevent duplicates
    - Unique index on user_id + idempotency_key for idempotent operations

  3. Performance
    - Index on user_id + created_at for efficient queries
    - Unique constraints for data integrity
    - Optimized for read-heavy workloads
*/

CREATE TABLE IF NOT EXISTS public.saved_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id text NOT NULL,
  outfit_json jsonb NOT NULL,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, outfit_id)
);

-- Idempotency index (only for non-null keys)
CREATE UNIQUE INDEX IF NOT EXISTS saved_outfits_idem_idx
  ON public.saved_outfits (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Performance index for user queries
CREATE INDEX IF NOT EXISTS saved_outfits_user_created_idx
  ON public.saved_outfits (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own saved outfits"
  ON public.saved_outfits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved outfits"
  ON public.saved_outfits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved outfits"
  ON public.saved_outfits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);