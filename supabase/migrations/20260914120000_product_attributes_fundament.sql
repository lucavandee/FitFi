/*
  # product_attributes: fundament (dedupe, ruwe velden, schrijfweg voor de classifier)

  ## Probleem
  De engine leest rechtstreeks uit products. Die tabel heeft geen betrouwbare
  categorie (50.618 accessoires hebben een kledingwoord in de naam, gemeten
  2026-09-15), geen ontdubbeling (elke maat en kleur is een rij) en geen
  prijsband. Alles wat de engine nodig heeft en niet in de feed zit, werd op
  de client met regex afgeleid, op 1.000 van de 282.000 rijen.

  ## Wat deze migratie doet
  1. Zet pgvector aan (de kolom embedding blijft leeg tot plan 2).
  2. Maakt product_attributes, 1 op 1 met products.id, met alleen de kolommen
     die zonder taalmodel te vullen zijn: canonical_id, is_fashion, category,
     gender, price_band, plus classifier_version (welke versie van de
     productclassifier category en is_fashion heeft gezet; null = ruw uit
     de feed). De tagger-kolommen uit spec 5.1 komen in plan 2.
  3. normaliseer_productnaam: naam zonder maat- en kleursuffix.
  4. vul_product_attributes(p_retailer, p_merk_van, p_merk_tot): vult of
     ververst de tabel uit products en kiest per (retailer, image_url) de
     goedkoopste in-stock variant als canoniek: dezelfde foto is dezelfde
     look in een andere maat of prijs, een andere kleur heeft een andere
     foto (spec 5.1, 16 september; naam-dedupe vouwde bij Giglio 169.697
     rijen samen tot 10.209 terwijl er 68.739 unieke foto's zijn). Alleen
     als image_url leeg is (vandaag 0 rijen) valt de sleutel terug op
     retailer, merk en genormaliseerde naam. Idempotent. Per retailer en
     desnoods per merk-range te draaien als een run te lang duurt. Rijen
     met een classifier_version houden hun category en is_fashion.
  5. zet_classificatie(p_rijen, p_versie): schrijft category en is_fashion
     voor een batch rijen (jsonb) en zet classifier_version. Alleen voor
     service_role; dit is de schrijfweg van scripts/keten/classificeer-attributes.ts.

  ## RLS
  Lezen voor anon en authenticated. Schrijven alleen via service role
  (geen insert/update/delete-policies). vul_product_attributes en
  zet_classificatie zijn security definer en niet uitvoerbaar voor anon en
  authenticated.

  ## Terugdraaien
  drop function if exists zet_classificatie(jsonb, text);
  drop function if exists vul_product_attributes(text, text, text);
  drop function if exists normaliseer_productnaam(text);
  drop table if exists product_attributes;
*/

-- 1. pgvector. Supabase installeert extensies in het schema extensions.
create extension if not exists vector with schema extensions;

-- 2. Tabel
create table if not exists product_attributes (
  product_id         uuid primary key references products(id) on delete cascade,
  canonical_id       uuid not null,
  is_fashion         boolean not null default false,
  category           text check (category in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')),
  gender             text not null default 'unisex' check (gender in ('male', 'female', 'unisex')),
  price_band         text not null check (price_band in ('tot50', '50tot100', '100tot200', 'boven200')),
  classifier_version text,
  embedding          extensions.vector(512),
  tagged_at          timestamptz
);

create index if not exists idx_product_attributes_canonical
  on product_attributes (canonical_id);

create index if not exists idx_product_attributes_gender_category_band
  on product_attributes (gender, category, price_band);

-- Alleen canonieke, draagbare rijen worden door get_kandidaten gelezen.
create index if not exists idx_product_attributes_canoniek_fashion
  on product_attributes (product_id)
  where is_fashion and product_id = canonical_id;

alter table product_attributes enable row level security;

drop policy if exists "Iedereen kan product_attributes lezen" on product_attributes;
create policy "Iedereen kan product_attributes lezen"
  on product_attributes
  for select
  to anon, authenticated
  using (true);

-- 3. Naamnormalisatie: eerst het maatsuffix (staat achteraan), dan het
--    kleursuffix dat daarna achteraan staat. Voorbeelden uit de feed:
--    "PUMA Evostripe broek voor Heren, Grijs, Maat XXL"  -> "puma evostripe broek voor heren"
--    "PUMA Tackle L sneakers uniseks, Zwart/Goud, Maat 44,5" -> "puma tackle l sneakers uniseks"
--    "Jeans FRAME Woman color Blue" -> "jeans frame woman"
create or replace function normaliseer_productnaam(p_naam text)
returns text
language sql
immutable
strict
as $$
  select lower(btrim(
    regexp_replace(
      regexp_replace(
        regexp_replace(p_naam, ',\s*maat\s+.+$', '', 'i'),
        '\s+colou?r\s+[a-z]+\s*$', '', 'i'
      ),
      ',\s*(zwart|wit|grijs|navy|beige|camel|bruin|groen|rood|roze|blauw|geel|paars|oranje|multicolor|multi|ecru|creme|cream|off-?white|antraciet|anthracite|khaki|olijf|olive|bordeaux|donkerblauw|lichtblauw|black|white|grey|gray|blue|red|green|pink|brown|yellow|purple|orange)(\s*/\s*[a-z-]+)*\s*$', '', 'i'
    )
  ))
$$;

-- 4. Vulfunctie
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
  insert into product_attributes (product_id, canonical_id, is_fashion, category, gender, price_band)
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
    end as price_band
  from gerangschikt g
  on conflict (product_id) do update set
    canonical_id = excluded.canonical_id,
    gender       = excluded.gender,
    price_band   = excluded.price_band,
    -- Een rij die de classifier al heeft gezien, houdt die uitkomst.
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

-- 5. Schrijfweg voor het classificatiescript (taak 2).
--    p_rijen: jsonb-array van {product_id, category, is_fashion}.
--    category null = niet een van de zes; is_fashion wordt bovendien false
--    als products.is_kids waar is, wat de classifier ook zegt.
create or replace function zet_classificatie(p_rijen jsonb, p_versie text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  aantal bigint;
begin
  update product_attributes pa
  set
    category           = r.category,
    is_fashion         = (r.is_fashion and coalesce(p.is_kids, false) = false),
    classifier_version = p_versie
  from jsonb_to_recordset(p_rijen) as r(product_id uuid, category text, is_fashion boolean)
  join products p on p.id = r.product_id
  where pa.product_id = r.product_id;
  get diagnostics aantal = row_count;
  return aantal;
end;
$$;

revoke execute on function vul_product_attributes(text, text, text) from public, anon, authenticated;
revoke execute on function normaliseer_productnaam(text) from public, anon, authenticated;
revoke execute on function zet_classificatie(jsonb, text) from public, anon, authenticated;
grant execute on function zet_classificatie(jsonb, text) to service_role;
