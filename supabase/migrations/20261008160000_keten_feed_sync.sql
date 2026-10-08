/*
  # Feed-sync: functies voor het Mac-script scripts/keten/feed-sync.ts

  ## Probleem
  De catalogus is van maart (laatste import 9 maart). De H&M-feed levert nu
  121.238 producten, maar de edge function import-daisycon-feed kan die niet
  verwerken (237 MB aan JSON), herschrijft elke rij (updated_at = now(), ongeveer
  1 GB schrijven op een schijf van 11 tot 15 MB/s) en zet verdwenen producten
  nooit uit voorraad. Bovendien gaf H&M sinds april andere product-ID's: van de
  88.043 rijen in de database heeft er geen enkele nog een id in de feed.

  Het script leest de feed op de Mac, koppelt oude rijen aan nieuwe feedregels op
  artikelnummer en maat, en schrijft alleen wat veranderd is. Deze migratie levert
  de vier schrijf-RPC's daarvoor, allemaal alleen voor de service role:

  - keten_prijsband(numeric): de prijsbanden van get_kandidaten op één plek voor
    de nieuwe functies. (keten_vul_nieuwe_producten en vul_product_attributes
    hebben dezelfde CASE nog inline; de grenzen zijn gelijk.)
  - keten_feed_pas_toe(jsonb): zet per product external_id, prijs, oorspronkelijke
    prijs, voorraad, links en beeld, en spiegelt prijs, voorraad, prijsband en
    beeld naar product_attributes, zodat de pool geen halve staat ziet.
  - keten_feed_voorraad(uuid[], boolean): zet voorraad, in products en in
    product_attributes.
  - keten_feed_voeg_toe(jsonb): nieuwe producten. "on conflict do nothing" zonder
    doel, want products heeft twee unieke sleutels (external_id en sku).
  - keten_herkies_canoniek(text): zie hieronder.
  - keten_canoniek_wissels: logboek van elke wissel, om terug te kunnen kijken.

  ## Waarom een herverkiezing van de canonieke rij nodig is
  Een foto-groep (zelfde retailer en zelfde image_url) is één look in meerdere
  maten; de ontwerpspecificatie zegt dat de goedkoopste in-stock variant
  canoniek wordt. Dat gebeurt alleen bij de eerste vulling. In de H&M-feed
  staan alleen beschikbare maten: een uitverkochte maat verdwijnt als rij. Valt
  de canonieke maat weg terwijl een andere maat van dezelfde foto blijft, dan
  verdwijnt zonder herverkiezing de hele look uit de pool, want get_kandidaten
  eist pa.in_stock op de canonieke rij. Gemeten op 8 oktober 2026: 2.690 van de
  16.034 getagde H&M-looks zitten in dat geval.

  keten_herkies_canoniek kiest dan de goedkoopste in-stock maat (bij gelijke prijs
  de laagste id), geeft die de tags, de embedding en de classificatie van de oude
  canonieke rij, en zet canonical_id van de hele groep om. De oude rij houdt zijn
  tags als geheugen; hij is geen kandidaat meer omdat canonical_id niet meer
  zijn eigen id is. De triggers op product_attributes ruimen de kandidaatkopie
  daardoor zelf op en voegen de nieuwe rij toe.

  Een groep waarvan elke maat weg is blijft zoals ze is: de look is er niet meer en
  valt terecht uit de pool, via in_stock = false op de canonieke rij.

  ## Hoe het draait
  De RPC's draaien via de service role met een eigen limiet van 60 tot 120 s
  (een functie-instelling gaat via PostgREST voor op de 8 s van de rol; zie
  20261008110000). Idempotent: opnieuw draaien verandert niets.
*/

create or replace function public.keten_prijsband(p_price numeric)
returns text
language sql
immutable
parallel safe
as $$
  select case
    when p_price < 50 then 'tot50'
    when p_price < 100 then '50tot100'
    when p_price < 200 then '100tot200'
    else 'boven200'
  end
$$;

