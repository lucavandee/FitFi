# Stylist uitvoeringsplan

> **Voor agentische uitvoerders:** VEREISTE SUB-SKILL: gebruik superpowers:subagent-driven-development of superpowers:executing-plans om dit plan taak voor taak uit te voeren. Stappen gebruiken checkbox-syntax (`- [ ]`).

**Doel:** de edge function `compose-outfits` laat een stylist-model zes outfits samenstellen uit de kandidaten van `get_kandidaten`, valideert die hard, cachet ze per profiel in `outfit_sets` met een levensduur en voorraadcontrole, valt bij storing binnen een vast tijdsbudget terug op engine v2 met vaste seed, en het persona-harnas bewijst dat de route groen, herhaalbaar en betaalbaar is.

**Architectuur:** de client (`src/keten/composeClient.ts`) hasht het profiel, haalt kandidaten op via de RPC, roept de edge function aan en draait alleen bij `{ fallback: true }` zelf engine v2 met `seed = fnv1a32(profile_hash)`. De edge function (Deno) doet cache-check met levensduur en voorraadcontrole, een Anthropic Messages API-aanroep met een tool als structured output, validatie via de pure functie `valideerOutfits`, hooguit een herkansing binnen het tijdsbudget, en schrijft naar `outfit_sets` inclusief tokenverbruik. Alle types en pure logica staan in `supabase/functions/_shared/` zodat Deno, Vite en vitest dezelfde bestanden gebruiken; die map en `scripts/keten/` krijgen in taak 1 hun eigen typecheck-poorten, omdat `tsconfig.json` (`include: ["src"]`) ze niet ziet.

**Stack:** Vite + React 18 + TypeScript, Tailwind 3.4, Supabase (Postgres, RLS, edge functions in Deno), vitest, vite-node voor scripts, Netlify.

**Spec:** docs/superpowers/specs/2026-09-14-keten-herbouw-design.md

## Globale randvoorwaarden

- Elke taak eindigt met zes groene poorten: `npx tsc --noEmit`, `npx vitest run`, `npx vite build`, `npm run design:check:ci` (spec 8), plus de twee poorten uit taak 1: `npm run typecheck:keten` (tsc over `supabase/functions/_shared/**` en `scripts/keten/**`) en `npm run check:shared` of, zodra de edge function bestaat, `npm run check:edge` (`deno check`, de enige poort die de Deno-runtime en `npm:`-imports echt controleert).
- Migraties worden toegepast met `supabase db query --linked -f <bestand>`, nooit met `supabase db push`: er staat geen psql op deze machine, en de oudere migraties staan niet in de remote migratiehistorie, dus `db push` zou ze allemaal opnieuw tegen productie willen draaien (plan 1, regel 25; plan 2, regel 18). Controle-queries gaan met `supabase db query --linked "<sql>" -o table`, ook waar dit plan eerder `psql "$SUPABASE_DB_URL"` gebruikte.
- `npm run design:check:ci` geeft op de hele repo exit 1 (13.244 violations, dezelfde meting als plan 1 en 2); de poort is daarom niet de exit-code maar het getal achter `Total Violations` uit `node scripts/check-design-compliance.mjs`, dat door een taak in dit plan niet mag stijgen (uitgezonderd taak 9, die nieuwe hex-kleuren uit CLAUDE.md toevoegt aan de badge). Omdat de exit-code van `design:check:ci` altijd 1 is, staat het commando daarom niet middenin een `&&`-keten: het draait apart, met de violations-vergelijking als eigen stap, zodat de poorten erna (`typecheck:keten`, `check:shared`, `check:edge`) wel draaien.
- Waarom zes en niet vier: `tsconfig.json` heeft `include: ["src"]`. `npx tsc --noEmit` controleert daardoor alleen wat vanuit `src/` geïmporteerd wordt. `src/keten/types.ts` exporteert `keten-types.ts` opnieuw, dus dat ene bestand wordt wel gezien (gemeten: een bestand in `src/` dat uit `supabase/functions/_shared/cors.ts` importeert, laat tsc dat bestand in `--listFiles` opnemen). `valideer-outfits.ts`, `stylist-prompt.ts`, `compose-outfits/index.ts` en alles in `scripts/keten/` ziet tsc niet, `vite build` bouwt alleen de webapp, en vitest transpileert zonder typecheck. Zonder taak 1 zou de Deno-code pas bij `supabase functions deploy` voor het eerst getoetst worden.
- UI volgt design system v1.0 uit CLAUDE.md: kleuren alleen als `text-[#1A1A1A]`, `text-[#4A4A4A]`, `text-[#6E6E6E]`, `bg-[#FAFAF8]`, `bg-[#F5F0EB]`, `bg-white`, `border-[#E5E5E5]`, `text-[#A85740]`, `bg-[#A85740]`; geen nieuwe kleuren. Tekst nooit kleiner dan `text-sm` (14px), ook niet in badges (CLAUDE.md 2 en 12). Dat de bestaande resultatenpagina op veel plekken `text-xs` gebruikt, is geen vrijbrief voor nieuwe code.
- Knoppen `rounded-xl`, cards `rounded-2xl`, badges `rounded-full`; schaduw alleen `hover:shadow-md` op cards; spacing in veelvouden van 8px (`p-2`, `p-4`, `p-6`, geen `p-3`, `p-5`).
- Alle copy in het Nederlands, aanspreken met je en jij; geen "authentiek", "uniek", "game-changer", geen AI-buzzwords (CLAUDE.md 11). Dat geldt ook voor `title` en `reason` die het model schrijft (spec 5.4).
- Vaste CTA-teksten uit CLAUDE.md 10 blijven staan; dit plan voegt geen nieuwe CTA toe.
- Geen em-dashes in code, commentaar, commits of copy.
- Engine v2 wordt niet aangepast (spec 7); hij wordt alleen aangeroepen met `seed`.
- Edge functions gebruiken `buildCorsHeaders(req)` uit `supabase/functions/_shared/cors.ts`. Andere functies in de repo (bijvoorbeeld `analyze-selfie-color`) verwijzen naar een niet-bestaande `corsHeaders`; dat patroon neem je niet over.
- Bestaande `/onboarding` en `/results` blijven werken; de nieuwe route staat achter een lokale vlag (`localStorage ff_keten_stylist=1`), alleen voor intern testen.
- Geen fabricatie in de UI: een outfit uit de stylist-route krijgt geen verzonnen matchpercentage.
- Secrets (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`) staan alleen in Supabase secrets, `.env` en de shell-omgeving, nooit in code of commits.
- Commits in het Nederlands, met de attributieregel uit de sessie-instructies.

## Afhankelijkheden van plan 1 en 2

Dit plan gaat ervan uit dat na plan 1 en 2 bestaan:

- RPC `get_kandidaten` met exact de signatuur uit spec 5.3 (`p_gender text, p_occasions text[], p_budget_min int, p_budget_max int, p_axes jsonb, p_liked_ids uuid[], p_disliked_ids uuid[], p_per_category int default 12`), die rijen `(product_id uuid, category text, score real, attrs jsonb, product jsonb)` teruggeeft waarin `attrs` de `product_attributes`-rij zonder embedding is en `product` de `products`-rij. Plan 2 voegt een negende parameter `p_retailer text default null` toe; die heeft een default en verandert niets aan de aanroep in dit plan.
- `scripts/keten/persona-run.ts` (vite-node) bestaat met een `async function main()`. Dit plan voegt er een modus `--keten=stylist` aan toe, maar de eigenlijke code staat in een eigen module `scripts/keten/stylist-run.ts` die ook zelfstandig draait.
- `src/keten/personas.ts` met `KETEN_PERSONAS` en type `KetenPersona` (naam, gender, gelegenheden, budget, stijlvoorkeuren), de canonieke persona-data uit spec 5.7. Taak 8 van dit plan importeert dat bestand en leidt er zijn eigen assen-vorm uit af, in plaats van een eigen `PERSONAS`-constante met dezelfde vier persona's te definiëren.
- `src/services/ratings/outfitRatings.ts` met `outfitKey(productIds: string[]): Promise<string>` (plan 1, taak over `outfit_ratings`): sha256-hex van de gesorteerde, ontdubbelde ids gescheiden door een komma.
- `src/utils/hash.ts` met `sha256Hex` en `fnv1a32`. **Let op:** dit bestand bestaat nu al op `main` met alleen `hashString` (FNV-1a, 32 bits) en wordt geïmporteerd door `src/utils/image.ts`. Plan 1 noemt het pad "Aanmaken"; dat moet "Wijzigen" zijn, anders breekt `image.ts`. Taak 2 van dit plan controleert de inhoud en vult aan wat ontbreekt, met behoud van `hashString`. Zo werkt dit plan ongeacht of plan 1 dat bestand al heeft aangepast.

`taste_profiles` bestaat nog niet (plan 4). Dit plan definieert het type `TasteProfileInput` en bouwt het profiel in de client uit de bestaande quiz-antwoorden.

## Antwoord op de pre-commitment test

Kan `npx tsc --noEmit` nu als bewijs gelden dat `compose-outfits/index.ts` type-correct is? Nee. Daarom voegt taak 1 twee poorten toe voordat er ook maar een regel keten-code geschreven wordt: `tsconfig.keten.json` voor `_shared` en `scripts/keten`, en `deno check` voor de edge function. Gemeten op de huidige repo (2026-09-16, Deno 2.9.6 op `/opt/homebrew/bin/deno`): `DENO_NO_PACKAGE_JSON=1 deno check supabase/functions/validate-product-links/index.ts` slaagt met exitcode 0. Zonder die variabele stopt Deno op de `npm:@supabase/supabase-js`-import met `Could not find "@supabase/supabase-js" in a node_modules folder`, omdat de `package.json` in de root hem naar `node_modules` stuurt in plaats van naar zijn eigen cache. Een bestand zonder `npm:`-import (`_shared/cors.ts`) slaagt ook zonder de variabele; de edge function uit taak 6 heeft die import wel, dus de scripts in taak 1 zetten de variabele altijd. Ook gemeten: een `tsconfig` met de include-lijst uit taak 1 geeft op de huidige repo (`_shared/cors.ts`, `_shared/productClassifier.ts`, `src/vite-env.d.ts`) exitcode 0 bij `tsc --noEmit`, dus de nieuwe poort begint groen.

## Wachttijd-budget

Spec 1 vraagt een onboarding van minder dan drie minuten in totaal. De compose-stap krijgt daarom een hard budget, in plaats van de open einden die hier eerder stonden (90 s per aanroep, twee aanroepen, geen client-timeout):

| Onderdeel | Grens | Waar |
|---|---|---|
| Een Anthropic-aanroep | 45 s (`AANROEP_TIMEOUT_MS`) | taak 6 |
| Herkansing | alleen als er nog minstens 45 s over is van het totaalbudget van 100 s (`HERKANSING_UITERLIJK_MS = 50_000`); anders direct het noodpad-signaal | taak 6 |
| Edge function totaal | onder 100 s in het slechtste geval; verwacht 10 tot 30 s bij een cache-miss, onder 1 s bij een hit | taak 6 |
| Client-fetch naar de edge function | 120 s (`CLIENT_TIMEOUT_MS`), daarna noodpad met engine v2 op de kandidaten die al binnen zijn | taak 7 |
| Engine v2 als noodpad | draait in de browser, net als de bestaande route (`outfitService.generateOutfits` roept `runEngineV2` ook in de hoofdthread aan); dit plan voegt daar geen nieuw risico aan toe | taak 7 |

De persona-run print per run de latency. Ligt de eerste run van een persona structureel boven 30 s, dan is de kandidatenlijst te lang voor het model en verlaag je `PER_CATEGORIE` in `composeClient.ts` (elke kandidaat kost circa 75 tokens in de prompt).

## Kosten

Model: `claude-sonnet-5` (spec 5.4), tarief 2 dollar per miljoen input-tokens en 10 dollar per miljoen output-tokens (Anthropic-prijslijst, geverifieerd via de claude-api skill op 2026-09-15).

Schatting per cache-miss, gemeten aan de promptopbouw in taak 5:

| Onderdeel | Tokens |
|---|---|
| Systeemprompt | circa 500 |
| Harde feiten, assen, voorbeelden | circa 200 |
| 72 kandidaten (uuid, naam, merk, prijs, attributen; een uuid alleen al is circa 25 tokens) | circa 5.400 |
| Tool-schema en tool-overhead | circa 300 |
| **Input totaal** | **circa 6.500 (0,013 dollar)** |
| Output: zes outfits met titel, items en reden | circa 1.000 (0,010 dollar) |
| **Per aanroep** | **circa 0,025 dollar** |
| Met herkansing (slechtste geval) | circa 0,05 dollar |
| Cache-hit | 0 dollar |

Gevolgen:

- Ontwikkeling: een koude harness-run (vijf persona's, taak 8) kost circa 0,15 dollar; elke run daarna is cache en kost niets tot `STYLIST_VERSION` verandert of de cache verloopt.
- Productie: elke nieuwe `profile_hash` is een aanroep. Bij 1.000 nieuwe profielen per maand is dat 25 tot 50 dollar per maand. De wekelijkse persona-run (spec 8) kost hooguit 0,15 dollar per week.
- Meten in plaats van schatten: de edge function slaat `input_tokens` en `output_tokens` uit `usage` van het API-antwoord op in `outfit_sets` (aanvulling op spec 5.5, twee kolommen). De weekkosten zijn dan een query (taak 8, stap 6).
- Prompt caching van Anthropic helpt hier niet: alleen systeemprompt en tool-schema zijn gelijk tussen aanroepen (samen onder de minimale cachebare prefix), de kandidatenlijst verschilt per profiel. Bewust niet ingezet.
- Een latere besparing van circa 40 procent is mogelijk door kandidaten in de prompt een kort nummer te geven in plaats van de uuid en dat in de edge function terug te vertalen. Dat is een aparte wijziging van prompt en validatie (nieuwe `STYLIST_VERSION`), niet in dit plan.

## Cache-levensduur

`profile_hash` bevat bewust geen voorraadstatus (spec 5.2.1). Zonder extra regel zou een outfit-set met een uitverkocht product de cache-hit voor dat profiel blijven. Daarom (taak 6):

1. Een rij telt alleen als cache-hit als `created_at` jonger is dan 14 dagen (`CACHE_MAX_LEEFTIJD_DAGEN`).
2. Bij een hit controleert de edge function met een query op `products` of elk `product_id` in de outfits nog `in_stock = true` is. Klopt dat niet, dan is het een miss: het model stelt opnieuw samen en de upsert overschrijft de rij.
3. Na elke schrijfactie verwijdert de edge function rijen ouder dan 30 dagen (`OPRUIMEN_NA_DAGEN`); de index op `created_at` maakt dat goedkoop. Geen aparte cron nodig.
4. Een nieuwe `STYLIST_VERSION` maakt de oude rijen sowieso onbereikbaar (andere sleutel).

De cache-controle in het harnas (twee runs geven dezelfde outfits) blijft geldig: de tweede run volgt direct op de eerste, dus de voorraad is niet veranderd.

## Drie keuzes die de spec openliet

1. **Noodpad in de client, niet in Deno.** `runEngineV2` leunt op `productClassifier`, `productSafety`, `productEnricher`, `@/config/archetypes` en tientallen scoring-modules. Een Deno-port is een tweede engine die uit de pas gaat lopen met de eerste. Daarom geeft de edge function bij falen `{ fallback: true, reason, kandidaten }` terug en draait de client (browser of script) `runEngineV2` op dezelfde kandidaten met `seed = fnv1a32(profile_hash)`. Gevolg: een fallback-set wordt niet in `outfit_sets` geschreven (de client mag daar niet in schrijven), maar is door de seed wel herhaalbaar. De kolomwaarde `source = 'v2-fallback'` blijft in het schema voor een later serverpad. Het productrisico van dit pad (wachttijd) is begrensd door het wachttijd-budget hierboven.
2. **Types en pure logica in `supabase/functions/_shared/`.** Een edge function kan bij deploy alleen bestanden binnen `supabase/functions` meenemen, dus de gedeelde types en `valideerOutfits` staan daar. `src/keten/types.ts` exporteert de types opnieuw, zodat plan 4 gewoon uit `src/keten/types.ts` importeert. "Een bron van waarheid" is alleen waar als die bron ook gecontroleerd wordt; dat doen `typecheck:keten` en `check:edge` uit taak 1, en de bestandskop van `keten-types.ts` zegt dat.
3. **Persona's krijgen vaste assen in plaats van keuzes.** `pair_sets` en de keuze-afleiding komen in plan 4. Tot dan dragen de vier persona's uit spec 5.7 hun `axes` direct (waarde plus confidence) en lege `choices`. Omdat een echte bezoeker na 6 tot 12 paren een halve, onzekere assen-set aflevert, draait het harnas een vijfde profiel mee ("vrouw minimalistisch, halve set": drie assen onbekend, de rest met lage zekerheid). Dat bewijst dat de stylist ook met dunne invoer zes geldige outfits levert. De echte keuze-afleiding en de ruis daarvan blijven plan 4.

## Bestandsstructuur

Aanmaken:

- `tsconfig.keten.json`: typecheck-poort voor `supabase/functions/_shared/**` en `scripts/keten/**` (taak 1).
- `supabase/functions/_shared/keten-types.ts`: bron van alle keten-types (spec 5.2 tot en met 5.5), puur TypeScript zonder imports.
- `src/keten/types.ts`: exporteert `keten-types.ts` opnieuw voor client, scripts en plan 4.
- `src/utils/__tests__/hashCompat.test.ts`: bewaakt dat `hashString` (bestaand, gebruikt door `image.ts`) en `fnv1a32` hetzelfde geven en dat `sha256Hex` klopt.
- `src/keten/profileHash.ts`: normalisatie 5.2.1 en `profileHash` (sha256 via `src/utils/hash.ts`). Let op: plan 1 heeft ook `hashProfile(answers)` in `src/services/ratings/outfitRatings.ts`; dat hasht ruwe quiz-antwoorden voor de bestaande resultatenpagina. `profileHash` hier hasht de genormaliseerde smaak-invoer uit spec 5.2.1. Twee functies, twee betekenissen, niet samenvoegen.
- `src/keten/__tests__/profileHash.test.ts`: tests voor normalisatie en hash.
- `supabase/migrations/20260916100600_create_outfit_sets.sql`: tabel `outfit_sets` (spec 5.5 plus `input_tokens`, `output_tokens`) met RLS en index.
- `supabase/functions/_shared/valideer-outfits.ts`: pure validatie uit spec 5.4 punt 3.
- `supabase/functions/_shared/__tests__/valideer-outfits.test.ts`: tests voor elke regel.
- `supabase/functions/_shared/stylist-prompt.ts`: `STYLIST_VERSION`, toolnaam, tool-schema en de Nederlandse prompt.
- `supabase/functions/_shared/__tests__/stylist-prompt.test.ts`: tests voor schema-strictheid en promptinhoud.
- `supabase/functions/compose-outfits/index.ts`: de edge function (cache met levensduur en voorraadcontrole, Anthropic-aanroep met tijdsbudget, validatie, herkansing, noodpad-signaal, opslag met tokenverbruik, opruimen).
- `src/keten/composeClient.ts`: `composeVoorProfiel` en de pure helpers (`answersVanProfiel`, `productVanKandidaat`, `outfitVanVerrijkt`, `fallbackV2`), client-timeout.
- `src/keten/vanQuiz.ts`: `profielVanQuizAnswers`, bouwt een `TasteProfileInput` uit de bestaande quiz-antwoorden.
- `src/keten/browserConfig.ts`: `browserKetenConfig`, Supabase-client plus functions-URL uit `import.meta.env`.
- `src/keten/vlag.ts`: `ketenStylistVlagAan`, leest `localStorage ff_keten_stylist`.
- `src/keten/__tests__/composeClient.test.ts`: tests voor de pure helpers en `profielVanQuizAnswers`.
- `scripts/keten/stylist-controles.ts`: pure controles uit spec 5.7 plus de cache-controle.
- `scripts/keten/__tests__/stylist-controles.test.ts`: tests voor die controles.
- `scripts/keten/stylist-run.ts`: de vier persona's (uit `src/keten/personas.ts`, plan 1 taak 11) plus het halve-set-profiel, de run tegen de live database, rapportage met latency en tokens.

Wijzigen:

- `package.json`: scripts `typecheck:keten`, `check:shared`, `check:edge` (taak 1).
- `src/utils/hash.ts`: `sha256Hex` en `fnv1a32` erbij als ze ontbreken, `hashString` blijft (taak 2).
- `scripts/keten/persona-run.ts`: modus `--keten=stylist` die naar `stylist-run.ts` delegeert.
- `src/hooks/useOutfits.ts`: achter de vlag de stylist-route gebruiken en de bron teruggeven.
- `src/pages/EnhancedResultsPage.tsx`: badge met de bron naast de kop "Handpicked voor jou".

Hergebruikt uit plan 1 (niet opnieuw schrijven): `outfitKey(productIds)` uit `src/services/ratings/outfitRatings.ts`. De edge function gebruikt dezelfde formule, zodat een `outfit_key` uit `outfit_sets` een op een matcht met `outfit_ratings`.

De regelnummers in de taken zijn gemeten op de huidige `main`. Plan 1 wijzigt `useOutfits.ts` en `EnhancedResultsPage.tsx` ook; schuiven de nummers, dan zijn de geciteerde tekstankers leidend.

---

### Taak 1: poorten voor Deno-code en scripts

**Bestanden:**
- Aanmaken: `tsconfig.keten.json`
- Wijzigen: `package.json` (regels 10-30, het `scripts`-blok; voeg drie regels toe na regel 16 `"typecheck": "tsc --noEmit",`)

**Interfaces:**
- Gebruikt: `tsconfig.json` (bestaand, `include: ["src"]`, `paths` `@/*`), Deno 2.x op de Mac (`/opt/homebrew/bin/deno`, gemeten 2.9.6), `@types/node` (devDependency, aanwezig).
- Levert: `npm run typecheck:keten`, `npm run check:shared`, `npm run check:edge`.

- [ ] **Stap 1: maak de typecheck-configuratie**

Maak `tsconfig.keten.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "types": ["node", "react", "react-dom"]
  },
  "include": [
    "src/vite-env.d.ts",
    "supabase/functions/_shared/**/*.ts",
    "scripts/keten/**/*.ts"
  ],
  "exclude": ["node_modules", "dist", ".netlify", "netlify"]
}
```

Waarom zo: `allowImportingTsExtensions` omdat Deno-bestanden elkaar met `.ts`-extensie importeren (verplicht voor Deno, en met `noEmit` toegestaan voor tsc); `types: node` omdat de scripts `process` en `node:fs` gebruiken; `src/vite-env.d.ts` omdat `scripts/keten` via `composeClient` de engine importeert en die `import.meta.env` kent. Bestanden die de scripts uit `src/` importeren worden meegecontroleerd, net als bij de hoofdconfiguratie.

- [ ] **Stap 2: voeg de scripts toe**

In `package.json`, na regel 16 (`"typecheck": "tsc --noEmit",`), voeg toe:

```json
    "typecheck:keten": "tsc --noEmit -p tsconfig.keten.json",
    "check:shared": "DENO_NO_PACKAGE_JSON=1 deno check supabase/functions/_shared/*.ts",
    "check:edge": "DENO_NO_PACKAGE_JSON=1 deno check supabase/functions/_shared/*.ts supabase/functions/compose-outfits/index.ts",
