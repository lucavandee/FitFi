# CLAUDE.md — FitFi Project Instructions

Dit document is de enige bron van waarheid voor alle wijzigingen aan FitFi. Lees het volledig voordat je iets aanpast.

---

# DEEL 1: PROJECT OVERZICHT

## Stack
- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS 3.4
- **Database:** Supabase
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **State:** TanStack React Query
- **Animations:** Framer Motion
- **Deployment:** Netlify
- **Font:** Plus Jakarta Sans (Google Fonts)

## Mappenstructuur
```
src/
├── pages/          ← pagina's
├── components/     ← componenten
├── styles/         ← CSS bestanden
└── ...             ← engine, services, hooks, lib
```

---

> Het NO-TOUCH CONTRACT is op 2026-09-03 opgeheven op verzoek van Luc. Engine, build-config,
> routing en `public/` zijn niet langer off-limits. Het design system hieronder geldt nog wel.

# DEEL 2: DESIGN SYSTEM v1.0

## 1. Kleurenpalet

### Primaire kleuren
| Naam | Hex | Tailwind | Gebruik |
|------|-----|----------|---------|
| Terracotta | #A85740 | `text-[#A85740]` / `bg-[#A85740]` | Primaire CTA's, accenten, actieve states |
| Terracotta Dark | #9A503B | `bg-[#9A503B]` | Hover state primaire buttons |
| Terracotta Light | #F4E8E3 | `bg-[#F4E8E3]` | Geselecteerde states, soft highlights |

### Neutrale kleuren
| Naam | Hex | Tailwind | Gebruik |
|------|-----|----------|---------|
| Zwart | #1A1A1A | `text-[#1A1A1A]` | Headlines |
| Donkergrijs | #4A4A4A | `text-[#4A4A4A]` | Body tekst |
| Middengrijs | #6E6E6E | `text-[#6E6E6E]` | Placeholders, captions |
| Lichtgrijs | #E5E5E5 | `border-[#E5E5E5]` | Borders, dividers |
| Gebroken wit | #FAFAF8 | `bg-[#FAFAF8]` | Pagina-achtergrond |
| Wit | #FFFFFF | `bg-white` | Cards, modals, inputs |
| Zand | #F5F0EB | `bg-[#F5F0EB]` | Alternatieve secties |

### Functionele kleuren
| Naam | Hex | Gebruik |
|------|-----|---------|
| Succes | #3D8B5E | Bevestigingen, goede matchscores |
| Waarschuwing | #D4913D | Matige matchscores |
| Error | #C24A4A | Foutmeldingen |
| Info | #4A7EC2 | Links |

### Kleurregels
- Pagina-achtergrond: ALTIJD #FAFAF8, nooit puur wit
- Cards: ALTIJD #FFFFFF met border border-[#E5E5E5]
- Terracotta ALLEEN voor primaire CTA's, actieve tabs en badges
- Tekst NOOIT lichter dan #6E6E6E
- GEEN nieuwe kleuren buiten dit palet

## 2. Typografie

Twee fonts, allebei via Google Fonts, allebei geladen in `index.html`.

- **Instrument Serif** — display. Alleen voor de grote kop boven de vouw.
- **Plus Jakarta Sans** — al het andere: body, UI, knoppen, H2 tot en met H4.

### Display-kop
De kop boven de vouw is een serif display met een italic accent: het eerste
deel `font-serif italic`, het tweede `font-sans font-bold`. Dat patroon staat op
home, prijzen en contact en is de norm, niet de uitzondering.

```tsx
<h1 className="text-[32px] md:text-[64px] text-[#1A1A1A] leading-[1.05]">
  <span className="font-serif italic">We horen </span>
  <span className="font-sans font-bold">graag van je</span>
</h1>
```

Twee afwijkingen, allebei met reden. De homepage-hero staat op
`text-4xl md:text-[68px]` omdat hij over een full-bleed beeld valt en meer
gewicht nodig heeft. Blog en de resultatenpagina staan op 56px omdat hun koppen
langer zijn; results begint op 48px op mobiel.

