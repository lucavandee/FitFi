# Environment Variables Setup Guide

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in required values
3. Set the same values in your hosting provider (Netlify/Vercel)
4. Set Edge Function secrets in Supabase dashboard

---

## Required Variables (CRITICAL)

### **Supabase Connection**

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "Settings" → "API"
4. Copy "Project URL" → `VITE_SUPABASE_URL`
5. Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

---

### **OpenAI API (for Nova AI)**

```bash
OPENAI_API_KEY=sk-proj-xxx...
```

**Where to get:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Click "API keys" in left sidebar
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-`)

**Where to set:**
- **Supabase Edge Functions**: Dashboard → Edge Functions → Settings → Secrets
- Add secret: `OPENAI_API_KEY` = `sk-proj-xxx...`

**⚠️ IMPORTANT:**
- Do NOT add `VITE_` prefix (this is server-side only)
- Never commit this to git
- Set directly in Supabase dashboard

---

## Important Variables (Recommended)

### **Google Analytics 4**

```bash
VITE_GTAG_ID=G-XXXXXXXXXX
```

**Where to get:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Admin → Data Streams
3. Select your web stream
4. Copy "Measurement ID" (format: G-XXXXXXXXXX)

**What it does:**
- Tracks page views
- Tracks user events (quiz completion, outfit generation)
- Only loads if user accepts analytics cookies

---

### **Contact Email**

```bash
VITE_CONTACT_EMAIL=hello@fitfi.ai
```

**What it does:**
- Displayed on /contact page
- Used in footer
- Used in legal pages

---

### **Canonical Host**

```bash
VITE_CANONICAL_HOST=https://fitfi.ai
```

**What it does:**
- Used for SEO canonical URLs
- Used in social share cards
- Used in sitemap generation

---

## Optional Variables

### **PWA Push Notifications**

```bash
VITE_VAPID_PUBLIC_KEY=BNxxx...
VAPID_PRIVATE_KEY=xxx...
```

**How to generate:**
```bash
npx web-push generate-vapid-keys
```

**Where to set:**
- Public key: Add to `.env` with `VITE_` prefix (client-side)
- Private key: Add to Netlify/Supabase env vars WITHOUT `VITE_` prefix (server-side only)

**What it does:**
- Enables browser push notifications
- Used in service worker
- Requires HTTPS

---

### **Affiliate Tracking (AWIN)**

```bash
VITE_AWIN_ENABLED=true
VITE_AWIN_MERCHANT_ID=2061345
```

**Where to get:**
1. Go to [AWIN Dashboard](https://ui.awin.com/)
2. Settings → Account Details
3. Copy "Advertiser ID"

**What it does:**
- Tracks affiliate clicks on product links
- Only loads on /results, /outfits, /dashboard
- Requires user consent (marketing cookies)
- Privacy-first implementation

---

## Hosting Provider Setup

### **Netlify**

1. Go to Site Settings → Environment Variables
2. Add each variable:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Scopes: ✅ Builds ✅ Functions
3. Repeat for all `VITE_*` variables

**Important:**
- Variables starting with `VITE_` are exposed to client
- They will be bundled into your JavaScript
- Never put secrets in `VITE_*` variables

---

### **Vercel**

1. Go to Settings → Environment Variables
2. Add each variable for all environments:
   - Production
   - Preview
   - Development

---

## Supabase Edge Functions Secrets

**Set in Supabase Dashboard:**

1. Go to Edge Functions → Settings → Secrets
2. Add these secrets:

```bash
OPENAI_API_KEY=sk-proj-xxx...
```

**Predefined secrets (automatically available):**
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (full access)

---

## Environment-Specific Configuration

### **Development (.env.local)**

```bash
# Use test/staging Supabase project
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Use test OpenAI key with lower rate limits
OPENAI_API_KEY=sk-proj-test-xxx...

# Disable analytics in development
# VITE_GTAG_ID= (leave empty)

# Enable debug logging
VITE_ENABLE_LOGS=true
```

---

### **Production (.env.production)**

```bash
# Production Supabase project
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Production OpenAI key
OPENAI_API_KEY=sk-proj-prod-xxx...

# Production analytics
VITE_GTAG_ID=G-XXXXXXXXXX

# Disable debug logging
VITE_ENABLE_LOGS=false

# Production domain
VITE_CANONICAL_HOST=https://fitfi.ai
```

---

## Security Best Practices

### ✅ DO:
- Use `VITE_` prefix for client-safe variables
- Set secrets directly in hosting provider dashboard
- Use different keys for staging and production
- Rotate API keys regularly
- Add `.env` to `.gitignore`

### ❌ DON'T:
- Commit `.env` files to git
- Put secrets in `VITE_*` variables
- Share API keys in Slack/email
- Use production keys in development
- Store keys in source code

---

## Testing Your Setup

### **1. Check Supabase Connection**

```bash
npm run dev
```

Open browser console:
```javascript
// Should log connection status
localStorage.getItem('fitfi-supabase-connection')
```

---

### **2. Test OpenAI API (Edge Function)**

```bash
# Replace with your values
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/analyze-outfit-photo \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"photoBase64": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

Should return JSON with analysis results.

---

### **3. Verify Environment Variables in Build**

```bash
npm run build
```

Check `dist/assets/index-*.js` - should NOT contain:
- `OPENAI_API_KEY`
- Database passwords
- Any secrets

Should contain (this is OK):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GTAG_ID`

---

## Troubleshooting

### **"Supabase client not available"**

**Problem:** Missing Supabase env vars
**Solution:** Check `.env` has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

### **"OPENAI_API_KEY not configured"**

**Problem:** Edge Function can't find OpenAI key
**Solution:**
1. Go to Supabase Dashboard → Edge Functions → Settings → Secrets
2. Add `OPENAI_API_KEY` (without VITE_ prefix)
3. Redeploy Edge Function

---

### **Analytics not tracking**

**Problem:** Missing or incorrect GA4 ID
**Solution:**
1. Verify `VITE_GTAG_ID` format: `G-XXXXXXXXXX`
2. Check user accepted analytics cookies
3. Open browser console, check for gtag errors

---

### **Build fails with "env variable undefined"**

**Problem:** Variable not set in hosting provider
**Solution:**
1. Check Netlify/Vercel environment variables
2. Ensure variable name matches exactly (case-sensitive)
3. Redeploy after adding variables

---

## Need Help?

- **Supabase Issues**: [Supabase Docs](https://supabase.com/docs)
- **OpenAI Issues**: [OpenAI Platform Docs](https://platform.openai.com/docs)
- **Netlify Issues**: [Netlify Docs](https://docs.netlify.com/)

---

**Last Updated:** 2025-11-26
