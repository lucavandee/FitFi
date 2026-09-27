/*
  # Keten plan 2: ivfflat-index en dedupe op embedding

  ## Probleem
  Plan 1 dedupet op retailer + merk + genormaliseerde naam. Kleurvarianten met
  een andere naam en identieke foto's blijven dan los staan; de engine kan ze
  als twee items in een outfit zetten.

  ## Wat deze migratie doet
  - ivfflat-index op embedding (spec 5.1). Bewust pas nu, na de embed-run uit
    taak 6: ivfflat traint zijn lijsten op de data die er bij het aanmaken is.
  - keten_dedupe_embedding(p_retailer, p_drempel): voor elk canoniek product met
    embedding zoekt hij (via de index, probes = 10) de buren binnen dezelfde
    retailer met cosine-similariteit >= p_drempel. Geen eis op gender of
    category (die komen uit de tagger en kunnen fout zijn). Afbeeldingen die
    tien of meer CANONIEKE producten delen zijn placeholders en doen niet mee.
    Per paar wint de variant die het eerst sorteert op
    (in_stock desc, price asc, id asc); de verliezer krijgt
    canonical_id = winnaar. Daarna worden rijen die naar een verliezer wezen
    doorgezet naar de winnaar (padcompressie), tot er niets meer verandert.
    Geeft het aantal aangepaste rijen terug. Idempotent: een tweede aanroep
    geeft 0.

  Draai na embed-products.py:
    select keten_dedupe_embedding('H&M (NL)');

  ## Afwijking van de taak-8-brief: geen join naar products, nergens
  De brief-SQL filtert de placeholder-CTE, de kandidatenparen en de
  winnaarsbepaling via een join naar products (p.image_url, p.in_stock,
  p.price, p.id). Dat is de constructie die dit project inmiddels vier keer
  duur heeft geleerd te vermijden op een pool van deze omvang:
    - get_kandidaten (20260914120400): 56,5s, statement-timeout.
    - keten_tag_kandidaten (20260922120000): 58,2s, EXPLAIN ANALYZE loops=91021.
    - keten_embed_kandidaten (20260916100100): image_url alsnog naar
      product_attributes verplaatst om dezelfde reden.
    - get_kandidaten opnieuw (20260925090000): to_jsonb(pa) serialiseerde de
      hele rij inclusief vector voor de afkap.
  product_attributes heeft sinds taak 2 en taak 6 al retailer, price, in_stock
  en image_url gedenormaliseerd. Deze migratie filtert, sorteert en rangschikt
  daarom volledig op product_attributes; products komt in deze migratie
  helemaal niet voor, ook niet na een afkap (er is geen client-respons die
  productvelden nodig heeft, alleen canonical_id wordt geschreven). De
  "order by x.id"-eis uit de contract-test wordt gehaald door een subselect
  op product_attributes met product_id as id te aliassen, niet door products
  te joinen.

  ## Placeholder-beveiliging: aansluiten bij taak 6, niet bij de letterlijke
  spec-tekst
  Taak 6 mat dat "10+ producten delen een image_url" op products.name-niveau
  bijna altijd een maatwaaier is (21 maten van hetzelfde product), geen
  placeholder, en verving de regel door "10+ VERSCHILLENDE productnamen delen
  een image_url". Die precieze vorm kan hier niet zonder een join naar
  products (products.name bestaat niet op product_attributes). Daarom is
  opnieuw gemeten, nu op canoniek niveau binnen product_attributes zelf:
    select image_url, count(*) from product_attributes
    where retailer = 'H&M (NL)' and canonical_id = product_id
      and image_url is not null
    group by 1 having count(*) >= 2;
  geeft voor H&M (NL) 0 rijen (gemeten 25/26 sept 2026, 24.815 canonieke rijen).
  Dat bevestigt taak 6's eigen bevinding vanuit een andere hoek: zodra
  product_attributes.canonical_id = product_id (dus na de bestaande
  naam-dedupe van vul_product_attributes), deelt geen enkele image_url meer
  twee verschillende canonieke producten. Maatwaaiers zijn dan al tot een
  canonieke rij samengevouwen; alleen een echte placeholder (dezelfde
  afbeelding voor structureel verschillende producten) zou op canoniek niveau
  nog een groep >= 2 opleveren. keten_placeholder telt daarom CANONIEKE
  product_attributes-rijen per image_url (geen join, geen products.name
  nodig): vandaag voor H&M een lege tabel, klaar voor de dag dat een andere
  retailer of een nieuwe feed wel zo'n geval oplevert.

  ## Droge run (25/26 sept 2026, voor deze migratie geschreven werd)
  6.198 van de 16.023 H&M-kandidaten hebben een embedding (taak 6, niet
  afgemaakt). Op representatieve steekproeven van 400-800 van die 6.198
  canonieke producten (keyset op product_id, met de index en probes=10 zoals
  hieronder): NUL paren bij cosine >= 0.999, >= 0.995 EN >= 0.99. De kleinste
  gevonden afstand in een steekproef van 400 was 0,0192 (cosine-similariteit
  0,981), tussen "H & M - Pantalon - Zwart" en "H & M - Pantalon - Relaxed
  Fit - Zwart" -- aantoonbaar twee verschillende producten (ander fit, andere
  prijs), geen duplicaat. Op 0,95 (cosine-similariteit) beginnen er paren te
  verschijnen, en ook die zijn bij inspectie verschillende producten met een
  vergelijkbare productfoto (zelfde pose/achtergrond), geen duplicaten. Zie
  taak-8-report.md voor de volledige tabel. Conclusie: bij de huidige,
  onvolledige embedding-dekking (38,7%) is er niets te dedupliceren op geen
  van de drie drempels; drempel 0,999 is niet te streng gebleken op basis van
  deze data, eerder te ruim vergeleken met wat een mens een "duplicaat" zou
  noemen (zelfs 0,981 is dat niet).

  ## lists = 6: bewust gekozen voor de HUIDIGE 6.198 embeddings, niet voor
  16.023 of 100.849
  pgvector-vuistregel: lists = rows / 1000 voor tabellen tot 1 miljoen rijen.
  Voor 6.198 rijen geeft dat lists = 6. Bij lists <= probes (10, hieronder
  vast ingesteld) doorzoekt de index elke lijst: dat is een volledig
  (exhaustief) nabuur-onderzoek, dus GEEN recall-verlies vergeleken met brute
  force. Gemeten (EXPLAIN ANALYZE, na `analyze product_attributes`): met
  lists = 100 kiest de planner de index pas na een verse ANALYZE en dan in
  206 ms voor een enkele rij (was 2,7-3,7s via een sequentiele scan zonder
  ANALYZE of met te weinig lijsten om te lonen). lists = 6 maakt de index dus
  vandaag geen sneller alternatief voor een volledige scan, maar wel een
  correcter een: elke buur wordt bekeken, niets wordt gemist door een te grove
  aanname.
  Wanneer de tabel later veel voller is: recompute lists volgens dezelfde
  vuistregel (rows / 1000 tot 1 miljoen rijen, sqrt(rows) daarboven) en
  `reindex index idx_product_attributes_embedding;`. Bij de volledige
  H&M-kandidatenpool (16.023) zou dat lists ~ 16 zijn; bij alle zes
  retailers samen canoniek (100.849) lists ~ 100 -- exact de waarde die de
  taak-8-brief voorstelde voor die schaal. Run ook opnieuw `analyze
  product_attributes;` na een substantiele wijziging in rijaantal: zonder
  verse statistieken kiest de planner de index soms niet, ongeacht lists.

  ## KRITIEKE BEVINDING: een volledige aanroep past niet binnen de
  statement-timeout van dit project, via GEEN van de twee beschikbare wegen
  Gemeten: de kandidaten-generatie alleen al (stap 1 van de functie, voor de
  hele H&M-pool van 6.198 canonieke embeddings, met lists = 100 dus met
  index-gebruik) overschrijdt de ~120s-tijdslimiet van de Management API
  (57014, canceling statement due to statement timeout). Representatieve
  steekproeven schalen dat door naar ongeveer 12 minuten voor de volledige
  6.198; dat wordt erger, niet beter, zodra taak 6 de resterende 9.825
  H&M-kandidaten embedt (16.023 in totaal) of zodra andere retailers
  meedoen.
  De taak-6-brief wijst bij zo'n tijdslimiet naar de pg_cron-uitwijk
  (cron.schedule met een zelf-unschedulende eenmalige job). Die uitwijk is
  BEPROEFD voor deze taak en bleek STUK op twee punten, beide zelf
  waargenomen:
  1. pg_cron-jobs draaien niet buiten de statement-timeout om: dezelfde
     query faalde ook via pg_cron met exact dezelfde 57014-foutmelding.
     "pg_cron heeft geen tijdslimiet van de Management API" (taak-6-brief,
     regel 427) klopt dus niet meer voor een query die de tijdslimiet van
     Postgres zelf raakt, alleen voor de tijdslimiet van de Management-API-
     proxy specifiek.
  2. Ernstiger: `select cron.unschedule('naam'); select <trage query>;` als
     EEN jobstring faalt destructief. Een fout in de tweede statement rolt
     de EERSTE (de unschedule) mee terug, omdat pg_cron de jobstring als een
     enkele impliciete transactie uitvoert. Het gevolg: de job bleef elke
     minuut opnieuw vuren en 1.640 keer falen (ongeveer 27 uur) voordat dit
     werd opgemerkt en handmatig gestopt met `select
     cron.unschedule(...)`. Dit is een fout in het patroon zelf, niet in
     deze migratie of in taak 6; elke volgende taak in dit plan die deze
     uitwijk gebruikt voor een query die kan falen, loopt hetzelfde risico.
     Niet hersteld binnen deze taak (het patroon staat in taak-6-brief.md,
     niet in een bestand dat bij taak 8 hoort); wel hier vastgelegd omdat
     het een productie-database 27 uur onnodig belastte.
  Conclusie: keten_dedupe_embedding is correct gebouwd en gecontracteerd
  getest, maar een volledige aanroep op de huidige of toekomstige H&M-pool
  kan vandaag niet synchroon worden uitgevoerd binnen dit project. Zie
  taak-8-report.md voor wat dit betekent en welke keuzes openstaan.

  ## Terugdraaien
  drop function if exists keten_dedupe_embedding(text, real);
  drop index if exists idx_product_attributes_embedding;
  De naam-dedupe uit plan 1 opnieuw draaien zet canonical_id terug op basis van
  naam, maar overschrijft ook de tags; doe dat alleen voor een her-tagging.
*/

