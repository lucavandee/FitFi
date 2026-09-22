/*
  # keten_tag_kandidaten: filter op product_attributes, niet op products

  ## Probleem
  keten_tag_kandidaten (20260916100000) filtert op p.in_stock en p.retailer
  via een join naar products: exact de constructie die plan 1 al een keer
  wegnam bij get_kandidaten (20260914120400, 20260914120500). De planner
  onderschat de selectiviteit van "pa.canonical_id = pa.product_id and
  pa.is_fashion" en joint vervolgens per kandidaatrij naar products om
  in_stock/retailer te toetsen: duizenden losse heap-fetches op de grootste
  tabel in de database, per pagina van 1000.

  Gemeten (Luc, 22 sept 2026, 1000 rijen, retailer H&M (NL)):
    filter via join naar products : 58,2s, valt om op statement timeout
    filter op product_attributes  : 17,9s, geeft 1000 rijen (nog zonder index)
  `npm run keten:tag` (droge run) strandde op pagina 3/4 met
  "keten_tag_kandidaten: canceling statement due to statement timeout". De
  volledige ronde moet 91.021 canonieke, draagbare, geclassificeerde rijen
  ophalen (gemeten over alle retailers, 22 sept 2026); dat is niet haalbaar
  op ~58s per pagina.

  ## Wat deze migratie doet
  1. keten_tag_kandidaten filtert voortaan volledig op product_attributes:
     pa.in_stock en pa.retailer in plaats van p.in_stock en p.retailer. Die
     twee kolommen staan al sinds 20260914120400 gedenormaliseerd op
     product_attributes en worden bij elke vul_product_attributes-run
     ververst, dus ze lopen nooit blijvend uit de pas met products. price en
     retailer in de resultaatset komen om dezelfde reden nu ook van pa in
     plaats van p. products wordt nog steeds gejoind, maar alleen voor de
     kolommen die de functie teruggeeft (name, brand, description,
     image_url, raw_category) -- met één bewuste, hieronder toegelichte
     uitzondering (image_url in de foto-tak blijft een filter op products).

  2. Nieuwe partiële index idx_product_attributes_tag_kandidaten op
     (retailer, product_id), met predicaat
       product_id = canonical_id and is_fashion
       and classifier_version is not null and in_stock.
     Dat is precies de kandidatenverzameling, onafhankelijk van modus of
     tagger_version: canoniek, draagbaar, geclassificeerd, op voorraad, voor
     één retailer, oplopend op product_id voor de keyset-paginatie
     (p_after). Reduceert de scan van 281.999 rijen naar de
     retailer-deelverzameling van de 91.021-rijen kandidatenpool.

     Bewuste keuze: tagger_version zit NIET in het indexpredicaat. De
     "else"-tak van de modus is niet alleen "tagger_version is null" maar
     "tagger_version is null or tagger_version not like p_versie || '%'". Een
     partiële index op alleen "is null" dekt de eerste volledige ronde
     (deze migratie, alles is nog null), maar zou bij een latere
     hertagronde met een nieuwe versiestring niets meer dekken (dan is
     niets meer null) en de query zou terugvallen op de volledige
     tabelscan die deze migratie nu juist wegneemt. Door tagger_version
     buiten het indexpredicaat te houden en pas als filter ná de indexscan
     toe te passen, bedient dezelfde index beide gevallen: bij de eerste
     ronde matcht vrijwel elke rij binnen de index (tagger_version is
     null), bij een hertagronde matcht vrijwel elke rij ook (nieuwe
     versiestring, oude tagger_version voldoet aan "not like"). De winst
     zit in het wegsnijden van de 281.999-rijen tabel naar de
     retailer/canoniek/fashion/geclassificeerd/voorraad-deelverzameling,
     niet in het wegfilteren op tagger_version zelf -- dat blijft (bewust)
     een tabelscan-achtige eigenschap zoals de vorige migratie al
     documenteerde, maar dan over ~15-90k rijen per retailer in plaats van
     281.999.

     De foto-tak (tagger_version = p_versie and confidence < 0.6 and
     image_url like 'http%') zit om dezelfde reden niet in het
     indexpredicaat: p_versie is een parameter, geen vaste waarde, dus een
     partiële index op een specifieke versiestring zou bij de eerstvolgende
     tag-versie al niet meer dekken. De foto-verzameling is bovendien veel
     kleiner dan de tekst-verzameling (pas gevuld ná een volledige
     tekst-ronde, alleen lage-confidence rijen): dezelfde index reduceert
     eerst tot de retailer/canoniek/fashion/geclassificeerd/voorraad-
     deelverzameling, en tagger_version/confidence lopen daarna als filter
     mee, zonder een eigen index nodig te hebben.

     image_url blijft getoetst via de join naar products (p.image_url like
     'http%'): product_attributes heeft geen image_url-kolom. Die
     toevoegen vraagt om een backfill via vul_product_attributes of een
     losse update op basis van products, en dat valt buiten deze taak
     (products en vul_product_attributes blijven onaangeraakt van deze
     migratie, expliciete randvoorwaarde). Geen regressie: de foto-tak was
     nooit de gerapporteerde blokkade, en zijn kandidatenverzameling is na
     de indexreductie hierboven al klein, dus de resterende join naar
     products raakt geen duizenden losse heap-fetches meer zoals de
     tekst-tak vóór deze migratie.

  ## Meting na deze migratie
  EXPLAIN ANALYZE op pagina 1, pagina 3 en een pagina diep in de reeks
  (p_after in het midden van de id-reeks), plus de volledige droge run van
  `npm run keten:tag`: zie
  .superpowers/sdd/2026-09-14-plan-2-tagging/tagkandidaten-fix-report.md.

  ## Terugdraaien
  drop index if exists idx_product_attributes_tag_kandidaten;
  -- en de vorige versie van keten_tag_kandidaten opnieuw toepassen:
  -- supabase db query --linked -f
  --   supabase/migrations/20260916100000_keten_tag_kolommen.sql
*/

create index if not exists idx_product_attributes_tag_kandidaten
  on product_attributes (retailer, product_id)
  where product_id = canonical_id
    and is_fashion
    and classifier_version is not null
    and in_stock;

create or replace function keten_tag_kandidaten(
  p_retailer text default null,
  p_modus text default 'tekst',
  p_versie text default 'haiku-4.5-v1',
  p_limit int default 1000,
  p_after uuid default null
)
returns table (
  product_id uuid,
  name text,
  brand text,
  description text,
  price numeric,
  retailer text,
  raw_category text,
  gender text,
  image_url text,
  confidence real
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  select
    pa.product_id,
    p.name,
    p.brand,
    left(coalesce(p.description, ''), 1200) as description,
    pa.price,
    pa.retailer,
    p.category as raw_category,
    pa.gender,
    p.image_url,
    pa.confidence
  from product_attributes pa
  join products p on p.id = pa.product_id
  where pa.canonical_id = pa.product_id
    and pa.is_fashion
    and pa.classifier_version is not null
    and pa.in_stock
    and (p_retailer is null or pa.retailer = p_retailer)
    and (p_after is null or pa.product_id > p_after)
    and case p_modus
          when 'foto' then
            pa.tagger_version = p_versie
            and pa.confidence < 0.6
            and p.image_url like 'http%'
          else
            pa.tagger_version is null
            or pa.tagger_version not like p_versie || '%'
        end
  order by pa.product_id
  limit p_limit;
$$;

revoke all on function keten_tag_kandidaten(text, text, text, int, uuid) from public, anon, authenticated;
