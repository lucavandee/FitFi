/*
  # get_kandidaten: dekkende index, plpgsql met custom plans

  ## Probleem, gemeten op 1 oktober 2026
  Een koude aanroep zoals de site die doet (anon, vrouw, casual en werk, budget
  0-150) gaf HTTP 500: statement timeout, en anon heeft 3 s. Dezelfde aanroep
  daarna duurde 3,1 s en 0,6 s. Oorzaak: de basisselectie raakt voor dit
  profiel 12.187 rijen aan, verspreid over vrijwel evenveel tabelpagina's van
  product_attributes (11.204 pagina's, 88 MB). Met een koude cache is dat per
  rij een leesactie van schijf, en op deze kleine instantie kostte een
  leesactie die dag 5 tot 30 ms. PR 115 geeft de app één herkansing; dit pakt
  de oorzaak aan.

  Daarnaast is get_kandidaten een SQL-functie met twee statements. Postgres 17
  lijnt die niet in en plant hem zonder de parameterwaarden, dus
  "p_gender = 'unisex' or pa.gender in (p_gender, 'unisex')" werd nooit een
  indexvoorwaarde. Het generieke plan las voor dit profiel 16.577 rijen, het
  custom plan 12.187.

  ## Wat deze migratie doet
  1. Een dekkende partiele index met precies de kolommen die de basisselectie,
     de score en attrs lezen. De selectie kan dan uit de index komen (index-only
     scan) in plaats van uit verspreide tabelpagina's.
  2. embedding staat niet meer in de basisselectie. De gelijkenis met gelikete
     items haalt de embedding nu per kandidaat op, en alleen als er likes zijn.
     De site stuurt nooit likes mee; de stylist wel, en daar verandert de
     uitkomst niet.
  3. plpgsql met plan_cache_mode = force_custom_plan, zodat gender, categorie
     en prijs samen de indexvoorwaarde vormen. #variable_conflict use_column
     voorkomt dat de kolomnamen van returns table als variabelen gelezen worden.
  4. statement_timeout = 8s op de functie. Anon heeft 3 s; een functie-instelling
     gaat daar voor (getest op 1 okt 2026 met een wegwerpfunctie die 4 s sliep:
     als anon HTTP 200 in 4,3 s). Na deze migratie zit de rest van een koude
     aanroep in de koppeling aan products: 151 opzoekingen van ongeveer 2 ms in
     het gemeten profiel, en bij een koude cache per rij een leesactie van
     schijf. Dat mag nu langer duren dan 3 s zonder dat de bezoeker een fout
     krijgt; 8 s is wat authenticated al heeft.
  5. Autovacuum op product_attributes na 1 procent gewijzigde rijen in plaats
     van 20 procent. Een index-only scan leest de tabel toch voor elke pagina
     die niet als zichtbaar gemarkeerd is, en tagrondes raken veel pagina's.
     Op 1 oktober stond 64 procent van de pagina's gemarkeerd; de laatste
     autovacuum was van 25 september.

  ## Uitkomst gelijk
  Zelfde handtekening, zelfde kolommen, zelfde rijen in dezelfde volgorde met
  dezelfde scores. Voor het toepassen naast de oude functie gedraaid onder een
  tijdelijke naam en vergeleken over profielen met en zonder assen, likes,
  niet-wil-ids en retailer; zie de PR.

  ## Terugdraaien
  De vorige definitie staat in 20260925090000_keten_get_kandidaten_attrs_expliciet.sql
  (language sql, embedding in basis). Daarna:
    drop index if exists idx_product_attributes_get_kandidaten_dekkend;
    alter table product_attributes reset (autovacuum_vacuum_scale_factor);
*/

create index if not exists idx_product_attributes_get_kandidaten_dekkend
  on product_attributes (gender, category, price)
  include (product_id, retailer, occasions, formality, silhouette, color_temp,
           lightness, pattern, shoe_type, colors, materials, seasons, classifier_version)
  where product_id = canonical_id
    and is_fashion
    and in_stock
    and classifier_version is not null
    and tagger_version is not null;

alter table product_attributes set (autovacuum_vacuum_scale_factor = 0.01);

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
    to_jsonb(p.*) as product
  from gerangschikt g
  join products p on p.id = g.product_id
  where g.rn <= least(60, greatest(1, coalesce(p_per_category, 12)))
  order by g.category, g.score desc, g.product_id;
end;
$$;
