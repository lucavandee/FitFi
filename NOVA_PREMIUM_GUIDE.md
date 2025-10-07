# Nova Premium Guide - Authentication, Rate Limiting & Rich Context

## Problems Solved

### 1. Cost Control - CRITICAL
**VOOR:** Iedereen kon Nova gebruiken (zelfs niet-ingelogd) → ongelimiteerde OpenAI kosten
**NA:** Auth-gate + rate limiting → gecontroleerde kosten per tier

### 2. Generic Advice - CRITICAL
**VOOR:** Generic "wit T-shirt + jeans" advies → amateuristisch
**NA:** Body-type aware + style-matched → premium, persoonlijk

### 3. Too Many Assumptions - CRITICAL
**VOOR:** Nova giste gender, fit, style → frustrerende fouten
**NA:** Gebruikt quiz data + vraagt wat ontbreekt → accuraat

---

## Solution Overview

### 1. Authentication & Rate Limiting

**Database:**
```sql
-- Add tier to profiles
ALTER TABLE profiles
ADD COLUMN tier text DEFAULT 'free'
CHECK (tier IN ('free', 'premium', 'founder'));

-- Create usage tracking
CREATE TABLE nova_usage (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  date date NOT NULL,
  message_count integer DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Functions
- can_use_nova(user_id)  → checks auth + quiz + rate limit
- increment_nova_usage(user_id) → tracks usage
```

**Rate Limits:**
- **Free:** 10 messages/day
- **Premium:** 100 messages/day
- **Founder:** Unlimited

**Checks:**
1. Is user authenticated?
2. Has completed style quiz?
3. Under daily rate limit?

**Backend (netlify/functions/nova.ts):**
```typescript
// Check authentication
const userId = event.headers["x-fitfi-uid"];
if (!userId || userId === "anon") {
  return 401: "Log in om Nova te gebruiken"
}

// Check access + rate limit
const { data } = await supabase.rpc('can_use_nova', { p_user_id: userId });
if (!data.can_use) {
  return 403: {
    error: "access_denied",
    message: data.reason,  // "Please complete quiz" or "Daily limit reached"
    tier: data.tier,
    usage: { current: data.current_count, limit: data.tier_limit }
  }
}

// Increment usage
await supabase.rpc('increment_nova_usage', { p_user_id: userId });
```

**Frontend:**
- NovaLoginPrompt component (already exists)
- Shows when 401/403 returned
- Directs to login or quiz

---

### 2. Rich Context (Body Type + Style Preferences)

**User Context Extended:**
```typescript
interface NovaUserContext {
  userId: string;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  bodyType: string;  // NEW! inverted_triangle, athletic, pear, hourglass, apple
  stylePreferences: string[];  // NEW! minimalist, classic, bohemian, etc.
  occasions: string[];  // NEW! work, casual, party, etc.
  archetype: string;
  colorProfile: { undertone, palette, ... };
  preferences: { budget, sizes, brands, ... };
}
```

**Data Flow:**
```
User completes quiz → quiz_answers.bodyType, stylePreferences saved
→ fetchUserContext() parses from DB
→ buildContextHeaders() adds x-fitfi-bodytype, x-fitfi-styleprefs
→ Netlify Function receives headers
→ parseUserContext() extracts values
→ OpenAI system prompt includes rich context
→ AI generates SPECIFIC, PERSONALIZED advice!
```

**OpenAI Prompt Enrichment:**
```typescript
CONTEXT OVER USER (GEBRUIK ALTIJD):
- Gender: male
- Lichaamsvorm: inverted_triangle
- Stijl archetype: casual_chic
- Stijl voorkeuren: minimalist, classic
- Gelegenheden: work, casual
- Huidsondertoon: warm
- Maten: L (tops), 32 (broeken), 43 (schoenen)
- Budget: €75-200 per item

KRITIEKE REGEL - LICHAAMSVORM:
✅ inverted_triangle bekend:
  → Vermijd: Te strakke tops, shoulder pads, horizontale strepen bovenlichaam
  → Raad aan: V-hals, verticale lijnen, statement broeken/rokken, donkere tops

KRITIEKE REGEL - STIJLVOORKEUR:
✅ minimalist + classic bekend:
  → Clean lines, neutrale kleuren, tijdloze stukken
  → Gestructureerd, timeless elegance

PAS ELKE AANBEVELING AAN!
```

**Result:**
- VOOR: "Wit T-shirt + jeans + sneakers" (generic)
- NA: "Donkerblauwe V-hals T-shirt (flatteert inverted triangle), tailored slim-fit chino (beige, past bij minimalist), witte leather sneakers (tijdloos)" (SPECIFIC!)

---

## Implementation

### Database Migration

