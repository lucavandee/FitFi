/*
  # product_attributes.image_url aanvullen en bijhouden; keten_embed_kandidaten in plpgsql

  ## Probleem, gemeten op 2 oktober 2026
  Na de grote tagrun (19.384 nieuwe tags) kregen de nieuwe kandidaten geen
  embedding. keten_embed_kandidaten eist pa.image_url is not null, en dat veld
  was alleen voor H&M gevuld: voor Giglio (16.629 getagd), PUMA (1.621), OFM
  (1.220), Mart Visser (600) en The New Originals (13) stond het overal op null,
  terwijl products.image_url er gewoon was. De placeholderregel van
  20260916100100 verklaarde daarvan maar 109 PUMA-rijen; de rest was nooit
  aangevuld. keten_vul_nieuwe_producten maakt rijen aan zonder image_url, en
  niets hield het veld daarna bij.

  Daarnaast gaf keten_embed_kandidaten voor H&M een statement timeout: het is
  een SQL-functie met twee statements, en Postgres 17 plant die zonder de
  parameterwaarden, zodat de retailer nooit een indexvoorwaarde werd (zelfde
  oorzaak als bij keten_tag_kandidaten en get_kandidaten).

  ## Wat deze migratie doet
  1. Eenmalig aanvullen voor alle canonieke, draagbare rijen op voorraad zonder
     image_url (70.718 op 2 okt), met exact de regel van 20260916100100: alleen
     http-URL's, en geen URL die door tien of meer verschillende productnamen
     gedeeld wordt (een placeholder).
  2. Een trigger bij het invoegen van een rij: is image_url leeg, dan komt hij
     uit products. Zonder placeholderregel: products.image_url heeft geen index,
     dus die regel per rij toetsen zou de hele tabel scannen. Een placeholder bij
     een nieuw product krijgt zo een embedding van die placeholder; dat raakt
     alleen de gelijkenisscore, niet wat een bezoeker ziet.
  3. keten_embed_kandidaten in plpgsql met plan_cache_mode = force_custom_plan,
     zelfde uitkomst.

  ## Uitvoering op productie
  Als één bestand liep dit na 2 minuten in de statement timeout van de
  Management API (de aanvulling raakt 13 indexen per rij); de transactie werd
  volledig teruggedraaid. Op 2 okt is het daarom in delen uitgevoerd: eerst de
  functies en de trigger, dan de placeholderlijst eenmalig in een hulptabel
  (138 URL's, 24 s), dan de aanvulling per retailer en voor Giglio in 16
  porties op het eerste teken van product_id (samen 275 s), tot slot
  "vacuum product_attributes". Daarna nog leeg: 135 PUMA-rijen, de
  placeholders volgens de regel. Het bestand hieronder doet hetzelfde in één
  keer, voor een omgeving zonder die timeout.

  ## Terugdraaien
  drop trigger if exists product_attributes_image_url on product_attributes;
  drop function if exists keten_zet_image_url();
  -- keten_embed_kandidaten: de vorige definitie staat in 20260916100100.
  -- De aanvulling zelf terugdraaien is niet zinvol: het veld was leeg.
*/

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
  and pa.image_url is null
  and pa.product_id = pa.canonical_id
  and pa.is_fashion
  and pa.in_stock
  and p.image_url like 'http%'
  and not exists (select 1 from placeholders ph where ph.image_url = p.image_url);

create or replace function keten_zet_image_url()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.image_url is null then
    select p.image_url into new.image_url
    from products p
    where p.id = new.product_id
      and p.image_url like 'http%';
  end if;
  return new;
end;
$$;

drop trigger if exists product_attributes_image_url on product_attributes;
create trigger product_attributes_image_url
  before insert on product_attributes
  for each row execute function keten_zet_image_url();

create or replace function keten_embed_kandidaten(
  p_retailer text default null,
  p_limit int default 500,
  p_after uuid default null
)
returns table (product_id uuid, image_url text)
language plpgsql
stable
security definer
set search_path = public, extensions
set plan_cache_mode = force_custom_plan
as $$
#variable_conflict use_column
begin
  perform keten_controleer_retailer(p_retailer);

  return query
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
end;
$$;

revoke all on function keten_embed_kandidaten(text, int, uuid) from public, anon, authenticated;
revoke all on function keten_zet_image_url() from public, anon, authenticated;

notify pgrst, 'reload schema';
