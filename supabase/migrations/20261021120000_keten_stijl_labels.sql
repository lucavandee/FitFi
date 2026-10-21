/*
  # Stijllabels per product, en kandidaten per stijl

  Keten-kritiek van 16 oktober 2026. get_kandidaten kent geen stijl: per
  categorie de 40 hoogste scores op pasvorm, print en gelegenheid, en bij
  gelijke score het product-ID. Bij een streetwear-profiel zat er geen hoodie,
  cargo of bomber in de pool. De stijl-agent (src/keten/stijl/stijlAgent.ts)
  keurde vijf van Lucs zes outfits na pakket 2 af, steeds omdat de stukken geen
  streetwear waren.

  ## Wat dit doet
  - keten_stijl_labels: per product het soort stuk, de stijlen waarin een
    stylist het vanzelf gebruikt, het spoor (hip, gewoon, beide) en de
    formaliteit. Gevuld door scripts/keten/stijl-vul.ts: de snelle labeler op
    naam (src/keten/stijl/labeler.ts) met de stijlmatrix die uit de labels van
    de stijl-agent is afgeleid, en de agent zelf voor wat de naam niet zegt.
  - get_stijl_kandidaten: per categorie de producten met een van de gevraagde
    stijlen, binnen geslacht en budget, op voorraad en zonder de winkels die
    standaard uit staan (keten_retailer_regels). Volgorde: hoeveel gevraagde
    stijlen het product heeft, daarna een vaste mengsleutel per bezoeker
    (md5 van product-ID en zaad) in plaats van het product-ID zelf, zodat twee
    bezoekers met hetzelfde profiel dezelfde lijst krijgen maar de lijst geen
    loterij op ID is.

  get_kandidaten verandert niet. De site vraagt beide en voegt ze samen.

  ## Snelheid
  De labeltabel is klein (een rij per canonieke look, tienduizenden rijen) met
  een GIN-index op stijlen. De koppeling met product_attributes en
  keten_kandidaat_product gaat op primaire sleutel.

  ## Terugdraaien
    drop function if exists public.get_stijl_kandidaten(text, text[], integer, integer, integer, integer);
    drop table if exists public.keten_stijl_labels;
*/

create table if not exists public.keten_stijl_labels (
  product_id uuid primary key,
  stuk text not null,
  stijlen text[] not null,
  spoor text not null default 'beide' check (spoor in ('hip', 'gewoon', 'beide')),
  formeel smallint check (formeel between 1 and 5),
  bron text not null,
  gelabeld_op timestamptz not null default now()
);

comment on table public.keten_stijl_labels is
  'Stijllabels per canonieke look; gevuld door scripts/keten/stijl-vul.ts. Zie 20261021120000.';

create index if not exists idx_keten_stijl_labels_stijlen on public.keten_stijl_labels using gin (stijlen);

alter table public.keten_stijl_labels enable row level security;
drop policy if exists "stijllabels lezen" on public.keten_stijl_labels;
create policy "stijllabels lezen" on public.keten_stijl_labels for select to anon, authenticated using (true);
grant select on public.keten_stijl_labels to anon, authenticated;

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
        'spoor', l.spoor
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

grant execute on function public.get_stijl_kandidaten(text, text[], integer, integer, integer, integer) to anon, authenticated;