### Schaal
| Element | Desktop | Mobiel | Tailwind | Gewicht | Kleur |
|---------|---------|--------|----------|---------|-------|
| Display-kop (elke publieke pagina) | 64px | 32px | `text-[32px] md:text-[64px]` | serif italic + sans 700 | #1A1A1A |
| H1 in de app (dashboard, account, login) | 24px | 24px | `text-2xl font-bold` | 700 | #1A1A1A |
| H2 | 32px | 24px | `text-2xl md:text-3xl font-bold leading-snug` | 700 | #1A1A1A |
| H3 | 24px | 20px | `text-xl md:text-2xl font-semibold` | 600 | #1A1A1A |
| H4 | 20px | 20px | `text-xl font-semibold` | 600 | #1A1A1A |
| Body | 16px | 16px | `text-base font-normal leading-relaxed` | 400 | #4A4A4A |
| Body small | 14px | 14px | `text-sm font-normal` | 400 | #4A4A4A |
| Caption | 12px | 12px | `text-xs font-medium` | 500 | #6E6E6E |
| Label | 14px | 14px | `text-sm font-medium` | 500 | #1A1A1A |

### Typografieregels
- NOOIT kleiner dan 16px voor body, 14px voor enige tekst op mobiel
- Headlines: ALTIJD #1A1A1A
- Body: ALTIJD #4A4A4A
- Max 65-75 karakters per regel (`max-w-prose`)
- Alleen Instrument Serif en Plus Jakarta Sans. Geen derde font.
- Instrument Serif (`font-serif`) uitsluitend voor de display-kop en het italic
  accent daarin. Nooit voor body, knoppen, labels of H2 en lager.

## 3. Spacing

Basis-eenheid: 8px. Altijd Tailwind spacing scale.

- Secties: minstens `py-16` verticaal
- Cards: ALTIJD `p-6` interne padding
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card grids: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

## 4. Componenten

### Buttons
- Primair: `bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base py-3 px-6 rounded-xl`
- Secundair: `bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl`
- ALTIJD `rounded-xl`, minimale hoogte 48px, max 1 primaire button per scherm

### Cards
- `bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md`
- ALTIJD `rounded-2xl`, geen schaduwen als default, alleen op hover
- Alle cards in een grid: DEZELFDE hoogte

### Badges
- ALTIJD `rounded-full`
- 10% opacity achtergrond: `bg-[#A85740]/10 text-[#A85740]`
- Positie op cards: `absolute top-3 left-3`

### Inputs
- `rounded-xl py-3 px-4 border border-[#E5E5E5]`
- Focus: `focus:ring-2 focus:ring-[#A85740]/20 focus:border-[#A85740]`
- Labels BOVEN het veld

### Tabs
- Actief: `text-[#A85740] border-b-2 border-[#A85740] font-semibold`
- Inactief: `text-[#6E6E6E] font-medium`

### Modals
- `rounded-2xl max-w-lg shadow-xl`
- Overlay: `bg-black/40`
- ALTIJD sluitknop rechtsboven

### Navigation
- Header: `fixed top-0 w-full z-50`. Geen vaste hoogteklasse: de navigatie is een
  zwevende pil met eigen padding. Gemeten hoogte is 90px, op elke breedte.
- Actieve pagina: `text-[#A85740]`

## 5. Border Radius
| Element | Tailwind |
|---------|----------|
| Buttons | `rounded-xl` |
| Cards | `rounded-2xl` |
| Inputs | `rounded-xl` |
| Badges | `rounded-full` |
| Modals | `rounded-2xl` |
Geen andere radii.

## 6. Schaduwen
- Default cards: geen
- Hover cards: `hover:shadow-md`
- Modals: `shadow-xl`
- Header: geen (border gebruiken)
Geen andere schaduwen.

