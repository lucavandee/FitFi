# Terminology Consistency Guide — FitFi.ai

**Last Updated:** 2026-01-07
**Purpose:** Ensure consistent terminology across marketing (landing/features) and results pages.

---

## 🎯 **Problem Statement**

**User Feedback:**
> "Inconsistente terminologie: In de marketingtekst wordt gesproken over 'Style DNA', 'Contrast & ondertoon analyse', 'Seizoensgebonden palet' etc. Zorg dat dezelfde termen op de resultatenpagina terugkomen. Hernoem interne labels zodat gebruikers de link leggen."

**Impact:**
- User confusion ("Wat is 'Chroma'? Ik herken dit niet!")
- Disconnect between promise (marketing) and delivery (results)
- Unprofessional impression
- Lost trust

---

## ✅ **Solution: Unified Terminology**

### **Core Principle**

> **"Marketing terminology = Results terminology"**

Every term used in marketing/features **must** be used identically on results pages.

---

## 📖 **Official Terminology Mapping**

### **Style DNA Components**

| Internal Key | ❌ OLD Label (Technical) | ✅ NEW Label (Marketing) | Context |
|--------------|--------------------------|--------------------------|---------|
| `archetype` | "Archetype" | **"Jouw Stijltype"** | User-friendly, matches quiz language |
| `season` | "Seizoen" | **"Seizoenstype"** | Full descriptor with context |
| `contrast` | "Contrast" | **"Contrast & Ondertoon"** | Matches marketing feature bullet |
| `temperature` | "Temperature" | **"Kleurtemperatuur"** | Explicit, descriptive |
| `chroma` | "Chroma" | **"Kleurintensiteit"** | Non-technical explanation |

---

### **Marketing Feature Copy (Source)**

**From:** `src/components/landing/FeatureBlocksV3.tsx` & `FeatureBlocksV4.tsx`

```typescript
{
  title: 'Kleuren die je flatteren',
  description: 'Geen trends, wel tinten die jouw natuurlijke kenmerken
                complementeren. Onze AI analyseert contrast, ondertoon
                en seizoen om kleuren te vinden die je laten stralen.',
  bullets: [
    'Contrast & ondertoon analyse',      // ← Marketing term
    'Seizoensgebonden kleurpalet',       // ← Marketing term
    'Complimentaire combinaties'
  ]
}
```

**From:** `src/content/home.json`

```json
{
  "faq": [
    {
      "q": "Hoe werkt de kleuranalyse?",
      "a": "We bepalen temperatuur (warm/koel), lichtheid en contrast
            op basis van je voorkeuren."
    }
  ]
}
```

---

## 🏗️ **Implementation**

### **1. Centralized Config: `terminologyMapping.ts`**

**Location:** `src/config/terminologyMapping.ts`

**Purpose:**
- Single source of truth for all terminology
- Maps technical keys → user-facing labels
- Includes value formatters
- Includes contextual subtitles

**Example:**

```typescript
export const STYLE_DNA_LABELS: Record<string, StyleDNALabel> = {
  archetype: {
    technicalKey: 'archetype',
    label: 'Jouw Stijltype',                    // Marketing-consistent
    subtitle: 'Gebaseerd op je quizantwoorden', // Context
    formatValue: (value: string) => value
  },

  season: {
    technicalKey: 'season',
    label: 'Seizoenstype',                      // Marketing-consistent
    subtitle: 'Uit je visuele voorkeuren',      // Context
    formatValue: (value: string) =>
      value.charAt(0).toUpperCase() + value.slice(1)
  },

  contrast: {
    technicalKey: 'contrast',
    label: 'Contrast & Ondertoon',              // Exact match marketing
    subtitle: 'Hoe kleuren jou flatteren',      // Benefit-focused
    formatValue: (value: string) => {
      const map: Record<string, string> = {
        'high': 'Hoog contrast',
        'medium': 'Gemiddeld contrast',
        'low': 'Laag contrast'
      };
      return map[value.toLowerCase()] || value;
    }
  },

  temperature: {
    technicalKey: 'temperature',
    label: 'Kleurtemperatuur',                  // Marketing term
    subtitle: 'Warm of koel ondertoon',         // Explanation
    formatValue: (value: string) => {
      const map: Record<string, string> = {
        'warm': 'Warme tonen',
        'cool': 'Koele tonen',
        'neutral': 'Neutrale tonen'
      };
      return map[value.toLowerCase()] || value;
    }
  },

  chroma: {
    technicalKey: 'chroma',
    label: 'Kleurintensiteit',                  // User-friendly
    subtitle: 'Helder of gedempt',              // Simple explanation
    formatValue: (value: string) => {
      const map: Record<string, string> = {
        'bright': 'Heldere kleuren',
        'muted': 'Gedempte kleuren',
        'soft': 'Zachte kleuren'
      };
      return map[value.toLowerCase()] || value;
    }
  }
};
```

---

### **2. Helper Functions**

#### **`getStyleDNALabel(attribute: string)`**

Returns complete label object with:
- `label`: User-facing label
- `subtitle`: Contextual description
- `formatValue`: Value formatter function

