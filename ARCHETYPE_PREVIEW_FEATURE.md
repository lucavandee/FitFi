# Real-time Archetype Preview Feature

## Overzicht

De **Real-time Archetype Preview** toont gebruikers tijdens de quiz welk stijlprofiel (archetype) ze aan het opbouwen zijn. Dit verhoogt transparantie, engagement en vertrouwen in het systeem.

## Features

### 1. **Live Archetype Detection**
- Verschijnt vanaf **stap 3** (na gender, style, en colors)
- Berekent real-time archetype op basis van:
  - Geselecteerde stijlvoorkeuren
  - Gekozen gelegenheden (occasions)
  - Mix factor (hoe dominant het archetype is)

### 2. **Visuele Feedback**
- **Archetype emoji** (👔, ✨, 🎨, etc.)
- **Naam + beschrijving** (bijv. "Klassiek - Tijdloze elegantie")
- **3 traits** (bijv. "Preppy", "Verzorgd", "Professioneel")
- **Confidence score** (65-100%)
- **Progress indicator** (% quiz completion)

### 3. **Change Animations**
Wanneer het archetype verandert:
- Emoji roteert en schaalt (spring animation)
- Naam fade in/out
- Pulse effect op icon
- Traits herladen met stagger

### 4. **Archetype Comparison**
Expandable sectie met:
- **Top 3 archetypes** gerangschikt op score
- Visuele score bars
- Rank badges (#1, #2, #3)
- Huidige archetype gemarkeerd

## Archetypes & Configuratie

### Beschikbare Archetypes

| Archetype | Emoji | Tagline | Traits |
|-----------|-------|---------|--------|
| **Klassiek** | 👔 | Tijdloos & verfijnd | Preppy, Verzorgd, Professioneel |
| **Smart Casual** | ✨ | Relaxed & gepolijst | Toegankelijk, Veelzijdig, Modern |
| **Urban** | 🎨 | Expressief & urban | Bold, Creatief, Trendy |
| **Athletic** | ⚡ | Actief & functioneel | Performance, Comfort, Clean |
| **Minimalistisch** | ◼️ | Clean & architectural | Tijdloos, Neutraal, Kwaliteit |
| **Luxury** | 💎 | Premium & exclusief | Hoogwaardig, Verfijnd, Statement |
| **Streetstyle** | 🔥 | Bold & karaktervol | Expressief, Uniek, Statement |
| **Retro** | 🕰️ | Vintage & nostalgisch | Nostalgisch, Karaktervol, Uniek |

## Logica & Berekening

### Detection Flow

```typescript
// 1. Convert style selections to preferences
const stylePrefs = convertStyleArrayToPreferences(answers.stylePreferences);

// 2. Get occasions (affects formality score)
const occasions = answers.occasions || [];

// 3. Analyze profile
const profile = analyzeUserProfile(stylePrefs, occasions);

// 4. Extract results
const archetype = profile.dominantArchetype;        // bijv. "klassiek"
const confidence = (1 - profile.mixFactor) * 100;   // hoe dominant (65-100%)
const scores = profile.archetypeScores;              // alle scores
```

### Confidence Calculation

```
confidence = (1 - mixFactor) * 100

- mixFactor = 0.1 → confidence = 90% (zeer dominant archetype)
- mixFactor = 0.3 → confidence = 70% (duidelijk dominant)
- mixFactor = 0.5 → confidence = 50% (evenwichtige mix)

Minimum confidence: 65% (om onzekerheid te voorkomen)
```

### Occasion Impact

Occasions beïnvloeden het archetype:
- **"work"** (Werk) → +formality → meer kans op **Klassiek**
- **"sport"** (Sport) → +athletic → meer kans op **Athletic**
- **"casual"** (Casual) → balanced → **Smart Casual**
- **"night"** (Uitgaan) → +bold → **Urban/Streetstyle**

## Test Scenarios

### Scenario 1: Zakelijk Profiel → Klassiek

1. Start quiz: `/quiz`
2. Stap 1: Selecteer gender
3. Stap 2: Kies **"Klassiek"** of **"Preppy"**
4. Stap 3: Kies neutrale kleuren

**→ Preview verschijnt met "Klassiek 👔" of "Smart Casual ✨"**

5. Stap 5: Selecteer **"Werk"** als gelegenheid

**→ Preview update naar "Klassiek 👔" met hogere confidence (~85-95%)**

### Scenario 2: Sportief Profiel → Athletic

1. Stap 2: Kies **"Sportief"** + **"Athleisure"**
2. Stap 5: Selecteer **"Sport & Actief"**

**→ Preview toont "Athletic ⚡" met ~90% confidence**

### Scenario 3: Mix Profiel → Smart Casual

1. Stap 2: Mix van stijlen (bijv. Casual + Minimaal)
2. Stap 5: Mix van gelegenheden (Werk + Weekend)

**→ Preview toont "Smart Casual ✨" met lagere confidence (~65-75%)**

### Scenario 4: Archetype Change

1. Start met "Sportief" selecties → Preview = Athletic ⚡
2. Ga terug en wijzig naar "Klassiek"

**→ Smooth transition animatie:**
- Emoji roteert uit/in
- Naam fade transition
- Pulse effect
- Traits updaten met stagger

## Comparison Feature

### Activeren

Klik op **"Vergelijk"** knop (of Info icon op mobile)

### Toont

1. **Top 3 archetypes** met scores
2. **#1 badge** met gradient voor top match
3. **Score bars** (animated)
4. **Current archetype** gemarkeerd met "(jouw profiel)"

### Voorbeeld Output

```
#1  👔  Klassiek               ████████████████░░  89%  (jouw profiel)
#2  ✨  Smart Casual           ██████████░░░░░░░░  62%
#3  ◼️  Minimalistisch         ████████░░░░░░░░░░  48%
```

## Technische Details

### Component

**`/src/components/quiz/ArchetypePreviewEnhanced.tsx`** (475 regels)

### Props

```typescript
interface ArchetypePreviewEnhancedProps {
  answers: Record<string, any>;      // Current quiz answers
  currentStep: number;                // Current step index (0-based)
  totalSteps: number;                 // Total quiz steps
}
```

### State Management

```typescript
const [archetype, setArchetype] = useState<string | null>(null);
const [previousArchetype, setPreviousArchetype] = useState<string | null>(null);
const [confidence, setConfidence] = useState<number>(0);
const [showPreview, setShowPreview] = useState(false);
const [showComparison, setShowComparison] = useState(false);
const [allScores, setAllScores] = useState<ArchetypeScore[]>([]);
const [isChanging, setIsChanging] = useState(false);
```

### Performance

- **No backend calls** - pure client-side calculation
- **Debounced updates** via useEffect dependency array
- **Lazy rendering** - only shows after step 3
- **Memoized calculations** - archetype config is static

### Animations

All animations use Framer Motion:
- **Entry**: fade + slide from top (0.4s)
- **Icon change**: rotate + scale spring animation
- **Comparison expand**: height auto transition (0.3s)
- **Score bars**: width animation with stagger (0.6s)

## Styling & Design

### Colors

- Background: `gradient-to-br from-primary-50 to-accent-50`
- Border: `border-2 border-primary-200`
- Cards: `bg-white` with `shadow-md`
- Badges: `bg-white` with `shadow-sm`
- Progress bar: `gradient-to-r from-primary-600 to-accent-600`

### Responsive

- **Mobile (< 640px)**: Stacked layout, smaller text, compact badges
- **Tablet (640-768px)**: Balanced layout
- **Desktop (> 768px)**: Full layout with all details

### Accessibility

- Semantic HTML (`<button>`, `<span>`, etc.)
- ARIA labels on interactive elements
- Focus rings via `focus-visible:ring-2`
- Keyboard navigation support
- Screen reader friendly text

## Integration

### In OnboardingFlowPage

```tsx
import { ArchetypePreviewEnhanced as ArchetypePreview } from "@/components/quiz/ArchetypePreviewEnhanced";

// In render:
<ArchetypePreview
  answers={answers}
  currentStep={currentStep}
  totalSteps={quizSteps.length}
/>
```

### Position

Tussen progress bar en question card:
- Na sticky header
- Voor question title
- Conditionally rendered (vanaf stap 3)

## Future Enhancements

### 1. **Archetype Details Modal**
Full-screen modal met:
- Uitgebreide beschrijving
- Voorbeeld outfits
- Celebrity references
- Style tips

### 2. **Archetype Journey Visualization**
Timeline die toont hoe archetype verandert per stap:
```
Stap 2: Smart Casual (70%)
Stap 3: Smart Casual (72%)
Stap 5: Klassiek (85%)   ← "Werk" selectie verhoogde formality!
```

### 3. **Social Sharing**
"Deel mijn archetype" knop:
- Generate share card met emoji + archetype
- Twitter/Instagram integration
- Referral tracking

### 4. **A/B Testing**
Test verschillende presentaties:
- Variant A: Compact (huidige versie)
- Variant B: Full-width hero met groot emoji
- Variant C: Sidebar sticky panel

## Troubleshooting

### Preview verschijnt niet

**Check:**
1. Is `currentStep >= 2`?
2. Heeft `answers.stylePreferences` waarden?
3. Console logs voor errors?

### Archetype blijft "Smart Casual"

**Oorzaak:** Default fallback wanneer geen duidelijke match

**Oplossing:**
- Zorg dat gebruiker specifieke stijlen kiest
- Check of occasions worden meegegeven

### Confidence altijd laag (<70%)

**Oorzaak:** Hoge mixFactor (gebruiker kiest veel verschillende stijlen)

**Verwacht gedrag:** Dit is correct! Sommige gebruikers hebben echt een mix profiel.

### Animations haperen

**Check:**
1. Is Framer Motion geïnstalleerd? (`framer-motion@^12.23.22`)
2. Browser support voor transforms/animations?
3. Performance issues? (check met DevTools Performance tab)

## Metrics & Analytics

### Events to Track

```typescript
// Preview shown
trackEvent('archetype_preview_shown', {
  archetype,
  confidence,
  step: currentStep
});

// Archetype changed
trackEvent('archetype_changed', {
  from: previousArchetype,
  to: archetype,
  step: currentStep
});

// Comparison opened
trackEvent('archetype_comparison_opened', {
  archetype,
  topThree: topThree.map(s => s.archetype)
});
```

### KPIs

- **Engagement**: % users die comparison openen
- **Confidence**: Average confidence score bij verschillende steps
- **Stability**: Hoe vaak archetype verandert tijdens quiz
- **Completion**: Impact op quiz completion rate

## Conclusie

De Real-time Archetype Preview is een **premium UX feature** die:
1. **Transparantie** verhoogt (gebruikers zien wat ze krijgen)
2. **Engagement** stimuleert (interactieve feedback loop)
3. **Vertrouwen** opbouwt (systeem is begrijpelijk, niet een black box)
4. **Conversie** verhoogt (gebruikers maken quiz af omdat ze geïnvesteerd zijn)

**Impact:** Verwachte stijging van 10-15% in quiz completion rate en 20-30% hogere user satisfaction scores.
