/*
  # Keten plan 2: cron voor feed-import, vulling van nieuwe producten,
  # voorraad en linkcontrole

  ## Probleem
  De feed wordt alleen met de hand geimporteerd, nieuwe producten krijgen
  geen rij in product_attributes, verdwenen producten blijven "op voorraad"
  en links worden niet gecontroleerd. De vulfunctie uit plan 1
  (vul_product_attributes in 20260914120000) kan hier niet voor dienen: die
  overschrijft bij elke run is_fashion, category, gender en canonical_id en
  zou de LLM-tags en de embedding-dedupe terugdraaien.

  Diezelfde vulfunctie ververst sinds plan 1 taak 3 (migratie 20260914120400,
  controller-ruling) ook price, in_stock en retailer op product_attributes,
  nodig omdat get_kandidaten anders via products vastliep op de statement-
  timeout. Zonder vervanging zouden die drie kolommen na taak 5 permanent
  bevriezen op de stand van vlak voor taak 5, terwijl products.in_stock via
  de voorraadstap hieronder wel doorloopt: kandidaten zouden dan producten
  tonen die niet meer op voorraad zijn of een andere prijs hebben.

  ## Wat deze migratie doet
  - Schakelt pg_cron en pg_net in. pg_net maakt altijd zijn eigen schema
    "net" aan, ook met "with schema extensions"; net.http_post en
    net._http_response worden daarom hieronder schema-gekwalificeerd
    aangeroepen en staan niet in het search_path.
  - Index op products (link_last_checked_at asc nulls first). Zonder die index
    haalt de linkjob niets op; zie "De linkjob had een index nodig".
  - keten_cron_log: een regel per run van de keten-jobs (admins lezen).
  - keten_roep_edge(functie, body, query): POST naar een edge function met de
    service role. URL en sleutel komen uit de Vault (secrets keten_project_url
    en keten_service_key, buiten deze migratie aangemaakt met
    vault.create_secret, nooit in de repo).
    Zonder Authorization-header antwoordt de gateway 401 terwijl pg_cron
    "succes" meldt; het antwoord staat in net._http_response.
  - keten_wekelijkse_import(): roept import-daisycon-feed aan voor elke actieve
    campagne in affiliate_campaigns (feedUrl + campaignId, zelfde payload als
    de admin-pagina). Fire-and-forget via pg_net.
  - keten_vul_nieuwe_producten(p_retailer): geeft producten zonder rij in
    product_attributes een rij, met dezelfde heuristiek als plan 1 voor
    is_fashion, category, gender en price_band, en dedupe naar de bestaande
    canonieke rij van dezelfde fotogroep als die er is. Ververst daarnaast
    price, in_stock, retailer en price_band uit products, voor elke rij van
    de retailer, canoniek of niet: dat ververswerk deed tot en met plan 1
    taak 3 de vulfunctie uit plan 1 (migratie 20260914120400), en die functie
    draait in dit plan nooit meer (Globale randvoorwaarden). canonical_id
    staat niet in die ververs-stap; de dedupe verschuift alleen via taak 8
    (keten_dedupe_embedding) of een nieuwe classificeer/tag-ronde. Raakt
    bestaande tags en classificatie nooit aan.
  - keten_vul_na_import(): controleert eerst per actieve campagne of de laatste
    import (affiliate_campaigns.last_sync_log_id -> daisycon_imports) status
    'success' heeft en jonger dan twaalf uur is. Zo niet: log 'wacht' en stop.
    Anders: producten van die campagne die niet in de import zaten
    (updated_at ouder dan het begin van de import) op in_stock = false, dan
    keten_vul_nieuwe_producten(). Idempotent binnen een importronde.
  - Drie jobs (tijden in UTC):
      keten-feed-import-wekelijks  zondag 03:00        import van alle actieve feeds
      keten-vul-na-import          zondag 05:00-11:00  elk uur, tot hij 'klaar' logt
      keten-links-elke-10-min      elke 10 minuten     validate-product-links, 200 per keer
    unschedule vooraf maakt de migratie herhaalbaar. De twee zondagsjobs
    staan daarna bewust op active = false; zie "Twee jobs staan uit".

  ## De dedupe-sleutel is dezelfde als in vul_product_attributes
  Deze functie en vul_product_attributes (migratie 20260914120000, regel 143,
  en opnieuw in 20260914120400) groeperen op dezelfde sleutel:

      (retailer, coalesce(nullif(image_url, ''), 'naam:' || merk || ':' || naam))

  Dezelfde foto is dezelfde look in een andere maat of prijs; een andere kleur
  heeft een andere foto en blijft een eigen product (spec 5.1). Merk plus
  genormaliseerde naam is uitsluitend de terugval bij een lege image_url.
  Dat moet zo blijven, en het moet in beide functies dezelfde vorm houden:
  zou deze functie op (retailer, merk, genormaliseerde naam) dedupliceren,
  dan voegt elke wekelijkse import producten samen die geen duplicaat zijn.
  Gemeten op Giglio (INT): van 169.697 rijen houdt de naam-sleutel er 10.209
  over terwijl er 68.739 unieke foto's zijn, omdat Giglio namen schrijft als
  "Sneakers AUTRY Woman color White" en de naam zonder kleursuffix voor
  1.280 verschillende producten gelijk is. Een verkeerd samengevoegd nieuw
  product wordt niet-canoniek, krijgt daarom nooit een eigen embedding (taak 6
  embedt alleen canonieke rijen) en wordt dus ook nooit door
  keten_dedupe_embedding (taak 8) teruggevonden. Er is geen herstelpad.
  Wie een van de twee functies aanpast, past de andere mee aan; de
  contract-test in scripts/keten/__tests__/migraties.test.ts vergelijkt de
  drie kopieen van deze sleutel letterlijk met elkaar.

  ## Twee jobs staan uit (ruling controller, 27 september 2026)
  keten-feed-import-wekelijks en keten-vul-na-import worden wel gepland maar
  meteen op active = false gezet. Ze aanzetten is een bewuste beslissing, niet
  een vergeten stap:

      select cron.alter_job((select jobid from cron.job where jobname = 'keten-feed-import-wekelijks'), active := true);
      select cron.alter_job((select jobid from cron.job where jobname = 'keten-vul-na-import'), active := true);

  Let op: "update cron.job set active = ..." werkt hier niet. cron.job is
  eigendom van supabase_admin en de postgres-rol heeft er alleen select-recht
  op (gemeten met has_table_privilege: select true, update false). Een update
  geeft "42501: permission denied for table job" en laat, omdat de Management
  API het hele bestand in een transactie zet, de hele migratie terugdraaien.
  cron.alter_job is de ondersteunde weg in pg_cron 1.6.4.

  Twee voorwaarden gelden voor de importjob, en beide zijn nu niet vervuld:

  1. import-daisycon-feed moet gedeployd zijn in de versie van commit 923c9467
     (taak 11). Live staat versie 32 van 17 april, die de service-role-sleutel
     niet accepteert: een aanroep geeft vandaag 401. pg_cron meldt dan
     "succeeded" omdat de aanroep via pg_net vertrekt en niet op het antwoord
     wacht. Het echte antwoord staat in net._http_response en niemand kijkt
     daar ongevraagd. Die combinatie (cron groen, aanroep mislukt) is in dit
     project eerder voorgekomen en is de reden dat deze job niet stil mag
     aanstaan.
  2. De eerste echte import herschrijft tot 88.043 bestaande H&M-rijen op
     external_id: naam, prijs, foto-URL, categorie, voorraad en updated_at.
     Gemeten gevolgen op de stand van 27 september 2026:
     - De prijzen in products zijn van maart 2026. Verse feedprijzen
       verschuiven producten tussen prijsbanden, en de dekkingsmatrix van de
       feed-poort (taak 9) is gender x gelegenheid x prijsband: een cel kan
       leeglopen en de poort rood zetten.
     - Voorraad uit de feed vervangt de maart-waarden. De kandidatenpool is
       na taak 7 al 16.023 bruikbare rijen en man klassiek haalde precies
       6 outfits; er is weinig marge.
     - Een gewijzigde foto-URL maakt de dedupe-sleutel muf: canonical_id wordt
       hier bewust niet herberekend, dus zo'n product blijft in de oude
       fotogroep hangen tot iemand keten_dedupe_embedding opnieuw draait.
     - Nieuwe producten komen zonder classifier_version en zonder
       tagger_version binnen en zijn onzichtbaar voor get_kandidaten tot
       iemand classificeert en tagt. Dat kost geld en uren.
  keten-links-elke-10-min blijft actief: die functie doet alleen leescontroles
  op affiliate-links en schrijft niets wat de keten kan omgooien.

  ## De voorraadstap is vandaag een no-op, en dat is geen bug
  Gemeten op 27 september 2026:

      select count(*) as totaal, count(campaign_id) as met_campaign_id,
             count(*) filter (where in_stock) as in_voorraad, max(updated_at)::date
        from products;
      -- 281999 | 0 | 258132 | 2026-03-15

  Geen enkel product heeft een campaign_id, en stap 3 van keten_vul_na_import
  filtert op p.campaign_id = c.campaign_id. De voorraadstap raakt dus vandaag
  nul rijen. Hij gaat pas werken voor producten die via deze cron zijn
  geimporteerd, want processFeed in import-daisycon-feed zet campaign_id
  alleen als de aanroeper hem meestuurt. Wie deze functie leest moet niet
  denken dat de bestaande catalogus wordt opgeschoond.

  De semantiek van stap 3 is nagemeten en klopt: daisycon_imports.imported_at
  heeft default now() en de rij wordt aan het begin van de import ingevoegd
  (status 'running'), terwijl de producten daarna een eigen, latere updated_at
  krijgen. "updated_at < imported_at" betekent daarmee inderdaad "zat niet in
  deze feed".

  ## Ongeclassificeerde rijen komen in het log
  Na de deploy van import-daisycon-feed laat de importfilter productgroepen
  door die er tot nu toe uitvlogen (hardloopschoenen, crossfit- en
  spinningkleding, taak 11). Die komen binnen als footwear, top of bottom,
  stranden dus niet op de 'other'-afkap, en zijn zonder classifier_version en
  tagger_version onzichtbaar voor get_kandidaten. Niets in de keten meldde dat.
  keten_vul_na_import schrijft daarom in zijn 'klaar'-regel het veld
  ongeclassificeerd_per_retailer: {"H&M (NL)": 412, ...}. Staat daar een getal
  boven nul, dan ligt er werk klaar in deze volgorde:
  npm run keten:classificeer -- --retailer "<naam>", npm run keten:tag --
  --retailer "<naam>" --ja, scripts/keten/embed-products.py --retailer
  "<naam>", select keten_dedupe_embedding('<naam>').

  ## De linkjob had een index nodig (gemeten 27 september 2026)
  De eerste echte aanroep van keten_roep_edge('validate-product-links', ...)
  gaf geen 200 maar een 500 met {"error":"canceling statement due to statement
  timeout"}. De gateway en de service-role-sleutel waren dus in orde; de
  functie zelf liep vast op haar eigen ophaalquery. Die query is

      select id, affiliate_url, product_url from products
       where link_last_checked_at is null
          or link_last_checked_at < now() - interval '24 hours'
       order by link_last_checked_at asc nulls first
       limit <n>;

  Er stond geen enkele index op products.link_last_checked_at, en alle 281.999
  rijen staan op null (er is nog nooit een link gecontroleerd). Met EXPLAIN
  (ANALYZE, BUFFERS) gemeten, limit 5: parallelle seq scan plus top-N
  heapsort, 8.232 ms en 76.952 gedeelde buffers. De service-role-rol heeft
  geen eigen rolconfig en erft de 8 seconden statement-timeout van
  authenticator, dus de query werd altijd afgebroken.

  Met de index hieronder: 3,5 ms en 4 buffers voor limit 5, en 178 ms voor
  limit 200 (de waarde die de cron-job gebruikt). De planner leest de index in
  volgorde en stopt na de limit; nulls staan vooraan, precies de rijen die de
  job als eerste wil.

  Deze index is een bewuste uitbreiding op de plantekst. Hij voegt geen kolom
  toe en verandert geen data, net als de index op products (retailer) uit
  taak 2, en zonder hem is de linkjob uit spec 9 een job die elke tien minuten
  een 500 ophaalt terwijl pg_cron "succeeded" logt. Dat is precies de stille
  faalvorm die deze migratie elders beschrijft.

  ## keten_vul_nieuwe_producten hoort niet achter PostgREST
  De functie scant de hele retailer en is daarmee te zwaar voor de
  PostgREST-route. Gemeten op 27 september 2026 met EXPLAIN (ANALYZE,
  BUFFERS) voor H&M (NL): 17,5 s voor de anti-join die rijen zonder
  product_attributes zoekt en 14,6 s voor de ververs-stap, beide gedomineerd
  door heap-fetches over 88.043 rijen van products. De service-role-rol heeft
  geen eigen rolconfig en erft de 8 seconden van authenticator, dus een
  rpc-aanroep komt terug met foutcode 57014 (query_canceled). Vanuit pg_cron
  en vanuit de Management API geldt die limiet niet: daar liep de volledige
  run over alle 281.999 rijen in 28,7 s. Bouw hier dus geen knop of
  script-aanroep over PostgREST op; de aanroepers zijn pg_cron via
  keten_vul_na_import en een mens met de CLI.

  ## Elke run logt, ook de run zonder werk
  De al_gedaan-tak schrijft net als de andere twee takken een regel in
  keten_cron_log. Het plan zegt bij "Wat de spec openlaat" dat elke run een
  regel schrijft, en juist op een zondagochtend wil je kunnen zien dat de job
  om 06:00 draaide en niets te doen had, in plaats van een gat in het log dat
  net zo goed een niet-gedraaide job kan zijn. Het kost maximaal zes regels
  per zondag. De idempotentie-controle zoekt alleen naar regels met
  status 'klaar', dus deze extra regels kunnen de volgende run niet blokkeren.

  ## Terugdraaien
  select cron.unschedule('keten-feed-import-wekelijks');
  select cron.unschedule('keten-vul-na-import');
  select cron.unschedule('keten-links-elke-10-min');
  drop function if exists keten_vul_na_import();
  drop function if exists keten_vul_nieuwe_producten(text);
  drop function if exists keten_wekelijkse_import();
  drop function if exists keten_roep_edge(text, jsonb, text);
  drop table if exists keten_cron_log;
  drop index if exists idx_products_link_last_checked_at;
*/

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- validate-product-links sorteert op link_last_checked_at met nulls eerst en
-- pakt daar de eerste 200 van. Zonder deze index is dat een seq scan plus
-- sort over 281.999 rijen (8.232 ms gemeten) en valt de functie op de 8
-- seconden statement-timeout van de service-role-route. Met de index 178 ms
-- voor limit 200. Zie "De linkjob had een index nodig" hierboven.
create index if not exists idx_products_link_last_checked_at
  on products (link_last_checked_at asc nulls first);

