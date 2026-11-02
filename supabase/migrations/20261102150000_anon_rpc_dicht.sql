/*
  # SECURITY DEFINER-functies dicht voor wie er niets mee hoort te doen

  Gemeten op 2 nov 2026 op productie, zonder iets aan te roepen. 88 SECURITY DEFINER-functies in
  public stonden open voor anon, want elke nieuwe functie van postgres krijgt daar standaard EXECUTE.
  Met de anon-sleutel, die in de bundle staat, kon iedereen bijvoorbeeld:

  - het stijlprofiel van elke gebruiker verschuiven (apply_calibration_to_profile);
  - tier, Nova-gebruik en resets per id opvragen (can_use_nova, get_style_profile_history);
  - punten geven, XP schrijven en wissen (award_points, log_daily_checkin, cleanup_old_outfit_visuals);
  - onbeperkt rijen schrijven in security_events, ook op naam van een ander (log_security_event).

  Een account is met een paar klikken gemaakt (mailer_autoconfirm true), dus "ingelogd" is geen
  echte grens. Daarom krijgen de functies met een vrij id ook een controle in de functie zelf.
  Gebruik daar IS DISTINCT FROM: auth.uid() != x is NULL voor anon en laat door.

  Telling van de 88:

  - 59 dicht voor iedereen behalve service_role. De zestigste, update_product_link_status, zit in
    20261102140000. Geen aanroep in src, netlify of scripts die de site kan bereiken: check_rate_limit
    (useRateLimit), get_user_activity_dates en log_daily_checkin (gamificationService) staan in code
    die niet vanaf src/main.tsx te bereiken is; compute_calibration_adjustments en
    get_calibration_effectiveness staan in methodes zonder aanroeper.
  - 18 alleen nog ingelogd.
  - 7 blijven open: keten_controleer_retailer (get_kandidaten is invoker, dus quiz en shop vallen
    anders om), tel_gebeurtenis, de drie blogfuncties, apply_calibration_to_profile, log_security_event.
  - 3 ongemoeid: calculate_level, is_fitfi_email, should_show_hint. Geen data.

  Wat er per functie verandert staat in de code. Drie hebben uitleg nodig:

  - apply_calibration_to_profile blijft open voor anon: de quiz zonder account roept hem aan en blijft
    hangen bij een fout (CalibrationStep.tsx:294). Ingelogd telt alleen auth.uid(). Anoniem wordt een
    p_user_id geweigerd en alleen een sessie met user_id IS NULL bijgewerkt. Zonder nieuwe feedback
    sinds last_calibration_at doet een tweede aanroep niets. Komt er wel nieuwe feedback, dan telt de
    oude opnieuw mee: dat zit in compute_calibration_adjustments en blijft zo.
  - log_security_event blijft open voor anon: een mislukte inlog is anoniem. user_id is altijd
    auth.uid(), anoniem kan alleen login_failure met ernst medium, details boven 2000 tekens gaat weg
    en de tekstvelden worden afgekapt. Het aantal rijen blijft onbegrensd.
  - handle_new_user gaf is_admin aan elk adres op %@fitfi.%, ook fitfi.aanvaller.nl. Die tak is nu dood
    omdat gen_random_bytes niet in het search_path staat. Hij gaat weg voordat iemand dat repareert.

  Standaardrechten: een nieuwe functie van postgres in public krijgt EXECUTE voor authenticated en
  service_role, niet meer voor anon of public. Een volgende migratie met een publieke functie moet dus zelf:

    grant execute on function public.naam(args) to anon;

  Dat geldt ook bij drop en opnieuw aanmaken, bijvoorbeeld een nieuwe signatuur van get_kandidaten.
  create or replace met dezelfde signatuur houdt de rechten. Het recht voor public kan alleen
  globaal weg, dus ook nieuwe functies van postgres in andere schema's krijgen het niet meer.

  Toets: scripts/proef-anon-rpc.sql.
*/

begin;
set local lock_timeout = '5s';

-- 1. Functie-inhoud. create or replace houdt de rechten; de revokes hieronder volgen daarna.

