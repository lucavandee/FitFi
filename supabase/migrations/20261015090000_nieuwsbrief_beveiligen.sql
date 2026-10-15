-- Nieuwsbrief (15 oktober 2026).
-- 1. "Anyone can view newsletters" gaf elke ingelogde gebruiker alle opgeslagen
--    adressen. Lezen blijft voor admins via "Admins can view all subscribers".
-- 2. Eén inschrijving per adres. Zonder unieke beperking faalde de upsert op de
--    blog bij elke aanmelding; het formulier doet nu een insert en leest 23505
--    als "staat er al op".
drop policy if exists "Anyone can view newsletters" on public.newsletter_subscribers;
create unique index if not exists newsletter_subscribers_email_uniek
  on public.newsletter_subscribers (lower(email));
