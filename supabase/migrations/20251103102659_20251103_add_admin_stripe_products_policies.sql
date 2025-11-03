/*
  # Add Admin Policies for Stripe Products

  1. Security Policies
    - Allow admins to INSERT stripe products
    - Allow admins to UPDATE stripe products
    - Allow admins to DELETE stripe products
    
  2. Admin Check
    - Uses profiles.is_admin column
    - Only @fitfi.ai admins can modify
*/

-- Allow admins to INSERT stripe products
CREATE POLICY "Admins can insert stripe products"
ON stripe_products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to UPDATE stripe products
CREATE POLICY "Admins can update stripe products"
ON stripe_products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to DELETE stripe products
CREATE POLICY "Admins can delete stripe products"
ON stripe_products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
