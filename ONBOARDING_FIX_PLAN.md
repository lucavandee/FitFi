# FitFi Onboarding Fix Plan

## PRIORITEIT 1: Data Schema Alignment (CRITICAL)

### 1.1 Voeg ontbrekende quiz vragen toe

**Toevoegen aan `quizSteps.ts`:**

```typescript
{
  id: 8,
  title: 'Welke pasvorm prefereer je?',
  field: 'fit',
  type: 'radio',
  required: true,
  options: [
    { value: 'slim', label: 'Slim fit', description: 'Nauw aansluitend, tailored look' },
    { value: 'regular', label: 'Regular fit', description: 'Comfortabel, niet te strak' },
    { value: 'relaxed', label: 'Relaxed fit', description: 'Losse, comfortabele pasvorm' },
    { value: 'oversized', label: 'Oversized', description: 'Ruim, streetwear stijl' }
  ]
},
{
  id: 9,
  title: 'Welke materialen spreken je aan?',
  field: 'materials',
  type: 'checkbox',
  required: false,
  options: [
    { value: 'katoen', label: 'Katoen', description: 'Natuurlijk, ademend' },
    { value: 'wol', label: 'Wol', description: 'Warm, luxe' },
    { value: 'denim', label: 'Denim', description: 'Casual, robuust' },
    { value: 'fleece', label: 'Fleece', description: 'Zacht, sportief' },
    { value: 'tech', label: 'Tech fabrics', description: 'Performance materialen' }
  ]
},
{
  id: 10,
  title: 'Wat zijn je stijldoelen?',
  field: 'goals',
  type: 'multiselect',
  required: true,
  options: [
    { value: 'timeless', label: 'Tijdloze garderobe', description: 'Stukken die jaren meegaan' },
    { value: 'trendy', label: 'On-trend blijven', description: 'Laatste fashion trends volgen' },
    { value: 'minimalist', label: 'Minimalistisch', description: 'Minder is meer' },
    { value: 'express', label: 'Mezelf uitdrukken', description: 'Unieke statement pieces' },
    { value: 'professional', label: 'Professioneel ogen', description: 'Werk/carrière focus' }
  ]
}
```

### 1.2 Fix color field mapping

**In `quizSteps.ts`, wijzig regel 104:**

```typescript
// VOOR:
field: 'baseColors',

// NA:
field: 'colorPreference',  // Match met StyleProfileGenerator
```

**OF update StyleProfileGenerator.ts regel 165:**

```typescript
// VOOR:
const colorPref = answers.colorPreference || answers.colors || answers.colorTemp;

// NA:
const colorPref = answers.baseColors || answers.colorPreference || answers.colors || answers.colorTemp;
```

---

## PRIORITEIT 2: Fix Mood Photos Gender Filtering

### 2.1 Update getMoodPhotos met gender filter

**In `visualPreferenceService.ts` regel 52-70:**

```typescript
static async getMoodPhotos(
  limit = 10,
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
): Promise<MoodPhoto[]> {
  const client = this.getClient();
  if (!client) return [];

  let query = client
    .from('mood_photos')
    .select('*')
    .eq('active', true);

  // ✅ NIEUW: Filter op gender
  if (gender === 'male') {
    query = query.in('gender', ['male', 'unisex']);
  } else if (gender === 'female') {
    query = query.in('gender', ['female', 'unisex']);
  } else {
    // non-binary of prefer-not-to-say: toon alles
    query = query.eq('gender', 'unisex');
  }

  query = query
    .order('display_order', { ascending: true })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch mood photos:', error);
    throw error;
  }

  return data || [];
}
```

### 2.2 Update VisualPreferenceStep component

**In `OnboardingFlowPage.tsx` regel 497-500:**

```typescript
<VisualPreferenceStep
  onComplete={handleSwipesComplete}
  userGender={answers.gender as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'}
/>
```

Zorg dat deze prop wordt doorgegeven aan `getMoodPhotos()`.

---

## PRIORITEIT 3: Fix Visual Embedding

### 3.1 Zorg dat embedding wordt berekend EN opgeslagen

**In `OnboardingFlowPage.tsx` na regel 392:**

```typescript
if (syncSuccess && answers.visualPreferencesCompleted && answers.calibrationCompleted) {
  try {
    // ✅ EERST compute embedding
    const embedding = await VisualPreferenceService.computeVisualEmbedding(userId, sessionId);
    console.log('✅ Visual embedding computed:', embedding);

    // ✅ DAN update style_profiles met embedding
    await client
      .from('style_profiles')
      .update({
        visual_preference_embedding: embedding,
        visual_preference_completed_at: new Date().toISOString()
      })
      .eq(userId ? 'user_id' : 'session_id', userId || sessionId);

    // ✅ DAN lock embedding
    await EmbeddingService.lockEmbedding(userId, sessionId);
    console.log('✅ Embedding locked successfully!');
  } catch (lockError) {
    console.error('⚠️ Failed to save/lock embedding:', lockError);
  }
}
```

