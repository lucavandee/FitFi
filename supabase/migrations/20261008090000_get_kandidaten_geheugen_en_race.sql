/*
  # get_kandidaten: sortering in het geheugen, zichtbaarheidskaart bijhouden,
  # en geen verouderde kopie door een gelijktijdige wijziging

  Drie correcties na metingen op 8 oktober 2026, zes dagen na
  20261002120000_keten_kandidaat_product.sql.

  ## 1. work_mem voor get_kandidaten
  De instantie heeft 2 MB work_mem en een schijf van ongeveer 11 tot 15 MB/s.
  Een vrouw met casual en werk tot 150 euro geeft 21.459 basisrijen. De functie
  sorteert die (vensterfunctie per categorie) en dat is 7 MB: met 2 MB liep de
  sortering over naar schijf (755 geschreven blokken). Dezelfde query, dezelfde
  warme cache:
    work_mem 2 MB   646 ms   (external merge, 6 MB op schijf)
    work_mem 16 MB  115 ms   (quicksort, 7 MB in het geheugen)
  Op een koude cache komt het schrijven en terugleggen van de tijdelijke
  bestanden bovenop de leesacties. 16 MB is een bovengrens per sorteerstap, geen
  toewijzing: de gangbare profielen gebruiken 3 tot 7 MB. Een profiel dat de
  hele kandidatenset ophaalt (alle sekses, geen budgetgrens: 76.000 rijen,
  ongeveer 25 MB) loopt nog steeds over naar schijf, en blijft dus correct maar
  trager. De test kandidaat-snelheid.sql bewaakt de gangbare profielen: een
  latere migratie die get_kandidaten opnieuw aanmaakt zonder work_mem zet dit
  stil terug.

  ## 2. Zichtbaarheidskaart bijhouden
  De selectie is een index-only scan, maar alleen op pagina's die als zichtbaar
  zijn gemarkeerd. Voor de andere leest Postgres de tabelrij ("heap fetch"), bij
  een koude cache een willekeurige leesactie van schijf. Op 8 oktober gaf de
  standaardquery 1.378 heap fetches: de embeddingjob had na de laatste
  autovacuum (4 oktober 22:40) nog ruim 400 rijen bijgewerkt, onder de drempel
  van 2.870 dode rijen die 1 procent van de tabel geeft. Na een handmatige
  VACUUM: 0 heap fetches. Met scale_factor 0,001 en drempel 100 start een
  autovacuum bij ongeveer 380 dode rijen. Een vacuum slaat pagina's over die al
  zichtbaar zijn en laat de indexen met rust bij weinig dode rijen, dus dit is
  goedkoop.

  ## 3. De kopie kan niet blijvend verouderen
  Een onafhankelijke review van 20261002120000 vond een race. De trigger op
  product_attributes leest products en schrijft de kopie; de trigger op products
  werkt een bestaande kopie bij. Commit een wijziging van products tussen het
  lezen en het schrijven van de eerste trigger, dan vindt de tweede nog geen
  kopierij om bij te werken, en de eerste schrijft daarna de oude waarde. De
  kopie blijft verouderd tot de volgende wijziging van dat product. Kans: klein
  (dezelfde rij, binnen een statement), maar het gevolg is een verkeerde prijs
  in de uitvoer van get_kandidaten.
  De trigger op product_attributes leest de productrij nu met een deelslot
  (for share) tot het einde van zijn transactie. Een gelijktijdige wijziging van
  products wacht dan tot de kopie er staat, en haar eigen trigger werkt hem
  daarna bij. Een rijslot staat in de rijkop en kost geen plek in de gedeelde
  lock-tabel (een advisory lock per rij wel: een bulkwijziging van een paar
  duizend producten zou daar op stuklopen). De kans op een deadlock vraagt twee
  transacties die dezelfde producten in tegengestelde volgorde raken, bijvoorbeeld
  de feedimport en de tagger tegelijk; dat is geen ontwerp van het rooster
  (import zondag 03:00, taggen vanaf 05:00) en Postgres breekt er dan een af.

  ## Terugdraaien
    alter function get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int, text) reset work_mem;
    alter table product_attributes set (autovacuum_vacuum_scale_factor = 0.01);
    alter table product_attributes reset (autovacuum_vacuum_threshold, autovacuum_analyze_scale_factor);
  en de vorige triggerfunctie staat in 20261002120000_keten_kandidaat_product.sql.
*/

-- 1.
alter function public.get_kandidaten(text, text[], integer, integer, jsonb, uuid[], uuid[], integer, text)
  set work_mem = '16MB';

-- 2.
alter table public.product_attributes set (
  autovacuum_vacuum_scale_factor = 0.001,
  autovacuum_vacuum_threshold = 100,
  autovacuum_analyze_scale_factor = 0.01
);

-- 3.
create or replace function public.keten_kandidaat_product_bij_attributen()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product jsonb;
begin
  if tg_op in ('UPDATE', 'DELETE') then
    delete from public.keten_kandidaat_product where product_id = old.product_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    if public.keten_is_kandidaat(new) then
      -- for share: zie punt 3 hierboven.
      select public.keten_kandidaat_product_json(p)
        into v_product
      from public.products p
      where p.id = new.product_id
      for share;
      if found then
        insert into public.keten_kandidaat_product (product_id, product)
        values (new.product_id, v_product)
        on conflict (product_id) do update set product = excluded.product;
      end if;
    end if;
  end if;
  return null;
end;
$$;

revoke all on function public.keten_kandidaat_product_bij_attributen() from public, anon, authenticated;
