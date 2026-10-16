/*
  # Designer-outlet standaard uit de kandidaten

  Keten-kritiek van 16 oktober 2026, beslissing 2 van Luc. Ruim 56.000 van de
  bijna 76.000 looks in de pool komen uit de designer-outlet (Giglio), en die
  feed is sinds maart niet ververst. get_kandidaten kiest per categorie de 40
  hoogste scores en bij gelijke score beslist het product-ID; met een budget tot
  500 euro waren bij een damesprofiel 161 van de ongeveer 240 kandidaten van
  Giglio. Nagespeeld op Lucs eigen quiz: zes van negen outfits kostten samen
  meer dan 1.000 euro, 28 van de 34 stukken kwamen uit de outlet.

  ## Wat dit doet
  - Tabel keten_retailer_regels: per winkel of hij standaard meedoet, met een
    reden. Leesbaar voor anon en authenticated, want get_kandidaten draait als
    security invoker onder de rol van de bezoeker; schrijven alleen via de
    service role of postgres.
  - get_kandidaten slaat winkels met standaard_uit over, behalve als p_retailer
    die winkel expliciet noemt (de feed-poort en het persona-harnas met
    --retailer blijven werken).
  - Giglio (INT) staat standaard uit. Beslissing 2 zegt: uit tot de feed vers
    is, daarna alleen bij een hoog gekozen prijsniveau. Dat tweede deel komt met
    de nieuwe intake.

  ## Snelheid
  retailer staat in de dekkende index (20261001150000), dus de selectie blijft
  een index-only scan. De extra voorwaarde maakt de basisset kleiner. work_mem
  staat in de definitie zelf, zodat deze vervanging hem niet terugzet (zie
  20261008090000 en kandidaat-snelheid.sql).

  ## Terugdraaien
  Alleen de regel uitzetten (geen herdefinitie nodig):
    update public.keten_retailer_regels set standaard_uit = false where retailer = 'Giglio (INT)';
  Helemaal terug: de definitie uit 20261002120000_keten_kandidaat_product.sql
  opnieuw draaien, daarna
    alter function public.get_kandidaten(text, text[], integer, integer, jsonb, uuid[], uuid[], integer, text) set work_mem = '16MB';
    drop table public.keten_retailer_regels;
*/

create table if not exists public.keten_retailer_regels (
  retailer text primary key,
  standaard_uit boolean not null default false,
  reden text not null,
  gewijzigd_op timestamptz not null default now()
);

comment on table public.keten_retailer_regels is
  'Per winkel: doet hij standaard mee in get_kandidaten. Een expliciete p_retailer gaat voor.';

alter table public.keten_retailer_regels enable row level security;

drop policy if exists "retailerregels lezen" on public.keten_retailer_regels;
create policy "retailerregels lezen" on public.keten_retailer_regels
  for select to anon, authenticated
  using (true);

grant select on public.keten_retailer_regels to anon, authenticated;

insert into public.keten_retailer_regels (retailer, standaard_uit, reden)
values (
  'Giglio (INT)',
  true,
  'Designer-outlet: feed van maart 2026 en drie kwart van de pool. Uit tot de feed vers is, daarna alleen bij een hoog gekozen prijsniveau (keten-kritiek 16 okt 2026, beslissing 2).'
)
on conflict (retailer) do update
  set standaard_uit = excluded.standaard_uit,
      reden = excluded.reden,
      gewijzigd_op = now();

create or replace function public.get_kandidaten(
  p_gender text,
  p_occasions text[],
  p_budget_min int,
  p_budget_max int,
  p_axes jsonb,
  p_liked_ids uuid[],
  p_disliked_ids uuid[],
  p_per_category int default 12,
  p_retailer text default null
)
returns table (product_id uuid, category text, score real, attrs jsonb, product jsonb)
language plpgsql
stable
security invoker
set search_path = public, extensions
set plan_cache_mode = force_custom_plan
set statement_timeout = '8s'
set work_mem = '16MB'
as $$
#variable_conflict use_column
declare
  v_standaard_uit text[];
