# FitFi Development Modes

## 🚦 Twee Modi

### Mode 1: Netlify Dev (Full Stack)
```bash
npm run dev:netlify
```

**Wat draait:**
- Vite dev server (frontend)
- Netlify Functions (backend)
- Supabase verbinding actief

**URL:** `http://localhost:8888`

**Nova Status:**
- ✅ `/.netlify/functions/nova` beschikbaar
- ✅ Database queries werken
- ✅ 50 products beschikbaar
- ✅ Outfit generation met filtering

**Gebruik voor:**
- Testen van Nova AI
- Database integraties
- Volledige functionaliteit

---

### Mode 2: Vite Only (Frontend)
```bash
npm run dev
```

**Wat draait:**
- Alleen Vite dev server
- Geen Netlify Functions
- Geen database verbinding

**URL:** `http://localhost:5173`

**Nova Status:**
- ❌ `/.netlify/functions/nova` → 404
- ✅ Automatische fallback naar lokale mode
- ⚠️ Toont helper bericht: "Start dev:netlify voor volledige functionaliteit"

**Gebruik voor:**
- UI development
- Component styling
- Snelle iteraties zonder backend

---

## 🔧 Wat je Zag (404 Error)

**Je draaide:** Waarschijnlijk `npm run dev` (Vite only)

**Het probleem:**
```
.netlify/functions/nova:1  Failed to load resource: 404
```

Dit is **normaal** in Vite-only mode omdat de Netlify function niet draait.

**De oplossing:**
1. **Automatisch:** Nova detecteert 404 en schakelt naar fallback
2. **Console melding:** "Nova endpoint niet beschikbaar, gebruik lokale fallback"
3. **UI response:** Helper bericht in plaats van crash

---

## 💡 Welke Mode Kiezen?

**Start met Netlify Dev als:**
- Je Nova wilt testen
- Je database functionaliteit nodig hebt
- Je een realistische test wilt doen

**Start met Vite Only als:**
- Je alleen frontend aanpast
- Je snel wilt itereren
- Je geen backend nodig hebt

---

## 🧪 Test Checklist

### Netlify Dev Mode Check
```bash
npm run dev:netlify
# Wacht tot "Server now ready on http://localhost:8888"
# Open browser console
# Type in Nova: "Stel een casual outfit samen"
# Check console voor: "✅ Loaded 50 products from Supabase"
```

**Success:** Products verschijnen, verschillende items per query

---

### Vite Only Mode Check
```bash
npm run dev
# Open browser op http://localhost:5173
# Type in Nova: "Hoi"
# Check console voor: "Nova endpoint niet beschikbaar, gebruik lokale fallback"
```

**Success:** Helper bericht verschijnt, geen crash

---

## 📊 Feature Matrix

| Feature | Netlify Dev | Vite Only |
|---------|-------------|-----------|
| Frontend | ✅ | ✅ |
| Routing | ✅ | ✅ |
| Styling | ✅ | ✅ |
| Nova AI | ✅ | ⚠️ Fallback |
| Database | ✅ | ❌ |
| Outfits | ✅ (50 items) | ❌ (helper msg) |
| Functions | ✅ | ❌ |

---

## 🐛 Troubleshooting

### "Server already running on port 8888"
```bash
# Kill bestaande Netlify Dev
lsof -ti:8888 | xargs kill -9
npm run dev:netlify
```

### "Functions folder not found"
```bash
# Verify folder exists
ls -la netlify/functions/
# Should show: nova.ts, lib/, shop-redirect.ts
```

### "Supabase connection failed"
```bash
# Check env vars
cat .env | grep SUPABASE
# Should show: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

---

## 🚀 Recommended Workflow

**Day-to-day development:**
```bash
npm run dev               # Fast iteration
```

**Before committing:**
```bash
npm run dev:netlify       # Full integration test
npm run build             # Production build check
```

**Testing new features:**
```bash
npm run dev:netlify       # Ensure everything works end-to-end
```
