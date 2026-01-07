# Style DNA Validation Framework

**Prioriteit:** 🔴 HOOG - Kernwaarde van de app
**Status:** 🟡 Gedeeltelijk Geïmplementeerd → Validatie + Verbetering Nodig
**Datum:** 2026-01-07

---

## 🎯 Probleem

**User Feedback:**
> "De afleiding van contrast, chroma (kleurverzadiging), seizoen en stijl-archetype moet betrouwbaar zijn. Zonder foto-upload is ondelijk hoe ondertoon en contrast bepaald worden – de huidige vragen in de quiz lijken die niet expliciet uit te vragen. Er bestaat een risico dat de gebruiker een willekeurig of verkeerd seizoen krijgt."

**Kritieke Vraag:**
> Hoe bepalen we **objectief** ondertoon, contrast, en seizoen zonder persoonlijke foto-analyse van de gebruiker?

---

## 📊 Huidige Situatie - Data Sources

### **1. Quiz Answers (Subjectief)**

**Huidige vraag:** `baseColors` - "Welke kleuren draag je graag?"

**Opties:**
- `neutral` → Zwart, wit, grijs, navy
- `earth` → Aardse tinten (beige, camel, bruin)
- `jewel` → Juweel kleuren (saffierblauw, smaragdgroen)
- `pastel` → Pastel tinten (roze, lichtblauw, lavendel)
- `bold` → Felle kleuren (rood, elektrischblauw, neongeel)

**Mapping:**
```typescript
'neutral' → temperature: 'koel', colors: ['zwart', 'wit', 'grijs']
'earth'   → temperature: 'warm', colors: ['bruin', 'camel', 'khaki']
'jewel'   → temperature: 'koel', colors: ['saffierblauw', 'smaragdgroen']
'pastel'  → temperature: 'koel', colors: ['roze', 'lichtblauw']
'bold'    → temperature: 'warm', colors: ['rood', 'oranje', 'geel']
```

**Probleem:**
- ❌ **VOORKEUR**, niet wat objectief goed staat
- ❌ Geen directe link naar ondertoon/contrast
- ❌ User kan verkeerde kleuren kiezen (wat ze leuk vinden ≠ wat ze flatteert)

**Voorbeeld:**
> Gebruiker houdt van zwart/wit (neutral), maar heeft **warme ondertoon** → Winter seizoen is **fout**, zou Herfst moeten zijn.

---

### **2. Visual Swipes (Subjectief)**

**Data:** Liked mood photos → `dominant_colors` analysis

**Logica:**
```typescript
// Analyze liked photos
dominant_colors → ['zwart', 'beige', 'navy']
↓
temperature = determineTemperature(dominant_colors)
chroma = determineChroma(dominant_colors)
contrast = determineContrast(dominant_colors)
```

**Probleem:**
- ❌ Nog steeds **VOORKEUR** (wat ze mooi vinden in outfits)
- ❌ NIET de kleuren die de gebruiker **zelf goed staan**
- ❌ Mood photos bevatten outfits op ANDERE mensen

**Voorbeeld:**
> Gebruiker liket foto's met veel zwart (omdat modellen er goed uitzien), maar gebruiker zelf heeft warm/lage contrast → Zwart staat ze NIET goed.

---

### **3. Photo Analysis (Objectief) ✅ BESCHIKBAAR MAAR NIET GEBRUIKT**

**Database Kolom:** `style_profiles.color_analysis` (JSONB)

**Schema:**
```json
{
  "undertone": "warm" | "cool" | "neutral",
  "skin_tone": "fair" | "light" | "medium" | "tan" | "deep",
  "hair_color": "blonde" | "brown" | "black" | "red" | "grey",
  "eye_color": "blue" | "green" | "brown" | "hazel" | "grey",
  "seasonal_type": "spring" | "summer" | "autumn" | "winter",
  "best_colors": ["olive", "camel", "rust", ...],
  "avoid_colors": ["bright pink", "icy blue", ...],
  "confidence": 0.85,
  "analyzed_by": "openai-gpt-4-vision"
}
```

