/*
  # Index voor onbewerkte rijen in product_attributes (veegronde)

  ## Probleem
  products.id is `uuid default gen_random_uuid()`: geen verband tussen
  invoegvolgorde en sorteervolgorde. scripts/keten/classificeer-attributes.ts
  pagineert op `order by id` met een cursor (een lokaal checkpoint = laatst
  verwerkte id). Een rij die na het wegschrijven van dat checkpoint aan
  products wordt toegevoegd met een uuid die lexicografisch vóór de cursor
  valt, wordt door geen enkele volgende pagina meer bezocht, ook niet na een
  schone afronding (dan wordt het checkpoint juist gewist). Plan 2 voegt
  keten_vul_nieuwe_producten() toe, die na elke feed-import nieuwe rijen in
  product_attributes zet met classifier_version nog op null: precies het
  geval dat de cursor kan missen.

  ## Wat deze migratie doet
  Voegt een partiële index toe op product_attributes(product_id) waar
  classifier_version null is. Vandaag, met alles geclassificeerd, is deze
  index vrijwel leeg, en hij blijft klein: hij bevat per definitie alleen
  wat nog niet gedaan is. scripts/keten/classificeer-attributes.ts gebruikt
  hem na de paginering in een veegronde: een lus die herhaaldelijk alle
  rijen met classifier_version is null ophaalt, classificeert en wegschrijft,
  tot een ronde niets meer teruggeeft. Zonder deze index is die vraag
  ("welke rijen moeten nog") een sequentiële scan die groeit naarmate er
  meer geclassificeerd is (gemeten 2026-09-16: een eerdere poging om dit via
  een join/filter zonder index op te lossen dwong Postgres tot een merge
  join die product_attributes bij elke pagina van het begin afscande, 4-6+
  seconden per pagina, oplopend). Met deze index is de vraag een index scan
  op precies de rijen die ertoe doen.

  ## Terugdraaien
  drop index if exists idx_product_attributes_onbewerkt;
*/

create index if not exists idx_product_attributes_onbewerkt
  on public.product_attributes (product_id)
  where classifier_version is null;
