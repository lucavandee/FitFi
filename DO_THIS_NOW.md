# 🚀 DO THIS NOW - 15 Minutes to Launch

**Status:** ✅ Admin user created | ✅ Edge Functions deployed | ⏳ 2 manual steps remaining

---

## ⚡ STEP 1: Add OpenAI Key (5 minutes)

### **Where:**
https://supabase.com/dashboard/project/wojexzgjyhijuxzperhq/functions

### **What to do:**

1. Click **"Edge Functions"** in left sidebar
2. Click **"Secrets"** tab at top
3. Click **"Add new secret"**
4. Add first secret:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-[your-openai-api-key]`
   - Click **"Save"**

5. Add second secret:
   - **Name:** `NOVA_UPSTREAM`
   - **Value:** `on`
   - Click **"Save"**

### **Get OpenAI Key:**
If you don't have one:
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: "FitFi Production"
4. Copy the key (starts with `sk-proj-`)
5. Paste into Supabase

### **Verify:**
You should see 2 new secrets in the list:
- ✅ OPENAI_API_KEY
- ✅ NOVA_UPSTREAM

---

## ⚡ STEP 2: Add Netlify Environment Variables (3 minutes)

### **Where:**
https://app.netlify.com/sites/[your-site]/configuration/env

### **What to do:**

1. Click **"Environment variables"** in left sidebar
2. Click **"Add a variable"** → **"Add a single variable"**

3. Add first variable:
   - **Key:** `VITE_CANONICAL_HOST`
   - **Value:** `https://fitfi.ai`
   - **Scopes:** Check "Production" and "Deploy previews"
   - Click **"Create variable"**

4. Add second variable:
   - **Key:** `VITE_CONTACT_EMAIL`
   - **Value:** `hello@fitfi.ai` (or your support email)
   - **Scopes:** Check "Production" and "Deploy previews"
   - Click **"Create variable"**

### **Verify:**
You should see these variables listed:
- ✅ VITE_CANONICAL_HOST
- ✅ VITE_CONTACT_EMAIL

Plus all existing variables still there:
- VITE_USE_SUPABASE
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- etc.

---

## ⚡ STEP 3: Trigger New Deploy (2 minutes)

### **Where:**
Same Netlify dashboard

### **What to do:**

1. Click **"Deploys"** in top navigation
2. Click **"Trigger deploy"** button (top right)
3. Select **"Clear cache and deploy site"**
4. Click **"Trigger deploy"**

### **Wait:**
Build will take ~2 minutes. Watch the logs.

### **Success looks like:**
```
✓ Building site
✓ Deploy succeeded
Published to: https://fitfi.ai
```

---

## ⚡ STEP 4: Test Live Site (5 minutes)

### **Homepage Test:**
1. Open: https://fitfi.ai
2. Should load in < 3 seconds
3. No console errors (press F12 → Console)

### **Registration Test:**
1. Go to: https://fitfi.ai/register
2. Register with: `test+launch@yourdomain.com`
3. Should redirect to /onboarding

### **Quiz Test:**
1. Complete first 3 quiz questions
2. Should save answers
3. Progress bar should update

### **Admin Test:**
1. Logout of test account
2. Login with: `luc@fitfi.ai`
3. Go to: https://fitfi.ai/admin
4. Should see admin dashboard

### **Nova Test (if you added OpenAI key):**
1. Login as any user
2. Go to Dashboard
3. Try uploading a photo
4. Nova should respond (not 500 error)

---

## ✅ DONE? LAUNCH COMPLETE!

**If all 4 steps pass:** 🎉 **YOU ARE LIVE!**

### **Next 2 Hours:**
- Monitor Netlify function logs for errors
- Check Supabase logs for issues
- Test yourself with real usage
- Share with 3-5 beta users

### **First Week Priorities:**
1. Install Sentry (error tracking)
2. Import more female products
3. Monitor error rates daily

---

## 🚨 TROUBLESHOOTING

### **Nova gives 500 errors:**
- Check: Did you add OPENAI_API_KEY to Supabase?
- Check: Is NOVA_UPSTREAM set to "on"?
- Check: Did you wait for Supabase to apply secrets? (takes 1 min)

### **Site shows old version:**
- Check: Did you trigger new deploy AFTER adding env vars?
- Try: Clear cache and deploy again
- Try: Hard refresh browser (Cmd+Shift+R / Ctrl+F5)

### **Admin page shows 403:**
- Check: Run this SQL in Supabase:
  ```sql
  SELECT email, raw_app_meta_data->>'role'
  FROM auth.users
  WHERE email = 'luc@fitfi.ai';
  ```
  Should show: `role: "admin"`

### **Can't login:**
- Check: Supabase project is running (not paused)
- Check: No red errors in Supabase Dashboard
- Check: Network tab shows 200 responses (not 500)

---

## 📊 WHAT I ALREADY DID FOR YOU

✅ **Admin User:** `luc@fitfi.ai` is now admin
✅ **Edge Functions:** All 23 functions deployed
✅ **Database:** All 131 migrations applied
✅ **Build:** Verified working (31s build time)
✅ **Documentation:** Complete audit + checklists created

---

## 💪 YOU GOT THIS

**15 minutes. 4 steps. Launch complete.**

Follow this doc top to bottom and you're live.

**Questions?** Check:
- LAUNCH_CHECKLIST.md (detailed guide)
- CEO_PRODUCTION_AUDIT.md (full audit)
- LAUNCH_SUMMARY.md (executive summary)

**Ready? GO! 🚀**
