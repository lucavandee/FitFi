/*
  # Keten plan 2: get_kandidaten met de volledige score (spec 5.3)

  ## Uitgangspunt (gecontroleerd met pg_get_functiondef vóór deze migratie)
  De live get_kandidaten is niet 20260914120500 maar drie migraties verder:
  20260914120700 (classifier_version verplicht), 20260914120800
  (prijsbucket-tiebreak i.p.v. exacte afstand) en 20260914120900 (plafond
  least(60, greatest(1, coalesce(p_per_category, 12))) tegen een anonieme
  aanroeper die p_per_category torenhoog zet). Alle drie filteren en
  rangschikken nog altijd volledig op product_attributes en joinen products
  pas na de topN-afkap. Deze migratie bouwt daarop voort: het plafond blijft
  staan (niet-onderhandelbaar, get_kandidaten is grant execute ... to anon),
  de prijsbucket-tiebreak vervalt omdat score nu een echte rangschikking
  levert en prijs geen sorteersleutel meer hoeft te zijn.

  ## Probleem
  Plan 1 leverde get_kandidaten zonder tags: alleen harde filters, score
  bleef altijd 0. Nu de tag-kolommen (20260916100000) en de embedding-kolom
  er zijn, komt de score uit spec 5.3 erbij:
    0.5 * as-overeenkomst  (assen waarop attrs gelijk is aan axes.value,
                            gewogen met confidence, gedeeld door de som van
                            de confidences)
  + 0.3 * gelegenheid-overlap (aandeel van p_occasions dat in occasions zit)
  + 0.2 * max cosine-similariteit met de embeddings van p_liked_ids (0 als
          leeg of als er nog geen embeddings zijn -- taak 6 draait pas na
          deze migratie, product_attributes.embedding is vandaag overal
          null. De term is volledig gebouwd en getest op 0 uitkomen, niet
          weggelaten.)

  ## De prestatieles van dit project (twee keer geleerd)
  get_kandidaten filterde ooit via een join naar products (20260914120100):
  56,5 seconden pure uitvoertijd, 57014 op de statement-timeout via de
  anon-route (taak-3-report.md). 20260914120400/120500 losten dat op door
  price, in_stock en retailer naar product_attributes te denormaliseren en
  products pas na de topN-afkap te joinen. Diezelfde fout kwam deze week
  terug in keten_tag_kandidaten (20260922120000, EXPLAIN ANALYZE
  loops=91021, gefixt door in_stock/retailer ook daar op product_attributes
  te filteren). Deze migratie herhaalt die fout niet: geen join naar
  products vóór de afkap, alleen ná "where rn <= plafond", voor de rijen
  die worden teruggegeven (maximaal 6 x p_per_category, bij de default 12
  dus maximaal 72, bij het plafond van 60 maximaal 360).

  ## Wat deze migratie doet
  - Dropt de oude 8-parameter-signatuur (een extra parameter zou anders een
    tweede overload maken in plaats van een vervanging) en, voor
    idempotentie als dit bestand ooit opnieuw wordt gedraaid, ook de eigen
    9-parameter-signatuur.
  - Voegt p_retailer toe (default null, negende parameter) zodat de
    feed-poort de keten op een enkele feed kan draaien (spec 5.7); een
    onbekende naam geeft een fout via keten_controleer_retailer
    (20260916100000), net als bij keten_tag_kandidaten.
  - Filtert, sluit uit (p_disliked_ids) en rangschikt volledig op
    product_attributes: price, in_stock, retailer, classifier_version en de
    tag-kolommen (formality, silhouette, color_temp, lightness, pattern,
    shoe_type, occasions, embedding) staan daar al. Geen join naar products
    in de kandidaat-CTE's. products wordt pas na "where rn <= plafond"
    gejoind, met to_jsonb(p.*) zodat plan 1 taak 6 en plan 3 nog steeds
    colors, sizes en description uit dat object lezen.
  - Alleen getagde rijen (tagger_version is not null): 0.8 van de score
    komt uit tags, een ongetagde rij is niet te scoren en zou toch een plek
    in een outfit vullen. Een retailer telt pas mee na taggen (spec 3, 5.7).
    Daarnaast blijft classifier_version is not null staan (de guard uit
    20260914120700): vandaag overbodig (gemeten: 0 rijen hebben
    tagger_version zonder classifier_version, keten_tag_kandidaten tagt
    uitsluitend geclassificeerde rijen), maar het is de goedkope garantie
    dat een toekomstig pad dat tagger_version zet zonder langs de
    classifier te gaan, niet alsnog serveert.
  - Top p_per_category per categorie (geklemd op maximaal 60, zie hierboven),
    deterministisch op product_id bij gelijke score.
  - Een unisex-profiel ziet alle geslachten; male en female zien hun eigen
    geslacht plus unisex.
  - Blijft security invoker, zoals in plan 1: de aanroeper leest onder zijn
    eigen select-policies. keten_controleer_retailer draait met verhoogde
    rechten (zie 20260916100000, nodig om products te mogen lezen voor de
    naamcontrole) en wordt hier aangeroepen namens de invoker, net als in
    keten_tag_kandidaten.

  ## Verwachting bij de partiële index
  idx_product_attributes_kandidaten (20260914120400) op (gender, category,
  price) where product_id = canonical_id and is_fashion and in_stock dekt
  precies de voorwaarden die hier ook gelden voor de index-scan. De extra
  voorwaarden in deze versie (classifier_version, tagger_version, retailer,
  de disliked-uitsluiting, de score-berekening zelf) staan niet in de index,
  maar worden toegepast als filter/berekening op een rij die de index-scan
  toch al heeft opgehaald: geen extra tabel, geen extra I/O op products vóór
  de afkap. Verwachting: de duur blijft in dezelfde orde van grootte als de
  20260914120500-meting (onder de twee seconden), niet terug naar de
  tientallen seconden van de nested-loop-naar-products. Bewezen, niet
  aangenomen: zie de metingen in taak-7-report.md.

  ## Terugdraaien
  Eerst de 9-parameterversie die dit bestand aanmaakt weghalen, dan de oude
  8-parameterversie terugzetten. Die eerste regel is niet optioneel: laat je
  hem weg, dan staan er twee overloads naast elkaar en blijft elke aanroeper
  die p_retailer meegeeft (9 argumenten, of named args) de nieuwe versie met
  score raken. Het terugdraaien doet dan voor een deel van de aanroepers stil
  niets. Gevonden in de eindreview van 27 september 2026.
  drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int, text);
  supabase db query --linked -f supabase/migrations/20260914120900_get_kandidaten_per_category_plafond.sql

  Let op: 20260925090000 herdefinieert get_kandidaten nog een keer (attrs met
  jsonb_build_object). Terugdraaien naar plan 1 betekent dus ook dat die
  migratie niet meer van toepassing is.
*/

drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int);
drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int, text);

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
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  with liked as (
    select embedding
    from product_attributes
    where product_id = any(coalesce(p_liked_ids, '{}'::uuid[]))
      and embedding is not null
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
      pa.embedding,
      pa.occasions,
      to_jsonb(pa) - 'embedding' as attrs,
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
                (select max(1 - (b.embedding <=> l.embedding)) from liked l where b.embedding is not null),
                0)
      )::real as score
    from basis b
    cross join totaal_conf t
  ),
  gerangschikt as (
    select *,
           row_number() over (partition by category order by score desc, product_id) as rn
    from gescoord
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
$$;

grant execute on function get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int, text) to anon, authenticated;