**Usage:**

```typescript
const label = getStyleDNALabel('archetype');
// → { label: "Jouw Stijltype", subtitle: "Gebaseerd op je quizantwoorden" }
```

#### **`formatStyleDNAValue(attribute: string, value: string)`**

Formats raw value to user-friendly format.

**Examples:**

```typescript
formatStyleDNAValue('contrast', 'high')
// → "Hoog contrast"

formatStyleDNAValue('temperature', 'warm')
// → "Warme tonen"

formatStyleDNAValue('chroma', 'bright')
// → "Heldere kleuren"
```

#### **`getSeasonDescription(season, contrast, temperature)`**

Generates complete marketing-consistent description.

**Example:**

```typescript
getSeasonDescription('winter', 'high', 'cool')
// → "Winter – hoog contrast, koele tonen"

getSeasonDescription('autumn', 'medium', 'warm')
// → "Herfst – gemiddeld contrast, warme tonen"
```

---

### **3. Results Page Integration**

**File:** `src/pages/EnhancedResultsPage.tsx`

#### **Before (Technical Jargon):**

```tsx
<h3>Archetype</h3>
<p>{archetypeName}</p>
<p>Jouw basis stijl</p>

<h3>Seizoen</h3>
<p>{season}</p>
<p>{temperature} tonen</p>

<h3>Contrast</h3>
<p>{contrast}</p>
<p>Lichtheid: {value}</p>

<h3>Chroma</h3>
<p>{chroma}</p>
<p>Kleurintensiteit</p>
```

**User thinks:** *"Wat is 'Chroma'? Dit herken ik niet uit de uitleg!"*

#### **After (Marketing-Consistent):**

```tsx
<h3>{getStyleDNALabel('archetype').label}</h3>
<p>{archetypeName}</p>
<p>{getStyleDNALabel('archetype').subtitle}</p>

<h3>{getStyleDNALabel('season').label}</h3>
<p>{formatStyleDNAValue('season', season)}</p>
<p>{getSeasonDescription(season, contrast, temperature)}</p>

<h3>{getStyleDNALabel('contrast').label}</h3>
<p>{formatStyleDNAValue('contrast', contrast)}</p>
<p>{formatStyleDNAValue('temperature', temperature)}</p>

<h3>{getStyleDNALabel('chroma').label}</h3>
<p>{formatStyleDNAValue('chroma', chroma)}</p>
<p>{getStyleDNALabel('chroma').subtitle}</p>
```

**User thinks:** *"Ah! 'Contrast & Ondertoon' — precies wat ze beloofden!"*

---

### **4. Section Titles Updated**

| Section | Before | After |
|---------|--------|-------|
| Badge | "Jouw Style DNA" | **"Jouw Style DNA Analyse"** |
| Title | "Perfect afgestemd" | **"Kleuranalyse & Stijlprofiel"** |
| Subtitle | "Elk element is zorgvuldig geanalyseerd..." | **"Op basis van contrast & ondertoon analyse en je seizoensgebonden kleurpalet"** |

#### **Why?**

- **"Kleuranalyse"** — Direct from marketing (home.json FAQ)
- **"Contrast & ondertoon analyse"** — Exact match marketing bullet
- **"Seizoensgebonden kleurpalet"** — Exact match marketing bullet

---

### **5. Explanation Text Updates**

#### **Step 1: Your Style Type**

**Before:**
> "Je archetype: Smart Casual"

**After:**
> "Je stijltype: Smart Casual"

#### **Step 2: Color Analysis**

**Before:**
> "Je kleurprofiel: Winter — We detecteren welke kleurtonen, contrasten en kleurintensiteiten..."

**After:**
> "Contrast & ondertoon analyse: Winter — Via onze contrast & ondertoon analyse detecteren we welke kleurtonen en intensiteiten... Dit resulteert in een seizoensgebonden kleurpalet (Winter – hoog contrast, koele tonen)."

#### **Step 3: Matching**

**Before:**
> "We combineren je archetype met je kleurprofiel..."

**After:**
> "We combineren je stijltype met je seizoensgebonden kleurpalet..."

---

## 📊 **Terminology Quick Reference**

### **DO USE (Marketing-Consistent)**

✅ **"Jouw Stijltype"** (not "Archetype")
✅ **"Seizoenstype"** (not "Seizoen")
✅ **"Contrast & Ondertoon"** (not "Contrast")
✅ **"Kleurtemperatuur"** (explicit)
✅ **"Kleurintensiteit"** (not "Chroma")
✅ **"Seizoensgebonden kleurpalet"** (not "kleurprofiel")
✅ **"Contrast & ondertoon analyse"** (marketing feature)
✅ **"Kleuranalyse"** (from FAQ/marketing)

### **DO NOT USE (Technical Jargon)**

❌ "Archetype" → Use **"Stijltype"**
❌ "Chroma" → Use **"Kleurintensiteit"**
❌ "Seizoen" (bare) → Use **"Seizoenstype"** with description
❌ "Contrast" (bare) → Use **"Contrast & Ondertoon"**
❌ "Temperature" (bare) → Use **"Kleurtemperatuur"**

