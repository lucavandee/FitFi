-- Gedragstest voor de feed-sync RPC's (migratie 20261008160000). Draait volledig in
-- een transactie die teruggedraaid wordt: er blijft niets achter, ook niet bij een
-- fout. Eindigt in FEED_SYNC_OK of faalt met de naam van de mislukte stap.
--
-- Wat hier bewezen wordt:
--   1. herverkiezing: valt de canonieke maat weg terwijl een andere maat blijft, dan
--      neemt de goedkoopste in-stock maat de tags over, de kopie volgt via de triggers,
--      en een tweede run verandert niets;
--   2. een groep waarvan alles weg is blijft staan en valt uit de pool;
--   3. bij gelijke prijs wint de laagste id;
--   4. keten_feed_pas_toe herkoppelt een rij (nieuw external_id) en spiegelt naar
--      product_attributes;
--   5. keten_feed_voeg_toe slaat een dubbele sku of dubbel external_id stilletjes over;
--   6. de functies zijn alleen voor de service role.
begin;

do $test$
declare
  r constant text := 'Testwinkel feedsync';
  a constant uuid := '00000000-0000-0000-0000-0000000000a1';
  b constant uuid := '00000000-0000-0000-0000-0000000000b2';
  c constant uuid := '00000000-0000-0000-0000-0000000000c3';
  d constant uuid := '00000000-0000-0000-0000-0000000000d4';
  e constant uuid := '00000000-0000-0000-0000-000000000e01';
  f constant uuid := '00000000-0000-0000-0000-000000000e06';
  g constant uuid := '00000000-0000-0000-0000-000000000e05';
  n bigint;
