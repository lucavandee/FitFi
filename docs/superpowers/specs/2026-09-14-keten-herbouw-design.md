# Keten-herbouw: van keuze naar outfit

Datum: 2026-09-14. Status: besloten met Luc (grill-sessie, zeven vragen). Bron: `~/claude-artifacts/brainstorms/fitfi-engine-herontwerp/2026-09-14-audit-onboarding-tot-outfit.md` en `grill-2026-09-14-fitfi-onboarding-outfits.md`.

## 1. Doel

Een bezoeker doorloopt in minder dan drie minuten een onboarding die uit keuzes tussen echte outfits bestaat, en krijgt zes outfits uit de hele catalogus waarvan hij er vier "zou dragen". Dat cijfer wordt in het product gemeten. Elke nieuwe aanbieder gaat door dezelfde pijplijn en dezelfde poort.

## 2. Wat er nu is en waarom dat niet werkt

Kort, de audit heeft de details:

- `outfitService.getProducts` haalt producten zonder `limit` en `order` op; Supabase kapt af op 1.000 rijen in rijvolgorde. De engine ziet 1.000 van circa 287.000 producten (0 H&M).
- De `products`-tabel heeft geen formaliteit, gelegenheid, silhouet of betrouwbare categorie. Engine v2 compenseert met regex op productnamen.
- Drie archetype-berekeningen spreken elkaar tegen; alleen die in `buildProfile.ts` bepaalt outfits.
- Kalibratie-feedback komt nergens aan; swipes wegen 5,5 procent; selfie-analyse crasht op `corsHeaders`.
- Geen seed in productie: elke vijf minuten andere outfits.
- Niets wordt gemeten. `results_feedback` heeft 2 rijen ooit.

## 3. Besluiten (niet opnieuw ter discussie)

