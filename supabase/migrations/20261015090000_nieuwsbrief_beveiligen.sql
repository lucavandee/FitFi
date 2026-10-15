-- Nieuwsbrief (15 oktober 2026).
-- "Anyone can view newsletters" gaf elke ingelogde gebruiker alle opgeslagen
-- adressen. Lezen blijft voor admins via "Admins can view all subscribers".
--
-- Eén inschrijving per adres stond er al: newsletter_subscribers_email_unique
-- op lower(email). De upsert op de blog faalde omdat ON CONFLICT (email) die
-- expressie-index niet kan gebruiken; het formulier doet nu een insert en leest
-- 23505 als "staat er al op". Een eerste versie van deze migratie maakte een
-- tweede, identieke index aan; die is dezelfde dag weer verwijderd.
drop policy if exists "Anyone can view newsletters" on public.newsletter_subscribers;
drop index if exists public.newsletter_subscribers_email_uniek;
