/*
  # Keten plan 2: tag-kolommen op product_attributes

  ## Probleem
  De engine heeft geen formaliteit, gelegenheid, silhouet of kleurtemperatuur
  per product. Engine v2 compenseert met regex op productnamen.

  ## Wat deze migratie doet
  - Voegt de tag-kolommen uit spec 5.1 toe aan product_attributes, met
    check-constraints op de vaste waardenlijsten. embedding en tagged_at
    bestaan al sinds plan 1; "if not exists" maakt dat onschadelijk.
  - Indexen uit spec 5.1: canonical_id, (gender, category, price_band),
    GIN op occasions. De ivfflat-index op embedding volgt in
    20260916100300, na de embed-run, zodat de lijsten op echte data trainen.
  - Index op products (retailer): elke RPC in dit plan filtert daarop.
  - Index op (tagger_version, product_id): de vraag "wat is nog niet getagd"
    en de foto-ronde (tagger_version = versie and confidence < 0.6). Bewust
    geen partiele index op "tagger_version is null": zodra de versie wordt
    opgehoogd is niets meer null en zou zo'n index niets meer dekken.
  - keten_controleer_retailer: gooit een fout bij een retailer-naam die niet
    in products voorkomt, zodat een typefout nooit stil nul rijen geeft.
  - Twee RPC's voor het tag-script, alleen aanroepbaar met de service role:
    keten_tag_kandidaten (nog niet getagde canonieke, geclassificeerde
    producten, keyset-paginatie) en keten_schrijf_tags (schrijft een
    jsonb-array met tags). category wordt niet geschreven: die is van de
    classifier uit plan 1 (zet_classificatie, classifier_version); het harnas
    uit plan 1 gaat rood als de client-classifier en product_attributes het
    oneens zijn. is_fashion kan alleen van waar naar onwaar.
  - pg_cron aan: nodig voor de eenmalige-job-uitwijk bij lange queries
    (taak 6 en 8) en voor de jobs in 20260916100500.

  ## Terugdraaien
  drop function if exists keten_schrijf_tags(jsonb);
  drop function if exists keten_tag_kandidaten(text, text, text, int, uuid);
  drop function if exists keten_controleer_retailer(text);
  drop index if exists idx_products_retailer;
  drop index if exists idx_product_attributes_tagger_version;
  alter table product_attributes
    drop column if exists formality, drop column if exists occasions,
    drop column if exists silhouette, drop column if exists color_temp,
    drop column if exists lightness, drop column if exists pattern,
    drop column if exists shoe_type, drop column if exists colors,
    drop column if exists materials, drop column if exists seasons,
    drop column if exists confidence, drop column if exists tagger_version;
*/

create extension if not exists vector with schema extensions;
create extension if not exists pg_cron;

alter table product_attributes
  add column if not exists formality smallint
    check (formality between 1 and 5),
  add column if not exists occasions text[] not null default '{}',
  add column if not exists silhouette text
    check (silhouette in ('slim', 'regular', 'relaxed', 'oversized')),
  add column if not exists color_temp text
    check (color_temp in ('warm', 'koel', 'neutraal')),
  add column if not exists lightness text
    check (lightness in ('licht', 'medium', 'donker')),
  add column if not exists pattern text
    check (pattern in ('effen', 'subtiel', 'statement')),
  add column if not exists shoe_type text
    check (shoe_type in ('sneaker', 'net', 'laars', 'sandaal')),
  add column if not exists colors text[] not null default '{}',
  add column if not exists materials text[] not null default '{}',
  add column if not exists seasons text[] not null default '{}',
  add column if not exists confidence real
    check (confidence between 0 and 1),
  add column if not exists tagger_version text,
  add column if not exists embedding extensions.vector(512),
  add column if not exists tagged_at timestamptz;

alter table product_attributes
  drop constraint if exists product_attributes_occasions_check;
alter table product_attributes
  add constraint product_attributes_occasions_check
  check (occasions <@ array['work', 'casual', 'formal', 'date', 'travel', 'sport', 'party']::text[]);

-- Indexen. "if not exists" omdat plan 1 canonical_id al geindexeerd kan
-- hebben onder dezelfde naam.
create index if not exists idx_products_retailer
  on products (retailer);
create index if not exists idx_product_attributes_canonical
  on product_attributes (canonical_id);
create index if not exists idx_product_attributes_gender_category_band
  on product_attributes (gender, category, price_band);
create index if not exists idx_product_attributes_occasions
  on product_attributes using gin (occasions);
create index if not exists idx_product_attributes_tagger_version
  on product_attributes (tagger_version, product_id);