```

`DENO_NO_PACKAGE_JSON=1` laat Deno de `package.json` in de root negeren; anders zoekt hij `npm:`-imports in `node_modules` en stopt met `Could not find "@supabase/supabase-js" in a node_modules folder` (gemeten op `validate-product-links`). `check:shared` bewust zonder `__tests__/`: die bestanden importeren `vitest` en zijn voor vitest en `typecheck:keten`, niet voor Deno.

- [ ] **Stap 3: draai de nieuwe poorten op de huidige repo**

```bash
npm run typecheck:keten && npm run check:shared
```

Verwacht: `typecheck:keten` geeft geen fouten (er staat nog niets in `scripts/keten/` behalve wat plan 1 bracht; `_shared/cors.ts` en `_shared/productClassifier.ts` zijn schoon, gemeten). `check:shared` print `Check supabase/functions/_shared/cors.ts` en `Check supabase/functions/_shared/productClassifier.ts`, exitcode 0. Bij de eerste run downloadt Deno typedefinities; dat is eenmalig.

Geeft `typecheck:keten` fouten in `scripts/keten/persona-run.ts` uit plan 1, dan is dat de eerste keer dat dat bestand door tsc gaat. Los ze in deze taak op (kleine typefouten, geen gedragswijziging) en neem het bestand op in de commit.

- [ ] **Stap 4: bestaande poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add tsconfig.keten.json package.json
git commit -m "chore(keten): typecheck-poorten voor edge functions en scripts

tsconfig.json ziet alleen src/. Deze twee poorten controleren
supabase/functions/_shared, scripts/keten (tsc) en de Deno-runtime van de
edge function (deno check) voordat er gedeployd wordt.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Verwacht bij de design-check: het totaal blijft gelijk, deze taak wijzigt geen UI.

---

### Taak 2: gedeelde types, `src/utils/hash.ts` en profiel-hash

**Bestanden:**
- Aanmaken: `supabase/functions/_shared/keten-types.ts`
- Aanmaken: `src/keten/types.ts`
- Wijzigen: `src/utils/hash.ts` (bestaand op `main`: regels 1-5, alleen `hashString`)
- Aanmaken: `src/keten/profileHash.ts`
- Test: `src/utils/__tests__/hashCompat.test.ts`
- Test: `src/keten/__tests__/profileHash.test.ts`

**Interfaces:**
- Gebruikt: spec 5.2 (kolommen van `taste_profiles`), 5.2.1 (normalisatie), 5.3 (rij van `get_kandidaten`), 5.4 (outfit-schema), 5.6 (`outfit_key`); `hashString(input: string): number` uit het bestaande `src/utils/hash.ts` (FNV-1a, gebruikt door `src/utils/image.ts` regel 1 en 18).
- Levert:
  - types `Geslacht`, `Gelegenheid`, `Categorie`, `AsNaam`, `AsWaarde`, `Assen`, `Keuze`, `TasteProfile`, `TasteProfileInput`, `ProductAttrs`, `RuwProduct`, `Kandidaat`, `StylistItem`, `StylistOutfit`, `VerrijktItem`, `VerrijkteOutfit`, `OutfitBron`, `ComposeVerzoek`, `ComposeAntwoord`; constanten `GELEGENHEDEN`, `CATEGORIEEN`, `AS_NAMEN`; functie `legeAssen(): Assen`.
  - `sha256Hex(input: string): Promise<string>` en `fnv1a32(input: string): number` in `src/utils/hash.ts`, naast het bestaande `hashString`.
  - `normaliseerProfiel(p: TasteProfileInput): string`
  - `profileHash(p: TasteProfileInput): Promise<string>`

- [ ] **Stap 1: schrijf de falende tests**

Maak `src/utils/__tests__/hashCompat.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { fnv1a32, hashString, sha256Hex } from '../hash';

describe('src/utils/hash.ts', () => {
  it('fnv1a32 en het bestaande hashString zijn hetzelfde algoritme (image.ts leunt op hashString)', () => {
    for (const s of ['', 'a', 'FitFi', 'product:123', 'outfit:abc-def']) {
      expect(fnv1a32(s)).toBe(hashString(s));
    }
  });

  it('fnv1a32 geeft de bekende FNV-1a-waarden', () => {
    expect(fnv1a32('')).toBe(0x811c9dc5);
    expect(fnv1a32('a')).toBe(0xe40c292c);
  });

  it('sha256Hex geeft de bekende digest van abc', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });
});
```

Maak `src/keten/__tests__/profileHash.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { normaliseerProfiel, profileHash } from '../profileHash';
import { legeAssen, type TasteProfileInput } from '../types';

const basis: TasteProfileInput = {
  user_id: null,
  session_id: 'sessie-1',
  gender: 'male',
  occasions: ['work', 'casual'],
  budget_min: 50,
  budget_max: 150,
  nogo_product_ids: ['b', 'a'],
  choices: [
    { pair_id: 'p2', chosen_set_id: 'x', rejected_set_id: 'y', axis: 'formality' },
    { pair_id: 'p1', chosen_set_id: 'q', rejected_set_id: 'r', axis: 'pattern' },
  ],
  axes: legeAssen(),
  liked_product_ids: ['zzz'],
  disliked_product_ids: ['b', 'a'],
};

describe('normaliseerProfiel (spec 5.2.1)', () => {
  it('sorteert gelegenheden, no-go ids en keuzes', () => {
    expect(normaliseerProfiel(basis)).toBe('male|casual,work|50|150|a,b|p1:q,p2:x');
  });

  it('is onafhankelijk van de volgorde van de invoer', () => {
    const gedraaid: TasteProfileInput = {
      ...basis,
      occasions: ['casual', 'work'],
      nogo_product_ids: ['a', 'b'],
      choices: [...basis.choices].reverse(),
    };
    expect(normaliseerProfiel(gedraaid)).toBe(normaliseerProfiel(basis));
  });

  it('neemt session_id, liked ids, disliked ids en assen niet mee', () => {
    const anders: TasteProfileInput = {
      ...basis,
      session_id: 'sessie-2',
      liked_product_ids: [],
      disliked_product_ids: [],
      axes: { ...legeAssen(), formality: { value: 5, confidence: 1 } },
    };
    expect(normaliseerProfiel(anders)).toBe(normaliseerProfiel(basis));
  });

  it('verandert bij een ander budget', () => {
    expect(normaliseerProfiel({ ...basis, budget_max: 200 })).not.toBe(normaliseerProfiel(basis));
  });
});

describe('profileHash', () => {
  it('is 64 hex-tekens en gelijk voor gelijke keuzes', async () => {
    const a = await profileHash(basis);
    const b = await profileHash({ ...basis, session_id: 'iemand-anders' });
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(b);
  });

  it('verandert bij een andere keuze', async () => {
    const anders = await profileHash({
      ...basis,
      choices: [{ pair_id: 'p1', chosen_set_id: 'r', rejected_set_id: 'q', axis: 'pattern' }],
    });
    expect(anders).not.toBe(await profileHash(basis));
  });
});
```

- [ ] **Stap 2: draai de tests en zie ze falen**

```bash
npx vitest run src/utils/__tests__/hashCompat.test.ts src/keten/__tests__/profileHash.test.ts
```

Verwacht: `hashCompat` faalt met `SyntaxError: The requested module '../hash' does not provide an export named 'fnv1a32'` (of `sha256Hex`) als plan 1 het bestand nog niet heeft aangevuld; is plan 1 al uitgevoerd en bevat het bestand `sha256Hex` en `fnv1a32` naast `hashString`, dan slaagt deze test direct en ga je door. `profileHash` faalt met `Error: Failed to resolve import "../profileHash"`.

- [ ] **Stap 3: vul `src/utils/hash.ts` aan met behoud van `hashString`**

Lees eerst het bestand. Bevat het al `sha256Hex`, `fnv1a32` en `hashString`, sla deze stap over. Anders vervang de volledige inhoud van `src/utils/hash.ts` door:

```typescript
/**
 * Hash-helpers voor de hele app.
 *
 * hashString bestond al en wordt gebruikt door src/utils/image.ts voor een
 * vaste placeholder per product. Het is FNV-1a (32 bits). fnv1a32 is
 * dezelfde functie onder de naam die de keten gebruikt voor de seed van
 * engine v2 (plan 1 en plan 3); de test hashCompat.test.ts bewaakt dat ze
 * gelijk blijven. sha256Hex gebruikt WebCrypto, dat in de browser en in
 * Node 19+ als globalThis.crypto beschikbaar is.
 */

export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** FNV-1a, 32 bits, synchroon. Voor een seed hoeft een hash niet cryptografisch te zijn. */
export function fnv1a32(input: string): number {
  return hashString(input);
}

/** sha256 als hex-string van 64 tekens. */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
```

Heeft plan 1 het bestand al vervangen door een versie zonder `hashString`, dan is `image.ts` op dat moment al kapot (`npx tsc --noEmit` meldt `Module '"./hash"' has no exported member 'hashString'`); voeg dan `hashString` weer toe als hierboven en laat `fnv1a32` de bestaande implementatie houden. De test uit stap 1 bewijst dat beide gelijk zijn.

- [ ] **Stap 4: schrijf de gedeelde types**

Maak `supabase/functions/_shared/keten-types.ts`:

```typescript
/**
 * Gedeelde types van de keten (spec 5.2 tot en met 5.5).
 *
 * Dit bestand is de bron. Het staat in supabase/functions/_shared omdat een
 * edge function bij deploy alleen bestanden binnen supabase/functions kan
 * meenemen. src/keten/types.ts exporteert alles hier opnieuw voor de client,
 * de scripts en plan 4. Geen imports, geen Deno- of browser-globals.
 *
 * Wie controleert dit bestand: `npx tsc --noEmit` alleen via de re-export in
 * src/keten/types.ts; `npm run typecheck:keten` rechtstreeks; en
 * `npm run check:edge` (deno check) via de edge function. tsconfig.json
 * heeft include: ["src"], dus zonder die twee scripts wordt de rest van
 * deze map nooit getypecheckt.
 */

export type Geslacht = 'male' | 'female' | 'unisex';

export type Gelegenheid =
  | 'work'
  | 'casual'
  | 'formal'
  | 'date'
  | 'travel'
  | 'sport'
  | 'party';

export const GELEGENHEDEN: readonly Gelegenheid[] = [
  'work',
  'casual',
  'formal',
  'date',
  'travel',
  'sport',
  'party',
];

export type Categorie =
  | 'top'
  | 'bottom'
  | 'footwear'
  | 'outerwear'
  | 'dress'
  | 'accessory';

export const CATEGORIEEN: readonly Categorie[] = [
  'top',
  'bottom',
  'footwear',
  'outerwear',
  'dress',
  'accessory',
];

export type AsNaam =
  | 'formality'
  | 'silhouette'
  | 'color_temp'
  | 'lightness'
  | 'pattern'
  | 'shoe_type';

export const AS_NAMEN: readonly AsNaam[] = [
  'formality',
  'silhouette',
  'color_temp',
  'lightness',
  'pattern',
  'shoe_type',
];

export interface AsWaarde {
  /** formality: 1 tot 5; de andere assen: de tekstwaarde uit spec 5.1; null als onbekend */
  value: string | number | null;
  /** 0 tot 1, zie spec 5.2: |gekozen - afgewezen| / aantal keuzes op de as */
  confidence: number;
}

export type Assen = Record<AsNaam, AsWaarde>;

export function legeAssen(): Assen {
  return {
    formality: { value: null, confidence: 0 },
    silhouette: { value: null, confidence: 0 },
    color_temp: { value: null, confidence: 0 },
    lightness: { value: null, confidence: 0 },
    pattern: { value: null, confidence: 0 },
    shoe_type: { value: null, confidence: 0 },
  };
}

export interface Keuze {
  pair_id: string;
  chosen_set_id: string;
  rejected_set_id: string;
  axis: AsNaam;
}

/** Rij uit taste_profiles (spec 5.2). Plan 4 maakt de tabel; plan 3 gebruikt de vorm. */
export interface TasteProfile {
  id: string;
  profile_hash: string;
  user_id: string | null;
  session_id: string;
  gender: Geslacht;
  occasions: Gelegenheid[];
  budget_min: number;
  budget_max: number;
  nogo_product_ids: string[];
  choices: Keuze[];
  axes: Assen;
  liked_product_ids: string[];
  disliked_product_ids: string[];
  created_at: string;
}

/** Wat de client aanlevert voordat de rij bestaat: alles behalve id, hash en tijd. */
export type TasteProfileInput = Omit<TasteProfile, 'id' | 'profile_hash' | 'created_at'>;

