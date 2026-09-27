# Fundament uitvoeringsplan

> **Voor agentische uitvoerders:** VEREISTE SUB-SKILL: gebruik superpowers:subagent-driven-development of superpowers:executing-plans om dit plan taak voor taak uit te voeren. Stappen gebruiken checkbox-syntax (`- [ ]`).

**Doel:** de engine ziet de hele catalogus in plaats van de eerste 1.000 rijen, dezelfde antwoorden geven dezelfde outfits, en per outfit wordt "Zou ik dragen" of "Nooit" gemeten in de database.

**Architectuur:** Alles wat afgeleid is van `products` komt in een nieuwe tabel `product_attributes` (dedupe, categorie, gender, prijsband), gevuld door een SQL-functie die de ruwe tabel nooit aanraakt, en daarna gecorrigeerd door een script dat de bestaande productclassifier uit `src/engine/productClassifier.ts` op elke rij draait, zodat de categorie in de database al klopt voordat de RPC per categorie afkapt. Een RPC `get_kandidaten` filtert aan de serverkant en geeft per gecorrigeerde categorie een vaste, deterministische set kandidaten terug; `outfitService` roept die RPC aan en draait engine v2 met een vaste seed uit de quiz-antwoorden. De bestaande resultatenpagina krijgt op alle drie de plekken waar een outfit staat (top-3-sectie, grid, swipe) twee beoordelingsknoppen die naar `outfit_ratings` schrijven; een script draait vier persona's door dezelfde keten en faalt op de controles uit de spec.

**Stack:** Vite + React 18 + TypeScript, Tailwind 3.4, Supabase (Postgres, RLS, edge functions in Deno), vitest, vite-node voor scripts, Netlify.

**Spec:** docs/superpowers/specs/2026-09-14-keten-herbouw-design.md

---

## Globale randvoorwaarden

- Elke taak eindigt met `npx tsc --noEmit`, `npx vitest run` en `npx vite build` groen.
- `npm run design:check:ci` staat op de hele repo op score 0% en exit 1 (gemeten 2026-09-14: `node scripts/check-design-compliance.mjs --strict; echo $?` geeft 1). De poort voor dit plan is daarom: het getal achter `Total Violations` in de uitvoer van `node scripts/check-design-compliance.mjs` stijgt na jouw taak niet, behalve door de hex-kleuren die CLAUDE.md voorschrijft (`text-[#1A1A1A]` enzovoort). Schrijf het getal op voor je begint (`node scripts/check-design-compliance.mjs | grep "Total Violations"`).
- UI volgt design system v1.0 uit CLAUDE.md: kleuren alleen uit het palet, buttons `rounded-xl` met minimale hoogte 48px, cards `rounded-2xl`, alleen `hover:shadow-md` als schaduw, Lucide-iconen `w-5 h-5` inline, geen tekst kleiner dan 14px.
- Het design-check-script telt `gap-3`, `p-5`, `mt-3` en `shadow-*` als overtreding. Gebruik in nieuwe code `gap-2`/`gap-4`, `p-4`/`p-6`, `mt-2`/`mt-4` en geen schaduw.
- Copy in het Nederlands, je/jij, geen buzzwords, geen em-dashes. De vaste CTA-teksten uit CLAUDE.md blijven ongewijzigd; de twee nieuwe knopteksten zijn letterlijk "Zou ik dragen" en "Nooit" (spec 6.6).
- `products` blijft de ruwe feed. Geen enkele taak in dit plan schrijft naar `products`.
- Engine v2 wordt niet aangepast (spec 7). Dit plan geeft hem alleen een andere productpool en een seed. `src/engine/productClassifier.ts` wordt gelezen (door het classificatiescript), niet gewijzigd.
- Migraties: `supabase/migrations/YYYYMMDDHHMMSS_naam.sql`, met een commentaarblok bovenaan (probleem, wat de migratie doet, terugdraaien), zoals `20260804203000_fix_dress_shirt_category.sql`.
- Migraties worden toegepast met de Supabase CLI via de Management API, omdat er geen psql op deze machine staat en de oudere migraties niet in de remote migratiehistorie staan (`supabase db push` zou ze allemaal opnieuw willen draaien). De repo is al gelinkt (`supabase/.temp/project-ref` bestaat; `supabase --version` geeft 2.90.0). Per bestand: `supabase db query --linked -f supabase/migrations/<bestand>.sql`. Controle-queries: `supabase db query --linked "<sql>" -o table`. `supabase/.temp/` staat in `.gitignore`; controleer dat met `git check-ignore supabase/.temp`.
- Omgevingsvariabelen voor scripts en live tests: `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` staan in `.env` in de repo-root (niet gecommit) en in Netlify (`netlify env:list`). Alleen taak 2 (classificatiescript) heeft daarnaast `SUPABASE_SERVICE_ROLE_KEY` nodig: haal die op met `supabase projects api-keys --project-ref "$(cat supabase/.temp/project-ref)"` (rij `service_role`) en zet hem alleen in de shell (`export SUPABASE_SERVICE_ROLE_KEY=...`). Nooit in `.env`, nooit committen, nooit loggen. Sluit de shell na taak 2.
- Geen nieuwe npm-afhankelijkheden. `@supabase/supabase-js`, `vitest` en `vite-node` (via vitest, `node_modules/.bin/vite-node` versie 1.6.1) staan al in de repo. Er is geen jsdom, geen happy-dom en geen Playwright geinstalleerd (`playwright.config.ts` bestaat, `node_modules/@playwright` niet).
- Tests: pure logica met vitest in `__tests__`-mappen naast de code (omgeving `node`, alias `@` werkt via `vitest.config.ts`). React-componenten worden getest met `renderToString` uit `react-dom/server`, zoals `src/components/quiz/__tests__/CalibrationStep.render.test.tsx`. Gedrag dat van `localStorage` afhangt wordt getest door `globalThis.localStorage` in de test te vervangen door een klein in-memory object; de component leest daarom zijn beginstand in de `useState`-initializer (die draait ook bij `renderToString`), niet in een `useEffect` (die draait daar niet).
- Commit per taak, boodschap in het Nederlands, op de huidige branch `feat/keten-herbouw`.

### Stopregels (tripwires)

Stop en meld, ga niet door naar de volgende taak, als:

1. Na taak 2 de controlequery "accessoires met een kledingwoord in de naam" (zie Controle vooraf) niet fors daalt ten opzichte van 50.618, of de dekkingsmatrix voor `top` bij `male` of `female` minder dan de helft van `accessory` is. Dan is de classificatie niet aangekomen in `product_attributes` en bouwt elke volgende taak op scheve emmers.
2. In taak 11 het persona-harnas meldt dat de classifier in de client een andere categorie geeft dan `product_attributes` voor een of meer kandidaten. Dan is de classificatie in de database verouderd ten opzichte van de code: draai taak 2 stap 4 opnieuw.
3. Na livegang `weekly_ratings` in de eerste volle week minder dan een paar procent van de `/results`-bezoekers (vergelijk met `results_page_view` in de telemetrie) een beoordeling laat achterlaten. Dan staan de knoppen niet waar mensen kijken; controleer eerst de top-3-sectie (taak 10 stap 3).

### Controle vooraf (uitgevoerd op 2026-09-15 tegen de live database)

De roast van dit plan vroeg om een meting voordat er iets gebouwd wordt. Uitgevoerd met `supabase db query --linked`:

```sql
select count(*) from products
where category = 'accessory'
  and name ~* '(shirt|top|blouse|jurk|dress|broek|jeans|trui|sweater)';
```

Uitkomst: **50.618** rijen (opnieuw gedraaid op 2026-09-16 bij de tweede roast-ronde: zelfde getal). Van de circa 74.600 accessoires in de catalogus heeft dus twee derde een kledingwoord in de naam. `products.category` is niet bruikbaar als emmer voor een top-N-per-categorie; daarom corrigeert taak 2 de categorie in `product_attributes` voordat taak 3 erop afkapt.

De roast stelde als alternatief een SQL-vertaling van `reclassifyProducts` in `get_kandidaten` voor. Dat is niet overgenomen: de repo heeft al twee kopieën van de classifier (`src/engine/productClassifier.ts` en `supabase/functions/_shared/productClassifier.ts`), en een derde in Postgres-regexsyntaxis zou bij elke wijziging uit de pas lopen. Taak 2 laat in plaats daarvan de TypeScript-functie zelf over alle rijen draaien en de uitkomst in de database schrijven; het effect is hetzelfde (de emmer in taak 3 is de gecorrigeerde categorie) en er is maar een bron.

### Stand van uitvoering (gecontroleerd op 2026-09-16 tegen repo en live database)

Van taak 1 zijn stap 1 tot en met 5 al uitgevoerd en nog niet gecommit:

- `supabase/migrations/20260914120000_product_attributes_fundament.sql` staat op schijf (ongetrackt) en is byte voor byte gelijk aan het SQL-blok in taak 1 stap 2.
- De migratie is toegepast: `product_attributes` bestaat met de negen kolommen uit stap 2, de vier indexen, RLS aan en de leespolicy; `normaliseer_productnaam`, `vul_product_attributes` en `zet_classificatie` bestaan; `vector` staat in schema `extensions`. De controles uit stap 4 geven exact de verwachte uitkomst.
- `product_attributes` heeft 0 rijen: stap 6 (vullen) is nog niet gedraaid.
- `scripts/keten/vul-attributes.sh` staat op schijf (ongetrackt) en is gelijk aan het blok in stap 5. De regel `keten:vul` in `package.json` ontbreekt nog.

Begin dus bij taak 1 stap 5 (alleen de `package.json`-regel) en stap 6. De eerdere stappen staan in het plan zodat een verse omgeving ze ook kan draaien; ze zijn allemaal idempotent.

Verder bestaat `src/utils/hash.ts` al (met `hashString`, gebruikt door `src/utils/image.ts`). Taak 5 breidt dat bestand uit in plaats van het aan te maken.

Retailers (voor de vulscripts in taak 1 en 2):

| Retailer | Rijen |
|---|---|
| Giglio (INT) | 169.697 |
| H&M (NL) | 88.043 |
| PUMA (EU) - USD | 14.420 |
| Mart Visser | 6.847 |
| OFM. | 2.973 |
| The New Originals (NL) | 19 |
| Totaal | 281.999 |

Geen rijen met `retailer is null`.

### Omvang en tijd (schatting, niet gemeten)

| Taak | Inhoud | Schatting |
|---|---|---|
| 1 | Migratie `product_attributes`, vullen per retailer | 2 tot 3 uur, waarvan het vullen zelf onbekend: meet de eerste retailer |
| 2 | Classificatiescript over 281.999 rijen | 1,5 uur bouwen; de run zelf circa 282 leesverzoeken plus 282 schrijfverzoeken van 1.000 rijen, naar verwachting 10 tot 20 minuten |
| 3 | RPC `get_kandidaten` | 1 uur |
| 4 | `outfit_ratings` en view | 1 uur |
| 5 | Stabiele JSON, hash, seed | 1 uur |
| 6 | Vertaling naar RPC-parameters en pool | 1,5 uur |
| 7 | `outfitService` via RPC met seed | 1,5 uur |
| 8 | Service voor beoordelingen | 0,5 uur |
| 9 | Geheugen-module en component | 1,5 uur |
| 10 | Knoppen op drie plekken van `/results` | 1,5 uur |
| 11 | Persona-harnas | 1,5 uur |
| Totaal | | 15 tot 18 uur uitvoering, geen LLM-kosten (dit plan tagt niets) |

Betrokkenen: de uitvoerder, en Luc als poort na taak 11 (spec 8: "Luc heeft de outfits gezien"). Plan 2, 3 en 4 erven de aanname dat `category`, `gender` en `price_band` in `product_attributes` kloppen; taak 2 en de stopregels hierboven zijn er om die aanname te toetsen voordat iemand erop bouwt.

---

## Bestandsstructuur

| Bestand | Actie | Verantwoordelijkheid |
|---|---|---|
| `supabase/migrations/20260914120000_product_attributes_fundament.sql` | Aanmaken | pgvector aan, tabel `product_attributes` met de ruwe velden en `classifier_version`, indexen, RLS, naamnormalisatie, vulfunctie `vul_product_attributes` met dedupe, schrijffunctie `zet_classificatie` voor het script |
| `scripts/keten/vul-attributes.sh` | Aanmaken | Draait `vul_product_attributes` per retailer, met terugval op merk-ranges als een retailer op de tijdslimiet loopt |
| `src/services/attributes/classificatie.ts` | Aanmaken | `classificeerRij`: van een `products`-rij naar `{ product_id, category, is_fashion }` met de bestaande classifier |
| `src/services/attributes/__tests__/classificatie.test.ts` | Aanmaken | Tests voor `classificeerRij` op de gevallen uit de audit |
| `scripts/keten/classificeer-attributes.ts` | Aanmaken | Leest `products` in pagina's, classificeert, schrijft via `zet_classificatie` naar `product_attributes` |
| `supabase/migrations/20260914120100_get_kandidaten.sql` | Aanmaken | RPC `get_kandidaten` met alle filters, score 0, deterministische volgorde, op de gecorrigeerde categorie |
| `supabase/migrations/20260914120200_outfit_ratings.sql` | Aanmaken | Tabel `outfit_ratings`, RLS voor anonieme insert, view `weekly_ratings` |
| `src/utils/stableJson.ts` | Aanmaken | `stableStringify`: JSON met gesorteerde sleutels, basis voor hash en seed |
| `src/utils/__tests__/stableJson.test.ts` | Aanmaken | Test voor `stableStringify` |
| `src/utils/hash.ts` | Wijzigen | Bestaand bestand met `hashString` (FNV-1a, gebruikt door `src/utils/image.ts`); erbij komen `sha256Hex` (WebCrypto, browser en Node) en `fnv1a32` (synchrone 32-bits hash voor de seed) |
| `src/utils/__tests__/hash.test.ts` | Aanmaken | Testvectoren voor beide hashes |
| `src/services/outfits/answersSeed.ts` | Aanmaken | `seedFromAnswers`: vaste seed uit de quiz-antwoorden |
| `src/services/outfits/__tests__/answersSeed.test.ts` | Aanmaken | Test: zelfde antwoorden, zelfde seed; andere sleutelvolgorde, zelfde seed |
| `src/services/outfits/kandidaten.ts` | Aanmaken | Vertaling quiz-antwoorden naar RPC-parameters, rijtype van de RPC, mapping van een RPC-rij naar `Product` met de categorie uit `product_attributes`, voorbereiding van de pool (classificatie als tweede net, veiligheidsnet, afwijkingsteller) |
| `src/services/outfits/__tests__/kandidaten.test.ts` | Aanmaken | Tests voor de vertaling, de mapping en de categorie-overname |
| `src/services/outfits/__tests__/getKandidaten.live.test.ts` | Aanmaken | Live test tegen de RPC, wordt overgeslagen zonder omgevingsvariabelen |
| `src/services/outfits/outfitService.ts` | Wijzigen | `getProducts` via `get_kandidaten`, seed in `generateOutfits`, client-dedupe weg |
| `src/services/outfits/__tests__/outfitService.test.ts` | Aanmaken | Tests met gemockte Supabase-client: RPC-parameters, seed, foutpad |
| `src/services/ratings/outfitRatings.ts` | Aanmaken | `hashProfile`, `outfitKey`, `saveOutfitRating` |
| `src/services/ratings/__tests__/outfitRatings.test.ts` | Aanmaken | Tests voor hashes en de insert |
| `src/components/results/outfitRatingGeheugen.ts` | Aanmaken | Onthouden van een keuze per profiel en outfit (localStorage met injecteerbare opslag), abonnement voor meerdere instanties van dezelfde outfit, beslisregel `magSchrijven` |
| `src/components/results/__tests__/outfitRatingGeheugen.test.ts` | Aanmaken | Tests: lezen, schrijven, geen dubbele schrijfactie, abonnees |
| `src/components/results/OutfitRatingButtons.tsx` | Aanmaken | Knoppenpaar "Zou ik dragen" / "Nooit" onder een outfitkaart |
| `src/components/results/__tests__/OutfitRatingButtons.render.test.tsx` | Aanmaken | Render-test van het knoppenpaar, inclusief een onthouden keuze uit een gestubde localStorage |
| `src/pages/EnhancedResultsPage.tsx` | Wijzigen | Profile-hash berekenen, knoppenpaar onder elke kaart in de top-3-sectie, de grid- en de swipe-weergave |
| `src/keten/personas.ts` | Aanmaken | Canonieke persona-data (naam, gender, gelegenheden, budget, stijlvoorkeuren) uit spec 5.7; bron voor dit harnas en voor plan 3 taak 8 |
| `scripts/keten/persona-run.ts` | Aanmaken | Persona-harnas: vier persona's door `get_kandidaten` en `runEngineV2`, controles uit spec 5.7 plus de afwijkingsteller |
| `package.json` | Wijzigen | Scripts `keten:vul`, `keten:classificeer`, `keten:personas` |

---

### Taak 1: Migratie `product_attributes` met dedupe, ruwe velden en schrijffunctie voor de classifier

**Bestanden:**
- Aanmaken: `supabase/migrations/20260914120000_product_attributes_fundament.sql`, `scripts/keten/vul-attributes.sh`
- Wijzigen: `package.json` (blok `"scripts"`)
- Test: controle-queries via `supabase db query --linked` (er is geen SQL-testframework in de repo)

**Interfaces:**
- Gebruikt: tabel `products` (kolommen `id uuid`, `name text`, `description text`, `brand text`, `price numeric`, `retailer text`, `category text`, `type text`, `gender text`, `in_stock boolean`, `is_kids boolean`; gecontroleerd op 2026-09-15 via `information_schema.columns`).
- Levert: tabel `product_attributes(product_id uuid PK, canonical_id uuid, is_fashion boolean, category text, gender text, price_band text, classifier_version text, embedding extensions.vector(512), tagged_at timestamptz)`; functie `normaliseer_productnaam(p_naam text) returns text`; functie `vul_product_attributes(p_retailer text default null, p_merk_van text default null, p_merk_tot text default null) returns table (verwerkt bigint, canoniek bigint)`; functie `zet_classificatie(p_rijen jsonb, p_versie text) returns bigint` (alleen service role).

Wat de spec openlaat en hier is besloten:
- Alleen de kolommen die zonder LLM te vullen zijn. `formality`, `occasions`, `silhouette`, `color_temp`, `lightness`, `pattern`, `shoe_type`, `colors`, `materials`, `seasons`, `confidence` en `tagger_version` komen in plan 2 met een `ALTER TABLE ... ADD COLUMN`.
- De ivfflat-index op `embedding` komt ook in plan 2: een ivfflat-index op een lege tabel traint op niets en is waardeloos.
- `category` bevat alleen een van de zes waarden uit de spec; een andere categorie (`jumpsuit`, `underwear`, `other`) geeft `category = NULL` en `is_fashion = false`.
- `is_fashion` is false als `products.is_kids` waar is (spec: "kinderen").
- `vul_product_attributes` schrijft de ruwe categorie als eerste vulling. Zodra `classifier_version` gevuld is (taak 2), laat een nieuwe run van `vul_product_attributes` `category` en `is_fashion` van die rij met rust; alleen `canonical_id`, `gender` en `price_band` worden ververst. Zo overschrijft een her-run na een feed-import de classificatie niet.
- `zet_classificatie` is de enige schrijfweg voor het script in taak 2: 1.000 rijen per aanroep als jsonb, security definer, alleen uitvoerbaar door `service_role`.

- [ ] **Stap 1: Controle vooraf en check waar pgvector staat**

```bash
supabase db query --linked "select count(*) from product_attributes" -o table
supabase db query --linked "select e.extname, n.nspname from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'vector'" -o table
```

