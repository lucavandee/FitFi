# Nova Visual Preference Engine

## Overzicht

De Visual Preference Engine is een geavanceerd systeem dat Nova's matching-intelligentie verbetert door visuele voorkeuren vroeg in de quiz te leren. Gebruikers swipen door 10 moodfoto's, en elke swipe wordt een datapunt voor een embedding-model dat stijlvoorkeuren weegt.

## Architectuur

### Database Schema

#### `mood_photos` Tabel
Bevat gecureerde outfit-foto's met metadata:
- `image_url` - URL naar de foto
- `style_tags` - Stijlcategorieën (scandi_minimal, italian_smart_casual, etc.)
- `archetype_weights` - Gewicht per archetype voor embedding-berekening
- `color_palette` - Dominante kleuren in hex
- `occasion` - Gelegenheid (casual, work, formal, etc.)
- `season` - Seizoen
- `active` - Of foto in rotatie is
- `display_order` - Sorteervolgorde

#### `style_swipes` Tabel
Registreert gebruikersinteracties:
- `user_id` / `session_id` - Gebruiker of anonieme sessie
- `mood_photo_id` - FK naar mood_photos
- `swipe_direction` - 'left' (reject) of 'right' (like)
- `response_time_ms` - Reactietijd (voor confidence)

#### Uitbreiding `style_profiles`
- `visual_preference_embedding` - Berekende embedding van swipe-gedrag
- `swipe_session_completed` - Of swipe-fase voltooid is

### Embedding Berekening

De `compute_visual_preference_embedding()` functie:

1. **Aggregeert alle right-swipes** met hun archetype weights
2. **Weegt snelle reacties zwaarder**: Sneller swipen = meer zekerheid
   - Formule: `weight = base_weight × (1.0 + (3000 - response_ms) / 3000)`
3. **Normaliseert naar 0-100 schaal** voor consistentie
4. **Auto-trigger** via database trigger bij elke nieuwe swipe

Resultaat: Een JSON object zoals:
```json
{
  "scandi_minimal": 85.0,
  "classic": 60.5,
  "urban": 42.3
}
```

## Frontend Componenten

### SwipeCard
Interactieve swipe-kaart met:
- Drag-to-swipe functionaliteit (Framer Motion)
- Visuele feedback (groen/rood badges)
- Button fallbacks voor accessibility
- Progress indicator
- Animaties voor smooth UX

**Props:**
- `imageUrl` - URL van de moodfoto
- `onSwipe` - Callback met direction en responseTime
- `index` / `total` - Voor progress tracking

### VisualPreferenceStep
Quiz-stap die swipe-flow orkestreert:
- Laadt 10 moodfoto's uit database
- Toont SwipeCard per foto
- Tracks swipes naar database
- Berekent progress (10 swipes)
- Navigeert naar volgende stap na completion

**Integratie:**
```tsx
<VisualPreferenceStep
  onComplete={() => navigate('/quiz/next-step')}
  onSwipe={(photoId, direction) => console.log('Swiped', direction)}
/>
```

## Services

### VisualPreferenceService
Centrale API voor visual preference operaties:

```typescript
// Haal moodfoto's op
const photos = await VisualPreferenceService.getMoodPhotos(10);

// Registreer een swipe
await VisualPreferenceService.recordSwipe({
  user_id: userId,
  mood_photo_id: photoId,
  swipe_direction: 'right',
  response_time_ms: 1234
});

// Bereken embedding
const embedding = await VisualPreferenceService.computeVisualEmbedding(userId);

// Haal top archetypes
const top = VisualPreferenceService.getTopArchetypes(embedding, 3);
// => [{ archetype: 'scandi_minimal', score: 85 }, ...]

// Statistieken
const stats = await VisualPreferenceService.getSwipeStats(userId);
// => { total: 10, likes: 6, rejects: 4, avgResponseTime: 1500 }
```

## Nova Integratie

### NovaUserContext
Uitgebreid met visual preferences:

```typescript
export interface NovaUserContext {
  // ... bestaande velden
  visualPreferenceEmbedding?: VisualPreferenceEmbedding;
  swipeSessionCompleted?: boolean;
}
```

### System Prompt
Nova krijgt visuele voorkeuren in prompt:

```
USER PROFIEL:
- Stijl archetype: minimal × classic
- Visuele voorkeuren: scandi_minimal (85%), classic (61%), refined (50%)
- Kleurtoon: neutral undertone
- ...
```

