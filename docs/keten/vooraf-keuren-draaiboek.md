# Draaiboek: de meetnacht van het vooraf keuren

Voor wie de meetnacht start (Luc of een Claude-sessie). Ontwerp en regels:
`docs/keten/vooraf-keuren-review.md`. Code: `scripts/keten/stijl-sets.ts` en `src/keten/stijl/`.

Niets in dit draaiboek raakt de site. Tijdens de nacht wordt ook de database niet gebruikt.

## 1. Kiezen hoe er betaald wordt

Elke aanroep van de stijl-agent is een `claude -p`, op Lucs abonnement of op een API-sleutel. De
scripts weigeren te keuren of te labelen zonder bewuste keuze: `--via sleutel` of `--via abonnement`.

- **sleutel** (advies): een Anthropic API-sleutel in `~/.config/fitfi/anthropic-api-key`, alleen
  leesbaar voor Luc (`chmod 600`). Aanmaken op platform.claude.com, het liefst in een aparte
  werkruimte met een maandlimiet. De sleutel komt nooit in een log of rapport.
- **abonnement**: Lucs Max. Max valt onder de consumentenvoorwaarden van Anthropic ("Non-commercial
  use only", artikel 11), en Lucs avondjobs delen hetzelfde quotum. Kies je dit toch: starten na
  21:30, de nacht stopt voor 02:30 (`--tot`), en het script wacht tot brein-curator en brein-eod
  klaar zijn.

Na elke aanroep wordt gecontroleerd hoe claude betaalde. Klopt dat niet met `--via`, dan stopt de
nacht (`verkeerde-betaling`).

## 2. Voor de nacht

Alles vanuit de werkmap `/Users/luc/FitFi-worktrees/beloftes`, met `--via` zoals gekozen.

1. **Labels v2 afmaken.** 800 van de 2.963 looks hebben al een nieuw label. Hetzelfde commando gaat
   verder; wat al een label heeft, slaat het over:
   ```
   D=/Users/luc/FitFi-worktrees/tools/data/stijl
   npm run -s keten:stijl-label -- --in $D/v2-a-invoer.json --uit $D/v2-a-labels.json --portie 100 --via sleutel --ja
   npm run -s keten:stijl-label -- --in $D/v2-b-invoer.json --uit $D/v2-b-labels.json --portie 100 --via sleutel --ja
   ```
   Daarna wegschrijven met `npm run keten:stijl-vul -- --labels <samengevoegd bestand> --ja` en
   tellen hoeveel rijen in `keten_stijl_labels` nog geen `seizoen` hebben.
2. **Opnieuw kalibreren met precies de aanroep en invoer van de nacht** (4 aanroepen):
   ```
   npm run keten:stijl-keur -- --ja --via sleutel --model sonnet --effort xhigh
   ```
   De agent ziet nu wat hij in de nacht ziet: gemengde porties, korte id's en een profiel zonder
   lichtheid of kleurtemperatuur. Tot 21 oktober stonden de namen uit de set ("goed-4", "fout-4")
   in de opdracht; de eerdere uitslag zegt daarom weinig. Dit is de eerste eerlijke meting.
   Geslaagd: 16 van 16 "fout" herkend (fout-5 telt niet meer: die hing af van de keuze voor licht),
   niets ten onrechte goedgekeurd, minstens 8 van 10 "goed", geen ontbrekend oordeel. Het rapport
   noemt het model dat echt antwoordde ("Antwoordde: ..."). Dat id is de `--model` voor de nacht;
   een alias weigert het script.
3. **Pool ophalen**, pas na stap 1 (31 lichte aanroepen als anon, ongeveer 80 seconden; start niet
   als feed-sync of de tagger draait):
   ```
   npm run -s keten:stijl-sets -- --alleen-pool
   ```
   Het script toont per stijl hoeveel rijen een seizoenlabel hebben. Onder 90 procent weigert de
   nacht te starten: dan zijn labels v2 nog niet weggeschreven. De pool van 21 oktober had 0 procent.
4. **Droge run**: kandidaten per combinatie en de stand uit het logboek, zonder aanroep:
   ```
   npm run -s keten:stijl-sets -- --pool ~/claude-artifacts/fitfi-keten/stijl-sets/pool-<datum>.json
   ```
   Op 21 oktober gaf dat 9 tot 72 nieuwe kandidaten per combinatie. Vrouw minimalistisch op kantoor
   had er maar 9: de engine maakt daar ongeveer 4 outfits per run.

## 3. De nacht

```
cd /Users/luc/FitFi-worktrees/beloftes
nohup caffeinate -i npm run -s keten:stijl-sets -- \
  --pool ~/claude-artifacts/fitfi-keten/stijl-sets/pool-<datum>.json \
  --via sleutel --model <id uit de kalibratie> --ja \
  > ~/claude-artifacts/fitfi-keten/stijl-sets/nacht.log 2>&1 & disown
```

Het terminalvenster mag daarna dicht: `disown` houdt de shell weg van de nacht, en het script negeert
ook zelf SIGHUP (Node zet het negeren door nohup bij het starten terug). Een onbekende of verkeerd
gespelde vlag laat het script direct stoppen, voordat er iets gebeurt.

Standaard: hooguit 72 aanroepen (`--max-aanroepen`), denkniveau `xhigh`, 6 minuten per aanroep.
Met `--via abonnement` stopt de nacht ook voor 02:30 (`--tot`).

De nacht stopt vanzelf bij: het plafond, de deadline, een limietmelding, drie mislukte aanroepen op
rij, een ander model dan `--model`, of een andere betaalroute dan `--via`. Ook als elke combinatie
vol is (12 bevestigd), arm, of door haar kandidaten heen.

**Met de hand stoppen:** `kill -INT $(cat ~/claude-artifacts/fitfi-keten/stijl-sets/.lock)`.
De lopende aanroep wordt afgebroken, het logboek is al bijgewerkt, het rapport volgt.

## 4. De ochtend

- Rapport: `~/claude-artifacts/fitfi-keten/stijl-sets/nacht-<tijd>.md` (en `.json`), met elke
  combinatie, ook die zonder keuring, en de status open, vol, arm, uitgeput of geen kandidaten.
  Opnieuw maken kan met `npm run -s keten:stijl-sets -- --rapport`; dat schrijft
  `nacht-<tijd>-herberekend.md` naast het origineel.
- Logboek: `oordelen.jsonl` (een regel per keuring, met de stukken, prijzen, kleuren en beeld-URL's),
  `aanroepen.jsonl` (een regel per aanroep) en `nachten.jsonl` (start en stop van elke run, met de
  reden). Alleen aanvullen; een nieuwe run gaat verder waar de vorige stopte. Een herstart in
  dezelfde nacht (12:00 tot 12:00) telt mee voor het plafond en de limiet per combinatie.
- Daarna: Luc beoordeelt blind 40 outfits ("zou ik dit dragen"): 20 bevestigd, 10 twijfel, 10 fout.
  De site krijgt de bibliotheek pas als minstens 17 van de 20 bevestigde een ja krijgen.