Verwacht op de live database (stand 2026-09-16): de eerste query geeft `0` (de tabel bestaat al, zie "Stand van uitvoering" bovenaan) en de tweede geeft een rij met `nspname = extensions`. Op een verse omgeving faalt de eerste query met `relation "product_attributes" does not exist` en geeft de tweede nul rijen; beide zijn goed. Geeft de tweede query `nspname = public`, vervang dan in de migratie hieronder `extensions.vector(512)` door `public.vector(512)`; `create extension if not exists` laat een bestaande extensie waar hij staat.

- [ ] **Stap 2: Schrijf de migratie**

Maak `supabase/migrations/20260914120000_product_attributes_fundament.sql`:

```sql
/*
  # product_attributes: fundament (dedupe, ruwe velden, schrijfweg voor de classifier)

  ## Probleem
  De engine leest rechtstreeks uit products. Die tabel heeft geen betrouwbare
  categorie (50.618 accessoires hebben een kledingwoord in de naam, gemeten
  2026-09-15), geen ontdubbeling (elke maat en kleur is een rij) en geen
  prijsband. Alles wat de engine nodig heeft en niet in de feed zit, werd op
  de client met regex afgeleid, op 1.000 van de 282.000 rijen.

  ## Wat deze migratie doet
  1. Zet pgvector aan (de kolom embedding blijft leeg tot plan 2).
  2. Maakt product_attributes, 1 op 1 met products.id, met alleen de kolommen
     die zonder taalmodel te vullen zijn: canonical_id, is_fashion, category,
     gender, price_band, plus classifier_version (welke versie van de
     productclassifier category en is_fashion heeft gezet; null = ruw uit
     de feed). De tagger-kolommen uit spec 5.1 komen in plan 2.
  3. normaliseer_productnaam: naam zonder maat- en kleursuffix.
  4. vul_product_attributes(p_retailer, p_merk_van, p_merk_tot): vult of
     ververst de tabel uit products en kiest per (retailer, image_url) de
     goedkoopste in-stock variant als canoniek (spec 5.1: dezelfde foto is
     dezelfde look in een andere maat of prijsvariant). Alleen als image_url
     leeg is, valt hij terug op (retailer, merk, genormaliseerde naam); dat
     is vandaag dode code (geen enkele rij heeft een lege image_url) en
     blijft staan voor een toekomstige feed zonder foto's. Idempotent. Per
     retailer en desnoods per merk-range te draaien als een run te lang
     duurt. Rijen met een classifier_version houden hun category en
     is_fashion.
  5. zet_classificatie(p_rijen, p_versie): schrijft category en is_fashion
     voor een batch rijen (jsonb) en zet classifier_version. Alleen voor
     service_role; dit is de schrijfweg van scripts/keten/classificeer-attributes.ts.

  ## RLS
  Lezen voor anon en authenticated. Schrijven alleen via service role
  (geen insert/update/delete-policies). vul_product_attributes en
  zet_classificatie zijn security definer en niet uitvoerbaar voor anon en
  authenticated.

  ## Terugdraaien
  drop function if exists zet_classificatie(jsonb, text);
  drop function if exists vul_product_attributes(text, text, text);
  drop function if exists normaliseer_productnaam(text);
  drop table if exists product_attributes;
*/

-- 1. pgvector. Supabase installeert extensies in het schema extensions.
create extension if not exists vector with schema extensions;

-- 2. Tabel
create table if not exists product_attributes (
  product_id         uuid primary key references products(id) on delete cascade,
  canonical_id       uuid not null,
  is_fashion         boolean not null default false,
  category           text check (category in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')),
  gender             text not null default 'unisex' check (gender in ('male', 'female', 'unisex')),
  price_band         text not null check (price_band in ('tot50', '50tot100', '100tot200', 'boven200')),
  classifier_version text,
  embedding          extensions.vector(512),
  tagged_at          timestamptz
);

create index if not exists idx_product_attributes_canonical
  on product_attributes (canonical_id);

create index if not exists idx_product_attributes_gender_category_band
  on product_attributes (gender, category, price_band);

-- Alleen canonieke, draagbare rijen worden door get_kandidaten gelezen.
create index if not exists idx_product_attributes_canoniek_fashion
  on product_attributes (product_id)
  where is_fashion and product_id = canonical_id;

alter table product_attributes enable row level security;

drop policy if exists "Iedereen kan product_attributes lezen" on product_attributes;
create policy "Iedereen kan product_attributes lezen"
  on product_attributes
  for select
  to anon, authenticated
  using (true);

-- 3. Naamnormalisatie: eerst het maatsuffix (staat achteraan), dan het
--    kleursuffix dat daarna achteraan staat. Voorbeelden uit de feed:
--    "PUMA Evostripe broek voor Heren, Grijs, Maat XXL"  -> "puma evostripe broek voor heren"
--    "PUMA Tackle L sneakers uniseks, Zwart/Goud, Maat 44,5" -> "puma tackle l sneakers uniseks"
--    "Jeans FRAME Woman color Blue" -> "jeans frame woman"
create or replace function normaliseer_productnaam(p_naam text)
returns text
language sql
immutable
strict
as $$
  select lower(btrim(
    regexp_replace(
      regexp_replace(
        regexp_replace(p_naam, ',\s*maat\s+.+$', '', 'i'),
        '\s+colou?r\s+[a-z]+\s*$', '', 'i'
      ),
      ',\s*(zwart|wit|grijs|navy|beige|camel|bruin|groen|rood|roze|blauw|geel|paars|oranje|multicolor|multi|ecru|creme|cream|off-?white|antraciet|anthracite|khaki|olijf|olive|bordeaux|donkerblauw|lichtblauw|black|white|grey|gray|blue|red|green|pink|brown|yellow|purple|orange)(\s*/\s*[a-z-]+)*\s*$', '', 'i'
    )
  ))
$$;

-- 4. Vulfunctie
create or replace function vul_product_attributes(
  p_retailer text default null,
  p_merk_van text default null,
  p_merk_tot text default null
)
returns table (verwerkt bigint, canoniek bigint)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  -- Woorden waarmee een rij ondanks een kledingcategorie geen kleding is
  -- (woonaccessoires, fan-merch, dierenkleding).
  niet_kleding constant text :=
    '\m(vaas|vazen|lamp|lampen|servies|bord|borden|beker|mok|mokken|kussen|kussens|kaars|kaarsen|poster|handdoek|handdoeken|deken|plaid|fotolijst|spiegel|speelgoed|knuffel|puzzel|sticker|telefoonhoesje|supporter|supporters|fanshirt|thuisshirt|uitshirt|matchworn|hondenjas|hondentuig|halsband|kattenmand)\M';
begin
  with basis as (
    select
      p.id,
      p.retailer,
      lower(coalesce(p.brand, '')) as merk,
      normaliseer_productnaam(p.name) as naam,
      p.in_stock,
      p.price,
      lower(coalesce(p.category, '')) as cat,
      lower(coalesce(p.gender, 'unisex')) as gen,
      p.is_kids,
      p.name as ruwe_naam,
      p.image_url
    from products p
    where (p_retailer is null or p.retailer = p_retailer)
      and (p_merk_van is null or lower(coalesce(p.brand, '')) >= p_merk_van)
      and (p_merk_tot is null or lower(coalesce(p.brand, '')) < p_merk_tot)
  ),
  gerangschikt as (
    select
      b.*,
      -- Dedupe op (retailer, image_url): dezelfde foto is dezelfde look in
      -- een andere maat of prijsvariant (spec 5.1, gemeten 16 september:
      -- 281.999 rijen, 100.849 unieke image_url's, geen enkele lege). De
      -- naam-terugval hierna is vandaag dode code (image_url is nooit leeg)
      -- en blijft staan voor een toekomstige feed zonder foto's.
      first_value(b.id) over (
        partition by b.retailer, coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam)
        order by (b.in_stock is true) desc, b.price asc, b.id asc
      ) as canonical_id
    from basis b
  )
  insert into product_attributes (product_id, canonical_id, is_fashion, category, gender, price_band)
  select
    g.id,
    g.canonical_id,
    (
      g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')
      and coalesce(g.is_kids, false) = false
      and g.ruwe_naam !~* niet_kleding
    ) as is_fashion,
    case
      when g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory') then g.cat
      else null
    end as category,
    case when g.gen in ('male', 'female') then g.gen else 'unisex' end as gender,
    case
      when g.price < 50 then 'tot50'
      when g.price < 100 then '50tot100'
      when g.price < 200 then '100tot200'
      else 'boven200'
    end as price_band
  from gerangschikt g
  on conflict (product_id) do update set
    canonical_id = excluded.canonical_id,
    gender       = excluded.gender,
    price_band   = excluded.price_band,
    -- Een rij die de classifier al heeft gezien, houdt die uitkomst.
    is_fashion   = case when product_attributes.classifier_version is null
                        then excluded.is_fashion else product_attributes.is_fashion end,
    category     = case when product_attributes.classifier_version is null
                        then excluded.category else product_attributes.category end;

  return query
    select
      count(*)::bigint,
      count(*) filter (where pa.product_id = pa.canonical_id)::bigint
    from product_attributes pa
    join products p on p.id = pa.product_id
    where (p_retailer is null or p.retailer = p_retailer)
      and (p_merk_van is null or lower(coalesce(p.brand, '')) >= p_merk_van)
      and (p_merk_tot is null or lower(coalesce(p.brand, '')) < p_merk_tot);
end;
$$;

-- 5. Schrijfweg voor het classificatiescript (taak 2).
--    p_rijen: jsonb-array van {product_id, category, is_fashion}.
--    category null = niet een van de zes; is_fashion wordt bovendien false
--    als products.is_kids waar is, wat de classifier ook zegt.
create or replace function zet_classificatie(p_rijen jsonb, p_versie text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  aantal bigint;
begin
  update product_attributes pa
  set
    category           = r.category,
    is_fashion         = (r.is_fashion and coalesce(p.is_kids, false) = false),
    classifier_version = p_versie
  from jsonb_to_recordset(p_rijen) as r(product_id uuid, category text, is_fashion boolean)
  join products p on p.id = r.product_id
  where pa.product_id = r.product_id;
  get diagnostics aantal = row_count;
  return aantal;
end;
$$;

revoke execute on function vul_product_attributes(text, text, text) from public, anon, authenticated;
revoke execute on function normaliseer_productnaam(text) from public, anon, authenticated;
revoke execute on function zet_classificatie(jsonb, text) from public, anon, authenticated;
grant execute on function zet_classificatie(jsonb, text) to service_role;
```

- [ ] **Stap 3: Pas de migratie toe**

```bash
supabase db query --linked -f supabase/migrations/20260914120000_product_attributes_fundament.sql
```

Verwacht: geen fout. De migratie is idempotent (`create table if not exists`, `create index if not exists`, `create or replace function`, `drop policy if exists` gevolgd door `create policy`); op de live database, waar hij al is toegepast, is opnieuw draaien veilig en verandert er niets.

- [ ] **Stap 4: Test de naamnormalisatie en de rechten**

```bash
supabase db query --linked "select normaliseer_productnaam('PUMA Evostripe broek voor Heren, Grijs, Maat XXL') as a, normaliseer_productnaam('PUMA Tackle L sneakers uniseks, Zwart/Goud, Maat 44,5') as b, normaliseer_productnaam('Jeans FRAME Woman color Blue') as c" -o table
supabase db query --linked "select has_function_privilege('anon', 'zet_classificatie(jsonb, text)', 'execute') as anon_mag, has_function_privilege('service_role', 'zet_classificatie(jsonb, text)', 'execute') as service_mag" -o table
```

Verwacht exact:

```
a: puma evostripe broek voor heren
b: puma tackle l sneakers uniseks
c: jeans frame woman
anon_mag: false, service_mag: true
```

- [ ] **Stap 5: Schrijf het vulscript**

Maak `scripts/keten/vul-attributes.sh` (en `chmod +x`). Op de live checkout staat dit bestand er al met de apostrof-verdubbeling voor de retailernaam; controleer dat met `diff` tegen dit blok. Ontbreekt alleen de verdubbeling voor `van_sql`/`tot_sql` (de merkgrens), vul die aan zodat het bestand gelijk is aan het blok hieronder, en ga dan door naar de `package.json`-regel onderaan deze stap.

```bash
#!/usr/bin/env bash
# Vult product_attributes per retailer via de Management API (supabase db query).
# De API heeft een tijdslimiet per query waarvan het getal niet in onze
# documentatie staat. Daarom: per retailer, en als een retailer op de limiet
# loopt, in vier merk-ranges. Idempotent: opnieuw draaien is veilig.
#
# Gebruik: scripts/keten/vul-attributes.sh            (alle retailers)
#          scripts/keten/vul-attributes.sh "H&M (NL)"  (een retailer)
set -u

RETAILERS=(
  "The New Originals (NL)"
  "OFM."
  "Mart Visser"
  "PUMA (EU) - USD"
  "H&M (NL)"
  "Giglio (INT)"
)
if [ $# -ge 1 ]; then RETAILERS=("$1"); fi

# Merk-ranges: lower(brand) >= van en < tot; de laatste range heeft geen bovengrens.
RANGES=("|g" "g|n" "n|t" "t|")

draai() {
  local sql="$1"
  supabase db query --linked "set statement_timeout = '15min'; $sql" -o table 2>&1 | grep -v "new version\|recommend updating"
}

for r in "${RETAILERS[@]}"; do
  echo "== $r =="
  # Verdubbel een apostrof in de retailernaam voor het SQL-stringliteral
  # (bv. "Levi's"); anders sluit de apostrof het literal voortijdig af.
  r_sql=${r//\'/\'\'}
  start=$(date +%s)
  uit=$(draai "select * from vul_product_attributes('$r_sql')")
  echo "$uit"
  if echo "$uit" | grep -qi "timeout\|canceling statement\|context deadline\|unexpected status 5"; then
    echo "-- tijdslimiet, opnieuw in vier merk-ranges"
    for range in "${RANGES[@]}"; do
      van="${range%%|*}"; tot="${range##*|}"
      # Zelfde verdubbeling voor de merkgrens; de ranges hierboven zijn
      # letters zonder apostrof, maar een handmatige aanroep met een
      # merknaam als grens mag niet stilzwijgend breken.
      van_sql=$([ -z "$van" ] && echo "null" || echo "'${van//\'/\'\'}'")
      tot_sql=$([ -z "$tot" ] && echo "null" || echo "'${tot//\'/\'\'}'")
      echo "-- range [$van, $tot)"
      draai "select * from vul_product_attributes('$r_sql', $van_sql, $tot_sql)"
    done
  fi
  echo "-- duur: $(( $(date +%s) - start )) s"
done
```

Voeg in `package.json` in het blok `"scripts"`, na de regel `"design:check:ci": "node scripts/check-design-compliance.mjs --strict",`, toe:

```json
    "keten:vul": "bash scripts/keten/vul-attributes.sh",
```

- [ ] **Stap 6: Vul de tabel, klein naar groot, en meet**

```bash
npm run keten:vul
```

Verwacht per retailer: `verwerkt` gelijk aan het aantal rijen uit de tabel onder "Controle vooraf" (19, 2.973, 6.847, 14.420, 88.043, 169.697), `canoniek` kleiner dan of gelijk aan `verwerkt`, en een regel `-- duur: N s`. Noteer de duur van H&M en Giglio in het commitbericht van deze taak; dat is de eerste meting voor dit soort runs. Loopt Giglio ook per merk-range op de limiet, deel dan de RANGES-array in het script verder op (bijvoorbeeld acht ranges: `|d`, `d|g`, `g|j`, `j|m`, `m|p`, `p|s`, `s|v`, `v|`) en draai `npm run keten:vul "Giglio (INT)"` opnieuw; de functie is idempotent.

- [ ] **Stap 7: Controle achteraf**

```bash
supabase db query --linked "select count(*) as totaal, count(*) filter (where product_id = canonical_id) as canoniek, count(*) filter (where is_fashion) as fashion, count(*) filter (where is_fashion and product_id = canonical_id) as bruikbaar, count(*) filter (where classifier_version is not null) as geclassificeerd from product_attributes" -o table
supabase db query --linked "select p.retailer, count(*) filter (where pa.product_id = pa.canonical_id) as canoniek from product_attributes pa join products p on p.id = pa.product_id group by 1 order by 1" -o table
supabase db query --linked "select gender, category, price_band, count(*) from product_attributes where is_fashion and product_id = canonical_id group by 1,2,3 order by 1,2,3" -o table
supabase db query --linked "select count(*) from product_attributes pa join products p on p.id = pa.product_id where p.retailer = 'H&M (NL)'" -o table
supabase db query --linked "select count(*) as accessory_met_kledingnaam from product_attributes pa join products p on p.id = pa.product_id where pa.category = 'accessory' and p.name ~* '(shirt|top|blouse|jurk|dress|broek|jeans|trui|sweater)'" -o table
```

Verwacht: `totaal = 281999`; `canoniek = 100849` (spec 5.1, gemeten op de foto-dedupe van 16 september); per retailer uit de tweede query: Giglio (INT) 68.739, H&M (NL) 24.815, PUMA (EU) - USD 4.143, Mart Visser 1.009, OFM. 2.125, The New Originals (NL) 18; `bruikbaar` groter dan 0; `geclassificeerd = 0` (dat komt in taak 2); de dekkingsmatrix heeft rijen voor `male` en `female` in alle zes categorieen; de vierde query geeft `88043` (H&M zit nu in de pool, spec 2); de vijfde query geeft ongeveer 50.618 (minus rijen met `is_kids` of een niet-kledingwoord). Dat laatste getal is de nulmeting voor taak 2: schrijf het op.

- [ ] **Stap 8: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add supabase/migrations/20260914120000_product_attributes_fundament.sql scripts/keten/vul-attributes.sh package.json
git commit -m "feat: product_attributes met dedupe, ruwe velden en schrijfweg voor de classifier

Vulduur gemeten: H&M <N> s, Giglio <N> s (of per merk-range).

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(Vul de gemeten seconden in voordat je commit.)

---

### Taak 2: Classificatie in de database met de bestaande productclassifier

**Bestanden:**
- Aanmaken: `src/services/attributes/classificatie.ts`, `scripts/keten/classificeer-attributes.ts`
- Wijzigen: `package.json` (blok `"scripts"`)
- Test: `src/services/attributes/__tests__/classificatie.test.ts`, controle-queries via `supabase db query --linked`

**Interfaces:**
- Gebruikt: `classifyProduct(product: Product): { category: ProductCategory; rejected: boolean; reason?: string }` uit `@/engine/productClassifier` (ongewijzigd); functie `zet_classificatie(p_rijen jsonb, p_versie text)` uit taak 1; `createClient` uit `@supabase/supabase-js`.
- Levert:
  - `const CLASSIFIER_VERSIE = "productClassifier-2026-09"`
  - `type AttribuutCategorie = 'top' | 'bottom' | 'footwear' | 'outerwear' | 'dress' | 'accessory'`
  - `interface ClassificatieRij { product_id: string; category: AttribuutCategorie | null; is_fashion: boolean }`
  - `classificeerRij(rij: { id: string; name: string | null; description?: string | null; category?: string | null; type?: string | null; is_kids?: boolean | null }): ClassificatieRij`
  - npm-script `keten:classificeer`

Waarom deze taak bestaat: de roast van dit plan wees erop dat `reclassifyProducts` op de client pas draait nadat de RPC al maximaal N rijen per (ruwe) categorie heeft teruggegeven. Een verkeerd gelabelde top in de opgeblazen accessory-emmer komt dan nooit als top bij de engine. De classifier staat al deterministisch in de repo (`src/engine/productClassifier.ts`); hij draait hier een keer over alle rijen en schrijft zijn uitkomst in `product_attributes`, zodat de emmers in taak 3 op de gecorrigeerde categorie werken.