/** product_attributes zonder embedding (spec 5.1), zoals get_kandidaten hem in attrs zet. */
export interface ProductAttrs {
  is_fashion: boolean;
  category: Categorie;
  gender: Geslacht;
  formality: number | null;
  occasions: string[];
  silhouette: string | null;
  color_temp: string | null;
  lightness: string | null;
  pattern: string | null;
  shoe_type: string | null;
  colors: string[];
  materials: string[];
  seasons: string[];
  price_band: string | null;
  confidence: number | null;
  tagger_version: string | null;
}

/** De ruwe products-rij zoals get_kandidaten hem in product zet. */
export interface RuwProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  retailer: string | null;
  url: string | null;
  affiliate_url: string | null;
  product_url: string | null;
  gender: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  in_stock: boolean | null;
  description: string | null;
}

/** Een rij uit get_kandidaten (spec 5.3). */
export interface Kandidaat {
  product_id: string;
  category: Categorie;
  score: number;
  attrs: ProductAttrs;
  product: RuwProduct;
}

/** Wat het model teruggeeft (spec 5.4, punt 2). */
export interface StylistItem {
  product_id: string;
  role: Categorie;
}

export interface StylistOutfit {
  title: string;
  occasion: Gelegenheid;
  items: StylistItem[];
  reason: string;
}

/** Wat in outfit_sets.outfits staat en naar de client gaat: verrijkt met productdata. */
export interface VerrijktItem extends StylistItem {
  product: RuwProduct;
  attrs: ProductAttrs;
}

export interface VerrijkteOutfit {
  /** sha256 van de gesorteerde, ontdubbelde product_ids met komma (spec 5.6; zelfde formule als outfitKey in src/services/ratings/outfitRatings.ts) */
  outfit_key: string;
  title: string;
  occasion: Gelegenheid;
  items: VerrijktItem[];
  reason: string;
}

export type OutfitBron = 'stylist' | 'cache' | 'v2-fallback';

export interface ComposeVerzoek {
  profile_hash: string;
  profile: TasteProfileInput;
  kandidaten: Kandidaat[];
}

export type ComposeAntwoord =
  | {
      fallback: false;
      source: 'stylist' | 'cache';
      stylist_version: string;
      model: string;
      latency_ms: number;
      /** Tokenverbruik van de aanroep(en) die deze set maakten; null bij een oude cache-rij zonder die kolommen */
      input_tokens: number | null;
      output_tokens: number | null;
      outfits: VerrijkteOutfit[];
    }
  | {
      fallback: true;
      reason: string;
      kandidaten: Kandidaat[];
    };
```

Maak `src/keten/types.ts`:

```typescript
/**
 * Keten-types voor client, scripts en plan 4.
 *
 * De bron staat in supabase/functions/_shared/keten-types.ts, omdat een edge
 * function alleen bestanden binnen supabase/functions kan importeren. Hier
 * exporteren we alles opnieuw zodat de rest van de app uit '@/keten/types'
 * importeert en nooit hoeft te weten waar het bestand staat.
 */
export * from '../../supabase/functions/_shared/keten-types';
```

- [ ] **Stap 5: schrijf de hash-module**

Maak `src/keten/profileHash.ts`:

```typescript
import { sha256Hex } from '@/utils/hash';
import type { TasteProfileInput } from './types';

/**
 * Normalisatie uit spec 5.2.1: gender, gesorteerde occasions, budget_min,
 * budget_max, gesorteerde no-go ids, gesorteerde lijst van (pair_id, chosen_set_id).
 * Twee mensen met dezelfde keuzes krijgen dezelfde string, dus dezelfde outfits.
 */
export function normaliseerProfiel(p: TasteProfileInput): string {
  const occasions = [...p.occasions].sort();
  const nogo = [...p.nogo_product_ids].sort();
  const keuzes = p.choices.map((k) => `${k.pair_id}:${k.chosen_set_id}`).sort();
  return [
    p.gender,
    occasions.join(','),
    String(p.budget_min),
    String(p.budget_max),
    nogo.join(','),
    keuzes.join(','),
  ].join('|');
}

export async function profileHash(p: TasteProfileInput): Promise<string> {
  return sha256Hex(normaliseerProfiel(p));
}
```

- [ ] **Stap 6: draai de tests en zie ze slagen**

```bash
npx vitest run src/utils/__tests__/hashCompat.test.ts src/keten/__tests__/profileHash.test.ts
```

Verwacht: 9 tests geslaagd.

- [ ] **Stap 7: poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:shared
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add supabase/functions/_shared/keten-types.ts src/keten/types.ts src/keten/profileHash.ts src/keten/__tests__/profileHash.test.ts src/utils/hash.ts src/utils/__tests__/hashCompat.test.ts
git commit -m "feat(keten): gedeelde types, hash-helpers en profiel-hash voor de stylist-route

Types uit spec 5.2 tot en met 5.5 staan in supabase/functions/_shared zodat
Deno, Vite en vitest hetzelfde bestand lezen; src/keten/types.ts exporteert
ze opnieuw. src/utils/hash.ts houdt hashString (image.ts) en krijgt fnv1a32
en sha256Hex erbij. profileHash volgt de normalisatie uit 5.2.1.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

`npx tsc --noEmit` bewijst hier ook dat `src/utils/image.ts` nog compileert tegen het aangepaste `hash.ts`.

---

### Taak 3: migratie `outfit_sets`

**Bestanden:**
- Aanmaken: `supabase/migrations/20260916100600_create_outfit_sets.sql`

**Interfaces:**
- Gebruikt: spec 5.5; `SUPABASE_DB_URL` in de shell-omgeving (de connection string uit het Supabase-dashboard, Project Settings, Database; plan 2 gebruikt dezelfde variabele).
- Levert: tabel `public.outfit_sets(profile_hash, stylist_version, source, outfits, model, latency_ms, input_tokens, output_tokens, created_at)` met primaire sleutel `(profile_hash, stylist_version)`. Alleen de service role leest en schrijft (de edge function); clients komen er niet bij.

- [ ] **Stap 1: schrijf de migratie**

Maak `supabase/migrations/20260916100600_create_outfit_sets.sql`:

```sql
/*
  # outfit_sets: cache van de stylist per profiel (spec 5.5)

  1. Nieuwe tabel
    - `outfit_sets`
      - `profile_hash` (text) sha256 van de genormaliseerde profiel-invoer (spec 5.2.1)
      - `stylist_version` (text) versie van prompt plus validatie; samen met profile_hash de sleutel
      - `source` (text) 'stylist' of 'v2-fallback'
      - `outfits` (jsonb) het schema uit spec 5.4, verrijkt met productdata
      - `model` (text) het gebruikte model-id
      - `latency_ms` (integer) doorlooptijd van de aanroep
      - `input_tokens`, `output_tokens` (integer) tokenverbruik uit het API-antwoord,
        aanvulling op spec 5.5 zodat de kosten per week een query zijn
      - `created_at` (timestamptz)

  2. Beveiliging
    - RLS aan, geen policies: alleen de service role (de edge function
      compose-outfits) leest en schrijft. Clients krijgen de outfits via de
      edge function, nooit rechtstreeks uit deze tabel.

  3. Levensduur
    - De edge function telt een rij alleen als cache-hit als created_at jonger
      is dan 14 dagen en elk product nog op voorraad is, en verwijdert na elke
      schrijfactie rijen ouder dan 30 dagen. De index op created_at dient die
      twee queries en het tellen per week.
*/

CREATE TABLE IF NOT EXISTS public.outfit_sets (
  profile_hash text NOT NULL,
  stylist_version text NOT NULL,
  source text NOT NULL CHECK (source IN ('stylist', 'v2-fallback')),
  outfits jsonb NOT NULL,
  model text,
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_hash, stylist_version)
);

ALTER TABLE public.outfit_sets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_outfit_sets_created_at
  ON public.outfit_sets (created_at);

COMMENT ON TABLE public.outfit_sets IS
  'Cache van de stylist per profile_hash en stylist_version (spec 5.5). Alleen service role. Levensduur 14 dagen, opruimen na 30 (compose-outfits).';
```

- [ ] **Stap 2: pas de migratie toe op de gekoppelde database**

```bash
supabase db query --linked -f supabase/migrations/20260916100600_create_outfit_sets.sql
```

Verwacht: geen fout (er is geen psql op deze machine en `supabase db push` mag hier nooit, zie Globale randvoorwaarden).

- [ ] **Stap 3: controleer de tabel**

```bash
supabase db query --linked "select column_name, data_type from information_schema.columns where table_name = 'outfit_sets' order by ordinal_position" -o table
```

Verwacht: negen rijen: profile_hash text, stylist_version text, source text, outfits jsonb, model text, latency_ms integer, input_tokens integer, output_tokens integer, created_at timestamp with time zone.

Controleer dat de anon-rol er niet bij kan:

```bash
supabase db query --linked "set role anon; select count(*) from public.outfit_sets" -o table
```

Verwacht: `0` (RLS zonder policy laat niets door) of een permission-fout; beide zijn goed. Geen rij mag zichtbaar zijn.

- [ ] **Stap 4: poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:shared
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add supabase/migrations/20260916100600_create_outfit_sets.sql
git commit -m "feat(db): tabel outfit_sets als cache van de stylist per profiel

Met input_tokens en output_tokens zodat de kosten meetbaar zijn.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 4: harde validatie `valideerOutfits`

**Bestanden:**
- Aanmaken: `supabase/functions/_shared/valideer-outfits.ts`
- Test: `supabase/functions/_shared/__tests__/valideer-outfits.test.ts`

**Interfaces:**
- Gebruikt: `StylistOutfit`, `Kandidaat`, `TasteProfileInput`, `Categorie` uit taak 2.
- Levert:
  ```typescript
  interface ValidatieFout { index: number; reden: string }
  interface ValidatieResultaat { geldig: StylistOutfit[]; fouten: ValidatieFout[] }
  function isCompleet(rollen: Categorie[]): boolean
  function valideerOutfits(outfits: unknown, kandidaten: Kandidaat[], profile: Pick<TasteProfileInput, 'budget_min' | 'budget_max' | 'disliked_product_ids'>): ValidatieResultaat
  ```

Regels (spec 5.4 punt 3), elke overtreding verwerpt de hele outfit:
1. elk `product_id` staat in de kandidaten, en de `role` is gelijk aan de `category` van die kandidaat (een top die als bottom wordt opgevoerd is geen item uit de kandidatenlijst);
2. compleet: `top + bottom + footwear` zonder dress, of `dress + footwear` zonder top en bottom; `outerwear` en `accessory` optioneel; geen rol twee keer;
3. geen id uit `disliked_product_ids`;
4. elk item binnen budget: `budget_min <= price <= budget_max`;
5. geen twee outfits met dezelfde itemset (de eerste blijft, de tweede valt af).

- [ ] **Stap 1: schrijf de falende test**

Maak `supabase/functions/_shared/__tests__/valideer-outfits.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { isCompleet, valideerOutfits } from '../valideer-outfits.ts';
import type { Categorie, Kandidaat, ProductAttrs, RuwProduct, StylistOutfit } from '../keten-types.ts';

function attrs(category: Categorie, extra: Partial<ProductAttrs> = {}): ProductAttrs {
  return {
    is_fashion: true,
    category,
    gender: 'unisex',
    formality: 3,
    occasions: ['casual'],
    silhouette: 'regular',
    color_temp: 'neutraal',
    lightness: 'medium',
    pattern: 'effen',
    shoe_type: category === 'footwear' ? 'sneaker' : null,
    colors: ['zwart'],
    materials: ['katoen'],
    seasons: ['lente'],
    price_band: '50tot100',
    confidence: 0.9,
    tagger_version: 'test',
    ...extra,
  };
}

function product(id: string, price: number): RuwProduct {
  return {
    id,
    name: `Product ${id}`,
    brand: 'Merk',
    price,
    image_url: null,
    retailer: 'test',
    url: null,
    affiliate_url: null,
    product_url: null,
    gender: 'unisex',
    colors: ['zwart'],
    sizes: ['M'],
    in_stock: true,
    description: null,
  };
}

function kandidaat(id: string, category: Categorie, price = 60): Kandidaat {
  return { product_id: id, category, score: 0.5, attrs: attrs(category), product: product(id, price) };
}

const kandidaten: Kandidaat[] = [
  kandidaat('t1', 'top'),
  kandidaat('t2', 'top'),
  kandidaat('b1', 'bottom'),
  kandidaat('f1', 'footwear'),
  kandidaat('f2', 'footwear'),
  kandidaat('d1', 'dress'),
  kandidaat('o1', 'outerwear'),
  kandidaat('a1', 'accessory'),
  kandidaat('duur', 'top', 400),
];

const profiel = { budget_min: 25, budget_max: 100, disliked_product_ids: ['t2'] };

function outfit(items: Array<[string, Categorie]>, title = 'Outfit'): StylistOutfit {
  return {
    title,
    occasion: 'casual',
    items: items.map(([product_id, role]) => ({ product_id, role })),
    reason: 'Reden.',
  };
}

describe('isCompleet', () => {
  it('accepteert top+bottom+footwear en dress+footwear, met optionele lagen', () => {
    expect(isCompleet(['top', 'bottom', 'footwear'])).toBe(true);
    expect(isCompleet(['top', 'bottom', 'footwear', 'outerwear', 'accessory'])).toBe(true);
    expect(isCompleet(['dress', 'footwear'])).toBe(true);
    expect(isCompleet(['dress', 'footwear', 'outerwear'])).toBe(true);
  });

  it('wijst onvolledige en gemengde structuren af', () => {
    expect(isCompleet(['top', 'bottom'])).toBe(false);
    expect(isCompleet(['dress'])).toBe(false);
    expect(isCompleet(['dress', 'top', 'footwear'])).toBe(false);
    expect(isCompleet(['top', 'top', 'bottom', 'footwear'])).toBe(false);
    expect(isCompleet([])).toBe(false);
  });
});