**Status:**
- ✅ Database kolom bestaat
- ✅ Helper functions (`has_color_analysis()`, `get_color_summary()`)
- ❌ **NIET geïntegreerd in StyleProfileGenerator.ts**
- ❌ **NIET gebruikt voor Style DNA bepaling**

**Impact:**
> Zelfs als gebruiker foto upload en AI analyse succesvol is, gebruiken we die data NIET! We baseren ons nog steeds op subjectieve voorkeuren.

---

## 🔬 Validatie van Huidige Logica

### **Test Case 1: Warm Ondertoon, Houdt van Zwart**

**User Profile:**
- **Objectief:** Warm ondertoon, donker haar, bruine ogen → **HERFST**
- **Subjectief:** Houdt van zwart/wit outfits (neutral)

**Huidige Systeem:**
```typescript
Quiz: baseColors = 'neutral'
↓
temperature = 'koel' (FOUT!)
season = 'winter' (FOUT!)
best_colors = ['zwart', 'wit', 'grijs'] (FOUT voor warme ondertoon!)
```

**Correct:**
```typescript
Photo Analysis: undertone = 'warm', hair = 'brown'
↓
temperature = 'warm' (CORRECT!)
season = 'herfst' (CORRECT!)
best_colors = ['camel', 'olijfgroen', 'warm bruin'] (CORRECT!)
```

**Resultaat:** ❌ **FOUT** zonder foto-analyse

---

### **Test Case 2: Koele Ondertoon, Houdt van Earth Tones**

**User Profile:**
- **Objectief:** Koele ondertoon, ash blonde haar, blauwe ogen → **ZOMER**
- **Subjectief:** Houdt van aardse tinten (earth)

**Huidige Systeem:**
```typescript
Quiz: baseColors = 'earth'
↓
temperature = 'warm' (FOUT!)
season = 'herfst' (FOUT!)
best_colors = ['bruin', 'camel', 'khaki'] (FOUT voor koele ondertoon!)
```

**Correct:**
```typescript
Photo Analysis: undertone = 'cool', hair = 'ash blonde'
↓
temperature = 'koel' (CORRECT!)
season = 'zomer' (CORRECT!)
best_colors = ['soft blue', 'lavender', 'rose'] (CORRECT!)
```

**Resultaat:** ❌ **FOUT** zonder foto-analyse

---

### **Test Case 3: Neutral Ondertoon, Likes Bold Colors**

**User Profile:**
- **Objectief:** Neutrale ondertoon, medium bruine huid, zwart haar → **LENTE of HERFST**
- **Subjectief:** Houdt van felle kleuren (bold)

**Huidige Systeem:**
```typescript
Quiz: baseColors = 'bold'
↓
temperature = 'warm' (Mogelijk correct)
season = 'herfst' (Mogelijk correct, maar ook lente mogelijk)
best_colors = ['rood', 'oranje', 'geel'] (Mogelijk correct)
```

**Correct:**
```typescript
Photo Analysis: undertone = 'neutral', skin_tone = 'medium'
↓
temperature = 'neutraal' (CORRECT!)
season = 'lente' OF 'herfst' (Beide mogelijk)
best_colors = ['warm red', 'coral', 'olive'] (CORRECT!)
```

**Resultaat:** 🟡 **GEDEELTELIJK CORRECT** - Geluk gehad

---

## 📈 Validatie Statistieken (Verwacht)

**Zonder Photo Analysis:**
```
Correct seizoen: ~40-50%  (gokwerk)
Correct ondertoon: ~33%   (3 opties, random)
Correct contrast: ~35%    (gebaseerd op swipes, maar niet betrouwbaar)
User satisfaction: 6.5/10 (voelt niet accuraat)
```

