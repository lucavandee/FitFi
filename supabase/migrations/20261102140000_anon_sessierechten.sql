/*
  # Anoniem schrijven en lezen dicht: profielen via een view, stijlprofielen, merkvoorkeuren, productlinks

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

  De ernstigste vondst staat hieronder. Zeven views zonder security_invoker draaien als postgres en
  omzeilen dus RLS, en anon had er alle rechten op. Een daarvan is schrijfbaar:
  onboarding_user_progress is een directe view op profiles. Gemeten als anon, op het QA-account en
  teruggedraaid: lezen gaf alle 32 profielen, update wijzigde onboarding_state, delete wiste het
  profiel, inclusief tier en is_admin, en via de cascade ook audit-regels. Geen code gebruikt deze views.

  update_product_link_status: drie aanroepen zetten een product op broken en de koopknop verdwijnt.
  Product-ids zijn openbaar. Alleen de job validate-product-links roept hem aan, met de service-sleutel.

  Blijft: anon mag een nieuw profiel aanmaken, voor de quiz zonder account.
  Toets: scripts/proef-anon-sessies.sql.
*/

begin;
set local lock_timeout = '5s';

drop policy if exists "Anonymous users update by session" on public.style_profiles;
drop policy if exists "Sessions can manage own brand preferences" on public.brand_preferences;

revoke all on public.onboarding_user_progress from public, anon, authenticated;
revoke all on public.v_referral_leaderboard from public, anon, authenticated;
revoke all on public.adaptive_learning_analytics from public, anon, authenticated;
revoke all on public.ab_experiment_analytics from public, anon, authenticated;
revoke all on public.outfit_match_feedback_analytics from public, anon, authenticated;
revoke all on public.quiz_reset_analytics from public, anon, authenticated;
revoke all on public.tribe_likes_summary from public, anon, authenticated;

revoke execute on function public.update_product_link_status(uuid, text, integer) from public, anon, authenticated;

commit;
