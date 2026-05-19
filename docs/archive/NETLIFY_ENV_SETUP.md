# 🔧 Netlify Environment Variables - CRITICAL

## ❌ HUIDIGE FOUT:
```
{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

**Op:** fitfi.ai/admin/users

---

## 🎯 ROOT CAUSE:

De Supabase environment variables staan **NIET** in Netlify. Daarom kan de browser client geen connectie maken met de database.

**Wat er gebeurt:**
1. Je opent fitfi.ai/admin/users
2. Browser laadt JavaScript
3. JavaScript probeert `VITE_SUPABASE_ANON_KEY` te lezen
4. Variable bestaat niet in production build
5. Supabase client initialiseert niet
6. API call faalt met "No API key found"

---

## ✅ OPLOSSING (5 minuten):

### **Stap 1: Open Netlify Dashboard**

Link: https://app.netlify.com/sites/[your-site-name]/configuration/env

Of navigeer:
1. Login bij Netlify
2. Klik op je FitFi site
3. Klik "Site configuration" (linker sidebar)
4. Klik "Environment variables"

---

### **Stap 2: Add Required Variables**

Klik "Add a variable" → "Add a single variable"

**VERPLICHT (3 variables):**

```
Key: VITE_USE_SUPABASE
Value: true
Scopes: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
```

```
Key: VITE_SUPABASE_URL
Value: https://wojexzgjyhijuxzperhq.supabase.co
Scopes: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvamV4emdqeWhpanV4enBlcmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTM2NDAsImV4cCI6MjA2NjQyOTY0MH0.nLozOsn1drQPvRuSWRl_gLsh0_EvgtjidiUxpdUnhg0
Scopes: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
```

**OPTIONEEL (maar aanbevolen):**

```
Key: VITE_CANONICAL_HOST
Value: https://fitfi.ai
Scopes: ✅ Production, ✅ Deploy previews
```

```
Key: VITE_CONTACT_EMAIL
Value: hello@fitfi.ai
Scopes: ✅ Production, ✅ Deploy previews
```

```
Key: VITE_AWIN_ENABLED
Value: true
Scopes: ✅ Production, ✅ Deploy previews
```

```
Key: VITE_AWIN_MERCHANT_ID
Value: 2061345
Scopes: ✅ Production, ✅ Deploy previews
```

---

### **Stap 3: Trigger Deploy**

**BELANGRIJK:** Environment variables worden alleen toegepast bij **nieuwe builds**.

1. Ga naar: Netlify Dashboard → Deploys tab
2. Klik: "Trigger deploy" (top right)
3. Selecteer: "Clear cache and deploy site"
4. Klik: "Trigger deploy"
5. Wacht: ~2 minuten

---

### **Stap 4: Verify (2 min)**

Na deploy:

1. Open: https://fitfi.ai
2. Open browser console (F12)
3. Type: `import.meta.env.VITE_SUPABASE_URL`
4. Moet tonen: `"https://wojexzgjyhijuxzperhq.supabase.co"`

Als het `undefined` toont, dan zijn de env vars niet correct toegevoegd.

**Test admin page:**
1. Login met: luc@fitfi.ai
2. Ga naar: fitfi.ai/admin/users
3. Moet laden zonder "No API key" error

---

## 🔍 WAAROM DIT NODIG IS:

### **Local vs Production:**

**Local development:**
- Leest `.env` file in project root
- Vite laadt deze automatisch
- `VITE_*` variables beschikbaar

**Production (Netlify):**
- GEEN toegang tot `.env` file
- Environment variables komen van Netlify settings
- Moeten handmatig worden toegevoegd

### **Security:**

De `VITE_SUPABASE_ANON_KEY` is **PUBLIC** en mag in browser code.

- ✅ Safe to expose in client
- ✅ Row Level Security beschermt data
- ✅ Alleen gebruikt voor client auth

**NEVER add:**
- ❌ SUPABASE_SERVICE_ROLE_KEY (server only!)
- ❌ Database passwords
- ❌ Private API keys

---

## 📋 CHECKLIST:

- [ ] Netlify dashboard geopend
- [ ] 3 verplichte vars toegevoegd (VITE_USE_SUPABASE, URL, ANON_KEY)
- [ ] Alle vars hebben "Production" scope checked
- [ ] Deploy getriggerd met "Clear cache"
- [ ] Deploy succesvol (groen vinkje)
- [ ] Browser console test gedaan
- [ ] Admin page test gedaan

---

## ✅ RESULT:

Na deze stappen:

✅ fitfi.ai/admin/users werkt
✅ Database queries werken
✅ User authentication werkt
✅ Nova chat werkt
✅ Photo uploads werken

**De hele app is dan functioneel!**

---

## 🚨 TROUBLESHOOTING:

### **Variables niet zichtbaar na deploy:**

**Check:**
1. Heb je "Production" scope checked? (niet alleen "Deploy previews")
2. Heb je deploy getriggerd NA het toevoegen van vars?
3. Is de deploy succesvol? (geen rode errors)

**Fix:**
- Delete de variables
- Add ze opnieuw
- Check ALL scopes (Production, Deploy previews, Branch deploys)
- Trigger nieuwe deploy

### **Deploy faalt:**

**Check Netlify build log voor:**
- Syntax errors in code
- Missing dependencies
- TypeScript errors

**Common fix:**
```bash
npm run build
```
Als dit local faalt, fix errors eerst.

### **Nog steeds "No API key" error:**

**Debug in browser:**

1. Open: fitfi.ai
2. Console (F12)
3. Type:
```javascript
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  useSupabase: import.meta.env.VITE_USE_SUPABASE
});
```

**Expected output:**
```javascript
{
  url: "https://wojexzgjyhijuxzperhq.supabase.co",
  hasKey: true,
  useSupabase: "true"
}
```

**If undefined:** Vars niet correct toegevoegd.

---

## ⏱️ TIME: 5 Minutes

1. Add 3 vars (2 min)
2. Trigger deploy (1 min)
3. Wait for build (2 min)
4. Test (1 min)

**Total: 6 minutes to fix.**

---

## 🎯 NEXT STEPS:

After fixing this:

1. ✅ Admin dashboard will work
2. ✅ All database features will work
3. ✅ You can launch

Then:
- Monitor for errors
- Test with beta users
- Add Sentry Week 1
