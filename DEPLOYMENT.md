# FitFi Nova - Productie Deployment Guide

## 🚀 Nova Live Zetten op Netlify

### Stap 1: Netlify Project Aanmaken

**Als je nog geen Netlify project hebt:**

1. Ga naar [netlify.com](https://netlify.com)
2. Klik "Add new site" → "Import an existing project"
3. Verbind je Git repository (GitHub/GitLab/Bitbucket)
4. Selecteer je FitFi repository

**Build settings:**
```
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

Deze staan al correct in `netlify.toml` ✅

---

### Stap 2: Environment Variables Instellen

**In Netlify Dashboard:**

1. Ga naar: **Site Settings** → **Environment Variables**
2. Klik "Add a variable"

**Voeg deze 2 variabelen toe:**

```bash
VITE_SUPABASE_URL
Value: https://0ec90b57d6e95fcbda19832f.supabase.co

VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

**BELANGRIJK:**
- ✅ Deze keys zijn al in je lokale `.env` bestand
- ✅ Ze zijn safe om te gebruiken (anon key, geen secrets)
- ⚠️ Zorg dat ze **exact hetzelfde** zijn in Netlify

---

### Stap 3: Deploy Triggeren

**Optie A: Via Git Push**
```bash
git add .
git commit -m "feat: Nova live deployment met Supabase"
git push origin main
```

Netlify detecteert automatisch de push en start deployment.

**Optie B: Via Netlify Dashboard**
1. Ga naar "Deploys" tab
2. Klik "Trigger deploy" → "Deploy site"

---

### Stap 4: Verificatie

**Na deployment (±2-3 minuten):**

1. **Open je live site:** `https://jouw-site.netlify.app`

2. **Test Nova:**
   - Klik op Nova chat bubble (rechtsonder)
   - Type: "Stel een casual outfit samen"

3. **Check console (F12):**
   - Zoek naar: `✅ Loaded 50 products from Supabase`
   - Geen 404 errors meer!

4. **Verwacht resultaat:**
   - 3-4 product cards verschijnen
   - Verschillende items per query
   - Geen "lokale modus" bericht

---

## 🔍 Troubleshooting

### "Nova geeft nog steeds lokale modus melding"

**Check 1: Environment Variables**
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
# Moeten beide aanwezig zijn:
✓ VITE_SUPABASE_URL
✓ VITE_SUPABASE_ANON_KEY
```

**Fix:** Voeg toe en klik "Trigger deploy" opnieuw

---

### "Functions 404 error in productie"

**Check 2: Functions Directory**
```bash
# Moet in netlify.toml staan:
[build]
  functions = "netlify/functions"
```

**Fix:** Commit `netlify.toml` wijziging en push opnieuw

---

### "Supabase connection failed"

**Check 3: Database Status**
```bash
# Test lokaal eerst:
npm run dev:netlify

# Als lokaal werkt maar productie niet:
# → Environment variables zijn waarschijnlijk verkeerd
```

**Fix:** Dubbelcheck exact dezelfde keys in Netlify als in `.env`

---

### "Build succeeds maar Nova werkt niet"

**Check 4: Function Logs**
1. Ga naar Netlify Dashboard
2. **Functions** tab
3. Klik op `nova` function
4. Bekijk **Logs**

**Verwachte logs:**
```
✅ Loaded 50 products from Supabase
```

**Error logs betekenen:**
- `Supabase query error` → Verkeerde credentials
- `TypeError: Cannot read...` → Missing env vars
- `404` → Functions niet gedeployed

---

## 📊 Deployment Checklist

**Voor deployment:**
```bash
☐ npm run build          # Test lokaal build
☐ npm run dev:netlify    # Test met functions
☐ git status             # Check wat gecommit wordt
```

**In Netlify Dashboard:**
```bash
☐ Environment variables zijn ingesteld
☐ Functions directory = netlify/functions
☐ Build command = npm run build
☐ Publish directory = dist
```

**Na deployment:**
```bash
☐ Site is live en bereikbaar
☐ Nova chat bubble verschijnt
☐ Nova reageert op berichten
☐ Producten worden getoond (geen fallback)
☐ Console toont geen errors
```

---

## 🎯 Verwachte Productie Setup

**Frontend:**
```
https://jouw-site.netlify.app
  ↓
React app (Vite build)
  ↓
Nova Chat UI
```

**Backend:**
```
https://jouw-site.netlify.app/.netlify/functions/nova
  ↓
Netlify Function (Node.js)
  ↓
Supabase Client
  ↓
Database (50 products)
  ↓
Outfit Generation
  ↓
SSE Stream → Frontend
```

---

## 🔐 Security Checklist

**Safe om te committen:**
- ✅ `netlify.toml` (configuratie)
- ✅ `.env.example` (template)
- ✅ `VITE_*` env vars (frontend, public)

**NOOIT committen:**
- ❌ `.env` (bevat echte keys)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (backend only, super secret)
- ❌ API secrets, passwords

**Let op:**
- De `VITE_SUPABASE_ANON_KEY` is **public** en safe
- Deze is bedoeld voor client-side gebruik
- Row Level Security (RLS) in Supabase beschermt je data

---

## 📈 Monitoring

**Na live gaan:**

1. **Netlify Analytics** (optioneel, betaald)
   - Traffic monitoring
   - Function invocations
   - Performance metrics

2. **Browser Console**
   - Check voor JavaScript errors
   - Verify Supabase logs
   - Monitor SSE streaming

3. **Supabase Dashboard**
   - Query performance
   - Database usage
   - API rate limits

---

## 🚦 Status Indicators

**Development (lokaal):**
```
npm run dev           → Fallback mode (helper message)
npm run dev:netlify   → Full mode (50 products)
```

**Production (live):**
```
https://jouw-site.netlify.app → Full mode (50 products)
                               → Geen fallback meer!
```

---

## 🎉 Success!

**Als alles werkt zie je:**

1. **Nova chat** reageert snel (<2s response)
2. **Verschillende producten** bij elke query
3. **Budget filtering** werkt
4. **Style matching** op archetype
5. **Geen error messages** in console

**Test queries:**
```
"Stel een casual outfit samen"
  → Mix van tops, bottoms, shoes

"Luxury outfit voor speciaal event"
  → High-end items (Max Mara, Hermès)

"Casual outfit onder €100"
  → Budget items (H&M, Uniqlo)
```

---

## 📞 Support

**Deployment issues?**

1. Check deze guide opnieuw
2. Bekijk Netlify function logs
3. Test lokaal met `npm run dev:netlify` eerst
4. Verify environment variables exact match

**Database issues?**

1. Check Supabase Dashboard → SQL Editor
2. Run test query:
   ```sql
   SELECT COUNT(*) FROM products WHERE retailer = 'Zalando';
   ```
3. Should return: 50

---

## 🔄 Updates Deployen

**Nieuwe features toevoegen:**

```bash
# 1. Maak wijzigingen
# 2. Test lokaal
npm run dev:netlify

# 3. Build check
npm run build

# 4. Commit en push
git add .
git commit -m "feat: nieuwe feature"
git push origin main

# 5. Netlify deploy automatisch
# 6. Verify op live site
```

**Rollback bij problemen:**

1. Netlify Dashboard → Deploys
2. Zoek laatste werkende deploy
3. Klik "Publish deploy"
4. Site rolt terug naar vorige versie

---

## ✅ Deployment Complete!

**Je bent nu live met:**
- Nova AI Stylist
- 50 Zalando producten
- Real-time outfit generation
- Supabase backend
- Netlify Functions

**Geen lokale modus meer!** 🎉
