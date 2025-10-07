# Quiz Audit: Nova Requirements vs Current Quiz

## Executive Summary

**Status:** 🟡 CRITICAL GAPS FOUND

**Missing from Quiz:**
1. ❌ **Gender** (absoluut noodzakelijk!)
2. ❌ **Body Type** (voor fit adviezen)
3. ❌ **Maten** (tops, broeken, schoenen)
4. ❌ **Budget range** (min/max per item)
5. ❌ **Preferred brands** (Nike, Adidas, etc.)
6. ⚠️ **Age range** (optional maar waardevol)

---

## What Nova NEEDS vs What Quiz ASKS

### 1. Gender (CRITICAL) ❌ MISSING

**Why Nova needs it:**
```typescript
// Nova prompt line 334-343:
KRITIEKE REGEL - GENDER:
${!userContext.gender ? `
⚠️ GENDER IS ONBEKEND - MAAK GEEN AANNAMES!
- Vraag EERST: "Voor wie zoek je een outfit?"
- Gebruik gender-neutrale taal tot bevestigd
` : `
✅ Gender bekend: ${userContext.gender}
- Pas taalgebruik aan (hij/zij/hen)
- Filter producten op juiste categorie
`}
```

**Current quiz:** ❌ Vraagt NIET naar gender

**Impact:**
- Nova weet niet of het heren/dames/unisex moet adviseren
- Moet elke keer vragen "voor wie is dit?"
- Kan niet filteren op product gender

**Solution:** Voeg toe als EERSTE quiz stap (na intro)

---

### 2. Body Type (HIGH PRIORITY) ❌ MISSING

**Why Nova needs it:**
```typescript
// Nova uses for fit recommendations:
- "Voor jouw inverted triangle lichaam raad ik..."
- "Dit oversized shirt balanceert je shoulders..."
```

**Current quiz:** ❌ Vraagt alleen "fit preference" (slim/relaxed)

**Fit ≠ Body Type:**
- Fit = HOE je graag draagt (loose/tight)
- Body Type = WELKE vorm je hebt (athletic/pear/rectangle)

**Impact:**
- Nova kan geen lichaamsvorm-specifieke adviezen geven
- Mist belangrijke fit guidance ("avoid skinny jeans for inverted triangle")

**Solution:** Voeg body type vraag toe

---

### 3. Sizes (MEDIUM PRIORITY) ❌ MISSING

**Why Nova needs it:**
```typescript
// Nova could say:
"Voor jouw maat M top raad ik aan..."
"Deze M shirt past je perfect"
```

**Current quiz:** ❌ Vraagt NIET naar maten

**Impact:**
- Nova kan niet filteren op beschikbare maten
- Kan niet waarschuwen: "Let op: dit merk valt klein"
- Geen size-specific product links

**Solution:** Vraag: tops (XS-XXL), broeken (28-38), schoenen (39-46)

---

### 4. Budget (MEDIUM PRIORITY) ❌ MISSING

**Why Nova needs it:**
```typescript
// Nova could filter:
"Gezien je budget €50-150 raad ik aan..."
"Deze items zijn binnen je budget"
```

**Current quiz:** ❌ Vraagt NIET naar budget

**Impact:**
- Nova kan dure items aanbevelen (€300 jas)
- Geen prijs-bewuste filtering
- Mist kans om "affordable" vs "premium" te targeten

**Solution:** Vraag budget range met sliders/presets

---

### 5. Preferred Brands (LOW PRIORITY) ❌ MISSING

**Why Nova needs it:**
```typescript
// Nova could say:
"Van je favoriete merk Nike raad ik aan..."
"Gezien je houdt van minimalist merken: COS, Uniqlo"
```

**Current quiz:** ❌ Vraagt NIET naar merken

**Impact:**
- Mist personalisatie kans
- Kan niet targeteren op merkvoorkeur
- Geen "avoid fast fashion" filtering

**Solution:** Optionele multi-select van populaire merken

---

### 6. Age Range (OPTIONAL) ⚠️ MISSING

**Why useful:**
```typescript
// Nova could adjust tone/style:
"Voor je leeftijd (25-35) past deze modern-classic mix..."
```

**Current quiz:** ❌ Vraagt NIET naar leeftijd

**Impact:**
- Mist context voor age-appropriate stijl
- Kan teenage vs executive vs retired niet onderscheiden

**Solution:** Optioneel, ranges (18-25, 25-35, 35-45, 45+)

---

## Current Quiz Data (What We HAVE)

### ✅ Good Data Points:

1. **Style Preferences:**
   - goals (werk/casual/avond/sport) ✅
   - fit preference (slim/relaxed) ✅
   - comfort level (structured/balanced/relaxed) ✅
   - occasions (office/smartcasual/leisure) ✅

2. **Color Profile:**
   - jewelry (goud/zilver) → undertone ✅
   - neutrals preference (warm/koel/neutraal) ✅
   - lightness (licht/medium/donker) ✅
   - contrast (laag/medium/hoog) ✅
   - prints (effen/subtiel/statement) ✅
   - materials (mat/textuur/glans) ✅

