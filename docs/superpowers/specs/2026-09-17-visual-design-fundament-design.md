# FitFi visual design: fundament en scroll-grammatica

Datum: 2026-09-17
Status: ter review
Besluitvormer: Luc

## Aanleiding

De vraag was hoe we de UI en het visual design van FitFi naar een hoger niveau
tillen. Uit de audit blijkt dat dit geen smaakvraag is maar een bronvraag.

## Diagnose

### Drie bronnen die elkaar tegenspreken

| Bron | Beweert | Werkelijkheid |
|---|---|---|
| `CLAUDE.md` | terracotta `#A85740`, geen ander font dan Plus Jakarta Sans | wordt op de sterkste pagina's overtreden |
| `src/styles/tokens.css` | "CANONIEK": taupe `#A6886A` | 5 keer gebruikt tegen 1448 keer terracotta |
| de code | 1448x hardcoded `#A85740`, Instrument Serif | dit draait in productie |

### De tokenlaag bestaat al en wordt niet gebruikt

`tailwind.config.ts` is correct bedraad: `primary`, `surface`, `muted` en
`border` wijzen naar CSS-variabelen in `tokens.css`. De bedrading klopt, de
waarden niet, en niemand gebruikt hem.

Gemeten over 73.937 regels TSX:

| Klasse | Gebruik |
|---|---|
| `bg-primary-*`, `text-primary-*`, `bg-surface`, `text-muted`, `border-border`, `bg-accent-*` | 18 |
| `text-[#1A1A1A]` | 1138 |
| `border-[#E5E5E5]` | 804 |
| `bg-[#A85740]` | 331 |
| `text-[#4A4A4A]` | 191 |

`npm run design:check`: 0% compliance, 13.251 violations over 712 bestanden.
Die score meet niet lelijkheid. Hij meet dat er 9.994 keer met de hand een
kleur is ingetypt omdat er geen plek is waar je hem een keer zet.

### Het document produceert de saaie pagina's

`AboutPage.tsx` volgt sectie 13 exact: zand-header, `pt-44 md:pt-52`, witte
badge, correcte hexen. Resultaat: nul beelden, nul links of knoppen op de hele
pagina, ongelijke kaarthoogtes, H1 op `text-2xl`.

`LandingPage.tsx:227` en `PricingPage.tsx:250` overtreden de fontregel met
`font-serif italic` op `text-[56px]`. Dat zijn precies de pagina's die werken.

`CLAUDE.md` spreekt zichzelf bovendien tegen: sectie 2 zegt dat H1
`text-3xl md:text-5xl` is, sectie 13 zegt `text-2xl md:text-3xl`.

### Stille breuk: CSS die nooit laadt

`src/main.tsx` laadt `index.css`. `main.css` wordt nergens geimporteerd, en
daarmee ook niet wat alleen daar binnenkomt.

Dood, 727 regels: `main.css`, `animations.css`, `utilities/accessibility.css`,
`components/images.css`, `components/pricing.css`. Ook `polish.safe.css` en
`fitfi-theme.css` worden nergens geimporteerd.

Gevolg, geverifieerd tegen alle wel geladen stylesheets en tegen
`tailwind.config.ts`: negen klassen worden 42 keer gebruikt en doen niets.

`animate-fade-in` (13x), `animate-float` (7x), `hover-lift` (6x),
`card-hover` (5x), `animate-scale-in` (3x), `animate-float-delayed` (2x),
`animate-float-slow` (2x), `glass` (2x), `hover-scale` (2x).

`animate-pulse`, `animate-spin` en `transition-colors` staan ook in dat bestand
maar werken gewoon, want Tailwind levert ze zelf.

### Dubbele componentgeneraties

Vijf image-componenten naast elkaar: `SmartImage` (18), `ImageWithFallback` (9),
`ProductImage` (8), `LazyImage` (5), `SmartFallbackImage` (2).

De primitives-laag bestaat maar wordt niet gebruikt: `SurfaceCard` en
`PrimaryButton` staan op 0 bestanden. `Button` leeft wel, in 31 bestanden.

### Wat er visueel misgaat

Op `/hoe-het-werkt` zweven twee stat-kaarten over de beelden ("12+ / 98%",
"2 min / 6-12") met labels van 10px. Op de homepage zweeft een
"Jouw kleurpalet"-kaart over de foto. Dat patroon is eerder afgekeurd.

De drie beelden op `/hoe-het-werkt` hebben drie verschillende achtergronden en
ratio's en tonen een mannequin, een telefoon-mockup en een tas. Geen ervan legt
het product uit.

