# ⚡ Quick Start - 15 Min Launch

## ✅ DONE BY AI:
- Admin user: `luc@fitfi.ai` ✅
- Edge Functions: 23 deployed ✅
- Database: 131 migrations ✅
- Build: Works (43s) ✅

## ⏳ YOU DO (15 min):

### 1. Supabase Secrets (5 min)
```
https://supabase.com/dashboard/project/wojexzgjyhijuxzperhq/functions
→ Secrets tab → Add:
  OPENAI_API_KEY = sk-proj-xxx
  NOVA_UPSTREAM = on
```

### 2. Netlify Env Vars (3 min)
```
Netlify → Environment variables → Add:
  VITE_CANONICAL_HOST = https://fitfi.ai
  VITE_CONTACT_EMAIL = hello@fitfi.ai
```

### 3. Deploy (2 min)
```
Netlify → Deploys → Trigger deploy → Clear cache
```

### 4. Test (5 min)
```
✓ Homepage loads
✓ Register works
✓ Quiz works
✓ Admin page works (luc@fitfi.ai)
✓ Nova responds (if OpenAI key added)
```

## 🎉 DONE = LIVE!

**Full guide:** `DO_THIS_NOW.md`
**Troubleshooting:** `LAUNCH_CHECKLIST.md`