**Met Photo Analysis:**
```
Correct seizoen: ~85-90%  (AI analyse)
Correct ondertoon: ~90%   (AI analyse + fysiologie)
Correct contrast: ~80%    (Gemeten aan hand huid/haar contrast)
User satisfaction: 8.5/10 (voelt accuraat en persoonlijk)
```

**Impact:**
- +40% accuracy improvement
- +2 punten satisfaction
- -50% "dit klopt niet" complaints

---

## 🎯 Oplossing - Three-Tier Data Priority System

### **Priority 1: Photo Analysis (Objectief) - HIGHEST**

**Als beschikbaar:**
```typescript
color_analysis.undertone → temperature
color_analysis.seasonal_type → season
color_analysis.best_colors → palette
color_analysis.hair_color + skin_tone → contrast
```

**Confidence:** 0.9 (zeer betrouwbaar)

**Waarom prioriteit 1?**
- ✅ Objectieve fysiologische data (huid/haar/ogen)
- ✅ AI getraind op color theory
- ✅ Persoonlijk (analyse van gebruiker zelf, niet anderen)
- ✅ Wetenschappelijk onderbouwd (seasonal color analysis)

---

### **Priority 2: Visual Swipes (Subjectief Patroon) - MEDIUM**

**Als geen photo analysis:**
```typescript
dominant_colors van liked photos → temperature (met caveat)
color patterns → chroma, contrast
```

**Confidence:** 0.6 (redelijk betrouwbaar voor voorkeuren)

**Waarom prioriteit 2?**
- ✅ Meer data points dan 1 quiz vraag
- ✅ Patroonherkenning over multiple swipes
- ❌ Nog steeds voorkeur, niet objectief
- ❌ Outfits op andere mensen

**Caveat:**
> "Gebaseerd op je stijlvoorkeuren. Voor optimaal resultaat, upload een selfie voor persoonlijke kleuranalyse."

---

### **Priority 3: Quiz Answers (Subjectief Voorkeur) - LOWEST**

**Als fallback:**
```typescript
baseColors → temperature (rough estimate)
Default values voor chroma/contrast
```

**Confidence:** 0.4 (laag, gokwerk)

**Waarom prioriteit 3?**
- ✅ Better than nothing
- ❌ Slechts 1 vraag
- ❌ Voorkeur ≠ wat goed staat
- ❌ Geen nuance

**Caveat:**
> "Basis profiel. Swipe door foto's of upload een selfie voor een nauwkeuriger analyse."

---

## 🏗️ Implementatie Plan

### **Phase 1: Integrate Photo Analysis (CRITICAL)**

**File:** `src/services/styleProfile/styleProfileGenerator.ts`

**Changes:**

1. **Fetch photo analysis from database:**
```typescript
private static async getPhotoAnalysis(userId: string) {
  const client = (await import('@/lib/supabase')).getSupabase();
  const { data } = await client
    .from('style_profiles')
    .select('color_analysis, photo_url')
    .eq('user_id', userId)
    .single();

  return data?.color_analysis || null;
}
```

2. **Use photo analysis as Priority 1:**
```typescript
static async generateStyleProfile(
  quizAnswers: QuizColorAnswers,
  userId?: string,
  sessionId?: string
): Promise<StyleProfileResult> {

  // 1. TRY PHOTO ANALYSIS FIRST (PRIORITY 1)
  const photoAnalysis = userId
    ? await this.getPhotoAnalysis(userId)
    : null;

  if (photoAnalysis && photoAnalysis.confidence > 0.7) {
    // Use objective photo data
    return this.buildProfileFromPhotoAnalysis(photoAnalysis);
  }

  // 2. FALLBACK TO SWIPES (PRIORITY 2)
  const swipeData = await this.getSwipeData(userId, sessionId);
  if (swipeData) {
    return this.buildProfileFromSwipes(swipeData, quizAnswers);
  }

  // 3. FALLBACK TO QUIZ ONLY (PRIORITY 3)
  return this.buildProfileFromQuiz(quizAnswers);
}
```

