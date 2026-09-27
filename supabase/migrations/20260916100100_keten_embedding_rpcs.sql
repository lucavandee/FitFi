/*
  # Keten plan 2: RPC's voor FashionCLIP-embeddings

  ## Wat deze migratie doet
  Twee functies voor scripts/keten/embed-products.py, alleen met de service
  role: keten_embed_kandidaten (kandidaten zonder embedding, keyset-paginatie)
  en keten_schrijf_embeddings (schrijft een jsonb-array {product_id, embedding}
  terug, embedding als pgvector-tekstvorm "[f1,...,f512]").

  ## Afwijking van de taak-6-brief: geen join naar products
  De brief stelde keten_embed_kandidaten voor met een join naar products voor
  p.in_stock, p.retailer en p.image_url. Dat is precies de constructie die dit
  project al twee keer duur heeft geleerd te vermijden:
    - get_kandidaten (20260914120400): filter op p.price/p.in_stock via een
      join naar products, 56,5s en een statement-timeout (~39.000 losse
      heap-fetches op products).
    - keten_tag_kandidaten (20260922120000): filter op p.in_stock/p.retailer
      via dezelfde constructie, 58,2s en EXPLAIN ANALYZE met loops=91021.
  in_stock en retailer staan sinds 20260914120400 al gedenormaliseerd op
  product_attributes; image_url stond er nog niet. In plaats van die ene
  kolom via een join te filteren (en zo dezelfde fout een derde keer te
  maken), voegt deze migratie image_url toe aan product_attributes en vult
  hem eenmalig terug vanuit products. keten_embed_kandidaten filtert daarna
  volledig op product_attributes, zonder join.

  De eenmalige backfill zelf is geen risico: het is een update op de
  primary-key-join (product_id = products.id), dezelfde soort bulkoperatie
  als vul_product_attributes al op de volle 281.999 rijen doet. Geen
  write naar products, products wordt alleen gelezen (randvoorwaarde
  "raak products niet aan" gaat over de tabel wijzigen / vul_product_attributes
  draaien, niet over lezen -- keten_tag_kandidaten en zet_classificatie lezen
  products voor dezelfde reden ook al).

  ## Placeholder-beveiliging (plan 2, "wat de spec openlaat")
  Een image_url die veel producten delen kan een generieke "geen foto"-
  afbeelding zijn; die embeddings zouden in taak 8 (dedupe op cosine >= 0.999)
  alles met alles laten matchen. Gemeten (25 sept 2026) voor de letterlijke
  lezing "10+ product_id's delen een image_url" over de hele products-tabel:
  1.381 image_url's raken die drempel, 15.103 rijen. Bij inspectie (bv.
  https://image.hm.com/assets/hm/32/71/3271...jpg, 21 rijen) is dat geen
  placeholder maar een normale maatwaaier: 21 rijen, allemaal dezelfde naam
  "H & M - Regular Jeans - Zwart", een en hetzelfde canonieke product in 21
  maten. vul_product_attributes canoniseert al op (retailer, image_url), dus
  zulke rijen worden sowieso tot een canonical_id samengevouwen; op
  canonical_id-niveau deelt daardoor per retailer geen enkel image_url twee
  canonieke producten (geverifieerd: 0 rijen bij group by op canonieke
  product_attributes-rijen). Een echte placeholder ziet er anders uit: bij
  Puma delen ongebroken URL's als https://images.puma.net/images/402366/04/
  sv01/fnd/EEA/ (geen bestandsnaam) tot 16 volledig verschillende
  productnamen. Het onderscheidende kenmerk is dus niet het aantal rijen,
  maar het aantal VERSCHILLENDE productnamen achter een image_url: een
  maatwaaier heeft er 1, een placeholder heeft er veel. De backfill laat
  image_url daarom leeg (null) voor elke url met 10 of meer verschillende
  products.name-waarden; die rijen missen dan de "image_url is not null"-
  voorwaarde in keten_embed_kandidaten en krijgen geen embedding. Voor H&M
  (NL), de retailer van deze taak, raakt deze regel vandaag 0 rijen (geen
  enkele H&M-url heeft >=10 verschillende namen); de bescherming staat wel
  klaar voor andere retailers en toekomstige feeds.

  ## Meting
  EXPLAIN ANALYZE op pagina 1 en op een diepe pagina (p_after ver in de
  reeks), retailer H&M (NL): zie
  .superpowers/sdd/2026-09-14-plan-2-tagging/taak-6-report.md.

  ## Toepassing: de backfill hierboven is te groot voor een enkele
  `db query -f`-aanroep
  De update over de volle products-tabel (281.999 rijen) liep vast op de
  timeout van de Management API (57014, ook zonder de placeholder-CTE erbij
  te rekenen). Per retailer lukt het wel (H&M (NL), 88.043 rijen, ~65s). Wie
  deze migratie opnieuw toepast: DDL (add column, index, functies) eerst in
  een eigen aanroep, daarna de update-statement hierboven los per retailer
  met een extra "and p.retailer = '<naam>'"-voorwaarde in zowel de
  placeholders-CTE als de hoofdquery. Vandaag alleen voor H&M (NL) gedaan
  (de retailer van taak 6); de andere vijf retailers hebben nog een lege
  image_url op product_attributes. Zie taak-6-report.md voor de precieze
  reden (agent-specifieke blokkade op de pg_cron-uitwijk die het plan hier
  zelf voor voorschrijft).

  ## Terugdraaien
  drop function if exists keten_schrijf_embeddings(jsonb);
  drop function if exists keten_embed_kandidaten(text, int, uuid);
  drop index if exists idx_product_attributes_embed_kandidaten;
  alter table product_attributes drop column if exists image_url;
*/

