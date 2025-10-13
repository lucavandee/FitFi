# AWIN Merchant Application Guide

## ✅ STATUS: Ready to Apply

**AWIN Account:** Active (Advertiser ID: 2061345)
**MasterTag:** Configured & Live
**Tracking:** Supabase + AWIN dual-logging

---

## 🎯 APPLICATION STRATEGY

### Priority Order (based on approval speed + product coverage)

1. **Zalando NL** → 3-5 days (easiest)
2. **ASOS NL** → 3-7 days
3. **H&M NL** → 5-10 days (slowest)

---

## 📋 ZALANDO NL (Priority 1)

### Why First?
- Largest NL fashion retailer (12 products curated)
- Fastest approval (3-5 days)
- High commission (5-10%)
- 30-day cookie window

### Application Steps

**1. Find Program**
- Login: https://ui.awin.com
- Go to: **Advertisers → Join Program**
- Search: "Zalando Netherlands"
- Program ID: **15486**

**2. Application Form**
- **Promotional Method:** Content/Review site
- **Website URL:** https://fitfi.ai
- **Description:**
```
FitFi is een AI-gestuurde stijlquiz die Nederlandse consumenten helpt
hun perfecte outfit te ontdekken. Wij tonen gepersonaliseerde
productaanbevelingen van Zalando, met focus op duurzame fashion keuzes.

✅ Target: NL, 25-40 jaar, fashion-conscious
✅ Traffic: 100-500 quiz completions/month (growing)
✅ Conversion: High intent (users actively seeking style advice)
✅ Content: Product reviews, outfit guides, style articles

Onze gebruikers hebben een hogere purchase intent dan gemiddeld
omdat ze actief op zoek zijn naar kleding die bij hen past.

Demo: https://fitfi.ai/onboarding
```

- **How will you promote?**
```
1. AI Style Quiz: Personalized product recommendations in quiz results
2. Outfit Builder: Curated looks featuring Zalando products
3. Style Guides: Editorial content with product links
4. Email Newsletter: Weekly style tips (building to 200+ subscribers)
```

- **Expected monthly sales:** €500-1000 (start small, realistic)
- **Traffic sources:** SEO, Social Media, Direct

**3. Submit & Wait**
- Timeline: 3-5 business days
- Check: **My Programs → Applications** for status

---

## 📋 ASOS NL (Priority 2)

### Why Second?
- Good commission (6-8%)
- 4 products already curated
- International reach

### Application Steps

**1. Find Program**
- Search: "ASOS Netherlands"
- Program ID: **2041**

**2. Application Form**
Same template as Zalando, replace:
```
Wij tonen gepersonaliseerde productaanbevelingen van ASOS,
met focus op trendy fashion keuzes voor een jong, style-bewust publiek.
```

**3. Timeline:** 3-7 days

---

## 📋 H&M NL (Priority 3)

### Why Last?
- Lower commission (4-6%)
- Slower approval (5-10 days)
- 4 products curated

### Application Steps

**1. Find Program**
- Search: "H&M Netherlands"
- Program ID: (search in AWIN)

**2. Application Form**
Same template, emphasize:
```
H&M past perfect bij onze affordable fashion categorie.
Onze gebruikers waarderen sustainable fashion tegen betaalbare prijzen.
```

**3. Timeline:** 5-10 days

---

## ⏳ WHAT HAPPENS AFTER APPROVAL?

### Day 0: Application Submitted
- Status: "Pending Review"
- Action: Wait (do NOT email merchant)

### Day 3-7: Approval Email
- Subject: "You have been approved to join [Merchant]"
- Login: AWIN dashboard
- Go to: **My Programs → Joined Programs**

### Day 8: Get Tracking Links

**Step 1: Find Deep Link Tool**
- AWIN dashboard
- Go to: **Tools → Advertiser Deep Link Tool**
- Select: Zalando (or approved merchant)

**Step 2: Generate Links**
For each product URL in your database:
```
Original: https://www.zalando.nl/product/abc
Tool Input: https://www.zalando.nl/product/abc
Tool Output: https://www.awin1.com/cread.php?awinmid=15486&awinaffid=2061345&clickref=ff_123&p=...
```

