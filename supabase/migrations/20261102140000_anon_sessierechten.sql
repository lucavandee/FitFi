/*
  # Anoniem schrijven op stijlprofielen en merkvoorkeuren alleen waar het echt nodig is

  Twee regels gaven anon rechten op elke rij met een sessie-id, niet alleen op de eigen sessie.
  Gemeten op 2 nov 2026, als anon en teruggedraaid:

  - style_profiles, "Anonymous users update by session": een update zonder filter wijzigde alle
    27 anonieme profielen. Met filter wijzigt hij niets, want anon mag deze tabel niet lezen. De
    site filtert altijd, dus de regel deed voor de site niets en was alleen open voor misbruik.
  - brand_preferences, "Sessions can manage own brand preferences": alles op elke rij met een
    sessie-id. De tabel is leeg en geen code schrijft erin; de enige aanroep leest, en krijgt
    zonder deze regel dezelfde lege lijst.

  Een sessie-id staat niet in de aanvraag, dus de database kan de eigen sessie niet herkennen.
  Daarom vervalt de regel, in plaats van dat hij scherper wordt.

  Blijft: anon mag een nieuw profiel aanmaken, voor de quiz zonder account.
  Toets: scripts/proef-anon-sessies.sql.
*/

begin;
set local lock_timeout = '5s';

drop policy if exists "Anonymous users update by session" on public.style_profiles;
drop policy if exists "Sessions can manage own brand preferences" on public.brand_preferences;

commit;