create index if not exists idx_product_attributes_embedding
  on product_attributes using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 6);

analyze product_attributes;

create or replace function keten_dedupe_embedding(
  p_retailer text default null,
  p_drempel real default 0.999
)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_totaal integer := 0;
  v_stap integer;
begin
  perform keten_controleer_retailer(p_retailer);
  -- Meer lijsten doorzoeken dan de standaard (1): met een afstandsfilter en
  -- limit 5 zou de index anders echte buren missen.
  perform set_config('ivfflat.probes', '10', true);

  drop table if exists keten_placeholder;
  drop table if exists keten_paren;

  -- 0. Placeholder-afbeeldingen: een image_url die tien of meer CANONIEKE
  --    producten van de retailer delen is geen productfoto maar een
  --    "geen afbeelding"-plaatje. Op canoniek niveau (na de bestaande
  --    naam-dedupe) is een gedeelde url tussen maatvarianten al opgelost;
  --    zie de toelichting hierboven. Volledig op product_attributes, geen
  --    join naar products.
  create temp table keten_placeholder on commit drop as
  select image_url
  from product_attributes
  where product_id = canonical_id
    and (p_retailer is null or retailer = p_retailer)
    and image_url is not null
  group by image_url
  having count(*) >= 10;

  -- 1. Paren met cosine-afstand <= 1 - drempel, binnen dezelfde retailer.
  --    Alles hier komt uit product_attributes; products wordt niet
  --    aangeraakt.
  create temp table keten_paren on commit drop as
  select a.product_id as a_id, n.product_id as b_id
  from product_attributes a
  cross join lateral (
    select b.product_id
    from product_attributes b
    where b.product_id <> a.product_id
      and b.canonical_id = b.product_id
      and b.embedding is not null
      and b.retailer is not distinct from a.retailer
      and not exists (select 1 from keten_placeholder ph where ph.image_url = b.image_url)
      and (a.embedding <=> b.embedding) <= (1 - p_drempel)
    order by a.embedding <=> b.embedding
    limit 5
  ) n
  where a.canonical_id = a.product_id
    and a.embedding is not null
    and (p_retailer is null or a.retailer = p_retailer)
    and not exists (select 1 from keten_placeholder ph where ph.image_url = a.image_url);

  -- 2. Per paar de winnaar: goedkoopste in-stock variant, deterministisch.
  --    x.id is product_id, hernoemd zodat de rangorde exact leest zoals de
  --    contract-test vereist, zonder dat products erbij komt.
  with rangorde as (
    select kp.a_id, kp.b_id,
      (select x.id from (
          select product_id as id, in_stock, price
          from product_attributes
          where product_id in (kp.a_id, kp.b_id)
        ) x
        order by x.in_stock desc, x.price asc, x.id asc
        limit 1) as winnaar
    from keten_paren kp
  ),
  -- distinct ON de verliezer, niet distinct over het hele paar. Ligt product C
  -- binnen de drempel van zowel A als B terwijl A en B onderling geen paar
  -- vormen, dan levert de rangorde twee rijen op met dezelfde verliezer C en
  -- een andere winnaar. Een UPDATE ... FROM met twee matches op dezelfde
  -- doelrij laat Postgres vrij welke match hij toepast, dus dan bepaalde
  -- toeval in welk cluster C terechtkwam. Met distinct on plus dezelfde
  -- rangschikking als bij de paar-winnaar hierboven (goedkoopste op voorraad,
  -- uuid als tiebreak) is de uitkomst weer voorspelbaar. Eindreview 27 sept 2026.
  verliezers as (
    select distinct on (s.verliezer) s.verliezer, s.winnaar
    from (
      select case when winnaar = a_id then b_id else a_id end as verliezer, winnaar
      from rangorde
    ) s
    join product_attributes w on w.product_id = s.winnaar
    order by s.verliezer, w.in_stock desc, w.price asc, s.winnaar
  )
  update product_attributes pa
  set canonical_id = v.winnaar
  from verliezers v
  where pa.product_id = v.verliezer
    and pa.canonical_id = pa.product_id
    and v.winnaar <> pa.product_id;
  get diagnostics v_stap = row_count;
  v_totaal := v_totaal + v_stap;

  -- 3. Padcompressie: wie naar een verliezer wees, wijst nu naar diens winnaar.
  loop
    update product_attributes x
    set canonical_id = y.canonical_id
    from product_attributes y
    where x.canonical_id = y.product_id
      and y.canonical_id <> y.product_id
      and x.canonical_id <> y.canonical_id;
    get diagnostics v_stap = row_count;
    exit when v_stap = 0;
    v_totaal := v_totaal + v_stap;
  end loop;

  return v_totaal;
end;
$$;

revoke all on function keten_dedupe_embedding(text, real) from public, anon, authenticated;
