-- Gedragstest van de triggers rond keten_kandidaat_product (migratie
-- 20261002120000). Wijzigt echte rijen in products en product_attributes en
-- controleert na elke wijziging de kopie. Alles staat in één transactie die
-- altijd terugdraait; een mislukte assert breekt hem eerder af.
--
-- Draaien via kandidaatProduct.live.test.ts, of los:
--   supabase db query --linked -f scripts/keten/__tests__/kandidaat-product-triggers.sql

begin;

-- De velden die afnemers van get_kandidaten uit product lezen; dezelfde lijst
-- als KANDIDAAT_PRODUCT_VELDEN in src/services/outfits/kandidaten.ts.
create temp table t_velden on commit drop as
select unnest(array[
  'id', 'name', 'brand', 'price', 'image_url', 'category', 'type', 'gender',
  'colors', 'sizes', 'tags', 'style', 'retailer', 'affiliate_url', 'product_url',
  'description', 'in_stock', 'rating', 'review_count'
]) as veld;

-- Wat de kopie voor een product hoort te bevatten: de products-rij als json,
-- zoals get_kandidaten hem voor deze migratie teruggaf, beperkt tot die velden.
create function pg_temp.verwacht(p_id uuid) returns jsonb
language sql stable as $$
  select jsonb_object_agg(e.key, e.value)
  from public.products p
  cross join lateral jsonb_each(to_jsonb(p.*)) e
  where p.id = p_id
    and e.key in (select veld from t_velden)
$$;

-- Tien kandidaten met een embedding, op volgorde, en een product dat alleen
-- nog een tag mist om kandidaat te zijn.
create temp table t_kand on commit drop as
select pa.product_id, row_number() over (order by pa.product_id) as nr
from public.product_attributes pa
where pa.product_id = pa.canonical_id
  and pa.is_fashion
  and pa.in_stock
  and pa.classifier_version is not null
  and pa.tagger_version is not null
  and pa.embedding is not null
order by pa.product_id
limit 10;

create temp table t_bijna on commit drop as
select pa.product_id
from public.product_attributes pa
where pa.product_id = pa.canonical_id
  and pa.is_fashion
  and pa.in_stock
  and pa.classifier_version is not null
  and pa.tagger_version is null
limit 1;

-- 0. Uitgangspunt: elke kandidaat heeft een kopie en er is geen kopie te veel.
do $$
declare
  r record;
begin
  assert (select count(*) from t_kand) = 10, 'minder dan tien kandidaten met een embedding';
  select * into r from public.keten_kandidaat_product_controle(0);
  assert r.ontbrekend = 0, format('ontbrekend: %s', r.ontbrekend);
  assert r.overbodig = 0, format('overbodig: %s', r.overbodig);
  assert not exists (
    select 1 from t_kand t
    where (select k.product from public.keten_kandidaat_product k where k.product_id = t.product_id)
          is distinct from pg_temp.verwacht(t.product_id)
  ), 'een kopie wijkt af van products';
end $$;

-- 1. De tagger maakt een product kandidaat: de kopie verschijnt.
do $$
declare
  v_id uuid := (select product_id from t_bijna);
begin
  assert v_id is not null, 'geen product gevonden dat alleen een tag mist';
  assert not exists (select 1 from public.keten_kandidaat_product where product_id = v_id), 'had al een kopie';
  update public.product_attributes set tagger_version = 'test-kopie' where product_id = v_id;
  assert (select product from public.keten_kandidaat_product where product_id = v_id) = pg_temp.verwacht(v_id),
    'geen of een afwijkende kopie na taggen';
end $$;

-- 2. Uit voorraad: de kopie verdwijnt.
do $$
declare
  v_id uuid := (select product_id from t_kand where nr = 1);
begin
  update public.product_attributes set in_stock = false where product_id = v_id;
  assert not exists (select 1 from public.keten_kandidaat_product where product_id = v_id), 'kopie bleef na in_stock = false';
end $$;

-- 3. Elk gekopieerd veld, los gewijzigd in products, komt in de kopie.
do $$
declare
  v_id uuid := (select product_id from t_kand where nr = 2);
  v_kol record;
  v_expr text;
begin
  for v_kol in
    select c.column_name, c.data_type
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'products'
      and c.column_name in (select veld from t_velden)
      and c.column_name <> 'id'
  loop
    v_expr := case v_kol.data_type
      when 'text' then format('coalesce(%I, '''') || ''~''', v_kol.column_name)
      when 'numeric' then format('coalesce(%I, 0) + 1', v_kol.column_name)
      when 'integer' then format('coalesce(%I, 0) + 1', v_kol.column_name)
      when 'boolean' then format('not coalesce(%I, false)', v_kol.column_name)
      when 'ARRAY' then format('coalesce(%I, ''{}'') || ''{test}''::text[]', v_kol.column_name)
    end;
    assert v_expr is not null, format('geen testwijziging voor type %s', v_kol.data_type);
    execute format('update public.products set %I = %s where id = $1', v_kol.column_name, v_expr) using v_id;
    assert (select product from public.keten_kandidaat_product where product_id = v_id) = pg_temp.verwacht(v_id),
      format('kopie volgt %s niet', v_kol.column_name);
  end loop;
