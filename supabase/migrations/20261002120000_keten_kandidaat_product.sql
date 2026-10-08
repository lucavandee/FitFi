/*
  # keten_kandidaat_product: compacte kopie van de kandidaatproducten

  ## Probleem, gemeten op 2 oktober 2026
  get_kandidaten selecteert index-only (migratie 20261001150000) en koppelde
  daarna zijn 200 tot 240 rijen aan products voor de productvelden. De
  productrijen van de 36.117 kandidaten lagen verspreid over 28.580 pagina's
  (223 MB) van de products-heap van 650 MB. Dat is zo groot als het hele
  werkgeheugen van de database (shared_buffers 224 MB), dus na elke stille
  periode las een aanroep ze opnieuw van schijf: koud 1,4 tot 4,2 s, op
  2 oktober een keer 10,6 s en HTTP 500.

  ## Wat deze migratie doet
  1. keten_kandidaat_product: per kandidaat de negentien productvelden die de
     code leest (mapKandidaatProduct, en productVanKandidaat van de stylist in
     PR 112; zie KANDIDAAT_PRODUCT_VELDEN in src/services/outfits/kandidaten.ts).
     Gemiddeld 1,3 kB per rij in plaats van 2,2 kB, aaneengesloten in plaats
     van verspreid, en gevuld op product_id-volgorde. Fillfactor 90 laat ruimte
     voor een prijswijziging op dezelfde pagina (HOT-update).
  2. Triggers houden de kopie bij:
     - op product_attributes, als een rij kandidaat wordt of ophoudt het te
       zijn: taggen, voorraad, dedupe, classificatie, invoegen, verwijderen.
       Een verwijderd product loopt via de cascade naar product_attributes.
     - op products, als een van de negentien velden echt verandert. Wat de
       linkjob schrijft (link_status, link_last_checked_at, elke tien
       minuten) en wat de embeddingjob schrijft, raken de kopie niet.
  3. get_kandidaten leest de kopie en valt terug op products als een kopie
     ontbreekt. De kopie maakt de functie sneller, niet anders.
  4. keten_kandidaat_product_controle telt ontbrekende, overbodige en (in een
     steekproef) verouderde kopieen. Voor de live test en voor wie twijfelt.
  5. statement_timeout = 60s op de drie schrijffuncties die scripts via de
     service role aanroepen (8 s). keten_schrijf_tags en zet_classificatie
     kunnen honderden rijen tegelijk kandidaat maken, en elke overgang laat
     de trigger een productrij lezen. keten_schrijf_embeddings raakt de
     trigger niet, maar liep op 2 oktober al tegen de 8 s aan (de
     embeddingjob op H&M). keten_dedupe_embedding en keten_vul_nieuwe_producten
     draaien als postgres zonder limiet; een functie-instelling zou daar juist
     een limiet toevoegen, dus die blijven zoals ze zijn.

  ## Uitkomst
  Zelfde handtekening, zelfde rijen in dezelfde volgorde met dezelfde scores
  en attrs. product bevat alleen nog de negentien velden; de andere dertien
  kolommen van products las geen enkele afnemer. Voor het toepassen naast de
  oude functie gedraaid onder een tijdelijke naam: 36 profielen (met en
  zonder assen, likes, niet-wil-ids en retailer), 7.400 rijen, per profiel in
  een momentopname vergeleken, allemaal gelijk. De volledige controle na het
  vullen: 36.117 kandidaten, 36.117 kopieen, alle gelijk aan products.

  ## Op productie
  Toegepast op 2 oktober 2026: stap 1 tot en met 3 en 5 tot en met 7 als een
  geheel, de vulling (stap 4) in zestien porties op volgorde van product_id
  (de Management API breekt een verzoek na twee minuten af en draait het dan
  helemaal terug), daarna stap 8. De triggers stonden er voor de vulling,
  zodat wat de tagger intussen schreef niet tussen de porties door viel.

  ## Terugdraaien
  De vorige get_kandidaten staat in 20261001150000_get_kandidaten_dekkende_index.sql.
  Daarna:
    drop trigger if exists keten_kandidaat_product_attributen_insert on product_attributes;
    drop trigger if exists keten_kandidaat_product_attributen_update on product_attributes;
    drop trigger if exists keten_kandidaat_product_attributen_delete on product_attributes;
    drop trigger if exists keten_kandidaat_product_product_update on products;
    drop table if exists keten_kandidaat_product;
    alter function keten_schrijf_tags(jsonb) reset statement_timeout;
    alter function zet_classificatie(jsonb, text) reset statement_timeout;
    alter function keten_schrijf_embeddings(jsonb) reset statement_timeout;
*/

