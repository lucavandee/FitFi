/*
  # Beoordelingen uit de kalibratiestap licht genoeg voor get_kandidaten

  Tot nu toe stuurde de app p_liked_ids en p_disliked_ids leeg mee. De oude
  term (0,2 op embedding-gelijkenis met gelikete producten) las voor elke
  kandidaat de embedding van schijf: een vector(512) die buiten de rij staat
  (TOAST, 206 MB). Met negen likes liep de functie 4 van 4 keer in de timeout
  van 8 s (15 oktober 2026). Daarbij mist in de actieve pool 55 tot 60 procent
  van de H&M-looks een embedding (6.486 van 11.755 dames, 1.862 van 3.131
  heren, 21 oktober), dus die term duwde de nieuwe collectie ook nog weg.

  ## Wat dit doet
  - Likes en afwijzingen vergelijken op attributen die voor elke poolrij
    bestaan en in de dekkende index staan: formaliteit over alle beoordeelde
    stukken, pasvorm, print, materiaal en schoentype binnen dezelfde
    categorie. Gelijkenis met likes telt op, met afwijzingen telt af
    (-1 tot 1, gewicht 0,2). Kleur bewust niet: met kleur waren na drie
    lichte likes 39 van de 40 tops licht.
  - De gelijkenis wordt per unieke kenmerkcombinatie berekend (711 bij 5.954
    kandidaten) en via een opzoekkaart als InitPlan toegepast. Onder RLS schat
    de planner de basis op 1 rij; elke join koos een geneste lus (timeout).
  - Per categorie om en om: de beste op score met beoordelingen, dan de beste
    op alleen de quiz. Zonder die verdeling werden na drie nette likes alle 40
    tops formaliteit 3, ook bij een bezoeker die casual koos.
  - Afgewezen stukken zelf vallen weg, zoals voorheen.

  ## Gemeten (21 oktober 2026, als anon, warm, nul schijflezingen)
  Zonder beoordelingen exact dezelfde rijen, scores en attributen als de
  vorige versie (heren 201 rijen, dames 240). Heren 0-250: 99 ms zonder,
  268 ms met 18 beoordeelde stukken. Dames 0-500: 227 ms zonder, 324 ms met
  15. Met likes wisselt per categorie ongeveer de helft van de 40; engine v2
  maakt dan 6 outfits met alle gelegenheden gedekt, 15 van 22 stukken anders.

  ## Terugdraaien
  De definitie uit 20261016120000_keten_designer_outlet_standaard_uit.sql
  opnieuw draaien. De app stuurt dan nog wel beoordelingen mee; dat werkt,
  maar is dan weer de trage embedding-term. Zet in dat geval ook
  naarKandidatenParams terug op lege lijsten.
*/