### 3.2 Check database function

Verifieer dat `compute_visual_preference_embedding()` functie correct is:

```sql
-- Test de functie
SELECT compute_visual_preference_embedding(
  p_user_id := 'USER_ID_HERE',
  p_session_id := NULL
);
```

---

## PRIORITEIT 4: Gebruik Photo Analysis in Outfit Generation

### 4.1 Voeg photo_analysis toe aan filter criteria

**In `recommendationEngine.ts` regel 85-105:**

```typescript
export function generateRecommendationsFromAnswers(
  answers: Record<string, any>,
  products: Product[],
  count: number = 3,
  photoAnalysis?: any  // ✅ NIEUW PARAM
): Outfit[] {
  console.log('[RecommendationEngine] Starting with', products.length, 'products');

  // ✅ Gebruik photo analysis voor color filtering
  if (photoAnalysis?.dominant_colors) {
    console.log('[RecommendationEngine] Using photo color analysis:', photoAnalysis.dominant_colors);
    // TODO: Filter products op kleur-compatibiliteit
  }

  const filterCriteria: FilterCriteria = {
    gender: answers.gender,
    budget: answers.budget,
    colorProfile: photoAnalysis?.dominant_colors,  // ✅ NIEUW
  };

  // ... rest van code
}
```

### 4.2 Update productFiltering.ts

Voeg color filtering toe op basis van photo analysis.

---

## PRIORITEIT 5: Voeg style_tags toe aan mood_photos

### 5.1 Database migration

```sql
-- Optie A: Voeg style_tags kolom toe (als aparte kolom gewenst)
ALTER TABLE mood_photos
ADD COLUMN IF NOT EXISTS style_tags text[] DEFAULT '{}';

-- Optie B: Gebruik bestaande mood_tags als style_tags
-- Geen wijziging nodig, update code om mood_tags te gebruiken
```

### 5.2 Update ArchetypeDetector.ts regel 252-258

```typescript
// VOOR:
if (photo.style_tags && Array.isArray(photo.style_tags)) {
  styleTags.push(...photo.style_tags);
}

// NA:
// ✅ Gebruik mood_tags als primary source
if (photo.mood_tags && Array.isArray(photo.mood_tags)) {
  styleTags.push(...photo.mood_tags);
}
// Optioneel: ook style_tags als die bestaat
if (photo.style_tags && Array.isArray(photo.style_tags)) {
  styleTags.push(...photo.style_tags);
}
```

---

## IMPLEMENTATIE VOLGORDE

1. **Week 1 - Quick Wins:**
   - ✅ Fix gender filtering op mood photos (2.1, 2.2)
   - ✅ Fix style_tags → mood_tags mapping (5.2)
   - ✅ Fix baseColors → colorPreference mapping (1.2)

2. **Week 2 - Data Flow:**
   - ✅ Fix visual embedding opslag (3.1, 3.2)
   - ✅ Voeg ontbrekende quiz vragen toe (1.1)
   - ✅ Test complete flow end-to-end

3. **Week 3 - Photo Integration:**
   - ✅ Gebruik photo analysis in outfit generation (4.1, 4.2)
   - ✅ Test color compatibility filtering
   - ✅ A/B test met/zonder photo analysis

4. **Week 4 - Refinement:**
   - ✅ Monitor embedding quality
   - ✅ Tune archetype detection weights
   - ✅ Optimize mood photo selection algorithm

---

## VALIDATIE CHECKS

Na elke fix, verifieer:

```typescript
// 1. Check dat alle quiz answers worden gebruikt
console.log('[Validation] Quiz answers used:', {
  gender: used ✓,
  stylePreferences: used ✓,
  baseColors: used ✓,
  bodyType: used ✓,
  occasions: used ✓,
  budget: used ✓,
  fit: used ✓,        // ✅ NIEUW
  materials: used ✓,  // ✅ NIEUW
  goals: used ✓       // ✅ NIEUW
});

// 2. Check dat embedding wordt opgeslagen
const profile = await supabase
  .from('style_profiles')
  .select('visual_preference_embedding')
  .eq('user_id', userId)
  .single();

console.log('[Validation] Embedding saved:',
  Object.keys(profile.data.visual_preference_embedding).length > 0 ? '✅' : '❌'
);

// 3. Check dat mood photos gender-gefilterd zijn
const photos = await getMoodPhotos(10, 'female');
const hasCorrectGender = photos.every(p =>
  p.gender === 'female' || p.gender === 'unisex'
);
console.log('[Validation] Gender filter works:', hasCorrectGender ? '✅' : '❌');
```

---

## METRICS

Meet voor/na verbetering:

- **Archetype confidence**: vóór vs na (verwacht: +20-30%)
- **Outfit match score**: vóór vs na (verwacht: +15-25%)
- **User satisfaction**: survey na onboarding (target: 4.5/5)
- **Completion rate**: % users die volledige flow afmaken
- **Time to complete**: gemiddelde duur (target: <5 min)
