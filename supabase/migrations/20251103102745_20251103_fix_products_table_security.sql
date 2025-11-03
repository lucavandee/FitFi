/*
  # Fix Products Table Security

  1. Remove Insecure Policy
    - Drop "Allow all operations on products" (USING true is unsafe)
    
  2. Add Proper Admin Policies
    - Only admins can INSERT/UPDATE/DELETE products
    - All users can still SELECT products
    
  3. Security
    - Uses profiles.is_admin column
    - Only @fitfi.ai admins can modify products
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "Allow all operations on products" ON products;

-- Keep public read access
-- "All users can read products" and "products_read_all" already exist

-- Allow admins to INSERT products
CREATE POLICY "Admins can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow admins to UPDATE products
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
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

-- Allow admins to DELETE products
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