-- Vrij id genegeerd: alleen auth.uid().
CREATE OR REPLACE FUNCTION public.get_style_profile_history(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
v_user_id uuid;
v_history jsonb;
v_current_profile jsonb;
BEGIN
v_user_id := auth.uid();

IF v_user_id IS NULL THEN
RAISE EXCEPTION 'Not authenticated';
END IF;

SELECT jsonb_agg(
jsonb_build_object(
'id', id,
'archetype', archetype,
'color_profile', color_profile,
'created_at', created_at,
'archived_at', archived_at,
'reset_reason', reset_reason,
'profile_data', profile_data
)
ORDER BY archived_at DESC
)
INTO v_history
FROM style_profile_history
WHERE user_id = v_user_id;

SELECT jsonb_build_object(
'id', id,
'archetype', archetype,
'color_profile', color_profile,
'created_at', created_at,
'is_current', true
)
INTO v_current_profile
FROM style_profiles
WHERE user_id = v_user_id
ORDER BY created_at DESC
LIMIT 1;

RETURN jsonb_build_object(
'current_profile', v_current_profile,
'history', COALESCE(v_history, '[]'::jsonb),
'total_resets', (
SELECT COUNT(*) FROM quiz_resets WHERE user_id = v_user_id
)
);
END;
$function$;

-- Vrij id: alleen je eigen.
CREATE OR REPLACE FUNCTION public.can_use_nova(p_user_id uuid)
 RETURNS TABLE(can_use boolean, current_count integer, tier_limit integer, tier text, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
v_tier text;
v_count integer;
v_limit integer;
v_has_profile boolean;
v_quiz_completed boolean;
BEGIN
IF p_user_id IS DISTINCT FROM auth.uid() THEN
RAISE EXCEPTION 'Geen toegang' USING ERRCODE = '42501';
END IF;

-- Check if user has profile
SELECT EXISTS(
SELECT 1 FROM profiles WHERE id = p_user_id
) INTO v_has_profile;

IF NOT v_has_profile THEN
RETURN QUERY SELECT
false AS can_use,
0 AS current_count,
0 AS tier_limit,
'none'::text AS tier,
'No profile found. Please sign up.'::text AS reason;
RETURN;
END IF;

-- Get user tier
SELECT profiles.tier INTO v_tier
FROM profiles
WHERE id = p_user_id;

IF v_tier IS NULL THEN
v_tier := 'free';
END IF;

-- Set limits
v_limit := CASE
WHEN v_tier = 'founder' THEN 999999
WHEN v_tier = 'premium' THEN 100
ELSE 10
END;

-- Get today's usage
SELECT COALESCE(message_count, 0) INTO v_count
FROM nova_usage
WHERE user_id = p_user_id
AND date = CURRENT_DATE;

IF v_count IS NULL THEN
v_count := 0;
END IF;

-- Check if quiz completed (RELAXED - dev mode)
SELECT EXISTS(
SELECT 1 FROM style_profiles
WHERE style_profiles.user_id = p_user_id
AND completed_at IS NOT NULL
) INTO v_quiz_completed;

-- DEVELOPMENT MODE: Allow access without quiz
-- Log warning but don't block
-- TO ENFORCE: Remove this IF block and uncomment strict check below
IF NOT v_quiz_completed THEN
RAISE NOTICE 'User % accessing Nova without completed quiz (dev mode)', p_user_id;
END IF;

-- STRICT MODE (currently disabled):
-- IF NOT v_quiz_completed THEN
--   RETURN QUERY SELECT
--     false AS can_use,
--     v_count AS current_count,
--     v_limit AS tier_limit,
--     v_tier AS tier,
--     'Please complete the style quiz first.'::text AS reason;
--   RETURN;
-- END IF;

-- Check rate limit
IF v_count >= v_limit THEN
RETURN QUERY SELECT
false AS can_use,
v_count AS current_count,
v_limit AS tier_limit,
v_tier AS tier,
format('Daily limit reached (%s messages). Upgrade for more.', v_limit)::text AS reason;
RETURN;
END IF;

-- All checks passed
RETURN QUERY SELECT
true AS can_use,
v_count AS current_count,
v_limit AS tier_limit,
v_tier AS tier,
'OK'::text AS reason;
END;
$function$;

-- Vrij id: alleen je eigen.
CREATE OR REPLACE FUNCTION public.update_user_preferences_from_interactions(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
v_brands text[];
v_colors text[];
v_prices numeric[];
v_interaction_count int;
BEGIN
IF p_user_id IS DISTINCT FROM auth.uid() THEN
RAISE EXCEPTION 'Geen toegang' USING ERRCODE = '42501';
END IF;

SELECT COUNT(*) INTO v_interaction_count
FROM product_interactions
WHERE user_id = p_user_id;

SELECT ARRAY_AGG(DISTINCT p.brand)
INTO v_brands
FROM product_interactions pi
JOIN products p ON p.id = pi.product_id
WHERE pi.user_id = p_user_id
AND pi.interaction_type IN ('like', 'save', 'purchase')
AND p.brand IS NOT NULL;

SELECT ARRAY_AGG(DISTINCT color)
INTO v_colors
FROM product_interactions pi
JOIN products p ON p.id = pi.product_id
CROSS JOIN LATERAL unnest(p.colors) AS color
WHERE pi.user_id = p_user_id
AND pi.interaction_type IN ('like', 'save', 'purchase');

SELECT ARRAY_AGG(p.price)
INTO v_prices
FROM product_interactions pi
JOIN products p ON p.id = pi.product_id
WHERE pi.user_id = p_user_id
AND pi.interaction_type IN ('like', 'save', 'purchase')
AND p.price IS NOT NULL;

INSERT INTO user_product_preferences (
user_id,
preferred_brands,
preferred_colors,
preferred_price_range,
interaction_count,
last_interaction_at,
updated_at
)
VALUES (
p_user_id,
COALESCE(v_brands, ARRAY[]::text[]),
COALESCE(v_colors, ARRAY[]::text[]),
CASE 
WHEN v_prices IS NOT NULL AND array_length(v_prices, 1) > 0 THEN
int4range(
(SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY price) FROM unnest(v_prices) price)::int,
(SELECT percentile_cont(0.75) WITHIN GROUP (ORDER BY price) FROM unnest(v_prices) price)::int,
'[]'
)
ELSE NULL
END,
v_interaction_count,
now(),
now()
)
ON CONFLICT (user_id) DO UPDATE SET
preferred_brands = EXCLUDED.preferred_brands,
preferred_colors = EXCLUDED.preferred_colors,
preferred_price_range = EXCLUDED.preferred_price_range,
interaction_count = EXCLUDED.interaction_count,
last_interaction_at = EXCLUDED.last_interaction_at,
updated_at = now();
END;
$function$;

-- Alleen beheerders.
CREATE OR REPLACE FUNCTION public.get_swipe_global_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
IF public.is_current_user_admin() IS NOT TRUE THEN
RAISE EXCEPTION 'Geen toegang' USING ERRCODE = '42501';
END IF;

RETURN (
SELECT json_build_object(
'total_swipes', COUNT(*),
'total_users', COUNT(DISTINCT session_id),
'avg_swipes_per_user', ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id), 0), 1),
'avg_like_rate', ROUND(
(COUNT(*) FILTER (WHERE swipe_direction = 'like')::numeric * 100) / 
NULLIF(COUNT(*), 0), 
1
),
'male_photos_count', (SELECT COUNT(*) FROM mood_photos WHERE gender = 'male' AND active = true),
'female_photos_count', (SELECT COUNT(*) FROM mood_photos WHERE gender = 'female' AND active = true)
)
FROM style_swipes
);
END;
$function$;