create table if not exists public.keten_canoniek_wissels (
  id bigint generated always as identity primary key,
  retailer text not null,
  oud uuid not null,
  nieuw uuid not null,
  gewisseld_op timestamptz not null default now()
);
comment on table public.keten_canoniek_wissels is
  'Logboek van keten_herkies_canoniek: welke maat de canonieke rij van een foto-groep overnam.';
alter table public.keten_canoniek_wissels enable row level security;
-- Geen policy's: alleen postgres en service_role lezen dit.

create or replace function public.keten_feed_pas_toe(p_rijen jsonb)
returns bigint
language plpgsql
security definer
set search_path to 'public', 'extensions'
set statement_timeout to '60s'
as $$
declare
  v_rijen bigint;
begin
  with r as (
    select *
    from jsonb_to_recordset(p_rijen) as x(
      id uuid, external_id text, price numeric, original_price numeric, in_stock boolean,
      affiliate_url text, image_url text, images text[]
    )
  ),
  bijgewerkt as (
    update public.products p
    set external_id    = r.external_id,
        price          = r.price,
        original_price = r.original_price,
        in_stock       = r.in_stock,
        affiliate_url  = r.affiliate_url,
        affiliate_link = r.affiliate_url,
        product_url    = r.affiliate_url,
        image_url      = r.image_url,
        images         = r.images,
        updated_at     = now()
    from r
    where p.id = r.id
    returning p.id, p.price, p.in_stock, p.image_url
  ),
  spiegel as (
    update public.product_attributes pa
    set price      = b.price,
        in_stock   = b.in_stock,
        price_band = public.keten_prijsband(b.price),
        image_url  = b.image_url
    from bijgewerkt b
    where pa.product_id = b.id
      and (
        pa.price is distinct from b.price
        or pa.in_stock is distinct from b.in_stock
        or pa.price_band is distinct from public.keten_prijsband(b.price)
        or pa.image_url is distinct from b.image_url
      )
    returning 1
  )
  select count(*) into v_rijen from bijgewerkt;
  return v_rijen;
end;
$$;

create or replace function public.keten_feed_voorraad(p_ids uuid[], p_in_stock boolean)
returns bigint
language plpgsql
security definer
set search_path to 'public', 'extensions'
set statement_timeout to '60s'
as $$
declare
  v_rijen bigint;
begin
  with p as (
    update public.products
    set in_stock = p_in_stock, updated_at = now()
    where id = any(p_ids) and in_stock is distinct from p_in_stock
    returning id
  ),
  a as (
    update public.product_attributes pa
    set in_stock = p_in_stock
    where pa.product_id = any(p_ids) and pa.in_stock is distinct from p_in_stock
    returning 1
  )
  select count(*) into v_rijen from p;
  return v_rijen;
end;
$$;

create or replace function public.keten_feed_voeg_toe(p_rijen jsonb)
returns bigint
language plpgsql
security definer
set search_path to 'public', 'extensions'
set statement_timeout to '60s'
as $$
declare
  v_rijen bigint;
begin
  insert into public.products (
    external_id, source, name, brand, price, original_price, image_url, images, retailer,
    affiliate_url, affiliate_link, product_url, category, gender, style, description,
    tags, colors, sizes, sku, in_stock, is_kids, rating, review_count, updated_at, campaign_id
  )
  select
    x.external_id, coalesce(x.source, 'daisycon'), x.name, x.brand, x.price, x.original_price, x.image_url,
    coalesce(x.images, '{}'), x.retailer,
    x.affiliate_url, x.affiliate_link, x.product_url, x.category, x.gender, x.style,
    -- description is NOT NULL in products; de rij zelf zegt dan liever "leeg" dan dat de hele batch faalt.
    coalesce(x.description, ''),
    coalesce(x.tags, '{}'), x.colors, coalesce(x.sizes, '{}'), x.sku, coalesce(x.in_stock, true),
    coalesce(x.is_kids, false), x.rating, coalesce(x.review_count, 0),
    coalesce(x.updated_at, now()), x.campaign_id
  from jsonb_to_recordset(p_rijen) as x(
    external_id text, source text, name text, brand text, price numeric, original_price numeric, image_url text,
    images text[], retailer text, affiliate_url text, affiliate_link text, product_url text, category text,
    gender text, style text, description text, tags text[], colors text[], sizes text[], sku text,
    in_stock boolean, is_kids boolean, rating numeric, review_count integer, updated_at timestamptz,
    campaign_id uuid
  )
  on conflict do nothing;
  get diagnostics v_rijen = row_count;
  return v_rijen;
