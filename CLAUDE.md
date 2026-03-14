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

## Mappenstructuur (relevant voor styling)
```
src/
├── pages/          ← Hier werk je aan pagina's
├── components/     ← Hier werk je aan componenten
├── styles/         ← CSS bestanden
└── ... (rest is off-limits tenzij gevraagd)
```

---

# DEEL 2: NO-TOUCH CONTRACT

Deze opdrachten zijn uitsluitend voor visuele, UX-, copy- en polishverbeteringen.

## VERBODEN — raak dit NOOIT aan

### Engine & Logica
- Recommendation engine en outfit matching
- Quizlogica, vraagvolgorde en scoring
- Profiel- of archetype-afleiding
- Resultaatalgoritme en matchpercentages
- Calibratie-logica
- State management en dataflow (TanStack Query, context providers)
- ML/personalisatie systemen

### Database & Backend
- Alles in `/supabase/` — migrations, functions, config
- Supabase client configuratie (`@supabase/supabase-js` setup)
- Database queries en RPC calls
- Storage bucket configuratie
- Row Level Security policies
- Edge functions in `/netlify/`

### Auth & Security
- Authenticatie en sessielogica (Supabase Auth, Google OAuth)
- CSP headers en security configuratie
- GDPR/privacy compliance code

### Configuratie & Build
- `.env`, `.env.example`, `.env.local`, `.env.production` — NOOIT lezen of wijzigen
- `vite.config.ts` — niet wijzigen
- `netlify.toml` — niet wijzigen
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — niet wijzigen
- `package.json` — niet wijzigen tenzij het puur een font-toevoeging betreft
- `package-lock.json` — niet wijzigen
- `postcss.config.cjs` — niet wijzigen
- `playwright.config.ts` — niet wijzigen

### Mappen — volledig off-limits
- `/supabase/` — database migrations en functions
- `/netlify/` — edge functions en serverless
- `/scripts/` — build en utility scripts
- `/plugins/` — Vite plugins
- `/e2e/` — end-to-end tests
- `/.bolt/` — bolt.new configuratie
- `/.husky/` — git hooks
- `/docs/` — documentatie
- `/content/` — content bestanden

### Bestandsregels
- Bestanden NIET hernoemen, verplaatsen of samenvoegen
- Mappenstructuur NIET reorganiseren
- Bestaande imports en exports NIET aanpassen tenzij direct vereist door een styling-wijziging in datzelfde bestand
- Ongebruikte code NIET opruimen (dat is een aparte taak)
- Geen nieuwe dependencies installeren zonder expliciete toestemming
- Markdown bestanden in de root (*.md) NIET aanpassen of verwijderen

### Routing
- Route definities en paden NIET wijzigen
- Redirects NIET toevoegen of aanpassen
- React Router configuratie NIET wijzigen

## TOEGESTAAN

- CSS en Tailwind classes aanpassen in `src/pages/` en `src/components/`
- Kleuren, fonts, spacing, border-radii, schaduwen wijzigen
- Componenten visueel aanpassen (layout, sizing, responsive gedrag)
- Copy en teksten verbeteren
- Nieuwe puur-visuele componenten toevoegen (badges, lege states, skeleton loaders)
- Aria-labels en accessibility verbeteren
- Animaties en transitions toevoegen (Framer Motion of CSS, volgens design system)
- `tailwind.config.ts` aanpassen ALLEEN voor font-family en design system kleuren

## WERKWIJZE

1. Werk per component of per pagina. Niet meerdere tegelijk.
2. Wijzig alleen bestanden die direct nodig zijn voor de UI-opdracht.
3. Raak geen unrelated files aan.
4. Als je denkt dat een engine- of logicawijziging "zou helpen": voer die NIET uit. Noem het alleen onder "Buiten scope".
5. Na elke wijziging: controleer of de app nog correct bouwt (`npm run build`).

---

# DEEL 3: DESIGN SYSTEM v1.0

## 1. Kleurenpalet

### Primaire kleuren
| Naam | Hex | Tailwind | Gebruik |
|------|-----|----------|---------|
| Terracotta | #C2654A | `text-[#C2654A]` / `bg-[#C2654A]` | Primaire CTA's, accenten, actieve states |
| Terracotta Dark | #A8513A | `bg-[#A8513A]` | Hover state primaire buttons |
| Terracotta Light | #F4E8E3 | `bg-[#F4E8E3]` | Geselecteerde states, soft highlights |

