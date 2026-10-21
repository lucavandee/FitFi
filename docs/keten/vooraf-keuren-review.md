# Vooraf keuren: aangepast ontwerp na de review (21 oktober 2026)

Werkmap /Users/luc/FitFi-worktrees/beloftes, branch feat/stijl-agent. Lucs besluit blijft staan (optie A): de stijl-agent keurt vooraf, 's nachts, op het abonnement. Wat verandert: de eerste nacht is een meetnacht, geen vulnacht. Tabel, leesfunctie en site komen pas als de pilot en een blinde steekproef van Luc dat rechtvaardigen.

## Waarom het anders moet
- Opbrengst. Het eerste ontwerp rekende met een kwart goedkeuring (r.44-45). Dat getal komt uit een run zonder stijlkandidaten (stijl-eindtoets-2026-10-21-15-39.md). De keten die het vulscript gebruikt, haalde 8 van 48 (17-39) en 6 van 47 (18-11). Zonder vrouw sportief, een keuze die de quiz niet aanbiedt, is dat 7 van 42 en 4 van 41. Zeven van die elf goedkeuringen zijn vrouw minimalistisch. Heren: 0 van 18 in de laatste run.
- Herhaalbaarheid. 34 outfits zaten in beide runs, met dezelfde stukken en gelegenheid en een ongewijzigde keurprompt. Tien kregen een ander oordeel, en 3 van de 7 goedkeuringen kwamen niet terug.
- Quotum. Door de weeklimiet schreef brein-eod op zeven avonden in oktober niets. Een script dat pas bij de limiet stopt, laat Lucs jobs zonder quotum.

## Volgorde
1. Avond, bouwen. Dit is het enige wat in één avond moet:
   - STIJL_AGENT_VERSIE splitsen in KEUR_VERSIE en LABEL_VERSIE.
   - scripts/keten/stijl-sets.ts met poolstap, log, tweede keuring, noodrem en nachtrapport.
   - De faalpaden testen met een nep-claude vooraan in PATH.
   - De kalibratie opnieuw draaien met de vastgelegde aanroep (4 aanroepen) en het model-id vastzetten.
2. Labelronde v2 afmaken en wegschrijven (loopt nu). Daarna tellen hoeveel rijen in keten_stijl_labels nog geen seizoen hebben. Dat is een kleine telling op de labeltabel.
3. Nacht 1, de pilot. Op zijn vroegst de nacht van donderdag 22 op vrijdag 23 oktober: dan begint een verse week. Niet de nacht naar donderdag, want review-engine draait donderdag 03:00 en de week reset om 04:00. Handmatig starten rond 21:30, als brein-curator en brein-eod klaar zijn. In de nacht geen databaseverkeer.
4. Ochtend: nachtrapport lezen, en Luc doet de blinde steekproef (zie Meten).
5. Alleen als pilot en steekproef het rechtvaardigen: origin/main mergen, migratie, upload, leesfunctie, site achter een vlag, en verder vullen op de cellen die iets opleveren.

## 1. Opslag

### 1a. Oordelenlog (vanaf de eerste nacht; dit is de bron van waarheid)
Map ~/claude-artifacts/fitfi-keten/stijl-sets/. Niet in de repo, en niet in een kladmap die gewist wordt.
- oordelen.jsonl, alleen aanvullen. Een regel per keuring, geschreven direct na de aanroep en voor al het andere. Per regel: tijd, cel (geslacht, stijl, gelegenheid), outfit_key, product_ids en rollen in weergavevolgorde, per stuk naam zoals verstuurd, prijs, kleuren, lichtheidstag en beeld-URL, p_zaad en engine-zaad, ronde (1 of 2), het oordeel zoals gegeven en zoals geteld, de vier deelscores, redenen, verbetering, KEUR_VERSIE, model-id en aanroepnummer.
- aanroepen.jsonl, een regel per aanroep: tijd, nummer, aantal verstuurd en aantal gelezen, duration_ms, total_cost_usd, usage, modelUsage, num_turns, is_error met de eerste 300 tekens van de fout, en bij de laatste aanroep de stopreden.
- pool-<datum>.json uit de poolstap. Het nachtrapport komt in nacht-<datum>.md en .json.
- outfit_key is de sha256 over de ontdubbelde, gesorteerde product-ID's met komma's ertussen. Dat is precies outfitKey uit src/services/ratings/outfitRatings.ts r.34-40. Log, tabel en site gebruiken dezelfde functie, zodat outfit_ratings zonder nieuwe kolom te koppelen is.

