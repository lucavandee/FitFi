# Visual embeddings PoC: resultaten

Datum: 2026-08-04 · Branch: `claude/engine-visual-embeddings` · Spec: `2026-08-03-visual-embeddings-poc-design.md`

Gedraaid op echte data: 1000 producten uit de golden fixture (100% dekking) en een gespreide steekproef van 1670 producten uit de live catalogus. Model: FashionCLIP (`patrickjohncyh/fashion-clip`), 512 dimensies, lokaal op de Mac mini.

## Kort antwoord

De oorspronkelijke hypothese (visuele coherentie in de outfit-ranking blenden maakt aanbevelingen beter) is **niet bevestigd**. De embeddings zelf zijn juist **uitstekend**, en leverden twee concrete datakwaliteitsbugs op die directe productwaarde hebben.

## 1. Engine-integratie: geen aantoonbare winst

| Meting | Zonder visueel | Met visueel (w=0.15) |
|---|---|---|
| Golden floors gehaald | 42/42 | 42/42 |
| Gem. intra-outfit visuele coherentie | 0.4487 | 0.4514 |

Delta: **+0,6%**, ver onder het vooraf gestelde criterium van +5%. De integratie is wel veilig: geen enkele golden floor breekt.

Belangrijke beperking bij deze meting: de golden fixture is 996/1000 Puma en 749/1000 footwear. In zo'n homogene catalogus is er nauwelijks visuele variatie om op te sturen, dus dit cijfer weerlegt de hypothese niet definitief; het toont alleen dat er op deze snapshot niets te winnen valt. Een herhaling op een diverse catalogus-snapshot is de eerlijke vervolgtest.

**Aanbeveling:** de flag blijft standaard uit. Niet naar productie in deze vorm.

## 2. Embedding-kwaliteit: uitstekend

Gemeten op de diverse steekproef (1670 producten, 6 categorieen, tientallen merken):

| Meting | Resultaat | Random-baseline |
|---|---|---|
| Top-1 buur zelfde categorie | 98,4% | 17,1% |
| Top-5 buren zelfde categorie | 97,0% | 17,1% |
| Gem. similarity binnen categorie | 0,578 | |
| Gem. similarity tussen categorieen | 0,434 | |

Kwalitatief bevestigd: een Boss-polo vindt een Aspesi-polo (0,908), een Ami Paris-jack vindt een 7 For All Mankind-jack (0,836), een Adidas-jurk vindt een Alaïa-jurk (0,812). Het model generaliseert dus over merken heen en kijkt niet alleen naar fotostijl. (Het merk-signaal van 93,8% op top-1 komt vrijwel volledig door exacte duplicaten, zie punt 3.)

**Conclusie:** de embeddings dragen sterk, betrouwbaar signaal. Het probleem zat in het toepassingspunt, niet in de techniek.

## 3. Vondst: 45% van de live catalogus-steekproef is duplicaat

Bij een drempel van cosine >= 0.999 (visueel identieke foto):

- 424 duplicaat-clusters in 1670 producten
- **760 overtollige items, oftewel 45,5% van de steekproef**
- Grootste clusters: 8x dezelfde 3juin-sandaal, 8x dezelfde Adidas by Stella McCartney-sneaker, 7x dezelfde 7 For All Mankind-jeans

Nuance: op de golden fixture vangt de bestaande `dedupeProductVariants` deze al vrijwel volledig af (496 paren voor, 1 na). De duplicatie zit dus in de **brondata**, niet in de engine-pipeline. Dat betekent wel dat elke query op de products-tabel, elke telling en elke catalogusweergave buiten die dedupe-stap met bijna dubbele aantallen werkt.

## 4. Vondst: categorie-fouten in de brondata

18 van 1670 producten (1,1%) hebben een categorie die afwijkt van minstens 6 van hun 8 visuele buren. De opvallendste, geverifieerd tegen de live database:

**Herenoverhemden staan als jurk in de catalogus.** Van de 25 producten met `category=dress` en `gender=male` zijn er 20 een overhemd (OLYMP en Profuomo "Dress Shirt"-modellen). Het woord "Dress" in "Dress Shirt" is als categorie geinterpreteerd. De rest zijn H&M-verkleedkostuums ("fancy dress costume").

Andere correcte vangsten: colberts en vesten die als `top` staan terwijl de buren `outerwear` zeggen.

Kanttekening: de vangsten waar de consensus `accessory` is (drie jacks) zijn vermoedelijk onbetrouwbaar, omdat de `accessory`-categorie zelf vervuild is; er staat bijvoorbeeld een 44 Label Group-T-shirt in.

## 5. Nevenvondst: de golden baseline is niet deterministisch

