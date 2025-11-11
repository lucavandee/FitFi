-- =====================================================
-- MAAK JEZELF ADMIN
-- =====================================================
--
-- INSTRUCTIES:
-- 1. Ga naar Supabase Dashboard
-- 2. Klik "SQL Editor" in sidebar
-- 3. Kopieer dit script
-- 4. VERVANG 'JOUW_EMAIL@HIER.COM' met je echte email
-- 5. Klik "Run"
-- 6. Log uit en weer in
-- 7. Ga naar /admin/pwa
--
-- =====================================================

-- Maak je account admin
UPDATE auth.users
SET raw_app_metadata =
  COALESCE(raw_app_metadata, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'JOUW_EMAIL@HIER.COM';

-- Verificatie: check of het gelukt is
SELECT
  email,
  raw_app_metadata->>'is_admin' as is_admin,
  created_at
FROM auth.users
WHERE email = 'JOUW_EMAIL@HIER.COM';

-- Als de verificatie "true" toont, ben je nu admin!
-- Log uit en weer in om de wijziging actief te maken.
