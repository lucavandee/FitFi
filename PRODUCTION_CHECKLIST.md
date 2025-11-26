# FitFi.ai Production Deployment Checklist

## ✅ Pre-Launch Verification

### **Environment Variables**

#### **CRITICAL - Must Be Set**
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `OPENAI_API_KEY` - Set in Supabase Edge Functions (for Nova AI + photo analysis)

#### **Important - Should Be Set**
- [ ] `VITE_GTAG_ID` - Google Analytics 4 measurement ID (format: G-XXXXXXXXXX)
- [ ] `VITE_CONTACT_EMAIL` - Contact email shown on contact page
- [ ] `VITE_CANONICAL_HOST` - Production URL (e.g., https://fitfi.ai)

#### **Optional - Post-Launch**
- [ ] `VITE_VAPID_PUBLIC_KEY` - For PWA push notifications
- [ ] `VAPID_PRIVATE_KEY` - Server-side only (Netlify/Supabase env)
- [ ] `VITE_AWIN_ENABLED` - Set to 'true' to enable affiliate tracking
- [ ] `VITE_AWIN_MERCHANT_ID` - AWIN advertiser ID

---

## 🔒 Security Checklist

- [ ] No secrets committed to repository
- [ ] All `VITE_*` variables are safe for client-side
- [ ] Supabase RLS policies active on all tables
- [ ] Admin panel requires authentication
- [ ] CORS headers configured correctly on Edge Functions
- [ ] Storage buckets have proper access policies
- [ ] Environment variables set in Netlify/hosting dashboard

---

## 🗄️ Database Checklist

- [ ] All migrations applied successfully
- [ ] RLS policies tested with test users
- [ ] Admin user created (see `MAKE_ADMIN.sql`)
- [ ] Storage buckets created:
  - [ ] `mood-photos`
  - [ ] `user-photos`
  - [ ] `outfit-photos` (if needed)
- [ ] Products seeded (Bram's Fruit + Zalando feed)
- [ ] Stripe products configured (if using subscriptions)

### **Test Database Health**
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check admin user exists
SELECT email, raw_app_meta_data->>'role' as role
FROM auth.users
WHERE raw_app_meta_data->>'role' = 'admin';

-- Verify products exist
SELECT COUNT(*) FROM products WHERE is_active = true;
```

---

## 🚀 Edge Functions Checklist

### **Deploy All Functions**
- [ ] `upload-outfit-photo` - Photo upload with auth
- [ ] `analyze-outfit-photo` - OpenAI Vision analysis
- [ ] `create-checkout-session` - Stripe checkout (if using payments)
- [ ] `stripe-webhook` - Stripe webhook handler (if using payments)

### **Test Edge Functions**
```bash
# Test photo upload (requires auth token)
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/upload-outfit-photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"file": "data:image/jpeg;base64,/9j/4AAQ...", "filename": "test.jpg"}'

# Test health
curl https://YOUR_PROJECT.supabase.co/functions/v1/upload-outfit-photo \
  -H "apikey: YOUR_ANON_KEY"
```

---

## 🧪 Testing Checklist

### **E2E Tests**
- [ ] Run E2E test suite: `npm run test:e2e`
- [ ] All critical flows pass:
  - [ ] Homepage loads
  - [ ] Registration flow starts
  - [ ] Login page accessible
  - [ ] Pricing page loads
  - [ ] Protected routes redirect
  - [ ] Performance under 3s

### **Manual Tests**
- [ ] Create new account
- [ ] Complete onboarding quiz
- [ ] Upload photo for analysis (Nova)
- [ ] Generate outfit recommendations
- [ ] Save outfit to dashboard
- [ ] Test on mobile device
- [ ] Test in incognito (no cached auth)

---

## 📊 Analytics & Monitoring

- [ ] Google Analytics 4 configured and tracking
- [ ] Cookie consent banner working
- [ ] Test analytics events fire:
  - [ ] Page views
  - [ ] Quiz completion
  - [ ] Outfit generation
  - [ ] Photo upload

### **Optional - Sentry Setup**
- [ ] Sentry project created
- [ ] `VITE_SENTRY_DSN` set
- [ ] Error tracking tested
- [ ] Source maps uploaded

---

## 🎨 Content & Legal

- [ ] Privacy policy reviewed and current
- [ ] Terms of service reviewed
- [ ] Cookie policy complete
- [ ] Affiliate disclosure present (if using AWIN)
- [ ] Contact email working
- [ ] FAQ section complete
- [ ] About page content final

---

## ⚡ Performance Checklist

- [ ] Lighthouse score > 90 on all pages
- [ ] Images optimized (WebP where possible)
- [ ] Bundle size acceptable (check `npm run build` output)
- [ ] Lazy loading implemented
- [ ] Code splitting per route
- [ ] Service worker registered (PWA)

### **Build Verification**
```bash
# Clean build
rm -rf dist node_modules/.vite
npm run build

# Check bundle sizes
ls -lh dist/assets/*.js | sort -k5 -h

# Verify no errors
npm run typecheck
```

---

## 🌐 DNS & Hosting

- [ ] Domain configured (fitfi.ai)
- [ ] SSL certificate active
- [ ] Netlify deployment connected to repo
- [ ] Auto-deploy on main branch enabled
- [ ] Deploy preview on PRs enabled
- [ ] Custom domain redirects configured
- [ ] www → non-www redirect (or vice versa)

---

## 🔄 Post-Launch Monitoring

### **Day 1 Checks**
- [ ] Monitor error rates in logs
- [ ] Check Supabase database connections
- [ ] Verify Edge Functions are responding
- [ ] Monitor page load times
- [ ] Check analytics data flowing

### **Week 1 Checks**
- [ ] Review user feedback
- [ ] Check conversion funnel
- [ ] Monitor API quotas (OpenAI, Supabase)
- [ ] Review performance metrics
- [ ] Check for console errors in production

---

## 🚨 Rollback Plan

If critical issues occur:

1. **Immediate Actions**
   - [ ] Netlify: Rollback to previous deployment
   - [ ] Database: Have recent backup ready
   - [ ] Monitor: Check error logs

2. **Communication**
   - [ ] Status page update (if applicable)
   - [ ] User notification (if needed)
   - [ ] Team notification

3. **Recovery**
   - [ ] Identify root cause
   - [ ] Apply fix in staging
   - [ ] Test thoroughly
   - [ ] Re-deploy when stable

---

## ✅ Final Sign-Off

- [ ] All critical environment variables set
- [ ] E2E tests passing
- [ ] Manual smoke test completed
- [ ] Performance acceptable
- [ ] Security audit complete
- [ ] Legal pages reviewed
- [ ] Team trained on monitoring

**Signed off by:** _________________
**Date:** _________________
**Production URL:** https://fitfi.ai

---

## 📞 Emergency Contacts

- **Hosting**: Netlify Dashboard
- **Database**: Supabase Dashboard
- **Domain**: Domain registrar
- **Analytics**: Google Analytics 4
- **Team**: [Add contact info]