## Beslissingen

Genomen op 2026-09-17:

1. **Editorial wint, het document volgt.** Serif display met italic accent wordt
   de norm. `CLAUDE.md` wordt herschreven naar wat home en prijzen al doen.
2. **Fundament eerst.** Tokenlaag voor pagina-werk.
3. **Een tokenlaag, bestaande kleuren.** Zand en terracotta blijven. Geen
   donkere modus. Van de OCTABOOT-referentie nemen we de techniek over, niet
   het palet.

## Referentie: wat we overnemen

Bron: `tailor-by-octaboot.vercel.app`, gezien via een reel van 9,9 seconden.
Een scroll-gedreven pagina voor een fictief kleermakersmerk.

Overnemen:

1. **Scroll als tijdlijn.** Het onderwerp wordt laag voor laag opgebouwd terwijl
   je scrollt, met een eigen hoofdstukkop per laag.
2. **Onderwerp als museumobject.** Uitgesneden, op een rustig vlak, met een
   zachte schaduw. Niets eroverheen.
3. **Serif display met italic accent.** Een woord in italic, de rest recht.
4. **Kleine kapitalen met wijde letterafstand** als hoofdstuklabel boven de kop.
5. **Haarlijn als sectiescheider** in plaats van een harde blokovergang.

Niet overnemen: het donkere palet, de spotlight, de goudtint.

Wat we al hebben en niet gebruiken: framer-motion zit in 133 bestanden, maar
`useScroll` in 3 en `useTransform` in 9.

## Aanpak

### Fase 0: het document kloppend maken

Zonder dit produceert elke volgende pagina opnieuw de brave variant.

- Instrument Serif opnemen als display-font, Plus Jakarta Sans als body en UI
- H1-tegenspraak tussen sectie 2 en 13 oplossen
- radius- en schaduwschaal in lijn brengen met wat feitelijk werkt
- de scroll-grammatica uit de vorige paragraaf vastleggen als sectie

### Fase 1: tokenlaag kloppend maken

- terracotta-schaal op de bestaande variabelenamen in `tokens.css`, zodat
  `tailwind.config.ts` ongewijzigd blijft werken
- tokens toevoegen voor display-font, hoofdstuklabel en haarlijn
- radius- en schaduwtokens beperken tot de toegestane set

### Fase 2: migratie

Per kleur een codemod, mechanisch en omkeerbaar. Na elke stap `design:check`
plus een screenshot voor en na op de vijf hoofdpagina's.

Volgorde op aantal: `text-[#1A1A1A]`, `border-[#E5E5E5]`, `bg-[#A85740]`,
`text-[#4A4A4A]`, daarna de rest.

### Fase 3: opruimen

- 727 regels dode CSS verwijderen, na tellen per bestand
- de negen kapotte klassen: verplaatsen naar een geladen stylesheet of vervangen
  door hun Tailwind-equivalent
- vijf image-componenten terugbrengen naar een
- `SurfaceCard` en `PrimaryButton` adopteren of verwijderen

### Fase 4: scroll-grammatica

Herbruikbare primitives bovenop framer-motion, met `prefers-reduced-motion`
als harde voorwaarde:

- `<Chapter>`: sticky sectie met label en serif kop
- `<PinnedFigure>`: beeld blijft staan terwijl de tekst doorloopt
- `<Reveal>`: scroll-gekoppelde opacity en verplaatsing, maximaal 500ms
- `<Hairline>`: sectiescheider

Eerste toepassing: `/results`. Dat is de pagina waar de grammatica hoort, want
een stijlrapport is letterlijk een onthulling laag voor laag. Die pagina
gebruikt Instrument Serif al op zeven plekken.

Daarna `/over-ons` en `/hoe-het-werkt`, inclusief het verwijderen van de
zwevende stat-kaarten.

## Wat hier niet in zit

- Geen donkere modus
- Geen nieuwe kleuren
- Geen Figma-koppeling
- Geen wijziging aan quiz-logica, engine of database
- Admin-pagina's blijven ongemoeid tot de rest staat

## Verificatie

Per fase, niet alleen aan het eind:

1. `npm run typecheck` en `npm run lint`
2. `npm run design:check`, met het aantal violations als cijfer voor en na
3. screenshots van de vijf hoofdpagina's voor en na, headless Chrome
4. `fitfi-rule-checker` op de diff
5. voor fase 4: controle met uitgeschakelde animatie