```sql
-- File: supabase/migrations/*_add_nova_auth_and_rate_limiting.sql
-- Adds:
- profiles.tier (free/premium/founder)
- nova_usage table
- can_use_nova() function
- increment_nova_usage() function
- RLS policies
```

### Backend Changes

**File:** `netlify/functions/nova.ts`

1. **UserContext interface updated:**
   - Added: gender, bodyType, stylePreferences, occasions

2. **Authentication check:**
   ```typescript
   if (!userId || userId === "anon") return 401;
   const access = await supabase.rpc('can_use_nova', { p_user_id: userId });
   if (!access.can_use) return 403;
   ```

3. **Usage tracking:**
   ```typescript
   await supabase.rpc('increment_nova_usage', { p_user_id: userId });
   ```

4. **Rich context parsing:**
   ```typescript
   context.bodyType = headers["x-fitfi-bodytype"];
   context.stylePreferences = JSON.parse(headers["x-fitfi-styleprefs"]);
   context.occasions = JSON.parse(headers["x-fitfi-occasions"]);
   ```

5. **OpenAI prompt enrichment:**
   - Body type guidance (fit recommendations per type)
   - Style preference matching
   - Asks when context missing

6. **CORS updated:**
   ```
   x-fitfi-bodytype, x-fitfi-styleprefs, x-fitfi-occasions
   ```

### Frontend Changes

**File:** `src/services/nova/userContext.ts`

1. **NovaUserContext interface:**
   - Added bodyType, stylePreferences fields

2. **parseStyleProfile():**
   ```typescript
   bodyType: quizAnswers.bodyType,
   stylePreferences: quizAnswers.stylePreferences || [],
   ```

3. **buildContextHeaders():**
   ```typescript
   if (context.bodyType) headers["x-fitfi-bodytype"] = context.bodyType;
   if (context.stylePreferences) headers["x-fitfi-styleprefs"] = JSON.stringify(context.stylePreferences);
   if (context.occasions) headers["x-fitfi-occasions"] = JSON.stringify(context.occasions);
   ```

---

## Testing

### 1. Test Authentication Gate

**Scenario:** User not logged in
```
Expected: 401 response
Message: "Log in om Nova te gebruiken. Maak een gratis account aan!"
Action: Show NovaLoginPrompt
```

**Scenario:** User hasn't completed quiz
```
Expected: 403 response
Message: "Please complete the style quiz first."
Action: Redirect to /quiz
```

### 2. Test Rate Limiting

**Free User:**
```sql
-- Check current usage
SELECT message_count FROM nova_usage
WHERE user_id = 'your-id' AND date = CURRENT_DATE;

-- Expected: 0-10
-- After 10: 403 "Daily limit reached"
```

**Upgrade Flow:**
```sql
-- Set to premium
UPDATE profiles SET tier = 'premium' WHERE id = 'your-id';

-- Now limit = 100/day
```

**Founder:**
```sql
UPDATE profiles SET tier = 'founder' WHERE id = 'your-id';
-- Unlimited!
```

### 3. Test Rich Context

**Check Context Sent:**
Browser DevTools → Network → nova request → Request Headers:
```
x-fitfi-gender: male
x-fitfi-bodytype: inverted_triangle
x-fitfi-styleprefs: ["minimalist","classic"]
x-fitfi-occasions: ["work","casual"]
x-fitfi-archetype: casual_chic
x-fitfi-undertone: warm
```

**Check OpenAI Prompt:**
Netlify Function Logs should show:
```
CONTEXT OVER USER:
- Gender: male
- Lichaamsvorm: inverted_triangle
- Stijl voorkeuren: minimalist, classic
...

KRITIEKE REGEL - LICHAAMSVORM:
✅ inverted_triangle bekend:
  → Raad aan: V-hals, verticale lijnen...
```

**Test Response Quality:**
```
User: Ik wil een outfit voor een feestje

BEFORE (generic):
Nova: Wit T-shirt, jeans, sneakers

AFTER (personalized):
Nova: Voor jouw inverted triangle lichaamsvorm en minimalist stijl raad ik aan:
- Donkerblauwe V-hals longsleeve (flatteert schouders)
- Beige chino slim-fit (statement onderlichaam)
- Witte leren sneakers (tijdloos)
Past binnen €75-200 budget en je warme undertone!
```

---

## Rate Limit Management

### Check Usage

**SQL:**
```sql
SELECT
  p.tier,
  nu.date,
  nu.message_count,
  CASE
    WHEN p.tier = 'founder' THEN 999999
    WHEN p.tier = 'premium' THEN 100
    ELSE 10
  END as daily_limit
FROM nova_usage nu
JOIN profiles p ON p.id = nu.user_id
WHERE nu.user_id = 'your-user-id'
ORDER BY nu.date DESC
LIMIT 7;
```

### Reset Usage (Testing)