### 1b. Tabel keten_stijl_outfits (na de pilot)
- id bigint generated always as identity primary key
- geslacht text not null, check in ('female', 'male')
- stijl text not null (sleutel uit getStyleOptionsForGender)
- gelegenheid text not null, check op de zeven uit GELEGENHEDEN
- outfit_key text not null
- product_ids uuid[] not null: de ID's van het keurmoment, in weergavevolgorde
- rollen text[] not null: de categorie per stuk bij het keuren. Check: even lang als product_ids, 2 tot 8 stukken
- seizoen text not null, check in ('herfst-winter', 'lente-zomer')
- keur_versie text not null
- model text not null
- goedgekeurd_op timestamptz not null default now()
- ingetrokken_op timestamptz: de uitknop, per rij of per batch, zonder deploy
- unique (geslacht, stijl, gelegenheid, outfit_key); dient meteen als opzoekindex

Niet in de rij: titel, uitleg, totaalprijs, aantal donkere stukken, prijs, beeld en URL. Die rekent de site uit de stukken zoals ze op dat moment zijn.

Rechten: RLS aan zonder policies, en revoke all van public, anon en authenticated. Lezen kan alleen via de leesfunctie. Geen foreign key, geen trigger op products of product_attributes, geen GIN-index. De migratie is een eigen bestand na 20261021200000, kan veilig opnieuw draaien, heeft een blok om terug te draaien en wordt buiten de piekuren toegepast.

Upload, overdag, met stijl-sets.ts --upload. Alleen bevestigde outfits (zie 2c) van de huidige KEUR_VERSIE. In porties van 50 via supabase db query --linked -f, zoals scripts/keten/stijl-vul.ts, met jsonb_to_recordset en on conflict do nothing. Een rij gaat er alleen in als elk product_id nog in keten_kandidaat_product staat. Opnieuw draaien verandert niets.

## 2. Vulscript scripts/keten/stijl-sets.ts

### 2a. Cellen
Alleen cellen die de quiz kan opleveren: female of male, een stijl uit getStyleOptionsForGender (src/data/quizSteps.ts r.3-115) en een van de zeven gelegenheden. De pilot heeft acht cellen:
- vrouw minimalistisch, kantoor
- vrouw casual, vrije dag
- vrouw streetwear, vrije dag
- vrouw smart casual, kantoor
- vrouw romantisch, date
- man smart casual, date
- man klassiek, kantoor
- man streetwear, vrije dag

Na de pilot komt de lijst uit een telling van echte quizantwoorden. Welke tabel dat is, heb ik niet nagegaan; het is een kleine SELECT.

### 2b. Poolstap (apart, vroeg op de avond, met --alleen-pool)
- Per (geslacht, gelegenheid) een get_kandidaten met naarKandidatenParams(antwoordenVoor(cel)), budget 0 tot 250 euro per stuk.
- Per (geslacht, stijl) drie get_stijl_kandidaten, elk met een eigen p_zaad: een hash van cel, datum en volgnummer. Deze worden gedeeld over de gelegenheden van die stijl. Niet het zaad uit naarStijlParams gebruiken: dat geeft bij vaste antwoorden steeds dezelfde 600 gelabelde producten.
- Als anon, een voor een, 1,5 s pauze ertussen, 10 s tijdslimiet aan de clientkant. Een herkansing na 5 s bij 57014, PGRST002, 522, 524 of een time-out. Mislukt een stijlaanroep twee keer, dan vervalt dat zaad: er wordt nooit gekeurd op alleen de algemene pool. Na drie fouten op rij stopt de stap.
- Start niet als feed-sync, de tagger of tools/nacht/run2.sh draait (controle met pgrep).
- Schrijft pool-<datum>.json. De nacht leest dat bestand en raakt de database niet.

