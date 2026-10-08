# Feed-sync: de catalogus bijhouden vanuit een Daisycon-feed

Eén script, op de Mac: `npm run keten:feed-sync`. Het leest de feed, legt hem naast de
database en schrijft alleen wat veranderd is. Standaard is het een droge run; zonder
`--ja` verandert er niets.

## Waarom niet de edge function

`import-daisycon-feed` kan de H&M-feed niet aan (237 MB JSON), herschrijft elke rij
(`updated_at = now()`, ongeveer 1 GB op een schijf van 11 tot 15 MB/s) en zet verdwenen
producten nooit uit voorraad. Hij blijft bruikbaar voor kleine feeds die je in
`/admin/daisycon-import` plakt. De omzetting van een feedregel naar een productrij staat
nu op één plek, `supabase/functions/_shared/daisyconRows.ts`, en wordt door beide gebruikt.

## Hoe de H&M-feed werkt (gemeten 8 oktober 2026)

- De feed bevat alleen beschikbare maten. Een uitverkochte maat staat er niet als
  `in_stock = false` in, hij is weg. "Niet in de feed" betekent dus "uit voorraad".
- Een artikel is één kleur; elke maat is een eigen rij met dezelfde foto. In de database
  vormen rijen met dezelfde `image_url` een foto-groep met één canonieke rij.
- De product-ID's (`daisycon_unique_id`) veranderden tussen maart en oktober 2026: van de
  88.043 oude rijen had er geen enkele nog een id in de feed, en ook de sku-reeks is
  anders. Het artikelnummer in de productpagina-URL (`productpage.1350214002.html`) en de
  maat zijn gebleven. Het script koppelt oude rijen daarop (`feed-sync/profielen.ts`),
  zodat tags, embeddings en de pool bewaard blijven.
- De opgeslagen URL gaf HTTP 204 (leeg). Dezelfde URL met `general=true` geeft de feed,
  met `ws=fitfihm` en `wi=418695` in de links. Staat nu zo in `affiliate_campaigns`.

## Fasen

```
npm run keten:feed-sync -- --retailer "H&M (NL)"                      # droge run
npm run keten:feed-sync -- --retailer "H&M (NL)" --fase a --ja --limiet 200   # kanarie
npm run keten:feed-sync -- --retailer "H&M (NL)" --fase a --ja
```

**Fase a** ververst bestaande rijen (nieuw external_id, prijs, oorspronkelijke prijs,
link, beeld, weer op voorraad) en voegt nieuwe toe. Er verdwijnt niets uit de pool.

Daarna, met de hand:

```
supabase db query --linked "set statement_timeout = '15min'; select * from keten_vul_nieuwe_producten('H&M (NL)')"
npm run keten:classificeer -- --alleen-veegronde
npm run keten:tag -- --retailer "H&M (NL)" --limit 1000 --ja        # of de nachtrunner
```

Praktisch, gemeten op 8 oktober 2026 met 49.514 nieuwe rijen:

- `keten_vul_nieuwe_producten` draait ongeveer 7 minuten. De Management API geeft na twee
  minuten HTTP 524, maar de query loopt aan de serverkant door en wordt gewoon afgerond.
  Een 524 is dus geen mislukking: kijk in `pg_stat_activity` of hij nog loopt en tel daarna
  de rijen zonder attributen.
- De veegronde van `keten:classificeer` kan op een koude cache drie keer achter elkaar op
  de statement-timeout van 8 seconden lopen en stopt dan. Opnieuw draaien is veilig en
  hervat bij de rijen die nog geen `classifier_version` hebben.
- Schrijven verdringt de buffers: de warm-job (`keten_warm_houden`) deed 46 seconden over
  zijn run en één lichte query van de site-rol duurde 8,4 seconden. Het script ziet dat,
  wacht 30 seconden en gaat door. Draai fase a daarom buiten de piekuren.

**Fase b** zet wat uit de feed verdwenen is uit voorraad en laat de canonieke rij van een
foto-groep overgaan op een maat die er nog is (`keten_herkies_canoniek`). Doe dit pas
nadat de nieuwe rijen getagd zijn, anders is de pool tijdelijk leger dan nodig: van de
H&M-pool (16.034 looks, op 8 oktober) blijven 4.417 zonder wijziging, 2.690 houden hun
look via een andere maat, en 8.927 verdwijnen omdat het hele artikel weg is.

```
npm run keten:feed-sync -- --retailer "H&M (NL)" --fase b --ja --sta-veel-weg-toe
npm run keten:poort -- --retailer "H&M (NL)"                         # persona-poort
```

## Vangrails

Het script weigert, met een foutmelding, als:

- de feed geen producten bevat (een 204 of lege respons zet nooit alles uit voorraad);
- het aantal gelezen producten niet gelijk is aan wat de kop belooft (afgekapte download);
- de feed minder dan de helft is van wat nu op voorraad staat;
- meer dan de helft van wat op voorraad staat zou verdwijnen. Dat is op 8 oktober
  werkelijk zo (66,7 procent, omdat de oude data 7 maanden achterliep) en vraagt dus
  `--sta-veel-weg-toe` na het lezen van de aantallen.

Tijdens het schrijven meet het script elke vijf batches hoe snel de site-rol (`anon`)
een lichte query beantwoordt en wacht of stopt als de database het niet bijhoudt.

## Terugdraaien

Elke run bewaart in `~/FitFi-worktrees/tools/data/feed-sync/<tijdstip>-<retailer>/`:
`a1-oud.ndjson` (oude waarden van de bijgewerkte rijen), `a2-ingevoegd.ndjson` (de
external_id's van nieuwe rijen) en `b1-uitgezet.ndjson` (de ids die uit voorraad gingen).

```
npm run keten:feed-sync -- --terugdraaien <map> --ja
```

Niet teruggedraaid: een wissel van de canonieke rij (staat in `keten_canoniek_wissels`).

## Tests

`scripts/keten/__tests__/`: `daisyconRows`, `feedLezer`, `feedSyncPlan`, `feedSyncProfielen`,
`feedSyncBewaking` (draaien overal) en `feed-sync.sql` (gedragstest in een transactie die
terugdraait; draai met `supabase db query --linked -f`, eindigt in `FEED_SYNC_OK`).