1. Stuurcijfer: "zou ik dragen" per outfit, doel vier van de zes. Kliks worden gelogd, sturen niet.
2. Pijplijn is aanbieder-onafhankelijk: import, dedupe, tagging naar een vast schema, kandidaten aan de serverkant. Nieuwe aanbieder telt pas mee na de feed-poort. H&M eerst, Giglio als tweede formaat, Bijenkorf later.
3. Archetypen vervallen als engine-invoer. Profiel = eigenschappen van gekozen en afgewezen outfits plus harde feiten.
4. Compositie door een stylist-model als hoofdpad, gecachet per profiel. Harde regels ervoor en erna. Engine v2 alleen als noodpad bij API-storing.
5. Onboarding: vier feiten plus 6 tot 12 adaptieve dit-of-dat-paren. Selfie eruit. Maten na de resultaten.
6. Eerst intern perfect (vier persona's als poort), dan pas mensen.

## 4. Architectuur

```
feed (Daisycon, later Awin) --> products (ruw, blijft zoals hij is)
                                   |
                     [dedupe] --> product_attributes.canonical_id
                     [tagging, Haiku 4.5 batch] --> product_attributes (schema 5.1)
                     [FashionCLIP, lokaal] --> product_attributes.embedding
                                   |
onboarding v2 --> taste_profiles (5.2) --> RPC get_kandidaten (5.3) --> edge function compose-outfits (5.4)
                                                                            |  cache: outfit_sets (5.5)
                                                                            v
                                                          /results v2 --> outfit_ratings (5.6)
feed-poort: scripts/keten/persona-run.ts (5.7) draait de hele keten voor vier persona's
```

De `products`-tabel blijft de ruwe feed. Alles wat afgeleid is, staat in `product_attributes`, zodat een her-tagging of een nieuwe feed nooit de bron aanraakt.

## 5. Contracten

### 5.1 `product_attributes` (1 op 1 met `products.id`)

| Kolom | Type | Betekenis |
|---|---|---|
| product_id | uuid PK, FK products | |
| canonical_id | uuid | het product dat deze rij vertegenwoordigt na dedupe; gelijk aan product_id als het zelf canoniek is |
| is_fashion | boolean | false voor vazen, lampen, servies, fan-merch, kinderen |
| category | text | top, bottom, footwear, outerwear, dress, accessory; anders is_fashion false |
| gender | text | male, female, unisex |
| formality | smallint 1..5 | 1 sport/loungewear, 3 smart casual, 5 formeel |
| occasions | text[] | uit: work, casual, formal, date, travel, sport, party |
| silhouette | text | slim, regular, relaxed, oversized |
| color_temp | text | warm, koel, neutraal |
| lightness | text | licht, medium, donker |
| pattern | text | effen, subtiel, statement |
| shoe_type | text, null | sneaker, net, laars, sandaal, null als geen footwear |
| colors | text[] | genormaliseerd Nederlands: zwart, wit, grijs, navy, beige, camel, bruin, groen, rood, roze, blauw, geel, paars, oranje, multicolor |
| materials | text[] | katoen, wol, denim, linnen, leer, synthetisch, zijde, tricot, onbekend |
| seasons | text[] | lente, zomer, herfst, winter |
| price_band | text | tot50, 50tot100, 100tot200, boven200 (uit products.price) |
| confidence | real 0..1 | van de tagger |
| tagger_version | text | bijvoorbeeld haiku-4.5-v1 |
| embedding | vector(512), null | FashionCLIP |
| tagged_at | timestamptz | |

Indexen: canonical_id, (gender, category, price_band), GIN op occasions, ivfflat op embedding. RLS: lezen voor iedereen, schrijven alleen service role.

De tagger krijgt naam, merk, beschrijving, prijs, retailer en de bestaande ruwe categorie; alleen als `confidence < 0.6` krijgt hij in een tweede ronde ook de foto. Uitvoer is strikt dit schema (structured output), een product per verzoek, via de Batch API. Idempotent: een rij met dezelfde `tagger_version` wordt overgeslagen.

Dedupe: twee producten zijn duplicaat als retailer en `image_url` gelijk zijn (dezelfde foto is hetzelfde product in een andere maat; een andere kleur heeft een andere foto en blijft een eigen product), of als de embeddings cosine >= 0.999 hebben. Alleen als `image_url` leeg is, geldt als terugval: retailer, merk en genormaliseerde naam gelijk. De goedkoopste in-stock variant wordt canoniek. De bestaande `dedupeProductVariants` (client) vervalt zodra dit staat.

Waarom niet op naam: gemeten op 16 september. Giglio schrijft namen als "Sneakers AUTRY Woman color White"; de naam zonder kleur is dan voor 1.280 verschillende producten met 286 verschillende foto's gelijk. Naam-dedupe hield van 169.697 Giglio-rijen er 10.209 over, terwijl er 68.739 unieke foto's zijn.

Waarom wel op foto: 281.999 rijen hebben 100.849 unieke `image_url`'s en geen enkele rij heeft een lege `image_url`. Van de 58.212 groepen die een foto delen (gemiddeld 4,1 rijen) hebben er 58.203 precies een kleur; de negen uitzonderingen zijn dezelfde artikelen met inconsistente kleurtags, geen echte kleurvarianten. Dezelfde foto is dus dezelfde look in een andere maat of prijsvariant. Dat spoort met de 45 procent duplicaten die de FashionCLIP-PoC in augustus op identieke beelden mat. De naam-terugval is daarmee nu dode code; hij blijft staan voor een toekomstige feed zonder foto-URL's.

Per retailer na foto-dedupe: Giglio 68.739 van 169.697; H&M 24.815 van 88.043; PUMA 4.143 van 14.420; Mart Visser 1.009 van 6.847; OFM 2.125 van 2.973; The New Originals 18 van 19.

### 5.2 `taste_profiles`

| Kolom | Type | Betekenis |
|---|---|---|
| id | uuid PK | |
| profile_hash | text unique | sha256 van de genormaliseerde invoer (5.2.1), bepaalt de cache |
| user_id | uuid null | |
| session_id | text | |
| gender | text | male, female, unisex (non-binary en prefer-not-to-say worden unisex) |
| occasions | text[] | maximaal drie |
| budget_min, budget_max | integer | per stuk |
| nogo_product_ids | uuid[] | uit het no-go-scherm |
| choices | jsonb | lijst van {pair_id, chosen_set_id, rejected_set_id, axis} |
| axes | jsonb | afgeleid: {formality: {value, confidence}, silhouette, color_temp, lightness, pattern, shoe_type} |
| liked_product_ids | uuid[] | alle items uit gekozen outfits |
| disliked_product_ids | uuid[] | alle items uit afgewezen outfits plus no-go's |
| created_at | timestamptz | |

5.2.1 Normalisatie voor de hash: gender, gesorteerde occasions, budget_min, budget_max, gesorteerde nogo ids, gesorteerde lijst van (pair_id, chosen_set_id). Twee mensen met dezelfde keuzes krijgen dezelfde outfits; dat is gewenst.

Afleiding van `axes`: per as tel je de keuzes waarin de twee outfits op die as verschilden; value is de kant met de meerderheid, confidence is |gekozen - afgewezen| / aantal keuzes op die as. Een as met confidence < 0.5 is "onzeker" en stuurt de adaptieve paarselectie (7.3).

### 5.3 RPC `get_kandidaten`

```sql
get_kandidaten(
  p_gender text, p_occasions text[], p_budget_min int, p_budget_max int,
  p_axes jsonb, p_liked_ids uuid[], p_disliked_ids uuid[],
  p_per_category int default 12
) returns table (product_id uuid, category text, score real, attrs jsonb, product jsonb)
```

Werkt uitsluitend op `product_attributes` waar `product_id = canonical_id`, `is_fashion`, `products.in_stock`, gender in (p_gender, 'unisex'), prijs binnen budget, niet in p_disliked_ids. Score = 0.5 * as-overeenkomst (aantal assen waarop attrs gelijk is aan axes.value, gewogen met confidence) + 0.3 * gelegenheid-overlap + 0.2 * max cosine-similariteit met p_liked_ids (0 als leeg). Geeft de top `p_per_category` per categorie terug (top, bottom, footwear, outerwear, dress, accessory), dus maximaal 72 rijen. Deterministisch: bij gelijke score op product_id.

### 5.4 Edge function `compose-outfits`

Input: `{ profile_hash, profile: taste_profiles-rij, kandidaten: uitvoer van 5.3 }`.

1. Cache-hit op `outfit_sets.profile_hash` met dezelfde `stylist_version`: return.
2. Anders Claude (model via env `STYLIST_MODEL`, default `claude-sonnet-5`) met structured output:
   ```json
   { "outfits": [ { "title": "max 6 woorden", "occasion": "een uit profile.occasions",
       "items": [ { "product_id": "uuid", "role": "top|bottom|footwear|outerwear|dress|accessory" } ],
       "reason": "twee zinnen, Nederlands, verwijst naar iets concreets uit de items" } ] }
   ```
   Prompt bevat: de harde feiten, de assen met confidence, de gekozen en afgewezen items als voorbeelden van smaak, en de kandidaten met hun attributen en prijs. Instructie: zes outfits, elke gelegenheid uit het profiel minstens een keer, geen twee outfits met hetzelfde top of dezelfde jurk, alleen product_ids uit de kandidatenlijst.
3. Harde validatie na het model, elke overtreding verwerpt de outfit: elk id in de kandidaten; compleet (top+bottom+footwear, of dress+footwear; outerwear en accessory optioneel); geen id uit disliked; elk item binnen budget; geen twee outfits met dezelfde itemset. Minder dan vier geldige outfits: een keer opnieuw met de fouten in de prompt; daarna noodpad.
4. Noodpad: engine v2 (`runEngineV2`) op dezelfde kandidaten met `seed = hash(profile_hash)`, gemarkeerd `source = 'v2-fallback'`.
5. Schrijf naar `outfit_sets` en return.

Copy-regels uit CLAUDE.md gelden voor `title` en `reason`: je/jij, geen buzzwords, geen claims over de gebruiker die niet uit de keuzes volgen.

### 5.5 `outfit_sets`

| Kolom | Type |
|---|---|
| profile_hash | text PK samen met stylist_version |
| stylist_version | text |
| source | text: stylist, v2-fallback |
| outfits | jsonb (het schema uit 5.4, verrijkt met de productdata) |
| model | text |
| latency_ms | integer |
| created_at | timestamptz |

### 5.6 `outfit_ratings`

| Kolom | Type |
|---|---|
| id | uuid |
| profile_hash | text |
| outfit_key | text (gesorteerde product_ids, gehasht) |
| rating | text: zou_dragen, nooit |
| session_id | text |
| user_id | uuid null |
| created_at | timestamptz |

RLS: insert voor anon met session_id, geen update. Een view `weekly_ratings` geeft per ISO-week: aantal profielen, percentage zou_dragen, percentage nooit, gemiddeld aantal beoordeelde outfits per profiel. Kliks naar de winkel blijven in `affiliate_clicks`.

### 5.7 Feed-poort en persona-harnas

`scripts/keten/persona-run.ts` (vite-node) draait voor vier vaste persona's (man klassiek werk 50-150; vrouw minimalistisch werk en date 25-100; man streetwear casual en uitgaan 25-100; vrouw romantisch date en reizen 25-75) de hele keten tegen de live database: profiel bouwen uit vaste keuzes, `get_kandidaten`, `compose-outfits`, en print de outfits. Controles die falen als:

- minder dan zes outfits, of een outfit niet compleet;
- een item buiten budget;
- footwear met `shoe_type = sandaal` of category accessory met "zwem" in de naam bij gelegenheid work;
- twee outfits met dezelfde itemset;
- twee runs achter elkaar geven verschillende outfits voor hetzelfde profiel.

Een feed telt pas mee als de harnas-run met alleen die feed groen is en de dekkingsmatrix (gender x gelegenheid x prijsband) geen lege cel heeft in de banden tot50 en 50tot100.

## 6. Onboarding v2 (route `/start`, achter vlag `keten_v2` in `remote_flags`)

1. Voor wie: dames, heren, beide (unisex).
2. Gelegenheden: maximaal drie uit work, casual, formal, date, travel, sport, party.
3. Budget per stuk: drie echte producten uit de catalogus als anker (rond 30, 80 en 180 euro), de bezoeker kiest de band; onder de motorkap budget_min/budget_max.
4. No-go: zes items, tik wat je nooit draagt. Items komen uit `get_kandidaten` met lege assen.
5. Dit-of-dat: twee outfits naast elkaar uit `pair_sets` (7.2), minimaal 6, maximaal 12 paren. Na elke keuze herberekening van `axes`; de volgende paar komt uit de as met de laagste confidence; stoppen zodra elke as confidence >= 0.5 heeft of bij 12.
6. Resultaten: `/results` v2 toont zes outfits met titel, reden, items met prijs en "Bekijk bij partner", en per outfit twee knoppen: "Zou ik dragen" en "Nooit". Maten optioneel onder de outfits.

Elke stap stuurt `track('onboarding_step', { step, index })`; afbreken stuurt `onboarding_abandoned` met de stap.

### 7.2 `pair_sets`

Vooraf gegenereerd per segment (gender x gelegenheid x prijsband), per as minstens vier paren. Een paar is twee complete outfits die op precies een as verschillen en verder zo gelijk mogelijk zijn (zelfde gelegenheid, zelfde prijsband, zelfde kleurfamilie). Gegenereerd door `compose-outfits` in een aparte modus (`mode: 'pair', axis, side`) en vastgelegd met product_ids en beeld-URL's. Regeneratie als een item uit voorraad gaat.

## 7. Wat bewust niet

- Nova-chat, premium, dashboard, kleuranalyse via selfie.
- Engine v2 aanpassen; hij blijft als noodpad zoals hij is, met seed.
- Dode code opruimen; dat is een aparte sanering.
- Bestaande `/onboarding` en `/results` verwijderen voordat de vlag om is.

## 8. Poorten

- Elke taak: `npx tsc --noEmit`, `npx vitest run`, `npx vite build`, en `npm run design:check:ci` groen.
- Elke week: `scripts/keten/persona-run.ts` groen op H&M.
- Voor de vlag omgaat: de vier persona's groen, Luc heeft de outfits gezien, en `weekly_ratings` vult zich.

## 9. Volgorde en plannen

Vier plannen in `docs/superpowers/plans/`, elk apart uitvoerbaar en testbaar:

1. `2026-09-14-plan-1-fundament.md`: `product_attributes` met alleen dedupe en de ruwe velden (category, gender, price_band uit `products`), `get_kandidaten` zonder tags, `outfit_ratings` plus widget op de bestaande `/results`, seed in `outfitService`, persona-harnas. Doel: het venster is weg en de meting loopt, op de bestaande engine.
2. `2026-09-14-plan-2-tagging.md`: tagging-batch, embeddings, feed-poort, dekkingsmatrix, cron voor feed en voorraad, link-checker aangesloten.
3. `2026-09-14-plan-3-stylist.md`: `compose-outfits`, `outfit_sets`, validatie, noodpad, persona-harnas op de nieuwe keten.
4. `2026-09-14-plan-4-onboarding.md`: `taste_profiles`, `pair_sets`, `/start`, `/results` v2, vlag `keten_v2`, events.
