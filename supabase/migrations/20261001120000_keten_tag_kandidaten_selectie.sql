/*
  # keten_tag_kandidaten: selectie op prijsband en gender

  ## Waarom
  De tagger selecteerde alleen op retailer. Gemeten op 1 oktober 2026: de
  bruikbare pool was 16.133 producten, allemaal H&M, en het gat zat in een
  prijsband, niet in een winkel. Een man tussen 50 en 150 euro had 37 getagde
  tops, 24 broeken, 10 paar schoenen en 4 accessoires, tegenover 11.418
  ongetagde kandidaten in die band. Onder 50 euro had hij bijna 2.000 tops.
  Met deze parameters tagt een run eerst wat gebruikers het meest mist, in
  plaats van een hele winkel achter elkaar.

  ## Wat deze migratie doet
  Drie optionele parameters op keten_tag_kandidaten, alle drie standaard null:
  - p_prijs_min, p_prijs_max: grenzen op product_attributes.price, inclusief,
    net als "between" in get_kandidaten.
  - p_gender: dezelfde regel als get_kandidaten. "male" geeft male en unisex,
    "female" geeft female en unisex, "unisex" of null geeft alles. Zo tagt een
    run precies wat die gebruiker te zien kan krijgen.

  Zonder de nieuwe parameters is het resultaat identiek aan de vorige versie.
  Een aanroep met alleen de vijf oude parameters blijft werken.

  ## Waarom drop en create, en niet create or replace
  Een andere parameterlijst maakt in Postgres een tweede functie naast de
  oude. Twee versies met standaardwaarden maken een aanroep met alleen de oude
  parameters dubbelzinnig voor PostgREST ("could not choose the best candidate
  function"). Daarom gaat de oude signatuur eruit, in dezelfde transactie.
  De nieuwe signatuur staat op create or replace, zodat dit bestand ook
  opnieuw toe te passen is op een database waar hij al bestaat.

  ## Eerst filteren en beperken, dan pas koppelen
  De vorige versie koppelde product_attributes aan products en sorteerde
  daarna. Zonder filter maakte dat niets uit: de planner liep
  idx_product_attributes_tag_kandidaten (retailer, product_id) in volgorde af
  en stopte na p_limit rijen. Met een prijs- of genderfilter kiest hij
  idx_product_attributes_kandidaten (gender, category, price), raakt de
  volgorde op product_id kwijt en koppelt dan elke treffer aan products voor
  hij sorteert. Gemeten op 1 okt 2026 voor Giglio, male, 50-150, limiet 1000:
  8.913 opzoekingen in products voor 1.000 rijen, en met de schijf zoals die
  die dag was 66 seconden. Daarom kiest de binnenste query nu eerst de
  product_id's uit product_attributes, sorteert en beperkt, en koppelt de
  buitenste query alleen die rijen aan products.

  De fotomodus las p.image_url uit de koppeling. Die voorwaarde moet vóór de
  limiet blijven: anders krijgt de tagger kortere pagina's en leest
  haalKandidaten een korte pagina als het einde. Daarom staat hij nu als
  exists op products in de binnenste query. De koppeling na de limiet verliest
  geen rijen: product_attributes.product_id verwijst met on delete cascade
  naar products.id.

  ## plpgsql met custom plans in plaats van een SQL-functie
  Op Postgres 17 plant een SQL-functie die niet wordt ingelijnd (deze is
  security definer en heeft twee statements) bij elke aanroep opnieuw, en
  altijd generiek: de parameters zijn bij het plannen onbekend. Een voorwaarde
  als "p_retailer is null or pa.retailer = p_retailer" kan dan geen
  indexvoorwaarde worden. Gemeten op 1 okt 2026 voor PUMA, male, limiet 300:
  het generieke plan liep idx_product_attributes_canoniek_fashion af met alle
  voorwaarden als filter, 6.912 rijen voor 300 treffers. Bij H&M viel dat niet
  op, want H&M is 19 procent van de kandidaten. Bij Mart Visser (1 procent)
  loopt een pagina vrijwel de hele kandidatenset af.

  Als plpgsql met plan_cache_mode = force_custom_plan wordt elke aanroep
  gepland met de echte waarden: de retailer wordt een indexvoorwaarde op
  idx_product_attributes_tag_kandidaten of idx_product_attributes_dekkingsmatrix,
  prijs en gender op idx_product_attributes_kandidaten. #variable_conflict
  use_column voorkomt dat de kolomnamen van returns table (price, gender, ...)
  als plpgsql-variabelen worden gelezen.

  ## Een hek tegen de verkeerde indexkeuze
  Ook met custom plans koos de planner voor Giglio, 50-150, een index op prijs
  of gender en sorteerde daarna: hij schatte 3 tot 156 rijen in de band, het
  waren er 16.750. Gemeten op 1 okt 2026: 21.403 of 64.468 rijen opgehaald
  voor een pagina van 200, en met de schijf van die dag een statement timeout
  na 8 s.

  De index die past is idx_product_attributes_tag_kandidaten (retailer,
  product_id): die levert de rijen van een winkel al in paginavolgorde, zodat
  de scan stopt zodra de pagina vol is. Daarom staat de selectie in twee
  lagen. De binnenste laag (b) bevat alleen de basisvoorwaarden, de retailer
  en p_after, gesorteerd op product_id, met "offset 0" als hek: daardoor kan
  de planner prijs, gender en tagstatus er niet in duwen en kiest hij de
  geordende scan. De laag daarboven filtert en beperkt. Gemeten met dit hek:
  764 rijen voor een pagina van 200 (48 ms), 6.746 voor een pagina van 1.000
  mannenitems (881 ms).

  ## Rechten
  Supabase geeft een nieuwe functie standaard uitvoerrecht voor anon en
  authenticated. De revoke hieronder herhaalt die van 20260916100000 voor de
  nieuwe signatuur; scripts/keten/__tests__/migraties.live.test.ts controleert
  dat de anon-sleutel "permission denied" krijgt.

  ## Terugdraaien
  begin;
  drop function if exists keten_tag_kandidaten(text, text, text, int, uuid, numeric, numeric, text);
  -- daarna de functie uit 20260922120000_keten_tag_kandidaten_product_attributes.sql
  -- opnieuw aanmaken, plus de revoke op (text, text, text, int, uuid)
  commit;
*/