### Context Headers
Visual prefs worden meegegeven als header:
```typescript
{
  "x-fitfi-visualprefs": '{"scandi_minimal": 85, "classic": 61}'
}
```

## Matching Engine

### Blending Algorithm
Visual preferences worden geblend met quiz-archetypes:

```typescript
function blendArchetypesWithVisualPreferences(
  baseMix: ArchetypeWeights,      // 60% weight
  visualPrefs: VisualPreferenceEmbedding, // 40% weight
  blendWeight = 0.4
): ArchetypeWeights
```

**Resultaat:**
- Basis archetype (uit quiz) blijft dominant (60%)
- Visual preferences verfijnen matching (40%)
- Meer naturele, consistente outfit-matches

### scoreAndFilterProducts()
Gebruikt geblende weights automatisch:

```typescript
const scored = scoreAndFilterProducts(products, {
  archetypeMix: userArchetypes,
  visualPreferenceEmbedding: userVisualPrefs,
  gender: 'male',
  limit: 50
});
```

## Flow

### Quiz Flow Integratie

```
Quiz Start
   ↓
3 Tekstvragen (archetype, goals, etc.)
   ↓
Visual Preference Step (10 swipes)
   ↓
Remaining questions (sizes, budget, etc.)
   ↓
Results met geoptimaliseerde matches
```

### Data Flow

```
User swipes right →
  save to style_swipes →
    trigger_update_visual_embedding() →
      compute_visual_preference_embedding() →
        update style_profiles.visual_preference_embedding →
          Nova fetches context →
            Nova system prompt includes visual prefs →
              Matching engine blends embeddings →
                Better outfit recommendations
```

## Bestanden

### Database
- `/supabase/migrations/20251011_visual_preference_engine.sql` - Schema
- `/supabase/migrations/20251011_seed_mood_photos.sql` - 10 curated photos

### Frontend
- `/src/components/quiz/SwipeCard.tsx` - Swipe UI component
- `/src/components/quiz/VisualPreferenceStep.tsx` - Quiz step orchestrator

### Services
- `/src/services/visualPreferences/visualPreferenceService.ts` - API wrapper

### Engine
- `/src/engine/matching.ts` - Matching met visual prefs
- `/src/services/nova/userContext.ts` - Nova context met embeddings

## Performance

- **Database triggers** - Real-time embedding updates
- **Normalized embeddings** - 0-100 scale voor snelle comparisons
- **GIN indexes** - Op style_tags en visual_preference_embedding
- **Response time weighting** - Snelle decisies = hogere confidence

## Security

- **RLS enabled** op beide nieuwe tabellen
- **User isolation** - Users kunnen alleen eigen swipes zien
- **Anonymous support** - Session-based swiping voor niet-ingelogde users
- **Public read** op mood_photos (gecureerde content)

## Toekomstige Uitbreidingen

1. **Dynamic photo rotation** - Machine learning voor best-performing photos
2. **A/B testing** - Test verschillende photo sets
3. **Seasonal updates** - Seizoensgebonden moodfoto's
4. **Brand preference learning** - Track welke merken vaak geliked worden
5. **Color palette extraction** - Visual prefs → color preferences
6. **Collaborative filtering** - "Gebruikers die dit liketen, liketen ook..."

## Testing

Run migrations:
```bash
# Lokaal
supabase db reset

# Of via MCP tool
mcp__supabase__apply_migration(...)
```

Test swipe flow:
```tsx
import { VisualPreferenceStep } from '@/components/quiz/VisualPreferenceStep';

function TestPage() {
  return (
    <VisualPreferenceStep
      onComplete={() => console.log('Completed!')}
      onSwipe={(id, dir) => console.log('Swiped', id, dir)}
    />
  );
}
```

Check embeddings in console:
```typescript
const embedding = await VisualPreferenceService.computeVisualEmbedding(userId);
console.log('Top archetypes:',
  VisualPreferenceService.getTopArchetypes(embedding, 3)
);
```

## Conclusie

De Visual Preference Engine biedt:
- **Betere matches** - Outfit recommendations voelen natuurlijker
- **Vroege inzichten** - Nova begrijpt visuele voorkeuren vanaf stap 1
- **Consistent gedrag** - Swipes + quiz = robuust profiel
- **Scalable architecture** - Ready voor ML & A/B testing
- **Privacy-first** - Anonieme swipes mogelijk, RLS enforced