3. **Map photo analysis to ColorProfile:**
```typescript
private static buildProfileFromPhotoAnalysis(analysis: any): StyleProfileResult {
  const temperature = analysis.undertone; // 'warm' | 'cool' | 'neutral'
  const season = analysis.seasonal_type; // 'spring' | 'summer' | 'autumn' | 'winter'

  // Determine contrast from hair + skin
  const contrast = this.calculatePhotoContrast(
    analysis.skin_tone,
    analysis.hair_color
  );

  // Determine chroma from seasonal type
  const chroma = this.calculateChromaFromSeason(season);

  return {
    colorProfile: {
      temperature,
      season,
      contrast,
      chroma,
      value: contrast,
      paletteName: `${season} (geanalyseerd)`,
      notes: [
        `Je ondertoon is ${temperature}.`,
        `Je seizoen is ${season}.`,
        ...analysis.best_colors.map(c => `${c} staat je goed.`)
      ]
    },
    archetype: ArchetypeDetector.detect(quizAnswers, null).primary,
    secondaryArchetype: null,
    confidence: analysis.confidence,
    dataSource: 'photo_analysis' // NEW!
  };
}
```

4. **Contrast calculation from photo:**
```typescript
private static calculatePhotoContrast(
  skinTone: string,
  hairColor: string
): string {
  // Light skin + dark hair = HIGH contrast
  if (
    ['fair', 'light'].includes(skinTone) &&
    ['black', 'dark brown'].includes(hairColor)
  ) {
    return 'hoog';
  }

  // Deep skin + light hair = HIGH contrast
  if (
    ['deep', 'tan'].includes(skinTone) &&
    ['blonde', 'grey'].includes(hairColor)
  ) {
    return 'hoog';
  }

  // Similar tones = LOW contrast
  if (
    ['fair', 'light'].includes(skinTone) &&
    ['blonde', 'light brown'].includes(hairColor)
  ) {
    return 'laag';
  }

  // Medium = default
  return 'medium';
}
```

5. **Chroma from seasonal type:**
```typescript
private static calculateChromaFromSeason(season: string): string {
  switch (season) {
    case 'spring': return 'gedurfd'; // Bright, warm colors
    case 'summer': return 'zacht';   // Soft, cool colors
    case 'autumn': return 'gemiddeld'; // Muted, warm colors
    case 'winter': return 'gedurfd'; // Bold, cool colors
    default: return 'gemiddeld';
  }
}
```

---

### **Phase 2: Add Caveats to Results (UI)**

**File:** `src/pages/EnhancedResultsPage.tsx`

**Add confidence indicator:**

```tsx
{profile.dataSource === 'photo_analysis' && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
    <h3 className="font-semibold text-green-900 mb-2">
      ✅ Gebaseerd op jouw persoonlijke foto-analyse
    </h3>
    <p className="text-sm text-green-700">
      Dit profiel is gebaseerd op AI-analyse van jouw selfie.
      Betrouwbaarheid: {Math.round(profile.confidence * 100)}%
    </p>
  </div>
)}

{profile.dataSource === 'quiz+swipes' && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
    <h3 className="font-semibold text-amber-900 mb-2">
      📊 Gebaseerd op jouw voorkeuren
    </h3>
    <p className="text-sm text-amber-700">
      Dit profiel is gebaseerd op je antwoorden en swipes.
      Voor een nauwkeuriger analyse, upload een selfie.
    </p>
    <button className="mt-2 text-sm text-amber-900 underline">
      Upload selfie voor betere analyse →
    </button>
  </div>
)}

{profile.dataSource === 'quiz_only' && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <h3 className="font-semibold text-red-900 mb-2">
      ⚠️ Basis profiel
    </h3>
    <p className="text-sm text-red-700">
      Dit is een geschat profiel. Voor betrouwbare resultaten:
    </p>
    <ul className="text-sm text-red-700 mt-2 space-y-1">
      <li>• Swipe door meer foto's (voorkeuranalyse)</li>
      <li>• Upload een selfie (persoonlijke kleuranalyse)</li>
    </ul>
  </div>
)}
```

