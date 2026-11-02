-- Toets op 20261102150000_anon_rpc_dicht: wat dicht moet zijn, en wat moet blijven werken.
-- Veilig op productie: het blok eindigt altijd op een fout, en daarmee wordt alles teruggedraaid.
--   supabase db query --linked -f scripts/proef-anon-rpc.sql
-- Elke regel in de foutmelding begint met UITSLAG, gevolgd door OK of AFWIJKING. Na de migratie hoort
-- de eerste regel afwijking=0 te tonen. Daarvoor staat alles wat de migratie verandert op AFWIJKING.
--
-- Veilig in elke stand, ook als de migratie nog niet is toegepast:
-- - Een functie die dicht hoort te zijn wordt alleen aangeroepen als de rol hem echt niet mag. Staat hij
--   nog open, dan telt hij als open en loopt hij niet: wissen, punten en een REFRESH blijven uit.
-- - Doel is alleen het QA-account, een willekeurige uuid, en rijen die dit blok zelf aanmaakt.
-- - 20261102140000 mag er wel of niet op staan: dit blok leunt er niet op en meldt alleen de stand.
do $proef$
declare
  dicht_b text[] := array[
    'public.admin_get_all_users()',
    'public.admin_update_user_admin_status(uuid, boolean)',
    'public.admin_update_user_tier(uuid, text)',
    'public.award_points(uuid, integer, text, text)',
    'public.check_rate_limit(text, text, text, integer, integer)',
    'public.clean_old_nova_memories()',
    'public.cleanup_expired_dismissed_insights()',
    'public.cleanup_old_outfit_visuals()',
    'public.cleanup_old_rate_limits()',
    'public.complete_daily_challenge(uuid, integer)',
    'public.complete_onboarding_action(text)',
    'public.compute_calibration_adjustments(uuid, text)',
    'public.create_default_email_preferences()',
    'public.create_user_referral_code()',
    'public.dismiss_feature_tip(text)',
    'public.find_similar_users(uuid, integer)',
    'public.get_admin_dashboard_metrics()',
    'public.get_best_colors(uuid)',
    'public.get_calibration_effectiveness()',
    'public.get_color_summary(uuid)',
    'public.get_current_week_progress(uuid)',
    'public.get_funnel_metrics(text)',
    'public.get_heatmap_summary(text)',
    'public.get_hint_performance(text)',
    'public.get_leaderboard(text, integer)',
    'public.get_onboarding_cohort_analysis(date, date)',
    'public.get_onboarding_completion_rate()',
    'public.get_onboarding_health_score()',
    'public.get_popular_swap_categories()',
    'public.get_predictive_insights(integer)',
    'public.get_realtime_metrics()',
    'public.get_referral_leaderboard()',
    'public.get_referral_stats(uuid)',
    'public.get_similar_memories(extensions.vector, uuid, double precision, integer)',
    'public.get_swap_success_rate(uuid, text)',
    'public.get_tribe_leaderboard(uuid, integer)',
    'public.get_user_activity_dates(uuid, date, date)',
    'public.get_user_journey(uuid)',
    'public.get_user_leaderboard_rank(uuid, text)',
    'public.get_user_profile(uuid)',
    'public.handle_new_user()',
    'public.handle_referral_signup(text, uuid)',
    'public.has_color_analysis(uuid)',
    'public.increment_nova_usage(uuid)',
    'public.keten_outfit_set(text, text)',
    'public.log_daily_checkin(uuid)',
    'public.log_supabase_error(text, text, text, text, text, jsonb, integer, text)',
    'public.refresh_embedding_analytics()',
    'public.refresh_onboarding_stats()',
    'public.reset_user_quiz_data(uuid)',
    'public.set_admin_for_fitfi_emails()',
    'public.start_calibration_session()',
    'public.submit_contact(text, text, text, text, text)',
    'public.sync_admin_to_auth_metadata()',
    'public.update_brand_affinity(uuid, text, text, boolean)',
    'public.update_onboarding_state(text, boolean)',
    'public.update_post_counts()',
    'public.update_tribe_member_count()',
    'public.upgrade_user_tier(uuid, text, text)'
  ];
  dicht_a text[] := array[
    'public.archive_and_reset_quiz(text)',
    'public.can_use_nova(uuid)',
    'public.get_adaptive_recommendations(uuid, integer)',
    'public.get_admin_metrics()',
    'public.get_admin_users()',
    'public.get_dashboard_metrics()',
    'public.get_style_profile_history(uuid)',
    'public.get_swipe_global_stats()',
    'public.get_swipe_photo_stats()',
    'public.get_user_detail(uuid)',
    'public.is_current_user_admin()',
    'public.log_admin_action(text, uuid, jsonb, text, text)',
    'public.record_swipe(text, text, uuid, jsonb)',
    'public.search_users(text, text, boolean, boolean, integer, integer)',
    'public.send_admin_notification(uuid, text, text, text, text, text, text, timestamp with time zone)',
    'public.set_user_admin(uuid, boolean, text)',
    'public.set_user_tier(uuid, text, text)',
    'public.update_user_preferences_from_interactions(uuid)'
  ];
  open_c text[] := array[
    'public.apply_calibration_to_profile(uuid, text)',
    'public.get_blog_post_by_slug(text)',
    'public.get_published_blog_posts(integer, integer, text)',
    'public.increment_blog_view_count(text)',
    'public.keten_controleer_retailer(text)',
    'public.log_security_event(text, text, uuid, text, text, text, jsonb)',
    'public.tel_gebeurtenis(text)'
  ];
  gewijzigd text[] := array[
    'public.get_style_profile_history(uuid)',
    'public.can_use_nova(uuid)',
    'public.update_user_preferences_from_interactions(uuid)',
    'public.get_swipe_global_stats()',
    'public.get_swipe_photo_stats()',
    'public.log_admin_action(text, uuid, jsonb, text, text)',
    'public.record_swipe(text, text, uuid, jsonb)',
    'public.apply_calibration_to_profile(uuid, text)',
    'public.log_security_event(text, text, uuid, text, text, text, jsonb)',
    'public.handle_new_user()'
  ];

  v_qa uuid; v_qa_claims text; v_qa_profiel uuid;
  v_beheerder uuid; v_beheerder_claims text;
  v_vreemd uuid := gen_random_uuid();
  v_sessie text := 'proef-rpc-' || gen_random_uuid();
  v_qa_sessie text := 'proef-rpc-qa-' || gen_random_uuid();
  v_swipe_eigen uuid; v_swipe_ander uuid;
  v_slug text;
  groot text := repeat('x', 5000);
  kenmerken text := '{"colors":[],"styles":[],"price_tier":"mid","total_price":10,"occasion":"casual","formality_score":5}';
  anon_claims text := '{"role":"anon"}';

  rij record; s text; rp regprocedure; args text; v text; opdracht text; verwacht text; gelukt boolean;
  n_dicht int; n_open int; n_anders int; n_overload int; namen_open text; namen_anders text;
  uit text := ''; n_ok int := 0; n_af int := 0;
