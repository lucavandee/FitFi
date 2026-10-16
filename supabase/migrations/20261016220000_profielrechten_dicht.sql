/*
  # Beheerdersrechten en abonnement niet meer door de gebruiker zelf te zetten

  Gevonden op 16 oktober 2026 met een testaccount (info+qa@fitfi.ai), dat direct
  na aanmelden beheerder was.

  ## Wat er openstond
  1. Trigger on_profile_created_set_admin (set_admin_for_fitfi_emails, oktober
     2025) gaf elk nieuw profiel met een adres op @fitfi.ai beheerdersrechten.
     Aanmeldingen worden direct bevestigd, zonder dat iemand de mailbox hoeft te
     bezitten, dus iedereen kon zich als iets@fitfi.ai aanmelden en beheerder zijn.
  2. De rol authenticated heeft UPDATE op heel profiles (dus ook is_admin en
     tier), en profiles_update_own laat elke gebruiker zijn eigen rij wijzigen.
     sync_admin_to_auth_metadata kopieert is_admin daarna naar app_metadata.
     Elke ingelogde bezoeker kon zichzelf beheerder of founder maken.

  ## Wat dit doet
  - De trigger op het mailadres gaat weg. De functie blijft staan maar wordt
    nergens meer aangeroepen.
  - Een BEFORE-trigger zet is_admin en tier terug zodra de schrijvende rol
    authenticated of anon is: bij een nieuw profiel false en 'free', bij een
    wijziging de oude waarde. De service role (Stripe-webhook), postgres en de
    beheerdersfuncties (security definer, eigenaar postgres) houden hun rechten.
    De functie is bewust geen security definer: current_user moet de rol van de
    schrijver zijn.

  ## Wat dit niet doet
  Dertien toegangsregels (mood_photos, brams_fruit_products en hun opslag)
  controleren nog op een adres op @fitfi.ai. Die moeten naar
  is_current_user_admin(); dat volgt in een eigen migratie.

  ## Terugdraaien
    drop trigger if exists a_profiles_bescherm_rechten on public.profiles;
    drop function if exists public.profiles_bescherm_rechten();
    create trigger on_profile_created_set_admin before insert on public.profiles
      for each row execute function public.set_admin_for_fitfi_emails();
  (Controleer bij terugdraaien BEFORE of AFTER in 20251020115150_add_admin_role_system.sql.)
*/

drop trigger if exists on_profile_created_set_admin on public.profiles;

create or replace function public.profiles_bescherm_rechten()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.is_admin := false;
      new.tier := 'free';
    else
      new.is_admin := old.is_admin;
      new.tier := old.tier;
    end if;
  end if;
  return new;
end;
$$;

comment on function public.profiles_bescherm_rechten() is
  'Laat een gebruiker is_admin en tier niet zelf zetten; zie 20261016220000_profielrechten_dicht.sql.';

drop trigger if exists a_profiles_bescherm_rechten on public.profiles;
create trigger a_profiles_bescherm_rechten
  before insert or update on public.profiles
  for each row execute function public.profiles_bescherm_rechten();