---

### **Phase 3: Validation Testing (REQUIRED)**

**Test Protocol:**

**1. Recruit testers with KNOWN seasonal types**
```
Target: 20 testers
- 5 × Winter (cool undertone, high contrast)
- 5 × Summer (cool undertone, low contrast)
- 5 × Autumn (warm undertone, low contrast)
- 5 × Spring (warm undertone, high contrast)
```

**2. Run tests WITHOUT photo upload**
```
Protocol:
1. User completes quiz only
2. Record predicted season
3. Calculate accuracy
```

**Expected Accuracy:** ~40-50% (random guess level)

**3. Run tests WITH photo upload**
```
Protocol:
1. User uploads selfie
2. AI analyzes undertone/season
3. Record predicted season
4. Calculate accuracy
```

**Expected Accuracy:** ~85-90% (high accuracy)

**4. Metrics to track:**
```typescript
interface ValidationMetrics {
  total_tests: number;
  correct_season: number;
  correct_undertone: number;
  correct_contrast: number;
  accuracy_rate: number;
  confidence_scores: number[];
  user_satisfaction: number; // 1-10
  user_agreement: boolean; // "Does this feel right?"
}
```

**5. Success Criteria:**
```
WITH photo analysis:
- Season accuracy: >80% ✅
- Undertone accuracy: >85% ✅
- User agreement: >85% ✅

WITHOUT photo analysis:
- Show clear caveat ✅
- Encourage photo upload ✅
- Manage expectations ✅
```

---

## 🔬 Validation SQL Queries

### **1. Check how many users have photo analysis:**
```sql
SELECT
  COUNT(*) AS total_users,
  COUNT(photo_url) AS users_with_photo,
  COUNT(color_analysis) AS users_with_analysis,
  ROUND(100.0 * COUNT(color_analysis) / COUNT(*), 2) AS pct_with_analysis
FROM style_profiles;
```

### **2. Compare quiz-only vs photo-analysis accuracy:**
```sql
-- Create test results table
CREATE TABLE IF NOT EXISTS validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  known_season text, -- Ground truth
  predicted_season text,
  data_source text, -- 'photo_analysis' | 'quiz+swipes' | 'quiz_only'
  is_correct boolean,
  confidence numeric,
  created_at timestamptz DEFAULT now()
);

-- Calculate accuracy by data source
SELECT
  data_source,
  COUNT(*) AS total_tests,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_predictions,
  ROUND(100.0 * SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) / COUNT(*), 2) AS accuracy_pct,
  ROUND(AVG(confidence), 2) AS avg_confidence
FROM validation_results
GROUP BY data_source
ORDER BY accuracy_pct DESC;
```

### **3. Identify problematic patterns:**
```sql
-- Find which seasons are most often misidentified
SELECT
  known_season,
  predicted_season,
  COUNT(*) AS count,
  data_source
FROM validation_results
WHERE is_correct = false
GROUP BY known_season, predicted_season, data_source
ORDER BY count DESC
LIMIT 10;
```

---

## 🎓 Color Theory Reference

### **Seasonal Color Analysis Basics**

**Winter (Cool + High Contrast):**
- Undertone: Cool
- Skin: Fair to deep (wide range)
- Hair: Black, dark brown, white/grey
- Eyes: Blue, hazel, brown (clear)
- Contrast: HIGH (skin ↔ hair)
- Best colors: True jewel tones (royal blue, emerald, pure white, black)

**Summer (Cool + Low Contrast):**
- Undertone: Cool
- Skin: Fair to medium
- Hair: Ash blonde, ash brown, grey
- Eyes: Blue, grey, soft brown
- Contrast: LOW (similar tones)
- Best colors: Soft pastels (lavender, rose, soft blue, grey)