### 2c. Keuren
1. Lock: mkdir stijl-sets/.lock met de pid erin. Leeft die pid nog, dan stoppen. Daarna hooguit 15 minuten wachten tot launchctl list geen pid meer toont voor com.luc.brein-curator en com.luc.brein-eod.
2. Het log inlezen voor de huidige KEUR_VERSIE (hervatten, zie 2e).
3. Kandidaten per cel en zaad: voegKandidatenSamen en bereidKandidatenVoor, dan runEngineV2 met count 12 en drie engine-zaden, dan kiesKandidaten met maxPerProduct 3 en alGekeurd uit het log. Lege kleuren aanvullen met de taggerkleuren uit attrs. Een outfit met een stuk zonder enige kleur wordt niet gekeurd.
4. Invoer zoals in de kalibratieset. Profiel: {geslacht, stijlen: [stijl], gelegenheid}, zonder lichtheid of temperatuur. Per stuk: categorie, naam zonder ', Maat ...' (met SIZE_SUFFIX uit src/services/outfits/dedupeProductVariants.ts r.9), merk, prijs en kleuren. Per portie korte id's k1 tot k9, die na het antwoord worden terugvertaald.
5. Porties van 9, beurtelings uit de verschillende cellen. Een outfit die in ronde 1 een getelde 'goed' kreeg, gaat in een latere portie nog een keer mee, met andere buren en een ander kort id.
6. Aanroep: bouwClaudeArgs zoals bij de kalibratie, vanuit dezelfde werkmap, met --effort xhigh en het vaste model-id uit de opnieuw gedraaide kalibratie. Meldt de nacht een ander model, dan stoppen. Time-out 6 minuten.
7. Lezen: alleen id's uit de verstuurde portie, elk een keer. Een 'goed' telt alleen met vier keer 'ja' en een lege verbetering; anders telt hij als twijfel, en het ruwe oordeel blijft in het log. Minder dan 5 van de 9 oordelen telt als mislukte aanroep. Outfits zonder oordeel gaan nog een keer mee; komt er dan weer niets, dan worden ze 'geen oordeel'.
8. Eerst het log schrijven, dan tellen, dan de stopregels toepassen.

Bevestigd betekent: twee getelde 'goed' in verschillende porties. Alleen bevestigde outfits gaan later naar de tabel.

### 2d. Noodrem en nachtbudget
- Plafond: --max-aanroepen, voor de pilot 72. Dat is ongeveer 2,5 tot 3,5 uur en 19 tot 21 dollar-equivalent, uitgaande van 0,26 tot 0,29 per aanroep volgens de kalibratierapporten. Het plafond is de reserve voor Lucs jobs, ook als het account in extra usage terechtkomt en er geen limiettekst verschijnt. Hoe dat eruitziet, is niet nagegaan.
- Deadline: voor elke aanroep moet nu plus 6 minuten voor 02:30 liggen.
- Direct stoppen bij een limiettekst: de LIMIET-regex uit ~/.claude/scheduled-jobs/_helpers/claude-headless.mjs r.34, plus 'resets'. De resettijd gaat in het rapport.
- Stoppen na drie mislukte aanroepen op rij, ongeacht de oorzaak: inloggen, overbelasting, time-out of geen JSON.
- SIGINT en SIGTERM breken de lopende aanroep af via de signal van voerClaudeCliUit. Het log is dan al bijgewerkt.
- Handmatig starten met nohup caffeinate -i. launchd pas als de vulling een vaste job wordt.
- Stubtest vooraf: een nep-claude vooraan in PATH geeft achter elkaar een limiettekst met exit 1, uitvoer zonder JSON, 4 van 9 oordelen, onbekende id's en een time-out. Bij elk pad moet de juiste stopreden of herkansing volgen.

### 2e. Hervatten
Bij de start leest het script uit oordelen.jsonl, alleen voor de huidige KEUR_VERSIE:
- alGekeurd per cel: elk ronde-1-oordeel behalve 'geen oordeel';
- de wachtrij voor ronde 2;
- het aantal bevestigde outfits per cel;
- welke cellen vol of arm zijn;
- welke zaden al gebruikt zijn.

Een nieuwe KEUR_VERSIE begint met een lege telling. De oude regels blijven staan.

### 2f. Stopregels per cel
- Vol: 12 bevestigd.
- Arm: na 36 keuringen in ronde 1 nog geen enkele getelde 'goed', of na 72 keuringen minder dan 3 bevestigd. Een arme cel blijft arm zolang de keurversie gelijk blijft.
- Per nacht hooguit 72 keuringen in ronde 1 per cel.