### Neutrale kleuren
| Naam | Hex | Tailwind | Gebruik |
|------|-----|----------|---------|
| Zwart | #1A1A1A | `text-[#1A1A1A]` | Headlines |
| Donkergrijs | #4A4A4A | `text-[#4A4A4A]` | Body tekst |
| Middengrijs | #8A8A8A | `text-[#8A8A8A]` | Placeholders, captions |
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
- Tekst NOOIT lichter dan #8A8A8A
- GEEN nieuwe kleuren buiten dit palet

## 2. Typografie

**Plus Jakarta Sans** — Google Fonts

### Schaal
| Element | Desktop | Mobiel | Tailwind | Gewicht | Kleur |
|---------|---------|--------|----------|---------|-------|
| H1 | 48px | 32px | `text-3xl md:text-5xl font-bold leading-tight` | 700 | #1A1A1A |
| H2 | 32px | 24px | `text-2xl md:text-3xl font-bold leading-snug` | 700 | #1A1A1A |
| H3 | 24px | 20px | `text-xl md:text-2xl font-semibold` | 600 | #1A1A1A |
| H4 | 20px | 20px | `text-xl font-semibold` | 600 | #1A1A1A |
| Body | 16px | 16px | `text-base font-normal leading-relaxed` | 400 | #4A4A4A |
| Body small | 14px | 14px | `text-sm font-normal` | 400 | #4A4A4A |
| Caption | 12px | 12px | `text-xs font-medium` | 500 | #8A8A8A |
| Label | 14px | 14px | `text-sm font-medium` | 500 | #1A1A1A |

### Typografieregels
- NOOIT kleiner dan 16px voor body, 14px voor enige tekst op mobiel
- Headlines: ALTIJD #1A1A1A
- Body: ALTIJD #4A4A4A
- Max 65-75 karakters per regel (`max-w-prose`)
- GEEN ander font dan Plus Jakarta Sans

## 3. Spacing

Basis-eenheid: 8px. Altijd Tailwind spacing scale.

- Secties: minstens `py-16` verticaal
- Cards: ALTIJD `p-6` interne padding
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card grids: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

## 4. Componenten

### Buttons
- Primair: `bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl`
- Secundair: `bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl`
- ALTIJD `rounded-xl`, minimale hoogte 48px, max 1 primaire button per scherm

### Cards
- `bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md`
- ALTIJD `rounded-2xl`, geen schaduwen als default, alleen op hover
- Alle cards in een grid: DEZELFDE hoogte

### Badges
- ALTIJD `rounded-full`
- 10% opacity achtergrond: `bg-[#C2654A]/10 text-[#C2654A]`
- Positie op cards: `absolute top-3 left-3`

### Inputs
- `rounded-xl py-3 px-4 border border-[#E5E5E5]`
- Focus: `focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A]`
- Labels BOVEN het veld

### Tabs
- Actief: `text-[#C2654A] border-b-2 border-[#C2654A] font-semibold`
- Inactief: `text-[#8A8A8A] font-medium`

### Modals
- `rounded-2xl max-w-lg shadow-xl`
- Overlay: `bg-black/40`
- ALTIJD sluitknop rechtsboven

### Navigation
- Header: `fixed bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] h-16`
- Actieve pagina: `text-[#C2654A]`

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

ALTIJD op zand-achtergrond: bg-[#F5F0EB] pt-24 pb-16 md:pt-32 md:pb-20
Bevat: badge, headline (H1), subtitel
Badge op page header: bg-white (wit op zand), met Lucide icoon in text-[#C2654A]
Headline: text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center
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
ALTIJD terracotta focus ring: focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A]

Formulier-cards

bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-sm
shadow-sm is toegestaan op formulier-cards voor extra diepte

Principe
De pagina moet altijd warmte uitstralen. Geen wit-op-wit. Gebruik de zand-achtergrond en visuele lagen om diepte te creëren. Als een pagina "kaal" voelt, ontbreken er lagen.

## 14. Header overlap preventie

De fixed header is 72px hoog. Elke pagina-hero of page-header sectie die NIET een full-screen achtergrondafbeelding gebruikt, moet minimaal `pt-44 md:pt-52` (176px/208px) padding-top hebben. Dit voorkomt dat content achter de header verdwijnt.

Uitzondering: de homepage hero (full-bleed afbeelding) regelt zijn eigen spacing via `min-h-screen` en flex positioning.

## 15. CTA secties

CTA-secties boven de footer hebben ALTIJD `py-40` (160px) verticale padding. Dit zorgt voor voldoende ademruimte. Een CTA moet voelen als een eigen blok, niet als een verlengstuk van de sectie erboven of de footer eronder.
