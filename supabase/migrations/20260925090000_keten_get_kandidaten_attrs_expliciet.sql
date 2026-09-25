/*
  # get_kandidaten: attrs met een expliciete kolommenlijst, geen to_jsonb(pa)

  ## Probleem, gemeten
  20260916100200 bouwde attrs als to_jsonb(pa) - 'embedding': de volledige
  product_attributes-rij naar jsonb, inclusief de extensions.vector(512)
  embedding-kolom, waarna embedding er weer uit werd gehaald. Dat gebeurt in
  de basis-CTE, dus vóór de afkap op p_per_category, voor elke kandidaatrij
  die aan de filters voldoet -- niet alleen voor de rijen die worden
  teruggegeven.

  Zolang alle embeddings null waren (de staat waarin taak 7 dit schreef en
  mat) kostte dat niets: to_jsonb van een null-kolom is triviaal. Sinds taak 6
  (FashionCLIP-embeddings) hebben 6.198 van de 16.023 kandidaten een echte
  vector van 512 floats. Elke serialisatie zet die vector om naar een
  tekstrepresentatie van honderden tekens, ook al gooit "- 'embedding'"
  het resultaat meteen weer weg. Dit was voorzien en genoemd als zorg in
  taak-7-report.md, en is nu precies zo gebeurd.

  Gemeten met EXPLAIN (ANALYZE, BUFFERS) op de live (kapotte) functie, vóór
  deze migratie, male/work+casual/20-150/H&M (dezelfde aanroep als taak 7):
    Execution Time: 8241.056 ms  (rows=62, shared hit=37025 read=66 dirtied=84,
                                   temp read=382 written=383 -- de temp-buffers
                                   zijn nieuw: sorteren/materialiseren van
                                   kilobytes aan vector-tekst per rij)
  Krap budget (45-55, 10 euro breed, minder kandidaatrijen dus minder
  embeddings om te serialiseren):
    Execution Time: 1909.362 ms  (rows=54, shared hit=5319 read=84, geen temp)
  Via de anon-route (curl, dezelfde aanroep als hierboven): HTTP 500,
  {"code":"57014","message":"canceling statement due to statement timeout"},
  consistent over twee opeenvolgende aanroepen. Dit is de rode poort uit het
  taak-7-report: "get_kandidaten faalde: canceling statement due to statement
  timeout" bij npm run keten:personas.

  ## Fix
  attrs wordt gebouwd met een expliciete jsonb_build_object, niet met
  to_jsonb(pa). Dat is geen stijlkeuze: to_jsonb(pa) serialiseert altijd de
  hele rij, dus ELKE toekomstige kolom op product_attributes (ook een
  volgende vector- of grote-tekst-kolom) komt er automatisch in te staan en
  moet er dan weer met "- 'kolomnaam'" uit gehaald worden, per kolom, met
  dezelfde serialiseer-dan-weggooien-kost. jsonb_build_object raakt alleen de
  kolommen die er expliciet in staan: de embedding-kolom wordt nooit
  aangeraakt, nooit geserialiseerd, in plaats van geserialiseerd-en-weggegooid.
  Vervang deze vorm dus niet terug naar to_jsonb(pa) omdat het korter oogt --
  dat zet precies dit lek weer open.

  ## Welke velden, en waarom precies deze
  Nagegaan wie attrs leest, niet aangenomen:
  - classifier_version: verplicht. src/services/outfits/__tests__/
    getKandidaten.live.test.ts toetst `rij.attrs.classifier_version`
    toBeTruthy(), en plan 1 taak 3 documenteerde expliciet "attrs bevat ook
    classifier_version, zodat de client kan zien of een rij door de
    classifier is gegaan."
  - category: plan 1 taak 3 documenteerde "category en attrs.category zijn
    de categorie uit product_attributes, niet products.category" als
    contract, ook al leest geen huidige test attrs.category apart (de
    top-level category-kolom wordt daarvoor gebruikt). Blijft erin omdat het
    een vastgelegd contract is, niet een aanname.
  - formality, occasions, silhouette, color_temp, lightness, pattern,
    shoe_type, colors, materials, seasons: de tag-attributen uit spec 5.1,
    het hele doel van plan 2. Spec 5.4 (compose-outfits, plan 3, nog niet
    gebouwd) voedt het stylist-model met "de kandidaten met hun attributen en
    prijs" -- dit zijn de attributen waar dat op doelt. Prijs zelf staat al
    in het aparte "product"-object (products.price via to_jsonb(p.*)), dus
    niet nogmaals in attrs.

  Bewust NIET meegenomen, met reden:
  - product_id, canonical_id: product_id staat al als eigen top-level kolom
    in de return; canonical_id is interne dedupe-boekhouding en in deze query
    altijd gelijk aan product_id (basis filtert op pa.product_id =
    pa.canonical_id). Geen consument gevonden.
  - price, in_stock, retailer: staan al op het "product"-object
    (to_jsonb(p.*), products-tabel heeft dezelfde drie kolommen). Nogmaals in
    attrs zetten dupliceert zonder dat iemand het uit attrs leest.
  - gender: idem, staat op "product" (products.gender); geen consument las
    attrs.gender.
  - price_band: geen consument gevonden; compose-outfits (5.4) noemt "prijs"
    apart, niet price_band.
  - confidence, tagger_version, tagged_at: interne tag-boekhouding van de
    tagpijplijn (batch-hervatlogica, foto-ronde-selectie in
    keten_tag_kandidaten), niet gelezen door get_kandidaten se consumenten.
    tagger_version is not null is al een harde voorwaarde in de basis-CTE
    (alleen getagde rijen komen door het filter), dus een client kan dat niet
    eens gebruiken om te onderscheiden -- anders dan classifier_version, dat
    wel expliciet als client-signaal is gedocumenteerd.
  - embedding: het hele punt van deze migratie. Nooit in attrs.

  ## Schaalt dit mee met meer gevulde embeddings?
  Ja, expliciet geverifieerd door de redenering, niet aangenomen: de kost
  van de oude vorm zat in het aantal RIJEN met een gevulde embedding die de
  basis-CTE moest aanraken vóór de afkap (attrs wordt per kandidaatrij
  gebouwd, niet per teruggegeven rij). Bij 6.198 gevulde embeddings op 16.023
  kandidaten kost dat al de statement-timeout. Bij 16.023 (alle huidige
  kandidaten getagd én ge-embed) of later 100.849 (alle canonieke
  fashion-producten) was de oude vorm evenredig duurder geworden: meer
  gevulde embeddings per aanroep, meer serialisatie, geen enkele kolom in de
  WHERE-clausule begrenst dat vóór de afkap. De nieuwe vorm raakt de
  embedding-kolom nooit, ongeacht hoeveel rijen een vector hebben: de kost
  van jsonb_build_object hangt af van de negen tekst/smallint/array-velden
  die wél worden opgenomen, niet van of embedding gevuld is. Dat schaalt dus
  wel met het totaal aantal kandidaatrijen vóór de afkap (zoals de rest van
  de query al doet, en zoals de partiële index idx_product_attributes_
  kandidaten al voor is ontworpen), maar niet met het aantal gevulde
  embeddings. Zie taak-7-report.md, fixsectie, voor de metingen ná deze
  migratie op dezelfde aanroepen.

  ## Het andere jsonb-veld: product
  "product" (to_jsonb(p.*)) wordt pas gebouwd ná "where rn <= plafond", dus
  voor maximaal 6 x plafond rijen, niet voor elke kandidaatrij -- dat patroon
  was al goed. Bovendien: products heeft geen embedding-kolom (geverifieerd
  met information_schema.columns, 25 september 2026: id, name, image_url,
  description, affiliate_url, gender, type, brand, tags, sizes, created_at,
  price, original_price, product_url, retailer, category, colors, in_stock,
  rating, review_count, updated_at, sku, original_category, style, source,
  external_id, affiliate_link, images, campaign_id, link_status,
  link_last_checked_at, is_kids -- geen vector-kolom). to_jsonb(p.*) heeft
  dus niets te serialiseren-en-weggooien en blijft ongewijzigd.

  ## Randvoorwaarden die intact blijven
  Signatuur exact gelijk (negen parameters, p_retailer als negende met
  default null); geen drop function nodig, create or replace volstaat omdat
  de parameter- en kolomtypes niet wijzigen. security invoker blijft.
  least(60, greatest(1, coalesce(p_per_category, 12))) blijft staan: dat
  plafond is een dichtgezette kwetsbaarheid tegen een anonieme aanroeper met
  een torenhoge p_per_category, en hoort hier niet aan te komen.

  ## Terugdraaien
  Zet de functie uit 20260916100200 terug (let op: dat zet ook de
  to_jsonb(pa) - 'embedding'-regressie terug zodra embeddings gevuld zijn,
  dus alleen doen als deze migratie zelf een probleem geeft, niet als
  "even terug naar de oude vorm"):
  supabase db query --linked -f supabase/migrations/20260916100200_keten_get_kandidaten_score.sql
*/

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