end $$;

-- 4. Een prijswijziging bij een product zonder kopie maakt er geen.
do $$
declare
  v_id uuid := (
    select p.id from public.products p
    where not exists (select 1 from public.keten_kandidaat_product k where k.product_id = p.id)
    limit 1
  );
begin
  update public.products set price = coalesce(price, 0) + 1 where id = v_id;
  assert not exists (select 1 from public.keten_kandidaat_product where product_id = v_id), 'kopie voor een niet-kandidaat';
end $$;

-- 5. Wat de linkjob, de embeddingjob en een hertagging schrijven, herschrijft
--    de kopie niet: geen nieuwe rijversie.
do $$
declare
  v_id uuid := (select product_id from t_kand where nr = 3);
  v_voor xid := (select xmin from public.keten_kandidaat_product where product_id = v_id);
begin
  assert v_voor is not null, 'kandidaat zonder kopie';
  update public.products set link_status = 'broken', link_last_checked_at = now() where id = v_id;
  update public.products set name = name, price = price where id = v_id;
  update public.product_attributes set embedding = embedding, formality = formality where product_id = v_id;
  update public.product_attributes set tagger_version = 'test-hertag' where product_id = v_id;
  assert (select xmin from public.keten_kandidaat_product where product_id = v_id) = v_voor,
    'kopie herschreven terwijl er niets aan veranderde';
end $$;

-- 6. Dedupe: een product dat niet meer canoniek is, verdwijnt uit de kopie.
do $$
declare
  v_id uuid := (select product_id from t_kand where nr = 4);
  v_ander uuid := (select product_id from t_kand where nr = 5);
begin
  update public.product_attributes set canonical_id = v_ander where product_id = v_id;
  assert not exists (select 1 from public.keten_kandidaat_product where product_id = v_id), 'kopie bleef na dedupe';
end $$;

-- 7. Een verwijderd product (cascade naar product_attributes) verdwijnt uit de kopie.
do $$
declare
  v_id uuid := (select product_id from t_kand where nr = 6);
begin
  delete from public.products where id = v_id;
  assert not exists (select 1 from public.keten_kandidaat_product where product_id = v_id), 'kopie bleef na verwijderen product';
end $$;

-- 8. Attributen weg en terug: de kopie gaat mee.
do $$
declare
  v_id uuid := (select product_id from t_kand where nr = 7);
begin
  create temp table t_bewaar on commit drop as
  select * from public.product_attributes where product_id = v_id;
  delete from public.product_attributes where product_id = v_id;
  assert not exists (select 1 from public.keten_kandidaat_product where product_id = v_id), 'kopie bleef na verwijderen attributen';
  insert into public.product_attributes select * from t_bewaar;
  assert (select product from public.keten_kandidaat_product where product_id = v_id) = pg_temp.verwacht(v_id),
    'kopie kwam niet terug na opnieuw invoegen';
end $$;

-- 9. get_kandidaten geeft precies de gekopieerde velden, en valt terug op
--    products als een kopie onverhoopt ontbreekt.
do $$
declare
  v_id uuid;
  v_voor jsonb;
  v_na jsonb;
begin
  assert not exists (
    select 1
    from public.get_kandidaten('female', array['date'], 25, 100, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12) g
    where (select array_agg(k order by k) from jsonb_object_keys(g.product) k)
          <> (select array_agg(veld order by veld) from t_velden)
  ), 'get_kandidaten geeft andere productvelden';

  select g.product_id, g.product into v_id, v_voor
  from public.get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 40) g
  where g.product_id not in (select product_id from t_kand)
  limit 1;
  assert v_id is not null, 'get_kandidaten gaf niets terug';
  assert v_voor = pg_temp.verwacht(v_id), 'get_kandidaten gaf een afwijkend product';

  delete from public.keten_kandidaat_product where product_id = v_id;
  select g.product into v_na
  from public.get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 40) g
  where g.product_id = v_id;
  assert v_na is not null, 'zonder kopie viel de kandidaat weg';
  assert v_na = v_voor, 'de terugval gaf een ander product';
end $$;

select 'KANDIDAAT_PRODUCT_TRIGGERS_OK' as uitkomst;

rollback;
