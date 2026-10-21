# Vooraf keuren: alleen outfits tonen die de stijl-agent heeft goedgekeurd

Besloten door Luc op 21 oktober 2026 (optie A): de stijl-agent keurt outfits vooraf, op het
Claude-abonnement, 's nachts na zijn eigen jobs, verspreid over twee à drie nachten, met een
noodrem op limietmeldingen. Eerst de 40 meest gekozen combinaties.

## Waarom

De stijl-agent (`src/keten/stijl/stijlAgent.ts`) keurt betrouwbaar: twee kalibratierondes
fout 17 van 17, goed 9 van 10, nul ten onrechte goedgekeurd, 31 van 33 dezelfde beslissing.
De site zelf haalt dat niveau niet. Eindtoets op 21 oktober (8 profielen, 6 outfits per
profiel, echte keten, agent keurt): huidige site 12 van 48 goed; met stijllabels 8 van 48;
met regels voor formaliteit per gelegenheid 6 van 47. Regels vangen het oog van de agent niet
("blauw op blauw van twee merken", "te veel beige"). Live per bezoeker keuren kan niet: een
`claude -p`-aanroep duurt een minuut of langer.

## Wat er komt

1. **Bibliotheek van goedgekeurde outfits.** Per combinatie (geslacht, stijl, gelegenheid)
   een voorraad outfits die de agent "goed" noemde. Doel: 12 per combinatie, zodat er na
   filteren op budget en lichtheid van een bezoeker nog genoeg over is.
2. **Vulscript** (`scripts/keten/stijl-sets.ts`): per combinatie kandidaten samenstellen met de
   echte keten (get_kandidaten en get_stijl_kandidaten, runEngineV2 met meerdere zaden en een
   breed budget), dubbele weglaten, laten keuren in porties, de goede opslaan. Hervatbaar:
   een combinatie die vol is, slaat het over. Noodrem: stopt bij een limietmelding. Nachtbudget:
   een maximum aantal aanroepen per run.
3. **Opslag en leesfunctie** in Supabase: een rij per goedgekeurde outfit (product-ID's, titel,
   uitleg, gelegenheid, stijl, geslacht, totaalprijs, aantal donkere stukken, agentversie,
   tijdstip). De leesfunctie geeft alleen outfits waarvan elk stuk nog op voorraad is.
4. **Site**: bij het laden haalt de site goedgekeurde outfits voor de gekozen stijlen en
   gelegenheden, filtert op budget (elk stuk binnen het bereik), lichtheid (bij licht hooguit
   een donker stuk) en eventueel kleurtemperatuur, en vult aan met de engine waar te weinig is.
5. **Meten**: de eindtoets meet het aandeel outfits uit de bibliotheek en keurt het geheel.

## Randvoorwaarden

- Database: Supabase Micro, schijf van ongeveer 11 tot 15 MB/s, kwetsbaar bij zware queries
  (8 uur plat op 15 okt door een zware functie). Onder row-level security schat de planner
  aantallen verkeerd; "= any(lijst)" op de primaire sleutel werkte voor get_stijl_kandidaten.
  Schrijven in porties. Geen zware scans.
- Abonnement: Lucs jobs (brein-curator 20:45, brein-eod 21:00, review-engine do 03:00,
  daily-note-autopilot 06:55) delen het quotum. Begin oktober vielen twaalf runs om na een
  weeklimiet. Het vulscript draait na 21:15 en stopt ruim voor 03:00 en 06:55.
- Gemeten: een keuring van 9 outfits per aanroep kost ongeveer 2 tot 3 minuten; bij een kwart
  goedkeuring zijn er ongeveer 4 keuringen per goede outfit nodig.
- De keten verandert: voorraad (H&M-feed), labels (versie 2 met seizoen en gedateerd) en de
  engine. Een goedgekeurde outfit kan verouderen.

## Open vragen voor de review

- Is (geslacht, stijl, gelegenheid) de goede sleutel, of moet budget of lichtheid erin?
- Hoe ga je om met bezoekers met meer stijlen of meer gelegenheden?
- Hoe blijft de bibliotheek vers (voorraad, seizoen, nieuwe versie van de agent)?
- Wat als een combinatie weinig goede outfits oplevert (streetwear formeel)?
- Hoe voorkom je dat de site trager wordt?