```sql
-- Reset today's count
UPDATE nova_usage
SET message_count = 0
WHERE user_id = 'your-id' AND date = CURRENT_DATE;

-- Delete usage history
DELETE FROM nova_usage WHERE user_id = 'your-id';
```

### Monitor Costs

**Query:**
```sql
-- Total messages today (all users)
SELECT
  SUM(message_count) as total_messages,
  COUNT(DISTINCT user_id) as active_users,
  AVG(message_count) as avg_per_user
FROM nova_usage
WHERE date = CURRENT_DATE;

-- Messages per tier
SELECT
  p.tier,
  COUNT(DISTINCT nu.user_id) as users,
  SUM(nu.message_count) as messages
FROM nova_usage nu
JOIN profiles p ON p.id = nu.user_id
WHERE nu.date = CURRENT_DATE
GROUP BY p.tier;
```

**Cost calculation:**
- Average: ~500 tokens per message
- Cost: ~€0.001 per message
- 100 users × 10 messages/day = €1/day = €30/month

---

## Upgrade Flow

### Frontend (NovaLoginPrompt)

Update benefits display:
```tsx
<div>Free members get 10 Nova chats per day</div>
<Button>Upgrade to Premium for 100/day</Button>
```

### Backend (Already Implemented)

When user upgrades:
```typescript
await supabase
  .from('profiles')
  .update({ tier: 'premium' })
  .eq('id', userId);

// Immediate effect - next Nova request:
// can_use_nova() returns limit: 100
```

---

## Body Type Recommendations

**Implemented in OpenAI Prompt:**

```
inverted_triangle → V-hals, verticale lijnen, statement broeken
athletic → Riem op taille, peplum, wrap-jurken, lagen
pear → Statement tops, bright colors boven, A-lijn onder
hourglass → Tailored fits, wrap-dresses, hoge taille
apple → Empire waist, A-lijn, verticale lijnen, V-hals
```

**How it works:**
1. User completes quiz → `quiz_answers.bodyType = "inverted_triangle"`
2. Nova fetches context → includes bodyType
3. OpenAI gets prompt with body-type guidance
4. Nova gives fit-specific advice: "V-hals flatteert je inverted triangle lichaamsvorm"

---

## Style Preferences

**Implemented:**

```
minimalist → Clean lines, neutrals, timeless, less is more
classic → Timeless elegance, structured, subtle accents
bohemian → Free, artistic, layers, prints, earthy
streetwear → Urban, sneakers, hoodies, oversized, logos
romantic → Soft fabrics, pastels, ruffles, florals
edgy → Leather, asymmetric, black, studs, rock
preppy → Polished, collared shirts, blazers, traditional
```

**How it works:**
1. User quiz → `stylePreferences: ["minimalist", "classic"]`
2. Nova context → includes stylePreferences
3. OpenAI prompt → match with their style
4. Advice: "Past bij je minimalist + classic stijl: clean lines, neutrale kleuren, tijdloze stukken"

---

## Files Changed

```
✅ supabase/migrations/*_nova_auth_rate_limiting.sql  - Auth + usage tracking
✅ netlify/functions/nova.ts                           - Backend validation + rich context
✅ src/services/nova/userContext.ts                    - Frontend context parsing
✅ src/components/auth/NovaLoginPrompt.tsx             - Login prompt (exists)
✅ NOVA_PREMIUM_GUIDE.md                               - This guide
```

---

## Success Criteria

**All implemented:**

✅ **Cost Control:**
- Non-auth users blocked
- Rate limits enforced (10/100/unlimited)
- Usage tracked per user per day

✅ **Personalized Advice:**
- Body type → fit recommendations
- Style preferences → matched aesthetics
- Occasions → context-appropriate
- Gender → accurate items

✅ **Quiz Required:**
- Users must complete quiz for Nova access
- Rich context from quiz data

✅ **Premium Experience:**
- No more generic "white T-shirt" advice
- Specific, personalized, body-aware recommendations
- Respects user identity + preferences

**This is premium AI.** 🎯

---

## Next Steps

### 1. Add Fit Preference Question to Quiz

```typescript
{
  id: "fit_preference",
  question: "Wat voor pasvorm draag je het liefst?",
  options: [
    { value: "slim", label: "Slim-fit (strak, gedefinieerd)" },
    { value: "regular", label: "Regular-fit (normaal, comfortabel)" },
    { value: "relaxed", label: "Relaxed-fit (ruim, casual)" },
    { value: "oversized", label: "Oversized (extra ruim, streetwear)" }
  ]
}
```

### 2. Monitor Costs

Set up alerts in OpenAI dashboard:
- Budget limit: €50/month
- Rate limit warnings
- Error rate threshold

### 3. Optimize Prompts

After collecting usage data:
- Reduce prompt tokens (currently ~2000)
- Cache common responses
- A/B test prompt variations

---

**Status:** Implementation complete! Deploy and monitor. 🚀
