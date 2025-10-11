# Fase 4: Style Embedding Lock - Data-lock voor AI Engine

## Overzicht

Na quiz, swipes en calibration wordt een **immutable style embedding vector** gegenereerd die permanent de outfit generator voedt. Dit maakt Nova's aanbevelingen menselijker — ze leren van keuzes, niet van clichés.

## Waarom Een Lock?

### Probleem: Unstable Recommendations
Zonder lock:
- Recommendations veranderen random tussen sessies
- User preferences drift zonder tracking
- Geen audit trail waarom outfits werden aanbevolen
- A/B testing onmogelijk (geen baseline)

### Oplossing: Immutable Embedding
Met lock:
- **Stable**: Zelfde profiel = zelfde style recommendations
- **Versioned**: Track hoe preferences evolueren over tijd
- **Transparent**: Altijd duidelijk wat recommendations beïnvloedt
- **Auditable**: Complete history van embedding changes

## Architecture

### Database Schema

#### Extended `style_profiles`
```sql
ALTER TABLE style_profiles ADD COLUMN:
  - embedding_locked_at (timestamptz) - When finalized
  - embedding_version (int) - Version number
  - locked_embedding (jsonb) - Immutable final vector
  - embedding_sources (jsonb) - Breakdown: quiz/swipes/calibration weights
```

#### New Table: `style_embedding_snapshots`
```sql
CREATE TABLE style_embedding_snapshots (
  id uuid PRIMARY KEY,
  user_id uuid,
  style_profile_id uuid,
  version int,
  embedding jsonb, -- The actual vector at this point
  sources jsonb, -- { quiz: 0.40, swipes: 0.35, calibration: 0.25 }
  snapshot_trigger text, -- quiz_complete | swipes_complete | calibration_complete
  created_at timestamptz
);
```

**Purpose:** Historical trail van hoe embedding evolueert

### Embedding Composition Formula

```
Final Embedding = 
  Quiz Archetype (40%) +
  Visual Swipes (35%) +
  Calibration Feedback (25%)
```

**Example Calculation:**
```
Quiz says: "classic" archetype → classic: 60
Swipes show: scandi_minimal liked often → scandi_minimal: 85
Calibration: "Spot on" on minimal outfit → minimal: +15 boost

Final Locked Embedding:
{
  "classic": 72.5,      // (60 * 0.4) + (0 * 0.35) + (boost)
  "scandi_minimal": 80,  // (0 * 0.4) + (85 * 0.35) + (0)
  "minimal": 65         // (0 * 0.4) + (50 * 0.35) + (15 boost * 0.25)
}
```

## Core Functions

### compute_final_embedding()
Berekent finale embedding (nog niet locked):

```sql
SELECT compute_final_embedding(user_id);
→ Returns: { "classic": 72.5, "scandi_minimal": 80, ... }
```

**Logic:**
1. Start met quiz archetype (40% weight, base score 60)
2. Add visual swipes embedding (35% weight)
3. Apply calibration adjustments (25% weight)
4. Normalize all scores to 0-100 range

### lock_style_embedding()
Locks embedding na calibration:

```sql
SELECT lock_style_embedding(user_id);
→ Locks current embedding + creates snapshot
```

**Side Effects:**
1. Updates `style_profiles.locked_embedding`
2. Sets `embedding_locked_at` timestamp
3. Increments `embedding_version`
4. Creates snapshot in `style_embedding_snapshots`
5. Records `embedding_sources` breakdown

**Immutability:** Eenmaal locked, wordt embedding NIET automatisch aangepast

### get_embedding_stability()
Analytics: hoe stabiel zijn user preferences?

```sql
SELECT * FROM get_embedding_stability(user_id);
→ Returns history with stability_score (1.0 = zeer stabiel)
```

**Stability Metric:**
- Compares consecutive snapshots
- Counts archetypes met < 10 point change
- Score: unchanged / total archetypes
- 1.0 = zeer stabiel, 0.0 = compleet veranderd

## Service Layer (EmbeddingService)

### Key Methods

```typescript
// Compute (doesn't lock)
const embedding = await EmbeddingService.computeFinalEmbedding(userId);

// Lock permanently
const locked = await EmbeddingService.lockEmbedding(userId);

// Get locked embedding (for outfit generation)
const vector = await EmbeddingService.getLockedEmbedding(userId);
// → Used by recommendation engine

// Get full profile with metadata
const profile = await EmbeddingService.getLockedProfile(userId);
// → { locked_embedding, embedding_sources, version, ... }

// Check if locked
const isLocked = await EmbeddingService.isEmbeddingLocked(userId);

// Get history
const history = await EmbeddingService.getEmbeddingHistory(userId);
// → All snapshots over time

// Get stability metrics
const stability = await EmbeddingService.getStabilityMetrics(userId);

// Compare two embeddings
const comparison = EmbeddingService.compareEmbeddings(embed1, embed2);
// → { similarity: 85, changed_archetypes: ['minimal'], ... }
```

### Utility Methods

