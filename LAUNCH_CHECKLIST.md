# 🚀 FitFi Launch Checklist - 60 Minutes

## ✅ COMPLETED BY AI:
- [x] Admin user created: luc@fitfi.ai
- [x] Edge Functions verified: 23 active
- [x] Database migrations: 131 applied
- [x] Build verified: 43s success

## ⏳ MANUAL STEPS (15 min):

### Step 1: Add OpenAI Key (5 min)
Location: https://supabase.com/dashboard/project/wojexzgjyhijuxzperhq/functions

1. Click "Edge Functions" → "Secrets"
2. Add OPENAI_API_KEY = sk-proj-xxx
3. Add NOVA_UPSTREAM = on

### Step 2: Add Netlify Env Vars (3 min)
Location: Netlify Dashboard → Environment Variables

1. Add VITE_CANONICAL_HOST = https://fitfi.ai
2. Add VITE_CONTACT_EMAIL = hello@fitfi.ai

### Step 3: Trigger Deploy (2 min)
1. Netlify → Deploys → Trigger deploy
2. Select "Clear cache and deploy"
3. Wait ~2 min

### Step 4: Test (5 min)
- [ ] Homepage loads
- [ ] Register works
- [ ] Quiz completes
- [ ] Admin page accessible (luc@fitfi.ai)
- [ ] Nova responds

## 🎉 LAUNCH COMPLETE

Monitor first 2 hours:
- Netlify function logs
- Supabase database logs
- User feedback

See DO_THIS_NOW.md for detailed instructions.
