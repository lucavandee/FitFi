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
| materials | text[] | katoen, wol, denim, linnen, leer, suede, synthetisch, zijde, tricot, viscose, canvas, dons, rubber, onbekend (uitgebreid 24 sep 2026, zie hieronder) |
| seasons | text[] | lente, zomer, herfst, winter |
| price_band | text | tot50, 50tot100, 100tot200, boven200 (uit products.price) |
| confidence | real 0..1 | van de tagger |
| tagger_version | text | bijvoorbeeld haiku-4.5-v1 |
| embedding | vector(512), null | FashionCLIP |
| tagged_at | timestamptz | |

Indexen: canonical_id, (gender, category, price_band), GIN op occasions, ivfflat op embedding. RLS: lezen voor iedereen, schrijven alleen service role.

De tagger krijgt naam, merk, beschrijving, prijs, retailer en de bestaande ruwe categorie; alleen als `confidence < 0.6` krijgt hij in een tweede ronde ook de foto. Uitvoer volgt strikt dit schema. Idempotent: een rij met dezelfde `tagger_version` wordt overgeslagen.

> **AMENDEMENT (27 september 2026, na de eindreview van plan 2). Deze alinea eiste "structured output, een product per verzoek, via de Batch API". Zo is het niet gebouwd, en dat is een bewuste keuze die hier hoort te staan in plaats van alleen in het uitvoeringsplan.**
>
> De tagger draait via `claude -p` op het Claude Code-abonnement in plaats van via de Anthropic API, op verzoek van Luc, omdat de API per token kost en het abonnement al betaald is. Daarmee vervalt de Batch API: `claude -p` heeft er geen equivalent van.
>
> Twee gevolgen die de spec moet vastleggen:
>
> 1. **Honderd producten per aanroep in plaats van een.** De opstartkosten per aanroep zijn te hoog om per product te betalen.
> 2. **Structured output is een optie (`--json-schema`), niet de standaard.** Gemeten op 23 september 2026: met het schema deed een portie van 100 producten 428 seconden over vier beurten, zonder schema 84 seconden over een. Het schema joeg het model in herkansingen. De prijs daarvan is dat de uitvoer uit vrije tekst geparseerd moet worden en dat niet elke portie in een ronde bruikbaar is; dat is opgevangen doordat `keten_tag_kandidaten` ongetagde producten de volgende ronde gewoon opnieuw aanbiedt. Het pad is zelfherstellend.
>
> De kwaliteitsgarantie van structured output (schema-conform in een beurt) is dus ingeruild voor kosten en doorlooptijd. Wat dat in de praktijk kostte: H&M kwam op 16.133 van de 16.606 producten (97,2 procent) na vier ronden, en de laatste 473 stranden deterministisch op een handvol velden.

Uitbreiding van de vocabulaires op 24 september 2026, na de eerste echte tagronde. De lijsten voor `materials` en `colors` bleken te kort voor een echte catalogus, en dat is duurder dan het klinkt: de tagpijplijn keurt een waarde buiten de lijst af en biedt het product bij de volgende ronde opnieuw aan. Een product waarvan het materiaal werkelijk viscose is, geeft elke ronde opnieuw viscose en wordt elke ronde opnieuw afgekeurd. Gemeten op de H&M-ronde: 9.914 producten werden ooit afgekeurd, waarvan er 7.621 in twee of meer ronden sneuvelden, en dat was precies het aantal dat na zes ronden nog ongetagd was. De zelfherstellende herkansing helpt alleen bij toevallige fouten, niet bij een gat in de lijst.

`materials` krijgt er daarom `suede`, `viscose`, `canvas`, `dons` en `rubber` bij, en `colors` krijgt `goud` en `zilver`. Alle zeven kwamen in de echte uitvoer voor en geen ervan is zuiver te mappen op een bestaande waarde: suede is leer maar met een eigen uiterlijk dat voor een outfit uitmaakt, viscose is halfsynthetisch, en goud en zilver zijn metallic waar geen van de vijftien kleuren op past. Waarden die wel eenduidig te vertalen zijn (kunstleer en imitatieleer naar synthetisch) blijven in de normalisatielaag en komen niet in de lijst.

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