**Step 3: Update Product URLs**
Option A: Manual (Supabase SQL)
```sql
UPDATE products
SET affiliate_url = 'https://www.awin1.com/...'
WHERE merchant = 'zalando'
AND id = 'product_id';
```

Option B: Automated (we build script)
- Fetch all Zalando products
- Generate AWIN deep links via API
- Update `affiliate_url` column
- Log changes

---

## 🧪 TESTING AFTER APPROVAL

### Test 1: MasterTag Loading
```bash
# Dev environment
npm run dev
# Navigate to: /results
# Open DevTools → Network
# Filter: dwin1.com
# Expected: 200 OK response to dwin1.com/2061345.js
```

### Test 2: Click Tracking
```bash
# Click any product link
# Check Supabase: affiliate_clicks table
# Expected: New row with click_ref, outfit_id, product_url
```

### Test 3: AWIN Dashboard
```bash
# Login: https://ui.awin.com
# Go to: Reports → Activity
# Expected: Click recorded (may take 1-2 hours)
```

### Test 4: Conversion Tracking
```bash
# Complete a test purchase (use real card, return later)
# Wait: 24-48h for AWIN to process
# Check: Reports → Transactions
# Expected: Commission pending (€5-10)
```

---

## 📊 MONITORING COMMISSIONS

### Daily Check (First Week)
```
AWIN Dashboard → Reports → Transactions
Filter: Last 7 days
Expected:
- Day 1-3: 0 transactions (normal, need traffic)
- Day 4-7: 1-3 clicks (if traffic flows)
- Day 8-14: First conversion (if CTR > 5%)
```

### Weekly Check (After Month 1)
```
Supabase Query:
SELECT
  merchant_name,
  COUNT(*) as clicks,
  COUNT(DISTINCT user_id) as unique_users
FROM affiliate_clicks
WHERE clicked_at > NOW() - INTERVAL '7 days'
GROUP BY merchant_name;
```

### Red Flags
- **100+ clicks, 0 AWIN tracking:** MasterTag broken
- **50+ clicks, 0 conversions:** Merchant ID wrong or links broken
- **Conversions in AWIN, none in Supabase:** Database logging broken

---

## 🚨 COMMON REJECTION REASONS

### "Insufficient Traffic"
**Fix:** Wait 2-4 weeks, drive 500+ quiz completions, reapply

### "Unclear Business Model"
**Fix:** Rewrite description, emphasize:
- "AI-powered style recommendations"
- "Editorial content (blog, guides)"
- "High-intent audience (actively seeking fashion)"

### "Cookie Stuffing Risk"
**Fix:** Emphasize privacy-first:
- "Consent-gated (GDPR)"
- "Only loads on /results, /outfits"
- "No popups, no aggressive tactics"

### "Duplicate Publisher"
**Fix:** Check if you have another AWIN account (email conflict)

---

## 📈 EXPECTED TIMELINE

```
Day 0:   Apply to Zalando
Day 3:   Zalando approves
Day 3:   Apply to ASOS
Day 5:   Apply to H&M
Day 7:   ASOS approves
Day 10:  Configure tracking links
Day 11:  Test affiliate flow
Day 12:  Drive traffic (Google Ads / SEO)
Day 15:  First clicks appear in AWIN
Day 20:  First conversion (€5-10 commission)
Day 30:  3-5 conversions (€50-100 revenue)
```

---

## ✅ NEXT ACTIONS (DO NOW)

1. **Apply to Zalando** (15 min)
   - https://ui.awin.com → Join Program → Search "Zalando Netherlands"
   - Copy/paste application template
   - Submit

2. **Set reminder** (Day 5)
   - Check AWIN email for approval
   - Check **My Programs → Applications** status

3. **Apply to ASOS** (Day 3, after Zalando approved)
   - Same flow, different merchant

4. **Apply to H&M** (Day 5)
   - Same flow

5. **Notify me when approved**
   - I'll configure tracking links
   - We'll test affiliate flow
   - We'll monitor first conversions

---

## 📞 SUPPORT

**AWIN Help:**
- Support: https://wiki.awin.com
- Email: publishersupport@awin.com
- Phone: +31 20 808 5020 (NL)

**FitFi Help:**
- Ask me for tracking link setup
- Ask me for conversion testing
- Ask me for commission optimization

---

**STATUS:** Ready to apply. Start with Zalando now (15 min).