```typescript
// Get top 3 archetypes with percentages
const top = EmbeddingService.getTopArchetypes(embedding, 3);
// → [{ archetype: 'classic', score: 85, percentage: 35 }, ...]

// Format for display
const display = EmbeddingService.formatEmbeddingForDisplay(embedding);
// → "classic (35%) • scandi minimal (30%) • minimal (20%)"

// Get influence breakdown
const influence = await EmbeddingService.getInfluenceBreakdown(userId);
// → { quiz_influence: 0.40, swipes_influence: 0.35, calibration_influence: 0.25 }
```

## Recommendation Engine Integration

### New Path: embeddingBasedRecommendation.ts

**Core Function:**
```typescript
import { generateRecommendationsFromEmbedding } from '@/engine/embeddingBasedRecommendation';

const lockedEmbedding = await EmbeddingService.getLockedEmbedding(userId);

const outfits = generateRecommendationsFromEmbedding(
  lockedEmbedding,
  products,
  {
    count: 5,
    occasion: 'work',
    priceRange: { min: 50, max: 150 },
    gender: 'male'
  }
);
```

**Benefits:**
- Consistent recommendations (same embedding = same style)
- Explainable (clear archetype weights)
- Fast (no re-computation per request)
- Testable (locked vector = repeatable results)

### Explanation Generation

```typescript
const explanation = explainOutfitMatch(outfit, lockedEmbedding);
// → "Deze outfit combineert minimal • classic — perfect voor jouw
//    voorkeur voor scandi minimal."
```

### Quality Validation

```typescript
const validation = validateOutfitAgainstEmbedding(outfit, lockedEmbedding);
// → { isGoodMatch: true, confidence: 85, issues: [] }
```

Used for:
- Filter out bad matches
- A/B test recommendation quality
- User feedback correlation

### Individual Product Recommendations

```typescript
const topTops = getTopProductsFromEmbedding(
  lockedEmbedding,
  products,
  'top',
  10
);
// → [{ product, score, matchReason }, ...]
```

## Complete Flow

```
1. User completes Quiz
   └─ Creates base archetype (classic: 60)

2. User swipes 10 mood photos
   └─ Generates visual_preference_embedding
   └─ Snapshot: "swipes_complete"

3. User rates 3 calibration outfits
   └─ Computes calibration_adjustments
   └─ Snapshot: "calibration_complete"

4. ✨ LOCK EMBEDDING ✨
   └─ Calls lock_style_embedding(user_id)
   └─ Computes: quiz (40%) + swipes (35%) + calibration (25%)
   └─ Stores in style_profiles.locked_embedding
   └─ Creates final snapshot

5. Generate Outfits (Results Page)
   └─ Loads locked_embedding
   └─ generateRecommendationsFromEmbedding()
   └─ Returns consistent, stable outfits

6. User returns later
   └─ Same locked_embedding used
   └─ Same style recommendations
   └─ Consistent experience
```

## Versioning & Evolution

### When To Create New Version?

**Automatic:**
- After calibration complete (first lock)

**Manual:**
- User explicitly updates preferences
- Re-takes quiz after 6 months
- Feedback indicates major style change

**Never:**
- Random session re-entry
- Different device login
- Outfit likes/dislikes (tracked separately)

### Version Comparison

```typescript
const history = await EmbeddingService.getEmbeddingHistory(userId);

// Compare v1 vs v2
const v1 = history.find(s => s.version === 1).embedding;
const v2 = history.find(s => s.version === 2).embedding;

const comparison = EmbeddingService.compareEmbeddings(v1, v2);
console.log('Similarity:', comparison.similarity); // 78%
console.log('Changed:', comparison.changed_archetypes); // ['minimal']
console.log('New:', comparison.new_archetypes); // ['bohemian']
console.log('Removed:', comparison.removed_archetypes); // []
```

### Stability Tracking

```sql
SELECT * FROM get_embedding_stability(user_id);
```

Output:
```
version | created_at | stability_score
--------|------------|----------------
1       | 2025-01-15 | 1.0  (baseline)
2       | 2025-03-20 | 0.85 (15% change)
3       | 2025-06-10 | 0.92 (8% change)
```

**Insights:**
- Stability > 0.9 = zeer consistente preferences
- Stability < 0.7 = major style evolution
- Use voor personalization adjustments

## Analytics Capabilities

### User-Level

```sql
-- Get locked embedding
SELECT locked_embedding, embedding_locked_at, embedding_version
FROM style_profiles
WHERE user_id = ? AND embedding_locked_at IS NOT NULL;

-- Get all snapshots
SELECT version, embedding, snapshot_trigger, created_at
FROM style_embedding_snapshots
WHERE user_id = ?
ORDER BY version;

-- Stability over time
SELECT * FROM get_embedding_stability(?);
```

### Aggregate Analytics