-- 1. De tabel. Lezen mag iedereen die products en product_attributes mag
--    lezen (get_kandidaten draait als de aanroeper); schrijven doen alleen
--    de triggers.
create table if not exists public.keten_kandidaat_product (
  product_id uuid primary key,
  product jsonb not null
) with (fillfactor = 90);

comment on table public.keten_kandidaat_product is
  'Productvelden van de kandidaten van get_kandidaten, bijgehouden door triggers. Zie migratie 20261002120000.';

alter table public.keten_kandidaat_product enable row level security;

drop policy if exists "Iedereen kan de kandidaatkopie lezen" on public.keten_kandidaat_product;
create policy "Iedereen kan de kandidaatkopie lezen"
  on public.keten_kandidaat_product
  for select
  to anon, authenticated
  using (true);

revoke all on public.keten_kandidaat_product from anon, authenticated;
grant select on public.keten_kandidaat_product to anon, authenticated;

-- 2. De twee definities waar alles op leunt.
--
-- Bewust zonder set search_path: alleen dan plant Postgres een SQL-functie in
-- de aanroeper in. Ingeplant kan een where-clausule de partiele index van
-- get_kandidaten gebruiken, en hoeft een trigger geen hele rij op te bouwen
-- (bij product_attributes inclusief de embedding uit TOAST). Geen van beide
-- verwijst naar een tabel.

-- Dezelfde voorwaarde als de dekkende index idx_product_attributes_get_kandidaten_dekkend.
create or replace function public.keten_is_kandidaat(pa public.product_attributes)
returns boolean
language sql
immutable
as $$
  select pa.product_id = pa.canonical_id
     and pa.is_fashion
     and pa.in_stock
     and pa.classifier_version is not null
     and pa.tagger_version is not null
$$;

-- De negentien velden die afnemers uit product lezen. De vulling, de trigger
-- op products en de terugval in get_kandidaten gebruiken alle drie deze
-- functie. Stable omdat jsonb_build_object stable is.
create or replace function public.keten_kandidaat_product_json(p public.products)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'brand', p.brand,
    'price', p.price,
    'image_url', p.image_url,
    'category', p.category,
    'type', p.type,
    'gender', p.gender,
    'colors', p.colors,
    'sizes', p.sizes,
    'tags', p.tags,
    'style', p.style,
    'retailer', p.retailer,
    'affiliate_url', p.affiliate_url,
    'product_url', p.product_url,
    'description', p.description,
    'in_stock', p.in_stock,
    'rating', p.rating,
    'review_count', p.review_count
  )
$$;

-- 3. De triggers. Security definer, zodat elke schrijver de kopie kan
--    bijwerken, ook als hij zelf geen schrijfrecht op de kopie heeft.

create or replace function public.keten_kandidaat_product_bij_attributen()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    delete from public.keten_kandidaat_product where product_id = old.product_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    if public.keten_is_kandidaat(new) then
      insert into public.keten_kandidaat_product (product_id, product)
      select p.id, public.keten_kandidaat_product_json(p)
      from public.products p
      where p.id = new.product_id
      on conflict (product_id) do update set product = excluded.product;
    end if;
  end if;
  return null;
end;
$$;

create or replace function public.keten_kandidaat_product_bij_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.keten_kandidaat_product
  set product = public.keten_kandidaat_product_json(new)
  where product_id = new.id;
  return null;
end;
$$;

drop trigger if exists keten_kandidaat_product_attributen_insert on public.product_attributes;
create trigger keten_kandidaat_product_attributen_insert
  after insert on public.product_attributes
  for each row
  when (public.keten_is_kandidaat(new))
  execute function public.keten_kandidaat_product_bij_attributen();

-- Alleen bij een overgang: een kandidaat die kandidaat blijft (een hertagging,
-- een nieuwe classificatie) heeft dezelfde kopie.
drop trigger if exists keten_kandidaat_product_attributen_update on public.product_attributes;
create trigger keten_kandidaat_product_attributen_update
  after update of product_id, canonical_id, is_fashion, in_stock, classifier_version, tagger_version
  on public.product_attributes
  for each row
  when (
    coalesce(public.keten_is_kandidaat(old), false) is distinct from coalesce(public.keten_is_kandidaat(new), false)
    or old.product_id is distinct from new.product_id
  )
  execute function public.keten_kandidaat_product_bij_attributen();

