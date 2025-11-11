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
-- 6. ⚠️ BELANGRIJK: Log UIT en weer IN (JWT moet vernieuwen!)
-- 7. Ga naar /admin/pwa
--
-- =====================================================

-- Maak je account admin (update raw_app_metadata in auth.users)
UPDATE auth.users
SET raw_app_metadata =
  COALESCE(raw_app_metadata, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'JOUW_EMAIL@HIER.COM';

-- Verificatie: check of het gelukt is
SELECT
  email,
  raw_app_metadata->>'is_admin' as is_admin,
  raw_app_metadata,
  created_at
FROM auth.users
WHERE email = 'JOUW_EMAIL@HIER.COM';

-- Als de verificatie "true" toont, ben je nu admin!
--
-- ⚠️ KRITISCH: Je MOET uitloggen en weer inloggen!
-- De JWT (JSON Web Token) bevat je admin status en moet vernieuwd worden.
-- Simpel refreshen van de pagina is NIET genoeg.