-- Alleen beheerders. Faalt ook dan nog op style_swipes.photo_id: ander pakket.
CREATE OR REPLACE FUNCTION public.get_swipe_photo_stats()
 RETURNS TABLE(photo_id bigint, photo_url text, gender text, mood_tags jsonb, total_swipes bigint, likes bigint, dislikes bigint, like_rate numeric, unique_users bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
IF public.is_current_user_admin() IS NOT TRUE THEN
RAISE EXCEPTION 'Geen toegang' USING ERRCODE = '42501';
END IF;

RETURN QUERY
SELECT
mp.id as photo_id,
mp.photo_url,
mp.gender,
mp.mood_tags,
COUNT(ss.id) as total_swipes,
COUNT(*) FILTER (WHERE ss.swipe_direction = 'like') as likes,
COUNT(*) FILTER (WHERE ss.swipe_direction = 'dislike') as dislikes,
ROUND(
(COUNT(*) FILTER (WHERE ss.swipe_direction = 'like')::numeric * 100) / 
NULLIF(COUNT(ss.id), 0), 
1
) as like_rate,
COUNT(DISTINCT ss.session_id) as unique_users
FROM mood_photos mp
LEFT JOIN style_swipes ss ON ss.photo_id = mp.id
WHERE mp.active = true
GROUP BY mp.id, mp.photo_url, mp.gender, mp.mood_tags
HAVING COUNT(ss.id) > 0
ORDER BY like_rate DESC NULLS LAST;
END;
$function$;

-- Alleen beheerders.
CREATE OR REPLACE FUNCTION public.log_admin_action(p_action text, p_target_user_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
v_log_id uuid;
BEGIN
IF public.is_current_user_admin() IS NOT TRUE THEN
RAISE EXCEPTION 'Geen toegang' USING ERRCODE = '42501';
END IF;

INSERT INTO admin_audit_log (
admin_id,
action,
target_user_id,
details,
ip_address,
user_agent
) VALUES (
auth.uid(),
p_action,
p_target_user_id,
p_details,
p_ip_address,
p_user_agent
)
RETURNING id INTO v_log_id;

RETURN v_log_id;
END;
$function$;

-- De sessie moet van jou zijn.
CREATE OR REPLACE FUNCTION public.record_swipe(p_outfit_id text, p_swipe_direction text, p_session_id uuid, p_outfit_features jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
preference_value NUMERIC(3, 2);
session_data RECORD;
updated_preferences JSONB;
BEGIN
-- Convert swipe to preference score
preference_value := CASE p_swipe_direction
WHEN 'right' THEN 1.0  -- Loved it
WHEN 'up' THEN 0.7     -- Liked it
WHEN 'left' THEN 0.0   -- Disliked it
ELSE 0.5
END;

-- Insert swipe record
INSERT INTO swipe_preferences (
user_id,
outfit_id,
swipe_direction,
session_id,
dominant_colors,
style_tags,
price_tier,
total_price,
occasion,
formality_score,
swipe_position,
actual_preference
)
VALUES (
auth.uid(),
p_outfit_id,
p_swipe_direction,
p_session_id,
p_outfit_features->'colors',
ARRAY(SELECT jsonb_array_elements_text(p_outfit_features->'styles')),
p_outfit_features->>'price_tier',
(p_outfit_features->>'total_price')::numeric,
p_outfit_features->>'occasion',
(p_outfit_features->>'formality_score')::integer,
(SELECT COUNT(*) + 1 FROM swipe_preferences WHERE session_id = p_session_id),
preference_value
);

-- Update session incrementally
UPDATE calibration_sessions
SET
outfits_shown = outfits_shown + 1,
outfits_liked = outfits_liked + CASE WHEN p_swipe_direction IN ('right', 'up') THEN 1 ELSE 0 END,
outfits_disliked = outfits_disliked + CASE WHEN p_swipe_direction = 'left' THEN 1 ELSE 0 END,

-- Incremental learning (Bayesian updates)
learned_colors = CASE 
WHEN p_swipe_direction IN ('right', 'up') THEN
learned_colors || (p_outfit_features->'colors')
ELSE learned_colors
END,

learned_styles = learned_styles || jsonb_build_object(
'timestamp', now(),
'direction', p_swipe_direction,
'styles', p_outfit_features->'styles'
),

learned_price_range = CASE
WHEN p_swipe_direction IN ('right', 'up') THEN
jsonb_build_object(
'min', LEAST(
COALESCE((learned_price_range->>'min')::numeric, 999999),
(p_outfit_features->>'total_price')::numeric
),
'max', GREATEST(
COALESCE((learned_price_range->>'max')::numeric, 0),
(p_outfit_features->>'total_price')::numeric
),
'preferred_avg', (
(COALESCE((learned_price_range->>'preferred_avg')::numeric * outfits_liked, 0) + 
(p_outfit_features->>'total_price')::numeric) / (outfits_liked + 1)
)
)
ELSE learned_price_range
END

WHERE id = p_session_id AND user_id = auth.uid()
RETURNING learned_colors, learned_styles, learned_price_range INTO session_data;

-- Return updated preferences for next outfit generation
updated_preferences := jsonb_build_object(
'colors', session_data.learned_colors,
'styles', session_data.learned_styles,
'price_range', session_data.learned_price_range,
'preference_value', preference_value
);

RETURN updated_preferences;
END;
$function$;

-- Blijft open voor anon. Zie de kop.
CREATE OR REPLACE FUNCTION public.apply_calibration_to_profile(p_user_id uuid DEFAULT NULL::uuid, p_session_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
v_uid uuid := auth.uid();
v_sessie text;
v_last_calibration timestamptz;
v_adjustments jsonb;
v_current_embedding jsonb;
v_archetype text;
v_adjustment_value numeric;
v_current_value numeric;
v_new_value numeric;
BEGIN
-- Ingelogd telt alleen auth.uid(). Anoniem telt alleen een sessie zonder eigenaar.
IF v_uid IS NULL AND p_user_id IS NOT NULL THEN
RAISE EXCEPTION 'Geen toegang' USING ERRCODE = '42501';
END IF;

IF v_uid IS NOT NULL THEN
SELECT visual_preference_embedding, last_calibration_at INTO v_current_embedding, v_last_calibration
FROM style_profiles
WHERE user_id = v_uid
ORDER BY created_at DESC
LIMIT 1;
ELSIF p_session_id IS NOT NULL THEN
v_sessie := p_session_id;
SELECT visual_preference_embedding, last_calibration_at INTO v_current_embedding, v_last_calibration
FROM style_profiles
WHERE session_id = v_sessie AND user_id IS NULL
ORDER BY created_at DESC
LIMIT 1;
ELSE
RETURN;
END IF;

-- Geen fout zonder profiel: de quiz wacht hierop (CalibrationStep.tsx:294).
IF NOT FOUND THEN
RETURN;
END IF;

-- Geen nieuwe feedback sinds de vorige keer: dan niet nog een keer optellen.
IF v_last_calibration IS NOT NULL AND NOT EXISTS (
SELECT 1 FROM outfit_calibration_feedback f
WHERE f.created_at > v_last_calibration
AND (f.user_id = v_uid OR f.session_id = v_sessie)
) THEN
RETURN;
END IF;

v_adjustments := compute_calibration_adjustments(v_uid, v_sessie);

IF v_current_embedding IS NULL OR v_current_embedding = '{}'::jsonb THEN
v_current_embedding := '{}'::jsonb;
END IF;

FOR v_archetype, v_adjustment_value IN
SELECT * FROM jsonb_each_text(v_adjustments)
LOOP
v_current_value := COALESCE((v_current_embedding->>v_archetype)::numeric, 50.0);
v_new_value := v_current_value + (v_adjustment_value::numeric * 100.0);
v_new_value := GREATEST(0.0, LEAST(100.0, v_new_value));

v_current_embedding := jsonb_set(
v_current_embedding,
ARRAY[v_archetype],
to_jsonb(ROUND(v_new_value, 2))
);
END LOOP;

IF v_uid IS NOT NULL THEN
UPDATE style_profiles
SET
visual_preference_embedding = v_current_embedding,
last_calibration_at = now(),
updated_at = now()
WHERE user_id = v_uid;
ELSE
UPDATE style_profiles
SET
visual_preference_embedding = v_current_embedding,
last_calibration_at = now(),
updated_at = now()
WHERE session_id = v_sessie AND user_id IS NULL;
END IF;
END;
$function$;

-- Blijft open voor anon. Zie de kop.
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_severity text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_endpoint text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
v_event_id uuid;
v_uid uuid := auth.uid();
v_details jsonb := p_details;
BEGIN
-- Anoniem bestaat alleen de mislukte inlog, en die is altijd medium (securityLogger.ts:135).
IF v_uid IS NULL AND p_event_type IS DISTINCT FROM 'login_failure' THEN
RAISE EXCEPTION 'Geen toegang' USING ERRCODE = '42501';
END IF;

-- Alleen de lengte telt: de site stuurt details als JSON-tekst, dus als jsonb-string, niet als object.
IF length(p_details::text) > 2000 THEN
v_details := jsonb_build_object('afgekapt', true, 'lengte', length(p_details::text));
END IF;

INSERT INTO security_events (event_type, severity, user_id, ip_address, user_agent, endpoint, details)
VALUES (
left(p_event_type, 100),
CASE WHEN v_uid IS NULL THEN 'medium' ELSE p_severity END,
v_uid,
left(p_ip_address, 64),
left(p_user_agent, 512),
left(p_endpoint, 256),
v_details
)
RETURNING id INTO v_event_id;
RETURN v_event_id;
END;
$function$;

-- Alleen de CASE op is_admin is weg. De rest, ook het search_path, blijft.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
v_referral_code text;
v_error_message text;
v_error_detail text;
v_error_hint text;
BEGIN
BEGIN
-- Generate unique referral code using hex encoding
LOOP
v_referral_code := lower(encode(gen_random_bytes(6), 'hex'));
EXIT WHEN NOT EXISTS (
SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code
);
END LOOP;

-- Insert profile with full_name and referral_code
INSERT INTO public.profiles (
id,
full_name,
referral_code,
tier,
is_admin
) VALUES (
NEW.id,
COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
v_referral_code,
'free',
false
);

-- Create user_stats if table exists
IF EXISTS (
SELECT 1 FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_stats'
) THEN
INSERT INTO public.user_stats (user_id)
VALUES (NEW.id)
ON CONFLICT (user_id) DO NOTHING;
END IF;

EXCEPTION
WHEN OTHERS THEN
-- Log error but don't fail the trigger
GET STACKED DIAGNOSTICS
v_error_message = MESSAGE_TEXT,
v_error_detail = PG_EXCEPTION_DETAIL,
v_error_hint = PG_EXCEPTION_HINT;

INSERT INTO public.trigger_errors (
trigger_name,
user_id,
error_message,
error_detail,
error_hint
) VALUES (
'handle_new_user',
NEW.id,
v_error_message,
v_error_detail,
v_error_hint
);

-- Log to PostgreSQL logs as well
RAISE WARNING 'handle_new_user trigger failed for user %: % (detail: %, hint: %)', 
NEW.id, v_error_message, v_error_detail, v_error_hint;
END;

-- ALWAYS return NEW (never fail registration)
RETURN NEW;
END;
$function$;

-- 2. Advies B: niemand meer, behalve service_role. Triggers blijven werken: die vragen geen EXECUTE bij het afgaan.
revoke execute on function public.admin_get_all_users() from public, anon, authenticated;
revoke execute on function public.admin_update_user_admin_status(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.admin_update_user_tier(uuid, text) from public, anon, authenticated;
revoke execute on function public.award_points(uuid, integer, text, text) from public, anon, authenticated;
revoke execute on function public.check_rate_limit(text, text, text, integer, integer) from public, anon, authenticated;
revoke execute on function public.clean_old_nova_memories() from public, anon, authenticated;
revoke execute on function public.cleanup_expired_dismissed_insights() from public, anon, authenticated;
revoke execute on function public.cleanup_old_outfit_visuals() from public, anon, authenticated;
revoke execute on function public.cleanup_old_rate_limits() from public, anon, authenticated;
revoke execute on function public.complete_daily_challenge(uuid, integer) from public, anon, authenticated;
revoke execute on function public.complete_onboarding_action(text) from public, anon, authenticated;
revoke execute on function public.compute_calibration_adjustments(uuid, text) from public, anon, authenticated;
revoke execute on function public.create_default_email_preferences() from public, anon, authenticated;
revoke execute on function public.create_user_referral_code() from public, anon, authenticated;
revoke execute on function public.dismiss_feature_tip(text) from public, anon, authenticated;
revoke execute on function public.find_similar_users(uuid, integer) from public, anon, authenticated;
revoke execute on function public.get_admin_dashboard_metrics() from public, anon, authenticated;
revoke execute on function public.get_best_colors(uuid) from public, anon, authenticated;
revoke execute on function public.get_calibration_effectiveness() from public, anon, authenticated;
revoke execute on function public.get_color_summary(uuid) from public, anon, authenticated;
revoke execute on function public.get_current_week_progress(uuid) from public, anon, authenticated;
revoke execute on function public.get_funnel_metrics(text) from public, anon, authenticated;
revoke execute on function public.get_heatmap_summary(text) from public, anon, authenticated;
revoke execute on function public.get_hint_performance(text) from public, anon, authenticated;
revoke execute on function public.get_leaderboard(text, integer) from public, anon, authenticated;
revoke execute on function public.get_onboarding_cohort_analysis(date, date) from public, anon, authenticated;
revoke execute on function public.get_onboarding_completion_rate() from public, anon, authenticated;
revoke execute on function public.get_onboarding_health_score() from public, anon, authenticated;
revoke execute on function public.get_popular_swap_categories() from public, anon, authenticated;
revoke execute on function public.get_predictive_insights(integer) from public, anon, authenticated;
revoke execute on function public.get_realtime_metrics() from public, anon, authenticated;
revoke execute on function public.get_referral_leaderboard() from public, anon, authenticated;
revoke execute on function public.get_referral_stats(uuid) from public, anon, authenticated;
revoke execute on function public.get_similar_memories(extensions.vector, uuid, double precision, integer) from public, anon, authenticated;
revoke execute on function public.get_swap_success_rate(uuid, text) from public, anon, authenticated;
revoke execute on function public.get_tribe_leaderboard(uuid, integer) from public, anon, authenticated;
revoke execute on function public.get_user_activity_dates(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.get_user_journey(uuid) from public, anon, authenticated;
revoke execute on function public.get_user_leaderboard_rank(uuid, text) from public, anon, authenticated;
revoke execute on function public.get_user_profile(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_referral_signup(text, uuid) from public, anon, authenticated;
revoke execute on function public.has_color_analysis(uuid) from public, anon, authenticated;
revoke execute on function public.increment_nova_usage(uuid) from public, anon, authenticated;
revoke execute on function public.keten_outfit_set(text, text) from public, anon, authenticated;
revoke execute on function public.log_daily_checkin(uuid) from public, anon, authenticated;
revoke execute on function public.log_supabase_error(text, text, text, text, text, jsonb, integer, text) from public, anon, authenticated;
revoke execute on function public.refresh_embedding_analytics() from public, anon, authenticated;
revoke execute on function public.refresh_onboarding_stats() from public, anon, authenticated;
revoke execute on function public.reset_user_quiz_data(uuid) from public, anon, authenticated;
revoke execute on function public.set_admin_for_fitfi_emails() from public, anon, authenticated;
revoke execute on function public.start_calibration_session() from public, anon, authenticated;
revoke execute on function public.submit_contact(text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.sync_admin_to_auth_metadata() from public, anon, authenticated;
revoke execute on function public.update_brand_affinity(uuid, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.update_onboarding_state(text, boolean) from public, anon, authenticated;
revoke execute on function public.update_post_counts() from public, anon, authenticated;
revoke execute on function public.update_tribe_member_count() from public, anon, authenticated;
revoke execute on function public.upgrade_user_tier(uuid, text, text) from public, anon, authenticated;

-- 3. Advies A: alleen nog ingelogd. is_current_user_admin moet voor authenticated blijven: 15 policies leunen erop.
revoke execute on function public.archive_and_reset_quiz(text) from public, anon;
revoke execute on function public.can_use_nova(uuid) from public, anon;
revoke execute on function public.get_adaptive_recommendations(uuid, integer) from public, anon;
revoke execute on function public.get_admin_metrics() from public, anon;
revoke execute on function public.get_admin_users() from public, anon;
revoke execute on function public.get_dashboard_metrics() from public, anon;
revoke execute on function public.get_style_profile_history(uuid) from public, anon;
revoke execute on function public.get_swipe_global_stats() from public, anon;
revoke execute on function public.get_swipe_photo_stats() from public, anon;
revoke execute on function public.get_user_detail(uuid) from public, anon;
revoke execute on function public.is_current_user_admin() from public, anon;
revoke execute on function public.log_admin_action(text, uuid, jsonb, text, text) from public, anon;
revoke execute on function public.record_swipe(text, text, uuid, jsonb) from public, anon;
revoke execute on function public.search_users(text, text, boolean, boolean, integer, integer) from public, anon;
revoke execute on function public.send_admin_notification(uuid, text, text, text, text, text, text, timestamp with time zone) from public, anon;
revoke execute on function public.set_user_admin(uuid, boolean, text) from public, anon;
revoke execute on function public.set_user_tier(uuid, text, text) from public, anon;
revoke execute on function public.update_user_preferences_from_interactions(uuid) from public, anon;

-- 4. Standaardrechten voor nieuwe functies van postgres.
-- Het recht voor anon is een regel per schema en gaat ook per schema weg. Het recht voor public is
-- ingebakken in Postgres en gaat alleen weg zonder "in schema": een revoke per schema doet daar niets.
alter default privileges for role postgres in schema public revoke execute on functions from anon;
alter default privileges for role postgres revoke execute on functions from public;

commit;