```sql
-- Most common archetypes across all users
SELECT
  archetype,
  COUNT(*) as user_count,
  AVG((locked_embedding->>archetype)::numeric) as avg_score
FROM style_profiles,
     LATERAL jsonb_each(locked_embedding)
WHERE embedding_locked_at IS NOT NULL
GROUP BY archetype
ORDER BY user_count DESC;

-- Average lock time after quiz start
SELECT
  AVG(
    EXTRACT(EPOCH FROM embedding_locked_at - created_at) / 60
  ) as avg_minutes_to_lock
FROM style_profiles
WHERE embedding_locked_at IS NOT NULL;

-- Embedding stability distribution
WITH stability AS (
  SELECT user_id, MAX(stability_score) as max_stability
  FROM get_embedding_stability(user_id)
  GROUP BY user_id
)
SELECT
  CASE
    WHEN max_stability >= 0.9 THEN 'Very Stable'
    WHEN max_stability >= 0.7 THEN 'Moderately Stable'
    ELSE 'Volatile'
  END as stability_category,
  COUNT(*) as user_count
FROM stability
GROUP BY stability_category;
```

## Benefits

### For Users
1. **Consistency** - Recommendations don't change randomly
2. **Transparency** - Can see what influences their style profile
3. **Control** - Clear when preferences are locked vs fluid
4. **Evolution** - Can track how taste changes over time

### For Business
1. **Quality** - Locked vectors = repeatable, testable recommendations
2. **Analytics** - Clear data on user preference patterns
3. **A/B Testing** - Stable baseline for experiments
4. **Debugging** - Audit trail for recommendation issues

### For AI
1. **Stability** - No drift in model behavior
2. **Explainability** - Clear archetype weights
3. **Feedback Loop** - Lock → Recommend → Measure → Improve
4. **Data-Driven** - Learns from actual choices, not assumptions

## Future Extensions

### Re-Lock Mechanism
```typescript
// Allow users to re-calibrate after X months
if (monthsSinceLock > 6) {
  showRecalibrationPrompt();
}

// Or after significant feedback
if (negativeOutfitFeedback > 5) {
  suggestRecalibration();
}
```

### Micro-Adjustments
```typescript
// Small adjustments WITHOUT full re-lock
applyMicroAdjustment(userId, {
  archetype: 'minimal',
  delta: +5 // Small boost based on likes
});
// Updates locked_embedding, keeps version same
```

### Seasonal Variations
```typescript
// Store seasonal sub-embeddings
{
  "base": { "classic": 85, ... },
  "winter": { "classic": 90, "minimal": 70, ... },
  "summer": { "classic": 75, "bohemian": 65, ... }
}
```

### Occasion-Specific
```typescript
// Different embeddings per context
{
  "work": { "classic": 95, "refined": 80 },
  "casual": { "minimal": 90, "street_refined": 70 },
  "date": { "romantic": 85, "elegant": 75 }
}
```

## Testing

### Unit Tests
```typescript
describe('EmbeddingService', () => {
  it('locks embedding correctly', async () => {
    const locked = await EmbeddingService.lockEmbedding(testUserId);
    expect(locked).toHaveProperty('classic');
    expect(locked.classic).toBeGreaterThan(0);
  });

  it('compares embeddings accurately', () => {
    const e1 = { classic: 80, minimal: 60 };
    const e2 = { classic: 85, minimal: 55 };
    const comp = EmbeddingService.compareEmbeddings(e1, e2);
    expect(comp.similarity).toBeGreaterThan(90);
  });
});
```

### Integration Test
```typescript
// Complete flow
await completeQuiz(userId);
await completeSwipes(userId);
await completeCalibration(userId);

const locked = await EmbeddingService.lockEmbedding(userId);
expect(locked).toBeDefined();

const outfits = generateRecommendationsFromEmbedding(locked, products);
expect(outfits.length).toBeGreaterThan(0);

// Same embedding = same outfits
const outfits2 = generateRecommendationsFromEmbedding(locked, products);
expect(outfits[0].id).toBe(outfits2[0].id);
```

## Files

### Database
- `/supabase/migrations/20251011_style_embedding_lock.sql` (379 lines)
  - Extends style_profiles
  - Creates style_embedding_snapshots
  - compute_final_embedding()
  - lock_style_embedding()
  - get_embedding_stability()

### Services
- `/src/services/visualPreferences/embeddingService.ts` (386 lines)
  - Complete API voor embedding management
  - Lock, compute, get, compare methods
  - Analytics helpers

### Engine
- `/src/engine/embeddingBasedRecommendation.ts` (261 lines)
  - New recommendation path using locked embeddings
  - generateRecommendationsFromEmbedding()
  - explainOutfitMatch()
  - validateOutfitAgainstEmbedding()

## Metrics to Track

1. **Lock Success Rate** - % users who reach lock
2. **Time to Lock** - Avg minutes from quiz start to lock
3. **Embedding Stability** - Avg stability score across users
4. **Recommendation Consistency** - Same embedding → same outfits?
5. **Version Evolution** - How often users update embedding
6. **Archetype Distribution** - Most common locked archetypes

## Conclusie

Style Embedding Lock is de **foundation voor betrouwbare AI-recommendations**:

- **Quiz** geeft intent (wat ze denken dat ze willen)
- **Swipes** geven reality (wat ze echt mooi vinden)
- **Calibration** geeft validation (wat ze definitief willen)
- **Locked Embedding** geeft stability (consistent profiel voor recommendations)

Resultaat: **Menselijke recommendations gebaseerd op keuzes, niet clichés.**
