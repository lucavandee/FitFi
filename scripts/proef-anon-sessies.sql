-- Toets op wat een bezoeker zonder inlog kan op stijlprofielen en merkvoorkeuren.
-- Veilig op productie: het blok eindigt altijd op een fout, en daarmee wordt alles teruggedraaid.
--   supabase db query --linked -f scripts/proef-anon-sessies.sql
-- De uitslag staat in de foutmelding (UITSLAG). Verwacht:
--   sp_nieuw=1 sp_lees=0 sp_update_alles=0 sp_update_filter=0 sp_wis=0 bp_lees=0 bp_nieuw=FOUT(42501) bp_wis=0
--   view_lees=FOUT(42501) view_update=FOUT(42501) view_wis=FOUT(42501) rang_lees=FOUT(42501) link=FOUT(42501)
-- sp_nieuw moet 1 blijven: dat is de quiz zonder account.
do $$
declare n int; uit text := ''; p record;
begin
  set local lock_timeout = '3s';
  set local statement_timeout = '15s';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  for p in select * from (values
    ('sp_nieuw',         $q$insert into public.style_profiles (session_id, archetype, color_profile, quiz_answers) values ('proef-anon-sessies', '{}', '{}', '{}')$q$),
    ('sp_lees',          'select count(*) from public.style_profiles'),
    ('sp_update_alles',  'update public.style_profiles set updated_at = now()'),
    ('sp_update_filter', 'update public.style_profiles set updated_at = now() where session_id is not null'),
    ('sp_wis',           'delete from public.style_profiles'),
    ('bp_lees',          'select count(*) from public.brand_preferences'),
    ('bp_nieuw',         $q$insert into public.brand_preferences (session_id, brand) values ('proef-anon-sessies', 'proef')$q$),
    ('bp_wis',           'delete from public.brand_preferences'),
    ('view_lees',        'select count(*) from public.onboarding_user_progress'),
    ('view_update',      'update public.onboarding_user_progress set onboarding_state = onboarding_state'),
    ('view_wis',         'delete from public.onboarding_user_progress'),
    ('rang_lees',        'select count(*) from public.v_referral_leaderboard'),
    ('link',             'select count(*) from public.update_product_link_status(gen_random_uuid(), ''ok'', 200)')
  ) t(naam, opdracht) loop
    begin
      set local role anon;
      if p.opdracht like 'select%' then execute p.opdracht into n; else execute p.opdracht; get diagnostics n = row_count; end if;
      uit := uit || ' ' || p.naam || '=' || n;
    exception when others then
      uit := uit || ' ' || p.naam || '=FOUT(' || sqlstate || ')';
    end;
    reset role;
  end loop;
  raise exception 'UITSLAG (alles teruggedraaid)%', uit;
end $$;