### 2g. Nachtrapport
- Algemeen: start, stop en stopreden; aantal aanroepen dat lukte, mislukte of een time-out gaf; gemiddelde duur; dollar-equivalent; KEUR_VERSIE, model-id en git-sha.
- Per cel: aantal gekeurd; 'goed' in ronde 1, geteld en ruw; bevestigd, twijfel, fout en geen oordeel; de drie redenen die het vaakst voorkomen; hoeveel outfits een jurk hebben en hoeveel top plus broek.
- Per cel ook hoeveel bevestigde outfits overblijven bij een budget per stuk tot 75, tot 150 en tot 250 euro, en bij een keuze voor licht (hooguit één donker stuk volgens isDonker).
- Herhaalbaarheid: welk deel van de 'goed' uit ronde 1 in ronde 2 'goed' bleef.

## 3. Leesfunctie (na de pilot)
keten_stijl_outfits_voor(p_geslacht text, p_stijlen text[], p_gelegenheden text[], p_budget_min int, p_budget_max int, p_zaad int, p_max int default 24)
- Instellingen: plpgsql, stable, security definer, set search_path = public, set statement_timeout = '3s', set plan_cache_mode = force_custom_plan, #variable_conflict use_column. Revoke all van public, grant execute aan anon en authenticated.
- Invoer: alleen female of male, p_stijlen[1:3] en p_gelegenheden[1:7]. Het seizoen volgt uit de maand: maart tot en met augustus lente-zomer, anders herfst-winter, dezelfde grenzen als getCurrentSeason. De winkels die standaard uit staan in een variabele, niet via een cross join.
- Stap 1: rijen voor die cellen en dat seizoen met ingetrokken_op is null. Per cel hooguit 8, gekozen op md5(outfit_key || ':' || p_zaad), samen hooguit 60.
- Stap 2: alle ID's van die rijen in één array. De stukken komen met product_id = any(array) uit keten_kandidaat_product (alleen canoniek, is_fashion, op voorraad, geclassificeerd en getagd). Prijs, lightness, shoe_type en colors komen uit product_attributes, seizoen en gedateerd uit keten_stijl_labels.
- Een outfit blijft alleen staan als elk stuk aan al deze eisen voldoet: het is gevonden, staat in de kopie op voorraad, komt niet van een winkel die uit staat, kost tussen p_budget_min en p_budget_max, is niet gedateerd en heeft geen label van het andere seizoen. Er wordt nooit een stuk weggelaten.
- Uitvoer: een rij per outfit met outfit_key, stijl, gelegenheid en de stukken als jsonb in weergavevolgorde, beurtelings uit de cellen, hooguit p_max.
- Voordat de functie gebruikt wordt: EXPLAIN (ANALYZE, BUFFERS) als anon en als authenticated, voor een gangbaar profiel en het slechtste geval (3 stijlen, 7 gelegenheden), met koude en warme cache. Daarbij een bewakingstest op proconfig, zoals scripts/keten/__tests__/selectie-timeout.sql.

## 4. Site (na de steekproef, achter een vlag)
- Ophalen: outfitService.generateOutfits roept de leesfunctie aan parallel aan getProducts, onder KANDIDATEN_TIJDSLIMIET_MS. Alleen bij female of male met minstens één stijl; p_zaad komt uit seedFromAnswers. Geen herkansing. Elke fout of time-out geeft een lege bibliotheek en nooit CatalogusOnbereikbaar.
- Omzetten: producten via mapKandidaatProduct, met category = rol en lightness, shoeType en colors uit de rij.
  - Id: 'bib-' plus de eerste 16 tekens van outfit_key plus '-' plus de gelegenheid. Dat blijft stabiel voor favorieten en voor het onthouden van 'zou ik dragen'.
  - Titel en uitleg met outfitTitel en outfitUitleg, op de stukken zoals ze nu zijn en de antwoorden van deze bezoeker.
  - Nieuw optioneel veld bron op Outfit: 'bibliotheek' of 'engine'.
  - Geen verzonnen matchscore.