drop trigger if exists keten_kandidaat_product_attributen_delete on public.product_attributes;
create trigger keten_kandidaat_product_attributen_delete
  after delete on public.product_attributes
  for each row
  when (public.keten_is_kandidaat(old))
  execute function public.keten_kandidaat_product_bij_attributen();

-- Alleen bij een echte wijziging van de kopie: een update die dezelfde waarde
-- terugschrijft, raakt hem niet.
drop trigger if exists keten_kandidaat_product_product_update on public.products;
create trigger keten_kandidaat_product_product_update
  after update of name, brand, price, image_url, category, type, gender, colors, sizes, tags,
                  style, retailer, affiliate_url, product_url, description, in_stock, rating, review_count
  on public.products
  for each row
  when (public.keten_kandidaat_product_json(old) is distinct from public.keten_kandidaat_product_json(new))
  execute function public.keten_kandidaat_product_bij_product();

-- 4. Vullen, op volgorde van product_id.
insert into public.keten_kandidaat_product (product_id, product)
select p.id, public.keten_kandidaat_product_json(p)
from public.product_attributes pa
join public.products p on p.id = pa.product_id
where public.keten_is_kandidaat(pa)
order by pa.product_id
on conflict (product_id) do update set product = excluded.product;

-- 5. Controle. p_steekproef is het aantal kopieen dat met products wordt
--    vergeleken; null vergelijkt alles en leest dan alle productrijen.
create or replace function public.keten_kandidaat_product_controle(p_steekproef integer default 300)
returns table (
  kandidaten bigint,
  kopieen bigint,
  ontbrekend bigint,
  overbodig bigint,
  vergeleken bigint,
  verouderd bigint
)
language sql
volatile
set search_path = ''
set statement_timeout = '60s'
as $$
  with steekproef as (
    select k.product_id, k.product
    from public.keten_kandidaat_product k
    order by random()
    limit p_steekproef
  )
  select
    (select count(*) from public.product_attributes pa where public.keten_is_kandidaat(pa)),
    (select count(*) from public.keten_kandidaat_product),
    (select count(*)
       from public.product_attributes pa
      where public.keten_is_kandidaat(pa)
        and not exists (select 1 from public.keten_kandidaat_product k where k.product_id = pa.product_id)),
    (select count(*)
       from public.keten_kandidaat_product k
      where not exists (
        select 1 from public.product_attributes pa
        where pa.product_id = k.product_id
          and public.keten_is_kandidaat(pa))),
    (select count(*) from steekproef),
    (select count(*)
       from steekproef s
       left join public.products p on p.id = s.product_id
      where p.id is null
         or s.product is distinct from public.keten_kandidaat_product_json(p))
$$;

-- 6. Rechten. De twee definities blijven uitvoerbaar voor anon en
--    authenticated: get_kandidaten draait als de aanroeper en gebruikt de
--    json-functie in de terugval, en de when-voorwaarden van de triggers
--    draaien als de schrijver (een admin die een product wijzigt). Ze geven
--    niets prijs wat niet al in products en product_attributes leesbaar is.
--    Een triggerfunctie heeft geen execute-recht van de schrijver nodig
--    (getest op 2 okt 2026 met een wegwerptrigger, als authenticated).
revoke all on function public.keten_kandidaat_product_json(public.products) from public;
grant execute on function public.keten_kandidaat_product_json(public.products) to anon, authenticated, service_role;

revoke all on function public.keten_is_kandidaat(public.product_attributes) from public;
grant execute on function public.keten_is_kandidaat(public.product_attributes) to anon, authenticated, service_role;

revoke all on function public.keten_kandidaat_product_bij_attributen() from public, anon, authenticated;
revoke all on function public.keten_kandidaat_product_bij_product() from public, anon, authenticated;

revoke all on function public.keten_kandidaat_product_controle(integer) from public, anon, authenticated;
grant execute on function public.keten_kandidaat_product_controle(integer) to service_role;

-- 7. Schrijffuncties die scripts via de service role aanroepen (zie punt 5
--    bovenaan).
alter function public.keten_schrijf_tags(jsonb) set statement_timeout = '60s';
alter function public.zet_classificatie(jsonb, text) set statement_timeout = '60s';
alter function public.keten_schrijf_embeddings(jsonb) set statement_timeout = '60s';

-- 8. get_kandidaten leest de kopie.
create or replace function get_kandidaten(
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
as $$
#variable_conflict use_column
begin
  perform keten_controleer_retailer(p_retailer);

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