begin;

drop function if exists keten_tag_kandidaten(text, text, text, int, uuid);

create or replace function keten_tag_kandidaten(
  p_retailer text default null,
  p_modus text default 'tekst',
  p_versie text default 'haiku-4.5-v1',
  p_limit int default 1000,
  p_after uuid default null,
  p_prijs_min numeric default null,
  p_prijs_max numeric default null,
  p_gender text default null
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
  select
    k.product_id,
    p.name,
    p.brand,
    left(coalesce(p.description, ''), 1200) as description,
    k.price,
    k.retailer,
    p.category as raw_category,
    k.gender,
    p.image_url,
    k.confidence
  from (
    select b.product_id, b.price, b.retailer, b.gender, b.confidence
    from (
      select pa.product_id, pa.price, pa.retailer, pa.gender, pa.confidence, pa.tagger_version
      from product_attributes pa
      where pa.canonical_id = pa.product_id
        and pa.is_fashion
        and pa.classifier_version is not null
        and pa.in_stock
        and (p_retailer is null or pa.retailer = p_retailer)
        and (p_after is null or pa.product_id > p_after)
      order by pa.product_id
      offset 0  -- hek, zie boven
    ) b
    where (p_prijs_min is null or b.price >= p_prijs_min)
      and (p_prijs_max is null or b.price <= p_prijs_max)
      and (p_gender is null or p_gender = 'unisex' or b.gender in (p_gender, 'unisex'))
      and case p_modus
            when 'foto' then
              b.tagger_version = p_versie
              and b.confidence < 0.6
              and exists (
                select 1 from products f
                where f.id = b.product_id and f.image_url like 'http%'
              )
            else
              b.tagger_version is null
              or b.tagger_version not like p_versie || '%'
          end
    order by b.product_id
    limit p_limit
  ) k
  join products p on p.id = k.product_id
  order by k.product_id;
end;
$$;

revoke all on function keten_tag_kandidaten(text, text, text, int, uuid, numeric, numeric, text) from public, anon, authenticated;

commit;

notify pgrst, 'reload schema';