create table if not exists keten_cron_log (
  id bigint generated always as identity primary key,
  job text not null,
  run_at timestamptz not null default now(),
  resultaat jsonb not null
);

create index if not exists idx_keten_cron_log_job_run_at
  on keten_cron_log (job, run_at desc);

alter table keten_cron_log enable row level security;

drop policy if exists "Admins lezen keten_cron_log" on keten_cron_log;
create policy "Admins lezen keten_cron_log"
  on keten_cron_log for select
  to authenticated
  using (is_current_user_admin());

create or replace function keten_roep_edge(
  p_functie text,
  p_body jsonb default '{}'::jsonb,
  p_query text default ''
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_url text;
  v_key text;
  v_id bigint;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'keten_project_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'keten_service_key';
  if v_url is null or v_key is null then
    raise exception 'Vault-secrets keten_project_url en keten_service_key ontbreken';
  end if;

  -- net.http_post staat in het schema "net" dat pg_net zelf aanmaakt, niet in
  -- extensions; daarom schema-gekwalificeerd en niet via het search_path.
  select net.http_post(
    url := rtrim(v_url, '/') || '/functions/v1/' || p_functie || p_query,
    body := p_body,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    timeout_milliseconds := 300000
  ) into v_id;

  return v_id;
end;
$$;

revoke all on function keten_roep_edge(text, jsonb, text) from public, anon, authenticated;

create or replace function keten_wekelijkse_import()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  c record;
  v_aantal integer := 0;
  v_namen text[] := '{}'::text[];
begin
  for c in
    select id, name, feed_url from affiliate_campaigns where is_active order by name
  loop
    perform keten_roep_edge(
      'import-daisycon-feed',
      jsonb_build_object('feedUrl', c.feed_url, 'campaignId', c.id)
    );
    v_aantal := v_aantal + 1;
    v_namen := v_namen || c.name;
  end loop;

  insert into keten_cron_log (job, resultaat)
  values ('keten-feed-import-wekelijks', jsonb_build_object('campagnes', v_aantal, 'namen', to_jsonb(v_namen)));

  return v_aantal;
end;
$$;

revoke all on function keten_wekelijkse_import() from public, anon, authenticated;

-- Alleen invoegen wat nog geen rij heeft. Zelfde heuristiek als plan 1 voor
-- is_fashion, category, gender en price_band; dedupe op de fotogroep: bestaat
-- er al een rij met dezelfde retailer en dezelfde image_url, dan wijst de
-- nieuwe rij naar de canonieke rij van die groep. Anders wint binnen de
-- nieuwe rijen de goedkoopste in-stock variant. De sleutel is letterlijk
-- dezelfde als in vul_product_attributes; zie "De dedupe-sleutel" boven.
--
-- price, in_stock en retailer zijn sinds migratie 20260914120400 (plan 1
-- taak 3, controller-ruling) gedenormaliseerd naar product_attributes:
-- get_kandidaten liep anders via een join naar products vast op de 8
-- seconden statement-timeout van de browser-route. Die migratie liet de
-- vulfunctie uit plan 1 die drie kolommen bij elke run verversen; omdat die
-- functie in dit plan nooit meer draait (Globale randvoorwaarden), doet
-- deze functie dat verversen voortaan zelf, voor elke rij van de retailer,
-- canoniek of niet, ongeacht classifier_version of tagger_version. Dit zijn
-- feed-eigenschappen, geen classificatie of tag: canonical_id, gender,
-- category, is_fashion en alle tag-kolommen worden in die stap niet
-- aangeraakt.
create or replace function keten_vul_nieuwe_producten(p_retailer text default null)
returns table (aantal_nieuw bigint, aantal_feedvelden_ververst bigint)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  -- Woorden waarmee een rij ondanks een kledingcategorie geen kleding is
  -- (woonaccessoires, fan-merch, dierenkleding). Deze string staat letterlijk
  -- gelijk in 20260914120000 en 20260914120400; migraties.test.ts vergelijkt
  -- de drie kopieen.
  niet_kleding constant text :=
    '\m(vaas|vazen|lamp|lampen|servies|bord|borden|beker|mok|mokken|kussen|kussens|kaars|kaarsen|poster|handdoek|handdoeken|deken|plaid|fotolijst|spiegel|speelgoed|knuffel|puzzel|sticker|telefoonhoesje|supporter|supporters|fanshirt|thuisshirt|uitshirt|matchworn|hondenjas|hondentuig|halsband|kattenmand)\M';
  v_nieuw bigint;
  v_ververst bigint;
begin
  perform keten_controleer_retailer(p_retailer);

  with nieuwe_rijen as (
    select
      p.id,
      p.retailer,
      lower(coalesce(p.brand, '')) as merk,
      normaliseer_productnaam(p.name) as naam,
      p.in_stock,
      p.price,
      lower(coalesce(p.category, '')) as cat,
      lower(coalesce(p.gender, 'unisex')) as gen,
      coalesce(p.is_kids, false) as is_kids,
      p.name as ruwe_naam,
      p.image_url
    from products p
    where (p_retailer is null or p.retailer = p_retailer)
      and not exists (select 1 from product_attributes pa where pa.product_id = p.id)
  ),
  -- Bestaande rijen van de betrokken retailers, met dezelfde sleutel en
  -- dezelfde voorkeur (de canonieke rij van de groep) als hieronder.
  bestaand_basis as (
    select
      x.retailer,
      lower(coalesce(x.brand, '')) as merk,
      normaliseer_productnaam(x.name) as naam,
      x.image_url,
      x.id,
      pa.canonical_id,
      (pa.canonical_id = pa.product_id) as is_canoniek
    from product_attributes pa
    join products x on x.id = pa.product_id
    where x.retailer in (select distinct n.retailer from nieuwe_rijen n where n.retailer is not null)
  ),
  bestaand as (
    select distinct on (b.retailer, coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam))
      b.retailer,
      coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam) as sleutel,
      b.canonical_id
    from bestaand_basis b
    order by b.retailer, coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam),
             b.is_canoniek desc, b.id
  ),
  gerangschikt as (
    select
      b.*,
      first_value(b.id) over (
        partition by b.retailer,
          -- Dezelfde foto is dezelfde look in een andere maat of prijs;
          -- een andere kleur heeft een andere foto en blijft een eigen
          -- product (spec 5.1). Terugval op merk + genormaliseerde naam
          -- alleen als image_url leeg is; vandaag 0 rijen, dus dode code
          -- die klaarstaat voor een toekomstige feed zonder foto's.
          coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam)
        order by (b.in_stock is true) desc, b.price asc, b.id asc
      ) as groep_canoniek
    from nieuwe_rijen b
  )
  insert into product_attributes (product_id, canonical_id, is_fashion, category, gender, price_band, price, in_stock, retailer)
  select
    g.id,
    coalesce(b.canonical_id, g.groep_canoniek),
    (
      g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')
      and g.is_kids = false
      and g.ruwe_naam !~* niet_kleding
    ),
    case
      when g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory') then g.cat
      else null
    end,
    case when g.gen in ('male', 'female') then g.gen else 'unisex' end,
    case
      when g.price < 50 then 'tot50'
      when g.price < 100 then '50tot100'
      when g.price < 200 then '100tot200'
      else 'boven200'
    end,
    g.price,
    g.in_stock,
    g.retailer
  from gerangschikt g
  left join bestaand b
    on b.retailer is not distinct from g.retailer
   -- Gelijkheid, geen "is not distinct from": een rij zonder sleutel (lege
   -- image_url en een naam die normaliseert naar null) hoort geen groep te
   -- vinden en wordt dan zijn eigen canonieke rij.
   and b.sleutel = coalesce(nullif(g.image_url, ''), 'naam:' || g.merk || ':' || g.naam)
  on conflict (product_id) do nothing;
  get diagnostics v_nieuw = row_count;

  -- price, in_stock, retailer en price_band komen uit products en zijn
  -- nooit een tag: altijd verversen, voor elke rij van deze retailer,
  -- canoniek of niet, net als de vulfunctie uit plan 1 deed voor taak 5.
  -- canonical_id staat hier niet in de set-lijst: de dedupe verschuift
  -- nooit door deze stap, alleen door taak 8 (keten_dedupe_embedding) of
  -- een nieuwe classificeer/tag-ronde (zie "Wat de spec openlaat" bovenaan
  -- het plan voor de afweging).
  update product_attributes pa
  set price = b.price,
      in_stock = b.in_stock,
      retailer = b.retailer,
      price_band = b.band
  from (
    select p.id, p.price, p.in_stock, p.retailer,
      case
        when p.price < 50 then 'tot50'
        when p.price < 100 then '50tot100'
        when p.price < 200 then '100tot200'
        else 'boven200'
      end as band
    from products p
    where (p_retailer is null or p.retailer = p_retailer)
  ) b
  where pa.product_id = b.id
    and (
      pa.price is distinct from b.price
      or pa.in_stock is distinct from b.in_stock
      or pa.retailer is distinct from b.retailer
      or pa.price_band is distinct from b.band
    );
  get diagnostics v_ververst = row_count;

  return query select v_nieuw, v_ververst;