alter table product_attributes
  add column if not exists image_url text;

-- Eenmalige backfill. Placeholder-urls (10+ verschillende productnamen delen
-- 'm) blijven bewust null, zie toelichting hierboven.
with placeholders as (
  select image_url
  from products
  where image_url is not null
  group by image_url
  having count(distinct name) >= 10
)
update product_attributes pa
set image_url = p.image_url
from products p
where pa.product_id = p.id
  and p.image_url like 'http%'
  and not exists (
    select 1 from placeholders ph where ph.image_url = p.image_url
  );

-- Precies de kandidatenverzameling van keten_embed_kandidaten hieronder,
-- zonder embedding is null: die voorwaarde hoort er wel in (embeddings
-- vullen zich tijdens de run, dus de index moet daarmee meekrimpen), anders
-- dan tagger_version elders (dat is een versiestring die bij een hertagronde
-- van betekenis wisselt; embedding is null/niet-null heeft dat probleem
-- niet, het is een eenmalige voltooiingsstatus).
create index if not exists idx_product_attributes_embed_kandidaten
  on product_attributes (retailer, product_id)
  where product_id = canonical_id
    and is_fashion
    and in_stock
    and tagger_version is not null
    and embedding is null;

create or replace function keten_embed_kandidaten(
  p_retailer text default null,
  p_limit int default 500,
  p_after uuid default null
)
returns table (product_id uuid, image_url text)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  select pa.product_id, pa.image_url
  from product_attributes pa
  where pa.product_id = pa.canonical_id
    and pa.is_fashion
    and pa.in_stock
    and pa.tagger_version is not null
    and pa.embedding is null
    and pa.image_url is not null
    and (p_retailer is null or pa.retailer = p_retailer)
    and (p_after is null or pa.product_id > p_after)
  order by pa.product_id
  limit p_limit;
$$;

revoke all on function keten_embed_kandidaten(text, int, uuid) from public, anon, authenticated;

create or replace function keten_schrijf_embeddings(p_rijen jsonb)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_aantal integer;
begin
  update product_attributes pa
  set embedding = (r->>'embedding')::extensions.vector
  from jsonb_array_elements(coalesce(p_rijen, '[]'::jsonb)) as r
  where pa.product_id = (r->>'product_id')::uuid;

  get diagnostics v_aantal = row_count;
  return v_aantal;
end;
$$;

revoke all on function keten_schrijf_embeddings(jsonb) from public, anon, authenticated;