## 7. Afbeeldingen
- Product/outfit: `aspect-[3/4] object-cover`
- Hero: `aspect-video object-cover`
- Avatar: `aspect-square rounded-full`
- ALTIJD dezelfde ratio per grid, ALTIJD `object-cover`, ALTIJD `loading="lazy"`

## 8. Animaties
- `transition-colors duration-200` of `transition-shadow duration-200`
- NOOIT langer dan 500ms, NOOIT bouncy

## 9. Iconen
- Lucide React (al geïnstalleerd)
- Inline: `w-5 h-5`, standalone: `w-6 h-6`
- NOOIT mixen met andere icon sets

## 10. Vaste CTA-teksten
| Actie | Tekst |
|-------|-------|
| Quiz starten | "Begin gratis" |
| Premium upgrade | "Ontgrendel premium" |
| Outfit opslaan | "Bewaar outfit" |
| Naar shop | "Bekijk bij partner" |
| Rapport bekijken | "Bekijk je resultaten" |
Geen variaties.

## 11. Copy-regels
- ALTIJD Nederlands
- Aanspreken met "je" en "jij"
- Vermijd: "authentiek", "uniek", "game-changer", AI-buzzwords
- CTA's: max 3 woorden, headlines: max 8 woorden, paragrafen: max 3 zinnen

## 12. Responsiveness
- Touch targets: min 44x44px
- Geen horizontale scroll
- Tekst min 14px op mobiel
- `grid-cols-1` op mobiel, opschalen per breakpoint

- AANVULLING — voeg dit toe onderaan het bestaande CLAUDE.md bestand

