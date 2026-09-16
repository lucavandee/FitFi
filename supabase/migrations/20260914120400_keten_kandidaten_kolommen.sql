/*
  # product_attributes: price, in_stock, retailer + kandidaten-index

  ## Probleem
  get_kandidaten (20260914120100) filtert op prijs en voorraad via een join
  naar products, omdat product_attributes die twee velden niet had. EXPLAIN
  (ANALYZE, BUFFERS) op die versie liet zien waarom dat traag is: de planner
  schat de index-scan op product_attributes op 526 kandidaatrijen na de
  gender/category-filter, maar in werkelijkheid zijn dat er 39.046 (measured
  2026-09-16, male/work/50-150). Voor elk van die ~39.000 rijen volgt een
  los index-lookup op products om price en in_stock te toetsen: ~39.000
  losse heap-fetches op de grootste tabel in de database, goed voor 56,5 van
  de 56,5 seconden pure uitvoertijd. Via de PostgREST-rol (8s
  statement-timeout) faalt de RPC daardoor met 57014; geverifieerd met curl
  op de anon-route.

  De oorzaak is niet een ontbrekende index op products, maar dat products
  voor deze query helemaal niet geraakt zou moeten worden: product_attributes
  is de laag waarop gequeried wordt, products is de ruwe feed en hoort
  alleen nog aangeraakt te worden voor de kandidaten die je teruggeeft.

  ## Wat deze migratie doet
  1. Voegt price, in_stock en retailer toe aan product_attributes: de drie
     velden die get_kandidaten nodig heeft om zonder products te filteren en
     te sorteren. retailer zit erbij omdat plan 2 daar per retailer op
     filtert (de feed-poort); nu meenemen scheelt een tweede migratie en een
     tweede hervulling van 282.000 rijen.
  2. vul_product_attributes vult en ververst deze drie kolommen voortaan bij
     elke run, net als price_band, ongeacht classifier_version: dit zijn
     feed-eigenschappen (prijs, voorraad, verkoper), geen classificatie, dus
     de bescherming die category en is_fashion tegen overschrijven beschermt
     zodra classifier_version gezet is, geldt hier niet en mag ook niet
     gelden (een product dat uit voorraad gaat, moet dat blijven laten zien).
  3. Een partiële index op (gender, category, price) waar product_id =
     canonical_id, is_fashion en in_stock: precies de rijen en precies de
     kolomvolgorde die get_kandidaten nodig heeft. gender eerst, omdat de
     RPC daar met een IN-lijst (gender, 'unisex') op filtert; category
     tweede, omdat de RPC per categorie een topN wil (partition by
     category); price laatste, voor de budget-range binnen elke
     gender/category-groep. Zie de volgende migratie (get_kandidaten
     herschreven op product_attributes) voor de EXPLAIN ANALYZE voor en na.

  ## Terugdraaien
  drop index if exists idx_product_attributes_kandidaten;
  alter table public.product_attributes drop column if exists retailer;
  alter table public.product_attributes drop column if exists in_stock;
  alter table public.product_attributes drop column if exists price;
  -- en de vorige versie van vul_product_attributes terugzetten
  -- (20260914120000_product_attributes_fundament.sql).
*/

alter table public.product_attributes
  add column if not exists price numeric,
  add column if not exists in_stock boolean,
  add column if not exists retailer text;

create index if not exists idx_product_attributes_kandidaten
  on public.product_attributes (gender, category, price)
  where product_id = canonical_id and is_fashion and in_stock;

create or replace function vul_product_attributes(
  p_retailer text default null,
  p_merk_van text default null,
  p_merk_tot text default null
)
returns table (verwerkt bigint, canoniek bigint)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  -- Woorden waarmee een rij ondanks een kledingcategorie geen kleding is
  -- (woonaccessoires, fan-merch, dierenkleding).
  niet_kleding constant text :=
    '\m(vaas|vazen|lamp|lampen|servies|bord|borden|beker|mok|mokken|kussen|kussens|kaars|kaarsen|poster|handdoek|handdoeken|deken|plaid|fotolijst|spiegel|speelgoed|knuffel|puzzel|sticker|telefoonhoesje|supporter|supporters|fanshirt|thuisshirt|uitshirt|matchworn|hondenjas|hondentuig|halsband|kattenmand)\M';
begin
  with basis as (
    select
      p.id,
      p.retailer,
      lower(coalesce(p.brand, '')) as merk,
      normaliseer_productnaam(p.name) as naam,
      p.in_stock,
      p.price,
      lower(coalesce(p.category, '')) as cat,
      lower(coalesce(p.gender, 'unisex')) as gen,
      p.is_kids,
      p.name as ruwe_naam,
      p.image_url
    from products p
    where (p_retailer is null or p.retailer = p_retailer)
      and (p_merk_van is null or lower(coalesce(p.brand, '')) >= p_merk_van)
      and (p_merk_tot is null or lower(coalesce(p.brand, '')) < p_merk_tot)
  ),
  gerangschikt as (
    select
      b.*,
      first_value(b.id) over (
        partition by b.retailer,
          -- Dezelfde foto is dezelfde look in een andere maat of prijs;
          -- een andere kleur heeft een andere foto en blijft een eigen
          -- product (spec 5.1). Terugval op merk + genormaliseerde naam
          -- alleen als image_url leeg is; vandaag 0 rijen, dus dode code
          -- die klaarstaat voor een toekomstige feed zonder foto's.
          coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam)
        order by (b.in_stock is true) desc, b.price asc, b.id asc
      ) as canonical_id
    from basis b
  )
  insert into product_attributes (
    product_id, canonical_id, is_fashion, category, gender, price_band,
    price, in_stock, retailer
  )
  select
    g.id,
    g.canonical_id,
    (
      g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')
      and coalesce(g.is_kids, false) = false
      and g.ruwe_naam !~* niet_kleding
    ) as is_fashion,
    case
      when g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory') then g.cat
      else null
    end as category,
    case when g.gen in ('male', 'female') then g.gen else 'unisex' end as gender,
    case
      when g.price < 50 then 'tot50'
      when g.price < 100 then '50tot100'
      when g.price < 200 then '100tot200'
      else 'boven200'
    end as price_band,
    g.price,
    g.in_stock,
    g.retailer
  from gerangschikt g
  on conflict (product_id) do update set
    canonical_id = excluded.canonical_id,
    gender       = excluded.gender,
    price_band   = excluded.price_band,
    -- Feed-eigenschappen: altijd verversen, ook als de classifier al
    -- langs is geweest. Een product dat uit voorraad gaat of van prijs
    -- wisselt, moet dat direct laten zien.
    price        = excluded.price,
    in_stock     = excluded.in_stock,
    retailer     = excluded.retailer,
    -- Classificatie: een rij die de classifier al heeft gezien, houdt
    -- die uitkomst.
    is_fashion   = case when product_attributes.classifier_version is null
                        then excluded.is_fashion else product_attributes.is_fashion end,
    category     = case when product_attributes.classifier_version is null
                        then excluded.category else product_attributes.category end;

  return query
    select
      count(*)::bigint,
      count(*) filter (where pa.product_id = pa.canonical_id)::bigint
    from product_attributes pa
    join products p on p.id = pa.product_id
    where (p_retailer is null or p.retailer = p_retailer)
      and (p_merk_van is null or lower(coalesce(p.brand, '')) >= p_merk_van)
      and (p_merk_tot is null or lower(coalesce(p.brand, '')) < p_merk_tot);
end;
$$;

revoke execute on function vul_product_attributes(text, text, text) from public, anon, authenticated;