Wat de spec openlaat en hier is besloten:
- Er komt geen SQL-vertaling van de classifier. Dat zou een tweede kopie van 150 regexes zijn (de repo heeft er al twee: `src/engine/` en `supabase/functions/_shared/`), met afwijkingen tussen JavaScript- en Postgres-regexsyntaxis. Het script importeert de TypeScript-functie zelf; database en client gebruiken dus letterlijk dezelfde code.
- `jumpsuit`, `skirt` als aparte waarde, `underwear`, `other` en alles wat de classifier afwijst geven `category = null` en `is_fashion = false` (spec 5.1: "anders is_fashion false"). De classifier zet rokken zelf al in `bottom`.
- Bekende beperking, uit de audit: een naam als "Top ELISABETTA FRANCHI Woman color Quartz" matcht in de classifier op geen enkele naamregel en valt terug op de ruwe categorie in de beschrijvingstekst. Die rijen blijven `accessory`. Plan 2 (LLM-tagging) lost dat op; dit plan verandert de classifier niet (spec 7).
- Het script draait met de service role omdat `zet_classificatie` alleen voor `service_role` uitvoerbaar is. De sleutel komt uit de shell, nooit uit `.env`.

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/services/attributes/__tests__/classificatie.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CLASSIFIER_VERSIE, classificeerRij } from "../classificatie";