13. Pagina-opbouw (alle pagina's)
Elke pagina op FitFi volgt deze visuele opbouw:
Page header

ALTIJD op zand-achtergrond: bg-[#F5F0EB] pt-44 pb-16 md:pt-52 md:pb-20
Bevat: badge, headline (H1), subtitel
Badge op page header: bg-white (wit op zand), met Lucide icoon in text-[#A85740]
Headline: de display-kop uit deel 2, gecentreerd. Niet text-2xl: dat is de maat
voor schermen in de app (dashboard, account), niet voor een publieke pagina.
Subtitel: text-base text-[#4A4A4A] text-center mt-4 max-w-lg mx-auto

Content secties

Afwisselend bg-[#FAFAF8] en bg-[#F5F0EB] voor visueel ritme
Elke sectie: minimaal py-16 md:py-24
Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Smallere pagina's (contact, login): max-w-5xl

Visuele gelaagdheid (van achter naar voren)

bg-[#F5F0EB] — secties (warm, zand)
bg-[#FAFAF8] — secties (gebroken wit)
bg-white border border-[#E5E5E5] — cards en formulieren
bg-[#F5F0EB] — accent-cards op witte achtergrond
bg-white — inputs en interactieve elementen in cards

Input-velden

ALTIJD volle border rondom: border border-[#E5E5E5] rounded-xl
NOOIT alleen een bottom-border
ALTIJD terracotta focus ring: focus:ring-2 focus:ring-[#A85740]/20 focus:border-[#A85740]

Formulier-cards

bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-sm
shadow-sm is toegestaan op formulier-cards voor extra diepte

Principe
De pagina moet altijd warmte uitstralen. Geen wit-op-wit. Gebruik de zand-achtergrond en visuele lagen om diepte te creëren. Als een pagina "kaal" voelt, ontbreken er lagen.

## 14. Header overlap preventie

De fixed header is 90px hoog (gemeten op productie, zowel op 390 als op 1440 breed). Elke pagina-hero of page-header sectie die NIET een full-screen achtergrondafbeelding gebruikt, moet minimaal `pt-44 md:pt-52` (176px/208px) padding-top hebben. Dit voorkomt dat content achter de header verdwijnt.

Uitzondering: de homepage hero (full-bleed afbeelding) regelt zijn eigen spacing via `min-h-screen` en flex positioning.

## 15. CTA secties

CTA-secties boven de footer hebben ALTIJD `py-40` (160px) verticale padding. Dit zorgt voor voldoende ademruimte. Een CTA moet voelen als een eigen blok, niet als een verlengstuk van de sectie erboven of de footer eronder.

## 16. Scroll-grammatica

De landingspagina en de prijzenpagina bouwen hun onderwerp laag voor laag op
tijdens het scrollen. De bouwstenen staan in `src/components/landing/scroll/`.

### ScrollScene
Een hoge spacer met een sticky stage erin. De scroll door de spacer levert een
voortgang van 0 tot 1 waarmee de inhoud gestuurd wordt.

- `hoogte` minstens `200vh`. Daaronder leest het als een glitch.
- `statisch` is verplicht: wat er staat als pinnen niet kan. Een echte
  alternatieve opbouw, niet dezelfde scene met een andere transitie.
- Sticky, niet fixed. Voor een fixed element is `offsetParent` null, waardoor
  framer-motion de voortgang niet meer kan meten.

### Wanneer er niet gepind wordt
`useKanPinnen` zet de pin uit onder 1024px breed en onder 700px hoog, en
`MotionConfig reducedMotion="user"` zet hem uit bij `prefers-reduced-motion`.
De hoogtegrens dekt ook 400 procent zoom: WCAG 1.4.10 eist dat er dan geen
content verloren gaat, en een sticky stage van 100svh scrolt niet intern.

### Beats
`Beat` blendt een kind in en uit binnen een deel van de scene-voortgang, voor
"een ding tegelijk". Het invoerbereik komt uit `beatBereik(van, tot)` en blijft
binnen [0,1].

Dat laatste is geen detail. framer-motion geeft het invoerbereik van een
scroll-gekoppelde waarde door als keyframe-offsets aan de Web Animations API,
en die eist offsets in [0,1]. Een band die op 0 begint met een marge ervoor gaf
-0.06, en dan valt de hele pagina in de error boundary, maar alleen boven
1024x700. Schrijf een bereik dus nooit met de hand; gebruik `beatBereik`.

### Toegankelijkheid in een stage
- Alles in de geanimeerde stage staat op `aria-hidden`. De echte tekst staat in
  het statische blok, dat in de pinned variant als `sr-only` meeloopt.
- Geen focusbare elementen in de stage. De fixed header loopt eroverheen, dus
  een getabte link verdwijnt eronder (WCAG 2.4.11). Links en knoppen horen in
  het statische blok erna.

### Grens
Animaties blijven onder 500ms en zijn nooit bouncy (deel 8). Scroll-gekoppelde
beweging heeft geen eigen duur, maar de beats mogen niet sneller wisselen dan
de lezer kan volgen: minstens 200vh scroll per scene.

## 17. Aanvullingen uit "Onder de hero" (oktober 2026)

Deze regels gaan voor wat er hierboven staat. Deel 7: wereld- en sfeerbeeld staat in `aspect-[4/5] object-cover`, en productfoto's uit een feed houden de verhouding van de bron en worden nooit uitgesneden (geen `aspect-[3/4]`, geen `object-cover`, niets eroverheen). Deel 5: foto's hebben geen radius; app-weergave en kaarten houden `rounded-2xl`. Deel 1: tekstlinks zijn `text-[#1A1A1A] underline underline-offset-2`, want `#4A7EC2` haalt op geen van onze ondergronden 4,5:1. Deel 2: de displaykop staat ook in het slot van de landingspagina, een schermvullend beeld met een knop; overal anders onder de hero geen serif. Deel 10: "Bekijk voorbeeld" is een vaste tekst. Deel 4 en 14: de kop is 90 tot 125 px hoog (tussen 768 en ongeveer 850 px breed hoger dan 90); Navbar meet hem in `--header-h`, en ruimte onder de kop rekent daarmee, als `calc(var(--header-h, 90px) + 16px)`. Deel 16: scroll-gekoppelde beweging buiten ScrollScene, zoals de wipe van de kleurpiek, haalt zijn invoerbereik ook uit `beatBereik`.