describe('valideerOutfits (spec 5.4 punt 3)', () => {
  it('laat een correcte outfit door', () => {
    const r = valideerOutfits([outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(1);
    expect(r.fouten).toHaveLength(0);
  });

  it('verwerpt een id dat niet in de kandidaten staat', () => {
    const r = valideerOutfits([outfit([['xx', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('onbekend id xx');
  });

  it('verwerpt een rol die niet bij de categorie van de kandidaat past', () => {
    const r = valideerOutfits([outfit([['b1', 'top'], ['t1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('rol top klopt niet');
  });

  it('verwerpt een onvolledige outfit', () => {
    const r = valideerOutfits([outfit([['t1', 'top'], ['b1', 'bottom']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('niet compleet');
  });

  it('verwerpt een afgewezen item', () => {
    const r = valideerOutfits([outfit([['t2', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('afgewezen item t2');
  });

  it('verwerpt een item buiten budget', () => {
    const r = valideerOutfits([outfit([['duur', 'top'], ['b1', 'bottom'], ['f1', 'footwear']])], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('buiten budget: duur kost 400');
  });

  it('verwerpt de tweede outfit met dezelfde itemset, ongeacht volgorde', () => {
    const a = outfit([['t1', 'top'], ['b1', 'bottom'], ['f1', 'footwear']], 'A');
    const b = outfit([['f1', 'footwear'], ['t1', 'top'], ['b1', 'bottom']], 'B');
    const r = valideerOutfits([a, b], kandidaten, profiel);
    expect(r.geldig.map((o) => o.title)).toEqual(['A']);
    expect(r.fouten[0]).toEqual({ index: 1, reden: 'zelfde itemset als een eerdere outfit' });
  });

  it('bundelt meerdere fouten van een outfit in een regel en houdt de index', () => {
    const goed = outfit([['d1', 'dress'], ['f2', 'footwear']], 'Goed');
    const fout = outfit([['t2', 'top'], ['duur', 'top'], ['f1', 'footwear']], 'Fout');
    const r = valideerOutfits([goed, fout], kandidaten, profiel);
    expect(r.geldig).toHaveLength(1);
    expect(r.fouten).toHaveLength(1);
    expect(r.fouten[0].index).toBe(1);
    expect(r.fouten[0].reden).toContain('afgewezen item t2');
    expect(r.fouten[0].reden).toContain('buiten budget');
    expect(r.fouten[0].reden).toContain('niet compleet');
  });

  it('overleeft onzin als invoer', () => {
    expect(valideerOutfits(null, kandidaten, profiel)).toEqual({ geldig: [], fouten: [] });
    const r = valideerOutfits([{ title: 1, items: 'nee' }], kandidaten, profiel);
    expect(r.geldig).toHaveLength(0);
    expect(r.fouten[0].reden).toContain('geen items');
  });
});
```

- [ ] **Stap 2: draai de test en zie hem falen**

```bash
npx vitest run supabase/functions/_shared/__tests__/valideer-outfits.test.ts
```

Verwacht: `Failed to resolve import "../valideer-outfits.ts"`.

- [ ] **Stap 3: schrijf de validatie**

Maak `supabase/functions/_shared/valideer-outfits.ts`:

```typescript
/**
 * Harde validatie na het stylist-model (spec 5.4, punt 3).
 *
 * Pure functie zonder Deno- of browser-globals, zodat vitest hem test en de
 * edge function hem ongewijzigd importeert. Elke overtreding verwerpt de hele
 * outfit; de reden gaat bij een herkansing terug in de prompt.
 */
import type { Categorie, Kandidaat, StylistItem, StylistOutfit, TasteProfileInput } from './keten-types.ts';
import { CATEGORIEEN } from './keten-types.ts';

export interface ValidatieFout {
  index: number;
  reden: string;
}

export interface ValidatieResultaat {
  geldig: StylistOutfit[];
  fouten: ValidatieFout[];
}

type BudgetProfiel = Pick<TasteProfileInput, 'budget_min' | 'budget_max' | 'disliked_product_ids'>;

/**
 * top + bottom + footwear zonder dress, of dress + footwear zonder top en
 * bottom. outerwear en accessory zijn optioneel. Geen rol twee keer.
 */
export function isCompleet(rollen: Categorie[]): boolean {
  if (rollen.length === 0) return false;
  const gezien = new Set<Categorie>();
  for (const rol of rollen) {
    if (!CATEGORIEEN.includes(rol)) return false;
    if (gezien.has(rol)) return false;
    gezien.add(rol);
  }
  if (!gezien.has('footwear')) return false;
  if (gezien.has('dress')) {
    return !gezien.has('top') && !gezien.has('bottom');
  }
  return gezien.has('top') && gezien.has('bottom');
}

function isItem(x: unknown): x is StylistItem {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as StylistItem).product_id === 'string' &&
    typeof (x as StylistItem).role === 'string'
  );
}

function isOutfitVorm(x: unknown): x is StylistOutfit {
  return typeof x === 'object' && x !== null && Array.isArray((x as StylistOutfit).items);
}

export function valideerOutfits(
  outfits: unknown,
  kandidaten: Kandidaat[],
  profile: BudgetProfiel
): ValidatieResultaat {
  if (!Array.isArray(outfits)) return { geldig: [], fouten: [] };

  const perId = new Map<string, Kandidaat>();
  for (const k of kandidaten) perId.set(k.product_id, k);
  const afgewezen = new Set(profile.disliked_product_ids ?? []);
  const gezienItemsets = new Set<string>();

  const geldig: StylistOutfit[] = [];
  const fouten: ValidatieFout[] = [];

  outfits.forEach((ruw, index) => {
    const redenen: string[] = [];

    if (!isOutfitVorm(ruw) || ruw.items.length === 0 || !ruw.items.every(isItem)) {
      fouten.push({ index, reden: 'geen items' });
      return;
    }

    const rollen: Categorie[] = [];
    for (const item of ruw.items) {
      const k = perId.get(item.product_id);
      if (!k) {
        redenen.push(`onbekend id ${item.product_id}`);
        continue;
      }
      if (k.category !== item.role) {
        redenen.push(`rol ${item.role} klopt niet met categorie ${k.category} van ${item.product_id}`);
      }
      rollen.push(item.role as Categorie);
      if (afgewezen.has(item.product_id)) {
        redenen.push(`afgewezen item ${item.product_id}`);
      }
      const prijs = k.product?.price;
      if (typeof prijs !== 'number' || prijs < profile.budget_min || prijs > profile.budget_max) {
        redenen.push(`buiten budget: ${item.product_id} kost ${prijs}`);
      }
    }

    if (!isCompleet(rollen)) {
      redenen.push(`niet compleet: rollen ${rollen.join('+') || 'geen'}`);
    }

    const itemset = ruw.items.map((i) => i.product_id).sort().join('|');
    if (gezienItemsets.has(itemset)) {
      redenen.push('zelfde itemset als een eerdere outfit');
    }

    if (redenen.length > 0) {
      fouten.push({ index, reden: redenen.join('; ') });
      return;
    }

    gezienItemsets.add(itemset);
    geldig.push(ruw);
  });

  return { geldig, fouten };
}
```

- [ ] **Stap 4: draai de test en zie hem slagen**

```bash
npx vitest run supabase/functions/_shared/__tests__/valideer-outfits.test.ts
```

Verwacht: 11 tests geslaagd.

- [ ] **Stap 5: poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:shared
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add supabase/functions/_shared/valideer-outfits.ts supabase/functions/_shared/__tests__/valideer-outfits.test.ts
git commit -m "feat(keten): harde validatie van stylist-outfits als pure functie

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 5: prompt en tool-schema voor de stylist

**Bestanden:**
- Aanmaken: `supabase/functions/_shared/stylist-prompt.ts`
- Test: `supabase/functions/_shared/__tests__/stylist-prompt.test.ts`

**Interfaces:**
- Gebruikt: `Gelegenheid`, `Kandidaat`, `TasteProfileInput`, `CATEGORIEEN`, `AS_NAMEN` uit taak 2.
- Levert:
  ```typescript
  const STYLIST_VERSION = 'stylist-v1'
  const TOOL_NAAM = 'lever_outfits'
  function bouwToolSchema(occasions: Gelegenheid[]): Record<string, unknown>
  function bouwSysteemPrompt(): string
  function bouwGebruikersPrompt(profile: TasteProfileInput, kandidaten: Kandidaat[], vorigeFouten: string[]): string
  ```

Het tool-schema is exact het outfits-schema uit spec 5.4, met `occasion` beperkt tot de gelegenheden van het profiel en `role` tot de zes categorieën. Elk object heeft `additionalProperties: false` en `required`, want de tool wordt met `strict: true` gestuurd.

- [ ] **Stap 1: schrijf de falende test**

Maak `supabase/functions/_shared/__tests__/stylist-prompt.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  STYLIST_VERSION,
  TOOL_NAAM,
  bouwGebruikersPrompt,
  bouwSysteemPrompt,
  bouwToolSchema,
} from '../stylist-prompt.ts';
import { legeAssen, type Kandidaat, type TasteProfileInput } from '../keten-types.ts';

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

const kandidaat: Kandidaat = {
  product_id: '11111111-1111-1111-1111-111111111111',
  category: 'top',
  score: 0.7,
  attrs: {
    is_fashion: true,
    category: 'top',
    gender: 'male',
    formality: 4,
    occasions: ['work'],
    silhouette: 'slim',
    color_temp: 'koel',
    lightness: 'donker',
    pattern: 'effen',
    shoe_type: null,
    colors: ['navy'],
    materials: ['wol'],
    seasons: ['herfst'],
    price_band: '50tot100',
    confidence: 0.9,
    tagger_version: 'haiku-4.5-v1',
  },
  product: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Wollen overhemd',
    brand: 'Merk A',
    price: 79,
    image_url: null,
    retailer: 'H&M',
    url: null,
    affiliate_url: null,
    product_url: null,
    gender: 'male',
    colors: ['navy'],
    sizes: ['M'],
    in_stock: true,
    description: null,
  },
};

const profiel: TasteProfileInput = {
  user_id: null,
  session_id: 's',
  gender: 'male',
  occasions: ['work', 'date'],
  budget_min: 50,
  budget_max: 150,
  nogo_product_ids: [],
  choices: [],
  axes: { ...legeAssen(), formality: { value: 4, confidence: 0.8 } },
  liked_product_ids: [kandidaat.product_id],
  disliked_product_ids: ['22222222-2222-2222-2222-222222222222'],
};

describe('bouwToolSchema', () => {
  it('is strikt op elk objectniveau en beperkt occasion tot het profiel', () => {
    const schema = bouwToolSchema(['work', 'date']) as any;
    expect(alleObjectenStrikt(schema)).toBe(true);
    expect(schema.properties.outfits.items.properties.occasion.enum).toEqual(['work', 'date']);
    expect(schema.properties.outfits.items.properties.items.items.properties.role.enum).toEqual([
      'top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory',
    ]);
  });
});

describe('prompts', () => {
  it('versie en toolnaam zijn vast', () => {
    expect(STYLIST_VERSION).toBe('stylist-v1');
    expect(TOOL_NAAM).toBe('lever_outfits');
  });

  it('systeemprompt is Nederlands en noemt de tool en de zes-outfits-eis', () => {
    const s = bouwSysteemPrompt();
    expect(s).toContain('lever_outfits');
    expect(s).toContain('zes outfits');
    expect(s).toContain('je en jij');
  });

  it('gebruikersprompt bevat feiten, assen, voorbeelden en elke kandidaat', () => {
    const p = bouwGebruikersPrompt(profiel, [kandidaat], []);
    expect(p).toContain('Budget per stuk: 50 tot 150 euro');
    expect(p).toContain('Gelegenheden: work, date');
    expect(p).toContain('formality: 4 (zekerheid 0.8)');
    expect(p).toContain('silhouette: onbekend (zekerheid 0)');
    expect(p).toContain(kandidaat.product_id);
    expect(p).toContain('Wollen overhemd');
    expect(p).toContain('79 euro');
    expect(p).toContain('22222222-2222-2222-2222-222222222222');
    expect(p).not.toContain('Fouten in de vorige poging');
  });

  it('gebruikersprompt neemt de fouten van de vorige poging op', () => {
    const p = bouwGebruikersPrompt(profiel, [kandidaat], ['outfit 2: buiten budget: x kost 400']);
    expect(p).toContain('Fouten in de vorige poging');
    expect(p).toContain('outfit 2: buiten budget: x kost 400');
  });
});
```

- [ ] **Stap 2: draai de test en zie hem falen**

```bash
npx vitest run supabase/functions/_shared/__tests__/stylist-prompt.test.ts
```

Verwacht: `Failed to resolve import "../stylist-prompt.ts"`.

- [ ] **Stap 3: schrijf prompt en schema**

Maak `supabase/functions/_shared/stylist-prompt.ts`:

```typescript
/**
 * Prompt en tool-schema van de stylist (spec 5.4, punt 2).
 *
 * Puur: geen Deno-globals, zodat vitest de inhoud kan testen. Verander je de
 * prompt of het schema, verhoog dan STYLIST_VERSION; dat maakt de cache in
 * outfit_sets automatisch ongeldig voor de oude versie.
 */
import type { Gelegenheid, Kandidaat, TasteProfileInput } from './keten-types.ts';
import { AS_NAMEN, CATEGORIEEN } from './keten-types.ts';

export const STYLIST_VERSION = 'stylist-v1';
export const TOOL_NAAM = 'lever_outfits';

export function bouwToolSchema(occasions: Gelegenheid[]): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      outfits: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Maximaal zes woorden, Nederlands.' },
            occasion: { type: 'string', enum: [...occasions] },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'string', description: 'Een product_id uit de kandidatenlijst.' },
                  role: { type: 'string', enum: [...CATEGORIEEN] },
                },
                required: ['product_id', 'role'],
                additionalProperties: false,
              },
            },
            reason: {
              type: 'string',
              description: 'Twee zinnen, Nederlands, verwijst naar iets concreets uit de items.',
            },
          },
          required: ['title', 'occasion', 'items', 'reason'],
          additionalProperties: false,
        },
      },
    },
    required: ['outfits'],
    additionalProperties: false,
  };
}

export function bouwSysteemPrompt(): string {
  return [
    'Je bent de stylist van FitFi. Je stelt complete outfits samen uit een vaste kandidatenlijst voor een bezoeker die net zijn smaak heeft laten zien door outfits te kiezen en af te wijzen.',
    '',
    'Regels:',
    '1. Gebruik alleen product_ids uit de kandidatenlijst. Verzin geen ids en gebruik elk id in de rol die bij zijn categorie hoort.',
    '2. Lever precies zes outfits.',
    '3. Elke outfit is compleet: top + bottom + footwear, of dress + footwear. Outerwear en accessory zijn optioneel en komen hooguit een keer per outfit voor. Nooit een dress samen met een top of bottom.',
    '4. Elke gelegenheid uit het profiel komt minstens een keer voor als occasion.',
    '5. Geen twee outfits met dezelfde top of dezelfde dress.',
    '6. Geen twee outfits met precies dezelfde items.',
    '7. Elk item valt binnen het budget per stuk.',
    '8. Gebruik nooit een afgewezen item.',
    '9. Laat de outfit samenhangen op formaliteit, silhouet, kleurtemperatuur en patroon. Geen sandalen en geen zwemkleding bij work of formal.',
    '10. title: maximaal zes woorden, Nederlands. reason: twee zinnen, Nederlands, spreek de bezoeker aan met je en jij, en noem iets concreets uit de items (merk, materiaal, kleur of pasvorm). Geen superlatieven, niet de woorden authentiek, uniek of game-changer, en geen beweringen over de bezoeker die niet uit de keuzes volgen.',
    '',
    `Antwoord uitsluitend via de tool ${TOOL_NAAM}.`,
  ].join('\n');
}

const GESLACHT_LABEL: Record<TasteProfileInput['gender'], string> = {
  male: 'heren',
  female: 'dames',
  unisex: 'dames en heren (unisex)',
};

function asRegel(naam: string, waarde: string | number | null, confidence: number): string {
  const tekst = waarde === null || waarde === undefined ? 'onbekend' : String(waarde);
  const zeker = Number.isFinite(confidence) ? Math.round(confidence * 100) / 100 : 0;
  return `- ${naam}: ${tekst} (zekerheid ${zeker})`;
}

function kandidaatRegel(k: Kandidaat): string {
  const p = k.product;
  const a = k.attrs;
  const delen = [
    k.product_id,
    p.name,
    p.brand ?? 'merk onbekend',
    `${p.price} euro`,
    `formaliteit ${a.formality ?? '?'}`,
    a.silhouette ?? 'silhouet ?',
    a.color_temp ?? 'temperatuur ?',
    a.lightness ?? 'lichtheid ?',
    a.pattern ?? 'patroon ?',
    `kleuren: ${(a.colors ?? []).join(', ') || 'onbekend'}`,
    `materialen: ${(a.materials ?? []).join(', ') || 'onbekend'}`,
    `gelegenheden: ${(a.occasions ?? []).join(', ') || 'onbekend'}`,
  ];
  if (k.category === 'footwear') delen.push(`schoen: ${a.shoe_type ?? 'onbekend'}`);
  return `- ${delen.join(' | ')}`;
}

function voorbeeldRegels(ids: string[], perId: Map<string, Kandidaat>): string {
  if (ids.length === 0) return '- geen';
  return ids
    .map((id) => {
      const k = perId.get(id);
      return k ? `- ${id}: ${k.product.name}, ${k.product.brand ?? 'merk onbekend'}` : `- ${id}`;
    })
    .join('\n');
}

export function bouwGebruikersPrompt(
  profile: TasteProfileInput,
  kandidaten: Kandidaat[],
  vorigeFouten: string[]
): string {
  const perId = new Map<string, Kandidaat>();
  for (const k of kandidaten) perId.set(k.product_id, k);

  const perCategorie = new Map<string, Kandidaat[]>();
  for (const k of kandidaten) {
    const lijst = perCategorie.get(k.category) ?? [];
    lijst.push(k);
    perCategorie.set(k.category, lijst);
  }

  const delen: string[] = [];
  delen.push('## Harde feiten');
  delen.push(`- Voor wie: ${GESLACHT_LABEL[profile.gender]}`);
  delen.push(`- Gelegenheden: ${profile.occasions.join(', ')}`);
  delen.push(`- Budget per stuk: ${profile.budget_min} tot ${profile.budget_max} euro`);
  delen.push('');
  delen.push('## Smaak-assen (waarde, zekerheid 0 tot 1; onder 0.5 is onzeker)');
  for (const as of AS_NAMEN) {
    const w = profile.axes?.[as] ?? { value: null, confidence: 0 };
    delen.push(asRegel(as, w.value, w.confidence));
  }
  delen.push('');
  delen.push('## Gekozen items (voorbeelden van wat de bezoeker mooi vindt)');
  delen.push(voorbeeldRegels(profile.liked_product_ids ?? [], perId));
  delen.push('');
  delen.push('## Afgewezen items (nooit gebruiken)');
  delen.push(voorbeeldRegels(profile.disliked_product_ids ?? [], perId));
  delen.push('');
  delen.push('## Kandidaten (product_id | naam | merk | prijs | attributen)');
  for (const categorie of CATEGORIEEN) {
    const lijst = perCategorie.get(categorie) ?? [];
    delen.push(`### ${categorie} (${lijst.length})`);
    delen.push(lijst.length === 0 ? '- geen' : lijst.map(kandidaatRegel).join('\n'));
  }

  if (vorigeFouten.length > 0) {
    delen.push('');
    delen.push('## Fouten in de vorige poging');
    delen.push('Je vorige antwoord had deze fouten. Lever zes nieuwe outfits zonder deze fouten:');
    delen.push(vorigeFouten.map((f) => `- ${f}`).join('\n'));
  }

  delen.push('');
  delen.push(`Stel nu zes outfits samen en lever ze via ${TOOL_NAAM}.`);
  return delen.join('\n');
}
```

- [ ] **Stap 4: draai de test en zie hem slagen**

```bash
npx vitest run supabase/functions/_shared/__tests__/stylist-prompt.test.ts
```

Verwacht: 5 tests geslaagd.

- [ ] **Stap 5: poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:shared
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add supabase/functions/_shared/stylist-prompt.ts supabase/functions/_shared/__tests__/stylist-prompt.test.ts
git commit -m "feat(keten): Nederlandse stylist-prompt en strikt tool-schema

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 6: edge function `compose-outfits`

**Bestanden:**
- Aanmaken: `supabase/functions/compose-outfits/index.ts`

**Interfaces:**
- Gebruikt: `buildCorsHeaders(req, extraHeaders?)` uit `supabase/functions/_shared/cors.ts`; `valideerOutfits` (taak 4); `STYLIST_VERSION`, `TOOL_NAAM`, `bouwToolSchema`, `bouwSysteemPrompt`, `bouwGebruikersPrompt` (taak 5); types uit taak 2; tabel `outfit_sets` (taak 3); tabel `products(id, in_stock)` (bestaand).
- Levert: `POST /functions/v1/compose-outfits` met body `ComposeVerzoek` en antwoord `ComposeAntwoord` (taak 2). `OPTIONS` geeft 204 met CORS-headers. Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STYLIST_MODEL` (default `claude-sonnet-5`).

Anthropic-aanroep (Messages API, geverifieerd tegen de claude-api skill op 2026-09-15):
- `POST https://api.anthropic.com/v1/messages`, headers `content-type: application/json`, `x-api-key`, `anthropic-version: 2023-06-01`.
- Body: `model`, `max_tokens: 4096`, `thinking: { type: 'disabled' }` (Sonnet 5 accepteert `disabled`; `budget_tokens` geeft een 400), `system`, `messages`, `tools: [{ name, description, input_schema, strict: true }]`, `tool_choice: { type: 'tool', name: TOOL_NAAM, disable_parallel_tool_use: true }` (geforceerde tool-keuze werkt op Sonnet 5). Geen `temperature` (Sonnet 5 weigert sampling-parameters met een 400).
- Antwoord: `content[]` bevat een blok `{ type: 'tool_use', name, input }`; `input.outfits` is de uitvoer. `usage.input_tokens` en `usage.output_tokens` gaan mee naar `outfit_sets`. `stop_reason: 'refusal'` telt als storing.

Tijdsbudget en cache (zie de secties "Wachttijd-budget" en "Cache-levensduur" bovenaan): een aanroep hooguit 45 s; herkansing alleen als na de eerste poging minder dan 50 s verstreken is; cache-hit alleen als de rij jonger is dan 14 dagen en elk product nog op voorraad; na elke schrijfactie rijen ouder dan 30 dagen weg.

- [ ] **Stap 1: schrijf de edge function**

Maak `supabase/functions/compose-outfits/index.ts`:

```typescript
/**
 * compose-outfits (spec 5.4)
 *
 * 1. Cache-hit op outfit_sets(profile_hash, stylist_version), mits jonger dan
 *    CACHE_MAX_LEEFTIJD_DAGEN en elk product nog op voorraad: terug.
 * 2. Anders het stylist-model via de Anthropic Messages API met een tool als
 *    structured output, hooguit AANROEP_TIMEOUT_MS per aanroep.
 * 3. Harde validatie (valideerOutfits). Minder dan vier geldige outfits: een
 *    keer opnieuw met de fouten in de prompt, maar alleen als er nog tijd is
 *    binnen TOTAAL_BUDGET_MS.
 * 4. Noodpad: bij storing, na twee mislukte pogingen of als de tijd op is
 *    geeft deze functie { fallback: true, reason, kandidaten } terug. De
 *    client draait dan engine v2 met seed = fnv1a32(profile_hash). Die code
 *    is client-side TypeScript met tientallen modules; een Deno-port zou een
 *    tweede engine zijn die uit de pas loopt met de eerste.
 * 5. Schrijf naar outfit_sets (met tokenverbruik), ruim oude rijen op en geef
 *    terug.
 *
 * Poort voor dit bestand: `npm run check:edge` (deno check). tsc ziet het niet.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { valideerOutfits } from '../_shared/valideer-outfits.ts';
import {
  STYLIST_VERSION,
  TOOL_NAAM,
  bouwGebruikersPrompt,
  bouwSysteemPrompt,
  bouwToolSchema,
} from '../_shared/stylist-prompt.ts';
import type {
  ComposeAntwoord,
  ComposeVerzoek,
  Kandidaat,
  StylistOutfit,
  TasteProfileInput,
  VerrijkteOutfit,
} from '../_shared/keten-types.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const STANDAARD_MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 4096;
const MIN_GELDIG = 4;
const DOEL_AANTAL = 6;

/** Wachttijd-budget (zie plan): een aanroep 45 s, herkansing alleen voor de 50 s-grens, totaal onder 100 s. */
const AANROEP_TIMEOUT_MS = 45_000;
const HERKANSING_UITERLIJK_MS = 50_000;

/** Cache-levensduur (zie plan). */
const CACHE_MAX_LEEFTIJD_DAGEN = 14;
const OPRUIMEN_NA_DAGEN = 30;
const DAG_MS = 86_400_000;

function antwoord(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildCorsHeaders(req, { 'Content-Type': 'application/json' }),
  });
}

async function sha256Hex(tekst: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tekst));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isVerzoek(x: unknown): x is ComposeVerzoek {
  if (typeof x !== 'object' || x === null) return false;
  const v = x as ComposeVerzoek;
  return (
    typeof v.profile_hash === 'string' &&
    v.profile_hash.length > 0 &&
    typeof v.profile === 'object' &&
    v.profile !== null &&
    Array.isArray(v.profile.occasions) &&
    v.profile.occasions.length > 0 &&
    typeof v.profile.budget_min === 'number' &&
    typeof v.profile.budget_max === 'number' &&
    Array.isArray(v.kandidaten) &&
    v.kandidaten.length > 0
  );
}

interface AnthropicBlok {
  type: string;
  name?: string;
  input?: { outfits?: unknown };
}

interface AnthropicAntwoord {
  stop_reason?: string;
  content?: AnthropicBlok[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

interface StylistUitkomst {
  outfits: unknown;
  input_tokens: number;
  output_tokens: number;
}

async function vraagStylist(
  apiKey: string,
  model: string,
  profile: TasteProfileInput,
  kandidaten: Kandidaat[],
  vorigeFouten: string[]
): Promise<StylistUitkomst> {
  const body = {
    model,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'disabled' },
    system: bouwSysteemPrompt(),
    messages: [{ role: 'user', content: bouwGebruikersPrompt(profile, kandidaten, vorigeFouten) }],
    tools: [
      {
        name: TOOL_NAAM,
        description: 'Levert zes complete outfits uit de kandidatenlijst, met titel en reden in het Nederlands.',
        input_schema: bouwToolSchema(profile.occasions),
        strict: true,
      },
    ],
    tool_choice: { type: 'tool', name: TOOL_NAAM, disable_parallel_tool_use: true },
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
  if (data.stop_reason === 'refusal') {
    throw new Error('model weigerde het verzoek');
  }
  const blok = (data.content ?? []).find((b) => b.type === 'tool_use' && b.name === TOOL_NAAM);
  if (!blok) {
    throw new Error(`geen tool_use-blok in antwoord (stop_reason ${data.stop_reason ?? 'onbekend'})`);
  }
  return {
    outfits: blok.input?.outfits,
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  };
}

/**
 * Zelfde formule als outfitKey in src/services/ratings/outfitRatings.ts (plan 1):
 * gesorteerde, ontdubbelde ids met komma, dan sha256. Zo matcht een rij in
 * outfit_sets een op een met een beoordeling in outfit_ratings.
 */
async function outfitKey(productIds: string[]): Promise<string> {
  const ids = Array.from(new Set(productIds.map(String))).sort();
  return sha256Hex(ids.join(','));
}

async function verrijk(outfit: StylistOutfit, perId: Map<string, Kandidaat>): Promise<VerrijkteOutfit> {
  const items = outfit.items.map((item) => {
    const k = perId.get(item.product_id) as Kandidaat;
    return { product_id: item.product_id, role: item.role, product: k.product, attrs: k.attrs };
  });
  const outfit_key = await outfitKey(items.map((i) => i.product_id));
  return { outfit_key, title: outfit.title, occasion: outfit.occasion, items, reason: outfit.reason };
}

function productIdsVan(outfits: VerrijkteOutfit[]): string[] {
  const ids = new Set<string>();
  for (const o of outfits) for (const it of o.items ?? []) ids.add(it.product_id);
  return Array.from(ids);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
  }
  if (req.method !== 'POST') {
    return antwoord(req, { error: 'Alleen POST' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  const model = Deno.env.get('STYLIST_MODEL') ?? STANDAARD_MODEL;

  if (!supabaseUrl || !serviceKey) {
    return antwoord(req, { error: 'Serverconfiguratie ontbreekt' }, 500);
  }

  let verzoek: unknown;
  try {
    verzoek = await req.json();
  } catch {
    return antwoord(req, { error: 'Body is geen JSON' }, 400);
  }
  if (!isVerzoek(verzoek)) {
    return antwoord(req, { error: 'Verwacht { profile_hash, profile, kandidaten }' }, 400);
  }
  const { profile_hash, profile, kandidaten } = verzoek;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Cache: alleen een rij jonger dan CACHE_MAX_LEEFTIJD_DAGEN, en alleen als
  //    elk product nog op voorraad is. Anders opnieuw samenstellen.
  const cacheGrens = new Date(Date.now() - CACHE_MAX_LEEFTIJD_DAGEN * DAG_MS).toISOString();
  const { data: cache, error: cacheFout } = await admin
    .from('outfit_sets')
    .select('outfits, model, latency_ms, input_tokens, output_tokens')
    .eq('profile_hash', profile_hash)
    .eq('stylist_version', STYLIST_VERSION)
    .gte('created_at', cacheGrens)
    .maybeSingle();
  if (cacheFout) {
    console.error('[compose-outfits] cache lezen mislukt:', cacheFout.message);
  }
  if (cache) {
    const cacheOutfits = cache.outfits as VerrijkteOutfit[];
    const ids = productIdsVan(cacheOutfits);
    const { data: opVoorraad, error: voorraadFout } = await admin
      .from('products')
      .select('id')
      .in('id', ids)
      .eq('in_stock', true);
    // Bij een databasefout de cache toch teruggeven: geen geld uitgeven om een
    // tijdelijke storing te omzeilen. Alleen een echte voorraadwijziging is een miss.
    const nogCompleet = voorraadFout ? true : (opVoorraad ?? []).length === ids.length;
    if (voorraadFout) {
      console.error('[compose-outfits] voorraadcontrole mislukt, cache gebruikt:', voorraadFout.message);
    }
    if (nogCompleet) {
      const uit: ComposeAntwoord = {
        fallback: false,
        source: 'cache',
        stylist_version: STYLIST_VERSION,
        model: cache.model ?? model,
        latency_ms: cache.latency_ms ?? 0,
        input_tokens: cache.input_tokens ?? null,
        output_tokens: cache.output_tokens ?? null,
        outfits: cacheOutfits,
      };
      return antwoord(req, uit);
    }
    console.warn(
      '[compose-outfits] cache verworpen:',
      ids.length - (opVoorraad ?? []).length,
      'product(en) niet meer op voorraad'
    );
  }

  if (!apiKey) {
    const uit: ComposeAntwoord = { fallback: true, reason: 'ANTHROPIC_API_KEY ontbreekt', kandidaten };
    return antwoord(req, uit);
  }

  // 2 en 3. Model, validatie, een herkansing met de fouten in de prompt,
  //         alleen als het tijdsbudget dat toelaat.
  const start = Date.now();
  const perId = new Map<string, Kandidaat>();
  for (const k of kandidaten) perId.set(k.product_id, k);

  let geldig: StylistOutfit[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let noodpadReden: string | null = null;
  try {
    const eerste = await vraagStylist(apiKey, model, profile, kandidaten, []);
    inputTokens += eerste.input_tokens;
    outputTokens += eerste.output_tokens;
    const v1 = valideerOutfits(eerste.outfits, kandidaten, profile);
    geldig = v1.geldig;
    if (geldig.length < MIN_GELDIG) {
      const verstreken = Date.now() - start;
      if (verstreken > HERKANSING_UITERLIJK_MS) {
        noodpadReden = `${geldig.length} geldige outfits en geen tijd voor een herkansing (${verstreken} ms)`;
      } else {
        const fouten = v1.fouten.map((f) => `outfit ${f.index + 1}: ${f.reden}`);
        console.warn('[compose-outfits] herkansing na', geldig.length, 'geldige outfits', fouten);
        const tweede = await vraagStylist(apiKey, model, profile, kandidaten, fouten);
        inputTokens += tweede.input_tokens;
        outputTokens += tweede.output_tokens;
        // Nieuwe outfits eerst, de geldige uit de eerste poging erachter; de
        // validator laat van gelijke itemsets alleen de eerste door.
        const samen = [...(Array.isArray(tweede.outfits) ? tweede.outfits : []), ...geldig];
        geldig = valideerOutfits(samen, kandidaten, profile).geldig;
        if (geldig.length < MIN_GELDIG) {
          noodpadReden = `na twee pogingen ${geldig.length} geldige outfits`;
        }
      }
    }
  } catch (err) {
    noodpadReden = err instanceof Error ? err.message : String(err);
  }

  // 4. Noodpad-signaal
  if (noodpadReden !== null) {
    console.error('[compose-outfits] noodpad:', noodpadReden, `(${inputTokens} in, ${outputTokens} uit)`);
    const uit: ComposeAntwoord = { fallback: true, reason: noodpadReden, kandidaten };
    return antwoord(req, uit);
  }

  const outfits = await Promise.all(geldig.slice(0, DOEL_AANTAL).map((o) => verrijk(o, perId)));
  const latency_ms = Date.now() - start;

  // 5. Opslaan, oude rijen opruimen
  const { error: schrijfFout } = await admin.from('outfit_sets').upsert(
    {
      profile_hash,
      stylist_version: STYLIST_VERSION,
      source: 'stylist',
      outfits,
      model,
      latency_ms,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    },
    { onConflict: 'profile_hash,stylist_version' }
  );
  if (schrijfFout) {
    console.error('[compose-outfits] opslaan mislukt:', schrijfFout.message);
  }

  const opruimGrens = new Date(Date.now() - OPRUIMEN_NA_DAGEN * DAG_MS).toISOString();
  const { error: opruimFout } = await admin.from('outfit_sets').delete().lt('created_at', opruimGrens);
  if (opruimFout) {
    console.error('[compose-outfits] opruimen mislukt:', opruimFout.message);
  }

  const uit: ComposeAntwoord = {
    fallback: false,
    source: 'stylist',
    stylist_version: STYLIST_VERSION,
    model,
    latency_ms,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    outfits,
  };
  return antwoord(req, uit);
});
```

- [ ] **Stap 2: typecheck met Deno, vóór de deploy**

```bash
npm run check:edge
```

Verwacht: `Check supabase/functions/_shared/cors.ts`, `... productClassifier.ts`, `... valideer-outfits.ts`, `... stylist-prompt.ts`, `... keten-types.ts`, `Check supabase/functions/compose-outfits/index.ts`, exitcode 0. Fouten hier zijn echte typefouten in de Deno-code; los ze op voordat je deployt. Dit is de eerste keer dat `Deno.serve`, `Deno.env` en de `npm:`-import gecontroleerd worden.

- [ ] **Stap 3: zet de secrets en deploy**

De Anthropic-sleutel staat in Lucs omgeving (`.env` in de repo-root onder `ANTHROPIC_API_KEY`, of vraag hem). Nooit in code of commits.

```bash
supabase secrets set ANTHROPIC_API_KEY="$(grep '^ANTHROPIC_API_KEY=' .env | cut -d= -f2-)" STYLIST_MODEL=claude-sonnet-5
supabase functions deploy compose-outfits
```

Verwacht: `Deployed Functions on project wojexzgjyhijuxzperhq: compose-outfits`.

- [ ] **Stap 4: rooktest zonder model**

CORS-preflight vanaf een toegestane origin:

```bash
curl -s -o /dev/null -w "%{http_code} %{header_json}\n" -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  "https://wojexzgjyhijuxzperhq.supabase.co/functions/v1/compose-outfits" | head -c 400
```

Verwacht: `204` en in de headers `access-control-allow-origin: http://localhost:5173`.

Foute body geeft een nette 400:

```bash
ANON="$(grep '^VITE_SUPABASE_ANON_KEY=' .env | cut -d= -f2-)"
curl -s -X POST -H "Authorization: Bearer $ANON" -H "apikey: $ANON" -H "Content-Type: application/json" \
  -d '{}' "https://wojexzgjyhijuxzperhq.supabase.co/functions/v1/compose-outfits"
```

Verwacht: `{"error":"Verwacht { profile_hash, profile, kandidaten }"}`.

De echte aanroep met kandidaten uit de database volgt in taak 8 (persona-harnas); daar zie je ook de eerste rij in `outfit_sets` verschijnen met `input_tokens` en `output_tokens`.

- [ ] **Stap 5: poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add supabase/functions/compose-outfits/index.ts
git commit -m "feat(keten): edge function compose-outfits met cache, stylist-model en herkansing

Cache-hit alleen binnen 14 dagen en met alle producten op voorraad; een
aanroep hooguit 45 s, herkansing alleen binnen het tijdsbudget; tokens
uit het API-antwoord gaan mee naar outfit_sets. Bij storing of te weinig
geldige outfits geeft de functie fallback: true terug; de client draait
dan engine v2 met seed = fnv1a32(profile_hash).

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Vanaf hier is `npm run check:edge` de poort in plaats van `npm run check:shared` (hij controleert `_shared` mee).

---

### Taak 7: client `composeClient` en profiel uit quiz-antwoorden

**Bestanden:**
- Aanmaken: `src/keten/composeClient.ts`
- Aanmaken: `src/keten/vanQuiz.ts`
- Aanmaken: `src/keten/browserConfig.ts`
- Aanmaken: `src/keten/vlag.ts`
- Test: `src/keten/__tests__/composeClient.test.ts`

**Interfaces:**
- Gebruikt: `runEngineV2(answers: Record<string, any>, products: Product[], options: EngineOptions): EngineResult` uit `src/engine/v2/engine.ts` met `EngineOptions.seed?: number`; `Product` en `Outfit` uit `src/engine/types.ts`; `profileHash` (taak 2); `fnv1a32(input: string): number` uit `src/utils/hash.ts` (taak 2); `outfitKey(productIds: string[]): Promise<string>` uit `src/services/ratings/outfitRatings.ts` (plan 1); RPC `get_kandidaten` (plan 1/2, spec 5.3); edge function (taak 6).
- Levert:
  ```typescript
  interface KetenConfig { supabase: SupabaseClient; functionsUrl: string; anonKey: string }
  interface ComposeResultaat { profile_hash: string; bron: OutfitBron; model: string | null; latency_ms: number | null; input_tokens: number | null; output_tokens: number | null; reden: string | null; kandidaten: Kandidaat[]; outfits: VerrijkteOutfit[]; engineOutfits: Outfit[] }
  const CLIENT_TIMEOUT_MS = 120_000
  function answersVanProfiel(p: TasteProfileInput): Record<string, unknown>
  function productVanKandidaat(k: Kandidaat): Product
  function outfitVanVerrijkt(o: VerrijkteOutfit, bron: OutfitBron): Outfit
  function haalKandidaten(cfg: KetenConfig, p: TasteProfileInput): Promise<Kandidaat[]>
  function roepComposeAan(cfg: KetenConfig, verzoek: ComposeVerzoek): Promise<ComposeAntwoord>
  function fallbackV2(p: TasteProfileInput, kandidaten: Kandidaat[], hash: string): Promise<VerrijkteOutfit[]>
  function composeVoorProfiel(cfg: KetenConfig, p: TasteProfileInput): Promise<ComposeResultaat>
  function profielVanQuizAnswers(answers: Record<string, any>, sessionId: string): TasteProfileInput | null
  function browserKetenConfig(): KetenConfig | null
  const KETEN_STYLIST_VLAG = 'ff_keten_stylist'
  function ketenStylistVlagAan(): boolean
  ```

- [ ] **Stap 1: schrijf de falende test**

Maak `src/keten/__tests__/composeClient.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { answersVanProfiel, outfitVanVerrijkt, productVanKandidaat } from '../composeClient';
import { profielVanQuizAnswers } from '../vanQuiz';
import { legeAssen, type Kandidaat, type TasteProfileInput, type VerrijkteOutfit } from '../types';

const kandidaat: Kandidaat = {
  product_id: 'p1',
  category: 'top',
  score: 0.8,
  attrs: {
    is_fashion: true,
    category: 'top',
    gender: 'female',
    formality: 3,
    occasions: ['work'],
    silhouette: 'regular',
    color_temp: 'warm',
    lightness: 'licht',
    pattern: 'effen',
    shoe_type: null,
    colors: ['beige'],
    materials: ['linnen'],
    seasons: ['zomer'],
    price_band: '50tot100',
    confidence: 0.8,
    tagger_version: 'haiku-4.5-v1',
  },
  product: {
    id: 'p1',
    name: 'Linnen blouse',
    brand: 'Merk B',
    price: 59,
    image_url: 'https://example.test/b.jpg',
    retailer: 'H&M',
    url: 'https://example.test/u',
    affiliate_url: 'https://example.test/aff',
    product_url: null,
    gender: 'female',
    colors: ['beige'],
    sizes: ['S', 'M'],
    in_stock: true,
    description: 'Luchtige blouse',
  },
};

const profiel: TasteProfileInput = {
  user_id: null,
  session_id: 's',
  gender: 'female',
  occasions: ['work', 'date'],
  budget_min: 25,
  budget_max: 100,
  nogo_product_ids: [],
  choices: [],
  axes: {
    ...legeAssen(),
    silhouette: { value: 'relaxed', confidence: 1 },
    pattern: { value: 'statement', confidence: 0.4 },
    color_temp: { value: 'warm', confidence: 0.5 },
    lightness: { value: 'licht', confidence: 0.75 },
  },
  liked_product_ids: [],
  disliked_product_ids: [],
};

describe('answersVanProfiel', () => {
  it('geeft feiten door en alleen assen met zekerheid van minstens 0.5', () => {
    expect(answersVanProfiel(profiel)).toEqual({
      gender: 'female',
      occasions: ['work', 'date'],
      budget: { min: 25, max: 100 },
      fit: 'relaxed',
      neutrals: 'warm',
      lightness: 'licht',
    });
  });
});

describe('productVanKandidaat', () => {
  it('zet een kandidaat om naar het Product van de engine', () => {
    const p = productVanKandidaat(kandidaat);
    expect(p.id).toBe('p1');
    expect(p.name).toBe('Linnen blouse');
    expect(p.category).toBe('top');
    expect(p.price).toBe(59);
    expect(p.imageUrl).toBe('https://example.test/b.jpg');
    expect(p.affiliateUrl).toBe('https://example.test/aff');
    expect(p.productUrl).toBe('https://example.test/u');
    expect(p.colors).toEqual(['beige']);
    expect(p.inStock).toBe(true);
    expect(p.formality).toBe(3);
  });
});

describe('outfitVanVerrijkt', () => {
  it('bouwt een engine-Outfit zonder verzonnen matchscore', () => {
    const v: VerrijkteOutfit = {
      outfit_key: 'sleutel',
      title: 'Lichte werkdag',
      occasion: 'work',
      items: [{ product_id: 'p1', role: 'top', product: kandidaat.product, attrs: kandidaat.attrs }],
      reason: 'De linnen blouse houdt het luchtig. Je draagt hem los over de broek.',
    };
    const o = outfitVanVerrijkt(v, 'stylist');
    expect(o.id).toBe('sleutel');
    expect(o.title).toBe('Lichte werkdag');
    expect(o.explanation).toBe(v.reason);
    expect(o.occasion).toBe('work');
    expect(o.products.map((p) => p.id)).toEqual(['p1']);
    expect(o.structure).toEqual(['top']);
    expect(o.tags).toContain('stylist');
    expect(o.matchScore).toBeUndefined();
  });
});

describe('profielVanQuizAnswers', () => {
  it('bouwt een profiel uit de bestaande quiz-antwoorden', () => {
    const p = profielVanQuizAnswers(
      {
        gender: 'female',
        occasions: ['work', 'date', 'travel', 'party'],
        budget: { min: 30, max: 120 },
        fit: 'slim',
        prints: 'effen',
        neutrals: 'koel',
      },
      'sessie-x'
    );
    expect(p).not.toBeNull();
    expect(p!.gender).toBe('female');
    expect(p!.occasions).toEqual(['work', 'date', 'travel']);
    expect(p!.budget_min).toBe(30);
    expect(p!.budget_max).toBe(120);
    expect(p!.session_id).toBe('sessie-x');
    expect(p!.axes.silhouette).toEqual({ value: 'slim', confidence: 1 });
    expect(p!.axes.pattern).toEqual({ value: 'effen', confidence: 1 });
    expect(p!.axes.color_temp).toEqual({ value: 'koel', confidence: 1 });
    expect(p!.axes.formality.confidence).toBe(0);
    expect(p!.choices).toEqual([]);
  });

  it('valt terug op unisex, casual en 150 euro en kent de slider', () => {
    const p = profielVanQuizAnswers({ gender: 'non-binary', budgetRange: 80 }, 's');
    expect(p!.gender).toBe('unisex');
    expect(p!.occasions).toEqual(['casual']);
    expect(p!.budget_min).toBe(0);
    expect(p!.budget_max).toBe(80);
    expect(profielVanQuizAnswers({}, 's')!.budget_max).toBe(150);
  });

  it('geeft null zonder antwoorden', () => {
    expect(profielVanQuizAnswers(null as any, 's')).toBeNull();
  });
});
```

- [ ] **Stap 2: draai de test en zie hem falen**

```bash
npx vitest run src/keten/__tests__/composeClient.test.ts
```

Verwacht: `Failed to resolve import "../composeClient"`.

- [ ] **Stap 3: schrijf `composeClient.ts`**

Maak `src/keten/composeClient.ts`:

```typescript
/**
 * Client-kant van de stylist-route (spec 4 en 5.4).
 *
 * Volgorde: profiel hashen, get_kandidaten, compose-outfits. Alleen als de
 * edge function { fallback: true } teruggeeft (API-storing of te weinig
 * geldige outfits) draait hier engine v2 op dezelfde kandidaten met
 * seed = hash(profile_hash), zodat ook het noodpad herhaalbaar is.
 *
 * Dit bestand kent geen import.meta.env en geen window: de browser geeft
 * zijn KetenConfig via browserConfig.ts, het persona-harnas via process.env.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { runEngineV2 } from '@/engine/v2/engine';
import type { Outfit, Product } from '@/engine/types';
import { fnv1a32 } from '@/utils/hash';
import { outfitKey } from '@/services/ratings/outfitRatings';
import { profileHash } from './profileHash';
import type {
  AsNaam,
  ComposeAntwoord,
  ComposeVerzoek,
  Gelegenheid,
  Kandidaat,
  OutfitBron,
  TasteProfileInput,
  VerrijktItem,
  VerrijkteOutfit,
} from './types';

export interface KetenConfig {
  supabase: SupabaseClient;
  /** Bijvoorbeeld https://<ref>.supabase.co/functions/v1 */
  functionsUrl: string;
  anonKey: string;
}

export interface ComposeResultaat {
  profile_hash: string;
  bron: OutfitBron;
  model: string | null;
  latency_ms: number | null;
  /** Tokenverbruik van de edge function; null bij cache zonder die kolommen of bij het noodpad */
  input_tokens: number | null;
  output_tokens: number | null;
  /** Reden van het noodpad, anders null */
  reden: string | null;
  kandidaten: Kandidaat[];
  outfits: VerrijkteOutfit[];
  /** Dezelfde outfits in de vorm die de bestaande resultatenpagina rendert */
  engineOutfits: Outfit[];
}

const PER_CATEGORIE = 12;
const AANTAL = 6;
/** Wachttijd-budget (plan): langer dan dit wachten we niet op de edge function; dan noodpad. */
export const CLIENT_TIMEOUT_MS = 120_000;

/**
 * Vertaalt het profiel naar de answers die buildUserStyleProfile (engine v2)
 * leest: gender, occasions, budget, en alleen de assen met zekerheid >= 0.5
 * als fit, prints, neutrals en lightness.
 */
export function answersVanProfiel(p: TasteProfileInput): Record<string, unknown> {
  const zeker = (as: AsNaam): string | undefined => {
    const w = p.axes?.[as];
    if (!w || w.confidence < 0.5 || w.value === null || typeof w.value !== 'string') return undefined;
    return w.value;
  };
  const answers: Record<string, unknown> = {
    gender: p.gender,
    occasions: p.occasions,
    budget: { min: p.budget_min, max: p.budget_max },
  };
  const fit = zeker('silhouette');
  if (fit) answers.fit = fit;
  const prints = zeker('pattern');
  if (prints) answers.prints = prints;
  const neutrals = zeker('color_temp');
  if (neutrals) answers.neutrals = neutrals;
  const lightness = zeker('lightness');
  if (lightness) answers.lightness = lightness;
  return answers;
}

/** Zelfde velden als OutfitService.mapDatabaseProduct, plus de categorie uit product_attributes. */
export function productVanKandidaat(k: Kandidaat): Product {
  const p = k.product;
  return {
    id: p.id,
    name: p.name,
    brand: p.brand ?? undefined,
    price: p.price,
    imageUrl: p.image_url ?? undefined,
    category: k.category,
    gender: p.gender ?? undefined,
    colors: p.colors ?? [],
    color: (p.colors ?? [])[0],
    sizes: p.sizes ?? [],
    tags: [],
    styleTags: [],
    retailer: p.retailer ?? undefined,
    affiliateUrl: p.affiliate_url ?? p.url ?? undefined,
    productUrl: p.product_url ?? p.url ?? undefined,
    description: p.description ?? undefined,
    inStock: p.in_stock ?? true,
    formality: k.attrs?.formality ?? undefined,
    materials: k.attrs?.materials ?? [],
    colorTags: k.attrs?.colors ?? [],
  };
}

/** Naar de Outfit-vorm van de engine, zonder verzonnen matchscore. */
export function outfitVanVerrijkt(o: VerrijkteOutfit, bron: OutfitBron): Outfit {
  const products = o.items.map((i) =>
    productVanKandidaat({ product_id: i.product_id, category: i.role, score: 0, attrs: i.attrs, product: i.product })
  );
  return {
    id: o.outfit_key,
    title: o.title,
    description: o.reason,
    archetype: bron,
    occasion: o.occasion,
    products,
    tags: [o.occasion, bron],
    matchPercentage: 0,
    explanation: o.reason,
    structure: o.items.map((i) => i.role),
    completeness: 100,
  };
}

export async function haalKandidaten(cfg: KetenConfig, p: TasteProfileInput): Promise<Kandidaat[]> {
  const { data, error } = await cfg.supabase.rpc('get_kandidaten', {
    p_gender: p.gender,
    p_occasions: p.occasions,
    p_budget_min: p.budget_min,
    p_budget_max: p.budget_max,
    p_axes: p.axes,
    p_liked_ids: p.liked_product_ids,
    p_disliked_ids: [...p.disliked_product_ids, ...p.nogo_product_ids],
    p_per_category: PER_CATEGORIE,
  });
  if (error) throw new Error(`get_kandidaten: ${error.message}`);
  return (data ?? []) as Kandidaat[];
}

/**
 * Een niet-bereikbare, falende of te trage edge function is een API-storing
 * en telt als noodpad; daarom nooit throw, altijd een ComposeAntwoord.
 * AbortSignal.timeout bestaat in de browser en in Node 18+ (vite-node).
 */
export async function roepComposeAan(cfg: KetenConfig, verzoek: ComposeVerzoek): Promise<ComposeAntwoord> {
  try {
    const res = await fetch(`${cfg.functionsUrl}/compose-outfits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.anonKey}`,
        apikey: cfg.anonKey,
      },
      body: JSON.stringify(verzoek),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
    if (!res.ok) {
      const tekst = (await res.text()).slice(0, 200);
      return { fallback: true, reason: `compose-outfits ${res.status}: ${tekst}`, kandidaten: verzoek.kandidaten };
    }
    return (await res.json()) as ComposeAntwoord;
  } catch (err) {
    const naam = err instanceof Error ? err.name : '';
    if (naam === 'TimeoutError' || naam === 'AbortError') {
      return {
        fallback: true,
        reason: `compose-outfits antwoordde niet binnen ${CLIENT_TIMEOUT_MS / 1000} s`,
        kandidaten: verzoek.kandidaten,
      };
    }
    const reden = err instanceof Error ? err.message : String(err);
    return { fallback: true, reason: `compose-outfits onbereikbaar: ${reden}`, kandidaten: verzoek.kandidaten };
  }
}

/** Noodpad (spec 5.4 punt 4): engine v2 op dezelfde kandidaten met vaste seed. */
export async function fallbackV2(
  p: TasteProfileInput,
  kandidaten: Kandidaat[],
  hash: string
): Promise<VerrijkteOutfit[]> {
  const perId = new Map<string, Kandidaat>();
  for (const k of kandidaten) perId.set(k.product_id, k);

  // seed = fnv1a32(profile_hash): FNV-1a uit src/utils/hash.ts (taak 2), hetzelfde
  // algoritme als hashString dat image.ts al gebruikte en als de seed uit plan 1.
  const result = runEngineV2(answersVanProfiel(p), kandidaten.map(productVanKandidaat), {
    count: AANTAL,
    seed: fnv1a32(hash),
  });

  const uit: VerrijkteOutfit[] = [];
  for (const o of result.outfits) {
    const items: VerrijktItem[] = [];
    for (const product of o.products) {
      const k = perId.get(product.id);
      if (!k) continue;
      items.push({ product_id: k.product_id, role: k.category, product: k.product, attrs: k.attrs });
    }
    if (items.length === 0) continue;
    uit.push({
      outfit_key: await outfitKey(items.map((i) => i.product_id)),
      title: o.title,
      occasion: o.occasion as Gelegenheid,
      items,
      reason: o.explanation,
    });
  }
  return uit;
}

export async function composeVoorProfiel(cfg: KetenConfig, p: TasteProfileInput): Promise<ComposeResultaat> {
  const hash = await profileHash(p);
  const kandidaten = await haalKandidaten(cfg, p);
  if (kandidaten.length === 0) {
    throw new Error('get_kandidaten gaf nul kandidaten voor dit profiel');
  }

  const antwoord = await roepComposeAan(cfg, { profile_hash: hash, profile: p, kandidaten });

  if (antwoord.fallback) {
    const basis = antwoord.kandidaten.length > 0 ? antwoord.kandidaten : kandidaten;
    const outfits = await fallbackV2(p, basis, hash);
    return {
      profile_hash: hash,
      bron: 'v2-fallback',
      model: null,
      latency_ms: null,
      input_tokens: null,
      output_tokens: null,
      reden: antwoord.reason,
      kandidaten,
      outfits,
      engineOutfits: outfits.map((o) => outfitVanVerrijkt(o, 'v2-fallback')),
    };
  }

  return {
    profile_hash: hash,
    bron: antwoord.source,
    model: antwoord.model,
    latency_ms: antwoord.latency_ms,
    input_tokens: antwoord.input_tokens,
    output_tokens: antwoord.output_tokens,
    reden: null,
    kandidaten,
    outfits: antwoord.outfits,
    engineOutfits: antwoord.outfits.map((o) => outfitVanVerrijkt(o, antwoord.source)),
  };
}
```

- [ ] **Stap 4: schrijf `vanQuiz.ts`, `browserConfig.ts` en `vlag.ts`**

Maak `src/keten/vanQuiz.ts`:

```typescript
/**
 * Bouwt een TasteProfileInput uit de bestaande quiz-antwoorden
 * (localStorage LS_KEYS.QUIZ_ANSWERS). Tijdelijk: zodra plan 4 de onboarding
 * v2 met dit-of-dat-paren heeft, komt het profiel uit taste_profiles.
 *
 * Expliciete quiz-antwoorden (fit, prints, neutrals) worden assen met
 * zekerheid 1: de bezoeker heeft ze zelf gekozen.
 */
import { GELEGENHEDEN, legeAssen, type Gelegenheid, type Geslacht, type TasteProfileInput } from './types';

const MAX_GELEGENHEDEN = 3;
const STANDAARD_BUDGET_MAX = 150;

function isGelegenheid(x: string): x is Gelegenheid {
  return (GELEGENHEDEN as readonly string[]).includes(x);
}

function tekst(x: unknown): string | null {
  return typeof x === 'string' && x.trim() ? x.trim().toLowerCase() : null;
}

export function profielVanQuizAnswers(
  answers: Record<string, any> | null | undefined,
  sessionId: string
): TasteProfileInput | null {
  if (!answers || typeof answers !== 'object') return null;

  const g = tekst(answers.gender);
  const gender: Geslacht = g === 'male' || g === 'female' ? g : 'unisex';

  const occasions = (Array.isArray(answers.occasions) ? answers.occasions : [])
    .map((o: unknown) => String(o).toLowerCase().trim())
    .filter(isGelegenheid)
    .slice(0, MAX_GELEGENHEDEN);
  if (occasions.length === 0) occasions.push('casual');

  let budget_min = 0;
  let budget_max = STANDAARD_BUDGET_MAX;
  const b = answers.budget;
  if (b && typeof b === 'object' && typeof b.max === 'number' && b.max > 0) {
    budget_max = b.max;
    budget_min = typeof b.min === 'number' ? Math.max(0, Math.min(b.min, b.max)) : 0;
  } else if (typeof answers.budgetRange === 'number' && answers.budgetRange > 0) {
    budget_max = answers.budgetRange;
  }

  const axes = legeAssen();
  const fit = tekst(answers.fit);
  if (fit === 'slim' || fit === 'regular' || fit === 'relaxed' || fit === 'oversized') {
    axes.silhouette = { value: fit, confidence: 1 };
  }
  const prints = tekst(answers.prints);
  if (prints === 'effen' || prints === 'subtiel' || prints === 'statement') {
    axes.pattern = { value: prints, confidence: 1 };
  }
  const neutrals = tekst(Array.isArray(answers.neutrals) ? answers.neutrals[0] : answers.neutrals);
  if (neutrals === 'warm' || neutrals === 'koel' || neutrals === 'neutraal') {
    axes.color_temp = { value: neutrals, confidence: 1 };
  }

  return {
    user_id: null,
    session_id: sessionId,
    gender,
    occasions,
    budget_min,
    budget_max,
    nogo_product_ids: [],
    choices: [],
    axes,
    liked_product_ids: [],
    disliked_product_ids: [],
  };
}
```

Maak `src/keten/browserConfig.ts`:

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { KetenConfig } from './composeClient';

/** KetenConfig voor de browser; null als Supabase uit staat of de env ontbreekt. */
export function browserKetenConfig(): KetenConfig | null {
  const client = supabase();
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!client || !url || !anonKey) return null;
  return { supabase: client, functionsUrl: `${url}/functions/v1`, anonKey };
}
```

Maak `src/keten/vlag.ts`:

```typescript
/**
 * Lokale vlag voor intern testen van de stylist-route op de bestaande
 * resultatenpagina. Zet in de browserconsole:
 *   localStorage.setItem('ff_keten_stylist', '1')
 * en herlaad /results. Verwijderen met localStorage.removeItem('ff_keten_stylist').
 * Dit is geen productievlag; die komt in plan 4 als keten_v2 in remote_flags.
 */
export const KETEN_STYLIST_VLAG = 'ff_keten_stylist';

export function ketenStylistVlagAan(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(KETEN_STYLIST_VLAG) === '1';
  } catch {
    return false;
  }
}
```

- [ ] **Stap 5: draai de test en zie hem slagen**

```bash
npx vitest run src/keten/__tests__/composeClient.test.ts
```

Verwacht: 6 tests geslaagd.

- [ ] **Stap 6: poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add src/keten/composeClient.ts src/keten/vanQuiz.ts src/keten/browserConfig.ts src/keten/vlag.ts src/keten/__tests__/composeClient.test.ts
git commit -m "feat(keten): composeClient met get_kandidaten, compose-outfits en noodpad met seed

Client-timeout van 120 s op de edge function; daarna engine v2 op de
kandidaten die al binnen zijn.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 8: persona-harnas op de stylist-route

**Bestanden:**
- Aanmaken: `scripts/keten/stylist-controles.ts`
- Aanmaken: `scripts/keten/stylist-run.ts`
- Wijzigen: `scripts/keten/persona-run.ts` (bestand uit plan 1; regelnummers zijn daarom niet bekend, de ankers staan in stap 5)
- Test: `scripts/keten/__tests__/stylist-controles.test.ts`

**Interfaces:**
- Gebruikt: `composeVoorProfiel`, `KetenConfig`, `ComposeResultaat` (taak 7); `isCompleet` (taak 4); types (taak 2); `KETEN_PERSONAS`, type `KetenPersona` uit `src/keten/personas.ts` (plan 1 taak 11: canonieke persona-data, naam, gender, gelegenheden, budget, stijlvoorkeuren); `.env` in de repo-root met `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY`.
- Levert:
  ```typescript
  function controleerOutfitSet(outfits: VerrijkteOutfit[], budget: { min: number; max: number }): string[]
  function zelfdeOutfits(a: VerrijkteOutfit[], b: VerrijkteOutfit[]): boolean
  interface Persona { naam: string; profiel: TasteProfileInput }
  const PERSONAS: Persona[]
  function runStylistKeten(opties?: { alleen?: string }): Promise<boolean>
  ```

Controles (spec 5.7) die falen als: minder dan zes outfits; een outfit niet compleet; een item buiten budget; footwear met `shoe_type = sandaal` of accessory met "zwem" in de naam bij gelegenheid work; twee outfits met dezelfde itemset; twee runs achter elkaar geven verschillende outfits. Extra in dit plan: een run via het noodpad is rood, want deze poort bewaakt de stylist-route; en naast de vier persona's uit spec 5.7 draait een vijfde profiel mee met een halve, onzekere assen-set (zie keuze 3 bovenaan).

Plan 1 taak 11 legt de canonieke persona-data aan in `src/keten/personas.ts`, zodat dit plan en plan 1 niet allebei hun eigen versie van de vier persona's onderhouden. Ter referentie de inhoud van dat bestand (niet opnieuw aanmaken hier, alleen importeren in stap 5):

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

- [ ] **Stap 1: schrijf de falende test**

Maak `scripts/keten/__tests__/stylist-controles.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { controleerOutfitSet, zelfdeOutfits } from '../stylist-controles';
import type { Categorie, Gelegenheid, ProductAttrs, RuwProduct, VerrijkteOutfit } from '../../../src/keten/types';

function attrs(category: Categorie, shoe_type: string | null = null): ProductAttrs {
  return {
    is_fashion: true,
    category,
    gender: 'unisex',
    formality: 3,
    occasions: ['work'],
    silhouette: 'regular',
    color_temp: 'neutraal',
    lightness: 'medium',
    pattern: 'effen',
    shoe_type,
    colors: [],
    materials: [],
    seasons: [],
    price_band: '50tot100',
    confidence: 0.9,
    tagger_version: 't',
  };
}

function product(id: string, price: number, name = `Product ${id}`): RuwProduct {
  return {
    id, name, brand: null, price, image_url: null, retailer: null, url: null, affiliate_url: null,
    product_url: null, gender: null, colors: null, sizes: null, in_stock: true, description: null,
  };
}

function outfit(
  key: string,
  occasion: Gelegenheid,
  items: Array<[string, Categorie, number, string?, string?]>
): VerrijkteOutfit {
  return {
    outfit_key: key,
    title: key,
    occasion,
    reason: 'Reden.',
    items: items.map(([id, role, price, name, shoe]) => ({
      product_id: id,
      role,
      product: product(id, price, name),
      attrs: attrs(role, shoe ?? null),
    })),
  };
}

const budget = { min: 25, max: 100 };

function zesGoede(): VerrijkteOutfit[] {
  return Array.from({ length: 6 }, (_, i) =>
    outfit(`k${i}`, 'casual', [[`t${i}`, 'top', 50], [`b${i}`, 'bottom', 60], [`f${i}`, 'footwear', 70]])
  );
}

describe('controleerOutfitSet (spec 5.7)', () => {
  it('is leeg bij zes goede outfits', () => {
    expect(controleerOutfitSet(zesGoede(), budget)).toEqual([]);
  });

  it('faalt bij minder dan zes', () => {
    expect(controleerOutfitSet(zesGoede().slice(0, 5), budget)).toContain('5 outfits, verwacht 6');
  });

  it('faalt bij een onvolledige outfit', () => {
    const set = zesGoede();
    set[1] = outfit('k1', 'casual', [['t1', 'top', 50], ['b1', 'bottom', 60]]);
    expect(controleerOutfitSet(set, budget).join('\n')).toContain('outfit 2 (k1) niet compleet');
  });

  it('faalt bij een item buiten budget', () => {
    const set = zesGoede();
    set[2].items[0].product.price = 400;
    expect(controleerOutfitSet(set, budget).join('\n')).toContain('outfit 3 (k2): t2 kost 400');
  });

  it('faalt bij sandalen of zwemkleding bij work', () => {
    const set = zesGoede();
    set[0] = outfit('k0', 'work', [['t0', 'top', 50], ['b0', 'bottom', 60], ['f0', 'footwear', 70, 'Sandaal', 'sandaal']]);
    set[1] = outfit('k1', 'work', [['t1', 'top', 50], ['b1', 'bottom', 60], ['f1', 'footwear', 70], ['a1', 'accessory', 30, 'Zwemtas']]);
    const fouten = controleerOutfitSet(set, budget).join('\n');
    expect(fouten).toContain('outfit 1 (k0): sandaal bij work');
    expect(fouten).toContain('outfit 2 (k1): zwem-item bij work');
  });

  it('faalt bij twee outfits met dezelfde itemset', () => {
    const set = zesGoede();
    set[5] = outfit('anders', 'casual', [['f0', 'footwear', 70], ['t0', 'top', 50], ['b0', 'bottom', 60]]);
    expect(controleerOutfitSet(set, budget).join('\n')).toContain('outfit 6 (anders) heeft dezelfde items als outfit 1');
  });
});

describe('zelfdeOutfits', () => {
  it('vergelijkt de outfit_keys in volgorde', () => {
    expect(zelfdeOutfits(zesGoede(), zesGoede())).toBe(true);
    const b = zesGoede();
    b[3].outfit_key = 'x';
    expect(zelfdeOutfits(zesGoede(), b)).toBe(false);
    expect(zelfdeOutfits(zesGoede(), zesGoede().slice(0, 5))).toBe(false);
  });
});
```

- [ ] **Stap 2: draai de test en zie hem falen**

```bash
npx vitest run scripts/keten/__tests__/stylist-controles.test.ts
```

Verwacht: `Failed to resolve import "../stylist-controles"`.

- [ ] **Stap 3: schrijf de controles**

Maak `scripts/keten/stylist-controles.ts`:

```typescript
/**
 * Controles uit spec 5.7 op een outfit-set, als pure functies zodat vitest
 * ze test en stylist-run.ts ze tegen de live database gebruikt.
 */
import { isCompleet } from '../../supabase/functions/_shared/valideer-outfits';
import type { VerrijkteOutfit } from '../../src/keten/types';

const VERWACHT = 6;

export function controleerOutfitSet(
  outfits: VerrijkteOutfit[],
  budget: { min: number; max: number }
): string[] {
  const fouten: string[] = [];
  if (outfits.length < VERWACHT) {
    fouten.push(`${outfits.length} outfits, verwacht ${VERWACHT}`);
  }

  const gezien = new Map<string, number>();
  outfits.forEach((o, i) => {
    const label = `outfit ${i + 1} (${o.title})`;
    const rollen = o.items.map((it) => it.role);
    if (!isCompleet(rollen)) {
      fouten.push(`${label} niet compleet: rollen ${rollen.join('+') || 'geen'}`);
    }
    for (const it of o.items) {
      const prijs = it.product.price;
      if (typeof prijs !== 'number' || prijs < budget.min || prijs > budget.max) {
        fouten.push(`${label}: ${it.product_id} kost ${prijs}, budget ${budget.min} tot ${budget.max}`);
      }
      if (o.occasion === 'work') {
        if (it.role === 'footwear' && it.attrs.shoe_type === 'sandaal') {
          fouten.push(`${label}: sandaal bij work (${it.product.name})`);
        }
        if (it.role === 'accessory' && /zwem/i.test(it.product.name)) {
          fouten.push(`${label}: zwem-item bij work (${it.product.name})`);
        }
      }
    }
    const itemset = o.items.map((it) => it.product_id).sort().join('|');
    const eerder = gezien.get(itemset);
    if (eerder !== undefined) {
      fouten.push(`${label} heeft dezelfde items als outfit ${eerder + 1}`);
    } else {
      gezien.set(itemset, i);
    }
  });

  return fouten;
}

/** Twee runs zijn gelijk als de outfit_keys in dezelfde volgorde gelijk zijn. */
export function zelfdeOutfits(a: VerrijkteOutfit[], b: VerrijkteOutfit[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((o, i) => o.outfit_key === b[i].outfit_key);
}
```

- [ ] **Stap 4: draai de test en zie hem slagen**

```bash
npx vitest run scripts/keten/__tests__/stylist-controles.test.ts
```

Verwacht: 7 tests geslaagd.

- [ ] **Stap 5: schrijf de runner en haak hem in persona-run.ts**

Maak `scripts/keten/stylist-run.ts`:

```typescript
/**
 * Persona-harnas op de stylist-route (spec 5.7, plan 3).
 *
 * Draait voor vier vaste persona's plus een halve-set-profiel de hele keten
 * tegen de live database:
 * profiel, get_kandidaten, compose-outfits (of noodpad), en past de controles
 * uit spec 5.7 toe plus de cache-controle: twee runs achter elkaar moeten
 * dezelfde outfits geven.
 *
 * Gebruik:
 *   npx vite-node scripts/keten/stylist-run.ts
 *   npx vite-node scripts/keten/stylist-run.ts --alleen="man klassiek"
 *   npx vite-node scripts/keten/persona-run.ts --keten=stylist
 *
 * Credentials: VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY uit de omgeving of
 * uit .env in de repo-root. Waarden worden nooit gelogd.
 *
 * Tot plan 4 dragen de persona's hun assen direct (waarde plus zekerheid);
 * de keuzes uit dit-of-dat-paren komen daar pas.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { composeVoorProfiel, type ComposeResultaat, type KetenConfig } from '../../src/keten/composeClient';
import { KETEN_PERSONAS, type KetenPersona } from '../../src/keten/personas';
import { legeAssen, type Assen, type TasteProfileInput } from '../../src/keten/types';
import { controleerOutfitSet, zelfdeOutfits } from './stylist-controles';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function laadDotEnv(): Record<string, string> {
  const pad = join(root, '.env');
  if (!existsSync(pad)) return {};
  const uit: Record<string, string> = {};
  for (const regel of readFileSync(pad, 'utf8').split('\n')) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) uit[m[1]] = m[2];
  }
  return uit;
}

export function scriptKetenConfig(): KetenConfig {
  const dotenv = laadDotEnv();
  const env = (k: string) => process.env[k] ?? dotenv[k];
  const url = env('VITE_SUPABASE_URL') ?? env('SUPABASE_URL');
  const anonKey = env('VITE_SUPABASE_ANON_KEY') ?? env('SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    throw new Error(
      'Geen Supabase-credentials. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in je omgeving of in .env.'
    );
  }
  return {
    supabase: createClient(url, anonKey, { auth: { persistSession: false } }),
    functionsUrl: `${url}/functions/v1`,
    anonKey,
  };
}

export interface Persona {
  naam: string;
  profiel: TasteProfileInput;
}

function persona(
  naam: string,
  profiel: Omit<TasteProfileInput, 'user_id' | 'session_id' | 'nogo_product_ids' | 'choices' | 'liked_product_ids' | 'disliked_product_ids'>
): Persona {
  return {
    naam,
    profiel: {
      user_id: null,
      session_id: `persona-${naam.replace(/\s+/g, '-')}`,
      nogo_product_ids: [],
      choices: [],
      liked_product_ids: [],
      disliked_product_ids: [],
      ...profiel,
    },
  };
}

/**
 * Assen per stijlvoorkeur (spec 5.7): vertaalt de neutrale stijlvoorkeuren uit
 * de canonieke persona-data (src/keten/personas.ts, plan 1 taak 11) naar de
 * assen met zekerheid die de stylist-route verwacht. Alleen hier van belang;
 * plan 1 leidt uit dezelfde data zijn eigen quiz-antwoorden af.
 */
const ASSEN_PER_STYLE: Record<string, Partial<Assen>> = {
  classic: {
    formality: { value: 4, confidence: 1 },
    silhouette: { value: 'slim', confidence: 1 },
    color_temp: { value: 'koel', confidence: 0.5 },
    lightness: { value: 'donker', confidence: 0.5 },
    pattern: { value: 'effen', confidence: 1 },
    shoe_type: { value: 'net', confidence: 1 },
  },
  minimalist: {
    formality: { value: 3, confidence: 1 },
    silhouette: { value: 'regular', confidence: 1 },
    color_temp: { value: 'neutraal', confidence: 1 },
    lightness: { value: 'licht', confidence: 0.5 },
    pattern: { value: 'effen', confidence: 1 },
    shoe_type: { value: 'net', confidence: 0.5 },
  },
  streetwear: {
    formality: { value: 2, confidence: 1 },
    silhouette: { value: 'oversized', confidence: 1 },
    color_temp: { value: 'neutraal', confidence: 0.5 },
    lightness: { value: 'donker', confidence: 1 },
    pattern: { value: 'statement', confidence: 0.5 },
    shoe_type: { value: 'sneaker', confidence: 1 },
  },
  romantic: {
    formality: { value: 3, confidence: 0.5 },
    silhouette: { value: 'relaxed', confidence: 1 },
    color_temp: { value: 'warm', confidence: 1 },
    lightness: { value: 'licht', confidence: 1 },
    pattern: { value: 'subtiel', confidence: 1 },
    shoe_type: { value: 'sandaal', confidence: 0.5 },
  },
};

function personaVanKanoniek(p: KetenPersona): Persona {
  return persona(p.naam, {
    gender: p.gender,
    occasions: p.occasions,
    budget_min: p.budget_min,
    budget_max: p.budget_max,
    axes: { ...legeAssen(), ...ASSEN_PER_STYLE[p.stylePreferences[0]] },
  });
}

/** De vier persona's uit spec 5.7 (canonieke data uit src/keten/personas.ts), plus een vijfde profiel met een halve, onzekere assen-set. */
export const PERSONAS: Persona[] = [
  ...KETEN_PERSONAS.map(personaVanKanoniek),
  // Geen spec-persona. Bootst na wat een echte bezoeker na 6 tot 12 paren
  // aflevert: drie assen onbekend, de rest met lage zekerheid. Bewijst dat de
  // stylist ook met dunne invoer zes geldige outfits levert (plan 3, keuze 3).
  persona('vrouw minimalistisch halve set', {
    gender: 'female',
    occasions: ['work', 'date'],
    budget_min: 25,
    budget_max: 100,
    axes: {
      ...legeAssen(),
      formality: { value: 3, confidence: 0.33 },
      color_temp: { value: 'neutraal', confidence: 0.5 },
      pattern: { value: 'effen', confidence: 0.33 },
    },
  }),
];

function printResultaat(r: ComposeResultaat): void {
  console.log(
    `bron ${r.bron}` +
      (r.model ? `, model ${r.model}` : '') +
      (r.latency_ms !== null ? `, ${r.latency_ms} ms` : '') +
      (r.reden ? `, reden: ${r.reden}` : '') +
      `, ${r.kandidaten.length} kandidaten` +
      (r.input_tokens !== null ? `, ${r.input_tokens} tokens in, ${r.output_tokens ?? 0} uit` : '')
  );
  r.outfits.forEach((o, i) => {
    console.log(`  ${i + 1}. [${o.occasion}] ${o.title}`);
    for (const it of o.items) {
      console.log(`     - ${it.role.padEnd(9)} ${it.product.brand ?? ''} ${it.product.name} (${it.product.price} euro)`);
    }
    console.log(`     ${o.reason}`);
  });
}

export async function runStylistKeten(opties: { alleen?: string } = {}): Promise<boolean> {
  const cfg = scriptKetenConfig();
  let alleGroen = true;

  for (const p of PERSONAS) {
    if (opties.alleen && !p.naam.includes(opties.alleen)) continue;
    console.log(`\n=== ${p.naam} (${p.profiel.gender}, ${p.profiel.occasions.join('+')}, ${p.profiel.budget_min} tot ${p.profiel.budget_max}) ===`);

    let fouten: string[] = [];
    try {
      const run1 = await composeVoorProfiel(cfg, p.profiel);
      printResultaat(run1);
      const run2 = await composeVoorProfiel(cfg, p.profiel);

      fouten = controleerOutfitSet(run1.outfits, { min: p.profiel.budget_min, max: p.profiel.budget_max });
      if (!zelfdeOutfits(run1.outfits, run2.outfits)) {
        fouten.push(`twee runs geven verschillende outfits (run 2 bron ${run2.bron})`);
      }
      if (run1.bron === 'v2-fallback') {
        fouten.push(`noodpad gebruikt: ${run1.reden}`);
      }
    } catch (err) {
      fouten = [`keten brak: ${err instanceof Error ? err.message : String(err)}`];
    }

    if (fouten.length === 0) {
      console.log('GROEN');
    } else {
      alleGroen = false;
      console.log('ROOD');
      for (const f of fouten) console.log(`  - ${f}`);
    }
  }

  console.log(`\n${alleGroen ? 'ALLE PERSONAS GROEN' : 'ER ZIJN RODE PERSONAS'}`);
  return alleGroen;
}

function argument(naam: string): string | undefined {
  const prefix = `--${naam}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length).replace(/^"|"$/g, '') : undefined;
}

// Direct gestart (niet via persona-run.ts)? Dan zelf draaien.
if (process.argv.some((a) => a.endsWith('stylist-run.ts'))) {
  runStylistKeten({ alleen: argument('alleen') }).then((groen) => process.exit(groen ? 0 : 1));
}
```

Wijzig `scripts/keten/persona-run.ts` (uit plan 1). Voeg bij de imports toe:

```typescript
import { runStylistKeten } from './stylist-run';
```

En zet als eerste uitvoerbare statement na de imports (of, als het bestand een `main()`-functie heeft, als eerste statement in `main()`):

```typescript
// Plan 3: dezelfde persona's over de stylist-route (get_kandidaten,
// compose-outfits, noodpad) met de controles uit spec 5.7 plus de cache-controle.
if (process.argv.includes('--keten=stylist')) {
  const groen = await runStylistKeten();
  process.exit(groen ? 0 : 1);
}
```

- [ ] **Stap 6: draai het harnas tegen de live database**

```bash
npx vite-node scripts/keten/stylist-run.ts --alleen="man klassiek"
```

Verwacht bij de eerste run: `bron stylist, model claude-sonnet-5, <n> ms, <k> kandidaten, <i> tokens in, <o> uit`, zes outfits met titel, items en reden, daarna `GROEN`. Ligt `<n>` boven 30000 of `<i>` ver boven 6500, zie de secties "Wachttijd-budget" en "Kosten" bovenaan. Is de uitkomst `ROOD` met `noodpad gebruikt: ...`, lees dan de reden: `ANTHROPIC_API_KEY ontbreekt` betekent dat de secret uit taak 6 (stap 3) niet staat; `Anthropic 401` een verkeerde sleutel; `na twee pogingen N geldige outfits` dat de kandidatenlijst te dun is voor dit profiel (controleer met de dekkingsmatrix uit plan 2).

Controleer de cache in de database:

```bash
supabase db query --linked "select left(profile_hash, 8) as hash, stylist_version, source, model, latency_ms, input_tokens, output_tokens, jsonb_array_length(outfits) as n from public.outfit_sets order by created_at desc limit 5" -o table
```

Verwacht: minstens een rij met `source = stylist`, `stylist_version = stylist-v1`, `n = 6`, en `input_tokens` en `output_tokens` gevuld (ordegrootte 6.500 en 1.000).

Draai daarna alle vijf via de persona-run-modus:

```bash
npx vite-node scripts/keten/persona-run.ts --keten=stylist
```

Verwacht: vijf blokken, elk `GROEN`, afgesloten met `ALLE PERSONAS GROEN`, exitcode 0. Bij de tweede run van elk persona is de bron `cache` en zijn de outfits gelijk aan de eerste run.

Kosten van deze run, uit de tabel (tarief Sonnet 5: 2 dollar per miljoen in, 10 dollar per miljoen uit):

```bash
supabase db query --linked "select date_trunc('week', created_at)::date as week, count(*) as sets, sum(input_tokens) as tokens_in, sum(output_tokens) as tokens_uit, round((sum(input_tokens) * 2.0 + sum(output_tokens) * 10.0) / 1000000, 3) as dollar from public.outfit_sets group by 1 order by 1 desc" -o table
```

Verwacht: een rij voor deze week met `sets = 5` (of meer als je vaker hebt gedraaid) en `dollar` in de orde van 0,10 tot 0,20. Wijkt dat meer dan een factor twee af van de schatting in de sectie "Kosten", pas die sectie aan met de gemeten cijfers voordat je verder gaat; de schatting is de bewaking, de tabel de waarheid.

- [ ] **Stap 7: poorten en commit**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
node scripts/check-design-compliance.mjs | grep "Total Violations"
git add scripts/keten/stylist-controles.ts scripts/keten/stylist-run.ts scripts/keten/persona-run.ts scripts/keten/__tests__/stylist-controles.test.ts
git commit -m "feat(keten): persona-harnas op de stylist-route met cache-controle

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Taak 9: resultatenpagina achter de lokale vlag

**Bestanden:**
- Wijzigen: `src/hooks/useOutfits.ts` (regels 1-5 imports, 42-49 `UseOutfitsResult`, 78-84 queryKey, 107-116 de `if (answers)`-tak in queryFn, 134-139 de legacy-return, 154-165 de eindreturn)
- Wijzigen: `src/pages/EnhancedResultsPage.tsx` (regel 390 destructuring van `useOutfits`; regel 1396 de div `shrink-0 flex items-center gap-3`, waarvan regel 1397 het commentaar is dat begint met `{/* Swipe/Grid toggle`)

**Interfaces:**
- Gebruikt: `ketenStylistVlagAan`, `browserKetenConfig`, `profielVanQuizAnswers`, `composeVoorProfiel` (taak 7); `getSessionId()` uit `src/utils/sessionId.ts`; `OutfitBron` (taak 2).
- Levert: `useOutfits` geeft extra `ketenBron: OutfitBron | null` terug; met de vlag aan komen de outfits uit de stylist-route en toont de pagina een badge "Stylist-route: stylist | cache | v2-fallback".

- [ ] **Stap 1: pas `useOutfits.ts` aan**

Voeg bij de imports (na regel 5) toe:

```typescript
import { composeVoorProfiel } from '@/keten/composeClient';
import { browserKetenConfig } from '@/keten/browserConfig';
import { profielVanQuizAnswers } from '@/keten/vanQuiz';
import { ketenStylistVlagAan } from '@/keten/vlag';
import type { OutfitBron } from '@/keten/types';
import { getSessionId } from '@/utils/sessionId';
```

Breid `UseOutfitsResult` uit (regel 42-49) met een regel:

```typescript
  /** Bron van de stylist-route als de lokale vlag ff_keten_stylist aan staat, anders null */
  ketenBron: OutfitBron | null;
```

Vervang in de `queryKey` (regel 78-84) de tak voor `answers` door:

```typescript
  const stylistVlag = ketenStylistVlagAan();
  const queryKey = answers
    ? ([
        'outfits',
        stylistVlag ? 'stylist' : 'v2',
        stableAnswersKey(answers),
        limit ?? 9,
      ] as const)
```

Vervang in `queryFn` het blok `if (answers) { ... }` (regel 107-116) door:

```typescript
      // Stylist-route (plan 3), alleen achter de lokale vlag ff_keten_stylist=1.
      // Bouwt het profiel uit de quiz-antwoorden; plan 4 vervangt dat door
      // taste_profiles uit de onboarding v2.
      if (answers && stylistVlag) {
        const cfg = browserKetenConfig();
        const profiel = profielVanQuizAnswers(answers, getSessionId());
        if (cfg && profiel) {
          const r = await composeVoorProfiel(cfg, profiel);
          console.info('[keten] stylist-route', {
            bron: r.bron,
            model: r.model,
            latency_ms: r.latency_ms,
            reden: r.reden,
            profile_hash: r.profile_hash,
          });
          return {
            data: r.engineOutfits as any as Outfit[],
            source: 'supabase' as const,
            cached: r.bron === 'cache',
            errors: [] as string[],
            ketenBron: r.bron as OutfitBron,
          };
        }
      }

      // Engine v2 path: use outfitService which reads moodboard data from localStorage
      if (answers) {
        const generated = await outfitService.generateOutfits(answers, limit ?? 9);
        return {
          data: generated as any as Outfit[],
          source: 'supabase' as const,
          cached: false,
          errors: [] as string[],
          ketenBron: null as OutfitBron | null,
        };
      }
```

Voeg in de legacy-return (regel 134-139, het object na `fetchOutfits`) de regel `ketenBron: null as OutfitBron | null,` toe. Voeg in de eindreturn (regel 154-165) toe:

```typescript
    ketenBron: result?.ketenBron ?? null,
```

- [ ] **Stap 2: pas de resultatenpagina aan**

Regel 390: voeg `ketenBron` toe aan de destructuring:

```typescript
  const { data: realOutfits, loading: outfitsLoading, error: outfitsError, ketenBron } = useOutfits({
```

Regel 1396-1397: in de div `<div className="shrink-0 flex items-center gap-3">`, direct vóór het commentaar op regel 1397 dat begint met `{/* Swipe/Grid toggle`, voeg toe:

```tsx
                  {ketenBron && (
                    <span
                      className="inline-flex items-center rounded-full bg-[#A85740]/10 px-4 py-2 text-sm font-medium text-[#A85740]"
                      title="Interne testvlag ff_keten_stylist staat aan"
                    >
                      Stylist-route: {ketenBron}
                    </span>
                  )}
```

- [ ] **Stap 3: poorten**

```bash
npx tsc --noEmit && npx vitest run && npx vite build && npm run typecheck:keten && npm run check:edge
node scripts/check-design-compliance.mjs | grep "Total Violations"
```

Verwacht: de vijf poorten groen, en het aantal violations niet hoger dan voor je begon. `design:check:ci` staat bewust niet in de keten: dat commando geeft repo-breed exit 1, waardoor `typecheck:keten` en `check:edge` er nooit achter zouden draaien. De badge gebruikt alleen palet-kleuren, 8px-spacing en `text-sm`: 14px is de ondergrens uit CLAUDE.md 2 en 12, ook voor badges. De bestaande pagina heeft elders `text-xs`; dat neem je niet over.

- [ ] **Stap 4: bekijk de outfits lokaal**

```bash
npm run dev
```

Open `http://localhost:5173`, doorloop de quiz (of gebruik een bestaande sessie met quiz-antwoorden), open de browserconsole en zet:

```javascript
localStorage.setItem('ff_keten_stylist', '1')
```

Herlaad `/results`. De eerste keer voor een nieuw profiel toont de pagina 10 tot 30 seconden de bestaande laadstatus (een cache-miss; zie "Wachttijd-budget"), daarna direct. Verwacht: rechts van de kop "Handpicked voor jou" de badge `Stylist-route: stylist` (eerste keer) of `Stylist-route: cache` (daarna); zes outfits met de Nederlandse titel en reden van het model; in de console een regel `[keten] stylist-route {bron, model, latency_ms, ...}`. Zet de vlag uit met `localStorage.removeItem('ff_keten_stylist')` en herlaad: de badge verdwijnt en de bestaande engine-route staat weer.

Is `Stylist-route: v2-fallback` te zien, lees dan `reden` in de console. `compose-outfits 401` betekent een verkeerde anon key in `.env`; `Anthropic 401` de secret uit taak 6; `antwoordde niet binnen 120 s` of `binnen 45 s` een te trage aanroep (zie "Wachttijd-budget").

- [ ] **Stap 5: commit en deploy-parity**

```bash
git add src/hooks/useOutfits.ts src/pages/EnhancedResultsPage.tsx
git commit -m "feat(results): stylist-route achter lokale vlag ff_keten_stylist

Alleen voor intern testen tot plan 4 de onboarding v2 en de vlag keten_v2
brengt. De badge toont de bron zodat je ziet wat je bekijkt.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Dit plan zet niets live op Netlify: de vlag is lokaal en de code zonder vlag gedraagt zich exact als voorheen. Deploy volgt na plan 4 met de vlag `keten_v2`.

---

## Zelfcontrole

| Spec-eis | Taak |
|---|---|
| 5.2 `taste_profiles`-vorm als TypeScript-type (`TasteProfile`, `TasteProfileInput`) in `src/keten/types.ts` | Taak 2 |
| 5.2.1 normalisatie en `profile_hash` (sha256) | Taak 2 (`normaliseerProfiel`, `profileHash`, `sha256Hex` in `src/utils/hash.ts` met test) |
| 5.3 aanroep van `get_kandidaten` met de volledige signatuur | Taak 7 (`haalKandidaten`) |
| 5.4 input `{ profile_hash, profile, kandidaten }` | Taak 6 (`isVerzoek`) |
| 5.4 punt 1 cache-hit op `outfit_sets.profile_hash` met dezelfde `stylist_version` | Taak 6, aangescherpt met levensduur 14 dagen en voorraadcontrole (sectie "Cache-levensduur") |
| 5.4 punt 2 model via `STYLIST_MODEL`, default `claude-sonnet-5`, structured output via tool met exact het outfits-schema en `tool_choice` op die tool | Taak 5 (schema), taak 6 (aanroep) |
| 5.4 punt 2 prompt met harde feiten, assen met confidence, gekozen en afgewezen items, kandidaten met attributen en prijs; instructies zes outfits, elke gelegenheid, geen dubbele top of dress, alleen ids uit de lijst | Taak 5 |
| 5.4 punt 3 harde validatie (ids in kandidaten, compleet, geen disliked, binnen budget, geen dubbele itemset) als pure functie met tests | Taak 4 |
| 5.4 punt 3 minder dan vier geldig: een keer opnieuw met de fouten in de prompt, daarna noodpad | Taak 6, binnen het tijdsbudget (`HERKANSING_UITERLIJK_MS`) |
| 5.4 punt 4 noodpad engine v2 op dezelfde kandidaten met `seed = hash(profile_hash)`, gemarkeerd `v2-fallback` | Taak 6 (signaal), taak 7 (`fallbackV2` met `fnv1a32`, dat taak 2 zelf levert en test; niet langer een aanname over plan 1) |
| 5.4 punt 5 schrijven naar `outfit_sets` en teruggeven, verrijkt met productdata | Taak 6 (`verrijk`, upsert, opruimen) |
| 5.4 copy-regels voor `title` en `reason` (je/jij, geen buzzwords, geen claims over de gebruiker) | Taak 5 (systeemprompt regel 10) |
| 5.5 tabel `outfit_sets` met sleutel `(profile_hash, stylist_version)`, `source`, `outfits`, `model`, `latency_ms`, `created_at`; aanvulling `input_tokens`, `output_tokens` | Taak 3 |
| 5.6 `outfit_key` als gesorteerde product_ids, gehasht, met dezelfde formule als `outfit_ratings` | Taak 6 (`outfitKey` in de edge function), taak 7 (`fallbackV2` via `outfitKey` uit plan 1) |
| 5.7 vier persona's over de hele keten tegen de live database, outfits geprint | Taak 8 (plus een vijfde profiel met halve assen-set, keuze 3) |
| 5.7 controles: minder dan zes of niet compleet; item buiten budget; sandaal of zwem-accessory bij work; dubbele itemset; twee runs verschillend | Taak 8 (`controleerOutfitSet`, `zelfdeOutfits`) |
| 1 "minder dan drie minuten": wachttijd-budget voor de compose-stap (45 s per aanroep, herkansing alleen binnen 50 s, client 120 s) | Sectie "Wachttijd-budget", taak 6, taak 7 |
| 8 poorten per taak (tsc, vitest, vite build, design:check:ci) | Elke taak, laatste stap |
| 8 aanvulling: typecheck van `_shared` en `scripts/keten` (`typecheck:keten`) en Deno-check van de edge function (`check:shared`, `check:edge`) | Taak 1, daarna elke taak |
| 8 "elke week persona-run groen": kosten daarvan bekend en meetbaar | Sectie "Kosten", taak 3 (kolommen), taak 8 stap 6 (query) |
| 8 "Luc heeft de outfits gezien" voordat de vlag omgaat | Taak 9 (lokale vlag `ff_keten_stylist`) |
| 7 engine v2 niet aanpassen; bestaande `/results` blijft | Taak 7 roept alleen `runEngineV2` aan; taak 9 werkt zonder vlag exact als voorheen |
| CLAUDE.md 2 en 12: tekst minimaal 14px, ook in de badge | Taak 9 (`text-sm`) |
| CORS via `buildCorsHeaders(req)`, niet de ongedefinieerde `corsHeaders` | Taak 6 |
| `src/utils/image.ts` blijft werken na de wijziging van `src/utils/hash.ts` | Taak 2 (`hashString` behouden, `hashCompat.test.ts`, `npx tsc --noEmit`) |
| 9.3 plan 3 levert `compose-outfits`, `outfit_sets`, validatie, noodpad, persona-harnas op de nieuwe keten | Taken 3, 4, 6, 7, 8 |
