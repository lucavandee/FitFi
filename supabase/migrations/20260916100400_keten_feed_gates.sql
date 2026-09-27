/*
  # Keten plan 2: feed_gates en dekkingsmatrix (spec 5.7)

  ## Wat deze migratie doet
  - Tabel feed_gates: een rij per poort-run van scripts/keten/feed-poort.ts
    (retailer, run_at, groen, matrix, persona_output). Admins lezen via
    is_current_user_admin() (JWT app_metadata.is_admin, terugval op
    profiles.is_admin); alleen de service role schrijft (geen insert-policy).
    Bewust geen losse JWT-check op een claim "role" gelijk aan admin: geen
    migratie in dit project zet die claim, de admins hebben is_admin.
  - keten_dekkingsmatrix(p_retailer): telt canonieke, in-stock fashionproducten
    per gender x gelegenheid x prijsband. Unisex telt bij male en female mee.
    Onbekende retailer-naam geeft een fout. Telt volledig op product_attributes
    (in_stock en retailer staan daar al sinds 20260914120400): geen join naar
    products. Zonder die keuze zou elke van de 56 cellen (2 gender x 7
    gelegenheid x 4 band) een eigen join naar products doen om in_stock en
    retailer te toetsen, precies de vorm die get_kandidaten (taak 7) op 56,5
    seconden voor een enkele combinatie liet uitkomen, hier 56 keer in een
    aanroep. keten_dekkingsmatrix is grant'ed aan authenticated en loopt dus,
    net als get_kandidaten, via de PostgREST-route met een statement-timeout.

  ## Stand van de data (16 september 2026, gemeten)
  Van de 100.849 canonieke producten zijn er 16.133 getagd, allemaal H&M
  (NL). De andere vijf retailers (Giglio, PUMA, OFM, Mart Visser, The New
  Originals) hebben nul tags en nul embeddings. Voor die vijf retailers geeft
  keten_dekkingsmatrix dus overal 0 terug: dat is de juiste uitkomst van deze
  functie, geen bug. De consument van deze matrix (taak 10, feed-poort.ts)
  hoort dat als "nog niet getagd" te tonen, niet als een fout te onderzoeken.

  ## Index, gemeten na de eerste versie
  De 56 tellingen filteren volledig op product_attributes (geen join naar
  products, zoals hierboven), maar geen bestaande index dekt (retailer,
  gender, price_band) samen: idx_product_attributes_gender_category_band en
  idx_product_attributes_kandidaten zijn allebei opgebouwd rond category, die
  deze functie niet gebruikt, en geen van beide kent retailer. EXPLAIN
  (ANALYZE, BUFFERS) op de rauwe query (los van de functie-wrapper, zodat de
  planner het binnenwerk toont) gaf zonder extra index 9,4s voor H&M (NL) en
  2.358.860 gedeelde buffers: elke cel deed een index-scan op alleen gender
  en filterde retailer/price_band/occasions daarna alsnog over duizenden
  rijen per cel ("Rows Removed by Filter: 44082" op 56 loops).

  create index idx_product_attributes_dekkingsmatrix
    on product_attributes (retailer, gender, price_band)
    where product_id = canonical_id and is_fashion and in_stock;

  Met deze index: 102ms en 67.662 buffers voor dezelfde H&M-query (geen
  analyze nodig, de planner koos de index meteen op kosten). Voor Giglio
  (INT), de zwaarste retailer (65.064 canonieke rijen, nul tags), schommelde
  de gemeten tijd sterk: 100-800ms bij een warme cache, incidenteel tot 11s
  bij de eerste aanroep na een stille periode. Dat patroon (snel warm, traag
  koud) wijst op cache-gedrag van de gekoppelde instantie, niet op een
  planningsfout: EXPLAIN liet in alle gevallen dezelfde index-scan zien.
  keten_dekkingsmatrix is alleen ge-grant aan authenticated (niet anon), dus
  de relevante PostgREST-limiet is de 8s van de authenticated-rol
  (pg_roles.rolconfig), niet de 3s van anon. Zie taak-9-report.md voor de
  volledige meetreeks en de resterende zorg over een koude eerste aanroep.

  ## Terugdraaien
  drop index if exists idx_product_attributes_dekkingsmatrix;
  drop function if exists keten_dekkingsmatrix(text);
  drop table if exists feed_gates;
*/

create table if not exists feed_gates (
  id uuid primary key default gen_random_uuid(),
  retailer text not null,
  run_at timestamptz not null default now(),
  groen boolean not null,
  matrix jsonb not null,
  persona_output jsonb not null default '{}'::jsonb
);

create index if not exists idx_feed_gates_retailer_run_at
  on feed_gates (retailer, run_at desc);

alter table feed_gates enable row level security;

drop policy if exists "Admins lezen feed_gates" on feed_gates;
create policy "Admins lezen feed_gates"
  on feed_gates for select
  to authenticated
  using (is_current_user_admin());

-- Zie de toelichting "Index, gemeten na de eerste versie" hierboven: zonder
-- deze index scant elke van de 56 cellen van keten_dekkingsmatrix alleen op
-- gender en filtert retailer/price_band/occasions daarna alsnog over
-- duizenden rijen per cel (9,4s, 2,36M buffers op H&M (NL)). Met deze index:
-- 102ms, 67.662 buffers, zonder analyze nodig.
create index if not exists idx_product_attributes_dekkingsmatrix
  on product_attributes (retailer, gender, price_band)
  where product_id = canonical_id and is_fashion and in_stock;

create or replace function keten_dekkingsmatrix(p_retailer text)
returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  with g as (select unnest(array['male', 'female']) as gender),
  o as (select unnest(array['work', 'casual', 'formal', 'date', 'travel', 'sport', 'party']) as occasion),
  b as (select unnest(array['tot50', '50tot100', '100tot200', 'boven200']) as band),
  cel as (
    select g.gender, o.occasion, b.band,
      (
        select count(*)
        from product_attributes pa
        where pa.canonical_id = pa.product_id
          and pa.is_fashion
          and pa.in_stock
          and pa.retailer = p_retailer
          and pa.gender in (g.gender, 'unisex')
          and pa.price_band = b.band
          and o.occasion = any(pa.occasions)
      ) as n
    from g cross join o cross join b
  ),
  per_occ as (
    select gender, occasion, jsonb_object_agg(band, n) as banden
    from cel group by gender, occasion
  ),
  per_gender as (
    select gender, jsonb_object_agg(occasion, banden) as gelegenheden
    from per_occ group by gender
  )
  select jsonb_object_agg(gender, gelegenheden) from per_gender;
$$;

revoke all on function keten_dekkingsmatrix(text) from public, anon;
grant execute on function keten_dekkingsmatrix(text) to authenticated;
