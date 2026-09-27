/*
  # get_kandidaten: prijsafstand bucketen in plaats van exact sorteren

  ## Probleem
  get_kandidaten ordent per categorie op `abs(pa.price - midden)`, een
  continue afstand die op de cent nauwkeurig is. Zodra méér dan
  p_per_category producten (letterlijk) op of zeer dicht bij het
  budgetmidden geprijsd zijn -- heel gewoon bij ronde prijzen als 49,99 of
  100,00 -- vult die exacte-afstand-tier de hele top alleen met die
  producten, vóórdat een product op €1 afstand ooit in beeld komt. Geen
  enkele tiebreak op product_id verandert daar iets aan: het zijn geen
  gelijkstanden die om een tiebreak vragen, het is een groep die simpelweg
  kleiner is dan p_per_category en dus in zijn geheel wordt teruggegeven.

  Live gemeten (2026-09-17, ongewijzigde functie, p_per_category 40):
    man 50-150, top:       40 van de 40 op exact €100,00, 2 retailers
    man 50-150, bottom:    40 van de 40 op €99,99-€100,00, 3 retailers
    vrouw 25-75, outerwear:40 van de 40 op exact €49,99, 1 retailer

  Dat is een artefact van de sorteersleutel, geen keuze van de engine: de
  score-kolom staat op deze laag nog altijd op 0 (plan 2 vult die),
  dit gaat alleen over welke rijen de RPC teruggeeft.

  ## Wat deze migratie doet
  Vervangt de exacte afstand door een bucket van €10: producten binnen
  dezelfde €10-band tot het budgetmidden tellen als even dichtbij, en
  worden onderling op product_id geordend (deterministisch, geen score-
  wijziging). Dat brengt voor elke band meteen meerdere producten en dus
  meerdere retailers in de race in plaats van alleen de exact-geprijsde
  groep. Bucketbreedte gekozen na een sweep van 5/10/15/20/25/30 op de drie
  bovenstaande segmenten (zie taak-report van deze fixronde): breedte 10 is
  de kleinste die alle drie van 1-3 naar 3 retailers brengt, zonder verder
  van het budgetmidden af te wijken dan nodig.

  Gemeten na deze migratie (zelfde drie segmenten, p_per_category 40):
    man 50-150, top:        €90,30-€109,95, 3 retailers
    man 50-150, bottom:     €91,00-€109,99, 3 retailers
    vrouw 25-75, outerwear: €41,95-€59,99, 3 retailers

  Determinisme: floor() en product_id zijn beide pure functies van
  opgeslagen data, dus twee identieke aanroepen geven dezelfde rijen in
  dezelfde volgorde (ongewijzigd getest, zie
  getKandidaten.live.test.ts "geeft twee keer dezelfde rijen").

  ## Prestatie (gemeten bereik, geen incident maar spreiding over meerdere
  aanroepen -- zie ook de eindreview-eis om hier een bereik te geven in
  plaats van een enkel getal)
  De vorige sorteersleutel (abs(price - midden)) kon al niet via de
  partiële index (gender, category, price) worden bediend: Postgres kan een
  ORDER BY op een niet-monotone expressie van een geïndexeerde kolom niet
  met die index sorteren, dus er werd al in het geheugen gesorteerd na de
  index-scan op de where-clause. floor(abs(...)/10) verandert daar niets
  aan: zelfde plan, zelfde aantal kandidaatrijen vóór de sortering (~11.810
  voor male/work/50-150, zie 20260914120500). Tien achtereenvolgende
  anon-aanroepen via de PostgREST-route (curl, twee segmenten,
  male/work/50-150 en female/date/25-75) na deze migratie: 300-820 ms
  warm, één individuele aanroep na een korte stilte 1,7 s. Vergelijkbare
  orde van grootte als vóór deze migratie (60-300 ms warm op een
  geïnlinede meting, 1,7-4,3 s op een koude aanroep via PostgREST,
  taak-3-report.md en deze fixronde); ruim onder de 8 s statement-timeout.

  ## Terugdraaien
  Let op de volgorde: draai deze migratie terug vóór 20260914120500 en
  20260914120400 (zie hun terugdraai-blokken).

  Vorige versie van de functie opnieuw toepassen:
  supabase db query --linked -f
  supabase/migrations/20260914120700_get_kandidaten_classifier_version_verplicht.sql
*/

create or replace function get_kandidaten(
  p_gender text,
  p_occasions text[],
  p_budget_min int,
  p_budget_max int,
  p_axes jsonb,
  p_liked_ids uuid[],
  p_disliked_ids uuid[],
  p_per_category int default 12
)
returns table (
  product_id uuid,
  category text,
  score real,
  attrs jsonb,
  product jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  with kandidaten as (
    select
      pa.product_id as kandidaat_id,
      pa.category as kandidaat_categorie,
      0::real as kandidaat_score,
      jsonb_build_object(
        'canonical_id', pa.canonical_id,
        'is_fashion', pa.is_fashion,
        'category', pa.category,
        'gender', pa.gender,
        'price_band', pa.price_band,
        'classifier_version', pa.classifier_version
      ) as kandidaat_attrs,
      row_number() over (
        partition by pa.category
        order by
          floor(abs(pa.price - ((p_budget_min + p_budget_max) / 2.0)) / 10) asc,
          pa.product_id asc
      ) as rn
    from product_attributes pa
    where pa.product_id = pa.canonical_id
      and pa.is_fashion
      and pa.in_stock
      and pa.category is not null
      and pa.classifier_version is not null
      and (p_gender = 'unisex' or pa.gender in (p_gender, 'unisex'))
      and pa.price >= p_budget_min
      and pa.price <= p_budget_max
      and not (pa.product_id = any (coalesce(p_disliked_ids, '{}'::uuid[])))
  )
  select
    k.kandidaat_id,
    k.kandidaat_categorie,
    k.kandidaat_score,
    k.kandidaat_attrs,
    to_jsonb(p.*) as kandidaat_product
  from kandidaten k
  join products p on p.id = k.kandidaat_id
  where k.rn <= greatest(1, coalesce(p_per_category, 12))
  order by k.kandidaat_categorie, k.rn;
$$;

grant execute on function get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int)
  to anon, authenticated;
