/*
  # get_kandidaten: classifier_version verplicht

  ## Probleem
  get_kandidaten (20260914120500) filtert op canoniek, is_fashion,
  voorraad, gender en prijs, maar niet op classifier_version. Nieuwe rijen
  komen binnen met de ruwe feed-categorie en een lege classifier_version
  (vul_product_attributes, 20260914120500, zet category/is_fashion alleen
  vanuit de feed als classifier_version nog null is). Draait iemand na
  `npm run keten:vul` niet ook `npm run keten:classificeer`, dan serveert de
  RPC weer de ongeclassificeerde feed-categorie: precies het defect dat dit
  plan wegnam (zie taak 2/7).

  Vandaag kost deze guard niets: 0 van 87.985 kandidaatrijen (canoniek,
  is_fashion, in_stock) missen classifier_version (gemeten 2026-09-17). Hij
  is bedoeld als stopregel voor de volgende feed-import, niet omdat er nu
  iets verandert.

  ## Wat deze migratie doet
  Voegt `pa.classifier_version is not null` toe aan het where-blok van
  get_kandidaten. Verder ongewijzigd: zelfde signature, zelfde ordening
  (prijsafstand tot het midden van het budget), score blijft 0.

  ## Gemeten: uitkomst ongewijzigd
  Alle vier de persona's uit het persona-harnas (npm run keten:personas)
  geven voor en na deze migratie dezelfde uitkomst (zie taak-3-report.md-
  stijl vergelijking in de eindreview-rapportage van deze fixronde): 0
  kandidaatrijen worden uitgesloten, want 0 rijen missen classifier_version.

  ## Terugdraaien
  Let op de volgorde: get_kandidaten (deze migratie en 20260914120500)
  verwijst naar price/in_stock/classifier_version op product_attributes.
  Draai eerst deze migratie terug, dan pas 20260914120500 en 20260914120400
  (zie het terugdraai-blok van die twee bestanden), nooit andersom.

  Vorige versie van de functie opnieuw toepassen:
  supabase db query --linked -f
  supabase/migrations/20260914120500_get_kandidaten_op_attributes.sql
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
        order by abs(pa.price - ((p_budget_min + p_budget_max) / 2.0)) asc, pa.product_id asc
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
  where k.rn <= greatest(1, coalesce(p_per_category, 12))
  order by k.kandidaat_categorie, k.rn;
$$;

grant execute on function get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int)
  to anon, authenticated;
