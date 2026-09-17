/*
  # get_kandidaten: plafond op p_per_category

  ## Probleem
  p_per_category gaat rechtstreeks in `k.rn <= greatest(1,
  coalesce(p_per_category, 12))`, zonder bovengrens. Een anonieme aanroeper
  (de RPC is `grant execute ... to anon`) kan met bijvoorbeeld 2000 de
  window-functie over veel meer kandidaatrijen per categorie laten
  materialiseren en teruggeven dan de app ooit vraagt (vandaag 40, spec 5.3
  noemt 12), en zo gegarandeerd de statement-timeout van 8 seconden
  raken -- een gratis manier om de RPC voor iedereen plat te leggen.

  ## Wat deze migratie doet
  Klemt p_per_category op maximaal 60 (de 40 die de app vandaag gebruikt,
  plus ruimte) met `least(60, greatest(1, coalesce(p_per_category, 12)))`.
  Verder ongewijzigd.

  ## Terugdraaien
  Let op de volgorde: draai deze migratie terug vóór 20260914120500 en
  20260914120400 (zie hun terugdraai-blokken).

  Vorige versie van de functie opnieuw toepassen:
  supabase db query --linked -f
  supabase/migrations/20260914120800_get_kandidaten_prijsbucket_tiebreak.sql
*/

create or replace function get_kandidaten(
  p_gender text,
  p_occasions text[],
  p_budget_min int,
  p_budget_max int,
  p_axes jsonb,
  p_liked_ids uuid[],
  p_disliked_ids uuid[],
  p_per_category int default 12
)
returns table (
  product_id uuid,
  category text,
  score real,
  attrs jsonb,
  product jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  with kandidaten as (
    select
      pa.product_id as kandidaat_id,
      pa.category as kandidaat_categorie,
      0::real as kandidaat_score,
      jsonb_build_object(
        'canonical_id', pa.canonical_id,
        'is_fashion', pa.is_fashion,
        'category', pa.category,
        'gender', pa.gender,
        'price_band', pa.price_band,
        'classifier_version', pa.classifier_version
      ) as kandidaat_attrs,
      row_number() over (
        partition by pa.category
        order by
          floor(abs(pa.price - ((p_budget_min + p_budget_max) / 2.0)) / 10) asc,
          pa.product_id asc
      ) as rn
    from product_attributes pa
    where pa.product_id = pa.canonical_id
      and pa.is_fashion
      and pa.in_stock
      and pa.category is not null
      and pa.classifier_version is not null
      and (p_gender = 'unisex' or pa.gender in (p_gender, 'unisex'))
      and pa.price >= p_budget_min
      and pa.price <= p_budget_max
      and not (pa.product_id = any (coalesce(p_disliked_ids, '{}'::uuid[])))
  )
  select
    k.kandidaat_id,
    k.kandidaat_categorie,
    k.kandidaat_score,
    k.kandidaat_attrs,
    to_jsonb(p.*) as kandidaat_product
  from kandidaten k
  join products p on p.id = k.kandidaat_id
  where k.rn <= least(60, greatest(1, coalesce(p_per_category, 12)))
  order by k.kandidaat_categorie, k.rn;
$$;

grant execute on function get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int)
  to anon, authenticated;