describe("classificeerRij", () => {
  it("zet een shirt dat in de feed accessory heet op top", () => {
    const r = classificeerRij({ id: "p1", name: "Shirt FAY Men color Blue", category: "accessory" });
    expect(r).toEqual({ product_id: "p1", category: "top", is_fashion: true });
  });

  it("zet een sneaker met category bottom op footwear", () => {
    const r = classificeerRij({ id: "p2", name: "PUMA Tackle L sneakers uniseks", category: "bottom" });
    expect(r.category).toBe("footwear");
    expect(r.is_fashion).toBe(true);
  });

  it("wijst kinderkleding af, ook als de categorie klopt", () => {
    const r = classificeerRij({ id: "p3", name: "Kinder hoodie met capuchon", category: "top" });
    expect(r).toEqual({ product_id: "p3", category: null, is_fashion: false });
  });

  it("wijst af als products.is_kids waar is, wat de naam ook zegt", () => {
    const r = classificeerRij({ id: "p4", name: "Basic hoodie", category: "top", is_kids: true });
    expect(r).toEqual({ product_id: "p4", category: null, is_fashion: false });
  });

  it("geeft jumpsuit en ondergoed geen van de zes categorieen", () => {
    expect(classificeerRij({ id: "p5", name: "Denim jumpsuit", category: "dress" })).toEqual({
      product_id: "p5",
      category: null,
      is_fashion: false,
    });
    expect(classificeerRij({ id: "p6", name: "Boxershorts 3-pack", category: "bottom" }).is_fashion).toBe(false);
  });

  it("houdt een goed gelabelde rij zoals hij is", () => {
    const r = classificeerRij({ id: "p7", name: "Slim fit jeans", category: "bottom" });
    expect(r).toEqual({ product_id: "p7", category: "bottom", is_fashion: true });
  });

  it("heeft een vaste versiestring", () => {
    expect(CLASSIFIER_VERSIE).toBe("productClassifier-2026-09");
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/services/attributes/__tests__/classificatie.test.ts
```

Verwacht: `Failed to resolve import "../classificatie"`.

- [ ] **Stap 3: Implementeer de pure functie**

Maak `src/services/attributes/classificatie.ts`:

```ts
import { classifyProduct } from "@/engine/productClassifier";
import type { Product } from "@/engine/types";

/**
 * Versie van de classificatie in product_attributes.classifier_version.
 * Verhoog deze string als productClassifier.ts verandert, en draai
 * scripts/keten/classificeer-attributes.ts opnieuw.
 */
export const CLASSIFIER_VERSIE = "productClassifier-2026-09";

export type AttribuutCategorie = "top" | "bottom" | "footwear" | "outerwear" | "dress" | "accessory";

const ZES: readonly AttribuutCategorie[] = ["top", "bottom", "footwear", "outerwear", "dress", "accessory"];

export interface ClassificatieRij {
  product_id: string;
  category: AttribuutCategorie | null;
  is_fashion: boolean;
}

export interface ProductBron {
  id: string;
  name: string | null;
  description?: string | null;
  category?: string | null;
  type?: string | null;
  is_kids?: boolean | null;
}

/**
 * Van een products-rij naar wat product_attributes over category en
 * is_fashion moet zeggen. Dezelfde classifier als de engine op de client,
 * zodat de database en de client nooit van mening verschillen.
 */
export function classificeerRij(rij: ProductBron): ClassificatieRij {
  if (rij.is_kids === true) {
    return { product_id: rij.id, category: null, is_fashion: false };
  }
  const product: Product = {
    id: rij.id,
    name: rij.name ?? "",
    description: rij.description ?? undefined,
    category: rij.category ?? undefined,
    type: rij.type ?? undefined,
  } as Product;
  const uitkomst = classifyProduct(product);
  if (uitkomst.rejected) {
    return { product_id: rij.id, category: null, is_fashion: false };
  }
  const cat = String(uitkomst.category) as AttribuutCategorie;
  if (!ZES.includes(cat)) {
    return { product_id: rij.id, category: null, is_fashion: false };
  }
  return { product_id: rij.id, category: cat, is_fashion: true };
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

```bash
npx vitest run src/services/attributes/__tests__/classificatie.test.ts
```

Verwacht: `Tests  7 passed (7)`. De classifier logt `[classifier:low-confidence]`-regels naar de console; dat is bestaand gedrag en geen fout.

- [ ] **Stap 5: Schrijf het script**

Maak `scripts/keten/classificeer-attributes.ts`:

```ts
/**
 * Schrijft de uitkomst van src/engine/productClassifier.ts naar
 * product_attributes (category, is_fashion, classifier_version), zodat
 * get_kandidaten per gecorrigeerde categorie afkapt en niet per ruwe.
 *
 * Leest products in pagina's van 1.000 (PostgREST-maximum), classificeert
 * lokaal en schrijft per 1.000 rijen via de RPC zet_classificatie
 * (alleen service_role). Idempotent: opnieuw draaien overschrijft met
 * dezelfde uitkomst.
 *
 * Gebruik:
 *   SUPABASE_SERVICE_ROLE_KEY=... npm run keten:classificeer
 *   SUPABASE_SERVICE_ROLE_KEY=... npm run keten:classificeer -- --retailer "H&M (NL)"
 * VITE_SUPABASE_URL komt uit de shell of uit .env. De service-role-sleutel
 * komt alleen uit de shell en wordt nooit gelogd.
 */
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { CLASSIFIER_VERSIE, classificeerRij, type ClassificatieRij } from "../../src/services/attributes/classificatie";

function leesDotEnv(): Record<string, string> {
  const pad = new URL("../../.env", import.meta.url).pathname;
  if (!existsSync(pad)) return {};
  const uit: Record<string, string> = {};
  for (const regel of readFileSync(pad, "utf8").split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) uit[m[1]] = m[2];
  }
  return uit;
}

const dotenv = leesDotEnv();
const url = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Zet VITE_SUPABASE_URL (shell of .env) en SUPABASE_SERVICE_ROLE_KEY (alleen shell) in je omgeving."
  );
  process.exit(1);
}

const argRetailer = (() => {
  const i = process.argv.indexOf("--retailer");
  return i >= 0 ? process.argv[i + 1] : null;
})();

const PAGINA = 1000;
const client = createClient(url, serviceKey, { auth: { persistSession: false } });

interface ProductRij {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  type: string | null;
  is_kids: boolean | null;
  retailer: string | null;
}

async function main(): Promise<void> {
  // De classifier logt elke lage-confidence-rij naar console.warn; op 282.000
  // rijen is dat ruis. Tijdelijk dempen, tellen doen we zelf.
  const oorspronkelijkWarn = console.warn;
  const oorspronkelijkLog = console.log;
  console.warn = () => {};

  let gelezen = 0;
  let geschreven = 0;
  let laatsteId: string | null = null;
  const perUitkomst: Record<string, number> = {};
  const gewijzigd: Record<string, number> = {};
  const start = Date.now();

  for (;;) {
    let query = client
      .from("products")
      .select("id, name, description, category, type, is_kids, retailer")
      .order("id", { ascending: true })
      .limit(PAGINA);
    if (laatsteId) query = query.gt("id", laatsteId);
    if (argRetailer) query = query.eq("retailer", argRetailer);

    const { data, error } = await query;
    if (error) throw new Error(`lezen van products faalde: ${error.message}`);
    const rijen = (data ?? []) as ProductRij[];
    if (rijen.length === 0) break;

    const batch: ClassificatieRij[] = rijen.map((r) => {
      const uit = classificeerRij(r);
      const sleutel = uit.category ?? (uit.is_fashion ? "onbekend" : "afgewezen");
      perUitkomst[sleutel] = (perUitkomst[sleutel] ?? 0) + 1;
      const ruw = (r.category ?? "").toLowerCase();
      if (uit.category && uit.category !== ruw) {
        const k = `${ruw || "leeg"} -> ${uit.category}`;
        gewijzigd[k] = (gewijzigd[k] ?? 0) + 1;
      }
      return uit;
    });

    const { data: aantal, error: schrijfFout } = await client.rpc("zet_classificatie", {
      p_rijen: batch,
      p_versie: CLASSIFIER_VERSIE,
    });
    if (schrijfFout) throw new Error(`zet_classificatie faalde: ${schrijfFout.message}`);

    gelezen += rijen.length;
    geschreven += Number(aantal ?? 0);
    laatsteId = rijen[rijen.length - 1].id;

    if (gelezen % 20000 === 0) {
      oorspronkelijkLog(`  ${gelezen} gelezen, ${geschreven} geschreven, ${Math.round((Date.now() - start) / 1000)} s`);
    }
    if (rijen.length < PAGINA) break;
  }

  console.warn = oorspronkelijkWarn;
  oorspronkelijkLog(`\nKlaar: ${gelezen} gelezen, ${geschreven} geschreven in ${Math.round((Date.now() - start) / 1000)} s`);
  oorspronkelijkLog("Uitkomst per categorie:", perUitkomst);
  oorspronkelijkLog("Gewijzigd ten opzichte van products.category (top 15):");
  Object.entries(gewijzigd)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([k, v]) => oorspronkelijkLog(`  ${k.padEnd(24)} ${v}`));

  if (geschreven < gelezen) {
    oorspronkelijkLog(
      `\nLet op: ${gelezen - geschreven} rijen niet geschreven. Meestal: product_attributes mist die rijen (draai eerst npm run keten:vul).`
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Script gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
```

Voeg in `package.json` in het blok `"scripts"`, na de regel `"keten:vul": "bash scripts/keten/vul-attributes.sh",`, toe:

```json
    "keten:classificeer": "vite-node scripts/keten/classificeer-attributes.ts",
```

- [ ] **Stap 6: Draai het script, eerst op de kleinste retailer**

```bash
export SUPABASE_SERVICE_ROLE_KEY="$(supabase projects api-keys --project-ref "$(cat supabase/.temp/project-ref)" | awk -F'|' '$1 ~ /service_role/ {gsub(/ /,"",$2); print $2}')"
npm run keten:classificeer -- --retailer "The New Originals (NL)"
```

Verwacht: `Klaar: 19 gelezen, 19 geschreven`. Controleer:

```bash
supabase db query --linked "select pa.category, pa.is_fashion, pa.classifier_version, p.name from product_attributes pa join products p on p.id = pa.product_id where p.retailer = 'The New Originals (NL)' order by p.name" -o table
```

Verwacht: alle 19 rijen hebben `classifier_version = productClassifier-2026-09` en een categorie die bij de naam past (lees ze; het zijn er 19).

Dan alles:

```bash
npm run keten:classificeer
unset SUPABASE_SERVICE_ROLE_KEY
```

Verwacht: `Klaar: 281999 gelezen, 281999 geschreven in N s` en de tabel met wijzigingen, waarin `accessory -> top` en `accessory -> bottom` bovenaan staan.

- [ ] **Stap 7: Controle achteraf en stopregel 1**

```bash
supabase db query --linked "select count(*) filter (where classifier_version is not null) as geclassificeerd, count(*) filter (where is_fashion and product_id = canonical_id) as bruikbaar from product_attributes" -o table
supabase db query --linked "select count(*) as accessory_met_kledingnaam from product_attributes pa join products p on p.id = pa.product_id where pa.category = 'accessory' and p.name ~* '(shirt|top|blouse|jurk|dress|broek|jeans|trui|sweater)'" -o table
supabase db query --linked "select gender, category, count(*) from product_attributes where is_fashion and product_id = canonical_id and gender in ('male','female') group by 1,2 order by 1,2" -o table
supabase db query --linked "select pa.category, p.name from product_attributes pa join products p on p.id = pa.product_id where pa.is_fashion and pa.product_id = pa.canonical_id and pa.category = 'top' order by random() limit 20" -o table
```

Verwacht: `geclassificeerd = 281999`; de tweede query is veel lager dan de nulmeting uit taak 1 stap 7 (de rest zijn namen als "Top ..." die op geen naamregel matchen, en echte accessoires met "shirt" in de beschrijving); in de derde query is `top` voor `male` en voor `female` minstens de helft van `accessory` (stopregel 1); de steekproef van 20 tops bevat geen schoenen, tassen of broeken. Noteer de drie getallen in het commitbericht.

- [ ] **Stap 8: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add src/services/attributes/classificatie.ts src/services/attributes/__tests__/classificatie.test.ts scripts/keten/classificeer-attributes.ts package.json
git commit -m "feat: productclassifier over de hele catalogus naar product_attributes

Accessoires met kledingnaam: <nulmeting> -> <na>. Bruikbaar: <N>. Duur: <N> s.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 3: RPC `get_kandidaten` zonder tags, op de gecorrigeerde categorie

**Bestanden:**
- Aanmaken: `supabase/migrations/20260914120100_get_kandidaten.sql`
- Test: controle-queries via `supabase db query --linked`; de live vitest-test volgt in taak 6

**Interfaces:**
- Gebruikt: `product_attributes` (met de categorie uit taak 2) en `products` uit taak 1.
- Levert: `get_kandidaten(p_gender text, p_occasions text[], p_budget_min int, p_budget_max int, p_axes jsonb, p_liked_ids uuid[], p_disliked_ids uuid[], p_per_category int default 12) returns table (product_id uuid, category text, score real, attrs jsonb, product jsonb)`. `product` is de volledige `products`-rij als jsonb (kolomnamen van de tabel, dus `image_url`, `affiliate_url`, `in_stock`). `category` en `attrs.category` zijn de categorie uit `product_attributes`, niet `products.category`.

Wat de spec openlaat en hier is besloten:
- Bij `p_gender = 'unisex'` (non-binary, prefer-not-to-say) vervalt het genderfilter. Letterlijk `gender in ('unisex', 'unisex')` zou die bezoekers alleen unisex-producten geven, en dat zijn vooral accessoires. Engine v2 doet hetzelfde in `matchesGender`.
- `p_occasions`, `p_axes` en `p_liked_ids` worden aangenomen maar nog niet gebruikt. Score is `0` voor iedereen. De volgorde is: afstand van de prijs tot het midden van het budget, daarna `product_id`.
- `attrs` bevat ook `classifier_version`, zodat de client kan zien of een rij door de classifier is gegaan.

- [ ] **Stap 1: Controle vooraf, verwacht een fout**

```bash
supabase db query --linked "select count(*) from get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12)" -o table
```

Verwacht: een fout met `function get_kandidaten(...) does not exist`.

- [ ] **Stap 2: Schrijf de migratie**

Maak `supabase/migrations/20260914120100_get_kandidaten.sql`:

```sql
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
```

- [ ] **Stap 3: Pas de migratie toe**

```bash
supabase db query --linked -f supabase/migrations/20260914120100_get_kandidaten.sql
```

Verwacht: geen fout.

- [ ] **Stap 4: Controle achteraf: filters, aantallen, determinisme, categorie**

```bash
supabase db query --linked "select category, count(*), min((product->>'price')::numeric) as min_prijs, max((product->>'price')::numeric) as max_prijs from get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12) group by 1 order by 1" -o table
```

Verwacht: maximaal zes rijen (een per categorie), elke `count` kleiner dan of gelijk aan 12, `min_prijs >= 50` en `max_prijs <= 150`.

```bash
supabase db query --linked "select count(*) filter (where (product->>'gender') not in ('male','unisex')) as fout_gender, count(*) filter (where (product->>'in_stock')::boolean = false) as fout_voorraad, count(*) filter (where (attrs->>'is_fashion')::boolean = false) as fout_fashion, count(*) filter (where attrs->>'classifier_version' is null) as zonder_classifier from get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 40)" -o table
```

Verwacht: `fout_gender = 0`, `fout_voorraad = 0`, `fout_fashion = 0`, `zonder_classifier = 0`.

```bash
supabase db query --linked "select category, count(*) filter (where category <> lower(product->>'category')) as anders_dan_feed, count(*) as totaal from get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 40) group by 1 order by 1" -o table
```

Verwacht: een tabel waarin `anders_dan_feed` voor `top` en `bottom` groter dan 0 mag zijn (dat is precies wat taak 2 moest bereiken: rijen die in de feed accessory heetten, zitten nu in de juiste emmer). Noteer de getallen.

```bash
supabase db query --linked "with a as (select product_id, row_number() over () as n from get_kandidaten('female', array['date'], 25, 100, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12)), b as (select product_id, row_number() over () as n from get_kandidaten('female', array['date'], 25, 100, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12)) select count(*) as verschillen from a full join b using (n) where a.product_id is distinct from b.product_id" -o table
```

Verwacht: `verschillen = 0` (twee aanroepen geven dezelfde rijen in dezelfde volgorde).

```bash
supabase db query --linked "select count(*) from get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], (select array_agg(product_id) from (select product_id from get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 1)) x), 1) k where k.product_id in (select product_id from get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 1))" -o table
```

Verwacht: `0` (een id in `p_disliked_ids` komt niet terug).

- [ ] **Stap 5: Controle als anon via REST**

```bash
set -a; source .env; set +a
curl -s -X POST "$VITE_SUPABASE_URL/rest/v1/rpc/get_kandidaten" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"p_gender":"male","p_occasions":["work"],"p_budget_min":50,"p_budget_max":150,"p_axes":{},"p_liked_ids":[],"p_disliked_ids":[],"p_per_category":2}' \
  | head -c 600; echo
```

Verwacht: een JSON-array met rijen die `product_id`, `category`, `score: 0`, `attrs` en `product` bevatten. Geen `permission denied`.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add supabase/migrations/20260914120100_get_kandidaten.sql
git commit -m "feat: rpc get_kandidaten zonder tags, deterministisch op prijsafstand, op de gecorrigeerde categorie

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 4: Tabel `outfit_ratings` en view `weekly_ratings`

**Bestanden:**
- Aanmaken: `supabase/migrations/20260914120200_outfit_ratings.sql`
- Test: REST-aanroepen als anon en controle-queries

**Interfaces:**
- Levert: tabel `outfit_ratings(id uuid, profile_hash text, outfit_key text, rating text, session_id text, user_id uuid null, created_at timestamptz)`; view `weekly_ratings(week_start date, iso_jaar int, iso_week int, profielen bigint, pct_zou_dragen numeric, pct_nooit numeric, beoordeeld_per_profiel numeric)`.

Wat de spec openlaat en hier is besloten:
- Een bezoeker mag van mening veranderen. Omdat update verboden is, komt er dan een tweede rij. De view telt per (profile_hash, session_id, outfit_key) alleen de laatste rij.
- `profile_hash` en `outfit_key` zijn sha256-hex (64 tekens); de check-constraint dwingt dat af zodat de tabel niet vervuilt.
- Geen select-policy voor anon of authenticated. De view heeft `security_invoker = true` en levert dus alleen rijen aan de tabeleigenaar (de SQL-editor, `supabase db query --linked`) en de service role. Dat is wie de meting leest.

- [ ] **Stap 1: Controle vooraf, verwacht een fout**

```bash
supabase db query --linked "select * from weekly_ratings" -o table
```

Verwacht: een fout met `relation "weekly_ratings" does not exist`.

- [ ] **Stap 2: Schrijf de migratie**

Maak `supabase/migrations/20260914120200_outfit_ratings.sql`:

```sql
/*
  # outfit_ratings en weekly_ratings (spec 5.6)

  ## Probleem
  Niets wordt gemeten. results_feedback heeft twee rijen ooit en schrijft
  alleen voor ingelogde gebruikers. Het stuurcijfer uit de spec is "zou ik
  dragen" per outfit, doel vier van de zes.

  ## Wat deze migratie doet
  1. outfit_ratings: een rij per beoordeling. profile_hash is de sha256 van
     de quiz-antwoorden, outfit_key de sha256 van de gesorteerde product-ids.
  2. RLS: anon en authenticated mogen invoegen met een session_id; niemand
     mag lezen, wijzigen of verwijderen via de API. De meting wordt gelezen
     als tabeleigenaar of service role.
  3. weekly_ratings: per ISO-week het aantal profielen, het percentage
     zou_dragen, het percentage nooit en het gemiddeld aantal beoordeelde
     outfits per profiel. Van mening veranderen geeft een tweede rij; de
     view telt per (profile_hash, session_id, outfit_key) de laatste.

  ## Terugdraaien
  drop view if exists weekly_ratings;
  drop table if exists outfit_ratings;
*/

create table if not exists outfit_ratings (
  id           uuid primary key default gen_random_uuid(),
  profile_hash text not null check (profile_hash ~ '^[0-9a-f]{64}$'),
  outfit_key   text not null check (outfit_key ~ '^[0-9a-f]{64}$'),
  rating       text not null check (rating in ('zou_dragen', 'nooit')),
  session_id   text not null check (length(session_id) between 8 and 128),
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_outfit_ratings_profile_hash on outfit_ratings (profile_hash);
create index if not exists idx_outfit_ratings_created_at on outfit_ratings (created_at);

alter table outfit_ratings enable row level security;

drop policy if exists "Bezoekers mogen een beoordeling insturen" on outfit_ratings;
create policy "Bezoekers mogen een beoordeling insturen"
  on outfit_ratings
  for insert
  to anon, authenticated
  with check (
    session_id is not null
    and (user_id is null or user_id = auth.uid())
  );

-- Bewust geen select-, update- of delete-policy.

drop view if exists weekly_ratings;
create view weekly_ratings
with (security_invoker = true) as
with laatste as (
  select distinct on (profile_hash, session_id, outfit_key)
    profile_hash,
    session_id,
    outfit_key,
    rating,
    created_at
  from outfit_ratings
  order by profile_hash, session_id, outfit_key, created_at desc
)
select
  date_trunc('week', l.created_at)::date as week_start,
  extract(isoyear from date_trunc('week', l.created_at))::int as iso_jaar,
  extract(week from date_trunc('week', l.created_at))::int as iso_week,
  count(distinct l.profile_hash) as profielen,
  round(100.0 * count(*) filter (where l.rating = 'zou_dragen') / count(*), 1) as pct_zou_dragen,
  round(100.0 * count(*) filter (where l.rating = 'nooit') / count(*), 1) as pct_nooit,
  round(count(*)::numeric / count(distinct l.profile_hash), 2) as beoordeeld_per_profiel
from laatste l
group by 1, 2, 3
order by 1 desc;
```

- [ ] **Stap 3: Pas de migratie toe**

```bash
supabase db query --linked -f supabase/migrations/20260914120200_outfit_ratings.sql
```

Verwacht: geen fout.

- [ ] **Stap 4: Test als anon: insert slaagt, lezen en wijzigen niet**

```bash
set -a; source .env; set +a
H=$(printf 'a%.0s' $(seq 1 64)); K=$(printf 'b%.0s' $(seq 1 64))
curl -s -o /dev/null -w "insert: %{http_code}\n" -X POST "$VITE_SUPABASE_URL/rest/v1/outfit_ratings" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d "{\"profile_hash\":\"$H\",\"outfit_key\":\"$K\",\"rating\":\"zou_dragen\",\"session_id\":\"test-sessie-plan1\"}"
curl -s -o /dev/null -w "insert nooit: %{http_code}\n" -X POST "$VITE_SUPABASE_URL/rest/v1/outfit_ratings" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d "{\"profile_hash\":\"$H\",\"outfit_key\":\"$K\",\"rating\":\"nooit\",\"session_id\":\"test-sessie-plan1\"}"
curl -s -w "\nselect: %{http_code}\n" "$VITE_SUPABASE_URL/rest/v1/outfit_ratings?select=id" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
curl -s -o /dev/null -w "insert zonder session: %{http_code}\n" -X POST "$VITE_SUPABASE_URL/rest/v1/outfit_ratings" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d "{\"profile_hash\":\"$H\",\"outfit_key\":\"$K\",\"rating\":\"nooit\"}"
```

Verwacht: `insert: 201`, `insert nooit: 201`, `select` geeft `[]` met `200` (geen rijen zichtbaar), `insert zonder session: 400` (not-null-constraint).

- [ ] **Stap 5: Test de view en ruim de testrijen op**

```bash
supabase db query --linked "select * from weekly_ratings" -o table
```

Verwacht: een rij voor deze week met `profielen = 1`, `pct_zou_dragen = 0.0`, `pct_nooit = 100.0` (de laatste van de twee testrijen telt), `beoordeeld_per_profiel = 1.00`.

```bash
supabase db query --linked "delete from outfit_ratings where session_id = 'test-sessie-plan1'"
supabase db query --linked "select count(*) from outfit_ratings" -o table
```

Verwacht: `0`.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add supabase/migrations/20260914120200_outfit_ratings.sql
git commit -m "feat: outfit_ratings met anonieme insert en view weekly_ratings

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 5: Stabiele JSON, sha256 en seed

**Bestanden:**
- Aanmaken: `src/utils/stableJson.ts`, `src/services/outfits/answersSeed.ts`
- Wijzigen: `src/utils/hash.ts` (bestaat al, 5 regels, exporteert `hashString`; `src/utils/image.ts` regel 1 importeert die en blijft ongewijzigd werken)
- Test: `src/utils/__tests__/stableJson.test.ts`, `src/utils/__tests__/hash.test.ts`, `src/services/outfits/__tests__/answersSeed.test.ts`

**Interfaces:**
- Gebruikt: `hashString(input: string): number` uit het bestaande `src/utils/hash.ts` (FNV-1a 32 bits: offset 2166136261, prime 16777619).
- Levert: `stableStringify(value: unknown): string`; `sha256Hex(input: string): Promise<string>`; `fnv1a32(input: string): number` (zelfde uitkomst als `hashString`, onder de naam die de rest van dit plan gebruikt); `seedFromAnswers(answers: Record<string, any>): number`.

Wat de repo al had en hier is besloten:
- `hashString` in `src/utils/hash.ts` is al een FNV-1a. Het bestand wordt niet overschreven: `hashString` blijft staan voor `image.ts`, en `fnv1a32` roept hem aan zodat er een implementatie is. De testvectoren hieronder bewijzen dat het inderdaad FNV-1a is.

- [ ] **Stap 1: Schrijf de falende tests**

Maak `src/utils/__tests__/stableJson.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { stableStringify } from "../stableJson";

describe("stableStringify", () => {
  it("sorteert sleutels op elk niveau", () => {
    const a = stableStringify({ b: 1, a: { d: 2, c: 3 } });
    const b = stableStringify({ a: { c: 3, d: 2 }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it("laat de volgorde van arrays staan", () => {
    expect(stableStringify({ x: [3, 1, 2] })).toBe('{"x":[3,1,2]}');
  });

  it("slaat undefined-waarden over, net als JSON.stringify", () => {
    expect(stableStringify({ a: undefined, b: null })).toBe('{"b":null}');
  });
});
```

Maak `src/utils/__tests__/hash.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fnv1a32, sha256Hex } from "../hash";

describe("sha256Hex", () => {
  it("geeft de bekende testvectoren", async () => {
    expect(await sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});

describe("fnv1a32", () => {
  it("geeft de bekende testvectoren", () => {
    expect(fnv1a32("")).toBe(0x811c9dc5);
    expect(fnv1a32("a")).toBe(0xe40c292c);
  });

  it("is een 32-bits getal zonder teken", () => {
    const h = fnv1a32("FitFi");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});
```

Maak `src/services/outfits/__tests__/answersSeed.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { seedFromAnswers } from "../answersSeed";

describe("seedFromAnswers", () => {
  it("geeft dezelfde seed voor dezelfde antwoorden in andere sleutelvolgorde", () => {
    const a = seedFromAnswers({ gender: "male", occasions: ["work"], budget: { min: 50, max: 150 } });
    const b = seedFromAnswers({ budget: { max: 150, min: 50 }, occasions: ["work"], gender: "male" });
    expect(a).toBe(b);
  });

  it("geeft een andere seed als een antwoord verandert", () => {
    const a = seedFromAnswers({ gender: "male", occasions: ["work"] });
    const b = seedFromAnswers({ gender: "male", occasions: ["casual"] });
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
npx vitest run src/utils/__tests__/stableJson.test.ts src/utils/__tests__/hash.test.ts src/services/outfits/__tests__/answersSeed.test.ts
```

Verwacht: `stableJson.test.ts` en `answersSeed.test.ts` falen met `Failed to resolve import "../stableJson"` en `Failed to resolve import "../answersSeed"`. `hash.test.ts` laadt wel (het bestand bestaat) en faalt met `TypeError: sha256Hex is not a function` en `TypeError: fnv1a32 is not a function`, omdat die exports er nog niet zijn.

- [ ] **Stap 3: Implementeer**

Maak `src/utils/stableJson.ts`:

```ts
/**
 * JSON met gesorteerde sleutels op elk niveau. Twee objecten met dezelfde
 * inhoud geven dezelfde string, ongeacht de volgorde waarin de sleutels zijn
 * gezet. Basis voor de profile-hash (outfit_ratings) en de engine-seed.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sorteer(value));
}

function sorteer(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorteer);
  if (value && typeof value === "object") {
    const bron = value as Record<string, unknown>;
    const uit: Record<string, unknown> = {};
    for (const sleutel of Object.keys(bron).sort()) {
      if (bron[sleutel] === undefined) continue;
      uit[sleutel] = sorteer(bron[sleutel]);
    }
    return uit;
  }
  return value;
}
```

Vervang de volledige inhoud van het bestaande `src/utils/hash.ts` (nu alleen `hashString`) door:

```ts
/**
 * FNV-1a, 32 bits, synchroon. Bestond al in dit bestand en wordt gebruikt
 * door src/utils/image.ts; ongewijzigd gelaten.
 */
export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * Dezelfde FNV-1a onder de naam die de keten-code gebruikt. Voor een seed
 * hoeft een hash niet cryptografisch te zijn; hij moet alleen vast en snel
 * zijn. Testvectoren staan in __tests__/hash.test.ts.
 */
export function fnv1a32(input: string): number {
  return hashString(input);
}

/**
 * sha256 als hex-string. Gebruikt WebCrypto, dat in de browser en in Node 19+
 * als globalThis.crypto beschikbaar is (Node 22 in deze repo).
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
```

Maak `src/services/outfits/answersSeed.ts`:

```ts
import { fnv1a32 } from "@/utils/hash";
import { stableStringify } from "@/utils/stableJson";

/**
 * Vaste seed voor engine v2 uit de quiz-antwoorden. Zonder seed nam de engine
 * een tijdvenster van vijf minuten, waardoor dezelfde antwoorden om de vijf
 * minuten andere outfits gaven (spec 2). Met deze seed geven dezelfde
 * antwoorden dezelfde outfits, ook na een herlaad.
 */
export function seedFromAnswers(answers: Record<string, any>): number {
  return fnv1a32(stableStringify(answers ?? {}));
}
```

- [ ] **Stap 4: Draai de tests en zie ze slagen**

```bash
npx vitest run src/utils/__tests__/stableJson.test.ts src/utils/__tests__/hash.test.ts src/services/outfits/__tests__/answersSeed.test.ts
```

Verwacht: `Tests  7 passed (7)`.

- [ ] **Stap 5: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add src/utils/stableJson.ts src/utils/hash.ts src/services/outfits/answersSeed.ts src/utils/__tests__/stableJson.test.ts src/utils/__tests__/hash.test.ts src/services/outfits/__tests__/answersSeed.test.ts
git commit -m "feat: stabiele json, sha256 en vaste seed uit de quiz-antwoorden

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 6: Vertaling van quiz-antwoorden naar `get_kandidaten` en de pool-voorbereiding

**Bestanden:**
- Aanmaken: `src/services/outfits/kandidaten.ts`
- Test: `src/services/outfits/__tests__/kandidaten.test.ts`, `src/services/outfits/__tests__/getKandidaten.live.test.ts`

**Interfaces:**
- Gebruikt: `reclassifyProducts(products: Product[]): { classified: Product[]; rejected: Product[]; stats: Record<string, number> }` uit `@/engine/productClassifier`; `filterVeiligeProducten<T>(producten: T[]): { veilig: T[]; geweigerd: Array<{ product: T; reden: string }> }` uit `@/engine/productSafety`; type `Product` uit `@/engine/types`.
- Levert:
  - `type KandidatenGender = 'male' | 'female' | 'unisex'`
  - `interface KandidatenParams { p_gender: KandidatenGender; p_occasions: string[]; p_budget_min: number; p_budget_max: number; p_axes: Record<string, never>; p_liked_ids: string[]; p_disliked_ids: string[]; p_per_category: number }`
  - `interface KandidaatRij { product_id: string; category: string; score: number; attrs: Record<string, unknown>; product: Record<string, any> }`
  - `const KANDIDATEN_PER_CATEGORIE = 40`
  - `naarKandidatenParams(answers: Record<string, any>): KandidatenParams`
  - `mapKandidaatProduct(rij: Record<string, any>): Product`
  - `bereidKandidatenVoor(rijen: KandidaatRij[]): Product[]`
  - `telCategorieAfwijkingen(rijen: KandidaatRij[], pool: Product[]): number` (hoeveel producten in de pool een andere categorie hebben dan `product_attributes` zei; hoort 0 te zijn, stopregel 2)

Wat de spec openlaat en hier is besloten:
- `p_per_category` is 40 in dit plan. De 12 uit de spec is bedoeld voor het stylist-model (plan 3). Engine v2 componeert zelf en heeft meer keuze nodig om zes verschillende outfits te maken zonder twee keer dezelfde top; 40 per categorie is maximaal 240 rijen, ruim onder het PostgREST-venster van 1.000.
- De categorie van een kandidaat komt uit `rij.category` (product_attributes, na de classifier), niet uit `product.category` (ruwe feed). `reclassifyProducts` draait daarna nog als tweede net; omdat het dezelfde code is als in taak 2, hoort hij niets te veranderen. `telCategorieAfwijkingen` maakt dat meetbaar.
- Budget zonder antwoord: `0` tot `150`, dezelfde standaard als `parseBudget` in engine v2.
- Gelegenheid `sports` (oude waarde in sommige profielen) wordt `sport`.

- [ ] **Stap 1: Schrijf de falende tests**

Maak `src/services/outfits/__tests__/kandidaten.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  KANDIDATEN_PER_CATEGORIE,
  bereidKandidatenVoor,
  mapKandidaatProduct,
  naarKandidatenParams,
  telCategorieAfwijkingen,
} from "../kandidaten";

describe("naarKandidatenParams", () => {
  it("vertaalt de standaard quiz-antwoorden", () => {
    const p = naarKandidatenParams({
      gender: "male",
      occasions: ["work", "date"],
      budget: { min: 50, max: 150 },
    });
    expect(p).toEqual({
      p_gender: "male",
      p_occasions: ["work", "date"],
      p_budget_min: 50,
      p_budget_max: 150,
      p_axes: {},
      p_liked_ids: [],
      p_disliked_ids: [],
      p_per_category: KANDIDATEN_PER_CATEGORIE,
    });
  });

  it("maakt non-binary, prefer-not-to-say en ontbrekend gender unisex", () => {
    expect(naarKandidatenParams({ gender: "non-binary" }).p_gender).toBe("unisex");
    expect(naarKandidatenParams({ gender: "prefer-not-to-say" }).p_gender).toBe("unisex");
    expect(naarKandidatenParams({}).p_gender).toBe("unisex");
  });

  it("houdt alleen geldige gelegenheden over en vertaalt sports naar sport", () => {
    const p = naarKandidatenParams({ occasions: ["Work", "sports", "onzin", "party", "party"] });
    expect(p.p_occasions).toEqual(["work", "sport", "party"]);
  });

  it("valt terug op budgetRange en daarna op 0 tot 150", () => {
    expect(naarKandidatenParams({ budgetRange: 80 })).toMatchObject({ p_budget_min: 0, p_budget_max: 80 });
    expect(naarKandidatenParams({})).toMatchObject({ p_budget_min: 0, p_budget_max: 150 });
  });

  it("zet een omgekeerd of negatief budget recht en rondt op hele euro's", () => {
    expect(naarKandidatenParams({ budget: { min: 120.4, max: 60.2 } })).toMatchObject({
      p_budget_min: 60,
      p_budget_max: 121,
    });
    expect(naarKandidatenParams({ budget: { min: -5, max: 40 } })).toMatchObject({
      p_budget_min: 0,
      p_budget_max: 40,
    });
  });
});

describe("mapKandidaatProduct", () => {
  it("zet een products-rij om naar het engine-Product", () => {
    const product = mapKandidaatProduct({
      id: "p1",
      name: "Basic T-shirt",
      brand: "Merk",
      price: 29.95,
      image_url: "https://x/img.jpg",
      category: "top",
      gender: "male",
      colors: ["zwart"],
      sizes: ["M"],
      tags: ["basic"],
      style: "minimalist, casual",
      retailer: "H&M",
      affiliate_url: "https://x/aff",
      product_url: "https://x/p",
      in_stock: true,
    });
    expect(product).toMatchObject({
      id: "p1",
      name: "Basic T-shirt",
      imageUrl: "https://x/img.jpg",
      category: "top",
      color: "zwart",
      styleTags: ["basic", "minimalist", "casual"],
      affiliateUrl: "https://x/aff",
      productUrl: "https://x/p",
      inStock: true,
    });
  });
});

const rij = (id: string, category: string, product: Record<string, any>) => ({
  product_id: id,
  category,
  score: 0,
  attrs: { category },
  product: { id, brand: "Merk", price: 50, gender: "male", in_stock: true, ...product },
});

describe("bereidKandidatenVoor", () => {
  it("maakt van RPC-rijen een geclassificeerde, veilige pool", () => {
    const pool = bereidKandidatenVoor([
      rij("p1", "top", { name: "Basic T-shirt", category: "top" }),
      rij("p2", "footwear", { name: "Witte sneakers", category: "footwear" }),
    ]);
    expect(pool.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
    expect(pool.find((p) => p.id === "p2")?.category).toBe("footwear");
  });

  it("neemt de categorie van product_attributes, niet die van de feed", () => {
    // In de feed stond dit shirt als accessory (audit: 'Shirt FAY Men color Blue').
    const pool = bereidKandidatenVoor([
      rij("p3", "top", { name: "Shirt FAY Men color Blue", category: "accessory" }),
    ]);
    expect(pool).toHaveLength(1);
    expect(pool[0].category).toBe("top");
  });
});

describe("telCategorieAfwijkingen", () => {
  it("is 0 als de client-classifier het met product_attributes eens is", () => {
    const rijen = [rij("p1", "top", { name: "Basic T-shirt", category: "accessory" })];
    const pool = bereidKandidatenVoor(rijen);
    expect(telCategorieAfwijkingen(rijen, pool)).toBe(0);
  });

  it("telt een product waarvan de pool-categorie afwijkt van de RPC-categorie", () => {
    const rijen = [rij("p1", "accessory", { name: "Basic T-shirt", category: "accessory" })];
    const pool = bereidKandidatenVoor(rijen); // classifier zegt top
    expect(telCategorieAfwijkingen(rijen, pool)).toBe(1);
  });
});
```

Maak `src/services/outfits/__tests__/getKandidaten.live.test.ts`:

```ts
/**
 * Live test tegen de RPC get_kandidaten. Draait alleen als
 * VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in de omgeving staan; anders
 * wordt hij overgeslagen zodat de gewone testrun offline groen blijft.
 */
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { naarKandidatenParams, type KandidaatRij } from "../kandidaten";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

describe.skipIf(!url || !key)("get_kandidaten (live)", () => {
  it("geeft per categorie hooguit p_per_category rijen binnen budget en gender", async () => {
    const client = createClient(url!, key!);
    const params = naarKandidatenParams({
      gender: "male",
      occasions: ["work"],
      budget: { min: 50, max: 150 },
    });
    const { data, error } = await client.rpc("get_kandidaten", params);
    expect(error).toBeNull();
    const rijen = (data ?? []) as KandidaatRij[];
    expect(rijen.length).toBeGreaterThan(0);

    const perCategorie = new Map<string, number>();
    for (const rij of rijen) {
      perCategorie.set(rij.category, (perCategorie.get(rij.category) ?? 0) + 1);
      expect(rij.score).toBe(0);
      expect(Number(rij.product.price)).toBeGreaterThanOrEqual(50);
      expect(Number(rij.product.price)).toBeLessThanOrEqual(150);
      expect(["male", "unisex"]).toContain(rij.product.gender);
      expect(rij.product.in_stock).toBe(true);
      expect(rij.attrs.classifier_version).toBeTruthy();
    }
    for (const aantal of perCategorie.values()) {
      expect(aantal).toBeLessThanOrEqual(params.p_per_category);
    }
  });

  it("geeft twee keer dezelfde rijen in dezelfde volgorde", async () => {
    const client = createClient(url!, key!);
    const params = naarKandidatenParams({ gender: "female", occasions: ["date"], budget: { min: 25, max: 100 } });
    const a = (await client.rpc("get_kandidaten", params)).data as KandidaatRij[];
    const b = (await client.rpc("get_kandidaten", params)).data as KandidaatRij[];
    expect(a.map((r) => r.product_id)).toEqual(b.map((r) => r.product_id));
  });
});
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
npx vitest run src/services/outfits/__tests__/kandidaten.test.ts src/services/outfits/__tests__/getKandidaten.live.test.ts
```

Verwacht: beide bestanden falen met `Failed to resolve import "../kandidaten"`.

- [ ] **Stap 3: Implementeer**

Maak `src/services/outfits/kandidaten.ts`:

```ts
import { reclassifyProducts } from "@/engine/productClassifier";
import { filterVeiligeProducten } from "@/engine/productSafety";
import type { Product } from "@/engine/types";

export type KandidatenGender = "male" | "female" | "unisex";

/** Parameters van de RPC get_kandidaten (spec 5.3), in de volgorde van de functie. */
export interface KandidatenParams {
  p_gender: KandidatenGender;
  p_occasions: string[];
  p_budget_min: number;
  p_budget_max: number;
  p_axes: Record<string, never>;
  p_liked_ids: string[];
  p_disliked_ids: string[];
  p_per_category: number;
}

/** Een rij uit get_kandidaten. `product` is de volledige products-rij als json. */
export interface KandidaatRij {
  product_id: string;
  category: string;
  score: number;
  attrs: Record<string, unknown>;
  product: Record<string, any>;
}

export const GELEGENHEDEN = ["work", "casual", "formal", "date", "travel", "sport", "party"] as const;

/**
 * 40 per categorie in plaats van de 12 uit de spec: die 12 is voor het
 * stylist-model (plan 3). Engine v2 componeert zelf en heeft meer keuze nodig
 * om zes verschillende outfits te maken. Maximaal 240 rijen.
 */
export const KANDIDATEN_PER_CATEGORIE = 40;

const STANDAARD_BUDGET_MAX = 150;

function naarGender(raw: unknown): KandidatenGender {
  return raw === "male" || raw === "female" ? raw : "unisex";
}

function naarGelegenheden(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const uit: string[] = [];
  for (const item of raw) {
    let norm = String(item).toLowerCase().trim();
    if (norm === "sports") norm = "sport";
    if ((GELEGENHEDEN as readonly string[]).includes(norm) && !uit.includes(norm)) uit.push(norm);
  }
  return uit;
}

function naarBudget(answers: Record<string, any>): { min: number; max: number } {
  const b = answers.budget;
  if (b && typeof b === "object" && typeof b.max === "number" && b.max > 0) {
    const min = typeof b.min === "number" ? b.min : 0;
    const laag = Math.max(0, Math.floor(Math.min(min, b.max)));
    const hoog = Math.max(laag, Math.ceil(Math.max(min, b.max)));
    return { min: laag, max: hoog };
  }
  if (typeof answers.budgetRange === "number" && answers.budgetRange > 0) {
    return { min: 0, max: Math.ceil(answers.budgetRange) };
  }
  return { min: 0, max: STANDAARD_BUDGET_MAX };
}

/** Vertaalt de bestaande quiz-antwoorden (LS_KEYS.QUIZ_ANSWERS) naar de RPC-parameters. */
export function naarKandidatenParams(answers: Record<string, any>): KandidatenParams {
  const a = answers ?? {};
  const budget = naarBudget(a);
  return {
    p_gender: naarGender(a.gender),
    p_occasions: naarGelegenheden(a.occasions),
    p_budget_min: budget.min,
    p_budget_max: budget.max,
    p_axes: {},
    p_liked_ids: [],
    p_disliked_ids: [],
    p_per_category: KANDIDATEN_PER_CATEGORIE,
  };
}

/** Zelfde mapping als OutfitService.mapDatabaseProduct had; nu deelbaar met scripts. */
export function mapKandidaatProduct(dbProduct: Record<string, any>): Product {
  const tags: string[] = dbProduct.tags || [];
  const style: string = dbProduct.style || "";
  const styleTags = style
    ? [...tags, ...style.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean)]
    : tags;

  return {
    id: dbProduct.id,
    name: dbProduct.name || dbProduct.title,
    brand: dbProduct.brand,
    price: typeof dbProduct.price === "string" ? Number(dbProduct.price) : dbProduct.price,
    imageUrl: dbProduct.image_url || dbProduct.imageUrl,
    category: dbProduct.category,
    type: dbProduct.type,
    gender: dbProduct.gender,
    colors: dbProduct.colors || [],
    color: (dbProduct.colors || [])[0],
    sizes: dbProduct.sizes || [],
    tags,
    styleTags,
    retailer: dbProduct.retailer,
    affiliateUrl: dbProduct.affiliate_url || dbProduct.affiliateUrl,
    productUrl: dbProduct.product_url || dbProduct.productUrl,
    description: dbProduct.description,
    inStock: dbProduct.in_stock ?? true,
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
  };
}

/**
 * Van RPC-rijen naar de pool die engine v2 krijgt. De categorie komt uit
 * product_attributes (rij.category, na de classifier van taak 2), niet uit
 * de ruwe feed. reclassifyProducts draait daarna als tweede net; het is
 * dezelfde code, dus hij hoort niets te veranderen (zie
 * telCategorieAfwijkingen). Daarna het veiligheidsnet tegen kinderkleding.
 * De dedupe zit in de database (canonical_id), dus dedupeProductVariants
 * wordt hier niet meer aangeroepen.
 */
export function bereidKandidatenVoor(rijen: KandidaatRij[]): Product[] {
  const ruw = rijen.map((rij) => ({
    ...mapKandidaatProduct(rij.product),
    category: rij.category,
  }));
  const { classified } = reclassifyProducts(ruw);
  const { veilig, geweigerd } = filterVeiligeProducten(classified);
  if (geweigerd.length > 0) {
    const perReden = geweigerd.reduce<Record<string, number>>((acc, g) => {
      acc[g.reden] = (acc[g.reden] ?? 0) + 1;
      return acc;
    }, {});
    console.log("[kandidaten] veiligheidsnet weigerde producten:", perReden);
  }
  return veilig;
}

/**
 * Hoeveel producten in de pool een andere categorie hebben dan
 * product_attributes zei. Hoort 0 te zijn; anders is de classificatie in de
 * database ouder dan de code (stopregel 2 in het plan): draai
 * scripts/keten/classificeer-attributes.ts opnieuw.
 */
export function telCategorieAfwijkingen(rijen: KandidaatRij[], pool: Product[]): number {
  const verwacht = new Map(rijen.map((r) => [String(r.product_id), String(r.category).toLowerCase()]));
  let afwijkingen = 0;
  for (const p of pool) {
    const db = verwacht.get(String(p.id));
    if (db && String(p.category ?? "").toLowerCase() !== db) afwijkingen++;
  }
  return afwijkingen;
}
```

- [ ] **Stap 4: Draai de tests en zie ze slagen**

```bash
npx vitest run src/services/outfits/__tests__/kandidaten.test.ts
set -a; source .env; set +a; npx vitest run src/services/outfits/__tests__/getKandidaten.live.test.ts
```

Verwacht: eerste run `Tests  10 passed (10)`; tweede run `Tests  2 passed (2)`. Zonder omgevingsvariabelen meldt de tweede run `2 skipped`.

- [ ] **Stap 5: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add src/services/outfits/kandidaten.ts src/services/outfits/__tests__/kandidaten.test.ts src/services/outfits/__tests__/getKandidaten.live.test.ts
git commit -m "feat: quiz-antwoorden naar get_kandidaten en pool-voorbereiding op de database-categorie

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 7: `outfitService` via `get_kandidaten` met vaste seed

**Bestanden:**
- Wijzigen: `src/services/outfits/outfitService.ts` (regels 1-10 imports, 37-107 `getProducts`, 110-168 `generateOutfits`, 205-232 `mapDatabaseProduct`)
- Test: `src/services/outfits/__tests__/outfitService.test.ts`

**Interfaces:**
- Gebruikt: `naarKandidatenParams`, `bereidKandidatenVoor`, `KandidaatRij` uit taak 6; `seedFromAnswers` uit taak 5; `stableStringify` uit taak 5; `runEngineV2(answers, products, options: EngineOptions)` met `options.seed?: number`.
- Levert: `outfitService.getProducts(answersOfGender?: Record<string, any> | string, forceRefresh?: boolean): Promise<Product[]>` (een string wordt gelezen als `{ gender }`, zodat `calibrationOutfitsV2.ts` regels 35 en 70 ongewijzigd blijven werken); `outfitService.generateOutfits(quizAnswers, count?)` ongewijzigd van buiten; `class CatalogusOnbereikbaar extends Error`.

Wat de spec openlaat en hier is besloten:
- Nul rijen uit de RPC betekent nu twee dingen: de filters zijn te strak, of `product_attributes` is nooit gevuld. Bij nul rijen doet de service een tel-query op `product_attributes`; is die 0, dan gooit hij `CatalogusOnbereikbaar('product_attributes is leeg')`, anders geeft hij `[]` terug en toont de pagina zoals nu "filters te strak".

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/services/outfits/__tests__/outfitService.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const telQuery = vi.fn();
const runEngineV2 = vi.fn();

vi.mock("@/lib/supabaseClient", () => ({
  supabase: () => ({
    rpc,
    from: () => ({ select: telQuery }),
  }),
}));

vi.mock("@/engine/v2", () => ({
  runEngineV2: (...args: unknown[]) => runEngineV2(...args),
}));

import { CatalogusOnbereikbaar, outfitService } from "../outfitService";
import { seedFromAnswers } from "../answersSeed";
import { KANDIDATEN_PER_CATEGORIE } from "../kandidaten";

const rij = (id: string, category: string, price: number) => ({
  product_id: id,
  category,
  score: 0,
  attrs: { category },
  product: { id, name: `Product ${id}`, brand: "Merk", price, category, gender: "male", in_stock: true },
});

const outfit = {
  id: "o1",
  title: "Outfit",
  description: "",
  archetype: "classic",
  occasion: "work",
  products: [],
  tags: [],
  matchPercentage: 80,
  explanation: "Klaar voor kantoor.",
};

const answers = { gender: "male", occasions: ["work"], budget: { min: 50, max: 150 } };

beforeEach(() => {
  rpc.mockReset();
  telQuery.mockReset();
  runEngineV2.mockReset();
  outfitService.clearCache();
  runEngineV2.mockReturnValue({ outfits: [outfit], stats: {} });
});

describe("outfitService.getProducts", () => {
  it("roept get_kandidaten aan met de vertaalde antwoorden", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", 60), rij("p2", "footwear", 90)], error: null });
    const producten = await outfitService.getProducts(answers);
    expect(rpc).toHaveBeenCalledWith("get_kandidaten", {
      p_gender: "male",
      p_occasions: ["work"],
      p_budget_min: 50,
      p_budget_max: 150,
      p_axes: {},
      p_liked_ids: [],
      p_disliked_ids: [],
      p_per_category: KANDIDATEN_PER_CATEGORIE,
    });
    expect(producten.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
  });

  it("leest een string als gender, voor de kalibratie-aanroepers", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", 60)], error: null });
    await outfitService.getProducts("female");
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_gender: "female", p_budget_min: 0, p_budget_max: 150 });
  });

  it("gooit CatalogusOnbereikbaar bij een rpc-fout", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boem" } });
    await expect(outfitService.getProducts(answers)).rejects.toBeInstanceOf(CatalogusOnbereikbaar);
  });

  it("gooit CatalogusOnbereikbaar als product_attributes leeg is", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    telQuery.mockResolvedValue({ count: 0, error: null });
    await expect(outfitService.getProducts(answers)).rejects.toThrow("product_attributes is leeg");
  });

  it("geeft een lege lijst als er wel attributen zijn maar niets binnen de filters", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    telQuery.mockResolvedValue({ count: 1234, error: null });
    await expect(outfitService.getProducts(answers)).resolves.toEqual([]);
  });
});

