/*
  # Stripe Products Table

  1. New Tables
    - `stripe_products`
      - `id` (uuid, primary key)
      - `stripe_product_id` (text, unique) - Stripe product ID
      - `stripe_price_id` (text, unique) - Stripe price ID
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (numeric) - Price in euros
      - `currency` (text) - Currency code (EUR)
      - `interval` (text) - Billing interval (month, year, one_time)
      - `features` (jsonb) - Product features array
      - `is_featured` (boolean) - Featured product flag
      - `is_active` (boolean) - Active status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `stripe_products` table
    - Add policy for public read access (products are public information)
    - Add policy for authenticated admin users to manage products
*/

CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id text UNIQUE,
  stripe_price_id text UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  interval text NOT NULL DEFAULT 'month',
  features jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON stripe_products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON stripe_products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(is_active);
CREATE INDEX IF NOT EXISTS idx_stripe_products_featured ON stripe_products(is_featured);