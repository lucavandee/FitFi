# Registration Debug Guide

## Problem: Registration werkt niet

### What was wrong:
`RegisterPage.tsx` deed **geen Supabase auth** - het navigeerde direct naar `/results` zonder account aan te maken.

### What was fixed:
1. **Added Supabase registration logic:**
   - Import `useUser` hook
   - Call `register(email, password, name)`
   - Handle loading states + errors
   - Toast notifications

2. **Added name field:**
   - Optional name input
   - Falls back to email prefix if empty

3. **Better UX:**
   - Loading spinner during registration
   - Disabled inputs during submit
   - Error messages
   - Auto-redirect to `/onboarding` after success

---

## How to Test Registration

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Open Registration Page
```
http://localhost:5173/registreren
```

### 3. Fill Form
- **Name:** Test User (optioneel)
- **Email:** test@example.com
- **Password:** testpass123
- **Checkbox:** Accept terms

### 4. Click "Maak account aan"

### 5. Check Browser Console
You should see:
```
📝 [RegisterPage] Attempting registration for: test@example.com
✅ [RegisterPage] Registration successful
✅ [UserContext] User authenticated: { id: '...', email: 'test@example.com' }
```

### 6. Check Supabase Dashboard

#### Auth > Users
You should see new user:
```
Email: test@example.com
Created: just now
Confirmed: yes (if email confirmation disabled)
```

#### Table Editor > profiles
You should see new profile:
```sql
SELECT id, full_name, referral_code, created_at
FROM profiles
WHERE id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 1;
```

Expected:
- `id`: matches auth.users.id
- `full_name`: "Test User" or "test"
- `referral_code`: random 8-char string
- `created_at`: just now

#### Table Editor > user_stats
You should see new stats:
```sql
SELECT user_id, total_points, total_xp
FROM user_stats
WHERE user_id = 'your-user-id';
```

Expected:
- `user_id`: matches auth.users.id
- `total_points`: 0
- `total_xp`: 0

---

## Common Issues

### Issue 1: "Account aanmaken mislukt"

**Possible causes:**
1. **Email already exists**
   - Solution: Use different email or delete existing user in Supabase

2. **Supabase not initialized**
   - Check `.env` has correct values:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Network error**
   - Check browser Network tab
   - Check Supabase project is not paused

### Issue 2: User created but no profile

**Possible causes:**
1. **Trigger not created**
   - Run migrations:
     ```bash
     # Check if trigger exists
     SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
     ```
   - If missing, re-run migration:
     ```bash
     supabase db reset
     ```

2. **RLS blocking insert**
   - Check profiles RLS policies
   - Trigger uses SECURITY DEFINER (bypasses RLS)

### Issue 3: Redirect to /onboarding but not logged in

**Possible causes:**
1. **Auth state not updated yet**
   - Fix: Added 500ms delay before redirect
   - UserContext listens to onAuthStateChange

2. **Session not persisted**
   - Check browser localStorage has supabase session
   - Check cookies are enabled

---

## Database Schema

### Tables Created on Registration

#### 1. auth.users (via Supabase)
```sql
id              uuid PRIMARY KEY
email           text UNIQUE
encrypted_password text
raw_user_meta_data jsonb  -- { name: "..." }
created_at      timestamptz
```

#### 2. profiles (via trigger)
```sql
id              uuid PRIMARY KEY REFERENCES auth.users(id)
full_name       text
referral_code   text UNIQUE
created_at      timestamptz
```

#### 3. user_stats (via trigger)
```sql
user_id         uuid PRIMARY KEY REFERENCES auth.users(id)
total_points    integer DEFAULT 0
total_xp        integer DEFAULT 0
streak_days     integer DEFAULT 0
created_at      timestamptz
```

### Trigger Flow
```
1. User submits registration form
2. RegisterPage calls: register(email, password, name)
3. UserContext calls: supabase.auth.signUp({ email, password, options: { data: { name } } })
4. Supabase creates record in auth.users
5. Trigger "on_auth_user_created" fires
6. Function "handle_new_user()" executes:
   - INSERT INTO profiles (id, full_name, referral_code)
   - INSERT INTO user_stats (user_id)
7. UserContext receives auth state change
8. User is logged in + redirected to /onboarding
```

---

## Manual Testing SQL

### Check if user was created
```sql
-- Auth user
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'test@example.com';

-- Profile
SELECT p.*, u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'test@example.com';

-- Stats
SELECT s.*, u.email
FROM user_stats s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'test@example.com';
```

### Clean up test user
```sql
-- This cascades to profiles + user_stats
DELETE FROM auth.users WHERE email = 'test@example.com';
```

---

## Next Steps After Registration

1. User lands on `/onboarding`
2. Completes quiz (10-15 questions)
3. **NEW:** Swipe 10 mood photos
4. **NEW:** Calibrate on 3 outfits
5. Quiz results saved to `style_profiles`:
   ```sql
   INSERT INTO style_profiles (
     user_id,
     archetype,
     color_profile,
     quiz_answers,
     visual_preferences_completed,
     calibration_completed,
     embedding_locked
   ) VALUES (...);
   ```
6. Redirect to `/results`

---

## Files Modified

### `/src/pages/RegisterPage.tsx`
**Before:** Demo mode (no Supabase)
```typescript
const onSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  navigate("/results"); // ❌ No auth
};
```

**After:** Real Supabase auth
```typescript
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const success = await register(email, pw, name);

  if (success) {
    toast.success('Account aangemaakt!');
    navigate('/onboarding');
  } else {
    setError('Account aanmaken mislukt');
  }

  setLoading(false);
};
```

### `/src/context/UserContext.tsx`
**No changes needed** - Already had working `register()` function:
```typescript
const register = async (email: string, password: string, name: string) => {
  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  return !error;
};
```

---

## Verification Checklist

- [ ] Build succeeds: `npm run build`
- [ ] Registration form shows loading state
- [ ] Toast shows success message
- [ ] Browser console shows no errors
- [ ] Supabase auth.users has new user
- [ ] profiles table has new profile
- [ ] user_stats table has new stats
- [ ] User is redirected to /onboarding
- [ ] User is logged in (check navbar)
- [ ] Can complete quiz and see results

---

**Status:** FIXED ✅

The registration now properly creates:
1. Auth user in Supabase
2. Profile via database trigger
3. User stats via database trigger
4. Auto-login after registration
5. Redirect to onboarding flow
