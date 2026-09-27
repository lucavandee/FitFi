/*
  # get_kandidaten: partiele index met tagger_version in het predicaat

  ## Probleem, gemeten door Luc (26/27 sept 2026)
  npm run keten:personas faalde op de eerste persona met "get_kandidaten faalde:
  canceling statement due to statement timeout". Drie curl-aanroepen via de
  anon-route gaven 3,81s (HTTP 500), 4,01s (HTTP 500), 1,50s (HTTP 200). Vóór de
  ivfflat/dedupe-migratie van taak 8 (20260916100300) was dat 1,07s koud en 0,24
  tot 0,37s warm.

  EXPLAIN (ANALYZE, BUFFERS) op de basis-CTE van get_kandidaten (male, occasions
  work, budget 50-150, geen retailer) bevestigt de oorzaak, hier opnieuw gemeten
  vóór deze migratie:

    Sort  Sort Key: pa.category, pa.product_id  (actual rows=245)
      Index Scan using idx_product_attributes_kandidaten on product_attributes pa
        Index Cond: (gender = ANY ('{male,unisex}') AND category = ANY (...)
                     AND price >= 50 AND price <= 150)
        Filter: (classifier_version IS NOT NULL AND tagger_version IS NOT NULL)
        Rows Removed by Filter: 11418
    Execution Time: 20.071 ms (warme cache, shared hit=10465, geen read)

  Dezelfde 11418 als in Luc's eigen meting. idx_product_attributes_kandidaten
  (20260914120400) dekt alleen (gender, category, price) onder het predicaat
  "product_id = canonical_id and is_fashion and in_stock" -- classifier_version
  en tagger_version zitten er niet in en worden dus voor elke rij die de
  index-scan oplevert opnieuw als Filter gecontroleerd, over de volledige
  kandidatenverzameling (canoniek, draagbaar, in voorraad: ~90k+ rijen) in
  plaats van alleen de al getagde deelverzameling (16.023 rijen, gemeten).

  Get_kandidaten (20260916100200, ongewijzigd sinds) eist in zijn basis-CTE
  altijd "tagger_version is not null" -- niet voorwaardelijk zoals bij
  keten_tag_kandidaten (20260922120000), waar dezelfde voorwaarde een
  bewegend doel is ("is null OR not like versie || '%'", omdat een latere
  hertagronde met een nieuwe versiestring anders niets meer zou matchen). Bij
  get_kandidaten is "tagger_version is not null" een vaste, monotone
  voorwaarde: een rij die eenmaal getagd is, wordt nooit meer ongetagd. Die
  voorwaarde kan dus wel gewoon in het indexpredicaat, in tegenstelling tot bij
  idx_product_attributes_tag_kandidaten, waar diezelfde reden er juist toe
  leidde om tagger_version BUITEN het predicaat te houden.

  De aanleiding was de "analyze product_attributes" in de migratie van taak 8:
  verse statistieken lieten de planner een ander plan kiezen. Dat is geen fout
  van taak 8 -- het oude plan was toevallig goed door verouderde statistieken.
  De zwakte (classifier/tagger niet in het indexpredicaat) zat er al sinds
  20260916100200 get_kandidaten tagger_version is not null eiste.

  ## Wat deze migratie doet
  Een nieuwe, aanvullende partiele index, dezelfde vorm als
  idx_product_attributes_tag_kandidaten (20260922120000) volgde voor
  keten_tag_kandidaten: kolomvolgorde en predicaat afgestemd op de echte query
  van de aanroeper, hier get_kandidaten in plaats van keten_tag_kandidaten.

    create index idx_product_attributes_get_kandidaten
      on product_attributes (gender, category, price)
      where product_id = canonical_id
        and is_fashion
        and in_stock
        and classifier_version is not null
        and tagger_version is not null;

  Kolomvolgorde ongewijzigd t.o.v. idx_product_attributes_kandidaten (gender,
  category, price): 20260925090000 documenteerde al waarom die volgorde bij
  get_kandidaten hoort (gender eerst vanwege de IN-lijst (p_gender, unisex),
  category tweede vanwege de vaste IN-lijst van 6 categorieen, price laatste
  voor de budget-range binnen elke gender/category-combinatie). Alleen het
  predicaat is uitgebreid met classifier_version is not null en
  tagger_version is not null, zodat de planner de 16.023 al getagde rijen
  direct via de index vindt in plaats van eerst de bredere kandidatenset
  (canoniek, draagbaar, voorraad) op te halen en er dan 11.418 van weg te
  filteren.

  retailer zit bewust NIET in het predicaat en ook niet als indexkolom:
  p_retailer is optioneel (get_kandidaten: "p_retailer is null or pa.retailer
  = p_retailer") en de aanroepers die vandaag de time-out raken
  (scripts/keten/persona-run.ts via naarKandidatenParams, die geen p_retailer
  meegeeft) filteren er helemaal niet op. Een vaste retailer-waarde in het
  predicaat zou bovendien alleen die ene retailer dekken en de index onbruikbaar
  maken voor elke aanroep zonder p_retailer -- exact de aanroep die nu faalt.
  Wanneer een aanroep wel een retailer meegeeft (zoals de eerdere
  taak-7/taak-8-metingen deden), wordt retailer eenvoudig een Filter na de
  indexscan, over de kleine (16.023-rijen) al getagde deelverzameling in plaats
  van de volledige tabel -- verwaarloosbaar, gemeten hieronder.

  idx_product_attributes_kandidaten (20260914120400) blijft bestaan: die
  index heeft geen classifier/tagger-predicaat en dekt daarmee nog steeds
  aanroepers die WEL de bredere (canoniek/draagbaar/voorraad) verzameling
  nodig hebben zonder de tagger-eis, zoals vul_product_attributes' eigen
  gebruik elders. Niet verwijderd; geen bewijs verzameld dat er geen andere
  aanroeper meer op leunt, en dat bewijs was ook geen onderdeel van deze taak.

  ## Analyze
  Dezelfde les als taak 8's eigen migratie: zonder een verse ANALYZE na het
  aanmaken van de index kan de planner hem negeren (verouderde statistieken
  onderschatten dan juist de nieuwe index in plaats van de oude). Daarom hier
  ook een expliciete "analyze product_attributes;" na de create index.

  ## Meting na deze migratie
  EXPLAIN (ANALYZE, BUFFERS) voor en na, vier curl-aanroepen via de anon-route,
  een aanroep met een krap budget (45-55) en een met een breed budget: zie
  .superpowers/sdd/2026-09-14-plan-2-tagging/index-fix-report.md.

  ## Terugdraaien
  drop index if exists idx_product_attributes_get_kandidaten;
  -- idx_product_attributes_kandidaten blijft ongewijzigd staan; get_kandidaten
  -- zelf is niet aangepast door deze migratie, dus daar hoeft niets voor terug.
*/

create index if not exists idx_product_attributes_get_kandidaten
  on product_attributes (gender, category, price)
  where product_id = canonical_id
    and is_fashion
    and in_stock
    and classifier_version is not null
    and tagger_version is not null;

analyze product_attributes;