3. **Photo:**
   - photoDataUrl (optional) ✅
   - Triggers AI color analysis ✅

### ❌ Missing Critical Data:

1. **Gender** ❌
2. **Body Type** ❌
3. **Sizes** ❌
4. **Budget** ❌
5. **Brands** ❌
6. **Age** ⚠️

---

## Nova's Actual Context (from nova.ts)

```typescript
interface UserContext {
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say"; // ❌ NOT IN QUIZ
  archetype?: string;                                                // ✅ Computed
  bodyType?: string;                                                 // ❌ NOT IN QUIZ
  stylePreferences?: string[];                                       // ✅ From goals
  occasions?: string[];                                              // ✅ From occasions
  undertone?: "warm" | "cool" | "neutral";                           // ✅ From jewelry
  sizes?: { tops: string; bottoms: string; shoes: string };         // ❌ NOT IN QUIZ
  budget?: { min: number; max: number };                             // ❌ NOT IN QUIZ
  baseColors?: string;                                               // ✅ From neutrals
  preferredBrands?: string[];                                        // ❌ NOT IN QUIZ
  allQuizAnswers?: Record<string, any>;                              // ✅ Everything
  aiColorAnalysis?: AIColorAnalysis;                                 // ✅ From photo
}
```

**Score: 5/12 fields populated** (42%)

---

## Recommended Quiz Improvements

### Priority 1: CRITICAL (Add Immediately)

**1. Gender Selection (new first step)**
```typescript
{
  step: "gender",
  question: "Voor wie is deze stijlanalyse?",
  choices: [
    { value: "male", label: "Heren" },
    { value: "female", label: "Dames" },
    { value: "non-binary", label: "Non-binair" },
    { value: "prefer-not-to-say", label: "Zeg ik liever niet" }
  ]
}
```

**2. Body Type (after fit)**
```typescript
{
  step: "bodytype",
  question: "Welke lichaamsvorm past het beste bij jou?",
  help: "Dit helpt ons om kleding te adviseren die jouw vorm flatteert",
  choices: [
    // For male:
    { value: "rectangle", label: "Rechthoek", help: "Schouders en heupen ongeveer even breed" },
    { value: "triangle", label: "Driehoek", help: "Bredere heupen dan schouders" },
    { value: "inverted_triangle", label: "Omgekeerde driehoek", help: "Bredere schouders dan heupen" },
    { value: "oval", label: "Ovaal", help: "Gewicht rond middel" },

    // For female:
    { value: "hourglass", label: "Zandloper", help: "Schouders en heupen even breed, smalle taille" },
    { value: "pear", label: "Peer", help: "Bredere heupen dan schouders" },
    { value: "apple", label: "Appel", help: "Bredere schouders, gewicht rond middel" },
    { value: "rectangle", label: "Rechthoek", help: "Rechte lijnen, weinig taille" },
    { value: "inverted_triangle", label: "Omgekeerde driehoek", help: "Brede schouders" }
  ]
}
```

---

### Priority 2: HIGH VALUE (Add This Week)

**3. Sizes (after bodytype)**
```typescript
{
  step: "sizes",
  question: "Wat zijn je maten?",
  help: "Dit helpt ons om producten in jouw maat te vinden",
  fields: [
    {
      name: "size_tops",
      label: "Tops (T-shirts, shirts)",
      options: ["XS", "S", "M", "L", "XL", "XXL"]
    },
    {
      name: "size_bottoms",
      label: "Broeken (waist)",
      options: ["28", "30", "31", "32", "33", "34", "36", "38", "40"]
    },
    {
      name: "size_shoes",
      label: "Schoenen (EU)",
      options: ["39", "40", "41", "42", "43", "44", "45", "46"]
    }
  ]
}
```

**4. Budget (after sizes)**
```typescript
{
  step: "budget",
  question: "Wat is je budget per item?",
  help: "We filteren producten binnen jouw bereik",
  type: "range",
  options: [
    { value: { min: 0, max: 50 }, label: "Budget (€0-50)" },
    { value: { min: 50, max: 150 }, label: "Betaalbaar (€50-150)" },
    { value: { min: 150, max: 300 }, label: "Premium (€150-300)" },
    { value: { min: 300, max: 999 }, label: "Luxe (€300+)" }
  ]
}
```

---

### Priority 3: NICE TO HAVE (Add Later)

**5. Preferred Brands (optional, after budget)**
```typescript
{
  step: "brands",
  question: "Heb je favoriete merken? (optioneel)",
  help: "We geven dit mee aan Nova voor gepersonaliseerde aanbevelingen",
  multiple: true,
  searchable: true,
  choices: [
    { value: "nike", label: "Nike" },
    { value: "adidas", label: "Adidas" },
    { value: "uniqlo", label: "Uniqlo" },
    { value: "cos", label: "COS" },
    { value: "zara", label: "Zara" },
    { value: "hm", label: "H&M" },
    { value: "arket", label: "Arket" },
    { value: "weekday", label: "Weekday" },
    // ... meer merken
  ]
}
```