De engine seedt de outfit-compositie op kloktijd (`Date.now()` per blok van 5 minuten). Daardoor faalt de haalbaarheidsmatrix afhankelijk van het moment van draaien: op onaangeraakte `main` waren dat 3 cellen. Toegevoegd: `EngineOptions.seed`, optioneel en backwards-compatible, gebruikt door de eval en de nieuwe tests. Het aanpassen van de floors zelf hoort in een aparte PR.

De classifier-audit gaf een mildere uitkomst dan de logruis suggereert: 3 eenduidige naam-vs-categorie conflicten op 492 beoordeelde producten (1%), maar 102 van 643 producten (16%) worden met lage zekerheid alleen uit tekst geclassificeerd.

## Aanbeveling

1. **Nu doen (hoogste waarde, laagste risico):** de twee datakwaliteitsbugs oplossen. De 20 verkeerd gecategoriseerde overhemden zijn een directe UX-fout (herenoverhemden in jurk-aanbevelingen) en met een SQL-update te herstellen. De duplicatie in de brondata verdient een import-fix.
2. **Herhalen voor een eerlijk oordeel:** de coherentie-eval opnieuw draaien op een diverse catalogus-snapshot in plaats van de Puma-fixture, voordat de hypothese definitief wordt afgeschreven.
3. **Wel doorzetten:** embeddings als **audit-instrument** op de catalogus (duplicaten en verkeerde labels opsporen), niet als ranking-signaal. Dat is waar ze in deze PoC aantoonbaar waarde leverden.
4. **Parkeren:** de visuele coherentie-blend in de engine. Code blijft staan, flag standaard uit.

## Vervolg: wat de embeddings blootlegden in de classifier

De datakwaliteitsvondst uit punt 4 bleek geen datafout maar een codefout, en die
bleek een hele familie te hebben. Drie commits, alle gemeten op 2.674 echte
productnamen:

1. **Dress shirt.** `/\bdress\b/` (gewicht 3) versloeg `/\bshirt\b/` (gewicht 2).
   20 herenoverhemden stonden als jurk. Blast radius: exact 20 producten wijzigen,
   van de 155 jurken breekt er nul. Migratie `20260804203000` corrigeert de
   bestaande rijen (de anon-key heeft alleen leesrechten, dus die stap is
   handmatig).
2. **Enkelvoud "short" en "tight".** Nederlandse retail schrijft "short", niet
   "shorts". Matchte nergens op, dus besliste de beschrijving: "trek je favoriete
   PUMA-sneakers erbij aan" maakte er footwear van, en de stofnaam "Single jersey"
   maakte van een dameslegging een top. Een keepersshort werd underwear via
   "sokken" in de kit-tekst, en underwear wordt bij import herschreven naar
   'other', dus het product verdween volledig uit outfits.
3. **Gesloten samenstellingen.** `\b` kan niet binnen een samenstelling matchen,
   dus bomberjack, schipperstrui, sportschoenen, balletsneakers, golfpoloshirt,
   boxershorts, sportbh en trainingsbeha matchten nergens op.

**De grondoorzaak achter alle drie:** matcht de productnaam op geen enkele regel,
dan valt de classifier terug op naam + beschrijving, en bepaalt marketingtekst de
categorie. Dat aandeel is teruggebracht van 223 producten (8,3%) naar 133 (5,0%).

**Openstaande architectuurvraag voor Luc:** die fallback op de beschrijving is
structureel onbetrouwbaar. Een alternatief is terugvallen op 'other' met een
expliciete review-vlag, zodat een onbekend product zichtbaar onbekend is in plaats
van stilzwijgend verkeerd. Dat is een productbeslissing, geen bugfix.

**Losse observaties, niet aangeraakt:**
- De test "classifies a prematch shirt as TOP" faalt op `main` en blijft falen: hij
  verwacht `top`, maar `prematch` staat in `REJECT_REGEX` omdat FitFi voetbaltenues
  uit outfits weert. Test en rejectlijst spreken elkaar tegen.
- De classifier zegt op 225 producten `accessory` waar de database `top` zegt, en
  op 91 producten `other` waar de database `top` zegt. Bestaande discrepantie,
  groot genoeg voor een eigen onderzoek.
- De `.gitignore`-regel `__tests__/` zorgt ervoor dat nieuwe testbestanden
  stilzwijgend niet worden gecommit; ze moeten met `git add -f` toegevoegd worden.

## Artefacten

Scripts in `scripts/visual-embeddings/`: `fetch-catalog.mjs`, `embed_products.py`, `eval.ts`, `quality-probe.ts`, `dupe-audit.ts`, `data-quality-audit.ts`, `classifier-audit.ts`, `neighbour-sample.ts`, `demo.mjs`. Output (embeddings, HTML-demo's) staat in `out/` en is gitignored.