end;
$$;

revoke all on function keten_vul_nieuwe_producten(text) from public, anon, authenticated;

create or replace function keten_vul_na_import()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_wacht text[];
  v_laatste timestamptz;
  v_verdwenen bigint := 0;
  v_stap bigint;
  v_vul record;
  v_ongeclassificeerd jsonb;
  v_uit jsonb;
  c record;
begin
  -- 1. Elke actieve campagne moet een geslaagde import van de laatste 12 uur hebben.
  select coalesce(array_agg(ac.name order by ac.name), '{}'::text[]), max(di.imported_at)
  into v_wacht, v_laatste
  from affiliate_campaigns ac
  left join daisycon_imports di on di.id = ac.last_sync_log_id
  where ac.is_active
    and (di.id is null or di.status <> 'success' or di.imported_at < now() - interval '12 hours');

  if cardinality(v_wacht) > 0 then
    v_uit := jsonb_build_object('status', 'wacht', 'campagnes_zonder_verse_import', to_jsonb(v_wacht));
    insert into keten_cron_log (job, resultaat) values ('keten-vul-na-import', v_uit);
    return v_uit;
  end if;

  -- 2. Al gedaan voor deze importronde? Dan niets doen (de job loopt elk uur).
  --    Ook deze tak logt, zodat het log laat zien dat de job draaide.
  select max(di.imported_at) into v_laatste
  from affiliate_campaigns ac
  join daisycon_imports di on di.id = ac.last_sync_log_id
  where ac.is_active;

  if exists (
    select 1 from keten_cron_log l
    where l.job = 'keten-vul-na-import'
      and l.resultaat->>'status' = 'klaar'
      and l.run_at > coalesce(v_laatste, '-infinity'::timestamptz)
  ) then
    v_uit := jsonb_build_object('status', 'al_gedaan', 'importronde', v_laatste);
    insert into keten_cron_log (job, resultaat) values ('keten-vul-na-import', v_uit);
    return v_uit;
  end if;

  -- 3. Voorraad: producten van een campagne die niet in de laatste geslaagde
  --    import zaten (updated_at ouder dan het begin van die import) zijn weg.
  --    Vandaag raakt deze stap nul rijen: geen enkel product heeft een
  --    campaign_id (gemeten 27 september 2026). Zie de kop hierboven.
  for c in
    select ac.id as campaign_id, di.imported_at
    from affiliate_campaigns ac
    join daisycon_imports di on di.id = ac.last_sync_log_id
    where ac.is_active and di.status = 'success' and di.inserted_count > 0
  loop
    update products p
    set in_stock = false
    where p.campaign_id = c.campaign_id
      and p.in_stock
      and p.updated_at < c.imported_at;
    get diagnostics v_stap = row_count;
    v_verdwenen := v_verdwenen + v_stap;
  end loop;

  -- 4. Nieuwe producten een rij geven, en price, in_stock, retailer en
  --    price_band verversen voor alle bestaande rijen van elke retailer;
  --    tags, classificatie en canonical_id blijven onaangeroerd. De
  --    voorraadstap hierboven staat al in products voordat deze stap
  --    product_attributes ernaar bijwerkt.
  select * into v_vul from keten_vul_nieuwe_producten(null);

  -- 5. Hoeveel rijen wachten op de classificeer- en tag-ronde? Zonder dit
  --    getal is aan het log niet te zien dat er werk klaarligt.
  select coalesce(jsonb_object_agg(t.retailer, t.aantal), '{}'::jsonb)
  into v_ongeclassificeerd
  from (
    select coalesce(pa.retailer, '(geen retailer)') as retailer, count(*) as aantal
    from product_attributes pa
    where pa.classifier_version is null
    group by 1
  ) t;

  v_uit := jsonb_build_object(
    'status', 'klaar',
    'nieuw', v_vul.aantal_nieuw,
    'feedvelden_ververst', v_vul.aantal_feedvelden_ververst,
    'uit_voorraad', v_verdwenen,
    'ongeclassificeerd_per_retailer', v_ongeclassificeerd
  );
  insert into keten_cron_log (job, resultaat) values ('keten-vul-na-import', v_uit);
  return v_uit;
