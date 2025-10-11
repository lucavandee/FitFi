# Nova Adaptive Feedback Loop (Fase 2)

## Overzicht

Tijdens het swipen voert Nova een real-time conversatie met de gebruiker. Na swipe 3 en 7 analyseert Nova patronen en geeft intelligente feedback zoals:

> "Ik merk dat je houdt van rustige tinten en gestructureerde silhouetten — klopt dat?"

Dit creëert een **menselijke, conversationele ervaring** waarin Nova actief leert en haar begrip valideert.

## Architectuur

### SwipeAnalyzer Service

Een stateful analyzer die real-time patronen detecteert:

```typescript
class SwipeAnalyzer {
  addSwipe(photo: MoodPhoto, swipe: StyleSwipe)
  getPattern(): SwipePattern
  generateInsight(swipeCount: number): NovaInsight | null
}
```

**SwipePattern Detection:**
- **Dominant colors** - Welke kleuren komen terug in liked photos?
- **Preferred styles** - Welke style tags zijn populair? (scandi_minimal, italian_smart_casual, etc.)
- **Response time** - Snelle swipes = decisief, trage = thoughtful
- **Like rate** - Percentage likes vs rejects (selectiviteit)
- **Confidence** - Groeit met aantal swipes (max bij 10)

**Timing Logic:**
- **Swipe 3** - Eerste insight na minimaal patroon
- **Swipe 7** - Tweede, verfijndere insight
- **Max 2 insights** per sessie om niet te overweldigen

### Insight Triggers

Nova heeft 4 intelligente triggers:

#### 1. Style Trigger (Swipe 3)
Detecteert dominante stijlvoorkeur:
```
"Ik merk dat je houdt van strakke minimalistische looks — klopt dat?"
```

**Voorwaarde:** Like rate > 60% EN duidelijke style tag

#### 2. Pattern Trigger (Swipe 3)
Voor selectieve swipers:
```
"Je bent selectief — ik zie dat je duidelijk weet wat je wél en niet wilt!"
```

**Voorwaarde:** Like rate < 40%

#### 3. Speed Trigger (Swipe 7)
Analyseert decisiveness:

**Snelle swiper** (< 1.5s gemiddeld):
```
"Je swipet snel en zeker — strakke minimalistische looks met een vleugje klassieke details past perfect bij je."
```

**Thoughtful swiper** (> 2.5s gemiddeld):
```
"Je neemt de tijd om details te bekijken. Ik zie een voorkeur voor verfijnde streetwear en monochrome elegantie."
```

#### 4. Color Trigger (Swipe 7)
Detecteert kleurvoorkeuren:
```
"Ik zie dat beige vaak terugkomt in wat je mooi vindt — rustige tinten en gestructureerde silhouetten?"
```

**Voorwaarde:** Duidelijke color pattern in liked photos

### Style Tag Translations

De analyzer vertaalt technical tags naar menselijke taal:

| Technical Tag | Nederlandse Beschrijving |
|--------------|--------------------------|
| `scandi_minimal` | strakke minimalistische looks |
| `italian_smart_casual` | gestructureerde smart casual |
| `street_refined` | verfijnde streetwear |
| `bohemian` | bohemian lagen en texturen |
| `preppy` | klassieke preppy stijl |
| `monochrome` | monochrome elegantie |
| `coastal` | luchtige coastal vibes |
| `bold` | gedurfde statement pieces |

### Color Recognition

Hex colors worden vertaald naar natuurlijke termen:

```typescript
'#F5F5DC' → 'beige'
'#8B7355' → 'camel'
'#2C3E50' → 'donkerblauw'
'#1C1C1C' → 'antraciet'
```

Gebruikt color distance calculation voor closest match.

## UI Components

### NovaBubble

Elegant floating feedback component:

```tsx
<NovaBubble
  message="Ik merk dat je houdt van rustige tinten..."
  onDismiss={() => setNovaInsight(null)}
  autoHideDuration={5000}
/>
```

**Features:**
- Framer Motion entry/exit animations
- Auto-hide na 5 seconden
- Manual dismiss met × button
- Sparkles icon voor Nova branding
- Speech bubble tail voor conversatie-feel
- Fixed positioning (top-center, below nav)

**Styling:**
- Premium surface card met border
- Soft shadow voor depth
- Primary color accent voor Nova avatar
- Responsive max-width

### Updated VisualPreferenceStep

