/*
  # RPC get_kandidaten (spec 5.3), versie zonder tags

  ## Wat deze functie doet
  Geeft per categorie (top, bottom, footwear, outerwear, dress, accessory)
  de beste p_per_category kandidaten terug uit product_attributes, alleen
  canonieke, draagbare, op voorraad zijnde producten binnen budget en
  passend bij het gender. De categorie is die van product_attributes (na
  de classifier uit taak 2), niet de ruwe uit products: het afkappen per
  categorie gebeurt dus op de gecorrigeerde emmer.

  In dit plan zijn er nog geen tags (formality, occasions, assen,
  embeddings). Daarom is score altijd 0 en is de volgorde deterministisch:
  eerst de afstand van de prijs tot het midden van het budget, dan
  product_id. p_occasions, p_axes en p_liked_ids worden aangenomen zodat de
  aanroepende code niet hoeft te veranderen als plan 2 de score invult.

  ## Beveiliging
  security invoker: de aanroeper leest products en product_attributes onder
  zijn eigen RLS (beide zijn leesbaar voor anon). Uitvoerbaar voor anon en
  authenticated.

  ## Terugdraaien
  drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int);
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
  with pool as (
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
      to_jsonb(p.*) as kandidaat_product,
      row_number() over (
        partition by pa.category
        order by abs(p.price - ((p_budget_min + p_budget_max) / 2.0)) asc, pa.product_id asc
      ) as rn
    from product_attributes pa
    join products p on p.id = pa.product_id
    where pa.product_id = pa.canonical_id
      and pa.is_fashion
      and pa.category is not null
      and p.in_stock
      and (p_gender = 'unisex' or pa.gender in (p_gender, 'unisex'))
      and p.price >= p_budget_min
      and p.price <= p_budget_max
      and not (pa.product_id = any (coalesce(p_disliked_ids, '{}'::uuid[])))
  )
  select
    pool.kandidaat_id,
    pool.kandidaat_categorie,
    pool.kandidaat_score,
    pool.kandidaat_attrs,
    pool.kandidaat_product
  from pool
  where pool.rn <= greatest(1, coalesce(p_per_category, 12))
  order by pool.kandidaat_categorie, pool.rn;
$$;

grant execute on function get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int)
  to anon, authenticated;