end;
$$;

revoke all on function keten_vul_na_import() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'keten-feed-import-wekelijks') then
    perform cron.unschedule('keten-feed-import-wekelijks');
  end if;
  if exists (select 1 from cron.job where jobname = 'keten-vul-na-import') then
    perform cron.unschedule('keten-vul-na-import');
  end if;
  if exists (select 1 from cron.job where jobname = 'keten-links-elke-10-min') then
    perform cron.unschedule('keten-links-elke-10-min');
  end if;
end;
$$;

select cron.schedule('keten-feed-import-wekelijks', '0 3 * * 0', $$select keten_wekelijkse_import()$$);
select cron.schedule('keten-vul-na-import', '0 5-11 * * 0', $$select keten_vul_na_import()$$);
select cron.schedule('keten-links-elke-10-min', '*/10 * * * *', $$select keten_roep_edge('validate-product-links', '{}'::jsonb, '?limit=200')$$);

-- De twee zondagsjobs gaan inactief de deur uit; keten-links-elke-10-min
-- blijft actief. Zie "Twee jobs staan uit" bovenaan dit bestand voor de
-- afweging en de twee regels waarmee je ze aanzet.
-- Via cron.alter_job en niet via "update cron.job set active = false": de
-- postgres-rol heeft geen update-recht op cron.job (eigendom van
-- supabase_admin) en zo'n update draait de hele migratie terug.
do $$
declare
  v_jobid bigint;
begin
  for v_jobid in
    select jobid from cron.job
     where jobname in ('keten-feed-import-wekelijks', 'keten-vul-na-import')
  loop
    perform cron.alter_job(job_id := v_jobid, active := false);
  end loop;
end;
$$;
