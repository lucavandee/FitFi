/*
  # RPC get_kandidaten herschreven: filter en rangschikking op product_attributes

  ## Probleem
  De vorige versie (20260914120100) filterde price en in_stock via een join
  naar products, per kandidaatrij, vóór het bepalen van de topN per
  categorie. EXPLAIN (ANALYZE, BUFFERS) liet zien dat de planner de
  index-scan op product_attributes onderschat (526 geschat, 39.046
  werkelijk, male/work/50-150) en vervolgens voor elk van die ~39.000 rijen
  een los index-lookup op products deed om price/in_stock te toetsen: 56,5
  van de 56,5 seconden uitvoertijd zat in die ~39.000 losse heap-fetches op
  de grootste tabel in de database. Via de PostgREST-rol (8s
  statement-timeout) faalde de RPC daardoor met 57014 (geverifieerd met
  curl op de anon-route): het hart van dit plan werkte niet via de route die
  de app gebruikt.

  De vorige migratie (20260914120400) zette price, in_stock en retailer op
  product_attributes en een partiële index (gender, category, price) die
  precies dit filter bedient. Deze migratie trekt de conclusie door: het
  filteren, uitsluiten en rangschikken gebeurt nu volledig op
  product_attributes (klein, met de juiste index); products wordt pas
  geraakt ná de topN-afkap, alleen voor de rijen die daadwerkelijk worden
  teruggegeven (maximaal 6 × p_per_category rijen, niet de hele kandidatenpool).

  ## EXPLAIN ANALYZE voor en na (male, work, 50-150, per_category 12)
  Voor (20260914120100, join per kandidaatrij naar products):
    Nested Loop (... rows=115) (actual rows=11810 loops=1)
      -> Index Scan idx_product_attributes_canoniek_fashion (rows=526) (actual rows=39046)
      -> Index Scan products_pkey (rows=1 per loop) (actual loops=39046, 1.246ms/loop)
    Execution Time: 56501.334 ms

  Na (deze migratie, filter op product_attributes, join naar products pas na de afkap):
    zie taak-3-report.md voor de letterlijke EXPLAIN ANALYZE-uitvoer die na
    het toepassen van deze migratie is gedraaid; de nested loop naar
    products doet daar nog maximaal 6 × p_per_category iteraties (~72 bij de
    default), niet meer 39.000.

  ## Wat deze functie doet
  Ongewijzigd contract: per categorie (top, bottom, footwear, outerwear,
  dress, accessory) de beste p_per_category kandidaten, canoniek,
  draagbaar, op voorraad, binnen budget, passend bij gender. Score blijft 0,
  volgorde blijft deterministisch op prijsafstand tot het midden van het
  budget, dan product_id. p_axes, p_occasions en p_liked_ids blijven
  aangenomen maar ongebruikt. `product` blijft de volledige products-rij
  als jsonb (to_jsonb(p.*)): plan 1 taak 6 en plan 3 lezen daar velden als
  colors, sizes en description uit.

  Enige gedragswijziging: price en in_stock komen nu uit product_attributes
  in plaats van rechtstreeks uit products. Die twee kolommen worden bij
  elke run van vul_product_attributes ververst (20260914120400), dus ze
  lopen alleen tijdelijk uit de pas met products tussen twee feed-imports
  in, nooit blijvend.

  ## Beveiliging
  Ongewijzigd: security invoker, uitvoerbaar voor anon en authenticated.

  ## Terugdraaien
  Let op de volgorde (fixronde 1, punt 6): deze functie wordt na deze
  migratie nog twee keer vervangen (20260914120700, 20260914120800) en
  verwijst naar price/in_stock, kolommen die pas in 20260914120400 zijn
  toegevoegd. Draai eerst 20260914120800 en 20260914120700 terug, dan pas
  deze migratie, en draai 20260914120400 pas terug NA deze migratie --
  anders verwijst get_kandidaten naar een net gedropte kolom.

  Vorige versie opnieuw toepassen: supabase db query --linked -f
  supabase/migrations/20260914120100_get_kandidaten.sql
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
        order by abs(pa.price - ((p_budget_min + p_budget_max) / 2.0)) asc, pa.product_id asc
      ) as rn
    from product_attributes pa
    where pa.product_id = pa.canonical_id
      and pa.is_fashion
      and pa.in_stock
      and pa.category is not null
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
