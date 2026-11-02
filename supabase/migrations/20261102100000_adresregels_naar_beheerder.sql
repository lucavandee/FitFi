/*
  # Toegang tot moodfoto's en Brams Fruit op beheerdersrecht, niet op mailadres

  Dertien regels controleerden `email like '%@fitfi.ai'`. Een aanmelding wordt direct
  bevestigd, dus iedereen kon zich als iets@fitfi.ai aanmelden. Gemeten op 2 nov 2026:

  - mood_photos (4 regels): een account zonder beheerdersrecht op dat domein kon
    moodfoto's wijzigen, en dus ook toevoegen en verwijderen. Dat was het echte gat.
  - brams_fruit_products en de buckets (9 regels): die lazen auth.users, en dat mag de rol
    authenticated niet. Elke poging gaf 42501, ook voor een beheerder.

  Nu beslist is_current_user_admin(): app_metadata of profiles.is_admin. Die kolom is sinds
  20261016220000 niet meer door de gebruiker zelf te zetten.

  Ook weg: temp_allow_upload. Die liet iedereen met de publieke sleutel, zonder inlog,
  bestanden in de openbare bucket mood-photos zetten. Geen code in deze repo leunt erop.

  Aanmelden zelf verandert niet. Toets: scripts/proef-adresregels.sql.
*/

begin;
set local lock_timeout = '5s';

drop policy if exists "temp_allow_upload" on storage.objects;

drop policy if exists "Admins can delete Brams Fruit products" on public.brams_fruit_products;
create policy "Admins can delete Brams Fruit products" on public.brams_fruit_products
  for delete to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "Admins can insert Brams Fruit products" on public.brams_fruit_products;
create policy "Admins can insert Brams Fruit products" on public.brams_fruit_products
  for insert to authenticated
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can update Brams Fruit products" on public.brams_fruit_products;
create policy "Admins can update Brams Fruit products" on public.brams_fruit_products
  for update to authenticated
  using ((select public.is_current_user_admin()))
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can delete mood photos" on public.mood_photos;
create policy "Admins can delete mood photos" on public.mood_photos
  for delete to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "Admins can insert mood photos" on public.mood_photos;
create policy "Admins can insert mood photos" on public.mood_photos
  for insert to authenticated
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can update mood photos" on public.mood_photos;
create policy "Admins can update mood photos" on public.mood_photos
  for update to authenticated
  using ((select public.is_current_user_admin()))
  with check ((select public.is_current_user_admin()));

drop policy if exists "Admins can view all mood photos" on public.mood_photos;
create policy "Admins can view all mood photos" on public.mood_photos
  for select to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "Admins can delete Brams Fruit images" on storage.objects;
create policy "Admins can delete Brams Fruit images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'brams-fruit-images' and (select public.is_current_user_admin()));

drop policy if exists "Admins can update Brams Fruit images" on storage.objects;
create policy "Admins can update Brams Fruit images" on storage.objects
  for update to authenticated
  using (bucket_id = 'brams-fruit-images' and (select public.is_current_user_admin()))
  with check (bucket_id = 'brams-fruit-images' and (select public.is_current_user_admin()));

drop policy if exists "Admins can upload Brams Fruit images" on storage.objects;
create policy "Admins can upload Brams Fruit images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'brams-fruit-images' and (select public.is_current_user_admin()));

drop policy if exists "Admins can delete from mood photos storage" on storage.objects;
create policy "Admins can delete from mood photos storage" on storage.objects
  for delete to authenticated
  using (bucket_id = 'mood-photos' and (select public.is_current_user_admin()));

drop policy if exists "Admins can update mood photos storage" on storage.objects;
create policy "Admins can update mood photos storage" on storage.objects
  for update to authenticated
  using (bucket_id = 'mood-photos' and (select public.is_current_user_admin()))
  with check (bucket_id = 'mood-photos' and (select public.is_current_user_admin()));

drop policy if exists "Admins can upload to mood photos" on storage.objects;
create policy "Admins can upload to mood photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'mood-photos' and (select public.is_current_user_admin()));

commit;