Nu met real-time feedback:

```tsx
const analyzerRef = useRef(new SwipeAnalyzer());

const handleSwipe = async (direction, responseTimeMs) => {
  // 1. Add swipe to analyzer
  analyzerRef.current.addSwipe(currentPhoto, swipeRecord);

  // 2. Save to database
  await supabase.from('style_swipes').insert(swipeRecord);

  // 3. Generate insight (at swipe 3 & 7)
  const insight = analyzerRef.current.generateInsight(newSwipeCount);
  if (insight?.shouldShow) {
    setTimeout(() => setNovaInsight(insight.message), 600);
  }

  // 4. Advance to next photo
  setCurrentIndex(prev => prev + 1);
};
```

**Timing:**
- 600ms delay na swipe voordat insight verschijnt
- Geeft gebruiker tijd om visueel te resetten
- Insight toont tijdens volgende photo load

## Database Tracking

### `nova_swipe_insights` Tabel

```sql
CREATE TABLE nova_swipe_insights (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  insight_message text NOT NULL,
  insight_trigger text CHECK (IN ('color', 'style', 'speed', 'pattern')),
  confidence numeric CHECK (0-1),
  shown_at_swipe_count int,
  dismissed_at timestamptz,
  auto_hidden boolean,
  created_at timestamptz
);
```

**Purpose:**
- **Analytics** - Welke insights zijn effectief?
- **Personalization** - Learn when to show/hide
- **Quality** - Measure relevance over time

### Analytics Functions

#### Effectiveness Metrics
```sql
SELECT * FROM get_insight_effectiveness();
```

Returns:
```
trigger_type | total_shown | manually_dismissed | avg_confidence | dismissal_rate
-------------|-------------|-------------------|----------------|---------------
style        | 1240        | 320               | 0.756          | 0.258
speed        | 980         | 180               | 0.823          | 0.184
pattern      | 560         | 140               | 0.691          | 0.250
color        | 720         | 200               | 0.742          | 0.278
```

**Insights:**
- Low dismissal rate = good insight
- High dismissal rate = noisy or wrong
- Avg confidence tracks algorithm certainty

#### User History
```sql
SELECT * FROM get_user_insight_history(user_id, session_id);
```

Tracks all insights shown to user voor debugging/optimization.

## VisualPreferenceService Updates

New methods voor insight tracking:

```typescript
// Record een getoonde insight
await VisualPreferenceService.recordInsight({
  user_id: userId,
  insight_message: "Je houdt van rustige tinten...",
  insight_trigger: 'color',
  confidence: 0.85,
  shown_at_swipe_count: 3
});

// Dismiss tracking (wanneer user × klikt)
await VisualPreferenceService.dismissInsight(insightId);

// Haal insight history op
const history = await VisualPreferenceService.getInsightHistory(userId);

// Analytics: Wat werkt?
const effectiveness = await VisualPreferenceService.getInsightEffectiveness();
```

## Example Flows

### High-Confidence Style Match

```
Swipe 1: Italian Smart Casual → ❤️ (1.2s)
Swipe 2: Scandi Minimal → ❌ (0.8s)
Swipe 3: Italian Smart Casual → ❤️ (0.9s)

💬 Nova: "Ik merk dat je houdt van gestructureerde smart casual — klopt dat?"
```

**Analyzer State:**
- Style: italian_smart_casual (66% like rate)
- Avg response: 1.0s (decisive)
- Confidence: 0.3 (early, but strong signal)
- Trigger: style

### Thoughtful, Color-Focused

```
Swipe 1-6: Diverse likes met beige/camel dominant
Avg response time: 2.8s (thoughtful)
Swipe 7: ❤️

💬 Nova: "Je neemt de tijd om details te bekijken. Ik zie dat beige vaak terugkomt in wat je mooi vindt — rustige tinten en gestructureerde silhouetten?"
```

**Analyzer State:**
- Colors: #F5F5DC, #8B7355, #ECF0F1 (beige family)
- Avg response: 2.8s (thoughtful)
- Confidence: 0.7 (strong pattern)
- Trigger: color + speed

### Selective Swiper

```
Swipe 1: ❌
Swipe 2: ❌
Swipe 3: ❤️

💬 Nova: "Je bent selectief — ik zie dat je duidelijk weet wat je wél en niet wilt!"
```

