# Gender-Specifieke Stijlopties - Implementatie

**Status:** ✅ Geïmplementeerd
**Datum:** 2026-01-07
**Prioriteit:** Hoog

---

## 🎯 Probleem

De stijlopties in de onboarding quiz waren **te vrouwelijk georiënteerd**, waardoor mannelijke gebruikers zich niet aangesproken voelden.

### Voorbeelden van Problematische Opties:
- **"Bohemian"** - Typisch damesmode term, niet relevant voor mannen
- **"Romantisch"** - Zeer vrouwelijk, met "zachte stoffen, vrouwelijke details, pasteltinten"
- **"Stoer (Edgy)"** - Te algemeen, mannen associëren meer met "Rugged"

**Impact:**
- Verminderde relevantie van quiz voor mannen
- Lagere engagement van mannelijke gebruikers
- Potentieel hogere drop-off rate bij stap 2

---

## ✅ Oplossing

### 1. Dynamic Style Options Function

Nieuwe functie `getStyleOptionsForGender()` die gender-specifieke stijlopties retourneert:

```typescript
export const getStyleOptionsForGender = (gender?: string) => {
  const isFemale = gender === 'female';
  const isMale = gender === 'male';

  // Shared options (relevant voor alle genders)
  const sharedOptions = [
    { value: 'minimalist', label: 'Minimalistisch', ... },
    { value: 'classic', label: 'Klassiek', ... },
    { value: 'streetwear', label: 'Urban/Streetwear', ... }
  ];

  // Female-specific
  const femaleOptions = [
    { value: 'bohemian', label: 'Bohemien', ... },
    { value: 'romantic', label: 'Romantisch', ... },
    { value: 'edgy', label: 'Stoer (Edgy)', ... }
  ];

  // Male-specific
  const maleOptions = [
    { value: 'smart-casual', label: 'Smart Casual', ... },
    { value: 'athletic', label: 'Sportief/Athletic', ... },
    { value: 'rugged', label: 'Stoer/Rugged', ... }
  ];

  // Gender-neutral
  const neutralOptions = [
    { value: 'bohemian', label: 'Bohemien/Vrij', ... },
    { value: 'edgy', label: 'Stoer/Edgy', ... },
    { value: 'androgynous', label: 'Androgyn', ... }
  ];

  if (isMale) return [...sharedOptions, ...maleOptions];
  if (isFemale) return [...sharedOptions, ...femaleOptions];
  return [...sharedOptions, ...neutralOptions];
};
```

**Locatie:** `src/data/quizSteps.ts`

---

## 📊 Stijlopties per Gender

### Gedeelde Opties (Alle Genders)

| Value | Label | Beschrijving |
|-------|-------|--------------|
| `minimalist` | Minimalistisch | Clean lijnen, neutrale kleuren, eenvoud |
| `classic` | Klassiek | Tijdloze elegantie (aangepaste beschrijving per gender) |
| `streetwear` | Urban/Streetwear | Moderne streetstyle (aangepaste beschrijving per gender) |

### Vrouwelijke Opties

| Value | Label | Beschrijving |
|-------|-------|--------------|
| `bohemian` | Bohemien | Vrije, artistieke stijl met natuurlijke elementen en lagen |
| `romantic` | Romantisch | Zachte stoffen, vrouwelijke details, pasteltinten |
| `edgy` | Stoer (Edgy) | Rock-geïnspireerd met leer, jeans en statement-stukken |

**Totaal voor vrouwen:** 6 opties (3 gedeeld + 3 vrouwelijk)

### Mannelijke Opties (NIEUW)

| Value | Label | Beschrijving |
|-------|-------|--------------|
| `smart-casual` | Smart Casual | Verzorgd en relaxed: chino's, polo's, loafers |
| `athletic` | Sportief/Athletic | Sportieve esthetiek, functioneel, comfortabel |
| `rugged` | Stoer/Rugged | Robuuste materialen, outdoor-geïnspireerd, mannelijk |

**Totaal voor mannen:** 6 opties (3 gedeeld + 3 mannelijk)

### Gender-Neutrale Opties

| Value | Label | Beschrijving |
|-------|-------|--------------|
| `bohemian` | Bohemien/Vrij | Artistieke, vrije stijl met natuurlijke elementen |
| `edgy` | Stoer/Edgy | Statement pieces, leer, rock-geïnspireerd |
| `androgynous` | Androgyn | Gender-fluïde stijl, oversized fits, neutrale kleuren |

**Totaal voor non-binary:** 6 opties (3 gedeeld + 3 neutraal)

---

## 🔧 Implementatie Details

### 1. Quiz Steps Update

**Bestand:** `src/data/quizSteps.ts`