end;
$$;

create or replace function public.keten_herkies_canoniek(p_retailer text)
returns bigint
language plpgsql
security definer
set search_path to 'public', 'extensions'
set statement_timeout to '120s'
as $$
declare
  v_start timestamptz := clock_timestamp();
  v_groepen bigint;
begin
  perform public.keten_controleer_retailer(p_retailer);

  with leden as (
    select pa.product_id, pa.canonical_id, p.price, p.in_stock
    from public.product_attributes pa
    join public.products p on p.id = pa.product_id
    where pa.retailer = p_retailer
  ),
  groepen as (
    select
      canonical_id as oud,
      bool_or(product_id = canonical_id and in_stock) as canoniek_in_stock,
      (array_agg(product_id order by price asc nulls last, product_id asc) filter (where in_stock))[1] as nieuw,
      (array_agg(price order by price asc nulls last, product_id asc) filter (where in_stock))[1] as nieuw_prijs
    from leden
    group by canonical_id
  ),
  wissels as (
    select oud, nieuw, nieuw_prijs
    from groepen
    where not canoniek_in_stock and nieuw is not null
  ),
  logboek as (
    -- Met het eigen starttijdstip van deze aanroep, niet met now(): now() is het
    -- begin van de transactie en zou het tellen hieronder laten missen als dit in
    -- een langere transactie draait.
    insert into public.keten_canoniek_wissels (retailer, oud, nieuw, gewisseld_op)
    select p_retailer, oud, nieuw, v_start from wissels
    returning 1
  ),
  nieuwe as (
    update public.product_attributes n
    set canonical_id       = n.product_id,
        is_fashion         = o.is_fashion,
        category           = o.category,
        gender             = o.gender,
        classifier_version = o.classifier_version,
        embedding          = o.embedding,
        tagged_at          = o.tagged_at,
        formality          = o.formality,
        occasions          = o.occasions,
        silhouette         = o.silhouette,
        color_temp         = o.color_temp,
        lightness          = o.lightness,
        pattern            = o.pattern,
        shoe_type          = o.shoe_type,
        colors             = o.colors,
        materials          = o.materials,
        seasons            = o.seasons,
        confidence         = o.confidence,
        tagger_version     = o.tagger_version,
        in_stock           = true,
        price              = w.nieuw_prijs,
        price_band         = public.keten_prijsband(w.nieuw_prijs)
    from wissels w
    join public.product_attributes o on o.product_id = w.oud
    where n.product_id = w.nieuw
    returning w.oud, w.nieuw
  )
  update public.product_attributes m
  set canonical_id = x.nieuw
  from nieuwe x
  where m.canonical_id = x.oud
    and m.product_id <> x.nieuw;

  select count(*) into v_groepen
  from public.keten_canoniek_wissels
  where retailer = p_retailer and gewisseld_op = v_start;
  return v_groepen;
end;
$$;

revoke all on function public.keten_feed_pas_toe(jsonb) from public, anon, authenticated;
revoke all on function public.keten_feed_voorraad(uuid[], boolean) from public, anon, authenticated;
revoke all on function public.keten_feed_voeg_toe(jsonb) from public, anon, authenticated;
revoke all on function public.keten_herkies_canoniek(text) from public, anon, authenticated;
grant execute on function public.keten_feed_pas_toe(jsonb) to service_role;
grant execute on function public.keten_feed_voorraad(uuid[], boolean) to service_role;
grant execute on function public.keten_feed_voeg_toe(jsonb) to service_role;
grant execute on function public.keten_herkies_canoniek(text) to service_role;