**Analyzer State:**
- Like rate: 33% (selectief)
- Confidence: 0.3 (early)
- Trigger: pattern

## Benefits

### Voor Gebruikers
1. **Validation** - Nova bevestigt dat ze je begrijpt
2. **Engagement** - Conversatie voelt menselijk, niet robotisch
3. **Trust** - Transparantie over wat Nova observeert
4. **Confidence** - Weet dat recommendations gebaseerd zijn op echte inzichten

### Voor Nova AI
1. **Learning feedback** - Valideert of patterns kloppen
2. **Personality** - Conversational, warm, insightful
3. **Progressive disclosure** - Laat zien dat AI real-time leert
4. **Differentiation** - Niet alleen swipes, maar conversatie

### Voor Product
1. **Retention** - Menselijke conversatie verhoogt engagement
2. **Data quality** - Insights kunnen gevalideerd worden (toekomstig: yes/no feedback)
3. **Analytics** - Track welke insights resoneren
4. **Optimization** - A/B test verschillende insight types

## Toekomstige Uitbreidingen

### User Feedback op Insights
```tsx
<NovaBubble
  message="Ik merk dat je houdt van..."
  onValidate={(correct: boolean) => {
    // Track of insight klopte
    recordInsightValidation(insightId, correct);
  }}
/>
```

Hiermee kan Nova leren welke insights accuraat zijn.

### Adaptive Timing
Machine learning om optimale moment te bepateren:
- Sommige users willen meer insights
- Anderen vinden het distracting
- Learn per user preference

### Contextual Insights
Gebruik quiz answers voor rijkere insights:
```
"Je zei dat je casual-chic zoekt, en ik zie dat terug in je swipes — lichte kleuren met getailleerde snits."
```

### Multi-language Support
Vertaal insights naar Engels/Frans/Duits met behoud van warmth.

## Performance

- **Real-time** - Analyzer runs in-memory (geen API calls)
- **Lightweight** - Pattern detection is pure JS (< 50ms)
- **Async storage** - Database insert doesn't block UI
- **Batched** - Max 2 insights per session (geen spam)

## Security & Privacy

- **RLS enabled** - Users zie alleen eigen insights
- **Anonymous support** - Session-based tracking werkt
- **No PII** - Insights bevatten alleen style metadata
- **Opt-out** - Future: Users kunnen insights disablen

## Files

### New
- `/src/services/visualPreferences/swipeAnalyzer.ts` - Pattern detection engine (260 lines)
- `/src/components/quiz/NovaBubble.tsx` - Feedback UI component (60 lines)
- `/supabase/migrations/20251011_adaptive_feedback.sql` - Insight tracking schema

### Updated
- `/src/components/quiz/VisualPreferenceStep.tsx` - Integrated analyzer + NovaBubble
- `/src/services/visualPreferences/visualPreferenceService.ts` - Insight CRUD methods

## Testing

```tsx
import { SwipeAnalyzer } from '@/services/visualPreferences/swipeAnalyzer';

const analyzer = new SwipeAnalyzer();

// Simulate swipes
analyzer.addSwipe(photo1, { direction: 'right', response_time_ms: 1200 });
analyzer.addSwipe(photo2, { direction: 'left', response_time_ms: 800 });
analyzer.addSwipe(photo3, { direction: 'right', response_time_ms: 1100 });

// Check pattern
const pattern = analyzer.getPattern();
console.log('Dominant colors:', pattern.dominantColors);
console.log('Preferred styles:', pattern.preferredStyles);
console.log('Like rate:', pattern.likeRate);

// Generate insight
const insight = analyzer.generateInsight(3);
if (insight) {
  console.log('Nova says:', insight.message);
  console.log('Confidence:', insight.confidence);
  console.log('Trigger:', insight.trigger);
}
```

## Metrics to Track

1. **Insight show rate** - % of sessions that show insights
2. **Dismissal rate** - % of insights manually dismissed
3. **Avg confidence** - Algorithm certainty over time
4. **Time-to-dismiss** - How long before user closes insight
5. **Trigger distribution** - Which triggers fire most often
6. **User satisfaction** - (future) Thumbs up/down on insights

## Conclusie

Adaptive Feedback Loop maakt Nova **menselijk** en **conversationeel**. Gebruikers voelen dat ze gehoord worden, en Nova demonstreert real-time begrip. Dit verhoogt trust, engagement en satisfaction — en differentieert FitFi van generieke swipe-apps.