begin
  -- Opzet. Groep 1: a (canoniek, getagd, 30), b (25), c (35), allemaal dezelfde foto.
  -- Groep 2: d alleen. Groep 3: e (canoniek) met f en g op dezelfde prijs.
  insert into public.products (id, external_id, name, retailer, price, in_stock, image_url, category, gender, affiliate_url, sizes) values
    (a, 'fs-a', 'Shirt A', r, 30, true, 'https://img/1.jpg', 'top', 'female', 'https://x/a', array['S']),
    (b, 'fs-b', 'Shirt B', r, 25, true, 'https://img/1.jpg', 'top', 'female', 'https://x/b', array['M']),
    (c, 'fs-c', 'Shirt C', r, 35, true, 'https://img/1.jpg', 'top', 'female', 'https://x/c', array['L']),
    (d, 'fs-d', 'Broek D', r, 60, true, 'https://img/2.jpg', 'bottom', 'male', 'https://x/d', array['32']),
    (e, 'fs-e', 'Jas E',   r, 80, true, 'https://img/3.jpg', 'outerwear', 'male', 'https://x/e', array['M']),
    (f, 'fs-f', 'Jas F',   r, 20, true, 'https://img/3.jpg', 'outerwear', 'male', 'https://x/f', array['L']),
    (g, 'fs-g', 'Jas G',   r, 20, true, 'https://img/3.jpg', 'outerwear', 'male', 'https://x/g', array['XL']);

  insert into public.product_attributes
    (product_id, canonical_id, is_fashion, category, gender, price_band, classifier_version, tagged_at, price, in_stock, retailer,
     formality, occasions, colors, tagger_version, confidence)
  values
    (a, a, true, 'top', 'female', 'tot50', 'v1', now(), 30, true, r, 4, array['work', 'casual'], array['wit'], 'tg1', 0.9),
    (b, a, true, 'top', 'female', 'tot50', null, null, 25, true, r, null, '{}', '{}', null, null),
    (c, a, true, 'top', 'female', 'tot50', null, null, 35, true, r, null, '{}', '{}', null, null),
    (d, d, true, 'bottom', 'male', '50tot100', 'v1', now(), 60, true, r, 2, array['work'], array['zwart'], 'tg1', 0.8),
    (e, e, true, 'outerwear', 'male', '50tot100', 'v1', now(), 80, true, r, 3, array['casual'], array['grijs'], 'tg1', 0.7),
    (f, e, true, 'outerwear', 'male', 'tot50', null, null, 20, true, r, null, '{}', '{}', null, null),
    (g, e, true, 'outerwear', 'male', 'tot50', null, null, 20, true, r, null, '{}', '{}', null, null);

  assert (select count(*) from public.keten_kandidaat_product where product_id in (a, d, e)) = 3, 'opzet: a, d en e zijn kandidaat';
  assert (select count(*) from public.keten_kandidaat_product where product_id in (b, c, f, g)) = 0, 'opzet: b, c, f en g zijn geen kandidaat';

  -- 1. Zolang de canonieke rij op voorraad is, doet herverkiezing niets.
  n := public.keten_herkies_canoniek(r);
  assert n = 0, 'niets te wisselen zolang alle canonieke rijen op voorraad zijn';

  -- De canonieke maat van groep 1 verdwijnt uit de feed.
  n := public.keten_feed_voorraad(array[a], false);
  assert n = 1, 'voorraad: een rij gewijzigd';
  assert (select in_stock from public.products where id = a) = false, 'voorraad: products bijgewerkt';
  assert (select in_stock from public.product_attributes where product_id = a) = false, 'voorraad: product_attributes bijgewerkt';
  assert (select count(*) from public.keten_kandidaat_product where product_id = a) = 0, 'uit voorraad is geen kandidaat meer';
  assert public.keten_feed_voorraad(array[a], false) = 0, 'voorraad: opnieuw zetten verandert niets';

  n := public.keten_herkies_canoniek(r);
  assert n = 1, 'groep 1 is gewisseld';
  assert (select canonical_id from public.product_attributes where product_id = b) = b, 'b is de goedkoopste in-stock maat en dus canoniek';
  assert (select count(distinct canonical_id) from public.product_attributes where product_id in (a, b, c)) = 1, 'de hele groep wijst naar dezelfde canonieke rij';
  assert (select canonical_id from public.product_attributes where product_id = c) = b, 'c wijst naar b';
  assert (select canonical_id from public.product_attributes where product_id = a) = b, 'a wijst naar b';
  assert exists (
    select 1 from public.product_attributes
    where product_id = b and classifier_version = 'v1' and tagger_version = 'tg1' and formality = 4
      and occasions = array['work', 'casual'] and colors = array['wit'] and confidence = 0.9::real and category = 'top'
      and in_stock and price = 25 and price_band = 'tot50'
  ), 'b heeft de tags van a overgenomen en zijn eigen prijs en voorraad';
  assert (select count(*) from public.keten_kandidaat_product where product_id = b) = 1, 'b staat in de kandidaatkopie';
  assert (select count(*) from public.keten_kandidaat_product where product_id in (a, c)) = 0, 'a en c staan er niet in';
  assert (select (product ->> 'price')::numeric from public.keten_kandidaat_product where product_id = b) = 25, 'de kopie toont de prijs van b';
  assert (select count(*) from public.keten_canoniek_wissels where retailer = r and oud = a and nieuw = b) = 1, 'de wissel staat in het logboek';

  n := public.keten_herkies_canoniek(r);
  assert n = 0, 'een tweede run verandert niets';

  -- 2. Een groep waarvan elke maat weg is blijft zoals ze is en valt uit de pool.
  assert public.keten_feed_voorraad(array[d], false) = 1, 'd uit voorraad';
  n := public.keten_herkies_canoniek(r);
  assert n = 0, 'niemand om over te nemen: geen wissel';
  assert (select canonical_id from public.product_attributes where product_id = d) = d, 'd blijft canoniek';
  assert (select count(*) from public.keten_kandidaat_product where product_id = d) = 0, 'd valt uit de pool';

  -- 3. Gelijke prijs: de laagste id wint (g = ...0e05 tegen f = ...0e06).
  assert public.keten_feed_voorraad(array[e], false) = 1, 'e uit voorraad';
  n := public.keten_herkies_canoniek(r);
  assert n = 1, 'groep 3 is gewisseld';
  assert (select canonical_id from public.product_attributes where product_id = f) = g, 'bij gelijke prijs wint de laagste id';

  -- 4. Een rij herkoppelen: nieuw external_id, nieuwe prijs, nieuwe link, nieuw beeld.
  n := public.keten_feed_pas_toe(jsonb_build_array(jsonb_build_object(
    'id', a, 'external_id', 'fs-a-nieuw', 'price', 28.5, 'original_price', null, 'in_stock', true,
    'affiliate_url', 'https://nieuw/a', 'image_url', 'https://img/1-nieuw.jpg', 'images', jsonb_build_array('https://img/1-nieuw.jpg')
  )));
  assert n = 1, 'pas_toe: een rij bijgewerkt';
  assert exists (
    select 1 from public.products
    where id = a and external_id = 'fs-a-nieuw' and price = 28.5 and original_price is null and in_stock
      and affiliate_url = 'https://nieuw/a' and affiliate_link = 'https://nieuw/a' and product_url = 'https://nieuw/a'
      and image_url = 'https://img/1-nieuw.jpg' and images = array['https://img/1-nieuw.jpg'] and updated_at = now()
  ), 'pas_toe: products heeft de nieuwe waarden';
  assert exists (
    select 1 from public.product_attributes
    where product_id = a and price = 28.5 and price_band = 'tot50' and in_stock and image_url = 'https://img/1-nieuw.jpg'
  ), 'pas_toe: product_attributes is gespiegeld';
  assert (select canonical_id from public.product_attributes where product_id = a) = b, 'a komt terug op voorraad maar b blijft canoniek';
  assert public.keten_herkies_canoniek(r) = 0, 'een teruggekeerde maat veroorzaakt geen wissel';

  -- 5. Nieuwe producten: een dubbele sku en een dubbel external_id worden overgeslagen.
  n := public.keten_feed_voeg_toe(jsonb_build_array(
    jsonb_build_object('external_id', 'fs-n1', 'name', 'Nieuw 1', 'brand', 'x', 'price', 19.99, 'original_price', null,
      'image_url', 'https://img/9.jpg', 'images', jsonb_build_array('https://img/9.jpg'), 'retailer', r,
      'affiliate_url', 'https://x/n1', 'affiliate_link', 'https://x/n1', 'product_url', 'https://x/n1',
      'category', 'top', 'gender', 'female', 'style', 'casual', 'description', 'd', 'tags', jsonb_build_array('top'),
      'colors', jsonb_build_array('wit'), 'sizes', jsonb_build_array('M'), 'sku', 'FS-SKU-1', 'in_stock', true),
    jsonb_build_object('external_id', 'fs-n2', 'name', 'Nieuw 2 met dezelfde sku', 'retailer', r, 'sku', 'FS-SKU-1',
      'affiliate_url', 'https://x/n2', 'in_stock', true),
    jsonb_build_object('external_id', 'fs-n1', 'name', 'Nieuw 1 nog eens', 'retailer', r, 'sku', 'FS-SKU-2',
      'affiliate_url', 'https://x/n1b', 'in_stock', true)
  ));
  assert n = 1, 'voeg_toe: alleen de eerste is nieuw';
  assert exists (
    select 1 from public.products
    where external_id = 'fs-n1' and source = 'daisycon' and name = 'Nieuw 1' and price = 19.99 and sizes = array['M'] and not is_kids
  ), 'voeg_toe: de rij staat er met de juiste velden';

  -- 6. Rechten: alleen de service role.
  assert not has_function_privilege('anon', 'public.keten_feed_pas_toe(jsonb)', 'execute'), 'anon mag pas_toe niet';
  assert not has_function_privilege('authenticated', 'public.keten_feed_pas_toe(jsonb)', 'execute'), 'authenticated mag pas_toe niet';
  assert not has_function_privilege('anon', 'public.keten_feed_voeg_toe(jsonb)', 'execute'), 'anon mag voeg_toe niet';
  assert not has_function_privilege('anon', 'public.keten_feed_voorraad(uuid[], boolean)', 'execute'), 'anon mag voorraad niet';
  assert not has_function_privilege('anon', 'public.keten_herkies_canoniek(text)', 'execute'), 'anon mag herkies niet';
  assert not has_function_privilege('authenticated', 'public.keten_herkies_canoniek(text)', 'execute'), 'authenticated mag herkies niet';
  assert has_function_privilege('service_role', 'public.keten_herkies_canoniek(text)', 'execute'), 'service_role mag herkies wel';
  assert has_function_privilege('service_role', 'public.keten_feed_pas_toe(jsonb)', 'execute'), 'service_role mag pas_toe wel';

  -- Prijsband: dezelfde grenzen als get_kandidaten.
  assert public.keten_prijsband(49.99) = 'tot50' and public.keten_prijsband(50) = '50tot100'
     and public.keten_prijsband(99.99) = '50tot100' and public.keten_prijsband(100) = '100tot200'
     and public.keten_prijsband(199.99) = '100tot200' and public.keten_prijsband(200) = 'boven200', 'prijsbanden';

  -- Een onbekende retailer geeft een duidelijke fout in plaats van stilte.
  begin
    perform public.keten_herkies_canoniek('Bestaat niet bij feedsync');
    raise exception 'verwachtte een fout bij een onbekende retailer';
  exception when sqlstate 'P0002' then
    null;
  end;
end
$test$;

select 'FEED_SYNC_OK' as uitslag;

rollback;