**6. Age Range (optional)**
```typescript
{
  step: "age",
  question: "In welke leeftijdscategorie val je? (optioneel)",
  help: "Dit helpt ons om age-appropriate stijl te adviseren",
  choices: [
    { value: "18-24", label: "18-24 jaar" },
    { value: "25-34", label: "25-34 jaar" },
    { value: "35-44", label: "35-44 jaar" },
    { value: "45-54", label: "45-54 jaar" },
    { value: "55+", label: "55+ jaar" },
    { value: "prefer-not-to-say", label: "Zeg ik liever niet" }
  ]
}
```

---

## Updated Quiz Flow

### Current Flow (11 steps):
```
intro → goals → fit → comfort → jewelry → neutrals →
lightness → contrast → prints → materials → occasions →
photo → review
```

### Recommended Flow (17 steps):
```
intro →
🆕 gender (CRITICAL) →
goals →
fit →
🆕 bodytype (CRITICAL) →
🆕 sizes (HIGH) →
🆕 budget (HIGH) →
comfort →
jewelry →
neutrals →
lightness →
contrast →
prints →
materials →
occasions →
🆕 brands (OPTIONAL) →
🆕 age (OPTIONAL) →
photo →
review
```

**Total: 17 steps (~10 min)**

---

## Implementation Checklist

### Phase 1: Critical (This Week)
- [ ] Add gender step (first question)
- [ ] Add bodytype step (after fit)
- [ ] Update AnswerMap type
- [ ] Update quiz logic to compute/store gender + bodytype
- [ ] Update userContext to send gender + bodytype headers
- [ ] Test Nova receives gender + bodytype

### Phase 2: High Value (Next Week)
- [ ] Add sizes step (tops/bottoms/shoes)
- [ ] Add budget step (ranges)
- [ ] Update data flow
- [ ] Test Nova uses size/budget in recommendations

### Phase 3: Nice to Have (Future)
- [ ] Add brands multi-select (optional)
- [ ] Add age range (optional)
- [ ] Progressive disclosure (skip if quick quiz wanted)

---

## Expected Nova Improvement

### Before (Current):
```
User: "Outfit voor date vrijdag"
Nova: "Wat voor stijl vind je mooi?"
      "Wat voor kleuren?"
      → Generic advice
```

### After (With Complete Quiz):
```
User: "Outfit voor date vrijdag"
Nova: "Voor jouw inverted triangle lichaam en autumn kleuren
       raad ik aan (binnen je €50-150 budget):

       🎨 Camel chino (€89, maat 32)
          Past bij je warme ondertoon!

       🎨 Olijfgroen overhemd (€45, maat M)
          Van Nike (je favoriete merk!)
          Autumn palette - flatteert je haar

       🎨 Cream sneakers (€120)
          Balanceert je bovenlijf perfect"
```

**Improvement:**
- ✅ Gender-appropriate products
- ✅ Body-type specific fit advice
- ✅ Correct sizes linked
- ✅ Budget-filtered
- ✅ Brand personalization
- ✅ AI color matched

---

## Data Flow After Implementation

```
Quiz Completion
  ↓
Saves to localStorage + Supabase:
  - gender ✅
  - bodyType ✅
  - sizes ✅
  - budget ✅
  - brands ✅
  - age ✅
  - ... existing data
  ↓
fetchUserContext() loads ALL data
  ↓
Sends via headers:
  x-fitfi-gender
  x-fitfi-bodytype
  x-fitfi-sizes
  x-fitfi-budget
  x-fitfi-brands
  x-fitfi-age
  x-fitfi-coloranalysis (from photo)
  x-fitfi-quiz (fallback with everything)
  ↓
Nova OpenAI prompt includes:
  "Gender: male
   Body type: inverted_triangle
   Sizes: M top, 32 waist, 42 shoes
   Budget: €50-150
   Brands: Nike, Adidas
   AI Analysis: autumn, warm undertone, best colors: olive/camel/rust"
  ↓
Nova gives PRECISE, PERSONALIZED advice! 🎯
```

---

## Summary

**Current State:** 🟡
- Quiz gives 42% of needed data
- Nova has to ask follow-up questions
- Generic recommendations

**After Implementation:** 🟢
- Quiz gives 100% of needed data
- Nova gives instant personalized advice
- Precise size/budget/brand/body-type matched recommendations

**Priority Order:**
1. Gender (ABSOLUTE MUST) ← Do first!
2. Body Type (HIGH VALUE) ← Do second!
3. Sizes (MEDIUM)
4. Budget (MEDIUM)
5. Brands (LOW)
6. Age (LOW)

**Estimated Implementation Time:**
- Phase 1 (gender + bodytype): 2-3 hours
- Phase 2 (sizes + budget): 2-3 hours
- Phase 3 (brands + age): 1-2 hours
- **Total: ~6-8 hours**

**Business Impact:**
- Better Nova recommendations = Higher conversion
- Less back-and-forth = Better UX
- Complete profiles = More personalization = Premium perception

---

**RECOMMENDATION: Start with Phase 1 (gender + bodytype) TODAY!** 🚀
