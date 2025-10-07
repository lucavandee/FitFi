# Nova Live Zetten - Snelstart

## 🚀 3 Stappen naar Live

### Stap 1: Netlify Environment Variables

In [Netlify Dashboard](https://app.netlify.com) → je site → **Settings** → **Environment variables**:

```
VITE_SUPABASE_URL = https://0ec90b57d6e95fcbda19832f.supabase.co

VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

### Stap 2: Deploy

```bash
git add .
git commit -m "feat: Nova production ready"
git push origin main
```

Netlify deploy start automatisch (2-3 min).

### Stap 3: Test

Open je live site → Nova chat → type "Stel een casual outfit samen"

**Verwacht:** 3-4 producten, geen "lokale modus" meer!

---

## ✅ Checklist

```
☐ Environment variables ingesteld in Netlify
☐ Code gepusht naar Git
☐ Deployment succeeded (check Netlify dashboard)
☐ Nova reageert op live site
☐ Producten worden getoond
```

---

## 🆘 Werkt niet?

**Nog steeds "lokale modus"?**
→ Environment variables missen → Ga terug naar Stap 1

**404 error op functions?**
→ Check of `netlify.toml` is gecommit → Push opnieuw

**Details:** Zie `DEPLOYMENT.md`
