/*
  # Stijllabels versie 2: seizoen en gedateerd

  De eindtoets van 21 oktober 2026 (8 profielen, stijl-agent keurt) gaf met
  stijllabels 8 van 48 goed. De redenen gingen niet meer over stijl, wel over
  zomerstukken in oktober (stro, strappy jurk, slingbacks), gedateerde stukken
  (dad-sneaker, groot logo) en te informele stukken voor kantoor of formeel.

  - keten_stijl_labels krijgt seizoen (herfst-winter, lente-zomer, heel-jaar)
    en gedateerd. Beide null voor labels van versie b; de vulronde van versie c
    zet ze.
  - get_stijl_kandidaten laat gedateerde stukken weg en geeft formeel en
    seizoen mee in attrs. De site filtert op seizoen (de engine kent het
    seizoen) en gebruikt formeel per gelegenheid.

  ## Terugdraaien
    alter table public.keten_stijl_labels drop column if exists seizoen, drop column if exists gedateerd;
  en de functie uit 20261021120000_keten_stijl_labels.sql opnieuw draaien.
*/

alter table public.keten_stijl_labels
  add column if not exists seizoen text check (seizoen in ('herfst-winter', 'lente-zomer', 'heel-jaar')),
  add column if not exists gedateerd boolean;

create or replace function public.get_stijl_kandidaten(
  p_gender text,
  p_stijlen text[],
  p_budget_min integer,
  p_budget_max integer,
  p_per_category integer default 20,
  p_zaad integer default 0
)
returns table (product_id uuid, category text, score real, attrs jsonb, product jsonb)
language sql
stable
security invoker
set search_path = public, extensions
set statement_timeout = '5s'
as $$
  -- Eerst de gelabelde ID's, dan alleen die via de sleutel ophalen. Onder
  -- row-level security schat de planner de aantallen niet goed en begon hij
  -- anders bij product_attributes (43.672 rijen voor dames, 131.000 gelezen
  -- blokken, 5 s time-out); met "= any(lijst)" zijn het er een paar duizend.
  with uit as (
    select coalesce(array_agg(r.retailer), '{}'::text[]) as winkels
    from keten_retailer_regels r
    where r.standaard_uit
  ),
  basis as (
    select
      pa.product_id,
      pa.category,
      cardinality(array(select unnest(l.stijlen) intersect select unnest(p_stijlen)))::real as overlap,
      jsonb_build_object(
        'category', pa.category,
        'formality', pa.formality,
        'occasions', pa.occasions,
        'silhouette', pa.silhouette,
        'color_temp', pa.color_temp,
        'lightness', pa.lightness,
        'pattern', pa.pattern,
        'shoe_type', pa.shoe_type,
        'colors', pa.colors,
        'materials', pa.materials,
        'seasons', pa.seasons,
        'stuk', l.stuk,
        'stijlen', l.stijlen,
        'spoor', l.spoor,
        'formeel', l.formeel,
        'seizoen', l.seizoen
      ) as attrs
    from product_attributes pa
    join keten_stijl_labels l on l.product_id = pa.product_id
    cross join uit
    -- Hooguit 600 gelabelde producten per aanroep, in een vaste mengvolgorde
    -- per bezoeker: genoeg voor 30 per categorie, en een koude cache leest dan
    -- geen 2.000 verspreide rijen (casual: 6,6 s koud).
    where pa.product_id = any(array(
        select l2.product_id from keten_stijl_labels l2
        where l2.stijlen && p_stijlen
          and not coalesce(l2.gedateerd, false)
        order by md5(l2.product_id::text || ':' || p_zaad::text)
        limit 600
      ))
      and pa.product_id = pa.canonical_id
      and pa.is_fashion
      and pa.in_stock
      and pa.category in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')
      and (p_gender = 'unisex' or pa.gender in (p_gender, 'unisex'))
      and pa.price between p_budget_min and p_budget_max
      and (pa.retailer is null or not (pa.retailer = any(uit.winkels)))
  ),
  gekozen as materialized (
    select b.*
    from (
      select b.*,
             row_number() over (
               partition by b.category
               order by b.overlap desc, md5(b.product_id::text || ':' || p_zaad::text)
             ) as rn
      from basis b
    ) b
    where b.rn <= least(60, greatest(1, coalesce(p_per_category, 20)))
  )
  select g.product_id, g.category, g.overlap, g.attrs, k.product
  from gekozen g
  join keten_kandidaat_product k on k.product_id = g.product_id
  where k.product_id = any((select array_agg(g2.product_id) from gekozen g2)::uuid[])
  order by g.category, g.rn;
$$;