> **AMENDEMENT (27 september 2026, op verzoek van Luc). De stylist componeert niet meer per bezoeker via de betaalde Anthropic API, maar vult zijn cache vooraf op het Claude Code-abonnement.**
>
> Waarom: dezelfde reden als bij de tagger in plan 2. De API kost per token, het abonnement is al betaald. Een Supabase edge function kan `claude -p` niet starten (geen shell, geen OAuth-sessie in Deno), dus een stylist die op het moment van bezoek componeert kan alleen via de API. Componeren hoeft echter niet op dat moment te gebeuren: de uitkomst wordt toch per profiel gecachet en er is al een noodpad dat niets kost.
>
> Wat er verandert:
>
> 1. **Een script vult de cache**, met `claude -p` op het abonnement, met dezelfde prompt en dezelfde harde validatie die voor de API-route waren geschreven. Zelfde vorm als `scripts/keten/tag-products.ts`.
> 2. **Het leespad wordt een RPC en geen edge function.** Het lezen van een set met levensduur en voorraadcontrole is pure SQL. Dat schrapt de deploy en het `ANTHROPIC_API_KEY`-secret uit de keten, en het sluit aan op hoe de rest van dit project werkt (`get_kandidaten`, `keten_dekkingsmatrix`).
> 3. **Engine v2 vangt een cache-miss op**, in de browser, met `seed = fnv1a32(profile_hash)`, zoals het noodpad al deed. Een bezoeker met een profiel dat niet is voorbereid krijgt dus een v2-outfit in plaats van een stylist-outfit.
> 4. **`source` in `outfit_sets` blijft `stylist`** voor wat het script schrijft; het leespad geeft `cache` terug en het noodpad `v2-fallback`.
>
> ## De normalisatie van 5.2.1 moet mee, anders werkt vooraf vullen niet
>
> Gemeten op de implementatie van 27 september: `profile_hash` is een sha256 over gender, gesorteerde gelegenheden, `budget_min`, `budget_max`, de gesorteerde niet-wil-producten en de gesorteerde ruwe quizkeuzes. Drie daarvan maken vrijwel elke bezoeker uniek:
>
> - **budget als los getal**: een euro verschil is een ander profiel;
> - **niet-wil-producten in de sleutel**: een weggeveegd product maakt de hele set onbereikbaar;
> - **ruwe keuzes**: zes tot twaalf paren geven een praktisch oneindige ruimte.
>
> Daarom hasht 5.2.1 vanaf nu:
>
> - het budget als een van de vier bestaande prijsbanden (`tot50`, `50tot100`, `100tot200`, `boven200`) in plaats van twee getallen;
> - **niet** de niet-wil-producten; die worden als filter op het gelezen resultaat toegepast, niet als onderdeel van de sleutel;
> - de **afgeleide assen** (alleen naam en waarde, niet de zekerheid; zie de herziening van 1 oktober hieronder) in plaats van de ruwe keuzes. Twee bezoekers die andere paren kozen maar op hetzelfde stijlprofiel uitkomen, delen dan een set. Dat is ook semantisch juister: de stylist leest assen, geen keuzes.
>
> Gevolg: de ruimte wordt ongeveer drie genders maal 127 gelegenheidscombinaties maal vier budgetbanden maal de assencombinaties, klein genoeg om de veelvoorkomende sleutels vooraf te vullen. Deze verbetering maakt de API-route trouwens ook goedkoper, mocht die er ooit alsnog komen: met de oude sleutel raakte de cache bijna nooit.
>
> ## Herziening van 1 oktober 2026: de zekerheid zit niet in de sleutel
>
> Het amendement van 27 september liet de zekerheid per as in de sleutel staan, afgerond op een vast raster (stappen van 0,25). Dat bleek een van twee oorzaken van een cache die een echte bezoeker nooit raakt, en het is teruggedraaid.
>
> **De meting.** Twee profielen die alleen in herkomst verschillen, met `profileHash` doorgerekend, bij gelijke gender (female), gelijke gelegenheden (work en date) en gelijke prijsband (budget 25 tot 100):
>
> ```
> bezoeker (uit de quiz)   bf2a5dd4  female|date,work|50tot100|color_temp:neutraal:1,pattern:effen:1,silhouette:slim:1
> vulscript (STYLE_ASSEN)  5c6681c8  female|date,work|50tot100|color_temp:neutraal:0.75,formality:3:0.75,
>                                    lightness:medium:0.5,pattern:effen:1,shoe_type:net:0.5,silhouette:slim:0.75
> in de cache              5c6681c8
> ```
>
> Dezelfde voorkeur gaf dus twee sleutels, en alleen de ene stond in de cache. Het persona-harnas liet toch een cache-hit zien, omdat het zijn profiel uit dezelfde `STYLE_ASSEN` bouwde als het vulscript: het bewees de hit tegen zichzelf. Zo'n verschil doet zich stil voor als "gewoon geen cache-hit", zonder fout en zonder lege uitvoer, terwijl elke vulronde wel sessiecapaciteit kost.
>
> **Twee oorzaken.**
>
> 1. De quiz (`src/keten/vanQuiz.ts`) zet de zekerheid van een as op 1, want de bezoeker koos hem zelf. `STYLE_ASSEN` (`src/keten/personas.ts`) zet zes assen op 0,5 tot 0,9. Op een raster van 0,25 zijn 1 en 0,75 twee verschillende stappen, dus ook bij identieke voorkeur verschilt de sleutel.
> 2. Het vulscript sleutelde op assen die een bezoeker nooit heeft opgegeven: `formality: 3`, `shoe_type: net` en `lightness: medium` kwamen uit een persona-tabel, niet uit een antwoord.
>
> **Besluit.**
>
> - **De zekerheid gaat uit de sleutel.** Per as hasht alleen de naam en de waarde, gesorteerd op asnaam; het afronden op stappen van 0,25 vervalt. De zekerheid blijft in het profiel staan en gaat wel naar de stylist: `bouwGebruikersPrompt` rendert haar per as, en `get_kandidaten` weegt de as-match ermee. Ze is dus invoer voor de compositie en geen onderdeel van de identiteit van een profiel. Twee bezoekers die beide slim willen, horen dezelfde set te delen; hoe zeker ze daarover zijn verandert de weging, niet wie ze zijn.
> - **Het vulscript vult sleutels die een bezoeker kan produceren.** Zijn standaardprofielen gaan door dezelfde vertaling als de quiz (`profielVanQuizAnswers`): alleen assen uit een echt antwoord, met de zekerheid die dat antwoord ook bij een bezoeker krijgt. Een set die is samengesteld onder aannames die de bezoeker nooit heeft gedaan, hoort niet onder diens sleutel te staan. `STYLE_ASSEN` blijft bestaan voor het persona-harnas, dat bewust rijkere persona's modelleert.
>
> **Bewijs en gevolgen.**
>
> - Een test laat een bezoeker en het vulscript, bij gelijke voorkeuren, op dezelfde sleutel uitkomen (`scripts/keten/__tests__/stylist-profielen.test.ts`). Met de oude sleutelfunctie en de oude profielafleiding is die test rood op precies de twee sleutels hierboven.
> - Dat de twee herkomsten op dezelfde sleutel uitkomen is vandaag al het gevolg van de tweede wijziging alleen, want de quiz geeft elke as zekerheid 1. De eerste wijziging houdt ze gelijk zodra de zekerheid verschilt, wat plan 4 doet wanneer het zekerheden uit paren afleidt. Een bezoeker met een lage zekerheid op een as deelt dan de set van een bezoeker die hetzelfde met zekerheid 1 koos. De sleutelfunctie (`src/keten/profileHash.ts`) is de plek om daar een drempel in te leggen, mocht dat nodig blijken.
> - De rij in `outfit_sets` met hash `5c6681c8` is onder de oude sleutel geschreven en daardoor onbereikbaar. Hij is niet verwijderd en verloopt op 12 oktober 2026 (14 dagen levensduur, `keten_outfit_set`).
> - `npm run keten:personas -- --keten=stylist` geeft vijf keer rood in plaats van een keer groen: bron `v2-fallback`, reden cache-miss, want geen enkele sleutel staat nog gevuld. Dat is de juiste uitkomst. Na een vulronde blijft het harnas rood zolang het zijn persona's met zes assen bouwt, want die staan onder een andere sleutel dan het vulscript vult. Het kan zijn profielen afstemmen door ze uit `standaardProfielen()` (`scripts/keten/stylist-profielen.ts`) te halen.
>
> ## Aanvulling van 1 oktober 2026: de lichtheid uit de quiz zit nu in het profiel
>
> De herziening hierboven noemt `lightness` bij de assen die een bezoeker nooit opgeeft. Dat klopte niet. De quiz vraagt de lichtheid in stap 4 (`field: 'lightness'`, verplicht, waarden `licht`, `medium` en `donker`, dezelfde drie als `LIGHTNESS` in `scripts/keten/tagging.ts`), en `src/keten/vanQuiz.ts` gooide het antwoord weg. `get_kandidaten` kan er wel op scoren (`pa.lightness = a.as_waarde`, migratie `20260925090000`), en de stylist-prompt rendert hem al per as. Het antwoord werd gevraagd en de database kon er scoren, maar tussen die twee zat geen verbinding.
>
> - `profielVanQuizAnswers` zet de lichtheid nu als as met zekerheid 1, alleen bij een geldige waarde, in dezelfde vorm als silhouette, pattern en color_temp.
> - De sleutel heeft daardoor een as meer, bijvoorbeeld `female|date,work|50tot100|color_temp:neutraal,lightness:medium,pattern:effen,silhouette:slim`. Elke bezoeker die stap 4 beantwoordt heeft een andere sleutel dan voor deze wijziging. Er stond een rij in `outfit_sets` (`5c6681c8`, al onbereikbaar), dus er gaat geen bruikbare set verloren.
> - Het vulscript geeft de lichtheid van de persona mee als quiz-antwoord (`quizAntwoordenVanPersona`). Zonder dat waren bezoeker en vulscript weer op verschillende sleutels uitgekomen, en dat bewaakt `scripts/keten/__tests__/stylist-profielen.test.ts`: die ging rood op het moment dat de vertaling erbij kwam en staat nu weer groen.
> - Gevolg voor de ruimte van sleutels die de quiz kan opleveren: een verplichte vraag met drie antwoorden verdrievoudigt die, van 36.288 naar 108.864 (doorgerekend met `profielVanQuizAnswers` en `normaliseerProfiel`). Een gevuld profiel past daarmee bij een derde van de bezoekers die het eerst raakte, uitgaande van een gelijke verdeling over de drie antwoorden. Of echte bezoekers zich op de gevulde sleutels concentreren weet niemand tot er verkeer is.
> - Waarom hij in de sleutel hoort en niet alleen in het profiel: gemeten op 1 oktober 2026 met `get_kandidaten` als anon (12 per categorie, de vier persona's met alleen een andere lichtheid). Licht tegen donker deelt 21 tot 30 van de 60 tot 72 kandidaten, en het aantal kandidaten met de gevraagde lichtheid gaat van 3 tot 35 zonder de as naar 28 tot 67 met de as. De gecomponeerde set hangt dus aan de lichtheid. In de tagger-uitvoer is de verdeling 42,5 procent `medium`, 33,2 procent `licht` en 24,3 procent `donker` over 17.909 kandidaatrijen, zonder lege waarden, dus de as onderscheidt iets. De vijf standaardprofielen halen de pooltoets van het vulscript ook met de lichtheid erbij (anon-aanroepen met het bandbereik, `toetsKandidatenpool` lokaal gedraaid, geen model).
> - Alleen `formality` en `shoe_type` vraagt de quiz niet. Die blijven staan voor het persona-harnas.

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

> **Vervangen door het amendement van 27 september 2026 hierboven (bij 5.2.1).** Er komt geen edge function die per bezoeker de Anthropic API aanroept. Het componeren gebeurt vooraf in een script op het Claude Code-abonnement; het leespad is een RPC met levensduur en voorraadcontrole. Het schema, de harde validatieregels en de prompt-eisen in deze paragraaf blijven onverkort gelden: ze zijn nu de eisen aan dat script in plaats van aan een edge function.

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

Vooraf gegenereerd per segment (gender x gelegenheid x prijsband), per as minstens vier paren. Een paar is twee complete outfits die op precies een as verschillen en verder zo gelijk mogelijk zijn (zelfde gelegenheid, zelfde prijsband, zelfde kleurfamilie). Gegenereerd door `compose-outfits` in een aparte modus (`mode: 'pair', axis, side`) en vastgelegd met product_ids en beeld-URL's. De paarselectie slaat bij het ophalen elk paar over waarvan een item niet meer `in_stock` is (join op `products`); `genereer-paren.ts` is een handmatig script met een kostenplafond dat opnieuw draait als een segment te weinig bruikbare paren overhoudt. Geen cron.

## 7. Wat bewust niet

- Nova-chat, premium, dashboard, kleuranalyse via selfie.
- Engine v2 aanpassen; hij blijft als noodpad zoals hij is, met seed.
- Dode code opruimen; dat is een aparte sanering.
- Bestaande `/onboarding` en `/results` verwijderen voordat de vlag om is.

## 8. Poorten

- Elke taak: `npx tsc --noEmit`, `npx vitest run`, `npx vite build`, en `npm run design:check:ci` groen.
- Voor het afronden van een plan, en voor elke nieuwe feed: `scripts/keten/persona-run.ts` groen. Geen wekelijks schema: pg_cron kan geen TypeScript draaien en er is geen CI-schema met databasesleutels. De feed-poort (5.7) is het moment waarop dit telt.
- Voor de vlag omgaat: de vier persona's groen, Luc heeft de outfits gezien, en `weekly_ratings` vult zich.

## 9. Volgorde en plannen

Vier plannen in `docs/superpowers/plans/`, elk apart uitvoerbaar en testbaar:

1. `2026-09-14-plan-1-fundament.md`: `product_attributes` met alleen dedupe en de ruwe velden (category, gender, price_band uit `products`), `get_kandidaten` zonder tags, `outfit_ratings` plus widget op de bestaande `/results`, seed in `outfitService`, persona-harnas. Doel: het venster is weg en de meting loopt, op de bestaande engine.
2. `2026-09-14-plan-2-tagging.md`: tagging-batch, embeddings, feed-poort, dekkingsmatrix, cron voor feed en voorraad, link-checker aangesloten.
3. `2026-09-14-plan-3-stylist.md`: `compose-outfits`, `outfit_sets`, validatie, noodpad, persona-harnas op de nieuwe keten.
4. `2026-09-14-plan-4-onboarding.md`: `taste_profiles`, `pair_sets`, `/start`, `/results` v2, vlag `keten_v2`, events.