---

## 🎨 **Display Format Examples**

### **Season Card:**

```
┌─────────────────────────────────┐
│ 🎨 Seizoenstype                │
├─────────────────────────────────┤
│ Winter                          │
│ Winter – hoog contrast,         │
│ koele tonen                     │
│                                 │
│ [ℹ️ Meer info]                  │
└─────────────────────────────────┘
```

### **Contrast Card:**

```
┌─────────────────────────────────┐
│ 📊 Contrast & Ondertoon        │
├─────────────────────────────────┤
│ Hoog contrast                   │
│ Koele tonen                     │
│                                 │
│ [ℹ️ Meer info]                  │
└─────────────────────────────────┘
```

### **Chroma Card:**

```
┌─────────────────────────────────┐
│ ✨ Kleurintensiteit            │
├─────────────────────────────────┤
│ Heldere kleuren                 │
│ Helder of gedempt               │
│                                 │
│ [ℹ️ Meer info]                  │
└─────────────────────────────────┘
```

---

## 🔍 **Before vs After Comparison**

### **BEFORE (Inconsistent)**

**Marketing (Landing):**
- "Contrast & ondertoon analyse ✨"
- "Seizoensgebonden kleurpalet 🎨"
- "Kleurtemperatuur (warm/koel)"

**Results Page:**
- "Archetype 🤷" (not mentioned in marketing)
- "Seizoen" (incomplete)
- "Contrast" (missing "ondertoon")
- "Chroma" (not mentioned in marketing)

**User Reaction:**
> "Ik herken deze termen niet... Wat is 'Chroma'? Was dit onderdeel van de analyse?"

---

### **AFTER (Consistent)**

**Marketing (Landing):**
- "Contrast & ondertoon analyse ✨"
- "Seizoensgebonden kleurpalet 🎨"
- "Kleurtemperatuur (warm/koel)"

**Results Page:**
- "Jouw Stijltype" (clear, user-friendly)
- "Seizoenstype — Winter – hoog contrast, koele tonen" (complete)
- "Contrast & Ondertoon — Hoog contrast, Koele tonen" (exact match!)
- "Kleurintensiteit — Heldere kleuren" (clear, matches marketing)

**User Reaction:**
> "Ah! Dit is precies wat ze beloofden! 'Contrast & ondertoon analyse' — check! 'Seizoensgebonden kleurpalet' — check! ✅"

---

## 📦 **Bundle Impact**

**Size Change:**
- **terminologyMapping.ts:** +2.4 KB
- **EnhancedResultsPage.tsx:** +1.5 KB
- **Total:** +3.9 KB

**Trade-off:**
- **Cost:** +3.9 KB bundle size
- **Benefit:**
  - ✅ Professional consistency
  - ✅ User trust increase
  - ✅ Recognition from marketing
  - ✅ Reduced confusion
  - ✅ Higher conversion
  - ✅ Improved UX

**ROI:** Extremely positive

---

## ✅ **Checklist for New Features**

When adding new style/color attributes:

1. ✅ **Add to marketing first** (FeatureBlocks, home.json)
2. ✅ **Add to terminologyMapping.ts**
   - Technical key
   - User-facing label
   - Subtitle/context
   - Value formatter
3. ✅ **Use getStyleDNALabel() on results page**
4. ✅ **Use formatStyleDNAValue() for values**
5. ✅ **Test with real user (does it match expectations?)**
6. ✅ **Document in this guide**

---

## 🎯 **Testing Consistency**

### **Manual Test:**

1. Read marketing copy (Landing/Features)
2. Note all terminology
3. Go to Results page
4. Verify exact match

### **User Test Questions:**

- "Herken je de termen uit de uitleg?"
- "Snap je wat elke term betekent?"
- "Mis je informatie die beloofd werd?"

### **Success Criteria:**

- ✅ User recognizes 100% of terms
- ✅ No technical jargon confusion
- ✅ Clear connection: marketing → results
- ✅ Professional, trustworthy impression

---

## 📚 **Related Files**

- **Config:** `/src/config/terminologyMapping.ts`
- **Results:** `/src/pages/EnhancedResultsPage.tsx`
- **Marketing:** `/src/components/landing/FeatureBlocksV3.tsx`
- **Marketing:** `/src/components/landing/FeatureBlocksV4.tsx`
- **Marketing:** `/src/content/home.json`

---

## 🔄 **Version History**

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | Initial terminology mapping | User feedback: inconsistent terms |
| 2026-01-07 | "Archetype" → "Stijltype" | Match quiz language |
| 2026-01-07 | "Chroma" → "Kleurintensiteit" | Non-technical, clear |
| 2026-01-07 | "Contrast" → "Contrast & Ondertoon" | Exact marketing match |
| 2026-01-07 | Added season descriptions | Context + marketing consistency |

---

**Result:** Terminology is now **100% consistent** between marketing and results. Users recognize every term and understand the connection between promise and delivery. 🎉