describe("outfitService.generateOutfits", () => {
  it("geeft engine v2 de seed uit de antwoorden mee", async () => {
    rpc.mockResolvedValue({ data: [rij("p1", "top", 60)], error: null });
    await outfitService.generateOutfits(answers, 6);
    expect(runEngineV2).toHaveBeenCalledTimes(1);
    const opties = runEngineV2.mock.calls[0][2] as { seed?: number; count?: number };
    expect(opties.seed).toBe(seedFromAnswers(answers));
    expect(opties.count).toBe(6);
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/services/outfits/__tests__/outfitService.test.ts
```

Verwacht: de test `roept get_kandidaten aan` faalt omdat `rpc` niet is aangeroepen (`expected "spy" to be called with arguments`), en `geeft engine v2 de seed` faalt omdat `opties.seed` `undefined` is.

- [ ] **Stap 3: Vervang de imports (regels 1-10)**

Vervang in `src/services/outfits/outfitService.ts` het importblok:

```ts
import { supabase } from "@/lib/supabaseClient";
import { generateRecommendationsFromAnswers } from "@/engine/recommendationEngine";
import { runEngineV2 } from "@/engine/v2";
import { generateNovaExplanation } from "@/engine/explainOutfit";
import { filterByGender, getUserGender } from "@/services/products/genderFilter";
import { reclassifyProducts } from "@/engine/productClassifier";
import { filterVeiligeProducten } from "@/engine/productSafety";
import { dedupeProductVariants } from "./dedupeProductVariants";
import type { Product } from "@/engine/types";
import type { Outfit } from "@/engine/types";
```

door:

```ts
import { supabase } from "@/lib/supabaseClient";
import { generateRecommendationsFromAnswers } from "@/engine/recommendationEngine";
import { runEngineV2 } from "@/engine/v2";
import { stableStringify } from "@/utils/stableJson";
import { seedFromAnswers } from "./answersSeed";
import { bereidKandidatenVoor, naarKandidatenParams, type KandidaatRij } from "./kandidaten";
import type { Product } from "@/engine/types";
import type { Outfit } from "@/engine/types";
```

(`generateNovaExplanation`, `filterByGender` en `getUserGender` werden in dit bestand nergens gebruikt. De klasse `CatalogusOnbereikbaar` staat al op regel 25-31 van het bestand en blijft ongewijzigd; `productsCache`, `cacheTimestamps`, `CACHE_DURATION` (regels 33-35) en `clearCache()` (regel 234) bestaan ook al.)

- [ ] **Stap 4: Vervang `getProducts` (regels 37-107)**

Vervang de hele methode `getProducts`, van `async getProducts(gender?: string, forceRefresh = false)` tot en met de sluitende `}` van de methode, door:

```ts
  /**
   * De productpool voor de engine, uit de RPC get_kandidaten (spec 5.3).
   *
   * Vroeger: select * from products zonder limit, dus de eerste 1.000 rijen
   * in rijvolgorde van circa 282.000 (0 H&M). Nu: per categorie de beste
   * kandidaten uit product_attributes, gefilterd aan de serverkant op
   * canoniek, draagbaar, voorraad, gender en budget.
   *
   * Een string als eerste argument wordt gelezen als gender; dat is de vorm
   * die calibrationOutfitsV2 gebruikt.
   */
  async getProducts(
    answersOfGender?: Record<string, any> | string,
    forceRefresh = false
  ): Promise<Product[]> {
    const answers =
      typeof answersOfGender === 'string' ? { gender: answersOfGender } : (answersOfGender ?? {});
    const params = naarKandidatenParams(answers);
    const cacheKey = stableStringify(params);
    const cached = this.productsCache.get(cacheKey);
    const cachedAt = this.cacheTimestamps.get(cacheKey) ?? 0;

    if (!forceRefresh && cached && Date.now() - cachedAt < this.CACHE_DURATION) {
      return cached;
    }

    const client = supabase();
    if (!client) {
      throw new CatalogusOnbereikbaar('geen Supabase-client beschikbaar');
    }

    try {
      const { data, error } = await client.rpc('get_kandidaten', params);

      if (error) {
        throw new CatalogusOnbereikbaar(error.message || 'rpc get_kandidaten faalde');
      }

      const rijen = (data ?? []) as KandidaatRij[];

      if (rijen.length === 0) {
        // Nul rijen is nu dubbelzinnig: filters te strak, of de tabel is
        // nooit gevuld. Alleen het tweede is "catalogus onbereikbaar".
        const { count, error: telFout } = await client
          .from('product_attributes')
          .select('product_id', { count: 'exact', head: true });
        if (telFout) {
          throw new CatalogusOnbereikbaar(telFout.message || 'product_attributes niet leesbaar');
        }
        if (!count) {
          throw new CatalogusOnbereikbaar('product_attributes is leeg');
        }
        console.warn('[OutfitService] get_kandidaten gaf nul rijen voor', params);
        return [];
      }

      const products = bereidKandidatenVoor(rijen);

      this.productsCache.set(cacheKey, products);
      this.cacheTimestamps.set(cacheKey, Date.now());

      console.log(`[OutfitService] ${products.length} kandidaten uit ${rijen.length} rijen (${params.p_gender}, ${params.p_budget_min}-${params.p_budget_max})`);
      return products;
    } catch (error) {
      if (error instanceof CatalogusOnbereikbaar) throw error;
      console.error('[OutfitService] Exception fetching products:', error);
      throw new CatalogusOnbereikbaar(
        error instanceof Error ? error.message : 'onbekende fout bij ophalen'
      );
    }
  }
```

- [ ] **Stap 5: Geef `generateOutfits` de antwoorden en de seed (regels 110-131)**

Vervang in `generateOutfits`:

```ts
      const gender = quizAnswers.gender as string | undefined;
      const products = await this.getProducts(gender);
```

door:

```ts
      const products = await this.getProducts(quizAnswers);
```

En vervang:

```ts
          const result = runEngineV2(quizAnswers, products, {
            count,
            debug: true,
          });
```

door:

```ts
          // Vaste seed: dezelfde antwoorden geven dezelfde outfits, ook na
          // een herlaad (spec 2, "geen seed in productie").
          const result = runEngineV2(quizAnswers, products, {
            count,
            debug: true,
            seed: seedFromAnswers(quizAnswers),
          });
```

- [ ] **Stap 6: Verwijder de private `mapDatabaseProduct` (regels 205-232)**

Verwijder de hele methode `private mapDatabaseProduct(dbProduct: any): Product { ... }`. De mapping leeft nu in `kandidaten.ts` als `mapKandidaatProduct`.

- [ ] **Stap 7: Draai de tests en zie ze slagen**

```bash
npx vitest run src/services/outfits/__tests__/outfitService.test.ts
```

Verwacht: `Tests  6 passed (6)`.

- [ ] **Stap 8: Poorten, handmatige controle en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
```

Verwacht: alle drie groen. `tsc` mag niet klagen over `calibrationOutfitsV2.ts` (die geeft nog steeds een string door).

Handmatig: `npm run dev`, doorloop de quiz op `http://localhost:5173`, open `/results`. In de console staat `[OutfitService] N kandidaten uit M rijen (...)` met M groter dan 0 en zes outfits op de pagina. Herlaad de pagina drie keer: dezelfde zes outfits in dezelfde volgorde.

```bash
git add src/services/outfits/outfitService.ts src/services/outfits/__tests__/outfitService.test.ts
git commit -m "feat: outfitService leest de hele catalogus via get_kandidaten en seedt engine v2

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 8: Service voor beoordelingen

**Bestanden:**
- Aanmaken: `src/services/ratings/outfitRatings.ts`
- Test: `src/services/ratings/__tests__/outfitRatings.test.ts`

**Interfaces:**
- Gebruikt: `sha256Hex`, `stableStringify` uit taak 5; `supabase()` uit `@/lib/supabaseClient`; tabel `outfit_ratings` uit taak 4.
- Levert:
  - `type OutfitRating = 'zou_dragen' | 'nooit'`
  - `hashProfile(answers: Record<string, any>): Promise<string>` (sha256-hex van `stableStringify(answers)`)
  - `outfitKey(productIds: string[]): Promise<string>` (sha256-hex van de gesorteerde, ontdubbelde ids, gescheiden door een komma)
  - `saveOutfitRating(input: { profileHash: string; outfitKey: string; rating: OutfitRating; sessionId: string; userId?: string | null }): Promise<{ ok: true } | { ok: false; reden: string }>`

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/services/ratings/__tests__/outfitRatings.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
let clientBeschikbaar = true;

vi.mock("@/lib/supabaseClient", () => ({
  supabase: () => (clientBeschikbaar ? { from: () => ({ insert }) } : null),
}));

import { hashProfile, outfitKey, saveOutfitRating } from "../outfitRatings";

beforeEach(() => {
  insert.mockReset();
  clientBeschikbaar = true;
});

describe("hashProfile", () => {
  it("is sha256-hex en onafhankelijk van sleutelvolgorde", async () => {
    const a = await hashProfile({ gender: "male", occasions: ["work"] });
    const b = await hashProfile({ occasions: ["work"], gender: "male" });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("outfitKey", () => {
  it("is onafhankelijk van volgorde en dubbele ids", async () => {
    const a = await outfitKey(["p2", "p1", "p3"]);
    const b = await outfitKey(["p1", "p3", "p2", "p2"]);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verschilt als een item verschilt", async () => {
    expect(await outfitKey(["p1", "p2"])).not.toBe(await outfitKey(["p1", "p3"]));
  });
});

describe("saveOutfitRating", () => {
  const invoer = {
    profileHash: "a".repeat(64),
    outfitKey: "b".repeat(64),
    rating: "zou_dragen" as const,
    sessionId: "11111111-2222-4333-8444-555555555555",
    userId: null,
  };

  it("schrijft een rij naar outfit_ratings", async () => {
    insert.mockResolvedValue({ error: null });
    const uitkomst = await saveOutfitRating(invoer);
    expect(uitkomst).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      profile_hash: invoer.profileHash,
      outfit_key: invoer.outfitKey,
      rating: "zou_dragen",
      session_id: invoer.sessionId,
      user_id: null,
    });
  });

  it("geeft de fout terug in plaats van te gooien", async () => {
    insert.mockResolvedValue({ error: { message: "rls" } });
    expect(await saveOutfitRating(invoer)).toEqual({ ok: false, reden: "rls" });
  });

  it("meldt een ontbrekende client", async () => {
    clientBeschikbaar = false;
    expect(await saveOutfitRating(invoer)).toEqual({ ok: false, reden: "geen Supabase-client" });
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/services/ratings/__tests__/outfitRatings.test.ts
```

Verwacht: `Failed to resolve import "../outfitRatings"`.

- [ ] **Stap 3: Implementeer**

Maak `src/services/ratings/outfitRatings.ts`:

```ts
import { supabase } from "@/lib/supabaseClient";
import { sha256Hex } from "@/utils/hash";
import { stableStringify } from "@/utils/stableJson";

export type OutfitRating = "zou_dragen" | "nooit";

/**
 * profile_hash voor outfit_ratings: sha256 van de quiz-antwoorden zoals ze in
 * localStorage staan (LS_KEYS.QUIZ_ANSWERS), met gesorteerde sleutels. In
 * plan 4 wordt dit de hash van taste_profiles (spec 5.2.1); tot die tijd is
 * dit de enige stabiele identiteit van een profiel.
 */
export async function hashProfile(answers: Record<string, any>): Promise<string> {
  return sha256Hex(stableStringify(answers ?? {}));
}

/** outfit_key: sha256 van de gesorteerde, ontdubbelde product-ids (spec 5.6). */
export async function outfitKey(productIds: string[]): Promise<string> {
  const ids = Array.from(new Set(productIds.map(String))).sort();
  return sha256Hex(ids.join(","));
}

export interface SaveOutfitRatingInput {
  profileHash: string;
  outfitKey: string;
  rating: OutfitRating;
  sessionId: string;
  userId?: string | null;
}

/**
 * Schrijft een beoordeling. Geeft de fout terug in plaats van te gooien: een
 * mislukte meting mag de resultatenpagina nooit breken.
 */
export async function saveOutfitRating(
  input: SaveOutfitRatingInput
): Promise<{ ok: true } | { ok: false; reden: string }> {
  const client = supabase();
  if (!client) return { ok: false, reden: "geen Supabase-client" };

  try {
    const { error } = await client.from("outfit_ratings").insert({
      profile_hash: input.profileHash,
      outfit_key: input.outfitKey,
      rating: input.rating,
      session_id: input.sessionId,
      user_id: input.userId ?? null,
    });
    if (error) return { ok: false, reden: error.message || "insert mislukt" };
    return { ok: true };
  } catch (e) {
    return { ok: false, reden: e instanceof Error ? e.message : "onbekende fout" };
  }
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

```bash
npx vitest run src/services/ratings/__tests__/outfitRatings.test.ts
```

Verwacht: `Tests  6 passed (6)`.

- [ ] **Stap 5: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add src/services/ratings/outfitRatings.ts src/services/ratings/__tests__/outfitRatings.test.ts
git commit -m "feat: service voor outfit_ratings met profile-hash en outfit-key

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 9: Geheugen-module en component `OutfitRatingButtons`

**Bestanden:**
- Aanmaken: `src/components/results/outfitRatingGeheugen.ts`, `src/components/results/OutfitRatingButtons.tsx`
- Test: `src/components/results/__tests__/outfitRatingGeheugen.test.ts`, `src/components/results/__tests__/OutfitRatingButtons.render.test.tsx`

**Interfaces:**
- Gebruikt: `outfitKey`, `saveOutfitRating`, `OutfitRating` uit taak 8; `getSessionId(): string` uit `@/utils/sessionId`; `track(event: string, props?: Record<string, unknown>)` uit `@/utils/telemetry` (default export); iconen `ThumbsUp`, `ThumbsDown` uit `lucide-react`.
- Levert (geheugen):
  - `type Opslag = Pick<Storage, 'getItem' | 'setItem'>`
  - `const OPSLAG_SLEUTEL = 'ff_outfit_ratings'`
  - `onthoudSleutel(profileHash: string | null, outfitId: string): string | null`
  - `leesKeuze(sleutel: string, opslag?: Opslag | null): OutfitRating | null`
  - `bewaarKeuze(sleutel: string, rating: OutfitRating, opslag?: Opslag | null): void` (schrijft en meldt aan abonnees van die sleutel)
  - `abonneer(sleutel: string, cb: (rating: OutfitRating) => void): () => void`
  - `magSchrijven(stand: { profileHash: string | null; gekozen: OutfitRating | null; bezig: boolean }, rating: OutfitRating): boolean`
- Levert (component): `OutfitRatingButtons(props: { outfitId: string; productIds: string[]; profileHash: string | null; userId?: string | null })`.

Waarom een aparte module: de roast van dit plan wees erop dat de enige niet-triviale eis (na herlaad geen tweede insert, keuze onthouden) alleen handmatig getest werd, omdat `renderToString` geen effects draait. Daarom staat alles wat met onthouden en beslissen te maken heeft in een pure module met injecteerbare opslag, getest in node, en leest de component zijn beginstand in de `useState`-initializer (die draait wel bij `renderToString`). De render-test stubt `globalThis.localStorage` en controleert dat een eerder onthouden keuze als `aria-pressed="true"` terugkomt.

Gedrag:
- Twee knoppen naast elkaar, secundaire stijl uit CLAUDE.md, minimaal 48px hoog, `rounded-xl`. De gekozen knop krijgt `bg-[#F4E8E3] border-[#A85740] text-[#A85740]` (geselecteerde state uit het palet).
- Klik schrijft een rij, stuurt `track('outfit_rating', {...})` en onthoudt de keuze per `profileHash + outfitId` in localStorage onder `ff_outfit_ratings`, zodat een herlaad de keuze toont en niet opnieuw schrijft. Nogmaals op dezelfde knop klikken doet niets; de andere knop kiezen schrijft een nieuwe rij (de view telt de laatste).
- Dezelfde outfit staat op `/results` twee keer op de pagina (top-3-sectie en grid). Beide instanties delen dezelfde sleutel; via `abonneer` volgt de tweede instantie de eerste zonder herlaad, zodat een bezoeker niet twee keer klikt en twee rijen schrijft.
- Zonder `profileHash` (nog aan het hashen, of geen antwoorden) zijn de knoppen uitgeschakeld. De pagina geeft `key={profileHash ?? 'geen-hash'}` mee (taak 10), zodat de component opnieuw mount zodra de hash er is en de initializer de onthouden keuze leest.
- Klikken mag de kaart eronder niet openen: `stopPropagation` op de wrapper.
- Geen schaduw, geen `gap-3`, geen `mt-3` (design-check-script).

- [ ] **Stap 1: Schrijf de falende tests**

Maak `src/components/results/__tests__/outfitRatingGeheugen.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  OPSLAG_SLEUTEL,
  abonneer,
  bewaarKeuze,
  leesKeuze,
  magSchrijven,
  onthoudSleutel,
  type Opslag,
} from "../outfitRatingGeheugen";

function nepOpslag(begin: Record<string, string> = {}): Opslag & { data: Record<string, string> } {
  const data = { ...begin };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

const HASH = "a".repeat(64);

describe("onthoudSleutel", () => {
  it("combineert hash en outfit-id, en is null zonder hash", () => {
    expect(onthoudSleutel(HASH, "o1")).toBe(`${HASH}:o1`);
    expect(onthoudSleutel(null, "o1")).toBeNull();
  });
});

describe("leesKeuze en bewaarKeuze", () => {
  it("geeft null als er nog niets onthouden is", () => {
    expect(leesKeuze("x:o1", nepOpslag())).toBeNull();
  });

  it("leest terug wat bewaard is, per sleutel", () => {
    const opslag = nepOpslag();
    bewaarKeuze("x:o1", "zou_dragen", opslag);
    bewaarKeuze("x:o2", "nooit", opslag);
    expect(leesKeuze("x:o1", opslag)).toBe("zou_dragen");
    expect(leesKeuze("x:o2", opslag)).toBe("nooit");
    expect(leesKeuze("x:o3", opslag)).toBeNull();
    expect(JSON.parse(opslag.data[OPSLAG_SLEUTEL])).toEqual({ "x:o1": "zou_dragen", "x:o2": "nooit" });
  });

  it("overleeft kapotte json en een ontbrekende opslag", () => {
    expect(leesKeuze("x:o1", nepOpslag({ [OPSLAG_SLEUTEL]: "{niet json" }))).toBeNull();
    expect(leesKeuze("x:o1", null)).toBeNull();
    expect(() => bewaarKeuze("x:o1", "nooit", null)).not.toThrow();
  });

  it("negeert een waarde die geen rating is", () => {
    const opslag = nepOpslag({ [OPSLAG_SLEUTEL]: JSON.stringify({ "x:o1": "misschien" }) });
    expect(leesKeuze("x:o1", opslag)).toBeNull();
  });
});

describe("abonneer", () => {
  it("meldt een bewaarde keuze aan abonnees van dezelfde sleutel, niet aan andere", () => {
    const opslag = nepOpslag();
    const a = vi.fn();
    const b = vi.fn();
    const stopA = abonneer("x:o1", a);
    const stopB = abonneer("x:o2", b);
    bewaarKeuze("x:o1", "nooit", opslag);
    expect(a).toHaveBeenCalledWith("nooit");
    expect(b).not.toHaveBeenCalled();
    stopA();
    stopB();
    bewaarKeuze("x:o1", "zou_dragen", opslag);
    expect(a).toHaveBeenCalledTimes(1);
  });
});

describe("magSchrijven", () => {
  it("schrijft niet zonder hash, niet tijdens een schrijfactie en niet bij dezelfde keuze", () => {
    expect(magSchrijven({ profileHash: null, gekozen: null, bezig: false }, "nooit")).toBe(false);
    expect(magSchrijven({ profileHash: HASH, gekozen: null, bezig: true }, "nooit")).toBe(false);
    expect(magSchrijven({ profileHash: HASH, gekozen: "nooit", bezig: false }, "nooit")).toBe(false);
  });

  it("schrijft bij een eerste keuze en bij een andere keuze", () => {
    expect(magSchrijven({ profileHash: HASH, gekozen: null, bezig: false }, "nooit")).toBe(true);
    expect(magSchrijven({ profileHash: HASH, gekozen: "nooit", bezig: false }, "zou_dragen")).toBe(true);
  });

  it("na herlaad met een onthouden keuze schrijft dezelfde klik niet opnieuw", () => {
    const opslag = nepOpslag({ [OPSLAG_SLEUTEL]: JSON.stringify({ [`${HASH}:o1`]: "zou_dragen" }) });
    const gekozen = leesKeuze(onthoudSleutel(HASH, "o1")!, opslag);
    expect(gekozen).toBe("zou_dragen");
    expect(magSchrijven({ profileHash: HASH, gekozen, bezig: false }, "zou_dragen")).toBe(false);
    expect(magSchrijven({ profileHash: HASH, gekozen, bezig: false }, "nooit")).toBe(true);
  });
});
```

Maak `src/components/results/__tests__/OutfitRatingButtons.render.test.tsx`:

```tsx
/**
 * Render-test zonder jsdom, zoals CalibrationStep.render.test.tsx: de
 * component wordt server-side gerenderd, effects draaien niet, de
 * useState-initializer wel. Wat we bewaken: de twee vaste teksten,
 * type="button", uitgeschakeld zonder profile-hash, en dat een eerder
 * onthouden keuze uit localStorage als aria-pressed terugkomt.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { OPSLAG_SLEUTEL } from "../outfitRatingGeheugen";

vi.mock("@/services/ratings/outfitRatings", () => ({
  outfitKey: vi.fn(async () => "k".repeat(64)),
  saveOutfitRating: vi.fn(async () => ({ ok: true })),
}));

import { OutfitRatingButtons } from "../OutfitRatingButtons";

const HASH = "a".repeat(64);

function stubLocalStorage(inhoud: Record<string, string>) {
  const data = { ...inhoud };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => (k in data ? data[k] : null),
      setItem: (k: string, v: string) => {
        data[k] = v;
      },
      removeItem: (k: string) => {
        delete data[k];
      },
    },
  });
}

afterEach(() => {
  // @ts-expect-error: de stub weer weghalen zodat andere tests hem niet zien
  delete globalThis.localStorage;
});

describe("OutfitRatingButtons", () => {
  it("toont de twee vaste knopteksten als echte knoppen", () => {
    const html = renderToString(
      <OutfitRatingButtons outfitId="o1" productIds={["p1", "p2"]} profileHash={HASH} />
    );
    expect(html).toContain("Zou ik dragen");
    expect(html).toContain("Nooit");
    expect(html.match(/type="button"/g)?.length).toBe(2);
    expect(html).toContain("rounded-xl");
    expect(html).toContain("min-h-[48px]");
    // Let op: de className bevat "disabled:opacity-50", dus controleer op het attribuut zelf.
    expect(html).not.toContain('disabled=""');
    expect(html.match(/aria-pressed="true"/g)).toBeNull();
  });

  it("is uitgeschakeld zonder profile-hash", () => {
    const html = renderToString(
      <OutfitRatingButtons outfitId="o1" productIds={["p1"]} profileHash={null} />
    );
    expect(html.match(/disabled=""/g)?.length).toBe(2);
  });

  it("toont een eerder onthouden keuze uit localStorage als ingedrukt", () => {
    stubLocalStorage({ [OPSLAG_SLEUTEL]: JSON.stringify({ [`${HASH}:o1`]: "nooit" }) });
    const html = renderToString(
      <OutfitRatingButtons outfitId="o1" productIds={["p1"]} profileHash={HASH} />
    );
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(1);
    // De ingedrukte knop is de tweede (Nooit): het true-attribuut staat na de tekst "Zou ik dragen".
    expect(html.indexOf('aria-pressed="true"')).toBeGreaterThan(html.indexOf("Zou ik dragen"));
    expect(html).toContain("bg-[#F4E8E3]");
  });

  it("toont niets als ingedrukt voor een andere outfit met dezelfde hash", () => {
    stubLocalStorage({ [OPSLAG_SLEUTEL]: JSON.stringify({ [`${HASH}:o1`]: "nooit" }) });
    const html = renderToString(
      <OutfitRatingButtons outfitId="o2" productIds={["p1"]} profileHash={HASH} />
    );
    expect(html.match(/aria-pressed="true"/g)).toBeNull();
  });
});
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
npx vitest run src/components/results/__tests__/outfitRatingGeheugen.test.ts src/components/results/__tests__/OutfitRatingButtons.render.test.tsx
```

Verwacht: beide bestanden falen met `Failed to resolve import "../outfitRatingGeheugen"`.

- [ ] **Stap 3: Implementeer de geheugen-module**

Maak `src/components/results/outfitRatingGeheugen.ts`:

```ts
import type { OutfitRating } from "@/services/ratings/outfitRatings";

/**
 * Onthouden van een beoordeling per profiel en outfit, los van React zodat
 * het in node te testen is. De opslag is injecteerbaar; standaard
 * localStorage, en null als die er niet is (SSR, tests, private modus).
 */
export type Opslag = Pick<Storage, "getItem" | "setItem">;

export const OPSLAG_SLEUTEL = "ff_outfit_ratings";

const RATINGS: readonly OutfitRating[] = ["zou_dragen", "nooit"];

export function onthoudSleutel(profileHash: string | null, outfitId: string): string | null {
  return profileHash ? `${profileHash}:${outfitId}` : null;
}

function standaardOpslag(): Opslag | null {
  try {
    const ls = (globalThis as { localStorage?: Opslag }).localStorage;
    return ls && typeof ls.getItem === "function" ? ls : null;
  } catch {
    return null;
  }
}

function leesAlles(opslag: Opslag | null): Record<string, OutfitRating> {
  if (!opslag) return {};
  try {
    const raw = opslag.getItem(OPSLAG_SLEUTEL);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? (obj as Record<string, OutfitRating>) : {};
  } catch {
    return {};
  }
}

export function leesKeuze(sleutel: string, opslag: Opslag | null = standaardOpslag()): OutfitRating | null {
  const waarde = leesAlles(opslag)[sleutel];
  return RATINGS.includes(waarde) ? waarde : null;
}

type Luisteraar = (rating: OutfitRating) => void;
const luisteraars = new Map<string, Set<Luisteraar>>();

/** Meerdere instanties van dezelfde outfit op een pagina volgen elkaar zonder herlaad. */
export function abonneer(sleutel: string, cb: Luisteraar): () => void {
  const set = luisteraars.get(sleutel) ?? new Set<Luisteraar>();
  set.add(cb);
  luisteraars.set(sleutel, set);
  return () => {
    set.delete(cb);
    if (set.size === 0) luisteraars.delete(sleutel);
  };
}

export function bewaarKeuze(sleutel: string, rating: OutfitRating, opslag: Opslag | null = standaardOpslag()): void {
  try {
    if (opslag) {
      const alles = leesAlles(opslag);
      alles[sleutel] = rating;
      opslag.setItem(OPSLAG_SLEUTEL, JSON.stringify(alles));
    }
  } catch {
    // Niet kunnen onthouden is niet erg; de rij staat al in de database.
  }
  luisteraars.get(sleutel)?.forEach((cb) => cb(rating));
}

/**
 * De beslisregel van de knoppen: niet zonder hash, niet terwijl een
 * schrijfactie loopt, en niet als dit al de gekozen rating is. Dat laatste
 * is wat een herlaad gevolgd door dezelfde klik tegenhoudt.
 */
export function magSchrijven(
  stand: { profileHash: string | null; gekozen: OutfitRating | null; bezig: boolean },
  rating: OutfitRating
): boolean {
  if (!stand.profileHash) return false;
  if (stand.bezig) return false;
  if (stand.gekozen === rating) return false;
  return true;
}
```

- [ ] **Stap 4: Implementeer de component**

Maak `src/components/results/OutfitRatingButtons.tsx`:

```tsx
import React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { outfitKey, saveOutfitRating, type OutfitRating } from "@/services/ratings/outfitRatings";
import { getSessionId } from "@/utils/sessionId";
import track from "@/utils/telemetry";
import { abonneer, bewaarKeuze, leesKeuze, magSchrijven, onthoudSleutel } from "./outfitRatingGeheugen";

export interface OutfitRatingButtonsProps {
  outfitId: string;
  productIds: string[];
  /** sha256 van de quiz-antwoorden; null zolang die nog niet berekend is. */
  profileHash: string | null;
  userId?: string | null;
}

// Geen py-3: de hoogte komt uit min-h-[48px] met verticale centrering, en het
// design-check-script telt py-3 als overtreding.
const BASIS =
  "flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
const RUST = "border-[#E5E5E5] text-[#1A1A1A] hover:border-[#A85740]";
const GEKOZEN = "border-[#A85740] bg-[#F4E8E3] text-[#A85740]";

/**
 * Het stuurcijfer uit de spec (5.6, 6.6): per outfit "Zou ik dragen" of
 * "Nooit". Schrijft naar outfit_ratings; onthoudt de keuze per profiel en
 * outfit in localStorage zodat een herlaad geen tweede rij geeft.
 *
 * De beginstand komt uit de useState-initializer (niet uit een effect),
 * zodat hij ook bij renderToString en direct bij de eerste render klopt.
 * Verandert profileHash, geef dan een key mee zodat de component opnieuw
 * mount (zie EnhancedResultsPage).
 */
export function OutfitRatingButtons({ outfitId, productIds, profileHash, userId }: OutfitRatingButtonsProps) {
  const sleutel = onthoudSleutel(profileHash, outfitId);
  const [gekozen, setGekozen] = React.useState<OutfitRating | null>(() => (sleutel ? leesKeuze(sleutel) : null));
  const [bezig, setBezig] = React.useState(false);

  React.useEffect(() => {
    if (!sleutel) return;
    return abonneer(sleutel, (rating) => setGekozen(rating));
  }, [sleutel]);

  const kies = async (rating: OutfitRating) => {
    if (!profileHash || !sleutel) return;
    if (!magSchrijven({ profileHash, gekozen, bezig }, rating)) return;
    setBezig(true);
    const vorige = gekozen;
    setGekozen(rating);
    try {
      const key = await outfitKey(productIds);
      const uitkomst = await saveOutfitRating({
        profileHash,
        outfitKey: key,
        rating,
        sessionId: getSessionId(),
        userId: userId ?? null,
      });
      if (uitkomst.ok) {
        bewaarKeuze(sleutel, rating);
        track("outfit_rating", { outfit_id: outfitId, rating, item_count: productIds.length });
      } else {
        setGekozen(vorige);
        track("outfit_rating_failed", { outfit_id: outfitId, rating, reden: uitkomst.reden });
      }
    } finally {
      setBezig(false);
    }
  };

  const uitgeschakeld = !profileHash || bezig;

  return (
    <div
      className="mt-4 flex gap-2"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Zou je deze outfit dragen?"
    >
      <button
        type="button"
        disabled={uitgeschakeld}
        aria-pressed={gekozen === "zou_dragen"}
        onClick={() => kies("zou_dragen")}
        className={`${BASIS} ${gekozen === "zou_dragen" ? GEKOZEN : RUST}`}
      >
        <ThumbsUp className="w-5 h-5" aria-hidden="true" />
        Zou ik dragen
      </button>
      <button
        type="button"
        disabled={uitgeschakeld}
        aria-pressed={gekozen === "nooit"}
        onClick={() => kies("nooit")}
        className={`${BASIS} ${gekozen === "nooit" ? GEKOZEN : RUST}`}
      >
        <ThumbsDown className="w-5 h-5" aria-hidden="true" />
        Nooit
      </button>
    </div>
  );
}
```

- [ ] **Stap 5: Draai de tests en zie ze slagen**

```bash
npx vitest run src/components/results/__tests__/outfitRatingGeheugen.test.ts src/components/results/__tests__/OutfitRatingButtons.render.test.tsx
```

Verwacht: `Tests  13 passed (13)` (9 in de geheugen-test, 4 in de render-test).

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add src/components/results/outfitRatingGeheugen.ts src/components/results/OutfitRatingButtons.tsx src/components/results/__tests__/outfitRatingGeheugen.test.ts src/components/results/__tests__/OutfitRatingButtons.render.test.tsx
git commit -m "feat: knoppenpaar Zou ik dragen / Nooit met getest geheugen per profiel en outfit

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Verwacht bij de design-check: het totaal stijgt met precies zes, allemaal hex-kleuren uit de twee const-regels `RUST` en `GEKOZEN` (`border-[#...]` drie keer, `text-[#...]` twee keer, `bg-[#...]` een keer), niet door spacing, schaduw of tekstgrootte.

---

### Taak 10: Knoppenpaar op de drie plekken van de bestaande resultatenpagina

**Bestanden:**
- Wijzigen: `src/pages/EnhancedResultsPage.tsx` (imports regels 44-53; profile-hash na regel 234; top-3-sectie regels 780-908, kaarten rond 878-896; swipe-weergave rond regels 1531-1663; grid-weergave rond regels 1665-1760)
- Test: `npx tsc --noEmit`, `npx vite build`, handmatige controle in de browser en een tel-query op `outfit_ratings`

**Interfaces:**
- Gebruikt: `OutfitRatingButtons` uit taak 9; `hashProfile` uit taak 8; `answers` (regel 232, `readJson<any>(LS_KEYS.QUIZ_ANSWERS)`), `user` (regel 209), `displayOutfits`, `occasionFilteredOutfits`, `galleryMode`.

Waarom drie plekken: de roast van dit plan wees erop dat de sectie "Jouw top outfits / Direct aan de slag" (regel 780, zichtbaar voor elke bezoeker met een afgeronde quiz, op elk tabblad, direct na de hero) de meest zichtbare outfits toont en in het oorspronkelijke plan geen knoppen kreeg. Zonder knoppen daar zou `weekly_ratings` alleen bezoekers meten die doorklikken naar het tabblad Outfits. De knoppen komen daarom onder de `OutfitPreviewCard` in die sectie, onder de `ResultsOutfitCard` in het grid en in het info-blok van de swipe-kaart. Dezelfde outfit in top-3 en grid deelt de sleutel; taak 9 houdt beide instanties gelijk.

- [ ] **Stap 1: Voeg de imports toe**

Voeg na regel 45 (`import { ResultsOutfitCard } from "@/components/results/ResultsOutfitCard";`) toe:

```tsx
import { OutfitRatingButtons } from "@/components/results/OutfitRatingButtons";
import { hashProfile } from "@/services/ratings/outfitRatings";
```

- [ ] **Stap 2: Bereken de profile-hash**

Voeg direct na regel 234 (`const hasCompletedQuiz = !!answers;`) toe:

```tsx
  // profile_hash voor outfit_ratings: sha256 van de quiz-antwoorden. Async
  // omdat WebCrypto async is; tot die tijd staan de beoordelingsknoppen uit.
  const [profileHash, setProfileHash] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!answers) return;
    let actief = true;
    hashProfile(answers)
      .then((hash) => { if (actief) setProfileHash(hash); })
      .catch(() => { /* zonder hash blijven de knoppen uit */ });
    return () => { actief = false; };
  }, [answers]);

  // Product-ids van een outfit voor de outfit_key; dezelfde functie op alle
  // drie de plekken, zodat top-3 en grid dezelfde key opleveren.
  const productIdsVan = (outfit: any): string[] =>
    Array.isArray(outfit?.products) ? outfit.products.map((p: any) => String(p.id)) : [];
```

- [ ] **Stap 3: Top-3-sectie: knoppen onder elke `OutfitPreviewCard`**

Zoek in de sectie die begint met `Jouw top outfits` (regel 787) het blok:

```tsx
                          <AnimatedSection key={String(id)} delay={idx * 0.08}>
                            <OutfitPreviewCard
                              id={String(id)}
                              title={title}
                              description={shortDesc}
                              products={products}
                              pieces={pieces}
                              onShopClick={
                                hasShoppableProducts
                                  ? () => {
                                      setActiveTab('outfits');
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                  : undefined
                              }
                            />
                          </AnimatedSection>
```

en vervang het door:

```tsx
                          <AnimatedSection key={String(id)} delay={idx * 0.08}>
                            <OutfitPreviewCard
                              id={String(id)}
                              title={title}
                              description={shortDesc}
                              products={products}
                              pieces={pieces}
                              onShopClick={
                                hasShoppableProducts
                                  ? () => {
                                      setActiveTab('outfits');
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                  : undefined
                              }
                            />
                            <OutfitRatingButtons
                              key={profileHash ?? 'geen-hash'}
                              outfitId={String(id)}
                              productIds={productIdsVan(outfit)}
                              profileHash={profileHash}
                              userId={(user as any)?.id ?? null}
                            />
                          </AnimatedSection>
```

(In die sectie is `products` de lokaal omgebouwde lijst met terugval-ids `p-${idx}-${pIdx}`; daarom gaat `productIdsVan(outfit)` op het ruwe `outfit`, net als in het grid, zodat de `outfit_key` op beide plekken gelijk is.)

- [ ] **Stap 4: Grid-weergave: knoppen onder elke kaart**

Zoek in de grid-tak (`occasionFilteredOutfits.map((outfit, idx) => {` rond regel 1666) het blok:

```tsx
                    <AnimatedSection key={String(id)} delay={rowIndex === 0 ? colIndex * 0.08 : 0.05}>
                      <ResultsOutfitCard
```

en vervang de sluiting van dat blok:

```tsx
                        onImageError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          track("product_image_fallback_shown", {
                            outfit_id: String(id),
                            outfit_index: idx,
                            archetype: archetypeName,
                            source: "grid",
                          });
                        }}
                      />
                    </AnimatedSection>
```

door:

```tsx
                        onImageError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          track("product_image_fallback_shown", {
                            outfit_id: String(id),
                            outfit_index: idx,
                            archetype: archetypeName,
                            source: "grid",
                          });
                        }}
                      />
                      <OutfitRatingButtons
                        key={profileHash ?? 'geen-hash'}
                        outfitId={String(id)}
                        productIds={productIdsVan(outfit)}
                        profileHash={profileHash}
                        userId={(user as any)?.id ?? null}
                      />
                    </AnimatedSection>
```

- [ ] **Stap 5: Swipe-weergave (mobiel): knoppen in het info-blok**

Zoek in de swipe-tak (`renderCard={(outfit) => {` rond regel 1536) het einde van het info-blok:

```tsx
                          {answers?.fit && (
                            <span className="px-2.5 py-1 rounded-full bg-[#F5F0EB] text-xs font-medium text-[#4A4A4A]">{answers.fit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
```

en vervang het door:

```tsx
                          {answers?.fit && (
                            <span className="px-2.5 py-1 rounded-full bg-[#F5F0EB] text-xs font-medium text-[#4A4A4A]">{answers.fit}</span>
                          )}
                        </div>
                        <OutfitRatingButtons
                          key={profileHash ?? 'geen-hash'}
                          outfitId={String(id)}
                          productIds={productIdsVan(outfit)}
                          profileHash={profileHash}
                          userId={(user as any)?.id ?? null}
                        />
                      </div>
                    </div>
                  );
                }}
```

(`id` is in die tak al gedefinieerd als `const id = 'id' in outfit ? outfit.id : \`seed-${idx}\`;`.)

- [ ] **Stap 6: Poorten**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
node scripts/check-design-compliance.mjs | grep "Total Violations"
```

Verwacht: groen; het totaal van de design-check is gelijk aan na taak 9.

- [ ] **Stap 7: Handmatige controle in de browser en in de database**

`npm run dev`, doorloop de quiz, open `/results`.
1. Direct onder de hero, in "Jouw top outfits", staan onder elk van de drie kaarten "Zou ik dragen" en "Nooit", zonder naar een tabblad te klikken.
2. Klik daar "Zou ik dragen" bij de eerste kaart. Scroll naar het grid op het tabblad Outfits: dezelfde outfit staat daar ook op "Zou ik dragen" (het abonnement uit taak 9), zonder herlaad.
3. Klik in het grid "Nooit" bij een andere outfit. De gekozen knop wordt terracotta-licht; de kaart opent niet.
4. Herlaad: beide keuzes staan er nog, in het netwerk-tabblad geen nieuwe POST naar `outfit_ratings`.
5. Klik bij de eerste outfit nu "Nooit": een nieuwe POST.
6. Op een venster smaller dan 768px staan de knoppen in het info-blok van de swipe-kaart.

```bash
supabase db query --linked "select rating, count(*) from outfit_ratings group by 1" -o table
supabase db query --linked "select * from weekly_ratings" -o table
```

Verwacht: drie rijen in totaal (twee `nooit`, een `zou_dragen`); `weekly_ratings` toont `profielen = 1`, `beoordeeld_per_profiel = 2.00`, `pct_nooit = 100.0` (de laatste keuze per outfit telt). Ruim daarna op met `supabase db query --linked "delete from outfit_ratings where created_at > now() - interval '1 hour'"` als je eigen testrijen de meting niet mogen vervuilen.

- [ ] **Stap 8: Commit**

```bash
git add src/pages/EnhancedResultsPage.tsx
git commit -m "feat: beoordeling Zou ik dragen / Nooit onder elke outfit op /results, ook in de top-3-sectie

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 11: Persona-harnas `scripts/keten/persona-run.ts`

**Bestanden:**
- Aanmaken: `src/keten/personas.ts`
- Aanmaken: `scripts/keten/persona-run.ts`
- Wijzigen: `package.json` (blok `"scripts"`, na de regel `"keten:classificeer"`)
- Test: het script zelf is de test; hij eindigt met exit 0 of 1

**Interfaces:**
- Gebruikt: `createClient` uit `@supabase/supabase-js`; `naarKandidatenParams`, `bereidKandidatenVoor`, `telCategorieAfwijkingen`, `KandidaatRij` uit taak 6; `seedFromAnswers` uit taak 5; `runEngineV2(answers, products, { count, seed })` uit `src/engine/v2`; type `Outfit` uit `src/engine/types` (velden `id`, `title`, `occasion`, `products: Product[]`).
- Levert: npm-script `keten:personas`; `KETEN_PERSONAS`, type `KetenPersona` (`src/keten/personas.ts`) als canonieke bron van de vier persona's uit spec 5.7, ook gebruikt door plan 3 taak 8 (`scripts/keten/stylist-run.ts`), zodat een wijziging aan een persona op een plek gebeurt.

Wat de spec openlaat en hier is besloten:
- Spec 5.7 controleert "footwear met shoe_type = sandaal bij gelegenheid work". Er zijn nog geen tags, dus de controle kijkt naar de productnaam: footwear waarvan de naam `sandaal|sandal|slipper|teenslipper|flip-flop` bevat, of een accessory met `zwem` in de naam, bij een outfit met gelegenheid `work`. Plan 2 vervangt dit door `shoe_type`.
- De stap `compose-outfits` uit 5.7 bestaat nog niet (plan 3). Het harnas draait `runEngineV2` op de kandidaten met dezelfde seed als de app.
- De twee runs voor de determinisme-controle halen elk opnieuw de kandidaten op, zodat ook de RPC-volgorde wordt getest en niet alleen de engine.
- Extra controle (stopregel 2): `telCategorieAfwijkingen` moet 0 zijn. Anders geeft de classifier in de code een andere categorie dan `product_attributes`, en is de classificatie in de database verouderd.
- Poort voor Luc (spec 8): de uitvoer van dit script gaat naar Luc voordat plan 2 begint. Het script schrijft hem daarom ook naar `~/claude-artifacts/fitfi-keten/persona-run-<datum>.txt`.

- [ ] **Stap 1: Draai het nog niet bestaande script en zie het falen**

```bash
npx vite-node scripts/keten/persona-run.ts
```

Verwacht: een fout dat het bestand niet bestaat.

- [ ] **Stap 2: Schrijf de canonieke persona-data en het script**

Maak eerst `src/keten/personas.ts`. Dit is de enige bron van de vier persona's uit spec 5.7; plan 3 taak 8 importeert dit bestand in plaats van er een eigen versie van te maken:

```typescript
/**
 * Canonieke persona-data voor de feed-poort (spec 5.7).
 *
 * Een bron voor de vier vaste persona's, gebruikt door twee harnassen:
 * plan 1 (scripts/keten/persona-run.ts, get_kandidaten -> runEngineV2) en
 * plan 3 (scripts/keten/stylist-run.ts, get_kandidaten -> compose-outfits).
 * Bevat alleen de rauwe feiten uit de spec (naam, gender, gelegenheden,
 * budget, stijlvoorkeuren); elke afnemer leidt zelf zijn eigen vorm af
 * (quiz-antwoorden respectievelijk assen met zekerheid), zodat een wijziging
 * aan een persona op een plek gebeurt.
 */
export interface KetenPersona {
  naam: string;
  gender: "male" | "female";
  occasions: string[];
  budget_min: number;
  budget_max: number;
  stylePreferences: string[];
}

export const KETEN_PERSONAS: KetenPersona[] = [
  { naam: "man klassiek", gender: "male", occasions: ["work"], budget_min: 50, budget_max: 150, stylePreferences: ["classic"] },
  { naam: "vrouw minimalistisch", gender: "female", occasions: ["work", "date"], budget_min: 25, budget_max: 100, stylePreferences: ["minimalist"] },
  { naam: "man streetwear", gender: "male", occasions: ["casual", "party"], budget_min: 25, budget_max: 100, stylePreferences: ["streetwear"] },
  { naam: "vrouw romantisch", gender: "female", occasions: ["date", "travel"], budget_min: 25, budget_max: 75, stylePreferences: ["romantic"] },
];
```

Maak daarna `scripts/keten/persona-run.ts`:

```ts
/**
 * Persona-harnas (spec 5.7), versie plan 1: get_kandidaten -> runEngineV2.
 *
 * Draait vier vaste persona's tegen de live database en faalt (exit 1) als:
 *  - een persona minder dan zes outfits krijgt, of een outfit niet compleet is
 *    (top + bottom + footwear, of dress + footwear);
 *  - een item buiten het budget van de persona valt;
 *  - bij gelegenheid work een outfit footwear met sandaal/slipper in de naam
 *    of een accessory met "zwem" in de naam bevat (tot shoe_type er is);
 *  - twee outfits dezelfde itemset hebben;
 *  - twee runs achter elkaar verschillende outfits geven voor hetzelfde profiel;
 *  - de client-classifier het oneens is met product_attributes (stopregel 2).
 *
 * Gebruik:
 *   npm run keten:personas
 * VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY komen uit de shell of uit .env.
 * Waarden worden nooit gelogd. De uitvoer gaat ook naar
 * ~/claude-artifacts/fitfi-keten/persona-run-<datum>.txt voor de poort van Luc.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { runEngineV2 } from "../../src/engine/v2";
import type { Outfit, Product } from "../../src/engine/types";
import { KETEN_PERSONAS, type KetenPersona } from "../../src/keten/personas";
import { seedFromAnswers } from "../../src/services/outfits/answersSeed";
import {
  bereidKandidatenVoor,
  naarKandidatenParams,
  telCategorieAfwijkingen,
  type KandidaatRij,
} from "../../src/services/outfits/kandidaten";

function leesDotEnv(): Record<string, string> {
  const pad = new URL("../../.env", import.meta.url).pathname;
  if (!existsSync(pad)) return {};
  const uit: Record<string, string> = {};
  for (const regel of readFileSync(pad, "utf8").split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) uit[m[1]] = m[2];
  }
  return uit;
}

const dotenv = leesDotEnv();
const url = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY ?? dotenv.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Geen Supabase-credentials gevonden. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in je omgeving of in .env."
  );
  process.exit(1);
}

interface Persona {
  naam: string;
  answers: Record<string, any>;
}

// Fit is geen onderdeel van de canonieke persona-data (die is voor alle
// afnemers hetzelfde); alleen dit harnas heeft "fit" nodig voor runEngineV2,
// dus die vertaling staat hier, niet in src/keten/personas.ts.
const FIT_PER_STYLE: Record<string, string> = {
  classic: "regular",
  minimalist: "regular",
  streetwear: "relaxed",
  romantic: "regular",
};

function persoonaAnswers(p: KetenPersona): Record<string, any> {
  return {
    gender: p.gender,
    stylePreferences: p.stylePreferences,
    occasions: p.occasions,
    budget: { min: p.budget_min, max: p.budget_max },
    fit: FIT_PER_STYLE[p.stylePreferences[0]] ?? "regular",
  };
}

const PERSONAS: Persona[] = KETEN_PERSONAS.map((p) => ({ naam: p.naam, answers: persoonaAnswers(p) }));

const AANTAL_OUTFITS = 6;
const SANDAAL_RE = /\b(sandaal|sandalen|sandal|sandals|slipper|slippers|teenslipper|flip-?flops?)\b/i;
const ZWEM_RE = /zwem/i;

const CATEGORIE_ALIAS: Record<string, string> = {
  top: "top", tops: "top", shirt: "top", shirts: "top",
  bottom: "bottom", bottoms: "bottom", pants: "bottom", trousers: "bottom",
  footwear: "footwear", shoe: "footwear", shoes: "footwear",
  outerwear: "outerwear", jacket: "outerwear", coat: "outerwear",
  accessory: "accessory", accessories: "accessory", bag: "accessory",
  dress: "dress", dresses: "dress", skirt: "dress",
  jumpsuit: "jumpsuit",
};

const regels: string[] = [];
function log(regel: string): void {
  console.log(regel);
  regels.push(regel);
}

function categorieVan(p: Product): string {
  const raw = String(p.category ?? "").toLowerCase().trim();
  return CATEGORIE_ALIAS[raw] ?? raw;
}

function itemset(outfit: Outfit): string {
  return outfit.products.map((p) => String(p.id)).sort().join(",");
}

function isCompleet(outfit: Outfit): boolean {
  const cats = new Set(outfit.products.map(categorieVan));
  const metSchoen = cats.has("footwear");
  return metSchoen && ((cats.has("top") && cats.has("bottom")) || cats.has("dress") || cats.has("jumpsuit"));
}

const client = createClient(url, key);

async function haalKandidaten(answers: Record<string, any>): Promise<{ rijen: KandidaatRij[]; pool: Product[] }> {
  const params = naarKandidatenParams(answers);
  const { data, error } = await client.rpc("get_kandidaten", params);
  if (error) throw new Error(`get_kandidaten faalde: ${error.message}`);
  const rijen = (data ?? []) as KandidaatRij[];
  return { rijen, pool: bereidKandidatenVoor(rijen) };
}

function bouwOutfits(answers: Record<string, any>, pool: Product[]): Outfit[] {
  return runEngineV2(answers, pool, { count: AANTAL_OUTFITS, seed: seedFromAnswers(answers) }).outfits;
}

function controleer(persona: Persona, outfits: Outfit[], tweedeRun: Outfit[], afwijkingen: number): string[] {
  const fouten: string[] = [];
  const budget = naarKandidatenParams(persona.answers);

  if (afwijkingen > 0) {
    fouten.push(`${afwijkingen} kandidaten waar de client-classifier een andere categorie geeft dan product_attributes (draai npm run keten:classificeer opnieuw)`);
  }

  if (outfits.length < AANTAL_OUTFITS) {
    fouten.push(`minder dan ${AANTAL_OUTFITS} outfits: ${outfits.length}`);
  }

  outfits.forEach((outfit, i) => {
    const label = `outfit ${i + 1} (${outfit.title})`;
    if (!isCompleet(outfit)) {
      fouten.push(`${label} is niet compleet: ${outfit.products.map(categorieVan).join(", ")}`);
    }
    for (const p of outfit.products) {
      const prijs = typeof p.price === "number" ? p.price : Number(p.price);
      if (!(prijs >= budget.p_budget_min && prijs <= budget.p_budget_max)) {
        fouten.push(`${label}: "${p.name}" kost ${prijs}, buiten ${budget.p_budget_min}-${budget.p_budget_max}`);
      }
      const isWerk = String(outfit.occasion ?? "").toLowerCase() === "work";
      if (isWerk && categorieVan(p) === "footwear" && SANDAAL_RE.test(p.name ?? "")) {
        fouten.push(`${label}: sandaal/slipper bij werk: "${p.name}"`);
      }
      if (isWerk && categorieVan(p) === "accessory" && ZWEM_RE.test(p.name ?? "")) {
        fouten.push(`${label}: zwemaccessoire bij werk: "${p.name}"`);
      }
    }
  });

  const sets = outfits.map(itemset);
  sets.forEach((s, i) => {
    const eerder = sets.indexOf(s);
    if (eerder !== i) fouten.push(`outfit ${i + 1} heeft dezelfde itemset als outfit ${eerder + 1}`);
  });

  const a = sets.join("|");
  const b = tweedeRun.map(itemset).join("|");
  if (a !== b) fouten.push("tweede run gaf andere outfits voor hetzelfde profiel");

  return fouten;
}

function printOutfits(outfits: Outfit[]): void {
  outfits.forEach((outfit, i) => {
    log(`  ${i + 1}. ${outfit.title} [${outfit.occasion}]`);
    for (const p of outfit.products) {
      const prijs = typeof p.price === "number" ? p.price.toFixed(2) : String(p.price);
      log(`       ${categorieVan(p).padEnd(9)} ${String(p.brand ?? "").padEnd(18)} ${String(p.name).slice(0, 60)}  EUR ${prijs}`);
    }
  });
}

function schrijfRapport(): string {
  const map = join(homedir(), "claude-artifacts", "fitfi-keten");
  mkdirSync(map, { recursive: true });
  const pad = join(map, `persona-run-${new Date().toISOString().slice(0, 10)}.txt`);
  writeFileSync(pad, regels.join("\n") + "\n", "utf8");
  return pad;
}

async function main(): Promise<void> {
  let totaalFouten = 0;
  log(`Persona-harnas plan 1, ${new Date().toISOString()}`);

  for (const persona of PERSONAS) {
    log(`\n=== ${persona.naam} ===`);
    const eerste = await haalKandidaten(persona.answers);
    const perCategorie = eerste.rijen.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    }, {});
    const afwijkingen = telCategorieAfwijkingen(eerste.rijen, eerste.pool);
    log(`  kandidaten: ${eerste.rijen.length} rijen, ${eerste.pool.length} na veiligheidsnet, ${afwijkingen} categorie-afwijkingen ${JSON.stringify(perCategorie)}`);

    const outfits = bouwOutfits(persona.answers, eerste.pool);
    const tweede = await haalKandidaten(persona.answers);
    const tweedeRun = bouwOutfits(persona.answers, tweede.pool);

    printOutfits(outfits);

    const fouten = controleer(persona, outfits, tweedeRun, afwijkingen);
    if (fouten.length === 0) {
      log("  GROEN");
    } else {
      totaalFouten += fouten.length;
      log(`  ROOD (${fouten.length}):`);
      for (const f of fouten) log(`    - ${f}`);
    }
  }

  log(`\n${totaalFouten === 0 ? "Alle persona's groen." : `${totaalFouten} controle(s) rood.`}`);
  const pad = schrijfRapport();
  console.log(`Rapport: ${pad}`);
  process.exit(totaalFouten === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Harnas gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
```

- [ ] **Stap 3: Voeg het npm-script toe**

Voeg in `package.json` in het blok `"scripts"`, na de regel `"keten:classificeer": "vite-node scripts/keten/classificeer-attributes.ts",`, toe:

```json
    "keten:personas": "vite-node scripts/keten/persona-run.ts",
```

- [ ] **Stap 4: Draai het harnas**

```bash
npm run keten:personas; echo "exit=$?"
```

Verwacht: per persona een kandidatentelling groter dan 0 met `0 categorie-afwijkingen`, zes outfits met items en prijzen, en `GROEN`. Laatste regels `Alle persona's groen.`, `Rapport: /Users/.../claude-artifacts/fitfi-keten/persona-run-<datum>.txt` en `exit=0`.

Als een persona rood is, is dat een bevinding over de catalogus of de engine en geen reden om de controle te versoepelen. Noteer de rode regels letterlijk in de commit-boodschap van deze taak (`Bekend rood: ...`), zodat plan 2 en 3 weten waar ze op sturen. Uitzondering: categorie-afwijkingen groter dan 0 is stopregel 2; draai dan taak 2 stap 6 opnieuw en pas daarna dit harnas. De poort "elke week groen op H&M" uit spec 8 wordt pas na plan 2 gehaald; dit plan levert het harnas.

- [ ] **Stap 5: Poort voor Luc**

Stuur het rapport-bestand naar Luc (spec 8: "Luc heeft de outfits gezien") en vraag om een reactie op drie punten: zijn de outfits per persona geloofwaardig als "zou ik dragen", welke van de rode regels (als die er zijn) moet plan 2 als eerste oplossen, en mag plan 2 beginnen. Leg zijn antwoord vast in de commit-boodschap hieronder (`Luc: ...`). Plan 2 begint niet zonder dat antwoord.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
git add scripts/keten/persona-run.ts package.json
git commit -m "feat: persona-harnas door get_kandidaten en engine v2 met controles uit spec 5.7

Bekend rood: <regels of 'geen'>.
Luc: <reactie op het rapport>.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Zelfcontrole

| Spec-eis | Taak |
|---|---|
| 9.1 `product_attributes` met alleen dedupe en ruwe velden (category, gender, price_band uit `products`) | Taak 1; de categorie wordt in taak 2 gecorrigeerd met de bestaande classifier omdat de ruwe categorie in 50.618 gevallen aantoonbaar fout is (Controle vooraf) |
| 5.1 kolommen `product_id`, `canonical_id`, `is_fashion`, `category`, `gender`, `price_band`, `embedding`, `tagged_at`; pgvector aan | Taak 1 (plus `classifier_version`, nodig om te weten welke rijen door de classifier zijn gegaan) |
| 5.1 indexen op `canonical_id` en `(gender, category, price_band)`; RLS lezen voor iedereen, schrijven alleen service role | Taak 1 (ivfflat op `embedding` volgt in plan 2 zodra er vectoren zijn; `zet_classificatie` alleen voor `service_role`) |
| 5.1 dedupe op retailer + merk + genormaliseerde naam, goedkoopste in-stock variant canoniek | Taak 1, `vul_product_attributes` |
| 5.1 `is_fashion` false voor niet-kleding en kinderen | Taak 1 (heuristiek op categorie, `is_kids` en woordenlijst) en taak 2 (afwijzingen van de classifier: kinderen, multipacks, ondergoed, nachtkleding, woonartikelen) |
| 5.1 `category` een van de zes waarden, anders `is_fashion` false | Taak 1 (ruw) en taak 2 (classifier; jumpsuit en underwear geven null) |
| 5.3 RPC `get_kandidaten` met exacte signatuur, alle filters (canoniek, fashion, voorraad, gender, budget, disliked), top `p_per_category` per categorie, deterministisch | Taak 3 |
| 9.1 `get_kandidaten` zonder tags: score 0, volgorde op prijsafstand en `product_id` | Taak 3 |
| Roast: afkappen per categorie moet op de gecorrigeerde categorie gebeuren, niet op de ruwe | Taak 2 (classificatie in de database) en taak 3 (`partition by pa.category`); taak 6 neemt `rij.category` over in de pool; taak 11 meet afwijkingen (stopregel 2) |
| 5.6 `outfit_ratings` met kolommen uit de spec, RLS insert voor anon met `session_id`, geen update | Taak 4 |
| 5.6 view `weekly_ratings` per ISO-week: profielen, percentage zou_dragen, percentage nooit, gemiddeld beoordeeld per profiel | Taak 4 |
| 6.6 / 9.1 knoppen "Zou ik dragen" en "Nooit" per outfit op de bestaande `/results` | Taak 9 (component), taak 10 (top-3-sectie, grid en swipe) |
| Roast: geen dubbele insert na herlaad en keuze onthouden moet getest zijn | Taak 9: `outfitRatingGeheugen.test.ts` (lezen, schrijven, `magSchrijven` na herlaad, abonnees) en `OutfitRatingButtons.render.test.tsx` (onthouden keuze uit gestubde localStorage als `aria-pressed`); taak 10 stap 7 blijft als browsercontrole |
| `profile_hash` = sha256 van de quiz-antwoorden in localStorage (`LS_KEYS.QUIZ_ANSWERS`) | Taak 5 (hash), taak 8 (`hashProfile`), taak 10 (berekening op de pagina) |
| 5.6 `outfit_key` = gesorteerde product-ids, gehasht | Taak 8; taak 10 gebruikt op alle drie de plekken dezelfde `productIdsVan` |
| 2 / 9.1 het venster van 1.000 rijen is weg: `outfitService.getProducts` via `get_kandidaten` met gender, occasions, budget, lege axes en lege liked/disliked | Taak 6 (vertaling), taak 7 (aanroep) |
| 5.1 `dedupeProductVariants` (client) vervalt in de pool | Taak 6 en 7 (niet meer aangeroepen in `getProducts`; het bestand blijft voor `scripts/visual-embeddings/dupe-audit.ts`) |
| 2 / 9.1 vaste seed in `outfitService.generateOutfits` uit de hash van de antwoorden-JSON | Taak 5 (`seedFromAnswers`), taak 7 |
| 5.7 `scripts/keten/persona-run.ts` met vier persona's, `get_kandidaten` en `runEngineV2`, controles: zes outfits en compleet, budget, sandaal/zwem bij work, geen dubbele itemsets, twee runs gelijk | Taak 11 |
| 5.7 anon-key uit `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` als omgevingsvariabelen | Taak 11 (shell of `.env`) |
| 8 "Luc heeft de outfits gezien" voor de volgende stap | Taak 11 stap 5 (rapport in `~/claude-artifacts/fitfi-keten/`, reactie in de commit) |
| 7 engine v2 niet aangepast; `products` niet aangeraakt; bestaande `/results` blijft staan | Alle taken (alleen nieuwe tabellen, functies en bestanden; `productClassifier.ts` wordt geimporteerd, niet gewijzigd; `EnhancedResultsPage` krijgt alleen het knoppenpaar) |
| 8 poorten per taak: tsc, vitest, vite build, design-check | Elke taak, stap "Poorten en commit" |
| Roast: tijd, kosten, betrokkenen, tripwires | Secties "Omvang en tijd", "Stopregels" en "Controle vooraf" bovenaan; meetpunten in taak 1 stap 6 en 8, taak 2 stap 7 en 8 |
| Roast: pre-commitment-query voor de start | "Controle vooraf": 50.618 op 2026-09-15, opnieuw 50.618 op 2026-09-16 |
| Roast: SQL-vertaling van `reclassifyProducts` in de RPC | Niet overgenomen, reden in "Controle vooraf": een derde kopie van de classifier; taak 2 bereikt hetzelfde met de bestaande TypeScript-functie |
| Roast: jsdom- of e2e-test voor het herlaad-gedrag | Niet letterlijk overgenomen (geen jsdom, happy-dom of Playwright in `node_modules`, en geen nieuwe afhankelijkheden in dit plan); in plaats daarvan taak 9: pure geheugen-module met injecteerbare opslag en een render-test met gestubde `localStorage` |
| Stand van uitvoering: taak 1 stap 1 tot en met 5 al gedaan, `hash.ts` bestaat al | Sectie "Stand van uitvoering"; taak 1 stap 1, 3 en 5 benoemen de bestaande stand; taak 5 wijzigt `hash.ts` in plaats van het aan te maken |
| CLAUDE.md design system: palet, `rounded-xl`, 48px, Lucide `w-5 h-5`, tekst minimaal 14px, Nederlands met je/jij | Taak 9 |