create or replace function public.get_kandidaten(
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
set work_mem = '16MB'
as $$
#variable_conflict use_column
declare
  v_standaard_uit text[];
  v_heeft_beoordelingen boolean;
begin
  perform keten_controleer_retailer(p_retailer);

  select coalesce(array_agg(r.retailer), '{}'::text[])
    into v_standaard_uit
    from keten_retailer_regels r
   where r.standaard_uit;

  v_heeft_beoordelingen := coalesce(cardinality(p_liked_ids), 0) > 0
                        or coalesce(cardinality(p_disliked_ids), 0) > 0;

  return query
  with beoordeeld as materialized (
    -- Alleen de attributen, nooit de embedding: die staat buiten de rij
    -- (TOAST) en kostte per kandidaat een losse schijflezing.
    (select 1 as teken, pl.category, pl.formality, pl.silhouette, pl.pattern,
            pl.materials, pl.shoe_type
       from product_attributes pl
      where pl.product_id = any(coalesce(p_liked_ids, '{}'::uuid[]))
      limit 50)
    union all
    (select -1, pd.category, pd.formality, pd.silhouette, pd.pattern,
            pd.materials, pd.shoe_type
       from product_attributes pd
      where pd.product_id = any(coalesce(p_disliked_ids, '{}'::uuid[]))
      limit 50)
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
      pa.formality,
      pa.silhouette,
      pa.pattern,
      pa.lightness,
      pa.color_temp,
      pa.colors,
      pa.materials,
      pa.shoe_type,
      pa.seasons,
      pa.classifier_version,
      -- Stukken met dezelfde kenmerken krijgen dezelfde gelijkenis met de
      -- beoordeelde stukken; die wordt per sleutel een keer uitgerekend.
      concat_ws('|', pa.category, coalesce(pa.formality::text, '-'),
                coalesce(pa.silhouette, '-'), coalesce(pa.pattern, '-'),
                coalesce(pa.materials::text, '-'), coalesce(pa.shoe_type, '-')) as kenmerk,
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
      -- Wie een winkel expliciet vraagt (feed-poort, --retailer), krijgt hem;
      -- anders doen de winkels die standaard uit staan niet mee.
      and (p_retailer is not null or pa.retailer is null or not (pa.retailer = any(v_standaard_uit)))
  ),
  kenmerken as (
    select distinct on (b.kenmerk)
           b.kenmerk, b.category, b.formality, b.silhouette, b.pattern, b.materials, b.shoe_type
    from basis b
    where v_heeft_beoordelingen
  ),
  gelijkenis as (
    select
      b.kenmerk,
      -- Beoordelingen uit de kalibratiestap, -1 tot 1: hoe dicht een kandidaat
      -- bij een geliket stuk ligt, min hoe dicht bij een afgewezen stuk.
      -- Formaliteit over alle beoordeelde stukken (een outfit is zo formeel
      -- als zijn stukken), pasvorm, print, materiaal en schoentype alleen
      -- binnen dezelfde categorie. Kleur bewust niet: gemeten gaf dat 39 van
      -- de 40 tops licht na drie lichte likes, de beige-val van 15 oktober
      -- opnieuw. Kleur geldt voor de outfit als geheel, en daar weegt de
      -- engine op.
      case when v_heeft_beoordelingen then
        (
            coalesce((select max(1 - least(abs(b.formality - l.formality), 2)::real / 2)
                        from beoordeeld l
                       where l.teken = 1 and l.formality is not null and b.formality is not null), 0)
          + 2 * coalesce((select max((
                              coalesce(b.silhouette = l.silhouette, false)::int
                            + coalesce(b.pattern = l.pattern, false)::int
                            + coalesce(b.materials && l.materials, false)::int
                            + case when b.category = 'footwear'
                                   then coalesce(b.shoe_type = l.shoe_type, false)::int
                                   else 0 end
                          )::real / case when b.category = 'footwear' then 4 else 3 end)
                            from beoordeeld l
                           where l.teken = 1 and l.category = b.category), 0)
          - coalesce((select max(1 - least(abs(b.formality - l.formality), 2)::real / 2)
                        from beoordeeld l
                       where l.teken = -1 and l.formality is not null and b.formality is not null), 0)
          - 2 * coalesce((select max((
                              coalesce(b.silhouette = l.silhouette, false)::int
                            + coalesce(b.pattern = l.pattern, false)::int
                            + coalesce(b.materials && l.materials, false)::int
                            + case when b.category = 'footwear'
                                   then coalesce(b.shoe_type = l.shoe_type, false)::int
                                   else 0 end
                          )::real / case when b.category = 'footwear' then 4 else 3 end)
                            from beoordeeld l
                           where l.teken = -1 and l.category = b.category), 0)
        )::real / 3
      else 0 end as like_deel
    from kenmerken b
  ),
  -- Een opzoekkaart in plaats van een join: onder RLS schat de planner de
  -- basis op 1 rij en koos hij een geneste lus die de gelijkenis voor elke
  -- kandidaat opnieuw uitrekende (gemeten: timeout van 8 s). Als losse
  -- subquery (InitPlan) wordt de kaart een keer gebouwd en per rij alleen
  -- aangewezen; via een cross join kopieerde elke rij hem opnieuw.
  kaart as materialized (
    select coalesce(jsonb_object_agg(gl.kenmerk, gl.like_deel), '{}'::jsonb) as per_kenmerk
    from gelijkenis gl
  ),
  gescoord as (
    select
      b.product_id,
      b.category,
      b.occasions, b.formality, b.silhouette, b.pattern, b.lightness, b.color_temp,
      b.colors, b.materials, b.shoe_type, b.seasons, b.classifier_version,
      (
        0.5 * case when t.som > 0 then b.as_som / t.som else 0 end
      + 0.3 * case
                when coalesce(cardinality(p_occasions), 0) > 0 then
                  (select count(*) from unnest(b.occasions) o where o = any(p_occasions))::real
                  / cardinality(p_occasions)
                else 0
              end
      )::real as quiz,
      coalesce(((select kt.per_kenmerk from kaart kt) ->> b.kenmerk)::real, 0)::real as like_deel
    from basis b
    cross join totaal_conf t
  ),
  met_score as (
    select gs.*,
           (gs.quiz + 0.2 * gs.like_deel)::real as score
    from gescoord gs
  ),
  dubbel_gerangschikt as (
    select gs.*,
           row_number() over (partition by gs.category order by gs.score desc, gs.product_id) as rn_score,
           row_number() over (partition by gs.category order by gs.quiz desc, gs.product_id) as rn_quiz
    from met_score gs
  ),
  gerangschikt as (
    -- Om en om: de beste op score (met likes), dan de beste op alleen de quiz,
    -- en zo verder; een stuk dat in beide hoog staat telt een keer. Likes
    -- verfijnen zo de helft van de plekken en nemen het nooit over: gemeten
    -- werden zonder deze verdeling alle 40 tops formaliteit 3 na drie nette
    -- likes, ook bij een bezoeker die casual koos. Zonder likes is score gelijk
    -- aan quiz, dus rn_score gelijk aan rn_quiz en de volgorde precies als
    -- voorheen.
    select dg.*,
           row_number() over (
             partition by dg.category
             order by least(2 * dg.rn_score - 1, 2 * dg.rn_quiz), dg.product_id
           ) as rn
    from dubbel_gerangschikt dg
    -- Wie in beide lijsten buiten de eerste n valt, komt nooit in de eerste n
    -- van de verdeling; zo blijft de laatste sortering klein.
    where dg.rn_score <= least(60, greatest(1, coalesce(p_per_category, 12)))
       or dg.rn_quiz <= least(60, greatest(1, coalesce(p_per_category, 12)))
  )
  select
    g.product_id,
    g.category,
    g.score,
    jsonb_build_object(
      'category', g.category,
      'classifier_version', g.classifier_version,
      'formality', g.formality,
      'occasions', g.occasions,
      'silhouette', g.silhouette,
      'color_temp', g.color_temp,
      'lightness', g.lightness,
      'pattern', g.pattern,
      'shoe_type', g.shoe_type,
      'colors', g.colors,
      'materials', g.materials,
      'seasons', g.seasons
    ) as attrs,
    x.product
  from gerangschikt g
  left join keten_kandidaat_product k on k.product_id = g.product_id
  cross join lateral (
    -- De kopie, of anders products zelf: een ontbrekende kopie maakt de
    -- aanroep trager, nooit armer. Valt ook products weg, dan valt de rij weg,
    -- zoals bij de inner join hiervoor.
    select coalesce(
      k.product,
      (select keten_kandidaat_product_json(p) from products p where p.id = g.product_id)
    ) as product
  ) x
  where g.rn <= least(60, greatest(1, coalesce(p_per_category, 12)))
    and x.product is not null
  order by g.category, g.score desc, g.product_id;
end;
$$;
