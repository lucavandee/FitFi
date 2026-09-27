# Onboarding v2 uitvoeringsplan

> **Voor agentische uitvoerders:** VEREISTE SUB-SKILL: gebruik superpowers:subagent-driven-development of superpowers:executing-plans om dit plan taak voor taak uit te voeren. Stappen gebruiken checkbox-syntax (`- [ ]`).

**Doel:** een bezoeker doorloopt op `/start` in minder dan drie minuten vier feiten plus zes tot twaalf dit-of-dat-paren en krijgt op `/results?v=2` zes outfits met per outfit de knoppen "Zou ik dragen" en "Nooit".

**Architectuur:** De onboarding is een pure reducer met zes stappen. Die reducer draagt de hele bedrading van het dit-of-dat-scherm: een klik legt de keuze vast, herberekent de assen, bepaalt het volgende paar en het stopmoment. Daardoor is de kern van dit plan zonder DOM te testen, en roepen zowel de pagina als het persona-harnas dezelfde code aan. Drie pure modules in `src/keten/` (profiel, paarselectie, kandidatenStart) doen het rekenwerk eronder. Drie nieuwe tabellen (`taste_profiles`, `pair_sets`, `taste_profile_sizes`) en een rij `keten_v2` in `remote_flags` dragen de data; `compose-outfits` uit plan 3 krijgt twee modi erbij: een `pair`-modus waarmee `scripts/keten/genereer-paren.ts` de paren vooraf vult met een plafond op het aantal modelaanroepen, en een `lees`-modus waarmee een gedeelde link naar `/results?v=2&p=<hash>` de gecachete outfits terugkrijgt zonder dat `taste_profiles` opengaat. `/start` en `/results?v=2` zijn altijd bereikbaar; de bestaande `/onboarding` en `/results` blijven staan en verwijzen pas naar de nieuwe pagina's als de vlag aan staat, en die gaat pas om na de poort voor Luc (taak 15).

**Stack:** Vite + React 18 + TypeScript, Tailwind 3.4, Supabase (Postgres, RLS, edge functions in Deno), vitest, vite-node voor scripts, Netlify.

**Spec:** docs/superpowers/specs/2026-09-14-keten-herbouw-design.md

---

## Globale randvoorwaarden

- Dit is plan 4 van 4 (spec 9). Het bouwt op plan 1 (`product_attributes`, RPC `get_kandidaten`, tabel `outfit_ratings`, component `OutfitRatingButtons`, `scripts/keten/persona-run.ts`), plan 2 (tag-kolommen zodat `get_kandidaten` op assen scoort, negende parameter `p_retailer`, `scripts/keten/env.ts`, `scripts/keten/args.ts`) en plan 3 (`tsconfig.keten.json` met de poorten `typecheck:keten` en `check:edge`, `supabase/functions/_shared/keten-types.ts`, `valideer-outfits.ts`, `src/keten/types.ts`, `src/keten/profileHash.ts`, `src/keten/composeClient.ts`, `src/keten/browserConfig.ts`, edge function `compose-outfits`, `scripts/keten/stylist-controles.ts`, `scripts/keten/stylist-run.ts`). Begin pas als die drie gemerged zijn op `feat/keten-herbouw`; taak 0 controleert dat mechanisch en stopt anders.
- Poorten na elke taak, dezelfde zes als in plan 3: `npx tsc --noEmit`, `npx vitest run`, `npx vite build`, `npm run typecheck:keten`, `npm run check:edge` (of `check:shared` in taken zonder edge-code), en de design-poort `npm run design:poort -- <nieuwe of gewijzigde ui-bestanden>` uit taak 0. Elke taak eindigt met de volledige regel; geen taak slaat een poort over.
- Over `npm run design:check:ci` (spec 8): gemeten op `feat/keten-herbouw` op 2026-09-16 geeft dat script `Total Violations: 13244`, `COMPLIANCE SCORE: 0%` en exit 1. Het script (`scripts/check-design-compliance.mjs`) kent geen `--strict`, telt elke `text-[#1A1A1A]` die CLAUDE.md voorschrijft als overtreding, telt `top-3` als `p-3`, en zakt onder de drempel van 70 procent bij meer dan 150 overtredingen in de hele `src/`. Het kan in dit plan niet groen worden zonder de sanering die de spec in 7 uitsluit. Daarom levert taak 0 `scripts/keten/design-poort.ts`: dezelfde vijf controles, per bestand, met als enige uitzonderingen de kleuren uit het palet van CLAUDE.md, de schaduwen die CLAUDE.md toestaat (`hover:shadow-md`, `shadow-sm` op formulier-cards, `shadow-xl` op modals) en `top-3 left-3` voor badges. Dat is de design-poort van dit plan; elke taak met ui-bestanden draait hem.
- UI strikt volgens CLAUDE.md design system v1.0 (deel 2 en 13): pagina-achtergrond `bg-[#FAFAF8]`; page header `bg-[#F5F0EB] pt-44 md:pt-52 pb-16 md:pb-20` met witte badge, H1 `text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center` en subtitel `text-base text-[#4A4A4A] text-center mt-4 max-w-lg mx-auto`; secties minimaal `py-16 md:py-24`, afwisselend `bg-[#FAFAF8]` en `bg-[#F5F0EB]`; container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`; cards `bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md`; formulier-cards `shadow-sm`; primaire knop `bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base px-6 rounded-xl min-h-[48px]`; secundaire knop `bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base px-6 rounded-xl min-h-[48px]`; geselecteerde state `bg-[#F4E8E3] border-[#A85740] text-[#A85740]`; badges `rounded-full bg-[#A85740]/10 text-[#A85740]`, op cards `absolute top-3 left-3`; afbeeldingen `aspect-[3/4] object-cover loading="lazy"`; tap targets minimaal 44px (`min-h-[44px]`); tekst nooit kleiner dan `text-sm`; Lucide-iconen `w-5 h-5`; `transition-colors duration-200` of `transition-shadow duration-200`; geen kleuren buiten het palet.
- Een bewuste afwijking, dezelfde als in plan 1 en 3: knoppen krijgen hun hoogte van `min-h-[48px]` met verticale centrering in plaats van `py-3`, omdat `py-3` (12px) buiten de 8px-schaal van CLAUDE.md deel 3 valt.
- Copy: Nederlands, je en jij, geen buzzwords, geen em-dashes, headlines maximaal acht woorden, CTA's maximaal drie woorden. Vaste CTA-teksten: "Bekijk je resultaten" (afronden van de onboarding) en "Bekijk bij partner" (naar de winkel). De beoordelingsknoppen heten letterlijk "Zou ik dragen" en "Nooit" (plan 1).
- Een nieuwe knoptekst in dit plan: "Maten bewaren" (taak 12). CLAUDE.md deel 10 legt vijf conversiemomenten vast (quiz starten, premium, outfit opslaan, naar de shop, rapport bekijken); maten opslaan is er daar geen van, dus dit is een toevoeging en geen variatie op een bestaande tekst. Hij volgt de copy-regels: twee woorden, Nederlands, geen buzzword. Verder introduceert dit plan geen enkele nieuwe knoptekst; elke andere knop gebruikt een tekst uit CLAUDE.md deel 10 of een navigatiewoord ("Verder", "Terug").
- Tracking: `track` uit `src/utils/telemetry.ts`, dezelfde tracker die `EnhancedResultsPage.tsx` en `OutfitRatingButtons` gebruiken. Gemeten op 2026-09-16: dat bestand heeft `export function track(event: string, props?: TelemetryPayload)` en daarnaast `export default track`. Dit plan importeert altijd de named export (`import { track } from '@/utils/telemetry'`), zodat een latere opruiming van de default-export niets breekt. `src/utils/analytics.ts` (gtag) wordt hier niet gebruikt. Elke stap stuurt `track('onboarding_step', { step, index })`; afbreken stuurt `track('onboarding_abandoned', { step, index })`.
- Sessie-id: `getSessionId()` uit `src/utils/sessionId.ts` (UUID in localStorage onder `ff_session_id`); dezelfde id die `affiliate_clicks` en `outfit_ratings` gebruiken.
- Supabase in de browser: `supabase()` uit `@/lib/supabaseClient` (null als `VITE_USE_SUPABASE` niet `true` is); de keten-config via `browserKetenConfig()` uit plan 3.
- Migraties: `supabase/migrations/YYYYMMDDHHMMSS_naam.sql` met commentaarblok bovenaan (probleem, wat de migratie doet, terugdraaien). Toepassen altijd per bestand met `supabase db query --linked -f <bestand>`, nooit met `supabase db push` en nooit met `psql`. Reden (zelfde meting als plan 1, randvoorwaarde over migraties): er staat geen `psql` op deze machine, en de remote migratiehistorie kent de oude bestanden in `supabase/migrations/` niet, dus `supabase db push` zou ze allemaal opnieuw willen draaien. Plan 3 taak 3 noemt nog `supabase db push` en `psql "$SUPABASE_DB_URL"`; dat is in plan 3 een fout en in dit plan verboden. Controle-queries met `supabase db query --linked "<sql>" -o table`. Tijdstempels in dit plan beginnen bij `20260918100000` en lopen op.
- Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) alleen in `.env` (repo-root, in `.gitignore`) en Supabase secrets; nooit in code, commits of logregels. Scripts lezen ze via `leesEnv()` uit `scripts/keten/env.ts` (plan 2).
- Modelaanroepen kosten geld (sectie Kosten). `genereer-paren.ts` weigert een volle run zonder `--alles`, heeft een plafond `--max-aanroepen` (standaard 150) en een verplichte droogloop als eerste stap. De pair-modus van de edge function is alleen met de service role bereikbaar.
- Engine v2, `products` en de bestaande `/onboarding` en `/results` worden niet aangepast (spec 7). `src/App.tsx` krijgt alleen nieuwe routes en een schakelaar.
- Alles wat deterministisch kan, is deterministisch: gelijke keuzes geven dezelfde `profile_hash`, dezelfde paarvolgorde en dezelfde outfits.
- Tests: pure logica met vitest in `__tests__`-mappen naast de code (omgeving `node`, alias `@`, zie `vitest.config.ts`). React-componenten met `renderToString` uit `react-dom/server`, zoals `src/components/quiz/__tests__/CalibrationStep.render.test.tsx` (gemeten op 2026-09-16: dat bestand en `vitest.config.ts` staan in de repo). Er is geen jsdom en dit plan voegt geen afhankelijkheid toe; daarom staat alles wat gedrag heeft in pure functies en in de reducer van taak 9, en testen de component-tests alleen de opmaak. Bestanden in `supabase/functions/_shared/` importeren elkaar met `.ts`-extensie (Deno) en worden nooit rechtstreeks vanuit `src/` geïmporteerd, alleen via de re-export in `src/keten/types.ts`.
- Bestanden uit plan 1 en 3 worden nooit op regelnummer gepatcht, alleen op tekstanker, en elke patch begint met een `grep -c` die precies 1 moet geven. Regelnummers in `src/App.tsx` en `package.json` zijn gemeten op `feat/keten-herbouw` op 2026-09-16 en zijn hulp, het tekstanker is leidend.
- Commit per taak, boodschap in het Nederlands, met de attributieregel `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`, op de branch `feat/keten-herbouw`.

## Antwoord op de pre-commitment test

Kun je vandaag een taak uit dit plan starten zonder plan 1, 2 en 3 te bouwen? Nee, op taak 0 na. Gemeten op 2026-09-16 op `feat/keten-herbouw`: `src/keten/` bestaat niet, `supabase/functions/compose-outfits/` bestaat niet, `scripts/keten/` bevat alleen `vul-attributes.sh` en het ongecommitte `classificeer-attributes.ts`, en `package.json` kent `typecheck:keten`, `check:edge` en `keten:personas` niet. Van plan 1 staat alleen de migratie `20260914120000_product_attributes_fundament.sql` in de repo (commit `163c595d`); de code eromheen niet. Dit plan is daarom bewust het vierde in de volgorde uit spec 9 en geen los uitvoerbaar document.

Wat dit plan doet om dat eerlijk te houden, en wat je als lezer mag verwachten:

- Alleen uitspraken over bestanden die vandaag in de repo staan zijn metingen, met de datum erbij: `src/App.tsx`, `package.json`, `src/utils/telemetry.ts`, `scripts/check-design-compliance.mjs` en de bestaande migraties.
- Elke uitspraak over iets wat plan 1, 2 of 3 nog moet opleveren is een verwachting met de bron erbij ("plan 3 taak 2 levert ..."), niet een meting. Komt de werkelijkheid straks niet overeen, dan is dat een bevinding over dat plan en niet over dit plan.
- Taak 0 is de plek waar die verwachtingen echt getoetst worden: zijn startpoort controleert elk aangenomen bestand, elke aangenomen functie en elke aangenomen databaseobject, noemt bij een gemis het plan en de taak waar het vandaan had moeten komen, en stopt.
- Elke "Gebruikt"-regel noemt de taak in plan 1, 2 of 3 waar de interface vandaan komt, en de zelfcontrole onderaan claimt niets dat de stappen niet doen.

## Kosten en tijd

Model: `claude-sonnet-5` (spec 5.4), 2 dollar per miljoen input-tokens en 10 dollar per miljoen output-tokens (zelfde bron als plan 3, sectie Kosten).

Pair-modus (taak 7), per paar:

| Onderdeel | Tokens of aantal |
|---|---|
| Twee `get_kandidaten`-aanroepen (een per kant), samen tot 144 kandidaten | geen modelkosten |
| Systeemprompt plus segment en as | circa 400 |
| Tot 144 kandidaten in de prompt, circa 75 tokens per kandidaat | circa 10.800 |
| Tool-schema | circa 200 |
| **Input per aanroep** | **circa 11.400 (0,023 dollar)** |
| Output: twee kanten met 3 tot 5 items | circa 300 (0,003 dollar) |
| **Per geldig paar, eerste poging** | **circa 0,026 dollar** |
| Met herkansing (slechtste geval) | circa 0,052 dollar |

Gevolgen. De paren worden voor drie geslachten gemaakt: dames, heren en unisex. Spec 6 stap 1 biedt "beide (unisex)" als keuze, dus zonder unisex-rijen in `pair_sets` loopt die bezoeker na vier stappen vast op te weinig paren. Unisex hoort daarmee bij de eerste volle run en is geen latere uitbreiding.

- Een segment (een geslacht, een gelegenheid, een band; zes assen, vier paren) kost 24 tot 48 aanroepen, 0,65 tot 1,30 dollar.
- Een band (3 geslachten x 7 gelegenheden = 21 segmenten) kost 504 tot 1008 aanroepen, 13 tot 26 dollar.
- Een volle run (3 banden, 63 segmenten, 1512 paren) kost 39 tot 79 dollar en duurt bij circa 8 seconden per aanroep 3,5 tot 7 uur. Daarom: droogloop verplicht, `--alles` verplicht voor meer dan een band of meer dan een geslacht, en een plafond `--max-aanroepen` (standaard 150, dus hooguit circa 8 dollar per run zonder expliciete verhoging).
- Compose per nieuw profiel (plan 3): 0,025 tot 0,05 dollar per `profile_hash`, cache daarna. Het harnas in taak 14 kost koud circa 0,25 dollar (vijf persona's), warm niets.
- Meten: `outfit_sets.input_tokens` en `output_tokens` (plan 3) tellen de compose-kosten; de pair-modus logt per aanroep `usage` in de functielogs en het script telt aanroepen in zijn slotregel. De Anthropic-factuur loopt via het bestaande account en de bestaande Moneybird-werkwijze; dit plan maakt geen nieuwe post aan.

Tijd, schatting per taak voor een ontwikkelaar die de codebase niet kent, exclusief wachttijd op modelruns:

| Taak | Uren |
|---|---|
| 0 startpoort en design-poort | 1,5 |
| 1 migratie | 1 |
| 2 paar-types en profiel | 1,5 |
| 3 paarselectie | 1 |
| 4 vlag | 1 |
| 5 kandidaten en opslag | 1,5 |
| 6 pair-prompt en validatie | 2 |
| 7 pair-modus en leesmodus in de edge function | 2,5 |
| 8 genereer-paren, plus 1 tot 4 uur wachttijd per band | 2,5 |
| 9 reducer met de hele bedrading en een sessietest | 1,5 |
| 10 stapcomponenten | 3 |
| 11 StartPage en route | 2,5 |
| 12 ResultsV2Page en leesOutfits | 3 |
| 13 KetenSwitch | 1,5 |
| 14 harnas v2 | 2 |
| 15 poort voor Luc | 1 |
| **Totaal** | **circa 29 uur, vier werkdagen** |

## Wat de spec openlaat en hier is besloten

1. **Prijsband 100tot200 zonder garantie.** Spec 5.7 garandeert dekking alleen voor `tot50` en `50tot100`. De budgetstap toont daarom een band alleen als er voor de keuzes van de bezoeker een ankerproduct is en minstens `MIN_PAREN` paren in `pair_sets` staan; anders is de kaart uitgeschakeld met de tekst "Nog geen aanbod in deze prijsband" (taak 5, 10, 11). Het harnas (taak 14) heeft een vijfde persona op `100tot200`; heeft dat segment geen dekking in `get_kandidaten`, dan is de persona "overgeslagen" en niet rood, zodat een bekend gat de wekelijkse poort niet permanent rood maakt. Heeft het segment wel dekking maar geen paren, dan is dat rood.
2. **Maten landen in een tabel.** Spec 6 stap 6 vraagt maten optioneel onder de outfits maar noemt geen tabel. Een invoer die nergens landt is precies wat spec 1 wil doorbreken; daarom komt er een insert-only tabel `taste_profile_sizes` (taak 1), gekoppeld aan `profile_hash` en `session_id`. De stylist gebruikt de maten nog niet; ze zijn wel te tellen en te koppelen aan `outfit_ratings`.
3. **Kosten begrensd in het script, niet in de edge function.** De pair-modus is alleen met de service role bereikbaar; het plafond zit in `genereer-paren.ts` (`--max-aanroepen`), omdat dat de enige aanroeper is.
4. **Vlag met percentage.** `remote_flags.percentage` telt mee: `enabled = false` is altijd uit, `percentage = 100` voor iedereen aan, daartussen een vaste bucket uit het sessie-id (taak 4). Zo kan de vlag eerst op 10 procent.
5. **De v2-resultatenpagina staat niet achter de inlogpoort.** Gemeten op `src/App.tsx` regel 189: `/results` staat achter `<RequireAuth><RequireQuiz>`. Een anonieme bezoeker die `/start` afrondt kan `/results?v=2` dus nooit zien, terwijl spec 6 stap 6 geen account vraagt en het doel van dit plan "in minder dan drie minuten" is. Daarom zet `KetenSwitch` (taak 13) de twee poorten binnen de v1-tak in plaats van om de hele route: de v1-tak blijft letterlijk `<RequireAuth><RequireQuiz><WithSeo.Results /></RequireQuiz></RequireAuth>` en de v2-tak is `<WithSeo.ResultsV2 />` zonder poort. Voor iedereen zonder `?v=2` en zonder vlag verandert er niets.
6. **Assen zijn ordinaal of nominaal; het profiel telt richtingen, geen losse waarden.** Spec 5.2 schrijft "value is de kant met de meerderheid, confidence is |gekozen - afgewezen| / aantal keuzes op die as". Dat is de formule voor een as met twee polen, maar `formality` heeft vijf waarden en `silhouette` vier, en taak 8 meet een as bewust met wisselende contrasten (eerst 2 tegen 4, daarna 3 tegen 5, anders meet je een keer wat je vier keer vraagt). Wie twee keer de formelere kant kiest, verdeelt zijn stemmen dan over 4 en 5; tellen per losse waarde zou daar zekerheid 0 van maken terwijl de bezoeker maximaal consistent was, en de adaptieve stopregel zou precies de verkeerde kant op gaan. Daarom krijgt elke as een soort (`AS_SOORT` in taak 2):
   - **Ordinaal** (`formality` 1 tot 5, `silhouette` slim-regular-relaxed-oversized, `lightness` licht-medium-donker, `pattern` effen-subtiel-statement, `color_temp` koel-neutraal-warm). `AS_WAARDEN` legt de schaal vast, van laag naar hoog. Een keuze telt als een richting: +1 als de gekozen kant hoger op de schaal staat dan de afgewezen kant, -1 als hij lager staat. `confidence` is `|som van de richtingen| / aantal keuzes op die as`. `value` is de schaalwaarde die hoort bij het gemiddelde van de gekozen kanten, afgerond naar de dichtstbijzijnde bestaande waarde.
   - **Nominaal** (`shoe_type`: sneaker, net, laars, sandaal). Hier bestaat geen richting, dus blijft het tellen per waarde uit de spec: `value` is de waarde met de meeste stemmen, `confidence` is `(meeste - op een na meeste) / aantal keuzes op die as`. Dat mag alleen als elk paar op die as hetzelfde waardepaar contrasteert, anders keert hetzelfde probleem terug. `AS_CONTRASTEN` (taak 8) heeft voor een nominale as daarom precies een contrast, met een test die faalt zodra dat er meer worden.

   Bij een as met twee waarden geven beide takken dezelfde uitkomst als de formule uit de spec.

7. **Een gedeelde link naar `/results?v=2` werkt zonder localStorage.** Het profiel staat alleen in localStorage, `taste_profiles` heeft bewust geen select-policy (taak 1) en er is geen herstel uit de URL. Een gedeelde link of een tweede toestel geeft daardoor "We kennen je keuzes nog niet", terwijl de outfits voor die hash al in `outfit_sets` staan. Dat ondermijnt juist besluit 5, dat de v2-pagina zonder inlogpoort zet zodat delen kan. Gekozen: `compose-outfits` krijgt naast de pair-modus een leesmodus (taak 7). Een verzoek `{ mode: 'lees', profile_hash }` zonder profiel geeft de gecachete outfits terug als ze er zijn, en anders een expliciet "niet gevonden". `ResultsV2Page` (taak 12) leest `?p=<profile_hash>` uit de querystring zodra localStorage leeg is, en `/start` zet die parameter in de URL bij het afronden (taak 11), zodat de bezoeker een deelbare link in zijn adresbalk heeft. `taste_profiles` blijft dicht: er komt geen select-policy en er gaat geen persoonlijk gegeven over de lijn, alleen outfits met catalogusdata. De hash is een sha256 van de keuzes en dus niet te raden; beide kanten controleren dat hij uit precies 64 hex-tekens bestaat voordat er iets gebeurt.

## Bestandsstructuur

Aanmaken:

| Bestand | Verantwoordelijkheid |
|---|---|
| `scripts/keten/design-poort.ts` | Bestandsgerichte design-poort: de vijf controles van `check-design-compliance.mjs` met de uitzonderingen uit CLAUDE.md; exit 1 bij een overtreding |
| `scripts/keten/__tests__/design-poort.test.ts` | Tests voor de poort |
| `supabase/migrations/20260918100000_keten_v2_onboarding.sql` | Tabellen `taste_profiles` (spec 5.2), `pair_sets` (spec 7.2), `taste_profile_sizes`, RLS, indexen, rij `keten_v2` in `remote_flags` |
| `supabase/functions/_shared/paar-types.ts` | Pure types en constanten voor paren: `Prijsband`, `PRIJSBANDEN`, `BAND_GRENZEN`, `PAAR_KANTEN`, `PaarItem`, `PaarKant`, `PaarSegment`, `PairSet` |
| `src/keten/profiel.ts` | `setId`, `kantVanSet`, `berekenAxes`, `bouwTasteProfile`; exporteert `profileHash` en `normaliseerProfiel` uit plan 3 opnieuw |
| `src/keten/__tests__/profiel.test.ts` | Tests voor de profielberekening |
| `src/keten/paarSelectie.ts` | `onzekersteAs`, `volgendPaar`, `klaar`, `MIN_PAREN`, `MAX_PAREN`, `DREMPEL` |
| `src/keten/__tests__/paarSelectie.test.ts` | Tests voor de adaptieve paarselectie |
| `src/keten/remoteVlag.ts` | Pure `beslisFlag(row, sessionId)` en `bucket(sessionId)` |
| `src/keten/__tests__/remoteVlag.test.ts` | Tests voor de vlagbeslissing |
| `src/hooks/useRemoteFlag.ts` | Hook die `remote_flags` leest, in localStorage cachet en `{ aan, geladen }` geeft |
| `src/keten/kandidatenStart.ts` | `BANDEN`, `budgetVoorBand`, `kiesAnker`, `kiesNoGoItems`, `segmentenVoor`, `heeftDekking`, `haalStartKandidaten`, `haalPairSets`, `telPairSets` |
| `src/keten/__tests__/kandidatenStart.test.ts` | Tests voor banden, ankers, no-go-selectie, segmenten en dekking |
| `src/keten/tasteProfielOpslag.ts` | `slaTasteProfielOp`, `slaMatenOp`, `bewaarLokaalProfiel`, `leesLokaalProfiel`, `wisLokaalProfiel` |
| `src/keten/prijs.ts` | `formatPrijs(n)`: euro met komma en twee decimalen |
| `src/keten/leesOutfits.ts` | `isProfileHash`, `haalOutfitsViaHash`: de leesmodus vanuit de browser, voor een gedeelde link |
| `src/keten/__tests__/leesOutfits.test.ts` | Tests voor de hash-controle en het lezen |
| `supabase/functions/_shared/paar-prompt.ts` | Pure kern van de pair-modus: `PAAR_TOOL_NAAM`, `bouwPaarToolSchema`, `bouwPaarSysteemPrompt`, `bouwPaarGebruikersPrompt`, `draagtAs`, `valideerPaar` |
| `supabase/functions/_shared/__tests__/paar-prompt.test.ts` | Tests voor schema, prompt en validatie |
| `supabase/functions/compose-outfits/paar.ts` | `handlePaar(req, body)`: kandidaten per kant, modelaanroep, validatie, herkansing, antwoord |
| `supabase/functions/compose-outfits/lees.ts` | `handleLees(req, body)`: gecachete outfits bij een `profile_hash`, zonder profiel en zonder modelaanroep (besluit 7) |
| `scripts/keten/genereer-paren.ts` | Vult `pair_sets` per segment en as tot minstens vier paren, met plafond; verwijdert paren met uitverkochte items |
| `scripts/keten/__tests__/genereer-paren.test.ts` | Tests voor de contrasten per as, de segmentlijst en de foutsoorten |
| `src/components/start/startReducer.ts` | `Stap`, `STAPPEN`, `StartState`, `StartActie`, `beginState`, `startReducer`, `magVerder` |
| `src/components/start/__tests__/startReducer.test.ts` | Tests voor de reducer |
| `src/components/start/StartStap.tsx` | Gedeelde schil: page header met badge, voortgang, knoppen terug en verder; exporteert de knop- en keuzeklassen |
| `src/components/start/VoorWie.tsx` | Stap 1: dames, heren, beide |
| `src/components/start/Gelegenheden.tsx` | Stap 2: maximaal drie gelegenheden; exporteert `GELEGENHEID_LABEL` |
| `src/components/start/Budget.tsx` | Stap 3: drie banden met ankerproduct; band zonder aanbod uitgeschakeld |
| `src/components/start/NoGo.tsx` | Stap 4: zes items, tik wat je nooit draagt |
| `src/components/start/DitOfDat.tsx` | Stap 5: twee outfits naast elkaar, toetsenbord |
| `src/components/start/Klaar.tsx` | Stap 6: samenvatting en "Bekijk je resultaten" |
| `src/components/start/__tests__/stappen.render.test.tsx` | Render-tests van de zes stappen |
| `src/pages/start/StartPage.tsx` | Orkestratie: reducer, data laden, tracking, afronden, navigatie |
| `src/pages/start/__tests__/StartPage.render.test.tsx` | Render-test van de eerste stap, zonder Supabase |
| `src/components/results/OutfitV2Card.tsx` | Een outfit met titel, reden, items met prijs, "Bekijk bij partner" en `OutfitRatingButtons` |
| `src/components/results/MatenOptioneel.tsx` | Optionele maten onder de outfits, naar `taste_profile_sizes` en localStorage |
| `src/components/results/__tests__/OutfitV2Card.render.test.tsx` | Render-test van de outfitkaart |
| `src/pages/ResultsV2Page.tsx` | Zes outfits via `composeVoorProfiel`, met maten eronder |
| `src/components/keten/KetenSwitch.tsx` | Kiest v1 of v2 op basis van `?v=` en de vlag `keten_v2` |
| `src/components/keten/__tests__/KetenSwitch.render.test.tsx` | Render-test van de schakelaar |
| `scripts/keten/keten-v2-run.ts` | Persona-run door de hele keten v2 met vijf persona's, dekkingscontrole en rapportbestand |
| `scripts/keten/__tests__/keten-v2-run.test.ts` | Tests voor de gesimuleerde keuze en de persona-lijst |
| `docs/keten/keten-v2-rapport.md` | Uitvoer van de harnas-run; bijlage bij de poort |
| `docs/keten/poort-luc-keten-v2.md` | Checklist voor de poort uit spec 8 en het vlagbeleid |

Wijzigen:

| Bestand | Wijziging |
|---|---|
| `package.json` (blok `scripts`, regels 10-30 gemeten op 2026-09-16) | `design:poort` (taak 0), `keten:paren` (taak 8), `keten:v2` (taak 14) |
| `src/keten/types.ts` (plan 3 taak 2; tekstanker `export * from '../../supabase/functions/_shared/keten-types';`) | Extra re-export van `paar-types` |
| `supabase/functions/compose-outfits/index.ts` (plan 3 taak 6; tekstanker `if (!isVerzoek(verzoek)) {`) | Vertakking naar `handlePaar` bij `mode === 'pair'` en naar `handleLees` bij `mode === 'lees'` |
| `src/App.tsx` (tekstankers: `const ResultsPreview     = lazy(` en `  ResultsPreview: () =>` voor de lazy imports en het `WithSeo`-blok, `<Route path="/stijlquiz"` voor de nieuwe route, `<Route path="/onboarding" element={<WithSeo.Onboarding />} />` (twee keer) en `<Route path="/results" element={<RequireAuth><RequireQuiz><WithSeo.Results /></RequireQuiz></RequireAuth>} />` voor de schakelaar) | Lazy imports `StartV2` en `ResultsV2`, `WithSeo.Start` en `WithSeo.ResultsV2`, route `/start` (taak 11), `KetenSwitch` op `/onboarding` en `/results` (taak 13) |
| `scripts/keten/persona-run.ts` (plan 1 taak 11, plan 3 taak 8; tekstanker `if (process.argv.includes('--keten=stylist')) {`) | Modus `--keten=v2` die naar `keten-v2-run.ts` delegeert |

---

### Taak 0: Startpoort en design-poort

**Bestanden:**
- Aanmaken: `scripts/keten/design-poort.ts`
- Wijzigen: `package.json` (blok `scripts`; na de regel `"design:check:ci": "node scripts/check-design-compliance.mjs --strict",`, regel 28 gemeten op 2026-09-16)
- Test: `scripts/keten/__tests__/design-poort.test.ts`; de controlecommando's in stap 1

**Interfaces:**
- Gebruikt: alles wat plan 1, 2 en 3 leveren (de lijst in de randvoorwaarden); `tsconfig.keten.json` (plan 3 taak 1) zodat `scripts/keten/**/*.ts` door `typecheck:keten` gaat.
- Levert: `npm run design:poort -- <bestanden>`; functie `controleer(inhoud: string): Overtreding[]` met `interface Overtreding { regel: number; soort: string; match: string }`.

- [ ] **Stap 1: Toets elke aanname over plan 1, 2 en 3 en stop bij het eerste gemis**

Dit plan doet uitspraken over bestanden en functies die plan 1, 2 en 3 nog moeten opleveren. Dit blok is de plek waar die verwachtingen echte controles worden. Het noemt bij elk gemis het plan en de taak waar het vandaan had moeten komen.

```bash
ontbreekt=0
mis()      { echo "ONTBREEKT: $1  <- $2"; ontbreekt=$((ontbreekt + 1)); }
bestand()  { [ -f "$1" ] || mis "bestand $1" "$2"; }
inhoud()   { { [ -f "$1" ] && grep -qF -- "$2" "$1"; } || mis "$1 mist \"$2\"" "$3"; }

echo "branch:      $(git branch --show-current)          (verwacht feat/keten-herbouw)"
echo "ongecommit:  $(git status --short | grep -cv '^??')  (verwacht 0)"

bestand src/keten/types.ts                              "plan 3 taak 2"
bestand src/keten/profileHash.ts                        "plan 3 taak 2"
bestand src/keten/composeClient.ts                      "plan 3 taak 7"
bestand src/keten/browserConfig.ts                      "plan 3 taak 7"
bestand src/keten/personas.ts                           "plan 1 taak 11"
bestand supabase/functions/_shared/keten-types.ts       "plan 3 taak 2"
bestand supabase/functions/_shared/valideer-outfits.ts  "plan 3 taak 4"
bestand supabase/functions/_shared/stylist-prompt.ts    "plan 3 taak 5"
bestand supabase/functions/_shared/cors.ts              "bestaand"
bestand supabase/functions/compose-outfits/index.ts     "plan 3 taak 6"
bestand scripts/keten/env.ts                            "plan 2"
bestand scripts/keten/args.ts                           "plan 2"
bestand scripts/keten/persona-run.ts                    "plan 1 taak 11"
bestand scripts/keten/stylist-controles.ts              "plan 3 taak 8"
bestand scripts/keten/stylist-run.ts                    "plan 3 taak 8"
bestand tsconfig.keten.json                             "plan 3 taak 1"
bestand src/components/results/OutfitRatingButtons.tsx  "plan 1 taak 9"
bestand src/services/ratings/outfitRatings.ts           "plan 1 taak 9"

inhoud package.json '"typecheck:keten"'                                   "plan 3 taak 1"
inhoud package.json '"check:edge"'                                        "plan 3 taak 1"
inhoud package.json '"check:shared"'                                      "plan 3 taak 1"
inhoud package.json '"keten:personas"'                                    "plan 1 taak 11"
inhoud supabase/functions/_shared/keten-types.ts 'export const AS_NAMEN'   "plan 3 taak 2"
inhoud supabase/functions/_shared/keten-types.ts 'export function legeAssen' "plan 3 taak 2"
inhoud supabase/functions/_shared/valideer-outfits.ts 'export function isCompleet' "plan 3 taak 4"
inhoud supabase/functions/_shared/stylist-prompt.ts 'export const STYLIST_VERSION' "plan 3 taak 5"
inhoud supabase/functions/compose-outfits/index.ts 'if (!isVerzoek(verzoek)) {' "plan 3 taak 6"
inhoud src/keten/types.ts "export * from '../../supabase/functions/_shared/keten-types';" "plan 3 taak 2"
inhoud src/keten/profileHash.ts 'export function normaliseerProfiel'      "plan 3 taak 2"
inhoud src/keten/composeClient.ts 'export async function composeVoorProfiel' "plan 3 taak 7"
inhoud src/keten/browserConfig.ts 'export function browserKetenConfig'     "plan 3 taak 7"
inhoud scripts/keten/stylist-run.ts 'export function scriptKetenConfig'    "plan 3 taak 8"
inhoud scripts/keten/stylist-controles.ts 'export function controleerOutfitSet' "plan 3 taak 8"
inhoud scripts/keten/stylist-controles.ts 'export function zelfdeOutfits'  "plan 3 taak 8"
inhoud scripts/keten/env.ts 'export function leesEnv'                      "plan 2"
inhoud scripts/keten/args.ts 'export function heeftVlag'                   "plan 2"
inhoud scripts/keten/args.ts 'export function leesVlag'                    "plan 2"
inhoud scripts/keten/persona-run.ts 'keten=stylist'                        "plan 3 taak 8"
inhoud src/utils/telemetry.ts 'export function track'                      "bestaand, gemeten op 2026-09-16"
inhoud src/App.tsx '<Route path="/results" element={<RequireAuth><RequireQuiz><WithSeo.Results /></RequireQuiz></RequireAuth>} />' "bestaand, gemeten op 2026-09-16"

echo "---"
[ "$ontbreekt" -eq 0 ] && echo "Alle bestands- en tekstaannames kloppen." || echo "STOP: $ontbreekt aanname(s) kloppen niet."
```

```bash
supabase db query --linked "select count(*) as get_kandidaten_met_9_params from pg_proc where proname = 'get_kandidaten' and pronargs = 9" -o table
supabase db query --linked "select table_name from information_schema.tables where table_name in ('product_attributes','outfit_ratings','outfit_sets','feed_gates') order by 1" -o table
```

Verwacht: het eerste blok eindigt met `Alle bestands- en tekstaannames kloppen.`, de branch is `feat/keten-herbouw` en er staan geen ongecommitte wijzigingen aan bestaande bestanden; `get_kandidaten_met_9_params` is `1` (de negen-parameter-versie uit plan 2 taak 7); de tweede query geeft vier rijen: `feed_gates` (plan 2), `outfit_ratings` (plan 1 taak 4), `outfit_sets` (plan 3 taak 3) en `product_attributes` (plan 1 taak 1).

Staat er een `ONTBREEKT`-regel, of ontbreekt een tabel, dan is het genoemde plan niet af. Stop, meld wat er mist en uit welk plan en welke taak het had moeten komen, en begin niet aan taak 1. Ook taak 0 zelf loopt dan vast: zijn poort in stap 6 gebruikt `typecheck:keten` en `check:shared` uit plan 3 taak 1.

- [ ] **Stap 2: Schrijf de falende test voor de design-poort**

Maak `scripts/keten/__tests__/design-poort.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { controleer } from '../design-poort';

describe('design-poort', () => {
  it('accepteert een component die CLAUDE.md volgt', () => {
    const goed = `
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md">
        <span className="absolute top-3 left-3 rounded-full bg-[#A85740]/10 text-[#A85740] px-4 py-2 text-sm">Badge</span>
        <form className="rounded-2xl p-6 md:p-8 shadow-sm">
          <button type="button" className="min-h-[48px] px-6 rounded-xl bg-[#A85740] hover:bg-[#9A503B] text-white">Verder</button>
        </form>
      </div>`;
    expect(controleer(goed)).toEqual([]);
  });

  it('meldt een kleur buiten het palet met regelnummer', () => {
    const fout = `<p className="text-[#1A1A1A]">a</p>\n<p className="text-[#123456]">b</p>`;
    expect(controleer(fout)).toEqual([{ regel: 2, soort: 'kleur buiten het palet', match: 'text-[#123456]' }]);
  });

  it('meldt spacing buiten de 8px-schaal, maar niet top-3 en left-3', () => {
    expect(controleer('<div className="p-3 mt-5 gap-4 top-3 left-3" />').map((o) => o.match)).toEqual(['p-3', 'mt-5']);
    expect(controleer('<div className="py-3" />').map((o) => o.match)).toEqual(['py-3']);
  });

  it('meldt schaduwen buiten CLAUDE.md en accepteert de drie toegestane', () => {
    expect(controleer('<div className="shadow-lg hover:shadow-md shadow-sm shadow-xl shadow-2xl" />').map((o) => o.match)).toEqual([
      'shadow-lg',
      'shadow-2xl',
    ]);
  });

  it('meldt een losse lettergrootte en een knop met een andere hoogte', () => {
    const uit = controleer('<button className="min-h-[40px] text-[13px]">x</button>');
    expect(uit.map((o) => o.soort)).toEqual(['lettergrootte buiten de schaal', 'knophoogte niet 44 of 48']);
  });
});
```

- [ ] **Stap 3: Draai de test en zie hem falen**

```bash
npx vitest run scripts/keten/__tests__/design-poort.test.ts
```

Verwacht: `Failed to resolve import "../design-poort"`.

- [ ] **Stap 4: Schrijf de poort**

Maak `scripts/keten/design-poort.ts`:

```typescript
/**
 * Bestandsgerichte design-poort voor keten-code.
 *
 * scripts/check-design-compliance.mjs telt de hele src/ en staat op 0 procent
 * (13.244 overtredingen op 2026-09-16), omdat hij elke hex-kleur telt, ook de
 * kleuren die CLAUDE.md voorschrijft, en top-3 als p-3 leest. Deze poort doet
 * dezelfde vijf controles per bestand, met als enige uitzonderingen wat
 * CLAUDE.md expliciet toestaat: het palet, hover:shadow-md op cards,
 * shadow-sm op formulier-cards, shadow-xl op modals, en top-3 left-3 voor
 * badges op cards.
 *
 * Gebruik:
 *   npm run design:poort -- src/components/start/*.tsx src/pages/start/StartPage.tsx
 * Exit 1 bij een overtreding, met bestand, regel en match.
 */
import { readFileSync } from 'node:fs';

export const PALET: ReadonlySet<string> = new Set([
  '#A85740', '#9A503B', '#F4E8E3',
  '#1A1A1A', '#4A4A4A', '#6E6E6E', '#E5E5E5', '#FAFAF8', '#FFFFFF', '#F5F0EB',
  '#3D8B5E', '#D4913D', '#C24A4A', '#4A7EC2',
]);

export const TOEGESTANE_SCHADUW: ReadonlySet<string> = new Set(['hover:shadow-md', 'shadow-sm', 'shadow-xl']);

export interface Overtreding {
  regel: number;
  soort: string;
  match: string;
}

const KLEUR = /(?:bg|text|border|ring|from|to|via)-\[(#[0-9A-Fa-f]{3,8})\](?:\/\d+)?/g;
/** Zelfde lijst als check-design-compliance.mjs; de lookbehind voorkomt dat top-3 als p-3 telt. */
const SPACING = /(?<![A-Za-z-])(gap|space-x|space-y|p|m|px|py|mx|my|mt|mb|ml|mr|pt|pb|pl|pr)-(1|3|5|7|9|11|13|14|15|17|18|19|21|22|23)(?![0-9])/g;
const LETTER = /text-\[(?!var\()[\d.]+(?:px|rem|em)\]/g;
const KNOP = /<(?:button|Button)[^>]*min-h-\[(?!48px|44px)\d+px\]/g;
const SCHADUW = /(?:[a-z]+:)?shadow-(?!none\b)[a-z0-9]+/g;

export function controleer(inhoud: string): Overtreding[] {
  const uit: Overtreding[] = [];
  const regelVan = (index: number) => inhoud.slice(0, index).split('\n').length;
  const meld = (m: RegExpMatchArray, soort: string, match = m[0]) => uit.push({ regel: regelVan(m.index ?? 0), soort, match });

  for (const m of inhoud.matchAll(KLEUR)) {
    if (!PALET.has(m[1].toUpperCase())) meld(m, 'kleur buiten het palet', m[0].replace(/\/\d+$/, ''));
  }
  for (const m of inhoud.matchAll(SPACING)) meld(m, 'spacing buiten de 8px-schaal');
  for (const m of inhoud.matchAll(LETTER)) meld(m, 'lettergrootte buiten de schaal');
  for (const m of inhoud.matchAll(KNOP)) meld(m, 'knophoogte niet 44 of 48', m[0].match(/min-h-\[\d+px\]/)?.[0] ?? m[0]);
  for (const m of inhoud.matchAll(SCHADUW)) {
    if (!TOEGESTANE_SCHADUW.has(m[0])) meld(m, 'schaduw buiten CLAUDE.md');
  }

  return uit.sort((a, b) => a.regel - b.regel || a.soort.localeCompare(b.soort));
}

function main(bestanden: string[]): number {
  if (bestanden.length === 0) {
    console.error('Gebruik: npm run design:poort -- <bestanden>');
    return 2;
  }
  let totaal = 0;
  for (const pad of bestanden) {
    const overtredingen = controleer(readFileSync(pad, 'utf8'));
    for (const o of overtredingen) console.log(`${pad}:${o.regel}: ${o.soort}: ${o.match}`);
    totaal += overtredingen.length;
  }
  console.log(totaal === 0 ? `design-poort: ${bestanden.length} bestanden schoon` : `design-poort: ${totaal} overtredingen`);
  return totaal === 0 ? 0 : 1;
}

if (process.argv.some((a) => a.endsWith('design-poort.ts'))) {
  process.exit(main(process.argv.slice(process.argv.findIndex((a) => a.endsWith('design-poort.ts')) + 1)));
}
```

In `package.json`, na de regel `"design:check:ci": "node scripts/check-design-compliance.mjs --strict",`, voeg toe:

```json
    "design:poort": "vite-node scripts/keten/design-poort.ts",
```

- [ ] **Stap 5: Draai de test en zie hem slagen; draai de poort op een bestaand bestand**

```bash
npx vitest run scripts/keten/__tests__/design-poort.test.ts
npm run design:poort -- src/components/results/OutfitRatingButtons.tsx; echo "exit=$?"
```

Verwacht: `Tests  5 passed (5)`. Daarna draait de poort op `OutfitRatingButtons.tsx`. Plan 1 taak 9 schrijft dat bestand met alleen paletkleuren en `min-h-[48px]`, dus de verwachting is `design-poort: 1 bestanden schoon` en `exit=0`. Print hij overtredingen, dan is dat een bevinding over plan 1; noteer ze in de commit-boodschap en verander de poort niet.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:shared
git add scripts/keten/design-poort.ts scripts/keten/__tests__/design-poort.test.ts package.json
git commit -m "chore(keten): bestandsgerichte design-poort voor plan 4

check-design-compliance.mjs staat repo-breed op 0 procent en telt de
paletkleuren van CLAUDE.md als overtreding. Deze poort doet dezelfde vijf
controles per bestand met alleen de uitzonderingen die CLAUDE.md noemt.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 1: Migratie `taste_profiles`, `pair_sets`, `taste_profile_sizes` en de vlag

**Bestanden:**
- Aanmaken: `supabase/migrations/20260918100000_keten_v2_onboarding.sql`
- Test: de controle-queries in stap 1, 3 en 4 (er is geen SQL-testrunner in deze repo; de queries zijn de test)

**Interfaces:**
- Gebruikt: tabel `products(id, price, in_stock)` (bestaand); tabel `remote_flags(flag_name, enabled, percentage, config, created_at, updated_at)` (bestaand, migratie `20250805134134_throbbing_tooth.sql` regel 116); `auth.users(id)`; de conventie van `outfit_ratings` uit plan 1 taak 4 (insert-only voor anon, geen select-policy).
- Levert:
  - `public.taste_profiles(id, profile_hash, user_id, session_id, gender, occasions, budget_min, budget_max, nogo_product_ids, choices, axes, liked_product_ids, disliked_product_ids, created_at)` met `profile_hash` uniek; insert voor `anon` en `authenticated`, geen select.
  - `public.pair_sets(pair_id, segment_key, gender, occasion, price_band, axis, kanten, product_ids, model, input_tokens, output_tokens, created_at)` met `pair_id` als primaire sleutel; select voor iedereen, schrijven alleen service role.
  - `public.pair_sets_op_voorraad`: dezelfde kolommen, maar alleen de rijen waarvan elk product in `products` nog `in_stock = true` is (ruling 2: geen cron, de join filtert).
  - `public.taste_profile_sizes(id, profile_hash, session_id, user_id, sizes, created_at)`, insert-only voor anon.
  - Rij `keten_v2` in `remote_flags` met `enabled = false` en `percentage = 0`.

Wat de spec openlaat en hier is besloten:
- `pair_sets.pair_id` is `text` en niet `uuid`, want taak 7 leidt hem deterministisch af uit segment, as en de gesorteerde product-ids. Twee keer hetzelfde paar genereren geeft dan dezelfde rij in plaats van een duplicaat.
- `pair_sets` heeft naast `kanten jsonb` een kolom `product_ids uuid[]`. Zonder die kolom zou de voorraadcontrole elk paar moeten openvouwen in SQL; met de kolom is het een array-join op `products` en een GIN-index.
- Geen select-policy op `taste_profiles`: de client houdt zijn eigen profiel in localStorage (taak 5) en stuurt het mee naar `compose-outfits`. De tabel is er om te meten, niet om uit te lezen.

- [ ] **Stap 1: Controle vooraf, verwacht drie keer nul en geen vlag**

```bash
supabase db query --linked "select count(*) as tabellen from information_schema.tables where table_schema = 'public' and table_name in ('taste_profiles','pair_sets','taste_profile_sizes')" -o table
supabase db query --linked "select count(*) as vlag from remote_flags where flag_name = 'keten_v2'" -o table
supabase db query --linked "select count(*) as producten_op_voorraad from products where in_stock = true" -o table
```

Verwacht: `tabellen = 0`, `vlag = 0`, en een getal boven nul bij `producten_op_voorraad`. Is `tabellen` niet 0, dan is deze migratie al eens gedraaid; hij is idempotent (`if not exists`, `on conflict do nothing`), dus je mag doorgaan, maar controleer in stap 3 of de kolommen kloppen.

- [ ] **Stap 2: Schrijf de migratie**

Maak `supabase/migrations/20260918100000_keten_v2_onboarding.sql`:

```sql
/*
  # Onboarding v2: taste_profiles, pair_sets, taste_profile_sizes, vlag keten_v2

  ## Probleem
  De onboarding levert nu quiz-antwoorden af in localStorage. Niets van wat een
  bezoeker kiest landt in de database, dus niets is te tellen en niets is te
  hergebruiken. Spec 5.2 en 7.2 vragen twee tabellen: een profiel per bezoeker
  (met een hash die de outfit-cache bepaalt) en vooraf gegenereerde paren voor
  het dit-of-dat-scherm.

  ## Wat deze migratie doet
  1. taste_profiles (spec 5.2): een rij per afgerond profiel. profile_hash is
     de sha256 uit spec 5.2.1 en is uniek; twee bezoekers met dezelfde keuzes
     delen dus een rij en daarmee dezelfde outfit-cache in outfit_sets.
     Insert-only voor anon en authenticated, net als outfit_ratings (plan 1).
  2. pair_sets (spec 7.2): een rij per paar. Een paar is twee complete outfits
     die op precies een as verschillen. pair_id is deterministisch afgeleid uit
     segment, as en de gesorteerde product-ids, zodat opnieuw genereren geen
     duplicaten maakt. Alleen de service role schrijft; iedereen leest.
  3. pair_sets_op_voorraad: dezelfde rijen, maar alleen de paren waarvan elk
     product nog op voorraad is. Spec 7.2 vroeg om "regeneratie als een item uit
     voorraad gaat"; er komt geen cron. In plaats daarvan filtert deze view bij
     het ophalen, en scripts/keten/genereer-paren.ts vult handmatig bij als er
     te weinig paren overblijven.
  4. taste_profile_sizes: de maten die de bezoeker optioneel onder de outfits
     invult (spec 6 stap 6). Spec noemt geen tabel; zonder tabel landt de
     invoer nergens en dat is precies wat spec 1 wil doorbreken.
  5. Vlag keten_v2 in remote_flags, uit (enabled false, percentage 0).

  ## Terugdraaien
  drop view if exists public.pair_sets_op_voorraad;
  drop table if exists public.taste_profile_sizes;
  drop table if exists public.pair_sets;
  drop table if exists public.taste_profiles;
  delete from public.remote_flags where flag_name = 'keten_v2';
*/

-- 1. taste_profiles (spec 5.2)

create table if not exists public.taste_profiles (
  id                   uuid primary key default gen_random_uuid(),
  profile_hash         text not null unique check (profile_hash ~ '^[0-9a-f]{64}$'),
  user_id              uuid references auth.users(id) on delete set null,
  session_id           text not null check (length(session_id) between 8 and 128),
  gender               text not null check (gender in ('male', 'female', 'unisex')),
  occasions            text[] not null check (
                         array_length(occasions, 1) between 1 and 3
                         and occasions <@ array['work','casual','formal','date','travel','sport','party']::text[]
                       ),
  budget_min           integer not null check (budget_min >= 0),
  budget_max           integer not null check (budget_max >= budget_min),
  nogo_product_ids     uuid[] not null default '{}',
  choices              jsonb not null default '[]'::jsonb check (jsonb_typeof(choices) = 'array'),
  axes                 jsonb not null default '{}'::jsonb check (jsonb_typeof(axes) = 'object'),
  liked_product_ids    uuid[] not null default '{}',
  disliked_product_ids uuid[] not null default '{}',
  created_at           timestamptz not null default now()
);

create index if not exists idx_taste_profiles_session on public.taste_profiles (session_id);
create index if not exists idx_taste_profiles_created_at on public.taste_profiles (created_at);

alter table public.taste_profiles enable row level security;

drop policy if exists "Bezoekers mogen een profiel opslaan" on public.taste_profiles;
create policy "Bezoekers mogen een profiel opslaan"
  on public.taste_profiles
  for insert
  to anon, authenticated
  with check (
    session_id is not null
    and (user_id is null or user_id = auth.uid())
  );

-- Bewust geen select-, update- of delete-policy: de client houdt zijn eigen
-- profiel in localStorage en stuurt het mee naar compose-outfits.

comment on table public.taste_profiles is
  'Profiel uit onboarding v2 (spec 5.2). profile_hash is de sha256 uit 5.2.1 en bepaalt de cache in outfit_sets. Insert-only voor anon.';

-- 2. pair_sets (spec 7.2)

create table if not exists public.pair_sets (
  pair_id       text primary key check (pair_id ~ '^[0-9a-f]{32}$'),
  segment_key   text not null,
  gender        text not null check (gender in ('male', 'female', 'unisex')),
  occasion      text not null check (occasion in ('work','casual','formal','date','travel','sport','party')),
  price_band    text not null check (price_band in ('tot50','50tot100','100tot200','boven200')),
  axis          text not null check (axis in ('formality','silhouette','color_temp','lightness','pattern','shoe_type')),
  kanten        jsonb not null check (jsonb_typeof(kanten) = 'array' and jsonb_array_length(kanten) = 2),
  product_ids   uuid[] not null check (array_length(product_ids, 1) between 6 and 10),
  model         text,
  input_tokens  integer,
  output_tokens integer,
  created_at    timestamptz not null default now()
);

create index if not exists idx_pair_sets_segment on public.pair_sets (gender, occasion, price_band, axis);
create index if not exists idx_pair_sets_segment_key on public.pair_sets (segment_key);
create index if not exists idx_pair_sets_products on public.pair_sets using gin (product_ids);

alter table public.pair_sets enable row level security;

drop policy if exists "Iedereen mag paren lezen" on public.pair_sets;
create policy "Iedereen mag paren lezen"
  on public.pair_sets
  for select
  to anon, authenticated
  using (true);

-- Bewust geen insert-, update- of delete-policy: alleen de service role vult
-- deze tabel, via de edge function compose-outfits in pair-modus (taak 7).

comment on table public.pair_sets is
  'Vooraf gegenereerde dit-of-dat-paren per segment en as (spec 7.2). pair_id is deterministisch uit segment, as en gesorteerde product_ids. Schrijven alleen service role.';

-- 3. pair_sets_op_voorraad (ruling: geen cron, filteren bij het ophalen)

drop view if exists public.pair_sets_op_voorraad;
create view public.pair_sets_op_voorraad
with (security_invoker = true) as
select
  ps.pair_id,
  ps.segment_key,
  ps.gender,
  ps.occasion,
  ps.price_band,
  ps.axis,
  ps.kanten,
  ps.product_ids,
  ps.created_at
from public.pair_sets ps
where not exists (
  select 1
  from unnest(ps.product_ids) as nodig(id)
  where not exists (
    select 1 from public.products p where p.id = nodig.id and p.in_stock = true
  )
);

comment on view public.pair_sets_op_voorraad is
  'Alleen de paren waarvan elk product nog in_stock is. Het onboarding-scherm leest deze view, nooit pair_sets zelf.';

-- 4. taste_profile_sizes (spec 6 stap 6, tabel is een besluit van plan 4)

create table if not exists public.taste_profile_sizes (
  id           uuid primary key default gen_random_uuid(),
  profile_hash text not null check (profile_hash ~ '^[0-9a-f]{64}$'),
  session_id   text not null check (length(session_id) between 8 and 128),
  user_id      uuid references auth.users(id) on delete set null,
  sizes        jsonb not null check (jsonb_typeof(sizes) = 'object'),
  created_at   timestamptz not null default now()
);

create index if not exists idx_taste_profile_sizes_hash on public.taste_profile_sizes (profile_hash);

alter table public.taste_profile_sizes enable row level security;

drop policy if exists "Bezoekers mogen hun maten opslaan" on public.taste_profile_sizes;
create policy "Bezoekers mogen hun maten opslaan"
  on public.taste_profile_sizes
  for insert
  to anon, authenticated
  with check (
    session_id is not null
    and (user_id is null or user_id = auth.uid())
  );

comment on table public.taste_profile_sizes is
  'Optionele maten onder de resultaten (spec 6 stap 6). Insert-only; de stylist gebruikt ze nog niet, ze zijn wel te tellen en te koppelen aan outfit_ratings via profile_hash.';

-- 5. Vlag keten_v2, uit

insert into public.remote_flags (flag_name, enabled, percentage, config)
values ('keten_v2', false, 0, '{"beschrijving": "Onboarding v2 op /start en resultaten v2 op /results?v=2"}'::jsonb)
on conflict (flag_name) do nothing;
```

- [ ] **Stap 3: Pas de migratie toe en controleer de kolommen**

```bash
supabase db query --linked -f supabase/migrations/20260918100000_keten_v2_onboarding.sql
supabase db query --linked "select table_name, count(*) as kolommen from information_schema.columns where table_schema = 'public' and table_name in ('taste_profiles','pair_sets','taste_profile_sizes','pair_sets_op_voorraad') group by 1 order by 1" -o table
supabase db query --linked "select flag_name, enabled, percentage from remote_flags where flag_name = 'keten_v2'" -o table
supabase db query --linked "select indexname from pg_indexes where tablename in ('taste_profiles','pair_sets','taste_profile_sizes') order by 1" -o table
```

Verwacht: de migratie geeft geen fout; `pair_sets` 12 kolommen, `pair_sets_op_voorraad` 9, `taste_profile_sizes` 6, `taste_profiles` 14; `keten_v2 | false | 0`; en in de indexlijst staan `idx_pair_sets_products`, `idx_pair_sets_segment`, `idx_pair_sets_segment_key`, `idx_taste_profile_sizes_hash`, `idx_taste_profiles_created_at`, `idx_taste_profiles_session`, plus de drie primaire sleutels en `taste_profiles_profile_hash_key`.

- [ ] **Stap 4: Test de rechten als anon**

```bash
set -a; source .env; set +a
H=$(printf 'a%.0s' $(seq 1 64))
curl -s -o /dev/null -w "profiel insert: %{http_code}\n" -X POST "$VITE_SUPABASE_URL/rest/v1/taste_profiles" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d "{\"profile_hash\":\"$H\",\"session_id\":\"test-sessie-plan4\",\"gender\":\"female\",\"occasions\":[\"work\"],\"budget_min\":25,\"budget_max\":100}"
curl -s -w "\nprofiel select: %{http_code}\n" "$VITE_SUPABASE_URL/rest/v1/taste_profiles?select=id" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
curl -s -o /dev/null -w "maten insert: %{http_code}\n" -X POST "$VITE_SUPABASE_URL/rest/v1/taste_profile_sizes" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d "{\"profile_hash\":\"$H\",\"session_id\":\"test-sessie-plan4\",\"sizes\":{\"top\":\"M\"}}"
curl -s -w "\nparen select: %{http_code}\n" "$VITE_SUPABASE_URL/rest/v1/pair_sets_op_voorraad?select=pair_id&limit=1" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
curl -s -o /dev/null -w "paar insert: %{http_code}\n" -X POST "$VITE_SUPABASE_URL/rest/v1/pair_sets" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d '{"pair_id":"00000000000000000000000000000000","segment_key":"x","gender":"female","occasion":"work","price_band":"tot50","axis":"pattern","kanten":[{},{}],"product_ids":[]}'
curl -s "$VITE_SUPABASE_URL/rest/v1/remote_flags?select=flag_name,enabled,percentage&flag_name=eq.keten_v2" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

Verwacht, regel voor regel: `profiel insert: 201`; `profiel select` geeft `[]` met `200` (RLS laat niets zien); `maten insert: 201`; `paren select` geeft `[]` met `200` (nog geen paren); `paar insert: 401` of `403` (geen insert-policy); de laatste regel geeft `[{"flag_name":"keten_v2","enabled":false,"percentage":0}]`, wat bewijst dat de browser de vlag straks kan lezen.

Ruim de testrijen op:

```bash
supabase db query --linked "delete from taste_profile_sizes where session_id = 'test-sessie-plan4'; delete from taste_profiles where session_id = 'test-sessie-plan4';"
supabase db query --linked "select (select count(*) from taste_profiles) as profielen, (select count(*) from taste_profile_sizes) as maten" -o table
```

Verwacht: `profielen = 0`, `maten = 0`.

- [ ] **Stap 5: Controleer de voorraadfilter van de view**

```bash
supabase db query --linked "select count(*) as paren, (select count(*) from pair_sets_op_voorraad) as bruikbaar from pair_sets" -o table
```

Verwacht nu: `paren = 0`, `bruikbaar = 0`. Deze query is de controle uit ruling 2 en komt in taak 8 terug met een uitsplitsing per segment.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:shared
git add supabase/migrations/20260918100000_keten_v2_onboarding.sql
git commit -m "feat(db): taste_profiles, pair_sets, taste_profile_sizes en de vlag keten_v2

pair_sets_op_voorraad filtert paren met een uitverkocht item eruit bij het
ophalen, in plaats van een cron die paren opnieuw genereert. taste_profiles
is insert-only voor anon, net als outfit_ratings.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 2: Paar-types en de profielberekening

**Bestanden:**
- Aanmaken: `supabase/functions/_shared/paar-types.ts`
- Aanmaken: `src/keten/profiel.ts`
- Wijzigen: `src/keten/types.ts` (plan 3 taak 2 levert dat bestand als drie regels commentaar plus een re-export; tekstanker `export * from '../../supabase/functions/_shared/keten-types';`, en taak 0 heeft gecontroleerd dat die regel er staat)
- Test: `src/keten/__tests__/profiel.test.ts`

**Interfaces:**
- Gebruikt: `AsNaam`, `AS_NAMEN`, `Assen`, `AsWaarde`, `Categorie`, `Gelegenheid`, `Geslacht`, `Keuze`, `TasteProfileInput`, `legeAssen()` uit `supabase/functions/_shared/keten-types.ts` (plan 3 taak 2); `normaliseerProfiel(p: TasteProfileInput): string` en `profileHash(p: TasteProfileInput): Promise<string>` uit `src/keten/profileHash.ts` (plan 3 taak 2).
- Levert in `paar-types.ts`:
  ```typescript
  type Prijsband = 'tot50' | '50tot100' | '100tot200' | 'boven200'
  const PRIJSBANDEN: readonly Prijsband[]
  const BAND_GRENZEN: Record<Prijsband, { min: number; max: number; anker: number }>
  const PAAR_KANTEN: readonly ['a', 'b']
  type PaarKantNaam = 'a' | 'b'
  interface PaarItem { product_id: string; role: Categorie; name: string; brand: string | null; price: number; image_url: string | null }
  interface PaarKant { kant: PaarKantNaam; waarde: string; items: PaarItem[] }
  interface PaarSegment { gender: Geslacht; occasion: Gelegenheid; price_band: Prijsband }
  interface PairSet { pair_id: string; segment_key: string; gender: Geslacht; occasion: Gelegenheid; price_band: Prijsband; axis: AsNaam; kanten: PaarKant[] }
  function segmentKey(s: PaarSegment): string
  type AsSoort = 'ordinaal' | 'nominaal'
  const AS_SOORT: Record<AsNaam, AsSoort>
  const AS_WAARDEN: Record<AsNaam, readonly string[]>
  ```
- Levert in `src/keten/profiel.ts`:
  ```typescript
  function setId(pairId: string, kant: PaarKantNaam): string
  function kantVanSet(setId: string): PaarKantNaam | null
  function berekenAxes(choices: Keuze[], paren: PairSet[]): Assen
  interface ProfielInvoer { session_id: string; user_id: string | null; gender: Geslacht; occasions: Gelegenheid[]; budget_min: number; budget_max: number; nogo_product_ids: string[]; choices: Keuze[]; paren: PairSet[] }
  function bouwTasteProfile(invoer: ProfielInvoer): TasteProfileInput
  export { normaliseerProfiel, profileHash }  // uit plan 3, zodat de onboarding een import heeft
  ```
- Levert in `src/keten/types.ts`: de types van `paar-types.ts` zijn ook via `@/keten/types` te importeren.

De afleiding van `axes` volgt spec 5.2 en besluit 6 in "Wat de spec openlaat". Per as tellen alleen de keuzes waarin de twee kanten een andere waarde hadden, en daarna hangt het van de soort van de as af:

- **Ordinaal** (`formality`, `silhouette`, `color_temp`, `lightness`, `pattern`): `AS_WAARDEN` is de schaal van laag naar hoog. Elke keuze levert een richting op, +1 als de gekozen kant hoger staat dan de afgewezen kant en -1 als hij lager staat. `confidence` is `|som van de richtingen| / aantal keuzes op die as`, `value` is de schaalwaarde bij het gemiddelde van de gekozen posities, afgerond met `Math.round`. Zo telt iemand die eerst 4 boven 2 en daarna 5 boven 3 kiest als twee keer dezelfde richting, en niet als twee losse stemmen die elkaar opheffen. Taak 8 meet een as juist met wisselende contrasten, dus zonder deze regel zou de zekerheid dalen bij een bezoeker die maximaal consistent is.
- **Nominaal** (`shoe_type`): geen richting, dus tellen per waarde zoals de spec het letterlijk opschrijft. `value` is de waarde met de meeste stemmen, `confidence` is `(meeste - op een na meeste) / aantal keuzes op die as`. Dat klopt alleen als elk paar op die as hetzelfde waardepaar contrasteert; taak 8 dwingt dat af met een test.

Beide takken zijn deterministisch: `Math.round` rondt een half altijd naar boven, en gelijkspel bij een nominale as wordt gebroken door de volgorde in `AS_WAARDEN`. Dezelfde keuzes geven dus altijd hetzelfde profiel.

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/keten/__tests__/profiel.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { berekenAxes, bouwTasteProfile, kantVanSet, setId } from '../profiel';
import { legeAssen, type Keuze, type PaarItem, type PairSet } from '../types';

function item(id: string, role: PaarItem['role'], price = 50): PaarItem {
  return { product_id: id, role, name: `Product ${id}`, brand: 'Merk', price, image_url: null };
}

function paar(pair_id: string, axis: PairSet['axis'], waardeA: string, waardeB: string, ids: [string, string]): PairSet {
  return {
    pair_id,
    segment_key: 'female|work|50tot100',
    gender: 'female',
    occasion: 'work',
    price_band: '50tot100',
    axis,
    kanten: [
      { kant: 'a', waarde: waardeA, items: [item(`${ids[0]}t`, 'top'), item(`${ids[0]}b`, 'bottom'), item(`${ids[0]}f`, 'footwear')] },
      { kant: 'b', waarde: waardeB, items: [item(`${ids[1]}t`, 'top'), item(`${ids[1]}b`, 'bottom'), item(`${ids[1]}f`, 'footwear')] },
    ],
  };
}

function keuze(pair_id: string, gekozen: 'a' | 'b', axis: PairSet['axis']): Keuze {
  const afgewezen = gekozen === 'a' ? 'b' : 'a';
  return {
    pair_id,
    chosen_set_id: setId(pair_id, gekozen),
    rejected_set_id: setId(pair_id, afgewezen),
    axis,
  };
}

describe('setId en kantVanSet', () => {
  it('zetten een paar-id en een kant om en terug', () => {
    expect(setId('p1', 'a')).toBe('p1:a');
    expect(kantVanSet('p1:b')).toBe('b');
    expect(kantVanSet('p1')).toBeNull();
    expect(kantVanSet('p1:c')).toBeNull();
  });
});

describe('berekenAxes, ordinale assen (spec 5.2, besluit 6)', () => {
  const paren = [
    paar('p1', 'silhouette', 'slim', 'oversized', ['1', '2']),
    paar('p2', 'silhouette', 'slim', 'oversized', ['3', '4']),
    paar('p3', 'silhouette', 'slim', 'oversized', ['5', '6']),
    paar('p4', 'pattern', 'effen', 'statement', ['7', '8']),
  ];

  it('geeft lege assen zonder keuzes', () => {
    expect(berekenAxes([], paren)).toEqual(legeAssen());
  });

  it('drie keer dezelfde kant geeft zekerheid 1', () => {
    const uit = berekenAxes([keuze('p1', 'a', 'silhouette'), keuze('p2', 'a', 'silhouette'), keuze('p3', 'a', 'silhouette')], paren);
    expect(uit.silhouette).toEqual({ value: 'slim', confidence: 1 });
    expect(uit.pattern).toEqual({ value: null, confidence: 0 });
  });

  it('twee tegen een geeft zekerheid een derde en een waarde ertussenin', () => {
    // Richtingen -1, +1, -1: som -1 over drie keuzes. Gekozen posities 0, 3, 0:
    // gemiddeld 1, dus regular.
    const uit = berekenAxes([keuze('p1', 'a', 'silhouette'), keuze('p2', 'b', 'silhouette'), keuze('p3', 'a', 'silhouette')], paren);
    expect(uit.silhouette.value).toBe('regular');
    expect(uit.silhouette.confidence).toBeCloseTo(1 / 3, 6);
  });

  it('gelijkspel geeft zekerheid 0 en het midden tussen de gekozen kanten', () => {
    // Posities 0 en 3, gemiddeld 1,5, afgerond naar boven: relaxed.
    const uit = berekenAxes([keuze('p1', 'a', 'silhouette'), keuze('p2', 'b', 'silhouette')], paren);
    expect(uit.silhouette.confidence).toBe(0);
    expect(uit.silhouette.value).toBe('relaxed');
  });

  it('formality komt terug als getal', () => {
    const f = [paar('f1', 'formality', '2', '4', ['9', '10'])];
    expect(berekenAxes([keuze('f1', 'b', 'formality')], f).formality).toEqual({ value: 4, confidence: 1 });
  });

  it('twee keuzes met verschillende contrasten in dezelfde richting geven zekerheid 1', () => {
    // Precies het geval waarvoor tellen per losse waarde faalt: de bezoeker
    // kiest twee keer de formelere kant, maar zijn stemmen vallen op 4 en op 5.
    // Richtingen +1 en +1, dus zekerheid 1. Posities 3 en 4, gemiddeld 3,5,
    // afgerond naar boven: 5.
    const f = [
      paar('f1', 'formality', '2', '4', ['11', '12']),
      paar('f2', 'formality', '3', '5', ['13', '14']),
    ];
    const uit = berekenAxes([keuze('f1', 'b', 'formality'), keuze('f2', 'b', 'formality')], f);
    expect(uit.formality.confidence).toBe(1);
    expect(uit.formality.value).toBe(5);
  });

  it('twee keuzes met verschillende contrasten tegen elkaar in geven zekerheid 0', () => {
    // Richtingen +1 en -1. Posities 3 en 2, gemiddeld 2,5, afgerond naar boven: 4.
    const f = [
      paar('f1', 'formality', '2', '4', ['15', '16']),
      paar('f2', 'formality', '3', '5', ['17', '18']),
    ];
    const uit = berekenAxes([keuze('f1', 'b', 'formality'), keuze('f2', 'a', 'formality')], f);
    expect(uit.formality.confidence).toBe(0);
    expect(uit.formality.value).toBe(4);
  });

  it('negeert een keuze zonder bijbehorend paar en een paar zonder verschil', () => {
    const gelijk = [paar('g1', 'pattern', 'effen', 'effen', ['19', '20'])];
    expect(berekenAxes([keuze('g1', 'a', 'pattern')], gelijk)).toEqual(legeAssen());
    expect(berekenAxes([keuze('bestaat-niet', 'a', 'pattern')], paren)).toEqual(legeAssen());
  });

  it('negeert een kant met een waarde die niet op de schaal staat', () => {
    const raar = [paar('r1', 'silhouette', 'slim', 'bestaat-niet', ['21', '22'])];
    expect(berekenAxes([keuze('r1', 'a', 'silhouette')], raar)).toEqual(legeAssen());
  });
});

describe('berekenAxes, nominale as', () => {
  it('telt shoe_type per waarde, met het vaste contract uit AS_CONTRASTEN', () => {
    const s = [
      paar('s1', 'shoe_type', 'sneaker', 'net', ['23', '24']),
      paar('s2', 'shoe_type', 'sneaker', 'net', ['25', '26']),
      paar('s3', 'shoe_type', 'sneaker', 'net', ['27', '28']),
    ];
    const uit = berekenAxes(
      [keuze('s1', 'b', 'shoe_type'), keuze('s2', 'b', 'shoe_type'), keuze('s3', 'a', 'shoe_type')],
      s
    );
    expect(uit.shoe_type.value).toBe('net');
    expect(uit.shoe_type.confidence).toBeCloseTo(1 / 3, 6);
  });
});

describe('bouwTasteProfile', () => {
  const paren = [
    paar('p1', 'silhouette', 'slim', 'oversized', ['1', '2']),
    paar('p2', 'pattern', 'effen', 'statement', ['3', '4']),
  ];
  const invoer = {
    session_id: 'sessie-1',
    user_id: null,
    gender: 'female' as const,
    occasions: ['work' as const, 'date' as const],
    budget_min: 50,
    budget_max: 100,
    nogo_product_ids: ['nogo-1'],
    choices: [keuze('p1', 'a', 'silhouette'), keuze('p2', 'b', 'pattern')],
    paren,
  };

  it('zet gekozen items in liked en afgewezen items plus no-go in disliked', () => {
    const p = bouwTasteProfile(invoer);
    expect(p.liked_product_ids).toEqual(['1t', '1b', '1f', '4t', '4b', '4f']);
    expect(p.disliked_product_ids).toEqual(['2t', '2b', '2f', '3t', '3b', '3f', 'nogo-1']);
    expect(p.nogo_product_ids).toEqual(['nogo-1']);
  });

  it('neemt de harde feiten en de berekende assen over', () => {
    const p = bouwTasteProfile(invoer);
    expect(p.gender).toBe('female');
    expect(p.occasions).toEqual(['work', 'date']);
    expect(p.budget_min).toBe(50);
    expect(p.budget_max).toBe(100);
    expect(p.session_id).toBe('sessie-1');
    expect(p.user_id).toBeNull();
    expect(p.axes.silhouette).toEqual({ value: 'slim', confidence: 1 });
    expect(p.axes.pattern).toEqual({ value: 'statement', confidence: 1 });
  });

  it('ontdubbelt ids die in twee paren voorkomen', () => {
    const dubbel = { ...invoer, choices: [keuze('p1', 'a', 'silhouette'), keuze('p1', 'a', 'silhouette')] };
    expect(bouwTasteProfile(dubbel).liked_product_ids).toEqual(['1t', '1b', '1f']);
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/keten/__tests__/profiel.test.ts
```

Verwacht: `Failed to resolve import "../profiel"`.

- [ ] **Stap 3: Schrijf de paar-types**

Maak `supabase/functions/_shared/paar-types.ts`:

```typescript
/**
 * Types en constanten voor de dit-of-dat-paren (spec 7.2).
 *
 * Staat naast keten-types.ts in supabase/functions/_shared omdat zowel de edge
 * function (taak 7), het script (taak 8) als de browser (taak 5 en 10) dezelfde
 * vorm nodig hebben. Geen imports buiten keten-types.ts, geen Deno- of
 * browser-globals. src/keten/types.ts exporteert dit bestand opnieuw.
 */
import type { AsNaam, Categorie, Gelegenheid, Geslacht } from './keten-types.ts';

export type Prijsband = 'tot50' | '50tot100' | '100tot200' | 'boven200';

export const PRIJSBANDEN: readonly Prijsband[] = ['tot50', '50tot100', '100tot200', 'boven200'];

/**
 * Grenzen per band, in euro per stuk. anker is het richtbedrag uit spec 6 stap 3
 * (rond 30, 80 en 180); de budgetstap zoekt het echte product dat daar het
 * dichtst bij zit.
 */
export const BAND_GRENZEN: Record<Prijsband, { min: number; max: number; anker: number }> = {
  tot50: { min: 0, max: 50, anker: 30 },
  '50tot100': { min: 50, max: 100, anker: 80 },
  '100tot200': { min: 100, max: 200, anker: 180 },
  boven200: { min: 200, max: 2000, anker: 400 },
};

export type PaarKantNaam = 'a' | 'b';

export const PAAR_KANTEN: readonly PaarKantNaam[] = ['a', 'b'];

/** Een item in een paar. De naam, het merk, de prijs en de foto worden vastgelegd (spec 7.2) zodat het scherm geen tweede query nodig heeft. */
export interface PaarItem {
  product_id: string;
  role: Categorie;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
}

export interface PaarKant {
  kant: PaarKantNaam;
  /** De waarde van de as die deze kant vertegenwoordigt, bijvoorbeeld 'slim' of '4'. */
  waarde: string;
  items: PaarItem[];
}

export interface PaarSegment {
  gender: Geslacht;
  occasion: Gelegenheid;
  price_band: Prijsband;
}

export interface PairSet {
  /** 32 hex-tekens, deterministisch uit segment, as en gesorteerde product-ids (taak 7). */
  pair_id: string;
  segment_key: string;
  gender: Geslacht;
  occasion: Gelegenheid;
  price_band: Prijsband;
  axis: AsNaam;
  /** Altijd twee, in de volgorde a, b. */
  kanten: PaarKant[];
}

/** De sleutel waarmee segmenten in pair_sets en in de dekkingsmatrix geteld worden. */
export function segmentKey(s: PaarSegment): string {
  return `${s.gender}|${s.occasion}|${s.price_band}`;
}

/**
 * De soort van elke as (besluit 6 in "Wat de spec openlaat").
 *
 * Ordinaal betekent dat AS_WAARDEN een schaal is en dat een keuze een richting
 * heeft. Nominaal betekent dat de waarden naast elkaar staan; berekenAxes telt
 * daar per waarde, en AS_CONTRASTEN (taak 8) mag voor zo'n as maar een contrast
 * bevatten.
 */
export type AsSoort = 'ordinaal' | 'nominaal';

export const AS_SOORT: Record<AsNaam, AsSoort> = {
  formality: 'ordinaal',
  silhouette: 'ordinaal',
  color_temp: 'ordinaal',
  lightness: 'ordinaal',
  pattern: 'ordinaal',
  shoe_type: 'nominaal',
};

/**
 * De toegestane waarden per as, in vaste volgorde.
 *
 * Bij een ordinale as is dit de schaal, van laag naar hoog: berekenAxes leest
 * de positie in deze lijst als de plek op die schaal. Bij een nominale as is
 * het alleen de lijst met toegestane waarden, en is de volgorde de tiebreaker.
 * In beide gevallen mag de volgorde niet veranderen zonder dat oude profielen
 * een andere value krijgen. formality staat hier als tekst omdat
 * product_attributes.formality een smallint is die overal als string vergeleken
 * wordt; berekenAxes zet hem terug naar een getal.
 */
export const AS_WAARDEN: Record<AsNaam, readonly string[]> = {
  formality: ['1', '2', '3', '4', '5'],
  silhouette: ['slim', 'regular', 'relaxed', 'oversized'],
  color_temp: ['koel', 'neutraal', 'warm'],
  lightness: ['licht', 'medium', 'donker'],
  pattern: ['effen', 'subtiel', 'statement'],
  shoe_type: ['sneaker', 'net', 'laars', 'sandaal'],
};
```

Breid `src/keten/types.ts` uit. Controleer eerst dat het anker precies een keer voorkomt:

```bash
grep -c "export \* from '../../supabase/functions/_shared/keten-types';" src/keten/types.ts
```

Verwacht: `1`. Voeg daarna direct onder die regel toe:

```typescript
export * from '../../supabase/functions/_shared/paar-types';
```

- [ ] **Stap 4: Schrijf de profielberekening**

Maak `src/keten/profiel.ts`:

```typescript
/**
 * Van keuzes naar een taste_profiles-rij (spec 5.2).
 *
 * Puur en synchroon op profileHash na, zodat vitest alles in node kan draaien.
 * De hash zelf komt uit plan 3 (src/keten/profileHash.ts) en wordt hier
 * opnieuw geexporteerd, zodat de onboarding maar een module hoeft te kennen.
 */
import {
  AS_NAMEN,
  AS_SOORT,
  AS_WAARDEN,
  legeAssen,
  type AsNaam,
  type Assen,
  type Keuze,
  type PaarKantNaam,
  type PairSet,
  type TasteProfileInput,
} from './types';

export { normaliseerProfiel, profileHash } from './profileHash';

/** Het id van een kant van een paar: de sleutel die in Keuze.chosen_set_id staat. */
export function setId(pairId: string, kant: PaarKantNaam): string {
  return `${pairId}:${kant}`;
}

export function kantVanSet(setId: string): PaarKantNaam | null {
  const staart = setId.slice(setId.lastIndexOf(':') + 1);
  if (!setId.includes(':')) return null;
  return staart === 'a' || staart === 'b' ? staart : null;
}

function waardeVan(paar: PairSet, kant: PaarKantNaam): string | null {
  return paar.kanten.find((k) => k.kant === kant)?.waarde ?? null;
}

/**
 * Assen uit de keuzes (spec 5.2, besluit 6 in "Wat de spec openlaat").
 *
 * Meetellen doen alleen paren waarin de twee kanten echt van elkaar
 * verschilden. Daarna hangt het van de soort van de as af:
 *
 * Ordinaal (formality, silhouette, color_temp, lightness, pattern): AS_WAARDEN
 * is de schaal van laag naar hoog. Elke keuze is een richting: +1 als de
 * gekozen kant hoger staat dan de afgewezen kant, -1 als hij lager staat.
 * confidence is |som van de richtingen| / aantal keuzes op die as; value is de
 * schaalwaarde bij het gemiddelde van de gekozen posities. Dat moet, omdat
 * taak 8 een as met wisselende contrasten meet: wie eerst 4 boven 2 en daarna
 * 5 boven 3 kiest, doet twee keer hetzelfde, en tellen per losse waarde zou
 * daar zekerheid 0 van maken.
 *
 * Nominaal (shoe_type): geen richting, dus tellen per waarde zoals de spec het
 * opschrijft. value is de waarde met de meeste stemmen, confidence is
 * (meeste - op een na meeste) / aantal. Dat klopt alleen omdat AS_CONTRASTEN
 * voor een nominale as precies een contrast heeft.
 *
 * Deterministisch: Math.round rondt een half naar boven, en gelijkspel bij een
 * nominale as gaat naar de eerste waarde in AS_WAARDEN.
 */
export function berekenAxes(choices: Keuze[], paren: PairSet[]): Assen {
  const perId = new Map<string, PairSet>();
  for (const p of paren) perId.set(p.pair_id, p);

  // Ordinaal: richtingen en de schaalposities van de gekozen kanten.
  const richtingen = new Map<AsNaam, number[]>();
  const posities = new Map<AsNaam, number[]>();
  // Nominaal: stemmen per waarde.
  const stemmen = new Map<AsNaam, Map<string, number>>();
  const aantalPerAs = new Map<AsNaam, number>();

  for (const keuze of choices) {
    const paar = perId.get(keuze.pair_id);
    if (!paar) continue;
    const gekozenKant = kantVanSet(keuze.chosen_set_id);
    const afgewezenKant = kantVanSet(keuze.rejected_set_id);
    if (!gekozenKant || !afgewezenKant) continue;
    const gekozen = waardeVan(paar, gekozenKant);
    const afgewezen = waardeVan(paar, afgewezenKant);
    if (gekozen === null || afgewezen === null || gekozen === afgewezen) continue;

    const as = paar.axis;
    const schaal = AS_WAARDEN[as];
    const iGekozen = schaal.indexOf(gekozen);
    const iAfgewezen = schaal.indexOf(afgewezen);
    // Een waarde die niet in AS_WAARDEN staat is een fout in pair_sets. Die ene
    // keuze telt niet mee, in plaats van het hele profiel te vervuilen.
    if (iGekozen < 0 || iAfgewezen < 0) continue;

    if (AS_SOORT[as] === 'ordinaal') {
      const r = richtingen.get(as) ?? [];
      r.push(iGekozen > iAfgewezen ? 1 : -1);
      richtingen.set(as, r);
      const p = posities.get(as) ?? [];
      p.push(iGekozen);
      posities.set(as, p);
    } else {
      const tellers = stemmen.get(as) ?? new Map<string, number>();
      tellers.set(gekozen, (tellers.get(gekozen) ?? 0) + 1);
      if (!tellers.has(afgewezen)) tellers.set(afgewezen, 0);
      stemmen.set(as, tellers);
    }
    aantalPerAs.set(as, (aantalPerAs.get(as) ?? 0) + 1);
  }

  const uit = legeAssen();
  for (const as of AS_NAMEN) {
    const aantal = aantalPerAs.get(as) ?? 0;
    if (aantal === 0) continue;
    const schaal = AS_WAARDEN[as];

    if (AS_SOORT[as] === 'ordinaal') {
      const r = richtingen.get(as) ?? [];
      const p = posities.get(as) ?? [];
      if (p.length === 0) continue;
      const som = r.reduce((a, b) => a + b, 0);
      const gemiddelde = p.reduce((a, b) => a + b, 0) / p.length;
      const index = Math.min(schaal.length - 1, Math.max(0, Math.round(gemiddelde)));
      const waarde = schaal[index];
      uit[as] = {
        value: as === 'formality' ? Number(waarde) : waarde,
        confidence: Math.min(1, Math.abs(som) / aantal),
      };
      continue;
    }

    const tellers = stemmen.get(as);
    if (!tellers) continue;
    const gesorteerd = [...tellers.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return schaal.indexOf(a[0]) - schaal.indexOf(b[0]);
    });
    const [waarde, meeste] = gesorteerd[0];
    const opEenNa = gesorteerd[1]?.[1] ?? 0;
    uit[as] = {
      value: waarde,
      confidence: Math.min(1, Math.max(0, (meeste - opEenNa) / aantal)),
    };
  }
  return uit;
}

export interface ProfielInvoer {
  session_id: string;
  user_id: string | null;
  gender: TasteProfileInput['gender'];
  occasions: TasteProfileInput['occasions'];
  budget_min: number;
  budget_max: number;
  nogo_product_ids: string[];
  choices: Keuze[];
  paren: PairSet[];
}

function itemIds(paar: PairSet | undefined, kant: PaarKantNaam | null): string[] {
  if (!paar || !kant) return [];
  return paar.kanten.find((k) => k.kant === kant)?.items.map((i) => i.product_id) ?? [];
}

function ontdubbel(ids: string[]): string[] {
  const gezien = new Set<string>();
  const uit: string[] = [];
  for (const id of ids) {
    if (gezien.has(id)) continue;
    gezien.add(id);
    uit.push(id);
  }
  return uit;
}

/**
 * De volledige taste_profiles-invoer. liked zijn alle items uit gekozen
 * outfits, disliked alle items uit afgewezen outfits plus de no-go's
 * (spec 5.2). De volgorde is die van de keuzes, zodat het resultaat
 * deterministisch is; normaliseerProfiel sorteert later toch.
 */
export function bouwTasteProfile(invoer: ProfielInvoer): TasteProfileInput {
  const perId = new Map<string, PairSet>();
  for (const p of invoer.paren) perId.set(p.pair_id, p);

  const liked: string[] = [];
  const disliked: string[] = [];
  for (const keuze of invoer.choices) {
    const paar = perId.get(keuze.pair_id);
    liked.push(...itemIds(paar, kantVanSet(keuze.chosen_set_id)));
    disliked.push(...itemIds(paar, kantVanSet(keuze.rejected_set_id)));
  }

  return {
    user_id: invoer.user_id,
    session_id: invoer.session_id,
    gender: invoer.gender,
    occasions: invoer.occasions,
    budget_min: invoer.budget_min,
    budget_max: invoer.budget_max,
    nogo_product_ids: ontdubbel(invoer.nogo_product_ids),
    choices: invoer.choices,
    axes: berekenAxes(invoer.choices, invoer.paren),
    liked_product_ids: ontdubbel(liked),
    disliked_product_ids: ontdubbel([...disliked, ...invoer.nogo_product_ids]),
  };
}
```

- [ ] **Stap 5: Draai de test en zie hem slagen**

```bash
npx vitest run src/keten/__tests__/profiel.test.ts
```

Verwacht: 14 tests geslaagd.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add supabase/functions/_shared/paar-types.ts src/keten/types.ts src/keten/profiel.ts src/keten/__tests__/profiel.test.ts
git commit -m "feat(keten): types voor dit-of-dat-paren en de profielberekening

berekenAxes leest een ordinale as als een schaal en telt richtingen, zodat
twee keuzes met verschillende contrasten in dezelfde richting ook echt als
consistent tellen. shoe_type is nominaal en blijft tellen per waarde.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 3: Adaptieve paarselectie

**Bestanden:**
- Aanmaken: `src/keten/paarSelectie.ts`
- Test: `src/keten/__tests__/paarSelectie.test.ts`

**Interfaces:**
- Gebruikt: `AS_NAMEN`, `Assen`, `AsNaam`, `legeAssen()` uit `@/keten/types` (plan 3 taak 2); `PairSet` uit `paar-types.ts` (taak 2).
- Levert:
  ```typescript
  const MIN_PAREN = 6
  const MAX_PAREN = 12
  const DREMPEL = 0.5
  function onzekersteAs(axes: Assen, beschikbaar: AsNaam[]): AsNaam | null
  function volgendPaar(paren: PairSet[], gebruikt: string[], axes: Assen): PairSet | null
  function klaar(aantal: number, axes: Assen, volgende: PairSet | null): boolean
  ```

Spec 6 stap 5: minimaal 6 en maximaal 12 paren; na elke keuze herberekening van `axes`; het volgende paar komt uit de as met de laagste confidence; stoppen zodra elke as `confidence >= 0.5` heeft of bij 12.

Waarom `klaar` een derde parameter heeft: een as waarvoor geen enkel paar in `pair_sets` staat kan nooit `confidence >= 0.5` halen. Met alleen `aantal` en `axes` zou de bezoeker dan tot 12 paren doorklikken en daarna vastlopen zonder nieuw paar. Daarom telt "er is geen volgend paar meer" ook als klaar. De enige aanroeper van `volgendPaar` en `klaar` is de reducer uit taak 9; die geeft de uitkomst van `volgendPaar` meteen door aan `klaar` en bewaart beide in zijn state. Onder `MIN_PAREN` stopt hij alsnog niet op `volgende === null`, want dan is er te weinig gemeten; `StartPage` meldt dat als een gat in het aanbod. De sessietest in taak 9 dekt alle drie de uitgangen.

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/keten/__tests__/paarSelectie.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { DREMPEL, MAX_PAREN, MIN_PAREN, klaar, onzekersteAs, volgendPaar } from '../paarSelectie';
import { legeAssen, type AsNaam, type Assen, type PairSet } from '../types';

function paar(pair_id: string, axis: AsNaam): PairSet {
  return {
    pair_id,
    segment_key: 'male|work|50tot100',
    gender: 'male',
    occasion: 'work',
    price_band: '50tot100',
    axis,
    kanten: [
      { kant: 'a', waarde: 'x', items: [] },
      { kant: 'b', waarde: 'y', items: [] },
    ],
  };
}

function assen(vast: Partial<Record<AsNaam, number>>): Assen {
  const uit = legeAssen();
  for (const [as, confidence] of Object.entries(vast)) {
    uit[as as AsNaam] = { value: 'x', confidence: confidence as number };
  }
  return uit;
}

const allesZeker = assen({
  formality: 1,
  silhouette: 1,
  color_temp: 1,
  lightness: 1,
  pattern: 1,
  shoe_type: 1,
});

describe('constanten', () => {
  it('volgen spec 6 stap 5', () => {
    expect(MIN_PAREN).toBe(6);
    expect(MAX_PAREN).toBe(12);
    expect(DREMPEL).toBe(0.5);
  });
});

describe('onzekersteAs', () => {
  it('kiest de as met de laagste zekerheid', () => {
    const axes = assen({ formality: 0.8, silhouette: 0.2, pattern: 0.5 });
    expect(onzekersteAs(axes, ['formality', 'silhouette', 'pattern'])).toBe('silhouette');
  });

  it('breekt gelijkspel met de volgorde uit AS_NAMEN', () => {
    expect(onzekersteAs(legeAssen(), ['pattern', 'formality', 'lightness'])).toBe('formality');
  });

  it('is null als er niets beschikbaar is', () => {
    expect(onzekersteAs(legeAssen(), [])).toBeNull();
  });

  it('kijkt alleen naar beschikbare assen', () => {
    const axes = assen({ formality: 0, silhouette: 0.9 });
    expect(onzekersteAs(axes, ['silhouette'])).toBe('silhouette');
  });
});

describe('volgendPaar', () => {
  const paren = [
    paar('b-form', 'formality'),
    paar('a-form', 'formality'),
    paar('a-sil', 'silhouette'),
    paar('a-pat', 'pattern'),
  ];

  it('kiest een paar uit de onzekerste as met beschikbare paren', () => {
    const axes = assen({ formality: 0.9, silhouette: 0.1, pattern: 0.6 });
    expect(volgendPaar(paren, [], axes)?.pair_id).toBe('a-sil');
  });

  it('kiest binnen een as het eerste ongebruikte paar op pair_id', () => {
    expect(volgendPaar(paren, [], assen({ silhouette: 1, pattern: 1 }))?.pair_id).toBe('a-form');
    expect(volgendPaar(paren, ['a-form'], assen({ silhouette: 1, pattern: 1 }))?.pair_id).toBe('b-form');
  });

  it('slaat een as over waarvoor alle paren gebruikt zijn', () => {
    const axes = assen({ formality: 0.9, silhouette: 0, pattern: 0.6 });
    expect(volgendPaar(paren, ['a-sil'], axes)?.pair_id).toBe('a-pat');
  });

  it('is null als alles gebruikt is', () => {
    expect(volgendPaar(paren, ['a-form', 'b-form', 'a-sil', 'a-pat'], legeAssen())).toBeNull();
    expect(volgendPaar([], [], legeAssen())).toBeNull();
  });
});

describe('klaar', () => {
  const volgende = paar('nog-een', 'formality');

  it('is niet klaar onder het minimum', () => {
    expect(klaar(5, allesZeker, volgende)).toBe(false);
    expect(klaar(5, allesZeker, null)).toBe(false);
  });

  it('is klaar bij het minimum als elke as boven de drempel zit', () => {
    expect(klaar(6, allesZeker, volgende)).toBe(true);
  });

  it('is niet klaar bij het minimum als een as onder de drempel zit', () => {
    expect(klaar(6, { ...allesZeker, pattern: { value: 'x', confidence: 0.4 } }, volgende)).toBe(false);
  });

  it('telt de drempel zelf mee', () => {
    expect(klaar(6, { ...allesZeker, pattern: { value: 'x', confidence: 0.5 } }, volgende)).toBe(true);
  });

  it('is klaar bij het maximum, ook met onzekere assen', () => {
    expect(klaar(12, legeAssen(), volgende)).toBe(true);
  });

  it('is klaar als er geen paar meer is en het minimum gehaald is', () => {
    expect(klaar(7, legeAssen(), null)).toBe(true);
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/keten/__tests__/paarSelectie.test.ts
```

Verwacht: `Failed to resolve import "../paarSelectie"`.

- [ ] **Stap 3: Schrijf de paarselectie**

Maak `src/keten/paarSelectie.ts`:

```typescript
/**
 * Adaptieve paarselectie voor het dit-of-dat-scherm (spec 6 stap 5 en 7.3).
 *
 * Puur en synchroon: de reducer (taak 9) en het harnas (taak 14) gebruiken
 * dezelfde functies, en vitest test ze zonder database.
 */
import { AS_NAMEN, type AsNaam, type Assen, type PairSet } from './types';

/** Spec 6 stap 5: minimaal zes, maximaal twaalf, stoppen bij zekerheid 0.5 op elke as. */
export const MIN_PAREN = 6;
export const MAX_PAREN = 12;
export const DREMPEL = 0.5;

/** De as met de laagste zekerheid. Gelijkspel gaat naar de eerste in AS_NAMEN, zodat de volgorde vast ligt. */
export function onzekersteAs(axes: Assen, beschikbaar: AsNaam[]): AsNaam | null {
  let beste: AsNaam | null = null;
  let laagste = Number.POSITIVE_INFINITY;
  for (const as of AS_NAMEN) {
    if (!beschikbaar.includes(as)) continue;
    const confidence = axes[as]?.confidence ?? 0;
    if (confidence < laagste) {
      laagste = confidence;
      beste = as;
    }
  }
  return beste;
}

/**
 * Het volgende paar: uit de onzekerste as waarvoor nog een ongebruikt paar
 * bestaat, en binnen die as het eerste op pair_id. Twee bezoekers met dezelfde
 * antwoorden krijgen daardoor dezelfde paren in dezelfde volgorde.
 */
export function volgendPaar(paren: PairSet[], gebruikt: string[], axes: Assen): PairSet | null {
  const gebruiktSet = new Set(gebruikt);
  const over = paren.filter((p) => !gebruiktSet.has(p.pair_id));
  if (over.length === 0) return null;

  const beschikbaar = AS_NAMEN.filter((as) => over.some((p) => p.axis === as));
  const as = onzekersteAs(axes, [...beschikbaar]);
  if (!as) return null;

  return over
    .filter((p) => p.axis === as)
    .sort((a, b) => (a.pair_id < b.pair_id ? -1 : a.pair_id > b.pair_id ? 1 : 0))[0] ?? null;
}

/**
 * Stoppen? Nooit onder MIN_PAREN. Daarboven: bij MAX_PAREN, als elke as de
 * drempel haalt, of als er geen paar meer over is. Dat laatste is nodig omdat
 * een as zonder paren in pair_sets anders eeuwig onzeker blijft.
 */
export function klaar(aantal: number, axes: Assen, volgende: PairSet | null): boolean {
  if (aantal < MIN_PAREN) return false;
  if (aantal >= MAX_PAREN) return true;
  if (volgende === null) return true;
  return AS_NAMEN.every((as) => (axes[as]?.confidence ?? 0) >= DREMPEL);
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

```bash
npx vitest run src/keten/__tests__/paarSelectie.test.ts
```

Verwacht: 14 tests geslaagd.

- [ ] **Stap 5: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/keten/paarSelectie.ts src/keten/__tests__/paarSelectie.test.ts
git commit -m "feat(keten): adaptieve paarselectie met minimaal zes en maximaal twaalf paren

Het volgende paar komt uit de as met de laagste zekerheid. Stoppen bij
twaalf paren, bij zekerheid 0.5 op elke as, of als er geen paar meer is.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 4: De vlag `keten_v2` lezen

**Bestanden:**
- Aanmaken: `src/keten/remoteVlag.ts`
- Aanmaken: `src/hooks/useRemoteFlag.ts`
- Test: `src/keten/__tests__/remoteVlag.test.ts`

**Interfaces:**
- Gebruikt: `fnv1a32(input: string): number` uit `@/utils/hash` (plan 1 taak 5 / plan 3 taak 2); `supabase()` uit `@/lib/supabaseClient`; `getSessionId()` uit `@/utils/sessionId`; tabel `remote_flags` met de leespolicy `Public read flags` (gemeten op 2026-09-16: `select`, rol PUBLIC, dus anon mag lezen).
- Levert:
  ```typescript
  interface VlagRij { enabled: boolean | null; percentage: number | null }
  const VLAG_CACHE_SLEUTEL = 'ff_remote_flags'
  const VLAG_CACHE_MS = 600_000
  function bucket(sessionId: string): number          // 0 tot en met 99
  function beslisFlag(rij: VlagRij | null, sessionId: string): boolean
  function leesVlagCache(naam: string, nu?: number, opslag?: Pick<Storage, 'getItem' | 'setItem'> | null): VlagRij | null
  function bewaarVlagCache(naam: string, rij: VlagRij, nu?: number, opslag?: Pick<Storage, 'getItem' | 'setItem'> | null): void
  function useRemoteFlag(naam: string): { aan: boolean; geladen: boolean }
  ```

Waarom een cache in localStorage: `KetenSwitch` (taak 13) staat op `/onboarding` en `/results`. Zonder cache ziet elke bezoeker bij elk bezoek eerst een laadscherm terwijl de vlag opgehaald wordt. De hook leest de cache in de `useState`-initializer, dus de eerste render klopt al en de test kan hem zonder jsdom controleren.

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/keten/__tests__/remoteVlag.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  VLAG_CACHE_MS,
  VLAG_CACHE_SLEUTEL,
  beslisFlag,
  bewaarVlagCache,
  bucket,
  leesVlagCache,
} from '../remoteVlag';

function nepOpslag(begin: Record<string, string> = {}) {
  const data = { ...begin };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const SESSIE = '7f3a1c22-0000-4000-8000-000000000001';

describe('bucket', () => {
  it('geeft altijd 0 tot en met 99', () => {
    for (const s of ['', 'a', SESSIE, 'zzzzzzzz']) {
      const b = bucket(s);
      expect(Number.isInteger(b)).toBe(true);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(100);
    }
  });

  it('is vast voor dezelfde sessie en verschilt tussen sessies', () => {
    expect(bucket(SESSIE)).toBe(bucket(SESSIE));
    expect(bucket('een-andere-sessie')).not.toBe(bucket('nog-een-andere-sessie'));
  });
});

describe('beslisFlag', () => {
  it('is uit zonder rij en bij enabled false', () => {
    expect(beslisFlag(null, SESSIE)).toBe(false);
    expect(beslisFlag({ enabled: false, percentage: 100 }, SESSIE)).toBe(false);
    expect(beslisFlag({ enabled: null, percentage: 100 }, SESSIE)).toBe(false);
  });

  it('is uit bij percentage 0 en aan bij 100', () => {
    expect(beslisFlag({ enabled: true, percentage: 0 }, SESSIE)).toBe(false);
    expect(beslisFlag({ enabled: true, percentage: null }, SESSIE)).toBe(false);
    expect(beslisFlag({ enabled: true, percentage: 100 }, SESSIE)).toBe(true);
    expect(beslisFlag({ enabled: true, percentage: 250 }, SESSIE)).toBe(true);
  });

  it('gebruikt de bucket tussen 1 en 99 en is stabiel per sessie', () => {
    const b = bucket(SESSIE);
    expect(beslisFlag({ enabled: true, percentage: b + 1 }, SESSIE)).toBe(true);
    expect(beslisFlag({ enabled: true, percentage: b }, SESSIE)).toBe(false);
  });
});

describe('leesVlagCache en bewaarVlagCache', () => {
  it('leest terug wat bewaard is, per vlagnaam', () => {
    const opslag = nepOpslag();
    bewaarVlagCache('keten_v2', { enabled: true, percentage: 10 }, 1000, opslag);
    bewaarVlagCache('style_tribes', { enabled: true, percentage: 100 }, 1000, opslag);
    expect(leesVlagCache('keten_v2', 1000, opslag)).toEqual({ enabled: true, percentage: 10 });
    expect(leesVlagCache('style_tribes', 1000, opslag)).toEqual({ enabled: true, percentage: 100 });
    expect(leesVlagCache('bestaat-niet', 1000, opslag)).toBeNull();
    expect(Object.keys(JSON.parse(opslag.data[VLAG_CACHE_SLEUTEL]))).toEqual(['keten_v2', 'style_tribes']);
  });

  it('vergeet een rij die te oud is', () => {
    const opslag = nepOpslag();
    bewaarVlagCache('keten_v2', { enabled: true, percentage: 100 }, 1000, opslag);
    expect(leesVlagCache('keten_v2', 1000 + VLAG_CACHE_MS - 1, opslag)).not.toBeNull();
    expect(leesVlagCache('keten_v2', 1000 + VLAG_CACHE_MS + 1, opslag)).toBeNull();
  });

  it('overleeft kapotte json en een ontbrekende opslag', () => {
    expect(leesVlagCache('keten_v2', 0, nepOpslag({ [VLAG_CACHE_SLEUTEL]: '{geen json' }))).toBeNull();
    expect(leesVlagCache('keten_v2', 0, null)).toBeNull();
    expect(() => bewaarVlagCache('keten_v2', { enabled: true, percentage: 1 }, 0, null)).not.toThrow();
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/keten/__tests__/remoteVlag.test.ts
```

Verwacht: `Failed to resolve import "../remoteVlag"`.

- [ ] **Stap 3: Schrijf de pure vlagmodule**

Maak `src/keten/remoteVlag.ts`:

```typescript
/**
 * De vlag keten_v2 uit remote_flags, als pure beslissing plus cache.
 *
 * remote_flags heeft sinds 2025 een leespolicy voor PUBLIC ("Public read
 * flags"), dus een anonieme bezoeker mag de rij ophalen. enabled is de harde
 * schakelaar, percentage verdeelt het verkeer: de bucket komt uit het
 * sessie-id, zodat dezelfde bezoeker altijd dezelfde kant op gaat.
 */
import { fnv1a32 } from '@/utils/hash';

export interface VlagRij {
  enabled: boolean | null;
  percentage: number | null;
}

export type VlagOpslag = Pick<Storage, 'getItem' | 'setItem'>;

export const VLAG_CACHE_SLEUTEL = 'ff_remote_flags';
/** Tien minuten. Lang genoeg om laadschermen te vermijden, kort genoeg om een wijziging dezelfde sessie te zien. */
export const VLAG_CACHE_MS = 600_000;

interface CacheRij extends VlagRij {
  tijd: number;
}

function standaardOpslag(): VlagOpslag | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Vaste bucket 0 tot en met 99 uit het sessie-id. */
export function bucket(sessionId: string): number {
  return fnv1a32(sessionId) % 100;
}

export function beslisFlag(rij: VlagRij | null, sessionId: string): boolean {
  if (!rij || rij.enabled !== true) return false;
  const percentage = typeof rij.percentage === 'number' ? rij.percentage : 0;
  if (percentage <= 0) return false;
  if (percentage >= 100) return true;
  return bucket(sessionId) < percentage;
}

function leesAlles(opslag: VlagOpslag | null): Record<string, CacheRij> {
  if (!opslag) return {};
  try {
    const ruw = opslag.getItem(VLAG_CACHE_SLEUTEL);
    if (!ruw) return {};
    const data = JSON.parse(ruw);
    return data && typeof data === 'object' ? (data as Record<string, CacheRij>) : {};
  } catch {
    return {};
  }
}

export function leesVlagCache(
  naam: string,
  nu: number = Date.now(),
  opslag: VlagOpslag | null = standaardOpslag()
): VlagRij | null {
  const rij = leesAlles(opslag)[naam];
  if (!rij || typeof rij.tijd !== 'number') return null;
  if (nu - rij.tijd > VLAG_CACHE_MS) return null;
  return { enabled: rij.enabled ?? null, percentage: rij.percentage ?? null };
}

export function bewaarVlagCache(
  naam: string,
  rij: VlagRij,
  nu: number = Date.now(),
  opslag: VlagOpslag | null = standaardOpslag()
): void {
  if (!opslag) return;
  try {
    const alles = leesAlles(opslag);
    alles[naam] = { enabled: rij.enabled, percentage: rij.percentage, tijd: nu };
    opslag.setItem(VLAG_CACHE_SLEUTEL, JSON.stringify(alles));
  } catch {
    // Private modus of volle opslag: de hook haalt de vlag dan elke keer op.
  }
}
```

- [ ] **Stap 4: Schrijf de hook**

Maak `src/hooks/useRemoteFlag.ts`:

```typescript
/**
 * Leest een rij uit remote_flags en beslist of de vlag voor deze bezoeker
 * aan staat.
 *
 * De cache wordt in de useState-initializer gelezen, niet in een useEffect.
 * Zo klopt de eerste render al voor iemand die de pagina eerder bezocht, en
 * hoeft KetenSwitch (taak 13) geen laadscherm te tonen dat een halve seconde
 * het verkeerde scherm vervangt.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getSessionId } from '@/utils/sessionId';
import { beslisFlag, bewaarVlagCache, leesVlagCache, type VlagRij } from '@/keten/remoteVlag';

export interface VlagStand {
  aan: boolean;
  geladen: boolean;
}

export function useRemoteFlag(naam: string): VlagStand {
  const [stand, setStand] = useState<VlagStand>(() => {
    const uitCache = leesVlagCache(naam);
    if (!uitCache) return { aan: false, geladen: false };
    return { aan: beslisFlag(uitCache, getSessionId()), geladen: true };
  });

  useEffect(() => {
    let levend = true;
    const client = supabase();
    if (!client) {
      setStand({ aan: false, geladen: true });
      return () => {
        levend = false;
      };
    }

    client
      .from('remote_flags')
      .select('enabled, percentage')
      .eq('flag_name', naam)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!levend) return;
        if (error) {
          console.warn('[keten] vlag lezen mislukt:', error.message);
          setStand((vorig) => ({ aan: vorig.aan, geladen: true }));
          return;
        }
        const rij: VlagRij = { enabled: data?.enabled ?? null, percentage: data?.percentage ?? null };
        bewaarVlagCache(naam, rij);
        setStand({ aan: beslisFlag(rij, getSessionId()), geladen: true });
      });

    return () => {
      levend = false;
    };
  }, [naam]);

  return stand;
}
```

- [ ] **Stap 5: Draai de test en zie hem slagen**

```bash
npx vitest run src/keten/__tests__/remoteVlag.test.ts
```

Verwacht: 8 tests geslaagd.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/keten/remoteVlag.ts src/keten/__tests__/remoteVlag.test.ts src/hooks/useRemoteFlag.ts
git commit -m "feat(keten): vlag keten_v2 met percentage-bucket uit het sessie-id

enabled is de harde schakelaar, percentage verdeelt het verkeer. De bucket
komt uit fnv1a32 van het sessie-id, dus dezelfde bezoeker ziet altijd
hetzelfde. De hook cachet de rij tien minuten in localStorage.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 5: Kandidaten voor de startstappen, paren ophalen en het profiel opslaan

**Bestanden:**
- Aanmaken: `src/keten/kandidatenStart.ts`
- Aanmaken: `src/keten/tasteProfielOpslag.ts`
- Aanmaken: `src/keten/prijs.ts`
- Test: `src/keten/__tests__/kandidatenStart.test.ts`

**Interfaces:**
- Gebruikt: `KetenConfig { supabase: SupabaseClient; functionsUrl: string; anonKey: string }` uit `@/keten/composeClient` (plan 3 taak 7); RPC `get_kandidaten(p_gender, p_occasions, p_budget_min, p_budget_max, p_axes, p_liked_ids, p_disliked_ids, p_per_category)` (plan 1 taak 3, spec 5.3); `Kandidaat`, `Gelegenheid`, `Geslacht`, `TasteProfileInput`, `legeAssen()` uit `@/keten/types`; `BAND_GRENZEN`, `PRIJSBANDEN`, `PaarSegment`, `PairSet`, `Prijsband`, `segmentKey` uit taak 2; tabellen `taste_profiles` en `taste_profile_sizes` en de view `pair_sets_op_voorraad` uit taak 1.
- Levert in `kandidatenStart.ts`:
  ```typescript
  const BANDEN: readonly Prijsband[]                      // tot50, 50tot100, 100tot200
  const NOGO_AANTAL = 6
  const MIN_PAREN_PER_SEGMENT = 6
  function budgetVoorBand(band: Prijsband): { min: number; max: number; anker: number }
  function kiesAnker(kandidaten: Kandidaat[], band: Prijsband): Kandidaat | null
  function kiesNoGoItems(kandidaten: Kandidaat[], aantal?: number): Kandidaat[]
  function segmentenVoor(gender: Geslacht, occasions: Gelegenheid[], band: Prijsband): PaarSegment[]
  function heeftDekking(kandidaten: Kandidaat[]): boolean
  function haalStartKandidaten(cfg: KetenConfig, gender: Geslacht, occasions: Gelegenheid[], band: Prijsband): Promise<Kandidaat[]>
  function haalPairSets(cfg: KetenConfig, segmenten: PaarSegment[]): Promise<PairSet[]>
  function telPairSets(cfg: KetenConfig, segmenten: PaarSegment[]): Promise<Map<string, number>>
  ```
- Levert in `tasteProfielOpslag.ts`:
  ```typescript
  const LOKAAL_PROFIEL_SLEUTEL = 'ff_taste_profiel'
  interface LokaalProfiel { profiel: TasteProfileInput; profile_hash: string }
  function slaTasteProfielOp(cfg: KetenConfig, profileHash: string, profiel: TasteProfileInput): Promise<boolean>
  function slaMatenOp(cfg: KetenConfig, profileHash: string, sessionId: string, maten: Record<string, string>, userId?: string | null): Promise<boolean>
  function bewaarLokaalProfiel(profiel: TasteProfileInput, profileHash: string, opslag?: ...): void
  function leesLokaalProfiel(opslag?: ...): LokaalProfiel | null
  function wisLokaalProfiel(opslag?: ...): void
  ```
- Levert in `prijs.ts`: `formatPrijs(n: number): string`.

Waarom drie banden en niet vier: spec 6 stap 3 noemt drie ankers (rond 30, 80 en 180). `boven200` blijft in `PRIJSBANDEN` staan omdat `product_attributes.price_band` hem kent, maar de budgetstap toont hem niet.

Waarom `MIN_PAREN_PER_SEGMENT = 6`: een band is pas bruikbaar als er minstens zoveel paren zijn als `MIN_PAREN` uit taak 3. Anders kan de bezoeker het dit-of-dat-scherm niet afmaken. Besluit 1 in "Wat de spec openlaat": een band zonder ankerproduct of met te weinig paren staat uitgeschakeld.

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/keten/__tests__/kandidatenStart.test.ts`:

```typescript
import { describe, expect, it, vi } from 'vitest';
import {
  BANDEN,
  budgetVoorBand,
  haalPairSets,
  haalStartKandidaten,
  heeftDekking,
  kiesAnker,
  kiesNoGoItems,
  segmentenVoor,
  telPairSets,
} from '../kandidatenStart';
import { formatPrijs } from '../prijs';
import type { Categorie, Kandidaat, ProductAttrs, RuwProduct } from '../types';

function attrs(category: Categorie): ProductAttrs {
  return {
    is_fashion: true,
    category,
    gender: 'female',
    formality: 3,
    occasions: ['work'],
    silhouette: 'regular',
    color_temp: 'neutraal',
    lightness: 'medium',
    pattern: 'effen',
    shoe_type: category === 'footwear' ? 'net' : null,
    colors: ['zwart'],
    materials: ['katoen'],
    seasons: ['herfst'],
    price_band: '50tot100',
    confidence: 0.9,
    tagger_version: 'haiku-4.5-v1',
  };
}

function product(id: string, price: number): RuwProduct {
  return {
    id,
    name: `Product ${id}`,
    brand: 'Merk',
    price,
    image_url: `https://voorbeeld.test/${id}.jpg`,
    retailer: 'H&M',
    url: null,
    affiliate_url: null,
    product_url: null,
    gender: 'female',
    colors: ['zwart'],
    sizes: ['M'],
    in_stock: true,
    description: null,
  };
}

function kandidaat(id: string, category: Categorie, price: number, score = 0.5): Kandidaat {
  return { product_id: id, category, score, attrs: attrs(category), product: product(id, price) };
}

describe('banden en budget', () => {
  it('toont drie banden, niet boven200', () => {
    expect(BANDEN).toEqual(['tot50', '50tot100', '100tot200']);
  });

  it('geeft de grenzen en het anker per band', () => {
    expect(budgetVoorBand('tot50')).toEqual({ min: 0, max: 50, anker: 30 });
    expect(budgetVoorBand('50tot100')).toEqual({ min: 50, max: 100, anker: 80 });
    expect(budgetVoorBand('100tot200')).toEqual({ min: 100, max: 200, anker: 180 });
  });
});

describe('kiesAnker', () => {
  it('kiest het product dat het dichtst bij het ankerbedrag zit', () => {
    const lijst = [kandidaat('a', 'top', 42), kandidaat('b', 'top', 31), kandidaat('c', 'bottom', 12)];
    expect(kiesAnker(lijst, 'tot50')?.product_id).toBe('b');
  });

  it('breekt gelijkspel op product_id, zodat de kaart niet wisselt', () => {
    const lijst = [kandidaat('z', 'top', 35), kandidaat('a', 'top', 25)];
    expect(kiesAnker(lijst, 'tot50')?.product_id).toBe('a');
  });

  it('slaat producten zonder foto over en is null bij een lege lijst', () => {
    const zonderFoto = kandidaat('a', 'top', 30);
    zonderFoto.product.image_url = null;
    expect(kiesAnker([zonderFoto], 'tot50')).toBeNull();
    expect(kiesAnker([], 'tot50')).toBeNull();
  });
});

describe('kiesNoGoItems', () => {
  it('geeft zes items en spreidt ze over categorieen', () => {
    const lijst = [
      kandidaat('t1', 'top', 40, 0.9), kandidaat('t2', 'top', 40, 0.8), kandidaat('t3', 'top', 40, 0.7),
      kandidaat('b1', 'bottom', 40, 0.9), kandidaat('b2', 'bottom', 40, 0.8),
      kandidaat('f1', 'footwear', 40, 0.9), kandidaat('f2', 'footwear', 40, 0.8),
      kandidaat('o1', 'outerwear', 40, 0.9),
    ];
    const uit = kiesNoGoItems(lijst);
    expect(uit).toHaveLength(6);
    expect(uit.map((k) => k.product_id)).toEqual(['t1', 'b1', 'f1', 'o1', 't2', 'b2']);
  });

  it('geeft dezelfde uitkomst bij een andere invoervolgorde', () => {
    const lijst = [kandidaat('t1', 'top', 40, 0.9), kandidaat('b1', 'bottom', 40, 0.9)];
    const gedraaid = [...lijst].reverse();
    expect(kiesNoGoItems(lijst).map((k) => k.product_id)).toEqual(kiesNoGoItems(gedraaid).map((k) => k.product_id));
  });

  it('geeft minder dan zes als er minder is', () => {
    expect(kiesNoGoItems([kandidaat('t1', 'top', 40)])).toHaveLength(1);
  });
});

describe('segmentenVoor', () => {
  it('geeft een segment per gelegenheid', () => {
    expect(segmentenVoor('female', ['work', 'date'], '50tot100')).toEqual([
      { gender: 'female', occasion: 'work', price_band: '50tot100' },
      { gender: 'female', occasion: 'date', price_band: '50tot100' },
    ]);
  });
});

describe('heeftDekking', () => {
  it('vraagt top plus bottom plus footwear, of dress plus footwear', () => {
    expect(heeftDekking([kandidaat('t', 'top', 40), kandidaat('b', 'bottom', 40), kandidaat('f', 'footwear', 40)])).toBe(true);
    expect(heeftDekking([kandidaat('d', 'dress', 40), kandidaat('f', 'footwear', 40)])).toBe(true);
    expect(heeftDekking([kandidaat('t', 'top', 40), kandidaat('b', 'bottom', 40)])).toBe(false);
    expect(heeftDekking([])).toBe(false);
  });
});

describe('haalStartKandidaten', () => {
  it('roept get_kandidaten aan met lege assen en het budget van de band', async () => {
    const rpc = vi.fn(async () => ({ data: [kandidaat('t', 'top', 60)], error: null }));
    const cfg = { supabase: { rpc } as any, functionsUrl: 'x', anonKey: 'y' };
    const uit = await haalStartKandidaten(cfg, 'female', ['work'], '50tot100');
    expect(uit).toHaveLength(1);
    expect(rpc).toHaveBeenCalledWith('get_kandidaten', {
      p_gender: 'female',
      p_occasions: ['work'],
      p_budget_min: 50,
      p_budget_max: 100,
      p_axes: {
        formality: { value: null, confidence: 0 },
        silhouette: { value: null, confidence: 0 },
        color_temp: { value: null, confidence: 0 },
        lightness: { value: null, confidence: 0 },
        pattern: { value: null, confidence: 0 },
        shoe_type: { value: null, confidence: 0 },
      },
      p_liked_ids: [],
      p_disliked_ids: [],
      p_per_category: 12,
    });
  });

  it('gooit met de boodschap van de database', async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { message: 'kapot' } }));
    const cfg = { supabase: { rpc } as any, functionsUrl: 'x', anonKey: 'y' };
    await expect(haalStartKandidaten(cfg, 'male', ['work'], 'tot50')).rejects.toThrow('get_kandidaten: kapot');
  });
});

describe('haalPairSets en telPairSets', () => {
  function nepClient(rijen: Array<Record<string, unknown>>) {
    const inFn = vi.fn(async () => ({ data: rijen, error: null }));
    const select = vi.fn(() => ({ in: inFn }));
    const from = vi.fn(() => ({ select }));
    return { client: { from } as any, from, select, inFn };
  }

  const rij = {
    pair_id: 'p1',
    segment_key: 'female|work|50tot100',
    gender: 'female',
    occasion: 'work',
    price_band: '50tot100',
    axis: 'pattern',
    kanten: [
      { kant: 'a', waarde: 'effen', items: [] },
      { kant: 'b', waarde: 'statement', items: [] },
    ],
  };

  it('leest de view pair_sets_op_voorraad, niet pair_sets', async () => {
    const { client, from, inFn } = nepClient([rij]);
    const cfg = { supabase: client, functionsUrl: 'x', anonKey: 'y' };
    const uit = await haalPairSets(cfg, [{ gender: 'female', occasion: 'work', price_band: '50tot100' }]);
    expect(from).toHaveBeenCalledWith('pair_sets_op_voorraad');
    expect(inFn).toHaveBeenCalledWith('segment_key', ['female|work|50tot100']);
    expect(uit).toEqual([rij]);
  });

  it('telt per segment en geeft nul voor een segment zonder paren', async () => {
    const { client } = nepClient([rij, { ...rij, pair_id: 'p2' }]);
    const cfg = { supabase: client, functionsUrl: 'x', anonKey: 'y' };
    const telling = await telPairSets(cfg, [
      { gender: 'female', occasion: 'work', price_band: '50tot100' },
      { gender: 'female', occasion: 'date', price_band: '50tot100' },
    ]);
    expect(telling.get('female|work|50tot100')).toBe(2);
    expect(telling.get('female|date|50tot100')).toBe(0);
  });
});

describe('formatPrijs', () => {
  it('geeft euro met komma en twee decimalen', () => {
    expect(formatPrijs(79)).toBe('€ 79,00');
    expect(formatPrijs(7.5)).toBe('€ 7,50');
    expect(formatPrijs(1234.5)).toBe('€ 1.234,50');
    expect(formatPrijs(0)).toBe('€ 0,00');
  });

  it('valt terug op een streepje bij een niet-getal', () => {
    expect(formatPrijs(Number.NaN)).toBe('€ -');
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/keten/__tests__/kandidatenStart.test.ts
```

Verwacht: `Failed to resolve import "../kandidatenStart"`.

- [ ] **Stap 3: Schrijf `prijs.ts`**

Maak `src/keten/prijs.ts`:

```typescript
/**
 * Prijzen in de onboarding en op de resultatenpagina.
 *
 * Met de hand in plaats van Intl.NumberFormat, zodat de uitkomst in de browser,
 * in vite-node en in vitest gegarandeerd gelijk is en de render-tests er een
 * vaste string van kunnen verwachten.
 */
export function formatPrijs(n: number): string {
  // Een negatieve prijs bestaat niet in de catalogus; die telt als onbekend.
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return '€ -';
  const centen = Math.round(n * 100);
  const heel = String(Math.floor(centen / 100));
  const rest = String(centen % 100).padStart(2, '0');
  const metPunten = heel.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `€ ${metPunten},${rest}`;
}
```

- [ ] **Stap 4: Schrijf `kandidatenStart.ts`**

Maak `src/keten/kandidatenStart.ts`:

```typescript
/**
 * Data voor de vier feitenstappen van de onboarding v2 (spec 6 stap 1 tot 4)
 * en het ophalen van de dit-of-dat-paren (spec 7.2).
 *
 * De keuzefuncties zijn puur en deterministisch, zodat twee bezoekers met
 * dezelfde antwoorden dezelfde kaarten zien en de render-tests vaste uitkomsten
 * hebben. Alleen de drie haal-functies raken de database.
 */
import type { KetenConfig } from './composeClient';
import {
  BAND_GRENZEN,
  CATEGORIEEN,
  legeAssen,
  segmentKey,
  type Gelegenheid,
  type Geslacht,
  type Kandidaat,
  type PaarSegment,
  type PairSet,
  type Prijsband,
} from './types';

/** De drie banden uit spec 6 stap 3. boven200 bestaat wel in product_attributes maar wordt niet getoond. */
export const BANDEN: readonly Prijsband[] = ['tot50', '50tot100', '100tot200'];

export const NOGO_AANTAL = 6;

/** Minder paren dan dit in een segment en de bezoeker haalt MIN_PAREN uit taak 3 niet. */
export const MIN_PAREN_PER_SEGMENT = 6;

const PER_CATEGORIE = 12;

export function budgetVoorBand(band: Prijsband): { min: number; max: number; anker: number } {
  return BAND_GRENZEN[band];
}

/**
 * Het ankerproduct van een band: het product met een foto waarvan de prijs het
 * dichtst bij het ankerbedrag ligt. Gelijkspel gaat naar het laagste
 * product_id, zodat de kaart bij een herlaad hetzelfde blijft.
 */
export function kiesAnker(kandidaten: Kandidaat[], band: Prijsband): Kandidaat | null {
  const { anker } = budgetVoorBand(band);
  const metFoto = kandidaten.filter((k) => !!k.product.image_url);
  if (metFoto.length === 0) return null;
  return [...metFoto].sort((a, b) => {
    const da = Math.abs(a.product.price - anker);
    const db = Math.abs(b.product.price - anker);
    if (da !== db) return da - db;
    return a.product_id < b.product_id ? -1 : a.product_id > b.product_id ? 1 : 0;
  })[0];
}

/**
 * De zes no-go-kaarten (spec 6 stap 4). Ronde voor ronde een item per
 * categorie, binnen een categorie op score en dan op product_id. Zo staan er
 * nooit zes tops naast elkaar en is de uitkomst onafhankelijk van de volgorde
 * waarin de RPC de rijen teruggaf.
 */
export function kiesNoGoItems(kandidaten: Kandidaat[], aantal: number = NOGO_AANTAL): Kandidaat[] {
  const perCategorie = new Map<string, Kandidaat[]>();
  for (const k of kandidaten) {
    if (!k.product.image_url) continue;
    const lijst = perCategorie.get(k.category) ?? [];
    lijst.push(k);
    perCategorie.set(k.category, lijst);
  }
  for (const lijst of perCategorie.values()) {
    lijst.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.product_id < b.product_id ? -1 : a.product_id > b.product_id ? 1 : 0;
    });
  }

  const uit: Kandidaat[] = [];
  for (let ronde = 0; uit.length < aantal; ronde++) {
    let gevonden = false;
    for (const categorie of CATEGORIEEN) {
      const kandidaat = perCategorie.get(categorie)?.[ronde];
      if (!kandidaat) continue;
      gevonden = true;
      uit.push(kandidaat);
      if (uit.length === aantal) break;
    }
    if (!gevonden) break;
  }
  return uit;
}

export function segmentenVoor(gender: Geslacht, occasions: Gelegenheid[], band: Prijsband): PaarSegment[] {
  return occasions.map((occasion) => ({ gender, occasion, price_band: band }));
}

/** Genoeg aanbod om een outfit te bouwen: top plus bottom plus footwear, of dress plus footwear. */
export function heeftDekking(kandidaten: Kandidaat[]): boolean {
  const heeft = (c: string) => kandidaten.some((k) => k.category === c);
  if (!heeft('footwear')) return false;
  return (heeft('top') && heeft('bottom')) || heeft('dress');
}

/** Kandidaten voor het budget- en no-go-scherm: lege assen (spec 6 stap 4), geen likes, geen dislikes. */
export async function haalStartKandidaten(
  cfg: KetenConfig,
  gender: Geslacht,
  occasions: Gelegenheid[],
  band: Prijsband
): Promise<Kandidaat[]> {
  const { min, max } = budgetVoorBand(band);
  const { data, error } = await cfg.supabase.rpc('get_kandidaten', {
    p_gender: gender,
    p_occasions: occasions,
    p_budget_min: min,
    p_budget_max: max,
    p_axes: legeAssen(),
    p_liked_ids: [],
    p_disliked_ids: [],
    p_per_category: PER_CATEGORIE,
  });
  if (error) throw new Error(`get_kandidaten: ${error.message}`);
  return (data ?? []) as Kandidaat[];
}

const PAAR_KOLOMMEN = 'pair_id, segment_key, gender, occasion, price_band, axis, kanten';

/**
 * De paren voor deze segmenten, uit de view pair_sets_op_voorraad. Die view
 * laat elk paar weg waarvan een item niet meer in_stock is (ruling 2: geen
 * cron, filteren bij het ophalen).
 */
export async function haalPairSets(cfg: KetenConfig, segmenten: PaarSegment[]): Promise<PairSet[]> {
  if (segmenten.length === 0) return [];
  const sleutels = segmenten.map(segmentKey);
  const { data, error } = await cfg.supabase
    .from('pair_sets_op_voorraad')
    .select(PAAR_KOLOMMEN)
    .in('segment_key', sleutels);
  if (error) throw new Error(`pair_sets_op_voorraad: ${error.message}`);
  return (data ?? []) as PairSet[];
}

/** Hoeveel bruikbare paren staan er per segment. Voedt de uitgeschakelde budgetkaart (besluit 1). */
export async function telPairSets(cfg: KetenConfig, segmenten: PaarSegment[]): Promise<Map<string, number>> {
  const telling = new Map<string, number>();
  for (const s of segmenten) telling.set(segmentKey(s), 0);
  if (segmenten.length === 0) return telling;

  const { data, error } = await cfg.supabase
    .from('pair_sets_op_voorraad')
    .select('segment_key')
    .in('segment_key', [...telling.keys()]);
  if (error) throw new Error(`pair_sets_op_voorraad: ${error.message}`);
  for (const rij of (data ?? []) as Array<{ segment_key: string }>) {
    telling.set(rij.segment_key, (telling.get(rij.segment_key) ?? 0) + 1);
  }
  return telling;
}
```

- [ ] **Stap 5: Schrijf `tasteProfielOpslag.ts`**

Maak `src/keten/tasteProfielOpslag.ts`:

```typescript
/**
 * Het profiel opslaan: in de database om te meten, in localStorage om de
 * resultatenpagina na een herlaad opnieuw te kunnen vullen.
 *
 * taste_profiles is insert-only voor anon en profile_hash is uniek (taak 1).
 * Een tweede bezoeker met exact dezelfde keuzes botst dus op de unieke sleutel;
 * daarom wordt er ingevoegd met ignoreDuplicates, wat PostgREST vertaalt naar
 * "on conflict do nothing" en waarvoor alleen het insert-recht nodig is.
 */
import type { KetenConfig } from './composeClient';
import type { TasteProfileInput } from './types';

export const LOKAAL_PROFIEL_SLEUTEL = 'ff_taste_profiel';

export type ProfielOpslag = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface LokaalProfiel {
  profiel: TasteProfileInput;
  profile_hash: string;
}

function standaardOpslag(): ProfielOpslag | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export async function slaTasteProfielOp(
  cfg: KetenConfig,
  profileHash: string,
  profiel: TasteProfileInput
): Promise<boolean> {
  const { error } = await cfg.supabase.from('taste_profiles').upsert(
    {
      profile_hash: profileHash,
      user_id: profiel.user_id,
      session_id: profiel.session_id,
      gender: profiel.gender,
      occasions: profiel.occasions,
      budget_min: profiel.budget_min,
      budget_max: profiel.budget_max,
      nogo_product_ids: profiel.nogo_product_ids,
      choices: profiel.choices,
      axes: profiel.axes,
      liked_product_ids: profiel.liked_product_ids,
      disliked_product_ids: profiel.disliked_product_ids,
    },
    { onConflict: 'profile_hash', ignoreDuplicates: true }
  );
  if (error) {
    console.warn('[keten] profiel opslaan mislukt:', error.message);
    return false;
  }
  return true;
}

export async function slaMatenOp(
  cfg: KetenConfig,
  profileHash: string,
  sessionId: string,
  maten: Record<string, string>,
  userId: string | null = null
): Promise<boolean> {
  const schoon: Record<string, string> = {};
  for (const [sleutel, waarde] of Object.entries(maten)) {
    const tekst = String(waarde ?? '').trim();
    if (tekst) schoon[sleutel] = tekst.slice(0, 32);
  }
  if (Object.keys(schoon).length === 0) return false;

  const { error } = await cfg.supabase
    .from('taste_profile_sizes')
    .insert({ profile_hash: profileHash, session_id: sessionId, user_id: userId, sizes: schoon });
  if (error) {
    console.warn('[keten] maten opslaan mislukt:', error.message);
    return false;
  }
  return true;
}

export function bewaarLokaalProfiel(
  profiel: TasteProfileInput,
  profileHash: string,
  opslag: ProfielOpslag | null = standaardOpslag()
): void {
  if (!opslag) return;
  try {
    opslag.setItem(LOKAAL_PROFIEL_SLEUTEL, JSON.stringify({ profiel, profile_hash: profileHash }));
  } catch {
    // Vol of geblokkeerd: de resultatenpagina stuurt de bezoeker dan terug naar /start.
  }
}

export function leesLokaalProfiel(opslag: ProfielOpslag | null = standaardOpslag()): LokaalProfiel | null {
  if (!opslag) return null;
  try {
    const ruw = opslag.getItem(LOKAAL_PROFIEL_SLEUTEL);
    if (!ruw) return null;
    const data = JSON.parse(ruw);
    if (!data || typeof data !== 'object') return null;
    const { profiel, profile_hash } = data as LokaalProfiel;
    if (!profiel || typeof profile_hash !== 'string' || !/^[0-9a-f]{64}$/.test(profile_hash)) return null;
    return { profiel, profile_hash };
  } catch {
    return null;
  }
}

export function wisLokaalProfiel(opslag: ProfielOpslag | null = standaardOpslag()): void {
  try {
    opslag?.removeItem(LOKAAL_PROFIEL_SLEUTEL);
  } catch {
    // niets te doen
  }
}
```

- [ ] **Stap 6: Draai de test en zie hem slagen**

```bash
npx vitest run src/keten/__tests__/kandidatenStart.test.ts
```

Verwacht: 15 tests geslaagd.

- [ ] **Stap 7: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/keten/kandidatenStart.ts src/keten/tasteProfielOpslag.ts src/keten/prijs.ts src/keten/__tests__/kandidatenStart.test.ts
git commit -m "feat(keten): kandidaten voor de startstappen, paren ophalen en profiel opslaan

Ankerproduct en no-go-kaarten zijn deterministisch gekozen. Paren komen uit
pair_sets_op_voorraad, zodat een uitverkocht item het paar vanzelf uit beeld
haalt. Het profiel gaat insert-only naar taste_profiles en naar localStorage.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 6: Prompt, tool-schema en validatie voor de pair-modus

**Bestanden:**
- Aanmaken: `supabase/functions/_shared/paar-prompt.ts`
- Test: `supabase/functions/_shared/__tests__/paar-prompt.test.ts`

**Interfaces:**
- Gebruikt: `isCompleet(rollen: Categorie[]): boolean` uit `supabase/functions/_shared/valideer-outfits.ts` (plan 3 taak 4); `AsNaam`, `Categorie`, `CATEGORIEEN`, `Kandidaat` uit `keten-types.ts` (plan 3 taak 2); `PaarItem`, `PaarKant`, `PaarSegment`, `AS_WAARDEN` uit `paar-types.ts` (taak 2).
- Levert:
  ```typescript
  const PAAR_VERSIE = 'paar-v1'
  const PAAR_TOOL_NAAM = 'lever_paar'
  const PAAR_ITEMS_MIN = 3
  const PAAR_ITEMS_MAX = 5
  function bouwPaarToolSchema(): Record<string, unknown>
  function bouwPaarSysteemPrompt(): string
  function bouwPaarGebruikersPrompt(segment: PaarSegment, as: AsNaam, waardeA: string, waardeB: string, kandidatenA: Kandidaat[], kandidatenB: Kandidaat[], vorigeFouten: string[]): string
  function draagtAs(k: Kandidaat, as: AsNaam, waarde: string): boolean
  interface PaarValidatie { kanten: PaarKant[] | null; fouten: string[] }
  function valideerPaar(ruw: unknown, kandidatenA: Kandidaat[], kandidatenB: Kandidaat[], as: AsNaam, waardeA: string, waardeB: string, budget: { min: number; max: number }): PaarValidatie
  ```

**De promptaanpassing ten opzichte van de stylist-prompt van plan 3, volledig.**

De stylist-prompt (`stylist-prompt.ts`, plan 3 taak 5) vraagt zes losse outfits uit een gemengde kandidatenlijst voor een bezoeker met een bekend profiel. De pair-prompt vraagt iets anders en krijgt daarom een eigen bestand, een eigen toolnaam en een eigen versie:

1. **Twee kandidatenlijsten in plaats van een.** De aanroeper draait `get_kandidaten` twee keer, een keer met `p_axes = { <as>: { value: waardeA, confidence: 1 } }` en een keer met `waardeB`, en zet ze als twee blokken in de prompt. Het model mag per kant alleen uit de eigen lijst kiezen. Zo is het verschil op de as geen instructie die het model kan negeren, maar een eigenschap van de invoer.
2. **Een paar in plaats van zes outfits.** De tool heet `lever_paar` en geeft `{ kant_a: { items: [...] }, kant_b: { items: [...] } }` terug. Geen `title`, geen `reason`, geen `occasion`: het dit-of-dat-scherm toont alleen de twee beelden, en spec 7.2 legt alleen product-ids en beeld-URL's vast.
3. **De nieuwe kerninstructie: verschil op precies een as.** Waar de stylist-prompt vraagt om samenhang binnen een outfit, vraagt deze prompt om samenhang tussen twee outfits, met precies een verschil. De vier regels die dat dragen: dezelfde gelegenheid, dezelfde prijsband (die twee volgen al uit de kandidatenlijsten), dezelfde kleurfamilie (minstens een gedeelde kleur, hard gevalideerd), en dezelfde rollen aan beide kanten (top plus bottom plus footwear, of dress plus footwear).
4. **Geen herkansing op inhoud, wel op fouten.** Net als in plan 3 gaat `vorigeFouten` als blok "Fouten in de vorige poging" in de prompt.
5. **Geen copy-regels.** De stylist-prompt heeft regel 10 over je en jij; hier schrijft het model geen tekst, dus die regel staat er niet in.
6. **Eigen versie.** `PAAR_VERSIE = 'paar-v1'` staat in de logregels van taak 7 en 8. Verander je prompt of schema, verhoog dan de versie en draai `genereer-paren.ts` opnieuw; oude rijen in `pair_sets` blijven geldig zolang hun producten op voorraad zijn.

- [ ] **Stap 1: Schrijf de falende test**

Maak `supabase/functions/_shared/__tests__/paar-prompt.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  PAAR_ITEMS_MAX,
  PAAR_ITEMS_MIN,
  PAAR_TOOL_NAAM,
  PAAR_VERSIE,
  bouwPaarGebruikersPrompt,
  bouwPaarSysteemPrompt,
  bouwPaarToolSchema,
  draagtAs,
  valideerPaar,
} from '../paar-prompt.ts';
import type { Categorie, Kandidaat, ProductAttrs, RuwProduct } from '../keten-types.ts';

function attrs(category: Categorie, extra: Partial<ProductAttrs> = {}): ProductAttrs {
  return {
    is_fashion: true,
    category,
    gender: 'female',
    formality: 3,
    occasions: ['work'],
    silhouette: 'regular',
    color_temp: 'neutraal',
    lightness: 'medium',
    pattern: 'effen',
    shoe_type: category === 'footwear' ? 'net' : null,
    colors: ['zwart'],
    materials: ['katoen'],
    seasons: ['herfst'],
    price_band: '50tot100',
    confidence: 0.9,
    tagger_version: 'haiku-4.5-v1',
    ...extra,
  };
}

function product(id: string, price = 60): RuwProduct {
  return {
    id, name: `Product ${id}`, brand: 'Merk', price, image_url: `https://voorbeeld.test/${id}.jpg`,
    retailer: 'H&M', url: null, affiliate_url: null, product_url: null, gender: 'female',
    colors: ['zwart'], sizes: ['M'], in_stock: true, description: null,
  };
}

function kandidaat(id: string, category: Categorie, extra: Partial<ProductAttrs> = {}, price = 60): Kandidaat {
  return { product_id: id, category, score: 0.5, attrs: attrs(category, extra), product: product(id, price) };
}

const budget = { min: 50, max: 100 };
const segment = { gender: 'female' as const, occasion: 'work' as const, price_band: '50tot100' as const };

const kantA = [
  kandidaat('a-top', 'top', { pattern: 'effen' }),
  kandidaat('a-bottom', 'bottom', { pattern: 'effen' }),
  kandidaat('a-shoe', 'footwear', { pattern: 'effen' }),
];
const kantB = [
  kandidaat('b-top', 'top', { pattern: 'statement' }),
  kandidaat('b-bottom', 'bottom', { pattern: 'statement' }),
  kandidaat('b-shoe', 'footwear', { pattern: 'statement' }),
];

function goedAntwoord() {
  return {
    kant_a: { items: [{ product_id: 'a-top', role: 'top' }, { product_id: 'a-bottom', role: 'bottom' }, { product_id: 'a-shoe', role: 'footwear' }] },
    kant_b: { items: [{ product_id: 'b-top', role: 'top' }, { product_id: 'b-bottom', role: 'bottom' }, { product_id: 'b-shoe', role: 'footwear' }] },
  };
}

function alleObjectenStrikt(schema: unknown): boolean {
  if (typeof schema !== 'object' || schema === null) return true;
  const s = schema as Record<string, unknown>;
  if (s.type === 'object') {
    if (s.additionalProperties !== false) return false;
    if (!Array.isArray(s.required)) return false;
    const props = (s.properties ?? {}) as Record<string, unknown>;
    const keys = Object.keys(props);
    if (keys.some((k) => !(s.required as string[]).includes(k))) return false;
    return keys.every((k) => alleObjectenStrikt(props[k]));
  }
  if (s.type === 'array') return alleObjectenStrikt(s.items);
  return true;
}

describe('constanten en schema', () => {
  it('versie, toolnaam en itemgrenzen staan vast', () => {
    expect(PAAR_VERSIE).toBe('paar-v1');
    expect(PAAR_TOOL_NAAM).toBe('lever_paar');
    expect(PAAR_ITEMS_MIN).toBe(3);
    expect(PAAR_ITEMS_MAX).toBe(5);
  });

  it('het schema is strikt op elk objectniveau en heeft twee kanten', () => {
    const schema = bouwPaarToolSchema() as any;
    expect(alleObjectenStrikt(schema)).toBe(true);
    expect(Object.keys(schema.properties)).toEqual(['kant_a', 'kant_b']);
    expect(schema.properties.kant_a.properties.items.items.properties.role.enum).toEqual([
      'top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory',
    ]);
    expect(schema.properties.kant_b.properties.items.minItems).toBe(3);
    expect(schema.properties.kant_b.properties.items.maxItems).toBe(5);
  });
});

describe('prompts', () => {
  it('de systeemprompt noemt de tool en de kerninstructie', () => {
    const s = bouwPaarSysteemPrompt();
    expect(s).toContain('lever_paar');
    expect(s).toContain('precies een as');
    expect(s).toContain('dezelfde kleurfamilie');
    expect(s).not.toContain('zes outfits');
  });

  it('de gebruikersprompt zet de twee kandidatenlijsten apart met hun as-waarde', () => {
    const p = bouwPaarGebruikersPrompt(segment, 'pattern', 'effen', 'statement', kantA, kantB, []);
    expect(p).toContain('Segment: dames, work, prijsband 50tot100 (50 tot 100 euro per stuk)');
    expect(p).toContain('As: pattern. Kant A is effen, kant B is statement.');
    expect(p).toContain('## Kandidaten kant A (pattern = effen)');
    expect(p).toContain('## Kandidaten kant B (pattern = statement)');
    expect(p).toContain('a-top');
    expect(p).toContain('b-shoe');
    expect(p).not.toContain('Fouten in de vorige poging');
  });

  it('de gebruikersprompt neemt de fouten van de vorige poging op', () => {
    const p = bouwPaarGebruikersPrompt(segment, 'pattern', 'effen', 'statement', kantA, kantB, ['kant a: niet compleet']);
    expect(p).toContain('Fouten in de vorige poging');
    expect(p).toContain('kant a: niet compleet');
  });
});

describe('draagtAs', () => {
  it('vergelijkt formality als getal en de tekst-assen direct', () => {
    expect(draagtAs(kandidaat('x', 'top', { formality: 4 }), 'formality', '4')).toBe(true);
    expect(draagtAs(kandidaat('x', 'top', { formality: 2 }), 'formality', '4')).toBe(false);
    expect(draagtAs(kandidaat('x', 'top', { silhouette: 'slim' }), 'silhouette', 'slim')).toBe(true);
    expect(draagtAs(kandidaat('x', 'top', { silhouette: 'slim' }), 'silhouette', 'relaxed')).toBe(false);
  });

  it('laat shoe_type alleen door footwear dragen', () => {
    expect(draagtAs(kandidaat('s', 'footwear', { shoe_type: 'sneaker' }), 'shoe_type', 'sneaker')).toBe(true);
    expect(draagtAs(kandidaat('t', 'top', { shoe_type: null }), 'shoe_type', 'sneaker')).toBe(false);
  });
});

describe('valideerPaar', () => {
  it('keurt een goed paar goed en verrijkt de items', () => {
    const uit = valideerPaar(goedAntwoord(), kantA, kantB, 'pattern', 'effen', 'statement', budget);
    expect(uit.fouten).toEqual([]);
    expect(uit.kanten).not.toBeNull();
    expect(uit.kanten?.map((k) => k.kant)).toEqual(['a', 'b']);
    expect(uit.kanten?.[0].waarde).toBe('effen');
    expect(uit.kanten?.[0].items[0]).toEqual({
      product_id: 'a-top',
      role: 'top',
      name: 'Product a-top',
      brand: 'Merk',
      price: 60,
      image_url: 'https://voorbeeld.test/a-top.jpg',
    });
  });

  it('verwerpt een antwoord met een verkeerde vorm', () => {
    expect(valideerPaar(null, kantA, kantB, 'pattern', 'effen', 'statement', budget).kanten).toBeNull();
    expect(valideerPaar({ kant_a: { items: [] } }, kantA, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('kant b: geen items');
  });

  it('verwerpt een id dat niet in de eigen kandidatenlijst staat', () => {
    const fout = goedAntwoord();
    fout.kant_a.items[0].product_id = 'b-top';
    expect(valideerPaar(fout, kantA, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('kant a: b-top staat niet in de kandidatenlijst van kant a');
  });

  it('verwerpt een rol die niet bij de categorie hoort', () => {
    const fout = goedAntwoord();
    fout.kant_a.items[0].role = 'bottom';
    expect(valideerPaar(fout, kantA, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('kant a: a-top is top, niet bottom');
  });

  it('verwerpt een onvolledige kant', () => {
    const fout = goedAntwoord();
    fout.kant_b.items = fout.kant_b.items.slice(0, 2);
    expect(valideerPaar(fout, kantA, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('kant b: minder dan 3 items');
  });

  it('verwerpt een item buiten de prijsband', () => {
    const duur = [kandidaat('a-top', 'top', { pattern: 'effen' }, 400), kantA[1], kantA[2]];
    expect(valideerPaar(goedAntwoord(), duur, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('kant a: a-top kost 400');
  });

  it('verwerpt een kant die de as-waarde van de andere kant draagt', () => {
    const vervuild = [kandidaat('a-top', 'top', { pattern: 'statement' }), kantA[1], kantA[2]];
    const fouten = valideerPaar(goedAntwoord(), vervuild, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n');
    expect(fouten).toContain('kant a: a-top draagt statement, de waarde van de andere kant');
  });

  it('verwerpt een kant waarvan geen enkel item de eigen as-waarde draagt', () => {
    const leeg = kantA.map((k) => kandidaat(k.product_id, k.category, { pattern: 'subtiel' }));
    expect(valideerPaar(goedAntwoord(), leeg, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('kant a: geen enkel item draagt effen');
  });

  it('verwerpt een product dat aan beide kanten staat', () => {
    const gedeeld = goedAntwoord();
    gedeeld.kant_b.items[2].product_id = 'a-shoe';
    const metGedeeld = [kantB[0], kantB[1], kandidaat('a-shoe', 'footwear', { pattern: 'statement' })];
    expect(valideerPaar(gedeeld, kantA, metGedeeld, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('a-shoe staat aan beide kanten');
  });

  it('verwerpt twee kanten zonder gedeelde kleur', () => {
    const anderKleur = kantB.map((k) => kandidaat(k.product_id, k.category, { pattern: 'statement', colors: ['rood'] }));
    expect(valideerPaar(goedAntwoord(), kantA, anderKleur, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('de twee kanten delen geen kleur');
  });

  it('verwerpt een item zonder foto', () => {
    const zonderFoto = kantA.map((k) => {
      const kopie = kandidaat(k.product_id, k.category, { pattern: 'effen' });
      kopie.product.image_url = null;
      return kopie;
    });
    expect(valideerPaar(goedAntwoord(), zonderFoto, kantB, 'pattern', 'effen', 'statement', budget).fouten.join('\n'))
      .toContain('kant a: a-top heeft geen foto');
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run supabase/functions/_shared/__tests__/paar-prompt.test.ts
```

Verwacht: `Failed to resolve import "../paar-prompt.ts"`.

- [ ] **Stap 3: Schrijf prompt, schema en validatie**

Maak `supabase/functions/_shared/paar-prompt.ts`:

```typescript
/**
 * Prompt, tool-schema en validatie voor de pair-modus van compose-outfits
 * (spec 7.2).
 *
 * Een paar is twee complete outfits die op precies een as verschillen en
 * verder zo gelijk mogelijk zijn. Het verschil zit niet in een instructie maar
 * in de invoer: de aanroeper haalt twee keer kandidaten op, een keer met de as
 * op waardeA en een keer met waardeB, en het model mag per kant alleen uit de
 * eigen lijst kiezen. De validatie hieronder controleert dat daarna nog een
 * keer hard.
 *
 * Puur: geen Deno-globals, zodat vitest de inhoud kan testen. Verander je de
 * prompt of het schema, verhoog dan PAAR_VERSIE.
 */
import { isCompleet } from './valideer-outfits.ts';
import { CATEGORIEEN, type AsNaam, type Categorie, type Kandidaat } from './keten-types.ts';
import type { PaarItem, PaarKant, PaarSegment } from './paar-types.ts';

export const PAAR_VERSIE = 'paar-v1';
export const PAAR_TOOL_NAAM = 'lever_paar';
export const PAAR_ITEMS_MIN = 3;
export const PAAR_ITEMS_MAX = 5;

const GESLACHT_LABEL: Record<PaarSegment['gender'], string> = {
  male: 'heren',
  female: 'dames',
  unisex: 'dames en heren (unisex)',
};

/** Alleen voor de promptregel; de harde grenzen komen uit BAND_GRENZEN in paar-types.ts. */
const BAND_TEKST: Record<string, string> = {
  tot50: '0 tot 50 euro per stuk',
  '50tot100': '50 tot 100 euro per stuk',
  '100tot200': '100 tot 200 euro per stuk',
  boven200: 'vanaf 200 euro per stuk',
};
export function bouwPaarToolSchema(): Record<string, unknown> {
  const kant = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        minItems: PAAR_ITEMS_MIN,
        maxItems: PAAR_ITEMS_MAX,
        items: {
          type: 'object',
          properties: {
            product_id: { type: 'string', description: 'Een product_id uit de kandidatenlijst van deze kant.' },
            role: { type: 'string', enum: [...CATEGORIEEN] },
          },
          required: ['product_id', 'role'],
          additionalProperties: false,
        },
      },
    },
    required: ['items'],
    additionalProperties: false,
  };

  return {
    type: 'object',
    properties: { kant_a: kant, kant_b: kant },
    required: ['kant_a', 'kant_b'],
    additionalProperties: false,
  };
}

export function bouwPaarSysteemPrompt(): string {
  return [
    'Je bouwt voor FitFi een dit-of-dat-paar: twee complete outfits die naast elkaar aan een bezoeker worden getoond, zodat zijn keuze iets zegt over precies een smaak-as.',
    '',
    'Regels:',
    '1. Kant A gebruikt alleen product_ids uit de kandidatenlijst van kant A, kant B alleen uit die van kant B. Verzin geen ids.',
    '2. Beide kanten zijn compleet: top + bottom + footwear, of dress + footwear. Outerwear en accessory zijn optioneel en komen hooguit een keer voor. Nooit een dress samen met een top of bottom.',
    `3. Beide kanten hebben minstens ${PAAR_ITEMS_MIN} en hooguit ${PAAR_ITEMS_MAX} items, en dezelfde rollen: staat er links een outerwear, dan ook rechts.`,
    '4. De twee kanten verschillen op precies een as, de as die in het verzoek staat. Op alles daarbuiten lijken ze zo veel mogelijk op elkaar.',
    '5. Beide kanten horen bij dezelfde gelegenheid en dezelfde prijsband; dat volgt al uit de kandidatenlijsten.',
    '6. Beide kanten gebruiken dezelfde kleurfamilie: er is minstens een kleur die aan beide kanten voorkomt. Het verschil moet de as zijn, niet de kleur.',
    '7. Geen product komt aan beide kanten voor.',
    '8. Kies items met een foto; een item zonder foto is onbruikbaar in dit scherm.',
    '',
    `Antwoord uitsluitend via de tool ${PAAR_TOOL_NAAM}. Schrijf geen tekst, geen titel en geen uitleg.`,
  ].join('\n');
}

function kandidaatRegel(k: Kandidaat): string {
  const p = k.product;
  const a = k.attrs;
  const delen = [
    k.product_id,
    p.name,
    p.brand ?? 'merk onbekend',
    `${p.price} euro`,
    `rol ${k.category}`,
    `formaliteit ${a.formality ?? '?'}`,
    a.silhouette ?? 'silhouet ?',
    a.color_temp ?? 'temperatuur ?',
    a.lightness ?? 'lichtheid ?',
    a.pattern ?? 'patroon ?',
    `kleuren: ${(a.colors ?? []).join(', ') || 'onbekend'}`,
  ];
  if (k.category === 'footwear') delen.push(`schoen: ${a.shoe_type ?? 'onbekend'}`);
  return `- ${delen.join(' | ')}`;
}

function kandidatenBlok(titel: string, kandidaten: Kandidaat[]): string {
  const perCategorie = new Map<string, Kandidaat[]>();
  for (const k of kandidaten) {
    const lijst = perCategorie.get(k.category) ?? [];
    lijst.push(k);
    perCategorie.set(k.category, lijst);
  }
  const regels = [titel];
  for (const categorie of CATEGORIEEN) {
    const lijst = perCategorie.get(categorie) ?? [];
    regels.push(`### ${categorie} (${lijst.length})`);
    regels.push(lijst.length === 0 ? '- geen' : lijst.map(kandidaatRegel).join('\n'));
  }
  return regels.join('\n');
}

export function bouwPaarGebruikersPrompt(
  segment: PaarSegment,
  as: AsNaam,
  waardeA: string,
  waardeB: string,
  kandidatenA: Kandidaat[],
  kandidatenB: Kandidaat[],
  vorigeFouten: string[]
): string {
  const delen: string[] = [];
  delen.push('## Opdracht');
  delen.push(
    `Segment: ${GESLACHT_LABEL[segment.gender]}, ${segment.occasion}, prijsband ${segment.price_band} (${BAND_TEKST[segment.price_band]})`
  );
  delen.push(`As: ${as}. Kant A is ${waardeA}, kant B is ${waardeB}.`);
  delen.push('');
  delen.push(kandidatenBlok(`## Kandidaten kant A (${as} = ${waardeA})`, kandidatenA));
  delen.push('');
  delen.push(kandidatenBlok(`## Kandidaten kant B (${as} = ${waardeB})`, kandidatenB));

  if (vorigeFouten.length > 0) {
    delen.push('');
    delen.push('## Fouten in de vorige poging');
    delen.push('Je vorige antwoord had deze fouten. Lever een nieuw paar zonder deze fouten:');
    delen.push(vorigeFouten.map((f) => `- ${f}`).join('\n'));
  }

  delen.push('');
  delen.push(`Bouw nu het paar en lever het via ${PAAR_TOOL_NAAM}.`);
  return delen.join('\n');
}

/**
 * Draagt dit item de gegeven waarde op deze as?
 *
 * shoe_type is de uitzondering: alleen footwear draagt die as, een top zegt er
 * niets over. formality staat in product_attributes als getal en wordt hier
 * als tekst vergeleken, omdat de as-waarden in pair_sets tekst zijn.
 */
export function draagtAs(k: Kandidaat, as: AsNaam, waarde: string): boolean {
  const a = k.attrs;
  if (as === 'shoe_type') {
    return k.category === 'footwear' && a.shoe_type === waarde;
  }
  if (as === 'formality') {
    return a.formality !== null && a.formality !== undefined && String(a.formality) === waarde;
  }
  const gelezen = a[as];
  return typeof gelezen === 'string' && gelezen === waarde;
}

export interface PaarValidatie {
  /** Null als het paar verworpen is. */
  kanten: PaarKant[] | null;
  fouten: string[];
}

interface RuweItem {
  product_id?: unknown;
  role?: unknown;
}

function ruweItems(ruw: unknown, sleutel: 'kant_a' | 'kant_b'): RuweItem[] {
  if (typeof ruw !== 'object' || ruw === null) return [];
  const kant = (ruw as Record<string, unknown>)[sleutel];
  if (typeof kant !== 'object' || kant === null) return [];
  const items = (kant as Record<string, unknown>).items;
  return Array.isArray(items) ? (items as RuweItem[]) : [];
}

function verrijk(item: RuweItem, k: Kandidaat): PaarItem {
  return {
    product_id: k.product_id,
    role: item.role as Categorie,
    name: k.product.name,
    brand: k.product.brand ?? null,
    price: k.product.price,
    image_url: k.product.image_url ?? null,
  };
}

function kleurenVan(items: PaarItem[], perId: Map<string, Kandidaat>): Set<string> {
  const uit = new Set<string>();
  for (const item of items) {
    for (const kleur of perId.get(item.product_id)?.attrs.colors ?? []) uit.add(kleur);
  }
  return uit;
}

/**
 * Harde validatie van het antwoord van het model. Elke overtreding verwerpt
 * het hele paar: een half paar heeft geen betekenis, want de bezoeker kiest
 * tussen twee dingen.
 */
export function valideerPaar(
  ruw: unknown,
  kandidatenA: Kandidaat[],
  kandidatenB: Kandidaat[],
  as: AsNaam,
  waardeA: string,
  waardeB: string,
  budget: { min: number; max: number }
): PaarValidatie {
  const fouten: string[] = [];
  const kanten: PaarKant[] = [];
  const perKant: Array<{ naam: 'a' | 'b'; sleutel: 'kant_a' | 'kant_b'; kandidaten: Kandidaat[]; eigen: string; ander: string }> = [
    { naam: 'a', sleutel: 'kant_a', kandidaten: kandidatenA, eigen: waardeA, ander: waardeB },
    { naam: 'b', sleutel: 'kant_b', kandidaten: kandidatenB, eigen: waardeB, ander: waardeA },
  ];

  const alleKandidaten = new Map<string, Kandidaat>();
  for (const k of [...kandidatenA, ...kandidatenB]) alleKandidaten.set(k.product_id, k);

  for (const kant of perKant) {
    const perId = new Map<string, Kandidaat>();
    for (const k of kant.kandidaten) perId.set(k.product_id, k);

    const items = ruweItems(ruw, kant.sleutel);
    if (items.length === 0) {
      fouten.push(`kant ${kant.naam}: geen items`);
      continue;
    }
    if (items.length < PAAR_ITEMS_MIN) {
      fouten.push(`kant ${kant.naam}: minder dan ${PAAR_ITEMS_MIN} items`);
    }
    if (items.length > PAAR_ITEMS_MAX) {
      fouten.push(`kant ${kant.naam}: meer dan ${PAAR_ITEMS_MAX} items`);
    }

    const verrijkt: PaarItem[] = [];
    let draagtEigen = false;
    for (const item of items) {
      const id = typeof item.product_id === 'string' ? item.product_id : '';
      const kandidaat = perId.get(id);
      if (!kandidaat) {
        fouten.push(`kant ${kant.naam}: ${id || '(leeg id)'} staat niet in de kandidatenlijst van kant ${kant.naam}`);
        continue;
      }
      if (item.role !== kandidaat.category) {
        fouten.push(`kant ${kant.naam}: ${id} is ${kandidaat.category}, niet ${String(item.role)}`);
        continue;
      }
      if (!kandidaat.product.image_url) {
        fouten.push(`kant ${kant.naam}: ${id} heeft geen foto`);
        continue;
      }
      const prijs = kandidaat.product.price;
      if (typeof prijs !== 'number' || prijs < budget.min || prijs > budget.max) {
        fouten.push(`kant ${kant.naam}: ${id} kost ${prijs}, prijsband ${budget.min} tot ${budget.max}`);
        continue;
      }
      if (draagtAs(kandidaat, as, kant.ander)) {
        fouten.push(`kant ${kant.naam}: ${id} draagt ${kant.ander}, de waarde van de andere kant`);
        continue;
      }
      if (draagtAs(kandidaat, as, kant.eigen)) draagtEigen = true;
      verrijkt.push(verrijk(item, kandidaat));
    }

    const rollen = verrijkt.map((i) => i.role);
    if (new Set(rollen).size !== rollen.length) {
      fouten.push(`kant ${kant.naam}: dezelfde rol twee keer (${rollen.join('+')})`);
    }
    if (!isCompleet(rollen)) {
      fouten.push(`kant ${kant.naam}: niet compleet, rollen ${rollen.join('+') || 'geen'}`);
    }
    if (!draagtEigen) {
      fouten.push(`kant ${kant.naam}: geen enkel item draagt ${kant.eigen}`);
    }

    kanten.push({ kant: kant.naam, waarde: kant.eigen, items: verrijkt });
  }

  if (kanten.length === 2) {
    const idsA = new Set(kanten[0].items.map((i) => i.product_id));
    for (const item of kanten[1].items) {
      if (idsA.has(item.product_id)) fouten.push(`${item.product_id} staat aan beide kanten`);
    }
    const rollenA = kanten[0].items.map((i) => i.role).sort().join('+');
    const rollenB = kanten[1].items.map((i) => i.role).sort().join('+');
    if (rollenA !== rollenB) {
      fouten.push(`de twee kanten hebben andere rollen: ${rollenA} tegenover ${rollenB}`);
    }
    const kleurenA = kleurenVan(kanten[0].items, alleKandidaten);
    const kleurenB = kleurenVan(kanten[1].items, alleKandidaten);
    const gedeeld = [...kleurenA].some((k) => kleurenB.has(k));
    if (!gedeeld) {
      fouten.push('de twee kanten delen geen kleur');
    }
  }

  return { kanten: fouten.length === 0 ? kanten : null, fouten };
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

```bash
npx vitest run supabase/functions/_shared/__tests__/paar-prompt.test.ts
```

Verwacht: 16 tests geslaagd.

- [ ] **Stap 5: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add supabase/functions/_shared/paar-prompt.ts supabase/functions/_shared/__tests__/paar-prompt.test.ts
git commit -m "feat(keten): prompt, schema en validatie voor dit-of-dat-paren

Het verschil op de as zit in de invoer: twee kandidatenlijsten, een per
waarde. De validatie controleert daarna nog eens dat geen enkel item de
waarde van de andere kant draagt en dat de twee kanten een kleur delen.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 7: Pair-modus en leesmodus in de edge function `compose-outfits`

**Bestanden:**
- Aanmaken: `supabase/functions/compose-outfits/paar.ts`
- Aanmaken: `supabase/functions/compose-outfits/lees.ts`
- Wijzigen: `supabase/functions/compose-outfits/index.ts` (plan 3 taak 6; tekstanker `if (!isVerzoek(verzoek)) {`)
- Test: de rooktests in stap 1, stap 5 en stap 7 tegen de gedeployde functie

**Interfaces:**
- Gebruikt: `buildCorsHeaders(req, extraHeaders?)` uit `supabase/functions/_shared/cors.ts`; `PAAR_TOOL_NAAM`, `PAAR_VERSIE`, `bouwPaarGebruikersPrompt`, `bouwPaarSysteemPrompt`, `bouwPaarToolSchema`, `valideerPaar` (taak 6); `BAND_GRENZEN`, `segmentKey`, `PaarSegment`, `PairSet`, `Prijsband` (taak 2); `AsNaam`, `Kandidaat`, `VerrijkteOutfit`, `legeAssen()` uit `keten-types.ts`; `STYLIST_VERSION` uit `supabase/functions/_shared/stylist-prompt.ts` (plan 3 taak 5); RPC `get_kandidaten` (plan 1 taak 3); tabel `pair_sets` (taak 1); tabel `outfit_sets` (plan 3 taak 3). Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STYLIST_MODEL`.
- Levert in `paar.ts`:
  ```typescript
  interface PaarVerzoek { mode: 'pair'; segment: PaarSegment; axis: AsNaam; waarde_a: string; waarde_b: string }
  type PaarAntwoord =
    | { ok: true; pair: PairSet; input_tokens: number; output_tokens: number; latency_ms: number; paar_versie: string }
    | { ok: false; reason: string }
  function isPaarVerzoek(x: unknown): x is PaarVerzoek
  function handlePaar(req: Request, verzoek: PaarVerzoek): Promise<Response>
  ```
- Levert in `lees.ts`:
  ```typescript
  const HASH_PATROON: RegExp                    // ^[0-9a-f]{64}$
  interface LeesVerzoek { mode: 'lees'; profile_hash: string }
  type LeesAntwoord =
    | { ok: true; profile_hash: string; stylist_version: string; source: 'cache'; model: string | null; outfits: VerrijkteOutfit[] }
    | { ok: false; reason: string }
  function isLeesVerzoek(x: unknown): x is LeesVerzoek
  function handleLees(req: Request, verzoek: LeesVerzoek): Promise<Response>
  ```

Beveiliging: de pair-modus kost geld per aanroep en schrijft in `pair_sets`, waar anon geen insert-recht heeft. Daarom accepteert `handlePaar` alleen een verzoek met de service role key in de `Authorization`-header. Een bezoeker die `mode: 'pair'` probeert krijgt 401 en er wordt geen model aangeroepen. Het plafond op het aantal aanroepen zit in het script (taak 8), niet hier: het script is de enige aanroeper (besluit 3 in "Wat de spec openlaat").

**De leesmodus, en waarom hij hier hoort (besluit 7).** `/results?v=2` haalt zijn profiel uit localStorage. Een gedeelde link, een tweede toestel of een herlaad na het wissen van de opslag geeft daardoor "We kennen je keuzes nog niet", terwijl de outfits voor die `profile_hash` al in `outfit_sets` staan. `taste_profiles` heeft bewust geen select-policy en die blijft dicht, dus de client kan het profiel niet zelf terughalen. De leesmodus lost dat op aan de kant waar de service role al zit: `{ mode: 'lees', profile_hash }` geeft de gecachete outfits terug en anders `niet gevonden`. Verschillen met de gewone modus:

1. **Geen profiel en geen kandidaten in het verzoek.** Alleen de hash; die is een sha256 van de keuzes (spec 5.2.1) en dus niet te raden.
2. **Nooit een modelaanroep.** Staat er niets in `outfit_sets`, dan komt er `niet gevonden` terug. Zo kan een onbekende hash geen geld kosten.
3. **Wel bereikbaar voor anon**, want dit is precies het pad van een gedeelde link. Wat eruit komt zijn outfits met catalogusdata, geen persoonsgegevens: het geslacht, het budget, de no-go's en de keuzes blijven in `taste_profiles` staan.
4. **Dezelfde voorraadregel als de cache-tak van plan 3 taak 6.** Is een item niet meer op voorraad, dan is de set niet meer geldig en komt er `niet gevonden`; de bezoeker krijgt dan de knop naar `/start`.
5. **Harde vormcontrole aan beide kanten.** `profile_hash` moet 64 hex-tekens zijn, hier en in `src/keten/leesOutfits.ts` (taak 12).

- [ ] **Stap 1: Schrijf de falende rooktest en zie hem falen**

De functie die plan 3 taak 6 oplevert kent `mode` niet en verwerpt het verzoek als vormfout. Leg dat vast voordat je iets verandert:

```bash
set -a; source .env; set +a
SERVICE="$(supabase projects api-keys --project-ref "$(cat supabase/.temp/project-ref)" -o json | grep -o '"api_key":"[^"]*"' | tail -1 | cut -d'"' -f4)"
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $SERVICE" -H "apikey: $SERVICE" -H "Content-Type: application/json" \
  -d '{"mode":"pair","segment":{"gender":"female","occasion":"work","price_band":"50tot100"},"axis":"pattern","waarde_a":"effen","waarde_b":"statement"}'
echo
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"mode":"pair","segment":{"gender":"female","occasion":"work","price_band":"50tot100"},"axis":"pattern","waarde_a":"effen","waarde_b":"statement"}'
echo
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"mode":"lees","profile_hash":"'"$(printf 'a%.0s' $(seq 1 64))"'"}'
```

Verwacht nu bij alle drie: `{"error":"Verwacht { profile_hash, profile, kandidaten }"}`. Dat is de falende test: de pair-modus en de leesmodus bestaan niet, en de tweede aanroep laat zien dat er nog geen onderscheid is tussen anon en service role. Houd `$SERVICE` in deze shell; sluit de shell na deze taak. De sleutel gaat nergens heen behalve deze curl-aanroepen.

- [ ] **Stap 2: Schrijf de pair-modus**

Maak `supabase/functions/compose-outfits/paar.ts`:

```typescript
/**
 * Pair-modus van compose-outfits (spec 7.2).
 *
 * Bouwt een dit-of-dat-paar: twee complete outfits die op precies een as
 * verschillen. Stappen:
 *   1. Service role controleren. Deze modus kost geld en schrijft in pair_sets;
 *      alleen scripts/keten/genereer-paren.ts mag hem aanroepen.
 *   2. Twee keer get_kandidaten, een keer per as-waarde, en per kant alleen de
 *      items die die waarde echt dragen. Daar zit het verschil.
 *   3. Het model via de Anthropic Messages API met een tool als structured
 *      output, hooguit AANROEP_TIMEOUT_MS.
 *   4. valideerPaar; bij fouten een keer opnieuw met die fouten in de prompt.
 *   5. pair_id deterministisch uit segment, as en gesorteerde product_ids,
 *      upsert in pair_sets, antwoord met tokenverbruik.
 *
 * Er is geen cache en geen noodpad: dit draait offline in een script, niet in
 * het pad van een bezoeker. Mislukt het, dan meldt het script dat en probeer je
 * het later opnieuw.
 *
 * Poort voor dit bestand: `npm run check:edge` (deno check). tsc ziet het niet.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';
import {
  PAAR_TOOL_NAAM,
  PAAR_VERSIE,
  bouwPaarGebruikersPrompt,
  bouwPaarSysteemPrompt,
  bouwPaarToolSchema,
  valideerPaar,
} from '../_shared/paar-prompt.ts';
import { BAND_GRENZEN, segmentKey, type PaarSegment, type PairSet, type Prijsband } from '../_shared/paar-types.ts';
import { AS_NAMEN, GELEGENHEDEN, legeAssen, type AsNaam, type Kandidaat } from '../_shared/keten-types.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const STANDAARD_MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 2048;
const AANROEP_TIMEOUT_MS = 45_000;
const PER_CATEGORIE = 12;

export interface PaarVerzoek {
  mode: 'pair';
  segment: PaarSegment;
  axis: AsNaam;
  waarde_a: string;
  waarde_b: string;
}

export type PaarAntwoord =
  | {
      ok: true;
      pair: PairSet;
      input_tokens: number;
      output_tokens: number;
      latency_ms: number;
      paar_versie: string;
    }
  | { ok: false; reason: string };

function antwoord(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildCorsHeaders(req, { 'Content-Type': 'application/json' }),
  });
}

export function isPaarVerzoek(x: unknown): x is PaarVerzoek {
  if (typeof x !== 'object' || x === null) return false;
  const v = x as PaarVerzoek;
  const s = v.segment;
  return (
    v.mode === 'pair' &&
    typeof s === 'object' &&
    s !== null &&
    (s.gender === 'male' || s.gender === 'female' || s.gender === 'unisex') &&
    (GELEGENHEDEN as readonly string[]).includes(s.occasion) &&
    Object.prototype.hasOwnProperty.call(BAND_GRENZEN, s.price_band) &&
    (AS_NAMEN as readonly string[]).includes(v.axis) &&
    typeof v.waarde_a === 'string' &&
    v.waarde_a.length > 0 &&
    typeof v.waarde_b === 'string' &&
    v.waarde_b.length > 0 &&
    v.waarde_a !== v.waarde_b
  );
}

function heeftServiceRole(req: Request, serviceKey: string): boolean {
  const kop = req.headers.get('Authorization') ?? '';
  const token = kop.startsWith('Bearer ') ? kop.slice(7).trim() : '';
  return token.length > 0 && token === serviceKey;
}

async function sha256Hex(tekst: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tekst));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AnthropicBlok {
  type: string;
  name?: string;
  input?: unknown;
}

interface AnthropicAntwoord {
  stop_reason?: string;
  content?: AnthropicBlok[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

interface ModelUitkomst {
  ruw: unknown;
  input_tokens: number;
  output_tokens: number;
}

async function vraagPaar(
  apiKey: string,
  model: string,
  segment: PaarSegment,
  axis: AsNaam,
  waardeA: string,
  waardeB: string,
  kandidatenA: Kandidaat[],
  kandidatenB: Kandidaat[],
  vorigeFouten: string[]
): Promise<ModelUitkomst> {
  const body = {
    model,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'disabled' },
    system: bouwPaarSysteemPrompt(),
    messages: [
      {
        role: 'user',
        content: bouwPaarGebruikersPrompt(segment, axis, waardeA, waardeB, kandidatenA, kandidatenB, vorigeFouten),
      },
    ],
    tools: [
      {
        name: PAAR_TOOL_NAAM,
        description: 'Levert twee complete outfits die op precies een as verschillen.',
        input_schema: bouwPaarToolSchema(),
        strict: true,
      },
    ],
    tool_choice: { type: 'tool', name: PAAR_TOOL_NAAM, disable_parallel_tool_use: true },
  };

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(AANROEP_TIMEOUT_MS),
    });
  } catch (err) {
    const naam = err instanceof Error ? err.name : '';
    if (naam === 'TimeoutError' || naam === 'AbortError') {
      throw new Error(`Anthropic antwoordde niet binnen ${AANROEP_TIMEOUT_MS / 1000} s`);
    }
    throw err;
  }

  if (!res.ok) {
    const tekst = (await res.text()).slice(0, 300);
    throw new Error(`Anthropic ${res.status}: ${tekst}`);
  }

  const data = (await res.json()) as AnthropicAntwoord;
  if (data.stop_reason === 'refusal') throw new Error('model weigerde het verzoek');
  const blok = (data.content ?? []).find((b) => b.type === 'tool_use' && b.name === PAAR_TOOL_NAAM);
  if (!blok) {
    throw new Error(`geen tool_use-blok in antwoord (stop_reason ${data.stop_reason ?? 'onbekend'})`);
  }
  return {
    ruw: blok.input,
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  };
}

export async function handlePaar(req: Request, verzoek: PaarVerzoek): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  const model = Deno.env.get('STYLIST_MODEL') ?? STANDAARD_MODEL;

  if (!supabaseUrl || !serviceKey) {
    return antwoord(req, { ok: false, reason: 'Serverconfiguratie ontbreekt' } as PaarAntwoord, 500);
  }
  if (!heeftServiceRole(req, serviceKey)) {
    return antwoord(req, { ok: false, reason: 'pair-modus vereist de service role' } as PaarAntwoord, 401);
  }
  if (!apiKey) {
    return antwoord(req, { ok: false, reason: 'ANTHROPIC_API_KEY ontbreekt' } as PaarAntwoord, 500);
  }

  const { segment, axis, waarde_a, waarde_b } = verzoek;
  const band = BAND_GRENZEN[segment.price_band as Prijsband];
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function kandidatenVoor(waarde: string): Promise<Kandidaat[]> {
    const axes = legeAssen();
    axes[axis] = { value: axis === 'formality' ? Number(waarde) : waarde, confidence: 1 };
    const { data, error } = await admin.rpc('get_kandidaten', {
      p_gender: segment.gender,
      p_occasions: [segment.occasion],
      p_budget_min: band.min,
      p_budget_max: band.max,
      p_axes: axes,
      p_liked_ids: [],
      p_disliked_ids: [],
      p_per_category: PER_CATEGORIE,
    });
    if (error) throw new Error(`get_kandidaten: ${error.message}`);
    return ((data ?? []) as Kandidaat[]).filter((k) => draagtDeWaarde(k, waarde));
  }

  /**
   * Hoort dit item bij deze kant?
   *
   * Een lege waarde op de as sluit het item uit, aan beide kanten. Liet je hem
   * door, dan stond hetzelfde item in allebei de kandidatenlijsten, koos het
   * model het aan beide kanten, en verwierp valideerPaar het paar pas achteraf
   * met "staat aan beide kanten". Dat is een herkansing die niets oplevert en
   * wel geld kost.
   *
   * shoe_type is de uitzondering: die as bestaat alleen voor footwear. Een top
   * zegt er niets over en mag dus aan beide kanten staan; een schoen zonder
   * shoe_type valt af.
   */
  function draagtDeWaarde(k: Kandidaat, waarde: string): boolean {
    if (axis === 'shoe_type') return k.category !== 'footwear' || k.attrs.shoe_type === waarde;
    if (axis === 'formality') return k.attrs.formality !== null && String(k.attrs.formality) === waarde;
    return k.attrs[axis] === waarde;
  }

  const start = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const [kandidatenA, kandidatenB] = await Promise.all([kandidatenVoor(waarde_a), kandidatenVoor(waarde_b)]);
    for (const [naam, lijst] of [['a', kandidatenA], ['b', kandidatenB]] as const) {
      if (lijst.length === 0) {
        return antwoord(req, {
          ok: false,
          reason: `geen kandidaten voor kant ${naam} (${axis} = ${naam === 'a' ? waarde_a : waarde_b})`,
        } as PaarAntwoord);
      }
    }

    // Na de filtering is overlap tussen de twee lijsten alleen nog mogelijk op
    // shoe_type, waar items zonder schoen-rol bewust aan beide kanten horen.
    // Het getal gaat mee in de foutreden, zodat genereer-paren.ts (taak 8)
    // "geen kandidaten voor deze kant" en "kandidaten overlappen tussen de
    // kanten" uit elkaar kan houden.
    const idsA = new Set(kandidatenA.map((k) => k.product_id));
    const overlap = kandidatenB.filter((k) => idsA.has(k.product_id)).length;

    const eerste = await vraagPaar(apiKey, model, segment, axis, waarde_a, waarde_b, kandidatenA, kandidatenB, []);
    inputTokens += eerste.input_tokens;
    outputTokens += eerste.output_tokens;
    let uitkomst = valideerPaar(eerste.ruw, kandidatenA, kandidatenB, axis, waarde_a, waarde_b, band);

    if (!uitkomst.kanten) {
      console.warn('[compose-outfits:pair] herkansing na fouten:', uitkomst.fouten);
      const tweede = await vraagPaar(
        apiKey, model, segment, axis, waarde_a, waarde_b, kandidatenA, kandidatenB, uitkomst.fouten
      );
      inputTokens += tweede.input_tokens;
      outputTokens += tweede.output_tokens;
      uitkomst = valideerPaar(tweede.ruw, kandidatenA, kandidatenB, axis, waarde_a, waarde_b, band);
    }

    if (!uitkomst.kanten) {
      console.error('[compose-outfits:pair] verworpen:', uitkomst.fouten);
      const beideKanten = uitkomst.fouten.some((f) => f.includes('staat aan beide kanten'));
      return antwoord(req, {
        ok: false,
        reason: beideKanten
          ? `kandidaten overlappen tussen de kanten (${overlap} van ${kandidatenA.length} en ${kandidatenB.length}): ${uitkomst.fouten.join('; ')}`
          : `na twee pogingen ongeldig: ${uitkomst.fouten.join('; ')}`,
      } as PaarAntwoord);
    }

    const kanten = uitkomst.kanten;
    const productIds = kanten.flatMap((k) => k.items.map((i) => i.product_id)).sort();
    const sleutel = segmentKey(segment);
    const pairId = (await sha256Hex(`${sleutel}|${axis}|${productIds.join(',')}`)).slice(0, 32);

    const pair: PairSet = {
      pair_id: pairId,
      segment_key: sleutel,
      gender: segment.gender,
      occasion: segment.occasion,
      price_band: segment.price_band,
      axis,
      kanten,
    };

    const { error: schrijfFout } = await admin.from('pair_sets').upsert(
      {
        pair_id: pairId,
        segment_key: sleutel,
        gender: segment.gender,
        occasion: segment.occasion,
        price_band: segment.price_band,
        axis,
        kanten,
        product_ids: productIds,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
      { onConflict: 'pair_id' }
    );
    if (schrijfFout) {
      return antwoord(req, { ok: false, reason: `opslaan mislukt: ${schrijfFout.message}` } as PaarAntwoord);
    }

    const uit: PaarAntwoord = {
      ok: true,
      pair,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      latency_ms: Date.now() - start,
      paar_versie: PAAR_VERSIE,
    };
    return antwoord(req, uit);
  } catch (err) {
    const reden = err instanceof Error ? err.message : String(err);
    console.error('[compose-outfits:pair] mislukt:', reden, `(${inputTokens} in, ${outputTokens} uit)`);
    return antwoord(req, { ok: false, reason: reden } as PaarAntwoord);
  }
}
```

- [ ] **Stap 3: Schrijf de leesmodus**

Maak `supabase/functions/compose-outfits/lees.ts`:

```typescript
/**
 * Leesmodus van compose-outfits (besluit 7 in "Wat de spec openlaat").
 *
 * Geeft de outfits terug die voor een profile_hash in outfit_sets staan, zonder
 * profiel, zonder kandidaten en zonder modelaanroep. Dit is het pad van een
 * gedeelde link naar /results?v=2, van een tweede toestel en van een herlaad na
 * het wissen van localStorage: taste_profiles heeft geen select-policy, dus de
 * browser kan het profiel niet zelf terughalen.
 *
 * Wat eruit komt zijn outfits met catalogusdata. Het geslacht, het budget, de
 * no-go's en de keuzes blijven in taste_profiles.
 *
 * Poort voor dit bestand: `npm run check:edge` (deno check). tsc ziet het niet.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { STYLIST_VERSION } from '../_shared/stylist-prompt.ts';
import type { VerrijkteOutfit } from '../_shared/keten-types.ts';

/** sha256-hex uit spec 5.2.1; alles wat hier niet aan voldoet komt niet verder. */
export const HASH_PATROON = /^[0-9a-f]{64}$/;

/** Zelfde levensduur als de cache-tak van compose-outfits (plan 3 taak 6). */
const CACHE_MAX_LEEFTIJD_DAGEN = 14;
const DAG_MS = 24 * 60 * 60 * 1000;

export interface LeesVerzoek {
  mode: 'lees';
  profile_hash: string;
}

export type LeesAntwoord =
  | {
      ok: true;
      profile_hash: string;
      stylist_version: string;
      source: 'cache';
      model: string | null;
      outfits: VerrijkteOutfit[];
    }
  | { ok: false; reason: string };

function antwoord(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildCorsHeaders(req, { 'Content-Type': 'application/json' }),
  });
}

export function isLeesVerzoek(x: unknown): x is LeesVerzoek {
  if (typeof x !== 'object' || x === null) return false;
  const v = x as LeesVerzoek;
  return v.mode === 'lees' && typeof v.profile_hash === 'string' && HASH_PATROON.test(v.profile_hash);
}

function productIdsVan(outfits: VerrijkteOutfit[]): string[] {
  const uit = new Set<string>();
  for (const o of outfits) for (const i of o.items) uit.add(i.product_id);
  return [...uit];
}

export async function handleLees(req: Request, verzoek: LeesVerzoek): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return antwoord(req, { ok: false, reason: 'Serverconfiguratie ontbreekt' } as LeesAntwoord, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const grens = new Date(Date.now() - CACHE_MAX_LEEFTIJD_DAGEN * DAG_MS).toISOString();
  const { data, error } = await admin
    .from('outfit_sets')
    .select('outfits, model')
    .eq('profile_hash', verzoek.profile_hash)
    .eq('stylist_version', STYLIST_VERSION)
    .gte('created_at', grens)
    .maybeSingle();

  if (error) {
    console.error('[compose-outfits:lees] lezen mislukt:', error.message);
    return antwoord(req, { ok: false, reason: 'outfits lezen mislukt' } as LeesAntwoord, 500);
  }
  if (!data) {
    return antwoord(req, { ok: false, reason: 'niet gevonden' } as LeesAntwoord, 404);
  }

  const outfits = (data.outfits ?? []) as VerrijkteOutfit[];
  const ids = productIdsVan(outfits);
  const { data: opVoorraad, error: voorraadFout } = await admin
    .from('products')
    .select('id')
    .in('id', ids)
    .eq('in_stock', true);

  // Bij een databasefout de set toch teruggeven: alleen een echte
  // voorraadwijziging is een reden om hem te weigeren. Zelfde afweging als de
  // cache-tak in plan 3 taak 6.
  if (!voorraadFout && (opVoorraad ?? []).length !== ids.length) {
    console.warn(
      '[compose-outfits:lees] set verworpen:',
      ids.length - (opVoorraad ?? []).length,
      'product(en) niet meer op voorraad'
    );
    return antwoord(req, { ok: false, reason: 'niet gevonden' } as LeesAntwoord, 404);
  }
  if (voorraadFout) {
    console.error('[compose-outfits:lees] voorraadcontrole mislukt, set toch gegeven:', voorraadFout.message);
  }

  const uit: LeesAntwoord = {
    ok: true,
    profile_hash: verzoek.profile_hash,
    stylist_version: STYLIST_VERSION,
    source: 'cache',
    model: (data.model as string | null) ?? null,
    outfits,
  };
  return antwoord(req, uit);
}
```

- [ ] **Stap 4: Haak de twee modi in `index.ts`**

Controleer eerst dat het anker precies een keer voorkomt:

```bash
grep -c "if (!isVerzoek(verzoek)) {" supabase/functions/compose-outfits/index.ts
```

Verwacht: `1`. Voeg bij de imports bovenaan `index.ts` toe:

```typescript
import { handlePaar, isPaarVerzoek } from './paar.ts';
import { handleLees, isLeesVerzoek } from './lees.ts';
```

En zet direct **boven** de regel `if (!isVerzoek(verzoek)) {`:

```typescript
  // Twee extra modi (plan 4 taak 7). Bewust voor de isVerzoek-controle, want
  // geen van beide heeft een profile, profile_hash plus kandidaten zoals de
  // gewone modus (spec 5.4).
  const modus = typeof verzoek === 'object' && verzoek !== null ? (verzoek as { mode?: unknown }).mode : undefined;

  // Pair-modus (spec 7.2): een dit-of-dat-paar bouwen voor pair_sets. Alleen
  // bereikbaar met de service role; die controle staat in handlePaar.
  if (modus === 'pair') {
    if (!isPaarVerzoek(verzoek)) {
      return antwoord(req, { ok: false, reason: 'Verwacht { mode, segment, axis, waarde_a, waarde_b }' }, 400);
    }
    return await handlePaar(req, verzoek);
  }

  // Leesmodus (besluit 7): de gecachete outfits bij een profile_hash, voor een
  // gedeelde link naar /results?v=2. Geen modelaanroep, dus ook bereikbaar met
  // de anon key.
  if (modus === 'lees') {
    if (!isLeesVerzoek(verzoek)) {
      return antwoord(req, { ok: false, reason: 'Verwacht { mode: "lees", profile_hash } met 64 hex-tekens' }, 400);
    }
    return await handleLees(req, verzoek);
  }

```

- [ ] **Stap 5: Typecheck met Deno en deploy**

```bash
npm run check:edge
supabase functions deploy compose-outfits
```

Verwacht: `check:edge` controleert nu ook `paar-types.ts`, `paar-prompt.ts`, `compose-outfits/paar.ts` en `compose-outfits/lees.ts` en geeft exitcode 0. De deploy meldt `Deployed Functions on project wojexzgjyhijuxzperhq: compose-outfits`. Fouten bij `check:edge` zijn echte typefouten in de Deno-code; los ze op voordat je deployt.

- [ ] **Stap 6: Draai de rooktest van de pair-modus opnieuw en zie hem slagen**

```bash
set -a; source .env; set +a
SERVICE="$(supabase projects api-keys --project-ref "$(cat supabase/.temp/project-ref)" -o json | grep -o '"api_key":"[^"]*"' | tail -1 | cut -d'"' -f4)"
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"mode":"pair","segment":{"gender":"female","occasion":"work","price_band":"50tot100"},"axis":"pattern","waarde_a":"effen","waarde_b":"statement"}'
echo
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $SERVICE" -H "apikey: $SERVICE" -H "Content-Type: application/json" \
  -d '{"mode":"pair","segment":{"gender":"female","occasion":"work","price_band":"50tot100"},"axis":"pattern","waarde_a":"effen","waarde_b":"effen"}'
echo
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $SERVICE" -H "apikey: $SERVICE" -H "Content-Type: application/json" \
  -d '{"mode":"pair","segment":{"gender":"female","occasion":"work","price_band":"50tot100"},"axis":"pattern","waarde_a":"effen","waarde_b":"statement"}' \
  | head -c 600
```

Verwacht, regel voor regel:
1. `{"ok":false,"reason":"pair-modus vereist de service role"}` met status 401. De bezoeker kan deze modus niet aanroepen en er wordt geen model gebruikt.
2. `{"ok":false,"reason":"Verwacht { mode, segment, axis, waarde_a, waarde_b }"}`: twee keer dezelfde waarde is geen paar.
3. Een echte aanroep. Bij succes begint het antwoord met `{"ok":true,"pair":{"pair_id":"` gevolgd door 32 hex-tekens, en staan er twee kanten met elk drie tot vijf items. Bij `{"ok":false,"reason":"geen kandidaten voor kant ..."}` heeft dat segment te weinig aanbod; kies een andere gelegenheid of band. Bij `{"ok":false,"reason":"na twee pogingen ongeldig: ..."}` staan de validatiefouten erbij; dat is de informatie die taak 8 in zijn rapport zet. Deze ene aanroep kost circa 0,03 dollar.

Controleer de rij in de database:

```bash
supabase db query --linked "select pair_id, segment_key, axis, array_length(product_ids, 1) as items, input_tokens, output_tokens from pair_sets order by created_at desc limit 3" -o table
supabase db query --linked "select count(*) as paren, (select count(*) from pair_sets_op_voorraad) as bruikbaar from pair_sets" -o table
```

Verwacht: een rij met `axis = pattern`, `items` tussen 6 en 10, en gevulde tokenkolommen; en `paren = bruikbaar` zolang alle producten op voorraad zijn.

- [ ] **Stap 7: Rooktest van de leesmodus**

De leesmodus heeft een `profile_hash` nodig die al in `outfit_sets` staat. Plan 3 taak 8 zet die rijen erin met `npm run keten:personas -- --keten=stylist`; heb je die nog niet, draai hem dan eerst.

```bash
set -a; source .env; set +a
H="$(supabase db query --linked "select profile_hash from outfit_sets order by created_at desc limit 1" -o csv | tail -1 | tr -d '\r')"
echo "hash: $H"
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d "{\"mode\":\"lees\",\"profile_hash\":\"$H\"}" | head -c 300
echo
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"mode":"lees","profile_hash":"'"$(printf 'a%.0s' $(seq 1 64))"'"}'
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/compose-outfits" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"mode":"lees","profile_hash":"te-kort"}'
```

Verwacht, regel voor regel:
1. Een hash van 64 hex-tekens uit `outfit_sets`.
2. Een antwoord dat begint met `{"ok":true,"profile_hash":"` en verderop `"source":"cache"` en de outfits bevat. Er is geen modelaanroep gedaan: de functielogs tonen geen regel van de stylist en er komen geen tokens bij.
3. `404` voor een hash die niet bestaat; dat is de expliciete "niet gevonden".
4. `{"ok":false,"reason":"Verwacht { mode: \"lees\", profile_hash } met 64 hex-tekens"}` met status 400 voor een hash met de verkeerde vorm.

Komt bij punt 2 `{"ok":false,"reason":"niet gevonden"}`, controleer dan of de rij ouder is dan veertien dagen of een uitverkocht product bevat:

```bash
supabase db query --linked "select left(profile_hash, 8) as hash, stylist_version, created_at from outfit_sets order by created_at desc limit 3" -o table
```

- [ ] **Stap 8: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add supabase/functions/compose-outfits/paar.ts supabase/functions/compose-outfits/lees.ts supabase/functions/compose-outfits/index.ts
git commit -m "feat(keten): pair-modus en leesmodus in compose-outfits

Pair: twee keer get_kandidaten met de as op de ene en op de andere waarde, en
per kant alleen items die die waarde echt dragen. Het verschil zit in de
invoer, niet in een instructie. pair_id is deterministisch uit segment, as en
gesorteerde product_ids, dus opnieuw genereren maakt geen duplicaten.

Lees: een profile_hash geeft de gecachete outfits terug zonder profiel en
zonder modelaanroep, zodat een gedeelde link naar /results?v=2 werkt terwijl
taste_profiles dicht blijft.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Sluit de shell waarin `$SERVICE` stond.

---

### Taak 8: Script `genereer-paren.ts` met droogloop, plafond en opruimen

**Bestanden:**
- Aanmaken: `scripts/keten/genereer-paren.ts`
- Wijzigen: `package.json` (blok `scripts`; na de regel `"design:poort": "vite-node scripts/keten/design-poort.ts",` uit taak 0)
- Test: `scripts/keten/__tests__/genereer-paren.test.ts`; daarnaast de droogloop in stap 5 en de controle-queries in stap 7

**Interfaces:**
- Gebruikt:
  - `leesEnv(): Record<string, string>` uit `scripts/keten/env.ts` (plan 2), met `VITE_SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY`.
  - `heeftVlag(naam: string): boolean` en `leesVlag(naam: string): string | undefined` uit `scripts/keten/args.ts` (plan 2).
  - `createClient` uit `@supabase/supabase-js`.
  - `AS_NAMEN`, `GELEGENHEDEN`, `AsNaam`, `Gelegenheid`, `Geslacht` uit `src/keten/types`; `AS_WAARDEN`, `BANDEN` (taak 2 en 5), `PaarSegment`, `Prijsband`, `segmentKey`.
  - De pair-modus van `compose-outfits` (taak 7).
- Levert:
  ```typescript
  const PAREN_PER_AS = 4
  const STANDAARD_MAX_AANROEPEN = 150
  const KOSTEN_PER_AANROEP = 0.026
  const AS_CONTRASTEN: Record<AsNaam, ReadonlyArray<readonly [string, string]>>
  type FoutSoort = 'geen-kandidaten' | 'overlap' | 'overig'
  const FOUT_SOORTEN: readonly FoutSoort[]
  const FOUT_UITLEG: Record<FoutSoort, string>
  function classificeerFout(reden: string): FoutSoort
  interface Opdracht { segment: PaarSegment; axis: AsNaam; aanwezig: number; nodig: number }
  function segmentenUit(opties: { gender?: string; gelegenheid?: string; band?: string }): PaarSegment[]
  function planOpdrachten(segmenten: PaarSegment[], aanwezig: Map<string, number>): Opdracht[]
  function runGenereerParen(): Promise<boolean>
  ```
  En `npm run keten:paren -- <vlaggen>`.

Ruling 2, letterlijk in dit script: er komt geen cron die paren opnieuw genereert als een item uit voorraad gaat. De view `pair_sets_op_voorraad` laat zulke paren weg bij het ophalen, en dit script vult handmatig bij wanneer er te weinig bruikbare paren overblijven. De controle-query in stap 5 telt dat per segment; die query is het signaal om dit script weer te draaien.

Kosten, uit de sectie Kosten bovenaan: circa 0,026 dollar per geldig paar, 0,052 in het slechtste geval. Daarom drie remmen, alle drie in dit script en niet in de edge function (besluit 3):
1. De eerste run moet een droogloop zijn; zonder `--droogloop` of `--uitvoeren` doet het script niets.
2. Meer dan een prijsband of meer dan een geslacht tegelijk vereist `--alles`.
3. `--max-aanroepen` (standaard 150, dus hooguit circa 8 dollar) kapt elke run af.

- [ ] **Stap 1: Controleer de aannames over plan 2**

```bash
grep -n "export function leesEnv" scripts/keten/env.ts
grep -n "export function heeftVlag\|export function leesVlag" scripts/keten/args.ts
```

Verwacht: `leesEnv` zonder verplichte parameters, `heeftVlag(naam: string): boolean` en `leesVlag(naam: string)` die de waarde achter `--naam=` teruggeeft. Wijken de signaturen af, pas dan de aanroepen in stap 2 aan de echte signaturen aan; verander plan 2 niet.

- [ ] **Stap 2: Schrijf de falende test voor de contrasten en de foutsoorten**

Maak `scripts/keten/__tests__/genereer-paren.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { AS_CONTRASTEN, PAREN_PER_AS, classificeerFout, segmentenUit } from '../genereer-paren';
import { AS_NAMEN, AS_SOORT, AS_WAARDEN } from '../../../src/keten/types';

describe('AS_CONTRASTEN', () => {
  it('kent elke as en gebruikt alleen waarden uit AS_WAARDEN', () => {
    for (const as of AS_NAMEN) {
      const contrasten = AS_CONTRASTEN[as];
      expect(contrasten.length).toBeGreaterThan(0);
      for (const [a, b] of contrasten) {
        expect(AS_WAARDEN[as]).toContain(a);
        expect(AS_WAARDEN[as]).toContain(b);
        expect(a).not.toBe(b);
      }
    }
  });

  it('geeft een nominale as precies een contrast', () => {
    // berekenAxes (taak 2) telt een nominale as per waarde. Dat klopt alleen
    // als elk paar op die as hetzelfde waardepaar contrasteert; met twee
    // contrasten verdeelt een consistente bezoeker zijn stemmen over meer
    // waarden en zakt zijn zekerheid, terwijl hij juist consistent was.
    for (const as of AS_NAMEN) {
      if (AS_SOORT[as] !== 'nominaal') continue;
      expect(AS_CONTRASTEN[as]).toHaveLength(1);
    }
  });

  it('geeft een ordinale as meer dan een contrast', () => {
    // Anders meet je met vier paren een keer wat je vier keer vraagt.
    for (const as of AS_NAMEN) {
      if (AS_SOORT[as] !== 'ordinaal') continue;
      expect(AS_CONTRASTEN[as].length).toBeGreaterThan(1);
    }
    expect(PAREN_PER_AS).toBe(4);
  });
});

describe('segmentenUit', () => {
  it('telt drie geslachten, zeven gelegenheden en drie banden', () => {
    const alles = segmentenUit({});
    expect(alles).toHaveLength(63);
    expect(new Set(alles.map((s) => s.gender))).toEqual(new Set(['female', 'male', 'unisex']));
  });

  it('filtert op wat je meegeeft', () => {
    expect(segmentenUit({ gender: 'unisex', gelegenheid: 'work', band: 'tot50' })).toEqual([
      { gender: 'unisex', occasion: 'work', price_band: 'tot50' },
    ]);
  });
});

describe('classificeerFout', () => {
  it('scheidt een leeg segment van overlappende kandidaten', () => {
    expect(classificeerFout('geen kandidaten voor kant a (pattern = effen)')).toBe('geen-kandidaten');
    expect(
      classificeerFout('kandidaten overlappen tussen de kanten (12 van 30 en 28): x staat aan beide kanten')
    ).toBe('overlap');
    expect(classificeerFout('na twee pogingen ongeldig: kant a: niet compleet')).toBe('overig');
    expect(classificeerFout('Anthropic antwoordde niet binnen 45 s')).toBe('overig');
  });
});
```

```bash
npx vitest run scripts/keten/__tests__/genereer-paren.test.ts
```

Verwacht: `Failed to resolve import "../genereer-paren"`.

- [ ] **Stap 3: Schrijf het script**

Maak `scripts/keten/genereer-paren.ts`:

```typescript
/**
 * Vult pair_sets met dit-of-dat-paren (spec 7.2).
 *
 * Per segment (geslacht x gelegenheid x prijsband) en per as minstens vier
 * paren. Het script telt eerst hoeveel bruikbare paren er al staan, via de view
 * pair_sets_op_voorraad, en vraagt alleen het verschil aan bij de pair-modus
 * van compose-outfits (taak 7).
 *
 * Geen cron. Spec 7.2 vroeg om regeneratie als een item uit voorraad gaat;
 * daar is bewust van afgezien. De view laat zulke paren vanzelf weg, en dit
 * script draai je opnieuw als de controle-query onderaan meldt dat een segment
 * onder PAREN_PER_AS zakt.
 *
 * Gebruik:
 *   npm run keten:paren -- --droogloop
 *   npm run keten:paren -- --uitvoeren --gender=female --gelegenheid=work --band=50tot100
 *   npm run keten:paren -- --uitvoeren --alles --max-aanroepen=150
 *   npm run keten:paren -- --opruimen --ja
 *
 * Credentials: VITE_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY uit de omgeving
 * of uit .env in de repo-root. Waarden worden nooit gelogd.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { leesEnv } from './env';
import { heeftVlag, leesVlag } from './args';
import { AS_NAMEN, GELEGENHEDEN, type AsNaam, type Gelegenheid, type Geslacht } from '../../src/keten/types';
import { AS_WAARDEN, segmentKey, type PaarSegment, type Prijsband } from '../../src/keten/types';
import { BANDEN } from '../../src/keten/kandidatenStart';

/** Spec 7.2: per as minstens vier paren. */
export const PAREN_PER_AS = 4;
export const STANDAARD_MAX_AANROEPEN = 150;
/** Uit de sectie Kosten: circa 0,026 dollar per geldig paar bij de eerste poging. */
export const KOSTEN_PER_AANROEP = 0.026;

/**
 * Alle drie de geslachten uit spec 6 stap 1: dames, heren en beide (unisex).
 * Zonder unisex-rijen in pair_sets loopt een bezoeker die bij stap 1 "Beide"
 * kiest na vier stappen vast op te weinig paren, en dat gaat vanzelf nooit over.
 * Unisex hoort dus bij de eerste volle run en is geen latere uitbreiding.
 */
const GESLACHTEN: readonly Geslacht[] = ['female', 'male', 'unisex'];

/**
 * De contrasten per as, in vaste volgorde, met alleen waarden uit AS_WAARDEN.
 *
 * Bij een ordinale as moeten vier paren niet vier keer hetzelfde contrast zijn,
 * anders meet je een keer wat je vier keer vraagt. berekenAxes (taak 2) kan
 * daarmee overweg: hij leest zo'n as als een schaal en telt richtingen, dus
 * 4 boven 2 en 5 boven 3 tellen allebei als "formeler". Heeft een as minder dan
 * vier contrasten, dan begint de lijst opnieuw; het model krijgt dan andere
 * producten en dus een ander paar.
 *
 * Bij een nominale as (shoe_type) mag er precies een contrast staan. Daar telt
 * berekenAxes per waarde, en met twee contrasten zou een consistente bezoeker
 * zijn stemmen over meer waarden verdelen en zekerheid verliezen. De test in
 * stap 2 faalt zodra een nominale as er meer krijgt.
 */
export const AS_CONTRASTEN: Record<AsNaam, ReadonlyArray<readonly [string, string]>> = {
  formality: [['2', '4'], ['3', '5'], ['1', '3'], ['2', '5']],
  silhouette: [['slim', 'relaxed'], ['regular', 'oversized'], ['slim', 'oversized'], ['regular', 'relaxed']],
  color_temp: [['koel', 'warm'], ['koel', 'neutraal'], ['neutraal', 'warm']],
  lightness: [['licht', 'donker'], ['licht', 'medium'], ['medium', 'donker']],
  pattern: [['effen', 'statement'], ['effen', 'subtiel'], ['subtiel', 'statement']],
  shoe_type: [['sneaker', 'net']],
};

export type FoutSoort = 'geen-kandidaten' | 'overlap' | 'overig';

export const FOUT_SOORTEN: readonly FoutSoort[] = ['geen-kandidaten', 'overlap', 'overig'];

/**
 * Wat een mislukking betekent, zodat het slotrapport het onderscheid maakt:
 *
 * geen-kandidaten: dat segment heeft geen items met die as-waarde. Dat is een
 *   gat in de tagging van plan 2, niet in dit script; opnieuw draaien helpt niet.
 * overlap: de twee kandidatenlijsten deelden items en het model zette hetzelfde
 *   product aan beide kanten. Sinds taak 7 items met een lege as-waarde uitsluit
 *   kan dat alleen nog op shoe_type, waar items zonder schoen-rol bewust aan
 *   beide kanten horen. Opnieuw draaien kan helpen, de tagging aanvullen ook.
 * overig: een storing, een tijdslimiet, of een paar dat twee keer de validatie
 *   niet haalde. Opnieuw draaien mag.
 */
export const FOUT_UITLEG: Record<FoutSoort, string> = {
  'geen-kandidaten': 'geen kandidaten voor deze kant (tagging, plan 2)',
  overlap: 'kandidaten overlappen tussen de kanten',
  overig: 'overig',
};

export function classificeerFout(reden: string): FoutSoort {
  if (reden.includes('geen kandidaten voor kant')) return 'geen-kandidaten';
  if (reden.includes('kandidaten overlappen tussen de kanten')) return 'overlap';
  return 'overig';
}

export interface Opdracht {
  segment: PaarSegment;
  axis: AsNaam;
  aanwezig: number;
  nodig: number;
}

export function segmentenUit(opties: { gender?: string; gelegenheid?: string; band?: string }): PaarSegment[] {
  const genders = opties.gender ? GESLACHTEN.filter((g) => g === opties.gender) : GESLACHTEN;
  const gelegenheden = opties.gelegenheid
    ? GELEGENHEDEN.filter((o) => o === opties.gelegenheid)
    : GELEGENHEDEN;
  const banden = opties.band ? BANDEN.filter((b) => b === opties.band) : BANDEN;

  const uit: PaarSegment[] = [];
  for (const gender of genders) {
    for (const occasion of gelegenheden as readonly Gelegenheid[]) {
      for (const price_band of banden as readonly Prijsband[]) {
        uit.push({ gender, occasion, price_band });
      }
    }
  }
  return uit;
}

/** Wat er nog moet gebeuren: per segment en as het verschil tussen PAREN_PER_AS en wat er staat. */
export function planOpdrachten(segmenten: PaarSegment[], aanwezig: Map<string, number>): Opdracht[] {
  const uit: Opdracht[] = [];
  for (const segment of segmenten) {
    for (const axis of AS_NAMEN) {
      const sleutel = `${segmentKey(segment)}|${axis}`;
      const staat = aanwezig.get(sleutel) ?? 0;
      if (staat >= PAREN_PER_AS) continue;
      uit.push({ segment, axis, aanwezig: staat, nodig: PAREN_PER_AS - staat });
    }
  }
  return uit;
}

async function telAanwezig(client: SupabaseClient, segmenten: PaarSegment[]): Promise<Map<string, number>> {
  const telling = new Map<string, number>();
  const sleutels = [...new Set(segmenten.map(segmentKey))];
  for (let i = 0; i < sleutels.length; i += 50) {
    const blok = sleutels.slice(i, i + 50);
    const { data, error } = await client
      .from('pair_sets_op_voorraad')
      .select('segment_key, axis')
      .in('segment_key', blok);
    if (error) throw new Error(`pair_sets_op_voorraad: ${error.message}`);
    for (const rij of (data ?? []) as Array<{ segment_key: string; axis: string }>) {
      const sleutel = `${rij.segment_key}|${rij.axis}`;
      telling.set(sleutel, (telling.get(sleutel) ?? 0) + 1);
    }
  }
  return telling;
}

interface PaarUitkomst {
  ok: boolean;
  reason?: string;
  pair?: { pair_id: string };
  input_tokens?: number;
  output_tokens?: number;
  latency_ms?: number;
}

async function vraagPaarAan(
  functionsUrl: string,
  serviceKey: string,
  segment: PaarSegment,
  axis: AsNaam,
  waardeA: string,
  waardeB: string
): Promise<PaarUitkomst> {
  try {
    const res = await fetch(`${functionsUrl}/compose-outfits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ mode: 'pair', segment, axis, waarde_a: waardeA, waarde_b: waardeB }),
    });
    if (!res.ok && res.status !== 200) {
      const tekst = (await res.text()).slice(0, 200);
      return { ok: false, reason: `compose-outfits ${res.status}: ${tekst}` };
    }
    return (await res.json()) as PaarUitkomst;
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

async function opruimen(client: SupabaseClient, echt: boolean): Promise<void> {
  const { data: alles, error: f1 } = await client.from('pair_sets').select('pair_id');
  if (f1) throw new Error(`pair_sets: ${f1.message}`);
  const { data: bruikbaar, error: f2 } = await client.from('pair_sets_op_voorraad').select('pair_id');
  if (f2) throw new Error(`pair_sets_op_voorraad: ${f2.message}`);

  const goed = new Set((bruikbaar ?? []).map((r) => (r as { pair_id: string }).pair_id));
  const weg = (alles ?? []).map((r) => (r as { pair_id: string }).pair_id).filter((id) => !goed.has(id));

  console.log(`opruimen: ${weg.length} van ${(alles ?? []).length} paren hebben een uitverkocht item`);
  if (weg.length === 0) return;
  if (!echt) {
    console.log('Niets verwijderd. Draai opnieuw met --opruimen --ja om ze echt weg te halen.');
    return;
  }
  for (let i = 0; i < weg.length; i += 100) {
    const { error } = await client.from('pair_sets').delete().in('pair_id', weg.slice(i, i + 100));
    if (error) throw new Error(`verwijderen mislukt: ${error.message}`);
  }
  console.log(`${weg.length} paren verwijderd.`);
}

async function rapporteer(client: SupabaseClient, segmenten: PaarSegment[]): Promise<void> {
  const telling = await telAanwezig(client, segmenten);
  const perSegment = new Map<string, number>();
  for (const [sleutel, aantal] of telling) {
    const segment = sleutel.slice(0, sleutel.lastIndexOf('|'));
    perSegment.set(segment, (perSegment.get(segment) ?? 0) + aantal);
  }
  console.log('\nBruikbare paren per segment (view pair_sets_op_voorraad):');
  for (const segment of [...new Set(segmenten.map(segmentKey))].sort()) {
    const totaal = perSegment.get(segment) ?? 0;
    const assenOnder = AS_NAMEN.filter((as) => (telling.get(`${segment}|${as}`) ?? 0) < PAREN_PER_AS);
    const vlag = totaal === 0 ? 'LEEG' : assenOnder.length > 0 ? `${assenOnder.length} assen onder ${PAREN_PER_AS}` : 'compleet';
    console.log(`  ${segment.padEnd(28)} ${String(totaal).padStart(3)}  ${vlag}`);
  }
}

export async function runGenereerParen(): Promise<boolean> {
  const env = leesEnv();
  const url = process.env.VITE_SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Geen credentials. Zet VITE_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in je omgeving of in .env.');
    return false;
  }
  const client = createClient(url, serviceKey, { auth: { persistSession: false } });
  const functionsUrl = `${url}/functions/v1`;

  if (heeftVlag('opruimen')) {
    await opruimen(client, heeftVlag('ja'));
    return true;
  }

  const opties = {
    gender: leesVlag('gender'),
    gelegenheid: leesVlag('gelegenheid'),
    band: leesVlag('band'),
  };
  const segmenten = segmentenUit(opties);
  if (segmenten.length === 0) {
    console.error('Geen segmenten. Controleer --gender, --gelegenheid en --band.');
    return false;
  }

  const banden = new Set(segmenten.map((s) => s.price_band));
  const genders = new Set(segmenten.map((s) => s.gender));
  if ((banden.size > 1 || genders.size > 1) && !heeftVlag('alles')) {
    console.error(
      `Dit zou ${segmenten.length} segmenten raken (${genders.size} geslachten, ${banden.size} prijsbanden).\n` +
        'Beperk met --gender=, --gelegenheid= en --band=, of bevestig met --alles.'
    );
    return false;
  }

  const maxAanroepen = Number(leesVlag('max-aanroepen') ?? STANDAARD_MAX_AANROEPEN);
  if (!Number.isFinite(maxAanroepen) || maxAanroepen < 1) {
    console.error('--max-aanroepen moet een getal boven 0 zijn.');
    return false;
  }

  const aanwezig = await telAanwezig(client, segmenten);
  const opdrachten = planOpdrachten(segmenten, aanwezig);
  const teDoen = opdrachten.reduce((som, o) => som + o.nodig, 0);
  const gepland = Math.min(teDoen, maxAanroepen);

  console.log(`Segmenten: ${segmenten.length}. Assen met tekort: ${opdrachten.length}. Paren te maken: ${teDoen}.`);
  console.log(`Plafond: ${maxAanroepen} aanroepen. Deze run: ${gepland}.`);
  console.log(`Geschatte kosten: ${(gepland * KOSTEN_PER_AANROEP).toFixed(2)} dollar (slechtste geval het dubbele).`);
  for (const o of opdrachten.slice(0, 20)) {
    console.log(`  ${segmentKey(o.segment).padEnd(28)} ${o.axis.padEnd(11)} heeft ${o.aanwezig}, maakt ${o.nodig}`);
  }
  if (opdrachten.length > 20) console.log(`  ... en ${opdrachten.length - 20} regels meer`);

  if (!heeftVlag('uitvoeren')) {
    console.log('\nDroogloop. Er is niets aangeroepen en niets geschreven.');
    console.log('Draai opnieuw met --uitvoeren om de paren echt te maken.');
    await rapporteer(client, segmenten);
    return true;
  }

  let aanroepen = 0;
  let gelukt = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  const mislukt: string[] = [];

  for (const opdracht of opdrachten) {
    const contrasten = AS_CONTRASTEN[opdracht.axis];
    for (let i = 0; i < opdracht.nodig; i++) {
      if (aanroepen >= maxAanroepen) {
        console.log(`\nPlafond van ${maxAanroepen} aanroepen bereikt. Gestopt.`);
        break;
      }
      const [waardeA, waardeB] = contrasten[(opdracht.aanwezig + i) % contrasten.length];
      aanroepen++;
      const label = `${segmentKey(opdracht.segment)} ${opdracht.axis} ${waardeA}/${waardeB}`;
      const uitkomst = await vraagPaarAan(functionsUrl, serviceKey, opdracht.segment, opdracht.axis, waardeA, waardeB);
      inputTokens += uitkomst.input_tokens ?? 0;
      outputTokens += uitkomst.output_tokens ?? 0;
      if (uitkomst.ok && uitkomst.pair) {
        gelukt++;
        console.log(`  [${aanroepen}/${maxAanroepen}] ${label} -> ${uitkomst.pair.pair_id} (${uitkomst.latency_ms ?? 0} ms)`);
      } else {
        mislukt.push(`${label}: ${uitkomst.reason ?? 'onbekend'}`);
        console.log(`  [${aanroepen}/${maxAanroepen}] ${label} -> MISLUKT: ${uitkomst.reason ?? 'onbekend'}`);
      }
    }
    if (aanroepen >= maxAanroepen) break;
  }

  const dollar = (inputTokens * 2 + outputTokens * 10) / 1_000_000;
  console.log(`\n${gelukt} van ${aanroepen} aanroepen leverde een paar op.`);
  console.log(`Tokens: ${inputTokens} in, ${outputTokens} uit. Kosten: ${dollar.toFixed(3)} dollar.`);
  if (mislukt.length > 0) {
    const perSoort = new Map<FoutSoort, string[]>();
    for (const regel of mislukt) {
      const soort = classificeerFout(regel);
      const lijst = perSoort.get(soort) ?? [];
      lijst.push(regel);
      perSoort.set(soort, lijst);
    }
    console.log(`\n${mislukt.length} mislukt:`);
    for (const soort of FOUT_SOORTEN) {
      const lijst = perSoort.get(soort) ?? [];
      if (lijst.length === 0) continue;
      console.log(`\n  ${FOUT_UITLEG[soort]} (${lijst.length}):`);
      for (const regel of lijst.slice(0, 10)) console.log(`    - ${regel}`);
      if (lijst.length > 10) console.log(`    ... en ${lijst.length - 10} meer`);
    }
  }

  await rapporteer(client, segmenten);
  return mislukt.length === 0;
}

if (process.argv.some((a) => a.endsWith('genereer-paren.ts'))) {
  runGenereerParen().then((groen) => process.exit(groen ? 0 : 1));
}
```

In `package.json`, na de regel `"design:poort": "vite-node scripts/keten/design-poort.ts",`, voeg toe:

```json
    "keten:paren": "vite-node scripts/keten/genereer-paren.ts",
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

```bash
npx vitest run scripts/keten/__tests__/genereer-paren.test.ts
```

Verwacht: 6 tests geslaagd.

- [ ] **Stap 5: Droogloop, zonder een cent uit te geven**

```bash
npm run keten:paren -- --droogloop
```

Verwacht: het script weigert niets, roept niets aan, en print `Segmenten: 63. Assen met tekort: 378. Paren te maken: 1512.` (3 geslachten x 7 gelegenheden x 3 banden x 6 assen x 4 paren), `Plafond: 150 aanroepen. Deze run: 150.`, een kostenschatting van circa `3.90 dollar`, de eerste twintig regels van het plan, `Droogloop. Er is niets aangeroepen en niets geschreven.` en daarna de lege dekkingstabel. Komt er `Geen credentials`, zet dan `SUPABASE_SERVICE_ROLE_KEY` in de shell (`export SUPABASE_SERVICE_ROLE_KEY=...`, op te halen met `supabase projects api-keys --project-ref "$(cat supabase/.temp/project-ref)"`) en nooit in `.env` als die gecommit zou kunnen worden.

Controleer ook dat de rem werkt:

```bash
npm run keten:paren -- --uitvoeren; echo "exit=$?"
```

Verwacht: `Dit zou 63 segmenten raken (3 geslachten, 3 prijsbanden).` en `exit=1`. Er is niets aangeroepen.

- [ ] **Stap 6: Vul een segment echt**

Begin klein: een geslacht, een gelegenheid, een band. Dat zijn zes assen maal vier paren, dus 24 aanroepen en circa 0,65 dollar.

```bash
npm run keten:paren -- --uitvoeren --gender=female --gelegenheid=work --band=50tot100 --max-aanroepen=24
```

Verwacht: 24 regels `[n/24] female|work|50tot100 <as> <a>/<b> -> <pair_id> (<ms> ms)`, daarna `24 van 24 aanroepen leverde een paar op` en een kostenregel in de orde van 0,6 dollar. Het slotrapport groepeert mislukkingen per soort (`classificeerFout`). `geen kandidaten voor deze kant` betekent dat dat segment geen aanbod heeft met die as-waarde; dat is een bevinding over de tagging uit plan 2, geen fout van dit script, en opnieuw draaien helpt niet. `kandidaten overlappen tussen de kanten` betekent dat het model hetzelfde product aan beide kanten zette; dat kan sinds taak 7 alleen nog op `shoe_type`, waar items zonder schoen-rol bewust aan beide kanten staan. `overig` is een storing of een paar dat twee keer de validatie niet haalde; dat mag je opnieuw draaien. Noteer de regels van de eerste twee soorten, ze horen in het rapport van taak 14.

Vul daarna de twee gelegenheden erbij die je in taak 14 gebruikt:

```bash
npm run keten:paren -- --uitvoeren --gender=female --gelegenheid=date --band=50tot100 --max-aanroepen=24
npm run keten:paren -- --uitvoeren --gender=male --gelegenheid=work --band=50tot100 --max-aanroepen=24
npm run keten:paren -- --uitvoeren --gender=male --gelegenheid=casual --band=tot50 --max-aanroepen=24
npm run keten:paren -- --uitvoeren --gender=female --gelegenheid=travel --band=tot50 --max-aanroepen=24
```

Totaal circa 120 aanroepen en 3 tot 6 dollar. Een volle run over alle 63 segmenten (1512 paren, 39 tot 79 dollar, 3,5 tot 7 uur) is een aparte beslissing en hoort niet bij het afronden van dit plan. Unisex zit in die volle run; een bezoeker die "Beide" kiest heeft pas paren als dat segment gevuld is. Wil je unisex eerder kunnen tonen, vul dan minstens een unisex-segment met dezelfde aanroep en `--gender=unisex`. Let op wat `get_kandidaten` daar doet: spec 5.3 filtert op `gender in (p_gender, 'unisex')`, dus bij `p_gender = 'unisex'` blijven alleen items over die ook echt als unisex getagd zijn. Is die verzameling te klein, dan meldt het script `geen kandidaten voor deze kant` en staat de budgetkaart in de onboarding uitgeschakeld (besluit 1). Dat is een bevinding over de tagging uit plan 2 en geen fout hier; noteer hem voor het rapport van taak 14.

- [ ] **Stap 7: Controle-query per segment**

Dit is de query uit ruling 2: hoeveel paren per segment zijn nog bruikbaar.

```bash
supabase db query --linked "
select p.segment_key,
       count(*) filter (where v.pair_id is not null) as bruikbaar,
       count(*) as totaal,
       count(distinct p.axis) filter (where v.pair_id is not null) as assen
from pair_sets p
left join pair_sets_op_voorraad v on v.pair_id = p.pair_id
group by 1
order by 2, 1" -o table
supabase db query --linked "
select p.segment_key, p.axis, count(v.pair_id) as bruikbaar
from pair_sets p
left join pair_sets_op_voorraad v on v.pair_id = p.pair_id
group by 1, 2
having count(v.pair_id) < 4
order by 3, 1, 2" -o table
```

Verwacht: in de eerste tabel per gevuld segment `bruikbaar = totaal = 24` en `assen = 6`. De tweede tabel is de werklijst: elke regel daarin is een as die onder de vier bruikbare paren zit en dus om een nieuwe run van dit script vraagt. Is die tabel leeg, dan is er niets te doen. Zakt een segment later onder de zes paren uit `MIN_PAREN` (taak 3), dan valt de bijbehorende budgetkaart in de onboarding uit (besluit 1); deze query is de plek waar je dat ziet aankomen.

Ruim de paren met uitverkochte items op als de eerste tabel verschil laat zien tussen `bruikbaar` en `totaal`:

```bash
npm run keten:paren -- --opruimen
npm run keten:paren -- --opruimen --ja
```

Verwacht: de eerste aanroep telt en verwijdert niets; de tweede verwijdert en meldt het aantal.

- [ ] **Stap 8: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add scripts/keten/genereer-paren.ts scripts/keten/__tests__/genereer-paren.test.ts package.json
git commit -m "feat(keten): script genereer-paren met droogloop, plafond en opruimen

Drie geslachten, unisex erbij: spec 6 stap 1 biedt Beide als keuze, dus zonder
unisex-paren loopt die bezoeker na vier stappen vast. Een nominale as krijgt
precies een contrast, met een test die faalt zodra dat er meer worden.

Geen cron voor voorraad: de view pair_sets_op_voorraad filtert paren met een
uitverkocht item weg, en dit script vult handmatig bij als de controle-query
meldt dat een as onder vier bruikbare paren zakt.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 9: De reducer van de onboarding

**Bestanden:**
- Aanmaken: `src/components/start/startReducer.ts`
- Test: `src/components/start/__tests__/startReducer.test.ts`

**Interfaces:**
- Gebruikt: `Assen`, `Gelegenheid`, `Geslacht`, `Keuze`, `legeAssen()` uit `@/keten/types`; `PaarKantNaam`, `PairSet`, `Prijsband` (taak 2); `berekenAxes` en `setId` (taak 2); `klaar` en `volgendPaar` (taak 3).
- Levert:
  ```typescript
  type Stap = 'voor-wie' | 'gelegenheden' | 'budget' | 'no-go' | 'dit-of-dat' | 'klaar'
  const STAPPEN: readonly Stap[]
  const MAX_GELEGENHEDEN = 3
  interface StartState { stap: Stap; gender: Geslacht | null; occasions: Gelegenheid[]; band: Prijsband | null; nogo: string[]; paren: PairSet[]; keuzes: Keuze[]; gebruikteParen: string[]; axes: Assen; huidigPaar: PairSet | null; parenKlaar: boolean }
  type StartActie =
    | { type: 'gender'; waarde: Geslacht }
    | { type: 'gelegenheid'; waarde: Gelegenheid }
    | { type: 'band'; waarde: Prijsband }
    | { type: 'nogo'; productId: string }
    | { type: 'paren'; paren: PairSet[] }
    | { type: 'keuze'; kant: PaarKantNaam }
    | { type: 'verder' }
    | { type: 'terug' }
  const beginState: StartState
  function startReducer(state: StartState, actie: StartActie): StartState
  function magVerder(state: StartState): boolean
  ```

**Waarom de hele bedrading hier zit en niet in de component.** De keten klik, keuze opslaan, assen herberekenen, volgend paar bepalen, stoppen is de kern van dit plan. Er is in deze repo geen jsdom, dus in een component zou die keten alleen met de hand in de browser te controleren zijn. Door hem in de reducer te zetten is hij in vitest in node te draaien, met een hele sessie in een test (stap 1). `StartPage` (taak 11) doet daarna alleen nog data laden, tracking en navigatie, en het harnas (taak 14) simuleert een bezoeker door dezelfde reducer te voeren in plaats van de logica na te bouwen.

Gedrag:
- Een nieuwe `gender` of een nieuwe `band` maakt het latere werk ongeldig: `nogo`, `paren`, `keuzes`, `gebruikteParen`, `axes`, `huidigPaar` en `parenKlaar` gaan terug naar leeg, want die zijn gebouwd op kandidaten en paren van het oude segment. Een gewijzigde gelegenheid doet hetzelfde.
- `gelegenheid` schakelt aan en uit; boven `MAX_GELEGENHEDEN` gebeurt er niets (spec 6 stap 2 en `taste_profiles.occasions`, maximaal drie).
- `nogo` schakelt aan en uit (spec 6 stap 4: tik wat je nooit draagt, mag ook niets zijn).
- `paren` zet de paren die `StartPage` ophaalde in de state en bepaalt meteen het eerste paar.
- `keuze` krijgt alleen de gekozen kant. De reducer bouwt de `Keuze` zelf uit `huidigPaar` met `setId`, herberekent `axes` met `berekenAxes` over alle keuzes tot nu toe (spec 6 stap 5), bepaalt het volgende paar met `volgendPaar` en het stopmoment met `klaar`. Zonder `huidigPaar` gebeurt er niets, en een paar dat al gebruikt is telt niet twee keer.
- Is het stopmoment bereikt terwijl de bezoeker op `dit-of-dat` staat, dan zet dezelfde actie de stap meteen op `klaar`.
- `verder` en `terug` schuiven een stap op in `STAPPEN`; `verder` doet niets als `magVerder` false geeft. Op `dit-of-dat` is `magVerder` gelijk aan `parenKlaar`.
- `volgendPaar` en `klaar` uit taak 3 worden nergens anders aangeroepen. Dat is wat "de reducer is de enige plek" betekent.

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/components/start/__tests__/startReducer.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  MAX_GELEGENHEDEN,
  STAPPEN,
  beginState,
  magVerder,
  startReducer,
  type StartActie,
  type StartState,
} from '../startReducer';
import { legeAssen, type AsNaam, type PaarKantNaam, type PairSet } from '@/keten/types';
import { setId } from '@/keten/profiel';
import { MAX_PAREN, MIN_PAREN } from '@/keten/paarSelectie';

function paarOp(pair_id: string, axis: AsNaam, waardeA: string, waardeB: string): PairSet {
  return {
    pair_id,
    segment_key: 'female|work|50tot100',
    gender: 'female',
    occasion: 'work',
    price_band: '50tot100',
    axis,
    kanten: [
      { kant: 'a', waarde: waardeA, items: [{ product_id: `${pair_id}-a`, role: 'top', name: 'A', brand: null, price: 60, image_url: 'x' }] },
      { kant: 'b', waarde: waardeB, items: [{ product_id: `${pair_id}-b`, role: 'top', name: 'B', brand: null, price: 60, image_url: 'y' }] },
    ],
  };
}

const paar = paarOp('p1', 'pattern', 'effen', 'statement');

function na(acties: StartActie[], begin: StartState = beginState): StartState {
  return acties.reduce(startReducer, begin);
}

describe('STAPPEN en beginState', () => {
  it('volgen de zes stappen uit spec 6', () => {
    expect(STAPPEN).toEqual(['voor-wie', 'gelegenheden', 'budget', 'no-go', 'dit-of-dat', 'klaar']);
    expect(beginState).toEqual({
      stap: 'voor-wie',
      gender: null,
      occasions: [],
      band: null,
      nogo: [],
      paren: [],
      keuzes: [],
      gebruikteParen: [],
      axes: legeAssen(),
      huidigPaar: null,
      parenKlaar: false,
    });
  });
});

describe('gender, gelegenheden en band', () => {
  it('zet het geslacht', () => {
    expect(startReducer(beginState, { type: 'gender', waarde: 'female' }).gender).toBe('female');
    expect(startReducer(beginState, { type: 'gender', waarde: 'unisex' }).gender).toBe('unisex');
  });

  it('schakelt gelegenheden aan en uit, met maximaal drie', () => {
    const drie = na([
      { type: 'gelegenheid', waarde: 'work' },
      { type: 'gelegenheid', waarde: 'casual' },
      { type: 'gelegenheid', waarde: 'date' },
    ]);
    expect(drie.occasions).toEqual(['work', 'casual', 'date']);
    expect(startReducer(drie, { type: 'gelegenheid', waarde: 'party' }).occasions).toEqual(['work', 'casual', 'date']);
    expect(startReducer(drie, { type: 'gelegenheid', waarde: 'casual' }).occasions).toEqual(['work', 'date']);
    expect(MAX_GELEGENHEDEN).toBe(3);
  });

  it('schakelt no-go aan en uit', () => {
    const een = startReducer(beginState, { type: 'nogo', productId: 'x' });
    expect(een.nogo).toEqual(['x']);
    expect(startReducer(een, { type: 'nogo', productId: 'x' }).nogo).toEqual([]);
  });
});

describe('opnieuw kiezen maakt het latere werk ongeldig', () => {
  const gevuld: StartState = {
    ...beginState,
    stap: 'dit-of-dat',
    gender: 'female',
    occasions: ['work'],
    band: '50tot100',
    nogo: ['x'],
    paren: [paar],
    keuzes: [{ pair_id: 'p1', chosen_set_id: 'p1:a', rejected_set_id: 'p1:b', axis: 'pattern' }],
    gebruikteParen: ['p1'],
    axes: { ...legeAssen(), pattern: { value: 'effen', confidence: 1 } },
    huidigPaar: null,
    parenKlaar: false,
  };

  it('bij een ander geslacht', () => {
    const uit = startReducer(gevuld, { type: 'gender', waarde: 'male' });
    expect(uit.nogo).toEqual([]);
    expect(uit.paren).toEqual([]);
    expect(uit.keuzes).toEqual([]);
    expect(uit.gebruikteParen).toEqual([]);
    expect(uit.axes).toEqual(legeAssen());
    expect(uit.huidigPaar).toBeNull();
    expect(uit.parenKlaar).toBe(false);
    expect(uit.band).toBeNull();
  });

  it('bij een andere band', () => {
    const uit = startReducer(gevuld, { type: 'band', waarde: 'tot50' });
    expect(uit.band).toBe('tot50');
    expect(uit.paren).toEqual([]);
    expect(uit.keuzes).toEqual([]);
    expect(uit.nogo).toEqual([]);
  });

  it('bij een andere gelegenheid', () => {
    const uit = startReducer(gevuld, { type: 'gelegenheid', waarde: 'date' });
    expect(uit.occasions).toEqual(['work', 'date']);
    expect(uit.keuzes).toEqual([]);
    expect(uit.paren).toEqual([]);
  });

  it('niet bij hetzelfde geslacht nog een keer', () => {
    expect(startReducer(gevuld, { type: 'gender', waarde: 'female' })).toEqual(gevuld);
  });
});

describe('paren en keuze', () => {
  it('zet de paren en bepaalt meteen het eerste paar', () => {
    const uit = startReducer(beginState, { type: 'paren', paren: [paar] });
    expect(uit.paren).toEqual([paar]);
    expect(uit.huidigPaar?.pair_id).toBe('p1');
    expect(uit.parenKlaar).toBe(false);
  });

  it('bouwt de keuze zelf uit het huidige paar en herberekent de assen', () => {
    const geladen = startReducer(beginState, { type: 'paren', paren: [paar] });
    const uit = startReducer(geladen, { type: 'keuze', kant: 'a' });
    expect(uit.keuzes).toEqual([
      { pair_id: 'p1', chosen_set_id: setId('p1', 'a'), rejected_set_id: setId('p1', 'b'), axis: 'pattern' },
    ]);
    expect(uit.gebruikteParen).toEqual(['p1']);
    expect(uit.axes.pattern).toEqual({ value: 'effen', confidence: 1 });
    expect(uit.huidigPaar).toBeNull();
  });

  it('doet niets zonder huidig paar', () => {
    expect(startReducer(beginState, { type: 'keuze', kant: 'a' })).toEqual(beginState);
  });

  it('telt hetzelfde paar niet twee keer', () => {
    const geladen = startReducer(beginState, { type: 'paren', paren: [paar] });
    const een = startReducer(geladen, { type: 'keuze', kant: 'a' });
    expect(startReducer(een, { type: 'keuze', kant: 'b' })).toEqual(een);
  });
});

describe('een hele sessie door de reducer', () => {
  const opDitOfDat: StartState = {
    ...beginState,
    stap: 'dit-of-dat',
    gender: 'female',
    occasions: ['work'],
    band: '50tot100',
  };

  /** Paren laden en daarna kiezen tot de reducer zelf stopt. */
  function speel(paren: PairSet[], kant: (n: number) => PaarKantNaam): StartState {
    let state = startReducer(opDitOfDat, { type: 'paren', paren });
    for (let n = 0; n < 50 && !state.parenKlaar && state.huidigPaar; n++) {
      state = startReducer(state, { type: 'keuze', kant: kant(n) });
    }
    return state;
  }

  it('zes keuzes in dezelfde richting stoppen op zes', () => {
    // Twee paren per as. Na elke keuze staat die as op zekerheid 1, dus de
    // selectie gaat door naar de volgende as. Na zes keuzes haalt elke as de
    // drempel terwijl er nog paren over zijn: hij stopt op de zekerheid, niet
    // omdat het aanbod op is.
    const contrastPerAs: Record<AsNaam, [string, string]> = {
      formality: ['2', '4'],
      silhouette: ['slim', 'relaxed'],
      color_temp: ['koel', 'warm'],
      lightness: ['licht', 'donker'],
      pattern: ['effen', 'statement'],
      shoe_type: ['sneaker', 'net'],
    };
    const paren = (Object.keys(contrastPerAs) as AsNaam[]).flatMap((as, i) => {
      const [a, b] = contrastPerAs[as];
      return [paarOp(`${i}-1`, as, a, b), paarOp(`${i}-2`, as, a, b)];
    });
    const uit = speel(paren, () => 'a');
    expect(uit.keuzes).toHaveLength(MIN_PAREN);
    expect(uit.huidigPaar).not.toBeNull();
    expect(uit.parenKlaar).toBe(true);
    expect(uit.stap).toBe('klaar');
  });

  it('wisselende keuzes op een as blijven doorvragen tot twaalf', () => {
    // Alleen formality-paren: de vijf andere assen halen de drempel nooit, en
    // door om en om te kiezen blijft ook formality onzeker. Stoppen gebeurt dan
    // pas bij MAX_PAREN.
    const paren = Array.from({ length: 14 }, (_, i) =>
      paarOp(`f${String(i).padStart(2, '0')}`, 'formality', '2', '4')
    );
    const uit = speel(paren, (n) => (n % 2 === 0 ? 'a' : 'b'));
    expect(uit.keuzes).toHaveLength(MAX_PAREN);
    expect(uit.axes.formality.confidence).toBeLessThan(0.5);
    expect(uit.stap).toBe('klaar');
  });

  it('een as zonder paren wordt overgeslagen en loopt niet vast', () => {
    // Een paar op formality, zes op silhouette, niets voor de vier andere
    // assen. Die vier halen de drempel nooit; zonder de regel "geen paar meer
    // is ook klaar" zou de bezoeker hier blijven hangen.
    const paren = [
      paarOp('f1', 'formality', '2', '4'),
      ...Array.from({ length: 6 }, (_, i) => paarOp(`s${i}`, 'silhouette', 'slim', 'oversized')),
    ];
    const uit = speel(paren, (n) => (n % 2 === 0 ? 'a' : 'b'));
    expect(uit.keuzes).toHaveLength(7);
    expect(uit.huidigPaar).toBeNull();
    expect(uit.parenKlaar).toBe(true);
    expect(uit.stap).toBe('klaar');
    expect(uit.axes.lightness).toEqual({ value: null, confidence: 0 });
  });
});

describe('verder en terug', () => {
  it('gaat niet verder als de stap niet af is', () => {
    expect(startReducer(beginState, { type: 'verder' }).stap).toBe('voor-wie');
    expect(magVerder(beginState)).toBe(false);
  });

  it('gaat verder zodra de stap af is', () => {
    const metGender = startReducer(beginState, { type: 'gender', waarde: 'female' });
    expect(magVerder(metGender)).toBe(true);
    expect(startReducer(metGender, { type: 'verder' }).stap).toBe('gelegenheden');
  });

  it('gaat terug en blijft bij de eerste stap staan', () => {
    const tweede = { ...beginState, stap: 'gelegenheden' as const };
    expect(startReducer(tweede, { type: 'terug' }).stap).toBe('voor-wie');
    expect(startReducer(beginState, { type: 'terug' }).stap).toBe('voor-wie');
  });

  it('magVerder per stap', () => {
    expect(magVerder({ ...beginState, stap: 'gelegenheden' })).toBe(false);
    expect(magVerder({ ...beginState, stap: 'gelegenheden', occasions: ['work'] })).toBe(true);
    expect(magVerder({ ...beginState, stap: 'budget' })).toBe(false);
    expect(magVerder({ ...beginState, stap: 'budget', band: 'tot50' })).toBe(true);
    expect(magVerder({ ...beginState, stap: 'no-go' })).toBe(true);
    expect(magVerder({ ...beginState, stap: 'dit-of-dat' })).toBe(false);
    expect(magVerder({ ...beginState, stap: 'dit-of-dat', parenKlaar: true })).toBe(true);
    expect(magVerder({ ...beginState, stap: 'klaar' })).toBe(false);
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/components/start/__tests__/startReducer.test.ts
```

Verwacht: `Failed to resolve import "../startReducer"`.

- [ ] **Stap 3: Schrijf de reducer**

Maak `src/components/start/startReducer.ts`:

```typescript
/**
 * De zes stappen van onboarding v2 als pure reducer (spec 6).
 *
 * Alles wat de bezoeker doet gaat hier doorheen, inclusief de keten die de kern
 * van dit plan is: een klik legt de keuze vast, de assen worden herberekend, het
 * volgende paar wordt bepaald en het stopmoment wordt gecontroleerd. Die keten
 * staat bewust niet in de component. Er is geen jsdom in deze repo, dus daar zou
 * hij alleen met de hand in de browser te controleren zijn; hier draait hij in
 * vitest in node, zonder database en zonder DOM.
 *
 * volgendPaar en klaar (taak 3) worden nergens anders aangeroepen. StartPage
 * (taak 11) doet data laden, tracking en navigatie; het harnas (taak 14)
 * simuleert een bezoeker door dezelfde reducer te voeren.
 */
import { berekenAxes, setId } from '@/keten/profiel';
import { klaar, volgendPaar } from '@/keten/paarSelectie';
import {
  legeAssen,
  type Assen,
  type Gelegenheid,
  type Geslacht,
  type Keuze,
  type PaarKantNaam,
  type PairSet,
  type Prijsband,
} from '@/keten/types';

export type Stap = 'voor-wie' | 'gelegenheden' | 'budget' | 'no-go' | 'dit-of-dat' | 'klaar';

export const STAPPEN: readonly Stap[] = ['voor-wie', 'gelegenheden', 'budget', 'no-go', 'dit-of-dat', 'klaar'];

/** taste_profiles.occasions staat maximaal drie toe (spec 5.2 en 6 stap 2). */
export const MAX_GELEGENHEDEN = 3;

export interface StartState {
  stap: Stap;
  gender: Geslacht | null;
  occasions: Gelegenheid[];
  band: Prijsband | null;
  nogo: string[];
  /** De bruikbare paren die StartPage voor dit segment ophaalde (taak 5). */
  paren: PairSet[];
  keuzes: Keuze[];
  gebruikteParen: string[];
  axes: Assen;
  /** Het paar dat nu op het scherm hoort; null als er geen paar meer over is. */
  huidigPaar: PairSet | null;
  /** De uitkomst van klaar() na de laatste verandering: is het dit-of-dat-scherm af? */
  parenKlaar: boolean;
}

export type StartActie =
  | { type: 'gender'; waarde: Geslacht }
  | { type: 'gelegenheid'; waarde: Gelegenheid }
  | { type: 'band'; waarde: Prijsband }
  | { type: 'nogo'; productId: string }
  | { type: 'paren'; paren: PairSet[] }
  | { type: 'keuze'; kant: PaarKantNaam }
  | { type: 'verder' }
  | { type: 'terug' };

export const beginState: StartState = {
  stap: 'voor-wie',
  gender: null,
  occasions: [],
  band: null,
  nogo: [],
  paren: [],
  keuzes: [],
  gebruikteParen: [],
  axes: legeAssen(),
  huidigPaar: null,
  parenKlaar: false,
};

/**
 * Alles wat op kandidaten of paren van het oude segment gebouwd is, vervalt.
 * Zonder dit zou een bezoeker die terugloopt en een andere band kiest, kunnen
 * eindigen met no-go-items, paren en keuzes uit een segment waar hij niet meer
 * in zit.
 */
function wisSegmentWerk(state: StartState): StartState {
  return {
    ...state,
    nogo: [],
    paren: [],
    keuzes: [],
    gebruikteParen: [],
    axes: legeAssen(),
    huidigPaar: null,
    parenKlaar: false,
  };
}

/**
 * Het volgende paar en het stopmoment, na elke verandering aan de paren, de
 * keuzes of de assen. Dit is de enige plek waar volgendPaar en klaar worden
 * aangeroepen (spec 6 stap 5).
 */
function metVolgendPaar(state: StartState): StartState {
  const huidigPaar = volgendPaar(state.paren, state.gebruikteParen, state.axes);
  return { ...state, huidigPaar, parenKlaar: klaar(state.keuzes.length, state.axes, huidigPaar) };
}

export function magVerder(state: StartState): boolean {
  switch (state.stap) {
    case 'voor-wie':
      return state.gender !== null;
    case 'gelegenheden':
      return state.occasions.length >= 1 && state.occasions.length <= MAX_GELEGENHEDEN;
    case 'budget':
      return state.band !== null;
    case 'no-go':
      return true;
    case 'dit-of-dat':
      return state.parenKlaar;
    case 'klaar':
      return false;
  }
}

export function startReducer(state: StartState, actie: StartActie): StartState {
  switch (actie.type) {
    case 'gender': {
      if (state.gender === actie.waarde) return state;
      return { ...wisSegmentWerk(state), gender: actie.waarde, band: null };
    }
    case 'gelegenheid': {
      const aan = state.occasions.includes(actie.waarde);
      if (!aan && state.occasions.length >= MAX_GELEGENHEDEN) return state;
      const occasions = aan
        ? state.occasions.filter((o) => o !== actie.waarde)
        : [...state.occasions, actie.waarde];
      return { ...wisSegmentWerk(state), occasions };
    }
    case 'band': {
      if (state.band === actie.waarde) return state;
      return { ...wisSegmentWerk(state), band: actie.waarde };
    }
    case 'nogo': {
      const aan = state.nogo.includes(actie.productId);
      return {
        ...state,
        nogo: aan ? state.nogo.filter((id) => id !== actie.productId) : [...state.nogo, actie.productId],
      };
    }
    case 'paren': {
      return metVolgendPaar({ ...state, paren: actie.paren });
    }
    case 'keuze': {
      const paar = state.huidigPaar;
      if (!paar || state.gebruikteParen.includes(paar.pair_id)) return state;
      const andere: PaarKantNaam = actie.kant === 'a' ? 'b' : 'a';
      const keuzes: Keuze[] = [
        ...state.keuzes,
        {
          pair_id: paar.pair_id,
          chosen_set_id: setId(paar.pair_id, actie.kant),
          rejected_set_id: setId(paar.pair_id, andere),
          axis: paar.axis,
        },
      ];
      const volgend = metVolgendPaar({
        ...state,
        keuzes,
        gebruikteParen: [...state.gebruikteParen, paar.pair_id],
        axes: berekenAxes(keuzes, state.paren),
      });
      // Klaar met de paren? Dan meteen door naar de samenvatting. De component
      // hoeft daar niets voor te doen en kan er dus ook niets aan verkeerd doen.
      return volgend.stap === 'dit-of-dat' && volgend.parenKlaar ? { ...volgend, stap: 'klaar' } : volgend;
    }
    case 'verder': {
      if (!magVerder(state)) return state;
      const index = STAPPEN.indexOf(state.stap);
      const volgende = STAPPEN[Math.min(index + 1, STAPPEN.length - 1)];
      return { ...state, stap: volgende };
    }
    case 'terug': {
      const index = STAPPEN.indexOf(state.stap);
      return { ...state, stap: STAPPEN[Math.max(index - 1, 0)] };
    }
  }
}
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

```bash
npx vitest run src/components/start/__tests__/startReducer.test.ts
```

Verwacht: 19 tests geslaagd, waaronder de drie die een hele sessie door de reducer draaien.

- [ ] **Stap 5: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/components/start/startReducer.ts src/components/start/__tests__/startReducer.test.ts
git commit -m "feat(start): pure reducer voor de zes stappen van onboarding v2

De hele keten zit hier: een klik legt de keuze vast, herberekent de assen,
bepaalt het volgende paar en het stopmoment. volgendPaar en klaar worden
nergens anders aangeroepen, dus de kern is zonder DOM te testen.

Een ander geslacht, een andere gelegenheid of een andere band wist de no-go,
de paren en de keuzes: die waren gebouwd op het oude segment.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 10: De zes stapcomponenten

**Bestanden:**
- Aanmaken: `src/components/start/StartStap.tsx`, `VoorWie.tsx`, `Gelegenheden.tsx`, `Budget.tsx`, `NoGo.tsx`, `DitOfDat.tsx`, `Klaar.tsx` (alle in `src/components/start/`)
- Test: `src/components/start/__tests__/stappen.render.test.tsx`

**Interfaces:**
- Gebruikt: `Gelegenheid`, `Geslacht`, `Kandidaat`, `PairSet`, `Prijsband` uit `@/keten/types`; `formatPrijs` (taak 5); `BANDEN`, `MIN_PAREN_PER_SEGMENT`, `budgetVoorBand` (taak 5); `MAX_GELEGENHEDEN` (taak 9); `PaarKantNaam` (taak 2); iconen `Check`, `Shirt`, `CalendarDays`, `Wallet`, `ThumbsDown`, `Sparkles`, `ArrowLeft` uit `lucide-react`.
- Levert:
  ```typescript
  // StartStap.tsx
  const PRIMAIRE_KNOP: string
  const SECUNDAIRE_KNOP: string
  const KEUZE_KAART: string
  const KEUZE_AAN: string
  const KEUZE_UIT: string
  const KEUZE_UITGESCHAKELD: string
  interface StartStapProps { badge: string; Icoon: LucideIcon; titel: string; subtitel: string; index: number; totaal: number; children: React.ReactNode; opTerug?: () => void; opVerder?: () => void; verderTekst?: string; verderUit?: boolean }
  function StartStap(props: StartStapProps): JSX.Element

  // VoorWie.tsx
  const GESLACHT_OPTIES: ReadonlyArray<{ waarde: Geslacht; label: string; uitleg: string }>
  function VoorWie(props: { gekozen: Geslacht | null; opKies: (g: Geslacht) => void }): JSX.Element

  // Gelegenheden.tsx
  const GELEGENHEID_LABEL: Record<Gelegenheid, string>
  function Gelegenheden(props: { gekozen: Gelegenheid[]; opTik: (g: Gelegenheid) => void }): JSX.Element

  // Budget.tsx
  interface BandKaart { band: Prijsband; anker: Kandidaat | null; paren: number }
  function Budget(props: { kaarten: BandKaart[]; gekozen: Prijsband | null; opKies: (b: Prijsband) => void }): JSX.Element

  // NoGo.tsx
  function NoGo(props: { items: Kandidaat[]; gekozen: string[]; opTik: (productId: string) => void }): JSX.Element

  // DitOfDat.tsx
  function DitOfDat(props: { paar: PairSet; nummer: number; minimum: number; opKies: (kant: PaarKantNaam) => void }): JSX.Element

  // Klaar.tsx
  function Klaar(props: { gender: Geslacht; occasions: Gelegenheid[]; band: Prijsband; aantalKeuzes: number; aantalNogo: number; bezig: boolean; fout: string | null; opAfronden: () => void }): JSX.Element
  ```

Design, strikt uit CLAUDE.md en de randvoorwaarden bovenaan:
- Page header `bg-[#F5F0EB] pt-44 md:pt-52 pb-16 md:pb-20`, witte badge met een Lucide-icoon in `text-[#A85740]`, H1 `text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center`, subtitel `text-base text-[#4A4A4A] text-center mt-4 max-w-lg mx-auto`.
- Content `bg-[#FAFAF8] py-16 md:py-24`, container `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8` (een keuzescherm is een smalle pagina, zoals CLAUDE.md 13 voor contact en login voorschrijft).
- Keuzekaarten `bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md`, gekozen `bg-[#F4E8E3] border-[#A85740] text-[#A85740]`.
- Knoppen `min-h-[48px]`, tapbare kaarten `min-h-[44px]`; geen tekst kleiner dan `text-sm`.
- Badges op kaarten staan op `absolute top-3 left-3`, precies zoals CLAUDE.md deel 4 voorschrijft. De design-poort uit taak 0 telt dat niet als `p-3`: zijn spacing-regex heeft een lookbehind die daarvoor is gebouwd, met een test die `top-3 left-3` schoon door laat komen.
- Afbeeldingen `aspect-[3/4] object-cover` met `loading="lazy"`.

- [ ] **Stap 1: Schrijf de falende render-test**

Maak `src/components/start/__tests__/stappen.render.test.tsx`:

```tsx
/**
 * Render-tests zonder jsdom, zoals CalibrationStep.render.test.tsx: de
 * componenten worden server-side gerenderd, effects draaien niet. Wat we
 * bewaken: de vaste teksten, dat keuzes echte knoppen zijn, de geselecteerde
 * state uit het palet, en dat een band zonder aanbod uitgeschakeld is.
 */
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Budget } from '../Budget';
import { DitOfDat } from '../DitOfDat';
import { Gelegenheden } from '../Gelegenheden';
import { Klaar } from '../Klaar';
import { NoGo } from '../NoGo';
import { VoorWie } from '../VoorWie';
import type { Categorie, Kandidaat, PairSet, ProductAttrs, RuwProduct } from '@/keten/types';

function attrs(category: Categorie): ProductAttrs {
  return {
    is_fashion: true, category, gender: 'female', formality: 3, occasions: ['work'],
    silhouette: 'regular', color_temp: 'neutraal', lightness: 'medium', pattern: 'effen',
    shoe_type: null, colors: ['zwart'], materials: ['katoen'], seasons: ['herfst'],
    price_band: '50tot100', confidence: 0.9, tagger_version: 't',
  };
}

function product(id: string, price: number): RuwProduct {
  return {
    id, name: `Product ${id}`, brand: 'Merk', price, image_url: `https://voorbeeld.test/${id}.jpg`,
    retailer: 'H&M', url: null, affiliate_url: null, product_url: null, gender: 'female',
    colors: ['zwart'], sizes: ['M'], in_stock: true, description: null,
  };
}

function kandidaat(id: string, category: Categorie, price: number): Kandidaat {
  return { product_id: id, category, score: 0.5, attrs: attrs(category), product: product(id, price) };
}

const paar: PairSet = {
  pair_id: 'p1',
  segment_key: 'female|work|50tot100',
  gender: 'female',
  occasion: 'work',
  price_band: '50tot100',
  axis: 'pattern',
  kanten: [
    { kant: 'a', waarde: 'effen', items: [{ product_id: 'a1', role: 'top', name: 'Effen blouse', brand: 'Merk', price: 60, image_url: 'https://voorbeeld.test/a1.jpg' }] },
    { kant: 'b', waarde: 'statement', items: [{ product_id: 'b1', role: 'top', name: 'Print blouse', brand: 'Merk', price: 70, image_url: 'https://voorbeeld.test/b1.jpg' }] },
  ],
};

describe('VoorWie', () => {
  it('toont drie keuzes als knoppen', () => {
    const html = renderToString(<VoorWie gekozen={null} opKies={vi.fn()} />);
    expect(html).toContain('Dames');
    expect(html).toContain('Heren');
    expect(html).toContain('Beide');
    expect(html.match(/type="button"/g)?.length).toBe(3);
    expect(html).not.toContain('aria-pressed="true"');
  });

  it('markeert de gekozen optie met de geselecteerde state uit het palet', () => {
    const html = renderToString(<VoorWie gekozen="female" opKies={vi.fn()} />);
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(1);
    expect(html).toContain('bg-[#F4E8E3]');
  });
});

describe('Gelegenheden', () => {
  it('toont zeven Nederlandse labels', () => {
    const html = renderToString(<Gelegenheden gekozen={[]} opTik={vi.fn()} />);
    for (const label of ['Werk', 'Dagelijks', 'Formeel', 'Date', 'Reizen', 'Sport', 'Uitgaan']) {
      expect(html).toContain(label);
    }
    expect(html).toContain('Kies er maximaal drie');
  });

  it('schakelt de overige knoppen uit zodra er drie gekozen zijn', () => {
    const html = renderToString(<Gelegenheden gekozen={['work', 'casual', 'date']} opTik={vi.fn()} />);
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(3);
    expect(html.match(/disabled=""/g)?.length).toBe(4);
  });
});

describe('Budget', () => {
  const kaarten = [
    { band: 'tot50' as const, anker: kandidaat('goedkoop', 'top', 29), paren: 24 },
    { band: '50tot100' as const, anker: kandidaat('midden', 'top', 79), paren: 24 },
    { band: '100tot200' as const, anker: null, paren: 0 },
  ];

  it('toont het ankerproduct met prijs en de bandgrenzen', () => {
    const html = renderToString(<Budget kaarten={kaarten} gekozen={null} opKies={vi.fn()} />);
    expect(html).toContain('€ 29,00');
    expect(html).toContain('€ 79,00');
    expect(html).toContain('Tot 50 euro');
    expect(html).toContain('50 tot 100 euro');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('aspect-[3/4]');
  });

  it('schakelt een band zonder aanbod uit met een eerlijke tekst', () => {
    const html = renderToString(<Budget kaarten={kaarten} gekozen={null} opKies={vi.fn()} />);
    expect(html).toContain('Nog geen aanbod in deze prijsband');
    expect(html.match(/disabled=""/g)?.length).toBe(1);
  });

  it('schakelt ook uit bij te weinig paren', () => {
    const teWeinig = [{ band: 'tot50' as const, anker: kandidaat('a', 'top', 29), paren: 2 }];
    const html = renderToString(<Budget kaarten={teWeinig} gekozen={null} opKies={vi.fn()} />);
    expect(html.match(/disabled=""/g)?.length).toBe(1);
  });
});

describe('NoGo', () => {
  it('toont de items als knoppen en markeert de getikte', () => {
    const items = [kandidaat('n1', 'top', 40), kandidaat('n2', 'bottom', 40)];
    const html = renderToString(<NoGo items={items} gekozen={['n1']} opTik={vi.fn()} />);
    expect(html).toContain('Tik wat je nooit draagt');
    expect(html.match(/type="button"/g)?.length).toBe(2);
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(1);
    expect(html).toContain('Nooit dragen');
  });

  it('meldt het netjes als er geen items zijn', () => {
    const html = renderToString(<NoGo items={[]} gekozen={[]} opTik={vi.fn()} />);
    expect(html).toContain('Geen items om te tonen');
  });
});

describe('DitOfDat', () => {
  it('toont twee kanten met beelden en de voortgang', () => {
    const html = renderToString(<DitOfDat paar={paar} nummer={3} minimum={6} opKies={vi.fn()} />);
    expect(html).toContain('Effen blouse');
    expect(html).toContain('Print blouse');
    expect(html).toContain('Paar 3 van minimaal 6');
    expect(html.match(/type="button"/g)?.length).toBe(2);
    expect(html).toContain('Deze kies ik');
    expect(html).toContain('loading="lazy"');
  });
});

describe('Klaar', () => {
  it('vat de keuzes samen en gebruikt de vaste CTA-tekst', () => {
    const html = renderToString(
      <Klaar gender="female" occasions={['work', 'date']} band="50tot100" aantalKeuzes={8} aantalNogo={2} bezig={false} fout={null} opAfronden={vi.fn()} />
    );
    expect(html).toContain('Bekijk je resultaten');
    expect(html).toContain('Dames');
    expect(html).toContain('Werk, Date');
    expect(html).toContain('50 tot 100 euro');
    expect(html).toContain('8 keuzes');
    expect(html).toContain('2 items die je nooit draagt');
    expect(html).not.toContain('disabled=""');
  });

  it('schakelt de knop uit terwijl er gewerkt wordt en toont een fout', () => {
    const html = renderToString(
      <Klaar gender="male" occasions={['work']} band="tot50" aantalKeuzes={6} aantalNogo={0} bezig={true} fout="Het lukte niet" opAfronden={vi.fn()} />
    );
    expect(html.match(/disabled=""/g)?.length).toBe(1);
    expect(html).toContain('Je outfits worden samengesteld');
    expect(html).toContain('Het lukte niet');
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/components/start/__tests__/stappen.render.test.tsx
```

Verwacht: `Failed to resolve import "../Budget"`.

- [ ] **Stap 3: Schrijf de gedeelde schil**

Maak `src/components/start/StartStap.tsx`:

```tsx
/**
 * De schil om elke stap van onboarding v2: page header met badge, titel,
 * subtitel en voortgang, daaronder de inhoud van de stap en de twee knoppen.
 *
 * De klassen staan hier als constanten zodat alle zes de stappen dezelfde
 * knoppen en kaarten gebruiken en de design-poort maar een plek hoeft te
 * bewaken.
 */
import React from 'react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

export const PRIMAIRE_KNOP =
  'inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base transition-colors duration-200 disabled:opacity-50';

export const SECUNDAIRE_KNOP =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base transition-colors duration-200 disabled:opacity-50';

export const KEUZE_KAART =
  'relative w-full min-h-[44px] text-left rounded-2xl border p-6 transition-colors duration-200';

export const KEUZE_AAN = 'bg-[#F4E8E3] border-[#A85740] text-[#A85740]';
export const KEUZE_UIT = 'bg-white border-[#E5E5E5] text-[#1A1A1A] hover:border-[#A85740]';
export const KEUZE_UITGESCHAKELD = 'bg-white border-[#E5E5E5] text-[#6E6E6E] opacity-50 cursor-not-allowed';

export interface StartStapProps {
  badge: string;
  Icoon: LucideIcon;
  titel: string;
  subtitel: string;
  /** 1 tot en met totaal. */
  index: number;
  totaal: number;
  children: React.ReactNode;
  opTerug?: () => void;
  opVerder?: () => void;
  verderTekst?: string;
  verderUit?: boolean;
}

export function StartStap({
  badge,
  Icoon,
  titel,
  subtitel,
  index,
  totaal,
  children,
  opTerug,
  opVerder,
  verderTekst = 'Verder',
  verderUit = false,
}: StartStapProps) {
  const percentage = Math.round((index / totaal) * 100);

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <header className="bg-[#F5F0EB] pt-44 md:pt-52 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A]">
              <Icoon className="w-5 h-5 text-[#A85740]" aria-hidden="true" />
              {badge}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center mt-6">{titel}</h1>
          <p className="text-base text-[#4A4A4A] text-center mt-4 max-w-lg mx-auto">{subtitel}</p>
          <div className="mt-8 max-w-lg mx-auto">
            <div className="flex items-center justify-between text-sm font-medium text-[#6E6E6E]">
              <span>
                Stap {index} van {totaal}
              </span>
              <span>{percentage}%</span>
            </div>
            <div
              className="mt-2 h-2 rounded-full bg-white overflow-hidden"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Voortgang van de onboarding"
            >
              <div className="h-full bg-[#A85740]" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[#FAFAF8] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}

          {(opTerug || opVerder) && (
            <div className="mt-8 flex items-center justify-between gap-4">
              {opTerug ? (
                <button type="button" onClick={opTerug} className={SECUNDAIRE_KNOP}>
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  Terug
                </button>
              ) : (
                <span />
              )}
              {opVerder && (
                <button type="button" onClick={opVerder} disabled={verderUit} className={PRIMAIRE_KNOP}>
                  {verderTekst}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Stap 4: Schrijf stap 1 tot en met 4**

Maak `src/components/start/VoorWie.tsx`:

```tsx
/** Stap 1 (spec 6.1): voor wie zoeken we kleding. */
import React from 'react';
import type { Geslacht } from '@/keten/types';
import { KEUZE_AAN, KEUZE_KAART, KEUZE_UIT } from './StartStap';

export const GESLACHT_OPTIES: ReadonlyArray<{ waarde: Geslacht; label: string; uitleg: string }> = [
  { waarde: 'female', label: 'Dames', uitleg: 'Damesmode en unisex' },
  { waarde: 'male', label: 'Heren', uitleg: 'Herenmode en unisex' },
  { waarde: 'unisex', label: 'Beide', uitleg: 'Alles door elkaar' },
];

export function VoorWie({ gekozen, opKies }: { gekozen: Geslacht | null; opKies: (g: Geslacht) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {GESLACHT_OPTIES.map((optie) => {
        const aan = gekozen === optie.waarde;
        return (
          <button
            key={optie.waarde}
            type="button"
            aria-pressed={aan}
            onClick={() => opKies(optie.waarde)}
            className={`${KEUZE_KAART} ${aan ? KEUZE_AAN : KEUZE_UIT}`}
          >
            <span className="block text-xl font-semibold">{optie.label}</span>
            <span className="block text-sm text-[#4A4A4A] mt-2">{optie.uitleg}</span>
          </button>
        );
      })}
    </div>
  );
}
```

Maak `src/components/start/Gelegenheden.tsx`:

```tsx
/** Stap 2 (spec 6.2): maximaal drie gelegenheden. */
import React from 'react';
import { GELEGENHEDEN, type Gelegenheid } from '@/keten/types';
import { MAX_GELEGENHEDEN } from './startReducer';
import { KEUZE_AAN, KEUZE_KAART, KEUZE_UIT, KEUZE_UITGESCHAKELD } from './StartStap';

export const GELEGENHEID_LABEL: Record<Gelegenheid, string> = {
  work: 'Werk',
  casual: 'Dagelijks',
  formal: 'Formeel',
  date: 'Date',
  travel: 'Reizen',
  sport: 'Sport',
  party: 'Uitgaan',
};

export function Gelegenheden({ gekozen, opTik }: { gekozen: Gelegenheid[]; opTik: (g: Gelegenheid) => void }) {
  const vol = gekozen.length >= MAX_GELEGENHEDEN;

  return (
    <div>
      <p className="text-sm font-medium text-[#6E6E6E] text-center">
        Kies er maximaal drie. Nu {gekozen.length} van {MAX_GELEGENHEDEN}.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {GELEGENHEDEN.map((gelegenheid) => {
          const aan = gekozen.includes(gelegenheid);
          const uit = !aan && vol;
          return (
            <button
              key={gelegenheid}
              type="button"
              aria-pressed={aan}
              disabled={uit}
              onClick={() => opTik(gelegenheid)}
              className={`${KEUZE_KAART} text-center ${aan ? KEUZE_AAN : uit ? KEUZE_UITGESCHAKELD : KEUZE_UIT}`}
            >
              <span className="block text-base font-medium">{GELEGENHEID_LABEL[gelegenheid]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

Maak `src/components/start/Budget.tsx`:

```tsx
/**
 * Stap 3 (spec 6.3): budget per stuk, met een echt product uit de catalogus
 * als anker. Een band zonder ankerproduct of met te weinig paren staat
 * uitgeschakeld (besluit 1 in "Wat de spec openlaat"): spec 5.7 garandeert
 * dekking alleen voor tot50 en 50tot100.
 */
import React from 'react';
import type { Kandidaat, Prijsband } from '@/keten/types';
import { MIN_PAREN_PER_SEGMENT, budgetVoorBand } from '@/keten/kandidatenStart';
import { formatPrijs } from '@/keten/prijs';
import { KEUZE_AAN, KEUZE_KAART, KEUZE_UIT, KEUZE_UITGESCHAKELD } from './StartStap';

export interface BandKaart {
  band: Prijsband;
  anker: Kandidaat | null;
  paren: number;
}

const BAND_LABEL: Record<Prijsband, string> = {
  tot50: 'Tot 50 euro',
  '50tot100': '50 tot 100 euro',
  '100tot200': '100 tot 200 euro',
  boven200: 'Vanaf 200 euro',
};

export function Budget({
  kaarten,
  gekozen,
  opKies,
}: {
  kaarten: BandKaart[];
  gekozen: Prijsband | null;
  opKies: (b: Prijsband) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kaarten.map((kaart) => {
        const bruikbaar = kaart.anker !== null && kaart.paren >= MIN_PAREN_PER_SEGMENT;
        const aan = gekozen === kaart.band;
        const grenzen = budgetVoorBand(kaart.band);
        return (
          <button
            key={kaart.band}
            type="button"
            aria-pressed={aan}
            disabled={!bruikbaar}
            onClick={() => opKies(kaart.band)}
            className={`${KEUZE_KAART} ${aan ? KEUZE_AAN : bruikbaar ? KEUZE_UIT : KEUZE_UITGESCHAKELD}`}
          >
            {kaart.anker?.product.image_url ? (
              <img
                src={kaart.anker.product.image_url}
                alt={kaart.anker.product.name}
                loading="lazy"
                className="w-full aspect-[3/4] object-cover rounded-xl"
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-xl bg-[#F5F0EB]" aria-hidden="true" />
            )}
            <span className="block text-xl font-semibold mt-4">{BAND_LABEL[kaart.band]}</span>
            {bruikbaar && kaart.anker ? (
              <span className="block text-sm text-[#4A4A4A] mt-2">
                Bijvoorbeeld deze {kaart.anker.category} voor {formatPrijs(kaart.anker.product.price)}, tussen{' '}
                {grenzen.min} en {grenzen.max} euro per stuk.
              </span>
            ) : (
              <span className="block text-sm text-[#6E6E6E] mt-2">Nog geen aanbod in deze prijsband</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

Maak `src/components/start/NoGo.tsx`:

```tsx
/** Stap 4 (spec 6.4): zes items, tik wat je nooit draagt. */
import React from 'react';
import { X } from 'lucide-react';
import type { Kandidaat } from '@/keten/types';
import { formatPrijs } from '@/keten/prijs';
import { KEUZE_AAN, KEUZE_KAART, KEUZE_UIT } from './StartStap';

export function NoGo({
  items,
  gekozen,
  opTik,
}: {
  items: Kandidaat[];
  gekozen: string[];
  opTik: (productId: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-base text-[#4A4A4A] text-center">Geen items om te tonen. Je kunt gewoon verder.</p>;
  }

  return (
    <div>
      <p className="text-sm font-medium text-[#6E6E6E] text-center">Tik wat je nooit draagt. Niets kiezen mag ook.</p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => {
          const aan = gekozen.includes(item.product_id);
          return (
            <button
              key={item.product_id}
              type="button"
              aria-pressed={aan}
              onClick={() => opTik(item.product_id)}
              className={`${KEUZE_KAART} ${aan ? KEUZE_AAN : KEUZE_UIT}`}
            >
              {aan && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-[#A85740]/10 px-4 py-2 text-sm font-medium text-[#A85740]">
                  <X className="w-5 h-5" aria-hidden="true" />
                  Nooit dragen
                </span>
              )}
              {item.product.image_url && (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover rounded-xl"
                />
              )}
              <span className="block text-base font-medium mt-4">{item.product.name}</span>
              <span className="block text-sm text-[#4A4A4A] mt-2">
                {item.product.brand ?? 'Merk onbekend'}, {formatPrijs(item.product.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Stap 5: Schrijf stap 5 en 6**

Maak `src/components/start/DitOfDat.tsx`:

```tsx
/**
 * Stap 5 (spec 6.5): twee outfits naast elkaar, kies er een.
 *
 * Het toetsenbord doet mee: pijl links en 1 kiezen kant A, pijl rechts en 2
 * kiezen kant B. Dat staat in een useEffect en draait dus niet in de
 * render-test; de test bewaakt de twee knoppen en de teksten.
 */
import React, { useEffect } from 'react';
import type { PaarKantNaam, PairSet } from '@/keten/types';
import { formatPrijs } from '@/keten/prijs';
import { KEUZE_KAART, KEUZE_UIT, PRIMAIRE_KNOP } from './StartStap';

export function DitOfDat({
  paar,
  nummer,
  minimum,
  opKies,
}: {
  paar: PairSet;
  nummer: number;
  minimum: number;
  opKies: (kant: PaarKantNaam) => void;
}) {
  useEffect(() => {
    function opToets(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === '1') opKies('a');
      if (e.key === 'ArrowRight' || e.key === '2') opKies('b');
    }
    window.addEventListener('keydown', opToets);
    return () => window.removeEventListener('keydown', opToets);
  }, [opKies, paar.pair_id]);

  return (
    <div>
      <p className="text-sm font-medium text-[#6E6E6E] text-center">
        Paar {nummer} van minimaal {minimum}. Kies met een tik, of met pijl links en pijl rechts.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {paar.kanten.map((kant) => (
          <button
            key={kant.kant}
            type="button"
            onClick={() => opKies(kant.kant)}
            className={`${KEUZE_KAART} ${KEUZE_UIT}`}
          >
            <div className="grid grid-cols-2 gap-4">
              {kant.items.map((item) => (
                <div key={item.product_id}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover rounded-xl"
                    />
                  )}
                  <span className="block text-sm text-[#4A4A4A] mt-2">
                    {item.name}, {formatPrijs(item.price)}
                  </span>
                </div>
              ))}
            </div>
            <span className={`${PRIMAIRE_KNOP} w-full mt-6 pointer-events-none`}>Deze kies ik</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Maak `src/components/start/Klaar.tsx`:

```tsx
/** Stap 6 (spec 6.6): samenvatting en door naar de resultaten. */
import React from 'react';
import type { Gelegenheid, Geslacht, Prijsband } from '@/keten/types';
import { budgetVoorBand } from '@/keten/kandidatenStart';
import { GELEGENHEID_LABEL } from './Gelegenheden';
import { GESLACHT_OPTIES } from './VoorWie';
import { PRIMAIRE_KNOP } from './StartStap';

export function Klaar({
  gender,
  occasions,
  band,
  aantalKeuzes,
  aantalNogo,
  bezig,
  fout,
  opAfronden,
}: {
  gender: Geslacht;
  occasions: Gelegenheid[];
  band: Prijsband;
  aantalKeuzes: number;
  aantalNogo: number;
  bezig: boolean;
  fout: string | null;
  opAfronden: () => void;
}) {
  const grenzen = budgetVoorBand(band);
  const geslachtLabel = GESLACHT_OPTIES.find((o) => o.waarde === gender)?.label ?? 'Beide';

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-sm">
        <dl className="grid grid-cols-1 gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm font-medium text-[#6E6E6E]">Voor wie</dt>
            <dd className="text-base text-[#1A1A1A]">{geslachtLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm font-medium text-[#6E6E6E]">Gelegenheden</dt>
            <dd className="text-base text-[#1A1A1A]">{occasions.map((o) => GELEGENHEID_LABEL[o]).join(', ')}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm font-medium text-[#6E6E6E]">Budget per stuk</dt>
            <dd className="text-base text-[#1A1A1A]">
              {grenzen.min} tot {grenzen.max} euro
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm font-medium text-[#6E6E6E]">Wat je liet zien</dt>
            <dd className="text-base text-[#1A1A1A]">
              {aantalKeuzes} keuzes, {aantalNogo} items die je nooit draagt
            </dd>
          </div>
        </dl>

        {fout && (
          <p className="text-sm font-medium text-[#C24A4A] mt-6" role="alert">
            {fout}
          </p>
        )}

        <button type="button" onClick={opAfronden} disabled={bezig} className={`${PRIMAIRE_KNOP} w-full mt-6`}>
          Bekijk je resultaten
        </button>

        {bezig && (
          <p className="text-sm text-[#6E6E6E] text-center mt-4" role="status">
            Je outfits worden samengesteld. Dit duurt tot een halve minuut.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Stap 6: Draai de test en zie hem slagen, en draai de design-poort**

```bash
npx vitest run src/components/start/__tests__/stappen.render.test.tsx
npm run design:poort -- src/components/start/StartStap.tsx src/components/start/VoorWie.tsx src/components/start/Gelegenheden.tsx src/components/start/Budget.tsx src/components/start/NoGo.tsx src/components/start/DitOfDat.tsx src/components/start/Klaar.tsx; echo "exit=$?"
```

Verwacht: 12 tests geslaagd; `design-poort: 7 bestanden schoon` en `exit=0`. Meldt de poort iets, los het op in de component; de poort wordt niet aangepast.

- [ ] **Stap 7: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/components/start/
git commit -m "feat(start): de zes stapcomponenten van onboarding v2

Page header op zand met voortgang, keuzekaarten in de geselecteerde state
uit het palet, een band zonder aanbod uitgeschakeld met een eerlijke tekst.
Badges op kaarten staan op top-3 left-3, zoals CLAUDE.md voorschrijft.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 11: `StartPage` en de route `/start`

**Bestanden:**
- Aanmaken: `src/pages/start/StartPage.tsx`
- Wijzigen: `src/App.tsx` (tekstankers: `const ResultsPreview     = lazy(` voor de lazy import, `ResultsPreview: () =>` voor het `WithSeo`-blok, `<Route path="/stijlquiz"` voor de route)
- Test: `src/pages/start/__tests__/StartPage.render.test.tsx`

**Interfaces:**
- Gebruikt: `startReducer`, `beginState`, `magVerder`, `STAPPEN`, `Stap` (taak 9); de zes stapcomponenten en `StartStap` (taak 10); `MIN_PAREN` (taak 3, alleen voor de tekst "paar n van minimaal 6"); `bouwTasteProfile`, `profileHash` (taak 2); `haalStartKandidaten`, `haalPairSets`, `telPairSets`, `kiesAnker`, `kiesNoGoItems`, `segmentenVoor`, `heeftDekking`, `BANDEN` (taak 5); `slaTasteProfielOp`, `bewaarLokaalProfiel` (taak 5); `browserKetenConfig()` (plan 3 taak 7); `getSessionId()` uit `@/utils/sessionId`; `track` uit `@/utils/telemetry`; `useUser()` uit `@/context/UserContext`; `useNavigate` uit `react-router-dom`.
- Levert: `export default function StartPage()`, bereikbaar op `/start` (geen inlogpoort, geen quizpoort).

Gedrag:
- De pagina beslist niets over de paren. Zij haalt ze op en geeft ze met `dispatch({ type: 'paren', paren })` aan de reducer; welk paar er op het scherm staat (`state.huidigPaar`), wanneer het scherm af is (`state.parenKlaar`) en wanneer de stap doorschuift bepaalt de reducer (taak 9). `volgendPaar` en `klaar` komen in dit bestand niet voor.
- Elke stap stuurt `track('onboarding_step', { step, index })` met `step` de naam uit `STAPPEN` en `index` de positie vanaf 1.
- Wegklikken voor de laatste stap stuurt `track('onboarding_abandoned', { step, index })`, zowel bij `beforeunload` als bij unmount.
- Data wordt geladen op het moment dat de stap hem nodig heeft: de drie bandkaarten zodra de gelegenheden vaststaan, de paren zodra de band vaststaat. Zo staat er niets in de weg tijdens de eerste twee stappen.
- Geen dekking (`heeftDekking` false voor alle drie de banden): de bezoeker krijgt een eerlijke melding en een knop terug, geen lege lijst.
- Afronden schrijft naar `taste_profiles`, bewaart profiel en hash lokaal en navigeert naar `/results?v=2&p=<profile_hash>`. Die parameter staat er zodat de pagina ook werkt na een herlaad met lege localStorage en zodat de link te delen is (besluit 7; taak 12 leest hem). Mislukt de insert, dan gaat de bezoeker toch door: de outfits hangen aan het profiel en de hash, niet aan de rij.

- [ ] **Stap 1: Schrijf de falende render-test**

Maak `src/pages/start/__tests__/StartPage.render.test.tsx`:

```tsx
/**
 * Render-test zonder jsdom: de pagina wordt server-side gerenderd, effects
 * draaien niet. Dat raakt precies de eerste stap, met lege reducer-state en
 * zonder data. Wat we bewaken: de pagina rendert zonder Supabase, toont stap 1
 * van 6 en gebruikt de page header op zand.
 */
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: null }),
}));

vi.mock('@/keten/browserConfig', () => ({
  browserKetenConfig: () => null,
}));

import StartPage from '../StartPage';

describe('StartPage', () => {
  it('rendert de eerste stap zonder Supabase', () => {
    const html = renderToString(<StartPage />);
    expect(html).toContain('Stap 1 van 6');
    expect(html).toContain('bg-[#F5F0EB]');
    expect(html).toContain('pt-44 md:pt-52');
    expect(html).toContain('Voor wie zoeken we kleding');
    expect(html).toContain('Dames');
    expect(html).toContain('Heren');
    expect(html).toContain('Beide');
  });

  it('heeft geen knop terug op de eerste stap en de knop verder staat uit', () => {
    const html = renderToString(<StartPage />);
    expect(html).not.toContain('>Terug<');
    expect(html.match(/disabled=""/g)?.length).toBe(1);
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/pages/start/__tests__/StartPage.render.test.tsx
```

Verwacht: `Failed to resolve import "../StartPage"`.

- [ ] **Stap 3: Schrijf de pagina**

Maak `src/pages/start/StartPage.tsx`:

```tsx
/**
 * Onboarding v2 (spec 6), route /start.
 *
 * De pagina doet drie dingen: data laden op het moment dat een stap hem nodig
 * heeft, tracking, en afronden. Alle keuzelogica zit in startReducer (taak 9),
 * de paarselectie in paarSelectie (taak 3) en de profielberekening in profiel
 * (taak 2). Deze pagina bevat daarom geen enkele regel die iets beslist over
 * smaak.
 *
 * Geen inlogpoort en geen quizpoort: spec 6 vraagt drie minuten van een
 * anonieme bezoeker.
 */
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Shirt, Sparkles, ThumbsDown, Wallet } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { track } from '@/utils/telemetry';
import { getSessionId } from '@/utils/sessionId';
import { browserKetenConfig } from '@/keten/browserConfig';
import { bouwTasteProfile, profileHash } from '@/keten/profiel';
import { MIN_PAREN } from '@/keten/paarSelectie';
import {
  BANDEN,
  haalPairSets,
  haalStartKandidaten,
  heeftDekking,
  kiesAnker,
  kiesNoGoItems,
  segmentenVoor,
  telPairSets,
} from '@/keten/kandidatenStart';
import { bewaarLokaalProfiel, slaTasteProfielOp } from '@/keten/tasteProfielOpslag';
import { segmentKey, type Kandidaat, type PaarKantNaam, type Prijsband } from '@/keten/types';
import { STAPPEN, beginState, magVerder, startReducer } from '@/components/start/startReducer';
import { StartStap } from '@/components/start/StartStap';
import { VoorWie } from '@/components/start/VoorWie';
import { Gelegenheden } from '@/components/start/Gelegenheden';
import { Budget, type BandKaart } from '@/components/start/Budget';
import { NoGo } from '@/components/start/NoGo';
import { DitOfDat } from '@/components/start/DitOfDat';
import { Klaar } from '@/components/start/Klaar';

const KOPPEN: Record<string, { badge: string; Icoon: typeof Shirt; titel: string; subtitel: string }> = {
  'voor-wie': {
    badge: 'Stap 1',
    Icoon: Shirt,
    titel: 'Voor wie zoeken we kleding',
    subtitel: 'Zo weten we welk deel van de catalogus we voor je openen.',
  },
  gelegenheden: {
    badge: 'Stap 2',
    Icoon: CalendarDays,
    titel: 'Waar draag je het',
    subtitel: 'Kies de momenten die het vaakst voorkomen in je week.',
  },
  budget: {
    badge: 'Stap 3',
    Icoon: Wallet,
    titel: 'Wat geef je uit per stuk',
    subtitel: 'De prijzen hieronder komen uit de echte catalogus.',
  },
  'no-go': {
    badge: 'Stap 4',
    Icoon: ThumbsDown,
    titel: 'Wat draag je nooit',
    subtitel: 'Tik wat je echt niet wilt zien. We laten het weg.',
  },
  'dit-of-dat': {
    badge: 'Stap 5',
    Icoon: Sparkles,
    titel: 'Dit of dat',
    subtitel: 'Kies steeds de outfit die je eerder zou aantrekken.',
  },
  klaar: {
    badge: 'Klaar',
    Icoon: Sparkles,
    titel: 'Dit weten we nu van je',
    subtitel: 'Klopt het? Dan stellen we je outfits samen.',
  },
};

export default function StartPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [state, dispatch] = useReducer(startReducer, beginState);
  const [sessionId] = useState(getSessionId);
  const cfg = useMemo(() => browserKetenConfig(), []);

  const [kandidatenPerBand, setKandidatenPerBand] = useState<Record<string, Kandidaat[]>>({});
  const [parenPerBand, setParenPerBand] = useState<Record<string, number>>({});
  const [laden, setLaden] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const afgerond = useRef(false);

  const index = STAPPEN.indexOf(state.stap) + 1;
  const kop = KOPPEN[state.stap];

  // Tracking: elke stap een event (spec 6, laatste regel).
  useEffect(() => {
    track('onboarding_step', { step: state.stap, index });
  }, [state.stap, index]);

  // Afbreken: wegklikken of de pagina verlaten voordat stap 6 gehaald is.
  useEffect(() => {
    function melden() {
      if (afgerond.current) return;
      track('onboarding_abandoned', { step: state.stap, index });
    }
    window.addEventListener('beforeunload', melden);
    return () => {
      window.removeEventListener('beforeunload', melden);
      melden();
    };
  }, [state.stap, index]);

  // De drie bandkaarten: kandidaten plus het aantal bruikbare paren per band.
  useEffect(() => {
    if (state.stap !== 'budget' || !cfg || !state.gender || state.occasions.length === 0) return;
    let levend = true;
    setLaden(true);
    setFout(null);
    (async () => {
      try {
        const perBand: Record<string, Kandidaat[]> = {};
        const tellingen: Record<string, number> = {};
        for (const band of BANDEN) {
          const kandidaten = await haalStartKandidaten(cfg, state.gender!, state.occasions, band);
          perBand[band] = kandidaten;
          const telling = await telPairSets(cfg, segmentenVoor(state.gender!, state.occasions, band));
          tellingen[band] = Math.min(...state.occasions.map((o) => telling.get(segmentKey({ gender: state.gender!, occasion: o, price_band: band })) ?? 0));
        }
        if (!levend) return;
        setKandidatenPerBand(perBand);
        setParenPerBand(tellingen);
      } catch (err) {
        if (levend) setFout(err instanceof Error ? err.message : String(err));
      } finally {
        if (levend) setLaden(false);
      }
    })();
    return () => {
      levend = false;
    };
  }, [state.stap, state.gender, state.occasions, cfg]);

  // De paren voor het dit-of-dat-scherm. Zodra ze binnen zijn gaan ze naar de
  // reducer; die bepaalt zelf het eerste paar en het stopmoment.
  useEffect(() => {
    if (state.stap !== 'dit-of-dat' || !cfg || !state.gender || !state.band || state.paren.length > 0) return;
    let levend = true;
    setLaden(true);
    setFout(null);
    (async () => {
      try {
        const uit = await haalPairSets(cfg, segmentenVoor(state.gender!, state.occasions, state.band!));
        if (levend) dispatch({ type: 'paren', paren: uit });
      } catch (err) {
        if (levend) setFout(err instanceof Error ? err.message : String(err));
      } finally {
        if (levend) setLaden(false);
      }
    })();
    return () => {
      levend = false;
    };
  }, [state.stap, state.gender, state.band, state.occasions, state.paren.length, cfg]);

  // Kiezen is een dispatch en verder niets: de reducer legt de keuze vast,
  // herberekent de assen, bepaalt het volgende paar en schuift zelf door naar
  // de samenvatting zodra hij klaar is (taak 9).
  const kies = useCallback((kant: PaarKantNaam) => dispatch({ type: 'keuze', kant }), []);

  const afronden = useCallback(async () => {
    if (!state.gender || !state.band) return;
    setBezig(true);
    setFout(null);
    try {
      const profiel = bouwTasteProfile({
        session_id: sessionId,
        user_id: user?.id ?? null,
        gender: state.gender,
        occasions: state.occasions,
        budget_min: BUDGET[state.band].min,
        budget_max: BUDGET[state.band].max,
        nogo_product_ids: state.nogo,
        choices: state.keuzes,
        paren: state.paren,
      });
      const hash = await profileHash(profiel);
      bewaarLokaalProfiel(profiel, hash);
      if (cfg) await slaTasteProfielOp(cfg, hash, profiel);
      afgerond.current = true;
      track('onboarding_step', { step: 'afgerond', index: STAPPEN.length });
      // De hash gaat mee in de URL, zodat de resultatenpagina ook werkt met een
      // lege localStorage en de link te delen is (besluit 7, taak 12).
      navigate(`/results?v=2&p=${hash}`);
    } catch (err) {
      setFout(err instanceof Error ? err.message : String(err));
      setBezig(false);
    }
  }, [state, sessionId, user?.id, cfg, navigate]);

  const bandKaarten: BandKaart[] = BANDEN.map((band) => ({
    band,
    anker: heeftDekking(kandidatenPerBand[band] ?? []) ? kiesAnker(kandidatenPerBand[band] ?? [], band) : null,
    paren: parenPerBand[band] ?? 0,
  }));

  const noGoItems = state.band ? kiesNoGoItems(kandidatenPerBand[state.band] ?? []) : [];

  function inhoud() {
    if (fout) {
      return (
        <p className="text-base text-[#C24A4A] text-center" role="alert">
          {fout}
        </p>
      );
    }
    if (laden) {
      return (
        <p className="text-base text-[#4A4A4A] text-center" role="status">
          Even zoeken in de catalogus.
        </p>
      );
    }

    switch (state.stap) {
      case 'voor-wie':
        return <VoorWie gekozen={state.gender} opKies={(g) => dispatch({ type: 'gender', waarde: g })} />;
      case 'gelegenheden':
        return <Gelegenheden gekozen={state.occasions} opTik={(g) => dispatch({ type: 'gelegenheid', waarde: g })} />;
      case 'budget':
        if (bandKaarten.every((k) => k.anker === null)) {
          return (
            <p className="text-base text-[#4A4A4A] text-center">
              Voor deze combinatie hebben we nog te weinig aanbod. Ga terug en kies een andere gelegenheid.
            </p>
          );
        }
        return <Budget kaarten={bandKaarten} gekozen={state.band} opKies={(b) => dispatch({ type: 'band', waarde: b })} />;
      case 'no-go':
        return <NoGo items={noGoItems} gekozen={state.nogo} opTik={(id) => dispatch({ type: 'nogo', productId: id })} />;
      case 'dit-of-dat':
        if (!state.huidigPaar) {
          return (
            <p className="text-base text-[#4A4A4A] text-center">
              Er zijn nog te weinig paren voor deze combinatie. Ga terug en kies een andere prijsband.
            </p>
          );
        }
        return <DitOfDat paar={state.huidigPaar} nummer={state.keuzes.length + 1} minimum={MIN_PAREN} opKies={kies} />;
      case 'klaar':
        return (
          <Klaar
            gender={state.gender ?? 'unisex'}
            occasions={state.occasions}
            band={state.band ?? 'tot50'}
            aantalKeuzes={state.keuzes.length}
            aantalNogo={state.nogo.length}
            bezig={bezig}
            fout={fout}
            opAfronden={afronden}
          />
        );
    }
  }

  const toonVerder = state.stap !== 'klaar' && state.stap !== 'dit-of-dat';

  return (
    <StartStap
      badge={kop.badge}
      Icoon={kop.Icoon}
      titel={kop.titel}
      subtitel={kop.subtitel}
      index={index}
      totaal={STAPPEN.length}
      opTerug={index > 1 ? () => dispatch({ type: 'terug' }) : undefined}
      opVerder={toonVerder ? () => dispatch({ type: 'verder' }) : undefined}
      verderUit={!magVerder(state)}
    >
      {inhoud()}
    </StartStap>
  );
}

/** Grenzen per band, uit BAND_GRENZEN; hier als lokale kaart zodat afronden synchroon blijft. */
const BUDGET: Record<Prijsband, { min: number; max: number }> = {
  tot50: { min: 0, max: 50 },
  '50tot100': { min: 50, max: 100 },
  '100tot200': { min: 100, max: 200 },
  boven200: { min: 200, max: 2000 },
};
```

- [ ] **Stap 4: Zet de route in `src/App.tsx`**

Controleer eerst de drie ankers:

```bash
grep -c "const ResultsPreview     = lazy(" src/App.tsx
grep -c "  ResultsPreview: () =>" src/App.tsx
grep -c "<Route path=\"/stijlquiz\"" src/App.tsx
```

Verwacht: drie keer `1`. Voeg daarna direct **onder** `const ResultsPreview     = lazy(() => import("@/pages/ResultsPreviewPage"));` toe:

```typescript
const StartV2            = lazy(() => import("@/pages/start/StartPage"));
```

Voeg in het `WithSeo`-blok direct **onder** de regel die begint met `  ResultsPreview: () =>` toe:

```typescript
  Start:      () => (<><Seo title="Start je stijlprofiel bij FitFi" description="Vier vragen en een paar keuzes tussen outfits. In minder dan drie minuten weet je wat bij je past." path="/start" noindex /><StartV2 /></>),
```

Voeg in de routes direct **onder** de regel `<Route path="/stijlquiz" element={<Navigate to="/onboarding" replace />} />` toe:

```tsx
                <Route path="/start" element={<WithSeo.Start />} />
```

`/start` staat bewust in het blok "Onboarding / Quiz" en niet in "App (afgeschermd)": geen `RequireAuth`, geen `RequireQuiz`.

- [ ] **Stap 5: Draai de tests, de design-poort en de pagina**

```bash
npx vitest run src/pages/start/__tests__/StartPage.render.test.tsx
npm run design:poort -- src/pages/start/StartPage.tsx; echo "exit=$?"
npm run dev
```

Verwacht: 2 tests geslaagd; `design-poort: 1 bestanden schoon` en `exit=0`.

Open daarna `http://localhost:5173/start` en loop de zes stappen door. Verwacht:
1. Zandkleurige page header met de badge "Stap 1", de voortgangsbalk op 17 procent, en drie kaarten. De navbar dekt de kop niet af (`pt-44 md:pt-52`).
2. Gelegenheden: na drie keuzes zijn de andere vier knoppen uitgeschakeld.
3. Budget: drie kaarten met een echte foto en prijs. Een band zonder aanbod is grijs met "Nog geen aanbod in deze prijsband". Zie je drie grijze kaarten, dan staan er nog geen paren in `pair_sets` voor dit segment; draai taak 8 stap 4 voor deze combinatie.
4. No-go: zes kaarten uit verschillende categorieen; een tik zet de badge "Nooit dragen" linksboven.
5. Dit-of-dat: twee outfits naast elkaar. Pijl links en pijl rechts werken. Na zes tot twaalf keuzes springt de pagina zelf naar stap 6.
6. Klaar: de samenvatting klopt met wat je koos en de knop heet letterlijk "Bekijk je resultaten". Klikken brengt je naar `/results?v=2&p=<hash>` met 64 hex-tekens in de adresbalk. Die pagina bestaat pas in taak 12; tot dan zie je de bestaande resultatenpagina of de inlogpagina.

Controleer in de browserconsole dat elke stap een event stuurt (in dev logt `track` naar `console.debug`): zes regels `[telemetry] onboarding_step { step: ..., index: ... }`. Klik daarna terug in de browser voordat je klaar bent en controleer dat er een regel `[telemetry] onboarding_abandoned` bij komt.

Controleer de rij in de database:

```bash
supabase db query --linked "select left(profile_hash, 8) as hash, gender, occasions, budget_min, budget_max, jsonb_array_length(choices) as keuzes, array_length(nogo_product_ids, 1) as nogo, array_length(liked_product_ids, 1) as liked from taste_profiles order by created_at desc limit 3" -o table
```

Verwacht: een rij met jouw keuzes, `keuzes` tussen 6 en 12 en `liked` gelijk aan het aantal items in de gekozen kanten.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/pages/start/ src/App.tsx
git commit -m "feat(start): pagina /start met de zes stappen en tracking per stap

Data wordt geladen op het moment dat een stap hem nodig heeft. De pagina
beslist niets over smaak; dat doen de reducer, de paarselectie en de
profielberekening. Geen inlogpoort: spec 6 vraagt drie minuten van een
anonieme bezoeker.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 12: `ResultsV2Page` met outfitkaarten en optionele maten

**Bestanden:**
- Aanmaken: `src/keten/leesOutfits.ts`
- Aanmaken: `src/components/results/OutfitV2Card.tsx`
- Aanmaken: `src/components/results/MatenOptioneel.tsx`
- Aanmaken: `src/pages/ResultsV2Page.tsx`
- Test: `src/keten/__tests__/leesOutfits.test.ts`, `src/components/results/__tests__/OutfitV2Card.render.test.tsx`

**Interfaces:**
- Gebruikt: `VerrijkteOutfit`, `VerrijktItem` uit `@/keten/types` (plan 3 taak 2); `KetenConfig`, `composeVoorProfiel(cfg, p): Promise<ComposeResultaat>` en `browserKetenConfig()` (plan 3 taak 7); de leesmodus van `compose-outfits` (taak 7); `OutfitRatingButtons(props: { outfitId: string; productIds: string[]; profileHash: string | null; userId?: string | null })` uit `@/components/results/OutfitRatingButtons` (plan 1 taak 9); `resolveProductUrl(product)` en `openProductLink(params)` uit `@/utils/affiliate`; `formatPrijs` (taak 5); `leesLokaalProfiel`, `slaMatenOp` (taak 5); `getSessionId()`; `track`; `useUser()`.
- Levert in `leesOutfits.ts`:
  ```typescript
  const HASH_PATROON: RegExp                    // ^[0-9a-f]{64}$
  const LEES_TIMEOUT_MS = 15_000
  type LeesUitkomst = { gevonden: true; outfits: VerrijkteOutfit[] } | { gevonden: false; reden: string }
  function isProfileHash(x: unknown): x is string
  function hashUitZoek(zoek: string): string | null
  function haalOutfitsViaHash(cfg: KetenConfig, profileHash: string): Promise<LeesUitkomst>
  ```
- Levert verder:
  ```typescript
  function OutfitV2Card(props: { outfit: VerrijkteOutfit; profileHash: string; positie: number; userId?: string | null }): JSX.Element
  function MatenOptioneel(props: { profileHash: string; sessionId: string; userId?: string | null }): JSX.Element
  const MATEN_SLEUTEL = 'ff_maten'
  export default function ResultsV2Page(): JSX.Element
  ```

**Twee manieren om aan de outfits te komen (besluit 7).**

1. **Het eigen profiel uit localStorage.** `/start` bewaart profiel en hash (taak 5) en `composeVoorProfiel` (plan 3) maakt of haalt de outfits. Dit is het gewone pad.
2. **Alleen een hash uit de URL.** Staat er geen profiel in localStorage en heeft de URL `?p=<64 hex-tekens>`, dan vraagt de pagina de leesmodus van `compose-outfits` om de gecachete outfits. Dat is het pad van een gedeelde link, een tweede toestel en een herlaad na het wissen van de opslag. Er wordt nooit een model aangeroepen, dus een onbekende of verlopen hash kost niets en geeft een eerlijke melding met de knop naar `/start`.

Zonder beide is de tekst "We kennen je keuzes nog niet" met "Begin gratis". De maten staan alleen onder je eigen resultaten: bij een gedeelde link zijn de maten van de kijker niet de maten van het profiel, en die horen niet bij die `profile_hash`.

Copy: de vaste CTA "Bekijk bij partner" per item (CLAUDE.md 10), de twee beoordelingsknoppen uit plan 1 ("Zou ik dragen" en "Nooit"), en de enige nieuwe knoptekst van dit plan: "Maten bewaren" (zie de randvoorwaarden bovenaan). Geen verzonnen matchpercentage: plan 3 taak 7 zet die op 0 en deze pagina toont hem niet.

De maten staan onder de outfits (spec 6 stap 6) en zijn optioneel. Ze gaan naar `taste_profile_sizes` (taak 1) en naar localStorage, zodat een herlaad ze terugzet. De beginwaarde wordt in de `useState`-initializer gelezen, niet in een effect, zodat de render-test hem ziet.

- [ ] **Stap 1: Schrijf `leesOutfits.ts` met zijn test**

Maak `src/keten/__tests__/leesOutfits.test.ts`:

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest';
import { haalOutfitsViaHash, hashUitZoek, isProfileHash } from '../leesOutfits';
import type { KetenConfig } from '../composeClient';

const HASH = 'a'.repeat(64);
const cfg = { supabase: {} as never, functionsUrl: 'https://voorbeeld.test/functions/v1', anonKey: 'anon' } as unknown as KetenConfig;
const outfit = { outfit_key: 'k'.repeat(64), title: 'Titel', occasion: 'work', items: [], reason: 'Reden' };

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(status: number, body: unknown) {
  const nep = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
  vi.stubGlobal('fetch', nep);
  return nep;
}

describe('isProfileHash en hashUitZoek', () => {
  it('vragen precies 64 kleine hex-tekens', () => {
    expect(isProfileHash(HASH)).toBe(true);
    expect(isProfileHash('a'.repeat(63))).toBe(false);
    expect(isProfileHash('A'.repeat(64))).toBe(false);
    expect(isProfileHash(null)).toBe(false);
  });

  it('lezen p uit de querystring en negeren rommel', () => {
    expect(hashUitZoek(`?v=2&p=${HASH}`)).toBe(HASH);
    expect(hashUitZoek('?v=2')).toBeNull();
    expect(hashUitZoek('?p=te-kort')).toBeNull();
    expect(hashUitZoek('')).toBeNull();
  });
});

describe('haalOutfitsViaHash', () => {
  it('vraagt de leesmodus aan met de anon key', async () => {
    const nep = stubFetch(200, { ok: true, outfits: [outfit] });
    expect(await haalOutfitsViaHash(cfg, HASH)).toEqual({ gevonden: true, outfits: [outfit] });
    const [url, opties] = nep.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://voorbeeld.test/functions/v1/compose-outfits');
    expect(JSON.parse(String(opties.body))).toEqual({ mode: 'lees', profile_hash: HASH });
  });

  it('roept niets aan bij een sleutel met de verkeerde vorm', async () => {
    const nep = stubFetch(200, { ok: true, outfits: [outfit] });
    expect(await haalOutfitsViaHash(cfg, 'te-kort')).toEqual({ gevonden: false, reden: 'ongeldige sleutel' });
    expect(nep).not.toHaveBeenCalled();
  });

  it('geeft niet gevonden bij 404 en bij een leeg antwoord', async () => {
    stubFetch(404, { ok: false, reason: 'niet gevonden' });
    expect(await haalOutfitsViaHash(cfg, HASH)).toEqual({ gevonden: false, reden: 'niet gevonden' });
    stubFetch(200, { ok: true, outfits: [] });
    expect((await haalOutfitsViaHash(cfg, HASH)).gevonden).toBe(false);
  });

  it('valt netjes om als de aanroep mislukt', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('netwerk');
    }));
    expect(await haalOutfitsViaHash(cfg, HASH)).toEqual({
      gevonden: false,
      reden: 'de outfits konden niet worden opgehaald',
    });
  });
});
```

```bash
npx vitest run src/keten/__tests__/leesOutfits.test.ts
```

Verwacht: `Failed to resolve import "../leesOutfits"`.

Maak daarna `src/keten/leesOutfits.ts`:

```typescript
/**
 * De outfits bij een profile_hash ophalen, zonder profiel (besluit 7).
 *
 * Nodig voor een gedeelde link naar /results?v=2&p=<hash>, voor een tweede
 * toestel en voor een herlaad met lege localStorage. taste_profiles heeft
 * bewust geen select-policy, dus de browser kan het profiel niet zelf
 * terughalen. De leesmodus van compose-outfits (taak 7) geeft alleen de
 * gecachete outfits terug en roept nooit een model aan, dus een onbekende hash
 * kost niets.
 */
import type { KetenConfig } from './composeClient';
import type { VerrijkteOutfit } from './types';

/** sha256-hex uit spec 5.2.1. Dezelfde controle staat in de edge function. */
export const HASH_PATROON = /^[0-9a-f]{64}$/;

/** Korter dan het budget van composeVoorProfiel: dit is een cache-lezing, geen modelaanroep. */
export const LEES_TIMEOUT_MS = 15_000;

export type LeesUitkomst =
  | { gevonden: true; outfits: VerrijkteOutfit[] }
  | { gevonden: false; reden: string };

export function isProfileHash(x: unknown): x is string {
  return typeof x === 'string' && HASH_PATROON.test(x);
}

/** De profile_hash uit ?p= in de querystring, of null als hij ontbreekt of niet klopt. */
export function hashUitZoek(zoek: string): string | null {
  const p = new URLSearchParams(zoek).get('p');
  return isProfileHash(p) ? p : null;
}

export async function haalOutfitsViaHash(cfg: KetenConfig, profileHash: string): Promise<LeesUitkomst> {
  if (!isProfileHash(profileHash)) return { gevonden: false, reden: 'ongeldige sleutel' };

  let res: Response;
  try {
    res = await fetch(`${cfg.functionsUrl}/compose-outfits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.anonKey}`,
        apikey: cfg.anonKey,
      },
      body: JSON.stringify({ mode: 'lees', profile_hash: profileHash }),
      signal: AbortSignal.timeout(LEES_TIMEOUT_MS),
    });
  } catch {
    return { gevonden: false, reden: 'de outfits konden niet worden opgehaald' };
  }

  if (res.status === 404) return { gevonden: false, reden: 'niet gevonden' };
  if (!res.ok) return { gevonden: false, reden: `compose-outfits gaf ${res.status}` };

  const data = (await res.json()) as { ok?: boolean; outfits?: VerrijkteOutfit[]; reason?: string };
  if (!data.ok || !Array.isArray(data.outfits) || data.outfits.length === 0) {
    return { gevonden: false, reden: data.reason ?? 'niet gevonden' };
  }
  return { gevonden: true, outfits: data.outfits };
}
```

```bash
npx vitest run src/keten/__tests__/leesOutfits.test.ts
```

Verwacht: 6 tests geslaagd.

- [ ] **Stap 2: Schrijf de falende render-test**

Maak `src/components/results/__tests__/OutfitV2Card.render.test.tsx`:

```tsx
/**
 * Render-test zonder jsdom: server-side render, geen effects. Wat we bewaken:
 * de vaste CTA-tekst, de items met prijs, geen matchpercentage, en dat een
 * item zonder bruikbare link geen knop krijgt.
 */
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

vi.mock('@/services/ratings/outfitRatings', () => ({
  outfitKey: vi.fn(async () => 'k'.repeat(64)),
  saveOutfitRating: vi.fn(async () => ({ ok: true })),
}));

import { OutfitV2Card } from '../OutfitV2Card';
import type { Categorie, ProductAttrs, RuwProduct, VerrijkteOutfit } from '@/keten/types';

function attrs(category: Categorie): ProductAttrs {
  return {
    is_fashion: true, category, gender: 'female', formality: 3, occasions: ['work'],
    silhouette: 'regular', color_temp: 'neutraal', lightness: 'medium', pattern: 'effen',
    shoe_type: null, colors: ['zwart'], materials: ['katoen'], seasons: ['herfst'],
    price_band: '50tot100', confidence: 0.9, tagger_version: 't',
  };
}

function product(id: string, price: number, metLink: boolean): RuwProduct {
  return {
    id, name: `Product ${id}`, brand: 'Merk', price, image_url: `https://voorbeeld.test/${id}.jpg`,
    retailer: 'H&M', url: null, affiliate_url: metLink ? 'https://winkel.test/artikel' : null,
    product_url: null, gender: 'female', colors: ['zwart'], sizes: ['M'], in_stock: true, description: null,
  };
}

const outfit: VerrijkteOutfit = {
  outfit_key: 'o'.repeat(64),
  title: 'Rustig pak voor werk',
  occasion: 'work',
  reason: 'De wollen blazer maakt je outfit meteen af. De donkere broek eronder houdt het rustig.',
  items: [
    { product_id: 'i1', role: 'top', product: product('i1', 79, true), attrs: attrs('top') },
    { product_id: 'i2', role: 'bottom', product: product('i2', 59.95, false), attrs: attrs('bottom') },
    { product_id: 'i3', role: 'footwear', product: product('i3', 99, true), attrs: attrs('footwear') },
  ],
};

const HASH = 'a'.repeat(64);

describe('OutfitV2Card', () => {
  it('toont titel, reden en de items met prijs', () => {
    const html = renderToString(<OutfitV2Card outfit={outfit} profileHash={HASH} positie={1} />);
    expect(html).toContain('Rustig pak voor werk');
    expect(html).toContain('De wollen blazer maakt je outfit meteen af');
    expect(html).toContain('€ 79,00');
    expect(html).toContain('€ 59,95');
    expect(html).toContain('aspect-[3/4]');
    expect(html).toContain('loading="lazy"');
  });

  it('gebruikt de vaste CTA-tekst, alleen voor items met een bruikbare link', () => {
    const html = renderToString(<OutfitV2Card outfit={outfit} profileHash={HASH} positie={1} />);
    expect(html.match(/Bekijk bij partner/g)?.length).toBe(2);
  });

  it('toont de twee beoordelingsknoppen en geen matchpercentage', () => {
    const html = renderToString(<OutfitV2Card outfit={outfit} profileHash={HASH} positie={1} />);
    expect(html).toContain('Zou ik dragen');
    expect(html).toContain('Nooit');
    expect(html).not.toContain('%');
  });

  it('gebruikt de kaartstijl uit CLAUDE.md', () => {
    const html = renderToString(<OutfitV2Card outfit={outfit} profileHash={HASH} positie={1} />);
    expect(html).toContain('bg-white border border-[#E5E5E5] rounded-2xl p-6');
    expect(html).toContain('hover:shadow-md');
  });
});
```

- [ ] **Stap 3: Draai de test en zie hem falen**

```bash
npx vitest run src/components/results/__tests__/OutfitV2Card.render.test.tsx
```

Verwacht: `Failed to resolve import "../OutfitV2Card"`.

- [ ] **Stap 4: Schrijf de outfitkaart**

Maak `src/components/results/OutfitV2Card.tsx`:

```tsx
/**
 * Een outfit uit de stylist-route (spec 6 stap 6): titel, reden, items met
 * prijs, per item de vaste CTA "Bekijk bij partner", en eronder de twee
 * beoordelingsknoppen uit plan 1.
 *
 * Geen matchpercentage: de stylist levert er geen, en een verzonnen getal is
 * precies wat spec 3 uit het product wil halen.
 */
import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { VerrijkteOutfit, VerrijktItem } from '@/keten/types';
import { openProductLink, resolveProductUrl } from '@/utils/affiliate';
import { formatPrijs } from '@/keten/prijs';
import { OutfitRatingButtons } from '@/components/results/OutfitRatingButtons';

const ROL_LABEL: Record<string, string> = {
  top: 'Bovenstuk',
  bottom: 'Onderstuk',
  footwear: 'Schoenen',
  outerwear: 'Jas',
  dress: 'Jurk',
  accessory: 'Accessoire',
};

function Item({ item, outfitKey, positie, userId }: { item: VerrijktItem; outfitKey: string; positie: number; userId?: string | null }) {
  const link = resolveProductUrl(item.product);

  return (
    <div>
      {item.product.image_url && (
        <img
          src={item.product.image_url}
          alt={item.product.name}
          loading="lazy"
          className="w-full aspect-[3/4] object-cover rounded-xl"
        />
      )}
      <span className="block text-sm font-medium text-[#6E6E6E] mt-4">{ROL_LABEL[item.role] ?? item.role}</span>
      <span className="block text-base text-[#1A1A1A] mt-2">{item.product.name}</span>
      <span className="block text-sm text-[#4A4A4A] mt-2">
        {item.product.brand ?? 'Merk onbekend'}, {formatPrijs(item.product.price)}
      </span>
      {link && (
        <button
          type="button"
          onClick={() =>
            openProductLink({
              product: item.product,
              outfitId: outfitKey,
              slot: positie,
              userId: userId ?? undefined,
              source: 'results_v2',
            })
          }
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 mt-4 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base transition-colors duration-200"
        >
          Bekijk bij partner
          <ExternalLink className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function OutfitV2Card({
  outfit,
  profileHash,
  positie,
  userId = null,
}: {
  outfit: VerrijkteOutfit;
  profileHash: string;
  positie: number;
  userId?: string | null;
}) {
  return (
    <article className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-xl md:text-2xl font-semibold text-[#1A1A1A]">{outfit.title}</h3>
      <p className="text-base text-[#4A4A4A] leading-relaxed mt-2 max-w-prose">{outfit.reason}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {outfit.items.map((item) => (
          <Item key={item.product_id} item={item} outfitKey={outfit.outfit_key} positie={positie} userId={userId} />
        ))}
      </div>

      <div className="mt-6">
        <OutfitRatingButtons
          key={profileHash}
          outfitId={outfit.outfit_key}
          productIds={outfit.items.map((i) => i.product_id)}
          profileHash={profileHash}
          userId={userId}
        />
      </div>
    </article>
  );
}
```

- [ ] **Stap 5: Schrijf de maten en de pagina**

Maak `src/components/results/MatenOptioneel.tsx`:

```tsx
/**
 * Optionele maten onder de outfits (spec 6 stap 6).
 *
 * Schrijft naar taste_profile_sizes en naar localStorage. De beginwaarde komt
 * uit de useState-initializer, niet uit een effect, zodat een herlaad de maten
 * meteen terugzet en de render-test ze ziet.
 *
 * De stylist gebruikt de maten nog niet. Ze staan er omdat een invoer die
 * nergens landt precies is wat spec 1 wil doorbreken; ze zijn te tellen en via
 * profile_hash te koppelen aan outfit_ratings.
 */
import React, { useState } from 'react';
import { browserKetenConfig } from '@/keten/browserConfig';
import { slaMatenOp } from '@/keten/tasteProfielOpslag';
import { track } from '@/utils/telemetry';

export const MATEN_SLEUTEL = 'ff_maten';

const VELDEN: ReadonlyArray<{ sleutel: string; label: string; hint: string }> = [
  { sleutel: 'top', label: 'Bovenstuk', hint: 'Bijvoorbeeld M of 38' },
  { sleutel: 'bottom', label: 'Onderstuk', hint: 'Bijvoorbeeld 31/32 of 40' },
  { sleutel: 'shoe', label: 'Schoenen', hint: 'Bijvoorbeeld 42' },
];

function leesLokaal(): Record<string, string> {
  try {
    const ruw = typeof window === 'undefined' ? null : window.localStorage.getItem(MATEN_SLEUTEL);
    const data = ruw ? JSON.parse(ruw) : null;
    return data && typeof data === 'object' ? (data as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function MatenOptioneel({
  profileHash,
  sessionId,
  userId = null,
}: {
  profileHash: string;
  sessionId: string;
  userId?: string | null;
}) {
  const [maten, setMaten] = useState<Record<string, string>>(leesLokaal);
  const [bewaard, setBewaard] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function bewaar() {
    setBezig(true);
    try {
      window.localStorage.setItem(MATEN_SLEUTEL, JSON.stringify(maten));
    } catch {
      // Niet kunnen opslaan is niet fataal; de rij in de database telt.
    }
    const cfg = browserKetenConfig();
    if (cfg) await slaMatenOp(cfg, profileHash, sessionId, maten, userId);
    track('maten_opgeslagen', { velden: Object.keys(maten).filter((k) => maten[k]).length });
    setBewaard(true);
    setBezig(false);
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-sm max-w-lg mx-auto">
      <h3 className="text-xl font-semibold text-[#1A1A1A]">Je maten, als je wilt</h3>
      <p className="text-base text-[#4A4A4A] mt-2">
        Handig voor later. Je kunt ze ook leeg laten en gewoon verder kijken.
      </p>

      <div className="grid grid-cols-1 gap-4 mt-6">
        {VELDEN.map((veld) => (
          <div key={veld.sleutel}>
            <label htmlFor={`maat-${veld.sleutel}`} className="block text-sm font-medium text-[#1A1A1A]">
              {veld.label}
            </label>
            <input
              id={`maat-${veld.sleutel}`}
              type="text"
              inputMode="text"
              maxLength={32}
              placeholder={veld.hint}
              value={maten[veld.sleutel] ?? ''}
              onChange={(e) => {
                setBewaard(false);
                setMaten((vorig) => ({ ...vorig, [veld.sleutel]: e.target.value }));
              }}
              className="w-full min-h-[48px] px-4 mt-2 rounded-xl border border-[#E5E5E5] bg-white text-base text-[#1A1A1A] placeholder:text-[#6E6E6E] focus:outline-none focus:ring-2 focus:ring-[#A85740]/20 focus:border-[#A85740] transition-colors duration-200"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={bewaar}
        disabled={bezig}
        className="inline-flex items-center justify-center w-full min-h-[48px] px-6 mt-6 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base transition-colors duration-200 disabled:opacity-50"
      >
        Maten bewaren
      </button>

      {bewaard && (
        <p className="text-sm text-[#3D8B5E] text-center mt-4" role="status">
          Bewaard.
        </p>
      )}
    </div>
  );
}
```

Maak `src/pages/ResultsV2Page.tsx`:

```tsx
/**
 * Resultaten v2 (spec 6 stap 6), bereikbaar via /results?v=2.
 *
 * Twee manieren om aan de outfits te komen (besluit 7):
 *   1. Het profiel dat /start lokaal bewaarde. Dan maakt of haalt
 *      composeVoorProfiel (plan 3) de outfits.
 *   2. Alleen ?p=<profile_hash> in de URL, als localStorage leeg is. Dan geeft
 *      de leesmodus van compose-outfits (taak 7) de gecachete outfits terug,
 *      zonder modelaanroep. Dat is het pad van een gedeelde link en van een
 *      tweede toestel; zonder dat pad zou een gedeelde link niets tonen terwijl
 *      de outfits er wel zijn.
 *
 * Geen inlogpoort en geen quizpoort: KetenSwitch (taak 13) zet die alleen om de
 * v1-tak.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { track } from '@/utils/telemetry';
import { getSessionId } from '@/utils/sessionId';
import { browserKetenConfig } from '@/keten/browserConfig';
import { composeVoorProfiel } from '@/keten/composeClient';
import { haalOutfitsViaHash, hashUitZoek } from '@/keten/leesOutfits';
import { leesLokaalProfiel } from '@/keten/tasteProfielOpslag';
import type { OutfitBron, VerrijkteOutfit } from '@/keten/types';
import { OutfitV2Card } from '@/components/results/OutfitV2Card';
import { MatenOptioneel } from '@/components/results/MatenOptioneel';

export default function ResultsV2Page() {
  const { user } = useUser();
  const [sessionId] = useState(getSessionId);
  const [lokaal] = useState(leesLokaalProfiel);
  const [gedeeldeHash] = useState(() =>
    typeof window === 'undefined' ? null : hashUitZoek(window.location.search)
  );
  const [outfits, setOutfits] = useState<VerrijkteOutfit[]>([]);
  const [bron, setBron] = useState<OutfitBron | null>(null);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<string | null>(null);
  const [verlopen, setVerlopen] = useState(false);
  const cfg = useMemo(() => browserKetenConfig(), []);

  const profileHash = lokaal?.profile_hash ?? gedeeldeHash;

  useEffect(() => {
    if (!lokaal && !gedeeldeHash) {
      setLaden(false);
      return;
    }
    if (!cfg) {
      setFout('De verbinding met de catalogus staat uit.');
      setLaden(false);
      return;
    }

    let levend = true;
    (async () => {
      try {
        if (lokaal) {
          const resultaat = await composeVoorProfiel(cfg, lokaal.profiel);
          if (!levend) return;
          setOutfits(resultaat.outfits);
          setBron(resultaat.bron);
          track('results_v2_view', {
            bron: resultaat.bron,
            outfits: resultaat.outfits.length,
            profile_hash: resultaat.profile_hash,
          });
          return;
        }

        // Alleen een hash: de leesmodus, zonder profiel en zonder modelaanroep.
        const uitkomst = await haalOutfitsViaHash(cfg, gedeeldeHash as string);
        if (!levend) return;
        if (!uitkomst.gevonden) {
          setVerlopen(true);
          track('results_v2_view', { bron: 'gedeeld', outfits: 0, profile_hash: gedeeldeHash });
          return;
        }
        setOutfits(uitkomst.outfits);
        setBron('cache');
        track('results_v2_view', {
          bron: 'gedeeld',
          outfits: uitkomst.outfits.length,
          profile_hash: gedeeldeHash,
        });
      } catch (err) {
        if (levend) setFout(err instanceof Error ? err.message : String(err));
      } finally {
        if (levend) setLaden(false);
      }
    })();
    return () => {
      levend = false;
    };
  }, [cfg, lokaal, gedeeldeHash]);

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <header className="bg-[#F5F0EB] pt-44 md:pt-52 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A]">
              <Sparkles className="w-5 h-5 text-[#A85740]" aria-hidden="true" />
              Jouw outfits
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center mt-6">
            Zes outfits op basis van je keuzes
          </h1>
          <p className="text-base text-[#4A4A4A] text-center mt-4 max-w-lg mx-auto">
            Zeg per outfit of je hem zou dragen. Daar worden de volgende beter van.
          </p>
        </div>
      </header>

      <section className="bg-[#FAFAF8] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!profileHash && (
            <div className="text-center">
              <p className="text-base text-[#4A4A4A]">We kennen je keuzes nog niet.</p>
              <Link
                to="/start"
                className="inline-flex items-center justify-center min-h-[48px] px-6 mt-6 rounded-xl bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base transition-colors duration-200"
              >
                Begin gratis
              </Link>
            </div>
          )}

          {profileHash && laden && (
            <p className="text-base text-[#4A4A4A] text-center" role="status">
              Je outfits worden samengesteld. Dit duurt tot een halve minuut.
            </p>
          )}

          {profileHash && !laden && fout && (
            <p className="text-base text-[#C24A4A] text-center" role="alert">
              {fout}
            </p>
          )}

          {profileHash && !laden && !fout && verlopen && (
            <div className="text-center">
              <p className="text-base text-[#4A4A4A]">
                Bij deze link staan geen outfits meer. Doe de vragen zelf, dat duurt drie minuten.
              </p>
              <Link
                to="/start"
                className="inline-flex items-center justify-center min-h-[48px] px-6 mt-6 rounded-xl bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base transition-colors duration-200"
              >
                Begin gratis
              </Link>
            </div>
          )}

          {profileHash && !laden && !fout && !verlopen && outfits.length === 0 && (
            <p className="text-base text-[#4A4A4A] text-center">
              Er kwamen geen outfits uit. Probeer het opnieuw met een andere prijsband.
            </p>
          )}

          {outfits.length > 0 && profileHash && (
            <div className="grid grid-cols-1 gap-6">
              {outfits.map((outfit, i) => (
                <OutfitV2Card
                  key={outfit.outfit_key}
                  outfit={outfit}
                  profileHash={profileHash}
                  positie={i + 1}
                  userId={user?.id ?? null}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {lokaal && outfits.length > 0 && (
        <section className="bg-[#F5F0EB] py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MatenOptioneel
              profileHash={lokaal.profile_hash}
              sessionId={sessionId}
              userId={user?.id ?? null}
            />
          </div>
        </section>
      )}

      {bron === 'v2-fallback' && (
        <p className="sr-only" data-bron={bron}>
          Deze outfits komen uit het noodpad.
        </p>
      )}
    </main>
  );
}
```

De maten staan alleen onder je eigen resultaten (`lokaal`). Bij een gedeelde link kijkt iemand anders mee; zijn maten horen niet bij die `profile_hash`.

- [ ] **Stap 6: Draai de tests en de design-poort**

```bash
npx vitest run src/keten/__tests__/leesOutfits.test.ts src/components/results/__tests__/OutfitV2Card.render.test.tsx
npm run design:poort -- src/components/results/OutfitV2Card.tsx src/components/results/MatenOptioneel.tsx src/pages/ResultsV2Page.tsx; echo "exit=$?"
```

Verwacht: 10 tests geslaagd (6 voor `leesOutfits`, 4 voor de kaart); `design-poort: 3 bestanden schoon` en `exit=0`.

- [ ] **Stap 7: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/keten/leesOutfits.ts src/keten/__tests__/leesOutfits.test.ts src/components/results/OutfitV2Card.tsx src/components/results/MatenOptioneel.tsx src/components/results/__tests__/OutfitV2Card.render.test.tsx src/pages/ResultsV2Page.tsx
git commit -m "feat(results): resultatenpagina v2 met zes outfits, beoordeling en maten

Per item de vaste CTA Bekijk bij partner, per outfit de knoppen Zou ik
dragen en Nooit uit plan 1. Geen matchpercentage. De maten landen in
taste_profile_sizes in plaats van nergens.

Is localStorage leeg, dan haalt ?p=<profile_hash> de gecachete outfits op via
de leesmodus. Zo toont een gedeelde link wel iets, terwijl taste_profiles
dicht blijft. De knoptekst Maten bewaren is de enige nieuwe CTA in dit plan.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

De route naar deze pagina komt in taak 13; tot dan is hij alleen via een directe import te zien.

---

### Taak 13: `KetenSwitch` op `/onboarding` en `/results`

**Bestanden:**
- Aanmaken: `src/components/keten/KetenSwitch.tsx`
- Wijzigen: `src/App.tsx` (tekstankers: `const StartV2            = lazy(` uit taak 11, `  Start:      () =>` uit taak 11, `<Route path="/onboarding" element={<WithSeo.Onboarding />} />` (twee keer, regel 145 en 172 gemeten op 2026-09-16), `<Route path="/results" element={<RequireAuth><RequireQuiz><WithSeo.Results /></RequireQuiz></RequireAuth>} />`)
- Test: `src/components/keten/__tests__/KetenSwitch.render.test.tsx`

**Interfaces:**
- Gebruikt: `useRemoteFlag(naam): { aan: boolean; geladen: boolean }` (taak 4).
- Levert:
  ```typescript
  const KETEN_VLAG = 'keten_v2'
  type Versie = 'v1' | 'v2' | 'wachten'
  function kiesVersie(zoek: string, vlagAan: boolean, geladen: boolean): Versie
  interface KetenSwitchProps { v1: React.ReactElement; v2: React.ReactElement }
  function KetenSwitch(props: KetenSwitchProps): React.ReactElement
  ```

Regels van `kiesVersie`, in deze volgorde:
1. `?v=2` in de URL geeft altijd v2, ook als de vlag uit staat. Dat is hoe Luc de poort uit taak 15 doorloopt en hoe `/start` naar `/results?v=2` verwijst zonder van de vlag af te hangen.
2. `?v=1` geeft altijd v1. Zo kun je met de vlag aan toch de oude pagina bekijken.
3. Zonder `?v=` en met de vlag nog niet geladen: `wachten`. De hook leest zijn cache in de initializer, dus dit duurt alleen bij het allereerste bezoek.
4. Daarna beslist de vlag.

Waarom de twee poorten in de v1-tak staan en niet om de hele route: besluit 5 in "Wat de spec openlaat". `/results` staat nu achter `RequireAuth` en `RequireQuiz`; een anonieme bezoeker die `/start` afrondt zou `/results?v=2` anders nooit zien.

`KetenSwitch` leest de querystring uit `window.location.search` en niet uit `useSearchParams`, zodat de component ook buiten een Router te renderen is en de render-test geen router nodig heeft. React Router werkt de `history` bij voordat het opnieuw rendert, dus de waarde klopt na een `navigate('/results?v=2')`.

- [ ] **Stap 1: Schrijf de falende test**

Maak `src/components/keten/__tests__/KetenSwitch.render.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

const vlag = { aan: false, geladen: true };

vi.mock('@/hooks/useRemoteFlag', () => ({
  useRemoteFlag: () => vlag,
}));

import { KETEN_VLAG, KetenSwitch, kiesVersie } from '../KetenSwitch';

describe('kiesVersie', () => {
  it('laat de querystring altijd winnen', () => {
    expect(kiesVersie('?v=2', false, true)).toBe('v2');
    expect(kiesVersie('?v=1', true, true)).toBe('v1');
    expect(kiesVersie('?iets=anders&v=2', false, false)).toBe('v2');
  });

  it('wacht zolang de vlag niet geladen is', () => {
    expect(kiesVersie('', false, false)).toBe('wachten');
    expect(kiesVersie('?x=1', true, false)).toBe('wachten');
  });

  it('volgt daarna de vlag', () => {
    expect(kiesVersie('', true, true)).toBe('v2');
    expect(kiesVersie('', false, true)).toBe('v1');
  });

  it('negeert een waarde die geen 1 of 2 is', () => {
    expect(kiesVersie('?v=3', true, true)).toBe('v2');
    expect(kiesVersie('?v=3', false, true)).toBe('v1');
  });
});

describe('KetenSwitch', () => {
  it('rendert v1 als de vlag uit staat', () => {
    vlag.aan = false;
    vlag.geladen = true;
    const html = renderToString(<KetenSwitch v1={<p>oude pagina</p>} v2={<p>nieuwe pagina</p>} />);
    expect(html).toContain('oude pagina');
    expect(html).not.toContain('nieuwe pagina');
  });

  it('rendert v2 als de vlag aan staat', () => {
    vlag.aan = true;
    vlag.geladen = true;
    const html = renderToString(<KetenSwitch v1={<p>oude pagina</p>} v2={<p>nieuwe pagina</p>} />);
    expect(html).toContain('nieuwe pagina');
  });

  it('toont een laadstatus zolang de vlag onbekend is', () => {
    vlag.aan = false;
    vlag.geladen = false;
    const html = renderToString(<KetenSwitch v1={<p>oude pagina</p>} v2={<p>nieuwe pagina</p>} />);
    expect(html).toContain('role="status"');
    expect(html).not.toContain('oude pagina');
    expect(html).not.toContain('nieuwe pagina');
  });

  it('kent de naam van de vlag', () => {
    expect(KETEN_VLAG).toBe('keten_v2');
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run src/components/keten/__tests__/KetenSwitch.render.test.tsx
```

Verwacht: `Failed to resolve import "../KetenSwitch"`.

- [ ] **Stap 3: Schrijf de schakelaar**

Maak `src/components/keten/KetenSwitch.tsx`:

```tsx
/**
 * Kiest tussen de bestaande pagina en de v2-pagina.
 *
 * ?v=2 en ?v=1 in de URL winnen altijd van de vlag: zo kan Luc de poort uit
 * taak 15 doorlopen voordat de vlag omgaat, en kan /start naar /results?v=2
 * verwijzen zonder van de vlag af te hangen.
 *
 * De querystring komt uit window.location.search en niet uit useSearchParams,
 * zodat deze component ook zonder Router te renderen is (de render-test heeft
 * er geen nodig). React Router werkt history bij voordat het opnieuw rendert.
 */
import React from 'react';
import { useRemoteFlag } from '@/hooks/useRemoteFlag';

export const KETEN_VLAG = 'keten_v2';

export type Versie = 'v1' | 'v2' | 'wachten';

export function kiesVersie(zoek: string, vlagAan: boolean, geladen: boolean): Versie {
  const gevraagd = new URLSearchParams(zoek).get('v');
  if (gevraagd === '2') return 'v2';
  if (gevraagd === '1') return 'v1';
  if (!geladen) return 'wachten';
  return vlagAan ? 'v2' : 'v1';
}

export interface KetenSwitchProps {
  v1: React.ReactElement;
  v2: React.ReactElement;
}

export function KetenSwitch({ v1, v2 }: KetenSwitchProps): React.ReactElement {
  const { aan, geladen } = useRemoteFlag(KETEN_VLAG);
  const zoek = typeof window === 'undefined' ? '' : window.location.search;
  const versie = kiesVersie(zoek, aan, geladen);

  if (versie === 'wachten') {
    return (
      <div
        className="flex items-center justify-center bg-[#FAFAF8] py-16 md:py-24"
        role="status"
        aria-live="polite"
      >
        <span className="text-sm text-[#6E6E6E]">Laden</span>
      </div>
    );
  }

  return versie === 'v2' ? v2 : v1;
}

export default KetenSwitch;
```

- [ ] **Stap 4: Zet de schakelaar in `src/App.tsx`**

Controleer de ankers:

```bash
grep -c "const StartV2            = lazy(" src/App.tsx
grep -c "<Route path=\"/onboarding\" element={<WithSeo.Onboarding />} />" src/App.tsx
grep -c "<Route path=\"/results\" element={<RequireAuth><RequireQuiz><WithSeo.Results /></RequireQuiz></RequireAuth>} />" src/App.tsx
```

Verwacht: `1`, `2` (regel 145 in de fullscreen-tak en regel 172 in de gewone tak), `1`.

Voeg bij de imports bovenaan toe, onder `import { RequireQuiz } from "@/components/auth/RequireQuiz";`:

```typescript
import { KetenSwitch } from "@/components/keten/KetenSwitch";
```

Voeg direct onder `const StartV2            = lazy(() => import("@/pages/start/StartPage"));` toe:

```typescript
const ResultsV2          = lazy(() => import("@/pages/ResultsV2Page"));
```

Voeg in het `WithSeo`-blok direct onder de regel die begint met `  Start:      () =>` toe:

```typescript
  ResultsV2:  () => (<><Seo title="Jouw outfits bij FitFi" description="Zes outfits op basis van je keuzes, met prijzen en directe shoplinks." path="/results" noindex /><ResultsV2 /></>),
```

Vervang **beide** voorkomens van

```tsx
<Route path="/onboarding" element={<WithSeo.Onboarding />} />
```

door

```tsx
<Route path="/onboarding" element={<KetenSwitch v1={<WithSeo.Onboarding />} v2={<Navigate to="/start" replace />} />} />
```

Vervang

```tsx
<Route path="/results" element={<RequireAuth><RequireQuiz><WithSeo.Results /></RequireQuiz></RequireAuth>} />
```

door

```tsx
<Route path="/results" element={<KetenSwitch v1={<RequireAuth><RequireQuiz><WithSeo.Results /></RequireQuiz></RequireAuth>} v2={<WithSeo.ResultsV2 />} />} />
```

Let op de twee dingen die hier bewust niet veranderen. `isFullscreen` (regel 129) blijft `pathname.startsWith('/onboarding')`: met de vlag aan stuurt die route meteen door naar `/start`, dat geen fullscreen-pad is, dus de navbar komt vanzelf terug. En de v1-tak van `/results` is letterlijk dezelfde regel als hiervoor, inclusief `RequireAuth` en `RequireQuiz`; zonder vlag en zonder `?v=` verandert er dus niets aan de bestaande pagina.

- [ ] **Stap 5: Draai de tests en controleer alle vier de paden in de browser**

```bash
npx vitest run src/components/keten/__tests__/KetenSwitch.render.test.tsx
npm run design:poort -- src/components/keten/KetenSwitch.tsx; echo "exit=$?"
npm run dev
```

Verwacht: 8 tests geslaagd; `design-poort: 1 bestanden schoon` en `exit=0`.

Met de vlag nog uit (`enabled = false`):

| URL | Verwacht |
|---|---|
| `/onboarding` | de bestaande quiz, precies zoals hiervoor |
| `/results` | de bestaande resultatenpagina, met de inlogpoort ervoor |
| `/results?v=2` | de nieuwe pagina, ook uitgelogd; zonder profiel en zonder `?p=` de tekst "We kennen je keuzes nog niet" met de knop "Begin gratis" |
| `/results?v=2&p=<hash>` in een tweede browser | dezelfde outfits als in de eerste, via de leesmodus (besluit 7). Bij een onbekende hash: "Bij deze link staan geen outfits meer" met "Begin gratis" |
| `/start` | de nieuwe onboarding |

Zet de vlag daarna tijdelijk aan en controleer de andere kant:

```bash
supabase db query --linked "update remote_flags set enabled = true, percentage = 100 where flag_name = 'keten_v2'"
```

Wis de cache in de browserconsole met `localStorage.removeItem('ff_remote_flags')` en herlaad. Verwacht: `/onboarding` stuurt door naar `/start`, `/results` toont de v2-pagina zonder inlogpoort, en `/results?v=1` toont nog steeds de oude pagina met de poort. Zet de vlag daarna terug:

```bash
supabase db query --linked "update remote_flags set enabled = false, percentage = 0 where flag_name = 'keten_v2'"
supabase db query --linked "select flag_name, enabled, percentage from remote_flags where flag_name = 'keten_v2'" -o table
```

Verwacht: `keten_v2 | false | 0`. De vlag gaat pas echt om na taak 15.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add src/components/keten/ src/App.tsx
git commit -m "feat(keten): schakelaar tussen v1 en v2 op /onboarding en /results

?v=2 en ?v=1 winnen van de vlag, zodat de poort voor Luc kan lopen voordat
de vlag omgaat. De inlogpoort en de quizpoort staan in de v1-tak, niet om de
hele route: anders zou een anonieme bezoeker /results?v=2 nooit zien.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 14: Persona-harnas over de hele keten v2

**Bestanden:**
- Aanmaken: `scripts/keten/keten-v2-run.ts`
- Wijzigen: `scripts/keten/persona-run.ts` (plan 1 taak 11, plan 3 taak 8; tekstanker `if (process.argv.includes('--keten=stylist')) {`)
- Wijzigen: `package.json` (blok `scripts`; na de regel `"keten:paren": "vite-node scripts/keten/genereer-paren.ts",` uit taak 8)
- Test: de run zelf in stap 3; de pure keuzefunctie krijgt een vitest-test in stap 1

**Interfaces:**
- Gebruikt: `scriptKetenConfig(): KetenConfig` en `Persona` uit `scripts/keten/stylist-run.ts` (plan 3 taak 8); `controleerOutfitSet(outfits, budget): string[]` en `zelfdeOutfits(a, b): boolean` uit `scripts/keten/stylist-controles.ts` (plan 3 taak 8); `composeVoorProfiel` (plan 3 taak 7); `haalStartKandidaten`, `haalPairSets`, `heeftDekking`, `segmentenVoor`, `budgetVoorBand` (taak 5); `MIN_PAREN`, `MAX_PAREN` (taak 3); `beginState`, `startReducer` (taak 9); `bouwTasteProfile`, `profileHash` (taak 2).
- Levert:
  ```typescript
  interface V2Persona { naam: string; gender: Geslacht; occasions: Gelegenheid[]; band: Prijsband; voorkeur: Partial<Record<AsNaam, string>>; mag_ontbreken?: boolean }
  const V2_PERSONAS: readonly V2Persona[]
  function kiesKant(paar: PairSet, voorkeur: Partial<Record<AsNaam, string>>): PaarKantNaam
  interface V2Uitslag { naam: string; status: 'groen' | 'rood' | 'overgeslagen'; regels: string[] }
  function runKetenV2(opties?: { alleen?: string; rapport?: string }): Promise<boolean>
  ```
  En `npm run keten:v2`, plus `npx vite-node scripts/keten/persona-run.ts --keten=v2`.

**Ruling: dit is een poort, geen geplande taak.** Spec 8 schreef "elke week persona-run groen". Dat wordt hier niet gebouwd en ook niet beloofd. Er is op deze machine geen planner die een TypeScript-script kan draaien: `pg_cron` draait SQL in de database en kan geen `vite-node` starten, en er is bewust geen launchd-job voor dit project. Belangrijker: de eigenaar heeft besloten dat de keten eerst intern perfect moet zijn voordat er ritme omheen komt. Dit harnas draait dus op twee momenten, allebei met de hand:

1. voordat een plan uit deze reeks afgerond wordt (taak 15 van dit plan is daar de laatste van);
2. voordat een nieuwe feed live gaat, met alleen die feed (de feed-poort uit spec 5.7).

Zet er geen cron omheen zonder dat opnieuw te bespreken.

Wat het harnas doet, per persona: kandidaten ophalen voor de band, dekking controleren, paren ophalen, zes tot twaalf keuzes simuleren met een vaste voorkeur per as, het profiel bouwen, hashen, `composeVoorProfiel` aanroepen, de controles uit spec 5.7 toepassen, en de run daarna nog een keer draaien om te bewijzen dat dezelfde keuzes dezelfde outfits geven. Het simuleren gaat door dezelfde reducer als de echte pagina (taak 9): zou dit script zijn eigen lus hebben, dan kan het groen blijven terwijl `/start` iets anders doet. Een persona met `mag_ontbreken` die geen dekking heeft, is "overgeslagen" en niet rood (besluit 1): de spec garandeert dekking alleen voor `tot50` en `50tot100`. Heeft die persona wel dekking maar geen paren, dan is het wel rood.

- [ ] **Stap 1: Schrijf de falende test voor de keuzefunctie**

Maak `scripts/keten/__tests__/keten-v2-run.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { V2_PERSONAS, kiesKant } from '../keten-v2-run';
import type { PairSet } from '../../src/keten/types';

function paar(axis: PairSet['axis'], waardeA: string, waardeB: string): PairSet {
  return {
    pair_id: 'p1',
    segment_key: 'female|work|50tot100',
    gender: 'female',
    occasion: 'work',
    price_band: '50tot100',
    axis,
    kanten: [
      { kant: 'a', waarde: waardeA, items: [] },
      { kant: 'b', waarde: waardeB, items: [] },
    ],
  };
}

describe('kiesKant', () => {
  it('kiest de kant die bij de voorkeur past', () => {
    expect(kiesKant(paar('silhouette', 'slim', 'oversized'), { silhouette: 'oversized' })).toBe('b');
    expect(kiesKant(paar('silhouette', 'slim', 'oversized'), { silhouette: 'slim' })).toBe('a');
  });

  it('kiest kant a als de voorkeur niet voorkomt, zodat de run herhaalbaar is', () => {
    expect(kiesKant(paar('silhouette', 'slim', 'oversized'), { silhouette: 'relaxed' })).toBe('a');
    expect(kiesKant(paar('silhouette', 'slim', 'oversized'), {})).toBe('a');
  });

  it('vergelijkt formality als tekst', () => {
    expect(kiesKant(paar('formality', '2', '4'), { formality: '4' })).toBe('b');
  });
});

describe('V2_PERSONAS', () => {
  it('telt vijf persona s en alleen de laatste mag ontbreken', () => {
    expect(V2_PERSONAS).toHaveLength(5);
    expect(V2_PERSONAS.filter((p) => p.mag_ontbreken)).toHaveLength(1);
    expect(V2_PERSONAS[4].band).toBe('100tot200');
  });

  it('gebruikt hooguit drie gelegenheden per persona', () => {
    for (const p of V2_PERSONAS) {
      expect(p.occasions.length).toBeGreaterThanOrEqual(1);
      expect(p.occasions.length).toBeLessThanOrEqual(3);
    }
  });
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

```bash
npx vitest run scripts/keten/__tests__/keten-v2-run.test.ts
```

Verwacht: `Failed to resolve import "../keten-v2-run"`.

- [ ] **Stap 3: Schrijf het harnas**

Maak `scripts/keten/keten-v2-run.ts`:

```typescript
/**
 * Persona-harnas over de hele keten v2 (spec 5.7, plan 4).
 *
 * Per persona: kandidaten, dekking, paren, zes tot twaalf gesimuleerde
 * keuzes, profiel, hash, compose-outfits, de controles uit spec 5.7, en een
 * tweede run om te bewijzen dat dezelfde keuzes dezelfde outfits geven.
 *
 * Dit is een poort, geen geplande taak. Spec 8 noemde een wekelijkse run; die
 * komt er niet. pg_cron kan geen vite-node starten en de keten moet eerst
 * intern kloppen voordat er ritme omheen komt. Draai dit harnas met de hand:
 * voordat je een plan uit deze reeks afrondt, en voordat een nieuwe feed live
 * gaat. Zet er geen cron omheen zonder dat opnieuw te bespreken.
 *
 * Gebruik:
 *   npm run keten:v2
 *   npm run keten:v2 -- --alleen="vrouw minimalistisch"
 *   npx vite-node scripts/keten/persona-run.ts --keten=v2
 *
 * Credentials: VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY, via
 * scriptKetenConfig() uit stylist-run.ts. Waarden worden nooit gelogd.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scriptKetenConfig } from './stylist-run';
import { controleerOutfitSet, zelfdeOutfits } from './stylist-controles';
import { composeVoorProfiel } from '../../src/keten/composeClient';
import { bouwTasteProfile, profileHash } from '../../src/keten/profiel';
import { MAX_PAREN, MIN_PAREN } from '../../src/keten/paarSelectie';
import { beginState, startReducer } from '../../src/components/start/startReducer';
import {
  budgetVoorBand,
  haalPairSets,
  haalStartKandidaten,
  heeftDekking,
  segmentenVoor,
} from '../../src/keten/kandidatenStart';
import type { Assen, AsNaam, Gelegenheid, Geslacht, Keuze, PaarKantNaam, PairSet, Prijsband } from '../../src/keten/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export interface V2Persona {
  naam: string;
  gender: Geslacht;
  occasions: Gelegenheid[];
  band: Prijsband;
  /** De kant die deze persona kiest als hij hem tegenkomt. */
  voorkeur: Partial<Record<AsNaam, string>>;
  /** Mag ontbreken zonder dat de poort rood wordt (spec 5.7 garandeert alleen tot50 en 50tot100). */
  mag_ontbreken?: boolean;
}

/**
 * De vier persona's uit spec 5.7, plus een vijfde op 100tot200 (besluit 1).
 *
 * De waarden in voorkeur moeten in AS_CONTRASTEN (taak 8) voorkomen, anders
 * komt die kant nooit langs en valt kiesKant terug op a. Voor shoe_type is dat
 * scherp: die as is nominaal en heeft precies een contrast, sneaker tegen net.
 */
export const V2_PERSONAS: readonly V2Persona[] = [
  {
    naam: 'man klassiek werk',
    gender: 'male',
    occasions: ['work'],
    band: '50tot100',
    voorkeur: { formality: '4', silhouette: 'slim', color_temp: 'koel', lightness: 'donker', pattern: 'effen', shoe_type: 'net' },
  },
  {
    naam: 'vrouw minimalistisch werk en date',
    gender: 'female',
    occasions: ['work', 'date'],
    band: '50tot100',
    voorkeur: { formality: '3', silhouette: 'regular', color_temp: 'neutraal', lightness: 'licht', pattern: 'effen', shoe_type: 'net' },
  },
  {
    naam: 'man streetwear casual en uitgaan',
    gender: 'male',
    occasions: ['casual', 'party'],
    band: 'tot50',
    voorkeur: { formality: '2', silhouette: 'oversized', color_temp: 'neutraal', lightness: 'donker', pattern: 'statement', shoe_type: 'sneaker' },
  },
  {
    naam: 'vrouw romantisch date en reizen',
    gender: 'female',
    occasions: ['date', 'travel'],
    band: 'tot50',
    voorkeur: { formality: '3', silhouette: 'relaxed', color_temp: 'warm', lightness: 'licht', pattern: 'subtiel', shoe_type: 'net' },
  },
  {
    naam: 'vrouw duurdere band werk',
    gender: 'female',
    occasions: ['work'],
    band: '100tot200',
    voorkeur: { formality: '4', silhouette: 'regular', color_temp: 'koel', lightness: 'donker', pattern: 'effen', shoe_type: 'net' },
    mag_ontbreken: true,
  },
];

/** De kant die bij de voorkeur past; anders altijd a, zodat twee runs hetzelfde doen. */
export function kiesKant(paar: PairSet, voorkeur: Partial<Record<AsNaam, string>>): PaarKantNaam {
  const gewenst = voorkeur[paar.axis];
  if (gewenst) {
    const raak = paar.kanten.find((k) => k.waarde === gewenst);
    if (raak) return raak.kant;
  }
  return 'a';
}

export interface V2Uitslag {
  naam: string;
  status: 'groen' | 'rood' | 'overgeslagen';
  regels: string[];
}

/**
 * Simuleert het dit-of-dat-scherm door dezelfde reducer te voeren die de
 * bezoeker voedt (taak 9). Bewust niet nagebouwd: zou dit harnas zijn eigen
 * lus hebben, dan kan hij groen blijven terwijl de echte pagina iets anders
 * doet. Nu meet hij de code die live draait.
 */
function simuleerKeuzes(paren: PairSet[], persona: V2Persona): { keuzes: Keuze[]; laatsteAxes: Assen } {
  let state = startReducer(
    { ...beginState, stap: 'dit-of-dat', gender: persona.gender, occasions: persona.occasions },
    { type: 'paren', paren }
  );

  // MAX_PAREN is de bovengrens van de reducer; de teller is alleen een
  // noodrem, zodat een fout daar hier geen oneindige lus wordt.
  for (let n = 0; n < MAX_PAREN + 1 && !state.parenKlaar && state.huidigPaar; n++) {
    state = startReducer(state, { type: 'keuze', kant: kiesKant(state.huidigPaar, persona.voorkeur) });
  }

  return { keuzes: state.keuzes, laatsteAxes: state.axes };
}

export async function runKetenV2(opties: { alleen?: string; rapport?: string } = {}): Promise<boolean> {
  const cfg = scriptKetenConfig();
  const uitslagen: V2Uitslag[] = [];

  for (const persona of V2_PERSONAS) {
    if (opties.alleen && !persona.naam.includes(opties.alleen)) continue;
    const grenzen = budgetVoorBand(persona.band);
    console.log(`\n=== ${persona.naam} (${persona.gender}, ${persona.occasions.join('+')}, ${persona.band}) ===`);
    const regels: string[] = [];

    try {
      const kandidaten = await haalStartKandidaten(cfg, persona.gender, persona.occasions, persona.band);
      console.log(`kandidaten: ${kandidaten.length}`);
      if (!heeftDekking(kandidaten)) {
        if (persona.mag_ontbreken) {
          console.log('OVERGESLAGEN: geen dekking in deze band, en die is niet gegarandeerd (spec 5.7)');
          uitslagen.push({ naam: persona.naam, status: 'overgeslagen', regels: ['geen dekking in get_kandidaten'] });
          continue;
        }
        regels.push('geen dekking: top plus bottom plus footwear ontbreekt, en dress plus footwear ook');
      }

      const paren = await haalPairSets(cfg, segmentenVoor(persona.gender, persona.occasions, persona.band));
      console.log(`bruikbare paren: ${paren.length}`);
      if (paren.length < MIN_PAREN) {
        regels.push(`${paren.length} bruikbare paren, minimaal ${MIN_PAREN} nodig (draai scripts/keten/genereer-paren.ts)`);
      }

      if (regels.length === 0) {
        const { keuzes } = simuleerKeuzes(paren, persona);
        console.log(`keuzes: ${keuzes.length}`);
        if (keuzes.length < MIN_PAREN) {
          regels.push(`${keuzes.length} keuzes gesimuleerd, minimaal ${MIN_PAREN} verwacht`);
        }

        const profiel = bouwTasteProfile({
          session_id: `harnas-${persona.naam.replace(/\s+/g, '-')}`,
          user_id: null,
          gender: persona.gender,
          occasions: persona.occasions,
          budget_min: grenzen.min,
          budget_max: grenzen.max,
          nogo_product_ids: [],
          choices: keuzes,
          paren,
        });
        const hash = await profileHash(profiel);
        console.log(`profile_hash: ${hash.slice(0, 12)}`);
        for (const as of Object.keys(profiel.axes) as AsNaam[]) {
          const w = profiel.axes[as];
          console.log(`  ${as.padEnd(11)} ${String(w.value ?? 'onbekend').padEnd(10)} zekerheid ${w.confidence.toFixed(2)}`);
        }

        const run1 = await composeVoorProfiel(cfg, profiel);
        console.log(`bron ${run1.bron}, ${run1.outfits.length} outfits, ${run1.latency_ms ?? 0} ms`);
        run1.outfits.forEach((o, i) => {
          console.log(`  ${i + 1}. [${o.occasion}] ${o.title}`);
          for (const it of o.items) {
            console.log(`     - ${it.role.padEnd(9)} ${it.product.brand ?? ''} ${it.product.name} (${it.product.price} euro)`);
          }
        });

        regels.push(...controleerOutfitSet(run1.outfits, { min: grenzen.min, max: grenzen.max }));
        if (run1.bron === 'v2-fallback') regels.push(`noodpad gebruikt: ${run1.reden}`);

        const run2 = await composeVoorProfiel(cfg, profiel);
        if (!zelfdeOutfits(run1.outfits, run2.outfits)) {
          regels.push(`twee runs geven verschillende outfits (run 2 bron ${run2.bron})`);
        }
      }
    } catch (err) {
      regels.push(`keten brak: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (regels.length === 0) {
      console.log('GROEN');
      uitslagen.push({ naam: persona.naam, status: 'groen', regels: [] });
    } else {
      console.log('ROOD');
      for (const r of regels) console.log(`  - ${r}`);
      uitslagen.push({ naam: persona.naam, status: 'rood', regels });
    }
  }

  const rood = uitslagen.filter((u) => u.status === 'rood');
  const alleGroen = rood.length === 0;
  console.log(`\n${alleGroen ? 'ALLE PERSONAS GROEN' : `${rood.length} PERSONA(S) ROOD`}`);

  const pad = opties.rapport ?? join(root, 'docs', 'keten', 'keten-v2-rapport.md');
  mkdirSync(dirname(pad), { recursive: true });
  writeFileSync(
    pad,
    [
      '# Harnas keten v2',
      '',
      `Gedraaid op ${new Date().toISOString().slice(0, 10)}.`,
      '',
      'Dit rapport wordt met de hand gedraaid: voordat een plan uit de keten-reeks',
      'afgerond wordt en voordat een nieuwe feed live gaat. Er is bewust geen cron.',
      '',
      '| Persona | Status | Bevindingen |',
      '|---|---|---|',
      ...uitslagen.map((u) => `| ${u.naam} | ${u.status} | ${u.regels.join('; ') || 'geen'} |`),
      '',
    ].join('\n'),
    'utf8'
  );
  console.log(`Rapport geschreven naar ${pad}`);

  return alleGroen;
}

function argument(naam: string): string | undefined {
  const prefix = `--${naam}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length).replace(/^"|"$/g, '') : undefined;
}

if (process.argv.some((a) => a.endsWith('keten-v2-run.ts'))) {
  runKetenV2({ alleen: argument('alleen') }).then((groen) => process.exit(groen ? 0 : 1));
}
```

Wijzig `scripts/keten/persona-run.ts`. Controleer het anker:

```bash
grep -c "if (process.argv.includes('--keten=stylist')) {" scripts/keten/persona-run.ts
```

Verwacht: `1`. Voeg bij de imports toe:

```typescript
import { runKetenV2 } from './keten-v2-run';
```

En zet direct **boven** het blok `if (process.argv.includes('--keten=stylist')) {` toe:

```typescript
// Plan 4: dezelfde persona's over de hele keten v2 (get_kandidaten, pair_sets,
// gesimuleerde keuzes, taste_profiles, compose-outfits) met de controles uit
// spec 5.7. Poort, geen geplande taak: er komt geen cron omheen.
if (process.argv.includes('--keten=v2')) {
  const groen = await runKetenV2();
  process.exit(groen ? 0 : 1);
}
```

In `package.json`, na de regel `"keten:paren": "vite-node scripts/keten/genereer-paren.ts",`, voeg toe:

```json
    "keten:v2": "vite-node scripts/keten/keten-v2-run.ts",
```

- [ ] **Stap 4: Draai de test en zie hem slagen**

```bash
npx vitest run scripts/keten/__tests__/keten-v2-run.test.ts
```

Verwacht: 5 tests geslaagd.

- [ ] **Stap 5: Draai het harnas tegen de live database**

```bash
npm run keten:v2 -- --alleen="vrouw minimalistisch"
```

Verwacht: een blok met het aantal kandidaten, het aantal bruikbare paren, het aantal keuzes (tussen 6 en 12), de zes assen met hun zekerheid, `bron stylist` of `bron cache`, zes outfits met items en prijzen, en `GROEN`.

Veelvoorkomende rode uitkomsten en wat ze betekenen:
- `N bruikbare paren, minimaal 6 nodig`: taak 8 is voor dit segment nog niet gedraaid, of paren zijn uit de view gevallen omdat een item uitverkocht is. Draai `npm run keten:paren -- --uitvoeren --gender=... --gelegenheid=... --band=...`.
- `noodpad gebruikt: ANTHROPIC_API_KEY ontbreekt`: de secret uit plan 3 taak 6 staat niet.
- `outfit N: <id> kost X, budget ...`: `get_kandidaten` gaf een product buiten de band terug; dat is een bevinding over plan 1 taak 3, niet over dit plan.
- `twee runs geven verschillende outfits`: de cache in `outfit_sets` werkt niet voor dit profiel; controleer `stylist_version` en de voorraadcontrole uit plan 3.

Draai daarna alle vijf:

```bash
npx vite-node scripts/keten/persona-run.ts --keten=v2; echo "exit=$?"
cat docs/keten/keten-v2-rapport.md
```

Verwacht: vijf blokken, `ALLE PERSONAS GROEN` (of vier groen plus een overgeslagen voor `vrouw duurdere band werk`), `exit=0`, en een rapporttabel met vijf regels. Het rapport wordt gecommit; het is de bijlage bij de poort in taak 15.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add scripts/keten/keten-v2-run.ts scripts/keten/__tests__/keten-v2-run.test.ts scripts/keten/persona-run.ts package.json docs/keten/keten-v2-rapport.md
git commit -m "feat(keten): harnas over de hele keten v2 met vijf persona s

Poort, geen geplande taak: spec 8 noemde een wekelijkse run, maar pg_cron kan
geen vite-node starten en de keten moet eerst intern kloppen. Draai dit voor
het afronden van een plan en voor een nieuwe feed live gaat.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 15: De poort voor Luc en het vlagbeleid

**Bestanden:**
- Aanmaken: `docs/keten/poort-luc-keten-v2.md`
- Test: de vier controles in stap 1 en stap 4; de vlagquery in stap 6

**Interfaces:**
- Gebruikt: `npm run keten:v2` (taak 14); view `weekly_ratings` (plan 1 taak 4); tabellen `taste_profiles`, `pair_sets_op_voorraad`, `outfit_ratings`; `KetenSwitch` met `?v=2` (taak 13); `netlify deploy --prod`.
- Levert: `docs/keten/poort-luc-keten-v2.md` met de vier eisen uit spec 8 en het vlagbeleid, plus de vlag `keten_v2` op 10 procent.

Spec 8, laatste regel: "Voor de vlag omgaat: de vier persona's groen, Luc heeft de outfits gezien, en `weekly_ratings` vult zich." Dat zijn drie eisen; dit plan voegt er een vierde aan toe, omdat de vlag zonder paren een lege onboarding geeft: elk segment dat de vlag raakt heeft minstens `MIN_PAREN` bruikbare paren.

- [ ] **Stap 1: Meet de vier eisen, verwacht dat er nog niet aan voldaan is**

```bash
npm run keten:v2; echo "personas exit=$?"
supabase db query --linked "select * from weekly_ratings" -o table
supabase db query --linked "
select segment_key, count(*) as bruikbaar
from pair_sets_op_voorraad
group by 1
having count(*) < 6
order by 2, 1" -o table
supabase db query --linked "select count(*) as profielen, count(*) filter (where created_at > now() - interval '7 days') as deze_week from taste_profiles" -o table
```

Verwacht op dit moment: `personas exit=0` als taak 14 groen afsloot; `weekly_ratings` is leeg of heeft alleen jouw eigen testrijen; de derde query toont de segmenten die nog onder de zes paren zitten; `profielen` telt de profielen die je zelf in taak 11 maakte. De poort is dus nog niet gehaald: dat is de falende test. Schrijf de vier uitkomsten op, ze gaan in het document van stap 2.

- [ ] **Stap 2: Schrijf het poortdocument**

Maak `docs/keten/poort-luc-keten-v2.md`:

```markdown
# Poort voor Luc: onboarding v2 en resultaten v2

Doel van dit document: vastleggen wat er groen moet zijn voordat de vlag
`keten_v2` in `remote_flags` omhoog gaat, en in welke stappen dat gebeurt.
Bron: spec `docs/superpowers/specs/2026-09-14-keten-herbouw-design.md`, sectie 8.

## De vier eisen

| Eis | Hoe je hem meet | Uitkomst | Datum |
|---|---|---|---|
| 1. De persona's zijn groen over de hele keten v2 | `npm run keten:v2`, exit 0, rapport in `docs/keten/keten-v2-rapport.md` | | |
| 2. Luc heeft de outfits gezien | Luc opent `https://fitfi.ai/start`, rondt de onboarding af en bekijkt `/results?v=2` | | |
| 3. `weekly_ratings` vult zich | `supabase db query --linked "select * from weekly_ratings" -o table` geeft een rij met `beoordeeld_per_profiel` boven 0 | | |
| 4. Elk segment dat de vlag raakt heeft minstens zes bruikbare paren | de segmentquery hieronder is leeg voor de banden `tot50` en `50tot100` | | |

Eis 4 staat niet in de spec en is hier toegevoegd: zonder paren blijft de
budgetstap grijs en loopt de bezoeker vast op stap 3. Spec 5.7 garandeert
dekking alleen voor `tot50` en `50tot100`; `100tot200` mag leeg blijven en zet
in de onboarding de kaart "Nog geen aanbod in deze prijsband".

### De segmentquery

```sql
select p.segment_key, count(v.pair_id) as bruikbaar
from pair_sets p
left join pair_sets_op_voorraad v on v.pair_id = p.pair_id
where p.price_band in ('tot50', '50tot100')
group by 1
having count(v.pair_id) < 6
order by 2, 1;
```

Staat er een regel in, draai dan `npm run keten:paren -- --uitvoeren --gender=... --gelegenheid=... --band=...` voor dat segment.

## Vlagbeleid

De vlag heeft twee knoppen: `enabled` (harde schakelaar) en `percentage` (welk
deel van het verkeer). De bucket komt uit het sessie-id, dus een bezoeker blijft
altijd aan dezelfde kant.

| Stand | Wanneer | Query |
|---|---|---|
| uit | nu | `update remote_flags set enabled = false, percentage = 0 where flag_name = 'keten_v2';` |
| 10 procent | als de vier eisen groen zijn | `update remote_flags set enabled = true, percentage = 10 where flag_name = 'keten_v2';` |
| 50 procent | na een week met `pct_zou_dragen` boven 50 en zonder nieuwe fouten | `update remote_flags set enabled = true, percentage = 50 where flag_name = 'keten_v2';` |
| 100 procent | na een week op 50 procent, met hetzelfde beeld | `update remote_flags set enabled = true, percentage = 100 where flag_name = 'keten_v2';` |

Terugzetten is een query en werkt binnen tien minuten voor iedereen, want de
browser cachet de vlag `VLAG_CACHE_MS` (tien minuten) in localStorage:

```sql
update remote_flags set enabled = false, percentage = 0 where flag_name = 'keten_v2';
```

## Wat je per stap bekijkt

```sql
select * from weekly_ratings order by week_start desc limit 4;
select count(*) as profielen,
       count(*) filter (where created_at > now() - interval '7 days') as deze_week
from taste_profiles;
select count(*) as maten from taste_profile_sizes;
```

Het stuurcijfer uit spec 3 is `pct_zou_dragen`, doel vier van de zes, dus circa
67 procent. Zakt dat onder 50 procent, zet de vlag dan terug naar de vorige
stand en kijk eerst naar de dekkingsmatrix en de paren voordat je aan de prompt
gaat sleutelen.

## Wat expres niet is gepland

- Geen wekelijkse cron op `npm run keten:v2`. Het harnas is een poort: draaien
  voordat een plan afgerond wordt en voordat een nieuwe feed live gaat.
- Geen cron die `pair_sets` opnieuw genereert als een item uit voorraad gaat.
  De view `pair_sets_op_voorraad` filtert die paren weg; de segmentquery
  hierboven zegt wanneer je `npm run keten:paren` opnieuw draait.
- De oude `/onboarding` en `/results` blijven staan tot de vlag op 100 procent
  staat en daar een maand gestaan heeft (spec 7).
```

- [ ] **Stap 3: Zet de site live**

```bash
npx vite build
netlify deploy --prod --dir=dist
netlify api listSiteDeploys --data '{"site_id":"'"$(netlify api getSite --data '{}' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"'"}' | head -c 400
```

Verwacht: de build slaagt, de deploy geeft een `Website URL`, en de laatste deploy in de lijst heeft dezelfde commit als je lokale `HEAD` (`git rev-parse --short HEAD`). Wijkt dat af, dan kijkt Luc straks naar oude code; deploy opnieuw voordat je verder gaat.

- [ ] **Stap 4: Loop de vier eisen af op de live site**

1. `npm run keten:v2` met exit 0, en `docs/keten/keten-v2-rapport.md` bijgewerkt.
2. Open `https://fitfi.ai/start` in een privevenster, rond de onboarding af en bekijk `/results?v=2`. De vlag staat nog uit; `?v=2` wint (taak 13). Laat dit aan Luc zien en vraag hem om per outfit "Zou ik dragen" of "Nooit" te kiezen.
3. Controleer dat die beoordelingen aankomen:

```bash
supabase db query --linked "select * from weekly_ratings order by week_start desc limit 2" -o table
supabase db query --linked "select rating, count(*) from outfit_ratings where created_at > now() - interval '1 day' group by 1" -o table
```

Verwacht: een rij in `weekly_ratings` met `profielen >= 1` en `beoordeeld_per_profiel` boven 0, en in de tweede tabel de twee ratings met hun aantallen.

4. De segmentquery uit het document geeft geen regels voor `tot50` en `50tot100`.

Vul de vier uitkomsten met datum in de tabel van `docs/keten/poort-luc-keten-v2.md` in. Is een van de vier niet groen, dan stopt deze taak hier: de vlag blijft uit, en je meldt welke eis open staat.

- [ ] **Stap 5: Zet de vlag op 10 procent**

Alleen als alle vier de eisen groen zijn en Luc heeft gezegd dat de outfits goed zijn.

```bash
supabase db query --linked "update remote_flags set enabled = true, percentage = 10, updated_at = now() where flag_name = 'keten_v2'"
supabase db query --linked "select flag_name, enabled, percentage, updated_at from remote_flags where flag_name = 'keten_v2'" -o table
```

Verwacht: `keten_v2 | true | 10`. Controleer daarna in een privevenster dat `/onboarding` zonder `?v=` nog steeds bij de oude quiz uitkomt voor de meeste sessies, en dat een sessie in de bucket onder 10 wel doorverwezen wordt naar `/start`. Je kunt dat forceren door `localStorage.removeItem('ff_session_id')` te draaien en te herladen tot je aan de andere kant komt.

- [ ] **Stap 6: Poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
git add docs/keten/poort-luc-keten-v2.md docs/keten/keten-v2-rapport.md
git commit -m "docs(keten): poort voor Luc en vlagbeleid voor keten_v2

Vier eisen: persona s groen, Luc heeft de outfits gezien, weekly_ratings
vult zich, en elk segment in tot50 en 50tot100 heeft minstens zes bruikbare
paren. Uitrol in stappen van 10, 50 en 100 procent; terugzetten is een query.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Zelfcontrole

Per eis uit de spec die dit plan dekt, de taak die hem afdekt. Alles wat hier staat, staat ook als stap in die taak; wat niet gedekt is, staat onderaan.

| Spec-eis | Taak |
|---|---|
| 5.2 tabel `taste_profiles` met alle kolommen, `profile_hash` uniek, insert voor anon | Taak 1 |
| 5.2 afleiding van `axes`: per as de meerderheid als `value` en `\|gekozen - afgewezen\| / aantal` als `confidence` | Taak 2 (`berekenAxes`): ordinale assen tellen richtingen op de schaal, `shoe_type` telt per waarde. Besluit 6 legt uit waarom een as met meer dan twee waarden anders de verkeerde kant op gaat |
| 5.2 `liked_product_ids` uit gekozen outfits, `disliked_product_ids` uit afgewezen outfits plus no-go's | Taak 2 (`bouwTasteProfile`) |
| 5.2.1 normalisatie en `profile_hash` | Taak 2 (re-export van `normaliseerProfiel` en `profileHash` uit plan 3; taak 11 hasht ermee) |
| 5.2 "een as met confidence < 0.5 is onzeker en stuurt de adaptieve paarselectie" | Taak 3 (`onzekersteAs`, `DREMPEL`) |
| 5.3 aanroep van `get_kandidaten` met lege assen voor de startstappen | Taak 5 (`haalStartKandidaten`) |
| 5.3 aanroep met een as op een vaste waarde, voor de twee kanten van een paar | Taak 7 (`kandidatenVoor` in `handlePaar`) |
| 5.4 hergebruik van `compose-outfits` voor de outfits van een profiel | Taak 12 (`ResultsV2Page` via `composeVoorProfiel` uit plan 3) |
| 5.5 `outfit_sets` als de plek waar de outfits van een `profile_hash` staan, ook zonder profiel | Taak 7 (leesmodus `handleLees`), taak 12 (`leesOutfits.ts`, `?p=` op de pagina). Besluit 7; `taste_profiles` krijgt geen select-policy |
| 5.6 `outfit_ratings` per outfit met "Zou ik dragen" en "Nooit" | Taak 12 (`OutfitV2Card` met `OutfitRatingButtons` uit plan 1) |
| 5.7 vier persona's over de hele keten, met de controles uit de spec | Taak 14 (plus een vijfde op `100tot200`, besluit 1) |
| 5.7 "twee runs achter elkaar geven dezelfde outfits" | Taak 14 (`zelfdeOutfits` uit plan 3) |
| 6.1 voor wie: dames, heren, beide | Taak 10 (`VoorWie`), taak 9 (`gender` in de reducer), taak 8 (`GESLACHTEN` maakt ook unisex-paren, anders is "Beide" een dode knop) |
| 6.2 maximaal drie gelegenheden uit de zeven | Taak 10 (`Gelegenheden`), taak 9 (`MAX_GELEGENHEDEN`), taak 1 (check-constraint op `occasions`) |
| 6.3 budget per stuk met drie echte producten rond 30, 80 en 180 als anker | Taak 5 (`BAND_GRENZEN`, `kiesAnker`), taak 10 (`Budget`) |
| 6.4 zes no-go-items uit `get_kandidaten` met lege assen | Taak 5 (`kiesNoGoItems`, `haalStartKandidaten`), taak 10 (`NoGo`) |
| 6.5 twee outfits naast elkaar uit `pair_sets`, minimaal 6 en maximaal 12 | Taak 3 (`MIN_PAREN`, `MAX_PAREN`), taak 10 (`DitOfDat`), taak 11 (de lus) |
| 6.5 na elke keuze herberekening van `axes`; volgend paar uit de as met de laagste confidence; stoppen bij 0.5 op elke as of bij 12 | Taak 3 (`volgendPaar`, `klaar`), taak 9 (de `keuze`-actie roept ze aan; drie tests draaien een hele sessie door de reducer), taak 14 (het harnas voert dezelfde reducer) |
| 6.6 zes outfits met titel, reden, items met prijs en "Bekijk bij partner" | Taak 12 (`OutfitV2Card`) |
| 6.6 maten optioneel onder de outfits | Taak 1 (`taste_profile_sizes`), taak 5 (`slaMatenOp`), taak 12 (`MatenOptioneel`) |
| 6 "elke stap stuurt `track('onboarding_step', { step, index })`" | Taak 11 (effect op `state.stap`) |
| 6 "afbreken stuurt `onboarding_abandoned` met de stap" | Taak 11 (`beforeunload` en unmount) |
| 6 route `/start` achter de vlag `keten_v2` in `remote_flags` | Taak 1 (de rij), taak 4 (`beslisFlag`, `useRemoteFlag`), taak 13 (`KetenSwitch`), taak 11 (de route) |
| 7.2 `pair_sets` vooraf gegenereerd per segment, per as minstens vier paren | Taak 1 (tabel), taak 8 (`PAREN_PER_AS`, de planner) |
| 7.2 een paar is twee complete outfits die op precies een as verschillen en verder zo gelijk mogelijk zijn | Taak 6 (twee kandidatenlijsten, `valideerPaar`, de kleurcontrole), taak 7 (de twee RPC-aanroepen) |
| 7.2 gegenereerd door `compose-outfits` in een aparte modus (`mode: 'pair'`) | Taak 7 |
| 7.2 vastgelegd met product_ids en beeld-URL's | Taak 2 (`PaarItem`), taak 6 (`verrijk`), taak 1 (`kanten jsonb`, `product_ids uuid[]`) |
| 7.2 "regeneratie als een item uit voorraad gaat" | Taak 1 (view `pair_sets_op_voorraad`), taak 5 (`haalPairSets` leest de view), taak 8 (handmatig bijvullen plus `--opruimen`). Bewust geen cron; zie de ruling in taak 8 |
| 7 engine v2, `products` en de bestaande `/onboarding` en `/results` blijven zoals ze zijn | Taak 13 (de v1-tak is letterlijk de oude regel, inclusief `RequireAuth` en `RequireQuiz`) |
| 8 poorten per taak | Elke taak, laatste stap: `tsc`, `vitest`, `vite build`, `typecheck:keten`, `check:edge`, en `design:poort` in de taken met ui |
| 8 "elke week persona-run groen" | Niet gebouwd. Taak 14 legt vast dat het harnas een poort is en geen geplande taak, met de reden. Geen cron beloofd |
| 8 "voor de vlag omgaat: persona's groen, Luc heeft de outfits gezien, `weekly_ratings` vult zich" | Taak 15 (plus een vierde eis over het aantal bruikbare paren) |
| 1 "minder dan drie minuten" | Taak 3 (hooguit twaalf paren), taak 5 (data pas laden als de stap hem nodig heeft), taak 11 (geen inlogpoort) |
| 3 "geen verzonnen matchpercentage" | Taak 12 (`OutfitV2Card` toont geen percentage; de render-test controleert dat er geen `%` in de html staat) |
| CLAUDE.md design system v1.0 | Taak 10, 12 en 13 draaien `npm run design:poort` op elk nieuw ui-bestand; badges staan op `top-3 left-3`, waar de poort uit taak 0 een test voor heeft |
| CLAUDE.md 10 vaste CTA-teksten | Taak 10 ("Bekijk je resultaten"), taak 12 ("Bekijk bij partner"), plan 1 ("Zou ik dragen", "Nooit"). De enige toevoeging is "Maten bewaren" (taak 12); de randvoorwaarden bovenaan zeggen waarom dat een toevoeging is en geen variatie |
| CLAUDE.md 11 copy in het Nederlands, je en jij, geen buzzwords | Alle ui-taken; de render-tests leggen de vaste teksten vast |

Wat dit plan bewust niet dekt, met de plek waar het wel staat:

- De tagging waar `get_kandidaten` op scoort: plan 2. Zonder die tags zijn `attrs.silhouette`, `color_temp`, `lightness` en `pattern` leeg en levert de pair-modus in taak 7 `geen kandidaten voor kant a`.
- `compose-outfits`, `outfit_sets`, de validatie en het noodpad: plan 3. Dit plan roept ze alleen aan en breidt de functie uit met een tweede modus.
- Selfie, Nova-chat, premium, dashboard en het opruimen van dode code: spec 7 sluit ze uit.
- Het verwijderen van de oude `/onboarding` en `/results`: spec 7 verbiedt dat voordat de vlag om is; het poortdocument in taak 15 zegt wanneer dat wel mag.