Stap 2 (stylePreferences) heeft nu **lege options array**:

```typescript
{
  id: 2,
  title: 'Wat zijn jouw stijlvoorkeuren?',
  description: 'Selecteer alle stijlen die je aanspreken (meerdere keuzes mogelijk)',
  field: 'stylePreferences',
  type: 'checkbox',
  required: true,
  // Note: options are dynamically generated based on gender via getStyleOptionsForGender()
  options: []
}
```

### 2. OnboardingFlowPage Update

**Bestand:** `src/pages/OnboardingFlowPage.tsx`

#### A. Import toegevoegd:
```typescript
import {
  quizSteps,
  getSizeFieldsForGender,
  getStyleOptionsForGender
} from "@/data/quizSteps";
```

#### B. Dynamic Step Function:
```typescript
const getCurrentStep = () => {
  const baseStep = quizSteps[currentStep];
  if (!baseStep) return null;

  // Inject dynamic style options based on selected gender
  if (baseStep.field === 'stylePreferences') {
    return {
      ...baseStep,
      options: getStyleOptionsForGender(answers.gender)
    };
  }

  // Inject dynamic size fields based on selected gender
  if (baseStep.field === 'sizes') {
    return {
      ...baseStep,
      sizeFields: getSizeFieldsForGender(answers.gender)
    };
  }

  return baseStep;
};

const step = getCurrentStep();
```

#### C. Null Safety:
```typescript
// In canProceed()
const canProceed = () => {
  if (!step) return false;
  // ... rest of function
};

// Early return in render
if (!step && phase === 'questions') {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-[var(--color-text)]">Quiz wordt geladen...</p>
      </div>
    </div>
  );
}
```

---

## 🎨 UX Verbeteringen

### Mannelijke Gebruikerservaring

**Voor:**
- Bohemian ❌ (niet relevant)
- Romantisch ❌ (niet relevant)
- Stoer (Edgy) ⚠️ (te algemeen)

**Na:**
- Smart Casual ✅ (herkenbaarheid: chino's, polo's)
- Sportief/Athletic ✅ (functioneel, comfortabel)
- Stoer/Rugged ✅ (outdoor, robuust, mannelijk)

### Vrouwelijke Gebruikerservaring

**Onveranderd** - Alle originele opties blijven beschikbaar:
- Bohemian ✅
- Romantisch ✅
- Stoer (Edgy) ✅

### Non-Binary / Prefer Not to Say

**Inclusief** - Mix van relevante opties:
- Bohemien/Vrij ✅ (artistiek, vrij)
- Stoer/Edgy ✅ (statement pieces)
- Androgyn ✅ (gender-fluïde, oversized)

---

## 📈 Verwachte Impact

### Positieve Effecten:

1. **Hogere Relevantie voor Mannen**
   - Herkenbare terminologie ("Smart Casual", "Rugged")
   - Beschrijvingen die aansluiten bij mannelijke kledingkeuzes

2. **Verhoogde Engagement**
   - Gebruikers voelen zich meer aangesproken
   - Betere quiz completion rate verwacht

3. **Nauwkeurigere Stijlprofielen**
   - Gender-specifieke opties leiden tot betere matches
   - Recommendation engine kan preciezer werken

4. **Inclusiviteit**
   - Non-binary gebruikers krijgen relevante opties
   - Gender-neutrale opties inclusief "Androgyn"

### Metrics to Track:

- [ ] Quiz completion rate per gender (voor/na)
- [ ] Time spent on step 2 per gender
- [ ] Drop-off rate at style preferences step
- [ ] User satisfaction scores
- [ ] Recommendation accuracy (via outfit ratings)

---

## 🧪 Testing

### Manual Testing Scenarios:

#### Test 1: Mannelijke Flow
1. Start quiz
2. Selecteer "Heren" bij gender
3. Ga naar stap 2
4. **Verwachting:** Zie Smart Casual, Athletic, Rugged (naast shared options)
5. **Verify:** Geen Bohemian, Romantisch

#### Test 2: Vrouwelijke Flow
1. Start quiz
2. Selecteer "Dames" bij gender
3. Ga naar stap 2
4. **Verwachting:** Zie Bohemien, Romantisch, Edgy (naast shared options)
5. **Verify:** Geen Smart Casual, Athletic, Rugged

#### Test 3: Non-Binary Flow
1. Start quiz
2. Selecteer "Non-binair" bij gender
3. Ga naar stap 2
4. **Verwachting:** Zie Bohemien/Vrij, Edgy, Androgyn (naast shared options)
5. **Verify:** Gender-neutrale labels

