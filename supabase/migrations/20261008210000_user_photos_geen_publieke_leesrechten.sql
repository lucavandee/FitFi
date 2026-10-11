/*
  # user-photos: geen leesrechten meer voor anon en public

  Vastgelegd achteraf. Op 8 oktober 2026 zijn deze twee policies in productie
  verwijderd; in de repo stond daar geen migratie voor. Dit bestand zorgt dat
  een nieuwe database (branch, lokaal) ze ook niet terugkrijgt uit
  20251127101109_fix_anonymous_photo_uploads.sql. In productie doet het niets
  meer: DROP POLICY IF EXISTS.

  - "Public can read user photos" (SELECT, rol public, de hele bucket) gaf
    iedereen met de anon-sleutel uit de frontend leesrecht op alle foto's.
  - "Anonymous users can read their photos" (SELECT, rol anon, elke map
    anon_%) gaf iedere anonieme bezoeker leesrecht op de selfies van alle
    anonieme sessies, niet alleen de eigen.

  Wat blijft: anon mag uploaden in een map anon_% (quizstap 14), een
  ingelogde gebruiker leest en schrijft zijn eigen map. De analyse leest de
  foto via de service role in analyze-selfie-color en geeft OpenAI een link
  die 60 seconden werkt.
*/

DROP POLICY IF EXISTS "Public can read user photos" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can read their photos" ON storage.objects;