- Filteren: bij een keuze voor licht hooguit één donker stuk (isDonker). Een outfit met een stuk dat de bezoeker in de kalibratiestap afwees, valt weg. De stijlcontrole op labels draait niet opnieuw, want daar heeft de agent al over beslist. Een outfit wordt nooit aangepast.
- Samenvoegen: eerst de bibliotheek, per gevraagde gelegenheid beurtelings uit de gekozen stijlen. Ontdubbelen op de gesorteerde productset, waarbij de bibliotheek voorgaat. Een product komt hooguit twee keer in de lijst. Daarna vullen engine-outfits aan zoals nu (die zijn al door de stijlpoort gegaan), tot outfitLimietVoor.
- Sorteren: de top 3 en de kleurtips (src/pages/EnhancedResultsPage.tsx r.889 en r.1203) sorteren eerst op bron en dan op matchScore. De swipe begint met de bibliotheek.
- Terugval: is de bibliotheek leeg of gaat er iets mis, dan de engine zoals nu. Unisex en oude stijlsleutels krijgen alleen de engine. De melding over ontbrekende gelegenheden blijft.
- Vlag: VITE_STIJL_BIBLIOTHEEK, plus een schakelaar in localStorage zodat Luc vooraf kan kijken.

## 5. Versheid
- Seizoen: de rij legt het seizoen vast en de leesfunctie leest alleen het huidige. De keurprompt staat vast op het najaar (stijlAgent.ts r.98 en r.155). Voor 1 maart is dus een lente-zomerversie nodig (nieuwe KEUR_VERSIE, nieuwe kalibratie) plus een vulling. Is die er niet, dan levert de bibliotheek vanaf 1 maart niets en draait de site op de engine.
- Voorraad en beleid: bij elk bezoek opnieuw getoetst via de kandidaatkopie, de winkelregels en de actuele labels. Klopt er iets niet, dan valt de outfit weg; hij wordt nooit aangepast.
- Canonieke wissel: in v1 valt een outfit weg zodra een opgeslagen ID geen kandidaat meer is. Het nachtrapport telt per cel hoeveel rijen nog leesbaar zijn. Valt er na de eerste feed-sync met b2 veel weg, dan lost de leesfunctie het op via keten_canoniek_wissels (zelfde fotogroep), zonder dat het schema verandert. Dat labels meeverhuizen, hoort bij de herschreven b2.
- Nieuwe keurversie: alleen de bevestigde rijen opnieuw keuren. Wat dan niet meer goed is, krijgt ingetrokken_op. Een deploy maakt de bibliotheek nooit leeg.
- Model: het vaste model-id staat in de rij. Komt er een andere Sonnet achter de alias, dan is dat een nieuwe keurversie.

## 6. Meten
- Pilot: het nachtrapport per cel. Op basis daarvan besluiten welke cellen we vullen, hoeveel nachten dat kost en welke fix in de generator eerst komt.
- Vrijgavepoort voor de site: Luc beoordeelt blind 40 outfits met foto's uit het log, door elkaar gehusseld: 20 bevestigde, 10 twijfel en 10 fout. Per outfit de vraag 'zou ik dit dragen'. De site gaat alleen live als minstens 17 van de 20 bevestigde 'ja' krijgen en de bevestigde duidelijk beter scoren dan twijfel en fout. De eindtoets keurt met dezelfde beoordelaar en telt daarom niet als kwaliteitsmaat voor de bibliotheek.
- Live:
  - per sessie het aandeel outfits uit de bibliotheek (results_outfits_loaded krijgt aantal_bibliotheek en aantal_engine);
  - 'zou dragen' en 'nooit' per bron, door outfit_ratings.outfit_key te koppelen aan keten_stijl_outfits.outfit_key;
  - bewaren en partnerklik per bron;
  - per nacht het aantal leesbare rijen per cel.
  Een bibliotheekoutfit met minstens 5 beoordelingen waarvan meer dan de helft 'nooit' zet Luc met de hand op ingetrokken_op.
- Eindtoets: profiel 8 (vrouw sportief) gaat eruit, want de quiz biedt athletic alleen aan heren aan. Voortaan alleen nog gebruiken voor de engine.

## 7. Bewust niet in deze ronde
Al deze punten komen terug zodra de pilot laat zien dat ze nodig zijn:
- vullen per budgetband of per lichtheid;
- filteren op kleurtemperatuur;
- generatorregels en de jurkkans in composer.ts;
- variatie-eisen bij opname;
- canonieke wissels oplossen;
- unisex;
- een buurstijl voor formele cellen;
- twijfel-outfits als tweede keus;
- de proef om de vaste last per aanroep te verlagen (vraagt een nieuwe kalibratie);
- rate_limit_event als extra rem;
- launchd;
- een canary.