begin
  set local lock_timeout = '3s';
  set local statement_timeout = '30s';

  select id, json_build_object('sub', id, 'email', email, 'role', 'authenticated', 'app_metadata', coalesce(raw_app_meta_data, '{}'::jsonb))::text
    into v_qa, v_qa_claims from auth.users where email = 'info+qa@fitfi.ai';
  select id, json_build_object('sub', id, 'email', email, 'role', 'authenticated', 'app_metadata', coalesce(raw_app_meta_data, '{}'::jsonb))::text
    into v_beheerder, v_beheerder_claims from auth.users where email = 'info@fitfi.ai';
  if v_qa is null or v_beheerder is null then raise exception 'QA-account of beheerder ontbreekt'; end if;
  if exists (select 1 from public.profiles where id = v_qa and is_admin) then raise exception 'QA-account is beheerder: proef afgebroken'; end if;
  select id into v_qa_profiel from public.style_profiles where user_id = v_qa order by created_at desc limit 1;
  if v_qa_profiel is null then raise exception 'QA-account heeft geen style_profile'; end if;
  select slug into v_slug from public.blog_posts where status = 'published' order by published_at desc limit 1;

  -- Stand
  uit := uit || E'\nUITSLAG INFO  20261102140000 op deze database = ' ||
    case when has_function_privilege('anon', 'public.update_product_link_status(uuid, text, integer)'::regprocedure, 'execute') then 'nee' else 'ja' end;

  -- Rechten: B voor anon en QA, A voor anon. Alleen aanroepen als de rol het echt niet mag.
  for rij in select * from (values
    ('B dicht voor anon', 'anon', dicht_b),
    ('B dicht voor QA', 'authenticated', dicht_b),
    ('A dicht voor anon', 'anon', dicht_a)
  ) t(naam, r, lijst) loop
    n_dicht := 0; n_open := 0; n_anders := 0; n_overload := 0; namen_open := ''; namen_anders := '';
    foreach s in array rij.lijst loop
      rp := to_regprocedure(s);
      if rp is null then n_anders := n_anders + 1; namen_anders := namen_anders || ' ' || s || '=ONTBREEKT'; continue; end if;
      if has_function_privilege(rij.r, rp, 'execute') then
        n_open := n_open + 1; namen_open := namen_open || ' ' || split_part(s, '(', 1); continue;
      end if;
      select string_agg('null::' || format_type(a.t, null), ', ' order by a.o) into args
        from pg_proc p, unnest(p.proargtypes::oid[]) with ordinality a(t, o) where p.oid = rp;
      opdracht := 'select ' || split_part(s, '(', 1) || '(' || coalesce(args, '') || ')';
      begin
        if rij.r = 'anon' then
          perform set_config('request.jwt.claims', anon_claims, true);
          set local role anon;
        else
          perform set_config('request.jwt.claims', v_qa_claims, true);
          set local role authenticated;
        end if;
        execute opdracht;
        n_anders := n_anders + 1; namen_anders := namen_anders || ' ' || split_part(s, '(', 1) || '=geen fout';
      exception when others then
        if sqlstate = '42501' then n_dicht := n_dicht + 1;
        -- get_referral_leaderboard(): de aanroep kan niet kiezen tussen twee overloads, het recht is hierboven al gemeten.
        elsif sqlstate = '42725' then n_overload := n_overload + 1;
        else n_anders := n_anders + 1; namen_anders := namen_anders || ' ' || split_part(s, '(', 1) || '=' || sqlstate; end if;
      end;
      reset role;
    end loop;
    if n_open = 0 and n_anders = 0 then n_ok := n_ok + 1; else n_af := n_af + 1; end if;
    uit := uit || E'\nUITSLAG ' || case when n_open = 0 and n_anders = 0 then 'OK   ' else 'AFWIJKING ' end || rij.naam
      || ': FOUT(42501)=' || n_dicht || ' overload=' || n_overload || ' open=' || n_open || ' anders=' || n_anders
      || case when n_open > 0 then ' [' || left(namen_open, 200) || ' ]' else '' end
      || case when n_anders > 0 then ' {' || left(namen_anders, 200) || ' }' else '' end;
  end loop;

  -- Rechten die moeten blijven
  for rij in select * from (values
    ('A blijft voor authenticated', 'authenticated', dicht_a),
    ('C blijft voor anon', 'anon', open_c),
    ('C blijft voor authenticated', 'authenticated', open_c),
    ('B blijft voor service_role', 'service_role', dicht_b),
    ('A blijft voor service_role', 'service_role', dicht_a)
  ) t(naam, r, lijst) loop
    select count(*) filter (where has_function_privilege(rij.r, to_regprocedure(x), 'execute')), count(*)
      into n_dicht, n_open from unnest(rij.lijst) x;
    if n_dicht = n_open then n_ok := n_ok + 1; else n_af := n_af + 1; end if;
    uit := uit || E'\nUITSLAG ' || case when n_dicht = n_open then 'OK   ' else 'AFWIJKING ' end || rij.naam || ': ' || n_dicht || ' van ' || n_open;
  end loop;

  -- Gewijzigde functies: nog steeds SECURITY DEFINER met een eigen search_path
  select count(*) filter (where p.prosecdef and exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')), count(*)
    into n_dicht, n_open from unnest(gewijzigd) x, pg_proc p where p.oid = to_regprocedure(x);
  if n_dicht = 10 and n_open = 10 then n_ok := n_ok + 1; else n_af := n_af + 1; end if;
  uit := uit || E'\nUITSLAG ' || case when n_dicht = 10 and n_open = 10 then 'OK   ' else 'AFWIJKING ' end || 'gewijzigde functies definer met search_path: ' || n_dicht || ' van ' || n_open;

  -- Rijen voor de proef, alleen binnen dit blok
  update public.style_profiles set session_id = v_qa_sessie where id = v_qa_profiel;
  insert into public.outfit_calibration_feedback (user_id, session_id, outfit_data, feedback, outfit_archetypes, response_time_ms) values
    (null, v_sessie, '{}', 'spot_on', '{"proef_stijl": 1}', 2000),
    (v_qa, v_qa_sessie, '{}', 'spot_on', '{"proef_stijl": 1}', 2000),
    (v_beheerder, 'proef-rpc-ander', '{}', 'spot_on', '{"proef_stijl": 1}', 2000);
  insert into public.calibration_sessions (user_id) values (v_qa) returning id into v_swipe_eigen;
  insert into public.calibration_sessions (user_id) values (v_beheerder) returning id into v_swipe_ander;

  -- Gedrag, op volgorde. Rol postgres is een nacontrole. Verwacht ~x is een reguliere expressie.
  for rij in select * from (values
    -- Dicht: vrij id, als QA tegen een willekeurige uuid
    ('qa can_use_nova(ander)',          'qa',   $q$select count(*)::text from public.can_use_nova('{vreemd}')$q$, 'FOUT(42501)'),
    ('qa voorkeuren(ander)',            'qa',   $q$select 'gelukt' from public.update_user_preferences_from_interactions('{vreemd}')$q$, 'FOUT(42501)'),
    ('qa geschiedenis(ander) geeft eigen', 'qa', $q$select public.get_style_profile_history('{vreemd}')->'current_profile'->>'id'$q$, '{qa_profiel}'),
    ('qa swipe_global_stats',           'qa',   $q$select public.get_swipe_global_stats()::text$q$, 'FOUT(42501)'),
    ('qa swipe_photo_stats',            'qa',   $q$select count(*)::text from public.get_swipe_photo_stats()$q$, 'FOUT(42501)'),
    ('qa log_admin_action',             'qa',   $q$select public.log_admin_action('proef-rpc')::text$q$, 'FOUT(42501)'),
    ('qa record_swipe eigen sessie',    'qa',   $q$select 'gelukt' from public.record_swipe('proef-rpc-1', 'right', '{swipe_eigen}', '{kenmerken}')$q$, 'gelukt'),
    ('  eigen sessie bijgewerkt',       'postgres', $q$select outfits_shown::text from public.calibration_sessions where id = '{swipe_eigen}'$q$, '1'),
    ('qa record_swipe andermans sessie','qa',   $q$select 'gelukt' from public.record_swipe('proef-rpc-2', 'right', '{swipe_ander}', '{kenmerken}')$q$, 'gelukt'),
    ('  andermans sessie ongemoeid',    'postgres', $q$select outfits_shown::text from public.calibration_sessions where id = '{swipe_ander}'$q$, '0'),
    -- Dicht: anon tegen het QA-account
    ('anon apply(qa, null)',            'anon', $q$select 'gelukt' from public.apply_calibration_to_profile('{qa}', null)$q$, 'FOUT(42501)'),
    ('anon apply(null, sessie van qa)', 'anon', $q$select 'gelukt' from public.apply_calibration_to_profile(null, '{qa_sessie}')$q$, 'gelukt'),
    ('  profiel qa ongemoeid',          'postgres', $q$select coalesce(visual_preference_embedding->>'proef_stijl', 'leeg') from public.style_profiles where id = '{qa_profiel}'$q$, 'leeg'),
    ('anon log login_success',          'anon', $q$select 'gelukt' from public.log_security_event('login_success', 'low')$q$, 'FOUT(42501)'),
    -- Blijft: de quiz zonder account
    ('anon maakt style_profile',        'anon', $q$insert into public.style_profiles (session_id, archetype, color_profile, quiz_answers) values ('{sessie}', '{}', '{}', '{}')$q$, 'NULL'),
    ('  profiel bestaat',               'postgres', $q$select count(*)::text from public.style_profiles where session_id = '{sessie}' and user_id is null$q$, '1'),
    ('anon apply(null, null)',          'anon', $q$select 'gelukt' from public.apply_calibration_to_profile(null, null)$q$, 'gelukt'),
    ('anon apply onbekende sessie',     'anon', $q$select 'gelukt' from public.apply_calibration_to_profile(null, 'proef-rpc-bestaat-niet')$q$, 'gelukt'),
    ('anon apply(null, sessie)',        'anon', $q$select 'gelukt' from public.apply_calibration_to_profile(null, '{sessie}')$q$, 'gelukt'),
    ('  embedding eerste keer',         'postgres', $q$select visual_preference_embedding->>'proef_stijl' from public.style_profiles where session_id = '{sessie}'$q$, '65.00'),
    ('anon apply nog een keer',         'anon', $q$select 'gelukt' from public.apply_calibration_to_profile(null, '{sessie}')$q$, 'gelukt'),
    ('  embedding schuift niet door',   'postgres', $q$select visual_preference_embedding->>'proef_stijl' from public.style_profiles where session_id = '{sessie}'$q$, '65.00'),
    ('  nieuwe feedback klaargezet',    'postgres', $q$insert into public.outfit_calibration_feedback (session_id, outfit_data, feedback, outfit_archetypes, response_time_ms, created_at) values ('{sessie}', '{}', 'spot_on', '{"proef_stijl": 1}', 2000, now() + interval '1 second')$q$, 'NULL'),
    ('anon apply na nieuwe feedback',   'anon', $q$select 'gelukt' from public.apply_calibration_to_profile(null, '{sessie}')$q$, 'gelukt'),
    ('  embedding schuift wel',         'postgres', $q$select ((visual_preference_embedding->>'proef_stijl')::numeric > 65)::text from public.style_profiles where session_id = '{sessie}'$q$, 'true'),
    -- apply ingelogd: p_user_id en p_session_id tellen niet
    ('qa apply(ander, anon-sessie)',    'qa',   $q$select 'gelukt' from public.apply_calibration_to_profile('{vreemd}', '{sessie}')$q$, 'gelukt'),
    ('  profiel qa bijgewerkt',         'postgres', $q$select visual_preference_embedding->>'proef_stijl' from public.style_profiles where id = '{qa_profiel}'$q$, '65.00'),
    ('qa apply nog een keer',           'qa',   $q$select 'gelukt' from public.apply_calibration_to_profile(null, null)$q$, 'gelukt'),
    ('  profiel qa schuift niet door',  'postgres', $q$select visual_preference_embedding->>'proef_stijl' from public.style_profiles where id = '{qa_profiel}'$q$, '65.00'),
    -- Feedback: alleen de eigen rijen
    ('qa leest andermans feedback',      'qa',   $q$select count(*)::text from public.outfit_calibration_feedback where session_id = 'proef-rpc-ander'$q$, '0'),
    ('qa wijzigt andermans feedback',    'qa',   $q$update public.outfit_calibration_feedback set response_time_ms = 1 where session_id = 'proef-rpc-ander'$q$, 'NULL'),
    ('  andermans feedback ongewijzigd', 'postgres', $q$select response_time_ms::text from public.outfit_calibration_feedback where session_id = 'proef-rpc-ander'$q$, '2000'),
    ('qa wist andermans feedback',       'qa',   $q$delete from public.outfit_calibration_feedback where session_id = 'proef-rpc-ander'$q$, 'NULL'),
    ('  andermans feedback bestaat nog', 'postgres', $q$select count(*)::text from public.outfit_calibration_feedback where session_id = 'proef-rpc-ander'$q$, '1'),
    ('qa feedback op andermans id',      'qa',   $q$insert into public.outfit_calibration_feedback (user_id, session_id, outfit_data, feedback, outfit_archetypes, response_time_ms) values ('{vreemd}', 'proef-rpc-spoof', '{}', 'spot_on', '{}', 2000)$q$, 'FOUT(42501)'),
    ('qa leest eigen feedback',          'qa',   $q$select (count(*) > 0)::text from public.outfit_calibration_feedback where user_id = '{qa}'$q$, 'true'),
    ('qa schrijft eigen feedback',       'qa',   $q$insert into public.outfit_calibration_feedback (user_id, session_id, outfit_data, feedback, outfit_archetypes, response_time_ms) values ('{qa}', 'proef-rpc-eigen', '{}', 'spot_on', '{}', 2000)$q$, 'NULL'),
    ('qa wist eigen feedback',           'qa',   $q$delete from public.outfit_calibration_feedback where session_id = 'proef-rpc-eigen'$q$, 'NULL'),
    ('  eigen feedback weg',             'postgres', $q$select count(*)::text from public.outfit_calibration_feedback where session_id = 'proef-rpc-eigen'$q$, '0'),
    ('cache-regels weg',                 'postgres', $q$select count(*)::text from pg_policies where policyname in ('System manages product cache', 'System manages similar users cache')$q$, '0'),
    -- log_security_event: anon met vreemde waarden, en precies zoals de site het stuurt
    ('anon login_failure, alles te groot', 'anon', $q$select 'gelukt' from public.log_security_event('login_failure', 'critical', '{qa}', '{groot}', '{groot}', 'proef-rpc-a', to_jsonb('{groot}'::text)) x$q$, 'gelukt'),
    ('  geen user_id, medium, afgekapt','postgres', $q$select (user_id is null and severity = 'medium' and length(ip_address) <= 64 and length(user_agent) <= 512 and details->>'afgekapt' = 'true')::text from public.security_events where endpoint = 'proef-rpc-a'$q$, 'true'),
    ('anon login_failure zoals de site','anon', $q$select 'gelukt' from public.log_security_event('login_failure', 'medium', null, null, 'proef', 'proef-rpc-b', to_jsonb('{"email":"inf***","reason":"invalid_credentials"}'::text)) x$q$, 'gelukt'),
    ('  details ongewijzigd',           'postgres', $q$select (jsonb_typeof(details) = 'string' and details #>> '{}' like '%invalid_credentials%')::text from public.security_events where endpoint = 'proef-rpc-b'$q$, 'true'),
    ('qa login_success op andermans id','qa',   $q$select 'gelukt' from public.log_security_event('login_success', 'low', '{vreemd}', null, null, 'proef-rpc-c') x$q$, 'gelukt'),
    ('  staat op qa',                   'postgres', $q$select (user_id = '{qa}')::text from public.security_events where endpoint = 'proef-rpc-c'$q$, 'true'),
    -- Blijft: de rest van de publieke site
    ('anon get_kandidaten',             'anon', $q$select count(*)::text from public.get_kandidaten('female', array['casual', 'work'], 0, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12)$q$, '~^[1-9]'),
    ('anon keten_controleer_retailer',  'anon', $q$select 'gelukt' from public.keten_controleer_retailer(null)$q$, 'gelukt'),
    ('anon get_published_blog_posts',   'anon', $q$select count(*)::text from public.get_published_blog_posts(1, 0, null)$q$, '~^[1-9]'),
    ('anon get_blog_post_by_slug',      'anon', $q$select count(*)::text from public.get_blog_post_by_slug('{slug}')$q$, '~^[1-9]'),
    ('anon mood_photos',                'anon', $q$select (count(*) > 0)::text from public.mood_photos$q$, 'true'),
    -- Blijft: QA
    ('qa is_current_user_admin',        'qa',   $q$select public.is_current_user_admin()::text$q$, 'false'),
    ('qa can_use_nova(zichzelf)',       'qa',   $q$select count(*)::text from public.can_use_nova('{qa}')$q$, '1'),
    ('qa get_style_profile_history()',  'qa',   $q$select public.get_style_profile_history()->'current_profile'->>'id'$q$, '{qa_profiel}'),
    ('qa voorkeuren(zichzelf)',         'qa',   $q$select 'gelukt' from public.update_user_preferences_from_interactions('{qa}')$q$, 'gelukt'),
    ('qa mood_photos',                  'qa',   $q$select (count(*) > 0)::text from public.mood_photos$q$, 'true'),
    -- Blijft: beheerder. Alleen tellen, geen inhoud.
    ('beheerder is_current_user_admin', 'beheerder', $q$select public.is_current_user_admin()::text$q$, 'true'),
    ('beheerder get_admin_users',       'beheerder', $q$select (count(*) > 0)::text from public.get_admin_users()$q$, 'true'),
    ('beheerder swipe_global_stats',    'beheerder', $q$select (public.get_swipe_global_stats() is not null)::text$q$, 'true'),
    ('beheerder log_admin_action',      'beheerder', $q$select (public.log_admin_action('proef-rpc') is not null)::text$q$, 'true'),
    ('beheerder swipe_photo_stats (kapot, ander pakket)', 'beheerder', $q$select count(*)::text from public.get_swipe_photo_stats()$q$, 'FOUT(42703)'),
    -- handle_new_user: de tak op het mailadres is weg, de rest staat er nog
    ('handle_new_user zonder %@fitfi.%','postgres', $q$select (prosrc not like '%@fitfi.%' and prosrc like '%gen_random_bytes%')::text from pg_proc where oid = 'public.handle_new_user()'::regprocedure$q$, 'true'),
    -- Standaardrechten: een nieuwe functie, alleen binnen dit blok
    ('  nieuwe functie aangemaakt',     'postgres', $q$create function public.proef_rpc_nieuw() returns int language sql as 'select 1'$q$, 'NULL'),
    ('nieuwe functie: anon',            'postgres', $q$select has_function_privilege('anon', 'public.proef_rpc_nieuw()'::regprocedure, 'execute')::text$q$, 'false'),
    ('nieuwe functie: authenticated',   'postgres', $q$select has_function_privilege('authenticated', 'public.proef_rpc_nieuw()'::regprocedure, 'execute')::text$q$, 'true'),
    ('nieuwe functie: service_role',    'postgres', $q$select has_function_privilege('service_role', 'public.proef_rpc_nieuw()'::regprocedure, 'execute')::text$q$, 'true'),
    -- Korte rijvergrendeling op rijen die de site ook gebruikt: als laatste
    ('anon tel_gebeurtenis',            'anon', $q$select 'gelukt' from public.tel_gebeurtenis('home')$q$, 'gelukt'),
    ('anon increment_blog_view_count',  'anon', $q$select 'gelukt' from public.increment_blog_view_count('{slug}')$q$, 'gelukt')
  ) t(naam, r, sql, verwacht) loop
    opdracht := replace(replace(replace(replace(replace(replace(replace(replace(replace(rij.sql,
      '{vreemd}', v_vreemd::text), '{qa_profiel}', v_qa_profiel::text), '{qa_sessie}', v_qa_sessie),
      '{qa}', v_qa::text), '{sessie}', v_sessie), '{swipe_eigen}', v_swipe_eigen::text),
      '{swipe_ander}', v_swipe_ander::text), '{slug}', coalesce(v_slug, 'proef-rpc-geen-post')), '{kenmerken}', kenmerken);
    opdracht := replace(opdracht, '{groot}', groot);
    verwacht := replace(rij.verwacht, '{qa_profiel}', v_qa_profiel::text);
    begin
      if rij.r = 'anon' then
        perform set_config('request.jwt.claims', anon_claims, true);
        set local role anon;
      elsif rij.r = 'qa' then
        perform set_config('request.jwt.claims', v_qa_claims, true);
        set local role authenticated;
      elsif rij.r = 'beheerder' then
        perform set_config('request.jwt.claims', v_beheerder_claims, true);
        set local role authenticated;
      else
        perform set_config('request.jwt.claims', '', true);
      end if;
      v := null;
      if opdracht like 'select %' then execute opdracht into v; else execute opdracht; end if;
      v := coalesce(v, 'NULL');
    exception when others then
      v := 'FOUT(' || sqlstate || ')';
    end;
    reset role;
    gelukt := case when verwacht like '~%' then v ~ substr(verwacht, 2) else v = verwacht end;
    if gelukt then n_ok := n_ok + 1; else n_af := n_af + 1; end if;
    if rij.naam not like '  %' or not gelukt or rij.verwacht <> 'NULL' then
      uit := uit || E'\nUITSLAG ' || case when gelukt then 'OK   ' else 'AFWIJKING ' end || rij.naam || ' = ' || v
        || case when gelukt then '' else ' (verwacht ' || verwacht || ')' end;
    end if;
  end loop;

  raise exception 'UITSLAG ok=% afwijking=% (alles teruggedraaid)%', n_ok, n_af, uit;
end $proef$;