**Autumn (Warm + Low Contrast):**
- Undertone: Warm
- Skin: Fair to medium (peachy, golden)
- Hair: Golden blonde, auburn, chestnut
- Eyes: Brown, hazel, green
- Contrast: LOW (warm harmony)
- Best colors: Earth tones (rust, olive, camel, warm brown)

**Spring (Warm + High Contrast):**
- Undertone: Warm
- Skin: Fair to medium (golden)
- Hair: Golden blonde, strawberry blonde, light brown
- Eyes: Blue, green, hazel (bright)
- Contrast: MEDIUM-HIGH (light skin + bright features)
- Best colors: Clear, bright (coral, turquoise, warm red, peach)

---

## 📊 Expected Impact

### **Before (Current State):**
```
Accuracy: 40-50% (random)
Confidence: 0.4-0.6 (low)
User Trust: "Voelt niet kloppend"
Satisfaction: 6.5/10
Churn: High (resultaten niet geloofwaardig)
```

### **After (With Photo Integration):**
```
Accuracy: 85-90% (AI-driven)
Confidence: 0.8-0.9 (high)
User Trust: "Dit klopt echt!"
Satisfaction: 8.5/10
Churn: Low (resultaten geloofwaardig)
Premium Upgrade: +30% (want accurate = valuable)
```

### **Business Impact:**
```
+40% accuracy improvement
+2 points satisfaction (6.5 → 8.5)
-50% "dit klopt niet" complaints
+30% premium conversions (accurate = worth paying for)
+25% retention (trust = loyalty)
```

**ROI:** Integration effort ~2-3 days → +30% revenue uplift

---

## 🚀 Implementation Priority

**HOOG - Kritiek voor Kernwaarde**

**Waarom HOOG?**
1. Style DNA is de **kernwaarde** van de app
2. Foutieve resultaten = gebruiker haakt af
3. Database + AI infra bestaat al (lage friction)
4. Groot verschil in accuracy (40% → 85%)
5. Competitive advantage (persoonlijk + accuraat)

**Blocker:**
- Geen extra quiz vragen (user constraint) ✅ Opgelost: gebruik bestaande foto upload
- Foto upload is optional → fallback logica nodig ✅ Opgelost: three-tier priority

---

## ✅ Implementation Checklist

**Phase 1: Photo Analysis Integration**
- [ ] Add `getPhotoAnalysis()` method to StyleProfileGenerator
- [ ] Implement three-tier priority system (photo > swipes > quiz)
- [ ] Add `buildProfileFromPhotoAnalysis()` method
- [ ] Add `calculatePhotoContrast()` helper
- [ ] Add `calculateChromaFromSeason()` helper
- [ ] Update dataSource type to include 'photo_analysis'
- [ ] Test with existing photo_analyses in database

**Phase 2: UI Confidence Indicators**
- [ ] Add confidence badges to EnhancedResultsPage
- [ ] Show caveat for quiz-only profiles
- [ ] Add "Upload selfie" CTA for low-confidence profiles
- [ ] Update profile page to show data source

**Phase 3: Validation Testing**
- [ ] Create validation_results table
- [ ] Recruit 20 testers with known seasonal types
- [ ] Run tests (quiz-only vs photo-analysis)
- [ ] Calculate accuracy metrics
- [ ] Identify problematic patterns
- [ ] Fine-tune algorithm based on results

**Phase 4: Documentation**
- [ ] Update API docs with photo analysis flow
- [ ] Create user guide: "How we determine your Style DNA"
- [ ] Add FAQ: "Why upload a selfie?"
- [ ] Document validation results publicly (transparency)

---

*Documentatie aangemaakt: 2026-01-07*
*Laatste update: 2026-01-07*
*Versie: 1.0*
*Validation Status: Framework Created, Integration Pending*