#### Test 4: Prefer Not to Say
1. Start quiz
2. Selecteer "Zeg ik liever niet"
3. Ga naar stap 2
4. **Verwachting:** Zie gender-neutrale opties
5. **Verify:** Inclusieve taalgebruik

#### Test 5: Back Navigation
1. Complete stap 1 (gender)
2. Complete stap 2 (style)
3. Ga terug naar stap 1
4. Wijzig gender
5. Ga naar stap 2
6. **Verwachting:** Nieuwe opties gebaseerd op nieuwe gender keuze

---

## 🔄 Backwards Compatibility

### Database Values

Alle nieuwe style values zijn **backwards compatible**:
- Oude waarden (`bohemian`, `romantic`, `edgy`) blijven bestaan
- Nieuwe waarden (`smart-casual`, `athletic`, `rugged`, `androgynous`) toegevoegd
- Bestaande user profiles blijven werken

### Migration Strategy

**Geen database migratie nodig** omdat:
1. Nieuwe waarden zijn additioneel, niet vervangende
2. Oude data blijft geldig
3. Recommendation engine ondersteunt beide sets

---

## 📋 Checklist

### Implementatie
- [x] `getStyleOptionsForGender()` functie gemaakt
- [x] Gender-specifieke opties gedefinieerd (male/female/neutral)
- [x] `quizSteps.ts` step 2 options leeg gemaakt
- [x] OnboardingFlowPage import toegevoegd
- [x] `getCurrentStep()` functie met dynamic injection
- [x] Null safety checks toegevoegd
- [x] Loading state voor ontbrekende step

### Testing
- [ ] Mannelijke flow getest
- [ ] Vrouwelijke flow getest
- [ ] Non-binary flow getest
- [ ] Prefer not to say flow getest
- [ ] Back navigation getest
- [ ] Mobile responsive getest
- [ ] Recommendation engine met nieuwe values getest

### Documentation
- [x] Implementatie gedocumenteerd
- [x] UX verbeteringen beschreven
- [x] Testing scenarios opgesteld
- [ ] Team briefing over nieuwe style options
- [ ] Customer support informed over nieuwe opties

---

## 🚀 Volgende Stappen

### Kort Termijn (Deze Week)
1. **Testing:** Volledige test suite doorlopen
2. **Analytics:** Event tracking toevoegen voor style option selecties per gender
3. **User Feedback:** A/B test opzetten (oude vs nieuwe opties voor mannen)

### Middellange Termijn (Volgende Sprint)
1. **Recommendation Tuning:** Algoritme aanpassen voor nieuwe style values
2. **Product Mapping:** Producten taggen met nieuwe style attributes
3. **Content:** Blog post over "Smart Casual voor Mannen" etc.

### Lange Termijn (Q2 2026)
1. **Personalization:** Machine learning model trainen op gender-specifieke voorkeuren
2. **Expansion:** Meer sub-stijlen toevoegen per gender
3. **Localization:** Style options vertalen voor internationale markten

---

## 💬 Feedback Loop

### User Feedback Channels:
- Post-quiz survey: "Waren de stijlopties relevant voor je?"
- Customer support tickets over quiz experience
- Analytics: Drop-off rates per gender at step 2

### Internal Feedback:
- Product team review (wekelijks)
- Data science team: recommendation accuracy metrics
- Customer success: user sentiment analysis

---

## 🎓 Lessons Learned

### What Went Well:
- **Modular Design:** `getStyleOptionsForGender()` pattern is herbruikbaar
- **Backwards Compatible:** Geen breaking changes voor bestaande data
- **Inclusive:** Non-binary opties toegevoegd zonder extra effort

### What to Improve:
- **Earlier Testing:** Gender bias had eerder ontdekt kunnen worden via user testing
- **Analytics First:** Tracking had vanaf dag 1 moeten bestaan
- **Documentation:** Style option definitions moeten in product specs

### Key Takeaway:
> **"Always design quiz questions with all user segments in mind. Gender, age, cultural background etc. What seems universal might be biased."**

---

## 📚 References

### Internal Docs:
- `src/data/quizSteps.ts` - Quiz stappen definitie
- `src/pages/OnboardingFlowPage.tsx` - Quiz implementatie
- `QUIZ_SPELLING_AUDIT.md` - Eerdere tekstverbeteringen

### External Resources:
- [Men's Fashion Terminology](https://www.gq.com/style/fashion-glossary)
- [Inclusive Design Patterns](https://inclusive-components.design/)
- [Gender-Neutral Fashion Terms](https://www.vogue.com/article/gender-neutral-fashion-glossary)

---

*Documentatie aangemaakt: 2026-01-07*
*Laatste update: 2026-01-07*
*Versie: 1.0*
*Auteur: FitFi Development Team*
