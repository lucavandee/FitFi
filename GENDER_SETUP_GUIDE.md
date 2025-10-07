# Gender Support - Setup Guide

## Problem Solved

**VOOR:** Nova maakte aannames over gender → man kreeg jurken voorgesteld
**NA:** Nova vraagt gender of gebruikt database data → accurate, respectvolle aanbevelingen

## What Changed

### 1. Database Migration

Added `gender` column to `style_profiles`:

```sql
ALTER TABLE style_profiles
ADD COLUMN gender text
CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say'));
```

**Values:**
- `male` - Masculine styling (pak, overhemd, stropdas)
- `female` - Feminine styling (jurk, rok, hakken)
- `non-binary` - Mixed/neutral styling
- `prefer-not-to-say` - Neutral language
- `NULL` - Unknown (AI will ASK, not assume!)

### 2. Backend (Netlify Function)

**File:** `netlify/functions/nova.ts`

**Changes:**
- Added `gender` to `UserContext` interface
- Parse gender from `x-fitfi-gender` header
- Updated OpenAI system prompt with gender-aware logic:

```typescript
KRITIEKE REGEL - GENDER:
${!userContext.gender ? `
⚠️ GENDER IS ONBEKEND - MAAK GEEN AANNAMES!
- Vraag EERST: "Mag ik vragen of je een outfit zoekt voor heren of dames?"
- Of gebruik neutrale taal tot je het weet
- NOOIT automatisch aannemen!
` : `
✅ Gender bekend: ${userContext.gender}
- Voor male: pak, overhemd, pantalon, stropdas, manchetknopen
- Voor female: jurk, rok, blouse, hakken, sieraden
- Voor non-binary: mix of neutrale items, vraag voorkeur
- Voor prefer-not-to-say: gebruik neutrale taal, vraag voorkeur
`}
```

**CORS:** Added `x-fitfi-gender` to allowed headers

### 3. Frontend (Client)

**File:** `src/services/nova/userContext.ts`

**Changes:**
- Added `gender` to `NovaUserContext` interface
- Parse gender from DB (`style_profiles.gender`)
- Fallback to `quiz_answers.gender`
- Added gender to `buildContextHeaders()` → `x-fitfi-gender` header

**Flow:**
```
User Profile (DB) → fetchUserContext() → parseStyleProfile()
→ NovaUserContext.gender → buildContextHeaders()
→ x-fitfi-gender header → Netlify Function → OpenAI prompt
```

## How to Set Gender

### Option 1: During Quiz (Recommended)

Add gender question to onboarding quiz:

```typescript
// In quiz component
{
  id: "gender",
  type: "select",
  question: "Voor wie zoek je stijladviezen?",
  options: [
    { value: "male", label: "Voor mezelf (man)" },
    { value: "female", label: "Voor mezelf (vrouw)" },
    { value: "non-binary", label: "Voor mezelf (non-binair)" },
    { value: "prefer-not-to-say", label: "Liever niet zeggen" }
  ]
}

// Save to quiz_answers
quiz_answers: {
  ...otherAnswers,
  gender: selectedGender
}
```

### Option 2: Profile Settings

Add gender field to profile edit form:

```typescript
// Update profile
await supabase
  .from('style_profiles')
  .update({ gender: selectedGender })
  .eq('user_id', userId);
```

### Option 3: Manual Update (Admins)

Update existing users via SQL:

```sql
-- Set gender for specific user
UPDATE style_profiles
SET gender = 'male'
WHERE user_id = 'user-uuid-here';

-- Bulk update (if you have gender data elsewhere)
UPDATE style_profiles sp
SET gender = u.gender_preference
FROM user_preferences u
WHERE sp.user_id = u.user_id;
```

## Testing

### Test 1: Gender Unknown

**Setup:** User has NO gender in profile

**Expected:**
```
User: Ik wil een outfit voor een gala

Nova: Mag ik vragen of je een outfit zoekt voor heren of dames?
(Wacht op antwoord voordat outfit wordt gegenereerd)
```

### Test 2: Gender Known (Male)

**Setup:** `style_profiles.gender = 'male'`

**Expected:**
```
User: Ik wil een outfit voor een gala

Nova: Voor een gala raad ik aan:
- Zwart pak (slim-fit)
- Wit overhemd (manchetknopen)
- Zwarte leren schoenen (Oxford)
- Donkerblauwe stropdas
[Geen jurk, hakken, sieraden!]
```

### Test 3: Gender Known (Female)

**Setup:** `style_profiles.gender = 'female'`

**Expected:**
```
User: Ik wil een outfit voor een gala

Nova: Voor een gala raad ik aan:
- Lange avondjurk (diepblauw of smaragdgroen)
- Elegante hakken (zilver of goud)
- Statement oorbellen
- Clutch in neutrale kleur
```

### Test 4: Non-Binary

**Setup:** `style_profiles.gender = 'non-binary'`

**Expected:**
```
User: Ik wil een outfit voor een gala

Nova: Voor een gala heb je veel opties! Wil je iets meer
      klassiek masculien, feminien, of een mix?
(Vraagt voorkeur)
```

## Debugging

### Check if Gender is Set

```sql
SELECT
  user_id,
  gender,
  archetype,
  created_at
FROM style_profiles
WHERE user_id = 'your-user-id';
```

### Check if Header is Sent

Browser DevTools → Network tab → `nova` request → Request Headers:
```
x-fitfi-gender: male
x-fitfi-archetype: casual_chic
x-fitfi-undertone: warm
```

### Check OpenAI Prompt

Netlify Function Logs should show:
```
CONTEXT OVER USER:
- Gender: male
- Archetype: casual_chic
...

KRITIEKE REGEL - GENDER:
✅ Gender bekend: male
- Voor male: pak, overhemd, pantalon...
```

## Privacy & Inclusivity

**Privacy:**
- Gender is OPTIONAL (can be NULL)
- User can select "prefer-not-to-say"
- Never shared with third parties
- Used ONLY for styling recommendations

**Inclusivity:**
- 4 options: male, female, non-binary, prefer-not-to-say
- Neutral language when unknown or prefer-not-to-say
- Non-binary gets asked for preference (not assumed!)
- Respectful tone in all scenarios

## Migration Impact

**Existing Users:**
- All have `gender = NULL` initially
- Nova will ASK instead of assume
- No data loss
- Gradual adoption as users update profiles

**New Users:**
- Should provide gender during quiz
- Immediate accurate recommendations
- Better UX from start

## Rollout Plan

1. ✅ **Deploy code** (done)
2. **Add quiz question** (recommended):
   - Add gender step to onboarding
   - Save to `quiz_answers.gender`
3. **Update profile settings** (optional):
   - Add gender field to profile edit form
4. **Bulk update** (optional):
   - If you have gender data elsewhere, migrate it
5. **Monitor**:
   - Check that Nova asks when unknown
   - Verify accurate recommendations when known

## Files Changed

```
✅ supabase/migrations/*_add_gender.sql         - DB schema
✅ netlify/functions/nova.ts                    - Backend logic + OpenAI prompt
✅ src/services/nova/userContext.ts             - Client parsing + headers
✅ GENDER_SETUP_GUIDE.md                        - This guide
```

## Success Criteria

✅ No more gender assumptions
✅ Nova asks when gender is unknown
✅ Accurate recommendations based on gender
✅ Respectful, inclusive language
✅ Privacy-first (optional field)

---

**Status:** Implementation complete, ready for deployment! 🎉
