/*
  Make User Admin Script

  Usage:
  1. Open Supabase Dashboard → SQL Editor
  2. Replace 'your-email@domain.com' with actual email
  3. Run this script
  4. Verify in admin dashboard
*/

-- Make user admin by email
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@domain.com';

-- Verify admin status
SELECT
  email,
  raw_app_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE raw_app_meta_data->>'role' = 'admin';

-- If no results, check if user exists
SELECT email, created_at
FROM auth.users
WHERE email = 'your-email@domain.com';