-- Retailer-controle. null betekent "alle retailers" en is altijd goed.
create or replace function keten_controleer_retailer(p_retailer text)
returns void
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
begin
  if p_retailer is not null
     and not exists (select 1 from products where retailer = p_retailer) then
    raise exception 'Onbekende retailer: "%". Zoek de exacte naam op met: select retailer, count(*) from products group by 1 order by 2 desc', p_retailer
      using errcode = 'P0002';
  end if;
end;
$$;

-- get_kandidaten (security invoker, taak 7) roept deze controle aan namens
-- anon en authenticated; de functie leest alleen of een naam bestaat.
grant execute on function keten_controleer_retailer(text) to anon, authenticated;

-- Nog niet getagde canonieke producten voor het tag-script. Alleen rijen die
-- de classifier uit plan 1 heeft gezien (classifier_version is not null):
-- de ruwe feedcategorie is te vaak fout om op te taggen.
-- p_modus 'tekst': rijen zonder tags van deze versie (ook niet de foto-variant).
-- p_modus 'foto':  rijen die met p_versie getagd zijn en confidence < 0.6 hebben
--                  en een foto-URL hebben; na de foto-ronde krijgt de rij
--                  tagger_version p_versie || '-foto' en valt hij hier uit.
-- Bekende beperking: bij een versiewissel matcht "not like p_versie || '%'"
-- elke rij en is de index op tagger_version geen hulp; dat is dan een
-- volledige scan van de tabel per pagina, wat bij ~287k rijen seconden kost
-- en acceptabel is voor een eenmalige her-tagging.
create or replace function keten_tag_kandidaten(
  p_retailer text default null,
  p_modus text default 'tekst',
  p_versie text default 'haiku-4.5-v1',
  p_limit int default 1000,
  p_after uuid default null
)
returns table (
  product_id uuid,
  name text,
  brand text,
  description text,
  price numeric,
  retailer text,
  raw_category text,
  gender text,
  image_url text,
  confidence real
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  select
    pa.product_id,
    p.name,
    p.brand,
    left(coalesce(p.description, ''), 1200) as description,
    p.price,
    p.retailer,
    p.category as raw_category,
    pa.gender,
    p.image_url,
    pa.confidence
  from product_attributes pa
  join products p on p.id = pa.product_id
  where pa.canonical_id = pa.product_id
    and pa.is_fashion
    and pa.classifier_version is not null
    and p.in_stock
    and (p_retailer is null or p.retailer = p_retailer)
    and (p_after is null or pa.product_id > p_after)
    and case p_modus
          when 'foto' then
            pa.tagger_version = p_versie
            and pa.confidence < 0.6
            and p.image_url like 'http%'
          else
            pa.tagger_version is null
            or pa.tagger_version not like p_versie || '%'
        end
  order by pa.product_id
  limit p_limit;
$$;

revoke all on function keten_tag_kandidaten(text, text, text, int, uuid) from public, anon, authenticated;

-- Schrijft een jsonb-array van tagrijen. Elke rij:
-- { product_id, is_fashion, category, gender, formality, occasions, silhouette,
--   color_temp, lightness, pattern, shoe_type, colors, materials, seasons,
--   confidence, tagger_version }
-- category blijft van de classifier (plan 1) en wordt hier niet geschreven.
-- De category van de tagger telt alleen mee voor is_fashion: 'geen' of
-- is_fashion false van de tagger zet is_fashion op false. Van onwaar naar
-- waar kan niet: de classifier en de kinder-/niet-kledingregels gaan voor.
create or replace function keten_schrijf_tags(p_rijen jsonb)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_aantal integer;
begin
  update product_attributes pa
  set
    is_fashion = pa.is_fashion
                 and coalesce((r->>'is_fashion')::boolean, true)
                 and coalesce(r->>'category', '') <> 'geen',
    gender = coalesce(nullif(r->>'gender', ''), pa.gender),
    formality = (r->>'formality')::smallint,
    occasions = coalesce(array(select jsonb_array_elements_text(r->'occasions')), '{}'),
    silhouette = r->>'silhouette',
    color_temp = r->>'color_temp',
    lightness = r->>'lightness',
    pattern = r->>'pattern',
    shoe_type = nullif(r->>'shoe_type', ''),
    colors = coalesce(array(select jsonb_array_elements_text(r->'colors')), '{}'),
    materials = coalesce(array(select jsonb_array_elements_text(r->'materials')), '{}'),
    seasons = coalesce(array(select jsonb_array_elements_text(r->'seasons')), '{}'),
    confidence = (r->>'confidence')::real,
    tagger_version = r->>'tagger_version',
    tagged_at = now()
  from jsonb_array_elements(coalesce(p_rijen, '[]'::jsonb)) as r
  where pa.product_id = (r->>'product_id')::uuid;

  get diagnostics v_aantal = row_count;
  return v_aantal;
end;
$$;

revoke all on function keten_schrijf_tags(jsonb) from public, anon, authenticated;