begin
  perform keten_controleer_retailer(p_retailer);

  select coalesce(array_agg(r.retailer), '{}'::text[])
    into v_standaard_uit
    from keten_retailer_regels r
   where r.standaard_uit;

  return query
  with liked as (
    select pl.embedding
    from product_attributes pl
    where pl.product_id = any(coalesce(p_liked_ids, '{}'::uuid[]))
      and pl.embedding is not null
    limit 50
  ),
  assen as (
    select key as as_naam,
           value->>'value' as as_waarde,
           coalesce((value->>'confidence')::real, 0) as as_conf
    from jsonb_each(coalesce(p_axes, '{}'::jsonb))
    where jsonb_typeof(value) = 'object'
      and value->>'value' is not null
  ),
  totaal_conf as (
    select coalesce(sum(as_conf), 0)::real as som from assen
  ),
  basis as (
    select
      pa.product_id,
      pa.category,
      pa.occasions,
      jsonb_build_object(
        'category', pa.category,
        'classifier_version', pa.classifier_version,
        'formality', pa.formality,
        'occasions', pa.occasions,
        'silhouette', pa.silhouette,
        'color_temp', pa.color_temp,
        'lightness', pa.lightness,
        'pattern', pa.pattern,
        'shoe_type', pa.shoe_type,
        'colors', pa.colors,
        'materials', pa.materials,
        'seasons', pa.seasons
      ) as attrs,
      (
        select coalesce(sum(a.as_conf), 0)::real
        from assen a
        where (a.as_naam = 'formality'  and pa.formality::text = a.as_waarde)
           or (a.as_naam = 'silhouette' and pa.silhouette = a.as_waarde)
           or (a.as_naam = 'color_temp' and pa.color_temp = a.as_waarde)
           or (a.as_naam = 'lightness'  and pa.lightness = a.as_waarde)
           or (a.as_naam = 'pattern'    and pa.pattern = a.as_waarde)
           or (a.as_naam = 'shoe_type'  and pa.shoe_type = a.as_waarde)
      ) as as_som
    from product_attributes pa
    where pa.product_id = pa.canonical_id
      and pa.is_fashion
      and pa.in_stock
      and pa.classifier_version is not null
      and pa.tagger_version is not null
      and pa.category in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')
      and (p_gender = 'unisex' or pa.gender in (p_gender, 'unisex'))
      and pa.price between p_budget_min and p_budget_max
      and not (pa.product_id = any(coalesce(p_disliked_ids, '{}'::uuid[])))
      and (p_retailer is null or pa.retailer = p_retailer)
      -- Wie een winkel expliciet vraagt (feed-poort, --retailer), krijgt hem;
      -- anders doen de winkels die standaard uit staan niet mee.
      and (p_retailer is not null or pa.retailer is null or not (pa.retailer = any(v_standaard_uit)))
  ),
  gescoord as (
    select
      b.product_id,
      b.category,
      b.attrs,
      (
        0.5 * case when t.som > 0 then b.as_som / t.som else 0 end
      + 0.3 * case
                when coalesce(cardinality(p_occasions), 0) > 0 then
                  (select count(*) from unnest(b.occasions) o where o = any(p_occasions))::real
                  / cardinality(p_occasions)
                else 0
              end
      + 0.2 * coalesce(
                case when exists (select 1 from liked) then
                  (select max(1 - (pe.embedding <=> l.embedding))
                     from liked l
                     cross join product_attributes pe
                    where pe.product_id = b.product_id
                      and pe.embedding is not null)
                end,
                0)
      )::real as score
    from basis b
    cross join totaal_conf t
  ),
  gerangschikt as (
    select gs.*,
           row_number() over (partition by gs.category order by gs.score desc, gs.product_id) as rn
    from gescoord gs
  )
  select
    g.product_id,
    g.category,
    g.score,
    g.attrs,
    x.product
  from gerangschikt g
  left join keten_kandidaat_product k on k.product_id = g.product_id
  cross join lateral (
    -- De kopie, of anders products zelf: een ontbrekende kopie maakt de
    -- aanroep trager, nooit armer. Valt ook products weg, dan valt de rij weg,
    -- zoals bij de inner join hiervoor.
    select coalesce(
      k.product,
      (select keten_kandidaat_product_json(p) from products p where p.id = g.product_id)
    ) as product
  ) x
  where g.rn <= least(60, greatest(1, coalesce(p_per_category, 12)))
    and x.product is not null
  order by g.category, g.score desc, g.product_id;
end;
$$;
